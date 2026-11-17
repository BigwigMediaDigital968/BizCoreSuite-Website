/**
 * Declarative scroll choreography for elements inside a scene.
 *
 * A scene's local progress runs -1 → 0 → +1:
 *   -1 = scene still below (entering), 0 = scene centred, +1 = scene gone above (exiting).
 *
 * `enter` = the element's offset when the scene is entering (it eases to rest by `enterRange[1]`).
 * `exit`  = the element's offset when the scene has left (it starts leaving at `exitRange[0]`).
 *
 * Values: x / y in px (or strings like '-22vw', '10vh'), s = scale, r = rotate (deg), o = opacity.
 *
 *   <div {...scrollFx({ exit: { x: -90, o: 0 }, exitRange: [0, 0.5] })} />
 */
export interface FxValues {
  x?: number | string;
  y?: number | string;
  s?: number;
  r?: number;
  o?: number;
}

export interface FxOptions {
  enter?: FxValues;
  enterRange?: [number, number];
  exit?: FxValues;
  exitRange?: [number, number];
}

const encode = (v: FxValues) =>
  Object.entries(v)
    .filter(([, val]) => val !== undefined)
    .map(([k, val]) => `${k}:${val}`)
    .join(',');

export function scrollFx(opts: FxOptions): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (opts.enter) attrs['data-scroll-enter'] = encode(opts.enter);
  if (opts.enterRange) attrs['data-scroll-enter-range'] = opts.enterRange.join(',');
  if (opts.exit) attrs['data-scroll-exit'] = encode(opts.exit);
  if (opts.exitRange) attrs['data-scroll-exit-range'] = opts.exitRange.join(',');
  return attrs;
}
