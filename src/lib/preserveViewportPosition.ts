let cancelCurrentAdjustment: (() => void) | null = null;

/**
 * Keeps the top of an accordion card in the same viewport position while its
 * height (and the height of a previously open card) animates.
 */
export const preserveViewportPosition = (trigger: HTMLElement | null | undefined, durationMs = 650) => {
  if (typeof window === 'undefined' || !trigger) return;

  cancelCurrentAdjustment?.();

  const anchor = (trigger.closest('.select-none.group.relative') as HTMLElement | null) || trigger;
  const initialTop = anchor.getBoundingClientRect().top;
  const startedAt = performance.now();
  let frameId = 0;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    cancelAnimationFrame(frameId);
    if (cancelCurrentAdjustment === cancel) cancelCurrentAdjustment = null;
    window.removeEventListener('wheel', cancel);
    window.removeEventListener('touchstart', cancel);
    window.removeEventListener('keydown', cancel);
  };

  cancelCurrentAdjustment = cancel;
  const maintainPosition = (now: number) => {
    if (cancelled || !anchor.isConnected) {
      cancel();
      return;
    }

    const offset = anchor.getBoundingClientRect().top - initialTop;
    if (Math.abs(offset) > 0.5) window.scrollBy(0, offset);

    if (now - startedAt < durationMs) {
      frameId = requestAnimationFrame(maintainPosition);
    } else {
      cancel();
    }
  };

  window.addEventListener('wheel', cancel, { passive: true, once: true });
  window.addEventListener('touchstart', cancel, { passive: true, once: true });
  window.addEventListener('keydown', cancel, { once: true });
  frameId = requestAnimationFrame(maintainPosition);
};
