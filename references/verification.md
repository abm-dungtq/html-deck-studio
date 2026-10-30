# Verification

A deck is done when every check below has passed on the final files. Report
any check you could not run; a skipped check is not a pass.

## 1. Serve it locally

Serve the deck folder over HTTP (some browsers block `file://` fonts and
images), on a fixed port per deck:

```bash
python3 -m http.server 4780 --directory <deck-dir>
```

Run it through the runtime's preview/background facility, record the port, and
before starting check the port is free (`lsof -i :4780`); reuse or stop a
stale server instead of picking another port. Stop it when the work ends unless
the user still needs it.

## 2. Automated audit in the browser

Open `http://localhost:4780/`, then evaluate `scripts/audit-deck.js` in the page
(paste the file's contents into the browser tool's JavaScript runner or the
console). It reveals every slide fully and returns:

```js
{ slides: 25, clicks: [0, 6, 5, …], issues: [{ slide: 7, problems: ['content overflows by 34px'] }] }
```

Pass = `issues` is empty. The audit needs a browser that can run page
JavaScript; if the runtime has no browser tool, say the audit did not run and
do the screenshot and PDF checks instead. Do not strip parts of the script to
make it run: each check covers a failure the others miss. Fix overflow with the space budget in
`layout-and-design.md`, then run the audit again.

Read `clicks` as well: a slide with 0 clicks other than the title means its
frames were all put at step 1 by mistake; a slide with 15+ clicks probably
needs grouping or splitting.

## 3. Click behaviour by hand

On one diagram slide and one grid slide: entry shows only the header; each →
reveals exactly one frame (with its wire/arrow); ← hides the last frame; → past
the last frame goes to the next slide at 0 frames; ← from there returns to the
previous slide fully revealed. Also check `O` overview thumbnails do not
overlap, `?` help opens, `#n` deep link works.

## 4. Look at it

Screenshot at least the slides the audit cannot judge: every slide with a
diagram (wires meet node edges) and every slide with images (no text in the
images, crop is sensible, text over backgrounds is readable). Fix and re-shoot.

## 5. PDF

```bash
scripts/print-pdf.sh "http://localhost:4780/index.html" /tmp/<deck>.pdf
```

Expect one page per slide with backgrounds and wires present. Convert the first
page to PNG (`sips -s format png file.pdf --out p1.png`) and look at it.

## 6. Content fidelity

Compare all slide text with the source document, slide by slide: nothing
missing, nothing invented, both languages present. Use an independent reviewer
(subagent) when one is available, since the author tends to read what they meant.
