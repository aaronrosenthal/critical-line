/* scenes-weavers.js: a sample rewrite of the picture book around one metaphor, a colony of weaver birds.
   Zeros are birds perched on wires (the critical line is the middle wire); the prime-count error is their chorus;
   the proof's machinery is weaving (later parts). */
(function () {
  "use strict";
  const S = DECK.scene, ZEROS = (window.RH_DATA && RH_DATA.zeros) || [];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const BIRD = { body: "#e2ad17", wing: "#8f7420", mask: "#2a2520", beak: "#4a4440", twig: "#8b5e34" };

  // ------------------------------------------------------------------ drawing helpers
  // a Far One: a being from "infinity". The birds only see its shadow: a 4-D cube (tesseract) projected
  // into their world, which seems to turn itself inside out as it rotates. (x, y) is its foot; h its height.
  const TV = []; for (let k = 0; k < 16; k++) TV.push([k & 1 ? 1 : -1, k & 2 ? 1 : -1, k & 4 ? 1 : -1, k & 8 ? 1 : -1]);
  const TE = []; for (let a = 0; a < 16; a++) for (let b = 0; b < 4; b++) { const c = a ^ (1 << b); if (a < c) TE.push([a, c]); }
  function farOne(K, x, y, h = 150, o = {}) {
    const g = K.g, t = (o.t || 0) * 0.45 + 0.22, cy = y - h * 0.5, R = h * 0.25, al = o.alpha ?? 1;
    const ca = Math.cos(t), sa = Math.sin(t), cb = Math.cos(t * 0.62 + 0.45), sb = Math.sin(t * 0.62 + 0.45);
    const P = TV.map(([a, b, c, d]) => {
      [a, d] = [a * ca - d * sa, a * sa + d * ca];          // turn through the hidden 4th direction
      [b, c] = [b * cb - c * sb, b * sb + c * cb];          // and an ordinary tumble
      [a, c] = [a * 0.92 - c * 0.39, a * 0.39 + c * 0.92];   // fixed tilt so the depth shows
      const k4 = 2.6 / (3.6 - d), X = a * k4, Y = b * k4, Z = c * k4, k3 = 4 / (5 - Z * 0.6);
      return [x + X * k3 * R, cy + Y * k3 * R, d];
    });
    g.save();
    const glow = g.createRadialGradient(x, cy, 0, x, cy, h * 0.55);
    glow.addColorStop(0, "rgba(217,166,64," + 0.22 * al + ")"); glow.addColorStop(1, "rgba(138,111,209,0)");
    g.fillStyle = glow; g.beginPath(); g.arc(x, cy, h * 0.55, 0, Math.PI * 2); g.fill();
    g.lineCap = "round";
    TE.forEach(([a, b]) => { const dd = (P[a][2] + P[b][2]) / 2, f = (dd + 1) / 2;   // nearer in 4-D: brighter, golder
      g.strokeStyle = f > 0.5 ? "rgba(201,148,48," + (0.45 + 0.5 * f) * al + ")" : "rgba(138,111,209," + (0.4 + 0.4 * (1 - f)) * al + ")";
      g.lineWidth = 1 + 1.6 * f; g.beginPath(); g.moveTo(P[a][0], P[a][1]); g.lineTo(P[b][0], P[b][1]); g.stroke(); });
    P.forEach(([px, py, d]) => { g.fillStyle = "rgba(255,240,200," + (0.5 + 0.4 * d) * al + ")"; g.beginPath(); g.arc(px, py, 1.6 + 1.2 * (d + 1), 0, Math.PI * 2); g.fill(); });
    g.restore();
  }
  // a perched weaver: (x, y) is where its feet touch the wire; s = scale; o.flip faces left; o.sing draws song arcs
  function bird(K, x, y, s = 1, o = {}) {
    const g = K.g, d = o.flip ? -1 : 1;
    g.save(); g.globalAlpha = o.alpha ?? 1; g.translate(x, y); g.scale(d * s, s);
    if (o.ghost) { g.setLineDash([4, 4]); }
    const fill = (c) => { if (o.ghost) { g.strokeStyle = o.color || K.col.muted; g.lineWidth = 1.6 / s; g.stroke(); } else { g.fillStyle = c; g.fill(); } };
    g.strokeStyle = BIRD.mask; g.lineWidth = 2 / s;
    if (!o.ghost) { g.beginPath(); g.moveTo(-4, -8); g.lineTo(-6, 0); g.moveTo(4, -8); g.lineTo(5, 0); g.stroke(); }   // legs
    g.beginPath(); g.moveTo(-14, -16); g.lineTo(-30, -6); g.lineTo(-27, -18); g.closePath(); fill(BIRD.wing);            // tail
    g.beginPath(); g.ellipse(0, -18, 17, 12, -0.15, 0, Math.PI * 2); fill(o.color || BIRD.body);                       // body
    if (!o.ghost) { g.beginPath(); g.ellipse(-4, -19, 10, 7, -0.35, 0, Math.PI * 2); g.fillStyle = BIRD.wing; g.fill(); } // wing
    g.beginPath(); g.arc(13, -31, 9, 0, Math.PI * 2); fill(o.color || BIRD.body);                                     // head
    if (!o.ghost) {
      g.beginPath(); g.arc(13, -31, 9, -1.1, 1.3); g.closePath(); g.fillStyle = BIRD.mask; g.fill();                   // black mask
      g.beginPath(); g.moveTo(20, -34); g.lineTo(30, -30); g.lineTo(20, -27); g.closePath(); g.fillStyle = BIRD.beak; g.fill();
      g.beginPath(); g.arc(15, -33, 1.8, 0, Math.PI * 2); g.fillStyle = "#f4e3a1"; g.fill();                         // eye
    }
    if (o.sing) { g.strokeStyle = o.singColor || K.col.gold; g.lineWidth = 2 / s; g.setLineDash([]);
      for (let k = 1; k <= 3; k++) { const ph = ((o.sing * 1.2 + k / 3) % 1); g.globalAlpha = (o.alpha ?? 1) * (1 - ph); g.beginPath(); g.arc(30, -30, 6 + ph * 22, -0.6, 0.6); g.stroke(); } }
    g.restore();
  }
  // three wires between two poles; returns y(x) for each wire (with a gentle sag)
  function wires(K, x0, x1, ys, o = {}) {
    const { col } = K, g = K.g, sag = o.sag ?? 14;
    const yAt = (i, x) => ys[i] + sag * (1 - Math.pow((2 * (x - x0)) / (x1 - x0) - 1, 2));
    [x0, x1].forEach((px) => { g.save(); g.fillStyle = o.pole || "#6b4f33"; g.fillRect(px - 5, Math.min(...ys) - 40, 10, Math.max(...ys) - Math.min(...ys) + 110); g.restore(); });
    ys.forEach((_, i) => { const pts = []; for (let k = 0; k <= 40; k++) { const x = x0 + ((x1 - x0) * k) / 40; pts.push([x, yAt(i, x)]); }
      K.line(pts, { color: i === (o.mid ?? 1) ? (o.midColor || col.gold) : col.axis, width: i === (o.mid ?? 1) ? 3 : 2, sketch: false }); });
    return yAt;
  }
  // a hanging weaver nest: a green grass teardrop tied to a branch at its tip, with a round doorway low on one side
  function nest(K, cx, top, w, h, o = {}) {
    const g = K.g; let sd = Math.round(cx * 7 + top * 13 + w) % 2147483646 + 1;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const grass = ["#9aa64e", "#b9c26c", "#7d8a3a", "#cfd58e", "#6a7630", "#a9a35a"];
    const V = 0.64;                                                   // widest point, as a fraction of the height
    const hw = (v) => v < V ? (w / 2) * Math.pow(1 - Math.pow((V - v) / V, 1.35), 0.75) : (w / 2) * Math.sqrt(Math.max(0, 1 - Math.pow((v - V) / (1 - V), 2)));
    const edge = []; for (let k = 0; k <= 60; k++) { const v = k / 60; edge.push([v, hw(v)]); }
    const shape = () => { g.beginPath(); edge.forEach(([v, r], i) => (i ? g.lineTo(cx + r, top + v * h) : g.moveTo(cx + r, top + v * h)));
      for (let i = edge.length - 1; i >= 0; i--) g.lineTo(cx - edge[i][1], top + edge[i][0] * h); g.closePath(); };
    g.save(); g.globalAlpha = o.alpha ?? 1; g.lineCap = "round";
    const grd = g.createLinearGradient(cx - w / 2, top, cx + w / 2, top + h);
    grd.addColorStop(0, "#bcc472"); grd.addColorStop(1, "#6f7b34");
    shape(); g.fillStyle = grd; g.fill();
    g.save(); shape(); g.clip();
    for (let k = 0; k < 220; k++) {                                   // fine grass, wrapped loosely round the pouch
      const v = rnd(), y = top + v * h, x = cx + (rnd() - 0.5) * 2 * hw(v), L = 0.12 * w + rnd() * 0.3 * w, a = (rnd() - 0.5) * 1.6;
      g.strokeStyle = grass[Math.floor(rnd() * grass.length)]; g.lineWidth = 0.6 + rnd() * 0.7; g.globalAlpha = (o.alpha ?? 1) * (0.35 + rnd() * 0.35);
      g.beginPath(); g.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); g.quadraticCurveTo(x, y + 0.02 * h * (rnd() - 0.3), x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); g.stroke();
    }
    g.restore(); g.globalAlpha = o.alpha ?? 1;
    for (let k = 0; k < 16; k++) {                                    // a few loose blades at the edge: loose blades sticking out
      const i = Math.floor(rnd() * edge.length), [v, r] = edge[i], sgn = rnd() < 0.5 ? -1 : 1, ex = cx + sgn * r, ey = top + v * h;
      const a = (sgn > 0 ? 0 : Math.PI) + Math.PI / 2 * 0.8 * sgn + (rnd() - 0.5) * 0.5, L = 3 + rnd() * 0.07 * w;
      g.strokeStyle = grass[k % grass.length]; g.lineWidth = 0.7; g.globalAlpha = (o.alpha ?? 1) * 0.6;
      g.beginPath(); g.moveTo(ex - Math.cos(a) * 3, ey - Math.sin(a) * 3); g.lineTo(ex + Math.cos(a) * L, ey + Math.sin(a) * L); g.stroke();
    }
    // the doorway: a dark round opening low on one side, with a thick grassy lip
    const dx = cx + 0.07 * w, dy = top + 0.62 * h, drx = 0.31 * w, dry = 0.165 * h;
    const dg = g.createRadialGradient(dx - 0.05 * w, dy - 0.03 * h, 1, dx, dy, drx);
    dg.addColorStop(0, "#1f1d0e"); dg.addColorStop(1, "#4a4a22");
    g.beginPath(); g.ellipse(dx, dy, drx, dry, -0.12, 0, Math.PI * 2); g.fillStyle = dg; g.fill();
    g.globalAlpha = o.alpha ?? 1;
    for (let k = 0; k < 26; k++) {                                    // the lip, thickest along the bottom
      const th = rnd() * Math.PI * 2, thick = Math.sin(th) > 0 ? 1 : 0.5, rr = 1 + (rnd() * 0.25 + 0.05) * thick;
      const ex = dx + Math.cos(th) * drx * rr, ey = dy + Math.sin(th) * dry * rr, a = th + Math.PI / 2 + (rnd() - 0.5) * 0.3, L = 0.08 * w + rnd() * 0.06 * w;
      g.strokeStyle = grass[(k + 1) % grass.length]; g.lineWidth = 1 + rnd() * (thick > 0.6 ? 1.6 : 0.8);
      g.beginPath(); g.moveTo(ex - Math.cos(a) * L / 2, ey - Math.sin(a) * L / 2); g.lineTo(ex + Math.cos(a) * L / 2, ey + Math.sin(a) * L / 2); g.stroke();
    }
    for (let k = 0; k < 3; k++) { const ex = cx + (rnd() - 0.5) * 0.08 * w; g.strokeStyle = grass[k % grass.length]; g.lineWidth = 1.3;   // blades knotted round the branch
      g.beginPath(); g.moveTo(ex, top + 0.08 * h); g.quadraticCurveTo(ex + (rnd() - 0.5) * 16, top - 4, ex + (rnd() - 0.5) * 12, top - 10); g.stroke(); }
    g.restore();
  }
  function twig(K, x, y, len, ang, o = {}) {
    const g = K.g; g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = o.color || BIRD.twig; g.lineCap = "round"; g.lineWidth = o.width || 6;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(len, 0); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(len * 0.62, 0); g.lineTo(len * 0.62 + 10, -7); g.stroke();
    g.restore();
  }

  // a bird off the middle wire stands on a small twig perch
  function perch(K, x, y) { K.seg(x - 34, y, x + 30, y - 2, { color: BIRD.twig, width: 5 }); }
  function heightPanel(K, wy, col) {
    [[0, "0"], [0.5, "½"], [1, "1"]].forEach(([b, l]) => { K.seg(60, wy(b), 160, wy(b), { color: b === 0.5 ? col.gold : col.axis, width: b === 0.5 ? 3 : 2, sketch: false }); K.text(l, 48, wy(b), { size: 17, align: "right", bold: b === 0.5, color: b === 0.5 ? col.gold : col.muted }); });
  }

  // ψ(x) − x, sampled for the chorus pages
  let PSI = null;
  function psiData() {
    if (PSI) return PSI;
    const N = 100000, lam = new Float64Array(N + 1), comp = new Uint8Array(N + 1);
    for (let p = 2; p <= N; p++) if (!comp[p]) { for (let q = p * p; q <= N; q += p) comp[q] = 1; for (let pk = p; pk <= N; pk *= p) lam[pk] = Math.log(p); }
    const xs = [], lo = [], hi = []; let psi = 0, B = 100;
    for (let n = 1, b0 = 1; n <= N; n++) { psi += lam[n]; const e = psi - n; if (n % B === 1 || n === 1) { xs.push(n); lo.push(e); hi.push(e); } else { lo[lo.length - 1] = Math.min(lo[lo.length - 1], e); hi[hi.length - 1] = Math.max(hi[hi.length - 1], e); } }
    return (PSI = { xs, lo, hi });
  }

  // ------------------------------------------------------------------ cover
  S("w-cover", () => ({
    draw(K, t) {
      const { col } = K;
      K.wash(170, 120, 70, 70, col.gold, 0.22, 4);
      K.dot(170, 120, 34, col.gold, 0.55);
      const yAt = wires(K, 60, 940, [210, 330, 450]);
      ZEROS.slice(0, 11).forEach((z, i) => { const x = 110 + (z - 14) * 15.5; bird(K, x, yAt(1, x), 0.85, { flip: i % 3 === 0, alpha: 0.95 }); });
      K.seg(730, 432, 940, 420, { color: BIRD.twig, width: 6 }); nest(K, 830, 428, 84, 130);
      return false;
    },
  }));

  // ------------------------------------------------------------------ meet the colony
  S("w-colony", () => ({
    draw(K, t) {
      const { col } = K;
      K.seg(80, 140, 920, 120, { color: BIRD.twig, width: 9 });
      [260, 520, 760].forEach((x, i) => nest(K, x, 140 - (20 * (x - 80)) / 840 + 2, 84 + i * 6, 130 + i * 8));
      const bob = Math.sin(t * 2) * 3;
      bird(K, 420, 470 + bob, 3.2, { sing: t });
      K.seg(250, 472, 640, 472, { color: BIRD.twig, width: 7 });
      K.serif("Kito", 430, 560, { size: 34, align: "center", color: col.ink });
      K.seg(690, 474, 840, 470, { color: BIRD.twig, width: 6 });
      bird(K, 760, 472, 1.6, { flip: true, color: "#c9b27a" });
      K.serif("old Grey", 760, 530, { size: 24, align: "center", color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ twigs that can't be split
  S("w-twigs", ({ reduced }) => {
    // Grey ties loose prime twigs into bundles: 12 = 2·2·3, 30, 45, 13 (a twig on its own), 60, 105.
    const NS = [12, 30, 45, 13, 60, 105], HEAP = [2, 3, 5, 7, 11, 13], PER = 3.4, SC = 225, HS = 0.265;
    const HX = []; { let x = 60; HEAP.forEach((p) => { HX.push(x); x += Math.log(p) * SC * HS + 42; }); }
    const fac = (n) => { const r = []; for (let p = 2; n > 1; p++) while (n % p === 0) { r.push(p); n /= p; } return r; };
    const TC = (K, p) => ({ 2: K.col.blue, 3: "#c47a2a", 5: K.col.green, 7: K.col.purple })[p] || BIRD.twig;
    const slot = (p, c) => { const k = HEAP.indexOf(p); return [HX[k] + c * 6, 560 - c * 12, -0.04 + 0.05 * c]; };
    return {
      draw(K, t) {
        const { col } = K, g = K.g, k = reduced ? 4 : Math.floor(t / PER) % NS.length, n = NS[k], f = fac(n);
        const ph = reduced ? 1 : (t % PER) / PER, fly = K.ease(Math.min(1, ph / 0.45)), tie = K.ease(Math.max(0, Math.min(1, (ph - 0.45) / 0.15)));
        // the ground and the heap of loose twigs that can't be split
        K.seg(40, 572, 960, 572, { color: col.axis, width: 2 });
        K.text("loose twigs that can't be split", 60, 608, { size: 19, color: col.muted });
        HEAP.forEach((p) => { for (let c = 0; c < 3; c++) { const [x, y, a] = slot(p, c); twig(K, x, y, Math.log(p) * SC * HS, a, { color: TC(K, p), width: 7 }); }
          K.text(String(p), slot(p, 0)[0] + Math.log(p) * SC * HS / 2, 506, { size: 20, bold: true, color: TC(K, p) }); });
        // the bundle: twigs laid side by side, centred, then tied with two cords
        const cx = 430, top = 215, gap = 19, used = {};
        f.forEach((p, i) => {
          const c = used[p] = (used[p] || 0) + 1, [hx, hy, ha] = slot(p, Math.min(2, c - 1)), len = Math.log(p) * SC;
          const fan = (i - (f.length - 1) / 2) * 0.035, bx = cx - (len / 2) * Math.cos(fan), by = top + i * gap - (len / 2) * Math.sin(fan);
          const x = hx + (bx - hx) * fly, y = hy + (by - hy) * fly - Math.sin(fly * Math.PI) * 60, a = ha + (fan - ha) * fly;
          twig(K, x, y, len, a, { color: TC(K, p), width: 20 });
        });
        const h = (f.length - 1) * gap;
        if (tie > 0) {
          g.save(); g.globalAlpha = tie; g.strokeStyle = "#c9a56a"; g.lineWidth = 6; g.lineCap = "round";
          [-34, 34].forEach((dx) => { for (let w = 0; w < 3; w++) { const ox = cx + dx + (w - 1) * 8;   // three turns of cord
              g.beginPath(); g.moveTo(ox - 6, top - 16); g.lineTo(ox + 6, top + h + 16); g.stroke(); } });
          g.fillStyle = "#b8925a"; g.beginPath(); g.arc(cx + 40, top + h + 18, 6, 0, Math.PI * 2); g.fill();
          // the tag hanging from the knot
          g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx + 40, top + h + 20); g.lineTo(cx + 52, top + h + 52); g.stroke(); g.restore();
          K.box(cx + 15, top + h + 52, 74, 40, { fill: col.surface, fillAlpha: 0.95 * tie, color: "#c9a56a", r: 6, sketch: false });
          K.text(String(n), cx + 52, top + h + 73, { size: 24, bold: true, align: "center" });
          const eq = f.length === 1 ? `${n} is a single twig: it can't be split` : `${n} = ${f.join(" × ")}`;
          K.text(eq, cx, 92, { size: 32, bold: true, align: "center", color: col.ink });
          const logs = f.length === 1 ? `log ${n}` : f.map((p) => `log ${p}`).join(" + ") + ` = log ${n}`;
          K.text(`add the twig lengths:  ${logs}`, cx, top + h + 122, { size: 19, align: "center", color: col.muted });
        }
        // old Grey, doing the tying
        perch(K, 880, top - 60); bird(K, 880, top - 62, 1.5, { flip: true, color: "#c9b27a" });
        K.text("old Grey ties it", 880, top - 10, { size: 16, align: "center", color: col.muted });
        return !reduced;
      },
    };
  });

  // ------------------------------------------------------------------ the chorus at dusk
  S("w-chorus", ({ reduced }) => {
    // top: Kito calls the numbers; at each prime power a twig of length log p goes on the staircase, beside the smooth guess y = x.
    // bottom: zoom out to 100,000 — the gap between staircase and guess is the chorus, sung by birds on a wire at dusk.
    const XM = 42, PP = []; { let s = 0; for (let n = 2; n <= XM; n++) { let m = n, p = 0; for (let q = 2; q <= m; q++) if (m % q === 0) { p = q; break; } while (m % p === 0) m /= p; if (m === 1) { s += Math.log(p); PP.push([n, p, s]); } } }
    const TC = (K, p) => ({ 2: K.col.blue, 3: "#c47a2a", 5: K.col.green, 7: K.col.purple })[p] || BIRD.twig;
    return {
      draw(K, t) {
        const { col } = K, g = K.g, W = psiData();
        // ---- the close-up count
        const A = K.axes([110, 46, 560, 200], [0, XM], [0, XM]);
        A.frame({ xticks: [[0, "0"], [10, "10"], [20, "20"], [30, "30"], [40, "40"]], yticks: [[0, "0"], [20, "20"], [40, "40"]] });
        const xnow = reduced ? XM : Math.min(XM, 1 + K.ph(t, 0.4, 10.4) * (XM - 1));
        K.line([[A.X(0), A.Y(0)], [A.X(xnow), A.Y(xnow)]], { color: col.muted, width: 2, dash: [7, 6] });
        K.text("smooth guess", A.X(XM) - 4, A.Y(XM) - 14, { size: 16, align: "right", color: col.muted });
        let prev = 0, px = 0, last = null;
        PP.forEach(([n, p, s]) => { if (n > xnow) return;
          K.seg(A.X(px), A.Y(prev), A.X(n), A.Y(prev), { color: col.axis, width: 1.5, sketch: false });
          g.save(); g.strokeStyle = TC(K, p); g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.moveTo(A.X(n), A.Y(prev)); g.lineTo(A.X(n), A.Y(s)); g.stroke(); g.restore();
          prev = s; px = n; last = [n, p]; });
        K.seg(A.X(px), A.Y(prev), A.X(xnow), A.Y(prev), { color: col.axis, width: 1.5, sketch: false });
        K.text("twigs counted so far", 130, 62, { size: 17, bold: true, color: BIRD.twig });
        // the gap now, as a little red bar
        K.seg(A.X(xnow) + 8, A.Y(xnow), A.X(xnow) + 8, A.Y(prev), { color: col.red, width: 3, sketch: false });
        // Kito on the counting wire, calling the numbers
        const wy = 318; K.seg(110, wy, 670, wy, { color: col.axis, width: 2, sketch: false });
        const kx = A.X(xnow); bird(K, kx, wy, 0.75, { sing: last && xnow - last[0] < 0.9 ? t : 0 });
        if (last && xnow - last[0] < 0.9) K.text(`${last[0]}: +log ${last[1]}`, kx + 34, wy - 14, { size: 17, bold: true, color: TC(K, last[1]) });
        else K.text(String(Math.floor(xnow)), kx + 34, wy - 14, { size: 17, color: col.muted });
        K.text("Kito calls each number.", 712, 96, { size: 17, color: col.muted }); K.text("At every prime power p^{k},", 712, 120, { size: 17, color: col.muted }); K.text("a twig of length log p", 712, 144, { size: 17, color: col.muted }); K.text("goes on the stack.", 712, 168, { size: 17, color: col.muted });
        K.text("red: how far the count is", 712, 208, { size: 17, color: col.red }); K.text("from the smooth guess", 712, 232, { size: 17, color: col.red });
        // ---- zoom out: the chorus at dusk
        const dusk = g.createLinearGradient(0, 335, 0, 640); dusk.addColorStop(0, "rgba(226,173,23,0.13)"); dusk.addColorStop(1, "rgba(138,111,209,0.10)");
        g.fillStyle = dusk; g.fillRect(60, 335, 900, 300);
        const B = K.axes([110, 360, 720, 190], [0, 100000], [-520, 520]);
        B.curve((x) => Math.sqrt(x), 1, 100000, 160, { color: col.green, width: 2, dash: [8, 6] });
        B.curve((x) => -Math.sqrt(x), 1, 100000, 160, { color: col.green, width: 2, dash: [8, 6] });
        K.text("±√x", B.X(100000) + 8, B.Y(316), { size: 18, bold: true, color: col.green });
        const upto = reduced ? W.xs.length : Math.floor(K.ease(K.ph(t, 10.8, 14.8)) * W.xs.length);
        g.save(); g.strokeStyle = col.blue; g.lineWidth = 2;
        for (let i = 0; i < upto; i++) { g.beginPath(); g.moveTo(B.X(W.xs[i]), B.Y(W.lo[i])); g.lineTo(B.X(W.xs[i]), B.Y(W.hi[i])); g.stroke(); }
        g.restore();
        K.text("zoom out to 100,000: the gap rises and falls, the colony's chorus", 110, 350, { size: 17, bold: true, color: col.blue });
        const cy = 600; K.seg(110, cy, 830, cy, { color: col.axis, width: 2, sketch: false });
        for (let i = 0; i < 9; i++) bird(K, 140 + i * 82, cy, 0.6, { flip: i % 3 === 1, sing: upto > 0 && i % 2 === 0 ? t + i * 0.3 : 0, alpha: 0.95 });
        return !reduced && t < 15;
      },
    };
  });

  // ------------------------------------------------------------------ Grey tosses seeds
  S("w-coins", ({ reduced }) => {
    const NST = 400, rng = (seed) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
    const runs = []; for (let w = 0; w < 7; w++) { const r = rng(31 + w * 7), steps = [], a = [0]; let s = 0; for (let i = 0; i < NST; i++) { const v = r() < 0.5 ? 1 : -1; steps.push(v); s += v; a.push(s); } runs.push({ steps, a }); }
    const seed = (K, x, y, light, ang = 0, sc = 1) => { const g = K.g; g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc);
      g.beginPath(); g.ellipse(0, 0, 9, 5.5, 0, 0, Math.PI * 2); g.fillStyle = light ? "#f2e3b8" : "#5a3d22"; g.fill(); g.lineWidth = 1.4; g.strokeStyle = "#8b5e34"; g.stroke(); g.restore(); };
    return {
      draw(K, t) {
        // timing: the first 34 tosses one by one (about 7 a second), then the score walk eases on to 400
        const { col } = K, R = runs[0], ROW = 34, RATE = 7, T0 = 0.6, T1 = T0 + ROW / RATE, T2 = T1 + 8;
        const nf = reduced ? NST : t < T1 ? Math.max(0, (t - T0) * RATE) : ROW + K.ease(K.ph(t, T1, T2)) * (NST - ROW), n = Math.floor(nf);
        // Grey on a branch, tossing
        K.seg(40, 132, 210, 126, { color: BIRD.twig, width: 7 });
        bird(K, 140, 128, 1.45, { color: "#c9b27a" });
        K.text("old Grey tosses", 125, 160, { size: 16, align: "center", color: col.muted });
        // seeds in the air: each of the first 34 flies for 0.45 s along a smooth arc and lands in its own slot
        const gy = 262, slotX = (k) => 272 + k * 19.5, FLY = 0.45;
        if (!reduced) for (let k = 0; k < ROW; k++) { const land = T0 + (k + 1) / RATE, u = 1 - (land - t) / FLY; if (u <= 0 || u >= 1) continue;
          const ex = slotX(k), sx = 190, sy = 104, e = K.ease(u), x = sx + (ex - sx) * e, y = sy + (gy - sy) * u - Math.sin(u * Math.PI) * 70;
          seed(K, x, y, R.steps[k] > 0, u * 4); }
        // the seeds that have landed stay where they fell
        K.seg(250, gy + 12, 940, gy + 12, { color: col.axis, width: 2 });
        for (let k = 0; k < Math.min(n, ROW); k++) seed(K, slotX(k), gy, R.steps[k] > 0, 0.25 * Math.sin(k * 1.7));
        if (n >= ROW) K.text("the first 34 tosses", 940, gy + 34, { size: 15, align: "right", color: col.muted });
        // the score
        const L = R.steps.slice(0, n).filter((v) => v > 0).length, D = n - L, sc = L - D;
        K.box(700, 40, 250, 96, { fill: col.surface, fillAlpha: 0.9, color: col.axis, r: 8, sketch: false });
        seed(K, 722, 66, true); K.text(`light  ${L}`, 740, 66, { size: 19 }); seed(K, 722, 96, false); K.text(`dark  ${D}`, 740, 96, { size: 19 });
        K.text(`score ${sc >= 0 ? "+" : "−"}${Math.abs(sc)}`, 935, 81, { size: 22, bold: true, align: "right", color: col.gold });
        K.text(`${n} tosses`, 930, 122, { size: 15, align: "right", color: col.muted });
        // the walk of the score, with six other nights' runs behind it, inside ±√n
        const A = K.axes([110, 320, 740, 240], [0, NST], [-45, 45]);
        A.frame({ xticks: [[0, "0"], [100, "100"], [200, "200"], [300, "300"], [400, "400"]], yticks: [[-40, "−40"], [0, "0"], [40, "40"]], xlabel: "tosses n" });
        A.curve((m) => Math.sqrt(m), 0, NST, 120, { color: col.green, width: 2.4, dash: [8, 6] });
        A.curve((m) => -Math.sqrt(m), 0, NST, 120, { color: col.green, width: 2.4, dash: [8, 6] });
        K.text("±√n", A.X(NST) + 8, A.Y(20), { size: 20, bold: true, color: col.green });
        const pal = [col.gold, col.blue, col.red, col.purple, col.blue, col.red, col.purple];
        runs.forEach((r, k) => { if (k) K.line(r.a.slice(0, n + 1).map((v, i) => [A.X(i), A.Y(v)]), { color: pal[k], width: 1.4, alpha: 0.35 }); });
        K.line(R.a.slice(0, n + 1).map((v, i) => [A.X(i), A.Y(v)]), { color: col.gold, width: 3 });
        K.dot(A.X(n), A.Y(R.a[n]), 5, col.gold);
        K.text("gold: tonight's score   faint: six other nights", 120, 306, { size: 16, color: col.muted });
        return !reduced && t < T2 + 0.2;
      },
    };
  });

  // ------------------------------------------------------------------ every voice is a bird
  S("w-voices", ({ reduced }) => {
    const xs = []; for (let i = 0; i <= 500; i++) xs.push(2 + (i / 500) * 48);
    const psi = (x) => { let s = 0; for (let n = 2; n <= x; n++) { let m = n, p = 0; for (let q = 2; q * q <= m; q++) if (m % q === 0) { p = q; break; } if (!p) p = m; while (m % p === 0) m /= p; if (m === 1) s += Math.log(p); } return s; };
    const PS = xs.map(psi);
    return {
      draw(K, t) {
        const { col } = K, A = K.axes([120, 40, 800, 380], [2, 50], [0, 55]);
        A.frame({ xticks: [[10, "10"], [20, "20"], [30, "30"], [40, "40"], [50, "50"]], yticks: [[0, "0"], [25, "25"], [50, "50"]], xlabel: "x" });
        const N = reduced ? 100 : Math.max(0, Math.min(100, Math.floor(Math.pow(Math.max(0, t - 0.5) / 5, 1.6) * 100)));
        A.curve((x) => PS[Math.round(((x - 2) / 48) * 500)], 2, 50, 500, { color: col.axis, width: 2.5 });
        const f = (x) => { const L = Math.log(x), r = Math.sqrt(x); let s = x - Math.log(2 * Math.PI) - 0.5 * Math.log(1 - 1 / (x * x)); for (let k = 0; k < N; k++) { const gm = ZEROS[k], th = gm * L; s -= (2 * r * (0.5 * Math.cos(th) + gm * Math.sin(th))) / (0.25 + gm * gm); } return s; };
        A.clip(() => A.curve(f, 2.05, 50, 700, { color: col.blue, width: 2.4, sketch: false }));
        K.text("grey: the true count ψ(x)", 140, 60, { size: 19, color: col.muted, halo: true });
        K.text(`blue: x plus the voices of ${N} bird${N === 1 ? "" : "s"}`, 140, 88, { size: 19, bold: true, color: col.blue, halo: true });
        // the birds on a wire, by pitch
        const y0 = 540; K.seg(120, y0, 920, y0, { color: col.gold, width: 3, sketch: false });
        for (let k = 0; k < Math.min(N, 30); k++) { const x = 120 + (ZEROS[k] - 10) * 7.6; if (x < 915) bird(K, x, y0, 0.5, { alpha: 0.95 }); }
        K.text("position along the wire = pitch", 920, y0 + 34, { size: 17, align: "right", color: col.muted });
        return !reduced && t < 6;
      },
    };
  });

  // ------------------------------------------------------------------ three wires
  S("w-wires", () => ({
    draw(K, t) {
      const { col } = K, yAt = wires(K, 120, 940, [150, 320, 490], { sag: 10 });
      K.text("real part 1", 108, 150, { size: 18, align: "right", color: col.muted });
      K.text("½", 108, 320, { size: 22, align: "right", bold: true, color: col.gold });
      K.text("real part 0", 108, 490, { size: 18, align: "right", color: col.muted });
      ZEROS.slice(0, 13).forEach((z, i) => { const x = 160 + (z - 14) * 15; if (x < 920) bird(K, x, yAt(1, x), 0.7, { flip: i % 4 === 1 }); });
      const f = K.ease(K.ph(t, 1, 2));
      if (f > 0) {
        const gx = 640, d = 90;
        bird(K, gx, yAt(1, gx) - d, 1, { ghost: true, alpha: f, color: col.red });
        bird(K, gx, yAt(1, gx) + d, 1, { ghost: true, alpha: f, color: col.red });
        K.seg(gx, yAt(1, gx) - d + 8, gx, yAt(1, gx) + d - 40, { color: col.red, width: 1.4, dash: [4, 5], sketch: false, alpha: f });
        K.text("a mirror pair off the wire:", gx - 40, yAt(1, gx) - d - 38, { size: 18, bold: true, align: "right", color: col.red, alpha: f, halo: true });
        K.text("never seen", gx - 40, yAt(1, gx) - d - 14, { size: 18, bold: true, align: "right", color: col.red, alpha: f, halo: true });
      }
      K.text("birds placed at the first 13 zeros", 120, 600, { size: 17, color: col.muted });
      return t < 2.2;
    },
  }));


  // ------------------------------------------------------------------ a perch is where the night's flight passes home
  // Kito's position at time t is ζ(½ + i·t); the flight passes through 0 exactly at the zeros
  let FLIGHT = null;
  function flightCurve(T1) {
    if (FLIGHT) return FLIGHT;
    const dt = 0.02, pts = [];
    for (let tt = 0; tt <= T1 + 1e-9; tt += dt) pts.push(RH.zeta(0.5, tt));
    return (FLIGHT = { dt, pts });
  }
  S("w-flight", ({ reduced }) => {
    const T1 = 40, sx0 = 80, sx1 = 920, sy = 596, DUR = 9;
    const tx = (v) => sx0 + (v / T1) * (sx1 - sx0);
    const Z = ZEROS.filter((z) => z < T1);
    let tt = reduced ? T1 : 0, touched = false;
    const set = (x) => { const v = ((clamp(x, sx0, sx1) - sx0) / (sx1 - sx0)) * T1, z = Z.find((q) => Math.abs(q - v) < 0.35); tt = z || v; };
    const near = (x, y) => y > sy - 50 && y < sy + 30 && x > sx0 - 20 && x < sx1 + 20;
    return {
      hit: near,
      press(x, y) { if (!near(x, y)) return false; touched = true; set(x); return true; },
      drag(x) { set(x); },
      draw(K, t) {
        const { col } = K, g = K.g, ox = 250, oy = 290, u = 128, F = flightCurve(T1);
        if (!touched && !reduced) tt = T1 * K.ph(t, 0.4, 0.4 + DUR);
        const P = ([x, y]) => [ox + x * u, oy - y * u];
        K.seg(40, oy, 650, oy, { color: col.axis, width: 1, sketch: false, alpha: 0.6 });
        K.seg(ox, 40, ox, 530, { color: col.axis, width: 1, sketch: false, alpha: 0.6 });
        // the trail so far
        const n = Math.min(F.pts.length - 1, Math.round(tt / F.dt));
        g.save(); g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = col.blue; g.lineWidth = 2.6; g.globalAlpha = 0.85; g.beginPath();
        for (let i = 0; i <= n; i++) { const [x, y] = P(F.pts[i]); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore();
        // the home perch at 0, flashing when the flight passes over it
        perch(K, ox, oy + 2);
        const last = Z.filter((z) => z <= tt + 1e-9).pop(), since = last === undefined || tt - last > 0.6 ? 99 : (tt - last) / T1 * DUR;
        const onZero = Z.some((z) => Math.abs(z - tt) < 1e-9);
        if (onZero || since < 0.9) { const k = onZero ? 1 : 1 - since / 0.9; K.ring(ox, oy - 14, 26 + 20 * (1 - k), { color: col.gold, width: 3, alpha: k }); }
        const cur = P(F.pts[n]), prev = P(F.pts[Math.max(0, n - 3)]);
        bird(K, cur[0], cur[1], 0.7, { flip: cur[0] < prev[0] });
        K.text("home perch", ox - 30, oy + 30, { size: 16, align: "right", color: col.muted, halo: true });
        // read-out
        K.serif("Kito's night flight", 680, 62, { size: 24 });
        K.text("the hour of the night", 680, 96, { size: 16, color: col.muted });
        K.math(`${tt.toFixed(2)}`, 680, 136, { size: 36, color: col.purple, align: "left" });
        const passed = Z.filter((z) => z <= tt + 1e-9).length;
        K.text(`times over the home perch: ${passed}`, 680, 180, { size: 18, color: col.muted });
        if (onZero || since < 1.2) { K.text("right over the home perch!", 680, 232, { size: 22, bold: true, color: col.gold }); K.text(`a bird lands at ${(onZero ? tt : last).toFixed(2)}`, 680, 262, { size: 22, bold: true, color: col.gold }); }
        // the middle wire: time runs along it, and a bird lands at each pass
        K.seg(sx0, sy, sx1, sy, { color: col.gold, width: 3, sketch: false });
        [0, 10, 20, 30, 40].forEach((v) => K.text(String(v), tx(v), sy + 24, { size: 15, align: "center", color: col.muted }));
        Z.forEach((z) => { if (z <= tt + 1e-9) bird(K, tx(z), sy, 0.55); });
        K.seg(tx(tt), sy - 44, tx(tt), sy + 6, { color: col.purple, width: 2.5, sketch: false }); K.dot(tx(tt), sy - 44, 6, col.purple);
        K.text("the middle wire: the hours of the night run along it (drag)", sx0, sy - 68, { size: 16, align: "left", color: col.muted, halo: true });
        return !reduced && (touched || t < DUR + 2.5) || onZero;
      },
    };
  });

  // ------------------------------------------------------------------ a bird perched high sings louder
  S("w-loud", ({ reduced }) => {
    let beta = 0.78, touched = false;
    const wy = (b) => 520 - (b - 0) * 420; // height on the mini wires panel
    const near = (x, y) => Math.abs(x - 110) < 50 && y > 80 && y < 540;
    return {
      hit: near,
      press(x, y) { if (!near(x, y)) return false; touched = true; beta = clamp((520 - y) / 420, 0.5, 0.95); return true; },
      drag(x, y) { beta = clamp((520 - y) / 420, 0.5, 0.95); },
      draw(K, t) {
        const { col } = K;
        if (!touched) beta = reduced ? 0.78 : 0.5 + 0.28 * K.ease(K.ph(t, 0.4, 2.4));
        heightPanel(K, wy, col);
        if (beta > 0.52) perch(K, 110, wy(beta));
        bird(K, 110, wy(beta), 0.8, { color: beta > 0.52 ? "#e98b5d" : undefined });
        K.text("drag", 110, 590, { size: 16, align: "center", color: col.muted });
        K.text(`height β = ${beta.toFixed(2)}`, 110, 40, { size: 18, align: "center", bold: true });
        const A = K.axes([260, 60, 680, 420], [1, 10000], [-1600, 1600]);
        A.frame({ xticks: [[1, "1"], [5000, "5,000"], [10000, "10,000"]], yticks: [[0, "0"]], xlabel: "x" });
        A.curve((x) => Math.sqrt(x), 1, 10000, 200, { color: col.green, width: 2.2, dash: [8, 6] });
        A.curve((x) => -Math.sqrt(x), 1, 10000, 200, { color: col.green, width: 2.2, dash: [8, 6] });
        A.clip(() => A.curve((x) => Math.pow(x, beta) * Math.cos(14.13 * Math.log(x)), 1, 10000, 1400, { color: beta > 0.52 ? col.red : col.blue, width: 2, sketch: false }));
        K.text("±√x: the normal murmur", A.X(10000) - 6, A.Y(100) - 40, { size: 18, align: "right", bold: true, color: col.green, halo: true });
        K.text(beta > 0.52 ? `its voice grows like x^{${beta.toFixed(2)}}: louder than the whole murmur` : "on the middle wire: just part of the murmur", 600, 560, { size: 20, align: "center", bold: true, color: beta > 0.52 ? col.red : col.blue });
        return !touched && !reduced && t < 2.6;
      },
    };
  });

  // ------------------------------------------------------------------ a volume limit is enough
  S("w-ceiling", () => ({
    draw(K, t) {
      const { col } = K, W = psiData(), A = K.axes([120, 70, 800, 400], [0, 100000], [-600, 900]), g = K.g;
      A.frame({ xticks: [[0, "0"], [50000, "50k"], [100000, "100k"]], yticks: [[0, "0"]], xlabel: "x" });
      g.save(); g.strokeStyle = col.blue; g.lineWidth = 2;
      for (let i = 0; i < W.xs.length; i++) { g.beginPath(); g.moveTo(A.X(W.xs[i]), A.Y(W.lo[i])); g.lineTo(A.X(W.xs[i]), A.Y(W.hi[i])); g.stroke(); }
      g.restore();
      const c = K.ease(K.ph(t, 0.3, 1.3));
      A.curve((x) => 1.4 * Math.sqrt(x), 1, 100000 * c + 1, 200, { color: col.gold, width: 3.5, sketch: false });
      if (c >= 1) K.text("a ceiling, on one side only", A.X(100000) - 4, A.Y(1.4 * 316) - 26, { size: 19, align: "right", bold: true, color: col.gold, halo: true });
      const r = K.ease(K.ph(t, 1.6, 3.2));
      if (r > 0) A.clip(() => A.curve((x) => 0.9 * Math.pow(x, 0.58) * Math.cos(14.13 * Math.log(x)), 1, 1 + 99999 * r, 900, { color: col.red, width: 2, sketch: false, alpha: 0.85 }));
      if (r >= 1) K.text("a bird above the middle wire would break through", 130, 560, { size: 20, bold: true, color: col.red });
      return t < 3.4;
    },
  }));

  // ------------------------------------------------------------------ echoes tell how near
  S("w-echo", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, per = 3, ph = reduced ? 1 : Math.floor(t / per) % 2, r = ph ? 0.55 : 0.85;
      perch(K, 150, 302); bird(K, 150, 300, 1.6, { sing: t });
      K.text("Kito calls into the dark", 150, 340, { size: 18, align: "center", color: col.muted });
      const bx = 150 + r * 420;
      bird(K, bx, 300, 1.3, { flip: true, ghost: true, color: col.muted });
      K.text("unseen", bx, 240, { size: 16, align: "center", color: col.muted });
      { const g2 = K.g; g2.save(); g2.strokeStyle = col.red; g2.lineWidth = 2; for (let k = 1; k <= 3; k++) { const ph2 = reduced ? k / 4 : ((t * 0.8 + k / 3) % 1); g2.globalAlpha = 0.6 * (1 - ph2); g2.beginPath(); g2.arc(bx - 20, 270, 20 + ph2 * (bx - 220), Math.PI - 0.35, Math.PI + 0.35); g2.stroke(); } g2.restore(); }
      K.seg(190, 360, bx, 360, { color: col.red, width: 2, sketch: false });
      K.text(`distance r = ${r}`, (190 + bx) / 2, 384, { size: 18, align: "center", bold: true, color: col.red });
      const g = K.g; g.save(); g.strokeStyle = col.gold; g.lineWidth = 2; for (let k = 1; k <= 4; k++) { g.globalAlpha = 0.25; g.beginPath(); g.arc(180, 270, 30 + k * 40, -0.4, 0.4); g.stroke(); } g.restore();
      const bars = 9, base = 600;
      for (let k = 0; k < bars; k++) { const h = Math.min(200, 12 * Math.pow(1 / r, k)); K.box(640 + k * 34, base - h, 26, h, { color: null, fill: col.red, fillAlpha: 0.75, r: 3 }); }
      K.text("echo k →", 940, base + 22, { size: 16, align: "right", color: col.muted });
      K.text(r < 0.7 ? "near: the echoes grow fast" : "far: the echoes grow slowly", 790, 360, { size: 20, align: "center", bold: true, color: col.red });
      return !reduced;
    },
  }));

  // ------------------------------------------------------------------ the trap snaps shut
  S("w-trap", ({ reduced }) => {
    let beta = 0.75, touched = false; const th = 0.5, sig = 2;
    const near = (x, y) => Math.abs(x - 110) < 50 && y > 80 && y < 540;
    const wy = (b) => 520 - b * 420;
    return {
      hit: near,
      press(x, y) { if (!near(x, y)) return false; touched = true; beta = clamp((520 - y) / 420, 0.1, 0.95); return true; },
      drag(x, y) { beta = clamp((520 - y) / 420, 0.1, 0.95); },
      draw(K, t) {
        const { col } = K, T = touched || reduced ? 99 : t;
        heightPanel(K, wy, col);
        if (Math.abs(beta - th) > 0.02) perch(K, 110, wy(beta));
        bird(K, 110, wy(beta), 0.8, { color: beta > th ? "#e98b5d" : undefined });
        K.text("drag the bird", 110, 590, { size: 16, align: "center", color: col.muted });
        const kmax = Math.floor(clamp(T / 0.25, 1, 24));
        const ratio = (sig - th) / (sig - beta), Y = (v) => 520 - v * 22, X = (k) => 280 + k * 26;
        K.seg(280, 520, 920, 520, { color: col.axis, width: 2, sketch: false });
        K.seg(280, Y(4), 920, Y(4), { color: col.green, width: 3, sketch: false });
        for (let k = 1; k <= kmax; k++) {
          const r = 2 * Math.pow(ratio, k), h = Math.min(r, 14);
          K.box(X(k) - 6, Y(h), 12, 520 - Y(h), { color: null, fill: r > 4 ? col.red : col.blue, fillAlpha: 0.8 });
          if (r > 14) K.text("↑", X(k), Y(14) - 12, { size: 16, align: "center", bold: true, color: col.red });
        }
        K.text("echo k →", 920, 546, { size: 16, align: "right", color: col.muted });
        K.text("green line: the most the volume limit allows", 290, 40, { size: 19, bold: true, color: col.green });
        K.text("bars: what a bird at that height forces, echo by echo", 290, 68, { size: 19, bold: true, color: col.red });
                if (kmax >= 24 || touched || reduced) K.text(beta > th ? "the echoes break the limit: impossible, so no bird up there" : "the echoes stay under the limit: no contradiction", 600, 600, { size: 21, align: "center", bold: true, color: beta > th ? col.red : col.green });
        return !touched && !reduced && t < 6.4;
      },
    };
  });

  // ------------------------------------------------------------------ listening at certain dawns
  S("w-dawns", () => ({
    draw(K, t) {
      const { col } = K, A = K.axes([80, 120, 840, 300], [1, 12], [0, 1]);
      K.seg(A.X(1), A.Y(0), A.X(12), A.Y(0), { color: col.axis, width: 2, sketch: false });
      const Ys = [1.4, 3, 6.2];
      Ys.forEach((y, i) => { const a = K.ease(K.ph(t, 0.3 + i * 0.6, 0.9 + i * 0.6)); if (a <= 0) return; const x0 = A.X(y), x1 = A.X(y * 1.5);
        K.box(x0, A.Y(1), x1 - x0, A.Y(0) - A.Y(1), { color: col.gold, width: 2, fill: col.gold, fillAlpha: 0.18 * a, r: 8, sketch: false });
        K.dot((x0 + x1) / 2, A.Y(0) - 20, 14, col.gold, 0.8 * a); K.text(`dawn ${i + 1}`, (x0 + x1) / 2, A.Y(1) - 18, { size: 17, align: "center", color: col.gold, bold: true }); });
      K.text("…and always another, further on", A.X(11.8), A.Y(0.5), { size: 18, align: "right", color: col.muted });
      K.text("each listening stretch runs from Y to Y^{1.5}", 80, 470, { size: 20, color: col.ink });
      K.text("time, on a log scale →", A.X(12), A.Y(0) + 26, { size: 16, align: "right", color: col.muted });
      if (t > 2.2) { bird(K, 760, 600, 1, { color: "#e98b5d", sing: t }); K.text("a high bird is loud at every scale: some dawn catches it", 700, 600, { size: 19, bold: true, align: "right", color: col.red }); }
      return true;
    },
  }));

  // ------------------------------------------------------------------ the whole job
  S("w-job", () => ({
    draw(K, t) {
      const { col } = K;
      K.wash(500, 200, 360, 90, col.gold, 0.14, 7);
      K.text("on those dawns:   chorus  ≤  x^{½+ε}", 500, 200, { size: 34, align: "center", bold: true });
      bird(K, 300, 520, 2, { sing: t });
      twig(K, 330, 470, 90, -0.3);
      K.seg(560, 336, 810, 328, { color: BIRD.twig, width: 7, alpha: 0.5 }); nest(K, 685, 332, 150, 230, { alpha: 0.3 + 0.15 * Math.sin(t * 1.5) });
      K.text("next: weave a nest, and weigh it two ways", 680, 620, { size: 20, align: "center", bold: true, color: col.muted });
      return true;
    },
  }));

  S("w-end", () => ({
    draw(K, t) {
      const { col } = K, yAt = wires(K, 60, 940, [220, 340, 460]);
      ZEROS.slice(0, 30).forEach((z, i) => { const x = 90 + (z - 14) * 9.3; if (x < 920) bird(K, x, yAt(1, x), 0.55, { flip: i % 3 === 0, alpha: 0.9 + 0.1 * Math.sin(t + i) }); });
      return true;
    },
  }));

  // ------------------------------------------------------------------ reuse a picture-book scene, swapping its old-metaphor labels
  function relabel(name, from, swaps, comp) {
    S(name, (ctx) => {
      const f = DECK.get(from), inner = f ? f(ctx) || {} : {};
      const fix = (str) => { if (typeof str !== "string") return str; for (const [a, b] of swaps) str = typeof a === "string" ? (str === a ? b : str) : str.replace(a, b); return str; };
      const wrap = (K) => { const W = Object.create(K); ["text", "serif", "math"].forEach((m) => { W[m] = (str, ...r) => (fix(str) === "" ? undefined : K[m](fix(str), ...r)); }); return W; };
      const companion = (K) => { if (!comp) return; const c = Object.assign({ x: 945, y: 74, s: 0.75, who: "kito" }, comp), grey = c.who === "grey";
        if (c.who === "far") { farOne(K, c.x, c.y + 10, c.h || 130, { t: K._t || 0 }); return; }
        perch(K, c.x, c.y + 2); bird(K, c.x, c.y, c.s, { flip: c.flip ?? true, color: grey ? "#c9b27a" : undefined }); };
      return Object.assign({}, inner, { draw: (K, t) => { const more = inner.draw ? inner.draw(wrap(K), t) : false; K._t = t; companion(K); return more || (comp && comp.who === "far"); } });
    });
  }
  relabel("w-howto", "howto", [], {});
  relabel("w-ineq", "ineq", [["the chain's\ncost", "the weaving's\ncost"], ["the gap,\nonce per lift", "the gap,\nonce per pass"]], {x: 945, y: 560});
  relabel("w-wall", "wall", [["a chain of theta lifts", "√x weaving passes"]], { who: "grey" });
  relabel("w-euler", "euler", [], {x: 920, y: 615});
  relabel("w-gz", "gz", [], {});
  relabel("w-gap", "gap", [], {});
  relabel("w-three", "three", [], {});
  relabel("w-period", "period", [], { who: "far", x: 950, y: 600, h: 150 });
  relabel("w-minimum", "minimum", [], {});
  relabel("w-barrier", "barrier", [], {});
  relabel("w-crosstalk", "crosstalk", [], {});
  relabel("w-ifholds", "ifholds", [], {});
  relabel("w-shelf", "shelf", [], {x: 950, y: 600});
  relabel("w-handmap", "handmap", [], {who: "grey"});
  relabel("w-lemniscate", "lemniscate", [], {who: "grey", x: 600, y: 615});
  relabel("w-clockcurve", "clockcurve", [], {who: "grey"});
  relabel("w-clockwobble", "clockwobble", [], {who: "grey", x: 960, y: 615});
  relabel("w-hasse", "hasse", [], {who: "grey"});
  relabel("w-positivity", "positivity", [], {who: "grey"});
  relabel("w-route", "route", [], {who: "grey"});
  relabel("w-weight", "weight", [], {who: "grey"});
  relabel("w-dial", "dial", [[/chain length m/, "passes m"], ["short chain", "few passes"], ["long chain", "many passes"]], {who: "grey", x: 960, y: 615});
  relabel("w-map", "map", [["C · a chain of √x lifts", "C · √x weaving passes"], ["B · four bins", "B · four piles"], ["D · count two ways", "D · weigh it two ways"], ["E · near-orthogonality", "E · no tangles"], ["F · the Ш window", "F · calm weather"]], {x: 960, y: 540});
  relabel("w-forward", "forward", [["a chain of √x theta lifts", "√x weaving passes (theta lifts)"], ["a ceiling on one bin of primes", "a limit on one pile of twigs"], ["a ceiling on all primes (Fourier)", "a limit on all the twigs (Fourier)"]], {});

  // ------------------------------------------------------------------ one weaving pass (a theta lift)
  S("w-pass", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, g = K.g, f = reduced ? 1 : K.ease(K.ph(t, 0.3, 3.3));
      const B = [290, 310, 150], s = [700, 310, 58];
      [B, s].forEach(([x, y, r], j) => { for (let k = 0; k < (j ? 3 : 6); k++) K.ring(x, y, r - k * 5, { color: BIRD.twig, width: 3 }); });
      const N = 14;
      for (let i = 0; i < N; i++) {                       // strands carried from the big hoop to the small one
        const a = -1 + (2 * i) / (N - 1), p0 = [B[0] + B[2] * Math.cos(a * 0.9), B[1] + B[2] * Math.sin(a * 0.9)], p1 = [s[0] - s[2] * Math.cos(a * 0.9), s[1] + s[2] * Math.sin(a * 0.9)];
        const fi = clamp(f * N - i * 0.6, 0, 1); if (fi <= 0) continue;
        g.save(); g.strokeStyle = i % 2 ? "#a0703f" : "#6e8a3a"; g.lineWidth = 2.2; g.beginPath();
        for (let q = 0; q <= 30 * fi; q++) { const u = q / 30, x = p0[0] + (p1[0] - p0[0]) * u, y = p0[1] + (p1[1] - p0[1]) * u + Math.sin(u * Math.PI * 3 + i) * 10 * Math.sin(u * Math.PI); q ? g.lineTo(x, y) : g.moveTo(x, y); }
        g.stroke(); g.restore();
      }
      bird(K, 500, 170 - 6 * Math.sin(t * 2), 1.3, { });
      K.text("Θ: one weaving pass (a theta lift)", 500, 70, { size: 24, bold: true, align: "center" });
      K.text("degree a = x · b", B[0], 500, { size: 22, align: "center", bold: true, color: col.blue });
      K.text("degree b", s[0], 420, { size: 22, align: "center", bold: true, color: col.green });
      K.text("two sides, paired, then weighed two ways", 500, 580, { size: 19, align: "center", color: col.muted });
      return true;
    },
  }));

  // ------------------------------------------------------------------ every bird ever spotted sits on the middle wire
  S("w-spotted", ({ reduced }) => ({
    draw(K, t) {
      const { col } = K, yAt = wires(K, 60, 940, [180, 330, 480], { sag: 8 });
      const n = reduced ? ZEROS.length : Math.min(ZEROS.length, Math.round(ZEROS.length * K.ease(K.ph(t, 0.3, 4)))), top = ZEROS[ZEROS.length - 1] || 400;
      for (let k = 0; k < n; k++) { const x = 80 + ((ZEROS[k] - 10) / (top - 10)) * 840; bird(K, x, yAt(1, x), 0.32, { flip: k % 3 === 0 }); }
      K.text(`${n} birds shown, by pitch`, 80, 560, { size: 18, color: col.muted });
      K.text("more than 10,000,000,000,000 spotted by computer:", 920, 90, { size: 20, align: "right", bold: true });
      K.text("every one on the middle wire", 920, 120, { size: 20, align: "right", bold: true, color: col.gold });
      return !reduced && t < 4.3;
    },
  }));
  window.WEAVE = { bird, nest, twig, perch, wires, BIRD, clamp, heightPanel, farOne };
})();
