/* ===== QCM enseignant SNT =====
   Les questions sont dans <script type="application/json" id="qcm-donnees"> :
   [{"q": "énoncé", "c": ["bonne réponse", "leurre", "leurre", "leurre"], "e": "explication"}, …]
   La première proposition est toujours la bonne : l'ordre affiché est mélangé.
   Sujet A et sujet B = deux ordres différents (questions et propositions), toujours les mêmes.
   S'initialise au chargement, ou après le déchiffrement de la page (évènement « contenu-dechiffre »). */
(function () {
  "use strict";

  function hasard(graine) { /* générateur pseudo-aléatoire reproductible */
    var s = 0;
    for (var i = 0; i < graine.length; i++) s = (s * 31 + graine.charCodeAt(i)) >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function melanger(tab, alea) {
    var a = tab.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(alea() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function init() {
    var src = document.getElementById("qcm-donnees");
    var liste = document.querySelector(".qcm-liste");
    if (!src || !liste || liste.dataset.pret) return;
    liste.dataset.pret = "1";
    var questions = JSON.parse(src.textContent);
    var page = document.querySelector("main");
    var titreVersion = document.querySelector(".qcm-version");
    var idQcm = liste.dataset.id || "qcm";
    var version = "A";

    function afficher() {
      var alea = hasard(idQcm + "-" + version);
      var ordre = questions.map(function (_, i) { return i; });
      if (version !== "A") ordre = melanger(ordre, alea); /* sujet A : ordre du cours ; sujet B : questions mélangées */
      liste.innerHTML = ordre.map(function (i) {
        var d = questions[i];
        var choix = melanger(d.c.map(function (txt, k) { return { txt: txt, bonne: k === 0 }; }), alea);
        var courts = d.c.every(function (t) { return t.length <= 24; }); /* propositions courtes : sur une seule ligne */
        return '<li class="qcm-q"><p class="enonce">' + esc(d.q) + '</p><ol class="choix' + (courts ? " courts" : "") + '">' +
          choix.map(function (c, k) {
            return '<li' + (c.bonne ? ' class="bonne"' : "") + '><span><span class="lettre">' + "ABCD"[k] + ".</span> " + esc(c.txt) + "</span></li>";
          }).join("") + "</ol>" + (d.e ? '<p class="explication">' + esc(d.e) + "</p>" : "") + "</li>";
      }).join("");
      if (titreVersion) titreVersion.textContent = "Sujet " + version;
    }

    document.querySelectorAll("[data-version]").forEach(function (b) {
      b.addEventListener("click", function () {
        version = b.dataset.version;
        document.querySelectorAll("[data-version]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        afficher();
      });
    });

    var bascule = document.getElementById("voir-reponses");
    if (bascule) bascule.addEventListener("change", function () { page.classList.toggle("avec-reponses", bascule.checked); });

    function imprimer(corrige) {
      var avant = page.classList.contains("avec-reponses");
      page.classList.toggle("avec-reponses", corrige);
      if (titreVersion) titreVersion.textContent = (corrige ? "Corrigé – sujet " : "Sujet ") + version;
      window.print();
      page.classList.toggle("avec-reponses", avant);
      if (titreVersion) titreVersion.textContent = "Sujet " + version;
    }
    var bs = document.getElementById("imprimer-sujet"), bc = document.getElementById("imprimer-corrige");
    if (bs) bs.addEventListener("click", function () { imprimer(false); });
    if (bc) bc.addEventListener("click", function () { imprimer(true); });

    afficher();
  }

  document.addEventListener("contenu-dechiffre", init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
