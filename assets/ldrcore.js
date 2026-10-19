/* LDR core: pure functions that mirror the Arduino sketch and the three Python scripts.
   No DOM in here, so it can be tested in Node. */
(function (root) {
  const C = {};
  // ---------- Arduino helpers (integer maths exactly like the C++ map()) ----------
  C.map = (x, inMin, inMax, outMin, outMax) => Math.trunc(((x - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin;
  C.constrain = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  C.DEFAULTS = { mapIn: 650, tDark: 500, tDim: 300, tBright: 100, delay: 500, noise: 8 };
  C.percent = (raw, cfg) => C.constrain(C.map(raw, cfg.mapIn, 0, 0, 100), 0, 100);
  C.condition = (raw, cfg) => raw > cfg.tDark ? "DARK" : raw > cfg.tDim ? "DIM" : raw > cfg.tBright ? "BRIGHT" : "VERY BRIGHT";
  C.CONDTEXT = { "DARK": "DARK (sensor covered or room lights off)", "DIM": "DIM  (indoor shade or twilight)",
    "BRIGHT": "BRIGHT (indoor light or cloudy daylight)", "VERY BRIGHT": "VERY BRIGHT (direct sunlight or torch)" };
  C.ORDER = ["DARK", "DIM", "BRIGHT", "VERY BRIGHT"];
  C.serialLine = (raw, cfg) => { const p = C.percent(raw, cfg), c = C.condition(raw, cfg);
    return "Raw ADC: " + raw + "  |  Light %: " + p + "%  |  Condition: " + C.CONDTEXT[c]; };
  // ---------- random numbers (seeded so a scenario can be repeated) ----------
  C.rng = function (seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  C.gauss = function (rnd) { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  // ---------- the physical sensor: world light (0-100) -> raw ADC (inverted!) ----------
  C.rawFromWorld = function (w, noise, rnd) {
    const ideal = 690 * (1 - C.constrain(w, 0, 100) / 100);        // dark ~690, full light 0
    const sd = noise * (0.35 + 0.65 * Math.min(1, ideal / 300));    // a little less jitter when bright
    return Math.round(C.constrain(ideal + C.gauss(rnd) * sd, 0, 4095));
  };
  // ---------- Python parse_ldr_line() ----------
  C.parseLine = function (line) {
    const parts = line.split("|"); if (parts.length < 3) return null;
    const rawS = parts[0].replace("Raw ADC:", "").trim();
    const pctS = parts[1].replace("Light %:", "").replace("%", "").trim();
    const cond = parts[2].replace("Condition:", "").trim().split("(")[0].trim();
    if (!/^-?\d+$/.test(rawS) || !/^-?\d+$/.test(pctS)) return null;   // int() would raise ValueError
    return { raw: parseInt(rawS, 10), pct: parseInt(pctS, 10), cond: cond };
  };
  // ---------- scenarios (link to Criterion B designs) ----------
  C.SCENARIOS = {
    CA3: { id: "CA3", name: "Daylight Tracker", unit: "Climate Action · SDG 13", place: "School roof / car park",
      model: "Daylight Sun-Tracker Post", unit2: "Corridor lighting",
      build: function (n, rnd) { // one UAE school day, 05:30 to 18:30, with random clouds
        const clouds = []; for (let k = 0; k < 3; k++) clouds.push({ c: 0.25 + rnd() * 0.5, w: 0.02 + rnd() * 0.035, d: 0.35 + rnd() * 0.35 });
        const out = [];
        for (let i = 0; i < n; i++) { const f = i / (n - 1), h = 5.5 + f * 13; const elev = Math.max(0, Math.sin(Math.PI * (h - 6.2) / 11.6));
          let w = Math.min(100, 150 * Math.pow(elev, 0.75)); clouds.forEach(c => { w *= 1 - c.d * Math.exp(-Math.pow((f - c.c) / c.w, 2)); });
          const hh = Math.floor(h), mm = Math.floor((h - hh) * 60); out.push({ w: w, label: ("0" + hh).slice(-2) + ":" + ("0" + mm).slice(-2) }); }
        return out; } },
    GH1: { id: "GH1", name: "Healthy Light", unit: "Good Health · SDG 3", place: "Classroom study desk",
      model: "Study Desk Lux Pod", unit2: "Classroom lighting",
      build: function (n) { const ev = [["Lights off, blinds closed", .14, 8, 8], ["Teacher switches lights on", .16, 62, 62], ["Blinds opened, sunny window", .18, 62, 93],
        ["Projector on, lights dimmed", .18, 24, 24], ["Book covers the sensor", .06, 0, 0], ["Lights back on", .28, 66, 66]];
        const segs = []; let acc = 0; ev.forEach((e, k) => { const len = k === ev.length - 1 ? n - acc : Math.round(e[1] * n); segs.push({ e: e, a: acc, b: acc + len }); acc += len; });
        const out = []; segs.forEach(s => { for (let i = s.a; i < s.b; i++) { const t = s.b - s.a > 1 ? (i - s.a) / (s.b - s.a - 1) : 0; out.push({ w: s.e[2] + (s.e[3] - s.e[2]) * t, label: s.e[0] }); } });
        return out.slice(0, n); } }
  };
  C.timeline = (key, n, seed) => C.SCENARIOS[key].build(n, C.rng(seed || 1));
  // ---------- build a dataset like 1_data_collection_ldr.py would ----------
  C.fmtTime = function (ms) { const d = new Date(ms), p = x => ("0" + x).slice(-2);
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds()); };
  C.collect = function (key, n, cfg, opts, seed) {
    opts = opts || {}; const rnd = C.rng((seed || 1) * 7 + 3); const tl = C.timeline(key, Math.max(n, 2), seed || 1);
    const spikeAt = new Set(), badAt = new Set();
    for (let k = 0; k < (opts.spikes || 0); k++) spikeAt.add(Math.floor(rnd() * n));
    for (let k = 0; k < (opts.garbled || 0); k++) badAt.add(Math.floor(rnd() * n));
    const rows = [], t0 = Date.now() - n * cfg.delay; let skipped = 0;
    for (let i = 0; i < n; i++) {
      let raw = C.rawFromWorld(tl[i].w, cfg.noise, rnd); if (spikeAt.has(i)) raw = 4095;
      let line = C.serialLine(raw, cfg);
      if (badAt.has(i)) line = line.slice(0, 14 + Math.floor(rnd() * 8));            // cable wobble: half a line arrives
      const p = C.parseLine(line); if (!p) { skipped++; continue; }
      rows.push({ Timestamp: C.fmtTime(t0 + i * cfg.delay), Raw_ADC: p.raw, Light_Percent: p.pct, Condition: p.cond, w: tl[i].w, label: tl[i].label });
    }
    return { rows: rows, skipped: skipped };
  };
  // ---------- statistics (pandas-compatible) ----------
  C.mean = a => a.reduce((s, x) => s + x, 0) / a.length;
  C.std = a => { const m = C.mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)); };   // pandas ddof=1
  C.quantile = (a, q) => { const s = a.slice().sort((x, y) => x - y), p = (s.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p); return s[lo] + (s[hi] - s[lo]) * (p - lo); };
  C.describe = a => a.length ? ({ count: a.length, mean: C.mean(a), std: a.length > 1 ? C.std(a) : NaN, min: Math.min.apply(null, a), q25: C.quantile(a, .25), q50: C.quantile(a, .5), q75: C.quantile(a, .75), max: Math.max.apply(null, a) }) : null;
  C.rolling = (a, w) => a.map((_, i) => { const s = a.slice(Math.max(0, i - w + 1), i + 1); return Math.round(C.mean(s) * 10 + 1e-9) / 10; });
  // ---------- 2_clean_analyse_ldr.py ----------
  C.clean = function (rows, o) {
    o = Object.assign({ dropMissing: true, rangeOn: true, lo: 0, hi: 4095, zOn: true, z: 3.0, win: 5 }, o || {});
    const log = [], kept = [];
    rows.forEach(r => { r._status = "kept"; r._why = ""; });
    let cur = rows;
    if (o.dropMissing) { cur = cur.filter(r => { const bad = !(isFinite(r.Raw_ADC) && isFinite(r.Light_Percent) && r.Condition); if (bad) { r._status = "removed"; r._why = "missing value"; } return !bad; }); }
    if (o.rangeOn) { cur = cur.filter(r => { const bad = !(r.Raw_ADC >= o.lo && r.Raw_ADC <= o.hi); if (bad) { r._status = "removed"; r._why = "outside valid range"; } return !bad; }); }
    let mean = NaN, sd = NaN;
    if (o.zOn && cur.length > 2) { const raws = cur.map(r => r.Raw_ADC); mean = C.mean(raws); sd = C.std(raws);
      if (sd > 0) cur = cur.filter(r => { const z = Math.abs((r.Raw_ADC - mean) / sd); r._z = z; const bad = !(z < o.z); if (bad) { r._status = "removed"; r._why = "z-score " + z.toFixed(1) + " ≥ " + o.z; } return !bad; }); }
    const ma = C.rolling(cur.map(r => r.Light_Percent), o.win);
    const out = cur.map((r, i) => Object.assign({}, r, { Light_Pct_MA5: ma[i] }));
    return { rows: out, opts: o, mean: mean, sd: sd };
  };
  C.condCounts = rows => { const m = {}; rows.forEach(r => { m[r.Condition] = (m[r.Condition] || 0) + 1; }); return m; };
  // ---------- chart helpers ----------
  C.histogram = function (vals, bins) { const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals), w = (hi - lo) / bins || 1, c = new Array(bins).fill(0);
    vals.forEach(v => { let k = Math.floor((v - lo) / w); if (k >= bins) k = bins - 1; c[k]++; }); return { lo: lo, w: w, counts: c }; };
  C.kde = function (vals, xs) { const n = vals.length, sd = C.std(vals) || 1, h = sd * Math.pow(n, -1 / 5);   // Scott's rule
    return xs.map(x => vals.reduce((s, v) => s + Math.exp(-0.5 * Math.pow((x - v) / h, 2)), 0) / (n * h * Math.sqrt(2 * Math.PI))); };
  C.polyfit = function (xs, ys) { const n = xs.length, mx = C.mean(xs), my = C.mean(ys); let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) * (xs[i] - mx); } const m = sxy / sxx; return { m: m, b: my - m * mx }; };
  C.boxStats = function (a) { const q1 = C.quantile(a, .25), q3 = C.quantile(a, .75), iqr = q3 - q1, s = a.slice().sort((x, y) => x - y);
    const loF = q1 - 1.5 * iqr, hiF = q3 + 1.5 * iqr, inl = s.filter(v => v >= loF && v <= hiF);
    return { q1: q1, med: C.quantile(a, .5), q3: q3, lo: inl[0], hi: inl[inl.length - 1], out: s.filter(v => v < loF || v > hiF) }; };
  root.LDR = C; if (typeof module !== "undefined") module.exports = C;
})(typeof window !== "undefined" ? window : globalThis);
