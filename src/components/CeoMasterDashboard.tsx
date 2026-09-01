import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Sparkles,
  Users,
  Heart,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  ShieldCheck,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Briefcase,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Mail,
  Smartphone,
  Tag,
  Share2,
  Filter,
  Check
} from 'lucide-react';
import { UserProfile, PlanId, CardStyle, UserRole } from '../types.ts';
import { SUBSCRIPTION_PLANS } from '../data/plans.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import { toast } from '../lib/toast.ts';

interface CeoMasterDashboardProps {
  currentUser: UserProfile;
  onSelectWedding: (weddingId: number, mode: 'invitation' | 'admin') => void;
  onBackToUserDashboard: () => void;
  onLogout: () => void;
}

interface CeoStats {
  totalWeddings: number;
  totalUsers: number;
  weddingPlanners: number;
  couples: number;
  totalGuests: number;
  confirmedGuests: number;
  totalPasses: number;
  confirmedPasses: number;
  estimatedRevenue: number;
  planBreakdown: Record<string, number>;
}

interface GlobalWedding {
  id: number;
  ownerUid: string;
  ownerName: string;
  ownerEmail: string;
  ownerRole: string;
  coupleNames: string;
  hashtag: string;
  eventDate: string;
  slug: string;
  cardStyle: CardStyle;
  isPublished: boolean;
  status?: string;
  clientEmail?: string;
  totalGuests: number;
  confirmedGuests: number;
  coverPhoto?: string;
}

interface GlobalUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  role: string;
  plan: PlanId;
  agencyName?: string;
  phone?: string;
  weddingsCount: number;
  createdAt: string;
  weddings?: Array<{ id: number; coupleNames: string; eventDate: string }>;
}

