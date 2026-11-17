'use client';

import { RefObject, useEffect } from 'react';
import { MotionValue } from 'framer-motion';
import type { FxValues } from '../utils/scrollFx';

/**
 * Scroll-scrubbed element choreography for one scene (bol7-style).
 *
 * Every element's motion is a pure function of the scene's local scroll
 * progress, so it is perfectly in sync with the (Lenis-smoothed) scroll and
 * reverses exactly when scrolling back up.
 *
 * Elements animated:
 *  1. Auto blocks — the scene's main content blocks, staggered top → bottom
 *     (skipped when the scene root has `data-scroll-manual`).
 *     A block with `data-scroll-stagger` is replaced by its children.
 *  2. Explicit — anything carrying `scrollFx()` attributes.
 *
 * Motion is written to the individual `translate` / `scale` / `rotate`
 * properties, which compose with (not override) existing CSS transforms and
 * keyframe animations such as the floating chips.
 */

interface Item {
  el: HTMLElement;
  enter?: FxValues;
  enterRange: [number, number];
  exit?: FxValues;
  exitRange: [number, number];
  last: string;
}

const AUTO_ENTER: FxValues = { y: 80, o: 0, s: 0.96 };
const AUTO_EXIT: FxValues = { y: -60, o: 0, s: 0.98 };
const SKIP_TAGS = new Set(['STYLE', 'SCRIPT', 'TEMPLATE', 'svg']);

const parseVals = (s: string | null): FxValues | undefined => {
  if (!s) return undefined;
  const out: Record<string, number | string> = {};
  s.split(',').forEach((pair) => {
    const [k, v] = pair.split(':');
    if (!k || v === undefined) return;
    out[k.trim()] = /[a-z%]$/i.test(v.trim()) ? v.trim() : parseFloat(v);
  });
  return out as FxValues;
};

const parseRange = (s: string | null, fallback: [number, number]): [number, number] => {
  if (!s) return fallback;
  const [a, b] = s.split(',').map(parseFloat);
  return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : fallback;
};

const toPx = (v: number | string | undefined) => {
  if (v === undefined) return 0;
  if (typeof v === 'number') return v;
  const n = parseFloat(v);
  if (v.endsWith('vw')) return (n / 100) * window.innerWidth;
  if (v.endsWith('vh')) return (n / 100) * window.innerHeight;
  return n;
};

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
// Smooth start + smooth landing for scrubbed motion
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const isRendered = (el: Element) =>
  !SKIP_TAGS.has(el.tagName) && getComputedStyle(el).display !== 'none';

const kids = (el: Element) => (Array.from(el.children) as HTMLElement[]).filter(isRendered);

function collectAutoBlocks(root: HTMLElement): HTMLElement[] {
  let blocks = kids(root);
  // A scene that is just one or two wrappers (e.g. a two-column grid) → go one level deeper
  if (blocks.length <= 2) blocks = blocks.flatMap((b) => (kids(b).length > 1 ? kids(b) : [b]));
  // Stagger containers (card grids) → animate each child. A block that merely
  // *contains* a stagger container is split so the container's cards are reached.
  const expand = (b: HTMLElement): HTMLElement[] => {
    if (b.hasAttribute('data-scroll-stagger')) return kids(b);
    if (b.querySelector('[data-scroll-stagger]')) return kids(b).flatMap(expand);
    return [b];
  };
  return blocks.flatMap(expand);
}

export function useSceneScrub(
  innerRef: RefObject<HTMLElement | null>,
  local: MotionValue<number>,
  opts: { reduceMotion: boolean }
) {
  useEffect(() => {
    const inner = innerRef.current;
    const root = inner?.firstElementChild as HTMLElement | null;
    if (!inner || !root) return;

    const items: Item[] = [];
    const explicitEls = Array.from(
      root.querySelectorAll<HTMLElement>('[data-scroll-enter], [data-scroll-exit]')
    );
    const explicitSet = new Set(explicitEls);

    // 1. Auto blocks (staggered)
    if (!root.hasAttribute('data-scroll-manual')) {
      const blocks = collectAutoBlocks(root).filter((b) => !explicitSet.has(b));
      const n = blocks.length;
      const step = Math.min(0.08, 0.32 / Math.max(1, n - 1));
      blocks.forEach((el, i) => {
        const a = -0.92 + i * step;
        const e = 0.06 + i * step * 0.6;
        items.push({
          el,
          enter: AUTO_ENTER,
          enterRange: [a, Math.min(0, a + 0.6)],
          exit: AUTO_EXIT,
          exitRange: [e, e + 0.6],
          last: '',
        });
      });
    }

    // 2. Explicit choreography
    explicitEls.forEach((el) => {
      items.push({
        el,
        enter: parseVals(el.getAttribute('data-scroll-enter')),
        enterRange: parseRange(el.getAttribute('data-scroll-enter-range'), [-0.85, -0.1]),
        exit: parseVals(el.getAttribute('data-scroll-exit')),
        exitRange: parseRange(el.getAttribute('data-scroll-exit-range'), [0.1, 0.85]),
        last: '',
      });
    });

    const reduce = opts.reduceMotion;

    // Note: deliberately no will-change toggling — measured: promoting/releasing
    // layers at scene boundaries caused more dropped frames than it saved.
    const apply = (v: number) => {
      // Fully off-screen scenes are visibility:hidden — skip the work
      if (v <= -1.15 || v >= 1.15) return;

      for (const it of items) {
        let t = 0;
        let target: FxValues | undefined;
        if (v < 0 && it.enter) {
          const [a, b] = it.enterRange;
          t = 1 - clamp01((v - a) / (b - a));
          target = it.enter;
        } else if (v > 0 && it.exit) {
          const [a, b] = it.exitRange;
          t = clamp01((v - a) / (b - a));
          target = it.exit;
        }
        t = easeInOutSine(t);

        let x = 0, y = 0, s = 1, r = 0, o = 1;
        if (target && t > 0) {
          if (!reduce) {
            x = toPx(target.x) * t;
            y = toPx(target.y) * t;
            s = 1 + ((target.s ?? 1) - 1) * t;
            r = (target.r ?? 0) * t;
          }
          o = 1 + ((target.o ?? 1) - 1) * t;
        }

        const key = `${x.toFixed(1)}|${y.toFixed(1)}|${s.toFixed(4)}|${r.toFixed(2)}|${o.toFixed(3)}`;
        if (key === it.last) continue;
        it.last = key;

        const st = it.el.style;
        st.translate = x || y ? `${x.toFixed(1)}px ${y.toFixed(1)}px` : '';
        st.scale = s !== 1 ? s.toFixed(4) : '';
        st.rotate = r ? `${r.toFixed(2)}deg` : '';
        st.opacity = o < 1 ? o.toFixed(3) : '';
      }
    };

    apply(local.get());
    const unsub = local.on('change', apply);
    const onResize = () => {
      items.forEach((it) => (it.last = ''));
      apply(local.get());
    };
    window.addEventListener('resize', onResize);

    return () => {
      unsub();
      window.removeEventListener('resize', onResize);
      items.forEach(({ el }) => {
        el.style.translate = '';
        el.style.scale = '';
        el.style.rotate = '';
        el.style.opacity = '';
      });
    };
  }, [innerRef, local, opts.reduceMotion]);
}
