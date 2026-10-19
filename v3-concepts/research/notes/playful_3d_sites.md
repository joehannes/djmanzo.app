# Playful, 3D-driven and interactive product/brand "experience" sites: inspiration for djmanzo website v3

Scope note: research done 2026-10-19 with about 30 search/fetch calls. Primary sources (studio case studies on Awwwards, the studio's own pages, NN/g) were preferred. Where only press or secondary coverage exists, that is said. Several requested examples (Teenage Engineering web pages, Nothing, Rabbit, Arc, Linear, Raycast, Figma Config, Spline sites, Patatap, Every Noise at Once, Endlesss, Splice, Native Instruments, Serato/rekordbox/djay, Nintendo eShop, Animal Crossing UI) could not be sourced within budget. They are listed under Gaps, not described from memory.

---

## 1. Which award-winning sites from 2023 to 2026 best combine playfulness, 3D and a clear story?

### Takeaway
The strongest recent winners are small, finishable worlds with one verb and one simple rule. In Messenger you deliver mail on a tiny planet. In Bruno Simon's 2025 portfolio you drive a car around an island. In Igloo Inc. you scroll past objects frozen in ice. Each keeps its world tightly scoped: room caps, a 15-minute length, three sections. Their weaknesses are load time, single-canvas accessibility, and "fun toy, poor website" criticism when the visitor has a task to do.

### Cited Findings

**Messenger by abeto (messenger.abeto.co). Awwwards SOTD 10 Nov 2025; Developer award.** Classed as current.
- **What it is.** A free browser game, described as "15-minute experimental" and built to test multiplayer tech. Calm and "slightly strange", inspired by the team's trips to Asia. Story: "just delivering messages", with no world-ending threat — [Awwwards case study, Jan 2026](https://www.awwwards.com/messenger.html)
- **Metaphor.** A tiny spherical planet you can walk all the way round to your starting point. It was built as an unwrapped cube and then made round, which made world design more efficient — [Awwwards case study](https://www.awwwards.com/messenger.html)
- **First 30 seconds and guidance.**
  - No tutorials; players learn at their own pace. Over-the-shoulder camera that follows automatically.
  - "No giant arrows pointing where to go." Sound guides you instead: a guitar-playing NPC gets louder and moves in 3D space as you approach.
  - Clothes and hair are randomised per player — [Awwwards case study](https://www.awwwards.com/messenger.html)
- **Multiplayer and social.**
  - Rooms are capped at 10 players per instance because more people "felt too crowded" and broke the calm.
  - No text chat. A 3D emoji system ("Follow me!", "Thanks!") avoids moderation and toxicity problems.
  - Players often guided each other to hidden delivery spots — [Awwwards case study](https://www.awwwards.com/messenger.html)
- **Audiovisual techniques.**
  - Deliberately imperfect, hand-drawn look with custom outlines (adjustable thickness, colour, transparency).
  - The soundtrack was composed alongside the game. Each area has its own soundscape: market noise, waves, factory machinery.
  - NPCs have speech bubbles and their own 3D sound — [Awwwards case study](https://www.awwwards.com/messenger.html)
- **Stack.** Three.js, three-mesh-bvh, Houdini, Blender and Substance; WebSocket multiplayer on Node.js; no game engine — [HN thread](https://news.ycombinator.com/item?id=45396441); [Wikipedia](https://en.wikipedia.org/wiki/Messenger_(video_game)). Released 25 Sep 2025, by Vicente Lucendo and Michael Sungaila — [Wikipedia](https://en.wikipedia.org/wiki/Messenger_(video_game))
- **Performance.**
  - UI built in WebGL; text generated with WebAssembly; custom 4-level LOD to reduce popping.
  - Playable with one finger on mobile. iPhone Safari is strict about memory, so assets are tracked, freed when unused, and compressed — [Awwwards case study](https://www.awwwards.com/messenger.html)
  - A third-party review reports about 5.7 MB initial load, capped at 17.5 MB total (not confirmed by the studio) — [bo3.gg](https://bo3.gg/games/articles/messenger-abeto-co-crafted-interactive-experiences-the-free-browser-game-you-can-finish-in-15-minutes)
- **Scores.** Usability 7.46 was its lowest SOTD score (Design 8.04, Creativity 8.23, Content 8.15). Dev scores: Accessibility 7.60, Animations 9.00, WPO 8.80. Highlighted elements: "Character Navigation", "NPCs", "Character Configuration" — [Awwwards SOTD](https://www.awwwards.com/sites/messenger)
- **What made it memorable.** It went viral, with "millions of impressions" and thousands of daily players months after launch. The team's highlight was non-gamer relatives playing without instructions — [Awwwards case study](https://www.awwwards.com/messenger.html)
- **What was hard.** A spherical world (camera, upright objects, central gravity); camera clipping in narrow alleys; performance on older phones; the story was written last, after many rejected ideas — [Awwwards case study](https://www.awwwards.com/messenger.html)
- **Award category is ambiguous.** A secondary roundup says Messenger won Developer Site of the Year 2025 — [Futurists](https://futurists.in/10-best-award-winning-websites-of-2026/). Awwwards listings show it alongside a SOTY 2025 label — [Awwwards SOTY list](https://www.awwwards.com/websites/sites_of_the_year/). Treat the exact category as unconfirmed.

**Bruno Simon portfolio, 2025 version (bruno-simon.com). Launched Dec 2025.** Classed as current.
- **What it is.** A sequel to his 2019 drive-a-red-car portfolio: "same core concept, but make it ten times better". A stylised, physics-driven island built in Blender and Three.js — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html). Announced as "6 years of thinking… 1 year of actually building it" — [X post](https://x.com/bruno_simon/status/1998361646939689235)
- **Navigation.**
  - He set out to "avoid traditional HTML UI as much as possible". Interface elements are 3D models, and clicks, scroll, keyboard and touch are recreated in 3D space.
  - Projects (client work, plus the "Lab" of experiments) live in the world.
  - Gamepad and touch are supported — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- **Techniques.**
  - Three.js WebGPU with TSL (shaders written in JavaScript); runs on WebGPU automatically where available.
  - About 78,400 single-triangle grass blades; SDF-textured leaves.
  - A day/night, season, rain, snow and lightning cycle shared by all visitors.
  - Spatialised sound; CC0 music by Kounine; intro sound made in GarageBand — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- **Light-touch multiplayer.**
  - "Whispers": flame-shaped short messages, capped at 30 active at once, moderated with OpenAI's free moderation model.
  - Shared counters (cookies, altar).
  - Daily circuit leaderboard (top 10).
  - Achievements (easy, hard, cryptic) unlock vehicle skins.
  - A fully shared physics world was dropped because of server cost and griefing risk — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html). The FWA describes racing others and shared weather — [FWA](https://thefwa.com/cases/brunos-portfolio)
- **Performance.** Instancing, frustum culling, merged geometry, a palette texture via UVs, ETC1S/UASTC textures, and DRACO. On mobile a lower preset turns off water blur and depth of field and shrinks shadow maps. His stated rationale: a 10 FPS experience loses visitors — [Awwwards case study](https://www.awwwards.com/brunos-portfolio-case-study.html). Open source under MIT — [HN thread](https://news.ycombinator.com/item?id=46206531)
- **Criticism (Hacker News).**
  - Long load with "no load progress indicator"; some closed the tab before seeing anything.
  - CPU "almost 100% all the time", attributed to a continuous render loop.
  - Mixed results across Firefox, Chrome and iOS; blank first loads fixed by reloading.
  - Long-press on iOS selected the whole screen.
  - Called "terrible as an actual home page" and said to "function poorly as a website". Defenders said it suits someone who sells a three.js course.
  - Some needed time to find the controls menu.
  - No commenter reported a non-3D or text fallback — [HN thread](https://news.ycombinator.com/item?id=46206531)

**Igloo Inc. by abeto with Bureaux. Awwwards Site of the Year and Developer SOTY (announced Mar 2025).** Classed as current.
- **Awards.** Both SOTY and Developer SOTY are confirmed by the studio — [abeto on X](https://x.com/abeto_co/status/1900152588768579701)
- **Metaphor.** Ice. Each portfolio company is an object "encased in ice", and each ice block is unique because identical blocks looked "too similar to each other when scrolling past". Tech elements were added to the opening so an outdoor scene would not clash with the future-forward tone — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html)
- **Journey.**
  - A real-time in-engine intro that "flows seamlessly" into the rest.
  - A three-section scroll landing page.
  - The links section uses a particle simulation that re-forms into a model for each external link.
  - Scene transitions combine chromatic aberration, tech displacement and frost.
  - UI in WebGL with shader glitches and SDF text scrambles.
  - Music and SFX by Bureaux, synced to particle movement — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html)
- **Performance.**
  - The intro is rendered in real time rather than pre-rendered, to save weight.
  - A custom VDB exporter produces volume data "smaller than a typical website image".
  - Procedural ice blocks; shaders compiled during load and in the background.
  - WebGL UI avoids style recalculation.
  - Performance was measured throughout so low-end devices run smoothly — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html)
- **Lesson stated.** "Procedural approaches need to be chosen carefully, since setting them up can take a significant amount of time." Iterating in the browser helped — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html). Secondary sources describe a single continuous canvas with scroll driving the camera — [webgpu.com showcase](https://webgpu.com/showcase/igloo-inc-procedural-crystals/)

**Lando Norris by OFF+BRAND (landonorris.com). Awwwards Site of the Year 2025 and Users' Choice (announced early 2026).** Classed as current.
- **Awards** — [Awwwards on X](https://x.com/awwwards/status/2028869511311507570?lang=en); [OFF+BRAND case page](https://www.itsoffbrand.com/our-work/lando-norris)
- **Concept and techniques.**
  - "Personality in motion": speed-inspired animation, sharp transitions and cinematic scrolling that echo racing.
  - McLaren heritage combined with youthful energy through bold type, vibrant accents and 3D/WebGL.
  - The stated aim was to load fast and scroll smoothly on all devices, using lazy loading and optimised assets — [OFF+BRAND](https://www.itsoffbrand.com/our-work/lando-norris)
  - WebGL plus Rive motion inside Webflow, per a third-party showcase — [webgpu.com showcase](https://www.webgpu.com/showcase/mclaren-f1-driver-lando-norris-official-website/)
- **Context.** Less than two months for full design and development. The launch coincided with Lando's title win, which "led to massive traffic and probably helped the overall impact" — [Codrops interview](https://tympanus.net/codrops/2026/08/17/creativity-at-enterprise-scale-without-compromise-the-offbrand-story/)
- **No accessibility claims or metrics** are published on the case page — [OFF+BRAND](https://www.itsoffbrand.com/our-work/lando-norris)

**Lusion v3 (lusion.co). Awwwards SOTY 2023, Developer award.** Older than 2025, still influential.
- Awwwards profile lists Lusion v3 as SOTY 2023 — [Awwwards Lusion profile](https://www.awwwards.com/lusion/)
- Creative Bloq: its scroll animation and reactive cursor "truly enhance the experience rather than get in the way" — [Creative Bloq](https://www.creativebloq.com/web-design/examples-of-html-1233547/2)
- The 2024 Cannes Lions entries describe the redesign goal as showcasing storytelling design and technical skill — [Lovethework](https://lovethework.com/work-awards/entries/718706)

### Inferences
- The winning formula is **"one verb, one small world, finishable"**: deliver mail, drive, scroll past ice. This maps onto djmanzo's existing island ("Isla Manzo") if each station has one clear verb (play a deck, sing a line, browse a crate) rather than many.
- The best of these sites (Messenger, Bruno 2025) treat **social presence as ambient, capped and moderated by design**: 10-player rooms, emoji-only chat, 30 whispers at once. That is directly relevant to a forum and wishlist. Ambient "others are here" signals can live in the world, while real discussion stays in a plain forum.
- **Sound as a wayfinding device** (Messenger's guitarist gets louder as you approach) is the most transferable technique for a DJ/karaoke brand. Booths could leak music spatially and pull visitors toward features.
- Usability was the weakest jury score for Messenger, and Bruno's critics called it a poor website. Both reward play, not tasks. A site that must also sell, host a marketplace and run a forum cannot make the 3D world the *only* route.

### Gaps
- No primary sources were found for 2023–2026 work by Active Theory, Resn, Immersive Garden, Little Workshop, Locomotive or Darkroom (formerly Studio Freight) within budget.
- FWA and Webby 2025/2026 winners were not checked. CSS Design Awards were seen only as a badge on the OFF+BRAND page.
- Whether Messenger's 2025 award was overall SOTY or Developer SOTY: sources conflict (see above).
- No published conversion or retention metrics for any of these sites.

---

## 2. Product and brand sites that make a device or app feel tangible

### Takeaway
Within this budget, only the Apple-style scroll-scrubbed product reveal and the Playdate/Teenage Engineering hardware story could be sourced. Apple's technique is a canvas "flipbook" of pre-rendered frames tied to scroll position, not live 3D. That is cheaper and more reliable than WebGL for showing a product turning in space.

### Cited Findings
- **Apple AirPods Pro-style pages.**
  - The scroll position maps to a frame number, and the frame is drawn onto a `<canvas>`. Sequences typically run 60 to 180 images, loaded progressively.
  - Frames beat video because drawing a static image avoids seek and decoder lag. These are developer reverse-engineerings, not Apple documentation — [mejba.me write-up](https://www.mejba.me/blog/3d-scroll-animations-ai-claude-code); [CSS-Tricks](https://css-tricks.com/?p=308477)
  - Swapping image `src` on scroll is slow; use sprites or preloaded show/hide. One developer's sweet spot was 147 frames. PNG to WebP cut a hero image from about 21 MB to about 4 MB — [GSAP forum](https://gsap.com/community/forums/topic/25188-airpods-image-sequence-animation-using-scrolltrigger/)
- **Playdate (play.date) by Panic. Hardware from 2019 to 2022.**
  - Yellow handheld with a crank and a 400×240 1-bit screen; the crank idea came from Teenage Engineering — [Wikipedia](https://en.wikipedia.org/wiki/Playdate_(console))
  - Launched with a "season" of 12 games delivered over time — [TechCrunch 2019](https://techcrunch.com/2019/05/22/panics-playmate-is-a-pint-sized-gaming-machine-with-a-season-of-12-intriguing-titles)
  - Ongoing "Playdate Update" showcases present developers and new games — [Game Developer](https://www.gamedeveloper.com/press-release/panic-showcases-playdate-developers-new-games-and-a-new-playdate-cover-in-latest-playdate-update)
- **Teenage Engineering EP-133 K.O. II.** Marketed as a sampler, sequencer and composer with "punch-in" effects, and as a faster route from idea to finished track. Archived product copy only — [archived TE page](https://lps.pagedeck.com/brand/teenage.engineering/products-ep-133); [Sound On Sound review](https://www.soundonsound.com/reviews/teenage-engineering-ep-133-ko-ii?amp)

### Inferences
- For showing the djmanzo desktop app "in the hand", a scroll-scrubbed image sequence of real UI screenshots or a rendered laptop is cheaper and more robust than a live 3D model. Keep it short (NN/g, section 6).
- Playdate's **"season" of drops** is a marketing structure, not a visual effect. It fits a free marketplace well: seasonal packs of effects, skins or karaoke themes, released weekly.

### Gaps
- Not sourced: how teenage.engineering, nothing.tech, rabbit.tech, arc.net, linear.app, raycast.com, Figma Config sites or Spline-made sites behave (journey, CTAs, techniques). They are deliberately not described from memory.

---

## 3. Music and sound playful web experiences: what delights without overstimulating

### Takeaway
The music toys that last share four traits. You cannot make a bad sound (pitch snapped to a scale). There is one gesture to learn (drag). Characters or objects *are* the instruments. And there is a "skip to playground" route for experts. They teach by letting you play first and explaining afterwards.

### Cited Findings
- **Blob Opera (Google Arts & Culture, David Li). Dec 2020, classic.**
  - Four blobs, four opera voices played in real time; "No singing skills required!"
  - Drag up and down for pitch, forwards and backwards for the vowel.
  - "Pitches stick to a scale, so there are no wrong notes." A second ML model harmonises with your input.
  - Holiday mode with Santa hats and 8 carols.
  - The page warns it may not perform well on older devices — [Google Experiments](https://experiments.withgoogle.com/blob-opera); [Arts & Culture](https://artsandculture.google.com/experiment/blob-opera/AAHWrq360NcGbw?cp=e30); [Boing Boing](https://boingboing.net/2020/12/16/blob-opera-a-delightful-machine-learning-and-music-experiment.html/amp)
- **Ableton Learning Synths (2019) and Learning Music (2017). Classics, still online.**
  - Free, in the browser, desktop and mobile, with touch support.
  - Lessons start with amplitude and pitch on an XY pad, then envelopes, LFOs and eventually West Coast synthesis.
  - Experts can **skip lessons and jump straight to a "playground"**, or use "recipes" for specific sounds.
  - Playable from a QWERTY keyboard or MIDI (Chrome) — [Ableton blog](https://www.ableton.com/en/blog/learn-synthesis-in-your-browser/); [DJ Mag](https://djmag.com/news/learn-synthesis-your-browser-abletons-new-microsite); [Mixdown](https://mixdownmag.com.au/news/product/ableton-introduces-browser-based-learning-synths-utility/)
- **Chrome Music Lab (Song Maker and others). Classic.**
  - No login. No instrument or note-reading needed.
  - Song Maker is a grid sequencer with marimba, piano, drums and synths; tempo, scale, mic and MIDI input.
  - Built on Web Audio, WebMIDI and Tone.js; much of the code is on GitHub. Licence not verified, so check it against ADR-0002 before reusing any code.
  - Teachers report it works best with structured activities around it — [Chrome Music Lab](https://g.co/musiclab); [AMT Lab review](https://amt-lab.org/reviews/2019/2/chrome-music-lab)
- **Incredibox (So Far So Good). 2009 to present.**
  - **Characters are the interface**: drag a sound icon onto a beatboxer, and each character becomes a loop (beat, melody, effect, voice).
  - Combos unlock animated bonuses. Mixes can be recorded, shared and ranked.
  - "Makes you sound good before you understand why"; no music theory needed.
  - Over 100 million players claimed by the company; a lower figure of 50 million also circulates — [Wikipedia](https://en.wikipedia.org/wiki/Incredibox); [Webiano](https://webiano.digital/incredibox-makes-beatmaking-feel-like-play/); [Google publisher story](https://www.google.com.my/ads/publisher/stories/so_far_so_good/)
- **Radio Garden (Jonathan Puckey, 2016). Classic.**
  - The globe works as a radio dial: spin satellite imagery to tune into live stations.
  - Borders and city/country names are deliberately left off because "radio itself doesn't know about borders". This is the inspiration of "an old radio dial with city names printed on it".
  - It began as a museum installation brief and became a website instead — [Radio World](https://www.radioworld.com/global/radio-garden-turns-earth-into-radio-tuner); [NPR](https://www.npr.org/transcripts/506045527); [The Outline](https://theoutline.com/post/627/radio-garden-interview)
- **Spotify Wrapped. Story format since 2019, current.**
  - Modelled on social stories so results can be shared to Instagram — [Wikipedia](https://en.wikipedia.org/wiki/Spotify_Wrapped)
  - Game mechanics: top songs as a quiz, top artists as a "race" — [ADMA](https://adma.com.au/resources/personal-shareable-no-strings-attached-the-winning-formula-behind-spotify-wrapped)
  - 60 million shares (2021); 120 million users engaged (2022), about 28% of MAU — [Wikipedia](https://en.wikipedia.org/wiki/Spotify_Wrapped)
  - A full Wrapped takes about 3 minutes without tapping ahead. Criticism: the 2024 edition was seen as less fun and less accurate — [UX Collective](https://uxdesign.cc/whats-happened-to-spotify-wrapped-cdfc32bf56a7)
- **neal.fun (Neal Agarwal).**
  - Each page is a separate experiment, some games and some interactive articles: The Password Game, Infinite Craft. Many parody internet conventions.
  - Viewed millions of times and used in schools — [Wikipedia](https://en.wikipedia.org/wiki/Neal_Agarwal); [Substack review](https://theabbie.substack.com/p/neal-fun-review)

### Inferences
- **No-wrong-notes constraint** (Blob Opera's scale-snapping, Incredibox's loops pre-synced to tempo) is the key to delight without overstimulation. A djmanzo demo deck on the site should beat-sync and key-lock by default, so any visitor's first scratch or crossfade sounds good.
- **Ableton's "skip to playground"** is the cleanest precedent for respecting experts: a guided path for newcomers and a direct route for DJs who already know what a crossfader is.
- **Incredibox's characters-as-instruments** suggests a companion character should *do* something (be a deck, a mic, a crate), not just narrate.
- **Wrapped's story format** suits a "your first mix" or "your karaoke night recap" export that people share, which is a growth loop rather than decoration.
- **Radio Garden** shows a single spatial metaphor (globe equals dial) can be the whole navigation, provided the metaphor *is* the function.

### Gaps
- Not sourced within budget: Patatap, Every Noise at Once, Endlesss, Splice, Native Instruments, and the Serato, rekordbox and djay marketing pages (no claims are made about them).
- No source states how these sites handle reduced-motion or audio-autoplay policy specifically.

---

## 4. "App store as a place": spatial store and marketplace metaphors

### Takeaway
Evidence is thin. Spatial 3D stores exist (Awwwards honourable mentions, WooCommerce WebGL showroom plugins), but no source found shows them outperforming grids. The best documented "store as event" pattern is themed seasonal sales: Steam's themed fests, Playdate's seasons.

### Cited Findings
- **Steam themed sales.** Valve runs one discount event that participating games opt into. Not every themed event gets major homepage placement — [Steamworks docs](https://partner.steamgames.com/doc/store/promo/themed_sales?l=koreana)
  - Summer Sale 2025 ran 26 Jun to 10 Jul, between genre fests — [Uberstrategist](https://uberstrategist.com/blog/12-top-q3-2025-gaming-events-you-shouldnt-miss)
  - Seasonal homepage art for 2025 is only described anecdotally by users — [Steam community](https://steamcommunity.com/discussions/forum/0/601907926162007787)
- **3D e-commerce examples.** DeepSee Commerce (Three.js, Next.js, GSAP; Awwwards Honourable Mention). The developer's own case study says performance on mid-range hardware was the main challenge, and it is self-promotional — [hontran.dev](https://www.hontran.dev/blog/deepsee-commerce-3d-ecommerce-website-case-study)
  - KidSuper World by basement.studio uses a world metaphor for a fashion brand — [Creativepool](https://creativepool.com/basementstudio/projects/kidsuper-world-for-kidsuper/who-liked)
  - A WordPress plugin turns WooCommerce catalogues into WebGL showrooms (vendor claim of 60 FPS) — [WordPress.org](https://wordpress.org/plugins/?p=365802)
- **Abeto's Igloo Inc.** functions as a portfolio "shelf": each item is a unique frozen object passed by scrolling — [Awwwards case study](https://www.awwwards.com/igloo-inc-case-study.html)

### Inferences
- For a free marketplace, a place-based **entrance or showcase** (a record shop or crate-digging booth on the island for the week's featured items) plus a **plain, filterable grid** for actual browsing is the defensible combination. Every precedent above either has a small catalogue (Igloo) or names performance as its main pain (DeepSee).
- Seasonal, themed drops (Steam fests, Playdate seasons) give "special offers" a narrative and a calendar without a permanent sale banner.

### Gaps
- No sourced material on Nintendo eShop music and browsing UX, Animal Crossing shop UI, or itch.io's seasonal jams and bundles as storefront design.
- No A/B data comparing spatial stores with grid stores.

---

## 5. Guided onboarding and companion-character patterns

### Takeaway
The best-documented wins come from one or two short self-selection questions that change what is shown (a 15% to 26% lift in vendor case studies), not from mascots. The best game-like sites (Messenger) skip tutorials entirely and guide through the environment and sound.

### Cited Findings
- **Crowd Content.** A "choose-your-own-adventure" onboarding modal is reported to have lifted conversion by 15%. Vendor-published, so the figure is self-reported — [Appcues](https://appcues.com/examples/crowd-content-choose-your-own-adventure-onboarding)
- **Hotjar.** Asked one expertise question and then showed a Beginner, Intermediate or Advanced checklist: +26% installations among users who answered. Vendor case study — [CaseStudies.com / Appcues](https://www.casestudies.com/company/appcues/case-study/hotjar-increases-installations-by-26-with-appcues)
- **Mascots.** A Rive animator's post argues mascots help when they guide or *respond* to the user (first-run, complex flows). It names "every screen" and purposeless mascots as bad uses. Opinion, with no data — [scour.ing / dev.to](https://scour.ing/@nafnlj/p/https://dev.to/uianimation/your-onboarding-is-losing-40-of-users-heres-a-practical-fix-that-actually-works-ihl)
- **Messenger.** No tutorials, "no giant arrows". It guides by camera, spatial sound and NPCs, and other players act as guides. Non-gamers succeeded without instructions — [Awwwards case study](https://www.awwwards.com/messenger.html)
- **Ableton Learning Synths.** Guided lessons, with an explicit skip to the playground — [DJ Mag](https://djmag.com/news/learn-synthesis-your-browser-abletons-new-microsite)

### Inferences
- For djmanzo, a companion should ask **at most one question** ("DJ, karaoke host, or just curious?") and then change the route, never add steps. It should be dismissible on first sight and never come back uninvited.
- **Environmental guidance beats narration.** Let the karaoke booth glow and leak a chorus, and let the DJ booth thump, rather than having a character explain both.

### Gaps
- No rigorous (non-vendor) study of mascot guides on marketing sites was found.
- No sourced data on drop-off caused by welcome modals on immersive sites specifically.

---

## 6. Wasted space, modals, too many steps, and keeping a plain path

### Takeaway
NN/g's testing shows long scrolljacks disorient people and make task-oriented visitors feel their time is wasted. Text inside a scrolljack is the worst case, and mobile makes everything worse. Award-winning 3D sites draw consistent criticism for load time, missing progress feedback and single-canvas inaccessibility. The fix is a plain path that is always visible, plus a poster or static fallback.

### Cited Findings
- **NN/g, "Scrolljacking 101" (Sara Paul, 6 Aug 2023)** — [NN/g](https://www.nngroup.com/articles/scrolljacking-101/)
  - **What testing found.**
    - Most participants were at least mildly disoriented; some left or refreshed. Long scrolljacks were worse, and some users assumed the site was broken.
    - Task-oriented users felt their time was wasted. Text that must be read inside a scrolljack caused the most severe problems.
    - Horizontal scrolljacks confused people about getting back to the top.
    - Mobile made it worse, and the absence of sticky navigation made recovery harder.
    - Short scrolljacks (BBC News) were tolerated; long ones (Crypto.com) disoriented. Those with clear functional value were accepted better.
  - **Recommendations.**
    - Use only when it adds value; tune the rate through testing.
    - Mix with normal scrolling; never change direction.
    - Keep important text out of scrolljacks.
    - Avoid on mobile, or design a mobile-specific version.
    - Use below the fold only.
  - **Bottom line:** more pain than benefit.
- **Load feedback.** Bruno Simon 2025 was criticised for "no load progress indicator" and for loads long enough that people closed the tab. Constant 100% CPU from an always-on render loop was flagged, with render-on-demand suggested — [HN](https://news.ycombinator.com/item?id=46206531)
- **Single-canvas accessibility.** Commenters noted that when the whole site is one canvas, selection and accessibility tooling cannot help — [HN](https://news.ycombinator.com/item?id=46206531). Messenger scored 7.60 for accessibility and semantics/SEO — [Awwwards SOTD](https://www.awwwards.com/sites/messenger)
- **Reduced motion and fallbacks.**
  - `prefers-reduced-motion` should tone motion down (fades, shorter durations) rather than strip it. In JavaScript, use `matchMedia` with listeners — [OpenReplay](https://blog.openreplay.com/prefers-reduced-motion-accessible-animation/)
  - Reduced motion addresses WCAG 2.3.3 but not autoplay. Looping or autoplaying content still needs a pause control under WCAG 2.2.2, so a skip-intro button is needed anyway — [Passiro](https://passiro.com/web-accessibility/designers/animation-motion)
  - Show an immediate non-WebGL poster; WebGL should never block understanding of the offer — [ui-skills checklist](https://www.ui-skills.com/skills/mengto/webgl-landing-steering/)
- **Load budget.**
  - Mobile quality presets and compressed textures (Bruno) — [Awwwards](https://www.awwwards.com/brunos-portfolio-case-study.html)
  - Real-time intros instead of pre-rendered video (Igloo) — [Awwwards](https://www.awwwards.com/igloo-inc-case-study.html)
  - Explicit asset freeing for iOS Safari (Messenger) — [Awwwards](https://www.awwwards.com/messenger.html)
- **The visitor's job decides whether spectacle is acceptable.** Critics of Bruno's site called it "terrible as an actual home page"; defenders said it fits a three.js teacher — [HN](https://news.ycombinator.com/item?id=46206531)

### Inferences: cross-cutting patterns
1. **One world, one verb, finishable.** Messenger (15 minutes), Igloo (3 sections), Bruno (drive). Scope is the design.
2. **Sound and space guide better than arrows and modals.** Messenger's spatial guitarist; Bruno's spatial SFX.
3. **Ambient, capped sociality.** 10-player rooms, emoji-only chat, 30 whispers, daily top-10. Presence without moderation burden.
4. **No wrong notes.** Blob Opera's scale snap; Incredibox's synced loops. The first interaction must sound good.
5. **Skip to the playground.** Ableton's expert route; one-question personalisation (Hotjar, Crowd Content).
6. **Seasons and drops.** Playdate seasons and Steam fests give offers and marketplace items a calendar.
7. **Shareable recap.** Spotify Wrapped's story format turns use into distribution.
8. **Engineered performance as a feature.** LOD, instancing, KTX2/DRACO, mobile presets, real-time rather than pre-rendered, freeing memory on iOS.

### Inferences: anti-patterns to avoid
1. A long load with no progress bar, or a blank first paint (Bruno 2025 criticism).
2. A canvas-only site with no HTML or text path (accessibility, SEO; Messenger and Bruno's lowest scores were usability, accessibility and semantics).
3. Long scrolljacks, sideways scrolljacks, or text to read inside a scrolljack (NN/g).
4. A render loop that keeps the CPU at 100% while idle (HN).
5. Mascots or modals on every screen, or guidance the visitor did not ask for (Rive post; Messenger's no-tutorial success).
6. Making shop and forum tasks pass through spectacle. Task-oriented users feel their time is wasted (NN/g).

### Gaps
- No NN/g article specifically on WebGL/3D marketing sites or "immersive" sites was found. Only the scrolljacking article was retrieved.
- No quantitative data on bounce or conversion for immersive sites compared with conventional ones.
- No sourced example of an award-winning 3D site that ships a documented "accessible mode" or "skip to index" toggle. This should be checked on the live sites (lusion.co, bruno-simon.com, messenger.abeto.co) before claiming either way.
