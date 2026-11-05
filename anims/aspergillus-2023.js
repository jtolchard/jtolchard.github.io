/* ==========================================================================
   aspergillus-2023: solid-state NMR snapshots of a spore's cell wall.
   Above, the cell wall of an Aspergillus fumigatus spore in section
   (outside at the top), as in the paper's Fig. 8, through three stages along
   a track: dormant, under a coat of RodA rodlets on melanin; swollen (5 h),
   the coat broken away; germinating (8 h), with strands of
   galactosaminogalactan (GAG) on the surface. Its glucans are rows of
   beads, β-1,3-glucan orange and α-1,3-glucan blue, re-balancing with each
   stage; chitin is a steady row by the membrane.
   Below, a stylised ¹³C MAS spectrum of the intact spore's rigid wall
   (cross-polarisation), built from the paper's chemical shifts (Fig. 2B),
   each carbon scaled by its polysaccharide's share (Fig. 5C: 67/21/12 %
   dormant, 47/41/12 % swollen, 63/25/12 % germinating). The track is its
   legend: each stage's spectrum is drawn in that stage's colour (dormant
   grey, swollen red, germinating green) and kept as the next comes in.
   GAG's peaks come from the mobile fraction, a separate (direct-
   polarisation) experiment on the same spores, at the paper's shifts
   (109, 84, 78 ppm) and with heights as its 1D traces (Fig. 4C).
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const TAU = Math.PI * 2;

  /* ---- the spectrum: the paper's ¹³C shifts (ppm, Fig. 2B), each carbon scaled by its polysaccharide's share ---- */
  const SHIFTS = {
    b: [105.8, 88.8, 79.9, 76.6, 70.5, 63.8],               // β-1,3-glucan C1, C3, C5, C2, C4, C6 (as Fig. 5D's β1–β6)
    a: [103.2, 86.5, 74.0, 72.3, 71.1, 62.5],               // α-1,3-glucan
    c: [106.2, 84.9, 77.4, 75.4, 62.6, 57.2]                // chitin (C2 at 57 ppm, on its own)
  };
  // galactosaminogalactan (mobile: seen by direct polarisation): Gal1, Gal2, Gal3 (text and Fig. 4A), heights as its 1D
  // traces (Fig. 4C), where Gal1 is the tallest and Gal3 barely shows
  const GAG = [[109, 1], [84, 0.65], [78, 0.3]];
  const STAGES = [                                           // rigid shares, % (Fig. 5C); GAG relative to germinating
    { b: 67, a: 21, c: 12, gag: 0, name: 'dormant' },
    { b: 47, a: 41, c: 12, gag: 0.2, name: 'swollen' },            // (after 5 h)
    { b: 63, a: 25, c: 12, gag: 1, name: 'germinating' }          // (after 8 h)
  ];
  const HW = 0.45, HW_GAG = 0.35;                            // half widths, ppm (~130 Hz lines at 150 MHz)
  const lor = (x, p, hw) => 1 / (1 + ((x - p) / hw) ** 2);
  const rigid = (x, f) => SHIFTS.b.reduce((q, p) => q + f.b * lor(x, p, HW), 0) + SHIFTS.a.reduce((q, p) => q + f.a * lor(x, p, HW), 0) + SHIFTS.c.reduce((q, p) => q + f.c * lor(x, p, HW), 0);
  const mobile = (x, g) => GAG.reduce((q, [p, hgt]) => q + g * 24 * hgt * lor(x, p, HW_GAG), 0);
  const P0 = 130, P1 = 50;                                   // the window, ppm (left to right; the empty left holds the key)
  const PEAK = Math.max(...STAGES.map(f => { let m = 0; for (let x = P1; x <= P0; x += 0.05) m = Math.max(m, rigid(x, f)); return m; }));

  // each glucan bead's rank (it shows α-glucan while the α share is above it), and how each piece of the coat drifts off
  const rand = Anim.seeded(9);
  const RANKS = Array.from({ length: 600 }, () => rand());
  const PIECES = Array.from({ length: 24 }, () => ({ up: 0.6 + 0.5 * rand(), turn: (rand() - 0.5) * 0.5, side: (rand() - 0.5) * 8 }));

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 19;
  const SHOW = [0, 0.4, 18.4, 19.0];
  const SPEC_IN = [0.4, 1.6];                                // the spectrum draws in
  const TO_SWOLLEN = [5.0, 6.6];                             // the coat breaks away, the glucans re-balance
  const TO_GERM = [10.6, 12.2];                              // GAG appears, the glucans re-balance again
  const STILL = 15.5;

  Anim.register('aspergillus-2023', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;
    const u1 = between(s, ...TO_SWOLLEN), u2 = between(s, ...TO_GERM);
    const mixStage = key => lerp(lerp(STAGES[0][key], STAGES[1][key], u1), STAGES[2][key], u2);
    const f = { b: mixStage('b'), a: mixStage('a'), c: mixStage('c') }, gagNow = mixStage('gag');

    /* ---- layout: the spore above, the spectrum below ---- */
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 16, bot = h - pad, big = w >= 400;
    const topH = top + (bot - top) * (big ? 0.5 : 0.44);     // (the phone sizes have no layer labels, and need the spectrum's height)
    const label = (text, x, y, align, colour, alpha) => { if (alpha < 0.01) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };

    /* ---- the cell wall in section, outside at the top ---- */
    // (on the larger panels the wall and its labels are drawn at 80 %, as one group centred in the space, for room around it)
    const labelW = big ? Anim.measure(ctx, th, 'membrane') : 0, kWall = big ? 0.8 : 1;
    const sw = (w - 2 * pad - (big ? labelW + 14 : 0)) * kWall, groupW = sw + (big ? labelW + 10 : 0);
    const x0 = pad + (w - 2 * pad - groupW) / 2, x1 = x0 + sw, tx0 = pad, tx1 = w - pad;   // tx: the track spans the panel
    const stageA = [1 - u1, u1 * (1 - u2), u2], reached = [1, u1, u2];
    const SC = [mix(th.muted, th.ink, 0.25), th.red, mix(th.green, th.ink, 0.3)];   // each stage's colour: on the track, it's the spectrum's legend (green deepened to hold its own as a line)
    const nowC = mix(mix(SC[0], SC[1], u1), SC[2], u2), stageColour = k => mix(th.muted, SC[k], reached[k]);   // (stages still to come: muted)
    // the stages, along a track: a marker moves on as the spore changes
    const trackY = ly + (big ? 26 : 23), lineY = trackY + (big ? 11 : 10), stops = [tx0 + 3, (tx0 + tx1) / 2, tx1 - 3];   // clear of the heading above, the wall below
    ctx.globalAlpha = show; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(stops[0], lineY); ctx.lineTo(stops[2], lineY); ctx.stroke();
    const bold = (text, x, y, align, colour, alpha) => {    // the stages' names, in bold to stand apart from the heading
      if (alpha < 0.01) return;
      ctx.globalAlpha = show * alpha; ctx.font = `700 12px ${th.mono}`; ctx.fillStyle = colour; ctx.textAlign = align; ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + 0.5);
    };
    ctx.font = `700 12px ${th.mono}`;
    const wn = STAGES.map(st => ctx.measureText(st.name).width);
    const allFit = tx0 + wn[0] + 8 <= stops[1] - wn[1] / 2 && stops[1] + wn[1] / 2 + 8 <= tx1 - wn[2];   // else only the stage in hand, over the marker
    const mark = lerp(lerp(stops[0], stops[1], u1), stops[2], u2);
    stops.forEach((x, k) => {
      ctx.globalAlpha = show; ctx.fillStyle = mix(th.surface, SC[k], reached[k]); ctx.strokeStyle = stageColour(k); ctx.beginPath(); ctx.arc(x, lineY, 2.5, 0, TAU); ctx.fill(); ctx.stroke();
      if (allFit) bold(STAGES[k].name, k === 0 ? tx0 : k === 2 ? tx1 : x, trackY, k === 0 ? 'left' : k === 2 ? 'right' : 'center', stageColour(k), 1);
      else bold(STAGES[k].name, Math.max(tx0 + wn[k] / 2, Math.min(tx1 - wn[k] / 2, mark)), trackY, 'center', SC[k], Math.max(0, stageA[k] * 2 - 1) || (stageA[k] > 0.999 ? 1 : 0));
    });
    ctx.globalAlpha = show; ctx.fillStyle = nowC;
    ctx.beginPath(); ctx.arc(mark, lineY, 3.5, 0, TAU); ctx.fill();

    // its layers: the coat (or, later, GAG), the glucans, chitin, the membrane
    const S = (topH - 2 - (lineY + (big ? 12 : 9))) * kWall;
    // on the larger panels, halfway between just under the track and centred between the track and the shares' row
    const wy0 = big ? ((lineY + 11) + ((lineY + 4 + topH + 14) / 2 - S / 2)) / 2 : lineY + 9;
    const coat = [wy0, wy0 + S * 0.24], gz = [wy0 + S * 0.26, wy0 + S * 0.72], ch = [wy0 + S * 0.74, wy0 + S * 0.88], mem = [wy0 + S * 0.9, wy0 + S];
    const capsule = (x, y, bw, bh, colour) => { ctx.fillStyle = colour; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, bh / 2); else ctx.rect(x, y, bw, bh); ctx.fill(); };
    ctx.save(); ctx.beginPath(); ctx.rect(x0, lineY + 5, sw, topH - lineY); ctx.clip();          // (the coat's pieces vanish before the track)
    // the glucans: rows of beads, offset like brickwork; each shows α or β by its rank against the α share now
    const rows = S >= 55 ? 3 : 2, rowH = (gz[1] - gz[0]) / rows, bh = rowH * 0.56, bw = rowH * 0.72 * 2.3, gapX = Math.max(2, rowH * 0.2);
    const alphaShare = f.a / (f.a + f.b);
    let n = 0;
    for (let row = 0; row < rows; row++) {
      const y = gz[0] + row * rowH + (rowH - bh) / 2;
      for (let x = x0 - (row % 2 ? (bw + gapX) / 2 : 0); x < x1; x += bw + gapX, n++) {
        const isA = ease((alphaShare - RANKS[n % RANKS.length]) / 0.04 + 0.5);
        ctx.globalAlpha = show; capsule(x, y, bw, bh, mix(th.bg, mix(th.spec, th.fid, isA), 0.85));
      }
    }
    // chitin: one steady row of darker beads
    { const y = ch[0] + (ch[1] - ch[0] - bh) / 2;            // (beads the size of the glucans')
      for (let x = x0 + 1; x < x1; x += bw + gapX) capsule(x, y, bw, bh, mix(th.bg, th.ink, 0.62)); }
    // the membrane: a bilayer of small heads
    { const hr = Math.max(1.1, (mem[1] - mem[0]) * 0.22);
      ctx.fillStyle = th.muted;
      for (let x = x0 + hr; x < x1; x += hr * 2.6) for (const y of [mem[0] + hr, mem[1] - hr]) { ctx.beginPath(); ctx.arc(x, y, hr, 0, TAU); ctx.fill(); } }
    // the coat: melanin with RodA rodlets on it, in pieces that lift off and drift away as the spore swells
    const peel = between(s, TO_SWOLLEN[0], TO_SWOLLEN[0] + 1.4);
    if (peel < 0.99) {
      const pieces = Math.max(5, Math.min(PIECES.length, Math.round(sw / 38))), pw = sw / pieces, rodH = Math.max(2, (coat[1] - coat[0]) * 0.32);
      for (let k = 0; k < pieces; k++) {
        const P = PIECES[k], px0 = x0 + k * pw + 0.8, px1 = x0 + (k + 1) * pw - 0.8, mx = (px0 + px1) / 2, my = (coat[0] + coat[1]) / 2;
        ctx.save();
        ctx.translate(mx + peel * P.side, my - peel * (S * 0.3 * P.up + 6)); ctx.rotate(peel * P.turn); ctx.translate(-mx, -my);
        ctx.globalAlpha = show * (1 - peel);
        capsule(px0, coat[0] + (coat[1] - coat[0]) * 0.52, px1 - px0, (coat[1] - coat[0]) * 0.38, mix(th.ink, th.bg, 0.22));   // melanin
        for (let x = px0 + 1; x < px1 - 4 * kWall; x += 7 * kWall) capsule(x, coat[0] + (coat[1] - coat[0]) * 0.06, 5.5 * kWall, rodH, th.red);   // rodlets
        ctx.restore();
      }
    }
    // GAG: strands on the surface once the coat has gone, sparse when swollen, full when germinating
    if (gagNow > 0.01) {
      ctx.strokeStyle = th.green; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
      const step = Math.max(5, sw / 48), len = (coat[1] - coat[0]) * 0.95;
      let i = 0;
      for (let x = x0 + step / 2; x < x1; x += step, i++) {
        const on = Math.max(0, Math.min(1, gagNow * 5 - (i % 5)));       // each strand comes in at its own level
        if (on < 0.01) continue;
        const wob = Math.sin(1.4 * s + i * 1.7) * 2.2, y0 = gz[0] - 0.5, l = len * (0.75 + 0.25 * RANKS[(i * 7) % RANKS.length]) * on;
        ctx.globalAlpha = show * on;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.bezierCurveTo(x + wob, y0 - l * 0.35, x - wob, y0 - l * 0.7, x + wob * 0.6, y0 - l); ctx.stroke();
      }
    }
    ctx.restore();
    // what each layer is, on the right: spread at least 15 px apart (top to bottom), each moved one with a tick to its layer
    if (big) {
      const lx = x1 + 10, gagOn = between(s, TO_GERM[0] + 0.6, TO_GERM[1]), coatH = coat[1] - coat[0];
      const tags = [
        { text: 'rodlets', at: coat[0] + coatH * 0.2, colour: th.red, a: 1 - peel },
        { text: 'melanin', at: coat[0] + coatH * 0.73, colour: th.soft, a: 1 - peel },
        { text: 'glucans', at: (gz[0] + gz[1]) / 2, colour: th.soft, a: 1 },
        { text: 'chitin', at: (ch[0] + ch[1]) / 2, colour: th.ink, a: 1 },
        { text: 'membrane', at: (mem[0] + mem[1]) / 2, colour: th.muted, a: 1 }];
      const GAP = 15;
      tags.forEach((g, i) => { g.y = i ? Math.max(g.at, tags[i - 1].y + GAP) : g.at; });            // push down where crowded ...
      const over = tags[tags.length - 1].y - (topH + 20 - GAP);                                    // ... but keep clear of the spectrum's labels (their row)
      if (over > 0) for (let i = tags.length - 1; i >= 0; i--) tags[i].y = Math.min(tags[i].y, i === tags.length - 1 ? tags[i].y - over : tags[i + 1].y - GAP);
      tags.push({ text: 'GAG', at: (coat[0] + coat[1]) / 2, y: (coat[0] + coat[1]) / 2, colour: th.green, a: gagOn });
      for (const g of tags) {
        if (g.a < 0.01) continue;
        label(g.text, lx, g.y, 'left', g.colour, g.a);
        if (Math.abs(g.y - g.at) > 1.5) {
          ctx.globalAlpha = show * g.a * 0.8; ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x1 + 2, g.at); ctx.lineTo(lx - 4, g.y); ctx.stroke();
        }
      }
    }

    /* ---- the spectrum ---- */
    const sx0 = pad, sx1 = w - pad, rowY = topH + (big ? 20 : 13), yb = bot - 14, H = yb - (rowY + 14);
    const X = p => sx0 + ((P0 - p) / (P0 - P1)) * (sx1 - sx0), Y = v => yb - (v / PEAK) * H * 0.92;
    const N = Math.round(Math.min(420, (sx1 - sx0) * 1.2)), grow = between(s, ...SPEC_IN);
    const trace = (fn, colour, lw, alpha, peaksOnly) => {    // peaksOnly: drawn only where it rises off the baseline
      if (alpha < 0.01) return;
      ctx.globalAlpha = show * alpha; ctx.strokeStyle = colour; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.beginPath();
      let on = false;
      for (let i = 0; i <= N * grow; i++) {
        const p = P0 - (i / N) * (P0 - P1), v = fn(p);
        if (peaksOnly && v < PEAK * 0.012) { on = false; continue; }
        on ? ctx.lineTo(X(p), Y(v)) : ctx.moveTo(X(p), Y(v)); on = true;
      }
      ctx.stroke();
    };
    // the axis
    ctx.globalAlpha = show; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sx0, Math.round(yb) + 0.5); ctx.lineTo(sx1, Math.round(yb) + 0.5); ctx.stroke();
    const step = X(100) - X(110) >= 34 ? 10 : 20;
    for (let p = 120; p >= 50; p -= step) {
      ctx.strokeStyle = th.rule; ctx.beginPath(); ctx.moveTo(X(p), yb); ctx.lineTo(X(p), yb + 4); ctx.stroke();
      if (X(p) + 8 <= w - 12) label(String(p), X(p), yb + 10, 'center', th.muted, 1);
    }
    label(big ? '¹³C (ppm)' : 'ppm', sx0, yb - 9, 'left', th.soft, 1);
    // the rigid wall at each stage passed, kept in its colour; GAG's mobile peaks (filled up from the baseline, in the
    // colour of the stage in hand); then the rigid wall now, in the colour of the stage in hand
    const keep0 = between(s, TO_SWOLLEN[0], TO_SWOLLEN[0] + 0.6), keep1 = between(s, TO_GERM[0], TO_GERM[0] + 0.6);
    trace(p => rigid(p, STAGES[0]), SC[0], 1.3, 0.85 * keep0);
    trace(p => rigid(p, STAGES[1]), SC[1], 1.3, 0.85 * keep1);
    const mobA = between(s, TO_SWOLLEN[0] + 0.6, TO_SWOLLEN[1]);
    if (mobA > 0.01) {
      ctx.globalAlpha = show * mobA;
      let seg = null;
      const close = () => { if (!seg) return; ctx.lineTo(seg.last, yb); ctx.closePath(); ctx.fillStyle = rgba(nowC, 0.35); ctx.fill(); ctx.strokeStyle = nowC; ctx.lineWidth = 1.2; ctx.stroke(); seg = null; };
      for (let i = 0; i <= N * grow; i++) {
        const p = P0 - (i / N) * (P0 - P1), v = mobile(p, gagNow), x = X(p);
        if (v < PEAK * 0.006) { close(); continue; }
        if (!seg) { ctx.beginPath(); ctx.moveTo(x, yb); seg = {}; }
        ctx.lineTo(x, Y(v)); seg.last = x;
      }
      close();
    }
    trace(p => rigid(p, f), nowC, 1.8, 1);
    if (big) {                                               // a key, in the empty left of the window: which kind each mark is
      const keyC = th.soft, kA = [between(s, SPEC_IN[1] - 0.3, SPEC_IN[1] + 0.2), between(s, TO_SWOLLEN[1] - 0.4, TO_SWOLLEN[1] + 0.2)];
      const k1 = rowY + 14 + (yb - rowY - 14) * 0.22;     // (below the shares, above GAG's name and the axis's)
      if (kA[0] > 0.01) {
        const ky = k1;
        ctx.globalAlpha = show * kA[0]; ctx.strokeStyle = keyC; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(sx0, ky); ctx.lineTo(sx0 + 16, ky); ctx.stroke();
        label('rigid (CP)', sx0 + 22, ky, 'left', keyC, kA[0]);
      }
      if (kA[1] > 0.01) {                                    // a small filled peak
        const ky = k1 + 14;
        ctx.globalAlpha = show * kA[1]; ctx.beginPath(); ctx.moveTo(sx0, ky + 5); ctx.quadraticCurveTo(sx0 + 8, ky - 9, sx0 + 16, ky + 5); ctx.closePath();
        ctx.fillStyle = rgba(keyC, 0.3); ctx.fill(); ctx.strokeStyle = keyC; ctx.lineWidth = 1.2; ctx.stroke();
        label('mobile (DP)', sx0 + 22, ky, 'left', keyC, kA[1]);
      }
    }

    // each polysaccharide's share, on a leader from its peak (β and α to either side of their close pair)
    const names = big ? { b: 'β-glucan', a: 'α-glucan', c: 'chitin' } : { b: 'β', a: 'α', c: 'chitin' }, pct = big ? ' %' : '%';   // (tighter on the phone sizes)
    const lab = between(s, SPEC_IN[1] - 0.3, SPEC_IN[1] + 0.2);
    const up1 = between(s, TO_SWOLLEN[1] - 0.4, TO_SWOLLEN[1]) * (1 - between(s, TO_GERM[0], TO_GERM[0] + 0.3)), up2 = between(s, TO_GERM[1] - 0.4, TO_GERM[1]);
    const arrow = key => (key === 'c' ? null : [[up1, key === 'a' ? '↑' : '↓'], [up2, key === 'a' ? '↓' : '↑']]);
    const tag = (key, ppm, x, align) => {
      const yTop = Y(rigid(ppm, f)) - 3, text = `${names[key]} ${Math.round(f[key])}${pct}`, colour = key === 'c' ? th.ink : key === 'a' ? th.fid : th.spec;
      const arrows = arrow(key);
      label(text, x, rowY, align, colour, lab);
      if (arrows) arrows.forEach(([a, glyph]) => {             // before a right-aligned label, after a left-aligned one
        const gx = align === 'right' ? x - Anim.measure(ctx, th, text) - 4 : x + Anim.measure(ctx, th, text) + 4;
        label(glyph, gx, rowY, align === 'right' ? 'right' : 'left', colour, lab * a);
      });
      ctx.globalAlpha = show * lab * 0.7; ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(align === 'right' ? x + 2 : align === 'left' ? x - 2 : x, rowY + 7); ctx.lineTo(X(ppm), Math.max(rowY + 8, yTop)); ctx.stroke();
    };
    const bName = `↓ ${names.b} 67${pct}`, bx = Math.max(sx0 + Anim.measure(ctx, th, bName), X(105.8) - 8);   // (kept inside the panel, arrow and all)
    tag('b', 105.8, bx, 'right');
    tag('a', 103.2, Math.max(X(103.2) + 8, bx + 12), 'left');
    tag('c', 57.2, Math.min(X(57.2), sx1 - Anim.measure(ctx, th, `${names.c} 12${pct}`) / 2), 'center');
    const gl = between(s, TO_GERM[0] + 0.8, TO_GERM[1] + 0.3);
    if (gl > 0.01 && !big) label('GAG', sx0, rowY + 20, 'left', nowC, gl);
    if (gl > 0.01 && big) label('GAG', X(GAG[0][0]) - 5, Y(mobile(GAG[0][0], gagNow)) - 2, 'right', nowC, gl);   // (by its first peak)

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    const heads = [['Solid-state NMR of the intact ', 'Aspergillus', ' spore'], ['NMR of the intact ', 'Aspergillus', ' spore'], ['Intact ', 'Aspergillus', ' spore'], ['', 'Aspergillus', ' spore']];
    const font = italic => `${italic ? 'italic ' : ''}12px ${th.mono}`;   // (the genus in italics)
    const widthOf = parts => parts.reduce((q, part, i) => { ctx.font = font(i === 1); return q + ctx.measureText(part).width; }, 0);
    const head = heads.find(parts => widthOf(parts) <= room) || heads[heads.length - 1];
    ctx.globalAlpha = show; ctx.fillStyle = th.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let hx = pad;
    head.forEach((part, i) => { ctx.font = font(i === 1); ctx.fillText(part, hx, ly + 0.5); hx += ctx.measureText(part).width; });
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
