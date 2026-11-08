/* ==========================================================================
   βPFO stabilization: a dilution challenge, exchange, and two experimental answers.
   Figures 6 and 7, Serra-Batiste et al., Front. Mol. Biosci. 5:38 (2018).
   Structures, contours and blot bands are illustrative redrawings.
   ========================================================================== */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const clamp = u => Math.max(0, Math.min(1, u));
  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const span = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;

  /* ---- the pieces, drawn as in the paper's Figs 2 and 8: βPFO a β-barrel (strands as arrows, its flexible
     N-termini above), a DPC micelle (headgroups and curved tails), NAPol (zigzag chains), Aβ42 monomers (squiggles) ---- */
  const rnd = Anim.seeded(2018);
  const DPC = Array.from({ length: 30 }, (_, i) => ({ a: (i / 30) * TAU + rnd() * 0.035, dx: rnd() * 2 - 1, dy: rnd() * 2 - 1, spin: rnd() * 2 - 1 }));
  const MONO = [[-1.15, -0.25], [-0.5, 0.6], [0.45, -0.55], [1.1, 0.35]].map(([x, y]) => ({ x, y, ph: rnd() * TAU }));

  /* ---- Met35's ¹³CH₃ in the ¹H–¹³C HMQC (Fig. 6, read off it), [¹H, ¹³C, half-widths]: βPFO in DPC (D), the same
     in NAPol (E: retained oligomer peaks, broadened; plus a sharp free-monomer peak).
     The random-coil reference comes from panel A ---- */
  const H0 = 2.16, H1 = 1.8, C0 = 14.35, C1 = 15.15;
  const H_TICKS = [2.1, 2.0, 1.9], C_TICKS = [14.6, 14.8, 15.0];
  const PEAKS = {
    dpc: [[1.844, 14.616, 0.014, 0.055], [2.032, 14.885, 0.016, 0.05]],
    napol: [[1.855, 14.658, 0.038, 0.16], [2.034, 14.933, 0.048, 0.085], [2.111, 14.464, 0.006, 0.033]]
  };
  const REFS = [['monomer', 2.111, 14.464]];

  /* ---- the gel (Fig. 7, western blot, not boiled, after 32-fold dilution): βPFO runs at about 16 kDa, monomer at
     about 6 kDa; diluted from DPC it's all monomer, from NAPol all βPFO but 5.3% ---- */
  const KDA = [15, 10, 5], K_TOP = 25, K_BOT = 4;

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 32;
  const SC0 = [0, 0.5, 5.5, 6.0];
  const SC1 = [5.6, 6.1, 10.6, 11.1], WRAP = [6.4, 7.9], LEAVE = [8.0, 9.5];
  const SC2 = [10.7, 11.2, 19.6, 20.1], SPEC_DPC = [11.7, 12.8], SPEC_NAP = [13.6, 14.9];
  // The blot appears before its structural interpretation: bands supply the answer.
  const SC3 = [19.7, 20.2, 31.4, 32], SCATTER = [21.3, 23.0], GEL = [23.0, 24.1], SPLIT = [24.1, 25.6];
  const STILL = 29;

  function words(ctx, th, parts, x, y) {        // a label in several colours: [[text, colour], …]
    for (const [text, colour] of parts) { Anim.label(ctx, th, text, x, y, 'left', colour); x += Anim.measure(ctx, th, text); }
  }
  const width = (ctx, th, parts) => parts.reduce((a, [text]) => a + Anim.measure(ctx, th, text), 0);
  const fit = (ctx, th, options, room) => options.find(o => width(ctx, th, o) <= room) || options[options.length - 1];
  const centred = (ctx, th, parts, x, y) => words(ctx, th, parts, x - width(ctx, th, parts) / 2, y);

  // Paper-style schematic: tilted antiparallel ribbons, hairpin turns and
  // exposed termini. Pale rear strands sit behind the dark front hairpins.
  function barrel(ctx, th, cx, cy, W, A) {
    const H = W * 1.15, top = cy - H / 2, bot = cy + H / 2;
    const P = (x, y) => [cx + W * (x + 0.19 * y), cy + W * y];
    const ribbon = (x, y0, y1, col) => {
      const dir = Math.sign(y1 - y0), neck = y1 - dir * 0.14;
      const pts = [[x - .026,y0],[x + .026,y0],[x + .026,neck],
        [x + .065,neck],[x,y1],[x - .065,neck],[x - .026,neck]];
      ctx.fillStyle = col; ctx.beginPath();
      pts.forEach(([px,py],i) => { const q=P(px,py); i ? ctx.lineTo(...q) : ctx.moveTo(...q); });
      ctx.closePath(); ctx.fill();
    };
    const curve = (pts, col, lw) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      ctx.moveTo(...P(...pts[0]));
      for (let i=1;i<pts.length;i+=3) ctx.bezierCurveTo(...P(...pts[i]),...P(...pts[i+1]),...P(...pts[i+2]));
      ctx.stroke();
    };
    ctx.globalAlpha = A; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pale = mix(th.bg, th.ink, .30), grey = mix(th.bg, th.ink, .54);
    for (let k=0;k<3;k++) {
      const x=-.35+k*.30;
      curve([[x,-.48],[x-.12,-.72],[x+.08,-.87],[x,-1.02]],pale,W*.028);
      ribbon(x,-.48,.48,pale); ribbon(x+.11,.48,-.48,pale);
      curve([[x,.48],[x+.02,.79],[x+.22,.79],[x+.11,.48]],pale,W*.030);
    }
    // A light rim communicates the barrel opening without a heavy cylinder outline.
    ctx.strokeStyle = grey; ctx.lineWidth = Math.max(1,W*.022);
    ctx.beginPath(); ctx.ellipse(cx-W*.10,top+W*.025,W*.51,W*.13,0,Math.PI,TAU); ctx.stroke();
    for (let k=0;k<4;k++) {
      const x=-.43+k*.255, shade=k===3 ? grey : th.ink;
      ribbon(x,.48,-.48,shade);
      ribbon(x+.105,-.48,.48,k===3 ? pale : grey);
      curve([[x,.48],[x+.025,.79],[x+.23,.78],[x+.105,.48]],shade,Math.max(1.6,W*.030));
      // Each hairpin continues into an exposed, irregular terminal segment.
      curve([[x,-.48],[x-.02,-.65],[x+.16,-.69],[x+.02,-.83],
        [x-.20,-1.03],[x+.02,-1.03],[x+.22,-.96]],shade,Math.max(1.6,W*.030));
    }
    ctx.strokeStyle = grey; ctx.lineWidth = Math.max(1,W*.022);
    ctx.beginPath(); ctx.ellipse(cx-W*.10,top+W*.025,W*.51,W*.13,0,0,Math.PI); ctx.stroke();
    return { H, top, bot };
  }

  // the barrel coming apart into Aβ42 monomers (u, 0–1), which then drift
  function monomers(ctx, th, cx, cy, W, s, u, A) {
    if (u <= 0) return;
    const H = W * 1.15, L = H * 0.7;
    ctx.strokeStyle = th.ink; ctx.lineWidth = Math.max(1.4, W * 0.05); ctx.lineCap = 'round';
    MONO.forEach((m, k) => {
      const x = cx + lerp((k - 1.5) * W * 0.3, m.x * W + Math.sin(s * 0.6 + m.ph) * W * 0.05, u);
      const y = cy + lerp(0, m.y * W + Math.cos(s * 0.5 + m.ph) * W * 0.05, u);
      ctx.globalAlpha = A * u;
      ctx.beginPath();
      for (let i = 0; i <= 18; i++) { const v = i / 18 - 0.5, px = x + Math.sin(v * TAU * 1.3 + m.ph) * L * 0.14 * u, py = y + v * L * lerp(1, 0.8, u); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    });
  }

  // A single detergent envelope around the hydrophobic middle. Its exposed
  // sides show curved DPC tails and open headgroups, as in the paper schematic.
  function micelle(ctx, th, cx, cy, W, A, scatter) {
    const col = th.green || th.fid, my = cy + W*.02;
    ctx.globalAlpha = A * (1-scatter);
    ctx.fillStyle = mix(th.bg,col,.045);
    ctx.beginPath(); ctx.ellipse(cx,my,W*.87,W*.46,0,0,TAU); ctx.fill();
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.1,W*.022);
    DPC.forEach((m,i) => {
      // One continuous envelope; the barrel obscures its central front/back lipids.
      const side=i<15 ? -1 : 1, j=i%15;
      const a=-1.16+j/14*2.32;
      const vx=side*Math.cos(a), vy=Math.sin(a);
      let hx=cx+vx*W*.87, hy=my+vy*W*.46;
      const dx=(vx*.8+m.dx*.35)*W*.65*scatter;
      const dy=(vy*.8+m.dy*.35)*W*.5*scatter;
      hx+=dx; hy+=dy;
      const tx=cx+side*W*.45+dx, ty=my+vy*W*.25+dy;
      ctx.globalAlpha=A*(1-.5*scatter); ctx.strokeStyle=col;
      ctx.beginPath(); ctx.moveTo(hx,hy);
      ctx.bezierCurveTo(hx-side*W*.13,hy+W*.055*Math.sin(i*2.3),
        tx+side*W*.13,ty-W*.05*Math.cos(i),tx,ty); ctx.stroke();
      ctx.fillStyle=th.bg; ctx.beginPath();
      ctx.arc(hx,hy,Math.max(1.7,W*.032),0,TAU); ctx.fill(); ctx.stroke();
    });
  }

  // NAPol: zigzag chains along the barrel's middle, either side; on (0–1) brings them in from outside
  function napol(ctx, th, cx, cy, W, A, on) {
    if (on <= 0) return;
    const H = W * 1.15, len = W * 0.55, amp = W * 0.055;
    ctx.strokeStyle = th.spec; ctx.lineWidth = Math.max(1.1, W * 0.024); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.globalAlpha = A * Math.min(1, on * 1.5);
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
      const y = cy + (k - 1.5) * H * 0.14 + H * 0.06, x0 = cx + side * (W * 0.4 + (1 - on) * W * 0.9);
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const px = x0 + side * (i / 8) * len, py = y + (i % 2 ? amp : -amp) * (k % 2 ? 1 : -1); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
  }

  /* ---- 0. the picture establishes the practical question ---- */
  function background(ctx, w, h, s, th, A, pad) {
    const W = Math.min(w * 0.22, (h - 2 * pad - 80) / 1.9);
    const cy = h * 0.54, threat = between(s, 1.5, 3.5);
    micelle(ctx, th, w / 2, cy, W, A, threat * 0.65);
    barrel(ctx, th, w / 2, cy, W, A);
    ctx.globalAlpha = A;
    centred(ctx, th, [['Aβ42 oligomer ', th.ink], ['· βPFO', th.soft]], w / 2, h - pad - 27);
    const note = fit(ctx, th, [
      [['Dilution disperses the ', th.soft], ['DPC', th.fid], [' detergent belt', th.soft]],
      [['Dilution disperses ', th.soft], ['DPC', th.fid]]
    ], w - 2 * pad);
    ctx.globalAlpha = A * threat;
    centred(ctx, th, note, w / 2, h - pad - 7);
    ctx.globalAlpha = 1;
  }

  /* ---- 1. the swap: NAPol wraps the barrel, then the DPC is taken away (with Bio-Beads) ---- */
  function swap(ctx, w, h, s, th, A, pad) {
    const W = Math.min(w * 0.22, (h - 2 * pad - 50) / 1.75), cx = w / 2, cy = pad + 30 + (h - 2 * pad - 50) * 0.58;
    const wrap = between(s, WRAP[0], WRAP[1]), leave = between(s, LEAVE[0], LEAVE[1]);
    napol(ctx, th, cx, cy, W, A, wrap);
    micelle(ctx, th, cx, cy, W, A * (1 - leave), leave * 0.8);
    barrel(ctx, th, cx, cy, W, A);
    const y = h - pad - 8;
    const swapLabel = clamp(leave * 2 - 0.5);       // one label hands over to the next, not both at once
    ctx.globalAlpha = A * clamp(1 - swapLabel * 2); centred(ctx, th, [['βPFO', th.ink], [' in ', th.soft], ['DPC', th.fid], [wrap > 0.5 ? ' + NAPol' : '', th.spec]], cx, y);
    ctx.globalAlpha = A * clamp(swapLabel * 2 - 1); centred(ctx, th, [['βPFO', th.ink], [' in ', th.soft], ['NAPol', th.spec]], cx, y);
    ctx.globalAlpha = 1;
  }

  /* ---- 2. is its structure the same? Met35's methyl, ¹³C-labelled, reports on it: in the HMQC, βPFO in DPC gives
     two peaks; in NAPol it gives the same two ---- */
  function fingerprint(ctx, w, h, s, th, A, pad) {
    const top = pad + 26, bot = h - pad - 34;
    // left: βPFO in NAPol, its Met35s marked
    const W = Math.min(w * 0.17, (bot - top - 20) / 1.75), cx = pad + Math.max(W * 1.1, w * 0.2), cy = top + (bot - top) * 0.55;
    napol(ctx, th, cx, cy, W, A, 1);
    const g = barrel(ctx, th, cx, cy, W, A);
    ctx.globalAlpha = A; ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
    for (let k = 0; k < 4; k++) { const t = (k + 0.5) * Math.PI / 4, x = cx + (W / 2) * Math.cos(t) * 0.94, y = cy + g.H * 0.16 + W * 0.15 * Math.sin(t); ctx.beginPath(); ctx.arc(x, y, Math.max(2, W * 0.045), 0, TAU); ctx.fill(); ctx.stroke(); }
    centred(ctx, th, [['Met35 ', th.soft], ['¹³CH₃', th.ink]], cx, bot + 4);

    // right: the HMQC
    const nW = Anim.measure(ctx, th, '15.0') + 6;
    const left = Math.max(cx + W * 1.25, w * 0.44), right = w - pad - nW;
    // Reduce both plot dimensions to 85%, keeping the panel centred in its space.
    const insetX = (right - left) * 0.075, insetY = (bot - top - 14) * 0.075;
    const x0 = left + insetX, x1 = right - insetX, y0 = top + 14 + insetY, y1 = bot - insetY;
    const X = hh => x0 + ((H0 - hh) / (H0 - H1)) * (x1 - x0), Y = c => y0 + ((c - C0) / (C1 - C0)) * (y1 - y0);
    ctx.globalAlpha = A;
    words(ctx, th, fit(ctx, th, [[['¹H–¹³C HMQC: ', th.soft], ['DPC', th.fid], [' vs ', th.soft], ['NAPol', th.spec]], [['DPC', th.fid], [' vs ', th.soft], ['NAPol', th.spec]]], w - pad - x0), x0, y0 - 10);
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1; ctx.strokeRect(Math.round(x0) + 0.5, Math.round(y0) + 0.5, Math.round(x1 - x0), Math.round(y1 - y0));
    ctx.strokeStyle = th.muted; ctx.beginPath();
    for (const hh of H_TICKS) { const x = Math.round(X(hh)) + 0.5; ctx.moveTo(x, Math.round(y1) + 0.5); ctx.lineTo(x, Math.round(y1) - 3); }
    for (const c of C_TICKS) { const y = Math.round(Y(c)) + 0.5, x = Math.round(x1) + 0.5; ctx.moveTo(x, y); ctx.lineTo(x - 3.5, y); }
    ctx.stroke();
    const cStep = Y(C_TICKS[1]) - Y(C_TICKS[0]) < 13 ? 2 : 1;
    C_TICKS.forEach((c, i) => { if (i % cStep === 0) Anim.label(ctx, th, c.toFixed(1), x1 + 5, Y(c), 'left'); });
    const fy = y1 + 12;
    Anim.label(ctx, th, '¹H', x0, fy, 'left', th.soft);
    const hFree = x0 + Anim.measure(ctx, th, '¹H') + 6;
    for (const hh of H_TICKS) { const lab = hh.toFixed(1); if (X(hh) - Anim.measure(ctx, th, lab) / 2 > hFree) Anim.label(ctx, th, lab, X(hh), fy, 'center'); }
    Anim.label(ctx, th, '¹³C', x1 + 5, fy, 'left', th.soft);
    // The extra sharp NAPol peak reports residual monomer (Fig. 6A,E).
    const ref = between(s, SPEC_NAP[1], SPEC_NAP[1] + 0.6);
    if (ref > 0 && x1 - x0 > 95) {
      ctx.globalAlpha = A * ref * 0.9; ctx.strokeStyle = th.muted; ctx.setLineDash([2, 2]); ctx.lineWidth = 1;
      for (const [lab, hh, c] of REFS) { ctx.beginPath(); ctx.arc(X(hh), Y(c), 4, 0, TAU); ctx.stroke(); Anim.label(ctx, th, lab, X(hh) + 8, Y(c), 'left'); }
      ctx.setLineDash([]);
    }
    // the peaks, as contours
    const contours = (list, col, a) => {
      if (a <= 0) return;
      ctx.globalAlpha = A * a; ctx.strokeStyle = col; ctx.lineWidth = 1.1;
      for (const [hh, c, rh, rc] of list) {
        const ex = (rh / (H0 - H1)) * (x1 - x0), ey = (rc / (C1 - C0)) * (y1 - y0);
        for (const f of [1, 0.68, 0.38]) { ctx.beginPath(); ctx.ellipse(X(hh), Y(c), Math.max(1.5, ex * f * (0.6 + 0.4 * a)), Math.max(1.5, ey * f * (0.6 + 0.4 * a)), 0, 0, TAU); ctx.stroke(); }
      }
    };
    contours(PEAKS.dpc, th.fid, between(s, SPEC_DPC[0], SPEC_DPC[1]));
    contours(PEAKS.napol, th.spec, between(s, SPEC_NAP[0], SPEC_NAP[1]));
    const answer = between(s, 15.2, 16.0);
    ctx.globalAlpha = A * answer;
    const note = fit(ctx, th, [
      [['Retained peak positions support a preserved structural fingerprint', th.ink]],
      [['NMR: structural fingerprint retained', th.ink]],
      [['NMR fingerprint retained', th.ink]]
    ], w - 2 * pad);
    words(ctx, th, note, pad, h - pad - 5);
    ctx.globalAlpha = 1;
  }

  /* ---- 3. the test: both diluted 32-fold in buffer. In DPC the micelles disperse and βPFO falls apart into
     monomers; in NAPol it holds. The blot precedes the structural interpretation (Fig. 7) ---- */
  function dilution(ctx, w, h, s, th, A, pad) {
    const scatter = between(s, SCATTER[0], SCATTER[1]), split = between(s, SPLIT[0], SPLIT[1]), gel = between(s, GEL[0], GEL[1]);
    const phone = w < 350;
    const gTop = phone ? h - pad : h * 0.65, gBot = h - pad - 29;
    // Use the space freed by the omitted blot, preserving the desktop layout.
    const W = phone
      ? Math.min(w * 0.17, (h - 2 * pad - 44) / 2.0)
      : Math.min(w * 0.15, (gTop - pad - 52) / 1.75);
    const cy = phone ? (pad + 42 + h - pad) / 2 + W * 0.12
      : pad + 40 + (gTop - pad - 52) * 0.56;
    const xs = phone ? [w * 0.27, w * 0.74] : [w * 0.33, w * 0.76];
    // labels
    ctx.globalAlpha = A;
    centred(ctx, th, [['in ', th.soft], ['DPC', th.fid]], xs[0], pad + 26);
    centred(ctx, th, [['in ', th.soft], ['NAPol', th.spec]], xs[1], pad + 26);
    // DPC: disperses; βPFO comes apart (kept to its own half, above the gel)
    ctx.save(); ctx.beginPath(); ctx.rect(pad, pad + 34, w / 2 + W * 0.2 - pad, gTop - 8 - (pad + 34)); ctx.clip();
    micelle(ctx, th, xs[0], cy, W, A, scatter);
    barrel(ctx, th, xs[0], cy, W, A * (1 - split));
    monomers(ctx, th, xs[0], cy, W, s, split, A);
    ctx.restore();
    // NAPol: holds
    napol(ctx, th, xs[1], cy, W, A, 1);
    barrel(ctx, th, xs[1], cy, W, A);
    // Phone previews omit the blot, including its axis and explanatory label.
    if (w < 350) { ctx.globalAlpha = 1; return; }
    // the gel: a ladder, then one lane under each
    const K = k => gTop + ((Math.log(K_TOP) - Math.log(k)) / (Math.log(K_TOP) - Math.log(K_BOT))) * (gBot - gTop);
    const lane = W * 1.3, lx0 = pad + Anim.measure(ctx, th, '15') + 10;
    ctx.globalAlpha = A; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.strokeRect(Math.round(lx0) + 0.5, Math.round(gTop) + 0.5, Math.round(w - pad - lx0), Math.round(gBot - gTop));
    ctx.strokeStyle = th.muted; ctx.beginPath();
    for (const k of KDA) { const y = Math.round(K(k)) + 0.5; ctx.moveTo(lx0, y); ctx.lineTo(lx0 + 4, y); }
    ctx.stroke();
    const kStep = K(10) - K(15) < 13 ? 2 : 1;
    KDA.forEach((k, i) => { if (i % kStep === 0) Anim.label(ctx, th, String(k), lx0 - 4, K(k), 'right'); });
    if (gTop - (pad + 26) > 0 && w >= 300) Anim.label(ctx, th, 'kDa', lx0 - 4, gTop + (w <= 450 ? 3 : 8), 'right');
    const band = (x, k, a) => {
      if (a <= 0) return;
      ctx.globalAlpha = A * a * gel; ctx.fillStyle = th.ink;
      const bh = Math.max(3, (gBot - gTop) * 0.07), y = K(k);
      ctx.beginPath(); ctx.ellipse(x, y, lane / 2, bh / 2, 0, 0, TAU); ctx.fill();
    };
    band(xs[0], 6, 0.85);                        // DPC, diluted: monomer
    band(xs[1], 16, 0.85); band(xs[1], 6, 0.12); // NAPol, diluted: βPFO, and 5.3% monomer
    if (gel > 0) {
      ctx.globalAlpha = A * gel;
      Anim.label(ctx, th, 'monomer', xs[0] + lane / 2 + 6, K(6), 'left');
      Anim.label(ctx, th, 'βPFO', xs[1] - lane / 2 - 6, K(16), 'right', th.ink);
    }
    ctx.globalAlpha = A * between(s, 25.6, 26.2);
    const result = fit(ctx, th, [
      [['Blot: oligomer retained in NAPol; a small monomer fraction remains', th.soft]],
      [['Blot: NAPol retains the oligomer', th.soft]],
      [['NAPol retains the oligomer', th.soft]]
    ], w - 2 * pad);
    words(ctx, th, result, pad, h - pad - 6);
    ctx.globalAlpha = 1;
  }

  /* ---- the captions: [from, to, long, short] ---- */
  const CAPTIONS = th => [
    [0, 2.5, [['Biological tests require dilution', th.soft]], [['Tests require dilution', th.soft]]],
    [2.5, 5.6, [['How can we keep the oligomer intact?', th.ink]], [['How can it stay intact?', th.ink]]],
    [5.6, 8.0, [['Exchange detergent for a nonionic amphipol', th.soft]], [['Try a nonionic amphipol', th.soft]]],
    [8.0, 10.7, [['Remove ', th.soft], ['DPC', th.fid], ['; retain ', th.soft], ['NAPol', th.spec]], [['DPC', th.fid], [' → ', th.soft], ['NAPol', th.spec]]],
    [10.7, 15.2, [['Did the exchange preserve the oligomer?', th.ink]], [['Oligomer preserved?', th.ink]]],
    [15.2, 19.7, [['Compare Met35’s NMR fingerprint', th.soft]], [['Met35’s NMR fingerprint', th.soft]]],
    [19.7, 23.0, [['Does it survive 32-fold dilution?', th.ink]], [['Survive 32-fold dilution?', th.ink]]],
    [23.0, 27.5, [['32-fold dilution into detergent-free buffer', th.soft]], [['32-fold · detergent-free buffer', th.soft]]],
    [27.5, 99, [['A stable preparation for biological testing', th.ink]], [['Stable for biological testing', th.ink]]]
  ];

  Anim.register('abeta-oligomer-2018', function (ctx, w, h, t, th) {
    th = { ...th, fid: th.green || th.fid }; // DPC green throughout, matching the paper.
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE;
    const pad = Math.max(12, Math.round(w * 0.034));
    const all = between(s, 0, 0.6) * (1 - between(s, CYCLE - 0.6, CYCLE));
    for (const [a, b, long, short] of CAPTIONS(th)) {
      const v = between(s, a - 0.25, a + 0.25) * (1 - between(s, b - 0.25, b + 0.25)) * all;
      if (v > 0) { ctx.globalAlpha = v; words(ctx, th, fit(ctx, th, [long, short], w - 2 * pad), pad, pad + 6); }
    }
    for (const [when, draw] of [[SC0, background], [SC1, swap], [SC2, fingerprint], [SC3, dilution]]) {
      const a = span(s, when);
      if (a > 0) draw(ctx, w, h, s, th, a, pad);
    }
    ctx.globalAlpha = 1;
  }, { loop: CYCLE, still: STILL });

  // colours: mix two of the theme's colours (u = 0 gives a, 1 gives b)
  const cache = {};
  function rgb(c) {
    if (cache[c]) return cache[c];
    let v = [128, 128, 128], m;
    if ((m = /^#([0-9a-f]{3})$/i.exec(c))) v = [...m[1]].map(x => parseInt(x + x, 16));
    else if ((m = /^#([0-9a-f]{6})$/i.exec(c))) v = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
    else if ((m = /rgba?\(([^)]+)\)/.exec(c))) v = m[1].split(',').slice(0, 3).map(Number);
    return (cache[c] = v);
  }
  function mix(a, b, u) { const p = rgb(a), q = rgb(b); return `rgb(${[0, 1, 2].map(i => Math.round(p[i] + (q[i] - p[i]) * u)).join(',')})`; }
})();
