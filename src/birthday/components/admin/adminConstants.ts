// Admin Constants & Presets for Wedding Invitation Atelier

export const WEDDING_HERO_PRESETS = [
  {
    id: 'preset-sunset',
    name: 'Atardecer Dorado',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=300&q=70',
    tag: 'Romántico',
  },
  {
    id: 'preset-bw',
    name: 'Elegancia B&N',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=300&q=70',
    tag: 'Monocromo',
  },
  {
    id: 'preset-garden',
    name: 'Jardín & Arcos',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=300&q=70',
    tag: 'Floral',
  },
  {
    id: 'preset-cathedral',
    name: 'Catedral & Velos',
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=300&q=70',
    tag: 'Clásico',
  },
  {
    id: 'preset-boho',
    name: 'Campos Boho',
    url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=300&q=70',
    tag: 'Boho Chic',
  },
  {
    id: 'preset-beach',
    name: 'Brisa de Playa',
    url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=2000&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=300&q=70',
    tag: 'Playa',
  },
];

export const HERO_FIT_OPTIONS: Array<{
  id: 'cover' | 'contain' | 'fill' | 'original';
  title: string;
  badge: string;
  desc: string;
}> = [
  {
    id: 'cover',
    title: 'Pantalla Completa (Cover)',
    badge: 'Recomendado',
    desc: 'Llena toda la pantalla recortando armónicamente sin deformar la foto (Ideal para fotos verticales de pareja).',
  },
  {
    id: 'contain',
    title: 'Ajuste Completo (Contain / Fit)',
    badge: 'Sin Recortes',
    desc: 'Muestra la imagen completa sin recortar ningún borde, con un fondo difuminado de ambientación.',
  },
  {
    id: 'fill',
    title: 'Estirar a Pantalla (Stretch Fit)',
    badge: 'Estirar 100%',
    desc: 'Estira la imagen para cubrir el 100% de alto y ancho exactos del viewport.',
  },
  {
    id: 'original',
    title: 'Tamaño Real Centrado (Original)',
    badge: 'Escala 1:1',
    desc: 'Mantiene la resolución nativa original de la fotografía centrada.',
  },
];

export const HERO_POSITION_OPTIONS: Array<{
  id: 'top' | 'center' | 'bottom';
  label: string;
  desc: string;
}> = [
  { id: 'top', label: 'Arriba / Rostros', desc: 'Enfoca la parte superior de la imagen (ideal para novios de pie)' },
  { id: 'center', label: 'Centro (Estándar)', desc: 'Encuadre centrado vertical y horizontalmente' },
  { id: 'bottom', label: 'Abajo / Suelo', desc: 'Enfoca la parte inferior de la imagen' },
];
