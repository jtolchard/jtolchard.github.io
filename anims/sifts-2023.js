/* ==========================================================================
   sifts-2023: one numbering for every structure of a protein.
   A protein's UniProtKB sequence runs across the top. Below it, PDB entries
   of that protein, each a fragment numbered its own way: one a domain
   numbered from 1, one numbered from 501, one most of the chain with an
   expression tag (numbered −19 to 0) and a loop that wasn't modelled. The
   same tryptophan is W155 in one and W140 in another. SIFTS maps each
   residue to its UniProtKB position: the entries slide into place, their
   numbers become UniProtKB numbers (the tag stays unmapped), and both
   tryptophans become W179. Then CATH domains, mapped the same way, carry
   down onto every entry: as in the paper's Fig. 6 (PDB 1qmh), a parent
   domain split in two by an inserted domain. Since this paper, all of that
   sits in each entry's PDBx/mmCIF file, so at the end the rows move up and
   the fullest entry appears in 3D, rotating, coloured by those domains: the
   parent's two parts either side, the inserted domain on top between them.
   The protein, its entries, its domains and its structure are illustrative.
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const TAU = Math.PI * 2;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const unit = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cr = (p0, p1, p2, p3, t) => {                       // Catmull-Rom
    const t2 = t * t, t3 = t2 * t;
    return [0, 1, 2].map(j => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3));
  };

  /* ---- the protein, its PDB entries and its domains (residues, in UniProtKB numbering) ---- */
  const L = 420;
  const ENTRIES = [
    { from: 25, to: 190, auth: 1 },                              // one domain, numbered from 1
    { from: 215, to: 410, auth: 501 },                           // the rest, numbered from 501
    { from: 40, to: 400, auth: 1, tag: 20, gap: [290, 312] }     // most of it: a His-tag and linker (−19…0), and a loop not modelled
  ];
  const authAt = (e, r) => e.auth + (r - e.from);                // a residue's author number in an entry
  const MARK = 179, AA = 'W';                                    // one residue to follow
  // CATH domains, laid out as in the paper's Fig. 6: a parent domain (k 0) in two parts, an inserted one (k 1) between
  const DOMAINS = [{ from: 30, to: 180, k: 0, names: ['parent', '1'] }, { from: 185, to: 285, k: 1, names: ['inserted', '2'] }, { from: 290, to: 405, k: 0, names: ['parent', '1'] }];
  const domainOf = r => DOMAINS.find(d => r >= d.from && r <= d.to);
  // an entry's modelled stretches (without its loop)
  const pieces = e => (e.gap ? [[e.from, e.gap[0] - 1], [e.gap[1] + 1, e.to]] : [[e.from, e.to]]);

  /* ---- entry C in 3D, its fold following its chain: the parent domain's first part makes the left of its two
     layers of helices (crossing at an angle), the chain rises into the inserted domain (a small bundle sitting on
     top, in the middle), then comes back down to make the right of the parent (Cα, Å) ---- */
  const FIRST = ENTRIES[2].from, LAST = ENTRIES[2].to, GAP = ENTRIES[2].gap;
  const HELICES = [[44, 57], [63, 81], [87, 100], [106, 124], [130, 145], [152, 170],         // parent, first part
    [188, 201], [207, 224], [230, 243], [249, 266], [272, 284],                                // inserted
    [317, 331], [337, 355], [361, 374], [380, 398]];                                          // parent, second part
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const MODEL = (() => {
    const rand = Anim.seeded(23), pos = {};
    const at = (x, z, t) => ({ c: [x, (rand() - 0.5) * 3, z], d: unit([Math.sin(t), Math.cos(t), (rand() - 0.5) * 0.25]) });
    const slots = [                                          // in the order the chain visits them
      at(-18, 5, 0.3), at(-18, -5, -0.3), at(-9, -5, 0.3), at(-9, 5, -0.3), at(0, 5, 0.3), at(0, -5, -0.3),   // parent, left
      ...[0, 1, 2, 3, 4].map(j => { const a = -Math.PI / 2 + (j * TAU) / 5; return { c: [4 + 7 * Math.cos(a), 22 + 7 * Math.sin(a), 0], d: unit([(j % 2 ? 1 : -1) * 0.25, 0.15, 1]) }; }),   // inserted, on top
      at(9, -5, 0.3), at(9, 5, -0.3), at(18, 5, 0.3), at(18, -5, -0.3)];                                       // parent, right
    const dir = [-1, 1, -1, 1, -1, 1, 1, -1, 1, -1, 1, -1, 1, -1, 1];                        // which way along its axis each runs
    HELICES.forEach(([a, b], k) => {                          // ideal helices: 1.5 Å a residue, 100° a turn, radius 2.3 Å
      const n = b - a + 1, half = (1.5 * (n - 1)) / 2, { c, d } = slots[k];
      const e1 = unit(cross(d, Math.abs(d[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0])), e2 = cross(d, e1);
      for (let i = 0; i < n; i++) {
        const along = dir[k] * (-half + 1.5 * i), ang = (i * 100 * Math.PI) / 180 + k;
        pos[a + i] = [0, 1, 2].map(j => c[j] + d[j] * along + 2.3 * (Math.cos(ang) * e1[j] + Math.sin(ang) * e2[j]));
      }
    });
    for (let k = 0; k < HELICES.length - 1; k++) {           // loops: an arc on past the helix's end, longer ones further
      const r0 = HELICES[k][1] + 1, r1 = HELICES[k + 1][0] - 1, P0 = pos[r0 - 1], P1 = pos[r1 + 1], n = r1 - r0 + 1, out = slots[k].d.map(v => v * dir[k]);
      for (let r = r0; r <= r1; r++) { const u = (r - r0 + 1) / (n + 1), b = Math.sin(Math.PI * u) * Math.min(8, 3 + 0.2 * n); pos[r] = [0, 1, 2].map(j => lerp(P0[j], P1[j], u) + out[j] * b); }
    }
    const d0 = slots[0].d.map(v => -v * dir[0]), dz = slots[HELICES.length - 1].d.map(v => v * dir[HELICES.length - 1]);   // the loose ends
    for (let r = HELICES[0][0] - 1; r >= FIRST; r--) pos[r] = pos[r + 1].map((v, j) => v + 2.2 * d0[j]);
    for (let r = HELICES[HELICES.length - 1][1] + 1; r <= LAST; r++) pos[r] = pos[r - 1].map((v, j) => v + 2.2 * dz[j]);
    const out = []; for (let r = FIRST; r <= LAST; r++) out.push(pos[r]);
    const core = HELICES.flatMap(([a, b]) => out.slice(a - FIRST, b - FIRST + 1)), c = [0, 1, 2].map(j => core.reduce((q, p) => q + p[j], 0) / core.length);
    return out.map(p => p.map((v, j) => v - c[j]));             // (centred on its helices)
  })();
  // how far its helices reach from the centre, across and up (the loose ends and loops may reach a little further)
  const CORE = HELICES.flatMap(([a, b]) => MODEL.slice(a - FIRST, b - FIRST + 1));
  const R_XZ = Math.max(...CORE.map(p => Math.hypot(p[0], p[2]))) + 3, R_Y = Math.max(...CORE.map(p => Math.abs(p[1]))) + 3;
  const RAD = 2.6;                                          // cylinder radius, Å
  function axes(m) {                                        // each helix's axis, from its Cα
    return HELICES.map(([a, b]) => {
      const pts = []; for (let r = a; r <= b; r++) pts.push(m[r - FIRST]);
      const c = [0, 1, 2].map(j => pts.reduce((s, p) => s + p[j], 0) / pts.length);
      const C = [0, 1, 2].map(i => [0, 1, 2].map(j => pts.reduce((s, p) => s + (p[i] - c[i]) * (p[j] - c[j]), 0)));
      let d = unit(sub(pts[pts.length - 1], pts[0]));
      for (let k = 0; k < 30; k++) d = unit([0, 1, 2].map(i => C[i][0] * d[0] + C[i][1] * d[1] + C[i][2] * d[2]));
      const e = sub(pts[pts.length - 1], pts[0]);
      if (e[0] * d[0] + e[1] * d[1] + e[2] * d[2] < 0) d = d.map(x => -x);
      const along = p => (p[0] - c[0]) * d[0] + (p[1] - c[1]) * d[1] + (p[2] - c[2]) * d[2];
      const s0 = along(pts[0]) - 0.6, s1 = along(pts[pts.length - 1]) + 0.6;
      return { a, b, d, s0, s1, P0: c.map((x, j) => x + d[j] * s0), P1: c.map((x, j) => x + d[j] * s1), at: r => along(m[r - FIRST]) };
    });
  }
  const unmodelled = r => r >= GAP[0] && r <= GAP[1];
  // the cartoon: shaded cylinders for the helices, thick tubes for the loops (none where the loop wasn't modelled),
  // painted back to front; paint(r) gives each residue's colour and how much of it to show (0: plain)
  function cartoon(ctx, pos, X, sc, th, paint) {
    const AX = axes(pos), prims = [];
    const loops = [[null, FIRST, HELICES[0][0] - 1, 0]];
    for (let k = 0; k < HELICES.length - 1; k++) loops.push([k, HELICES[k][1] + 1, HELICES[k + 1][0] - 1, k + 1]);
    loops.push([HELICES.length - 1, HELICES[HELICES.length - 1][1] + 1, LAST, null]);
    for (const [from, r0, r1, to] of loops) {
      const ctrl = [], res = [];
      if (from !== null) { ctrl.push(AX[from].P1); res.push(AX[from].b); }
      for (let r = r0; r <= r1; r++) { ctrl.push(pos[r - FIRST]); res.push(r); }
      if (to !== null) { ctrl.push(AX[to].P0); res.push(AX[to].a); }
      const cz = A => (A.P0[2] + A.P1[2]) / 2 + 0.5;
      const atStart = from === null ? null : cz(AX[from]) + (AX[from].d[2] > 0 ? 1 : -1);
      const atEnd = to === null ? null : cz(AX[to]) + (AX[to].d[2] < 0 ? 1 : -1);
      let prev = ctrl[0];
      for (let i = 0; i < ctrl.length - 1; i++) {
        for (let k = 1; k <= 6; k++) {
          const p = cr(ctrl[Math.max(0, i - 1)], ctrl[i], ctrl[i + 1], ctrl[Math.min(ctrl.length - 1, i + 2)], k / 6);
          let z = (prev[2] + p[2]) / 2;
          if (i === 0 && atStart !== null) z = atStart;
          if (i === ctrl.length - 2 && atEnd !== null) z = atEnd;
          const r = res[k <= 3 ? i : i + 1];
          if (!unmodelled(r) && !unmodelled(res[i]) && !unmodelled(res[i + 1])) prims.push({ z, seg: [prev, p], res: r });
          prev = p;
        }
      }
    }
    for (const A of AX) prims.push({ z: (A.P0[2] + A.P1[2]) / 2 + 0.5, cyl: A });
    prims.sort((p, q) => p.z - q.z);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const lw = Math.max(1, 0.17 * sc), R = RAD * sc, tubeW = Math.max(1.6, 0.42 * sc);
    for (const p of prims) {
      if (p.seg) {
        const a = X(p.seg[0]), b = X(p.seg[1]), [c, f] = paint(p.res);
        ctx.strokeStyle = mix(th.ink, c, f); ctx.lineWidth = tubeW;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        continue;
      }
      const A = p.cyl, p0 = X(A.P0), p1 = X(A.P1), Lc = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
      const u = [(p1[0] - p0[0]) / Lc, (p1[1] - p0[1]) / Lc], n = [-u[1], u[0]], ang = Math.atan2(u[1], u[0]);
      const ry = R, rx = Math.max(1, R * Math.abs(A.d[2]));
      const [back, front] = A.d[2] > 0 ? [p0, p1] : [p1, p0];
      const span = [Math.min(p0[0], p1[0]) - R * 2, Math.min(p0[1], p1[1]) - R * 2, Math.abs(p1[0] - p0[0]) + R * 4, Math.abs(p1[1] - p0[1]) + R * 4];
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0[0] + n[0] * R, p0[1] + n[1] * R); ctx.lineTo(p1[0] + n[0] * R, p1[1] + n[1] * R);
      ctx.lineTo(p1[0] - n[0] * R, p1[1] - n[1] * R); ctx.lineTo(p0[0] - n[0] * R, p0[1] - n[1] * R); ctx.closePath();
      const cw = (p1[0] - p0[0]) * n[1] - (p1[1] - p0[1]) * n[0] < 0;   // (the far end winds the same way as the body)
      ctx.moveTo(back[0] + rx * Math.cos(ang), back[1] + rx * Math.sin(ang)); ctx.ellipse(back[0], back[1], rx, ry, ang, 0, TAU, !cw);
      ctx.clip();
      const [c0, f0] = paint(A.a);                              // (a helix lies within one domain)
      ctx.fillStyle = mix(mix(th.bg, th.ink, 0.06), c0, 0.9 * f0); ctx.fillRect(...span);
      const g = ctx.createLinearGradient(p0[0] + n[0] * R, p0[1] + n[1] * R, p0[0] - n[0] * R, p0[1] - n[1] * R);
      g.addColorStop(0, rgba(th.ink, 0.04)); g.addColorStop(0.35, rgba(th.ink, 0)); g.addColorStop(1, rgba(th.ink, 0.38));
      ctx.fillStyle = g; ctx.fillRect(...span);
      ctx.restore();
      const ge = ctx.createLinearGradient(front[0] + n[0] * R, front[1] + n[1] * R, front[0] - n[0] * R, front[1] - n[1] * R);
      ge.addColorStop(0, mix(mix(th.bg, th.ink, 0.16), c0, 0.75 * f0)); ge.addColorStop(1, mix(mix(th.bg, th.ink, 0.36), c0, 0.85 * f0));
      ctx.fillStyle = ge;
      ctx.beginPath(); ctx.ellipse(front[0], front[1], rx, ry, ang, 0, TAU); ctx.fill();
      ctx.strokeStyle = th.ink; ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(p0[0] + n[0] * R, p0[1] + n[1] * R); ctx.lineTo(p1[0] + n[0] * R, p1[1] + n[1] * R);
      ctx.moveTo(p0[0] - n[0] * R, p0[1] - n[1] * R); ctx.lineTo(p1[0] - n[0] * R, p1[1] - n[1] * R);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(front[0], front[1], rx, ry, ang, 0, TAU); ctx.stroke();
      const farIsStart = back === p0;
      ctx.beginPath(); ctx.ellipse(back[0], back[1], rx, ry, ang, farIsStart ? Math.PI / 2 : -Math.PI / 2, farIsStart ? Math.PI * 1.5 : Math.PI / 2); ctx.stroke();
    }
  }
  // the model turned about the vertical by a, then tipped towards us by b
  const view = (a, b) => MODEL.map(([x, y, z]) => {
    const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
    return [x1, y * Math.cos(b) - z1 * Math.sin(b), y * Math.sin(b) + z1 * Math.cos(b)];
  });
  const TIP = 0.15, SPIN = 0.36;                            // the tip, and how fast it turns (rad/s)

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 24;
  const SHOW = [0, 0.4, 23.2, 23.8];
  const SEQ_IN = [0.2, 1.1];                                     // the UniProtKB sequence draws in
  const ENTRY_IN = i => 1.1 + 0.45 * i;                          // the entries appear, each at its own start
  const MARKS = [2.6, 3.1];                                      // the tryptophan, by its author numbers
  const LINES = i => 4.0 + 0.25 * i;                             // SIFTS: lines from each entry to its place in the sequence
  const SLIDE = i => [4.6 + 0.4 * i, 5.9 + 0.4 * i];             // ... and the entries slide there
  const RENUMBER = [7.0, 7.7];                                   // author numbers fade, then UniProtKB numbers come in
  const DOM_ON = [8.8, 9.4];                                     // CATH domains on the sequence
  const DROP = i => [9.6 + 0.35 * i, 10.2 + 0.35 * i];           // ... carried down onto each entry
  const SUM = 11.8;                                              // the heading sums up
  const SQUEEZE = [13.2, 14.4];                                  // the rows move up to make room ...
  const STRUCT_IN = [14.0, 14.9];                                // ... for entry C in 3D
  const PAINT = [15.0, 16.2];                                    // its domains coloured in
  const STILL = 19.5;

  Anim.register('sifts-2023', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;

    /* ---- layout: a column of names, then the bars; at the end the rows close up and the structure goes below ---- */
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 18, bot = h - pad, big = w >= 400, roomy = h >= 200;
    const names = big ? ['UniProtKB', 'PDB A', 'PDB B', 'PDB C'] : ['UniProt', 'A', 'B', 'C'];
    const colW = Math.max(...names.map(n => Anim.measure(ctx, th, n))) + 12;
    const bx0 = pad + colW, bx1 = w - pad, k = (bx1 - bx0) / L, X = r => bx0 + (r - 1) * k;
    const sq = between(s, ...SQUEEZE), held = 1 - between(s, SQUEEZE[0] - 0.5, SQUEEZE[0]);   // held: what only the open layout has room for (gone before the rows move)
    const bh0 = Math.max(9, Math.min(16, h * 0.046)), bh = lerp(bh0, Math.max(6, bh0 * 0.7), sq);
    const room0 = bot - 14 - (top + 16), gap0 = Math.min(80, room0 / 3), gap1 = Math.max(bh + 8, Math.min(26, (bot - top) * 0.1));
    const seqY = lerp(top + 16 + (room0 - 3 * gap0) / 2, top + 16, sq), rowGap = lerp(gap0, gap1, sq);
    const rowY = i => seqY + (i + 1) * rowGap;
    const label = (text, x, y, align, colour, alpha) => { if (alpha < 0.01) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const bar = (x0, x1, y, r = 2) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x0, y - bh / 2, Math.max(1, x1 - x0), bh, r); else ctx.rect(x0, y - bh / 2, Math.max(1, x1 - x0), bh); };
    const colourOf = d => (d.k ? th.spec : th.green);
    const gone = between(s, RENUMBER[0], RENUMBER[0] + 0.3), renum = between(s, RENUMBER[0] + 0.3, RENUMBER[1]), domOn = between(s, ...DOM_ON);

    /* ---- the UniProtKB sequence ---- */
    const grow = between(s, ...SEQ_IN);
    if (grow > 0.01) {
      ctx.globalAlpha = show;
      bar(bx0, bx0 + (bx1 - bx0) * grow, seqY); ctx.fillStyle = mix(th.bg, th.fid, 0.3); ctx.fill();
      ctx.strokeStyle = th.fid; ctx.lineWidth = 1.2; ctx.stroke();
      label(names[0], pad, seqY, 'left', th.fid, grow);
      label('1', bx0, seqY - bh / 2 - 8, 'left', th.muted, grow);
      label(String(L), bx1, seqY - bh / 2 - 8, 'right', th.muted, between(s, SEQ_IN[1] - 0.3, SEQ_IN[1]));
      // its domains, once they're mapped, and their names beneath (while there's room)
      const short = DOMAINS.some(d => Anim.measure(ctx, th, d.names[0]) > X(d.to + 1) - X(d.from) - 4);   // all long names, or all short
      DOMAINS.forEach(d => {
        if (domOn < 0.01) return;
        ctx.globalAlpha = show * domOn; ctx.fillStyle = colourOf(d);
        ctx.fillRect(X(d.from), seqY - bh / 2 + 1.5, X(d.to + 1) - X(d.from), bh - 3);
        label(d.names[short ? 1 : 0], (X(d.from) + X(d.to + 1)) / 2, seqY + bh / 2 + 9, 'center', colourOf(d), domOn * held);
      });
      // the tryptophan, once the entries are mapped
      if (renum > 0.01) {
        ctx.globalAlpha = show * renum; ctx.fillStyle = th.ink;
        const mx = X(MARK) + k / 2;
        ctx.beginPath(); ctx.moveTo(mx - 3.5, seqY - bh / 2 - 6); ctx.lineTo(mx + 3.5, seqY - bh / 2 - 6); ctx.lineTo(mx, seqY - bh / 2 - 1.5); ctx.closePath(); ctx.fill();
        label(AA + MARK, mx, seqY - bh / 2 - 14, 'center', th.ink, renum);
        ctx.globalAlpha = show * renum * 0.7; ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);   // a guide down through every entry
        ctx.beginPath(); ctx.moveTo(mx, seqY + bh / 2 + 2); ctx.lineTo(mx, rowY(2) + bh / 2 + 2); ctx.stroke(); ctx.setLineDash([]);
      }
    }

    /* ---- the domains' edges, as they carry down ---- */
    const guide = envelope(s, [DOM_ON[1], DOM_ON[1] + 0.3, DROP(2)[1] + 0.2, DROP(2)[1] + 0.8]);
    if (guide > 0.01) {
      ctx.globalAlpha = show * guide * 0.8; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      DOMAINS.forEach(d => {
        ctx.strokeStyle = colourOf(d);
        for (const r of [d.from, d.to + 1]) { ctx.beginPath(); ctx.moveTo(X(r), seqY + bh / 2 + 2); ctx.lineTo(X(r), rowY(2) + bh / 2); ctx.stroke(); }
      });
      ctx.setLineDash([]);
    }

    /* ---- the PDB entries ---- */
    ENTRIES.forEach((e, i) => {
      const a = between(s, ENTRY_IN(i), ENTRY_IN(i) + 0.5);
      if (a < 0.01) return;
      const y = rowY(i) + (1 - a) * 6, first = e.from - (e.tag || 0);
      const slide = between(s, ...SLIDE(i)), shift = (1 - slide) * (bx0 - X(first));   // left-aligned at first, then in place
      const P = r => X(r) + shift;
      label(names[i + 1], pad, y, 'left', th.soft, a);

      // SIFTS' lines: from the entry's ends up to their places in the sequence
      const lines = envelope(s, [LINES(i), LINES(i) + 0.3, SLIDE(i)[1] + 0.2, SLIDE(i)[1] + 0.7]);
      if (lines > 0.01) {
        ctx.globalAlpha = show * lines; ctx.strokeStyle = th.fid; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
        for (const r of [e.from, e.to + 1]) { ctx.beginPath(); ctx.moveTo(P(r), y - bh / 2 - 1); ctx.lineTo(X(r), seqY + bh / 2 + 1); ctx.stroke(); }
        ctx.setLineDash([]);
      }

      ctx.globalAlpha = show * a;
      // the tag: not part of the protein, so it never maps (hatched)
      if (e.tag) {
        const x0 = P(first), x1 = P(e.from);
        ctx.save(); bar(x0, x1 - 1, y); ctx.clip();
        ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
        for (let x = x0 - bh; x < x1; x += 3.5) { ctx.beginPath(); ctx.moveTo(x, y + bh / 2); ctx.lineTo(x + bh, y - bh / 2); ctx.stroke(); }
        ctx.restore();
        bar(x0, x1 - 1, y); ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.stroke();
      }
      // the loop that wasn't modelled: just a dashed line
      if (e.gap) {
        ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(P(e.gap[0]), y); ctx.lineTo(P(e.gap[1] + 1), y); ctx.stroke(); ctx.setLineDash([]);
      }
      // the modelled stretches, then the domains on them
      for (const [r0, r1] of pieces(e)) {
        bar(P(r0), P(r1 + 1), y); ctx.fillStyle = mix(th.bg, th.ink, 0.1); ctx.fill();
        ctx.strokeStyle = mix(th.bg, th.ink, 0.55); ctx.lineWidth = 1; ctx.stroke();
        const drop = between(s, ...DROP(i));
        if (drop > 0.01) DOMAINS.forEach(d => {
          const q0 = Math.max(r0, d.from), q1 = Math.min(r1, d.to);
          if (q1 < q0) return;
          ctx.globalAlpha = show * a * drop; ctx.fillStyle = colourOf(d);
          ctx.fillRect(P(q0), y - bh / 2 + 1.5 - (1 - drop) * 4, P(q1 + 1) - P(q0), bh - 3);
          ctx.globalAlpha = show * a;
        });
      }

      // its numbers beneath: the author's, then UniProtKB's (until the rows close up)
      const ny = y + bh / 2 + 8, old = a * (1 - gone);
      label(String(authAt(e, first)).replace('-', '−'), P(first), ny, 'left', th.muted, old);
      if (big) label(String(authAt(e, e.to)), P(e.to + 1), ny, 'right', th.muted, old);
      label(String(e.from), P(e.from), ny, 'left', th.fid, a * renum * held);
      if (big) label(String(e.to), P(e.to + 1), ny, 'right', th.fid, a * renum * held);
      if (e.tag && big) label('tag', P(first) - 4, ny, 'right', th.muted, a * renum * held);

      // the tryptophan, where this entry has it
      if (MARK >= e.from && MARK <= e.to) {
        const ma = a * between(s, ...MARKS);
        if (ma > 0.01) {
          const mx = P(MARK) + k / 2;
          ctx.globalAlpha = show * ma; ctx.fillStyle = th.ink;
          ctx.beginPath(); ctx.moveTo(mx - 3.5, y - bh / 2 - 6); ctx.lineTo(mx + 3.5, y - bh / 2 - 6); ctx.lineTo(mx, y - bh / 2 - 1.5); ctx.closePath(); ctx.fill();
          if (roomy) {
            label(AA + authAt(e, MARK), mx, y - bh / 2 - 14, 'center', th.ink, ma * (1 - gone));
            label(AA + MARK, mx, y - bh / 2 - 14, 'center', th.fid, ma * renum * held);
          }
        }
      }
    });

    /* ---- entry C in 3D, below the rows: turning, its domains coloured as on the bars ---- */
    const sa = between(s, ...STRUCT_IN);
    if (sa > 0.01) {
      const sy0 = rowY(2) + bh / 2 + 8, sy1 = bot, ang = 0.9 + SPIN * (s - STRUCT_IN[0]);
      const sc = Math.min((bx1 - bx0) / (2 * R_XZ + 2 * RAD), (sy1 - sy0) / (2 * (R_Y * Math.cos(TIP) + R_XZ * Math.sin(TIP)) + 2 * RAD));
      const pos = view(ang, TIP), cx = (bx0 + bx1) / 2, cy = (sy0 + sy1) / 2 + (1 - sa) * 8;
      const X3 = p => [cx + p[0] * sc, cy - p[1] * sc];
      const paintOn = between(s, ...PAINT);
      const paint = r => { const d = domainOf(r); return d ? [colourOf(d), paintOn] : [th.ink, 0]; };
      ctx.globalAlpha = show * sa;
      cartoon(ctx, pos, X3, sc, th, paint);
      // the loop that wasn't modelled, dashed across; the tryptophan, marked
      const g0 = X3(pos[GAP[0] - 1 - FIRST]), g1 = X3(pos[GAP[1] + 1 - FIRST]);
      ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(g0[0], g0[1]); ctx.lineTo(g1[0], g1[1]); ctx.stroke(); ctx.setLineDash([]);
      const m = X3(pos[MARK - FIRST]), mr = Math.max(2.2, 0.55 * sc);
      ctx.fillStyle = th.ink; ctx.beginPath(); ctx.arc(m[0], m[1], mr, 0, TAU); ctx.fill();
      if (roomy && paintOn > 0.01) {                          // named off to the left, with a dashed leader to it
        const lx = cx - R_XZ * sc - 6;
        label(AA + MARK, lx, m[1], 'right', th.ink, sa * paintOn);
        ctx.globalAlpha = show * sa * paintOn * 0.8; ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
        ctx.beginPath(); ctx.moveTo(lx + 3, m[1]); ctx.lineTo(m[0] - mr - 2, m[1]); ctx.stroke(); ctx.setLineDash([]);
      }
      label(names[3], pad, (sy0 + sy1) / 2, 'left', th.soft, sa);
    }

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    const pick = (left, right) => {
      for (const l of left) { const r = right.find(q => Anim.measure(ctx, th, l) + Anim.measure(ctx, th, q) + 16 <= room); if (r) return [l, r]; }
      return [left.find(l => Anim.measure(ctx, th, l) <= room) || left[left.length - 1], null];
    };
    const heading = (alpha, left, right, colour) => {
      if (alpha < 0.01) return;
      const [L0, R0] = pick(left, right);
      label(L0, pad, ly, 'left', th.ink, alpha);
      if (R0) label(R0, w - pad, ly, 'right', colour, alpha);
    };
    const B0 = LINES(0) - 0.2, C0 = DOM_ON[0] - 0.2, E0 = STRUCT_IN[0];
    heading(1 - between(s, B0 - 0.3, B0), ['One protein, multiple PDB entries', 'Multiple PDB entries', 'PDB entries'], ['each numbered its own way', 'own numbering'], th.soft);
    heading(between(s, B0, B0 + 0.3) * (1 - between(s, C0 - 0.3, C0)), ['SIFTS maps each residue', 'SIFTS mapping'], ['to its UniProtKB position', 'to UniProtKB'], th.fid);
    heading(between(s, C0, C0 + 0.3) * (1 - between(s, SUM - 0.3, SUM)), ['Annotations follow', 'Annotations'], ['CATH domains, one split in two', 'CATH domains'], th.soft);
    heading(between(s, SUM, SUM + 0.4) * (1 - between(s, E0 - 0.3, E0)), ['In every PDBx/mmCIF file', 'In each mmCIF file', 'In mmCIF'], ['one numbering for all', 'one numbering'], th.fid);
    heading(between(s, E0, E0 + 0.4), ['Onto the 3D structure', 'Onto the structure', 'Onto 3D'], ['straight from the mmCIF file', 'from mmCIF'], th.fid);
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
