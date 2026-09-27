import React, { useId, useState } from 'react';

export interface AdvancedModeGroup {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const AdvancedModeOrganizer: React.FC<{ groups: AdvancedModeGroup[] }> = ({ groups }) => {
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? '');
  const contentId = `advanced-theme-content-${useId().replace(/:/g, '')}`;
  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];

  if (!activeGroup) return null;

  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <div className="rounded-3xl border border-[#E5E2D0] bg-gradient-to-br from-[#FAF9F0] via-white to-[#F0EEDC] p-3.5 sm:p-5 shadow-xs overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-800/10 border border-amber-800/20 text-amber-900 flex items-center justify-center shrink-0">
            <span className="flex items-center justify-center">{activeGroup.icon}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 leading-snug">Modo Avanzado: Configuración por tema</h3>
            <p className="text-[11px] sm:text-xs text-stone-600 mt-1 leading-relaxed">Elige un tema para encontrar juntas sus opciones relacionadas.</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#E5E2D0]/80 grid grid-cols-2 lg:grid-cols-3 gap-2.5">
          {groups.map((group) => {
            const isActive = group.id === activeGroup.id;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={isActive}
                aria-controls={contentId}
                onClick={() => setActiveGroupId(group.id)}
                className={`min-h-[92px] rounded-2xl p-3 sm:p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 min-w-0 overflow-hidden border ${isActive
                  ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs ring-2 ring-[#5A5A40]/30'
                  : 'bg-white/80 text-stone-700 border-[#E5E2D0]/80 hover:bg-white hover:border-[#7D8C7A]'
                  }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/10 text-amber-300' : 'bg-[#FAF9F0] text-[#7D8C7A]'}`}>
                    {group.icon}
                  </span>
                  <span className="text-xs sm:text-sm font-bold leading-tight break-words">{group.title}</span>
                </span>
                <span className={`text-[10px] sm:text-[11px] leading-snug break-words ${isActive ? 'text-white/80' : 'text-stone-500'}`}>
                  {group.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section key={activeGroup.id} id={contentId} className="space-y-4 sm:space-y-5 min-w-0 animate-fadeIn" aria-label={activeGroup.title}>
        <div className="border-b border-[#E5E2D0] pb-3">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">{activeGroup.title}</h3>
          <p className="text-xs text-stone-500 mt-1">{activeGroup.description}</p>
        </div>
        {activeGroup.content}
      </section>
    </div>
  );
};
