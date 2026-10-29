#!/usr/bin/env bash
set -euo pipefail
# Run from the repository root, with ffmpeg installed. Originals are not committed.
source_dir="${1:?Usage: bash scripts/prepare-media.sh /path/to/originals}"
encode() {
  local source_path="$1" output_dir="$2" output_name="$3" poster_time="$4" frame_one="$5" frame_two="$6"
  [[ -f "$source_path" ]] || { echo "Missing original: $source_path" >&2; exit 1; }
  mkdir -p "$output_dir"
  for size in 1080 720; do
    local suffix="" height=1280
    if [[ "$size" = 1080 ]]; then suffix="-1080"; height=1920; fi
    local target="$output_dir/$output_name$suffix.mp4"
    ffmpeg -nostdin -hide_banner -loglevel error -y -threads 2 -i "$source_path" \
      -vf "scale=$size:$height:force_original_aspect_ratio=decrease,pad=$size:$height:(ow-iw)/2:(oh-ih)/2" \
      -c:v libx264 -threads 2 -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart -an "$target.tmp.mp4"
    ffmpeg -nostdin -v error -i "$target.tmp.mp4" -f null -
    node -e 'if(require("node:fs").statSync(process.argv[1]).size >= 25000000) throw Error("Cloudflare 25 MB file limit exceeded: "+process.argv[1])' "$target.tmp.mp4"
    mv "$target.tmp.mp4" "$target"
  done
  local poster_scale="null"
  if [[ "$output_name" != jordan ]]; then poster_scale="scale=900:1600"; fi
  # Decode the delivered fallback: Jordan's poster must be exactly its frame zero.
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$output_dir/$output_name.mp4" \
    -ss "$poster_time" -vf "$poster_scale" -frames:v 1 -c:v libwebp -lossless 1 "$output_dir/poster.webp"
  ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$frame_one" -i "$source_path" \
    -vf scale=480:853 -frames:v 1 -c:v libwebp -quality 90 "$output_dir/frame-01.webp"
  ffmpeg -nostdin -hide_banner -loglevel error -y -ss "$frame_two" -i "$source_path" \
    -vf scale=480:853 -frames:v 1 -c:v libwebp -quality 90 "$output_dir/frame-02.webp"
}
# Check both inputs before replacing any delivered media.
for source_file in jordan_render_instagram.mp4 water_dance_2_HQ.mp4; do
  [[ -f "$source_dir/$source_file" ]] || { echo "Missing original: $source_dir/$source_file" >&2; exit 1; }
done
encode "$source_dir/jordan_render_instagram.mp4" public/media/time-block jordan 0 2.5 10.5
encode "$source_dir/water_dance_2_HQ.mp4" public/media/depth-echo water-dance 6.8 2.8 9.4
# HD files are picked up automatically by the prerenderer; update metadata to the decoded poster size.
node --experimental-strip-types scripts/prepare-dither.mjs
