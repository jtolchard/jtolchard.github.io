/* ==========================================================================
   Small canvas animations a publication can use instead of an image.
   Use one with  media: { type: "animation", name: "precession" }

   Built in (below): precession, rotor, contour, pulse.
   Your own: put each in its own file, anims/<name>.js, which calls
     Anim.register("<name>", function (ctx, w, h, t, th) { ... })
       ctx = 2D canvas context, w/h = size in CSS pixels, t = seconds,
       th  = theme colours (th.ink, th.fid, th.spec, th.muted, th.rule, ...)
   then set  media: { type: "animation", name: "<name>" }  on the paper.
   The file is loaded the first time that paper is shown; nothing else needs
   adding to the page. See anims/README.md for the full brief, and
   anims/preview.html?name=<name> to try one out.

   Animations only run while on screen, and hold still (at t = 3.1 s) for
   visitors who have asked their system to reduce motion.
   ========================================================================== */
(function (global) {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');
  const registry = {};
  const loading = {};

  function register(name, fn) { registry[name] = fn; }

  // Resolves true once an animation is ready: at once for one already
  // registered, otherwise after loading <base><name>.js (once per name).
  function load(name, base = 'anims/') {
    if (registry[name]) return Promise.resolve(true);
    if (typeof name !== 'string' || !/^[\w-]+$/.test(name)) return Promise.resolve(false);
    if (!loading[name]) {
      loading[name] = new Promise(resolve => {
        const s = document.createElement('script');
        s.src = `${base}${name}.js`;
        s.onload = () => {
          if (!registry[name]) console.warn(`${s.src} loaded, but didn't register an animation called "${name}"`);
          resolve(!!registry[name]);
        };
        s.onerror = () => { console.warn(`No animation called "${name}" (looked for ${s.src})`); delete loading[name]; resolve(false); };
        document.head.append(s);
      });
    }
    return loading[name];
  }

  // Returns { set(name) } to switch the same canvas to another animation.
  // opts.base: where to look for animation files (default "anims/").
  function mount(canvas, name, opts = {}) {
    let fn = null, want = null;
    let th = Plot.theme();
    let running = false, raf = 0;
    let t0 = performance.now();
    const st = Plot.fitCanvas(canvas, () => paint(performance.now()));

    // paint draws one frame; frame keeps the loop going while on screen.
    // An animation that throws is stopped (and reported) rather than
    // breaking the page.
    function paint(now) {
      if (!st.w || !fn) return;
      try { fn(st.ctx, st.w, st.h, reduce.matches ? 3.1 : (now - t0) / 1000, th); }
      catch (err) { console.error(`Animation "${want}" stopped:`, err); fn = null; }
    }
    function frame(now) {
      paint(now);
      if (running && !reduce.matches) raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
      else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
    }).observe(canvas);
    dark.addEventListener('change', () => { th = Plot.theme(); paint(performance.now()); });
    // Resolves true once it's showing, false if there's no such animation.
    function set(next) {
      want = next;
      fn = registry[next] || null;
      if (!fn) st.ctx.clearRect(0, 0, st.w, st.h); // blank while its file loads
      t0 = performance.now(); paint(t0);
      if (fn) return Promise.resolve(true);
      return load(next, opts.base).then(ok => {
        if (ok && want === next) { fn = registry[next]; t0 = performance.now(); paint(t0); }
        return ok;
      });
    }
    if (name) set(name);
    return { set };
  }

  function label(ctx, th, text, x, y, align = 'left', color) {
    ctx.font = `12px ${th.mono}`;
    ctx.fillStyle = color || th.muted;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  function seeded(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }

  /* ---------- Bloch sphere: 90° pulse, precession, relaxation ---------- */
  register('precession', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const cycle = 7.5, tip = 0.5;
    const tau = t % cycle;
    const T2 = 1.5, T1 = 2.4, nu = 0.9;
    const cx = w * 0.3, cy = h * 0.54, R = Math.min(w * 0.22, h * 0.36);
    const elev = 0.35, az = 0.6;
    const P = (x, y, z) => {
      const X = x * Math.cos(az) - y * Math.sin(az);
      const D = x * Math.sin(az) + y * Math.cos(az);
      return [cx + R * X, cy - R * (z * Math.cos(elev) - D * Math.sin(elev))];
    };
    const M = s => {
      if (s < tip) { const a = (s / tip) * Math.PI / 2; return [0, Math.sin(a), Math.cos(a)]; }
      const u = s - tip, mxy = Math.exp(-u / T2), ph = 2 * Math.PI * nu * u;
      return [-mxy * Math.sin(ph), mxy * Math.cos(ph), 1 - Math.exp(-u / T1)];
    };

    ctx.lineWidth = 1; ctx.strokeStyle = th.rule;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) { const [X, Y] = P(Math.cos(a), Math.sin(a), 0); a ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.stroke();
    const [zx, zy] = P(0, 0, 1.3);
    ctx.strokeStyle = th.muted; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(zx, zy); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, th, 'B₀', zx + 8, zy);

    // trail of the magnetisation tip
    const s0 = Math.max(0, tau - 3);
    let prev = P(...M(s0));
    for (let s = s0 + 0.02; s <= tau; s += 0.02) {
      const p = P(...M(s));
      ctx.globalAlpha = 0.15 + 0.85 * (1 - (tau - s) / 3);
      ctx.strokeStyle = th.fid; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
      prev = p;
    }
    ctx.globalAlpha = 1;
    const [mx, my] = P(...M(tau));
    ctx.strokeStyle = th.spec; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(mx, my); ctx.stroke();
    ctx.fillStyle = th.spec; ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
    label(ctx, th, tau < tip + 0.3 ? '90° pulse' : 'M', mx + 10, my - 6, 'left', th.spec);

    // detected signal: the x-component, which is what the coil sees
    const gx = w * 0.6, gw = w * 0.34, gy = cy, gh = R * 0.75, span = cycle - tip;
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, gy + 0.5); ctx.lineTo(gx + gw, gy + 0.5); ctx.stroke();
    ctx.strokeStyle = th.fid; ctx.lineWidth = 1.4; ctx.beginPath();
    for (let s = tip; s <= tau; s += 0.01) {
      const X = gx + ((s - tip) / span) * gw, Y = gy - M(s)[1] * gh;
      s === tip ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
    }
    ctx.stroke();
    label(ctx, th, 'signal', gx, gy - gh - 10);
  });

  /* ---------- Magic-angle spinning rotor ---------- */
  register('rotor', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5, cy = h * 0.52;
    const L = Math.min(w * 0.32, h * 0.36), r = L * 0.3;
    const theta = (54.74 * Math.PI) / 180;
    const ax = Math.sin(theta), ay = -Math.cos(theta);
    const px = -ay, py = ax;
    const rot = Math.atan2(py, px);

    ctx.strokeStyle = th.muted; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(cx, cy + L * 1.2); ctx.lineTo(cx, cy - L * 1.25); ctx.stroke(); ctx.setLineDash([]);
    label(ctx, th, 'B₀', cx + 8, cy - L * 1.2);

    // angle arc between B0 and rotor axis
    ctx.strokeStyle = th.fid; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, L * 0.55, -Math.PI / 2, -Math.PI / 2 + theta); ctx.stroke();
    label(ctx, th, '54.74°', cx + L * 0.2, cy - L * 0.72, 'left', th.fid);

    const e1 = [cx + ax * L, cy + ay * L], e2 = [cx - ax * L, cy - ay * L];
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(e2[0] + px * r, e2[1] + py * r); ctx.lineTo(e1[0] + px * r, e1[1] + py * r);
    ctx.lineTo(e1[0] - px * r, e1[1] - py * r); ctx.lineTo(e2[0] - px * r, e2[1] - py * r);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(e2[0], e2[1], r, r * 0.32, rot, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // stripes that travel round the rotor as it spins
    const spin = t * 2 * Math.PI * 0.9;
    for (let k = 0; k < 8; k++) {
      const phi = spin + (k * Math.PI * 2) / 8;
      const depth = Math.sin(phi);
      if (depth <= 0) continue;
      const off = Math.cos(phi) * r * 0.96;
      ctx.globalAlpha = 0.25 + 0.75 * depth;
      ctx.strokeStyle = k % 4 === 0 ? th.spec : th.muted; ctx.lineWidth = k % 4 === 0 ? 2.4 : 1.2;
      ctx.beginPath();
      ctx.moveTo(e2[0] + px * off + ax * L * 0.18, e2[1] + py * off + ay * L * 0.18);
      ctx.lineTo(e1[0] + px * off - ax * L * 0.18, e1[1] + py * off - ay * L * 0.18);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = th.surface; ctx.strokeStyle = th.ink; ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.ellipse(e1[0], e1[1], r, r * 0.32, rot, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // drive cap
    const c0 = [e1[0] + ax * 4, e1[1] + ay * 4];
    ctx.fillStyle = th.spec; ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.ellipse(c0[0], c0[1], r * 0.82, r * 0.26, rot, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
    label(ctx, th, 'MAS', e2[0] - px * r - 10, e2[1] - py * r + 14, 'right');
  });

  /* ---------- 2D spectrum, revealed by a sweeping increment ---------- */
  const peaks2D = (() => {
    const rand = seeded(42), out = [];
    for (let i = 0; i < 16; i++) out.push({ x: 0.1 + rand() * 0.8, y: 0.12 + rand() * 0.76, s: 0.025 + rand() * 0.02, a: 0.55 + rand() * 0.45, neg: rand() < 0.15 });
    return out;
  })();
  register('contour', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 42, r: 14, t: 14, b: 30 };
    const pw = w - pad.l - pad.r, ph = h - pad.t - pad.b;
    const cycle = 7, sweep = Math.min(1, (t % cycle) / 4.5);
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.strokeRect(pad.l + 0.5, pad.t + 0.5, pw, ph);
    label(ctx, th, '¹H (ppm)', pad.l + pw, h - 10, 'right');
    ctx.save(); ctx.translate(14, pad.t + ph / 2); ctx.rotate(-Math.PI / 2); label(ctx, th, '¹⁵N (ppm)', 0, 0, 'center'); ctx.restore();

    const sx = pad.l + sweep * pw;
    for (const p of peaks2D) {
      const X = pad.l + p.x * pw, Y = pad.t + p.y * ph;
      const shown = Math.max(0, Math.min(1, (sx - X) / (pw * 0.08) + 0.5));
      if (shown <= 0) continue;
      ctx.strokeStyle = p.neg ? th.fid : th.spec;
      for (const k of [1, 0.7, 0.45, 0.22]) {
        const rx = p.s * pw * k * (0.6 + 0.4 * p.a), ry = rx * 0.75;
        ctx.globalAlpha = shown * (0.35 + 0.65 * (1 - k));
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(X, Y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (sweep < 1) {
      ctx.strokeStyle = th.fid; ctx.globalAlpha = 0.6; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(sx, pad.t); ctx.lineTo(sx, pad.t + ph); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
  });

  /* ---------- Cross-polarisation pulse sequence ---------- */
  register('pulse', function (ctx, w, h, t, th) {
    ctx.clearRect(0, 0, w, h);
    const x0 = 56, x1 = w - 18, span = x1 - x0;
    const yH = h * 0.36, yC = h * 0.74, amp = h * 0.16;
    const cycle = 5.5, cur = Math.min(1, (t % cycle) / 4.2);
    const at = f => x0 + f * span;
    label(ctx, th, '¹H', 18, yH);
    label(ctx, th, '¹³C', 18, yC);
    ctx.strokeStyle = th.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, yH + 0.5); ctx.lineTo(x1, yH + 0.5); ctx.moveTo(x0, yC + 0.5); ctx.lineTo(x1, yC + 0.5); ctx.stroke();

    const block = (y, f0, f1, height, color, text) => {
      const lit = cur >= f0;
      ctx.globalAlpha = lit ? 1 : 0.3;
      ctx.fillStyle = color;
      ctx.fillRect(at(f0), y - height, at(f1) - at(f0), height);
      if (text) label(ctx, th, text, (at(f0) + at(f1)) / 2, y - height - 10, 'center', lit ? th.ink : th.muted);
      ctx.globalAlpha = 1;
    };
    block(yH, 0.04, 0.08, amp, th.ink, '90°');
    block(yH, 0.08, 0.3, amp * 0.6, th.fid, 'CP');
    block(yC, 0.08, 0.3, amp * 0.6, th.fid, 'CP');
    // decoupling: hatched block
    const d0 = at(0.3), d1 = at(0.98);
    ctx.globalAlpha = cur >= 0.3 ? 0.9 : 0.25;
    ctx.strokeStyle = th.muted; ctx.lineWidth = 1;
    ctx.strokeRect(d0 + 0.5, yH - amp * 0.4 + 0.5, d1 - d0, amp * 0.4);
    ctx.save(); ctx.beginPath(); ctx.rect(d0, yH - amp * 0.4, d1 - d0, amp * 0.4); ctx.clip();
    ctx.beginPath();
    for (let x = d0 - amp; x < d1; x += 7) { ctx.moveTo(x, yH); ctx.lineTo(x + amp * 0.4, yH - amp * 0.4); }
    ctx.stroke(); ctx.restore();
    ctx.globalAlpha = 1;
    label(ctx, th, 'decoupling', (d0 + d1) / 2, yH - amp * 0.4 - 10, 'center');

    // acquisition on 13C, drawn as the cursor passes
    const f0 = 0.3, end = Math.min(cur, 0.98);
    if (end > f0) {
      ctx.strokeStyle = th.spec; ctx.lineWidth = 1.3; ctx.beginPath();
      for (let f = f0; f <= end; f += 0.002) {
        const u = (f - f0) / (0.98 - f0);
        const v = Math.exp(-u * 3.2) * (Math.cos(u * 70) * 0.7 + Math.cos(u * 41) * 0.3);
        const X = at(f), Y = yC - v * amp * 0.9;
        f === f0 ? ctx.moveTo(X, Y) : ctx.lineTo(X, Y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = th.ink; ctx.globalAlpha = 0.35; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(at(cur), h * 0.12); ctx.lineTo(at(cur), h * 0.9); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;
  });

  // label and seeded are shared with your own animations:
  //   Anim.label(ctx, th, "text", x, y, align, colour)  12px mono, vertically centred
  //   Anim.seeded(42)  a repeatable random number generator (returns 0 … 1)
  global.Anim = { register, mount, load, label, seeded, get: name => registry[name], names: () => Object.keys(registry) };
})(window);
