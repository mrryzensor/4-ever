import { Pool } from 'pg';
import { createPool } from './index.ts';

/**
 * Automatic Database & Table Initializer
 * Runs seamlessly on Coolify / Docker / Local PostgreSQL
 * Automatically checks, creates database 2date_db if needed, creates tables, and seeds initial data.
 */
export async function autoMigrateDatabase() {
  const host = process.env.DATABASE_URL
    ? undefined
    : process.env.SQL_HOST || process.env.POSTGRES_HOST || process.env.DB_HOST;

  const dbName = process.env.SQL_DB_NAME || process.env.POSTGRES_DB || process.env.DB_NAME || '2date_db';

  if (!process.env.DATABASE_URL && !host) {
    console.log('ℹ️ No PostgreSQL host provided. Running with high-availability in-memory database engine.');
    return false;
  }

  console.log(`⏳ Connecting to PostgreSQL database [${dbName}]...`);

  // Step 1: Connect with main pool
  try {
    const pool = createPool();
    const client = await pool.connect();

    try {
      // Create tables if they do not exist
      await client.query(`
        -- 1. Users Table
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          password TEXT,
          name TEXT,
          role TEXT DEFAULT 'couple',
          plan TEXT DEFAULT 'free',
          agency_name TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_name TEXT;

        -- 2. Wedding Settings Table
        CREATE TABLE IF NOT EXISTS wedding_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          owner_uid TEXT,
          slug TEXT,
          is_published BOOLEAN DEFAULT true,
          couple_names TEXT NOT NULL DEFAULT 'Sofía & Alejandro',
          hashtag TEXT DEFAULT '#BodaSofyAle2026',
          event_date TEXT NOT NULL DEFAULT '2026-11-28',
          event_time TEXT NOT NULL DEFAULT '17:00',
          ceremony_venue TEXT NOT NULL DEFAULT 'Parroquia San Francisco de Asís',
          ceremony_address TEXT NOT NULL DEFAULT 'Calle de los Olivos 142, Centro Histórico',
          ceremony_maps_url TEXT DEFAULT 'https://maps.google.com/?q=San+Francisco+Church',
          ceremony_embed_url TEXT DEFAULT '',
          ceremony_place_query TEXT DEFAULT 'Parroquia San Francisco de Asís',
          ceremony_time TEXT DEFAULT '17:00',
          reception_venue TEXT NOT NULL DEFAULT 'Hacienda Los Arcángeles',
          reception_address TEXT NOT NULL DEFAULT 'Km 14.5 Carretera Real, Valle Encantado',
          reception_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Hacienda+Los+Arcangeles',
          reception_embed_url TEXT DEFAULT '',
          reception_place_query TEXT DEFAULT 'Hacienda Los Arcángeles',
          reception_time TEXT DEFAULT '19:30',
          dress_code TEXT DEFAULT 'Formal / Traje Oscuro y Vestido Largo',
          dress_code_description TEXT DEFAULT 'Agradecemos no usar blanco, marfil o champagne reservado para la novia.',
          dress_code_palette TEXT DEFAULT '["#1C2D37", "#9E7D47", "#D4AF37", "#D8C7B8", "#4A5B52"]',
          dress_code_men_title TEXT DEFAULT 'Para Ellos (Caballeros)',
          dress_code_men_description TEXT DEFAULT 'Traje formal completo en tonos oscuros, camisa de vestir, corbata o moño y calzado de vestir.',
          dress_code_women_title TEXT DEFAULT 'Para Ellas (Damas)',
          dress_code_women_description TEXT DEFAULT 'Vestido largo de noche o gala en telas finas. Evitar tonos blancos o marfil.',
          dress_code_footwear_note TEXT DEFAULT 'Para áreas de jardín y pasto, sugerimos calzado de tacón ancho, cuña o flats elegantes.',
          dress_code_prohibited_colors TEXT DEFAULT 'Colores blanco, marfil, perla y champaña claro reservados exclusivamente para la novia.',
          dress_code_woman_outfit TEXT DEFAULT 'long-gown',
          dress_code_man_outfit TEXT DEFAULT 'suit',
          itinerary TEXT DEFAULT '[{"time":"17:00","title":"Ceremonia Religiosa","desc":"Parroquia San Francisco de Asís","icon":"church"},{"time":"18:30","title":"Cóctel de Bienvenida","desc":"Jardín de los Naranjos","icon":"cocktail"},{"time":"20:00","title":"Banquete & Brindis","desc":"Salón Principal","icon":"utensils"},{"time":"22:00","title":"Fiesta & DJ","desc":"Pista de baile y barra libre","icon":"music"},{"time":"02:00","title":"Tornaboda & Chilaquiles","desc":"Terraza Nocturna","icon":"moon"}]',
          gift_registry TEXT DEFAULT '[{"type":"bank","title":"Transferencia Bancaria","accountNumber":"1234-5678-9012-3456","clabe":"012180012345678901","bankName":"BBVA","beneficiary":"Sofía Martínez / Alejandro Ruiz","concept":"Boda Sofía & Alejandro"},{"type":"store","title":"Mesa de Regalos Liverpool","url":"https://mesaderegalos.liverpool.com.mx","eventNumber":"51298472"},{"type":"honeymoon","title":"Fondo Luna de Miel en Bali","description":"Tu aportación para experiencias inolvidables en nuestro primer viaje de casados","url":"https://paypal.me/boda"}]',
          cover_photo TEXT DEFAULT 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
          secondary_photo TEXT DEFAULT 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
          card_style TEXT DEFAULT 'classic-gold',
          envelope_color TEXT DEFAULT '#2C2B29',
          wax_seal_text TEXT DEFAULT 'S&A',
          wax_seal_color TEXT DEFAULT '#C5A059',
          audio_url TEXT DEFAULT 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-uplifting-112705.mp3',
          audio_title TEXT DEFAULT 'Acoustic Romance - Guitarra Suave',
          audio_autoplay BOOLEAN DEFAULT false,
          welcome_message TEXT DEFAULT '¡Nos casamos! Nos hace inmensa ilusión celebrar nuestro amor',
          welcome_subtitle TEXT DEFAULT 'Nos emociona compartir este día tan especial contigo. Aquí encontrarás todos los detalles y ubicaciones de nuestra celebración.',
          hero_date_format TEXT DEFAULT 'dd.mm.aaaa',
          hero_custom_date_text TEXT DEFAULT '',
          hero_quote TEXT DEFAULT 'El amor todo lo sufre, todo lo cree, todo lo espera, todo lo soporta.',
          hero_verse TEXT DEFAULT '1 Corintios 13:7',
          hero_show_countdown BOOLEAN DEFAULT false,
          hero_show_rsvp_button BOOLEAN DEFAULT false,
          hero_show_icon BOOLEAN DEFAULT false,
          hero_show_guest_pill BOOLEAN DEFAULT false,
          hero_image_fit TEXT DEFAULT 'cover',
          hero_image_position TEXT DEFAULT 'center',
          hero_overlay_opacity INTEGER DEFAULT 40,
          hero_enable_scroll_blur BOOLEAN DEFAULT true,
          show_itinerary BOOLEAN DEFAULT true,
          show_locations BOOLEAN DEFAULT true,
          show_dress_code BOOLEAN DEFAULT true,
          show_gift_registry BOOLEAN DEFAULT true,
          show_photo_gallery BOOLEAN DEFAULT true,
          show_video_memories BOOLEAN DEFAULT true,
          show_guestbook BOOLEAN DEFAULT true,
          show_hotels BOOLEAN DEFAULT false,
          show_tips BOOLEAN DEFAULT true,
          tips_title TEXT DEFAULT 'Tips & Recomendaciones para Invitados',
          tips_list TEXT DEFAULT '[{"icon":"clock","title":"Puntualidad","desc":"Agradecemos llegar 15 minutos antes de la ceremonia para comenzar a tiempo."},{"icon":"car","title":"Estacionamiento & Valet","desc":"El recinto cuenta con servicio de Valet Parking y vigilancia privada."},{"icon":"camera","title":"Fotografías & Momentos","desc":"¡Comparte tus fotos en nuestra galería en vivo o usando nuestro hashtag oficial!"},{"icon":"heart","title":"Niños / Solo Adultos","desc":"Hemos preparado una celebración de gala para adultos. ¡Disfrutemos juntos la noche!"}]',
          show_rsvp_section BOOLEAN DEFAULT true,
          bank_name TEXT DEFAULT 'BBVA',
          bank_beneficiary TEXT DEFAULT 'Sofía Martínez / Alejandro Ruiz',
          bank_account_number TEXT DEFAULT '1234 5678 9012 3456',
          bank_clabe TEXT DEFAULT '012180012345678901',
          bank_card_number TEXT DEFAULT '',
          bank_concept TEXT DEFAULT 'Boda Sofía & Alejandro',
          bank_currency TEXT DEFAULT 'MXN',
          enable_bank_transfer BOOLEAN DEFAULT true,
          enable_store_registry BOOLEAN DEFAULT true,
          enable_envelope_gift BOOLEAN DEFAULT false,
          envelope_gift_message TEXT DEFAULT 'Lluvia de sobres: Si deseas hacernos un regalo en efectivo el día del evento, dispondremos de un cofre especial en la recepción.',
          rsvp_deadline TEXT DEFAULT '2026-10-30',
          contact_phone TEXT DEFAULT '+52 55 1234 5678',
          contact_email TEXT DEFAULT 'boda.sofyale@gmail.com',
          updated_at TIMESTAMP DEFAULT NOW()
        );
        ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS show_tips BOOLEAN DEFAULT true;
        ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS tips_title TEXT DEFAULT 'Tips & Recomendaciones para Invitados';
        ALTER TABLE wedding_settings ADD COLUMN IF NOT EXISTS tips_list TEXT DEFAULT '[{"icon":"clock","title":"Puntualidad","desc":"Agradecemos llegar 15 minutos antes de la ceremonia para comenzar a tiempo."},{"icon":"car","title":"Estacionamiento & Valet","desc":"El recinto cuenta con servicio de Valet Parking y vigilancia privada."},{"icon":"camera","title":"Fotografías & Momentos","desc":"¡Comparte tus fotos en nuestra galería en vivo o usando nuestro hashtag oficial!"},{"icon":"heart","title":"Niños / Solo Adultos","desc":"Hemos preparado una celebración de gala para adultos. ¡Disfrutemos juntos la noche!"}]';

        -- 3. Guests Table
        CREATE TABLE IF NOT EXISTS guests (
          id SERIAL PRIMARY KEY,
          wedding_id INTEGER DEFAULT 1,
          access_code TEXT NOT NULL UNIQUE,
          full_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          group_name TEXT DEFAULT 'Familiares',
          allocated_passes INTEGER NOT NULL DEFAULT 2,
          confirmed_passes INTEGER DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          attending_ceremony BOOLEAN DEFAULT true,
          attending_reception BOOLEAN DEFAULT true,
          dietary_restrictions TEXT DEFAULT '',
          companion_names TEXT DEFAULT '[]',
          suggested_song TEXT DEFAULT '',
          message TEXT DEFAULT '',
          confirmed_at TIMESTAMP,
          viewed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- 4. Gallery Photos Table
        CREATE TABLE IF NOT EXISTS gallery_photos (
          id SERIAL PRIMARY KEY,
          wedding_id INTEGER DEFAULT 1,
          url TEXT NOT NULL,
          thumbnail_url TEXT,
          caption TEXT,
          author_name TEXT NOT NULL DEFAULT 'Invitado Especial',
          guest_code TEXT,
          category TEXT DEFAULT 'fiesta',
          likes_count INTEGER DEFAULT 0,
          approved BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- 5. Photo Comments Table
        CREATE TABLE IF NOT EXISTS photo_comments (
          id SERIAL PRIMARY KEY,
          photo_id INTEGER NOT NULL,
          author_name TEXT NOT NULL,
          comment TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- 6. Wedding Videos Table
        CREATE TABLE IF NOT EXISTS wedding_videos (
          id SERIAL PRIMARY KEY,
          wedding_id INTEGER DEFAULT 1,
          title TEXT NOT NULL,
          platform TEXT NOT NULL,
          video_url TEXT NOT NULL,
          embed_id TEXT,
          description TEXT,
          author_name TEXT DEFAULT 'Novios',
          created_at TIMESTAMP DEFAULT NOW()
        );

        -- 7. Guestbook Wishes Table
        CREATE TABLE IF NOT EXISTS guestbook_wishes (
          id SERIAL PRIMARY KEY,
          wedding_id INTEGER DEFAULT 1,
          guest_name TEXT NOT NULL,
          relationship TEXT DEFAULT 'Amigo / Familiar',
          message TEXT NOT NULL,
          avatar_url TEXT,
          is_highlighted BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Ensure at least default wedding #1 exists
      const weddingCheck = await client.query('SELECT id FROM wedding_settings LIMIT 1');
      if (weddingCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO wedding_settings (id, couple_names, slug, is_published)
          VALUES (1, 'Sofía & Alejandro', 'sofia-y-alejandro', true)
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      // Ensure CEO superuser exists
      const userCheck = await client.query("SELECT id FROM users WHERE email = 'daviex14@gmail.com' LIMIT 1");
      if (userCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO users (uid, email, name, role, plan)
          VALUES ('ceo-daviex', 'daviex14@gmail.com', 'Daviex (CEO & Fundador)', 'ceo', 'ceo_unlimited')
          ON CONFLICT (uid) DO NOTHING;
        `);
      }

      // Ensure initial demo gallery photos exist if table is empty
      const photosCheck = await client.query('SELECT id FROM gallery_photos LIMIT 1');
      if (photosCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO gallery_photos (wedding_id, url, caption, author_name, category, likes_count, approved)
          VALUES 
            (1, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80', 'Nuestra sesión de compromiso al atardecer en el viñedo 🌅💍', 'Sofía & Ale (Novios)', 'preparativos', 24, true),
            (1, 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1000&q=80', 'Eligiendo los detalles de las flores y la decoración floral 🌸🌿', 'Sofía (Novia)', 'preparativos', 18, true),
            (1, 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80', 'Los novios compartiendo su primer baile bajo las luces mágicas ✨', 'Carlos Ruiz', 'fiesta', 31, true),
            (1, 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1000&q=80', 'El brindis y bendición de los papás con todos los invitados 🥂', 'Mariana Gómez', 'brindis', 15, true),
            (1, 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1000&q=80', '¡Momento del ramo de novia y photobooth de la fiesta! 💐💃', 'Elena Morales', 'photobooth', 29, true)
          ON CONFLICT DO NOTHING;
        `);
      }

      // Ensure initial demo videos exist if table is empty
      const videosCheck = await client.query('SELECT id FROM wedding_videos LIMIT 1');
      if (videosCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO wedding_videos (wedding_id, title, platform, video_url, embed_id, description, author_name)
          VALUES 
            (1, 'Nuestra Historia de Amor (Save the Date Oficial)', 'youtube', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'kJQP7kiw5Fk', 'Un resumen en video de cómo nos conocimos y el camino hacia nuestro gran día.', 'Sofía & Alejandro'),
            (1, 'Reel de la pedida de mano sorpresa en la playa', 'instagram', 'https://www.instagram.com/reel/C3_sample', 'C3_sample', 'El momento mágico del "¡Sí, acepto!" en Cancún.', 'Alejandro Ruiz')
          ON CONFLICT DO NOTHING;
        `);
      }

      // Ensure initial demo guestbook wishes exist if table is empty
      const wishesCheck = await client.query('SELECT id FROM guestbook_wishes LIMIT 1');
      if (wishesCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO guestbook_wishes (wedding_id, guest_name, relationship, message, is_highlighted)
          VALUES 
            (1, 'Abuela Carmen', 'Familia de la Novia', 'Mi querida Sofí y Alex, les deseo una vida llena de comprensión, paciencia y mucho amor. Siempre en mis oraciones.', true),
            (1, 'David & Andrea', 'Padrinos de Velación', '¡Qué honor acompañarlos en esta nueva etapa! Les deseamos lo más hermoso hoy y siempre.', true)
          ON CONFLICT DO NOTHING;
        `);
      }

      console.log('✅ PostgreSQL database [2date_db] and all schema tables are ready & up to date.');
      return true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.warn('⚠️ Could not connect to PostgreSQL, operating in in-memory fallback:', error.message);
    return false;
  }
}
