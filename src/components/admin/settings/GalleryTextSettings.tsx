import React from 'react';
import { WeddingSettings } from '../../../types.ts';

type GalleryTextKey = keyof Pick<WeddingSettings,
  | 'gallerySectionEyebrow'
  | 'gallerySectionTitle'
  | 'galleryPhotoPromptText'
  | 'galleryEmptyTitle'
  | 'galleryEmptyDescription'
  | 'galleryDrivePhotoBadgeText'
  | 'gallerySharedAlbumCaption'
  | 'galleryCommentsButtonText'
  | 'galleryCommentsCountLabel'
  | 'galleryCommentsPromptText'
  | 'galleryFullscreenCommentsTitle'
  | 'galleryCommentsLoadingText'
  | 'galleryCommentsEmptyText'
  | 'galleryCommentsHelperText'
  | 'galleryCommentNameLabel'
  | 'galleryCommentNamePlaceholder'
  | 'galleryCommentTextLabel'
  | 'galleryCommentTextPlaceholder'
  | 'galleryCommentSubmitText'
>;

interface GalleryTextSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

const weddingDefaults: Record<GalleryTextKey, string> = {
  gallerySectionEyebrow: 'Sesión de Fotos & Recuerdos',
  gallerySectionTitle: 'Nuestra Galería de Fotos',
  galleryPhotoPromptText: 'Presiona en la foto',
  galleryEmptyTitle: 'Galería en preparación',
  galleryEmptyDescription: 'Las fotografías y momentos oficiales de la boda serán compartidos aquí por los novios.',
  galleryDrivePhotoBadgeText: 'Google Drive',
  gallerySharedAlbumCaption: 'Fotos compartidas',
  galleryCommentsButtonText: 'Comentar',
  galleryCommentsCountLabel: 'Comentarios',
  galleryCommentsPromptText: 'Ver y dejar comentarios ({count})...',
  galleryFullscreenCommentsTitle: 'Comentarios & Dedicatorias',
  galleryCommentsLoadingText: 'Cargando comentarios...',
  galleryCommentsEmptyText: 'Sé el primero en comentar esta foto',
  galleryCommentsHelperText: 'Deja un lindo mensaje o dedicatoria.',
  galleryCommentNameLabel: 'Tu nombre',
  galleryCommentNamePlaceholder: 'Tu nombre (ej. Familia Pérez)',
  galleryCommentTextLabel: 'Comentario',
  galleryCommentTextPlaceholder: 'Escribe un comentario o dedicatoria...',
  galleryCommentSubmitText: 'Enviar',
};

const quinceDefaults: Record<GalleryTextKey, string> = {
  ...weddingDefaults,
  gallerySectionTitle: 'Mi Galería de Fotos',
  galleryEmptyDescription: 'Las fotografías y momentos oficiales de mis XV serán compartidos aquí.',
  galleryCommentTextPlaceholder: 'Escribe un comentario o felicitación...',
};

export const GalleryTextSettings: React.FC<GalleryTextSettingsProps> = ({ settings, onChange }) => {
  const defaults = settings.eventType === 'xv' ? quinceDefaults : weddingDefaults;

  const field = (key: GalleryTextKey, label: string, multiline = false) => {
    const commonClass = 'w-full rounded-lg border border-[#E5E2D0] bg-white px-3 py-2 text-xs text-stone-800 focus:border-[#A89F78] focus:outline-none focus:ring-1 focus:ring-[#A89F78]';
    const value = settings[key] || defaults[key];
    return (
      <label key={key} className="block min-w-0 text-[11px] font-medium text-stone-600">
        <span className="mb-1 block">{label}</span>
        {multiline ? (
          <textarea
            rows={2}
            value={value}
            onChange={(event) => onChange({ [key]: event.target.value } as Partial<WeddingSettings>)}
            className={`${commonClass} resize-y`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => onChange({ [key]: event.target.value } as Partial<WeddingSettings>)}
            className={commonClass}
          />
        )}
      </label>
    );
  };

  return (
    <details className="rounded-xl border border-[#E5E2D0] bg-white/80">
      <summary className="cursor-pointer select-none px-4 py-3 text-xs font-bold text-stone-800">
        Personalizar textos de la galería, pantalla completa y comentarios
      </summary>
      <div className="space-y-4 border-t border-[#E5E2D0] p-4">
        <section className="space-y-2.5">
          <h6 className="text-[11px] font-bold uppercase tracking-wide text-[#5A5A40]">Galería de la invitación</h6>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field('gallerySectionEyebrow', 'Texto pequeño sobre el título')}
            {field('gallerySectionTitle', 'Título de la galería')}
            {field('galleryPhotoPromptText', 'Instrucción para abrir una foto')}
            {field('galleryEmptyTitle', 'Título cuando aún no hay fotos')}
            {field('galleryEmptyDescription', 'Descripción cuando aún no hay fotos', true)}
            {field('galleryDrivePhotoBadgeText', 'Etiqueta de fotos de Google Drive')}
            {field('gallerySharedAlbumCaption', 'Crédito de fotos compartidas')}
          </div>
        </section>

        <section className="space-y-2.5 border-t border-[#E5E2D0] pt-4">
          <h6 className="text-[11px] font-bold uppercase tracking-wide text-[#5A5A40]">Pantalla completa y comentarios</h6>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field('galleryCommentsButtonText', 'Botón para comentar')}
            {field('galleryCommentsCountLabel', 'Texto al mostrar el número de comentarios')}
            {field('galleryCommentsPromptText', 'Invitación para abrir los comentarios (usa {count})', true)}
            {field('galleryFullscreenCommentsTitle', 'Título del panel de comentarios')}
            {field('galleryCommentsLoadingText', 'Texto mientras cargan los comentarios')}
            {field('galleryCommentsEmptyText', 'Texto cuando no hay comentarios', true)}
            {field('galleryCommentsHelperText', 'Texto de ayuda para comentar', true)}
            {field('galleryCommentNameLabel', 'Etiqueta accesible del campo nombre')}
            {field('galleryCommentNamePlaceholder', 'Placeholder del nombre')}
            {field('galleryCommentTextLabel', 'Etiqueta accesible del campo comentario')}
            {field('galleryCommentTextPlaceholder', 'Placeholder del comentario')}
            {field('galleryCommentSubmitText', 'Botón para enviar el comentario')}
          </div>
        </section>
      </div>
    </details>
  );
};
