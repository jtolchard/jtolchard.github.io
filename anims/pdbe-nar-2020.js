/* ==========================================================================
   pdbe-nar-2020: finding one structure in the PDB with PDBe's search.
   A real search, step by step, as the paper's Figs. 2 and 3 show it.
   The archive first (155,000+ entries in 2019, one dot each, not to
   scale). In the advanced search form's Molecule name field, "cytochrome"
   brings up the autocomplete list of Fig. 2C, each term with its number
   of entries; picking "cytochrome c peroxidase, mitochondrial (180)" pulls
   its 180 entries out of the archive, one square each. Two more fields,
   joined with AND, narrow them: experimental method X-ray diffraction
   (177; the joint neutron/X-ray entries stay in, the NMR ones go) and
   resolution, whose limit slides from 3.1 to 1.5 Å while each entry goes
   as the limit passes its own resolution (42 left). Sequence clustering
   then groups entries whose sequences are near-identical: at 100 %
   identity the 42 fall into 7 clusters (mostly mutants of the same yeast
   enzyme), each shown by one representative (orange) with the rest hidden;
   at 95 % into 2 (3e2n, an engineered chimera with a loop from pea
   ascorbate peroxidase, stays apart); at 90 % into 1. The last
   representative, 3e2n, opens as a result card, as in Fig. 3: method and
   resolution, its bound haem (identified as a cofactor), its Pfam domain
   and its PDBe-KB link, buttons for the 3D view and files, and its own
   structure turning in 3D: a cartoon (helices as ribbons, strands as
   arrows, loops as tubes) with the haem.
   Data: the autocomplete terms and counts are Fig. 2C's. The 180 entries,
   their methods, resolutions and clusters are PDBe's search index for
   entries released before September 2019 (which gives Fig. 2C's 180),
   using its own 100/95/90 % sequence clusters; each cluster's
   representative is its best-ranked entry among the results, as the
   index ranks them. 3e2n's coordinates are from its PDB file (chain A,
   the view turned, not mirrored), its helices and strands from the same
   file's HELIX and SHEET records. Entries are drawn in PDB ID order.
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const envelope = (s, [a, b, c, d]) => between(s, a, b) * (1 - between(s, c, d));
  const lerp = (a, b, u) => a + (b - a) * u;
  const clamp01 = u => Math.max(0, Math.min(1, u));
  const TAU = Math.PI * 2;

  /* ---- timeline (seconds) ---- */
  const CYCLE = 27, STILL = 24;
  const SHOW = [0, 0.5, 26.3, 26.9];
  const HEADS = [[0, 3.1], [3.1, 7.9], [7.9, 13.6], [13.6, 20.2], [20.2, 26.9]];
  const TYPE = [1.4, 2.9];                 // "cytochrome" typed, one letter at a time
  const DROP = [3.2, 3.6];                 // the autocomplete list opens
  const HILITE = [4.6, 4.9];               // the first term is highlighted
  const CLOSE = [6.0, 6.4];                // picked: the list closes, the field shows the term
  const CONDENSE = [6.3, 7.6];             // its 180 entries come out of the archive
  const ROW2 = [8.1, 8.5], GONE_M = [8.8, 9.3], PACK_M = [9.3, 10.0];       // method: X-ray
  const ROW3 = [10.2, 10.6], SLIDE = [10.9, 12.5], PACK_R = [12.6, 13.4];   // resolution limit 3.1 → 1.5 Å
  const ROW4 = [13.8, 14.2];                                                // clustering
  const CL = [[14.4, 15.4], [16.6, 17.6], [18.8, 19.8]];                    // into 100 / 95 / 90 % clusters
  const REPC = [[15.2, 15.6], [17.4, 17.8], [19.6, 20.0]];                  // representatives light up
  const STEP = [[16.2, 16.6], [18.4, 18.8]];                                // identity slider 100 → 95 → 90
  const FORM_OUT = [20.2, 20.8], CARD = [20.4, 21.3], CONTENT = [21.1, 21.6];
  const R_HI = 3.1, R_LO = 1.5, R_MIN = 1.0;            // resolution slider: start, end, left end of its track

  /* ---- data ---- */
  // Each entry: PDB ID, x = X-ray (alone or joint with neutrons) / n = NMR, resolution (Å), and for the 42 left after
  // the filters: its 100 % cluster (0–6), its 95 % cluster (0–1) and its rank in its 100 % cluster among them (0 = shown).
  const ENTRIES = `
    1a2f x 2.10 | 1a2g x 2.10 | 1aa4 x 2.10 | 1ac4 x 2.10 | 1ac8 x 2.10 | 1aeb x 2.10
    1aed x 2.10 | 1aee x 2.10 | 1aef x 2.10 | 1aeg x 2.10 | 1aeh x 2.10 | 1aej x 2.10
    1aek x 2.10 | 1aem x 2.10 | 1aen x 2.10 | 1aeo x 2.10 | 1aeq x 2.10 | 1aes x 2.10
    1aet x 2.10 | 1aeu x 2.10 | 1aev x 2.10 | 1bej x 2.40 | 1bek x 2.20 | 1bem x 2.20
    1bep x 2.20 | 1beq x 2.16 | 1bes x 2.00 | 1bj9 x 2.20 | 1bva x 1.89 | 1cca x 1.80
    1ccb x 2.10 | 1ccc x 2.00 | 1cce x 2.30 | 1ccg x 2.10 | 1cci x 2.40 | 1ccj x 2.10
    1cck x 2.10 | 1ccl x 2.00 | 1ccp x 2.20 | 1cmp x 1.90 | 1cmq x 2.30 | 1cmt x 2.10
    1cmu x 2.10 | 1cpd x 2.20 | 1cpe x 2.20 | 1cpf x 2.20 | 1cpg x 2.20 | 1cyf x 2.35
    1dcc x 2.20 | 1dj1 x 1.93 | 1dj5 x 1.93 | 1ds4 x 2.02 | 1dse x 2.00 | 1dsg x 2.56
    1dso x 2.03 | 1dsp x 2.03 | 1ebe x 2.20 | 1jci x 1.90 | 1jdr x 1.50 4 0 0 | 1kok x 1.70
    1krj x 2.00 | 1kxm x 1.74 | 1kxn x 1.80 | 1mk8 x 1.65 | 1mkq x 1.64 | 1mkr x 1.58
    1ml2 x 1.65 | 1ryc x 1.80 | 1s6v x 1.88 | 1s73 x 1.53 | 1sbm x 1.69 | 1sdq x 1.69
    1sog x 1.85 | 1stq x 1.82 | 1u74 x 2.40 | 1u75 x 2.55 | 1z53 x 1.13 3 0 2 | 1zby x 1.20 3 0 1
    1zbz x 1.29 3 0 0 | 2anz x 1.75 | 2aqd x 1.35 1 0 7 | 2as1 x 1.55 | 2as2 x 1.45 1 0 4 | 2as3 x 1.40 1 0 0
    2as4 x 1.30 1 0 9 | 2as6 x 1.45 1 0 10 | 2b0z x 2.70 | 2b10 x 2.80 | 2b11 x 2.30 | 2b12 x 3.02
    2bcn x 1.70 | 2ccp x 2.20 | 2cep x 2.20 | 2cyp x 1.70 | 2eun x 1.70 | 2euo x 1.45 1 0 8
    2eup x 1.40 1 0 11 | 2euq x 1.30 1 0 2 | 2eur x 1.39 1 0 3 | 2eus x 1.55 | 2eut x 1.12 1 0 6 | 2euu x 1.45 1 0 5
    2gb8 n - | 2ia8 x 1.48 5 0 0 | 2icv x 1.60 | 2jti n - | 2n18 n - | 2pcb x 2.80
    2pcc x 2.30 | 2rbt x 1.24 2 0 0 | 2rbu x 1.80 | 2rbv x 1.39 2 0 1 | 2rbw x 1.50 2 0 2 | 2rbx x 1.50 2 0 3
    2rby x 1.50 2 0 4 | 2rbz x 1.80 | 2rc0 x 1.50 2 0 5 | 2rc1 x 2.49 | 2rc2 x 1.50 2 0 6 | 2v23 x 1.80
    2v2e x 1.68 | 2x07 x 1.86 | 2x08 x 2.01 | 2xil x 1.68 | 2xj5 x 1.69 | 2xj8 x 1.69
    2y5a x 1.25 1 0 1 | 2ycg x 1.81 | 3ccp x 2.20 | 3ccx x 2.30 | 3e2n x 1.30 6 1 0 | 3e2o x 1.06 0 0 15
    3exb x 1.60 | 3m23 x 1.40 0 0 9 | 3m25 x 1.40 0 0 0 | 3m26 x 1.40 0 0 3 | 3m27 x 1.40 0 0 14 | 3m28 x 1.40 0 0 11
    3m29 x 1.40 0 0 4 | 3m2a x 1.40 0 0 8 | 3m2b x 1.40 0 0 2 | 3m2c x 1.40 0 0 5 | 3m2d x 1.40 0 0 7 | 3m2e x 1.40 0 0 13
    3m2f x 1.40 0 0 10 | 3m2g x 1.40 0 0 6 | 3m2h x 1.40 0 0 12 | 3m2i x 1.40 0 0 1 | 3r98 x 2.40 | 3r99 x 2.40
    4a6z x 1.61 | 4a71 x 1.61 | 4a78 x 2.01 | 4a7m x 1.71 | 4ccp x 2.20 | 4ccx x 1.90
    4cvi x 2.10 | 4cvj x 2.18 | 4jb4 x 2.39 | 4nfg x 2.11 | 4p4q x 2.01 | 4xv4 x 1.69
    4xv5 x 1.65 | 4xv6 x 1.55 | 4xv7 x 1.62 | 4xv8 x 1.57 | 4xva x 2.66 | 5ccp x 2.20
    5cib x 3.01 | 5cic x 2.10 | 5cid x 2.76 | 5cie x 2.60 | 5cif x 2.01 | 5cig x 2.06
    5cih x 2.60 | 5d6m x 1.65 | 5ejt x 1.55 | 5ejx x 1.50 0 0 16 | 6ccp x 2.20 | 7ccp x 2.20`;
  const E = ENTRIES.trim().split(/\s*[|\n]\s*/).map(q => {
    const [id, m, r, c100, c95, r100] = q.trim().split(/\s+/);
    return { id, xr: m === 'x', res: r === '-' ? null : +r, surv: c100 !== undefined, c100: +c100, c95: +c95, r100: +r100 };
  });
  const REP95 = ['3m25', '3e2n'], REP90 = '3e2n';       // best-ranked at 95 % (one per cluster) and at 90 %
  const XR = [], SURV = [];
  E.forEach((e, i) => { if (e.xr) XR.push(i); if (e.surv) SURV.push(i); });
  const G100 = [0, 1, 2, 3, 4, 5, 6].map(c => SURV.filter(i => E[i].c100 === c).sort((a, b) => E[a].r100 - E[b].r100));
  const flat = [].concat(...G100);
  const front = (g, id) => { const k = g.findIndex(i => E[i].id === id); g.unshift(...g.splice(k, 1)); return g; };
  const G95 = [0, 1].map(k => front(flat.filter(i => E[i].c95 === k), REP95[k]));
  const G90 = [front(flat.slice(), REP90)];
  const LEVELS = [G100, G95, G90];
  const ONE = E.findIndex(e => e.id === REP90);
  const isRep = [i => E[i].r100 === 0, i => REP95.includes(E[i].id), i => E[i].id === REP90];
  const nAtOrBelow = v => XR.reduce((n, i) => n + (E[i].res <= v + 1e-9 ? 1 : 0), 0);

  // The archive: dots at random spots (the first 180 are the search's entries, waiting among them).
  const ARCH = (() => { const r = Anim.seeded(2020), a = []; for (let i = 0; i < 2400; i++) a.push(r(), r()); return a; })();

  // 3e2n, chain A (Å; x right, y up, z towards the viewer): Cα (282 residues, 6–287, no breaks), each residue's
  // carbonyl direction (C→O, square to the chain, unit length) and secondary structure (from its HELIX and SHEET
  // records: H α-helix, E strand; the short 3₁₀ helices and two-residue strands count as loop), and the haem's atoms.
  const CA = [11.3,-15.8,-8.3,8.8,-18.4,-9.4,5.4,-18.4,-7.9,4.6,-21.7,-6.3,1,-22.4,-5.1,0.8,-23.4,-1.4,0.3,-27.1,-1.7,-3.3,-28.1,-2.7,-4.7,-24.7,-2,-7.3,-23,-4.1,-9.6,-19.9,-4.1,-11.7,-21.1,-1.1,-8.6,-21.4,1.1,-7.6,-17.8,0.3,-11.1,-16.5,0.7,-11.1,-17.9,4.3,-7.8,-16,5,-9.3,-12.9,3.4,-12.3,-13.2,5.7,-10.2,-13.6,8.8,-8.2,-10.5,7.9,-11.4,-8.6,7,-13,-9.4,10.4,-9.7,-8.2,12.1,-9.9,-4.9,10.2,-13.5,-4.4,11.3,-12.5,-5.2,14.9,-9.4,-3,15.1,-9.9,-0.4,12.4,-6.5,-1.3,11,-7.1,-1,7.3,-4.7,1.9,6.7,-1.7,0.3,8.4,-2.3,-3,6.4,-2.4,-1.1,3.1,0.8,0.6,4.2,2.3,-2.8,5.2,1.5,-4.3,1.8,3.1,-1.3,0.1,6.3,-1.2,2.2,6.8,-5,1.9,6.6,-4.7,-1.9,8.2,-1.3,-2.3,11.7,-2.4,-1.6,11.8,-4,-5,14.6,-3,-7.4,13.8,-3.7,-11.1,17.5,-3.7,-12,18.4,-6.8,-10,15.1,-8.2,-8.7,16.2,-7.6,-5.1,13.5,-6.9,-2.5,9.9,-7.1,-3.4,6.9,-8.9,-2,8,-12.5,-2.9,10.2,-13.4,0.1,8.2,-12,2.9,11.3,-10.6,4.5,9.6,-8,6.7,9.5,-10.9,9.3,13.3,-10.3,9.8,14.7,-7.7,12.2,16.6,-5.7,9.6,13.5,-4.9,7.7,10.9,-4.6,10.5,13.3,-2.3,12.2,13.7,-0,9.1,12.9,3.5,10.3,10.8,3.8,7.2,8.6,1,8.6,8,2.6,12,4.5,1.8,13.1,3.9,-1.2,10.8,4.7,-3.6,13.7,1.1,-2.9,14.8,-0.2,-4.3,11.5,2.1,-7.3,11.7,0.8,-8,15.2,-2.8,-7.8,14,-2,-10.4,11.4,-0.4,-12.8,13.8,-3.6,-14.6,14.8,-4.5,-15,11.1,-1.1,-16.6,10.4,-1.6,-18.8,13.5,-5,-20,12.2,-3.6,-20.4,8.6,0,-21.4,9.1,0.2,-22.7,5.5,0.1,-19.3,3.8,3.5,-17.8,3,4.5,-14.5,4.7,4.6,-12.6,1.4,1.2,-13.9,0.5,-0.1,-12.8,3.9,1.3,-9.3,3.8,0.2,-8.6,0.2,-3.3,-10.2,0.8,-3.6,-8,3.9,-3.3,-4.9,1.7,-5.9,-6.2,-0.9,-8.3,-7.1,1.9,-7.9,-3.7,3.5,-8.6,-1.8,0.3,-11.6,-3.9,-0.5,-13,-3.8,3,-12.7,0,3.1,-15,0.1,0,-12.2,0.5,-2.4,-11.9,-1.2,-5.8,-11.6,-5,-6.2,-7.9,-5.9,-6.5,-7.1,-9.2,-8.2,-4.6,-11.1,-6.2,-2.3,-14.1,-7,-0.9,-16.6,-4.6,2.5,-18.3,-4.6,5,-16.1,-3,7.6,-18.2,-1.2,9.5,-17.4,2,13.2,-16.7,1.4,16,-16.7,4,17.1,-13.8,6.3,20.2,-13,4,17.7,-12.1,1.2,16.3,-9.2,3.3,16.9,-5.9,1.5,18.8,-3.2,3.4,17,-0.2,4.8,16.7,3,2.6,14.7,1.7,-0.4,11.5,3.3,0.6,10.9,7,-0.3,11.5,10.2,1.5,8.6,12.6,2.1,10.5,15.9,2.2,11.2,16,-1.6,9.8,17.2,-4.8,8.1,15.9,-8,11.4,15.2,-9.7,12.4,13,-6.7,9.1,11.1,-6.8,9.2,10.5,-10.5,12.8,9.2,-10.4,12.1,7.1,-7.2,9.2,5.3,-8.8,11.1,4.4,-11.9,13,1.8,-9.8,9.6,0.2,-9.2,8.8,0.4,-12.9,5.9,2.9,-12.3,5,5.7,-14.7,3.3,9,-13.9,-0.3,7.6,-14,0.7,4.7,-11.8,2.4,7,-9.3,-0.4,9.4,-9.1,-3,6.6,-8.7,-1,4.8,-6,-0.6,8,-4,-4.4,8.3,-3.7,-4.2,5.7,-0.9,-3,8.5,1.4,-6.5,9.8,1.9,-7.2,6.5,3.9,-5.2,7.4,6.9,-2.9,9.7,8.8,0.7,10.7,9.7,1.9,10.3,13.3,4.7,12.6,14.5,6.4,9.8,16.5,6.5,7.5,13.6,7.5,9.6,10.6,8.1,13.2,11.7,4.7,14.4,10.2,1.4,14.8,12,-2.3,14.9,11,-4.9,13.2,8.9,-4.5,13.1,5.2,-8.1,13.5,4.5,-11.6,13.6,6,-12.7,10,5.1,-10.7,8.1,7.7,-10.9,4.3,6.9,-12.9,4.7,3.6,-11.2,4.4,0.2,-12.2,7.4,-2,-10.8,9.8,-4.6,-10.7,12.6,-2,-6.9,12.9,-2.1,-7.3,14.5,-5.5,-10.3,16.6,-4.7,-8.7,17.9,-1.5,-5.4,18.8,-3.3,-7.3,20.9,-5.8,-10,22.4,-3.7,-8.6,23,-0.2,-6.6,26.1,0.9,-3.1,24.8,1.7,-0.4,26.5,3.7,3.2,25.4,4,3.9,25.2,7.8,6.4,23.5,10.1,5.1,20.8,12.4,6.4,20.2,15.9,9.2,18,14.6,10.5,21,12.6,9.5,19.4,9.3,7.5,21.2,6.6,4.1,19.9,5.6,1.1,21.4,3.8,-1.9,22.1,6,-5.5,23,5,-7.9,25,7.1,-10.2,22,7.2,-7.5,20.2,9.3,-5.9,18,6.7,-2.3,17.7,5.8,-0.2,16.7,2.8,3.4,15.7,2.6,5.8,17.7,0.4,5.8,14.7,-1.9,1.9,14.6,-2,1.7,18.3,-2.8,4.4,17.9,-5.5,1.6,16.1,-7.6,-0.1,19.5,-8.1,3.3,21.4,-8.6,4.3,19.4,-11.6,2.2,20,-14.7,2.2,16.3,-15.9,1.1,15.1,-12.4,-1.4,17.9,-12.1,-3.3,16.8,-15.2,-3.7,13.3,-13.8,-4.7,14.6,-10.4,-7.5,16.5,-12.1,-8.5,13.4,-14.1,-8.9,11.3,-10.9,-10.6,14.2,-9,-13.3,14.2,-11.8,-13.6,10.4,-12.3,-13.9,8.2,-9.3,-14.4,5,-11.4,-11.3,5.7,-13.5,-9.3,6.3,-10.3,-10.5,3,-8.8,-9.7,1,-11.9,-6.2,2.5,-12.3,-5.5,2.1,-8.6,-6.4,-1.5,-8.8,-4.1,-2.2,-11.7,-1.2,-0.3,-10.1,-1.6,-1.9,-6.7,-1.7,-5.4,-8.1,1.4,-4.6,-10.2,3.2,-3.3,-7.1,2.3,-6.4,-5.2,3.5,-8.7,-8.1,6.7,-6.9,-9.1,9.6,-9.4,-9.2,7.4,-12.5,-9.4,7.3,-14.9,-12.3,3.9,-16.6,-12.6,4.1,-19.9,-14.6,1.9,-20.1,-17.7,-0.2,-22.7,-16,-0.6,-20.8,-12.7,-4.1,-20.2,-11.5,-5.8,-17.1,-12.6,-5.8,-14.1,-10.2,-8.4,-14.4,-7.5,-11.1,-11.7,-6.9,-12.3,-12.1,-3.3,-15.8,-11.3,-2.2,-16,-8.7,0.6,-17.6,-9.6,3.9,-20.6,-7.4,2.8,-21,-9.3,-0.4,-21,-12.6,1.6,-23.5,-11.3,4.2,-20.9,-11.3,6.9];
  const HEM = [1.3,7,5.5,5.2,8.6,3,3.4,6.4,-0.9,0.1,4.2,1.7,2.6,7.5,5.2,3.3,8.3,6.1,4.3,8.8,5.4,4.2,8.3,4,5.5,9.7,5.9,3,8.5,7.6,3.5,7.4,8.4,3,7.6,9.9,2.3,6.8,10.4,3.5,8.7,10.4,5,8.2,1.7,5.8,8.6,0.6,5.3,8.1,-0.5,4.2,7.2,-0.1,6.9,9.6,0.8,5.8,8.2,-1.9,6.5,9.3,-2.5,2.5,5.5,-0.5,1.8,4.6,-1.4,0.9,3.9,-0.6,0.9,4.5,0.7,2.3,4.2,-2.8,0.1,2.7,-1,-0.6,2.6,-2.2,0.1,4.9,3,-1,4.7,4,-0.6,5.5,5,0.6,6.1,4.7,-2.2,3.8,3.7,-1.5,5.7,6.3,-1,5,7.5,-1.8,5.2,8.8,-1.3,4.6,9.8,-2.9,5.7,8.6,3.1,7.5,3.9,4,7.4,1.3,1.9,5.4,0.8,1.1,5.6,3.5,2.5,6.6,2.3];
  const HEM_BONDS = [0,4,0,31,1,7,1,14,2,17,2,21,3,24,3,28,4,5,4,38,5,6,5,9,6,7,6,8,7,38,9,10,10,11,11,12,11,13,14,15,14,39,15,16,15,18,16,17,16,19,17,39,19,20,21,22,21,40,22,23,22,25,23,24,23,26,24,40,26,27,28,29,28,41,29,30,29,32,30,31,30,33,31,41,33,34,34,35,35,36,35,37,38,42,39,42,40,42,41,42];
  const FE = 42;
  const SIDE = [-0.59,0.73,-0.33,-0.25,0.45,-0.86,-0.1,-0.62,-0.78,-0.18,-0.43,-0.88,0.37,-0.93,-0.03,0.9,0.14,0.41,-0.37,0.07,0.93,-0.44,-0.89,0.14,-0.42,-0.09,0.9,0.04,0.45,0.89,0.58,0.7,0.41,-0.52,0.79,0.32,-0.43,0.16,0.89,0.54,0.34,0.77,0.12,0.99,0.12,-0.69,0.54,0.49,-0.11,0.21,0.97,0.52,0.71,0.47,-0.36,0.93,0.06,-0.62,0.36,0.7,0.21,0.38,0.9,0.24,0.97,0.06,-0.68,0.72,0.17,-0.28,0.24,0.93,0.52,0.63,0.58,-0.11,0.99,0.01,-0.67,0.5,0.55,0.38,0.24,0.89,0.13,0.88,0.46,-0.78,0.42,-0.47,-0.58,0.75,0.32,-0.23,0.18,0.96,-0.82,-0.43,0.37,-0.84,0.54,-0.03,-0.38,0.71,0.59,-0.46,-0.19,0.87,-0.98,-0.18,0.11,-0.71,0.7,0.09,-0.35,0.44,0.83,-0.72,-0.47,0.52,-0.91,0.29,-0.31,-0.49,0.73,0.48,-0.29,0.74,-0.6,-0.72,-0.51,-0.47,0.12,-0.98,0.15,0.33,-0.94,0.07,-0.45,-0.88,-0.15,0.16,-0.11,-0.98,0.87,-0.5,-0.05,-0.2,-0.95,-0.24,0.68,-0.66,0.31,-0.19,-0.86,-0.48,-0.19,0.39,-0.9,0.23,-0.19,-0.95,0.83,0.48,-0.27,-0.44,0.9,-0.06,0.24,0.79,-0.57,-0.73,0.59,-0.34,-0.59,-0.76,-0.27,-0.63,0.03,0.78,0.26,-0.85,0.46,0.78,-0.57,-0.24,-0.16,-0.86,-0.49,-0.13,-0.95,0.27,0.83,-0.46,0.3,0.07,0.24,0.97,-0.99,-0.01,0.15,-0.6,-0.06,0.8,-0.45,0.88,-0.15,0.4,0.8,0.44,-0.52,0.63,-0.58,0.45,-0.21,-0.87,-0.88,-0.09,-0.46,0.11,-0.94,-0.33,-0.19,-0.75,0.63,-0.89,-0.38,0.25,-0.46,-0.69,-0.56,0.18,-0.97,0.17,-0.62,-0.38,0.69,-0.75,-0.35,-0.57,0.36,-0.67,-0.65,0.25,-0.9,0.36,-0.56,-0.83,0.05,-0.05,-0.55,-0.83,0.62,-0.77,-0.13,-0.16,-0.92,0.37,-0.02,-0.92,0.38,-0.66,-0.68,-0.32,0.68,-0.68,-0.26,0.48,0.12,0.87,0.74,-0.68,0.01,0.85,-0.32,-0.42,0.15,-0.96,-0.25,0.35,-0.72,0.6,0.96,-0.19,0.23,0.65,-0.53,-0.55,0.22,-0.97,-0.06,0.63,-0.36,0.69,0.97,0.05,-0.24,0.52,-0.69,-0.5,0.4,-0.85,0.35,0.88,-0.11,0.47,0.89,-0.09,-0.44,0.44,-0.81,-0.38,0.59,-0.66,0.46,0.92,0.36,-0.12,0.56,0.66,0.49,-0.66,0.75,0,0.66,0.72,0.19,0.65,-0.39,0.65,-0.33,-0.4,0.85,-0.12,-0.52,0.85,-0.84,-0.54,-0.05,-0.69,-0.71,-0.15,-0.62,-0.58,-0.53,0.36,-0.12,-0.92,0.25,-0.65,-0.72,0.44,0.58,-0.68,0.61,0.7,-0.36,-0.37,0.9,0.25,-0.3,0.49,0.81,0.01,0.86,-0.51,-0.66,0.75,-0.05,-0.83,-0.48,-0.27,0.15,-0.04,-0.99,0.99,0.12,0.1,0.53,-0.21,-0.82,-0.65,0.39,-0.66,-0.88,-0.25,0.41,-0.7,-0.71,0.05,-0.36,-0.04,0.93,-0.78,-0.57,-0.26,-0.56,-0.1,0.82,0.44,-0.2,0.88,0.89,0.12,0.43,0.09,0.71,0.7,-0.98,0.17,0.13,-0.12,0.99,0.05,0.38,0.89,-0.26,0.24,0.66,0.71,-0.64,0.66,0.4,-0.27,0.89,-0.37,0.5,0.87,0.04,0,0.7,0.71,-0.71,0.7,0.09,0.38,0.76,-0.52,0.62,0.47,0.63,-0.68,0.56,0.48,-0.42,-0.47,0.78,-0.41,-0.87,-0.28,-0.79,-0.6,-0.12,-0.5,0.03,0.87,0.17,0.14,0.98,-0.51,0.62,0.6,-0.86,-0.24,0.45,-0.2,-0.52,0.83,0.06,0.4,0.91,-0.68,0.47,0.56,-0.68,-0.54,0.5,0.51,-0.08,0.86,0.4,-0.89,-0.22,-0.81,-0.53,0.24,0.26,-0.45,0.85,0.21,-0.91,-0.36,0.97,0.06,-0.23,0.41,-0.89,0.22,0.5,-0.87,-0.01,0.6,-0.56,-0.57,0.76,-0.47,-0.45,0.59,0.12,-0.79,0.88,0.24,0.41,0.82,-0.55,0.17,0.46,-0.39,-0.8,0.84,0.48,-0.24,0.18,0.86,-0.48,0.04,0.93,-0.36,-0.45,0.7,0.56,0.06,0.95,-0.32,0.59,0.71,-0.38,-0.11,0.03,-0.99,-0.04,-0.11,-0.99,0.38,-0.21,-0.9,0.96,0.23,-0.17,0.34,0.62,-0.71,0.47,0.88,0.01,0.88,0.39,0.29,1,-0.08,-0,0.22,-0.06,-0.97,-0.49,0.83,-0.27,0.16,0.8,0.58,0.74,0.67,0,0.12,0.77,-0.63,-0.43,0.9,0.11,0.4,0.69,0.6,0.6,0.72,-0.36,-0.55,0.73,-0.41,0.68,0.23,-0.69,0.27,0.21,-0.94,0.23,0.75,-0.62,0.12,0.83,-0.54,0.24,0.97,0.07,-0.29,0.87,0.41,-0.55,0.53,0.64,-0.88,-0.41,-0.23,-0.09,-0.68,-0.73,0.4,-0.88,0.27,0.98,0.19,0.1,0.88,-0.19,-0.44,0.2,-0.89,-0.41,0.11,-0.94,-0.33,-0.34,-0.94,0.08,-0.15,-0.91,0.38,-0.01,-0.35,0.94,0.36,0.25,0.9,0.98,-0.01,-0.19,0.18,0.31,-0.93,0.45,0.89,0.02,0.41,0.86,0.31,0.48,0.81,0.35,0.39,-0.17,0.91,0.61,-0.65,0.46,-0.31,-0.31,0.9,0.12,0.35,0.93,0.89,-0.23,0.39,-0.33,-0.86,0.4,0.26,-0.55,-0.79,-0.83,0.16,-0.53,-0.1,0.98,-0.17,0.86,0.45,-0.25,0.92,-0.26,-0.28,0.87,0.04,0.49,0.57,0.8,0.21,0.59,0.31,-0.75,0.91,-0.42,-0.08,0.83,0.38,0.41,0.52,0.78,-0.35,0.71,-0.09,-0.7,0.96,-0.23,0.16,0.64,0.75,0.16,0.34,0.23,-0.91,-0.67,0.71,-0.21,-0.96,0.2,0.21,-0.93,0.06,-0.37,-0.31,0.72,-0.62,-0.28,0.92,0.27,-0.9,0.3,0.31,-0.75,0.25,-0.61,-0.2,0.91,-0.36,-0.54,0.72,0.44,-1,0.04,-0.01,-0.54,0.37,-0.76,-0.27,0.95,-0.17,-0.82,0.42,0.39,-0.94,-0.04,-0.35,-0.39,0.53,-0.75,-0.41,0.91,0.08,-0.95,0.17,0.24,-0.32,0.14,-0.94,0.12,0.99,0,-0.15,0.26,-0.95,-0.97,-0.11,-0.21,-0.52,0.57,-0.63,-0.13,0.68,-0.72,0.04,0.4,-0.92,0.95,-0.22,-0.23,0.5,-0.85,0.17,-0.2,-0.95,-0.23,0.63,-0.31,0.71,0.58,0.81,0.12,0.17,0.24,-0.96,-0.9,-0.07,-0.42,-0.54,-0.79,-0.28,-0.69,-0.68,-0.26,0.09,-0.98,0.18,0.5,-0.34,0.79,0.78,0.62,0.06,0.35,0.92,0.17,0.73,0.41,-0.55,0.9,-0.17,0.41,0.13,-0.93,-0.35,-0.71,-0.68,0.19,-0.14,-0.98,0.14];
  const SS = '---------HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH-----------------HHHHHH-----HHHHHHHHHHHHHHHH---HHHHHHHHHHHHHHHHH------------------------------HHHHHHHHHHH---HHHHHHHHHH-------HHHHHH-------------HHHHHHHHHH-EEEEE-----EEEEE------HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH---------------HHHHHH-';

  // The cartoon: a Catmull-Rom spline through the Cα, K points per residue, each with the ribbon's side vector
  // (the carbonyl's direction, as cartoon programs take it) and half-width (Å): helices as wide ribbons, strands
  // as arrows, everything else as a thin tube.
  const K = 4, NRES = CA.length / 3, TUBE = 0.35, HW = 1.3, SW = 1.0, AW = 1.8;
  const runs = c => { const out = []; for (let i = 0; i < NRES; i++) if (SS[i] === c && SS[i - 1] !== c) { let j = i; while (SS[j + 1] === c) j++; out.push([i, j]); } return out; };
  const HR = runs('H'), ER = runs('E');
  const halfWidth = r => {                                   // r: position along the chain, in residues
    let v = TUBE;
    for (const [a, b] of HR) v = Math.max(v, HW * ease((r - a + 0.5) / 0.6) * ease((b + 0.5 - r) / 0.6));
    for (const [a, b] of ER) {
      if (r >= a - 0.5 && r <= b - 1) v = Math.max(v, SW * ease((r - a + 0.5) / 0.5));
      else if (r > b - 1 && r < b + 0.4) v = Math.max(v, AW * (b + 0.4 - r) / 1.4);   // the arrowhead
    }
    return v;
  };
  const SPL = (() => {
    const P = [], S = [], W = [], ca = (i, d) => CA[3 * Math.max(0, Math.min(NRES - 1, i)) + d];
    const push = (i, u) => {
      for (let d = 0; d < 3; d++) {
        const p0 = ca(i - 1, d), p1 = ca(i, d), p2 = ca(i + 1, d), p3 = ca(i + 2, d);
        P.push(0.5 * (2 * p1 + (p2 - p0) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (3 * p1 - p0 - 3 * p2 + p3) * u * u * u));
      }
      const i1 = Math.min(NRES - 1, i + 1);
      for (let d = 0; d < 3; d++) S.push(lerp(SIDE[3 * i + d], SIDE[3 * i1 + d], u));
      W.push(halfWidth(i + u));
    };
    for (let i = 0; i < NRES - 1; i++) for (let j = 0; j < K; j++) push(i, j / K);
    push(NRES - 1, 0);
    const n = W.length;
    for (let k = 0; k < n; k++) {                            // side vectors square to the spline, unit length
      const a = Math.max(0, k - 1), b = Math.min(n - 1, k + 1);
      const t = [0, 1, 2].map(d => P[3 * b + d] - P[3 * a + d]), tl = Math.hypot(...t) || 1;
      const v = [0, 1, 2].map(d => S[3 * k + d]), dt = (v[0] * t[0] + v[1] * t[1] + v[2] * t[2]) / (tl * tl);
      const q = v.map((x, d) => x - dt * t[d]), ql = Math.hypot(...q) || 1;
      for (let d = 0; d < 3; d++) S[3 * k + d] = q[d] / ql;
    }
    return { P, S, W, n };
  })();

  // The autocomplete list, as in Fig. 2C (with shorter forms for narrow panels)
  const SUGG = [
    [['cytochrome c peroxidase, mitochondrial', 'cytochrome c peroxidase', 'cyt. c peroxidase', 'cyt c peroxidase'], 180],
    [['cytochrome b-562'], 165],
    [['soluble cytochrome b562', 'soluble cyt. b562'], 165],
    [['nadph-cytochrome p450 reductase', 'nadph-cyt. p450 reductase', 'cyt. p450 reductase'], 135]];
  const TYPED = 'cytochrome';
  const STOPS = [100, 95, 90, 70, 50, 40, 30];

  /* ---- where the squares go, for one size of results area (cached) ---- */
  let geo = null;
  function geometry(ax, ay, aw, ah, big) {
    const key = [ax, ay, aw, ah].map(Math.round).join(',');
    if (geo && geo.key === key) return geo;
    const g = { key, pos: E.map(() => []) };            // pos[i][k] = [cx, cy, size] in state k
    // 1: all 180, in the grid that fits them best
    let best = { P: 0 };
    for (let c = 1; c <= E.length; c++) { const r = Math.ceil(E.length / c), P = Math.min(aw / c, ah / r); if (P > best.P) best = { P, c, r }; }
    const P1 = Math.min(best.P, big ? 24 : 14), c1 = best.c;
    const x1 = ax + (aw - c1 * P1) / 2, y1 = ay + (ah - best.r * P1) / 2;
    const cell = (x0, y0, P, j, cols) => [x0 + (j % cols + 0.5) * P, y0 + (Math.floor(j / cols) + 0.5) * P, 0.78 * P];
    E.forEach((e, i) => { g.pos[i][1] = cell(x1, y1, P1, i, c1); });
    XR.forEach((i, j) => { g.pos[i][2] = cell(x1, y1, P1, j, c1); });       // 2: the X-ray ones, closed up
    // 3: the 42, three rows, at the clusters' pitch; 4–6: in clusters (three rows each, a pitch between them)
    const lab = 16, Pc = Math.min(aw / 23, (ah - lab) / 3, big ? 26 : 14), y0 = ay + (ah - lab - 3 * Pc) / 2;
    SURV.forEach((i, j) => { g.pos[i][3] = cell(ax + (aw - 14 * Pc) / 2, y0, Pc, j, 14); });
    g.blocks = LEVELS.map((groups, k) => {
      const cols = groups.map(m => Math.ceil(m.length / 3)), total = cols.reduce((a, b) => a + b, 0) + groups.length - 1;
      let x = ax + (aw - total * Pc) / 2;
      return groups.map((m, b) => {
        m.forEach((i, j) => { g.pos[i][4 + k] = cell(x, y0, Pc, j, cols[b]); });
        const blk = { x, w: cols[b] * Pc }; x += (cols[b] + 1) * Pc; return blk;
      });
    });
    g.Pc = Pc; g.y0 = y0;
    return (geo = g);
  }

  Anim.register('pdbe-nar-2020', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE, show = envelope(s, SHOW);
    if (show < 0.005) return;
    const pad = Math.max(14, w * 0.05), ly = pad + 6, bot = h - pad, big = w >= 400;
    const M = q => Anim.measure(ctx, th, q);
    const label = (text, x, y, align, colour, alpha = 1) => { if (alpha < 0.01 || !text) return; ctx.globalAlpha = show * alpha; Anim.label(ctx, th, text, x, y, align, colour); };
    const trunc = (q, room) => { if (M(q) <= room) return q; while (q.length > 1 && M(q + '…') > room) q = q.slice(0, -1); return q.trimEnd() + '…'; };
    const fit = (variants, room) => variants.find(v => M(v) <= room) || trunc(variants[variants.length - 1], room);
    const rr = (x, y, bw, bh, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + bw, y, x + bw, y + bh, r); ctx.arcTo(x + bw, y + bh, x, y + bh, r); ctx.arcTo(x, y + bh, x, y, r); ctx.arcTo(x, y, x + bw, y, r); ctx.closePath(); };

    /* ---- layout: the search form's four rows, then the results ---- */
    const rowH = big ? 20 : 16, gap = big ? 5 : 3, ip = big ? 7 : 4, cg = big ? 8 : 5;   // cg: space before a count
    const formTop = ly + (big ? 18 : 14), rowY = k => formTop + k * (rowH + gap), formBot = rowY(4) - gap;
    const headY = formBot + 14, ay = big ? headY + 11 : formBot + 8;
    const area = { x: pad, y: ay, w: w - 2 * pad, h: bot - ay };
    const NAMES = [['Molecule name', 'Method', 'Resolution', 'Clustering'], ['Name', 'Method', 'Resolution', 'Clustering'], ['Name', 'Method', 'Res.', 'Cluster']];
    const boxOf = names => { const x = pad + Math.max(...names.map(M)) + (big ? 10 : 8); return { x, w: w - pad - x }; };
    const need = M(SUGG[0][0][0]) + M('(180)') + 2 * ip + 8;
    const names = !big ? NAMES[2] : boxOf(NAMES[0]).w >= need ? NAMES[0] : boxOf(NAMES[1]).w >= need ? NAMES[1] : NAMES[0];
    const { x: bx, w: bw } = boxOf(names);
    const formA = 1 - between(s, ...FORM_OUT);
    const g = geometry(area.x, area.y, area.w, area.h, big);

    /* ---- the archive, then the entries ---- */
    const vNow = lerp(R_HI, R_LO, between(s, ...SLIDE));             // the resolution limit now
    const cond = between(s, ...CONDENSE);
    const archA = 1 - between(s, CONDENSE[0], CONDENSE[0] + 0.9);
    if (archA > 0.01) {
      const n = Math.min(ARCH.length / 2, Math.round(area.w * area.h / 30));
      ctx.fillStyle = th.muted; ctx.globalAlpha = show * 0.5 * archA;
      for (let k = E.length; k < n; k++) ctx.fillRect(area.x + ARCH[2 * k] * area.w - 0.8, area.y + ARCH[2 * k + 1] * area.h - 0.8, 1.6, 1.6);
    }
    // each entry's place: from its spot in the archive into the grid, closing up after each filter, then into its clusters
    const U = [cond, between(s, ...PACK_M), between(s, ...PACK_R), ...CL.map(c => between(s, ...c))];
    const place = i => {
      const p = g.pos[i];
      let x = area.x + ARCH[2 * i] * area.w, y = area.y + ARCH[2 * i + 1] * area.h, z = 1.6;
      for (let k = 1; k <= 6; k++) { const q = p[k]; if (!q) break; const u = U[k - 1]; x = lerp(x, q[0], u); y = lerp(y, q[1], u); z = lerp(z, q[2], u); }
      return [x, y, z];
    };
    const kRep = REPC.map(c => between(s, ...c));
    const cardU = between(s, ...CARD);
    E.forEach((e, i) => {
      let a = lerp(0.5, 1, cond), colour = cond < 1 ? mix(th.muted, th.fid, cond) : th.fid;
      if (!e.xr) a *= 1 - between(s, ...GONE_M);                      // NMR: out with the method field
      // too coarse: goes as the limit passes its resolution (and all are gone once the limit stops)
      else if (!e.surv) { const f = Math.max(clamp01((e.res - vNow) / 0.1), between(s, SLIDE[1], SLIDE[1] + 0.2)); a *= 1 - f; colour = mix(colour, th.muted, f); }
      else {                                                         // shown (orange) or hidden in its cluster (faint)
        const rep = lerp(lerp(lerp(0, +isRep[0](i), kRep[0]), +isRep[1](i), kRep[1]), +isRep[2](i), kRep[2]);
        a *= lerp(1, 0.28, kRep[0] * (1 - rep)); colour = mix(th.fid, th.spec, rep);
      }
      if (i === ONE) a *= 1 - between(s, CARD[0], CARD[0] + 0.3);
      else a *= formA;
      if (a < 0.01) return;
      const [x, y, z] = place(i);
      ctx.globalAlpha = show * a; ctx.fillStyle = colour;
      ctx.fillRect(x - z / 2, y - z / 2, z, z);
    });
    // clusters: an outline round each, and the representatives' IDs once there are few of them
    const lvl = s < CL[1][0] ? 0 : s < CL[2][0] ? 1 : 2;            // clusters as they are moving to
    const lvlR = s < REPC[1][0] ? 0 : s < REPC[2][0] ? 1 : 2;         // ... and as the counts give them
    const boxA = between(s, CL[0][0], CL[0][0] + 0.6) * formA;
    if (boxA > 0.01) {
      LEVELS[lvl].forEach((m, b) => {
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        m.forEach(i => { const [x, y, z] = place(i); x0 = Math.min(x0, x - z / 2); y0 = Math.min(y0, y - z / 2); x1 = Math.max(x1, x + z / 2); y1 = Math.max(y1, y + z / 2); });
        ctx.globalAlpha = show * boxA * 0.55; ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
        rr(x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6, 3); ctx.stroke();
        if (lvl > 0) label(E[m[0]].id, m.length > 1 ? x0 - 2 : (x0 + x1) / 2, y1 + 12, m.length > 1 ? 'left' : 'center', th.spec, boxA * between(s, ...REPC[lvl]) * (lvl === 1 ? 1 - between(s, ...STEP[1]) : 1));
      });
    }

    /* ---- big panels: a line above the results (the archive's size, then the counts and a key) ---- */
    if (big) {
      const nRes = s < GONE_M[1] ? 180 : s < PACK_R[0] ? nAtOrBelow(vNow) : 42;
      const nCl = [7, 2, 1][lvlR];
      label('PDB archive: 155,000+ entries', pad, headY, 'left', th.muted, archA * (1 - between(s, ...DROP)));
      const resA = between(s, CONDENSE[0] + 0.4, CONDENSE[1]) * formA;
      const clA = between(s, REPC[0][0], REPC[0][1]);
      label(`${nRes} entries`, pad, headY, 'left', th.ink, resA * (1 - clA));
      label(`42 entries in ${nCl} cluster${nCl > 1 ? 's' : ''}`, pad, headY, 'left', th.ink, resA * clA);
      // key: shown / hidden
      const ka = resA * clA, kx = w - pad - M('hidden');
      label('hidden', w - pad, headY, 'right', th.muted, ka);
      label('shown', kx - 22, headY, 'right', th.muted, ka);
      if (ka > 0.01) {
        ctx.globalAlpha = show * ka * 0.28; ctx.fillStyle = th.fid; ctx.fillRect(kx - 13, headY - 4, 8, 8);
        ctx.globalAlpha = show * ka; ctx.fillStyle = th.spec; ctx.fillRect(kx - 22 - M('shown') - 13, headY - 4, 8, 8);
      }
    }

    /* ---- the search form ---- */
    const field = (k, alpha, active) => {
      if (alpha < 0.01) return null;
      const y = rowY(k) + (1 - alpha) * -4;
      label(names[k], pad, y + rowH / 2, 'left', th.soft, alpha);
      ctx.globalAlpha = show * alpha; ctx.fillStyle = th.surface; rr(bx, y, bw, rowH, 3); ctx.fill();
      ctx.strokeStyle = active ? th.fid : th.muted; ctx.lineWidth = active ? 1.3 : 1; ctx.globalAlpha = show * alpha * (active ? 1 : 0.6); ctx.stroke();
      return y + rowH / 2;
    };
    const cnt = n => (big ? `(${n})` : `${n}`);                     // a field's result count (bare on phones, to leave room)
    const count = (n, y, alpha) => label(cnt(n), bx + bw - ip, y, 'right', th.muted, alpha);
    const track = (x0, x1, y, alpha, ticks, u) => {          // a slider: line, ticks, handle at u (0–1)
      if (alpha < 0.01 || x1 - x0 < 24) return;
      ctx.globalAlpha = show * alpha * 0.7; ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y);
      for (let k = 0; k < ticks; k++) { const x = lerp(x0, x1, k / (ticks - 1)); ctx.moveTo(x, y - 2.5); ctx.lineTo(x, y + 2.5); }
      ctx.stroke();
      ctx.globalAlpha = show * alpha; ctx.fillStyle = th.fid; ctx.beginPath(); ctx.arc(lerp(x0, x1, u), y, big ? 4 : 3.2, 0, TAU); ctx.fill();
    };
    // row 1: molecule name: example text, "cytochrome" typed, then the picked term and its count
    const closing = between(s, ...CLOSE);
    const y1 = field(0, formA, s < CLOSE[1] && s > TYPE[0] - 0.4);
    if (y1 != null) {
      const typed = Math.round(TYPED.length * clamp01((s - TYPE[0]) / (TYPE[1] - TYPE[0])));
      label(fit(['e.g. carbonic anhydrase 2', 'e.g. carbonic anhydrase', 'carbonic anhydrase 2', 'e.g. anhydrase'], bw - 2 * ip), bx + ip, y1, 'left', th.muted, formA * (1 - between(s, TYPE[0] - 0.4, TYPE[0])));
      if (s >= TYPE[0]) {
        const q = TYPED.slice(0, typed);
        label(q, bx + ip, y1, 'left', th.ink, formA * (1 - closing));
        const cx = bx + ip + M(q) + 1, ca = formA * (1 - closing);
        if (ca > 0.01) { ctx.globalAlpha = show * ca; ctx.strokeStyle = th.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, y1 - 6); ctx.lineTo(cx, y1 + 6); ctx.stroke(); }
      }
      const room = bw - 2 * ip - M(cnt(180)) - cg;
      label(fit(SUGG[0][0], room), bx + ip, y1, 'left', th.ink, formA * closing);
      count(180, y1, formA * between(s, CLOSE[1], CLOSE[1] + 0.4));
    }
    // row 2: method
    const y2 = field(1, between(s, ...ROW2) * formA, false);
    if (y2 != null) {
      const a = between(s, ...ROW2) * formA;
      label(fit(['X-ray diffraction', 'X-ray'], bw - 2 * ip - M(cnt(177)) - cg), bx + ip, y2, 'left', th.ink, a);
      count(177, y2, a * between(s, ROW2[1], ROW2[1] + 0.3));
    }
    // row 3: resolution limit, sliding down; the count follows it
    const y3 = field(2, between(s, ...ROW3) * formA, s > ROW3[0] && s < PACK_R[1]);
    if (y3 != null) {
      const a = between(s, ...ROW3) * formA, txt = `≤ ${vNow.toFixed(1)} Å`;
      label(txt, bx + ip, y3, 'left', th.ink, a);
      count(nAtOrBelow(vNow), y3, a);
      const t0 = bx + ip + M('≤ 0.0 Å') + 12, t1 = bx + bw - ip - M(cnt(nAtOrBelow(vNow))) - 12;
      track(t0, t1, y3, a, 0, (vNow - R_MIN) / (R_HI - R_MIN));
    }
    // row 4: sequence identity for clustering, stepping 100 → 95 → 90 %
    const y4 = field(3, between(s, ...ROW4) * formA, s > ROW4[0] && s < CL[2][1]);
    if (y4 != null) {
      const a = between(s, ...ROW4) * formA, u = between(s, ...STEP[0]) + between(s, ...STEP[1]);
      const pct = STOPS[Math.round(u)], nCl = [7, 2, 1][lvlR];
      const words = fit([`${pct} % identity`, `${pct} %`], bw - 2 * ip - M(cnt(7)) - cg - 40);
      label(words, bx + ip, y4, 'left', th.ink, a);
      count(nCl, y4, a * between(s, REPC[0][0], REPC[0][1]));
      const t0 = bx + ip + M(words.replace(/^\d+/, '100')) + 12, t1 = bx + bw - ip - M(cnt(7)) - 12;
      track(t0, t1, y4, a, STOPS.length, u / (STOPS.length - 1));
    }
    // the autocomplete list, over the empty rows below
    const open = between(s, ...DROP) * (1 - closing) * formA;
    if (open > 0.01) {
      const room0 = Math.max(...SUGG.map(([v, n]) => M(v[0]) + M(`(${n})`) + 8)) + 2 * ip;
      const dw = Math.min(room0, w - 2 * pad), dx = Math.max(pad, Math.min(bx, w - pad - dw)), dy = rowY(0) + rowH + 1, ih = rowH;
      ctx.save(); ctx.beginPath(); ctx.rect(dx - 2, dy - 1, dw + 4, (SUGG.length * ih + 3) * between(s, ...DROP)); ctx.clip();
      ctx.globalAlpha = show * open; ctx.fillStyle = th.surface; rr(dx, dy, dw, SUGG.length * ih, 3); ctx.fill();
      ctx.strokeStyle = th.muted; ctx.globalAlpha = show * open * 0.6; ctx.lineWidth = 1; ctx.stroke();
      const hl = between(s, ...HILITE);
      if (hl > 0.01) { ctx.globalAlpha = show * open * hl * 0.16; ctx.fillStyle = th.fid; ctx.fillRect(dx + 1, dy + 1, dw - 2, ih - 1); }
      SUGG.forEach(([v, n], k) => {
        const y = dy + (k + 0.5) * ih, cnt = `(${n})`;
        label(fit(v, dw - 2 * ip - M(cnt) - 8), dx + ip, y, 'left', k === 0 ? mix(th.ink, th.fid, hl) : th.ink, open);
        label(cnt, dx + dw - ip, y, 'right', th.muted, open);
      });
      ctx.restore();
    }

    /* ---- the result card: 3e2n ---- */
    if (cardU > 0.001) {
      const [qx, qy, qz] = place(ONE);
      const lay = cardLayout({ x: pad, y: formTop, w: w - 2 * pad, h: bot - formTop }), to = lay.to;
      const r = { x: lerp(qx - qz / 2, to.x, cardU), y: lerp(qy - qz / 2, to.y, cardU), w: lerp(qz, to.w, cardU), h: lerp(qz, to.h, cardU) };
      ctx.globalAlpha = show; ctx.fillStyle = th.surface; rr(r.x, r.y, r.w, r.h, Math.min(6, r.w / 2)); ctx.fill();
      ctx.strokeStyle = th.spec; ctx.lineWidth = 1.4; ctx.stroke();
      const ca = between(s, ...CONTENT);
      if (ca > 0.01) card(lay, ca);
    }

    // the card's text (required lines, then optional ones while they fit) and its size: as tall as its contents need
    function cardLayout(sp) {
      const cp = big ? 14 : 9, T = Math.min(sp.h - 2 * cp, (big ? 0.4 : 0.36) * sp.w), tw = sp.w - T - 3 * cp, lh = big ? 17 : 15;
      // the text: required lines, then optional ones while they fit
      const wrap = (q, room, max) => {
        const out = []; let line = '';
        for (const word of q.split(' ')) { const tryL = line ? line + ' ' + word : word; if (M(tryL) <= room) line = tryL; else { out.push(line); line = word; } }
        out.push(line);
        return out.length > max ? [...out.slice(0, max - 1), trunc(out.slice(max - 1).join(' '), room)] : out;
      };
      const link = mix(th.green, th.ink, 0.3);                       // the buttons' green, dark enough to read
      const title = tw >= 150 ? wrap('Engineering ascorbate peroxidase activity into cytochrome c peroxidase', tw, 3) : [];
      const L = { id: ['3e2n', th.fid], m: [fit(['X-ray diffraction · 1.30 Å', 'X-ray · 1.30 Å', 'X-ray, 1.30 Å', '1.30 Å'], tw), th.soft],
        lig: [fit(['Ligand: HEM, haem cofactor', 'Ligand: HEM (haem)', 'Ligand: HEM', 'HEM'], tw), th.soft],
        pf: [fit(['Pfam: Peroxidase (PF00141)', 'Pfam: Peroxidase', 'Pfam: PF00141'], tw), th.soft],
        kb: [fit(['PDBe-KB: P00431', 'PDBe-KB P00431', 'P00431'], tw), th.soft], v: ['3D view', link], d: [fit(['Download files', 'Download'], tw), link] };
      const build = (nTitle, pfam) => [L.id, ...title.slice(0, nTitle).map(q => [q, th.ink]), null, L.m, L.lig, ...(pfam ? [L.pf] : []), L.kb, null, L.v, L.d];
      const height = ls => ls.reduce((a, q) => a + (q ? lh : lh * 0.5), 0);
      let lines = build(title.length, true);
      for (const [nT, pf] of [[title.length, false], [2, false], [1, false], [0, false]]) { if (height(lines) <= sp.h - 2 * cp) break; lines = build(Math.min(nT, title.length), pf); }
      const ch = Math.min(sp.h, Math.max(height(lines), T) + 2 * cp);
      return { to: { x: sp.x, y: sp.y + (sp.h - ch) / 2, w: sp.w, h: ch }, cp, T, lh, lines, L, H: height(lines) };
    }

    function card({ to, cp, T, lh, lines, L, H }, ca) {
      let y = to.y + (to.h - H) / 2 + lh / 2;
      lines.forEach(q => {
        if (!q) { y += lh * 0.5; return; }
        label(q[0], to.x + cp, y, 'left', q[1], ca);
        if (q === L.id) { ctx.globalAlpha = show * ca; ctx.strokeStyle = th.fid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(to.x + cp, y + 7); ctx.lineTo(to.x + cp + M(q[0]), y + 7); ctx.stroke(); }
        y += lh;
      });
      // its structure as a cartoon, with its haem, turning about the vertical; drawn back to front, so nearer parts hide
      // farther ones. Faces are flat: the ribbon's two sides in two tones, each lighter as it turns edge-on, and a
      // little lighter with distance; dark edges keep the ribbons readable.
      const fx = to.x + to.w - cp - T, fy = to.y + (to.h - T) / 2;
      ctx.globalAlpha = show * ca * 0.8; ctx.strokeStyle = th.rule; ctx.lineWidth = 1; rr(fx, fy, T, T, 4); ctx.stroke();
      const ang = 0.35 * s, c = Math.cos(ang), sn = Math.sin(ang), sc = (T / 2 - 5) / 30, cx = fx + T / 2, cy = fy + T / 2;
      const { P: SP, S: SV, W: SW_, n } = SPL;
      const RX = new Float32Array(n), RY = new Float32Array(n), RZ = new Float32Array(n), QX = new Float32Array(n), QY = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        const x = SP[3 * k], z = SP[3 * k + 2], a = SV[3 * k], d = SV[3 * k + 2];
        RX[k] = x * c + z * sn; RY[k] = SP[3 * k + 1]; RZ[k] = -x * sn + z * c; QX[k] = a * c + d * sn; QY[k] = SV[3 * k + 1];
      }
      const HP = []; for (let k = 0; k < HEM.length / 3; k++) { const x = HEM[3 * k], z = HEM[3 * k + 2]; HP.push([cx + sc * (x * c + z * sn), cy - sc * HEM[3 * k + 1], -x * sn + z * c]); }
      const prims = [];
      for (let k = 0; k < n - 1; k++) prims.push([(RZ[k] + RZ[k + 1]) / 2, 0, k]);
      for (let k = 0; k < HEM_BONDS.length; k += 2) prims.push([(HP[HEM_BONDS[k]][2] + HP[HEM_BONDS[k + 1]][2]) / 2, 1, k]);
      prims.push([HP[FE][2], 2, 0]);
      prims.sort((p, q) => p[0] - q[0]);
      const tones = new Map(), tone = (kind, lit, fog) => {   // kind 0/1 ribbon front/back, 2/3 their edges, 4 tube, 5 haem
        const key = kind * 100 + lit * 10 + fog;
        if (!tones.has(key)) {
          const face = mix(kind % 2 ? mix(th.fid, th.bg, 0.45) : th.fid, th.bg, 0.3 * (1 - lit / 3));
          const v = kind < 2 ? face : kind < 4 ? mix(face, th.ink, 0.35) : kind === 4 ? th.fid : th.spec;
          tones.set(key, mix(v, th.bg, 0.1 * fog));
        }
        return tones.get(key);
      };
      const X = k => cx + sc * RX[k], Y = k => cy - sc * RY[k];
      const tubeW = Math.max(1, 2.2 * TUBE * sc), edgeW = big ? 0.75 : 0.5;
      ctx.globalAlpha = show * ca; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const [z, kind, k] of prims) {
        const fog = Math.round(4 * clamp01((24 - z) / 48));
        if (kind === 0) {
          const w0 = SW_[k] * sc, w1 = SW_[k + 1] * sc, x0 = X(k), y0 = Y(k), x1 = X(k + 1), y1 = Y(k + 1);
          if (Math.max(SW_[k], SW_[k + 1]) <= TUBE + 0.05) {    // loop: a tube
            ctx.strokeStyle = tone(4, 3, fog); ctx.lineWidth = tubeW;
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
            continue;
          }
          const tx = RX[k + 1] - RX[k], ty = RY[k + 1] - RY[k], tl = Math.hypot(tx, ty, RZ[k + 1] - RZ[k]) || 1;
          const nz = (tx * (QY[k] + QY[k + 1]) / 2 - ty * (QX[k] + QX[k + 1]) / 2) / tl;   // the face's normal, towards us
          const side = nz >= 0 ? 0 : 1, lit = Math.round(3 * Math.min(1, Math.abs(nz)));
          const ax = x0 + w0 * QX[k], ay = y0 - w0 * QY[k], bx2 = x1 + w1 * QX[k + 1], by = y1 - w1 * QY[k + 1];
          const cx2 = x1 - w1 * QX[k + 1], cy2 = y1 + w1 * QY[k + 1], dx = x0 - w0 * QX[k], dy = y0 + w0 * QY[k];
          ctx.fillStyle = ctx.strokeStyle = tone(side, lit, fog); ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx2, by); ctx.lineTo(cx2, cy2); ctx.lineTo(dx, dy); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = tone(side + 2, lit, fog); ctx.lineWidth = edgeW;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx2, by); ctx.moveTo(dx, dy); ctx.lineTo(cx2, cy2); ctx.stroke();
        } else if (kind === 1) {
          const a = HP[HEM_BONDS[k]], b = HP[HEM_BONDS[k + 1]];
          ctx.strokeStyle = tone(5, 3, fog); ctx.lineWidth = big ? 1.6 : 1.2;
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        } else {
          ctx.fillStyle = tone(5, 3, fog); ctx.beginPath(); ctx.arc(HP[FE][0], HP[FE][1], big ? 2.4 : 1.8, 0, TAU); ctx.fill();
        }
      }
      // the haem again, faintly over everything, so it stays in sight when a helix passes in front of it
      ctx.globalAlpha = show * ca * 0.3; ctx.strokeStyle = th.spec; ctx.lineWidth = big ? 1.2 : 0.9;
      ctx.beginPath();
      for (let k = 0; k < HEM_BONDS.length; k += 2) { const a = HP[HEM_BONDS[k]], b = HP[HEM_BONDS[k + 1]]; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke();
      ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
    }

    /* ---- the heading ---- */
    const room = w - 2 * pad;
    const pick = (left, right) => {                        // the longest words that fit: a shorter left before losing the right
      const fits = (l, r) => M(l) + M(r) + 16 <= room;
      for (const l of left) { const r = right.find(q => fits(l, q)); if (r !== undefined) return [l, r]; }
      return [left.find(l => M(l) <= room) || left[left.length - 1], ''];
    };
    const STAGES = [
      [['PDBe search'], ['155,000+ entries in the Protein Data Bank', '155,000+ PDB entries', '155,000+ entries'], th.fid],
      [['Autocomplete'], ['terms, with how many entries each', 'terms, with entry counts', 'with entry counts', 'with counts'], th.fid],
      [['Advanced search', 'Advanced'], ['122 fields, combined with AND', '122 fields, AND', '122 fields'], th.fid],
      [['Sequence clustering', 'Clustering'], ['one structure per cluster', 'one per cluster'], th.spec],
      [['Result: 3e2n', '3e2n'], ['3D view, files, annotations', '3D view, files'], th.spec]];
    STAGES.forEach(([left, right, colour], k) => {
      const [a, b] = HEADS[k], alpha = (k ? between(s, a, a + 0.3) : 1) * (k < HEADS.length - 1 ? 1 - between(s, b - 0.3, b) : 1);
      if (alpha < 0.01) return;
      const [L0, R0] = pick(left, right);
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
