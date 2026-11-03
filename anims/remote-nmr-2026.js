/* ==========================================================================
   remote-nmr-2026: moving NMR infrastructures to remote access.
   A remote experiment is a round trip. The sample goes by courier from the
   user's lab to the facility, where it passes a safety check before going
   into the magnet; the user controls the spectrometer over the network; and
   the data comes back, its FID becoming a spectrum on the user's own screen.
   ========================================================================== */
(function () {
  'use strict';

  const ease = u => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
  const between = (s, a, b) => ease((s - a) / (b - a));
  const clamp = u => Math.max(0, Math.min(1, u));

  /* ---- timing (seconds into the loop) ---- */
  const CYCLE = 14.5;
  // The sample goes by road: up into a delivery truck at the user's lab, driven to the
  // facility's safety check, where it comes out and is checked; the truck then fades away
  // and the sample goes on into the magnet.
  const RISE = [0.6, 1.2];    // the tube goes up into the truck
  const DRIVE = [1.3, 2.6];   // the truck drives to the safety check and stops
  const OUT = [2.7, 3.1];     // the tube comes down out of the truck
  const CHECK = [3.15, 3.6];  // the check: a tick and "safety" appear beside it
  const GONE = [3.7, 4.2];    // the truck fades away
  const ON = [4.2, 5.1];      // the tube goes on along the road to the magnet
  const LOAD = [5.1, 5.7];    // … and into it
  const CTRL = [6.0, 7.4];    // the user's commands travel to the spectrometer
  const FLOW = [7.5, 10.5];   // the FID flows back from the spectrometer and into the user's screen,
                              // where it becomes the spectrum as it arrives
  const BACK = [13.3, 14.1];  // fade back to the start
  const STILL = 12;           // reduced-motion visitors see the whole round trip

  // The spectrum on the laptop: a few peaks, worked out once on a unit scale.
  const N = 160;
  const PEAKS = [[0.2, 0.55], [0.33, 1], [0.47, 0.7], [0.6, 0.85], [0.66, 0.4], [0.8, 0.6]];
  const SPEC = Array.from({ length: N }, (_, i) => {
    const x = i / (N - 1);
    return PEAKS.reduce((y, [c, a]) => y + a / (1 + ((x - c) / 0.018) ** 2), 0);
  });
  const SPEC_MAX = Math.max(...SPEC);

  // A point a fraction u of the way along a polyline.
  function along(pts, u) {
    const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
    let d = clamp(u) * seg.reduce((a, b) => a + b, 0);
    for (let i = 0; i < seg.length; i++) {
      if (d <= seg[i] || i === seg.length - 1) {
        const f = seg[i] ? Math.min(1, d / seg[i]) : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
      }
      d -= seg[i];
    }
    return pts[pts.length - 1];
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  // An NMR tube, centred on (x, y): glass, the sample in its lower part, and a cap.
  function tube(ctx, th, x, y, tw, tl, alpha) {
    if (alpha <= 0.01) return;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
    roundRect(ctx, x - tw / 2, y - tl / 2, tw, tl, tw / 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = th.muted;
    roundRect(ctx, x - tw / 2 + 1, y + tl * 0.05, tw - 2, tl * 0.45 - 1, (tw - 2) / 2); ctx.fill();
    ctx.fillStyle = th.ink;
    ctx.fillRect(x - tw / 2 - 0.5, y - tl / 2 - 3, tw + 1, 4);
    ctx.globalAlpha = 1;
  }
  // A small delivery truck facing right, its wheels on the road at y: a cargo box, a cab
  // with a window, and two wheels. x is the middle of the cargo box.
  function truck(ctx, th, x, y, L, alpha) {
    if (alpha <= 0.01) return;
    const H = L * 0.48, r = H * 0.2, yb = y - r * 1.4;
    const box0 = x - L * 0.325, cab0 = box0 + L * 0.67;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
    roundRect(ctx, box0, yb - H, L * 0.65, H, 1.5); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cab0, yb); ctx.lineTo(cab0, yb - H * 0.7);
    ctx.lineTo(cab0 + L * 0.2, yb - H * 0.7); ctx.lineTo(cab0 + L * 0.33, yb - H * 0.32);
    ctx.lineTo(cab0 + L * 0.33, yb); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();                                          // the cab's window
    ctx.moveTo(cab0 + L * 0.05, yb - H * 0.58); ctx.lineTo(cab0 + L * 0.18, yb - H * 0.58); ctx.lineTo(cab0 + L * 0.26, yb - H * 0.36);
    ctx.lineTo(cab0 + L * 0.05, yb - H * 0.36); ctx.closePath(); ctx.stroke();
    ctx.lineWidth = 1.2;
    for (const wx of [box0 + L * 0.17, cab0 + L * 0.17]) {
      ctx.beginPath(); ctx.arc(wx, y - r, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  Anim.register('remote-nmr-2026', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const s = t % CYCLE;
    const back = between(s, ...BACK), keep = 1 - back;
    const rise = between(s, ...RISE), drive = between(s, ...DRIVE), out = between(s, ...OUT);
    const checked = between(s, ...CHECK) * keep, gone = between(s, ...GONE), on = between(s, ...ON), load = between(s, ...LOAD);
    const ctrl = clamp((s - CTRL[0]) / (CTRL[1] - CTRL[0])), flow = between(s, ...FLOW);

    /* ---- layout: your lab on the left, the facility on the right ---- */
    const sw = w * 0.28, sh = sw * 0.75;                  // laptop screen
    const kb = Math.max(11, sh * 0.24), lean = kb * 0.7;  // depth of the keyboard deck, and how far its sides lean out
    const lcx = Math.max(w * 0.2, sw / 2 + 3 + lean + 12);
    const sx0 = lcx - sw / 2, sx1 = sx0 + sw, sy0 = h * 0.33, sy1 = sy0 + sh;
    const yTop = Math.max(34, h * 0.17);                  // the courier route runs along here
    const tl = Math.max(14, h * 0.075), tw = Math.max(3.5, w * 0.012);   // the tube
    // the magnet, proportioned like a standard-bore NMR magnet: turrets on top, the
    // cryostat body, then a base plate on long legs, with the probe column below
    const yT = yTop + 14, yF = h - 26;                    // turret tops, floor
    const bodyH = (yF - yT) / 1.85, turretH = bodyH * 0.3;   // turrets 0.3, body 1, legs 0.55 (of the body's height)
    const bw = Math.min(bodyH / 1.3, w * 0.2), legW = bw * 0.2;
    const mx = w - Math.max(14, w * 0.05) - (bw / 2 + legW * 0.85 + 2);
    const my0 = yT + turretH, my1 = my0 + bodyH, mcy = my0 + bodyH * 0.55;   // body top, bottom, magnetic centre
    const coreTop = my0 - turretH * 0.6;                  // the central (bore) tower, where the sample goes in
    // the legs stand just outside the body, their tops cut at an angle: high against the body, lower outside
    const legX = bw / 2 + legW * 0.2, legIn = my0 + bodyH * 0.7, legOut = legIn + legW * 0.55;
    const yCtrl = sy0 + sh * 0.4, yData = sy0 + sh * 0.72;
    // the network lines run from the laptop to the magnet: to its body, or to a leg at that height
    const meet = y => (y >= legIn ? mx - legX - legW / 2 - 3 : mx - bw / 2 - 3);
    const rx0 = sx1 + 6, rxC = meet(yCtrl), rxD = meet(yData);
    // the FID: it leaves the magnet, travels the data line and flows into the screen in one
    // smooth movement; the spectrum is drawn as it arrives
    const L = Math.min((rxD - rx0) * 0.42, w * 0.14), A = Math.max(4, h * 0.03);
    const lead = rxD - flow * (rxD - rx0 + L);            // its leading edge (where the FID starts)
    const show = clamp((rx0 - lead) / L);                 // how much of it has reached the screen

    /* ---- the laptop ---- */
    ctx.lineJoin = 'round';
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    roundRect(ctx, sx0, sy0, sw, sh, 4); ctx.fill(); ctx.stroke();
    // the keyboard deck, seen from a little above: a shallow trapezoid with a grid of keys
    // (wider towards the front, as in perspective), a space bar, and a trackpad
    const deck = f => [sx0 - 3 - lean * f, sx1 + 3 + lean * f];   // its edges, a fraction f of the way to the front
    const dy = f => sy1 + 1 + (kb - 1) * f;
    ctx.beginPath();
    ctx.moveTo(deck(0)[0], dy(0)); ctx.lineTo(deck(0)[1], dy(0));
    ctx.lineTo(deck(1)[1], dy(1)); ctx.lineTo(deck(1)[0], dy(1)); ctx.closePath();
    ctx.fill(); ctx.stroke();
    const rows = kb >= 26 ? 4 : kb >= 14 ? 3 : 2, cols = sw >= 90 ? 12 : 9;
    const kTop = 0.12, kBot = 0.64, rowF = (kBot - kTop) / rows;
    ctx.fillStyle = th.muted; ctx.globalAlpha = 0.6;
    for (let r = 0; r < rows; r++) {
      const f0 = kTop + r * rowF + rowF * 0.14, f1 = f0 + rowF * 0.72;
      const [lm, rm] = deck((f0 + f1) / 2), inset = (rm - lm) * 0.07;
      const span = rm - lm - 2 * inset, gap = Math.max(0.8, span * 0.012), kw = (span - (cols - 1) * gap) / cols;
      const y0 = dy(f0), kh = dy(f1) - y0, x = c => lm + inset + c * (kw + gap);
      for (let c = 0; c < cols; c++) {
        if (r === rows - 1 && c > 2 && c < cols - 3) continue;   // the space bar's place
        ctx.fillRect(x(c), y0, kw, kh);
      }
      if (r === rows - 1) ctx.fillRect(x(3), y0, x(cols - 3) - gap - x(3), kh);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
    const padW = sw * 0.24;
    roundRect(ctx, lcx - padW / 2, dy(0.72), padW, Math.max(1.5, dy(0.93) - dy(0.72)), 1.5); ctx.stroke();
    ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    // the screen's plot: a baseline, and the spectrum once the data arrives
    const px0 = sx0 + 7, px1 = sx1 - 7, pb = sy1 - 8, pt = sy0 + 9;
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px0, Math.round(pb) + 0.5); ctx.lineTo(px1, Math.round(pb) + 0.5); ctx.stroke();
    const drawn = show * keep;
    if (drawn > 0) {
      const upto = Math.max(2, Math.round(show * N));
      ctx.globalAlpha = keep; ctx.strokeStyle = th.spec; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < upto; i++) {
        const X = px0 + (i / (N - 1)) * (px1 - px0), Y = pb - (SPEC[i] / SPEC_MAX) * (pb - pt);
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* ---- the magnet ---- */
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.2;
    const box = (x, y, bwid, bh, r = 1) => { roundRect(ctx, x, y, bwid, bh, Math.min(r, bwid / 2, bh / 2)); ctx.fill(); ctx.stroke(); };
    const footH = Math.max(2, bodyH * 0.025), plateH = Math.max(3, bodyH * 0.04);
    // the probe column in the middle, under the base plate
    const colW = bw * 0.15, colEnd = yF - bodyH * 0.08;
    box(mx - colW / 2, my1, colW, colEnd - footH - my1);
    box(mx - colW * 0.8, colEnd - footH, colW * 1.6, footH);
    box(mx - bw / 2 - 1, my1 - plateH * 0.3, bw + 2, plateH);                      // base plate
    // the cryostat body, with rounded shoulders and a flange near the top
    box(mx - bw / 2, my0, bw, bodyH, bw * 0.14);
    ctx.beginPath();
    for (const dy of [0.085, 0.11]) { ctx.moveTo(mx - bw / 2, my0 + bodyH * dy); ctx.lineTo(mx + bw / 2, my0 + bodyH * dy); }
    ctx.stroke();
    // turrets: two tall ones, and the central bore tower between them
    const capH = Math.max(2, bodyH * 0.035);
    for (const sgn of [-1, 1]) {
      const tx = mx + sgn * bw * 0.28, tW = bw * 0.13;
      box(tx - tW / 2, yT + capH, tW, my0 - yT - capH + 1);
      box(tx - tW * 0.8, yT, tW * 1.6, capH);
    }
    const cW = bw * 0.12;
    box(mx - cW / 2, coreTop + capH, cW, my0 - coreTop - capH + 1);
    box(mx - cW * 0.8, coreTop, cW * 1.6, capH);
    // the legs, in front of the body: a wide sleeve with an angled top, then a narrower post and a foot
    const sleeveEnd = my1 + (yF - my1) * 0.3;
    for (const sgn of [-1, 1]) {
      const xin = mx + sgn * (legX - legW / 2), xout = mx + sgn * (legX + legW / 2);
      box(mx + sgn * legX - legW * 0.3, sleeveEnd - 1, legW * 0.6, yF - footH - sleeveEnd + 1);
      box(mx + sgn * legX - legW * 0.65, yF - footH, legW * 1.3, footH);
      ctx.beginPath();
      ctx.moveTo(xin, legIn); ctx.lineTo(xout, legOut); ctx.lineTo(xout, sleeveEnd); ctx.lineTo(xin, sleeveEnd); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);   // the bore, down to the magnetic centre
    ctx.beginPath(); ctx.moveTo(mx, coreTop); ctx.lineTo(mx, mcy + tl * 0.6); ctx.stroke();
    ctx.setLineDash([]);

    /* ---- the road to the facility, with its safety check ---- */
    const start = [sx1 - sw * 0.2, sy0 - tl / 2 - 5];
    const route = [start, [start[0], yTop], [mx, yTop], [mx, coreTop - tl / 2 - 3]];
    ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    // drawn all the way down to the top of the bore tower, so it runs on into the bore without a gap
    // (the tube itself stops a little above, at route[3], before it goes in)
    const road = [...route.slice(0, 3), [mx, coreTop]];
    ctx.beginPath(); road.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.setLineDash([]);
    const TL = Math.max(18, w * 0.06);                         // the truck's length
    const ckx = mx - Math.max(40, w * 0.17);                  // the safety check, on the road
    const truckX = start[0] + (ckx - start[0]) * drive;        // the middle of its cargo box
    const outY = yTop + tl / 2 + 3;                           // where the tube waits while it's checked, just below the road
    ctx.strokeStyle = th.muted; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(ckx, yTop - 5); ctx.lineTo(ckx, yTop + 5); ctx.stroke();
    if (checked > 0) {                                        // the tick draws itself beside the tube, then "safety"
      const cx = ckx - tw / 2 - 11;
      ctx.globalAlpha = Math.min(1, checked * 3); ctx.strokeStyle = th.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
      const a = [cx - 5, outY], b = [cx - 1.5, outY + 3.5], c = [cx + 5, outY - 5];
      ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      if (checked < 0.4) ctx.lineTo(a[0] + (b[0] - a[0]) * checked / 0.4, a[1] + (b[1] - a[1]) * checked / 0.4);
      else { ctx.lineTo(b[0], b[1]); const g = (checked - 0.4) / 0.6; ctx.lineTo(b[0] + (c[0] - b[0]) * g, b[1] + (c[1] - b[1]) * g); }
      ctx.stroke(); ctx.lineCap = 'butt';
      ctx.globalAlpha = checked;
      Anim.label(ctx, th, 'safety', cx - 10, outY, 'right', th.ink);
      ctx.globalAlpha = 1;
    }
    Anim.label(ctx, th, 'sample', start[0] - TL * 0.35 - 6, yTop - 11, 'right');

    // the tube: at the lab, up into the truck, down out of it at the safety check, then on along the
    // road and into the magnet. The truck, drawn after it, hides it while it's inside; going in
    // and out, only the part below the truck's floor shows. Both are back at the lab as the loop resets.
    const floor = yTop - TL * 0.48 * 0.2 * 1.4, inTruck = floor - tl / 2 - 1;
    const belowFloor = draw => { ctx.save(); ctx.beginPath(); ctx.rect(0, floor, w, h - floor); ctx.clip(); draw(); ctx.restore(); };
    const onward = [[ckx, outY], [ckx, yTop], [mx, yTop], route[3]];
    if (load > 0) tube(ctx, th, mx, route[3][1] + (mcy - route[3][1]) * load, tw, tl, keep);
    else if (on > 0) { const [x, y] = along(onward, on); tube(ctx, th, x, y, tw, tl, keep); }
    else if (out > 0) belowFloor(() => tube(ctx, th, ckx, inTruck + (outY - inTruck) * out, tw, tl, keep));
    else if (drive === 0) belowFloor(() => tube(ctx, th, start[0], start[1] + (inTruck - start[1]) * rise, tw, tl, rise > 0 ? keep : 1));
    truck(ctx, th, truckX, yTop, TL, keep * (1 - gone));
    if (back > 0) {
      tube(ctx, th, start[0], start[1], tw, tl, back);
      truck(ctx, th, start[0], yTop, TL, back);
    }

    /* ---- control: the user's commands travel to the spectrometer ---- */
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx0, Math.round(yCtrl) + 0.5); ctx.lineTo(rxC, Math.round(yCtrl) + 0.5);
    ctx.moveTo(rx0, Math.round(yData) + 0.5); ctx.lineTo(rxD, Math.round(yData) + 0.5);
    ctx.stroke();
    const chev = (x, a) => {
      if (a <= 0.01) return;
      const c = Math.max(3, h * 0.014);
      ctx.globalAlpha = a; ctx.strokeStyle = th.fid; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x - c, yCtrl - c); ctx.lineTo(x, yCtrl); ctx.lineTo(x - c, yCtrl + c); ctx.stroke();
    };
    for (let k = 0; k < 3; k++) {                             // three commands, one after another
      const u = clamp((ctrl - k * 0.18) / 0.64);
      if (u > 0 && u < 1) chev(rx0 + 8 + (rxC - rx0 - 8) * u, keep * Math.min(1, (1 - u) * 6));
      chev(rx0 + (rxC - rx0) * (0.3 + 0.2 * k), 0.45 * keep * clamp((ctrl - 0.9) * 10));   // the open link, afterwards
    }
    ctx.globalAlpha = 1;
    Anim.label(ctx, th, 'control', (rx0 + rxC) / 2, yCtrl - 11, 'center');
    Anim.label(ctx, th, 'data', (rx0 + rxD) / 2, yData + 12, 'center');

    /* ---- data: the FID travels back, turning from blue to orange on the way ---- */
    const grad = ctx.createLinearGradient(rxD, 0, rx0, 0);
    grad.addColorStop(0, th.fid); grad.addColorStop(1, th.spec);
    if (flow > 0 && show < 1 && keep > 0) {
      ctx.save();
      // only the part between the magnet and the screen shows: it comes out of one and goes into the other
      ctx.beginPath(); ctx.rect(rx0, yData - A - 2, rxD - rx0, 2 * A + 4); ctx.clip();
      ctx.globalAlpha = keep; ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const u = i / 80, X = lead + u * L;
        const Y = yData - A * Math.exp(-3 * u) * Math.cos(2 * Math.PI * 4.5 * u);
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.stroke();
      ctx.restore();
    }
    // the data link lights up behind the FID as it travels, and stays lit
    const tail = Math.max(rx0, lead + L);
    if (flow > 0 && keep > 0 && tail < rxD) {
      ctx.globalAlpha = 0.8 * keep; ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(tail, yData); ctx.lineTo(rxD, yData); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* ---- where each end is ---- */
    ctx.font = `12px ${th.mono}`;
    const you = ctx.measureText('your lab').width / 2 + 12 <= lcx ? 'your lab' : 'lab';
    Anim.label(ctx, th, you, lcx, sy1 + kb + 12, 'center');
    Anim.label(ctx, th, 'facility', mx, yF + 12, 'center');
  }, { still: STILL, loop: CYCLE });
})();
