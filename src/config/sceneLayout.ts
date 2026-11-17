import { TOTAL_SCENES, sceneIndexOf } from '../context/SceneContext';
import { platformModules } from './modules';
import { siteConfig } from './site';

/**
 * Scroll layout (all lengths in viewport heights).
 *
 *  gaps[i]   — scroll between scene i and scene i+1. A full screen for normal
 *              transitions; short inside the Modules section, where only the
 *              content swaps.
 *  dwell[i]  — extra scroll during which scene i stays pinned (sceneFloat holds
 *              at exactly i) while a separate 0→1 "dwell progress" advances.
 *              Used by Roles to step through its tabs on scroll without
 *              re-numbering any scenes.
 *
 * Everything else works in "scene coordinates" (0 … TOTAL_SCENES-1, fractional
 * between scenes), so changing a length never breaks a transition.
 */

export const ROLES_SCENE = sceneIndexOf('roles');
export const COMPARISON_SCENE = sceneIndexOf('comparison');
/** Pricing gets a dwell sized at runtime to its content overflow (taller-than-screen cards). */
export const PRICING_SCENE = sceneIndexOf('pricing');
export const MODULE_SCENE_OFFSET = sceneIndexOf('mod-branch');
export const MODULE_SCENE_LAST = MODULE_SCENE_OFFSET + platformModules.length - 1;

/** Scroll length (viewports) between two modules. Lower = faster module changes. */
export const MODULE_STEP_SCROLL = 0.3;
/** Scroll length (viewports) per Roles tab. */
export const ROLE_STEP_SCROLL = 0.3;
/** Scroll length (viewports) for the Before/After slider to travel Without → With. */
export const COMPARISON_DWELL_SCROLL = 1;

const gaps: number[] = Array.from({ length: TOTAL_SCENES - 1 }, (_, i) =>
  i >= MODULE_SCENE_OFFSET && i < MODULE_SCENE_LAST ? MODULE_STEP_SCROLL : 1
);

const dwell: number[] = Array.from({ length: TOTAL_SCENES }, (_, i) =>
  i === ROLES_SCENE
    ? siteConfig.roles.length * ROLE_STEP_SCROLL
    : i === COMPARISON_SCENE
      ? COMPARISON_DWELL_SCROLL
      : 0
);

/** Where each scene's dwell starts / ends along the scroll (viewports) */
let starts: number[] = [];
let ends: number[] = [];
let TOTAL_SCROLL_UNITS = 0;

function recompute() {
  starts = [];
  ends = [];
  let u = 0;
  for (let i = 0; i < TOTAL_SCENES; i++) {
    starts.push(u);
    u += dwell[i];
    ends.push(u);
    if (i < gaps.length) u += gaps[i];
  }
  TOTAL_SCROLL_UNITS = ends[ends.length - 1];
}
recompute();

/** Total scrollable length in viewports (changes if a dwell is collapsed) */
export const getTotalScrollUnits = () => TOTAL_SCROLL_UNITS;

/** Height of the scroll track (vh): scrollable range + one viewport of stage */
export const getScrollTrackVh = () => (TOTAL_SCROLL_UNITS + 1) * 100;

/** Dwell extents of scene i in viewports: [start, end, length] */
export const getDwellExtent = (i: number): [number, number, number] => [starts[i], ends[i], dwell[i]];

// ── Runtime layout changes ─────────────────────────────────────────────
// A one-time dwell (Comparison) is removed after it has played, so scrolling
// back through it no longer "holds" on a section where nothing changes.
const listeners = new Set<() => void>();
export const subscribeLayout = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** Set scene i's dwell length (viewports). Callers must shift the scroll position (see useSmoothScroll). */
export function setDwell(i: number, len: number) {
  const next = Math.max(0, len);
  if (Math.abs(dwell[i] - next) < 0.001) return;
  dwell[i] = next;
  recompute();
  listeners.forEach((fn) => fn());
}

/** Remove scene i's dwell. */
export const collapseDwell = (i: number) => setDwell(i, 0);

const clampP = (p: number) => Math.min(1, Math.max(0, p));

/** Page scroll progress (0–1) → fractional scene coordinate */
export function progressToScene(p: number): number {
  const u = clampP(p) * TOTAL_SCROLL_UNITS;
  for (let i = 0; i < TOTAL_SCENES; i++) {
    if (u <= ends[i]) {
      if (u >= starts[i] || i === 0) return i; // dwelling on scene i
      return i - 1 + (u - ends[i - 1]) / gaps[i - 1]; // in the gap before scene i
    }
  }
  return TOTAL_SCENES - 1;
}

/** Fractional scene coordinate → page scroll progress (0–1). Whole numbers land at the start of a dwell. */
export function sceneToProgress(s: number): number {
  const c = Math.min(TOTAL_SCENES - 1, Math.max(0, s));
  const i = Math.floor(c);
  const frac = c - i;
  if (frac === 0 || i >= gaps.length) return starts[i] / TOTAL_SCROLL_UNITS;
  return (ends[i] + frac * gaps[i]) / TOTAL_SCROLL_UNITS;
}

/** 0→1 progress through scene i's dwell (0 before it, 1 after it). */
export function dwellProgress(p: number, i: number): number {
  if (!dwell[i]) return 0;
  const u = clampP(p) * TOTAL_SCROLL_UNITS;
  return Math.min(1, Math.max(0, (u - starts[i]) / dwell[i]));
}

/** Page progress for a point inside scene i's dwell (t = 0…1). */
export function dwellToProgress(i: number, t: number): number {
  return (starts[i] + Math.min(1, Math.max(0, t)) * dwell[i]) / TOTAL_SCROLL_UNITS;
}
