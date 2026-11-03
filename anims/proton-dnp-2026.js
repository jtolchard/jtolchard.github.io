/* ==========================================================================
   proton-dnp-2026: proton resolution under cryogenic DNP.
   1. A fully protonated fibril strand at 298 K and 12 kHz MAS: a somewhat
      broad ¹H line, with some structure.
   2. Cooled to 100 K: the line broadens a little.
   3. Spin-diluted (²H, with sparse ¹³CHD₂ methyls): structure returns.
   4. 40 kHz MAS: the peaks resolve.
   5. The DNP biradical is added: the peaks broaden.
   6. Microwaves on: DNP lifts the signal far above the noise, and everything on
      the old scale (the noise, the dashed reference) shrinks.
   7. Two peaks are joined, as a ¹H–¹H correlation would show them, and then
      the contact between two methyls it comes from lights up, with its distance.
   ========================================================================== */
(function () {
  'use strict';

  const rand = Anim.seeded(2026);
  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));

  /* ---- timing (seconds into the loop) ---- */
  // The windows are when each change shows in the spectrum and the strand. The
  // readout for it (temperature, labelling, spinning) is highlighted and changes
  // LEAD seconds earlier, so the eye goes to the readout first, then to its effect.
  const CYCLE = 19.85;
  const LEAD = 0.6, SWAP = 0.5;   // readout leads its effect by LEAD, and takes SWAP to change
  const COOL = [1.6, 2.6];    // 298 K → 100 K, then a pause to see what cooling did
  const DIL = [4.2, 5.45];    // spin dilution
  const MAS = [6.7, 7.7];     // 12 → 40 kHz
  // The biradical and the microwaves follow the same rhythm: the cause first (the
  // molecule docks, the wave reaches it), then, LEAD seconds later, its effect.
  const RAD_IN = [8.1, 8.9];  // the biradical drifts in and docks
  const RAD = [9.5, 10.5];    // … then the peaks broaden
  const MW_IN = [10.9, 11.5]; // the microwaves travel in to the biradical
  const MW = [12.1, 13.1];    // … then DNP lifts the signal far above the noise
  // The last step: first the correlation joining two peaks, then the contact it comes from,
  // with its distance, on the strand.
  const LINK = [13.85, 14.65]; // the arc joining the two peaks draws in
  const DIST = [14.85, 15.75]; // … then the methyl–methyl contact and its distance appear
  const BACK = [17.95, 19.15]; // fade back to the start
  const HOLD = [15.9, 17.8];   // the finished state; reduced-motion visitors see a moment from it (STILL, below)

  // The contact shown in the last step. Schematic: swap in a real methyl pair and
  // distance from the paper if you like.
  const DISTANCE = '≈ 4 Å';
  const PEAKS = [3, 6];       // the two peaks it links (indices into SITES below)

  /* ---- the strand: rungs of nuclei round a cylinder, with a gentle twist ---- */
  const RUNGS = 16, PER = 6, TWIST = 0.26;
  const nuc = [];
  for (let k = 0; k < RUNGS; k++) {
    for (let j = 0; j < PER; j++) {
      nuc.push({
        u: k / (RUNGS - 1),                                            // along the strand, 0 … 1
        a: (j / PER) * 2 * Math.PI + k * TWIST + (rand() - 0.5) * 0.5, // angle round it
        methyl: false,
        delay: rand(),                                                 // when it turns into ²H
        // thermal jiggle at 298 K: a whole number of wobbles per loop, so the restart is seamless
        wf: (7 + Math.floor(rand() * 7)) / CYCLE, wp: rand() * 2 * Math.PI,
        x: 0, y: 0, z: 0                                               // projected each frame
      });
    }
  }
  // Sparse ¹³CHD₂ methyls: one on every other rung, at a random place round it.
  for (let k = 1; k < RUNGS; k += 2) nuc[k * PER + Math.floor(rand() * PER)].methyl = true;

  // Dense ¹H–¹H couplings: round each rung and across to the next one.
  const at = (k, j) => nuc[k * PER + (((j % PER) + PER) % PER)];
  const links = [];
  for (let k = 0; k < RUNGS; k++) {
    for (let j = 0; j < PER; j++) {
      links.push([at(k, j), at(k, j + 1)]);
      if (k + 1 < RUNGS) links.push([at(k, j), at(k + 1, j)]);
    }
  }
  // Weaker, longer-range couplings between neighbouring methyls on the same side.
  const methyls = nuc.filter(n => n.methyl), weak = [];
  for (let m = 0; m + 1 < methyls.length; m++) {
    const d = Math.abs(methyls[m].a - methyls[m + 1].a) % (2 * Math.PI);
    if (Math.min(d, 2 * Math.PI - d) < 1.4) weak.push([methyls[m], methyls[m + 1]]);
  }
  // The contact for the last step: the pair of neighbouring methyls nearest the middle of the strand.
  const middle = ([p, q]) => Math.abs((p.u + q.u) / 2 - 0.55);
  const contact = (weak.length ? weak : [[methyls[3], methyls[4]]]).reduce((best, pq) => (middle(pq) < middle(best) ? pq : best));

  /* ---- the biradical, after M-TinyPol: two nitroxide rings joined by a short linker. One
     side is the nitroxide ring between two spiro rings (three six-membered rings); the other
     is a single nitroxide ring with its gem-dimethyl groups.
     Built once in units of one bond length, centred on (0, 0). */
  const MOL = (() => {
    const bonds = [], oxygens = [];
    const hex = (cx, cy, r, rot) => Array.from({ length: 6 }, (_, i) => [cx + r * Math.cos(rot + (i * Math.PI) / 3), cy + r * Math.sin(rot + (i * Math.PI) / 3)]);
    const ring = pts => pts.forEach((p, i) => bonds.push([p, pts[(i + 1) % 6]]));
    // One nitroxide ring centred on (cx, cy), its N on the left (side -1) or right (+1), with
    // spiro rings or two methyls on each carbon beside the N. Returns C4, opposite the N.
    function nitroxide(cx, cy, side, spiro) {
      const pts = hex(cx, cy, 1, 0);
      ring(pts);
      const N = side < 0 ? pts[3] : pts[0];
      for (const v of side < 0 ? [pts[2], pts[4]] : [pts[1], pts[5]]) {   // the carbons beside the N
        const dx = v[0] - cx, dy = v[1] - cy;                               // unit vector, out from the ring
        if (spiro) ring(hex(v[0] + dx * 0.9, v[1] + dy * 0.9, 0.9, Math.atan2(-dy, -dx)));
        else for (const turn of [-0.9, 0.9]) {
          const c = Math.cos(turn), s = Math.sin(turn);
          bonds.push([v, [v[0] + 0.8 * (dx * c - dy * s), v[1] + 0.8 * (dx * s + dy * c)]]);
        }
      }
      const O = [N[0] + side, N[1]];
      bonds.push([N, O]); oxygens.push(O);
      return side < 0 ? pts[0] : pts[3];
    }
    const c4a = nitroxide(-2.2, 0, -1, true);
    const nh = [c4a[0] + 0.866, c4a[1] - 0.5], ch2 = [nh[0] + 0.866, nh[1] + 0.5], c4b = [ch2[0] + 0.866, ch2[1] - 0.5];
    bonds.push([c4a, nh], [nh, ch2], [ch2, c4b]);
    nitroxide(c4b[0] + 1, c4b[1], 1, false);
    const all = bonds.flat();
    const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    const ox = (Math.min(...xs) + Math.max(...xs)) / 2, oy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const shift = p => [p[0] - ox, p[1] - oy];
    return {
      bonds: bonds.map(([p, q]) => [shift(p), shift(q)]),
      oxygens: oxygens.map(shift),
      w: Math.max(...xs) - Math.min(...xs),
      h: Math.max(...ys) - Math.min(...ys)
    };
  })();

  /* ---- the ¹H spectrum ---- */
  // Methyl ¹H sites: shift (ppm) and relative area. Schematic, not measured.
  const SITES = [[1.43, 0.8], [1.29, 1.0], [1.12, 0.7], [0.95, 1.0], [0.82, 0.85], [0.68, 1.0], [0.54, 0.6], [0.38, 0.8]];
  const PPM_L = 1.9, PPM_R = -0.1;   // NMR convention: ppm falls to the right
  const ETA = 0.25;                  // Lorentzian share of each line; the rest is Gaussian
  function lineAt(ppm, fwhm) {       // unit area per site
    const g = (2 / fwhm) * Math.sqrt(Math.LN2 / Math.PI), k = (4 * Math.LN2) / (fwhm * fwhm), hw = fwhm / 2;
    let y = 0;
    for (const [c, a] of SITES) {
      const d = ppm - c;
      y += a * ((1 - ETA) * g * Math.exp(-k * d * d) + (ETA * hw) / (Math.PI * (d * d + hw * hw)));
    }
    return y;
  }
  function peakOf(fwhm) {
    let m = 0;
    for (let i = 0; i < 800; i++) m = Math.max(m, lineAt(PPM_L + ((PPM_R - PPM_L) * i) / 799, fwhm));
    return m;
  }
  // The six states: linewidth (ppm) and signal size. Sizes are set from how tall the
  // tallest point is drawn (1 = top of the plot); where a size carries over, only the
  // linewidth changes and the signal's area stays the same.
  //            298 K   100 K   ²H     40 kHz  +radical  +μw
  const FW =  [0.17,  0.48,   0.14,  0.055,  0.105,    0.105];
  const NORM = 1 / peakOf(FW[5]);
  const sized = (height, fwhm) => height / (peakOf(fwhm) * NORM);
  const A0 = sized(0.44, FW[0]);   // fully protonated: plenty of ¹H
  const A2 = sized(0.26, FW[2]);   // diluted: fewer ¹H, but narrower lines
  // The radical broadens the lines (same signal, spread wider); DNP then lifts the signal
  // and, drawn to the same height, the noise and the dashed reference shrink to NOISE_DNP.
  const AMP = [A0, A0, A2, A2, A2, 1];
  const NOISE_DNP = 0.15;

  // Noise: fixed (so it doesn't flicker), lightly smoothed, unit spread. The same size throughout.
  const NN = 640;
  const noise = (() => {
    const raw = Array.from({ length: NN + 4 }, () => { let s = 0; for (let k = 0; k < 6; k++) s += rand(); return (s - 3) * Math.SQRT2; });
    const out = new Float32Array(NN), kern = [1, 2, 3, 2, 1];
    for (let i = 0; i < NN; i++) { let v = 0; for (let k = 0; k < 5; k++) v += kern[k] * raw[i + k]; out[i] = v / Math.sqrt(19); }
    return out;
  })();
  const noiseAt = f => { const x = f * (NN - 1), i = Math.min(NN - 2, Math.floor(x)); return noise[i] + (noise[i + 1] - noise[i]) * (x - i); };

  /* ---- spinning: 12 kHz, then 40 kHz, then back to 12 kHz as the loop resets ----
     `spun(s)` is the time integral of the 40 kHz switch, so the angle stays smooth. The
     speeds keep the real 40 : 12 ratio and are chosen so each loop ends a whole number of
     turns round, and the restart doesn't jump. */
  const [ma, mb] = MAS, [ba, bb] = BACK;
  function spun(s) {
    if (s < ma) return 0;
    if (s < mb) { const u = (s - ma) / (mb - ma); return (mb - ma) * (u ** 3 - u ** 4 / 2); }
    const held = (mb - ma) / 2 + Math.min(s, ba) - mb;
    if (s < ba) return held;
    const v = Math.min(1, (s - ba) / (bb - ba));
    return held + (bb - ba) * (v - v ** 3 + v ** 4 / 2);
  }
  const RATIO = 40 / 12, TURNS = 3;
  const F0 = TURNS / (CYCLE + (RATIO - 1) * spun(CYCLE)), F1 = RATIO * F0;   // turns per second

  // The reduced-motion still: the moment in the finished state when the contact faces the viewer.
  const STILL = (() => {
    let best = HOLD[0], bestZ = -2;
    for (let s = HOLD[0]; s <= HOLD[1]; s += 0.02) {
      const spin = 2 * Math.PI * (F0 * s + (F1 - F0) * spun(s));
      const z = Math.sin(contact[0].a + spin) + Math.sin(contact[1].a + spin);
      if (z > bestZ) { bestZ = z; best = s; }
    }
    return Math.round(best * 100) / 100;
  })();

  // Readouts across the top: [before, after], in a wide and a narrow form.
  const READOUTS = {
    wide: [['298 K', '100 K'], ['protonated', '²H · ¹³CHD₂'], ['12 kHz MAS', '40 kHz MAS']],
    narrow: [['298 K', '100 K'], ['protonated', '¹³CHD₂'], ['12 kHz', '40 kHz']]
  };

  function dot(ctx, x, y, r, colour, alpha) {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha; ctx.fillStyle = colour;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  function pill(ctx, x, y, w, h) {   // a filled rounded bar, fully rounded ends
    const r = h / 2;
    ctx.beginPath();
    ctx.arc(x + r, y + r, r, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.closePath(); ctx.fill();
  }
  function molecule(ctx, th, cx, cy, s, alpha) {
    ctx.globalAlpha = alpha; ctx.strokeStyle = th.soft; ctx.lineWidth = 1; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (const [p, q] of MOL.bonds) { ctx.moveTo(cx + p[0] * s, cy + p[1] * s); ctx.lineTo(cx + q[0] * s, cy + q[1] * s); }
    ctx.stroke();
    // the two N–O• radicals: the unpaired electrons the microwaves drive
    for (const p of MOL.oxygens) dot(ctx, cx + p[0] * s, cy + p[1] * s, Math.max(1.8, s * 0.4), th.fid, alpha);
    ctx.globalAlpha = 1;
  }
  function spectrum(ctx, x0, x1, base, top, fwhm, amp, sigma, M) {
    ctx.beginPath();
    for (let i = 0; i < M; i++) {
      const f = i / (M - 1);
      const y = base - amp * NORM * lineAt(PPM_L + (PPM_R - PPM_L) * f, fwhm) * (base - top) - sigma * noiseAt(f);
      i ? ctx.lineTo(x0 + f * (x1 - x0), y) : ctx.moveTo(x0, y);
    }
    ctx.stroke();
  }

  Anim.register('proton-dnp-2026', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const pad = Math.max(14, w * 0.05);
    const x0 = pad, x1 = w - pad, ly = pad + 9;

    const s = t % CYCLE;
    const back = between(s, ...BACK), keep = 1 - back;
    const cool = between(s, ...COOL), dil = between(s, ...DIL), mas = between(s, ...MAS), rad = between(s, ...RAD);
    const radIn = between(s, ...RAD_IN), mwIn = between(s, ...MW_IN), mwUp = between(s, ...MW);

    /* ---- layout: microwaves and biradical on the left, strand on the right, spectrum below ---- */
    const R = h * 0.1, cy = h * 0.34, tilt = 0.42, lean = R * Math.sin(tilt);
    const left = (x1 - x0) * 0.38;
    const ms = Math.min(h * 0.023, (left * 0.6) / MOL.w);         // bond length of the drawn molecule
    const mx = x0 + left - (MOL.w * ms) / 2 - 2;
    const xa = x0 + left + lean + 4, xb = x1 - lean;

    /* ---- strand ---- */
    const d = dil * keep, warm = 1 - cool * keep;
    const spin = 2 * Math.PI * (F0 * s + (F1 - F0) * spun(s));
    const rH = Math.min(2.8, Math.max(1.5, h * 0.0068));
    const jiggle = warm * rH * 0.7;                                 // thermal motion, frozen out at 100 K
    for (const n of nuc) {
      const ang = n.a + spin, ph = 2 * Math.PI * n.wf * s + n.wp;
      n.z = Math.sin(ang);                                          // +1 is nearest the viewer
      n.x = xa + n.u * (xb - xa) + lean * n.z + jiggle * Math.sin(ph);
      n.y = cy - R * Math.cos(ang) + jiggle * Math.cos(1.3 * ph);
    }
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xa, cy - R); ctx.lineTo(xb, cy - R);
    ctx.moveTo(xa, cy + R); ctx.lineTo(xb, cy + R);
    ctx.stroke();
    for (const ex of [xa, xb]) { ctx.beginPath(); ctx.ellipse(ex, cy, lean, R, 0, 0, Math.PI * 2); ctx.stroke(); }

    const gone = n => (n.methyl ? 0 : ease((d - n.delay * 0.6) / 0.4));   // how far it has become ²H
    const depth = n => 0.3 + (0.7 * (n.z + 1)) / 2;

    // couplings: blue, the "before"; they vanish with the protons
    ctx.strokeStyle = th.fid; ctx.lineWidth = 1;
    for (const [p, q] of links) {
      const a = (0.55 * (1 - gone(p)) * (1 - gone(q)) * (depth(p) + depth(q))) / 2;
      if (a <= 0.01) continue;
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
    // the weak couplings left between methyls, averaged away by fast spinning
    ctx.setLineDash([2, 3]);
    for (const [p, q] of weak) {
      const a = (0.6 * d * (1 - 0.92 * mas * keep) * (depth(p) + depth(q))) / 2;
      if (a <= 0.01) continue;
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    }
    ctx.setLineDash([]);

    // nuclei, back half first; methyl ¹H turn orange, and grow a little once hyperpolarised
    for (const front of [false, true]) {
      for (const n of nuc) {
        if ((n.z >= 0) !== front) continue;
        const a = depth(n);
        if (n.methyl) {
          const r = rH * (1 + 0.5 * d) * (1 + 0.3 * mwUp * keep);
          dot(ctx, n.x, n.y, r, th.ink, a * (1 - d));
          dot(ctx, n.x, n.y, r, th.spec, a * d);
        } else {
          const g = gone(n), r = rH * (1 - 0.5 * g);
          dot(ctx, n.x, n.y, r, th.ink, a * (1 - g));
          dot(ctx, n.x, n.y, r, th.muted, a * g * 0.55);
        }
      }
    }
    ctx.globalAlpha = 1;

    // the last step: one methyl–methyl contact lights up, with its distance
    const reach = between(s, DIST[0], DIST[0] + 0.6) * keep, tag = between(s, DIST[0] + 0.4, DIST[1]) * keep;
    if (reach > 0) {
      const [p, q] = contact, a = (depth(p) + depth(q)) / 2;
      const ring = rH * 1.95 + 2.5;                                 // just outside a grown methyl dot
      ctx.strokeStyle = th.ink; ctx.lineWidth = 1.4;
      for (const n of contact) {
        ctx.globalAlpha = Math.min(1, reach * 2) * depth(n);
        ctx.beginPath(); ctx.arc(n.x, n.y, ring, 0, Math.PI * 2); ctx.stroke();
      }
      const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy);
      if (L > 2 * ring) {                                           // from ring edge to ring edge, drawn out from p
        const ux = dx / L, uy = dy / L, sx = p.x + ux * ring, sy = p.y + uy * ring, run = (L - 2 * ring) * reach;
        ctx.globalAlpha = a; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + ux * run, sy + uy * run); ctx.stroke();
      }
      if (tag > 0) {
        // to the right of the pair, or to its left if the right side has no room (decided
        // from the strand's layout, not the spin, so it doesn't swap sides as it turns)
        ctx.font = `12px ${th.mono}`;
        const lw = ctx.measureText(DISTANCE).width;
        const right = xa + Math.max(p.u, q.u) * (xb - xa) + lean + ring + 5 + lw <= x1;
        const lx = right ? Math.max(p.x, q.x) + ring + 5 : Math.min(p.x, q.x) - ring - 5;
        ctx.globalAlpha = tag * (0.5 + 0.5 * a);
        Anim.label(ctx, th, DISTANCE, lx, (p.y + q.y) / 2, right ? 'left' : 'right', th.ink);
      }
      ctx.globalAlpha = 1;
    }

    /* ---- the biradical drifts in and docks beside the strand ---- */
    ctx.font = `12px ${th.mono}`;
    const there = ease(Math.min(1, radIn / 0.75)) * keep;
    const molBottom = cy + (MOL.h * ms) / 2;
    if (there > 0) {
      const drift = (1 - radIn) * R * 0.9 + back * R * 0.4;
      molecule(ctx, th, mx, cy + drift, ms, there);
      const lw = ctx.measureText('biradical').width;
      const lx = Math.max(x0 + lw / 2, Math.min(mx, xa - lean - 6 - lw / 2));
      ctx.globalAlpha = there;
      Anim.label(ctx, th, 'biradical', lx, molBottom + 10 + drift, 'center');
      ctx.globalAlpha = 1;
    }

    /* ---- microwaves travel in to the biradical and stay on ---- */
    if (mwIn > 0 && keep > 0) {
      const xw0 = x0, xw1 = mx - (MOL.w * ms) / 2 - 3;
      const steps = Math.max(2, Math.round((xw1 - xw0) * mwIn));
      const amp = Math.min(R * 0.3, ms * 1.4), lam = Math.max(10, w * 0.035);
      ctx.globalAlpha = keep; ctx.strokeStyle = th.fid; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const x = xw0 + i, y = cy - amp * Math.sin(2 * Math.PI * ((x - xw0) / lam - 0.9 * s));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      const word = ctx.measureText('microwaves').width <= xw1 - x0 ? 'microwaves' : 'μw';
      ctx.globalAlpha = keep * mwIn;
      Anim.label(ctx, th, word, x0, cy - R * 0.85, 'left', th.fid);
      ctx.globalAlpha = 1;
    }

    /* ---- spectrum ---- */
    const top = Math.max(h * 0.53, molBottom + 22), base = h - pad - 20;
    const p = [cool, dil, mas, rad, mwUp];
    let lf = Math.log(FW[0]), la = Math.log(AMP[0]);
    p.forEach((v, k) => {
      lf += v * (Math.log(FW[k + 1]) - Math.log(FW[k]));
      la += v * (Math.log(AMP[k + 1]) - Math.log(AMP[k]));
    });
    const sigma = Math.max(1.2, 0.02 * (base - top));                // the noise, until DNP
    // DNP: drawn to the same height, everything on the old scale (the noise and the dashed
    // reference) shrinks to NOISE_DNP of its size as the signal grows
    const shrink = 1 - (1 - NOISE_DNP) * mwUp * keep;
    const noisy = sigma * shrink;
    const M = Math.max(120, Math.round((x1 - x0) / 1.5));

    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, Math.round(base) + 0.5); ctx.lineTo(x1, Math.round(base) + 0.5); ctx.stroke();
    Anim.label(ctx, th, '800 MHz', x0, base + 14, 'left');
    Anim.label(ctx, th, '¹H (ppm)', x1, base + 14, 'right');

    // the broad line of the protonated sample at 100 K, left behind as a dashed ghost
    const ghost = ease(Math.min(1, dil * 3)) * keep;
    if (ghost > 0) {
      ctx.globalAlpha = ghost; ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
      spectrum(ctx, x0, x1, base, top, FW[1], AMP[1] * shrink, 0, M);
      ctx.setLineDash([]);
    }
    ctx.strokeStyle = th.spec; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.globalAlpha = keep; spectrum(ctx, x0, x1, base, top, Math.exp(lf), Math.exp(la), noisy, M);
    if (back > 0) { ctx.globalAlpha = back; spectrum(ctx, x0, x1, base, top, FW[0], AMP[0], sigma, M); }
    ctx.globalAlpha = 1;

    // the two peaks the contact links, joined as a ¹H–¹H correlation would show them
    const link = between(s, ...LINK) * keep;
    if (link > 0) {
      const fw = Math.exp(lf), am = Math.exp(la);
      const tip = i => {
        const c = SITES[i][0], f = (PPM_L - c) / (PPM_L - PPM_R);
        return [x0 + f * (x1 - x0), base - am * NORM * lineAt(c, fw) * (base - top) - noisy * noiseAt(f) - Math.max(5, h * 0.025)];
      };
      const [A, B] = PEAKS.map(tip);
      const apex = Math.min(A[1], B[1]) - Math.max(6, h * 0.04);
      const cx = (A[0] + B[0]) / 2, cyc = 2 * apex - (A[1] + B[1]) / 2;   // quadratic control point
      ctx.globalAlpha = Math.min(1, link * 3); ctx.strokeStyle = th.ink; ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const u = (i / 40) * link, v = 1 - u;
        const X = v * v * A[0] + 2 * u * v * cx + u * u * B[0], Y = v * v * A[1] + 2 * u * v * cyc + u * u * B[1];
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.stroke();
      const r = Math.max(2, h * 0.008);
      dot(ctx, A[0], A[1], r, th.ink, Math.min(1, link * 3));
      dot(ctx, B[0], B[1], r, th.ink, ease((link - 0.85) / 0.15));
      ctx.globalAlpha = 1;
    }

    /* ---- readouts: temperature, labelling, spinning ----
       A solid ink highlight comes up behind the readout, with the text knocked out of it,
       and the value changes; LEAD seconds later the spectrum and strand respond. The
       highlight stays until that effect has finished. */
    const PX = 8, PH = 22;                                          // highlight padding and height
    const fits = set => set.reduce((sum, [a, b]) => sum + Math.max(ctx.measureText(a).width, ctx.measureText(b).width), 0) + 32 + 2 * PX <= x1 - x0;
    const set = fits(READOUTS.wide) ? READOUTS.wide : READOUTS.narrow;
    const slot = set.map(([a, b]) => Math.max(ctx.measureText(a).width, ctx.measureText(b).width));
    const anchor = [x0 + PX, (x0 + PX + slot[0] + x1 - PX - slot[2]) / 2, x1 - PX], align = ['left', 'center', 'right'];
    [COOL, DIL, MAS].forEach(([a, b], k) => {
      const r = a - LEAD;                                           // when the readout changes
      const q = between(s, r, r + SWAP) * keep, [before, after] = set[k];
      const lit = between(s, r - 0.3, r - 0.02) * (1 - between(s, b + 0.05, b + 0.35));
      if (lit > 0) {
        const hx = align[k] === 'left' ? anchor[k] : align[k] === 'center' ? anchor[k] - slot[k] / 2 : anchor[k] - slot[k];
        ctx.globalAlpha = lit; ctx.fillStyle = th.ink;
        pill(ctx, hx - PX, ly - PH / 2, slot[k] + 2 * PX, PH);
      }
      // the old value fades out, then the new one fades in, so they never overlap;
      // on the highlight the text is drawn in the background colour
      const out = Math.max(0, 1 - 2 * q), into = Math.max(0, 2 * q - 1);
      for (const [text, alpha, colour] of [[before, out, th.soft], [after, into, th.ink]]) {
        if (alpha <= 0) continue;
        ctx.globalAlpha = alpha * (1 - lit); Anim.label(ctx, th, text, anchor[k], ly, align[k], colour);
        ctx.globalAlpha = alpha * lit; Anim.label(ctx, th, text, anchor[k], ly, align[k], th.bg);
      }
      ctx.globalAlpha = 1;
    });
  }, { still: STILL, loop: CYCLE });
})();
