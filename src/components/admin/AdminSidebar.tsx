import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  UserPlus,
  Palette,
  ChevronLeft,
  ChevronRight,
  Eye,
  Share2,
  Check,
  Sparkles,
  BarChart3,
  X,
  Menu,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { GuestStats, WeddingSettings } from '../../types.ts';

interface AdminSidebarProps {
  activeTab: 'guests' | 'settings' | 'import' | 'gallery';
  onSelectTab: (tab: 'guests' | 'settings' | 'import' | 'gallery') => void;
  stats?: GuestStats;
  totalGuests?: number;
  settings: WeddingSettings;
  onBackToInvitation?: () => void;
  onCopyInvitationLink: () => void;
  copiedLink: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  stats,
  totalGuests,
  settings,
  onBackToInvitation,
  onCopyInvitationLink,
  copiedLink,
  isCollapsed,
  onToggleCollapse,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}) => {
  const guestCount = typeof totalGuests === 'number' ? totalGuests : (stats?.totalGuests ?? 0);
  const confirmedPasses = stats?.totalConfirmedPasses ?? 0;
  const totalAllocated = stats?.totalAllocatedPasses ?? 0;

  const navItems = [
    {
      id: 'guests' as const,
      label: 'Invitados & RSVP',
      shortLabel: 'Invitados',
      desc: 'Gestión de pases y asistencia',
      icon: Users,
      badge: `${guestCount}`,
      badgeColor: 'bg-stone-100 text-stone-700 border-stone-200',
    },
    {
      id: 'gallery' as const,
      label: 'Galería & Interacción',
      shortLabel: 'Galería',
      desc: 'Likes, métricas y comentarios',
      icon: Heart,
      badge: 'Likes',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      id: 'import' as const,
      label: 'Importar Invitados',
      shortLabel: 'Importar',
      desc: 'Carga masiva por lista',
      icon: UserPlus,
      badge: 'Masivo',
      badgeColor: 'bg-stone-100 text-stone-600 border-stone-200',
    },
    {
      id: 'settings' as const,
      label: 'Atelier & Editar',
      shortLabel: 'Atelier',
      desc: 'Diseño, fotos y simulador',
      icon: Palette,
      badge: 'En Vivo',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300/80',
    },
  ];

  return (
    <>
      {/* ==================================================================== */}
      {/* 1. DESKTOP / TABLET COLLAPSIBLE SIDEBAR (lg and above) */}
      {/* ==================================================================== */}
      <aside
        aria-label="Menú de Navegación del Panel"
        className={`hidden lg:flex flex-col bg-white border-r border-[#E5E2D0] shrink-0 sticky top-16 h-[calc(100vh-64px)] z-30 transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-64 xl:w-72'
        }`}
      >
        {/* Sidebar Header with Collapse Toggle */}
        <div className="p-4 border-b border-[#E5E2D0] flex items-center justify-between gap-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] shrink-0 shadow-2xs font-serif font-bold text-xs">
                {settings.waxSealText || 'W'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-serif font-bold text-stone-900 block truncate">
                  {settings.coupleNames || 'Panel Boda'}
                </span>
                <span className="text-[10px] text-stone-500 block truncate">
                  Gestión & Atelier
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#FAF9F0] border border-[#E5E2D0] flex items-center justify-center text-[#5A5A40] mx-auto shadow-2xs font-serif font-bold text-xs">
              {settings.waxSealText || 'W'}
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-transparent hover:border-[#E5E2D0] transition-colors cursor-pointer shrink-0 ${
              isCollapsed ? 'mx-auto mt-1' : ''
            }`}
            title={isCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#5A5A40]" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-[#5A5A40]" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
              Secciones
            </span>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 rounded-2xl transition-all cursor-pointer text-left relative group ${
                  isCollapsed
                    ? 'p-3 justify-center'
                    : 'p-3 px-3.5 justify-between'
                } ${
                  isActive
                    ? 'bg-[#5A5A40] text-white shadow-xs font-semibold'
                    : 'text-stone-700 hover:bg-[#FAF9F0] hover:text-stone-900 border border-transparent hover:border-[#E5E2D0]'
                }`}
                title={isCollapsed ? `${item.label} (${item.badge})` : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FAF9F0] text-[#5A5A40] group-hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {!isCollapsed && (
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">
                          {item.label}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] truncate ${
                          isActive ? 'text-white/80' : 'text-stone-500'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  )}
                </div>

                {!isCollapsed && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Metrics & Action Links */}
        <div className="p-3 border-t border-[#E5E2D0] bg-[#FAF9F0]/60 space-y-2">
          {!isCollapsed && (
            <div className="p-3 rounded-2xl bg-white border border-[#E5E2D0] space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                  <BarChart3 className="w-3 h-3 text-[#5A5A40]" /> Pases Confirmados
                </span>
                <span className="font-mono font-bold text-[#5A5A40] text-xs">
                  {confirmedPasses} / {totalAllocated}
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#5A5A40] h-full transition-all duration-500"
                  style={{
                    width: `${
                      totalAllocated > 0
                        ? Math.min(100, (confirmedPasses / totalAllocated) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick Invitation Preview Button */}
          {onBackToInvitation && (
            <button
              type="button"
              onClick={onBackToInvitation}
              className={`w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
                isCollapsed ? 'px-2' : 'px-3'
              }`}
              title="Abrir vista de invitación pública"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Ver Invitación</span>}
            </button>
          )}

          {/* Quick Copy Link */}
          <button
            type="button"
            onClick={onCopyInvitationLink}
            className={`w-full py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#E5E2D0] text-[#5A5A40] text-xs font-medium flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
            title="Copiar enlace de la invitación"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {!isCollapsed && <span className="text-emerald-700 truncate font-semibold">¡Copiado!</span>}
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 shrink-0" />
                {!isCollapsed && <span className="truncate">Copiar Enlace</span>}
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MOBILE SLIDE-OVER DRAWER (for small screens < lg) */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobileDrawer}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl border-r border-[#E5E2D0] flex flex-col z-10"
            >
              {/* Drawer Header */}
              <div className="p-4 bg-[#FAF9F0] border-b border-[#E5E2D0] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-serif font-bold text-xs shadow-xs">
                    {settings.waxSealText || 'W'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-serif font-bold text-stone-900 truncate">
                      {settings.coupleNames || 'Panel de Boda'}
                    </h3>
                    <p className="text-[10px] text-stone-500">Menú Principal</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCloseMobileDrawer}
                  className="p-1.5 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-white border border-transparent hover:border-[#E5E2D0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="p-4 space-y-2 flex-1 overflow-y-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2 px-1">
                  Módulos de Gestión
                </span>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobileDrawer();
                      }}
                      className={`w-full p-3 rounded-2xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#5A5A40] text-white shadow-xs font-semibold'
                          : 'bg-[#FAF9F0]/60 hover:bg-[#FAF9F0] text-stone-800 border border-[#E5E2D0]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-white text-[#5A5A40]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold block truncate">
                            {item.label}
                          </span>
                          <span
                            className={`text-[10px] block truncate ${
                              isActive ? 'text-white/80' : 'text-stone-500'
                            }`}
                          >
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white border-white/30'
                            : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#E5E2D0] bg-[#FAF9F0]/60 space-y-2">
                {onBackToInvitation && (
                  <button
                    type="button"
                    onClick={() => {
                      onBackToInvitation();
                      onCloseMobileDrawer();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>Ver Invitación Real</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onCopyInvitationLink}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#E5E2D0] text-[#5A5A40] text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">¡Enlace Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Copiar Enlace de Invitación</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
