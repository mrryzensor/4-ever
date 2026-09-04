import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, HelpCircle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  let icon = <Trash2 className="w-6 h-6 text-rose-600 shrink-0" />;
  let iconBg = 'bg-rose-100 border-rose-200';
  let confirmBtnBg = 'bg-rose-600 hover:bg-rose-700 text-white';

  if (variant === 'warning') {
    icon = <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />;
    iconBg = 'bg-amber-100 border-amber-200';
    confirmBtnBg = 'bg-amber-600 hover:bg-amber-700 text-white';
  } else if (variant === 'info') {
    icon = <HelpCircle className="w-6 h-6 text-sky-600 shrink-0" />;
    iconBg = 'bg-sky-100 border-sky-200';
    confirmBtnBg = 'bg-[#5A5A40] hover:bg-[#484833] text-white';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white border border-[#E5E2D0] rounded-3xl shadow-2xl p-6 sm:p-7 text-stone-800 my-8"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${iconBg}`}>
              {icon}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-full border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 ${confirmBtnBg} ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
