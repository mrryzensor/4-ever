import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { PhotoComment } from '../types.ts';

interface MobileGalleryCommentTickerProps {
  comments: PhotoComment[];
  photoKey: string | number;
  onOpen: () => void;
}

export function MobileGalleryCommentTicker({ comments, photoKey, onOpen }: MobileGalleryCommentTickerProps) {
  const [startIndex, setStartIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const visibleComments = Array.from(
    { length: Math.min(3, comments.length) },
    (_, index) => comments[(startIndex + index) % comments.length],
  );

  useEffect(() => setStartIndex(0), [photoKey]);

  useEffect(() => {
    if (comments.length <= 3 || reduceMotion) return;
    const interval = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % comments.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [comments.length, photoKey, reduceMotion]);

  if (comments.length === 0) return null;

  return (
    <div className="lg:hidden mb-1 w-[90%] max-w-xl overflow-hidden" aria-label={`${comments.length} comentarios`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${photoKey}:${startIndex}`}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: 'easeOut' }}
          className="space-y-0"
        >
          {visibleComments.map((comment) => {
            const author = comment.guestName || 'Invitado';
            const message = String(comment.message || '').trim();
            return (
              <button
                key={comment.id}
                type="button"
                onClick={onOpen}
                title={`${author}: ${message}`}
                className="flex h-5 w-full min-w-0 items-center gap-1 overflow-hidden px-0 text-left text-[10px] leading-none text-stone-100"
              >
                <span className="max-w-[34%] shrink-0 truncate font-semibold text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">{author}:</span>
                <span className="min-w-0 flex-1 truncate italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">{message}</span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
