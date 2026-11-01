#!/usr/bin/env bash
# The deck's loops made several genres a generation (BLOCKS.md), cut by arithmetic alone: each block
# keeps one tempo and gives each genre one 12-bar section, in the order listed, from 0:00 (or from
# OFFSET seconds, if Suno put something first). A bar is 240/BPM seconds; genre k's section starts at
# k x 12 bars, and its loop is that section's bars 3 to 10, clear of the cuts on either side.
#   loops/<genre>.wav              the loop, 8 whole bars, to listen to and to loop
#   masters/<genre>/<genre>.flac   the loop played over and over, for tools/loops/make_loops.py
# usage: ./cut-blocks.sh [folder holding block01.wav ...]   (needs ffmpeg)
set -euo pipefail
cd "${1:-.}"
OFFSET=${OFFSET:-0}
#  file         BPM  the genres, in the order of their sections
blocks=(
  "block01.wav 92 rnb hiphop islandreggae kizomba"
  "block02.wav 92 reggaeton dancehall lounge cumbia"
  "block03.wav 102 bhangra khaleeji samba rai kuthu"
  "block04.wav 112 afrobeats tropicalhouse amapiano citypop"
  "block05.wav 120 highlife disco country orientalhouse gnawa"
  "block06.wav 120 kompa italodisco pop bollywood halay"
  "block07.wav 124 afrohouse house electroswing kpop"
  "block08.wav 124 rock dembow gqom techhouse"
  "block09.wav 128 edm melbournebounce garba dabke polynesian"
  "block10.wav 128 bachata mahraganat baile phonk"
  "block11.wav 134 techno ukgarage dangdut kuduro molam trance"
  "block12.wav 140 trap jerseyclub chiptune goa"
  "block13.wav 150 merengue futurebass hardstyle eurobeat soca"
  "block14.wav 174 asianunderground funkot dnb salsa"
)
mkdir -p loops masters
for line in "${blocks[@]}"; do
  set -- $line
  file=$1 bpm=$2
  shift 2
  if [ ! -f "$file" ]; then echo "skipped: no $file"; continue; fi
  k=0
  for genre in "$@"; do
    read -r start len reps < <(awk -v b="$bpm" -v k="$k" -v o="$OFFSET" 'BEGIN {
      bar = 240 / b; len = 8 * bar; printf "%.4f %.6f %d\n", o + (k * 12 + 2) * bar, len, int((16 * bar + 8) / len) + 1 }')
    mkdir -p "masters/$genre"
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -t "$len" -i "$file" -c:a pcm_s24le "loops/$genre.wav"
    ffmpeg -nostdin -hide_banner -loglevel error -y -stream_loop "$((reps - 1))" -i "loops/$genre.wav" -c:a flac "masters/$genre/$genre.flac"
    printf '%-17s %s  %3s BPM  loop from %8.3f s, 8 bars = %7.3f s\n' "$genre" "$file" "$bpm" "$start" "$len"
    k=$((k + 1))
  done
done
