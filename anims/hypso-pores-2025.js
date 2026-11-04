/* ==========================================================================
   hypso-pores-2025: inside a pore.
   A pore through a HYPSO silica sphere, seen from the side. TEMPO radicals
   (green) sit on its walls; the frozen acetate solution fills it.
   Microwaves polarise the ¹H next to the walls and spin diffusion carries it
   inward; cross polarisation hands it to the ¹³C of the acetate (orange);
   hot D₂O then melts the sample and the molecules escape. Each one is either
   still hyperpolarised (orange) or has relaxed (grey ring), and from the end
   of CP until it leaves the pore its odds fade, fastest near the radical-
   lined walls. The 4 nm pores start with more hyperpolarised (more TEMPO, and
   nothing far from it) but, with every molecule close to a wall, lose more on
   the way out; the 28 nm pores keep about 1.5 times as much of theirs, with
   half the TEMPO, so both arrive about level.
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const TAU = Math.PI * 2;

  /* ---- the two pores (from the paper's optimal samples) ---- */
  const PORES = [
    { nm: 4, tempo: 34, fill: 1.2, reach: 1, count: 60 },     // HYPSO 5-4-34
    { nm: 28, tempo: 18, fill: 2.1, reach: 0.8, count: 210 }  // HYPSO 5-28-18: ¹H builds up more slowly, and less far in
  ];

  /* ---- timing (seconds into the loop): a round in each pore, then the comparison ---- */
  const CYCLE = 25.5;
  const ROUND = [0, 11.3];              // the second round starts 11.3 s after the first
  const MW = [1.8, 4.0];                // microwaves on (within a round), after a moment to see the frozen pore
  const CP = [4.1, 4.9];                // cross polarisation, ¹H → ¹³C; from its end, polarisation starts to fade
  const MELT = [5.5, 6.2];              // hot D₂O arrives; the sample melts
  const GO = 5.9;                       // molecules start to leave
  const CROSS = 2.4;                    // seconds to travel the whole length of the pore
  const WIDEN = [10.1, 11.3];           // the pore widens from 4 to 28 nm
  const SUMMARY = [21.5, 22.1, 24.1, 24.7];
  const NARROW = [24.3, 25.4];          // back to 4 nm
  const STILL = 22.7;

  // a steady pseudo-random sequence
  const rand = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  // the molecules in each pore: where they sit (along the pore 0–1, across it in nm), and where they settle outside
  const MOLECULES = PORES.map((p, k) => {
    const r = rand(17 + k * 101), n = p.count, out = [];
    for (let i = 0; i < n; i++) {
      const across = (r() - 0.5) * (p.nm - 1.2);
      out.push({ along: 0.04 + 0.92 * r(), across, wall: p.nm / 2 - Math.abs(across), late: 0.6 * r(), cx: r(), cy: r(), chance: r() });
    }
    return out;
  });
  /* ---- each molecule's odds of being hyperpolarised ----
     Each molecule either is hyperpolarised (orange) or has relaxed (grey); a pore's polarisation level is the share
     still orange. Set to the paper: the 4 nm pores start higher (¹³C after CP 1 : 0.67, Table 2) but lose more on
     the way out (the 28 nm pores keep about 1.5 times as much), so both arrive about level (liquid ¹³C 16 %, Table 3). */
  const near = d => Math.exp(-d / 0.9);  // how near a radical-lined wall, at d nm from it
  const QUENCH_CP = 0.45;                // less ¹³C from CP right by the wall (the paper: paramagnetic shifts there)
  const REACH = 12;                      // nm: ¹H polarisation spreads in from the walls, so a wide pore's middle gets less
  const LOSS_SOLID = 0.5, LOSS_LIQUID = 1.0, LOSS_ANY = 0.09;   // per second: near a wall while frozen, near a wall once melted, anywhere
  const atCP = m => (1 - QUENCH_CP * near(m.wall)) * Math.exp(-m.wall / REACH);
  const leaves = m => GO + m.late + CROSS * (1 - m.along);      // when (in the round) it gets out of the pore
  // from the moment the RF stops until it leaves the pore, a molecule's polarisation fades
  const odds = (m, u) => {
    const wallLoss = Math.exp(-m.wall / 1.0), stop = Math.min(u, leaves(m));
    const solid = Math.max(0, Math.min(stop, MELT[0]) - CP[1]), liquid = Math.max(0, stop - MELT[0]);
    return atCP(m) * Math.exp(-(LOSS_SOLID * wallLoss * solid + (LOSS_LIQUID * wallLoss + LOSS_ANY) * liquid));
  };
  // the share polarised after CP, and the share that arrives still hyperpolarised: 4 nm 83 % → 42 %, 28 nm 55 % → 41 %
  const AT_CP = MOLECULES.map(ms => ms.filter(m => atCP(m) > m.chance).length / ms.length);
  const ARRIVE = MOLECULES.map(ms => ms.filter(m => odds(m, 99) > m.chance).length / ms.length);

  /* ---- how the silica is drawn ---- */
  const WALLS = 'network';                 // 'slab' (flat), 'network' (amorphous Si–O, tethered TEMPO) or 'grains' (fused silica particles)
  const textures = new Map();
  // the silica's texture for one panel size and theme, drawn once into a canvas of its own
  function texture(ctx, w, h, top, bot, th) {
    const c = ctx.canvas, key = [WALLS, c.width, c.height, th.ink, th.bg].join('|');
    if (textures.has(key)) return textures.get(key);
    const off = document.createElement('canvas'); off.width = c.width; off.height = c.height;
    const o = off.getContext('2d'); o.setTransform(ctx.getTransform());
    const r = rand(7);
    if (WALLS === 'network') {
      // an amorphous Si–O network: a jittered honeycomb of fine bonds on a pale ground
      o.fillStyle = mix(th.bg, th.ink, 0.05); o.fillRect(0, 0, w, h);
      const sp = Math.max(6, w * 0.02), rows = Math.ceil(h / (sp * 0.866)) + 2, cols = Math.ceil(w / sp) + 2, P = [];
      for (let j = 0; j < rows; j++) { P.push([]); for (let i = 0; i < cols; i++) P[j].push([i * sp + (j % 2) * sp / 2 + (r() - 0.5) * 0.4 * sp, j * sp * 0.866 + (r() - 0.5) * 0.4 * sp]); }
      o.strokeStyle = mix(th.bg, th.ink, 0.26); o.lineWidth = 0.8; o.beginPath();
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const a = P[j][i], link = b => { if (b && r() > 0.12) { o.moveTo(a[0], a[1]); o.lineTo(b[0], b[1]); } };
        link(P[j][i + 1]);
        if (P[j + 1]) { link(P[j + 1][i + (j % 2 ? 1 : 0)]); link(P[j + 1][i - (j % 2 ? 0 : 1)]); }
      }
      o.stroke();
      o.fillStyle = mix(th.bg, th.ink, 0.36);
      for (const row of P) for (const a of row) { o.beginPath(); o.arc(a[0], a[1], 0.9, 0, TAU); o.fill(); }
    } else {
      // fused silica particles, as silica gel is built, with the gaps between them left open
      const R = Math.max(5, w * 0.022), placed = [];
      for (let k = 0; k < 4000 && placed.length < 900; k++) {
        const q = { x: r() * w, y: top - 10 + r() * (bot - top + 20), r: R * (0.55 + 0.45 * r()) };
        if (placed.every(p => Math.hypot(p.x - q.x, p.y - q.y) > (p.r + q.r) * 0.86)) placed.push(q);
      }
      for (const p of placed) {
        o.beginPath(); o.arc(p.x, p.y, p.r, 0, TAU);
        o.fillStyle = mix(th.bg, th.ink, 0.11); o.fill(); o.strokeStyle = mix(th.bg, th.ink, 0.3); o.lineWidth = 0.8; o.stroke();
      }
    }
    textures.set(key, off);
    return off;
  }

  const sine = (ctx, x0, x1, y, amp, waves, phase) => {
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 1.5) { const u = (x - x0) / (x1 - x0); ctx[x === x0 ? 'moveTo' : 'lineTo'](x, y + amp * Math.sin(TAU * waves * u - phase)); }
    ctx.stroke();
  };

  Anim.register('hypso-pores-2025', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE;
    const second = s >= ROUND[1] && s < NARROW[0];            // which pore the molecules belong to
    const k = second ? 1 : 0, P = PORES[k], u = s - (second ? ROUND[1] : 0);   // time within the round
    const nm = 4 + 24 * between(s, ...WIDEN) * (1 - between(s, ...NARROW)); // the pore's width now
    const summary = envelope(s, SUMMARY);

    /* ---- layout ---- */
    const pad = Math.max(14, w * 0.05), ly = pad + 6;
    const barH = Math.max(7, h * 0.022), caption = w >= 400;
    const meterH = 2 * barH + 6 + (caption ? 18 : 0);
    const top = ly + 16, bot = h - pad - meterH - 8;
    const cy = (top + bot) / 2, pxNm = ((bot - top) * 0.82) / 28, half = (nm * pxNm) / 2;
    const x0 = 0, mouth = pad + 0.6 * (w - 2 * pad), len = mouth - pad;
    const rr = Math.max(1.3, Math.min(2.8, w * 0.0048));

    /* ---- the pore's walls wander, and so does the sphere's outer surface ---- */
    const bend = Math.min((0.08 * nm + 0.3) * pxNm, 0.05 * (bot - top)), swell = Math.min(0.06 * nm * pxNm, 0.035 * (bot - top));   // (capped: the walls stay inside the frame)
    const mid = x => cy + bend * (0.65 * Math.sin((TAU * 1.1 * x) / w + 0.4) + 0.35 * Math.sin((TAU * 2.6 * x) / w + 2.0));
    const wid = x => half + swell * (0.6 * Math.sin((TAU * 1.9 * x) / w + 1.3) + 0.4 * Math.sin((TAU * 4.1 * x) / w + 0.2));
    const yT = x => mid(x) - wid(x), yB = x => mid(x) + wid(x);   // the top and bottom walls
    const xM = y => mouth + Math.max(1.5, w * 0.007) * Math.sin((TAU * 2.2 * (y - top)) / (bot - top) + 0.8);   // the outer surface
    const step = Math.max(3, w / 160);
    const curve = (c, f, xa, xb) => { if (xa <= xb) for (let x = xa; x <= xb + 0.01; x += step) c.lineTo(Math.min(x, xb), f(Math.min(x, xb))); else for (let x = xa; x >= xb - 0.01; x -= step) c.lineTo(Math.max(x, xb), f(Math.max(x, xb))); };
    const endT = xM(yT(mouth)), endB = xM(yB(mouth));
    const bead = c => {                                    // inside the sphere: everything left of its outer surface
      c.moveTo(x0, top - 6);
      for (let y = top - 6; y <= bot + 6.01; y += step) c.lineTo(xM(y), y);
      c.lineTo(x0, bot + 6); c.closePath();
    };
    const surface = (c, ya, yb) => { if (ya <= yb) for (let y = ya; y <= yb + 0.01; y += step) c.lineTo(xM(Math.min(y, yb)), Math.min(y, yb)); else for (let y = ya; y >= yb - 0.01; y -= step) c.lineTo(xM(Math.max(y, yb)), Math.max(y, yb)); };
    const channel = c => {                                 // the pore (its open end a little beyond the surface; fills are clipped to the bead)
      c.moveTo(x0, yT(x0)); curve(c, yT, x0, endT);
      for (let y = yT(endT); y <= yB(endB) + 0.01; y += step) c.lineTo(xM(Math.min(y, yB(endB))) + 4, Math.min(y, yB(endB)));
      curve(c, yB, endB, x0); c.closePath();
    };
    const inBead = draw => { ctx.save(); ctx.beginPath(); bead(ctx); ctx.clip(); draw(); ctx.restore(); };

    /* ---- outside the sphere: hot D₂O, once it arrives ---- */
    const melt = second ? between(u, ...MELT) * (1 - between(s, SUMMARY[2], SUMMARY[3]))
                        : between(u, ...MELT) * (1 - between(s, WIDEN[0], WIDEN[0] + 0.6));
    if (melt > 0.01) {
      ctx.globalAlpha = 0.09 * melt; ctx.fillStyle = th.fid;
      ctx.save(); ctx.beginPath(); ctx.rect(x0, top - 6, w, bot - top + 12); bead(ctx); ctx.clip('evenodd');   // outside the bead only
      ctx.fillRect(x0, top - 6, w, bot - top + 12); ctx.restore();
      inBead(() => { ctx.beginPath(); channel(ctx); ctx.fill(); });
      ctx.globalAlpha = 1;
    }

    /* ---- the frozen sample in the pore, and its ¹H polarisation spreading in from the walls ---- */
    const frozen = 1 - melt;
    if (frozen > 0.01) inBead(() => { ctx.globalAlpha = frozen; ctx.fillStyle = mix(th.bg, th.fid, 0.07); ctx.beginPath(); channel(ctx); ctx.fill(); ctx.globalAlpha = 1; });
    const spread = P.reach * between(u, MW[0] + 0.3, MW[0] + 0.3 + P.fill) * frozen * (1 - 0.35 * between(u, CP[1], MELT[0])) * (s < WIDEN[0] || second ? 1 : 0);
    if (spread > 0.01) {
      inBead(() => {
        // ten bands from each wall inward, each a little lighter: brightest towards the walls
        ctx.fillStyle = rgba(th.spec, 0.043);
        for (let b = 1; b <= 10; b++) {
          const f = (spread * b) / 10;
          for (const [wall, sgn] of [[yT, 1], [yB, -1]]) {
            const inner = x => wall(x) + sgn * f * (yB(x) - yT(x)) / 2;
            ctx.beginPath(); ctx.moveTo(x0, wall(x0)); curve(ctx, wall, x0, mouth + 6); curve(ctx, inner, mouth + 6, x0); ctx.closePath(); ctx.fill();
          }
        }
        // ... but right by the radicals the ¹H are quenched (shifted out of view): a dimmer layer about 0.9 nm deep
        ctx.fillStyle = mix(th.bg, th.fid, 0.07);
        for (const [q, a] of [[0.9, 0.35], [0.45, 0.35]]) {
          ctx.globalAlpha = a * spread;
          for (const [wall, sgn] of [[yT, 1], [yB, -1]]) {
            const inner = x => wall(x) + sgn * Math.min(q * pxNm, 0.45 * (yB(x) - yT(x)));
            ctx.beginPath(); ctx.moveTo(x0, wall(x0)); curve(ctx, wall, x0, mouth + 6); curve(ctx, inner, mouth + 6, x0); ctx.closePath(); ctx.fill();
          }
        }
        ctx.globalAlpha = 1;
      });
    }

    /* ---- the silica: its network, the pore's walls, and the sphere's outer surface ---- */
    const tempo = 34 + (18 - 34) * (nm - 4) / 24, gap = Math.max(8, w * 0.026) * (34 / tempo);
    const silica = c => {                                  // above the pore and below it: each bounded by its wall and the surface
      c.beginPath();
      c.moveTo(x0, top - 6); surface(c, top - 6, yT(endT)); curve(c, yT, endT, x0); c.closePath();
      c.moveTo(x0, bot + 6); surface(c, bot + 6, yB(endB)); curve(c, yB, endB, x0); c.closePath();
    };
    if (WALLS === 'slab') {
      ctx.fillStyle = mix(th.bg, th.ink, 0.1); silica(ctx); ctx.fill();
    } else {
      const tex = texture(ctx, w, h, top, bot, th);       // (made at this canvas's own scale)
      ctx.save(); silica(ctx); ctx.clip();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(tex, 0, 0);
      ctx.restore();
    }
    ctx.strokeStyle = th.ink; ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x0, yT(x0)); curve(ctx, yT, x0, endT);
    for (let y = yT(mouth); y >= top - 6; y -= step) ctx.lineTo(xM(y), y);
    ctx.moveTo(x0, yB(x0)); curve(ctx, yB, x0, endB);
    for (let y = yB(mouth); y <= bot + 6; y += step) ctx.lineTo(xM(y), y);
    ctx.stroke();
    // TEMPO on the walls (fewer per volume in the wider pore): as tethered molecules where there is room, else dots
    const tether = WALLS === 'network' && pxNm >= 4;
    for (const [wall, sgn] of [[yT, -1], [yB, 1]]) {
      let n = 0;
      for (let x = x0 + gap * (sgn > 0 ? 0.5 : 0.1) + 4; x < mouth - 6; x += gap, n++) {
        const wy = wall(x);
        if (!tether) { ctx.fillStyle = th.green; ctx.beginPath(); ctx.arc(x, wy, rr * 1.25, 0, TAU); ctx.fill(); continue; }
        // a short linker out of the wall (square to it), the TEMPO ring on its end, and the N–O• radical at the ring's tip
        const slope = (wall(x + 1) - wall(x - 1)) / 2, nl = Math.hypot(slope, 1);
        const nx = (sgn * slope) / nl, ny = -sgn / nl, tilt = n % 2 ? 0.35 : -0.35;
        const dx = nx * Math.cos(tilt) - ny * Math.sin(tilt), dy = nx * Math.sin(tilt) + ny * Math.cos(tilt);
        const L = 0.55 * pxNm, ring = Math.max(2, 0.24 * pxNm);
        const ex = x + dx * L, ey = wy + dy * L, rx = ex + dx * ring, ry = ey + dy * ring;
        ctx.strokeStyle = mix(th.bg, th.ink, 0.6); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, wy); ctx.lineTo(x + dx * L * 0.5 + dy * 0.8, wy + dy * L * 0.5 - dx * 0.8); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.beginPath();
        for (let q = 0; q < 6; q++) { const a = Math.atan2(dy, dx) + Math.PI + (q * TAU) / 6; ctx[q ? 'lineTo' : 'moveTo'](rx + ring * Math.cos(a), ry + ring * Math.sin(a)); }
        ctx.closePath(); ctx.fillStyle = th.surface; ctx.fill(); ctx.strokeStyle = th.ink; ctx.stroke();
        ctx.fillStyle = th.green; ctx.beginPath(); ctx.arc(rx + dx * ring, ry + dy * ring, Math.max(1.6, 0.14 * pxNm), 0, TAU); ctx.fill();
      }
    }
    // name TEMPO while there is room above the pore, on a plate of the background so the network doesn't show through
    const tagY = Math.min(yT(pad), yT(pad + 40)) - 16;
    if (nm < 6 && tagY - (top - 6) > 12) {
      const tw = Anim.measure(ctx, th, 'TEMPO');
      ctx.fillStyle = th.bg; ctx.globalAlpha = 0.92;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(pad - 4, tagY - 9, tw + 8, 18, 3); else ctx.rect(pad - 4, tagY - 9, tw + 8, 18); ctx.fill();
      ctx.globalAlpha = 1;
      Anim.label(ctx, th, 'TEMPO', pad, tagY, 'left', th.green);
    }

    /* ---- microwaves, then the CP pulse, along the top ---- */
    const mw = envelope(u, [MW[0], MW[0] + 0.3, MW[1] - 0.3, MW[1]]) * (s < WIDEN[0] || second ? 1 : 0);
    const rf = envelope(u, [CP[0], CP[0] + 0.15, CP[1] - 0.25, CP[1]]) * (s < WIDEN[0] || second ? 1 : 0);
    const wy = top + 12, wx0 = mouth + Math.max(10, w * 0.03), wl = Math.max(Anim.measure(ctx, th, 'μw'), Anim.measure(ctx, th, 'RF')) + 6;
    const wx1 = w - pad, waves = Math.max(2, Math.round((wx1 - wx0 - wl) / Math.max(14, w * 0.035)));
    if (mw > 0.01) { ctx.globalAlpha = mw; ctx.strokeStyle = th.fid; ctx.lineWidth = 1.4; sine(ctx, wx0 + wl, wx1, wy, 3, waves, -TAU * 1.5 * s); Anim.label(ctx, th, 'μw', wx0, wy, 'left', th.fid); }
    if (rf > 0.01) { ctx.globalAlpha = rf; ctx.strokeStyle = th.red; ctx.lineWidth = 1.6; sine(ctx, wx0 + wl, wx1, wy, 4, waves * 2, 0); Anim.label(ctx, th, 'RF', wx0, wy, 'left', th.red); }
    ctx.globalAlpha = 1;

    /* ---- the molecules: grey until CP lights them; then out of the pore, dimming near the walls ---- */
    const lit = between(u, CP[0] + 0.2, CP[1]);
    const showMol = second ? 1 - between(s, SUMMARY[2], SUMMARY[3]) : 1 - between(s, WIDEN[0], WIDEN[0] + 0.3);
    const fresh = second ? between(s, ROUND[1], ROUND[1] + 0.4) : between(s, 0, 0.4);
    const outX0 = mouth + 14, outX1 = w - pad, outY0 = top + 10, outY1 = bot - 4;
    let kept = 0;
    const mols = MOLECULES[k], speed = len / CROSS;
    // a molecule keeps its place across the pore as the pore wanders
    const across = (m, x) => (yT(x) + yB(x)) / 2 + (m.across / Math.max(0.6, P.nm / 2 - 0.6)) * Math.max(0, (yB(x) - yT(x)) / 2 - rr - 1);
    for (const m of mols) {
      const xh = mouth - len * (1 - m.along);
      const start = GO + m.late, inside = (mouth - xh) / speed;
      const moving = Math.max(0, u - start);
      let x, y;
      if (moving < inside) { x = xh + speed * moving; y = across(m, x); }
      else {
        const v = ease(Math.min(1, (moving - inside) / 1.1)), y0 = across(m, mouth);
        const tx = outX0 + (outX1 - outX0) * m.cx, ty = outY0 + (outY1 - outY0) * m.cy;
        x = mouth + (tx - mouth) * v; y = y0 + (ty - y0) * v;
      }
      const p = lit * ease((odds(m, u) - m.chance) / 0.1 + 0.5);   // 1: hyperpolarised, 0: relaxed
      if (moving >= inside) kept += p;
      const a = showMol * fresh;
      if (a < 0.01) continue;
      // hyperpolarised: a solid orange dot; relaxed: a hollow grey ring
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, TAU);
      ctx.strokeStyle = mix(mix(th.bg, th.ink, 0.5), th.spec, p); ctx.lineWidth = Math.max(1, rr * 0.5); ctx.stroke();
      if (p > 0.01) { ctx.globalAlpha = a * p; ctx.fillStyle = th.spec; ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    const fraction = kept / mols.length;

    /* ---- the meters, centred in the space below the bead: how much ¹³C polarisation got out of each pore ---- */
    const spaceTop = bot + 6, blockTop = spaceTop + (h - spaceTop - meterH) / 2;
    const mTop = blockTop + (caption ? 18 : 0);
    const lw = Anim.measure(ctx, th, '28 nm') + 10, bx = pad + lw, bw = (w - 2 * pad - lw) * 0.74;
    // the key (orange: still hyperpolarised; grey ring: relaxed), and what the bars show, as fits
    let keyW = 0;
    if (caption) {
      const words = [['relaxed', false], ['hyperpolarised', true]];
      keyW = words.reduce((a, [wd]) => a + Anim.measure(ctx, th, wd) + 2 * rr + 20, 0);
      let kx = w - pad;
      for (const [word, solid] of words) {
        kx -= Anim.measure(ctx, th, word);
        Anim.label(ctx, th, word, kx, blockTop + 7, 'left', th.muted);
        ctx.beginPath(); ctx.arc(kx - rr - 5, blockTop + 7, rr, 0, TAU);
        if (solid) { ctx.fillStyle = th.spec; ctx.fill(); } else { ctx.strokeStyle = mix(th.bg, th.ink, 0.5); ctx.lineWidth = Math.max(1, rr * 0.5); ctx.stroke(); }
        kx -= 2 * rr + 20;
      }
      const words2 = ['¹³C polarised: after CP → detection', '¹³C polarised'];
      Anim.label(ctx, th, words2.find(x => Anim.measure(ctx, th, x) + keyW + 12 <= w - 2 * pad) || words2[1], pad, blockTop + 7, 'left', th.muted);
    }
    // for each pore: pale, the share polarised after CP; solid, the share still hyperpolarised at detection
    const gone = 1 - between(s, SUMMARY[2], SUMMARY[3]);
    const atcp = [second ? AT_CP[0] * gone : s < NARROW[0] ? AT_CP[0] * lit : 0, second ? AT_CP[1] * lit * gone : 0];
    const vals = second ? [ARRIVE[0] * gone, fraction * gone] : [s < NARROW[0] ? fraction : 0, 0];
    ['4 nm', '28 nm'].forEach((name, i) => {
      const y = mTop + i * (barH + 6);
      Anim.label(ctx, th, name, pad, y + barH / 2, 'left', (i === k && !summary) ? th.ink : th.soft);
      ctx.strokeStyle = th.rule; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, y + 0.5, bw - 1, barH - 1);
      if (atcp[i] > 0.002) { ctx.fillStyle = rgba(th.spec, 0.28); ctx.fillRect(bx, y, bw * atcp[i], barH); }
      if (vals[i] > 0.002) { ctx.fillStyle = th.spec; ctx.fillRect(bx, y, bw * vals[i], barH); }
      // at the end: how much each lost on the way out
      if (summary > 0.01) {
        ctx.globalAlpha = summary; ctx.fillStyle = th.ink; ctx.font = `12px ${th.mono}`;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(`−${Math.round(100 * (1 - ARRIVE[i] / AT_CP[i]))} %`, bx + bw + 8, y + barH / 2 + 0.5);
        ctx.globalAlpha = 1;
      }
    });

    /* ---- top left: frozen (a snowflake) or liquid (waves), then the stage ---- */
    const icon = 13, lx = pad + icon + 7;
    const flake = 1 - melt;
    ctx.strokeStyle = th.fid; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    if (flake > 0.01) {
      ctx.globalAlpha = flake;
      const c = [pad + icon / 2, ly], R = icon / 2;
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 2 + (k * TAU) / 6, ex = c[0] + R * Math.cos(a), ey = c[1] - R * Math.sin(a);
        ctx.moveTo(c[0], c[1]); ctx.lineTo(ex, ey);
        const bx2 = c[0] + 0.55 * R * Math.cos(a), by2 = c[1] - 0.55 * R * Math.sin(a);
        for (const t2 of [-0.7, 0.7]) ctx.moveTo(bx2, by2), ctx.lineTo(bx2 + 0.35 * R * Math.cos(a + t2), by2 - 0.35 * R * Math.sin(a + t2));
      }
      ctx.stroke();
    }
    if (melt > 0.01) {
      ctx.globalAlpha = melt;
      for (const dy of [-2.6, 2.6]) {
        ctx.beginPath();
        for (let q = 0; q <= icon; q += 1) ctx[q ? 'lineTo' : 'moveTo'](pad + q, ly + dy + 1.6 * Math.sin((TAU * q) / (icon / 1.5)));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    /* ---- labels: the stage, and the pore ---- */
    const room = w - pad - lx;
    const pair = (alpha, left, right, rightColour) => {
      if (alpha < 0.01) return;
      ctx.globalAlpha = alpha;
      let L = null, R = null;
      for (const l of left) { R = right.find(r => Anim.measure(ctx, th, l) + Anim.measure(ctx, th, r) + 16 <= room); if (R) { L = l; break; } }
      Anim.label(ctx, th, L || left.find(x => Anim.measure(ctx, th, x) <= room) || left[left.length - 1], lx, ly, 'left', th.ink);
      if (R) Anim.label(ctx, th, R, w - pad, ly, 'right', rightColour);
      ctx.globalAlpha = 1;
    };
    const roundOn = summary < 0.5 && !(s > WIDEN[0] && s < WIDEN[1]) && s < NARROW[0];
    const pore = [`${P.nm} nm pores · TEMPO ${P.tempo} μmol cm⁻³`, `${P.nm} nm · ${P.tempo} μmol cm⁻³`, `${P.nm} nm pores`];
    const stage = u < MW[0] ? ['frozen in the pore', 'frozen'] : u < CP[0] - 0.05 ? ['microwaves · ¹H DNP', '¹H DNP'] : u < MELT[0] ? ['CP · ¹H → ¹³C', 'CP'] : ['dissolution', 'melt'];
    if (roundOn) pair(second ? 1 : between(s, 0, 0.4), stage, pore, th.soft);
    if (s > WIDEN[0] && s < WIDEN[1]) pair(1, ['wider pores', 'wider'], ['4 → 28 nm'], th.soft);
    pair(summary, ['28 nm vs 4 nm', '28 vs 4 nm'], [], th.spec);
    if (summary > 0.01) {                                  // the conclusion, large, in the emptied pore
      const size = Math.max(13, Math.min(22, w * 0.034)), lines = ['same ¹³C', '1.5× less loss', '½ the TEMPO'];
      const xc = (x0 + mouth) / 2, yc = mid(xc), step2 = size * 1.45;
      ctx.globalAlpha = summary; ctx.fillStyle = th.spec; ctx.textBaseline = 'middle';
      lines.forEach((line, i) => Plot.text(ctx, line, xc, yc + (i - 1) * step2, { size, family: th.mono, align: 'center' }));
      ctx.globalAlpha = 1;
    }
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
