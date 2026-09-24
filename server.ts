import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  getWeddingSettings,
  updateWeddingSettings,
  getUserProfile,
  updateUserPlan,
  getUserWeddings,
  createWedding,
  deleteWedding,
  getAllGuests,
  getGuestByCode,
  createGuest,
  createGuestsBulk,
  updateGuest,
  deleteGuest,
  submitRsvp,
  submitOpenRsvp,
  getGalleryPhotos,
  addGalleryPhoto,
  likePhoto,
  deleteGalleryPhoto,
  getPhotoComments,
  getAllPhotoCommentsForWedding,
  addPhotoComment,
  deletePhotoComment,
  getDrivePhotoLikesCount,
  likeDrivePhoto,
  getDrivePhotoComments,
  addDrivePhotoComment,
  getAllVideos,
  addWeddingVideo,
  deleteWeddingVideo,
  getWishes,
  addWish,
  getOrCreateUser,
  registerOrUpdateUser,
  verifyDatabaseUserCredentials,
  seedInitialData,
  getCeoGlobalStats,
  getAllUsersForCeo,
  getAllWeddingsForCeo,
  updateUserRoleByCeo,
  updateUserPlanByCeo,
  updateUserByCeo,
  createUserByCeo,
  bulkImportUsersByCeo,
  bulkUpdateUsersByCeo,
  deleteUserByCeo,
  getCustomPlans,
  updateCustomPlan,
  transferWeddingOwnership,
  deleteWeddingByCeo,
  updateWeddingStatus,
} from './src/db/queries.ts';
import { pool } from './src/db/index.ts';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { generateWeddingOgImage } from './src/lib/ogImageGenerator.ts';
import { formatHeroDate } from './src/lib/dateFormatters.ts';
import { getEventPresentation } from './src/lib/eventUtils.ts';
import { parseDriveFolderUrl } from './src/lib/driveFolder.ts';

// Setup uploads volume storage directory (compatible with Docker volumes and local env)
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const AUDIO_MIME_TYPES: Record<string, string> = {
  '.aac': 'audio/aac',
  '.aif': 'audio/aiff',
  '.aiff': 'audio/aiff',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.mp3': 'audio/mpeg',
  '.mp4': 'audio/mp4',
  '.oga': 'audio/ogg',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/ogg; codecs=opus',
  '.wav': 'audio/wav',
  '.wave': 'audio/wav',
  '.webm': 'audio/webm',
  '.weba': 'audio/webm',
};

// Multer storage for audio, images, and guest photo uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.dat';
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max for audio / high-res photos
  },
});

