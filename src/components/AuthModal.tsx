import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Heart,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Crown,
  Briefcase,
  Layers,
  Star,
  Check,
  Smartphone,
  Gift,
  Music
} from 'lucide-react';
import { PlanId, UserProfile, UserRole } from '../types.ts';
import { SUBSCRIPTION_PLANS } from '../data/plans.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  selectedPlanId?: PlanId;
  selectedPlan?: PlanId;
  onSuccess?: (user: UserProfile) => void;
  onAuthSuccess?: (user: UserProfile, directToAdmin?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  selectedPlanId = 'free',
  selectedPlan,
  onSuccess,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [roleSelection, setRoleSelection] = useState<UserRole>('couple');
  const [chosenPlan, setChosenPlan] = useState<PlanId>(selectedPlan || selectedPlanId || 'free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync selectedPlan when changed
  React.useEffect(() => {
    const p = selectedPlan || selectedPlanId;
    if (p) {
      setChosenPlan(p);
      if (p.startsWith('planner_')) {
        setRoleSelection('wedding_planner');
      }
    }
  }, [selectedPlan, selectedPlanId]);

  if (!isOpen) return null;

  const notifySuccess = (profile: UserProfile, directToAdmin = false) => {
    if (onAuthSuccess) {
      onAuthSuccess(profile, directToAdmin);
    }
    if (onSuccess) {
      onSuccess(profile);
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      if (!cleanEmail || !cleanPass) {
        setError('Por favor completa tu correo y contraseña.');
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok) {
          if (res.status === 404) {
            setError('El endpoint de autenticación no fue encontrado (404). Por favor reinicia tu servidor de desarrollo (pnpm dev) para cargar las nuevas rutas.');
          } else {
            setError(data.error || 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.');
          }
          return;
        }

        const profile: UserProfile = data.user;
        localStorage.setItem('wedding_user', JSON.stringify(profile));
        localStorage.setItem('atelier_user_session', JSON.stringify(profile));
        notifySuccess(profile, false);
      } else {
        const cleanName = name.trim() || 'Novia/Novio';
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPass,
            name: cleanName,
            role: roleSelection,
            plan: chosenPlan,
            agencyName: roleSelection === 'wedding_planner' ? (agencyName.trim() || undefined) : undefined,
          }),
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (!res.ok) {
          if (res.status === 404) {
            setError('El endpoint de registro no fue encontrado (404). Por favor reinicia tu servidor de desarrollo (pnpm dev).');
          } else {
            setError(data.error || 'Ocurrió un error al registrar la cuenta. Inténtalo de nuevo.');
          }
          return;
        }

        const profile: UserProfile = data.user;
        localStorage.setItem('wedding_user', JSON.stringify(profile));
        localStorage.setItem('atelier_user_session', JSON.stringify(profile));
        notifySuccess(profile, false);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('Error de conexión con el servidor. Por favor verifica tu red e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        id="auth-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-stone-950/80 backdrop-blur-md overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          id="auth-modal-card"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          className="relative w-[96vw] lg:w-[75vw] h-[92vh] lg:h-[75vh] min-h-[580px] bg-[#FAF9F5] border border-[#E5E2D0] rounded-3xl sm:rounded-[40px] shadow-2xl overflow-hidden text-stone-800 flex flex-col justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-200/70 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 w-full h-full overflow-hidden">
            
            {/* LEFT COLUMN: BRANDING & HIGHLIGHTS (4.5 / 12 col) */}
            <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#2D2D24] via-[#22221A] to-[#14140F] text-[#FDFCF0] p-8 xl:p-12 flex-col justify-between relative overflow-hidden h-full select-none">
              {/* Decorative radial glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7D8C7A]/25 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

              {/* Brand Top */}
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-lg">
                    {chosenPlan.startsWith('planner_') ? (
                      <Briefcase className="w-7 h-7" />
                    ) : (
                      <Heart className="w-7 h-7 text-amber-300 fill-amber-300/30" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.3em] text-amber-300/90 font-bold block">
                      Wedding Atelier
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
                      Invitaciones Digitales
                    </h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-3xl xl:text-4xl font-serif text-white leading-tight font-normal">
                    {mode === 'register'
                      ? 'La experiencia más elegante para tus invitados.'
                      : 'Tu Atelier de bodas y eventos en un solo lugar.'}
                  </h4>
                  <p className="text-xs xl:text-sm text-stone-300/90 leading-relaxed pt-1">
                    {mode === 'register'
                      ? 'Crea invitaciones interactivas de alta fidelidad, con música, mapas guiados, mesa de regalos y RSVP en tiempo real.'
                      : 'Accede a tu panel para gestionar invitados, pases confirmados y diseño visual en vivo.'}
                  </p>
                </div>

                {/* Key feature pills */}
                <div className="space-y-3 pt-3">
                  <div className="flex items-center gap-3 text-xs xl:text-sm text-stone-200 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <Smartphone className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Visualización 100% responsiva y optimizada para móviles.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs xl:text-sm text-stone-200 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>RSVP en tiempo real con buscador multi-token inteligente.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs xl:text-sm text-stone-200 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-xs">
                    <Music className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Música de fondo, itinerario, fotos y mesa de regalos.</span>
                  </div>
                </div>
              </div>

              {/* Bottom Security / Version Tag */}
              <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cifrado Seguro SSL</span>
                </div>
                <span className="font-mono text-xs opacity-75">Wedding Atelier 2026</span>
              </div>
            </div>

            {/* RIGHT COLUMN: SCROLLABLE FORM & ROLES (7.5 / 12 col) */}
            <div className="col-span-12 lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-between bg-white h-full overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                
                {/* Header & Mode Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F5F0] pb-5">
                  <div>
                    <h2 className="text-2xl sm:text-3xl xl:text-4xl font-serif font-bold text-stone-900 tracking-tight">
                      {mode === 'register' ? 'Crea tu Cuenta' : 'Iniciar Sesión'}
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1 font-serif italic">
                      {mode === 'register'
                        ? 'Empieza a configurar tu boda o eventos en segundos.'
                        : 'Ingresa a tu cuenta para continuar con tu evento.'}
                    </p>
                  </div>

                  {/* Mode Switcher Tabs */}
                  <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200 text-xs font-semibold shrink-0">
                    <button
                      id="tab-auth-register"
                      type="button"
                      onClick={() => setMode('register')}
                      className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                        mode === 'register'
                          ? 'bg-white text-stone-900 shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Registro
                    </button>
                    <button
                      id="tab-auth-login"
                      type="button"
                      onClick={() => setMode('login')}
                      className={`px-5 py-2 rounded-xl transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-white text-stone-900 shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Ingresar
                    </button>
                  </div>
                </div>

                {/* Plan Selection Badge (Register Mode) */}
                {mode === 'register' && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold shadow-xs">
                        <Crown className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-950 block">
                          Plan Seleccionado: {SUBSCRIPTION_PLANS.find((p) => p.id === chosenPlan)?.name || 'Esencial'}
                        </span>
                        <span className="text-[11px] text-amber-800">
                          {chosenPlan.startsWith('planner_') ? 'Perfil para Organizadores & Agencias' : 'Perfil para Pareja de Novios'}
                        </span>
                      </div>
                    </div>
                    <select
                      value={chosenPlan}
                      onChange={(e) => {
                        const p = e.target.value as PlanId;
                        setChosenPlan(p);
                        if (p.startsWith('planner_')) setRoleSelection('wedding_planner');
                        else setRoleSelection('couple');
                      }}
                      className="text-xs bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 font-semibold text-stone-800 focus:outline-none shadow-xs cursor-pointer"
                    >
                      <option value="free">Esencial ($0 USD)</option>
                      <option value="atelier">Atelier ($29 USD)</option>
                      <option value="elite">Élite ($59 USD)</option>
                      <option value="planner_starter">Planner Studio ($89 USD)</option>
                      <option value="planner_pro">Planner Agencia ($179 USD)</option>
                    </select>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          {roleSelection === 'wedding_planner' ? 'Nombre del Planner / Contacto' : 'Nombre de los Novios'}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                          <input
                            id="input-auth-name"
                            type="text"
                            required
                            placeholder={roleSelection === 'wedding_planner' ? 'Ej. Valeria Mendoza' : 'Ej. Sofía & Alejandro'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FAF9F5] border border-[#E5E2D0] rounded-2xl focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] focus:outline-none text-stone-900 shadow-2xs"
                          />
                        </div>
                      </div>

                      {roleSelection === 'wedding_planner' ? (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">
                            Nombre de la Agencia / Estudio
                          </label>
                          <div className="relative">
                            <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                            <input
                              type="text"
                              placeholder="Ej. Valeria Events Atelier"
                              value={agencyName}
                              onChange={(e) => setAgencyName(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FAF9F5] border border-[#E5E2D0] rounded-2xl focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] focus:outline-none text-stone-900 shadow-2xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">
                            Modalidad de Cuenta
                          </label>
                          <div className="flex items-center h-[46px] px-4 bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl text-xs text-[#5A5A40] font-serif font-bold">
                            💖 Boda Particular
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                          id="input-auth-email"
                          type="email"
                          required
                          placeholder="ejemplo@correo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FAF9F5] border border-[#E5E2D0] rounded-2xl focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] focus:outline-none text-stone-900 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
                        <input
                          id="input-auth-password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-[#FAF9F5] border border-[#E5E2D0] rounded-2xl focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] focus:outline-none text-stone-900 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="btn-auth-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 bg-[#5A5A40] hover:bg-[#484833] text-white font-serif font-bold text-xs sm:text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <span>Procesando...</span>
                    ) : mode === 'register' ? (
                      <>
                        <span>Crear Cuenta & Acceder al Panel</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Entrar a mi Panel de Control</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Security note footer */}
              <div className="pt-6 mt-6 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-1.5 text-stone-500">
                  <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
                  <span>Acceso seguro cifrado de extremo a extremo.</span>
                </div>
                <span className="font-mono text-[11px] text-stone-400">Atelier ID Auth</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
