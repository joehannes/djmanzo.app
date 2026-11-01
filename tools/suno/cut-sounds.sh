#!/usr/bin/env bash
# The deck's loops made one genre at a time with Suno Sounds (SOUNDS.md), trimmed by arithmetic alone:
# each download is <genre>.wav (or .mp3), made at the BPM in the table below, so a bar is 240/BPM
# seconds. The loop is the longest whole run of 1, 2, 4, 8 or 16 bars from the file's start (Suno's
# loops start on the downbeat; anything past the last whole bar is a tail and goes, and a file a few
# milliseconds short of its last bar is padded to it, so the loop keeps the grid). For each genre:
#   loops/<genre>.wav              the loop itself, whole bars, to listen to and to loop
#   masters/<genre>/<genre>.flac   the loop played over and over, long enough for
#                                  tools/loops/make_loops.py to make the deck's drums, bass and rest
#                                  (a loop repeated is the same at every bar, so any 16 bars of it join)
# usage: ./cut-sounds.sh [folder holding the downloads]   (needs ffmpeg and ffprobe)
set -euo pipefail
cd "${1:-.}"
#  genre  BPM (as set in Suno for that loop)
genres=(
  "rnb 90"
  "hiphop 90"
  "islandreggae 90"
  "reggaeton 94"
  "dancehall 96"
  "lounge 96"
  "cumbia 96"
  "bhangra 100"
  "khaleeji 100"
  "rai 105"
  "kuthu 105"
  "afrobeats 110"
  "amapiano 112"
  "tropicalhouse 110"
  "citypop 112"
  "highlife 118"
  "kompa 120"
  "disco 118"
  "italodisco 120"
  "pop 120"
  "country 118"
  "electroswing 124"
  "bollywood 120"
  "house 124"
  "afrohouse 122"
  "orientalhouse 118"
  "gnawa 118"
  "kpop 124"
  "gqom 126"
  "edm 128"
  "melbournebounce 128"
  "rock 124"
  "dembow 125"
  "bachata 130"
  "mahraganat 130"
  "garba 128"
  "dabke 128"
  "polynesian 128"
  "baile 130"
  "kuduro 135"
  "techno 132"
  "ukgarage 132"
  "molam 135"
  "trance 138"
  "goa 142"
  "trap 140"
  "merengue 150"
  "eurobeat 155"
  "futurebass 150"
  "hardstyle 150"
  "soca 156"
  "jerseyclub 140"
  "dnb 174"
  "asianunderground 170"
  "funkot 170"
  "salsa 180"
  "chiptune 140"
)
mkdir -p loops masters
for line in "${genres[@]}"; do
  set -- $line
  genre=$1 bpm=$2
  file=""
  for f in "$genre.wav" "$genre.mp3"; do [ -f "$f" ] && file=$f && break; done
  if [ -z "$file" ]; then echo "skipped: no $genre.wav"; continue; fi
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$file")
  read -r bars len reps < <(awk -v d="$dur" -v b="$bpm" 'BEGIN {
    bar = 240 / b; n = int((d + 0.03) / bar); p = 0
    for (q = 16; q >= 1; q /= 2) if (n >= q) { p = q; break }
    len = p * bar; reps = (p ? int((16 * bar + 8) / len) + 1 : 0)
    printf "%d %.6f %d\n", p, len, reps }')
  if [ "$bars" -eq 0 ]; then echo "skipped: $file is shorter than one bar at $bpm BPM"; continue; fi
  mkdir -p "masters/$genre"
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$file" -af apad -t "$len" -c:a pcm_s24le "loops/$genre.wav"
  ffmpeg -nostdin -hide_banner -loglevel error -y -stream_loop "$((reps - 1))" -i "loops/$genre.wav" -c:a flac "masters/$genre/$genre.flac"
  printf '%-17s %3s BPM  %7.3f s in  ->  %2d bars = %7.3f s, played %d times for the parts\n' "$genre" "$bpm" "$dur" "$bars" "$len" "$reps"
done
