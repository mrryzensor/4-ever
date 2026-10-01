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
  CalendarCheck,
  Plus,
  Minus,
  ChevronDown,
  Pencil,
} from 'lucide-react';
import { Guest, WeddingSettings } from '../types.ts';
import { DEMO_GUESTS } from '../data/demoGuests.ts';
import { formatRsvpDeadlineMessage } from '../lib/dateFormatters.ts';

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
import { getContrastTextColor } from '../lib/colorUtils.ts';
import { AnimatedChampagneGlasses, StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { toast } from '../lib/toast.ts';
import { RsvpCompanionToggle } from './RsvpCompanionToggle.tsx';
import { normalizeCompanionNames, parseGuestCompanionNames } from '../lib/guestCompanions.ts';
import { getRsvpClosedMessage, isRsvpActionAllowed } from '../lib/rsvpAvailability.ts';
import { resolveInvitationTheme } from '../lib/invitationTheme.ts';

interface RsvpSectionProps {
  initialGuest?: Guest | null;
  settings: WeddingSettings;
  onRsvpSuccess: (updatedGuest: Guest) => void;
  inline?: boolean;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  initialGuest,
  settings,
  onRsvpSuccess,
  inline = false,
}) => {
  const [guest, setGuest] = useState<Guest | null>(initialGuest || null);
  const [fullName, setFullName] = useState(initialGuest?.fullName || '');
  
  // Real-time suggestions state
  const [suggestions, setSuggestions] = useState<Guest[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Form states
  const [status, setStatus] = useState<'confirmed' | 'declined'>('confirmed');
  const [companionCount, setCompanionCount] = useState(0);
  const [bringingCompanions, setBringingCompanions] = useState(false);
  const [attendingCeremony, setAttendingCeremony] = useState(true);
  const [attendingReception, setAttendingReception] = useState(true);
  const [dietary, setDietary] = useState('');
  const [companions, setCompanions] = useState<string[]>([]);
  const [song, setSong] = useState('');
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEditingSavedResponse, setIsEditingSavedResponse] = useState(false);
  const maxSelectableCompanions = guest && guest.groupName !== 'Invitación Genérica / Registro Abierto'
    ? Math.max((guest.allocatedPasses || 1) - 1, 0)
    : 5;
  const savedResponseGuest = [guest, initialGuest].find(
    (candidate): candidate is Guest => candidate?.status === 'confirmed' || candidate?.status === 'declined',
  ) ?? null;
  const displayedStatus = savedResponseGuest?.status === 'declined' ? 'declined' : status;
  const canRegisterRsvp = isRsvpActionAllowed(settings, 'register');
  const canEditRsvp = isRsvpActionAllowed(settings, 'edit');

  const activeTheme = resolveInvitationTheme(settings, CARD_THEMES, 'classic-gold');
  const rsvpAccentColor = activeTheme.itineraryAccentColorHex || activeTheme.accentColorHex;
  const rsvpAccentTextColor = getContrastTextColor(rsvpAccentColor);
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
    const passes = selected.confirmedPasses > 0 ? selected.confirmedPasses : 1;
    const selectedCompanionCount = Math.max(0, passes - 1);
    setCompanionCount(selectedCompanionCount);
    setBringingCompanions(selectedCompanionCount > 0);
    setStatus(selected.status === 'declined' ? 'declined' : 'confirmed');
    setAttendingCeremony(selected.attendingCeremony ?? true);
    setAttendingReception(selected.attendingReception ?? true);
    setDietary(selected.dietaryRestrictions || '');
    setSong(selected.suggestedSong || '');
    setMessage(selected.message || '');
    setPhone(selected.phone || '');
    setEmail(selected.email || '');

    setCompanions(parseGuestCompanionNames(selected.companionNames, selected.fullName, passes));
    setShowSuggestions(false);
  };

  // Real-time suggestions search as user types (instant multi-token search with backend sync)
  useEffect(() => {
    if (isEditingSavedResponse) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
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
  }, [fullName, settings.id, guest, isEditingSavedResponse]);

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

  const handleCompanionCountChange = (num: number) => {
    const boundedCount = Math.min(maxSelectableCompanions, Math.max(1, Math.trunc(num)));
    setCompanionCount(boundedCount);
    setCompanions((current) => {
      const updated = [...current];
      while (updated.length < boundedCount) updated.push('');
      return updated.slice(0, boundedCount);
    });
  };

  const handleSelectSuggestedGuest = (selected: Guest) => {
    applyGuestData(selected);
  };

  const handleEditSavedResponse = () => {
    if (!savedResponseGuest || !canEditRsvp) return;
    applyGuestData(savedResponseGuest);
    setShowExtraDetails(Boolean(
      savedResponseGuest.dietaryRestrictions?.trim()
      || savedResponseGuest.suggestedSong?.trim()
      || savedResponseGuest.message?.trim()
      || savedResponseGuest.phone?.trim()
      || savedResponseGuest.email?.trim(),
    ));
    setIsSuccess(false);
    setIsEditingSavedResponse(true);
  };

  const handleClearSelectedGuest = () => {
    setGuest(null);
    setFullName('');
    setCompanionCount(0);
    setBringingCompanions(false);
    setCompanions([]);
    setDietary('');
    setSong('');
    setMessage('');
    setPhone('');
    setEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = isEditingSavedResponse ? 'edit' : 'register';
    if (!isRsvpActionAllowed(settings, action)) {
      toast.warning(getRsvpClosedMessage(action, settings));
      return;
    }
    if (!fullName.trim()) {
      toast.warning('Por favor escribe tu nombre completo para continuar.', 'Nombre requerido');
      return;
    }

    const submittedCompanionCount = status === 'confirmed' && bringingCompanions ? companionCount : 0;
    const enteredCompanionNames = companions.slice(0, submittedCompanionCount).map((name) => name?.trim() || '');
    if (enteredCompanionNames.some((name) => !name)) {
      toast.warning('Escribe el nombre completo de cada acompañante o reduce la cantidad seleccionada.', 'Faltan nombres');
      return;
    }

    setSubmitting(true);
    try {
      const submittedPasses = status === 'confirmed' ? submittedCompanionCount + 1 : 0;
      const submittedCompanions = normalizeCompanionNames(enteredCompanionNames, submittedCompanionCount);
      let res;
      if (guest && guest.accessCode) {
        // Confirm assigned guest
        const payload = {
          weddingId: settings.id || 1,
          accessCode: guest.accessCode,
          fullName: fullName.trim(),
          editExisting: isEditingSavedResponse,
          status,
          confirmedPasses: submittedPasses,
          attendingCeremony: status === 'confirmed' ? attendingCeremony : false,
          attendingReception: status === 'confirmed' ? attendingReception : false,
          dietaryRestrictions: dietary,
          companionNames: submittedCompanions,
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
          confirmedPasses: submittedPasses,
          attendingCeremony: status === 'confirmed' ? attendingCeremony : false,
          attendingReception: status === 'confirmed' ? attendingReception : false,
          dietaryRestrictions: dietary,
          companionNames: submittedCompanions,
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
      setIsEditingSavedResponse(false);

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

  const handleBringCompanionsChange = (enabled: boolean) => {
    setBringingCompanions(enabled);
    if (enabled) {
      setCompanionCount((current) => Math.min(maxSelectableCompanions, Math.max(1, current)));
    } else {
      setCompanionCount(0);
    }
  };

  return (
    <section id={inline ? 'rsvp-inline' : 'rsvp'} className={`w-full ${inline ? 'py-2 px-0' : 'py-10 sm:py-14 px-4 sm:px-6 lg:px-12'} transition-colors duration-500 ${inline ? '' : activeTheme.bgClass}`} style={inline ? undefined : { backgroundColor: activeTheme.bgHex }}>
      <div className={`w-full ${inline ? '' : 'max-w-7xl 2xl:max-w-[1600px] mx-auto'}`}>
        
        {/* Section Header */}
        <div className={`text-center ${inline ? 'mb-4' : 'mb-8 sm:mb-10'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4 shadow-2xs" style={{ borderColor: activeTheme.accentColorHex, color: activeTheme.accentColorHex }}>
            <CalendarCheck className="w-4 h-4" />
            <span className="text-xs uppercase tracking-[0.25em] font-semibold">Confirmación de Asistencia</span>
          </div>

          <h2 className={`${inline ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl md:text-5xl'} font-serif font-normal tracking-tight ${activeTheme.textPrimaryClass}`}>
            Acompáñanos en Nuestro Gran Día
          </h2>

          {!inline && <StyleSpecificDivider
            cardStyle={settings.cardStyle}
            dividerStyle={settings.dividerStyle}
            className="w-48 sm:w-64 h-8 mx-auto mt-4"
            color={activeTheme.accentColorHex}
          />}

          <p className={`whitespace-pre-line text-base sm:text-lg font-semibold font-serif max-w-xl mx-auto mt-3 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
            {formatRsvpDeadlineMessage(settings.rsvpDeadlineMessage, settings.rsvpDeadline)}
          </p>
        </div>

        {/* Main Inline Card Container (Broad and spacious) */}
        <div className={`w-full ${inline ? 'rounded-2xl p-4 sm:p-6 shadow-md' : 'rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 md:p-14 shadow-xl'} border transition-all ${activeTheme.cardBgClass}`}>
          {(isSuccess || savedResponseGuest) && !isEditingSavedResponse ? (
            /* Success View */
            <div className="text-center py-10 sm:py-14 animate-fadeIn">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`w-20 h-20 rounded-full aspect-square shrink-0 circle-badge flex items-center justify-center mx-auto mb-6 border ${displayedStatus === 'confirmed'
                  ? isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500 ring-2 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-500'
                  : isDark ? 'bg-rose-950/40 text-rose-400 border-rose-500 ring-2 ring-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-500'}`}
              >
                {displayedStatus === 'confirmed' ? <CheckCircle className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
              </motion.div>

              <h3 data-typography-role="heading" className={`text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-3 ${activeTheme.textPrimaryClass}`}>
                {savedResponseGuest
                  ? displayedStatus === 'confirmed' ? 'Tu asistencia ya está confirmada' : 'Ya registraste que no podrás asistir'
                  : displayedStatus === 'confirmed' ? '¡Confirmación Registrada con Éxito!' : 'Respuesta Registrada'}
              </h3>

              <p data-typography-role="body" className={`text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-8 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                {displayedStatus === 'confirmed'
                  ? `Muchas gracias ${savedResponseGuest?.fullName || fullName}. Nos llena de felicidad que nos acompañes a celebrar nuestro amor.`
                  : `Sentimos que no puedas acompañarnos ${savedResponseGuest?.fullName || fullName}. Estarás presente en nuestros corazones.`}
              </p>

              <div className={`p-5 rounded-2xl border max-w-md mx-auto mb-8 space-y-1 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                <p data-typography-role="heading" className={`text-base sm:text-lg font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{settings.coupleNames}</p>
                <p data-typography-role="detail" className={`text-sm sm:text-base ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{settings.eventDate} • {settings.receptionVenue}</p>
                {displayedStatus === 'confirmed' && (
                  <p data-typography-role="body" className={`text-base sm:text-lg font-serif font-semibold pt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Pases confirmados: {savedResponseGuest?.confirmedPasses ?? (status === 'confirmed' ? companionCount + 1 : 0)} persona(s)
                  </p>
                )}
              </div>
              {savedResponseGuest?.accessCode && canEditRsvp && (
                <button
                  type="button"
                  data-typography-role="button"
                  onClick={handleEditSavedResponse}
                  className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 font-serif font-semibold transition-colors hover:bg-black/5"
                  style={{ borderColor: rsvpAccentColor, color: rsvpAccentColor }}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Editar mi respuesta
                </button>
              )}
              {savedResponseGuest?.accessCode && !canEditRsvp && (
                <p data-typography-role="detail" className={`mx-auto max-w-md text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  {getRsvpClosedMessage('edit', settings)}
                </p>
              )}
            </div>
          ) : (
            !isEditingSavedResponse && !canRegisterRsvp ? (
              <div role="status" className={`mx-auto max-w-xl rounded-2xl border p-6 text-center ${isDark ? 'border-stone-700 bg-stone-900/50' : 'border-stone-200 bg-stone-50'}`}>
                <AlertCircle className={`mx-auto mb-3 h-9 w-9 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
                <h3 data-typography-role="heading" className={`font-serif text-xl font-bold ${activeTheme.textPrimaryClass}`}>Registro cerrado</h3>
                <p data-typography-role="body" className={`mt-2 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{getRsvpClosedMessage('register', settings)}</p>
              </div>
            ) : isEditingSavedResponse && !canEditRsvp ? (
              <div role="status" className={`mx-auto max-w-xl rounded-2xl border p-6 text-center ${isDark ? 'border-stone-700 bg-stone-900/50' : 'border-stone-200 bg-stone-50'}`}>
                <AlertCircle className={`mx-auto mb-3 h-9 w-9 ${isDark ? 'text-stone-400' : 'text-stone-500'}`} />
                <h3 data-typography-role="heading" className={`font-serif text-xl font-bold ${activeTheme.textPrimaryClass}`}>Edición cerrada</h3>
                <p data-typography-role="body" className={`mt-2 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{getRsvpClosedMessage('edit', settings)}</p>
              </div>
            ) : (
            /* Open Inline Registration Form */
            <form onSubmit={handleSubmit} className="space-y-8">

              {isEditingSavedResponse && (
                <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${isDark ? 'border-stone-700 bg-stone-900/60' : 'border-stone-200 bg-stone-50'}`}>
                  <p data-typography-role="body" className={isDark ? 'text-stone-200' : 'text-stone-700'}>Estás editando tu respuesta guardada.</p>
                  <button
                    type="button"
                    data-typography-role="button"
                    onClick={() => { setIsEditingSavedResponse(false); setIsSuccess(false); }}
                    className="rounded-full border px-4 py-2 font-serif font-semibold"
                    style={{ borderColor: rsvpAccentColor, color: rsvpAccentColor }}
                  >
                    Cancelar edición
                  </button>
                </div>
              )}

              {/* 1. Name Input with Real-time Guest Autocomplete & Search */}
              <div className="relative" ref={suggestionsRef}>
                <div className="flex items-center justify-between mb-2">
                  <label data-typography-role="detail" className={`text-sm sm:text-base font-bold uppercase tracking-wider block ${activeTheme.textPrimaryClass}`}>
                    Nombre Completo
                  </label>
                  {guest && !isEditingSavedResponse && (
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
                    data-typography-role="body"
                    placeholder="Escribe tu nombre y apellido..."
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (!isEditingSavedResponse && guest && guest.fullName !== e.target.value) {
                        setGuest(null);
                      }
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className={`w-full px-5 py-4 pl-12 rounded-2xl border text-base sm:text-lg font-serif transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-stone-900/80 border-stone-700 text-stone-100 placeholder:text-stone-500 focus:border-amber-400 focus:ring-amber-400/20'
                        : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:ring-amber-600/20 shadow-xs'
                    }`}
                  />
                  <User className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  {isSearching && (
                    <span className="absolute right-4 top-4 text-xs font-mono text-stone-400 animate-pulse">
                      Buscando...
                    </span>
                  )}
                </div>

                {/* Autocomplete Dropdown when matching existing guest names */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 z-30 mt-2 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn border ${isDark ? 'bg-stone-900 border-stone-700' : 'bg-white border-amber-300/80'}`}>
                    <div className={`p-2.5 border-b text-[11px] font-semibold flex items-center justify-between ${isDark ? 'bg-stone-800/80 border-stone-700 text-amber-300' : 'bg-amber-50 border-amber-200/60 text-amber-900'}`}>
                      <span>Coincidencias encontradas en la lista de invitados:</span>
                      <span className="font-mono text-[10px]">Toca tu nombre</span>
                    </div>
                    <div className={`max-h-60 overflow-y-auto divide-y ${isDark ? 'divide-stone-800' : 'divide-stone-100'}`}>
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSuggestedGuest(s)}
                          className={`w-full text-left p-3.5 flex items-center justify-between transition-colors cursor-pointer ${isDark ? 'hover:bg-stone-800' : 'hover:bg-amber-50/70'}`}
                        >
                          <div>
                            <p className={`text-sm font-serif font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                              {s.fullName}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                              {s.groupName || 'Invitado'} • Pases reservados: <strong>{s.allocatedPasses} personas</strong>
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-900'}`}>
                            Seleccionar
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {guest && (
                  <div className={`mt-3 p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${isDark ? 'bg-stone-800/80 border-stone-700' : 'bg-amber-50/80 border-amber-300/70'}`}>
                    <div className={`flex items-center gap-2 ${isDark ? 'text-stone-200' : 'text-amber-950'}`}>
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Invitación identificada: <strong>{guest.fullName}</strong> • Grupo: {guest.groupName || 'General'}
                      </span>
                    </div>
                    <span className={`font-mono font-bold ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
                      {guest.allocatedPasses} pases asignados
                    </span>
                  </div>
                )}
              </div>

              {/* 2. Attendance Status Selection (Buttons) */}
              <div>
                <label data-typography-role="heading" className={`text-sm sm:text-base font-bold uppercase tracking-wider block mb-3 ${activeTheme.textPrimaryClass}`}>
                  ¿Nos acompañarás a celebrar?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button data-typography-children="true"
                    type="button"
                    onClick={() => setStatus('confirmed')}
                    className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                      status === 'confirmed'
                        ? isDark
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30 shadow-sm'
                          : 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/30 shadow-sm'
                        : isDark
                          ? 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800/50'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 shrink-0 ${status === 'confirmed' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : 'text-stone-400'}`} />
                    <div className="text-left">
                      <span data-typography-role="heading" className="block text-base sm:text-lg font-bold">Sí, con mucho gusto asistiré</span>
                      <span data-typography-role="body" className="text-sm opacity-75">Confirmo mi asistencia a la celebración</span>
                    </div>
                  </button>

                    <button data-typography-children="true"
                      type="button"
                      onClick={() => setStatus('declined')}
                      className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all cursor-pointer ${
                        status === 'declined'
                        ? isDark
                          ? 'bg-rose-950/40 border-rose-500 text-rose-200 ring-2 ring-rose-500/30 shadow-sm'
                          : 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/30 shadow-sm'
                        : isDark
                          ? 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800/50'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                    <XCircle className={`w-6 h-6 shrink-0 ${status === 'declined' ? (isDark ? 'text-rose-400' : 'text-rose-600') : 'text-stone-400'}`} />
                    <div className="text-left">
                      <span data-typography-role="heading" className="block text-base sm:text-lg font-bold">No podré asistir</span>
                      <span data-typography-role="body" className="text-sm opacity-75">No podré acompañarlos esta vez</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Detailed Attendance Options (When Attending) */}
              {status === 'confirmed' && (
                <div className="space-y-6 pt-2 animate-fadeIn">
                  
                  {maxSelectableCompanions > 0 && (
                    <RsvpCompanionToggle
                      label={settings.rsvpCompanionToggleText?.trim() || '¿Llevas invitados?'}
                      checked={bringingCompanions}
                      onChange={handleBringCompanionsChange}
                      isDark={isDark}
                      accentColor={activeTheme.accentColorHex}
                    />
                  )}

                  {bringingCompanions && maxSelectableCompanions > 0 && (
                    <div className="space-y-4 animate-fadeIn">
                    <div className={`p-4 sm:p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <div className="flex-1">
                      <span data-typography-role="heading" className={`text-base sm:text-lg font-bold block ${activeTheme.textPrimaryClass}`}>
                        ¿Cuántos acompañantes llevarás?
                      </span>
                      <span data-typography-role="body" className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        {guest?.allocatedPasses
                          ? `Puedes llevar hasta ${maxSelectableCompanions} ${maxSelectableCompanions === 1 ? 'persona más' : 'personas más'} (además de ti).`
                          : 'Indica cuántas personas más te acompañarán.'}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center gap-2 border rounded-2xl p-1.5 shadow-2xs ${isDark ? 'bg-stone-900 border-stone-700' : 'bg-white border-stone-200'}`}>
                      {/* Stepper Minus */}
                      <button
                        type="button"
                        onClick={() => handleCompanionCountChange(Math.max(1, companionCount - 1))}
                        disabled={companionCount <= 1}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer ${isDark ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'}`}
                        title="Disminuir acompañantes"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      {/* Number Pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {Array.from({ length: maxSelectableCompanions }).map((_, idx) => {
                          const num = idx + 1;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleCompanionCountChange(num)}
                              className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 rounded-xl font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center ${
                                companionCount === num
                                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs scale-105'
                                  : isDark ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>

                      {/* Stepper Plus */}
                      <button
                        type="button"
                        onClick={() => handleCompanionCountChange(Math.min(maxSelectableCompanions, companionCount + 1))}
                        disabled={companionCount >= maxSelectableCompanions}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer ${isDark ? 'text-stone-300 hover:bg-stone-800' : 'text-stone-600 hover:bg-stone-100'}`}
                        title="Aumentar acompañantes"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Companion names fields */}
                  {bringingCompanions && companionCount > 0 && (
                    <div className={`p-5 sm:p-6 rounded-2xl border space-y-3 ${isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
                      <span data-typography-role="heading" className={`text-sm sm:text-base font-bold uppercase tracking-wider block ${activeTheme.textPrimaryClass}`}>
                        Nombres de tus Acompañantes
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: companionCount }).map((_, idx) => (
                          <input
                            key={idx}
                            type="text"
                            data-typography-role="body"
                            placeholder={`Acompañante ${idx + 1}`}
                            value={companions[idx] || ''}
                            onChange={(e) => handleCompanionChange(idx, e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:border-amber-600 ${isDark ? 'border-stone-700 bg-stone-800/80 text-stone-100' : 'border-stone-300 bg-stone-50 text-stone-900'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                  )}
                </div>
              )}

              {/* 4. OPTIONAL DETAILS ACCORDION TOGGLE (Restricciones, Canción DJ, Dedicatoria, Teléfono, Correo) */}
              <div className="pt-2">
                <button data-typography-role="button"
                  type="button"
                  onClick={() => setShowExtraDetails(!showExtraDetails)}
                  className={`invitation-card-action inline-flex w-full items-center justify-center gap-2.5 px-5 py-3 text-xs sm:text-sm font-serif font-bold uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] ${
                    isDark
                      ? 'bg-[#C5A059] text-stone-950 hover:bg-[#d8b46d]'
                      : 'bg-[#5A5A40] text-[#FDFCF0] hover:bg-[#484833]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{showExtraDetails ? 'Ocultar detalles opcionales' : 'Añadir detalles opcionales'}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${showExtraDetails ? 'rotate-180' : ''}`} />
                </button>

                {/* Collapsible Content */}
                {showExtraDetails && (
                  <div className={`mt-4 space-y-6 p-5 sm:p-6 rounded-2xl border animate-fadeIn ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    
                    {/* Dietary & DJ Song Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label data-typography-role="detail" className={`text-sm sm:text-base font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                          <Utensils className="w-4 h-4 text-amber-700 shrink-0" />
                          Restricciones Alimentarias (Opcional)
                        </label>
                        <input
                          type="text"
                          data-typography-role="body"
                          placeholder="Ej. Vegetariano, celíaco, alergia..."
                          value={dietary}
                          onChange={(e) => setDietary(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:border-amber-600 ${isDark ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-stone-300 bg-white text-stone-900'}`}
                        />
                      </div>

                      <div>
                        <label data-typography-role="detail" className={`text-sm sm:text-base font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                          <Music className="w-4 h-4 text-amber-700 shrink-0" />
                          Canción para la Fiesta (DJ)
                        </label>
                        <input
                          type="text"
                          data-typography-role="body"
                          placeholder="Ej. Vivir Mi Vida - Marc Anthony"
                          value={song}
                          onChange={(e) => setSong(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:border-amber-600 ${isDark ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-stone-300 bg-white text-stone-900'}`}
                        />
                      </div>
                    </div>

                    {/* Dedication message for couple */}
                    <div>
                      <label data-typography-role="detail" className={`text-sm sm:text-base font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                        <MessageSquare className="w-4 h-4 text-amber-700 shrink-0" />
                        Mensaje o Dedicatoria para los Novios
                      </label>
                      <textarea
                        rows={3}
                        data-typography-role="body"
                        placeholder="Escribe unas palabras de felicitación o buenos deseos..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`w-full p-4 rounded-xl border text-base focus:outline-none focus:border-amber-600 resize-none ${isDark ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-stone-300 bg-white text-stone-900'}`}
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label data-typography-role="detail" className={`text-sm sm:text-base font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                          <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                          Teléfono / WhatsApp
                        </label>
                        <input
                          type="tel"
                          data-typography-role="body"
                          placeholder="Ej. +51 987 654 321"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:border-amber-600 ${isDark ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-stone-300 bg-white text-stone-900'}`}
                        />
                      </div>

                      <div>
                        <label data-typography-role="detail" className={`text-sm sm:text-base font-bold uppercase tracking-wider block mb-1.5 flex items-center gap-1.5 ${activeTheme.textPrimaryClass}`}>
                          <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                          Correo Electrónico (Opcional)
                        </label>
                        <input
                          type="email"
                          data-typography-role="body"
                          placeholder="correo@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:border-amber-600 ${isDark ? 'border-stone-700 bg-stone-900 text-stone-100' : 'border-stone-300 bg-white text-stone-900'}`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button data-typography-role="button"
                  type="submit"
                  disabled={submitting || !fullName.trim()}
                  style={fullName.trim() ? { backgroundColor: rsvpAccentColor, color: rsvpAccentTextColor } : undefined}
                  className={`w-full py-4 sm:py-5 rounded-2xl font-serif font-bold text-base sm:text-lg shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    fullName.trim()
                      ? 'hover:brightness-105'
                      : 'bg-stone-400 text-white hover:bg-stone-400'
                  }`}
                >
                  {submitting ? (
                    <span>Procesando confirmación...</span>
                  ) : (
                    <span>{isEditingSavedResponse ? 'Guardar cambios' : settings.rsvpButtonText?.trim() || 'Confirmar asistencia'}</span>
                  )}
                </button>
              </div>
            </form>
            )
          )}
        </div>
      </div>
    </section>
  );
};
