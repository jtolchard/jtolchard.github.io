/* ==========================================================================
   Canvas helpers: the site's colours (from the CSS variables in
   css/style.css), sharp canvases and tick steps. Exposes window.Plot.
   ========================================================================== */
(function (global) {
  'use strict';

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function theme() {
    return {
      ink: cssVar('--ink'), soft: cssVar('--ink-soft'), muted: cssVar('--muted'),
      rule: cssVar('--rule'), grid: cssVar('--grid'), bg: cssVar('--bg'),
      surface: cssVar('--surface'), fid: cssVar('--fid'), spec: cssVar('--spec'), green: cssVar('--green'), red: cssVar('--red'),
      mono: cssVar('--mono') || 'monospace'
    };
  }

  // Keep a canvas sharp at its CSS size; call onResize when that size changes.
  // It measures once straight away, so callers can draw immediately.
  function fitCanvas(canvas, onResize) {
    const ctx = canvas.getContext('2d');
    const state = { ctx, w: 0, h: 0 };
    const measure = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (r.width === state.w && r.height === state.h) return false;
      state.w = r.width; state.h = r.height;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };
    measure();
    new ResizeObserver(() => { if (measure() && onResize) onResize(state); }).observe(canvas);
    return state;
  }

  // Text with tight superscripts and subscripts. The mono font's own ¹ ³ ₂ digits each take a
  // full character's width, so ¹³C reads as "¹ ³C"; here they're drawn as smaller digits, raised
  // or lowered and set close together. Plain text is drawn as usual.
  const SUP = '\u2070\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079';   // ⁰ … ⁹
  const SUB = '\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089';   // ₀ … ₉
  const SCRIPT = /[\u2070\u00b9\u00b2\u00b3\u2074-\u2079\u2080-\u2089]/;
  function runs(str) {             // [{ s, kind }]: kind 1 superscript, -1 subscript, 0 normal
    const out = [];
    for (const ch of str) {
      const i = SUP.indexOf(ch), j = SUB.indexOf(ch);
      const kind = i >= 0 ? 1 : j >= 0 ? -1 : 0, c = i >= 0 ? String(i) : j >= 0 ? String(j) : ch;
      const last = out[out.length - 1];
      if (last && last.kind === kind) last.s += c; else out.push({ s: c, kind });
    }
    return out;
  }
  function runWidth(ctx, r, size, family) {
    if (!r.kind) { ctx.font = `${size}px ${family}`; return ctx.measureText(r.s).width; }
    ctx.font = `${Math.round(size * 0.67)}px ${family}`;
    return ctx.measureText('0').width * 0.85 * r.s.length + 0.5;
  }
  // The width text() draws str at, in px.
  function textWidth(ctx, str, size = 12, family = cssVar('--mono')) {
    ctx.font = `${size}px ${family}`;
    if (!SCRIPT.test(str)) return ctx.measureText(str).width;
    return runs(str).reduce((sum, r) => sum + runWidth(ctx, r, size, family), 0);
  }
  // Draws str at (x, y) in the current fill colour and text baseline ('middle' or 'alphabetic').
  function text(ctx, str, x, y, { size = 12, family = cssVar('--mono'), align = 'left' } = {}) {
    ctx.font = `${size}px ${family}`; ctx.textAlign = align;
    if (!SCRIPT.test(str)) { ctx.fillText(str, x, y); return; }
    const W = textWidth(ctx, str, size, family), mid = ctx.textBaseline === 'middle';
    const up = size * (mid ? 0.3 : 0.42), down = size * (mid ? 0.22 : 0.12);
    let cx = align === 'center' ? x - W / 2 : align === 'right' ? x - W : x;
    ctx.textAlign = 'left';
    for (const r of runs(str)) {
      const rw = runWidth(ctx, r, size, family);          // also sets the run's font
      if (!r.kind) ctx.fillText(r.s, cx, y);
      else {
        const dw = (rw - 0.5) / r.s.length, dy = r.kind > 0 ? -up : down;
        [...r.s].forEach((d, k) => ctx.fillText(d, cx + k * dw, y + dy));
      }
      cx += rw;
    }
    ctx.font = `${size}px ${family}`; ctx.textAlign = align;
  }

  function niceStep(range, count) {
    const raw = range / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
  }

  global.Plot = { theme, fitCanvas, niceStep, text, textWidth };
})(window);
