/* scenes-weavers-2.js: colony pictures for the middle of the weaver book (Steps D, the weaving pass, the passes). */
(function () {
  "use strict";
  const S = DECK.scene, { bird, nest, twig, perch, BIRD, clamp, farOne } = window.WEAVE;
  const GRASS = ["#9aa64e", "#b9c26c", "#7d8a3a", "#6a7630", "#a9a35a"], BROWN = ["#8b5e34", "#a0703f", "#6e4a2a", "#b8864f"];
  const isPrime = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
  const vp = (n, p) => { let e = 0; while (n % p === 0) { n /= p; e++; } return e; };
  const ppBase = (n) => { for (let p = 2; p <= n; p++) if (n % p === 0) { let m = n; while (m % p === 0) m /= p; return m === 1 ? p : 0; } return 0; };
  const rngOf = (seed) => { let s = seed % 2147483646 + 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

  // a short woven band (grass), used for nest walls and layers
  function band(K, x, y, w, h, o = {}) {
    const g = K.g, r = rngOf(o.seed || Math.round(x * 3 + y * 7 + w));
    g.save(); g.globalAlpha = o.alpha ?? 1; g.fillStyle = o.fill || "#a3ad5c"; g.beginPath(); g.roundRect(x, y, w, h, Math.min(8, h / 2)); g.fill();
    g.beginPath(); g.roundRect(x, y, w, h, Math.min(8, h / 2)); g.clip(); g.lineCap = "round";
    const n = Math.round((w * h) / 90);
    for (let k = 0; k < n; k++) { const cx = x + r() * w, cy = y + r() * h, L = 10 + r() * 22, a = (r() - 0.5) * 0.9;
      g.strokeStyle = GRASS[Math.floor(r() * GRASS.length)]; g.lineWidth = 1 + r(); g.globalAlpha = (o.alpha ?? 1) * 0.7;
      g.beginPath(); g.moveTo(cx - Math.cos(a) * L / 2, cy - Math.sin(a) * L / 2); g.lineTo(cx + Math.cos(a) * L / 2, cy + Math.sin(a) * L / 2); g.stroke(); }
    g.restore();
  }
  // a tied bundle of twigs, centred at (cx, cy)
  function bundle(K, cx, cy, len = 130, n = 13) {
    const g = K.g; g.save(); g.lineCap = "round";
    for (let k = 0; k < n; k++) { const f = (k - (n - 1) / 2) / n, a = f * 0.35; g.strokeStyle = BROWN[k % BROWN.length]; g.lineWidth = 4;
      g.beginPath(); g.moveTo(cx - Math.cos(a) * len / 2, cy - Math.sin(a) * len / 2 + f * 18); g.lineTo(cx + Math.cos(a) * len / 2, cy + Math.sin(a) * len / 2 + f * 18); g.stroke(); }
    g.strokeStyle = "#7d8a3a"; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, 6, 16, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  }
  // a cord with knots tied along it, rows of them; frac in [0,1] says how many are tied so far
  function knotRows(K, x, y, w, rows, per, frac, o = {}) {
    const g = K.g, n = Math.round(rows * per * frac);
    for (let r = 0; r < rows; r++) { const yy = y + r * 34;
      g.save(); g.strokeStyle = "#b8864f"; g.lineWidth = 3; g.beginPath(); for (let k = 0; k <= 50; k++) { const xx = x + (w * k) / 50, y2 = yy + Math.sin(k * 0.7 + r) * 2.5; k ? g.lineTo(xx, y2) : g.moveTo(xx, y2); } g.stroke(); g.restore();
      for (let k = 0; k < per; k++) if (r * per + k < n) { const kx = x + ((k + 0.5) * w) / per; K.ring(kx, yy, 6, { color: "#6e4a2a", width: 3 }); if (o.ticks) K.dot(kx, yy - 13, 2.5, K.col.green); } }
  }
  window.WEAVE.knotRows = knotRows; window.WEAVE.bundle = bundle;
  // an upright stick (a twig standing on end), from y0 (bottom) up to y1
  function stick(K, x, y0, y1, o = {}) {
    const g = K.g; g.save(); g.globalAlpha = o.alpha ?? 1; g.strokeStyle = o.color || BIRD.twig; g.lineCap = "round"; g.lineWidth = o.width || 9;
    g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.restore();
  }
  // a balance: beam pivot at (cx, cy), tilt angle (radians, positive = right side down); returns pan centres
  function scale(K, cx, cy, half, tilt) {
    const { col } = K, dx = Math.cos(tilt) * half, dy = Math.sin(tilt) * half;
    K.line([[cx, cy + 6], [cx - 40, cy + 230], [cx + 40, cy + 230]], { color: col.muted, width: 3, close: true, sketch: false });
    K.seg(cx - dx, cy - dy, cx + dx, cy + dy, { color: BIRD.twig, width: 8, sketch: false });
    K.dot(cx, cy, 9, col.muted);
    const pans = [[cx - dx, cy - dy + 90], [cx + dx, cy + dy + 90]];
    pans.forEach(([px, py]) => { [-1, 1].forEach((s) => K.seg(px - (dx > 0 ? 0 : 0), py - 90, px + s * 80, py, { color: col.muted, width: 1.5, sketch: false }));
      K.line([[px - 95, py], [px + 95, py], [px + 70, py + 22], [px - 70, py + 22]], { color: col.muted, width: 2.5, close: true, fill: col.muted, fillAlpha: 0.12, sketch: false }); });
    return pans;
  }

  // ------------------------------------------------------------------ 25 weigh a bundle two ways
  S("w-twoways", ({ reduced }) => {
    const A = [6, 10, 15, 20, 25, 30];
    return {
      draw(K, t) {
        const { col } = K, step = reduced ? A.length - 1 : Math.min(A.length - 1, Math.floor(Math.max(0, t - 0.4) / 1.3)), a = A[step];
        let lnf = 0; for (let n = 2; n <= a; n++) lnf += Math.log(n);
        const twigs = []; for (let p = 2; p <= a; p++) if (isPrime(p)) { let e = 0; for (let q = p; q <= a; q *= p) e += Math.floor(a / q); for (let k = 0; k < e; k++) twigs.push(p); }
        const [L, R] = scale(K, 500, 200, 260, 0);
        // left pan: the pile of prime twigs, each as long as ln p
        const pal = { 2: col.blue, 3: col.red, 5: col.green, 7: col.purple };
        let row = 0, xpos = 0; const W = 170, u = 15;
        twigs.forEach((p) => { const len = Math.log(p) * u; if (xpos + len > W) { row++; xpos = 0; }
          const x0 = L[0] - W / 2 + xpos, y = L[1] - 8 - row * 7; K.seg(x0, y, x0 + len - 2, y, { color: pal[p] || BIRD.twig, width: 5, sketch: false }); xpos += len; });
        // right pan: the nest itself
        bundle(K, R[0], R[1] - 26, 150, 15); farOne(K, R[0] + 150, R[1] + 30, 190, { t });
        K.text("by its twigs", L[0], 60, { size: 24, bold: true, align: "center" });
        K.text("by its size", R[0], 60, { size: 24, bold: true, align: "center" });
        K.text(`${twigs.length} prime twigs, each as long as ln p`, L[0], L[1] + 56, { size: 17, align: "center", color: col.muted });
        K.text(`the bundle ${a}!, its size measured by a Far One`, R[0] + 20, R[1] + 56, { size: 17, align: "center", color: col.muted });
        K.math(`Σ ln p = ${lnf.toFixed(2)}`, L[0], L[1] + 96, { size: 26, color: col.blue });
        K.math(`ln(${a}!) = ${lnf.toFixed(2)}`, R[0], R[1] + 96, { size: 26, color: col.gold });
        K.text("blue 2 · red 3 · green 5 · purple 7 · brown: larger primes", 500, 600, { size: 16, align: "center", color: col.muted });
        K.text("the scale always balances", 500, 530, { size: 20, align: "center", bold: true, color: col.green });
        return !reduced;
      },
    };
  });

  // ------------------------------------------------------------------ 26 counting 3-twigs in layers
  S("w-legendre", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, rows = 3, per = 27, x0 = 70, dx = 31, ys = [190, 330, 470];
      const layers = reduced ? 4 : Math.min(4, Math.floor(Math.max(0, t - 0.5) / 1.2) + 1);
      for (let n = 1; n <= 81; n++) {
        const r = Math.floor((n - 1) / per), c = (n - 1) % per, x = x0 + c * dx, y = ys[r];
        twig(K, x - 10, y + 40, 22, -Math.PI / 2 + 0.25, { width: 4, color: "#b59a74" });
        const e = Math.min(vp(n, 3), layers);
        for (let k = 0; k < e; k++) K.dot(x, y + 18 - k * 15, 6, [col.gold, col.red, col.purple, col.blue][k]);
        if (c % 9 === 8) K.text(String(n), x, y + 66, { size: 14, align: "center", color: col.muted });
      }
      const counts = [27, 9, 3, 1];
      K.text("the bundles 1, 2, …, 81, with a knot for each 3-twig inside", 70, 80, { size: 19, color: col.muted });
      const txt = counts.slice(0, layers).join(" + ") + (layers === 4 ? "  =  40" : "");
      K.text(`3-twigs in 81!  =  ${txt}`, 500, 590, { size: 24, bold: true, align: "center" });
      [col.gold, col.red, col.purple, col.blue].slice(0, layers).forEach((c, k) => { K.dot(90 + k * 215, 128, 6, c); K.text(`every ${3 ** (k + 1)}th: ${counts[k]}`, 102 + k * 215, 128, { size: 17, color: c, bold: true }); });
      return !reduced && t < 5.5;
    },
  }));

  // ------------------------------------------------------------------ 27 twig ends over the rim
  S("w-overflow", ({ reduced }) => {
    const ns = []; for (let n = 2; n <= 25; n++) if (ppBase(n)) ns.push(n);
    let x = 12, touched = false;
    const sx0 = 200, sx1 = 760, sy = 600, XMIN = 3, XMAX = 16;
    const near = (px, py) => Math.abs(py - sy) < 32 && px > sx0 - 26 && px < sx1 + 26;
    const set = (px) => { x = Math.round(clamp(XMIN + ((px - sx0) / (sx1 - sx0)) * (XMAX - XMIN), XMIN, XMAX)); };
    return {
      hit: near, press(px, py) { if (!near(px, py)) return false; touched = true; set(px); return true; }, drag(px) { set(px); },
      draw(K, t) {
        const { col } = K, base = 520, ub = 52, x0 = 110, dx = 52, rimY = base - ub;
        const grow = reduced || touched ? 1 : K.ease(K.ph(t, 0.3, 2.3));
        // twigs stand inside the nest: twig n is a/n = (x/n)·b tall
        ns.forEach((n, i) => { const h = Math.min(8.6, x / n) * ub * grow, cx = x0 + i * dx;
          stick(K, cx, base, base - h, { color: BIRD.twig });
          if (x / n > 1) { const top = base - h; stick(K, cx, rimY, top, { color: col.red, width: 9 }); }
          K.text(String(n), cx, base + 26, { size: 16, align: "center", color: x / n > 1 ? col.ink : col.muted, bold: x / n > 1 }); });
        band(K, x0 - 34, rimY, ns.length * dx + 16, ub, { seed: 5 });   // the woven wall of the nest, height b
        K.text("b", x0 - 46, rimY + ub / 2, { size: 22, bold: true, align: "right", color: col.green });
        K.seg(x0 - 40, rimY, x0 + ns.length * dx - 10, rimY, { color: col.green, width: 2, dash: [6, 5], sketch: false });
        K.text("rim", x0 + ns.length * dx - 6, rimY - 12, { size: 17, color: col.green, bold: true });
        K.text(`twig n stands a/n = (${x}/n)·b tall; red: what sticks out over the rim`, 110, 50, { size: 19, color: col.muted });
        K.text("prime powers n", x0 + ns.length * dx - 20, base + 50, { size: 16, align: "right", color: col.muted });
        const out = ns.filter((n) => n < x);
        K.text(out.length ? `sticking out: n = ${out.join(", ")}` : "nothing sticks out", 110, 86, { size: 19, bold: true, color: col.red });
        // slider
        K.seg(sx0, sy, sx1, sy, { color: col.axis, width: 4, sketch: false });
        const hx = sx0 + ((x - XMIN) / (XMAX - XMIN)) * (sx1 - sx0); K.dot(hx, sy, 13, col.red); K.ring(hx, sy, 13, { color: K.surface, width: 2.5 });
        K.text(`x = ${x}`, sx1 + 30, sy, { size: 20, bold: true }); K.text("drag", sx0 - 24, sy, { size: 16, align: "right", color: col.muted });
        return !reduced && !touched && t < 2.5;
      },
    };
  });

  // ------------------------------------------------------------------ 30 pegs round the hoop, each with a big and a small loop
  function loop(K, x, y, r, color, o = {}) { const g = K.g; g.save(); g.strokeStyle = color; g.lineWidth = o.width || 3; g.globalAlpha = o.alpha ?? 1;
    g.beginPath(); g.ellipse(x, y + r, r * 0.8, r, 0, 0, Math.PI * 2); g.stroke(); g.restore(); }
  S("w-ring", () => ({
    draw(K, t) {
      const { col } = K, cx = 380, cy = 320, R = 210, N = 7;
      K.ring(cx, cy, R, { color: BIRD.twig, width: 10 }); K.ring(cx, cy, R - 6, { color: "#a0703f", width: 3 });
      for (let i = 0; i < N; i++) {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / N, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a), home = i === 0;
        K.dot(px, py, 8, "#5c3d22");
        const ox = px + Math.cos(a) * 26, oy = py + Math.sin(a) * 26 - 30;
        loop(K, ox - 22, oy, 26, home ? col.blue : col.red);       // big loop
        loop(K, ox + 24, oy + 12, 11, home ? col.red : col.blue);   // small loop
      }
      const hx = cx, hy = cy - R;
      bird(K, hx - 70, hy - 4, 0.8);
      { const a = -Math.PI / 2 + (2 * Math.PI * 2) / N, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a);
        farOne(K, px + 70, py + 70, 150, { t });
        const g = K.g; g.save(); g.strokeStyle = col.purple; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.ellipse(px + 40, py + 10, 34, 14, -0.5, 0.3, Math.PI * 1.7); g.stroke(); g.restore();
        K.text("a Far One turns the strand", 700, 520, { size: 17, bold: true, color: col.purple }); K.text("over, through a direction the", 700, 544, { size: 17, color: col.purple }); K.text("birds can't see: it comes back", 700, 568, { size: 17, color: col.purple }); K.text("as its mirror image", 700, 592, { size: 17, color: col.purple }); }
      K.text("home peg", hx + 70, hy - 70, { size: 18, bold: true, align: "left" });
      K.text("big loop: room for degree a", 700, 230, { size: 19, bold: true });
      K.text("small loop: room for degree b", 700, 262, { size: 19, bold: true });
      K.text("blue: the ordinary part", 700, 330, { size: 19, bold: true, color: col.blue });
      K.text("red: the mirror-image part", 700, 362, { size: 19, bold: true, color: col.red });
      K.text("home: ordinary part in the big loop", 700, 430, { size: 17, color: col.muted });
      K.text("every other peg: swapped", 700, 456, { size: 17, color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 31 Pascal's triangle mod 7 is a woven pattern
  S("w-pascal", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, p = 7, ROWS = 49, s = 10.5, cx = 270, y0 = 60;
      const shown = reduced ? ROWS : Math.min(ROWS, Math.round(ROWS * K.ease(K.ph(t, 0.2, 3.2))));
      let row = [1];
      for (let r = 0; r < shown; r++) {
        row.forEach((v, k) => { const x = cx + (k - r / 2) * s, y = y0 + r * s * 0.95;
          if (v) { g.save(); g.strokeStyle = r === 7 ? col.gold : GRASS[(r + k) % GRASS.length]; g.lineWidth = r === 7 ? 3 : 2.2; g.lineCap = "round";
            g.beginPath(); g.moveTo(x - 4, y - 4); g.lineTo(x + 4, y + 4); g.moveTo(x + 4, y - 4); g.lineTo(x - 4, y + 4); g.stroke(); g.restore(); }
          else if (r === 7) K.dot(x, y, 3, col.gold, 0.6); });
        const nx = [1]; for (let k = 1; k < row.length; k++) nx.push((row[k - 1] + row[k]) % p); nx.push(1); row = nx;
      }
      K.text("Pascal's triangle, mod 7:", 560, 110, { size: 19, color: col.muted });
      K.text("a stitch where the entry is not", 560, 136, { size: 19, color: col.muted });
      K.text("divisible by 7, a gap where it is", 560, 162, { size: 19, color: col.muted });
      if (shown > 7) { K.seg(cx + 3.5 * s + 14, y0 + 7 * s * 0.95, 550, 250, { color: col.gold, width: 1.5, dash: [4, 4], sketch: false });
        K.text("row 7:  1  0  0  0  0  0  0  1", 560, 250, { size: 21, bold: true, color: col.gold });
        K.text("(u + v)⁷ = u⁷ + v⁷", 560, 300, { size: 23, bold: true }); K.text("in arithmetic mod 7", 560, 330, { size: 19, color: col.muted }); }
      K.text("degree 63 in x  =  degree 9 in x⁷", 560, 400, { size: 20, color: col.blue, bold: true });
      return !reduced && t < 3.4;
    },
  }));

  // ------------------------------------------------------------------ 32 hops round the hoop (uses the page's x slider and p buttons)
  S("w-hops", ({ el, kick, reduced }) => {
    let x = 100, p = 3, start = 0, restart = true;
    const xin = el.querySelector(".x"), xout = el.querySelector("output");
    if (xin) { xin.addEventListener("input", () => { x = +xin.value; xout.textContent = x; restart = true; kick(); }); xout.textContent = x; }
    el.querySelectorAll(".ps button").forEach((b) => b.addEventListener("click", () => { el.querySelectorAll(".ps button").forEach((o) => o.classList.toggle("on", o === b)); p = +b.dataset.p; restart = true; kick(); }));
    const NS = 7, num = (v) => (v >= 100 ? String(Math.round(v)) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
    return {
      enter() { restart = true; },
      draw(K, t) {
        if (restart) { start = t; restart = false; }
        const { col } = K, cx = 290, cy = 320, R = 185, pos = reduced ? NS : (t - start) * 0.9, shown = Math.min(NS - 1, Math.floor(pos));
        K.ring(cx, cy, R, { color: BIRD.twig, width: 10 });
        let tot = 0;
        for (let e = 0; e < NS; e++) {
          const a = -Math.PI / 2 + (2 * Math.PI * e) / NS, px = cx + R * Math.cos(a), py = cy + R * Math.sin(a), swapped = e % 2 === 1;
          const deg = x / Math.pow(p, e), over = swapped ? Math.max(0, deg - 1) : 0, on = e <= shown;
          K.dot(px, py, 8, "#5c3d22");
          const lx = cx + (R + 70) * Math.cos(a), ly = cy + (R + 62) * Math.sin(a);
          loop(K, lx, ly - (swapped ? 12 : 26), swapped ? 12 : 26, swapped ? col.red : col.blue, { alpha: on ? 1 : 0.3 });
          if (on) {
            K.text(`${num(deg)}b`, lx, ly + 44, { size: 17, align: "center", bold: true, color: col.ink, halo: true });
            if (over > 0) { tot += over; K.text(`+${num(over)}b`, lx, ly + 66, { size: 17, align: "center", bold: true, color: col.red, halo: true }); }
          }
          K.text(e === 0 ? "home" : `hop ${e}`, cx + (R - 42) * Math.cos(a), cy + (R - 42) * Math.sin(a), { size: 15, align: "center", color: col.muted });
        }
        const e = Math.min(shown, NS - 1), a = -Math.PI / 2 + (2 * Math.PI * e) / NS;
        bird(K, cx + R * Math.cos(a), cy + R * Math.sin(a) - 4, 0.7);
        K.text(`p = ${p}: each hop divides`, 660, 130, { size: 20, bold: true }); K.text(`the degree by ${p}`, 660, 158, { size: 20, bold: true });
        K.text("blue: big loop, it fits", 660, 220, { size: 18, color: col.blue, bold: true });
        K.text("red: small loop, size b;", 660, 252, { size: 18, color: col.red, bold: true });
        K.text("what sticks out becomes", 660, 278, { size: 18, color: col.red });
        K.text("forced factors of p", 660, 304, { size: 18, color: col.red });
        K.text(`total overhang: ${num(tot)}b`, 660, 380, { size: 22, bold: true, color: col.red });
        K.text("degrees in units of b,", 660, 416, { size: 16, color: col.muted }); K.text("with a = x·b", 660, 438, { size: 16, color: col.muted });
        return !reduced && pos < NS + 0.2;
      },
    };
  });

  // ------------------------------------------------------------------ 34 a finer weave counts as bigger
  function mesh(K, x, y, w, h, step, o = {}) {
    const g = K.g; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.lineCap = "round";
    for (let i = 0; i * step <= w + step; i++) { g.strokeStyle = GRASS[i % 3]; g.lineWidth = o.width || 3; g.beginPath(); g.moveTo(x + i * step, y); g.lineTo(x + i * step - h * 0.25, y + h); g.stroke(); }
    for (let j = 0; j * step <= h + step; j++) { g.strokeStyle = BROWN[j % 3]; g.lineWidth = o.width || 3; g.beginPath(); g.moveTo(x, y + j * step); g.lineTo(x + w, y + j * step); g.stroke(); }
    for (let i = 0; i * step <= w + step; i++) for (let j = 0; j * step <= h + step; j++) { const px = x + i * step - j * step * 0.25, py = y + j * step; if (px >= x - 1 && px <= x + w + 1) K.dot(px, py, o.dot || 3.5, K.col.ink, 0.75); }
    g.restore(); K.box(x, y, w, h, { color: K.col.axis, sketch: false, width: 1.5 });
  }
  S("w-denser", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, f = reduced ? 1 : K.ease(K.ph(t, 0.6, 2));
      mesh(K, 70, 130, 330, 330, 60);
      K.text("the lattice", 235, 100, { size: 21, bold: true, align: "center" });
      if (f > 0) { K.arrow(430, 295, 500, 295, { color: col.gold, width: 3, alpha: f }); K.text("÷ p", 465, 268, { size: 22, bold: true, align: "center", color: col.gold, alpha: f }); }
      if (f > 0.2) { mesh(K, 530, 130, 330, 330, 30, { width: 2, dot: 2.6 }); K.text("divided by p = 2", 695, 100, { size: 21, bold: true, align: "center", color: col.gold }); }
      K.text("a finer mesh: 4× as many crossings in the same patch (2 dimensions, p = 2)", 465, 520, { size: 18, align: "center", color: col.muted });
      K.text("measured at infinity, finer counts as bigger", 465, 560, { size: 21, align: "center", bold: true, color: col.green });
      if (f > 0.2) farOne(K, 905, 470, 200, { t });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 36 one pass: the scale is swamped by its errors
  S("w-scale", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, tilt = (reduced ? 1 : K.ease(K.ph(t, 0.4, 1.8))) * 0.32;
      const [L, R] = scale(K, 500, 220, 250, tilt);
      nest(K, L[0], L[1] - 70, 40, 64);
      K.text("b · G(x)", L[0], L[1] + 50, { size: 24, bold: true, align: "center", color: col.blue });
      for (let k = 0; k < 5; k++) for (let j = 0; j <= k; j++) K.box(R[0] - 80 + j * 34 + (4 - k) * 17, R[1] - 34 - (4 - k) * 30, 30, 26, { fill: col.red, fillAlpha: 0.35, color: col.red, sketch: false, r: 4 });
      K.text("errors ≈ b · x", R[0], R[1] + 50, { size: 24, bold: true, align: "center", color: col.red });
      K.text("b · G(x)  ≤  errors", 500, 70, { size: 28, bold: true, align: "center" });
      K.text("true, but it tells us nothing", 500, 590, { size: 20, align: "center", color: col.muted });
      return !reduced && t < 2;
    },
  }));

  // ------------------------------------------------------------------ 37 weave again: each pass adds a layer and turns one minus into a plus
  S("w-chain", ({ reduced }) => {
    const M = 8;
    return {
      draw(K, t) {
        const { col } = K, j = reduced ? M : Math.min(M, Math.floor(Math.max(0, t - 0.4) / 0.7));
        for (let k = 0; k < M; k++) band(K, 120, 470 - k * 44, 380, 38, { seed: 11 + k, alpha: k < j ? 1 : 0.12 });
        if (j > 0) bird(K, 520, 470 - (j - 1) * 44 + 30, 0.9);
        for (let k = 0; k < j; k++) K.text(`pass ${k + 1}`, 110, 470 - k * 44 + 19, { size: 15, align: "right", color: col.muted });
        // the signs of the group: one minus becomes a plus per pass
        K.text("signs of the group", 640, 120, { size: 19, bold: true });
        for (let k = 0; k < M; k++) { const plus = k < j; K.ring(660 + k * 38, 170, 15, { color: plus ? col.green : col.red, width: 2.5 }); K.text(plus ? "+" : "−", 660 + k * 38, 171, { size: 22, bold: true, align: "center", color: plus ? col.green : col.red }); }
        K.text(`passes so far: ${j}`, 640, 260, { size: 24, bold: true });
        K.text("rounds of the two-way weighing: " + j, 640, 300, { size: 18, color: col.muted });
        K.text("each pass forces its own factors of p,", 640, 380, { size: 18, color: col.green, bold: true });
        K.text("and the gains add up", 640, 406, { size: 18, color: col.green, bold: true });
        return !reduced && t < M * 0.7 + 0.8;
      },
    };
  });

  // ------------------------------------------------------------------ 38 pass j adds j strands
  S("w-cost", ({ reduced }) => {
    const M = 10;
    return {
      draw(K, t) {
        const { col } = K, j = reduced ? M : Math.min(M, Math.floor(Math.max(0, t - 0.3) / 0.45)), w = 40, h = 40, x0 = 120, yb = 520;
        let tot = 0;
        for (let k = 1; k <= j; k++) { tot += k; for (let q = 0; q < k; q++) band(K, x0 + (k - 1) * (w + 6), yb - (q + 1) * (h + 4), w, h, { seed: k * 31 + q, fill: k === j ? "#c2ad66" : "#a3ad5c" }); }
        for (let k = 1; k <= M; k++) K.text(String(k), x0 + (k - 1) * (w + 6) + w / 2, yb + 22, { size: 16, align: "center", color: col.muted });
        K.text("pass number j", x0 + M * (w + 6), yb + 50, { size: 17, align: "right", color: col.muted });
        K.text(`strands woven so far: ${tot}`, 640, 120, { size: 24, bold: true, color: col.green });
        K.text("pass j carries j blocks of strands", 640, 160, { size: 18, color: col.muted });
        K.text("for m passes: 1 + 2 + ⋯ + m ≈ m²/2", 640, 200, { size: 20, bold: true });
        farOne(K, 880, 470, 190, { t }); K.text("each block: new directions", 830, 520, { size: 16, align: "right", color: col.purple }); K.text("only the Far Ones can carry", 830, 542, { size: 16, align: "right", color: col.purple });
        return true;
      },
    };
  });

  // ------------------------------------------------------------------ 42 old Grey's knot: a string 12 long, each knot tied m times uses m
  S("w-stepanov", ({ reduced }) => {
    const MS = [1, 2, 3, 4, 6];
    return {
      draw(K, t) {
        const { col } = K, g = K.g, idx = reduced ? 1 : Math.floor(Math.max(0, t - 0.3) / 1.6) % MS.length, m = MS[idx], N = 12 / m;
        const x0 = 90, x1 = 910, y = 300, unit = (x1 - x0) / 12;
        // the string, divided into 12 units of length
        g.save(); g.strokeStyle = "#b8864f"; g.lineWidth = 4; g.lineCap = "round"; g.beginPath();
        for (let k = 0; k <= 200; k++) { const xx = x0 + ((x1 - x0) * k) / 200, yy = y + Math.sin(k * 0.6) * 3; k ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); g.restore();
        for (let k = 0; k <= 12; k++) K.seg(x0 + k * unit, y + 26, x0 + k * unit, y + 36, { color: col.muted, width: 1.5, sketch: false });
        for (let i = 0; i < N; i++) { const cx = x0 + (i + 0.5) * m * unit;
          K.box(x0 + i * m * unit + 3, y + 44, m * unit - 6, 16, { fill: col.gold, fillAlpha: 0.35, color: col.gold, sketch: false, r: 4 });
          for (let w = 0; w < m; w++) K.ring(cx + (w - (m - 1) / 2) * 7, y, 13, { color: "#6e4a2a", width: 3 });   // m wraps of the knot
          K.dot(cx, y, 4, "#6e4a2a"); }
        K.text(`each knot tied ${m} time${m > 1 ? "s" : ""}:  ${N} knot${N > 1 ? "s" : ""} × ${m} = 12 = the string's length`, 500, 120, { size: 23, bold: true, align: "center" });
        K.text("string length = the polynomial's degree;  a knot tied m times = a root of multiplicity m", 500, 420, { size: 17, align: "center", color: col.muted });
        K.text("Stepanov:  (points) × m ≤ degree        this proof:  G(x) × m ≤ x + m²", 500, 500, { size: 20, align: "center", bold: true, color: col.purple });
        perch(K, 150, 222); bird(K, 150, 220, 1.1, { color: "#c9b27a" }); K.serif("old Grey", 150, 250, { size: 18, align: "center", color: col.muted });
        return !reduced;
      },
    };
  });
})();

