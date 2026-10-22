#!/usr/bin/env bash
set -euo pipefail
# Run from the repository root. Pass a directory containing the two originals.
source_dir="${1:?Usage: bash scripts/prepare-media.sh /path/to/originals}"
encode() {
  local source_path="$1" output_dir="$2" output_name="$3" poster_time="$4" frame_one="$5" frame_two="$6"
  mkdir -p "$output_dir"
  ffmpeg -nostdin -hide_banner -loglevel error -y -threads 2 -i "$source_path" \
    -vf scale=720:1280 -c:v libx264 -threads 2 -preset medium -crf 23 \
    -pix_fmt yuv420p -movflags +faststart -an "$output_dir/$output_name.tmp.mp4"
  ffmpeg -nostdin -v error -i "$output_dir/$output_name.tmp.mp4" -f null -
  mv "$output_dir/$output_name.tmp.mp4" "$output_dir/$output_name.mp4"
  ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$poster_time" -i "$source_path" \
    -vf scale=900:1600 -frames:v 1 -c:v libwebp -quality 82 "$output_dir/poster.webp"
  ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$frame_one" -i "$source_path" \
    -vf scale=480:-1 -frames:v 1 -c:v libwebp -quality 78 "$output_dir/frame-01.webp"
  ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$frame_two" -i "$source_path" \
    -vf scale=480:-1 -frames:v 1 -c:v libwebp -quality 78 "$output_dir/frame-02.webp"
}
encode "$source_dir/jordan_render_instagram.mp4" public/media/time-block jordan 6.4 2.5 10.5
encode "$source_dir/water_dance_2_HQ.mp4" public/media/depth-echo water-dance 6.8 2.8 9.4
