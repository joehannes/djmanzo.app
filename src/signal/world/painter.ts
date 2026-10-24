/**
 * The painterly pass: everything the camera sees, painted.
 *
 * A Kuwahara filter turns a photograph into brushwork by replacing each
 * pixel with the mean of whichever neighbourhood around it is calmest — so
 * edges survive and flat areas become strokes. This is the generalised form
 * (eight sectors, as Papari et al. describe), made *anisotropic* the cheap
 * way: the sampling ellipse is turned along the image's own edges (a Sobel
 * gradient) and bent by the style's flow field, so strokes run around a
 * speaker cone and along a cable instead of in one direction everywhere.
 *
 * After the brush: a gradient map that pulls every photograph into the
 * style's palette, paper or film grain, and a vignette — and the visitor's
 * own sky over it, where they shared it: rain running down the glass, snow,
 * a fog that lifts the darks, and the light of their hour as a tint. The brush radius is
 * the transition between map and stage — large while the camera travels,
 * falling as it arrives: the painting resolves.
 *
 * Written as GLSL for WebGL2, so it runs wherever three.js does (and under
 * SwiftShader, where this repository's tests can look at it). Colour passes
 * through untouched — the engine turns three's colour management off — so a
 * palette's hex is the colour on screen.
 */

import * as THREE from "three";

export type Flow = "radial" | "horizontal" | "vertical" | "swirl" | "cross";
const FLOW_ID: Record<Flow, number> = { radial: 0, horizontal: 1, vertical: 2, swirl: 3, cross: 4 };

const vertex = /* glsl */ `
  out vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  in vec2 vUv;
  layout(location = 0) out vec4 outColor;

  uniform sampler2D tScene;
  uniform vec2 resolution;
  uniform float radius;      // brush radius in pixels of the source
  uniform int flow;          // 0 radial, 1 horizontal, 2 vertical, 3 swirl, 4 cross
  uniform float sharpness;   // how strongly the calmest sector wins
  uniform float grain;
  uniform float time;
  uniform vec3 ramp[4];      // night → accent → glow → ink
  uniform float rampMix;
  uniform float vignette;
  uniform float fade;        // 0 painted scene … 1 the night colour
  uniform float exposure;    // how much light the room has
  uniform vec3 weather;      // rain, snow, fog: 0 … 1 each
  uniform vec3 tint;         // the hour's light: cool at night, warm at the edges of the day

  const int SECTORS = 8;
  const int RADIAL = 3;
  const int ANGULAR = 2;
  const float PI = 3.14159265;

  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // The style's own direction at this point, as an angle.
  float flowAngle(vec2 uv) {
    vec2 c = uv - 0.5;
    if (flow == 0) return atan(c.y, c.x);
    if (flow == 1) return 0.0;
    if (flow == 2) return PI * 0.5;
    if (flow == 3) return atan(c.y, c.x) + PI * 0.5;
    return (noise(uv * 6.0) > 0.5 ? 0.25 : -0.25) * PI;
  }

  vec3 gradientMap(float l) {
    // A curve first, so the darks stay dark and only the lights take the accent.
    l = pow(clamp(l, 0.0, 1.0), 1.5) * 3.0;
    if (l < 1.0) return mix(ramp[0], ramp[1], l);
    if (l < 2.0) return mix(ramp[1], ramp[2], l - 1.0);
    return mix(ramp[2], ramp[3], l - 2.0);
  }

  void main() {
    vec2 px = 1.0 / resolution;
    vec3 base = texture(tScene, vUv).rgb;

    // The image's own edges: strokes run along them, not across.
    float tl = luma(texture(tScene, vUv + px * vec2(-1.0, 1.0)).rgb);
    float t  = luma(texture(tScene, vUv + px * vec2(0.0, 1.0)).rgb);
    float tr = luma(texture(tScene, vUv + px * vec2(1.0, 1.0)).rgb);
    float l  = luma(texture(tScene, vUv + px * vec2(-1.0, 0.0)).rgb);
    float r  = luma(texture(tScene, vUv + px * vec2(1.0, 0.0)).rgb);
    float bl = luma(texture(tScene, vUv + px * vec2(-1.0, -1.0)).rgb);
    float b  = luma(texture(tScene, vUv + px * vec2(0.0, -1.0)).rgb);
    float br = luma(texture(tScene, vUv + px * vec2(1.0, -1.0)).rgb);
    vec2 g = vec2((tr + 2.0 * r + br) - (tl + 2.0 * l + bl), (tl + 2.0 * t + tr) - (bl + 2.0 * b + br));
    float edge = length(g);
    float along = atan(g.y, g.x) + PI * 0.5;
    // Where the image has an edge, follow it; where it is flat, follow the style.
    float angle = mix(flowAngle(vUv), along, smoothstep(0.02, 0.25, edge));
    mat2 turn = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    // An ellipse: long along the stroke, short across it.
    vec2 stretch = vec2(1.6, 0.62);

    vec3 sum = vec3(0.0);
    float wsum = 0.0;
    float rad = max(radius, 0.5);
    for (int k = 0; k < SECTORS; k++) {
      vec3 m = vec3(0.0);
      vec3 s = vec3(0.0);
      float n = 0.0;
      for (int j = 0; j < RADIAL; j++) {
        float rr = rad * (float(j) + 0.75) / float(RADIAL);
        for (int a = 0; a < ANGULAR; a++) {
          float th = (float(k) + (float(a) + 0.5) / float(ANGULAR)) * 2.0 * PI / float(SECTORS);
          vec2 o = turn * (vec2(cos(th), sin(th)) * stretch * rr);
          vec3 c = texture(tScene, vUv + o * px).rgb;
          m += c;
          s += c * c;
          n += 1.0;
        }
      }
      m /= n;
      vec3 v = abs(s / n - m * m);
      float w = 1.0 / (1.0 + pow(1000.0 * (v.r + v.g + v.b), sharpness));
      sum += m * w;
      wsum += w;
    }
    vec3 painted = mix(base, sum / max(wsum, 1e-5), smoothstep(0.4, 1.5, radius));

    // Bristles: a fine streak along the stroke, so a flat area reads as paint, not as blur.
    vec2 q = turn * (vUv * resolution);
    float bristle = noise(vec2(q.x / (radius * 2.2 + 2.0), q.y / 1.6)) - 0.5;
    painted *= 1.0 + bristle * 0.16 * smoothstep(1.0, 4.0, radius);

    // Into the style's palette, keeping some of the photograph's own colour.
    vec3 mapped = gradientMap(luma(painted));
    vec3 col = mix(painted, mapped, rampMix);

    // Paper and film: a fine grain, and a slow mottle like pigment on paper.
    float fine = hash(vUv * resolution + fract(time) * 31.0) - 0.5;
    float mottle = noise(vUv * resolution / 180.0) - 0.5;
    col += (fine * 0.09 + mottle * 0.05) * grain;

    // The visitor's sky, over the painting like weather on a window.
    if (weather.z > 0.0) col = mix(col, mix(ramp[1], ramp[3], 0.35), weather.z * 0.35 * (1.0 - vUv.y * 0.6));
    if (weather.x > 0.0) {
      vec2 rp = vec2(vUv.x * resolution.x / 3.0 + vUv.y * resolution.y / 40.0, vUv.y * resolution.y / 70.0 + time * 7.0);
      float drop = step(0.975, hash(floor(rp)));
      col = mix(col, ramp[3], drop * fract(rp.y) * 0.22 * weather.x);
    }
    if (weather.y > 0.0) {
      vec2 sp = vUv * resolution / 30.0 + vec2(sin(time * 0.6 + vUv.y * 9.0) * 0.35, time * 0.8);
      vec2 cell = floor(sp);
      vec2 f = fract(sp) - 0.5 - (vec2(hash(cell), hash(cell + 7.0)) - 0.5) * 0.6;
      float flake = step(0.72, hash(cell + 3.0)) * smoothstep(0.14, 0.02, length(f));
      col = mix(col, ramp[3], flake * 0.7 * weather.y);
    }
    col *= tint * exposure;
    vec2 c = vUv - 0.5;
    col *= 1.0 - vignette * dot(c, c) * 1.6;
    col = mix(col, ramp[0], fade);
    outColor = vec4(col, 1.0);
  }
`;

