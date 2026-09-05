import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Lock,
  Briefcase,
  Crown,
  Phone,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { PlanId, UserRole } from '../../types.ts';
import { toast } from '../../lib/toast.ts';

interface GlobalUser {
  id?: number;
  uid: string;
  email: string;
  name: string;
  role: string;
  plan: PlanId;
  agencyName?: string;
  phone?: string;
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GlobalUser | null; // null if creating a new user
  onSuccess: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const isEditing = Boolean(user && user.uid);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('couple');
  const [plan, setPlan] = useState<PlanId>('atelier');
  const [agencyName, setAgencyName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRole((user.role as UserRole) || 'couple');
      setPlan((user.plan as PlanId) || 'atelier');
      setAgencyName(user.agencyName || '');
      setPhone(user.phone || '');
    } else {
      setName('');
      setEmail('');
      setPassword('Atelier2026!');
      setRole('couple');
      setPlan('atelier');
      setAgencyName('');
      setPhone('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = isEditing ? '/api/admin/ceo/users/update' : '/api/admin/ceo/users/create';
      const payload: any = {
        uid: user?.uid,
        name: name.trim() || 'Usuario',
        email: email.trim().toLowerCase(),
        role,
        plan,
        agencyName: role === 'wedding_planner' ? agencyName.trim() : undefined,
        phone: phone.trim() || undefined,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEditing ? 'Usuario actualizado correctamente.' : 'Nuevo usuario creado con éxito.',
          'Operación Exitosa'
        );
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Error al guardar los datos del usuario.');
      }
    } catch (err) {
      console.error('Save user error:', err);
      toast.error('Error de conexión con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-2xl my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-stone-800 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
                {role === 'ceo' ? <Crown className="w-6 h-6" /> : role === 'wedding_planner' ? <Briefcase className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>{isEditing ? 'Editar Perfil de Usuario' : 'Crear Nuevo Usuario'}</span>
                </h3>
                <p className="text-xs text-stone-400">
                  {isEditing ? `Modificando UID: ${user?.uid}` : 'Agrega una cuenta con credenciales y permisos específicos.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Nombre Completo / Titular:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Valeria Martínez"
                className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@correo.com"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  {isEditing ? 'Nueva Contraseña (Opcional):' : 'Contraseña:'}
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Ej. Password123!'}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Rol de Cuenta:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="couple">💖 Pareja / Cliente Organizador</option>
                  <option value="wedding_planner">💼 Event Planner / Agencia</option>
                  <option value="ceo">👑 CEO Master</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Plan de Suscripción:
                </label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanId)}
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="free">Plan Esencial ($0 USD)</option>
                  <option value="atelier">Plan Atelier Romance ($29 USD)</option>
                  <option value="elite">Plan Élite Gran Boda ($59 USD)</option>
                  <option value="planner_starter">Planner Studio ($89 USD)</option>
                  <option value="planner_pro">Planner Agencia ($179 USD)</option>
                  <option value="ceo_unlimited">CEO Ilimitado</option>
                </select>
              </div>
            </div>

            {role === 'wedding_planner' && (
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Nombre de la Agencia / Estudio:
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Ej. Valeria Martínez Event Design Studio"
                  className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Teléfono de Contacto (Opcional):
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full text-xs bg-stone-950 border border-stone-700 rounded-xl px-3 py-2.5 text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
