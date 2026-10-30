# Deck engine: markup contract

The template (`assets/template/`) is a static deck: `index.html` + `deck.css` +
`deck.js`, no build step. Slides are authored on a fixed 1920×1080 stage that
`deck.js` scales to the window. Write every size in stage pixels.

## Slide skeleton

```html
<section class="slide">
  <div class="bg" style="background-image:url(assets/img/bg-x.jpg)"></div> <!-- optional photo, slow push-in -->
  <div class="scrim"></div>            <!-- left-dark gradient over a bg; .scrim.soft = vertical, for busy diagrams -->
  <div class="grid-fx"></div>          <!-- optional faint grid instead of a photo -->
  <div class="content">
    <p class="kicker" data-step="1" data-anim="left"><span class="no">07</span> Phần · Section</p>
    <h2 class="title" data-step="1" data-anim="up">Vietnamese headline</h2>
    <p class="sub" data-step="1" data-anim="up">English headline</p>
    <div class="body"> … frames … </div>
  </div>
</section>
```

`.bg.flip` mirrors a reused background so a repeat does not look identical.
Lower a busy background with inline `opacity:.45` and use `.scrim.soft`.

## Click reveal (PowerPoint style)

Mark every element that should animate with `data-step="n"` and an optional
`data-anim`: `up`, `down`, `left`, `right`, `scale`, `blur`, `wipe`. Elements
without `data-step` are always visible.

How `deck.js` turns step numbers into clicks:

1. The lowest step group (normally `1`: kicker, title, sub) shows **on entry**.
   On a hero slide put everything at step 1 so the slide has zero clicks.
2. Every later group is split so that **each box is its own click**, in DOM
   order. A box is any non-SVG element with text or an `<img>`, except
   `.arrow`, `.tag` and `.pulse-wrap`.
3. A group with no box (only wires, arrows, pulses) merges into the next group,
   so no click ever reveals nothing.
4. SVG `<path data-step>` wires: when a group has as many paths as boxes, they
   pair one-to-one in order; otherwise all paths draw with the group's first
   box. Give a wire the same step as the node it leads **to**.
5. `.arrow`, `.tag`, `.pulse-wrap` ride with the next box after them in the DOM.
6. Within one click, elements stagger 90 ms apart (wire first, then its box).

So the step number orders groups, but you do not need a unique step per box:
three cards at `data-step="2"` become three clicks. Use a shared number when
boxes belong together logically, distinct numbers when order across columns
matters.

`window.deck.clicks` lists the click count per slide; check it against intent.

## Navigation the engine already provides

→ / Space / Enter / PageDown = next frame, then next slide. ← / PageUp /
Backspace = hide last frame, then previous slide fully revealed. ↓ ↑ jump whole
slides. Home / End. Digits + Enter jump to a slide. `A` autoplay (2.5 s per
frame, 5 s per finished slide), `O` overview grid, `F` fullscreen, `R` replay
slide, `?` help. Click = next, right-click = previous, swipe on touch. The URL
hash `#n` deep-links to slide n. Controls hide after 2.5 s without mouse
movement. Print CSS shows every frame, one slide per page.

Do not add a per-slide script. If behaviour must change, change `deck.js` once
and re-run the audit for every slide.

## Building blocks in deck.css

| Class | Use |
|---|---|
| `.key` with `.vi` + `.en` | Bilingual text frame; `.key.sm`, `.key.lg` sizes |
| `.card`, `.card.sm`, `.card.sm.tight`, `.card.accent` | Framed box; `.idx` small mono index |
| `.callout` (`.cyan`, `.muted`) | Left-rule takeaway line, usually last click |
| `.quote` | Amber-tinted quotation block |
| `.num-item` with `.n` | Numbered row (01, 02 …) with rules |
| `.ill > img` | Rounded illustration frame, `object-fit: cover`; give it a height |
| `.tile` | Illustration + label column for `.grid.c3` rows |
| `.grid.c2`–`.c5`, `.split`, `.split.wide`, `.stack`, `.push` | Layout |
| `.diagram` + `.node` (`.core`) + `svg.wires path` (`.dash`) | Absolute-positioned flow diagrams |
| `.pulse-wrap > .pulse ×3` | Radiating rings, e.g. a signal motif |
| `.tag`, `.mono`, `.big-mono`, `.year`, `.note-row`, `.arrow` | Labels and accents |
| `.hero-title` (`em` = accent), `.hero-sub`, `.presenter` | Title slide |

Palette and fonts are CSS variables in `:root` (`--ink*`, `--cyan`, `--amber`,
`--text`, `--muted`, `--en`, `--font`, `--mono`). Re-theme a deck by changing
those variables, the Google Fonts link in `index.html`, and `PALETTE` in
`tools/gen-image.sh` together, so images and type stay in one palette.

## Diagrams

Draw nodes as absolutely positioned `.node` elements inside a `.diagram` with an
explicit width and height, and put an `<svg class="wires" viewBox="0 0 W H">`
with the same W × H underneath. Path coordinates are then the same numbers as
the node `left/top`. Connect edge midpoints: a node at `left:L; top:T` with
`width:W; height:H` has its right-edge midpoint at `(L+W, T+H/2)`, left at
`(L, T+H/2)`, bottom at `(L+W/2, T+H)`. Use `C` curves for fan-outs. After
drawing, screenshot the slide and correct any wire that stops short or
overshoots. A
dashed amber `path.dash` with `style="stroke:var(--amber)"` reads as a return
flow and animates continuously.
