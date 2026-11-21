/* Automatismes : afficher la réponse d'une question, auto-évaluation et bilan enregistré sur l'appareil. */
(function () {
  "use strict";

  function load(id) {
    try { return JSON.parse(localStorage.getItem("auto:" + id) || "{}"); } catch (e) { return {}; }
  }
  function save(id, data) {
    try { localStorage.setItem("auto:" + id, JSON.stringify(data)); } catch (e) { /* stockage indisponible */ }
  }

  function initPage(bar) {
    var id = bar.dataset.page;
    var total = parseInt(bar.dataset.total, 10);
    var stats = bar.querySelector(".auto-stats");
    var state = load(id); // { n: { seen: true, ok: 1|0 } }
    var items = document.querySelectorAll(".auto-q");

    function refresh() {
      var seen = 0, ok = 0, ko = 0;
      Object.keys(state).forEach(function (k) {
        if (state[k].seen) seen++;
        if (state[k].ok === 1) ok++;
        if (state[k].ok === 0) ko++;
      });
      stats.innerHTML = "Réponses vues : <strong>" + seen + " / " + total + "</strong>" +
        (ok + ko ? " · ✔ justes : <strong>" + ok + "</strong> · ✘ à revoir : <strong>" + ko + "</strong>" : "");
    }

    function show(li, open) {
      var btn = li.querySelector(".auto-show");
      var ans = li.querySelector(".auto-ans");
      ans.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "🙈 Masquer la réponse" : "👁 Voir la réponse";
    }

    function mark(li, v) {
      li.classList.toggle("is-ok", v === 1);
      li.classList.toggle("is-ko", v === 0);
      li.querySelectorAll(".auto-self .btn").forEach(function (b) {
        b.classList.toggle("is-picked", String(v) === b.dataset.v);
      });
    }

    items.forEach(function (li) {
      var n = li.dataset.n;
      var st = state[n];
      if (st && st.ok !== undefined) mark(li, st.ok);
      li.querySelector(".auto-show").addEventListener("click", function () {
        var open = li.querySelector(".auto-ans").hidden;
        show(li, open);
        if (open) {
          state[n] = state[n] || {};
          state[n].seen = true;
          save(id, state); refresh();
        }
      });
      li.querySelectorAll(".auto-self .btn").forEach(function (b) {
        b.addEventListener("click", function () {
          var v = parseInt(b.dataset.v, 10);
          state[n] = state[n] || { seen: true };
          state[n].ok = v;
          mark(li, v);
          save(id, state); refresh();
        });
      });
    });

    bar.querySelector(".auto-reset").addEventListener("click", function () {
      state = {};
      save(id, state);
      items.forEach(function (li) { show(li, false); mark(li, -1); });
      refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    refresh();
  }

  function initHub() {
    document.querySelectorAll("[data-auto-score]").forEach(function (el) {
      var st = load(el.dataset.autoScore);
      var ok = 0, ko = 0;
      Object.keys(st).forEach(function (k) {
        if (st[k].ok === 1) ok++;
        if (st[k].ok === 0) ko++;
      });
      if (ok + ko) {
        el.textContent = "✔ " + ok + " juste" + (ok > 1 ? "s" : "") + " · ✘ " + ko + " à revoir";
        el.hidden = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var bar = document.querySelector(".auto-bar");
    if (bar) initPage(bar);
    initHub();
  });
})();
