# AI imagery, 3D assets and music licensing for a solo-built commercial website (as of 19 October 2026)

Scope: free or nearly free ways for one developer to produce Midjourney/Leonardo-class images (and optionally 3D assets) for the djmanzo website, the licences that govern commercial use of those outputs, and the commercial terms of Suno (and Udio) music. Not legal advice. Every licence below should be re-read at the source on the day it is relied on; several changed in 2025 and 2026.

Context worth knowing for the report writer: the djmanzo site already has an `/imprint` page (`docs/WEBSITE.md`, lines 288-298) and is deployed at `djmanzo.johannes-neugschwentner.workers.dev`. An imprint (Impressum) is a German/Austrian legal requirement, so the operator is very likely in the EU. That matters: Tencent's Hunyuan licences exclude the EU, UK and South Korea (see below).

## Question 1: Which open-weight text-to-image models reach Midjourney/Leonardo-class quality, and what do their licences allow?

### Takeaway
The open-weight quality leaders in October 2026 are Qwen-Image-2.1, Ideogram 4.0 (open weights), FLUX.2 [dev], NVIDIA Cosmos3 and HunyuanImage 3.0, all roughly 160 Elo behind the best closed model. For a commercial site the cleanest licences are Apache-2.0 models: Qwen-Image-2512 (20B), Z-Image Turbo (6B) and FLUX.2 [klein] 4B. FLUX.2 [dev] weights are non-commercial, but its model card says outputs may be used commercially. Hunyuan models are unusable in the EU.

### Cited findings

