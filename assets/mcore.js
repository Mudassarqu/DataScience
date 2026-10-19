/* PIR motion core: mirrors motion-sensor.ino and the three Python scripts. Pure functions (testable in Node). */
(function (root) {
  const M = {}, L = root.LDR || (typeof require !== "undefined" ? require("./ldrcore.js") : null);
  M.DEFAULTS = { teleMs: 1000, tActive: 2000, tCont: 6000, holdMs: 0, alertOn: true };
  M.HW = { pirHold: 2, bounce: 0, falsePerMin: 0 };       // hardware conditions (not in the code)
  M.statusOf = (motion, dwell, c) => !motion ? "VACANT_STANDBY" : dwell > c.tCont ? "CONTINUOUS_PRESENCE" : dwell > c.tActive ? "ACTIVE_OCCUPANCY" : "TRANSIT_PASSING";
  M.line = (r) => "Motion: " + r.Motion + "  |  State: " + r.State + "  |  Dwell_Time_ms: " + r.Dwell + "  |  Status: " + r.Status;
  // ---- the virtual ESP32: same logic as loop() in the sketch, one call per loop iteration ----
  M.Esp = function (cfg) { this.cfg = cfg; this.last = 0; this.start = 0; this.dwell = 0; this.lastTele = 0; this.relay = 0; this.buzzer = 0; this.lastHigh = 0; this.edges = 0; };
  M.Esp.prototype.step = function (now, raw) {
    const c = this.cfg; let out = null;
    if (raw === 1) this.lastHigh = now;
    const cur = (raw === 1 || (c.holdMs > 0 && this.lastHigh > 0 && now - this.lastHigh < c.holdMs)) ? 1 : 0;   // optional debounce extension
    if (cur === 1 && this.last === 0) { this.start = now; this.relay = 1; this.edges++; }
    else if (cur === 0 && this.last === 1) { this.relay = 0; this.buzzer = 0; this.dwell = 0; }
    this.dwell = cur === 1 ? now - this.start : 0;
    this.last = cur;
    if (now - this.lastTele >= c.teleMs) {
      this.lastTele = now;
      const status = M.statusOf(cur, this.dwell, c);
      if (c.alertOn && status === "CONTINUOUS_PRESENCE") this.buzzer = 1;
      out = { Motion: cur, State: cur ? "MOTION_DETECTED" : "NO_MOTION", Dwell: this.dwell, Status: status, relay: this.relay, buzzer: this.buzzer, t: now };
    }
    return out;
  };
  // ---- the real world: people moving past the PIR, plus the PIR's own behaviour ----
  M.SCENARIOS = { SC5: { name: "Motion Detection for Safer Spaces", place: "School corridor after hours",
    build: function (seed, durS) { const rnd = L.rng(seed * 13 + 5), ev = []; let t = 5 + rnd() * 3;
      while (t < durS - 8) { const kind = rnd(); const mv = kind < .62 ? 0.8 + rnd() * 1.4 : kind < .88 ? 3 + rnd() * 3 : 9 + rnd() * 4;
        ev.push({ a: Math.round(t * 1000), b: Math.round((t + mv) * 1000), kind: kind < .62 ? "passing" : kind < .88 ? "stopping" : "loitering" }); t += mv + 3 + rnd() * 9; }
      return ev; } } };
  M.pirLevel = function (t, ev, hw, falseEv) {
    for (let i = 0; i < ev.length; i++) if (t >= ev[i].a && t <= ev[i].b + hw.pirHold * 1000) return 1;
    for (let i = 0; i < falseEv.length; i++) if (t >= falseEv[i] && t <= falseEv[i] + hw.pirHold * 1000 * 0.6) return 1;
    return 0;
  };
  M.falseEvents = (seed, durS, perMin) => { const rnd = L.rng(seed * 31 + 7), out = []; const n = Math.round(perMin * durS / 60); for (let i = 0; i < n; i++) out.push(Math.round(rnd() * (durS - 3) * 1000)); return out.sort((a, b) => a - b); };
  M.readPin = (t, ev, hw, falseEv, rnd) => { const b = M.pirLevel(t, ev, hw, falseEv); return (b && hw.bounce > 0 && rnd() < hw.bounce / 100) ? 0 : b; };
  // ---- 1_data_collection_motion.py ----
  M.parse = function (line) { const m = /Motion:\s*([01]).*State:\s*([A-Za-z_]+).*Dwell_Time_ms:\s*(\d+).*Status:\s*([A-Za-z_]+)/.exec(line); return m ? { m: +m[1], label: m[2], dwell: +m[3], status: m[4] } : null; };
  M.collect = function (n, cfg, hw, seed, garbled) {
    const durS = n + 2, ev = M.SCENARIOS.SC5.build(seed || 1, durS + 10), fe = M.falseEvents(seed || 1, durS, hw.falsePerMin), rnd = L.rng((seed || 1) * 101 + 9), esp = new M.Esp(cfg), rows = [], bad = new Set();
    for (let k = 0; k < (garbled || 0); k++) bad.add(Math.floor(rnd() * n)); let skipped = 0, t0 = Date.now() - n * 1000;
    for (let t = 0; t < (n + 2) * 1000 && rows.length + skipped < n; t++) {
      const o = esp.step(t, M.readPin(t, ev, hw, fe, rnd)); if (!o) continue; const idx = rows.length + skipped; let line = M.line(o);
      if (bad.has(idx)) line = line.slice(0, 18 + Math.floor(rnd() * 12));
      const p = M.parse(line); if (!p) { skipped++; continue; }
      rows.push({ Timestamp: L.fmtTime(t0 + idx * 1000), Elapsed_Seconds: +(0.59 + idx + (rnd() * 0.02 - 0.005)).toFixed(2), Motion_State: p.m, State_Label: p.label, Dwell_Time_ms: p.dwell, Status: p.status, relay: o.relay, buzzer: o.buzzer });
    }
    return { rows: rows, skipped: skipped, events: ev };
  };
  // ---- 2_clean_analyse_motion.py ----
  M.clean = function (rows, o) {
    o = Object.assign({ win: 10, div: 10, fill: true, dropTs: true }, o || {}); let cur = rows.map(r => Object.assign({}, r));
    if (o.dropTs) cur = cur.filter(r => r.Timestamp && !isNaN(Date.parse(String(r.Timestamp).replace(" ", "T"))));
    const m = cur.map(r => r.Motion_State); const roll = m.map((_, i) => { let s = 0; for (let k = Math.max(0, i - o.win + 1); k <= i; k++) s += m[k]; return s; });
    return cur.map((r, i) => Object.assign(r, { Rolling_Activity: roll[i], Duty_Cycle_Pct: Math.round(roll[i] / o.div * 1000) / 10, Dwell_Seconds: Math.round(r.Dwell_Time_ms / 10) / 100 }));
  };
  M.pearson = function (a, b) { const ma = L.mean(a), mb = L.mean(b); let sab = 0, saa = 0, sbb = 0; for (let i = 0; i < a.length; i++) { sab += (a[i] - ma) * (b[i] - mb); saa += (a[i] - ma) ** 2; sbb += (b[i] - mb) ** 2; } return sab / Math.sqrt(saa * sbb); };
  M.NUM = ["Motion_State", "Dwell_Time_ms", "Rolling_Activity", "Duty_Cycle_Pct"];
  M.corr = rows => M.NUM.map(a => M.NUM.map(b => a === b ? 1 : M.pearson(rows.map(r => r[a]), rows.map(r => r[b]))));
  M.BLUES = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"];
  M.blues = function (t) { t = Math.max(0, Math.min(1, t)); const p = t * (M.BLUES.length - 1), i = Math.min(M.BLUES.length - 2, Math.floor(p)), f = p - i, h = s => [1, 3, 5].map(k => parseInt(s.substr(k, 2), 16)), a = h(M.BLUES[i]), b = h(M.BLUES[i + 1]); return "rgb(" + a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(",") + ")"; };
  root.MOT = M; if (typeof module !== "undefined") module.exports = M;
})(typeof window !== "undefined" ? window : globalThis);
