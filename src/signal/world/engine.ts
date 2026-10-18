/**
 * The world: one canvas, two scenes — the map and a stage — and the moves
 * between them.
 *
 * - **The map** is the signal's landscape on one plane, seen at a tilt; a
 *   pulse of light runs along the signal's line, and a stage under the
 *   pointer lights up.
 * - **A stage** is its layers (`textures.ts`), each cut into pieces like a
 *   puzzle. Entering, the camera dives along the cable to the stage on the
 *   map while the brush grows; then the pieces fly in and lock, and the
 *   brush shrinks until the painting resolves. Leaving does it backwards.
 *
 * With reduced motion, nothing flies: the scene fades through the night
 * colour and the painting is simply there.
 */

import * as THREE from "three";
import type { StageId, StyleTokens } from "../../style/genome/types";
import { Painter, type Flow } from "./painter";
import { MAP_H, MAP_SPOTS, MAP_W, mapCanvas, stageLayers } from "./textures";
import { tween, easeInOut, easeOut, easeIn } from "./tween";
import { Quality, type Tier } from "./quality";
import type { Sky } from "../../../shared/sense";

const MAP_WORLD_W = 30;
const MAP_WORLD_H = MAP_WORLD_W * (MAP_H / MAP_W);
const STAGE_FOV = 45;
const STAGE_CAM_Z = 10;
const PIECES: [number, number] = [5, 3];
/** The brush while travelling: big enough that the world dissolves into strokes. */
const TRAVEL_RADIUS = 18;

/** The visitor's night, where they shared it (`sense/senses.svelte.ts`). */
export interface Night {
  /** 0 night … 1 day. */
  daylight: number;
  sky: Sky | null;
}

/** What a sky does to the painting: rain, snow and fog, 0–1 each. */
export function weatherOf(sky: Sky | null): [number, number, number] {
  switch (sky) {
    case "rain":
      return [1, 0, 0.25];
    case "thunder":
      return [1, 0, 0.35];
    case "snow":
      return [0, 1, 0.3];
    case "fog":
      return [0, 0, 1];
    case "cloudy":
      return [0, 0, 0.3];
    default:
      return [0, 0, 0];
  }
}

/** The hour's light as a tint: a cool night, a warm dawn and dusk, a plain day. */
export function tintOf(daylight: number): [number, number, number] {
  const d = Math.max(0, Math.min(1, daylight));
  const warmth = Math.max(0, 1 - Math.abs(d - 0.5) * 2);
  const cool: [number, number, number] = [0.94, 0.97, 1.05];
  const day: [number, number, number] = [1.04, 1.03, 1.0];
  const warm: [number, number, number] = [1.1, 0.99, 0.86];
  return [0, 1, 2].map((i) => {
    const base = cool[i] + (day[i] - cool[i]) * d;
    return base + (warm[i] - base) * warmth * 0.8;
  }) as [number, number, number];
}

export interface EngineEvents {
  pick?: (stage: StageId) => void;
  hover?: (stage: StageId | null) => void;
}

interface Piece {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  home: THREE.Vector3;
  away: THREE.Vector3;
  turn: number;
  delay: number;
  /** How far it has assembled, as opacity. */
  alpha: number;
  role?: "a" | "b" | "glow";
}

/** What the stage's play does to a layer, for a play value from 0 to 1. */
function roleOpacity(role: Piece["role"], k: number): number {
  if (role === "a") return Math.min(1, 2 * (1 - k));
  if (role === "b") return Math.min(1, 2 * k);
  if (role === "glow") return k;
  return 1;
}

/** A colour taken most of the way down to the night: the ramp's second stop. */
function deepen(hex: string, night: string): string {
  return "#" + new THREE.Color(hex).lerp(new THREE.Color(night), 0.62).getHexString();
}

function nodeWorld(id: StageId): THREE.Vector3 {
  const [fx, fy] = MAP_SPOTS[id];
  return new THREE.Vector3((fx - 0.5) * MAP_WORLD_W, (0.5 - fy) * MAP_WORLD_H, 0);
}

