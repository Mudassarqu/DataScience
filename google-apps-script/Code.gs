/**
 * AIA Grade 9 DS PRO backend v3 (Criteria A, B, C and D)
 * Saves logins, quiz scores and strand answers into this spreadsheet,
 * calculates percentages and builds a gradebook automatically.
 *
 * SETUP (about 3 minutes; your existing deployment keeps working):
 *  1. Open your Google Sheet, then Extensions -> Apps Script.
 *  2. Delete the old code and paste this whole file in. Save.
 *  3. Deploy -> Manage deployments -> pencil icon -> Version: New version -> Deploy.
 *     (First time ever: Deploy -> New deployment -> Web app, Execute as: Me,
 *      Who has access: Anyone. Copy the /exec URL into assets/config.js.)
 *  4. Reload the Sheet. A menu "DS PRO" appears. Choose DS PRO -> Rebuild gradebook.
 *
 * SHEETS (created automatically):
 *   Logins            every login (Timestamp, Name, Class, Lesson)
 *   Quiz_Scores       every quiz attempt: Timestamp, Name, Class, Criterion,
 *                     Topic, Lesson, Quiz, Score, Total, Percent, Points,
 *                     MCQ, Fill, Match, TimeTakenSec
 *   Strand_Responses  written answers from the interactive challenges
 *   Best_Scores       best attempt per student per quiz (rebuilt automatically)
 *   Gradebook         one row per student: average % for A, B, C, D, overall %,
 *                     quizzes taken, last activity (rebuilt automatically)
 *   Class_Summary     one row per class and criterion: students, average %
 *   Criteria_Check    attempts, students and last activity for A, B, C, D and P
 *                     (use it to confirm quizzes from every criterion arrive)
 *   Unrouted          anything a page sent that is not a login, quiz or answer
 *                     (nothing is ever dropped)
 *
 * RULES
 *   Percent = round(Score / Total x 100) and is recalculated here, so it is
 *   always correct even if a page sends a wrong value.
 *   The criterion average uses each student's BEST score on each quiz.
 *   Criterion is read from the "Criterion" field (A, B, C or D). Older rows
 *   without it are treated as B.
 */

var CRITERIA = ["A", "B", "C", "D", "P"];   // P = Python Practice challenges (not part of Overall %); the Topic column holds the sensor, e.g. Light sensor, Motion sensor
var GRADED = ["A", "B", "C", "D"];

function norm_(o) {
  var r = {};
  Object.keys(o || {}).forEach(function (k) {
    var nk = k.charAt(0).toUpperCase() + k.slice(1);
    r[nk] = o[k];
  });
  return r;
}
function inferCriterion_(row) {
  var c = String(row.Criterion || "").toUpperCase().trim();
  if (CRITERIA.indexOf(c) >= 0) return c;
  var text = [row.Quiz, row.Lesson, row.Topic, row.Page].join(" ");
  var m = /Criteri(?:a|on)\s*([ABCD])\b/i.exec(text) || /^\s*([ABCD])\s*(?:Quiz|·|-|:)/.exec(String(row.Quiz || ""));
  return m ? m[1].toUpperCase() : "B";
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var body = JSON.parse(e.postData.contents);
    var type = String(body.type || "").toLowerCase();
    var row = norm_(body.data || {});
    row.Timestamp = new Date();

    var isQuiz = ["quiz", "score", "quiz_score", "quizscore", "result"].indexOf(type) >= 0;
    var isLogin = type === "login";
    var isStrand = ["strand", "answer", "response", "reflection"].indexOf(type) >= 0;
    var sheetName = isLogin ? "Logins" : isQuiz ? "Quiz_Scores" : isStrand ? "Strand_Responses" : "Unrouted";
    if (sheetName === "Unrouted") row.Type = type;

    if (isQuiz) {
      row.Criterion = inferCriterion_(row);
      var sc = Number(row.Score), tot = Number(row.Total);
      if (tot > 0) row.Percent = Math.round(sc / tot * 100);
    }
    appendRow_(sheetName, row);
    if (isQuiz) rebuildGradebook_();
    return jsonOut_({ ok: true, stored: sheetName });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  var p = e.parameter || {};
  if (p.action === "leaderboard") {
    return jsonOut_({ ok: true, rows: readLeaderboard_(p.quiz || "", p.criterion || "") });
  }
  if (p.action === "student") {
    return jsonOut_({ ok: true, rows: readStudent_(p.name || "", p.klass || "") });
  }
  return jsonOut_({ ok: true, message: "DS PRO backend v2 is running." });
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("DS PRO")
    .addItem("Rebuild gradebook", "rebuildGradebook_")
    .addItem("Send test rows for A, B, C and D", "sendTestRows_")
    .addItem("Delete test rows", "deleteTestRows_")
    .addToUi();
}

