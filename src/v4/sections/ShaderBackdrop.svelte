<!--
  A living backdrop in the style of Milkdrop / Winamp visualisers: feedback
  warps, frequency-reactive colour, and slow geometric drift — all on the GPU,
  tinted by the current skin's accents. It draws only while visible, stops for
  reduced-motion, and never blocks the content above it.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { skin } from "../region.svelte";
  import { deck, where } from "../sound.svelte";
  import { reduced } from "../motion";

  let canvas: HTMLCanvasElement;

  /** Parse a hex colour into [r,g,b] floats for the shader. */
  function rgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
  }

  const VERT = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * .5 + .5;
  gl_Position = vec4(a_pos, 0., 1.);
}`;

  // A single-pass feedback shader: reads its own previous frame (u_prev),
  // warps UVs by a low-frequency sine field driven by time and bass energy,
  // mixes in the skin's two accents by height and radius, and fades toward
  // the background so text above stays legible.
  const FRAG = `#version 300 es
precision mediump float;
uniform sampler2D u_prev;
uniform float u_time;
uniform float u_bass;
uniform float u_mid;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_bg;
uniform vec2 u_res;
in vec2 v_uv;
out vec4 o;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

void main(){
  vec2 uv = v_uv;
  float aspect = u_res.x / max(u_res.y, 1.);
  vec2 p = (uv - .5) * vec2(aspect, 1.);

  // Warp: a slow rotational fold plus a bass-driven radial pulse.
  float r = length(p);
  float ang = atan(p.y, p.x);
  float warp = sin(r * 6. - u_time * .7 + u_bass * 2.) * (.012 + u_bass * .018);
  float swirl = cos(ang * 3. + u_time * .35) * (.006 + u_mid * .01);
  vec2 sampleUV = uv + vec2(cos(ang + u_time * .2), sin(ang + u_time * .2)) * warp + vec2(swirl, -swirl);
  sampleUV = clamp(sampleUV, vec2(0.), vec2(1.));

  vec3 prev = texture(u_prev, sampleUV).rgb;

  // Colour field: two radial gradients in the skin's accents, modulated by frequency.
  float g1 = smoothstep(.9, .0, length(p - vec2(-.3, .2))) * (.35 + u_bass * .55);
  float g2 = smoothstep(.85, .0, length(p - vec2(.35, -.25))) * (.3 + u_mid * .5);
  vec3 field = u_a * g1 + u_b * g2;

  // Fine grain tied to the music's clock, so it travels with the beat.
  float grain = (hash(uv * u_res + u_time * 60.) - .5) * .04;

  // Feedback blend: mostly the warped previous frame, fresh colour where the field is strong,
  // and a gentle decay toward the background so nothing burns in.
  vec3 col = mix(prev * .97, field + grain, .12 + u_bass * .08);
  col = mix(u_bg, col, smoothstep(1.1, .2, r));

  // Vignette keeps the centre clear for text.
  float vig = smoothstep(1.3, .45, r);
  col *= vig;

  o = vec4(clamp(col, 0., 1.), 1.);
}`;

  onMount(() => {
    if (reduced()) return;
    const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    // Two textures ping-pong as the feedback buffer.
    const makeTex = () => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const texA = makeTex();
    const texB = makeTex();
    const fbo = gl.createFramebuffer();

    const uPrev = gl.getUniformLocation(prog, "u_prev");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uBass = gl.getUniformLocation(prog, "u_bass");
    const uMid = gl.getUniformLocation(prog, "u_mid");
    const uA = gl.getUniformLocation(prog, "u_a");
    const uB = gl.getUniformLocation(prog, "u_b");
    const uBg = gl.getUniformLocation(prog, "u_bg");
    const uRes = gl.getUniformLocation(prog, "u_res");

    let readTex = texA;
    let writeTex = texB;
    let raf = 0;
    let visible = false;
    let t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        for (const t of [texA, texB]) {
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
      }
    };

    const frame = () => {
      raf = 0;
      if (!visible) return;
      resize();
      const s = skin();
      const { clock, now, idle } = where();
      const beat = clock.stepDur * 4;
      const phase = (((now - clock.time) % beat) + beat) % beat;
      const pulse = idle ? 0 : Math.exp((-phase / beat) * 5);
      const bass = idle ? 0.05 : 0.15 + pulse * 0.6;
      const mid = idle ? 0.05 : 0.1 + pulse * 0.35;
      const a = rgb(s.tokens.accent);
      const b = rgb(s.tokens.accent2);
      const bg = rgb(s.tokens.bg);

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, writeTex, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, readTex);
      gl.uniform1i(uPrev, 0);
      gl.uniform1f(uTime, (performance.now() - t0) * 0.001);
      gl.uniform1f(uBass, bass);
      gl.uniform1f(uMid, mid);
      gl.uniform3fv(uA, a);
      gl.uniform3fv(uB, b);
      gl.uniform3fv(uBg, bg);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Copy the result back to the screen.
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, writeTex);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      [readTex, writeTex] = [writeTex, readTex];
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    }, { threshold: 0.05 });
    io.observe(canvas);

    const ro = new ResizeObserver(() => visible && !raf && (raf = requestAnimationFrame(frame)));
    ro.observe(canvas);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      gl.deleteTexture(texA);
      gl.deleteTexture(texB);
      gl.deleteFramebuffer(fbo);
    };
  });
</script>

<div class="backdrop" aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    opacity: 0.55;
    mask-image: radial-gradient(120% 90% at 50% 40%, black 20%, transparent 80%);
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  @media (prefers-reduced-motion: reduce) {
    .backdrop { display: none; }
  }
</style>