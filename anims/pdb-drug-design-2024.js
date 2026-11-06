/* ==========================================================================
   pdb-drug-design-2024: the PDB, and the drugs in it.
   A book chapter (no figures to work from, so this follows its abstract).
   First the archive: a wall of structures (200,000+ in the PDB), proteins
   in blue and DNA and RNA in green. Then the ones with small molecules
   bound (drugs, inhibitors, cofactors) light up, their ligands orange. One
   opens up: a drug settles into its target's binding pocket and its
   contacts appear (two hydrogen bonds and a hydrophobic contact), as
   PDBe-KB's ligand views show them. Last, computer-aided drug design: a
   new group (green) grows from the drug into an empty sub-pocket and makes
   a new contact. The pocket and the drug are schematic, not one entry.
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp = u => Math.max(0, Math.min(1, u));
  const TAU = Math.PI * 2;

  /* ---- the wall of structures: each tile a protein, a protein with a small molecule bound, DNA or RNA ---- */
  const KINDS = (() => {
    const rand = Anim.seeded(23);
    return Array.from({ length: 48 }, () => { const r = rand(); return { kind: r < 0.42 ? 'protein' : r < 0.78 ? 'complex' : r < 0.9 ? 'dna' : 'rna', ph: rand() * TAU, ph2: rand() * TAU, lig: rand() * TAU }; });
  })();

  /* ---- the pocket scene, in its own units (across −1.1 … 1.1, down −0.65 … 0.65): the protein's surface, a smooth
     outline through these points, with a U-shaped pocket in its top and a small, empty sub-pocket in the pocket's
     right wall; it carries on below the view ---- */
  const OUTLINE = (() => {
    const P = [[-1.25, 0.9], [-1.05, 0.3], [-0.95, -0.05], [-0.75, -0.25], [-0.45, -0.34], [-0.29, -0.31], [-0.25, -0.17], [-0.21, -0.04],
      [-0.1, 0.04], [0.05, 0.05], [0.16, 0.0], [0.2, -0.06], [0.29, -0.07], [0.37, -0.1], [0.37, -0.16], [0.28, -0.18], [0.25, -0.25],
      [0.31, -0.33], [0.5, -0.36], [0.8, -0.25], [1.0, 0.0], [1.08, 0.35], [1.25, 0.9]];
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {               // a Catmull–Rom spline, eight points a span
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 8; k++) { const u = k / 8, u2 = u * u, u3 = u2 * u; out.push([0, 1].map(j => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u3))); }
    }
    out.push(P[P.length - 1], [1.25, 1.4], [-1.25, 1.4]);
    return out;
  })();
  // residues lining the pocket: each a side chain from inside the protein (base) poking out of the wall (tip): on the
  // pocket's left wall, its floor, its right wall, and at the end of the sub-pocket
  const RES = [[[-0.3, -0.2], [-0.2, -0.19]], [[-0.1, 0.1], [-0.09, 0.0]], [[0.24, -0.03], [0.15, -0.05]], [[0.45, -0.13], [0.355, -0.13]]];
  // the drug, docked: its atoms (relative to its centre) and bonds; a ring with an amide arm to the left
  const BL = 0.065, LIG_AT = { x: 0.02, y: -0.1 };
  const DRUG = (() => {
    const at = [], bd = [];
    const ring = Array.from({ length: 6 }, (_, k) => [BL * Math.cos((k * TAU) / 6), BL * Math.sin((k * TAU) / 6)]);
    ring.forEach(p => at.push({ x: p[0], y: p[1], el: '' }));
    for (let k = 0; k < 6; k++) bd.push([k, (k + 1) % 6, k % 2 ? 1 : 2]);
    const add = (a, deg, el = '', order = 1) => { at.push({ x: at[a].x + BL * Math.cos((deg * Math.PI) / 180), y: at[a].y + BL * Math.sin((deg * Math.PI) / 180), el }); bd.push([a, at.length - 1, order]); return at.length - 1; };
    const c = add(3, 180), o = add(c, 240, 'O', 2), n = add(c, 120, 'N');   // the amide: C=O up-left, N down-left
    return { at, bd, o, n, right: 0 };                    // (atom 0 is the ring's right-hand atom, where the new group grows)
  })();
  // the new group, grown into the sub-pocket from the ring's right-hand atom: three bonds, then a CF3 at its end
  const GROW = (() => {
    const p0 = DRUG.at[DRUG.right], dir = d => [Math.cos((d * Math.PI) / 180), Math.sin((d * Math.PI) / 180)];
    const step = (p, d, k = 1) => [p[0] + BL * k * dir(d)[0], p[1] + BL * k * dir(d)[1]];
    const a = step([p0.x, p0.y], -30), b = step(a, 30), c = step(b, -30);
    return { chain: [[p0.x, p0.y], a, b, c], fs: [-60, 0, 60].map(d => step(c, d, 0.6)) };
  })();

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 15;
  const SHOW = [0, 0.4, 14.4, 15.0];
  const TILES_IN = [0.2, 1.8];                             // the wall fills in, column by column
  const LIGANDS = [3.2, 3.8];                              // the ones with small molecules bound light up
  const ZOOM = [5.6, 6.6];                                 // one opens up into its binding pocket
  const DOCK = [6.4, 8.0], CONTACTS = [8.0, 9.0];          // the drug settles in; its contacts appear
  const GROWTH = [10.4, 11.6], NEW_CONTACT = [11.5, 12.1]; // a new group grows into the empty sub-pocket
  const HEADS = [[0.3, 3.4], [3.6, 5.6], [5.8, 10.2], [10.4, 14.4]];
  const STILL = 9.5;

  Anim.register('pdb-drug-design-2024', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 18, bot = h - pad, H = bot - top, big = w >= 400;
    const label = (text, x, y, align, colour, alpha) => { if (alpha < 0.01 || !text) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const M = q => Anim.measure(ctx, th, q);

    /* ---- the wall of structures ---- */
    const cols = big ? 8 : 6, rows = big ? 5 : 4, gapK = 0.18;
    const S = Math.min((w - 2 * pad) / (cols + (cols - 1) * gapK), H / (rows + (rows - 1) * gapK)), g = S * gapK;
    const gx0 = (w - (cols * S + (cols - 1) * g)) / 2, gy0 = top + (H - (rows * S + (rows - 1) * g)) / 2;
    const pick = Math.floor(rows / 2) * cols + Math.floor(cols / 2) - 1;   // the tile that opens up (made a complex)
    const tile = i => ({ x: gx0 + (i % cols) * (S + g), y: gy0 + Math.floor(i / cols) * (S + g) });
    const lit = between(s, ...LIGANDS), zoom = between(s, ...ZOOM), wallOut = 1 - between(s, ZOOM[0], ZOOM[0] + 0.5);
    if (wallOut > 0.01) {
      for (let i = 0; i < rows * cols; i++) {
        const K = KINDS[i % KINDS.length], kind = i === pick ? 'complex' : K.kind, { x, y } = tile(i);
        const a = between(s, TILES_IN[0] + ((i % cols) / cols) * (TILES_IN[1] - TILES_IN[0] - 0.4), TILES_IN[0] + ((i % cols) / cols) * (TILES_IN[1] - TILES_IN[0] - 0.4) + 0.4);
        if (a < 0.01) continue;
        const dim = kind === 'complex' ? 1 : 1 - 0.65 * lit, alpha = show * a * dim * (i === pick ? 1 : wallOut);
        ctx.globalAlpha = alpha; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x + 0.5, y + 0.5, S - 1, S - 1, 3); else ctx.rect(x + 0.5, y + 0.5, S - 1, S - 1); ctx.stroke();
        if (i === pick && zoom > 0.01) continue;           // (drawn opening up, below)
        glyph(ctx, kind, x + S / 2, y + S / 2, S, K, th, kind === 'complex' ? lit : 0);
      }
    }

    /* ---- one complex, opened up: its binding pocket, the drug settling in, its contacts; then a new group ---- */
    if (zoom > 0.01) {
      const from = tile(pick), B = { x: pad, y: top, w: w - 2 * pad, h: H };
      const R = { x: lerp(from.x, B.x, zoom), y: lerp(from.y, B.y, zoom), w: lerp(S, B.w, zoom), h: lerp(S, B.h, zoom) };
      ctx.globalAlpha = show * (1 - 0.6 * zoom); ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 4); else ctx.rect(R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1); ctx.stroke();
      // (phones see a closer crop of the pocket, its shoulders cut off; the larger panels have room for the names)
      const sc = big ? Math.min(R.w / 2.0, R.h / 1.15) : Math.min(R.w / 1.5, R.h / 1.0), cx = R.x + R.w / 2, cy = R.y + R.h * 0.5 - sc * 0.02;
      const P = (u, v) => [cx + u * sc, cy + v * sc];
      ctx.save(); ctx.beginPath(); ctx.rect(R.x + 1, R.y + 1, R.w - 2, R.h - 2); ctx.clip();
      // the protein's surface
      ctx.globalAlpha = show;
      ctx.beginPath(); OUTLINE.forEach(([u, v], k) => { const [x, y] = P(u, v); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.closePath();
      ctx.fillStyle = mix(th.bg, th.fid, 0.13); ctx.fill(); ctx.strokeStyle = th.fid; ctx.lineWidth = Math.max(1.2, sc * 0.008); ctx.lineJoin = 'round'; ctx.stroke();
      // residues lining the pocket: side chains poking out of its walls (the last one in the sub-pocket)
      const res = RES.map(([b, q]) => ({ base: P(...b), tip: P(...q) }));
      ctx.strokeStyle = th.fid; ctx.fillStyle = th.fid; ctx.lineWidth = Math.max(1.2, sc * 0.012); ctx.lineCap = 'round';
      for (const q of res) { ctx.beginPath(); ctx.moveTo(...q.base); ctx.lineTo(...q.tip); ctx.stroke(); ctx.beginPath(); ctx.arc(q.tip[0], q.tip[1], Math.max(1.6, sc * 0.016), 0, TAU); ctx.fill(); }
      // the drug, coming down into the pocket and settling
      const dk = between(s, ...DOCK), bob = 0.006 * Math.sin(1.4 * s);
      const L = { x: LIG_AT.x + (1 - dk) * 0.12, y: LIG_AT.y - (1 - dk) * 0.75 + bob, a: (1 - dk) * 0.9 };
      const at = p => { const c = Math.cos(L.a), sn = Math.sin(L.a); return P(L.x + p[0] * c - p[1] * sn, L.y + p[0] * sn + p[1] * c); };
      const ligA = between(s, ZOOM[1] - 0.2, DOCK[0] + 0.5);
      const lw = Math.max(1.3, sc * 0.014);
      // its contacts: two hydrogen bonds from the amide (dashed), a hydrophobic contact from the ring (dotted)
      const cA = between(s, ...CONTACTS);
      const contact = (p, q, dashes, alpha) => {
        if (alpha < 0.01) return;
        ctx.globalAlpha = show * alpha; ctx.strokeStyle = th.spec; ctx.lineWidth = 1; ctx.setLineDash(dashes);
        ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(...q); ctx.stroke(); ctx.setLineDash([]);
      };
      const atomXY = i => at([DRUG.at[i].x, DRUG.at[i].y]);
      contact(atomXY(DRUG.o), res[0].tip, [3, 3], cA);
      contact(atomXY(DRUG.n), res[1].tip, [3, 3], cA);
      contact(at([DRUG.at[1].x, DRUG.at[1].y]), res[2].tip, [1, 3], cA);
      // the new group, grown bond by bond into the sub-pocket, and its contact
      const gr = between(s, ...GROWTH), nc = between(s, ...NEW_CONTACT), end = GROW.chain[GROW.chain.length - 1];
      if (gr > 0.01) {
        ctx.globalAlpha = show; ctx.strokeStyle = th.green; ctx.lineWidth = lw;
        const seg = (p, q, u) => { if (u <= 0) return; const a = at(p), b = at(q); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u); ctx.stroke(); };
        for (let k = 0; k < 3; k++) seg(GROW.chain[k], GROW.chain[k + 1], clamp(gr * 4 - k));
        for (const f of GROW.fs) seg(end, f, clamp(gr * 4 - 3));
        contact(at(GROW.fs[1]), res[3].tip, [1, 3], nc);
        if (gr > 0.75) {                                   // one ring, once, as it arrives
          const ring = between(s, GROWTH[1] - 0.2, GROWTH[1] + 0.7), [x, y] = at(end);
          if (ring < 0.99) { ctx.globalAlpha = show * (1 - ring) * 0.8; ctx.strokeStyle = th.green; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, sc * (0.04 + 0.1 * ring), 0, TAU); ctx.stroke(); }
        }
      }
      if (ligA > 0.01) {
        ctx.globalAlpha = show * ligA; ctx.strokeStyle = th.spec; ctx.fillStyle = th.spec; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const [i, j, order] of DRUG.bd) {
          const a = atomXY(i), b = atomXY(j);
          ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
          if (order === 2) {                               // the double bond: a second line, inside the ring or beside the C=O
            const c = i < 6 && j < 6 ? at([0, 0]) : null, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
            let nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
            if (c && (c[0] - mx) * nx + (c[1] - my) * ny < 0) { nx = -nx; ny = -ny; }
            const off = sc * 0.016, sh = c ? 0.2 : 0;
            ctx.beginPath(); ctx.moveTo(a[0] + (b[0] - a[0]) * sh + nx * off, a[1] + (b[1] - a[1]) * sh + ny * off); ctx.lineTo(b[0] - (b[0] - a[0]) * sh + nx * off, b[1] - (b[1] - a[1]) * sh + ny * off); ctx.stroke();
          }
        }
        for (const i of [DRUG.o, DRUG.n]) { const [x, y] = atomXY(i); ctx.beginPath(); ctx.arc(x, y, Math.max(1.8, sc * 0.016), 0, TAU); ctx.fill(); }   // its O and N, which make the H-bonds
      }
      ctx.restore();
      // a few names, on the larger panels
      if (big) {
        const [lx, lyy] = P(-0.36, -0.44), [hx, hy] = P(-0.34, -0.12);
        label('binding pocket', lx, lyy, 'right', th.fid, between(s, ZOOM[1], ZOOM[1] + 0.5));
        label('H-bonds', hx, hy, 'right', th.spec, cA);
        // the sub-pocket, named at the top right with a leader down to its mouth: empty, then filled by the new group
        const sx = R.x + R.w - 10, [, sy] = P(0, -0.5), [mx, my] = P(0.3, -0.21);
        const aSub = envelope(s, [CONTACTS[1], CONTACTS[1] + 0.4, GROWTH[0] + 0.3, GROWTH[0] + 0.7]), aNew = between(s, GROWTH[1] - 0.3, GROWTH[1] + 0.2);
        for (const [name, colour, a] of [['empty sub-pocket', th.muted, aSub], ['new group', th.green, aNew]]) {
          if (a < 0.01) continue;
          label(name, sx, sy, 'right', colour, a);
          ctx.globalAlpha = show * a * 0.7; ctx.strokeStyle = colour; ctx.lineWidth = 1; ctx.setLineDash([1, 3]);
          ctx.beginPath(); ctx.moveTo(sx - M(name) / 2, sy + 8); ctx.lineTo(mx, my); ctx.stroke(); ctx.setLineDash([]);
        }
      }
    }

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    const choose = (left, right) => {                      // the longest words that fit: a shorter left before losing the right
      for (const l of left) { const r = right.find(q => M(l) + M(q) + 16 <= room); if (r !== undefined) return [l, r]; }
      return [left.find(l => M(l) <= room) || left[left.length - 1], ''];
    };
    const STAGES = [
      [['The PDB'], ['200,000+ structures of proteins, DNA and RNA', '200,000+ macromolecular structures', '200,000+ structures'], th.fid],
      [['Bound small molecules', 'Bound ligands'], ['drugs, inhibitors and cofactors', 'drugs, inhibitors', 'drugs'], th.spec],
      [['How a drug binds', 'Drug binding'], ['its pocket and contacts, in PDBe-KB', 'its pocket and contacts', 'pocket, contacts'], th.spec],
      [['Computer-aided drug design', 'Drug design'], ['design from the structure', 'from the structure'], th.green]];
    STAGES.forEach(([left, right, colour], k) => {
      const [a, b] = HEADS[k], alpha = (k ? between(s, a, a + 0.3) : 1) * (k < HEADS.length - 1 ? 1 - between(s, b - 0.3, b) : 1);
      if (alpha < 0.01) return;
      const [L0, R0] = choose(left, right);
      label(L0, pad, ly, 'left', th.ink, alpha);
      label(R0, w - pad, ly, 'right', colour, alpha);
    });
    ctx.globalAlpha = 1;
  }, { still: STILL, loop: CYCLE });

  // one tile's picture, centred on x, y in a tile of size S: a protein (a blob of a surface), a protein with its small
  // molecule (orange, lit by u), or DNA or RNA (green)
  function glyph(ctx, kind, x, y, S, K, th, u) {
    const keep = ctx.globalAlpha;
    ctx.lineWidth = Math.max(1, S * 0.035); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (kind === 'protein' || kind === 'complex') {
      const r0 = S * 0.27;
      ctx.beginPath();
      for (let k = 0; k <= 48; k++) { const a = (k / 48) * TAU, r = r0 * (1 + 0.16 * Math.sin(3 * a + K.ph) + 0.08 * Math.sin(5 * a + K.ph2)); if (k) ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); else ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
      ctx.closePath(); ctx.fillStyle = mix(th.bg, th.fid, 0.13); ctx.fill(); ctx.strokeStyle = th.fid; ctx.stroke();
      if (kind === 'complex') {                            // its small molecule, at its edge
        const a = K.lig, r = r0 * (1 + 0.16 * Math.sin(3 * a + K.ph) + 0.08 * Math.sin(5 * a + K.ph2)) * 0.8, lx = x + r * Math.cos(a), ly = y + r * Math.sin(a), rr = Math.max(2, S * 0.09);
        ctx.globalAlpha = keep * (0.55 + 0.45 * u); ctx.strokeStyle = th.spec; ctx.fillStyle = mix(th.bg, th.spec, 0.25 + 0.5 * u);
        ctx.beginPath(); for (let k = 0; k < 6; k++) { const b = (k * TAU) / 6; if (k) ctx.lineTo(lx + rr * Math.cos(b), ly + rr * Math.sin(b)); else ctx.moveTo(lx + rr * Math.cos(b), ly + rr * Math.sin(b)); } ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = keep;
      }
    } else if (kind === 'dna') {                           // a short double helix
      const L = S * 0.6, A = S * 0.14;
      ctx.strokeStyle = th.green;
      for (const off of [0, Math.PI]) { ctx.beginPath(); for (let k = 0; k <= 24; k++) { const v = k / 24, px = x - L / 2 + v * L, py = y + A * Math.sin(v * TAU * 1.2 + off + K.ph); if (k) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); }
      ctx.lineWidth = Math.max(0.8, S * 0.02); ctx.beginPath();
      for (let k = 1; k < 8; k++) { const v = k / 8, px = x - L / 2 + v * L, a = v * TAU * 1.2 + K.ph; ctx.moveTo(px, y + A * Math.sin(a)); ctx.lineTo(px, y + A * Math.sin(a + Math.PI)); }
      ctx.stroke();
    } else {                                               // RNA: a hairpin, a short stem and its loop
      const st = S * 0.3, gw = S * 0.12, r = S * 0.13;
      ctx.strokeStyle = th.green;
      ctx.beginPath(); ctx.moveTo(x - gw / 2, y + st / 2 + S * 0.08); ctx.lineTo(x - gw / 2, y - st / 2 + S * 0.08); ctx.arc(x, y - st / 2 + S * 0.08 - Math.sqrt(Math.max(0, r * r - (gw / 2) ** 2)), r, Math.PI / 2 + Math.asin(gw / 2 / r), TAU + Math.PI / 2 - Math.asin(gw / 2 / r)); ctx.lineTo(x + gw / 2, y + st / 2 + S * 0.08); ctx.stroke();
      ctx.lineWidth = Math.max(0.8, S * 0.02); ctx.beginPath();
      for (let k = 0; k < 3; k++) { const py = y + S * 0.08 + st / 2 - (k + 0.5) * (st / 3); ctx.moveTo(x - gw / 2, py); ctx.lineTo(x + gw / 2, py); }
      ctx.stroke();
    }
  }

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