export const CeoMasterDashboard: React.FC<CeoMasterDashboardProps> = ({
  currentUser,
  onSelectWedding,
  onBackToUserDashboard,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'weddings' | 'planners' | 'plans'>('metrics');
  const [stats, setStats] = useState<CeoStats | null>(null);
  const [weddings, setWeddings] = useState<GlobalWedding[]>([]);
  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [weddingFilterStatus, setWeddingFilterStatus] = useState<string>('all');
  
  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedWeddingToTransfer, setSelectedWeddingToTransfer] = useState<GlobalWedding | null>(null);
  const [newOwnerUid, setNewOwnerUid] = useState('');
  const [isCreatingWeddingModal, setIsCreatingWeddingModal] = useState(false);
  
  // New Wedding Form by CEO
  const [createForUid, setCreateForUid] = useState(currentUser.uid);
  const [newCoupleNames, setNewCoupleNames] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-11-28');
  const [newCardStyle, setNewCardStyle] = useState<CardStyle>('classic-gold');
  const [newCeremonyVenue, setNewCeremonyVenue] = useState('Parroquia Nuestra Señora del Pilar');
  const [newReceptionVenue, setNewReceptionVenue] = useState('Casa Prado & Jardines');
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchCeoData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, weddingsRes] = await Promise.all([
        fetch('/api/admin/ceo/stats'),
        fetch('/api/admin/ceo/users'),
        fetch('/api/admin/ceo/all-weddings'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (weddingsRes.ok) setWeddings(await weddingsRes.json());
    } catch (err) {
      console.error('Error loading CEO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCeoData();
  }, []);

  const handleUpdateUserRole = async (uid: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/ceo/users/${uid}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        setActionSuccessMessage(`Rol de usuario actualizado a "${role}".`);
        setTimeout(() => setActionSuccessMessage(null), 3000);
        fetchCeoData();
      }
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleUpdateUserPlan = async (uid: string, plan: PlanId) => {
    try {
      const res = await fetch(`/api/admin/ceo/users/${uid}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        setActionSuccessMessage(`Plan actualizado exitosamente.`);
        setTimeout(() => setActionSuccessMessage(null), 3000);
        fetchCeoData();
      }
    } catch (err) {
      console.error('Error updating plan:', err);
    }
  };

  // Delete Confirmation Modal
  const [weddingToDelete, setWeddingToDelete] = useState<{ id: number; coupleNames: string } | null>(null);
  const [isDeletingWedding, setIsDeletingWedding] = useState(false);

  const handleDeleteWedding = (weddingId: number, coupleNames: string) => {
    if (weddingId === 1) {
      toast.warning('La boda principal de demostración no puede ser eliminada.');
      return;
    }
    setWeddingToDelete({ id: weddingId, coupleNames });
  };

  const confirmDeleteWedding = async () => {
    if (!weddingToDelete) return;
    setIsDeletingWedding(true);
    try {
      const res = await fetch(`/api/admin/ceo/weddings/${weddingToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Boda "${weddingToDelete.coupleNames}" eliminada correctamente.`, 'Eliminada');
        setWeddingToDelete(null);
        fetchCeoData();
      } else {
        toast.error('No se pudo eliminar la boda', 'Error');
      }
    } catch (err) {
      console.error('Error deleting wedding:', err);
      toast.error('Error al eliminar la boda', 'Error');
    } finally {
      setIsDeletingWedding(false);
    }
  };

  const handleTransferOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingToTransfer || !newOwnerUid) return;

    setSubmittingAction(true);
    try {
      const res = await fetch('/api/admin/ceo/weddings/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId: selectedWeddingToTransfer.id,
          newOwnerUid: newOwnerUid,
        }),
      });

      if (res.ok) {
        setIsTransferModalOpen(false);
        setSelectedWeddingToTransfer(null);
        setActionSuccessMessage('Propiedad transferida exitosamente.');
        setTimeout(() => setActionSuccessMessage(null), 3000);
        fetchCeoData();
      }
    } catch (err) {
      console.error('Error transferring ownership:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCreateWeddingByCeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupleNames.trim()) return;

    setSubmittingAction(true);
    try {
      const res = await fetch('/api/user/weddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerUid: createForUid || currentUser.uid,
          coupleNames: newCoupleNames.trim(),
          eventDate: newEventDate,
          cardStyle: newCardStyle,
          ceremonyVenue: newCeremonyVenue,
          receptionVenue: newReceptionVenue,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setIsCreatingWeddingModal(false);
        setNewCoupleNames('');
        setActionSuccessMessage(`Boda "${newCoupleNames}" creada exitosamente.`);
        setTimeout(() => setActionSuccessMessage(null), 3000);
        await fetchCeoData();
      }
    } catch (err) {
      console.error('Error creating wedding:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredWeddings = weddings.filter((w) => {
    const matchesSearch =
      w.coupleNames?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (weddingFilterStatus === 'all') return matchesSearch;
    return matchesSearch && (w.status === weddingFilterStatus || (!w.status && weddingFilterStatus === 'active'));
  });

  const weddingPlannersList = users.filter(
    (u) => u.role === 'wedding_planner' || u.plan?.startsWith('planner_')
  );

  return (
    <div id="ceo-master-dashboard" className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top CEO Master Navbar */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  CEO Master Control Center
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Modo Dios / God Mode
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Daviex • daviex14@gmail.com • Control Absoluto de Plataforma
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchCeoData()}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 transition-colors cursor-pointer"
              title="Refrescar datos del servidor"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onBackToUserDashboard}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Vista Wedding Planner / Parejas</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-rose-950/60 hover:text-rose-300 border border-stone-700/80 text-stone-400 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex space-x-1 border-t border-stone-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'metrics'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. Métricas & Finanzas Globales</span>
          </button>

          <button
            onClick={() => setActiveTab('weddings')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'weddings'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>2. Control Maestro de Bodas ({weddings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('planners')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'planners'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>3. Wedding Planners & Usuarios ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'plans'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>4. Planes & Tarifas</span>
          </button>
        </div>
      </header>

      {/* Action Success Toast */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-8">
        {/* TAB 1: METRICS & REVENUE */}
        {activeTab === 'metrics' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Hero Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-amber-500/30 relative overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Supervisión Centralizada Atelier</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                  Bienvenido, Daviex. Todo el ecosistema nupcial bajo tu mando.
                </h1>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Como CEO de la plataforma, tienes facultades ilimitadas para auditar, intervenir, transferir y configurar cualquier boda, gestionar cuentas de Wedding Planners profesionales y supervisar la facturación global.
                </p>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Total Revenue */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Ingresos Estimados</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
                  ${(stats?.estimatedRevenue || 450).toLocaleString('en-US')} USD
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Calculado sobre planes activos (USD)</span>
                </div>
              </div>

              {/* Card 2: Total Weddings */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Total de Bodas</span>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
                  {stats?.totalWeddings || weddings.length}
                </div>
                <div className="text-xs text-stone-400">
                  Proyectos de invitaciones en la base de datos
                </div>
              </div>

              {/* Card 3: Wedding Planners */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Wedding Planners</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
                  {stats?.weddingPlanners || weddingPlannersList.length}
                </div>
                <div className="text-xs text-amber-400">
                  Agencias y organizadores con planes pro
                </div>
              </div>

              {/* Card 4: Global RSVPs */}
              <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Confirmaciones Globales</span>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white mb-1">
                  {stats?.confirmedPasses || 28} / {stats?.totalPasses || 35}
                </div>
                <div className="text-xs text-blue-400">
                  Pases confirmados por los invitados
                </div>
              </div>
            </div>

            {/* Breakdown by Subscription Plan */}
            <div className="p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800">
              <h3 className="font-serif text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Distribución de Suscripciones & Planes en la Plataforma</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const count = users.filter((u) => u.plan === plan.id).length;
                  return (
                    <div key={plan.id} className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        {plan.name}
                      </span>
                      <div className="text-2xl font-serif font-bold text-amber-400 mb-1">
                        {count} {count === 1 ? 'cuenta' : 'cuentas'}
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {plan.price}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEDDINGS MASTER CONTROL */}
        {activeTab === 'weddings' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 p-6 rounded-3xl border border-stone-800">
              <div>
                <h2 className="font-serif text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <span>Directorio Maestro de Todas las Bodas</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Puedes editar la invitación de cualquier boda, transferir el organizador o eliminarla.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCreatingWeddingModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Boda como CEO</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Buscar por novios, organizador, slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-xl text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Estado:
                </span>
                <select
                  value={weddingFilterStatus}
                  onChange={(e) => setWeddingFilterStatus(e.target.value)}
                  className="text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Todas las Bodas</option>
                  <option value="active">Activas / Publicadas</option>
                  <option value="planning">En Planeación</option>
                  <option value="completed">Concluidas</option>
                </select>
              </div>
            </div>

            {/* Weddings Table */}
            <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold text-[10px] border-b border-stone-800">
                    <tr>
                      <th className="py-4 px-5">ID & Novios</th>
                      <th className="py-4 px-5">Organizador / Dueño</th>
                      <th className="py-4 px-5">Fecha & Estilo</th>
                      <th className="py-4 px-5">Invitados / RSVP</th>
                      <th className="py-4 px-5">Estado</th>
                      <th className="py-4 px-5 text-right">Acciones CEO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800">
                    {filteredWeddings.map((wedding) => (
                      <tr key={wedding.id} className="hover:bg-stone-800/50 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-serif font-bold text-stone-100 text-sm mb-0.5">
                            {wedding.coupleNames}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1.5">
                            <span className="text-amber-400">ID #{wedding.id}</span>
                            <span>•</span>
                            <span className="text-stone-500">/{wedding.slug}</span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-medium text-stone-200">
                            {wedding.ownerName || 'Organizador'}
                          </div>
                          <div className="text-[11px] text-stone-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-500" />
                            <span>{wedding.ownerEmail || 'Sin email'}</span>
                          </div>
                          {wedding.clientEmail && (
                            <div className="text-[10px] text-amber-300/80 mt-0.5">
                              Cliente: {wedding.clientEmail}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-5">
                          <div className="text-stone-300 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-stone-500" />
                            <span>{wedding.eventDate?.substring(0, 10)}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 uppercase mt-0.5">
                            Estilo: <span className="text-amber-400 font-semibold">{wedding.cardStyle}</span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-semibold text-stone-200">
                            {wedding.confirmedGuests || 0} / {wedding.totalGuests || 0} confirmados
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {(wedding.totalGuests || 0) === 0 ? 'Sin invitados cargados' : 'Lista activa'}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            wedding.status === 'planning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : wedding.status === 'completed'
                              ? 'bg-stone-700/40 text-stone-400'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {wedding.status === 'planning' ? 'En Planeación' : wedding.status === 'completed' ? 'Concluida' : 'Activa'}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Open live invitation */}
                            <button
                              onClick={() => onSelectWedding(wedding.id, 'invitation')}
                              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
                              title="Ver Invitación en Vivo"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Open Admin Atelier Editor */}
                            <button
                              onClick={() => onSelectWedding(wedding.id, 'admin')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/30 font-bold transition-all flex items-center gap-1"
                              title="Administrar en Atelier"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Atelier</span>
                            </button>

                            {/* Transfer Ownership */}
                            <button
                              onClick={() => {
                                setSelectedWeddingToTransfer(wedding);
                                setNewOwnerUid(wedding.ownerUid);
                                setIsTransferModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-stone-800 hover:bg-blue-950 hover:text-blue-300 border border-stone-700 text-stone-400 transition-colors"
                              title="Transferir a otro Wedding Planner / Dueño"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            {wedding.id !== 1 && (
                              <button
                                onClick={() => handleDeleteWedding(wedding.id, wedding.coupleNames)}
                                className="p-2 rounded-lg bg-stone-800 hover:bg-rose-950 hover:text-rose-300 border border-stone-700 text-stone-400 transition-colors"
                                title="Eliminar boda definitivamente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WEDDING PLANNERS & USERS MASTER DIRECTORY */}
        {activeTab === 'planners' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-white mb-1 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  <span>Directorio de Wedding Planners & Usuarios Registrados</span>
                </h2>
                <p className="text-xs text-stone-400">
                  Administra roles de usuarios, asigna planes ilimitados o cambia permisos en tiempo real.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-700">
                  Total Registrados: <strong className="text-amber-400">{users.length}</strong>
                </span>
              </div>
            </div>

            {/* Users Grid / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map((u) => {
                const isCeoUser = u.role === 'ceo' || u.email === 'daviex14@gmail.com';
                const isPlanner = u.role === 'wedding_planner' || u.plan?.startsWith('planner_');

                return (
                  <div
                    key={u.id || u.uid}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                      isCeoUser
                        ? 'bg-gradient-to-b from-stone-900 to-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : isPlanner
                        ? 'bg-stone-900 border-amber-500/20'
                        : 'bg-stone-900/80 border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-serif font-bold text-base ${
                            isCeoUser
                              ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-400/50'
                              : isPlanner
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-stone-800 text-stone-300'
                          }`}>
                            {isCeoUser ? <Crown className="w-5 h-5" /> : (u.name ? u.name[0] : 'U')}
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-stone-100 text-base leading-tight">
                              {u.name || 'Usuario'}
                            </h3>
                            <div className="text-xs text-stone-400 font-mono">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isCeoUser
                            ? 'bg-amber-400 text-stone-950 font-black'
                            : isPlanner
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-stone-800 text-stone-400'
                        }`}>
                          {isCeoUser ? 'CEO' : isPlanner ? 'Planner' : 'Pareja'}
                        </span>
                      </div>

                      {u.agencyName && (
                        <div className="mb-3 px-3 py-1.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{u.agencyName}</span>
                        </div>
                      )}

                      <div className="space-y-2 text-xs text-stone-400 mb-6">
                        <div className="flex justify-between py-1 border-b border-stone-800/80">
                          <span>Bodas Gestionadas:</span>
                          <strong className="text-stone-200">{u.weddingsCount || 0} bodas</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-stone-800/80">
                          <span>UID de Cuenta:</span>
                          <span className="font-mono text-[10px] text-stone-500">{u.uid}</span>
                        </div>
                      </div>
                    </div>

                    {/* CEO Modification Controls */}
                    <div className="pt-4 border-t border-stone-800/80 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                          Modificar Plan:
                        </label>
                        <select
                          value={u.plan}
                          onChange={(e) => handleUpdateUserPlan(u.uid, e.target.value as PlanId)}
                          className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                        >
                          <option value="free">Plan Esencial ($0 USD)</option>
                          <option value="atelier">Plan Atelier Romance ($29 USD)</option>
                          <option value="elite">Plan Élite Gran Boda ($59 USD)</option>
                          <option value="planner_starter">Planner Studio 5 Bodas ($89 USD)</option>
                          <option value="planner_pro">Planner Agencia Ilimitado ($179 USD)</option>
                          <option value="ceo_unlimited">CEO Maestro Ilimitado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                          Modificar Rol:
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateUserRole(u.uid, 'wedding_planner')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                              u.role === 'wedding_planner'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                            }`}
                          >
                            Planner
                          </button>
                          <button
                            onClick={() => handleUpdateUserRole(u.uid, 'couple')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                              u.role === 'couple'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                            }`}
                          >
                            Pareja
                          </button>
                          <button
                            onClick={() => handleUpdateUserRole(u.uid, 'ceo')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                              u.role === 'ceo'
                                ? 'bg-amber-400 text-stone-950 font-bold'
                                : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                            }`}
                          >
                            CEO
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PRICING & BENEFIT CONFIGURATION */}
        {activeTab === 'plans' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-800">
              <h2 className="font-serif text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" />
                <span>Estructura de Tarifas & Planes Disponibles en la Plataforma</span>
              </h2>
              <p className="text-stone-400 text-sm">
                Configuración de límites y características activas para Novios y Wedding Planners profesionales.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-8 rounded-3xl border flex flex-col justify-between transition-all ${
                    plan.id === 'ceo_unlimited'
                      ? 'bg-gradient-to-b from-stone-900 to-amber-950/40 border-amber-500/60 shadow-2xl'
                      : plan.category === 'planner'
                      ? 'bg-stone-900 border-amber-500/30'
                      : 'bg-stone-900/70 border-stone-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                        {plan.badge}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        {plan.category === 'planner' ? 'Wedding Planner' : plan.category === 'ceo' ? 'CEO Master' : 'Pareja'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-serif font-bold text-amber-400">
                        {plan.price}
                      </span>
                      <span className="text-xs text-stone-400">
                        / {plan.billingPeriod}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed mb-6">
                      {plan.description}
                    </p>

                    <div className="space-y-2.5 mb-6">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-800 text-xs text-stone-400 font-mono">
                    Capacidad: <strong className="text-white">{plan.maxWeddings === 'unlimited' ? 'Bodas Ilimitadas' : `${plan.maxWeddings} Bodas`}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: TRANSFER WEDDING OWNERSHIP */}
      <AnimatePresence>
        {isTransferModalOpen && selectedWeddingToTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      Transferir Propiedad de Boda
                    </h3>
                    <p className="text-xs text-stone-400">
                      Boda: {selectedWeddingToTransfer.coupleNames} (ID: {selectedWeddingToTransfer.id})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleTransferOwnership} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Seleccionar Nuevo Wedding Planner / Dueño:
                  </label>
                  <select
                    value={newOwnerUid}
                    onChange={(e) => setNewOwnerUid(e.target.value)}
                    required
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    {users.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.name} ({u.email}) - {u.role === 'wedding_planner' ? 'Wedding Planner' : u.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                  Al transferir, el nuevo usuario tendrá acceso completo para editar invitados, música, fotos e itinerario de esta boda desde su propio panel de control.
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsTransferModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>{submittingAction ? 'Transfiriendo...' : 'Confirmar Transferencia'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREATE WEDDING AS CEO */}
      <AnimatePresence>
        {isCreatingWeddingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">
                      Crear Nueva Boda (Modo CEO)
                    </h3>
                    <p className="text-xs text-stone-400">
                      Asigna la boda a ti mismo o a cualquier Wedding Planner.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreatingWeddingModal(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWeddingByCeo} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Asignar Dueño / Organizador:
                  </label>
                  <select
                    value={createForUid}
                    onChange={(e) => setCreateForUid(e.target.value)}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    {users.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Nombres de los Novios:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Isabella & Mateo"
                    value={newCoupleNames}
                    onChange={(e) => setNewCoupleNames(e.target.value)}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Fecha del Evento:
                    </label>
                    <input
                      type="date"
                      required
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      Estilo de Tarjeta:
                    </label>
                    <select
                      value={newCardStyle}
                      onChange={(e) => setNewCardStyle(e.target.value as CardStyle)}
                      className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="classic-gold">Classic Gold</option>
                      <option value="romantic-floral">Romantic Floral Rosé</option>
                      <option value="boho-chic">Boho Terracotta</option>
                      <option value="minimal-editorial">Minimalist Editorial</option>
                      <option value="dark-luxury">Dark Velvet Luxury</option>
                      <option value="watercolor-garden">Watercolor Garden</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Lugar de Ceremonia:
                  </label>
                  <input
                    type="text"
                    value={newCeremonyVenue}
                    onChange={(e) => setNewCeremonyVenue(e.target.value)}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    Lugar de Recepción / Banquete:
                  </label>
                  <input
                    type="text"
                    value={newReceptionVenue}
                    onChange={(e) => setNewReceptionVenue(e.target.value)}
                    className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsCreatingWeddingModal(false)}
                    className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>{submittingAction ? 'Creando...' : 'Crear Boda'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for CEO Wedding Deletion */}
      <ConfirmModal
        isOpen={Boolean(weddingToDelete)}
        title="¿Eliminar Proyecto de Boda?"
        message={`¿Confirmas la eliminación definitiva de la boda "${weddingToDelete?.coupleNames}" (ID: ${weddingToDelete?.id})?\nEsta acción borrará permanentemente sus datos, invitados y fotos asociadas.`}
        confirmText="Eliminar Definitivamente"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeletingWedding}
        onConfirm={confirmDeleteWedding}
        onCancel={() => setWeddingToDelete(null)}
      />
    </div>
  );
};
