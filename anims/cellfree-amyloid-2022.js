/* ==========================================================================
   cellfree-amyloid-2022: amyloid fibrils made without cells, straight into
   a rotor.
   First, cell-free synthesis (as in the paper's Fig. 1): a dialysis bag of
   reaction mix (RM) sits in its feeding mixture (FM). At the start the
   plasmid carrying the HET-s gene (pIVEX 2.3, T7 promoter) and the E. coli
   extract's ribosomes go into the bag (with NTPs, salts and co-factors,
   named in the key on the larger panels), and
   ¹³C,¹⁵N glycine, valine and isoleucine into the FM; HET-s chains are made
   at the ribosomes and over 18 h at 30 °C each folds into one kinked layer
   (the β-solenoid's arch) of a fibril, the layers stacking straight along
   it. The mix is spun down to a white
   pellet, washed with water (the paper washes three times; shown once; no
   denaturing, no columns), and about 0.5 mg packed into a 0.7 mm rotor.
   Then the rotor tilts to the magic angle and spins at 100 kHz, and a 2D
   ¹H-detected hNH spectrum builds: first the reference, recombinant HET-s
   fibrils labelled throughout (orange), then the cell-free sample's peaks,
   only its 16 labelled residues (7 G, 7 V, 2 I; blue), each landing on its
   orange partner: the same fold. The blue positions are read off the
   paper's Fig. 2c; the orange reference is a stylised cloud around them.
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const TAU = Math.PI * 2;
  const MAGIC = (54.74 * Math.PI) / 180;

  /* ---- the spectrum: the cell-free sample's labelled residues (¹H, ¹⁵N ppm, read off Fig. 2c) ---- */
  const CF = [
    ['G282', 9.78, 110.1], ['G285', 9.0, 108.6], ['G278', 8.4, 112.4], ['G242', 8.62, 114.2], ['G283', 8.28, 113.3], ['G269', 8.42, 113.8], ['G271', 9.82, 115.7],
    ['V275', 8.22, 122.3], ['V239', 8.33, 123.3], ['V244', 8.72, 123.0], ['V264', 8.47, 124.6], ['V267', 8.82, 125.4], ['V245', 9.05, 128.0], ['V268', 8.7, 128.8],
    ['I231', 8.95, 123.7], ['I277', 9.43, 130.3]];
  const NAMED = ['G271', 'G282', 'V264', 'I277'];          // the few named on the larger panels
  // the reference spectrum: every residue of the recombinant fibrils, labelled throughout: the same 16, and a cloud of others
  const REF = (() => {
    const rand = Anim.seeded(31), out = CF.map(([, x, y]) => [x + (rand() - 0.5) * 0.04, y + (rand() - 0.5) * 0.25]);
    for (let i = 0; i < 30; i++) out.push([7.4 + 2.6 * Math.pow(rand(), 0.8), 115 + 15 * rand()]);
    out.push([8.05, 106.0], [10.9, 131.4], [7.35, 117.2], [10.3, 118.6], [7.6, 129.6], [9.9, 125.8]);
    return out;
  })();
  const H0 = 11.5, H1 = 6.6, N0 = 104, N1 = 133;          // the window: ¹H left to right, ¹⁵N top to bottom

  /* ---- the reaction: chains that each fold into one layer of a fibril ---- */
  // HET-s's β-solenoid: each monomer folds into a kinked, roughly triangular arch (one layer), and the layers stack
  // straight up the fibril's axis. Each fibril: x across the bag (of its width), and tilt
  const FIBRILS = [[-0.29, -0.08], [0.0, 0.06], [0.29, -0.05]];
  const LAYERS = 11;
  // one layer seen a little from the side (u across, v into the page, drawn squashed): a triangle kinked on one side
  const ARCH = [[-0.5, 0.35], [-0.08, -0.5], [0.5, 0.15], [0.12, 0.05], [0.18, 0.5], [-0.5, 0.35]];
  const CHAINS = (() => {
    const rand = Anim.seeded(7), out = [];
    FIBRILS.forEach((_, k) => {
      for (let j = 0; j < LAYERS; j++) out.push({ k, j, sx: (rand() - 0.5) * 0.7, sy: (rand() - 0.5) * 0.85, sa: rand() * TAU, ph: rand() * TAU, late: rand() });
    });
    return out;
  })();

  // the ¹³C,¹⁵N glycine, valine and isoleucine, added to the outer feeding mixture at the start: where each settles
  // (beside the bag, left or right), and when
  const GVI = (() => { const rand = Anim.seeded(19); return Array.from({ length: 10 }, (_, i) => ({ side: i % 2 ? 1 : -1, x: rand(), y: rand(), late: rand(), ph: rand() * TAU })); })();

  // what goes into the bag at the start: the plasmid with the HET-s gene, and E. coli ribosomes from the extract.
  // Where each sits (across, of the bag's width; down, of its height), in the ends of the bag, clear of where the fibrils
  // will grow, and its tilt (or, for a plasmid, where the gene sits on it). The chains are made at the ribosomes
  const PLASMIDS = [[0.01, -0.31, 1.0], [0.0, 0.43, 3.6]];
  const RIBOSOMES = [[-0.2, -0.4, 0.3], [0.18, -0.42, -0.4], [-0.21, 0.33, -0.2], [0.21, 0.36, 0.5]];

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 22;
  const SHOW = [0, 0.4, 21.4, 22.0];
  const RM_IN = i => 0.1 + i * 0.09;                       // the plasmids, then the ribosomes, go into the bag (each over 0.5 s) ...
  const RM_KEY = [0.3, 0.8];                               // ... and a key names them
  const GVI_IN = [0.1, 1.1];                               // labelled G, V and I go into the feeding mixture
  const CHAIN_IN = i => 0.8 + i * 0.07;                    // chains appear in the reaction mix ...
  const ASSEMBLE = [2.8, 6.8];                             // ... and stack into fibrils
  const HOURS = [0.8, 6.8];                                // the clock: 0 to 18 h
  const A_OUT = [7.1, 7.6];                                // the tube and bag go
  const B_IN = [7.6, 8.1], FALL = [7.8, 9.0];              // a microtube; the fibrils spin down into a pellet
  const WASH = [9.1, 10.2];                                // a wash with water (the paper washes three times; shown once)
  const ROTOR_IN = [7.8, 8.3], PACK = [10.4, 11.4];        // an empty 0.7 mm rotor, beside the tube; the pellet packed into it
  const TILT = [11.7, 12.7];                               // the tube goes; the rotor tilts to the magic angle and spins
  const SPEC_IN = [12.3, 13.1], REF_IN = [12.9, 13.9];     // the spectrum's frame, then the reference
  const CF_IN = i => 14.2 + i * 0.2;                       // the cell-free peaks, one by one
  const STILL = 19;

  // the rotor: a cylinder at angle a from the vertical, half-length L, radius r; fill: how far up it is packed
  function rotor(ctx, cx, cy, L, r, a, spin, fill, th, sample) {
    const ax = Math.sin(a), ay = -Math.cos(a), px = Math.cos(a), py = Math.sin(a), rot = Math.atan2(py, px);
    const e1 = [cx + ax * L, cy + ay * L], e2 = [cx - ax * L, cy - ay * L];
    const side = (u, s) => [lerp(e2[0], e1[0], u) + px * r * s, lerp(e2[1], e1[1], u) + py * r * s];
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.moveTo(...side(0, 1)); ctx.lineTo(...side(1, 1)); ctx.lineTo(...side(1, -1)); ctx.lineTo(...side(0, -1)); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(e2[0], e2[1], r, r * 0.32, rot, 0, TAU); ctx.fill(); ctx.stroke();
    if (fill > 0.01) {                                     // the packed sample, seen through the wall
      const u0 = 0.12, u1 = lerp(0.12, 0.8, fill);
      ctx.fillStyle = sample;
      ctx.beginPath(); ctx.moveTo(...side(u0, 0.72)); ctx.lineTo(...side(u1, 0.72)); ctx.lineTo(...side(u1, -0.72)); ctx.lineTo(...side(u0, -0.72)); ctx.closePath(); ctx.fill();
    }
    if (spin !== null) {                                   // stripes that travel round it as it spins
      for (let k = 0; k < 8; k++) {
        const phi = spin + (k * TAU) / 8, depth = Math.sin(phi);
        if (depth <= 0) continue;
        const off = Math.cos(phi) * 0.96;
        const keep = ctx.globalAlpha;
        ctx.globalAlpha = keep * (0.25 + 0.75 * depth);
        ctx.strokeStyle = k % 4 === 0 ? th.spec : th.muted; ctx.lineWidth = k % 4 === 0 ? 2 : 1;
        ctx.beginPath(); ctx.moveTo(...side(0.1, off)); ctx.lineTo(...side(0.9, off)); ctx.stroke();
        ctx.globalAlpha = keep;
      }
    }
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(e1[0], e1[1], r, r * 0.32, rot, 0, TAU); ctx.fill(); ctx.stroke();
    const keep = ctx.globalAlpha;                         // the drive cap
    ctx.globalAlpha = keep * 0.85; ctx.fillStyle = th.spec;
    ctx.beginPath(); ctx.ellipse(e1[0] + ax * 3, e1[1] + ay * 3, r * 0.82, r * 0.26, rot, 0, TAU); ctx.fill();
    ctx.globalAlpha = keep;
    return { e1, e2 };
  }

  // a ribosome, size R: its large subunit, and the small one on top
  function ribosome(ctx, x, y, R, tilt, th) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.fillStyle = mix(th.bg, th.soft, 0.35); ctx.strokeStyle = th.soft; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(0, R * 0.3, R, R * 0.68, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(R * 0.1, -R * 0.55, R * 0.68, R * 0.42, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // a plasmid, radius P: a ring of DNA, with the HET-s gene on it (blue, like the chains it makes) starting at angle a0
  function plasmid(ctx, x, y, P, a0, th) {
    ctx.lineCap = 'butt';
    ctx.strokeStyle = th.green; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, P, 0, TAU); ctx.stroke();
    ctx.strokeStyle = th.fid; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(x, y, P, a0, a0 + 1.3); ctx.stroke();
  }

  Anim.register('cellfree-amyloid-2022', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 18, bot = h - pad, big = w >= 400;
    const label = (text, x, y, align, colour, alpha) => { if (alpha < 0.01) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const dark = (() => { const m = /#([0-9a-f]{6})/i.exec(th.bg); if (!m) return false; const v = parseInt(m[1], 16); return ((v >> 16) & 255) + ((v >> 8) & 255) + (v & 255) < 384; })();
    const pellet = dark ? mix(th.ink, th.fid, 0.12) : mix(th.surface, th.fid, 0.1);   // a white pellet
    const pelletEdge = mix(th.bg, th.ink, 0.45);

    /* ---- 1. the reaction: a dialysis bag of reaction mix in its feeding mixture ---- */
    const aA = 1 - between(s, ...A_OUT);
    const tx = w / 2, ty0 = top + 2, ty1 = bot - 2, tw = Math.min(w * 0.26, (ty1 - ty0) * 0.46);
    const bag = { cx: tx, cy: (ty0 + ty1) / 2 + 4, w: tw * 0.6, h: (ty1 - ty0) * 0.66 };
    const layerW = bag.w * 0.22, layerD = Math.max(3, layerW * 0.38), gapL = Math.max(layerD * 1.15, bag.h * 0.055);
    const fibrilAt = (k, j) => {                           // where layer j of fibril k sits
      const [fx, tilt] = FIBRILS[k], c = [bag.cx + fx * bag.w, bag.cy + (k % 2 ? 0.05 : -0.04) * bag.h], off = (j - (LAYERS - 1) / 2) * gapL;
      return [c[0] + Math.sin(tilt) * off, c[1] + Math.cos(tilt) * off, tilt];
    };
    // one layer's outline, at scale k (about the current origin)
    const arch = k => { ctx.beginPath(); ARCH.forEach(([u, v], q) => { const x = u * layerW * k, y = v * layerD * k; if (q) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); };
    if (aA > 0.01) {
      ctx.globalAlpha = show * aA;
      // the tube, filled with feeding mixture
      ctx.beginPath(); ctx.moveTo(tx - tw / 2, ty0); ctx.lineTo(tx - tw / 2, ty1 - tw / 2); ctx.arc(tx, ty1 - tw / 2, tw / 2, Math.PI, 0, true); ctx.lineTo(tx + tw / 2, ty0);
      ctx.fillStyle = mix(th.bg, th.spec, 0.08); ctx.fill(); ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3; ctx.stroke();
      // the labelled amino acids, dropped into the feeding mixture either side of the bag
      const gaps = (tw - bag.w) / 2;
      GVI.forEach(g => {
        const a = between(s, GVI_IN[0] + g.late * 0.5, GVI_IN[0] + g.late * 0.5 + 0.5);
        if (a < 0.01) return;
        const gx = tx + g.side * (bag.w / 2 + gaps * (0.3 + 0.4 * g.x)), gy = ty0 + (ty1 - ty0) * (0.18 + 0.64 * g.y);
        ctx.globalAlpha = show * aA * a; ctx.fillStyle = th.fid;
        ctx.beginPath(); ctx.arc(gx + 1.2 * Math.sin(1.1 * s + g.ph), lerp(ty0 - 14, gy, a), Math.max(1.4, tw * 0.018), 0, TAU); ctx.fill();
      });
      ctx.globalAlpha = show * aA;
      // the bag: reaction mix, tied off at both ends
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bag.cx - bag.w / 2, bag.cy - bag.h / 2, bag.w, bag.h, bag.w / 2); else ctx.rect(bag.cx - bag.w / 2, bag.cy - bag.h / 2, bag.w, bag.h);
      ctx.fillStyle = mix(th.bg, th.fid, 0.12); ctx.fill(); ctx.strokeStyle = th.fid; ctx.lineWidth = 1.2; ctx.stroke();
      for (const sgn of [-1, 1]) {
        const y = bag.cy + sgn * (bag.h / 2 + 2);
        ctx.fillStyle = th.ink; ctx.fillRect(bag.cx - bag.w * 0.42, y - 1.5, bag.w * 0.84, 3);
        ctx.strokeStyle = th.ink; ctx.lineWidth = 1;
        ctx.beginPath(); for (let q = -2; q <= 2; q++) { ctx.moveTo(bag.cx, y); ctx.lineTo(bag.cx + q * bag.w * 0.09, y + sgn * Math.max(5, bag.h * 0.06)); } ctx.stroke();
      }
      // what goes into the bag at the start: the plasmids, then the ribosomes, each dropping into place
      const rS = Math.max(2.6, bag.w * 0.07), pS = Math.max(2.4, bag.w * 0.06);
      const inBag = ([u, v], i) => [bag.cx + u * bag.w + 0.8 * Math.sin(0.7 * s + i), bag.cy + v * bag.h + 0.8 * Math.cos(0.6 * s + 2 * i)];
      [...PLASMIDS, ...RIBOSOMES].forEach((p, i) => {
        const a = between(s, RM_IN(i), RM_IN(i) + 0.5);
        if (a < 0.01) return;
        const [x, y] = inBag(p, i);
        ctx.globalAlpha = show * aA * a;
        if (i < PLASMIDS.length) plasmid(ctx, x, y - 8 * (1 - a), pS, p[2], th); else ribosome(ctx, x, y - 8 * (1 - a), rS, p[2], th);
      });
      // HET-s chains are made at the ribosomes, then each folds into a layer of a fibril (each fibril a faint strip along its axis behind)
      const asm = (s - ASSEMBLE[0]) / (ASSEMBLE[1] - ASSEMBLE[0]);
      FIBRILS.forEach((_, k) => {
        const p0 = fibrilAt(k, 0), p1 = fibrilAt(k, LAYERS - 1);
        ctx.globalAlpha = show * aA * 0.12 * ease(asm); ctx.strokeStyle = th.fid; ctx.lineWidth = layerW * 0.95; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.stroke();
      });
      CHAINS.forEach((c, i) => {
        const a = between(s, CHAIN_IN(i), CHAIN_IN(i) + 0.4);
        if (a < 0.01) return;
        const u = ease((asm - c.late * 0.5) / 0.5);          // its move into place
        const [bx, by, tilt] = fibrilAt(c.k, c.j);
        const rk = i % RIBOSOMES.length, [rx0, ry0] = inBag(RIBOSOMES[rk], PLASMIDS.length + rk);   // the ribosome that makes it
        const made = between(s, CHAIN_IN(i), CHAIN_IN(i) + 0.9), grown = between(s, CHAIN_IN(i), CHAIN_IN(i) + 0.45);
        const sx = lerp(rx0, bag.cx + c.sx * bag.w, made), sy = lerp(ry0, bag.cy + c.sy * bag.h * 0.85, made), drift = 2 * made * Math.sin(1.3 * s + c.ph);
        const x = lerp(sx + drift, bx, u), y = lerp(sy - drift, by, u), ang = lerp(c.sa, -tilt, u);
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
        ctx.globalAlpha = show * aA * a * (1 - u);           // a chain: a short squiggle, growing as it's made
        ctx.strokeStyle = th.fid; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); for (let q = 0; q <= Math.max(1, Math.round(12 * grown)); q++) { const xx = (q / 12 - 0.5) * layerW * 1.1; const yy = Math.sin(q * 1.3 + c.ph + s) * 2.2; q ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
        ctx.globalAlpha = show * aA * a * u;                 // ... folds into one kinked layer of a fibril
        arch(1); ctx.fillStyle = rgba(th.fid, 0.18); ctx.fill();
        ctx.strokeStyle = th.fid; ctx.lineWidth = Math.max(1.1, layerW * 0.08); ctx.lineJoin = 'round'; ctx.stroke();
        ctx.restore();
      });
      if (big) { label('FM', tx - tw / 2 - 8, ty0 + (ty1 - ty0) * 0.16, 'right', th.soft, aA); label('RM', bag.cx - bag.w / 2 - 8, bag.cy, 'right', th.fid, aA); }
      // what went into the feeding mixture, beside the tube
      const gl = aA * between(s, GVI_IN[0], GVI_IN[0] + 0.5), gx0 = tx + tw / 2 + 8, gy0 = ty0 + (ty1 - ty0) * 0.12;
      label('+ ¹³C,¹⁵N', gx0, gy0, 'left', th.fid, gl);
      label('G, V, I', gx0, gy0 + 14, 'left', th.fid, gl);
      // a key for what went into the bag, in the corner beside the tube (on the larger panels, with the rest of the mix)
      const kA = aA * between(s, ...RM_KEY), kRoom = tx - tw / 2 - 8 - pad;
      if (kA > 0.01) {
        const rows = [[big ? 'plasmid DNA' : 'pDNA', 'p', th.green], ['ribosomes', 'r', th.soft]];
        const rest = ['+ NTPs, salts, co-factors', '+ NTPs, salts'].find(q => Anim.measure(ctx, th, q) <= kRoom);
        if (big && rest) rows.push([rest, null, th.muted]);
        rows.forEach(([name, icon, colour], i) => {
          const kx = pad, ky = bot - (rows.length - i) * 14 + 6;
          ctx.globalAlpha = show * kA;
          if (icon === 'p') plasmid(ctx, kx + 4, ky, 3.4, 4.4, th);
          if (icon === 'r') ribosome(ctx, kx + 4, ky + 0.5, 3.6, 0, th);
          label(name, icon ? kx + 12 : kx, ky, 'left', colour, kA);
        });
      }
    }

    /* ---- 2. harvest: spun down into a pellet, washed, and packed into a 0.7 mm rotor ---- */
    const aB = between(s, ...B_IN) * (1 - between(s, TILT[0] - 0.2, TILT[0] + 0.3));
    const ex = w * 0.36, ey0 = top + (bot - top) * 0.24, eH = (bot - top) * 0.52, eW = Math.min(w * 0.09, eH * 0.32);   // (sharing the stage with the rotor)
    const tip = [ex, ey0 + eH - 2];
    const fall = between(s, ...FALL), pack = between(s, ...PACK), pelletR = Math.max(4, eW * 0.28) * fall * (1 - 0.85 * pack);
    if (aB > 0.01) {
      ctx.globalAlpha = show * aB;
      // the microtube: a cylinder, a cone to its tip, and its lid
      const coneY = ey0 + eH * 0.58;
      ctx.beginPath(); ctx.moveTo(ex - eW / 2, ey0); ctx.lineTo(ex - eW / 2, coneY); ctx.lineTo(ex - eW * 0.12, tip[1]); ctx.quadraticCurveTo(ex, tip[1] + 3, ex + eW * 0.12, tip[1]); ctx.lineTo(ex + eW / 2, coneY); ctx.lineTo(ex + eW / 2, ey0);
      ctx.fillStyle = th.surface; ctx.fill(); ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - eW / 2 - 3, ey0); ctx.lineTo(ex + eW / 2 + 3, ey0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex - eW / 2 - 3, ey0); ctx.lineTo(ex - eW / 2 - 3 - eW * 0.5, ey0 - eW * 0.45); ctx.stroke();   // the lid, open
      // the wash: a pipette tip dips in, water rises round the pellet, and is drawn off again
      {
        const [w0, w1] = WASH, level = envelope(s, [w0 + 0.25, w0 + 0.5, w1 - 0.5, w1 - 0.25]);
        if (level > 0.01) {
          ctx.save(); ctx.beginPath(); ctx.moveTo(ex - eW / 2, ey0); ctx.lineTo(ex - eW / 2, coneY); ctx.lineTo(ex - eW * 0.12, tip[1]); ctx.lineTo(ex + eW * 0.12, tip[1]); ctx.lineTo(ex + eW / 2, coneY); ctx.lineTo(ex + eW / 2, ey0); ctx.clip();
          ctx.globalAlpha = show * aB * 0.5 * level; ctx.fillStyle = mix(th.bg, th.fid, 0.3);
          ctx.fillRect(ex - eW, lerp(tip[1], coneY - eH * 0.15, level), eW * 2, eH); ctx.restore();
        }
      }
      // the pellet
      if (pelletR > 0.3) {
        ctx.globalAlpha = show * aB;
        ctx.beginPath(); ctx.ellipse(tip[0], tip[1] - pelletR * 0.5, pelletR, pelletR * 0.75, 0, 0, TAU); ctx.fillStyle = pellet; ctx.fill(); ctx.strokeStyle = pelletEdge; ctx.lineWidth = 1; ctx.stroke();
      }
      // the pipette tip that adds the water, then takes it off again
      const dip = envelope(s, [WASH[0], WASH[0] + 0.3, WASH[1] - 0.3, WASH[1]]);
      if (dip > 0.01) {
        const tW = eW * 0.3, tL = eH * 0.55, px = ex + eW * 0.16, py = lerp(ey0 - eH * 0.15, ey0 + eH * 0.42, dip);
        ctx.globalAlpha = show * aB * dip;
        ctx.beginPath(); ctx.moveTo(px - tW / 2, py - tL); ctx.lineTo(px + tW / 2, py - tL); ctx.lineTo(px + 0.8, py); ctx.lineTo(px - 0.8, py); ctx.closePath();
        ctx.fillStyle = th.surface; ctx.fill(); ctx.strokeStyle = th.ink; ctx.lineWidth = 1.1; ctx.stroke();
      }
      if (big) label('pellet', ex + eW / 2 + 8, tip[1] - 4, 'left', th.soft, aB * between(s, FALL[1] - 0.3, FALL[1]) * (1 - between(s, PACK[0] - 0.3, PACK[0])));
    }
    // the fibrils falling to the tip as it spins
    if (fall > 0.01 && fall < 0.99) CHAINS.forEach((c, i) => {
      const [bx, by] = fibrilAt(c.k, c.j), u = ease(fall * 1.3 - c.late * 0.3);
      ctx.save(); ctx.translate(lerp(bx, tip[0] + (i % 5 - 2) * 2, u), lerp(by, tip[1] - 4, u));
      ctx.globalAlpha = show * (1 - u); arch(0.6); ctx.strokeStyle = th.fid; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    });

    /* ---- 3. the rotor: packed, then tilted to the magic angle and spun, beside the spectrum ---- */
    const aR = between(s, ...ROTOR_IN), tilt = between(s, ...TILT);
    // the key sits under the rotor, beside the spectrum: on the narrowest panel 'recombinant' won't fit, so it says 'reference',
    // and the spectrum's left edge is kept clear of whichever word it uses
    const keyClear = word => pad + 12 + Anim.measure(ctx, th, word) + 6, specX0 = pad + (w - 2 * pad) * (big ? 0.34 : 0.38);
    const refName = big || keyClear('recombinant') <= specX0 ? 'recombinant' : 'reference';
    const spec = { x0: big ? specX0 : Math.max(specX0, keyClear(refName)), x1: w - pad - (big ? 30 : 24), y0: top + 26, y1: bot - 16 };
    const rB = { x: w * 0.62, y: (top + bot) / 2 + 2, L: (bot - top) * 0.2 };
    const rC = { x: pad + (spec.x0 - pad) * 0.5, y: (top + bot) / 2 + 4, L: Math.min((spec.x0 - pad) * 0.42, (bot - top) * 0.24) };
    if (aR > 0.01) {
      const L = lerp(rB.L, rC.L, tilt), r = L * 0.3, x = lerp(rB.x, rC.x, tilt), y = lerp(rB.y, rC.y, tilt);
      const spinning = between(s, TILT[1] - 0.4, TILT[1] + 0.4);
      // B0, and the angle, once it's tilted
      if (tilt > 0.01) {
        ctx.globalAlpha = show * tilt; ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(x, Math.min(y + L * 1.25, bot - 34)); ctx.lineTo(x, y - L * 1.3); ctx.stroke(); ctx.setLineDash([]);   // (clear of the key below)
        label('B₀', x + 6, y - L * 1.3, 'left', th.muted, tilt);
        ctx.globalAlpha = show * tilt; ctx.strokeStyle = th.fid; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.arc(x, y, L * 0.6, -Math.PI / 2, -Math.PI / 2 + MAGIC * tilt); ctx.stroke();
      }
      ctx.globalAlpha = show * aR;
      // the pellet on its way in
      if (pack > 0.01 && pack < 0.99) {
        const p = [lerp(tip[0], rB.x, pack), lerp(tip[1], rB.y - rB.L, pack) - Math.sin(Math.PI * pack) * (bot - top) * 0.25];
        ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(2.5, eW * 0.14), 0, TAU); ctx.fillStyle = pellet; ctx.fill(); ctx.strokeStyle = pelletEdge; ctx.lineWidth = 1; ctx.stroke();
      }
      rotor(ctx, x, y, L, r, MAGIC * tilt, spinning > 0.01 ? (TAU * 1.6 * s) : null, pack, th, pellet);
      label(big ? '0.7 mm rotor' : '0.7 mm', x, y + L + r + 12, 'center', th.soft, aR * (1 - tilt));
      if (big) label('100 kHz MAS', x, y + L * 1.25 + 12, 'center', th.soft, spinning);   // (on the phone sizes the heading says it)
    }

    /* ---- the spectrum: the reference (orange), then the cell-free sample's labelled residues (blue) ---- */
    const sA = between(s, ...SPEC_IN);
    if (sA > 0.01) {
      const X = p => spec.x0 + ((H0 - p) / (H0 - H1)) * (spec.x1 - spec.x0), Y = p => spec.y0 + ((p - N0) / (N1 - N0)) * (spec.y1 - spec.y0);
      const rx = Math.max(2.2, (0.11 / (H0 - H1)) * (spec.x1 - spec.x0)), ry = Math.max(2.2, (0.5 / (N1 - N0)) * (spec.y1 - spec.y0));
      ctx.globalAlpha = show * sA; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(spec.x0) + 0.5, Math.round(spec.y0) + 0.5, Math.round(spec.x1 - spec.x0), Math.round(spec.y1 - spec.y0));
      const hName = big ? '¹H (ppm)' : '', hClear = spec.x0 + (hName ? Anim.measure(ctx, th, hName) + 6 : 0);
      for (const p of [11, 10, 9, 8, 7]) { ctx.beginPath(); ctx.moveTo(X(p), spec.y1); ctx.lineTo(X(p), spec.y1 + 4); ctx.stroke(); if ((big || (p % 2 === 1 && p < 11)) && X(p) - 7 > hClear) label(String(p), X(p), spec.y1 + 11, 'center', th.muted, sA); }
      for (const p of [105, 110, 115, 120, 125, 130]) { ctx.beginPath(); ctx.moveTo(spec.x1, Y(p)); ctx.lineTo(spec.x1 + 4, Y(p)); ctx.stroke(); if (big || p % 10 === 0) label(String(p), spec.x1 + 7, Y(p), 'left', th.muted, sA); }
      if (hName) label(hName, spec.x0, spec.y1 + 11, 'left', th.soft, sA);
      label(big ? '¹⁵N' : '', spec.x1 + 7, spec.y0 - 9, 'left', th.soft, sA);
      // the reference: contours of every residue
      const rA = between(s, ...REF_IN);
      if (rA > 0.01) {
        ctx.save(); ctx.beginPath(); ctx.rect(spec.x0, spec.y0, spec.x1 - spec.x0, spec.y1 - spec.y0); ctx.clip();
        ctx.globalAlpha = show * rA * 0.9; ctx.strokeStyle = th.spec; ctx.lineWidth = 0.9;
        for (const [hp, np] of REF) for (const k of [1, 0.66, 0.33]) { ctx.beginPath(); ctx.ellipse(X(hp), Y(np), rx * 1.25 * k, ry * 1.25 * k, 0, 0, TAU); ctx.stroke(); }
        ctx.restore();
      }
      // the cell-free sample: only G, V and I, each on its partner
      CF.forEach(([name, hp, np], i) => {
        const a = between(s, CF_IN(i), CF_IN(i) + 0.35);
        if (a < 0.01) return;
        const k = 0.5 + 0.5 * a;
        ctx.globalAlpha = show * a; ctx.fillStyle = rgba(th.fid, 0.85); ctx.strokeStyle = th.fid; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(X(hp), Y(np), rx * k, ry * k, 0, 0, TAU); ctx.fill(); ctx.stroke();
        if (big && NAMED.includes(name)) label(name, X(hp) + (hp > 9.5 ? -rx - 4 : rx + 4), Y(np) - ry - 5, hp > 9.5 ? 'right' : 'left', th.fid, a);
      });
      // a key, stacked in the space under the rotor
      const keys = [[refName, th.spec, rA], [big ? 'cell-free, GVI' : 'cell-free', th.fid, between(s, CF_IN(0), CF_IN(0) + 0.4)]];
      keys.forEach(([name, colour, a], i) => {
        if (a < 0.01) return;
        const kx = pad, ky = bot - (keys.length - i) * 14 + 6;
        ctx.globalAlpha = show * a;
        if (i) { ctx.fillStyle = rgba(colour, 0.85); ctx.beginPath(); ctx.ellipse(kx + 4, ky, 4, 3, 0, 0, TAU); ctx.fill(); }
        else { ctx.strokeStyle = colour; ctx.lineWidth = 1; for (const k of [1, 0.5]) { ctx.beginPath(); ctx.ellipse(kx + 4, ky, 4 * k, 3 * k, 0, 0, TAU); ctx.stroke(); } }
        label(name, kx + 12, ky, 'left', colour, a);
      });
    }

    /* ---- the heading ---- */
    const room = w - 2 * pad, hours = Math.round(18 * between(s, ...HOURS));
    const pick = (left, right) => {
      for (const l of left) { const r = right.find(q => Anim.measure(ctx, th, l) + Anim.measure(ctx, th, q) + 16 <= room); if (r !== undefined) return [l, r]; }
      return [left.find(l => Anim.measure(ctx, th, l) <= room) || left[left.length - 1], ''];
    };
    const heading = (alpha, left, right, colour) => {
      if (alpha < 0.01) return;
      const [L0, R0] = pick(left, right.concat(['']));
      label(L0, pad, ly, 'left', th.ink, alpha);
      if (R0) label(R0, w - pad, ly, 'right', colour, alpha);
    };
    const hB = B_IN[0], hR = PACK[0] - 0.2, hC = TILT[0];
    // first what the mix is (selectively labelled), then the clock
    const aA1 = 1 - between(s, hB - 0.3, hB), sel = 1 - between(s, 1.7, 2.0), clock = between(s, 2.0, 2.3);
    const leftA = big ? ['Cell-free synthesis'] : ['Cell-free'];   // (the same left words through this stage)
    heading(aA1 * sel, leftA, ['selective ¹³C,¹⁵N labelling', 'selective labels'], th.fid);
    heading(aA1 * clock, leftA, [`E. coli extract · 30 °C · ${hours} h`, `30 °C · ${hours} h`, `${hours} h`], th.fid);
    if (aA1 > 0.01 && sel < 0.99 && clock < 0.99) heading(aA1 * (1 - Math.max(sel, clock)), leftA, [], th.fid);   // (the left words stay put across the change)
    heading(between(s, hB, hB + 0.3) * (1 - between(s, hR - 0.3, hR)), ['Spin down, wash with water', 'Spin down, wash', 'Spin, wash'], ['no denaturing, no columns', 'no columns'], th.soft);
    heading(between(s, hR, hR + 0.3) * (1 - between(s, hC - 0.3, hC)), ['Into a 0.7 mm rotor', '0.7 mm rotor'], ['~0.5 mg of fibrils', '~0.5 mg'], th.soft);
    heading(between(s, hC, hC + 0.4), ['¹H-detected hNH, 100 kHz MAS', 'hNH, 100 kHz MAS', 'hNH'], ['same fold', ''], th.fid);
    ctx.globalAlpha = 1;
  }, { still: STILL, loop: CYCLE });

  /* ---- colour helpers ---- */
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
  function rgba(c, a) { const v = rgb(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; }
})();
