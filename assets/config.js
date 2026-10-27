/* ==========================================================================
   ONE place to configure the whole site.
   Paste your Google Apps Script Web App URL (ends in /exec) between the quotes.
   Leave it as is and everything still works - answers and scores are kept in
   each student's own browser, they just do not reach your Google Sheet.
   ========================================================================== */
window.APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUGObrXqHTlkI6jchze0Dfp9JEP2w36K9tRN4lDwdveJp16HVbX8bsKWJPTuPB20jZgQ/exec";

/* ==========================================================================
   FOCUS MODE (added): shows only Simulators, Playground, Tutorials and Block Coding.
   Hides the Criteria A, B and D pages from the menus and home page. Criterion C stays.
   To show everything again for everyone: change true to false on the next line.
   Teacher shortcut: open any page with ?teacher=1 to see everything on your own browser (?teacher=0 turns it off).
   ========================================================================== */
window.FOCUS_MODE = true;
(function () {
  if (!window.FOCUS_MODE) return;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get("teacher") === "1") localStorage.setItem("ugot_teacher", "1");
    if (q.get("teacher") === "0") localStorage.removeItem("ugot_teacher");
    if (localStorage.getItem("ugot_teacher") === "1") return;
  } catch (e) {}
  var HIDDEN = [/criteria-[abd][^\/]*\.html/i];
  var isHidden = function (u) { return HIDDEN.some(function (r) { return r.test(u); }); };
  var base = new URL("../", document.currentScript ? document.currentScript.src : location.href);
  if (isHidden(location.pathname)) { location.replace(new URL("criteria-c.html", base).href); return; }
  var hide = function (el) { if (el) el.style.display = "none"; };
  var pass = function () {
    [].slice.call(document.querySelectorAll("a[href]")).forEach(function (a) {
      var h = a.getAttribute("href") || ""; if (!isHidden(new URL(h, location.href).pathname)) return;
      var c = a.closest(".crit-card,.lesson-card,.dlbtn,.card");
      hide(c && c.querySelectorAll("a[href]").length === 1 ? c : a);
    });
    [].slice.call(document.querySelectorAll("section,.crit-grid,.lesson-grid,.download-grid,table,.grid")).forEach(function (box) {
      var ls = [].slice.call(box.querySelectorAll("a[href]"));
      if (!ls.length) return;
      var n = ls.filter(function (a) { return isHidden(new URL(a.getAttribute("href"), location.href).pathname); }).length;
      if (n && n === ls.length) hide(box.tagName === "TABLE" ? (box.closest(".card") || box) : box);
    });
  };
  document.addEventListener("DOMContentLoaded", function () {
    pass(); setTimeout(pass, 800); setTimeout(pass, 2500);
    var p = document.querySelector(".landing-hero p");
    if (p && /exemplars/i.test(p.textContent)) p.textContent = "Virtual UGOT simulators, block coding, a Python playground and guided tutorials for MYP Design, Grade 10, Ambassador International Academy.";
    var main = document.querySelector("main");
    if (main && document.querySelector(".landing-hero")) {
      var any = [].slice.call(main.children).some(function (c) { return c.style.display !== "none" && c.textContent.trim(); });
      if (!any) {
        var u = function (f) { return new URL(f, base).href; };
        var card = function (f, emoji, t, d) { return '<a class="crit-card" href="' + u(f) + '"><div class="letter">' + emoji + '</div><h3>' + t + '</h3><p>' + d + '</p></a>'; };
        main.innerHTML = '<div class="crit-grid" style="margin:10px auto 30px">' +
          card("simulator.html", "🤖", "Simulators", "Test your Python on the virtual UGOT for every lesson.") +
          card("ugotBlocks/index.html", "🧩", "Block Coding", "Build programs with blocks: tutorials, playground and simulators.") +
          card("playground.html", "🎯", "Python Playground", "Practise with challenges, hints and instant checks.") +
          card("tutorials.html", "📘", "Tutorials", "Short video lessons with code you can run.") + "</div>";
      }
    }
  });
})();

