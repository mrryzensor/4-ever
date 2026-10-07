import React, { useState } from 'react';
import { ChevronDown, RotateCcw, Share2 } from 'lucide-react';
import type { WeddingSettings } from '../../../types.ts';
import { buildInvitationShareMessage, DEFAULT_INVITATION_SHARE_TEMPLATE } from '../../../lib/invitationSharing.ts';

interface ShareMessageSettingsProps {
  settings: WeddingSettings;
  onChange: (updated: Partial<WeddingSettings>) => void;
}

export const ShareMessageSettings: React.FC<ShareMessageSettingsProps> = ({ settings, onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const value = settings.shareMessageTemplate ?? DEFAULT_INVITATION_SHARE_TEMPLATE;
  const preview = buildInvitationShareMessage({ ...settings, shareMessageTemplate: value }, window.location.origin);

  return (
    <section className="rounded-2xl border border-[#E5E2D0] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="invitation-share-message-heading">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Share2 className="h-4 w-4 shrink-0 text-[#7D8C7A]" />
          <div className="min-w-0">
            <h3 id="invitation-share-message-heading" className="text-sm font-bold text-stone-900">Mensaje para compartir</h3>
            <p className="mt-0.5 text-[11px] leading-4 text-stone-500">
              Personaliza el texto que acompañará el enlace de tu invitación.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls="invitation-share-message-content"
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-[10px] font-semibold text-stone-600 transition hover:bg-stone-50"
        >
          {isExpanded ? 'Ocultar' : 'Configurar'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isExpanded && (
        <div id="invitation-share-message-content" className="mt-4 border-t border-stone-100 pt-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onChange({ shareMessageTemplate: DEFAULT_INVITATION_SHARE_TEMPLATE })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-[10px] font-semibold text-stone-600 transition hover:bg-stone-50"
            >
              <RotateCcw className="h-3 w-3" /> Restaurar mensaje
            </button>
          </div>
          <label htmlFor="invitation-share-message-template" className="mt-3 block text-xs font-semibold text-stone-700">
            Texto personalizado
          </label>
          <textarea
            id="invitation-share-message-template"
            value={value}
            maxLength={2000}
            rows={6}
            onChange={(event) => onChange({ shareMessageTemplate: event.target.value })}
            className="mt-1.5 w-full resize-y rounded-xl border border-stone-300 bg-[#FFFDF8] px-3 py-2.5 text-xs leading-5 text-stone-800 outline-none transition focus:border-[#7D8C7A] focus:ring-2 focus:ring-[#7D8C7A]/15"
          />
          <p className="mt-1 text-[10px] leading-4 text-stone-500">
            Variables disponibles: <code>{'{coupleNames}'}</code>, <code>{'{eventDate}'}</code>, <code>{'{eventTime}'}</code> y <code>{'{url}'}</code>. El enlace siempre se añade aunque quites la variable.
          </p>
          <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-stone-500">Vista previa</p>
            <p className="mt-1.5 whitespace-pre-wrap break-words text-xs leading-5 text-stone-700">{preview}</p>
          </div>
        </div>
      )}
    </section>
  );
};
