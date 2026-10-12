import React, { useEffect, useRef, useState } from 'react';

interface DeferredInvitationSectionProps {
  anchorId?: string;
  minHeight?: string;
  children: React.ReactNode;
}

const DeferredContentFallback: React.FC<{ minHeight: string }> = ({ minHeight }) => (
  <div aria-hidden="true" style={{ minHeight }} />
);

/** Mounts invitation sections close to the viewport so their data requests happen on demand. */
export const DeferredInvitationSection: React.FC<DeferredInvitationSectionProps> = ({
  anchorId,
  minHeight = 'clamp(320px, 55vh, 680px)',
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldRender(true);
      observer.disconnect();
    }, { rootMargin: '850px 0px' });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      id={shouldRender ? undefined : anchorId}
      className="w-full"
      style={shouldRender ? undefined : { minHeight }}
      aria-busy={!shouldRender}
    >
      {shouldRender ? (
        <React.Suspense fallback={<DeferredContentFallback minHeight={minHeight} />}>
          {children}
        </React.Suspense>
      ) : null}
    </div>
  );
};
