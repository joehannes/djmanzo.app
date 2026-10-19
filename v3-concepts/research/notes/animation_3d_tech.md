# Web animation, 3D and audio technology for a playful, guided 3D marketing site (status as of October 2026)

Context for the report writer: the current djmanzo website (`/home/user/djmanzo/website`) is Svelte 5 (`^5.57.2`) + three.js (`^0.186.1`) on `THREE.WebGLRenderer`, with a custom painterly full-screen pass written as a GLSL `THREE.ShaderMaterial` (`website/src/signal/world/painter.ts`, line ~197), a hand-rolled quality tier guess (`website/src/signal/world/quality.ts`), and a custom Web Audio engine (`website/src/lib/audio/engine.ts`). No GSAP, Theatre, Tone or Threlte dependency is present today. This matters most for the WebGPU question below: that painterly pass will not run under `WebGPURenderer` without a port.

Release dates below marked "(npm)" were read directly from the npm registry JSON on 2026-10-19 (`https://registry.npmjs.org/<package>`, `time[<version>]`), which is primary data.

## GSAP: version, licence terms, plugin capabilities, use with three.js, restrictions

### Takeaway
GSAP 3.15.0 (13 April 2026) is the current release, and every former Club plugin (SplitText, MorphSVG, DrawSVG, ScrollSmoother, Inertia, Physics2D, CustomWiggle/Bounce, GSDevTools, etc.) ships in the public `gsap` npm package under the free "Standard No Charge" licence, commercial use included. The only real restriction is a "Prohibited Uses" clause against building no-code visual animation builders that compete with Webflow, which does not touch a marketing website. It is not open source (not MIT/GPL), which is fine under the relaxed website licence rules.

