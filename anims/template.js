/* ==========================================================================
   TEMPLATE for your own paper animations (see anims/README.md).
   Copy this file to anims/<name>.js, change the name in Anim.register to
   match, and point a paper at it in data/publications.js:
     media: { type: "animation", name: "<name>", alt: "One sentence on what it shows" }
   Try it at anims/preview.html?name=<name>

   This one: signal averaging. The noise falls as √N while the peaks stay put.
   ========================================================================== */
(function () {
  'use strict';

  // Work that only needs doing once goes out here, not in the frame function.
  const N = 480;                                  // points across the spectrum
  const rand = Anim.seeded(7);                    // repeatable "random" numbers
  const noise = Array.from({ length: N }, () => { // roughly Gaussian, unit spread
    let s = 0;
    for (let k = 0; k < 6; k++) s += rand();
    return (s - 3) * Math.SQRT2;
  });
  const peaks = [{ x: 0.27, h: 1, w: 0.012 }, { x: 0.52, h: 0.55, w: 0.012 }, { x: 0.71, h: 0.8, w: 0.016 }];
  const clean = Array.from({ length: N }, (_, i) => {
    const x = i / (N - 1);
    return peaks.reduce((y, p) => y + p.h / (1 + ((x - p.x) / p.w) ** 2), 0);
  });

  const CYCLE = 7;        // seconds per loop
  const RAMP = 5;         // seconds spent adding scans; the rest holds the result
  const FIRST = 4, LAST = 256;   // scans at the start and end of the loop

  // Called every frame while the panel is on screen. Redraw everything.
  Anim.register('template', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);                    // the panel's background shows through

    // Lay out from w and h, never fixed positions: the panel is always 4:3,
    // from about 240×180 (small phones) to 660×495 (tablets).
    const pad = Math.max(14, w * 0.05);
    const x0 = pad, x1 = w - pad, base = h * 0.72, top = h * 0.22;
    const X = i => x0 + (i / (N - 1)) * (x1 - x0);

    const s = t % CYCLE;
    const scans = Math.round(FIRST * Math.pow(LAST / FIRST, Math.min(1, s / RAMP))); // 4 → 256
    const sigma = 0.26 / Math.sqrt(scans);   // small enough that the noise stays inside the panel

    // axis line
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Math.round(base) + 0.5); ctx.lineTo(x1, Math.round(base) + 0.5); ctx.stroke();

    // the spectrum: frequency domain, so th.spec (orange); a time signal would be th.fid (blue)
    ctx.strokeStyle = th.spec; ctx.lineWidth = 1.4; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const y = base - (clean[i] + noise[i] * sigma) * (base - top);
      i ? ctx.lineTo(X(i), y) : ctx.moveTo(X(i), y);
    }
    ctx.stroke();

    // labels: 12px mono, muted unless they carry the point
    Anim.label(ctx, th, `scans ${scans}`, x0, pad + 6, 'left', th.ink);
    Anim.label(ctx, th, 'S/N ∝ √N', x1, pad + 6, 'right');
  });
})();
