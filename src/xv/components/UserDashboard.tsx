import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Plus,
  Crown,
  Users,
  Calendar,
  ExternalLink,
  Settings,
  Trash2,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  ChevronRight,
  Globe,
  Music,
  Camera,
  X,
  Check,
  Search,
  Filter,
  Briefcase,
  Layers,
  SlidersHorizontal,
  Mail,
  UserPlus
} from 'lucide-react';
import { UserProfile, WeddingSummary, PlanId, CardStyle, EventType } from '../../types.ts';
import { SUBSCRIPTION_PLANS } from '../../data/plans.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import { toast } from '../../lib/toast.ts';

interface UserDashboardProps {
  user: UserProfile;
  onSelectWedding: (weddingId: number, mode: 'invitation' | 'admin') => void;
  onLogout: () => void;
  onBackToLanding: () => void;
  onUpdatePlan: (newPlan: PlanId) => void;
  onOpenCeoDashboard?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onSelectWedding,
  onLogout,
  onBackToLanding,
  onUpdatePlan,
  onOpenCeoDashboard,
}) => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingWedding, setIsCreatingWedding] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeCategory, setUpgradeCategory] = useState<'couple' | 'planner'>('planner');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'planning' | 'completed'>('all');
  
  // Delete Confirmation Modal
  const [weddingToDelete, setWeddingToDelete] = useState<WeddingSummary | null>(null);
  const [isDeletingWedding, setIsDeletingWedding] = useState(false);

  // Client assignment modal
  const [isAssignClientModalOpen, setIsAssignClientModalOpen] = useState(false);
  const [selectedWeddingForClient, setSelectedWeddingForClient] = useState<WeddingSummary | null>(null);
  const [clientEmailInput, setClientEmailInput] = useState('');
  const [assignSuccessMessage, setAssignSuccessMessage] = useState<string | null>(null);

  // New Event Form state
  const [newEventType, setNewEventType] = useState<EventType>('xv');
  const [newCoupleNames, setNewCoupleNames] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-11-28');
  const [newEventTime, setNewEventTime] = useState('17:30');
  const [newCardStyle, setNewCardStyle] = useState<CardStyle>('romantic-floral');
  const [newCeremonyVenue, setNewCeremonyVenue] = useState('Parroquia Nuestra Señora del Pilar');
  const [newReceptionVenue, setNewReceptionVenue] = useState('Salón Real de Eventos');
  const [creatingSubmitting, setCreatingSubmitting] = useState(false);

  const isCeo = user.role === 'ceo' || user.email === 'daviex14@gmail.com';
  const isWeddingPlanner = isCeo || user.role === 'wedding_planner' || user.plan?.startsWith('planner_');

  const fetchWeddings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/weddings?uid=${encodeURIComponent(user.uid)}`);
      if (res.ok) {
        const data = await res.json();
        setWeddings(data);
      }
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddings();
  }, [user.uid]);

  const handleCreateWedding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupleNames.trim()) return;

    setCreatingSubmitting(true);
    try {
      const res = await fetch('/api/user/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerUid: user.uid,
          coupleNames: newCoupleNames.trim(),
          eventType: newEventType,
          eventDate: newEventDate,
          eventTime: newEventTime,
          cardStyle: newCardStyle,
          ceremonyVenue: newCeremonyVenue,
          receptionVenue: newReceptionVenue,
        }),
      });

      if (res.ok) {
        setIsCreatingWedding(false);
        setNewCoupleNames('');
        fetchWeddings();
        const eventLabel = newEventType === 'xv' ? 'XV Años' : 'Boda';
        toast.success(`${eventLabel} "${newCoupleNames}" creado exitosamente`, `${eventLabel} Creado`);
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'No se pudo crear el evento', 'Error');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      toast.error('Error al crear el evento', 'Error');
    } finally {
      setCreatingSubmitting(false);
    }
  };

  const handleDeleteWedding = (wedding: WeddingSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wedding.id === 1 || wedding.id === 5) {
      toast.warning('El evento de demostración no puede ser eliminado.');
      return;
    }
    setWeddingToDelete(wedding);
  };

  const confirmDeleteWedding = async () => {
    if (!weddingToDelete) return;
    setIsDeletingWedding(true);
    try {
      const res = await fetch(`/api/user/weddings/${weddingToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Proyecto "${weddingToDelete.coupleNames}" eliminado correctamente`, 'Eliminado');
        setWeddingToDelete(null);
        fetchWeddings();
      } else {
        toast.error('No se pudo eliminar el proyecto', 'Error');
      }
    } catch (err) {
      console.error('Error deleting wedding:', err);
      toast.error('Ocurrió un error al eliminar el proyecto', 'Error');
    } finally {
      setIsDeletingWedding(false);
    }
  };

  const handleCopyLink = (slug: string, weddingId: number, eventType?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isXv = eventType === 'xv' || (slug && slug.toLowerCase().startsWith('xv'));
    const eventParam = isXv ? '?event=xv' : '?event=bodas';
    const url = slug 
      ? `${window.location.origin}/${slug}${eventParam}` 
      : `${window.location.origin}/${eventParam}&w=${weddingId}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug || String(weddingId));
    toast.success('Enlace de invitación copiado al portapapeles', 'Enlace Copiado');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  const handleSaveClientAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingForClient) return;

    try {
      const res = await fetch('/api/wedding/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: selectedWeddingForClient.id,
          status: (selectedWeddingForClient as any).status || 'active',
          clientEmail: clientEmailInput.trim(),
        }),
      });

      if (res.ok) {
        setIsAssignClientModalOpen(false);
        setAssignSuccessMessage(`Acceso asignado a ${clientEmailInput}`);
        setTimeout(() => setAssignSuccessMessage(null), 3000);
        fetchWeddings();
      }
    } catch (err) {
      console.error('Error assigning client email:', err);
    }
  };

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === user.plan) || SUBSCRIPTION_PLANS[0];

  const filteredWeddings = weddings.filter((w) => {
    const matchesSearch =
      w.coupleNames?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.hashtag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div id="user-dashboard-root" className="min-h-screen bg-[#faf8f5] text-stone-800 font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-18 flex items-center justify-between">
          {/* Logo & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full aspect-square shrink-0 circle-badge bg-pink-800/10 border border-pink-800/20 flex items-center justify-center text-pink-900 shadow-inner">
                <Crown className="w-4 h-4 text-pink-600" />
              </div>
              <div className="text-left">
                <span className="font-serif text-lg font-bold text-stone-900 leading-tight block">
                  Atelier XV Años
                </span>
                <span className="text-[10px] uppercase tracking-wider text-pink-800 font-bold flex items-center gap-1">
                  {isCeo ? '👑 CEO & Control Total' : isWeddingPlanner ? '💼 Panel Event Planner XV' : 'Panel de Quinceañera'}
                </span>
              </div>
            </button>
          </div>

          {/* User Profile & Plan Badge & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* CEO Shortcut Button */}
            {isCeo && onOpenCeoDashboard && (
              <button
                onClick={onOpenCeoDashboard}
                className="px-3.5 py-1.5 rounded-full bg-stone-950 hover:bg-stone-900 text-amber-400 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer hover:scale-105"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Panel Maestro CEO</span>
              </button>
            )}

            {/* Plan Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/70 text-xs font-semibold text-amber-900">
              <Crown className="w-3.5 h-3.5 text-amber-700" />
              <span>{currentPlan.name}</span>
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="ml-1 text-[11px] underline hover:text-amber-700 font-bold cursor-pointer"
              >
                Cambiar Plan
              </button>
            </div>

            {/* User Info */}
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-stone-900">{user.name || 'Mi Cuenta'}</div>
              <div className="text-[11px] text-stone-500">{user.email}</div>
            </div>

            {/* Logout */}
            <button
              id="btn-dashboard-logout"
              onClick={onLogout}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Success Notification */}
      {assignSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-900 text-white shadow-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{assignSuccessMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8 sm:py-10">
        {/* Welcome & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {isWeddingPlanner ? 'Gestión Centralizada de XV Años' : 'Mis Invitaciones de XV Años'}
              </h1>
              {isWeddingPlanner && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider border border-amber-300">
                  {currentPlan.maxWeddings === 'unlimited' ? 'Eventos Ilimitados' : `${currentPlan.maxWeddings} Eventos`}
                </span>
              )}
            </div>
            <p className="text-sm text-stone-600">
              {isWeddingPlanner
                ? 'Panel para organizadores profesionales: crea, edita y administra invitaciones para tus quinceañeras.'
                : 'Gestiona tu invitación digital, lista de invitados, pases y mesa de regalos.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-open-create-wedding-modal"
              onClick={() => setIsCreatingWedding(true)}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{isWeddingPlanner ? 'Nuevo Evento de Cliente' : 'Crear Nueva Invitación'}</span>
            </button>
          </div>
        </div>

        {/* Wedding Planner Quota / Plan Summary Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50/90 via-stone-50 to-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-800/10 text-amber-900 border border-amber-800/20 flex items-center justify-center shrink-0">
              {isCeo ? <Crown className="w-6 h-6 fill-amber-700/20" /> : <Briefcase className="w-6 h-6" />}
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 flex items-center gap-2 flex-wrap">
                <span>Tu plan actual:</span>
                <span className="text-amber-900 font-extrabold">{currentPlan.name}</span>
                <span className="text-xs px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold border border-amber-200">
                  {currentPlan.price} {currentPlan.billingPeriod}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed max-w-2xl">
                {isCeo
                  ? 'Como CEO tienes control total sobre todas las celebraciones, usuarios y analíticas de la plataforma sin límites.'
                  : isWeddingPlanner
                  ? `Tienes capacidad para ${currentPlan.maxWeddings === 'unlimited' ? 'eventos ilimitados' : `${currentPlan.maxWeddings} eventos simultáneos`} con invitaciones y pases WhatsApp ilimitados.`
                  : 'Diseño artesanal, confirmación RSVP y sobre interactivo con lacre digital.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Explorar Planes Planner & Parejas
            </button>
          </div>
        </div>

        {/* Search & Filter Bar (for Wedding Planners) */}
        {weddings.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por novios o hashtag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="text-xs text-stone-500 font-medium">
              Mostrando <strong>{filteredWeddings.length}</strong> de <strong>{weddings.length}</strong> celebraciones registradas
            </div>
          </div>
        )}

        {/* Weddings List Grid */}
        {loading ? (
          <div className="py-16 text-center text-stone-500 text-sm">
            Cargando proyectos de eventos...
          </div>
        ) : filteredWeddings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200/80 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full aspect-square shrink-0 circle-badge bg-pink-100 text-pink-700 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
              No se encontraron eventos
            </h3>
            <p className="text-xs text-stone-600 mb-6">
              Comienza creando una nueva invitación de XV Años o Boda para tu celebración.
            </p>
            <button
              onClick={() => setIsCreatingWedding(true)}
              className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-xl shadow hover:bg-stone-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-pink-400" />
              <span>Crear Evento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeddings.map((w) => (
              <motion.div
                key={w.id}
                id={`wedding-card-${w.id}`}
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 pb-3 border-b border-stone-100 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          w.eventType === 'xv' || (w.slug && w.slug.toLowerCase().startsWith('xv'))
                            ? 'bg-pink-100 text-pink-900 border border-pink-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {w.eventType === 'xv' || (w.slug && w.slug.toLowerCase().startsWith('xv')) ? '👑 XV Años' : '💍 Boda'}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                          Estilo: {w.cardStyle || 'Rose Gold'}
                        </span>
                        {(w as any).clientEmail && (
                          <span className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-mono">
                            Cliente: {(w as any).clientEmail}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-xl font-bold text-stone-900 leading-tight">
                        {w.coupleNames}
                      </h3>
                      {w.hashtag && (
                        <p className="text-xs text-stone-500 mt-0.5 font-sans font-medium">
                          {w.hashtag}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isWeddingPlanner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWeddingForClient(w);
                            setClientEmailInput((w as any).clientEmail || '');
                            setIsAssignClientModalOpen(true);
                          }}
                          className="p-1.5 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Asignar acceso a Novios / Cliente"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}

                      {w.id !== 1 && (
                        <button
                          onClick={(e) => handleDeleteWedding(w, e)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar Proyecto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center text-xs text-stone-600 gap-2">
                      <Calendar className="w-4 h-4 text-amber-800/80" />
                      <span>{w.eventDate ? w.eventDate.substring(0, 10) : 'Fecha por definir'}</span>
                    </div>

                    <div className="flex items-center text-xs text-stone-600 gap-2">
                      <Users className="w-4 h-4 text-amber-800/80" />
                      <span>
                        <strong>{w.confirmedGuests || 0}</strong> confirmados de{' '}
                        <strong>{w.totalGuests || 0}</strong> invitados
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-800 h-full rounded-full transition-all"
                          style={{
                            width: `${
                              (w.totalGuests || 0) > 0 ? ((w.confirmedGuests || 0) / (w.totalGuests || 1)) * 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectWedding(w.id, 'invitation')}
                    className="flex-1 py-2 px-3 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Invitación</span>
                  </button>

                  <button
                    onClick={() => onSelectWedding(w.id, 'admin')}
                    className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Atelier / Editar</span>
                  </button>

                  <button
                    onClick={(e) => handleCopyLink(w.slug, w.id, w.eventType, e)}
                    className="p-2 bg-white hover:bg-stone-100 text-stone-600 rounded-xl border border-stone-200 transition-colors shrink-0"
                    title="Copiar enlace para compartir"
                  >
                    {copiedSlug === w.slug ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: CREATE WEDDING */}
      <AnimatePresence>
        {isCreatingWedding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-stone-200/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-stone-800 my-8"
            >
              <button
                onClick={() => setIsCreatingWedding(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full aspect-square shrink-0 circle-badge bg-pink-50 text-pink-700 mb-3">
                  <Crown className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {newEventType === 'xv'
                    ? (isWeddingPlanner ? 'Nuevo Evento XV Años para Cliente' : 'Crea tu Invitación de Quince Años')
                    : (isWeddingPlanner ? 'Nueva Boda para Cliente' : 'Crea tu Nueva Invitación de Boda')}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Ingresa los detalles principales. Podrás configurar música, itinerario y fotos en el Atelier.
                </p>
              </div>

              <form onSubmit={handleCreateWedding} className="space-y-4">
                {/* Event Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Tipo de Celebración *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewEventType('xv')}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        newEventType === 'xv'
                          ? 'bg-pink-50 border-pink-400 text-pink-950 shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5 text-pink-600" />
                      <span>Fiesta de XV Años</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEventType('bodas')}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        newEventType === 'bodas'
                          ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 text-amber-700" />
                      <span>Boda Nupcial</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {newEventType === 'xv' ? 'Nombre de la Quinceañera *' : 'Nombres de los Novios *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newEventType === 'xv' ? 'Ej. Valeria Montserrat' : 'Ej. Sofía & Alejandro'}
                    value={newCoupleNames}
                    onChange={(e) => setNewCoupleNames(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-700 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Fecha del Evento *
                    </label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Estilo de Tarjeta
                    </label>
                    <select
                      value={newCardStyle}
                      onChange={(e) => setNewCardStyle(e.target.value as CardStyle)}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-700 focus:outline-none font-medium"
                    >
                      {newEventType === 'xv' ? (
                        <>
                          <option value="romantic-floral">Rose Gold & Princesa Real</option>
                          <option value="classic-gold">Dorado Real & Tiara</option>
                          <option value="lavender-provence">Sweet Lavanda & Mariposas</option>
                          <option value="emerald-prestige">Emerald Fairy & Bosque</option>
                          <option value="midnight-stellar">Midnight Galaxia & Estrellas</option>
                          <option value="cherry-blossom">Sakura Cerezo de Ensueño</option>
                        </>
                      ) : (
                        <>
                          <option value="classic-gold">Classic Gold & Marfil</option>
                          <option value="romantic-floral">Romantic Floral Rosé</option>
                          <option value="boho-chic">Boho Terracotta</option>
                          <option value="minimal-editorial">Minimalist Editorial</option>
                          <option value="dark-luxury">Dark Velvet Luxury</option>
                          <option value="watercolor-garden">Watercolor Garden</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Lugar de la Misa / Ceremonia
                  </label>
                  <input
                    type="text"
                    value={newCeremonyVenue}
                    onChange={(e) => setNewCeremonyVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Lugar de Fiesta / Recepción
                  </label>
                  <input
                    type="text"
                    value={newReceptionVenue}
                    onChange={(e) => setNewReceptionVenue(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-700 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsCreatingWedding(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingSubmitting}
                    className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {creatingSubmitting ? 'Creando...' : 'Crear y Personalizar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ASSIGN CLIENT EMAIL (WEDDING PLANNER TOOL) */}
      <AnimatePresence>
        {isAssignClientModalOpen && selectedWeddingForClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-stone-200/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-stone-800"
            >
              <button
                onClick={() => setIsAssignClientModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Asignar Pareja / Cliente
                  </h3>
                  <p className="text-xs text-stone-500">
                    Evento: {selectedWeddingForClient.coupleNames}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveClientAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Correo Electrónico de los Novios:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="novios@gmail.com"
                    value={clientEmailInput}
                    onChange={(e) => setClientEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700 focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-500 mt-1.5">
                    Permite que los novios inicien sesión con este correo para ver y consultar su lista de confirmaciones RSVP.
                  </p>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAssignClientModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Guardar Asignación
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SUBSCRIPTION UPGRADE & PLAN SELECTION */}
      <AnimatePresence>
        {isUpgradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white border border-stone-200/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-10 text-stone-800 my-8"
            >
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center max-w-2xl mx-auto mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800 block mb-1">
                  Planes & Membresías
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  Elige el plan que se adapte a tus proyectos
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-2">
                  Planes individuales para una celebración o planes profesionales para Organizadores y Agencias de eventos.
                </p>

                {/* Plan Category Switcher */}
                <div className="inline-flex bg-stone-100 p-1 rounded-2xl mt-5 border border-stone-200">
                  <button
                    onClick={() => setUpgradeCategory('couple')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      upgradeCategory === 'couple'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    💖 Plan Individual (1 Celebración)
                  </button>
                  <button
                    onClick={() => setUpgradeCategory('planner')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      upgradeCategory === 'planner'
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    💼 Para Wedding Planners & Agencias
                  </button>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.filter((p) => p.category === upgradeCategory && p.id !== 'ceo_unlimited').map((plan) => {
                  const isCurrent = user.plan === plan.id;
                  const isPopular = plan.popular;

                  return (
                    <div
                      key={plan.id}
                      className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                        isPopular
                          ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-xl'
                          : 'bg-stone-50/70 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isPopular ? 'bg-amber-400 text-stone-950' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {plan.badge}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold mb-1">
                          {plan.name}
                        </h3>

                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-2xl font-serif font-bold">
                            {plan.price}
                          </span>
                          <span className="text-[11px] opacity-70">
                            / {plan.billingPeriod}
                          </span>
                        </div>

                        <p className="text-xs opacity-80 leading-relaxed mb-5">
                          {plan.description}
                        </p>

                        <div className="space-y-2 mb-6">
                          {plan.features.slice(0, 5).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs opacity-90">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        disabled={isCurrent}
                        onClick={() => {
                          onUpdatePlan(plan.id);
                          setIsUpgradeModalOpen(false);
                        }}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-stone-200 text-stone-500 cursor-default'
                            : isPopular
                            ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md'
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        {isCurrent ? 'Plan Actual' : `Activar ${plan.name}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Wedding Deletion */}
      <ConfirmModal
        isOpen={Boolean(weddingToDelete)}
        title="¿Eliminar Proyecto de Invitación?"
        message={`¿Estás seguro de que deseas eliminar el evento de "${weddingToDelete?.coupleNames}"?\nSe borrarán permanentemente sus configuraciones, invitados y fotos asociadas.`}
        confirmText="Eliminar Proyecto"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeletingWedding}
        onConfirm={confirmDeleteWedding}
        onCancel={() => setWeddingToDelete(null)}
      />
    </div>
  );
};
