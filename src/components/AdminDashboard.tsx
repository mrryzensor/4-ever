import React, { useState, useEffect } from 'react';
import { User, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
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

interface AdminDashboardProps {
  settings: WeddingSettings;
  onUpdateSettings: (updated: Partial<WeddingSettings>) => void;
  onClose?: () => void;
  onBackToDashboard?: () => void;
  onBackToInvitation?: () => void;
  currentUser?: UserProfile | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  onUpdateSettings,
  onClose,
  onBackToDashboard,
  onBackToInvitation,
  currentUser: propUser,
}) => {
  const [activeTab, setActiveTab] = useState<'guests' | 'settings' | 'import' | 'gallery'>('settings');
  const [, setFirebaseUser] = useState<User | null>(auth.currentUser);
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

  // Update theme-reactive scrollbars when theme changes
  useEffect(() => {
    if (tempSettings?.cardStyle) {
      applyThemeScrollbar(tempSettings.cardStyle);
    }
  }, [tempSettings?.cardStyle]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      let url = `/api/guests?weddingId=${settings.id || 1}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.guests) {
        setGuests(data.guests);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching guests in admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [search, filterStatus, settings.id]);

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
      fetchGuests();
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
    const weddingKey = settings.slug || settings.id || 1;
    const inviteUrl = `${window.location.origin}/?w=${encodeURIComponent(weddingKey)}&code=${encodeURIComponent(guest.accessCode)}`;
    const text = `¡Hola ${guest.fullName}! ✨ Con inmensa alegría queremos invitarte a nuestra boda (${settings.coupleNames}). Puedes consultar tu invitación personal y confirmar tu asistencia en el siguiente enlace: ${inviteUrl} (Tu código: ${guest.accessCode}). ¡Esperamos contar con tu compañía! 💕`;
    return `https://wa.me/${
      guest.phone ? guest.phone.replace(/[^0-9]/g, '') : ''
    }?text=${encodeURIComponent(text)}`;
  };

  const handleCopyInvitationLink = () => {
    const url = `${window.location.origin}/?w=${settings.slug || settings.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
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
        settings={settings}
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
          settings={settings}
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
                fetchGuests();
              }}
              onDeleteGuest={handleDeleteGuest}
              onExportCsv={exportCsv}
              onGuestsImported={fetchGuests}
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
              onGuestsImported={fetchGuests}
            />
          )}

          {/* TAB 4: WEDDING SETTINGS & ATELIER DESIGN */}
          {activeTab === 'settings' && (
            <AdminSettingsTab
              settings={tempSettings}
              onChange={(updated) =>
                setTempSettings((prev) => ({ ...prev, ...updated }))
              }
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
