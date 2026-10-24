/**
 * How much to paint: the share of the screen's pixels the painter works at.
 *
 * Decided once from what the browser says it is running on — a software
 * renderer (SwiftShader, llvmpipe) or a phone starts low — and then by
 * watching the frames: if they stay slow for two seconds the painter drops
 * a step, and it never climbs back mid-visit, so the picture does not
 * pump. No benchmark is fetched from anywhere.
 */

import type * as THREE from "three";

export type Tier = "high" | "medium" | "low";
const SCALE: Record<Tier, number> = { high: 1, medium: 0.7, low: 0.45 };

export function guessTier(renderer: THREE.WebGLRenderer): Tier {
  const gl = renderer.getContext();
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).toLowerCase();
  if (/swiftshader|llvmpipe|software|mesa offscreen/.test(name)) return "low";
  const touch = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  if (touch || cores <= 4) return "medium";
  return "high";
}

export class Quality {
  tier: Tier;
  private slowSince = 0;
  private last = 0;
  private avg = 16;

  constructor(renderer: THREE.WebGLRenderer, tier?: Tier) {
    this.tier = tier ?? guessTier(renderer);
  }

  get scale(): number {
    return SCALE[this.tier];
  }

  /** Called every frame; true when the tier just dropped and the canvas must be resized. */
  tick(now: number): boolean {
    if (this.last) this.avg = this.avg * 0.92 + Math.min(200, now - this.last) * 0.08;
    this.last = now;
    if (this.avg < 40) {
      this.slowSince = 0;
      return false;
    }
    if (!this.slowSince) this.slowSince = now;
    if (now - this.slowSince < 2000 || this.tier === "low") return false;
    this.tier = this.tier === "high" ? "medium" : "low";
    this.slowSince = 0;
    return true;
  }
}
