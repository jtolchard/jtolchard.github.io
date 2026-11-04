/* ==========================================================================
   modelcif-2023: what ModelCIF adds to the PDB's format.
   A file card. First the sections PDBx/mmCIF already has (atomic
   coordinates, molecular components, software, citation, authors), drawn
   plain, with a computed model beside the card; then the sections ModelCIF
   adds for computed models, tinted, each in turn with a small picture of what
   it holds: the target, templates and alignments; the modelling protocol;
   associated files (MSAs, pair scores); and model quality. With that last,
   the model colours by its per-residue confidence (pLDDT) and its per-pair
   error (PAE) map builds out from the diagonal.
   The model is a generic three-helix bundle with loose ends; its scores are
   illustrative.
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

  /* ---- the model: three helices in a bundle, with loose ends (Cα, Å) ---- */
  const FIRST = 1, LAST = 68;
  const HELICES = [[7, 22], [27, 42], [47, 62]];
  const MODEL = (() => {
    const rand = Anim.seeded(11), pos = {};
    const AX = [{ x: -5.5, z: 0, up: 1 }, { x: 5.5, z: -1, up: -1 }, { x: 0, z: 8.5, up: 1 }];   // ~10 Å apart
    HELICES.forEach(([a, b], k) => {                       // ideal helices: 1.5 Å a residue, 100° a turn, radius 2.3 Å
      const n = b - a + 1, half = (1.5 * (n - 1)) / 2;
      for (let i = 0; i < n; i++) {
        const ang = (i * 100 * Math.PI) / 180 + k;
        pos[a + i] = [AX[k].x + 2.3 * Math.cos(ang), AX[k].up * (-half + 1.5 * i), AX[k].z + 2.3 * Math.sin(ang)];
      }
    });
    for (let k = 0; k < HELICES.length - 1; k++) {         // each loop arcs out past the helices' ends
      const r0 = HELICES[k][1] + 1, r1 = HELICES[k + 1][0] - 1, P0 = pos[r0 - 1], P1 = pos[r1 + 1], n = r1 - r0 + 1;
      for (let r = r0; r <= r1; r++) {
        const u = (r - r0 + 1) / (n + 1), b = Math.sin(Math.PI * u);
        pos[r] = [lerp(P0[0], P1[0], u), lerp(P0[1], P1[1], u) + AX[k].up * 4.5 * b, lerp(P0[2], P1[2], u) + 1.5 * b];
      }
    }
    // the loose ends: a wandering chain, 3.8 Å a step
    const tail = (from, to, step, dir) => {
      let p = pos[from];
      for (let r = from + step; step > 0 ? r <= to : r >= to; r += step) {
        dir = unit([dir[0] + (rand() - 0.5) * 1.6, dir[1] + (rand() - 0.5) * 1.6, dir[2] + (rand() - 0.5) * 1.6]);
        p = [p[0] + 3.8 * dir[0], p[1] + 3.8 * dir[1], p[2] + 3.8 * dir[2]]; pos[r] = p;
      }
    };
    tail(HELICES[0][0], FIRST, -1, [-0.55, -0.75, 0.35]);
    tail(HELICES[2][1], LAST, 1, [0.6, 0.65, 0.3]);
    const out = []; for (let r = FIRST; r <= LAST; r++) out.push(pos[r]);
    return out;
  })();
  // its confidence, per residue (pLDDT, 0–100): high in the helices, lower in the loops, low at the loose ends
  const PLDDT = (() => {
    const rand = Anim.seeded(5), v = [];
    for (let r = FIRST; r <= LAST; r++) {
      const hx = HELICES.find(([a, b]) => r >= a && r <= b);
      let p;
      if (hx) { const e = Math.min(r - hx[0], hx[1] - r); p = 95 - (e < 2 ? 9 - 4 * e : 0) - 4 * rand(); }
      else if (r < HELICES[0][0]) p = 26 + (36 * (r - FIRST)) / (HELICES[0][0] - FIRST) + 6 * rand();
      else if (r > HELICES[2][1]) p = 64 - (36 * (r - HELICES[2][1])) / (LAST - HELICES[2][1]) + 6 * rand();
      else p = 70 + 8 * rand();
      v.push(p);
    }
    return v;
  })();
  const band = p => (p >= 90 ? 0 : p >= 70 ? 1 : p >= 50 ? 2 : 3);   // AlphaFold's four bands: >90, 70–90, 50–70, <50
  // its expected error between residue pairs (PAE, Å), on a grid of two residues a cell: small within the bundle,
  // large wherever a loose end is involved
  const NB = (LAST - FIRST + 1) / 2;
  const PAE = (() => {
    const pl = Array.from({ length: NB }, (_, i) => (PLDDT[2 * i] + PLDDT[2 * i + 1]) / 2), m = [];
    for (let i = 0; i < NB; i++) for (let j = 0; j < NB; j++) m.push(i === j ? 0.5 : Math.min(30, 1 + 0.16 * (200 - pl[i] - pl[j]) + 0.08 * Math.abs(i - j)));
    return m;
  })();

  /* ---- the model, drawn ---- */
  const RAD = 2.8;                                          // cylinder radius, Å
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
  // the cartoon: shaded cylinders for the helices, thick tubes for the loops, painted back to front; paint(r) gives
  // each residue's colour and how much of it to show (0: plain)
  function cartoon(ctx, pos, X, sc, th, paint) {
    const AX = axes(pos), prims = [];
    const loops = [[null, FIRST, HELICES[0][0] - 1, 0]];
    for (let k = 0; k < HELICES.length - 1; k++) loops.push([k, HELICES[k][1] + 1, HELICES[k + 1][0] - 1, k + 1]);
    loops.push([HELICES.length - 1, HELICES[HELICES.length - 1][1] + 1, LAST, null]);
    for (const [from, r0, r1, to] of loops) {               // from one cylinder's end, through the loop's Cα, to the next one's start
      const ctrl = [], res = [];
      if (from !== null) { ctrl.push(AX[from].P1); res.push(AX[from].b); }
      for (let r = r0; r <= r1; r++) { ctrl.push(pos[r - FIRST]); res.push(r); }
      if (to !== null) { ctrl.push(AX[to].P0); res.push(AX[to].a); }
      // where a loop meets a cylinder's end it is drawn wholly in front of that end if the end faces us, else behind it
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
          prims.push({ z, seg: [prev, p], res: res[k <= 3 ? i : i + 1] });
          prev = p;
        }
      }
    }
    for (const A of AX) prims.push({ z: (A.P0[2] + A.P1[2]) / 2 + 0.5, cyl: A });
    prims.sort((p, q) => p.z - q.z);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const lw = Math.max(1.2, 0.17 * sc), R = RAD * sc, tubeW = Math.max(2.2, 0.42 * sc);
    for (const p of prims) {
      if (p.seg) {
        const a = X(p.seg[0]), b = X(p.seg[1]), [c, f] = paint(p.res);
        ctx.strokeStyle = mix(th.ink, c, f); ctx.lineWidth = tubeW;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        continue;
      }
      const A = p.cyl, p0 = X(A.P0), p1 = X(A.P1), L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
      const u = [(p1[0] - p0[0]) / L, (p1[1] - p0[1]) / L], n = [-u[1], u[0]], ang = Math.atan2(u[1], u[0]);
      const ry = R, rx = Math.max(1, R * Math.abs(A.d[2]));
      const [back, front] = A.d[2] > 0 ? [p0, p1] : [p1, p0];
      const span = [Math.min(p0[0], p1[0]) - R * 2, Math.min(p0[1], p1[1]) - R * 2, Math.abs(p1[0] - p0[0]) + R * 4, Math.abs(p1[1] - p0[1]) + R * 4];
      // the body (with its far end), filled: base colour, a band per coloured residue, then shading across it
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p0[0] + n[0] * R, p0[1] + n[1] * R); ctx.lineTo(p1[0] + n[0] * R, p1[1] + n[1] * R);
      ctx.lineTo(p1[0] - n[0] * R, p1[1] - n[1] * R); ctx.lineTo(p0[0] - n[0] * R, p0[1] - n[1] * R); ctx.closePath();
      const cw = (p1[0] - p0[0]) * n[1] - (p1[1] - p0[1]) * n[0] < 0;   // (the far end winds the same way as the body)
      ctx.moveTo(back[0] + rx * Math.cos(ang), back[1] + rx * Math.sin(ang)); ctx.ellipse(back[0], back[1], rx, ry, ang, 0, TAU, !cw);
      ctx.clip();
      ctx.fillStyle = mix(th.bg, th.ink, 0.06); ctx.fillRect(...span);
      const sAt = s => [p0[0] + (u[0] * L * (s - A.s0)) / (A.s1 - A.s0), p0[1] + (u[1] * L * (s - A.s0)) / (A.s1 - A.s0)];
      for (let r = A.a; r <= A.b; r++) {
        const [c, f] = paint(r);
        if (f < 0.01) continue;
        const s = A.at(r), q0 = sAt(s - 0.78), q1 = sAt(s + 0.78);
        ctx.fillStyle = mix(th.bg, c, 0.9 * f);
        ctx.beginPath(); ctx.moveTo(q0[0] + n[0] * R * 1.2, q0[1] + n[1] * R * 1.2); ctx.lineTo(q1[0] + n[0] * R * 1.2, q1[1] + n[1] * R * 1.2);
        ctx.lineTo(q1[0] - n[0] * R * 1.2, q1[1] - n[1] * R * 1.2); ctx.lineTo(q0[0] - n[0] * R * 1.2, q0[1] - n[1] * R * 1.2); ctx.fill();
      }
      const g = ctx.createLinearGradient(p0[0] + n[0] * R, p0[1] + n[1] * R, p0[0] - n[0] * R, p0[1] - n[1] * R);
      g.addColorStop(0, rgba(th.ink, 0.04)); g.addColorStop(0.35, rgba(th.ink, 0)); g.addColorStop(1, rgba(th.ink, 0.38));
      ctx.fillStyle = g; ctx.fillRect(...span);
      ctx.restore();
      // the near end, then the outline: both long sides, the near end all round, the far end's outer half
      const [ce, fe] = paint(front === p1 ? A.b : A.a);
      const ge = ctx.createLinearGradient(front[0] + n[0] * R, front[1] + n[1] * R, front[0] - n[0] * R, front[1] - n[1] * R);
      ge.addColorStop(0, mix(mix(th.bg, th.ink, 0.16), ce, 0.75 * fe)); ge.addColorStop(1, mix(mix(th.bg, th.ink, 0.36), ce, 0.85 * fe));
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
  // the model turned to a view: about its long axis by a, tipped towards us by b, then leant over by ROLL
  const ROLL = -0.42;
  const view = (a, b) => MODEL.map(([x, y, z]) => {
    const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
    const y2 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
    return [x1 * Math.cos(ROLL) - y2 * Math.sin(ROLL), x1 * Math.sin(ROLL) + y2 * Math.cos(ROLL), z2];
  });
  const TURN = 0.2, TIP = 0.25, SWAY = 0.15;                // the view (all three helices apart), and how far it sways either way

  // a document with a folded corner
  function doc(ctx, x, y, w, h, th, fill = th.surface) {
    const f = Math.min(Math.min(w, h) * 0.22, 14);
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w - f, y); ctx.lineTo(x + w, y + f); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - f, y); ctx.lineTo(x + w - f, y + f); ctx.lineTo(x + w, y + f); ctx.stroke();
  }
  const box = (ctx, x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };

  /* ---- the file's sections ---- */
  const OLD = [['atomic coordinates', 'coordinates'], ['molecular components', 'molecules'], ['software · citation · authors', 'software · authors', 'metadata']];
  const NEW = [['targets · templates · alignments', 'templates · alignments', 'inputs'], ['modelling protocol', 'protocol'], ['associated files', 'files'], ['model quality', 'quality']];
  const SAYS = [['target–template alignment', 'alignment'], ['each step, and its software', 'the steps'], ['big data, in linked files', 'linked files'], ['how far to trust it', 'confidence']];
  const STEPS = ['search', 'align', 'build'];               // homology modelling: find templates, align, build coordinates

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 21;
  const SHOW = [0, 0.4, 20.0, 20.6];
  const OLD_IN = k => 0.5 + 0.5 * k;                        // PDBx/mmCIF's own sections appear, with the model
  const ADD = 3.0;                                          // the heading turns to ModelCIF
  const NEW_IN = k => 3.4 + 2.6 * k;                        // ModelCIF's sections slide in, one at a time
  const DONE = 15.4;                                        // all in; the heading sums up
  const UNTIL = k => (k < NEW.length - 1 ? NEW_IN(k + 1) : DONE);
  const COLOUR = [NEW_IN(3) + 0.5, NEW_IN(3) + 1.8];       // the model colours by pLDDT, N to C
  const PAE_IN = [NEW_IN(3) + 1.4, NEW_IN(3) + 3.0];       // the PAE map builds out from its diagonal
  const STILL = 17;

  const paeCache = {};
  function paeColours(th) {                                 // the map's cells, coloured (deep green: small error)
    const key = th.bg + th.green + th.ink, deep = mix(th.green, th.ink, 0.3);
    return paeCache[key] || (paeCache[key] = PAE.map(e => mix(th.bg, deep, Math.pow(Math.max(0, 1 - e / 26), 1.3))));
  }

  Anim.register('modelcif-2023', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;

    /* ---- layout: the card on the left; the model, and a picture of the section in hand, on the right ---- */
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 16, bot = h - pad, big = w >= 400;
    const cw = (w - 2 * pad) * 0.5, gap = Math.max(10, w * 0.035);
    const headH = 20, rows = OLD.length + NEW.length;
    const rowH = Math.max(14, Math.min(34, (bot - top - headH - 8) / rows)), cardH = headH + rows * rowH + 6;
    const cx0 = pad, cy0 = top + (bot - top - cardH) / 2, cy1 = cy0 + cardH;
    const rx0 = pad + cw + gap, rx1 = w - pad;
    const ry0 = Math.min(cy0, top + 4), ry1 = Math.max(cy1, bot - 4);   // the right-hand column: the card's height, or more where there's room
    const tagH = 16, protY0 = ry0 + tagH, protY1 = ry0 + (ry1 - ry0) * 0.63;
    const slot = { x0: rx0, x1: rx1, y0: protY1 + 8, y1: ry1 };
    const compact = rowH < 18;                            // small panels: rows without outlines, so the words fit
    const rowAt = i => ({ x: cx0 + 6, y: cy0 + headH + 3 + i * rowH, w: cw - 12, h: rowH - (compact ? 1 : 3) });
    const fit = (opts, room) => opts.find(o => Anim.measure(ctx, th, o) <= room) || opts[opts.length - 1];
    const now = NEW.reduce((a, _, k) => (s >= NEW_IN(k) ? k : a), -1);   // the ModelCIF section in hand

    /* ---- the card ---- */
    ctx.globalAlpha = show;
    doc(ctx, cx0, cy0, cw, cardH, th);
    Anim.label(ctx, th, 'model.cif', cx0 + 8, cy0 + headH / 2 + 1, 'left', th.soft);
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx0 + 6, Math.round(cy0 + headH) + 0.5); ctx.lineTo(cx0 + cw - 6, Math.round(cy0 + headH) + 0.5); ctx.stroke();
    // PDBx/mmCIF's own sections, plain
    OLD.forEach((names, k) => {
      const a = between(s, OLD_IN(k), OLD_IN(k) + 0.4);
      if (a < 0.01) return;
      const r = rowAt(k);
      ctx.globalAlpha = show * a;
      if (!compact) { box(ctx, r.x, r.y, r.w, r.h, 3); ctx.strokeStyle = mix(th.bg, th.ink, 0.28); ctx.lineWidth = 1; ctx.stroke(); }
      Anim.label(ctx, th, fit(names, r.w - 14), r.x + 7, r.y + r.h / 2 + 0.5, 'left', th.soft);
    });
    // ModelCIF's, tinted, each sliding in; the one in hand outlined more strongly
    NEW.forEach((names, k) => {
      const a = between(s, NEW_IN(k), NEW_IN(k) + 0.5);
      if (a < 0.01) return;
      const r = rowAt(OLD.length + k), hl = envelope(s, [NEW_IN(k), NEW_IN(k) + 0.4, UNTIL(k) - 0.3, UNTIL(k)]);
      const y = r.y + (1 - a) * 6;
      ctx.globalAlpha = show * a;
      box(ctx, r.x, y, r.w, r.h, 3); ctx.fillStyle = rgba(th.fid, 0.1 + 0.06 * hl); ctx.fill();
      if (!compact || hl > 0.01) { ctx.globalAlpha = show * a * (compact ? hl : 1); ctx.strokeStyle = mix(mix(th.bg, th.fid, 0.55), th.fid, hl); ctx.lineWidth = 1 + 0.6 * hl; ctx.stroke(); ctx.globalAlpha = show * a; }
      Anim.label(ctx, th, fit(names, r.w - 14), r.x + 7, y + r.h / 2 + 0.5, 'left', th.ink);
    });

    // a dashed link from a section to what it holds: the coordinates to the model, then each ModelCIF section to its
    // picture; each picture notes where its near edge is (anchors), and the links are drawn once they're all placed
    const anchors = {};
    const link = (i, [tx, ty], alpha) => {
      if (alpha < 0.01) return;
      const r = rowAt(i);
      ctx.globalAlpha = show * alpha; ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(r.x + r.w + 2, r.y + r.h / 2); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([]);
    };

    /* ---- the model: plain until its quality is added, then coloured by pLDDT ---- */
    const ma = between(s, OLD_IN(0), OLD_IN(0) + 0.6);
    if (ma > 0.01) {
      const ang = TURN + SWAY * Math.sin((TAU * 2 * s) / CYCLE), pos = view(ang, TIP);
      // scale to fit the model however it sways; centre on the bundle
      let ext = [0, 0];
      for (const a of [TURN - SWAY, TURN, TURN + SWAY]) {
        const v = view(a, TIP), cx = v.reduce((q, p) => q + p[0], 0) / v.length, cyy = v.reduce((q, p) => q + p[1], 0) / v.length;
        for (const p of v) ext = [Math.max(ext[0], Math.abs(p[0] - cx)), Math.max(ext[1], Math.abs(p[1] - cyy))];
      }
      const sc = Math.min((rx1 - rx0) / (2 * ext[0] + 2 * RAD), (protY1 - protY0) / (2 * ext[1] + 2 * RAD));
      const c = [pos.reduce((q, p) => q + p[0], 0) / pos.length, pos.reduce((q, p) => q + p[1], 0) / pos.length];
      const px = (rx0 + rx1) / 2, py = (protY0 + protY1) / 2;
      const X = p => [px + (p[0] - c[0]) * sc, py - (p[1] - c[1]) * sc];
      const cols = [th.fid, mix(th.fid, th.bg, 0.45), mix(th.spec, th.bg, 0.4), th.spec];
      const paint = r => { const at = lerp(COLOUR[0], COLOUR[1] - 0.3, (r - FIRST) / (LAST - FIRST)); return [cols[band(PLDDT[r - FIRST])], between(s, at, at + 0.3)]; };
      ctx.globalAlpha = show * ma;
      cartoon(ctx, pos, X, sc, th, paint);
      let left = null;
      for (const [a0, b0] of HELICES) for (let r = a0; r <= b0; r++) { const q = X(pos[r - FIRST]); if (!left || q[0] < left[0]) left = q; }
      anchors.model = [left[0] - RAD * sc - 4, left[1]];
      const tag = between(s, COLOUR[0], COLOUR[0] + 0.4);
      if (tag > 0.01) { ctx.globalAlpha = show * tag; Anim.label(ctx, th, fit(['pLDDT, per residue', 'pLDDT'], rx1 - rx0), (rx0 + rx1) / 2, ry0 + tagH / 2 - 2, 'center', th.soft); }
    }

    /* ---- the picture for the section in hand ---- */
    const sw = slot.x1 - slot.x0, sh = slot.y1 - slot.y0, smid = (slot.y0 + slot.y1) / 2;
    const pic = k => (k < NEW.length - 1 ? envelope(s, [NEW_IN(k) + 0.2, NEW_IN(k) + 0.6, UNTIL(k) - 0.1, UNTIL(k) + 0.3]) : between(s, NEW_IN(k) + 0.2, NEW_IN(k) + 0.6));
    // 0. the target and a template, aligned (a gap where the template has no residues)
    let a = pic(0);
    if (a > 0.01) {
      ctx.globalAlpha = show * a;
      const names = big ? ['target', 'template'] : null, lw = names ? Anim.measure(ctx, th, 'template') + 8 : 0;
      const x0 = slot.x0 + lw, n = Math.max(10, Math.floor((slot.x1 - x0) / 6)), cell = (slot.x1 - x0) / n, grow = between(s, NEW_IN(0) + 0.4, NEW_IN(0) + 1.5);
      anchors[0] = [slot.x0 - 4, smid];
      [smid - 9, smid + 9].forEach((y, row) => {
        if (names) Anim.label(ctx, th, names[row], slot.x0, y, 'left', row ? th.soft : th.fid);
        for (let i = 0; i < n * grow; i++) {
          const gapHere = row === 1 && i > n * 0.38 && i < n * 0.56;
          if (gapHere) { ctx.fillStyle = th.muted; ctx.fillRect(x0 + i * cell, y - 0.5, cell, 1); continue; }
          ctx.fillStyle = row ? mix(th.bg, th.ink, 0.42) : th.fid; ctx.fillRect(x0 + i * cell + 0.5, y - 4.5, cell - 1.5, 9);
        }
      });
    }
    // 1. the protocol's steps, lit in turn: as chips in a row, or a column, or (small panels) dots with the step's name
    a = pic(1);
    if (a > 0.01) {
      const ww = STEPS.map(x => Anim.measure(ctx, th, x) + 10), arrow = 12, across = ww.reduce((q, x) => q + x, 0) + arrow * 2 <= sw;
      const at = j => NEW_IN(1) + 0.5 + 0.6 * j, lit = STEPS.map((_, j) => between(s, at(j), at(j) + 0.3));
      ctx.globalAlpha = show * a;
      if (!across && sh < 3 * 16 + 8) {
        const step = Math.min(26, (sw - 12) / 2), x0 = (slot.x0 + slot.x1) / 2 - step, y = smid - 7;
        anchors[1] = [x0 - 9, y];
        STEPS.forEach((name, j) => {
          const x = x0 + j * step;
          ctx.beginPath(); ctx.arc(x, y, 4.5, 0, TAU); ctx.fillStyle = mix(th.surface, th.fid, lit[j]); ctx.fill();
          ctx.strokeStyle = mix(th.rule, th.fid, lit[j]); ctx.lineWidth = 1.2; ctx.stroke();
          if (j < STEPS.length - 1) {
            ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(x + 8, y); ctx.lineTo(x + step - 8, y); ctx.moveTo(x + step - 11, y - 2.5); ctx.lineTo(x + step - 8, y); ctx.lineTo(x + step - 11, y + 2.5); ctx.stroke();
          }
          const say = between(s, at(j) + 0.15, at(j) + 0.3) * (j < STEPS.length - 1 ? 1 - between(s, at(j + 1), at(j + 1) + 0.15) : 1);   // one name at a time
          if (say > 0.01) { ctx.globalAlpha = show * a * say; Anim.label(ctx, th, name, (slot.x0 + slot.x1) / 2, y + 15, 'center', th.ink); ctx.globalAlpha = show * a; }
        });
      } else {
        const chipH = across ? Math.min(18, sh - 8) : Math.min(18, (sh - 8) / 3 - 4), total = ww.reduce((q, v) => q + v, 0) + arrow * 2;
        anchors[1] = across ? [slot.x0 + (sw - total) / 2 - 4, smid] : [slot.x0 + (sw - Math.max(...ww)) / 2 - 10, slot.y0 + 2 + chipH / 2];
        STEPS.forEach((name, j) => {
          const cwj = across ? ww[j] : Math.max(...ww);
          const x = across ? slot.x0 + (sw - total) / 2 + ww.slice(0, j).reduce((q, v) => q + v, 0) + arrow * j : slot.x0 + (sw - cwj) / 2;
          const y = across ? smid - chipH / 2 : slot.y0 + 2 + j * (chipH + 4);
          box(ctx, x, y, cwj, chipH, 3); ctx.fillStyle = th.surface; ctx.fill();
          ctx.strokeStyle = mix(th.rule, th.fid, lit[j]); ctx.lineWidth = 1 + 0.4 * lit[j]; ctx.stroke();
          Anim.label(ctx, th, name, x + cwj / 2, y + chipH / 2 + 0.5, 'center', mix(th.muted, th.ink, lit[j]));
          if (j < STEPS.length - 1) {                       // an arrow on to the next step
            ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.beginPath();
            if (across) { const ax = x + cwj + 3, ay = smid; ctx.moveTo(ax, ay); ctx.lineTo(ax + arrow - 6, ay); ctx.moveTo(ax + arrow - 9, ay - 3); ctx.lineTo(ax + arrow - 6, ay); ctx.lineTo(ax + arrow - 9, ay + 3); }
            else { const ax = x - 6, ay = y + chipH / 2; ctx.moveTo(ax, ay); ctx.lineTo(ax, ay + chipH + 4); ctx.moveTo(ax - 2.5, ay + chipH + 1); ctx.lineTo(ax, ay + chipH + 4); ctx.lineTo(ax + 2.5, ay + chipH + 1); }
            ctx.stroke();
          }
        });
      }
    }
    // 2. associated files: the big data, kept in files of their own
    a = pic(2);
    if (a > 0.01) {
      const fh = Math.min(sh - 17, Math.max(40, w * 0.14)), fw = fh * 0.78, names = ['MSA', 'PAE'], step = Math.max(fw + 22, Anim.measure(ctx, th, 'MSA') + 18);
      names.forEach((name, j) => {
        const b = between(s, NEW_IN(2) + 0.4 + 0.35 * j, NEW_IN(2) + 0.8 + 0.35 * j);
        const x = (slot.x0 + slot.x1) / 2 + (j - 0.5) * step - fw / 2, y = slot.y0 + (sh - fh - 16) / 2 + (1 - b) * 4;
        if (j === 0) anchors[2] = [x - 4, slot.y0 + (sh - 16) / 2];
        ctx.globalAlpha = show * a * b;
        doc(ctx, x, y, fw, fh, th);
        ctx.strokeStyle = th.rule; ctx.lineWidth = 1;            // a few lines of text on each
        for (let q = 0; q < 3; q++) { const ty = y + fh * (0.42 + 0.17 * q); ctx.beginPath(); ctx.moveTo(x + fw * 0.18, ty); ctx.lineTo(x + fw * (q === 2 ? 0.55 : 0.82), ty); ctx.stroke(); }
        Anim.label(ctx, th, name, x + fw / 2, y + fh + 9, 'center', th.soft);
      });
    }
    // 3. model quality: the PAE map, building out from its diagonal
    a = pic(3);
    if (a > 0.01) {
      const side = Math.max(24, Math.min(sw * 0.7, sh - 18)), mx = (slot.x0 + slot.x1) / 2 - side / 2, my = slot.y0 + (sh - side - 16) / 2;
      anchors[3] = [mx - 4, my + side / 2];
      const cell = side / NB, colours = paeColours(th), reach = NB * between(s, ...PAE_IN);
      ctx.globalAlpha = show * a;
      for (let i = 0; i < NB; i++) for (let j = 0; j < NB; j++) {
        if (Math.abs(i - j) > reach) continue;
        ctx.fillStyle = colours[i * NB + j]; ctx.fillRect(mx + j * cell, my + i * cell, cell + 0.4, cell + 0.4);
      }
      ctx.strokeStyle = th.rule; ctx.lineWidth = 1; ctx.strokeRect(Math.round(mx) - 0.5, Math.round(my) - 0.5, Math.round(side) + 1, Math.round(side) + 1);
      ctx.globalAlpha = show * a * between(s, PAE_IN[0], PAE_IN[0] + 0.4);
      Anim.label(ctx, th, fit(['PAE, per residue pair', 'PAE'], sw), (slot.x0 + slot.x1) / 2, my + side + 10, 'center', th.soft);
    }

    /* ---- the links ---- */
    if (anchors.model) link(0, anchors.model, envelope(s, [OLD_IN(0) + 0.3, OLD_IN(0) + 0.7, ADD - 0.4, ADD]));
    if (now >= 0) link(OLD.length + now, anchors[now] || [slot.x0 - 4, smid], envelope(s, [NEW_IN(now) + 0.3, NEW_IN(now) + 0.7, UNTIL(now) - 0.3, UNTIL(now)]));

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    // the left words, and the longest right words that fit beside them
    const pick = (left, right) => {
      for (const l of left) { const r = right.find(q => Anim.measure(ctx, th, l) + Anim.measure(ctx, th, q) + 16 <= room); if (r) return [l, r]; }
      return [fit(left, room), null];
    };
    const heading = (alpha, [L, R], colour) => {
      if (alpha < 0.01) return;
      ctx.globalAlpha = show * alpha; Anim.label(ctx, th, L, pad, ly, 'left', th.ink);
      if (R) Anim.label(ctx, th, R, w - pad, ly, 'right', colour);
    };
    heading(1 - between(s, ADD - 0.3, ADD), pick(['PDBx/mmCIF'], ["the PDB's own format", "the PDB's format"]), th.soft);
    // while ModelCIF's sections come in: "ModelCIF adds" on the left, and what the section in hand holds on the right
    const mid = between(s, ADD, ADD + 0.3) * (1 - between(s, DONE - 0.3, DONE));
    if (mid > 0.01) {
      const lefts = ['ModelCIF adds', '+ ModelCIF'], L = lefts.find(l => SAYS.every(say => say.some(q => Anim.measure(ctx, th, l) + Anim.measure(ctx, th, q) + 16 <= room))) || lefts[1];
      heading(mid, [L, null], th.fid);
      NEW.forEach((_, k) => {
        const ra = envelope(s, [NEW_IN(k), NEW_IN(k) + 0.3, UNTIL(k) - 0.3, UNTIL(k)]), R = SAYS[k].find(q => Anim.measure(ctx, th, L) + Anim.measure(ctx, th, q) + 16 <= room);
        if (ra > 0.01 && R) { ctx.globalAlpha = show * mid * ra; Anim.label(ctx, th, R, w - pad, ly, 'right', th.fid); }
      });
    }
    heading(between(s, DONE, DONE + 0.4), pick(['ModelCIF'], ["computed models, in the PDB's format", "in the PDB's format"]), th.soft);
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
