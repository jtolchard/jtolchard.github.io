/* ==========================================================================
   Publications page.
     the map        every paper as a peak, by date and theme (js/pubmap.js)
     the panel      the selected paper: figure, summary, authors, DOI; step
                    through papers with the arrows (or ← / → on the map)
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
  media.append(animCanvas);
  let anim = null, extra = null, current = -1;
  let filter = null;  // a theme chosen on the map, or null for all papers
  const pool = () => (filter ? papers.filter(p => p.theme === filter) : papers);

  function showMedia(p) {
    const m = p.media || { type: 'animation', name: STAND_IN[p.theme] || 'precession', alt: 'Illustrative animation' };
    if (extra) { extra.remove(); extra = null; }
    if (m.type === 'animation') {
      animCanvas.hidden = false;
      animCanvas.setAttribute('aria-label', m.alt || `${m.name} animation`);
      if (!anim) anim = Anim.mount(animCanvas);
      // your own animations load from anims/<name>.js; if that's missing, show the theme's stand-in
      anim.set(m.name).then(ok => {
        if (!ok && papers[current] === p) anim.set(STAND_IN[p.theme] || 'precession');
      });
    } else {
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

  function show(p, { scroll = false } = {}) {
    current = papers.indexOf(p);
    const href = p.url || (p.doi ? `https://doi.org/${p.doi}` : null);
    q('.pub-meta').replaceChildren(
      el('span', { class: 'pub-year' }, String(p.year)),
      p.journal ? el('span', {}, p.journal) : null,
      themes[p.theme] ? el('span', { class: 'pub-theme' }, themes[p.theme]) : null);
    q('.pub-detail-title').replaceChildren(href ? el('a', { href, target: '_blank', rel: 'noopener' }, p.title) : p.title);
    q('.pub-sub').textContent = p.subtitle || '';
    const au = q('.pub-authors');
    au.replaceChildren(...(p.authors ? authors(p.authors, true) : []));
    if (p.authors && p.authors.split(',').length > MAX_AUTHORS) au.title = p.authors; else au.removeAttribute('title');
    const links = [];
    if (p.doi) links.push(el('a', { href: `https://doi.org/${p.doi}`, target: '_blank', rel: 'noopener' }, 'DOI ↗'));
    for (const l of p.links || []) links.push(el('a', { href: l.href, target: '_blank', rel: 'noopener' }, l.label));
    q('.pub-links').replaceChildren(...links);
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
