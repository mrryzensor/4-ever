# 💍 Atelier Nupcial SaaS (4-Ever / 2Date)

Plataforma SaaS moderna, elegante e interactiva para diseño de invitaciones de boda digitales de alta costura, confirmación de asistencia (RSVP) en tiempo real, reproductor de audio, itinerarios, mapa de ubicaciones y galería colaborativa de fotos.

![Atelier Nupcial Banner](public/og-landing.png)

---

## ✨ Características Principales

- **💌 Portada & Sobre Interactivo**: Animación realista de apertura con lacre de cera 3D y aros entrelazados animados.
- **✨ Hero Sticky Inmersivo**: Desplazamiento visual con desenfoque óptico progresivo y divisor de ondas orgánicas sin costuras.
- **🎵 Reproductor Musical Flotante**: Carga de canciones en MP3 con optimización y compresión directa en frontend.
- **📋 Confirmación RSVP en Tiempo Real**: Gestión de invitados con pases asignados, acompañantes, restricciones alimentarias y sugerencias musicales.
- **📸 Galería Colaborativa**: Subida de fotos por invitados en formato AVIF / WebP con sistema de "Me Gusta" y comentarios.
- **📍 Ubicaciones & Rutas Guiadas**: Integración interactiva con Google Maps y Waze para ceremonia y recepción.
- **👔 Código de Vestimenta & Mesa de Regalos**: Paletas de color, recomendaciones de calzado, cuentas bancarias y enlaces a mesas departamentales.
- **👑 Panel CEO & Multi-Boda**: Control total de bodas, planes de suscripción y analíticas centralizadas.

---

## 🚀 Despliegue en Coolify

Esta aplicación está 100% optimizada para desplegarse mediante **Coolify** utilizando el **Dockerfile** incluido.

### 1. Variables de Entorno en Coolify

Configura las siguientes variables de entorno en tu aplicación en Coolify:

| Variable | Valor Recomendado / Ejemplo | Descripción |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Modo de ejecución |
| `PORT` | `3000` | Puerto interno del contenedor |
| `DATABASE_URL` | `postgresql://usuario:contraseña@servidor_postgres:5432/2date_db` | Cadena de conexión completa a tu PostgreSQL |
| `SQL_HOST` | `tu_host_postgres` | Host de PostgreSQL *(si no usas DATABASE_URL)* |
| `SQL_PORT` | `5432` | Puerto de PostgreSQL |
| `SQL_DB_NAME` | `2date_db` | Nombre de la base de datos (**2date_db**) |
| `SQL_USER` | `tu_usuario_postgres` | Usuario de la base de datos |
| `SQL_PASSWORD` | `tu_password_seguro` | Contraseña de PostgreSQL |

> 💡 **Auto-Creación de Tablas**: Al iniciar el contenedor en Coolify, el script `autoMigrateDatabase()` se conecta automáticamente a tu PostgreSQL y crea todas las tablas de la base de datos `2date_db` con sus índices y datos semilla iniciales sin requerir migraciones manuales.

### 2. Volúmenes Persistentes (Almacenamiento de Fotos y Audio)

En la sección **Storage / Persistent Storage** de Coolify, mapea el directorio de subidas:

```text
/app/uploads -> volumen_coolify_uploads
```

---

## 🐳 Despliegue con Docker Compose (Local o Servidor VPS)

Para levantar la aplicación junto a una base de datos PostgreSQL `2date_db` localmente:

```bash
docker compose up -d --build
```

El servidor estará disponible en `http://localhost:3000`.

---

## 💻 Desarrollo Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo
pnpm dev

# 3. Compilar para producción
pnpm build
```

---

## 📦 Repositorio Oficial

- **GitHub**: [https://github.com/mrryzensor/4-ever](https://github.com/mrryzensor/4-ever)
- **Licencia**: Privada / Comercial - Atelier Nupcial Digital.
