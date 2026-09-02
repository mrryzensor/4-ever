import { db } from './index.ts';
import { autoMigrateDatabase } from './autoMigrate.ts';
import {
  weddingSettings,
  guests,
  galleryPhotos,
  photoComments,
  weddingVideos,
  guestbookWishes,
  users
} from './schema.ts';
import { eq, desc, asc, ilike, or, and } from 'drizzle-orm';

// In-memory fallback state to ensure 100% server uptime even without local PostgreSQL
const memoryState = {
  weddings: [
    {
      id: 1,
      ownerUid: 'demo-user-master',
      slug: 'boda-sofia-alejandro',
      coupleNames: 'Sofía & Alejandro',
      brideName: 'Sofía Elena Morales',
      groomName: 'Alejandro Ruiz Mendoza',
      eventDate: '2026-11-28',
      eventTime: '17:00',
      ceremonyTime: '17:00',
      receptionTime: '19:30',
      ceremonyVenue: 'Parroquia San Francisco de Asís',
      ceremonyLocationName: 'Parroquia San Francisco de Asís',
      ceremonyAddress: 'Calle de los Olivos 142, Centro Histórico',
      ceremonyMapsUrl: 'https://maps.google.com/?q=Parroquia+San+Francisco+de+Asis',
      ceremonyEmbedUrl: '',
      ceremonyPlaceQuery: 'Parroquia San Francisco de Asís',
      receptionVenue: 'Hacienda Los Arcángeles',
      receptionLocationName: 'Hacienda Los Arcángeles',
      receptionAddress: 'Km 14.5 Carretera Real, Valle Encantado',
      receptionMapsUrl: 'https://maps.google.com/?q=Hacienda+Los+Arcangeles',
      receptionEmbedUrl: '',
      receptionPlaceQuery: 'Hacienda Los Arcángeles',
      dressCode: 'Formal / Traje Oscuro y Vestido Largo',
      dressCodeDescription: 'Agradecemos no usar blanco, marfil o champagne reservado para la novia.',
      dressCodePalette: '["#1C2D37", "#9E7D47", "#D4AF37", "#D8C7B8", "#4A5B52"]',
      itinerary: '[{"time":"17:00","title":"Ceremonia Religiosa","desc":"Parroquia San Francisco de Asís","icon":"church"},{"time":"18:30","title":"Cóctel de Bienvenida","desc":"Jardín de los Naranjos","icon":"cocktail"},{"time":"20:00","title":"Banquete & Brindis","desc":"Salón Principal","icon":"utensils"},{"time":"22:00","title":"Fiesta & DJ","desc":"Pista de baile y barra libre","icon":"music"},{"time":"02:00","title":"Tornaboda & Chilaquiles","desc":"Terraza Nocturna","icon":"moon"}]',
      giftRegistry: '[{"type":"bank","title":"Transferencia Bancaria","accountNumber":"1234-5678-9012-3456","clabe":"012180012345678901","bankName":"BBVA","beneficiary":"Sofía Martínez / Alejandro Ruiz","concept":"Boda Sofía & Alejandro"},{"type":"store","title":"Mesa de Regalos Liverpool","url":"https://mesaderegalos.liverpool.com.mx","eventNumber":"51298472"},{"type":"honeymoon","title":"Fondo Luna de Miel en Bali","description":"Tu aportación para experiencias inolvidables en nuestro primer viaje de casados","url":"https://paypal.me/boda"}]',
      bankName: 'BBVA',
      bankBeneficiary: 'Sofía Martínez / Alejandro Ruiz',
      bankAccountNumber: '1234 5678 9012 3456',
      bankClabe: '012180012345678901',
      bankCardNumber: '',
      bankConcept: 'Boda Sofía & Alejandro',
      bankCurrency: 'MXN',
      enableBankTransfer: true,
      enableStoreRegistry: true,
      enableEnvelopeGift: false,
      envelopeGiftMessage: 'Lluvia de sobres: Si deseas hacernos un regalo en efectivo el día del evento, dispondremos de un cofre especial en la recepción.',
      showItinerary: true,
      showLocations: true,
      showDressCode: true,
      showGiftRegistry: true,
      showPhotoGallery: true,
      showVideoMemories: true,
      showGuestbook: true,
      showHotels: false,
      showRsvpSection: true,
      giftRegistryMessage: 'El mejor regalo es tu compañía. Si deseas tener un detalle con nosotros, te compartimos nuestras cuentas bancarias y mesa de regalos:',
      bankTransferDetails: 'Banco: BBVA\nBeneficiario: Sofía Martínez / Alejandro Ruiz\nCLABE: 012180012345678901\nCuenta: 1234 5678 9012 3456',
      liverpoolRegistryUrl: 'https://mesaderegalos.liverpool.com.mx',
      amazonRegistryUrl: 'https://www.amazon.com.mx/wedding/registry',
      cardStyle: 'classic-gold',
      envelopeColor: '#2C2B29',
      waxSealText: 'S&A',
      waxSealColor: '#C5A059',
      coverPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
      secondaryPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3',
      audioTitle: 'Acoustic Romance - Guitarra Suave',
      isAudioAutoplay: false,
      audioAutoplay: false,
      welcomeMessage: '¡Nos casamos! Nos hace inmensa ilusión celebrar nuestro amor',
      welcomeSubtitle: 'Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración.',
      hashtag: '#BodaSofyAle2026',
      heroDateFormat: 'dd.mm.aaaa',
      heroCustomDateText: '',
      heroQuote: 'El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.',
      heroVerse: '1 Corintios 13:7',
      heroShowCountdown: false,
      heroShowRsvpButton: false,
      heroShowIcon: false,
      heroShowGuestPill: false,
      heroImageFit: 'cover',
      heroImagePosition: 'center',
      heroOverlayOpacity: 40,
      heroEnableScrollBlur: true,
      rsvpDeadline: '2026-10-30',
      contactPhone: '+52 55 1234 5678',
      contactEmail: 'boda.sofyale@gmail.com',
      enablePhotoGallery: true,
      enableVideos: true,
      enableGuestbook: true,
      enableGiftRegistry: true,
      isPublished: true,
      status: 'active',
      clientEmail: 'sofia.morales@gmail.com',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date(),
    },
    {
      id: 2,
      ownerUid: 'wp-valeria',
      slug: 'boda-valentina-lucas',
      coupleNames: 'Valentina & Lucas',
      brideName: 'Valentina Sterling',
      groomName: 'Lucas Arismendi',
      eventDate: '2026-12-12T18:00:00.000Z',
      ceremonyTime: '18:00',
      receptionTime: '20:00',
      ceremonyLocationName: 'Iglesia San Pedro de Lima',
      ceremonyAddress: 'Jirón Ucayali 391, Centro Histórico de Lima, Perú',
      ceremonyMapsUrl: 'https://maps.google.com/?q=Iglesia+San+Pedro+Lima+Peru',
      receptionLocationName: 'Hacienda San José & Salón Cristal',
      receptionAddress: 'Km 28.5 Carretera Panamericana Sur, Lurín, Lima, Perú',
      receptionMapsUrl: 'https://maps.google.com/?q=Lurin+Lima+Peru',
      dressCode: 'Black Tie / Gala de Noche',
      cardStyle: 'romantic-floral',
      coverPhoto: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3',
      audioTitle: 'Romantic Garden Symphony',
      isAudioAutoplay: false,
      hashtag: '#ValenYLucas2026',
      rsvpDeadline: '2026-11-01',
      enablePhotoGallery: true,
      enableVideos: true,
      enableGuestbook: true,
      enableGiftRegistry: true,
      isPublished: true,
      status: 'planning',
      clientEmail: 'valentina.sterling@empresa.com',
      createdAt: new Date('2026-02-14'),
      updatedAt: new Date(),
    },
    {
      id: 3,
      ownerUid: 'wp-valeria',
      slug: 'boda-isabella-mateo',
      coupleNames: 'Isabella & Mateo',
      brideName: 'Isabella Garza',
      groomName: 'Mateo De la Vega',
      eventDate: '2027-01-23T16:30:00.000Z',
      ceremonyTime: '16:30',
      receptionTime: '18:30',
      ceremonyLocationName: 'Capilla Santísima Cruz de Barranco',
      ceremonyAddress: 'Malecón Pazos, Barranco, Lima, Perú',
      ceremonyMapsUrl: 'https://maps.google.com/?q=Barranco+Lima+Peru',
      receptionLocationName: 'Casona de los Olivos & Valle',
      receptionAddress: 'Valle Sagrado de los Incas, Urubamba, Cusco, Perú',
      receptionMapsUrl: 'https://maps.google.com/?q=Urubamba+Cusco+Peru',
      dressCode: 'Boho Chic / Guayabera & Vestido de Cóctel',
      cardStyle: 'boho-chic',
      coverPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3',
      audioTitle: 'Boho Sunset Acoustic',
      isAudioAutoplay: false,
      hashtag: '#IsaYMateoPorSiempre',
      rsvpDeadline: '2026-12-15',
      enablePhotoGallery: true,
      enableVideos: true,
      enableGuestbook: true,
      enableGiftRegistry: true,
      isPublished: true,
      status: 'planning',
      clientEmail: 'isabella.garza@outlook.com',
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date(),
    },
    {
      id: 4,
      ownerUid: 'wp-camila',
      slug: 'boda-jimena-rodrigo',
      coupleNames: 'Jimena & Rodrigo',
      brideName: 'Jimena Fuentes',
      groomName: 'Rodrigo Albarrán',
      eventDate: '2027-02-27T19:00:00.000Z',
      ceremonyTime: '19:00',
      receptionTime: '20:30',
      ceremonyLocationName: 'Templo Santa María Reina',
      ceremonyAddress: 'Conquistadores 1293, San Isidro, Lima, Perú',
      ceremonyMapsUrl: 'https://maps.google.com/?q=San+Isidro+Lima+Peru',
      receptionLocationName: 'Country Club Lima Hotel - Gran Salón',
      receptionAddress: 'Los Eucaliptos 590, San Isidro, Lima, Perú',
      receptionMapsUrl: 'https://maps.google.com/?q=Country+Club+Lima+Hotel',
      dressCode: 'Dark Velvet & Gold / Rigurosa Etiqueta',
      cardStyle: 'dark-luxury',
      coverPhoto: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3',
      audioTitle: 'Velvet Strings Nocturne',
      isAudioAutoplay: false,
      hashtag: '#JimeYRodri2027',
      rsvpDeadline: '2027-01-20',
      enablePhotoGallery: true,
      enableVideos: true,
      enableGuestbook: true,
      enableGiftRegistry: true,
      isPublished: true,
      status: 'planning',
      clientEmail: 'jimena.fuentes@gmail.com',
      createdAt: new Date('2026-03-10'),
      updatedAt: new Date(),
    }
  ] as any[],
  users: [
    {
      id: 1,
      uid: 'ceo-daviex',
      email: 'daviex14@gmail.com',
      name: 'Daviex (CEO & Fundador)',
      role: 'ceo',
      plan: 'ceo_unlimited',
      agencyName: 'Atelier Nupcial Global Platform',
      phone: '+51 999 000 001',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 2,
      uid: 'wp-valeria',
      email: 'valeria.eventos@atelier.com',
      name: 'Valeria Martínez (Wedding Planner Pro)',
      role: 'wedding_planner',
      plan: 'planner_pro',
      agencyName: 'Valeria Martínez Event Design Studio Lima',
      phone: '+51 984 567 890',
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date(),
    },
    {
      id: 3,
      uid: 'wp-camila',
      email: 'camila.weddings@gmail.com',
      name: 'Camila Rossi (Wedding Planner)',
      role: 'wedding_planner',
      plan: 'planner_starter',
      agencyName: 'Boutique Weddings Perú',
      phone: '+51 912 345 678',
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date(),
    },
    {
      id: 4,
      uid: 'demo-user-master',
      email: 'demo@weddingatelier.com',
      name: 'Sofía & Alejandro',
      role: 'couple',
      plan: 'atelier',
      agencyName: 'Pareja / Novios',
      phone: '+51 987 654 321',
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date(),
    },
    {
      id: 5,
      uid: 'usr-valentina-lucas',
      email: 'valentina.sterling@empresa.com',
      name: 'Valentina & Lucas',
      role: 'couple',
      plan: 'elite',
      agencyName: 'Pareja / Novios',
      phone: '+51 976 543 210',
      createdAt: new Date('2026-02-14'),
      updatedAt: new Date(),
    }
  ] as any[],
  guests: [
    {
      id: 1,
      weddingId: 1,
      accessCode: 'FAM-RUIZ-101',
      fullName: 'Familia Ruiz Morales',
      email: 'familia.ruiz@gmail.com',
      phone: '+51 987 654 321',
      groupName: 'Familia del Novio',
      allocatedPasses: 4,
      confirmedPasses: 4,
      status: 'confirmed',
      attendingCeremony: true,
      attendingReception: true,
      dietaryRestrictions: '1 menú vegetariano',
      companionNames: JSON.stringify(['Carlos Ruiz', 'Elena Morales', 'Mateo Ruiz', 'Valentina Ruiz']),
      suggestedSong: 'Bailando - Enrique Iglesias',
      message: '¡Muchísimas felicidades Sofía y Alejandro! Que Dios bendiga su nuevo hogar. Nos vemos para festejar en grande en Lima.',
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      weddingId: 1,
      accessCode: 'AMP-GOM-202',
      fullName: 'Lic. Mariana Gómez & Acompañante',
      email: 'mariana.gomez@empresa.com',
      phone: '+51 911 223 344',
      groupName: 'Amigos de la Novia',
      allocatedPasses: 2,
      confirmedPasses: 2,
      status: 'confirmed',
      attendingCeremony: true,
      attendingReception: true,
      dietaryRestrictions: 'Sin gluten (Celíaca)',
      companionNames: JSON.stringify(['Mariana Gómez', 'Rodrigo Sánchez']),
      suggestedSong: 'September - Earth, Wind & Fire',
      message: '¡Amiga hermosa! Te verás radiante, no puedo esperar para verte entrar hacia el altar.',
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      weddingId: 1,
      accessCode: 'TEST-INV-303',
      fullName: 'Roberto Mendoza & Familia',
      email: 'roberto.m@gmail.com',
      phone: '+51 944 332 211',
      groupName: 'Amigos Universidad',
      allocatedPasses: 3,
      confirmedPasses: 0,
      status: 'pending',
      attendingCeremony: true,
      attendingReception: true,
      dietaryRestrictions: '',
      companionNames: '[]',
      suggestedSong: '',
      message: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      weddingId: 1,
      accessCode: 'TIO-CAR-404',
      fullName: 'Tío Carlos & Tía Patricia',
      email: 'carlos.martinez@outlook.com',
      groupName: 'Familia de la Novia',
      allocatedPasses: 2,
      confirmedPasses: 2,
      status: 'confirmed',
      attendingCeremony: true,
      attendingReception: true,
      message: 'Los queremos con el alma. Cuenten con nuestro cariño y apoyo siempre.',
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ] as any[],
  gallery: [
    {
      id: 1,
      weddingId: 1,
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
      caption: 'Nuestra sesión de compromiso al atardecer en el viñedo 🌅💍',
      authorName: 'Sofía & Ale (Novios)',
      category: 'preparativos',
      likesCount: 24,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      id: 2,
      weddingId: 1,
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80',
      caption: 'Eligiendo los detalles de las flores y la decoración floral 🌸🌿',
      authorName: 'Sofía (Novia)',
      category: 'preparativos',
      likesCount: 18,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      id: 3,
      weddingId: 1,
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
      caption: 'Los novios compartiendo su primer baile bajo las luces mágicas ✨',
      authorName: 'Carlos Ruiz',
      category: 'fiesta',
      likesCount: 31,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      id: 4,
      weddingId: 1,
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80',
      caption: 'El brindis y bendición de los papás con todos los invitados 🥂',
      authorName: 'Mariana Gómez',
      category: 'brindis',
      likesCount: 15,
      isApproved: true,
      createdAt: new Date(),
    },
    {
      id: 5,
      weddingId: 1,
      url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80',
      caption: '¡Momento del ramo de novia y photobooth de la fiesta! 💐💃',
      authorName: 'Elena Morales',
      category: 'photobooth',
      likesCount: 29,
      isApproved: true,
      createdAt: new Date(),
    }
  ] as any[],
  videos: [
    {
      id: 1,
      weddingId: 1,
      title: 'Nuestra Historia de Amor (Save the Date Oficial)',
      platform: 'youtube',
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      embedId: 'kJQP7kiw5Fk',
      description: 'Un resumen en video de cómo nos conocimos y el camino hacia nuestro gran día.',
      authorName: 'Sofía & Alejandro',
      createdAt: new Date(),
    },
    {
      id: 2,
      weddingId: 1,
      title: 'Reel de la pedida de mano sorpresa en la playa',
      platform: 'instagram',
      videoUrl: 'https://www.instagram.com/reel/C3_sample',
      embedId: 'C3_sample',
      description: 'El momento mágico del "¡Sí, acepto!" en Cancún.',
      authorName: 'Alejandro Ruiz',
      createdAt: new Date(),
    }
  ] as any[],
  wishes: [
    {
      id: 1,
      weddingId: 1,
      guestName: 'Abuela Carmen',
      relationship: 'Familia de la Novia',
      message: 'Mi querida Sofí y Alex, les deseo una vida llena de comprensión, paciencia y mucho amor. Siempre en mis oraciones.',
      isHighlighted: true,
      createdAt: new Date(),
    },
    {
      id: 2,
      weddingId: 1,
      guestName: 'David & Andrea',
      relationship: 'Padrinos de Velación',
      message: '¡Qué honor acompañarlos en esta nueva etapa! Les deseamos lo más hermoso hoy y siempre.',
      isHighlighted: true,
      createdAt: new Date(),
    },
    {
      id: 3,
      weddingId: 1,
      guestName: 'Los amigos del Soccer',
      relationship: 'Amigos del Novio',
      message: '¡El mejor fichaje de la vida Alex! Prometemos dejarlo todo en la pista de baile.',
      isHighlighted: false,
      createdAt: new Date(),
    }
  ] as any[],
  photoComments: [
    {
      id: 1,
      photoId: 1,
      weddingId: 1,
      guestName: 'Mariana Gómez',
      guestCode: 'MARI-GOM-102',
      message: '¡Qué foto tan hermosa! Irradian una felicidad y paz inmensa ✨💛',
      createdAt: new Date(),
    },
    {
      id: 2,
      photoId: 1,
      weddingId: 1,
      guestName: 'David & Andrea',
      guestCode: 'DAV-AND-201',
      message: '¡Ese atardecer quedó espectacular! Los queremos mucho.',
      createdAt: new Date(),
    },
    {
      id: 3,
      photoId: 2,
      weddingId: 1,
      guestName: 'Tía Patricia',
      guestCode: 'TIO-CAR-404',
      message: 'La selección de flores está divina Sofí, todo un acierto 🌸',
      createdAt: new Date(),
    }
  ] as any[]
};

// Check if PostgreSQL is available
let sqlEnabled = false;
export async function testDbConnection() {
  const hasPgConfig = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SQL_HOST || process.env.POSTGRES_HOST || process.env.DB_HOST;
  if (!hasPgConfig) {
    return false;
  }
  try {
    const success = await autoMigrateDatabase();
    if (success) {
      sqlEnabled = true;
      return true;
    }
    const res = await db.select().from(weddingSettings).limit(1);
    sqlEnabled = true;
    return true;
  } catch {
    sqlEnabled = false;
    return false;
  }
}

// 1. Wedding Settings
export async function getWeddingSettings(identifier?: number | string) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      if (identifier) {
        if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
          const idNum = typeof identifier === 'number' ? identifier : Number(identifier);
          const list = await db.select().from(weddingSettings).where(eq(weddingSettings.id, idNum)).limit(1);
          if (list.length > 0) return list[0];
        } else {
          const slugStr = String(identifier).trim().toLowerCase();
          const list = await db.select().from(weddingSettings).where(eq(weddingSettings.slug, slugStr)).limit(1);
          if (list.length > 0) return list[0];
        }
      } else {
        const list = await db.select().from(weddingSettings).orderBy(asc(weddingSettings.id)).limit(1);
        if (list.length > 0) return list[0];
      }
    }
  } catch (err) {
    console.warn('Postgres query fallback to memory for wedding settings');
  }

  // Memory fallback
  if (identifier) {
    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      const idNum = Number(identifier);
      const found = memoryState.weddings.find((w) => w.id === idNum);
      if (found) return found;
    } else {
      const slugStr = String(identifier).trim().toLowerCase();
      const found = memoryState.weddings.find((w) => w.slug === slugStr);
      if (found) return found;
    }
  }
  return memoryState.weddings[0];
}

