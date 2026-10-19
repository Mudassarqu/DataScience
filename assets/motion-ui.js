/* Motion (PIR) Criterion C lab. Needs ldrcore.js (window.LDR), mcore.js (window.MOT), Chart.js, motion_data.js (window.MOT_REAL), window.C_IMG */
(function () {
  const L = window.LDR, M = window.MOT, $ = id => document.getElementById(id), esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const IMG = (window.C_IMG || {}).SC5 || {};
  const S = { cfg: Object.assign({}, M.DEFAULTS), hw: Object.assign({}, M.HW), simT: 0, events: [], falseEv: [], running: false, timer: null, mode: "manual", seed: 1, rnd: L.rng(5), scope: [], achieved: {}, buzzerSeen: false, noisyActive: false,
    esp: null, lastO: null, tele: [], collected: null, ds: "sim", src: "sim", py: { n: 60, port: "COM5" }, garbled: 1, cl: { win: 10, div: 10 }, viz: { bins: 12, thr: 50 }, fig: 1, missions: {}, log: [], rows: null, dayDone: false, dayEnd: 0,
    imp: { lights: 10, watts: 40, hours: 12, tariff: 0.38, co2: 0.4, days: 365, alertS: 6 } };
  S.esp = new M.Esp(S.cfg);
  // ---------- editable code ----------
  const PARAMS = {
    teleMs: { g: () => S.cfg.teleMs, s: v => S.cfg.teleMs = v, min: 100, max: 5000, w: 4, lab: "Lab 1", d: "TELEMETRY_INTERVAL (ms)" },
    tCont: { g: () => S.cfg.tCont, s: v => S.cfg.tCont = v, min: 0, max: 60000, w: 5, lab: "Lab 1", d: "CONTINUOUS_PRESENCE threshold (ms)" },
    tActive: { g: () => S.cfg.tActive, s: v => S.cfg.tActive = v, min: 0, max: 60000, w: 5, lab: "Lab 1", d: "ACTIVE_OCCUPANCY threshold (ms)" },
    holdMs: { g: () => S.cfg.holdMs, s: v => S.cfg.holdMs = v, min: 0, max: 2000, w: 4, lab: "Lab 1 extension", d: "HOLD_MS flicker filter (ms)" },
    port: { g: () => S.py.port, s: v => S.py.port = v, str: 1, w: 7, lab: "Lab 2", d: "SERIAL_PORT" },
    n: { g: () => S.py.n, s: v => S.py.n = v, min: 10, max: 300, w: 4, lab: "Lab 2", d: "samples to collect" },
    win: { g: () => S.cl.win, s: v => S.cl.win = v, min: 1, max: 30, w: 2, lab: "Lab 3", d: "rolling window" },
    div: { g: () => S.cl.div, s: v => S.cl.div = v, min: 1, max: 30, w: 2, lab: "Lab 3", d: "duty-cycle divisor" },
    bins: { g: () => S.viz.bins, s: v => S.viz.bins = v, min: 3, max: 30, w: 2, lab: "Lab 4", d: "histogram bins" },
    thr: { g: () => S.viz.thr, s: v => S.viz.thr = v, min: 0, max: 100, w: 3, lab: "Lab 4", d: "high-demand threshold (%)" }
  };
  const KW = /(\/\/.*|#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(const|int|void|if|else|for|while|def|return|import|from|try|except|as|with|in|and|or|not|True|False|None|print|continue|unsigned|long|String)\b|\b(\d+\.?\d*)\b|\b([A-Za-z_]\w*)(?=\()/g;
  function hl(t) { return esc(t).replace(KW, (m, c, s, k, n, f) => c ? '<span class="cm">' + c + "</span>" : s ? '<span class="st">' + s + "</span>" : k ? '<span class="kw">' + k + "</span>" : n ? '<span class="nu">' + n + "</span>" : f ? '<span class="fn">' + f + "</span>" : m); }
  function renderCode(el, tpl) {
    el.innerHTML = tpl.split(/\[\[(\w+)\]\]/).map((seg, i) => { if (i % 2 === 0) return hl(seg); const p = PARAMS[seg];
      return '<input data-p="' + seg + '" size="' + p.w + '" value="' + esc(p.g()) + '" title="' + p.d + ' (' + (p.str ? "text" : p.min + " to " + p.max) + ')" aria-label="' + p.d + '">'; }).join("");
    el.querySelectorAll("input[data-p]").forEach(inp => {
      const k = inp.dataset.p, p = PARAMS[k]; let before = p.g();
      inp.addEventListener("focus", () => { before = p.g(); });
      inp.addEventListener("input", () => { const v = parseVal(k, inp.value); if (v === null) { inp.classList.add("bad"); return; } inp.classList.remove("bad"); p.s(v); sync(k, inp); changed(k); });
      inp.addEventListener("change", () => { const v = parseVal(k, inp.value); if (v === null) { inp.value = before; inp.classList.remove("bad"); p.s(before); sync(k, inp); changed(k); return; } if (v !== before) { logChange(p.lab, p.d, before, v); before = v; } });
    });
  }
  function parseVal(k, s) { const p = PARAMS[k]; if (p.str) { s = s.trim(); return s ? s : null; } const v = parseInt(s, 10); return (isFinite(v) && v >= p.min && v <= p.max) ? v : null; }
  function sync(k, except) { document.querySelectorAll('input[data-p="' + k + '"]').forEach(i => { if (i !== except) i.value = PARAMS[k].g(); }); }
  function logChange(lab, what, a, b) { S.log.push({ t: new Date().toLocaleTimeString(), lab: lab, what: what, from: a, to: b }); renderLog(); }
  function renderLog() { const b = $("logBody"); if (!S.log.length) { b.innerHTML = '<tr><td colspan="6" style="color:var(--muted);">No changes yet. Edit a yellow box or move a hardware slider above.</td></tr>'; return; }
    b.innerHTML = S.log.map((r, i) => "<tr><td>" + (i + 1) + "</td><td>" + r.t + "</td><td>" + esc(r.lab) + "</td><td>" + esc(r.what) + "</td><td>" + esc(r.from) + "</td><td><strong>" + esc(r.to) + "</strong></td></tr>").join(""); }
  function changed(k) {
    if (["teleMs", "tCont", "tActive", "holdMs"].includes(k)) { checkMissions(); renderCalc(); }
    if (["win", "div"].includes(k)) recompute();
    if (["bins", "thr"].includes(k)) drawFig();
  }
  // ---------- templates ----------
  const INO = `const int PIR_PIN = 27;     // PIR digital signal on GPIO 27
const int RELAY_PIN = 25;   // Automated lighting relay output
const int BUZZER_PIN = 26;  // Security alert buzzer output

int lastMotionState = LOW;
unsigned long motionStartTime = 0;
unsigned long dwellDuration = 0;
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL = [[teleMs]]; // telemetry every N ms

void loop() {
  int currentMotion = digitalRead(PIR_PIN);
  unsigned long now = millis();

  // State change edge detection
  if (currentMotion == HIGH && lastMotionState == LOW) {
    motionStartTime = now;
    digitalWrite(RELAY_PIN, HIGH); // Turn on smart room lights
  } else if (currentMotion == LOW && lastMotionState == HIGH) {
    digitalWrite(RELAY_PIN, LOW);
    digitalWrite(BUZZER_PIN, LOW);
    dwellDuration = 0;
  }

  if (currentMotion == HIGH) {
    dwellDuration = now - motionStartTime;
  } else {
    dwellDuration = 0;
  }

  lastMotionState = currentMotion;

  // Stream structured serial telemetry
  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = now;

    String stateStr = (currentMotion == HIGH) ? "MOTION_DETECTED" : "NO_MOTION";
    String statusStr = "VACANT_STANDBY";

    if (currentMotion == HIGH) {
      if (dwellDuration > [[tCont]]) {
        statusStr = "CONTINUOUS_PRESENCE";
      } else if (dwellDuration > [[tActive]]) {
        statusStr = "ACTIVE_OCCUPANCY";
      } else {
        statusStr = "TRANSIT_PASSING";
      }
    }

    Serial.print("Motion: ");        Serial.print(currentMotion);
    Serial.print("  |  State: ");    Serial.print(stateStr);
    Serial.print("  |  Dwell_Time_ms: "); Serial.print(dwellDuration);
    Serial.print("  |  Status: ");   Serial.println(statusStr);
  }
}`;
  const INOEXT = `// 1) FLICKER FIX: ignore a LOW that lasts less than HOLD_MS
const unsigned long HOLD_MS = [[holdMs]];     // 0 = off (the kit sketch)
unsigned long lastHighTime = 0;

//    in loop(), replace the first line with these three:
int raw = digitalRead(PIR_PIN);
if (raw == HIGH) lastHighTime = millis();
int currentMotion = (raw == HIGH || (lastHighTime > 0 && millis() - lastHighTime < HOLD_MS)) ? HIGH : LOW;

// 2) AFTER-HOURS ALERT: inside the telemetry block, after statusStr is chosen
if (statusStr == "CONTINUOUS_PRESENCE") {
  digitalWrite(BUZZER_PIN, HIGH);             // someone is lingering: sound the alert
}`;
  const PY1 = () => `import serial, csv, time, re
from datetime import datetime

SERIAL_PORT = '[[port]]'
BAUD_RATE = 9600
CSV_FILE = 'motion_telemetry_data.csv'
STOP_AFTER = [[n]]    # simulator only: the real script runs until Ctrl+C

def parse_motion_line(line):
    match = re.search(r'Motion:\\s*([01]).*State:\\s*([A-Za-z_]+).*Dwell_Time_ms:\\s*(\\d+).*Status:\\s*([A-Za-z_]+)', line)
    if match:
        m_state = int(match.group(1))
        m_label = match.group(2)
        dwell = int(match.group(3))
        status = match.group(4)
        return m_state, m_label, dwell, status
    return None, None, None, None

ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
time.sleep(2)
ser.reset_input_buffer()
while True:
    line = ser.readline().decode('utf-8', errors='ignore').strip()
    if 'Motion:' in line and 'Dwell_Time_ms:' in line:
        m_state, m_label, dwell, status = parse_motion_line(line)
        if m_state is not None:
            elapsed = round(time.time() - start_time, 2)
            writer.writerow([now_str, elapsed, m_state, m_label, dwell, status])`;
  const PY2 = () => `df = pd.read_csv('motion_telemetry_data.csv')
df['Timestamp'] = pd.to_datetime(df['Timestamp'], errors='coerce')
df['Motion_State'] = pd.to_numeric(df['Motion_State'], errors='coerce').fillna(0).astype(int)
df['Dwell_Time_ms'] = pd.to_numeric(df['Dwell_Time_ms'], errors='coerce').fillna(0).astype(int)
df.dropna(subset=['Timestamp'], inplace=True)

# Derive rolling activity frequency
df['Rolling_Activity'] = df['Motion_State'].rolling(window=[[win]], min_periods=1).sum()

# Derive occupancy duty cycle percentage
df['Duty_Cycle_Pct'] = (df['Rolling_Activity'] / [[div]].0 * 100.0).round(1)

# Calculate dwell seconds
df['Dwell_Seconds'] = (df['Dwell_Time_ms'] / 1000.0).round(2)

print(df[['Motion_State', 'Dwell_Time_ms', 'Rolling_Activity', 'Duty_Cycle_Pct']].describe())`;
  const FIGS = {
    1: { t: "Figure 1: Chronological PIR Motion Trigger State Transitions", code: `plt.step(df.index, df['Motion_State'], where='post', color='#0284c7', linewidth=2,
         label='PIR Trigger State (0=Vacant, 1=Motion)')
plt.fill_between(df.index, df['Motion_State'], step='post', alpha=0.25, color='#38bdf8')
plt.yticks([0, 1], ['0 (Vacant)', '1 (Motion)'])
plt.legend(loc='upper right')` },
    2: { t: "Figure 2: Active Motion Dwell Duration Distribution", code: `motion_dwells = df[df['Dwell_Time_ms'] > 0]['Dwell_Time_ms']
if len(motion_dwells) > 0:
    sns.histplot(motion_dwells, kde=True, color='#0ea5e9', bins=[[bins]])
else:
    plt.text(0.5, 0.5, 'No Active Dwell Durations Logged')
plt.xlabel('Dwell Duration (ms)')` },
    3: { t: "Figure 3: Facility Occupancy State Frequency Breakdown", code: `state_order = ['VACANT_STANDBY', 'TRANSIT_PASSING', 'ACTIVE_OCCUPANCY', 'CONTINUOUS_PRESENCE']
available_states = [s for s in state_order if s in df['Status'].values]
df['Status'].value_counts()[available_states].plot(kind='bar',
    color=['#64748b', '#38bdf8', '#0284c7', '#0369a1'])
plt.xticks(rotation=15)` },
    4: { t: "Figure 4: Motion Telemetry Correlation Matrix", code: `num_cols = ['Motion_State', 'Dwell_Time_ms', 'Rolling_Activity', 'Duty_Cycle_Pct']
corr = df[num_cols].corr()
sns.heatmap(corr, annot=True, cmap='Blues', fmt='.2f', vmin=-1, vmax=1)` },
    5: { t: "Figure 5: Motion Dwell Duration Variance Across Status Modes", code: `sns.boxplot(x='Status', y='Dwell_Time_ms', data=df, palette='Blues')
plt.ylabel('Dwell Duration (ms)')
plt.xticks(rotation=15)` },
    6: { t: "Figure 6: Rolling Occupancy Duty Cycle & Smart Energy Demand", code: `plt.plot(df.index, df['Duty_Cycle_Pct'], color='#0369a1', linewidth=2,
         label='Occupancy Duty Cycle (%)')
plt.axhline([[thr]], color='#ef4444', linestyle='--', label='High Demand Threshold')
plt.legend()` }
  };
  // ---------- link section ----------
  const ROWS = [["<strong>Function</strong> · Detects movement and reports it every second", "Lab 1: Serial Monitor shows Motion, Dwell_Time_ms and Status once a second.", "Screenshot of Serial Monitor"],
    ["<strong>Function / Environment</strong> · Lights are on only when someone is there", "Lab 1 relay bulb + Lab 5 energy saved.", "Lab 5 numbers"],
    ["<strong>Safety / Customer</strong> · Alerts staff if someone lingers after hours", "Lab 1 buzzer mission + Lab 5 loitering events.", "Buzzer screenshot, Lab 5"],
    ["<strong>Function</strong> · Dwell time is trustworthy", "Lab 1 flicker fix + Lab 4 Figure 2 and 5.", "Before/after charts"]];
  function renderLink() {
    $("b2c").innerHTML = '<figure><img src="' + IMG.iso + '" alt="Chosen design"><figcaption>Criterion B · chosen design: Corner Swivel Watcher</figcaption></figure><figure><img src="' + IMG.exploded + '" alt="Exploded view"><figcaption>Criterion B · exploded view (the PIR dome faces out)</figcaption></figure><figure><img src="' + IMG.scene + '" alt="Application sketch"><figcaption>Criterion B · where it lives: school corridor</figcaption></figure>';
    $("mission").innerHTML = "<strong>Your mission:</strong> your <strong>Corner Swivel Watcher</strong> must switch corridor lights on only when someone is there, and sound an alert when someone lingers after hours. You will build the sensing code, collect a virtual minute, derive new columns, chart it, and decide what the school should do. <a href=\"" + IMG.page + '">Open the full Criterion B exemplar →</a>';
    $("b2cTable").innerHTML = ROWS.map(r => "<tr><td>" + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>").join("");
    $("devImg").src = IMG.iso; $("devName").textContent = "Criterion B: Corner Swivel Watcher";
    document.querySelectorAll(".scnName").forEach(e => e.textContent = "your Corner Swivel Watcher");
  }
  // ---------- Lab 1 ----------
  const serialEl = $("serial"); let liveChart = null;
  const SC = { VACANT_STANDBY: "l-DARK", TRANSIT_PASSING: "l-DIM", ACTIVE_OCCUPANCY: "l-BRIGHT", CONTINUOUS_PRESENCE: "l-VERY" }, CHIP = { VACANT_STANDBY: "DARK", TRANSIT_PASSING: "DIM", ACTIVE_OCCUPANCY: "BRIGHT", CONTINUOUS_PRESENCE: "VERY" };
  function initLive() { liveChart = new Chart($("liveChart"), { data: { labels: [], datasets: [{ type: "bar", label: "Dwell_Time_ms", data: [], backgroundColor: "rgba(232,98,44,.55)", yAxisID: "y1", order: 2 }, { type: "line", label: "Motion (0/1)", data: [], borderColor: "#0284c7", borderWidth: 2.5, stepped: "after", pointRadius: 0, yAxisID: "y", order: 1 }] },
    options: { animation: false, maintainAspectRatio: false, plugins: { legend: { position: "top" } }, scales: { x: { display: false }, y: { min: -0.05, max: 1.1, ticks: { stepSize: 1 }, title: { display: true, text: "Motion" } }, y1: { position: "right", beginAtZero: true, grid: { drawOnChartArea: false }, title: { display: true, text: "Dwell (ms)" } } } } }); }
  function addSerial(text, cls) { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = text; serialEl.appendChild(d); while (serialEl.childNodes.length > 80) serialEl.removeChild(serialEl.firstChild); serialEl.scrollTop = serialEl.scrollHeight; }
  function onTele(o) {
    S.lastO = o; addSerial(M.line(o), SC[o.Status]);
    S.achieved[o.Status] = true; if (o.buzzer) S.buzzerSeen = true; if ((o.Status === "ACTIVE_OCCUPANCY" || o.Status === "CONTINUOUS_PRESENCE") && S.hw.bounce >= 10) S.noisyActive = true;
    S.tele.push(o); if (S.tele.length > 40) S.tele.shift(); liveChart.data.labels = S.tele.map((_, i) => i); liveChart.data.datasets[0].data = S.tele.map(x => x.Dwell); liveChart.data.datasets[1].data = S.tele.map(x => x.Motion); liveChart.update("none");
    showState(o); checkMissions();
  }
  function showState(o) {
    $("rdMot").textContent = o.Motion; $("rdDwell").textContent = o.Dwell; const c = $("rdStatus"); c.textContent = o.Status.replace("_", " "); c.className = "chip " + CHIP[o.Status];
    $("bulbHalo").setAttribute("opacity", o.relay ? 1 : 0); $("bulb").setAttribute("opacity", o.relay ? 1 : .35); $("buzz").setAttribute("opacity", o.buzzer ? 1 : .25);
    $("devState").textContent = o.buzzer ? "🔔 ALERT: someone is lingering! Lights ON" : o.relay ? "💡 Corridor lights ON (" + o.Status.replace("_", " ").toLowerCase() + ")" : "🌙 Corridor empty: lights OFF";
  }
  function drawScope() { const cv = $("scope"), dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 400, H = 90; cv.width = W * dpr; cv.height = H * dpr; const c = cv.getContext("2d"); c.scale(dpr, dpr); c.clearRect(0, 0, W, H);
    c.strokeStyle = "#1f3550"; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(i * W / 6, 0); c.lineTo(i * W / 6, H); c.stroke(); }
    c.fillStyle = "#7f93ad"; c.font = "10px sans-serif"; c.fillText("1 (HIGH)", 4, 14); c.fillText("0 (LOW)", 4, H - 6); c.fillText("−300 ms", W - 52, 12); c.fillText("now", W - 24, H - 6);
    const d = S.scope, n = 300; c.strokeStyle = "#7cf29a"; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < d.length; i++) { const x = (i + (n - d.length)) / (n - 1) * (W - 8) + 4, y = d[i] ? 18 : H - 18; i ? (c.lineTo(x, d[i - 1] === d[i] ? y : (d[i - 1] ? 18 : H - 18)), c.lineTo(x, y)) : c.moveTo(x, y); } c.stroke(); }
  function drawPerson() { const now = S.simT, ev = S.events.find(e => now >= e.a && now <= e.b); const p = $("person"); if (ev) { const f = (now - ev.a) / Math.max(1, ev.b - ev.a); p.setAttribute("transform", "translate(" + (20 + f * 60) + ",95)"); p.setAttribute("opacity", 1); } else p.setAttribute("opacity", .25); $("irbeam").setAttribute("opacity", S.scope.length && S.scope[S.scope.length - 1] ? .35 : 0); $("pirDome").setAttribute("fill", S.scope.length && S.scope[S.scope.length - 1] ? "#ffb08a" : "#fff"); }
  function tickMs() { return 50; }
  function advance() {
    const speed = parseInt($("speedSel").value, 10), steps = tickMs() * speed;
    for (let i = 0; i < steps; i++) { S.simT++; const raw = M.readPin(S.simT, S.events, S.hw, S.falseEv, S.rnd); S.scope.push(raw); if (S.scope.length > 300) S.scope.shift(); const o = S.esp.step(S.simT, raw); if (o) onTele(o); }
    S.events = S.events.filter(e => e.b + S.hw.pirHold * 1000 + 5000 > S.simT);
    $("rdMillis").textContent = S.simT; drawScope(); drawPerson();
    if (S.mode === "scenario" && S.simT > S.dayEnd) { S.dayDone = true; S.mode = "manual"; $("dayBtn").textContent = "📅 Play the whole scenario"; stopRun(); checkMissions(); }
  }
  function startRun() { if (S.running) return; S.running = true; $("runBtn").textContent = "■ Stop"; $("runBtn").className = "stop"; if (!serialEl.childNodes.length) { const d = document.createElement("div"); d.className = "dim"; d.textContent = "DataSciensPro Kit: PIR Motion Telemetry Stream\nSensor: HC-SR501 / AM312 | ESP32 GPIO 27\nSensor Ready. Streaming telemetry..."; serialEl.appendChild(d); }
    S.falseEv = M.falseEvents(S.seed, 3600, S.hw.falsePerMin); S.timer = setInterval(advance, tickMs()); }
  function stopRun() { S.running = false; clearInterval(S.timer); $("runBtn").textContent = "▶ Run virtual ESP32"; $("runBtn").className = "go"; }
  function addEvent(sec, kind) { if (!S.running) startRun(); S.events.push({ a: S.simT + 50, b: S.simT + 50 + Math.round(sec * 1000), kind: kind }); }
  function setHw(k, v, label, from) { S.hw[k] = v; if (from !== undefined && from !== v) logChange("Lab 1 hardware", label, from, v); if (k === "falsePerMin") S.falseEv = M.falseEvents(S.seed, 3600, v); }
  function initLab1() {
    renderCode($("ino"), INO); renderCode($("inoExt"), INOEXT);
    $("runBtn").onclick = () => S.running ? stopRun() : startRun();
    $("walkBtn").onclick = () => addEvent(1.5, "passing"); $("standBtn").onclick = () => addEvent(6, "stopping"); $("loiterBtn").onclick = () => addEvent(12, "loitering");
    $("dayBtn").onclick = () => { if (S.mode === "scenario") { S.mode = "manual"; $("dayBtn").textContent = "📅 Play the whole scenario"; return; }
      const ev = M.SCENARIOS.SC5.build(S.seed, 70); S.events = S.events.concat(ev.map(e => ({ a: e.a + S.simT + 1000, b: e.b + S.simT + 1000, kind: e.kind }))); S.dayEnd = S.simT + 1000 + 70000 + S.hw.pirHold * 1000; S.mode = "scenario"; $("dayBtn").textContent = "⏸ Stop the scenario"; if (!S.running) startRun(); };
    $("clrBtn").onclick = () => { serialEl.innerHTML = ""; };
    $("holdSl").oninput = e => { const o = S.hw.pirHold; setHw("pirHold", +e.target.value); $("holdVal").textContent = e.target.value; };
    $("holdSl").onchange = e => logChange("Lab 1 hardware", "PIR hold time (s)", "", e.target.value);
    $("bounceSl").oninput = e => { setHw("bounce", +e.target.value); $("bounceVal").textContent = e.target.value; };
    $("bounceSl").onchange = e => logChange("Lab 1 hardware", "Signal noise (%)", "", e.target.value);
    $("falseSl").oninput = e => { setHw("falsePerMin", +e.target.value); $("falseVal").textContent = e.target.value; };
    $("falseSl").onchange = e => logChange("Lab 1 hardware", "False triggers per minute", "", e.target.value);
    const setSl = () => { $("holdSl").value = S.hw.pirHold; $("holdVal").textContent = S.hw.pirHold; $("bounceSl").value = S.hw.bounce; $("bounceVal").textContent = S.hw.bounce; $("falseSl").value = S.hw.falsePerMin; $("falseVal").textContent = S.hw.falsePerMin; };
    $("cleanHw").onclick = () => { S.hw.bounce = 0; S.hw.falsePerMin = 0; setSl(); logChange("Lab 1 hardware", "Preset", "", "Clean signal"); };
    $("realHw").onclick = () => { S.hw.bounce = 25; S.hw.pirHold = 2; S.hw.falsePerMin = 0; setSl(); logChange("Lab 1 hardware", "Preset", "", "Noisy line (like my real data)"); };
    $("tgAlert").onchange = e => { S.cfg.alertOn = e.target.checked; logChange("Lab 1 extension", "Buzzer alert enabled", !e.target.checked, e.target.checked); };
    window.addEventListener("resize", drawScope); drawScope(); drawPerson();
  }
  function renderCalc() {
    const dw = S.calcD === undefined ? 2000 : S.calcD, c = S.cfg, a = dw > c.tCont, b = dw > c.tActive, st = a ? "CONTINUOUS_PRESENCE" : b ? "ACTIVE_OCCUPANCY" : "TRANSIT_PASSING";
    $("calc").innerHTML = 'Motion is HIGH and dwellDuration = <input id="calcD" type="number" value="' + dw + '" min="0" max="60000"> ms &nbsp; (try 1500, 2000, 2001, 6000, 6001)<br>if (dwellDuration &gt; ' + c.tCont + ') → ' + dw + " &gt; " + c.tCont + " is <strong>" + a + "</strong>" + (a ? "  ✔ stop here" : "") + "<br>" + (a ? "<span style='color:#999'>" : "") + "else if (dwellDuration &gt; " + c.tActive + ") → " + dw + " &gt; " + c.tActive + " is <strong>" + b + "</strong>" + (!a && b ? "  ✔ stop here" : "") + (a ? "</span>" : "") + "<br>Status = <strong>" + st + "</strong>" + (dw === c.tActive || dw === c.tCont ? "  &nbsp;(exactly on the threshold: <code>&gt;</code> is strict, so it does not count!)" : "");
    $("calcD").oninput = e => { const v = parseInt(e.target.value, 10); if (isFinite(v) && v >= 0) { S.calcD = v; const pos = e.target.selectionStart; renderCalc(); const n = $("calcD"); n.focus(); try { n.setSelectionRange(pos, pos); } catch (x) {} } };
  }
  const MISSIONS = [
    ["Walk past the sensor and see <strong>TRANSIT_PASSING</strong>", "Press Run, then Walk past. Use the clean signal preset first.", () => !!S.achieved.TRANSIT_PASSING],
    ["Reach <strong>ACTIVE_OCCUPANCY</strong>", "Press Stand still (6 s) with a clean signal. The dwell must pass the ACTIVE threshold.", () => !!S.achieved.ACTIVE_OCCUPANCY],
    ["Reach <strong>CONTINUOUS_PRESENCE</strong> and sound the <strong>buzzer</strong>", "Press Loiter (12 s) with the alert box ticked.", () => S.buzzerSeen],
    ["Change a threshold so a dwell of <strong>1500 ms</strong> counts as <strong>ACTIVE_OCCUPANCY</strong>", "Which yellow number decides ACTIVE? Make it lower than 1500.", () => M.statusOf(1, 1500, S.cfg) === "ACTIVE_OCCUPANCY"],
    ["Fix the flicker: get ACTIVE or CONTINUOUS with <strong>noise ≥ 10 %</strong>", "Press “Noisy line”, watch the tiny dwell values, then raise HOLD_MS in the extension until real dwell appears.", () => S.noisyActive],
    ["Play the whole scenario to the end", "Press “Play the whole scenario” (speed 25× is quick).", () => S.dayDone]
  ];
  function checkMissions() { let n = 0; MISSIONS.forEach((m, i) => { if (!S.missions[i] && m[2]()) { S.missions[i] = true; logChange("Lab 1", "Mission done", "", "✅ " + m[0].replace(/<[^>]+>/g, "")); } if (S.missions[i]) n++; });
    $("missions").innerHTML = MISSIONS.map((m, i) => '<li class="' + (S.missions[i] ? "done" : "") + '"><span class="tick">' + (S.missions[i] ? "✓" : "") + "</span><span>" + m[0] + '<span class="hint">' + m[1] + "</span></span></li>").join(""); $("missCount").textContent = n + " / " + MISSIONS.length; }
  // ---------- Lab 2 ----------
  function realRaw() { return window.MOT_REAL.raw.map(r => ({ Timestamp: r[0], Elapsed_Seconds: r[1], Motion_State: r[2], State_Label: r[3], Dwell_Time_ms: r[4], Status: r[5] })); }
  function runCollector() {
    let txt = "Connecting to ESP32 Motion Detector on " + S.py.port + " @ 9600 baud...\nConnected! Listening for PIR motion telemetry (Press Ctrl+C to stop)...\n", rows, skipped = 0;
    if (S.src === "real") rows = realRaw(); else { const g = M.collect(S.py.n, S.cfg, S.hw, S.seed, S.garbled); rows = g.rows; skipped = g.skipped; }
    S.collected = { rows: rows, skipped: skipped }; rows.forEach(r => { txt += "  [" + r.Timestamp + "] Motion: " + r.Motion_State + " | Dwell: " + r.Dwell_Time_ms + "ms | Status: " + r.Status + "\n"; });
    txt += "\n✓ Motion logging stopped by user.\n"; if (skipped) txt += "\n[simulator note] " + skipped + " garbled line(s) did not match the regex, so parse_motion_line() returned None and they were skipped.\n";
    $("py1out").textContent = txt; $("py1out").scrollTop = 0; S.ds = S.src === "real" ? "real" : "sim"; document.querySelector('input[name=ds][value=' + S.ds + ']').checked = true;
    logChange("Lab 2", "Ran the collector (" + (S.src === "real" ? "real data" : rows.length + " rows, noise " + S.hw.bounce + "%, HOLD_MS " + S.cfg.holdMs) + ")", "", "✓"); recompute();
  }
  function renderParse() {
    const line = $("parseIn").value, re = /Motion:\s*([01]).*State:\s*([A-Za-z_]+).*Dwell_Time_ms:\s*(\d+).*Status:\s*([A-Za-z_]+)/, m = re.exec(line);
    let o = ">>> line = '" + line.replace(/'/g, "\\'") + "'\n>>> match = re.search(r'Motion:\\s*([01]).*State:\\s*([A-Za-z_]+).*Dwell_Time_ms:\\s*(\\d+).*Status:\\s*([A-Za-z_]+)', line)\n";
    if (m) o += ">>> match.group(1)\n'" + m[1] + "'      # ([01]) one digit, 0 or 1\n>>> match.group(2)\n'" + m[2] + "'\n>>> match.group(3)\n'" + m[3] + "'      # (\\d+) one or more digits\n>>> match.group(4)\n'" + m[4] + "'\n>>> parse_motion_line(line)\n(" + [+m[1], "'" + m[2] + "'", +m[3], "'" + m[4] + "'"].join(", ") + ")";
    else o += ">>> match\nNone      # no match, so the function returns (None, None, None, None)\n>>> parse_motion_line(line)\n(None, None, None, None)";
    $("parseOut").textContent = o;
  }
  function csvText(rows) { return "Timestamp,Elapsed_Seconds,Motion_State,State_Label,Dwell_Time_ms,Status\n" + rows.map(r => [r.Timestamp, r.Elapsed_Seconds, r.Motion_State, r.State_Label, r.Dwell_Time_ms, r.Status].join(",")).join("\n") + "\n"; }
  function download(name, text) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function initLab2() {
    renderCode($("py1"), PY1()); document.querySelectorAll("input[name=src]").forEach(r => r.onchange = () => { S.src = r.value; });
    $("garbSl").oninput = e => { S.garbled = +e.target.value; $("garbVal").textContent = e.target.value; };
    $("collectBtn").onclick = runCollector; $("weatherBtn").onclick = () => { S.seed = Math.floor(Math.random() * 9000) + 2; runCollector(); };
    $("dlRaw").onclick = () => download("motion_telemetry_data.csv", csvText(S.collected.rows)); $("parseIn").oninput = renderParse; renderParse();
  }
  // ---------- Lab 3 ----------
  function recompute() { const raw = S.ds === "real" ? realRaw() : S.collected.rows; S.rows = M.clean(raw, { win: S.cl.win, div: S.cl.div }); renderLab3(); drawFig(); renderImpact(); }
  const f6 = x => isFinite(x) ? x.toFixed(6) : "NaN";
  function runs(rows) { const out = []; let c = 0; rows.forEach(r => { if (r.Motion_State === 1) c++; else { if (c) out.push(c); c = 0; } }); if (c) out.push(c); return out; }
  function renderLab3() {
    const rows = S.rows, n = rows.length; let o = "✓ Clean motion telemetry saved to 'motion_telemetry_clean.csv'.\n";
    if (n) { const cols = M.NUM, d = cols.map(c => L.describe(rows.map(r => r[c]))), w = cols.map(c => Math.max(c.length, 11) + 2);
      o += "       " + cols.map((c, i) => c.padStart(w[i])).join("") + "\n"; [["count", "count"], ["mean", "mean"], ["std", "std"], ["min", "min"], ["25%", "q25"], ["50%", "q50"], ["75%", "q75"], ["max", "max"]].forEach(k => { o += k[0].padEnd(7) + d.map((x, i) => f6(x[k[1]]).padStart(w[i])).join("") + "\n"; });
      const C = M.corr(rows); o += "\n[extra] correlation matrix used in Figure 4:\n" + "".padEnd(18) + cols.map(c => c.slice(0, 11).padStart(13)).join("") + "\n"; C.forEach((r, i) => { o += cols[i].padEnd(18) + r.map(x => (isFinite(x) ? x.toFixed(2) : "nan").padStart(13)).join("") + "\n"; }); }
    $("py2out").textContent = o;
    const rs = runs(rows), share = n ? rows.filter(r => r.Motion_State === 1).length / n : 0, peak = n ? Math.max.apply(null, rows.map(r => r.Duty_Cycle_Pct)) : 0;
    $("cleanKpi").innerHTML = "<div><b>" + n + "</b><small>rows</small></div><div><b>" + (share * 100).toFixed(0) + "%</b><small>samples with motion</small></div><div><b>" + rs.length + "</b><small>separate motion events</small></div><div><b>" + (rs.length ? Math.max.apply(null, rs) : 0) + " s</b><small>longest motion block</small></div><div><b style='" + (peak > 100 ? "color:#c0392b" : "") + "'>" + peak + "%</b><small>peak duty cycle</small></div>";
    const C = n ? M.corr(rows) : null, rd = C ? C[2][3] : NaN;
    $("dupNote").innerHTML = "<strong>Why 1.00?</strong> Rolling_Activity and Duty_Cycle_Pct correlate at <strong>" + (isFinite(rd) ? rd.toFixed(2) : "nan") + "</strong> because Duty_Cycle_Pct = Rolling_Activity ÷ " + S.cl.div + " × 100. They hold the <em>same</em> information, so keeping both adds nothing." + (S.cl.div !== S.cl.win ? " <span style='color:#c0392b'><strong>Check:</strong> your window is " + S.cl.win + " but the divisor is " + S.cl.div + ", so the 'percentage' can reach " + (S.cl.win / S.cl.div * 100).toFixed(0) + "%.</span>" : "");
    let t = "<table><tr><th>#</th><th>Time</th><th>Motion</th><th>Dwell_ms</th><th>Status</th><th>Rolling</th><th>Duty %</th><th>Dwell_s</th></tr>";
    rows.slice(0, 150).forEach((r, i) => { t += "<tr><td>" + (i + 1) + "</td><td>" + String(r.Timestamp).slice(11) + "</td><td>" + r.Motion_State + "</td><td>" + r.Dwell_Time_ms + "</td><td>" + r.Status + "</td><td>" + r.Rolling_Activity + "</td><td" + (r.Duty_Cycle_Pct > 100 ? " style='color:#c0392b;font-weight:700'" : "") + ">" + r.Duty_Cycle_Pct + "</td><td>" + r.Dwell_Seconds + "</td></tr>"; });
    $("dtable").innerHTML = t + "</table>";
  }
  function initLab3() { renderCode($("py2"), PY2()); document.querySelectorAll("input[name=ds]").forEach(r => r.onchange = () => { S.ds = r.value; recompute(); }); }
  // ---------- Lab 4 ----------
  let chart = null;
  function destroyChart() { if (chart) { chart.destroy(); chart = null; } }
  function canvasFor() { destroyChart(); $("chartbox").innerHTML = '<canvas id="mainChart"></canvas>'; return $("mainChart"); }
  function niceTicks(lo, hi, k) { const span = hi - lo || 1, raw = span / k, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p, st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p, out = []; for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(6)); return out; }
  function plot2d(canvas, o) { const dpr = window.devicePixelRatio || 1, W = canvas.parentNode.clientWidth, H = 390; canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + "px"; canvas.style.height = H + "px";
    const c = canvas.getContext("2d"); c.scale(dpr, dpr); c.clearRect(0, 0, W, H); const m = { l: o.left || 62, r: o.right || 18, t: 16, b: 62 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const X = x => m.l + (x - o.x0) / (o.x1 - o.x0) * pw, Y = y => m.t + ph - (y - o.y0) / (o.y1 - o.y0) * ph; c.font = "12px sans-serif"; c.fillStyle = "#334"; c.strokeStyle = "#e1e7ee"; c.lineWidth = 1;
    (o.yt || []).forEach(v => { c.beginPath(); c.moveTo(m.l, Y(v)); c.lineTo(W - m.r, Y(v)); c.stroke(); c.textAlign = "right"; c.fillText(v, m.l - 6, Y(v) + 4); });
    (o.xt || []).forEach(v => { c.beginPath(); c.moveTo(X(v), m.t); c.lineTo(X(v), H - m.b); c.stroke(); c.textAlign = "center"; c.fillText(v, X(v), H - m.b + 16); });
    c.strokeStyle = "#445"; c.strokeRect(m.l, m.t, pw, ph); c.textAlign = "center"; c.font = "13px sans-serif"; c.fillText(o.xl || "", m.l + pw / 2, H - 8); if (o.yl) { c.save(); c.translate(14, m.t + ph / 2); c.rotate(-Math.PI / 2); c.fillText(o.yl, 0, 0); c.restore(); }
    return { c: c, X: X, Y: Y, m: m, W: W, H: H, pw: pw, ph: ph }; }
  function drawFig() {
    if (!S.rows) return; const rows = S.rows, f = S.fig; $("figTitle").textContent = FIGS[f].t; document.querySelectorAll("#figTabs button").forEach(b => b.classList.toggle("on", +b.dataset.f === f));
    if (!rows.length) { $("chartbox").innerHTML = '<p style="padding:30px;">No rows to chart. Run the collector in Lab 2.</p>'; $("insight").textContent = ""; return; }
    const n = rows.length, idx = rows.map((_, i) => i), base = { animation: false, maintainAspectRatio: false, responsive: true }; let ins = ""; const cv = canvasFor();
    const cnt = {}; rows.forEach(r => { cnt[r.Status] = (cnt[r.Status] || 0) + 1; }); const rs = runs(rows), dw = rows.filter(r => r.Dwell_Time_ms > 0).map(r => r.Dwell_Time_ms);
    if (f === 1) { chart = new Chart(cv, { type: "line", data: { labels: idx, datasets: [{ label: "PIR Trigger State (0=Vacant, 1=Motion)", data: rows.map(r => r.Motion_State), borderColor: "#0284c7", borderWidth: 3, stepped: "after", pointRadius: 0, fill: true, backgroundColor: "rgba(56,189,248,.25)" }] },
      options: Object.assign({ plugins: { legend: { position: "top" } }, scales: { y: { min: -0.05, max: 1.05, ticks: { stepSize: 1, callback: v => v === 0 ? "0 (Vacant)" : v === 1 ? "1 (Motion)" : "" }, title: { display: true, text: "Digital State" } }, x: { title: { display: true, text: "Sample Index (Seconds)" } } } }, base) });
      ins = "<strong>Read it:</strong> the sensor was HIGH in <strong>" + (rows.filter(r => r.Motion_State).length / n * 100).toFixed(0) + "%</strong> of the samples, in <strong>" + rs.length + "</strong> separate blocks" + (rs.length ? " (the longest lasted " + Math.max.apply(null, rs) + " s)" : "") + ". Each block is one person (or one PIR hold time). The gaps are the corridor being empty."; }
    if (f === 2) { destroyChart(); const P0 = null; if (!dw.length) { const P = plot2d($("mainChart"), { x0: 0, x1: 1, y0: 0, y1: 1, xt: [], yt: [], xl: "Dwell Duration (ms)", yl: "Observation Frequency" }); P.c.fillStyle = "#334"; P.c.font = "16px sans-serif"; P.c.textAlign = "center"; P.c.fillText("No Active Dwell Durations Logged", P.W / 2, P.H / 2); ins = "<strong>Read it:</strong> no row had a dwell above 0, so the script prints this message instead of a chart."; }
      else { const H = L.histogram(dw, S.viz.bins), hi = Math.max.apply(null, dw), lo = Math.min.apply(null, dw), xs = []; for (let i = 0; i <= 100; i++) xs.push(lo + (hi - lo) * i / 100); const k = dw.length > 1 && L.std(dw) > 0 ? L.kde(dw, xs) : xs.map(() => 0), mx = Math.max.apply(null, H.counts), ymax = Math.ceil(Math.max(mx, Math.max.apply(null, k.map(y => y * dw.length * H.w))) * 1.05), yt = niceTicks(0, ymax, 8), pad = (hi - lo || 1) * 0.06;
        const P = plot2d($("mainChart"), { x0: lo - pad, x1: hi + pad, y0: 0, y1: Math.max(ymax, yt[yt.length - 1]), xt: niceTicks(lo, hi, 6), yt: yt, xl: "Dwell Duration (ms)", yl: "Observation Frequency" }), c = P.c;
        c.fillStyle = "rgba(14,165,233,.5)"; c.strokeStyle = "#000"; c.lineWidth = 1.5; H.counts.forEach((ct, i) => { if (!ct) return; const x0 = P.X(H.lo + i * H.w), x1 = P.X(H.lo + (i + 1) * H.w); c.fillRect(x0, P.Y(ct), x1 - x0, P.Y(0) - P.Y(ct)); c.strokeRect(x0, P.Y(ct), x1 - x0, P.Y(0) - P.Y(ct)); });
        c.strokeStyle = "#0ea5e9"; c.lineWidth = 2.5; c.beginPath(); xs.forEach((x, i) => { const y = k[i] * dw.length * H.w; i ? c.lineTo(P.X(x), P.Y(y)) : c.moveTo(P.X(x), P.Y(y)); }); c.stroke();
        const med = L.quantile(dw, .5); ins = "<strong>Read it:</strong> " + dw.length + " readings with motion, ranging from <strong>" + lo + " to " + hi + " ms</strong> (median " + med + " ms). " + (hi < 100 ? "<span style='color:#c0392b'><strong>Suspicious:</strong> a person standing in a corridor for several seconds should give dwell values in the <em>thousands</em> of ms. Values of a few ms mean the timer keeps restarting (see Lab 1: signal noise and HOLD_MS).</span>" : "Values in the thousands of ms mean the timer is measuring real presence time."); } }
    if (f === 3) { const order = ["VACANT_STANDBY", "TRANSIT_PASSING", "ACTIVE_OCCUPANCY", "CONTINUOUS_PRESENCE"].filter(s => cnt[s]), cols = ["#64748b", "#38bdf8", "#0284c7", "#0369a1"];
      chart = new Chart(cv, { type: "bar", data: { labels: order, datasets: [{ data: order.map(s => cnt[s]), backgroundColor: order.map((_, i) => cols[i]) }] }, options: Object.assign({ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: "Logged Observations" } }, x: { title: { display: true, text: "Operational Status" }, ticks: { minRotation: 15, maxRotation: 15 } } } }, base) });
      ins = "<strong>Read it:</strong> " + order.map(s => s + " = " + cnt[s]).join(", ") + ". " + (!cnt.ACTIVE_OCCUPANCY && !cnt.CONTINUOUS_PRESENCE ? "<span style='color:#c0392b'>ACTIVE_OCCUPANCY and CONTINUOUS_PRESENCE never appear, even though motion lasted several seconds. That is another clue that the dwell timer is not working as intended.</span>" : "All the status levels in your data are shown. Note that colours follow the <em>position</em> in the list, not the name.") ; }
    if (f === 4) { destroyChart(); const C = M.corr(rows), N = M.NUM, P = plot2d($("mainChart"), { x0: 0, x1: 4, y0: 0, y1: 4, xt: [], yt: [], xl: "", yl: "", right: 90, left: 120 }), c = P.c; const cw = P.pw / 4, ch = P.ph / 4;
      C.forEach((r, i) => r.forEach((v, j) => { const t = isFinite(v) ? (v + 1) / 2 : 0; c.fillStyle = isFinite(v) ? M.blues(t) : "#eee"; c.fillRect(P.m.l + j * cw, P.m.t + i * ch, cw, ch); c.fillStyle = t > 0.5 ? "#fff" : "#123"; c.font = "15px sans-serif"; c.textAlign = "center"; c.fillText(isFinite(v) ? v.toFixed(2) : "nan", P.m.l + (j + .5) * cw, P.m.t + (i + .5) * ch + 5); }));
      c.fillStyle = "#334"; c.font = "12px sans-serif"; N.forEach((nm, i) => { c.textAlign = "right"; c.fillText(nm, P.m.l - 6, P.m.t + (i + .5) * ch + 4); c.save(); c.translate(P.m.l + (i + .5) * cw, P.H - P.m.b + 8); c.rotate(-Math.PI / 4); c.textAlign = "right"; c.fillText(nm, 0, 0); c.restore(); });
      const gx = P.W - 70, gh = P.ph; for (let k = 0; k < 60; k++) { c.fillStyle = M.blues(1 - k / 59); c.fillRect(gx, P.m.t + k * gh / 60, 16, gh / 60 + 1); } c.fillStyle = "#334"; c.textAlign = "left"; [-1, -0.5, 0, 0.5, 1].forEach(v => c.fillText(v.toFixed(2), gx + 22, P.m.t + (1 - (v + 1) / 2) * gh + 4));
      ins = "<strong>Read it:</strong> a value near <strong>1</strong> means two columns move together. Rolling_Activity vs Duty_Cycle_Pct = <strong>" + (isFinite(C[2][3]) ? C[2][3].toFixed(2) : "nan") + "</strong> (one is just the other ×10, so it is redundant). Motion_State vs Dwell_Time_ms = <strong>" + (isFinite(C[0][1]) ? C[0][1].toFixed(2) : "nan") + "</strong> (dwell is only above 0 when motion is 1). Correlation does not mean cause." ; }
    if (f === 5) { destroyChart(); const order = []; rows.forEach(r => { if (!order.includes(r.Status)) order.push(r.Status); }); const groups = order.map(s => ({ k: s, s: L.boxStats(rows.filter(r => r.Status === s).map(r => r.Dwell_Time_ms)), n: cnt[s] })), ymax = Math.max.apply(null, rows.map(r => r.Dwell_Time_ms)), ytk = niceTicks(0, ymax || 1, 6), topY = Math.max(ymax, ytk[ytk.length - 1]) + (ymax || 1) * 0.06;
      const P = plot2d($("mainChart"), { x0: 0, x1: groups.length, y0: -(ymax || 1) * 0.06, y1: topY, xt: [], yt: ytk, xl: "Status Category", yl: "Dwell Duration (ms)" }), c = P.c;
      groups.forEach((g, i) => { const cx = P.X(i + .5), hw = P.pw / groups.length * .38, s = g.s, col = M.blues(0.25 + 0.55 * (groups.length > 1 ? i / (groups.length - 1) : .5)); c.fillStyle = col; c.strokeStyle = "#555"; c.lineWidth = 2; c.fillRect(cx - hw, P.Y(s.q3), 2 * hw, P.Y(s.q1) - P.Y(s.q3)); c.strokeRect(cx - hw, P.Y(s.q3), 2 * hw, P.Y(s.q1) - P.Y(s.q3));
        c.beginPath(); c.moveTo(cx - hw, P.Y(s.med)); c.lineTo(cx + hw, P.Y(s.med)); c.moveTo(cx, P.Y(s.q3)); c.lineTo(cx, P.Y(s.hi)); c.moveTo(cx, P.Y(s.q1)); c.lineTo(cx, P.Y(s.lo)); c.moveTo(cx - hw / 2, P.Y(s.hi)); c.lineTo(cx + hw / 2, P.Y(s.hi)); c.moveTo(cx - hw / 2, P.Y(s.lo)); c.lineTo(cx + hw / 2, P.Y(s.lo)); c.stroke(); s.out.forEach(o => { c.beginPath(); c.arc(cx, P.Y(o), 4.5, 0, 7); c.stroke(); });
        c.fillStyle = "#334"; c.font = "12px sans-serif"; c.textAlign = "center"; c.save(); c.translate(cx, P.H - P.m.b + 14); c.rotate(-Math.PI / 12); c.fillText(g.k, 0, 0); c.restore(); });
      ins = "<strong>Read it:</strong> VACANT_STANDBY has dwell 0 every time, so its box collapses to a flat line (no spread at all). " + (groups.length > 1 ? "The other box shows how spread out the dwell values are; circles beyond the whiskers are outliers." : "") + " A box plot needs variation to show a box."; }
    if (f === 6) { const pk = Math.max.apply(null, rows.map(r => r.Duty_Cycle_Pct)), above = rows.filter(r => r.Duty_Cycle_Pct > S.viz.thr).length;
      chart = new Chart(cv, { type: "line", data: { labels: idx, datasets: [{ label: "Occupancy Duty Cycle (%)", data: rows.map(r => r.Duty_Cycle_Pct), borderColor: "#0369a1", borderWidth: 3, pointRadius: 0 }, { label: "High Demand Threshold (" + S.viz.thr + "%)", data: idx.map(() => S.viz.thr), borderColor: "#ef4444", borderDash: [8, 5], borderWidth: 2, pointRadius: 0 }] },
        options: Object.assign({ plugins: { legend: { position: "top" } }, scales: { y: { title: { display: true, text: "Occupancy Duty Cycle (%)" }, suggestedMin: 0 }, x: { title: { display: true, text: "Sample Index (Time Progress)" } } } }, base) });
      ins = "<strong>Read it:</strong> the duty cycle peaked at <strong>" + pk + "%</strong>, and was above your " + S.viz.thr + "% line for <strong>" + above + "</strong> of " + n + " samples. A high duty cycle means the corridor is busy, so the lights would be on most of the time there."; }
    $("insight").innerHTML = ins;
  }
  function initLab4() {
    $("figTabs").innerHTML = [1, 2, 3, 4, 5, 6].map(i => '<button data-f="' + i + '">Figure ' + i + "</button>").join("");
    $("figTabs").querySelectorAll("button").forEach(b => b.onclick = () => { S.fig = +b.dataset.f; renderCode($("py3"), FIGS[S.fig].code); drawFig(); }); renderCode($("py3"), FIGS[1].code);
    $("pngBtn").onclick = () => { const cv = $("mainChart"); if (!cv) return; const t = document.createElement("canvas"); t.width = cv.width; t.height = cv.height; const c = t.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, t.width, t.height); c.drawImage(cv, 0, 0); const a = document.createElement("a"); a.href = t.toDataURL("image/png"); a.download = "figure" + S.fig + "_motion.png"; a.click(); };
    window.addEventListener("resize", () => { if ([2, 4, 5].includes(S.fig)) drawFig(); });
  }
  // ---------- Lab 5 ----------
  function impInput(k, label) { return '<div><label>' + label + '<input data-i="' + k + '" data-l="' + label + '" type="number" step="any" min="0" value="' + S.imp[k] + '"></label></div>'; }
  function renderImpact() {
    if (!S.rows) return; const rows = S.rows, n = rows.length, im = S.imp; if (!n) { $("impact").innerHTML = "<p>No rows to analyse.</p>"; return; }
    const share = rows.filter(r => r.Motion_State === 1).length / n, rs = runs(rows), longest = rs.length ? Math.max.apply(null, rs) : 0, loiter = rs.filter(x => x >= im.alertS).length, kwhNight = im.lights * im.watts / 1000 * im.hours * (1 - share), yr = kwhNight * im.days, peakI = rows.reduce((b, r, i) => r.Duty_Cycle_Pct > rows[b].Duty_Cycle_Pct ? i : b, 0);
    const trust = rows.filter(r => r.Dwell_Time_ms > 0).length ? L.quantile(rows.filter(r => r.Dwell_Time_ms > 0).map(r => r.Dwell_Time_ms), .5) : 0;
    $("impact").innerHTML = "<h3 style='margin-top:0;color:var(--navy);'>💡 Energy and security from the Corner Swivel Watcher</h3><p>In this dataset, someone was detected in <strong>" + (share * 100).toFixed(0) + "%</strong> of the samples. If the corridor lights come on only then, they are <strong>OFF for " + ((1 - share) * 100).toFixed(0) + "%</strong> of the night instead of being on all the time.</p><div class='kpis'><div><b>" + kwhNight.toFixed(1) + " kWh</b><small>saved per night</small></div><div><b>" + Math.round(yr) + " kWh</b><small>saved per year</small></div><div><b>AED " + Math.round(yr * im.tariff) + "</b><small>saved per year</small></div><div><b>" + Math.round(yr * im.co2) + " kg</b><small>CO₂ avoided per year</small></div></div>"
      + "<h3 style='color:var(--navy);'>🔔 Security: how long did people stay?</h3><p>Counting <em>blocks of consecutive Motion = 1 samples</em> (1 sample = 1 second) gives <strong>" + rs.length + " events</strong>; the longest was <strong>" + longest + " s</strong>; <strong>" + loiter + "</strong> lasted at least " + im.alertS + " s and would sound the alert. " + (trust < 100 && trust > 0 ? "<br><span style='color:#c0392b'><strong>Data-quality note:</strong> Dwell_Time_ms is unreliable here (median " + trust + " ms), so we counted blocks of Motion_State instead. A good analyst picks a column that can be trusted.</span>" : "") + " The busiest moment (highest duty cycle, " + rows[peakI].Duty_Cycle_Pct + "%) was around sample " + peakI + ".</p>"
      + "<div class='assume'>" + impInput("lights", "Number of corridor lights") + impInput("watts", "Watts per light") + impInput("hours", "Hours lights are normally on per night") + impInput("tariff", "Tariff (AED per kWh)") + impInput("co2", "kg CO₂ per kWh") + impInput("days", "Nights per year") + impInput("alertS", "Seconds before an alert") + "</div><p class='legend'>One minute of data is not a whole night: say what that limits. Assumptions are examples. Replace them with your school's real numbers (SDG 11: Sustainable Cities).</p>";
    $("impact").querySelectorAll("input[data-i]").forEach(inp => inp.onchange = () => { const x = parseFloat(inp.value); if (isFinite(x) && x > 0) { logChange("Lab 5", inp.dataset.l, S.imp[inp.dataset.i], x); S.imp[inp.dataset.i] = x; } renderImpact(); });
  }
  // ---------- evidence ----------
  window.saveWithLog = function (strand, prompt, id) {
    const u = currentUser(), st = $("status-" + strand.toLowerCase()), text = $(id).value.trim(); if (!text) { st.textContent = "Write something first!"; return; } if (!u) { st.textContent = "Log in above first, then save."; return; }
    const log = S.log.map((r, i) => (i + 1) + ". [" + r.lab + "] " + r.what + ": " + r.from + " -> " + r.to).join(" | ");
    postToSheet("strand", { Name: u.name, Class: u.klass, Lesson: window.LESSON.name + " (SC5)", Strand: strand, Prompt: prompt, Response: text + "\n\nCHANGE LOG: " + (log || "(none)") }); st.textContent = "✅ Saved " + new Date().toLocaleTimeString(); };
  window.saveChallenge = function (strand, prompt, id) {
    const u = currentUser(), st = $("status-" + strand.toLowerCase()), text = $(id).value.trim(); if (!text) { st.textContent = "Write something first!"; return; } if (!u) { st.textContent = "Log in above first, then save."; return; }
    postToSheet("strand", { Name: u.name, Class: u.klass, Lesson: window.LESSON.name + " (SC5)", Strand: strand, Prompt: prompt, Response: text }); st.textContent = "✅ Saved " + new Date().toLocaleTimeString(); };
  $("logClear").onclick = () => { S.log = []; renderLog(); };
  // ---------- start ----------
  function init() {
    S.collected = M.collect(S.py.n, S.cfg, S.hw, S.seed, S.garbled);
    renderLink(); initLive(); initLab1(); initLab2(); initLab3(); initLab4(); renderCalc(); checkMissions(); recompute(); renderLog(); window.__MOT_STATE = S;
  }
  init();
})();