/* batch 2: colony pictures for the opening, Step B, the supporting cast, the checks, and old Grey's stories */
(function () {
  "use strict";
  const S = DECK.scene, { bird, nest, twig, perch, wires, BIRD, clamp, farOne, knotRows } = window.WEAVE, ZEROS = (window.RH_DATA && RH_DATA.zeros) || [];
  const isPrime = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
  const PR = []; for (let n = 2; n < 200; n++) if (isPrime(n)) PR.push(n);
  const stand = (K, x, y0, h, color, w = 6) => K.seg(x, y0, x, y0 - h, { color: color || BIRD.twig, width: w, sketch: false });

  // ------------------------------------------------------------------ 5 twigs along the path
  S("w-gaps", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, x0 = 60, x1 = 940, N = 100, X = (n) => x0 + ((n - 1) / (N - 1)) * (x1 - x0), y = 380;
      K.seg(x0 - 20, y, x1 + 20, y, { color: "#b59a74", width: 10 });
      const upto = reduced ? N : Math.min(N, Math.round(N * K.ph(t, 0.3, 4.3)));
      PR.filter((p) => p <= upto).forEach((p) => { stand(K, X(p), y - 5, 46, BIRD.twig, 6); if ([2, 11, 23, 41, 43, 53, 71, 73, 89, 97].includes(p)) K.text(String(p), X(p) + ([41, 71].includes(p) ? -6 : [43, 73].includes(p) ? 6 : 0), y + 26, { size: 14, align: "center", color: col.muted }); });
      const kx = X(Math.max(1, upto)); bird(K, kx, y - 4, 0.7);
      if (upto >= 73) { [[41, 43], [71, 73]].forEach(([a, b]) => { K.box(X(a) - 9, y - 58, X(b) - X(a) + 18, 52, { color: col.green, width: 2, sketch: false, r: 6 }); K.seg((X(a) + X(b)) / 2, y - 60, 520, y - 112, { color: col.green, width: 1.2, dash: [4, 4], sketch: false }); });
        K.text("twins: a gap of just 2", 520, y - 128, { size: 18, align: "center", bold: true, color: col.green }); }
      if (upto >= 97) { K.seg(X(89) + 4, y + 52, X(97) - 4, y + 52, { color: col.red, width: 2.5, sketch: false }); K.seg(X(89) + 4, y + 44, X(89) + 4, y + 60, { color: col.red, width: 2.5, sketch: false }); K.seg(X(97) - 4, y + 44, X(97) - 4, y + 60, { color: col.red, width: 2.5, sketch: false });
        K.text("a long empty stretch: 89 … 97", X(97) + 10, y + 84, { size: 18, align: "right", bold: true, color: col.red }); }
      K.text("the unsplittable twigs up to 100, where they lie along the path", 500, 120, { size: 20, align: "center", color: col.muted });
      return !reduced && t < 4.5;
    },
  }));

  // ------------------------------------------------------------------ 14 other colonies
  const L4 = [6.0209, 10.2438, 12.9881, 16.3426, 18.2920, 21.4506, 23.2784, 25.7288, 28.3596, 29.6564];
  S("w-colors", ({ reduced }) => {
    // five colonies across the valley: each paints twig n with χ(n) (blue +1, red −1, grey 0) and has its own middle wire.
    // Birds sit at that colony's zeros up to height 30 (ζ, and the quadratic characters mod 3, 4, 5, 8; computed with mpmath).
    const C = [{name:"home: \u03b6's colony",note:"all twigs +1",chi:[1],zs:[14.1347, 21.022, 25.0109]},{name:"the mod-3 colony",note:"pattern repeats every 3",chi:[0, 1, -1],zs:[8.0397, 11.2492, 15.7046, 18.262, 20.4558, 24.0594, 26.5779, 28.2182]},{name:"the mod-4 colony",note:"pattern repeats every 4",chi:[0, 1, 0, -1],zs:[6.0209, 10.2438, 12.9881, 16.3426, 18.292, 21.4506, 23.2784, 25.7288, 28.3596, 29.6564]},{name:"the mod-5 colony",note:"pattern repeats every 5",chi:[0, 1, -1, -1, 1],zs:[6.6485, 9.8314, 11.9588, 16.0338, 17.567, 19.5407, 22.2274, 24.5885, 26.7761, 28.461, 29.7079]},{name:"the mod-8 colony",note:"pattern repeats every 8",chi:[0, 1, 0, -1, 0, -1, 0, 1],zs:[4.9, 7.6284, 10.8066, 12.3105, 15.1958, 17.0223, 18.806, 21.1316, 23.0838, 24.202, 26.9585, 28.0974, 29.9308]}];
    const HILL = ["#a9b96a", "#9fb06a", "#93a46a", "#8a9a6c", "#83906e"];
    return {
      draw(K, t) {
        const { col } = K, g = K.g, T = 30, X0 = 300, X1 = 940, X = (v) => X0 + (v / T) * (X1 - X0);
        // far to near: draw the farthest colony first, higher and paler
        for (let k = C.length - 1; k >= 0; k--) {
          const c = C[k], y = 140 + k * 104, a = 1 - k * 0.1, appear = reduced ? 1 : K.ease(K.ph(t, 0.2 + k * 0.45, 1.2 + k * 0.45));
          // a soft hill behind the colony
          g.save(); g.globalAlpha = 0.38 * a; g.fillStyle = HILL[k]; g.beginPath(); g.moveTo(40, y + 30);
          for (let x = 40; x <= 960; x += 20) g.lineTo(x, y + 18 - 26 * Math.sin((x / 960) * Math.PI) * (0.6 + 0.4 * Math.sin(x / 90 + k)));
          g.lineTo(960, y + 30); g.closePath(); g.fill(); g.restore();
          // its name and its twig pattern, n = 1..12
          K.text(c.name, 40, y - 30, { size: 18, bold: true });
          for (let n = 1; n <= 12; n++) { const v = c.chi[n % c.chi.length], cc = v > 0 ? col.blue : v < 0 ? col.red : col.muted;
            K.seg(40 + (n - 1) * 19, y - 12, 40 + (n - 1) * 19, y + 14, { color: cc, width: 6, sketch: false }); }
          K.text(c.note, 40, y + 34, { size: 14, color: col.muted });
          // its middle wire, and its birds
          [X0 - 14, X1 + 14].forEach((px) => { g.save(); g.fillStyle = "#6b4f33"; g.globalAlpha = a; g.fillRect(px - 4, y - 26, 8, 52); g.restore(); });
          K.seg(X0 - 14, y, X1 + 14, y, { color: col.gold, width: 3, sketch: false });
          c.zs.forEach((z, i) => { const drop = (1 - appear) * 40; if (appear > 0.02) bird(K, X(z), y - drop, 0.5, { flip: i % 3 === 1, alpha: appear }); });
        }
        [0, 10, 20, 30].forEach((v) => K.text(String(v), X(v), 590, { size: 14, align: "center", color: col.muted }));
        K.text("how far along the wire", X1, 616, { size: 15, align: "right", color: col.muted });
        K.text("twigs 1 to 12:  blue +1   red −1   grey 0", 40, 616, { size: 15, color: col.muted });
        K.text("every flock on its own middle wire", 620, 90, { size: 19, bold: true, align: "center", color: col.gold });
        return !reduced && t < 3.4;
      },
    };
  });

  // ------------------------------------------------------------------ 15 a nest of 175,187 knots
  S("w-files", ({ reduced }) => {
    // one morning a vast net of knots hangs across the valley; the inspector tugs every knot (green); Kito and Grey look up
    const R = 9, C = 25, TOT = 175187, KN = [];
    for (let r = 0; r <= R; r++) { const row = []; for (let c = 0; c < C; c++) { const x = 20 + c * 40 + (r % 2) * 20, y = 92 + r * 34 + 20 * Math.sin((Math.PI * (x - 20)) / 980); row.push([x, y]); } KN.push(r % 2 ? row.reverse() : row); }
    const ORDER = KN.flat();          // a serpentine path, row by row
    return {
      draw(K, t) {
        const { col } = K, g = K.g, f = reduced ? 1 : K.ease(K.ph(t, 0.6, 7.5)), done = Math.floor(f * ORDER.length);
        // the two trees it hangs from (off the edges: the net is bigger than the page)
        // the strands
        g.save(); g.strokeStyle = "#b8925a"; g.lineWidth = 2; g.globalAlpha = 0.85;
        const P = (r, c) => { const row = KN[r]; return r % 2 ? row[C - 1 - c] : row[c]; };
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const a = P(r, c), b = P(r + 1, c), d = r % 2 ? P(r + 1, c + 1) : P(r + 1, c - 1);
          g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); if (d) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(d[0], d[1]); g.stroke(); } }
        g.lineWidth = 4; g.strokeStyle = "#8b5e34"; g.beginPath(); KN[0].forEach(([x, y], k) => (k ? g.lineTo(x, y - 6) : g.moveTo(x, y - 6))); g.stroke();
        g.restore();
        // the knots: checked ones green
        ORDER.forEach(([x, y], k) => K.dot(x, y, k < done ? 5 : 4.2, k < done ? col.green : "#8b5e34", k < done ? 0.95 : 0.8));
        // the inspector, at the knot it is tugging
        if (done < ORDER.length) { const [x, y] = ORDER[done]; bird(K, x, y - 2, 0.55, { color: "#8fb0c9", flip: Math.floor(done / C) % 2 === 1 }); }
        // Kito and Grey on the ground, looking up
        K.seg(40, 600, 420, 600, { color: col.axis, width: 2 });
        bird(K, 150, 598, 1.0); bird(K, 240, 598, 1.15, { color: "#c9b27a", flip: true });
        // the tally
        const n = Math.round(TOT * f);
        K.box(500, 470, 440, 120, { fill: col.surface, fillAlpha: 0.92, color: col.axis, r: 10, sketch: false });
        K.text(`${n.toLocaleString("en-US")} of 175,187 knots tugged`, 720, 506, { size: 24, bold: true, align: "center", color: f >= 1 ? col.green : col.ink });
        K.text(f >= 1 ? "not one slipped" : "the knot inspector works along the net", 720, 540, { size: 18, align: "center", color: f >= 1 ? col.green : col.muted });
        K.text("too big to take in at once", 720, 570, { size: 16, align: "center", color: col.muted });
        return !reduced && t < 7.7;
      },
    };
  });

  // ------------------------------------------------------------------ 23 four piles of twigs
  const sq = (p, m) => { for (let k = 1; k < m; k++) if ((k * k) % m === p % m) return 1; return -1; };
  function piles(K, opts = {}) {
    const { col } = K, ps = PR.filter((p) => p < 140 && p !== 3 && p !== 7), kinds = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    const bw = opts.bw || 210, gap = opts.gap || 26, x0 = (opts.cx || 500) - (4 * bw + 3 * gap) / 2, base = opts.base || 560, sc = bw / 210;
    kinds.forEach(([a, b], i) => {
      const x = x0 + i * (bw + gap), hl = a === 1 && b === -1, mine = ps.filter((p) => sq(p, 3) === a && sq(p, 7) === b);
      if (hl) K.box(x - 4, base - 92, bw + 8, 140, { fill: col.gold, fillAlpha: 0.13, color: col.gold, width: 2, sketch: false, r: 12 });
      mine.forEach((p, k) => { const r = Math.floor(k / 3), c = k % 3; twig(K, x + (24 + c * 52 + (r % 2) * 16) * sc, base - 10 - r * 14, 52 * sc, -0.08 + ((k * 37) % 7) * 0.02, { width: 5, color: hl ? "#a0703f" : "#b59a74" });
        K.text(String(p), x + (50 + c * 52 + (r % 2) * 16) * sc, base - 22 - r * 14, { size: 11, align: "center", color: col.muted }); });
      K.text(`ψ = ${a > 0 ? "+1" : "−1"},  χ = ${b > 0 ? "+1" : "−1"}`, x + bw / 2, base + 30, { size: 18 * Math.min(1, sc + 0.1), align: "center", bold: true, color: hl ? col.gold : col.ink });
      if (opts.signs) opts.signs(x, bw, a, b, hl);
    });
    return { x0, bw, gap };
  }
  S("w-bins", () => ({
    draw(K, t) {
      const { col } = K; piles(K, { base: 470 }); perch(K, 80, 202);
      K.text("ψ(p): is p a square mod 3?     χ(p): is p a square mod 7?", 500, 90, { size: 19, align: "center", color: col.muted });
      K.text("the one pile the weaving can count", 500 - 236 / 2 + 0, 560, { size: 19, align: "center", bold: true, color: col.gold });
      bird(K, 80, 200, 0.9);
      return false;
    },
  }));

  // ------------------------------------------------------------------ 24 getting the other piles back: four rows of signs
  S("w-fourier", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, rows = [["all twigs", () => 1, col.ink], ["+ ψ helper", (a) => a, col.blue], ["− χ helper", (a, b) => -b, col.red], ["− ψχ helper", (a, b) => -a * b, col.purple]];
      const show = reduced ? 5 : Math.min(5, Math.floor(Math.max(0, t - 0.3) / 0.8) + 1), base = 560;
      const L = piles(K, { base: 250, bw: 165, gap: 22, cx: 575 });
      const kinds = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      rows.slice(0, Math.min(show, 4)).forEach(([name, f, c], r) => { const y = 320 + r * 50; K.text(name, L.x0 - 10, y, { size: 16, align: "right", color: c, bold: true });
        kinds.forEach(([a, b], i) => { const v = f(a, b), x = L.x0 + i * (L.bw + L.gap) + L.bw / 2; K.ring(x, y, 17, { color: c, width: 2 }); K.text(v > 0 ? "+1" : "−1", x, y + 1, { size: 15, align: "center", bold: true, color: c }); }); });
      if (show >= 5) { const y = 540; K.seg(L.x0, 505, L.x0 + 4 * L.bw + 3 * L.gap, 505, { color: col.axis, width: 2, sketch: false });
        K.text("add them up", L.x0 - 10, y, { size: 16, align: "right", bold: true });
        kinds.forEach(([a, b], i) => { const v = 1 + a - b - a * b, x = L.x0 + i * (L.bw + L.gap) + L.bw / 2; K.text(String(v), x, y, { size: 26, align: "center", bold: true, color: v ? col.gold : col.muted }); });
        K.text("÷ 4: exactly the gold pile, counted once", 500, 600, { size: 19, align: "center", bold: true, color: col.gold }); }
      return !reduced && t < 4.6;
    },
  }));

  // ------------------------------------------------------------------ 44 calm weather: the noise is far below what the proof can bear
  S("w-noise", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, sway = reduced ? 0 : Math.sin(t * 1.4) * 0.03;
      K.seg(80, 140, 420, 130, { color: BIRD.twig, width: 8 });
      g.save(); g.translate(250, 136); g.rotate(sway); nest(K, 0, 0, 110, 170); g.restore();
      for (let k = 0; k < 3; k++) { const y = 300 + k * 40, ph = reduced ? 0 : (t * 60 + k * 50) % 120; K.line([[60 + ph, y], [120 + ph, y - 6], [180 + ph, y]], { color: col.axis, width: 2, alpha: 0.6 }); }
      const gx = 640, top = 80, bot = 540, allowed = 140, actual = 470;
      K.box(gx - 30, top, 60, bot - top, { color: col.axis, sketch: false, width: 2, r: 8 });
      K.box(gx - 26, actual, 52, bot - actual - 4, { fill: col.blue, fillAlpha: 0.5, color: null, r: 6 });
      K.seg(gx - 50, allowed, gx + 50, allowed, { color: col.red, width: 3, sketch: false });
      K.text("allowed: about exp(x^{ε}/2)", gx + 64, allowed, { size: 19, bold: true, color: col.red });
      K.text("actual noise, from Selmer", gx + 64, actual + 20, { size: 19, bold: true, color: col.blue });
      K.text("groups (cousins of Ш)", gx + 64, actual + 46, { size: 19, bold: true, color: col.blue });
      K.arrow(gx + 90, actual - 20, gx + 90, allowed + 20, { color: col.green, width: 2 }); K.text("room to spare", gx + 104, (actual + allowed) / 2, { size: 19, bold: true, color: col.green });
      K.text("(schematic scale)", gx, bot + 30, { size: 15, align: "center", color: col.muted });
      farOne(K, 470, 560, 210, { t });
      K.text("E: in the Far Ones' many directions,", 60, 470, { size: 16, color: col.purple, bold: true });
      K.text("strands meet almost at right angles,", 60, 494, { size: 16, color: col.purple });
      K.text("so they never tangle", 60, 518, { size: 16, color: col.purple });
      K.text("F: the weather", 60, 400, { size: 16, color: col.blue, bold: true });
      return !reduced;
    },
  }));

  // ------------------------------------------------------------------ 46 the knot inspector
  S("w-checks", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, items = ["rebuilt independently, byte for byte the same", "only Lean's three standard axioms", "the statement is Mathlib's own RiemannHypothesis", "accepted by five independently written checkers", "certified by the Lean and Mathlib maintainers", "peer review and a human account: under way"];
      const n = reduced ? items.length : Math.min(items.length, Math.floor(Math.max(0, t - 0.3) / 0.6) + 1);
      knotRows(K, 40, 130, 220, 6, 7, 1, { ticks: true });
      perch(K, 150, 402); bird(K, 150, 400, 1.3, { flip: true, color: "#c9b27a" }); K.serif("the inspector", 150, 440, { size: 18, align: "center", color: col.muted });
      items.slice(0, n).forEach((s, i) => { const y = 120 + i * 70, done = i < 5;
        K.ring(330, y, 15, { color: done ? col.green : col.muted, width: 2.5, fill: done ? col.green : null });
        K.text(done ? "✓" : "…", 330, y + 1, { size: 17, align: "center", bold: true, color: done ? K.surface : col.muted });
        K.text(s, 360, y, { size: 19, bold: done, color: done ? col.ink : col.muted }); });
      return !reduced && t < 4.2;
    },
  }));

  // ------------------------------------------------------------------ 48 six weeks: six trees, one nest, and the inspector at the centre
  S("w-sixweeks", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, cx = 360, cy = 330, R = 220, names = ["representation\ntheory", "lattice\ngeometry", "Iwasawa\ntheory", "Galois\ncohomology", "complex\nmultiplication", "analytic\nnumber\ntheory"];
      names.forEach((nm, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        K.seg(x, y + 30, x, y + 58, { color: BIRD.twig, width: 8, sketch: false }); K.wash(x, y, 70, 46, "#7d8a3a", 0.35, i + 3);
        K.text(nm, x, y - 10 * (nm.split("\n").length - 1), { size: 15, align: "center", bold: true });
        const k = (reduced ? 6 : Math.floor(t * 1.2)) % 6; if (k === i) bird(K, (x + cx) / 2, (y + cy) / 2, 0.55, { flip: x < cx }); });
      K.ring(cx, cy, 62, { color: col.green, width: 2.5, dash: [6, 5] });
      K.text("weave", cx, cy - 22, { size: 17, align: "center", bold: true }); K.text("Lean checks", cx, cy + 2, { size: 17, align: "center", bold: true, color: col.green }); K.text("unpick, retry", cx, cy + 26, { size: 15, align: "center", color: col.muted });
      K.text("6 Oct → 16 Nov 2026", 820, 330, { size: 22, bold: true, align: "center" });
      K.text("six specialties", 820, 370, { size: 18, align: "center", color: col.muted }); K.text("that rarely meet", 820, 394, { size: 18, align: "center", color: col.muted });
      return !reduced;
    },
  }));

  // ------------------------------------------------------------------ 51 a nest that holds, and nobody yet knows why
  S("w-unknown", () => ({
    draw(K, t) {
      const { col } = K;
      K.seg(250, 120, 620, 110, { color: BIRD.twig, width: 8 }); nest(K, 430, 116, 150, 250);
      K.text("?", 430, 450, { size: 110, bold: true, align: "center", color: col.purple });
      perch(K, 170, 470); bird(K, 170, 468, 1.3); perch(K, 700, 470); bird(K, 700, 468, 1.1, { flip: true, color: "#c9b27a" });
      K.text("checked: yes", 760, 200, { size: 24, bold: true, color: col.green });
      K.text("understood: not yet", 760, 240, { size: 24, bold: true, color: col.purple });
      return false;
    },
  }));

  // ------------------------------------------------------------------ 56 the same balance, twice
  function miniScale(K, cx, cy, tilt, left, right, title, sub) {
    const { col } = K, half = 150, dx = Math.cos(tilt) * half, dy = Math.sin(tilt) * half;
    K.line([[cx, cy + 6], [cx - 30, cy + 190], [cx + 30, cy + 190]], { color: col.muted, width: 3, close: true, sketch: false });
    K.seg(cx - dx, cy - dy, cx + dx, cy + dy, { color: BIRD.twig, width: 7, sketch: false }); K.dot(cx, cy, 8, col.muted);
    [[cx - dx, cy - dy, left], [cx + dx, cy + dy, right]].forEach(([px, py, lab], i) => { const y = py + 80;
      K.seg(px, py, px - 60, y, { color: col.muted, width: 1.5, sketch: false }); K.seg(px, py, px + 60, y, { color: col.muted, width: 1.5, sketch: false });
      K.line([[px - 72, y], [px + 72, y], [px + 52, y + 18], [px - 52, y + 18]], { color: col.muted, width: 2.5, close: true, fill: col.muted, fillAlpha: 0.12, sketch: false });
      K.text(lab, px, y - 22, { size: 21, bold: true, align: "center", color: i ? col.green : col.blue }); });
    K.text(title, cx, cy - 110, { size: 22, bold: true, align: "center" }); K.text(sub, cx, cy - 80, { size: 17, align: "center", color: col.muted });
  }
  S("w-balance", () => ({
    draw(K, t) {
      const { col } = K;
      miniScale(K, 250, 260, 0, "(error) × m", "p + m²", "old Grey's round aviary", "Stepanov, 1969");
      miniScale(K, 750, 260, 0, "G(x) × m", "x + m²", "whole numbers", "this proof, 2026");
      K.text("overhead paid once, plus the cost of m layers", 500, 540, { size: 19, align: "center", color: col.muted });
      K.text("the same balance, so the same square root", 500, 580, { size: 22, align: "center", bold: true, color: col.gold });
      return false;
    },
  }));

  // ------------------------------------------------------------------ 60 a whole loom, or a single strand
  S("w-nosurface", () => ({
    draw(K, t) {
      const { col } = K, g = K.g;
      // left: Weil's loom, the surface C × C, with its diagonal
      const lx = 60, ly = 150, W = 250;
      K.box(lx - 10, ly - 10, W + 20, W + 20, { color: BIRD.twig, width: 8, sketch: false });
      for (let i = 0; i <= 10; i++) { K.seg(lx + (i * W) / 10, ly, lx + (i * W) / 10, ly + W, { color: "#9aa64e", width: 2, sketch: false }); K.seg(lx, ly + (i * W) / 10, lx + W, ly + (i * W) / 10, { color: "#b8864f", width: 2, sketch: false }); }
      K.seg(lx, ly + W, lx + W, ly, { color: col.gold, width: 4, sketch: false });
      K.text("Weil: a whole loom,", lx + W / 2, ly - 60, { size: 19, bold: true, align: "center" }); K.text("the surface C × C", lx + W / 2, ly - 34, { size: 17, align: "center", color: col.muted });
      K.text("positivity woven across it", lx + W / 2, ly + W + 40, { size: 16, align: "center", color: col.gold });
      // middle: the loom nobody can build for whole numbers
      const mx = 380;
      K.box(mx - 10, ly - 10, W + 20, W + 20, { color: col.axis, width: 3, dash: [8, 6], sketch: false });
      K.text("?", mx + W / 2, ly + W / 2 + 10, { size: 90, bold: true, align: "center", color: col.muted });
      K.text("whole numbers: nobody", mx + W / 2, ly - 60, { size: 19, bold: true, align: "center" }); K.text("can build this loom", mx + W / 2, ly - 34, { size: 17, align: "center", color: col.muted });
      K.text("(the “field with one element” dream)", mx + W / 2, ly + W + 40, { size: 16, align: "center", color: col.muted });
      farOne(K, mx + W - 42, ly + W / 2 + 4, 110, { t, alpha: 0.8 }); K.text("not even the Far Ones", mx + W / 2, ly + W + 66, { size: 16, align: "center", color: col.purple });
      // right: one strand with knots
      const rx = 700, ry = ly + W / 2;
      g.save(); g.strokeStyle = "#b8864f"; g.lineWidth = 4; g.beginPath(); for (let k = 0; k <= 60; k++) { const x = rx + (k * 250) / 60, y = ry + Math.sin(k * 0.5) * 4; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
      [0.2, 0.5, 0.8].forEach((f) => { K.ring(rx + 250 * f - 5, ry, 11, { color: "#6e4a2a", width: 3 }); K.ring(rx + 250 * f + 5, ry, 11, { color: "#6e4a2a", width: 3 }); });
      K.text("Stepanov, and this proof:", rx + 125, ly - 60, { size: 19, bold: true, align: "center" }); K.text("a single strand", rx + 125, ly - 34, { size: 17, align: "center", color: col.muted });
      K.text("plus “a nonzero integer", rx + 125, ly + W + 40, { size: 16, align: "center", color: col.green }); K.text("is at least 1”", rx + 125, ly + W + 62, { size: 16, align: "center", color: col.green });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 63 three threads to pull
  S("w-threads", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, items = [["the balance", "run it on clock arithmetic: does it", "turn into Stepanov's proof?", col.purple], ["fewer passes", "weave fewer passes: is the result", "weaker but still new? (the author began there)", col.green], ["the positivity", "found: a nonzero integer is at least 1.", "open: is skipping the surface the why?", col.blue]];
      K.seg(80, 70, 920, 64, { color: BIRD.twig, width: 9 });
      items.forEach(([h, a, b, c], i) => { const x = 180 + i * 320, pull = reduced ? 0 : Math.max(0, Math.sin(t * 1.3 - i * 1.2)) * 14;
        g.save(); g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); for (let k = 0; k <= 40; k++) { const y = 70 + k * 7 + (k * pull) / 40, xx = x + Math.sin(k * 0.45 + i) * 6; k ? g.lineTo(xx, y) : g.moveTo(xx, y); } g.stroke(); g.restore();
        const ty = 360 + pull; K.box(x - 140, ty, 280, 120, { fill: c, fillAlpha: 0.12, color: c, sketch: false, r: 10 });
        K.text(h, x, ty + 28, { size: 21, bold: true, align: "center", color: c }); K.text(a, x, ty + 64, { size: 15, align: "center" }); K.text(b, x, ty + 88, { size: 15, align: "center" }); });
      bird(K, 140, 66, 0.9);
      return !reduced;
    },
  }));

  // ------------------------------------------------------------------ neighbours at infinity
  S("w-farones", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K;
      K.seg(60, 400, 520, 392, { color: BIRD.twig, width: 8 });
      perch(K, 160, 398); bird(K, 160, 396, 1.4); perch(K, 330, 396); bird(K, 330, 394, 1.1, { flip: true, color: "#c9b27a" });
      farOne(K, 760, 520, 400, { t });
      K.text("a Far One\u2019s shadow, turning inside out", 760, 100, { size: 22, bold: true, align: "center", color: col.purple });
      K.text("they measure size and carry strands", 760, 600, { size: 17, align: "center", color: col.muted });
      K.text("the birds count twigs", 260, 470, { size: 17, align: "center", color: col.muted });
      return true;
    },
  }));
})();
