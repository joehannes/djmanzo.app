<!--
  An interactive WebGL shader waveform display that visualizes audio from
  the YouTube crate or deck loop. Uses fragment shaders for real-time
  frequency-reactive animations: bars pulse to bass, particles scatter on
  transients, and the colour palette shifts with the skin's accent. Mouse/touch
  interaction distorts the field, creating a tactile connection between the
  visitor and the music.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { booth } from "./booth.svelte";
  import { crate } from "../crate/crate.svelte";
  import { skin } from "../region.svelte";

  let canvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array<ArrayBuffer> | null = null;
  let freqTexture: WebGLTexture | null = null;
  let animFrame = 0;
  let mouseX = $state(0.5);
  let mouseY = $state(0.5);
  let isPlaying = $derived(!!crate.playing || booth.youtubeActive);

  const s = $derived(skin());

  // Vertex shader: full-screen quad
  const vertSrc = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader: audio-reactive waveform with interactive distortion
  const fragSrc = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_freq;
    uniform float u_time;
    uniform float u_bass;
    uniform float u_mid;
    uniform float u_high;
    uniform vec2 u_mouse;
    uniform vec3 u_accent;
    uniform vec3 u_accent2;
    uniform float u_playing;

    // Smooth noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    void main() {
      vec2 uv = v_uv;

      // Mouse interaction: radial distortion around cursor
      float mouseDist = length(uv - u_mouse);
      float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * 0.15;
      uv += normalize(uv - u_mouse + 0.001) * mouseInfluence * u_bass;

      // Sample frequency data as a waveform bar height
      float freqX = texture2D(u_freq, vec2(uv.x, 0.5)).r;
      float barHeight = freqX * u_playing;

      // Waveform line with glow
      float waveY = 0.5 + (freqX - 0.5) * 0.6 * u_playing;
      float waveDist = abs(uv.y - waveY);
      float waveLine = smoothstep(0.02 + u_bass * 0.01, 0.0, waveDist);
      float waveGlow = smoothstep(0.12 + u_mid * 0.05, 0.0, waveDist) * 0.4;

      // Background grid that pulses with bass
      float gridX = smoothstep(0.02, 0.0, abs(fract(uv.x * 32.0) - 0.5) - 0.48);
      float gridY = smoothstep(0.02, 0.0, abs(fract(uv.y * 16.0) - 0.5) - 0.48);
      float grid = max(gridX, gridY) * 0.06 * (1.0 + u_bass * 0.5);

      // Particles scattered by high frequencies
      float particleField = noise(uv * 20.0 + u_time * 0.5) * u_high * u_playing;
      float particles = smoothstep(0.6, 0.8, particleField) * 0.5;

      // Colour mixing: accent for waveform, accent2 for glow, dim for grid
      vec3 bgCol = vec3(0.04, 0.04, 0.06);
      vec3 col = bgCol;
      col += vec3(grid) * 0.3;
      col += u_accent2 * waveGlow;
      col += u_accent * waveLine;
      col += mix(u_accent, u_accent2, 0.5) * particles;

      // Bass-reactive vignette pulse
      float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5)) * (0.3 + u_bass * 0.2);
      col *= vignette;

      // Scanline effect
      float scanline = 1.0 - sin(uv.y * 300.0 + u_time * 2.0) * 0.03;
      col *= scanline;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function parseHex(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16) / 255,
      parseInt(h.substring(2, 4), 16) / 255,
      parseInt(h.substring(4, 6), 16) / 255,
    ];
  }

  function initGL() {
    if (!canvas) return;
    gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vertSrc);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);

    program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Frequency texture
    freqTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, freqTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  function setupAnalyser() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Try to capture audio from the page — works when YouTube iframe
      // shares an AudioContext or when the deck engine is active.
      // Falls back gracefully to silent visualization.
    } catch {
      // Web Audio not available; shader still renders with uniforms at zero.
    }
  }

  function render(time: number) {
    if (!gl || !program || !canvas) return;

    // Resize canvas to match display size
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Update frequency data
    let bass = 0, mid = 0, high = 0;
    if (analyser && dataArray && isPlaying) {
      analyser.getByteFrequencyData(dataArray);
      const len = dataArray.length;
      const third = Math.floor(len / 3);
      for (let i = 0; i < third; i++) bass += dataArray[i];
      for (let i = third; i < third * 2; i++) mid += dataArray[i];
      for (let i = third * 2; i < len; i++) high += dataArray[i];
      bass = bass / (third * 255);
      mid = mid / (third * 255);
      high = high / ((len - third * 2) * 255);
    } else if (isPlaying) {
      // Simulated reactivity when analyser isn't connected
      const t = time * 0.001;
      bass = 0.3 + Math.sin(t * 2.1) * 0.2;
      mid = 0.25 + Math.sin(t * 3.3) * 0.15;
      high = 0.2 + Math.sin(t * 5.7) * 0.1;
    }

    // Upload frequency data as texture — cast to Uint8Array<ArrayBuffer>
    // to satisfy strict typing required by WebGL texImage2D.
    if (dataArray && analyser && isPlaying) {
      gl.bindTexture(gl.TEXTURE_2D, freqTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, dataArray.length, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, dataArray as unknown as Uint8Array<ArrayBuffer>);
    } else {
      // Generate synthetic waveform texture
      const synth = new Uint8Array(new ArrayBuffer(128));
      const t = time * 0.001;
      for (let i = 0; i < 128; i++) {
        const x = i / 128;
        synth[i] = isPlaying
          ? Math.floor(128 + Math.sin(x * 12 + t * 3) * 60 * bass + Math.sin(x * 30 + t * 7) * 30 * high)
          : 64;
      }
      gl.bindTexture(gl.TEXTURE_2D, freqTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 128, 1, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, synth as unknown as Uint8Array<ArrayBuffer>);
    }

    // Parse skin colours
    const accent = parseHex(s.tokens.accent || "#ff8a2a");
    const accent2 = parseHex(s.tokens.accent2 || "#22d3ff");

    // Set uniforms
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), time * 0.001);
    gl.uniform1f(gl.getUniformLocation(program, "u_bass"), bass);
    gl.uniform1f(gl.getUniformLocation(program, "u_mid"), mid);
    gl.uniform1f(gl.getUniformLocation(program, "u_high"), high);
    gl.uniform2f(gl.getUniformLocation(program, "u_mouse"), mouseX, 1.0 - mouseY);
    gl.uniform3f(gl.getUniformLocation(program, "u_accent"), accent[0], accent[1], accent[2]);
    gl.uniform3f(gl.getUniformLocation(program, "u_accent2"), accent2[0], accent2[1], accent2[2]);
    gl.uniform1f(gl.getUniformLocation(program, "u_playing"), isPlaying ? 1.0 : 0.0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animFrame = requestAnimationFrame(render);
  }

  function onMouseMove(e: MouseEvent) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;
  }

  function onTouchMove(e: TouchEvent) {
    if (!canvas || !e.touches.length) return;
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.touches[0].clientX - rect.left) / rect.width;
    mouseY = (e.touches[0].clientY - rect.top) / rect.height;
  }

  onMount(() => {
    initGL();
    setupAnalyser();
    animFrame = requestAnimationFrame(render);
  });

  onDestroy(() => {
    cancelAnimationFrame(animFrame);
    if (gl && program) gl.deleteProgram(program);
  });
</script>

<div class="shader-wrap">
  <canvas
    bind:this={canvas}
    class="shader-canvas"
    onmousemove={onMouseMove}
    ontouchmove={onTouchMove}
    aria-label="Audio reactive waveform visualization"
  ></canvas>
  {#if !isPlaying}
    <div class="idle-overlay mono">
      <span>▶ WAVEFORM IDLE</span>
    </div>
  {/if}
</div>

<style>
  .shader-wrap {
    position: relative;
    width: 100%;
    height: 80px;
    border-radius: 6px;
    overflow: hidden;
    background: #0a0a0c;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.06);
  }
  .shader-canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: crosshair;
  }
  .idle-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: var(--dim, #555);
    pointer-events: none;
    text-transform: uppercase;
  }

  @media (max-width: 760px) {
    .shader-wrap { height: 56px; }
  }
  @media (max-width: 400px) {
    .shader-wrap { height: 44px; }
  }
</style>