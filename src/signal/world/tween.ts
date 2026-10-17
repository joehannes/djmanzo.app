/**
 * A tween: `step(k)` with k from 0 to 1 over `ms`, one call per frame,
 * resolving when it is done. The engine's moves are a handful of these.
 */

export function tween(ms: number, step: (k: number) => void): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      step(k);
      if (k < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}

export const easeIn = (k: number) => k * k * k;
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