export async function updateWeddingSettings(
  data: Partial<typeof weddingSettings.$inferInsert>,
  weddingId?: number
) {
  const targetId = weddingId || 1;
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const updated = await db
        .update(weddingSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(weddingSettings.id, targetId))
        .returning();
      if (updated.length > 0) return updated[0];
    }
  } catch (err) {
    console.warn('Postgres update fallback to memory');
  }

  const idx = memoryState.weddings.findIndex((w) => w.id === targetId);
  if (idx !== -1) {
    memoryState.weddings[idx] = {
      ...memoryState.weddings[idx],
      ...data,
      updatedAt: new Date(),
    };
    return memoryState.weddings[idx];
  }
  const newWedding = { id: targetId, ...data, updatedAt: new Date() };
  memoryState.weddings.push(newWedding);
  return newWedding;
}

// 2. User Profiles & Auth
export async function registerOrUpdateUser(params: {
  uid: string;
  email: string;
  password?: string;
  name?: string;
  role?: string;
  plan?: string;
  agencyName?: string;
}) {
  const { uid, email, password, name, role = 'couple', plan = 'atelier', agencyName } = params;
  const isDaviexCeo = email?.toLowerCase().trim() === 'daviex14@gmail.com' || uid === 'ceo-daviex' || uid === 'ceo-daviex-master' || role === 'ceo';
  const defaultRole = isDaviexCeo ? 'ceo' : role;
  const defaultPlan = isDaviexCeo ? 'ceo_unlimited' : plan;
  const defaultName = isDaviexCeo ? 'Daviex (CEO Master)' : (name || 'Usuario Atelier');

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (existing.length > 0) {
        const updatePayload: any = {
          email: email || existing[0].email,
          name: defaultName,
          role: defaultRole,
          plan: defaultPlan,
          agencyName: agencyName !== undefined ? agencyName : existing[0].agencyName,
          updatedAt: new Date(),
        };
        if (password) {
          updatePayload.password = password;
        }
        const updated = await db
          .update(users)
          .set(updatePayload)
          .where(eq(users.uid, uid))
          .returning();
        return updated[0];
      }

      const inserted = await db.insert(users).values({
        uid,
        email: email || (isDaviexCeo ? 'daviex14@gmail.com' : 'usuario@ejemplo.com'),
        password: password || null,
        name: defaultName,
        role: defaultRole,
        plan: defaultPlan,
        agencyName: agencyName || null,
      }).returning();
      return inserted[0];
    }
  } catch (err) {
    console.warn('registerOrUpdateUser fallback to memory');
  }

  let found = memoryState.users.find((u) => u.uid === uid || (email && u.email?.toLowerCase() === email.toLowerCase()));
  if (found) {
    found.email = email || found.email;
    found.name = defaultName;
    found.role = defaultRole;
    found.plan = defaultPlan;
    if (agencyName !== undefined) found.agencyName = agencyName;
    if (password) found.password = password;
    found.updatedAt = new Date();
    return found;
  }

  const newUser = {
    id: memoryState.users.length + 1,
    uid,
    email: email || (isDaviexCeo ? 'daviex14@gmail.com' : 'usuario@ejemplo.com'),
    password: password || null,
    name: defaultName,
    role: defaultRole,
    plan: defaultPlan,
    agencyName: agencyName || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryState.users.push(newUser);
  return newUser;
}

