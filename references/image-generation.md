# Image generation with the Codex CLI

Images are illustration and atmosphere only. **Every word on a slide is HTML**,
so it stays editable, translatable, searchable and crisp. An image that contains
text, numbers, logos or readable UI is a defect, not a style choice.

## Preconditions

- `codex --version` works and the user is signed in (`codex login status`). If
  Codex is missing or signed out, stop and tell the user; do not substitute
  another provider without asking, because cost and style change.
- macOS `sips` converts PNG → JPG. On Linux use ImageMagick
  (`magick in.png -quality 82 out.jpg`) and edit `tools/gen-image.sh`.
- Generation costs Codex usage. Agree the image count in the plan (a 25-slide
  deck needed ~21 images: 6 backgrounds + 15 illustrations, with reuse).

## Two kinds, one palette

| Kind | Name | Shape | Composition |
|---|---|---|---|
| Background | `bg-*` | 16:9 | Left ~55 % dark and empty for text, interest on the right, photoreal haze |
| Illustration | `ill-*` | 1:1 | One centred subject, generous margin, seamless dark backdrop, rim light |

`tools/gen-image.sh` holds the shared style. Before generating, set its
`PALETTE` line to the deck's colours (same hexes as `deck.css :root`). The script
appends the no-text rule to every prompt.

## Writing subjects

`tools/image-list.tsv` is `name<TAB>bg|ill<TAB>subject`, one image per line.
Lines starting with `#` and blank lines are skipped. Replace the template's
example entries (`ill-one` …) with the deck's own. Until an image exists, the
deck shows an empty frame and the browser logs a 404 for it; that is expected
before generation and a defect after it.

Describe the scene, not the style. Good subjects:

- name concrete objects and materials ("a roll of blank white labels with thin
  metallic antenna inlays");
- say "blank", "unprinted", "screen dark" for anything that would normally
  carry text (labels, screens, signs, cartons, documents);
- for backgrounds, put the subject "on the right" and keep the left calm;
- avoid people's faces, brand products and real logos.

Plan reuse before generating: a background can serve two slides (use `.bg.flip`
on the second), and one illustration can appear on an overview slide and again
on its detail slide.

## Running

```bash
tools/gen-all.sh                 # every listed image whose JPG is missing, 4 in parallel
tools/gen-image.sh ill-x ill "…" # one image
```

Run `gen-all.sh` as a background job; each image takes about 1–2 minutes. PNG
originals land in `assets/src/` (large, not deployed), JPG q82 in `assets/img/`
(what the deck loads). Logs are in `tools/logs/<name>.log`; a missing PNG means
the job failed and the log says why.

`< /dev/null` in the script is required: without it `codex exec` waits on stdin
when launched in the background and never finishes.

## Review every image

Open each JPG and look at it before using it (an image viewer, or the
runtime's image-reading capability). Reject and regenerate when you see:

- any letters, digits, logo-like marks or readable screen UI, even small;
- a background whose left side is busy or bright (text will not read);
- an illustration that is cropped, cluttered or off-palette.

To regenerate: tighten the subject in `image-list.tsv` (add "completely blank,
no markings"), delete `assets/img/<name>.jpg`, run `gen-all.sh` again. After
replacing an image the browser may show the old one; reload with `?v=n`.
