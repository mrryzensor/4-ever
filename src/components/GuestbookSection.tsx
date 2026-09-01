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

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 bg-transparent" id="libro-firmas">
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
        <div className="w-14 h-14 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center mx-auto mb-3 border border-[#E5E2D0]">
          <AnimatedQuillPen className="w-10 h-10" />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#7D8C7A] block mb-2">
          Mensajes de Cariño
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-[#3D3D2C] font-normal">
          Libro de Firmas Virtual
        </h2>
        <StyleSpecificDivider
          cardStyle={cardStyle}
          className="w-48 sm:w-60 h-8 mx-auto mt-2"
          color={CARD_THEMES[cardStyle]?.accentColorHex}
        />
        <p className="text-sm text-stone-600 max-w-xl mx-auto mt-1">
          Déjanos tus mejores deseos y bendiciones para esta nueva aventura que comenzamos juntos.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form to leave wish */}
        <div className="lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-[#E5E2D0] shadow-sm h-fit">
          <h3 className="text-xl font-serif font-bold text-[#3D3D2C] mb-1 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <span>Escribir Felicitación</span>
          </h3>
          <p className="text-xs text-stone-500 mb-6">
            Tu mensaje aparecerá en el muro de dedicatorias.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#3D3D2C] block mb-1">
                Tu Nombre:
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ej. Tía Laura o Familia Torres"
                className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#3D3D2C] focus:outline-none focus:border-[#5A5A40]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D3D2C] block mb-1">
                Parentesco / Relación:
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Ej. Amiga de la novia, Primo..."
                className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#3D3D2C] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D3D2C] block mb-1">
                Mensaje o Deseo:
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tus bendiciones para los novios..."
                className="w-full bg-[#FAF9F0] border border-[#E5E2D0] rounded-2xl p-3 text-xs sm:text-sm text-[#3D3D2C] focus:outline-none focus:border-[#5A5A40] resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !message.trim() || !authorName.trim()}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-amber-50 font-serif font-semibold text-xs sm:text-sm shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer hover:brightness-110"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>{submitting ? 'Publicando...' : 'Publicar Dedicatoria'}</span>
            </button>

            {success && (
              <p className="text-emerald-700 text-xs text-center font-medium">
                ¡Gracias por tus hermosas palabras! 💕
              </p>
            )}
          </form>
        </div>

        {/* Wishes List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              Cargando dedicatorias...
            </div>
          ) : wishes.length === 0 ? (
            <div className="py-12 text-center bg-white/60 rounded-3xl border border-dashed border-stone-300 p-6">
              <Sparkles className="w-8 h-8 text-amber-600/60 mx-auto mb-2 shrink-0" />
              <p className="text-xs text-stone-500">
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
                    item.isHighlighted
                      ? 'bg-amber-50/70 border-amber-300/80 shadow-md'
                      : 'bg-white border-stone-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-full aspect-square shrink-0 circle-avatar bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs font-serif">
                      {item.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-stone-900 leading-tight">
                        {item.guestName}
                      </h4>
                      <span className="text-[10px] text-amber-800/80 font-medium">
                        {item.relationship || 'Invitado Especial'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed italic font-serif">
                    "{item.message}"
                  </p>

                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400">
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
