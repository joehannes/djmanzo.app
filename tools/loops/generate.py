"""Generate instrumental loops with ACE-Step 1.5 (turbo DiT, no LM) on CPU.

usage: gen.py jobs.json outdir
jobs.json: [{"id", "caption", "bpm", "key", "duration", "seed"}]
"""
import json, os, sys, time
SRC = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(__file__), "..", "src")
sys.path.insert(0, os.path.abspath(SRC))
os.chdir(os.path.abspath(SRC))
import torch
torch.set_num_threads(os.cpu_count() or 4)
os.environ.setdefault('HF_HUB_OFFLINE', '1')
import acestep.core.generation.handler.init_service_downloads as _dl
_dl.check_main_model_exists = lambda *a, **k: True  # DiT only: no language model here
from acestep.handler import AceStepHandler
from acestep.inference import GenerationParams, GenerationConfig, generate_music
from acestep.llm_inference import LLMHandler

jobs = json.load(open(sys.argv[1]))
out = os.path.abspath(sys.argv[2])
os.makedirs(out, exist_ok=True)
t0 = time.time()
dit = AceStepHandler()
# ACE_DIT picks the diffusion model: the 2B turbo (the default) or the 4B XL turbo, "acestep-v15-xl-turbo".
msg, ok = dit.initialize_service(project_root=os.path.abspath(SRC), config_path=os.environ.get("ACE_DIT", "acestep-v15-turbo"), device="cpu")
print("init", ok, msg[:300], f"{time.time()-t0:.0f}s", flush=True)
if not ok:
    sys.exit(1)
llm = None
if os.environ.get("USE_LM"):
    llm = LLMHandler()
    m, ok = llm.initialize(checkpoint_dir=os.path.join(os.path.abspath(SRC), "checkpoints"), lm_model_path="acestep-5Hz-lm-0.6B", backend="pt", device="cpu", dtype=torch.bfloat16)
    print("lm", ok, m[:200], flush=True)
    if not ok:
        sys.exit(1)
for j in jobs:
    dest = os.path.join(out, j["id"])
    if os.path.exists(dest) and any(f.endswith(".flac") for f in os.listdir(dest)):
        print("skip", j["id"], flush=True)
        continue
    t = time.time()
    p = GenerationParams(caption=j["caption"], lyrics="[Instrumental]", instrumental=True, bpm=j["bpm"], keyscale=j.get("key", ""),
                         timesignature=str(j.get("ts", 4)), duration=j["duration"], inference_steps=j.get("steps", 8), seed=j["seed"],
                         thinking=llm is not None, use_cot_caption=False, use_cot_language=False, use_cot_metas=False)
    c = GenerationConfig(batch_size=1, use_random_seed=False, seeds=[j["seed"]], audio_format="flac")
    r = generate_music(dit, llm, p, c, save_dir=dest)
    print(j["id"], "ok" if r.success else f"FAILED {r.error}", [a.get("path") for a in (r.audios or [])], f"{time.time()-t:.0f}s", flush=True)