export async function verifyDatabaseUserCredentials(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const list = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
      if (list.length > 0) {
        const user = list[0];
        if (user.password && user.password === password) {
          return user;
        }
      }
    }
  } catch (err) {
    console.warn('verifyDatabaseUserCredentials fallback to memory');
  }

  const found = memoryState.users.find((u) => u.email?.toLowerCase() === cleanEmail);
  if (found && found.password && found.password === password) {
    return found;
  }
  return null;
}

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  return registerOrUpdateUser({ uid, email, name });
}

export async function getUserProfile(uid: string) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const list = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (list.length > 0) return list[0];
    }
  } catch (err) {
    console.warn('getUserProfile fallback to memory');
  }
  return memoryState.users.find((u) => u.uid === uid) || null;
}

export async function updateUserPlan(uid: string, plan: string) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const updated = await db.update(users).set({ plan, updatedAt: new Date() }).where(eq(users.uid, uid)).returning();
      if (updated.length > 0) return updated[0];
    }
  } catch (err) {
    console.warn('updateUserPlan fallback to memory');
  }
  const u = memoryState.users.find((user) => user.uid === uid);
  if (u) {
    u.plan = plan;
    u.updatedAt = new Date();
    return u;
  }
  return null;
}

export async function getUserWeddings(ownerUid: string) {
  const user = memoryState.users.find((u) => u.uid === ownerUid);
  const isCeo = user?.role === 'ceo' || user?.email === 'daviex14@gmail.com' || ownerUid === 'ceo-daviex';

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      let weddingList;
      if (isCeo) {
        weddingList = await db.select().from(weddingSettings).orderBy(desc(weddingSettings.id));
      } else {
        weddingList = await db
          .select()
          .from(weddingSettings)
          .where(or(eq(weddingSettings.ownerUid, ownerUid), eq(weddingSettings.id, 1)))
          .orderBy(desc(weddingSettings.id));
      }

      return await Promise.all(
        weddingList.map(async (w) => {
          const guestList = await db.select().from(guests).where(eq(guests.weddingId, w.id));
          const owner = memoryState.users.find((u) => u.uid === w.ownerUid);
          return {
            id: w.id,
            ownerUid: w.ownerUid,
            ownerName: owner?.name || 'Organizador',
            ownerEmail: owner?.email || '',
            coupleNames: w.coupleNames,
            hashtag: w.hashtag || '',
            eventDate: w.eventDate,
            slug: w.slug || `boda-${w.id}`,
            cardStyle: w.cardStyle as any,
            isPublished: w.isPublished ?? true,
            status: (w as any).status || 'active',
            clientEmail: (w as any).clientEmail || '',
            totalGuests: guestList.length,
            confirmedGuests: guestList.filter((g) => g.status === 'confirmed').length,
            coverPhoto: w.coverPhoto,
          };
        })
      );
    }
  } catch (err) {
    console.warn('getUserWeddings fallback to memory');
  }

  // Memory fallback
  const list = isCeo 
    ? memoryState.weddings 
    : memoryState.weddings.filter((w) => w.ownerUid === ownerUid || w.id === 1);

  return list.map((w) => {
    const guestList = memoryState.guests.filter((g) => g.weddingId === w.id);
    const owner = memoryState.users.find((u) => u.uid === w.ownerUid);
    return {
      id: w.id,
      ownerUid: w.ownerUid,
      ownerName: owner?.name || 'Organizador',
      ownerEmail: owner?.email || '',
      coupleNames: w.coupleNames,
      hashtag: w.hashtag || '',
      eventDate: w.eventDate,
      slug: w.slug || `boda-${w.id}`,
      cardStyle: w.cardStyle,
      isPublished: w.isPublished ?? true,
      status: w.status || 'active',
      clientEmail: w.clientEmail || '',
      totalGuests: guestList.length,
      confirmedGuests: guestList.filter((g) => g.status === 'confirmed').length,
      coverPhoto: w.coverPhoto,
    };
  });
}