export interface PainterStyle {
  flow: Flow;
  grain: number;
  /** night, a deep accent, the glow, the ink: dark to light. */
  ramp: [string, string, string, string];
  rampMix: number;
}

export class Painter {
  readonly target: THREE.WebGLRenderTarget;
  private readonly material: THREE.ShaderMaterial;
  private readonly quad: THREE.Mesh;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  constructor(width: number, height: number) {
    this.target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType });
    this.material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tScene: { value: this.target.texture },
        resolution: { value: new THREE.Vector2(width, height) },
        radius: { value: 6 },
        flow: { value: 0 },
        sharpness: { value: 8 },
        grain: { value: 0.3 },
        time: { value: 0 },
        ramp: { value: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()] },
        rampMix: { value: 0.35 },
        vignette: { value: 0.6 },
        fade: { value: 0 },
        exposure: { value: 1 },
        weather: { value: new THREE.Vector3(0, 0, 0) },
        tint: { value: new THREE.Vector3(1, 1, 1) },
      },
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  /** The brush radius as a style states it: in pixels of a 1080-line picture. */
  private r = 6;
  get radius(): number {
    return this.r;
  }
  set radius(r: number) {
    this.r = r;
    this.material.uniforms.radius.value = r * this.pixelScale();
  }
  /** Painting at a lower resolution (a slower device), the same stroke covers fewer pixels. */
  private pixelScale(): number {
    // Never so small that a slower device loses the paint altogether.
    return Math.max(0.6, this.material.uniforms.resolution.value.y / 1080);
  }
  set fade(f: number) {
    this.material.uniforms.fade.value = f;
  }
  set exposure(e: number) {
    this.material.uniforms.exposure.value = e;
  }

  /** The visitor's sky: rain, snow and fog from 0 to 1, and the hour's light as an RGB multiplier. */
  setSky(weather: [number, number, number], tint: [number, number, number]): void {
    this.material.uniforms.weather.value.set(...weather);
    this.material.uniforms.tint.value.set(...tint);
  }

  setStyle(style: PainterStyle): void {
    const u = this.material.uniforms;
    u.flow.value = FLOW_ID[style.flow];
    u.grain.value = style.grain;
    u.rampMix.value = style.rampMix;
    style.ramp.forEach((hex, i) => (u.ramp.value[i] as THREE.Color).set(hex));
  }

  setSize(width: number, height: number): void {
    this.target.setSize(width, height);
    this.material.uniforms.resolution.value.set(width, height);
    this.radius = this.r;
  }

  /** Render `scene` through `camera` into the canvas, painted. */
  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, time: number): void {
    renderer.setRenderTarget(this.target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    this.material.uniforms.time.value = time;
    renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.target.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}
