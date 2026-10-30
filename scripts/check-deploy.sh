#!/bin/zsh
# Usage: check-deploy.sh <base-url>
# Confirms the deck and its assets are served and that working files stay private.
base=${1%/}
[[ -n $base ]] || { echo "usage: check-deploy.sh <base-url>"; exit 2; }
fail=0
check() { code=$(curl -s -o /dev/null -w '%{http_code}' "$base$1"); [[ $code == $2 ]] && echo "ok   $code $1" || { echo "FAIL $code $1 (want $2)"; fail=1; }; }
check / 200; check /deck.js 200; check /deck.css 200
first_img=$(curl -s "$base/" | grep -o 'assets/img/[^")]*\.jpg' | head -1)
[[ -n $first_img ]] && check "/$first_img" 200
for p in /assets/src/ /tools/gen-image.sh /tools/image-list.tsv /plans/ /.claude/ /.vercel/project.json; do check $p 404; done
exit $fail
