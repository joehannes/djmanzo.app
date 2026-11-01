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
  "techno 132"
  "ukgarage 132"
  "trance 138"
  "dnb 174"
  "hardstyle 150"
  "house 124"
  "edm 128"
  "afrobeats 110"
  "italodisco 120"
  "lounge 96"
  "techhouse 126"
  "merengue 150"
  "bachata 130"
  "salsa 180"
  "reggaeton 94"
  "cumbia 96"
  "hiphop 90"
  "pop 120"
  "dembow 125"
  "soca 156"
  "samba 104"
  "baile 130"
  "kompa 120"
  "trap 140"
  "rnb 90"
  "jerseyclub 140"
  "country 118"
  "disco 118"
  "phonk 130"
  "amapiano 112"
  "afrohouse 122"
  "highlife 118"
  "gqom 126"
  "dancehall 96"
  "kuduro 135"
  "kizomba 90"
  "kpop 124"
  "citypop 112"
  "funkot 170"
  "futurebass 150"
  "molam 135"
  "eurobeat 155"
  "dangdut 132"
  "rai 105"
  "khaleeji 100"
  "dabke 128"
  "mahraganat 130"
  "orientalhouse 118"
  "gnawa 118"
  "halay 120"
  "bhangra 100"
  "bollywood 120"
  "garba 128"
  "kuthu 105"
  "asianunderground 170"
  "goa 142"
  "islandreggae 90"
  "melbournebounce 128"
  "tropicalhouse 110"
  "polynesian 128"
  "rock 124"
  "chiptune 140"
  "electroswing 124"
)
# A master written again: the same bytes keep the separation made from it (make_loops.py's stems.npy);
# new ones put it away, so the parts are made from what is there now.
settle() {
  if cmp -s "$1/new.tmp" "$1/$2.flac"; then rm "$1/new.tmp"; else mv "$1/new.tmp" "$1/$2.flac" && rm -f "$1/stems.npy"; fi
}
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
  ffmpeg -nostdin -hide_banner -loglevel error -y -stream_loop "$((reps - 1))" -i "loops/$genre.wav" -c:a flac -f flac "masters/$genre/new.tmp"
  settle "masters/$genre" "$genre"
  printf '%-17s %3s BPM  %7.3f s in  ->  %2d bars = %7.3f s, played %d times for the parts\n' "$genre" "$bpm" "$dur" "$bars" "$len" "$reps"
done
