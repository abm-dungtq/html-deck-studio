# Layout and design

## Content fidelity comes first

The source document's wording is the content. Keep every point, in its order,
in both languages when the source is bilingual. Do not add claims, numbers,
customer names or features that are not in the source; shorten only when the
user agrees. After building, diff the deck text against the source (a
subagent works well for this) and fix anything missing or invented.

### Text rules for common gaps

- **Headline missing in the source.** When a source section gives only a
  heading ("Vấn đề / Problem"), use the heading's Vietnamese as `.title` and
  its English as `.sub`; the kicker carries the slide number and a short
  section label (it may repeat the heading). Do not write a new headline.
- **One line holding both languages** ("Kho Thông Minh — Smart Warehouse"):
  split it, Vietnamese to the title, English to the sub/hero-sub.
- **Language-neutral terms** (ERP, API, EPC, product names): keep the term in
  `.vi` and omit `.en`, or write the descriptive English in `.en` only when the
  source has it.
- **Kicker number** = the slide's position (`02`, `03` …); the hero slide has
  no kicker.

## Choose a direction, then a layout per slide

Write one sentence: "Reading this as <audience/purpose>, leaning <direction>".
Default direction from the reference deck: industrial-tech editorial — dark
ink navy, one cool accent (cyan) for flow and emphasis, one warm accent (amber)
for warnings, return flows and notes; Vietnamese bold, English italic and
lighter; Be Vietnam Pro for text (full Vietnamese diacritics), JetBrains Mono
for labels. Change it when the subject calls for something else, and change the
CSS variables, font link and image `PALETTE` together.

Then fill a per-slide table in the plan: `# | layout | images`. Patterns that
worked:

| Content shape | Layout |
|---|---|
| Title | Hero left over a background photo, all at step 1 |
| 3 problems / 3 options | `.grid.c3` of `.tile` (illustration + `.key`) |
| 4 capabilities | 2×2 numbered `.card` + closing `.callout` |
| Ordered steps | `.num-item` list beside one illustration (`.split`) |
| System / data flow | `.diagram` with `.node`s and drawn `svg.wires`, dashed amber return path |
| Hub and spokes | `.node.core` in the centre, systems left, devices right |
| Layers / stack | Stacked full-width cards, top to bottom |
| Timeline / roadmap | Row of `.year` columns, then steps |
| Many short items (6–9) | `.grid.c3` of `.card.sm.tight` + arrow to the outcome column |
| Five Ws / matrix | `.grid.c5` of short cards with a worked example below |

Vary the layout between neighbouring slides; two identical layouts in a row
read as filler.

## Space budget (1920 × 1080)

- Slide padding 96 top, 120 sides, 120 bottom. Keep frames 60 px above the
  bottom and 100 px inside the right edge: the control pill floats there.
- Header (kicker + title + sub) takes ~260 px; the body has ~600 px.
- A title over ~45 characters wraps to two lines and costs ~80 px more.
- Fit text before shrinking it: `.key .vi` 30 px is the default, `.key.sm`
  25 px for dense grids; do not go below ~19 px for English lines.
- Give every `.ill` an explicit height (or `flex:1` inside `.tile`), otherwise
  square images push the slide past the bottom.
- When a slide overflows: reduce gaps and image heights first, switch cards to
  `.sm.tight`, then split the content into two slides only with the user's OK.

## Demo before the full build

When the whole deck is three slides or fewer, the demo is the deck; still
stop for approval before polishing. Otherwise build three representative slides first (the title, one dense content slide,
one diagram) with real images, show them to the user, and get approval on look
and motion before generating the remaining images. This is the cheapest point
to change direction.
