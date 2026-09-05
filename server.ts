import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
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
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';
import { generateWeddingOgImage } from './src/lib/ogImageGenerator.ts';
import { formatHeroDate } from './src/lib/dateFormatters.ts';

// Setup uploads volume storage directory (compatible with Docker volumes and local env)
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
  const CEO_PASSWORD = process.env.CEO_PASSWORD || process.env.ADMIN_PASSWORD || 'MasterCEO2026!';
  const CEO_NAME = process.env.CEO_NAME || 'Daviex (CEO Master)';

  const PLANNER_EMAIL = (process.env.PLANNER_EMAIL || 'planner@atelier.com').toLowerCase().trim();
  const PLANNER_PASSWORD = process.env.PLANNER_PASSWORD || 'PlannerPro2026!';
  const PLANNER_NAME = process.env.PLANNER_NAME || 'Valeria Mendoza';
  const PLANNER_AGENCY = process.env.PLANNER_AGENCY || 'Valeria Events Atelier';

  const COUPLE_EMAIL = (process.env.COUPLE_EMAIL || 'novios@weddingatelier.com').toLowerCase().trim();
  const COUPLE_PASSWORD = process.env.COUPLE_PASSWORD || 'Novios2026!';
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
        const mimeType = ext === '.ogg' ? 'audio/ogg' : ext === '.wav' ? 'audio/wav' : ext === '.m4a' || ext === '.mp4' ? 'audio/mp4' : 'audio/mpeg';

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
      const pathParts = req.path.split('/').filter(Boolean);
      const reservedPaths = [
        'api', 'uploads', 'src', 'assets', '@vite', '@fs', '@id', 'node_modules',
        'favicon.ico', 'favicon.png', 'favicon-32x32.png', 'apple-touch-icon.png',
        'Logo.webp', 'Logo.png', 'og-landing.png', 'og-landing.webp', 'icon-192.png',
        'icon-512.png', 'manifest.json', 'robots.txt', 'index.html',
        'demo', 'demostracion', 'login', 'register', 'ingresar', 'registro', 'signin', 'signup'
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

      const isLandingRequest = !weddingParam && !guestCodeParam && (req.path === '/' || req.path === '/index.html' || req.query.mode === 'landing');

      let title = 'Atelier Nupcial Digital | Invitaciones de Boda Elegantes e Interactivas';
      let description = 'Crea y comparte tu invitación de boda digital de lujo con música personalizada, confirmación de asistencia RSVP en tiempo real, itinerario interactivo y galería de fotos colaborativa.';
      let ogImageUrl = `${baseUrl}/og-landing.png`;
      let ogImageAlt = 'Atelier Nupcial Digital - Invitaciones de Boda Elegantes & RSVP';

      if (!isLandingRequest) {
        if (!wedding) {
          wedding = await getWeddingSettings();
        }

        let guest = null;
        if (guestCodeParam && wedding) {
          guest = await getGuestByCode(guestCodeParam, wedding.id);
        }

        const coupleNames = wedding?.coupleNames || 'Nuestra Boda';
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
        if (guestName) {
          title = `💌 ¡${guestName}, tienes una invitación para la Boda de ${coupleNames}!`;
        } else {
          title = `💍 Boda de ${coupleNames} — Invitación Oficial`;
        }

        // Dynamic Subtitle / Description with event date, venue, city & personalized welcome
        const locationPart = cityOrAddress ? `${venue} (${cityOrAddress})` : venue;
        description = `${welcomeSubtitle} • ${formattedDate} en ${locationPart}. Toca aquí para ver itinerario, mapa y confirmar tu asistencia.`;
        ogImageAlt = `Invitación de Boda de ${coupleNames} - ${formattedDate}`;
      }

      const dynamicTags = `
    <!-- Dynamic Social Media & WhatsApp Rich Previews -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:site_name" content="Boda de ${wedding?.coupleNames || 'Sofía & Alejandro'}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:secure_url" content="${ogImageUrl}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${ogImageAlt}" />
    <meta property="og:url" content="${baseUrl}${req.originalUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImageUrl}" />
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}\n`);
  });
}

startServer();

