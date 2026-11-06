/* ==========================================================================
   bolaamphiphile-gels-2021: from a gel into the membrane.
   GNBA-F is a bolaamphiphile: two glycosyl-nucleoside heads (16 Å each) on
   a rigid, highly fluorinated core (20 Å). Its structure is drawn first,
   as in the paper's Fig. 1 (each head a glucose, triazole, thymine and
   deoxyribose, in blue; the core a triazole, CH2–O–CH2 and (CF2)8 chain,
   in green), then squeezed into Fig. 1's dumbbell (blue heads, green
   core). It self-assembles into the nanofibres of a supramolecular gel
   (each fibre drawn as a ladder of molecules stacked side by side), while
   a readout shows its 19F solution NMR signal at 310 K fading over 10 h
   (read off Fig. 2A; ending on "gel"): the signal comes from free,
   tumbling molecules, so it goes as they lock into the gel, and each
   molecule joins its fibre as the signal passes its turn. At 37 °C,
   unlike its relatives, it keeps single molecules in equilibrium with the
   gel (its transition is at ~304 K, against ~343 K for GNF; Fig. 2B).
   They leave the gel, drift to a cell membrane and, being rigid and about
   as long as the bilayer is thick, slide in to span it (Fig. 4C). The
   lipid membrane is disrupted: the lipids' 13C ssNMR signal (INEPT, DMPC
   liposomes) falls to about half within 16 h (read off Fig. 3C; ending on
   "disrupted"). Both signals fall as molecules lose their mobility, but
   they mean opposite things. The membrane blebs: cancer (HeLa) cells die
   by apoptosis (Fig. 4A–B).
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp01 = u => Math.max(0, Math.min(1, u));
  const TAU = Math.PI * 2;

  // the lipids' 13C solid-state NMR (INEPT) signal after GNBA-F is added: [hours, fraction of the start], read off Fig. 3C
  const SIGNAL = [[0, 1.0], [1, 0.96], [1.6, 0.86], [2.5, 0.77], [3.5, 0.73], [4.5, 0.68], [6, 0.66], [7.5, 0.62], [9, 0.61], [11, 0.59], [13, 0.57], [14.5, 0.54], [16, 0.51]];
  const HOURS = 16;
  // GNBA-F's 19F NMR signal (liquid state, 310 K) as it gels: [hours, fraction of the start], read off Fig. 2A. The
  // signal comes from free, tumbling molecules, so it fades as they lock into the gel's fibres
  const GEL = [[0, 1.0], [0.5, 0.97], [1, 0.955], [1.5, 0.95], [2, 0.92], [2.5, 0.9], [3, 0.88], [3.25, 0.86], [3.5, 0.82], [3.75, 0.77], [4, 0.71], [4.2, 0.63], [4.4, 0.55], [4.6, 0.46], [4.8, 0.37], [5, 0.29], [5.25, 0.22], [5.5, 0.16], [5.75, 0.11], [6, 0.075], [6.5, 0.035], [7, 0.015], [8, 0.008], [10, 0.005]];
  const GEL_HOURS = 10;
  const valueAt = (data, hr) => { for (let i = 1; i < data.length; i++) if (hr <= data[i][0]) { const [a, va] = data[i - 1], [b, vb] = data[i]; return lerp(va, vb, (hr - a) / (b - a)); } return data[data.length - 1][1]; };
  // the hour by which a fraction f of the molecules has gelled (the signal has fallen to 1 − f)
  const gelledBy = f => { for (let hr = 0; hr <= GEL_HOURS; hr += 0.02) if (1 - valueAt(GEL, hr) >= f) return hr; return GEL_HOURS; };

  // the gel: three nanofibres, each a ladder of molecules stacked side by side across it: centre (fractions of the gel's
  // box), angle, and how many molecules
  const FIBRES = [[0.45, 0.55, -0.35, 12], [0.3, 0.45, 1.1, 7], [0.75, 0.42, 0.6, 8]];
  const INTRO = [0, 6];                                    // the molecule shown first, large: fibre 0's seventh
  // the molecules that leave the gel at 37 °C: their fibre and place on it, where each enters the membrane (across the
  // panel), and when it sets off
  const LEAVERS = [[2, 7, 0.56, 15.5], [1, 6, 0.36, 16.2], [0, 0, 0.18, 16.9], [0, 11, 0.76, 17.6]];
  const DRIFT = 2.4, SLIDE = 0.7;                          // seconds to drift to the membrane, then to slide in
  // every molecule in the gel: where it floats before it assembles, and the hour (on Fig. 2A's clock) it joins its fibre:
  // each takes its turn as the 19F signal falls, so the gel grows as the signal goes
  const MOLS = (() => {
    const rand = Anim.seeded(11), out = [];
    FIBRES.forEach(([, , , n], f) => { for (let j = 0; j < n; j++) out.push({ f, j, fx: rand(), fy: rand(), fa: rand() * TAU, hr: gelledBy(0.03 + 0.94 * rand()), ph: rand() * TAU }); });
    return out;
  })();
  const LIPID_PH = (() => { const rand = Anim.seeded(5); return Array.from({ length: 400 }, () => rand() * TAU); })();

  /* ---- GNBA-F's structure (as in Fig. 1), for the opening, in bond lengths: built from the middle of the fluorinated
     chain out to the left (CF2 ×4, CH2, O, CH2, a triazole: green; then the deoxyribose, thymine, a triazole and the
     glucose: blue), then turned half a turn about the middle for the right half ---- */
  const STRUCT = (() => {
    const at = [], bd = [], R5 = 1 / (2 * Math.sin(Math.PI / 5));
    const D = deg => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
    const atom = (x, y, el, head) => (at.push({ x, y, el, head }), at.length - 1);
    const bond = (a, b, order = 1, ring = null) => bd.push({ a, b, order, ring });
    const add = (a, deg, el = '', order = 1, len = 1, head = at[a].head) => { const [dx, dy] = D(deg); const b = atom(at[a].x + dx * len, at[a].y + dy * len, el, head); bond(a, b, order); return b; };
    // a ring through atom a, whose bond out of the ring at a points along deg; the other atoms' elements going round
    // (turning by dir), and its double bonds as pairs of places round it. out(k): the outward direction at place k
    const ring = (a, deg, els, dir, doubles) => {
      const n = els.length + 1, R = n === 5 ? R5 : 1, [ux, uy] = D(deg), c = { x: at[a].x - R * ux, y: at[a].y - R * uy }, ids = [a];
      for (let k = 1; k < n; k++) { const [dx, dy] = D(deg + (dir * k * 360) / n); ids.push(atom(c.x + R * dx, c.y + R * dy, els[k - 1], at[a].head)); }
      for (let k = 0; k < n; k++) bond(ids[k], ids[(k + 1) % n], doubles.some(([p, q]) => (p === k && q === (k + 1) % n) || (q === k && p === (k + 1) % n)) ? 2 : 1, c);
      return { ids, out: k => deg + (dir * k * 360) / n };
    };
    // the fluorinated chain's left half, zigzagging left from the middle: four CF2, each with a fluorine up and down
    let c = atom(-0.433, 0.25, '', false);
    for (let i = 0; i < 4; i++) { add(c, 270, 'F', 1, 0.8); add(c, 90, 'F', 1, 0.8); c = add(c, i % 2 ? 150 : 210); }
    const o = add(c, 210, 'O'), m = add(o, 150), t = add(m, 210);   // CH2, O, CH2, to the triazole's C4
    const T1 = ring(t, 30, ['', 'N', 'N', 'N'], 1, [[0, 1], [3, 4]]);
    // the head (blue): C5′ and the deoxyribose (its OH up), thymine (two C=O, a methyl), a CH2, a triazole, the glucose
    const c5 = add(T1.ids[2], T1.out(2), '', 1, 1, true), c4 = add(c5, 215);
    const S = ring(c4, 35, ['O', '', '', ''], 1, []);
    add(S.ids[4], S.out(4), 'OH');
    const n1 = add(S.ids[2], S.out(2), 'N');
    const Ty = ring(n1, S.out(2) - 180, ['', 'N', '', '', ''], 1, [[4, 5]]);
    add(Ty.ids[1], Ty.out(1), 'O', 2); add(Ty.ids[3], Ty.out(3), 'O', 2); add(Ty.ids[4], Ty.out(4));
    const m2 = add(Ty.ids[2], Ty.out(2)), t2 = add(m2, 165);
    const T2 = ring(t2, 345, ['', 'N', 'N', 'N'], 1, [[0, 1], [3, 4]]);
    const g1 = add(T2.ids[2], T2.out(2));
    const G = ring(g1, T2.out(2) - 180, ['', '', '', '', 'O'], 1, []);
    for (const k of [1, 2, 3]) add(G.ids[k], G.out(k), 'OH');
    add(add(G.ids[4], G.out(4)), G.out(4) + 60, 'OH');     // C6, and its OH
    // the right half: the left half turned half a turn about the middle, joined to it there
    const n = at.length;
    for (let i = 0; i < n; i++) at.push({ x: -at[i].x, y: -at[i].y, el: at[i].el, head: at[i].head });
    for (let i = 0, nb = bd.length; i < nb; i++) { const q = bd[i]; bd.push({ a: q.a + n, b: q.b + n, order: q.order, ring: q.ring && { x: -q.ring.x, y: -q.ring.y } }); }
    bd.push({ a: 0, b: n, order: 1, ring: null });
    const xs = at.map(p => p.x), ys = at.map(p => p.y);
    return { at, bd, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  })();
  const BLEBS = [[0.27, 1], [0.66, 0.8]];                  // where the membrane blebs (across the panel), and how much

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 31.4;
  const SHOW = [0, 0.4, 30.8, 31.4];
  const STRUCT_IN = [0.2, 0.8], MORPH = [4.0, 4.8];       // GNBA-F's structure, which then squeezes into the dumbbell ...
  const DIMS = [4.9, 7.0], SHRINK = [7.0, 7.9];            // ... shown with its sizes; then it joins the gel
  const GATHER = [6.9, 7.5], ASSEMBLE = 0.9;               // the others appear; each takes this long to find its place in a fibre
  const GEL_IN = [7.4, 7.8], GEL_RUN = [7.8, 12.8], GEL_OUT = [14.6, 15.0];   // the 19F readout: its 10 h drawn over GEL_RUN, then held
  const MEMBRANE_IN = [14.8, 15.6];
  const READOUT_IN = [18.7, 19.2], HOURS_RUN = [19.2, 24.2];   // the lipid signal, its 16 h drawn over these seconds
  const BLEB = [24.4, 26.8];
  // the headings: GNBA-F, the gel (held a while once it has formed), 37 °C, into the membrane, the membrane effect
  const HEADS = [[0.3, 7.2], [7.4, 15.0], [15.2, 19.0], [19.2, 24.2], [24.4, 30.8]];
  const STILL = 23.6;

  // GNBA-F's structure, bond length b, centred on cx, cy, its heads blue and its core green; k squeezes it into the
  // dumbbell (x into ±L/2, y onto the centre line). letters: the atoms' symbols (the larger panels)
  function structure(ctx, th, cx, cy, b, k, L, letters) {
    const W = (STRUCT.x1 - STRUCT.x0) * b, mx = (STRUCT.x0 + STRUCT.x1) / 2, my = (STRUCT.y0 + STRUCT.y1) / 2;
    const P = p => { const x = (p.x - mx) * b, y = (p.y - my) * b; return [cx + lerp(x, (x * L) / W, k), cy + y * (1 - k)]; };
    const fs = Math.min(11, b * 0.95), lab = p => letters && p.el;
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(0.8, b * 0.09);
    for (const q of STRUCT.bd) {
      const A = STRUCT.at[q.a], B = STRUCT.at[q.b];
      let [x0, y0] = P(A), [x1, y1] = P(B);
      const len = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / len, uy = (y1 - y0) / len;
      const ta = lab(A) ? 0.38 * b : 0, tb = lab(B) ? 0.38 * b : 0;   // stop short of the letters
      x0 += ux * ta; y0 += uy * ta; x1 -= ux * tb; y1 -= uy * tb;
      const cA = A.head ? th.fid : th.green, cB = B.head ? th.fid : th.green;
      const seg = (ax, ay, bx, by) => {                    // (a bond between head and core: half in each colour)
        const hx = (ax + bx) / 2, hy = (ay + by) / 2;
        ctx.strokeStyle = cA; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
        ctx.strokeStyle = cB; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(bx, by); ctx.stroke();
      };
      if (q.order === 1) seg(x0, y0, x1, y1);
      else if (q.ring) {                                   // a ring's double bond: a second, shorter line inside it
        seg(x0, y0, x1, y1);
        const [rx, ry] = P(q.ring), nx = -uy, ny = ux, side = Math.sign((rx - (x0 + x1) / 2) * nx + (ry - (y0 + y1) / 2) * ny) || 1, off = 0.2 * b * side, sh = 0.18 * len;
        seg(x0 + ux * sh + nx * off, y0 + uy * sh + ny * off, x1 - ux * sh + nx * off, y1 - uy * sh + ny * off);
      } else {                                             // C=O: two lines side by side
        const nx = -uy * 0.1 * b, ny = ux * 0.1 * b;
        seg(x0 + nx, y0 + ny, x1 + nx, y1 + ny); seg(x0 - nx, y0 - ny, x1 - nx, y1 - ny);
      }
    }
    if (!letters) return;
    ctx.font = `${fs}px ${th.mono}`; ctx.textBaseline = 'middle';
    STRUCT.at.forEach((p, i) => {
      if (!p.el) return;
      const [x, y] = P(p);
      ctx.fillStyle = p.head ? th.fid : th.green;
      if (p.el === 'OH') {                                 // written HO when its bond comes in from the right
        const q = STRUCT.bd.find(e => e.a === i || e.b === i), o = STRUCT.at[q.a === i ? q.b : q.a], ho = o.x > p.x, cw = fs * 0.6;
        ctx.textAlign = ho ? 'right' : 'left'; ctx.fillText(ho ? 'HO' : 'OH', ho ? x + cw / 2 : x - cw / 2, y);
      } else { ctx.textAlign = 'center'; ctx.fillText(p.el, x, y); }
    });
  }

  // GNBA-F, length L, centred on x, y at angle ang: the green fluorinated core between two blue heads (16 : 20 : 16 Å)
  function bola(ctx, x, y, ang, L, th) {
    const hl = L * 0.31, e = L / 2 - hl / 2;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.strokeStyle = th.green; ctx.lineWidth = Math.max(1.6, L * 0.075); ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(-e, 0); ctx.lineTo(e, 0); ctx.stroke();
    ctx.fillStyle = th.fid;
    for (const sx of [-e, e]) { ctx.beginPath(); ctx.ellipse(sx, 0, hl / 2, hl * 0.36, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  Anim.register('bolaamphiphile-gels-2021', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 18, bot = h - pad, H = bot - top, big = w >= 400;
    const label = (text, x, y, align, colour, alpha) => { if (alpha < 0.01 || !text) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const M = q => Anim.measure(ctx, th, q);

    /* ---- layout: the gel (top left), the lipid-signal readout (top right), the membrane across the bottom ---- */
    const Lm = Math.min(0.19 * H, 0.1 * w, 60), hl = Lm * 0.31, yMem = bot - 0.2 * H;
    const gel = { x: pad, y: top + 0.06 * H, w: w * 0.6 - pad };
    gel.h = yMem - Lm / 2 - 0.16 * H - gel.y;
    const rd = { x: w * 0.64, y: top + 0.04 * H, w: w - pad - w * 0.64, h: 0.48 * H };
    const d = Lm * 0.36;                                   // molecules' spacing along a fibre
    const sway = 0.015 * Math.sin(0.5 * s);
    const slot = (f, j) => {
      const [cx, cy, a, n] = FIBRES[f], ang = a + (f % 2 ? -sway : sway), off = (j - (n - 1) / 2) * d;
      return { x: gel.x + cx * gel.w + Math.cos(ang) * off, y: gel.y + cy * gel.h + Math.sin(ang) * off, a: ang + Math.PI / 2 };
    };

    // the membrane's mid-line, bulging outwards (up) where it blebs, and its tilt
    const bleb = between(s, ...BLEB), sig = 0.07 * w;
    const yc = x => yMem - bleb * 0.12 * H * BLEBS.reduce((q, [bx, k]) => q + k * Math.exp(-(((x - bx * w) / sig) ** 2)), 0);
    const slope = x => (yc(x + 0.5) - yc(x - 0.5));
    // each leaving molecule: where it is, how far into the membrane it is, and how disturbed the lipids round it are
    const leave = LEAVERS.map(([f, j, fx, t0]) => {
      const X = fx * w, from = slot(f, j), u = clamp01((s - t0) / DRIFT), sl = between(s, t0 + DRIFT, t0 + DRIFT + SLIDE);
      const above = [X, yc(X) - Lm * 1.25], c = [lerp(from.x, X, 0.3), above[1]], v = ease(u), q = 1 - v;
      let x = q * q * from.x + 2 * q * v * c[0] + v * v * above[0], y = q * q * from.y + 2 * q * v * c[1] + v * v * above[1];
      y = lerp(y, yc(X), sl); x = lerp(x, X, sl);
      const upright = Math.PI / 2 + Math.atan(slope(X)) * sl;
      return { gone: s >= t0, x, y, a: lerp(from.a, upright, between(s, t0, t0 + DRIFT)), X, inn: sl, dis: between(s, t0 + DRIFT + SLIDE * 0.6, t0 + DRIFT + SLIDE + 1.6) };
    });

    /* ---- the membrane: a bilayer across the panel; lipids round the inserted molecules make room and are disturbed ---- */
    const aMem = between(s, ...MEMBRANE_IN);
    if (aMem > 0.01) {
      const sp = Math.max(4, Lm * 0.24), rh = Math.max(1.5, Lm * 0.075), hd = (Lm - hl) / 2, tailEnd = Lm * 0.04, n = Math.ceil(w / sp) + 1;
      const tail = mix(th.bg, th.muted, 0.65);
      ctx.globalAlpha = show * aMem; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(0.8, Lm * 0.035);
      for (let i = 0; i < n; i++) {
        let x = (i + 0.5) * sp - sp / 2;
        let D = 0;
        for (const L of leave) {
          const dx = x - L.X;
          x += Math.sign(dx) * hl * 0.85 * L.inn * Math.exp(-((dx / (hl * 1.3)) ** 2));
          D += L.dis * Math.exp(-((dx / (0.09 * w)) ** 2));
        }
        D = Math.min(1, D + bleb * 0.25);
        const m = slope(x), nl = Math.hypot(1, m), nx = -m / nl, ny = 1 / nl, y0 = yc(x);   // the normal, pointing into the cell
        for (const side of [-1, 1]) {
          const ph = LIPID_PH[(i * 2 + (side > 0 ? 1 : 0)) % LIPID_PH.length];
          const bob = D * Lm * 0.05 * Math.sin(1.1 * s + ph), sway2 = D * Lm * 0.14 * Math.sin(0.8 * s + 1.7 * ph);
          const hx = x + side * nx * (hd + bob), hy = y0 + side * ny * (hd + bob);
          const ex = x + side * nx * tailEnd + ny * sway2, ey = y0 + side * ny * tailEnd - nx * sway2;
          ctx.strokeStyle = tail;
          for (const k of [-1, 1]) {                      // two tails
            const ox = ny * rh * 0.55 * k, oy = -nx * rh * 0.55 * k;
            ctx.beginPath(); ctx.moveTo(hx + ox, hy + oy); ctx.quadraticCurveTo((hx + ex) / 2 + ox + ny * sway2 * 0.4, (hy + ey) / 2 + oy - nx * sway2 * 0.4, ex + ox * 0.6, ey + oy * 0.6); ctx.stroke();
          }
          ctx.fillStyle = th.muted; ctx.beginPath(); ctx.arc(hx, hy, rh, 0, TAU); ctx.fill();
        }
      }
      label(big ? 'cell membrane' : 'membrane', w - pad, yMem + Lm / 2 + 11, 'right', th.soft, aMem);
    }

    /* ---- the gel: molecules float, then assemble into its fibres (the first one shown large, with its sizes) ---- */
    const gone = new Set(LEAVERS.map(([f, j], k) => (leave[k].gone ? f + ':' + j : '')));
    for (const mol of MOLS) {
      if (gone.has(mol.f + ':' + mol.j)) continue;
      const home = slot(mol.f, mol.j);
      if (mol.f === INTRO[0] && mol.j === INTRO[1]) {
        const a = between(s, ...MORPH), k = between(s, ...SHRINK), Lbig = Math.min(gel.w * 0.7, Lm * 3.2);
        const cx = gel.x + gel.w * 0.5, cy = gel.y + gel.h * 0.42;
        // first its structure, across the panel (heads blue, core green), which then squeezes into the dumbbell
        const sA = between(s, ...STRUCT_IN) * (1 - a);
        if (sA > 0.01) {
          const bl = Math.min((w - 2 * pad) / (STRUCT.x1 - STRUCT.x0 + 1), (0.42 * H) / (STRUCT.y1 - STRUCT.y0 + 1)), sx = lerp(w / 2, cx, a);
          ctx.globalAlpha = show * sA;
          structure(ctx, th, sx, cy, bl, a, Lbig, big);
          const half = ((STRUCT.y1 - STRUCT.y0) / 2) * bl, W = (STRUCT.x1 - STRUCT.x0) * bl, names = between(s, STRUCT_IN[1], STRUCT_IN[1] + 0.5) * (1 - between(s, MORPH[0] - 0.4, MORPH[0]));
          if (big) {                                       // (its heads are turned half a turn from each other: one below, one above)
            label('head', sx - W * 0.33, cy + half + 12, 'center', th.fid, names);
            label('head', sx + W * 0.33, cy - half - 12, 'center', th.fid, names);
            label('fluorinated core', sx, cy + half + 12, 'center', th.green, names);
          }
        }
        ctx.globalAlpha = show * a;
        bola(ctx, lerp(cx, home.x, k), lerp(cy, home.y, k), lerp(0, home.a, k), lerp(Lbig, Lm, k), th);
        const dims = envelope(s, [DIMS[0], DIMS[0] + 0.4, DIMS[1] - 0.3, DIMS[1]]);
        label('GNBA-F', cx, cy - Lbig * 0.16 - 12, 'center', th.ink, a * (1 - k));
        if (dims > 0.01) {                                // its parts: 16 Å heads either side of a 20 Å fluorinated core
          const x0 = cx - Lbig / 2, hb = Lbig * 0.31, yd = cy + Lbig * 0.16 + 9;
          ctx.globalAlpha = show * dims; ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
          ctx.beginPath(); for (const x of [x0, x0 + hb, x0 + Lbig - hb, x0 + Lbig]) { ctx.moveTo(x, yd - 3); ctx.lineTo(x, yd + 3); } ctx.moveTo(x0, yd); ctx.lineTo(x0 + Lbig, yd); ctx.stroke();
          if (big) [[x0 + hb / 2, '16 Å', th.fid], [cx, '20 Å', th.green], [x0 + Lbig - hb / 2, '16 Å', th.fid]].forEach(([x, q, c]) => label(q, x, yd + 12, 'center', c, dims));
          else label('16 : 20 : 16 Å', cx, yd + 12, 'center', th.muted, dims);
        }
        continue;
      }
      const st = GEL_RUN[0] + (mol.hr / GEL_HOURS) * (GEL_RUN[1] - GEL_RUN[0]) - ASSEMBLE / 2;
      const a = between(s, ...GATHER), u = between(s, st, st + ASSEMBLE);
      if (a < 0.01) continue;
      const fx = gel.x + Lm / 2 + mol.fx * (gel.w - Lm) + 3 * Math.sin(0.7 * s + mol.ph), fy = gel.y + mol.fy * gel.h + 3 * Math.cos(0.6 * s + mol.ph);   // (floating, but inside the gel's box)
      ctx.globalAlpha = show * a;
      bola(ctx, lerp(fx, home.x, u), lerp(fy, home.y, u), lerp(mol.fa + 0.3 * Math.sin(0.4 * s + mol.ph), home.a, u), Lm, th);
    }

    /* ---- the molecules that leave the gel, drift down, and slide into the membrane to span it ---- */
    for (const L of leave) {
      if (!L.gone) continue;
      ctx.globalAlpha = show;
      bola(ctx, L.x, L.y, L.a, Lm, th);
    }

    /* ---- the readouts, top right: GNBA-F's 19F signal fading as it gels, later the lipids' signal as it goes in ---- */
    // each titled with its method (the longest title that fits), its time axis ending on xEnd; extra: what its fall means
    const plot = (alpha, titles, data, hours, run, half, xEnd, extra) => {
      if (alpha < 0.01) return;
      label(titles.find(q => M(q) <= rd.w) || titles[titles.length - 1], rd.x, rd.y + 5, 'left', th.soft, alpha);
      const px0 = rd.x + (big ? 36 : half ? 28 : 6), px1 = rd.x + rd.w, py0 = rd.y + 18, py1 = rd.y + rd.h - 12;   // (room for the y labels; phones' 19F plot has none)
      const X = hr => px0 + (hr / hours) * (px1 - px0), Y = v => py1 - (v / 1.1) * (py1 - py0);
      ctx.globalAlpha = show * alpha; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0, py1); ctx.lineTo(px1, py1); ctx.stroke();
      if (half) {
        ctx.strokeStyle = th.muted; ctx.setLineDash([2, 3]); ctx.globalAlpha = show * alpha * 0.6;
        ctx.beginPath(); ctx.moveTo(px0, Y(0.5)); ctx.lineTo(px1, Y(0.5)); ctx.stroke(); ctx.setLineDash([]);
        label('50%', px0 - 5, Y(0.5), 'right', th.muted, alpha);
      }
      if (big) label('100%', px0 - 5, Y(1), 'right', th.muted, alpha);
      label(xEnd, px1, py1 + 9, 'right', th.muted, alpha);
      if (big) label('0', px0, py1 + 9, 'center', th.muted, alpha);
      const now = clamp01((s - run[0]) / (run[1] - run[0])) * hours;
      if (extra) extra(X, Y, now, alpha);
      ctx.globalAlpha = show * alpha; ctx.strokeStyle = th.spec; ctx.lineWidth = 2; ctx.lineJoin = 'round';
      ctx.beginPath(); for (let k = 0; k <= 64; k++) { const hr = (k / 64) * now; if (k) ctx.lineTo(X(hr), Y(valueAt(data, hr))); else ctx.moveTo(X(hr), Y(valueAt(data, hr))); } ctx.stroke();
      ctx.fillStyle = th.spec; ctx.beginPath(); ctx.arc(X(now), Y(valueAt(data, now)), 2.6, 0, TAU); ctx.fill();
    };
    // both signals fall as molecules lose their mobility, but they mean opposite things: the curves' ends say which.
    // First GNBA-F locking into the gel (solution NMR sees only tumbling molecules) ...
    plot(envelope(s, [...GEL_IN, ...GEL_OUT]), ['¹⁹F solution NMR', '¹⁹F liq. NMR', '¹⁹F NMR'], GEL, GEL_HOURS, GEL_RUN, false, '10 h', (X, Y, now, a) => {
      label('37 °C', X(GEL_HOURS), Y(1), 'right', th.muted, a);                   // (in the corner the curve has left)
      label('gel', X(GEL_HOURS), Y(big ? 0.16 : 0.38), 'right', th.spec, a * between(now, 6, 7));   // (higher on the phones' shorter plot)
    });
    // ... later the membrane breaking up (the INEPT experiment sees only mobile lipids)
    plot(between(s, ...READOUT_IN), ['lipid ¹³C solid-state NMR', 'lipid ¹³C ssNMR', '¹³C ssNMR', '¹³C NMR'], SIGNAL, HOURS, HOURS_RUN, true, '16 h',
      (X, Y, now, a) => { if (big) label('disrupted', X(HOURS), Y(0.3), 'right', th.spec, a * between(now, 10, 12)); });

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    const pick = (left, right, rightFirst) => {            // the longest words that fit: a shorter left before losing the right
      const fits = (l, r) => M(l) + M(r) + 16 <= room;     // (or, rightFirst, a shorter left before shortening the right)
      if (rightFirst) { for (const r of right) for (const l of left) if (fits(l, r)) return [l, r]; }
      else for (const l of left) { const r = right.find(q => fits(l, q)); if (r !== undefined) return [l, r]; }
      return [left.find(l => M(l) <= room) || left[left.length - 1], ''];
    };
    const STAGES = [
      [['GNBA-F'], ['a bolaamphiphile: two heads, a rigid fluorinated core', 'two heads, a rigid fluorinated core', 'a bolaamphiphile'], th.green],
      [['Self-assembly', 'Assembly'], ['nanofibres of a supramolecular gel', 'a supramolecular gel', 'supramolecular gel'], th.fid],
      [['At 37 °C'], ['single molecules leave the gel', 'molecules leave the gel', 'some leave the gel'], th.fid],
      [['Spanning the membrane', 'Into the membrane'], ['lipid membranes are disrupted', 'membranes disrupted', 'disrupting it'], th.spec, true],
      [['Membrane effect'], ['HeLa cancer cells die', 'cancer cells die', 'cells die'], th.spec]];
    STAGES.forEach(([left, right, colour, rightFirst], k) => {
      const [a, b] = HEADS[k], alpha = (k ? between(s, a, a + 0.3) : 1) * (k < HEADS.length - 1 ? 1 - between(s, b - 0.3, b) : 1);
      if (alpha < 0.01) return;
      const [L0, R0] = pick(left, right, rightFirst);
      label(L0, pad, ly, 'left', th.ink, alpha);
      label(R0, w - pad, ly, 'right', colour, alpha);
    });
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
})();
