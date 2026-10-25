"""Turn the generated genre tracks into the site's looping stems.

For each genre: separate the 48 kHz master with Demucs (htdemucs_ft) into
drums, bass and the rest (other + vocals: the tracks are instrumentals);
find the tempo the track really has (near the one it was made at) and the
beat, from a line through its tracked beats; take the
loudest 8 or 16 whole bars; make the seam continuous with a short
equal-power crossfade into what follows; and write each stem as
[the loop's last 0.25 s][the loop][its first 0.25 s], so the file is
periodic around the loop and a decoder's few milliseconds of priming never
reach the seam. Each stem is AAC at 192 kbit/s, 44.1 kHz stereo; beside
them, the loop's waveform (per stem and per band, 100 a second) for drawing.

usage: python -I make_loops.py jobs.json masters_dir out_dir
"""

import base64, json, math, os, subprocess, sys
import numpy as np
import soundfile as sf
import torch, librosa
from scipy.signal import butter, sosfiltfilt
from demucs.pretrained import get_model
from demucs.apply import apply_model

PRE = POST = 0.25  # seconds of wrap-around either side of the loop
FADE = 0.03  # the seam's crossfade
RATE = 100  # waveform points a second
STEMS = ["drums", "bass", "rest"]
BANDS = [(None, 200), (200, 2500), (2500, None)]

CAMELOT = {  # key -> Camelot code
    "A minor": "8A", "E minor": "9A", "B minor": "10A", "F# minor": "11A", "C# minor": "12A", "G# minor": "1A",
    "D# minor": "2A", "A# minor": "3A", "F minor": "4A", "C minor": "5A", "G minor": "6A", "D minor": "7A",
    "C major": "8B", "G major": "9B", "D major": "10B", "A major": "11B", "E major": "12B", "B major": "1B",
    "F# major": "2B", "C# major": "3B", "G# major": "4B", "D# major": "5B", "A# major": "6B", "F major": "7B",
}

torch.set_num_threads(os.cpu_count() or 4)


def tempo_and_beat(mono, sr, asked):
    """The tempo and the beat's phase (s). The tempo is the bar length at which the onsets line up best
    with themselves one to eight bars later, searched to a twentieth of a millisecond within 4 % of the
    tempo asked: a loop that is a whole number of those bars joins itself wherever it starts. (A
    straight line through tracked beats, used before, was 2 % out on a bachata and a techno loop, which
    put their seams most of a beat out.) The phase is where a comb at that tempo catches most onsets."""
    y = librosa.resample(mono, orig_sr=sr, target_sr=22050)
    hop = 32
    env = librosa.onset.onset_strength(y=y, sr=22050, hop_length=hop)
    env = env - env.mean()
    fps = 22050 / hop

    def shifted(lag):  # the envelope against itself `lag` frames later, at a fractional lag
        i = int(lag)
        f = lag - i
        a = env[: len(env) - i - 1]
        return float(np.dot(a, (1 - f) * env[i: len(env) - 1] + f * env[i + 1:])) / len(a)

    nominal = 240 / asked * fps
    k = max(1, min(8, int(len(env) / nominal) - 2))
    bars = np.arange(nominal * 0.96, nominal * 1.04, 0.01)
    bar = bars[int(np.argmax([sum(shifted(j * b) for j in range(1, k + 1)) for b in bars]))]
    beat = bar / 4
    phases = np.arange(0, beat, 0.25)
    score = [env[np.round(np.arange(p, len(env) - 1, beat)).astype(int)].sum() for p in phases]
    return float(240 / (bar / fps)), float(phases[int(np.argmax(score))] / fps)


def seam(x, start, n, fade):
    """x[start:start+n], its first `fade` samples crossfaded with what follows the loop, so its end runs into its start."""
    loop = x[:, start:start + n].copy()
    t = np.linspace(0, math.pi / 2, fade)
    loop[:, :fade] = loop[:, :fade] * np.sin(t) + x[:, start + n:start + n + fade] * np.cos(t)
    return loop


def envelope(x, sr):
    """RMS, RATE times a second, of a mono signal over one period of the loop."""
    hop = sr / RATE
    n = int(round(len(x) / hop))
    return np.array([math.sqrt(float(np.mean(x[int(i * hop):max(int(i * hop) + 1, int((i + 1) * hop))] ** 2))) for i in range(n)])


def b64(levels):
    return base64.b64encode(np.clip(np.round(levels * 255), 0, 255).astype(np.uint8).tobytes()).decode()


