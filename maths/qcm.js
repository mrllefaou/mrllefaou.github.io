/* QCM de révision – Maths
   Les corrections sont stockées chiffrées dans la page et ne sont
   déchiffrées et affichées qu'après validation de toutes les réponses. */
(function () {
  "use strict";

  function decode(b64, key) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length), k = new TextEncoder().encode(key);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) ^ k[i % k.length];
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function store(id, value) {
    try { localStorage.setItem("qcm:" + id, JSON.stringify(value)); } catch (e) { /* stockage indisponible */ }
  }
  function load(id) {
    try { return JSON.parse(localStorage.getItem("qcm:" + id) || "null"); } catch (e) { return null; }
  }

  /* ---------- Page d'un QCM ---------- */
  function initQcm(form) {
    var dataEl = document.getElementById(form.dataset.source);
    var questions = Array.prototype.slice.call(form.querySelectorAll(".q"));
    var total = questions.length;
    var validateBtn = form.querySelector(".validate-btn");
    var resetBtn = form.querySelector(".reset-btn");
    var status = form.querySelector(".remaining");
    var scoreBox = form.querySelector(".score");
    var summary = document.querySelector(".qcm-summary");
    var validated = false;

    function answered() {
      return questions.filter(function (q) { return q.querySelector("input:checked"); }).length;
    }

    function refresh() {
      if (validated) return;
      var left = total - answered();
      questions.forEach(function (q) { q.classList.toggle("is-answered", !!q.querySelector("input:checked")); });
      validateBtn.disabled = left > 0;
      status.textContent = left > 0
        ? "⏳ Encore " + left + " question" + (left > 1 ? "s" : "") + " sans réponse : réponds à tout pour pouvoir valider."
        : "✅ Toutes les questions ont une réponse : tu peux valider.";
      status.classList.toggle("ready", left === 0);
    }

    function validate() {
      if (validated || answered() < total) return;
      var data = decode(dataEl.textContent.trim(), form.dataset.key);
      var score = 0;
      validated = true;
      form.classList.add("is-validated");
      questions.forEach(function (q, i) {
        var d = data[i];
        var chosen = q.querySelector("input:checked");
        var right = chosen && chosen.value === d.a;
        if (right) score++;
        q.classList.add(right ? "is-right" : "is-wrong");
        q.querySelectorAll("input").forEach(function (inp) {
          inp.disabled = true;
          var label = inp.closest(".choice");
          if (inp.value === d.a) label.classList.add("is-correct");
          else if (inp.checked) label.classList.add("is-chosen-wrong");
        });
        var fb = q.querySelector(".feedback");
        fb.innerHTML =
          '<p class="fb-verdict">' + (right ? "✔ Bonne réponse !" : "✘ Ce n’est pas la bonne réponse.") + "</p>" +
          "<p>Bonne réponse : <strong>" + d.g + "</strong></p>" +
          "<p>" + d.e + "</p>" +
          '<p class="fb-ref">📖 ' + d.r + "</p>";
        fb.hidden = false;
      });
      var msg = score === total ? "Parfait ! 🎉" : score >= total * 0.75 ? "Très bien ! 👏" : score >= total / 2 ? "Pas mal, relis les corrections. 💪" : "Relis le cours puis recommence. 📖";
      scoreBox.textContent = "🏁 Score : " + score + " / " + total + " — " + msg;
      scoreBox.hidden = false;
      status.hidden = true;
      validateBtn.hidden = true;
      if (summary) {
        summary.textContent = "🏁 Ton score : " + score + " / " + total + " — " + msg + " Les corrections sont affichées sous chaque question.";
        summary.hidden = false;
        summary.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      var prev = load(form.dataset.id) || {};
      store(form.dataset.id, { last: score, best: Math.max(score, prev.best || 0), total: total });
    }

    function reset() {
      validated = false;
      form.reset();
      form.classList.remove("is-validated");
      questions.forEach(function (q) {
        q.classList.remove("is-right", "is-wrong");
        q.querySelectorAll("input").forEach(function (inp) { inp.disabled = false; });
        q.querySelectorAll(".choice").forEach(function (c) { c.classList.remove("is-correct", "is-chosen-wrong"); });
        var fb = q.querySelector(".feedback");
        fb.innerHTML = "";
        fb.hidden = true;
      });
      scoreBox.hidden = true;
      status.hidden = false;
      validateBtn.hidden = false;
      if (summary) summary.hidden = true;
      refresh();
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
    }

    form.addEventListener("change", refresh);
    form.addEventListener("submit", function (e) { e.preventDefault(); validate(); });
    resetBtn.addEventListener("click", reset);
    refresh();
  }

  /* ---------- Page d'un chapitre : derniers scores ---------- */
  function initScores() {
    document.querySelectorAll("[data-qcm-score]").forEach(function (el) {
      var s = load(el.dataset.qcmScore);
      if (s) {
        el.textContent = "Dernier score : " + s.last + "/" + s.total + " · meilleur : " + s.best + "/" + s.total;
        el.hidden = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form.qcm").forEach(initQcm);
    initScores();
  });
})();
