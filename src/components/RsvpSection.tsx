import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  XCircle,
  Users,
  Search,
  Music,
  Utensils,
  MessageSquare,
  Sparkles,
  UserCheck,
  AlertCircle,
  Phone,
  Mail,
  User,
  CalendarCheck
} from 'lucide-react';
import { Guest, WeddingSettings } from '../types.ts';
import { DEMO_GUESTS } from '../data/demoGuests.ts';

// Helper for comprehensive fuzzy/multi-token matching
const matchGuestTokens = (guest: Guest, search: string) => {
  const normalize = (str: string = '') =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const tokens = search.trim().split(/\s+/).filter(Boolean).map(normalize);
  if (tokens.length === 0) return false;

  const combined = normalize(
    `${guest.fullName || ''} ${guest.accessCode || ''} ${guest.groupName || ''} ${guest.email || ''} ${guest.phone || ''} ${guest.companionNames || ''}`
  );

  return tokens.every((tok) => combined.includes(tok));
};
import { CARD_THEMES } from '../lib/themes.ts';
import { AnimatedChampagneGlasses, StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { toast } from '../lib/toast.ts';

interface RsvpSectionProps {
  initialGuest?: Guest | null;
  settings: WeddingSettings;
  onRsvpSuccess: (updatedGuest: Guest) => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  initialGuest,
  settings,
  onRsvpSuccess,
}) => {
  const [guest, setGuest] = useState<Guest | null>(initialGuest || null);
  const [fullName, setFullName] = useState(initialGuest?.fullName || '');
  
  // Real-time suggestions state
  const [suggestions, setSuggestions] = useState<Guest[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  const activeTheme = CARD_THEMES[settings.cardStyle] || CARD_THEMES['classic-gold'];
  const isDark = activeTheme.isDark;
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Synchronize when initialGuest arrives from URL code
  useEffect(() => {
    if (initialGuest) {
      applyGuestData(initialGuest);
    }
  }, [initialGuest]);

  const applyGuestData = (selected: Guest) => {
    setGuest(selected);
    setFullName(selected.fullName);
    setConfirmedPasses(selected.confirmedPasses > 0 ? selected.confirmedPasses : selected.allocatedPasses);
    setStatus(selected.status === 'declined' ? 'declined' : 'confirmed');
    setAttendingCeremony(selected.attendingCeremony ?? true);
    setAttendingReception(selected.attendingReception ?? true);
    setDietary(selected.dietaryRestrictions || '');
    setSong(selected.suggestedSong || '');
    setMessage(selected.message || '');
    setPhone(selected.phone || '');
    setEmail(selected.email || '');

    try {
      const parsed = JSON.parse(selected.companionNames || '[]');
      setCompanions(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCompanions([]);
    }
    setShowSuggestions(false);
  };

  // Real-time suggestions search as user types (instant multi-token search with backend sync)
  useEffect(() => {
    if (guest && guest.fullName === fullName) {
      return; // Already selected this guest
    }

    const trimmed = fullName.trim();
    if (!trimmed) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // 1. Instant local search from DEMO_GUESTS for zero-latency feedback
    const localMatches = DEMO_GUESTS.filter((g) => matchGuestTokens(g, trimmed));
    if (localMatches.length > 0) {
      setSuggestions(localMatches);
      setShowSuggestions(true);
    }

    // 2. Fetch from backend with robust JSON validation
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/rsvp/suggest?q=${encodeURIComponent(trimmed)}&weddingId=${settings.id || 1}`);
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Combine with local matches avoiding duplicates by accessCode
            const merged = [...data];
            localMatches.forEach((lm) => {
              if (!merged.some((m) => m.accessCode === lm.accessCode)) {
                if (matchGuestTokens(lm, trimmed)) {
                  merged.push(lm);
                }
              }
            });

            if (merged.length > 0) {
              setSuggestions(merged.slice(0, 8));
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        }
      } catch (e) {
        // Safe fallback: keep local matches if backend returns HTML or network error
        if (localMatches.length > 0) {
          setSuggestions(localMatches);
          setShowSuggestions(true);
        }
      } finally {
        setIsSearching(false);
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [fullName, settings.id, guest]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCompanionChange = (index: number, val: string) => {
    const updated = [...companions];
    updated[index] = val;
    setCompanions(updated);
  };

  const handlePassesChange = (num: number) => {
    setConfirmedPasses(num);
    const newCompanions = [...companions];
    while (newCompanions.length < num) {
      newCompanions.push('');
    }
    setCompanions(newCompanions.slice(0, num));
  };

  const handleSelectSuggestedGuest = (selected: Guest) => {
    applyGuestData(selected);
  };

  const handleClearSelectedGuest = () => {
    setGuest(null);
    setFullName('');
    setConfirmedPasses(1);
    setCompanions([]);
    setDietary('');
    setSong('');
    setMessage('');
    setPhone('');
    setEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.warning('Por favor escribe tu nombre completo para continuar.', 'Nombre requerido');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (guest && guest.accessCode) {
        // Confirm assigned guest
        const payload = {
          weddingId: settings.id || 1,
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

        res = await fetch('/api/rsvp/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Open / generic registration
        const payload = {
          weddingId: settings.id || 1,
          fullName: fullName.trim(),
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

        res = await fetch('/api/rsvp/register-open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al procesar tu confirmación');
      }

      const result = await res.json();
      setGuest(result.guest);

      if (status === 'confirmed') {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#c5a059', '#b85d38', '#f59e0b', '#ec4899', '#10b981'],
        });
      }

      setIsSuccess(true);
      onRsvpSuccess(result.guest);
    } catch (err: any) {
      toast.error(err.message || 'Ocurrió un error al enviar tu respuesta', 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  const maxSelectablePasses = guest?.allocatedPasses ? Math.max(guest.allocatedPasses, 1) : 6;

  return (
    <section id="rsvp" className={`w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-12 transition-colors duration-500 ${activeTheme.bgClass}`}>
      <div className="w-full max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 shadow-2xs" style={{ borderColor: activeTheme.accentColorHex, color: activeTheme.accentColorHex }}>
            <CalendarCheck className="w-4 h-4" />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold">Confirmación de Asistencia</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight ${activeTheme.textPrimaryClass}`}>
            Acompáñanos en Nuestro Gran Día
          </h2>

          <StyleSpecificDivider
            cardStyle={settings.cardStyle}
            className="w-48 sm:w-64 h-8 mx-auto mt-4"
            color={activeTheme.accentColorHex}
          />

          <p className={`text-sm sm:text-base font-serif max-w-xl mx-auto mt-3 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
            Por favor confírmanos tu asistencia antes del <strong className="font-semibold">{settings.rsvpDeadline || 'la fecha límite'}</strong> para coordinar todos los preparativos de la recepción.
          </p>
        </div>

        {/* Main Inline Card Container (Broad and spacious) */}
        <div className={`w-full rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 border shadow-xl transition-all ${activeTheme.cardBgClass}`}>
          {isSuccess ? (
            /* Success View */
            <div className="text-center py-10 sm:py-14 animate-fadeIn">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full aspect-square shrink-0 circle-badge bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
              >
                <CheckCircle className="w-12 h-12" />
              </motion.div>

              <h3 className={`text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 ${activeTheme.textPrimaryClass}`}>
                {status === 'confirmed' ? '¡Confirmación Registrada con Éxito!' : 'Respuesta Registrada'}
              </h3>

              <p className={`text-sm sm:text-base max-w-lg mx-auto leading-relaxed mb-8 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                {status === 'confirmed'
                  ? `Muchas gracias ${fullName}. Nos llena de felicidad que nos acompañes a celebrar nuestro amor.`
                  : `Sentimos que no puedas acompañarnos ${fullName}. Estarás presente en nuestros corazones.`}
              </p>

              <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 max-w-md mx-auto text-xs sm:text-sm mb-8 space-y-1">
                <p className="font-bold text-stone-900 dark:text-stone-100">{settings.coupleNames}</p>
                <p className="text-stone-600 dark:text-stone-400">{settings.eventDate} • {settings.receptionVenue}</p>
                {status === 'confirmed' && (
                  <p className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                    Pases confirmados: {confirmedPasses} persona(s)
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="px-8 py-3 rounded-full bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-medium text-xs sm:text-sm hover:opacity-90 transition-all cursor-pointer shadow-md"
              >
                Modificar o Verificar mi Respuesta
              </button>
            </div>
          ) : (
            /* Open Inline Registration Form */
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* 1. Name Input with Real-time Guest Autocomplete & Search */}
              <div className="relative" ref={suggestionsRef}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-xs sm:text-sm font-bold uppercase tracking-wider block ${activeTheme.textPrimaryClass}`}>
                    Nombre Completo
                  </label>
                  {guest && (
                    <button
                      type="button"
                      onClick={handleClearSelectedGuest}
                      className="text-xs text-amber-700 hover:text-amber-900 underline font-medium cursor-pointer"
                    >
                      Cambiar de persona
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Escribe tu nombre y apellido..."
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (guest && guest.fullName !== e.target.value) {
                        setGuest(null);
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className={`w-full px-5 py-4 pl-12 rounded-2xl border text-sm sm:text-base font-serif transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-stone-900/80 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:ring-amber-400/20'
                        : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-600/20 shadow-xs'
                    }`}
                  />
                  <User className="w-5 h-5 text-stone-400 absolute left-4 top-4" />
                  {isSearching && (
                    <span className="absolute right-4 top-4 text-xs font-mono text-stone-400 animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>

                {/* Autocomplete Dropdown when matching existing guest names */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-2 bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-stone-700 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                    <div className="p-2.5 bg-amber-50 dark:bg-stone-800/80 border-b border-amber-200/60 dark:border-stone-700 text-[11px] font-semibold text-amber-900 dark:text-amber-300 flex items-center justify-between">
                      <span>Coincidencias encontradas en la lista de invitados:</span>
                      <span className="font-mono text-[10px]">Toca tu nombre</span>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSuggestedGuest(s)}
                          className="w-full text-left p-3.5 hover:bg-amber-50/70 dark:hover:bg-stone-800 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div>
                            <p className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                              {s.fullName}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {s.groupName || 'Invitado'} • Pases reservados: <strong>{s.allocatedPasses} personas</strong>
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 text-xs font-semibold shrink-0">
                            Seleccionar
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {guest && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-800/80 border border-amber-300/70 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-950 dark:text-stone-200">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Invitación identificada: <strong>{guest.fullName}</strong> • Grupo: {guest.groupName || 'General'}
                      </span>
                    </div>
                    <span className="font-mono text-amber-900 dark:text-amber-300 font-bold">
                      {guest.allocatedPasses} pases asignados
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Attendance Status Selection (Buttons) */}
              <div>
                <label className={`text-xs sm:text-sm font-bold uppercase tracking-wider block mb-3 ${activeTheme.textPrimaryClass}`}>
                  ¿Nos acompañarás a celebrar?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStatus('confirmed')}
                    className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      status === 'confirmed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 shrink-0 ${status === 'confirmed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`} />
                    <div className="text-left">
                      <span className="text-sm sm:text-base font-bold block">Sí, con mucho gusto asistiré</span>
                      <span className="text-xs opacity-75">Confirmo mi asistencia a la celebración</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('declined')}
                    className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      status === 'declined'
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30 shadow-sm'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <XCircle className={`w-6 h-6 shrink-0 ${status === 'declined' ? 'text-rose-600 dark:text-rose-400' : 'text-stone-400'}`} />
                    <div className="text-left">
                      <span className="text-sm sm:text-base font-bold block">No podré asistir</span>
                      <span className="text-xs opacity-75">No podré acompañarlos esta vez</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Detailed Attendance Options (When Attending) */}
              {status === 'confirmed' && (
                <div className="space-y-6 pt-2 animate-fadeIn">
                  
                  {/* Passes Counter Selector */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className={`text-sm sm:text-base font-bold block ${activeTheme.textPrimaryClass}`}>
                        Número de Asistentes
                      </span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        {guest?.allocatedPasses
                          ? `Tu invitación cuenta con hasta ${guest.allocatedPasses} pases reservados.`
                          : 'Indica cuántas personas asistirán en total (incluyéndote).'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-1.5 self-start sm:self-auto">
                      {Array.from({ length: maxSelectablePasses }).map((_, idx) => {
                        const num = idx + 1;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => handlePassesChange(num)}
                            className={`w-9 h-9 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                              confirmedPasses === num
                                ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Companion names fields */}
                  {confirmedPasses > 1 && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                      <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider block ${activeTheme.textPrimaryClass}`}>
                        Nombres de tus Acompañantes
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: confirmedPasses - 1 }).map((_, idx) => (
                          <input
                            key={idx}
                            type="text"
                            placeholder={`Acompañante ${idx + 1}`}
                            value={companions[idx + 1] || ''}
                            onChange={(e) => handleCompanionChange(idx + 1, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dietary & DJ Song Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                        <Utensils className="w-4 h-4 text-amber-700 shrink-0" />
                        Restricciones Alimentarias (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Vegetariano, celíaco, alergia a frutos secos..."
                        value={dietary}
                        onChange={(e) => setDietary(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                        <Music className="w-4 h-4 text-amber-700 shrink-0" />
                        Canción para la Fiesta (DJ)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Vivir Mi Vida - Marc Anthony"
                        value={song}
                        onChange={(e) => setSong(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Dedication message for couple */}
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                  <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
                  Mensaje o Dedicatoria para los Novios
                </label>
                <textarea
                  rows={3}
                  placeholder="Escribe unas palabras de felicitación o buenos deseos..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 resize-none"
                />
              </div>

              {/* 5. Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                    <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. +51 987 654 321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                    <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || !fullName.trim()}
                  className="w-full py-4 sm:py-5 rounded-2xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 font-serif font-bold text-base sm:text-lg shadow-xl hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Procesando confirmación...</span>
                  ) : (
                    <span>Confirmar Respuesta</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
