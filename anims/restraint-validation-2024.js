/* ==========================================================================
   restraint-validation-2024: from restraint files to a validation report.
   1. Restraint files in the community's formats (CYANA, Xplor-NIH, ARIA and
      NEF, each drawn with its own mark) go to the wwPDB's deposition server,
      OneDep, which turns them into one NMR-STAR file; a copy goes to the BMRB.
   2. Model vs data: the NMR-STAR file's restraints are checked one by one
      against the model (here AVR3a11, PDB 3ZGK, with nine of its real
      long-range restraints; the verdicts are illustrative): green,
      satisfied; orange, a small violation; red, a large one. Then the
      restraint counts by category (3ZGK's deposited NOEs), violated parts
      hatched.
   3. Knowledge-based validation: Ramachandran outliers, atomic clashes,
      bond lengths and chemical shifts, checked in turn, filling in the
      report's percentile sliders (illustrative).
   4. The result is the wwPDB validation report: a simple cartoon of its
      front page (logo, title, banner, links, the table of software
      versions, the diagonal watermark), produced on deposition and on
      public release.
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
  const FIRST = 63, LAST = 132;
  const HELICES = [[70, 83], [88, 99], [102, 111], [118, 131]];
  // AVR3a11, model 5 of PDB 3ZGK (residues 63–132): Cα in Å, in the same view as its own animation
  const MODEL = [[-17.1,7.4,10.2],[-18.4,4.1,9.0],[-16.7,3.4,5.7],[-13.5,5.2,4.9],[-12.8,8.6,6.5],[-9.5,8.1,8.4],[-6.3,7.0,6.7],[-4.1,9.9,6.1],[-2.6,7.8,3.3],[0.0,6.4,5.7],[2.0,9.7,5.5],[1.8,9.4,1.8],[2.8,5.7,2.0],[6.1,6.5,3.6],[6.6,9.3,1.1],[6.1,7.1,-1.9],[7.9,4.2,0.0],[11.0,6.3,-0.2],[10.4,6.7,-3.9],[9.8,3.0,-4.6],[12.8,1.9,-2.4],[15.0,4.1,-4.5],[13.4,3.2,-7.8],[10.8,0.5,-8.5],[9.8,1.8,-12.0],[6.7,3.6,-10.6],[6.1,0.7,-8.2],[3.3,-1.3,-9.8],[0.8,1.7,-10.1],[1.6,2.9,-6.6],[0.8,-0.5,-5.3],[-2.4,-0.5,-7.3],[-3.5,2.8,-5.8],[-2.9,1.2,-2.3],[-5.2,-1.6,-3.2],[-7.8,1.1,-3.8],[-7.1,2.3,-0.2],[-8.0,-1.2,1.0],[-4.5,-2.3,1.8],[-4.0,-6.0,1.5],[-0.2,-6.7,1.8],[0.3,-7.0,5.5],[-1.2,-3.6,6.3],[1.9,-2.0,4.9],[3.6,-3.1,8.2],[1.9,-0.2,10.1],[2.6,2.4,7.5],[6.2,1.6,7.1],[6.5,0.4,10.8],[8.6,-2.4,9.5],[7.7,-6.0,8.9],[10.3,-8.2,7.1],[12.9,-6.6,9.4],[13.4,-2.8,9.0],[14.8,-0.2,6.8],[11.9,-0.2,4.3],[13.4,-3.6,3.1],[13.0,-3.1,-0.7],[9.7,-1.3,-0.6],[8.0,-3.6,1.9],[8.8,-6.9,0.1],[8.7,-5.1,-3.2],[5.0,-4.3,-2.5],[4.4,-8.0,-2.0],[4.6,-8.5,-5.8],[1.2,-6.7,-6.3],[-0.5,-9.8,-4.8],[-0.2,-11.4,-8.2],[-2.0,-8.6,-10.0],[-5.2,-8.2,-7.8]];
  // eighteen of its long-range NOE restraints (residue pairs), to stand for the list being checked
  const PAIRS = [[72,109],[75,106],[75,110],[76,109],[76,118],[78,96],[79,109],[79,118],[80,121],[82,88],[82,90],[82,93],[82,120],[83,120],[93,124],[93,127],[96,106],[96,125]];
  /* ---- cylinders: each helix's axis, from its Cα ---- */
  const RAD = 2.3;                                          // cylinder radius, Å
  function axes(m) {
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

  // the cartoon: shaded cylinders for the helices, thick tubes for the loops, painted back to front
  function cartoon(ctx, pos, X, sc, th, tint) {
    const AX = axes(pos), prims = [];
    const loops = [[null, FIRST, 69, 0], [0, 84, 87, 1], [1, 100, 101, 2], [2, 112, 117, 3], [3, LAST, LAST, null]];
    for (const [from, r0, r1, to] of loops) {               // from one cylinder's end, through the loop's Cα, to the next one's start
      const ctrl = [], res = [];
      if (from !== null) { ctrl.push(AX[from].P1); res.push(AX[from].b); }
      for (let r = r0; r <= r1; r++) { ctrl.push(pos[r - FIRST]); res.push(r); }
      if (to !== null) { ctrl.push(AX[to].P0); res.push(AX[to].a); }
      // where a loop meets a cylinder's end it is drawn wholly in front of that end if the end faces us (so it
      // runs into the middle of the end), and wholly behind it if not
      const cz = A => (A.P0[2] + A.P1[2]) / 2 + 0.5;
      const atStart = from === null ? null : cz(AX[from]) + (AX[from].d[2] > 0 ? 1 : -1);   // leaving a cylinder's P1 end
      const atEnd = to === null ? null : cz(AX[to]) + (AX[to].d[2] < 0 ? 1 : -1);           // entering a cylinder's P0 end
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
    const lw = Math.max(1.3, 0.17 * sc), R = RAD * sc, tubeW = Math.max(2.2, 0.42 * sc);
    for (const p of prims) {
      if (p.seg) {
        const a = X(p.seg[0]), b = X(p.seg[1]);
        ctx.strokeStyle = mix(th.ink, th.spec, tint(p.res)); ctx.lineWidth = tubeW;
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
      // the far end goes round the same way as the body's outline, so the two add up rather than cancel
      const cw = (p1[0] - p0[0]) * n[1] - (p1[1] - p0[1]) * n[0] < 0;
      ctx.moveTo(back[0] + rx * Math.cos(ang), back[1] + rx * Math.sin(ang)); ctx.ellipse(back[0], back[1], rx, ry, ang, 0, TAU, !cw);
      ctx.clip();
      ctx.fillStyle = mix(th.bg, th.ink, 0.06); ctx.fillRect(...span);
      const sAt = s => [p0[0] + (u[0] * L * (s - A.s0)) / (A.s1 - A.s0), p0[1] + (u[1] * L * (s - A.s0)) / (A.s1 - A.s0)];
      for (let r = A.a; r <= A.b; r++) {
        const f = tint(r);
        if (f < 0.01) continue;
        const s = A.at(r), q0 = sAt(s - 0.78), q1 = sAt(s + 0.78);
        ctx.fillStyle = mix(th.bg, th.spec, 0.9 * f);
        ctx.beginPath(); ctx.moveTo(q0[0] + n[0] * R * 1.2, q0[1] + n[1] * R * 1.2); ctx.lineTo(q1[0] + n[0] * R * 1.2, q1[1] + n[1] * R * 1.2);
        ctx.lineTo(q1[0] - n[0] * R * 1.2, q1[1] - n[1] * R * 1.2); ctx.lineTo(q0[0] - n[0] * R * 1.2, q0[1] - n[1] * R * 1.2); ctx.fill();
      }
      const g = ctx.createLinearGradient(p0[0] + n[0] * R, p0[1] + n[1] * R, p0[0] - n[0] * R, p0[1] - n[1] * R);
      g.addColorStop(0, rgba(th.ink, 0.04)); g.addColorStop(0.35, rgba(th.ink, 0)); g.addColorStop(1, rgba(th.ink, 0.38));
      ctx.fillStyle = g; ctx.fillRect(...span);
      ctx.restore();
      // the near end, then the outline: both long sides, the near end all round, the far end's outer half
      const ge = ctx.createLinearGradient(front[0] + n[0] * R, front[1] + n[1] * R, front[0] - n[0] * R, front[1] - n[1] * R);
      ge.addColorStop(0, mix(th.bg, th.ink, 0.16)); ge.addColorStop(1, mix(th.bg, th.ink, 0.36));   // the end face, shaded like the body
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


  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 26.2;
  const SHOW = [0, 0.4, 25.4, 26.0];
  const CARDS_IN = [0.2, 0.8];
  const INTO = k => [1.6 + 0.3 * k, 2.4 + 0.3 * k];        // each format's file goes into the server...
  const BUSY = [1.9, 3.8];                                 // ... which works on them ...
  const OUT = [3.6, 4.4];                                  // ... and gives out one NMR-STAR file
  const BMRB_IN = [4.5, 5.0], COPY = [5.0, 5.9];           // a copy of which goes to the BMRB
  const SCENE_A_OUT = [6.3, 6.8];
  const TO_TOP = [6.6, 7.5];                               // the NMR-STAR file moves up, small, above the model
  const MODEL_IN = [7.1, 7.9];
  const CHECK = [8.2, 11.2];                               // each restraint checked in turn
  const COUNTS = [11.5, 12.1, 14.5, 15.0];                 // the model makes way for the restraint counts, then comes back
  const BARS = [11.9, 12.7], HATCH = [12.8, 13.4];
  const KB = [14.8, 15.4];                                 // knowledge-based validation: the file becomes four checks
  const KB_CHECK = k => [15.6 + 1.2 * k, 16.6 + 1.2 * k];
  const FOLD = [20.7, 21.6];                               // everything becomes the report
  const REPORT = [21.2, 21.9];
  const STILL = 24;

  /* ---- restraint counts by category (3ZGK's deposited NOEs; the violated parts are illustrative) ---- */
  const COUNTED = [['intra-residue', 'intra', 140, 14], ['sequential', 'seq.', 202, 22], ['medium range', 'medium', 275, 31], ['long range', 'long', 225, 18]];
  /* ---- the knowledge-based checks, and how each came out (illustrative) ---- */
  const KB_ITEMS = [['Ramachandran outliers', 'o'], ['atomic clashes', 'r'], ['bond lengths', 'g'], ['chemical shifts', 'g']];
  const RAMA_AT = 114, CLASH_AT = [82, 120];               // where the outlier and the clash are marked on the model
  const KB_LABELS = [['Ramachandran', 'Rama.'], ['clashes'], ['bond lengths', 'bonds'], ['chemical shifts', 'chem. shifts', 'shifts']];
  // the report's percentile sliders (illustrative): which check fills each, and its percentile among all structures and among NMR ones
  const SLIDERS = [[['Clashscore', 'Clash'], 1, 0.62, 0.7], [['Ramachandran outliers', 'Ramachandran', 'Rama'], 0, 0.5, 0.86], [['Sidechain outliers', 'Sidechains', 'Side'], 2, 0.44, 0.91]];

  /* ---- the restraints, and how each one fared (illustrative) ---- */
  const ATOMS = [['HN', 'HA'], ['HB2', 'HN'], ['HA', 'HD1%'], ['HG2%', 'HN'], ['HN', 'HB3'], ['HD2%', 'HE1']];
  const VERDICTS = 'ggogggrgo';                            // 6 satisfied, 2 small, 1 large
  const ROWS = PAIRS.filter((_, i) => i % 2 === 0).map(([a, b], i) => ({ a, b, text: `${a} ${ATOMS[i % 6][0]} – ${b} ${ATOMS[i % 6][1]}`, d: [5.0, 4.5, 6.0, 5.5, 4.0, 6.5][i % 6], res: VERDICTS[i] }));
  const FORMATS = [['CYANA', 0], ['Xplor-NIH', 1], ['ARIA', 2], ['NEF', 3]];

  /* ---- drawing pieces ---- */
  // a document with a folded corner
  function doc(ctx, x, y, w, h, th, fill = th.surface) {
    const f = Math.min(Math.min(w, h) * 0.22, 14);
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + w - f, y); ctx.lineTo(x + w, y + f); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath();
    ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w - f, y); ctx.lineTo(x + w - f, y + f); ctx.lineTo(x + w, y + f); ctx.stroke();
  }
  // each format's mark: CYANA a circle, Xplor-NIH a triangle, ARIA a square, NEF even lines; NMR-STAR a star
  function mark(ctx, kind, cx, cy, r, th) {
    ctx.lineWidth = 1.4; ctx.strokeStyle = th.soft; ctx.beginPath();
    if (kind === 0) ctx.arc(cx, cy, r, 0, TAU);
    else if (kind === 1) { ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r * 0.95, cy + r * 0.75); ctx.lineTo(cx - r * 0.95, cy + r * 0.75); ctx.closePath(); }
    else if (kind === 2) ctx.rect(cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7);
    else if (kind === 3) { for (let k = -1; k <= 1; k++) { ctx.moveTo(cx - r, cy + k * r * 0.6); ctx.lineTo(cx + r, cy + k * r * 0.6); } }
    else {
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (k * Math.PI) / 5, q = k % 2 ? r * 0.45 : r * 1.1; ctx[k ? 'lineTo' : 'moveTo'](cx + q * Math.cos(a), cy + q * Math.sin(a)); }
      ctx.closePath(); ctx.strokeStyle = th.fid;
    }
    ctx.stroke();
  }
  // the deposition server: a tower of three units, their lights blinking while it works
  function server(ctx, cx, cy, W, H, th, busy, s) {
    const x = cx - W / 2, y = cy - H / 2, uh = H / 3;
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, W, H, 4); else ctx.rect(x, y, W, H); ctx.fill(); ctx.stroke();
    for (let k = 0; k < 3; k++) {
      const uy = y + k * uh;
      if (k) { ctx.beginPath(); ctx.moveTo(x, uy); ctx.lineTo(x + W, uy); ctx.stroke(); }
      for (let j = 0; j < 2; j++) {                        // two lights
        const on = busy > 0.01 && Math.sin(TAU * (2.3 + 0.7 * k + 0.9 * j) * s + k * 1.7 + j) > 0.2;
        ctx.fillStyle = on ? mix(th.surface, th.green, Math.min(1, busy * 1.2)) : mix(th.bg, th.ink, 0.25);
        ctx.beginPath(); ctx.arc(x + W * (0.16 + 0.13 * j), uy + uh / 2, Math.max(1.5, W * 0.05), 0, TAU); ctx.fill();
      }
      ctx.fillStyle = mix(th.bg, th.ink, 0.35);               // and two slots
      for (let j = 0; j < 2; j++) ctx.fillRect(x + W * 0.5, uy + uh * (0.36 + 0.28 * j) - 0.8, W * 0.36, 1.6);
    }
  }
  // OneDep, simply: a green ring making the O, with four coloured blobs inside, and "neDep"
  function onedep(ctx, cx, cy, size, th, a) {
    ctx.globalAlpha = a;
    const R = size / 2, fs = size * 0.78;
    ctx.font = `italic 700 ${fs}px ${th.mono}`;
    const tw = ctx.measureText('neDep').width, x0 = cx - (2 * R + tw) / 2, ox = x0 + R;
    ctx.strokeStyle = mix(th.bg, th.green, 0.5); ctx.lineWidth = Math.max(1.5, R * 0.12);
    ctx.beginPath(); ctx.arc(ox - R * 0.08, cy, R * 1.08, Math.PI * 0.55, Math.PI * 1.45); ctx.stroke();   // the paler outer swoosh
    ctx.strokeStyle = th.green; ctx.lineWidth = Math.max(2, R * 0.2); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(ox, cy, R * 0.9, -Math.PI * 0.3, Math.PI * 0.25, true); ctx.stroke();
    const tip = [ox + R * 0.9 * Math.cos(Math.PI * 0.25), cy + R * 0.9 * Math.sin(Math.PI * 0.25)];
    ctx.fillStyle = th.green; ctx.beginPath(); ctx.moveTo(tip[0] + R * 0.35, tip[1] - R * 0.05); ctx.lineTo(tip[0] - R * 0.05, tip[1] - R * 0.22); ctx.lineTo(tip[0] + R * 0.02, tip[1] + R * 0.2); ctx.fill();
    const blobs = [[-0.28, -0.26, mix(th.bg, th.green, 0.75)], [0.26, -0.28, mix(th.spec, th.ink, 0.35)], [-0.26, 0.26, th.fid], [0.24, 0.24, mix(th.bg, th.fid, 0.55)]];
    for (const [bx, by, col] of blobs) {                 // proteins, as little knots of ribbon
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ox + bx * R, cy + by * R, R * 0.27, 0, TAU); ctx.fill();
      ctx.strokeStyle = th.surface; ctx.lineWidth = Math.max(0.8, R * 0.06); ctx.beginPath(); ctx.arc(ox + bx * R, cy + by * R, R * 0.12, 0.4, TAU - 0.8); ctx.stroke();
    }
    ctx.fillStyle = th.green; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('neDep', x0 + 2 * R - R * 0.05, cy + 1);
    ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
  }

  // the BMRB: a green helix, and its name
  function bmrb(ctx, x, cy, size, th, a) {
    ctx.globalAlpha = a;
    const W = size * 0.55, segs = 3, sh = size / segs;
    for (let k = 0; k < segs; k++) {                       // three twists of ribbon, front and back in two greens
      const y0 = cy - size / 2 + k * sh;
      for (const [front, col] of [[false, mix(th.bg, th.green, 0.55)], [true, th.green]]) {
        ctx.beginPath();
        if (front) { ctx.moveTo(x, y0 + sh * 0.15); ctx.bezierCurveTo(x + W * 0.5, y0 + sh * 0.1, x + W * 0.55, y0 + sh * 0.9, x + W, y0 + sh * 0.85); }
        else { ctx.moveTo(x + W, y0 + sh * 0.15); ctx.bezierCurveTo(x + W * 0.5, y0 + sh * 0.1, x + W * 0.45, y0 + sh * 0.9, x, y0 + sh * 0.85); }
        ctx.strokeStyle = col; ctx.lineWidth = Math.max(2.2, size * 0.16); ctx.lineCap = 'round'; ctx.stroke();
      }
    }
    ctx.fillStyle = th.ink; ctx.font = `600 ${Math.max(12, size * 0.5)}px ${th.mono}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('BMRB', x + W + size * 0.3, cy + 1);
    ctx.globalAlpha = 1;
  }
  const bar = (ctx, x, y, w, h, colour) => { ctx.fillStyle = colour; ctx.fillRect(x, y - h / 2, w, h); };

  // the report's front page, drawn in a page of width W at (x, y), fading in by a
  function frontPage(ctx, x, y, W, H, th, a) {
    const cx = x + W / 2, u = W / 100;                      // everything in hundredths of the page's width
    ctx.globalAlpha = a;
    // the logo: a globe and the letters PDB
    const gr = 6 * u, gx = cx - 10 * u, gy = y + 12 * u;
    ctx.fillStyle = th.fid; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, TAU); ctx.fill();
    ctx.strokeStyle = th.surface; ctx.lineWidth = Math.max(0.8, 0.5 * u);
    ctx.beginPath(); ctx.ellipse(gx, gy, gr * 0.45, gr, 0, 0, TAU); ctx.moveTo(gx - gr, gy); ctx.lineTo(gx + gr, gy); ctx.stroke();
    ctx.fillStyle = th.green; ctx.font = `700 ${Math.max(8, 10 * u)}px ${th.mono}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('PDB', gx + gr + 1.5 * u, gy + 0.5 * u);
    ctx.fillStyle = th.muted;
    for (let k = 0; k < 9; k++) ctx.fillRect(gx - gr + k * 2.6 * u, gy - gr - 2.6 * u, 1.2 * u, 1.2 * u);   // "worldwide", spaced out
    // the title, and the date
    const grey = mix(th.bg, th.ink, 0.55), pale = mix(th.bg, th.ink, 0.3);
    bar(ctx, cx - 38 * u, y + 25 * u, 76 * u, 3.2 * u, grey);
    bar(ctx, cx - 16 * u, y + 30.5 * u, 32 * u, 3.2 * u, grey);
    bar(ctx, cx - 14 * u, y + 37 * u, 28 * u, 1.8 * u, pale);
    // the banner in its red box
    bar(ctx, cx - 34 * u, y + 44.5 * u, 68 * u, 2.4 * u, th.ink);
    // a few lines of text, two of them links
    [[62, pale], [56, pale], [60, th.ink], [50, th.ink], [44, pale], [30, pale], [58, th.fid], [36, pale], [46, th.fid]].forEach(([len, col], k) =>
      bar(ctx, cx - (len / 2) * u, y + (53 + k * 3.6) * u, len * u, 1.6 * u, col));
    // the rule, and the table of software versions
    ctx.fillStyle = pale; ctx.fillRect(x + 8 * u, y + 88 * u, 34 * u, Math.max(0.8, 0.3 * u));
    bar(ctx, x + 10 * u, y + 92 * u, 80 * u, 1.6 * u, pale);
    for (let k = 0; k < 11; k++) {
      const ry = y + (96.5 + k * 3) * u, left = [16, 14, 18, 24, 15, 10, 22, 26, 25, 22, 30][k], right = [26, 18, 20, 38, 30, 18, 8, 9, 22, 24, 6][k];
      bar(ctx, cx - 4 * u - left * u, ry, left * u, 1.4 * u, pale);
      bar(ctx, cx + 4 * u, ry, right * u, 1.4 * u, pale);
    }
    // the watermark: a faint red band across the page, corner to corner, its words as letter-shaped blocks
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, W, H); ctx.clip();
    ctx.translate(cx, y + H / 2); ctx.rotate(-Math.atan2(H, W));
    const len = Math.hypot(W, H);
    ctx.strokeStyle = rgba(th.red, 0.35); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-len / 2, -9 * u); ctx.lineTo(len / 2, -9 * u); ctx.moveTo(-len / 2, 9 * u); ctx.lineTo(len / 2, 9 * u); ctx.stroke();
    ctx.fillStyle = rgba(th.red, 0.16);
    const sizes = [6, 7, 6, 0, 7, 6, 7, 0, 8, 6, 7, 6, 7, 6, 0, 7, 6, 7, 6, 8, 6];
    let bx = -sizes.reduce((acc, z) => acc + (z ? z + 1.6 : 4), 0) * u / 2;
    for (const z of sizes) { if (z) ctx.fillRect(bx, -4.5 * u, z * u, 9 * u); bx += (z ? z + 1.6 : 4) * u; }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // the model's extent (Å)
  const MBOX = (() => {                                    // (the folded part; the loose N-terminal tail may stray past it)
    const core = MODEL.slice(70 - FIRST), xs = core.map(p => p[0]), ys = core.map(p => p[1]);
    return { x0: Math.min(...xs) - 3, x1: Math.max(...xs) + 3, y0: Math.min(...ys) - 3, y1: Math.max(...ys) + 3 };
  })();

  Anim.register('restraint-validation-2024', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE;
    const show = envelope(s, SHOW);

    /* ---- layout ---- */
    const pad = Math.max(14, w * 0.05), ly = pad + 6;
    const top = ly + 18, bot = h - pad, midY = (top + bot) / 2;
    const names = w >= 400;
    const cardH = Math.min((bot - top) * 0.25, w * 0.11), cardW = cardH * 0.78;
    const colGap = names ? Math.max(cardW * 0.9, 50) : cardW * 0.45;
    const gx = [pad + cardW / 2 + 2, pad + cardW * 1.5 + 2 + colGap], gy = [midY - cardH * (names ? 0.95 : 0.7), midY + cardH * (names ? 0.6 : 0.7)];
    const srv = { x: lerp(gx[1] + cardW / 2, w - pad - cardW * 1.6, 0.5), y: midY, H: Math.min((bot - top) * 0.55, w * 0.2) };
    srv.W = srv.H * 0.62;
    const outX = w - pad - cardW / 2 - (names ? 14 : 2), outY = midY - cardH * (names ? 0.95 : 0.7);
    const logo = { size: Math.max(16, cardH * 0.7) }; logo.x = w - pad - logo.size * 2.5; logo.y = midY + cardH * (names ? 1.05 : 0.8);

    // the small NMR-STAR file above the model, and the model's region
    const file = { w: Math.min(w - 2 * pad, Math.max(180, w * 0.62)), h: Math.max(34, (bot - top) * 0.22) };
    file.x = (w - file.w) / 2; file.y = top + 2;
    const chips = { x: pad, y: file.y, w: w - 2 * pad, h: file.h };
    const kbLay = between(s, ...KB) * (1 - between(s, ...FOLD));
    const sRow = Math.max(13, h * 0.05), slidersH = 3 * sRow + 4;
    const mTop = file.y + file.h + 8, mBot = lerp(bot - 22, bot - slidersH - 6, kbLay);
    const sc = Math.min((w - 2 * pad) / (MBOX.x1 - MBOX.x0), (mBot - mTop) / (MBOX.y1 - MBOX.y0));
    const ox = w / 2 - ((MBOX.x0 + MBOX.x1) / 2) * sc, oy = (mTop + mBot) / 2 - ((MBOX.y0 + MBOX.y1) / 2) * sc;
    const X = p => [ox + p[0] * sc, oy + p[1] * sc];

    const sceneA = 1 - between(s, ...SCENE_A_OUT);
    const out = between(s, ...OUT), top2 = between(s, ...TO_TOP), fold = between(s, ...FOLD), kbIn = between(s, ...KB);
    ctx.globalAlpha = show;

    /* ---- 1. community formats, into the server, out as one NMR-STAR file ---- */
    if (sceneA > 0.01) {
      const sv = between(s, ...CARDS_IN);
      ctx.globalAlpha = show * sceneA * sv;
      server(ctx, srv.x, srv.y, srv.W, srv.H, th, envelope(s, [BUSY[0], BUSY[0] + 0.2, BUSY[1] - 0.3, BUSY[1]]), s);
      if (names) onedep(ctx, srv.x, srv.y + srv.H / 2 + Math.max(14, srv.H * 0.2), Math.max(18, srv.H * 0.32), th, show * sceneA * sv);
      FORMATS.forEach(([name, kind], k) => {
        const into = between(s, ...INTO(k)), appear = between(s, CARDS_IN[0] + 0.08 * k, CARDS_IN[1] + 0.08 * k);
        if (into >= 0.999) return;
        const x0 = gx[k % 2], y0 = gy[Math.floor(k / 2)];
        const x = lerp(x0, srv.x, into), y = lerp(y0, srv.y, into), sc2 = 1 - 0.6 * into;
        ctx.globalAlpha = show * sceneA * appear * (1 - between(into, 0.7, 1));
        doc(ctx, x - (cardW * sc2) / 2, y - (cardH * sc2) / 2, cardW * sc2, cardH * sc2, th);
        mark(ctx, kind, x, y + cardH * sc2 * 0.08, cardW * sc2 * 0.24, th);
        if (names && into < 0.2) { ctx.globalAlpha = show * sceneA * appear * (1 - into * 5); Anim.label(ctx, th, name, x, y + (cardH * sc2) / 2 + 10, 'center', kind === 3 ? th.fid : th.soft); }
      });
      // the BMRB, and the copy of the NMR-STAR file that goes to it
      const lg = between(s, ...BMRB_IN);
      if (lg > 0.01) {
        bmrb(ctx, logo.x, logo.y, logo.size, th, show * sceneA * lg);
        const cp = between(s, ...COPY);
        if (cp > 0.001 && cp < 0.999) {
          const x = lerp(outX, logo.x + logo.size * 0.3, cp), y = lerp(outY, logo.y, cp), sc2 = 1 - 0.55 * cp;
          ctx.globalAlpha = show * sceneA * (1 - between(cp, 0.75, 1));
          doc(ctx, x - (cardW * sc2) / 2, y - (cardH * sc2) / 2, cardW * sc2, cardH * sc2, th);
          mark(ctx, 4, x, y + cardH * sc2 * 0.08, cardW * sc2 * 0.24, th);
        }
      }
      ctx.globalAlpha = show;
    }

    /* ---- the NMR-STAR file: out of the server, then up, small, above the model ---- */
    if (out > 0.01 && fold < 0.999 && kbIn < 0.999) {
      const at = { x: lerp(srv.x, outX, out), y: lerp(srv.y, outY, out) }, sc2 = 0.4 + 0.6 * out;
      const from = { x: at.x - (cardW * sc2) / 2, y: at.y - (cardH * sc2) / 2, w: cardW * sc2, h: cardH * sc2 };
      const r = { x: lerp(from.x, file.x, top2), y: lerp(from.y, file.y, top2), w: lerp(from.w, file.w, top2), h: lerp(from.h, file.h, top2) };
      ctx.globalAlpha = show * (1 - fold) * (1 - kbIn) * between(out, 0, 0.2);
      doc(ctx, r.x, r.y, r.w, r.h, th);
      if (top2 < 0.5) {
        mark(ctx, 4, r.x + r.w / 2, r.y + r.h * 0.58, r.w * 0.24, th);
        if (names && out > 0.9) { ctx.globalAlpha = show * (1 - top2 * 2); Anim.label(ctx, th, 'NMR-STAR', r.x + r.w / 2, r.y - 10, 'center', th.fid); }   // (above it: the copy to the BMRB leaves below)
      }
      // the restraint list inside it, a few rows around the one being checked
      const list = between(s, TO_TOP[1] - 0.3, TO_TOP[1] + 0.2) * (1 - fold) * (1 - kbIn);
      if (list > 0.01) {
        ctx.save(); ctx.beginPath(); ctx.rect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); ctx.clip();
        const rowH = Math.max(15, Math.min(20, h * 0.05)), inset = 8, x0 = r.x + inset + 4, x1 = r.x + r.w - inset - 14;
        const visible = Math.max(1, Math.floor((r.h - 2 * inset) / rowH));
        const at2 = Math.max(-1, Math.min(ROWS.length, ((s - CHECK[0]) / (CHECK[1] - CHECK[0])) * ROWS.length));
        const scroll = Math.max(0, Math.min(ROWS.length - visible, at2 - visible + 1.5)) * rowH;
        const text = Anim.measure(ctx, th, '125 HD2% – 106 HE1') + Anim.measure(ctx, th, '< 6.5 Å') + 36 <= x1 - x0;
        ROWS.forEach((row, i) => {
          const y = r.y + inset + rowH * (i + 0.5) - scroll;
          if (y < r.y - rowH || y > r.y + r.h + rowH) return;
          ctx.globalAlpha = show * list;
          if (Math.floor(at2) === i) { ctx.fillStyle = rgba(th.fid, 0.12); ctx.fillRect(x0 - 4, y - rowH / 2, x1 - x0 + 18, rowH); }
          if (text) {
            Anim.label(ctx, th, row.text, x0, y, 'left', th.ink);
            Anim.label(ctx, th, `< ${row.d.toFixed(1)} Å`, x1 - 14, y, 'right', th.soft);
          } else {
            bar(ctx, x0, y, (x1 - x0) * (0.5 + 0.04 * (i % 4)), 3, mix(th.bg, th.ink, 0.5));
            bar(ctx, x1 - 14 - (x1 - x0) * 0.16, y, (x1 - x0) * 0.16, 3, mix(th.bg, th.ink, 0.3));
          }
          const done = Math.max(0, Math.min(1, (at2 - i) * 2)), colour = row.res === 'g' ? th.green : row.res === 'o' ? th.spec : th.red;
          ctx.beginPath(); ctx.arc(x1 + 2, y, 4.5, 0, TAU); ctx.strokeStyle = mix(th.bg, th.ink, 0.35); ctx.lineWidth = 1; ctx.stroke();
          if (done > 0.01) { ctx.globalAlpha = show * list * done; ctx.fillStyle = colour; ctx.fill(); }
        });
        ctx.restore();
      }
      ctx.globalAlpha = show;
    }

    /* ---- 2. the model, with its restraints as lines, checked one by one ---- */
    const withLines = between(s, ...MODEL_IN) * (1 - between(s, COUNTS[0], COUNTS[1]));
    const mv = Math.max(withLines, between(s, COUNTS[2], COUNTS[3])) * (1 - fold);
    if (mv > 0.01) {
      ctx.globalAlpha = show * mv;
      cartoon(ctx, MODEL, X, sc, th, () => 0);
    }
    if (withLines > 0.01) {
      const mv = withLines;
      const at2 = ((s - CHECK[0]) / (CHECK[1] - CHECK[0])) * ROWS.length;
      ctx.lineCap = 'round';
      ROWS.forEach((row, i) => {
        const A = X(MODEL[row.a - FIRST]), B = X(MODEL[row.b - FIRST]);
        const done = Math.max(0, Math.min(1, (at2 - i) * 2)), now = Math.floor(at2) === i;
        const colour = row.res === 'g' ? th.green : row.res === 'o' ? th.spec : th.red;
        ctx.globalAlpha = show * mv;
        if (done < 0.99) {                                 // not yet checked: a faint dashed line
          ctx.setLineDash([3, 3]); ctx.strokeStyle = now ? th.fid : mix(th.bg, th.ink, 0.5); ctx.lineWidth = now ? 2.4 : 1.2;
          ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); ctx.setLineDash([]);
        }
        if (done > 0.01) {                                 // checked: solid, in its verdict's colour
          ctx.globalAlpha = show * mv * done; ctx.strokeStyle = colour; ctx.lineWidth = row.res === 'g' ? 2 : 2.8;
          ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
          for (const P of [A, B]) { ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(P[0], P[1], 2.2, 0, TAU); ctx.fill(); }
        }
      });
      ctx.globalAlpha = show;
    }

    /* ---- restraint counts: bars by category, the violated part of each hatched ---- */
    const cA = envelope(s, COUNTS);
    if (cA > 0.01) {
      ctx.globalAlpha = show * cA;
      const n = COUNTED.length, cx0 = pad + (names ? 8 : 0), cx1 = w - pad - (names ? 8 : 0), chT = mTop + 14, chB = mBot - 16;
      const slot = (cx1 - cx0) / n, bw = Math.min(slot * 0.55, 60), max = 300, grow = between(s, ...BARS), hatch = between(s, ...HATCH);
      ctx.strokeStyle = th.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx0, chB + 0.5); ctx.lineTo(cx1, chB + 0.5); ctx.stroke();
      COUNTED.forEach(([long, short, count, bad], i) => {
        const x = cx0 + slot * (i + 0.5) - bw / 2, bh = ((chB - chT) * count * grow) / max, vh = ((chB - chT) * bad * grow) / max;
        ctx.fillStyle = mix(th.bg, th.fid, i % 2 ? 0.32 : 0.5); ctx.fillRect(x, chB - bh, bw, bh);
        if (hatch > 0.01) {                                  // the violated part, hatched
          ctx.save(); ctx.globalAlpha = show * cA * hatch;
          ctx.beginPath(); ctx.rect(x, chB - vh, bw, vh); ctx.clip();
          ctx.fillStyle = mix(th.bg, th.fid, 0.75); ctx.fillRect(x, chB - vh, bw, vh);
          ctx.strokeStyle = th.ink; ctx.lineWidth = 1; ctx.beginPath();
          for (let k = -vh; k < bw + vh; k += 4) { ctx.moveTo(x + k, chB); ctx.lineTo(x + k + vh, chB - vh); }
          ctx.stroke(); ctx.restore();
          ctx.globalAlpha = show * cA * hatch; ctx.strokeStyle = th.ink; ctx.strokeRect(x + 0.5, chB - vh + 0.5, bw - 1, vh - 1);
          ctx.globalAlpha = show * cA;
        }
        if (grow > 0.98) Anim.label(ctx, th, `${count}`, x + bw / 2, chB - bh - 8, 'center', th.soft);
        const name = Anim.measure(ctx, th, long) <= slot - 4 ? long : short;
        Anim.label(ctx, th, name, x + bw / 2, chB + 9, 'center', th.soft);
      });
      if (names && hatch > 0.01) {                         // the key
        ctx.globalAlpha = show * cA * hatch;
        const kx = cx1 - Anim.measure(ctx, th, 'violated') - 18, ky = mTop + 4;
        ctx.fillStyle = mix(th.bg, th.fid, 0.75); ctx.fillRect(kx, ky - 5, 12, 10); ctx.strokeStyle = th.ink; ctx.strokeRect(kx + 0.5, ky - 4.5, 11, 9);
        ctx.beginPath(); for (let k = -10; k < 12; k += 4) { ctx.moveTo(kx + Math.max(0, k), ky + 5 - Math.max(0, -k)); ctx.lineTo(kx + Math.min(12, k + 10), ky - 5 + Math.max(0, k + 10 - 12)); } ctx.stroke();
        Anim.label(ctx, th, 'violated', kx + 18, ky, 'left', th.soft);
      }
      ctx.globalAlpha = show;
    }

    /* ---- knowledge-based validation: four checks in a strip, marked on the model where something is found ---- */
    if (kbIn > 0.01 && fold < 0.999) {
      const g = Math.max(6, w * 0.015), cw = (chips.w - 3 * g) / 4;
      KB_ITEMS.forEach(([name, res], k) => {
        const x = chips.x + k * (cw + g), y = chips.y, ch = chips.h;
        const go = between(s, ...KB_CHECK(k)), now = s > KB_CHECK(k)[0] && s < KB_CHECK(k)[1] + 0.1, done = between(s, KB_CHECK(k)[1] - 0.3, KB_CHECK(k)[1]);
        ctx.globalAlpha = show * kbIn * (1 - fold);
        ctx.fillStyle = now ? mix(th.surface, th.fid, 0.1) : th.surface; ctx.strokeStyle = now ? th.fid : th.rule; ctx.lineWidth = now ? 1.5 : 1;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, cw, ch, 5); else ctx.rect(x, y, cw, ch); ctx.fill(); ctx.stroke();
        const word = names ? KB_LABELS[k].find(l => Anim.measure(ctx, th, l) <= cw - 8) : null;
        const m = Math.min(cw, word ? ch - 16 : ch) * 0.34, ix = x + cw / 2, iy = y + (word ? (ch - 14) / 2 + 1 : ch / 2), ink = th.soft, colour = res === 'g' ? th.green : res === 'o' ? th.spec : th.red;
        if (word) Anim.label(ctx, th, word, ix, y + ch - 9, 'center', now ? th.fid : th.ink);
        ctx.lineWidth = 1.2; ctx.strokeStyle = ink; ctx.fillStyle = ink;
        if (k === 0) {                                     // a Ramachandran plot: allowed regions, and the residues in them
          ctx.beginPath(); ctx.moveTo(ix - m, iy - m); ctx.lineTo(ix - m, iy + m); ctx.lineTo(ix + m, iy + m); ctx.stroke();
          ctx.fillStyle = rgba(th.fid, 0.18);
          ctx.beginPath(); ctx.ellipse(ix - m * 0.4, iy - m * 0.45, m * 0.38, m * 0.32, -0.4, 0, TAU); ctx.fill();
          ctx.beginPath(); ctx.ellipse(ix - m * 0.35, iy + m * 0.3, m * 0.3, m * 0.22, 0.3, 0, TAU); ctx.fill();
          ctx.fillStyle = ink;
          [[-0.5, -0.5], [-0.3, -0.4], [-0.45, -0.3], [-0.6, -0.6], [-0.25, -0.55], [-0.4, 0.3], [-0.3, 0.25], [-0.5, 0.35]].forEach(([a, b]) => { ctx.beginPath(); ctx.arc(ix + a * m, iy + b * m, 1.4, 0, TAU); ctx.fill(); });
          if (go > 0.3) { ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(ix + m * 0.55, iy - m * 0.1, 2.4, 0, TAU); ctx.fill(); }
        } else if (k === 1) {                              // two atoms too close: their overlap
          const r = m * 0.48;
          ctx.beginPath(); ctx.arc(ix - r * 0.55, iy, r, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(ix + r * 0.55, iy, r, 0, TAU); ctx.stroke();
          if (go > 0.3) { ctx.save(); ctx.beginPath(); ctx.arc(ix - r * 0.55, iy, r, 0, TAU); ctx.clip(); ctx.fillStyle = rgba(th.red, 0.6); ctx.beginPath(); ctx.arc(ix + r * 0.55, iy, r, 0, TAU); ctx.fill(); ctx.restore(); }
        } else if (k === 2) {                              // a bond, against its ideal length
          ctx.beginPath(); ctx.moveTo(ix - m * 0.55, iy + m * 0.2); ctx.lineTo(ix + m * 0.55, iy + m * 0.2); ctx.stroke();
          for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(ix + sx * m * 0.6, iy + m * 0.2, m * 0.22, 0, TAU); ctx.fillStyle = th.surface; ctx.fill(); ctx.stroke(); }
          ctx.beginPath(); ctx.moveTo(ix - m * 0.6, iy - m * 0.45); ctx.lineTo(ix + m * 0.6, iy - m * 0.45);
          ctx.moveTo(ix - m * 0.6, iy - m * 0.6); ctx.lineTo(ix - m * 0.6, iy - m * 0.3); ctx.moveTo(ix + m * 0.6, iy - m * 0.6); ctx.lineTo(ix + m * 0.6, iy - m * 0.3); ctx.stroke();
        } else {                                           // a spectrum's peaks, each shift against what is expected
          ctx.beginPath(); ctx.moveTo(ix - m, iy + m * 0.6);
          for (let q = 0; q <= 40; q++) {
            const u = q / 40, xx = ix - m + 2 * m * u;
            const yy = iy + m * 0.6 - m * 1.2 * [0.18, 0.4, 0.62, 0.8].reduce((a, c, j) => a + [0.7, 1, 0.55, 0.85][j] * Math.exp(-(((u - c) / 0.035) ** 2)), 0);
            ctx.lineTo(xx, yy);
          }
          ctx.stroke();
        }
        // the verdict, in the strip's corner
        if (done > 0.01) { ctx.globalAlpha = show * kbIn * (1 - fold) * done; ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(x + cw - 8, y + 8, 4.5, 0, TAU); ctx.fill(); }
      });
      // what was found, on the model: the Ramachandran outlier, and the clash
      const ram = between(s, KB_CHECK(0)[1] - 0.4, KB_CHECK(0)[1]) * (1 - fold), cl = between(s, KB_CHECK(1)[1] - 0.4, KB_CHECK(1)[1]) * (1 - fold);
      if (ram > 0.01) {
        const P = X(MODEL[RAMA_AT - FIRST]);
        ctx.globalAlpha = show * ram; ctx.strokeStyle = th.spec; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P[0], P[1], Math.max(5, 1.6 * sc), 0, TAU); ctx.stroke();
      }
      if (cl > 0.01) {
        const A = X(MODEL[CLASH_AT[0] - FIRST]), B = X(MODEL[CLASH_AT[1] - FIRST]), P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], R = Math.max(6, 1.8 * sc);
        ctx.globalAlpha = show * cl; ctx.strokeStyle = th.red; ctx.lineWidth = 2; ctx.beginPath();
        for (let q = 0; q < 8; q++) { const a = (q * TAU) / 8; ctx.moveTo(P[0] + 0.35 * R * Math.cos(a), P[1] + 0.35 * R * Math.sin(a)); ctx.lineTo(P[0] + R * Math.cos(a), P[1] + R * Math.sin(a)); }
        ctx.stroke();
      }
      ctx.globalAlpha = show;
    }

    /* ---- the report's percentile sliders, filled in as the knowledge-based checks run ---- */
    if (kbLay > 0.01) {
      const labW = Math.max(...SLIDERS.map(([ls]) => Anim.measure(ctx, th, ls.find(l => Anim.measure(ctx, th, l) <= (w - 2 * pad) * 0.34) || ls[ls.length - 1])));
      const bx = pad + labW + 10, bw = w - pad - bx, bh = Math.max(5, sRow * 0.5);
      const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      g.addColorStop(0, th.red); g.addColorStop(0.5, mix(th.surface, th.bg, 0.5)); g.addColorStop(1, th.fid);
      const filled = [];
      SLIDERS.forEach(([ls, chip, all, nmr], i) => {
        const y = bot - slidersH + sRow * (i + 0.5) + 2, go = between(s, KB_CHECK(chip)[0] + 0.1, KB_CHECK(chip)[0] + 0.9);
        const label = ls.find(l => Anim.measure(ctx, th, l) <= (w - 2 * pad) * 0.34) || ls[ls.length - 1];
        ctx.globalAlpha = show * kbLay; Anim.label(ctx, th, label, bx - 10, y, 'right', th.soft);
        ctx.globalAlpha = show * kbLay * (0.35 + 0.65 * Math.min(1, go * 3));
        ctx.fillStyle = g; ctx.fillRect(bx, y - bh / 2, bw, bh);
        if (go > 0.01) {                                   // percentile among NMR structures (open), and among all (filled)
          ctx.globalAlpha = show * kbLay;
          const xn = bx + bw * nmr * go, xa = bx + bw * all * go, mw = Math.max(3, bh * 0.45), mh = bh + 6;
          ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2; ctx.fillStyle = th.surface;
          ctx.fillRect(xn - mw / 2, y - mh / 2, mw, mh); ctx.strokeRect(xn - mw / 2, y - mh / 2, mw, mh);
          ctx.fillStyle = th.ink; ctx.fillRect(xa - mw / 2, y - mh / 2, mw, mh);
          filled.push([xa, y]);
        }
      });
      if (filled.length > 1) {                             // the line joining the filled markers, as in the report
        ctx.globalAlpha = show * kbLay; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
        ctx.beginPath(); filled.forEach(([x, y], i) => ctx[i ? 'lineTo' : 'moveTo'](x, y)); ctx.stroke();
      }
      ctx.globalAlpha = show;
    }

    /* ---- the tally ---- */
    const at = ((s - CHECK[0]) / (CHECK[1] - CHECK[0])) * ROWS.length;
    const tally = { g: 0, o: 0, r: 0 };
    ROWS.forEach((row, i) => { if (at > i + 0.5) tally[row.res]++; });
    const tallyA = between(s, CHECK[0] - 0.3, CHECK[0]) * (1 - between(s, KB[0] - 0.3, KB[0] + 0.2));   // (not under the report)
    if (tallyA > 0.01) {
      ctx.globalAlpha = show * tallyA;
      const items = [['g', th.green, 'satisfied'], ['o', th.spec, 'small'], ['r', th.red, 'large']];
      const widths = items.map(([k, , name]) => 12 + Anim.measure(ctx, th, `${tally[k]}${names ? ' ' + name : ''}`));
      let x = (w - widths.reduce((a, b) => a + b + 18, -18)) / 2;
      const y = bot - 8;
      items.forEach(([k, colour, name], i) => {
        ctx.fillStyle = colour; ctx.beginPath(); ctx.arc(x + 4.5, y, 4.5, 0, TAU); ctx.fill();
        Anim.label(ctx, th, `${tally[k]}${names ? ' ' + name : ''}`, x + 12, y, 'left', th.soft);
        x += widths[i] + 18;
      });
      ctx.globalAlpha = show;
    }

    /* ---- 3. the validation report, with a note of when it is made ---- */
    if (fold > 0.01) {
      const tsize = Math.max(13, Math.min(19, w * 0.029)), lines = ['PDF Reports on', 'Deposition &', 'Public Release'];
      ctx.font = `${tsize}px ${th.mono}`;
      const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
      const pageH = bot - top - 8, pageW = pageH * 0.77, gap = Math.max(12, w * 0.03);
      const px = Math.max(pad, (w - (pageW + gap + tw)) / 2);
      const page = { x: px, y: top + 2, w: pageW, h: pageH };
      const r = { x: lerp(chips.x, page.x, fold), y: lerp(chips.y, page.y, fold), w: lerp(chips.w, page.w, fold), h: lerp(chips.h, page.h, fold) };
      ctx.globalAlpha = show;
      doc(ctx, r.x, r.y, r.w, r.h, th);
      const rp = between(s, ...REPORT);
      frontPage(ctx, page.x, page.y, page.w, page.h, th, show * rp);
      // the note, centred in the space to the right of the page
      ctx.globalAlpha = show * rp; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `${tsize}px ${th.mono}`;
      const ty = page.y + page.h / 2 - tsize * 1.35, tx = (page.x + page.w + w - pad) / 2;
      lines.forEach((l, i) => { ctx.fillStyle = th.ink; ctx.fillText(l, tx, ty + i * tsize * 1.35); });
      ctx.globalAlpha = show;
    }

    /* ---- labels ---- */
    const room = w - 2 * pad;
    const pair = (alpha, left, right, colour) => {
      if (alpha < 0.01) return;
      ctx.globalAlpha = alpha * show;
      let L = null, R = null;
      for (const l of left) { R = right.find(q => Anim.measure(ctx, th, l) + Anim.measure(ctx, th, q) + 16 <= room); if (R) { L = l; break; } }
      Anim.label(ctx, th, L || left.find(x => Anim.measure(ctx, th, x) <= room) || left[left.length - 1], pad, ly, 'left', th.ink);
      if (R) Anim.label(ctx, th, R, w - pad, ly, 'right', colour);
      ctx.globalAlpha = 1;
    };
    pair(1 - between(s, BMRB_IN[0] - 0.3, BMRB_IN[0]), ['Community file formats', 'File formats'], ['→ one NMR-STAR file', 'NMR-STAR'], th.fid);
    pair(between(s, BMRB_IN[0], BMRB_IN[0] + 0.3) * (1 - between(s, SCENE_A_OUT[0], SCENE_A_OUT[0] + 0.3)), ['NMR-STAR, archived at the BMRB', 'NMR-STAR to BMRB', 'to BMRB'], [], th.soft);
    pair(between(s, SCENE_A_OUT[0] + 0.3, SCENE_A_OUT[1] + 0.3) * (1 - between(s, COUNTS[0], COUNTS[0] + 0.3)), ['Model vs data', 'Model vs data'], ['each restraint checked', 'restraints'], th.soft);
    pair(between(s, COUNTS[0] + 0.3, COUNTS[1]) * (1 - between(s, KB[0], KB[0] + 0.3)), ['Restraint counts', 'Restraints'], ['by category'], th.soft);
    const kbNow = KB_ITEMS.findIndex((_, k) => s < KB_CHECK(k)[1] + 0.1);
    pair(between(s, KB[0] + 0.3, KB[1]) * (1 - between(s, FOLD[0], FOLD[0] + 0.3)), ['Knowledge-based validation', 'Knowledge-based'], names ? ['geometry · chemical shifts', 'geometry · shifts'] : [KB_ITEMS[Math.max(0, kbNow < 0 ? 3 : kbNow)][0]], th.soft);
    pair(between(s, FOLD[0] + 0.3, FOLD[1]), ['wwPDB validation report', 'validation report'], [], th.soft);
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
