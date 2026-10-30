#!/bin/zsh
# Usage: new-deck.sh <deck-dir> ["Deck title"]
# Copies the deck template into a new, empty folder (one folder per deck).
set -e
dest=$1; title=${2:-Deck}
[[ -n $dest ]] || { echo "usage: new-deck.sh <deck-dir> [title]"; exit 2; }
if [[ -d $dest && -n "$(ls -A "$dest" 2>/dev/null)" ]]; then echo "refusing: $dest is not empty"; exit 1; fi
src="$(cd "$(dirname "$0")/../assets/template" && pwd)"
mkdir -p "$dest"
cp -R "$src"/. "$dest"/
mkdir -p "$dest/assets/img" "$dest/assets/src" "$dest/tools/logs" "$dest/plans"
python3 - "$dest/index.html" "$title" <<'PY'
import sys; p, t = sys.argv[1], sys.argv[2]
s = open(p, encoding='utf-8').read().replace('{{DECK_TITLE}}', t)
open(p, 'w', encoding='utf-8').write(s)
PY
chmod +x "$dest"/tools/*.sh
echo "deck created at $dest"