/* ---------- writing ---------- */
function appendRow_(sheetName, rowObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var first = sheetName === "Quiz_Scores"
      ? ["Timestamp", "Name", "Class", "Criterion", "Topic", "Lesson", "Quiz", "Score", "Total", "Percent", "Points", "MCQ", "Fill", "Match", "TimeTakenSec"]
      : Object.keys(rowObj);
    sheet.appendRow(first);
    sheet.setFrozenRows(1);
  }
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  Object.keys(rowObj).forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(key);
      headers.push(key);
    }
  });
  sheet.appendRow(headers.map(function (h) {
    return Object.prototype.hasOwnProperty.call(rowObj, h) ? rowObj[h] : "";
  }));
}

/* ---------- reading ---------- */
function readQuizRows_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quiz_Scores");
  if (!sheet || sheet.getLastRow() < 2) return [];
  var v = sheet.getDataRange().getValues();
  var h = v.shift();
  var ix = function (n) { return h.indexOf(n); };
  return v.map(function (r) {
    var crit = String(ix("Criterion") >= 0 ? r[ix("Criterion")] : "").toUpperCase();
    var score = Number(r[ix("Score")]), total = Number(r[ix("Total")]);
    return {
      time: r[ix("Timestamp")],
      name: String(r[ix("Name")] || "").trim(),
      klass: String(r[ix("Class")] || "").trim(),
      criterion: CRITERIA.indexOf(crit) >= 0 ? crit : "B",
      quiz: String(r[ix("Quiz")] || ""),
      score: score, total: total,
      pct: total > 0 ? Math.round(score / total * 100) : 0
    };
  }).filter(function (r) { return r.name && r.total > 0; });
}

function readLeaderboard_(quizFilter, critFilter) {
  return readQuizRows_()
    .filter(function (r) { return (!quizFilter || r.quiz === quizFilter) && (!critFilter || r.criterion === critFilter); })
    .sort(function (a, b) { return b.pct - a.pct || b.score - a.score; })
    .slice(0, 10)
    .map(function (r) { return { name: r.name, quiz: r.quiz, criterion: r.criterion, score: r.score, total: r.total, percent: r.pct }; });
}

function readStudent_(name, klass) {
  return readQuizRows_().filter(function (r) {
    return r.name.toLowerCase() === String(name).toLowerCase() &&
      (!klass || r.klass.toLowerCase() === String(klass).toLowerCase());
  }).map(function (r) { return { criterion: r.criterion, quiz: r.quiz, score: r.score, total: r.total, percent: r.pct, time: r.time }; });
}

