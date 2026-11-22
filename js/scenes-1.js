/* scenes-1.js: illustrations for pages 1–26 (opening, primes, zeta, the map, Step A, Step B).
   Every scene draws on a 1000 × 640 board. draw(K, t) gets seconds since the page opened; return false when finished. */
(function () {
  "use strict";
  const S = DECK.scene, ZEROS = (window.RH_DATA && RH_DATA.zeros) || [];
  const LN2PI = Math.log(2 * Math.PI), GAMMA = 0.5772156649015329;
  let NTc = null; const nt = () => NTc || (NTc = RH.NT.sieve(200000));
  const isPrime = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
  const PRIMES = []; for (let n = 2; n < 400; n++) if (isPrime(n)) PRIMES.push(n);

  // ------------------------------------------------------------------ 1 cover
  S("cover", () => ({
    draw(K, t) {
      const { col } = K;
      K.wash(500, 320, 260, 250, col.purple, 0.07, 5);
      K.wash(500, 320, 90, 280, col.gold, 0.09, 9);
      K.seg(500, 610, 500, 30, { color: col.gold, width: 3, seed: 4 });
      K.text("Re s = ½", 512, 600, { size: 20, color: col.muted });
      const scroll = t * 5;
      ZEROS.forEach((g, i) => {
        const y = 600 - ((g * 3.2 - scroll) % 720 + 720) % 720;
        if (y < 25 || y > 600) return;
        const fade = Math.min(1, (600 - y) / 60, (y - 25) / 60);
        K.dot(500, y, 9, col.gold, 0.18 * fade); K.dot(500, y, 4.5, col.gold, fade);
      });
      PRIMES.slice(0, 40).forEach((p, i) => {
        const x = p < 100 ? 60 + p * 3.7 : 0; if (!x) return;
        const yb = 560 + 8 * Math.sin(t * 1.6 + i * 0.7);
        K.dot(x, yb, 4, col.blue, 0.85);
        const x2 = 940 - p * 3.7; K.dot(x2, 560 + 8 * Math.sin(t * 1.6 + i * 0.7 + 2), 4, col.blue, 0.85);
      });
      K.serif("the primes", 120, 610, { size: 22, color: col.muted });
      K.serif("the zeros", 540, 70, { size: 22, color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 2 how to read
  S("howto", () => ({
    draw(K, t) {
      const { col } = K, a = K.ease(K.ph(t, 0, 0.8)), b = K.ease(K.ph(t, 0.6, 1.4)), c = K.ease(K.ph(t, 1.2, 2));
      K.wash(500, 320, 420, 270, col.gold, 0.1, 2);
      const key = (x, y, w, s) => { K.box(x, y, w, 70, { color: col.ink, r: 10, fill: K.surface, fillAlpha: 1, width: 2.2, sketch: false }); K.text(s, x + w / 2, y + 36, { size: 30, align: "center", bold: true }); };
      K.g.globalAlpha = a; key(250, 120, 80, "←"); key(345, 120, 80, "→"); key(440, 120, 200, "space"); K.text("turn the page", 660, 156, { size: 24, color: col.muted }); K.g.globalAlpha = 1;
      K.g.globalAlpha = b;
      const pill = (x, y, s, cc) => { const w = s.length * 12 + 30; K.box(x, y, w, 40, { color: cc, r: 20, fill: K.surface, fillAlpha: 1, width: 2, sketch: false }); K.text(s, x + w / 2, y + 21, { size: 19, align: "center", bold: true, color: cc }); return w; };
      let x = 230; x += pill(x, 280, "real data", col.green) + 20; x += pill(x, 280, "schematic", col.purple) + 20; pill(x, 280, "our reading", col.red);
      K.g.globalAlpha = c;
      K.text("C opens the contents  ·  ☀/☾ switches light and dark", 500, 430, { size: 21, align: "center", color: col.muted });
      K.g.globalAlpha = 1;
      return t < 2.2;
    },
  }));

  // ------------------------------------------------------------------ 3 the sieve
  S("sieve", () => ({
    draw(K, t) {
      const { col } = K, X0 = 160, Y0 = 36, CW = 68, CH = 52;
      const steps = [2, 3, 5, 7], T0 = 0.8, DT = 2.1;
      const crossedAt = new Map(); // n -> time it gets crossed
      steps.forEach((q, k) => { const start = T0 + k * DT; const mult = []; for (let n = q * q; n <= 100; n += q) mult.push(n); mult.forEach((n, i) => { if (!crossedAt.has(n)) crossedAt.set(n, start + 0.35 + (i / mult.length) * 1.4); }); });
      const done = T0 + steps.length * DT;
      for (let n = 1; n <= 100; n++) {
        const r = Math.floor((n - 1) / 10), c = (n - 1) % 10, x = X0 + c * CW, y = Y0 + r * CH;
        const ct = crossedAt.get(n), crossed = ct !== undefined && t >= ct, prime = isPrime(n);
        const activeQ = steps.findIndex((q, k) => t >= T0 + k * DT && t < T0 + (k + 1) * DT);
        const isActive = activeQ >= 0 && n === steps[activeQ];
        if (prime && (t >= done || isActive || steps.indexOf(n) >= 0 && t >= T0 + steps.indexOf(n) * DT)) K.wash(x + CW / 2, y + CH / 2, 30, 22, col.blue, t >= done ? 0.28 : 0.22, n);
        if (isActive) K.ring(x + CW / 2, y + CH / 2, 24, { color: col.gold, width: 3 });
        K.text(String(n), x + CW / 2, y + CH / 2 + 1, { size: 24, align: "center", bold: prime && t >= done, color: crossed || n === 1 ? col.muted : col.ink });
        if (crossed) { const f = K.ease(K.ph(t, ct, ct + 0.25)); K.seg(x + 14, y + CH - 14, x + 14 + (CW - 28) * f, y + CH - 14 - (CH - 28) * f, { color: col.red, width: 2.2, seed: n, alpha: 0.8 }); }
      }
      const k = steps.findIndex((q, i) => t >= T0 + i * DT && t < T0 + (i + 1) * DT);
      const msg = t < T0 ? "1 to 100" : k >= 0 ? `crossing out the multiples of ${steps[k]}` : "what survives: the 25 primes below 100";
      K.serif(msg, 500, 600, { size: 28, align: "center", color: k >= 0 ? col.red : col.blue });
      return t < done + 0.5;
    },
  }));

  // ------------------------------------------------------------------ 4 gaps
  S("gaps", () => ({
    draw(K, t) {
      const { col } = K, L = 50, R = 950, N = 113, y = 430, X = (n) => L + ((n - 1) / (N - 1)) * (R - L);
      K.seg(L - 10, y, R + 10, y, { color: col.axis, width: 2.5 });
      [1, 20, 40, 60, 80, 100].forEach((n) => K.text(String(n), X(n), y + 30, { size: 17, align: "center", color: col.muted }));
      const ps = PRIMES.filter((p) => p <= N), reveal = K.ph(t, 0.3, 6);
      ps.forEach((p, i) => {
        const shown = i / ps.length <= reveal;
        if (!shown) return;
        K.dot(X(p), y, 6.5, col.blue);
        if (i + 1 < ps.length && (i + 1) / ps.length <= reveal) {
          const q = ps[i + 1], gap = q - p, h = 16 + gap * 17, cx = (X(p) + X(q)) / 2, rx = (X(q) - X(p)) / 2;
          const cc = gap === 2 ? col.green : gap >= 8 ? col.red : col.gold, pts = [];
          for (let k = 0; k <= 16; k++) { const th = Math.PI * (k / 16); pts.push([cx - rx * Math.cos(th), y - 10 - h * Math.sin(th)]); }
          K.line(pts, { color: cc, width: 2, seed: p });
          if (gap >= 6) K.text(String(gap), cx, y - 22 - h, { size: 17, align: "center", color: cc, bold: true });
        }
      });
      if (reveal >= 1) {
        K.serif("twins: a gap of just 2", X(41), 520, { size: 23, color: col.green, align: "center" });
        K.serif("a long silence: 89 … 97", X(93), 240, { size: 23, color: col.red, align: "center" });
      }
      K.serif("the gaps between consecutive primes", 500, 80, { size: 26, align: "center", color: col.muted });
      return t < 6.3;
    },
  }));

  // ------------------------------------------------------------------ 5 the staircase psi(x)
  S("staircase", () => ({
    draw(K, t) {
      const { col } = K, { psi } = nt();
      const A = K.axes([110, 50, 820, 480], [0, 1000], [0, 1000]);
      A.frame({ xticks: [[0, "0"], [250, "250"], [500, "500"], [750, "750"], [1000, "1000"]], yticks: [[0, "0"], [500, "500"], [1000, "1000"]], xlabel: "x" });
      K.seg(A.X(0), A.Y(0), A.X(1000), A.Y(1000), { color: col.gold, width: 2.5, dash: [9, 7], sketch: false });
      K.text("y = x", A.X(1000) - 10, A.Y(1000) + 30, { size: 22, align: "right", color: col.gold, bold: true });
      const upto = Math.floor(1000 * K.ease(K.ph(t, 0.3, 5))), pts = [];
      for (let n = 1; n <= upto; n++) { pts.push([A.X(n), A.Y(psi[n - 1])]); pts.push([A.X(n), A.Y(psi[n])]); }
      K.line(pts, { color: col.blue, width: 2.6 });
      if (upto > 40) K.text(`ψ(${upto}) = ${psi[upto].toFixed(0)}`, A.X(upto) + 12, A.Y(psi[upto]) + 26, { size: 21, color: col.blue, bold: true, halo: true });
      K.text("ψ(x): each prime p adds ln p (prime powers too)", 120, 30, { size: 19, color: col.muted });
      return t < 5.3;
    },
  }));

  // ------------------------------------------------------------------ 6 the wobble psi(x) - x
  let wobbleCache = null;
  function wobble() {
    if (wobbleCache) return wobbleCache;
    const { psi } = nt(), B = 400, lo = [], hi = [], xs = [];
    for (let s = 1; s + B <= 200000; s += B) { let a = Infinity, b = -Infinity; for (let n = s; n < s + B; n++) { const v1 = psi[n] - n, v2 = psi[n] - (n + 1); a = Math.min(a, v1, v2); b = Math.max(b, v1, v2); } xs.push(s + B / 2); lo.push(a); hi.push(b); }
    return (wobbleCache = { xs, lo, hi });
  }
  S("wobble", () => ({
    draw(K, t) {
      const { col } = K, W = wobble(), A = K.axes([120, 50, 820, 480], [0, 200000], [-700, 700]);
      A.frame({ xticks: [[0, "0"], [50000, "50k"], [100000, "100k"], [150000, "150k"], [200000, "200k"]], yticks: [[-500, "−500"], [0, "0"], [500, "500"]], xlabel: "x" });
      K.seg(A.X(0), A.Y(0), A.X(200000), A.Y(0), { color: col.axis, width: 1, sketch: false });
      A.curve((x) => Math.sqrt(x), 1, 200000, 200, { color: col.green, width: 2.2, dash: [8, 6] });
      A.curve((x) => -Math.sqrt(x), 1, 200000, 200, { color: col.green, width: 2.2, dash: [8, 6] });
      K.text("+√x", A.X(200000) + 8, A.Y(447), { size: 21, color: col.green, bold: true });
      K.text("−√x", A.X(200000) + 8, A.Y(-447), { size: 21, color: col.green, bold: true });
      const upto = K.ease(K.ph(t, 0.3, 5)) * W.xs.length, g = K.g;
      g.save(); g.strokeStyle = col.blue; g.lineWidth = 2;
      for (let i = 0; i < upto; i++) { g.beginPath(); g.moveTo(A.X(W.xs[i]), A.Y(W.lo[i])); g.lineTo(A.X(W.xs[i]), A.Y(W.hi[i])); g.stroke(); }
      g.restore();
      K.text("ψ(x) − x", 130, 30, { size: 21, color: col.blue, bold: true });
      return t < 5.3;
    },
  }));

  // ------------------------------------------------------------------ 7 coins
  S("coins", () => {
    const walks = [], NSTEP = 400;
    for (let w = 0; w < 7; w++) { const r = K0rng(31 + w * 7); let s = 0; const a = [0]; for (let i = 0; i < NSTEP; i++) { s += r() < 0.5 ? 1 : -1; a.push(s); } walks.push(a); }
    function K0rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
    return {
      draw(K, t) {
        const { col } = K, A = K.axes([110, 50, 820, 480], [0, NSTEP], [-45, 45]);
        A.frame({ xticks: [[0, "0"], [100, "100"], [200, "200"], [300, "300"], [400, "400"]], yticks: [[-40, "−40"], [0, "0"], [40, "40"]], xlabel: "flips n" });
        A.curve((n) => Math.sqrt(n), 0, NSTEP, 120, { color: col.green, width: 2.4, dash: [8, 6] });
        A.curve((n) => -Math.sqrt(n), 0, NSTEP, 120, { color: col.green, width: 2.4, dash: [8, 6] });
        A.curve((n) => 2 * Math.sqrt(n), 0, NSTEP, 120, { color: col.green, width: 1.4, dash: [3, 6], alpha: 0.6 });
        A.curve((n) => -2 * Math.sqrt(n), 0, NSTEP, 120, { color: col.green, width: 1.4, dash: [3, 6], alpha: 0.6 });
        K.text("±√n", A.X(NSTEP) + 8, A.Y(20), { size: 21, color: col.green, bold: true });
        K.text("±2√n", A.X(NSTEP) + 8, A.Y(40), { size: 18, color: col.green });
        const upto = Math.floor(NSTEP * K.ease(K.ph(t, 0.2, 5))), pal = [col.blue, col.red, col.gold, col.purple, col.blue, col.red, col.gold];
        walks.forEach((w, k) => K.line(w.slice(0, upto + 1).map((v, i) => [A.X(i), A.Y(v)]), { color: pal[k], width: 2, alpha: 0.8 }));
        K.text("heads minus tails, 7 runs of a fair coin", 120, 30, { size: 20, color: col.muted });
        return t < 5.3;
      },
    };
  });

  // ------------------------------------------------------------------ 8 Euler: sum and product race to the same value
  S("euler", () => ({
    draw(K, t) {
      const { col } = K, NMAX = 30, target = Math.PI * Math.PI / 6;
      const A = K.axes([120, 150, 800, 320], [1, NMAX], [1, 1.72]);
      A.frame({ xticks: [[1, "1"], [10, "10"], [20, "20"], [30, "30"]], yticks: [[1, "1.0"], [1.2, "1.2"], [1.4, "1.4"], [1.6, "1.6"]], xlabel: "terms used, up to N" });
      K.seg(A.X(1), A.Y(target), A.X(NMAX), A.Y(target), { color: col.green, width: 2, dash: [8, 6], sketch: false });
      K.text("π²/6 = 1.6449…", A.X(NMAX) - 4, A.Y(target) - 18, { size: 20, align: "right", color: col.green, bold: true });
      const upto = 1 + (NMAX - 1) * K.ease(K.ph(t, 0.6, 6));
      let s = 0, p = 1; const sp = [], pp = [];
      for (let n = 1; n <= Math.floor(upto); n++) {
        s += 1 / (n * n); sp.push([A.X(n), A.Y(s)]);
        if (isPrime(n)) p *= 1 / (1 - 1 / (n * n));
        pp.push([A.X(n), A.Y(p)]); if (n < Math.floor(upto)) pp.push([A.X(n + 1), A.Y(p)]);
      }
      K.line(sp, { color: col.blue, width: 3 }); K.line(pp, { color: col.red, width: 3 });
      sp.forEach(([x, y]) => K.dot(x, y, 3.5, col.blue));
      K.text("sum: 1 + 1/4 + 1/9 + 1/16 + ⋯", 130, 568, { size: 22, color: col.blue, bold: true });
      K.text("product over primes: 1/(1 − 2^{−2}) · 1/(1 − 3^{−2}) · 1/(1 − 5^{−2}) ⋯", 130, 606, { size: 22, color: col.red, bold: true });
      K.serif("for every s:", 500, 26, { size: 22, color: col.muted, align: "center" });
      K.math("1 + 1/2ˢ + 1/3ˢ + ⋯  =  ∏ₚ 1/(1 − p⁻ˢ)", 500, 70, { size: 34 });
      K.serif("here, s = 2", 930, 120, { size: 22, color: col.muted, align: "right" });
      K.text("the product only moves at primes", A.X(NMAX), A.Y(1.12), { size: 19, align: "right", color: col.muted });
      return t < 6.3;
    },
  }));

  // ------------------------------------------------------------------ complex plane: arrows add head to tail
  S("plane", () => ({
    draw(K, t) {
      const { col } = K, ox = 330, oy = 430, u = 110;
      const P = (x, y) => [ox + x * u, oy - y * u];
      K.seg(90, oy, 900, oy, { color: col.axis, width: 1.6, sketch: false });
      K.seg(ox, 610, ox, 40, { color: col.axis, width: 1.6, sketch: false });
      [-2, -1, 1, 2, 3, 4, 5].forEach((v) => { K.seg(P(v, 0)[0], oy - 5, P(v, 0)[0], oy + 5, { color: col.axis, width: 1.4, sketch: false }); K.text(String(v).replace("-", "−"), P(v, 0)[0], oy + 24, { size: 17, align: "center", color: col.muted }); });
      [1, 2, 3].forEach((v) => { K.seg(ox - 5, P(0, v)[1], ox + 5, P(0, v)[1], { color: col.axis, width: 1.4, sketch: false }); K.text(v + "i", ox - 12, P(0, v)[1], { size: 17, align: "right", color: col.muted }); });
      K.text("real part →", 900, oy + 54, { size: 19, align: "right", color: col.muted });
      K.text("↑ height (imaginary part)", ox + 12, 46, { size: 19, color: col.muted });
      const grow = (a, b, f, c, w) => { if (f <= 0) return; const e = K.ease(f); K.arrow(a[0], a[1], a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, { color: c, width: w || 3.2, seed: 5 }); };
      const A1 = P(3, 1), A2 = P(2, 2.5), O = [ox, oy];
      const f1 = K.ph(t, 0.3, 1.4), f2 = K.ph(t, 1.8, 2.9), f3 = K.ph(t, 3.3, 4.4);
      if (f1 > 0) { K.seg(A1[0], A1[1], A1[0], oy, { color: col.blue, width: 1.2, dash: [3, 5], alpha: 0.6 * f1, sketch: false }); }
      grow(O, A1, f1, col.blue);
      if (f1 >= 1) K.text("3 + 1i", A1[0] + 14, A1[1] + 22, { size: 21, bold: true, color: col.blue });
      grow(A1, A2, f2, col.red);
      if (f2 >= 1) K.text("+ (−1 + 1.5i)", A1[0] + 4, A1[1] - 92, { size: 21, bold: true, color: col.red });
      grow(O, A2, f3, col.gold, 4);
      if (f3 >= 1) { K.text("= 2 + 2.5i", A2[0] - 14, A2[1] - 20, { size: 22, bold: true, color: col.gold, align: "right" }); K.serif("head to tail", 640, 150, { size: 24, color: col.muted }); }
      K.dot(ox, oy, 5, col.ink);
      return t < 4.6;
    },
  }));

  // ------------------------------------------------------------------ chains of spinning arrows
  function chainPts(sig, tt, N, alt) {
    const pts = [[0, 0]]; let x = 0, y = 0;
    for (let n = 1; n <= N; n++) {
      const r = Math.pow(n, -sig) * (alt && n % 2 === 0 ? -1 : 1) * (alt && n === N ? 0.5 : 1), a = -tt * Math.log(n);
      x += r * Math.cos(a); y += r * Math.sin(a); pts.push([x, y]);
    }
    return pts;
  }
  function drawChain(K, pts, ox, oy, u, nArrows) {
    const { col, g } = K, pal = [col.blue, col.red, col.gold, col.green, col.purple];
    const S2 = ([x, y]) => [ox + x * u, oy - y * u];
    g.save(); g.strokeStyle = col.muted; g.globalAlpha = 0.7; g.lineWidth = 1.2; g.beginPath();
    pts.slice(nArrows).forEach((p, i) => { const [a, b] = S2(p); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); g.restore();
    for (let i = 0; i < nArrows && i + 1 < pts.length; i++) {
      const [a, b] = S2(pts[i]), [c, d] = S2(pts[i + 1]), len = Math.hypot(c - a, d - b);
      if (len < 2) continue;
      K.arrow(a, b, c, d, { color: pal[i % 5], width: i < 3 ? 3 : 2, head: Math.min(13, len * 0.45), sketch: false });
    }
    return S2(pts[pts.length - 1]);
  }
  S("spin", () => ({
    draw(K, t) {
      const { col } = K, sig = 1.5, T = 2.2, ox = 130, oy = 210, u = 185;
      const tt = T * K.ease(K.ph(t, 0.6, 6.5));
      K.seg(50, oy, 640, oy, { color: col.axis, width: 1.2, sketch: false }); K.seg(ox, 40, ox, 520, { color: col.axis, width: 1.2, sketch: false });
      const g = K.g; g.save(); g.strokeStyle = col.gold; g.lineWidth = 3; g.globalAlpha = 0.85; g.beginPath();
      for (let k = 0; k <= 200; k++) { const v = RH.zeta(sig, tt * k / 200), x = ox + v[0] * u, y = oy - v[1] * u; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
      const end = drawChain(K, chainPts(sig, tt, 400, false), ox, oy, u, 30);
      const z = RH.zeta(sig, tt), Z = [ox + z[0] * u, oy - z[1] * u];
      K.seg(end[0], end[1], Z[0], Z[1], { color: col.muted, width: 1.2, dash: [3, 4], sketch: false });
      K.dot(Z[0], Z[1], 7, col.gold); K.dot(ox, oy, 5, col.ink); K.text("start", ox - 10, oy + 22, { size: 17, align: "right", color: col.muted });
      K.serif("s = 1.5 + i·t", 670, 70, { size: 26 });
      K.math(`t = ${tt.toFixed(2)}`, 670, 130, { size: 40, color: col.purple, align: "left" });
      K.text("arrow n: length 1/n^{1.5},", 670, 420, { size: 19, color: col.muted });
      K.text("turned by t · ln n", 670, 448, { size: 19, color: col.muted });
      K.text("gold dot = ζ(s):", 670, 500, { size: 19, color: col.gold, bold: true });
      K.text("where the chain ends", 670, 526, { size: 19, color: col.gold, bold: true });
      K.text("gold trail: its path", 670, 570, { size: 19, color: col.gold });
      return t < 6.7;
    },
  }));
  S("home", () => ({
    draw(K, t) {
      const { col } = K, ZT = 14.134725, ox = 240, oy = 330, u = 130;
      const f = K.ph(t, 0.5, 7.5), tt = ZT * (1 - Math.pow(1 - f, 2.2));
      K.seg(90, oy, 630, oy, { color: col.axis, width: 1.2, sketch: false }); K.seg(ox, 40, ox, 600, { color: col.axis, width: 1.2, sketch: false });
      const g = K.g; g.save(); g.strokeStyle = col.gold; g.lineWidth = 2.4; g.globalAlpha = 0.6; g.beginPath();
      const steps = Math.max(1, Math.round(tt / 0.04));
      for (let k = 0; k <= steps; k++) { const p = chainPts(0.5, tt * k / steps, 600, true).pop(), x = ox + p[0] * u, y = oy - p[1] * u; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
      const end = drawChain(K, chainPts(0.5, tt, 600, true), ox, oy, u, 30);
      K.dot(end[0], end[1], 7, col.gold);
      K.dot(ox, oy, 5, col.ink); K.seg(ox - 6, oy + 8, ox - 60, oy + 150, { color: col.muted, width: 1.2, dash: [3, 4], sketch: false }); K.text("start", ox - 66, oy + 166, { size: 18, align: "right", color: col.muted });
      K.serif("s = ½ + i·t", 670, 70, { size: 26 });
      K.math(`t = ${tt.toFixed(2)}`, 670, 130, { size: 40, color: col.purple, align: "left" });
      K.text("gold trail: where", 670, 470, { size: 19, color: col.gold }); K.text("the chain has ended", 670, 496, { size: 19, color: col.gold });
      if (f >= 1) {
        const pulse = 1 + 0.12 * Math.sin(t * 3);
        K.ring(ox, oy, 22 * pulse, { color: col.gold, width: 3 });
        K.text("back home:", 670, 220, { size: 24, bold: true, color: col.gold }); K.text("ζ(s) = 0", 670, 252, { size: 24, bold: true, color: col.gold });
      }
      return true; // keep the ring pulsing
    },
  }));

  // ------------------------------------------------------------------ 9 the landscape |zeta|
  let land = null;
  function rgbOf(c) { const m = c.match(/^#([0-9a-f]{6})$/i); if (m) { const v = parseInt(m[1], 16); return [v >> 16, (v >> 8) & 255, v & 255]; } const r = c.match(/\d+(\.\d+)?/g); return r ? r.slice(0, 3).map(Number) : [128, 128, 128]; }
  function landscape(col, bg) {
    const key = col.purple + bg; if (land && land.key === key) return land;
    const NX = 90, NY = 150, s0 = -1.5, s1 = 2.5, t1 = 42, cv = document.createElement("canvas"); cv.width = NX; cv.height = NY;
    const g = cv.getContext("2d"), img = g.createImageData(NX, NY), P = rgbOf(col.purple), B = rgbOf(bg);
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const sg = s0 + ((i + 0.5) / NX) * (s1 - s0), tt = t1 * (1 - (j + 0.5) / NY);
      const [re, im] = RH.zeta(sg, tt), v = Math.log(Math.hypot(re, im) + 1e-9);
      const f = 1 - Math.min(1, Math.max(0, (v + 2.2) / 3.6)), k = (j * NX + i) * 4, a = Math.pow(f, 1.6);
      img.data[k] = B[0] + (P[0] - B[0]) * a; img.data[k + 1] = B[1] + (P[1] - B[1]) * a; img.data[k + 2] = B[2] + (P[2] - B[2]) * a; img.data[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return (land = { key, cv, s0, s1, t1 });
  }
  S("landscape", () => ({
    draw(K, t) {
      const { col } = K, L = landscape(col, K.bg), x0 = 300, y0 = 30, w = 400, h = 560;
      const X = (s) => x0 + ((s - L.s0) / (L.s1 - L.s0)) * w, Y = (tt) => y0 + h * (1 - tt / L.t1);
      const rv = K.ease(K.ph(t, 0, 2.2)), g = K.g;
      g.save(); g.imageSmoothingEnabled = true; g.beginPath(); g.rect(x0, y0 + h * (1 - rv), w, h * rv); g.clip(); g.drawImage(L.cv, x0, y0, w, h); g.restore();
      K.box(x0, y0, w, h, { color: col.axis, width: 1.5, sketch: false });
      [0, 1].forEach((s) => K.seg(X(s), y0, X(s), y0 + h, { color: col.axis, width: 1.2, dash: [4, 6], sketch: false }));
      [-1, 0, 0.5, 1, 2].forEach((s) => K.text(s === 0.5 ? "½" : String(s).replace("-", "−"), X(s), y0 + h + 24, { size: 19, align: "center", color: col.muted }));
      K.text("real part of s", x0 + w / 2, y0 + h + 50, { size: 19, align: "center", color: col.muted });
      [10, 20, 30, 40].forEach((tt) => K.text(String(tt), x0 - 10, Y(tt), { size: 17, align: "right", color: col.muted }));
      K.text("height", x0 - 12, y0 - 6, { size: 17, align: "right", color: col.muted });
      const show = K.ph(t, 2.2, 4.5);
      ZEROS.filter((z) => z < L.t1).forEach((z, i) => {
        const f = K.ph(show * 7, i, i + 1); if (f <= 0) return;
        const pulse = 1 + 0.15 * Math.sin(t * 3 + i);
        K.ring(X(0.5), Y(z), 13 * pulse, { color: col.gold, width: 2.5, alpha: f });
        if (i < 3) K.text(`zero at height ${z.toFixed(2)}`, X(0.5) + 260, Y(z), { size: 19, color: col.gold, bold: true, alpha: f });
        if (i < 3) K.seg(X(0.5) + 18, Y(z), X(0.5) + 250, Y(z), { color: col.gold, width: 1.2, alpha: f, dash: [3, 5], sketch: false });
      });
      K.seg(X(1), Y(1.2), x0 + w + 14, Y(1.2), { color: col.muted, width: 1.2, dash: [3, 5], sketch: false });
      K.text("near s = 1, ζ shoots up to ∞", x0 + w + 20, Y(1.2), { size: 18, color: col.muted });
      K.serif("dark = low ground", 160, 120, { size: 24, color: col.purple, align: "center" });
      K.serif("light = high", 160, 160, { size: 24, color: col.muted, align: "center" });
      return t < 6;
    },
  }));

  // ------------------------------------------------------------------ 10 the zeros line up
  S("line", () => ({
    draw(K, t) {
      const { col } = K, xL = 500, base = 610, sc = 1.48;
      K.wash(xL, 320, 140, 320, col.purple, 0.09, 4);
      [[380, "0"], [500, "½"], [620, "1"]].forEach(([x, s], i) => { K.seg(x, base, x, 20, { color: i === 1 ? col.gold : col.axis, width: i === 1 ? 2.6 : 1.4, dash: i === 1 ? [] : [5, 7], sketch: i === 1 }); K.text(s, x, base + 22, { size: 21, align: "center", bold: i === 1, color: i === 1 ? col.gold : col.muted }); });
      const n = Math.floor(ZEROS.length * K.ease(K.ph(t, 0.4, 6)));
      for (let i = 0; i < n; i++) { const y = base - ZEROS[i] * sc; if (y < 18) break; K.dot(xL, y, 4.2, col.purple); }
      K.text(`${n} zeros shown`, 660, 120, { size: 26, bold: true, color: col.purple });
      K.text("more than 10,000,000,000,000 checked by computer", 660, 160, { size: 18, color: col.muted, maxW: 330 });
      K.text("all of them on the line", 660, 194, { size: 18, color: col.muted });
      K.serif("the critical line", 360, 300, { size: 26, color: col.gold, align: "right" });
      return t < 6.3;
    },
  }));

  // ------------------------------------------------------------------ 11 zeros are notes: rebuilding psi from zeros
  S("music", () => {
    const XS = []; for (let i = 0; i <= 700; i++) XS.push(1.5 + (40 - 1.5) * (i / 700));
    return {
      draw(K, t) {
        const { col } = K, { psi } = nt(), A = K.axes([110, 50, 830, 470], [0, 40], [-2, 42]);
        A.frame({ xticks: [[0, "0"], [10, "10"], [20, "20"], [30, "30"], [40, "40"]], yticks: [[0, "0"], [20, "20"], [40, "40"]], xlabel: "x" });
        const pts = []; for (let n = 1; n <= 40; n++) { pts.push([A.X(n), A.Y(psi[n - 1])]); pts.push([A.X(n), A.Y(psi[n])]); }
        K.line(pts, { color: col.ink, width: 2, alpha: 0.35 });
        const f = K.ph(t, 0.8, 9), Kz = Math.max(0, Math.floor(Math.exp(Math.log(ZEROS.length + 1) * f)) - 1);
        const ys = XS.map((x) => {
          const L = Math.log(x), sx = Math.sqrt(x); let s = x - LN2PI - 0.5 * Math.log(1 - 1 / (x * x));
          for (let k = 0; k < Kz; k++) { const g = ZEROS[k], c = Math.cos(g * L), si = Math.sin(g * L); s -= (2 * sx * (0.5 * c + g * si)) / (0.25 + g * g); }
          return s;
        });
        A.clip(() => K.line(XS.map((x, i) => [A.X(x), A.Y(ys[i])]), { color: col.purple, width: 2.6 }));
        K.text(`zeros used: ${Kz}`, 130, 40, { size: 26, bold: true, color: col.purple });
        K.text("gray: the true staircase ψ(x)", 560, 40, { size: 19, color: col.muted });
        return t < 9.3;
      },
    };
  });

  // ------------------------------------------------------------------ 12 one off-key note
  S("offkey", () => ({
    draw(K, t) {
      const { col } = K, A = K.axes([110, 40, 830, 500], [1, 200], [-80, 80]), g0 = 14.134725;
      A.frame({ xticks: [[1, "1"], [50, "50"], [100, "100"], [150, "150"], [200, "200"]], yticks: [[-60, "−60"], [0, "0"], [60, "60"]], xlabel: "x" });
      const upto = 1 + 199 * K.ease(K.ph(t, 0.3, 6));
      A.curve((x) => Math.sqrt(x), 1, 200, 100, { color: col.blue, width: 1.6, dash: [6, 6] }); A.curve((x) => -Math.sqrt(x), 1, 200, 100, { color: col.blue, width: 1.6, dash: [6, 6] });
      A.curve((x) => Math.pow(x, 0.8), 1, 200, 100, { color: col.red, width: 1.6, dash: [6, 6] }); A.curve((x) => -Math.pow(x, 0.8), 1, 200, 100, { color: col.red, width: 1.6, dash: [6, 6] });
      A.curve((x) => Math.sqrt(x) * Math.cos(g0 * Math.log(x)), 1, upto, 900, { color: col.blue, width: 2.6 });
      A.curve((x) => Math.pow(x, 0.8) * Math.cos(g0 * Math.log(x) + 1), 1, upto, 900, { color: col.red, width: 2.6 });
      K.text("a zero on the line: size √x", 130, 572, { size: 22, color: col.blue, bold: true });
      K.text("a zero off the line (β = 0.8): size x^{0.8}", 130, 606, { size: 22, color: col.red, bold: true });
      return t < 6.3;
    },
  }));

  // ------------------------------------------------------------------ 13 coloring the primes
  S("colors", () => ({
    draw(K, t) {
      const { col } = K, X0 = 160, Y0 = 40, CW = 68, CH = 46;
      let plus = 0, minus = 0; const ps = PRIMES.filter((p) => p <= 110);
      const rv = K.ph(t, 0.3, 5) * ps.length;
      for (let n = 1; n <= 110; n++) {
        const r = Math.floor((n - 1) / 10), c = (n - 1) % 10, x = X0 + c * CW, y = Y0 + r * CH, i = ps.indexOf(n);
        const lit = i >= 0 && i < rv;
        if (lit) { const v = n === 2 ? 0 : n % 4 === 1 ? 1 : -1; if (v > 0) plus++; if (v < 0) minus++; K.wash(x + CW / 2, y + CH / 2, 28, 19, v > 0 ? col.blue : v < 0 ? col.red : col.muted, 0.32, n); }
        K.text(String(n), x + CW / 2, y + CH / 2, { size: 20, align: "center", bold: lit, color: lit ? (n === 2 ? col.muted : n % 4 === 1 ? col.blue : col.red) : col.muted });
      }
      K.text(`+1 (remainder 1 mod 4): ${plus}`, 170, 572, { size: 22, bold: true, color: col.blue });
      K.text(`−1 (remainder 3 mod 4): ${minus}`, 540, 572, { size: 22, bold: true, color: col.red });
      K.text("one coloring of many: each gives its own zeta function and its own zeros", 500, 612, { size: 18, align: "center", color: col.muted });
      return t < 5.3;
    },
  }));

  // ------------------------------------------------------------------ 14 175,187 files
  S("files", () => ({
    draw(K, t) {
      const { col } = K, COLS = 64, ROWS = 28, cs = 11.2, x0 = 500 - (COLS * cs) / 2, y0 = 30, TOT = 175187;
      const f = K.ease(K.ph(t, 0.2, 4)), lit = Math.floor(COLS * ROWS * f), g = K.g;
      g.save();
      for (let k = 0; k < COLS * ROWS; k++) { const r = Math.floor(k / COLS), c = k % COLS; g.fillStyle = k < lit ? col.green : col.grid; g.globalAlpha = k < lit ? 0.5 + 0.4 * ((Math.sin(k * 12.9898) * 43758.5453) % 1 + 1) % 1 : 1; g.fillRect(x0 + c * cs, y0 + r * cs, cs - 2, cs - 2); }
      g.restore();
      K.text(`${Math.round(TOT * f).toLocaleString("en-US")} files`, 500, y0 + ROWS * cs + 38, { size: 30, align: "center", bold: true, color: col.green });
      const c2 = K.ease(K.ph(t, 4.2, 5));
      if (c2 > 0) {
        K.g.globalAlpha = c2;
        K.box(130, 440, 740, 150, { color: null, fill: "#1a202c", fillAlpha: 1, r: 12 });
        K.g.font = '22px "SF Mono", Menlo, Consolas, monospace'; K.g.fillStyle = "#f6ad55"; K.g.textBaseline = "middle"; K.g.textAlign = "left";
        K.g.fillText("theorem", 160, 490); K.g.fillStyle = "#e2e8f0"; K.g.fillText("riemannHypothesis : RiemannHypothesis", 270, 490);
        K.g.fillText("  := rhOfAll", 160, 525);
        K.text("✓ accepted by the Lean kernel", 160, 565, { size: 20, bold: true, color: "#9ae6b4" });
        K.g.globalAlpha = 1;
      }
      return t < 5.2;
    },
  }));

  // ------------------------------------------------------------------ 15 the map
  S("map", () => ({
    draw(K, t) {
      const { col } = K;
      const B = {
        D: [90, 40, 260, 86, "D · count two ways"], E: [370, 40, 260, 86, "E · near-orthogonality"], F: [650, 40, 260, 86, "F · the Ш window"],
        C: [300, 180, 400, 86, "C · a chain of √x lifts"], Bb: [300, 320, 400, 86, "B · four bins"], A: [300, 460, 400, 86, "A · Landau's trap"],
        G: [330, 580, 340, 54, "the Riemann Hypothesis"],
      };
      const order = ["G", "A", "Bb", "D", "C"], cIdx = (k) => order.indexOf(k);
      const step = t / 0.9;
      [["D", "C"], ["E", "C"], ["F", "C"], ["C", "Bb"], ["Bb", "A"], ["A", "G"]].forEach(([a, b], i) => {
        const p = B[a], q = B[b]; K.arrow(p[0] + p[2] / 2, p[1] + p[3] + 4, q[0] + q[2] / 2, q[1] - 6, { color: col.axis, width: 2, seed: i + 3, head: 11 });
      });
      Object.entries(B).forEach(([k, [x, y, w, h, s]]) => {
        const i = cIdx(k), on = i >= 0 && step >= i, goal = k === "G";
        K.box(x, y, w, h, { color: goal ? col.gold : on ? col.green : col.axis, width: on || goal ? 2.6 : 1.8, fill: goal ? col.gold : on ? col.green : col.grid, fillAlpha: goal ? 0.2 : on ? 0.16 : 1, seed: x + y });
        K.text(s, x + w / 2, y + h / 2, { size: goal ? 22 : 22, bold: true, align: "center", color: col.ink, maxW: w - 20 });
        if (i > 0 && on) { K.dot(x - 22, y + h / 2, 17, col.green); K.text(String(i), x - 22, y + h / 2 + 1, { size: 19, bold: true, align: "center", color: K.surface }); }
      });
      K.serif("reading order", 850, 360, { size: 26, color: col.green, align: "center" });
      K.serif("1 → 2 → 3 → 4", 850, 400, { size: 24, color: col.green, align: "center" });
      return t < 4.2;
    },
  }));

  // ------------------------------------------------------------------ 16 + 17 G(x) from real primes, and a rogue zero
  let gzCache = null;
  function gzData() {
    if (gzCache) return gzCache;
    const { psi, lamOverN } = nt(), xs = [], ys = [];
    for (let i = 0; i <= 1400; i++) {
      const x = Math.pow(10, 1.7 + (Math.log10(200000) - 1.7) * (i / 1400)), n = Math.floor(x);
      const Sz = x * lamOverN[n] - psi[n], Gz = Sz - x * Math.log(x) + (1 + GAMMA) * x;
      xs.push(x); ys.push((Gz - LN2PI) / Math.sqrt(x));
    }
    return (gzCache = { xs, ys });
  }
  const BAND = 0.0462;
  function gzFrame(K, A, yr) {
    A.frame({ xticks: [[100, "100"], [1000, "1,000"], [10000, "10,000"], [100000, "100,000"]], yticks: yr, xlabel: "x (log scale)" });
  }
  S("gz", () => ({
    draw(K, t) {
      const { col } = K, D = gzData(), A = K.axes([140, 50, 800, 470], [50, 200000], [-0.1, 0.1], { xlog: true });
      gzFrame(K, A, [[-0.1, "−0.10"], [-0.05, "−0.05"], [0, "0"], [0.05, "0.05"], [0.1, "0.10"]]);
      K.g.save(); K.g.fillStyle = col.green; K.g.globalAlpha = 0.14; K.g.fillRect(A.X(50), A.Y(BAND), A.X(200000) - A.X(50), A.Y(-BAND) - A.Y(BAND)); K.g.restore();
      K.text("the band RH predicts: ±0.0462", A.X(60), A.Y(BAND) - 16, { size: 19, color: col.green, bold: true });
      const n = Math.floor(D.xs.length * K.ease(K.ph(t, 0.3, 5)));
      K.line(D.xs.slice(0, n).map((x, i) => [A.X(x), A.Y(D.ys[i])]), { color: col.blue, width: 2.2 });
      K.text("(G(x) − ln 2π) / √x", 150, 32, { size: 22, bold: true, color: col.blue });
      return t < 5.3;
    },
  }));
  S("rogue", () => ({
    draw(K, t) {
      const { col } = K, D = gzData(), A = K.axes([140, 50, 800, 470], [50, 200000], [-0.3, 0.3], { xlog: true });
      gzFrame(K, A, [[-0.3, "−0.3"], [0, "0"], [0.3, "0.3"]]);
      K.g.save(); K.g.fillStyle = col.green; K.g.globalAlpha = 0.14; K.g.fillRect(A.X(50), A.Y(BAND), A.X(200000) - A.X(50), A.Y(-BAND) - A.Y(BAND)); K.g.restore();
      K.seg(A.X(50), A.Y(BAND), A.X(200000), A.Y(BAND), { color: col.red, width: 3, seed: 5 });
      K.text("a ceiling", A.X(60), A.Y(BAND) - 18, { size: 21, bold: true, color: col.red });
      const beta = 0.5 + 0.32 * K.ease(K.ph(t, 0.5, 6)), gam = 20, bb = beta * (beta - 1) - gam * gam, ci = gam * (2 * beta - 1), den = bb * bb + ci * ci;
      const ys = D.xs.map((x, i) => {
        const L = Math.log(x), xb = Math.pow(x, beta), nr = xb * Math.cos(gam * L), ni = xb * Math.sin(gam * L);
        return D.ys[i] - (2 * (nr * bb + ni * ci)) / den / Math.sqrt(x);
      });
      A.clip(() => K.line(D.xs.map((x, i) => [A.X(x), A.Y(ys[i])]), { color: col.blue, width: 2.2 }));
      A.clip(() => { for (let i = 1; i < ys.length - 1; i++) if (ys[i] > BAND && ys[i] >= ys[i - 1] && ys[i] >= ys[i + 1]) K.dot(A.X(D.xs[i]), A.Y(ys[i]), 6, col.red); });
      K.text(`one hypothetical zero at real part β = ${beta.toFixed(2)}`, 150, 32, { size: 22, bold: true, color: beta > 0.505 ? col.red : col.blue });
      K.text("red dots: crests that break through", 150, 590, { size: 19, color: col.red });
      return t < 6.3;
    },
  }));

  // ------------------------------------------------------------------ 18 Landau's trap
  S("trap", () => ({
    draw(K, t) {
      const { col } = K, sc = 170, X = (re) => 50 + (re + 0.15) * sc, Y = (im) => 320 - im * sc, sig = 1.55, theta = 0.6;
      const reR = 0.6 + 0.32 * Math.sin(t * 0.7 - 1.2), imR = 0;
      K.g.save(); K.g.beginPath(); K.g.rect(0, 0, 640, 640); K.g.clip();
      K.g.fillStyle = col.purple; K.g.globalAlpha = 0.07; K.g.fillRect(X(0), 0, X(1) - X(0), 640); K.g.restore();
      K.seg(X(-0.15), Y(0), X(2.85) > 640 ? 640 : X(2.85), Y(0), { color: col.axis, width: 1.6, sketch: false });
      K.seg(X(theta), 20, X(theta), 620, { color: col.green, width: 2.6, dash: [8, 6], sketch: false });
      K.text("the ceiling's line, Re s = θ", X(theta) + 8, 36, { size: 18, color: col.green, bold: true });
      const rg = sig - theta, rr = Math.hypot(sig - reR, imR);
      K.g.save(); K.g.beginPath(); K.g.rect(0, 0, 640, 640); K.g.clip();
      K.ring(X(sig), Y(0), rg * sc, { color: col.green, width: 2.5, fill: col.green, fillAlpha: 0.06 });
      K.ring(X(sig), Y(0), rr * sc, { color: col.red, width: 2.5, dash: [7, 5] });
      K.g.restore();
      K.dot(X(sig), Y(0), 7, col.ink); K.text("z", X(sig) + 10, Y(0) - 16, { size: 22, bold: true });
      K.dot(X(reR), Y(imR), 9, col.red); K.text("zero ρ", X(reR), Y(imR) + 30, { size: 20, bold: true, color: col.red, align: "center", halo: true });
      // coefficient sizes, log scale: pole forces (1/rr)^k, ceiling allows (1/rg)^k
      const A = K.axes([700, 120, 260, 300], [0, 20], [-4, 14]);
      A.frame({ xlabel: "k", xticks: [[0, "0"], [20, "20"]] });
      A.curve((k) => k * Math.log(1 / rr) / Math.LN10 + 0, 0, 20, 30, { color: col.red, width: 2.8 });
      A.curve((k) => k * Math.log(1 / rg) / Math.LN10 + 0, 0, 20, 30, { color: col.green, width: 2.8 });
      K.text("size of the k-th", 700, 70, { size: 18, color: col.muted }); K.text("Taylor coefficient", 700, 94, { size: 18, color: col.muted });
      const bad = reR > theta;
      K.seg(700, 500, 730, 500, { color: col.red, width: 2.8, sketch: false }); K.text("forced by the pole", 740, 500, { size: 17, color: col.red, bold: true });
      K.seg(700, 528, 730, 528, { color: col.green, width: 2.8, sketch: false }); K.text("allowed by the ceiling", 740, 528, { size: 17, color: col.green, bold: true });
      K.serif(bad ? "zero right of the line:" : "zero left of the line:", 830, 578, { size: 24, align: "center", color: bad ? col.red : col.green });
      K.serif(bad ? "contradiction!" : "no conflict", 830, 610, { size: 24, align: "center", color: bad ? col.red : col.green });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 19 windows
  // ------------------------------------------------------------------ spot checks: cameras on a road
  S("cameras", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, A = K.axes([70, 120, 860, 300], [2, 140], [0, 1], { xlog: true }), road = 420, g = K.g;
      const WINS = [5, 11, 24, 52, 110].map((U) => [U, U * 1.5]);
      // road
      g.save(); g.fillStyle = col.axis; g.globalAlpha = 0.16; g.fillRect(50, road - 30, 900, 60); g.restore();
      for (let x = 60; x < 940; x += 46) K.seg(x, road, x + 22, road, { color: col.muted, width: 2, sketch: false, alpha: 0.6 });
      // windows: green stretches of road with a camera each
      WINS.forEach(([a, b], i) => {
        const x0 = A.X(a), x1 = A.X(Math.min(b, 140));
        g.save(); g.fillStyle = col.green; g.globalAlpha = 0.22; g.fillRect(x0, road - 30, x1 - x0, 60); g.restore();
        const cx = (x0 + x1) / 2; K.seg(cx, road - 32, cx, 250, { color: col.ink, width: 2.4, sketch: false });
        K.box(cx - 20, 226, 40, 26, { color: col.ink, width: 2, sketch: false }); K.ring(cx, 239, 6, { color: col.ink, width: 2 });
      });
      K.text("windows: the ceiling is proven on the green stretches", 70, 150, { size: 20, bold: true, color: col.green });
      K.text("nothing is checked in between", 70, 180, { size: 19, color: col.muted });
      K.text("and more windows, forever →", 930, road + 70, { size: 18, align: "right", color: col.muted });
      K.text("x, further and further out →", 70, road + 70, { size: 18, color: col.muted });
      // the speeding car
      const lap = 7.5, p = reduced ? 0.86 : ((t % lap) / lap), u = Math.pow(10, Math.log10(2) + (Math.log10(140) - Math.log10(2)) * p);
      const cx = A.X(u), cy = road - 4;
      K.box(cx - 34, cy - 24, 68, 24, { color: col.red, width: 2.5, sketch: false }); g.save(); g.fillStyle = col.red; g.globalAlpha = 0.85; g.fillRect(cx - 34, cy - 24, 68, 24); g.restore();
      K.dot(cx - 20, cy + 2, 7, col.ink); K.dot(cx + 20, cy + 2, 7, col.ink);
      for (let k = 1; k <= 3; k++) K.seg(cx - 44 - k * 12, cy - 18 + k * 5, cx - 40 - k * 4, cy - 18 + k * 5, { color: col.red, width: 2, sketch: false, alpha: 0.6 });
      const w = WINS.find(([a, b]) => u >= a && u <= b);
      if (w) {
        const wx = (A.X(w[0]) + A.X(Math.min(w[1], 140))) / 2;
        g.save(); g.fillStyle = col.gold; g.globalAlpha = 0.28; g.beginPath(); g.moveTo(wx, 252); g.lineTo(cx - 40, cy - 26); g.lineTo(cx + 40, cy - 26); g.closePath(); g.fill(); g.restore();
        K.text("caught!", wx, 205, { size: 24, bold: true, align: "center", color: col.red });
      }
      K.serif("a rogue zero speeds the whole way", 500, 560, { size: 24, align: "center", color: col.red });
      return true;
    },
  }));

  S("windows", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, A = K.axes([80, 90, 840, 420], [2, 140], [0, 1.15], { xlog: true });
      A.frame({ xticks: [[2, "2"], [10, "10"], [50, "50"], [100, "100"]], xlabel: "u = ln x (log scale)", yaxis: false });
      const WINS = [5, 11, 24, 52, 110].map((U) => [U, U * 1.5]);
      WINS.forEach(([a, b]) => { K.g.save(); K.g.fillStyle = col.green; K.g.globalAlpha = 0.18; K.g.fillRect(A.X(a), A.Y(1.15), A.X(Math.min(b, 140)) - A.X(a), A.Y(0) - A.Y(1.15)); K.g.restore(); });
      K.text("green: windows, where the ceiling is proven", A.X(5), 70, { size: 20, color: col.green, bold: true });
      const k = reduced ? 64 : Math.exp(Math.log(4) + (Math.log(100) - Math.log(4)) * (0.5 - 0.5 * Math.cos(t * 0.55)));
      const f = (u) => Math.exp(k * Math.log(u / k) - (u - k));
      A.curve(f, 2, 140, 400, { color: col.gold, width: 3, fill: col.gold });
      const pts = []; for (let i = 0; i <= 200; i++) { const u = Math.pow(10, Math.log10(2) + (Math.log10(140) - Math.log10(2)) * i / 200); pts.push([A.X(u), A.Y(f(u))]); }
      K.g.save(); K.g.fillStyle = col.gold; K.g.globalAlpha = 0.18; K.g.beginPath(); K.g.moveTo(A.X(2), A.Y(0)); pts.forEach(([x, y]) => K.g.lineTo(x, y)); K.g.lineTo(A.X(140), A.Y(0)); K.g.fill(); K.g.restore();
      const win = WINS.find(([a, b]) => k > a && k < b);
      let inside = 0, tot = 0; for (let i = 0; i < 400; i++) { const u = 2 * Math.pow(70, i / 400), w = f(u) * u; tot += w; if (win && u >= win[0] && u <= win[1]) inside += w; }
      const share = inside / tot;
      K.text(`coefficient number k = ${Math.round(k)}`, 90, 584, { size: 22, bold: true, color: col.gold });
      K.text(win ? `${Math.round(share * 100)}% of its view is inside a window` : "its view falls between windows", 90, 620, { size: 22, color: win && share > 0.9 ? col.green : col.muted, bold: win && share > 0.9 });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 20 the goal
  S("goal", () => ({
    draw(K, t) {
      const { col } = K;
      K.wash(500, 300, 380, 200, col.gold, 0.14, 6);
      K.seg(120, 230, 880, 230, { color: col.red, width: 4, seed: 9 });
      for (let x = 130; x <= 870; x += 40) K.seg(x, 230, x - 18, 206, { color: col.red, width: 2, seed: x });
      K.text("G(x) ≤ x^{½ + ε}", 500, 160, { size: 50, align: "center", bold: true });
      const pts = []; for (let x = 120; x <= 880; x += 4) { const u = (x - 120) / 760; pts.push([x, 400 - 120 * (0.65 + 0.3 * Math.sin(u * 22 + t * 1.4)) * Math.sin(u * 5 + 0.6 + t * 0.5) * 0.9]); }
      K.line(pts, { color: col.blue, width: 3 });
      K.text("G(x) wanders, but never through the ceiling", 500, 560, { size: 24, align: "center", color: col.muted });
      K.text("(ε: as small as you like)", 500, 596, { size: 19, align: "center", color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 21 four bins
  const leg3 = (p) => (p % 3 === 1 ? 1 : -1), leg7 = (p) => ([1, 2, 4].includes(p % 7) ? 1 : -1);
  S("bins", () => {
    const ps = PRIMES.filter((p) => p < 140 && p !== 3 && p !== 7);
    return {
      draw(K, t) {
        const { col } = K, bins = [[1, 1], [1, -1], [-1, 1], [-1, -1]], bw = 210, gap = 26, x0 = 500 - (4 * bw + 3 * gap) / 2, top = 330, bot = 600;
        bins.forEach(([a, b], i) => {
          const x = x0 + i * (bw + gap), hl = a === 1 && b === -1;
          if (hl) K.wash(x + bw / 2, (top + bot) / 2, bw * 0.62, 170, col.gold, 0.22, 8);
          K.line([[x, top], [x + 8, bot], [x + bw - 8, bot], [x + bw, top]], { color: hl ? col.gold : col.axis, width: hl ? 3.4 : 2.2, sketch: true, seed: i + 2 });
          K.text(`ψ = ${a > 0 ? "+1" : "−1"},  χ = ${b > 0 ? "+1" : "−1"}`, x + bw / 2, top - 18, { size: 19, align: "center", bold: true, color: hl ? col.gold : col.muted });
        });
        K.text("the one bin the machine can count", x0 + bw + gap + bw / 2, bot + 28, { size: 18, align: "center", color: col.gold, bold: true });
        const counts = [0, 0, 0, 0];
        ps.forEach((p, k) => {
          const st = 0.4 + k * 0.17, f = K.ease(K.ph(t, st, st + 0.7));
          const bi = bins.findIndex(([a, b]) => a === leg3(p) && b === leg7(p)), slot = counts[bi]++;
          const per = K.fs > 1.1 ? 4 : 5, tx = x0 + bi * (bw + gap) + 30 + (slot % per) * ((bw - 60) / (per - 1)), ty = bot - 22 - Math.floor(slot / per) * 34 * K.fs;
          const sx = 80 + (k % 16) * 56, sy = 60 + Math.floor(k / 16) * 40;
          if (t < st) { K.text(String(p), sx, sy, { size: 19, align: "center", color: col.muted }); return; }
          const x = K.lerp(sx, tx, f), y = K.lerp(sy, ty, f) - Math.sin(f * Math.PI) * 30;
          K.text(String(p), x, y, { size: 19, align: "center", bold: true, color: bi === 1 ? col.gold : col.ink });
        });
        K.text("ψ(p): is p a square mod 3?   χ(p): is p a square mod 7?", 500, 22, { size: 18, align: "center", color: col.muted });
        return t < 0.4 + ps.length * 0.17 + 1;
      },
    };
  });

  // ------------------------------------------------------------------ 22 Fourier: four patterns pick out one bin
  S("fourier", () => ({
    draw(K, t) {
      const { col } = K, heads = ["ψ+ χ+", "ψ+ χ−", "ψ− χ+", "ψ− χ−"], cx = (i) => 470 + i * 120;
      const rows = [["all primes", [1, 1, 1, 1], col.ink], ["+ ψ helper", [1, 1, -1, -1], col.blue], ["− χ helper", [-1, 1, -1, 1], col.red], ["− ψχ helper", [-1, 1, 1, -1], col.purple]];
      heads.forEach((h, i) => K.text(h, cx(i), 60, { size: 20, align: "center", bold: true, color: i === 1 ? col.gold : col.muted }));
      K.g.save(); K.g.fillStyle = col.gold; K.g.globalAlpha = 0.13 * K.ph(t, 4.2, 5); K.g.fillRect(cx(1) - 52, 30, 104, 560); K.g.restore();
      rows.forEach(([name, v, c], r) => {
        const a = K.ease(K.ph(t, 0.3 + r * 0.8, 0.9 + r * 0.8)); if (a <= 0) return;
        K.g.globalAlpha = a;
        K.text(name, 370, 130 + r * 80, { size: 22, align: "right", bold: true, color: c });
        v.forEach((s, i) => { K.ring(cx(i), 130 + r * 80, 24, { color: c, width: 2, fill: c, fillAlpha: 0.1 }); K.text(s > 0 ? "+1" : "−1", cx(i), 131 + r * 80, { size: 20, align: "center", bold: true, color: c }); });
        K.g.globalAlpha = 1;
      });
      const b = K.ease(K.ph(t, 3.5, 4.3));
      if (b > 0) {
        K.g.globalAlpha = b;
        K.seg(400, 440, 940, 440, { color: col.ink, width: 2.4 });
        K.text("add them up", 370, 485, { size: 22, align: "right", bold: true });
        [0, 4, 0, 0].forEach((s, i) => K.text(String(s), cx(i), 486, { size: 28, align: "center", bold: true, color: s ? col.gold : col.muted }));
        K.text("÷ 4", 370, 550, { size: 22, align: "right", bold: true });
        [0, 1, 0, 0].forEach((s, i) => K.text(String(s), cx(i), 551, { size: 28, align: "center", bold: true, color: s ? col.gold : col.muted }));
        K.g.globalAlpha = 1;
      }
      return t < 5.2;
    },
  }));
})();
