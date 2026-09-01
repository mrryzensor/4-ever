import React from 'react';
import { Users, UserPlus, Palette } from 'lucide-react';
import { GuestStats } from '../../types.ts';

interface AdminNavTabsProps {
  activeTab: 'guests' | 'settings' | 'import';
  setActiveTab?: (tab: 'guests' | 'settings' | 'import') => void;
  onTabChange?: (tab: 'guests' | 'settings' | 'import') => void;
  stats?: GuestStats;
  totalGuests?: number;
}

export const AdminNavTabs: React.FC<AdminNavTabsProps> = ({
  activeTab,
  setActiveTab,
  onTabChange,
  stats,
  totalGuests,
}) => {
  const handleSelectTab = (tab: 'guests' | 'settings' | 'import') => {
    if (onTabChange) onTabChange(tab);
    if (setActiveTab) setActiveTab(tab);
  };

  const guestCount = typeof totalGuests === 'number' ? totalGuests : (stats?.totalGuests ?? 0);
  return (
    <div className="bg-[#F9F7EF] border-b border-[#E5E2D0] sticky top-16 z-30 shadow-2xs">
      <div className="w-full px-2 sm:px-6 lg:px-8">
        {/* Mobile Grid Tab Bar (100% responsive, no clipping or weird overflow) */}
        <div className="grid grid-cols-3 sm:flex sm:items-center sm:gap-2 pt-2 pb-2 sm:pb-0">
          <button
            onClick={() => handleSelectTab('guests')}
            className={`py-2.5 sm:px-5 sm:py-3 text-xs font-semibold rounded-xl sm:rounded-t-2xl sm:rounded-b-none transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'guests'
                ? 'bg-white sm:bg-[#FDFCF0] text-[#5A5A40] shadow-xs sm:shadow-none sm:border-t-2 sm:border-[#5A5A40] font-bold'
                : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/40'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-[11px] sm:text-xs">Invitados & RSVP</span>
            <span className="text-[10px] bg-[#E5E2D0]/60 px-1.5 py-0.2 rounded-full font-mono">
              {guestCount}
            </span>
          </button>

          <button
            onClick={() => handleSelectTab('import')}
            className={`py-2.5 sm:px-5 sm:py-3 text-xs font-semibold rounded-xl sm:rounded-t-2xl sm:rounded-b-none transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'import'
                ? 'bg-white sm:bg-[#FDFCF0] text-[#5A5A40] shadow-xs sm:shadow-none sm:border-t-2 sm:border-[#5A5A40] font-bold'
                : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/40'
            }`}
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span className="text-[11px] sm:text-xs">Importar</span>
          </button>

          <button
            onClick={() => handleSelectTab('settings')}
            className={`py-2.5 sm:px-5 sm:py-3 text-xs font-semibold rounded-xl sm:rounded-t-2xl sm:rounded-b-none transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${
              activeTab === 'settings'
                ? 'bg-white sm:bg-[#FDFCF0] text-[#5A5A40] shadow-xs sm:shadow-none sm:border-t-2 sm:border-[#5A5A40] font-bold'
                : 'text-[#7D8C7A] hover:text-[#1a1a1a] hover:bg-white/40'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span className="text-[11px] sm:text-xs">Atelier & Editar</span>
            <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300/60 px-1.5 py-0.5 rounded-full font-bold uppercase hidden md:inline">
              Simulador en Vivo
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
