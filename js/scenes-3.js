/* scenes-3.js: illustrations for part XII, "Toward a why" (toy model over clock arithmetic, the dial, positivity, where the weight sits). */
(function () {
  "use strict";
  const S = DECK.scene, ZEROS = (window.RH_DATA && RH_DATA.zeros) || [];
  const isPrime = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
  const DATA_LEMN = {"3":[1,3,4,6,7,10,10,12,13,15,16,19,19,21,22,24,25,29,28,30,31,33,34,37,37,39,40,42,43,46,46,48,49,51,52,56,55,57,58,60,61,64,64,66,67,69,70,73,73,75],"7":[0,1,1,2,3,3,4,4,5,5,6,7,7,8,8,9,10,10,11,11,12,12,13,14,14,15,15,16,18,17,18,18,19,19,20,21,21,22,22,23,24,24,25,25,26,26,27,28,28,29],"11":[0,0,2,1,1,2,2,3,3,3,4,4,4,5,5,5,6,6,7,7,7,8,8,9,9,9,9,10,10,11,11,11,13,12,12,13,13,14,14,14,15,15,15,16,16,16,17,17,18,18]};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // the toy curve y² = x³ − x + 1 on a clock with p hours (good reduction except at 2 and 23)
  const rhs = (x, p) => (((x * x % p) * x - x + 1) % p + p) % p;
  function curvePoints(p) {
    const roots = Array.from({ length: p }, () => []);
    for (let y = 0; y < p; y++) roots[(y * y) % p].push(y);
    const pts = [];
    for (let x = 0; x < p; x++) roots[rhs(x, p)].forEach((y) => pts.push([x, y]));
    return pts;
  }
  function curveCount(p) {
    const sq = new Uint8Array(p);
    for (let y = 0; y < p; y++) sq[(y * y) % p] = 1;
    let n = 0;
    for (let x = 0; x < p; x++) { const r = rhs(x, p); n += r === 0 ? 1 : sq[r] ? 2 : 0; }
    return n;
  }
  // a slider drawn on the board
  function slider(K, x0, x1, y, frac, o = {}) {
    const { col } = K;
    K.seg(x0, y, x1, y, { color: col.axis, width: 4, sketch: false });
    (o.ticks || []).forEach(([f, s, c]) => { const x = x0 + f * (x1 - x0); K.seg(x, y - 10, x, y + 10, { color: c || col.muted, width: 2, sketch: false }); K.text(s, x, y + 30, { size: 17, align: "center", color: c || col.muted, bold: !!c }); });
    const hx = x0 + frac * (x1 - x0);
    K.dot(hx, y, 13, col.red); K.ring(hx, y, 13, { color: K.surface, width: 2.5 });
    return hx;
  }

  // ------------------------------------------------------------------ a first map drawn by hand (Rubinstein's draft)
  S("handmap", () => ({
    draw(K, t) {
      const { col } = K;
      const node = (x, y, w, h, c, a, b, i, dash) => {
        const f = K.ease(K.ph(t, 0.2 + i * 0.45, 0.7 + i * 0.45)); if (f <= 0) return false;
        K.g.globalAlpha = f;
        K.box(x, y, w, h, { color: c, width: 2.6, fill: c, fillAlpha: 0.12, r: 14, seed: 3 + i, dash });
        K.text(a, x + w / 2, y + (b ? h / 2 - 13 : h / 2), { size: 22, align: "center", bold: true });
        if (b) K.text(b, x + w / 2, y + h / 2 + 16, { size: 15.5, align: "center", color: col.muted });
        K.g.globalAlpha = 1; return f >= 1;
      };
      node(40, 30, 440, 96, col.purple, "(M): divisibility against size", "compared m times; still from the Lean code", 0, [8, 6]);
      node(520, 30, 440, 96, col.green, "B and C: two estimates", "helper characters; proved from known theorems", 1);
      const a1 = node(300, 200, 400, 70, col.green, "Estimate A: one bin, then all primes", "", 2);
      if (a1) { K.arrow(260, 130, 380, 196, { color: col.ink, width: 2.4, head: 12 }); K.arrow(740, 130, 620, 196, { color: col.ink, width: 2.4, head: 12 }); }
      const a2 = node(300, 330, 400, 70, col.green, "G(x) ≤ x^{½+ε}, on windows", "", 3);
      if (a2) K.arrow(500, 274, 500, 326, { color: col.ink, width: 2.4, head: 12 });
      const a3 = node(350, 460, 300, 70, col.gold, "the Riemann Hypothesis", "", 4);
      if (a3) K.arrow(500, 404, 500, 456, { color: col.ink, width: 2.4, head: 12 });
      if (a3) {
        K.text("written out by hand", 730, 400, { size: 19, bold: true, color: col.green });
        K.text("(Parts I–II of the draft)", 730, 428, { size: 17, color: col.muted });
        K.text("being written up, section by section", 40, 600, { size: 18, color: col.purple, bold: true });
      }
      return t < 2.6;
    },
  }));

  // ------------------------------------------------------------------ a number divisible at just the right primes (lemniscate sine)
  S("lemniscate", () => {
    const V = DATA_LEMN, ns = V["3"].map((_, i) => 5 + 4 * i);
    return {
      draw(K, t) {
        const { col } = K, A = K.axes([110, 70, 760, 410], [0, 205], [0, 80]);
        A.frame({ xticks: [[1, "1"], [50, "50"], [100, "100"], [150, "150"], [200, "200"]], yticks: [[0, "0"], [20, "20"], [40, "40"], [60, "60"], [80, "80"]], xlabel: "n, which derivative" });
        K.text("how many times p divides the n-th derivative", 110, 24, { size: 21, bold: true });
        K.text("1,  −12,  3024,  −4390848,  21224560896,  …", 110, 52, { size: 18, color: col.muted });
        const upto = K.ease(K.ph(t, 0.3, 3.8)) * 205;
        [[3, col.blue], [7, col.green], [11, col.purple]].forEach(([p, c]) => {
          const k = p / (p * p - 1);
          A.curve((n) => n * k, 1, Math.max(1.01, upto), 60, { color: c, width: 1.8, dash: [7, 6], alpha: 0.8 });
          V[String(p)].forEach((e, i) => { if (ns[i] <= upto) K.dot(A.X(ns[i]), A.Y(e), 4.5, c); });
          if (upto >= 200) K.text(`p = ${p}`, A.X(205) + 10, A.Y(201 * k), { size: 19, bold: true, color: c });
        });
        ns.forEach((n) => { if (n <= upto) K.dot(A.X(n), A.Y(0), 4, col.red, 0.8); });
        if (upto >= 200) K.text("p = 5, 13", A.X(205) + 10, A.Y(0) - 4, { size: 19, bold: true, color: col.red });
        K.text("dots: computed exactly     dashed: n·p / (p² − 1)", 110, 600, { size: 19, color: col.muted });
        return t < 4;
      },
    };
  });

  // ------------------------------------------------------------------ a world where we know the answer
  S("clockcurve", ({ reduced }) => {
    const PS = [11, 13, 17, 19, 29, 31, 37, 41, 43, 47], cache = {}, per = 3.4;
    const get = (p) => cache[p] || (cache[p] = curvePoints(p));
    return {
      draw(K, t) {
        const { col } = K, g = K.g;
        const k = reduced ? 7 : Math.floor(t / per) % PS.length, p = PS[k], loc = reduced ? per : t % per, P = get(p);
        const x0 = 80, y0 = 40, W = 500, c = W / p;
        g.save(); g.strokeStyle = col.grid; g.lineWidth = 1;
        for (let i = 1; i < p; i++) { g.beginPath(); g.moveTo(x0 + i * c, y0); g.lineTo(x0 + i * c, y0 + W); g.moveTo(x0, y0 + i * c); g.lineTo(x0 + W, y0 + i * c); g.stroke(); }
        g.restore();
        K.box(x0, y0, W, W, { color: col.axis, width: 1.8, sketch: false });
        K.text("x = 0", x0, y0 + W + 24, { size: 17, color: col.muted });
        K.text(String(p - 1), x0 + W, y0 + W + 24, { size: 17, align: "right", color: col.muted });
        K.text("y", x0 - 14, y0 + 12, { size: 17, align: "right", color: col.muted });
        const show = Math.round(K.ease(clamp(loc / 2, 0, 1)) * P.length), r = clamp(c * 0.34, 3.5, 8);
        for (let i = 0; i < show; i++) K.dot(x0 + (P[i][0] + 0.5) * c, y0 + W - (P[i][1] + 0.5) * c, r, col.blue);
        const cx = 800, N = P.length, dev = N - p, lim = 2 * Math.sqrt(p);
        K.math("y² = x³ − x + 1", cx, 74, { size: 32, italic: true });
        K.text(`on a clock with p = ${p} hours`, cx, 118, { size: 20, align: "center", color: col.muted });
        K.text(`solutions: ${show}`, cx, 196, { size: 26, align: "center", bold: true, color: col.blue });
        if (show === N) {
          K.text(`p = ${p}, so off by ${dev > 0 ? "+" : dev < 0 ? "−" : ""}${Math.abs(dev)}`, cx, 246, { size: 22, align: "center" });
          const bx = 660, bw = 280, by = 330;
          K.box(bx, by, bw, 30, { color: col.green, width: 2, fill: col.green, fillAlpha: 0.12, r: 6, sketch: false });
          const g2 = K.g; g2.save(); g2.fillStyle = col.gold; g2.globalAlpha = 0.85; g2.fillRect(bx + 2, by + 2, Math.max(3, (Math.abs(dev) / lim) * (bw - 4)), 26); g2.restore();
          K.text("how far off", bx, by - 18, { size: 18, color: col.gold, bold: true });
          K.text(`limit 2√p ≈ ${lim.toFixed(1)}`, bx + bw, by + 54, { size: 18, align: "right", color: col.green, bold: true });
          K.text("always inside", cx, 450, { size: 22, align: "center", color: col.green, bold: true });
        }
        return !reduced;
      },
    };
  });

  // ------------------------------------------------------------------ the error, for every clock size
  S("clockwobble", () => {
    let D = null;
    const data = () => D || (D = (() => { const r = []; for (let p = 3; p < 3000; p++) if (isPrime(p) && p !== 23) r.push([p, curveCount(p) - p]); return r; })());
    return {
      draw(K, t) {
        const { col } = K, A = K.axes([130, 50, 790, 440], [0, 3000], [-125, 125]), d = data();
        A.frame({ xticks: [[0, "0"], [1000, "1,000"], [2000, "2,000"], [3000, "3,000"]], yticks: [[-100, "−100"], [0, "0"], [100, "100"]], xlabel: "p, the number of hours on the clock" });
        K.seg(A.X(0), A.Y(0), A.X(3000), A.Y(0), { color: col.axis, width: 1, sketch: false });
        A.curve((p) => 2 * Math.sqrt(p), 1, 3000, 200, { color: col.green, width: 2.2, dash: [8, 6] });
        A.curve((p) => -2 * Math.sqrt(p), 1, 3000, 200, { color: col.green, width: 2.2, dash: [8, 6] });
        K.text("+2√p", A.X(3000) + 8, A.Y(2 * Math.sqrt(3000)), { size: 20, color: col.green, bold: true });
        K.text("−2√p", A.X(3000) + 8, A.Y(-2 * Math.sqrt(3000)), { size: 20, color: col.green, bold: true });
        const upto = Math.round(K.ease(K.ph(t, 0.3, 4.5)) * d.length);
        for (let i = 0; i < upto; i++) K.dot(A.X(d[i][0]), A.Y(d[i][1]), 3, col.blue, 0.85);
        K.text("(solutions) − p", 140, 34, { size: 21, color: col.blue, bold: true });
        K.text(`${d.length} clock sizes: every dot inside the envelope`, 130, 600, { size: 20, color: col.muted });
        return t < 4.9;
      },
    };
  });

  // ------------------------------------------------------------------ Stepanov's balance, side by side
  S("balance", () => ({
    draw(K, t) {
      const { col } = K, c1 = 430, c2 = 790;
      const rows = [
        ["counts", "points on a curve", "primes, one bin at a time"],
        ["the tool", "a polynomial with repeated roots", "a chain of theta lifts"],
        ["one more order", "one more derivative vanishes", "one more lift"],
        ["the balance", "(error) × m ≲ p + m²", "G × m ≤ x + m²"],
        ["best m", "m ≈ √p", "m ≈ √x"],
        ["result", "error ≲ √p", "G ≲ √x"],
      ];
      K.text("clock arithmetic", c1, 40, { size: 22, align: "center", bold: true, color: col.purple });
      K.text("Stepanov, 1969", c1, 70, { size: 17, align: "center", color: col.muted });
      K.text("whole numbers", c2, 40, { size: 22, align: "center", bold: true, color: col.green });
      K.text("this proof, 2026", c2, 70, { size: 17, align: "center", color: col.muted });
      rows.forEach(([lab, a, b], i) => {
        const y = 130 + i * 72, f = clamp(K.ph(t, 0.3 + i * 0.45, 0.8 + i * 0.45), 0, 1);
        if (f <= 0) return;
        if (i === 3) K.wash(610, y, 390, 34, col.gold, 0.16 * f, 9);
        K.seg(40, y - 36, 960, y - 36, { color: col.grid, width: 1, sketch: false });
        K.text(lab, 40, y, { size: 17, color: col.muted, alpha: f });
        K.text(a, c1, y, { size: 20, align: "center", bold: i >= 3 });
        K.text(b, c2, y, { size: 20, align: "center", bold: i >= 3 });
      });
      if (t > 3.4) K.text("the same balance, so the same square root", 500, 600, { size: 22, align: "center", bold: true, color: col.gold });
      return t < 3.6;
    },
  }));

  // ------------------------------------------------------------------ Hasse: a quadratic that can't go negative
  S("hasse", ({ reduced }) => {
    const p = 41, lim = 2 * Math.sqrt(p), sx0 = 170, sx1 = 830, sy = 545;
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
        const A = K.axes([130, 30, 740, 400], [-14, 14], [-45, 125]);
        A.frame({ xticks: [[-10, "−10"], [0, "0"], [10, "10"]], yticks: [[0, "0"], [50, "50"], [100, "100"]], xlabel: "r / s" });
        A.clip(() => {
          K.seg(A.X(-14), A.Y(0), A.X(14), A.Y(0), { color: col.axis, width: 1.6, sketch: false });
          if (a * a > 4 * p) {
            const r1 = (-a - Math.sqrt(a * a - 4 * p)) / 2, r2 = (-a + Math.sqrt(a * a - 4 * p)) / 2;
            g.save(); g.fillStyle = col.red; g.globalAlpha = 0.28; g.beginPath(); g.moveTo(A.X(r1), A.Y(0));
            for (let i = 0; i <= 60; i++) { const r = r1 + ((r2 - r1) * i) / 60; g.lineTo(A.X(r), A.Y(q(r))); }
            g.closePath(); g.fill(); g.restore();
          }
          A.curve(q, -14, 14, 300, { color: col.blue, width: 3 });
          for (let r = -14; r <= 14; r++) if (q(r) < 125) K.dot(A.X(r), A.Y(q(r)), 4, col.blue);
        });
        K.text(`degree  =  r² + a·r·s + ${p}·s²      (p = ${p})`, 150, 50, { size: 21, bold: true, halo: true });
        const ok = a * a <= 4 * p;
        const hx = slider(K, sx0, sx1, sy, (a + 20) / 40, { ticks: [[(20 - lim) / 40, "−2√p", col.green], [(20 + lim) / 40, "+2√p", col.green], [29 / 40, "", col.muted], [0.5, "0"]] });
        K.text("this curve", sx0 + (29 / 40) * (sx1 - sx0), sy - 26, { size: 16, align: "center", color: col.muted });
        K.text(`a = ${a < 0 ? "−" : ""}${Math.abs(a).toFixed(1)}`, hx, sy - 26 - (Math.abs(a - 9) < 1.5 ? 22 : 0), { size: 18, align: "center", bold: true, color: col.red, halo: true });
        K.text(ok ? "never below zero: allowed" : "dips below zero: a degree would be negative. Impossible.", 500, 612, { size: 21, align: "center", bold: true, color: ok ? col.green : col.red });
        return !touched && !reduced;
      },
    };
  });

  // ------------------------------------------------------------------ is there a hidden positivity?
  S("positivity", () => ({
    draw(K, t) {
      const { col } = K;
      const panel = (x, y, w, h, c, title, sub, seed) => { K.box(x, y, w, h, { color: c, width: 2.4, fill: c, fillAlpha: 0.08, r: 16, seed }); K.text(title, x + w / 2, y + 34, { size: 24, align: "center", bold: true, color: c }); K.text(sub, x + w / 2, y + 64, { size: 17, align: "center", color: col.muted }); };
      panel(50, 40, 360, 300, col.purple, "a balance", "Stepanov, 1969", 3);
      panel(590, 40, 360, 300, col.blue, "a positivity", "Hasse 1933, Weil 1948", 5);
      // mini balance curve p/m + m
      const bx = 90, by = 110, bw = 280, bh = 190, pts = [];
      for (let i = 0; i <= 80; i++) { const m = 1 + (i / 80) * 29; pts.push([bx + (i / 80) * bw, by + bh - ((100 / m + m) / 105) * bh]); }
      K.seg(bx, by + bh, bx + bw, by + bh, { color: col.axis, width: 1.5 });
      K.line(pts, { color: col.purple, width: 3, sketch: false });
      K.dot(bx + (9 / 29) * bw, by + bh - (20 / 105) * bh, 8, col.red);
      K.text("√", bx + (9 / 29) * bw, by + bh - (20 / 105) * bh + 30, { size: 20, align: "center", bold: true, color: col.red });
      // mini parabola above the axis
      const qx = 630, qy = 110, qw = 280, qh = 190, qp = [];
      for (let i = 0; i <= 80; i++) { const r = -1 + (2 * i) / 80; qp.push([qx + (i / 80) * qw, qy + qh - 14 - (r * r + 0.15) * 150]); }
      K.seg(qx, qy + qh - 14, qx + qw, qy + qh - 14, { color: col.axis, width: 1.5 });
      K.line(qp, { color: col.blue, width: 3, sketch: false });
      K.text("≥ 0", qx + qw / 2, qy + qh - 52, { size: 22, align: "center", bold: true, color: col.blue });
      // the new proof
      const f1 = K.ease(K.ph(t, 0.4, 1.6)), f2 = K.ease(K.ph(t, 1.6, 2.8));
      K.box(330, 450, 340, 100, { color: col.green, width: 2.8, fill: col.green, fillAlpha: 0.12, r: 16, seed: 8 });
      K.text("this proof", 500, 492, { size: 26, align: "center", bold: true, color: col.green });
      K.text("only ever uses ceilings", 500, 526, { size: 18, align: "center", color: col.muted });
      if (f1 > 0) K.arrow(230, 345, 230 + 150 * f1, 345 + 100 * f1, { color: col.purple, width: 3, head: 14 });
      if (f1 >= 1) K.text("visible in the code", 160, 432, { size: 18, color: col.purple, bold: true });
      if (f2 > 0) K.arrow(770, 345, 770 - 150 * f2, 345 + 100 * f2, { color: col.blue, width: 3, head: 14, dash: [8, 7] });
      if (f2 >= 1) { K.text("?", 790, 425, { size: 44, align: "center", bold: true, color: col.blue }); K.text("hidden in it?", 790, 470, { size: 18, align: "center", color: col.blue, bold: true }); }
      return t < 3;
    },
  }));

  // ------------------------------------------------------------------ a dial, not a switch
  S("dial", ({ reduced }) => {
    let al = 0.1, touched = false;
    const sx0 = 200, sx1 = 800, sy = 548, X0 = 120, X1 = 820;
    const near = (x, y) => Math.abs(y - sy) < 34 && x > sx0 - 26 && x < sx1 + 26;
    const set = (x) => { al = clamp((x - sx0) / (sx1 - sx0), 0.01, 0.99); if (Math.abs(al - 0.5) < 0.015) al = 0.5; };
    return {
      hit: near,
      press(x, y) { if (!near(x, y)) return false; touched = true; set(x); return true; },
      drag(x) { set(x); },
      draw(K, t) {
        const { col } = K, g = K.g;
        if (!touched) al = reduced ? 0.3 : 0.01 + 0.49 * K.ease(K.ph(t, 0.6, 4.4));
        const th = Math.max(al, 1 - al), RX = (re) => X0 + re * (X1 - X0), top = 40, bot = 390;
        g.save(); g.fillStyle = col.green; g.globalAlpha = 0.16; g.fillRect(RX(th), top, 960 - RX(th), bot - top); g.restore();
        K.seg(RX(0), bot, 960, bot, { color: col.axis, width: 2, sketch: false });
        K.seg(RX(0.5), top, RX(0.5), bot, { color: col.gold, width: 2.2, dash: [7, 6], sketch: false });
        ZEROS.slice(0, 40).forEach((z) => { const y = bot - z * 2.4; if (y > top + 6) K.dot(RX(0.5), y, 4.5, col.gold); });
        K.seg(RX(th), top, RX(th), bot, { color: col.green, width: 3, sketch: false });
        K.seg(RX(1), top, RX(1), bot, { color: col.axis, width: 1.4, dash: [3, 5], sketch: false });
        [[0, "0"], [0.5, "½"], [1, "1"]].forEach(([v, s]) => K.text(s, RX(v), bot + 24, { size: 19, align: "center", color: col.muted }));
        K.text("real part of s", 960, bot + 24, { size: 17, align: "right", color: col.muted });
        if (th < 0.97) K.text("no zeros here", (RX(th) + 960) / 2, 70, { size: 20, align: "center", bold: true, color: col.green, halo: true });
        const ex = (v) => v.toFixed(2).replace(/^0/, "0");
        K.text(`chain length m = x^{${ex(al)}}   ⟹   G ≤ x^{${ex(1 - al)}} + x^{${ex(al)}}`, 500, 450, { size: 22, align: "center", bold: true });
        K.text(al === 0.5 ? "θ = ½: the Riemann Hypothesis" : `no zeros with real part above ${th.toFixed(2)}`, 500, 488, { size: 21, align: "center", bold: true, color: al === 0.5 ? col.gold : col.green });
        slider(K, sx0, sx1, sy, al, { ticks: [[0, "short chain"], [0.5, "√x", col.gold], [1, "long chain"]] });
        return !touched && !reduced && t < 4.6;
      },
    };
  });

  // ------------------------------------------------------------------ where the weight sits
  S("weight", () => ({
    draw(K, t) {
      const { col } = K, g = K.g, COLS = 40, ROWS = 22, CS = 20, x0 = 100, y0 = 30;
      const groups = [
        ["Landau's trap (A)  ~160", 1, col.red],
        ["four bins (B)  ~90", 1, col.gold],
        ["theta-lift folders  ~4,800", 29, col.blue],
        ["Siegel–Weil (E)  ~1,800", 11, col.green],
        ["Iwasawa, duality (F)  ~6,200", 37, col.purple],
        ["background libraries  ~133,000", 801, col.axis],
      ];
      const cells = []; groups.forEach(([, n, c], gi) => { for (let i = 0; i < n; i++) cells.push([c, gi]); });
      const upto = Math.round(K.ease(K.ph(t, 0.2, 2.6)) * cells.length);
      g.save();
      for (let i = 0; i < upto; i++) { const [c, gi] = cells[i], r = Math.floor(i / COLS), k = i % COLS; g.fillStyle = c; g.globalAlpha = gi === 5 ? 0.35 : 0.9; g.fillRect(x0 + k * CS, y0 + r * CS, CS - 3, CS - 3); }
      g.restore();
      K.text("each square ≈ 166 of the 146,288 files the main theorem uses", 100, y0 + ROWS * CS + 20, { size: 17, color: col.muted });
      groups.forEach(([s, , c], i) => {
        const x = 100 + (i % 3) * 280, y = 530 + Math.floor(i / 3) * 40;
        const g2 = K.g; g2.save(); g2.fillStyle = c; g2.globalAlpha = i === 5 ? 0.35 : 0.9; g2.fillRect(x, y - 9, 18, 18); g2.restore();
        K.text(s, x + 26, y, { size: 17, color: col.ink });
      });
      return t < 2.9;
    },
  }));

  // ------------------------------------------------------------------ three threads to pull
  S("threads", () => ({
    draw(K, t) {
      const { col } = K;
      const items = [
        ["the balance", "run it on clock arithmetic: does it", "turn into Stepanov's proof?", col.purple],
        ["the dial", "turn the chain down: does a short", "chain give a weaker half-plane?", col.green],
        ["the positivity", "is the two-way count an inequality", "that can't go negative, in disguise?", col.blue],
      ];
      K.serif("?", 170, 320, { size: 150, align: "center", color: col.gold, alpha: 0.85 });
      items.forEach(([h, a, b, c], i) => {
        const y = 120 + i * 200, f = K.ease(K.ph(t, 0.3 + i * 0.5, 1.4 + i * 0.5)), pts = [];
        for (let j = 0; j <= 40 * f; j++) { const u = j / 40; pts.push([230 + u * 180, 320 + (y - 320) * (3 * u * u - 2 * u * u * u) + Math.sin(u * 9 + i) * 10 * (1 - u)]); }
        K.line(pts, { color: c, width: 3, sketch: false });
        if (f < 1) return;
        K.box(420, y - 70, 540, 140, { color: c, width: 2.4, fill: c, fillAlpha: 0.08, r: 16, seed: 4 + i });
        K.text(h, 450, y - 30, { size: 24, bold: true, color: c });
        K.text(a, 450, y + 10, { size: 19 });
        K.text(b, 450, y + 40, { size: 19 });
      });
      return t < 2.6;
    },
  }));
})();
