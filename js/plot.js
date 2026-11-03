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
      surface: cssVar('--surface'), fid: cssVar('--fid'), spec: cssVar('--spec'),
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

  function niceStep(range, count) {
    const raw = range / Math.max(1, count);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
  }

  global.Plot = { theme, fitCanvas, niceStep };
})(window);
