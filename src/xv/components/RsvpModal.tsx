import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Heart,
  CheckCircle,
  XCircle,
  Users,
  Search,
  Music,
  Utensils,
  MessageSquare,
  Sparkles,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Guest, WeddingSettings } from '../../types.ts';
import { toast } from '../../lib/toast.ts';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGuest?: Guest | null;
  settings: WeddingSettings;
  onRsvpSuccess: (updatedGuest: Guest) => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({
  isOpen,
  onClose,
  initialGuest,
  settings,
  onRsvpSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [guest, setGuest] = useState<Guest | null>(initialGuest || null);

  // Form states
  const [status, setStatus] = useState<'confirmed' | 'declined'>('confirmed');
  const [confirmedPasses, setConfirmedPasses] = useState(1);
  const [attendingCeremony, setAttendingCeremony] = useState(true);
  const [attendingReception, setAttendingReception] = useState(true);
  const [dietary, setDietary] = useState('');
  const [companions, setCompanions] = useState<string[]>([]);
  const [song, setSong] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialGuest) {
      setGuest(initialGuest);
      setConfirmedPasses(initialGuest.confirmedPasses > 0 ? initialGuest.confirmedPasses : initialGuest.allocatedPasses);
      setStatus(initialGuest.status === 'declined' ? 'declined' : 'confirmed');
      setAttendingCeremony(initialGuest.attendingCeremony ?? true);
      setAttendingReception(initialGuest.attendingReception ?? true);
      setDietary(initialGuest.dietaryRestrictions || '');
      setSong(initialGuest.suggestedSong || '');
      setMessage(initialGuest.message || '');
      setPhone(initialGuest.phone || '');
      setEmail(initialGuest.email || '');

      try {
        const parsed = JSON.parse(initialGuest.companionNames || '[]');
        setCompanions(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCompanions([]);
      }
    }
  }, [initialGuest]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearchError('');
    try {
      const res = await fetch(`/api/rsvp/find?q=${encodeURIComponent(searchQuery.trim())}&weddingId=${settings.id || 1}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invitación no encontrada');
      }
      const data: Guest = await res.json();
      setGuest(data);
      setConfirmedPasses(data.confirmedPasses > 0 ? data.confirmedPasses : data.allocatedPasses);
      setStatus(data.status === 'declined' ? 'declined' : 'confirmed');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setDietary(data.dietaryRestrictions || '');
      setSong(data.suggestedSong || '');
      setMessage(data.message || '');

      try {
        const parsed = JSON.parse(data.companionNames || '[]');
        setCompanions(Array.isArray(parsed) ? parsed : []);
      } catch {
        setCompanions([]);
      }
    } catch (err: any) {
      setSearchError(err.message || 'No se encontró la invitación');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanionChange = (index: number, val: string) => {
    const updated = [...companions];
    updated[index] = val;
    setCompanions(updated);
  };

  const handlePassesChange = (num: number) => {
    setConfirmedPasses(num);
    const newCompanions = [...companions];
    // Keep first companion as guest name if empty
    while (newCompanions.length < num) {
      newCompanions.push('');
    }
    setCompanions(newCompanions.slice(0, num));
  };

  const [isOpenRegistration, setIsOpenRegistration] = useState(false);
  const [genericFullName, setGenericFullName] = useState('');

  const handleSubmitRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;

    setSubmitting(true);
    try {
      const payload = {
        accessCode: guest.accessCode,
        status,
        confirmedPasses: status === 'confirmed' ? confirmedPasses : 0,
        attendingCeremony: status === 'confirmed' ? attendingCeremony : false,
        attendingReception: status === 'confirmed' ? attendingReception : false,
        dietaryRestrictions: dietary,
        companionNames: companions.filter((c) => c.trim() !== ''),
        suggestedSong: song,
        message,
        phone,
        email,
      };

      const res = await fetch('/api/rsvp/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al enviar confirmación');
      }

      const result = await res.json();

      // Trigger Celebration Confetti
      if (status === 'confirmed') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#c5a059', '#b85d38', '#f59e0b', '#ec4899', '#10b981'],
        });
      }

      setIsSuccess(true);
      onRsvpSuccess(result.guest);
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error al guardar tu confirmación', 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOpenRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericFullName.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        weddingId: settings.id || 1,
        fullName: genericFullName.trim(),
        status,
        confirmedPasses: status === 'confirmed' ? confirmedPasses : 0,
        attendingCeremony: status === 'confirmed' ? attendingCeremony : false,
        attendingReception: status === 'confirmed' ? attendingReception : false,
        dietaryRestrictions: dietary,
        companionNames: companions.filter((c) => c.trim() !== ''),
        suggestedSong: song,
        message,
        phone,
        email,
      };

      const res = await fetch('/api/rsvp/register-open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al registrar tu asistencia');
      }

      const result = await res.json();
      setGuest(result.guest);

      if (status === 'confirmed') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#c5a059', '#b85d38', '#f59e0b', '#ec4899', '#10b981'],
        });
      }

      setIsSuccess(true);
      onRsvpSuccess(result.guest);
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error al registrar tu asistencia', 'Error al registrar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#faf8f5] border border-amber-300/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8 text-stone-800 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-200/60 transition-colors text-xl font-bold cursor-pointer"
        >
          &times;
        </button>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full aspect-square shrink-0 circle-badge bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10" />
            </motion.div>

            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
              {status === 'confirmed' ? '¡Confirmación Recibida con Éxito!' : 'Respuesta Registrada'}
            </h3>

            <p className="text-stone-600 max-w-md mx-auto text-sm leading-relaxed mb-6">
              {status === 'confirmed'
                ? `Muchas gracias ${guest?.fullName}. Me llena de felicidad que me acompañes en mis quince años.`
                : `Siento mucho que no puedas acompañarme ${guest?.fullName}. Te tendré presente en mi corazón.`}
            </p>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 max-w-sm mx-auto text-xs text-amber-900 mb-6">
              <p className="font-semibold">{settings.coupleNames}</p>
              <p className="mt-0.5">{settings.eventDate} • {settings.receptionVenue}</p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-stone-900 text-stone-50 font-medium text-sm hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cerrar y Volver a la Invitación
            </button>
          </div>
        ) : !guest ? (
          /* Step 1: Tabs for Search vs Generic Open Registration */
          <div>
            <div className="text-center mb-5">
              <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">
                Confirmación de Asistencia
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                {isOpenRegistration ? 'Registro de Asistencia' : 'Busca tu Invitación'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isOpenRegistration
                  ? 'Ingresa tu nombre para registrarte a la fiesta de la quinceañera'
                  : 'Ingresa tu código exclusivo o escribe tu nombre completo'}
              </p>
            </div>

            {/* Toggle Tab */}
            <div className="flex bg-stone-100 p-1 rounded-xl mb-5 border border-stone-200">
              <button
                type="button"
                onClick={() => setIsOpenRegistration(false)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  !isOpenRegistration
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                🔍 Buscar por Código o Nombre
              </button>
              <button
                type="button"
                onClick={() => setIsOpenRegistration(true)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isOpenRegistration
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                ✨ Registro Abierto / Genérico
              </button>
            </div>

            {!isOpenRegistration ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej. FAM-RUIZ-101 o Tu Nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-4 py-3.5 pl-11 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm"
                    autoFocus
                  />
                  <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
                </div>

                {searchError && (
                  <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {searchError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? 'Buscando invitación...' : 'Encontrar mi Invitación'}
                </button>

                <div className="mt-4 p-3 bg-stone-100 rounded-xl text-center flex flex-col items-center gap-1">
                  <span className="text-[11px] text-stone-500 block">
                    ¿No tienes un código asignado previamente?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpenRegistration(true)}
                    className="text-xs font-bold text-amber-800 underline hover:text-amber-900 cursor-pointer"
                  >
                    Regístrate directamente aquí
                  </button>
                </div>
              </form>
            ) : (
              /* Generic / Open Registration Form */
              <form onSubmit={handleSubmitOpenRegistration} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carolina & Santiago Gómez"
                    value={genericFullName}
                    onChange={(e) => setGenericFullName(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm font-serif"
                    autoFocus
                  />
                </div>

                {/* Attendance Toggle */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setStatus('confirmed')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      status === 'confirmed'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 shrink-0 ${status === 'confirmed' ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <span className="text-xs font-semibold">¡Sí, asistiré!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      status === 'declined'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                        : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <XCircle className={`w-5 h-5 shrink-0 ${status === 'declined' ? 'text-rose-600' : 'text-stone-400'}`} />
                    <span className="text-xs font-semibold">No podré asistir</span>
                  </button>
                </div>

                {status === 'confirmed' && (
                  <div className="space-y-3 pt-1 animate-fadeIn">
                    {/* Number of passes */}
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-amber-900 block">
                          Número de personas que asisten:
                        </span>
                        <span className="text-[10px] text-amber-700">Incluyéndote a ti</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg p-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handlePassesChange(num)}
                            className={`w-7 h-7 rounded-md font-bold text-xs transition-all cursor-pointer ${
                              confirmedPasses === num
                                ? 'bg-[#5A5A40] text-white shadow-2xs'
                                : 'text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Companion names */}
                    {confirmedPasses > 1 && (
                      <div className="space-y-1.5 bg-white p-3 rounded-xl border border-stone-200">
                        <span className="text-[11px] font-semibold text-stone-700 block">
                          Nombres de tus acompañantes:
                        </span>
                        {Array.from({ length: confirmedPasses - 1 }).map((_, idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Acompañante ${idx + 1}`}
                            value={companions[idx + 1] || ''}
                            onChange={(e) => handleCompanionChange(idx + 1, e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                          />
                        ))}
                      </div>
                    )}

                    {/* Suggested Song */}
                    <div>
                      <label className="text-xs font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-amber-700 shrink-0" />
                        Canción para el DJ en la fiesta:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Vivir Mi Vida - Marc Anthony"
                        value={song}
                        onChange={(e) => setSong(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
                    Dedicatoria para los novios:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Escribe unas palabras de felicitación..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="Teléfono / WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="email"
                    placeholder="Email (opcional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !genericFullName.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold text-sm shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {submitting ? 'Registrando tu asistencia...' : 'Registrar y Confirmar'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Step 2: Fill RSVP Details */
          <form onSubmit={handleSubmitRsvp} className="space-y-5">
            <div className="border-b border-stone-200 pb-3">
              <span className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold block">
                Invitación Confirmada para
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {guest.fullName}
              </h3>
              <p className="text-xs text-stone-500">
                Pases asignados: <strong className="text-stone-800">{guest.allocatedPasses} personas</strong> • Código: <span className="font-mono">{guest.accessCode}</span>
              </p>
            </div>

            {/* Attendance Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('confirmed')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'confirmed'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CheckCircle className={`w-5 h-5 shrink-0 ${status === 'confirmed' ? 'text-emerald-600' : 'text-stone-400'}`} />
                <span className="text-xs font-semibold">¡Sí, asistiré!</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('declined')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'declined'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <XCircle className={`w-5 h-5 shrink-0 ${status === 'declined' ? 'text-rose-600' : 'text-stone-400'}`} />
                <span className="text-xs font-semibold">No podré asistir</span>
              </button>
            </div>

            {status === 'confirmed' && (
              <div className="space-y-4">
                {/* Number of passes used */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center justify-between">
                    <span>Número de pases que utilizarás:</span>
                    <span className="text-amber-800 font-bold">{confirmedPasses} de {guest.allocatedPasses}</span>
                  </label>
                  <div className="flex gap-2">
                    {Array.from({ length: guest.allocatedPasses }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handlePassesChange(num)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
                          confirmedPasses === num
                            ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Companion Names */}
                {confirmedPasses > 1 && (
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <label className="text-xs font-semibold text-stone-700 block">
                      Nombre de acompañantes:
                    </label>
                    {Array.from({ length: confirmedPasses - 1 }, (_, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Acompañante ${i + 1} (Nombre completo)`}
                        value={companions[i + 1] || ''}
                        onChange={(e) => handleCompanionChange(i + 1, e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                      />
                    ))}
                  </div>
                )}

                {/* Dietary Requirements */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-amber-700 shrink-0" />
                    Restricciones alimentarias / Alergias:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Vegetariano, Vegano, Celíaco, Alergia a nueces..."
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Suggested Song */}
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-amber-700 shrink-0" />
                    Canción que te gustaría escuchar en la fiesta (DJ):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Vivir Mi Vida - Marc Anthony"
                    value={song}
                    onChange={(e) => setSong(e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Heartfelt Message for Guestbook */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
                Dedicatoria o mensaje para la quinceañera:
              </label>
              <textarea
                rows={2}
                placeholder="Escribe unas palabras de felicitación y bendiciones para mis XV..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGuest(null)}
                className="px-4 py-3 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-medium cursor-pointer"
              >
                Cambiar de invitado
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 text-white font-semibold text-sm shadow-md hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
              >
                {submitting ? 'Guardando confirmación...' : 'Enviar Confirmación'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
