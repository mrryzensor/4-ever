import React from 'react';
import { ArrowLeft, Eye, Share2, Check, Crown, Menu } from 'lucide-react';
import { WeddingSettings, UserProfile } from '../../types.ts';

interface AdminHeaderProps {
  settings?: WeddingSettings;
  onBackToDashboard?: () => void;
  onBackToInvitation?: () => void;
  onClose?: () => void;
  copiedLink: boolean;
  onCopyInvitationLink: () => void;
  currentUser?: UserProfile | null;
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  settings,
  onBackToDashboard,
  onBackToInvitation,
  onClose,
  copiedLink,
  onCopyInvitationLink,
  currentUser,
  onToggleSidebar,
}) => {
  const waxSeal = settings?.waxSealText || 'W';
  const coupleNames = settings?.coupleNames || 'Nuestra Boda';
  const eventDate = settings?.eventDate || '';

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7EF]/95 backdrop-blur-md border-b border-[#E5E2D0] shadow-xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Navigation Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] shadow-2xs transition-all cursor-pointer shrink-0"
              title="Abrir menú de navegación"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-100 border border-[#E5E2D0] text-[#5A5A40] text-xs font-semibold shadow-2xs transition-all cursor-pointer shrink-0"
              title="Volver a la lista de bodas"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mis Bodas</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl aspect-square shrink-0 circle-badge bg-[#5A5A40] text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
              {waxSeal}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-serif font-bold text-[#1a1a1a] truncate">
                {coupleNames}
              </h1>
              <p className="text-[11px] text-[#7D8C7A] font-serif italic hidden md:block">
                {eventDate ? `${eventDate} • ` : ''}Atelier & Gestión de Asistencia RSVP
              </p>
            </div>
          </div>
        </div>

        {/* Right Action Switchers */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live Invitation Button */}
          {onBackToInvitation && (
            <button
              onClick={onBackToInvitation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Abrir la invitación digital como la ven los invitados"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Ver Invitación Real</span>
            </button>
          )}

          {/* Quick Link Copy Button */}
          <button
            onClick={onCopyInvitationLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white border border-[#E5E2D0] hover:bg-[#FAF9F0] text-[#5A5A40] text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Copiar enlace de la invitación"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline text-emerald-700">¡Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Compartir</span>
              </>
            )}
          </button>

          {/* User Profile / Status */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
              <Crown className="w-3 h-3 text-amber-600" />
              <span>Plan {currentUser.plan.toUpperCase()}</span>
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="text-[#5A5A40] hover:text-[#1a1a1a] text-xl font-light w-8 h-8 rounded-full aspect-square shrink-0 circle-badge flex items-center justify-center hover:bg-white border border-transparent hover:border-[#E5E2D0] cursor-pointer transition-colors"
              title="Cerrar vista"
            >
              &times;
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
