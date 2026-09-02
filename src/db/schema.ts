import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Firebase Auth or Local Auth linked)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Auth UID
  email: text('email').notNull(),
  password: text('password'),
  name: text('name'),
  role: text('role').default('couple'), // 'ceo', 'wedding_planner', 'couple', 'admin'
  plan: text('plan').default('free'), // 'free', 'atelier', 'elite', 'planner_starter', 'planner_pro', 'ceo_unlimited'
  agencyName: text('agency_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Wedding global configuration
export const weddingSettings = pgTable('wedding_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  ownerUid: text('owner_uid'),
  slug: text('slug'),
  isPublished: boolean('is_published').default(true),
  coupleNames: text('couple_names').notNull().default('Sofía & Alejandro'),
  hashtag: text('hashtag').default('#BodaSofyAle2026'),
  eventDate: text('event_date').notNull().default('2026-11-28'),
  eventTime: text('event_time').notNull().default('17:00'),
  ceremonyVenue: text('ceremony_venue').notNull().default('Parroquia San Francisco de Asís'),
  ceremonyAddress: text('ceremony_address').notNull().default('Calle de los Olivos 142, Centro Histórico'),
  ceremonyMapsUrl: text('ceremony_maps_url').default('https://maps.google.com/?q=San+Francisco+Church'),
  ceremonyEmbedUrl: text('ceremony_embed_url').default(''),
  ceremonyPlaceQuery: text('ceremony_place_query').default('Parroquia San Francisco de Asís'),
  ceremonyTime: text('ceremony_time').default('17:00'),
  receptionVenue: text('reception_venue').notNull().default('Hacienda Los Arcángeles'),
  receptionAddress: text('reception_address').notNull().default('Km 14.5 Carretera Real, Valle Encantado'),
  receptionMapsUrl: text('reception_maps_url').default('https://maps.google.com/?q=Hacienda+Los+Arcangeles'),
  receptionEmbedUrl: text('reception_embed_url').default(''),
  receptionPlaceQuery: text('reception_place_query').default('Hacienda Los Arcángeles'),
  receptionTime: text('reception_time').default('19:30'),
  dressCode: text('dress_code').default('Formal / Traje Oscuro y Vestido Largo'),
  dressCodeDescription: text('dress_code_description').default('Agradecemos no usar blanco, marfil o champagne reservado para la novia.'),
  dressCodePalette: text('dress_code_palette').default('["#1C2D37", "#9E7D47", "#D4AF37", "#D8C7B8", "#4A5B52"]'),
  dressCodeMenTitle: text('dress_code_men_title').default('Para Ellos (Caballeros)'),
  dressCodeMenDescription: text('dress_code_men_description').default('Traje formal completo en tonos oscuros, camisa de vestir, corbata o moño y calzado de vestir.'),
  dressCodeWomenTitle: text('dress_code_women_title').default('Para Ellas (Damas)'),
  dressCodeWomenDescription: text('dress_code_women_description').default('Vestido largo de noche o gala en telas finas. Evitar tonos blancos o marfil.'),
  dressCodeFootwearNote: text('dress_code_footwear_note').default('Para áreas de jardín y pasto, sugerimos calzado de tacón ancho, cuña o flats elegantes.'),
  dressCodeProhibitedColors: text('dress_code_prohibited_colors').default('Colores blanco, marfil, perla y champaña claro reservados exclusivamente para la novia.'),
  dressCodeWomanOutfit: text('dress_code_woman_outfit').default('long-gown'),
  dressCodeManOutfit: text('dress_code_man_outfit').default('suit'),
  itinerary: text('itinerary').default('[{"time":"17:00","title":"Ceremonia Religiosa","desc":"Parroquia San Francisco de Asís","icon":"church"},{"time":"18:30","title":"Cóctel de Bienvenida","desc":"Jardín de los Naranjos","icon":"cocktail"},{"time":"20:00","title":"Banquete & Brindis","desc":"Salón Principal","icon":"utensils"},{"time":"22:00","title":"Fiesta & DJ","desc":"Pista de baile y barra libre","icon":"music"},{"time":"02:00","title":"Tornaboda & Chilaquiles","desc":"Terraza Nocturna","icon":"moon"}]'),
  giftRegistry: text('gift_registry').default('[{"type":"bank","title":"Transferencia Bancaria","accountNumber":"1234-5678-9012-3456","clabe":"012180012345678901","bankName":"BBVA","beneficiary":"Sofía Martínez / Alejandro Ruiz","concept":"Boda Sofía & Alejandro"},{"type":"store","title":"Mesa de Regalos Liverpool","url":"https://mesaderegalos.liverpool.com.mx","eventNumber":"51298472"},{"type":"honeymoon","title":"Fondo Luna de Miel en Bali","description":"Tu aportación para experiencias inolvidables en nuestro primer viaje de casados","url":"https://paypal.me/boda"}]'),
  coverPhoto: text('cover_photo').default('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80'),
  secondaryPhoto: text('secondary_photo').default('https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80'),
  heroPhotos: text('hero_photos').default('["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80"]'),
  heroAutoplayInterval: integer('hero_autoplay_interval').default(5),
  cardStyle: text('card_style').default('classic-gold'), // 'classic-gold', 'romantic-floral', 'boho-chic', 'minimal-editorial', 'dark-luxury', 'watercolor-garden'
  envelopeColor: text('envelope_color').default('#2C2B29'),
  waxSealText: text('wax_seal_text').default('S&A'),
  waxSealColor: text('wax_seal_color').default('#C5A059'),
  audioUrl: text('audio_url').default('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3'),
  audioTitle: text('audio_title').default('Acoustic Romance - Guitarra Suave'),
  audioAutoplay: boolean('audio_autoplay').default(false),
  welcomeMessage: text('welcome_message').default('¡Nos casamos! Nos hace inmensa ilusión celebrar nuestro amor'),
  welcomeSubtitle: text('welcome_subtitle').default('Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración.'),
  heroDateFormat: text('hero_date_format').default('dd.mm.aaaa'),
  heroCustomDateText: text('hero_custom_date_text').default(''),
  heroQuote: text('hero_quote').default('El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.'),
  heroVerse: text('hero_verse').default('1 Corintios 13:7'),
  heroShowCountdown: boolean('hero_show_countdown').default(false),
  heroShowRsvpButton: boolean('hero_show_rsvp_button').default(false),
  heroShowIcon: boolean('hero_show_icon').default(false),
  heroShowGuestPill: boolean('hero_show_guest_pill').default(false),
  heroImageFit: text('hero_image_fit').default('cover'),
  heroImagePosition: text('hero_image_position').default('center'),
  heroOverlayOpacity: integer('hero_overlay_opacity').default(40),
  heroEnableScrollBlur: boolean('hero_enable_scroll_blur').default(true),
  showItinerary: boolean('show_itinerary').default(true),
  showLocations: boolean('show_locations').default(true),
  showDressCode: boolean('show_dress_code').default(true),
  showGiftRegistry: boolean('show_gift_registry').default(true),
  showPhotoGallery: boolean('show_photo_gallery').default(true),
  showVideoMemories: boolean('show_video_memories').default(true),
  showGuestbook: boolean('show_guestbook').default(true),
  showHotels: boolean('show_hotels').default(false),
  showTips: boolean('show_tips').default(true),
  tipsTitle: text('tips_title').default('Tips & Recomendaciones para Invitados'),
  tipsList: text('tips_list').default('[{"icon":"clock","title":"Puntualidad","desc":"Agradecemos llegar 15 minutos antes de la ceremonia para comenzar a tiempo."},{"icon":"car","title":"Estacionamiento & Valet","desc":"El recinto cuenta con servicio de Valet Parking y vigilancia privada."},{"icon":"camera","title":"Fotografías & Momentos","desc":"¡Comparte tus fotos en nuestra galería en vivo o usando nuestro hashtag oficial!"},{"icon":"heart","title":"Niños / Solo Adultos","desc":"Hemos preparado una celebración de gala para adultos. ¡Disfrutemos juntos la noche!"}]'),
  showRsvpSection: boolean('show_rsvp_section').default(true),
  bankName: text('bank_name').default('BBVA'),
  bankBeneficiary: text('bank_beneficiary').default('Sofía Martínez / Alejandro Ruiz'),
  bankAccountNumber: text('bank_account_number').default('1234 5678 9012 3456'),
  bankClabe: text('bank_clabe').default('012180012345678901'),
  bankCardNumber: text('bank_card_number').default(''),
  bankConcept: text('bank_concept').default('Boda Sofía & Alejandro'),
  bankCurrency: text('bank_currency').default('MXN'),
  enableBankTransfer: boolean('enable_bank_transfer').default(true),
  enableStoreRegistry: boolean('enable_store_registry').default(true),
  enableEnvelopeGift: boolean('enable_envelope_gift').default(false),
  envelopeGiftMessage: text('envelope_gift_message').default('Lluvia de sobres: Si deseas hacernos un regalo en efectivo el día del evento, dispondremos de un cofre especial en la recepción.'),
  rsvpDeadline: text('rsvp_deadline').default('2026-10-30'),
  contactPhone: text('contact_phone').default('+52 55 1234 5678'),
  contactEmail: text('contact_email').default('boda.sofyale@gmail.com'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Guests and invitations table
export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').default(1),
  accessCode: text('access_code').notNull().unique(), // e.g. "FLOP-892" or slug
  fullName: text('full_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  groupName: text('group_name').default('Familiares'),
  allocatedPasses: integer('allocated_passes').notNull().default(2),
  confirmedPasses: integer('confirmed_passes').default(0),
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'declined'
  attendingCeremony: boolean('attending_ceremony').default(true),
  attendingReception: boolean('attending_reception').default(true),
  dietaryRestrictions: text('dietary_restrictions').default(''),
  companionNames: text('companion_names').default('[]'), // JSON array of string names
  suggestedSong: text('suggested_song').default(''),
  message: text('message').default(''),
  confirmedAt: timestamp('confirmed_at'),
  viewedAt: timestamp('viewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Photo gallery shared by guests and couple
export const galleryPhotos = pgTable('gallery_photos', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').default(1),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  authorName: text('author_name').notNull().default('Invitado Especial'),
  guestCode: text('guest_code'),
  category: text('category').default('fiesta'), // 'preparativos', 'ceremonia', 'brindis', 'fiesta', 'recuerdos'
  likesCount: integer('likes_count').default(0),
  approved: boolean('approved').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Videos (YouTube, Instagram, Facebook, TikTok)
export const weddingVideos = pgTable('wedding_videos', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').default(1),
  title: text('title').notNull(),
  platform: text('platform').notNull(), // 'youtube', 'instagram', 'facebook', 'tiktok', 'vimeo', 'direct'
  videoUrl: text('video_url').notNull(),
  embedId: text('embed_id'),
  description: text('description'),
  authorName: text('author_name').default('Novios'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Guestbook wishes and congratulations
export const guestbookWishes = pgTable('guestbook_wishes', {
  id: serial('id').primaryKey(),
  weddingId: integer('wedding_id').default(1),
  guestName: text('guest_name').notNull(),
  relationship: text('relationship').default('Amigo / Familiar'),
  message: text('message').notNull(),
  avatarUrl: text('avatar_url'),
  isHighlighted: boolean('is_highlighted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Photo comments by guests
export const photoComments = pgTable('photo_comments', {
  id: serial('id').primaryKey(),
  photoId: integer('photo_id').notNull(),
  weddingId: integer('wedding_id').default(1),
  guestName: text('guest_name').notNull().default('Invitado Especial'),
  guestCode: text('guest_code'),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, () => ({}));
