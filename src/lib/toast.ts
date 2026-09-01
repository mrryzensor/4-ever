export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

type ToastListener = (toast: ToastItem) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  success: (message: string, title?: string, duration = 3500) => {
    emitToast({ id: Math.random().toString(36).substring(2, 9), message, title, type: 'success', duration });
  },
  error: (message: string, title?: string, duration = 4500) => {
    emitToast({ id: Math.random().toString(36).substring(2, 9), message, title, type: 'error', duration });
  },
  info: (message: string, title?: string, duration = 3500) => {
    emitToast({ id: Math.random().toString(36).substring(2, 9), message, title, type: 'info', duration });
  },
  warning: (message: string, title?: string, duration = 4000) => {
    emitToast({ id: Math.random().toString(36).substring(2, 9), message, title, type: 'warning', duration });
  },
};

function emitToast(toastItem: ToastItem) {
  listeners.forEach((listener) => {
    try {
      listener(toastItem);
    } catch (e) {
      console.error('Toast listener error:', e);
    }
  });
}

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