const escapeHtml = (value: unknown): string => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Serve persistent uploads directory
  app.use('/uploads', express.static(uploadsDir));

  // Run seed data check lazily
  seedInitialData().catch((err) => {
    console.error('Seed error:', err);
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ----------------------------------------------------
  // ENVIRONMENT CREDENTIALS FOR FIXED PROFILES
  // ----------------------------------------------------
  const CEO_EMAIL = (process.env.CEO_EMAIL || process.env.ADMIN_EMAIL || 'daviex14@gmail.com').toLowerCase().trim();
  const CEO_PASSWORD = process.env.CEO_PASSWORD || process.env.ADMIN_PASSWORD || '';
  const CEO_NAME = process.env.CEO_NAME || 'Daviex (CEO Master)';

  const PLANNER_EMAIL = (process.env.PLANNER_EMAIL || 'planner@atelier.com').toLowerCase().trim();
  const PLANNER_PASSWORD = process.env.PLANNER_PASSWORD || '';
  const PLANNER_NAME = process.env.PLANNER_NAME || 'Valeria Mendoza';
  const PLANNER_AGENCY = process.env.PLANNER_AGENCY || 'Valeria Events Atelier';

  const COUPLE_EMAIL = (process.env.COUPLE_EMAIL || 'novios@weddingatelier.com').toLowerCase().trim();
  const COUPLE_PASSWORD = process.env.COUPLE_PASSWORD || '';
  const COUPLE_NAME = process.env.COUPLE_NAME || 'Sofía & Alejandro';

  // ----------------------------------------------------
  // AUTHENTICATION API ENDPOINTS
  // ----------------------------------------------------
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Por favor ingresa tu correo y contraseña.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = String(password).trim();

      // 1. Check Master CEO profile
      if (cleanEmail === CEO_EMAIL && cleanPass === CEO_PASSWORD) {
        const user = await registerOrUpdateUser({
          uid: 'ceo-daviex-master',
          email: CEO_EMAIL,
          name: CEO_NAME,
          role: 'ceo',
          plan: 'ceo_unlimited',
        });
        return res.json({
          success: true,
          user: {
            uid: user.uid || 'ceo-daviex-master',
            email: CEO_EMAIL,
            name: user.name || CEO_NAME,
            role: 'ceo',
            plan: 'ceo_unlimited',
          },
        });
      }

      // 2. Check Wedding Planner profile
      if (cleanEmail === PLANNER_EMAIL && cleanPass === PLANNER_PASSWORD) {
        const user = await registerOrUpdateUser({
          uid: 'wp-valeria-01',
          email: PLANNER_EMAIL,
          name: PLANNER_NAME,
          role: 'wedding_planner',
          plan: 'planner_pro',
          agencyName: PLANNER_AGENCY,
        });
        return res.json({
          success: true,
          user: {
            uid: user.uid || 'wp-valeria-01',
            email: PLANNER_EMAIL,
            name: user.name || PLANNER_NAME,
            role: 'wedding_planner',
            plan: 'planner_pro',
            agencyName: user.agencyName || PLANNER_AGENCY,
          },
        });
      }

      // 3. Check Couple profile
      if (cleanEmail === COUPLE_EMAIL && cleanPass === COUPLE_PASSWORD) {
        const user = await registerOrUpdateUser({
          uid: 'demo-user-master',
          email: COUPLE_EMAIL,
          name: COUPLE_NAME,
          role: 'couple',
          plan: 'atelier',
        });
        return res.json({
          success: true,
          user: {
            uid: user.uid || 'demo-user-master',
            email: COUPLE_EMAIL,
            name: user.name || COUPLE_NAME,
            role: 'couple',
            plan: 'atelier',
          },
        });
      }

      // 4. Check Database / registered users
      const dbUser = await verifyDatabaseUserCredentials(cleanEmail, cleanPass);
      if (dbUser) {
        return res.json({
          success: true,
          user: {
            uid: dbUser.uid,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role || 'couple',
            plan: dbUser.plan || 'atelier',
            agencyName: dbUser.agencyName || undefined,
          },
        });
      }

      return res.status(401).json({
        error: 'Credenciales inválidas. Verifica tu correo y contraseña.',
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Error en el servidor al autenticar.' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, role, plan, agencyName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos para el registro.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = String(password).trim();
      const cleanName = (name || 'Novia/Novio').trim();

      const isCeo = cleanEmail === CEO_EMAIL;
      const determinedRole = isCeo ? 'ceo' : (role || (plan?.startsWith('planner_') ? 'wedding_planner' : 'couple'));
      const determinedPlan = isCeo ? 'ceo_unlimited' : (plan || 'atelier');
      const generatedUid = isCeo
        ? 'ceo-daviex-master'
        : ('usr-' + Buffer.from(cleanEmail).toString('base64').substring(0, 12).toLowerCase().replace(/[^a-z0-9]/g, 'x'));

      const user = await registerOrUpdateUser({
        uid: generatedUid,
        email: cleanEmail,
        password: cleanPass,
        name: cleanName,
        role: determinedRole,
        plan: determinedPlan,
        agencyName: agencyName || undefined,
      });

      return res.json({
        success: true,
        user: {
          uid: user.uid || generatedUid,
          email: cleanEmail,
          name: user.name || cleanName,
          role: user.role || determinedRole,
          plan: user.plan || determinedPlan,
          agencyName: user.agencyName || agencyName || undefined,
        },
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(500).json({ error: error.message || 'Error al registrar usuario.' });
    }
  });

  // 0. User Profile & Multi-tenant Workspace endpoints
  app.get('/api/user/profile', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid || (typeof req.query.uid === 'string' ? req.query.uid : 'demo-user-master');
      const email = req.user?.email || (typeof req.query.email === 'string' ? req.query.email : 'demo@weddingatelier.com');
      const name = req.user?.name || (typeof req.query.name === 'string' ? req.query.name : 'Organizador Atelier');

      let user = await getUserProfile(uid);
      if (!user) {
        user = await getOrCreateUser(uid, email, name);
      }
      res.json(user);
    } catch (error: any) {
      console.error('Failed to get user profile:', error);
      res.status(500).json({ error: error.message || 'Error fetching user profile' });
    }
  });

  app.post('/api/user/plan', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid || req.body.uid || 'demo-user-master';
      const plan = req.body.plan;
      const validPlans = ['free', 'atelier', 'elite', 'planner_starter', 'planner_pro', 'ceo_unlimited'];
      if (!validPlans.includes(plan)) {
        return res.status(400).json({ error: 'Plan inválido' });
      }

      const updated = await updateUserPlan(uid, plan);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error('Failed to update plan:', error);
      res.status(500).json({ error: error.message || 'Error updating plan' });
    }
  });

  // ----------------------------------------------------
  // CEO & SUPERADMIN MASTER API ENDPOINTS (GOD MODE)
  // ----------------------------------------------------
  app.get('/api/admin/ceo/stats', async (_req, res) => {
    try {
      const stats = await getCeoGlobalStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Failed to get CEO stats:', error);
      res.status(500).json({ error: error.message || 'Error fetching CEO stats' });
    }
  });

  app.get('/api/admin/ceo/users', async (_req, res) => {
    try {
      const userList = await getAllUsersForCeo();
      res.json(userList);
    } catch (error: any) {
      console.error('Failed to get all users for CEO:', error);
      res.status(500).json({ error: error.message || 'Error fetching users' });
    }
  });

  app.get('/api/admin/ceo/all-weddings', async (_req, res) => {
    try {
      const allWeddings = await getAllWeddingsForCeo();
      res.json(allWeddings);
    } catch (error: any) {
      console.error('Failed to get all weddings for CEO:', error);
      res.status(500).json({ error: error.message || 'Error fetching all weddings' });
    }
  });

  app.post('/api/admin/ceo/users/:uid/role', async (req, res) => {
    try {
      const { uid } = req.params;
      const { role } = req.body;
      if (!['ceo', 'wedding_planner', 'couple', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Rol no válido' });
      }
      const updated = await updateUserRoleByCeo(uid, role);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error('Failed to update user role by CEO:', error);
      res.status(500).json({ error: error.message || 'Error updating user role' });
    }
  });

  app.post('/api/admin/ceo/users/:uid/plan', async (req, res) => {
    try {
      const { uid } = req.params;
      const { plan } = req.body;
      const validPlans = ['free', 'atelier', 'elite', 'planner_starter', 'planner_pro', 'ceo_unlimited'];
      if (!validPlans.includes(plan)) {
        return res.status(400).json({ error: 'Plan no válido' });
      }
      const updated = await updateUserPlanByCeo(uid, plan);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error('Failed to update user plan by CEO:', error);
      res.status(500).json({ error: error.message || 'Error updating user plan' });
    }
  });

  app.post('/api/admin/ceo/users/update', async (req, res) => {
    try {
      const { uid, ...data } = req.body;
      if (!uid) {
        return res.status(400).json({ error: 'UID de usuario es requerido' });
      }
      const updated = await updateUserByCeo(uid, data);
      res.json({ success: true, user: updated });
    } catch (error: any) {
      console.error('Failed to update user by CEO:', error);
      res.status(500).json({ error: error.message || 'Error actualizando usuario' });
    }
  });

  app.post('/api/admin/ceo/users/create', async (req, res) => {
    try {
      const { name, email, password, role, plan, agencyName, phone } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Correo electrónico válido es requerido' });
      }
      const created = await createUserByCeo({ name, email, password, role, plan, agencyName, phone });
      res.status(201).json({ success: true, user: created });
    } catch (error: any) {
      console.error('Failed to create user by CEO:', error);
      res.status(500).json({ error: error.message || 'Error creando usuario' });
    }
  });

  app.post('/api/admin/ceo/users/bulk-import', async (req, res) => {
    try {
      const { users: userList, defaultPlan, defaultRole } = req.body;
      if (!Array.isArray(userList) || userList.length === 0) {
        return res.status(400).json({ error: 'Lista de usuarios a importar requerida' });
      }
      const result = await bulkImportUsersByCeo(userList, { defaultPlan, defaultRole });
      res.status(201).json({ success: true, ...result });
    } catch (error: any) {
      console.error('Failed to bulk import users by CEO:', error);
      res.status(500).json({ error: error.message || 'Error en importación masiva de usuarios' });
    }
  });

  app.post('/api/admin/ceo/users/bulk-update', async (req, res) => {
    try {
      const { uids, action, value } = req.body;
      if (!Array.isArray(uids) || uids.length === 0 || !action) {
        return res.status(400).json({ error: 'Parámetros uids y action son requeridos' });
      }
      const result = await bulkUpdateUsersByCeo(uids, action, value);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Failed to bulk update users by CEO:', error);
      res.status(500).json({ error: error.message || 'Error en actualización masiva de usuarios' });
    }
  });

  app.delete('/api/admin/ceo/users/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const result = await deleteUserByCeo(uid);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to delete user by CEO:', error);
      res.status(500).json({ error: error.message || 'Error eliminando usuario' });
    }
  });

  // Plans & Pricing API
  app.get('/api/plans', async (_req, res) => {
    try {
      const plans = await getCustomPlans();
      res.json(plans);
    } catch (error: any) {
      console.error('Failed to get plans:', error);
      res.status(500).json({ error: error.message || 'Error fetching plans' });
    }
  });

  app.post('/api/admin/ceo/plans/update', async (req, res) => {
    try {
      const { planId, updates } = req.body;
      if (!planId || !updates) {
        return res.status(400).json({ error: 'planId y updates son requeridos' });
      }
      const updated = await updateCustomPlan(planId, updates);
      res.json({ success: true, plan: updated });
    } catch (error: any) {
      console.error('Failed to update custom plan by CEO:', error);
      res.status(500).json({ error: error.message || 'Error updating plan' });
    }
  });

  app.post('/api/admin/ceo/weddings/transfer', async (req, res) => {
    try {
      const { weddingId, newOwnerUid } = req.body;
      if (!weddingId || !newOwnerUid) {
        return res.status(400).json({ error: 'weddingId y newOwnerUid son requeridos' });
      }
      const updated = await transferWeddingOwnership(Number(weddingId), newOwnerUid);
      res.json({ success: true, wedding: updated });
    } catch (error: any) {
      console.error('Failed to transfer wedding ownership:', error);
      res.status(500).json({ error: error.message || 'Error transferring wedding' });
    }
  });

  app.delete('/api/admin/ceo/weddings/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await deleteWeddingByCeo(id);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to delete wedding by CEO:', error);
      res.status(500).json({ error: error.message || 'Error deleting wedding' });
    }
  });

  app.post('/api/wedding/status', async (req, res) => {
    try {
      const { weddingId, status, clientEmail } = req.body;
      if (!weddingId || !status) {
        return res.status(400).json({ error: 'weddingId y status son requeridos' });
      }
      const updated = await updateWeddingStatus(Number(weddingId), status, clientEmail);
      res.json({ success: true, wedding: updated });
    } catch (error: any) {
      console.error('Failed to update wedding status:', error);
      res.status(500).json({ error: error.message || 'Error updating wedding status' });
    }
  });

  app.get('/api/user/weddings', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid || (typeof req.query.uid === 'string' ? req.query.uid : 'demo-user-master');
      const list = await getUserWeddings(uid);
      res.json(list);
    } catch (error: any) {
      console.error('Failed to get user weddings:', error);
      res.status(500).json({ error: error.message || 'Error fetching weddings' });
    }
  });

  app.post('/api/user/weddings', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid || req.body.ownerUid || 'demo-user-master';
      const { coupleNames, eventDate, eventTime, cardStyle, ceremonyVenue, receptionVenue, eventType } = req.body;

      if (!coupleNames || !eventDate) {
        return res.status(400).json({ error: 'Nombres y fecha del evento son requeridos' });
      }

      const newWedding = await createWedding({
        ownerUid: uid,
        coupleNames,
        eventDate,
        eventTime: eventTime || '17:00',
        cardStyle: cardStyle || 'classic-gold',
        ceremonyVenue: ceremonyVenue || 'Lugar de la Ceremonia',
        receptionVenue: receptionVenue || 'Lugar del Banquete / Recepción',
        eventType: eventType || 'bodas',
        isPublished: true,
      });

      res.status(201).json(newWedding);
    } catch (error: any) {
      console.error('Failed to create wedding:', error);
      res.status(500).json({ error: error.message || 'Error creating wedding' });
    }
  });

  app.delete('/api/user/weddings/:id', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const uid = req.user?.uid;
      const result = await deleteWedding(id, uid);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to delete wedding:', error);
      res.status(500).json({ error: error.message || 'Error deleting wedding' });
    }
  });

  // 1. Wedding settings endpoints
  app.get('/api/wedding-config', async (req, res) => {
    try {
      const identifier = req.query.weddingId ? Number(req.query.weddingId) : (typeof req.query.slug === 'string' ? req.query.slug : undefined);
      const config = await getWeddingSettings(identifier);
      if (identifier && !config) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
      res.json(config);
    } catch (error: any) {
      console.error('Failed to get wedding config:', error);
      res.status(500).json({ error: error.message || 'Error fetching config' });
    }
  });

  app.post('/api/wedding-config', async (req, res) => {
    try {
      const weddingId = req.body.id || (req.query.weddingId ? Number(req.query.weddingId) : undefined);
      const updated = await updateWeddingSettings(req.body, weddingId);
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to update wedding config:', error);
      res.status(500).json({ error: error.message || 'Error updating config' });
    }
  });

  // 2. Guests management & statistics
  app.get('/api/guests', async (req, res) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : 1;
      const guestList = await getAllGuests(search, status, weddingId);

      // Compute statistics across all guests of this wedding
      const allWeddingGuests = await getAllGuests(undefined, undefined, weddingId);
      const totalGuests = allWeddingGuests.length;
      const totalAllocatedPasses = allWeddingGuests.reduce((acc, g) => acc + (Number(g.allocatedPasses) || 0), 0);
      const confirmedGuests = allWeddingGuests.filter((g) => g.status === 'confirmed');
      const totalConfirmedPasses = confirmedGuests.reduce((acc, g) => acc + (Number(g.confirmedPasses) || 0), 0);
      const declinedGuests = allWeddingGuests.filter((g) => g.status === 'declined').length;
      const pendingGuests = allWeddingGuests.filter((g) => g.status !== 'confirmed' && g.status !== 'declined').length;

      res.json({
        guests: guestList,
        stats: {
          totalGuests,
          totalAllocatedPasses,
          totalConfirmedPasses,
          declinedGuests,
          pendingGuests,
          confirmedCount: confirmedGuests.length,
        },
      });
    } catch (error: any) {
      console.error('Failed to get guests:', error);
      res.status(500).json({ error: error.message || 'Error fetching guests' });
    }
  });

  app.post('/api/guests', async (req, res) => {
    try {
      const created = await createGuest(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Failed to create guest:', error);
      res.status(500).json({ error: error.message || 'Error creating guest' });
    }
  });

  app.post('/api/guests/bulk', async (req, res) => {
    try {
      const { guests: guestList } = req.body;
      if (!Array.isArray(guestList) || guestList.length === 0) {
        return res.status(400).json({ error: 'La lista de invitados es requerida y debe ser un arreglo.' });
      }
      const created = await createGuestsBulk(guestList);
      res.status(201).json({ success: true, count: created.length, guests: created });
    } catch (error: any) {
      console.error('Failed to bulk create guests:', error);
      res.status(500).json({ error: error.message || 'Error importando invitados' });
    }
  });

  app.put('/api/guests/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await updateGuest(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to update guest:', error);
      res.status(500).json({ error: error.message || 'Error updating guest' });
    }
  });

  app.delete('/api/guests/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await deleteGuest(id);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to delete guest:', error);
      res.status(500).json({ error: error.message || 'Error deleting guest' });
    }
  });

  // 3. Real-time RSVP Flow
  app.get('/api/rsvp/find', async (req, res) => {
    try {
      const codeOrName = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : undefined;
      if (!codeOrName) {
        return res.status(400).json({ error: 'Debes proporcionar un código o nombre.' });
      }

      // Try by exact code first
      let guest = await getGuestByCode(codeOrName, weddingId);
      if (!guest) {
        // Search by name match
        const matches = await getAllGuests(codeOrName, undefined, weddingId || 1);
        if (matches.length > 0) {
          guest = matches[0];
        }
      }

      if (!guest) {
        return res.status(404).json({ error: 'No encontramos ninguna invitación con esos datos. Por favor verifica tu código o nombre.' });
      }

      res.json(guest);
    } catch (error: any) {
      console.error('Error finding RSVP guest:', error);
      res.status(500).json({ error: error.message || 'Error al buscar invitación' });
    }
  });

  app.get('/api/rsvp/suggest', async (req, res) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : 1;
      if (!q) {
        return res.json([]);
      }
      const matches = await getAllGuests(q, undefined, weddingId);
      const suggestions = matches.slice(0, 8).map((g) => ({
        id: g.id,
        fullName: g.fullName,
        accessCode: g.accessCode,
        allocatedPasses: g.allocatedPasses,
        status: g.status,
        groupName: g.groupName,
        phone: g.phone,
        email: g.email,
        dietaryRestrictions: g.dietaryRestrictions,
        suggestedSong: g.suggestedSong,
        message: g.message,
        companionNames: g.companionNames,
      }));
      res.json(suggestions);
    } catch (error: any) {
      console.error('Error getting RSVP suggestions:', error);
      res.status(500).json({ error: 'Error al buscar coincidencias' });
    }
  });

  app.post('/api/rsvp/confirm', async (req, res) => {
    try {
      const { accessCode, ...payload } = req.body;
      if (!accessCode) {
        return res.status(400).json({ error: 'Falta el código de acceso' });
      }
      const updatedGuest = await submitRsvp(accessCode, payload);
      res.json({ success: true, guest: updatedGuest });
    } catch (error: any) {
      console.error('Error confirming RSVP:', error);
      res.status(500).json({ error: error.message || 'Error confirmando asistencia' });
    }
  });

  const handleOpenRsvp = async (req: express.Request, res: express.Response) => {
    try {
      const { weddingId, fullName, status, confirmedPasses, attendingCeremony, attendingReception, dietaryRestrictions, companionNames, suggestedSong, message, phone, email } = req.body;
      if (!fullName || !fullName.trim()) {
        return res.status(400).json({ error: 'El nombre completo es requerido para registrarse.' });
      }
      const createdGuest = await submitOpenRsvp({
        weddingId: Number(weddingId) || 1,
        fullName,
        status: status || 'confirmed',
        confirmedPasses: Number(confirmedPasses) || 1,
        attendingCeremony: attendingCeremony ?? true,
        attendingReception: attendingReception ?? true,
        dietaryRestrictions,
        companionNames,
        suggestedSong,
        message,
        phone,
        email,
      });
      res.status(201).json({ success: true, guest: createdGuest });
    } catch (error: any) {
      console.error('Error registering open RSVP:', error);
      res.status(500).json({ error: error.message || 'Error al registrar asistencia' });
    }
  };

  app.post('/api/rsvp/register-open', handleOpenRsvp);
  app.post('/api/rsvp/register', handleOpenRsvp);
  app.post('/api/rsvp/open', handleOpenRsvp);

  const signDriveThumbnail = (secret: string, eventId: number, folderId: string, fileId: string, source: string) =>
    createHmac('sha256', secret).update(`${eventId}:${folderId}:${fileId}:${source}`).digest('hex');
  const DRIVE_IMAGE_WIDTHS = [640, 960, 1440, 1920] as const;
  type DriveImageWidth = (typeof DRIVE_IMAGE_WIDTHS)[number];
  const signStableDriveAsset = (
    secret: string,
    eventId: number,
    folderId: string,
    fileId: string,
    resourceKey: string,
    variant: 'thumbnail' | 'full',
    width?: DriveImageWidth,
  ) => createHmac('sha256', secret).update(`${eventId}:${folderId}:${fileId}:stable:${variant}:${resourceKey}${width ? `:${width}` : ''}`).digest('hex');
  const signDrivePhotoInteraction = (secret: string, eventId: number, folderId: string, fileId: string) =>
    createHmac('sha256', secret).update(`drive-photo-interactions:${eventId}:${folderId}:${fileId}`).digest('hex');
  const createStableDriveAssetUrl = (
    secret: string,
    eventId: number,
    folderId: string,
    fileId: string,
    resourceKey: string,
    variant: 'thumbnail' | 'full',
    width?: DriveImageWidth,
  ) => {
    const url = new URL(
      `/api/drive-folders/${encodeURIComponent(folderId)}/photos/${encodeURIComponent(fileId)}/thumbnail`,
      'https://local.invalid',
    );
    url.searchParams.set('weddingId', String(eventId));
    url.searchParams.set('resourceKey', resourceKey);
    url.searchParams.set('variant', variant);
    if (width) url.searchParams.set('width', String(width));
    url.searchParams.set('signature', signStableDriveAsset(secret, eventId, folderId, fileId, resourceKey, variant, width));
    return `${url.pathname}${url.search}`;
  };
  const createResponsiveDriveAssetUrls = (secret: string, eventId: number, folderId: string, fileId: string, resourceKey: string) =>
    Object.fromEntries(DRIVE_IMAGE_WIDTHS.map((width) => [
      width,
      createStableDriveAssetUrl(secret, eventId, folderId, fileId, resourceKey, 'full', width),
    ])) as Record<DriveImageWidth, string>;
  type DriveBrowsePayload = {
    eventId: number;
    rootFolderId: string;
    rootResourceKey: string;
    folderId: string;
    folderName: string;
    folderResourceKey: string;
    path: Array<{ id: string; name: string; resourceKey: string }>;
  };
  const createDriveBrowseToken = (secret: string, payload: DriveBrowsePayload) => {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', secret).update(`drive-browse:${encoded}`).digest('hex');
    return `b1.${encoded}.${signature}`;
  };
  const readDriveBrowseToken = (secret: string, token: string): DriveBrowsePayload | null => {
    const match = /^b1\.([A-Za-z0-9_-]+)\.([a-f0-9]{64})$/.exec(token);
    if (!match) return null;
    const expected = createHmac('sha256', secret).update(`drive-browse:${match[1]}`).digest('hex');
    if (!timingSafeEqual(Buffer.from(match[2], 'hex'), Buffer.from(expected, 'hex'))) return null;
    try {
      const payload = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8')) as DriveBrowsePayload;
      if (
        !Number.isSafeInteger(payload.eventId) ||
        !/^[A-Za-z0-9_-]{1,200}$/.test(payload.rootFolderId) ||
        !/^[A-Za-z0-9_-]{1,200}$/.test(payload.folderId) ||
        typeof payload.folderName !== 'string' ||
        !Array.isArray(payload.path) || payload.path.length > 32
      ) return null;
      return payload;
    } catch {
      return null;
    }
  };

  // Folder browser used by the editor. The signed token proves each navigated
  // folder was returned as a child of this event's public Drive folder.
  app.get('/api/drive-folders/:folderId/browse', async (req, res) => {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
    if (!apiKey) return res.status(503).json({ error: 'La galería de Drive aún no está configurada en el servidor.' });
    const rootFolderId = req.params.folderId;
    const weddingId = Number(req.query.weddingId);
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(rootFolderId)) {
      return res.status(400).json({ error: 'El enlace de la carpeta de Drive no es válido.' });
    }
    if (!Number.isSafeInteger(weddingId) || weddingId < 1) {
      return res.status(400).json({ error: 'No se pudo identificar el evento de esta galería.' });
    }

    const eventSettings = await getWeddingSettings(weddingId);
    const configuredFolder = parseDriveFolderUrl(eventSettings?.galleryExternalAlbumUrl);
    if (!configuredFolder || configuredFolder.folderId !== rootFolderId) {
      return res.status(404).json({ error: 'Esta carpeta no está configurada para el evento.' });
    }

    let current: DriveBrowsePayload;
    const browseToken = typeof req.query.browseToken === 'string' ? req.query.browseToken : '';
    if (browseToken) {
      const decoded = readDriveBrowseToken(apiKey, browseToken);
      if (!decoded || decoded.eventId !== weddingId || decoded.rootFolderId !== rootFolderId) {
        return res.status(400).json({ error: 'La ruta de carpeta ya no es válida. Vuelve a abrir el álbum.' });
      }
      current = decoded;
    } else {
      const requestedResourceKey = typeof req.query.resourceKey === 'string' ? req.query.resourceKey : '';
      if (requestedResourceKey && !/^[A-Za-z0-9_-]{1,512}$/.test(requestedResourceKey)) {
        return res.status(400).json({ error: 'La clave de acceso de la carpeta no es válida.' });
      }
      current = {
        eventId: weddingId,
        rootFolderId,
        rootResourceKey: configuredFolder.resourceKey || requestedResourceKey,
        folderId: rootFolderId,
        folderName: 'Carpeta principal',
        folderResourceKey: configuredFolder.resourceKey || requestedResourceKey,
        path: [],
      };
    }

    const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : '';
    if (pageToken.length > 4096 || (pageToken && !/^[A-Za-z0-9_./+=-]+$/.test(pageToken))) {
      return res.status(400).json({ error: 'No se pudo continuar la lista de fotos.' });
    }
    const resourcePairs = [
      [current.rootFolderId, current.rootResourceKey],
      [current.folderId, current.folderResourceKey],
    ].filter(([id, key], index, entries) => Boolean(key) && entries.findIndex((pair) => pair[0] === id) === index)
      .map(([id, key]) => `${id}/${key}`);
    const driveHeaders: Record<string, string> = { 'X-Goog-Api-Key': apiKey };
    if (resourcePairs.length) driveHeaders['X-Goog-Drive-Resource-Keys'] = resourcePairs.join(',');

    try {
      const foldersUrl = new URL('https://www.googleapis.com/drive/v3/files');
      foldersUrl.searchParams.set('q', `'${current.folderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`);
      foldersUrl.searchParams.set('pageSize', '1000');
      foldersUrl.searchParams.set('supportsAllDrives', 'true');
      foldersUrl.searchParams.set('includeItemsFromAllDrives', 'true');
      foldersUrl.searchParams.set('fields', 'files(id,name,mimeType,resourceKey)');
      const foldersResponse = await fetch(foldersUrl, { headers: driveHeaders, signal: AbortSignal.timeout(12000) });
      if (!foldersResponse.ok) {
        console.warn(`Google Drive folder browser returned HTTP ${foldersResponse.status}.`);
        return res.status(foldersResponse.status === 403 ? 403 : 502).json({
          error: foldersResponse.status === 403
            ? 'No se pudo leer esta carpeta. Compártela como “Cualquier persona con el enlace: lector”.'
            : 'Google Drive no pudo responder. Inténtalo de nuevo más tarde.',
        });
      }
      const folderResult = await foldersResponse.json() as {
        files?: Array<{ id: string; name?: string; mimeType?: string; resourceKey?: string }>;
      };
      const folders = (folderResult.files || []).filter((folder) =>
        folder.mimeType === 'application/vnd.google-apps.folder' && /^[A-Za-z0-9_-]{1,200}$/.test(folder.id),
      ).map((folder) => {
        const resourceKey = folder.resourceKey && /^[A-Za-z0-9_-]{1,512}$/.test(folder.resourceKey) ? folder.resourceKey : '';
        const childPayload: DriveBrowsePayload = {
          ...current,
          folderId: folder.id,
          folderName: folder.name || 'Carpeta sin nombre',
          folderResourceKey: resourceKey,
          path: [...current.path, {
            id: current.folderId,
            name: current.folderName,
            resourceKey: current.folderResourceKey,
          }],
        };
        return {
          id: folder.id,
          name: folder.name || 'Carpeta sin nombre',
          browseToken: createDriveBrowseToken(apiKey, childPayload),
        };
      });

      const photosUrl = new URL('https://www.googleapis.com/drive/v3/files');
      photosUrl.searchParams.set('q', `'${current.folderId}' in parents and trashed = false and mimeType contains 'image/'`);
      photosUrl.searchParams.set('pageSize', '100');
      photosUrl.searchParams.set('orderBy', 'createdTime desc');
      photosUrl.searchParams.set('supportsAllDrives', 'true');
      photosUrl.searchParams.set('includeItemsFromAllDrives', 'true');
      photosUrl.searchParams.set('fields', 'nextPageToken,files(id,name,mimeType,thumbnailLink,resourceKey)');
      if (pageToken) photosUrl.searchParams.set('pageToken', pageToken);
      const photosResponse = await fetch(photosUrl, { headers: driveHeaders, signal: AbortSignal.timeout(12000) });
      if (!photosResponse.ok) {
        console.warn(`Google Drive folder photos returned HTTP ${photosResponse.status}.`);
        return res.status(photosResponse.status === 403 ? 403 : 502).json({
          error: photosResponse.status === 403
            ? 'No se pudieron leer las fotos. Comparte la carpeta como “Cualquier persona con el enlace: lector”.'
            : 'Google Drive no pudo responder. Inténtalo de nuevo más tarde.',
        });
      }
      const photoResult = await photosResponse.json() as {
        nextPageToken?: string;
        files?: Array<{ id: string; name?: string; mimeType?: string; thumbnailLink?: string; resourceKey?: string }>;
      };
      const photos = (photoResult.files || []).flatMap((file) => {
        if (!file.id || !file.mimeType?.startsWith('image/') || !file.thumbnailLink) return [];
        const thumbnail = new URL(file.thumbnailLink);
        if (thumbnail.protocol !== 'https:' || !thumbnail.hostname.endsWith('.googleusercontent.com')) return [];
        const resourceKey = file.resourceKey && /^[A-Za-z0-9_-]{1,512}$/.test(file.resourceKey) ? file.resourceKey : '';
        const openUrl = new URL(`https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`);
        if (resourceKey) openUrl.searchParams.set('resourcekey', resourceKey);
        return [{
          id: file.id,
          name: file.name || 'Foto compartida',
          thumbnailUrl: createStableDriveAssetUrl(apiKey, weddingId, rootFolderId, file.id, resourceKey, 'thumbnail'),
          fullUrl: createStableDriveAssetUrl(apiKey, weddingId, rootFolderId, file.id, resourceKey, 'full'),
          responsiveUrls: createResponsiveDriveAssetUrls(apiKey, weddingId, rootFolderId, file.id, resourceKey),
          interactionToken: signDrivePhotoInteraction(apiKey, weddingId, rootFolderId, file.id),
          openUrl: openUrl.toString(),
        }];
      });

      res.setHeader('Cache-Control', 'private, max-age=30');
      return res.json({
        folderName: current.folderName,
        folders,
        photos,
        nextPageToken: photoResult.nextPageToken,
      });
    } catch (error) {
      console.error('Google Drive folder browser failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(502).json({ error: 'No pudimos conectar con Google Drive en este momento.' });
    }
  });

  // Public Drive folders can back the invitation gallery without exposing the API key to browsers.
  app.get('/api/drive-folders/:folderId/photos', async (req, res) => {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
    if (!apiKey) {
      return res.status(503).json({
        code: 'drive_not_configured',
        error: 'La galería de Drive aún no está configurada en el servidor.',
      });
    }

    const folderId = req.params.folderId;
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(folderId)) {
      return res.status(400).json({ code: 'invalid_folder', error: 'El enlace de la carpeta de Drive no es válido.' });
    }

    const weddingId = Number(req.query.weddingId);
    if (!Number.isSafeInteger(weddingId) || weddingId < 1) {
      return res.status(400).json({ code: 'invalid_event', error: 'No se pudo identificar el evento de esta galería.' });
    }

    const eventSettings = await getWeddingSettings(weddingId);
    const configuredFolder = parseDriveFolderUrl(eventSettings?.galleryExternalAlbumUrl);
    if (!configuredFolder || configuredFolder.folderId !== folderId) {
      return res.status(404).json({ code: 'folder_not_configured', error: 'Esta carpeta no está configurada para el evento.' });
    }

    const resourceKey = typeof req.query.resourceKey === 'string' ? req.query.resourceKey : '';
    if (resourceKey && !/^[A-Za-z0-9_-]{1,512}$/.test(resourceKey)) {
      return res.status(400).json({ code: 'invalid_resource_key', error: 'La clave de acceso de la carpeta no es válida.' });
    }

    const pageToken = typeof req.query.pageToken === 'string' ? req.query.pageToken : '';
    if (pageToken.length > 4096 || (pageToken && !/^[A-Za-z0-9_./+=-]+$/.test(pageToken))) {
      return res.status(400).json({ code: 'invalid_page_token', error: 'No se pudo continuar la lista de fotos.' });
    }

    try {
      let cursorFolderIndex = 0;
      let cursorFolderId = '';
      let drivePageToken = '';
      if (pageToken.startsWith('v1_')) {
        try {
          const cursor = JSON.parse(Buffer.from(pageToken.slice(3), 'base64url').toString('utf8')) as {
            folderIndex?: number;
            folderId?: string;
            drivePageToken?: string;
          };
          if (
            !Number.isSafeInteger(cursor.folderIndex) ||
            (cursor.folderIndex as number) < 0 ||
            typeof cursor.folderId !== 'string' ||
            (cursor.drivePageToken && (cursor.drivePageToken.length > 2048 || !/^[A-Za-z0-9_./+=-]+$/.test(cursor.drivePageToken)))
          ) {
            return res.status(400).json({ code: 'invalid_page_token', error: 'No se pudo continuar la lista de fotos.' });
          }
          cursorFolderIndex = cursor.folderIndex as number;
          cursorFolderId = cursor.folderId;
          drivePageToken = cursor.drivePageToken || '';
        } catch {
          return res.status(400).json({ code: 'invalid_page_token', error: 'No se pudo continuar la lista de fotos.' });
        }
      } else {
        // Accept a Drive page token from clients that were already open during deployment.
        drivePageToken = pageToken;
      }

      const apiHeaders: Record<string, string> = { 'X-Goog-Api-Key': apiKey };
      const resourceKeysByFolder = new Map<string, string>();
      if (resourceKey) {
        resourceKeysByFolder.set(folderId, resourceKey);
        apiHeaders['X-Goog-Drive-Resource-Keys'] = `${folderId}/${resourceKey}`;
      }

      // Enumerate folders recursively. Drive can reject combined parent queries
      // when access is inherited from a shared root, so each folder is queried alone.
      const folderIds = [folderId];
      resourceKeysByFolder.set(folderId, resourceKey);
      for (let folderIndex = 0; folderIndex < folderIds.length && folderIndex < 2000; folderIndex += 1) {
        const parentId = folderIds[folderIndex];
        const childFoldersUrl = new URL('https://www.googleapis.com/drive/v3/files');
        childFoldersUrl.searchParams.set('q', `'${parentId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`);
        childFoldersUrl.searchParams.set('pageSize', '1000');
        childFoldersUrl.searchParams.set('supportsAllDrives', 'true');
        childFoldersUrl.searchParams.set('includeItemsFromAllDrives', 'true');
        childFoldersUrl.searchParams.set('fields', 'nextPageToken,files(id,mimeType,resourceKey)');
        const parentResourceKey = resourceKeysByFolder.get(parentId) || '';
        const folderHeaders: Record<string, string> = { 'X-Goog-Api-Key': apiKey };
        const folderKeyPairs = [[folderId, resourceKey], [parentId, parentResourceKey]]
          .filter(([id, key], index, entries) => Boolean(key) && entries.findIndex(([otherId]) => otherId === id) === index)
          .map(([id, key]) => `${id}/${key}`);
        if (folderKeyPairs.length) folderHeaders['X-Goog-Drive-Resource-Keys'] = folderKeyPairs.join(',');

        let childPageToken: string | undefined;
        do {
          if (childPageToken) childFoldersUrl.searchParams.set('pageToken', childPageToken);
          const foldersResponse = await fetch(childFoldersUrl, { headers: folderHeaders, signal: AbortSignal.timeout(12000) });
          if (!foldersResponse.ok) {
            console.warn(`Google Drive child-folder listing returned HTTP ${foldersResponse.status}.`);
            if (foldersResponse.status === 403) {
              return res.status(403).json({
                code: 'drive_folder_forbidden',
                error: 'No se pudo leer la carpeta. Compártela como “Cualquier persona con el enlace: lector” y verifica que Drive API esté habilitada.',
              });
            }
            if (foldersResponse.status === 404) {
              return res.status(404).json({ code: 'drive_folder_not_found', error: 'No encontramos esa carpeta de Drive.' });
            }
            return res.status(502).json({ code: 'drive_request_failed', error: 'Google Drive no pudo responder. Inténtalo de nuevo más tarde.' });
          }

          const folderResult = await foldersResponse.json() as {
            nextPageToken?: string;
            files?: Array<{ id: string; mimeType?: string; resourceKey?: string }>;
          };
          for (const folder of folderResult.files || []) {
            if (
              folder.mimeType === 'application/vnd.google-apps.folder' &&
              /^[A-Za-z0-9_-]{1,200}$/.test(folder.id) &&
              !folderIds.includes(folder.id) &&
              folderIds.length < 2000
            ) {
              folderIds.push(folder.id);
              if (folder.resourceKey && /^[A-Za-z0-9_-]{1,512}$/.test(folder.resourceKey)) {
                resourceKeysByFolder.set(folder.id, folder.resourceKey);
              }
            }
          }
          childPageToken = folderResult.nextPageToken;
        } while (childPageToken && folderIds.length < 2000);
      }

      if (cursorFolderId && folderIds[cursorFolderIndex] !== cursorFolderId) {
        return res.status(400).json({ code: 'stale_page_token', error: 'La carpeta cambió mientras cargábamos las fotos. Recarga la galería.' });
      }

      const toGalleryPhoto = (file: { id: string; name?: string; mimeType?: string; thumbnailLink?: string; resourceKey?: string }) => {
        if (!file.id || !file.mimeType?.startsWith('image/') || !file.thumbnailLink) return null;
        const thumbnailUrl = new URL(file.thumbnailLink);
        if (thumbnailUrl.protocol !== 'https:' || !thumbnailUrl.hostname.endsWith('.googleusercontent.com')) return null;
        const fileResourceKey = file.resourceKey && /^[A-Za-z0-9_-]{1,512}$/.test(file.resourceKey) ? file.resourceKey : '';
        const openUrl = new URL(`https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`);
        if (fileResourceKey) openUrl.searchParams.set('resourcekey', fileResourceKey);
        return {
          id: file.id,
          name: file.name || 'Foto compartida',
          thumbnailUrl: createStableDriveAssetUrl(apiKey, weddingId, folderId, file.id, fileResourceKey, 'thumbnail'),
          fullUrl: createStableDriveAssetUrl(apiKey, weddingId, folderId, file.id, fileResourceKey, 'full'),
          responsiveUrls: createResponsiveDriveAssetUrls(apiKey, weddingId, folderId, file.id, fileResourceKey),
          interactionToken: signDrivePhotoInteraction(apiKey, weddingId, folderId, file.id),
          openUrl: openUrl.toString(),
        };
      };

      const photos: Array<{ id: string; name: string; thumbnailUrl: string; fullUrl: string; interactionToken: string; openUrl: string }> = [];
      let currentFolderIndex = cursorFolderIndex;
      let currentDrivePageToken = drivePageToken || undefined;
      let nextPageToken: string | undefined;
      let folderRequests = 0;

      while (currentFolderIndex < folderIds.length && photos.length < 100 && folderRequests < 25) {
        const currentFolderId = folderIds[currentFolderIndex];
        const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
        driveUrl.searchParams.set('q', `'${currentFolderId}' in parents and trashed = false and mimeType contains 'image/'`);
        driveUrl.searchParams.set('pageSize', String(Math.max(1, 100 - photos.length)));
        driveUrl.searchParams.set('orderBy', 'createdTime desc');
        driveUrl.searchParams.set('supportsAllDrives', 'true');
        driveUrl.searchParams.set('includeItemsFromAllDrives', 'true');
        driveUrl.searchParams.set('fields', 'nextPageToken,files(id,name,mimeType,thumbnailLink,resourceKey,createdTime)');
        if (currentDrivePageToken) driveUrl.searchParams.set('pageToken', currentDrivePageToken);

        const headers: Record<string, string> = { 'X-Goog-Api-Key': apiKey };
        const keyPairs = [folderId, currentFolderId]
          .filter((id, index, all) => all.indexOf(id) === index)
          .flatMap((id) => {
            const key = resourceKeysByFolder.get(id);
            return key ? [`${id}/${key}`] : [];
          });
        if (keyPairs.length) headers['X-Goog-Drive-Resource-Keys'] = keyPairs.join(',');

        const driveResponse = await fetch(driveUrl, { headers, signal: AbortSignal.timeout(12000) });
        folderRequests += 1;
        if (!driveResponse.ok) {
          console.warn(`Google Drive photo listing returned HTTP ${driveResponse.status}.`);
          if (driveResponse.status === 403) {
            return res.status(403).json({
              code: 'drive_folder_forbidden',
              error: 'No se pudo leer la carpeta. Compártela como “Cualquier persona con el enlace: lector” y verifica que Drive API esté habilitada.',
            });
          }
          if (driveResponse.status === 404) {
            return res.status(404).json({ code: 'drive_folder_not_found', error: 'No encontramos esa carpeta de Drive.' });
          }
          return res.status(502).json({ code: 'drive_request_failed', error: 'Google Drive no pudo responder. Inténtalo de nuevo más tarde.' });
        }

        const result = await driveResponse.json() as {
          nextPageToken?: string;
          files?: Array<{ id: string; name?: string; mimeType?: string; thumbnailLink?: string; resourceKey?: string }>;
        };
        for (const file of result.files || []) {
          const photo = toGalleryPhoto(file);
          if (photo) photos.push(photo);
        }

        if (result.nextPageToken) {
          currentDrivePageToken = result.nextPageToken;
          if (photos.length >= 100 || folderRequests >= 25) {
            nextPageToken = `v1_${Buffer.from(JSON.stringify({
              folderIndex: currentFolderIndex,
              folderId: currentFolderId,
              drivePageToken: currentDrivePageToken,
            })).toString('base64url')}`;
          }
        } else {
          currentFolderIndex += 1;
          currentDrivePageToken = undefined;
          if (photos.length >= 100 && currentFolderIndex < folderIds.length) {
            nextPageToken = `v1_${Buffer.from(JSON.stringify({
              folderIndex: currentFolderIndex,
              folderId: folderIds[currentFolderIndex],
            })).toString('base64url')}`;
          }
        }
        if (nextPageToken) break;
      }

      if (!nextPageToken && currentFolderIndex < folderIds.length) {
        nextPageToken = `v1_${Buffer.from(JSON.stringify({
          folderIndex: currentFolderIndex,
          folderId: folderIds[currentFolderIndex],
          ...(currentDrivePageToken ? { drivePageToken: currentDrivePageToken } : {}),
        })).toString('base64url')}`;
      }

      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120');
      return res.json({ photos, nextPageToken });
    } catch (error) {
      console.error('Google Drive photo listing failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.status(502).json({ code: 'drive_unavailable', error: 'No pudimos conectar con Google Drive en este momento.' });
    }
  });

  const authorizeDrivePhotoInteraction = async (req: any, res: any): Promise<number | null> => {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
    const { folderId, fileId } = req.params;
    const weddingId = Number(req.query.weddingId);
    const signature = typeof req.query.signature === 'string' ? req.query.signature : '';
    if (!apiKey) {
      res.status(503).json({ error: 'La integración con Google Drive aún no está configurada.' });
      return null;
    }
    if (
      !/^[A-Za-z0-9_-]{1,200}$/.test(folderId) ||
      !/^[A-Za-z0-9_-]{1,200}$/.test(fileId) ||
      !Number.isSafeInteger(weddingId) || weddingId < 1 ||
      !/^[a-f0-9]{64}$/.test(signature)
    ) {
      res.status(400).json({ error: 'La referencia de esta foto no es válida.' });
      return null;
    }

    const eventSettings = await getWeddingSettings(weddingId);
    const configuredFolder = parseDriveFolderUrl(eventSettings?.galleryExternalAlbumUrl);
    if (!configuredFolder || configuredFolder.folderId !== folderId) {
      res.status(404).json({ error: 'Esta foto no pertenece a la carpeta configurada para el evento.' });
      return null;
    }

    const expectedSignature = signDrivePhotoInteraction(apiKey, weddingId, folderId, fileId);
    if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      res.status(403).json({ error: 'No se pudo validar el acceso a esta foto.' });
      return null;
    }
    return weddingId;
  };

  app.get('/api/drive-folders/:folderId/photos/:fileId/interactions', async (req, res) => {
    try {
      const weddingId = await authorizeDrivePhotoInteraction(req, res);
      if (weddingId === null) return;
      const { fileId } = req.params;
      const [likesCount, comments] = await Promise.all([
        getDrivePhotoLikesCount(weddingId, fileId),
        getDrivePhotoComments(weddingId, fileId),
      ]);
      return res.json({ likesCount, comments });
    } catch (error: any) {
      console.error('Failed to load Drive photo interactions:', error);
      return res.status(500).json({ error: 'No se pudieron cargar las interacciones de esta foto.' });
    }
  });

  app.post('/api/drive-folders/:folderId/photos/:fileId/like', async (req, res) => {
    try {
      const weddingId = await authorizeDrivePhotoInteraction(req, res);
      if (weddingId === null) return;
      const likesCount = await likeDrivePhoto(weddingId, req.params.fileId);
      return res.json({ likesCount });
    } catch (error: any) {
      console.error('Failed to like Drive photo:', error);
      return res.status(500).json({ error: 'No se pudo registrar el “Me gusta”.' });
    }
  });

  app.post('/api/drive-folders/:folderId/photos/:fileId/comments', async (req, res) => {
    try {
      const weddingId = await authorizeDrivePhotoInteraction(req, res);
      if (weddingId === null) return;
      const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
      const guestName = typeof req.body?.guestName === 'string' ? req.body.guestName.trim() : '';
      const guestCode = typeof req.body?.guestCode === 'string' ? req.body.guestCode.trim() : '';
      if (!message || message.length > 2000) {
        return res.status(400).json({ error: 'El comentario debe tener entre 1 y 2000 caracteres.' });
      }
      if (guestName.length > 100 || guestCode.length > 128) {
        return res.status(400).json({ error: 'El nombre o código del invitado es demasiado largo.' });
      }
      const comment = await addDrivePhotoComment({
        weddingId,
        driveFileId: req.params.fileId,
        guestName: guestName || 'Invitado Especial',
        guestCode: guestCode || null,
        message,
      });
      return res.status(201).json(comment);
    } catch (error: any) {
      console.error('Failed to comment on Drive photo:', error);
      return res.status(500).json({ error: 'No se pudo guardar el comentario.' });
    }
  });

  app.get('/api/drive-folders/:folderId/photos/:fileId/thumbnail', async (req, res) => {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
    const { folderId, fileId } = req.params;
    const weddingId = Number(req.query.weddingId);
    const source = typeof req.query.source === 'string' ? req.query.source : '';
    const resourceKey = typeof req.query.resourceKey === 'string' ? req.query.resourceKey : '';
    const variantParam = typeof req.query.variant === 'string' ? req.query.variant : 'thumbnail';
    const variant = variantParam === 'full' ? 'full' : 'thumbnail';
    const widthParam = typeof req.query.width === 'string' ? req.query.width : '';
    const width = widthParam ? Number(widthParam) as DriveImageWidth : undefined;
    const signature = typeof req.query.signature === 'string' ? req.query.signature : '';

    if (!apiKey) return res.sendStatus(503);
    if (!/^[A-Za-z0-9_-]{1,200}$/.test(folderId) || !/^[A-Za-z0-9_-]{1,200}$/.test(fileId)) {
      return res.sendStatus(400);
    }
    if (
      !Number.isSafeInteger(weddingId) || weddingId < 1 || source.length > 4096 ||
      !['thumbnail', 'full'].includes(variantParam) ||
      (widthParam && (source || !DRIVE_IMAGE_WIDTHS.includes(width as DriveImageWidth) || variant !== 'full')) ||
      (resourceKey && !/^[A-Za-z0-9_-]{1,512}$/.test(resourceKey)) ||
      !/^[a-f0-9]{64}$/.test(signature)
    ) {
      return res.sendStatus(400);
    }

    const expectedSignature = source
      ? signDriveThumbnail(apiKey, weddingId, folderId, fileId, source)
      : signStableDriveAsset(apiKey, weddingId, folderId, fileId, resourceKey, variant, width);
    if (!timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return res.sendStatus(403);
    }

    const eventSettings = await getWeddingSettings(weddingId);
    const configuredFolder = parseDriveFolderUrl(eventSettings?.galleryExternalAlbumUrl);
    if (!configuredFolder || configuredFolder.folderId !== folderId) return res.sendStatus(404);

    try {
      const configuredResourceKey = configuredFolder.resourceKey || '';
      const keyPairs = [[folderId, configuredResourceKey], [fileId, resourceKey]]
        .filter(([id, key], index, entries) => Boolean(key) && entries.findIndex(([otherId]) => otherId === id) === index)
        .map(([id, key]) => `${id}/${key}`);
      const driveHeaders: Record<string, string> = { 'X-Goog-Api-Key': apiKey };
      if (keyPairs.length) driveHeaders['X-Goog-Drive-Resource-Keys'] = keyPairs.join(',');

      if (!source && variant === 'full') {
        const metadataUrl = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
        metadataUrl.searchParams.set('fields', 'id,mimeType,thumbnailLink,resourceKey');
        metadataUrl.searchParams.set('supportsAllDrives', 'true');
        const metadataResponse = await fetch(metadataUrl, { headers: driveHeaders, signal: AbortSignal.timeout(10000) });
        if (!metadataResponse.ok) return res.sendStatus(metadataResponse.status === 404 ? 404 : 502);
        const metadata = await metadataResponse.json() as {
          mimeType?: string;
          thumbnailLink?: string;
        };
        if (!metadata.mimeType?.startsWith('image/') || !metadata.thumbnailLink) return res.sendStatus(404);

        const highResolutionThumbnail = new URL(metadata.thumbnailLink);
        if (highResolutionThumbnail.protocol !== 'https:' || !highResolutionThumbnail.hostname.endsWith('.googleusercontent.com')) {
          return res.sendStatus(400);
        }
        const requestedWidth = width || 1920;
        if (/=s\d+(?:-[a-z-]+)?$/i.test(highResolutionThumbnail.pathname)) {
          highResolutionThumbnail.pathname = highResolutionThumbnail.pathname.replace(/=s\d+(?:-[a-z-]+)?$/i, `=s${requestedWidth}`);
        } else {
          highResolutionThumbnail.pathname = `${highResolutionThumbnail.pathname}=s${requestedWidth}`;
        }
        const downloadUrls = [highResolutionThumbnail.toString()];

        let image: Buffer | null = null;
        let contentType = '';
        for (const downloadUrl of downloadUrls) {
          let parsedDownloadUrl = new URL(downloadUrl);
          let downloadResponse: Response | null = null;
          for (let redirectCount = 0; redirectCount <= 5; redirectCount += 1) {
            const hostname = parsedDownloadUrl.hostname.toLowerCase();
            const trustedGoogleHost = hostname === 'www.googleapis.com'
              || hostname === 'drive.google.com'
              || hostname === 'drive.usercontent.google.com'
              || hostname === 'googleusercontent.com'
              || hostname.endsWith('.googleusercontent.com');
            if (parsedDownloadUrl.protocol !== 'https:' || !trustedGoogleHost) break;
            const response = await fetch(parsedDownloadUrl, {
              redirect: 'manual',
              signal: AbortSignal.timeout(30000),
            });
            const location = response.headers.get('location');
            if ([301, 302, 303, 307, 308].includes(response.status) && location && redirectCount < 5) {
              parsedDownloadUrl = new URL(location, parsedDownloadUrl);
              continue;
            }
            downloadResponse = response;
            break;
          }
          if (!downloadResponse) continue;
          if (!downloadResponse.ok) continue;
          const responseContentType = downloadResponse.headers.get('content-type')?.split(';')[0].trim().toLowerCase() || '';
          const isRasterImage = /^image\/(avif|bmp|gif|heic|heif|jpeg|png|tiff|webp)$/i.test(responseContentType);
          const isBinary = responseContentType === 'application/octet-stream' && /^image\//i.test(metadata.mimeType);
          if (!isRasterImage && !isBinary) continue;
          const declaredLength = Number(downloadResponse.headers.get('content-length') || 0);
          if (declaredLength > 40 * 1024 * 1024) return res.sendStatus(413);
          const reader = downloadResponse.body?.getReader();
          if (!reader) continue;
          const chunks: Uint8Array[] = [];
          let totalBytes = 0;
          let oversized = false;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalBytes += value.byteLength;
            if (totalBytes > 40 * 1024 * 1024) {
              oversized = true;
              await reader.cancel();
              break;
            }
            chunks.push(value);
          }
          if (oversized) return res.sendStatus(413);
          if (totalBytes > 0) {
            image = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes);
            contentType = isRasterImage ? responseContentType : metadata.mimeType;
            break;
          }
        }
        if (!image || !contentType) return res.sendStatus(502);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', String(image.length));
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        return res.send(image);
      }

      let thumbnailLink = '';
      if (source) {
        thumbnailLink = Buffer.from(source, 'base64url').toString('utf8');
      } else {
        const driveFileUrl = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
        driveFileUrl.searchParams.set('fields', 'id,mimeType,thumbnailLink,resourceKey');
        driveFileUrl.searchParams.set('supportsAllDrives', 'true');
        const driveFileResponse = await fetch(driveFileUrl, {
          headers: driveHeaders,
          signal: AbortSignal.timeout(10000),
        });
        if (!driveFileResponse.ok) return res.sendStatus(driveFileResponse.status === 404 ? 404 : 502);
        const driveFile = await driveFileResponse.json() as { mimeType?: string; thumbnailLink?: string };
        if (!driveFile.mimeType?.startsWith('image/') || !driveFile.thumbnailLink) return res.sendStatus(404);
        thumbnailLink = driveFile.thumbnailLink;
      }
      const thumbnailUrl = new URL(thumbnailLink);
      if (thumbnailUrl.protocol !== 'https:' || !thumbnailUrl.hostname.endsWith('.googleusercontent.com')) {
        return res.sendStatus(400);
      }

      const thumbnailResponse = await fetch(thumbnailUrl, {
        signal: AbortSignal.timeout(10000),
        redirect: 'error',
      });
      if (!thumbnailResponse.ok) return res.sendStatus(502);

      const contentType = thumbnailResponse.headers.get('content-type')?.split(';')[0].trim() || '';
      if (!/^image\/(avif|gif|jpeg|png|webp)$/i.test(contentType)) return res.sendStatus(502);

      const image = Buffer.from(await thumbnailResponse.arrayBuffer());
      if (image.length === 0 || image.length > 10 * 1024 * 1024) return res.sendStatus(502);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', String(image.length));
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=1800, s-maxage=1800');
      return res.send(image);
    } catch (error) {
      console.warn('Google Drive thumbnail proxy failed:', error instanceof Error ? error.message : 'Unknown error');
      return res.sendStatus(502);
    }
  });

  // 4. Interactive Photo Gallery & Uploads
  app.get('/api/gallery', async (req, res) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : 1;
      const photos = await getGalleryPhotos(category, weddingId);
      res.json(photos);
    } catch (error: any) {
      console.error('Failed to get gallery photos:', error);
      res.status(500).json({ error: error.message || 'Error fetching photos' });
    }
  });

  app.post('/api/gallery', async (req, res) => {
    try {
      const photo = await addGalleryPhoto(req.body);
      res.status(201).json(photo);
    } catch (error: any) {
      console.error('Failed to add gallery photo:', error);
      res.status(500).json({ error: error.message || 'Error saving photo' });
    }
  });

  app.post('/api/gallery/:id/like', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await likePhoto(id);
      res.json(updated);
    } catch (error: any) {
      console.error('Failed to like photo:', error);
      res.status(500).json({ error: error.message || 'Error liking photo' });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await deleteGalleryPhoto(id);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to delete photo:', error);
      res.status(500).json({ error: error.message || 'Error deleting photo' });
    }
  });

  // 4.1 Photo Comments Endpoints
  app.get('/api/gallery-comments', async (req, res) => {
    try {
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : 1;
      const comments = await getAllPhotoCommentsForWedding(weddingId);
      res.json(comments);
    } catch (error: any) {
      console.error('Failed to get all photo comments:', error);
      res.status(500).json({ error: error.message || 'Error fetching all comments' });
    }
  });

  app.get('/api/gallery/:id/comments', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id, 10);
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : 1;
      const comments = await getPhotoComments(photoId, weddingId);
      res.json(comments);
    } catch (error: any) {
      console.error('Failed to get photo comments:', error);
      res.status(500).json({ error: error.message || 'Error fetching comments' });
    }
  });

  app.post('/api/gallery/:id/comments', async (req, res) => {
    try {
      const photoId = parseInt(req.params.id, 10);
      const { guestName, message, guestCode, weddingId } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ error: 'El comentario no puede estar vacío.' });
      }
      const comment = await addPhotoComment({
        photoId,
        weddingId: Number(weddingId) || 1,
        guestName: guestName ? guestName.trim() : 'Invitado Especial',
        guestCode: guestCode || null,
        message: message.trim(),
      });
      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Failed to add photo comment:', error);
      res.status(500).json({ error: error.message || 'Error saving comment' });
    }
  });

  app.delete('/api/gallery/comments/:commentId', async (req, res) => {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      const result = await deletePhotoComment(commentId);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      res.status(500).json({ error: error.message || 'Error deleting comment' });
    }
  });

  // 5. Video Media Embeds (YouTube, Instagram, Facebook, TikTok)
  app.get('/api/videos', async (req, res) => {
    try {
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : 1;
      const videos = await getAllVideos(weddingId);
      res.json(videos);
    } catch (error: any) {
      console.error('Failed to get videos:', error);
      res.status(500).json({ error: error.message || 'Error fetching videos' });
    }
  });

  app.post('/api/videos', async (req, res) => {
    try {
      const { videoUrl, title, description, authorName, weddingId } = req.body;
      if (!videoUrl || !title) {
        return res.status(400).json({ error: 'URL y título son requeridos' });
      }

      // Auto detect platform and embedId
      let platform = 'direct';
      let embedId = '';

      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        platform = 'youtube';
        const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        embedId = match ? match[1] : '';
      } else if (videoUrl.includes('instagram.com')) {
        platform = 'instagram';
        const match = videoUrl.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#&]+)/);
        embedId = match ? match[1] : '';
      } else if (videoUrl.includes('facebook.com') || videoUrl.includes('fb.watch')) {
        platform = 'facebook';
      } else if (videoUrl.includes('tiktok.com')) {
        platform = 'tiktok';
        const match = videoUrl.match(/video\/(\d+)/);
        embedId = match ? match[1] : '';
      }

      const created = await addWeddingVideo({
        weddingId: weddingId || 1,
        title,
        platform,
        videoUrl,
        embedId,
        description: description || '',
        authorName: authorName || 'Novios',
      });
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Failed to add video:', error);
      res.status(500).json({ error: error.message || 'Error saving video' });
    }
  });

  app.delete('/api/videos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await deleteWeddingVideo(id);
      res.json(result);
    } catch (error: any) {
      console.error('Failed to delete video:', error);
      res.status(500).json({ error: error.message || 'Error deleting video' });
    }
  });

  // 6. Guestbook Wishes
  app.get('/api/wishes', async (req, res) => {
    try {
      const weddingId = req.query.weddingId ? Number(req.query.weddingId) : 1;
      const list = await getWishes(weddingId);
      res.json(list);
    } catch (error: any) {
      console.error('Failed to get wishes:', error);
      res.status(500).json({ error: error.message || 'Error fetching wishes' });
    }
  });

  app.post('/api/wishes', async (req, res) => {
    try {
      const created = await addWish(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Failed to add wish:', error);
      res.status(500).json({ error: error.message || 'Error adding wish' });
    }
  });

  // 7. File Upload Endpoint (Volume Storage for Audio, Images, etc.)
  app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({ error: error.message || 'Error al procesar archivo' });
    }
  });

  // High-performance streaming endpoint for audio (HTTP Range 206, Content-Disposition: inline, never triggers file downloads)
  app.get('/api/audio/stream', async (req, res) => {
    try {
      const targetUrl = typeof req.query.url === 'string' ? req.query.url.trim() : (typeof req.query.file === 'string' ? req.query.file.trim() : '');
      if (!targetUrl) {
        return res.status(400).json({ error: 'URL o nombre de archivo de audio requerido' });
      }

      // 1. Check if it's a local file
      let localPath: string | null = null;
      if (targetUrl.startsWith('/uploads/') || targetUrl.startsWith('uploads/')) {
        const rel = targetUrl.replace(/^\/?uploads\//, '');
        const resolved = path.join(uploadsDir, path.basename(rel));
        if (fs.existsSync(resolved)) localPath = resolved;
      } else if (targetUrl.startsWith('/audio/') || targetUrl.startsWith('audio/')) {
        const rel = targetUrl.replace(/^\/?audio\//, '');
        const resolved = path.join(process.cwd(), 'public', 'audio', path.basename(rel));
        if (fs.existsSync(resolved)) localPath = resolved;
      } else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        const pubAudio = path.join(process.cwd(), 'public', 'audio', path.basename(targetUrl));
        const upAudio = path.join(uploadsDir, path.basename(targetUrl));
        if (fs.existsSync(pubAudio)) localPath = pubAudio;
        else if (fs.existsSync(upAudio)) localPath = upAudio;
      }

      if (localPath) {
        const stat = fs.statSync(localPath);
        const total = stat.size;
        const ext = path.extname(localPath).toLowerCase();
        const mimeType = AUDIO_MIME_TYPES[ext] || 'application/octet-stream';

        const range = req.headers.range;
        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
          if (start >= total || end >= total) {
            res.status(416).setHeader('Content-Range', `bytes */${total}`).end();
            return;
          }
          const chunkSize = end - start + 1;
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': mimeType,
            'Content-Disposition': 'inline', // CRITICAL: strictly inline, never triggers file downloads
            'Cache-Control': 'public, max-age=86400',
          });
          fs.createReadStream(localPath, { start, end }).pipe(res);
        } else {
          res.writeHead(200, {
            'Content-Length': total,
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes',
            'Content-Disposition': 'inline', // CRITICAL: strictly inline
            'Cache-Control': 'public, max-age=86400',
          });
          fs.createReadStream(localPath).pipe(res);
        }
        return;
      }

      // 2. If it's a remote HTTP/HTTPS URL (e.g. CDN or user custom URL), proxy via stream with inline disposition
      if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
        const headers: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };
        if (req.headers.range) {
          headers['Range'] = req.headers.range;
        }

        const upstream = await fetch(targetUrl, { headers });
        const upstreamContentType = upstream.headers.get('content-type') || 'audio/mpeg';
        const upstreamContentRange = upstream.headers.get('content-range');
        const upstreamContentLength = upstream.headers.get('content-length');

        const outHeaders: Record<string, string> = {
          'Content-Type': upstreamContentType,
          'Content-Disposition': 'inline', // Strip any 'attachment; filename=...' and force inline streaming
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        };
        if (upstreamContentRange) outHeaders['Content-Range'] = upstreamContentRange;
        if (upstreamContentLength) outHeaders['Content-Length'] = upstreamContentLength;

        res.writeHead(upstream.status, outHeaders);
        if (upstream.body) {
          const { Readable } = await import('stream');
          // @ts-ignore Node 18+ Web ReadableStream to Node stream
          Readable.fromWeb(upstream.body as any).pipe(res);
        } else {
          res.end();
        }
        return;
      }

      return res.status(404).json({ error: 'Archivo de audio no encontrado' });
    } catch (err: any) {
      console.error('Audio streaming error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al reproducir streaming de audio' });
      }
    }
  });

  // 8. Auth sync
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      const user = await getOrCreateUser(req.user.uid, req.user.email || '', req.user.name);
      res.json(user);
    } catch (error: any) {
      console.error('Auth sync error:', error);
      res.status(500).json({ error: error.message || 'Error sincronizando usuario' });
    }
  });

  // ----------------------------------------------------
  // 9. DYNAMIC OPEN GRAPH SOCIAL MEDIA IMAGE GENERATOR
  // ----------------------------------------------------
  app.get(['/api/og-image', '/api/og-image/:slug.png', '/api/og-image/:slug'], async (req, res) => {
    try {
      const weddingParam = (req.params.slug || req.query.wedding || req.query.w || '').toString().replace(/\.png$/, '');
      const guestCodeParam = (req.query.guest || req.query.g || req.query.code || '').toString();

      // Retrieve wedding settings
      let wedding = await getWeddingSettings(weddingParam || undefined);
      if (!wedding) {
        wedding = await getWeddingSettings();
      }

      // Retrieve optional personalized guest info
      let guest = null;
      if (guestCodeParam && wedding) {
        guest = await getGuestByCode(guestCodeParam, wedding.id);
      }

      // Generate dynamic Open Graph social card buffer
      const imageBuffer = await generateWeddingOgImage(wedding || {}, guest);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
      res.send(imageBuffer);
    } catch (error: any) {
      console.error('OG Image Generation error:', error);
      res.status(500).send('Error generating OG image');
    }
  });

  // Helper function to inject Open Graph meta tags into index.html for WhatsApp/Facebook/Twitter/etc.
  const injectSocialMeta = async (rawHtml: string, req: express.Request): Promise<string> => {
    try {
      // Extract custom slug from path e.g. "/bodasergioylore" -> "bodasergioylore"
      const originalPath = (req.originalUrl || req.path || '/').split('?')[0].toLowerCase();
      const pathParts = originalPath.split('/').filter(Boolean);
      const reservedPaths = [
        'api', 'uploads', 'src', 'assets', '@vite', '@fs', '@id', 'node_modules',
        'favicon.ico', 'favicon.png', 'favicon-32x32.png', 'apple-touch-icon.png',
        'Logo.webp', 'Logo.png', 'og-landing.png', 'og-landing.webp', 'icon-192.png',
        'icon-512.png', 'manifest.json', 'robots.txt', 'index.html',
        'demo', 'demostracion', 'login', 'register', 'ingresar', 'registro', 'signin', 'signup',
        'boda', 'bodas', 'xv', 'quince', 'quinceanera', 'portal', 'mis-eventos'
      ];
      const pathSlug = (pathParts.length === 1 && !reservedPaths.includes(pathParts[0].toLowerCase()))
        ? pathParts[0]
        : '';

      const weddingParam = (req.query.wedding || req.query.w || pathSlug || '').toString();
      const guestCodeParam = (req.query.guest || req.query.g || req.query.code || '').toString();

      // Determine public host URL
      const host = req.get('x-forwarded-host') || req.get('host') || `localhost:${PORT}`;
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
      const baseUrl = `${protocol}://${host}`;

      let wedding = null;
      if (weddingParam) {
        wedding = await getWeddingSettings(weddingParam);
      }

      const pathLower = originalPath;
      const eventQuery = (req.query.event || req.query.tipo || '').toString().toLowerCase();
      const isXvRoute = pathLower === '/xv' || pathLower === '/quince' || pathLower === '/quinceanera' || ['xv', 'quince', 'quinceanera', 'quinceañera', '15', '15anos', '15años'].includes(eventQuery);
      const isBodaRoute = pathLower === '/boda' || pathLower === '/bodas' || eventQuery === 'bodas' || eventQuery === 'boda';
      const isPortalRoute = (pathLower === '/' || pathLower === '/portal' || pathLower === '/index.html') && !isXvRoute && !isBodaRoute && !weddingParam && !guestCodeParam;

      const isLandingRequest = !weddingParam && !guestCodeParam && (isPortalRoute || isXvRoute || isBodaRoute || req.query.mode === 'landing');
      const routeEventType = isXvRoute ? 'xv' : isBodaRoute ? 'bodas' : undefined;
      let presentation = getEventPresentation(
        wedding?.eventType ?? routeEventType ?? eventQuery,
        wedding?.slug ?? weddingParam,
      );

      let title = '2date Atelier | Plataforma Integral de Invitaciones Digitales & RSVP';
      let description = 'Plataforma de alta costura para invitaciones digitales interactivas con sobre 3D, música personalizada, confirmación RSVP y galería para Bodas, XV Años y Eventos Especiales.';
      let ogImageUrl = `${baseUrl}/Logo.webp`;
      let ogImageAlt = '2date Atelier - Invitaciones Digitales & RSVP para Todo Tipo de Eventos';

      if (isLandingRequest && (isXvRoute || isBodaRoute)) {
        title = presentation.landingTitle;
        description = presentation.landingDescription;
        if (presentation.type === 'xv') {
          ogImageUrl = 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1200&q=80';
          ogImageAlt = 'Atelier XV Años - Invitaciones de Quinceañera';
        } else {
          ogImageUrl = `${baseUrl}/og-landing.png`;
          ogImageAlt = 'Atelier Nupcial Digital - Invitaciones de Boda';
        }
      }

      if (!isLandingRequest) {
        if (!wedding) {
          wedding = await getWeddingSettings();
        }

        presentation = getEventPresentation(wedding?.eventType, wedding?.slug ?? weddingParam);

        let guest = null;
        if (guestCodeParam && wedding) {
          guest = await getGuestByCode(guestCodeParam, wedding.id);
        }

        const coupleNames = wedding?.coupleNames || presentation.defaultName;
        const formattedDate = formatHeroDate(
          wedding?.eventDate || '2026-11-28',
          wedding?.heroDateFormat || 'literal-short',
          wedding?.heroCustomDateText
        );
        const venue = wedding?.ceremonyVenue || wedding?.receptionVenue || 'Nuestra Celebración';
        const cityOrAddress = wedding?.receptionAddress || wedding?.ceremonyAddress || '';
        const welcomeSubtitle = wedding?.welcomeSubtitle || 'Nos emociona compartir este día tan especial contigo.';

        ogImageUrl = `${baseUrl}/api/og-image?wedding=${encodeURIComponent(weddingParam || wedding?.slug || '')}${guestCodeParam ? `&guest=${encodeURIComponent(guestCodeParam)}` : ''}&t=${encodeURIComponent(wedding?.eventDate || '2026-11-28')}`;

        // Dynamic Title for social sharing (WhatsApp, Facebook, iMessage, Twitter/X)
        const guestName = guest?.name || guest?.fullName;
        title = presentation.invitationTitle(coupleNames, guestName);

        // Dynamic Subtitle / Description with event date, venue, city & personalized welcome
        const locationPart = cityOrAddress ? `${venue} (${cityOrAddress})` : venue;
        description = `${welcomeSubtitle} • ${formattedDate} en ${locationPart}. Toca aquí para ver itinerario, mapa y confirmar tu asistencia.`;
        ogImageAlt = presentation.imageAlt(coupleNames, formattedDate);
      }

      const safeTitle = escapeHtml(title);
      const safeDescription = escapeHtml(description);
      const siteName = isPortalRoute
        ? '2date Atelier'
        : presentation.siteName(wedding?.coupleNames || presentation.defaultName);
      const safeSiteName = escapeHtml(siteName);
      const safeImageUrl = escapeHtml(ogImageUrl);
      const safeImageAlt = escapeHtml(ogImageAlt);
      const safeUrl = escapeHtml(`${baseUrl}${req.originalUrl}`);
      const dynamicTags = `
    <!-- Dynamic Social Media & WhatsApp Rich Previews -->
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <meta property="og:site_name" content="${safeSiteName}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImageUrl}" />
    <meta property="og:image:secure_url" content="${safeImageUrl}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${safeImageAlt}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImageUrl}" />
      `;

      // Replace existing generic tags
      let modified = rawHtml;
      modified = modified.replace(/<title>.*?<\/title>/gi, '');
      modified = modified.replace(/<meta name="description".*?>/gi, '');
      modified = modified.replace(/<meta property="og:.*?>/gi, '');
      modified = modified.replace(/<meta name="twitter:.*?>/gi, '');

      return modified.replace('</head>', `${dynamicTags}\n  </head>`);
    } catch (e) {
      console.error('Error injecting social meta tags:', e);
      return rawHtml;
    }
  };

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/uploads') || url.startsWith('/src') || url.startsWith('/@')) {
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const html = await injectSocialMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', async (req, res) => {
      try {
        const template = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        const html = await injectSocialMeta(template, req);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}\n`);
  });

  let isShuttingDown = false;
  const shutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log(`Received ${signal}; shutting down gracefully.`);

    const forceExit = setTimeout(() => {
      console.error('Graceful shutdown timed out; forcing exit.');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    httpServer.close(async (error) => {
      try {
        await pool.end();
      } catch (poolError) {
        console.error('Error closing PostgreSQL pool:', poolError);
        process.exitCode = 1;
      } finally {
        clearTimeout(forceExit);
        if (error) {
          console.error('Error closing HTTP server:', error);
          process.exitCode = 1;
        }
      }
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

startServer();
