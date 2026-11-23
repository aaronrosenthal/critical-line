// scenes-weavers-3.js: colony illustrations that replace the "literal chart + companion bird" pages.
// Loaded last, so each S("w-...") here overrides the relabel() of the same name in scenes-weavers.js.
(function () {
  "use strict";
  const S = (n, f) => DECK.scene(n, f);
  const { bird, twig, perch, BIRD, clamp, farOne } = window.WEAVE;
  const ZEROS = (window.RH_DATA && RH_DATA.zeros) || [];
  const GAMMA = 0.5772156649015329, LN2PI = Math.log(2 * Math.PI);
  const GRASS = ["#9aa64e", "#b9c26c", "#7d8a3a", "#6a7630", "#a9a35a"], BROWN = ["#8b5e34", "#a0703f", "#6e4a2a", "#b8864f"];
  const GREY = "#c9b27a";
  const isPrime = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
    const DATA_LEMN = {"3":[1,3,4,6,7,10,10,12,13,15,16,19,19,21,22,24,25,29,28,30,31,33,34,37,37,39,40,42,43,46,46,48,49,51,52,56,55,57,58,60,61,64,64,66,67,69,70,73,73,75],"7":[0,1,1,2,3,3,4,4,5,5,6,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,16,18,17,18,18,19,19,20,21,21,22,22,23,24,24,25,25,26,26,27,28,28,29],"11":[0,0,2,1,1,2,2,3,3,3,4,4,4,5,5,5,6,6,7,7,7,8,8,9,9,9,9,10,10,11,11,11,13,12,12,13,13,14,14,14,15,15,15,16,16,16,17,17,18,18]};
  const rhs = (x, p) => (((x * x % p) * x - x + 1) % p + p) % p;
  function curvePoints(p) {
    const roots = Array.from({ length: p }, () => []);
    for (let y = 0; y < p; y++) roots[(y * y) % p].push(y);
    const pts = [];
    for (let x = 0; x < p; x++) roots[rhs(x, p)].forEach((y) => pts.push([x, y]));
    return pts;
  }
  function slider(K, x0, x1, y, frac, o = {}) {
    const { col } = K;
    K.seg(x0, y, x1, y, { color: col.axis, width: 4, sketch: false });
    (o.ticks || []).forEach(([f, s, c]) => { const x = x0 + f * (x1 - x0); K.seg(x, y - 10, x, y + 10, { color: c || col.muted, width: 2, sketch: false }); K.text(s, x, y + 30, { size: 17, align: "center", color: c || col.muted, bold: !!c }); });
    const hx = x0 + frac * (x1 - x0);
    K.dot(hx, y, 13, col.red); K.ring(hx, y, 13, { color: K.surface, width: 2.5 });
    return hx;
  }
  // a wire between two small posts
  function wire(K, x0, x1, y, o = {}) {
    const g = K.g;
    if (o.posts !== false) [x0, x1].forEach((px) => { g.save(); g.fillStyle = "#6b4f33"; g.fillRect(px - 4, y - (o.up ?? 20), 8, (o.up ?? 20) + (o.down ?? 70)); g.restore(); });
    K.seg(x0, y, x1, y, { color: o.color || K.col.axis, width: o.width || 3, sketch: false });
  }
  // a hand-drawn heap of twigs (a pile), centred at cx on ground y
  function pile(K, cx, y, w, n, seed) {
    const g = K.g; let s = seed || 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.save(); g.lineCap = "round";
    for (let k = 0; k < n; k++) { const f = r(), layer = Math.floor(k / (n / 3)), ww = w * (1 - layer * 0.28), x = cx + (f - 0.5) * ww, yy = y - layer * 9 - r() * 4, a = (r() - 0.5) * 0.7, L = w * 0.4;
      g.strokeStyle = BROWN[k % 4]; g.lineWidth = 4; g.beginPath(); g.moveTo(x - Math.cos(a) * L / 2, yy - Math.sin(a) * L / 2); g.lineTo(x + Math.cos(a) * L / 2, yy + Math.sin(a) * L / 2); g.stroke(); }
    g.restore();
  }
  // a balance: pivot (cx, cy), tilt (positive = right side down); returns pan centres
  function scale(K, cx, cy, half, tilt, stand = 230) {
    const { col } = K, dx = Math.cos(tilt) * half, dy = Math.sin(tilt) * half;
    K.line([[cx, cy + 6], [cx - 40, cy + stand], [cx + 40, cy + stand]], { color: col.muted, width: 3, close: true, sketch: false });
    K.seg(cx - dx, cy - dy, cx + dx, cy + dy, { color: BIRD.twig, width: 8, sketch: false });
    K.dot(cx, cy, 9, col.muted);
    const pans = [[cx - dx, cy - dy + 90], [cx + dx, cy + dy + 90]];
    pans.forEach(([px, py]) => { [-1, 1].forEach((s) => K.seg(px, py - 90, px + s * 80, py, { color: col.muted, width: 1.5, sketch: false }));
      K.line([[px - 95, py], [px + 95, py], [px + 70, py + 22], [px - 70, py + 22]], { color: col.muted, width: 2.5, close: true, fill: col.muted, fillAlpha: 0.12, sketch: false }); });
    return pans;
  }
  // smooth path through points (Catmull-Rom), n samples per segment
  function smooth(P, n = 14) {
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u;
        out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3))); }
    }
    out.push(P[P.length - 1]); return out;
  }
  // a sine "song" line from (x0, y) to (x1, y); amplitude grows by amp(u)
  function song(K, x0, x1, y, amp, o = {}) {
    const pts = []; for (let i = 0; i <= 120; i++) { const u = i / 120, x = x0 + (x1 - x0) * u; pts.push([x, y + Math.sin(u * (o.cycles || 9) * Math.PI * 2 + (o.ph || 0)) * amp(u)]); }
    K.line(pts, { color: o.color || K.col.gold, width: o.width || 2.5, alpha: o.alpha ?? 1, sketch: false });
  }

  // ------------------------------------------------------------------ 6: Grey's songbook, two birds race along a wire
  S("w-euler", () => ({
    draw(K, t) {
      const { col } = K, NMAX = 30, T = Math.PI * Math.PI / 6, X0 = 150, X1 = 850, X = (v) => X0 + ((v - 1) / (T - 1)) * (X1 - X0), yA = 250, yB = 430;
      const sv = [1, 1], pv = [1, 1]; { let s = 0, p = 1; for (let n = 1; n <= NMAX; n++) { s += 1 / (n * n); if (isPrime(n)) p *= 1 / (1 - 1 / (n * n)); sv[n] = s; pv[n] = p; } }
      const upto = 1 + (NMAX - 1) * K.ease(K.ph(t, 0.6, 6)), nn = Math.floor(upto), fr = upto - nn;
      const at = (a) => (nn >= NMAX ? a[NMAX] : a[nn] + (a[nn + 1] - a[nn]) * fr);
      K.serif("Old Grey's songbook, for every s:", 500, 22, { size: 22, color: col.muted, align: "center" });
      K.math("1 + 1/2ˢ + 1/3ˢ + ⋯  =  ∏ₚ 1/(1 − p⁻ˢ)", 500, 66, { size: 34 });
      K.serif("here, s = 2", 940, 104, { size: 21, color: col.muted, align: "right" });
      K.text(`N = ${nn}`, 940, 138, { size: 20, align: "right", bold: true, color: col.muted });
      // finish perch
      K.seg(X1, 150, X1, 490, { color: col.green, width: 2.4, dash: [8, 6], sketch: false });
      K.text("π²/6 = 1.6449…", X1, 512, { size: 21, align: "center", bold: true, color: col.green });
      K.text("start: 1", X0, 512, { size: 18, align: "center", color: col.muted });
      [[yA, col.blue, "the sum bird stacks the notes 1 + 1/4 + 1/9 + ⋯"], [yB, col.red, "the product bird: one factor for each twig"]].forEach(([y, c, lab]) => { wire(K, X0 - 40, X1 + 40, y, { color: col.axis }); K.text(lab, X0 - 40, y - 82, { size: 19, bold: true, color: c }); });
      // the sum, as stacked notes: each term is a segment of the strip
      for (let n = 2; n <= NMAX; n++) {
        const a = Math.min(n - 1, upto), b = Math.min(n, upto); if (upto <= n - 1) break;
        const v0 = n - 1 <= nn ? sv[n - 1] : at(sv), v1 = n <= nn ? sv[n] : at(sv);
        const x0 = X(v0), x1 = X(v1); K.box(x0, yA - 6, Math.max(1, x1 - x0), 12, { color: null, fill: n % 2 ? col.blue : col.purple, fillAlpha: 0.7 });
        if (n <= 5 && x1 - x0 > 30 && n <= upto) K.text(`1/${n * n}`, (x0 + x1) / 2, yA + 28, { size: 16, align: "center", color: col.muted });
      }
      // the product, one factor per twig (only at primes)
      let prev = 1;
      for (let n = 2; n <= NMAX; n++) { if (!isPrime(n)) continue; if (upto < n - 0.0001) break;
        const v1 = n <= nn ? pv[n] : at(pv), x0 = X(prev), x1 = X(v1);
        K.box(x0, yB - 6, Math.max(1, x1 - x0), 12, { color: null, fill: n % 4 === 1 ? col.red : col.gold, fillAlpha: 0.7 });
        if (n <= 7) { twig(K, (x0 + x1) / 2 - Math.min(24, (x1 - x0) / 2 - 3), yB + 30, Math.min(48, x1 - x0 - 8), 0, { width: 5 }); K.text(String(n), (x0 + x1) / 2, yB + 58, { size: 17, bold: true, align: "center", color: BIRD.twig }); }
        prev = pv[n]; }
      const sx = X(at(sv)), px = X(at(pv));
      bird(K, sx, yA - 6, 1.1, { sing: t });
      bird(K, px, yB - 6, 1.1, { sing: t, color: undefined });
      K.text("sum: 1 + 1/4 + 1/9 + 1/16 + ⋯", 60, 560, { size: 20, color: col.blue, bold: true });
      K.text("product: 1/(1 − 2⁻²) · 1/(1 − 3⁻²) · 1/(1 − 5⁻²) ⋯", 60, 598, { size: 20, color: col.red, bold: true });
      return t < 6.3;
    },
  }));

  // ------------------------------------------------------------------ 14: the chorus's loudness, sung by birds inside a thin band between two wires
  let gzCache = null;
  function gzData() {
    if (gzCache) return gzCache;
    const { psi, lamOverN } = RH.NT.sieve(200000), xs = [], ys = [];
    for (let i = 0; i <= 1400; i++) {
      const x = Math.pow(10, 1.7 + (Math.log10(200000) - 1.7) * (i / 1400)), n = Math.floor(x);
      const Sz = x * lamOverN[n] - psi[n], Gz = Sz - x * Math.log(x) + (1 + GAMMA) * x;
      xs.push(x); ys.push((Gz - LN2PI) / Math.sqrt(x));
    }
    return (gzCache = { xs, ys });
  }
  S("w-gz", () => ({
    draw(K, t) {
      const { col } = K, g = K.g, D = gzData(), BAND = 0.0462, A = K.axes([140, 70, 800, 450], [50, 200000], [-0.1, 0.1], { xlog: true });
      A.frame({ xticks: [[100, "100"], [1000, "1,000"], [10000, "10,000"], [100000, "100,000"]], yticks: [[-0.1, "−0.10"], [-0.05, "−0.05"], [0, "0"], [0.05, "0.05"], [0.1, "0.10"]], xlabel: "x (log scale)" });
      const xa = A.X(50), xb = A.X(200000);
      g.save(); g.fillStyle = col.green; g.globalAlpha = 0.14; g.fillRect(xa, A.Y(BAND), xb - xa, A.Y(-BAND) - A.Y(BAND)); g.restore();
      [BAND, -BAND].forEach((v) => wire(K, xa, xb, A.Y(v), { color: col.gold, width: 3, up: 18, down: 18 }));
      K.text("the thin band between two wires: ±0.0462", xa + 10, A.Y(BAND) - 32, { size: 19, color: col.green, bold: true });
      const n = Math.floor(D.xs.length * K.ease(K.ph(t, 0.3, 5)));
      K.line(D.xs.slice(0, n).map((x, i) => [A.X(x), A.Y(D.ys[i])]), { color: col.blue, width: 2.2 });
      for (let k = 0; k < 13; k++) { const i = 90 + Math.round(k * 100); if (i > n || i > 1399) continue; bird(K, A.X(D.xs[i]), A.Y(D.ys[i]) + 3, 0.62, { sing: k % 3 === 0 ? t : 0, flip: k % 2 === 1 }); }
      K.text("the chorus's loudness, (G(x) − ln 2π) / √x", 150, 32, { size: 22, bold: true, color: col.blue });
      return t < 5.3;
    },
  }));

  // ------------------------------------------------------------------ 13: a treasure-map of the proof's territory, walked backwards from the goal
  function cave(K, x, y) { // base centre (x, y)
    const g = K.g; let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI + (i / 40) * Math.PI, k = 1 + (r() - 0.5) * 0.12; pts.push([x + Math.cos(a) * 78 * k, y + Math.sin(a) * 64 * k]); }
    g.save(); g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.closePath(); g.fillStyle = "#8f7a52"; g.globalAlpha = 0.5; g.fill(); g.globalAlpha = 1; g.strokeStyle = K.col.ink; g.lineWidth = 2.2; g.lineJoin = "round"; g.stroke();
    g.strokeStyle = K.col.ink; g.globalAlpha = 0.35; g.lineWidth = 1.5; [[-52, -20, -36, -26], [-40, -44, -22, -48], [30, -50, 48, -38], [50, -18, 62, -24]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(x + a, y + b); g.lineTo(x + c, y + d); g.stroke(); });
    g.globalAlpha = 0.75; g.fillStyle = K.col.ink; g.beginPath(); g.ellipse(x, y, 24, 30, 0, Math.PI, 0); g.closePath(); g.fill(); g.restore();
    for (let k = 1; k <= 3; k++) { g.save(); g.strokeStyle = K.col.red; g.lineWidth = 2; g.globalAlpha = 0.85 - k * 0.2; g.beginPath(); g.arc(x + 70, y - 14, 8 + k * 11, -0.8, 0.8); g.stroke(); g.restore(); }
  }
  function miniScale(K, cx, cy) {
    const { col } = K;
    K.line([[cx, cy + 4], [cx - 22, cy + 92], [cx + 22, cy + 92]], { color: col.muted, width: 3, close: true, sketch: false });
    K.seg(cx - 58, cy, cx + 58, cy, { color: BIRD.twig, width: 7, sketch: false }); K.dot(cx, cy, 7, col.muted);
    [-58, 58].forEach((dx) => { K.seg(cx + dx, cy, cx + dx - 26, cy + 34, { color: col.muted, width: 1.5, sketch: false }); K.seg(cx + dx, cy, cx + dx + 26, cy + 34, { color: col.muted, width: 1.5, sketch: false });
      K.line([[cx + dx - 30, cy + 34], [cx + dx + 30, cy + 34], [cx + dx + 20, cy + 44], [cx + dx - 20, cy + 44]], { color: col.muted, width: 2.2, close: true, fill: col.muted, fillAlpha: 0.15, sketch: false }); });
  }
  function loom(K, x, y) { // base centre (x, y); 110 wide, 120 tall
    const g = K.g, W = 110, H = 120, top = y - H;
    g.save(); g.fillStyle = BIRD.twig; g.fillRect(x - W / 2 - 6, top - 8, 8, H + 8); g.fillRect(x + W / 2 - 2, top - 8, 8, H + 8); g.fillRect(x - W / 2 - 6, top - 8, W + 14, 8);
    g.strokeStyle = K.col.gold; g.lineWidth = 1.6; g.globalAlpha = 0.9;
    for (let c = 0; c < 9; c++) { const cx = x - W / 2 + 6 + c * ((W - 12) / 8); g.beginPath(); g.moveTo(cx, top); g.lineTo(cx, y); g.stroke(); }
    g.globalAlpha = 1;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) if ((r + c) % 2 === 0) { g.fillStyle = GRASS[(r * 2 + c) % 5]; g.beginPath(); g.roundRect(x - W / 2 + 1 + c * ((W - 12) / 8), top + 8 + r * 20, 12, 16, 3); g.fill(); }
    g.restore();
  }
  function gate(K, x, y, t) {
    const g = K.g; farOne(K, x, y - 4, 84, { t, alpha: 0.7 });
    g.save(); g.fillStyle = "#6b4f33"; g.fillRect(x - 40, y - 62, 9, 62); g.fillRect(x + 31, y - 62, 9, 62);
    g.strokeStyle = "#6b4f33"; g.lineWidth = 9; g.beginPath(); g.arc(x, y - 62, 35.5, Math.PI, 0); g.stroke(); g.restore();
  }
  function weather(K, x, y) {
    const g = K.g; K.dot(x + 22, y - 48, 22, K.col.gold, 0.8);
    g.save(); g.strokeStyle = K.col.gold; g.lineWidth = 2.4; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(x + 22 + Math.cos(a) * 29, y - 48 + Math.sin(a) * 29); g.lineTo(x + 22 + Math.cos(a) * 38, y - 48 + Math.sin(a) * 38); g.stroke(); } g.restore();
    g.save(); g.fillStyle = K.col.muted; g.globalAlpha = 0.3; g.beginPath(); [[-26, -16, 20], [-4, -26, 24], [20, -16, 20]].forEach(([dx, dy, r]) => g.arc(x + dx, y + dy, r, 0, Math.PI * 2)); g.fill();
    g.globalAlpha = 1; g.strokeStyle = K.col.muted; g.lineWidth = 2; g.beginPath(); g.arc(x - 26, y - 16, 20, Math.PI * 0.55, Math.PI * 1.5); g.arc(x - 4, y - 26, 24, Math.PI * 1.1, Math.PI * 1.9); g.arc(x + 20, y - 16, 20, Math.PI * 1.5, Math.PI * 0.45); g.stroke(); g.restore();
  }
  S("w-map", () => {
    const wp = [[120, 478], [200, 405], [290, 382], [385, 452], [480, 492], [580, 468], [680, 388], [748, 330], [830, 262]], ST = 14, P = smooth(wp, ST), stops = [0, 2, 4, 6, 8].map((i) => i * ST);
    return {
      draw(K, t) {
        const { col } = K, g = K.g, n = Math.round(K.ease(K.ph(t, 0.5, 5.5)) * (P.length - 1));
        K.wash(250, 360, 230, 150, GRASS[0], 0.12, 5); K.wash(700, 400, 240, 150, GRASS[1], 0.12, 9); K.wash(840, 170, 150, 110, col.gold, 0.1, 2);
        // off to the side: E and F
        K.box(20, 14, 540, 192, { color: col.muted, width: 1.6, dash: [7, 6], r: 16, sketch: false });
        K.text("background facts, visited later", 544, 36, { size: 17, color: col.muted, align: "right" });
        gate(K, 150, 154, t); K.text("E · the Far Ones' gate", 150, 182, { size: 18, bold: true, align: "center" });
        weather(K, 400, 150); K.text("F · the weather", 400, 182, { size: 18, bold: true, align: "center" });
        // landmarks
        wire(K, 40, 200, 470, { color: col.gold, width: 4, up: 26, down: 12 });
        [70, 118, 164].forEach((bx, i) => bird(K, bx, 470, 0.7, { flip: i === 1 }));
        K.text("the goal:\nthe middle wire", 120, 520, { size: 19, bold: true, align: "center", color: col.gold });
        cave(K, 290, 382); K.text("A · the echo cave", 290, 250, { size: 19, bold: true, align: "center" }); K.text("(the trap)", 290, 274, { size: 17, align: "center", color: col.muted });
        [440, 476, 512, 548].forEach((px, i) => pile(K, px, 490, 34, 8, 4 + i)); K.text("B · four twig piles", 495, 542, { size: 19, bold: true, align: "center" });
        miniScale(K, 680, 292); K.text("D · the balance", 680, 244, { size: 19, bold: true, align: "center" });
        loom(K, 830, 262); K.text("C · the loom, many passes", 830, 100, { size: 19, bold: true, align: "center" });
        // the dashed path, walked backwards from the goal
        const walked = P.slice(0, n + 1);
        if (walked.length > 1) K.line(walked, { color: col.ink, width: 3, dash: [3, 9], sketch: false });
        stops.forEach((s, i) => { if (i === 0) return; if (n >= s) { const [x, y] = P[s]; K.dot(x, y, 14, col.green); K.text(String(i), x, y + 1, { size: 17, bold: true, align: "center", color: K.surface }); } });
        const h = P[n], h2 = P[Math.max(0, n - 4)];
        bird(K, h[0], h[1] - 16, 0.7, { flip: h[0] < h2[0] });
        K.serif("walk it backwards: 1 → 2 → 3 → 4", 640, 600, { size: 24, color: col.green, align: "center" });
        return t < 6.2;
      },
    };
  });

  // ------------------------------------------------------------------ 25: the balance tilts a tiny bit; the tilt is the chorus
  S("w-gap", () => {
    const f = (tt) => 0.6 * Math.sin(tt * 1.1) + 0.45 * Math.sin(tt * 2.3 + 1) + 0.3 * Math.sin(tt * 4.1 + 2);
    return {
      draw(K, t) {
        const { col } = K, g = K.g, tilt = -0.045 * f(t);
        const [L, R] = scale(K, 500, 190, 260, tilt, 200);
        K.text("by its twigs", L[0], 60, { size: 24, bold: true, align: "center" });
        K.text("by its size", R[0], 60, { size: 24, bold: true, align: "center" });
        // left pan: prime twigs, each as long as ln p
        const pal = { 2: col.blue, 3: col.red, 5: col.green, 7: col.purple, 11: BIRD.twig }, rows = [[2, 6], [3, 4], [5, 3], [7, 2], [11, 2]];
        rows.forEach(([p, c], i) => { const len = Math.log(p) * 20; for (let k = 0; k < c; k++) { const x0 = L[0] - 80 + (i % 2) * 6 + k * (len + 5), y = L[1] - 8 - i * 9; if (x0 + len < L[0] + 86) K.seg(x0, y, x0 + len, y, { color: pal[p], width: 5, sketch: false }); } });
        K.text("prime twigs, each weighted by ln p", L[0], L[1] + 56, { size: 17, align: "center", color: col.muted });
        K.math("Σ ln p · (overhang)", L[0], L[1] + 92, { size: 24, color: col.blue });
        // right pan: the bundle, its size measured by a Far One
        WEAVE.bundle(K, R[0], R[1] - 28, 150, 15);
        farOne(K, 905, 290, 190, { t });
        K.text("its size, measured by a Far One", R[0], R[1] + 56, { size: 17, align: "center", color: col.muted });
        K.math("b · ( x ln x − (1 + γ) x )", R[0] - 10, R[1] + 92, { size: 24, color: col.gold });
        // the gap, as a wave
        const wy = 490, X0 = 220, X1 = 840;
        K.seg(X0, wy, X1, wy, { color: col.axis, width: 1.5, dash: [5, 6], sketch: false });
        const pts = []; for (let i = 0; i <= 160; i++) { const u = i / 160; pts.push([X0 + (X1 - X0) * u, wy - f(t - (1 - u) * 7) * 26]); }
        K.line(pts, { color: col.red, width: 3.2, sketch: false });
        K.dot(X1, wy - f(t) * 26, 7, col.red);
        perch(K, 110, wy + 30); bird(K, 110, wy + 28, 1.3, { sing: t });
        K.text("balanced", X1, wy + 44, { size: 16, align: "right", color: col.muted });
        K.text("the tiny tilt, heard as a wave:", 540, 566, { size: 20, align: "center", color: col.muted });
        K.math("gap  =  b · G(x)", 540, 604, { size: 32, color: col.red });
        return true;
      },
    };
  });

  // ------------------------------------------------------------------ 30: a Far One measures a lattice of light with a glowing ruler
  S("w-period", () => ({
    draw(K, t) {
      const { col } = K, g = K.g;
      const panel = (x0, title, sub, basis, u, seed, rulerOn) => {
        const x1 = x0 + 290, y0 = 100, y1 = 470, o = [x0 + 80, y1 - 100], P = (a, b) => [o[0] + (a * basis[0][0] + b * basis[1][0]) * u, o[1] - (a * basis[0][1] + b * basis[1][1]) * u];
        K.box(x0, y0, 290, y1 - y0, { color: col.axis, width: 1.6, fill: col.gold, fillAlpha: 0.05, r: 14, sketch: false });
        K.text(title, x0 + 145, 76, { size: 20, bold: true, align: "center" });
        g.save(); g.beginPath(); g.rect(x0 + 4, y0 + 4, 282, y1 - y0 - 8); g.clip();
        const tile = [P(0, 0), P(1, 0), P(1, 1), P(0, 1), P(0, 0)];
        K.line(tile, { color: col.gold, width: 3, fill: col.gold, fillAlpha: 0.2 + 0.1 * Math.sin(t * 2), sketch: false });
        for (let a = -4; a <= 5; a++) for (let b = -3; b <= 5; b++) { const [x, y] = P(a, b); if (x > x0 && x < x1 && y > y0 && y < y1) { K.dot(x, y, 12, col.gold, 0.12); K.dot(x, y, 5.5, col.blue); } }
        g.restore();
        const c = [(tile[0][0] + tile[2][0]) / 2, (tile[0][1] + tile[2][1]) / 2];
        K.text("area", c[0], c[1], { size: 17, bold: true, align: "center", color: col.gold, halo: true });
        K.text(sub, x0 + 145, y1 + 28, { size: 17, align: "center", color: col.muted });
        // the glowing ruler lies along the bottom edge of the tile
        if (rulerOn) {
          const a = P(0, 0), b = P(1, 0), L = Math.hypot(b[0] - a[0], b[1] - a[1]), yy = a[1] + 16;
          g.save(); g.shadowColor = col.gold; g.shadowBlur = 16; g.fillStyle = col.gold; g.globalAlpha = 0.85; g.beginPath(); g.roundRect(a[0], yy - 7, L, 14, 4); g.fill(); g.restore();
          for (let k = 0; k <= 8; k++) K.seg(a[0] + (L * k) / 8, yy - 7, a[0] + (L * k) / 8, yy - (k % 4 === 0 ? 1 : 3), { color: col.ink, width: 1.4, sketch: false });
          return [a[0] + L, yy];
        }
        return [x0, y0];
      };
      const phase = Math.floor(t / 3.5) % 2;
      const e1 = panel(30, "Z[i]: the square lattice", "complex multiplication", [[1, 0], [0, 1]], 70, 1, phase === 0);
      const e2 = panel(345, "Z[ω]: the hexagonal lattice", "complex multiplication", [[1, 0], [0.5, Math.sqrt(3) / 2]], 78, 2, phase === 1);
      const end = phase === 0 ? e1 : e2;
      farOne(K, 830, 330, 210, { t });
      K.seg(830, 250, end[0] + 8, end[1], { color: col.gold, width: 1.8, dash: [4, 6], sketch: false, alpha: 0.9 });
      K.serif("Chowla–Selberg:", 815, 372, { size: 24, align: "center" });
      K.serif("the areas come out exactly,", 815, 406, { size: 19, align: "center", color: col.muted });
      K.wash(815, 448, 150, 24, col.gold, 0.16, 5);
      K.serif("and Euler's γ appears", 815, 448, { size: 21, align: "center" });
      K.serif("γ: Euler's constant, 0.5772…", 815, 490, { size: 20, align: "center", color: col.gold });
      wire(K, 60, 640, 590, { color: col.axis, up: 10, down: 20 });
      [150, 250, 345, 440, 540].forEach((x, i) => bird(K, x, 590, 0.8, { flip: false }));
      K.text("the colony watches", 640, 624, { size: 17, align: "right", color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 34: the colony's budget
  S("w-ineq", () => ({
    draw(K, t) {
      const { col } = K, g = K.g, a = K.ease(K.ph(t, 0.2, 0.9)), b = K.ease(K.ph(t, 1, 2)), c = K.ease(K.ph(t, 2.6, 3.4)), mm = 4 + 6 * K.ease(K.ph(t, 0.8, 4)), X = 100;
      // the ledger
      K.box(30, 20, 610, 600, { color: BIRD.twig, width: 3, fill: col.gold, fillAlpha: 0.07, r: 18, seed: 5 });
      K.text("The colony's budget (in units of b)", 60, 60, { size: 24, bold: true });
      K.seg(60, 90, 610, 90, { color: col.ink, width: 2 });
      g.globalAlpha = a;
      K.text("line item", 60, 120, { size: 17, color: col.muted }); K.text("total", 400, 120, { size: 17, color: col.muted, align: "center" }); K.text("per pass (÷ m)", 560, 120, { size: 17, color: col.muted, align: "center" });
      K.text("overhead, shared\nover m passes", 60, 170, { size: 20, bold: true, color: col.gold });
      K.math("x", 400, 176, { size: 32, color: col.gold, italic: true }); K.math("x/m", 560, 176, { size: 32, color: col.gold, italic: true });
      K.seg(60, 218, 610, 218, { color: col.grid, width: 1.5, sketch: false });
      K.text("weaving cost,\nm passes", 60, 262, { size: 20, bold: true, color: col.green });
      K.math("m²", 400, 268, { size: 32, color: col.green, italic: true }); K.math("m", 560, 268, { size: 32, color: col.green, italic: true });
      g.globalAlpha = 1;
      g.globalAlpha = b;
      K.seg(60, 312, 610, 312, { color: col.ink, width: 2 });
      K.text("the gap,\nonce per pass:", 60, 352, { size: 20, bold: true, color: col.blue });
      K.math("m · G(x)  ≤  x + m²", 400, 358, { size: 30 });
      g.globalAlpha = c;
      K.arrow(560, 394, 560, 440, { color: col.ink, width: 2.5 }); K.text("÷ m", 590, 418, { size: 24, bold: true });
      K.wash(330, 505, 270, 46, col.green, 0.16, 7);
      K.math("G(x)  ≤  x/m  +  m", 330, 505, { size: 44 });
      K.text("an allowance of about √x", 60, 580, { size: 20, bold: true, color: col.gold });
      g.globalAlpha = 1;
      // the scales of the allowance
      const base = 520, u = 14, ax = 700, hb = X / mm * u, hm = mm * u, allow = Math.sqrt(X) * u;
      K.seg(ax - 10, base, 960, base, { color: col.axis, width: 2, sketch: false });
      const bar = (x, h, c, lab, over) => { K.box(x, base - h, 56, h, { color: c, width: 2, fill: c, fillAlpha: 0.5, r: 5, sketch: false }); if (over > 0) K.box(x, base - h, 56, over, { color: null, fill: col.red, fillAlpha: 0.6, r: 5 }); K.text(lab, x + 28, base + 24, { size: 19, bold: true, align: "center", color: c }); };
      bar(730, hb, col.gold, "x/m", Math.max(0, hb - allow)); bar(820, hm, col.green, "m", Math.max(0, hm - allow));
      K.seg(ax, base - allow, 950, base - allow, { color: col.gold, width: 2.4, dash: [8, 6], sketch: false });
      K.text("allowance\n≈ √x", 952, base - allow - 30, { size: 17, align: "right", color: col.gold, bold: true });
      bird(K, 758, base - hb - 2, 0.7, { sing: t });
      K.text(`x = 100,  m = ${mm.toFixed(1)}`, 830, 120, { size: 20, bold: true, align: "center" });
      if (Math.abs(mm - 10) < 0.05) K.text("balanced at m = √x", 830, 570, { size: 19, bold: true, align: "center", color: col.green });
      return t < 4.2;
    },
  }));

  // ------------------------------------------------------------------ 35: the valley, and Kito walking to the bottom (draggable)
  S("w-minimum", () => {
    let m = 2, touched = false, A = null;
    const X = 100, f = (v) => X / v + v, d = (v) => 1 - X / (v * v);
    return {
      enter() { if (!touched) m = 2; },
      hit(x, y) { return A && Math.hypot(A.X(m) - x, A.Y(f(m)) - y) < 34; },
      press(x, y) { if (!A) return false; const near = Math.hypot(A.X(m) - x, A.Y(f(m)) - y) < 40; if (near) touched = true; return near; },
      drag(x) { if (!A) return; const v = 1 + ((x - A.X(1)) / (A.X(40) - A.X(1))) * 39; m = Math.max(1.2, Math.min(39.5, v)); if (Math.abs(m - 10) < 0.35) m = 10; },
      draw(K, t) {
        const { col } = K, g = K.g;
        A = K.axes([110, 40, 830, 450], [1, 40], [0, 110]);
        if (!touched) m = 2 + 8 * K.ease(K.ph(t, 0.6, 3.6));
        // far hills, then the valley floor
        [[0.06, 0.55, 0.9, 150, 2.1], [0.05, 0.4, 1.7, 110, 3.3]].forEach(([al, amp, ph, base, fr]) => {
          g.save(); g.fillStyle = col.green; g.globalAlpha = al; g.beginPath(); g.moveTo(110, A.Y(0));
          for (let i = 0; i <= 80; i++) { const x = 110 + (830 * i) / 80; g.lineTo(x, 40 + base * 0.4 + 60 * (1 - amp * (0.5 + 0.5 * Math.sin(i / 80 * Math.PI * fr + ph)))); }
          g.lineTo(940, A.Y(0)); g.closePath(); g.fill(); g.restore(); });
        const pts = []; for (let i = 0; i <= 300; i++) { const v = 1 + (39 * i) / 300; pts.push([A.X(v), A.Y(f(v))]); }
        g.save(); g.beginPath(); g.moveTo(A.X(1), A.Y(0)); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(A.X(40), A.Y(0)); g.closePath(); g.fillStyle = "#8b6b3e"; g.globalAlpha = 0.5; g.fill(); g.restore();
        A.frame({ xticks: [[1, "1"], [10, "10"], [20, "20"], [30, "30"], [40, "40"]], yticks: [[0, "0"], [50, "50"], [100, "100"]], xlabel: "number of passes m" });
        A.curve((v) => X / v, 1, 40, 200, { color: col.gold, width: 1.8, dash: [6, 6] });
        A.curve((v) => v, 1, 40, 50, { color: col.green, width: 1.8, dash: [6, 6] });
        K.line(pts, { color: col.blue, width: 4 });
        K.text("overhead x/m", A.X(38), A.Y(X / 38) - 18, { size: 19, color: col.gold, bold: true, align: "right" });
        K.text("weaving m", A.X(31), A.Y(31) - 18, { size: 19, color: col.green, bold: true, align: "right" });
        K.text("the valley path: x/m + m", A.X(14), A.Y(f(14)) - 130, { size: 20, color: col.blue, bold: true, align: "left" });
        // a flag at the bottom of the valley
        const fx = A.X(7.4), fy = A.Y(f(7.4));
        K.seg(fx, fy, fx, fy - 54, { color: col.ink, width: 2.4, sketch: false }); K.line([[fx, fy - 54], [fx + 28, fy - 46], [fx, fy - 38]], { color: col.gold, width: 2, close: true, fill: col.gold, fillAlpha: 0.7, sketch: false });
        const s = d(m), y = f(m), h = 6;
        A.clip(() => K.seg(A.X(m - h), A.Y(y - s * h), A.X(m + h), A.Y(y + s * h), { color: col.gold, width: 2.4, sketch: false }));
        K.dot(A.X(m), A.Y(y), 11, col.red); K.ring(A.X(m), A.Y(y), 11, { color: K.surface, width: 2 });
        bird(K, A.X(m), A.Y(y) - 8, 0.85, { flip: m < 10 ? false : true });
        const at = Math.abs(m - 10) < 1e-6;
        K.text(`x = 100   ·   m = ${m.toFixed(1)}   ·   x/m + m = ${y.toFixed(1)}   ·   slope ${s.toFixed(2)}`, 110, 580, { size: 22, bold: true });
        if (at) K.text("the bottom: m = √100 = 10, where the bound is 20 = 2√x", 110, 616, { size: 21, bold: true, color: col.green });
        return !touched && t < 3.8;
      },
    };
  });

  // ------------------------------------------------------------------ 36: a clean chain versus a tangled wall
  S("w-barrier", () => ({
    draw(K, t) {
      const { col } = K, g = K.g, x = 1e12, A = K.axes([80, 30, 430, 360], [1, 1e9], [1e5, 1e12], { xlog: true, ylog: true });
      A.frame({ xticks: [[1, "1"], [1e3, "10³"], [1e6, "10⁶"], [1e9, "10⁹"]], yticks: [[1e6, "10⁶"], [1e8, "10⁸"], [1e10, "10¹⁰"], [1e12, "10¹²"]], xlabel: "passes m   (x = 10¹²)" });
      const up = Math.pow(10, 9 * K.ease(K.ph(t, 0.3, 3.5)));
      A.clip(() => {
        K.seg(A.X(1), A.Y(1e6), A.X(1e9), A.Y(1e6), { color: col.green, width: 1.6, dash: [6, 6], sketch: false });
        K.seg(A.X(1), A.Y(1e8), A.X(1e9), A.Y(1e8), { color: col.red, width: 1.6, dash: [6, 6], sketch: false });
        A.curve((m) => x / m + m, 1, up, 300, { color: col.blue, width: 3 });
        A.curve((m) => x / m + m * m, 1, up, 300, { color: col.red, width: 3 });
      });
      K.text("√x", A.X(1e9) + 8, A.Y(1e6), { size: 20, bold: true, color: col.green });
      K.text("x^{2/3}", A.X(1e9) + 8, A.Y(1e8), { size: 20, bold: true, color: col.red });
      if (up >= 1e6) { K.dot(A.X(1e6), A.Y(2e6), 9, col.blue); K.text("this proof: best ≈ √x", A.X(1e6), A.Y(2e6) + 34, { size: 19, bold: true, color: col.blue, align: "center", halo: true }); }
      const mm = Math.cbrt(x / 2);
      if (up >= mm) { K.dot(A.X(mm), A.Y(x / mm + mm * mm), 9, col.red); K.text("compounding: stuck\nnear x^{2/3}", A.X(mm) + 14, A.Y(x / mm + mm * mm) - 52, { size: 19, bold: true, color: col.red, align: "left", halo: true }); }
      K.text("blue: G ≤ x/m + m", 90, 506, { size: 20, color: col.blue, bold: true });
      K.text("red:  G ≤ x/m + m²", 90, 540, { size: 20, color: col.red, bold: true });
      // the clean chain
      K.box(590, 20, 380, 270, { color: col.green, width: 2.2, fill: col.green, fillAlpha: 0.07, r: 16, sketch: false });
      K.text("a clean chain", 780, 52, { size: 22, bold: true, align: "center", color: col.green });
      K.text("this proof: total cost m²", 780, 82, { size: 17, align: "center", color: col.muted });
      const nl = Math.min(7, Math.floor(K.ph(t, 0.4, 3) * 7) + 1);
      for (let i = 0; i < nl; i++) K.ring(640 + i * 44, 170, 25, { color: i % 2 ? GRASS[2] : BROWN[0], width: 5 });
      bird(K, 640 + (nl - 1) * 44, 140, 0.65, { sing: t });
      K.text("each pass touches only\nthe one before it", 780, 236, { size: 17, align: "center", color: col.muted });
      // the tangled wall
      K.box(590, 310, 380, 310, { color: col.red, width: 2.2, fill: col.red, fillAlpha: 0.06, r: 16, sketch: false });
      K.text("a tangled wall", 780, 342, { size: 22, bold: true, align: "center", color: col.red });
      K.text("compounding: total cost m³", 780, 372, { size: 17, align: "center", color: col.muted });
      const nc = Math.min(7, Math.floor(K.ph(t, 0.6, 3.4) * 7) + 1), cx = (i) => 640 + i * 48, yt = 440, yb = 530;
      for (let i = 0; i < nc; i++) { K.seg(cx(i), yt, cx(i), yb, { color: BROWN[i % 4], width: 5, sketch: false });
        for (let j = 0; j < i; j++) for (const [y0, dir] of [[yt, -1], [yb, 1]]) { g.save(); g.strokeStyle = col.red; g.globalAlpha = 0.5; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx(j), y0); g.quadraticCurveTo((cx(i) + cx(j)) / 2, y0 + dir * 5 * (i - j), cx(i), y0); g.stroke(); g.restore(); }
        g.save(); g.strokeStyle = col.red; g.globalAlpha = 0.35; g.lineWidth = 1.5; for (let j = 0; j < i; j++) { g.beginPath(); g.moveTo(cx(j), yt + 6); g.lineTo(cx(i), yb - 6); g.moveTo(cx(j), yb - 6); g.lineTo(cx(i), yt + 6); g.stroke(); } g.restore(); }
      K.text("each pass re-weaves everything\nbefore it", 780, 586, { size: 17, align: "center", color: col.muted });
      return t < 3.7;
    },
  }));

  // ------------------------------------------------------------------ 39: the whole chain, as a strip of five little colony scenes
  S("w-forward", () => {
    const W = 172, GAP = 28, Y0 = 100, H = 330, px = (i) => 14 + i * (W + GAP);
    const labels = ["√x weaving\npasses", "a limit on one\npile of twigs", "Fourier brings the\nfour piles back", "a volume cap on\nthe chorus, at\nthe dawns", "the echo trap:\nno bird above\nthe middle wire"];
    const art = [
      (K, cx, t) => { loom(K, cx, 370); bird(K, cx, 370 - 120 - 8, 0.7, { sing: t }); K.text("√x passes", cx, 150, { size: 17, align: "center", color: K.col.green, bold: true }); },
      (K, cx, t) => { K.seg(cx - 72, 290, cx + 72, 290, { color: K.col.green, width: 2.6, dash: [7, 6], sketch: false }); K.text("limit", cx, 268, { size: 17, bold: true, align: "center", color: K.col.green }); pile(K, cx, 372, 96, 26, 5); },
      (K, cx, t) => { [-66, -22, 22, 66].forEach((dx, i) => { pile(K, cx + dx, 372, 34, 9, 8 + i); K.text(String(i + 1), cx + dx, 396, { size: 16, align: "center", color: K.col.muted }); }); song(K, cx - 78, cx + 78, 290, (u) => 16 * Math.sin(u * 3), { cycles: 3, ph: t * 2, color: K.col.gold, width: 2.6 }); K.text("Fourier waves", cx, 246, { size: 16, align: "center", color: K.col.muted }); },
      (K, cx, t) => { const g = K.g; [[0.15, 0.4], [0.58, 0.82]].forEach(([a, b], i) => { g.save(); g.fillStyle = K.col.gold; g.globalAlpha = 0.18; g.fillRect(cx - 78 + 156 * a, 240, 156 * (b - a), 160); g.restore(); K.text(`dawn ${i + 1}`, cx - 78 + 156 * (a + b) / 2, 226, { size: 15, align: "center", bold: true, color: K.col.gold }); });
        [300, 360].forEach((y) => wire(K, cx - 80, cx + 80, y, { color: K.col.gold, width: 2.6, up: 14, down: 14 }));
        const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([cx - 78 + 156 * u, 330 + 12 * Math.sin(u * 17) * Math.cos(u * 4)]); } K.line(pts, { color: K.col.blue, width: 2.2, sketch: false });
        bird(K, cx - 40, 363, 0.5); bird(K, cx + 30, 363, 0.5, { flip: true }); },
      (K, cx, t) => { const yA = [250, 330, 410]; yA.forEach((y, i) => wire(K, cx - 80, cx + 80, y, { color: i === 1 ? K.col.gold : K.col.axis, width: i === 1 ? 3.5 : 2, up: 14, down: 14 }));
        [-50, 0, 50].forEach((dx, i) => bird(K, cx + dx, 330, 0.6, { flip: i === 1 }));
        bird(K, cx, 268, 0.7, { ghost: true, color: K.col.red }); K.seg(cx - 28, 224, cx + 28, 268, { color: K.col.red, width: 3, sketch: false }); K.seg(cx + 28, 224, cx - 28, 268, { color: K.col.red, width: 3, sketch: false }); },
    ];
    return {
      draw(K, t) {
        const { col } = K, g = K.g;
        K.serif("one story, run forward from the loom", 500, 48, { size: 26, align: "center", color: col.muted });
        for (let i = 0; i < 5; i++) {
          const a = K.ease(K.ph(t, 0.3 + i * 0.8, 0.9 + i * 0.8)), last = i === 4, c = last ? col.gold : col.green; if (a <= 0) continue;
          g.save(); g.globalAlpha = a;
          K.box(px(i), Y0, W, H, { color: c, width: 2.4, fill: c, fillAlpha: 0.07, r: 16, sketch: false });
          K.dot(px(i) + 22, Y0 + 22, 14, c); K.text(String(i + 1), px(i) + 22, Y0 + 23, { size: 17, bold: true, align: "center", color: K.surface });
          art[i](K, px(i) + W / 2, t);
          K.text(labels[i], px(i) + W / 2, Y0 + H + 36, { size: 17, bold: true, align: "center", lh: 1.25 });
          g.restore();
          if (i < 4) { g.save(); g.globalAlpha = a; K.arrow(px(i) + W + 4, Y0 + H / 2, px(i) + W + GAP - 4, Y0 + H / 2, { color: col.green, width: 2.6, head: 11 }); g.restore(); }
        }
        const f = K.ease(K.ph(t, 4.4, 5.2));
        if (f > 0) { g.save(); g.globalAlpha = f; K.wash(500, 590, 280, 30, col.gold, 0.2, 3); K.serif("…and so the Riemann Hypothesis", 500, 590, { size: 30, align: "center", bold: true }); g.restore(); }
        return t < 5.4;
      },
    };
  });

  // ------------------------------------------------------------------ 41: eggs on a shelf, hatching into results
  const EGG = { fill: "#f1e4bd", edge: "#8b6b3e", speck: "#b39a63" };
  function egg(K, cx, cy, h, sealed) {
    const g = K.g, rx = 38, ry = 50, path = () => { g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); };
    const draw = () => { path(); g.fillStyle = EGG.fill; g.globalAlpha = sealed ? 0.55 : 1; g.fill(); g.globalAlpha = 1; g.strokeStyle = EGG.edge; g.lineWidth = 2.4; g.setLineDash(sealed ? [6, 5] : []); g.stroke(); g.setLineDash([]);
      g.fillStyle = EGG.speck; [[-14, 18], [10, 26], [18, -6], [-22, -2], [4, -22]].forEach(([dx, dy]) => { g.beginPath(); g.arc(cx + dx, cy + dy, 2.2, 0, Math.PI * 2); g.fill(); }); };
    g.save();
    if (h <= 0.02) { draw(); g.restore(); return; }
    const zz = []; for (let i = 0; i <= 8; i++) zz.push([cx - rx - 4 + (i * (2 * rx + 8)) / 8, cy - 4 + (i % 2 ? -9 : 9)]);
    const rise = Math.min(1, h * 1.3);
    bird(K, cx - 6, cy + 40 - 26 * rise, 1.15);
    g.save(); g.beginPath(); zz.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineTo(cx + rx + 4, cy + ry + 6); g.lineTo(cx - rx - 4, cy + ry + 6); g.closePath(); g.clip(); draw(); g.restore();
    g.save(); g.translate(cx + 40 * h, cy - 28 - 30 * h); g.rotate(0.7 * h); g.translate(-cx, -(cy - 28));
    g.beginPath(); zz.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.lineTo(cx + rx + 4, cy - ry - 6); g.lineTo(cx - rx - 4, cy - ry - 6); g.closePath(); g.clip(); draw(); g.restore();
    g.restore();
  }
  S("w-ifholds", () => ({
    draw(K, t) {
      const { col } = K, g = K.g;
      K.serif("assuming GRH…", 500, 44, { size: 34, align: "center", color: col.ink });
      const items = ["Miller's primality\ntest is correct", "primes in progressions:\nerror only about √x", "no Siegel zeros:\nconstants explicit", "small non-squares:\nbelow 2(ln p)²"];
      const plank = (y) => { g.save(); g.fillStyle = BIRD.twig; g.globalAlpha = 0.9; g.beginPath(); g.roundRect(50, y, 900, 14, 5); g.fill(); g.restore(); };
      plank(250);
      items.forEach((s, i) => {
        const cx = 150 + i * 235, h = K.ease(K.ph(t, 0.4 + i * 0.8, 1.6 + i * 0.8));
        egg(K, cx, 194, h, false);
        K.text(s, cx, 292, { size: 18, bold: true, align: "center", lh: 1.25 });
        if (h >= 1) K.text("✓ theorem", cx, 366, { size: 19, bold: true, align: "center", color: col.green });
      });
      K.text("the author's previews: not in the code", 50, 398, { size: 19, bold: true, color: col.muted });
      plank(520);
      ["RH for all\nnumber fields", "Weil and Deligne\nby signs", "K-groups of\nthe integers"].forEach((s, i) => {
        const cx = 200 + i * 300; egg(K, cx, 466, 0, true);
        K.text("?", cx, 468, { size: 38, bold: true, align: "center", color: "#6b5a3a" });
        K.text(s, cx, 560, { size: 18, align: "center", color: col.muted, lh: 1.25 });
      });
      return t < 4.4;
    },
  }));

  // ------------------------------------------------------------------ 42: Old Grey's map, scratched on bark
  function knot(K, x, y, c) { K.ring(x - 7, y, 14, { color: c, width: 4 }); K.ring(x + 7, y, 14, { color: c, width: 4 }); K.ring(x, y, 8, { color: c, width: 2.4, alpha: 0.6 }); }
  S("w-handmap", () => ({
    draw(K, t) {
      const { col } = K, g = K.g;
      [[0.1, 3], [0.06, 11], [0.05, 19]].forEach(([al, sd], i) => K.wash(500, 320, 490 - i * 8, 312 - i * 6, "#8b6b3e", al, sd));
      g.save(); g.strokeStyle = "#8b6b3e"; g.globalAlpha = 0.18; g.lineWidth = 1.6;
      for (let k = 0; k < 16; k++) { const x = 80 + k * 56; g.beginPath(); for (let y = 30; y <= 610; y += 20) { const xx = x + Math.sin(y * 0.03 + k * 1.7) * 7; y === 30 ? g.moveTo(xx, y) : g.lineTo(xx, y); } g.stroke(); } g.restore();
      const node = (x, y, w, h, c, lines, i, dash) => {
        const f = K.ease(K.ph(t, 0.2 + i * 0.45, 0.7 + i * 0.45)); if (f <= 0) return false;
        g.globalAlpha = f; K.box(x, y, w, h, { color: c, width: 2.8, r: 14, seed: 3 + i, dash });
        lines.forEach(([s, sz, bold, cc], k) => K.text(s, x + w / 2, y + h / 2 + (k - (lines.length - 1) / 2) * 27, { size: sz, bold, align: "center", color: cc || col.ink }));
        g.globalAlpha = 1; return f >= 1;
      };
      // (M): a spot marked with a knot that the inspector checked
      const fm = K.ease(K.ph(t, 0.2, 0.7));
      node(40, 30, 440, 100, col.purple, [["(M): divisibility against size", 21, true], ["compared m times", 17, false, col.muted], ["from the Lean code, inspector-checked", 16, false, col.purple]], 0, [8, 6]);
      if (fm > 0) { g.globalAlpha = fm; knot(K, 74, 80, col.green); g.globalAlpha = 1; }
      node(520, 30, 440, 100, col.green, [["B and C: two estimates", 21, true], ["helper characters; proved from known theorems", 17, false, col.muted]], 1);
      const a1 = node(300, 200, 400, 70, col.green, [["Estimate A: one bin, then all primes", 21, true]], 2);
      if (a1) { K.arrow(260, 136, 380, 196, { color: col.ink, width: 2.6, head: 12 }); K.arrow(740, 136, 620, 196, { color: col.ink, width: 2.6, head: 12 }); }
      const a2 = node(300, 330, 400, 70, col.green, [["G(x) ≤ x^{½+ε}, on windows", 21, true]], 3);
      if (a2) K.arrow(500, 274, 500, 326, { color: col.ink, width: 2.6, head: 12 });
      const a3 = node(350, 460, 300, 70, col.gold, [["the Riemann Hypothesis", 21, true]], 4);
      if (a3) K.arrow(500, 404, 500, 456, { color: col.ink, width: 2.6, head: 12 });
      if (a3) {
        K.text("the road: written out\nby hand, in ink", 730, 410, { size: 18, bold: true, color: col.green });
        K.text("(Parts I–II of the draft)", 730, 466, { size: 17, color: col.muted });
        K.text("being written up, section by section", 40, 596, { size: 18, color: col.purple, bold: true });
      }
      // Old Grey scratching with a twig
      perch(K, 880, 604); bird(K, 880, 602, 1.5, { flip: true, color: GREY });
      K.seg(838, 560, 790, 590, { color: BIRD.twig, width: 4 });
      K.line([[790, 590], [775, 584], [760, 592], [745, 585]], { color: col.ink, width: 2.2, sketch: false, alpha: 0.7 });
      return t < 2.8;
    },
  }));

  // ------------------------------------------------------------------ 43: a bird flies a figure-eight; the divisibility data
  S("w-lemniscate", () => {
    const V = DATA_LEMN, ns = V["3"].map((_, i) => 5 + 4 * i);
    const L = (th) => { const s = Math.sin(th), d = 1 + s * s; return [840 + 118 * Math.cos(th) / d, 190 + 118 * Math.sin(th) * Math.cos(th) / d * 1.5]; };
    return {
      draw(K, t) {
        const { col } = K, A = K.axes([100, 90, 520, 390], [0, 205], [0, 80]);
        A.frame({ xticks: [[1, "1"], [50, "50"], [100, "100"], [150, "150"], [200, "200"]], yticks: [[0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"]], xlabel: "n, which derivative" });
        K.text("how many times p divides the n-th derivative", 60, 24, { size: 21, bold: true });
        K.text("1,  −12,  3024,  −4390848,  21224560896,  …", 60, 54, { size: 18, color: col.muted });
        const upto = K.ease(K.ph(t, 0.3, 3.8)) * 205;
        [[3, col.blue], [7, col.green], [11, col.purple]].forEach(([p, c]) => {
          const k = p / (p * p - 1);
          A.curve((n) => n * k, 1, Math.max(1.01, upto), 60, { color: c, width: 1.8, dash: [7, 6], alpha: 0.8 });
          V[String(p)].forEach((e, i) => { if (ns[i] <= upto) K.dot(A.X(ns[i]), A.Y(e), 4.5, c); });
          if (upto >= 200) K.text(`p = ${p}`, A.X(205) + 10, A.Y(201 * k), { size: 19, bold: true, color: c });
        });
        ns.forEach((n) => { if (n <= upto) K.dot(A.X(n), A.Y(0), 4, col.red, 0.8); });
        if (upto >= 200) K.text("p = 5, 13", A.X(205) + 10, A.Y(0) - 4, { size: 19, bold: true, color: col.red });
        K.text("dots: computed exactly     dashed: n·p / (p² − 1)", 60, 596, { size: 19, color: col.muted });
        // the figure-eight (lemniscate) with a bird flying it
        K.text("the lemniscate", 840, 70, { size: 19, bold: true, align: "center", color: col.gold });
        const pts = []; for (let i = 0; i <= 120; i++) pts.push(L((i / 120) * Math.PI * 2));
        K.line(pts, { color: col.gold, width: 3, sketch: false, alpha: 0.9 });
        const th = (t * 0.9) % (Math.PI * 2), [bx, by] = L(th), [bx2] = L(th + 0.03);
        bird(K, bx, by + 4, 0.55, { flip: bx2 < bx, sing: t });
        // which primes the sine forces
        K.text("forced to divide:", 840, 292, { size: 18, bold: true, align: "center", color: col.muted });
        [[3, 760, col.blue], [7, 840, col.green], [11, 920, col.purple]].forEach(([p, x, c]) => { K.ring(x, 340, 24, { color: c, width: 2.6, fill: c, fillAlpha: 0.15 }); K.text(String(p), x, 341, { size: 21, bold: true, align: "center", color: c }); });
        K.text("remainder 3 after\ndividing by 4", 840, 392, { size: 17, align: "center", color: col.muted });
        K.text("not forced:", 840, 462, { size: 18, bold: true, align: "center", color: col.muted });
        [[5, 790], [13, 890]].forEach(([p, x]) => { K.ring(x, 510, 24, { color: col.red, width: 2.4, dash: [5, 5] }); K.text(String(p), x, 511, { size: 21, bold: true, align: "center", color: col.red }); });
        return true;
      },
    };
  });

  // ------------------------------------------------------------------ 44: Old Grey's round aviary, one perch for every hour
  S("w-clockcurve", ({ reduced }) => {
    const PS = [11, 13, 17, 19, 29, 31, 37, 41, 43, 47], cache = {}, per = 3.4, get = (p) => cache[p] || (cache[p] = curvePoints(p));
    return {
      draw(K, t) {
        const { col } = K, g = K.g;
        const k = reduced ? 7 : Math.floor(t / per) % PS.length, p = PS[k], loc = reduced ? per : t % per, P = get(p), N = P.length;
        const cx0 = 270, cy0 = 325, R = 178, ang = (x) => -Math.PI / 2 + (2 * Math.PI * x) / p;
        // the round cage
        K.ring(cx0, cy0, R + 9, { color: BIRD.twig, width: 5 }); K.ring(cx0, cy0, R - 3, { color: BIRD.twig, width: 3, alpha: 0.7 });
        g.save(); g.strokeStyle = col.muted; g.globalAlpha = 0.14; g.lineWidth = 1.2; for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; g.beginPath(); g.moveTo(cx0 + Math.cos(a) * 60, cy0 + Math.sin(a) * 60); g.lineTo(cx0 + Math.cos(a) * (R - 4), cy0 + Math.sin(a) * (R - 4)); g.stroke(); } g.restore();
        for (let x = 0; x < p; x++) K.dot(cx0 + Math.cos(ang(x)) * R, cy0 + Math.sin(ang(x)) * R, 3.2, BIRD.twig);
        K.text("hour 0", cx0, cy0 - R - 26, { size: 17, align: "center", color: col.muted });
        const show = Math.round(K.ease(clamp(loc / 2, 0, 1)) * N), s = clamp((R * 2 * Math.PI) / p / 62, 0.28, 0.52);
        if (show > 0 && show < N) { const a = ang(P[show - 1][0]); K.seg(cx0, cy0, cx0 + Math.cos(a) * (R - 6), cy0 + Math.sin(a) * (R - 6), { color: col.gold, width: 2.4, sketch: false, alpha: 0.7 }); }
        for (let i = 0; i < show; i++) { const x = P[i][0], dup = i > 0 && P[i - 1][0] === x, a = ang(x), rr = R - (dup ? 24 * s * 2.2 : 0);
          bird(K, cx0 + Math.cos(a) * rr, cy0 + Math.sin(a) * rr + 2, s, { flip: Math.cos(a) < 0 }); }
        K.text(`p = ${p}`, cx0, cy0 - 14, { size: 34, bold: true, align: "center" });
        K.text("hours on the clock", cx0, cy0 + 22, { size: 18, align: "center", color: col.muted });
        // the right-hand side: the count, and the band
        const dev = N - p, lim = 2 * Math.sqrt(p), rx = 750;
        K.math("y² = x³ − x + 1", rx, 64, { size: 32, italic: true });
        K.text("a bird on hour x for each solution y", rx, 106, { size: 18, align: "center", color: col.muted });
        K.text(`birds in the aviary: ${show}`, rx, 176, { size: 25, align: "center", bold: true, color: col.blue });
        if (show === N) {
          K.text(`p = ${p}, so off by ${dev > 0 ? "+" : dev < 0 ? "−" : ""}${Math.abs(dev)}`, rx, 226, { size: 22, align: "center" });
          const by = 340, hw = 190;
          K.text("the Hasse band:  p ± 2√p", rx, by - 74, { size: 19, align: "center", bold: true, color: col.green });
          K.box(rx - hw, by - 16, 2 * hw, 32, { color: col.green, width: 2, fill: col.green, fillAlpha: 0.14, r: 6, sketch: false });
          K.seg(rx, by - 22, rx, by + 22, { color: col.muted, width: 2, sketch: false });
          K.dot(rx + (dev / lim) * hw, by, 10, col.gold); K.ring(rx + (dev / lim) * hw, by, 10, { color: K.surface, width: 2 });
          K.text((p - lim).toFixed(1), rx - hw, by + 40, { size: 17, align: "center", color: col.green }); K.text(String(p), rx, by + 40, { size: 17, align: "center", color: col.muted }); K.text((p + lim).toFixed(1), rx + hw, by + 40, { size: 17, align: "center", color: col.green });
          K.text(`${N} birds`, rx + (dev / lim) * hw, by - 38, { size: 17, align: "center", bold: true, color: col.gold, halo: true });
          K.text("always inside", rx, 440, { size: 23, align: "center", color: col.green, bold: true });
        }
        K.serif("Old Grey's round aviary", 810, 560, { size: 24, align: "center", color: col.muted });
        perch(K, 610, 596); bird(K, 610, 594, 1.1, { color: GREY });
        return !reduced;
      },
    };
  });

  // ------------------------------------------------------------------ 45: a hammock strung between two posts must never touch the ground
  S("w-hasse", ({ reduced }) => {
    const p = 41, lim = 2 * Math.sqrt(p), sx0 = 170, sx1 = 830, sy = 545, TOP = 118;
    let a = 9, touched = false;
    const q = (r) => r * r + a * r + p;
    const toA = (x) => clamp(-20 + (40 * (x - sx0)) / (sx1 - sx0), -20, 20);
    const near = (x, y) => Math.abs(y - sy) < 34 && x > sx0 - 26 && x < sx1 + 26;
    return {
      hit: near,
      press(x, y) { if (!near(x, y)) return false; touched = true; a = toA(x); return true; },
      drag(x) { a = toA(x); if (Math.abs(a - 9) < 0.45) a = 9; },
      draw(K, t) {
        const { col } = K, g = K.g;
        if (!touched) a = reduced ? 9 : t < 1.2 ? 9 : 9 - 13 * (1 - Math.cos((t - 1.2) * 0.8));
        const A = K.axes([130, 30, 740, 400], [-17, 17], [-65, 150]);
        A.frame({ xticks: [[-10, "−10"], [0, "0"], [10, "10"]], yticks: [[0, "0"], [50, "50"], [100, "100"]], xlabel: "r / s" });
        const disc = a * a + 4 * (TOP - p), r1 = (-a - Math.sqrt(disc)) / 2, r2 = (-a + Math.sqrt(disc)) / 2, ok = a * a <= 4 * p;
        A.clip(() => {
          // the ground
          g.save(); g.fillStyle = "#8b6b3e"; g.globalAlpha = 0.3; g.fillRect(A.X(-17), A.Y(0), A.X(17) - A.X(-17), A.Y(-65) - A.Y(0)); g.restore();
          K.seg(A.X(-17), A.Y(0), A.X(17), A.Y(0), { color: col.green, width: 5, sketch: false, alpha: 0.7 });
          // the two posts
          [r1, r2].forEach((r) => { K.seg(A.X(r), A.Y(0), A.X(r), A.Y(TOP), { color: BIRD.twig, width: 10, sketch: false }); K.dot(A.X(r), A.Y(TOP), 7, BIRD.twig); });
          // the hammock sags through the ground: red
          if (!ok) { const s1 = (-a - Math.sqrt(a * a - 4 * p)) / 2, s2 = (-a + Math.sqrt(a * a - 4 * p)) / 2;
            g.save(); g.fillStyle = col.red; g.globalAlpha = 0.32; g.beginPath(); g.moveTo(A.X(s1), A.Y(0)); for (let i = 0; i <= 60; i++) { const r = s1 + ((s2 - s1) * i) / 60; g.lineTo(A.X(r), A.Y(q(r))); } g.closePath(); g.fill(); g.restore(); }
          A.curve(q, r1, r2, 200, { color: ok ? col.blue : col.red, width: 5, sketch: false });
          for (let r = Math.ceil(r1); r <= r2; r++) if (q(r) < TOP - 2) K.dot(A.X(r), A.Y(q(r)), 4.5, K.surface), K.ring(A.X(r), A.Y(q(r)), 4.5, { color: col.blue, width: 2 });
          const vx = -a / 2, vy = p - (a * a) / 4;
          bird(K, A.X(vx), A.Y(vy) - 4, 0.8, { color: ok ? undefined : "#e98b5d" });
        });
        K.text(`degree  =  r² + a·r·s + ${p}·s²      (p = ${p})`, 150, 36, { size: 21, bold: true });
        K.text("the ground", A.X(-16.6), A.Y(-8), { size: 17, color: "#8b6b3e", bold: true });
        const hx = slider(K, sx0, sx1, sy, (a + 20) / 40, { ticks: [[(20 - lim) / 40, "−2√p", col.green], [(20 + lim) / 40, "+2√p", col.green], [29 / 40, "", col.muted], [0.5, "0"]] });
        K.text("this curve", sx0 + (29 / 40) * (sx1 - sx0), sy - 26, { size: 16, align: "center", color: col.muted });
        K.text(`a = ${a < 0 ? "−" : ""}${Math.abs(a).toFixed(1)}`, hx, sy - 26 - (Math.abs(a - 9) < 1.5 ? 22 : 0), { size: 18, align: "center", bold: true, color: col.red, halo: true });
        K.text(ok ? "the hammock clears the ground: allowed" : "it sags through the ground: a negative degree. Impossible.", 500, 612, { size: 21, align: "center", bold: true, color: ok ? col.green : col.red });
        return !touched && !reduced;
      },
    };
  });
  // ================================================================== "w-overflow": one basket per layer of each twig; its pile is one copy per every n-th bundle; keep what spills over the rim
  S("w-overflow", ({ reduced }) => {
    const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹", sup = (e) => String(e).split("").map((d) => SUP[+d]).join("");
    const ORD = (n) => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
    const pp = (n) => { for (let p = 2; p <= n; p++) if (n % p === 0) { let m = n, e = 0; while (m % p === 0) { m /= p; e++; } return m === 1 ? [p, e] : null; } return null; };
    const ns = []; for (let n = 2; n <= 16; n++) { const q = pp(n); if (q) ns.push([n, q[0], q[1]]); }
    const PCOL = { 2: "#3d7cc9", 3: "#c47a2a", 5: "#4f9a4a", 7: "#8a5cc9" };
    let x = 12, touched = false;
    const sx0 = 220, sx1 = 760, sy = 618, XMIN = 3, XMAX = 16;
    const near = (px, py) => Math.abs(py - sy) < 28 && px > sx0 - 26 && px < sx1 + 26;
    const set = (px) => { x = Math.round(clamp(XMIN + ((px - sx0) / (sx1 - sx0)) * (XMAX - XMIN), XMIN, XMAX)); };
    const BW = 58, BH = 70, GROUND = 520, RIM = GROUND - BH, CAP = 5.2, X0 = 128, DX = 82;
    function basketBack(K, cx) { const g = K.g; g.save(); g.fillStyle = "#6e4a2a"; g.beginPath(); g.ellipse(cx, RIM, BW / 2, 8, 0, Math.PI, 2 * Math.PI); g.fill(); g.restore(); }
    function basketFront(K, cx) {
      const g = K.g, wt = BW / 2, wb = BW / 2 - 7;
      g.save(); g.beginPath(); g.moveTo(cx - wt, RIM); g.ellipse(cx, RIM, wt, 8, 0, Math.PI, 0, true); g.lineTo(cx + wb, GROUND - 6); g.quadraticCurveTo(cx, GROUND + 4, cx - wb, GROUND - 6); g.closePath();
      const grd = g.createLinearGradient(cx - wt, 0, cx + wt, 0); grd.addColorStop(0, "#a27c45"); grd.addColorStop(0.45, "#c9a265"); grd.addColorStop(1, "#8c6935");
      g.fillStyle = grd; g.fill(); g.clip();
      g.strokeStyle = "rgba(90,60,25,0.55)"; g.lineWidth = 1.6; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(cx + k * 8.5, RIM); g.lineTo(cx + k * 7.4, GROUND); g.stroke(); }
      g.strokeStyle = "rgba(240,215,160,0.55)"; g.lineWidth = 2.2; for (let y = RIM + 14; y < GROUND - 2; y += 11) { g.beginPath(); g.moveTo(cx - wt, y); g.quadraticCurveTo(cx, y + 5, cx + wt, y); g.stroke(); }
      g.restore();
      g.save(); g.strokeStyle = "#5c3d1e"; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, RIM, wt, 8, 0, 0, Math.PI); g.stroke(); g.restore();
    }
    return {
      hit: near, press(px, py) { if (!near(px, py)) return false; touched = true; set(px); return true; }, drag(px) { set(px); },
      draw(K, t) {
        const { col } = K, g = K.g, grow = reduced || touched ? 1 : K.ease(K.ph(t, 0.4, 3.2));
        K.seg(40, GROUND, 960, GROUND, { color: col.axis, width: 2, sketch: false });
        bird(K, 70, GROUND, 1.0, { color: GREY }); 
        ns.forEach(([n, p, e], i) => {
          const cx = X0 + i * DX, full = x / n, show = Math.min(CAP, full) * grow, hpx = show * BH, top = GROUND - hpx, c = PCOL[p] || "#8b5e34";
          basketBack(K, cx);
          // the pile: short twig pieces in the twig's colour, one row per tenth of b
          const rows = Math.max(0, Math.round(hpx / 7));
          g.save(); g.lineCap = "round";
          for (let k = 0; k < rows; k++) { const y = GROUND - 6 - k * 7, w = 17 + ((k * 7 + i * 3) % 5); g.strokeStyle = c; g.globalAlpha = 0.95; g.lineWidth = 4.2;
            g.beginPath(); g.moveTo(cx - w, y + ((k + i) % 3 - 1)); g.lineTo(cx + w, y - ((k + i) % 3 - 1)); g.stroke(); }
          g.restore();
          if (full > CAP && grow > 0.98) { g.save(); g.strokeStyle = K.surface || "#fff"; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 24, top + 18); g.lineTo(cx - 8, top + 12); g.lineTo(cx + 8, top + 20); g.lineTo(cx + 24, top + 14); g.stroke(); g.restore();
            }
          basketFront(K, cx);
          // the kept part: a red bracket from the rim to the top of the pile
          if (full > 1 && grow > 0.98) {
            const bx = cx + BW / 2 + 6; K.seg(bx, RIM, bx, top, { color: col.red, width: 3, sketch: false }); K.seg(bx - 5, top, bx, top, { color: col.red, width: 3, sketch: false }); K.seg(bx - 5, RIM, bx, RIM, { color: col.red, width: 3, sketch: false });
            K.text(`+${(full - 1).toFixed(1)}b${full > CAP ? " ↑" : ""}`, cx, top - 12, { size: 13, bold: true, color: col.red, halo: true, align: "center" });
          }
          K.text(e === 1 ? String(p) : p + sup(e), cx, GROUND + 22, { size: 18, bold: true, align: "center", color: c });
          K.text(`every ${ORD(n)}`, cx, GROUND + 42, { size: 12, align: "center", color: col.muted });
        });
        K.text("bundle", X0 + (ns.length - 1) * DX + 44, GROUND + 42, { size: 12, align: "left", color: col.muted });
        K.text("each basket holds b copies", 940, 60, { size: 16, bold: true, align: "right", color: col.ink });
        K.text(`a = ${x} · b bundles in all, so twig n's layer gives a/n copies`, 940, 86, { size: 15, align: "right", color: col.muted });
        K.text("kept: what spills over the rim", 940, 112, { size: 15, bold: true, align: "right", color: col.red });
        // slider
        K.seg(sx0, sy, sx1, sy, { color: col.axis, width: 4, sketch: false });
        const hx = sx0 + ((x - XMIN) / (XMAX - XMIN)) * (sx1 - sx0); K.dot(hx, sy, 12, col.red); K.ring(hx, sy, 12, { color: K.surface, width: 2.5 });
        K.text(`x = ${x}`, sx1 + 28, sy, { size: 19, bold: true }); K.text("drag", sx0 - 22, sy, { size: 15, align: "right", color: col.muted });
        return !reduced && !touched && t < 3.4;
      },
    };
  });

  // ================================================================== the great loom: pages "w-ring" (the turn-over) and "w-hops" (shrinking hops, forced knots)
  const L_GOLD = "#d9a21b", L_ROSE = "#d4607e", WOOD = "#8b5e34", WOOD2 = "#6e4a2a";
  function loomFrame(K, x0, x1, y, yb) {
    const g = K.g; g.save(); g.lineCap = "round";
    [x0, x1].forEach((x) => { g.strokeStyle = WOOD2; g.lineWidth = 14; g.beginPath(); g.moveTo(x, y - 14); g.lineTo(x, yb); g.stroke();
      g.lineWidth = 8; g.beginPath(); g.moveTo(x - 22, yb); g.lineTo(x + 22, yb); g.stroke(); });
    g.strokeStyle = WOOD; g.lineWidth = 13; g.beginPath(); g.moveTo(x0 - 18, y); g.lineTo(x1 + 18, y); g.stroke();
    g.strokeStyle = "#a0703f"; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 10, y - 2); g.lineTo(x1 + 10, y - 2); g.stroke();
    g.restore();
  }
  // a woven loop hung from a peg on the beam; (cx, cy) its centre
  function hoop(K, px, py, cx, cy, r, o = {}) {
    const g = K.g; g.save(); g.globalAlpha = o.alpha ?? 1; g.lineCap = "round";
    g.strokeStyle = WOOD2; g.lineWidth = 1.6; g.beginPath(); g.moveTo(px, py); g.lineTo(cx, cy - r); g.stroke();
    g.strokeStyle = "#8f9a48"; g.lineWidth = r > 25 ? 7 : 5; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    const n = Math.round(r * 0.9);
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; g.strokeStyle = GRASS[k % GRASS.length]; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(cx + (r - 3) * Math.cos(a), cy + (r - 3) * Math.sin(a)); g.lineTo(cx + (r + 3) * Math.cos(a + 0.25), cy + (r + 3) * Math.sin(a + 0.25)); g.stroke(); }
    g.fillStyle = WOOD2; g.beginPath(); g.arc(px, py, 6, 0, Math.PI * 2); g.fill();
    g.restore();
  }
  // a strand coiled inside a loop
  function coil(K, cx, cy, r, color, o = {}) {
    const g = K.g, turns = o.turns || 3; g.save(); g.globalAlpha = o.alpha ?? 1; g.strokeStyle = color; g.lineWidth = o.width || 3; g.lineCap = "round"; g.beginPath();
    for (let k = 0; k <= 90; k++) { const f = k / 90, a = f * turns * Math.PI * 2, rr = r * (0.25 + 0.7 * f); const X = cx + rr * Math.cos(a), Y = cy + rr * Math.sin(a) * 0.9; k ? g.lineTo(X, Y) : g.moveTo(X, Y); }
    g.stroke(); g.restore();
  }
  // a short two-faced ribbon at (x, y) along angle ang; phase turns it over (cos > 0: gold face up)
  function ribbon(K, x, y, len, ang, phase, o = {}) {
    const g = K.g, c = Math.cos(phase), hw = 1.5 + 6 * Math.abs(c), ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux;
    g.save(); g.globalAlpha = o.alpha ?? 1; g.fillStyle = c >= 0 ? L_GOLD : L_ROSE; g.strokeStyle = "rgba(60,40,20,0.55)"; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x - ux * len / 2 + nx * hw, y - uy * len / 2 + ny * hw); g.lineTo(x + ux * len / 2 + nx * hw, y + uy * len / 2 + ny * hw);
    g.lineTo(x + ux * len / 2 - nx * hw, y + uy * len / 2 - ny * hw); g.lineTo(x - ux * len / 2 - nx * hw, y - uy * len / 2 - ny * hw); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  // point on the hop arc from x1 to x2 (over the beam at height top)
  const arcPt = (x1, x2, yb, top, f) => [x1 + (x2 - x1) * f, yb - (yb - top) * Math.sin(Math.PI * f)];
  const arcAng = (x1, x2, yb, top, f) => Math.atan2(-(yb - top) * Math.PI * Math.cos(Math.PI * f), x2 - x1);

  S("w-ring", ({ reduced }) => {
    const N = 5, HOP = 2.4, T0 = 0.8;
    return {
      draw(K, t) {
        const { col } = K, g = K.g, by = 230, PX = (i) => 170 + i * 165;
        const pos = reduced ? N - 1 : Math.max(0, Math.min(N - 1, (t - T0) / HOP)), s = Math.floor(pos), fr = pos - s;
        const fa = reduced ? 1 : K.ease(K.ph(t, 0.1, 0.8));
        farOne(K, 500, 165, 150, { t, alpha: fa });
        K.text("a Far One", 590, 72, { size: 16, bold: true, color: col.purple, alpha: fa });
        loomFrame(K, 80, 920, by, 470);
        bird(K, 100, by - 6, 1.15, { color: GREY }); bird(K, 142, by - 6, 0.9);
        for (let i = 0; i < N; i++) {
          const px = PX(i), on = i <= s && !(i === s && fr > 0 && false), swapped = i % 2 === 1;
          const big = [px - 24, by + 92, 44], small = [px + 42, by + 50, 17];
          hoop(K, px, by, big[0], big[1], big[2]); hoop(K, px, by, small[0], small[1], small[2]);
          if (i <= s) {
            coil(K, big[0], big[1], big[2] - 8, swapped ? L_ROSE : L_GOLD, { turns: 3 });
            coil(K, small[0], small[1], small[2] - 5, swapped ? L_GOLD : L_ROSE, { turns: 1.6, width: 2.5 });
            K.text(i === 0 ? "home peg" : swapped ? "turned over" : "turned back", px + 6, by + 168, { size: 15, bold: true, align: "center", color: i === 0 ? col.ink : col.purple, halo: true });
            K.text(swapped ? "gold side: small loop" : "gold side: big loop", px + 6, by + 190, { size: 14, align: "center", color: col.muted, halo: true });
          }
        }
        // the strand in flight, turned over on the way
        if (!reduced && s < N - 1 && fr > 0) {
          const x1 = PX(s), x2 = PX(s + 1), f = K.ease(fr), [x, y] = arcPt(x1, x2, by - 10, 120, f), a = arcAng(x1, x2, by - 10, 120, f);
          g.save(); g.strokeStyle = col.purple; g.globalAlpha = 0.5 * Math.sin(Math.PI * f); g.lineWidth = 1.5; g.setLineDash([4, 4]);
          g.beginPath(); g.moveTo(500, 90); g.lineTo(x, y); g.stroke(); g.beginPath(); g.ellipse(x, y, 30, 14, a, 0, Math.PI * 2); g.stroke(); g.restore();
          ribbon(K, x, y, 56, a, (s + f) * Math.PI);
        }
        // key
        const ky = 520;
        ribbon(K, 130, ky, 44, 0, 0); K.text("the strand's ordinary side", 162, ky + 6, { size: 17, bold: true, color: col.ink });
        ribbon(K, 130, ky + 34, 44, 0, Math.PI); K.text("its mirror-image side", 162, ky + 40, { size: 17, bold: true, color: col.ink });
        K.text("big loop: room for length a", 470, ky + 6, { size: 17, color: col.muted });
        K.text("small loop: room for length b", 470, ky + 40, { size: 17, color: col.muted });
        K.text("between pegs, a Far One turns the strand over through a direction no bird can see", 130, ky + 82, { size: 15, color: col.purple });
        return !reduced && t < T0 + (N - 1) * HOP + 0.3;
      },
    };
  });

  S("w-hops", ({ el, kick, reduced }) => {
    let x = 100, p = 3, start = 0, restart = true;
    const xin = el.querySelector(".x"), xout = el.querySelector("output");
    if (xin) { xin.addEventListener("input", () => { x = +xin.value; xout.textContent = x; restart = true; kick(); }); xout.textContent = x; }
    el.querySelectorAll(".ps button").forEach((b) => b.addEventListener("click", () => { el.querySelectorAll(".ps button").forEach((o) => o.classList.toggle("on", o === b)); p = +b.dataset.p; restart = true; kick(); }));
    const NS = 7, HOP = 1.5, num = (v) => (v >= 100 ? String(Math.round(v)) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
    const rlen = (d) => 14 + 24 * Math.log10(1 + d);
    return {
      enter() { restart = true; },
      draw(K, t) {
        if (restart) { start = t; restart = false; }
        const { col } = K, g = K.g, by = 160, PX = (e) => 115 + e * 122;
        const pos = reduced ? NS - 1 : Math.max(0, Math.min(NS - 1, (t - start - 0.5) / HOP)), s = Math.floor(pos), fr = pos - s;
        loomFrame(K, 52, 905, by, 470);
        bird(K, 66, by - 6, 1.0, { color: GREY });
        let tot = 0;
        for (let e = 0; e < NS; e++) {
          const px = PX(e), swapped = e % 2 === 1, deg = x / Math.pow(p, e), over = swapped ? Math.max(0, deg - 1) : 0;
          const big = [px - 16, by + 72, 34], small = [px + 32, by + 40, 13], here = e <= s;
          hoop(K, px, by, big[0], big[1], big[2], { alpha: here ? 1 : 0.35 }); hoop(K, px, by, small[0], small[1], small[2], { alpha: here ? 1 : 0.35 });
          K.text(e === 0 ? "home" : `hop ${e}`, px, by + 136, { size: 14, align: "center", color: col.muted });
          if (!here) continue;
          K.text(`${num(deg)}b`, px, by - 50, { size: 16, bold: true, align: "center", color: col.ink, halo: true });
          if (!swapped) { coil(K, big[0], big[1], big[2] - 7, L_GOLD, { turns: 1 + 2 * Math.min(1, deg / 50) + 0.6 });
            K.text("fits", big[0], by + 158, { size: 14, bold: true, align: "center", color: col.green }); continue; }
          coil(K, small[0], small[1], small[2] - 4, L_GOLD, { turns: 1.6, width: 2.5 });
          if (over <= 0) { K.text("fits", small[0], by + 158, { size: 14, bold: true, align: "center", color: col.green }); continue; }
          // the part that won't fit hangs down, knotted
          const grow = reduced || e < s ? 1 : K.ease(clamp((pos - s) / 0.6, 0, 1)), Lt = Math.min(230, 12 + 15 * Math.pow(over, 0.6)) * grow;
          const tx = small[0] + 2, ty0 = small[1] + small[2];
          g.save(); g.strokeStyle = L_GOLD; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(tx, ty0);
          for (let k = 0; k <= 20; k++) g.lineTo(tx + 4 * Math.sin(k * 0.9), ty0 + (Lt * k) / 20); g.stroke(); g.restore();
          for (let yk = ty0 + 12; yk < ty0 + Lt - 2; yk += 13) { const xk = tx + 4 * Math.sin(((yk - ty0) / Lt) * 20 * 0.9);
            g.save(); g.fillStyle = col.red; g.beginPath(); g.moveTo(xk - 6, yk - 4); g.lineTo(xk + 6, yk + 4); g.lineTo(xk + 6, yk - 4); g.lineTo(xk - 6, yk + 4); g.closePath(); g.fill(); g.restore(); }
          if (grow > 0.95) { tot += over; K.text(`+${num(over)}b`, tx, Math.max(ty0 + Lt + 18, by + 182), { size: 16, bold: true, align: "center", color: col.red, halo: true }); }
        }
        // the strand hopping to the next peg, shrinking by p
        if (!reduced && s < NS - 1 && fr > 0) {
          const x1 = PX(s), x2 = PX(s + 1), f = K.ease(fr), [hx, hy] = arcPt(x1, x2, by - 74, 40, f), a = arcAng(x1, x2, by - 74, 40, f);
          const d = x / Math.pow(p, s + f);
          g.save(); g.strokeStyle = col.gold; g.globalAlpha = 0.45; g.lineWidth = 1.5; g.setLineDash([4, 5]); g.beginPath();
          for (let k = 0; k <= 30; k++) { const [X, Y] = arcPt(x1, x2, by - 74, 40, k / 30); k ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.stroke(); g.restore();
          ribbon(K, hx, hy, rlen(d), a, 0);
          K.text(`÷ ${p}`, (x1 + x2) / 2, 30, { size: 16, bold: true, align: "center", color: col.gold, alpha: Math.sin(Math.PI * f) });
        }
        bird(K, PX(s), by - 6, 0.85);
        // tally
        K.text(`p = ${p}: each hop divides the strand's length by ${p}`, 60, 520, { size: 18, bold: true, color: col.ink });
        K.text(`knots the weave is forced to tie: ${num(tot)}b`, 60, 556, { size: 20, bold: true, color: col.red });
        K.text("lengths in units of b, the small loop's room; a = x · b", 60, 588, { size: 15, color: col.muted });
        return !reduced && pos < NS - 1 + 0.01 || (!reduced && t - start < (NS - 1) * HOP + 1.4);
      },
    };
  });


  // ------------------------------------------------------------------ 46: you can't have part of a twig
  S("w-positivity", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g;
      const per = 1.5, k = reduced ? 2 : Math.floor(t / per) % 4, lt = t % per;
      // left: a weighing dial that only clicks to whole twigs
      const cx = 230, cy = 262, R = 108, an = (i) => Math.PI + Math.PI * (0.1 + (0.8 * i) / 3);
      g.save(); g.fillStyle = col.red; g.globalAlpha = 0.14; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, an(0), an(1)); g.closePath(); g.fill(); g.restore();
      g.save(); g.strokeStyle = col.muted; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, Math.PI, 2 * Math.PI); g.stroke(); g.restore();
      for (let i = 0; i < 4; i++) { const a = an(i); K.seg(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14), cx + Math.cos(a) * R, cy + Math.sin(a) * R, { color: col.ink, width: 3, sketch: false }); K.text(String(i), cx + Math.cos(a) * (R + 22), cy + Math.sin(a) * (R + 22), { size: 22, bold: true, align: "center", color: i === k ? col.gold : col.ink }); }
      const na = an(k) + (reduced ? 0 : 0.05 * Math.sin(lt * 20) * Math.exp(-lt * 5));
      K.seg(cx, cy, cx + Math.cos(na) * (R - 20), cy + Math.sin(na) * (R - 20), { color: col.red, width: 4, sketch: false }); K.dot(cx, cy, 9, col.muted);
      K.text("no needle\nin here", cx - 55, cy - 62, { size: 16, align: "center", color: col.red, bold: true });
      // the pan, with k whole twigs on it
      K.box(100, 288, 260, 18, { color: col.muted, width: 2.4, fill: col.muted, fillAlpha: 0.15, r: 8, sketch: false });
      for (let i = 0; i < k; i++) twig(K, 150 + (i % 2) * 8, 278 - i * 11, 120, 0, { width: 7 });
      K.text(k === 0 ? "an empty bundle" : `${k} whole twig${k > 1 ? "s" : ""}`, cx, 330, { size: 19, bold: true, align: "center", color: k === 0 ? col.muted : col.gold });
      bird(K, 330, 288, 0.8, { flip: true });
      // right: the readings, on a line
      const nx = [530, 660, 790, 920], ny = 235;
      K.seg(500, ny, 950, ny, { color: col.axis, width: 2, sketch: false });
      g.save(); g.fillStyle = col.red; g.globalAlpha = 0.13; g.fillRect(nx[0] + 12, 150, nx[1] - nx[0] - 24, 120); g.restore();
      nx.forEach((x, i) => { K.dot(x, ny, i === k ? 11 : 7, i === k ? col.gold : col.blue); K.text(String(i), x, ny + 32, { size: 22, bold: true, align: "center", color: i === k ? col.gold : col.ink });
        if (i === 0) K.ring(x, ny - 40, 20, { color: col.muted, width: 2, dash: [4, 4] }); else for (let j = 0; j < i; j++) twig(K, x - 24, ny - 22 - j * 12, 48, 0, { width: 6 }); });
      twig(K, nx[0] + 40, 190, 40, 0, { width: 6, color: col.muted }); K.seg(nx[0] + 34, 168, nx[0] + 96, 210, { color: col.red, width: 3.5, sketch: false }); K.seg(nx[0] + 96, 168, nx[0] + 34, 210, { color: col.red, width: 3.5, sketch: false });
      K.text("half a twig?", (nx[0] + nx[1]) / 2, 140, { size: 17, bold: true, align: "center", color: col.red });
      K.text("empty bundle:\nreads 0", nx[0] + 20, 300, { size: 17, align: "center", color: col.muted });
      K.text("any other bundle:\nat least 1 whole twig", 790, 300, { size: 17, align: "center", color: col.muted });
      // the Lean code
      const f = K.ease(K.ph(t, 0.5, 1.4));
      if (f > 0) {
        g.save(); g.globalAlpha = f;
        K.box(110, 400, 780, 118, { color: null, fill: "#1a202c", fillAlpha: 1, r: 12 });
        g.font = `${21 * (K.fs || 1)}px "SF Mono", Menlo, Consolas, monospace`; g.textBaseline = "middle";
        g.fillStyle = "#a0aec0"; g.fillText("-- the lattice version, in the Lean proof", 140, 428);
        g.fillStyle = "#f6ad55"; g.fillText("SlopeInequality", 140, 462); g.fillStyle = "#e2e8f0"; g.fillText("  slope L ≤ μmax M + log C", 140, 496);
        g.restore();
        g.save(); g.globalAlpha = f; K.text("on the path to the main theorem, where the lifts are measured", 500, 560, { size: 19, align: "center", bold: true, color: col.green }); g.restore();
      }
      return !reduced;
    },
  }));

  // ------------------------------------------------------------------ 47: one faint note, echoed through m passes, becomes a chorus
  S("w-route", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g;
      const T = reduced ? 99 : t, stage = T < 1.2 ? 0 : T < 2.6 ? 1 : 2;
      const cards = [["6 Oct", "“Stepanov determinant”", col.purple], ["early Oct", "W ≥ 0 via a determinant:", col.blue], ["15 Nov", "iterated theta lifts:", col.green]];
      const subs = ["", "multiplicity one, a thin region", "multiplicity m, with m ≈ √x"];
      cards.forEach(([d, s, c], i) => {
        const f = K.ease(K.ph(T, 0.2 + i * 1.3, 0.8 + i * 1.3)); if (f <= 0) return;
        const x = 40 + i * 320; g.save(); g.globalAlpha = f;
        K.box(x, 14, 290, 104, { color: c, width: 2.4, fill: c, fillAlpha: 0.1, r: 14, seed: 6 + i });
        K.text(d, x + 18, 40, { size: 18, bold: true, color: c }); K.text(s, x + 18, 70, { size: 19 });
        if (subs[i]) K.text(subs[i], x + 18, 98, { size: 17, color: col.muted });
        g.restore();
      });
      // the note and its echoes
      const r = reduced ? 1 : K.ease(K.ph(T, 0.5, 4)), y0 = 270, xa = 150, xb = 700, hoops = 6;
      for (let i = 0; i < hoops; i++) { const hx = 250 + i * 85; if ((hx - xa) / (xb - xa) > r + 0.02) continue; K.ring(hx, y0, 50, { color: i % 2 ? GRASS[2] : BROWN[0], width: 5 }); }
      const pts = []; for (let i = 0; i <= 140; i++) { const u = (i / 140) * r, x = xa + (xb - xa) * u; pts.push([x, y0 + Math.sin(u * 16 * Math.PI * 2 / 1.4 + T * 3) * (5 + 52 * Math.pow(u, 1.3))]); }
      K.line(pts, { color: col.gold, width: 2 + 2.6 * r, sketch: false, alpha: 0.4 + 0.6 * r });
      perch(K, 80, y0 + 40); bird(K, 80, y0 + 38, 1.4, { sing: T });
      K.text("one faint note", 90, 346, { size: 18, bold: true, align: "center", color: col.muted });
      K.text("echoed through m ≈ √x passes", 470, 346, { size: 19, bold: true, align: "center", color: col.gold });
      wire(K, 725, 965, y0 + 40, { color: col.gold, width: 3.5, up: 20, down: 20 });
      [770, 845, 920].forEach((x, i) => bird(K, x, y0 + 40, 0.85, { flip: i === 1, sing: r > 0.9 ? T + i * 0.3 : 0, alpha: 0.35 + 0.65 * r }));
      K.text("a full chorus", 845, 346, { size: 19, bold: true, align: "center", color: col.gold, alpha: r });
      // the zero-free strip widening
      const top = 400, bot = 470, RX = (re) => 120 + re * 760;
      const target = [1, 0.93, 0.5][stage], from = [1, 1, 0.93][stage], st = [0, 1.3, 2.9][stage];
      const th = from + (target - from) * K.ease(K.ph(T, st + 0.3, st + 1.5));
      g.save(); g.fillStyle = col.green; g.globalAlpha = 0.2; g.fillRect(RX(th), top, 880 - RX(th), bot - top); g.restore();
      K.box(RX(0), top, 760, bot - top, { color: col.axis, width: 2, sketch: false });
      K.seg(RX(0.5), top - 8, RX(0.5), bot + 8, { color: col.gold, width: 2.4, dash: [7, 6], sketch: false });
      for (let i = 0; i < 6; i++) K.dot(RX(0.5), top + 10 + i * 10.4, 3.6, col.gold);
      if (th < 0.999) K.seg(RX(th), top, RX(th), bot, { color: col.green, width: 3.5, sketch: false });
      [[0, "0"], [0.5, "½"], [1, "1"]].forEach(([v, s]) => K.text(s, RX(v), bot + 26, { size: 19, align: "center", color: col.muted }));
      K.text("real part of s", 880, bot + 54, { size: 17, align: "right", color: col.muted });
      if (th < 0.97) K.text("no zeros here", (RX(th) + 880) / 2 + (th < 0.6 ? 100 : 0), top + 36, { size: 19, align: "center", bold: true, color: col.green, halo: true });
      K.text(stage === 2 && th < 0.52 ? "the same positivity, amplified m ≈ √x times, reaches ½" : "weak positivity: only a thin zero-free strip", 500, 590, { size: 20, align: "center", bold: true, color: stage === 2 && th < 0.52 ? col.gold : col.blue });
      return !reduced && t < 4.8;
    },
  }));

  // ------------------------------------------------------------------ Kito's journey through the map (pages 14–38)
  // Page 16: Kito goes into the echo cave and calls into the dark.
  S("w-echo", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, per = 3, ph = reduced ? 1 : Math.floor(t / per) % 2, r = ph ? 0.55 : 0.85;
      const ROCK = "#8f7a52", DARK = "#2b2620", PALE = "#e8dcc0", gy = 470;
      // the rock and the cave's dark mouth
      g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(20, gy); g.lineTo(20, 150); g.quadraticCurveTo(60, 70, 230, 64); g.quadraticCurveTo(470, 54, 600, 120); g.quadraticCurveTo(640, 150, 640, gy); g.closePath(); g.fill(); g.restore();
      const dark = g.createLinearGradient(80, 0, 600, 0); dark.addColorStop(0, "rgba(43,38,32,0.55)"); dark.addColorStop(0.35, "rgba(43,38,32,0.9)"); dark.addColorStop(1, "rgba(43,38,32,0.98)");
      g.save(); g.fillStyle = dark; g.beginPath(); g.moveTo(70, gy); g.lineTo(70, 220); g.quadraticCurveTo(90, 120, 300, 112); g.quadraticCurveTo(560, 108, 600, 200); g.lineTo(600, gy); g.closePath(); g.fill(); g.restore();
      g.save(); g.strokeStyle = col.ink; g.globalAlpha = 0.5; g.lineWidth = 2; g.beginPath(); g.moveTo(70, gy); g.lineTo(70, 220); g.quadraticCurveTo(90, 120, 300, 112); g.quadraticCurveTo(560, 108, 600, 200); g.lineTo(600, gy); g.stroke(); g.restore();
      K.seg(20, gy, 960, gy, { color: col.axis, width: 2 });
      // Kito at the mouth, calling in
      bird(K, 130, gy - 2, 1.4, { sing: reduced ? 0.5 : t });
      K.text("Kito calls into the dark", 130, gy + 30, { size: 18, align: "center", color: col.muted });
      // the unseen bird, deep inside
      const bx = 170 + r * 420, by = gy - 120;
      K.seg(bx - 30, by + 2, bx + 26, by, { color: "#6e5a3c", width: 5 });
      bird(K, bx, by, 1.2, { flip: true, ghost: true, color: PALE });
      K.text("unseen", bx, by - 52, { size: 16, align: "center", color: PALE });
      // the calls going in (gold) and the echoes coming back (red)
      g.save(); g.lineWidth = 2;
      for (let k = 1; k <= 3; k++) { const p = reduced ? k / 4 : ((t * 0.8 + k / 3) % 1);
        g.strokeStyle = col.gold; g.globalAlpha = 0.5 * (1 - p); g.beginPath(); g.arc(160, gy - 30, 20 + p * (bx - 190), -0.35, 0.35); g.stroke();
        g.strokeStyle = "#ff8a7a"; g.globalAlpha = 0.75 * (1 - p); g.beginPath(); g.arc(bx - 20, by + 10, 20 + p * (bx - 200), Math.PI - 0.3, Math.PI + 0.3); g.stroke(); }
      g.restore();
      K.seg(200, gy - 40, bx, gy - 40, { color: "#ff8a7a", width: 2, sketch: false });
      K.text(`how far: ${r}`, (200 + bx) / 2, gy - 58, { size: 18, align: "center", bold: true, color: "#ff8a7a" });
      // outside the cave: how loud each echo comes back, call by call
      const base = 460;
      for (let k = 0; k < 8; k++) { const h = Math.min(260, 12 * Math.pow(1 / r, k)); K.box(680 + k * 34, base - h, 26, h, { color: null, fill: col.red, fillAlpha: 0.75, r: 3 }); }
      K.text("echo after echo →", 950, base + 24, { size: 16, align: "right", color: col.muted });
      K.text(r < 0.7 ? "near: the echoes grow fast" : "far: the echoes grow slowly", 815, 520, { size: 20, align: "center", bold: true, color: col.red });
      K.text("the echo cave", 330, 92, { size: 20, bold: true, align: "center", color: col.ink, halo: true });
      return !reduced;
    },
  }));

  // A small "you are here" copy of the page-13 map. stop: 0 goal, 1 A, 2 B, 3 D, 4 C, 5 E/F.
  const MAPWP = [[120, 478], [200, 405], [290, 382], [385, 452], [480, 492], [580, 468], [680, 388], [748, 330], [830, 262]];
  const MAPP = smooth(MAPWP, 10), STOPAT = [0, 2, 4, 6, 8].map((i) => i * 10);
  function youAreHere(K, x, y, stop, t) {
    const g = K.g, { col } = K, S0 = 0.2, OX = 40, OY = 90, W = 182, H = 110;
    g.save(); g.globalAlpha = 0.96;
    K.box(x, y, W, H, { fill: "#efe3c4", fillAlpha: 0.92, color: "#b8a27a", r: 8, sketch: false });
    g.restore();
    g.save(); g.translate(x + 6 - OX * S0, y + 4 - OY * S0); g.scale(S0, S0);
    cave(K, 290, 382); [440, 476, 512, 548].forEach((px, i) => pile(K, px, 490, 34, 8, 4 + i)); miniScale(K, 680, 292); loom(K, 830, 262);
    gate(K, 150, 154, t); weather(K, 400, 150);
    // the dashed road, and the part already walked
    g.setLineDash([14, 12]); g.strokeStyle = "#8b5e34"; g.lineWidth = 6; g.globalAlpha = 0.5; g.beginPath(); MAPP.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
    g.setLineDash([]); g.globalAlpha = 1; g.strokeStyle = col.green; g.lineWidth = 9;
    const upto = stop >= 5 ? MAPP.length - 1 : STOPAT[Math.min(stop, 4)];
    g.beginPath(); MAPP.slice(0, upto + 1).forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
    K.seg(60, 478, 180, 478, { color: col.gold, width: 8, sketch: false });
    g.restore();
    const here = stop >= 5 ? [275, 168] : MAPP[STOPAT[stop]], hx = x + 6 + (here[0] - OX) * S0, hy = y + 4 + (here[1] - OY) * S0;
    K.ring(hx, hy, 9, { color: col.red, width: 2.5 }); bird(K, hx, hy - 4, 0.42);
    K.text("you are here", x + W - 8, y + H - 10, { size: 13, align: "right", bold: true, color: "#7a4e1e" });
  }
  window.WEAVE.youAreHere = youAreHere;
  // ================================================================== fork A: pages 14, 15, 17, 18 at the echo cave (Grey and Kito in the scene)
  {
    const ROCK = "#8f7a52", DARK = "#2b2620", PALE = "#e8dcc0", ECHO = "#ff8a7a", { heightPanel } = window.WEAVE;
    // a rock mass with a dark arched mouth; ground at gy
    const caveRock = (K, x0, x1, top, gy, mx0, mx1, mtop) => {
      const g = K.g, { col } = K;
      g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x0, gy); g.lineTo(x0, top + 80);
      g.quadraticCurveTo(x0 + 20, top, (x0 + x1) / 2, top); g.quadraticCurveTo(x1 - 8, top, x1, top + 70); g.lineTo(x1, gy); g.closePath(); g.fill();
      g.globalAlpha = 0.5; g.strokeStyle = col.ink; g.lineWidth = 2; g.stroke(); g.restore();
      const dk = g.createLinearGradient(0, mtop, 0, gy); dk.addColorStop(0, "rgba(43,38,32,0.98)"); dk.addColorStop(1, "rgba(43,38,32,0.85)");
      g.save(); g.fillStyle = dk; g.beginPath(); g.moveTo(mx0, gy); g.lineTo(mx0, mtop + 60); g.quadraticCurveTo(mx0, mtop, (mx0 + mx1) / 2, mtop);
      g.quadraticCurveTo(mx1, mtop, mx1, mtop + 60); g.lineTo(mx1, gy); g.closePath(); g.fill(); g.globalAlpha = 0.5; g.strokeStyle = col.ink; g.lineWidth = 2; g.stroke(); g.restore();
    };
    const question = (K, x, y) => K.text("?", x, y, { size: 26, bold: true, align: "center", color: K.col.gold });
    let PSIA = null;
    const psiA = () => {
      if (PSIA) return PSIA;
      const N = 100000, lam = new Float64Array(N + 1), comp = new Uint8Array(N + 1);
      for (let p = 2; p <= N; p++) if (!comp[p]) { for (let q = p * p; q <= N; q += p) comp[q] = 1; for (let pk = p; pk <= N; pk *= p) lam[pk] = Math.log(p); }
      const xs = [], lo = [], hi = []; let psi = 0;
      for (let n = 1; n <= N; n++) { psi += lam[n]; const e = psi - n; if (n % 100 === 1) { xs.push(n); lo.push(e); hi.push(e); } else { lo[lo.length - 1] = Math.min(lo[lo.length - 1], e); hi[hi.length - 1] = Math.max(hi[hi.length - 1], e); } }
      return (PSIA = { xs, lo, hi });
    };

    // ---------------------------------------------------------------- 14: the smoothed chorus rolls out of the cave, inside a thin band; Kito follows it out
    S("w-gz", ({ reduced }) => ({
      draw(K, t) {
        const { col } = K, g = K.g, D = gzData(), BAND = 0.0462, gy = 470;
        caveRock(K, 0, 262, 120, gy, 70, 240, 236);
        K.seg(0, gy, 262, gy, { color: col.axis, width: 2, sketch: false });
        const A = K.axes([170, 230, 780, 260], [50, 200000], [-0.1, 0.1], { xlog: true }), xa = 262, xb = A.X(200000);
        g.save(); g.fillStyle = col.green; g.globalAlpha = 0.13; g.fillRect(xa, A.Y(BAND), xb - xa, A.Y(-BAND) - A.Y(BAND)); g.restore();
        [BAND, -BAND].forEach((v) => wire(K, xa, xb, A.Y(v), { color: col.gold, width: 3, up: 14, down: 14 }));
        const f = reduced ? 1 : K.ease(K.ph(t, 0.4, 7.4)), n = Math.max(2, Math.floor(D.xs.length * f));
        K.line(D.xs.slice(0, n).map((x, i) => [A.X(x), A.Y(D.ys[i])]), { color: col.blue, width: 2.2 });
        // Grey on the rock; Kito follows the sound out along the top wire
        bird(K, 150, 126, 1.25, { color: GREY });
        const hx = clamp(A.X(D.xs[n - 1]), 300, xb - 6);
        bird(K, hx, A.Y(BAND) - 1, 0.95, { sing: f < 1 ? t * 0.6 : 0, flip: false });
        [100, 1000, 10000, 100000].forEach((v) => K.text(v.toLocaleString("en-US"), A.X(v), 506, { size: 14, align: "center", color: col.muted }));
        K.text("how far out Kito listened: x (log scale)", xb, 532, { size: 14, align: "right", color: col.muted });
        K.text("the chorus, smoothed (G, shrunk by √x), rolling out of the cave", 290, 172, { size: 17, bold: true, color: col.blue });
        K.text("the thin band between two wires: ±0.0462", 290, 198, { size: 15, bold: true, color: col.green });
        if (f >= 1) K.text("out to 200,000, and still inside the band", 600, 588, { size: 20, bold: true, align: "center", color: col.green });
        return !reduced && t < 7.6;
      },
    }));

    // ---------------------------------------------------------------- 15: a ceiling on one side only; a bird above the middle wire would crack it
    S("w-ceiling", ({ reduced }) => ({
      draw(K, t) {
        const { col } = K, g = K.g, W = psiA(), A = K.axes([200, 100, 740, 400], [0, 100000], [-600, 900]), top = 60;
        const ceil = (x) => 1.4 * Math.sqrt(x), c = reduced ? 1 : K.ease(K.ph(t, 0.4, 2.2)), xr = 100000 * c + 1;
        // the cave roof: rock above the ceiling curve
        g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(A.X(0), top);
        for (let k = 0; k <= 120; k++) { const x = (k / 120) * xr; g.lineTo(A.X(x), A.Y(ceil(x))); }
        for (let k = 40; k >= 0; k--) { const px = A.X(0) + ((A.X(xr) - A.X(0)) * k) / 40; g.lineTo(px, top + 6 * Math.sin(k * 1.7) + 4 * Math.sin(k * 0.6)); } g.closePath(); g.fill(); g.restore();
        g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(150, top); g.lineTo(A.X(0), top); g.lineTo(A.X(0), A.Y(0)); g.lineTo(150, A.Y(0) + 30); g.closePath(); g.fill(); g.restore();
        K.seg(A.X(0), A.Y(0), A.X(100000), A.Y(0), { color: col.axis, width: 1, dash: [3, 6], sketch: false });
        // the chorus
        g.save(); g.strokeStyle = col.blue; g.lineWidth = 2;
        for (let i = 0; i < W.xs.length; i++) { g.beginPath(); g.moveTo(A.X(W.xs[i]), A.Y(W.lo[i])); g.lineTo(A.X(W.xs[i]), A.Y(W.hi[i])); g.stroke(); }
        g.restore();
        A.curve(ceil, 1, xr, 200, { color: col.gold, width: 3.5, sketch: false });
        if (c >= 1) K.text("a rock ceiling, about √x high, on one side only", A.X(0) + 14, top + 30, { size: 16, bold: true, color: col.ink });
        // a bird perched too high: its voice grows past the ceiling and cracks the rock
        const r = reduced ? 1 : K.ease(K.ph(t, 2.6, 5.6)), red = (x) => 0.9 * Math.pow(x, 0.58) * Math.cos(14.13 * Math.log(x));
        if (r > 0) {
          A.clip(() => A.curve(red, 1, 1 + 99999 * r, 900, { color: col.red, width: 2, sketch: false, alpha: 0.85 }));
          g.save(); g.strokeStyle = col.red; g.lineWidth = 2; g.lineJoin = "round";
          for (let i = 1; i < 899; i++) { const x0 = 1 + (99999 * (i - 1)) / 900, x1 = 1 + (99999 * i) / 900, x2 = 1 + (99999 * (i + 1)) / 900;
            if (x1 > 1 + 99999 * r) break; if (x1 < 6000) continue; const y1 = red(x1);
            if (y1 > ceil(x1) && y1 >= red(x0) && y1 >= red(x2)) { const px = A.X(x1), py = Math.max(top + 8, A.Y(Math.min(900, y1)));
              g.beginPath(); g.moveTo(px, py); g.lineTo(px - 7, py - 12); g.lineTo(px + 3, py - 20); g.lineTo(px - 4, py - 32); g.stroke();
              g.beginPath(); g.moveTo(px, py); g.lineTo(px + 9, py - 9); g.stroke(); } }
          g.restore();
        }
        // Grey and Kito at the mouth of the tunnel
        K.seg(20, 500, 190, 500, { color: col.axis, width: 2, sketch: false });
        bird(K, 70, 500, 1.25, { color: GREY }); bird(K, 140, 500, 1.0);
        question(K, 152, 440);
        [[0, "0"], [50000, "50k"], [100000, "100k"]].forEach(([v, l]) => K.text(l, A.X(v), A.Y(-600) + 22, { size: 14, align: "center", color: col.muted }));
        K.text("x →", A.X(100000) + 8, A.Y(0), { size: 14, color: col.muted });
        K.text("blue: the real chorus   red: a bird perched too high", A.X(50000), A.Y(-600) + 46, { size: 15, align: "center", bold: true, color: col.muted });
        if (r >= 1) K.text("a bird above the middle wire would crack the ceiling", 570, 590, { size: 20, bold: true, align: "center", color: col.red });
        return !reduced && t < 5.8;
      },
    }));

    // ---------------------------------------------------------------- 17: the trap: echoes inside the cave, the volume limit is its ceiling
    S("w-trap", ({ reduced }) => {
      let beta = 0.75, touched = false; const th = 0.5, sig = 2;
      const near = (x, y) => Math.abs(x - 110) < 50 && y > 80 && y < 540;
      const wy = (b) => 520 - b * 420;
      return {
        hit: near,
        press(x, y) { if (!near(x, y)) return false; touched = true; beta = clamp((520 - y) / 420, 0.1, 0.95); return true; },
        drag(x, y) { beta = clamp((520 - y) / 420, 0.1, 0.95); },
        draw(K, t) {
          const { col } = K, g = K.g, T = touched || reduced ? 99 : t, floor = 520, U = 22, LIM = 4, ceilY = floor - LIM * U;
          const X = (k) => 300 + k * 26, x0 = 240, x1 = 960;
          // the rock and the low chamber inside it
          g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(x0, floor); g.lineTo(x0, 250); g.quadraticCurveTo(x0 + 30, 150, 470, 145);
          g.quadraticCurveTo(x1 - 10, 135, x1, 210); g.lineTo(x1, floor); g.closePath(); g.fill(); g.globalAlpha = 0.5; g.strokeStyle = col.ink; g.lineWidth = 2; g.stroke(); g.restore();
          g.save(); g.fillStyle = DARK; g.globalAlpha = 0.95; g.fillRect(x0, ceilY, x1 - x0 - 14, floor - ceilY); g.restore();
          K.seg(x0, ceilY, x1 - 14, ceilY, { color: col.green, width: 4, sketch: false });
          K.seg(40, floor, x1, floor, { color: col.axis, width: 2, sketch: false });
          heightPanel(K, wy, col);
          if (Math.abs(beta - th) > 0.02) perch(K, 110, wy(beta));
          bird(K, 110, wy(beta), 0.8, { color: beta > th ? "#e98b5d" : undefined });
          K.text("drag the bird", 110, 592, { size: 16, align: "center", color: col.muted });
          // echo after echo, rising from the chamber floor; past the ceiling they crack the rock
          const kmax = Math.floor(clamp(T / 0.3, 1, 24)), ratio = (sig - th) / (sig - beta);
          for (let k = 1; k <= kmax; k++) {
            const r = 2 * Math.pow(ratio, k), h = Math.min(r, 14), over = r > LIM;
            K.box(X(k) - 6, floor - h * U, 12, h * U, { color: null, fill: over ? col.red : col.blue, fillAlpha: 0.85 });
            if (over) { g.save(); g.strokeStyle = col.red; g.lineWidth = 1.6; const cx = X(k);
              g.beginPath(); g.moveTo(cx - 6, ceilY); g.lineTo(cx - 12, ceilY - 8); g.moveTo(cx + 6, ceilY); g.lineTo(cx + 12, ceilY - 9); g.stroke(); g.restore(); }
            if (r > 14) K.text("↑", X(k), floor - 14 * U - 12, { size: 16, align: "center", bold: true, color: col.red });
          }
          K.text("volume limit", x0 + 10, ceilY - 14, { size: 15, bold: true, color: col.green, halo: true });
          K.text("echo after echo →", x1 - 24, floor - 12, { size: 14, align: "right", color: PALE });
          // Grey and Kito on top of the rock
          bird(K, 840, 152, 1.2, { color: GREY, flip: true }); bird(K, 900, 160, 0.95, { flip: true });
          if (kmax >= 24 || touched || reduced) K.text(beta > th ? "the echoes break the ceiling: impossible, so no bird up there" : "the echoes stay under the ceiling: no contradiction", 600, 600, { size: 20, align: "center", bold: true, color: beta > th ? col.red : col.green });
          return !touched && !reduced && t < 7.6;
        },
      };
    });

    // ---------------------------------------------------------------- 18: listening at certain dawns, seen from the cave mouth
    S("w-dawns", ({ reduced }) => {
      let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const STARS = Array.from({ length: 70 }, () => [230 + rnd() * 730, 120 + rnd() * 320, 0.6 + rnd() * 1.3]);
      return {
        draw(K, t) {
          const { col } = K, g = K.g, gy = 470, skyT = 110, sx0 = 220, sx1 = 960, LX = (L) => 240 + (L / 13) * 700;
          const sky = g.createLinearGradient(0, skyT, 0, gy); sky.addColorStop(0, "#1b2440"); sky.addColorStop(1, "#3b4868");
          g.save(); g.fillStyle = sky; g.beginPath(); g.roundRect(sx0, skyT, sx1 - sx0, gy - skyT, [14, 14, 0, 0]); g.fill(); g.restore();
          STARS.forEach(([x, y, r]) => K.dot(x, y, r, PALE, 0.7));
          const W = [[2, 3], [4, 6], [8, 12]];
          W.forEach(([a, b], i) => {
            const al = reduced ? 1 : K.ease(K.ph(t, 0.4 + i * 0.9, 1.4 + i * 0.9)); if (al <= 0) return;
            const x0 = LX(a), x1 = LX(b), gl = g.createLinearGradient(0, gy, 0, skyT);
            gl.addColorStop(0, `rgba(242,178,74,${0.9 * al})`); gl.addColorStop(0.55, `rgba(242,178,74,${0.35 * al})`); gl.addColorStop(1, "rgba(242,178,74,0)");
            g.save(); g.fillStyle = gl; g.fillRect(x0, skyT, x1 - x0, gy - skyT); g.restore();
            K.text(`dawn ${i + 1}`, (x0 + x1) / 2, gy - 22, { size: 16, bold: true, align: "center", color: "#3a2a10" });
          });
          { const al = reduced ? 1 : K.ease(K.ph(t, 3.2, 4.2)); const x0 = LX(12) + 34, gl = g.createLinearGradient(x0, 0, sx1, 0);
            gl.addColorStop(0, `rgba(242,178,74,${0.5 * al})`); gl.addColorStop(1, "rgba(242,178,74,0)");
            g.save(); g.beginPath(); g.roundRect(sx0, skyT, sx1 - sx0, gy - skyT, [14, 14, 0, 0]); g.clip(); g.fillStyle = gl; g.fillRect(x0, skyT, sx1 - x0, gy - skyT); g.restore();
            if (al > 0.5) K.text("…and always another, further on", sx1 - 14, skyT + 28, { size: 15, align: "right", color: PALE }); }
          g.save(); g.fillStyle = "#6b5a3a"; g.fillRect(sx0, gy, sx1 - sx0, 10); g.restore();
          // the cave, with Grey and Kito at its mouth looking out
          caveRock(K, 0, 228, 140, gy, 30, 200, 300);
          K.seg(0, gy, 228, gy, { color: col.axis, width: 2, sketch: false });
          bird(K, 90, gy, 1.25, { color: GREY }); bird(K, 160, gy, 1.0);
          // a bird above the middle wire, far out, caught at dawn 3
          const hb = reduced ? 1 : K.ease(K.ph(t, 3.6, 4.6));
          if (hb > 0) { bird(K, 850, gy, 1.0, { color: "#e98b5d", sing: reduced ? 0.4 : t * 0.5, alpha: hb }); }
          K.text("each listening stretch runs from Y to Y^{1.5}", 230, 510, { size: 16, color: col.ink });
          K.text("time, on a log scale →", sx1, 510, { size: 14, align: "right", color: col.muted });
          if (hb >= 1) K.text("a bird above the middle wire is loud everywhere: some dawn catches it", 590, 580, { size: 20, bold: true, align: "center", color: col.red });
          return !reduced && t < 4.8;
        },
      };
    });
  }

  // ================================================================== fork B: the twig piles, the first wall, the Far Ones, the old balance (pages 19–23, 25)
  {
    const B_WOOD = "#8b5e34", B_WOOD2 = "#6e4a2a", B_STONE = "#9c9283", B_GREY = "#c9b27a";
    const B_isP = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
    const B_primes = (N) => { const o = []; for (let n = 2; n < N; n++) if (B_isP(n)) o.push(n); return o; };
    const B_sq = (p, m) => { for (let k = 1; k < m; k++) if ((k * k) % m === p % m) return 1; return -1; };
    const B_vp = (n, p) => { let e = 0; while (n % p === 0) { n /= p; e++; } return e; };
    const B_KINDS = [[1, 1], [-1, 1], [-1, -1], [1, -1]];          // the gold pile (ψ = +1, χ = −1) last, next to the wall
    const B_PX = [300, 435, 570, 705];
    const B_sgn = (v) => (v > 0 ? "+1" : "−1");

    function B_ground(K, y, x0, x1) {
      const g = K.g; g.save(); g.strokeStyle = "#8f9a48"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
      g.lineWidth = 1.6; for (let x = x0 + 8; x < x1; x += 23) { const h = 5 + ((x * 7) % 6); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y - h); g.moveTo(x + 2, y); g.lineTo(x + 5, y - h + 2); g.stroke(); }
      g.restore();
    }
    // a heap of twigs in a pile, n twigs, centred at cx on the ground y
    function B_pile(K, cx, y, n, o = {}) {
      const g = K.g; g.save(); g.globalAlpha = o.alpha ?? 1;
      const k = o.s || 1;
      for (let j = 0; j < n; j++) { const row = Math.floor(j / 3), c = j % 3, x = cx - 46 * k + c * 28 * k + (row % 2) * 12 * k, yy = y - 6 - row * 9 * k, a = -0.06 + ((j * 37) % 7) * 0.02;
        twig(K, x, yy, 40 * k, a, { width: 5 * k, color: o.color || "#b59a74" }); }
      g.restore();
    }
    // the first wall: woven, with one gold doorway at the bottom
    function B_wall(K, x, top, y, w = 56) {
      const g = K.g; g.save(); g.fillStyle = "#a08a5a"; g.beginPath(); g.roundRect(x, top, w, y - top, 6); g.fill();
      g.beginPath(); g.roundRect(x, top, w, y - top, 6); g.clip(); g.lineWidth = 2;
      for (let yy = top + 6; yy < y; yy += 11) { g.strokeStyle = (yy / 11) % 2 < 1 ? "#7d6a40" : "#c2ad7a"; g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + w / 2, yy + 4, x + w, yy); g.stroke(); }
      g.restore();
      g.save(); g.fillStyle = "rgba(226,173,23,0.55)"; g.beginPath(); g.moveTo(x + 10, y); g.lineTo(x + 10, y - 50); g.arc(x + w / 2, y - 50, w / 2 - 10, Math.PI, 0); g.lineTo(x + w - 10, y); g.closePath(); g.fill(); g.restore();
    }
    // an old balance: stone plinth, wooden post and beam. tilt > 0: right side down. returns pans and beam ends
    function B_scale(K, cx, cy, half, tilt, base) {
      const g = K.g, c = Math.cos(tilt), s = Math.sin(tilt), E1 = [cx - c * half, cy - s * half], E2 = [cx + c * half, cy + s * half], drop = 105;
      g.save(); g.lineCap = "round";
      g.fillStyle = B_STONE; g.beginPath(); g.moveTo(cx - 60, base - 34); g.lineTo(cx + 60, base - 34); g.lineTo(cx + 84, base); g.lineTo(cx - 84, base); g.closePath(); g.fill();
      g.strokeStyle = "rgba(60,50,40,0.35)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - 72, base - 17); g.lineTo(cx + 72, base - 17); g.moveTo(cx - 20, base - 34); g.lineTo(cx - 20, base - 17); g.moveTo(cx + 26, base - 17); g.lineTo(cx + 26, base); g.stroke();
      g.strokeStyle = B_WOOD2; g.lineWidth = 14; g.beginPath(); g.moveTo(cx, base - 34); g.lineTo(cx, cy); g.stroke();
      g.strokeStyle = B_WOOD; g.lineWidth = 11; g.beginPath(); g.moveTo(E1[0], E1[1]); g.lineTo(E2[0], E2[1]); g.stroke();
      g.strokeStyle = "#a0703f"; g.lineWidth = 2; g.beginPath(); g.moveTo(E1[0] + 8 * c, E1[1] - 3); g.lineTo(E2[0] - 8 * c, E2[1] - 3); g.stroke();
      g.fillStyle = B_WOOD2; g.beginPath(); g.arc(cx, cy, 9, 0, Math.PI * 2); g.fill();
      const pans = [[E1[0], E1[1] + drop], [E2[0], E2[1] + drop]];
      pans.forEach(([px, py], i) => { const E = i ? E2 : E1;
        g.strokeStyle = B_WOOD2; g.lineWidth = 1.4; [-70, 0, 70].forEach((d) => { g.beginPath(); g.moveTo(E[0], E[1]); g.lineTo(px + d, py); g.stroke(); });
        g.fillStyle = "rgba(184,134,79,0.45)"; g.strokeStyle = B_WOOD2; g.lineWidth = 2.5; g.beginPath(); g.moveTo(px - 88, py); g.lineTo(px + 88, py); g.lineTo(px + 64, py + 20); g.lineTo(px - 64, py + 20); g.closePath(); g.fill(); g.stroke(); });
      g.restore();
      return { pans, E1, E2 };
    }
    // prime twigs, each as long as ln p, laid in rows on a pan
    function B_panTwigs(K, P, list, u, W = 160) {
      const { col } = K, pal = { 2: col.blue, 3: "#c47a2a", 5: col.green, 7: col.purple };
      let row = 0, xpos = 0;
      list.forEach((p) => { const len = Math.log(p) * u; if (xpos + len > W) { row++; xpos = 0; }
        const x0 = P[0] - W / 2 + xpos, y = P[1] - 6 - row * 7; K.seg(x0, y, x0 + len - 2, y, { color: pal[p] || BIRD.twig, width: 5, sketch: false }); xpos += len; });
    }
    function B_measure(K, x, y, rx, ry, t, alpha = 1) {
      const g = K.g; g.save(); g.globalAlpha = alpha; g.strokeStyle = K.col.purple; g.lineWidth = 2; g.setLineDash([6, 5]); g.lineDashOffset = -t * 12;
      g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    }

    // ---------------------------------------------------------------- 19: Grey sorts the twigs into four piles before the first wall
    S("w-bins", ({ reduced }) => {
      const ps = B_primes(140).filter((p) => p !== 3 && p !== 7);
      const kindOf = (p) => B_KINDS.findIndex(([a, b]) => B_sq(p, 3) === a && B_sq(p, 7) === b);
      const DT = 0.2, FL = 0.7, T0 = 0.8, G = 470, HX = 120, PX = [275, 415, 555, 695], SC = 1.25;
      return {
        draw(K, t) {
          const { col } = K, g = K.g;
          B_ground(K, G, 40, 960);
          // beyond the wall, the loom, faint
          g.save(); g.globalAlpha = 0.28; loomFrame(K, 890, 975, 260, G); g.restore();
          K.text("the loom", 932, 228, { size: 15, align: "center", color: col.muted });
          B_wall(K, 800, 200, G);
          K.text("the first wall", 790, 130, { size: 17, bold: true, align: "center", color: col.muted });
          // gold glow behind the gold pile
          g.save(); g.fillStyle = "rgba(226,173,23,0.16)"; g.beginPath(); g.ellipse(PX[3] + 8, G - 22, 92, 48, 0, 0, Math.PI * 2); g.fill(); g.restore();
          const counts = [0, 0, 0, 0], heap = [];
          let flying = null, last = -1;
          ps.forEach((p, k) => {
            const tk = T0 + k * DT, f = reduced ? 1 : clamp((t - tk) / FL, 0, 1), i = kindOf(p);
            if (f <= 0) { heap.push(p); return; }
            if (t >= tk) last = k;
            if (f < 1) { flying = flying || []; flying.push([p, i, f, counts[i]]); return; }
            counts[i]++;
          });
          B_KINDS.forEach((_, i) => B_pile(K, PX[i], G, counts[i], { s: SC, color: i === 3 ? "#c9962e" : "#b59a74" }));
          // the unsorted heap
          heap.forEach((p, j) => twig(K, HX - 60 + ((j * 29) % 90), G - 6 - Math.floor(j / 4) * 8, 50, -0.5 + ((j * 53) % 10) * 0.1, { width: 5, color: "#9a7a52" }));
          (flying || []).forEach(([p, i, f, j]) => {
            const e = K.ease(f), row = Math.floor(j / 3), c = j % 3, tx = PX[i] + (-46 + c * 28 + (row % 2) * 12) * SC, ty = G - 6 - row * 9 * SC;
            const x = HX + 20 + (tx - HX - 20) * e, y = G - 70 + (ty - G + 70) * e - Math.sin(Math.PI * e) * 120;
            twig(K, x, y, 50, (1 - e) * 2.4, { width: 6, color: i === 3 ? "#c9962e" : "#b59a74" });
            K.text(String(p), x + 25, y - 20, { size: 17, bold: true, align: "center", color: col.ink, halo: true });
          });
          // Grey on the heap, tossing; Kito by the wall, looking back at the three dull piles
          const toss = !reduced && last >= 0 && t - (T0 + last * DT) < 0.12 ? -5 : 0;
          bird(K, HX + 10, G - 40 + toss, 1.7, { color: B_GREY });
          bird(K, 830, 200, 1.35, { flip: true });
          B_KINDS.forEach(([a, b], i) => K.text(`ψ ${B_sgn(a)} · χ ${B_sgn(b)}`, PX[i], G + 28, { size: 17, align: "center", color: i === 3 ? col.gold : col.muted, bold: i === 3 }));
          K.text("the gold pile: the only one the loom can weigh", 520, G + 66, { size: 19, bold: true, align: "center", color: col.gold });
          K.text("Grey sorts each twig p by two questions:", 430, 92, { size: 19, align: "center", color: col.muted });
          K.text("ψ: is p a square mod 3?     χ: is p a square mod 7?", 430, 124, { size: 19, align: "center", color: col.muted });
          return !reduced && t < T0 + ps.length * DT + FL + 0.2;
        },
      };
    });

    // ---------------------------------------------------------------- 20: Kito scratches four rows of signs in the dirt; three piles cancel
    S("w-fourier", ({ reduced }) => {
      const ps = B_primes(140).filter((p) => p !== 3 && p !== 7);
      const counts = B_KINDS.map(([a, b]) => ps.filter((p) => B_sq(p, 3) === a && B_sq(p, 7) === b).length);
      const ROWS = [["all twigs", () => 1, "ink"], ["+ ψ helper", (a) => a, "blue"], ["− χ helper", (a, b) => -b, "red"], ["− ψχ helper", (a, b) => -a * b, "purple"]];
      const T0 = 0.6, DT = 0.32, TS = T0 + 16 * DT + 0.4, G = 592, RY = [190, 240, 290, 340], SY = 408;
      return {
        draw(K, t) {
          const { col } = K, g = K.g, T = reduced ? 99 : t;
          // the patch of dirt Kito writes in
          g.save(); g.fillStyle = "rgba(160,112,63,0.12)"; g.beginPath(); g.roundRect(150, 150, 630, 300, 18); g.fill(); g.restore();
          B_ground(K, G, 40, 960);
          B_wall(K, 800, 400, G, 50);
          const cancel = clamp((T - TS - 0.6) / 1, 0, 1);
          B_KINDS.forEach((_, i) => B_pile(K, B_PX[i], G, counts[i], { color: i === 3 ? "#c9962e" : "#b59a74", alpha: i === 3 ? 1 : 1 - 0.7 * cancel }));
          if (cancel > 0) { g.save(); g.globalAlpha = cancel; g.fillStyle = "rgba(226,173,23,0.18)"; g.beginPath(); g.ellipse(B_PX[3], G - 16, 76, 36, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
          let kx = 250, ky = RY[0];
          ROWS.forEach(([name, f, c], r) => {
            if (T < T0 + r * 4 * DT) return;
            K.text(name, 262, RY[r], { size: 18, bold: true, align: "right", color: col[c] });
            B_KINDS.forEach(([a, b], i) => { const ts = T0 + (r * 4 + i) * DT; if (T < ts) return;
              K.text(B_sgn(f(a, b)), B_PX[i], RY[r], { size: 25, bold: true, align: "center", color: col[c] });
              kx = B_PX[i] + 34; ky = RY[r] + 16; });
          });
          if (T >= TS) {
            K.seg(180, 372, 760, 372, { color: B_WOOD, width: 2.5 });
            K.text("add them up", 262, SY, { size: 18, bold: true, align: "right", color: col.ink });
            B_KINDS.forEach(([a, b], i) => { const v = 1 + a - b - a * b;
              K.text(String(v), B_PX[i], SY, { size: 32, bold: true, align: "center", color: v ? col.gold : col.muted }); });
            kx = B_PX[3] + 40; ky = SY + 18;
          }
          if (cancel >= 1) K.text("÷ 4: exactly the gold pile, counted once", 470, 440, { size: 19, bold: true, align: "center", color: col.gold });
          // Kito pecks out each sign; Grey watches from the wall
          const peck = !reduced && T < TS ? Math.abs(Math.sin(t * 9)) * 3 : 0;
          bird(K, kx + 6, ky + peck, 0.95);
          bird(K, 826, 400, 1.5, { flip: true, color: B_GREY });
          B_KINDS.forEach(([a, b], i) => K.text(`ψ ${B_sgn(a)} · χ ${B_sgn(b)}`, B_PX[i], G + 24, { size: 16, align: "center", color: i === 3 ? col.gold : col.muted }));
          return !reduced && t < TS + 1.8;
        },
      };
    });

    // ---------------------------------------------------------------- 21: at the colony's edge, Kito sees a Far One's shadow
    S("w-farones", ({ reduced }) => ({
      draw(K, t) {
        const { col } = K, g = K.g, fa = reduced ? 1 : K.ease(K.ph(t, 0.3, 2.2));
        // haze beyond the edge
        g.save(); const gr = g.createRadialGradient(760, 320, 30, 760, 320, 330); gr.addColorStop(0, "rgba(138,111,209,0.16)"); gr.addColorStop(1, "rgba(138,111,209,0)");
        g.fillStyle = gr; g.fillRect(400, 0, 600, 640); g.restore();
        // the bank, ending in an edge
        g.save(); g.fillStyle = "rgba(154,166,78,0.28)"; g.beginPath(); g.moveTo(0, 520); g.lineTo(470, 520); g.quadraticCurveTo(490, 560, 478, 640); g.lineTo(0, 640); g.closePath(); g.fill(); g.restore();
        B_ground(K, 520, 20, 470);
        K.text("the colony's edge", 440, 498, { size: 17, align: "center", color: col.muted });
        // tree and branch, nest, the birds
        g.save(); g.lineCap = "round"; g.strokeStyle = B_WOOD2; g.lineWidth = 16; g.beginPath(); g.moveTo(80, 520); g.lineTo(84, 250); g.stroke();
        g.strokeStyle = B_WOOD; g.lineWidth = 8; g.beginPath(); g.moveTo(84, 330); g.quadraticCurveTo(260, 316, 430, 322); g.stroke(); g.restore();
        WEAVE.nest(K, 150, 330, 46, 74);
        bird(K, 240, 320, 1.7, { color: B_GREY });
        bird(K, 395, 321, 1.45);
        // the birds' own work: a little twig pile, counted
        B_pile(K, 230, 520, 7, { s: 1.2 });
        K.text("the birds count twigs", 230, 556, { size: 17, align: "center", color: col.muted });
        // the Far One, its shadow on the haze, measuring a bundle's size and carrying a strand
        g.save(); g.globalAlpha = 0.14 * fa; g.fillStyle = col.purple; g.beginPath(); g.ellipse(780, 560, 120, 16, 0, 0, Math.PI * 2); g.fill(); g.restore();
        farOne(K, 780, 500, 340, { t, alpha: fa });
        g.save(); g.globalAlpha = fa; WEAVE.bundle(K, 590, 200, 80, 9); g.restore();
        B_measure(K, 590, 200, 62, 34, t, fa);
        K.text("size", 590, 150, { size: 17, bold: true, align: "center", color: col.purple, alpha: fa });
        g.save(); g.globalAlpha = 0.8 * fa; g.strokeStyle = "#d9a21b"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(640, 210);
        g.bezierCurveTo(700, 240, 690, 330, 760, 340); g.stroke(); g.restore();
        K.text("a Far One's shadow", 780, 98, { size: 21, bold: true, align: "center", color: col.purple, alpha: fa });
        K.text("measures size, carries strands", 780, 604, { size: 17, align: "center", color: col.muted, alpha: fa });
        return true;
      },
    }));

    // ---------------------------------------------------------------- 22: the old balance; Grey loads twigs, a Far One sizes the bundle
    S("w-twoways", ({ reduced }) => {
      const A = [6, 10, 15, 20, 25, 30], STEP = 1.6, T0 = 0.4;
      const twigsOf = (a) => { const o = []; for (let p = 2; p <= a; p++) if (B_isP(p)) { let e = 0; for (let q = p; q <= a; q *= p) e += Math.floor(a / q); for (let k = 0; k < e; k++) o.push(p); } return o; };
      return {
        draw(K, t) {
          const { col } = K, step = reduced ? A.length - 1 : Math.min(A.length - 1, Math.floor(Math.max(0, t - T0) / STEP)), a = A[step];
          const since = reduced ? 9 : t - T0 - step * STEP;
          let lnf = 0; for (let n = 2; n <= a; n++) lnf += Math.log(n);
          const tw = twigsOf(a);
          const { pans: [L, R], E1 } = B_scale(K, 450, 190, 250, 0, 520);
          B_panTwigs(K, L, tw, 14);
          WEAVE.bundle(K, R[0], R[1] - 26, 110 + a * 1.4, 15);
          farOne(K, R[0] + 175, R[1] + 70, 170, { t });
          B_measure(K, R[0], R[1] - 26, 92, 34, t);
          // Grey on the beam above the left pan, dropping in each new batch of twigs
          const drop = clamp(since / 0.6, 0, 1);
          bird(K, E1[0] + 70, E1[1] - 5 + (drop < 1 ? -4 * Math.sin(Math.PI * drop) : 0), 1.6, { color: B_GREY });
          if (!reduced && step > 0 && drop < 1) twig(K, E1[0] + 40, E1[1] + 10 + drop * 70, 26, 0.3, { width: 4, color: BIRD.twig });
          bird(K, 450, 184, 1.2);
          K.text(`${tw.length} prime twigs, each as long as ln p`, L[0], L[1] + 50, { size: 17, align: "center", color: col.muted });
          K.math(`Σ ln p = ${lnf.toFixed(2)}`, L[0], L[1] + 86, { size: 25, color: col.blue });
          K.text(`the bundle ${a}!, sized by a Far One`, R[0], R[1] + 50, { size: 17, align: "center", color: col.muted });
          K.math(`ln(${a}!) = ${lnf.toFixed(2)}`, R[0], R[1] + 86, { size: 25, color: col.gold });
          K.text("level, every time", 450, 556, { size: 21, bold: true, align: "center", color: col.green });
          K.text("blue 2 · orange 3 · green 5 · purple 7 · brown: larger", 450, 592, { size: 16, align: "center", color: col.muted });
          return !reduced;
        },
      };
    });

    // ---------------------------------------------------------------- 23: Kito counts the 3-twigs layer by layer; Grey keeps the tally on bark
    S("w-legendre", ({ reduced }) => {
      const LAY = 2.0, T0 = 0.6, counts = [27, 9, 3, 1];
      return {
        draw(K, t) {
          const { col } = K, g = K.g, per = 27, x0 = 80, dx = 31, ys = [230, 360, 490];
          const LC = [col.gold, col.red, col.purple, col.blue];
          const T = reduced ? 99 : t, layer = Math.min(4, Math.floor(Math.max(0, T - T0) / LAY)), fr = clamp((T - T0 - layer * LAY) / (LAY * 0.85), 0, 1);
          // how many beads of the current layer are placed
          const placed = (k) => (k < layer ? counts[k] : k === layer && layer < 4 ? Math.floor(fr * counts[k] + 1e-9) : 0);
          for (let n = 1; n <= 81; n++) {
            const r = Math.floor((n - 1) / per), c = (n - 1) % per, x = x0 + c * dx, y = ys[r];
            twig(K, x - 10, y + 40, 22, -Math.PI / 2 + 0.25, { width: 4, color: "#b59a74" });
            const e = B_vp(n, 3);
            for (let k = 0; k < e && k < 4; k++) { const idx = n / 3 ** (k + 1); if (idx <= placed(k)) K.dot(x, y + 18 - k * 15, 6, LC[k]); }
            if (c % 9 === 8) K.text(String(n), x, y + 62, { size: 15, align: "center", color: col.muted });
          }
          // Kito hops to the bundle getting its bead
          let kn = 81, kk = 3;
          if (layer < 4) { kk = layer; kn = Math.max(1, placed(layer)) * 3 ** (layer + 1); }
          { const r = Math.floor((kn - 1) / per), c = (kn - 1) % per, x = x0 + c * dx, y = ys[r];
            bird(K, x - 2, y + 4 - kk * 15 - 18, 0.75); }
          // the bark tally, with Grey
          g.save(); g.fillStyle = "#a0703f"; g.globalAlpha = 0.22; g.beginPath(); g.roundRect(300, 60, 560, 96, 14); g.fill(); g.restore();
          const shown = Math.min(4, layer + (layer < 4 && fr >= 1 ? 1 : 0)), parts = counts.slice(0, shown);
          K.text(`3-twigs in 81!  =  ${parts.length ? parts.join(" + ") : "…"}${shown === 4 ? "  =  40" : ""}`, 580, 94, { size: 22, bold: true, align: "center", color: col.ink });
          counts.forEach((v, k) => { K.dot(350 + k * 132, 134, 5, LC[k], k < shown ? 1 : 0.25); K.text(["every 3rd", "every 9th", "every 27th", "every 81st"][k], 360 + k * 132, 134, { size: 16, color: LC[k], bold: true, alpha: k < shown ? 1 : 0.35 }); });
          bird(K, 240, 152, 1.6, { color: B_GREY });
          K.text("the bundles 1, 2, …, 81", 80, 186, { size: 16, color: col.muted });
          return !reduced && t < T0 + 4 * LAY + 0.4;
        },
      };
    });

    // ---------------------------------------------------------------- 25: the balance tips just slightly; the tilt, heard, is the chorus
    S("w-gap", () => {
      const f = (tt) => 0.6 * Math.sin(tt * 1.1) + 0.45 * Math.sin(tt * 2.3 + 1) + 0.3 * Math.sin(tt * 4.1 + 2);
      return {
        draw(K, t) {
          const { col } = K, g = K.g, tilt = -0.045 * f(t);
          const { pans: [L, R], E1 } = B_scale(K, 450, 150, 240, tilt, 420);
          B_panTwigs(K, L, [2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 5, 5, 5, 7, 7, 11, 13], 17);
          WEAVE.bundle(K, R[0], R[1] - 26, 140, 15);
          farOne(K, R[0] + 170, R[1] + 70, 170, { t });
          B_measure(K, R[0], R[1] - 26, 90, 34, t);
          // Kito on the beam, by the twig pan
          const u = 0.62, c = Math.cos(tilt), s = Math.sin(tilt);
          bird(K, 450 - c * u * 240, 150 - s * u * 240 - 5, 1.25);
          K.text("prime twigs, weighed by Kito", L[0], L[1] + 48, { size: 17, align: "center", color: col.muted });
          K.math("Σ ln p · (overhang)", L[0], L[1] + 80, { size: 23, color: col.blue });
          K.text("its size, measured by a Far One", R[0], R[1] + 48, { size: 17, align: "center", color: col.muted });
          K.math("b · ( x ln x − (1 + γ) x )", R[0], R[1] + 80, { size: 23, color: col.gold });
          // the tilt, as a wave, which Grey listens to
          const wy = 498, X0 = 230, X1 = 800;
          K.seg(X0, wy, X1, wy, { color: col.axis, width: 1.5, dash: [5, 6], sketch: false });
          const pts = []; for (let i = 0; i <= 160; i++) { const uu = i / 160; pts.push([X0 + (X1 - X0) * uu, wy - f(t - (1 - uu) * 7) * 26]); }
          K.line(pts, { color: col.red, width: 3.2, sketch: false });
          K.dot(X1, wy - f(t) * 26, 7, col.red);
          K.text("level", X1 + 14, wy, { size: 16, color: col.muted });
          perch(K, 140, wy + 30); bird(K, 140, wy + 28, 1.6, { color: B_GREY });
          g.save(); g.strokeStyle = col.red; g.lineWidth = 2; for (let k = 1; k <= 3; k++) { const ph = (t * 0.8 + k / 3) % 1; g.globalAlpha = ph; g.beginPath(); g.arc(X0 + 6, wy - 6, 8 + ph * 36, Math.PI - 0.6, Math.PI + 0.6); g.stroke(); } g.restore();
          K.text("the tiny tilt, heard as a wave", 515, 560, { size: 19, align: "center", color: col.muted });
          K.math("gap  =  b · G(x)", 515, 600, { size: 30, color: col.red });
          return true;
        },
      };
    });
  }

  // ================================================================== fork C: scenes at the great loom (pages 26, 29, 30, 31, 32)
  // all helper names prefixed cL_ so they never clash with other part files sharing this scope
  function cL_band(K, x, y, w, h, o = {}) {
    const g = K.g; let s = o.seed || Math.round(x * 3 + y * 7 + w); const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.save(); g.globalAlpha = o.alpha ?? 1; g.fillStyle = o.fill || "#a3ad5c"; g.beginPath(); g.roundRect(x, y, w, h, Math.min(8, h / 2)); g.fill();
    g.beginPath(); g.roundRect(x, y, w, h, Math.min(8, h / 2)); g.clip(); g.lineCap = "round";
    const n = Math.round((w * h) / 90);
    for (let k = 0; k < n; k++) { const cx = x + r() * w, cy = y + r() * h, L = 10 + r() * 22, a = (r() - 0.5) * 0.9;
      g.strokeStyle = GRASS[Math.floor(r() * GRASS.length)]; g.lineWidth = 1 + r(); g.globalAlpha = (o.alpha ?? 1) * 0.7;
      g.beginPath(); g.moveTo(cx - Math.cos(a) * L / 2, cy - Math.sin(a) * L / 2); g.lineTo(cx + Math.cos(a) * L / 2, cy + Math.sin(a) * L / 2); g.stroke(); }
    g.restore();
  }
  // a woven cloth: green warp (vertical) and brown weft (horizontal), spacing step; o.alpha fades it
  function cL_cloth(K, x, y, w, h, step, o = {}) {
    const g = K.g; g.save(); g.globalAlpha = o.alpha ?? 1; g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineCap = "round";
    if (o.back) { g.fillStyle = o.back; g.fillRect(x, y, w, h); }
    for (let i = 0; i * step <= w; i++) { g.strokeStyle = GRASS[i % 3]; g.lineWidth = o.width || 3; g.beginPath(); g.moveTo(x + i * step, y); g.lineTo(x + i * step, y + h); g.stroke(); }
    for (let j = 0; j * step <= h; j++) { g.strokeStyle = BROWN[j % 3]; g.lineWidth = o.width || 3; g.beginPath(); g.moveTo(x, y + j * step); g.lineTo(x + w, y + j * step); g.stroke(); }
    g.restore();
  }
  // a bird drawn tipped forward (slumped), feet at (x, y)
  function cL_slump(K, x, y, s, ang, o = {}) { const g = K.g; g.save(); g.translate(x, y); g.rotate(ang); bird(K, 0, 0, s, o); g.restore(); }
  // a balance with its stand on the ground; returns the two pan centres (pan top surface)
  function cL_balance(K, cx, cy, ground, half, tilt) {
    const { col } = K, g = K.g, dx = Math.cos(tilt) * half, dy = Math.sin(tilt) * half;
    g.save(); g.strokeStyle = WOOD2; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, ground); g.stroke();
    g.lineWidth = 8; g.beginPath(); g.moveTo(cx - 50, ground); g.lineTo(cx + 50, ground); g.stroke();
    g.strokeStyle = WOOD; g.lineWidth = 9; g.beginPath(); g.moveTo(cx - dx, cy - dy); g.lineTo(cx + dx, cy + dy); g.stroke(); g.restore();
    K.dot(cx, cy, 8, WOOD2);
    const pans = [[cx - dx, cy - dy + 80], [cx + dx, cy + dy + 80]];
    pans.forEach(([px, py], k) => { const ex = k ? cx + dx : cx - dx, ey = k ? cy + dy : cy - dy;
      [-1, 1].forEach((sg) => K.seg(ex, ey, px + sg * 66, py, { color: col.muted, width: 1.5, sketch: false }));
      K.line([[px - 78, py], [px + 78, py], [px + 58, py + 18], [px - 58, py + 18]], { color: WOOD2, width: 2.5, close: true, fill: "#b89357", fillAlpha: 0.7, sketch: false }); });
    return pans;
  }

  // ------------------------------------------------------------------ 26: one weaving pass. Grey sends a long strand across; a Far One carries it into the partner world
  S("w-pass", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, f = reduced ? 1 : K.ease(K.ph(t, 0.6, 4.2)), by = 150;
      // the partner world, behind a shimmer
      g.save(); g.fillStyle = col.purple; g.globalAlpha = 0.07; g.beginPath(); g.roundRect(610, 110, 340, 440, 26); g.fill(); g.restore();
      g.save(); g.strokeStyle = col.purple; g.globalAlpha = 0.5; g.lineWidth = 1.6; g.setLineDash([6, 6]); g.beginPath(); g.roundRect(610, 110, 340, 440, 26); g.stroke(); g.restore();
      K.text("the partner world", 780, 136, { size: 16, bold: true, align: "center", color: col.purple });
      // the home loom: a big hoop with a very long strand
      loomFrame(K, 70, 420, by, 540);
      const BH = [245, 330, 118];
      hoop(K, 245, by, BH[0], BH[1], BH[2]);
      { g.save(); g.strokeStyle = L_GOLD; g.lineWidth = 2.6; g.beginPath(); for (let k = 0; k <= 600; k++) { const u = k / 600, a = u * 7 * Math.PI * 2, rr = (BH[2] - 10) * (0.12 + 0.86 * u); const X = BH[0] + rr * Math.cos(a), Y = BH[1] + rr * Math.sin(a); k ? g.lineTo(X, Y) : g.moveTo(X, Y); } g.stroke(); g.restore(); }
      // the partner loom: a small hoop
      loomFrame(K, 680, 880, 220, 520);
      const SH = [780, 330, 46];
      hoop(K, 780, 220, SH[0], SH[1], SH[2]);
      if (f > 0.85) coil(K, SH[0], SH[1], SH[2] - 7, L_GOLD, { turns: 2.4, width: 2.4, alpha: (f - 0.85) / 0.15 });
      // strands carried across, through the Far One's hands
      const N = 9, FX = 520, FY = 230;
      for (let i = 0; i < N; i++) {
        const a = -0.8 + (1.6 * i) / (N - 1), p0 = [BH[0] + BH[2] * Math.cos(a), BH[1] + BH[2] * Math.sin(a)], p1 = [SH[0] - SH[2] * Math.cos(a), SH[1] + SH[2] * Math.sin(a)];
        const fi = clamp(f * 1.6 - i * 0.07, 0, 1); if (fi <= 0) continue;
        const c = [FX, FY + 40 + (i - (N - 1) / 2) * 8];
        g.save(); g.strokeStyle = i % 2 ? L_GOLD : "#a0703f"; g.lineWidth = 2; g.globalAlpha = 0.85; g.beginPath();
        for (let q = 0; q <= 40 * fi; q++) { const u = q / 40, v = 1 - u, X = v * v * p0[0] + 2 * u * v * c[0] + u * u * p1[0], Y = v * v * p0[1] + 2 * u * v * c[1] + u * u * p1[1]; q ? g.lineTo(X, Y) : g.moveTo(X, Y); }
        g.stroke(); g.restore();
      }
      farOne(K, FX, FY + 120, 150, { t });
      K.text("a Far One carries it across", FX, 96, { size: 15, bold: true, align: "center", color: col.purple });
      // Grey feeds the strand, Kito watches from the post
      bird(K, 330, by - 6, 1.15, { color: GREY });
      bird(K, 92, by - 6, 0.9);
      K.text("Grey", 330, by - 58, { size: 14, align: "center", color: col.muted });
      K.text("Kito", 92, by - 52, { size: 14, align: "center", color: col.muted });
      K.text("length a = x · b", BH[0], 480, { size: 17, bold: true, align: "center", color: col.ink });
      K.text("length b", SH[0], 410, { size: 17, bold: true, align: "center", color: col.ink });
      K.text("one weaving pass (a theta lift)", 500, 600, { size: 15, align: "center", color: col.muted });
      return !reduced && t < 4.4;
    },
  }));

  // ------------------------------------------------------------------ 29: Grey ties knots of p into the cloth; the mesh grows finer; a Far One counts it bigger
  S("w-denser", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, by = 110, X0 = 110, Y0 = 140, W = 480, H = 400;
      const kf = reduced ? 1 : K.ease(K.ph(t, 0.5, 2.0)), f = reduced ? 1 : K.ease(K.ph(t, 2.3, 3.6));
      loomFrame(K, 75, 625, by, 590);
      // cloth hanging from the beam
      cL_cloth(K, X0, Y0, W, H, 60, { back: "rgba(185,194,108,0.10)" });
      if (f > 0) cL_cloth(K, X0, Y0, W, H, 30, { width: 2, alpha: f });
      g.save(); g.strokeStyle = WOOD2; g.lineWidth = 1.4; for (let i = 0; i * 60 <= W; i++) { g.beginPath(); g.moveTo(X0 + i * 60, by); g.lineTo(X0 + i * 60, Y0); g.stroke(); } g.restore();
      // knots of p tied on each strand
      const nk = Math.round(kf * 9);
      for (let i = 0; i < nk; i++) { const x = X0 + i * 60, y = Y0 + 8; g.save(); g.fillStyle = col.red; g.beginPath(); g.moveTo(x - 7, y - 5); g.lineTo(x + 7, y + 5); g.lineTo(x + 7, y - 5); g.lineTo(x - 7, y + 5); g.closePath(); g.fill(); g.restore(); }
      // the gold patch the Far One measures
      const PX = 230, PY = 260, PS = 120, step = f > 0.5 ? 30 : 60, n = PS / step;
      K.box(PX - 3, PY - 3, PS + 6, PS + 6, { color: col.gold, width: 3, sketch: false });
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) K.dot(PX + i * step, PY + j * step, step === 30 ? 4 : 6, col.gold);
      // birds: Grey ties the knots along the beam, Kito watches
      const gx = X0 + Math.max(0, nk - 1) * 60;
      bird(K, gx, by - 6, 1.0, { color: GREY });
      bird(K, 82, by - 6, 0.85);
      // the Far One, measuring at infinity
      farOne(K, 830, 430, 200, { t });
      K.seg(790, 320, PX + PS + 6, PY + PS / 2, { color: col.gold, width: 1.6, dash: [4, 6], sketch: false });
      K.text("a knot of p on every strand", X0 + W / 2, Y0 + H + 22, { size: 15, bold: true, align: "center", color: col.red });
      K.text(f > 0.5 ? "16 crossings in the gold patch" : "4 crossings in the gold patch", 830, 470, { size: 16, bold: true, align: "center", color: col.gold });
      K.text("to a Far One, measuring at infinity,", 830, 500, { size: 15, align: "center", color: col.muted });
      K.text("the finer mesh counts as bigger", 830, 522, { size: 15, bold: true, align: "center", color: col.green });
      K.text("(divided by p = 2, in 2 directions: 4×)", 830, 548, { size: 13, align: "center", color: col.muted });
      return !reduced && t < 3.8;
    },
  }));

  // ------------------------------------------------------------------ 30: two lattices of light hang on the loom; a Far One measures the area of a tile
  S("w-period", () => ({
    draw(K, t) {
      const { col } = K, g = K.g, by = 100;
      loomFrame(K, 40, 680, by, 600);
      const panel = (x0, title, sub, basis, u, rulerOn) => {
        const W = 270, y0 = 140, y1 = 470, o = [x0 + 70, y1 - 100], P = (a, b) => [o[0] + (a * basis[0][0] + b * basis[1][0]) * u, o[1] - (a * basis[0][1] + b * basis[1][1]) * u];
        [x0 + 40, x0 + W - 40].forEach((cx) => K.seg(cx, by, cx, y0, { color: WOOD2, width: 1.4, sketch: false }));
        g.save(); g.fillStyle = "#1d2130"; g.globalAlpha = 0.9; g.beginPath(); g.roundRect(x0, y0, W, y1 - y0, 12); g.fill(); g.restore();
        g.save(); g.beginPath(); g.rect(x0 + 4, y0 + 4, W - 8, y1 - y0 - 8); g.clip();
        const tile = [P(0, 0), P(1, 0), P(1, 1), P(0, 1), P(0, 0)];
        K.line(tile, { color: "#f2c14e", width: 2.5, fill: "#f2c14e", fillAlpha: 0.18 + 0.08 * Math.sin(t * 2), sketch: false });
        for (let a = -4; a <= 5; a++) for (let b = -3; b <= 5; b++) { const [x, y] = P(a, b); if (x > x0 && x < x0 + W && y > y0 && y < y1) { K.dot(x, y, 11, "#f2c14e", 0.16); K.dot(x, y, 4.5, "#fff2c8"); } }
        if (rulerOn) { const A = P(0, 0), B = P(1, 0), L = Math.hypot(B[0] - A[0], B[1] - A[1]), yy = A[1] + 16;
          g.shadowColor = "#f2c14e"; g.shadowBlur = 14; g.fillStyle = "#f2c14e"; g.beginPath(); g.roundRect(A[0], yy - 6, L, 12, 4); g.fill(); g.shadowBlur = 0; }
        g.restore();
        K.text(title, x0 + W / 2, y1 + 26, { size: 17, bold: true, align: "center" });
        K.text(sub, x0 + W / 2, y1 + 48, { size: 14, align: "center", color: col.muted });
        const c = P(1, 0); return [c[0], c[1] + 16];
      };
      const phase = Math.floor(t / 3.5) % 2;
      const e1 = panel(65, "Z[i]: square", "complex multiplication", [[1, 0], [0, 1]], 66, phase === 0);
      const e2 = panel(385, "Z[ω]: hexagonal", "complex multiplication", [[1, 0], [0.5, Math.sqrt(3) / 2]], 72, phase === 1);
      const end = phase === 0 ? e1 : e2;
      bird(K, 350, by - 6, 1.05, { color: GREY }); bird(K, 392, by - 6, 0.85);
      farOne(K, 840, 330, 200, { t });
      K.seg(800, 250, end[0] + 6, end[1], { color: col.gold, width: 1.6, dash: [4, 6], sketch: false });
      K.text("a Far One measures", 840, 372, { size: 16, bold: true, align: "center", color: col.purple });
      K.text("the area of one tile", 840, 394, { size: 16, bold: true, align: "center", color: col.purple });
      K.serif("Chowla–Selberg: the areas", 840, 446, { size: 17, align: "center", color: col.muted });
      K.serif("come out exactly, and", 840, 470, { size: 17, align: "center", color: col.muted });
      K.serif("Euler's γ = 0.5772… appears", 840, 494, { size: 17, align: "center", color: col.gold });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 31: one pass: the scale is swamped by its errors; Kito slumps
  S("w-scale", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, ground = 560, tilt = (reduced ? 1 : K.ease(K.ph(t, 0.5, 2.0))) * 0.3;
      // the loom behind, with one pass of cloth on it
      g.save(); g.globalAlpha = 0.45; loomFrame(K, 50, 300, 140, ground); g.restore();
      cL_band(K, 75, 400, 200, 40, { seed: 7, alpha: 0.6 });
      K.text("one pass", 175, 470, { size: 14, align: "center", color: col.muted });
      const [L, R] = cL_balance(K, 640, 210, ground, 210, tilt);
      // left pan: the chorus, a small bundle
      g.save(); g.strokeStyle = L_GOLD; g.lineWidth = 4; g.lineCap = "round";
      for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(L[0] - 22, L[1] - 4 - k * 4); g.lineTo(L[0] + 22, L[1] - 6 - k * 4); g.stroke(); } g.restore();
      K.text("b · G(x)", L[0], L[1] + 44, { size: 17, bold: true, align: "center", color: col.blue });
      K.text("the chorus", L[0], L[1] + 66, { size: 14, align: "center", color: col.muted });
      // right pan: a heap of error blocks
      const nb = reduced ? 15 : Math.round(15 * K.ease(K.ph(t, 0.3, 1.8))); let c = 0;
      for (let k = 0; k < 5 && c < nb; k++) for (let j = 0; j < 5 - k && c < nb; j++, c++)
        K.box(R[0] - 70 + j * 28 + k * 14, R[1] - 24 - k * 24, 26, 22, { fill: col.red, fillAlpha: 0.4, color: col.red, sketch: false, r: 3 });
      K.text("errors ≈ b · x", R[0], R[1] + 44, { size: 17, bold: true, align: "center", color: col.red });
      K.seg(30, ground, 960, ground, { color: col.axis, width: 2, sketch: false });
      // Kito slumped by the scale; Grey beside
      const sl = reduced ? 1 : K.ease(K.ph(t, 1.8, 2.8));
      cL_slump(K, 440, ground, 1.05, 0.75 * sl);
      if (sl > 0.9) K.text("sigh…", 470, ground - 62, { size: 14, align: "center", color: col.muted, alpha: (sl - 0.9) * 10 });
      bird(K, 370, ground, 1.15, { color: GREY });
      K.text("b · G(x) ≤ errors: true, but it tells us nothing", 640, 56, { size: 16, align: "center", color: col.muted });
      return !reduced && t < 3;
    },
  }));

  // ------------------------------------------------------------------ 32: weave again: layers of cloth build up on the loom, one minus turns to plus per pass
  S("w-chain", ({ reduced }) => {
    const M = 8, DT = 0.85;
    return {
      draw(K, t) {
        const { col } = K, g = K.g, by = 110, ground = 580;
        const j = reduced ? M : Math.min(M, Math.floor(Math.max(0, t - 0.4) / DT) + (t > 0.4 ? 1 : 0));
        loomFrame(K, 80, 560, by, ground);
        for (let k = 0; k < M; k++) cL_band(K, 110, ground - 50 - k * 46, 420, 40, { seed: 11 + k, alpha: k < j ? 1 : 0.1 });
        for (let k = 0; k < j; k++) K.text(`pass ${k + 1}`, 124, ground - 30 - k * 46, { size: 13, bold: true, align: "left", color: "#3d3a1c" });
        // Grey on the beam feeds a gold strand down into the newest layer
        const gx = 360;
        bird(K, gx, by - 6, 1.1, { color: GREY });
        if (j > 0 && j <= M) { const ty = ground - 50 - (j - 1) * 46 + 20; g.save(); g.strokeStyle = L_GOLD; g.lineWidth = 2.5; g.beginPath(); g.moveTo(gx + 26, by - 34); g.quadraticCurveTo(gx + 60, (by + ty) / 2, gx + 20, ty); g.stroke(); g.restore(); }
        // the signs of the group, as beads on a cord; Kito turns one each pass
        const cx0 = 640, cx1 = 940, cy = 210;
        K.seg(cx0 - 30, cy, cx1 + 30, cy - 3, { color: WOOD, width: 7, sketch: false });
        K.text("signs of the group", (cx0 + cx1) / 2, 140, { size: 16, bold: true, align: "center", color: col.ink });
        for (let k = 0; k < M; k++) { const x = cx0 + 10 + k * 40, plus = k < j, y = cy + 34;
          K.seg(x, cy, x, y - 15, { color: WOOD2, width: 1.4, sketch: false });
          K.dot(x, y, 15, plus ? col.green : col.red, 0.18); K.ring(x, y, 15, { color: plus ? col.green : col.red, width: 2.5 });
          K.text(plus ? "+" : "−", x, y + 1, { size: 20, bold: true, align: "center", color: plus ? col.green : col.red }); }
        const kx = cx0 + 10 + Math.max(0, Math.min(M - 1, j - 1)) * 40;
        bird(K, kx, cy - 4, 0.8);
        K.text(`passes so far: ${j}`, 790, 330, { size: 20, bold: true, align: "center" });
        K.text("each pass forces its own knots of p,", 790, 372, { size: 15, align: "center", color: col.green });
        K.text("and the gains add up", 790, 394, { size: 15, align: "center", color: col.green });
        K.text("each pass turns one − into +", 790, 430, { size: 14, align: "center", color: col.muted });
        return !reduced && t < 0.4 + M * DT + 0.6;
      },
    };
  });

  // ================================================================== fork D: pages 33–38 (the great loom, and the Far Ones' country)
  const D_nest = window.WEAVE.nest;
  const D_INK = "#3a2c1c", D_PAPER = "#efe2c2", D_PGOLD = "#a8731a", D_PGREEN = "#4f7a2a", D_PBLUE = "#2f62a8", D_PRED = "#b03a2e";
  const D_rng = (seed) => { let s = seed % 2147483646 + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  function D_band(K, x, y, w, h, seed, fill) {
    const g = K.g, r = D_rng(seed || 7);
    g.save(); g.fillStyle = fill || "#a3ad5c"; g.beginPath(); g.roundRect(x, y, w, h, Math.min(7, h / 2)); g.fill();
    g.beginPath(); g.roundRect(x, y, w, h, Math.min(7, h / 2)); g.clip(); g.lineCap = "round";
    const n = Math.round((w * h) / 80);
    for (let k = 0; k < n; k++) { const cx = x + r() * w, cy = y + r() * h, L = 8 + r() * 18, a = (r() - 0.5) * 0.9;
      g.strokeStyle = GRASS[Math.floor(r() * GRASS.length)]; g.lineWidth = 1 + r(); g.globalAlpha = 0.75;
      g.beginPath(); g.moveTo(cx - Math.cos(a) * L / 2, cy - Math.sin(a) * L / 2); g.lineTo(cx + Math.cos(a) * L / 2, cy + Math.sin(a) * L / 2); g.stroke(); }
    g.restore();
  }
  // a slab of bark (or parchment) with a ragged edge; fixed colours so it reads in light and dark
  function D_slab(K, x, y, w, h, o = {}) {
    const g = K.g, r = D_rng(o.seed || 11);
    g.save(); g.beginPath(); g.moveTo(x, y);
    for (let k = 1; k <= 12; k++) g.lineTo(x + (w * k) / 12, y + (r() - 0.5) * 5);
    for (let k = 1; k <= 8; k++) g.lineTo(x + w + (r() - 0.5) * 5, y + (h * k) / 8);
    for (let k = 11; k >= 0; k--) g.lineTo(x + (w * k) / 12, y + h + (r() - 0.5) * 5);
    for (let k = 7; k >= 1; k--) g.lineTo(x + (r() - 0.5) * 5, y + (h * k) / 8);
    g.closePath(); g.fillStyle = o.fill || D_PAPER; g.fill(); g.strokeStyle = o.edge || "#8b6a35"; g.lineWidth = 3; g.stroke();
    g.clip(); g.strokeStyle = "rgba(139,106,53,0.16)"; g.lineWidth = 1.2;
    for (let k = 0; k < 9; k++) { const yy = y + 12 + r() * (h - 24); g.beginPath(); g.moveTo(x, yy); g.bezierCurveTo(x + w * 0.3, yy + 4, x + w * 0.6, yy - 4, x + w, yy + 2); g.stroke(); }
    g.restore();
  }
  // a twig pen held from (x0, y0) to its tip (x1, y1)
  function D_pen(K, x0, y0, x1, y1) { const g = K.g; g.save(); g.strokeStyle = "#6e4a2a"; g.lineWidth = 3; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.fillStyle = D_INK; g.beginPath(); g.arc(x1, y1, 2.5, 0, Math.PI * 2); g.fill(); g.restore(); }

  // ------------------------------------------------------------------ 33: strands piling up at the loom; Far Ones bring the new directions
  S("w-cost", ({ reduced }) => {
    const M = 8, STEP = 0.8, T0 = 0.4;
    return {
      draw(K, t) {
        const { col } = K, g = K.g, by = 100, x0 = 105, dx = 58, bw = 44, bh = 38;
        const pos = reduced ? M : Math.min(M, Math.max(0, (t - T0) / STEP)), j = Math.floor(pos), fr = pos - j;
        loomFrame(K, 70, 575, by, 530);
        bird(K, 92, by - 6, 1.0, { color: GREY });
        let tot = 0;
        for (let k = 1; k <= M; k++) {
          const cx = x0 + (k - 1) * dx, shown = k <= j;
          if (shown) tot += k;
          if (!shown && !(k === j + 1 && fr > 0)) continue;
          const f = shown ? 1 : K.ease(fr);
          g.save(); g.strokeStyle = "#6e4a2a"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx + bw / 2, by + 6); g.lineTo(cx + bw / 2, by + 16); g.stroke(); g.restore();
          for (let q = 0; q < k; q++) {
            const yy = by + 16 + q * (bh + 4) - (1 - f) * 40;
            g.save(); g.globalAlpha = f; D_band(K, cx, yy, bw, bh, k * 31 + q, k === j || (!shown) ? "#c2ad66" : "#a3ad5c"); g.restore();
          }
          K.text(String(k), cx + bw / 2, 556, { size: 14, align: "center", color: col.muted });
        }
        K.text("pass", x0 - 18, 556, { size: 14, align: "right", color: col.muted });
        // a Far One brings each pass's new directions
        const fx = 735, fy = 215;
        farOne(K, fx, fy + 75, 150, { t });
        if (!reduced && j < M && fr > 0) {
          const k = j + 1, tx = x0 + (k - 1) * dx + bw / 2, ty = by + 16 + (k * (bh + 4)) / 2;
          g.save(); g.strokeStyle = col.purple; g.globalAlpha = 0.55 * Math.sin(Math.PI * fr); g.lineWidth = 1.6; g.setLineDash([5, 5]);
          g.beginPath(); g.moveTo(fx - 30, fy); g.quadraticCurveTo((fx + tx) / 2, fy - 120, tx, ty); g.stroke(); g.restore();
        }
        K.text("a Far One carries", fx, 312, { size: 15, align: "center", color: col.purple });
        K.text("each pass's new directions", fx, 332, { size: 15, align: "center", color: col.purple });
        // Kito's tally on a bark slab
        D_slab(K, 640, 390, 300, 150, { seed: 3 });
        bird(K, 905, 392, 0.95, { flip: true });
        K.text("pass j weaves j blocks", 662, 420, { size: 16, color: D_INK });
        const terms = []; for (let k = 1; k <= j; k++) terms.push(k);
        K.text(j ? terms.join(" + ") : "…", 662, 456, { size: j > 6 ? 17 : 19, bold: true, color: D_PGOLD });
        K.text(`= ${tot} blocks for ${j} pass${j === 1 ? "" : "es"}`, 662, 490, { size: 18, bold: true, color: D_INK });
        K.text("m passes: about m²/2", 662, 522, { size: 15, color: D_PRED });
        return !reduced && t < T0 + M * STEP + 0.4 ? true : !reduced;
      },
    };
  });

  // ------------------------------------------------------------------ 34: Kito writes the colony's budget on parchment at the loom
  S("w-ineq", () => ({
    draw(K, t) {
      const { col } = K, g = K.g, a = K.ease(K.ph(t, 0.2, 1.2)), b = K.ease(K.ph(t, 1.4, 2.4)), c = K.ease(K.ph(t, 2.8, 3.6)), mm = 4 + 6 * K.ease(K.ph(t, 1.0, 4.4)), X = 100;
      D_slab(K, 34, 34, 600, 580, { seed: 9 });
      K.text("The colony's budget  (in units of b)", 62, 72, { size: 22, bold: true, color: D_INK });
      K.seg(62, 96, 606, 96, { color: D_INK, width: 2 });
      g.save(); g.globalAlpha = a;
      K.text("line item", 62, 124, { size: 15, color: "#7a6a52" }); K.text("total", 400, 124, { size: 15, color: "#7a6a52", align: "center" }); K.text("per pass (÷ m)", 548, 124, { size: 15, color: "#7a6a52", align: "center" });
      K.text("overhead, shared\nover m passes", 62, 168, { size: 19, bold: true, color: D_PGOLD });
      K.math("x", 400, 174, { size: 30, color: D_PGOLD, italic: true }); K.math("x/m", 548, 174, { size: 30, color: D_PGOLD, italic: true });
      K.seg(62, 214, 606, 214, { color: "rgba(58,44,28,0.25)", width: 1.5, sketch: false });
      K.text("weaving cost,\nm passes", 62, 256, { size: 19, bold: true, color: D_PGREEN });
      K.math("m²", 400, 262, { size: 30, color: D_PGREEN, italic: true }); K.math("m", 548, 262, { size: 30, color: D_PGREEN, italic: true });
      g.restore();
      g.save(); g.globalAlpha = b;
      K.seg(62, 304, 606, 304, { color: D_INK, width: 2 });
      K.text("the prize, once\nper pass:", 62, 344, { size: 19, bold: true, color: D_PBLUE });
      K.math("m · G(x)  ≤  x + m²", 410, 350, { size: 28, color: D_INK });
      g.restore();
      g.save(); g.globalAlpha = c;
      K.arrow(548, 386, 548, 430, { color: D_INK, width: 2.5 }); K.text("÷ m", 574, 408, { size: 20, bold: true, color: D_INK });
      K.wash(330, 494, 260, 44, "#7d8a3a", 0.22, 7);
      K.math("G(x)  ≤  x/m  +  m", 330, 494, { size: 40, color: D_INK });
      K.text("an allowance of about √x", 62, 570, { size: 18, bold: true, color: D_PGOLD });
      g.restore();
      // Kito, standing at the parchment's edge, writing the current line
      const lineY = c > 0 ? 494 : b > 0 ? 350 : 262, wr = !(c >= 1) ? Math.sin(t * 9) * 3 : 0;
      bird(K, 668, lineY + 46, 1.0, { flip: true });
      D_pen(K, 648, lineY + 16, 616 + wr, lineY + 4);
      // the loom behind, and the allowance: two twig piles on either side of a line
      g.save(); g.globalAlpha = 0.35; loomFrame(K, 705, 975, 70, 560); g.restore();
      const base = 530, u = 14, hb = (X / mm) * u, hm = mm * u, allow = Math.sqrt(X) * u;
      K.seg(715, base, 965, base, { color: col.axis, width: 2, sketch: false });
      const bar = (x, h, cc, lab, over) => { K.box(x, base - h, 56, h, { color: cc, width: 2, fill: cc, fillAlpha: 0.5, r: 5, sketch: false }); if (over > 0) K.box(x, base - h, 56, over, { color: null, fill: col.red, fillAlpha: 0.6, r: 5 }); K.text(lab, x + 28, base + 22, { size: 17, bold: true, align: "center", color: cc }); };
      bar(752, hb, col.gold, "x/m", Math.max(0, hb - allow)); bar(842, hm, col.green, "m", Math.max(0, hm - allow));
      K.seg(722, base - allow, 958, base - allow, { color: col.gold, width: 2.2, dash: [8, 6], sketch: false });
      K.text("allowance ≈ √x", 724, base - allow - 16, { size: 15, align: "left", color: col.gold, bold: true, halo: true });
      bird(K, 940, base - allow - 2, 0.75, { color: GREY, flip: true });
      K.text(`x = 100,  m = ${mm.toFixed(1)}`, 840, 112, { size: 17, bold: true, align: "center", halo: true });
      if (Math.abs(mm - 10) < 0.05) K.text("balanced at m = √x", 840, 588, { size: 17, bold: true, align: "center", color: col.green });
      return t < 4.6;
    },
  }));

  // ------------------------------------------------------------------ 35: Kito walks down into the valley; the bottom is at m = √x (drag Kito)
  S("w-minimum", () => {
    let m = 2, touched = false, A = null;
    const X = 100, f = (v) => X / v + v, d = (v) => 1 - X / (v * v);
    return {
      enter() { if (!touched) m = 2; },
      hit(x, y) { return A && Math.hypot(A.X(m) - x, A.Y(f(m)) - y) < 38; },
      press(x, y) { if (!A) return false; const near = Math.hypot(A.X(m) - x, A.Y(f(m)) - y) < 42; if (near) touched = true; return near; },
      drag(x) { if (!A) return; const v = 1 + ((x - A.X(1)) / (A.X(40) - A.X(1))) * 39; m = Math.max(1.2, Math.min(39.5, v)); if (Math.abs(m - 10) < 0.35) m = 10; },
      draw(K, t) {
        const { col } = K, g = K.g;
        A = K.axes([110, 40, 830, 450], [1, 40], [0, 110]);
        const walking = !touched && t < 4.4;
        if (!touched) m = 2 + 8 * K.ease(K.ph(t, 0.6, 4.2));
        // far hills, then the valley floor
        [[0.07, 0.55, 0.9, 150, 2.1], [0.06, 0.4, 1.7, 110, 3.3]].forEach(([al, amp, ph, base, fr]) => {
          g.save(); g.fillStyle = col.green; g.globalAlpha = al; g.beginPath(); g.moveTo(110, A.Y(0));
          for (let i = 0; i <= 80; i++) { const x = 110 + (830 * i) / 80; g.lineTo(x, 40 + base * 0.4 + 60 * (1 - amp * (0.5 + 0.5 * Math.sin(i / 80 * Math.PI * fr + ph)))); }
          g.lineTo(940, A.Y(0)); g.closePath(); g.fill(); g.restore(); });
        const pts = []; for (let i = 0; i <= 300; i++) { const v = 1 + (39 * i) / 300; pts.push([A.X(v), A.Y(f(v))]); }
        g.save(); g.beginPath(); g.moveTo(A.X(1), A.Y(0)); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(A.X(40), A.Y(0)); g.closePath(); g.fillStyle = "#8b6b3e"; g.globalAlpha = 0.45; g.fill(); g.restore();
        // grass tufts along the path
        g.save(); g.lineCap = "round"; g.lineWidth = 2;
        for (let i = 4; i < 300; i += 11) { const [x, y] = pts[i]; g.strokeStyle = GRASS[i % 5]; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y - 8); g.moveTo(x, y); g.lineTo(x + 3, y - 9); g.stroke(); }
        g.restore();
        A.frame({ xticks: [[1, "1"], [10, "10"], [20, "20"], [30, "30"], [40, "40"]], yticks: [[0, "0"], [50, "50"], [100, "100"]], xlabel: "number of passes m" });
        A.curve((v) => X / v, 1, 40, 200, { color: col.gold, width: 1.6, dash: [6, 6] });
        A.curve((v) => v, 1, 40, 50, { color: col.green, width: 1.6, dash: [6, 6] });
        K.line(pts, { color: col.blue, width: 3.5 });
        K.text("overhead x/m", A.X(38), A.Y(X / 38) - 16, { size: 16, color: col.gold, bold: true, align: "right" });
        K.text("weaving m", A.X(31), A.Y(31) - 16, { size: 16, color: col.green, bold: true, align: "right" });
        K.text("the valley path: x/m + m", A.X(14), A.Y(f(14)) - 130, { size: 17, color: col.blue, bold: true, align: "left" });
        // footprints behind Kito
        const m0 = touched ? m : 2;
        if (!touched) for (let v = 2.3; v < m - 0.3; v += 0.55) { const x = A.X(v), y = A.Y(f(v)); K.dot(x - 3, y - 2, 1.8, col.muted, 0.6); K.dot(x + 3, y - 4, 1.8, col.muted, 0.6); }
        // the marker stone at the bottom, and Grey waiting there
        const fx = A.X(10), fy = A.Y(f(10)), at = Math.abs(m - 10) < 1e-6;
        K.seg(fx, fy, fx, fy - 92, { color: col.ink, width: 2.4, sketch: false });
        K.line([[fx, fy - 92], [fx + 34, fy - 83], [fx, fy - 74]], { color: col.gold, width: 2, close: true, fill: col.gold, fillAlpha: at ? 0.95 : 0.5, sketch: false });
        if (at) K.text("√x", fx + 13, fy - 83, { size: 13, bold: true, align: "center", color: "#3a2c1c" });
        bird(K, A.X(17), A.Y(f(17)) - 2, 0.95, { flip: true, color: GREY });
        // Kito, hopping as it walks; the slope it feels underfoot
        const s = d(m), y = f(m), h = 5, hop = walking ? Math.abs(Math.sin(t * 7)) * 5 : 0;
        A.clip(() => K.seg(A.X(m - h), A.Y(y - s * h), A.X(m + h), A.Y(y + s * h), { color: col.gold, width: 2, sketch: false }));
        if (touched || !walking) { K.dot(A.X(m), A.Y(y), 10, col.red); K.ring(A.X(m), A.Y(y), 10, { color: K.surface, width: 2 }); }
        bird(K, A.X(m), A.Y(y) - 6 - hop, 0.9, { flip: m > 10 });
        K.text(`m = ${m.toFixed(1)}   ·   x/m + m = ${y.toFixed(1)}   ·   slope ${s.toFixed(2)}   (x = 100)`, 110, 584, { size: 17, color: col.muted });
        if (at) K.text("the bottom: m = √100 = 10, where the bound is 20 = 2√x", 110, 614, { size: 18, bold: true, color: col.green });
        return walking;
      },
    };
  });

  // ------------------------------------------------------------------ 36: Grey remembers the early, tangled count
  S("w-barrier", () => ({
    draw(K, t) {
      const { col } = K, g = K.g, x = 1e12, A = K.axes([70, 40, 400, 300], [1, 1e9], [1e5, 1e12], { xlog: true, ylog: true });
      A.frame({ xticks: [[1, "1"], [1e3, "10³"], [1e6, "10⁶"], [1e9, "10⁹"]], yticks: [[1e6, "10⁶"], [1e8, "10⁸"], [1e10, "10¹⁰"], [1e12, "10¹²"]], xlabel: "passes m   (x = 10¹²)" });
      const up = Math.pow(10, 9 * K.ease(K.ph(t, 0.3, 3.5)));
      A.clip(() => {
        K.seg(A.X(1), A.Y(1e6), A.X(1e9), A.Y(1e6), { color: col.green, width: 1.4, dash: [6, 6], sketch: false });
        K.seg(A.X(1), A.Y(1e8), A.X(1e9), A.Y(1e8), { color: col.red, width: 1.4, dash: [6, 6], sketch: false });
        A.curve((m) => x / m + m, 1, up, 300, { color: col.blue, width: 3 });
        A.curve((m) => x / m + m * m, 1, up, 300, { color: col.red, width: 3 });
      });
      K.text("√x", A.X(1e9) + 8, A.Y(1e6), { size: 17, bold: true, color: col.green });
      K.text("x^{2/3}", A.X(1e9) + 8, A.Y(1e8), { size: 17, bold: true, color: col.red });
      if (up >= 1e6) { K.dot(A.X(1e6), A.Y(2e6), 8, col.blue); K.text("best ≈ √x", A.X(1e6), A.Y(2e6) + 28, { size: 16, bold: true, color: col.blue, align: "center", halo: true }); }
      const mm = Math.cbrt(x / 2);
      if (up >= mm) { K.dot(A.X(mm), A.Y(x / mm + mm * mm), 8, col.red); K.text("stuck near x^{2/3}", A.X(mm) + 12, A.Y(x / mm + mm * mm) - 30, { size: 16, bold: true, color: col.red, align: "left", halo: true }); }
      K.text("blue: G ≤ x/m + m     red: G ≤ x/m + m²", 70, 432, { size: 15, color: col.muted });
      // the finished loom: a clean chain
      loomFrame(K, 620, 950, 70, 268);
      const nl = Math.min(6, Math.floor(K.ph(t, 0.4, 3) * 6) + 1);
      for (let i = 0; i < nl; i++) { const cx = 670 + i * 46; g.save(); g.strokeStyle = "#6e4a2a"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx, 70); g.lineTo(cx, 146); g.stroke(); g.restore(); K.ring(cx, 170, 24, { color: i % 2 ? GRASS[2] : BROWN[0], width: 5 }); }
      K.text("the finished loom", 785, 222, { size: 17, bold: true, align: "center", color: col.green, halo: true });
      K.text("each pass touches only the one before", 785, 244, { size: 14, align: "center", color: col.muted, halo: true });
      // Grey's memory: the early count, tangled — in a thought cloud
      const mem = K.ease(K.ph(t, 0.8, 2.2));
      g.save(); g.globalAlpha = mem;
      g.fillStyle = col.red; g.globalAlpha = 0.06 * mem; g.beginPath(); g.ellipse(785, 445, 215, 125, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = mem;
      g.strokeStyle = col.red; g.lineWidth = 2; g.setLineDash([7, 6]); g.beginPath(); g.ellipse(785, 445, 215, 125, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      [[592, 548, 9], [566, 572, 6]].forEach(([cx, cy, r]) => { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); });
      g.restore();
      if (mem > 0) {
        g.save(); g.globalAlpha = mem; loomFrame(K, 660, 910, 372, 500); g.restore();
        const nc = Math.min(6, Math.floor(K.ph(t, 1.0, 3.6) * 6) + 1), cx = (i) => 690 + i * 42, yt = 388, yb = 488;
        for (let i = 0; i < nc; i++) { K.seg(cx(i), yt, cx(i), yb, { color: BROWN[i % 4], width: 4, sketch: false, alpha: mem });
          g.save(); g.strokeStyle = col.red; g.globalAlpha = 0.4 * mem; g.lineWidth = 1.4;
          for (let j = 0; j < i; j++) { g.beginPath(); g.moveTo(cx(j), yt + 8); g.lineTo(cx(i), yb - 8); g.moveTo(cx(j), yb - 8); g.lineTo(cx(i), yt + 8); g.stroke();
            g.beginPath(); g.moveTo(cx(j), yt + 8); g.quadraticCurveTo((cx(i) + cx(j)) / 2, yt - 4 * (i - j), cx(i), yt + 8); g.stroke(); }
          g.restore(); }
        K.text("early count: each pass re-wove all before it", 785, 522, { size: 14, align: "center", color: col.red, alpha: mem, halo: true });
      }
      // Grey tells it; Kito listens
      K.seg(380, 600, 580, 596, { color: BIRD.twig, width: 7 });
      bird(K, 540, 596, 1.1, { color: GREY, sing: t });
      bird(K, 430, 598, 0.85);
      return t < 3.8;
    },
  }));

  // ------------------------------------------------------------------ 37: old Grey tells Stepanov's story, tying each knot over and over
  S("w-stepanov", ({ reduced }) => {
    const MS = [1, 2, 3, 4, 6], KT = 0.42, HOLD = 1.6;
    const dur = MS.map((m) => (12 / m) * KT + HOLD), total = dur.reduce((a, b) => a + b, 0);
    return {
      draw(K, t) {
        const { col } = K, g = K.g, x0 = 120, x1 = 880, y = 360, unit = (x1 - x0) / 12;
        let idx = 1, lt = 1e9;
        if (!reduced) { let u = Math.max(0, t - 0.3) % total; idx = 0; while (u > dur[idx]) { u -= dur[idx]; idx++; } lt = u; }
        const m = MS[idx], N = 12 / m, tied = reduced ? N : Math.min(N, lt / KT);
        // far away: the round aviary where Stepanov worked
        g.save(); g.globalAlpha = 0.45; g.strokeStyle = col.muted; g.lineWidth = 2;
        g.beginPath(); g.arc(800, 190, 80, Math.PI, 0); g.stroke(); g.beginPath(); g.moveTo(720, 190); g.lineTo(880, 190); g.stroke();
        for (let k = 1; k < 6; k++) { const a = Math.PI + (k * Math.PI) / 6; g.beginPath(); g.moveTo(800, 190); g.lineTo(800 + 80 * Math.cos(a), 190 + 80 * Math.sin(a)); g.stroke(); }
        g.beginPath(); g.ellipse(800, 160, 80 * 0.98, 22, 0, Math.PI, 0); g.stroke(); g.restore();
        K.serif("a round aviary, far from here", 800, 222, { size: 16, align: "center", color: col.muted });
        // two posts and the string
        [x0 - 30, x1 + 30].forEach((px) => { K.seg(px, y - 50, px, 540, { color: WOOD2, width: 12, sketch: false }); K.seg(px - 18, 540, px + 18, 540, { color: WOOD2, width: 7, sketch: false }); });
        g.save(); g.strokeStyle = "#b8864f"; g.lineWidth = 4; g.lineCap = "round"; g.beginPath();
        for (let k = 0; k <= 200; k++) { const xx = x0 - 30 + ((x1 - x0 + 60) * k) / 200, yy = y + Math.sin(k * 0.6) * 2.5; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); g.restore();
        for (let k = 0; k <= 12; k++) K.seg(x0 + k * unit, y + 30, x0 + k * unit, y + 38, { color: col.muted, width: 1.4, sketch: false });
        let gx = x0 + 0.5 * m * unit;
        for (let i = 0; i < N; i++) {
          const cx = x0 + (i + 0.5) * m * unit, done = Math.min(1, Math.max(0, tied - i));
          if (done <= 0) continue;
          const wraps = Math.max(1, Math.ceil(done * m - 1e-6));
          K.box(x0 + i * m * unit + 3, y + 46, m * unit - 6, 14, { fill: col.gold, fillAlpha: 0.35 * done, color: col.gold, sketch: false, r: 4, alpha: done });
          for (let w = 0; w < wraps; w++) K.ring(cx + (w - (m - 1) / 2) * 7, y, 13, { color: "#6e4a2a", width: 3 });
          K.dot(cx, y, 4, "#6e4a2a");
          if (done < 1 || i === Math.floor(tied - 1e-6)) gx = cx;
        }
        // old Grey ties the knots; Kito listens from the post
        const busy = !reduced && tied < N;
        bird(K, gx, y - 16 - (busy ? Math.abs(Math.sin(t * 6)) * 4 : 0), 1.05, { color: GREY });
        bird(K, x1 + 30, y - 52, 0.85, { flip: true });
        K.text(`each knot tied ${m} time${m > 1 ? "s" : ""}:  ${N} knot${N > 1 ? "s" : ""} × ${m} = 12 = the string's length`, 500, 92, { size: 20, bold: true, align: "center" });
        K.text("string length = the polynomial's degree;  a knot tied m times = a root of multiplicity m", 500, 590, { size: 14, align: "center", color: col.muted });
        K.text("Stepanov:  (points) × m ≤ degree        this proof:  G(x) × m ≤ x + m²", 500, 618, { size: 15, align: "center", bold: true, color: col.purple });
        return !reduced;
      },
    };
  });

  // ------------------------------------------------------------------ 38: the last two landmarks, the Far Ones' gate and the weather
  S("w-noise", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, ground = 548;
      K.wash(250, 420, 260, 170, col.purple, 0.06, 4); K.wash(780, 380, 240, 190, col.blue, 0.06, 8);
      K.seg(30, ground, 970, ground, { color: col.axis, width: 2, sketch: false });
      // E: the Far Ones' gate, and strands leaving it at right angles
      const gx = 250, gyTop = 300, R = 92;
      farOne(K, gx, ground - 40, 190, { t });
      g.save(); g.fillStyle = "#6b4f33"; g.fillRect(gx - R - 9, gyTop, 18, ground - gyTop); g.fillRect(gx + R - 9, gyTop, 18, ground - gyTop);
      g.strokeStyle = "#6b4f33"; g.lineWidth = 18; g.beginPath(); g.arc(gx, gyTop, R, Math.PI, 0); g.stroke(); g.restore();
      const crosses = [[120, 150, 0.3], [250, 120, -0.2], [380, 160, 0.55]];
      crosses.forEach(([cx, cy, a], i) => {
        const f = reduced ? 1 : K.ease(K.ph(t, 0.4 + i * 0.5, 1.2 + i * 0.5)); if (f <= 0) return;
        const L = 46 * f, u = [Math.cos(a), Math.sin(a)], v = [-Math.sin(a), Math.cos(a)];
        g.save(); g.lineCap = "round"; g.lineWidth = 4;
        g.strokeStyle = L_GOLD; g.beginPath(); g.moveTo(cx - u[0] * L, cy - u[1] * L); g.lineTo(cx + u[0] * L, cy + u[1] * L); g.stroke();
        g.strokeStyle = L_ROSE; g.beginPath(); g.moveTo(cx - v[0] * L, cy - v[1] * L); g.lineTo(cx + v[0] * L, cy + v[1] * L); g.stroke();
        g.strokeStyle = col.ink; g.lineWidth = 1.4; const q = 10; g.beginPath(); g.moveTo(cx + u[0] * q, cy + u[1] * q); g.lineTo(cx + u[0] * q + v[0] * q, cy + u[1] * q + v[1] * q); g.lineTo(cx + v[0] * q, cy + v[1] * q); g.stroke();
        g.restore();
      });
      bird(K, gx + R + 50, ground, 0.95, { flip: true });
      K.text("E · the Far Ones' gate", gx, ground + 34, { size: 17, bold: true, align: "center", color: col.purple });
      K.text("strands cross almost at right angles, so they never tangle", gx, ground + 58, { size: 14, align: "center", color: col.muted });
      // F: the weather, and the noise jar
      weather(K, 905, 120);
      for (let k = 0; k < 3; k++) { const y = 210 + k * 26, ph = reduced ? 0 : (t * 30 + k * 40) % 90; K.line([[640 + ph, y], [680 + ph, y - 4], [720 + ph, y]], { color: col.axis, width: 1.6, alpha: 0.5 }); }
      const jx = 760, top = 260, bot = ground - 6, W = 92, allowed = 292, actual = 500;
      g.save(); g.strokeStyle = col.axis; g.lineWidth = 2.5; g.beginPath(); g.roundRect(jx - W / 2, top, W, bot - top, 14); g.stroke();
      g.fillStyle = "#8b6a35"; g.fillRect(jx - W / 2 - 6, top - 14, W + 12, 14); g.restore();
      const wob = reduced ? 0 : Math.sin(t * 1.3) * 2;
      g.save(); g.beginPath(); g.roundRect(jx - W / 2 + 4, top + 4, W - 8, bot - top - 8, 11); g.clip();
      g.fillStyle = col.blue; g.globalAlpha = 0.5; g.beginPath(); g.moveTo(jx - W / 2, bot);
      for (let k = 0; k <= 20; k++) { const xx = jx - W / 2 + (W * k) / 20; g.lineTo(xx, actual + wob * Math.sin(k * 0.8 + t)); }
      g.lineTo(jx + W / 2, bot); g.closePath(); g.fill(); g.restore();
      K.seg(jx - W / 2 - 14, allowed, jx + W / 2 + 14, allowed, { color: col.red, width: 3, sketch: false });
      K.text("allowed", jx + W / 2 + 20, allowed, { size: 16, bold: true, color: col.red });
      K.text("the noise", jx + W / 2 + 20, actual + 4, { size: 16, bold: true, color: col.blue });
      K.arrow(jx + W / 2 + 40, actual - 22, jx + W / 2 + 40, allowed + 22, { color: col.green, width: 2 });
      K.text("room to spare", jx + W / 2 + 52, (actual + allowed) / 2, { size: 15, bold: true, color: col.green });
      bird(K, jx - W / 2 - 50, ground, 1.05, { color: GREY });
      K.text("F · the weather", jx, ground + 34, { size: 17, bold: true, align: "center", color: col.blue });
      K.text("the noise stays far below what's allowed (schematic)", jx, ground + 58, { size: 14, align: "center", color: col.muted });
      return !reduced;
    },
  }));

  // ================================================================== 2026-11-22 redraws: pages 11–15 (map, hum, ceiling, shaft, trap)
  {
    const ROCK = "#8f7a52", DARK = "#2b2620", PALE = "#e8dcc0", ECHO = "#ff8a7a";
    let sdR = 5; const rr = () => (sdR = (sdR * 16807) % 2147483647) / 2147483647;
    // a crack in rock, starting at (px, py) and running up toward topY; size 0..1
    function crack(K, px, py, topY, size, seed, burstOnly) {
      const g = K.g; let s = seed * 7919 + 13; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const len = Math.min(Math.max(14, py - topY), 22 + 34 * size), pts = [[px, py]];
      for (let i = 1; i <= 5; i++) pts.push([px + (r() - 0.5) * 12, py - (len * i) / 5]);
      const br = [];
      for (let b = 0; b < 2; b++) { const j = 1 + Math.floor(r() * 3), [bx, by] = pts[j], d = b ? 1 : -1, bl = 8 + 12 * size;
        br.push([[bx, by], [bx + d * bl * 0.6, by - bl * 0.4], [bx + d * bl, by - bl * 0.9]]); }
      if (!burstOnly) { g.save(); g.lineJoin = "round"; g.lineCap = "round";
      const path = (p) => { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
      g.strokeStyle = DARK; g.globalAlpha = 0.9; g.lineWidth = 3 + 3 * size; path(pts); g.lineWidth = 2 + 1.5 * size; br.forEach(path);
      g.strokeStyle = "#e6d3a8"; g.globalAlpha = 0.5; g.lineWidth = 1; path(pts.map(([x, y]) => [x + 1.5, y]));
      g.restore(); }
      // a little burst where it hit, and chips falling away
      g.save(); g.strokeStyle = K.col.red; g.lineWidth = 2; g.globalAlpha = 0.9;
      for (let k = 0; k < 6; k++) { const a = Math.PI + (k / 5) * Math.PI; g.beginPath(); g.moveTo(px + Math.cos(a) * 6, py + Math.sin(a) * 6); g.lineTo(px + Math.cos(a) * (12 + 6 * size), py + Math.sin(a) * (12 + 6 * size)); g.stroke(); }
      g.restore();
      if (burstOnly) return;
      g.save(); g.fillStyle = ROCK; g.strokeStyle = DARK; g.lineWidth = 1;
      for (let k = 0; k < 2; k++) { const cx = px + (r() - 0.5) * 26, cy = py + 10 + r() * 22, q = 3 + r() * 3;
        g.beginPath(); g.moveTo(cx, cy - q); g.lineTo(cx + q, cy + q * 0.6); g.lineTo(cx - q, cy + q * 0.8); g.closePath(); g.fill(); g.stroke(); }
      g.restore();
    }
    window.WEAVE.crack = crack;

    // ---------------------------------------------------------------- 11: the map; E and F far off, hazy, up a faint side trail
    S("w-map", () => {
      const wp = [[120, 478], [200, 405], [290, 382], [385, 452], [480, 492], [580, 468], [680, 388], [748, 330], [830, 262]], ST = 14, P = smooth(wp, ST), stops = [0, 2, 4, 6, 8].map((i) => i * ST);
      const side = smooth([[772, 256], [735, 196], [640, 168], [540, 160], [430, 150], [330, 146]], 10);
      return {
        draw(K, t) {
          const { col } = K, g = K.g, n = Math.round(K.ease(K.ph(t, 0.5, 5.5)) * (P.length - 1));
          K.wash(250, 360, 230, 150, GRASS[0], 0.12, 5); K.wash(700, 400, 240, 150, GRASS[1], 0.12, 9); K.wash(840, 170, 150, 110, col.gold, 0.1, 2);
          // far off: low hills on the horizon, with E and F small among them
          g.save(); { const hg = g.createLinearGradient(0, 120, 0, 182); hg.addColorStop(0, "rgba(140,130,110,0.22)"); hg.addColorStop(1, "rgba(140,130,110,0)"); g.fillStyle = hg; } g.beginPath(); g.moveTo(150, 182);
          for (let x = 150; x <= 700; x += 10) g.lineTo(x, 182 - Math.sin((Math.PI * (x - 150)) / 550) * (32 + 26 * Math.sin((x - 150) / 70) ** 2 + 12 * Math.sin((x - 150) / 31) ** 2));
          g.lineTo(700, 182); g.closePath(); g.fill(); g.restore();
          g.save(); g.translate(330, 146); g.scale(0.55, 0.55); weather(K, 0, 0); g.restore();
          g.save(); g.translate(500, 152); g.scale(0.55, 0.55); gate(K, 0, 0, t); g.restore();
          // haze over the far country
          { const m = /^#([0-9a-f]{6})$/i.exec(K.surface || ""), v = m ? parseInt(m[1], 16) : 0xf6efe0, rgb = `${v >> 16},${(v >> 8) & 255},${v & 255}`;
            g.save(); g.translate(420, 140); g.scale(1, 0.3); const hz = g.createRadialGradient(0, 0, 0, 0, 0, 300);
            hz.addColorStop(0, `rgba(${rgb},0.5)`); hz.addColorStop(0.7, `rgba(${rgb},0.42)`); hz.addColorStop(1, `rgba(${rgb},0)`);
            g.fillStyle = hz; g.fillRect(-300, -300, 600, 600); g.restore(); }
          K.text("F · the weather", 330, 168, { size: 15, bold: true, align: "center", color: col.muted });
          K.text("E · the Far Ones' gate", 500, 172, { size: 15, bold: true, align: "center", color: col.muted });
          K.text("far off the road, visited later", 420, 200, { size: 15, align: "center", color: col.muted });
          // the faint side trail toward them
          g.save(); g.globalAlpha = 0.45; K.line(side, { color: col.muted, width: 2, dash: [2, 8], sketch: false }); g.restore();
          // landmarks
          wire(K, 40, 200, 470, { color: col.gold, width: 4, up: 26, down: 12 });
          [70, 118, 164].forEach((bx, i) => bird(K, bx, 470, 0.7, { flip: i === 1 }));
          K.text("the goal:\nthe middle wire", 120, 520, { size: 19, bold: true, align: "center", color: col.gold });
          cave(K, 290, 382); K.text("A · the echo shaft", 290, 250, { size: 19, bold: true, align: "center" }); K.text("(the trap)", 290, 274, { size: 17, align: "center", color: col.muted });
          [440, 476, 512, 548].forEach((px, i) => pile(K, px, 490, 34, 8, 4 + i)); K.text("B · four twig piles", 495, 542, { size: 19, bold: true, align: "center" });
          miniScale(K, 680, 292); K.text("D · the balance", 680, 244, { size: 19, bold: true, align: "center" });
          loom(K, 830, 262); K.text("C · the loom, many passes", 830, 100, { size: 19, bold: true, align: "center" });
          const walked = P.slice(0, n + 1);
          if (walked.length > 1) K.line(walked, { color: col.ink, width: 3, dash: [3, 9], sketch: false });
          stops.forEach((s, i) => { if (i === 0) return; if (n >= s) { const [x, y] = P[s]; K.dot(x, y, 14, col.green); K.text(String(i), x, y + 1, { size: 17, bold: true, align: "center", color: K.surface }); } });
          const h = P[n], h2 = P[Math.max(0, n - 4)];
          bird(K, h[0], h[1] - 16, 0.7, { flip: h[0] < h2[0] });
          K.serif("walk it backwards: 1 → 2 → 3 → 4", 640, 600, { size: 24, color: col.green, align: "center" });
          return t < 6.2;
        },
      };
    });

    // ---------------------------------------------------------------- 12: claps versus hums; then the hum, far out, inside its band
    const LAM = (() => { const N = 40, a = new Array(N + 1).fill(0), pr = new Array(N + 1).fill(0);
      for (let p = 2; p <= N; p++) { let ok = true; for (let d = 2; d * d <= p; d++) if (p % d === 0) ok = false; if (ok) for (let q = p; q <= N; q *= p) { a[q] = Math.log(p); pr[q] = p; } } return { a, pr }; })();
    S("w-gz", ({ reduced }) => ({
      draw(K, t) {
        const { col } = K, g = K.g, XM = 30, pal = { 2: col.blue, 3: col.red, 5: col.green, 7: col.purple, 11: BIRD.twig, 13: col.gold };
        const pc = (p) => pal[p] || [col.muted, BIRD.twig, col.gold][p % 3];
        const f1 = reduced ? 1 : K.ease(K.ph(t, 0.3, 3.3)), xr = 1 + (XM - 1) * f1;
        const panel = (x0, x1, y0, y1, ymax, val, title, sub) => {
          const X = (x) => x0 + ((x - 1) / (XM - 1)) * (x1 - x0), Y = (v) => y1 - (v / ymax) * (y1 - y0);
          K.seg(x0, y1, x1, y1, { color: col.axis, width: 1.5, sketch: false });
          // stack each twig's part, oldest at the bottom
          let below = (x) => 0;
          for (let nn = 2; nn <= XM; nn++) { if (!LAM.a[nn] || nn > xr) continue; const prev = below, me = nn;
            const top = (x) => prev(x) + (x >= me ? val(me, x) : 0), xs = []; for (let i = 0; i <= 120; i++) xs.push(1 + ((xr - 1) * i) / 120);
            g.save(); g.fillStyle = pc(LAM.pr[nn]); g.globalAlpha = 0.75; g.beginPath();
            xs.forEach((x, i) => (i ? g.lineTo(X(x), Y(top(x))) : g.moveTo(X(x), Y(top(x))))); for (let i = xs.length - 1; i >= 0; i--) g.lineTo(X(xs[i]), Y(prev(xs[i]))); g.closePath(); g.fill(); g.restore();
            below = top; }
          const xs = []; for (let i = 0; i <= 300; i++) xs.push(1 + ((xr - 1) * i) / 300);
          K.line(xs.map((x) => [X(x), Y(below(x))]), { color: col.ink, width: 2, sketch: false });
          K.text(title, (x0 + x1) / 2, y0 - 30, { size: 19, bold: true, align: "center" });
          K.text(sub, (x0 + x1) / 2, y0 - 8, { size: 15, align: "center", color: col.muted });
          K.text("nights →", x1, y1 + 16, { size: 13, align: "right", color: col.muted });
          return { X, Y };
        };
        // left: claps. each twig adds its whole size the moment it arrives
        const L = panel(70, 440, 92, 250, 32, (n) => LAM.a[n], "the raw chorus: claps", "each twig claps once, the moment it arrives");
        // right: hums. each twig starts at nothing and swells steadily
        panel(560, 930, 92, 250, 70, (n, x) => LAM.a[n] * (x / n - 1), "the smoothed chorus G: hums", "each twig starts at nothing and swells");
        if (f1 > 0.5) { K.text("it jolts", 250, 278, { size: 17, bold: true, align: "center", color: col.red });
          K.text("nothing jumps", 745, 278, { size: 17, bold: true, align: "center", color: col.green }); }
        // clap marks at each arrival on the left
        g.save(); g.strokeStyle = col.red; g.lineWidth = 1.5; g.globalAlpha = 0.8;
        let acc = 0; for (let nn = 2; nn <= XM && nn <= xr; nn++) { if (!LAM.a[nn]) continue; acc += LAM.a[nn]; const px = L.X(nn), py = L.Y(acc);
          [-0.9, -0.5, -0.1].forEach((a) => { g.beginPath(); g.moveTo(px + Math.cos(a * Math.PI) * 4, py + Math.sin(a * Math.PI) * 4 - 4); g.lineTo(px + Math.cos(a * Math.PI) * 9, py + Math.sin(a * Math.PI) * 9 - 4); g.stroke(); }); }
        g.restore();
        // below: the hum, far out
        const D = gzData(), BAND = 0.0462, A = K.axes([230, 340, 710, 180], [50, 200000], [-0.1, 0.1], { xlog: true }), xa = A.X(50), xb = A.X(200000);
        g.save(); g.fillStyle = col.green; g.globalAlpha = 0.13; g.fillRect(xa, A.Y(BAND), xb - xa, A.Y(-BAND) - A.Y(BAND)); g.restore();
        [BAND, -BAND].forEach((v) => wire(K, xa, xb, A.Y(v), { color: col.gold, width: 3, up: 12, down: 12 }));
        const f = reduced ? 1 : K.ease(K.ph(t, 3.6, 9.2)), n = Math.max(2, Math.floor(D.xs.length * f));
        if (f > 0) K.line(D.xs.slice(0, n).map((x, i) => [A.X(x), A.Y(D.ys[i])]), { color: col.blue, width: 2.2 });
        perch(K, 120, 470); bird(K, 120, 468, 1.15, { color: GREY });
        const hx = clamp(A.X(D.xs[n - 1]), xa + 20, xb - 6);
        bird(K, hx, A.Y(BAND) - 1, 0.85, { sing: f > 0 && f < 1 ? t * 0.6 : 0 });
        K.text("Kito listens to the hum, far out (G, shrunk by √x)", xa, 318, { size: 17, bold: true, color: col.blue });
        K.text("the thin band: ±0.0462", xb, 318, { size: 15, bold: true, align: "right", color: col.green });
        [100, 1000, 10000, 100000].forEach((v) => K.text(v.toLocaleString("en-US"), A.X(v), 542, { size: 14, align: "center", color: col.muted }));
        K.text("how far out: x (log scale)", xb, 564, { size: 14, align: "right", color: col.muted });
        if (f >= 1) K.text("out to 200,000, and still inside the band", 585, 604, { size: 20, bold: true, align: "center", color: col.green });
        return !reduced && t < 9.4;
      },
    }));

    // ---------------------------------------------------------------- 13: a ceiling on one side only; a bird above the middle wire would crack it
    let PSIA = null;
    const psiA = () => {
      if (PSIA) return PSIA;
      const N = 100000, lam = new Float64Array(N + 1), comp = new Uint8Array(N + 1);
      for (let p = 2; p <= N; p++) if (!comp[p]) { for (let q = p * p; q <= N; q += p) comp[q] = 1; for (let pk = p; pk <= N; pk *= p) lam[pk] = Math.log(p); }
      const xs = [], lo = [], hi = []; let psi = 0;
      for (let n = 1; n <= N; n++) { psi += lam[n]; const e = psi - n; if (n % 100 === 1) { xs.push(n); lo.push(e); hi.push(e); } else { lo[lo.length - 1] = Math.min(lo[lo.length - 1], e); hi[hi.length - 1] = Math.max(hi[hi.length - 1], e); } }
      return (PSIA = { xs, lo, hi });
    };
    S("w-ceiling", ({ reduced }) => ({
      draw(K, t) {
        const { col } = K, g = K.g, W = psiA(), A = K.axes([200, 100, 740, 430], [0, 100000], [-700, 900]), top = 60;
        const ceil = (x) => 1.4 * Math.sqrt(x), c = reduced ? 1 : K.ease(K.ph(t, 0.4, 2.2)), xr = 100000 * c + 1;
        g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(A.X(0), top);
        for (let k = 0; k <= 120; k++) { const x = (k / 120) * xr; g.lineTo(A.X(x), A.Y(ceil(x))); }
        for (let k = 40; k >= 0; k--) { const px = A.X(0) + ((A.X(xr) - A.X(0)) * k) / 40; g.lineTo(px, top + 6 * Math.sin(k * 1.7) + 4 * Math.sin(k * 0.6)); } g.closePath(); g.fill(); g.restore();
        g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(150, top); g.lineTo(A.X(0), top); g.lineTo(A.X(0), A.Y(0)); g.lineTo(150, A.Y(0) + 30); g.closePath(); g.fill(); g.restore();
        // a few old seams in the rock, for texture
        g.save(); g.strokeStyle = DARK; g.globalAlpha = 0.18; g.lineWidth = 1.2; sdR = 5;
        for (let k = 0; k < 14; k++) { const x = rr() * 100000 * c, y0 = A.Y(ceil(x)) - 8 - rr() * 30; if (y0 < top + 14) continue; const px = A.X(x);
          g.beginPath(); g.moveTo(px - 10, y0); g.lineTo(px + 6, y0 - 3); g.lineTo(px + 16, y0 + 1); g.stroke(); }
        g.restore();
        K.seg(A.X(0), A.Y(0), A.X(100000), A.Y(0), { color: col.axis, width: 1, dash: [3, 6], sketch: false });
        g.save(); g.strokeStyle = col.blue; g.lineWidth = 2;
        for (let i = 0; i < W.xs.length; i++) { g.beginPath(); g.moveTo(A.X(W.xs[i]), A.Y(W.lo[i])); g.lineTo(A.X(W.xs[i]), A.Y(W.hi[i])); g.stroke(); }
        g.restore();
        A.curve(ceil, 1, xr, 200, { color: col.gold, width: 3.5, sketch: false });
        if (c >= 1) K.text("a rock ceiling, about √x high, on one side only", A.X(0) + 14, top + 30, { size: 16, bold: true, color: col.ink });
        // a bird above the middle wire: its voice swings past the ceiling and cracks the rock
        const r = reduced ? 1 : K.ease(K.ph(t, 2.6, 5.6)), red = (x) => 0.75 * Math.pow(x, 0.58) * Math.cos(14.13 * Math.log(x)), xe = 1 + 99999 * r;
        if (r > 0) {
          const peaks = []; for (let i = 1; i < 2000; i++) { const x0 = 1 + 50 * (i - 1), x1 = 1 + 50 * i, x2 = 1 + 50 * (i + 1); if (x1 > xe) break;
            const y1 = red(x1); if (y1 > ceil(x1) && y1 >= red(x0) && y1 >= red(x2)) peaks.push([x1, y1]); }
          let lastX = -99; peaks.forEach(([x, y], j) => { if (x < 8000 || A.X(x) - lastX < 30) return; lastX = A.X(x); crack(K, A.X(x), A.Y(y), top + 6, clamp((y - ceil(x)) / ceil(x), 0, 1), j + 3); });
          A.clip(() => A.curve(red, 1, xe, 1400, { color: col.red, width: 2.4, sketch: false, alpha: 0.9 }));
        }
        K.seg(20, 500, 190, 500, { color: col.axis, width: 2, sketch: false });
        bird(K, 70, 500, 1.25, { color: GREY }); bird(K, 140, 500, 1.0);
        K.text("?", 152, 440, { size: 26, bold: true, align: "center", color: col.gold });
        [[0, "0"], [50000, "50k"], [100000, "100k"]].forEach(([v, l]) => K.text(l, A.X(v), A.Y(-700) + 20, { size: 14, align: "center", color: col.muted }));
        K.text("x →", A.X(100000) + 8, A.Y(0), { size: 14, color: col.muted });
        K.text("blue: the real chorus   red: with a bird above the middle wire", A.X(50000), A.Y(-700) + 46, { size: 15, align: "center", bold: true, color: col.muted });
        if (r >= 1) K.text("a bird above the middle wire would crack the ceiling", 570, 600, { size: 20, bold: true, align: "center", color: col.red });
        return !reduced && t < 5.8;
      },
    }));

    // ---------------------------------------------------------------- 14–15: the echo shaft. Kito calls down from the top; the wires cross it.
    const S0 = 1.25, SY = (s) => 100 + (S0 - s) * 384, SX0 = 150, SX1 = 390, BX = 305;
    function shaft(K, beta, t, still) {
      const { col } = K, g = K.g;
      // rock on both sides, the dark shaft between
      g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.fillRect(30, 100, SX0 - 30, 520); g.fillRect(SX1, 100, 80, 520); g.restore();
      const dk = g.createLinearGradient(0, 100, 0, 620); dk.addColorStop(0, "rgba(43,38,32,0.82)"); dk.addColorStop(1, "rgba(43,38,32,0.98)");
      g.save(); g.fillStyle = dk; g.fillRect(SX0, 100, SX1 - SX0, 520); g.restore();
      g.save(); g.strokeStyle = col.ink; g.globalAlpha = 0.5; g.lineWidth = 2; g.beginPath(); g.moveTo(SX0, 100); g.lineTo(SX0, 620); g.moveTo(SX1, 100); g.lineTo(SX1, 620); g.stroke(); g.restore();
      K.seg(20, 100, SX0, 100, { color: GRASS[2], width: 4, sketch: false }); K.seg(SX1, 100, 480, 100, { color: GRASS[2], width: 4, sketch: false });
      // the wires, straight across
      [[1, "1"], [0.5, "½"], [0, "0"]].forEach(([s, l]) => { const y = SY(s), mid = s === 0.5;
        K.seg(SX0 - 8, y, SX1 + 8, y, { color: mid ? col.gold : "#b7ab95", width: mid ? 3.5 : 2, sketch: false });
        K.text(l, SX0 - 16, y, { size: 18, bold: true, align: "right", color: mid ? col.gold : PALE, halo: true }); });
      K.text("middle wire", SX0 - 16, SY(0.5) + 22, { size: 13, bold: true, align: "right", color: col.gold, halo: true });
      // Kito on a twig across the top, calling down; Grey on the rim
      K.seg(SX0 - 10, 100, SX1 + 10, 98, { color: BIRD.twig, width: 6 });
      bird(K, 64, 100, 1.1, { color: GREY });
      bird(K, 235, 98, 1.15, { sing: still ? 0.5 : t });
      // the bird in the shaft
      const by = SY(beta);
      if (Math.abs(beta - 0.5) > 0.01 && Math.abs(beta - 1) > 0.01) perch(K, BX, by);
      bird(K, BX, by, 0.95, { flip: true, color: beta > 0.51 ? "#e98b5d" : undefined });
      // calls going down (gold), echoes coming up (red)
      g.save(); g.lineWidth = 2;
      for (let k = 0; k < 3; k++) { const p = still ? (k + 1) / 4 : ((t * 0.7 + k / 3) % 1), dy = by - 100;
        g.strokeStyle = col.gold; g.globalAlpha = 0.7 * (1 - p); g.beginPath(); g.arc(250, 110, 14 + p * (dy - 30), Math.PI * 0.3, Math.PI * 0.7); g.stroke();
        g.strokeStyle = ECHO; g.globalAlpha = 0.8 * (1 - p); g.beginPath(); g.arc(BX, by - 26, 10 + p * (dy - 40), -Math.PI * 0.72, -Math.PI * 0.4); g.stroke(); }
      g.restore();
      // how near: Kito to the bird
      const ax = 180; K.seg(ax, 122, ax, by - 6, { color: ECHO, width: 2, sketch: false });
      K.line([[ax - 6, by - 14], [ax, by - 4], [ax + 6, by - 14]], { color: ECHO, width: 2, sketch: false });
      K.text(`how near: ${(S0 - beta).toFixed(2)}`, ax + 8, Math.max(140, (122 + by) / 2), { size: 15, bold: true, color: ECHO, halo: false });
    }
    const echoes = (beta, kmax) => { const out = []; for (let k = 1; k <= kmax; k++) out.push(7 * Math.pow(1 / (S0 - beta), k)); return out; };
    const pace = (k) => 7 * Math.pow(1 / (S0 - 0.5), k);
    const EX = (k) => 520 + k * 36, FLOOR = 540, CAP = 390;
    const shaftDrag = (st) => ({
      hit: (x, y) => Math.abs(x - BX) < 60 && y > SY(1.02) && y < SY(0.4),
      press(x, y) { if (Math.abs(x - BX) >= 60 || y <= SY(1.02) || y >= SY(0.4)) return false; st.touched = true; st.beta = clamp(S0 - (y - 100) / 384, 0.5, 0.97); if (st.beta < 0.53) st.beta = 0.5; return true; },
      drag(x, y) { st.beta = clamp(S0 - (y - 100) / 384, 0.5, 0.97); if (st.beta < 0.53) st.beta = 0.5; },
    });

    S("w-echo", ({ reduced }) => {
      const st = { beta: 0.7, touched: false };
      return {
        ...shaftDrag(st),
        draw(K, t) {
          const { col } = K, g = K.g;
          if (!st.touched && !reduced) { const c = (t % 10) / 10, u = c < 0.3 ? 0 : c < 0.45 ? K.ease((c - 0.3) / 0.15) : c < 0.8 ? 1 : 1 - K.ease((c - 0.8) / 0.15); st.beta = 0.5 + 0.2 * clamp(u, 0, 1); }
          const beta = st.beta;
          shaft(K, beta, t, reduced);
          K.text("the echo shaft", 270, 40, { size: 20, bold: true, align: "center" });
          // echo after echo
          K.seg(EX(0) + 10, FLOOR, EX(11) + 20, FLOOR, { color: col.axis, width: 2, sketch: false });
          echoes(beta, 11).forEach((v, i) => { const k = i + 1, h = Math.min(v, CAP); K.box(EX(k) - 12, FLOOR - h, 24, h, { color: null, fill: beta > 0.51 ? ECHO : col.blue, fillAlpha: 0.85, r: 3 });
            if (v > CAP) K.text("↑", EX(k), FLOOR - CAP - 14, { size: 16, bold: true, align: "center", color: col.red }); });
          K.line(Array.from({ length: 11 }, (_, i) => [EX(i + 1), FLOOR - pace(i + 1)]), { color: col.gold, width: 2.5, dash: [6, 5], sketch: false });
          K.text("gold: the pace of a bird on the middle wire", 740, 112, { size: 15, bold: true, align: "center", color: col.gold });
          K.text("echo after echo →", EX(11) + 20, FLOOR + 22, { size: 15, align: "right", color: col.muted });
          const up = beta > 0.51;
          K.text(up ? "above the middle wire = nearer to Kito" : "on the middle wire", 740, 584, { size: 19, bold: true, align: "center", color: up ? col.red : col.ink });
          K.text(up ? "so its echoes outgrow the middle wire's pace" : "its echoes keep the middle wire's pace", 740, 610, { size: 17, align: "center", color: up ? col.red : col.muted });
          return !reduced;
        },
      };
    });

    S("w-trap", ({ reduced }) => {
      const st = { beta: 0.75, touched: false };
      return {
        ...shaftDrag(st),
        draw(K, t) {
          const { col } = K, g = K.g, T = st.touched || reduced ? 99 : t, beta = st.beta;
          shaft(K, beta, t, reduced);
          // the volume limit, as a rock ceiling over the echoes, a little above the middle wire's pace
          const lim = (k) => 2 * pace(k), LY = (k) => FLOOR - Math.min(lim(k), CAP + 30);
          g.save(); g.fillStyle = ROCK; g.globalAlpha = 0.55; g.beginPath(); g.moveTo(EX(0.4), 110);
          for (let i = 0; i <= 60; i++) { const k = 0.4 + (i / 60) * 11.2; g.lineTo(EX(k), LY(k)); } g.lineTo(EX(11.6), 110); g.closePath(); g.fill(); g.restore();
          A_line(K, (k) => [EX(k), LY(k)], col.green);
          K.text("the volume limit", EX(1), 128, { size: 16, bold: true, color: col.green, halo: true });
          K.seg(EX(0) + 10, FLOOR, EX(11.6), FLOOR, { color: col.axis, width: 2, sketch: false });
          const kmax = Math.floor(clamp(T / 0.45, 1, 11)), ev = echoes(beta, kmax); let broke = false, nCr = 0;
          ev.forEach((v, i) => { const k = i + 1, over = v > lim(k), h = Math.min(v, CAP); broke = broke || over;
            K.box(EX(k) - 12, FLOOR - h, 24, h, { color: null, fill: over ? col.red : col.blue, fillAlpha: 0.88, r: 3 });
            if (over) { crack(K, EX(k), LY(k), 112, clamp((v - lim(k)) / lim(k), 0, 1), k, nCr > 0 && nCr % 3 !== 0); nCr++; }
            if (v > CAP) K.text("↑", EX(k), FLOOR - CAP - 14, { size: 16, bold: true, align: "center", color: col.red }); });
          K.text("echo after echo →", EX(11.6), FLOOR + 22, { size: 15, align: "right", color: col.muted });
          K.text("drag the bird", BX, SY(0.5) + 44, { size: 14, align: "center", color: PALE });
          if (kmax >= 11 || st.touched || reduced) {
            K.text(broke ? "the echoes crack the limit: impossible," : "the echoes stay under the limit:", 740, 584, { size: 19, bold: true, align: "center", color: broke ? col.red : col.green });
            K.text(broke ? "so no bird sits up there" : "no contradiction", 740, 610, { size: 19, bold: true, align: "center", color: broke ? col.red : col.green }); }
          return !reduced;
        },
      };
    });
    function A_line(K, fn, color) { const pts = []; for (let i = 0; i <= 60; i++) pts.push(fn(0.4 + (i / 60) * 11.2)); K.line(pts, { color, width: 4, sketch: false }); }
  }
  // ================================================================== "w-threads": Kito pulls the "fewer passes" thread; a fence caps the passes
  {
    const NICE = [[1 / 4, "1/4"], [1 / 3, "1/3"], [1 / 2, "1/2"], [2 / 3, "2/3"], [3 / 4, "3/4"], [1, "1"]];
    const frac = (v) => { const n = NICE.find(([a]) => Math.abs(a - v) < 0.004); return n ? n[1] : v.toFixed(2); };
    // x raised to a small exponent, drawn as "x" plus a raised exponent
    function xpow(K, e, x, y, o = {}) {
      const s = o.size || 16, ex = frac(e), g = K.g;
      if (ex === "1") return K.text("x", x, y, { ...o, size: s });
      if (ex === "1/2") return K.text("√x", x, y, { ...o, size: s });
      g.save(); g.font = `${o.bold ? "bold " : ""}${s}px system-ui, sans-serif`; const w1 = g.measureText("x").width; g.font = `${o.bold ? "bold " : ""}${Math.round(s * 0.68)}px system-ui, sans-serif`; const w2 = g.measureText(ex).width; g.restore();
      const x0 = o.align === "right" ? x - w1 - w2 - 1 : o.align === "center" ? x - (w1 + w2 + 1) / 2 : x;
      K.text("x", x0, y, { ...o, size: s, align: "left" }); K.text(ex, x0 + w1 + 1, y - s * 0.42, { ...o, size: Math.round(s * 0.68), align: "left" });
    }
    function card(K, x, y, w, color, title, lines) {
      K.box(x, y, w, 38 + lines.length * 20, { fill: color, fillAlpha: 0.1, color, sketch: false, r: 8, width: 1.6 });
      K.text(title, x + w / 2, y + 18, { size: 16, bold: true, align: "center", color });
      lines.forEach((l, i) => K.text(l, x + w / 2, y + 42 + i * 20, { size: 14, align: "center", color: i === lines.length - 1 ? K.col.muted : K.col.ink }));
    }
    function thread(K, x0, y0, x1, y1, color, t, amp = 5) {
      const g = K.g; g.save(); g.strokeStyle = color; g.lineWidth = 2.6; g.lineCap = "round"; g.beginPath();
      for (let k = 0; k <= 40; k++) { const f = k / 40, x = x0 + (x1 - x0) * f + amp * Math.sin(f * 9 + t * 0.8) * Math.sin(Math.PI * f), y = y0 + (y1 - y0) * f; k ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.restore();
    }
    S("w-threads", ({ reduced }) => {
      let fence = 0.25, touched = false;
      const PX0 = 270, PW = 460, PY0 = 150, PH = 270, X = (th) => PX0 + th * PW, Y = (e) => PY0 + (1 - e) * 2 * PH, ex = (th) => Math.max(1 - th, th);
      const near = (px, py) => Math.abs(px - X(fence)) < 30 && py > PY0 - 20 && py < PY0 + PH + 30;
      const set = (px) => { let v = clamp((px - PX0) / PW, 0.06, 1); const n = NICE.find(([a]) => Math.abs(a - v) < 0.018); if (n) v = n[0]; fence = v; };
      return {
        hit: near, press(px, py) { if (!near(px, py)) return false; touched = true; set(px); return true; }, drag(px) { set(px); },
        draw(K, t) {
          const { col } = K, g = K.g, PURPLE = col.purple, GREEN = col.green, BLUE = col.blue;
          // the branch and the two threads still loose
          g.save(); g.strokeStyle = "#8b5e34"; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); g.moveTo(40, 58); g.quadraticCurveTo(500, 46, 960, 60); g.stroke(); g.restore();
          thread(K, 125, 58, 125, 268, PURPLE, t); thread(K, 875, 58, 875, 268, BLUE, t + 2);
          card(K, 30, 268, 190, PURPLE, "the round aviary", ["does the loom, run there,", "become Stepanov's knot?", "still loose"]);
          card(K, 780, 268, 190, BLUE, "the positivity", ["why do knots tied over", "and over amplify it so?", "still loose"]);
          // the pulled thread: a valley of exponents. passes m = x^θ; chorus held to x^max(1−θ, θ)
          const walk = reduced || touched ? 1 : K.ease(K.ph(t, 0.8, 4.2)), stop = Math.min(fence, 0.5), th = stop * walk;
          const pts = []; for (let i = 0; i <= 100; i++) { const v = i / 100; pts.push([X(v), Y(ex(v))]); }
          g.save(); g.beginPath(); g.moveTo(X(0), Y(0.5) + 18); pts.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(X(1), Y(0.5) + 18); g.closePath(); g.fillStyle = "#8b6b3e"; g.globalAlpha = 0.35; g.fill(); g.restore();
          K.line(pts, { color: GREEN, width: 3.2 });
          // axes labels
          [[1, 0], [0.75, 0.25], [0.5, 0.5]].forEach(([e]) => { K.seg(PX0 - 8, Y(e), PX0 - 2, Y(e), { color: col.axis, width: 1.5, sketch: false }); xpow(K, e, PX0 - 12, Y(e), { size: 15, align: "right", color: col.muted }); });
          K.text("chorus held to", PX0 - 12, PY0 - 34, { size: 13, align: "right", color: col.muted });
          [0, 0.25, 0.5, 0.75, 1].forEach((v) => { const lx = X(v), ly = Y(0.5) + 36; if (v === 0) K.text("1", lx, ly, { size: 15, align: "center", color: col.muted }); else xpow(K, v, lx, ly, { size: 15, align: "center", color: col.muted }); });
          K.text("passes woven", X(1) + 4, Y(0.5) + 56, { size: 13, align: "right", color: col.muted });
          // Grey waits at the bottom, where the full proof ends up
          bird(K, X(0.5) + 26, Y(0.5) - 2, 0.85, { flip: true, color: GREY });
          // the fence: a post with rails, draggable
          const fx = X(fence), fy = Y(ex(fence));
          g.save(); g.strokeStyle = "#6e4a2a"; g.lineWidth = 5; g.lineCap = "round"; g.beginPath(); g.moveTo(fx, fy + 4); g.lineTo(fx, fy - 62); g.stroke();
          g.lineWidth = 3; [-46, -26].forEach((dy) => { g.beginPath(); g.moveTo(fx - 16, fy + dy); g.lineTo(fx + 16, fy + dy); g.stroke(); }); g.restore();
          K.text("fence", fx, fy - 74, { size: 13, bold: true, align: "center", color: "#6e4a2a", halo: true });
          // Kito, walking down until the fence (or the bottom), pulling the green thread from the branch
          const back = fence < 0.5 ? 0.045 * walk : 0, kx = X(th - back), ky = Y(ex(th - back)), hop = !reduced && !touched && walk < 1 ? Math.abs(Math.sin(t * 6)) * 4 : 0;
          thread(K, 500, 54, kx + 12, ky - 34 - hop, GREEN, t, 7);
          bird(K, kx, ky - hop, 0.9, { flip: false });
          // the gauge: how much of the strip is cleared of zeros
          const sig = ex(stop), gy = 530, G0 = 270, GW = 460, GX = (s) => G0 + (s - 0.5) * 2 * GW, done = walk > 0.999;
          K.text("Re s", G0 - 12, gy + 9, { size: 13, align: "right", color: col.muted });
          K.box(G0, gy, GW, 18, { fill: col.muted, fillAlpha: 0.12, color: col.axis, sketch: false, r: 4 });
          if (done) K.box(GX(sig), gy, G0 + GW - GX(sig), 18, { fill: GREEN, fillAlpha: 0.45, color: GREEN, sketch: false, r: 4 });
          K.seg(G0, gy - 6, G0, gy + 24, { color: col.gold, width: 3, sketch: false });
          K.text("½: the middle wire", G0, gy + 40, { size: 13, align: "center", color: col.gold, bold: true });
          K.text("1", G0 + GW, gy + 40, { size: 13, align: "center", color: col.muted });
          if (done && sig > 0.501) { bird(K, (G0 + GX(sig)) / 2, gy + 2, 0.5, { ghost: true }); }
          if (done) {
            K.text(sig > 0.501 ? `cleared: no zeros with Re s > ${frac(sig)}` : "all cleared down to the middle wire: the Riemann Hypothesis", sig > 0.501 ? GX(sig) + 6 : G0 + GW / 2, gy - 12, { size: 14, bold: true, align: sig > 0.501 ? "left" : "center", color: GREEN });
            const passes = Math.round(Math.pow(10, 8 * stop));
            const line = Math.abs(fence - 0.5) < 1e-9 ? "the full proof: √x passes, 10,000 at x = 10⁸" : fence > 0.5 ? "past √x passes the weaving costs more: Kito stops at the bottom" :
              `at x = 10⁸: ${passes.toLocaleString("en-US")} passes, where the full proof weaves 10,000`;
            K.text(line, 500, 600, { size: 15, align: "center", color: col.muted });
            K.text("no zero-free strip this wide has ever been proved", 500, 626, { size: 15, align: "center", color: col.ink, bold: true, alpha: sig > 0.501 && sig < 0.999 ? 1 : 0 });
          }
          return !reduced && !touched && t < 4.4;
        },
      };
    });
  }
  // ================================================================== the nest thread: the strange finished nest, and Kito's practice nest built stage by stage
  {
    const { nest } = window.WEAVE;
    const NG = ["#9aa64e", "#b9c26c", "#7d8a3a", "#cfd58e", "#6a7630", "#a9a35a"];
    const V = 0.64, HW = (w, v) => v < V ? (w / 2) * Math.pow(1 - Math.pow((V - v) / V, 1.35), 0.75) : (w / 2) * Math.sqrt(Math.max(0, 1 - Math.pow((v - V) / (1 - V), 2)));
    const rng = (seed) => { let s = seed % 2147483646 + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
    function blade(g, x0, y0, x1, y1, c, w, a) { g.strokeStyle = c; g.lineWidth = w; g.globalAlpha = a; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + (y1 - y0) * 0.15, (y0 + y1) / 2, x1, y1); g.stroke(); }
    // a ragged, abandoned attempt
    function tornNest(K, cx, top, w, h, seed) {
      const g = K.g, r = rng(seed); g.save(); g.lineCap = "round";
      for (let k = 0; k < 70; k++) { const v = 0.05 + r() * 0.6, side = r() < 0.5 ? -1 : 1, x = cx + side * HW(w, v) * (0.6 + r() * 0.4), y = top + v * h;
        blade(g, x, y, x + (r() - 0.5) * 22, y + 6 + r() * 26, ["#a89a6a", "#b8a878", "#8f8456"][k % 3], 1.2, 0.75); }
      for (let k = 0; k < 10; k++) { const x = cx + (r() - 0.5) * w * 0.7, y = top + h * (0.35 + r() * 0.3); blade(g, x, y, x + (r() - 0.5) * 10, y + 30 + r() * 50, "#a89a6a", 1, 0.6); }
      g.globalAlpha = 0.7; g.strokeStyle = "#8f8456"; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, top + h * 0.38, w * 0.3, h * 0.3, 0, Math.PI * (0.9 + r() * 0.3), Math.PI * (2.1 + r() * 0.2)); g.stroke();
      g.restore();
    }
    // Kito's practice nest, built in stages: 1 knot to the branch, 2 the ring, 3 the roof, 4 one thin wall, 5 thick walls, 6 the doorway
    const PART = ["", "the knot to the branch", "the standing ring", "the roof", "one thin wall", "the walls, √x layers deep", "the doorway, weatherproofed"];
    function practiceNest(K, cx, top, s, stage, o = {}) {
      const g = K.g, w = 84 * s, h = 130 * s, r = rng(Math.round(cx * 3 + top)), glow = o.glow ?? 0, GOLD = "#e0b23a";
      const hi = (k) => k === stage && glow > 0;
      // the branch
      g.save(); g.strokeStyle = "#8b5e34"; g.lineWidth = 6 * s; g.lineCap = "round"; g.beginPath(); g.moveTo(cx - 62 * s, top - 4 * s); g.lineTo(cx + 62 * s, top + 2 * s); g.stroke(); g.restore();
      if (stage >= 5) { nest(K, cx, top, w, h); }
      else {
        g.save(); g.lineCap = "round";
        if (stage >= 4) { const n = 90; for (let k = 0; k < n; k++) { const v = 0.08 + (k / n) * 0.88, hw = HW(w, v), y = top + v * h;
          blade(g, cx - hw, y, cx + hw, y + (r() - 0.5) * 8, hi(4) ? GOLD : NG[k % 6], 1.1, hi(4) ? 0.55 + 0.4 * glow : 0.6); } }
        if (stage >= 3) { for (let k = 0; k < 60; k++) { const v = 0.04 + (k / 60) * 0.42, hw = HW(w, v), y = top + v * h;
          blade(g, cx - hw * 0.9, y, cx + hw * 0.9, y + 2, hi(3) ? GOLD : NG[k % 6], 1.6, hi(3) ? 0.6 + 0.4 * glow : 0.85); } }
        if (stage >= 2) { g.globalAlpha = 1; g.strokeStyle = hi(2) ? GOLD : "#7d8a3a"; g.lineWidth = 5 * s; g.beginPath(); g.ellipse(cx, top + 0.42 * h, 0.33 * w, 0.3 * h, 0, 0, Math.PI * 2); g.stroke();
          for (let k = 0; k < 30; k++) { const a = (k / 30) * Math.PI * 2; blade(g, cx + 0.33 * w * Math.cos(a), top + 0.42 * h + 0.3 * h * Math.sin(a), cx + 0.36 * w * Math.cos(a + 0.3), top + 0.42 * h + 0.33 * h * Math.sin(a + 0.3), NG[k % 6], 1.4, 0.9); } }
        if (stage >= 1) { for (let k = 0; k < 12; k++) { const x = cx + (k - 5.5) * 3 * s; blade(g, x, top - 8 * s, x + 2, top + (stage >= 2 ? 0.12 * h : 0.3 * h + (k % 3) * 8), hi(1) ? GOLD : NG[k % 6], 1.8, 1); }
          g.globalAlpha = 1; g.fillStyle = hi(1) ? GOLD : "#6a7630"; g.beginPath(); g.ellipse(cx, top, 9 * s, 6 * s, 0, 0, Math.PI * 2); g.fill(); }
        g.restore();
      }
      if (stage >= 6) { // the entrance tube, hanging from the doorway
        const dx = cx + 0.07 * w, dy = top + 0.7 * h; g.save(); g.lineCap = "round";
        for (let k = 0; k < 22; k++) { const f = k / 21, x = dx - 0.2 * w + f * 0.4 * w; blade(g, x, dy, x + (r() - 0.5) * 4, dy + 0.45 * h, hi(6) ? GOLD : NG[k % 6], 1.6, hi(6) ? 0.6 + 0.4 * glow : 0.95); }
        g.restore(); }
      if (stage >= 5 && hi(5)) { g.save(); g.strokeStyle = GOLD; g.globalAlpha = 0.5 * glow; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, top + 0.55 * h, 0.58 * w, 0.55 * h, 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
      if (o.label !== false) {
        const ly = top + h * (stage >= 6 ? 1.5 : 1.08) + 14;
        K.text("Kito's practice nest", cx, ly, { size: 13, align: "center", color: K.col.muted, halo: true });
        if (stage >= 1) K.text("+ " + PART[stage], cx, ly + 18, { size: 13, bold: true, align: "center", color: "#b8860b", halo: true });
      }
    }
    window.WEAVE.practiceNest = practiceNest; window.WEAVE.tornNest = tornNest;

    // add the practice nest to the page that closes each stretch of the road
    const STAGES = { "w-dawns": [1, 90, 500, 0.75], "w-fourier": [2, 880, 120, 0.9], "w-gap": [3, 850, 500, 0.7], "w-scale": [4, 590, 330, 0.7], "w-minimum": [5, 860, 60, 0.85], "w-noise": [6, 620, 40, 0.7] };
    Object.entries(STAGES).forEach(([name, [stage, x, y, s]]) => {
      const f = DECK.get(name); if (!f) return;
      S(name, (ctx) => { const inner = f(ctx) || {};
        return Object.assign({}, inner, { draw(K, t) { const more = inner.draw ? inner.draw(K, t) : false;
          const glow = ctx.reduced ? 0.6 : 0.35 + 0.65 * K.ph(t, 0.5, 2.5) * (0.75 + 0.25 * Math.sin(t * 2));
          practiceNest(K, x, y, s, stage, { glow }); return more === false ? false : more; } }); });
    });

    // page 12: one morning, a finished nest in the old tree, among the torn attempts; the inspector tugs every knot
    S("w-files", ({ reduced }) => {
      const TOT = 175187, NX = 560, NT = 100, NW = 200, NH = 310, PTS = [];
      for (let row = 0; row < 15; row++) { const v = 0.06 + row * 0.062, hw = HW(NW, v) - 10, y = NT + v * NH, n = Math.max(2, Math.round(hw / 16));
        const line = []; for (let k = 0; k <= n; k++) line.push([NX - hw + (2 * hw * k) / n, y]); PTS.push(...(row % 2 ? line.reverse() : line)); }
      return {
        draw(K, t) {
          const { col } = K, g = K.g, f = reduced ? 1 : K.ease(K.ph(t, 0.8, 8)), done = Math.floor(f * PTS.length);
          // the old tree
          g.save(); g.lineCap = "round"; g.strokeStyle = "#6e4a2a"; g.lineWidth = 26; g.beginPath(); g.moveTo(70, 640); g.quadraticCurveTo(60, 300, 96, 70); g.stroke();
          g.strokeStyle = "#7a5230"; g.lineWidth = 13; g.beginPath(); g.moveTo(90, 86); g.quadraticCurveTo(500, 60, 975, 92); g.stroke();
          g.lineWidth = 6; g.beginPath(); g.moveTo(300, 76); g.lineTo(350, 40); g.moveTo(760, 78); g.lineTo(800, 44); g.stroke(); g.restore();
          [[210, 60, 100, 11], [340, 55, 120, 23], [770, 62, 110, 37], [890, 50, 95, 51]].forEach(([x, w, h, sd]) => tornNest(K, x, 84, w, h, sd));
          K.text("every weaver who ever tried", 280, 230, { size: 14, align: "center", color: col.muted, halo: true });
          // the strange finished nest
          nest(K, NX, NT, NW, NH);
          PTS.forEach(([x, y], k) => K.dot(x, y, k < done ? 3.6 : 2.8, k < done ? col.green : "#4f5a22", k < done ? 0.95 : 0.7));
          if (done < PTS.length) { const [x, y] = PTS[done]; bird(K, x, y - 1, 0.5, { color: "#8fb0c9" }); }
          K.text("the knot inspector", NX - NW / 2 - 14, NT + NH * 0.78, { size: 14, align: "right", color: "#5f87a8", bold: true, halo: true });
          // the mysterious helper: a soft glow of drifting letters, spinning one strand into the nest
          { const CX = 815, CY = 290, tt = reduced ? 2 : t, ap = reduced ? 1 : K.ease(K.ph(t, 0.2, 2.2));
            const glow = g.createRadialGradient(CX, CY, 0, CX, CY, 105); glow.addColorStop(0, `rgba(217,119,87,${0.32 * ap})`); glow.addColorStop(0.55, `rgba(217,119,87,${0.12 * ap})`); glow.addColorStop(1, "rgba(217,119,87,0)");
            g.save(); g.fillStyle = glow; g.beginPath(); g.arc(CX, CY, 105, 0, Math.PI * 2); g.fill(); g.restore();
            const GL = ["∀", "λ", "ζ", "→", "∃", "½", "≤", "Σ", ":=", "k", "s", "ρ", "a", "ψ"];
            GL.forEach((ch, i) => { const a0 = (i / GL.length) * Math.PI * 2 + tt * (0.12 + (i % 3) * 0.05) * (i % 2 ? 1 : -1), rr = 28 + ((i * 37) % 60), bob = Math.sin(tt * 0.9 + i) * 6;
              const al = ap * (0.35 + 0.45 * (0.5 + 0.5 * Math.sin(tt * 1.3 + i * 1.7)));
              g.save(); g.globalAlpha = al; K.text(ch, CX + Math.cos(a0) * rr, CY + Math.sin(a0) * rr * 0.8 + bob, { size: 15 + (i % 3) * 3, align: "center", color: "#c2643f", bold: i % 2 === 0 }); g.restore(); });
            // the strand, from the glow into the nest's side, with letters riding along it
            const P0 = [CX - 40, CY + 8], P1 = [740, 200], P2 = [NX + NW / 2 - 6, NT + NH * 0.45], bz = (u) => [(1 - u) ** 2 * P0[0] + 2 * u * (1 - u) * P1[0] + u * u * P2[0], (1 - u) ** 2 * P0[1] + 2 * u * (1 - u) * P1[1] + u * u * P2[1]];
            g.save(); g.globalAlpha = 0.8 * ap; g.strokeStyle = "#d97757"; g.lineWidth = 2.2; g.setLineDash([5, 4]); g.lineDashOffset = -tt * 14;
            g.beginPath(); for (let i = 0; i <= 30; i++) { const [x, y] = bz(i / 30); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
            for (let k = 0; k < 3; k++) { const u = ((tt * 0.18 + k / 3) % 1), [x, y] = bz(u); g.save(); g.globalAlpha = ap * Math.sin(Math.PI * u) * 0.9; K.text(GL[(k * 5 + Math.floor(tt * 0.18 + k / 3)) % GL.length], x, y - 10, { size: 13, align: "center", color: "#c2643f", bold: true }); g.restore(); }
            g.save(); g.globalAlpha = ap; K.text("Claude", CX, CY + 104, { size: 16, bold: true, align: "center", color: "#c2643f", halo: true });
            K.text("not a bird: a mind made of words", CX, CY + 124, { size: 13, align: "center", color: col.muted, halo: true }); g.restore(); }
          // Kito and Grey below, looking up
          K.seg(150, 600, 440, 600, { color: col.axis, width: 2 });
          bird(K, 230, 598, 1.0); bird(K, 320, 598, 1.15, { color: GREY, flip: true });
          const n = Math.round(TOT * f);
          K.box(600, 470, 360, 120, { fill: col.surface, fillAlpha: 0.92, color: col.axis, r: 10, sketch: false });
          K.text(`${n.toLocaleString("en-US")} of 175,187 knots tugged`, 780, 506, { size: 21, bold: true, align: "center", color: f >= 1 ? col.green : col.ink });
          K.text(f >= 1 ? "not one slipped" : "tugging every knot", 780, 540, { size: 17, align: "center", color: f >= 1 ? col.green : col.muted });
          K.text("too big to take in at once", 780, 568, { size: 15, align: "center", color: col.muted });
          return !reduced;
        },
      };
    });

    // page 2: torn attempts hang among the colony's nests
    { const f = DECK.get("w-colony"); if (f) S("w-colony", (ctx) => { const inner = f(ctx) || {};
      return Object.assign({}, inner, { draw(K, t) { tornNest(K, 390, 128, 60, 100, 7); tornNest(K, 640, 124, 64, 110, 19); return inner.draw ? inner.draw(K, t) : true; } }); }); }

    // page 44: in the round aviary, a nest finished long ago
    { const f = DECK.get("w-clockcurve"); if (f) S("w-clockcurve", (ctx) => { const inner = f(ctx) || {};
      return Object.assign({}, inner, { draw(K, t) { const more = inner.draw ? inner.draw(K, t) : false;
        const g = K.g; g.save(); g.strokeStyle = "#8b5e34"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(40, 20); g.lineTo(150, 24); g.stroke(); g.restore();
        nest(K, 95, 22, 50, 78); K.text("the aviary's nest,", 132, 64, { size: 13, align: "left", color: K.col.muted }); K.text("finished long ago", 132, 81, { size: 13, align: "left", color: K.col.muted });
        return more; } }); }); }

    // page 50: both nests hang by the wires; Kito on the middle wire
    S("w-end", () => ({
      draw(K, t) {
        const { col } = K, g = K.g, yAt = window.WEAVE.wires(K, 60, 940, [220, 340, 460]), Z = (window.RH_DATA && RH_DATA.zeros) || [];
        g.save(); g.strokeStyle = "#8b5e34"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(60, 70); g.lineTo(200, 76); g.moveTo(940, 70); g.lineTo(800, 76); g.stroke(); g.restore();
        nest(K, 140, 74, 72, 112); practiceNest(K, 862, 74, 0.62, 6, { label: false });
        K.text("the strange nest", 140, 200, { size: 13, align: "center", color: col.muted, halo: true });
        K.text("Kito's", 862, 200, { size: 13, align: "center", color: col.muted, halo: true });
        Z.slice(0, 30).forEach((z, i) => { const x = 90 + (z - 14) * 9.3; if (x < 920) bird(K, x, yAt(1, x), 0.55, { flip: i % 3 === 0, alpha: 0.9 + 0.1 * Math.sin(t + i) }); });
        const kx = 470; bird(K, kx, yAt(1, kx), 0.9, { sing: t }); K.text("Kito", kx, yAt(1, kx) + 26, { size: 15, bold: true, align: "center", color: col.ink, halo: true });
        return true;
      },
    }));
  }
  // ================================================================== page 5: Grey's bundle tally (Mertens' function), in place of the seed toss
  S("w-coins", ({ reduced }) => {
    const NST = 400, fac = (n) => { const r = []; for (let p = 2; n > 1; p++) while (n % p === 0) { r.push(p); n /= p; } return r; };
    const MU = [0], M = [0]; for (let n = 1; n <= NST; n++) { const f = fac(n), sq = f.some((p, i) => i && f[i - 1] === p); const v = sq ? 0 : f.length % 2 ? -1 : 1; MU.push(v); M.push(M[n - 1] + v); }
    const coin = [0]; { let s = 97, a = 0; for (let i = 0; i < NST; i++) { s = (s * 1664525 + 1013904223) >>> 0; a += s / 4294967296 < 0.5 ? 1 : -1; coin.push(a); } }
    const TC = { 2: "#3d7cc9", 3: "#c47a2a", 5: "#4f9a4a", 7: "#8a5cc9" };
    function mini(K, x, y, n, al) { // a tiny bundle: one stick per twig, tied
      const f = fac(n), g = K.g; g.save(); g.globalAlpha = al; g.lineCap = "round";
      f.forEach((p, i) => { g.strokeStyle = TC[p] || "#8b5e34"; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 7, y - i * 4); g.lineTo(x + 7, y - i * 4 - 1); g.stroke(); });
      if (f.length > 1) { g.strokeStyle = "#7d8a3a"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x, y - (f.length - 1) * 4 - 3); g.stroke(); }
      if (!f.length) { g.strokeStyle = "#b59a74"; g.lineWidth = 1.2; g.setLineDash([2, 2]); g.beginPath(); g.ellipse(x, y - 2, 6, 3, 0, 0, Math.PI * 2); g.stroke(); }
      g.restore();
    }
    return {
      draw(K, t) {
        const { col } = K, ROW = 34, RATE = 5, T0 = 0.6, T1 = T0 + ROW / RATE, T2 = T1 + 7;
        const nf = reduced ? NST : t < T1 ? Math.max(0, (t - T0) * RATE) : ROW + K.ease(K.ph(t, T1, T2)) * (NST - ROW), n = Math.floor(nf);
        // Grey on a branch, setting the bundles down in a row
        K.seg(40, 132, 210, 126, { color: BIRD.twig, width: 7 });
        bird(K, 140, 128, 1.45, { color: GREY });
        K.text("old Grey keeps the tally", 125, 160, { size: 16, align: "center", color: col.muted });
        const gy = 262, slotX = (k) => 272 + k * 19.5;
        K.seg(250, gy + 12, 940, gy + 12, { color: col.axis, width: 2 });
        for (let k = 1; k <= Math.min(n, ROW); k++) {
          const born = T0 + k / RATE, u = reduced ? 1 : clamp((t - born + 0.35) / 0.35, 0, 1), x = slotX(k - 1), y = gy - 6 * (1 - K.ease(u)), v = MU[k];
          mini(K, x, y + 6, k, (v === 0 ? 0.35 : 1) * u);
          K.text(String(k), x, gy + 26, { size: 10, align: "center", color: col.muted, alpha: u });
          K.text(v > 0 ? "▲" : v < 0 ? "▼" : "·", x, gy - 38, { size: v ? 12 : 16, align: "center", bold: true, color: v > 0 ? col.green : v < 0 ? col.red : col.muted, alpha: u });
        }
        // the tally board
        const up = MU.slice(1, n + 1).filter((v) => v > 0).length, dn = MU.slice(1, n + 1).filter((v) => v < 0).length, aside = n - up - dn;
        K.box(690, 30, 262, 110, { fill: col.surface, fillAlpha: 0.9, color: col.axis, r: 8, sketch: false });
        K.text(`▲ even count  ${up}`, 706, 56, { size: 16, color: col.green, bold: true });
        K.text(`▼ odd count  ${dn}`, 706, 80, { size: 16, color: col.red, bold: true });
        K.text(`· a twig used twice  ${aside}`, 706, 104, { size: 14, color: col.muted });
        K.text(`tally ${M[n] >= 0 ? "+" : "−"}${Math.abs(M[n])}`, 940, 68, { size: 21, bold: true, align: "right", color: col.gold });
        K.text(`${n} bundles`, 940, 128, { size: 14, align: "right", color: col.muted });
        // the tally's walk, inside ±√n, with a fair coin's walk faint behind it
        const A = K.axes([110, 330, 740, 230], [0, NST], [-30, 30]);
        A.frame({ xticks: [[0, "0"], [100, "100"], [200, "200"], [300, "300"], [400, "400"]], yticks: [[-20, "−20"], [0, "0"], [20, "20"]], xlabel: "bundles n" });
        A.curve((m) => Math.sqrt(m), 0, NST, 120, { color: col.green, width: 2.2, dash: [8, 6] });
        A.curve((m) => -Math.sqrt(m), 0, NST, 120, { color: col.green, width: 2.2, dash: [8, 6] });
        K.text("±√n", A.X(NST) + 8, A.Y(14), { size: 20, bold: true, color: col.green });
        A.clip(() => K.line(coin.slice(0, n + 1).map((v, i) => [A.X(i), A.Y(v)]), { color: col.muted, width: 1.4, alpha: 0.45 }));
        K.line(M.slice(0, n + 1).map((v, i) => [A.X(i), A.Y(v)]), { color: col.gold, width: 3 });
        K.dot(A.X(n), A.Y(M[n]), 5, col.gold);
        K.text("gold: Grey's tally (real)    faint: a fair coin's walk, for scale", 120, 316, { size: 15, color: col.muted });
        return !reduced && t < T2 + 0.2;
      },
    };
  });

})();