### Cited Findings
- Latest `gsap` is **3.15.0, published 2026-04-13**; previous: 3.14.2 (2025-12-12), 3.14.0 (2025-12-08), 3.13.0 (2025-04-30, the "all free" release). npm licence field: "Standard 'no charge' license: https://gsap.com/standard-license" — [npm registry: gsap](https://registry.npmjs.org/gsap)
- The 3.15.0 package README: "Thanks to Webflow, GSAP is now 100% FREE including ALL of the bonus plugins like SplitText, MorphSVG, and all the others that were exclusively available to Club GSAP members ... even for commercial use" — [gsap@3.15.0 README](https://unpkg.com/gsap@3.15.0/README.md); [Webflow blog: GSAP becomes free](https://webflow.com/blog/gsap-becomes-free)
- The 3.15.0 npm tarball contains these plugin files directly: CustomBounce, CustomEase, CustomWiggle, Draggable, DrawSVGPlugin, EaselPlugin, EasePack, Flip, GSDevTools, InertiaPlugin, MorphSVGPlugin, MotionPathHelper, MotionPathPlugin, Observer, Physics2DPlugin, PhysicsPropsPlugin, PixiPlugin, ScrambleTextPlugin, ScrollSmoother, ScrollToPlugin, ScrollTrigger, SplitText, TextPlugin — [unpkg file listing gsap@3.15.0](https://unpkg.com/gsap@3.15.0/?meta)
- Licence "Prohibited Uses": "any implementation and/or use of GSAP Products in tools that allow users to build visual animations without code that encourages, induces, or materially assists in creating a solution that competes with Webflow's visual animation building capabilities"; "Permitted Uses" covers use "on any website, web application, or digital interface by any person or entity" — [GSAP Standard License (community mirror)](https://gsap.com/community/standard-license/); [ScanCode LicenseDB: gsap-standard-no-charge-2025](https://scancode-licensedb.aboutcode.org/gsap-standard-no-charge-2025.html)
- Webflow's licence FAQ says AI-generated code is not a Prohibited Use and that commercial usage is covered — [GSAP Standard License](https://gsap.com/community/standard-license/)
- Community criticism: Pinegrow's forum calls the Prohibited Uses definition "intentionally vague", a grey zone for visual-builder vendors (not for site builders) — [Pinegrow forum](https://forum.pinegrow.com/t/gsap-has-been-acquired-by-webflow/9906)
- Note: gsap.com itself returned a bot-check page to automated fetches on 2026-10-19, so licence wording above is from mirrors; the mirrors agree with each other — [gsap.com/standard-license](https://gsap.com/standard-license/)
- Capabilities (official docs pages, linked from the 3.15 README): ScrollTrigger (scroll-linked/scrubbed/pinned timelines, the de facto standard for scroll storytelling) and companion ScrollSmoother (smooth native-scroll wrapper) — [ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [ScrollSmoother docs](https://gsap.com/docs/v3/Plugins/ScrollSmoother/); Flip (FLIP layout transitions between DOM states) — [Flip docs](https://gsap.com/docs/v3/Plugins/Flip/); MorphSVG (path morphing) — [MorphSVG docs](https://gsap.com/docs/v3/Plugins/MorphSVGPlugin); SplitText (split into chars/words/lines for staggered text) — [SplitText docs](https://gsap.com/docs/v3/Plugins/SplitText); MotionPath (animate along SVG/bezier paths, including arbitrary objects) — [MotionPath docs](https://gsap.com/docs/v3/Plugins/MotionPathPlugin); Observer (unified wheel/touch/pointer intent detection, for "swipe to next chapter" sites) — [Observer docs](https://gsap.com/docs/v3/Plugins/Observer/); `gsap.matchMedia()` for responsive and reduced-motion branches — [matchMedia docs](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()); eases incl. CustomEase/Wiggle/Bounce — [Eases docs](https://gsap.com/docs/v3/Eases)
- GSAP's core "can animate almost anything including CSS and attributes ... generic objects ... WebGL" — i.e. it tweens plain JS numbers such as `camera.position`, `material.uniforms.uX.value` — [gsap README](https://unpkg.com/gsap@3.15.0/README.md)

### Inferences
- For three.js, GSAP is the pragmatic camera-choreography tool: a ScrollTrigger-scrubbed master timeline that tweens camera position/target, uniforms (e.g. painterly brush strength), and DOM copy in one timeline. No adapter is needed; tween the objects directly and call render from the existing loop.
- Because GSAP is proprietary-but-free and owned by Webflow, there is a small long-term licence-change risk (Webflow could revise terms for future versions); pinning a version mitigates it.
- `gsap.matchMedia("(prefers-reduced-motion: reduce)")` is the cleanest way to swap scrubbed camera flights for cuts/fades.

### Gaps
- Could not fetch gsap.com directly (bot check), so I did not confirm the exact effective date printed on the current licence page or 3.15.0 release notes/changelog content.
- No measured bundle sizes for each plugin were collected.

## Theatre.js: maintenance in 2026, licences, integration, and alternatives for keyframed camera choreography

### Takeaway
Theatre.js is effectively frozen in public: the last npm release is 0.7.2 (19 May 2024), the official releases page still lists v0.7.0 (August 2023) as latest, and the README has for years said development moved to a private repo with "1.0 around the corner". Core is Apache-2.0 and only core ships in the bundle; studio is AGPL-3.0 (acceptable here, but it is the editor, not the runtime). It is usable for a one-off authored camera sequence, but it is a dependency risk; GSAP timelines or Blender-baked glTF camera animation are the safer choreography paths.

### Cited Findings
- `@theatre/core` 0.7.2 published **2024-05-19**, licence Apache-2.0; `@theatre/studio` 0.7.2 same date, licence **AGPL-3.0-only**; `@theatre/r3f` 0.7.2 Apache-2.0. Registry "modified" date is also 2024-05-19 (no newer publish of any tag) — [npm: @theatre/core](https://registry.npmjs.org/@theatre/core), [npm: @theatre/studio](https://registry.npmjs.org/@theatre/studio), [npm: @theatre/r3f](https://registry.npmjs.org/@theatre/r3f)
- README (current): "Theatre.js 1.0 is around the corner." / "We have _temporarily_ moved development to a private repo so we can iterate faster." / "We'll push our work back to this public repo soon." / "Terms and license will remain OSS, as before." — [GitHub theatre-js/theatre](https://github.com/theatre-js/theatre)
- README licence split: "Theatre's core (`@theatre/core`) is released under the Apache License." "The studio (`@theatre/studio`) is released under the AGPL 3.0 License." "Your project's final bundle only includes `@theatre/core`, so only the Apache License applies." — [GitHub theatre-js/theatre](https://github.com/theatre-js/theatre)
- Official releases page lists v0.7.0 (10 Aug 2023) as latest; no 1.0 or roadmap — [theatrejs.com releases](https://www.theatrejs.com/docs/latest/releases) (note: npm has 0.7.1/0.7.2 patches from 2024 that the page does not list)
- Company profiles: seed round Dec 2021 (OSS Capital), about 2 employees as of mid-2026; no newer funding — [Tracxn](https://tracxn.com/d/companies/theatrejs/__A3D8hIbBIofzMViuAKc0Ou2A7GmGNL-3NgV7kUF4jlg); [PitchBook](https://pitchbook.com/profiles/company/489454-30)
- A July 2026 blog claiming Theatre is "approaching 1.0" and "used in production by multiple teams" appears to restate the old README; low authority — [brightcoding blog](https://converter.brightcoding.dev/blog/theatrejs-why-pro-animators-ditch-css-for-this-secret-weapon)
- Integration: 0.7.0 added three.js r155 support for `@theatre/r3f`; r3f integration is React-only; vanilla use is via `@theatre/core` sheets/objects whose values you apply to three.js objects yourself — [theatrejs.com releases](https://www.theatrejs.com/docs/latest/releases)
- Do not confuse with the unrelated "theatrejs" GitHub org (a 2D pixel-art game engine, active June 2026) — [GitHub theatrejs org](https://github.com/theatrejs)
- Alternatives:
  - Motion (formerly Framer Motion / Motion One) `motion` 14.4.0 published 2026-10-19, MIT — [npm: motion](https://registry.npmjs.org/motion)
  - Rive state machines (2D, see next section) — [Rive docs](https://rive.app/docs/runtimes/rive-events)
  - GSAP timelines (above).
  - Blender-baked glTF animation: three.js `AnimationMixer` plays glTF clips including camera node animation (general three.js capability; see glTF pipeline below).

### Inferences
- With a Svelte stack, `@theatre/r3f` is irrelevant; vanilla Theatre would mean shipping `@theatre/core` and only loading `@theatre/studio` in dev. That is workable, but the project has no visible public maintenance since May 2024 and no tested compatibility with three r18x/WebGPURenderer, so treat it as "use only if a designer insists on its timeline editor".
- Best-fit choreography for this site: author the hero camera flight in Blender (camera + empties, baked to glTF, meshopt-compressed), play it via `AnimationMixer` and drive `mixer.setTime(progress * duration)` from a GSAP ScrollTrigger scrub. This gives a designer-friendly keyframe editor (Blender) with zero runtime dependency risk, and GSAP handles the DOM/UI side.
- GSAP's GSDevTools (now free) offers a scrubbable timeline UI for debugging, which covers part of what Theatre studio offered.

### Gaps
- Could not access GitHub API/commit history from this environment (session not bound to that repo), so the date of the last public commit on theatre-js/theatre is unverified; release data is from npm.
- No confirmed 2026 statement from the Theatre.js team was found.

## three.js in 2026 (WebGPURenderer, TSL, browser WebGPU support, post-processing), framework bindings, alternative engines, Spline, gaussian splats

### Takeaway
three.js r186 (0.186.0 on 8 Sep 2026, patch 0.186.1 on 24 Sep 2026) is current; WebGPURenderer with TSL and automatic WebGL 2 fallback is the recommended path for new work, and WebGPU now ships by default in Chrome/Edge, Chrome Android, Safari 26 (macOS/iOS) and Firefox on Windows/Apple Silicon. But WebGPURenderer runs no GLSL `ShaderMaterial`/`onBeforeCompile`/`EffectComposer`/pmndrs `postprocessing` on either backend, so the existing painterly pass must be ported to a TSL `RenderPipeline` node before switching. Threlte 8 (Svelte 5) is healthy; Babylon.js and PlayCanvas are strong but would be a rewrite; Needle needs a paid licence; Spark 2.x is the leading MIT gaussian-splat renderer for three.js.

### Cited Findings
**three.js releases and WebGPURenderer**
- `three` 0.186.0 published 2026-09-08; 0.186.1 published 2026-09-24 (latest); 0.183.0 2026-02-18; 0.171.0 2024-11-29; MIT — [npm: three](https://registry.npmjs.org/three); [GitHub releases](https://github.com/mrdoob/three.js/releases)
- 2026 cadence: r183 (18 Feb), r184 (16 Apr), r185 (25 Jun, patch 1 Jul), r186 (8 Sep); "every 8–11 weeks" — [Utsubo: What's new in three.js 2026 (updated 24 Sep 2026)](https://www.utsubo.com/blog/threejs-2026-what-changed)
- r186: WebGPURenderer `compileComputeAsync()`, `DirectRenderPipeline`, MSAA for WebXR WebGPU, async `dispose()`; SunLight with cascaded shadow maps; `PCFSoftShadowMap` removed — [three.js r186 release](https://github.com/mrdoob/three.js/releases)
- r185: WebXR on WebGPURenderer, render-to-texture-arrays, WGSL diagnostics surfaced; r184: TSL/node materials compatibility layer on WebGLRenderer; r183: `PostProcessing` renamed `RenderPipeline` (old name warns), `Clock` deprecated for `Timer` — [GitHub releases](https://github.com/mrdoob/three.js/releases); [Utsubo 2026](https://www.utsubo.com/blog/threejs-2026-what-changed)
- r186 also adds a gaussian splatting addon per Utsubo (not independently verified in release notes) — [Utsubo 2026](https://www.utsubo.com/blog/threejs-2026-what-changed)
- WebGPURenderer "supports none of" `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile` "on either backend"; `EffectComposer` and pmndrs/postprocessing do not run on WebGPURenderer; port path is TSL node materials and `RenderPipeline`, with an official GLSL-to-TSL transpiler example as a starting point — [Utsubo: WebGPU + three.js migration guide (updated 24 Sep 2026, checked against r186)](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- Nuance/contradiction: three r186 does export `glslFn` and `wgslFn` native code nodes (`src/nodes/code/FunctionNode.js`, `language: 'js'|'wgsl'|'glsl'`), so raw shader snippets can be embedded in TSL, but a `glslFn` only compiles on the GLSL (WebGL 2) backend and a `wgslFn` only on WebGPU — [three@0.186.1 FunctionNode.js](https://unpkg.com/three@0.186.1/src/nodes/code/FunctionNode.js). The migration guide's "no GLSL escape hatch" is true for portable code.
- Migration pitfalls listed: `render()` before `init()` throws in r186; node-material colours can look brighter (output colour transform); WebGL 2 fallback lacks workgroup memory, storage textures, indirect draws; WebGPU needs a secure context; importing WebGLRenderer alongside `three/webgpu` grew a test bundle 220 KB to 307 KB gzipped — [Utsubo migration guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- Performance: WebGPU helps most with many draw calls and GPU compute, "but not in every scene"; a forum case where WebGPURenderer was slower than WebGLRenderer is cited — [Utsubo 2026](https://www.utsubo.com/blog/threejs-2026-what-changed)
- pmndrs `postprocessing` 6.39.5 (2026-09-09, Zlib) remains WebGL-only — [npm: postprocessing](https://registry.npmjs.org/postprocessing); [Utsubo migration guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)

**WebGPU browser support (October 2026)**
- caniuse (caniuse-db 1.0.30001816): Chrome 113+ yes (Linux depends on hardware/drivers); Edge 113+ yes; Safari 26.0+ (Safari 27.x marked partial: "only enabled by default on macOS 26 Tahoe or later"); iOS Safari 26.0+ yes; Chrome Android yes; Samsung Internet 24+ yes; Firefox 141+ partial ("only enabled by default on Windows as well as macOS 26 Tahoe or later on Apple Silicon"); Firefox Android: no (flag only) — [caniuse: WebGPU](https://caniuse.com/webgpu) (data read from [caniuse-db webgpu.json](https://unpkg.com/caniuse-db/features-json/webgpu.json))
- web-features 3.43.0 (the data behind webstatus.dev): WebGPU is **not Baseline** (missing Firefox) — [webstatus.dev WebGPU](https://webstatus.dev/features/webgpu); data from [web-features](https://unpkg.com/web-features/data.json)
- Migration guide (Sep 2026): Chrome Android since 121 on Android 12+; Firefox Intel Macs/Linux/Android not in stable; "caniuse puts support at about 87% (August 2026 data)" — [Utsubo migration guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- Contradiction: a commentary piece claims WebGPU "hit Baseline in every major browser" in 2026 — [vr.org](https://vr.org/articles/webgpu-baseline-2026-three-js-webxr-default); contradicted by caniuse and web-features data above (Firefox partial, Firefox Android absent). Another blog's "~95%" coverage figure is also unsupported.

**Svelte / React bindings**
- Threlte: `@threlte/core` 8.6.1 (2026-09-24), `@threlte/extras` 9.22.2 (2026-10-16), MIT; Threlte 8.0.0 (the Svelte 5 rewrite) shipped 2025-01-20 — [npm: @threlte/core](https://registry.npmjs.org/@threlte/core), [npm: @threlte/extras](https://registry.npmjs.org/@threlte/extras)
- React Three Fiber 9.8.2 (2026-10-14), Drei 10.7.9 (2026-09-25), MIT — [npm: @react-three/fiber](https://registry.npmjs.org/@react-three/fiber), [npm: @react-three/drei](https://registry.npmjs.org/@react-three/drei)
- WebGPU caveats in the R3F ecosystem: Drei `Text` (troika) crashed the WebGPU render pass in one test; `Environment` with children rendered no reflections on WebGL 2 fallback — [Utsubo migration guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)

**Alternative engines**
- Babylon.js `@babylonjs/core` 9.31.0 (2026-10-15), Apache-2.0 — [npm](https://registry.npmjs.org/@babylonjs/core)
- PlayCanvas engine 2.23.3 (2026-10-15), MIT — [npm](https://registry.npmjs.org/playcanvas)
- Needle Engine: stable 5.1.16 (2026-10-14), 6.0.0-alpha.7 (2026-10-12); npm has no OSI licence field; free only for evaluation (7 days), personal/education and non-commercial with Needle branding visible; any paid/commercial work needs a per-seat Pro subscription; Enterprise suggested at 5+ seats or EUR 5M+ revenue — [npm: @needle-tools/engine](https://registry.npmjs.org/@needle-tools/engine); [Needle EULA](https://needle.tools/eula); [Needle FAQ: commercial use](https://cloud.needle.tools/faq/can-i-use-needle-engine-for-commercial-projects)
- Spline: `@splinetool/runtime` 2.0.95 published 2026-10-19 (very active), no licence field in package.json — [npm](https://registry.npmjs.org/@splinetool/runtime). Aggregators say code export targets React/three.js/Spline runtime, watermark removal and code/self-hosted export need paid tiers, prices conflict ($12–$25/month), and a pricing change was reported 7 Sep 2026; official pricing page not verified — [PricingSaaS](https://pricingsaas.com/companies/spline); [CostBench changelog](https://costbench.com/changelog/spline-plan-added-2026-09/)

**Gaussian splats**
- Spark (World Labs): `@sparkjsdev/spark` 2.3.1 (2026-10-01), **MIT** per npm (resolves a disputed "not open source" claim on a product-listing site) — [npm: @sparkjsdev/spark](https://registry.npmjs.org/@sparkjsdev/spark); dispute at [hunted.space](https://www.hunted.space/product/marble-by-world-labs)
- Spark 2.0 (April 2026): three.js splat renderer on WebGL2 with LoD, streamable format, memory paging; fixed splat budgets reported as ~500K on phone / ~2.5M on desktop; traversal in Rust/WASM in a Web Worker — [Radiance Fields: Spark 2.0](https://radiancefields.com/world-labs-releases-spark-v2.0)
- Spark 2.2.0: faster experimental LoD traversal, all decoders in Rust, "up to 14%" FPS and ~20% faster sorting — [Radiance Fields: Spark 2.2.0](https://radiancefields.com/spark-v2.2.0-adds-faster-lod-traversal-rust-decoders)
- Luma: `@lumaai/luma-web` last version 0.2.2 published 2024-03-06 (stale) — [npm: @lumaai/luma-web](https://registry.npmjs.org/@lumaai/luma-web)

### Inferences
- The migration to WebGPURenderer is the single biggest technical decision. Since the painterly look is the brand, porting it to TSL is mandatory before switching; the payoff (compute particles, Forward+ lighting) is real but not needed for a stylised scene. A reasonable plan: stay on WebGLRenderer for v3 launch, port the painter to TSL in a branch (the r184 compatibility layer means TSL node materials can also run on WebGLRenderer), then flip renderers once visuals match.
- Threlte is the natural fit for Svelte 5, but the existing site drives three.js imperatively from an engine class; adopting Threlte is optional, worthwhile only for component-level scenes (product stations), not required for GSAP/Rive/Tone integration.
- Babylon/PlayCanvas would discard the custom engine and painter, conflicting with the directive to enhance rather than rewrite. Needle's licensing and Spline's paid export add cost and lock-in for little gain.
- Spark splats suit a single photoreal "real DJ booth" moment, but splats will clash with a painterly pass unless also run through it; budget ~500K splats on mobile per Spark's own figures.

### Gaps
- No primary three.js-team statement on WebGPURenderer "production readiness" was fetched (only release notes and a studio's blog); forum threads were not read.
- Threlte's WebGPU support status (e.g. `<Canvas>` with `WebGPURenderer`) was not verified.
- Spline's official pricing page and licence terms for the runtime were not reached.

## 2D/vector animation: Rive, Lottie/dotLottie, CSS View Transitions, scroll-driven CSS animations

### Takeaway
Rive is the strongest choice for interactive 2D characters/UI (state machines, Data Binding, audio events) with MIT runtimes updated weekly, but production files without a splash screen need a paid Cadet plan ($9/seat/month). dotLottie is the maintained Lottie path (lottie-web itself is slowing). Same-document View Transitions are Baseline (since Oct 2025); cross-document View Transitions and CSS scroll-driven animations work in Chromium and Safari 26 but not Firefox, so they must be progressive enhancement.

### Cited Findings
- `@rive-app/canvas` and `@rive-app/webgl2` 2.45.0 published 2026-10-17, MIT — [npm: @rive-app/canvas](https://registry.npmjs.org/@rive-app/canvas), [npm: @rive-app/webgl2](https://registry.npmjs.org/@rive-app/webgl2)
- Rive plans: Free $0 (editor, 3 files, exports carry a splash screen); Cadet $9/seat/month (removes splash, unlimited files, max 3 seats); Voyager $32; Enterprise $120 for orgs with $10M+ revenue — [Rive pricing](https://rive.app/pricing)
- Rive Events are now legacy; "For new projects: Use Data Binding instead"; Events were extended with Audio Events — [Rive web runtime: Rive events](https://rive.app/docs/runtimes/web/rive-events.md)
- Rive audio: MP3/WAV/FLAC assets, triggered by timeline keyframes, transitions or listeners; "ideal for triggering shorter sounds", longer music/voiceover should use Scripting with AudioSound/AudioSource — [Rive audio events](https://rive.app/docs/editor/events/audio-events)
- `lottie-web` 5.13.0, last published 2025-05-21, MIT; `@lottiefiles/dotlottie-web` 0.81.0 published 2026-10-06, MIT — [npm: lottie-web](https://registry.npmjs.org/lottie-web), [npm: dotlottie-web](https://registry.npmjs.org/@lottiefiles/dotlottie-web)
- View Transitions (same-document): Baseline "low" since 2025-10-14 (Chrome 111, Firefox 144, Safari 18) — [web-features via webstatus.dev](https://webstatus.dev/features/view-transitions); [caniuse](https://caniuse.com/view-transitions)
- Cross-document View Transitions: Chrome/Edge 126+, Safari 18.2+, iOS 18.2+, Chrome Android yes; Firefox 144+ and Firefox Android 157 only partial ("only supporting View Transitions Level 1", i.e. no cross-document); Samsung Internet no; not Baseline — [caniuse: cross-document view transitions](https://caniuse.com/cross-document-view-transitions); [webstatus.dev](https://webstatus.dev/features/cross-document-view-transitions)
- Navigation API became Baseline 2026-01-13 (Firefox 147, Safari 26.2) — [webstatus.dev: navigation](https://webstatus.dev/features/navigation)
- CSS scroll-driven animations: Chrome/Edge 115+, Safari 26 / iOS 26; no Firefox; not Baseline — [webstatus.dev: scroll-driven-animations](https://webstatus.dev/features/scroll-driven-animations)

### Inferences
- The site is a Worker serving server-rendered path URLs (per the task list), so cross-document View Transitions (`@view-transition { navigation: auto; }`) are a cheap enhancement between pages in Chromium/Safari, degrading to normal navigations in Firefox. Within the 3D world, same-document transitions are universally safe.
- Use CSS scroll-driven animations only for decorative flourishes; GSAP ScrollTrigger remains necessary for anything that must sync with the WebGL camera across all browsers.
- Rive is ideal for a guide/mascot (the "Claude guide" or a DJ character) with state-machine reactions to scroll and clicks; cost is trivial (Cadet), and the runtime can render into a canvas layered over three.js. Its audio should be limited to short UI sounds routed separately from the music engine.

### Gaps
- Did not confirm whether Rive audio playback in the web runtime respects an externally created AudioContext (for unified volume/mute with the site's music engine).
- No first-party benchmark comparing Rive vs dotLottie runtime cost was found.

## Audio on the web: Tone.js, Web Audio API, Meyda, Howler; adaptive stem music; autoplay

### Takeaway
The Web Audio API and AudioWorklet are Baseline "high" and sufficient; the existing custom engine is a sound base. Tone.js is maintained (prereleases to 15.5.57 in October 2026) but its "latest" stable tag is 15.1.22 from April 2025; Howler (2023) and Meyda (2024) are effectively dormant. Adaptive stem music (vertical layering plus horizontal re-sequencing) is straightforward with sample-accurate `AudioBufferSourceNode.start(when)` scheduling. All audible output must wait for a user gesture; `navigator.getAutoplayPolicy()` can detect this where supported.

### Cited Findings
- Web Audio API: Baseline high since 2021-04-26; AudioWorklet: Baseline high since 2021-04-26 (Safari 14.1) — [webstatus.dev: web-audio](https://webstatus.dev/features/web-audio); [webstatus.dev: audio-worklet](https://webstatus.dev/features/audio-worklet)
- `tone`: latest tag 15.1.22 published 2025-04-27; `next` tag 15.5.57 published 2026-10-04; MIT — [npm: tone](https://registry.npmjs.org/tone)
- `howler` 2.2.4 last published 2023-09-19, MIT — [npm: howler](https://registry.npmjs.org/howler)
- `meyda` (audio feature extraction) 5.6.3 last published 2024-04-21, MIT — [npm: meyda](https://registry.npmjs.org/meyda)
- Adaptive music techniques: vertical layering = stems on a shared timeline mixed by intensity; horizontal re-sequencing = changing arrangement over time — [bugnet.io](https://bugnet.io/blog/adaptive-music-a-beginners-guide); [IRPR Sound glossary](https://sounddesign.irpr.agency/glossary/horizontal-resequencing/)
- Combined systems use sections for structure and layer density for intensity; on the web, schedule segment starts/ends at matching times to avoid gaps — [abratabia: adaptive music](https://abratabia.com/ai-game-audio/adaptive-music.php)
- Autoplay: audible media and Web Audio output are blocked until user interaction unless muted, allowlisted by engagement, or granted by Permissions Policy; Firefox's `media.autoplay.block-webaudio` defaults to true (needs sticky activation); `navigator.getAutoplayPolicy("audiocontext")` returns `allowed`/`allowed-muted`/`disallowed`; no change event, check once at load; Firefox delays autoplay in background tabs — [MDN: Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)

### Inferences
- Keep the existing Web Audio engine; add a small stem scheduler (all stems decoded, started at the same `ctx.currentTime + lookahead`, gain-ramped per scene) rather than adopting Tone.js wholesale. Tone.js is worth it only if the site needs musical-time features (Transport, quantised scene changes on bar lines, synths); if so, pin to a 15.x release and note its stable tag is 18 months old.
- Analysis for visual reactivity needs only `AnalyserNode` (FFT/RMS); Meyda adds spectral features but is dormant.
- For a guided experience, a deliberate "enter with sound" gate is both policy-compliant and a good onboarding beat; detect with `getAutoplayPolicy` where available, else attempt `ctx.resume()` in the first pointer/keydown handler.
- Stems should be Opus/WebM with AAC fallback for older Safari; served from Workers static assets/R2 with long cache headers.

### Gaps
- No 2026 production case study of stem-based adaptive music on a marketing site was found; examples are game-audio guides.
- `getAutoplayPolicy()` browser support (historically Firefox-only) was not verified for 2026.
- Did not verify what changed in Tone 15.5.x prereleases.

## Physics and characters: Rapier, cannon-es, Mixamo, Quaternius, Ready Player Me

### Takeaway
Rapier (0.21.0, September 2026, Apache-2.0) is the maintained WASM physics choice; cannon-es has not released since August 2022. For characters, Quaternius's CC0 Universal Animation Library (UAL 1 and UAL 2, January 2026) is the cleanest licence; Mixamo is free and royalty-free but in maintenance mode, with a no-redistribution-of-raw-files clause; Ready Player Me's public service shut down on 31 January 2026 after Netflix acquired it.

### Cited Findings
- `@dimforge/rapier3d` and `@dimforge/rapier3d-compat` 0.21.0 published 2026-09-25, Apache-2.0 — [npm: rapier3d-compat](https://registry.npmjs.org/@dimforge/rapier3d-compat)
- `cannon-es` 0.20.0, last published 2022-08-12, MIT — [npm: cannon-es](https://registry.npmjs.org/cannon-es)
- WebAssembly and WASM threads are universally supported (Safari 14.1+/iOS 14.5+ for threads) — [caniuse: wasm-threads](https://caniuse.com/wasm-threads)
- Mixamo: royalty-free for commercial and non-commercial use; no redistribution of raw character/animation files (e.g. selling asset packs); original Adobe FAQ (Sept 2022) framed terms as a "limited technology preview"; described in 2026 as unmaintained / maintenance mode — [Adobe community Mixamo FAQ](https://community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/m-p/13234775); [Cinevva guide 2026](https://app.cinevva.com/guides/free-character-animations-rigging)
- Quaternius Universal Animation Library: 120+ animations on a shared humanoid rig, OBJ/FBX/glTF, CC0; free Standard version contains a subset (45 per OpenGameArt) and the full Source (.blend) is paid — [Quaternius UAL](https://quaternius.com/packs/universalanimationlibrary.html); [OpenGameArt UAL](https://opengameart.org/content/universal-animation-library)
- UAL 2 listed January 2026: 130+ CC0 animations — [OpenGameArt UAL 2](https://opengameart.org/content/universal-animation-library-2)
- Ready Player Me: acquired by Netflix (Dec 2025, undisclosed fee, ~20 staff joined); hosted avatar creator, PlayerZero and public APIs went offline 31 Jan 2026; no public successor — [PocketGamer.biz](https://www.pocketgamer.biz/netflix-acquires-avatar-creation-platform-ready-player-me); [Genies blog (competitor, caution)](https://genies.com/blog/ready-player-me-shutdown); one source gives 30 Jan — [Ryan Schultz](https://ryanschultz.com/tag/ready-player-me/)

### Inferences
- A marketing site rarely needs a full physics engine; Rapier is worth its ~1–2 MB WASM only for genuinely physical toys (throwable records, bouncing pads). Lazy-load it on the scene that needs it; otherwise use GSAP Physics2D/Inertia for faux physics on DOM/2D.
- Characters: Quaternius CC0 rig + UAL clips retargeted in Blender, exported to glTF with meshopt, is licence-clean and fits a stylised/painterly look. Do not build on Ready Player Me.

### Gaps
- Exact Rapier WASM bundle size for 0.21 not measured.
- Current official Adobe Mixamo terms page was not retrieved; terms are from a 2022 FAQ plus 2026 secondary guides.

## Performance and accessibility patterns for heavy 3D marketing sites

### Takeaway
The established pipeline is glTF-Transform with meshopt (default; works with skinned/morph animation) or Draco (static meshes), KTX2/Basis textures capped at 1024–2048 px (512–1024 on mobile), lazy per-scene loading, GPU tiering, `prefers-reduced-motion` branches (Baseline high since 2020), and a non-WebGL fallback. `detect-gpu` still works but has not been published since February 2025, so its benchmark data is ageing.

### Cited Findings
- meshopt "often a strong default for web delivery"; Draco leaves animation tracks and morph targets uncompressed; size/speed comparisons between Draco and meshopt conflict across sources — [svilenkovic: meshopt](https://svilenkovic.com/3d/meshopt-compression); [svilenkovic: glTF best practices](https://svilenkovic.com/3d/gltf-best-practices)
- Textures are usually 80%+ of file size and all of VRAM; cap at 1024/2048 and encode KTX2; KTX2/Basis 512–1024 px on mobile; pipeline order: resize textures, quantize, compress geometry, simplify, prune/dedupe; `gltf-transform optimize` as a one-command pass — [Cinevva: optimize GLB for web](https://app.cinevva.com/guides/optimize-glb-for-web); [svilenkovic: GLB optimization](https://svilenkovic.com/3d/glb-optimization)
- Budget heuristics (community, not standards): "under 800KB total for hero scene assets"; Lighthouse mobile 85+ — [skills.sh asset-pipeline-3d](https://skills.sh/anthemflynn/ccmp/asset-pipeline-3d)
- `prefers-reduced-motion`: Baseline high since 2020-01-15 — [webstatus.dev](https://webstatus.dev/features/prefers-reduced-motion)
- OffscreenCanvas: Baseline high since 2023-03-27 (rendering in a worker is possible everywhere) — [webstatus.dev: offscreen-canvas](https://webstatus.dev/features/offscreen-canvas)
- Compression Streams: Baseline high since 2023 — [webstatus.dev: compression-streams](https://webstatus.dev/features/compression-streams)
- `detect-gpu` 5.0.70, last published 2025-02-23, MIT — [npm: detect-gpu](https://registry.npmjs.org/detect-gpu)
- WebGPU-specific: test the WebGL 2 fallback on a mid-range Android phone from the start — [threejsresources: WebGPU vs WebGL](https://threejsresources.com/webgpu/vs-webgl)
- Spark splat budgets: ~500K splats phone, ~2.5M desktop — [Radiance Fields](https://radiancefields.com/world-labs-releases-spark-v2.0)
- Lenis (smooth scroll commonly paired with GSAP) 1.3.27 published 2026-10-15, MIT — [npm: lenis](https://registry.npmjs.org/lenis)

### Inferences
- Keep the existing `quality.ts` tier guess and add a runtime frame-time governor (drop DPR/painter resolution when frame time exceeds budget), because detect-gpu's lookup tables will increasingly miss 2025–2026 GPUs.
- Reduced motion should replace camera flights with crossfades/cuts and stop parallax, not merely shorten durations; GSAP `matchMedia` and the CSS media query cover both layers.
- Fallback path: server-rendered HTML content per path (already in place for SEO) is the accessible baseline; the 3D world enhances it. WebGPU absence is handled by WebGPURenderer's WebGL 2 fallback; WebGL absence (rare) falls back to static art.
- Workers static assets serve `.glb`/`.ktx2`/`.webm` with immutable cache headers; meshopt/Draco/Basis decoders should be self-hosted, not CDN-fetched.

### Gaps
- No authoritative (Google/Khronos) published loading budget for 3D marketing sites was found; budgets above are community heuristics.
- No current measured comparison of meshopt vs Draco decode time from the meshoptimizer/Khronos docs was retrieved.
- Codrops tutorials and conference talks were not reviewed within the call budget.

## Recommended stack for v3 and its risks (synthesis of the above)

### Takeaway
Keep Svelte 5 + three.js r186 and the custom engine/painter; add GSAP 3.15 (ScrollTrigger, Observer, SplitText, Flip, matchMedia) as the single choreography layer; author camera flights in Blender and play them as glTF clips scrubbed by GSAP; add Rive for the guide character/UI micro-interactions; extend the existing Web Audio engine with a stem scheduler (Tone.js optional); use Rapier only where physics is the point; Quaternius CC0 for characters; glTF-Transform meshopt + KTX2 pipeline; View Transitions as progressive enhancement. Treat WebGPURenderer as a planned second step gated on a TSL port of the painterly pass. Skip Theatre.js, Needle, Spline-runtime and Ready Player Me.

### Cited Findings
- GSAP 3.15.0 free for commercial websites; Prohibited Uses only targets competing no-code builders — [npm: gsap](https://registry.npmjs.org/gsap); [GSAP Standard License](https://gsap.com/community/standard-license/)
- Theatre.js last published 2024-05-19; development private since years — [npm: @theatre/core](https://registry.npmjs.org/@theatre/core); [GitHub](https://github.com/theatre-js/theatre)
- WebGPURenderer does not run GLSL ShaderMaterial/EffectComposer; port to TSL/RenderPipeline required — [Utsubo migration guide](https://www.utsubo.com/blog/webgpu-threejs-migration-guide)
- WebGPU not Baseline (Firefox partial, Firefox Android none) — [caniuse: WebGPU](https://caniuse.com/webgpu)
- Rive runtimes MIT, splash-free export needs Cadet ($9/seat/month) — [npm: @rive-app/canvas](https://registry.npmjs.org/@rive-app/canvas); [Rive pricing](https://rive.app/pricing)
- Tone.js stable tag dates from 2025-04-27 — [npm: tone](https://registry.npmjs.org/tone)
- Rapier 0.21.0 (2026-09-25) vs cannon-es (2022) — [npm: rapier3d-compat](https://registry.npmjs.org/@dimforge/rapier3d-compat); [npm: cannon-es](https://registry.npmjs.org/cannon-es)
- Ready Player Me offline since 31 Jan 2026 — [PocketGamer.biz](https://www.pocketgamer.biz/netflix-acquires-avatar-creation-platform-ready-player-me)
- Needle commercial use requires paid Pro seats — [Needle EULA](https://needle.tools/eula)

### Inferences
- Risks, in order:
  1. **Painterly pass vs WebGPU**: the brand look is tied to GLSL on WebGLRenderer; switching renderers without a faithful TSL port would break it. Mitigation: port in a branch, screenshot-diff under Xvfb against the current build, switch only when visually matched.
  2. **GSAP licence governance**: free but proprietary and Webflow-controlled; pin the version; low risk for a website.
  3. **Mobile GPU performance**: painter + 3D + Rive canvas + audio analysis on mid-range Android; need a frame-time governor and an honest low tier.
  4. **Autoplay/audio onboarding**: no sound until gesture; the guided experience must make the "enter" gesture meaningful.
  5. **Progressive-enhancement features** (cross-document View Transitions, scroll-driven CSS) will not appear in Firefox; do not let core navigation depend on them.
  6. **Dormant dependencies**: detect-gpu, Howler, Meyda, lottie-web, Luma web, Theatre.js; avoid or isolate them.
  7. **Asset weight**: splats, stems and characters can blow budgets; load per scene, compress (meshopt/KTX2/Opus), and cache aggressively on Workers static assets.
- Nothing here can verify how the audio sounds or how animation feels on real devices; those require human testing on actual phones.

### Gaps
- No bundle-size measurements were taken for the recommended combination; these should be measured in the actual build.
- No direct test of GSAP + Rive + three.js in one Svelte page was performed.
