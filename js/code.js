/* ==========================================================================
   Code page. Projects come from data/code.js.
   Each project gets a small "fingerprint spectrum" generated from its name.
   ========================================================================== */
(function () {
  'use strict';

  const projects = window.PROJECTS || [];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // GitHub's language colours, for the dot next to each language.
  const LANG = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Jupyter Notebook': '#DA5B0B',
    'C++': '#f34b7d', 'C': '#555555', 'Shell': '#89e051', 'R': '#198CE7', 'MATLAB': '#e16737',
    'Julia': '#a270ba', 'Rust': '#dea584', 'Fortran': '#4d41b1', 'HTML': '#e34c26', 'Go': '#00ADD8',
    'Java': '#b07219', 'Tcl': '#e4cc98', 'Perl': '#0298c3'
  };

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) e.setAttribute(k, v);
    for (const c of kids.flat()) if (c != null) e.append(c);
    return e;
  }

  // Same name, same peaks: a few Lorentzians placed by a hash of the name.
  function fingerprint(name, color) {
    let hsh = 2166136261;
    for (const ch of name) hsh = Math.imul(hsh ^ ch.charCodeAt(0), 16777619);
    const rand = () => { hsh = Math.imul(hsh ^ (hsh >>> 13), 1274126177); return ((hsh >>> 0) % 10000) / 10000; };
    const peaks = Array.from({ length: 3 + Math.floor(rand() * 3) }, () => ({ x: 0.1 + rand() * 0.8, w: 0.008 + rand() * 0.02, a: 0.35 + rand() * 0.65 }));
    const W = 132, H = 52, pts = [];
    for (let i = 0; i <= 132; i++) {
      const u = i / 132;
      const v = peaks.reduce((s, p) => s + p.a / (1 + ((u - p.x) / p.w) ** 2), 0);
      pts.push(`${(u * W).toFixed(1)},${(H - 4 - Math.min(1, v) * (H - 10)).toFixed(1)}`);
    }
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('class', 'repo-glyph');
    svg.setAttribute('aria-hidden', 'true');
    const base = document.createElementNS(ns, 'path');
    base.setAttribute('d', `M0,${H - 3.5} L${W},${H - 3.5}`);
    base.setAttribute('stroke', 'var(--rule)');
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('d', 'M' + pts.join(' L'));
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-linejoin', 'round');
    svg.append(base, line);
    return svg;
  }

  const list = document.getElementById('repo-list');
  const rows = projects.map(r => {
    const meta = el('p', { class: 'repo-meta' });
    if (r.language) {
      const dot = el('span', { class: 'lang-dot' });
      dot.style.background = LANG[r.language] || 'var(--muted)';
      meta.append(el('span', {}, dot, r.language));
    }
    const live = el('span', { class: 'repo-live' });
    meta.append(live);
    if (r.github) meta.append(el('a', { href: r.github, target: '_blank', rel: 'noopener' }, 'GitHub ↗'));
    if (r.paper) meta.append(el('a', { href: r.paper.href }, r.paper.label + ' →'));

    const item = el('li', { class: 'repo' },
      fingerprint(r.name, 'var(--spec)'),
      el('div', {},
        el('h2', { class: 'repo-name' }, r.name),
        meta,
        el('p', { class: 'repo-summary' }, r.summary || ''),
        r.context ? el('p', { class: 'repo-context' }, r.context) : null,
        r.tags && r.tags.length ? el('ul', { class: 'repo-tags' }, r.tags.map(t => el('li', {}, t))) : null
      )
    );
    list.append(item);
    return { r, live };
  });

  // Live stars and last-updated dates for projects with a public GitHub repo.
  // Failures are silent: the card just goes without them.
  for (const row of rows) {
    const m = /github\.com\/([^/]+)\/([^/#?]+)/.exec(row.r.github || '');
    if (!m) continue;
    fetch(`https://api.github.com/repos/${m[1]}/${m[2]}`)
      .then(res => (res.ok ? res.json() : null))
      .then(d => {
        if (!d) return;
        const when = new Date(d.pushed_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
        row.live.textContent = `${d.stargazers_count ? '★ ' + d.stargazers_count + ' · ' : ''}updated ${when}`;
      })
      .catch(() => {});
  }

  // The terminal line types itself once.
  const term = document.getElementById('term-cmd');
  if (term) {
    const cmd = 'ls ~/code/projects';
    if (reduce.matches) term.textContent = cmd;
    else {
      let i = 0;
      const type = () => { term.textContent = cmd.slice(0, ++i); if (i < cmd.length) setTimeout(type, 55 + Math.random() * 60); };
      setTimeout(type, 400);
    }
  }
})();
