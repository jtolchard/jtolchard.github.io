/* ==========================================================================
   pdbe-kb-2022: the data's journey through PDBe and PDBe-KB, as in the
   paper's Fig. 1, ending on one entry page, as in its Fig. 3.
   Structures from depositors worldwide pass through the wwPDB's OneDep
   system (a train of turning gears: curation and validation). Each entry
   is then enriched with the residue-level annotations that the PDBe-KB
   partners send in every week (over 80 million, for over 185,000 entries,
   as of July 2022) and stored in PDBe's databases. APIs (over 90
   endpoints) serve the data to PDBe's entry pages and to PDBe-KB's
   aggregated views of proteins, ligands and complexes; almost half a
   million people a month use the pages.
   Then one entry page opens up: 1KPA, the human HINT1 dimer, with its
   three linked views. A cursor moves along the sequence-feature tracks
   (ProtVista) to LYS92, which is in the interface track and has a known
   variant; the same residue lights up in the topology diagram, in the loop
   before the strand that joins the two chains' sheets, and in 3D (Mol*),
   at the dimer interface: a mutation there might upset the dimer.
   The 3D view is the entry's own Cα trace (residues 14–126 of each chain),
   its interface residues and secondary structure are from the same file,
   and the topology is drawn after the sheet order in its SHEET records.
   Colours: blue for the core PDB data, green for the partners'
   annotations, orange for what's served (and for the picked residue).
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const TAU = Math.PI * 2;

  // what the APIs serve: PDBe's entry pages, then PDBe-KB's aggregated views (name on the larger panels, on phones, picture)
  const OUTPUTS = [['entry pages', 'entries', 'entry'], ['proteins', 'proteins', 'tracks'], ['ligands', 'ligands', 'ligand'], ['complexes', 'complexes', 'complex']];

  /* ---- the finale: PDBe's entry page for 1KPA (human HINT1, a homodimer), as in Fig. 3 ---- */
  const SEQ0 = 77, SEQ = 'LMIVGKKCAADLGLNKGYRMVVNEGSDGGQ', PICK = 92;   // chain A, 77–106: the stretch Fig. 3's tracks show
  // chain A's residues in the interface with chain B (any atom within 4 Å of chain B), from the entry's coordinates
  const IFACE = [47, 63, 64, 66, 67, 68, 71, 72, 75, 76, 78, 79, 82, 83, 92, 93, 94, 95, 96, 97, 98, 99, 100, 102, 103, 104, 114, 119, 120, 121, 122, 123, 124, 125, 126];
  // its secondary structure, from the entry's HELIX and SHEET records (the same in both chains)
  const HELICES = [[18, 23], [63, 65], [68, 88], [101, 104]], STRANDS = [[31, 34], [38, 42], [50, 56], [94, 100], [112, 117]];
  // each chain's Cα trace, residues 14–126, in Å: x from chain A (left) to chain B, y down the dimer's two-fold axis, z
  // towards the viewer (a proper view, not a mirror image), turned so that chain A's LYS92 faces us
  const FIRST = 14;
  const CA_A = '-16.8,-8.2,-9.2,-17.8,-6.1,-12.3,-18.9,-2.9,-13.8,-17.5,-0.1,-11.5,-19.5,1.5,-8.7,-17.3,-0.8,-6.4,-18.9,-3.8,-8.1,-22.4,-2.5,-7.2,-21.3,-2.1,-3.6,-20,-5.7,-3.5,-23.3,-7,-4.9,-25.1,-5,-2.2,-26.8,-3,-5,-26.1,0.4,-3.6,-25.4,1.1,0.1,-21.9,1.7,1.6,-20.8,2.2,5.2,-19.5,-1.4,5.5,-16.8,-2,8.1,-15.8,-5.6,7.5,-16.4,-8.4,5,-15.3,-11.9,4.4,-15.3,-14.2,1.4,-12.7,-12.5,-0.7,-12.8,-8.8,0.4,-14.8,-5.9,1.7,-13.9,-2.8,3.8,-16.1,0.3,3.8,-15.7,4,4.7,-14.8,6.4,1.8,-17.8,8.3,0.7,-15.5,11.4,0.4,-13.1,11.2,3.4,-9.8,13,3.5,-9.1,12.2,7.2,-11.2,11.6,10.4,-11,8,9.5,-10.6,7,5.9,-11.7,3.7,4.6,-11.1,1.3,1.6,-10.5,-2.4,1.5,-11.2,-4,-1.9,-11,-7.5,-3.4,-14.3,-9.1,-4.4,-12.4,-10.3,-7.4,-12.4,-7.6,-10.1,-8.8,-6.5,-10.8,-8.9,-3.2,-12.6,-5.6,-1.9,-11.3,-2.4,-3,-9.5,-0.4,-3,-12.7,-2.3,-5.9,-14,-2.4,-8,-10.9,-1.2,-11.5,-11.6,1.4,-13.3,-9.5,-1.4,-15.4,-8,-3.2,-12.4,-6.6,-0.2,-12.1,-4.3,-1.6,-13.4,-1,-4.9,-11.7,-1.9,-3.1,-8.3,-2.1,-1.4,-9.1,1.2,-4.7,-10.1,2.6,-6.1,-6.6,1.8,-3.3,-5.2,3.9,-3.8,-7.5,6.8,-7.6,-6.8,6.8,-6.7,-3,6.6,-4.4,-3.3,9.7,-7.1,-5.2,11.6,-9.8,-2.7,10.6,-7.5,0.2,11.5,-7.2,-1.4,15,-11,-1.7,15.5,-11.5,1.9,14.4,-9.2,3.2,17.1,-6.2,4.3,15,-3.7,3.6,17.7,-1.5,6.6,16.7,-0.8,5.4,13.2,-2.2,5.7,9.7,-1.2,5.7,6,-2,2.9,3.5,-2.2,3.9,-0.2,-2.7,2.2,-3.5,-3.1,4.5,-6.6,-2.3,3.3,-10.1,-3.5,5.1,-13.2,-3.7,8.8,-14,-0.5,10,-12.3,-1.4,7.8,-9.3,-4.8,9.5,-9.2,-6.8,6.2,-9.2,-10.5,7.2,-9.2,-12.1,3.8,-9.9,-10.7,0.9,-12,-11.2,-1.7,-9.2,-8.1,-2.3,-7.1,-8.5,-0.6,-3.7,-6.4,0.1,-0.6,-7,3.4,1.2,-6.3,3.5,4.9,-6.2,7,6.4,-5.7,8.2,10,-7.2,10.3,12.7,-4.7,13.1,12,-1,13.7,11.2,-0.4,12.7,7.6,2.1,14.8,5.8,5.1,14.2,3.5,5.2,14,0.5,2.2,11.7,0.1,0.6,14,-2.6';
  const CA_B = '17.6,-8.6,9.6,17,-5.5,11.7,18.4,-2.8,14,17.5,0,11.5,19.2,1.5,8.5,17.3,-1.1,6.4,19,-3.6,8.5,22.4,-2.3,7.2,21.2,-2.1,3.6,19.8,-5.7,3.8,23.1,-7,5.3,24.9,-5,2.5,27,-3,4.9,26,0.2,3.2,25.4,0.7,-0.5,21.9,1.3,-2.1,21,1.4,-5.7,19.3,-1.9,-5.9,16.7,-2.3,-8.5,15.7,-5.9,-7.7,16.4,-8.5,-5,15.4,-12,-4.2,15.2,-14.3,-1.3,12.4,-12.3,0.4,12.7,-8.6,-0.4,14.9,-5.8,-1.7,13.9,-2.8,-3.8,16.1,0.2,-4.1,15.9,3.9,-4.8,15.1,6.4,-2,17.9,8.9,-1.5,15.3,11.7,-0.7,12.9,11.2,-3.6,9.5,13,-3.3,9.1,12.4,-7,11.1,11.8,-10.2,11,8,-9.6,10.9,7,-5.9,11.9,3.6,-4.6,11.2,1.4,-1.6,10.5,-2.3,-1.5,11.4,-3.9,1.8,11,-7.5,3.2,14.3,-9,4.3,12.4,-10.3,7.3,12.2,-7.7,10.1,8.6,-6.6,10.7,8.8,-3.4,12.6,5.5,-2.1,11.4,2.4,-3.2,9.6,0.4,-2.9,12.8,2.3,-5.9,14.1,2.5,-8,10.9,1.2,-11.6,11.4,-1.5,-13.4,9.5,1.3,-15.6,8,2.9,-12.4,6.8,0.3,-11.6,4.1,2,-13.5,1.3,5.2,-11.6,2.1,3.3,-8.3,2.2,1.6,-9.1,-1.1,4.9,-10,-2.6,6.2,-6.5,-1.7,3.4,-5,-3.8,3.8,-7.5,-6.7,7.5,-6.6,-6.8,6.7,-2.9,-6.6,4.5,-3,-9.7,7.1,-5,-11.6,9.8,-2.6,-10.7,7.5,0.3,-11.5,7,-1.1,-14.9,10.7,-1.8,-15.6,11.4,1.8,-14.5,8.9,2.9,-17.2,6.2,4.2,-14.9,3.6,3.6,-17.6,1.6,6.7,-16.7,0.9,5.6,-13.2,2.3,5.7,-9.7,1.4,5.6,-6,2.3,3,-3.4,2.3,4,0.2,2.9,2.2,3.5,3.3,4.4,6.6,2.4,3.3,10.1,3.5,4.9,13.3,3.5,8.5,14.2,0.4,9.7,12.5,1.3,7.9,9.3,4.8,9.3,9.3,6.8,6,9.7,10.3,7.2,10,12.2,3.9,10,10.6,1.1,12,11.1,-1.7,9.5,8.1,-2.2,7.2,8.7,-0.6,3.7,6.4,0.2,0.7,7.2,3.3,-1.3,6.5,3.6,-5,6.4,7.1,-6.4,5.9,8.1,-10,7,10.4,-12.8,4.8,13.2,-11.8,1.1,13.7,-11.2,0.4,12.7,-7.6,-2.3,14.7,-5.8,-5.1,14.2,-3.4,-5.2,13.9,-0.4,-2.1,11.7,-0.1,-0.6,13.8,2.6';
  // each chain smoothed (a Catmull–Rom spline, three points a residue), with each point's secondary structure (0 coil, 1 helix, 2 strand)
  const TRACE = [CA_A, CA_B].map(str => {
    const v = str.split(',').map(Number), P = [];
    for (let i = 0; i < v.length; i += 3) P.push([v[i], v[i + 1], v[i + 2]]);
    const ss = r => (HELICES.some(([a, b]) => r >= a && r <= b) ? 1 : STRANDS.some(([a, b]) => r >= a && r <= b) ? 2 : 0);
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 3; k++) {
        const u = k / 3, u2 = u * u, u3 = u2 * u;
        out.push([...[0, 1, 2].map(j => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u3)), ss(Math.round(FIRST + i + u))]);
      }
    }
    out.push([...P[P.length - 1], ss(FIRST + P.length - 1)]);
    return out;
  });

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 22;
  const SHOW = [0, 0.4, 21.4, 22.0];
  const ARCHIVE_IN = [0.2, 0.8];                                   // the depositors and OneDep
  const ENRICH_IN = [2.6, 3.2];                                    // the PDBe-KB partners, enrichment and the databases
  const ACCESS_IN = [7.4, 8.0];                                    // the APIs and the pages they serve
  const ENTRY_FROM = 0.6, ENTRY_EVERY = 0.8, ENTRY_LAST = 15.2;    // entries set off from the depositors ...
  const LEGS = [0.6, 2.2, 0.6, 0.6];                               // ... rise into OneDep, pass its gears, are enriched, go into the databases
  const FILE_FROM = 3.4, FILE_EVERY = 1.3, FILE_LAST = 15.2, DROP = 0.9;        // the partners' annotation files drop in
  const SERVE_FROM = 8.2, SERVE_EVERY = 0.55, SERVE_LAST = 15.2, SERVE = 1.1;   // data goes out through the APIs, page by page
  const ZOOM = [15.4, 16.3];                                       // the entry page opens up, and the rest fades
  const PAGE_IN = [16.1, 16.6];                                    // its three views
  const CURSOR = [16.6, 17.5], PICKED = [17.4, 17.7];              // the cursor moves along the tracks to LYS92, and picks it
  const TOPO_HI = [17.7, 18.0], MOL_HI = [17.9, 18.2];             // ... which lights up in the topology, then in 3D
  // the headings: deposition, enrichment, access, all of it, the entry page, then LYS92
  const HEADS = [[0.4, 4.2], [4.4, 7.8], [8.0, 12.0], [12.2, 15.4], [15.6, 18.5], [18.6, 21.4]];
  const STILL = 14;

  // a gear of radius R with n teeth, turned by ang (the path only)
  function gear(ctx, x, y, R, n, ang) {
    const Ri = R * 0.78, st = TAU / n;
    ctx.beginPath();
    for (let k = 0; k < n; k++) {
      const a = ang + k * st;
      [[Ri, a - st * 0.5], [Ri, a - st * 0.27], [R, a - st * 0.17], [R, a + st * 0.17], [Ri, a + st * 0.27]].forEach(([r, b], q) => {
        const px = x + r * Math.cos(b), py = y + r * Math.sin(b);
        if (k || q) ctx.lineTo(px, py); else ctx.moveTo(px, py);
      });
    }
    ctx.closePath();
  }
  // a hexagon, point up (the path only)
  function hexagon(ctx, x, y, r) {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k * TAU) / 6; if (k) ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); else ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a)); }
    ctx.closePath();
  }
  // a rounded rectangle (the path only)
  function box(ctx, x, y, w, h, r) {
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
  }
  // a group of people, size s: one in front, two behind
  function people(ctx, x, y, s, colour, th) {
    const f = s * 0.5;
    const one = (cx, cy, k, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath(); ctx.arc(cx, cy - f * k * 0.62, f * k * 0.36, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx, cy + f * k * 0.5, f * k * 0.62, f * k * 0.58, 0, Math.PI, TAU); ctx.closePath(); ctx.fill();
    };
    const pale = mix(th.bg, colour, 0.55);
    one(x - f, y + f * 0.1, 0.82, pale); one(x + f, y + f * 0.1, 0.82, pale);
    one(x, y, 1, colour);
  }
  // the small picture inside each served page, centred on x, y, in a body bw by bh
  function picture(ctx, kind, x, y, bw, bh, th) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 1.1;
    if (kind === 'entry') {                                // a structure: a short helix
      ctx.strokeStyle = th.fid; ctx.beginPath();
      for (let q = 0; q <= 18; q++) { const u = q / 18, px = x - bw / 2 + u * bw, py = y + Math.sin(u * TAU * 1.5) * bh * 0.42; if (q) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke();
    } else if (kind === 'tracks') {                        // a protein's annotations: feature tracks along its sequence
      [[th.fid, 1, 0], [th.green, 0.55, 0.3], [th.spec, 0.35, 0.5]].forEach(([c, L, x0], q) => {
        ctx.strokeStyle = c; ctx.lineWidth = Math.max(1.2, bh * 0.22);
        const py = y - bh * 0.36 + q * bh * 0.36;
        ctx.beginPath(); ctx.moveTo(x - bw / 2 + bw * x0, py); ctx.lineTo(x - bw / 2 + bw * Math.min(1, x0 + L), py); ctx.stroke();
      });
    } else if (kind === 'ligand') {                        // a small molecule: a ring with a side chain
      const r = bh * 0.5, cx = x - r * 0.35;
      ctx.strokeStyle = th.ink; ctx.beginPath();
      for (let q = 0; q <= 6; q++) { const a = (q * TAU) / 6; if (q) ctx.lineTo(cx + r * Math.cos(a), y + r * Math.sin(a)); else ctx.moveTo(cx + r * Math.cos(a), y + r * Math.sin(a)); }
      ctx.moveTo(cx + r, y); ctx.lineTo(cx + r * 1.7, y - r * 0.55);
      ctx.stroke();
    } else {                                               // a complex: two chains together
      const r = bh * 0.5;
      ctx.fillStyle = rgba(th.fid, 0.55); ctx.beginPath(); ctx.arc(x - r * 0.5, y, r, 0, TAU); ctx.fill();
      ctx.fillStyle = rgba(th.green, 0.75); ctx.beginPath(); ctx.arc(x + r * 0.5, y, r, 0, TAU); ctx.fill();
    }
  }

  // chain A's topology in box b (u, v across and down it): its five strands in the sheet's order (31–34, 38–42, 50–56,
  // then 112–117 and 94–100, the strand that pairs with chain B's), the long helix (68–88) above them, the short one
  // (18–23) at the start; hi lights the loop from the long helix to strand 94–100, which holds LYS92. Returns LYS92's point
  function topology(ctx, b, th, hi, big) {
    const P = (u, v) => [b.x + u * b.w, b.y + v * b.h];
    const line = pts => { ctx.beginPath(); pts.forEach(([u, v], i) => { const [x, y] = P(u, v); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke(); };
    const aw = Math.max(2.2, b.w * 0.04), loop = [[0.86, 0.17], [0.93, 0.17], [0.93, 0.88], [0.78, 0.88], [0.78, 0.75]];
    ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    [[[0.08, 0.36], [0.08, 0.26]], [[0.08, 0.6], [0.08, 0.84], [0.22, 0.84], [0.22, 0.75]], [[0.22, 0.35], [0.22, 0.28], [0.36, 0.28], [0.36, 0.35]],
      [[0.36, 0.75], [0.36, 0.84], [0.5, 0.84], [0.5, 0.75]], [[0.5, 0.35], [0.5, 0.17]], loop,
      [[0.78, 0.35], [0.78, 0.28], [0.64, 0.28], [0.64, 0.35]], [[0.64, 0.75], [0.64, 0.92]]].forEach(line);
    ctx.fillStyle = mix(th.bg, th.fid, 0.15); ctx.strokeStyle = th.fid;
    for (const [u, up] of [[0.22, true], [0.36, false], [0.5, true], [0.64, false], [0.78, true]]) {   // the strands, as arrows
      const [x, y0] = P(u, up ? 0.75 : 0.35), [, y1] = P(u, up ? 0.35 : 0.75), d = up ? -1 : 1, hd = aw * 2;
      ctx.beginPath();
      ctx.moveTo(x - aw, y0); ctx.lineTo(x - aw, y1 - d * hd); ctx.lineTo(x - aw * 1.9, y1 - d * hd); ctx.lineTo(x, y1);
      ctx.lineTo(x + aw * 1.9, y1 - d * hd); ctx.lineTo(x + aw, y1 - d * hd); ctx.lineTo(x + aw, y0); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    const r = aw * 1.3;                                    // the helices, as cylinders
    { const [x, y0] = P(0.08, 0.36), [, y1] = P(0.08, 0.6); box(ctx, x - r, y0, 2 * r, y1 - y0, r); ctx.fill(); ctx.stroke(); }
    { const [x0, y] = P(0.5, 0.17), [x1] = P(0.86, 0.17); box(ctx, x0 - r, y - r, x1 - x0 + 2 * r, 2 * r, r); ctx.fill(); ctx.stroke(); }
    // LYS92, two thirds of the way along the loop from the helix's end (88) to the strand's start (94)
    const pts = loop.map(([u, v]) => P(u, v)), seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let left = seg.reduce((q, l) => q + l, 0) * ((PICK - 88) / (94 - 88)), k92 = pts[pts.length - 1];
    for (let i = 0; i < seg.length; i++) { if (left <= seg[i]) { const u = left / seg[i]; k92 = [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]; break; } left -= seg[i]; }
    if (hi > 0.01) {
      const keep = ctx.globalAlpha; ctx.globalAlpha = keep * hi;
      ctx.strokeStyle = th.spec; ctx.lineWidth = 2.2; line(loop);
      ctx.fillStyle = th.spec; ctx.beginPath(); ctx.arc(k92[0], k92[1], Math.max(2.4, aw * 0.9), 0, TAU); ctx.fill();
      ctx.globalAlpha = keep;
    }
    return { k92, ends: big ? [P(0.08, 0.2), P(0.64, 0.97)] : null };
  }

  // the HINT1 dimer in box b, turned by phi about its two-fold axis: chain A blue, chain B green, nearer parts darker and
  // thicker, helices and strands thicker than loops. Returns LYS92's point (chain A) and the scale, px per Å
  function dimer(ctx, b, th, phi) {
    const c = Math.cos(phi), sn = Math.sin(phi), sc = Math.min(b.w / 64, b.h / 38), cx = b.x + b.w / 2, cy = b.y + b.h / 2 + 1;
    const segs = [];
    TRACE.forEach((tr, ch) => {
      let prev = null;
      for (const [x, y, z, ss] of tr) {
        const X = x * c + z * sn, Z = -x * sn + z * c, p = [cx + X * sc, cy + y * sc, Z];
        if (prev) segs.push([(prev[2] + Z) / 2, prev[0], prev[1], p[0], p[1], ch, ss]);
        prev = p;
      }
    });
    segs.sort((p, q) => p[0] - q[0]);
    const shades = [th.fid, th.green].map(col => Array.from({ length: 9 }, (_, k) => mix(th.bg, col, 0.3 + 0.7 * (k / 8))));
    const lw = Math.max(1, Math.min(2.6, sc * 0.45));
    ctx.lineCap = 'round';
    for (const [z, x0, y0, x1, y1, ch, ss] of segs) {
      const d = Math.max(0, Math.min(1, (z + 18) / 36));
      ctx.strokeStyle = shades[ch][Math.round(d * 8)]; ctx.lineWidth = lw * (ss ? 1.7 : 1) * (0.8 + 0.4 * d);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    const [x, y, z] = TRACE[0][(PICK - FIRST) * 3];
    return { k92: [cx + (x * c + z * sn) * sc, cy + y * sc], sc };
  }

  Anim.register('pdbe-kb-2022', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, showAll = envelope(s, SHOW);
    if (showAll < 0.005) return;
    const show = showAll * (1 - between(s, ZOOM[0], ZOOM[0] + 0.5));   // the journey, which fades as the entry page opens
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 18, bot = h - pad, H = bot - top, big = w >= 400;
    const label = (text, x, y, align, colour, alpha) => { if (alpha < 0.01 || !text) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const flabel = (text, x, y, align, colour, alpha) => { if (alpha < 0.01 || !text) return; ctx.globalAlpha = showAll * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const M = q => Anim.measure(ctx, th, q);
    const aArc = between(s, ...ARCHIVE_IN), aEnr = between(s, ...ENRICH_IN), aAcc = between(s, ...ACCESS_IN);

    /* ---- layout, from the right: the served pages, the APIs, the databases, enrichment, then OneDep's gears ---- */
    const iw = Math.max(12, Math.min(26, w * 0.044)), ih = iw * 0.78;
    const names = OUTPUTS.map(o => (big ? o[0] : o[1])), viewsName = big ? 'aggregated views' : '';   // (none on phones)
    const colW = Math.max(...names.map(n => iw / 2 + 6 + M(n)), M(viewsName) - iw / 2);
    const ox = w - pad - colW;
    const rowY = [0.1, 0.52, 0.73, 0.94].map(f => top + f * H), viewsY = top + 0.35 * H;
    const hr = Math.max(9, Math.min(26, w * 0.04)), step = hr * 2.4, yM = top + 0.52 * H;
    const api = { x: ox - iw / 2 - Math.max(14, w * 0.07) - hr, y: yM }, db = { x: api.x - step, y: yM }, enr = { x: db.x - step, y: yM };
    const NG = w >= 600 ? 6 : w >= 400 ? 4 : w >= 260 ? 3 : 2, gx0 = pad, gx1 = enr.x - hr - Math.max(10, w * 0.03);
    const gR = Math.min(((gx1 - gx0) / NG) * 0.53, hr * 1.3), gSp = gR / 0.53, gStart = (gx0 + gx1) / 2 - (gSp * NG) / 2;
    const gears = Array.from({ length: NG }, (_, k) => gStart + gSp * (k + 0.5));
    const ps = Math.max(9, hr), dep = { x: gears[0], y: yM + 0.68 * (bot - yM) }, partners = { x: enr.x, y: top + 0.16 * H };
    const tok = Math.max(4, hr * 0.45);
    const firstServe = k => SERVE_FROM + k * SERVE_EVERY + SERVE;    // when each page first gets its data

    if (show > 0.005) {
      const arrow = (x0, y0, x1, y1, colour, alpha, lw = 1) => {
        if (alpha < 0.01) return;
        const a = Math.atan2(y1 - y0, x1 - x0), k = 3.5;
        ctx.globalAlpha = show * alpha; ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = lw;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - Math.cos(a) * k, y1 - Math.sin(a) * k); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - Math.cos(a - 0.45) * k * 1.6, y1 - Math.sin(a - 0.45) * k * 1.6); ctx.lineTo(x1 - Math.cos(a + 0.45) * k * 1.6, y1 - Math.sin(a + 0.45) * k * 1.6); ctx.closePath(); ctx.fill();
      };
      // the fan from the APIs to each page: a gentle S-curve
      const fanFrom = [api.x + hr * 0.87, yM];
      const fanAt = (k, u) => {
        const [x0, y0] = fanFrom, x3 = ox - iw / 2 - 3, y3 = rowY[k], dx = x3 - x0;
        const c1 = [x0 + dx * 0.55, y0], c2 = [x0 + dx * 0.45, y3], v = 1 - u;
        return [v * v * v * x0 + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * x3, v * v * v * y0 + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * y3];
      };

      /* ---- guides: how the data flows ---- */
      arrow(dep.x, dep.y - ps * 0.6 - 3, dep.x, yM + gR + 3, th.fid, aArc * 0.5);
      arrow(gears[NG - 1] + gR + 2, yM, enr.x - hr - 2, yM, th.muted, aEnr * 0.8);
      arrow(enr.x + hr * 0.87 + 1, yM, db.x - hr * 0.87 - 2, yM, th.muted, aEnr * 0.8);
      arrow(partners.x, partners.y + ps * 0.3 + 4, enr.x, yM - hr - 2, th.green, aEnr * 0.6);
      arrow(db.x + hr * 0.87 + 1, yM, api.x - hr * 0.87 - 2, yM, th.muted, aAcc * 0.8);
      if (aAcc > 0.01) {
        ctx.globalAlpha = show * aAcc * 0.45; ctx.strokeStyle = th.spec; ctx.lineWidth = 1;
        OUTPUTS.forEach((_, k) => { ctx.beginPath(); for (let q = 0; q <= 24; q++) { const [px, py] = fanAt(k, q / 24); if (q) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); });
      }

      /* ---- 1. archiving: the depositors, and OneDep's gears, turning ---- */
      if (aArc > 0.01) {
        ctx.globalAlpha = show * aArc;
        people(ctx, dep.x, dep.y, ps, th.fid, th);
        const turn = 0.8 * Math.max(0, s - 0.4), teeth = gR > 14 ? 10 : 8;
        gears.forEach((gx, k) => {
          gear(ctx, gx, yM, gR, teeth, k % 2 ? -turn + Math.PI / teeth : turn);
          ctx.fillStyle = mix(th.bg, th.fid, 0.14); ctx.fill(); ctx.strokeStyle = th.fid; ctx.lineWidth = 1.1; ctx.lineJoin = 'round'; ctx.stroke();
          ctx.beginPath(); ctx.arc(gx, yM, gR * 0.3, 0, TAU); ctx.fillStyle = th.bg; ctx.fill(); ctx.stroke();
        });
      }

      /* ---- 2. enrichment: the partners, and the hexagons for enrichment and the databases ---- */
      const node = (n, colour, alpha, glyph) => {
        if (alpha < 0.01) return;
        ctx.globalAlpha = show * alpha;
        hexagon(ctx, n.x, n.y, hr); ctx.fillStyle = mix(th.bg, colour, 0.14); ctx.fill(); ctx.strokeStyle = colour; ctx.lineWidth = 1.3; ctx.lineJoin = 'round'; ctx.stroke();
        const g = hr * 0.5; ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
        glyph(n.x, n.y, g);
      };
      node(enr, th.green, aEnr, (x, y, g) => {             // enrichment: a small network
        const pts = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6].map(a => [x + g * Math.cos(a), y + g * Math.sin(a)]);
        ctx.beginPath(); for (const [px, py] of pts) { ctx.moveTo(x, y); ctx.lineTo(px, py); } ctx.stroke();
        for (const [px, py] of [[x, y], ...pts]) { ctx.beginPath(); ctx.arc(px, py, Math.max(1.2, g * 0.24), 0, TAU); ctx.fill(); }
      });
      node(db, th.green, aEnr, (x, y, g) => {              // the databases: a cylinder
        const rx = g * 0.75, ry = g * 0.28, y0 = y - g * 0.6, y1 = y + g * 0.6;
        ctx.beginPath(); ctx.ellipse(x, y0, rx, ry, 0, 0, TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - rx, y0); ctx.lineTo(x - rx, y1); ctx.ellipse(x, y1, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(x + rx, y0); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); ctx.stroke();
      });
      if (aEnr > 0.01) { ctx.globalAlpha = show * aEnr; people(ctx, partners.x, partners.y, ps, th.green, th); }

      /* ---- 3. access: the APIs, and the pages they serve ---- */
      node(api, th.spec, aAcc, (x, y, g) => {              // the APIs: </>
        ctx.beginPath();
        ctx.moveTo(x - g * 0.3, y - g * 0.45); ctx.lineTo(x - g * 0.8, y); ctx.lineTo(x - g * 0.3, y + g * 0.45);
        ctx.moveTo(x + g * 0.3, y - g * 0.45); ctx.lineTo(x + g * 0.8, y); ctx.lineTo(x + g * 0.3, y + g * 0.45);
        ctx.moveTo(x + g * 0.14, y - g * 0.6); ctx.lineTo(x - g * 0.14, y + g * 0.6);
        ctx.stroke();
      });
      if (aAcc > 0.01) {
        OUTPUTS.forEach(([, , kind], k) => {
          const wx = ox - iw / 2, wy = rowY[k] - ih / 2, lit = between(s, firstServe(k) - 0.1, firstServe(k) + 0.4);
          ctx.globalAlpha = show * aAcc;
          box(ctx, wx, wy, iw, ih, 2); ctx.fillStyle = th.surface; ctx.fill(); ctx.strokeStyle = th.spec; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(wx, wy + ih * 0.26); ctx.lineTo(wx + iw, wy + ih * 0.26); ctx.lineWidth = 1; ctx.stroke();
          if (lit > 0.01) { ctx.globalAlpha = show * aAcc * lit; picture(ctx, kind, ox, wy + ih * 0.26 + ih * 0.37, iw * 0.66, ih * 0.5, th); }
        });
      }

      /* ---- what moves: the partners' files, the entries, and the data going out ---- */
      if (aEnr > 0.01) {                                   // annotation files, dropping into enrichment
        const fw = Math.max(4, hr * 0.5), fh = fw * 1.25, y0 = partners.y + ps * 0.3 + 4, y1 = yM - hr;
        for (let m = 0; FILE_FROM + m * FILE_EVERY <= FILE_LAST; m++) {
          const age = s - FILE_FROM - m * FILE_EVERY;
          if (age < 0 || age > DROP) continue;
          const u = ease(age / DROP), fy = lerp(y0, y1, u);
          ctx.globalAlpha = show * aEnr * between(age, 0, 0.2) * (1 - between(age, DROP - 0.25, DROP));
          ctx.fillStyle = mix(th.bg, th.green, 0.3); ctx.strokeStyle = th.green; ctx.lineWidth = 1;
          ctx.fillRect(partners.x - fw / 2, fy - fh / 2, fw, fh); ctx.strokeRect(partners.x - fw / 2, fy - fh / 2, fw, fh);
          if (fw >= 6) { ctx.beginPath(); for (const q of [-0.15, 0.15]) { ctx.moveTo(partners.x - fw * 0.25, fy + q * fh); ctx.lineTo(partners.x + fw * 0.25, fy + q * fh); } ctx.stroke(); }
        }
      }
      if (aArc > 0.01) {                                   // the entries: up into OneDep, through its gears, enriched, into the databases
        const [L0, L1, L2, L3] = LEGS, total = L0 + L1 + L2 + L3, xEnd = gears[NG - 1];
        for (let n = 0; ENTRY_FROM + n * ENTRY_EVERY <= ENTRY_LAST; n++) {
          const age = s - ENTRY_FROM - n * ENTRY_EVERY;
          if (age < 0 || age > total) continue;
          let x, y;
          if (age < L0) { x = dep.x; y = lerp(dep.y - ps * 0.6, yM, ease(age / L0)); }
          else if (age < L0 + L1) { x = lerp(gears[0], xEnd, (age - L0) / L1); y = yM; }
          else if (age < L0 + L1 + L2) { x = lerp(xEnd, enr.x, (age - L0 - L1) / L2); y = yM; }
          else { x = lerp(enr.x, db.x, (age - L0 - L1 - L2) / L3); y = yM; }
          const a = between(age, 0, 0.25) * (1 - between(age, total - 0.3, total));
          ctx.globalAlpha = show * aArc * a; ctx.fillStyle = th.fid;
          box(ctx, x - tok / 2, y - tok / 2, tok, tok, 1.2); ctx.fill();
          const tag = between(age, L0 + L1 + L2 - 0.05, L0 + L1 + L2 + 0.25);   // its annotations, once enriched
          if (tag > 0.01) { ctx.globalAlpha = show * aArc * a * tag; ctx.fillStyle = th.green; ctx.beginPath(); ctx.arc(x + tok / 2, y - tok / 2, Math.max(1.6, tok * 0.34), 0, TAU); ctx.fill(); }
        }
      }
      if (aAcc > 0.01) {                                   // data served: from the databases, through the APIs, to each page in turn
        const r = Math.max(1.8, hr * 0.17);
        for (let q = 0; SERVE_FROM + q * SERVE_EVERY <= SERVE_LAST; q++) {
          const age = s - SERVE_FROM - q * SERVE_EVERY;
          if (age < 0 || age > SERVE) continue;
          const u = age / SERVE, [x, y] = u < 0.3 ? [lerp(db.x, api.x, u / 0.3), yM] : fanAt(q % OUTPUTS.length, (u - 0.3) / 0.7);
          ctx.globalAlpha = show * aAcc * between(age, 0, 0.15) * (1 - between(age, SERVE - 0.15, SERVE)); ctx.fillStyle = th.spec;
          ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        }
      }

      /* ---- labels ---- */
      const oneDep = big ? 'wwPDB OneDep' : 'OneDep', trainMid = (gears[0] + gears[NG - 1]) / 2;
      label(oneDep, Math.max(trainMid, pad + M(oneDep) / 2), yM - gR - 10, 'center', th.fid, aArc);
      label(big ? 'PDB depositors' : 'depositors', dep.x + ps * 0.8 + 5, dep.y, 'left', th.fid, aArc);
      const pName = big ? 'PDBe-KB partners' : 'partners', pRight = partners.x - ps * 0.8 - 5;
      if (pRight - M(pName) >= pad) label(pName, pRight, partners.y, 'right', th.green, aEnr);
      else label(pName, partners.x, partners.y - ps * 0.5 - 9, 'center', th.green, aEnr);
      label(big ? 'databases' : 'DBs', db.x, yM + hr + 12, 'center', th.green, aEnr);
      label('APIs', api.x, yM - hr - 10, 'center', th.spec, aAcc);
      names.forEach((n, k) => label(n, ox + iw / 2 + 6, rowY[k], 'left', th.soft, aAcc));
      label(viewsName, ox - iw / 2, viewsY, 'left', th.muted, aAcc);
    }

    /* ---- 4. one entry page, opened up: 1KPA's three linked views ---- */
    const zoom = between(s, ...ZOOM);
    if (zoom > 0.001) {
      const page = { x: pad, y: top - 6, w: w - 2 * pad, h: bot - top + 6 }, bar = big ? 18 : 10;
      const R = { x: lerp(ox - iw / 2, page.x, zoom), y: lerp(rowY[0] - ih / 2, page.y, zoom), w: lerp(iw, page.w, zoom), h: lerp(ih, page.h, zoom) };
      const barH = lerp(ih * 0.26, bar, zoom);
      box(ctx, R.x, R.y, R.w, R.h, 3);
      ctx.globalAlpha = showAll * Math.min(1, zoom * 3); ctx.fillStyle = th.surface; ctx.fill();
      ctx.globalAlpha = showAll; ctx.strokeStyle = th.spec; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(R.x, R.y + barH); ctx.lineTo(R.x + R.w, R.y + barH); ctx.lineWidth = 1; ctx.stroke();
      const cA = between(s, ...PAGE_IN);
      if (cA > 0.01) {
        if (big) flabel('pdbe.org/1kpa', page.x + 8, page.y + bar / 2, 'left', th.muted, cA);
        const m = Math.max(6, w * 0.018), ix0 = page.x + m, ix1 = page.x + page.w - m, iy0 = page.y + bar + m, iy1 = page.y + page.h - m;
        const tH = (iy1 - iy0) * 0.44, lit = between(s, ...PICKED), topoHi = between(s, ...TOPO_HI), molHi = between(s, ...MOL_HI);

        // the sequence-feature tracks (ProtVista), over residues 77–106: a cursor moves along them to LYS92
        const TRACKS = [['UniProt', th.fid], ['chain A', th.green], ['interfaces'], ['variants']].filter(([n]) => w >= 260 || n !== 'chain A');   // (the smallest panel has room for three)
        const nameW = Math.max(...TRACKS.map(([n]) => M(n))) + 8, tx0 = ix0 + nameW, tx1 = ix1, seqH = big ? 14 : 0, rowH = (tH - seqH) / TRACKS.length;
        const X = r => tx0 + ((r - SEQ0 + 0.5) / SEQ.length) * (tx1 - tx0), per = (tx1 - tx0) / SEQ.length;
        const cur = lerp(SEQ0 + 4, PICK, between(s, ...CURSOR));
        ctx.globalAlpha = showAll * cA * between(s, CURSOR[0] - 0.3, CURSOR[0]);
        ctx.fillStyle = rgba(th.spec, 0.08 + 0.14 * lit); ctx.fillRect(X(cur) - per / 2, iy0, per, tH);
        ctx.strokeStyle = rgba(th.spec, 0.35 + 0.65 * lit); ctx.lineWidth = 1; ctx.strokeRect(X(cur) - per / 2 + 0.5, iy0 + 0.5, per - 1, tH - 1);
        if (seqH) [...SEQ].forEach((c, i) => flabel(c, X(SEQ0 + i), iy0 + 7, 'center', SEQ0 + i === PICK ? mix(th.muted, th.spec, lit) : th.muted, cA));
        TRACKS.forEach(([name, colour], k) => {
          const yc = iy0 + seqH + rowH * (k + 0.5), bh = Math.max(3, rowH * 0.36);
          flabel(name, ix0, yc, 'left', name === 'interfaces' ? mix(th.soft, th.spec, lit) : th.soft, cA);
          ctx.globalAlpha = showAll * cA;
          if (colour) { ctx.fillStyle = colour; ctx.fillRect(tx0, yc - bh / 2, tx1 - tx0, bh); }   // the whole stretch: in UniProt, and observed in chain A
          if (name === 'interfaces') IFACE.filter(r => r >= SEQ0 && r < SEQ0 + SEQ.length).forEach(r => { ctx.fillStyle = r === PICK ? mix(th.fid, th.spec, lit) : th.fid; ctx.fillRect(X(r) - per / 2 - 0.3, yc - bh / 2, per + 0.6, bh); });
          if (name === 'variants') {                       // the known variant at LYS92
            const yb = yc + rowH * 0.3;
            ctx.strokeStyle = th.red; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(tx0, yb); ctx.lineTo(X(PICK - 1), yb); ctx.lineTo(X(PICK), yb - rowH * 0.6); ctx.lineTo(X(PICK + 1), yb); ctx.lineTo(tx1, yb); ctx.stroke();
          }
        });

        // below: the topology (left) and the 3D structure (right), each in a frame
        const by0 = iy0 + tH + m, bw = (ix1 - ix0 - m) * 0.4;
        const topo = { x: ix0, y: by0, w: bw, h: iy1 - by0 }, mol = { x: ix0 + bw + m, y: by0, w: ix1 - ix0 - bw - m, h: iy1 - by0 };
        ctx.globalAlpha = showAll * cA; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
        for (const b of [topo, mol]) ctx.strokeRect(Math.round(b.x) + 0.5, Math.round(b.y) + 0.5, Math.round(b.w), Math.round(b.h));
        const inset = b => ({ x: b.x + 4, y: b.y + 4, w: b.w - 8, h: b.h - 8 });
        const T = topology(ctx, inset(topo), th, topoHi, big);
        if (T.ends) { flabel('N', T.ends[0][0] + 8, T.ends[0][1], 'left', th.muted, cA); flabel('C', T.ends[1][0] + 8, T.ends[1][1] - 4, 'left', th.muted, cA); }
        ctx.save(); ctx.beginPath(); ctx.rect(mol.x + 1, mol.y + 1, mol.w - 2, mol.h - 2); ctx.clip();
        ctx.globalAlpha = showAll * cA;
        const D = dimer(ctx, inset(mol), th, 0.3 * Math.sin(0.5 * (s - PAGE_IN[0])));
        ctx.restore();
        flabel('A', mol.x + 9, mol.y + 10, 'left', th.fid, cA);
        flabel('B', mol.x + mol.w - 9, mol.y + 10, 'right', th.green, cA);

        // the views are linked: the pick shows in all three
        const dash = (to, a) => {
          if (a < 0.01) return;
          ctx.globalAlpha = showAll * cA * a * 0.6; ctx.strokeStyle = th.spec; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
          ctx.beginPath(); ctx.moveTo(X(PICK), iy0 + tH); ctx.lineTo(to[0], to[1]); ctx.stroke(); ctx.setLineDash([]);
        };
        dash(T.k92, topoHi); dash(D.k92, molHi);
        if (molHi > 0.01) {
          const r = Math.max(2.6, D.sc * 1.1), ring = between(s, MOL_HI[0], MOL_HI[0] + 0.9);
          ctx.globalAlpha = showAll * cA * molHi; ctx.fillStyle = th.spec;
          ctx.beginPath(); ctx.arc(D.k92[0], D.k92[1], r, 0, TAU); ctx.fill();
          if (ring < 0.99) { ctx.globalAlpha = showAll * cA * molHi * (1 - ring); ctx.strokeStyle = th.spec; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(D.k92[0], D.k92[1], r * (1 + 2.2 * ring), 0, TAU); ctx.stroke(); }
          const name = big ? 'LYS92' : 'K92', lx = D.k92[0] + r + 5, lw = M(name);
          ctx.globalAlpha = showAll * cA * molHi * 0.85; ctx.fillStyle = th.surface; box(ctx, lx - 2, D.k92[1] - 7, lw + 4, 14, 2); ctx.fill();
          flabel(name, lx, D.k92[1], 'left', th.spec, cA * molHi);
        }
      }
    }

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    const pick = (left, right) => {
      for (const l of left) { const r = right.find(q => M(l) + M(q) + 16 <= room); if (r !== undefined) return [l, r]; }
      return [left.find(l => M(l) <= room) || left[left.length - 1], ''];
    };
    const STAGES = [
      [['Deposition'], ['wwPDB OneDep: curation, validation', 'wwPDB OneDep', 'OneDep'], th.fid],
      [['Enrichment'], ['80 M+ annotations, 185,000+ entries', '80 M+ annotations', '80 M annotations'], th.green],
      [['Access'], ['90+ API endpoints', '90+ endpoints'], th.spec],
      [['PDBe and PDBe-KB', 'PDBe, PDBe-KB'], ['~0.5 M users a month'], th.spec],
      [['PDBe entry page: 1KPA', 'Entry page: 1KPA', '1KPA'], ['human HINT1', 'HINT1'], th.spec],
      [['LYS92'], ['a loop in the dimer interface', 'in the dimer interface', 'dimer interface'], th.spec]];
    STAGES.forEach(([left, right, colour], k) => {
      const [a, b] = HEADS[k], alpha = (k ? between(s, a, a + 0.3) : 1) * (k < HEADS.length - 1 ? 1 - between(s, b - 0.3, b) : 1);
      if (alpha < 0.01) return;
      const [L0, R0] = pick(left, right.concat(['']));
      flabel(L0, pad, ly, 'left', th.ink, alpha);
      flabel(R0, w - pad, ly, 'right', colour, alpha);
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
  function rgba(c, a) { const v = rgb(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; }
})();