/* ---------- gradebook ---------- */
function rebuildGradebook_() {
  var rows = readQuizRows_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // best attempt per student + quiz
  var best = {};
  rows.forEach(function (r) {
    var k = [r.name.toLowerCase(), r.klass.toLowerCase(), r.criterion, r.quiz].join("|");
    var b = best[k];
    if (!b) { best[k] = { r: r, attempts: 1, last: r.time }; return; }
    b.attempts++;
    if (r.time > b.last) b.last = r.time;
    if (r.pct > b.r.pct || (r.pct === b.r.pct && r.score > b.r.score)) b.r = r;
  });
  var bestRows = Object.keys(best).map(function (k) { return best[k]; })
    .sort(function (a, b) {
      return (a.r.klass + a.r.name + a.r.criterion + a.r.quiz).localeCompare(b.r.klass + b.r.name + b.r.criterion + b.r.quiz);
    });
  var out1 = [["Name", "Class", "Criterion", "Quiz", "Best score", "Total", "Best %", "Attempts", "Last attempt"]];
  bestRows.forEach(function (b) {
    out1.push([b.r.name, b.r.klass, b.r.criterion, b.r.quiz, b.r.score, b.r.total, b.r.pct, b.attempts, b.last]);
  });
  writeSheet_(ss, "Best_Scores", out1);

  // gradebook: per student
  var stu = {};
  bestRows.forEach(function (b) {
    var k = b.r.name.toLowerCase() + "|" + b.r.klass.toLowerCase();
    var s = stu[k] || (stu[k] = { name: b.r.name, klass: b.r.klass, sums: {}, counts: {}, n: 0, last: b.last });
    s.sums[b.r.criterion] = (s.sums[b.r.criterion] || 0) + b.r.pct;
    s.counts[b.r.criterion] = (s.counts[b.r.criterion] || 0) + 1;
    s.n++;
    if (b.last > s.last) s.last = b.last;
  });
  var out2 = [["Name", "Class", "A avg %", "B avg %", "C avg %", "D avg %", "Overall %", "Practice challenges passed", "Quizzes taken", "Last activity"]];
  var classAgg = {};
  Object.keys(stu).sort().forEach(function (k) {
    var s = stu[k], line = [s.name, s.klass], tot = 0, cnt = 0;
    GRADED.forEach(function (c) {
      if (s.counts[c]) {
        var avg = Math.round(s.sums[c] / s.counts[c]);
        line.push(avg); tot += avg; cnt++;
        var ck = s.klass + "|" + c, a = classAgg[ck] || (classAgg[ck] = { klass: s.klass, c: c, sum: 0, n: 0 });
        a.sum += avg; a.n++;
      } else line.push("");
    });
    line.push(cnt ? Math.round(tot / cnt) : "", s.n - (s.counts.P || 0), s.last);
    line.splice(7, 0, s.counts.P || 0);   // practice count column after Overall
    // keep column order: ..., Overall %, Practice passed, Quizzes taken, Last activity
    out2.push(line);
  });
  writeSheet_(ss, "Gradebook", out2);

  var out3 = [["Class", "Criterion", "Students", "Class average %"]];
  Object.keys(classAgg).sort().forEach(function (k) {
    var a = classAgg[k];
    out3.push([a.klass, a.c, a.n, Math.round(a.sum / a.n)]);
  });
  writeSheet_(ss, "Class_Summary", out3);

  var chk = {};
  rows.forEach(function (r) {
    var c = chk[r.criterion] || (chk[r.criterion] = { n: 0, who: {}, last: r.time });
    c.n++; c.who[r.name.toLowerCase() + "|" + r.klass.toLowerCase()] = 1;
    if (r.time > c.last) c.last = r.time;
  });
  var out4 = [["Criterion", "Attempts saved", "Students", "Last activity"]];
  CRITERIA.forEach(function (c) {
    var x = chk[c];
    out4.push([c === "P" ? "P (Python practice and lab steps)" : c, x ? x.n : 0, x ? Object.keys(x.who).length : 0, x ? x.last : ""]);
  });
  writeSheet_(ss, "Criteria_Check", out4);
}

function writeSheet_(ss, name, table) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1, table.length, table[0].length).setValues(table);
  sh.getRange(1, 1, 1, table[0].length).setFontWeight("bold").setBackground("#0f2a43").setFontColor("#ffffff");
  sh.setFrozenRows(1);
  if (name === "Gradebook") {
    var rng = sh.getRange(2, 3, Math.max(table.length - 1, 1), 5);  // A-D + Overall only
    sh.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(50).setBackground("#f8d7d0").setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(50, 74).setBackground("#fff3cd").setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(75).setBackground("#d6f0dd").setRanges([rng]).build()
    ]);
  }
  sh.autoResizeColumns(1, table[0].length);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- self test: proves every criterion reaches the sheet ---------- */
function sendTestRows_() {
  ["A", "B", "C", "D"].forEach(function (c) {
    appendRow_("Quiz_Scores", { Timestamp: new Date(), Name: "TEST Teacher", Class: "TEST", Criterion: c, Topic: "Test", Lesson: "Test", Quiz: c + " Quiz · test", Score: 8, Total: 10, Percent: 80, Points: 0, MCQ: "", Fill: "", Match: "", TimeTakenSec: 1 });
  });
  rebuildGradebook_();
  SpreadsheetApp.getUi().alert("Test rows added. Open Criteria_Check: A, B, C and D should each show 1 attempt. Then choose DS PRO, Delete test rows.");
}
function deleteTestRows_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quiz_Scores");
  if (!sh) return;
  var v = sh.getDataRange().getValues(), h = v[0], ni = h.indexOf("Name");
  for (var i = v.length - 1; i >= 1; i--) if (String(v[i][ni]) === "TEST Teacher") sh.deleteRow(i + 1);
  rebuildGradebook_();
}