// ----------------------------------------------------
// CEO & SUPERADMIN MASTER QUERIES
// ----------------------------------------------------

export async function getCeoGlobalStats() {
  const totalWeddings = memoryState.weddings.length;
  const totalUsers = memoryState.users.length;
  const weddingPlanners = memoryState.users.filter((u) => u.role === 'wedding_planner' || u.plan?.startsWith('planner_')).length;
  const couples = memoryState.users.filter((u) => u.role === 'couple' || !u.role || u.role === 'admin').length;
  const totalGuests = memoryState.guests.length;
  const confirmedGuests = memoryState.guests.filter((g) => g.status === 'confirmed').length;
  const totalPasses = memoryState.guests.reduce((acc, g) => acc + (g.allocatedPasses || 1), 0);
  const confirmedPasses = memoryState.guests.reduce((acc, g) => acc + (g.confirmedPasses || 0), 0);

  // Revenue estimation (USD)
  let estimatedRevenue = 0;
  memoryState.users.forEach((u) => {
    if (u.plan === 'atelier') estimatedRevenue += 29;
    if (u.plan === 'elite') estimatedRevenue += 59;
    if (u.plan === 'planner_starter') estimatedRevenue += 89;
    if (u.plan === 'planner_pro') estimatedRevenue += 179;
  });

  const planBreakdown = {
    free: memoryState.users.filter((u) => u.plan === 'free').length,
    atelier: memoryState.users.filter((u) => u.plan === 'atelier').length,
    elite: memoryState.users.filter((u) => u.plan === 'elite').length,
    planner_starter: memoryState.users.filter((u) => u.plan === 'planner_starter').length,
    planner_pro: memoryState.users.filter((u) => u.plan === 'planner_pro').length,
    ceo_unlimited: memoryState.users.filter((u) => u.plan === 'ceo_unlimited').length,
  };

  return {
    totalWeddings,
    totalUsers,
    weddingPlanners,
    couples,
    totalGuests,
    confirmedGuests,
    totalPasses,
    confirmedPasses,
    estimatedRevenue,
    planBreakdown,
  };
}

