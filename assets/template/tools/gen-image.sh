#!/bin/zsh
# Usage: gen-image.sh <name> <bg|ill> "<subject>"
# Generates one text-free image with the Codex CLI image tool, keeps the PNG in assets/src/
# and writes a compressed JPG to assets/img/<name>.jpg for the deck.
set -e
cd "$(dirname "$0")/.."
name=$1; kind=$2; subject=$3

# Edit these three lines per deck so every image shares one palette and mood.
PALETTE="deep ink navy #0A1220 base, signal cyan #3FE0D0 glow accents, a small touch of warm amber"
BG_STYLE="16:9 landscape (~1672x941). Cinematic dark background for a premium presentation. Keep the LEFT 55% of the frame very dark and calm as empty negative space for text overlay; put visual interest on the right. Palette: $PALETTE. Photoreal, volumetric haze, subtle."
ILL_STYLE="Square 1:1 (1024x1024). Premium 3D product-style render, single clear subject centered with generous margin, on a seamless dark backdrop that fades to near-black at the edges. Palette: $PALETTE, soft rim light. Clean, minimal, realistic materials, no clutter."

[[ $kind == bg ]] && style=$BG_STYLE || style=$ILL_STYLE
mkdir -p assets/src assets/img tools/logs
# stdin from /dev/null: codex waits on an open stdin when launched in the background.
codex exec --skip-git-repo-check -s workspace-write "Use your image generation tool to create ONE image. $style Subject: $subject. ABSOLUTELY NO text, letters, numbers, logos, brand marks, labels, screens with readable UI, or signage anywhere in the image. Save the final image to ./assets/src/$name.png (copy it there from wherever the tool saved it). Do nothing else." < /dev/null > "tools/logs/$name.log" 2>&1
[[ -f assets/src/$name.png ]] || { echo "FAILED $name (see tools/logs/$name.log)"; exit 1; }
sips -s format jpeg -s formatOptions 82 "assets/src/$name.png" --out "assets/img/$name.jpg" >/dev/null
echo "done $name"
