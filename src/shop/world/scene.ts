/**
 * The back room's centrepiece: the record-earth on its pedestal under a
 * glass dome, an inverted fishbowl, with the sun hung inside it over the
 * place where it stands overhead right now, so the day side of the disc is
 * lit and the night side is not. A tonearm stands beside it. Drag the
 * record to turn it, drag the arm onto a place, or ask for a place and the
 * record turns it under the needle, as a turntable would.
 *
 * Three.js on WebGL. It draws only while it is on screen and something
 * moves.
 */

import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { subsolar } from "../../signal/sense/sun";
import { ARM, PLACES, armFor, cue, gleason, needle, rotate, under, type Place, genreOf } from "./places";
import { paintSurface } from "./surface";

export interface EarthEvents {
  /** The needle came down on a place, or on open sea (null). */
  drop?: (p: Place | null) => void;
  /** The arm went back to its rest. */
  lift?: () => void;
  /** The pointer is over a place, or none. */
  hover?: (p: Place | null, screen: { x: number; y: number } | null) => void;
}

const DISC_Y = 0.05;

interface Move {
  from: { turn: number; arm: number };
  to: { turn: number; arm: number };
  at: number;
  ms: number;
  done: () => void;
  timer: number;
}
/** The glass dome's radius: wide enough to cover the tonearm too. */
const DOME = 1.52;
/** Disc coordinates (x right, y down on the map) to the world: the map's down is towards the viewer. */
const toWorld = (x: number, y: number, h = DISC_Y) => new THREE.Vector3(x, h, y);

