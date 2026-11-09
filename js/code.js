/* ==========================================================================
   Code page. Projects come from data/code.js.
   ========================================================================== */
(function () {
  'use strict';

  const projects = window.PROJECTS || [];

  // GitHub's language colours, for the dot next to each language.
  const LANG = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Jupyter Notebook': '#DA5B0B',
    'C++': '#f34b7d', 'C': '#555555', 'Shell': '#89e051', 'R': '#198CE7', 'MATLAB': '#e16737',
    'Julia': '#a270ba', 'Rust': '#dea584', 'Fortran': '#4d41b1', 'HTML': '#e34c26', 'Go': '#00ADD8',
    'CSS': '#663399', 'Java': '#b07219', 'Tcl': '#e4cc98', 'Perl': '#0298c3'
  };

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) e.setAttribute(k, v);
    for (const c of kids.flat()) if (c != null) e.append(c);
    return e;
  }

  // Small, decorative project marks in the heading row.
  function projectIcon(kind) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 40');
    svg.setAttribute('class', 'repo-icon');
    svg.setAttribute('aria-hidden', 'true');
    const add = (tag, attrs) => {
      const node = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
      svg.append(node);
    };
    const path = (d, color) => add('path', { d, fill: 'none', stroke: `var(--${color})`,
      'stroke-width': '1.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    if (kind === 'connections') {
      path('M37 20H22V8H15M22 20V33H15M63 20H78V8H85M78 20V33H85', 'rule');
      path('M37 20H22V8H15M63 20H78V33H85', 'fid');
      add('rect', { x: 37, y: 12, width: 26, height: 16, rx: 3,
        fill: 'var(--surface)', stroke: 'var(--spec)', 'stroke-width': '1.5' });
      path('M43 20H57M51 16L57 20L51 24', 'spec');
      for (const [x, y] of [[2, 2], [2, 27], [85, 2], [85, 27]]) {
        add('rect', { x, y, width: 13, height: 10, rx: 1.5,
          fill: 'var(--surface)', stroke: 'var(--fid)', 'stroke-width': '1.3' });
        path(`M${x + 6.5} ${y + 10}V${y + 13}M${x + 3} ${y + 13}H${x + 10}`, 'muted');
      }
    } else if (kind === 'monitoring') {
      add('rect', { x: 5, y: 3, width: 90, height: 34, rx: 3,
        fill: 'none', stroke: 'var(--muted)', 'stroke-width': '1.3' });
      path('M5 10H95M31 10V37M31 23H95', 'rule');
      path('M12 17H23M12 30H23', 'muted');
      path('M37 20L47 17L57 19L67 14L77 17L89 15', 'fid');
      path('M37 33L51 26L52 33L68 26L69 33L89 27', 'spec');
    } else if (kind === 'classification') {
      add('rect', { x: 2, y: 12, width: 22, height: 17, rx: 2,
        fill: 'none', stroke: 'var(--fid)', 'stroke-width': '1.4' });
      path('M7 17H19M7 23H16', 'fid');
      path('M24 20H39M39 6V34M39 6H58M39 34H58M68 20H79V30H96', 'rule');
      path('M24 20H79V10H85', 'spec');
      for (const y of [6, 20, 34]) add('circle', { cx: 63, cy: y, r: 4,
        fill: 'var(--bg)', stroke: y === 20 ? 'var(--spec)' : 'var(--muted)', 'stroke-width': '1.3' });
      add('rect', { x: 85, y: 5, width: 13, height: 10, rx: 2,
        fill: 'none', stroke: 'var(--spec)', 'stroke-width': '1.4' });
    } else {
      path('M2 35H98', 'rule');
      path('M2 34L13 33L18 30L22 14L26 30L34 33L44 32L49 5L54 32L64 33L71 28L76 17L81 29L88 33L98 34', 'spec');
    }
    return svg;
  }

  // Native modal provides focus containment and Escape-to-close behaviour.
  const preview = el('dialog', { class: 'repo-preview', 'aria-labelledby': 'repo-preview-title' });
  const previewTitle = el('h2', { id: 'repo-preview-title' });
  const closePreview = el('button', { type: 'button', class: 'repo-preview-close' }, 'Close ×');
  const previewImage = el('img', { class: 'repo-preview-image', alt: '' });
  preview.append(el('div', { class: 'repo-preview-head' }, previewTitle, closePreview), previewImage);
  document.body.append(preview);
  let previewTrigger = null;
  closePreview.addEventListener('click', () => preview.close());
  preview.addEventListener('click', event => { if (event.target === preview) {
    const rect = preview.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) preview.close();
  } });
  preview.addEventListener('close', () => { if (previewTrigger) previewTrigger.focus(); });

  function screenshot(project) {
    const button = el('button', { type: 'button', class: 'repo-image-button',
      'aria-label': `Enlarge ${project.name} screenshot`, 'aria-haspopup': 'dialog' },
      el('img', { src: project.image.src, alt: project.image.alt,
        width: project.image.width, height: project.image.height,
        loading: 'lazy', decoding: 'async', class: 'repo-image' }),
      el('span', { class: 'repo-image-hint' }, 'Enlarge screenshot ↗'));
    button.addEventListener('click', () => {
      previewTrigger = button;
      previewTitle.textContent = `${project.name} screenshot`;
      previewImage.src = project.image.src;
      previewImage.alt = project.image.alt;
      preview.showModal();
      closePreview.focus();
    });
    return button;
  }

  const list = document.getElementById('repo-list');
  const rows = projects.map(r => {
    const meta = el('p', { class: 'repo-meta' });
    if (r.language) {
      const dot = el('span', { class: 'lang-dot' });
      dot.style.background = LANG[r.language] || 'var(--muted)';
      meta.append(el('span', { class: 'repo-badge' }, dot, r.language));
    }
    const live = el('span', { class: 'repo-live' });
    meta.append(live);
    if (r.version) meta.append(el('span', { class: 'repo-badge' }, `Version ${r.version}`));
    if (r.released) meta.append(el('span', {}, 'Released ', el('time', { datetime: r.released },
      new Date(r.released + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }))));
    if (r.github) meta.append(el('a', { class: 'repo-github', href: r.github, target: '_blank', rel: 'noopener' }, 'View on GitHub ↗'));
    if (r.website) meta.append(el('a', { href: r.website, target: '_blank', rel: 'noopener' }, `Try ${r.name} ↗`));
    if (r.paper) meta.append(el('a', { href: r.paper.href }, r.paper.label + ' →'));

    const item = el('li', { class: 'repo' },
      el('div', {},
        el('div', { class: 'repo-heading' },
          el('h2', { class: 'repo-name' }, r.name),
          meta,
          projectIcon(r.graphic)),
        el('p', { class: 'repo-summary' }, r.summary || '',
          r.summaryFr ? el('br') : null,
          r.summaryFr ? el('span', { lang: 'fr' }, r.summaryFr) : null),
        r.context ? el('p', { class: 'repo-context' }, r.context,
          r.derivation ? ' ' : null,
          r.derivation ? el('em', {}, r.derivation) : null) : null,
        r.image ? screenshot(r) : null,
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
        row.live.textContent = `${d.stargazers_count ? '★ ' + d.stargazers_count + ' stars' + ' · ' : ''}Updated ${when}`;
      })
      .catch(() => {});
  }

})();
