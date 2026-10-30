#!/bin/zsh
# Generate every image in tools/image-list.tsv whose JPG is missing, 4 Codex jobs at a time.
# To regenerate one image, delete assets/img/<name>.jpg and run this again.
cd "$(dirname "$0")/.."
while IFS=$'\t' read -r name kind subject; do
  [[ -z $name || $name == \#* ]] && continue
  [[ -f assets/img/$name.jpg ]] && continue
  printf '%s\0%s\0%s\0' "$name" "$kind" "$subject"
done < tools/image-list.tsv | xargs -0 -n 3 -P 4 tools/gen-image.sh
echo "$(ls assets/img/*.jpg 2>/dev/null | wc -l | tr -d ' ') images in assets/img"