export async function getAllUsersForCeo() {
  return memoryState.users.map((u) => {
    const userWeddings = memoryState.weddings.filter((w) => w.ownerUid === u.uid);
    return {
      ...u,
      weddingsCount: userWeddings.length,
      weddings: userWeddings.map((w) => ({
        id: w.id,
        coupleNames: w.coupleNames,
        eventDate: w.eventDate,
      })),
    };
  });
}

export async function getAllWeddingsForCeo() {
  return memoryState.weddings.map((w) => {
    const guestList = memoryState.guests.filter((g) => g.weddingId === w.id);
    const owner = memoryState.users.find((u) => u.uid === w.ownerUid);
    return {
      ...w,
      ownerName: owner?.name || 'Desconocido',
      ownerEmail: owner?.email || 'N/A',
      ownerRole: owner?.role || 'couple',
      totalGuests: guestList.length,
      confirmedGuests: guestList.filter((g) => g.status === 'confirmed').length,
    };
  });
}

export async function updateUserRoleByCeo(uid: string, role: string) {
  const user = memoryState.users.find((u) => u.uid === uid);
  if (user) {
    user.role = role;
    user.updatedAt = new Date();
    return user;
  }
  return null;
}

export async function updateUserPlanByCeo(uid: string, plan: string) {
  const user = memoryState.users.find((u) => u.uid === uid);
  if (user) {
    user.plan = plan;
    user.updatedAt = new Date();
    return user;
  }
  return null;
}

export async function updateUserByCeo(
  uid: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    plan?: string;
    agencyName?: string;
    phone?: string;
    password?: string;
  }
) {
  let user = memoryState.users.find((u) => u.uid === uid);
  if (user) {
    if (data.name !== undefined) user.name = data.name.trim();
    if (data.email !== undefined) user.email = data.email.trim().toLowerCase();
    if (data.role !== undefined) user.role = data.role;
    if (data.plan !== undefined) user.plan = data.plan;
    if (data.agencyName !== undefined) user.agencyName = data.agencyName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.password !== undefined && data.password.trim()) user.password = data.password.trim();
    user.updatedAt = new Date();
    return user;
  }
  return null;
}

