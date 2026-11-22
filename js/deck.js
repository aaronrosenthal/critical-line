/* deck.js: page turning for the picture-book version, plus a small drawing kit for the illustrations.
   Each illustration is a "scene" drawn on a virtual 1000 × 640 board, scaled to fit its canvas. */
(function () {
  "use strict";
  const { $, $$, reducedMotion, drawRich, colors, registerDraw } = RH;
  const VW = 1000, VH = 640;
  const SCENES = {};
  window.DECK = { scene(name, factory) { SCENES[name] = factory; }, get(name) { return SCENES[name]; } };

  // ------------------------------------------------------------------ drawing kit
  function rng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, f) => a + (b - a) * f;
  const ease = (s) => { s = clamp(s, 0, 1); return s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2; };
  const ph = (t, a, b) => clamp((t - a) / (b - a), 0, 1); // progress of a phase from time a to b

  function makeKit(g, fs = 1) {
    const K = {
      g, VW, VH, clamp, lerp, ease, ph, rng, fs,
      col: colors(),
      surface: getComputedStyle(document.documentElement).getPropertyValue("--surface").trim(),
      bg: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
      text(s, x, y, o = {}) {
        const lines = String(s).split("\n"), size = (o.size || 26) * fs;
        lines.forEach((ln, i) => drawRich(g, ln, x, y + i * size * (o.lh || 1.3), { size, bold: o.bold, align: o.align || "left", color: o.color || K.col.ink, halo: o.halo ? K.surface : null, maxW: o.maxW }));
      },
      serif(s, x, y, o = {}) { // italic serif text for story-like captions inside the art
        g.save(); g.font = `${o.italic === false ? "" : "italic "}${o.bold ? "600 " : ""}${(o.size || 28) * fs}px "Iowan Old Style", Palatino, Georgia, serif`;
        g.fillStyle = o.color || K.col.ink; g.textAlign = o.align || "left"; g.textBaseline = "middle"; g.globalAlpha = o.alpha ?? 1;
        g.fillText(s, x, y); g.restore();
      },
      math(s, x, y, o = {}) { g.save(); g.font = `${o.italic ? "italic " : ""}${(o.size || 30) * fs}px "STIX Two Math", "Cambria Math", "Times New Roman", serif`; g.fillStyle = o.color || K.col.ink; g.textAlign = o.align || "center"; g.textBaseline = "middle"; g.globalAlpha = o.alpha ?? 1; g.fillText(s, x, y); g.restore(); },
      line(pts, o = {}) {
        if (pts.length < 2) return;
        g.save(); g.strokeStyle = o.color || K.col.ink; g.lineWidth = o.width || 2.5; g.lineCap = "round"; g.lineJoin = "round"; g.globalAlpha = o.alpha ?? 1; g.setLineDash(o.dash || []);
        const passes = o.sketch ? 2 : 1;
        for (let pass = 0; pass < passes; pass++) {
          const r = rng((o.seed || 7) + pass * 101), j = o.sketch ? (o.jitter ?? 1.6) : 0;
          if (pass === 1) { g.globalAlpha = (o.alpha ?? 1) * 0.45; g.lineWidth = (o.width || 2.5) * 0.7; }
          g.beginPath();
          pts.forEach(([x, y], i) => { const dx = (r() - 0.5) * 2 * j, dy = (r() - 0.5) * 2 * j; i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy); });
          if (o.close) g.closePath();
          if (o.fill && pass === 0) { g.save(); g.fillStyle = o.fill; g.globalAlpha = o.fillAlpha ?? 0.2; g.fill(); g.restore(); }
          g.stroke();
        }
        g.restore();
      },
      seg(x1, y1, x2, y2, o = {}) { // a sketchy straight segment, subdivided so the jitter looks hand-drawn
        const n = o.sketch === false ? 1 : Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 60));
        const pts = []; for (let i = 0; i <= n; i++) pts.push([lerp(x1, x2, i / n), lerp(y1, y2, i / n)]);
        K.line(pts, Object.assign({ sketch: o.sketch !== false }, o));
      },
      box(x, y, w, h, o = {}) {
        if (o.fill) { g.save(); g.fillStyle = o.fill; g.globalAlpha = o.fillAlpha ?? 0.2; if (o.r) { g.beginPath(); g.roundRect(x, y, w, h, o.r); g.fill(); } else g.fillRect(x, y, w, h); g.restore(); }
        if (o.color !== null) {
          if (o.sketch === false) { g.save(); g.strokeStyle = o.color || K.col.ink; g.lineWidth = o.width || 2; g.setLineDash(o.dash || []); g.globalAlpha = o.alpha ?? 1; g.beginPath(); o.r ? g.roundRect(x, y, w, h, o.r) : g.rect(x, y, w, h); g.stroke(); g.restore(); }
          else K.line([[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]], Object.assign({ sketch: true, jitter: 1.2 }, o));
        }
      },
      dot(x, y, r, color, alpha) { g.save(); g.fillStyle = color || K.col.ink; g.globalAlpha = alpha ?? 1; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore(); },
      ring(x, y, r, o = {}) { g.save(); g.strokeStyle = o.color || K.col.ink; g.lineWidth = o.width || 2; g.globalAlpha = o.alpha ?? 1; g.setLineDash(o.dash || []); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); if (o.fill) { g.fillStyle = o.fill; g.globalAlpha = o.fillAlpha ?? 0.15; g.fill(); g.globalAlpha = o.alpha ?? 1; } g.stroke(); g.restore(); },
      arrow(x1, y1, x2, y2, o = {}) {
        K.seg(x1, y1, x2, y2, o);
        const a = Math.atan2(y2 - y1, x2 - x1), h = o.head || 14;
        g.save(); g.fillStyle = o.color || K.col.ink; g.globalAlpha = o.alpha ?? 1; g.beginPath(); g.moveTo(x2, y2);
        g.lineTo(x2 - h * Math.cos(a - 0.42), y2 - h * Math.sin(a - 0.42)); g.lineTo(x2 - h * Math.cos(a + 0.42), y2 - h * Math.sin(a + 0.42)); g.closePath(); g.fill(); g.restore();
      },
      wash(cx, cy, rx, ry, color, alpha = 0.18, seed = 3) { // a soft watercolour blob
        g.save(); g.fillStyle = color;
        for (let layer = 0; layer < 3; layer++) {
          const r = rng(seed + layer * 17), n = 22; g.globalAlpha = alpha * (layer === 0 ? 1 : 0.55); g.beginPath();
          for (let i = 0; i <= n; i++) { const th = (i / n) * Math.PI * 2, k = 0.86 + r() * 0.24 - layer * 0.04; const x = cx + Math.cos(th) * rx * k, y = cy + Math.sin(th) * ry * k; i ? g.lineTo(x, y) : g.moveTo(x, y); }
          g.closePath(); g.fill();
        }
        g.restore();
      },
      // axes helper: maps data to a rectangle of the board. Returns {X, Y, frame()}.
      axes(box, xr, yr, o = {}) {
        const [x0, y0, w, h] = box, lx = o.xlog, ly = o.ylog;
        const fx = (v) => (lx ? (Math.log10(v) - Math.log10(xr[0])) / (Math.log10(xr[1]) - Math.log10(xr[0])) : (v - xr[0]) / (xr[1] - xr[0]));
        const fy = (v) => (ly ? (Math.log10(v) - Math.log10(yr[0])) / (Math.log10(yr[1]) - Math.log10(yr[0])) : (v - yr[0]) / (yr[1] - yr[0]));
        const A = {
          X: (v) => x0 + fx(v) * w, Y: (v) => y0 + h - fy(v) * h,
          frame(f = {}) {
            K.seg(x0, y0 + h, x0 + w, y0 + h, { color: K.col.axis, width: 2, seed: 11 });
            if (f.yaxis !== false) K.seg(x0, y0, x0, y0 + h, { color: K.col.axis, width: 2, seed: 12 });
            (f.xticks || []).forEach(([v, s]) => { K.seg(A.X(v), y0 + h, A.X(v), y0 + h + 7, { color: K.col.axis, width: 1.5, sketch: false }); K.text(s, A.X(v), y0 + h + 24, { size: 18, align: "center", color: K.col.muted }); });
            (f.yticks || []).forEach(([v, s]) => { K.text(s, x0 - 10, A.Y(v), { size: 18, align: "right", color: K.col.muted }); });
            if (f.xlabel) K.text(f.xlabel, x0 + w, y0 + h + 52, { size: 20, align: "right", color: K.col.muted });
            if (f.ylabel) K.text(f.ylabel, x0 + 8, y0 - 14, { size: 20, color: K.col.muted });
          },
          curve(fn, a, b, n, o2 = {}) { const pts = []; for (let i = 0; i <= n; i++) { const v = lx ? Math.pow(10, lerp(Math.log10(a), Math.log10(b), i / n)) : lerp(a, b, i / n); const y = fn(v); if (isFinite(y)) pts.push([A.X(v), A.Y(y)]); } K.line(pts, o2); },
          clip(fn) { g.save(); g.beginPath(); g.rect(x0, y0 - 2, w, h + 4); g.clip(); fn(); g.restore(); },
        };
        return A;
      },
    };
    return K;
  }

  // ------------------------------------------------------------------ pages
  const slides = $$(".slide");
  const N = slides.length;
  let cur = -1, loop = null, t0 = 0;
  const inst = new Map(); // slide index -> scene instance


  function board(s) {
    const c = $("canvas", s), dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return null;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
    const sc = Math.min(w / VW, h / VH), ox = (w - VW * sc) / 2, oy = (h - VH * sc) / 2;
    return { c, dpr, sc, ox, oy, w, h };
  }
  function instance(i) {
    if (inst.has(i)) return inst.get(i);
    const s = slides[i], name = s.dataset.scene, f = SCENES[name];
    let obj = { draw() {} };
    if (f) { try { obj = f({ el: s, kick: () => kick(), reduced: reducedMotion }) || obj; } catch (e) { console.error("scene " + name, e); } }
    inst.set(i, obj); return obj;
  }
  function render(i, t) {
    const s = slides[i], b = board(s); if (!b) return false;
    const g = b.c.getContext("2d");
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, b.c.width, b.c.height);
    g.setTransform(b.dpr * b.sc, 0, 0, b.dpr * b.sc, b.dpr * b.ox, b.dpr * b.oy);
    const K = makeKit(g, b.w < 600 ? 1.32 : b.w < 800 ? 1.12 : 1);
    let more = false;
    try { more = instance(i).draw(K, t) !== false; } catch (e) { console.error("scene " + s.dataset.scene, e); }
    return more;
  }
  function stopLoop() { if (loop) cancelAnimationFrame(loop); loop = null; }
  function frame(now) {
    loop = null; if (cur < 0) return;
    const t = reducedMotion ? 1000 : (now - t0) / 1000;
    const more = render(cur, t);
    if (more && !reducedMotion) loop = requestAnimationFrame(frame);
  }
  function kick() { if (!loop) loop = requestAnimationFrame(frame); }
  registerDraw(() => { if (cur >= 0) { render(cur, reducedMotion ? 1000 : (performance.now() - t0) / 1000); kick(); } });

  // pointer -> board coordinates, for interactive scenes
  slides.forEach((s, i) => {
    const c = $("canvas", s); let dragging = false;
    const pos = (e) => { const r = c.getBoundingClientRect(), b = board(s), p = e.touches ? e.touches[0] : e; return [(p.clientX - r.left - b.ox) / b.sc, (p.clientY - r.top - b.oy) / b.sc]; };
    c.addEventListener("pointerdown", (e) => { const o = instance(i); if (o.press && o.press(...pos(e))) { dragging = true; c.setPointerCapture(e.pointerId); e.preventDefault(); kick(); } });
    c.addEventListener("pointermove", (e) => { const o = instance(i); if (dragging && o.drag) { o.drag(...pos(e)); kick(); } else if (o.hit) c.style.cursor = o.hit(...pos(e)) ? "grab" : "default"; });
    c.addEventListener("pointerup", () => { dragging = false; });
    c.addEventListener("pointercancel", () => { dragging = false; });
  });

  const counter = $("#counter"), prog = $("#dprogress"), partEl = $("#partname");
  const parts = []; let lastPart = "";
  slides.forEach((s, i) => { if (s.dataset.part) lastPart = s.dataset.part; s.dataset.partName = lastPart; if (s.dataset.part) parts.push([s.dataset.part, i]); });

  function go(i, fromHash) {
    i = clamp(i, 0, N - 1); if (i === cur) return;
    stopLoop();
    if (cur >= 0) { const o = inst.get(cur); if (o && o.leave) o.leave(); }
    slides.forEach((s, k) => { s.classList.toggle("on", k === i); s.classList.toggle("before", k < i); s.setAttribute("aria-hidden", k === i ? "false" : "true"); s.inert = k !== i; });
    cur = i; t0 = performance.now();
    const o = instance(i); if (o.enter) o.enter();
    counter.textContent = `${i + 1} / ${N}`;
    prog.style.width = ((i + 1) / N) * 100 + "%";
    partEl.textContent = slides[i].dataset.partName === "Opening" ? "" : slides[i].dataset.partName;
    $("#prev").disabled = i === 0; $("#next").disabled = i === N - 1;
    if (!fromHash) history.replaceState(null, "", "#" + (i + 1));
    document.title = (slides[i].dataset.title || "") + " · A Walk Along the Critical Line";
    kick();
    $$("#contents a").forEach((a) => a.classList.toggle("cur", +a.dataset.i === i));
  }
  const next = () => go(cur + 1), prev = () => go(cur - 1);
  $("#next").addEventListener("click", next); $("#prev").addEventListener("click", prev);

  // contents
  const cin = $("#contents-in");
  let html = "<h2>Contents</h2>", open = false;
  parts.forEach(([name, start], pi) => {
    const end = pi + 1 < parts.length ? parts[pi + 1][1] : N;
    html += `<div class="grp"><h3>${name}</h3>`;
    for (let k = start; k < end; k++) html += `<a href="#${k + 1}" data-i="${k}"><span>${k + 1}</span>${slides[k].dataset.title || ""}</a>`;
    html += "</div>";
  });
  cin.innerHTML = html;
  const contents = $("#contents");
  function toggleContents(v) { open = v ?? !open; contents.classList.toggle("open", open); if (open) { const a = $("#contents a.cur"); if (a) a.scrollIntoView({ block: "center" }); } }
  $("#open-contents").addEventListener("click", () => toggleContents(true));
  $("#close-contents").addEventListener("click", () => toggleContents(false));
  cin.addEventListener("click", (e) => { const a = e.target.closest("a"); if (a) { e.preventDefault(); toggleContents(false); go(+a.dataset.i); } });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select") && !["Escape"].includes(e.key)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") return toggleContents(false);
    if (open) return;
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { if (e.key === " " && e.target.closest("button")) return; e.preventDefault(); next(); }
    else if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === "Home") go(0); else if (e.key === "End") go(N - 1);
    else if (e.key === "c" || e.key === "C") toggleContents();
  });

  // swipe (ignored when it starts on a control or an interactive canvas)
  let sx = null, sy = null;
  $("#stage").addEventListener("touchstart", (e) => {
    const tg = e.target; if (tg.closest("input, button, .seg") || (tg.tagName === "CANVAS" && instance(cur).press)) { sx = null; return; }
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  $("#stage").addEventListener("touchend", (e) => {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) (dx < 0 ? next : prev)();
  }, { passive: true });

  window.addEventListener("hashchange", () => { const n = parseInt(location.hash.slice(1), 10); if (n) go(n - 1, true); });
  window.addEventListener("resize", () => { if (cur >= 0) { render(cur, (performance.now() - t0) / 1000); kick(); } });

  document.addEventListener("DOMContentLoaded", () => {
    const btn = $("#theme-toggle"); if (btn && !btn.dataset.bound) { btn.dataset.bound = 1; }
    const n = parseInt(location.hash.slice(1), 10);
    go(n ? n - 1 : 0, true);
    setTimeout(() => { const h = $("#hint"); if (h) h.style.opacity = 0; }, 6000);
  });
})();
