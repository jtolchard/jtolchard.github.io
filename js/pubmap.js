/* ==========================================================================
   The publication map, NMR style. Exposes window.PubMap.mount(canvas, opts).
   Each paper is a peak at (date, theme). On wide screens it's a 2D contour
   map, like an HSQC; on narrow screens, one 1D trace per theme, stacked like
   a titration series.
   The theme names are buttons: choosing one collapses the map into the 1D
   projection of that theme, its peaks rising to full height while the rest
   fades away. "All" brings the full map back.
   The date axis runs right to left, as a ppm axis does, so the newest papers
   sit on the left. Papers too close to resolve are nudged apart just enough
   to show as separate peaks.
     opts.onSelect(paper)  a peak was clicked
     opts.onStep(±1)       ← / → keys on the map (−1 = newer, +1 = older)
     opts.onFilter(key)    a theme was chosen (null = all)
   Returns { select(paper) } to mark the paper shown in the detail panel.
   Data: window.PUBLICATIONS (each with a theme) and window.PUB_THEMES.
   ========================================================================== */
(function (global) {
  'use strict';

  const dark = matchMedia('(prefers-color-scheme: dark)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const MIN_SEP = 16;   // px: the closest two peaks in one row may sit
  const MORPH_MS = 650; // 2D ⇄ 1D transition

  const clamp = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = m => (m < 0.5 ? 4 * m * m * m : 1 - Math.pow(-2 * m + 2, 3) / 2);

  function prepare() {
    const themes = global.PUB_THEMES || {};
    const keys = Object.keys(themes);
    const items = (global.PUBLICATIONS || [])
      .filter(p => keys.includes(p.theme))
      .map(p => ({ p, x: p.year + ((p.month || 6) - 0.5) / 12, row: keys.indexOf(p.theme) }));
    const xs = items.map(it => it.x);
    return { items, keys, labels: keys.map(k => themes[k]),
      lo: Math.floor(Math.min(...xs)) - 0.15, hi: Math.ceil(Math.max(...xs)) + 0.15 };
  }

  function layout(st, D) {
    const { w, h } = st;
    const wide = w >= 560;                     // labels beside the plot; contour mode
    const top = 26;                            // room for "All" above the first theme
    const a = { x: 6, y: top, w: w - 6 - (wide ? 176 : 6), h: h - top - 30 };
    const band = a.h / D.keys.length;
    const labelH = wide ? 0 : 16;              // narrow: a label strip atop each row
    const X = x => a.x + ((D.hi - x) / (D.hi - D.lo)) * a.w;
    const Y = r => a.y + band * r + labelH + (band - labelH) / 2;
    return { a, wide, band, labelH, X, Y, pxPerYear: a.w / (D.hi - D.lo) };
  }

  // Screen x for every paper: true date, except that papers closer than
  // MIN_SEP in the same row are spread apart (keeping their order and centre).
  function spread(D, L) {
    const pos = new Map();
    D.keys.forEach((k, r) => {
      const row = D.items.filter(it => it.row === r).map(it => ({ it, x0: L.X(it.x) })).sort((p, q) => p.x0 - q.x0);
      let run = [];
      const flush = () => {
        if (!run.length) return;
        const shift = run.reduce((s, e) => s + e.x0 - e.x, 0) / run.length;
        for (const e of run) pos.set(e.it, Math.max(L.a.x + 4, Math.min(L.a.x + L.a.w - 4, e.x + shift)));
        run = [];
      };
      row.forEach((e, i) => {
        const prev = run[run.length - 1];
        e.x = prev ? Math.max(e.x0, prev.x + MIN_SEP) : e.x0;
        if (prev && e.x0 - prev.x >= MIN_SEP) { flush(); e.x = e.x0; }
        run.push(e);
        if (i === row.length - 1) flush();
      });
    });
    return pos;
  }

  function axes(ctx, L, D, th) {
    const { a } = L;
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(a.x) + 0.5, Math.round(a.y) + 0.5, Math.round(a.w), Math.round(a.h));
    ctx.font = `11px ${th.mono}`; ctx.fillStyle = th.muted; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const every = L.pxPerYear < 46 ? 2 : 1;
    for (let y = Math.ceil(D.lo); y <= Math.floor(D.hi); y++) {
      const x = Math.round(L.X(y)) + 0.5;
      ctx.strokeStyle = th.muted;
      ctx.beginPath(); ctx.moveTo(x, a.y + a.h); ctx.lineTo(x, a.y + a.h + 4); ctx.stroke();
      if (y + 1 <= D.hi && y % every === 0) ctx.fillText(String(y), L.X(y + 0.5), a.y + a.h + 8);
    }
    ctx.textAlign = 'right';
    ctx.fillText('year', a.x + a.w, a.y + a.h + 20);
  }

  function gradient(ctx, L, th) {
    const g = ctx.createLinearGradient(L.a.x, 0, L.a.x + L.a.w, 0);
    g.addColorStop(0, th.fid); g.addColorStop(1, th.spec);
    return g;
  }

  /* ---------- 2D contours: marching squares over summed Gaussians ---------- */

  function field(L, D, pos, cell, sx, sy) {
    const nx = Math.ceil(L.a.w / cell) + 1, ny = Math.ceil(L.a.h / cell) + 1;
    const g = new Float32Array(nx * ny);
    for (const it of D.items) {
      const cx = pos.get(it) - L.a.x, cy = L.Y(it.row) - L.a.y;
      const i0 = Math.max(0, Math.floor((cx - 3 * sx) / cell)), i1 = Math.min(nx - 1, Math.ceil((cx + 3 * sx) / cell));
      const j0 = Math.max(0, Math.floor((cy - 3 * sy) / cell)), j1 = Math.min(ny - 1, Math.ceil((cy + 3 * sy) / cell));
      for (let j = j0; j <= j1; j++) {
        const dy = (j * cell - cy) / sy;
        for (let i = i0; i <= i1; i++) {
          const dx = (i * cell - cx) / sx;
          g[j * nx + i] += Math.exp(-0.5 * (dx * dx + dy * dy));
        }
      }
    }
    return { g, nx, ny };
  }

  // corners a (top-left) b (top-right) c (bottom-right) d (bottom-left)
  const CASES = [[], [['L', 'T']], [['T', 'R']], [['L', 'R']], [['R', 'B']], [['L', 'T'], ['R', 'B']], [['T', 'B']], [['L', 'B']],
    [['B', 'L']], [['T', 'B']], [['T', 'R'], ['B', 'L']], [['R', 'B']], [['R', 'L']], [['T', 'R']], [['L', 'T']], []];

  function contourLines(ctx, F, L, level, cell) {
    const { g, nx, ny } = F, ox = L.a.x, oy = L.a.y;
    ctx.beginPath();
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = g[j * nx + i], b = g[j * nx + i + 1], c = g[(j + 1) * nx + i + 1], d = g[(j + 1) * nx + i];
        const idx = (a > level) | ((b > level) << 1) | ((c > level) << 2) | ((d > level) << 3);
        if (idx === 0 || idx === 15) continue;
        const x = ox + i * cell, y = oy + j * cell;
        const pt = e => (e === 'T' ? [x + ((level - a) / (b - a)) * cell, y]
          : e === 'R' ? [x + cell, y + ((level - b) / (c - b)) * cell]
          : e === 'B' ? [x + ((level - d) / (c - d)) * cell, y + cell]
          : [x, y + ((level - a) / (d - a)) * cell]);
        for (const [e1, e2] of CASES[idx]) {
          const p1 = pt(e1), p2 = pt(e2);
          ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
        }
      }
    }
    ctx.stroke();
  }

  function drawContour(ctx, L, D, pos, th, alpha) {
    const cell = 1.5, sx = MIN_SEP / 3.4, sy = Math.min((L.band - L.labelH) * 0.15, sx * 1.35);
    const F = field(L, D, pos, cell, sx, sy);
    const levels = [0.14, 0.24, 0.4, 0.62, 0.86];
    ctx.strokeStyle = gradient(ctx, L, th); ctx.lineWidth = 1.1;
    levels.forEach((lv, k) => { ctx.globalAlpha = alpha * (0.4 + 0.6 * (k / (levels.length - 1))); contourLines(ctx, F, L, lv, cell); });
    ctx.globalAlpha = 1;
  }

  /* ---------- 1D traces ---------- */

  // where a row's trace sits: in the stacked view (t = 0) or as the full 1D
  // projection (t = 1)
  function traceGeom(L, r, t) {
    const inner = L.band - L.labelH;
    const rowBase = L.a.y + L.band * (r + 1) - inner * 0.14, rowH = inner * 0.62;
    const fullBase = L.a.y + L.a.h - 10, fullH = L.a.h * 0.78;
    return { base: lerp(rowBase, fullBase, t), H: lerp(rowH, fullH, t) };
  }

  function drawTrace(ctx, L, D, pos, th, r, t, alpha, gamma) {
    const { base, H } = traceGeom(L, r, t);
    const xs = D.items.filter(it => it.row === r).map(it => pos.get(it));
    const y = px => { let v = 0; for (const x of xs) { const d = (px - x) / gamma; v += 1 / (1 + d * d); } return base - Math.min(v, 1.3) * H; };
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L.a.x, Math.round(base) + 0.5); ctx.lineTo(L.a.x + L.a.w, Math.round(base) + 0.5); ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (let px = L.a.x; px <= L.a.x + L.a.w; px += 0.5) px === L.a.x ? ctx.moveTo(px, y(px)) : ctx.lineTo(px, y(px));
    ctx.strokeStyle = gradient(ctx, L, th); ctx.lineWidth = 1.4 + 0.3 * t; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ---------- Mounting ---------- */

  function mount(canvas, opts = {}) {
    let th = Plot.theme(), hover = null, selected = null, L = null, pos = null;
    const D = prepare();
    const wrap = canvas.parentElement;
    canvas.tabIndex = 0;

    // view: which theme is projected (null = the full map), with a transition
    // from the previous view; w(key) is how far each theme is "projected" (0–1)
    let view = null, from = null, t0 = 0, raf = 0;
    const amount = () => (reduce.matches ? 1 : ease(clamp((performance.now() - t0) / MORPH_MS)));
    const weightOf = (key, m) => (view === key ? m : 0) + (from === key ? 1 - m : 0);

    // theme buttons, plus "All" above them
    const labels = document.createElement('div');
    labels.className = 'map-labels';
    const mk = (text, key) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'map-label' + (key == null ? ' is-all' : ''); b.textContent = text;
      b.addEventListener('click', () => setView(key === view ? null : key));
      labels.append(b);
      return b;
    };
    const allBtn = mk('All', null);
    const themeBtns = D.keys.map((k, r) => mk(D.labels[r], k));
    wrap.append(labels);

    // The hover card (mouse only): a label for the peak under the pointer,
    // shown beside the cursor and never under it. It ignores the mouse, so
    // the peaks are always what you click.
    const tip = document.createElement('div');
    tip.className = 'map-tip'; tip.hidden = true;
    tip.setAttribute('aria-hidden', 'true'); // the detail panel already says this
    wrap.append(tip);
    let tipItem = null;
    const st = Plot.fitCanvas(canvas, () => render());

    function setView(key) {
      if (key === view) return;
      from = view; view = key; t0 = performance.now();
      if (opts.onFilter) opts.onFilter(key);
      cancelAnimationFrame(raf);
      const loop = () => { render(); if (amount() < 1) raf = requestAnimationFrame(loop); };
      loop();
    }

    function peakXY(it) {
      const m = amount(), w = weightOf(D.keys[it.row], m);
      if (w > 0.5 || !L.wide) {
        const { base, H } = traceGeom(L, it.row, w);
        return [pos.get(it), base - H];
      }
      return [pos.get(it), L.Y(it.row)];
    }

    function placeLabels() {
      const { a } = L;
      const pressed = k => String(view === k);
      allBtn.setAttribute('aria-pressed', pressed(null));
      themeBtns.forEach((b, r) => b.setAttribute('aria-pressed', pressed(D.keys[r])));
      labels.classList.toggle('is-narrow', !L.wide);
      if (L.wide) {
        allBtn.style.left = `${a.x + a.w + 6}px`; allBtn.style.top = `${a.y - 14}px`;
        themeBtns.forEach((b, r) => {
          b.style.left = `${a.x + a.w + 6}px`; b.style.top = `${L.Y(r)}px`;
          b.style.opacity = ''; b.style.pointerEvents = ''; b.tabIndex = 0;
        });
      } else {
        // narrow: each label sits atop its strip; when a theme is projected its
        // label rises to the top of the plot and the others fade out of the way
        const m = amount();
        const full = (view === null ? m : 0) + (from === null ? 1 - m : 0);
        allBtn.style.left = `${a.x}px`; allBtn.style.top = '2px';
        themeBtns.forEach((b, r) => {
          const w = weightOf(D.keys[r], m), show = Math.max(full, w);
          b.style.left = `${a.x + 2}px`;
          b.style.top = `${a.y + L.band * r * (1 - w) + 1}px`;
          b.style.opacity = show.toFixed(3);
          b.style.pointerEvents = show > 0.5 ? '' : 'none';
          b.tabIndex = show > 0.5 ? 0 : -1;
        });
      }
    }

    function render() {
      if (!st.w) return;
      L = layout(st, D);
      pos = spread(D, L);
      placeLabels();
      const { ctx } = st, m = amount();
      ctx.clearRect(0, 0, st.w, st.h);
      axes(ctx, L, D, th);
      ctx.save();
      ctx.beginPath(); ctx.rect(L.a.x, L.a.y, L.a.w, L.a.h); ctx.clip();

      // how much of the full map is showing: 1 when no theme is projected
      const full = (view === null ? m : 0) + (from === null ? 1 - m : 0);
      const gamma = MIN_SEP / 4.5;
      if (L.wide) {
        if (full > 0.001) drawContour(ctx, L, D, pos, th, full);
        D.keys.forEach((k, r) => { const w = weightOf(k, m); if (w > 0.001) drawTrace(ctx, L, D, pos, th, r, w, w, gamma); });
      } else {
        // narrow: stacked traces; the chosen one grows to full height, the rest fade
        D.keys.forEach((k, r) => {
          const w = weightOf(k, m);
          const alpha = Math.max(full, w);
          if (alpha > 0.001) drawTrace(ctx, L, D, pos, th, r, w, alpha, gamma);
        });
      }

      // the paper shown in the detail panel
      const sel = D.items.find(it => it.p === selected);
      const visible = it => view === null || D.keys[it.row] === view;
      if (sel && visible(sel)) {
        const [x, y] = peakXY(sel);
        ctx.strokeStyle = th.ink; ctx.globalAlpha = 0.25; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(x, L.a.y); ctx.lineTo(x, L.a.y + L.a.h); ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha = 1;
        ctx.strokeStyle = th.ink; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke();
      }
      if (hover && hover !== sel) {
        const [x, y] = peakXY(hover);
        ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }

    function nearest(px, py) {
      if (!L || px < L.a.x || px > L.a.x + L.a.w || py < L.a.y || py > L.a.y + L.a.h) return null;
      // projected: any paper of that theme; full map: the row under the pointer
      const row = view !== null ? D.keys.indexOf(view) : Math.min(D.keys.length - 1, Math.floor((py - L.a.y) / L.band));
      let best = null, bd = Infinity;
      for (const it of D.items) {
        if (it.row !== row) continue;
        const d = Math.abs(pos.get(it) - px);
        if (d < bd) { bd = d; best = it; }
      }
      return bd <= MIN_SEP * 0.9 ? best : null;
    }

    function showTip(it, px, py) {
      if (it !== tipItem && it) {
        tip.innerHTML = `<p class="map-tip-head">${it.p.year} · ${D.labels[it.row]}</p><p class="map-tip-title"></p>`;
        tip.querySelector('.map-tip-title').textContent = it.p.title;
      }
      tipItem = it || null;
      if (!it) { tip.hidden = true; return; }
      tip.hidden = false;
      // beside the cursor: to its right, or its left near the right edge;
      // above it, or below it near the top
      const GAP = 14, W = wrap.clientWidth, tw = tip.offsetWidth, tipH = tip.offsetHeight;
      const x = px + canvas.offsetLeft, y = py + canvas.offsetTop;
      let left = x + GAP;
      if (left + tw > W - 8) left = x - GAP - tw;
      left = Math.max(8, Math.min(left, W - tw - 8));
      let top = y - tipH - GAP;
      if (top < 4) top = y + GAP + 12;   // the extra clears the cursor itself
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    }

    canvas.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
      const h = nearest(px, py);
      if (h !== hover) { hover = h; render(); }
      canvas.style.cursor = hover ? 'pointer' : '';
      if (e.pointerType === 'mouse') showTip(hover, px, py);
    });
    canvas.addEventListener('pointerleave', () => { hover = null; render(); showTip(null); });
    canvas.addEventListener('click', e => {
      const r = canvas.getBoundingClientRect();
      const it = nearest(e.clientX - r.left, e.clientY - r.top);
      if (it && opts.onSelect) opts.onSelect(it.p);
    });
    canvas.addEventListener('keydown', e => {
      if (!opts.onStep) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); opts.onStep(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); opts.onStep(1); }
    });
    dark.addEventListener('change', () => { th = Plot.theme(); render(); });

    return {
      select(paper) { selected = paper; render(); },
      view: () => view
    };
  }

  global.PubMap = { mount };
})(window);
