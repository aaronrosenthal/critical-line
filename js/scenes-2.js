/* scenes-2.js: illustrations for pages 29–54 (Step D, one theta lift, the chain, running it forward, verification). */
(function () {
  "use strict";
  const S = DECK.scene, ZEROS = (window.RH_DATA && RH_DATA.zeros) || [];
  const isPrime = (n) => { if (n < 2) return false; for (let q = 2; q * q <= n; q++) if (n % q === 0) return false; return true; };
  const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
  const sup = (n) => String(n).split("").map((c) => SUP[c]).join("");
  const primePower = (n) => { for (let p = 2; p <= n; p++) if (n % p === 0) { let m = n; while (m % p === 0) m /= p; return m === 1 ? p : 0; } return 0; };

  // ------------------------------------------------------------------ 23 a! two ways
  S("twoways", () => ({
    draw(K, t) {
      const { col } = K, a = Math.min(30, 2 + Math.floor(K.ph(t, 0.3, 7) * 28)), X0 = 60, W = 880, total30 = 74.658;
      const sc = W / total30, pal = [col.blue, col.red, col.green, col.gold, col.purple];
      let lnf = 0; for (let n = 2; n <= a; n++) lnf += Math.log(n);
      K.serif("by its primes", X0, 110, { size: 28, color: col.ink });
      let x = X0, i = 0;
      for (let p = 2; p <= a; p++) {
        if (!isPrime(p)) continue;
        let v = 0; for (let q = p; q <= a; q *= p) v += Math.floor(a / q);
        const w = v * Math.log(p) * sc;
        K.box(x, 140, w, 90, { color: K.surface, width: 1.5, sketch: false, fill: pal[i % 5], fillAlpha: 0.75 });
        if (w > 44) K.text(v > 1 ? `${p}${sup(v)}` : String(p), x + w / 2, 186, { size: 22, align: "center", bold: true, color: "#fff" });
        x += w; i++;
      }
      K.serif("by its size", X0, 330, { size: 28, color: col.ink });
      K.box(X0, 360, lnf * sc, 90, { color: col.ink, width: 1.5, fill: col.ink, fillAlpha: 0.18, sketch: false });
      K.text(`ln(${a}!) = ${lnf.toFixed(2)}`, X0 + (lnf * sc) / 2, 406, { size: 23, align: "center", bold: true });
      const st = a * Math.log(a) - a + 0.5 * Math.log(2 * Math.PI * a), xs = X0 + st * sc;
      K.seg(xs, 345, xs, 465, { color: col.gold, width: 3, dash: [6, 4], sketch: false });
      K.text("Stirling: a ln a − a + ½ ln 2πa", xs, 490, { size: 19, align: "right", color: col.gold, bold: true });
      K.text(`a = ${a}`, 940, 60, { size: 30, align: "right", bold: true, color: col.accent || col.gold });
      K.text("the two bars are always exactly the same length", 500, 590, { size: 22, align: "center", color: col.muted });
      return t < 7.3;
    },
  }));

  // ------------------------------------------------------------------ 24 Legendre's layers
  S("legendre", () => ({
    draw(K, t) {
      const { col } = K, a = 81, p = 3, X0 = 50, bw = 640 / a, base = 470, lh = 70, pal = [col.blue, col.green, col.gold, col.purple];
      K.seg(X0, base, X0 + 640, base, { color: col.axis, width: 2 });
      [1, 27, 54, 81].forEach((n) => K.text(String(n), X0 + (n - 0.5) * bw, base + 24, { size: 17, align: "center", color: col.muted }));
      let shownTot = 0; const counts = [];
      for (let layer = 1; layer <= 4; layer++) {
        const pk = Math.pow(p, layer), st = 0.4 + (layer - 1) * 1.3, f = K.ease(K.ph(t, st, st + 0.8)), cnt = Math.floor(a / pk);
        counts.push(cnt);
        if (f <= 0) continue;
        shownTot += cnt;
        for (let n = pk; n <= a; n += pk) K.box(X0 + (n - 1) * bw + 1, base - layer * lh, bw - 2, lh * f - 2, { color: null, fill: pal[layer - 1], fillAlpha: 0.8 });
        K.text(`layer ${layer}: multiples of ${pk} → ${cnt}`, 715, base - layer * lh + lh / 2, { size: 20, bold: true, color: pal[layer - 1] });
      }
      K.text(`factors of 3 in 81!  =  ${counts.filter((c, i) => t > 0.4 + i * 1.3).join(" + ") || "…"}${t > 5 ? "  =  40" : ""}`, 500, 570, { size: 26, align: "center", bold: true });
      K.text("n = 1 … 81", X0, base + 50, { size: 17, color: col.muted });
      return t < 6;
    },
  }));

  // ------------------------------------------------------------------ 25 overflow against b
  S("overflow", () => ({
    draw(K, t) {
      const { col } = K, x = 30, ns = []; for (let n = 2; n <= 40; n++) if (primePower(n)) ns.push(n);
      const A = K.axes([90, 50, 860, 440], [0, ns.length], [0, 16]);
      A.frame({ yticks: [[0, "0"], [5, "5b"], [10, "10b"], [15, "15b"]] });
      const grow = K.ease(K.ph(t, 0.3, 2)), split = K.ph(t, 2.6, 3.4), bw = (A.X(1) - A.X(0)) * 0.7;
      ns.forEach((n, i) => {
        const v = (x / n) * grow, xa = A.X(i + 0.15), over = Math.max(0, v - 1);
        if (split > 0 && over > 0) {
          K.box(xa, A.Y(Math.min(v, 1)), bw, A.Y(0) - A.Y(Math.min(v, 1)), { color: null, fill: col.ink, fillAlpha: 0.25 });
          K.box(xa, A.Y(v), bw, A.Y(1) - A.Y(v), { color: null, fill: col.red, fillAlpha: 0.25 + 0.55 * split });
        } else K.box(xa, A.Y(v), bw, A.Y(0) - A.Y(v), { color: null, fill: n > x && split > 0 ? col.green : col.blue, fillAlpha: 0.6 });
        K.text(String(n), xa + bw / 2, A.Y(0) + 20, { size: 15, align: "center", color: n > x ? col.green : col.muted });
      });
      if (split > 0) {
        K.seg(A.X(0), A.Y(1), A.X(ns.length), A.Y(1), { color: col.gold, width: 3, sketch: false });
        K.text("b", A.X(ns.length) + 8, A.Y(1), { size: 24, bold: true, color: col.gold });
        K.text("red: the overflow, a/n − b", A.X(4), A.Y(13), { size: 22, bold: true, color: col.red });
        K.text("past x = 30: nothing sticks out", A.X(ns.length) - 4, A.Y(4), { size: 19, align: "right", bold: true, color: col.green });
      }
      K.text("bars: a/n for each prime power n, with a = 30 · b", 100, 30, { size: 20, color: col.muted });
      K.text("prime powers n", A.X(ns.length), A.Y(0) + 48, { size: 18, align: "right", color: col.muted });
      return t < 3.6;
    },
  }));

  // ------------------------------------------------------------------ 26 the gap is G(x)
  S("gap", () => ({
    draw(K, t) {
      const { col } = K, line = (i) => K.ease(K.ph(t, 0.3 + i * 1.1, 0.9 + i * 1.1));
      const rows = [
        ["prime side", "Σ  ln p · max(a/pᵉ − b, 0)", col.blue],
        ["", "=  b · Σ  Λ(n) · (x/n − 1)", col.blue],
        ["size side", "b · ( x ln x − (1 + γ) x )", col.gold],
        ["the gap", "=  b · G(x)", col.red],
      ];
      rows.forEach(([lab, eq, c], i) => {
        const a = line(i); if (a <= 0) return;
        const y = 110 + i * 120 + (i === 3 ? 20 : 0);
        K.g.globalAlpha = a;
        if (lab) K.serif(lab, 230, y, { size: 26, align: "right", color: c });
        K.math(eq, 600, y, { size: i === 3 ? 44 : 34, color: i === 3 ? c : col.ink, italic: false });
        K.g.globalAlpha = 1;
      });
      if (line(1) >= 1) K.text("n runs over prime powers up to x; Λ(n) = ln p", 600, 280, { size: 18, align: "center", color: col.muted });
      if (line(3) > 0) { K.seg(260, 420, 940, 420, { color: col.ink, width: 2 }); K.text("prime side − size side", 230, 422, { size: 18, align: "right", color: col.muted }); }
      if (line(3) >= 1) K.wash(600, 500, 200, 60, col.red, 0.12, 4);
      return t < 4.8;
    },
  }));

  // ------------------------------------------------------------------ 27 a theta lift
  function gear(K, cx, cy, r, teeth, ang, color) {
    const pts = []; for (let i = 0; i <= teeth * 4; i++) { const th = ang + (i / (teeth * 4)) * Math.PI * 2, rr = i % 4 < 2 ? r : r * 0.82; pts.push([cx + rr * Math.cos(th), cy + rr * Math.sin(th)]); }
    K.line(pts, { color, width: 2.5, fill: color, fillAlpha: 0.12, sketch: false });
    K.ring(cx, cy, r * 0.28, { color, width: 2.5 });
  }
  S("machine", () => ({
    draw(K, t) {
      const { col } = K;
      K.wash(500, 320, 210, 190, col.blue, 0.13, 3);
      K.box(340, 160, 320, 320, { color: col.ink, width: 3, r: 26, fill: K.surface, fillAlpha: 0.6, seed: 12 });
      gear(K, 450, 250, 62, 10, t * 0.8, col.blue); gear(K, 553, 318, 48, 8, -t * 0.8 * 62 / 48 + 0.2, col.gold); gear(K, 462, 380, 40, 7, -t * 0.8 * 62 / 40, col.purple);
      K.math("Θ", 500, 520, { size: 46, italic: true });
      const s = (t * 60) % 60;
      for (let k = 0; k < 7; k++) { const x = 40 + ((k * 60 + s) % 300); K.dot(x, 272, 2.5, col.blue, 0.7); }
      K.box(30, 205, 300, 50, { color: col.blue, width: 2.5, fill: col.blue, fillAlpha: 0.2, r: 8, seed: 3 });
      K.text("degree a = x · b", 180, 230, { size: 24, align: "center", bold: true, color: col.blue });
      K.box(250, 390, 80, 50, { color: col.red, width: 2.5, fill: col.red, fillAlpha: 0.2, r: 8, seed: 4 });
      K.text("b", 290, 415, { size: 24, align: "center", bold: true, color: col.red });
      K.text("degree", 236, 415, { size: 20, align: "right", color: col.red });
      K.arrow(680, 320, 870, 320, { color: col.green, width: 3, seed: 6 });
      K.serif("paired,", 775, 280, { size: 26, align: "center", color: col.green });
      K.serif("measured two ways", 775, 370, { size: 24, align: "center", color: col.green });
      return true;
    },
  }));

  // ------------------------------------------------------------------ seats around a table
  S("ring", () => ({
    draw(K, t) {
      const { col } = K, cx = 500, cy = 320, R = 225, N = 8, at = (i) => [cx + R * Math.sin((i / N) * Math.PI * 2), cy - R * Math.cos((i / N) * Math.PI * 2)];
      for (let i = 0; i < N; i++) {
        const [x1, y1] = at(i), [x2, y2] = at(i + 1), pts = [];
        for (let k = 0; k <= 10; k++) { const th = ((i + 0.22 + (k / 10) * 0.56) / N) * Math.PI * 2; pts.push([cx + (R + 0) * Math.sin(th), cy - (R + 0) * Math.cos(th)]); }
        K.line(pts, { color: col.axis, width: 2, seed: i });
      }
      for (let i = 0; i < N; i++) {
        const [x, y] = at(i), even = i % 2 === 0, c = even ? col.blue : col.red;
        K.ring(x, y, 54, { color: c, width: 2.6, fill: c, fillAlpha: 0.12 });
        K.text(even ? "a │ b" : "b │ a", x, y - 4, { size: 23, align: "center", bold: true, color: c });
        K.text(i === 0 ? "home seat" : even ? "like home" : "swapped", x, y + 72, { size: 18, align: "center", color: c, halo: true });
      }
      const pos = (t * 0.8) % N, i0 = Math.floor(pos), f = K.ease(pos - i0), th = ((i0 + f) / N) * Math.PI * 2;
      K.dot(cx + (R - 92) * Math.sin(th), cy - (R - 92) * Math.cos(th), 10, col.gold);
      K.serif("pocket sizes:", cx, cy - 48, { size: 22, align: "center", color: col.muted });
      K.serif("ordinary │ mirror", cx, cy - 14, { size: 24, align: "center", color: col.muted });
      K.serif("part     part", cx, cy + 20, { size: 22, align: "center", color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 29 Pascal and Frobenius
  S("pascal", () => ({
    draw(K, t) {
      const { col } = K, P = 7, rows = [];
      for (let n = 0; n <= P; n++) { const r = [1]; for (let k = 1; k <= n; k++) r.push((r[k - 1] * (n - k + 1)) / k); rows.push(r); }
      rows.forEach((r, n) => {
        const a = K.ease(K.ph(t, 0.2 + n * 0.3, 0.6 + n * 0.3)); if (a <= 0) return;
        K.g.globalAlpha = a;
        r.forEach((v, k) => {
          const x = 500 + (k - n / 2) * 74, y = 50 + n * 50, mid = n === P && k > 0 && k < n, hl = mid && t > 3;
          if (hl) K.ring(x, y, 25, { color: col.gold, width: 3, fill: col.gold, fillAlpha: 0.18 });
          K.text(String(v), x, y, { size: 22, align: "center", bold: n === P, color: n === P ? col.ink : col.muted });
        });
        K.g.globalAlpha = 1;
      });
      if (t > 3) K.text("all divisible by 7", 830, 400, { size: 20, bold: true, color: col.gold });
      const b = K.ease(K.ph(t, 3.6, 4.4));
      if (b > 0) {
        K.g.globalAlpha = b;
        K.math("(u + v)⁷  =  u⁷ + v⁷   in arithmetic mod 7", 500, 480, { size: 32 });
        K.math("degree 63 in x   =   degree 9 in x⁷", 500, 560, { size: 30, color: col.blue });
        K.g.globalAlpha = 1;
      }
      return t < 4.6;
    },
  }));

  // ------------------------------------------------------------------ 30 hops and overflow (interactive)
  S("hops", ({ el, kick, reduced }) => {
    let x = 100, p = 3, start = 0, restart = true;
    const xin = el.querySelector(".x"), xout = el.querySelector("output");
    xin.addEventListener("input", () => { x = +xin.value; xout.textContent = x; restart = true; kick(); });
    xout.textContent = x;
    el.querySelectorAll(".ps button").forEach((b) => b.addEventListener("click", () => { el.querySelectorAll(".ps button").forEach((o) => o.classList.toggle("on", o === b)); p = +b.dataset.p; restart = true; kick(); }));
    const NS = 7, num = (v) => (v >= 100 ? String(Math.round(v)) : v >= 10 ? v.toFixed(1) : v.toFixed(2));
    return {
      enter() { restart = true; },
      draw(K, t) {
        if (restart) { start = t; restart = false; }
        const { col } = K, pos = reduced ? NS : (t - start) * 0.9, cw = 980 / NS, yb = 470, yt = 70, vmin = 0.2, vmax = x * 4;
        const ym = (v) => yb - (yb - yt) * (Math.log(Math.max(v, vmin) / vmin) / Math.log(vmax / vmin));
        const shown = Math.min(NS - 1, Math.floor(pos));
        for (let e = 0; e < NS; e++) {
          const xa = 10 + e * cw + 6, xb = 10 + (e + 1) * cw - 6, xm = (xa + xb) / 2, odd = e % 2 === 1, c = odd ? col.red : col.blue;
          K.box(xa, yt - 10, xb - xa, yb - yt + 10, { color: c, width: 1.6, fill: c, fillAlpha: 0.06, sketch: false });
          K.text(e === 0 ? "home" : `hop ${e}`, xm, yb + 28, { size: 21, align: "center", bold: true, color: e === shown ? col.gold : col.muted });
          K.text(odd ? "swapped seat" : "like home", xm, yb + 56, { size: 17, align: "center", color: c });
          if (e > 0) K.seg(xa + 4, ym(odd ? 1 : x), xb - 4, ym(odd ? 1 : x), { color: c, width: 2.2, dash: [7, 5], sketch: false });
          if (e > shown) continue;
          const v = x / Math.pow(p, e), g = e === shown ? K.ease(Math.min(1, (pos - shown) * 1.6)) : 1, top = yb + (ym(v) - yb) * g;
          const bxa = xa + cw * 0.2, bxb = xb - cw * 0.2;
          if (odd && v > 1) {
            const cap = Math.max(top, ym(1));
            K.box(bxa, cap, bxb - bxa, yb - cap, { color: null, fill: col.ink, fillAlpha: 0.3 });
            if (top < cap) K.box(bxa, top, bxb - bxa, cap - top, { color: null, fill: col.red, fillAlpha: 0.78 });
          } else K.box(bxa, top, bxb - bxa, yb - top, { color: null, fill: e === 0 ? col.blue : col.ink, fillAlpha: e === 0 ? 0.6 : 0.3 });
          if (g >= 1) {
            K.text((e === 0 ? "a = " : "") + num(v) + " b", xm, Math.min(top, yb - 40) - 16, { size: 19, align: "center", bold: true, halo: true });
            if (e > 0) K.text(odd && v > 1 ? "+" + num(v - 1) : "fits", xm, yb - 16, { size: 18, align: "center", bold: true, color: odd && v > 1 ? col.red : col.green, halo: true });
          }
        }
        let tot = 0; for (let e = 1, pk = p; pk < x; e += 2, pk *= p * p) tot += x / pk - 1;
        K.text(`dashed: pocket size (b on a swapped seat, about a otherwise)   ·   total overflow at p = ${p}: ${num(tot)} b`, 500, 610, { size: 18, align: "center", color: col.muted, maxW: 980 });
        K.text(`p = ${p}: each hop divides the degree by ${p}`, 14, 30, { size: 22, bold: true });
        return pos < NS + 0.3;
      },
    };
  });

  // ------------------------------------------------------------------ 31 three mysteries, one picture
  S("three", () => ({
    draw(K, t) {
      const { col } = K;
      K.math("max( a/pᵉ − b , 0 ),   odd e only", 500, 70, { size: 38 });
      const cards = [
        ["÷ pᵉ", "each Frobenius hop\ndivides the degree by p", col.blue],
        ["− b", "the small\npocket", col.red],
        ["odd e", "only hops to swapped\nseats overflow", col.purple],
        ["pᵉ ≤ x", "past x = a/b,\neverything fits", col.green],
      ];
      cards.forEach(([h, s, c], i) => {
        const a = K.ease(K.ph(t, 0.4 + i * 0.6, 1 + i * 0.6)); if (a <= 0) return;
        const x = i % 2 ? 530 : 90, y = i < 2 ? 150 : 380, w = 380, hgt = 190;
        K.g.globalAlpha = a;
        K.wash(x + w / 2, y + hgt / 2, w / 2, hgt / 2, c, 0.16, i + 3);
        K.box(x, y, w, hgt, { color: c, width: 2.2, r: 16, seed: i + 9 });
        K.math(h, x + w / 2, y + 52, { size: 40, color: c });
        K.text(s, x + w / 2, y + 112, { size: 22, align: "center" });
        K.g.globalAlpha = 1;
      });
      return t < 3.2;
    },
  }));

  // ------------------------------------------------------------------ 32 a denser lattice
  S("denser", () => ({
    draw(K, t) {
      const { col } = K, f = K.ease(K.ph(t, 1, 3.5)), cx = 500, cy = 320, b1 = [130, 0], b2 = [52, 120];
      const g = K.g; g.save(); g.beginPath(); g.rect(130, 40, 740, 520); g.clip();
      for (const [lev, alpha] of [[1, 1], [2, f]]) {
        if (alpha <= 0) continue;
        for (let i = -8; i <= 8; i++) for (let j = -5; j <= 5; j++) {
          if (lev === 2 && i % 2 === 0 && j % 2 === 0) continue;
          const x = cx + (i * b1[0] + j * b2[0]) / 2, y = cy - (i * b1[1] + j * b2[1]) / 2;
          if (lev === 1 && (i % 2 || j % 2)) continue;
          K.dot(x, y, lev === 1 ? 6 : 5, lev === 1 ? col.ink : col.blue, alpha);
        }
      }
      g.restore();
      const s = K.lerp(1, 0.5, f), tile = [[cx, cy], [cx + b1[0] * s, cy - b1[1] * s], [cx + (b1[0] + b2[0]) * s, cy - (b1[1] + b2[1]) * s], [cx + b2[0] * s, cy - b2[1] * s], [cx, cy]];
      K.line(tile, { color: col.gold, width: 3, fill: col.gold, fillAlpha: 0.25, sketch: false });
      K.box(130, 40, 740, 520, { color: col.axis, width: 1.5, sketch: false });
      K.text(f < 0.5 ? "a lattice" : "the lattice divided by p (here p = 2)", 500, 595, { size: 23, align: "center", bold: true, color: f < 0.5 ? col.ink : col.blue });
      K.text("smaller tile, more points: \"bigger\" in Arakelov geometry", 500, 625, { size: 18, align: "center", color: col.muted });
      return t < 3.7;
    },
  }));

  // ------------------------------------------------------------------ 33 periods at infinity
  S("period", () => ({
    draw(K, t) {
      const { col } = K, o = [300, 360], u = 110, w1 = [1, 0], w2 = [0.5, Math.sqrt(7) / 2], P = (a, b) => [o[0] + (a * w1[0] + b * w2[0]) * u, o[1] - (a * w1[1] + b * w2[1]) * u];
      K.seg(60, o[1], 560, o[1], { color: col.axis, width: 1.4, sketch: false }); K.seg(o[0], 50, o[0], 600, { color: col.axis, width: 1.4, sketch: false });
      K.text("Re", 560, o[1] + 22, { size: 18, color: col.muted }); K.text("Im", o[0] + 10, 50, { size: 18, color: col.muted });
      const pulse = 0.18 + 0.1 * Math.sin(t * 2);
      K.line([P(0, 0), P(1, 0), P(1, 1), P(0, 1), P(0, 0)], { color: col.gold, width: 3, fill: col.gold, fillAlpha: pulse, sketch: false });
      const n = Math.floor(K.ph(t, 0, 2) * 120); let k = 0;
      for (let a = -7; a <= 7; a++) for (let b = -3; b <= 3; b++) { const [x, y] = P(a, b); if (x < 60 || x > 560 || y < 40 || y > 620) continue; if (k++ > n) continue; K.dot(x, y, 6, col.blue); }
      K.text("area of one tile", P(1, 1)[0] + 14, P(1, 1)[1] - 20, { size: 20, bold: true, color: col.gold, halo: true });
      K.text("a lattice with \"complex multiplication\"", 310, 625, { size: 18, align: "center", color: col.muted });
      const b = K.ease(K.ph(t, 1.5, 2.5));
      K.g.globalAlpha = b;
      K.serif("Chowla–Selberg:", 790, 200, { size: 26, align: "center" });
      K.serif("the average of", 790, 250, { size: 24, align: "center", color: col.muted });
      K.math("ln(area / π)", 790, 295, { size: 32 });
      K.serif("is exactly", 790, 340, { size: 24, align: "center", color: col.muted });
      K.math("γ + ln(2π/√d) − L′/L(1, χ)", 790, 390, { size: 26 });
      K.serif("γ: Euler's constant, 0.5772…", 790, 450, { size: 21, align: "center", color: col.gold });
      K.g.globalAlpha = 1;
      return true;
    },
  }));

  // ------------------------------------------------------------------ 34 the scale: true but useless
  S("scale", () => ({
    draw(K, t) {
      const { col } = K, tt = Math.max(0, t - 0.4), ang = tt <= 0 ? 0 : 0.2 * (1 - Math.exp(-tt * 1.5) * Math.cos(tt * 5)), cx = 500, cy = 250, L = 300;
      K.line([[cx - 60, 560], [cx, cy + 6], [cx + 60, 560]], { color: col.ink, width: 3, seed: 2 });
      K.seg(cx - 140, 560, cx + 140, 560, { color: col.ink, width: 3, seed: 3 });
      const ex = (s) => [cx + s * L * Math.cos(ang), cy + s * L * Math.sin(ang)];
      const [lx, ly] = ex(-1), [rx, ry] = ex(1);
      K.seg(lx, ly, rx, ry, { color: col.ink, width: 4, seed: 5 }); K.dot(cx, cy, 9, col.ink);
      const pan = (x, y, w, c, label, h) => { K.seg(x, y, x - w / 2, y + 120, { color: col.axis, width: 1.5 }); K.seg(x, y, x + w / 2, y + 120, { color: col.axis, width: 1.5 }); K.line([[x - w / 2 - 10, y + 120], [x + w / 2 + 10, y + 120]], { color: col.ink, width: 3 }); K.box(x - w / 2, y + 120 - h, w, h, { color: c, width: 2.4, fill: c, fillAlpha: 0.25, r: 6 }); K.text(label, x, y + 120 - h / 2, { size: 22, align: "center", bold: true, color: c }); };
      pan(lx, ly, 120, col.blue, "b · G(x)", 50);
      pan(rx, ry, 220, col.red, "errors ≈ b · x", 130);
      K.serif("the inequality holds, but tells us nothing", 500, 610, { size: 26, align: "center", color: col.muted });
      return t < 4;
    },
  }));

  // ------------------------------------------------------------------ 35 the chain of lifts
  S("chain", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, m = 8, pos = reduced ? m : (t * 0.9) % (m + 2), j = Math.min(m, Math.floor(pos)), fr = pos - Math.floor(pos), moving = j < m;
      const bx0 = 30, bx1 = 230, cx0 = 250, cw = (970 - cx0) / m, top = 200, bot = 330;
      K.box(bx0, top, bx1 - bx0, bot - top, { color: col.blue, width: 2, fill: col.blue, fillAlpha: 0.12, r: 10 });
      K.text("+  +  ⋯  +", (bx0 + bx1) / 2, (top + bot) / 2, { size: 30, align: "center", bold: true, color: col.blue });
      K.text("k − 1 plus signs", (bx0 + bx1) / 2, bot + 30, { size: 18, align: "center", color: col.muted });
      for (let i = 0; i < m; i++) {
        const xa = cx0 + i * cw + 5, xb = cx0 + (i + 1) * cw - 5, flipped = i < j, act = moving && i === j, plus = flipped || (act && fr > 0.5), c = plus ? col.blue : col.red;
        K.box(xa, top, xb - xa, bot - top, { color: act ? col.gold : c, width: act ? 3.5 : 2, fill: c, fillAlpha: act ? 0.35 : 0.12, r: 10, seed: i });
        K.text(plus ? "+" : "−", (xa + xb) / 2, (top + bot) / 2, { size: 40, align: "center", bold: true, color: c });
        K.text("Θ" + (i + 1), (xa + xb) / 2, bot + 30, { size: 19, align: "center", color: act ? col.gold : col.muted, bold: act });
      }
      const kp = j === 0 ? "k − 1" : j === 1 ? "k" : "k + " + (j - 1);
      K.text(`after ${j} lift${j === 1 ? "" : "s"}:  U(${kp}, ${m - j})`, 30, 90, { size: 32, bold: true });
      K.text(j === m ? "no minus signs left" : `${m - j} minus sign${m - j === 1 ? "" : "s"} to go`, 970, 90, { size: 22, align: "right", bold: true, color: j === m ? col.green : col.muted });
      const fill = Math.min(m, j + (moving ? K.ease(fr) : 0)) / m;
      K.box(30, 460, 940, 44, { color: col.axis, width: 1.5, r: 8, sketch: false });
      K.box(30, 460, 940 * fill, 44, { color: null, fill: col.green, fillAlpha: 0.6, r: 8 });
      K.text(`rounds of the two-way count so far: ${j}`, 30, 540, { size: 24, bold: true, color: col.green });
      K.text("each round adds its own forced factors of p", 30, 580, { size: 20, color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 36 what the chain costs
  S("cost", () => ({
    draw(K, t) {
      const { col } = K, m = 10, u = 40, x0 = 120, base = 540, cw = 72;
      let tot = 0;
      for (let jj = 1; jj <= m; jj++) {
        const st = 0.3 + (jj - 1) * 0.35; if (t < st) continue;
        const f = K.ease(K.ph(t, st, st + 0.4)); tot += jj;
        for (let b = 0; b < jj; b++) { if (b / jj > f) break; K.box(x0 + (jj - 1) * cw + 6, base - (b + 1) * u + 3, cw - 12, u - 6, { color: col.green, width: 1.5, fill: col.green, fillAlpha: 0.3, r: 5, seed: jj * 13 + b }); }
        K.text(String(jj), x0 + (jj - 0.5) * cw, base + 26, { size: 20, align: "center", color: col.muted });
      }
      K.seg(x0, base, x0 + m * cw, base, { color: col.axis, width: 2 });
      K.text("lift number j", x0 + m * cw, base + 56, { size: 19, align: "right", color: col.muted });
      if (t > 0.3 + m * 0.35) K.seg(x0, base, x0 + m * cw, base - m * u, { color: col.gold, width: 2.5, dash: [8, 6] });
      K.text(`total so far: ${tot} blocks`, 120, 60, { size: 28, bold: true, color: col.green });
      K.text("for m lifts: 1 + 2 + ⋯ + m ≈ m²/2", 120, 100, { size: 22, color: col.muted });
      return t < 0.3 + m * 0.35 + 0.6;
    },
  }));

  // ------------------------------------------------------------------ 37 the inequality
  S("ineq", () => ({
    draw(K, t) {
      const { col } = K, a = K.ease(K.ph(t, 0.2, 0.9)), b = K.ease(K.ph(t, 1, 2.2)), c = K.ease(K.ph(t, 2.6, 3.4));
      K.g.globalAlpha = a;
      K.math("m · G(x)", 290, 150, { size: 52, color: col.blue }); K.math("≤", 455, 150, { size: 52 }); K.math("x", 560, 150, { size: 52, color: col.gold, italic: true }); K.math("+", 640, 150, { size: 52 }); K.math("m²", 740, 150, { size: 52, color: col.green, italic: true });
      K.g.globalAlpha = b;
      K.text("the gap,\nonce per lift", 290, 225, { size: 20, align: "center", color: col.blue, bold: true });
      K.text("overhead,\npaid once", 560, 225, { size: 20, align: "center", color: col.gold, bold: true });
      K.text("the chain's\ncost", 740, 225, { size: 20, align: "center", color: col.green, bold: true });
      K.g.globalAlpha = c;
      K.arrow(500, 300, 500, 380, { color: col.ink, width: 2.5 }); K.text("÷ m", 520, 342, { size: 26, bold: true });
      K.wash(500, 460, 270, 60, col.green, 0.15, 7);
      K.math("G(x)  ≤  x/m  +  m", 500, 460, { size: 52 });
      K.g.globalAlpha = 1;
      K.text("(in units of b)", 940, 60, { size: 18, align: "right", color: col.muted });
      return t < 3.6;
    },
  }));

  // ------------------------------------------------------------------ 38 the minimum (interactive)
  S("minimum", ({ kick }) => {
    let m = 2, touched = false, A = null;
    const X = 100, f = (v) => X / v + v, d = (v) => 1 - X / (v * v);
    return {
      enter() { if (!touched) m = 2; },
      hit(x, y) { return A && Math.hypot(A.X(m) - x, A.Y(f(m)) - y) < 34; },
      press(x, y) { if (!A) return false; const near = Math.hypot(A.X(m) - x, A.Y(f(m)) - y) < 40; if (near) touched = true; return near; },
      drag(x) { if (!A) return; const v = 1 + ((x - A.X(1)) / (A.X(40) - A.X(1))) * 39; m = Math.max(1.2, Math.min(39.5, v)); if (Math.abs(m - 10) < 0.35) m = 10; },
      draw(K, t) {
        const { col } = K;
        A = K.axes([110, 40, 830, 450], [1, 40], [0, 110]);
        A.frame({ xticks: [[1, "1"], [10, "10"], [20, "20"], [30, "30"], [40, "40"]], yticks: [[0, "0"], [50, "50"], [100, "100"]], xlabel: "chain length m" });
        if (!touched) m = 2 + 8 * K.ease(K.ph(t, 0.6, 3.6));
        A.curve((v) => X / v, 1, 40, 200, { color: col.gold, width: 1.8, dash: [6, 6] });
        A.curve((v) => v, 1, 40, 50, { color: col.green, width: 1.8, dash: [6, 6] });
        A.curve(f, 1, 40, 300, { color: col.blue, width: 3.2 });
        K.text("x/m", A.X(38), A.Y(X / 38) - 16, { size: 19, color: col.gold, bold: true, align: "right" });
        K.text("m", A.X(38), A.Y(38) - 16, { size: 19, color: col.green, bold: true, align: "right" });
        K.text("x/m + m", A.X(30), A.Y(f(30)) - 20, { size: 20, color: col.blue, bold: true, align: "center" });
        const s = d(m), y = f(m), h = 6;
        A.clip(() => K.seg(A.X(m - h), A.Y(y - s * h), A.X(m + h), A.Y(y + s * h), { color: col.gold, width: 2.4, sketch: false }));
        K.dot(A.X(m), A.Y(y), 11, col.red); K.ring(A.X(m), A.Y(y), 11, { color: K.surface, width: 2 });
        const at = Math.abs(m - 10) < 1e-6;
        K.text(`x = 100   ·   m = ${m.toFixed(1)}   ·   x/m + m = ${y.toFixed(1)}   ·   slope ${s.toFixed(2)}`, 110, 580, { size: 22, bold: true });
        if (at) K.text("the minimum: m = √100 = 10, where the bound is 20 = 2√x", 110, 616, { size: 21, bold: true, color: col.green });
        return !touched && t < 3.8;
      },
    };
  });

  // ------------------------------------------------------------------ 39 the 2/3 barrier
  S("barrier", () => ({
    draw(K, t) {
      const { col } = K, x = 1e12, A = K.axes([130, 40, 800, 470], [1, 1e9], [1e5, 1e12], { xlog: true, ylog: true });
      A.frame({ xticks: [[1, "1"], [1e3, "10³"], [1e6, "10⁶"], [1e9, "10⁹"]], yticks: [[1e6, "10⁶"], [1e8, "10⁸"], [1e10, "10¹⁰"], [1e12, "10¹²"]], xlabel: "chain length m   (x = 10¹²)" });
      const up = Math.pow(10, 9 * K.ease(K.ph(t, 0.3, 3.5)));
      A.clip(() => {
        K.seg(A.X(1), A.Y(1e6), A.X(1e9), A.Y(1e6), { color: col.green, width: 1.6, dash: [6, 6], sketch: false });
        K.seg(A.X(1), A.Y(1e8), A.X(1e9), A.Y(1e8), { color: col.red, width: 1.6, dash: [6, 6], sketch: false });
        A.curve((m) => x / m + m, 1, up, 300, { color: col.blue, width: 3 });
        A.curve((m) => x / m + m * m, 1, up, 300, { color: col.red, width: 3 });
      });
      K.text("√x", A.X(1e9) + 8, A.Y(1e6), { size: 20, bold: true, color: col.green });
      K.text("x^{2/3}", A.X(1e9) + 8, A.Y(1e8), { size: 20, bold: true, color: col.red });
      if (up >= 1e6) { K.dot(A.X(1e6), A.Y(2e6), 9, col.blue); K.text("this proof: best bound ≈ √x", A.X(1e6), A.Y(2e6) + 34, { size: 19, bold: true, color: col.blue, align: "center", halo: true }); }
      const mm = Math.cbrt(x / 2);
      if (up >= mm) { K.dot(A.X(mm), A.Y(x / mm + mm * mm), 9, col.red); K.text("compounding: stuck near x^{2/3}", A.X(mm), A.Y(x / mm + mm * mm) - 26, { size: 19, bold: true, color: col.red, align: "center", halo: true }); }
      K.text("blue: G ≤ x/m + m        red: G ≤ x/m + m²", 140, 600, { size: 21, color: col.muted });
      return t < 3.7;
    },
  }));

  // ------------------------------------------------------------------ 40 Stepanov multiplicity
  S("stepanov", () => ({
    draw(K, t) {
      const { col } = K, MS = [1, 2, 3, 4, 6], idx = Math.floor(t / 2.4) % MS.length, m = MS[idx], N = 12 / m;
      const roots = Array.from({ length: N }, (_, i) => (N === 1 ? 0 : -0.85 + (1.7 * i) / (N - 1)));
      const pf = (x) => roots.reduce((s, r) => s * Math.pow(x - r, m), 1);
      let mx = 0; for (let i = 0; i <= 400; i++) mx = Math.max(mx, Math.abs(pf(-1 + i / 200)));
      const A = K.axes([90, 70, 820, 330], [-1, 1], [-1.1, 1.1]);
      K.seg(A.X(-1), A.Y(0), A.X(1), A.Y(0), { color: col.axis, width: 2 });
      A.curve((x) => pf(x) / mx, -1, 1, 500, { color: col.blue, width: 3 });
      roots.forEach((r) => { K.dot(A.X(r), A.Y(0), 8, col.red); if (m > 1) K.text("×" + m, A.X(r), A.Y(0) + 26, { size: 17, align: "center", bold: true, color: col.red }); });
      K.text(`multiplicity m = ${m}:  ${N} point${N === 1 ? "" : "s"} × ${m} = 12 = the degree`, 90, 40, { size: 24, bold: true });
      for (let k = 0; k < 12; k++) K.box(90 + k * 68, 470, 60, 40, { color: null, fill: Math.floor(k / m) % 2 ? col.gold : col.red, fillAlpha: 0.55, r: 6 });
      K.text("the degree budget: 12 units, spent m at a time", 90, 535, { size: 19, color: col.muted });
      K.text("Stepanov:  (points) × m ≤ degree        this proof:  G(x) × m ≤ x + m²", 500, 600, { size: 21, align: "center", bold: true, color: col.purple });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 41 run it forward
  S("forward", () => ({
    draw(K, t) {
      const { col } = K, items = ["a chain of √x theta lifts", "a ceiling on one bin of primes", "a ceiling on all primes (Fourier)", "G(x) ≤ x^{½+ε}, on windows", "no zero right of ½ (Landau)", "the Riemann Hypothesis"];
      items.forEach((s, i) => {
        const y = 20 + i * 102, on = t > 0.4 + i * 0.7, last = i === items.length - 1, c = last ? col.gold : col.green;
        K.box(250, y, 500, 70, { color: on ? c : col.axis, width: on ? 2.8 : 1.6, fill: on ? c : col.grid, fillAlpha: on ? 0.18 : 1, r: 14, seed: i + 4 });
        K.text(s, 500, y + 36, { size: 24, align: "center", bold: on, color: on ? col.ink : col.muted });
        if (i) K.arrow(500, y - 30, 500, y - 4, { color: on ? col.green : col.axis, width: 2.4, head: 11, seed: i });
      });
      if (t > 0.4 + 5 * 0.7) { K.wash(500, 20 + 5 * 102 + 35, 300, 60, col.gold, 0.2, 3); K.text("✓", 780, 20 + 5 * 102 + 36, { size: 40, bold: true, color: col.gold }); }
      return t < 4.6;
    },
  }));

  // ------------------------------------------------------------------ 42 checks
  S("checks", () => ({
    draw(K, t) {
      const { col } = K, items = [
        ["✓", "built independently by several people", col.green], ["✓", "only Lean's three standard axioms", col.green],
        ["✓", "the statement is Mathlib's own RiemannHypothesis", col.green], ["✓", "replayed with Lean's standalone checker", col.green],
        ["⧗", "a second, independent checker: pending", col.gold], ["…", "peer review and a human account: not yet", col.muted],
      ];
      items.forEach(([m, s, c], i) => {
        const a = K.ease(K.ph(t, 0.3 + i * 0.5, 0.8 + i * 0.5)); if (a <= 0) return;
        const y = 70 + i * 92; K.g.globalAlpha = a;
        K.ring(140, y, 30, { color: c, width: 2.6, fill: c, fillAlpha: 0.15 });
        K.text(m, 140, y + 1, { size: 30, align: "center", bold: true, color: c });
        K.text(s, 200, y, { size: 26, color: i > 3 ? col.muted : col.ink, bold: i <= 3 });
        K.g.globalAlpha = 1;
      });
      return t < 3.8;
    },
  }));

  // ------------------------------------------------------------------ 43 the placeholder critique
  S("critique", () => ({
    draw(K, t) {
      const { col } = K;
      K.box(70, 70, 860, 90, { color: null, fill: "#1a202c", fillAlpha: 1, r: 12 });
      const g = K.g; g.save(); g.font = '24px "SF Mono", Menlo, Consolas, monospace'; g.textBaseline = "middle"; g.fillStyle = "#f6ad55"; g.fillText("def", 100, 115); g.fillStyle = "#e2e8f0"; g.fillText("anyGeometry : GeoP := fun _ _ _ =>", 160, 115); g.fillStyle = "#f6e05e"; g.fillText("True", 735, 115); g.restore();
      const a = K.ease(K.ph(t, 0.6, 1.4)), b = K.ease(K.ph(t, 1.6, 2.4));
      K.g.globalAlpha = a;
      K.box(150, 280, 260, 120, { color: col.purple, width: 2.4, fill: col.purple, fillAlpha: 0.15, r: 16, seed: 2 });
      K.text("a sealed box", 280, 325, { size: 24, align: "center", bold: true, color: col.purple });
      K.text("(the placeholder)", 280, 360, { size: 19, align: "center", color: col.muted });
      K.arrow(415, 340, 600, 340, { color: col.axis, width: 2.4, dash: [8, 7] });
      K.text("passed along…", 507, 310, { size: 20, align: "center", color: col.muted });
      K.box(610, 260, 300, 160, { color: col.green, width: 2.4, fill: col.green, fillAlpha: 0.12, r: 16, seed: 4 });
      K.text("the rest of the proof", 760, 325, { size: 23, align: "center", bold: true, color: col.green });
      K.text("never opens it", 760, 362, { size: 21, align: "center", color: col.green });
      K.g.globalAlpha = b;
      K.serif("unopened, it can't make the result false", 500, 500, { size: 28, align: "center" });
      K.serif("but the names mislead about where the work happens", 500, 550, { size: 24, align: "center", color: col.muted });
      K.g.globalAlpha = 1;
      return t < 2.6;
    },
  }));

  // ------------------------------------------------------------------ a wall since 1969
  S("wall", () => ({
    draw(K, t) {
      const { col } = K, ax = 450, c = 2.4e-6;
      K.text("clock arithmetic", 230, 200, { size: 22, bold: true, align: "center", color: col.green });
      K.seg(70, ax, 400, ax, { color: col.axis, width: 1.6, sketch: false });
      const pts = []; for (let x = 90; x <= 400; x += 3) { const y = ax - c * Math.pow(x - 170, 2) * Math.pow(x - 330, 2); if (y > 250) pts.push([x, y]); }
      K.line(pts, { color: col.green, width: 3 });
      [170, 330].forEach((x) => { K.dot(x, ax, 7, col.red); K.text("×2", x, ax + 26, { size: 18, align: "center", bold: true, color: col.red }); });
      K.text("double roots: f = f′ = 0", 230, ax + 66, { size: 19, align: "center", color: col.green });
      K.text("derivatives work", 230, ax + 94, { size: 19, align: "center", color: col.green });
      // the wall
      for (let r = 0; r < 9; r++) for (let k = 0; k < 2; k++) {
        const off = r % 2 ? 20 : 0, x = 445 + off + k * 40 - (r % 2 ? 20 : 0), y = 560 - (r + 1) * 40;
        K.box(Math.max(445, x), y, Math.min(40, 525 - Math.max(445, x)), 40, { color: col.red, width: 1.8, fill: col.red, fillAlpha: 0.14, r: 2, seed: r * 3 + k });
      }
      K.text("whole numbers", 770, 200, { size: 22, bold: true, align: "center", color: col.purple });
      K.serif("d/d(12) = ?", 770, 360, { size: 46, align: "center", color: col.purple });
      K.text("nothing to differentiate", 770, 430, { size: 19, align: "center", color: col.muted });
      // the arc over the wall
      const f = K.ease(K.ph(t, 0.5, 2.6)), arc = [];
      for (let i = 0; i <= 60 * f; i++) { const u = i / 60, x = 230 + u * 540, y = 170 - 110 * Math.sin(Math.PI * u); arc.push([x, y]); }
      if (arc.length > 1) { K.line(arc, { color: col.gold, width: 4 }); if (f >= 1) K.arrow(arc[arc.length - 3][0], arc[arc.length - 3][1], 770, 172, { color: col.gold, width: 4, sketch: false }); }
      if (f >= 1) K.text("a chain of theta lifts", 500, 32, { size: 23, bold: true, align: "center", color: col.gold });
      K.text("Stepanov, 1969", 230, 610, { size: 18, align: "center", color: col.muted }); K.text("this proof, 2026", 770, 610, { size: 18, align: "center", color: col.muted });
      return t < 2.8;
    },
  }));

  // ------------------------------------------------------------------ why six weeks
  S("sixweeks", () => ({
    draw(K, t) {
      const { col } = K, cx = 500, cy = 352, pal = [col.blue, col.red, col.gold, col.green, col.purple, col.blue];
      const names = ["representation\ntheory", "lattice\ngeometry", "Iwasawa\ntheory", "Galois\ncohomology", "complex\nmultipli-\ncation", "analytic\nnumber\ntheory"];
      const pos = names.map((n, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 3; return [cx + 300 * Math.cos(a), cy + 200 * Math.sin(a)]; });
      pos.forEach(([x, y], i) => { K.seg(x, y, cx, cy, { color: pal[i], width: 1.6, alpha: 0.5, sketch: false }); const ph = ((t * 0.5 + i / 6) % 1); K.dot(x + (cx - x) * ph, y + (cy - y) * ph, 5, pal[i], 0.9); });
      pos.forEach(([x, y], i) => {
        const c = pal[i], lines = names[i].split("\n").length;
        K.ring(x, y, 78, { color: c, width: 2.4, fill: K.surface, fillAlpha: 1 }); K.ring(x, y, 78, { color: c, width: 2.4, fill: c, fillAlpha: 0.12 });
        K.text(names[i], x, y - (lines - 1) * 11, { size: 17, align: "center", bold: true, color: c });
      });
      K.ring(cx, cy, 86, { color: col.ink, width: 2.6, fill: K.surface, fillAlpha: 0.95 });
      const g = K.g, a0 = t * 1.2; g.save(); g.strokeStyle = col.green; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 72, a0, a0 + 4.6); g.stroke(); g.restore();
      K.arrow(cx + 72 * Math.cos(a0 + 4.5), cy + 72 * Math.sin(a0 + 4.5), cx + 72 * Math.cos(a0 + 4.65), cy + 72 * Math.sin(a0 + 4.65), { color: col.green, width: 3, head: 13, sketch: false });
      K.text("try", cx, cy - 26, { size: 19, align: "center", bold: true });
      K.text("Lean checks", cx, cy, { size: 19, align: "center", bold: true, color: col.green });
      K.text("fix", cx, cy + 26, { size: 19, align: "center", bold: true });
      K.serif("6 Oct → 16 Nov 2026", cx, 24, { size: 24, align: "center", color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ if it holds
  S("ifholds", () => ({
    draw(K, t) {
      const { col } = K, items = ["Miller's fast primality test is provably correct", "every prime p has a non-square below 2(ln p)²", "primes in progressions: error only about √x", "no Siegel zeros, so many constants become explicit"];
      items.forEach((s, i) => {
        const y = 40 + i * 104, a = K.ease(K.ph(t, 0.4 + i * 0.55, 1.0 + i * 0.55));
        K.box(60, y, 880, 84, { color: col.axis, width: 1.6, fill: K.surface, fillAlpha: 0.7, r: 10, seed: i });
        K.text("if GRH", 130, y + 30, { size: 19, align: "center", color: col.muted });
        if (a > 0) { K.seg(88, y + 30, 88 + 84 * a, y + 30, { color: col.red, width: 2.6, sketch: false }); }
        if (a >= 1) K.text("✓ theorem", 130, y + 60, { size: 19, align: "center", bold: true, color: col.green });
        K.text(s, 215, y + 44, { size: 21, color: col.ink, bold: a >= 1 });
      });
      K.box(60, 470, 880, 140, { color: col.muted, width: 1.6, dash: [7, 6], r: 10, sketch: false });
      K.text("the author's previews, not in the code:", 90, 505, { size: 19, bold: true, color: col.muted });
      K.text("RH for all number fields · Weil and Deligne by signs", 90, 545, { size: 19, color: col.muted });
      K.text("· K-groups of the integers", 90, 577, { size: 19, color: col.muted });
      return t < 3.2;
    },
  }));

  // ------------------------------------------------------------------ already in the code
  S("shelf", () => ({
    draw(K, t) {
      const { col } = K, rows = [["modularity machinery", 2268], ["étale cohomology", 900], ["Capelli identities", 793], ["resolution of singularities", 500], ["homological stability", 280], ["Poitou–Tate duality", 96], ["Ferrero–Washington", 64]];
      const x0 = 410, W = 470, pal = [col.purple, col.blue, col.green, col.gold, col.red, col.blue, col.green];
      K.text("files the main theorem depends on, by library (approx.)", 60, 34, { size: 20, bold: true, color: col.muted });
      rows.forEach(([n, v], i) => {
        const y = 90 + i * 60, f = K.ease(K.ph(t, 0.2 + i * 0.15, 1.4 + i * 0.15)), w = Math.max(4, (v / 2268) * W * f);
        K.text(n, x0 - 14, y, { size: 20, align: "right", color: col.ink });
        const g = K.g; g.save(); g.fillStyle = pal[i]; g.globalAlpha = 0.75; g.fillRect(x0, y - 16, w, 32); g.restore();
        if (f >= 1) K.text((v >= 900 && v !== 2268 ? "~" : "") + v.toLocaleString("en-US"), x0 + w + 10, y, { size: 18, color: col.muted });
      });
      K.text("plus a counting theorem that works over any number field", 60, 530, { size: 20, color: col.green, bold: true });
      K.text("⚠ 444 restated theorems still need a human check", 60, 580, { size: 20, color: col.gold, bold: true });
      return t < 2.8;
    },
  }));

  // ------------------------------------------------------------------ what nobody has yet
  S("unknown", () => ({
    draw(K, t) {
      const { col } = K;
      K.wash(600, 330, 200, 200, col.purple, 0.09, 8);
      K.seg(330, 610, 330, 30, { color: col.gold, width: 2.6 });
      ZEROS.slice(0, 120).forEach((z, i) => { const y = 600 - z * 2.2; if (y > 30) K.dot(330, y, 4, col.gold, 0.5 + 0.5 * Math.sin(t * 1.5 + i)); });
      K.serif("?", 600, 330, { size: 260, align: "center", color: col.purple, alpha: 0.75, italic: true });
      K.serif("checked: yes", 600, 560, { size: 26, align: "center", color: col.green });
      K.serif("understood: not yet", 600, 600, { size: 26, align: "center", color: col.purple });
      return true;
    },
  }));

  // ------------------------------------------------------------------ 45 the end
  S("end", () => ({
    draw(K, t) {
      const { col } = K;
      K.wash(500, 320, 260, 250, col.gold, 0.08, 5);
      K.seg(500, 610, 500, 30, { color: col.gold, width: 3 });
      ZEROS.forEach((g) => { const y = 600 - ((g * 3.2 - t * 5) % 720 + 720) % 720; if (y < 25 || y > 600) return; const fd = Math.min(1, (600 - y) / 60, (y - 25) / 60); K.dot(500, y, 9, col.gold, 0.18 * fd); K.dot(500, y, 4.5, col.gold, fd); });
      K.serif("all on the line", 530, 70, { size: 26, color: col.muted });
      return true;
    },
  }));
})();