**Quality ranking (Artificial Analysis Text-to-Image Arena, AA-Image-T2I v2.1, open-weights filter, fetched 19 Oct 2026)** — [Artificial Analysis](https://artificialanalysis.ai/image/leaderboard/text-to-image?open-weights=true)
- Qwen-Image-2.1 (Alibaba, Sep 2026): 1042 Elo, rank 21 overall and first among open weights.
- Ideogram 4.0 (Quality) (Jun 2026): 1026. Ideogram 4.0: 1001.
- FLUX.2 [dev] (Black Forest Labs, Nov 2025): 1000. This is the anchor of the scale.
- Ming-Image-0.1-Design (InclusionAI, Sep 2026): 999.
- FLUX.2 [dev] Turbo (fal, Dec 2025): 995. Cosmos3-Super-Text2Image (agentic) (NVIDIA, May 2026): 992.
- HunyuanImage 3.0 Instruct (Tencent, Jan 2026): 988. HiDream-O1-Image (May 2026): 974.
- Z-Image Turbo (Alibaba, Dec 2025): 934. HunyuanImage 3.0: 932. FLUX.2 [klein] 9B (Jan 2026): 931.
- ERNIE Image Turbo: 914. Qwen Image (Aug 2025 original): 902. GLM-Image: 888. FLUX.1 Krea [dev]: 878. Bria FIBO: 847. FLUX.1 [dev]: 841. FLUX.2 [klein] 4B: 838. FLUX.1 [schnell]: 740.
- The page does not show licences. SD 3.5, SDXL and its fine-tunes (Juggernaut, RealVis), Lumina, Kolors and Playground do not appear in the open-weights list, which suggests they are no longer competitive at the top.
- A secondary October 2026 snapshot puts the best closed model (OpenAI "GPT Image 2.5") at 1,198, about 160 points above the best open model — [search summary citing Artificial Analysis](https://artificialanalysis.ai/image/leaderboard/text-to-image). The overall-board figure was not verified directly.

**Licences**
- **Qwen-Image-2512** (Alibaba's December 2025 update of the August 2025 Qwen-Image): licence `apache-2.0`, 20B parameters, BF16 — [Hugging Face model card](https://huggingface.co/Qwen/Qwen-Image-2512). The card does not mention an official "Qwen-Image 2.1".
- **Qwen-Image-2.1**: one secondary source says it is under a "Qwen Research" (non-commercial) licence, unlike the Apache-2.0 Qwen-Image-2512 — [Pinggy blog / search summary](https://pinggy.io/blog/best_free_open_source_ai_image_generators_to_self_host/). **Unverified.** The primary model card was not found.
- **Z-Image Turbo**: 6B-parameter distilled model from Alibaba Tongyi Lab, released 27 Nov 2025 under Apache 2.0 — [Qubrid](https://qubrid.com/models/z-image-turbo-lora). It needs a minimum of 8 GB VRAM with CPU offload — [DiffSynth-Studio docs](https://diffsynth-studio-doc.readthedocs.io/en/latest/Model_Details/Z-Image.html). Another guide says 16 GB, or 8-12 GB at 768px with offloading. LoRAs should be trained on the base Z-Image rather than on Turbo, because training on Turbo degrades the distillation — [Civitai developer docs](https://developer.civitai.com/orchestration/recipes/training-other-image).
- **FLUX.2 [dev]**: 32B-parameter rectified-flow transformer under the "FLUX Non-Commercial License". The model card nevertheless states, "Generated outputs can be used for personal, scientific, and commercial purposes." Running the weights commercially needs BFL's separate "Self-Hosted Commercial License Terms". A 4-bit quantised setup runs on an RTX 4090/5090 — [Hugging Face model card](https://huggingface.co/black-forest-labs/FLUX.2-dev).
- **FLUX.2 [klein] 4B**: Apache 2.0, base and distilled variants. **klein 9B**: FLUX Non-Commercial License v2.1 — [BFL flux2 GitHub](https://github.com/black-forest-labs/flux2); [HF klein-4B card](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B); [DeepWiki licensing page](https://deepwiki.com/black-forest-labs/flux2/7.4-licensing-and-terms). Sources disagree on whether klein-9B outputs are commercially usable — [invideo](https://invideo.io/blog/flux-ai-image-generator/) says yes; [JarvisLabs](https://docs.jarvislabs.ai/tutorials/running-flux2-klein) just labels it non-commercial.
- **HunyuanImage 3.0** is under the Tencent Hunyuan Community licence, which excludes the EU, UK and South Korea — [search summary of the Artificial Analysis snapshot](https://artificialanalysis.ai/image/leaderboard/text-to-image). The same territory carve-out is confirmed for the Hunyuan3D licences (Question 5).
- **Stability AI Community License** (SD 3.5 Large/Medium, Stable Fast 3D): free for individuals and organisations with less than US$1M annual revenue. Above that, an enterprise licence is needed — [Stability membership page](https://stability.ai/membership); [SF3D model card](https://huggingface.co/stabilityai/stable-fast-3d).

### Inferences
- Commercially clean and high quality: **Qwen-Image-2512** (Apache-2.0, 20B, needs about 40 GB in BF16 or a quantised build on a 24 GB card; inferred from parameter count) and **Z-Image Turbo** (Apache-2.0, 6B, fits a free 16 GB T4 or P100). FLUX.2 [klein] 4B is clean but ranks about 100 Elo lower.
- For the best quality per licence, generate with **FLUX.2 [dev] outputs**, accepting the model card's statement that outputs are commercially usable. The safest route is to generate through a paid or free API that holds a commercial licence (Cloudflare Workers AI hosts `flux-2-dev`; see Question 2) rather than self-hosting the weights.
- Because the operator is almost certainly in the EU (the site has an Impressum), **avoid HunyuanImage and Hunyuan3D entirely**.
- SDXL fine-tunes (Juggernaut, RealVis) remain usable and cheap, with a huge LoRA ecosystem, but they are no longer Midjourney-class by the arena measure.

### Gaps
- No primary source was found for the Qwen-Image-2.1 licence, or for whether its weights are actually public.
- Exact VRAM figures for Qwen-Image-2512 and FLUX.2 [dev] are not stated on their cards.
- Licences for HiDream-O1, Cosmos3 (likely the NVIDIA Open Model License), Ideogram 4.0 open weights, Ming-Image and ERNIE Image were not checked. The FLUX.1 [schnell] Apache-2.0 and SDXL OpenRAIL++ licences were not re-fetched this session.

## Question 2: Free compute — what each option allows, its limits, and whether it can be scripted

### Takeaway
The best scriptable free option is **Cloudflare Workers AI**, which djmanzo already uses: 10,000 neurons a day buys roughly 95 FLUX.2 [klein] 4B images or roughly 170 FLUX.1 [schnell] images at 1024², but only about 3 FLUX.2 [dev] images. For heavier self-hosted models and LoRA training, **Kaggle** (about 30 GPU-hours a week, 2×T4 or P100) is the most generous. **Hugging Face ZeroGPU** gives 5 minutes a day free, or 40 minutes on PRO ($9/month), on 48 GB Blackwell GPUs. **Colab free** blocks remote web UIs.

### Cited findings

**Cloudflare Workers AI** — [pricing docs](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- 10,000 neurons a day at no charge, resetting at 00:00 UTC. Above that, $0.011 per 1,000 neurons on Workers Paid.
- `@cf/black-forest-labs/flux-1-schnell`: 4.80 neurons per 512×512 tile plus 9.60 neurons per step.
- `@cf/black-forest-labs/flux-2-klein-4b`: 26.05 neurons per output tile, plus 5.37 per input tile ($0.000287 and $0.000059).
- `@cf/black-forest-labs/flux-2-klein-9b`: 1,363.64 neurons ($0.015) for the first megapixel, then 181.82 per additional megapixel or input image.
- `@cf/black-forest-labs/flux-2-dev`: 37.50 neurons per output tile **per step**, plus 18.75 per input tile per step.
- `@cf/leonardo/lucid-origin`: 636 neurons per tile plus 12 per step. `@cf/leonardo/phoenix-1.0`: 530 per tile plus 10 per step.

**Hugging Face ZeroGPU** — [HF Hub docs](https://huggingface.co/docs/hub/spaces-zerogpu), fetched 19 Oct 2026
- Hardware is NVIDIA RTX Pro 6000 Blackwell: `large` is half a card (48 GB VRAM, 1× quota cost); `xlarge` is a full card (96 GB, 2× quota cost).
- Daily quota: unauthenticated 2 minutes; free account 5 minutes; PRO 40 minutes (extensible); Team member 40 minutes; Enterprise 60 minutes. The quota resets 24 hours after first use.
- PRO, Team and Enterprise users can go beyond the quota with prepaid credits at $1 per 10 GPU-minutes.
- Free accounts in good standing (verified email, older than 30 days) can host up to 2 ZeroGPU Spaces; PRO can host 10. Spaces must use the Gradio SDK, and `torch.compile` is unsupported (AOT compilation is supported).
- Older forum posts quote 3.5 and 25 minutes, so the numbers have changed over time — [HF forum](https://discuss.huggingface.co/t/what-is-the-daily-quota-for-zerogpu-for-pro-users/133470).

**Kaggle**
- Users commonly report about 30 GPU-hours a week, but the figure floats and is shown in account settings rather than in Kaggle's docs. Sessions run up to 12 hours (9 hours on TPU) — [gpuperhour.com, Sep 2026 review](https://gpuperhour.com/blog/free-cloud-gpus-and-credits).
- GPU choices are 2×T4 (2×16 GB) or 1×P100 (16 GB) — [aimultiple](https://aimultiple.com/free-cloud-gpu); [GMI Cloud](https://www.gmicloud.ai/en/blog/best-free-gpu-cloud-options-for-ai-startups-and-researchers) (secondary sources).
- Kaggle images ship with PyTorch, diffusers and ComfyUI — [GMI Cloud](https://www.gmicloud.ai/en/blog/best-free-gpu-cloud-options-for-ai-startups-and-researchers).
- Internet access requires a phone-verified account (stated widely, but not re-verified this session).

**Google Colab free**
- In 2023 Google restricted Gradio-based remote UIs (Automatic1111, SD.next) for free users. Stable Diffusion itself is not banned. This followed a 2023 terms-of-service update forbidding remote UIs and desktops — [Decrypt](https://decrypt.co/197428/google-colab-stable-diffusion-web-ui-ban).
- A September 2026 review says SSH, remote desktops and web UIs still need a paid balance — [gpuperhour.com](https://gpuperhour.com/blog/free-cloud-gpus-and-credits).
- Free GPU (T4) availability is variable. Vendor blogs cite 15-30 hours a week and 12-hour sessions; these figures are unverified — [Hivenet](https://www.hivenet.com/post/google-colaboratory-gpu-complete-guide-to-free-cloud-gpu-access-and-limitations).

### Inferences (my arithmetic, from the Cloudflare price table, for a 1024×1024 image = 4 tiles)
| Model on Workers AI | Neurons per image | Free images per day | Cost per 1,000 images beyond free |
|---|---|---|---|
| flux-1-schnell (4 steps) | 4×4.8 + 4×9.6 ≈ 58 | ≈ 170 | ≈ $0.63 |
| flux-2-klein-4b | 4×26.05 ≈ 104 | ≈ 95 | ≈ $1.15 |
| flux-2-klein-9b | ≈ 1,364 | ≈ 7 | ≈ $15 |
| flux-2-dev (20 steps) | 4×37.5×20 = 3,000 | ≈ 3 | ≈ $33 |
| leonardo/phoenix-1.0 (≈25 steps, assumed) | ≈ 2,370 | ≈ 4 | ≈ $26 |

- Scriptability: Workers AI (REST API or the Worker `AI` binding) and HF Spaces (via `gradio_client` with an HF token) are directly scriptable for batch jobs. A Kaggle notebook can run a batch generation loop headless. A notebook-native ComfyUI or diffusers loop is ordinary notebook use, not a web UI. Colab free is fine for a diffusers script but not for a Gradio or ComfyUI front end.
- The Workers Paid plan ($5/month, price not re-verified this session) unlocks paid neurons. About $3 of neurons buys roughly 100 FLUX.2 [dev] images, which is "nearly free" for a site's hero set.

### Gaps
- Together, fal, Replicate and Lightning AI free credits were not researched in this session (budget). Treat them as unknown for 2026.
- Kaggle's terms on long-running servers or tunnels (ngrok/cloudflared) were not found. Batch generation inside a notebook is the safe pattern.
- Cloudflare's output-licence position for hosted klein-9B and FLUX.2 [dev] (whether Cloudflare's BFL agreement passes commercial output rights through) was not checked.

## Question 3: Hosted free tiers — Leonardo, Ideogram, Firefly, Gemini, Bing/Designer, Krea

### Takeaway
Free hosted tiers are a poor basis for commercial website art. Leonardo's and Ideogram's free generations are public. Leonardo keeps rights in public images. Commercial-use statements for the Ideogram, Bing, Firefly and Krea free tiers conflict across sources, and no vendor's own terms text could be retrieved except Leonardo's help centre. Paid tiers generally grant commercial rights.

### Cited findings
- **Leonardo**: for public images, Leonardo keeps worldwide perpetual rights to the images and prompts, and other users get a licence to access them — [Leonardo help centre](https://intercom.help/leonardo-ai/en/articles/8044018-commercial-usage). Free generations are public and cannot be made private; secondary sources disagree on whether free output may be used commercially — [terms.law](https://terms.law/ai-output-rights/leonardo/); [Adobe community answer](https://community.adobe.com/questions-38/hi-i-have-a-portfolio-of-42-images-that-i-generate-on-the-free-plan-https-app-leonardo-ai-i-ve-already-made-two-sales-can-i-continue-for-free-is-this-legal-1552692).
- **Ideogram**: free generations go to a public feed. Krea's guide says free commercial use is allowed — [Krea blog](https://www.krea.ai/blog/what-is-ideogram-ai-features-pricing-and-alternatives-in-2026). Conduct Atlas and Licenseorg read the free licence as personal and non-commercial — [Conduct Atlas](https://conductatlas.com/platform/ideogram/ideogram-terms-of-service/tiered-ip-ownership-by-subscription-level/); [Licenseorg](https://licenseorg.com/guide/ai-content/ideogram). Paid tiers (Basic and up) include commercial rights.
- **Adobe Firefly**: one source says free daily generations replaced the monthly allowance; another says free-plan images are personal use only — [DataCamp](https://www.datacamp.com/blog/best-free-ai-image-generators); [Rangy](https://rangy.ai/blog/best-free-ai-image-generator/). Unresolved.
- **Google Gemini / "Nano Banana 2"**: outputs carry SynthID, daily free generation is capped, and terms are described as more restrictive — [Kavel](https://www.kavel.ai/blog/best-free-ai-image-generators-2026) (secondary).
- **Bing Image Creator / Microsoft Designer**: sources conflict between "non-commercial only" and "commercially permissive" — [findskill.ai](https://findskill.ai/blog/best-free-ai-image-generators/); [codersera](https://codersera.com/blog/best-free-text-to-ai-image-generators/).
- **Krea**: about 100 units a day on free; commercial use is undocumented for free — [viralmarketinglab](https://www.viralmarketinglab.com/blog/best-free-ai-image-generators-in-2026-what-you-actually-get-(and-what-they-keep)).
- Leonardo's own models (Phoenix 1.0 and Lucid Origin) are callable on Cloudflare Workers AI — [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/). Leonardo's quality is therefore reachable without a Leonardo account, at about 4 images a day free.

### Inferences
- For a commercial site, prefer images from Apache-2.0 weights, or from an API whose commercial terms you have read, over free consumer tiers with ambiguous terms and public galleries.
- Ideogram is still the strongest tool for **typography in images** (logos and posters). If text-in-image is needed, a one-month paid Ideogram plan may be worth it. Alternatively, the Ideogram 4.0 open weights rank highly; their licence is unchecked.

### Gaps
- The vendors' own current terms for Ideogram, Firefly, Gemini, Bing/Designer and Krea free plans were not retrieved. The report should flag every one of these as "verify before use".

## Question 4: Style consistency and upscaling

### Takeaway
The reliable way to keep one art style across dozens of images is to **train a style LoRA** on 15-40 curated images, on an Apache-2.0 base (Z-Image base, Qwen-Image-2512 or FLUX.2 klein-4B base), and pair it with a fixed prompt template. Reference-image conditioning is a lighter alternative: FLUX.2's multi-reference editing, or Redux and IP-Adapter on older models. For upscaling, Real-ESRGAN (BSD-3) is commercially safe; SUPIR is non-commercial.

### Cited findings
- LoRA trainers exist for Qwen-Image-2512 and Z-Image — [Scenario docs](https://docs.scenario.com/docs/training-models); [muapi Qwen-Image-2512 LoRA trainer](https://muapi.ai/playground/qwen-image-2512-lora-trainer); [Civitai](https://developer.civitai.com/orchestration/recipes/training-other-image).
- Train on base Z-Image, not Turbo — [Civitai](https://developer.civitai.com/orchestration/recipes/training-other-image).
- FLUX.2 klein accepts input images (the per-input-tile pricing implies reference or editing support) — [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/); [BFL klein blog](https://bfl.ai/blog/flux2-klein-towards-interactive-visual-intelligence).
- **Real-ESRGAN** code is BSD-3-Clause; individual model weights inherit their own licences — [HF AI_upscalers collection](https://huggingface.co/easygoing0114/AI_upscalers); [Shopify Space third-party licences](https://huggingface.co/spaces/Shopify/background-replacement/blob/62eacc2eb6c24cbf7f942f103cb71fa35f840bf7/LICENSES-THIRD-PARTY.md?code=true).
- **SUPIR** is licensed "strictly for non-commercial purposes"; commercial use needs written permission from Dr. Jinjin Gu. Another mirror shows a SupPixel Pty Ltd agreement reserving commercial rights — [HF SUPIR LICENSE](https://huggingface.co/spaces/Upscaler/SUPIR/blob/fae2f4559b8dc6e2ae95973704b7124745162cd7/LICENSE); [mirror](https://git.tdem.in/Fanghua-Yu/SUPIR/blob/master/LICENSE).

### Inferences (practice, not sourced in this session)
- A "style bible" prompt system helps consistency: a fixed prefix (medium, palette hex codes, lighting, lens, grain), a fixed negative or avoid list, fixed resolution and aspect presets, and logged seeds per asset in a manifest. The project already has an "art bible" (task #7 in the session), which should be the source of that prefix.
- A Z-Image base LoRA (6B) should train on a Kaggle T4 or P100 in fp16/8-bit at 512-768px within one 9-12 hour session. Qwen-Image-2512 (20B) LoRA training probably needs more than 16 GB VRAM, so a ZeroGPU 48 GB slot or a few dollars of rented GPU fits better. These are estimates; they were not measured.
- ControlNet (depth or edges) keeps composition consistent across scene variants, such as the same island stage at day and night.
- SDXL plus IP-Adapter remains the most mature, cheapest style-reference stack if newer models' tooling is lacking.

### Gaps
- No primary source was found on ControlNet or IP-Adapter availability for Qwen-Image-2512, Z-Image or FLUX.2 klein in October 2026, or on measured LoRA training times on a Kaggle T4.

## Question 5: Image-to-3D and text-to-3D models for glTF assets (three.js), and gaussian splats

### Takeaway
**TRELLIS.2** (Microsoft, 4B) is MIT-licensed for code and weights, but its NVIDIA rendering dependencies (nvdiffrast/nvdiffrec) are under a research-only NVIDIA licence, which clouds commercial use. **Hunyuan3D 2.x** excludes the EU, UK and South Korea, so it is unusable for this operator. **Stable Fast 3D** (and probably SPAR3D) is free under the Stability Community License below $1M revenue and outputs GLB directly.

### Cited findings
- TRELLIS.2: MIT for model and code. It relies on nvdiffrast and nvdiffrec under the "NVIDIA Source Code License", limited to research and evaluation — [CGWorld](https://cgworld.jp/flashnews/01-202601-TRELLIS2.html); [TRELLIS GitHub issue #298](https://github.com/microsoft/TRELLIS/issues/298); [DeepWiki TRELLIS.2 legal](https://deepwiki.com/microsoft/TRELLIS.2/9-legal) (says third-party dependencies keep separate licences).
- Hunyuan3D 2.0 and 2.1: "Territory" is worldwide excluding the EU, UK and South Korea, and rights are granted only within the Territory — [Hunyuan3D-2 LICENSE on HF](https://huggingface.co/tencent/Hunyuan3D-2/blob/main/LICENSE); [Hunyuan3D-2.1 LICENSE mirror](https://gitserver.onethingai.com/ai-models/Hunyuan3D-2.1/raw/branch/main/LICENSE) (third-party mirror).
- Stable Fast 3D: organisations or individuals with annual revenue of US$1M or more need an enterprise licence for commercial use of SF3D, its derivatives **or its outputs** — [HF model card](https://huggingface.co/stabilityai/stable-fast-3d).

### Inferences
- The nvdiffrast question concerns the *software* used to produce the mesh. Whether that restriction reaches the generated GLB is legally unclear. A conservative operator would use SF3D for commercial props, or confine TRELLIS.2 to prototypes.
- For three.js, GLB output plus `gltf-transform` (Draco/meshopt compression, KTX2 textures) is the standard path. The tool is MIT-licensed, from general knowledge; not verified this session.
- A generated 3D asset is a stylistic mismatch risk. For an "island world" site, stylised low-poly props from SF3D on images generated with the site's style LoRA keep 2D and 3D coherent.

### Gaps
- SPAR3D's licence was not confirmed (likely the same Stability Community License).
- Gaussian-splat-from-photos tools and licences were not researched in this session. The usual candidates are Inria 3DGS (non-commercial licence), gsplat (Apache-2.0), Brush, Postshot and Polycam. **Unverified; needs its own pass.** Three.js viewers include `@mkkellogg/gaussian-splats-3d` and Spark.

## Question 6: Suno (and Udio) commercial terms in 2026

### Takeaway
Under Suno's terms effective **3 September 2026**, only songs **downloaded while on a paid plan (Pro or Premier)** may be used commercially. Suno assigns its rights in those outputs to the subscriber but **does not warrant that any copyright exists**. Downloads are now capped: Free gets 7 lifetime downloads (non-commercial), Pro 20 a month, Premier 60 a month. Commercial rights in already-downloaded songs survive cancellation. Remixes of other users' songs are non-commercial. Udio stopped all downloads after its October 2025 Universal settlement and is a walled garden.

### Cited findings
**Suno Terms of Service** (Date of Last Revision 10 August 2026; Effective 3 September 2026) — [suno.com/terms-of-service](https://suno.com/terms-of-service)
- Pro and Premier: "Suno hereby assigns to you all of its right, title and interest in and to any Output owned by Suno."
- Paid users "may commercially exploit Output solely to the extent it adheres to Suno's Conditions of Access and Use" and only if "you have obtained a permitted download of that Output."
- Free and basic users: "you will only use such Outputs for your lawful, personal and non-commercial purposes."
- "Suno makes no representation or warranty to you that any copyright will vest in any Output."
- Remixes are "a joint work owned jointly and equally by you and the Remixer" and "may only be used for lawful, personal and non-commercial purposes."
- Users must not "remove, alter, obscure or circumvent any fingerprint, watermark or metadata Suno appends to an Output." Moral rights are waived.
- Commercial rights in downloaded output "are not affected by … the expiry, cancellation, downgrade or suspension of your subscription."
- No attribution or credit requirement appears in the terms.

**Suno Help Centre: download limits** — [help.suno.com/en/articles/13614785](https://help.suno.com/en/articles/13614785)
- "Free: Up to 7 total (lifetime) trial downloads for personal, non-commercial use only."
- "Pro: 20 downloads per month, with commercial use rights." "Premier: 60 downloads per month, with commercial use rights."
- Monthly counts reset and do not roll over. Streaming and sharing on Suno stay unlimited.
- "For any song that you download from the platform as a paying subscriber, you have the commercial rights to the music."
- No prices are shown on the page.

**Secondary reporting**
- The caps took effect 3 Sept 2026 and apply retroactively to songs made before that date. Premier inside Suno Studio is unlimited. Extra downloads can be bought, price unpublished. Suno v6 launched 9 Sept 2026 and is said to be trained on music licensed from Warner Music Group, BMG and Believe. Older models can no longer generate — [Mubert blog, updated 14 Oct 2026](https://mubert.com/blog/suno-download-caps) (a competitor; its key figures match Suno's help page).
- Suno settled with WMG in November 2025 and licensed WMG's catalogue. Universal and Sony were reportedly still suing as of June 2026 — [eesel.ai](https://www.eesel.ai/blog/suno-review); [Digital Music News, 22 Dec 2025](https://www.digitalmusicnews.com/2025/12/22/suno-warner-music-deal-changes/); [Music in Africa](https://musicinafrica.net/magazine/suno-adjusts-ai-music-ownership-terms-after-warner-music-partnership/). A reported ~$500M figure appears in secondary sources only and is unverified.
- Songs made without an active subscription stay non-commercial even after upgrading — [techjacksolutions](https://techjacksolutions.com/ai-tools/suno/suno-commercial-use/); [terms.law](https://terms.law/ai-output-rights/suno/). The current terms tie rights to a "permitted download … as a paying subscriber". A free-era song downloaded later while paid may therefore qualify; this point is ambiguous.

**Udio**
- UMG and Udio settled on 29 Oct 2025 and announced a licensed platform for 2026. Udio disabled downloads on 30 Oct 2025, then opened a 48-hour window from 3 Nov 2025. Songs downloaded in that window keep the old terms, including ownership and commercial use — [Billboard](https://billboard.com/pro/udio-deal-backlash-ai-users-download-ai-songs-48-hours); [Digital Music News](https://www.digitalmusicnews.com/2025/10/31/udio-umg-deal-downloads-resumed-48-hours/).
- The platform is now a walled garden with no export, plus fingerprinting and filtering. WMG later settled with Udio on similar terms — [RouteNote](https://routenote.com/blog/udio-stops-user-downloads-after-umg-deal-heres-why/); [Music Business Worldwide](https://musicbusinessworldwide.com/universal-and-suno-are-in-a-pr-battle-over-walled-gardens-in-ai-music).

### Inferences
- For djmanzo's website music (demo loops, stage soundtracks): subscribe to **Pro for the month(s) of production**, generate on v6, and **download each final track while subscribed**. Twenty downloads a month means curating hard: draft and audition on Suno, then download only the finals. Keep receipts and timestamps (the download date and the plan) as provenance.
- Because Suno does not warrant copyright, purely AI tracks may not be protectable. Others could reuse them, and Content ID or distributor claims are possible. Do not leave Suno's watermarks or metadata stripped.
- Udio cannot supply music for an external website in 2026.
- Shipping Suno audio *inside the DJ app* as bundled content is a stronger form of "commercial exploitation" than a website background. It is still allowed on paid downloads, but worth a second read of the "Conditions of Access and Use".

### Gaps
- Current Suno prices were not retrieved.
- Suno's "Conditions of Access and Use" (which limits commercial exploitation) was not read.
- No source was found on whether distributors (DistroKid and others) now require AI disclosure for Suno tracks.

## Question 7: Recommended pipeline and the accounts/tokens to create

### Takeaway
Use the Cloudflare account djmanzo already has as the primary engine (FLUX.2 [klein] 4B for volume, a few dollars of FLUX.2 [dev] for heroes). Use Kaggle for LoRA training and bulk Apache-2.0 generation (Z-Image / Qwen-Image-2512), and Hugging Face for model downloads and ZeroGPU. Use Real-ESRGAN for upscaling, Stable Fast 3D for optional props, and a Suno Pro month for music.

### Cited findings
- All pricing, quota and licence facts are as cited in Questions 1-6. In particular: [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [HF ZeroGPU](https://huggingface.co/docs/hub/spaces-zerogpu), [Qwen-Image-2512 card](https://huggingface.co/Qwen/Qwen-Image-2512), [FLUX.2-dev card](https://huggingface.co/black-forest-labs/FLUX.2-dev), [Suno ToS](https://suno.com/terms-of-service).

### Inferences: the recommended pipeline
1. **Style definition.** Turn the existing art bible into one prompt prefix, an avoid list, a palette and aspect presets. Generate 40-80 candidates on Workers AI `flux-2-klein-4b` (free: about 95 a day) and hand-pick 20-30 as the style set.
2. **Style LoRA.** On Kaggle (2×T4 or P100), train a LoRA on **Z-Image (base)**, which is Apache-2.0, using the picked set. Alternative: if FLUX.2 klein-4B base LoRA tooling is mature, train that instead, so the LoRA could later run on Workers AI. Workers AI LoRA support for klein is **not verified**.
3. **Bulk generation.** Run a headless Kaggle notebook: a diffusers loop over a JSON manifest (id, prompt, seed, size) that writes PNGs plus a sidecar JSON (model, licence, seed, prompt, date) to a Kaggle dataset or output, then sync to R2.
4. **Hero images.** Use Workers AI `flux-2-dev` (outputs commercially usable per its model card), about $0.03 an image, with style-set images as references (FLUX.2 multi-reference). Or use Qwen-Image-2512 on ZeroGPU (48 GB) for Apache-clean heroes.
5. **Upscale and finish.** Real-ESRGAN x4 (BSD-3; check the weights' licence) on Kaggle. Then convert to AVIF/WebP at multiple widths for the site.
6. **Optional 3D.** Stable Fast 3D (free under $1M revenue) from the generated images to GLB, then gltf-transform compression, then three.js. Avoid Hunyuan3D (EU excluded). Treat TRELLIS.2 as prototype-only until the nvdiffrast question is settled.
7. **Music.** One month or more of Suno Pro or Premier. Download finals only while subscribed, and log the download date and plan.
8. **Provenance file.** Keep a `CREDITS`/manifest listing each asset's model, licence, generation date and plan. This mirrors the repo's `docs/RESEARCH.md` licence discipline (ADR-0002).

### Accounts and tokens the owner would need to create
| Account | Token / setting | Purpose | Cost |
|---|---|---|---|
| Cloudflare (existing) | API token with **Workers AI: Read/Edit**, plus the Account ID; or the existing `AI` binding in `wrangler.toml` | flux-2-klein-4b, flux-2-dev, flux-1-schnell generation | Free 10k neurons/day; Workers Paid for more |
| Hugging Face | **User Access Token** (read; write if hosting a Space or pushing a LoRA); accept gated model terms (e.g. FLUX.2-dev, stable-fast-3d) on each model page | Model downloads in Kaggle; ZeroGPU Spaces via `gradio_client` | Free (5 min/day ZeroGPU); PRO $9/month for 40 min/day (price not re-verified) |
| Kaggle | Account with **phone verification** (needed for GPU and internet access, per common reports); `kaggle.json` API token (Settings → Create New Token) for scripted pushes and pulls; HF token stored as a **Kaggle Secret** | LoRA training and bulk generation | Free (~30 GPU-h/week) |
| Suno | **Pro (or Premier) subscription** active at download time | Commercial-use music | Paid (price not retrieved) |
| Optional: Google (Colab) | Google account | Fallback notebook GPU; no web UI on free | Free |
| Optional: Stability AI | Nothing needed under $1M revenue; accept the Community License on HF | SD3.5 / SF3D | Free |

### Gaps
- Whether Workers AI supports LoRAs for FLUX.2 klein-4B (it historically supported LoRAs only on some text models) was not checked.
- Current HF PRO and Cloudflare Workers Paid prices were not re-verified.
- Kaggle's phone-verification requirement for internet-enabled GPU notebooks was not re-verified this session.
