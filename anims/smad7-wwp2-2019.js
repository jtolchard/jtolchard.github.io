/* ==========================================================================
   smad7-wwp2-2019: next to WW4, WW3 holds Smad7 seven times more tightly.
   Four scenes, captioned along the top.
   0. Background: four points appear one by one over a picture of human
      WWP2 (its domains: C2, WW1–4, HECT). WWP2, an E3 ligase, tags proteins
      for destruction; one is Smad7, an inhibitory Smad; Smad7 keeps TGFβ
      signalling in check; unchecked, TGFβ signalling is linked to cancer and
      fibrosis. Smad7 comes to WW3–WW4, the HECT hands it three ubiquitins
      and it's destroyed, and a TGFβ signalling meter goes from inhibited to
      up. Then the question: how tightly do WW3 and WW4 hold Smad7?
   1–3. The study, one stage over two panes. WW3 (drawn as its three
      β-strands: its structure wasn't solved; its strands come from its
      chemical shifts) is titrated with Smad7, smoothly, over the paper's ten
      steps (Methods 4.3: protein at 80 µM, Smad7 up to 8.4 equivalents).
      Smad7 is its sequence on a pill (the PPxY motif in ink), as opaque as
      the fraction of the time it's bound. Below, the ¹H–¹⁵N HSQC: three WW3
      amide peaks walk, in fast exchange, towards where they'd be all bound
      (the rings), with a dot at each titration point; beside it the binding
      curve fills in, to Kd 139 µM. Then WW4 joins (also schematic) on the
      17-residue linker, its peaks appear in the spectrum, and the first run
      stays behind as ghosts; the same titration again: WW3's peaks reach
      their rings and its curve rises well above the first (21 µM, seven
      times tighter), while WW4's barely changes (249 µM; 237 µM alone).
   4. WW4's structure, solved by NMR (PDB 6RSS): the schematic becomes the
      twenty models (Cα of WWP2 445–474, superposed on the ordered core
      446–472, facing its binding face, rocking gently), Smad7's sequence
      docks, and the residues whose peaks move most light up, sized by how
      far (Fig. 4D).
   5. What it could mean: WWP2-C (WW4 and a working HECT) holds Smad7 loosely
      and tags it, so the inhibitor is gone and TGFβ signalling rises; the
      newly found WWP2C-ΔHECT (seen in cancer cell lines; WW3–WW4 and a
      broken HECT) grips it through WW3 but can't tag it, so it's kept and
      TGFβ signalling falls (that fall is measured, Fig. 3F; the shielding is
      the paper's proposal).
   The data, and the liberties taken: the moving peaks (WW3 W411, Y421,
   V420; WW4 T469, E451) and their directions are read off Fig. 4B–C, so are
   approximate; their shift distances come from Fig. 4D, alone and in tandem,
   and are drawn twice as large, to be seen. The grey peaks are the rest of
   Fig. 4B, and of 4C once WW4 joins. The curves follow the paper's Kds
   (Fig. 4F): one site with ligand depletion alone, two sites sharing the
   ligand in tandem (so WW4 lags while WW3 takes Smad7 first). Smad7's pose
   on WW4 is schematic (Tyr211 over the second pocket, its prolines towards
   the XP groove), as there's no structure of the complex.
   ========================================================================== */
