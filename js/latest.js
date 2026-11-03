/* ==========================================================================
   Home page: the Publications and Code panels.
     Publications  your newest paper, taken from data/publications.js
     Code          a strip of project cards from data/code.js that scrolls on
                   its own (it pauses while the pointer is over it, and stands
                   still for visitors who've asked their system to reduce motion)
   ========================================================================== */
(function () {
  'use strict';

  const SPEED = 28; // px per second for the project strip

  const LANG = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Jupyter Notebook': '#DA5B0B',
    'C++': '#f34b7d', 'C': '#555555', 'Shell': '#89e051', 'R': '#198CE7', 'MATLAB': '#e16737',
    'Julia': '#a270ba', 'Rust': '#dea584', 'Swift': '#F05138', 'HTML': '#e34c26', 'Go': '#00ADD8'
  };

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null) e.append(c);
    return e;
  }

  /* ---------- Publications: the newest paper ---------- */

  const papers = (window.PUBLICATIONS || []).slice()
    .sort((a, b) => b.year - a.year || (b.month || 0) - (a.month || 0));
  if (papers.length) {
    const host = document.querySelector('[data-latest-paper]');
    const p = papers[0];
    if (host) {
      const index = (window.PUBLICATIONS || []).indexOf(p);
      host.replaceChildren(
        el('p', { class: 'latest-meta' }, el('span', { class: 'latest-tag' }, 'Latest'), ` ${p.year}${p.journal ? ' · ' + p.journal : ''}`),
        el('h4', {}, el('a', { href: `publications.html#${p.id || `pub-${p.year}-${index + 1}`}` }, p.title)),
        p.subtitle ? el('p', { class: 'latest-text' }, p.subtitle) : null,
        p.doi ? el('a', { class: 'latest-link', href: `https://doi.org/${p.doi}`, target: '_blank', rel: 'noopener' }, 'DOI ↗') : null
      );
    }
  }

  /* ---------- Code: a strip of project cards that scrolls on its own ---------- */

  const strip = document.querySelector('[data-projects]');
  const projects = window.PROJECTS || [];
  if (strip && projects.length) {
    const card = pr => {
      const dot = el('span', { class: 'lang-dot' });
      dot.style.background = LANG[pr.language] || 'var(--muted)';
      return el('article', { class: 'project-card' },
        el('h4', {}, pr.name),
        pr.language ? el('p', { class: 'project-meta' }, dot, pr.language) : null,
        el('p', { class: 'project-text' }, pr.summary),
        pr.github ? el('a', { class: 'project-link', href: pr.github, target: '_blank', rel: 'noopener' }, 'GitHub ↗') : null
      );
    };
    const set = el('div', { class: 'marquee-set' }, projects.map(card));
    const track = el('div', { class: 'marquee-track' }, set);
    strip.replaceChildren(track);

    // Repeat the set until the strip is full, so the loop never shows a gap.
    // The repeats are for looks only: hidden from screen readers and the tab order.
    function fill() {
      track.querySelectorAll('.marquee-set[aria-hidden]').forEach(n => n.remove());
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const setW = set.getBoundingClientRect().width + gap;
      const copies = Math.max(1, Math.ceil(strip.clientWidth / setW));
      for (let i = 0; i < copies; i++) {
        const c = set.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
        track.append(c);
      }
      track.style.setProperty('--set-w', `${setW}px`);
      track.style.animationDuration = `${setW / SPEED}s`;
    }
    fill();
    new ResizeObserver(fill).observe(strip);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fill);
  }

})();
