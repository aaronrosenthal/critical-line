/* core.js: theme toggle, plotting helper, animation loop, small utilities. No dependencies. */
(function () {
  "use strict";

  // ------------------------------------------------------------------ theme
  const root = document.documentElement;
  const stored = localStorage.getItem("rh-theme");
  function applyTheme(t) {
    root.dataset.theme = t;
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.dataset.mode = t;
    }
    redrawAll();
  }
  root.dataset.theme = stored || "light"; // light by default; the toggle remembers a reader's choice

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ------------------------------------------------------------------ colors from CSS vars
  function css(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }
  function colors() {
    return {
      ink: css("--ink"), muted: css("--muted"), grid: css("--grid"), axis: css("--axis"),
      blue: css("--c-blue"), red: css("--c-red"), green: css("--c-green"), gold: css("--c-gold"),
      purple: css("--c-purple"), bg: css("--plot-bg"), fill: css("--c-fill"),
    };
  }

  // ------------------------------------------------------------------ redraw registry
  const drawers = new Set();
  function registerDraw(fn) { drawers.add(fn); return fn; }
  let redrawQueued = false;
  function redrawAll() {
    if (redrawQueued) return;
    redrawQueued = true;
    requestAnimationFrame(() => { redrawQueued = false; drawers.forEach((f) => { try { f(); } catch (e) { console.error(e); } }); });
  }
  window.addEventListener("resize", redrawAll);

  // ------------------------------------------------------------------ animation loop (only when visible)
  function animate(el, step, opts = {}) {
    // step(dt, t) returns false to stop. Runs only while el is on screen.
    let visible = false, running = false, last = 0, t = 0, stopped = false, paused = !!opts.paused;
    const io = new IntersectionObserver((ents) => {
      visible = ents.some((e) => e.isIntersecting);
      if (visible) kick();
    }, { threshold: 0.05 });
    io.observe(el);
    function frame(now) {
      if (!visible || stopped || paused) { running = false; return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now; t += dt;
      const keep = step(dt, t);
      if (keep === false) { running = false; return; }
      requestAnimationFrame(frame);
    }
    function kick() { if (!running && !stopped && !paused && visible) { running = true; last = 0; requestAnimationFrame(frame); } }
    return {
      pause() { paused = true; },
      play() { paused = false; kick(); },
      toggle() { paused ? this.play() : this.pause(); return !paused; },
      get paused() { return paused; },
      reset() { t = 0; },
      stop() { stopped = true; io.disconnect(); },
    };
  }

  // ------------------------------------------------------------------ rich canvas text: "x^{2/3}" and "G_{z}" become super/subscripts
  function parseRich(s) {
    const out = []; let i = 0, buf = "";
    s = String(s);
    while (i < s.length) {
      const ch = s[i];
      if ((ch === "^" || ch === "_") && s[i + 1] === "{") {
        const j = s.indexOf("}", i + 2);
        if (j > 0) { if (buf) out.push([buf, 0]); buf = ""; out.push([s.slice(i + 2, j), ch === "^" ? 1 : -1]); i = j + 1; continue; }
      }
      buf += ch; i++;
    }
    if (buf) out.push([buf, 0]);
    return out;
  }
  const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
  function richFont(size, bold, small) { return (bold ? "600 " : "") + (small ? Math.round(size * 0.74 * 10) / 10 : size) + "px " + FONT; }
  function richWidth(g, segs, size, bold) {
    let w = 0;
    segs.forEach(([t, m]) => { g.font = richFont(size, bold, m !== 0); w += g.measureText(t).width; });
    return w;
  }
  // Draw one line of rich text. align: left | center | right. Baseline is "middle".
  function drawRich(g, s, x, y, o = {}) {
    let size = o.size || 12;
    const bold = !!o.bold, segs = parseRich(s);
    g.save();
    if (o.color) g.fillStyle = o.color;
    g.textBaseline = o.base || "middle"; g.textAlign = "left";
    let total = richWidth(g, segs, size, bold);
    if (o.maxW && total > o.maxW) { size = Math.max(8.5, size * Math.max(0.68, o.maxW / total)); total = richWidth(g, segs, size, bold); }
    let x0 = o.align === "center" ? x - total / 2 : o.align === "right" ? x - total : x;
    segs.forEach(([t, m]) => {
      g.font = richFont(size, bold, m !== 0);
      if (o.halo) { g.lineWidth = 3; g.strokeStyle = o.halo; g.lineJoin = "round"; g.strokeText(t, x0, y + (m === 1 ? -size * 0.36 : m === -1 ? size * 0.26 : 0)); }
      g.fillText(t, x0, y + (m === 1 ? -size * 0.36 : m === -1 ? size * 0.26 : 0));
      x0 += g.measureText(t).width;
    });
    g.restore();
    return total;
  }

  // ------------------------------------------------------------------ Riemann zeta by Euler–Maclaurin summation: returns [Re, Im] of ζ(σ + it)
  const BERN = [1 / 6, -1 / 30, 1 / 42, -1 / 30, 5 / 66, -691 / 2730, 7 / 6, -3617 / 510];
  const FACT2 = [2, 24, 720, 40320, 3628800, 479001600, 87178291200, 20922789888000];
  const LOGS = new Float64Array(400); for (let n = 1; n < 400; n++) LOGS[n] = Math.log(n);
  function zeta(sig, t) {
    const N = Math.min(399, Math.max(12, Math.ceil(Math.abs(t) / 2 + 10)));
    let re = 0, im = 0;
    for (let n = 1; n < N; n++) { const ln = LOGS[n], a = Math.exp(-sig * ln), th = t * ln; re += a * Math.cos(th); im -= a * Math.sin(th); }
    const lnN = LOGS[N], aN = Math.exp(-sig * lnN), cN = Math.cos(t * lnN), sN = -Math.sin(t * lnN);
    const nr = N * aN * cN, ni = N * aN * sN, dr = sig - 1, di = t, dd = dr * dr + di * di;
    if (dd === 0) return [Infinity, 0];
    re += (nr * dr + ni * di) / dd; im += (ni * dr - nr * di) / dd;
    re += 0.5 * aN * cN; im += 0.5 * aN * sN;
    let pr = (sig * aN * cN - t * aN * sN) / N, pi = (sig * aN * sN + t * aN * cN) / N;
    for (let j = 1; j <= 8; j++) {
      const c = BERN[j - 1] / FACT2[j - 1];
      re += c * pr; im += c * pi;
      const ar = sig + 2 * j - 1, br = sig + 2 * j, mr = ar * br - t * t, mi = t * (ar + br);
      const qr = (pr * mr - pi * mi) / (N * N), qi = (pr * mi + pi * mr) / (N * N);
      pr = qr; pi = qi;
    }
    return [re, im];
  }

  // ------------------------------------------------------------------ Plot helper
  class Plot {
    constructor(canvas, o = {}) {
      this.c = canvas;
      this.ctx = canvas.getContext("2d");
      this.o = Object.assign({ x: [0, 1], y: [0, 1], xlog: false, ylog: false, pad: [14, 16, 38, 50], // top right bottom left
        xlabel: "", ylabel: "", grid: true, axes: true, aspect: 0.5, xticks: null, yticks: null, equal: false }, o);
      this.resize();
    }
    resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = this.c.clientWidth || this.c.parentElement.clientWidth || 600;
      this.narrow = w < 520;
      const asp = this.narrow ? Math.max(this.o.aspect, this.o.mobileAspect || 0.74) : this.o.aspect;
      const h = this.o.height || Math.round(w * asp);
      this.c.style.height = h + "px";
      this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.W = w; this.H = h;
      const [pt, pr, pb, pl] = this.o.pad;
      this.L = pl; this.R = w - pr; this.T = pt; this.B = h - pb;
      if (this.o.equal) { // equal aspect: expand the y range to match
        const sx = (this.R - this.L) / (this.o.x[1] - this.o.x[0]);
        const cy = (this.o.y[0] + this.o.y[1]) / 2, half = (this.B - this.T) / sx / 2;
        this.o.y = [cy - half, cy + half];
      }
      this.col = colors();
    }
    tx(v) { const [a, b] = this.o.x; return this.o.xlog ? this.L + (Math.log10(v) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) * (this.R - this.L) : this.L + (v - a) / (b - a) * (this.R - this.L); }
    ty(v) { const [a, b] = this.o.y; return this.o.ylog ? this.B - (Math.log10(v) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) * (this.B - this.T) : this.B - (v - a) / (b - a) * (this.B - this.T); }
    ix(px) { const [a, b] = this.o.x; const f = (px - this.L) / (this.R - this.L); return this.o.xlog ? Math.pow(10, Math.log10(a) + f * (Math.log10(b) - Math.log10(a))) : a + f * (b - a); }
    iy(py) { const [a, b] = this.o.y; const f = (this.B - py) / (this.B - this.T); return this.o.ylog ? Math.pow(10, Math.log10(a) + f * (Math.log10(b) - Math.log10(a))) : a + f * (b - a); }
    clear() {
      this.resize();
      const g = this.ctx; g.clearRect(0, 0, this.W, this.H);
      if (this.o.bg !== false && this.col.bg && this.col.bg !== "transparent") { g.fillStyle = this.col.bg; g.fillRect(0, 0, this.W, this.H); }
      return this;
    }
    ticks(range, log, given) {
      if (given) return given;
      const [a, b] = range;
      if (log) { const out = []; for (let e = Math.ceil(Math.log10(a)); e <= Math.floor(Math.log10(b)); e++) out.push(Math.pow(10, e)); return out; }
      const span = b - a, raw = span / 6, mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= 7) || mag * 10;
      const out = []; for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(+v.toFixed(10)); return out;
    }
    fmt(v, log) {
      if (log) { const e = Math.round(Math.log10(v)); return e === 0 ? "1" : e === 1 ? "10" : "10^" + e; }
      const a = Math.abs(v);
      if (a >= 1e6) return +(v / 1e6).toFixed(2) + "M";
      if (a >= 1e4) return +(v / 1e3).toFixed(1) + "k";
      return String(+v.toFixed(4));
    }
    frame() {
      const g = this.ctx, c = this.col;
      g.save(); g.font = "11px system-ui, sans-serif"; g.lineWidth = 1;
      const xt = this.ticks(this.o.x, this.o.xlog, this.o.xticks), yt = this.ticks(this.o.y, this.o.ylog, this.o.yticks);
      if (this.o.grid) {
        g.strokeStyle = c.grid;
        xt.forEach((v) => { const X = this.tx(v); g.beginPath(); g.moveTo(X, this.T); g.lineTo(X, this.B); g.stroke(); });
        yt.forEach((v) => { const Y = this.ty(v); g.beginPath(); g.moveTo(this.L, Y); g.lineTo(this.R, Y); g.stroke(); });
      }
      if (this.o.axes) {
        g.strokeStyle = c.axis; g.beginPath(); g.moveTo(this.L, this.T); g.lineTo(this.L, this.B); g.lineTo(this.R, this.B); g.stroke();
        g.fillStyle = c.muted; g.textAlign = "center"; g.textBaseline = "top";
        xt.forEach((v) => this.supText((this.o.xfmt || this.fmt)(v, this.o.xlog), this.tx(v), this.B + 5, "center"));
        g.textAlign = "right"; g.textBaseline = "middle";
        yt.forEach((v) => this.supText((this.o.yfmt || this.fmt)(v, this.o.ylog), this.L - 6, this.ty(v), "right"));
        g.fillStyle = c.ink;
        if (this.o.xlabel) drawRich(g, this.o.xlabel, (this.L + this.R) / 2, this.H - 9, { align: "center", size: 12, color: c.ink, maxW: this.R - this.L + 30 });
        if (this.o.ylabel) { g.save(); g.translate(13, (this.T + this.B) / 2); g.rotate(-Math.PI / 2); drawRich(g, this.o.ylabel, 0, 0, { align: "center", size: 12, color: c.ink, maxW: this.B - this.T + 24 }); g.restore(); }
      }
      g.restore(); return this;
    }
    supText(s, x, y, align) { // render "10^6" with a raised exponent
      const g = this.ctx; const i = s.indexOf("^");
      if (i < 0) { g.textAlign = align; g.fillText(s, x, y); return; }
      const base = s.slice(0, i), exp = s.slice(i + 1);
      const wb = g.measureText(base).width; g.save(); g.font = "9px system-ui, sans-serif"; const we = g.measureText(exp).width; g.restore();
      const total = wb + we; let x0 = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
      g.textAlign = "left"; g.fillText(base, x0, y);
      g.save(); g.font = "9px system-ui, sans-serif"; g.fillText(exp, x0 + wb, y - 5); g.restore();
    }
    clip(fn) { const g = this.ctx; g.save(); g.beginPath(); g.rect(this.L, this.T, this.R - this.L, this.B - this.T); g.clip(); fn(g); g.restore(); return this; }
    path(xs, ys, o = {}) {
      return this.clip((g) => {
        g.strokeStyle = o.color || this.col.blue; g.lineWidth = o.width || 1.6; g.setLineDash(o.dash || []); g.globalAlpha = o.alpha ?? 1;
        g.beginPath(); let on = false;
        for (let i = 0; i < xs.length; i++) {
          const X = this.tx(xs[i]), Y = this.ty(ys[i]);
          if (!isFinite(X) || !isFinite(Y)) { on = false; continue; }
          if (!on) { g.moveTo(X, Y); on = true; } else g.lineTo(X, Y);
        }
        g.stroke();
      });
    }
    fn(f, o = {}) {
      const n = o.samples || 400, [a, b] = o.range || this.o.x, xs = [], ys = [];
      for (let i = 0; i <= n; i++) {
        const v = this.o.xlog ? Math.pow(10, Math.log10(a) + (Math.log10(b) - Math.log10(a)) * i / n) : a + (b - a) * i / n;
        xs.push(v); ys.push(f(v));
      }
      return this.path(xs, ys, o);
    }
    step(xs, ys, o = {}) {
      const X = [], Y = [];
      for (let i = 0; i < xs.length; i++) { if (i) { X.push(xs[i]); Y.push(ys[i - 1]); } X.push(xs[i]); Y.push(ys[i]); }
      return this.path(X, Y, o);
    }
    band(xs, lo, hi, o = {}) {
      return this.clip((g) => {
        g.fillStyle = o.color || this.col.green; g.globalAlpha = o.alpha ?? 0.15; g.beginPath();
        xs.forEach((x, i) => (i ? g.lineTo(this.tx(x), this.ty(hi[i])) : g.moveTo(this.tx(x), this.ty(hi[i]))));
        for (let i = xs.length - 1; i >= 0; i--) g.lineTo(this.tx(xs[i]), this.ty(lo[i]));
        g.closePath(); g.fill();
      });
    }
    vspan(a, b, o = {}) { return this.clip((g) => { g.fillStyle = o.color || this.col.green; g.globalAlpha = o.alpha ?? 0.12; g.fillRect(this.tx(a), this.T, this.tx(b) - this.tx(a), this.B - this.T); }); }
    hline(y, o = {}) { return this.path([this.o.x[0], this.o.x[1]], [y, y], Object.assign({ color: this.col.axis, width: 1 }, o)); }
    vline(x, o = {}) { return this.path([x, x], [this.o.y[0], this.o.y[1]], Object.assign({ color: this.col.axis, width: 1 }, o)); }
    dot(x, y, o = {}) {
      return this.clip((g) => {
        g.fillStyle = o.color || this.col.red; g.globalAlpha = o.alpha ?? 1;
        const X = this.tx(x), Y = this.ty(y), r = o.r || 4;
        if (o.shape === "x") { g.strokeStyle = g.fillStyle; g.lineWidth = 2.5; g.beginPath(); g.moveTo(X - r, Y - r); g.lineTo(X + r, Y + r); g.moveTo(X + r, Y - r); g.lineTo(X - r, Y + r); g.stroke(); }
        else { g.beginPath(); g.arc(X, Y, r, 0, 2 * Math.PI); g.fill(); if (o.ring) { g.strokeStyle = this.col.bg || "#fff"; g.lineWidth = 1.5; g.stroke(); } }
      });
    }
    circle(x, y, rData, o = {}) {
      return this.clip((g) => {
        const rx = Math.abs(this.tx(x + rData) - this.tx(x)), ry = Math.abs(this.ty(y + rData) - this.ty(y));
        g.strokeStyle = o.color || this.col.green; g.lineWidth = o.width || 1.6; g.setLineDash(o.dash || []);
        g.beginPath(); g.ellipse(this.tx(x), this.ty(y), rx, ry, 0, 0, 2 * Math.PI);
        if (o.fill) { g.fillStyle = o.fill; g.globalAlpha = o.fillAlpha ?? 0.1; g.fill(); g.globalAlpha = 1; }
        g.stroke();
      });
    }
    poly(pts, o = {}) {
      return this.clip((g) => {
        g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(this.tx(x), this.ty(y)) : g.moveTo(this.tx(x), this.ty(y)))); g.closePath();
        if (o.fill) { g.fillStyle = o.fill; g.globalAlpha = o.fillAlpha ?? 0.18; g.fill(); g.globalAlpha = 1; }
        if (o.color) { g.strokeStyle = o.color; g.lineWidth = o.width || 1.5; g.stroke(); }
      });
    }
    arrow(x1, y1, x2, y2, o = {}) {
      const g = this.ctx, X1 = this.tx(x1), Y1 = this.ty(y1), X2 = this.tx(x2), Y2 = this.ty(y2);
      g.save(); g.strokeStyle = g.fillStyle = o.color || this.col.ink; g.lineWidth = o.width || 2;
      g.beginPath(); g.moveTo(X1, Y1); g.lineTo(X2, Y2); g.stroke();
      const a = Math.atan2(Y2 - Y1, X2 - X1), h = o.head || 9;
      g.beginPath(); g.moveTo(X2, Y2); g.lineTo(X2 - h * Math.cos(a - 0.4), Y2 - h * Math.sin(a - 0.4)); g.lineTo(X2 - h * Math.cos(a + 0.4), Y2 - h * Math.sin(a + 0.4)); g.closePath(); g.fill();
      g.restore(); return this;
    }
    label(x, y, s, o = {}) {
      const g = this.ctx, size = o.size || 12;
      const X = typeof x === "string" ? +x.slice(0, -2) : this.tx(x), Y = typeof y === "string" ? +y.slice(0, -2) : this.ty(y);
      const ax = X + (o.dx || 0), al = o.align || "left";
      const room = al === "left" ? this.W - ax - 3 : al === "right" ? ax - 3 : 2 * Math.min(ax, this.W - ax) - 6;
      (o.lines || String(s).split("\n")).forEach((line, i) => drawRich(g, line, ax, Y + (o.dy || 0) + i * (size + 4),
        { size, bold: o.bold, align: al, base: o.base, color: o.color || this.col.ink, halo: o.halo === true ? (this.haloColor()) : o.halo, maxW: Math.max(40, room) }));
      return this;
    }
    haloColor() { return getComputedStyle(root).getPropertyValue("--surface").trim() || "#fff"; }
    legend(items, o = {}) {
      const g = this.ctx; g.save();
      let fs = 12;
      const widest = Math.max(...items.map(([label]) => richWidth(g, parseRich(label), 12, false))), avail = this.R - this.L - 46;
      if (widest > avail) fs = Math.max(8.5, 12 * Math.max(0.68, avail / widest));
      const lh = Math.round(fs * 1.42);
      let y = (o.bottom ? this.B - 10 - lh * (items.length - 1) : this.T + 10) + (o.dy || 0); const x = o.right ? this.R - 10 : this.L + 12;
      items.forEach(([label, color, dash, kind]) => {
        const w = richWidth(g, parseRich(label), fs, false), x0 = o.right ? x - w - 26 : x;
        if (kind === "band" || kind === "box") { g.fillStyle = color; g.globalAlpha = kind === "box" ? 0.88 : 0.3; g.fillRect(x0, y - 5, 20, 10); g.globalAlpha = 1; }
        else if (kind === "dot") { g.fillStyle = color; g.beginPath(); g.arc(x0 + 10, y, 4, 0, 2 * Math.PI); g.fill(); }
        else { g.strokeStyle = color; g.lineWidth = 2.2; g.setLineDash(dash || []); g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 20, y); g.stroke(); g.setLineDash([]); }
        drawRich(g, label, x0 + 26, y, { size: fs, color: this.col.ink, halo: o.halo ? this.haloColor() : null }); y += lh;
      });
      g.restore(); return this;
    }
  }

  // ------------------------------------------------------------------ widget helpers
  function $(sel, el = document) { return el.querySelector(sel); }
  function $$(sel, el = document) { return Array.from(el.querySelectorAll(sel)); }
  function bindRange(input, out, fmt, onChange) {
    const f = () => { if (out) out.textContent = fmt ? fmt(+input.value) : input.value; onChange(+input.value); };
    input.addEventListener("input", f); f(); return f;
  }
  // Drag support in data coordinates. getPlot() returns the current Plot; onDrag(x, y).
  function draggable(canvas, getPlot, hit, onDrag) {
    let drag = false;
    canvas.style.touchAction = "none";
    const pos = (e) => { const r = canvas.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; return [p.clientX - r.left, p.clientY - r.top]; };
    const down = (e) => { const [px, py] = pos(e); const P = getPlot(); if (hit(P.ix(px), P.iy(py), px, py, P)) { drag = true; e.preventDefault(); } };
    const move = (e) => { const [px, py] = pos(e); const P = getPlot(); if (drag) { e.preventDefault(); onDrag(P.ix(px), P.iy(py)); } else canvas.style.cursor = hit(P.ix(px), P.iy(py), px, py, P) ? "grab" : "default"; };
    const up = () => (drag = false);
    canvas.addEventListener("mousedown", down); window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: false }); canvas.addEventListener("touchmove", move, { passive: false }); window.addEventListener("touchend", up);
  }
  // Pointer tracking in data coordinates: onMove(x, y, px, py) while inside the plot area, onLeave() otherwise.
  function hover(canvas, getPlot, onMove, onLeave) {
    const h = (e) => {
      const r = canvas.getBoundingClientRect(), p = e.touches ? e.touches[0] : e; if (!p) return;
      const px = p.clientX - r.left, py = p.clientY - r.top, P = getPlot();
      if (px >= P.L && px <= P.R && py >= P.T && py <= P.B) onMove(P.ix(px), P.iy(py), px, py); else if (onLeave) onLeave();
    };
    canvas.addEventListener("mousemove", h); canvas.addEventListener("touchstart", h, { passive: true }); canvas.addEventListener("touchmove", h, { passive: true });
    if (onLeave) canvas.addEventListener("mouseleave", onLeave);
  }
  // Small shared UI helpers for the widget files.
  const ui = {
    widget(id, fn) { const el = document.getElementById(id); if (!el) return; try { fn(el); } catch (e) { console.error("widget " + id, e); } },
    playButton(btn, anim, labels = ["Play", "Pause"]) {
      const sync = () => { btn.textContent = anim.paused ? labels[0] : labels[1]; };
      btn.addEventListener("click", () => { anim.toggle(); sync(); }); sync(); return sync;
    },
    seg(container, onPick) {
      const bs = $$("button", container);
      bs.forEach((b) => b.addEventListener("click", () => { bs.forEach((x) => x.classList.toggle("on", x === b)); onPick(b); }));
      return bs.find((b) => b.classList.contains("on")) || bs[0];
    },
    nearPx(P, x, y, px, py, r = 18) { return Math.hypot(P.tx(x) - px, P.ty(y) - py) < r; },
    clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
    ease: (s) => (s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2),
    flag(box, good) { box.classList.toggle("good", !!good); box.classList.toggle("bad", !good); },
  };
  function fmtNum(v) {
    if (!isFinite(v)) return "∞";
    const a = Math.abs(v);
    if (a >= 1e6 || (a > 0 && a < 1e-3)) { const e = Math.floor(Math.log10(a)); const m = v / Math.pow(10, e); return m.toFixed(2) + "×10" + sup(e); }
    if (a >= 1000) return Math.round(v).toLocaleString("en-US");
    return (+v.toPrecision(4)).toString();
  }
  function sup(n) { const m = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" }; return String(n).split("").map((ch) => m[ch]).join(""); }

  // ------------------------------------------------------------------ number theory helpers
  const NT = {
    _cache: null,
    sieve(N) {
      if (this._cache && this._cache.N >= N) return this._cache;
      const comp = new Uint8Array(N + 1), lam = new Float64Array(N + 1);
      for (let p = 2; p <= N; p++) {
        if (comp[p]) continue;
        for (let q = p * p; q <= N; q += p) comp[q] = 1;
        const lp = Math.log(p); for (let q = p; q <= N; q *= p) lam[q] = lp;
      }
      const psi = new Float64Array(N + 1), lamOverN = new Float64Array(N + 1);
      for (let n = 1; n <= N; n++) { psi[n] = psi[n - 1] + lam[n]; lamOverN[n] = lamOverN[n - 1] + lam[n] / n; }
      this._cache = { N, comp, lam, psi, lamOverN, isPrime: (n) => n >= 2 && !comp[n] };
      return this._cache;
    },
  };

  window.RH = { Plot, registerDraw, redrawAll, animate, reducedMotion, colors, $, $$, bindRange, draggable, hover, ui, zeta, drawRich, fmtNum, sup, NT,
    toggleTheme() { const t = root.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("rh-theme", t); applyTheme(t); } };

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (btn) { btn.addEventListener("click", RH.toggleTheme); applyTheme(root.dataset.theme); }
    // Re-render plots inside <details> when opened (their size was 0 while closed).
    $$("details").forEach((d) => d.addEventListener("toggle", redrawAll));
  });
})();
