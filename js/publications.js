/* ==========================================================================
   Publications page.
     the map        every paper as a peak, by date and theme (js/pubmap.js)
     the panel      the selected paper: figure, summary, authors, DOI; step
                    through papers with the arrows (or ← / → on the map).
                    Click an animated figure to see it larger, with the paper.
     the full list  CV style, newest first, grouped by year
   Papers come from data/publications.js. A link to publications.html#<id>
   opens the page on that paper.
   ========================================================================== */
(function () {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const themes = window.PUB_THEMES || {};
  // a stand-in animation for papers without their own figure, by theme
  const STAND_IN = { hyperpolarisation: 'precession', 'solid-state': 'rotor', solution: 'contour', data: 'pulse' };
  const MAX_AUTHORS = 12; // longer lists are shortened in the panel (the full list shows on hover)

  const papers = (window.PUBLICATIONS || []).slice()
    .sort((a, b) => b.year - a.year || (b.month || 0) - (a.month || 0));  // newest first
  papers.forEach((p, i) => { if (!p.id) p.id = `pub-${p.year}-${i + 1}`; });
  const N = papers.length;

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null) e.append(c);
    return e;
  }

  // Authors with your name (PUB_HIGHLIGHT) in bold; optionally shortened to
  // the first three, you and the last author.
  function authors(text, shorten) {
    const me = window.PUB_HIGHLIGHT;
    let names = text.split(/,\s*/);
    if (shorten && names.length > MAX_AUTHORS) {
      const keep = new Set([0, 1, 2, names.length - 1, names.indexOf(me)]);
      const short = [];
      names.forEach((n, i) => {
        if (keep.has(i)) short.push(n);
        else if (short[short.length - 1] !== '…') short.push('…');
      });
      names = short;
    }
    return names.flatMap((n, i) => [i ? ', ' : '', n === me ? el('strong', {}, n) : n]);
  }

  const count = document.getElementById('pub-count');
  if (count) count.textContent = String(N);

  /* ---------- The panel ---------- */

  const panel = document.getElementById('pub-detail');
  const q = sel => panel.querySelector(sel);
  const media = q('.pub-detail-media');
  const animCanvas = el('canvas', { role: 'img' });
  const expandBtn = el('button', { class: 'fig-expand', type: 'button', 'aria-label': 'Enlarge the figure', title: 'Enlarge' });
  expandBtn.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  media.append(animCanvas, expandBtn);
  let anim = null, extra = null, current = -1;
  let shown = null;   // the animation in the panel now: { name, alt }
  let filter = null;  // a theme chosen on the map, or null for all papers
  const pool = () => (filter ? papers.filter(p => p.theme === filter) : papers);

  function showMedia(p) {
    const m = p.media || { type: 'animation', name: STAND_IN[p.theme] || 'precession', alt: 'Illustrative animation' };
    if (extra) { extra.remove(); extra = null; }
    expandBtn.hidden = m.type !== 'animation';
    if (m.type === 'animation') {
      animCanvas.hidden = false;
      animCanvas.setAttribute('aria-label', m.alt || `${m.name} animation`);
      if (!anim) anim = Anim.mount(animCanvas);
      shown = { name: m.name, alt: m.alt || `${m.name} animation` };
      // your own animations load from anims/<name>.js; if that's missing, show the theme's stand-in
      anim.set(m.name).then(ok => {
        if (!ok && papers[current] === p) {
          shown = { name: STAND_IN[p.theme] || 'precession', alt: 'Illustrative animation' };
          anim.set(shown.name);
        }
      });
    } else {
      shown = null;
      animCanvas.hidden = true;   // hidden canvases stop animating
      if (m.type === 'image') extra = el('img', { src: m.src, alt: m.alt || '', decoding: 'async' });
      else if (m.type === 'video') {
        extra = el('video', { src: m.src, poster: m.poster, muted: true, loop: true, playsinline: true, autoplay: !reduce.matches, controls: reduce.matches });
        extra.muted = true;
      } else if (m.type === 'embed') extra = el('iframe', { src: m.src, title: m.alt || 'Embedded figure', loading: 'lazy', allow: 'fullscreen; autoplay' });
      if (extra) {
        if (m.fit === 'contain') extra.style.objectFit = 'contain';
        media.append(extra);
      }
    }
  }

  // The paper's details (meta line, title, summary, authors, links), written into
  // the matching elements inside root: the panel, or the enlarged view.
  function fillInfo(root, p) {
    const f = sel => root.querySelector(sel);
    const href = p.url || (p.doi ? `https://doi.org/${p.doi}` : null);
    f('.pub-meta').replaceChildren(
      el('span', { class: 'pub-year' }, String(p.year)),
      p.journal ? el('span', {}, p.journal) : null,
      themes[p.theme] ? el('span', { class: 'pub-theme' }, themes[p.theme]) : null);
    f('.pub-detail-title').replaceChildren(href ? el('a', { href, target: '_blank', rel: 'noopener' }, p.title) : p.title);
    f('.pub-sub').textContent = p.subtitle || '';
    const au = f('.pub-authors');
    au.replaceChildren(...(p.authors ? authors(p.authors, true) : []));
    if (p.authors && p.authors.split(',').length > MAX_AUTHORS) au.title = p.authors; else au.removeAttribute('title');
    const links = [];
    if (p.doi) links.push(el('a', { href: `https://doi.org/${p.doi}`, target: '_blank', rel: 'noopener' }, 'DOI ↗'));
    for (const l of p.links || []) links.push(el('a', { href: l.href, target: '_blank', rel: 'noopener' }, l.label));
    f('.pub-links').replaceChildren(...links);
  }

  function show(p, { scroll = false } = {}) {
    current = papers.indexOf(p);
    fillInfo(panel, p);
    const inPool = pool(), at = inPool.indexOf(p);
    q('.pub-detail-count').textContent = `${at + 1} of ${inPool.length}${filter ? ' · ' + themes[filter] : ''}`;
    q('[data-step="-1"]').disabled = at <= 0;
    q('[data-step="1"]').disabled = at >= inPool.length - 1;
    showMedia(p);
    map.select(p);
    list.querySelectorAll('.cv-item.is-current').forEach(li => li.classList.remove('is-current'));
    const li = list.querySelector(`[data-id="${CSS.escape(p.id)}"]`);
    if (li) li.classList.add('is-current');
    history.replaceState(null, '', `#${p.id}`);
    if (scroll) document.getElementById('pub-explorer').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
  }

  // newer / older, within the chosen theme if there is one
  const step = d => {
    const inPool = pool(), i = inPool.indexOf(papers[current]) + d;
    if (i >= 0 && i < inPool.length) show(inPool[i]);
  };
  panel.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => step(+b.dataset.step)));

  /* ---------- The enlarged figure ----------
     Clicking the panel's animation (or its enlarge button) opens it larger, from the
     start, beside the paper's details. Esc, the close button or a click outside closes it.
     Below it, a scrubber runs across one loop and starts again from the left each time
     the animation repeats; dragging it pauses the animation there. */

  const bigCanvas = el('canvas', { role: 'img' });
  const closeBtn = el('button', { class: 'step-btn fig-dialog-close', type: 'button', 'aria-label': 'Close' }, '×');
  const playBtn = el('button', { type: 'button' }, 'pause');
  const scrub = el('input', { type: 'range', min: 0, max: 1000, step: 1, value: 0, 'aria-label': 'Position in the animation' });
  const bar = el('div', { class: 'fig-dialog-bar' }, playBtn, scrub);
  const dialog = el('dialog', { class: 'fig-dialog', 'aria-labelledby': 'fig-dialog-title' },
    closeBtn,
    el('div', { class: 'fig-dialog-inner' },
      el('div', { class: 'fig-dialog-left' },
        el('figure', { class: 'fig-dialog-media' }, bigCanvas),
        bar),
      el('div', { class: 'fig-dialog-body' },
        el('p', { class: 'pub-meta' }),
        el('h2', { class: 'pub-detail-title', id: 'fig-dialog-title' }),
        el('p', { class: 'pub-sub' }),
        el('p', { class: 'pub-authors' }),
        el('p', { class: 'pub-links' }))));
  document.body.append(dialog);
  let big = null, loopLen = 0;

  const showPlaying = () => { playBtn.textContent = big && big.paused() ? 'play' : 'pause'; };
  function enlarge() {
    const p = papers[current];
    if (!p || !shown || typeof dialog.showModal !== 'function') return;
    fillInfo(dialog, p);
    bigCanvas.setAttribute('aria-label', shown.alt);
    loopLen = Anim.loop(shown.name);
    bar.hidden = !loopLen;                   // no scrubber for an animation without a loop
    playBtn.hidden = reduce.matches;         // reduced motion: it holds still, but can be scrubbed
    dialog.showModal();
    // after showModal, so the canvas has its size; the scrubber follows each frame
    if (!big) big = Anim.mount(bigCanvas, null, {
      onFrame: t => { if (loopLen) scrub.value = String(Math.round(((t % loopLen) / loopLen) * 1000)); }
    });
    big.set(shown.name);                     // restarts it from the beginning
    showPlaying();
  }
  playBtn.addEventListener('click', () => { if (big.paused()) big.play(); else big.pause(); showPlaying(); });
  scrub.addEventListener('input', () => {
    big.pause();
    big.seek((+scrub.value / 1000) * loopLen);
    showPlaying();
  });
  animCanvas.addEventListener('click', enlarge);
  expandBtn.addEventListener('click', enlarge);
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {   // a click on the backdrop, outside the box
    if (e.target !== dialog) return;          // not one on (or a key press in) something inside it
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });

  /* ---------- The full list, CV style ---------- */

  const list = document.getElementById('pub-all-list');
  let year = null, ol = null;
  papers.forEach((p, i) => {
    if (p.year !== year) {
      year = p.year;
      ol = el('ol', { class: 'cv-list' });
      list.append(el('h3', { class: 'cv-year' }, String(year)), ol);
    }
    const title = el('a', { class: 'cv-title', href: `#${p.id}` }, p.title);
    title.addEventListener('click', e => { e.preventDefault(); show(p, { scroll: true }); });
    ol.append(el('li', { class: 'cv-item', 'data-id': p.id },
      el('span', { class: 'cv-num' }, String(N - i)),
      el('span', { class: 'cv-text' },
        p.authors ? authors(p.authors, false) : null,
        ` (${p.year}). `, title, '. ',
        p.journal ? el('em', {}, p.journal) : null, p.journal ? '. ' : null,
        p.doi ? el('a', { class: 'cv-doi', href: `https://doi.org/${p.doi}`, target: '_blank', rel: 'noopener' }, `doi:${p.doi}`) : null)
    ));
  });

  /* ---------- The map ---------- */

  const map = PubMap.mount(document.getElementById('pub-map'), {
    onSelect: p => show(p),
    onStep: d => step(d),
    onFilter: key => {
      filter = key;
      const inPool = pool();
      show(inPool.includes(papers[current]) ? papers[current] : inPool[0]);
    }
  });

  const fromHash = () => papers.find(p => p.id === decodeURIComponent(location.hash.slice(1)));
  const start = fromHash();
  if (N) show(start || papers[0], { scroll: !!start });
  addEventListener('hashchange', () => { const p = fromHash(); if (p && papers.indexOf(p) !== current) show(p, { scroll: true }); });
})();
