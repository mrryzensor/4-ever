import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Heart, Sparkles, User } from 'lucide-react';
import { GuestWish } from '../types.ts';
import { AnimatedQuillPen, StyleSpecificDivider } from './AnimatedSvgs.tsx';
import { CARD_THEMES } from '../lib/themes.ts';
import { toast } from '../lib/toast.ts';

interface GuestbookSectionProps {
  weddingId?: number;
  defaultAuthor?: string;
  cardStyle?: string;
}

export const GuestbookSection: React.FC<GuestbookSectionProps> = ({
  weddingId = 1,
  defaultAuthor = '',
  cardStyle = 'classic-gold',
}) => {
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState(defaultAuthor);
  const [relationship, setRelationship] = useState('Amigo(a) / Familiar');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (defaultAuthor) {
      setAuthorName(defaultAuthor);
    }
  }, [defaultAuthor]);

  const fetchWishes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/wishes?weddingId=${weddingId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setWishes(data);
      }
    } catch (err) {
      console.error('Error loading guestbook wishes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !authorName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weddingId,
          guestName: authorName.trim(),
          relationship: relationship.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) throw new Error('Error al enviar dedicatoria');
      const newWish = await res.json();
      setWishes((prev) => [newWish, ...prev]);
      setMessage('');
      setSuccess(true);
      toast.success('¡Tu mensaje de cariño ha sido publicado!', 'Mensaje Enviado');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar mensaje', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const isDark = cardStyle === 'dark-luxury';
  const activeTheme = CARD_THEMES[cardStyle as keyof typeof CARD_THEMES] || CARD_THEMES['classic-gold'];

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="libro-firmas">
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-xs ${
          isDark
            ? 'bg-[#C5A059]/15 text-[#C5A059] border-[#5A5A40]/60'
            : 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#E5E2D0]'
        }`}>
          <AnimatedQuillPen className="w-10 h-10" />
        </div>
        <span className={`text-xs uppercase tracking-[0.3em] font-semibold block mb-2 ${
          isDark ? 'text-[#C5A059]' : 'text-[#7D8C7A]'
        }`}>
          Mensajes de Cariño
        </span>
        <h2 className={`text-3xl sm:text-5xl font-serif font-normal ${
          isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
        }`}>
          Libro de Firmas Virtual
        </h2>
        <StyleSpecificDivider
          cardStyle={cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={activeTheme?.accentColorHex}
        />
        <p className={`text-sm max-w-xl mx-auto mt-1 leading-relaxed font-serif italic ${
          isDark ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Déjanos tus mejores deseos y bendiciones para esta nueva aventura que comenzamos juntos.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to leave wish */}
        <div className={`lg:col-span-1 backdrop-blur-sm rounded-3xl p-8 border shadow-sm h-fit ${
          isDark
            ? 'bg-[#282B25]/95 border-[#5A5A40]/60 text-[#FDFCF0]'
            : 'bg-white/90 border-[#E5E2D0] text-[#3D3D2C]'
        }`}>
          <h3 className={`text-xl font-serif font-bold mb-1 flex items-center gap-2 ${
            isDark ? 'text-[#FDFCF0]' : 'text-[#3D3D2C]'
          }`}>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <span>Escribir Felicitación</span>
          </h3>
          <p className={`text-xs mb-6 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Tu mensaje aparecerá en el muro de dedicatorias.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-stone-200' : 'text-[#3D3D2C]'}`}>
                Tu Nombre:
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ej. Tía Laura o Familia Torres"
                className={`w-full rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#1F211D] border-[#5A5A40] text-[#FDFCF0] placeholder:text-stone-500 focus:border-[#C5A059]'
                    : 'bg-[#FAF9F0] border-[#E5E2D0] text-[#3D3D2C] focus:border-[#5A5A40]'
                }`}
                required
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-stone-200' : 'text-[#3D3D2C]'}`}>
                Parentesco / Relación:
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Ej. Amiga de la novia, Primo..."
                className={`w-full rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none transition-colors border ${
                  isDark
                    ? 'bg-[#1F211D] border-[#5A5A40] text-[#FDFCF0] placeholder:text-stone-500 focus:border-[#C5A059]'
                    : 'bg-[#FAF9F0] border-[#E5E2D0] text-[#3D3D2C] focus:border-[#5A5A40]'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-stone-200' : 'text-[#3D3D2C]'}`}>
                Mensaje o Deseo:
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tus bendiciones para los novios..."
                className={`w-full rounded-2xl p-3 text-xs sm:text-sm focus:outline-none transition-colors resize-none border ${
                  isDark
                    ? 'bg-[#1F211D] border-[#5A5A40] text-[#FDFCF0] placeholder:text-stone-500 focus:border-[#C5A059]'
                    : 'bg-[#FAF9F0] border-[#E5E2D0] text-[#3D3D2C] focus:border-[#5A5A40]'
                }`}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !message.trim() || !authorName.trim()}
              className={`w-full py-3.5 rounded-full font-serif font-semibold text-xs sm:text-sm shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 ${
                isDark
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 font-bold'
                  : 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-amber-50'
              }`}
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>{submitting ? 'Publicando...' : 'Publicar Dedicatoria'}</span>
            </button>

            {success && (
              <p className="text-emerald-400 text-xs text-center font-medium">
                ¡Gracias por tus hermosas palabras! 💕
              </p>
            )}
          </form>
        </div>

        {/* Wishes List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className={`py-12 text-center text-sm ${isDark ? 'text-stone-400' : 'text-stone-400'}`}>
              Cargando dedicatorias...
            </div>
          ) : wishes.length === 0 ? (
            <div className={`py-12 text-center rounded-3xl border border-dashed p-6 ${
              isDark
                ? 'bg-[#282B25]/60 border-[#5A5A40]/60 text-stone-300'
                : 'bg-white/60 border-stone-300 text-stone-500'
            }`}>
              <Sparkles className="w-8 h-8 text-amber-500/70 mx-auto mb-2 shrink-0" />
              <p className={`text-xs ${isDark ? 'text-stone-300' : 'text-stone-500'}`}>
                Aún no hay dedicatorias. ¡Sé el primero en firmar el libro!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {wishes.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDark
                      ? item.isHighlighted
                        ? 'bg-[#333830] border-[#C5A059]/60 shadow-lg text-stone-100'
                        : 'bg-[#282B25] border-[#5A5A40]/50 shadow-sm text-stone-200'
                      : item.isHighlighted
                        ? 'bg-amber-50/70 border-amber-300/80 shadow-md text-stone-800'
                        : 'bg-white border-stone-200 shadow-sm text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className={`w-9 h-9 rounded-full aspect-square shrink-0 circle-avatar flex items-center justify-center font-bold text-xs font-serif ${
                      isDark ? 'bg-[#C5A059]/20 text-[#C5A059]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={`text-sm font-serif font-bold leading-tight ${isDark ? 'text-[#FDFCF0]' : 'text-stone-900'}`}>
                        {item.guestName}
                      </h4>
                      <span className={`text-[10px] font-medium ${isDark ? 'text-[#C5A059]' : 'text-amber-800/80'}`}>
                        {item.relationship || 'Invitado Especial'}
                      </span>
                    </div>
                  </div>

                  <p className={`text-xs leading-relaxed italic font-serif ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    "{item.message}"
                  </p>

                  <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] ${
                    isDark ? 'border-[#5A5A40]/40 text-stone-400' : 'border-stone-100 text-stone-400'
                  }`}>
                    <span>{new Date(item.createdAt).toLocaleDateString('es-ES')}</span>
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
