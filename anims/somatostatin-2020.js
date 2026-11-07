/* ==========================================================================
   somatostatin-2020: somatostatin (SST14) binds the βPFO Aβ(1–42) tetramer,
   two to one, at its two exposed ends.
   First the two molecules and their names: SST14, somatostatin, a cyclic
   14-residue neuropeptide (ball and stick, from its NMR structure, PDB
   2MI1: carbons blue, oxygens red, nitrogens dark, the disulfide's sulfurs
   orange); the βPFO tetramer, a β-sheet pore-forming oligomer of
   Aβ(1–42) (PDB 6RHY, its own Cα trace: orange subunits two strands each,
   green ones a strand and a short helix), its hydrophobic sides in a
   detergent micelle and its flexible ends outside it.
   Then the biophysics, under "Somatostatin and βPFO show a specific 2:1
   interaction". Native MS (Fig. 2): the tetramer's charge states, then,
   with SST14, peaks at the masses of the tetramer with one and two SST14
   bound (placed from the masses: tetramer 18,056 Da, SST14 1,638 Da;
   heights approximate). ITC (Fig. 1B–C, read off it), in one panel: twelve
   exothermic injections, each one's heat dropping to a point beneath it on
   the isotherm, then the fit: Kd ≈ 39 µM, 2 SST14 to 1 tetramer.
   Then where, by NMR: a close-up of the ¹H–¹⁵N HMQC (peaks read off
   Fig. 3A, so approximate), where the peaks that shift as SST14 goes in
   show every titration step overlaid, blue to red (the shifts drawn 2.5
   times larger, to be seen), and are dotted red; the same red dots then light
   up on the tetramer, on the residues whose peaks moved (Fig. 4A), at its
   two ends outside the micelle; one SST14 docks at each (2:1), with dashed
   lines to the nearest of them. The DPC micelle is drawn as detergent
   molecules round the tetramer's middle. The views are proper ones (not
   mirror images); SST14 is at the same scale as the tetramer, and its
   docked pose is schematic (Fig. 4C's model is not deposited).
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp = u => Math.max(0, Math.min(1, u));
  const TAU = Math.PI * 2;

  /* ---- native MS: [m/z, height alone, height with SST14, what it is (0 tetramer, 1 or 2 SST14 bound)] ---- */
  const MS = [[3010.4, 0.95, 0.85, 0], [3612.3, 1.0, 0.5, 0], [4515.1, 0.62, 0.38, 0], [6019.8, 0.32, 0.16, 0],
    [3939.9, 0, 0.4, 1], [4924.6, 0, 0.46, 1], [6565.8, 0, 0.22, 1], [3556.4, 0, 0.3, 2], [4267.4, 0, 0.32, 2], [5334.1, 0, 0.26, 2]];
  /* ---- the ¹H–¹⁵N HMQC close-up: [name, ¹H, ¹⁵N (ppm), and its shift by 17 equivalents], read off Fig. 3A ---- */
  const PEAKS = [
    ['F19', 9.263, 125.12, -0.045, -0.09], ['A21', 8.883, 126.95, 0, -0.13], ['', 9.195, 127.86, -0.065, -0.31], ['', 9.165, 129.54, 0.009, -0.18],
    ['', 9.4, 122.32, 0, 0], ['', 9.224, 121.4, -0.005, -0.08], ['', 9.2, 122.85, 0, 0.05], ['', 8.86, 125.0, -0.04, -0.1], ['', 8.75, 124.75, -0.07, -0.15],
    ['', 8.616, 120.46, 0, -0.06], ['', 8.45, 122.1, 0, 0], ['', 8.42, 120.2, 0, 0], ['', 8.56, 123.4, -0.02, 0.04], ['', 9.07, 120.8, 0, 0]];
  /* ---- ITC (Fig. 1B): each injection's peak (µJ/s), and the isotherm's points [molar ratio, kJ/mol] ---- */
  const SPIKES = [-0.52, -0.48, -0.45, -0.4, -0.38, -0.35, -0.32, -0.3, -0.27, -0.25, -0.23, -0.21];
  const HEATS = [[0.4, -4.5], [0.65, -3.95], [0.9, -3.4], [1.15, -2.95], [1.45, -2.6], [1.7, -2.25], [2.0, -1.85], [2.3, -1.55], [2.6, -1.3], [2.9, -1.1], [3.2, -0.95], [3.45, -0.78]];

  /* ---- the tetramer (PDB 6RHY, first model): each chain's Cα trace, residues 1–42, in Å: x across the sheet, y along
     its strands (down the page), z towards the viewer; A and C the orange subunits, B and D the green ---- */
  const CHAINS = {
    A: '-13.9,-23.1,22.6,-12.1,-23.1,19.3,-8.4,-24,19.7,-7,-21.9,16.9,-9.4,-23.4,14.4,-8.6,-26.6,12.5,-11.1,-25.8,9.8,-12.6,-23,7.7,-11.2,-23.7,4.3,-10.4,-20.1,3.7,-11.9,-17,2.2,-11.4,-13.4,3.3,-11.4,-10.5,0.9,-11.5,-6.8,1.8,-12,-3.6,-0.3,-11.5,0,0.6,-12.1,3.2,-1.5,-11.2,6.8,-1.5,-10.8,9.2,-4.4,-10.7,13,-4,-10,15.5,-6.8,-10,19.3,-6.5,-9.3,19.8,-10.2,-5.5,20.1,-9.4,-5.7,23.8,-8.7,-8.1,26.6,-7.6,-6.6,26.3,-4.2,-5.1,22.8,-4.3,-6.5,19.3,-4.2,-5.5,15.7,-4.1,-7,12.7,-2.3,-6,9.1,-2.3,-7.3,6.3,-0.1,-6.8,2.6,-0.9,-7.4,-0.3,1.5,-6.7,-3.9,0.5,-7.2,-6.9,2.7,-6.4,-10.5,1.9,-7,-14.1,3.1,-6.7,-17.2,1,-6.5,-20.7,2.5,-7.1,-23.7,0.2',
    B: '3,-41.8,26.2,5.5,-41.6,23.3,6.7,-38,23.5,6.5,-35.7,20.6,6.7,-32.2,22.1,7.3,-29.9,19.1,9,-27,20.8,7,-27.1,24,7.3,-24.3,26.5,9.7,-22.3,24.3,12,-23.3,21.5,10.7,-21.4,18.5,12.4,-23.4,15.8,15.4,-21.2,15.2,15.4,-21.3,11.4,16.3,-24.8,10.1,15.6,-23.4,6.6,12.4,-25.6,6.5,14.6,-28.6,7.3,17.2,-27.6,4.7,14.7,-27.3,1.9,12.3,-29.8,3.4,8.6,-29.2,3.7,5.4,-30.7,2.3,3.2,-29.4,5.1,1.5,-26.8,3,2.6,-25.4,-0.4,-0.8,-26.2,-1.9,-2.3,-23.5,0.2,-1.7,-20,1.6,-2.4,-16.6,0.2,-1.7,-13.3,1.9,-2.8,-9.9,0.8,-2,-6.5,2.3,-2.4,-3.3,0.2,-2.3,0.1,1.9,-2.7,3.4,0,-2.2,7,1,-2,10.1,-1.1,-2.5,13.6,0.2,-1.9,16.5,-2.2,-2.6,19.9,-0.6',
    C: '13.8,23.1,22.6,12,23.1,19.3,8.3,24,19.7,6.9,21.9,16.9,9.3,23.4,14.4,8.5,26.6,12.5,11,25.8,9.8,12.5,23,7.7,11.1,23.7,4.3,10.3,20.1,3.7,11.8,17,2.2,11.3,13.4,3.3,11.3,10.5,0.9,11.4,6.8,1.8,12,3.6,-0.3,11.5,0,0.6,12.2,-3.1,-1.5,11.2,-6.8,-1.5,10.9,-9.2,-4.4,10.8,-13,-4,10,-15.5,-6.8,10,-19.3,-6.5,9.3,-19.8,-10.2,5.6,-20.1,-9.4,5.8,-23.8,-8.7,8.2,-26.6,-7.6,6.7,-26.3,-4.2,5.2,-22.8,-4.4,6.6,-19.3,-4.2,5.5,-15.7,-4.2,7.1,-12.7,-2.3,6.1,-9.1,-2.3,7.3,-6.3,-0.1,6.8,-2.6,-0.9,7.4,0.3,1.5,6.7,3.9,0.5,7.2,7,2.7,6.4,10.5,1.9,6.9,14.1,3.1,6.7,17.2,0.9,6.5,20.7,2.5,7,23.7,0.2',
    D: '-3.2,41.7,26.1,-5.6,41.6,23.3,-6.9,38,23.5,-6.7,35.6,20.5,-6.8,32.2,22,-7.5,29.9,19,-9.1,27,20.7,-7.2,27.1,24,-7.4,24.2,26.5,-9.8,22.2,24.3,-12.1,23.2,21.5,-10.7,21.3,18.5,-12.5,23.4,15.8,-15.5,21.1,15.2,-15.5,21.3,11.4,-16.4,24.7,10,-15.7,23.4,6.5,-12.5,25.5,6.5,-14.7,28.5,7.3,-17.3,27.6,4.6,-14.8,27.3,1.8,-12.4,29.8,3.4,-8.7,29.2,3.6,-5.5,30.6,2.3,-3.3,29.4,5.1,-1.6,26.7,3,-2.7,25.3,-0.4,0.7,26.2,-2,2.3,23.5,0.2,1.6,20,1.6,2.3,16.6,0.1,1.7,13.3,1.9,2.7,9.8,0.8,2,6.4,2.3,2.4,3.3,0.2,2.3,-0.1,1.9,2.7,-3.4,0,2.2,-7,1,2,-10.1,-1.1,2.6,-13.6,0.2,2,-16.6,-2.2,2.7,-19.9,-0.6'
  };
  // where each subunit's peaks moved when SST14 bound (Fig. 4A): orange V12, F20, V24, G29, V40, A42; green V12, V18,
  // A21, E22, D23, G29, I41, A42. They gather at the tetramer's two ends; one SST14 docks at each
  const CSP = { A: [12, 20, 24, 29, 40, 42], C: [12, 20, 24, 29, 40, 42], B: [12, 18, 21, 22, 23, 29, 41, 42], D: [12, 18, 21, 22, 23, 29, 41, 42] };
  const SITES = [[4.2, -21.4, 1.3], [-4.2, 21.4, 1.3]];   // the centroids of the moved residues at the top and the bottom
  const HELIX = [17, 20], STRAND_ORANGE = [[10, 21], [29, 41]], STRAND_GREEN = [[30, 41]];
  const TRACE = (() => {                                   // each chain smoothed (three points a residue), with its secondary structure
    const out = {};
    for (const [ch, str] of Object.entries(CHAINS)) {
      const v = str.split(',').map(Number), P = [];
      for (let i = 0; i < v.length; i += 3) P.push([v[i], v[i + 1], v[i + 2]]);
      const sse = r => (ch === 'B' || ch === 'D' ? (r >= HELIX[0] && r <= HELIX[1]) || STRAND_GREEN.some(([a, b]) => r >= a && r <= b) : STRAND_ORANGE.some(([a, b]) => r >= a && r <= b));
      const pts = [];
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
        for (let k = 0; k < 3; k++) { const u = k / 3, u2 = u * u, u3 = u2 * u; pts.push([...[0, 1, 2].map(j => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u3)), sse(i + 1 + Math.round(u))]); }
      }
      pts.push([...P[P.length - 1], false]);
      out[ch] = { P, pts };
    }
    return out;
  })();

  /* ---- SST14 (PDB 2MI1, first model): its heavy atoms (element, x, y, z in Å about its centre) and bonds ---- */
  const SST_ATOMS = 'N,-0.8,-9.6,7.5;C,-1.5,-8.5,8.1;C,-0.7,-7.2,7.9;O,-1.2,-6.1,8.0;C,-1.7,-8.8,9.6;N,0.6,-7.3,7.7;C,1.5,-6.2,7.5;C,1.7,-5.9,6.0;O,1.6,-6.8,5.1;N,1.8,-4.7,5.7;C,2.0,-4.2,4.3;C,0.7,-4.6,3.5;O,0.4,-5.7,3.2;C,3.2,-4.9,3.6;S,4.8,-4.5,4.5;N,-0.0,-3.5,3.2;C,-1.3,-3.7,2.4;C,-1.3,-2.8,1.2;O,-1.5,-1.6,1.4;C,-2.5,-3.5,3.4;C,-2.6,-2.1,3.8;C,-3.1,-2.0,5.3;C,-3.3,-0.5,5.7;N,-2.6,-0.3,7.0;N,-1.0,-3.4,0.1;C,-1.0,-2.6,-1.2;C,-2.2,-1.7,-1.2;O,-3.2,-2.0,-0.6;C,-1.0,-3.5,-2.4;C,-2.3,-4.4,-2.4;O,-2.9,-4.6,-1.4;N,-2.7,-4.8,-3.6;N,-2.0,-0.6,-1.9;C,-3.1,0.4,-2.1;C,-3.3,1.2,-0.8;O,-2.7,0.9,0.2;C,-4.4,-0.4,-2.4;C,-5.4,0.3,-3.3;C,-4.9,0.7,-4.6;C,-6.6,0.5,-3.0;C,-5.8,1.3,-5.5;C,-7.5,1.2,-3.9;C,-7.1,1.5,-5.1;N,-4.2,2.2,-0.9;C,-4.5,3.0,0.3;C,-3.2,3.4,1.0;O,-3.1,3.5,2.2;C,-5.3,2.1,1.3;C,-6.7,1.7,0.7;C,-7.6,2.7,0.3;C,-7.0,0.4,0.7;C,-8.8,2.3,-0.2;C,-8.3,0.0,0.2;C,-9.2,1.0,-0.2;N,-2.2,3.7,0.2;C,-0.9,4.2,0.7;C,-0.2,5.0,-0.4;O,-0.2,6.2,-0.3;C,-0.1,3.0,1.1;C,1.2,3.4,1.9;C,1.2,3.6,3.3;C,2.5,3.6,1.4;N,2.5,4.0,3.6;C,3.3,3.9,2.5;C,3.0,3.5,0.1;C,4.7,4.2,2.3;C,4.3,3.7,-0.0;C,5.2,4.1,1.0;N,0.3,4.3,-1.4;C,1.0,5.0,-2.5;C,0.8,4.2,-3.8;O,1.7,4.0,-4.6;C,2.5,5.2,-2.1;C,3.1,6.2,-3.0;C,4.5,6.7,-2.5;C,5.2,7.6,-3.5;N,6.5,8.0,-2.9;N,-0.5,3.7,-3.9;C,-0.8,2.9,-5.1;C,0.2,1.8,-5.3;O,0.3,1.3,-6.5;C,-1.0,3.9,-6.3;O,0.3,4.3,-6.6;C,-1.6,5.2,-5.9;N,0.9,1.5,-4.3;C,1.9,0.4,-4.4;C,1.8,-0.6,-3.2;O,0.8,-0.5,-2.4;C,3.3,1.1,-4.3;C,4.2,0.7,-5.5;C,4.0,1.3,-6.7;C,5.2,-0.1,-5.2;C,4.9,0.9,-7.8;C,6.1,-0.5,-6.3;C,5.9,0.1,-7.6;N,2.8,-1.5,-3.1;C,2.8,-2.5,-2.1;C,2.3,-1.8,-0.8;O,1.8,-2.5,0.1;C,4.2,-3.0,-2.0;O,4.0,-4.2,-1.2;C,5.1,-2.2,-1.2;N,2.5,-0.5,-0.6;C,2.1,0.2,0.6;C,3.0,-0.2,1.7;O,4.2,-0.6,1.5;C,0.7,-0.1,0.9;O,-0.2,-0.0,-0.2;N,2.5,-0.2,2.9;C,3.2,-0.5,4.1;C,4.0,0.7,4.6;O,3.7,1.2,5.7;C,4.2,-1.7,3.9;S,4.5,-2.7,5.3';
  const SST_BONDS = '0,1;1,2;1,4;2,3;2,5;5,6;6,7;7,8;7,9;9,10;10,11;10,13;11,12;11,15;13,14;14,113;15,16;16,17;16,19;17,18;17,24;19,20;20,21;21,22;22,23;24,25;25,26;25,28;26,27;26,32;28,29;29,30;29,31;32,33;33,34;33,36;34,35;34,43;36,37;37,38;37,39;38,40;39,41;40,42;41,42;43,44;44,45;44,47;45,46;45,54;47,48;48,49;48,50;49,51;50,52;51,53;52,53;54,55;55,56;55,58;56,57;56,68;58,59;59,60;59,61;60,62;61,63;61,64;62,63;63,65;64,66;65,67;66,67;68,69;69,70;69,72;70,71;70,77;72,73;73,74;74,75;75,76;77,78;78,79;78,81;79,80;79,84;81,82;81,83;84,85;85,86;85,88;86,87;86,95;88,89;89,90;89,91;90,92;91,93;92,94;93,94;95,96;96,97;96,99;97,98;97,102;99,100;99,101;102,103;103,104;103,106;104,105;104,108;106,107;108,109;109,110;109,112;110,111;112,113';
  const SST = {
    at: SST_ATOMS.split(';').map(q => { const [el, x, y, z] = q.split(','); return { el, p: [+x, +y, +z] }; }),
    bd: SST_BONDS.split(';').map(q => q.split(',').map(Number))
  };

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 32;
  const SHOW = [0, 0.4, 31.4, 32.0];
  const INTRO_OUT = [4.6, 5.2];                            // the two molecules, named
  const BIO_IN = [5.0, 5.6], BIO_OUT = [13.0, 13.6];       // native MS and ITC
  const MS_BIND = [7.0, 8.6];                              // the spectrum with SST14: complexes' peaks grow
  const THERMO = [5.6, 9.6], FIT = [10.6, 11.6];          // ITC: the injections (each heat dropping to its point), then the fit
  const TET_IN = [13.4, 14.2];                             // the HMQC close-up and the tetramer in its micelle
  const TITRATE = [14.4, 16.4], PEAK_DOTS = [16.3, 16.8]; // SST14 added: the peaks that shift walk, then are dotted red
  const LIGHT = [17.0, 18.2];                              // ... and the same red dots light up on the tetramer
  const DOCK = [[18.8, 20.4], [20.0, 21.6]], CONTACTS = [21.6, 22.4];   // one SST14 at each end, then its contacts
  const HEADS = [[0.3, 2.4], [2.6, 4.8], [5.0, 13.4], [13.6, 18.6], [18.8, 31.4]];
  const STILL = 27;

  // the tetramer's smoothed trace, depth-sorted: nearer parts darker and thicker, strands and helix thicker; returns a
  // function placing points of the same frame in the view
  function trace3d(ctx, th, cx, cy, sc, phi) {
    const c = Math.cos(phi), sn = Math.sin(phi), segs = [];
    for (const [ch, T] of Object.entries(TRACE)) {
      let prev = null;
      for (const [x, y, z, ss] of T.pts) {
        const X = x * c + z * sn, Z = -x * sn + z * c, p = [cx + X * sc, cy + y * sc, Z];
        if (prev) segs.push([(prev[2] + Z) / 2, prev[0], prev[1], p[0], p[1], ch, ss]);
        prev = p;
      }
    }
    segs.sort((p, q) => p[0] - q[0]);
    const shades = {}, lw = Math.max(1, Math.min(3, sc * 0.6));
    for (const ch of Object.keys(TRACE)) shades[ch] = Array.from({ length: 9 }, (_, k) => mix(th.bg, ch === 'A' || ch === 'C' ? th.spec : th.green, 0.3 + 0.7 * (k / 8)));
    ctx.lineCap = 'round';
    for (const [z, x0, y0, x1, y1, ch, ss] of segs) {
      const d = Math.max(0, Math.min(1, (z + 15) / 35));
      ctx.strokeStyle = shades[ch][Math.round(d * 8)]; ctx.lineWidth = lw * (ss ? 1.8 : 1) * (0.8 + 0.4 * d);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    return p => [cx + (p[0] * c + p[2] * sn) * sc, cy + p[1] * sc, -p[0] * sn + p[2] * c];
  }
  // the micelle round the tetramer's middle: detergent molecules (a head, and a tail pointing in) packed round a squarish
  // outline, its inside faintly filled
  function micelle(ctx, th, cx, cy, sc, alpha) {
    const a = 25 * sc, b = 15 * sc;
    const pt = u => { const c = Math.cos(u), sn = Math.sin(u); return [cx + a * Math.sign(c) * Math.abs(c) ** 0.72, cy + b * Math.sign(sn) * Math.abs(sn) ** 0.72]; };   // (between an oval and a square)
    ctx.globalAlpha = alpha; ctx.fillStyle = mix(th.bg, th.muted, 0.1);
    ctx.beginPath(); for (let k = 0; k <= 96; k++) { const [x, y] = pt((k / 96) * TAU); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); ctx.fill();
    const path = []; let len = 0, prev = pt(0);                // the outline's points, by distance along it
    for (let k = 1; k <= 400; k++) { const p = pt((k / 400) * TAU); len += Math.hypot(p[0] - prev[0], p[1] - prev[1]); path.push([p, len]); prev = p; }
    const gap = Math.max(8, sc * 4.4), n = Math.floor(len / gap), hr = Math.max(2, sc * 1.25), tl = Math.max(7, sc * 6.5);   // (tails reaching in to the protein)
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.1, sc * 0.6); ctx.strokeStyle = th.muted; ctx.fillStyle = th.muted;
    for (let q = 0, j = 0; q < n; q++) {
      const want = (q + 0.5) * gap; while (j < path.length - 1 && path[j][1] < want) j++;
      const [x, y] = path[j][0], d = Math.hypot(cx - x, cy - y) || 1, ux = (cx - x) / d, uy = (cy - y) / d, wig = 0.3 * Math.sin(q * 1.7);
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (ux + uy * wig) * tl, y + (uy - ux * wig) * tl); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, hr, 0, TAU); ctx.fill();
    }
  }
  // SST14 in ball and stick, centred on cx, cy, sc px per Å, turned by yaw and pitch; returns its atoms' screen points
  function ballStick(ctx, th, cx, cy, sc, yaw, pitch, alpha) {
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const P = SST.at.map(({ p: [x, y, z] }) => { const X = x * cyw + z * syw, Z1 = -x * syw + z * cyw; return [cx + X * sc, cy + (y * cp - Z1 * sp) * sc, y * sp + Z1 * cp]; });
    const col = el => (el === 'O' ? th.red : el === 'N' ? mix(th.fid, th.ink, 0.6) : el === 'S' ? th.spec : th.fid);
    const shade = {}, tone = (el, d) => { const k = el + Math.round(d * 6); return shade[k] || (shade[k] = mix(th.bg, col(el), 0.45 + 0.55 * (Math.round(d * 6) / 6))); };
    const items = SST.bd.map(([i, j]) => [(P[i][2] + P[j][2]) / 2 - 0.3, i, j]).concat(SST.at.map((a, i) => [P[i][2], i, -1]));
    items.sort((p, q) => p[0] - q[0]);
    const r = Math.max(1.3, sc * 0.45), lw = Math.max(0.9, sc * 0.24);
    ctx.globalAlpha = alpha; ctx.lineCap = 'round';
    for (const [z, i, j] of items) {
      const d = Math.max(0, Math.min(1, (z + 13) / 26));
      if (j >= 0) {                                        // a bond: half in each atom's colour
        const mx = (P[i][0] + P[j][0]) / 2, my = (P[i][1] + P[j][1]) / 2;
        ctx.lineWidth = lw;
        ctx.strokeStyle = tone(SST.at[i].el, d); ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(mx, my); ctx.stroke();
        ctx.strokeStyle = tone(SST.at[j].el, d); ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
      } else { ctx.fillStyle = tone(SST.at[i].el, d); ctx.beginPath(); ctx.arc(P[i][0], P[i][1], r * (SST.at[i].el === 'S' ? 1.25 : 1), 0, TAU); ctx.fill(); }
    }
    return P;
  }

  Anim.register('somatostatin-2020', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;
    const pad = Math.max(14, w * 0.05), ly = pad + 6, top = ly + 18, bot = h - pad, H = bot - top, big = w >= 400;
    const label = (text, x, y, align, colour, alpha) => { if (alpha < 0.01 || !text) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const M = q => Anim.measure(ctx, th, q);
    const rock = 0.35 * Math.sin(0.45 * s);

    /* ---- 1. the two molecules, side by side, while the heading names them ---- */
    const aIntro = 1 - between(s, ...INTRO_OUT);
    if (aIntro > 0.01) {
      const scB = Math.min(w * 0.17, H * 0.38) / 13, sx = w * 0.24, sy = top + H * 0.48;
      ballStick(ctx, th, sx, sy, scB, 0.5 * s, 0.35, show * aIntro * between(s, 0.2, 0.8));
      label(big ? 'SST14 (2MI1)' : 'SST14', sx, bot - 4, 'center', th.fid, aIntro);
      const scT = H / 95, tx = w * 0.72, ty = top + H * 0.47;
      micelle(ctx, th, tx, ty, scT, show * aIntro * between(s, 2.4, 3.0));
      ctx.globalAlpha = show * aIntro * between(s, 2.2, 2.8);
      trace3d(ctx, th, tx, ty, scT, rock);
      label(big ? 'βPFO tetramer (6RHY)' : 'βPFO tetramer', tx, bot - 4, 'center', th.soft, aIntro * between(s, 2.4, 3.0));
      if (big) { label('DPC', tx - 25 * scT - 6, ty - 7, 'right', th.muted, aIntro * between(s, 2.4, 3.0)); label('micelle', tx - 25 * scT - 6, ty + 7, 'right', th.muted, aIntro * between(s, 2.4, 3.0)); }
    }

    /* ---- 2. native MS (left) and ITC (right) ---- */
    const aBio = between(s, ...BIO_IN) * (1 - between(s, ...BIO_OUT));
    if (aBio > 0.01) {
      // native MS: the tetramer's charge states, then, with SST14, the complexes' peaks
      const ms = { x: pad + 4, y: top + 22, w: w * 0.5 - pad - 14, h: H - 44 }, mb = between(s, ...MS_BIND);
      const X = mz => ms.x + ((mz - 2600) / (7000 - 2600)) * ms.w, Y = v => ms.y + ms.h - (v / 1.25) * ms.h;
      label(big ? 'native MS' : 'MS', ms.x, ms.y - 12, 'left', th.soft, aBio);
      ctx.globalAlpha = show * aBio; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ms.x, ms.y + ms.h + 0.5); ctx.lineTo(ms.x + ms.w, ms.y + ms.h + 0.5); ctx.stroke();
      for (const mz of big ? [3000, 5000, 7000] : [3000, 6000]) label(String(mz), X(mz), ms.y + ms.h + 10, mz === 7000 ? 'right' : 'center', th.muted, aBio);
      if (big) label('m/z', ms.x + ms.w, ms.y + ms.h + 22, 'right', th.soft, aBio);
      const sig = 22, ht = p => lerp(p[1], p[2], mb);
      ctx.globalAlpha = show * aBio; ctx.strokeStyle = th.soft; ctx.lineWidth = 1.1; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 440; k++) { const mz = 2600 + k * 10, v = MS.reduce((q, p) => q + ht(p) * Math.exp(-(((mz - p[0]) / sig) ** 2)), 0) + 0.015 * Math.sin(mz * 0.37) ** 2; if (k) ctx.lineTo(X(mz), Y(v)); else ctx.moveTo(X(mz), Y(v)); }
      ctx.stroke();
      // above each peak, what it is: the tetramer (a small orange-and-green block), with one or two SST14 (blue dots)
      const mk = Math.max(2.2, ms.w * 0.012);
      for (const p of MS) {
        const v = ht(p);
        if (v < 0.05) continue;
        const x = X(p[0]), y = Y(v) - mk * 2.4;
        ctx.globalAlpha = show * aBio * clamp(v * 4); ctx.fillStyle = th.spec; ctx.fillRect(x - mk, y - mk, mk, mk * 2); ctx.fillStyle = th.green; ctx.fillRect(x, y - mk, mk, mk * 2);
        ctx.fillStyle = th.fid;
        for (let q = 0; q < p[3]; q++) { ctx.beginPath(); ctx.arc(x - (p[3] - 1) * mk * 0.9 + q * mk * 1.8, y - mk * 2.2, mk * 0.8, 0, TAU); ctx.fill(); }
      }

      if (w >= 260) {                                      // a key to the marks over the peaks
        const kx = ms.x + ms.w, ky = ms.y + 4, w1 = M('SST14'), x2 = kx - w1 - 20, w2 = M('βPFO');
        label('SST14', kx, ky, 'right', th.fid, aBio);
        ctx.globalAlpha = show * aBio; ctx.fillStyle = th.fid; ctx.beginPath(); ctx.arc(kx - w1 - 8, ky, mk * 0.8, 0, TAU); ctx.fill();
        label('βPFO', x2, ky, 'right', th.soft, aBio);
        ctx.globalAlpha = show * aBio; ctx.fillStyle = th.spec; ctx.fillRect(x2 - w2 - 8 - mk, ky - mk, mk, mk * 2); ctx.fillStyle = th.green; ctx.fillRect(x2 - w2 - 8, ky - mk, mk, mk * 2);
      }

      // ITC, in one panel: the injections' heats above; each, integrated, drops to a point below it on the isotherm;
      // then the fit, and what it gives: the KD and the stoichiometry
      const ic = { x: w * 0.56, y: top + 22, w: w - pad - w * 0.56, h: H - 44 }, split = ic.y + ic.h * 0.42;
      label('ITC', ic.x, ic.y - 12, 'left', th.soft, aBio);
      ctx.globalAlpha = show * aBio; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(ic.x) + 0.5, Math.round(ic.y) + 0.5, Math.round(ic.w), Math.round(ic.h));
      ctx.beginPath(); ctx.moveTo(ic.x, Math.round(split) + 0.5); ctx.lineTo(ic.x + ic.w, Math.round(split) + 0.5); ctx.stroke();
      const TX = tt => ic.x + ((tt - 150) / 1650) * ic.w, TY = v => ic.y + (split - ic.y) * (0.16 - (v / 0.6) * 0.76);
      const MX = r => TX(300 + ((r - 0.4) / 0.277) * 125), HY = q => split + (ic.y + ic.h - split) * (0.1 + (-q / 5) * 0.8);   // (each point under its injection)
      if (big) {                                           // its axes: time above, molar ratio below, heats at the left, and units
        for (const tt of [1000, 1500]) label(tt === 1500 ? '1500 s' : String(tt), TX(tt), ic.y - 12, 'center', th.muted, aBio);
        for (const r of [1, 2, 3]) label(String(r), MX(r), ic.y + ic.h + 10, 'center', th.muted, aBio);
        label('molar ratio', ic.x + ic.w, ic.y + ic.h + 22, 'right', th.soft, aBio);
        label('µJ/s', ic.x + ic.w - 4, split - 9, 'right', th.muted, aBio); label('kJ/mol', ic.x + 4, split + 10, 'left', th.muted, aBio);
      }
      label('0', ic.x - 4, TY(0), 'right', th.muted, aBio); label('0', ic.x - 4, HY(0), 'right', th.muted, aBio); label('−4', ic.x - 4, HY(-4), 'right', th.muted, aBio);
      const now = 150 + clamp((s - THERMO[0]) / (THERMO[1] - THERMO[0])) * 1650;
      ctx.strokeStyle = th.spec; ctx.lineWidth = 1; ctx.beginPath();
      for (let k = 0; k <= Math.floor((now - 150) / 4); k++) {
        const tt = 150 + k * 4; let v = 0;
        SPIKES.forEach((d, q) => { const dt = tt - (300 + q * 125); if (dt >= 0) v += d * (dt < 6 ? dt / 6 : Math.exp(-(dt - 6) / 22)); });
        if (k) ctx.lineTo(TX(tt), TY(v)); else ctx.moveTo(TX(tt), TY(v));
      }
      ctx.stroke();
      HEATS.forEach(([r, q], k) => {
        const t0 = 300 + k * 125, sk = THERMO[0] + ((t0 + 50 - 150) / 1650) * (THERMO[1] - THERMO[0]), drop = between(s, sk, sk + 0.5);
        if (drop < 0.01) return;
        const x = MX(r), y = lerp(TY(SPIKES[k]), HY(q), drop);
        ctx.globalAlpha = show * aBio * Math.min(1, drop * 3); ctx.fillStyle = th.spec; ctx.beginPath(); ctx.arc(x, y, Math.max(2, ic.w * 0.012), 0, TAU); ctx.fill();
      });
      const fit = between(s, ...FIT);
      if (fit > 0.01) {                                    // the fit: a smooth curve through the points
        ctx.globalAlpha = show * aBio; ctx.strokeStyle = th.spec; ctx.lineWidth = 1.6; ctx.beginPath();
        const n = Math.round(60 * fit);
        for (let k = 0; k <= n; k++) {
          const r = 0.4 + (k / 60) * 3.05;
          let i = 0; while (i < HEATS.length - 2 && HEATS[i + 1][0] < r) i++;
          const y0 = HEATS[Math.max(0, i - 1)][1], [x1, y1] = HEATS[i], [x2, y2] = HEATS[i + 1], y3 = HEATS[Math.min(HEATS.length - 1, i + 2)][1], u = clamp((r - x1) / (x2 - x1));
          const q = 0.5 * (2 * y1 + (y2 - y0) * u + (2 * y0 - 5 * y1 + 4 * y2 - y3) * u * u + (3 * y1 - y0 - 3 * y2 + y3) * u * u * u);
          if (k) ctx.lineTo(MX(r), HY(q)); else ctx.moveTo(MX(r), HY(q));
        }
        ctx.stroke();
        label('Kd ≈ 39 µM', big ? ic.x + ic.w - 6 : ic.x, big ? ic.y + ic.h - 23 : ic.y + ic.h + 10, big ? 'right' : 'left', th.spec, aBio * between(s, FIT[1] - 0.3, FIT[1] + 0.2));
        if (big) label('2 SST14 : 1 tetramer', ic.x + ic.w - 6, ic.y + ic.h - 10, 'right', th.fid, aBio * between(s, FIT[1], FIT[1] + 0.4));
      }
    }

    /* ---- 3. where, by NMR: the ¹H–¹⁵N HMQC titration (left), its shifting peaks dotted red; the same red dots on the
       tetramer (right), at its two ends, outside the micelle; then one SST14 docks at each end ---- */
    const aTet = between(s, ...TET_IN);
    if (aTet > 0.01) {
      // the spectrum, a close-up (positions read off Fig. 3A): the peaks that shift walk, blue to red, and get a red dot
      const sp = { x: pad + (big ? 28 : 18), y: top + 16 + (big ? (H - 36) * 0.1 : 0), w: w * 0.4 - pad - (big ? 28 : 18), h: (H - 36) * (big ? 0.87 : 1) }, dotA = between(s, ...PEAK_DOTS);
      const PX = hp => sp.x + ((9.5 - hp) / 1.1) * sp.w, PY = np => sp.y + ((np - 120) / 10.5) * sp.h;
      ctx.globalAlpha = show * aTet; ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
      ctx.strokeRect(Math.round(sp.x) + 0.5, Math.round(sp.y) + 0.5, Math.round(sp.w), Math.round(sp.h));
      label(big ? '¹H–¹⁵N HMQC: SST14 titration' : 'HMQC', sp.x, sp.y - 10, 'left', th.soft, aTet);   // (on the larger panels, it runs on past the pane)
      if (big) { for (const p of [9.2, 8.8]) label(p.toFixed(1), PX(p), sp.y + sp.h + 10, 'center', th.muted, aTet); for (const n of [122, 126, 130]) label(String(n), sp.x - 5, PY(n), 'right', th.muted, aTet); }
      const rx = Math.max(2.5, sp.w * 0.03), ry = Math.max(2.5, sp.h * 0.022);
      ctx.save(); ctx.beginPath(); ctx.rect(sp.x, sp.y, sp.w, sp.h); ctx.clip();
      const EX = 2.5, FR = [0, 0.55, 0.79, 0.93, 1];        // (the shifts drawn 2.5 times larger; each step's share of the full shift)
      const cols = [th.fid, mix(th.fid, th.spec, 0.45), th.spec, mix(th.spec, th.red, 0.5), th.red];
      const shown = k => (k === 0 ? 1 : between(s, TITRATE[0] + (k - 1) * 0.5, TITRATE[0] + (k - 1) * 0.5 + 0.35));
      for (const [name, hp, np, dh, dn] of PEAKS) {        // each titration step's contours, overlaid, as in Fig. 3A and 3C
        const moves = Math.abs(dh) + Math.abs(dn) > 0.08;
        for (let k = 0; k < (moves ? 5 : 1); k++) {
          const a = shown(k);
          if (a < 0.01) continue;
          const x = PX(hp + dh * EX * FR[k]), y = PY(np + dn * EX * FR[k]);
          ctx.globalAlpha = show * aTet * a; ctx.strokeStyle = moves ? cols[k] : th.fid; ctx.lineWidth = 1;
          for (const q of [1, 0.6]) { ctx.beginPath(); ctx.ellipse(x, y, rx * q, ry * q, 0, 0, TAU); ctx.stroke(); }
        }
        if (moves && dotA > 0.01) { ctx.globalAlpha = show * aTet * dotA; ctx.fillStyle = th.red; ctx.beginPath(); ctx.arc(PX(hp + dh * EX), PY(np + dn * EX), Math.max(1.8, rx * 0.45), 0, TAU); ctx.fill(); }
        if (name && big) label(name, PX(hp) - rx - 3, PY(np) - ry - 6, 'right', th.soft, aTet);
      }
      ctx.restore();

      // the tetramer in its micelle, with the same red dots on the residues whose peaks moved
      const sc = Math.min((w * 0.58 - pad) / 64, H / 100), cx = w * 0.71, cy = top + H / 2;
      micelle(ctx, th, cx, cy, sc, show * aTet);
      ctx.globalAlpha = show * aTet;
      const at = trace3d(ctx, th, cx, cy, sc, rock);
      const moved = [];
      let n = 0;
      for (const [ch, rs] of Object.entries(CSP)) for (const r of rs) {
        const k = n++, a = between(s, LIGHT[0] + (k / 28) * (LIGHT[1] - LIGHT[0] - 0.3), LIGHT[0] + (k / 28) * (LIGHT[1] - LIGHT[0] - 0.3) + 0.3);
        const p = TRACE[ch].P[r - 1], [x, y] = at(p);
        moved.push({ p, x, y });
        if (a < 0.01) continue;
        ctx.globalAlpha = show * aTet * a; ctx.fillStyle = th.red; ctx.beginPath(); ctx.arc(x, y, Math.max(2, sc * 1.0), 0, TAU); ctx.fill();
      }
      SITES.forEach(([sx, sy, sz], k) => {                 // one SST14 at each end, coming in from outside
        const d = between(s, ...DOCK[k]);
        if (d < 0.01) return;
        const out = Math.sign(sy), c3 = [sx, sy + out * (11 + (1 - d) * 26), sz + 5], [x, y] = at(c3);
        const P = ballStick(ctx, th, x, y, sc, rock + 0.8 + k * Math.PI + (1 - d) * 1.5, 0.3, show * aTet * d);
        const cA = between(s, CONTACTS[0] + k * 0.3, CONTACTS[1] + k * 0.3);
        if (cA > 0.01) {                                   // its contacts: dashed lines to the nearest moved residues
          const near = moved.filter(m => Math.sign(m.p[1]) === out).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y)).slice(0, 4);
          ctx.globalAlpha = show * aTet * cA * 0.8; ctx.strokeStyle = th.red; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
          for (const m of near) { let best = P[0], bd = Infinity; for (const q of P) { const dd = Math.hypot(q[0] - m.x, q[1] - m.y); if (dd < bd) { bd = dd; best = q; } } ctx.beginPath(); ctx.moveTo(best[0], best[1]); ctx.lineTo(m.x, m.y); ctx.stroke(); }
          ctx.setLineDash([]);
        }
        label('SST14', x + 14 * sc, y, 'left', th.fid, d * (big ? 1 : 0));
      });
      if (big) { label('DPC', cx - 25 * sc - 6, cy - 7, 'right', th.muted, aTet); label('micelle', cx - 25 * sc - 6, cy + 7, 'right', th.muted, aTet); }
    }

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    const choose = (left, right, rightFirst) => {          // the longest words that fit: a shorter left before losing the right
      const fits = (l, r) => M(l) + M(r) + 16 <= room;     // (or, rightFirst, a shorter left before shortening the right)
      if (rightFirst) { for (const r of right) for (const l of left) if (fits(l, r)) return [l, r]; }
      else for (const l of left) { const r = right.find(q => fits(l, q)); if (r !== undefined) return [l, r]; }
      return [left.find(l => M(l) <= room) || left[left.length - 1], ''];
    };
    const STAGES = [                                       // first, what the two names mean
      [['SST14'], ['somatostatin, a cyclic 14-residue neuropeptide', 'somatostatin, a cyclic peptide', 'somatostatin'], th.fid],
      [['βPFO tetramer', 'βPFO'], ['β-sheet pore-forming oligomer of Aβ(1–42)', 'pore-forming Aβ(1–42) tetramer', 'Aβ(1–42) tetramer'], th.spec, true],
      [['Somatostatin and βPFO', 'SST14 and βPFO'], ['A specific 2:1 interaction', 'specific 2:1'], th.fid],
      [['NMR titration', 'NMR'], ['the shifting peaks map to both ends', 'shifts map to both ends', 'both ends'], th.red],
      [['Restraints for 2:1 molecular docking', '2 : 1'], ['one SST14 at each exposed end', 'one SST14 at each end', 'one at each end', ''], th.fid]];
    STAGES.forEach(([left, right, colour, rightFirst], k) => {
      const [a, b] = HEADS[k], alpha = (k ? between(s, a, a + 0.3) : 1) * (k < HEADS.length - 1 ? 1 - between(s, b - 0.3, b) : 1);
      if (alpha < 0.01) return;
      const [L0, R0] = choose(left, right, rightFirst);
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
