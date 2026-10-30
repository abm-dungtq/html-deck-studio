// HTML deck controller: stage scaling, PowerPoint-style click reveal, navigation, overview, autoplay.
(() => {
  const stage = document.querySelector('.stage');
  const slides = [...stage.querySelectorAll('.slide')];
  const total = slides.length;
  const $ = (id) => document.getElementById(id);
  const AUTOPLAY_STEP_MS = 2500;
  const AUTOPLAY_SLIDE_MS = 5000;

  let cur = 0;          // slide index
  let shown = 1;        // clicks revealed on the current slide; click 0 is the header, shown on entry
  let autoplay = false;
  let autoplayTimer = null;

  // A "box" is a key-text frame or image; wires, arrows, pulses and small tags only accompany a box.
  const isBox = (el) =>
    !(el instanceof SVGElement) && !el.matches('.pulse-wrap, .arrow, .tag') &&
    (el.textContent.trim() !== '' || el.querySelector('img') !== null);

  // PowerPoint-style clicks: the first data-step group shows on entry, then one box per Next.
  function toClicks(raw) {
    const [entry = [], ...rest] = raw;
    const merged = [];
    let carry = [];
    rest.forEach((g) => {
      if (!g.some(isBox)) { carry.push(...g); return; } // box-less group joins the next one, so no click is empty
      merged.push([...carry, ...g]);
      carry = [];
    });
    if (carry.length) (merged.length ? merged[merged.length - 1] : entry).push(...carry);

    const clicks = [];
    merged.forEach((g) => {
      const boxes = g.filter(isBox);
      const parts = boxes.map((b) => [b]);
      const paths = g.filter((el) => el instanceof SVGElement);
      const others = g.filter((el) => !isBox(el) && !(el instanceof SVGElement));
      // Wires pair with boxes one-to-one when counts match, otherwise they all draw with the first box.
      if (paths.length === boxes.length) paths.forEach((p, i) => parts[i].unshift(p));
      else parts[0].unshift(...paths);
      // Arrows, tags and pulses appear with the next box after them in the document.
      others.forEach((el) => {
        const i = boxes.findIndex((b) => el.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
        parts[i < 0 ? parts.length - 1 : i].unshift(el);
      });
      clicks.push(...parts);
    });
    return [entry, ...clicks];
  }

  // Group elements by data-step="n"; empty value = previous + 1.
  const groups = slides.map((slide) => {
    const map = new Map();
    let last = 0;
    slide.querySelectorAll('[data-step]').forEach((el) => {
      const v = el.dataset.step.trim();
      const n = v === '' ? last + 1 : Number(v);
      last = n;
      if (!map.has(n)) map.set(n, []);
      map.get(n).push(el);
    });
    return toClicks([...map.keys()].sort((a, b) => a - b).map((k) => map.get(k)));
  });

  // Line-draw animation needs each path's real length.
  stage.querySelectorAll('svg path[data-step]').forEach((p) => {
    p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1);
  });

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }

  function setShown(n) {
    const g = groups[cur];
    shown = Math.max(1, Math.min(n, g.length));
    g.forEach((els, i) => els.forEach((el, j) => {
      const on = i < shown;
      if (on && !el.classList.contains('in')) el.style.transitionDelay = j * 90 + 'ms'; // wire first, then its box
      if (!on) el.style.transitionDelay = '';
      el.classList.toggle('in', on);
    }));
    renderChrome();
  }

  function go(i, { revealAll = false } = {}) {
    i = Math.max(0, Math.min(total - 1, i));
    const leaving = cur;
    slides[leaving].classList.remove('active');
    // Reset the slide we leave after its fade-out so it replays next time without animating out.
    setTimeout(() => {
      if (leaving !== cur) groups[leaving].flat().forEach((el) => el.classList.remove('in'));
    }, 750);
    cur = i;
    slides[cur].classList.add('active');
    history.replaceState(null, '', '#' + (cur + 1));
    setShown(revealAll ? groups[cur].length : 1);
    scheduleAutoplay();
  }

  function next() {
    if (shown < groups[cur].length) setShown(shown + 1);
    else if (cur < total - 1) go(cur + 1);
    scheduleAutoplay();
  }

  function prev() {
    if (shown > 1) setShown(shown - 1);
    else if (cur > 0) go(cur - 1, { revealAll: true });
  }

  function scheduleAutoplay() {
    clearTimeout(autoplayTimer);
    if (!autoplay) return;
    const done = shown >= groups[cur].length;
    if (done && cur === total - 1) { toggleAutoplay(false); return; }
    autoplayTimer = setTimeout(next, done ? AUTOPLAY_SLIDE_MS : AUTOPLAY_STEP_MS);
  }

  function toggleAutoplay(force) {
    autoplay = typeof force === 'boolean' ? force : !autoplay;
    $('btnPlay').setAttribute('aria-pressed', autoplay);
    $('btnPlay').textContent = autoplay ? '❚❚' : '▶';
    if (autoplay) scheduleAutoplay(); else clearTimeout(autoplayTimer);
  }

  function renderChrome() {
    const clicks = groups[cur].length - 1;
    $('count').textContent = `${cur + 1} / ${total}`;
    $('progress').style.width = ((cur + (clicks ? (shown - 1) / clicks : 1)) / total) * 100 + '%';
    $('steps').innerHTML = groups[cur].slice(1).map((_, i) => `<i class="${i < shown - 1 ? 'on' : ''}"></i>`).join('');
  }

  // ---------- Overview ----------
  const ov = $('overview');
  function openOverview() {
    if (!ov.childElementCount) {
      slides.forEach((s, i) => {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Slide ${i + 1}`);
        const t = document.createElement('div');
        t.className = 'thumb';
        const c = s.cloneNode(true);
        c.classList.remove('active');
        t.appendChild(c);
        b.append(t, Object.assign(document.createElement('span'), { className: 'lbl', textContent: i + 1 }));
        b.onclick = () => { closeOverview(); go(i, { revealAll: true }); };
        ov.appendChild(b);
      });
    }
    ov.classList.add('open');
    [...ov.children].forEach((b, i) => {
      b.querySelector('.thumb').style.transform = `scale(${b.clientWidth / 1920})`;
      b.classList.toggle('cur', i === cur);
    });
    ov.children[cur].focus();
  }
  function closeOverview() { ov.classList.remove('open'); }

  // ---------- Input ----------
  let goBuffer = '';
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest?.('button')) return; // let the focused button handle it
    const k = e.key;
    if (ov.classList.contains('open')) { if (k === 'Escape' || k === 'o' || k === 'O') closeOverview(); return; }
    if (/^\d$/.test(k)) { goBuffer += k; return; }
    if (k === 'Enter' && goBuffer) { go(Number(goBuffer) - 1, { revealAll: true }); goBuffer = ''; return; }
    goBuffer = '';
    switch (k) {
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': e.preventDefault(); prev(); break;
      case 'ArrowDown': e.preventDefault(); go(cur + 1); break;
      case 'ArrowUp': e.preventDefault(); go(cur - 1, { revealAll: true }); break;
      case 'Home': go(0); break;
      case 'End': go(total - 1, { revealAll: true }); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'o': case 'O': case 'Escape': k === 'Escape' ? $('help').classList.remove('open') : openOverview(); break;
      case 'a': case 'A': toggleAutoplay(); break;
      case 'r': case 'R': go(cur); break;
      case '?': case 'h': case 'H': $('help').classList.toggle('open'); break;
    }
  });

  stage.addEventListener('click', (e) => { if (!e.target.closest('a')) next(); });
  stage.addEventListener('contextmenu', (e) => { e.preventDefault(); prev(); });

  let touchX = null;
  stage.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  });

  function toggleFullscreen() {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
  }

  // Drop focus after a mouse click so Space doesn't re-trigger the button.
  document.querySelectorAll('.controls button').forEach((b) => b.addEventListener('click', () => b.blur()));
  $('btnPrev').onclick = prev;
  $('btnNext').onclick = next;
  $('btnPlay').onclick = () => toggleAutoplay();
  $('btnGrid').onclick = openOverview;
  $('btnFull').onclick = toggleFullscreen;
  $('btnHelp').onclick = () => $('help').classList.toggle('open');

  let idleTimer;
  document.addEventListener('mousemove', () => {
    document.body.classList.remove('idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => document.body.classList.add('idle'), 2500);
  });

  addEventListener('resize', fit);
  addEventListener('hashchange', () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (n && n - 1 !== cur) go(n - 1, { revealAll: true });
  });

  // Read-only hooks for automated checks (scripts/audit-deck.js) and console debugging.
  window.deck = {
    total,
    clicks: groups.map((g) => g.length - 1),
    go: (i) => go(i, { revealAll: true }),
    next, prev,
    state: () => ({ slide: cur + 1, shown: shown - 1, clicks: groups[cur].length - 1 }),
  };

  fit();
  const start = parseInt(location.hash.slice(1), 10);
  slides.forEach((s) => s.classList.remove('active'));
  slides[0].classList.add('active');
  go(start ? start - 1 : 0);
})();
