import React, { useLayoutEffect, useRef, useState } from 'react';
import { WeddingSettings } from '../types.ts';
import { StyleSpecificDivider } from './AnimatedSvgs.tsx';

type Separator = {
  id: string;
  left: number;
  top: number;
  orientation: 'horizontal' | 'vertical';
};

interface CardGroupDecorationsProps {
  children: React.ReactNode;
  className: string;
  settings: WeddingSettings;
  accentColor: string;
}

/** Adds theme-matched SVG dividers between the visible cards in a responsive card group. */
export const CardGroupDecorations: React.FC<CardGroupDecorationsProps> = ({
  children,
  className,
  settings,
  accentColor,
}) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const [separators, setSeparators] = useState<Separator[]>([]);
  const enabled = settings.showCardDividers === true;

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || !enabled) {
      setSeparators([]);
      return;
    }

    const measure = () => {
      const groupRect = group.getBoundingClientRect();
      const visibleChildren = Array.from(group.children)
        .filter((child): child is HTMLElement => child instanceof HTMLElement)
        .filter((child) => {
          if (child.hasAttribute('data-card-divider-layer')) return false;
          const rect = child.getBoundingClientRect();
          return getComputedStyle(child).display !== 'none' && rect.width > 0 && rect.height > 0;
        })
        .map((element) => ({
          rect: element.getBoundingClientRect(),
          isCard: element.hasAttribute('data-invitation-card'),
        }))
        .sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);

      const next: Separator[] = [];
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;

      if (!isDesktop) {
        for (let index = 1; index < visibleChildren.length; index += 1) {
          const previous = visibleChildren[index - 1];
          const current = visibleChildren[index];
          if (!previous.isCard || !current.isCard) continue;
          next.push({
            id: `${index}-mobile`,
            left: group.clientWidth / 2,
            top: ((previous.rect.bottom + current.rect.top) / 2) - groupRect.top,
            orientation: 'horizontal',
          });
        }
      } else {
        const groupedRows: (typeof visibleChildren)[] = [];
        for (const child of visibleChildren) {
          let row = groupedRows.find((candidate) => Math.abs(candidate[0].rect.top - child.rect.top) <= 32);
          if (!row) {
            row = [];
            groupedRows.push(row);
          }
          row.push(child);
        }

        groupedRows.forEach((row, rowIndex) => {
          row.sort((a, b) => a.rect.left - b.rect.left);
          for (let index = 1; index < row.length; index += 1) {
            const previous = row[index - 1];
            const current = row[index];
            if (!previous.isCard || !current.isCard) continue;
            next.push({
              id: `${rowIndex}-${index}-desktop`,
              left: ((previous.rect.right + current.rect.left) / 2) - groupRect.left,
              top: ((Math.max(previous.rect.top, current.rect.top)
                + Math.min(previous.rect.bottom, current.rect.bottom)) / 2) - groupRect.top,
              orientation: 'vertical',
            });
          }
        });
      }

      setSeparators((current) => {
        if (current.length === next.length && current.every((item, index) => {
          const candidate = next[index];
          return item.id === candidate.id && item.orientation === candidate.orientation
            && Math.abs(item.left - candidate.left) < 0.5 && Math.abs(item.top - candidate.top) < 0.5;
        })) return current;
        return next;
      });
    };

    measure();
    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(group);
    Array.from(group.children).forEach((child) => resizeObserver?.observe(child));
    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        Array.from(group.children).forEach((child) => mutationObserver?.observe(child, { attributes: true }));
        measure();
      });
    }
    mutationObserver?.observe(group, { childList: true });
    Array.from(group.children).forEach((child) => mutationObserver?.observe(child, { attributes: true }));
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [enabled]);

  const dividerStyle = settings.dividerStyle && settings.dividerStyle !== 'auto'
    ? settings.dividerStyle
    : settings.cardStyle;

  return (
    <div ref={groupRef} className={`${className} relative`}>
      {children}
      {enabled && separators.length > 0 && (
        <div data-card-divider-layer="true" className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
          {separators.map((separator) => (
            <div
              key={separator.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
              style={{ left: separator.left, top: separator.top }}
            >
              <StyleSpecificDivider
                cardStyle={dividerStyle}
                className={separator.orientation === 'horizontal' ? 'h-6 w-40' : 'h-6 w-24 rotate-90 vertical-divider'}
                color={accentColor}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
