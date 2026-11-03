/* ==========================================================================
   ddnp-batteries-2025: dissolution DNP catches battery degradation products.
   A battery cracks open like an egg and a drop of its electrolyte falls into
   a sample cup. The cup goes down into the polariser (7.05 T) and freezes at
   1.6 K; microwaves hyperpolarise it while the coil round it gives RF pulses.
   The solvent box (always there, faint until it's used) heats from 298 K to
   ~430 K; its hot solvent melts the sample and pushes it out along the
   transfer line into the NMR magnet (14 T), whose coil gives one RF pulse.
   The ¹³C spectrum comes up with a high signal-to-noise ratio, and the sample
   goes back to grey as its hyperpolarisation is used up.
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const clamp = u => Math.max(0, Math.min(1, u));

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 18;
  const CRACK = [0.6, 1.0];   // a crack runs across the battery
  const OPEN = [1.0, 1.6];    // … its halves tip apart, like an egg
  const DRIP = [1.45, 2.1];   // a drop of electrolyte falls into the cup
  const GONE = [2.2, 2.7];    // the battery fades away
  const LOWER = [2.8, 3.8];   // the cup goes down into the polariser
  const FREEZE = [3.9, 4.6];  // … and freezes, at 1.6 K
  const MW_IN = [4.9, 5.4];   // microwaves come down to the sample
  const POL = [5.3, 6.6];     // … and hyperpolarise it (it turns orange)
  const RF = [5.4, 6.6];      // meanwhile the coil round the sample gives RF pulses, two a second
  const MW_OFF = [6.8, 7.2];  // the microwaves go off
  const FOCUS = [7.4, 10.6];  // the hot-solvent box (always there, faint) comes into view here, and fades back here
  const TEMP = [7.8, 8.6];    // its temperature reading sweeps from 298 K to ~430 K
  const HOT = [8.7, 9.2];     // … then hot solvent runs down the stick
  const MELT = [9.0, 9.4];    // … and melts the sample
  const OUT = [9.5, 11.3];    // the solution is pushed out, along the transfer line, into the NMR magnet
  const NMR_RF = [11.5, 11.8]; // the coil round the NMR tube gives an RF pulse …
  const DETECT = [12.0, 12.8]; // … and the NMR magnet records the spectrum
  const RELAX = DETECT;       // as the spectrum appears, the hyperpolarisation is used up: the sample goes back to grey
  const BACK = [16.4, 17.4];  // fade back to the start
  const STILL = 15.2;         // reduced-motion visitors see the whole journey, with the spectrum

  /* ---- the ¹³C spectrum: schematic electrolyte peaks, and some smaller ones ---- */
  const PPM_L = 175, PPM_R = 35, NS = 320, HW = 0.9;   // ppm range, points, half-width (ppm)
  const C13 = [[157.2, 0.85], [155.6, 0.7], [125.4, 0.16], [66.1, 1.0], [63.5, 0.22], [55.2, 0.9], [50.0, 0.14]];
  const SPEC = Float32Array.from({ length: NS }, (_, i) => {
    const ppm = PPM_L + ((PPM_R - PPM_L) * i) / (NS - 1);
    return C13.reduce((y, [c, a]) => y + a / (1 + ((ppm - c) / HW) ** 2), 0);
  });
  const SPEC_MAX = Math.max(...SPEC);
  const rand = Anim.seeded(25);
  const NOISE = Float32Array.from({ length: NS }, () => { let v = 0; for (let k = 0; k < 6; k++) v += rand(); return (v - 3) * Math.SQRT2; });

  /* ---- helpers ---- */
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  const segs = pts => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  // A point a fraction u of the way along a polyline.
  function along(pts, u) {
    const seg = segs(pts);
    let d = clamp(u) * seg.reduce((a, b) => a + b, 0);
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? Math.min(1, d / seg[i]) : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
      }
      d -= seg[i];
    }
    return pts[pts.length - 1];
  }
  // The polyline's points up to a fraction u of its length.
  function upTo(pts, u) {
    const seg = segs(pts), total = seg.reduce((a, b) => a + b, 0);
    let d = clamp(u) * total;
    const outPts = [pts[0]];
    for (let i = 0; i < seg.length; i++) {
      if (d >= seg[i]) { outPts.push(pts[i + 1]); d -= seg[i]; continue; }
      const f = seg[i] ? d / seg[i] : 0;
      outPts.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]);
      break;
    }
    return outPts;
  }
  function stroke(ctx, pts) {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  }

  // A cylindrical cell lying on its side, centred on (cx, cy), L long. `crack` (0 … 1) draws the
  // crack across its middle; `open` (0 … 1) tips the two halves apart about the top of the crack.
  const ZIG = [[0, 0], [-0.05, 0.22], [0.04, 0.45], [-0.04, 0.7], [0.03, 1]];   // (dx / L, fraction down)
  function battery(ctx, th, cx, cy, L, crack, open, alpha) {
    if (alpha <= 0.01) return;
    const H = L * 0.36, x0 = cx - L / 2, x1 = cx + L / 2, y0 = cy - H / 2, y1 = cy + H / 2;
    const zig = ZIG.map(([dx, f]) => [cx + dx * L, y0 + f * H]);
    const tilt = 0.42 * open, apart = L * 0.05 * open, pv = zig[0];
    ctx.globalAlpha = alpha; ctx.lineJoin = 'round';
    ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    for (const side of [-1, 1]) {
      ctx.fillStyle = th.green;                               // the casing has a colour of its own
      ctx.save();
      // each half swings its outer end up, so the crack opens at the bottom and the drop can fall out
      ctx.translate(pv[0] + side * apart, pv[1]); ctx.rotate(-side * tilt); ctx.translate(-pv[0], -pv[1]);
      ctx.beginPath();
      if (side < 0) {                                         // the negative end, with its wrapper edge
        ctx.moveTo(x0 + 3, y0); zig.forEach(p => ctx.lineTo(p[0], p[1]));
        ctx.lineTo(x0 + 3, y1); ctx.quadraticCurveTo(x0, y1, x0, y1 - 3); ctx.lineTo(x0, y0 + 3); ctx.quadraticCurveTo(x0, y0, x0 + 3, y0);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = th.surface; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0 + L * 0.1, y0 + 1); ctx.lineTo(x0 + L * 0.1, y1 - 1); ctx.stroke();
        ctx.strokeStyle = th.ink;
      } else {                                                // the positive end, with its cap and a +
        ctx.fillStyle = th.surface;                           // the metal cap
        ctx.fillRect(x1, cy - H * 0.2, L * 0.06, H * 0.4); ctx.strokeRect(x1, cy - H * 0.2, L * 0.06, H * 0.4);
        ctx.fillStyle = th.green;
        ctx.beginPath();
        zig.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.lineTo(x1 - 3, y1); ctx.quadraticCurveTo(x1, y1, x1, y1 - 3); ctx.lineTo(x1, y0 + 3); ctx.quadraticCurveTo(x1, y0, x1 - 3, y0);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        const pxp = x1 - L * 0.13, arm = Math.max(2, L * 0.045);
        ctx.strokeStyle = th.surface; ctx.lineWidth = 1.2; ctx.beginPath();
        ctx.moveTo(pxp - arm, cy); ctx.lineTo(pxp + arm, cy); ctx.moveTo(pxp, cy - arm); ctx.lineTo(pxp, cy + arm); ctx.stroke();
        ctx.strokeStyle = th.ink;
      }
      ctx.restore();
      ctx.lineWidth = 1.3;
    }
    if (crack > 0 && open <= 0) {                             // the crack running across, before it opens
      ctx.lineWidth = 1.2;
      stroke(ctx, upTo(zig, crack));
    }
    ctx.globalAlpha = 1;
  }

  // A small sample cup, centred on (x, y): `level` of it full (0 … 1), its contents muted when
  // just electrolyte and orange when hyperpolarised (pol), with ice marks while frozen.
  function cup(ctx, th, x, y, cw, ch, level, pol, ice, alpha) {
    if (alpha <= 0.01) return;
    const x0 = x - cw / 2, y0 = y - ch / 2, r = cw / 2;
    const shape = () => {
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + ch - r);
      ctx.arc(x, y0 + ch - r, r, Math.PI, 0, true); ctx.lineTo(x0 + cw, y0);
    };
    ctx.globalAlpha = alpha;
    if (level > 0) {
      ctx.save(); shape(); ctx.closePath(); ctx.clip();
      const top = y0 + ch * (1 - level * 0.85);
      ctx.fillStyle = th.muted; ctx.globalAlpha = alpha * (1 - pol); ctx.fillRect(x0, top, cw, ch);
      ctx.fillStyle = th.spec; ctx.globalAlpha = alpha * pol; ctx.fillRect(x0, top, cw, ch);
      if (ice > 0.01) {                                       // ice: a little crystal mark in the frozen sample
        ctx.globalAlpha = alpha * ice; ctx.strokeStyle = th.surface; ctx.lineWidth = 1;
        const cyy = (top + y0 + ch) / 2, k = Math.min(cw, ch) * 0.28;
        ctx.beginPath();
        for (const a of [0, Math.PI / 3, (2 * Math.PI) / 3]) { ctx.moveTo(x - k * Math.cos(a), cyy - k * Math.sin(a)); ctx.lineTo(x + k * Math.cos(a), cyy + k * Math.sin(a)); }
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = alpha; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
    shape(); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // An NMR tube, centred on (x, y), with its sample arriving as `fill` goes 0 → 1: orange while
  // it's hyperpolarised (`hot`), grey (as it started) once that has faded.
  function nmrTube(ctx, th, x, y, tw, tl, fill, hot) {
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.1;
    roundRect(ctx, x - tw / 2, y - tl / 2, tw, tl, tw / 2); ctx.fill(); ctx.stroke();
    if (fill > 0.01) {
      const liquid = () => { roundRect(ctx, x - tw / 2 + 1, y + tl * 0.05, tw - 2, tl * 0.45 - 1, (tw - 2) / 2); ctx.fill(); };
      ctx.globalAlpha = fill * (1 - hot); ctx.fillStyle = th.muted; liquid();
      ctx.globalAlpha = fill * hot; ctx.fillStyle = th.spec; liquid();
      ctx.globalAlpha = 1;
    }
  }

  // An RF coil: a vertical helix centred on (x, y), cw wide and hh tall, drawn faintly, with a red
  // pulse over it (0 … 1) and an "RF" label beside it (labelA, 0 … 1).
  function coil(ctx, th, x, y, cw, hh, pulse, labelA) {
    const top = y - hh / 2, bot = y + hh / 2, turns = 4;
    const helix = () => {
      ctx.beginPath();
      for (let i = 0; i <= 96; i++) {
        const u = i / 96, ph = 2 * Math.PI * turns * u;
        const X = x + (cw / 2) * Math.sin(ph), Y = top + (bot - top) * u + hh * 0.063 * Math.cos(ph);
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.stroke();
    };
    ctx.globalAlpha = 0.7; ctx.strokeStyle = th.muted; ctx.lineWidth = 1; helix();
    if (pulse > 0.01) { ctx.globalAlpha = pulse; ctx.strokeStyle = th.red; ctx.lineWidth = 1.6; helix(); }
    if (labelA > 0.01) { ctx.globalAlpha = labelA; Anim.label(ctx, th, 'RF', x + cw / 2 + 4, y, 'left', th.red); }
    ctx.globalAlpha = 1;
  }

  // A label on a magnet's body, right-aligned at x, on a patch of the body's colour so any lines
  // inside pass behind it.
  function fieldLabel(ctx, th, text, x, y) {
    ctx.font = `12px ${th.mono}`;
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = th.surface; ctx.fillRect(x - tw - 3, y - 7, tw + 6, 14);
    Anim.label(ctx, th, text, x, y, 'right', th.ink);
  }

  Anim.register('ddnp-batteries-2025', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE;
    const back = between(s, ...BACK), keep = 1 - back;
    const crack = between(s, ...CRACK), open = between(s, ...OPEN), gone = between(s, ...GONE);
    const drip = clamp((s - DRIP[0]) / (DRIP[1] - DRIP[0]));
    const lower = between(s, ...LOWER), frozen = between(s, ...FREEZE);
    const mwIn = between(s, ...MW_IN), pol = between(s, ...POL), mwOff = between(s, ...MW_OFF);
    const focus = between(s, FOCUS[0], FOCUS[0] + 0.5) * (1 - between(s, FOCUS[1], FOCUS[1] + 0.5));
    const hot = clamp((s - HOT[0]) / (HOT[1] - HOT[0])), melt = between(s, ...MELT), heat = between(s, ...TEMP);
    const out = between(s, ...OUT), detect = between(s, ...DETECT), relax = between(s, ...RELAX);

    /* ---- layout ---- */
    const yF = h - 24;                                        // the floor
    // the polariser: short and wide, on the left
    // (shaped like the NMR magnet's body, flat-bottomed with rounded shoulders, but sitting on discs)
    const pw = w * 0.26, px = Math.max(w * 0.21, 52);
    const discH = Math.max(3, h * 0.02), py1 = yF - discH;
    // above it sit the solvent box on its rod, the cup and (at first) the battery, so the body is as tall
    // as leaves room for those, up to 0.39 h
    const rodL = Math.max(10, h * 0.07), bxH = Math.max(9, h * 0.055), ch = Math.max(8, h * 0.035);
    const bL = Math.max(46, w * 0.15), bH = bL * 0.36, gapB = Math.max(8, h * 0.06);
    const highest = 12 + bH + gapB + ch + 1 + bxH + rodL;     // the highest the top of its bore tower can be
    const pbH = Math.min(h * 0.39, (py1 - highest) / 1.18), py0 = py1 - pbH;
    const pTurH = pbH * 0.3, pCap = Math.max(2, pbH * 0.04), pCoreW = pw * 0.12;
    const connTop = py0 - pTurH * 0.6;                        // the top of its central bore tower
    const insW = Math.max(6, pw * 0.09), sY = py1 - Math.max(pbH * 0.25, 22 + ch);   // the insert, and where the sample sits
    const cw = Math.max(5, insW - 3);
    // the hot-solvent box: always in place above the polariser, its stick down the bore to the sample
    const bxW = pw * 0.3;
    const boxTop = connTop - rodL - bxH, rodTop = boxTop + bxH, tip = sY - ch / 2 - 3;
    const wgX = px - pw * 0.22;                               // the microwave guide comes down here
    // the NMR magnet: tall, on the right
    const yTn = Math.max(30, h * 0.13);
    const bodyH = (yF - yTn) / 1.85, turretH = bodyH * 0.3;
    const bw = Math.min(bodyH / 1.13, w * 0.23), legW = bw * 0.2;
    const nx = w - Math.max(14, w * 0.05) - (bw / 2 + legW * 0.85 + 2);
    const my0 = yTn + turretH, my1 = my0 + bodyH, mcy = my0 + bodyH * 0.55;
    const coreTop = my0 - turretH * 0.6;
    const tl = Math.max(12, h * 0.065), tw = Math.max(3.5, w * 0.011);
    // the transfer line: up from the polariser, across, and down into the NMR magnet
    const lineY = yTn - 8;
    // it leaves from the top of the central bore tower, beside the solvent stick, and turns towards
    // the NMR magnet below the solvent box
    const qx = px + 3.5, qy = connTop;
    const Q = [[qx, qy], [qx, qy - rodL * 0.45], [qx + Math.max(8, w * 0.03), qy - rodL * 0.7], [nx - w * 0.03, lineY], [nx, lineY], [nx, coreTop]];
    // the cup waits on top of the solvent box, and the battery cracks open above it
    const cupStart = [px, boxTop - ch / 2 - 1];
    const bY = cupStart[1] - ch / 2 - gapB - bH / 2;
    // the spectrum, beside the NMR magnet
    const sx0 = px + pw / 2 + Math.max(14, w * 0.04), sx1 = nx - bw / 2 - legW * 0.85 - 10;
    const sBase = yF - h * 0.07, sTop = h * 0.52;

    ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    const box = (x, y, bwid, bhgt, r = 1) => { roundRect(ctx, x, y, bwid, bhgt, r); ctx.fill(); ctx.stroke(); };

    /* ---- the NMR magnet, as in remote-nmr-2026 ---- */
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
    {
      const fH = Math.max(2, bodyH * 0.025), plH = Math.max(3, bodyH * 0.04);
      const legX = bw / 2 + legW * 0.2, legIn = my0 + bodyH * 0.7, legOut = legIn + legW * 0.55;
      const colW = bw * 0.15, colEnd = yF - bodyH * 0.08;
      box(nx - colW / 2, my1, colW, colEnd - fH - my1);
      box(nx - colW * 0.8, colEnd - fH, colW * 1.6, fH);
      box(nx - bw / 2 - 1, my1 - plH * 0.3, bw + 2, plH);
      box(nx - bw / 2, my0, bw, bodyH, bw * 0.14);
      ctx.beginPath();
      for (const dy of [0.085, 0.11]) { ctx.moveTo(nx - bw / 2, my0 + bodyH * dy); ctx.lineTo(nx + bw / 2, my0 + bodyH * dy); }
      ctx.stroke();
      const capH = Math.max(2, bodyH * 0.035);
      for (const sgn of [-1, 1]) {
        const tX = nx + sgn * bw * 0.28, tW = bw * 0.13;
        box(tX - tW / 2, yTn + capH, tW, my0 - yTn - capH + 1);
        box(tX - tW * 0.8, yTn, tW * 1.6, capH);
      }
      const cW = bw * 0.12;
      box(nx - cW / 2, coreTop + capH, cW, my0 - coreTop - capH + 1);
      box(nx - cW * 0.8, coreTop, cW * 1.6, capH);
      const sleeveEnd = my1 + (yF - my1) * 0.3;
      for (const sgn of [-1, 1]) {
        const xin = nx + sgn * (legX - legW / 2), xout = nx + sgn * (legX + legW / 2);
        box(nx + sgn * legX - legW * 0.3, sleeveEnd - 1, legW * 0.6, yF - fH - sleeveEnd + 1);
        box(nx + sgn * legX - legW * 0.65, yF - fH, legW * 1.3, fH);
        ctx.beginPath();
        ctx.moveTo(xin, legIn); ctx.lineTo(xout, legOut); ctx.lineTo(xout, sleeveEnd); ctx.lineTo(xin, sleeveEnd); ctx.closePath();
        ctx.fill(); ctx.stroke();
      }
      ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);   // the bore
      ctx.beginPath(); ctx.moveTo(nx, coreTop); ctx.lineTo(nx, mcy - tl / 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    const arrived = clamp((out - 0.96) / 0.04) * keep;        // the sample reaches the NMR tube
    nmrTube(ctx, th, nx, mcy, tw, tl, arrived, 1 - relax);
    {                                                         // its RF coil: one pulse, then the spectrum
      const u = (s - NMR_RF[0]) / (NMR_RF[1] - NMR_RF[0]);
      const pulse = u > 0 && u < 1 ? Math.sin(Math.PI * u) ** 2 : 0;
      const shown = between(s, NMR_RF[0] - 0.2, NMR_RF[0]) * (1 - between(s, NMR_RF[1] + 0.2, NMR_RF[1] + 0.5)) * keep;
      coil(ctx, th, nx, mcy, tw + Math.max(5, bw * 0.06), tl * 1.1, pulse * keep, shown);
    }

    /* ---- the polariser ---- */
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
    for (const dx of [-0.34, 0, 0.34]) box(px + dx * pw - pw * 0.11, yF - discH, pw * 0.22, discH, discH / 2);   // the discs it sits on
    {                                                         // the body: flat bottom, rounded shoulders
      const x0 = px - pw / 2, x1 = px + pw / 2, r = pw * 0.18;
      ctx.beginPath();
      ctx.moveTo(x0, py1); ctx.lineTo(x0, py0 + r); ctx.arcTo(x0, py0, x0 + r, py0, r);
      ctx.lineTo(x1 - r, py0); ctx.arcTo(x1, py0, x1, py0 + r, r); ctx.lineTo(x1, py1); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.save(); ctx.clip();                                 // the flange, near the top, kept inside the curved outline
      ctx.beginPath();
      for (const dy of [0.1, 0.135]) { ctx.moveTo(x0, py0 + pbH * dy); ctx.lineTo(x1, py0 + pbH * dy); }
      ctx.stroke(); ctx.restore();
    }
    for (const sgn of [-1, 1]) {                              // two turrets on top
      const tX = px + sgn * pw * 0.36, tW = pw * 0.07;
      box(tX - tW / 2, py0 - pTurH + pCap, tW, pTurH - pCap + 1);
      box(tX - tW * 0.8, py0 - pTurH, tW * 1.6, pCap);
    }
    box(px - pCoreW / 2, connTop + pCap, pCoreW, py0 - connTop - pCap + 1);   // the central bore tower
    box(px - pCoreW * 0.8, connTop, pCoreW * 1.6, pCap);
    ctx.lineWidth = 1;                                        // the insert, down the middle to the sample
    ctx.beginPath();
    ctx.moveTo(px - insW / 2, py0); ctx.lineTo(px - insW / 2, sY + ch);
    ctx.moveTo(px + insW / 2, py0); ctx.lineTo(px + insW / 2, sY + ch);
    ctx.stroke();

    /* ---- the transfer line ---- */
    ctx.strokeStyle = th.ink; ctx.lineWidth = 2; stroke(ctx, Q);
    {
      const a = Q[1], b = Q[2], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];   // an arrow: this way to the NMR
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), k = Math.max(3, h * 0.014);
      ctx.strokeStyle = th.muted; ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(m[0] - k * Math.cos(ang - 0.6), m[1] - k * Math.sin(ang - 0.6)); ctx.lineTo(m[0], m[1]);
      ctx.lineTo(m[0] - k * Math.cos(ang + 0.6), m[1] - k * Math.sin(ang + 0.6));
      ctx.stroke();
    }

    /* ---- microwaves, along their own guide to the sample, which fades in and out with them ---- */
    const mwOn = between(s, MW_IN[0] - 0.3, MW_IN[0]) * (1 - mwOff) * keep;   // the guide
    const mwA = mwIn * (1 - mwOff) * keep;                    // the waves in it
    const guide = [[wgX, boxTop - 2], [wgX, py0 + pbH * 0.35], [px - insW / 2 - 2, sY]];
    if (mwOn > 0.01) {
      ctx.globalAlpha = mwOn; ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
      stroke(ctx, guide);
      ctx.globalAlpha = 1;
    }
    if (mwA > 0.01) {
      const path = guide;
      const seg = segs(path), total = seg[0] + seg[1], showLen = total * mwIn;
      const amp = Math.max(2.5, w * 0.008), lam = Math.max(8, w * 0.025);
      ctx.globalAlpha = mwA; ctx.strokeStyle = th.fid; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let d = 0, first = true; d <= showLen; d += 1, first = false) {
        const i = d <= seg[0] ? 0 : 1, f = i ? (d - seg[0]) / seg[1] : d / seg[0];
        const p0 = path[i], p1 = path[i + 1], dx = (p1[0] - p0[0]) / seg[i], dy = (p1[1] - p0[1]) / seg[i];
        const off = amp * Math.sin(2 * Math.PI * (d / lam - 0.9 * s));
        const X = p0[0] + (p1[0] - p0[0]) * f - dy * off, Y = p0[1] + (p1[1] - p0[1]) * f + dx * off;
        first ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
      }
      ctx.stroke();
      ctx.font = `12px ${th.mono}`;
      // the label sits above the solvent box; use the long word only if it stays clear of the transfer line
      const ly = boxTop - 13, a = Q[2], b = Q[3];
      const lineX = a[0] + (b[0] - a[0]) * clamp((a[1] - (ly + 6)) / (a[1] - b[1]));   // where the line is, at the label's foot
      const lx = Math.max(12, wgX - 6), word = lx + ctx.measureText('microwaves').width + 4 <= lineX ? 'microwaves' : 'μw';
      Anim.label(ctx, th, word, lx, ly, 'left', th.fid);
      ctx.globalAlpha = 1;
    }

    /* ---- the hot-solvent box and its stick: always there, faint, and in full view while in use ---- */
    {
      const f = focus * keep, a = 0.3 + 0.7 * f;
      ctx.globalAlpha = a;
      ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(px - 1.5, rodTop); ctx.lineTo(px - 1.5, tip); ctx.moveTo(px + 1.5, rodTop); ctx.lineTo(px + 1.5, tip); ctx.stroke();
      ctx.fillStyle = th.surface; box(px - bxW / 2, boxTop, bxW, bxH, 2);
      // hot solvent runs down the stick to the sample
      if (hot > 0 && out < 0.3) {
        const front = rodTop + (tip - rodTop) * Math.min(1, hot * 1.4);
        ctx.globalAlpha = f * (1 - clamp(out * 4)); ctx.strokeStyle = th.soft; ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]); ctx.lineDashOffset = -s * 40;
        ctx.beginPath(); ctx.moveTo(px, rodTop); ctx.lineTo(px, front); ctx.stroke();
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
      }
      if (f > 0.01) {
        ctx.globalAlpha = f;
        Anim.label(ctx, th, 'hot solvent', px, boxTop - 23, 'center');
        const T = Math.round(298 + (430 - 298) * heat);
        Anim.label(ctx, th, heat >= 1 ? '~430 K' : `${T} K`, px, boxTop - 9, 'center', th.ink);
      }
      ctx.globalAlpha = 1;
    }

    /* ---- the sample: in its cup, then out along the line as a hyperpolarised solution ---- */
    const level = drip >= 1 ? 1 : 0;                          // the drop lands at the end of its fall
    const leaving = clamp(out * 6);                           // it leaves the cup as it's pushed out
    const cupY = cupStart[1] + (sY - cupStart[1]) * lower;
    cup(ctx, th, px, cupY, cw, ch, level * (1 - leaving), pol * keep, frozen * (1 - melt), keep);
    if (back > 0) cup(ctx, th, cupStart[0], cupStart[1], cw, ch, 0, 0, 0, back);

    /* ---- the RF coil round the sample space: faint, and pulsing red while the sample polarises ---- */
    {
      // each pulse rises and falls smoothly over a quarter of a second, every half second
      const inRF = s >= RF[0] && s < RF[1], ph = (s - RF[0]) % 0.5;
      const pulse = inRF && ph < 0.25 ? Math.sin((Math.PI * ph) / 0.25) ** 2 : 0;
      const shown = between(s, RF[0] - 0.2, RF[0]) * (1 - between(s, RF[1], RF[1] + 0.3)) * keep;
      coil(ctx, th, px, sY, insW + Math.max(5, pw * 0.05), ch * 1.9, pulse * keep, shown);
    }
    // the solution's route: up the insert, along the transfer line, down into the NMR tube
    const route = [[px, sY], [px, qy], ...Q, [nx, mcy - tl * 0.2]];   // up the insert, then along the line
    if (out > 0 && keep > 0) {
      // the transfer line lights up behind it (from where it leaves the polariser), and stays lit
      // (only as far as the top of the NMR magnet, so the sample's own colour shows in the tube)
      const segLen = segs(route), total = segLen.reduce((a, b) => a + b, 0);
      const atCore = segLen.slice(0, route.length - 2).reduce((a, b) => a + b, 0) / total;
      const lit = upTo(route, Math.min(out, atCore)).slice(2);
      if (lit.length > 1) { ctx.globalAlpha = 0.85 * keep; ctx.strokeStyle = th.spec; ctx.lineWidth = 2; stroke(ctx, lit); }
      if (out < 1) {
        const [bx, by] = along(route, out), r = Math.max(2.5, w * 0.009);
        ctx.globalAlpha = keep; ctx.fillStyle = th.spec;
        ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* ---- the battery cracks open, and a drop falls into the cup ---- */
    battery(ctx, th, px, bY, bL, crack, open, (1 - gone) * keep);
    if (back > 0) battery(ctx, th, px, bY, bL, 0, 0, back);
    if (drip > 0 && drip < 1) {
      const y0 = bY + bH / 2 + 2, y1 = cupStart[1];
      const y = y0 + (y1 - y0) * drip * drip, r = Math.max(2.2, w * 0.007);   // falling, faster as it goes
      ctx.fillStyle = th.muted; ctx.strokeStyle = th.ink; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, y - r * 2.2); ctx.quadraticCurveTo(px + r, y - r, px + r, y);
      ctx.arc(px, y, r, 0, Math.PI); ctx.quadraticCurveTo(px - r, y - r, px, y - r * 2.2);
      ctx.fill(); ctx.stroke();
    }

    /* ---- the spectrum, recorded by the NMR magnet ---- */
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx0, Math.round(sBase) + 0.5); ctx.lineTo(sx1, Math.round(sBase) + 0.5); ctx.stroke();
    const amp = detect * keep;
    if (amp > 0) {
      ctx.strokeStyle = th.spec; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i < NS; i++) {
        const X = sx0 + (i / (NS - 1)) * (sx1 - sx0), Y = sBase - amp * (SPEC[i] / SPEC_MAX) * (sBase - sTop) - 0.6 * NOISE[i];
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.stroke();
    }
    Anim.label(ctx, th, '¹³C', sx1, sBase + 11, 'right');

    /* ---- labels ---- */
    Anim.label(ctx, th, 'polariser', px, yF + 12, 'center');
    Anim.label(ctx, th, 'NMR', nx, yF + 12, 'center');
    // 1.6 K inside the polariser, where it fits (on phones it's left out)
    const cold = frozen * keep;
    if (cold > 0.01) {
      ctx.font = `12px ${th.mono}`;
      const lx = px + insW / 2 + 6, ly = py0 + pbH * 0.52;
      if (lx + Anim.measure(ctx, th, '1.6 K') <= px + pw / 2 - 4) {
        ctx.globalAlpha = cold; Anim.label(ctx, th, '1.6 K', lx, ly, 'left', th.ink); ctx.globalAlpha = 1;
      }
    }
    // the magnets' field strengths, on their bodies
    fieldLabel(ctx, th, '7.05 T', px + pw / 2 - 5, py1 - 9);
    fieldLabel(ctx, th, '14 T', nx + bw / 2 - legW * 0.3 - 5, my1 - 9);   // just inside the right leg's sleeve
  }, { still: STILL, loop: CYCLE });
})();
