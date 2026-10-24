/**
 * Waveforms on the GPU: one fragment shader draws either the three coloured
 * bands overlaid round a centre line (the way DJ software draws a track) or
 * separate lanes (the stems), from a small texture of levels, one row per
 * band or lane. The past is dimmed, the playhead is a line, what is to come
 * is drawn ahead of it. Without WebGL 2 the same picture is drawn on a 2D
 * canvas, more plainly.
 */

const VERT = `#version 300 es
in vec2 pos;
out vec2 uv;
void main() {
  uv = pos * 0.5 + 0.5;
  gl_Position = vec4(pos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D levels;
uniform int rows;
uniform int mode;          // 0: bands overlaid, 1: lanes
uniform vec3 colours[4];
uniform float playhead;    // where now is, 0..1 across
uniform float idle;        // 1 while nothing plays: quieter
uniform float pulse;       // the beat, 0..1
uniform vec2 size;         // pixels
in vec2 uv;
out vec4 frag;

float level(float x, int row) {
  return texture(levels, vec2(x, (float(row) + 0.5) / float(rows))).r;
}

void main() {
  float px = 1.0 / size.y;
  vec3 col = vec3(0.0);
  float alpha = 0.0;
  bool past = uv.x < playhead;
  float dim = past ? 0.42 : 1.0;
  if (mode == 0) {
    float y = abs(uv.y - 0.5) * 2.0;
    for (int i = 0; i < 3; i++) {
      float h = level(uv.x, i) * (1.0 - 0.24 * float(i)) * 0.8;
      float edge = smoothstep(h + 2.0 * px, h - 2.0 * px, y);
      float halo = smoothstep(h + 0.22, h, y) * 0.16;
      col = mix(col, colours[i], edge);
      col += colours[i] * halo * (1.0 - edge);
      alpha = max(alpha, max(edge, halo));
    }
  } else {
    float lane = floor((1.0 - uv.y) * float(rows));
    int r = int(lane);
    float local = fract((1.0 - uv.y) * float(rows));
    float y = abs(local - 0.5) * 2.0;
    float h = level(uv.x, r) * 0.86;
    float edge = smoothstep(h + 3.0 * px * float(rows), h - 3.0 * px * float(rows), y);
    float halo = smoothstep(h + 0.3, h, y) * 0.14;
    vec3 c = r == 0 ? colours[0] : r == 1 ? colours[1] : r == 2 ? colours[2] : colours[3];
    col = c * (edge + halo * (1.0 - edge));
    alpha = max(edge, halo);
    // A hairline between lanes.
    float gap = min(local, 1.0 - local);
    alpha = max(alpha, step(gap, 0.004) * 0.25);
    col = mix(col, vec3(0.5), step(gap, 0.004) * 0.25);
  }
  col *= dim * (1.0 - 0.55 * idle);
  alpha *= dim * (1.0 - 0.45 * idle);
  // The playhead, brighter on the beat.
  float d = abs(uv.x - playhead) * size.x;
  float head = smoothstep(1.6, 0.4, d) * (0.75 + 0.25 * pulse);
  col = mix(col, vec3(1.0), head);
  alpha = max(alpha, head);
  frag = vec4(col * alpha, alpha);
}`;

const hex = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];

export interface WaveOptions {
  mode: "bands" | "lanes";
  rows: number;
  colours: string[];
  playhead?: number;
}

export class WaveGL {
  private gl: WebGL2RenderingContext | null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private prog: WebGLProgram | null = null;
  private tex: WebGLTexture | null = null;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private bytes = new Uint8Array(0);
  private colours: [number, number, number][] = [];
  readonly webgl: boolean;

  constructor(
    private canvas: HTMLCanvasElement,
    private opts: WaveOptions,
  ) {
    this.gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    this.webgl = !!this.gl && this.setup();
    if (!this.webgl) this.ctx2d = canvas.getContext("2d");
    this.setColours(opts.colours);
  }

  setColours(c: string[]) {
    this.opts.colours = c;
    this.colours = c.map(hex);
    // What it is drawing in, readable from outside (the tests check a new skin reaches the shader).
    this.canvas.dataset.colours = c.join(" ");
  }

  private setup(): boolean {
    const gl = this.gl!;
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    try {
      const p = gl.createProgram()!;
      gl.attachShader(p, shader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, shader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return false;
      this.prog = p;
      gl.useProgram(p);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(p, "pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      for (const n of ["levels", "rows", "mode", "colours", "playhead", "idle", "pulse", "size"]) this.u[n] = gl.getUniformLocation(p, n);
      this.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      return true;
    } catch {
      return false;
    }
  }

  /** Match the drawing buffer to the canvas's size on screen. */
  fit(): { width: number; height: number } {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return { width: w, height: h };
  }

  /** Draw `levels` (`rows` rows of `columns`, each 0..1). */
  draw(levels: Float32Array, columns: number, state: { idle: boolean; pulse: number }) {
    const { width, height } = this.fit();
    const rows = this.opts.rows;
    const playhead = this.opts.playhead ?? 0.5;
    if (this.gl && this.prog) {
      const gl = this.gl;
      if (this.bytes.length !== rows * columns) this.bytes = new Uint8Array(rows * columns);
      for (let i = 0; i < this.bytes.length; i++) this.bytes[i] = Math.min(255, Math.round(levels[i] * 255));
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, columns, rows, 0, gl.RED, gl.UNSIGNED_BYTE, this.bytes);
      gl.uniform1i(this.u.levels, 0);
      gl.uniform1i(this.u.rows, rows);
      gl.uniform1i(this.u.mode, this.opts.mode === "bands" ? 0 : 1);
      const flat = new Float32Array(12);
      this.colours.slice(0, 4).forEach((c, i) => flat.set(c, i * 3));
      gl.uniform3fv(this.u.colours, flat);
      gl.uniform1f(this.u.playhead, playhead);
      gl.uniform1f(this.u.idle, state.idle ? 1 : 0);
      gl.uniform1f(this.u.pulse, state.pulse);
      gl.uniform2f(this.u.size, width, height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return;
    }
    const g = this.ctx2d;
    if (!g) return;
    g.clearRect(0, 0, width, height);
    const laneH = this.opts.mode === "bands" ? height : height / rows;
    for (let r = 0; r < Math.min(rows, this.opts.colours.length); r++) {
      const mid = this.opts.mode === "bands" ? height / 2 : laneH * (r + 0.5);
      const scale = this.opts.mode === "bands" ? (height / 2) * (1 - 0.24 * r) * 0.94 : (laneH / 2) * 0.86;
      g.fillStyle = this.opts.colours[r];
      g.globalAlpha = state.idle ? 0.45 : 0.9;
      g.beginPath();
      g.moveTo(0, mid);
      for (let c = 0; c < columns; c++) g.lineTo((c / columns) * width, mid - levels[r * columns + c] * scale);
      for (let c = columns - 1; c >= 0; c--) g.lineTo((c / columns) * width, mid + levels[r * columns + c] * scale);
      g.closePath();
      g.fill();
    }
    g.globalAlpha = 1;
    g.fillStyle = "#fff";
    g.fillRect(playhead * width - 1, 0, 2, height);
  }

  dispose() {
    if (this.gl) {
      this.gl.deleteTexture(this.tex);
      this.gl.deleteProgram(this.prog);
    }
  }
}
