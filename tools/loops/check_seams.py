"""How well each loop joins itself: decode its stems, sum them, play the loop
twice end to end, track the beats, fit a straight grid, and report the
largest miss of a beat within a bar either side of the join, in ms.
A loop whose tempo or length is wrong misses by tens of milliseconds there.

usage: python -I check_seams.py loops_dir
"""

import json, os, subprocess, sys
import numpy as np, librosa


def decode(path, sr=22050):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(sr), "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def main(root):
    index = json.load(open(os.path.join(root, "index.json")))
    worst = 0.0
    for genre, info in index.items():
        sr = 22050
        mix = sum(decode(os.path.join(root, genre, f)) for f in info["files"].values())
        pre, n = int(info["pre"] * sr), int(round(info["seconds"] * sr))
        loop = mix[pre:pre + n]
        twice = np.concatenate([loop, loop])
        hop = 64
        env = librosa.onset.onset_strength(y=twice, sr=sr, hop_length=hop)
        _, beats = librosa.beat.beat_track(onset_envelope=env, sr=sr, hop_length=hop, start_bpm=info["bpm"], tightness=400)
        t = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
        k = np.arange(len(t))
        slope, start = np.polyfit(k, t, 1)
        miss = np.abs(t - (start + slope * k))
        near = miss[np.abs(t - info["seconds"]) < 4 * 60 / info["bpm"]]
        m = float(near.max() * 1000) if len(near) else float("nan")
        worst = max(worst, m)
        print(f"{genre:10} {info['bpm']:7.2f} bpm  grid {60 / slope:7.2f}  seam miss {m:5.1f} ms  ({len(t)} beats)")
    print(f"worst {worst:.1f} ms")


if __name__ == "__main__":
    main(sys.argv[1])
