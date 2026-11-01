#!/usr/bin/env bash
# The deck's loops made ten genres a song (BLOCKS.md), cut by arithmetic alone: loop k of a song runs
# from (k-1) x SLOT seconds (21 unless set), plus OFFSET if Suno put something first. Within it, at
# the genre's own tempo (a bar is 240/BPM seconds), it keeps the most whole bars, 1, 2, 4 or 8, that
# leave at least a bar clear of the cut on either side, in the middle of the slot on its bar grid.
#   loops/<genre>.wav              the loop, whole bars, to listen to and to loop
#   masters/<genre>/<genre>.flac   the loop played over and over, for tools/loops/make_loops.py
# usage: [SLOT=21] [OFFSET=0] ./cut-blocks.sh [folder holding medley01.wav ...] [medley03.wav ...]
#   naming files cuts only those, so one song can have its own SLOT or OFFSET
# (needs ffmpeg and ffprobe)
set -euo pipefail
cd "${1:-.}"
shift || true
ONLY="$*"
SLOT=${SLOT:-21}
OFFSET=${OFFSET:-0}
#  file          genre:BPM, in the order of their loops
blocks=(
  "medley01.wav hiphop:90 islandreggae:90 kizomba:90 rnb:90 reggaeton:94 cumbia:96 dancehall:96 lounge:96 bhangra:100 khaleeji:100"
  "medley02.wav samba:104 kuthu:105 rai:105 afrobeats:110 tropicalhouse:110 amapiano:112 citypop:112 country:118 disco:118 gnawa:118"
  "medley03.wav highlife:118 orientalhouse:118 bollywood:120 halay:120 italodisco:120 kompa:120 pop:120 afrohouse:122 electroswing:124 house:124"
  "medley04.wav kpop:124 rock:124 dembow:125 gqom:126 techhouse:126 dabke:128 edm:128 garba:128 melbournebounce:128 polynesian:128"
  "medley05.wav bachata:130 baile:130 mahraganat:130 phonk:130 dangdut:132 techno:132 ukgarage:132 kuduro:135 molam:135 trance:138"
  "medley06.wav chiptune:140 jerseyclub:140 trap:140 goa:142 futurebass:150 hardstyle:150 merengue:150 eurobeat:155 soca:156 asianunderground:170"
  "medley07.wav funkot:170 dnb:174 salsa:180"
)
# A master written again: the same bytes keep the separation made from it (make_loops.py's stems.npy);
# new ones put it away, so the parts are made from what is there now.
settle() {
  if cmp -s "$1/new.tmp" "$1/$2.flac"; then rm "$1/new.tmp"; else mv "$1/new.tmp" "$1/$2.flac" && rm -f "$1/stems.npy"; fi
}
mkdir -p loops masters
for line in "${blocks[@]}"; do
  set -- $line
  file=$1
  shift
  if [ -n "$ONLY" ] && [[ " $ONLY " != *" $file "* ]]; then continue; fi
  if [ ! -f "$file" ]; then echo "skipped: no $file"; continue; fi
  # A song much longer or shorter than its grid: say how to move it, and cut it as asked all the same.
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$file")
  awk -v d="$dur" -v n=$# -v s="$SLOT" -v o="$OFFSET" -v f="$file" 'BEGIN {
    want = o + n * s
    if (d < want - 1 || d > want + 12)
      printf "note: %s is %.1f s, its %d loops of %s s from %s s make %.1f s: if they are even, SLOT=%.2f\n", f, d, n, s, o, want, (d - o) / n }'
  k=0
  for pair in "$@"; do
    genre=${pair%%:*} bpm=${pair##*:}
    read -r start len bars reps < <(awk -v b="$bpm" -v k="$k" -v s="$SLOT" -v o="$OFFSET" 'BEGIN {
      bar = 240 / b; fit = int(s / bar); n = 1
      while (n * 2 <= fit - 2 && n < 8) n *= 2
      m = int((fit - n) / 2); len = n * bar
      printf "%.4f %.6f %d %d\n", o + k * s + m * bar, len, n, int((16 * bar + 8) / len) + 1 }')
    mkdir -p "masters/$genre"
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -t "$len" -i "$file" -af apad -t "$len" -c:a pcm_s24le "loops/$genre.wav"
    ffmpeg -nostdin -hide_banner -loglevel error -y -stream_loop "$((reps - 1))" -i "loops/$genre.wav" -c:a flac -f flac "masters/$genre/new.tmp"
    settle "masters/$genre" "$genre"
    printf '%-17s %s  loop %2d  %3s BPM  from %8.3f s, %d bars = %7.3f s\n' "$genre" "$file" "$((k + 1))" "$bpm" "$start" "$bars" "$len"
    k=$((k + 1))
  done
done
