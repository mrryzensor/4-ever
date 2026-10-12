import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Guest, WeddingSettings, GuestStats, UserProfile } from '../types.ts';
import { applyThemeScrollbar } from '../lib/themes.ts';
import { AdminHeader } from './admin/AdminHeader.tsx';
import { AdminSidebar } from './admin/AdminSidebar.tsx';
import { AdminGuestsTab } from './admin/AdminGuestsTab.tsx';
import { AdminImportTab } from './admin/AdminImportTab.tsx';
import { AdminSettingsTab } from './admin/AdminSettingsTab.tsx';
import { AdminGalleryTab } from './admin/AdminGalleryTab.tsx';
import { ConfirmModal } from './ConfirmModal.tsx';
import { toast } from '../lib/toast.ts';
import { applyWeddingSettingsChange } from '../lib/eventUtils.ts';
import { buildInvitationShareMessage, getInvitationShareImageUrl, sendInvitationMessage } from '../lib/invitationSharing.ts';

interface AdminDashboardProps {
  settings: WeddingSettings;
  initialTab?: 'guests' | 'settings';
  onUpdateSettings: (updated: Partial<WeddingSettings>) => void;
  onClose?: () => void;
  onBackToDashboard?: () => void;
  onBackToInvitation?: () => void;
  currentUser?: UserProfile | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  initialTab = 'settings',
  onUpdateSettings,
  onClose,
  onBackToDashboard,
  onBackToInvitation,
  currentUser: propUser,
}) => {
  const [activeTab, setActiveTab] = useState<'guests' | 'settings' | 'import' | 'gallery'>(initialTab);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats>({
    totalGuests: 0,
    totalAllocatedPasses: 0,
    totalConfirmedPasses: 0,
    declinedGuests: 0,
    pendingGuests: 0,
    confirmedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const guestRequestSequenceRef = useRef(0);
  const latestWeddingIdRef = useRef(settings.id || 1);
  const loadedStatsWeddingIdRef = useRef<number | null>(null);
  const statsRequestWeddingIdRef = useRef<number | null>(null);
  const statsRequestIdRef = useRef<number | null>(null);
  const guestRequestsRef = useRef<Array<{ requestId: number; includeStats: boolean; controller: AbortController }>>([]);
  latestWeddingIdRef.current = settings.id || 1;
  const [copiedLink, setCopiedLink] = useState(false);

  // Sidebar collapsible state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Delete Confirmation Modal
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [isDeletingGuest, setIsDeletingGuest] = useState(false);

  // Settings Edit State
  const [tempSettings, setTempSettings] = useState<WeddingSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);
  const [atelierViewMode, setAtelierViewMode] = useState<'split' | 'config' | 'preview'>('split');

  // Keep local tempSettings synced if props update
  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSettingsChange = useCallback((updated: Partial<WeddingSettings>) => {
    setTempSettings((prev) => applyWeddingSettingsChange(prev, updated));
  }, []);

  // Update theme-reactive scrollbars when theme changes
  useEffect(() => {
    if (tempSettings?.cardStyle) {
      applyThemeScrollbar(tempSettings.cardStyle);
    }
  }, [tempSettings?.cardStyle]);

  const fetchGuests = useCallback(async (refreshStats = false) => {
    const weddingId = settings.id || 1;
    const includeStats = refreshStats
      || (loadedStatsWeddingIdRef.current !== weddingId && statsRequestWeddingIdRef.current !== weddingId);
    const requestId = ++guestRequestSequenceRef.current;
    if (includeStats) {
      statsRequestWeddingIdRef.current = weddingId;
      statsRequestIdRef.current = requestId;
    }
    guestRequestsRef.current = guestRequestsRef.current.filter((request) => {
      if (!request.includeStats) request.controller.abort();
      return request.includeStats;
    });
    const controller = new AbortController();
    guestRequestsRef.current.push({ requestId, includeStats, controller });

    try {
      setLoading(true);
      const params = new URLSearchParams({ weddingId: String(weddingId), includeStats: String(includeStats) });
      if (search.trim()) params.set('search', search.trim());
      if (filterStatus !== 'all') params.set('status', filterStatus);

      const res = await fetch(`/api/guests?${params}`, { signal: controller.signal });
      if (!res.ok) throw new Error('No se pudieron cargar los invitados.');
      const data = await res.json();
      if (data.guests && requestId === guestRequestSequenceRef.current) {
        setGuests(data.guests);
      }
      if (data.stats && requestId === statsRequestIdRef.current && weddingId === latestWeddingIdRef.current) {
        setStats(data.stats);
        loadedStatsWeddingIdRef.current = weddingId;
        statsRequestWeddingIdRef.current = null;
      }
    } catch (err) {
      if (!controller.signal.aborted) console.error('Error fetching guests in admin:', err);
      if (includeStats && statsRequestIdRef.current === requestId) statsRequestWeddingIdRef.current = null;
    } finally {
      guestRequestsRef.current = guestRequestsRef.current.filter((request) => request.requestId !== requestId);
      if (requestId === guestRequestSequenceRef.current) setLoading(false);
    }
  }, [filterStatus, search, settings.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchGuests(); }, search.trim() ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [fetchGuests]);

  useEffect(() => () => {
    guestRequestsRef.current.forEach((request) => request.controller.abort());
  }, []);

  const handleDeleteGuest = (id: number) => {
    const target = guests.find((g) => g.id === id);
    if (target) {
      setGuestToDelete(target);
    }
  };

  const confirmDeleteGuest = async () => {
    if (!guestToDelete) return;
    setIsDeletingGuest(true);
    try {
      await fetch(`/api/guests/${guestToDelete.id}`, { method: 'DELETE' });
      setGuests((prev) => prev.filter((g) => g.id !== guestToDelete.id));
      toast.success(`Invitado "${guestToDelete.fullName}" eliminado`, 'Eliminado');
      setGuestToDelete(null);
      void fetchGuests(true);
    } catch (err) {
      console.error('Error deleting guest:', err);
      toast.error('Error al eliminar el invitado', 'Error');
    } finally {
      setIsDeletingGuest(false);
    }
  };

  const exportCsv = () => {
    const headers = [
      'Nombre',
      'Código',
      'Grupo',
      'Pases Asignados',
      'Pases Confirmados',
      'Estado',
      'Teléfono',
      'Email',
      'Restricciones',
      'Canción DJ',
      'Mensaje',
    ];
    const rows = guests.map((g) => [
      `"${g.fullName}"`,
      `"${g.accessCode}"`,
      `"${g.groupName || ''}"`,
      g.allocatedPasses,
      g.confirmedPasses,
      `"${g.status}"`,
      `"${g.phone || ''}"`,
      `"${g.email || ''}"`,
      `"${(g.dietaryRestrictions || '').replace(/"/g, '""')}"`,
      `"${(g.suggestedSong || '').replace(/"/g, '""')}"`,
      `"${(g.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `lista_invitados_boda_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWhatsAppLink = (guest: Guest) => {
    const inviteUrl = settings.slug 
      ? `${window.location.origin}/${encodeURIComponent(settings.slug)}?code=${encodeURIComponent(guest.accessCode)}`
      : `${window.location.origin}/?w=${encodeURIComponent(settings.id || 1)}&code=${encodeURIComponent(guest.accessCode)}`;
    const text = `¡Hola ${guest.fullName}! ✨ Con inmensa alegría queremos invitarte a nuestra boda (${settings.coupleNames}). Puedes consultar tu invitación personal y confirmar tu asistencia en el siguiente enlace: ${inviteUrl} (Tu código: ${guest.accessCode}). ¡Esperamos contar con tu compañía! 💕`;
    return `https://wa.me/${
      guest.phone ? guest.phone.replace(/[^0-9]/g, '') : ''
    }?text=${encodeURIComponent(text)}`;
  };

  const handleCopyInvitationLink = async () => {
    setCopiedLink(false);
    const message = buildInvitationShareMessage(tempSettings, window.location.origin);
    const imageUrl = getInvitationShareImageUrl(tempSettings, window.location.origin);
    const result = await sendInvitationMessage(message, 'Invitación de ' + tempSettings.coupleNames, imageUrl);
    if (result === 'copied') {
      setCopiedLink(true);
      toast.success('Mensaje con enlace copiado. Ya puedes pegarlo en tu aplicación de mensajería.', 'Listo para compartir');
      setTimeout(() => setCopiedLink(false), 3000);
    } else if (result === 'failed') {
      toast.error('No se pudo abrir el menú para compartir.', 'Error al compartir');
    }
  };

  const handleSaveAllSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/wedding-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempSettings),
      });
      const updated = await res.json();
      onUpdateSettings(updated);
      setSettingsSavedToast(true);
      toast.success('Configuración y personalizaciones guardadas correctamente', 'Guardado');
      setTimeout(() => setSettingsSavedToast(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar configuración', 'Error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-[#3D3D3D] flex flex-col font-sans selection:bg-[#7D8C7A]/20 selection:text-[#5A5A40]">
      {/* 1. Universal Top SaaS Header & Breadcrumb Bar */}
      <AdminHeader
        settings={tempSettings}
        currentUser={propUser}
        onBackToDashboard={onBackToDashboard}
        onBackToInvitation={onBackToInvitation}
        onClose={onClose}
        onCopyInvitationLink={handleCopyInvitationLink}
        copiedLink={copiedLink}
        onToggleSidebar={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* 2. Main Dashboard Layout with Collapsible Sidebar & Content Area */}
      <div className="flex flex-1 w-full min-h-[calc(100vh-64px)]">
        {/* Collapsible / Hideable Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          stats={stats}
          totalGuests={stats.totalGuests}
          settings={tempSettings}
          onBackToInvitation={onBackToInvitation}
          onCopyInvitationLink={handleCopyInvitationLink}
          copiedLink={copiedLink}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileDrawerOpen={isMobileDrawerOpen}
          onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        />

        {/* 3. Main Dynamic Content Body */}
        <main className="flex-1 min-w-0 p-2.5 sm:p-4 lg:p-5 overflow-x-hidden overflow-y-auto">
          {/* TAB 1: GUESTS & RSVP LIST */}
          {activeTab === 'guests' && (
            <AdminGuestsTab
              stats={stats}
              guests={guests}
              loading={loading}
              search={search}
              filterStatus={filterStatus}
              settings={settings}
              onSearchChange={setSearch}
              onFilterStatusChange={setFilterStatus}
              onSaveGuest={async (guestData) => {
                if (guestData.id) {
                  const res = await fetch(`/api/guests/${guestData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(guestData),
                  });
                  const updated = await res.json();
                  setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
                } else {
                  const res = await fetch('/api/guests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      weddingId: settings.id || 1,
                      ...guestData,
                    }),
                  });
                  const created = await res.json();
                  setGuests((prev) => [created, ...prev]);
                }
                await fetchGuests(true);
              }}
              onDeleteGuest={handleDeleteGuest}
              onExportCsv={exportCsv}
              onRefresh={() => fetchGuests(true)}
              onGuestsImported={() => fetchGuests(true)}
            />
          )}

          {/* TAB 2: GALLERY METRICS & GUEST COMMENTS */}
          {activeTab === 'gallery' && (
            <AdminGalleryTab settings={tempSettings} />
          )}

          {/* TAB 3: IMPORT GUESTS IN BULK */}
          {activeTab === 'import' && (
            <AdminImportTab
              weddingId={settings.id || 1}
              onGuestsImported={() => fetchGuests(true)}
            />
          )}

          {/* TAB 4: WEDDING SETTINGS & ATELIER DESIGN */}
          {activeTab === 'settings' && (
            <AdminSettingsTab
              settings={tempSettings}
              onChange={handleSettingsChange}
              atelierViewMode={atelierViewMode}
              setAtelierViewMode={setAtelierViewMode}
              onSaveAllSettings={handleSaveAllSettings}
              savingSettings={savingSettings}
              settingsSavedToast={settingsSavedToast}
              onBackToInvitation={onBackToInvitation || (() => {})}
            />
          )}
        </main>
      </div>

      {/* Confirmation Modal for Guest Deletion */}
      <ConfirmModal
        isOpen={Boolean(guestToDelete)}
        title="¿Eliminar Invitado?"
        message={`¿Estás seguro de que deseas eliminar a "${guestToDelete?.fullName}" de la lista de invitados?\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar Invitado"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeletingGuest}
        onConfirm={confirmDeleteGuest}
        onCancel={() => setGuestToDelete(null)}
      />
    </div>
  );
};