export class Engine {
  readonly quality: Quality;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly painter: Painter;
  private readonly mapScene = new THREE.Scene();
  private readonly mapCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  private readonly mapPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly backdrop: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly pulse: THREE.Mesh;
  private readonly marker: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  private readonly path: THREE.CatmullRomCurve3;
  private readonly stageScene = new THREE.Scene();
  private readonly stageCamera = new THREE.PerspectiveCamera(STAGE_FOV, 1, 0.1, 100);
  private pieces: Piece[] = [];
  /** The stage's play: where the visitor has leant, eased towards where they are leaning. */
  private playValue = 0.5;
  private playTarget = 0.5;
  private style: StyleTokens | null = null;
  /** The night's own light: a little more in the day, a little less at night. Never a flash (WEBSITE-ART.md). */
  private light = 1;
  private order: StageId[];
  private mode: "map" | "stage" = "map";
  private stage: StageId | null = null;
  private hovered: StageId | null = null;
  /** Where the map camera looks, and how far up it is. */
  private look = new THREE.Vector3(0, 0, 0);
  private height = 18;
  private pointer = new THREE.Vector2(0, 0);
  private drag: { x: number; lookX: number; moved: boolean } | null = null;
  private raf = 0;
  private start = performance.now();
  private width = 1;
  private heightPx = 1;
  private busy = false;
  private readonly ray = new THREE.Raycaster();
  private readonly reduced: boolean;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    order: StageId[],
    private readonly events: EngineEvents = {},
    opts: { reducedMotion?: boolean; tier?: Tier } = {},
  ) {
    // The palette's hex is the colour on screen: no colour management anywhere.
    THREE.ColorManagement.enabled = false;
    this.order = order;
    this.reduced = !!opts.reducedMotion;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.quality = new Quality(this.renderer, opts.tier);
    this.painter = new Painter(2, 2);

    this.mapPlane = new THREE.Mesh(new THREE.PlaneGeometry(MAP_WORLD_W, MAP_WORLD_H), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    this.mapScene.add(this.mapPlane);
    // The night goes on past the map's edges.
    this.backdrop = new THREE.Mesh(new THREE.PlaneGeometry(MAP_WORLD_W * 4, MAP_WORLD_H * 6), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    this.backdrop.position.z = -0.05;
    this.mapScene.add(this.backdrop);
    this.path = new THREE.CatmullRomCurve3(order.map((id) => nodeWorld(id).setZ(0.05)), false, "centripetal");
    this.pulse = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    this.mapScene.add(this.pulse);
    this.marker = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }));
    this.mapScene.add(this.marker);

    this.stageCamera.position.set(0, 0, STAGE_CAM_Z);
    this.resize();
    this.bind();
    this.loop();
  }

  // --- Style ---------------------------------------------------------------------

  setStyle(style: StyleTokens): void {
    this.style = style;
    const tex = new THREE.CanvasTexture(mapCanvas(style, this.order));
    tex.anisotropy = 4;
    this.mapPlane.material.map?.dispose();
    this.mapPlane.material.map = tex;
    this.mapPlane.material.needsUpdate = true;
    (this.pulse.material as THREE.MeshBasicMaterial).color.set(style.palette.ink);
    this.backdrop.material.color.set(style.palette.night);
    this.marker.material.color.set(style.palette.glow);
    this.painter.setStyle({
      flow: style.brush.flow as Flow,
      grain: style.brush.grain,
      ramp: [style.palette.night, deepen(style.palette.accents[1] ?? style.palette.accents[0], style.palette.night), style.palette.glow, style.palette.ink],
      rampMix: 0.28,
    });
    this.painter.radius = this.mode === "map" ? style.brush.radius * 1.3 : style.brush.radius;
    if (this.mode === "stage" && this.stage) this.buildStage(this.stage, true);
  }

  /** The visitor's sky and hour over the whole painting. */
  setNight(night: Night): void {
    this.painter.setSky(weatherOf(night.sky), tintOf(night.daylight));
    this.light = 0.94 + 0.12 * Math.max(0, Math.min(1, night.daylight));
  }

  // --- Moving between the map and a stage ----------------------------------------------

  /** Dive into a stage: along the cable to its place on the map, then the pieces assemble. */
  async enter(stage: StageId): Promise<void> {
    if (!this.style || this.busy) return;
    this.busy = true;
    const target = nodeWorld(stage);
    const r0 = this.painter.radius;
    if (this.reduced) {
      await tween(300, (k) => (this.painter.fade = k));
    } else {
      if (this.mode === "stage") await this.scatter();
      if (this.mode === "stage") this.mode = "map";
      const from = this.look.clone();
      const h0 = this.height;
      await tween(950, (k) => {
        const e = easeInOut(k);
        this.look.lerpVectors(from, target, e);
        this.height = h0 + (2.6 - h0) * e;
        this.painter.radius = r0 + (TRAVEL_RADIUS - r0) * easeIn(k);
      });
    }
    this.mode = "stage";
    this.stage = stage;
    this.playValue = this.playTarget = 0.5;
    this.buildStage(stage, this.reduced);
    if (this.reduced) {
      this.painter.radius = this.style.brush.radius;
      await tween(300, (k) => (this.painter.fade = 1 - k));
    } else {
      await this.assemble();
    }
    this.busy = false;
  }

  /** Back to the map: the pieces scatter, and the camera pulls back from the stage's place. */
  async leave(): Promise<void> {
    if (!this.style || this.mode === "map" || this.busy) return;
    this.busy = true;
    const at = this.stage ? nodeWorld(this.stage) : new THREE.Vector3();
    if (this.reduced) {
      await tween(300, (k) => (this.painter.fade = k));
      this.mode = "map";
      this.look.copy(at);
      this.height = this.overview();
      this.painter.radius = this.style.brush.radius * 1.3;
      await tween(300, (k) => (this.painter.fade = 1 - k));
    } else {
      await this.scatter();
      this.mode = "map";
      this.look.copy(at);
      this.height = 2.6;
      const r1 = this.style.brush.radius * 1.3;
      const top = this.overview();
      await tween(1000, (k) => {
        const e = easeInOut(k);
        this.height = 2.6 + (top - 2.6) * e;
        this.painter.radius = TRAVEL_RADIUS + (r1 - TRAVEL_RADIUS) * easeOut(k);
      });
    }
    this.stage = null;
    this.busy = false;
  }

  get current(): StageId | null {
    return this.stage;
  }

  /**
   * The stage's play, from 0 to 1: which of two streams the visitor leans
   * towards, or how far they have turned something up. Art, not the app.
   */
  play(k: number): void {
    this.playTarget = THREE.MathUtils.clamp(k, 0, 1);
    if (this.reduced) this.playValue = this.playTarget;
  }

  private buildStage(stage: StageId, settled: boolean): void {
    for (const p of this.pieces) {
      this.stageScene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this.pieces = [];
    const layers = stageLayers(stage, this.style!);
    const [cols, rows] = PIECES;
    const aspect = this.width / this.heightPx;
    let seed = 1;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    for (const layer of layers) {
      const tex = new THREE.CanvasTexture(layer.canvas);
      const dist = STAGE_CAM_Z - layer.depth;
      const visH = 2 * dist * Math.tan(THREE.MathUtils.degToRad(STAGE_FOV / 2));
      const visW = visH * aspect;
      // Cover the view with a little to spare for the pointer's parallax.
      let h = visH * 1.1;
      let w = h * (layer.canvas.width / layer.canvas.height);
      if (w < visW * 1.1) {
        w = visW * 1.1;
        h = w / (layer.canvas.width / layer.canvas.height);
      }
      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          const geo = new THREE.PlaneGeometry(w / cols, h / rows);
          const uv = geo.attributes.uv as THREE.BufferAttribute;
          for (let i = 0; i < uv.count; i++) uv.setXY(i, (cx + uv.getX(i)) / cols, (cy + uv.getY(i)) / rows);
          const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, opacity: settled ? 1 : 0 });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.renderOrder = layer.depth * 10;
          const home = new THREE.Vector3(-w / 2 + (cx + 0.5) * (w / cols), -h / 2 + (cy + 0.5) * (h / rows), layer.depth);
          // Each piece arrives from outward of where it belongs, turned, from a little nearer.
          const away = home.clone().multiply(new THREE.Vector3(1.8, 1.8, 1)).add(new THREE.Vector3(rand() * 2.5, rand() * 2.5, 1.5 + rand()));
          const piece: Piece = {
            mesh,
            home,
            away,
            turn: rand() * 0.5,
            delay: (Math.abs(cx - (cols - 1) / 2) + Math.abs(cy - (rows - 1) / 2)) * 0.06 + layer.depth * 0.08,
            alpha: settled ? 1 : 0,
            role: layer.role,
          };
          mesh.position.copy(settled ? home : away);
          mesh.rotation.z = settled ? 0 : piece.turn;
          this.stageScene.add(mesh);
          this.pieces.push(piece);
        }
      }
    }
  }

  private assemble(): Promise<void> {
    const r1 = this.style!.brush.radius;
    return tween(1500, (k) => {
      for (const p of this.pieces) {
        const local = Math.min(1, Math.max(0, (k - p.delay) / (1 - 0.5)));
        const e = easeOut(local);
        p.mesh.position.lerpVectors(p.away, p.home, e);
        p.mesh.rotation.z = p.turn * (1 - e);
        p.alpha = Math.min(1, local * 2);
      }
      this.painter.radius = TRAVEL_RADIUS + (r1 - TRAVEL_RADIUS) * easeInOut(k);
    });
  }

  private scatter(): Promise<void> {
    const r0 = this.painter.radius;
    return tween(550, (k) => {
      const e = easeIn(k);
      for (const p of this.pieces) {
        p.mesh.position.lerpVectors(p.home, p.away, e);
        p.mesh.rotation.z = p.turn * e;
        p.alpha = 1 - e;
      }
      this.painter.radius = r0 + (TRAVEL_RADIUS - r0) * e;
    });
  }

  // --- Input -----------------------------------------------------------------------

  private bind(): void {
    const c = this.canvas;
    c.addEventListener("pointermove", this.onMove);
    c.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointerup", this.onUp);
    c.addEventListener("wheel", this.onWheel, { passive: false });
    window.addEventListener("resize", this.resize);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private stageAt(clientX: number, clientY: number): StageId | null {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(ndc, this.mapCamera);
    const hit = this.ray.intersectObject(this.mapPlane)[0];
    if (!hit?.uv) return null;
    const x = hit.uv.x;
    const y = 1 - hit.uv.y;
    let best: StageId | null = null;
    let bestD = 0.045;
    for (const id of this.order) {
      const [fx, fy] = MAP_SPOTS[id];
      const d = Math.hypot((fx - x) * 2, fy - y);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    }
    return best;
  }

  private onMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, ((e.clientY - rect.top) / rect.height) * 2 - 1);
    if (this.drag && this.mode === "map") {
      const dx = e.clientX - this.drag.x;
      if (Math.abs(dx) > 4) this.drag.moved = true;
      this.look.x = THREE.MathUtils.clamp(this.drag.lookX - (dx / rect.width) * this.height * 1.4, -MAP_WORLD_W / 2 + 2, MAP_WORLD_W / 2 - 2);
      return;
    }
    if (this.mode !== "map" || this.busy) return;
    const s = this.stageAt(e.clientX, e.clientY);
    if (s !== this.hovered) {
      this.hovered = s;
      this.canvas.style.cursor = s ? "pointer" : "grab";
      this.events.hover?.(s);
    }
  };

  private onDown = (e: PointerEvent) => {
    if (this.mode !== "map") return;
    this.drag = { x: e.clientX, lookX: this.look.x, moved: false };
  };

  private onUp = (e: PointerEvent) => {
    const drag = this.drag;
    this.drag = null;
    if (!drag || drag.moved || this.mode !== "map" || this.busy) return;
    const s = this.stageAt(e.clientX, e.clientY);
    if (s) this.events.pick?.(s);
  };

  private onWheel = (e: WheelEvent) => {
    if (this.mode !== "map") return;
    e.preventDefault();
    this.look.x = THREE.MathUtils.clamp(this.look.x + (e.deltaX || e.deltaY) * 0.01, -MAP_WORLD_W / 2 + 2, MAP_WORLD_W / 2 - 2);
  };

  /** Look at a stage on the map without entering it. */
  showOnMap(stage: StageId): void {
    if (this.mode !== "map") return;
    this.look.x = nodeWorld(stage).x;
  }

  private onVisibility = () => {
    cancelAnimationFrame(this.raf);
    if (!document.hidden) this.loop();
  };

  resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.width = w;
    this.heightPx = h;
    const ratio = Math.min(window.devicePixelRatio || 1, 2) * this.quality.scale;
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(w, h, false);
    this.painter.setSize(Math.round(w * ratio), Math.round(h * ratio));
    for (const cam of [this.mapCamera, this.stageCamera]) {
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
    if (this.mode === "map" && !this.busy) this.height = this.overview();
  };

  /** How high the camera stands over the map: most of the path in view on a wide screen, a stretch of it on a phone. */
  private overview(): number {
    const aspect = this.width / this.heightPx;
    return THREE.MathUtils.clamp((MAP_WORLD_W * 0.98) / (0.81 * aspect), 9, 26);
  }

  /** Where a stage is on the screen, in CSS pixels, while the map is showing. */
  project(id: StageId): { x: number; y: number; visible: boolean } {
    const v = nodeWorld(id).project(this.mapCamera);
    return { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.heightPx, visible: this.mode === "map" && !this.busy && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05 };
  }

  // --- The frame -------------------------------------------------------------------

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const now = performance.now();
    const t = (now - this.start) / 1000;
    if (this.quality.tick(now)) this.resize();
    const sway = this.reduced ? 0 : 1;
    const light = this.light;
    // With reduced motion the weather and the grain hold still.
    const clock = this.reduced ? 0 : t;
    if (this.mode === "map") {
      // Seen at a tilt, drifting a little with the pointer.
      this.mapCamera.position.set(this.look.x + this.pointer.x * 0.4 * sway, this.look.y - this.height * 0.62 - this.pointer.y * 0.3 * sway, this.height);
      this.mapCamera.lookAt(this.look.x, this.look.y, 0);
      const along = this.reduced ? 0.5 : (t * 0.045) % 1;
      this.pulse.position.copy(this.path.getPointAt(along));
      if (this.hovered) {
        this.marker.position.copy(nodeWorld(this.hovered)).setZ(0.04);
        this.marker.material.opacity = 0.85;
        this.marker.scale.setScalar(1 + Math.sin(t * 4) * 0.06 * sway);
      } else this.marker.material.opacity = 0;
      this.painter.exposure = light;
      this.painter.render(this.renderer, this.mapScene, this.mapCamera, clock);
    } else {
      this.playValue += (this.playTarget - this.playValue) * 0.12;
      for (const p of this.pieces) p.mesh.material.opacity = p.alpha * roleOpacity(p.role, this.playValue);
      this.painter.exposure = light * (this.stage === "amp" ? 0.7 + this.playValue * 0.6 : 1);
      this.stageCamera.position.set(this.pointer.x * 0.35 * sway, -this.pointer.y * 0.22 * sway, STAGE_CAM_Z);
      this.stageCamera.lookAt(0, 0, 0);
      this.painter.render(this.renderer, this.stageScene, this.stageCamera, clock);
    }
  };

  dispose(): void {
    cancelAnimationFrame(this.raf);
    const c = this.canvas;
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("wheel", this.onWheel);
    window.removeEventListener("resize", this.resize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.painter.dispose();
    this.renderer.dispose();
  }
}
