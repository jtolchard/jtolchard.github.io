/* ==========================================================================
   Home page hero. A slim strip behind your name shows an FID that records
   as you scroll and then Fourier-transforms into its spectrum. The first
   screen holds still for a stretch of scrolling while this plays, and then
   a little longer on the finished spectrum (REST, below).
   When the page scrolls on, the strip scrolls away, but your name stays: it
   shrinks up into the menu bar and becomes the site's name there.
   On screens too short to hold the first screen, nothing is held and the
   finished spectrum is shown.

   Which spectrum: data/spectra.js (each visit shows the next one from its
   rotation, in a shuffled order).
   Extras (set to false below to switch off):
     PHASE  the spectrum arrives out of phase and is phase-corrected over the
            last stretch of scrolling
     HOVER  over the finished spectrum, a cursor reads out the ppm (and names
            a peak when you're on one)
   Preview tools: ?spectrum=caffeine shows that spectrum;
   ?hero-p=0.8 freezes the progress (0 … 1).
   ========================================================================== */
(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const PHASE = true;
  const HOVER = true;

  // The spectra, and which one this visit shows: data/spectra.js
  const SPECTRA = window.SPECTRA || {};

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const freeze = parseFloat(params.get('hero-p'));

  // The last share of the held scroll (--hold in css/style.css) during which
  // the finished spectrum stays put before the page moves on. Raise it to
  // linger longer; also raise --hold to keep the animation's pace.
  const REST = 0.2;

  // How the rest of the held scroll is spent (fractions of it):
  const REC = 0.6;                    // 0 → REC: the FID records left to right
  const HOLD = 0.66;                  // REC → HOLD: the full FID holds
  const DONE = PHASE ? 0.84 : 0.9;    // HOLD → DONE: it reshapes into the spectrum
  const PHASED = 0.98;                // DONE → PHASED: phase correction (if on)
  const START = 0.07;                 // share of the FID showing before any scroll
  const COLLAPSE = 0.3;               // screen-heights of scrolling for the name to reach the menu bar
  const PH0 = 80, PH1 = -60;          // starting phase errors in degrees (if PHASE is on)

  // The lowest ppm shown sits at this many FID cycles across the strip.
  const F0 = 21.5;

  const clamp = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = m => (m < 0.5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2);
  let th = Plot.theme();
  const signalAlpha = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--signal-alpha')) || 0.4;
  let alpha = signalAlpha();

  // Turn a spectrum's peaks (ppm) into FID lines (cycles across the strip).
  function prepareSpectrum(def) {
    const [hi, lo] = def.window;
    const span = def.cycles || 15;
    const k = span / (hi - lo);                // cycles per ppm
    const lines = def.peaks.map(pk => {
      const r = Math.PI * k * pk.width;        // decay rate that gives this line width
      return { f: F0 + (pk.ppm - lo) * k, r, a: pk.height * r, ppm: pk.ppm, width: pk.width, name: pk.name };
    });
    const total = lines.reduce((s, l) => s + l.a, 0);
    for (const l of lines) l.a /= total;
    return { def, lines, hi, lo, k, fLo: F0, fHi: F0 + span,
      ppmAt: u => hi - u * (hi - lo), uAt: ppm => (hi - ppm) / (hi - lo) };
  }

  // ?spectrum=name previews one. Otherwise each visit takes the next name from
  // a shuffled copy of the rotation, refilled (and reshuffled) once it runs
  // out, so every spectrum shows before any repeats. Kept in localStorage;
  // where that's unavailable, each visit just picks at random.
  function pickSpectrum() {
    const asked = params.get('spectrum');
    if (asked && SPECTRA[asked]) return asked;
    const names = (window.SPECTRUM_ROTATION || []).filter(n => SPECTRA[n]);
    if (!names.length) return Object.keys(SPECTRA)[0];
    if (names.length === 1) return names[0];
    const KEY = 'hero-spectra';
    let bag = [], last = null;
    try {
      const saved = JSON.parse(localStorage.getItem(KEY)) || {};
      bag = (saved.bag || []).filter(n => names.includes(n));
      last = saved.last;
    } catch (e) { /* no storage: fall through to a random pick */ }
    if (!bag.length) {
      bag = names.slice();
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
      if (bag[0] === last) bag.push(bag.shift()); // no repeat across a refill
    }
    const next = bag.shift();
    try { localStorage.setItem(KEY, JSON.stringify({ bag, last: next })); } catch (e) { /* fine */ }
    return next;
  }

  const root = document.documentElement;
  const hero = document.getElementById('hero');
  const stage = hero && hero.querySelector('.hero-stage');
  const canvas = document.querySelector('.hero-signal');
  const nameBlock = document.querySelector('.hero-name');
  const title = nameBlock && nameBlock.querySelector('h1');
  const ident = title;
  const hint = document.querySelector('.scroll-hint');
  const nav = document.querySelector('.nav');
  const logo = document.querySelector('.brand img');
  if (!hero || !stage || !canvas || !nameBlock || !title || !Object.keys(SPECTRA).length) return;
  root.classList.add('hero-js');

  const S = prepareSpectrum(SPECTRA[pickSpectrum()]);
  canvas.setAttribute('aria-label', `An NMR signal (a ${S.def.nucleus} FID) that records as you scroll, then turns into its spectrum`);

  /* ---------- Signal and spectrum ---------- */

  function signal(n) {
    const re = new Float64Array(n), im = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      for (const L of S.lines) {
        const env = L.a * Math.exp(-L.r * u), ph = 2 * Math.PI * L.f * u;
        re[i] += env * Math.cos(ph);
        im[i] += env * Math.sin(ph);
      }
    }
    return { re, im, n };
  }

  // Spectrum of the signal above, resampled to `cols` points with high ppm on
  // the left: absorption (re) and dispersion (im), scaled so the tallest
  // absorption peak is 1. Zero-filled until there's an FFT point every ~2 px.
  function spectrum(sig, cols) {
    const need = ((sig.n - 1) * cols) / (2 * (S.fHi - S.fLo));
    const M = Math.min(1 << 18, Math.max(8192, 1 << Math.ceil(Math.log2(need))));
    const fft = NMR.makeFFT(M);
    const re = new Float64Array(M), im = new Float64Array(M);
    re.set(sig.re); im.set(sig.im);
    re[0] *= 0.5; im[0] *= 0.5;
    // apodisation: taper the last 15% of the FID to zero, so narrow lines that
    // haven't fully decayed by the end don't ring along the baseline
    const t0 = Math.floor(sig.n * 0.85), tn = sig.n - 1 - t0;
    for (let i = t0; i < sig.n; i++) {
      const wgt = 0.5 * (1 + Math.cos((Math.PI * (i - t0)) / tn));
      re[i] *= wgt; im[i] *= wgt;
    }
    fft(re, im);
    const perBin = (sig.n - 1) / M;
    const out = { re: new Float64Array(cols), im: new Float64Array(cols) };
    let mx = 1e-12;
    for (let c = 0; c < cols; c++) {
      const k = (S.fHi - (c / (cols - 1)) * (S.fHi - S.fLo)) / perBin;
      const k0 = Math.floor(k), t = k - k0;
      out.re[c] = re[k0] * (1 - t) + re[k0 + 1] * t;
      out.im[c] = im[k0] * (1 - t) + im[k0 + 1] * t;
      if (out.re[c] > mx) mx = out.re[c];
    }
    for (let c = 0; c < cols; c++) { out.re[c] /= mx; out.im[c] /= mx; }
    return out;
  }

  let sig = null, spec = null, hoverX = null;
  const st = Plot.fitCanvas(canvas, () => { prep(); render(); });
  function prep() {
    if (!st.w) return;
    sig = signal(Math.max(400, Math.round(st.w * 1.6)));
    spec = spectrum(sig, Math.max(2, Math.round(st.w)));
  }

  function text(str, x, y, align, color) {
    const { ctx } = st;
    ctx.font = `12px ${th.mono}`;
    ctx.fillStyle = color || th.muted;
    ctx.textBaseline = 'alphabetic';
    Plot.text(ctx, str, x, y, { size: 12, family: th.mono, align });   // ¹³C with a tight superscript
  }

  function draw(p) {
    const { ctx, w, h } = st;
    if (!w || !sig) return;
    ctx.clearRect(0, 0, w, h);

    // FID: centred on `mid`. Spectrum: shares the FID's band, with its
    // baseline just below your name and its tallest peak near the top.
    const pad = 4, T = 18, B = 2;
    const mid = T + (h - T - B) / 2, A = (h - T - B) * 0.46;
    const base = mid + A * 0.55, top = T + 2;
    const { re, n } = sig, cols = spec.re.length;
    const X = u => pad + u * (w - 2 * pad);
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, th.fid); g.addColorStop(1, th.spec);
    ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineJoin = 'round';
    ctx.globalAlpha = alpha;

    const frac = p < REC ? START + (1 - START) * (p / REC) : 1;
    const m = ease(clamp((p - HOLD) / (DONE - HOLD)));
    // phase error still left (1 = full error, 0 = corrected)
    const err = PHASE ? 1 - ease(clamp((p - DONE) / (PHASED - DONE))) : 0;
    const specAt = c => {
      if (!err) return spec.re[c];
      const phi = err * ((PH0 + PH1 * (c / (cols - 1) - 0.5)) * Math.PI) / 180;
      return spec.re[c] * Math.cos(phi) - spec.im[c] * Math.sin(phi);
    };
    const specY = c => Math.max(2, Math.min(h - 2, base - specAt(c) * (base - top)));

    ctx.beginPath();
    if (m === 0) {
      const last = Math.max(2, Math.floor((n - 1) * frac) + 1);
      for (let i = 0; i < last; i++) {
        const x = X(i / (n - 1)), y = mid - re[i] * A;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      if (frac < 1) {
        ctx.fillStyle = th.spec;
        ctx.globalAlpha = Math.min(1, alpha * 1.6);
        ctx.beginPath(); ctx.arc(X((last - 1) / (n - 1)), mid - re[last - 1] * A, 3, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      for (let c = 0; c < cols; c++) {
        const u = c / (cols - 1);
        const yF = mid - re[Math.round(u * (n - 1))] * A;
        const y = yF + (specY(c) - yF) * m;
        c ? ctx.lineTo(X(u), y) : ctx.moveTo(X(u), y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const nuc = S.def.nucleus;
    let status;
    if (m === 0) status = frac < 1 ? `${nuc} FID · acquiring` : `${nuc} FID`;
    else if (m < 1) status = 'Fourier transform';
    else if (err > 0.002) status = `phase correction · ph0 ${Math.round(PH0 * err)}° · ph1 ${Math.round(PH1 * err)}°`;
    else status = S.def.decoupled ? `${nuc}{¹H} spectrum` : `${nuc} spectrum`;
    text(status, w - pad, 13, 'right');

    // the ppm axis fades in as the spectrum settles
    const a = clamp((m - 0.7) / 0.3);
    if (a > 0) {
      ctx.globalAlpha = a;
      ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pad, Math.round(base) + 0.5); ctx.lineTo(w - pad, Math.round(base) + 0.5); ctx.stroke();
      const step = Plot.niceStep(S.hi - S.lo, Math.max(3, Math.floor(w / 180)));
      const dp = Math.max(0, -Math.floor(Math.log10(step) + 1e-9)); // decimals the step needs
      for (let ppm = Math.ceil(S.lo / step) * step; ppm <= S.hi; ppm += step) {
        const x = X(S.uAt(ppm));
        ctx.strokeStyle = th.muted;
        ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base + 4); ctx.stroke();
        if (x > 12 && x < w - 40) text(ppm.toFixed(dp), x, base + 15, 'center');
      }
      text('ppm', w - pad, base + 15, 'right');
      ctx.globalAlpha = 1;
    }

    // hover readout over the finished spectrum
    if (HOVER && hoverX != null && m >= 1) {
      const u = clamp((hoverX - pad) / (w - 2 * pad));
      const c = Math.round(u * (cols - 1));
      const x = X(u), y = specY(c), ppm = S.ppmAt(u);
      ctx.strokeStyle = th.ink; ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(Math.round(x) + 0.5, T); ctx.lineTo(Math.round(x) + 0.5, base); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
      ctx.fillStyle = th.spec;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      const near = S.lines.find(L => Math.abs(L.ppm - ppm) < L.width * 0.6);
      const label = near && near.name ? `${near.name} · ${near.ppm.toFixed(1)} ppm` : `${ppm.toFixed(1)} ppm`;
      const right = x < w - 160;
      text(label, right ? x + 8 : x - 8, T + 12, right ? 'left' : 'right', th.ink);
    }
  }

  if (HOVER) {
    canvas.classList.add('is-hoverable');
    canvas.addEventListener('pointermove', e => { hoverX = e.clientX - canvas.getBoundingClientRect().left; render(); });
    canvas.addEventListener('pointerleave', () => { hoverX = null; render(); });
  }

  /* ---------- Your name: stays, and shrinks into the menu bar beside the logo ---------- */

  let geo = null;
  function measure() {
    ident.style.transform = '';
    root.style.setProperty('--name-h', `${nameBlock.offsetHeight}px`);
    const r = ident.getBoundingClientRect();
    const size = innerWidth <= 640 ? 15 : 18; // name size once in the menu bar
    const scale = size / parseFloat(getComputedStyle(title).fontSize);
    const left = logo ? logo.getBoundingClientRect().right + 10 : r.left;
    const centre = nav.offsetHeight / 2;
    // where the name sits while the name block is stuck under the menu bar
    const restTop = nav.offsetHeight + ident.offsetTop;
    // if the shrunken name wouldn't fit beside the menu links, fade it out instead
    const links = document.querySelector('.nav-links');
    const room = links ? links.getBoundingClientRect().left - left - 12 : Infinity;
    const fade = r.width * scale > room;
    geo = { dx: left - r.left, dy: centre - (r.height * scale) / 2 - restTop, scale, fade };
  }

  function collapse(q) {
    if (!geo) return;
    const e = ease(q);
    if (geo.fade) {
      ident.style.transform = q > 0 ? `translateY(${-24 * e}px)` : '';
      ident.style.opacity = String(1 - e);
    } else {
      ident.style.transform = q > 0
        ? `translate(${geo.dx * e}px, ${geo.dy * e}px) scale(${lerp(1, geo.scale, e)})`
        : '';
      ident.style.opacity = '';
    }
  }

  /* ---------- Scroll ---------- */

  const held = () => getComputedStyle(stage).position === 'sticky';
  const stuckTop = () => nav.offsetHeight + nameBlock.offsetHeight;

  const hold = () => hero.offsetHeight - stage.offsetHeight;
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;

  // 0 … 1 across the stretch of scrolling during which the first screen holds,
  // minus the REST at its end, when the finished spectrum stays put. On a
  // screen tall enough that the page ends before the hold does, the same
  // split applies to the scroll there is.
  function progress() {
    if (Number.isFinite(freeze)) return clamp(freeze);
    if (!held()) return 1; // short screens: no hold
    const span = Math.min(hold(), maxScroll()) * (1 - REST);
    return span > 1 ? clamp((stuckTop() - hero.getBoundingClientRect().top) / span) : 1;
  }

  // 0 … 1 as the page scrolls on after the hold, carrying the name up. If
  // there's little or nothing left to scroll past, the name stays where it is.
  function collapseProgress() {
    const room = maxScroll() - (held() ? hold() : 0);
    if (room < 60) return 0;
    const past = stuckTop() - stage.getBoundingClientRect().top;
    return clamp(past / Math.min(innerHeight * COLLAPSE, room));
  }

  function extras(p) {
    if (hint) hint.style.opacity = String(1 - clamp(p / 0.05));
    collapse(collapseProgress());
  }

  let cur = progress(), target = cur, raf = 0;
  function render() { draw(cur); extras(cur); }
  function tick() {
    raf = 0;
    cur = reduce.matches ? target : cur + (target - cur) * 0.2;
    if (Math.abs(target - cur) < 1e-4) cur = target;
    render();
    if (cur !== target) raf = requestAnimationFrame(tick);
  }
  function update() {
    target = progress();
    if (reduce.matches || Number.isFinite(freeze)) { cur = target; render(); return; }
    extras(cur); // the name follows the scroll directly
    if (!raf) raf = requestAnimationFrame(tick);
  }

  measure();
  prep();
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { measure(); update(); });
  dark.addEventListener('change', () => { th = Plot.theme(); alpha = signalAlpha(); render(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); render(); });
  cur = target = progress();
  render();
})();
