#!/usr/bin/env bash
# Everything Suno made, onto the site in one go, from the folder its files were saved in:
#   medley01.wav ... medley07.wav   (BLOCKS.md)    -> the deck's loops, each genre in three parts
#   fx01.wav fx02.wav               (PROMPTS.md)   -> the booth's sounds, by their own ids
# Either kind may be missing; what is there is cut, made and put in place:
#   public/v4/loops/<genre>/ and src/v4/loops/index.json   each loop credited to Suno
#   public/v4/sampler/<id>.m4a, .webm and src/v4/booth/sampler.json
# A genre's loop shows in its look, and an occasion's pads in the booth, once its files are in.
# The parts need Demucs (tools/loops/README.md): PYTHON names the Python that has it.
# usage: [PYTHON=python3] [SLOT=21] [OFFSET=0] tools/suno/import.sh <folder>
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../.." && pwd)
dir=$(cd "${1:?usage: import.sh <folder holding the Suno files>}" && pwd)
PYTHON=${PYTHON:-python3}

if ls "$dir"/medley0*.wav >/dev/null 2>&1; then
  echo "== the loops: cut"
  "$here/cut-blocks.sh" "$dir"
  echo "== the loops: parted and looped (Demucs; a while on a CPU)"
  MAKER=Suno "$PYTHON" -I "$root/tools/loops/make_loops.py" "$root/tools/loops/jobs.json" "$dir/masters" "$root/public/v4/loops"
  cp "$root/public/v4/loops/index.json" "$root/src/v4/loops/index.json"
else
  echo "no medley0*.wav in $dir: the loops stay as they are"
fi

if ls "$dir"/fx0*.wav >/dev/null 2>&1; then
  echo "== the sounds: cut"
  "$here/cut-fx.sh" "$dir"
  mkdir -p "$root/public/v4/sampler"
  cp "$dir"/sampler/*.m4a "$dir"/sampler/*.webm "$root/public/v4/sampler/"
else
  echo "no fx0*.wav in $dir: the sounds stay as they are"
fi

# The list the booth reads: every sound with both its files on the site.
(
  cd "$root/public/v4/sampler" 2>/dev/null || exit 0
  for f in *.m4a; do
    if [ -e "$f" ] && [ -f "${f%.m4a}.webm" ]; then printf '%s\n' "${f%.m4a}"; fi
  done
) | sort | awk 'BEGIN { printf "[" } { printf "%s\"%s\"", (NR > 1 ? ", " : ""), $0 } END { print "]" }' >"$root/src/v4/booth/sampler.json"

echo "== on the site now"
"$PYTHON" -I - "$root" <<'EOF'
import json, sys
root = sys.argv[1]
idx = json.load(open(f"{root}/src/v4/loops/index.json"))
suno = sorted(g for g, v in idx.items() if v.get("maker") == "Suno")
print(f"loops: {len(idx)} genres, {len(suno)} of them Suno's: {' '.join(suno)}")
rec = json.load(open(f"{root}/src/v4/booth/sampler.json"))
print(f"recorded sounds: {len(rec)}")
EOF
echo "then: npm run check, npx vitest run, npm run build, npx playwright test; look at the deck and the booth; commit."
