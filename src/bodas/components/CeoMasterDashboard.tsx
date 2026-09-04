import React, { useState, useEffect, useMemo } from 'react';
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
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  FileSpreadsheet,
  CheckSquare,
  Square,
  MinusSquare,
  Lock,
  UserPlus,
  X
} from 'lucide-react';
import { UserProfile, PlanId, CardStyle, UserRole, PlanDetails } from '../../types.ts';
import { SUBSCRIPTION_PLANS } from '../../data/plans.ts';
import { ConfirmModal } from './ConfirmModal.tsx';
import { ExcelUserImportModal } from './admin/ExcelUserImportModal.tsx';
import { UserEditModal } from './admin/UserEditModal.tsx';
import { PlanEditorModal } from './admin/PlanEditorModal.tsx';
import { toast } from '../../lib/toast.ts';

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
  const [plans, setPlans] = useState<PlanDetails[]>(SUBSCRIPTION_PLANS);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [weddingSearchTerm, setWeddingSearchTerm] = useState('');
  const [weddingFilterStatus, setWeddingFilterStatus] = useState<string>('all');
  
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('all');
  const [userViewMode, setUserViewMode] = useState<'table' | 'cards'>('table');

  // Sorting for users table
  const [userSortField, setUserSortField] = useState<'name' | 'email' | 'role' | 'plan' | 'weddingsCount' | 'createdAt'>('createdAt');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk user selection
  const [selectedUserUids, setSelectedUserUids] = useState<Set<string>>(new Set());
  const [bulkTargetPlan, setBulkTargetPlan] = useState<PlanId>('atelier');
  const [bulkTargetRole, setBulkTargetRole] = useState<UserRole>('wedding_planner');
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  
  // Modals state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedWeddingToTransfer, setSelectedWeddingToTransfer] = useState<GlobalWedding | null>(null);
  const [newOwnerUid, setNewOwnerUid] = useState('');
  const [isCreatingWeddingModal, setIsCreatingWeddingModal] = useState(false);
  
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<GlobalUser | null>(null);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  const [isPlanEditorModalOpen, setIsPlanEditorModalOpen] = useState(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<PlanDetails | null>(null);
  
  const [userToDelete, setUserToDelete] = useState<GlobalUser | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

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
      const [statsRes, usersRes, weddingsRes, plansRes] = await Promise.all([
        fetch('/api/admin/ceo/stats'),
        fetch('/api/admin/ceo/users'),
        fetch('/api/admin/ceo/all-weddings'),
        fetch('/api/plans'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (weddingsRes.ok) setWeddings(await weddingsRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
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
        toast.success(`Rol de usuario actualizado a "${role}".`, 'Rol Actualizado');
        fetchCeoData();
      }
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Error al actualizar rol');
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
        toast.success(`Plan actualizado exitosamente.`, 'Plan Actualizado');
        fetchCeoData();
      }
    } catch (err) {
      console.error('Error updating plan:', err);
      toast.error('Error al actualizar plan');
    }
  };

  // Bulk user operations
  const handleBulkUpdatePlan = async () => {
    if (selectedUserUids.size === 0) return;
    setIsBulkOperating(true);
    try {
      const res = await fetch('/api/admin/ceo/users/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uids: Array.from(selectedUserUids),
          action: 'plan',
          value: bulkTargetPlan,
        }),
      });
      if (res.ok) {
        toast.success(`Se actualizó el plan a ${selectedUserUids.size} usuarios seleccionados.`, 'Actualización Masiva');
        setSelectedUserUids(new Set());
        fetchCeoData();
      } else {
        toast.error('Error al actualizar usuarios.');
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkUpdateRole = async () => {
    if (selectedUserUids.size === 0) return;
    setIsBulkOperating(true);
    try {
      const res = await fetch('/api/admin/ceo/users/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uids: Array.from(selectedUserUids),
          action: 'role',
          value: bulkTargetRole,
        }),
      });
      if (res.ok) {
        toast.success(`Se actualizó el rol a ${selectedUserUids.size} usuarios seleccionados.`, 'Actualización Masiva');
        setSelectedUserUids(new Set());
        fetchCeoData();
      } else {
        toast.error('Error al actualizar roles.');
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserUids.size === 0) return;
    if (!confirm(`¿Estás seguro de eliminar permanentemente a los ${selectedUserUids.size} usuarios seleccionados?`)) return;
    setIsBulkOperating(true);
    try {
      const res = await fetch('/api/admin/ceo/users/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uids: Array.from(selectedUserUids),
          action: 'delete',
        }),
      });
      if (res.ok) {
        toast.success(`Se eliminaron los usuarios seleccionados.`, 'Usuarios Eliminados');
        setSelectedUserUids(new Set());
        fetchCeoData();
      } else {
        toast.error('Error al eliminar usuarios.');
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setIsBulkOperating(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await fetch(`/api/admin/ceo/users/${userToDelete.uid}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`Usuario "${userToDelete.name}" (${userToDelete.email}) eliminado.`, 'Usuario Eliminado');
        setUserToDelete(null);
        fetchCeoData();
      } else {
        toast.error('No se pudo eliminar el usuario.');
      }
    } catch {
      toast.error('Error al eliminar usuario.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Delete Wedding Confirmation Modal
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
        toast.success('Propiedad de boda transferida exitosamente.', 'Transferencia Exitosa');
        fetchCeoData();
      }
    } catch (err) {
      console.error('Error transferring ownership:', err);
      toast.error('Error al transferir la propiedad');
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
        setIsCreatingWeddingModal(false);
        setNewCoupleNames('');
        toast.success(`Boda "${newCoupleNames}" creada exitosamente.`, 'Boda Creada');
        await fetchCeoData();
      }
    } catch (err) {
      console.error('Error creating wedding:', err);
      toast.error('Error al crear la boda');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filtered & Sorted Weddings
  const filteredWeddings = useMemo(() => {
    const search = (weddingSearchTerm || globalSearchTerm).toLowerCase().trim();
    return weddings.filter((w) => {
      const matchesSearch =
        !search ||
        w.coupleNames?.toLowerCase().includes(search) ||
        w.ownerName?.toLowerCase().includes(search) ||
        w.ownerEmail?.toLowerCase().includes(search) ||
        w.slug?.toLowerCase().includes(search);

      if (weddingFilterStatus === 'all') return matchesSearch;
      return matchesSearch && (w.status === weddingFilterStatus || (!w.status && weddingFilterStatus === 'active'));
    });
  }, [weddings, weddingSearchTerm, globalSearchTerm, weddingFilterStatus]);

  // Filtered & Sorted Users
  const filteredAndSortedUsers = useMemo(() => {
    const search = (userSearchTerm || globalSearchTerm).toLowerCase().trim();
    let result = users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search) ||
        u.email?.toLowerCase().includes(search) ||
        u.agencyName?.toLowerCase().includes(search) ||
        u.phone?.toLowerCase().includes(search) ||
        u.role?.toLowerCase().includes(search) ||
        u.plan?.toLowerCase().includes(search) ||
        u.uid?.toLowerCase().includes(search);

      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      const matchesPlan = userPlanFilter === 'all' || u.plan === userPlanFilter;

      return matchesSearch && matchesRole && matchesPlan;
    });

    result.sort((a, b) => {
      let aVal: any = (a as any)[userSortField] || '';
      let bVal: any = (b as any)[userSortField] || '';

      if (userSortField === 'createdAt') {
        aVal = new Date(a.createdAt || 0).getTime();
        bVal = new Date(b.createdAt || 0).getTime();
      } else if (userSortField === 'weddingsCount') {
        aVal = a.weddingsCount || 0;
        bVal = b.weddingsCount || 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return userSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return userSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, userSearchTerm, globalSearchTerm, userRoleFilter, userPlanFilter, userSortField, userSortOrder]);

  const weddingPlannersList = useMemo(() => {
    return users.filter((u) => u.role === 'wedding_planner' || u.plan?.startsWith('planner_'));
  }, [users]);

  // Handle table header sorting toggle
  const handleSort = (field: 'name' | 'email' | 'role' | 'plan' | 'weddingsCount' | 'createdAt') => {
    if (userSortField === field) {
      setUserSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setUserSortField(field);
      setUserSortOrder('asc');
    }
  };

  // Toggle selection for single user
  const toggleUserSelection = (uid: string) => {
    const next = new Set(selectedUserUids);
    if (next.has(uid)) {
      next.delete(uid);
    } else {
      next.add(uid);
    }
    setSelectedUserUids(next);
  };

  // Toggle select all visible users
  const isAllVisibleSelected =
    filteredAndSortedUsers.length > 0 &&
    filteredAndSortedUsers.every((u) => selectedUserUids.has(u.uid));

  const isSomeVisibleSelected =
    filteredAndSortedUsers.some((u) => selectedUserUids.has(u.uid)) && !isAllVisibleSelected;

  const toggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      const next = new Set(selectedUserUids);
      filteredAndSortedUsers.forEach((u) => next.delete(u.uid));
      setSelectedUserUids(next);
    } else {
      const next = new Set(selectedUserUids);
      filteredAndSortedUsers.forEach((u) => next.add(u.uid));
      setSelectedUserUids(next);
    }
  };

  return (
    <div id="ceo-master-dashboard" className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top CEO Master Navbar */}
      <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-amber-500/20 shadow-xl">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40 shrink-0">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                  CEO Master Control Center
                </span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-400 uppercase tracking-wider shrink-0">
                  Modo Dios / God Mode
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono truncate">
                Daviex • daviex14@gmail.com • Control Absoluto de Plataforma
              </p>
            </div>
          </div>

          {/* Global Multi-Token Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-4 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Búsqueda global (usuarios, bodas, correos, planes)..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs bg-stone-950/90 border border-stone-700 rounded-full text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            {globalSearchTerm && (
              <button
                onClick={() => setGlobalSearchTerm('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => fetchCeoData()}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 transition-colors cursor-pointer"
              title="Refrescar datos del servidor"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onBackToUserDashboard}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Vista Wedding Planner / Parejas</span>
              <span className="sm:hidden">Panel</span>
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
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
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
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
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
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
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
            className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
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
                {plans.map((plan) => {
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
                  value={weddingSearchTerm}
                  onChange={(e) => setWeddingSearchTerm(e.target.value)}
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
                            <span className="text-amber-400 font-bold">#{wedding.id}</span>
                            <span>•</span>
                            <span className="text-stone-500">/{wedding.slug}</span>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-semibold text-stone-200">
                            {wedding.ownerName}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono">
                            {wedding.ownerEmail}
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div className="text-stone-200">
                            {wedding.eventDate ? String(wedding.eventDate).substring(0, 10) : 'Por definir'}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-stone-800 text-[10px] font-mono text-amber-300 border border-stone-700">
                            {wedding.cardStyle}
                          </span>
                        </td>

                        <td className="py-4 px-5">
                          <div className="font-semibold text-stone-200">
                            {wedding.confirmedGuests} / {wedding.totalGuests} confirmados
                          </div>
                          <div className="text-[11px] text-stone-500">
                            Invitados en lista
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            wedding.status === 'active' || wedding.isPublished
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {wedding.status || (wedding.isPublished ? 'Activa' : 'Borrador')}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Open Public URL */}
                            <a
                              href={`/${wedding.slug || `?wedding=${wedding.id}`}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                              title="Ver invitación pública"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            {/* Open in Admin Mode */}
                            <button
                              onClick={() => onSelectWedding(wedding.id, 'admin')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/30 font-bold transition-all flex items-center gap-1 cursor-pointer"
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
                              className="p-2 rounded-lg bg-stone-800 hover:bg-blue-950 hover:text-blue-300 border border-stone-700 text-stone-400 transition-colors cursor-pointer"
                              title="Transferir a otro Wedding Planner / Dueño"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            {wedding.id !== 1 && (
                              <button
                                onClick={() => handleDeleteWedding(wedding.id, wedding.coupleNames)}
                                className="p-2 rounded-lg bg-stone-800 hover:bg-rose-950 hover:text-rose-300 border border-stone-700 text-stone-400 transition-colors cursor-pointer"
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
            {/* Header & Controls */}
            <div className="bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-amber-400" />
                  <span>Directorio Maestro de Usuarios & Wedding Planners</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-400">
                  Busca, edita, crea cuentas individuales, importa masivamente desde Excel o actualiza planes en bloque.
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                <button
                  onClick={() => setIsExcelImportModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Cargar desde Excel</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedUserToEdit(null);
                    setIsUserEditModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>
            </div>

            {/* Live Search & Filter Bar */}
            <div className="bg-stone-900/70 p-4 rounded-2xl border border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo, agencia, teléfono, rol o plan..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-stone-950 border border-stone-700 rounded-xl text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center flex-wrap gap-3 w-full lg:w-auto justify-end">
                {/* Filter Role */}
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <span>Rol:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todos los Roles</option>
                    <option value="wedding_planner">Wedding Planners</option>
                    <option value="couple">Parejas</option>
                    <option value="ceo">CEO Master</option>
                  </select>
                </div>

                {/* Filter Plan */}
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <span>Plan:</span>
                  <select
                    value={userPlanFilter}
                    onChange={(e) => setUserPlanFilter(e.target.value)}
                    className="text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todos los Planes</option>
                    <option value="free">Esencial ($0)</option>
                    <option value="atelier">Atelier Romance ($29)</option>
                    <option value="elite">Élite Gran Boda ($59)</option>
                    <option value="planner_starter">Planner Studio ($89)</option>
                    <option value="planner_pro">Planner Agencia ($179)</option>
                    <option value="ceo_unlimited">CEO Ilimitado</option>
                  </select>
                </div>

                {/* Toggle View Mode */}
                <div className="flex items-center bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                  <button
                    onClick={() => setUserViewMode('table')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      userViewMode === 'table' ? 'bg-stone-800 text-amber-300 font-bold' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Tabla Detallada
                  </button>
                  <button
                    onClick={() => setUserViewMode('cards')}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      userViewMode === 'cards' ? 'bg-stone-800 text-amber-300 font-bold' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Tarjetas
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Bulk Actions Toolbar */}
            {selectedUserUids.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-24 z-30 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <strong className="text-amber-300 font-bold">
                    {selectedUserUids.size} {selectedUserUids.size === 1 ? 'usuario seleccionado' : 'usuarios seleccionados'}
                  </strong>
                  <button
                    onClick={() => setSelectedUserUids(new Set())}
                    className="text-stone-400 hover:text-white underline ml-2 cursor-pointer"
                  >
                    Desmarcar todos
                  </button>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                  {/* Bulk Plan Change */}
                  <div className="flex items-center gap-1.5 bg-stone-950/80 p-1.5 rounded-xl border border-stone-700">
                    <span className="text-[11px] text-stone-400 pl-1">Plan:</span>
                    <select
                      value={bulkTargetPlan}
                      onChange={(e) => setBulkTargetPlan(e.target.value as PlanId)}
                      className="text-xs bg-transparent border-none text-stone-200 focus:outline-none font-medium"
                    >
                      <option value="free">Esencial ($0)</option>
                      <option value="atelier">Atelier Romance ($29)</option>
                      <option value="elite">Élite Gran Boda ($59)</option>
                      <option value="planner_starter">Planner Studio ($89)</option>
                      <option value="planner_pro">Planner Agencia ($179)</option>
                      <option value="ceo_unlimited">CEO Ilimitado</option>
                    </select>
                    <button
                      onClick={handleBulkUpdatePlan}
                      disabled={isBulkOperating}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] cursor-pointer"
                    >
                      Aplicar Plan
                    </button>
                  </div>

                  {/* Bulk Role Change */}
                  <div className="flex items-center gap-1.5 bg-stone-950/80 p-1.5 rounded-xl border border-stone-700">
                    <span className="text-[11px] text-stone-400 pl-1">Rol:</span>
                    <select
                      value={bulkTargetRole}
                      onChange={(e) => setBulkTargetRole(e.target.value as UserRole)}
                      className="text-xs bg-transparent border-none text-stone-200 focus:outline-none font-medium"
                    >
                      <option value="couple">Pareja</option>
                      <option value="wedding_planner">Wedding Planner</option>
                      <option value="ceo">CEO</option>
                    </select>
                    <button
                      onClick={handleBulkUpdateRole}
                      disabled={isBulkOperating}
                      className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-stone-950 font-bold text-[11px] cursor-pointer"
                    >
                      Aplicar Rol
                    </button>
                  </div>

                  {/* Bulk Delete */}
                  <button
                    onClick={handleBulkDelete}
                    disabled={isBulkOperating}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Seleccionados</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* TABULAR DETAILED VIEW */}
            {userViewMode === 'table' && (
              <div className="bg-stone-900 rounded-3xl border border-stone-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold text-[10px] border-b border-stone-800 select-none">
                      <tr>
                        {/* Select All Checkbox */}
                        <th className="py-4 px-4 w-12 text-center">
                          <button
                            type="button"
                            onClick={toggleSelectAllVisible}
                            className="p-1 text-amber-400 hover:text-amber-300 cursor-pointer"
                            title={isAllVisibleSelected ? 'Desmarcar todos' : 'Seleccionar todos los visibles'}
                          >
                            {isAllVisibleSelected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : isSomeVisibleSelected ? (
                              <MinusSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-600" />
                            )}
                          </button>
                        </th>

                        {/* Sortable: Name */}
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Usuario / Titular</span>
                            {userSortField === 'name' ? (
                              userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-stone-600" />
                            )}
                          </div>
                        </th>

                        {/* Sortable: Email */}
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Correo & Contacto</span>
                            {userSortField === 'email' ? (
                              userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-stone-600" />
                            )}
                          </div>
                        </th>

                        {/* Sortable: Role */}
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('role')}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Rol de Cuenta</span>
                            {userSortField === 'role' ? (
                              userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-stone-600" />
                            )}
                          </div>
                        </th>

                        {/* Sortable: Plan */}
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('plan')}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Plan Actual</span>
                            {userSortField === 'plan' ? (
                              userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-stone-600" />
                            )}
                          </div>
                        </th>

                        {/* Sortable: Weddings */}
                        <th
                          className="py-4 px-4 cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('weddingsCount')}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Bodas</span>
                            {userSortField === 'weddingsCount' ? (
                              userSortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-stone-600" />
                            )}
                          </div>
                        </th>

                        {/* Actions */}
                        <th className="py-4 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-800">
                      {filteredAndSortedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-stone-500">
                            No se encontraron usuarios con los criterios de búsqueda actuales.
                          </td>
                        </tr>
                      ) : (
                        filteredAndSortedUsers.map((u) => {
                          const isSelected = selectedUserUids.has(u.uid);
                          const isCeo = u.role === 'ceo' || u.email === 'daviex14@gmail.com';
                          const isPlanner = u.role === 'wedding_planner' || u.plan?.startsWith('planner_');

                          return (
                            <tr
                              key={u.uid}
                              className={`transition-colors ${
                                isSelected ? 'bg-amber-500/10' : 'hover:bg-stone-800/50'
                              }`}
                            >
                              {/* Row Checkbox */}
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleUserSelection(u.uid)}
                                  className="p-1 text-amber-400 hover:text-amber-300 cursor-pointer"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-600" />
                                  )}
                                </button>
                              </td>

                              {/* Name & Agency */}
                              <td className="py-3 px-4">
                                <div className="font-serif font-bold text-stone-100 text-sm flex items-center gap-2">
                                  <span>{u.name || 'Usuario'}</span>
                                  {isCeo && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                </div>
                                {u.agencyName ? (
                                  <div className="text-[11px] text-amber-400 font-medium truncate max-w-[200px]">
                                    {u.agencyName}
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-mono text-stone-500">
                                    UID: {u.uid}
                                  </div>
                                )}
                              </td>

                              {/* Email & Phone */}
                              <td className="py-3 px-4">
                                <div className="font-mono text-xs text-stone-300">
                                  {u.email}
                                </div>
                                {u.phone && (
                                  <div className="text-[10px] text-stone-500 font-mono">
                                    {u.phone}
                                  </div>
                                )}
                              </td>

                              {/* Role Selector in place */}
                              <td className="py-3 px-4">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleUpdateUserRole(u.uid, e.target.value)}
                                  className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border uppercase tracking-wider focus:outline-none ${
                                    isCeo
                                      ? 'bg-amber-400 text-stone-950 border-amber-400'
                                      : isPlanner
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-stone-800 text-stone-300 border-stone-700'
                                  }`}
                                >
                                  <option value="couple">PAREJA</option>
                                  <option value="wedding_planner">PLANNER</option>
                                  <option value="ceo">CEO MASTER</option>
                                </select>
                              </td>

                              {/* Plan Selector in place */}
                              <td className="py-3 px-4">
                                <select
                                  value={u.plan}
                                  onChange={(e) => handleUpdateUserPlan(u.uid, e.target.value as PlanId)}
                                  className="text-xs bg-stone-950 border border-stone-700 rounded-lg px-2.5 py-1 text-amber-300 focus:outline-none focus:border-amber-500 font-medium"
                                >
                                  <option value="free">Esencial ($0)</option>
                                  <option value="atelier">Atelier ($29)</option>
                                  <option value="elite">Élite ($59)</option>
                                  <option value="planner_starter">Studio ($89)</option>
                                  <option value="planner_pro">Agencia ($179)</option>
                                  <option value="ceo_unlimited">CEO Ilimitado</option>
                                </select>
                              </td>

                              {/* Weddings Count */}
                              <td className="py-3 px-4">
                                <span className="font-bold text-stone-200">
                                  {u.weddingsCount || 0}
                                </span>
                                <span className="text-[10px] text-stone-500 ml-1">
                                  {u.weddingsCount === 1 ? 'boda' : 'bodas'}
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedUserToEdit(u);
                                      setIsUserEditModalOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                                    title="Editar datos de usuario"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {!isCeo && (
                                    <button
                                      onClick={() => setUserToDelete(u)}
                                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 hover:text-rose-300 text-stone-400 transition-colors cursor-pointer"
                                      title="Eliminar usuario"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CARDS GRID VIEW */}
            {userViewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAndSortedUsers.map((u) => {
                  const isCeoUser = u.role === 'ceo' || u.email === 'daviex14@gmail.com';
                  const isPlanner = u.role === 'wedding_planner' || u.plan?.startsWith('planner_');

                  return (
                    <div
                      key={u.uid}
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

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUserToEdit(u);
                                setIsUserEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                              title="Editar usuario"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {!isCeoUser && (
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-300 cursor-pointer"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRICING & BENEFIT CONFIGURATION */}
        {activeTab === 'plans' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-400" />
                  <span>Estructura de Tarifas & Planes Disponibles en la Plataforma</span>
                </h2>
                <p className="text-stone-400 text-sm">
                  Configuración editable de precios, límites y características activas para Novios y Wedding Planners profesionales.
                </p>
              </div>

              <div className="text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl">
                ✨ Los cambios se reflejan en tiempo real en la landing y registro
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
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

                  <div className="pt-6 border-t border-stone-800 flex items-center justify-between">
                    <span className="text-xs text-stone-400 font-mono">
                      {plan.maxWeddings === 'unlimited' ? 'Bodas Ilimitadas' : `${plan.maxWeddings} Bodas`}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedPlanToEdit(plan);
                        setIsPlanEditorModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Plan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: EXCEL / CLIPBOARD USER IMPORT */}
      <ExcelUserImportModal
        isOpen={isExcelImportModalOpen}
        onClose={() => setIsExcelImportModalOpen(false)}
        onSuccess={fetchCeoData}
      />

      {/* MODAL: USER EDIT / CREATE */}
      <UserEditModal
        isOpen={isUserEditModalOpen}
        onClose={() => setIsUserEditModalOpen(false)}
        user={selectedUserToEdit}
        onSuccess={fetchCeoData}
      />

      {/* MODAL: PLAN & PRICING EDITOR */}
      <PlanEditorModal
        isOpen={isPlanEditorModalOpen}
        onClose={() => setIsPlanEditorModalOpen(false)}
        plan={selectedPlanToEdit}
        onSuccess={fetchCeoData}
      />

      {/* MODAL: CONFIRM USER DELETION */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="¿Eliminar Usuario de la Plataforma?"
        message={`¿Confirmas la eliminación permanente del usuario "${userToDelete?.name}" (${userToDelete?.email})?\nEsta acción es irreversible.`}
        confirmText="Eliminar Usuario"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeletingUser}
        onConfirm={confirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

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
                  className="text-stone-400 hover:text-white cursor-pointer"
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
                    className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white cursor-pointer"
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
                  className="text-stone-400 hover:text-white cursor-pointer"
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
                    className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white cursor-pointer"
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
