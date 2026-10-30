#!/bin/zsh
# Usage: print-pdf.sh <deck-url> <out.pdf>
# Prints the deck through headless Chrome (print CSS reveals every frame, one slide per page)
# and reports the page count. Use --timeout, not --virtual-time-budget: the latter drops
# background images from the PDF.
set -e
url=$1; out=$2
[[ -n $url && -n $out ]] || { echo "usage: print-pdf.sh <deck-url> <out.pdf>"; exit 2; }
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[[ -x $chrome ]] || chrome=$(command -v google-chrome || command -v chromium || true)
[[ -n $chrome ]] || { echo "Chrome not found"; exit 1; }
"$chrome" --headless=new --disable-gpu --no-pdf-header-footer --run-all-compositor-stages-before-draw \
  --timeout=12000 --print-to-pdf="$out" "$url" >/dev/null 2>&1
pages=$(mdls -raw -name kMDItemNumberOfPages "$out" 2>/dev/null || true)
[[ $pages == "(null)" || -z $pages ]] && pages=$(python3 -c "import re,sys;print(len(re.findall(rb'/Type\s*/Page[^s]',open(sys.argv[1],'rb').read())))" "$out")
echo "$out: $pages pages"
