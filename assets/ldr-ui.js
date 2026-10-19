/* LDR Criterion C lab: UI. Needs ldrcore.js (window.LDR), Chart.js, ldr_data.js (window.LDR_REAL), window.C_IMG */
(function () {
  const L = window.LDR, $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const IMG = window.C_IMG || {};
  const S = { scn: "CA3", cfg: Object.assign({}, L.DEFAULTS), w: 0, hand: false, mode: "manual", running: false, timer: null, tl: [], tli: 0, seed: 1, rnd: L.rng(11),
    lastRaw: null, pctHist: [], rawHist: [], clock: "", collected: null, ds: "sim", src: "sim",
    cl: { dropMissing: true, rangeOn: true, lo: 0, hi: 4095, zOn: true, z: 3.0, win: 5 }, viz: { darkPct: 30, brightPct: 70, bins: 15 },
    py: { n: 100, port: "COM5", csv: "ldr_light_data.csv", spikes: 3, garbled: 2 }, fig: 1, missions: {}, log: [], cleaned: null, dayDone: false,
    imp: { lights: 12, watts: 40, hours: 10, tariff: 0.38, co2: 0.4, days: 190, lesson: 50 } };
  const SCN = {
    CA3: { users: "the school facilities team", title: "Daylight Sun-Tracker Post",
      mission: "Your <strong>Daylight Sun-Tracker Post</strong> must tell the school facilities team when corridor lights can safely be switched <strong>OFF</strong>. You will build the sensing code, collect a virtual school day, clean it, chart it, and calculate the energy saved.",
      rows: [["<strong>Function</strong> · Reads daylight and classifies it every 0.5 s", "Lab 1: Serial Monitor shows Raw ADC, Light % and Condition twice a second.", "Screenshot of Serial Monitor"],
        ["<strong>Function</strong> · Switches corridor lights OFF in bright daylight", "Lab 1 extension LEDs + Lab 5 share of the day when light ≥ bright threshold.", "Lab 5 numbers"],
        ["<strong>Cost / Environment</strong> · Re-uses kit ESP32 + LDR; saves electricity", "Lab 5 estimates kWh, AED and CO₂ saved per year.", "Lab 5 table"],
        ["<strong>Size / Safety</strong> · Low-voltage 3.3 V electronics only", "Wiring plan in C1; no mains voltage in the sketch.", "C1 plan"]],
      act: function (p, t) { return p < t.d ? ["r", "💡 Corridor lights ON (full)", "r"] : p < t.b ? ["y", "💡 Corridor lights DIMMED to 50 %", "y"] : ["g", "🌤️ Daylight is enough: lights OFF", "g"]; } },
    GH1: { users: "students, teachers and librarians", title: "Study Desk Lux Pod",
      mission: "Your <strong>Study Desk Lux Pod</strong> must warn students when their desk light is <strong>too dim</strong> (eye strain) or has <strong>glare</strong> (headaches). You will build the sensing code, collect a virtual lesson, clean it, chart it, and decide what the school should change.",
      rows: [["<strong>Function</strong> · Reads desk light and classifies it every 0.5 s", "Lab 1: Serial Monitor shows Raw ADC, Light % and Condition twice a second.", "Screenshot of Serial Monitor"],
        ["<strong>Function / Customer</strong> · Warns when too dim or glaring", "Lab 1 extension LEDs: red = too dim or glare, green = healthy.", "LED screenshot"],
        ["<strong>Customer</strong> · Shows how long students sit in unhealthy light", "Lab 5 minutes per lesson outside the healthy band.", "Lab 5 numbers"],
        ["<strong>Safety</strong> · Low-voltage 3.3 V electronics only", "Wiring plan in C1; no mains voltage in the sketch.", "C1 plan"]],
      act: function (p, t) { return p < t.d ? ["r", "⚠️ TOO DIM: eye strain, switch on a lamp", "r"] : p > 95 ? ["r", "⚠️ GLARE: close the blinds", "r"] : p < t.b ? ["y", "🙂 A little dim but acceptable", "y"] : ["g", "✅ Healthy light for studying", "g"]; } }
  };
  const PRESETS = [["🖐️ Cover with hand", 0, 1], ["🌑 Room lights off", 10], ["🌥️ Indoor shade", 40], ["💡 Classroom lights", 70], ["☀️ Sunlight / torch", 96]];

  // ================= code panels with editable numbers =================
  const PARAMS = {
    mapIn: { g: () => S.cfg.mapIn, s: v => S.cfg.mapIn = v, min: 1, max: 4095, w: 4, lab: "Lab 1", d: "map() input maximum" },
    tDark: { g: () => S.cfg.tDark, s: v => S.cfg.tDark = v, min: 0, max: 4095, w: 4, lab: "Lab 1", d: "DARK threshold (raw)" },
    tDim: { g: () => S.cfg.tDim, s: v => S.cfg.tDim = v, min: 0, max: 4095, w: 4, lab: "Lab 1", d: "DIM threshold (raw)" },
    tBright: { g: () => S.cfg.tBright, s: v => S.cfg.tBright = v, min: 0, max: 4095, w: 4, lab: "Lab 1", d: "BRIGHT threshold (raw)" },
    delay: { g: () => S.cfg.delay, s: v => S.cfg.delay = v, min: 50, max: 5000, w: 4, lab: "Lab 1", d: "delay() in ms" },
    darkPct: { g: () => S.viz.darkPct, s: v => S.viz.darkPct = v, min: 0, max: 100, w: 3, lab: "Lab 1 / 4", d: "dark % threshold" },
    brightPct: { g: () => S.viz.brightPct, s: v => S.viz.brightPct = v, min: 0, max: 100, w: 3, lab: "Lab 1 / 4", d: "bright % threshold" },
    n: { g: () => S.py.n, s: v => S.py.n = v, min: 10, max: 400, w: 4, lab: "Lab 2", d: "TARGET_SAMPLES" },
    port: { g: () => S.py.port, s: v => S.py.port = v, str: 1, w: 7, lab: "Lab 2", d: "COM_PORT" },
    csv: { g: () => S.py.csv, s: v => S.py.csv = v, str: 1, w: 18, lab: "Lab 2", d: "CSV_FILE" },
    lo: { g: () => S.cl.lo, s: v => S.cl.lo = v, min: 0, max: 4095, w: 4, lab: "Lab 3", d: "valid ADC minimum" },
    hi: { g: () => S.cl.hi, s: v => S.cl.hi = v, min: 0, max: 4095, w: 4, lab: "Lab 3", d: "valid ADC maximum" },
    z: { g: () => S.cl.z, s: v => S.cl.z = v, min: 0.5, max: 6, w: 3, f: 1, lab: "Lab 3", d: "z-score limit" },
    win: { g: () => S.cl.win, s: v => S.cl.win = v, min: 1, max: 20, w: 2, lab: "Lab 3", d: "moving-average window" },
    bins: { g: () => S.viz.bins, s: v => S.viz.bins = v, min: 3, max: 40, w: 2, lab: "Lab 4", d: "histogram bins" }
  };
  const KW = /(\/\/.*|#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(const|int|void|if|else|for|while|def|return|import|from|try|except|as|with|in|and|or|not|True|False|None|print|continue)\b|\b(\d+\.?\d*)\b|\b([A-Za-z_]\w*)(?=\()/g;
  function hl(t) { return esc(t).replace(KW, (m, c, s, k, n, f) => c ? '<span class="cm">' + c + "</span>" : s ? '<span class="st">' + s + "</span>" : k ? '<span class="kw">' + k + "</span>" : n ? '<span class="nu">' + n + "</span>" : f ? '<span class="fn">' + f + "</span>" : m); }
  function renderCode(el, tpl) {
    el.innerHTML = tpl.split(/\[\[(\w+)\]\]/).map((seg, i) => { if (i % 2 === 0) return hl(seg); const p = PARAMS[seg];
      return '<input data-p="' + seg + '" size="' + p.w + '" value="' + esc(p.g()) + '" title="' + p.d + ' (' + (p.str ? "text" : p.min + " to " + p.max) + ')" aria-label="' + p.d + '">'; }).join("");
    el.querySelectorAll("input[data-p]").forEach(inp => {
      const k = inp.dataset.p, p = PARAMS[k]; let before = p.g();
      inp.addEventListener("focus", () => { before = p.g(); });
      inp.addEventListener("input", () => { const v = parseVal(k, inp.value); if (v === null) { inp.classList.add("bad"); return; } inp.classList.remove("bad"); p.s(v); sync(k, inp); changed(k, false); });
      inp.addEventListener("change", () => { const v = parseVal(k, inp.value); if (v === null) { inp.value = before; inp.classList.remove("bad"); p.s(before); sync(k, inp); changed(k, false); return; }
        if (v !== before) { logChange(p.lab, p.d, before, v); before = v; } });
    });
  }
  function parseVal(k, s) { const p = PARAMS[k]; if (p.str) { s = s.trim(); return s ? s : null; } const v = p.f ? parseFloat(s) : parseInt(s, 10); return (isFinite(v) && v >= p.min && v <= p.max) ? v : null; }
  function sync(k, except) { document.querySelectorAll('input[data-p="' + k + '"]').forEach(i => { if (i !== except) i.value = PARAMS[k].g(); }); }
  function logChange(lab, what, a, b) { S.log.push({ t: new Date().toLocaleTimeString(), lab: lab, what: what, from: a, to: b }); renderLog(); }
  function renderLog() { const b = $("logBody"); if (!S.log.length) { b.innerHTML = '<tr><td colspan="6" style="color:var(--muted);">No changes yet. Edit a yellow box in a lab above.</td></tr>'; return; }
    b.innerHTML = S.log.map((r, i) => "<tr><td>" + (i + 1) + "</td><td>" + r.t + "</td><td>" + esc(r.lab) + "</td><td>" + esc(r.what) + "</td><td>" + esc(r.from) + "</td><td><strong>" + esc(r.to) + "</strong></td></tr>").join(""); }
  function changed(k, final) {
    if (["mapIn", "tDark", "tDim", "tBright", "delay", "darkPct", "brightPct"].includes(k)) { if (k === "delay" && S.running) restartTimer(); preview(); checkMissions(); renderCalc(); }
    if (["lo", "hi", "z", "win"].includes(k)) recompute();
    if (["darkPct", "brightPct", "bins"].includes(k)) { drawFig(); renderImpact(); }
  }

  // ================= templates =================
  const INO = `/*
  DataSciensPro Kit - Light Detector Sensor (LDR) - FIXED
  ESP32 | Pin 36 (VP) | Baud Rate: 9600
  LOW value  = BRIGHT (sunlight/torch)
  HIGH value = DARK   (sensor covered)
*/

const int LDR_PIN = 36;
int lightValue = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("------ Light Detector Sensor ------");
  delay(500);
}

void loop() {
  lightValue = analogRead(LDR_PIN);

  // Map the inverted value so 0% = dark, 100% = bright
  int lightPercent = map(lightValue, [[mapIn]], 0, 0, 100);
  lightPercent = constrain(lightPercent, 0, 100);

  Serial.print("Raw ADC: ");
  Serial.print(lightValue);
  Serial.print("  |  Light %: ");
  Serial.print(lightPercent);
  Serial.print("%  |  Condition: ");

  // INVERTED: low raw value = bright, high raw value = dark
  if (lightValue > [[tDark]]) {
    Serial.println("DARK (sensor covered or room lights off)");
  }
  else if (lightValue > [[tDim]]) {
    Serial.println("DIM  (indoor shade or twilight)");
  }
  else if (lightValue > [[tBright]]) {
    Serial.println("BRIGHT (indoor light or cloudy daylight)");
  }
  else {
    Serial.println("VERY BRIGHT (direct sunlight or torch)");
  }

  delay([[delay]]);
}`;
  const INOEXT_CA3 = `const int LED_RED = 25, LED_YELLOW = 26, LED_GREEN = 27;   // set pinMode(..., OUTPUT) in setup()

// add inside loop(), after the Serial lines
if (lightPercent < [[darkPct]]) {            // too dark outside
  digitalWrite(LED_RED, HIGH);               // corridor lights ON
}
else if (lightPercent < [[brightPct]]) {      // some daylight
  digitalWrite(LED_YELLOW, HIGH);            // corridor lights DIMMED
}
else {                                       // plenty of daylight
  digitalWrite(LED_GREEN, HIGH);             // corridor lights OFF
}`;
  const INOEXT_GH1 = `const int LED_RED = 25, LED_YELLOW = 26, LED_GREEN = 27;   // set pinMode(..., OUTPUT) in setup()

// add inside loop(), after the Serial lines
if (lightPercent < [[darkPct]]) {            // too dim for reading
  digitalWrite(LED_RED, HIGH);               // warn: switch on a lamp
}
else if (lightPercent < [[brightPct]]) {      // acceptable
  digitalWrite(LED_YELLOW, HIGH);
}
else if (lightPercent <= 95) {               // healthy range
  digitalWrite(LED_GREEN, HIGH);
}
else {                                       // glare
  digitalWrite(LED_RED, HIGH);               // warn: close the blinds
}`;
  const PY1 = () => `import serial, csv, time
from datetime import datetime

COM_PORT  = '[[port]]'
BAUD_RATE = 9600
CSV_FILE  = '[[csv]]'
TARGET_SAMPLES = [[n]]

def parse_ldr_line(line_str):
    try:
        parts = line_str.split('|')
        if len(parts) >= 3:
            raw_str = parts[0].replace('Raw ADC:', '').strip()
            pct_str = parts[1].replace('Light %:', '').replace('%', '').strip()
            cond_str = parts[2].replace('Condition:', '').strip()
            short_cond = cond_str.split('(')[0].strip()
            return int(raw_str), int(pct_str), short_cond
    except (ValueError, IndexError):
        pass
    return None, None, None

ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=2)
time.sleep(2)
ser.reset_input_buffer()
while row_count < TARGET_SAMPLES:
    line = ser.readline().decode('utf-8', errors='ignore').strip()
    if 'Raw ADC:' in line:
        raw_adc, light_pct, condition = parse_ldr_line(line)
        if raw_adc is not None:
            writer.writerow([now_str, raw_adc, light_pct, condition])
            row_count += 1`;
  const PY2 = () => { const c = S.cl, off = (on, s) => on ? s : s.split("\n").map(l => "# " + l).join("\n") + "   # (switched off)";
    return `df = pd.read_csv(CSV_IN)
df['Raw_ADC'] = pd.to_numeric(df['Raw_ADC'], errors='coerce')

# 3. Drop missing / corrupt rows
${off(c.dropMissing, "df.dropna(subset=['Raw_ADC', 'Light_Percent', 'Condition'], inplace=True)")}

# 4. Keep only valid ADC readings
${off(c.rangeOn, "valid_mask = (df['Raw_ADC'] >= [[lo]]) & (df['Raw_ADC'] <= [[hi]])\ndf_clean = df[valid_mask].copy()")}

# 5. Remove outliers with the Z-score
${off(c.zOn, "mean_val = df_clean['Raw_ADC'].mean()\nstd_val  = df_clean['Raw_ADC'].std()\nz_scores = np.abs((df_clean['Raw_ADC'] - mean_val) / std_val)\ndf_clean = df_clean[z_scores < [[z]]].copy()")}

# 6. Rolling moving average
df_clean['Light_Pct_MA5'] = df_clean['Light_Percent'].rolling(window=[[win]], min_periods=1).mean().round(1)

print(df_clean[['Raw_ADC', 'Light_Percent']].describe().round(2))`; };
  const FIGS = {
    1: { t: "Figure 1: LDR Dynamic Illuminance Over Time", code: `plt.plot(df.index, df['Light_Percent'], color='#06b6d4', label='Measured Light %')
plt.plot(df.index, df['Light_Pct_MA5'], color='#f59e0b', linestyle='--', label='5-Sample Moving Avg')
plt.axhline([[brightPct]], color='#10b981', linestyle=':', label='Bright Threshold')
plt.axhline([[darkPct]], color='#ef4444', linestyle=':', label='Dark Threshold')
plt.ylim(0, 105)
plt.legend(loc='upper right')` },
    2: { t: "Figure 2: Distribution of Detected Ambient Lighting States", code: `order = ['DARK', 'DIM', 'BRIGHT', 'VERY BRIGHT']
counts = df['Condition'].value_counts().reindex(order).fillna(0)
bars = plt.bar(order, counts, color=['#3b82f6', '#06b6d4', '#f59e0b', '#10b981'])
plt.xlabel('Lighting Condition')
plt.ylabel('Observed Count')` },
    3: { t: "Figure 3: Proportion of Classroom Illumination Exposure", code: `colors = ['#1e293b', '#64748b', '#f59e0b', '#38bdf8']
valid_counts = df['Condition'].value_counts()
plt.pie(valid_counts, labels=valid_counts.index, autopct='%1.1f%%',
        startangle=140, colors=colors, wedgeprops=dict(width=0.4))` },
    4: { t: "Figure 4: Frequency Distribution & Statistical Central Tendency", code: `sns.histplot(df['Light_Percent'], kde=True, bins=[[bins]])
plt.axvline(df['Light_Percent'].mean(), color='#ef4444', label='Mean')
plt.axvline(df['Light_Percent'].median(), color='#10b981', linestyle='--', label='Median')
plt.xlabel('Light Percentage (%)')
plt.ylabel('Frequency')` },
    5: { t: "Figure 5: Raw ADC Voltage Variance Across Lighting States", code: `sns.boxplot(x='Condition', y='Raw_ADC', data=df, palette='Set2',
            order=['DARK', 'DIM', 'BRIGHT', 'VERY BRIGHT'])
plt.ylabel('Raw ADC Reading (Inverted Transduction)')` },
    6: { t: "Figure 6: Transduction Transfer Curve (Inverse Linear)", code: `plt.scatter(df['Raw_ADC'], df['Light_Percent'], alpha=0.7, color='#0ea5e9')
m, b = np.polyfit(df['Raw_ADC'], df['Light_Percent'], 1)
plt.plot(df['Raw_ADC'], m*df['Raw_ADC'] + b, color='#ef4444',
         label=f'Fit Line (Slope={m:.3f})')` }
  };

  // ================= scenario selection / B->C link =================
  function renderScenarioUI() {
    const sc = SCN[S.scn], im = IMG[S.scn] || {};
    $("scnPick").innerHTML = Object.keys(SCN).map(k => { const i = IMG[k] || {};
      return '<button class="scn-card' + (k === S.scn ? " on" : "") + '" data-k="' + k + '" aria-pressed="' + (k === S.scn) + '"><img src="' + i.scene + '" alt="Real-world sketch for ' + L.SCENARIOS[k].name + '"><div class="b"><h4>' + L.SCENARIOS[k].name + " · " + SCN[k].title + "</h4><small>" + L.SCENARIOS[k].unit + " · Criterion B lesson " + k + "</small></div></button>"; }).join("");
    $("scnPick").querySelectorAll("button").forEach(b => b.onclick = () => { if (S.scn === b.dataset.k) return; S.scn = b.dataset.k; newScenario(); });
    $("b2c").innerHTML = '<figure><img src="' + im.iso + '" alt="Chosen design"><figcaption>Criterion B · chosen design: ' + sc.title + '</figcaption></figure><figure><img src="' + im.exploded + '" alt="Exploded view"><figcaption>Criterion B · exploded view (the LDR sits at the top)</figcaption></figure><figure><img src="' + im.scene + '" alt="Application sketch"><figcaption>Criterion B · where it lives: ' + L.SCENARIOS[S.scn].place + '</figcaption></figure>';
    $("mission").innerHTML = "<strong>Your mission:</strong> " + sc.mission + ' <a href="' + im.page + '">Open the full Criterion B exemplar →</a>';
    $("b2cTable").innerHTML = sc.rows.map(r => "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>").join("");
    $("svgTitle").textContent = sc.title; $("devImg").src = im.iso; $("devImg").alt = sc.title; $("devName").textContent = "Criterion B: " + sc.title;
    document.querySelectorAll(".scnName").forEach(e => e.textContent = "your " + sc.title); $("usersName").textContent = sc.users;
    renderCode($("inoExt"), S.scn === "CA3" ? INOEXT_CA3 : INOEXT_GH1);
  }
  function newScenario() {
    stopRun(); S.tl = L.timeline(S.scn, 120, S.seed); S.tli = 0; S.dayDone = false; S.clock = ""; $("clockLbl").textContent = "";
    S.collected = L.collect(S.scn, S.py.n, S.cfg, { spikes: S.py.spikes, garbled: S.py.garbled }, S.seed);
    renderScenarioUI(); preview(); recompute(); renderImpact();
  }

  // ================= Lab 1 =================
  let liveChart = null;
  function initLive() {
    liveChart = new Chart($("liveChart"), { type: "line", data: { labels: [], datasets: [
      { label: "Light %", data: [], borderColor: "#06b6d4", borderWidth: 2, pointRadius: 0, tension: .25, yAxisID: "y" },
      { label: "Raw ADC", data: [], borderColor: "#c0392b", borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, yAxisID: "y1" }] },
      options: { animation: false, maintainAspectRatio: false, plugins: { legend: { position: "top" } }, scales: { x: { display: false }, y: { min: 0, max: 105, title: { display: true, text: "Light %" } }, y1: { position: "right", min: 0, max: 800, grid: { drawOnChartArea: false }, title: { display: true, text: "Raw ADC (inverted)" } } } } });
  }
  function condClass(c) { return c === "VERY BRIGHT" ? "VERY" : c; }
  function showReading(raw) {
    const p = L.percent(raw, S.cfg), c = L.condition(raw, S.cfg), t = { d: S.viz.darkPct, b: S.viz.brightPct };
    $("rdRaw").textContent = raw; $("rdPct").textContent = p + "%"; $("rdBar").style.width = p + "%";
    const chip = $("rdCond"); chip.textContent = c; chip.className = "chip " + condClass(c);
    const a = SCN[S.scn].act(p, t); $("devState").textContent = a[1];
    ["r", "y", "g"].forEach(x => { $("l" + x.toUpperCase()).classList.toggle("on", a[0] === x); $("s" + x.toUpperCase()).setAttribute("fill", a[0] === x ? { r: "#ff3b30", y: "#ffb300", g: "#2ecc71" }[x] : "#555"); });
    return { p: p, c: c };
  }
  function drawLight() {
    const w = S.w; $("wVal").textContent = Math.round(w); $("wSlider").value = w;
    $("halo").setAttribute("opacity", (w / 100).toFixed(2)); $("halo").setAttribute("r", 30 + w * 0.5); $("sun").setAttribute("fill", "hsl(" + (40 + w * 0.1) + ",100%," + (30 + w * 0.36) + "%)");
    $("beam").setAttribute("opacity", (w / 100).toFixed(2)); $("hand").setAttribute("opacity", S.hand ? 1 : 0);
  }
  function sampleOnce(print) {
    let w = S.w;
    if (S.mode === "timeline") { const t = S.tl[S.tli]; w = t.w; S.w = w; S.clock = t.label; S.hand = false; S.tli++; $("clockLbl").textContent = S.scn === "CA3" ? "🕒 " + t.label : "🎬 " + t.label; drawLight();
      if (S.tli >= S.tl.length) { S.dayDone = true; S.mode = "manual"; S.tli = 0; $("dayBtn").textContent = "📅 Play the whole scenario"; stopRun(); } }
    const raw = L.rawFromWorld(w, S.cfg.noise, S.rnd); S.lastRaw = raw;
    const r = showReading(raw);
    if (print) { addSerial(L.serialLine(raw, S.cfg), r.c); S.pctHist.push(r.p); S.rawHist.push(raw); if (S.pctHist.length > 60) { S.pctHist.shift(); S.rawHist.shift(); }
      liveChart.data.labels = S.pctHist.map((_, i) => i); liveChart.data.datasets[0].data = S.pctHist; liveChart.data.datasets[1].data = S.rawHist; liveChart.update("none"); }
    checkMissions();
  }
  function preview() { if (S.lastRaw === null) S.lastRaw = L.rawFromWorld(S.w, 0, S.rnd); if (!S.running) { const raw = L.rawFromWorld(S.w, 0, S.rnd); S.lastRaw = raw; showReading(raw); } else showReading(S.lastRaw); drawLight(); }
  const serialEl = $("serial");
  function addSerial(line, cond) { const d = document.createElement("div"); d.className = "l-" + condClass(cond); d.textContent = line; serialEl.appendChild(d);
    while (serialEl.childNodes.length > 80) serialEl.removeChild(serialEl.firstChild); serialEl.scrollTop = serialEl.scrollHeight; }
  function note(msg) { const d = document.createElement("div"); d.className = "dim"; d.textContent = msg; serialEl.appendChild(d); serialEl.scrollTop = serialEl.scrollHeight; }
  function interval() { return Math.max(20, S.cfg.delay / parseInt($("speedSel").value, 10)); }
  function startRun() { if (S.running) return; S.running = true; $("runBtn").textContent = "■ Stop"; $("runBtn").className = "stop"; if (!serialEl.childNodes.length) note("------ Light Detector Sensor ------\nSensor: LDR | Pin: 36 | DataSciensPro Kit"); S.timer = setInterval(() => sampleOnce(true), interval()); }
  function restartTimer() { if (!S.running) return; clearInterval(S.timer); S.timer = setInterval(() => sampleOnce(true), interval()); }
  function stopRun() { S.running = false; clearInterval(S.timer); $("runBtn").textContent = "▶ Run virtual ESP32"; $("runBtn").className = "go"; if (S.mode === "timeline") { S.mode = "manual"; $("dayBtn").textContent = "📅 Play the whole scenario"; } }
  function initLab1() {
    renderCode($("ino"), INO);
    $("presets").innerHTML = PRESETS.map((p, i) => '<button class="alt" data-i="' + i + '">' + p[0] + "</button>").join("");
    $("presets").querySelectorAll("button").forEach(b => b.onclick = () => { const p = PRESETS[+b.dataset.i]; S.mode = "manual"; S.w = p[1]; S.hand = !!p[2]; preview(); if (S.running) { /* next tick picks it up */ } else sampleOnce(false); });
    $("wSlider").oninput = e => { S.w = +e.target.value; S.hand = false; if (S.mode === "timeline") { S.mode = "manual"; $("dayBtn").textContent = "📅 Play the whole scenario"; } preview(); };
    $("runBtn").onclick = () => S.running ? stopRun() : startRun();
    $("dayBtn").onclick = () => { if (S.mode === "timeline") { S.mode = "manual"; $("dayBtn").textContent = "📅 Play the whole scenario"; return; } S.mode = "timeline"; S.tli = 0; $("dayBtn").textContent = "⏸ Stop the scenario"; if (!S.running) startRun(); };
    $("speedSel").onchange = restartTimer;
    $("noiseSl").oninput = e => { S.cfg.noise = +e.target.value; $("noiseVal").textContent = e.target.value; };
    $("clrBtn").onclick = () => { serialEl.innerHTML = ""; };
  }
  function renderCalc() {
    const raw = S.calcRaw === undefined ? 325 : S.calcRaw, a = S.cfg.mapIn, num = (raw - a) * 100, den = 0 - a, q = Math.trunc(num / den), p = L.constrain(q, 0, 100);
    $("calc").innerHTML = 'Raw ADC = <input id="calcRaw" type="number" value="' + raw + '" min="0" max="4095"> &nbsp; (try 0, 325, 650, 800)<br>map(' + raw + ", " + a + ", 0, 0, 100) = (" + raw + " − " + a + ") × (100 − 0) ÷ (0 − " + a + ") + 0 = " + num + " ÷ " + den + " = <strong>" + q + "</strong> (whole numbers only)<br>constrain(" + q + ", 0, 100) = <strong>" + p + " %</strong> &nbsp; → condition: <strong>" + L.condition(raw, S.cfg) + "</strong>";
    $("calcRaw").oninput = e => { const v = parseInt(e.target.value, 10); if (isFinite(v) && v >= 0 && v <= 4095) { S.calcRaw = v; const pos = e.target.selectionStart; renderCalc(); const n = $("calcRaw"); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } };
  }
  const MISSIONS = [
    ["Make the sensor report <strong>VERY BRIGHT</strong>", "Press Run, then the Sunlight / torch preset.", () => S.lastRaw !== null && S.running && L.condition(S.lastRaw, S.cfg) === "VERY BRIGHT"],
    ["Get <strong>0 %</strong> with the sensor covered", "Press Run, then Cover with hand.", () => S.running && S.hand && L.percent(S.lastRaw, S.cfg) === 0],
    ["Change a threshold so that a raw reading of <strong>250</strong> counts as <strong>DIM</strong>", "Which number decides DIM? Make it lower than 250.", () => L.condition(250, S.cfg) === "DIM"],
    ["Calibrate map() so a raw reading of <strong>400</strong> gives about <strong>50 %</strong>", "Change the first number inside map(). Use the maths box below to check.", () => { const p = L.percent(400, S.cfg); return p >= 47 && p <= 53; }],
    ["Play the whole scenario to the end and watch the LEDs", "Press “Play the whole scenario” (speed 25× is quick).", () => S.dayDone]
  ];
  function checkMissions() { let n = 0; MISSIONS.forEach((m, i) => { if (!S.missions[i] && m[2]()) { S.missions[i] = true; logChange("Lab 1", "Mission done", "", "✅ " + m[0].replace(/<[^>]+>/g, "")); } if (S.missions[i]) n++; });
    $("missions").innerHTML = MISSIONS.map((m, i) => '<li class="' + (S.missions[i] ? "done" : "") + '"><span class="tick">' + (S.missions[i] ? "✓" : "") + "</span><span>" + m[0] + '<span class="hint">' + m[1] + "</span></span></li>").join("");
    $("missCount").textContent = n + " / " + MISSIONS.length; }

  // ================= Lab 2 =================
    function realRows(kind) { const R = window.LDR_REAL; return (kind === "clean" ? R.clean : R.raw).map(r => ({ Timestamp: r[0], Raw_ADC: r[1], Light_Percent: r[2], Condition: r[3], Light_Pct_MA5: r[4] })); }
  function fmtRow(r) { return ("  " + r.Timestamp).padEnd(22) + " | " + String(r.Raw_ADC).padStart(8) + " | " + (r.Light_Percent + "%").padStart(8) + " | " + r.Condition.padEnd(15); }
  function runCollector() {
    const out = $("py1out"); let txt = "=".repeat(65) + "\n  DataSciensPro — LDR Sensor Data Collector\n  Target Port: " + S.py.port + " @ 9600 baud\n  Destination: " + S.py.csv + "\n" + "=".repeat(65) + "\n✓ Connected to ESP32! Reading live light data...\n\n  " + "Timestamp".padEnd(20) + " | " + "Raw ADC".padStart(8) + " | " + "Light %".padStart(8) + " | " + "Condition".padEnd(15) + "\n  " + "-".repeat(60) + "\n";
    let rows, skipped = 0;
    if (S.src === "real") { rows = realRows("raw"); } else { const g = L.collect(S.scn, S.py.n, S.cfg, { spikes: S.py.spikes, garbled: S.py.garbled }, S.seed); rows = g.rows; skipped = g.skipped; }
    S.collected = { rows: rows, skipped: skipped, real: S.src === "real" };
    rows.forEach(r => { txt += fmtRow(r) + "\n"; });
    txt += "\n" + "=".repeat(65) + "\n✓ Completed! Successfully wrote " + rows.length + " records to '" + S.py.csv + "'.\n  Next Step: Run 'python 2_clean_analyse.py' for Exploratory Data Analysis.\n" + "=".repeat(65) + "\n";
    if (skipped) txt += "\n[simulator note] " + skipped + " garbled line(s) failed parse_ldr_line() and were skipped, so the script just waited for the next good line.\n";
    out.textContent = txt; out.scrollTop = 0;
    if (S.src === "real") { S.ds = "real"; document.querySelector('input[name=ds][value=real]').checked = true; }
    else { S.ds = "sim"; document.querySelector('input[name=ds][value=sim]').checked = true; }
    logChange("Lab 2", "Ran the collector (" + (S.src === "real" ? "real data" : "simulated: " + rows.length + " rows, " + S.py.spikes + " spikes, " + S.py.garbled + " garbled") + ")", "", "✓");
    recompute();
  }
  function pyRepr(s) { return "'" + s.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'"; }
  function renderParse() {
    const line = $("parseIn").value; let o = ">>> line_str = " + pyRepr(line) + "\n";
    const parts = line.split("|"); o += ">>> parts = line_str.split('|')\n>>> parts\n[" + parts.map(pyRepr).join(", ") + "]\n>>> len(parts) >= 3\n" + (parts.length >= 3 ? "True" : "False   # so the function skips the if-block") + "\n";
    if (parts.length >= 3) {
      const rawS = parts[0].replace("Raw ADC:", "").trim(), pctS = parts[1].replace("Light %:", "").replace("%", "").trim(), condS = parts[2].replace("Condition:", "").trim(), sh = condS.split("(")[0].trim();
      o += ">>> raw_str = parts[0].replace('Raw ADC:', '').strip()\n" + pyRepr(rawS) + "\n>>> pct_str = parts[1].replace('Light %:', '').replace('%', '').strip()\n" + pyRepr(pctS) + "\n>>> short_cond = cond_str.split('(')[0].strip()\n" + pyRepr(sh) + "\n";
      const p = L.parseLine(line); o += p ? ">>> parse_ldr_line(line_str)\n(" + p.raw + ", " + p.pct + ", " + pyRepr(p.cond) + ")" : ">>> int(" + pyRepr(/^-?\d+$/.test(rawS) ? pctS : rawS) + ")\nValueError: invalid literal for int()  → caught by except → returns (None, None, None)";
    } else o += ">>> parse_ldr_line(line_str)\n(None, None, None)";
    $("parseOut").textContent = o;
  }
  function csvText(rows) { return "Timestamp,Raw_ADC,Light_Percent,Condition\n" + rows.map(r => [r.Timestamp, r.Raw_ADC, r.Light_Percent, r.Condition].join(",")).join("\n") + "\n"; }
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type || "text/csv" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function initLab2() {
    renderCode($("py1"), PY1());
    document.querySelectorAll("input[name=src]").forEach(r => r.onchange = () => { S.src = r.value; });
    $("spikeSl").oninput = e => { S.py.spikes = +e.target.value; $("spikeVal").textContent = e.target.value; };
    $("garbSl").oninput = e => { S.py.garbled = +e.target.value; $("garbVal").textContent = e.target.value; };
    $("collectBtn").onclick = runCollector;
    $("weatherBtn").onclick = () => { S.seed = Math.floor(Math.random() * 9000) + 2; S.tl = L.timeline(S.scn, 120, S.seed); runCollector(); };
    $("dlRaw").onclick = () => download(S.py.csv || "ldr_light_data.csv", csvText(S.collected.rows));
    $("parseIn").oninput = renderParse; renderParse();
  }

  // ================= Lab 3 =================
  function recompute() {
    let raw;
    if (S.ds === "realclean") { const rows = realRows("clean"); S.cleaned = { rows: rows, opts: S.cl, mean: NaN, sd: NaN, all: rows, already: true }; }
    else { raw = S.ds === "real" ? realRows("raw") : S.collected.rows.map(r => Object.assign({}, r)); const c = L.clean(raw, S.cl); c.all = raw; S.cleaned = c; }
    renderLab3(); drawFig(); renderImpact();
  }
  function fmt2(x) { return isFinite(x) ? x.toFixed(2) : "NaN"; }
  function renderLab3() {
    const c = S.cleaned, rows = c.rows, all = c.all;
    ["tgMissing", "tgRange", "tgZ"].forEach(id => $(id).disabled = !!c.already);
    let o = "";
    if (c.already) o += "• This file (ldr_light_clean.csv) was already cleaned by the script.\n  Cleaning steps are not applied again, so Figures 1-6 match the printed ones.\n\n";
    o += "• Ingested raw observations: " + all.length + " rows\n\n--- DESCRIPTIVE SUMMARY STATISTICS ---\n";
    const a = L.describe(rows.map(r => r.Raw_ADC)), b = L.describe(rows.map(r => r.Light_Percent));
    if (a) { o += "       " + "Raw_ADC".padStart(10) + "Light_Percent".padStart(15) + "\n"; [["count", "count"], ["mean", "mean"], ["std", "std"], ["min", "min"], ["25%", "q25"], ["50%", "q50"], ["75%", "q75"], ["max", "max"]].forEach(k => { o += k[0].padEnd(7) + fmt2(a[k[1]]).padStart(10) + fmt2(b[k[1]]).padStart(15) + "\n"; }); }
    else o += "(no rows left!)\n";
    o += "\n--- CONDITION CATEGORY DISTRIBUTION ---\n"; const cc = L.condCounts(rows); Object.keys(cc).sort((x, y) => cc[y] - cc[x]).forEach(k => { o += "  " + k.padEnd(15) + ": " + String(cc[k]).padStart(4) + " samples (" + ((cc[k] / rows.length) * 100).toFixed(1).padStart(5) + "%)\n"; });
    o += "\n✓ Saved clean telemetry to 'ldr_light_clean.csv' (" + rows.length + " rows remaining).";
    $("py2out").textContent = o;
    const removed = all.length - rows.length, why = {}; if (!c.already) all.forEach(r => { if (r._status === "removed") why[r._why.replace(/ [\d.]+ ≥.*/, "")] = (why[r._why.replace(/ [\d.]+ ≥.*/, "")] || 0) + 1; });
    $("cleanKpi").innerHTML = "<div><b>" + all.length + "</b><small>rows ingested</small></div><div><b style='color:#c0392b'>" + removed + "</b><small>rows removed</small></div><div><b style='color:#1b8a5a'>" + rows.length + "</b><small>rows kept</small></div><div><b>" + (b ? b.mean.toFixed(1) : "–") + "%</b><small>mean Light %</small></div><div><b>" + (b ? b.q50.toFixed(1) : "–") + "%</b><small>median Light %</small></div>";
    let t = "<table><tr><th>#</th><th>Time</th><th>Raw_ADC</th><th>Light_Percent</th><th>Condition</th><th>Status</th></tr>";
    all.slice(0, 150).forEach((r, i) => { const rem = r._status === "removed"; t += '<tr class="' + (rem ? "removed" : "") + '"><td>' + (i + 1) + "</td><td>" + String(r.Timestamp).slice(11) + "</td><td>" + r.Raw_ADC + "</td><td>" + r.Light_Percent + "</td><td>" + r.Condition + "</td><td>" + (rem ? "✗ " + r._why : "✓ kept") + "</td></tr>"; });
    $("dtable").innerHTML = t + "</table>" + (all.length > 150 ? '<p class="legend" style="padding:6px 10px;">Showing the first 150 rows.</p>' : "");
  }
  function initLab3() {
    renderCode($("py2"), PY2());
    document.querySelectorAll("input[name=ds]").forEach(r => r.onchange = () => { S.ds = r.value; recompute(); });
    [["tgMissing", "dropMissing", "Step 3 drop missing"], ["tgRange", "rangeOn", "Step 4 valid range"], ["tgZ", "zOn", "Step 5 z-score"]].forEach(a => $(a[0]).onchange = e => { S.cl[a[1]] = e.target.checked; logChange("Lab 3", a[2], e.target.checked ? "off" : "on", e.target.checked ? "on" : "off"); renderCode($("py2"), PY2()); recompute(); });
  }

  // ================= Lab 4 =================
  let chart = null; const FC = ["#06b6d4", "#f59e0b", "#10b981", "#ef4444"];
  const ORD = L.ORDER, CAT = { "DARK": "#3b82f6", "DIM": "#06b6d4", "BRIGHT": "#f59e0b", "VERY BRIGHT": "#10b981" }, SET2 = { "DARK": "#66c2a5", "DIM": "#fc8d62", "BRIGHT": "#8da0cb", "VERY BRIGHT": "#e78ac3" };
  function destroyChart() { if (chart) { chart.destroy(); chart = null; } }
  function canvasFor() { destroyChart(); const box = $("chartbox"); box.innerHTML = '<canvas id="mainChart"></canvas>'; return $("mainChart"); }
  const barLabels = { id: "barLabels", afterDatasetsDraw(ch) { const c = ch.ctx; ch.getDatasetMeta(0).data.forEach((b, i) => { c.save(); c.fillStyle = "#1e293b"; c.font = "bold 13px sans-serif"; c.textAlign = "center"; c.fillText(ch.data.datasets[0].data[i], b.x, b.y - 6); c.restore(); }); } };
  const pieLabels = { id: "pieLabels", afterDatasetsDraw(ch) { const c = ch.ctx, d = ch.data.datasets[0].data, tot = d.reduce((s, x) => s + x, 0); ch.getDatasetMeta(0).data.forEach((a, i) => { if (!d[i]) return; const p = a.tooltipPosition(); c.save(); c.fillStyle = "#fff"; c.font = "bold 13px sans-serif"; c.textAlign = "center"; c.fillText((d[i] / tot * 100).toFixed(1) + "%", p.x, p.y + 4); c.restore(); }); } };
  function plot2d(canvas, o) { const dpr = window.devicePixelRatio || 1, W = canvas.parentNode.clientWidth, H = 390; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + "px"; canvas.style.height = H + "px";
    const c = canvas.getContext("2d"); c.scale(dpr, dpr); c.clearRect(0, 0, W, H); const m = { l: 58, r: 18, t: 16, b: 58 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const X = x => m.l + (x - o.x0) / (o.x1 - o.x0) * pw, Y = y => m.t + ph - (y - o.y0) / (o.y1 - o.y0) * ph; c.font = "12px sans-serif"; c.fillStyle = "#334"; c.strokeStyle = "#e1e7ee"; c.lineWidth = 1;
    (o.yt || []).forEach(v => { c.beginPath(); c.moveTo(m.l, Y(v)); c.lineTo(W - m.r, Y(v)); c.stroke(); c.textAlign = "right"; c.fillText(v, m.l - 6, Y(v) + 4); });
    (o.xt || []).forEach(v => { c.beginPath(); c.moveTo(X(v), m.t); c.lineTo(X(v), H - m.b); c.stroke(); c.textAlign = "center"; c.fillText(v, X(v), H - m.b + 16); });
    c.strokeStyle = "#445"; c.strokeRect(m.l, m.t, pw, ph); c.textAlign = "center"; c.font = "13px sans-serif"; c.fillText(o.xl, m.l + pw / 2, H - 8); c.save(); c.translate(14, m.t + ph / 2); c.rotate(-Math.PI / 2); c.fillText(o.yl, 0, 0); c.restore();
    return { c: c, X: X, Y: Y, m: m, W: W, H: H, pw: pw, ph: ph }; }
  function drawFig() {
    if (!S.cleaned) return; const rows = S.cleaned.rows, f = S.fig, F = FIGS[f]; $("figTitle").textContent = F.t;
    document.querySelectorAll("#figTabs button").forEach(b => b.classList.toggle("on", +b.dataset.f === f));
    if (!rows.length) { $("chartbox").innerHTML = '<p style="padding:30px;">No rows left after cleaning, so there is nothing to chart. Relax a cleaning step in Lab 3.</p>'; $("insight").textContent = ""; return; }
    const pct = rows.map(r => r.Light_Percent), raw = rows.map(r => r.Raw_ADC), idx = rows.map((_, i) => i), cnt = L.condCounts(rows), n = rows.length, mean = L.mean(pct), med = L.quantile(pct, .5), v = S.viz; let ins = "";
    const cv = canvasFor(); const base = { animation: false, maintainAspectRatio: false, responsive: true };
    if (f === 1) { chart = new Chart(cv, { type: "line", data: { labels: idx, datasets: [{ label: "Measured Light %", data: pct, borderColor: "#06b6d4", borderWidth: 2.5, pointRadius: 0 }, { label: "5-Sample Moving Avg", data: rows.map(r => r.Light_Pct_MA5), borderColor: "#f59e0b", borderDash: [8, 5], borderWidth: 2.5, pointRadius: 0 }, { label: "Bright Threshold (" + v.brightPct + "%)", data: idx.map(() => v.brightPct), borderColor: "#10b981", borderDash: [2, 4], borderWidth: 2, pointRadius: 0 }, { label: "Dark Threshold (" + v.darkPct + "%)", data: idx.map(() => v.darkPct), borderColor: "#ef4444", borderDash: [2, 4], borderWidth: 2, pointRadius: 0 }] },
      options: Object.assign({ plugins: { legend: { position: "top" } }, scales: { y: { min: 0, max: 105, title: { display: true, text: "Light Intensity (%)" } }, x: { title: { display: true, text: "Sample Index (Time Sequence)" } } } }, base) });
      const above = pct.filter(p => p >= v.brightPct).length, below = pct.filter(p => p < v.darkPct).length, pk = Math.max.apply(null, pct);
      ins = "<strong>Read it:</strong> light reached a peak of <strong>" + pk + "%</strong>. " + (above / n * 100).toFixed(0) + "% of readings were above your bright line (" + v.brightPct + "%) and " + (below / n * 100).toFixed(0) + "% were below your dark line (" + v.darkPct + "%). The orange moving average smooths short flickers, so it shows the trend more clearly than the noisy blue line."; }
    if (f === 2) { chart = new Chart(cv, { type: "bar", data: { labels: ORD, datasets: [{ data: ORD.map(k => cnt[k] || 0), backgroundColor: ORD.map(k => CAT[k]), borderColor: "#1e293b", borderWidth: 2 }] }, plugins: [barLabels],
      options: Object.assign({ layout: { padding: { top: 24 } }, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: "Observed Count" } }, x: { title: { display: true, text: "Lighting Condition" } } } }, base) });
      const top = ORD.slice().sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0))[0]; ins = "<strong>Read it:</strong> the most common state was <strong>" + top + "</strong> (" + (cnt[top] || 0) + " of " + n + " readings). A bar chart is right here because Condition is a <em>category</em>, not a number."; }
    if (f === 3) { const ks = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]), cols = ["#1e293b", "#64748b", "#f59e0b", "#38bdf8"];
      chart = new Chart(cv, { type: "doughnut", data: { labels: ks, datasets: [{ data: ks.map(k => cnt[k]), backgroundColor: cols, borderColor: "#fff", borderWidth: 3 }] }, plugins: [pieLabels], options: Object.assign({ cutout: "55%", plugins: { legend: { position: "right" } } }, base) });
      ins = "<strong>Read it:</strong> " + ks.map(k => k + " " + (cnt[k] / n * 100).toFixed(1) + "%").join(", ") + ". Notice the colours are given <em>in order of size</em> (biggest slice = first colour), so the same condition can change colour between datasets. Is that a problem for a reader?"; }
    if (f === 4) { const H = L.histogram(pct, v.bins), xs = []; for (let i = 0; i <= 100; i++) xs.push(H.lo + (Math.max.apply(null, pct) - H.lo) * i / 100); const k = L.kde(pct, xs), mx = Math.max.apply(null, H.counts), kmax = Math.max.apply(null, k.map(y => y * n * H.w));
      const ymax = Math.ceil(Math.max(mx, kmax) * 1.08), step = ymax > 20 ? 5 : ymax > 10 ? 2 : 1, yt = []; for (let y = 0; y <= ymax; y += step) yt.push(y);
      canvasFor(); destroyChart(); const cvs = $("mainChart"), hi = Math.max.apply(null, pct), P = plot2d(cvs, { x0: Math.min(-2, H.lo - 4), x1: Math.max(104, hi + 4), y0: 0, y1: ymax, xt: [0, 20, 40, 60, 80, 100], yt: yt, xl: "Light Percentage (%)", yl: "Frequency" }), c = P.c;
      c.fillStyle = "rgba(2,132,199,.5)"; c.strokeStyle = "#000"; H.counts.forEach((ct, i) => { const x0 = P.X(H.lo + i * H.w), x1 = P.X(H.lo + (i + 1) * H.w); c.fillRect(x0, P.Y(ct), x1 - x0, P.Y(0) - P.Y(ct)); c.strokeRect(x0, P.Y(ct), x1 - x0, P.Y(0) - P.Y(ct)); });
      c.strokeStyle = "#0284c7"; c.lineWidth = 2.5; c.beginPath(); xs.forEach((x, i) => { const y = k[i] * n * H.w; i ? c.lineTo(P.X(x), P.Y(y)) : c.moveTo(P.X(x), P.Y(y)); }); c.stroke();
      c.lineWidth = 2.5; c.strokeStyle = "#ef4444"; c.beginPath(); c.moveTo(P.X(mean), P.m.t); c.lineTo(P.X(mean), P.Y(0)); c.stroke(); c.strokeStyle = "#10b981"; c.setLineDash([8, 5]); c.beginPath(); c.moveTo(P.X(med), P.m.t); c.lineTo(P.X(med), P.Y(0)); c.stroke(); c.setLineDash([]);
      c.fillStyle = "#fff"; c.strokeStyle = "#ccd"; c.lineWidth = 1; c.fillRect(P.W - 190, P.m.t + 6, 176, 52); c.strokeRect(P.W - 190, P.m.t + 6, 176, 52); c.font = "13px sans-serif"; c.textAlign = "left"; c.fillStyle = "#ef4444"; c.fillText("━ Mean: " + mean.toFixed(1) + "%", P.W - 180, P.m.t + 26); c.fillStyle = "#10b981"; c.fillText("╍ Median: " + med.toFixed(1) + "%", P.W - 180, P.m.t + 46);
      ins = "<strong>Read it:</strong> mean = <strong>" + mean.toFixed(1) + "%</strong>, median = <strong>" + med.toFixed(1) + "%</strong>. " + (mean > med + 3 ? "The mean is pulled up by a few very bright readings (a right-skewed shape), so the median describes the <em>typical</em> reading better." : mean < med - 3 ? "The mean is pulled down by a few very dark readings, so the median describes the typical reading better." : "Mean and median are close, so the data are fairly balanced.") + " Try changing the number of bins: the same data can look very different."; }
    if (f === 5) { const groups = ORD.filter(k => cnt[k]).map(k => ({ k: k, s: L.boxStats(rows.filter(r => r.Condition === k).map(r => r.Raw_ADC)) })), all = [].concat.apply([], groups.map(g => g.s.out.concat([g.s.hi, g.s.lo]))), ymax = Math.ceil(Math.max.apply(null, raw) / 100) * 100 + 40;
      canvasFor(); destroyChart(); const P = plot2d($("mainChart"), { x0: 0, x1: groups.length, y0: -40, y1: ymax, xt: [], yt: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].filter(y => y <= ymax), xl: "Condition", yl: "Raw ADC Reading (Inverted Transduction)" }), c = P.c;
      groups.forEach((g, i) => { const cx = P.X(i + .5), hw = P.pw / groups.length * .38, s = g.s; c.fillStyle = SET2[g.k]; c.strokeStyle = "#555"; c.lineWidth = 2; c.fillRect(cx - hw, P.Y(s.q3), 2 * hw, P.Y(s.q1) - P.Y(s.q3)); c.strokeRect(cx - hw, P.Y(s.q3), 2 * hw, P.Y(s.q1) - P.Y(s.q3));
        c.beginPath(); c.moveTo(cx - hw, P.Y(s.med)); c.lineTo(cx + hw, P.Y(s.med)); c.moveTo(cx, P.Y(s.q3)); c.lineTo(cx, P.Y(s.hi)); c.moveTo(cx, P.Y(s.q1)); c.lineTo(cx, P.Y(s.lo)); c.moveTo(cx - hw / 2, P.Y(s.hi)); c.lineTo(cx + hw / 2, P.Y(s.hi)); c.moveTo(cx - hw / 2, P.Y(s.lo)); c.lineTo(cx + hw / 2, P.Y(s.lo)); c.stroke();
        s.out.forEach(o => { c.beginPath(); c.arc(cx, P.Y(o), 4.5, 0, 7); c.stroke(); }); c.fillStyle = "#334"; c.font = "13px sans-serif"; c.textAlign = "center"; c.fillText(g.k, cx, P.H - P.m.b + 18); c.fillText("n=" + cnt[g.k], cx, P.H - P.m.b + 32); });
      const d = groups.length > 1 ? groups[0].s.med - groups[groups.length - 1].s.med : 0; ins = "<strong>Read it:</strong> the boxes step <strong>down</strong> as the light gets brighter, because this LDR circuit is <em>inverted</em> (low raw number = bright). " + (groups.length > 1 ? "The median raw reading falls by about " + Math.round(d) + " between " + groups[0].k + " and " + groups[groups.length - 1].k + ". " : "") + "Circles beyond the whiskers are outliers."; }
    if (f === 6) { const fit = L.polyfit(raw, pct), xmx = Math.max.apply(null, raw), ymin = Math.min(0, fit.m * xmx + fit.b);
      chart = new Chart(cv, { type: "scatter", data: { datasets: [{ label: "Readings", data: rows.map(r => ({ x: r.Raw_ADC, y: r.Light_Percent })), backgroundColor: "rgba(14,165,233,.7)", pointRadius: 5 }, { type: "line", label: "Fit Line (Slope=" + fit.m.toFixed(3) + ")", data: [{ x: 0, y: fit.b }, { x: xmx, y: fit.m * xmx + fit.b }], borderColor: "#ef4444", borderWidth: 3, pointRadius: 0 }] },
        options: Object.assign({ plugins: { legend: { position: "top" } }, scales: { x: { title: { display: true, text: "Raw ADC Value (Pin 36)" } }, y: { title: { display: true, text: "Calculated Light %" }, suggestedMin: Math.floor(ymin / 20) * 20 } } }, base) });
      ins = "<strong>Read it:</strong> the slope is <strong>" + fit.m.toFixed(3) + "</strong>: every +100 on the raw reading lowers Light % by about " + Math.abs(fit.m * 100).toFixed(1) + " points. " + (fit.m * xmx + fit.b < 0 ? "The red line dips below 0 %, but a percentage can't be negative: map() then constrain() flatten all the dark readings at exactly 0 %, so the data are only <em>partly</em> a straight line." : "The relationship is close to a straight line."); }
    $("insight").innerHTML = ins;
  }
  function initLab4() {
    $("figTabs").innerHTML = [1, 2, 3, 4, 5, 6].map(i => '<button data-f="' + i + '">Figure ' + i + "</button>").join("");
    $("figTabs").querySelectorAll("button").forEach(b => b.onclick = () => { S.fig = +b.dataset.f; renderCode($("py3"), FIGS[S.fig].code); drawFig(); });
    renderCode($("py3"), FIGS[1].code);
    $("pngBtn").onclick = () => { const cv = $("mainChart"); if (!cv) return; const t = document.createElement("canvas"); t.width = cv.width; t.height = cv.height; const c = t.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, t.width, t.height); c.drawImage(cv, 0, 0);
      const a = document.createElement("a"); a.href = t.toDataURL("image/png"); a.download = "figure" + S.fig + "_ldr.png"; a.click(); };
    window.addEventListener("resize", () => { if (S.fig === 4 || S.fig === 5) drawFig(); });
  }

  // ================= Lab 5 =================
  function renderImpact() {
    if (!S.cleaned) return; const rows = S.cleaned.rows, n = rows.length, pct = rows.map(r => r.Light_Percent), v = S.viz, im = S.imp; if (!n) { $("impact").innerHTML = "<p>No rows to analyse.</p>"; return; }
    const share = x => pct.filter(x).length / n; let h = "";
    if (S.scn === "CA3") { const off = share(p => p >= v.brightPct), dim = share(p => p >= v.darkPct && p < v.brightPct), on = share(p => p < v.darkPct), kwh = im.lights * im.watts / 1000 * im.hours * (off + dim * .5), yr = kwh * im.days, aed = yr * im.tariff, co2 = yr * im.co2;
      h = "<h3 style='margin-top:0;color:var(--navy);'>⚡ Energy saved by the Daylight Sun-Tracker Post</h3><p>Your data say that over this day the lights could be <strong>OFF for " + (off * 100).toFixed(0) + "%</strong> of the time (light ≥ " + v.brightPct + "%), <strong>DIMMED for " + (dim * 100).toFixed(0) + "%</strong>, and <strong>fully ON for " + (on * 100).toFixed(0) + "%</strong> (light &lt; " + v.darkPct + "%). Change the thresholds in the Lab 1 extension or Lab 4 code and watch these numbers move.</p><div class='kpis'><div><b>" + (im.hours * off).toFixed(1) + " h</b><small>lights OFF per day (of " + im.hours + " h)</small></div><div><b>" + kwh.toFixed(1) + " kWh</b><small>saved per school day</small></div><div><b>" + Math.round(yr) + " kWh</b><small>saved per year</small></div><div><b>AED " + Math.round(aed) + "</b><small>saved per year</small></div><div><b>" + Math.round(co2) + " kg</b><small>CO₂ avoided per year</small></div></div>"
        + "<div class='assume'>" + impInput("lights", "Number of corridor lights") + impInput("watts", "Watts per light") + impInput("hours", "Hours lights are normally on / day") + impInput("tariff", "Tariff (AED per kWh)") + impInput("co2", "kg CO₂ per kWh") + impInput("days", "School days per year") + "</div><p class='legend'>These assumptions are examples. Replace them with measurements from your school (SDG 13: Climate Action). One simulated day is not a whole year: say what that limits.</p>"; }
    else { const dim = share(p => p < v.darkPct), glare = share(p => p > 95), ok = share(p => p >= v.darkPct && p <= 95), good = share(p => p >= v.brightPct && p <= 95), bad = dim + glare;
      h = "<h3 style='margin-top:0;color:var(--navy);'>🩺 How healthy is the light at the desk?</h3><p>Across this lesson, the desk was <strong>too dim " + (dim * 100).toFixed(0) + "%</strong> of the time (&lt; " + v.darkPct + "%), had <strong>glare " + (glare * 100).toFixed(0) + "%</strong> (&gt; 95%), and sat in the <strong>healthy band " + (good * 100).toFixed(0) + "%</strong> (" + v.brightPct + "–95%).</p><div class='kpis'><div><b>" + (bad * im.lesson).toFixed(0) + " min</b><small>in unhealthy light per " + im.lesson + "-min lesson</small></div><div><b>" + (dim * im.lesson).toFixed(0) + " min</b><small>too dim (eye strain)</small></div><div><b>" + (glare * im.lesson).toFixed(0) + " min</b><small>glare (headache risk)</small></div><div><b>" + (good * 100).toFixed(0) + "%</b><small>in the healthy band</small></div></div><p><strong>What the data suggest:</strong> " + (dim >= glare && dim > .15 ? "The biggest problem is a <em>dim</em> desk. Suggest brighter lamps or switching lights on before the lesson starts." : glare > .15 ? "The biggest problem is <em>glare</em>. Suggest blinds or moving desks away from the window." : "Light is mostly healthy. Check whether the sensor is placed fairly before deciding.") + "</p><div class='assume'>" + impInput("lesson", "Lesson length (minutes)") + "</div><p class='legend'>Healthy ranges here are teaching thresholds, not medical advice (SDG 3: Good Health).</p>"; }
    $("impact").innerHTML = h; $("impact").querySelectorAll("input[data-i]").forEach(inp => inp.onchange = () => { const x = parseFloat(inp.value); if (isFinite(x) && x > 0) { logChange("Lab 5", inp.dataset.l, S.imp[inp.dataset.i], x); S.imp[inp.dataset.i] = x; } renderImpact(); });
  }
  function impInput(k, label) { return '<div><label>' + label + '<input data-i="' + k + '" data-l="' + label + '" type="number" step="any" min="0" value="' + S.imp[k] + '"></label></div>'; }

  // ================= evidence saving =================
  window.saveWithLog = function (strand, prompt, id) {
    const u = currentUser(), st = $("status-" + strand.toLowerCase()), text = $(id).value.trim();
    if (!text) { st.textContent = "Write something first!"; return; } if (!u) { st.textContent = "Log in above first, then save."; return; }
    const log = S.log.map((r, i) => (i + 1) + ". [" + r.lab + "] " + r.what + ": " + r.from + " -> " + r.to).join(" | ");
    postToSheet("strand", { Name: u.name, Class: u.klass, Lesson: window.LESSON.name + " (" + S.scn + ")", Strand: strand, Prompt: prompt, Response: text + "\n\nCHANGE LOG: " + (log || "(none)") });
    st.textContent = "✅ Saved " + new Date().toLocaleTimeString();
  };
  // same as site.js saveChallenge, but also records which Criterion B product the student built on
  window.saveChallenge = function (strand, prompt, id) {
    const u = currentUser(), st = $("status-" + strand.toLowerCase()), text = $(id).value.trim();
    if (!text) { st.textContent = "Write something first!"; return; } if (!u) { st.textContent = "Log in above first, then save."; return; }
    postToSheet("strand", { Name: u.name, Class: u.klass, Lesson: window.LESSON.name + " (" + S.scn + ")", Strand: strand, Prompt: prompt, Response: text });
    st.textContent = "✅ Saved " + new Date().toLocaleTimeString();
  };

  // ================= start =================
  function init() {
    S.tl = L.timeline(S.scn, 120, S.seed); S.collected = L.collect(S.scn, S.py.n, S.cfg, { spikes: S.py.spikes, garbled: S.py.garbled }, S.seed);
    initLive(); initLab1(); initLab2(); initLab3(); initLab4(); renderScenarioUI(); renderCalc(); checkMissions(); preview(); recompute(); renderLog();
    window.__LDR_STATE = S;
  }
  init();
})();
