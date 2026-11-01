#!/usr/bin/env bash
# The ten Suno loop songs (PROMPTS.md) cut into the deck's 57 genres by arithmetic alone: each song keeps
# one tempo, and its sections run back to back from its start, each the same number of bars. A bar is
# 240/BPM seconds; section k starts at OFFSET + k x (bars per section) bars.
#
# For each genre it writes, named by the genre's id on the site:
#   masters/<genre>/<genre>.flac   the whole section: what tools/loops/make_loops.py turns into the deck's
#                                  drums, bass and rest (it finds the exact beat and cuts the seam)
#   loops/<genre>.wav              the loop itself, whole bars from 4 bars into the section, to listen to
#
# If Suno put something before the first section, set that song's OFFSET (seconds) in the table.
# usage: ./cut-loops.sh [folder holding song01.wav ... song10.wav]   (needs ffmpeg)
set -euo pipefail
cd "${1:-.}"
#  file        BPM  bars per section  loop bars  OFFSET  the genres, in the order of the sections
songs=(
  "song01.wav  92 16  8 0 rnb hiphop islandreggae reggaeton dancehall lounge"
  "song02.wav 100 16  8 0 cumbia bhangra khaleeji rai kuthu"
  "song03.wav 112 16  8 0 afrobeats amapiano tropicalhouse citypop highlife kompa"
  "song04.wav 120 24 16 0 disco italodisco pop country electroswing bollywood"
  "song05.wav 124 24 16 0 house afrohouse orientalhouse gnawa kpop gqom"
  "song06.wav 128 24 16 0 edm melbournebounce rock dembow bachata mahraganat"
  "song07.wav 130 24 16 0 garba dabke polynesian baile kuduro"
  "song08.wav 136 24 16 0 techno ukgarage molam trance goa trap"
  "song09.wav 150 24 16 0 merengue eurobeat futurebass hardstyle soca jerseyclub"
  "song10.wav 174 24 16 0 dnb asianunderground funkot salsa chiptune"
)
# A master written again: the same bytes keep the separation made from it (make_loops.py's stems.npy);
# new ones put it away, so the parts are made from what is there now.
settle() {
  if cmp -s "$1/new.tmp" "$1/$2.flac"; then rm "$1/new.tmp"; else mv "$1/new.tmp" "$1/$2.flac" && rm -f "$1/stems.npy"; fi
}
mkdir -p masters loops
for line in "${songs[@]}"; do
  set -- $line
  file=$1 bpm=$2 sec=$3 loop=$4 off=$5
  shift 5
  if [ ! -f "$file" ]; then echo "skipped: no $file"; continue; fi
  k=0
  for genre in "$@"; do
    read -r start len lstart llen < <(awk -v b="$bpm" -v s="$sec" -v l="$loop" -v o="$off" -v k="$k" \
      'BEGIN { bar = 240 / b; st = o + k * s * bar; printf "%.4f %.4f %.4f %.4f\n", st, s * bar, st + 4 * bar, l * bar }')
    mkdir -p "masters/$genre"
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -t "$len" -i "$file" -c:a flac -f flac "masters/$genre/new.tmp"
    settle "masters/$genre" "$genre"
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$lstart" -t "$llen" -i "$file" -c:a pcm_s24le "loops/$genre.wav"
    printf '%-17s %s  %3s BPM  section %8.3f s + %7.3f s   loop %2s bars = %7.3f s\n' "$genre" "$file" "$bpm" "$start" "$len" "$loop" "$llen"
    k=$((k + 1))
  done
done