export async function createUserByCeo(data: {
  name: string;
  email: string;
  password?: string;
  role?: string;
  plan?: string;
  agencyName?: string;
  phone?: string;
}) {
  const cleanEmail = data.email.trim().toLowerCase();
  const existing = memoryState.users.find((u) => u.email === cleanEmail);
  if (existing) {
    return updateUserByCeo(existing.uid, data);
  }

  const generatedUid = 'usr-' + Buffer.from(cleanEmail).toString('base64').substring(0, 12).toLowerCase().replace(/[^a-z0-9]/g, 'x');
  const newUser = {
    id: memoryState.users.length + 1,
    uid: generatedUid,
    email: cleanEmail,
    name: data.name.trim() || 'Usuario',
    password: data.password?.trim() || 'Atelier2026!',
    role: data.role || (data.plan?.startsWith('planner_') ? 'wedding_planner' : 'couple'),
    plan: data.plan || 'atelier',
    agencyName: data.agencyName || undefined,
    phone: data.phone || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryState.users.unshift(newUser);
  return newUser;
}

export async function bulkImportUsersByCeo(
  usersList: Array<{
    name?: string;
    email?: string;
    role?: string;
    plan?: string;
    agencyName?: string;
    phone?: string;
    password?: string;
  }>,
  defaults?: { defaultPlan?: string; defaultRole?: string }
) {
  const created: any[] = [];
  for (const item of usersList) {
    if (!item.email || !item.email.includes('@')) continue;
    const user = await createUserByCeo({
      name: item.name || 'Organizador',
      email: item.email,
      password: item.password || 'Atelier2026!',
      role: item.role || defaults?.defaultRole || (defaults?.defaultPlan?.startsWith('planner_') ? 'wedding_planner' : 'couple'),
      plan: item.plan || defaults?.defaultPlan || 'atelier',
      agencyName: item.agencyName,
      phone: item.phone,
    });
    if (user) created.push(user);
  }
  return { count: created.length, users: created };
}

export async function bulkUpdateUsersByCeo(
  uids: string[],
  action: 'plan' | 'role' | 'delete',
  value?: string
) {
  if (action === 'delete') {
    memoryState.users = memoryState.users.filter((u) => !uids.includes(u.uid) || u.role === 'ceo');
    return { success: true, count: uids.length };
  }

  let updatedCount = 0;
  for (const uid of uids) {
    const user = memoryState.users.find((u) => u.uid === uid);
    if (!user) continue;
    if (action === 'plan' && value) {
      user.plan = value;
      user.updatedAt = new Date();
      updatedCount++;
    } else if (action === 'role' && value) {
      user.role = value;
      user.updatedAt = new Date();
      updatedCount++;
    }
  }
  return { success: true, count: updatedCount };
}

export async function deleteUserByCeo(uid: string) {
  const user = memoryState.users.find((u) => u.uid === uid);
  if (user?.role === 'ceo' || user?.email === 'daviex14@gmail.com') {
    throw new Error('No es posible eliminar la cuenta principal de CEO.');
  }
  memoryState.users = memoryState.users.filter((u) => u.uid !== uid);
  return { success: true };
}

export async function transferWeddingOwnership(weddingId: number, newOwnerUid: string) {
  const wedding = memoryState.weddings.find((w) => w.id === weddingId);
  if (wedding) {
    wedding.ownerUid = newOwnerUid;
    wedding.updatedAt = new Date();
    return wedding;
  }
  throw new Error('Boda no encontrada');
}

export async function deleteWeddingByCeo(weddingId: number) {
  if (weddingId === 1) {
    throw new Error('No se puede eliminar la boda de demostración principal.');
  }
  memoryState.weddings = memoryState.weddings.filter((w) => w.id !== weddingId);
  memoryState.guests = memoryState.guests.filter((g) => g.weddingId !== weddingId);
  memoryState.gallery = memoryState.gallery.filter((g) => g.weddingId !== weddingId);
  memoryState.videos = memoryState.videos.filter((v) => v.weddingId !== weddingId);
  memoryState.wishes = memoryState.wishes.filter((w) => w.weddingId !== weddingId);
  return { success: true };
}

export async function updateWeddingStatus(weddingId: number, status: string, clientEmail?: string) {
  const wedding = memoryState.weddings.find((w) => w.id === weddingId);
  if (wedding) {
    wedding.status = status;
    if (clientEmail !== undefined) {
      wedding.clientEmail = clientEmail;
    }
    wedding.updatedAt = new Date();
    return wedding;
  }
  throw new Error('Boda no encontrada');
}

export async function createWedding(data: typeof weddingSettings.$inferInsert) {
  if (!data.slug) {
    const cleanNames = (data.coupleNames || 'boda')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    data.slug = `${cleanNames}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  // Ensure non-null column defaults are present
  const payload: typeof weddingSettings.$inferInsert = {
    coupleNames: data.coupleNames || 'Sofía & Alejandro',
    eventDate: data.eventDate || '2026-11-28',
    eventTime: data.eventTime || '17:00',
    ceremonyVenue: data.ceremonyVenue || 'Parroquia San Francisco de Asís',
    ceremonyAddress: data.ceremonyAddress || 'Calle de los Olivos 142, Centro Histórico',
    receptionVenue: data.receptionVenue || 'Hacienda Los Arcángeles',
    receptionAddress: data.receptionAddress || 'Km 14.5 Carretera Real, Valle Encantado',
    coverPhoto: data.coverPhoto || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    cardStyle: data.cardStyle || 'classic-gold',
    isPublished: data.isPublished ?? true,
    ...data,
  };

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const inserted = await db.insert(weddingSettings).values(payload).returning();
      if (inserted.length > 0) return inserted[0];
    }
  } catch (err) {
    console.warn('createWedding database insert warning, falling back to memory state:', err);
  }

  const newId = memoryState.weddings.length + 1;
  const newWedding = {
    id: newId,
    ...payload,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryState.weddings.push(newWedding);
  return newWedding;
}

export async function deleteWedding(weddingId: number, ownerUid?: string) {
  if (weddingId === 1) {
    throw new Error('No se puede eliminar la plantilla de demostración principal.');
  }

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      await db.delete(guests).where(eq(guests.weddingId, weddingId));
      await db.delete(galleryPhotos).where(eq(galleryPhotos.weddingId, weddingId));
      await db.delete(weddingVideos).where(eq(weddingVideos.weddingId, weddingId));
      await db.delete(guestbookWishes).where(eq(guestbookWishes.weddingId, weddingId));
      await db.delete(weddingSettings).where(eq(weddingSettings.id, weddingId));
      return { success: true };
    }
  } catch (err) {
    console.warn('deleteWedding fallback to memory');
  }

  memoryState.weddings = memoryState.weddings.filter((w) => w.id !== weddingId);
  memoryState.guests = memoryState.guests.filter((g) => g.weddingId !== weddingId);
  memoryState.gallery = memoryState.gallery.filter((g) => g.weddingId !== weddingId);
  memoryState.videos = memoryState.videos.filter((v) => v.weddingId !== weddingId);
  memoryState.wishes = memoryState.wishes.filter((w) => w.weddingId !== weddingId);
  return { success: true };
}

// 3. Guests
export async function getAllGuests(search?: string, statusFilter?: string, weddingId: number = 1) {
  const normalize = (str: string = '') =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      let baseConditions = [eq(guests.weddingId, weddingId)];
      if (statusFilter && statusFilter !== 'all') {
        baseConditions.push(eq(guests.status, statusFilter));
      }
      if (search && search.trim() !== '') {
        const tokens = search.trim().split(/\s+/).filter(Boolean);
        const tokenConditions = tokens.map((tok) => {
          const t = `%${tok}%`;
          return or(
            ilike(guests.fullName, t),
            ilike(guests.accessCode, t),
            ilike(guests.groupName, t),
            ilike(guests.email, t),
            ilike(guests.phone, t),
            ilike(guests.companionNames, t)
          );
        });
        return await db.select().from(guests).where(and(...baseConditions, ...tokenConditions)).orderBy(asc(guests.fullName));
      }
      return await db.select().from(guests).where(and(...baseConditions)).orderBy(asc(guests.fullName));
    }
  } catch (err) {
    console.warn('getAllGuests fallback to memory');
  }

  let list = memoryState.guests.filter((g) => g.weddingId === weddingId);
  if (statusFilter && statusFilter !== 'all') {
    list = list.filter((g) => g.status === statusFilter);
  }
  if (search && search.trim() !== '') {
    const rawTokens = search.trim().split(/\s+/).filter(Boolean);
    const normalizedTokens = rawTokens.map(normalize);

    list = list.filter((g) => {
      const combined = normalize(
        `${g.fullName || ''} ${g.accessCode || ''} ${g.groupName || ''} ${g.email || ''} ${g.phone || ''} ${g.companionNames || ''}`
      );
      // Ensure all search tokens exist in the combined guest fields
      return normalizedTokens.every((tok) => combined.includes(tok));
    });
  }
  return list;
}

export async function getGuestByCode(code: string, weddingId?: number) {
  const cleanCode = code.trim().toUpperCase();
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      if (weddingId) {
        const list = await db
          .select()
          .from(guests)
          .where(and(eq(guests.weddingId, weddingId), or(eq(guests.accessCode, cleanCode), ilike(guests.accessCode, cleanCode))))
          .limit(1);
        if (list.length > 0) return list[0];
      } else {
        const list = await db
          .select()
          .from(guests)
          .where(or(eq(guests.accessCode, cleanCode), ilike(guests.accessCode, cleanCode)))
          .limit(1);
        if (list.length > 0) return list[0];
      }
    }
  } catch (err) {
    console.warn('getGuestByCode fallback to memory');
  }

  const found = memoryState.guests.find((g) => {
    const matchCode = g.accessCode?.toUpperCase() === cleanCode;
    if (weddingId) {
      return matchCode && g.weddingId === weddingId;
    }
    return matchCode;
  });
  return found || null;
}

export async function createGuest(data: typeof guests.$inferInsert) {
  if (!data.weddingId) data.weddingId = 1;
  if (!data.accessCode) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const prefix = (data.fullName || 'INV').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'INV');
    data.accessCode = `${prefix}-${randomDigits}`;
  } else {
    data.accessCode = data.accessCode.trim().toUpperCase();
  }

  const normalizedData = {
    ...data,
    allocatedPasses: Number(data.allocatedPasses) || 1,
    confirmedPasses: Number(data.confirmedPasses) || 0,
    status: (data.status as any) || 'pending',
  };

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const inserted = await db.insert(guests).values(normalizedData).returning();
      if (inserted.length > 0) return inserted[0];
    }
  } catch (err) {
    console.warn('createGuest fallback to memory');
  }

  const newGuest = {
    id: memoryState.guests.length + 1,
    ...normalizedData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryState.guests.push(newGuest);
  return newGuest;
}

export async function createGuestsBulk(guestList: Array<typeof guests.$inferInsert>) {
  const created: any[] = [];

  for (const item of guestList) {
    if (!item.weddingId) item.weddingId = 1;
    if (!item.accessCode) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const prefix = (item.fullName || 'INV').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'INV');
      item.accessCode = `${prefix}-${randomDigits}`;
    } else {
      item.accessCode = item.accessCode.trim().toUpperCase();
    }

    const normalizedItem = {
      ...item,
      allocatedPasses: Number(item.allocatedPasses) || 1,
      confirmedPasses: Number(item.confirmedPasses) || 0,
      status: (item.status as any) || 'pending',
    };

    try {
      if (sqlEnabled || process.env.SQL_HOST) {
        const inserted = await db.insert(guests).values(normalizedItem).returning();
        if (inserted.length > 0) {
          created.push(inserted[0]);
          continue;
        }
      }
    } catch (err) {
      console.warn('createGuestsBulk single insert fallback to memory');
    }

    const newGuest = {
      id: memoryState.guests.length + 1,
      ...normalizedItem,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryState.guests.push(newGuest);
    created.push(newGuest);
  }

  return created;
}

export async function updateGuest(id: number, data: Partial<typeof guests.$inferInsert>) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const updated = await db.update(guests).set({ ...data, updatedAt: new Date() }).where(eq(guests.id, id)).returning();
      if (updated.length > 0) return updated[0];
    }
  } catch (err) {
    console.warn('updateGuest fallback to memory');
  }

  const idx = memoryState.guests.findIndex((g) => g.id === id);
  if (idx !== -1) {
    memoryState.guests[idx] = { ...memoryState.guests[idx], ...data, updatedAt: new Date() };
    return memoryState.guests[idx];
  }
  return null;
}

export async function deleteGuest(id: number) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      await db.delete(guests).where(eq(guests.id, id));
      return { success: true };
    }
  } catch (err) {
    console.warn('deleteGuest fallback to memory');
  }

  memoryState.guests = memoryState.guests.filter((g) => g.id !== id);
  return { success: true };
}

export async function submitRsvp(
  accessCode: string,
  payload: {
    weddingId?: number;
    status: 'confirmed' | 'declined';
    confirmedPasses: number;
    attendingCeremony: boolean;
    attendingReception: boolean;
    dietaryRestrictions?: string;
    companionNames?: string[];
    suggestedSong?: string;
    message?: string;
    phone?: string;
    email?: string;
  }
) {
  const guest = await getGuestByCode(accessCode, payload.weddingId);
  if (!guest) {
    throw new Error('Código de invitación no encontrado.');
  }

  const companionNamesJson = JSON.stringify(payload.companionNames || []);

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const updated = await db
        .update(guests)
        .set({
          status: payload.status,
          confirmedPasses: payload.status === 'confirmed' ? Math.min(payload.confirmedPasses, guest.allocatedPasses) : 0,
          attendingCeremony: payload.attendingCeremony,
          attendingReception: payload.attendingReception,
          dietaryRestrictions: payload.dietaryRestrictions || '',
          companionNames: companionNamesJson,
          suggestedSong: payload.suggestedSong || '',
          message: payload.message || '',
          phone: payload.phone || guest.phone,
          email: payload.email || guest.email,
          confirmedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(guests.id, guest.id))
        .returning();

      if (payload.message && payload.message.trim().length > 3) {
        await db.insert(guestbookWishes).values({
          weddingId: guest.weddingId || 1,
          guestName: guest.fullName,
          relationship: guest.groupName || 'Invitado',
          message: payload.message.trim(),
        });
      }
      return updated[0];
    }
  } catch (err) {
    console.warn('submitRsvp fallback to memory');
  }

  const idx = memoryState.guests.findIndex((g) => g.id === guest.id);
  if (idx !== -1) {
    memoryState.guests[idx] = {
      ...memoryState.guests[idx],
      status: payload.status,
      confirmedPasses: payload.status === 'confirmed' ? Math.min(payload.confirmedPasses, guest.allocatedPasses) : 0,
      attendingCeremony: payload.attendingCeremony,
      attendingReception: payload.attendingReception,
      dietaryRestrictions: payload.dietaryRestrictions || '',
      companionNames: companionNamesJson,
      suggestedSong: payload.suggestedSong || '',
      message: payload.message || '',
      phone: payload.phone || guest.phone,
      email: payload.email || guest.email,
      confirmedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  if (payload.message && payload.message.trim().length > 3) {
    memoryState.wishes.unshift({
      id: memoryState.wishes.length + 1,
      weddingId: guest.weddingId || 1,
      guestName: guest.fullName,
      relationship: guest.groupName || 'Invitado',
      message: payload.message.trim(),
      isHighlighted: false,
      createdAt: new Date(),
    });
  }

  return memoryState.guests[idx];
}

// 3.1 Open / Generic RSVP Registration (Invitación Abierta)
export async function submitOpenRsvp(payload: {
  weddingId: number;
  fullName: string;
  phone?: string;
  email?: string;
  status: 'confirmed' | 'declined';
  confirmedPasses: number;
  attendingCeremony: boolean;
  attendingReception: boolean;
  dietaryRestrictions?: string;
  companionNames?: string[];
  suggestedSong?: string;
  message?: string;
}) {
  if (!payload.fullName || !payload.fullName.trim()) {
    throw new Error('El nombre completo es requerido.');
  }

  // Generate unique clean access code (e.g. REG-GARCIA-742)
  const nameParts = payload.fullName.trim().toUpperCase().split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
  const cleanPrefix = lastName.replace(/[^A-Z]/g, '').slice(0, 6) || 'INVITADO';
  const randomNum = Math.floor(100 + Math.random() * 900);
  const autoCode = `REG-${cleanPrefix}-${randomNum}`;

  const companionNamesJson = JSON.stringify(payload.companionNames || []);
  const allocated = Math.max(payload.confirmedPasses || 1, 1);

  const guestData = {
    weddingId: payload.weddingId || 1,
    fullName: payload.fullName.trim(),
    accessCode: autoCode,
    groupName: 'Invitación Genérica / Registro Abierto',
    allocatedPasses: allocated,
    confirmedPasses: payload.status === 'confirmed' ? payload.confirmedPasses : 0,
    status: payload.status,
    phone: payload.phone || '',
    email: payload.email || '',
    attendingCeremony: payload.attendingCeremony,
    attendingReception: payload.attendingReception,
    dietaryRestrictions: payload.dietaryRestrictions || '',
    companionNames: companionNamesJson,
    suggestedSong: payload.suggestedSong || '',
    message: payload.message || '',
    confirmedAt: new Date(),
  };

  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const inserted = await db.insert(guests).values(guestData).returning();
      if (inserted.length > 0) {
        if (payload.message && payload.message.trim().length > 3) {
          await db.insert(guestbookWishes).values({
            weddingId: payload.weddingId || 1,
            guestName: payload.fullName.trim(),
            relationship: 'Invitado Registrado',
            message: payload.message.trim(),
          });
        }
        return inserted[0];
      }
    }
  } catch (err) {
    console.warn('submitOpenRsvp fallback to memory');
  }

  const newGuest = {
    id: memoryState.guests.length + 1,
    ...guestData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryState.guests.push(newGuest);

  if (payload.message && payload.message.trim().length > 3) {
    memoryState.wishes.unshift({
      id: memoryState.wishes.length + 1,
      weddingId: payload.weddingId || 1,
      guestName: payload.fullName.trim(),
      relationship: 'Invitado Registrado',
      message: payload.message.trim(),
      isHighlighted: false,
      createdAt: new Date(),
    });
  }

  return newGuest;
}

// 4. Gallery Photos
export async function getGalleryPhotos(category?: string, weddingId: number = 1) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      let conditions = [eq(galleryPhotos.weddingId, weddingId)];
      if (category && category !== 'all') {
        conditions.push(eq(galleryPhotos.category, category));
      }
      return await db
        .select()
        .from(galleryPhotos)
        .where(and(...conditions))
        .orderBy(desc(galleryPhotos.id));
    }
  } catch (err) {
    console.warn('getGalleryPhotos fallback to memory');
  }

  let list = memoryState.gallery.filter((p) => p.weddingId === weddingId);
  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category);
  }
  return list;
}

export async function addGalleryPhoto(data: typeof galleryPhotos.$inferInsert) {
  if (!data.weddingId) data.weddingId = 1;
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const inserted = await db.insert(galleryPhotos).values(data).returning();
      if (inserted.length > 0) return inserted[0];
    }
  } catch (err) {
    console.warn('addGalleryPhoto fallback to memory');
  }

  const newPhoto = {
    id: memoryState.gallery.length + 1,
    ...data,
    likesCount: 0,
    isApproved: true,
    createdAt: new Date(),
  };
  memoryState.gallery.unshift(newPhoto);
  return newPhoto;
}

export async function likePhoto(id: number) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const photo = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, id)).limit(1);
      if (photo.length > 0) {
        const updated = await db
          .update(galleryPhotos)
          .set({ likesCount: (photo[0].likesCount || 0) + 1 })
          .where(eq(galleryPhotos.id, id))
          .returning();
        return updated[0];
      }
    }
  } catch (err) {
    console.warn('likePhoto fallback to memory');
  }

  const found = memoryState.gallery.find((p) => p.id === id);
  if (found) {
    found.likesCount = (found.likesCount || 0) + 1;
    return found;
  }
  return null;
}

export async function deleteGalleryPhoto(id: number) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
      await db.delete(photoComments).where(eq(photoComments.photoId, id));
      return { success: true };
    }
  } catch (err) {
    console.warn('deleteGalleryPhoto fallback to memory');
  }
  memoryState.gallery = memoryState.gallery.filter((p) => p.id !== id);
  memoryState.photoComments = memoryState.photoComments.filter((c) => c.photoId !== id);
  return { success: true };
}

// 4.1 Photo Comments
export async function getPhotoComments(photoId: number, weddingId: number = 1) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      return await db
        .select()
        .from(photoComments)
        .where(and(eq(photoComments.photoId, photoId), eq(photoComments.weddingId, weddingId)))
        .orderBy(asc(photoComments.createdAt));
    }
  } catch (err) {
    console.warn('getPhotoComments fallback to memory');
  }

  return memoryState.photoComments
    .filter((c) => c.photoId === photoId && (c.weddingId === weddingId || !c.weddingId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getAllPhotoCommentsForWedding(weddingId: number = 1) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      return await db
        .select()
        .from(photoComments)
        .where(eq(photoComments.weddingId, weddingId))
        .orderBy(desc(photoComments.id));
    }
  } catch (err) {
    console.warn('getAllPhotoCommentsForWedding fallback to memory');
  }

  return [...memoryState.photoComments]
    .filter((c) => c.weddingId === weddingId || !c.weddingId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addPhotoComment(data: typeof photoComments.$inferInsert) {
  if (!data.weddingId) data.weddingId = 1;
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const inserted = await db.insert(photoComments).values(data).returning();
      if (inserted.length > 0) return inserted[0];
    }
  } catch (err) {
    console.warn('addPhotoComment fallback to memory');
  }

  const newComment = {
    id: memoryState.photoComments.length + 1,
    photoId: data.photoId,
    weddingId: data.weddingId || 1,
    guestName: data.guestName || 'Invitado Especial',
    guestCode: data.guestCode || '',
    message: data.message,
    createdAt: new Date(),
  };
  memoryState.photoComments.push(newComment);
  return newComment;
}

export async function deletePhotoComment(id: number) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      await db.delete(photoComments).where(eq(photoComments.id, id));
      return { success: true };
    }
  } catch (err) {
    console.warn('deletePhotoComment fallback to memory');
  }
  memoryState.photoComments = memoryState.photoComments.filter((c) => c.id !== id);
  return { success: true };
}

// 5. Wedding Videos
export async function getAllVideos(weddingId: number = 1) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      return await db
        .select()
        .from(weddingVideos)
        .where(eq(weddingVideos.weddingId, weddingId))
        .orderBy(desc(weddingVideos.id));
    }
  } catch (err) {
    console.warn('getAllVideos fallback to memory');
  }
  return memoryState.videos.filter((v) => v.weddingId === weddingId);
}

export async function addWeddingVideo(data: typeof weddingVideos.$inferInsert) {
  if (!data.weddingId) data.weddingId = 1;
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const inserted = await db.insert(weddingVideos).values(data).returning();
      if (inserted.length > 0) return inserted[0];
    }
  } catch (err) {
    console.warn('addWeddingVideo fallback to memory');
  }

  const newVideo = {
    id: memoryState.videos.length + 1,
    ...data,
    createdAt: new Date(),
  };
  memoryState.videos.unshift(newVideo);
  return newVideo;
}

export async function deleteWeddingVideo(id: number) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      await db.delete(weddingVideos).where(eq(weddingVideos.id, id));
      return { success: true };
    }
  } catch (err) {
    console.warn('deleteWeddingVideo fallback to memory');
  }
  memoryState.videos = memoryState.videos.filter((v) => v.id !== id);
  return { success: true };
}

// 6. Wishes
export async function getWishes(weddingId: number = 1) {
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      return await db
        .select()
        .from(guestbookWishes)
        .where(eq(guestbookWishes.weddingId, weddingId))
        .orderBy(desc(guestbookWishes.id));
    }
  } catch (err) {
    console.warn('getWishes fallback to memory');
  }
  return memoryState.wishes.filter((w) => w.weddingId === weddingId);
}

export async function addWish(data: typeof guestbookWishes.$inferInsert) {
  if (!data.weddingId) data.weddingId = 1;
  try {
    if (sqlEnabled || process.env.SQL_HOST) {
      const inserted = await db.insert(guestbookWishes).values(data).returning();
      if (inserted.length > 0) return inserted[0];
    }
  } catch (err) {
    console.warn('addWish fallback to memory');
  }

  const newWish = {
    id: memoryState.wishes.length + 1,
    ...data,
    isHighlighted: false,
    createdAt: new Date(),
  };
  memoryState.wishes.unshift(newWish);
  return newWish;
}

// 7. Plan Editor & Pricing Config
import { SUBSCRIPTION_PLANS } from '../data/plans.ts';

let customPlansMemory = [...SUBSCRIPTION_PLANS];

export async function getCustomPlans() {
  return customPlansMemory;
}

export async function updateCustomPlan(planId: string, updates: any) {
  const idx = customPlansMemory.findIndex((p) => p.id === planId);
  if (idx !== -1) {
    customPlansMemory[idx] = {
      ...customPlansMemory[idx],
      ...updates,
    };
    return customPlansMemory[idx];
  }
  throw new Error('Plan no encontrado');
}

// 8. Seed Initial Data
export async function seedInitialData() {
  try {
    await testDbConnection();
  } catch (err) {
    console.warn('Database connection check complete. Using available storage engine.');
  }
}
