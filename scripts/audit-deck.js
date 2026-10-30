// Paste into the deck page (browser console or a browser tool's JS runner) after the deck has loaded.
// Reveals every slide fully and reports: overflow past the 1920x1080 safe area, clipped text,
// broken images and the click count per slide. Returns a plain object; an empty `issues` means pass.
(async () => {
  const STAGE_W = 1920, STAGE_H = 1080, SAFE_BOTTOM = 60, SAFE_RIGHT = 100;
  const stage = document.querySelector('.stage');
  const slides = [...document.querySelectorAll('.stage > .slide')];
  const issues = [];
  // Measure final positions, not mid-animation ones: entry transforms (translate 48-70px) would read as overflow.
  document.body.classList.add('no-motion');
  for (let i = 0; i < slides.length; i++) {
    window.deck.go(i);
    await new Promise((r) => setTimeout(r, 300)); // let layout and staggered delays settle
    const s = slides[i], sr = stage.getBoundingClientRect(), sc = sr.width / STAGE_W;
    const found = [];
    const c = s.querySelector('.content');
    if (c && c.scrollHeight > c.clientHeight + 2) found.push(`content overflows by ${c.scrollHeight - c.clientHeight}px`);
    s.querySelectorAll('.key, .ill, .node, .card, .tile, .callout, .quote').forEach((e) => {
      const r = e.getBoundingClientRect();
      const bottom = (r.bottom - sr.top) / sc, right = (r.right - sr.left) / sc;
      const label = (e.querySelector('.vi')?.textContent || e.className).trim().slice(0, 40);
      if (bottom > STAGE_H - SAFE_BOTTOM + 2) found.push(`"${label}" bottom=${Math.round(bottom)}`);
      if (right > STAGE_W - SAFE_RIGHT + 2) found.push(`"${label}" right=${Math.round(right)}`);
      if (e.scrollHeight > e.clientHeight + 3 && getComputedStyle(e).overflow !== 'visible') found.push(`"${label}" clipped`);
    });
    s.querySelectorAll('img').forEach((img) => { if (!img.complete || img.naturalWidth === 0) found.push(`broken img ${img.getAttribute('src')}`); });
    s.querySelectorAll('.bg').forEach((bg) => {
      const url = (bg.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1];
      if (url) found.push(new Promise((ok) => { const im = new Image(); im.onload = () => ok(null); im.onerror = () => ok(`broken bg ${url}`); im.src = url; }));
    });
    const resolved = (await Promise.all(found)).filter(Boolean);
    if (resolved.length) issues.push({ slide: i + 1, problems: [...new Set(resolved)] });
  }
  document.body.classList.remove('no-motion');
  window.deck.go(0);
  return { slides: slides.length, clicks: window.deck.clicks, issues };
})();
