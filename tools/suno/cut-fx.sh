#!/usr/bin/env bash
# The two Suno sound-effect songs (PROMPTS.md) cut into the booth's sounds by arithmetic alone: at 60 BPM
# a bar is 4 s, and bar k holds sound k from its first beat. Each slot is cut, its silence trimmed off
# both ends, faded in 3 ms and out 40 ms so it never clicks, capped at 3.6 s, brought to an even
# loudness, and written as the site serves its audio, named by the sound's id in the booth
# (src/v4/booth/sounds.ts; "ui-" for the site's own small sounds, src/v4/sfx.svelte.ts):
#   sampler/<id>.m4a    AAC 192 kbit/s, 48 kHz
#   sampler/<id>.webm   Opus 128 kbit/s, for a browser without AAC
#
# If Suno put something before bar 1, set that song's OFFSET (seconds) in the table.
# usage: ./cut-fx.sh [folder holding fx01.wav fx02.wav]   (needs ffmpeg with libopus)
set -euo pipefail
cd "${1:-.}"
SLOT=4
AF="silenceremove=start_periods=1:start_threshold=-45dB,atrim=end=3.6,areverse,silenceremove=start_periods=1:start_threshold=-50dB,afade=t=in:d=0.04,areverse,afade=t=in:d=0.003,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000"
#  file      OFFSET  the sounds, one per bar, in order
songs=(
  "fx01.wav 0 airhorn siren riser boom laser scratch clap crash bells clink champagne harp applause fireworks drumroll confetti guira cencerro timbal bocina domino botella clave cowbell hatroll snap partyhorn balloonpop candleblow kazoo cheer countdown midnight apito surdo repinique cuica steelpan stadiumhorn buzzer organcharge crowdchant rimshot ding wrong"
  "fx02.wav 0 ooh thunder creak howl organhit chains heartbeat firecrackers liondrum chacymbal guzheng rave hoover conga logdrum talkingdrum shaker whistle agogo gong taiko coin sparkle doum tek riq oud mizmar dhol tabla templebell conch ghungroo pate toere ukulele wave ui-needle ui-scratch ui-tick ui-rewind ui-riser ui-mictap ui-cheer"
)
mkdir -p sampler
for line in "${songs[@]}"; do
  set -- $line
  file=$1 off=$2
  shift 2
  if [ ! -f "$file" ]; then echo "skipped: no $file"; continue; fi
  k=0
  for id in "$@"; do
    start=$(awk -v o="$off" -v k="$k" -v s="$SLOT" 'BEGIN { printf "%.3f", o + k * s }')
    ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$start" -t "$SLOT" -i "$file" \
      -af "$AF" -c:a aac -b:a 192k "sampler/$id.m4a" \
      -af "$AF" -c:a libopus -b:a 128k "sampler/$id.webm"
    printf '%-14s %s  bar %2d  from %7.3f s\n' "$id" "$file" "$((k + 1))" "$start"
    k=$((k + 1))
  done
done