def main(jobs_path, masters, out):
    jobs = json.load(open(jobs_path))
    model = get_model("htdemucs_ft")
    model.eval()
    sr = model.samplerate
    # Genres made before keep their entries; the ones made now replace theirs.
    made = os.path.join(out, "index.json")
    index = json.load(open(made)) if os.path.exists(made) else {}
    for job in jobs:
        gid, asked = job["genre"], job["bpm"]
        src = os.path.join(masters, job["id"])
        flac = next(os.path.join(src, f) for f in os.listdir(src) if f.endswith(".flac"))
        # The separation, kept beside the master: cutting the loop again needs no second hour of Demucs.
        kept = os.path.join(src, "stems.npy")
        if os.path.exists(kept):
            parts = np.load(kept).astype(np.float32)
        else:
            y, sr0 = sf.read(flac, always_2d=True, dtype="float32")
            y = librosa.resample(y.T, orig_sr=sr0, target_sr=sr)
            with torch.no_grad():
                parts = apply_model(model, torch.from_numpy(y)[None], split=True, overlap=0.25, progress=False)[0].numpy()
            np.save(kept, parts.astype(np.float16))
        names = model.sources
        stems = {"drums": parts[names.index("drums")], "bass": parts[names.index("bass")], "rest": parts[names.index("other")] + parts[names.index("vocals")]}
        mix = sum(stems.values())
        bpm, phase = tempo_and_beat(mix.mean(axis=0), sr, asked)
        beat = 60 / bpm
        dur = mix.shape[1] / sr
        bars = 16 if 16 * 4 * beat <= 34 else 8
        length = bars * 4 * beat
        if 3 + length + FADE + POST > dur - 3:
            bars, length = 8, 8 * 4 * beat
        # The loudest stretch of whole bars, starting on a beat, clear of the first and last 3 s.
        rms = librosa.feature.rms(y=mix.mean(axis=0), hop_length=512)[0]
        fps = sr / 512
        starts = [phase + k * beat for k in range(int(dur / beat)) if 3 <= phase + k * beat and phase + k * beat + length + FADE + POST <= dur - 3]
        start = max(starts, key=lambda s: rms[int(s * fps):int((s + length) * fps)].mean())
        s0, n, fade, pre, post = int(round(start * sr)), int(round(length * sr)), int(FADE * sr), int(PRE * sr), int(POST * sr)
        os.makedirs(os.path.join(out, gid), exist_ok=True)
        info = {"bpm": round(bpm, 2), "key": job["key"], "camelot": CAMELOT.get(job["key"], ""), "bars": bars, "seconds": n / sr, "pre": pre / sr, "frames": pre + n + post, "sampleRate": sr, "stems": STEMS, "files": {}, "opus": {}}
        peaks = {"rate": RATE, "stems": {}, "bands": {}}
        loops = {}
        for name in STEMS:
            loop = seam(stems[name], s0, n, fade)
            loops[name] = loop
            data = np.concatenate([loop[:, -pre:], loop, loop[:, :post]], axis=1).T
            wav = os.path.join(out, gid, f"{name}.wav")
            sf.write(wav, data, sr, subtype="FLOAT")
            m4a = os.path.join(out, gid, f"{name}.m4a")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-c:a", "aac", "-b:a", "192k", "-ar", str(sr), "-ac", "2", "-movflags", "+faststart", m4a], check=True)
            # The same in Opus, for a browser that cannot decode AAC (Chromium without its codecs, some Linux Firefoxes).
            webm = os.path.join(out, gid, f"{name}.webm")
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-c:a", "libopus", "-b:a", "160k", "-ac", "2", webm], check=True)
            os.remove(wav)
            info["files"][name] = f"{name}.m4a"
            info["opus"][name] = f"{name}.webm"
        # Waveforms over one period: each stem's level, and each stem's low, mid and high bands.
        top = max(envelope(l.mean(axis=0), sr).max() for l in loops.values())
        for name, loop in loops.items():
            mono = loop.mean(axis=0)
            peaks["stems"][name] = b64(envelope(mono, sr) / top)
            bands = []
            for lo, hi in BANDS:
                sos = butter(4, [lo, hi] if lo and hi else (hi or lo), btype="band" if lo and hi else ("low" if hi else "high"), fs=sr, output="sos")
                bands.append(envelope(sosfiltfilt(sos, mono), sr))
            peaks["bands"][name] = bands
        btop = max(max(b.max() for b in bs) for bs in peaks["bands"].values())
        peaks["bands"] = {name: [b64(b / btop) for b in bs] for name, bs in peaks["bands"].items()}
        json.dump(peaks, open(os.path.join(out, gid, "peaks.json"), "w"))
        index[gid] = info
        print(gid, f"{bpm:.2f} bpm (asked {asked})", f"{bars} bars {length:.2f}s from {start:.2f}s", flush=True)
    json.dump(index, open(made, "w"), indent=1)


if __name__ == "__main__":
    main(*sys.argv[1:4])