(function () {
  'use strict';

  const clamp = u => Math.max(0, Math.min(1, u));
  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const span = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));   // in over a–b, out over c–d
  const smooth = u => (1 - Math.cos(Math.PI * clamp(u))) / 2;     // for the titrations: starts and ends gently
  const lerp = (a, b, u) => a + (b - a) * u;

  /* ---- WW4's structure (PDB 6RSS): the Cα of WWP2 445–474 in all twenty models, superposed on the ordered core
     (446–472), in Å: x along β1, y down the page, z towards the viewer, so that the sheet's binding face looks at the
     viewer ---- */
  const W0 = 445;
  const MODELS = (
      '-5.3,11.3,-5.8,-5.9,7.9,-4.2,-9.1,5.9,-5.0,-11.4,4.5,-2.2,-9.7,1.6,-0.4,-6.1,2.5,-1.6,-3.2,3.7,0.5,0.0,5.2,-0.8,' +
      '2.7,4.9,1.9,6.5,4.8,1.9,9.0,2.5,3.7,11.6,4.0,6.1,14.0,4.1,3.2,11.8,6.1,0.8,10.6,3.1,-1.1,7.0,3.5,-2.6,4.5,0.8,-1' +
      '.9,0.7,0.5,-2.1,-1.9,-1.1,0.1,-5.0,-2.8,-1.3,-7.2,-2.1,1.7,-10.0,-3.7,-0.2,-8.5,-7.2,0.1,-6.0,-6.2,2.9,-2.7,-6.9' +
      ',1.2,0.4,-5.0,0.0,1.1,-4.3,-3.7,3.8,-2.5,-5.6,2.0,-0.4,-8.2,4.3,2.3,-9.7;-6.1,12.0,-4.6,-6.1,8.3,-3.9,-9.1,6.2,-' +
      '5.0,-11.5,4.7,-2.3,-9.8,1.8,-0.7,-6.3,2.6,-2.0,-3.7,3.7,0.5,-0.3,5.3,-0.3,2.6,4.9,2.2,6.4,4.8,2.1,9.0,2.6,3.8,12' +
      '.1,3.9,5.7,14.2,3.9,2.5,11.9,6.0,0.5,10.4,2.9,-1.2,6.8,3.5,-2.1,4.4,0.6,-1.5,0.6,0.6,-2.1,-2.0,-1.0,0.1,-4.9,-2.' +
      '7,-1.7,-7.2,-2.3,1.3,-9.9,-4.2,-0.6,-7.9,-7.4,0.1,-5.8,-5.8,2.9,-2.7,-6.9,1.1,0.6,-4.9,0.6,1.3,-4.5,-3.1,3.9,-2.' +
      '9,-5.3,2.3,-1.1,-8.2,3.8,2.1,-9.6;-6.6,12.0,-3.8,-6.3,8.2,-3.6,-8.9,6.0,-5.3,-11.4,4.2,-3.0,-9.8,1.2,-1.2,-6.2,2' +
      '.3,-2.0,-3.7,3.3,0.6,-0.3,5.0,0.1,2.7,4.8,2.5,6.5,5.1,2.2,9.3,2.9,3.6,12.3,4.1,5.6,14.4,3.8,2.5,12.5,6.2,0.3,10.' +
      '7,3.3,-1.4,7.0,3.6,-2.0,4.6,0.8,-1.5,0.8,0.5,-1.8,-1.8,-1.2,0.4,-5.1,-2.5,-1.1,-7.4,-2.1,1.9,-10.1,-3.5,-0.3,-8.' +
      '4,-6.9,-0.1,-6.2,-6.1,2.9,-3.1,-7.0,0.9,0.2,-5.2,0.1,1.2,-4.4,-3.5,4.0,-2.6,-5.4,2.5,-0.5,-8.1,4.1,2.2,-10.2;-6.' +
      '1,12.2,-3.5,-5.9,8.5,-4.0,-8.6,6.3,-5.7,-11.4,5.1,-3.3,-10.2,2.5,-0.9,-6.6,2.7,-2.0,-3.9,3.9,0.4,-0.3,5.0,-0.3,2' +
      '.6,5.2,2.1,6.4,4.8,2.0,8.7,2.2,3.6,11.6,2.9,6.0,13.9,3.2,2.9,11.8,5.8,1.0,10.4,3.1,-1.2,6.8,3.6,-2.5,4.2,0.9,-2.' +
      '0,0.4,0.8,-2.4,-2.1,-0.8,0.0,-5.2,-2.7,-0.9,-7.9,-2.3,1.8,-10.0,-5.4,0.8,-7.3,-8.0,0.9,-5.0,-6.1,3.4,-1.9,-6.5,1' +
      '.4,1.0,-4.5,0.1,1.6,-4.1,-3.7,3.8,-2.1,-6.0,1.8,-0.1,-8.5,3.3,3.3,-9.5;-5.6,10.9,-5.8,-5.8,7.5,-4.2,-9.2,5.9,-5.' +
      '0,-11.4,4.6,-2.1,-9.7,1.5,-0.8,-6.2,2.3,-2.2,-3.6,3.6,0.3,-0.2,5.0,-0.5,2.7,4.7,2.0,6.5,4.9,2.1,9.0,2.5,3.6,11.8' +
      ',3.4,6.0,14.1,4.0,3.0,11.8,6.4,1.2,10.7,3.6,-1.2,7.1,3.9,-2.5,4.6,1.0,-2.1,0.8,0.7,-2.3,-1.7,-1.0,0.0,-5.0,-2.6,' +
      '-1.1,-7.2,-1.8,2.0,-10.1,-3.6,0.3,-8.4,-7.0,0.3,-5.9,-6.1,3.1,-2.9,-7.0,1.0,0.3,-5.2,-0.1,1.2,-4.5,-3.8,4.0,-2.8' +
      ',-5.6,3.0,-0.6,-8.5,4.5,2.7,-9.5;-6.3,11.8,-3.5,-5.9,8.1,-3.8,-8.9,5.9,-5.1,-11.3,4.7,-2.3,-9.8,1.6,-0.5,-6.3,2.' +
      '4,-2.0,-3.6,3.8,0.2,-0.1,5.1,-0.6,2.9,5.2,1.9,6.7,5.0,1.8,9.0,2.5,3.5,11.9,3.5,5.8,14.2,4.1,2.8,11.4,6.0,1.1,10.' +
      '4,3.1,-1.2,6.9,3.4,-2.6,4.4,0.7,-1.8,0.6,0.5,-2.0,-1.9,-0.8,0.5,-5.0,-2.7,-1.0,-7.5,-2.2,1.8,-10.1,-4.0,-0.4,-8.' +
      '2,-7.3,-0.3,-6.1,-6.5,2.8,-2.6,-6.7,1.4,0.4,-4.7,0.2,1.6,-4.4,-3.4,4.2,-2.6,-5.5,2.6,-0.7,-8.4,4.6,2.3,-9.7;-4.5' +
      ',10.8,-6.4,-5.4,7.4,-4.8,-8.9,6.0,-5.4,-11.1,5.3,-2.2,-9.8,2.2,-0.4,-6.3,2.5,-2.0,-3.7,3.8,0.5,-0.3,5.1,-0.2,2.6' +
      ',4.8,2.3,6.4,4.9,2.3,9.2,2.8,3.8,12.3,4.1,5.6,14.3,3.6,2.4,12.2,5.9,0.3,10.4,3.1,-1.3,6.7,3.6,-2.3,4.3,0.8,-1.4,' +
      '0.5,0.7,-1.6,-2.2,-0.8,0.6,-5.2,-2.3,-1.1,-8.0,-2.3,1.5,-10.3,-4.9,-0.1,-7.7,-7.7,-0.4,-5.9,-6.5,2.7,-2.6,-7.2,1' +
      '.0,0.3,-4.8,0.3,1.5,-4.3,-3.3,3.8,-2.0,-5.4,1.6,-0.4,-8.0,2.6,2.9,-9.6;-6.0,11.8,-4.9,-6.2,8.1,-4.3,-9.3,5.9,-5.' +
      '1,-11.4,4.5,-2.3,-9.6,1.7,-0.6,-6.2,2.4,-2.2,-3.5,3.8,0.1,-0.1,5.3,-0.9,2.6,4.7,1.7,6.4,4.9,2.0,8.8,2.4,3.7,11.7' +
      ',3.4,6.0,14.1,4.1,3.2,11.4,5.9,1.2,10.4,2.9,-1.0,6.9,3.6,-2.5,4.5,0.8,-1.9,0.7,0.6,-2.2,-1.8,-0.8,0.3,-5.0,-2.5,' +
      '-0.9,-7.0,-1.8,2.2,-9.9,-3.7,0.5,-8.5,-7.3,0.5,-5.7,-6.6,3.0,-2.6,-6.8,0.7,0.5,-4.9,-0.2,1.7,-4.3,-3.8,4.3,-2.4,' +
      '-5.7,2.7,-0.5,-8.5,3.9,2.9,-9.8;-5.5,11.5,-4.8,-5.8,7.8,-4.0,-9.0,6.1,-5.2,-11.4,4.8,-2.5,-10.1,1.6,-1.1,-6.4,2.' +
      '3,-2.2,-3.7,3.4,0.3,-0.2,4.7,-0.3,2.6,4.4,2.2,6.5,4.8,2.3,9.2,2.5,3.7,12.3,3.3,5.7,14.4,4.5,2.8,11.5,6.4,1.3,10.' +
      '5,3.6,-1.1,6.9,4.1,-2.1,4.6,1.0,-2.1,0.8,0.6,-2.5,-1.7,-1.1,-0.3,-5.3,-2.3,-1.0,-7.5,-1.6,2.1,-10.2,-3.9,0.9,-8.' +
      '2,-7.1,0.4,-5.7,-5.8,3.1,-2.9,-6.8,0.7,0.4,-5.2,-0.3,1.3,-4.7,-3.9,4.6,-3.5,-5.5,3.9,-1.9,-8.9,5.8,0.9,-10.6;-5.' +
      '2,10.4,-7.1,-5.7,7.4,-4.9,-9.2,5.8,-5.1,-11.3,5.2,-2.0,-9.7,2.9,0.5,-6.4,2.9,-1.5,-3.3,4.1,0.3,0.0,5.3,-1.1,2.7,' +
      '5.0,1.5,6.5,4.9,1.8,8.6,2.4,3.6,11.4,3.4,6.1,13.8,3.2,3.2,12.1,5.8,1.0,10.4,3.3,-1.3,6.8,3.8,-2.4,4.2,1.0,-2.0,0' +
      '.4,0.8,-2.1,-2.0,-0.8,0.3,-5.0,-2.6,-1.2,-8.0,-2.5,1.2,-10.1,-5.3,-0.3,-7.5,-8.1,0.1,-5.6,-6.2,2.8,-2.1,-6.5,1.3' +
      ',1.0,-4.4,0.5,1.4,-4.3,-3.2,3.7,-2.5,-5.7,1.6,-1.3,-8.6,2.9,1.0,-11.3;-5.9,11.8,-4.4,-5.9,8.0,-4.1,-9.1,6.1,-5.0' +
      ',-11.3,4.7,-2.1,-9.7,1.5,-0.9,-6.3,2.3,-2.4,-3.6,4.1,-0.3,-0.1,5.3,-0.8,2.7,5.0,1.8,6.5,5.0,2.0,8.7,2.3,3.6,11.3' +
      ',3.1,6.2,13.8,3.4,3.3,11.8,5.9,1.4,10.4,3.5,-1.1,6.9,3.8,-2.6,4.4,0.9,-2.0,0.6,0.7,-2.5,-1.8,-0.7,0.0,-5.1,-2.3,' +
      '-0.9,-7.5,-1.8,2.0,-10.0,-4.4,0.8,-7.6,-7.4,0.7,-5.1,-5.9,3.2,-2.4,-6.8,0.8,0.6,-4.7,-0.2,1.1,-4.6,-4.0,4.2,-3.1' +
      ',-5.7,3.5,-1.4,-9.0,6.0,1.2,-10.2;-5.7,11.3,-5.9,-5.9,7.8,-4.4,-9.2,6.0,-4.9,-11.2,5.1,-1.7,-9.7,2.0,-0.1,-6.3,2' +
      '.5,-1.8,-3.5,3.8,0.4,-0.2,5.4,-0.6,2.6,4.9,1.9,6.4,5.0,1.9,9.0,3.1,3.9,11.8,4.9,5.8,14.2,4.1,2.9,12.3,5.8,0.1,10' +
      '.6,2.6,-1.0,7.0,3.1,-2.2,4.4,0.5,-1.3,0.7,0.4,-1.8,-2.0,-1.2,0.4,-5.0,-2.8,-1.2,-7.4,-2.4,1.7,-10.1,-3.9,-0.4,-8' +
      '.6,-7.4,-0.4,-6.2,-6.6,2.4,-2.8,-7.0,0.8,0.3,-5.1,-0.1,1.7,-4.5,-3.6,4.5,-2.5,-5.3,3.1,-0.7,-8.4,3.8,2.8,-9.6;-6' +
      '.1,12.0,-3.3,-5.9,8.2,-3.7,-8.7,6.2,-5.4,-11.3,5.0,-2.8,-10.0,1.9,-1.0,-6.4,2.4,-2.3,-3.8,3.3,0.3,-0.4,4.9,-0.4,' +
      '2.5,4.5,2.0,6.3,4.7,2.1,9.0,2.4,3.5,11.6,3.7,6.0,14.1,3.9,3.2,12.1,6.2,0.9,10.7,3.5,-1.3,7.0,3.7,-2.3,4.5,0.9,-2' +
      '.1,0.7,0.6,-2.2,-1.8,-1.0,0.1,-5.2,-2.4,-1.0,-7.4,-1.7,2.1,-10.0,-4.2,0.6,-7.9,-7.5,0.7,-5.3,-6.0,3.1,-2.6,-7.0,' +
      '0.7,0.7,-5.1,0.0,1.1,-4.5,-3.7,3.8,-2.7,-5.7,2.4,-0.3,-8.3,4.3,2.8,-8.9;-5.5,11.1,-5.7,-6.2,7.7,-4.2,-9.5,5.8,-5' +
      '.0,-11.5,4.5,-2.0,-9.6,1.6,-0.6,-6.3,2.4,-2.3,-3.6,3.6,0.2,-0.2,5.1,-0.6,2.4,4.4,2.1,6.2,4.7,2.2,9.0,2.6,3.8,11.' +
      '8,4.1,6.1,14.1,3.9,3.0,12.2,6.1,0.7,10.6,3.2,-1.1,7.1,3.4,-2.4,4.5,0.6,-1.8,0.7,0.5,-2.2,-1.8,-1.0,0.1,-5.0,-2.6' +
      ',-1.4,-7.0,-1.9,1.8,-10.0,-3.4,0.2,-8.6,-7.0,0.5,-5.8,-5.8,2.8,-2.8,-6.8,0.8,0.5,-5.0,-0.2,1.7,-4.4,-3.7,4.2,-2.' +
      '3,-5.7,2.6,0.0,-8.3,4.3,3.2,-9.4;-5.9,12.0,-3.7,-6.1,8.2,-3.6,-9.1,6.1,-4.9,-11.4,4.1,-2.6,-9.6,1.3,-0.8,-6.2,2.' +
      '4,-2.1,-3.7,3.4,0.6,-0.3,4.8,-0.2,2.8,5.5,2.0,6.6,5.5,1.8,8.9,3.2,3.7,12.1,4.2,5.7,14.4,3.6,2.8,12.2,5.8,0.6,10.' +
      '4,2.9,-1.1,6.9,3.5,-2.2,4.4,0.8,-1.6,0.6,0.4,-2.0,-1.9,-1.1,0.4,-5.1,-2.5,-1.2,-7.3,-2.0,1.9,-10.2,-3.5,-0.1,-8.' +
      '6,-6.9,-0.2,-6.0,-6.3,2.6,-2.9,-6.9,0.7,0.5,-5.2,0.0,1.6,-4.6,-3.6,4.4,-2.8,-5.3,3.2,-0.7,-8.2,5.2,2.6,-8.7;-6.5' +
      ',11.7,-5.0,-6.1,8.0,-4.1,-9.4,6.1,-4.8,-11.4,4.9,-1.8,-9.7,1.8,-0.5,-6.3,2.6,-2.2,-3.6,3.9,0.2,-0.1,4.9,-0.5,2.7' +
      ',4.9,2.0,6.6,5.1,2.1,9.1,2.8,3.6,12.0,4.0,5.8,14.3,4.4,2.8,11.9,6.2,0.4,10.8,2.9,-1.3,7.0,3.2,-1.9,4.4,0.5,-1.6,' +
      '0.6,0.5,-2.0,-2.0,-0.9,0.4,-4.9,-2.7,-1.3,-7.3,-2.2,1.6,-10.1,-3.9,-0.4,-8.2,-7.2,-0.5,-6.1,-6.6,2.7,-2.7,-6.9,1' +
      '.1,0.4,-4.9,0.2,1.2,-4.7,-3.6,4.3,-3.0,-5.0,3.8,0.4,-6.5,2.9,1.0,-10.1;-5.9,11.3,-4.6,-5.9,7.6,-4.2,-9.1,5.7,-5.' +
      '3,-11.5,4.5,-2.6,-10.1,1.4,-1.1,-6.6,2.1,-2.3,-3.9,3.3,0.2,-0.4,4.7,-0.4,2.5,4.6,2.1,6.3,4.5,2.2,8.8,2.1,3.7,11.' +
      '8,2.9,6.0,14.0,3.8,3.1,11.7,6.1,1.2,10.3,3.5,-1.1,6.6,4.0,-1.9,4.3,0.9,-2.0,0.6,0.6,-2.8,-1.7,-0.8,-0.3,-5.1,-2.' +
      '5,-1.0,-6.6,-1.3,2.3,-9.8,-3.0,1.0,-8.2,-6.5,0.9,-5.3,-5.9,3.2,-2.3,-6.5,0.9,0.9,-4.9,-0.3,1.8,-4.4,-4.0,4.3,-2.' +
      '5,-6.1,2.6,-1.1,-9.2,5.6,0.3,-11.0;-5.9,11.9,-3.6,-6.2,8.1,-3.3,-9.2,6.2,-4.9,-11.6,4.5,-2.5,-9.9,1.4,-1.1,-6.4,' +
      '2.5,-2.1,-3.8,3.7,0.3,-0.3,5.2,-0.3,2.6,5.0,2.1,6.5,5.1,2.1,9.0,2.8,3.8,11.8,4.3,5.9,14.1,3.6,3.0,12.4,5.8,0.5,1' +
      '0.7,2.8,-1.2,7.2,3.3,-2.7,4.6,0.7,-1.8,0.8,0.6,-2.1,-1.9,-1.0,-0.1,-5.2,-2.5,-1.3,-7.5,-1.9,1.7,-10.1,-4.1,0.1,-' +
      '8.0,-7.3,0.0,-5.8,-6.0,2.8,-2.7,-6.8,0.9,0.6,-4.9,0.3,1.6,-4.5,-3.4,4.2,-2.7,-5.4,2.1,-1.2,-8.2,2.9,2.2,-9.7;-4.' +
      '6,11.5,-4.4,-5.7,7.9,-3.6,-8.9,6.3,-5.0,-11.4,4.6,-2.6,-9.7,1.6,-1.1,-6.1,2.4,-2.1,-3.5,3.5,0.5,-0.2,5.3,-0.3,2.' +
      '7,4.8,2.2,6.5,4.9,2.0,9.1,2.7,3.7,11.8,4.1,6.0,14.2,4.3,3.0,12.0,6.2,0.6,10.5,3.1,-1.2,7.0,3.7,-2.4,4.5,0.8,-1.8' +
      ',0.8,0.6,-2.2,-1.9,-1.2,-0.1,-5.3,-2.5,-1.1,-7.4,-1.9,2.0,-10.4,-4.0,0.7,-8.5,-7.3,0.2,-5.9,-6.3,2.9,-2.9,-7.0,0' +
      '.6,0.4,-5.2,-0.2,1.5,-4.7,-3.8,4.3,-3.0,-5.5,2.7,-1.4,-8.5,3.6,1.8,-10.5;-4.8,12.1,-4.2,-5.5,8.3,-4.0,-8.6,6.6,-' +
      '5.3,-11.2,5.2,-2.8,-10.0,1.9,-1.4,-6.3,2.5,-2.4,-3.7,3.5,0.2,-0.3,5.1,-0.3,2.6,5.0,2.2,6.5,5.0,2.1,8.9,2.4,3.4,1' +
      '2.0,3.1,5.5,14.1,3.4,2.3,12.0,6.0,0.6,10.1,3.6,-1.5,6.4,4.2,-2.3,4.3,1.1,-1.6,0.5,0.6,-1.7,-2.0,-1.0,0.6,-5.1,-2' +
      '.5,-1.1,-7.8,-2.4,1.6,-10.2,-5.0,0.1,-7.6,-7.8,0.1,-5.5,-6.3,2.9,-2.3,-7.1,1.2,0.8,-5.0,0.8,1.1,-4.2,-2.9,3.8,-2' +
      '.6,-4.9,3.4,0.5,-7.1,2.2,0.3,-10.7'
  ).split(';').map(m => { const v = m.split(',').map(Number), P = []; for (let i = 0; i < v.length; i += 3) P.push([v[i], v[i + 1], v[i + 2]]); return P; });
  const STRANDS = [[450, 455], [460, 465], [468, 471]];   // β1–β3 (Fig. 2E)
  const inStrand = r => STRANDS.some(([a, b]) => r >= a && r <= b);
  const TRACES = MODELS.map(P => {                         // each model smoothed (Catmull–Rom, four points a residue)
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 4; k++) {
        const u = k / 4, u2 = u * u, u3 = u2 * u;
        out.push([...[0, 1, 2].map(j => 0.5 * (2 * p1[j] + (p2[j] - p0[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (3 * p1[j] - p0[j] - 3 * p2[j] + p3[j]) * u3)), W0 + i + Math.round(u)]);
      }
    }
    out.push([...P[P.length - 1], W0 + P.length - 1]);
    return out;
  });
  const ROCK = 8;                                           // WW4's gentle turn, its period (s)
  // how far each WW4 amide peak moved with Smad7 (ppm; Fig. 4D, WW4 alone): the binding site
  const SHIFT4 = { 450: 0.083, 451: 0.156, 452: 0.127, 461: 0.124, 462: 0.113, 463: 0.113, 464: 0.105, 467: 0.112,
    468: 0.252, 469: 0.277, 470: 0.599, 471: 0.425, 472: 0.197, 473: 0.134 };

  /* ---- Smad7, shown as its sequence on a pill (the PPxY motif, P208 P209 x Y211, in ink), as long as there's room.
     On WW4's structure it lies where it would bind (schematic: there's no structure of the complex): Tyr211 over the
     second pocket (V463, H465, R468), its prolines back towards the XP groove (Y461, F472), 4.5 Å above the sheet ---- */
  const SEQS = [['SPPPPYSR', 2, 6], ['PPPPY', 1, 5], ['PPPY', 0, 4]];   // [letters, motif from, to)
  const PEP_Y = [-5.7, -2.4, 9.0], PEP_XP = [5.4, -1.3, 3.7];
  const PEP_MID = PEP_Y.map((v, i) => v + ((PEP_XP[i] - v) / Math.hypot(...PEP_XP.map((q, j) => q - PEP_Y[j]))) * 3.1 * 1.5);

  /* ---- the titrations (Methods 4.3): protein at 80 µM, Smad7 up to 8.4 equivalents in ten steps; Kds in µM (Fig. 4F) ---- */
  const P = 80;
  const RATIOS = [0, 0.1, 0.2, 0.5, 1, 1.9, 3.6, 5.2, 6.8, 8.4];
  const RMAX = 8.4;
  const KD = [[139, 237], [20.57, 249.3]];                  // [WW3, WW4] alone, then in tandem
  // fraction bound at a Smad7:protein ratio r: one site alone (with ligand depletion) ...
  function alone(r, K) { const L = r * P, s = P + L + K; return (s - Math.sqrt(s * s - 4 * P * L)) / (2 * P); }
  // ... or two sites on one protein sharing the ligand: solve for the free Smad7, then each site's share
  function tandem(r, K3, K4) {
    const Lt = r * P; let lo = 0, hi = Lt;
    for (let i = 0; i < 50; i++) {
      const L = (lo + hi) / 2;
      if (L + P * L / (L + K3) + P * L / (L + K4) > Lt) hi = L; else lo = L;
    }
    const L = (lo + hi) / 2;
    return [L / (L + K3), L / (L + K4)];
  }
  const bound = (run, r) => (run ? tandem(r, KD[1][0], KD[1][1]) : [alone(r, KD[0][0]), alone(r, KD[0][1])]);
  const RUNS = [0, 1].map(run => ({
    steps: RATIOS.map(r => bound(run, r)),                                   // [[WW3, WW4], …] at each titration point
    curve: Array.from({ length: 169 }, (_, i) => { const r = (RMAX * i) / 168; return [r, ...bound(run, r)]; })
  }));

  /* ---- the HSQC: the window (¹H falling to the right, ¹⁵N rising downwards), and the peaks that move:
     [domain (0 WW3, 1 WW4), free ¹H, ¹⁵N (ppm), its trail by the last point alone (Δ¹H, Δ¹⁵N; Fig. 4B–C),
     shift distance alone, in tandem (ppm; Fig. 4D)]. In fast exchange a peak sits between free and bound in
     proportion to the fraction bound, so each walks a straight line towards where it would be all bound ---- */
  const H0 = 10, H1 = 6.8, N0 = 105, N1 = 131;
  const H_TICKS = [9, 8, 7], N_TICKS = [110, 120, 130];
  const MAG = 2;
  const MOVERS = [
    [0, 7.637, 118.01, 0.087, -0.45, 0.113, 0.129],         // W411
    [0, 8.491, 122.42, 0.103, -0.42, 0.142, 0.182],         // Y421
    [0, 8.539, 125.58, 0.079, 1.12, 0.186, 0.305],          // V420
    [1, 7.426, 110.64, -0.10, -1.67, 0.277, 0.244],         // T469
    [1, 9.405, 121.29, 0.05, -0.98, 0.156, 0.132]           // E451
  ].map(([d, h, n, dh, dn, sa, st]) => ({
    d, free: [h, n],
    full: [0, 1].map(run => { const u = (MAG * (run ? st / sa : 1)) / RUNS[run].steps[9][d]; return [h + dh * u, n + dn * u]; })
  }));
  // the peaks that stay put, free (¹H × 100, ¹⁵N × 10): WW3's sample (Fig. 4B), and those WW4 adds (Fig. 4C)
  const decode = str => { const v = str.split(',').map(Number), out = []; for (let i = 0; i < v.length; i += 2) out.push([v[i] / 100, v[i + 1] / 10]); return out; };
  const BG3 = decode(
      '728,1070,784,1076,797,1077,782,1084,885,1090,799,1094,749,1096,845,1098,798,1101,750,1113,715,1116,805,1121,779,' +
      '1122,762,1123,749,1123,884,1123,699,1124,690,1124,880,1129,690,1130,766,1134,688,1135,864,1142,720,1143,698,1144' +
      ',761,1147,729,1149,898,1149,932,1151,829,1154,797,1155,742,1155,690,1156,846,1157,876,1159,816,1161,797,1164,895' +
      ',1165,841,1167,705,1170,912,1171,836,1172,826,1178,841,1179,817,1182,848,1188,939,1192,792,1193,748,1198,804,120' +
      '0,831,1201,847,1203,863,1204,743,1208,845,1208,805,1210,814,1210,862,1210,923,1212,829,1212,932,1214,841,1215,89' +
      '7,1217,790,1218,858,1220,827,1224,890,1224,870,1226,892,1228,827,1228,917,1229,696,1233,823,1236,786,1236,870,12' +
      '37,816,1242,830,1243,840,1246,809,1248,921,1251,738,1254,871,1258,886,1260,912,1265,729,1271,869,1272,788,1275,8' +
      '48,1275,938,1286,771,1287,783,1291,813,1292');
  const BG4 = decode(
      '850,1083,826,1086,855,1099,861,1111,817,1120,901,1128,826,1136,865,1136,801,1139,964,1142,700,1148,834,1153,912,' +
      '1160,772,1179,927,1180,805,1181,842,1189,820,1200,784,1208,873,1215,917,1217,766,1221,811,1222,834,1229,885,1237' +
      ',856,1243,864,1243,790,1248,891,1257,701,1259,808,1264,857,1266,831,1272,821,1292,876,1302');

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 52;
  // 0. background: WWP2 has Smad7, an inhibitor of TGFβ signalling, destroyed, and the signalling rises
  const SC0 = [0, 0.6, 15.4, 16.0], C_DROP = [4.0, 5.2], C_UB = [7.0, 0.5, 0.7], C_GONE = [8.8, 9.6], C_RISE = [10.0, 11.6], C_FOCUS = [12.8, 13.6];
  // 1–3. the study: WW3 alone, then WW4 joins it, the same titration again
  const SC1 = [15.9, 16.5, 34.4, 35.0];
  const RUN1 = [16.8, 21.4], KD1 = [21.4, 22.0], SWAP = [23.4, 25.0], RUN2 = [25.4, 30.0], KD2 = [30.0, 30.6];
  // 4. WW4's NMR structure, Smad7 on it and the residues whose peaks move
  const SC4 = [35.0, 35.6, 42.4, 43.0], MORPH = [35.8, 37.2], DOCK = [38.0, 39.0], SITE = [38.6, 39.6];
  // 5. what it could mean: two isoforms and what each does to Smad7
  const SC5 = [43.0, 43.6, 51.4, 52.0], BIND = [43.8, 44.8], UB = [45.2, 0.5, 0.7], GONE = [47.4, 48.2], OUTCOME = [47.8, 48.6];
  const STILL = 32;

  function words(ctx, th, parts, x, y) {        // a label in several colours: [[text, colour], …]
    for (const [text, colour] of parts) { Anim.label(ctx, th, text, x, y, 'left', colour); x += Anim.measure(ctx, th, text); }
  }
  const width = (ctx, th, parts) => parts.reduce((a, [text]) => a + Anim.measure(ctx, th, text), 0);
  const fit = (ctx, th, options, room) => options.find(o => width(ctx, th, o) <= room) || options[options.length - 1];

  // a WW domain drawn as its three β-strands (WW3's come from its chemical shifts; its structure wasn't solved).
  // Returns its two ends: the N-terminus (top left) and the C-terminus (bottom right)
  function sheet(ctx, th, cx, cy, sc, col) {
    const L = 11 * sc, gap = 5 * sc, tw = Math.max(3, 1.8 * sc), hw = tw * 1.8, hl = Math.max(4, 2.4 * sc);
    const ys = [cy - gap, cy, cy + gap], dirs = [1, -1, 1];
    ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.2, 0.32 * sc); ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - L - 3 * sc, ys[0] - 2.5 * sc); ctx.lineTo(cx - L, ys[0]);                        // N-terminus
    ctx.moveTo(cx + L, ys[0]); ctx.arc(cx + L, (ys[0] + ys[1]) / 2, gap / 2, -Math.PI / 2, Math.PI / 2);          // loop 1
    ctx.moveTo(cx - L, ys[1]); ctx.arc(cx - L, (ys[1] + ys[2]) / 2, gap / 2, -Math.PI / 2, Math.PI / 2, true);    // loop 2
    ctx.moveTo(cx + L, ys[2]); ctx.lineTo(cx + L + 2.5 * sc, ys[2]);                                  // C-terminus
    ctx.stroke();
    ctx.fillStyle = mix(th.bg, col, 0.18); ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
    ys.forEach((y, i) => {
      const d = dirs[i], a = cx - d * L, b = cx + d * L, n = b - d * hl;
      ctx.beginPath();
      ctx.moveTo(a, y - tw / 2); ctx.lineTo(n, y - tw / 2); ctx.lineTo(n, y - hw / 2); ctx.lineTo(b, y);
      ctx.lineTo(n, y + hw / 2); ctx.lineTo(n, y + tw / 2); ctx.lineTo(a, y + tw / 2); ctx.closePath();
      ctx.fill(); ctx.stroke();
    });
    return { n: [cx - L - 3 * sc, ys[0] - 2.5 * sc], c: [cx + L + 2.5 * sc, ys[2]] };
  }

  // WW4's twenty models, model 1 (the most representative) on top, back to front, nearer darker, its strands thicker.
  // Turned half a turn in the page, so Smad7 reads N to C, left to right. Returns the view, to place things on it
  function ensemble(ctx, th, cx, cy, sc, s, A) {
    const phi = 0.25 * Math.sin((2 * Math.PI * s) / ROCK), c = Math.cos(phi), sn = Math.sin(phi);
    const ox = cx + 1.4 * sc, oy = cy + 2 * sc;
    const view = p => [ox + (-p[0] * c + p[2] * sn) * sc, oy - p[1] * sc, p[0] * sn + p[2] * c];
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.globalAlpha = A * 0.3;
    for (let m = 1; m < TRACES.length; m++) {
      ctx.beginPath();
      TRACES[m].forEach((q, i) => { const [x, y] = view(q); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke();
    }
    const T = TRACES[0], segs = [];
    for (let i = 1; i < T.length; i++) { const a = view(T[i - 1]), b = view(T[i]); segs.push([(a[2] + b[2]) / 2, a, b, T[i][3]]); }
    segs.sort((p, q) => p[0] - q[0]);
    const lw = Math.max(1.2, Math.min(2.6, sc * 0.26));
    ctx.globalAlpha = A;
    for (const [z, a, b, r] of segs) {
      const d = clamp((z + 10) / 20);
      ctx.strokeStyle = mix(th.bg, th.ink, 0.35 + 0.55 * d);
      ctx.lineWidth = lw * (inStrand(r) ? 2 : 1) * (0.85 + 0.3 * d);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    return view;
  }

  // Smad7: its sequence on a pill centred on (x, y), along (ux, uy); a is how much of the time it's bound
  function strip(ctx, th, x, y, ux, uy, sp, seq, a) {
    if (a <= 0.005) return;
    const [letters, m0, m1] = seq, n = letters.length, half = ((n - 1) / 2) * sp + 8;
    ctx.globalAlpha = a; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - ux * half, y - uy * half); ctx.lineTo(x + ux * half, y + uy * half);
    ctx.strokeStyle = th.soft; ctx.lineWidth = 17; ctx.stroke();
    ctx.strokeStyle = th.surface; ctx.lineWidth = 15; ctx.stroke();
    for (let i = 0; i < n; i++) {
      const k = i - (n - 1) / 2;
      Anim.label(ctx, th, letters[i], x + ux * k * sp, y + uy * k * sp, 'center', i >= m0 && i < m1 ? th.ink : th.muted);
    }
  }
  // Smad7 as a whole protein, on a pill with its name
  function pill(ctx, th, x, y, wd, a) {
    if (a <= 0.005) return;
    const r = 7.5, l = x - wd / 2 + r, rr = x + wd / 2 - r;
    ctx.globalAlpha = a;
    ctx.beginPath(); ctx.moveTo(l, y - r); ctx.lineTo(rr, y - r); ctx.arc(rr, y, r, -Math.PI / 2, Math.PI / 2); ctx.lineTo(l, y + r); ctx.arc(l, y, r, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
    ctx.fillStyle = th.surface; ctx.fill(); ctx.strokeStyle = th.soft; ctx.lineWidth = 1.2; ctx.stroke();
    Anim.label(ctx, th, 'Smad7', x, y, 'center', th.ink);
  }
  // a protein chain with its domains as boxes: [from, to (fractions of the width), name, colour, broken, alpha]
  function chain(ctx, th, X, y, boxH, line, boxes, A) {
    ctx.globalAlpha = A; ctx.strokeStyle = th.muted; ctx.lineWidth = 1.4; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(X(line[0]), y); ctx.lineTo(X(line[1]), y); ctx.stroke();
    for (const [a, b, text, col, broken, al] of boxes) {
      ctx.globalAlpha = A * (al == null ? 1 : al);
      ctx.fillStyle = broken ? th.bg : mix(th.bg, col, 0.16); ctx.strokeStyle = col; ctx.lineWidth = 1.2;
      if (broken) ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.rect(Math.round(X(a)) + 0.5, Math.round(y - boxH / 2) + 0.5, Math.round(X(b) - X(a)), Math.round(boxH)); ctx.fill(); ctx.stroke();
      ctx.setLineDash([]);
      const label = Anim.measure(ctx, th, text) <= X(b) - X(a) - 4 || !text.startsWith('WW') ? text : text.slice(-1);   // WW3 → 3 if it won't fit
      Anim.label(ctx, th, label, (X(a) + X(b)) / 2, y, 'center', col);
    }
  }
  // ubiquitin handed from a HECT domain to Smad7, three in turn, lining up beside it
  function ubiquitin(ctx, th, s, timing, from, x, y, r, rise, A) {
    let last = 0;
    for (let k = 0; k < 3; k++) {
      const u = between(s, timing[0] + k * timing[1], timing[0] + k * timing[1] + timing[2]);
      if (u <= 0) continue;
      const ex = x + r + 3 + k * (2 * r + 1), ux = lerp(from[0], ex, u), uy = lerp(from[1], y, u) - Math.sin(Math.PI * u) * rise;
      ctx.globalAlpha = A * Math.min(1, u * 3);
      ctx.beginPath(); ctx.arc(ux, uy, r, 0, Math.PI * 2); ctx.fillStyle = th.surface; ctx.fill(); ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2; ctx.stroke();
      if (k === 2) last = u;
    }
    if (last >= 1) { ctx.globalAlpha = A; Anim.label(ctx, th, 'Ub', x + 3 * (2 * r + 1) + 6, y, 'left'); }
  }

  /* ---- 0. background, as a title and four points that appear in step with the picture below them: human WWP2 (its
     domains), Smad7 coming to WW3–WW4, tagged with ubiquitin and destroyed, and TGFβ signalling, which Smad7 had kept
     down, rising. Then the question: how tightly do WW3 and WW4 hold Smad7? ---- */
  const POINTS = [   // [when it appears, long, short]
    [0.3, [['WWP2', 'ink'], [', an E3 ligase, tags proteins for destruction', 'soft']], [['WWP2', 'ink'], [' ubiquitinates proteins', 'soft']]],
    [3.4, [['one of them is ', 'soft'], ['Smad7', 'ink'], [', an inhibitory Smad', 'soft']], [['one is ', 'soft'], ['Smad7', 'ink'], [', an inhibitor', 'soft']]],
    [6.6, [['Smad7', 'ink'], [' normally keeps TGFβ signalling in check', 'soft']], [['Smad7', 'ink'], [' keeps TGFβ in check', 'soft']]],
    [9.8, [['unchecked TGFβ signalling: ', 'soft'], ['cancer', 'ink'], [' and ', 'soft'], ['fibrosis', 'ink']], [['unchecked TGFβ: ', 'soft'], ['cancer', 'ink']]]
  ];
  function context(ctx, w, h, s, th, A, pad) {
    const bw = w - 2 * pad, X = f => pad + f * bw, top = pad + 18;
    const boxH = Math.max(15, Math.min(22, h * 0.07)), pillW = Math.max(50, bw * 0.16);
    const y = top + (h - pad - top) * 0.65, my = Math.min(y + boxH / 2 + 24, h - pad - 7);
    const drop = between(s, C_DROP[0], C_DROP[1]), gone = between(s, C_GONE[0], C_GONE[1]);
    const rise = between(s, C_RISE[0], C_RISE[1]), focus = between(s, C_FOCUS[0], C_FOCUS[1]);
    const dim = 1 - 0.65 * focus;

    // the title, and the points, the newest in ink
    ctx.globalAlpha = A; Anim.label(ctx, th, 'Background', pad, pad + 6, 'left', th.ink);
    const gap = Math.max(15, Math.min(26, (h - 2 * pad) * 0.08));
    POINTS.forEach(([at, long, short], i) => {
      const a = between(s, at - 0.2, at + 0.4);
      if (a <= 0) return;
      const newest = i === POINTS.length - 1 || s < POINTS[i + 1][0];
      const tone = c => (newest && focus < 1 ? th[c] : c === 'ink' ? th.soft : th.muted);
      const parts = fit(ctx, th, [long, short].map(p => p.map(([text, c]) => [text, tone(c)])), bw - 12), py = pad + 28 + i * gap;
      ctx.globalAlpha = A * a;
      ctx.fillStyle = th.muted; ctx.beginPath(); ctx.arc(pad + 3, py, 2, 0, Math.PI * 2); ctx.fill();
      words(ctx, th, parts, pad + 12, py);
    });

    // the protein and its domains
    const px = X(0.46), py = y - boxH / 2 - 8.5;
    ctx.globalAlpha = A;
    words(ctx, th, fit(ctx, th, [[['human ', th.soft], ['WWP2', th.ink]], [['WWP2', th.ink]]], px - pillW / 2 - 8 - pad), pad, py);
    chain(ctx, th, X, y, boxH, [0, 1], [[0, 0.08, 'C2', th.muted, false, dim], [0.11, 0.21, 'WW1', th.muted, false, dim], [0.23, 0.33, 'WW2', th.muted, false, dim],
      [0.35, 0.45, 'WW3', th.spec], [0.47, 0.57, 'WW4', th.fid], [0.62, 1, 'HECT', th.ink, false, dim]], A);
    // Smad7: free at first; held by WW3–WW4, tagged and destroyed; back for the question
    pill(ctx, th, lerp(X(0.8), px, drop), py - gone * 6, pillW, A * (1 - gone));
    if (gone < 1) ubiquitin(ctx, th, s, C_UB, [X(0.7), y - boxH / 2], px + pillW / 2, py, Math.max(3, Math.min(5, h * 0.016)), h * 0.07, A * (1 - gone));
    pill(ctx, th, px, py, pillW, A * focus);

    // TGFβ signalling: held down while Smad7 is about, up once it's gone; then the question takes its place
    const lab = 'TGFβ signalling', t0 = pad + Anim.measure(ctx, th, lab) + 10;
    const t1 = Math.min(w - pad, t0 + bw * 0.42), level = lerp(0.2, 0.9, rise), ma = A * (1 - focus);
    if (ma > 0) {
      ctx.globalAlpha = ma; Anim.label(ctx, th, lab, pad, my, 'left', th.soft);
      ctx.lineCap = 'round'; ctx.lineWidth = 6;
      ctx.strokeStyle = th.rule; ctx.beginPath(); ctx.moveTo(t0, my); ctx.lineTo(t1, my); ctx.stroke();
      ctx.strokeStyle = th.soft; ctx.beginPath(); ctx.moveTo(t0, my); ctx.lineTo(lerp(t0, t1, level), my); ctx.stroke();
      if (t1 + 10 + Anim.measure(ctx, th, 'inhibited') <= w - pad) {   // what it is doing, where there's room
        ctx.globalAlpha = ma * (1 - rise); Anim.label(ctx, th, 'inhibited', t1 + 10, my, 'left');
        ctx.globalAlpha = ma * rise; Anim.label(ctx, th, 'up', t1 + 10, my, 'left', th.ink);
      }
    }
    if (focus > 0) {
      ctx.globalAlpha = A * focus;
      words(ctx, th, fit(ctx, th, [[['how tightly do ', th.soft], ['WW3', th.spec], [' and ', th.soft], ['WW4', th.fid], [' hold ', th.soft], ['Smad7', th.ink], ['?', th.soft]],
        [['how do ', th.soft], ['WW3', th.spec], [' and ', th.soft], ['WW4', th.fid], [' hold it?', th.soft]]], bw), pad, my);
    }
    ctx.globalAlpha = 1;
  }

  /* ---- 1–3. the study: one stage (WW3, then WW4 joining it), under it the HSQC and the binding curve ---- */
  function study(ctx, w, h, s, th, A, pad) {
    const C3 = th.spec, C4 = th.fid;
    const x1 = RMAX * smooth((s - RUN1[0]) / (RUN1[1] - RUN1[0]));
    const x2 = RMAX * smooth((s - RUN2[0]) / (RUN2[1] - RUN2[0]));
    const b1 = bound(0, x1)[0], b2 = bound(1, x2);
    const join = between(s, SWAP[0], SWAP[1]);

    // layout: the stage, then the two panes (each with its title) side by side, the binding curve towards the right
    const avail = h - 2 * pad - 18, bw = w - 2 * pad;
    const stTop = pad + 18, stH = avail * (h < 250 ? 0.37 : 0.42), stBot = stTop + stH;
    const footH = 16, dTop = stBot + 12, fTop = dTop + 14, dBot = h - pad - footH;
    const kdW = Anim.measure(ctx, th, '249 µM') + 8, nW = Anim.measure(ctx, th, '130') + 6, gapC = Math.max(16, w * 0.08);
    const sw = Math.min((dBot - fTop) * 1.4, (bw - kdW - nW - gapC) * 0.52);
    const sx0 = pad, px0 = sx0 + sw + nW + gapC, px1 = w - pad - kdW;
    const ptop = fTop + 4, pbot = dBot;
    const SX = hh => sx0 + ((H0 - hh) / (H0 - H1)) * sw, SY = n => fTop + ((n - N0) / (N1 - N0)) * (dBot - fTop);
    const PX = r => px0 + (r / RMAX) * (px1 - px0), PY = q => pbot - q * (pbot - ptop);
    const pr = Math.max(1.6, Math.min(3.4, w / 135));

    /* the stage: WW3; WW4 joins; Smad7 on each, as much of the time as it's bound */
    const sc = Math.min((stH - 16) / 17, (bw * 0.34) / 28);
    const midY = stTop + (stH - 16) / 2 + 1.5 * sc;
    const x3 = lerp(w / 2, pad + bw * 0.25, join), x4 = lerp(w + 16 * sc, pad + bw * 0.75, join);
    const sp = Math.max(9, 2.9 * sc), seq = SEQS.find(([l]) => (l.length - 1) * sp + 16 <= 22 * sc * 1.25) || SEQS[2];
    ctx.globalAlpha = A;
    const e3 = sheet(ctx, th, x3, midY, sc, C3);
    if (join > 0) {
      ctx.globalAlpha = A * join;
      const e4 = sheet(ctx, th, x4, midY, sc, C4);
      ctx.strokeStyle = th.soft; ctx.lineWidth = Math.max(2, 0.5 * sc); ctx.lineCap = 'round';   // the 17-residue linker
      ctx.beginPath(); ctx.moveTo(e3.c[0], e3.c[1]); ctx.bezierCurveTo(e3.c[0] + 10 * sc, e3.c[1], e4.n[0] - 10 * sc, e4.n[1], e4.n[0], e4.n[1]); ctx.stroke();
    }
    strip(ctx, th, x3, midY - 2.5 * sc, 1, 0, sp, seq, A * Math.max(b1 * (1 - join), b2[0]));
    strip(ctx, th, x4, midY - 2.5 * sc, 1, 0, sp, seq, A * join * b2[1]);
    ctx.globalAlpha = A; Anim.label(ctx, th, 'WW3', x3, stBot - 6, 'center', C3);
    ctx.globalAlpha = A * between(join, 0.75, 1); Anim.label(ctx, th, 'WW4', x4, stBot - 6, 'center', C4);

    /* the panes' titles */
    ctx.globalAlpha = A;
    words(ctx, th, fit(ctx, th, [[['NMR: ', th.muted], ['¹H–¹⁵N HSQC', th.soft]], [['NMR HSQC', th.soft]], [['HSQC', th.soft]]], sw + nW), sx0, dTop + 4);
    words(ctx, th, fit(ctx, th, [[['binding curve', th.soft], [' (shifts)', th.muted]], [['binding curve', th.soft]], [['binding', th.soft]]], px1 - px0), px0, dTop + 4);
    Anim.label(ctx, th, 'Kd', px1 + 6, dTop + 4, 'left');

    /* the HSQC: frame and scales, the peaks that stay put, then the ones that move */
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1; ctx.lineCap = 'butt';
    ctx.strokeRect(Math.round(sx0) + 0.5, Math.round(fTop) + 0.5, Math.round(sw), Math.round(dBot - fTop));
    ctx.strokeStyle = th.muted; ctx.beginPath();
    for (const hh of H_TICKS) { const x = Math.round(SX(hh)) + 0.5; ctx.moveTo(x, Math.round(dBot) + 0.5); ctx.lineTo(x, Math.round(dBot) - 3); }
    for (const n of N_TICKS) { const y = Math.round(SY(n)) + 0.5, x = Math.round(sx0) + Math.round(sw) + 0.5; ctx.moveTo(x, y); ctx.lineTo(x - 3.5, y); }
    ctx.stroke();
    const nStep = SY(N_TICKS[1]) - SY(N_TICKS[0]) < 13 ? 2 : 1;   // only 110 and 130 if they'd crowd
    N_TICKS.forEach((n, i) => { if (i % nStep === 0) Anim.label(ctx, th, String(n), sx0 + sw + 5, SY(n), 'left'); });
    ctx.fillStyle = th.muted;
    for (const [set, a] of [[BG3, 1], [BG4, join]]) {
      if (a <= 0) continue;
      ctx.globalAlpha = A * 0.24 * a; ctx.beginPath();
      for (const [hh, n] of set) { const x = SX(hh), y = SY(n); ctx.moveTo(x + pr * 0.85, y); ctx.arc(x, y, pr * 0.85, 0, Math.PI * 2); }
      ctx.fill();
    }
    ctx.lineCap = 'round';
    const at = (m, run, q) => [SX(lerp(m.free[0], m.full[run][0], q)), SY(lerp(m.free[1], m.full[run][1], q))];
    const passed = x => RATIOS.filter(r => r > 0 && r <= x + 1e-9).length;
    const trail = (m, run, q, x, col, a) => {    // the way a peak has come, a spectrum at each titration point
      if (a <= 0) return;
      const p0 = at(m, run, 0), c = at(m, run, q);
      ctx.globalAlpha = A * a; ctx.strokeStyle = mix(th.bg, col, 0.6); ctx.lineWidth = Math.max(1.2, pr * 0.6);
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(c[0], c[1]); ctx.stroke();
      ctx.fillStyle = mix(th.bg, col, 0.6);
      for (let j = 0; j < passed(x); j++) { const q2 = at(m, run, RUNS[run].steps[j][m.d]); ctx.beginPath(); ctx.arc(q2[0], q2[1], pr * 0.55, 0, Math.PI * 2); ctx.fill(); }
    };
    for (const m of MOVERS) {
      const col = m.d ? C4 : C3, show = m.d ? join : 1;
      if (show <= 0) continue;
      // where it would be all bound (in the tandem, a little further for some WW3 peaks), and the way there
      const ring = m.d ? at(m, 1, 1) : [lerp(at(m, 0, 1)[0], at(m, 1, 1)[0], join), lerp(at(m, 0, 1)[1], at(m, 1, 1)[1], join)];
      const now = m.d ? at(m, 1, b2[1]) : join < 0.5 ? at(m, 0, b1) : at(m, 1, b2[0]);
      ctx.globalAlpha = A * show; ctx.strokeStyle = mix(th.bg, col, 0.5); ctx.lineWidth = 1; ctx.setLineDash([2, 2.5]);
      ctx.beginPath(); ctx.moveTo(now[0], now[1]); ctx.lineTo(ring[0], ring[1]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(ring[0], ring[1], pr + 0.8, 0, Math.PI * 2); ctx.stroke();
      if (!m.d) {                                // the first run: its trail, then its ghost (where the peak got to)
        trail(m, 0, b1, x1, col, 1 - 0.7 * join);
        const g = at(m, 0, b1);
        ctx.globalAlpha = A * (1 - join); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(g[0], g[1], pr, 0, Math.PI * 2); ctx.fill();
        if (join > 0) { ctx.globalAlpha = A * join; ctx.strokeStyle = mix(th.bg, col, 0.6); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(g[0], g[1], pr, 0, Math.PI * 2); ctx.stroke(); }
      }
      if (join > 0) {                            // the second run
        const q = b2[m.d], c = at(m, 1, q);
        trail(m, 1, q, x2, col, join);
        ctx.globalAlpha = A * join; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(c[0], c[1], pr, 0, Math.PI * 2); ctx.fill();
      }
    }

    /* the binding curve: how much of the time each domain has Smad7 (its peaks' shift), against Smad7 added */
    ctx.globalAlpha = A; ctx.strokeStyle = th.rule; ctx.lineWidth = 1; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(Math.round(px0) + 0.5, ptop - 4); ctx.lineTo(Math.round(px0) + 0.5, Math.round(pbot) + 0.5); ctx.lineTo(px1, Math.round(pbot) + 0.5); ctx.stroke();
    ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(px0, Math.round(ptop) + 0.5); ctx.lineTo(px1, Math.round(ptop) + 0.5); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const curve = (run, d, x, col, lw, dash) => {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []);
      ctx.beginPath(); ctx.moveTo(PX(0), PY(0));
      for (const [r, q3, q4] of RUNS[run].curve) { if (r >= x) break; ctx.lineTo(PX(r), PY(d ? q4 : q3)); }
      ctx.lineTo(PX(x), PY(bound(run, x)[d])); ctx.stroke(); ctx.setLineDash([]);
    };
    const dots = (run, d, x, col) => {
      ctx.fillStyle = col;
      for (let j = 1; j < passed(x); j++) { ctx.beginPath(); ctx.arc(PX(RATIOS[j]), PY(RUNS[run].steps[j][d]), pr * 0.7, 0, Math.PI * 2); ctx.fill(); }
    };
    if (x1 > 0) {                                // the first run, which becomes the dashed reference
      ctx.globalAlpha = A * (1 - join); curve(0, 0, x1, C3, 2); dots(0, 0, x1, C3);
      if (join > 0) { ctx.globalAlpha = A * join; curve(0, 0, x1, mix(th.bg, C3, 0.55), 1.4, [3, 3]); }
    }
    if (x2 > 0) { ctx.globalAlpha = A; curve(1, 1, x2, C4, 1.3); dots(1, 1, x2, C4); curve(1, 0, x2, C3, 2); dots(1, 0, x2, C3); }
    for (const [run, x] of [[RUN1, x1], [RUN2, x2]]) {   // the Smad7 added so far
      const ma = between(s, run[0] - 0.4, run[0]) * (1 - between(s, run[1], run[1] + 0.5));
      if (ma <= 0) continue;
      ctx.globalAlpha = A * ma; ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(Math.round(PX(x)) + 0.5, ptop - 4); ctx.lineTo(Math.round(PX(x)) + 0.5, pbot); ctx.stroke(); ctx.setLineDash([]);
    }
    // the Kds at the curves' ends, kept apart
    const labs = [['139 µM', RUNS[0].steps[9][0], mix(C3, th.muted, join), between(s, KD1[0], KD1[1])],
      ['21 µM', RUNS[1].steps[9][0], C3, between(s, KD2[0], KD2[1])], ['249 µM', RUNS[1].steps[9][1], C4, between(s, KD2[0], KD2[1])]]
      .map(([text, q, col, a]) => [text, PY(q), col, a]).sort((p, q) => p[1] - q[1]);
    for (let i = 1; i < labs.length; i++) labs[i][1] = Math.max(labs[i][1], labs[i - 1][1] + 13);
    const over = labs[labs.length - 1][1] - pbot;
    if (over > 0) labs.forEach(l => { l[1] -= over; });
    for (const [text, y, col, a] of labs) if (a > 0) { ctx.globalAlpha = A * a; Anim.label(ctx, th, text, px1 + 6, y, 'left', col); }

    /* the scales' numbers and names, and the curve's axis */
    ctx.globalAlpha = A;
    const fy = dBot + footH / 2 + 2;
    Anim.label(ctx, th, '¹H', sx0, fy, 'left', th.soft);
    const hFree = sx0 + Anim.measure(ctx, th, '¹H') + 4;              // numbers that would run into ¹H are left out
    for (const hh of H_TICKS) if (SX(hh) - 4 > hFree) Anim.label(ctx, th, String(hh), SX(hh), fy, 'center');
    Anim.label(ctx, th, '¹⁵N', sx0 + sw + 5, fy, 'left', th.soft);
    words(ctx, th, fit(ctx, th, [[['Smad7', th.ink], [' added →', th.muted]], [['Smad7', th.ink], [' →', th.muted]]], w - pad - px0), px0, fy);
    ctx.globalAlpha = 1;
  }

  /* ---- 4. WW4's structure, solved here by NMR: the schematic becomes the twenty models; Smad7 docks, and the
     residues whose peaks move most light up ---- */
  function structure(ctx, w, h, s, th, A, pad) {
    const top = pad + 22, bot = h - pad - 18;
    const sc = Math.min((w - 2 * pad) / 33, (bot - top) / 24), cx = w / 2, cy = (top + bot) / 2;
    const morph = between(s, MORPH[0], MORPH[1]), dock = between(s, DOCK[0], DOCK[1]), site = between(s, SITE[0], SITE[1]);
    if (morph < 1) { ctx.globalAlpha = A * (1 - morph); sheet(ctx, th, cx, cy, sc * 0.95, th.fid); }
    if (morph > 0) {
      const view = ensemble(ctx, th, cx, cy, sc, s, A * morph);
      if (site > 0) {
        const big = Math.max(3, Math.min(7.5, sc * 0.8));
        for (const [r, v] of Object.entries(SHIFT4)) {
          const [x, y] = view(MODELS[0][r - W0]);
          ctx.globalAlpha = A * site; ctx.fillStyle = th.fid; ctx.strokeStyle = th.bg; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x, y, Math.max(1.6, big * Math.sqrt(v / 0.6)) * (0.4 + 0.6 * site), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
      }
      if (dock > 0) {
        const m = view(PEP_MID.map((v, i) => v - (i === 1 ? (1 - dock) * 4 : 0))), a = view(PEP_XP), b = view(PEP_Y), L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const sp = Math.max(9, 3.1 * sc);
        strip(ctx, th, m[0], m[1], (b[0] - a[0]) / L, (b[1] - a[1]) / L, sp, SEQS[0], A * dock);
      }
    }
    // labels: the entry on the left, a key on the right
    ctx.globalAlpha = A * morph;
    Anim.label(ctx, th, w - 2 * pad >= 300 ? 'PDB 6RSS · 20 NMR models' : 'PDB 6RSS', pad, h - pad - 6, 'left');
    if (site > 0) {
      ctx.globalAlpha = A * site;
      Anim.label(ctx, th, 'binding site', w - pad, h - pad - 6, 'right', th.fid);
      ctx.fillStyle = th.fid; ctx.beginPath(); ctx.arc(w - pad - Anim.measure(ctx, th, 'binding site') - 8, h - pad - 6, 3.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ---- 5. what it could mean: WWP2-C has WW4 and a working HECT, holds Smad7 loosely and has it destroyed; the new
     isoform WWP2C-ΔHECT has the WW3–WW4 pair and a broken HECT, grips Smad7 through WW3 and leaves it be (the paper's
     proposal; it does damp TGFβ signalling, Fig. 3F) ---- */
  function isoforms(ctx, w, h, s, th, A, pad) {
    const top0 = pad + 18, rh = (h - pad - top0) / 2, bw = w - 2 * pad, X = f => pad + f * bw;
    const boxH = Math.max(13, Math.min(22, rh * 0.18)), pillH = 15, pillW = Math.max(50, bw * 0.15);
    const g1 = rh < 80 ? 2 : 6, g2 = rh < 80 ? 10 : 12;                // tighter on small panels
    const ubR = Math.max(3, Math.min(5, rh * 0.05));
    const bind = between(s, BIND[0], BIND[1]), gone = between(s, GONE[0], GONE[1]), out = between(s, OUTCOME[0], OUTCOME[1]);
    const ISO = [
      { name: [['WWP2-C', th.ink], [': WW4, working HECT', th.soft]], short: [['WWP2-C', th.ink]], line: [0.17, 0.95], at: 0.27, ub: true,
        boxes: [[0.2, 0.34, 'WW4', th.fid], [0.42, 0.95, 'HECT', th.ink]],
        out: [[['tags Smad7: inhibitor gone', th.soft], [' · TGFβ signalling ↑', th.ink]], [['Smad7 destroyed', th.soft], [' · TGFβ ↑', th.ink]]] },
      { name: [['WWP2C-ΔHECT', th.ink], [', newly found in cancer cells', th.soft]], short: [['WWP2C-ΔHECT', th.ink], [' (newly found)', th.soft]], line: [0.02, 0.68], at: 0.11, ub: false,
        boxes: [[0.04, 0.18, 'WW3', th.spec], [0.2, 0.34, 'WW4', th.fid], [0.42, 0.68, 'ΔHECT', th.muted, true]],
        out: [[['can’t tag Smad7: inhibitor kept', th.soft], [' · TGFβ signalling ↓', th.ink]], [['Smad7 kept', th.soft], [' · TGFβ ↓', th.ink]]] }
    ];
    ISO.forEach((I, r) => {
      const gTop = top0 + r * rh + Math.max(0, (rh - (12 + g1 + pillH + 1 + boxH + g2 + 6)) / 2);
      const barY = gTop + 12 + g1 + pillH + 1 + boxH / 2, pillY = barY - boxH / 2 - pillH / 2 - 1, outY = barY + boxH / 2 + g2;
      ctx.globalAlpha = A;
      words(ctx, th, fit(ctx, th, [I.name, I.short], bw), pad, gTop + 6);
      chain(ctx, th, X, barY, boxH, I.line, I.boxes, A);
      if (bind > 0) {                            // Smad7 comes to a WW domain: WW4 here, WW3 in the new isoform
        const fade = I.ub ? 1 - gone : 1, x = X(I.at);
        const loose = I.ub ? Math.abs(Math.sin((2 * Math.PI * s) / 1.6)) * 1.5 * bind : 0;   // WW4 holds it loosely
        const y = pillY - (1 - bind) * 8 - (I.ub ? gone * 6 : 0) - loose;
        pill(ctx, th, x, y, pillW, A * bind * fade);
        if (I.ub) ubiquitin(ctx, th, s, UB, [X(0.5), barY - boxH / 2], x + pillW / 2, y, ubR, rh * 0.18, A * fade);
      }
      if (out > 0) { ctx.globalAlpha = A * out; words(ctx, th, fit(ctx, th, I.out, bw), pad, outY); }
    });
    ctx.globalAlpha = 1;
  }

  /* ---- the captions: the story, one line at a time [from, to, long, short] ---- */
  const CAPTIONS = th => [
    [16.0, 23.4, [['WW3', th.spec], [' on its own, with Smad7', th.soft]], [['WW3', th.spec], [' on its own', th.soft]]],
    [23.4, 30.2, [['now with ', th.soft], ['WW4', th.fid], [' in tandem', th.soft]], null],
    [30.2, 34.8, [['WW3', th.spec], [' binds Smad7 ', th.soft], ['7× tighter', th.ink]], null],
    [34.8, 38.2, [['WW4', th.fid], ['’s structure, solved by NMR', th.soft]], [['WW4', th.fid], ['’s NMR structure', th.soft]]],
    [38.2, 42.8, [['its shifts map where ', th.soft], ['Smad7', th.ink], [' binds', th.soft]], [['shifts map the binding site', th.soft]]],
    [42.8, 46.8, [['WWP2 isoforms carry different WW domains', th.soft]], [['isoforms differ in WW domains', th.soft]]],
    [46.8, 99, [['the newly found isoform may shield ', th.soft], ['Smad7', th.ink]], [['so it may shield ', th.soft], ['Smad7', th.ink]]]
  ];

  Anim.register('smad7-wwp2-2019', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE;
    const pad = Math.max(12, Math.round(w * 0.034));
    const all = between(s, 0, 0.6) * (1 - between(s, CYCLE - 0.6, CYCLE));
    for (const [a, b, long, short] of CAPTIONS(th)) {
      const v = (a < 0 ? 1 : between(s, a - 0.25, a + 0.25)) * (1 - between(s, b - 0.25, b + 0.25)) * all;
      if (v > 0) { ctx.globalAlpha = v; words(ctx, th, short ? fit(ctx, th, [long, short], w - 2 * pad) : long, pad, pad + 6); }
    }
    const scenes = [[SC0, context], [SC1, study], [SC4, structure], [SC5, isoforms]];
    for (const [when, draw] of scenes) { const a = span(s, when); if (a > 0) draw(ctx, w, h, s, th, a, pad); }
    ctx.globalAlpha = 1;
  }, { loop: CYCLE, still: STILL });

  // colours: mix two of the theme's colours (u = 0 gives a, 1 gives b)
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
