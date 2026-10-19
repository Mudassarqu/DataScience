/**
 * UGOT Criterion B site backend — logs student logins, Kahoot-style quiz
 * scores, and strand (B1–B4) interactive responses into this spreadsheet.
 *
 * SETUP (one-time, ~3 minutes):
 *  1. Create a new Google Sheet (or open an existing one).
 *  2. Extensions -> Apps Script. Delete any starter code and paste this
 *     whole file in.
 *  3. Click Deploy -> New deployment -> type: "Web app".
 *       - Execute as: Me
 *       - Who has access: Anyone
 *  4. Click Deploy, authorise the requested permissions, and copy the Web
 *     app URL it gives you (ends in /exec).
 *  5. Paste that URL into APPS_SCRIPT_URL near the top of index.html
 *     (search for "PASTE_YOUR_APPS_SCRIPT_URL_HERE").
 *  6. Re-deploy (Deploy -> Manage deployments -> edit -> New version) any
 *     time you change this file.
 *
 * Three tabs are created automatically the first time each type of data
 * arrives — you do not need to pre-create columns:
 *   - "Logins"            : Timestamp, Name, Class
 *   - "Quiz_Scores"        : Timestamp, Name, Class, Lesson, Quiz, Score,
 *                            Total, Percent, TimeTakenSec
 *   - "Strand_Responses"   : Timestamp, Name, Class, Lesson, Strand,
 *                            Prompt, Response
 * New quiz/strand field names sent from the page are added as new columns
 * automatically (see getOrCreateSheet_ / appendRow_).
 */

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var type = body.type;
    var row = body.data || {};
    row.Timestamp = new Date();

    var sheetName =
      type === "login" ? "Logins" :
      type === "quiz" ? "Quiz_Scores" :
      type === "strand" ? "Strand_Responses" : null;

    if (!sheetName) {
      return jsonOut_({ ok: false, error: "Unknown submission type: " + type });
    }

    appendRow_(sheetName, row);
    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  // Simple health check / leaderboard read for the quiz page.
  var action = e.parameter.action;
  if (action === "leaderboard") {
    var quiz = e.parameter.quiz || "";
    return jsonOut_({ ok: true, rows: readLeaderboard_(quiz) });
  }
  return jsonOut_({ ok: true, message: "UGOT Criterion B backend is running." });
}

function appendRow_(sheetName, rowObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(Object.keys(rowObj));
  }

  var headerRange = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1));
  var headers = sheet.getLastColumn() > 0 ? headerRange.getValues()[0] : [];

  // Auto-create any new columns this submission introduces.
  Object.keys(rowObj).forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      sheet.insertColumnAfter(Math.max(sheet.getLastColumn(), 1));
      sheet.getRange(1, sheet.getLastColumn()).setValue(key);
      headers.push(key);
    }
  });

  var newRow = headers.map(function (h) {
    return Object.prototype.hasOwnProperty.call(rowObj, h) ? rowObj[h] : "";
  });
  sheet.appendRow(newRow);
}

function readLeaderboard_(quizFilter) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Quiz_Scores");
  if (!sheet || sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  var nameIdx = headers.indexOf("Name");
  var quizIdx = headers.indexOf("Quiz");
  var scoreIdx = headers.indexOf("Score");
  var totalIdx = headers.indexOf("Total");
  var out = values
    .filter(function (r) { return !quizFilter || r[quizIdx] === quizFilter; })
    .map(function (r) {
      return { name: r[nameIdx], quiz: r[quizIdx], score: r[scoreIdx], total: r[totalIdx] };
    })
    .sort(function (a, b) { return b.score - a.score; })
    .slice(0, 10);
  return out;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