export class RecordEarth {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private disc = new THREE.Group();
  private arm = new THREE.Group();
  private sun = new THREE.Group();
  private sunLight: THREE.PointLight;
  private pins = new Map<string, THREE.Mesh>();
  private ray = new THREE.Raycaster();
  private raf = 0;
  private visible = false;
  private dirty = true;
  private last = performance.now();
  /** The record's turn, radians, in disc coordinates (x towards y). */
  turn = 0;
  /** The arm's angle, radians, in disc coordinates. */
  armAngle = ARM.rest;
  /** What the needle is in, if anything. */
  playing: Place | null = null;
  private drag: { kind: "disc" | "arm"; startAngle: number; startTurn: number; moved: boolean; lastAngle: number; lastT: number; spin: number } | null = null;
  private spin = 0;
  /** The arm's or the record's current move, if one is running. */
  private move: Move | null = null;
  private reduced: boolean;
  /** Frames have been slow (a software renderer, a weak device): draw fewer pixels, and only when asked. */
  private slow = false;
  private frameMs = 16;
  private resizeObserver: ResizeObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    private events: EarthEvents = {},
    opts: { reducedMotion?: boolean } = {},
  ) {
    this.reduced = !!opts.reducedMotion;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.35;

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    this.camera.position.set(0, 3.5, 3.85);
    this.camera.lookAt(0, 0.28, 0.12);

    // The room: a dim warm fill, so the night side still reads.
    this.scene.add(new THREE.HemisphereLight(0xffe2b8, 0x1a1008, 0.55));
    const key = new THREE.DirectionalLight(0xfff1dc, 0.6);
    key.position.set(-2, 4, 3);
    this.scene.add(key);

    this.buildPedestal();
    this.scene.add(this.disc);
    this.buildDome();
    this.buildArm();
    this.sunLight = new THREE.PointLight(0xfff0c8, 7, 2.6, 1.4);
    this.buildSun();
    this.placeSun(new Date());
    this.setArm(this.armAngle);

    void paintSurface().then((surface) => {
      const map = new THREE.CanvasTexture(surface);
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      const top = new THREE.Mesh(
        new THREE.CircleGeometry(1, 160),
        new THREE.MeshPhysicalMaterial({ map, roughness: 0.55, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.28 }),
      );
      top.rotation.x = -Math.PI / 2;
      top.position.y = DISC_Y;
      this.disc.add(top);
      this.dirty = true;
    });
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.035, 160, 1, true), new THREE.MeshPhysicalMaterial({ color: 0x121010, roughness: 0.35, clearcoat: 1 }));
    edge.position.y = DISC_Y - 0.0175;
    this.disc.add(edge);
    this.buildPins();

    this.bind();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  // --- Building ---------------------------------------------------------------------

  private buildPedestal() {
    const wood = new THREE.MeshStandardMaterial({ color: 0x4a2c17, roughness: 0.6 });
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a050, metalness: 1, roughness: 0.32 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(DOME + 0.06, DOME + 0.16, 0.16, 96), wood);
    base.position.y = -0.1;
    this.scene.add(base);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(DOME + 0.005, 0.025, 16, 160), brass);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.0;
    this.scene.add(ring);
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.03, 128), new THREE.MeshStandardMaterial({ color: 0x1b1714, roughness: 0.5, metalness: 0.4 }));
    platter.position.y = 0.0;
    this.scene.add(platter);
  }

  private buildDome() {
    // A bell jar over the whole turntable, the arm included: glass drawn by its rim and one highlight,
    // so the record shows through it unclouded.
    const glass = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { tint: { value: new THREE.Color(0xfff1d8) }, light: { value: new THREE.Vector3(-0.5, 0.8, 0.4).normalize() } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 tint;
        uniform vec3 light;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec3 n = normalize(vNormal);
          vec3 v = normalize(vView);
          float rim = pow(1.0 - abs(dot(n, v)), 3.0);
          float shine = pow(max(dot(reflect(-light, n), v), 0.0), 80.0);
          // Light only: the alpha is the light's own, so the canvas stays clear where the glass is plain.
          float glow = clamp(rim * 0.55 + shine * 0.9 + 0.012, 0.0, 1.0);
          gl_FragColor = vec4(tint, glow);
        }`,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(DOME, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), glass);
    dome.renderOrder = 2;
    this.scene.add(dome);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16), new THREE.MeshStandardMaterial({ color: 0xc9a050, metalness: 1, roughness: 0.3 }));
    knob.position.y = DOME + 0.03;
    this.scene.add(knob);
  }

  private buildSun() {
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.045, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff1b0 }));
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color: 0xffd27a,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    halo.scale.setScalar(0.42);
    this.sun.add(core, halo, this.sunLight);
    this.scene.add(this.sun);
  }

  private buildPins() {
    for (const p of PLACES) {
      const g = genreOf(p);
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.004, 0.06, 12),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(g.palette.primary), emissive: new THREE.Color(g.palette.primary), emissiveIntensity: 0.6, roughness: 0.4 }),
      );
      const at = gleason(p.lat, p.lon);
      pin.position.copy(toWorld(at.x, at.y, DISC_Y + 0.03));
      pin.userData.genre = p.genre;
      this.disc.add(pin);
      this.pins.set(p.genre, pin);
    }
  }

  private buildArm() {
    const metal = new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.22 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x1c1c1f, roughness: 0.5 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.07, 32), dark);
    base.position.y = 0.035;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, ARM.length, 16), metal);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(ARM.length / 2, 0.11, 0);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.04), dark);
    head.position.set(ARM.length, 0.1, 0);
    const stylus = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.04, 8), metal);
    stylus.rotation.z = Math.PI;
    stylus.position.set(ARM.length, 0.075, 0);
    const counterweight = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 24), metal);
    counterweight.rotation.z = Math.PI / 2;
    counterweight.position.set(-0.11, 0.11, 0);
    const pivot = new THREE.Group();
    pivot.add(rod, head, stylus, counterweight);
    pivot.name = "pivot";
    this.arm.add(base, pivot);
    this.arm.position.copy(toWorld(ARM.pivot.x, ARM.pivot.y, 0));
    this.scene.add(this.arm);
  }

  // --- State --------------------------------------------------------------------------

  /** Put the sun over where it stands overhead at `at`. */
  placeSun(at: Date) {
    const s = subsolar(at);
    const p = rotate(gleason(s.lat, s.lon), this.turn);
    this.sun.position.copy(toWorld(p.x, p.y, 0.72));
    this.dirty = true;
  }

  private setArm(angle: number, lifted = false) {
    this.armAngle = angle;
    const pivot = this.arm.getObjectByName("pivot")!;
    // Disc angles run from x towards y (towards the viewer); a turn about the world's y runs the other way.
    pivot.rotation.set(0, -angle, lifted ? 0.06 : 0);
    this.dirty = true;
  }

  private setTurn(turn: number) {
    this.turn = turn;
    this.disc.rotation.y = -turn;
    this.placeSun(new Date());
  }

  /** Bring a place under the needle, and play it. */
  play(p: Place) {
    const target = cue(gleason(p.lat, p.lon), this.turn);
    this.spin = 0;
    this.start({ turn: target.turn, arm: target.arm }, this.reduced ? 0.01 : 1.3, () => {
      this.setArm(target.arm, false);
      this.land();
    });
  }

  /** Lift the needle and swing the arm home. */
  stop() {
    this.start({ arm: ARM.rest }, this.reduced ? 0.01 : 0.8, () => this.setArm(ARM.rest));
    this.playing = null;
    this.events.lift?.();
  }

  /**
   * A move of the record and the arm, timed by the clock rather than by
   * frames: on a slow device it is choppier but lands on time, and it lands
   * even when nothing is drawn (the room scrolled out of view).
   */
  private start(to: { turn?: number; arm: number }, seconds: number, done: () => void) {
    this.halt();
    const ms = seconds * 1000;
    const m: Move = { from: { turn: this.turn, arm: this.armAngle }, to: { turn: to.turn ?? this.turn, arm: to.arm }, at: performance.now(), ms, done, timer: 0 };
    m.timer = window.setTimeout(() => this.advance(performance.now()), ms + 30);
    this.move = m;
    this.wake();
  }

  private advance(now: number) {
    const m = this.move;
    if (!m) return;
    const t = Math.min(1, (now - m.at) / m.ms);
    // Ease in and out, as power2.inOut does.
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    this.setTurn(m.from.turn + (m.to.turn - m.from.turn) * e);
    this.setArm(m.from.arm + (m.to.arm - m.from.arm) * e, t < 1);
    if (t < 1) return;
    clearTimeout(m.timer);
    this.move = null;
    m.done();
  }

  private halt() {
    if (this.move) clearTimeout(this.move.timer);
    this.move = null;
  }

  /** The needle comes down where it is. */
  private land() {
    const n = needle(this.armAngle);
    if (Math.hypot(n.x, n.y) > 0.99) {
      this.stop();
      return;
    }
    this.playing = under(n, this.turn, 0.07);
    this.events.drop?.(this.playing);
    this.dirty = true;
  }

  /** Where a place appears on the screen, in CSS pixels of the canvas. */
  screenOf(p: Place): { x: number; y: number } {
    const pin = this.pins.get(p.genre)!;
    const v = pin.getWorldPosition(new THREE.Vector3());
    v.y += 0.05;
    v.project(this.camera);
    return { x: ((v.x + 1) / 2) * this.canvas.clientWidth, y: ((1 - v.y) / 2) * this.canvas.clientHeight };
  }

  // --- Input ----------------------------------------------------------------------------

  /** The pointer on the disc's plane, in disc coordinates of the room (not turned). */
  private onPlane(e: PointerEvent): { x: number; y: number } | null {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (!this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -DISC_Y), hit)) return null;
    return { x: hit.x, y: hit.z };
  }

  private pinAt(e: PointerEvent): Place | null {
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(ndc, this.camera);
    const hit = this.ray.intersectObjects([...this.pins.values()])[0];
    if (hit) return PLACES.find((p) => p.genre === hit.object.userData.genre) ?? null;
    // Pins are small; a touch near one counts.
    const q = this.onPlane(e);
    return q ? under(q, this.turn, 0.05) : null;
  }

  private onDown = (e: PointerEvent) => {
    const q = this.onPlane(e);
    if (!q) return;
    const n = needle(this.armAngle);
    const nearArm = Math.hypot(q.x - n.x, q.y - n.y) < 0.14 || distanceToSegment(q, ARM.pivot, n) < 0.06;
    if (nearArm) {
      this.drag = { kind: "arm", startAngle: this.armAngle, startTurn: this.turn, moved: false, lastAngle: 0, lastT: 0, spin: 0 };
    } else if (Math.hypot(q.x, q.y) < 1) {
      const a = Math.atan2(q.y, q.x);
      this.drag = { kind: "disc", startAngle: a, startTurn: this.turn, moved: false, lastAngle: a, lastT: performance.now(), spin: 0 };
      this.spin = 0;
    } else return;
    this.canvas.setPointerCapture(e.pointerId);
    this.wake();
  };

  private onMove = (e: PointerEvent) => {
    const q = this.onPlane(e);
    if (!this.drag) {
      const p = this.pinAt(e);
      this.canvas.style.cursor = p ? "pointer" : q && Math.hypot(q.x, q.y) < 1 ? "grab" : "default";
      this.events.hover?.(p, p ? this.screenOf(p) : null);
      return;
    }
    if (!q) return;
    this.drag.moved = true;
    if (this.drag.kind === "disc") {
      const a = Math.atan2(q.y, q.x);
      const now = performance.now();
      let da = a - this.drag.lastAngle;
      da = Math.atan2(Math.sin(da), Math.cos(da));
      this.drag.spin = da / Math.max(1, now - this.drag.lastT);
      this.drag.lastAngle = a;
      this.drag.lastT = now;
      this.setTurn(this.turn + da);
    } else {
      // The arm follows the pointer round its pivot, between the label and its rest.
      const a = Math.atan2(q.y - ARM.pivot.y, q.x - ARM.pivot.x);
      const inner = armFor(0.06);
      this.setArm(Math.max(inner, Math.min(ARM.rest, a)), true);
      const n = needle(this.armAngle);
      const p = under(n, this.turn, 0.07);
      this.events.hover?.(p, p ? this.screenOf(p) : null);
    }
    this.wake();
  };

  private onUp = (e: PointerEvent) => {
    const d = this.drag;
    this.drag = null;
    if (!d) return;
    if (d.kind === "arm") {
      if (this.armAngle > ARM.rest - 0.08) this.stop();
      else {
        this.setArm(this.armAngle);
        this.land();
      }
      return;
    }
    if (!d.moved) {
      // A tap on a place plays it.
      const p = this.pinAt(e);
      if (p) this.play(p);
      return;
    }
    // A flick keeps the record turning a while.
    this.spin = this.reduced ? 0 : d.spin * 1000;
    if (this.playing && Math.abs(this.spin) > 0.2) {
      this.playing = null;
      this.events.drop?.(null);
    }
  };

  private bind() {
    this.canvas.addEventListener("pointerdown", this.onDown);
    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerup", this.onUp);
    this.canvas.addEventListener("pointercancel", this.onUp);
    this.canvas.addEventListener("pointerleave", () => this.events.hover?.(null, null));
  }

  // --- The frame ----------------------------------------------------------------------

  /** Draw while on screen; rest when not. */
  setVisible(on: boolean) {
    this.visible = on;
    if (on) this.wake();
  }

  private wake() {
    this.dirty = true;
    if (!this.raf && this.visible) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  private frame = (now: number) => {
    this.raf = 0;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.frameMs = this.frameMs * 0.9 + (now - this.last) * 0.1;
    this.last = now;
    if (!this.slow && this.frameMs > 60) {
      this.slow = true;
      this.renderer.setPixelRatio(1);
      this.resize();
    }
    if (this.move) this.advance(now);
    let moving = !!this.move || !!this.drag;
    if (!this.drag && Math.abs(this.spin) > 0.002) {
      this.setTurn(this.turn + this.spin * dt);
      this.spin *= Math.pow(0.25, dt);
      moving = true;
    } else if (!this.drag && !this.move && !this.playing && !this.reduced && !this.slow) {
      // Idle, the record turns slowly by itself.
      this.setTurn(this.turn + 0.06 * dt);
      moving = true;
    }
    if (this.dirty || moving) {
      this.renderer.render(this.scene, this.camera);
      this.dirty = false;
    }
    if (this.visible && moving) this.raf = requestAnimationFrame(this.frame);
  };

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // Keep the whole dome in view on a narrow screen.
    this.camera.fov = w / h < 1 ? 32 / Math.max(0.62, w / h) : 32;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
    this.wake();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.halt();
    this.renderer.dispose();
  }
}

function distanceToSegment(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function glowTexture(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,220,140,0.55)");
  grad.addColorStop(1, "rgba(255,200,100,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
