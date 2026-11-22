/* ===== Barre de recherche (commune à tout le site) =====
   Bouton « Rechercher » dans la barre du haut (raccourci : touche « / »).
   L'index (commun/index-recherche.json) est chargé seulement à la première recherche.
   Il se régénère avec : python3 outils/generer_recherche.py */
(function () {
  var script = document.currentScript;
  var racine = script ? script.src.replace(/commun\/recherche\.js(\?.*)?$/, '') : '/';
  var index = null, chargement = null;

  function normaliser(t) {
    return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function charger() {
    if (chargement) return chargement;
    chargement = fetch(racine + 'commun/index-recherche.json')
      .then(function (r) { return r.json(); })
      .then(function (pages) {
        index = pages.map(function (p) {
          p.nt = normaliser(p.t + ' ' + p.e); p.nd = normaliser(p.d); p.nh = normaliser(p.h); p.nx = normaliser(p.x);
          return p;
        });
      });
    return chargement;
  }

  function chercher(requete) {
    var mots = normaliser(requete).split(/[^a-z0-9]+/).filter(function (m) { return m.length > 1; });
    if (!mots.length) return [];
    var res = [];
    index.forEach(function (p) {
      var score = 0;
      for (var i = 0; i < mots.length; i++) {
        var m = mots[i], s = 0;
        if (p.nt.indexOf(m) > -1) s += 10;
        if (p.nh.indexOf(m) > -1) s += 4;
        if (p.nd.indexOf(m) > -1) s += 3;
        if (p.nx.indexOf(m) > -1) s += 1;
        if (!s) return; /* tous les mots doivent être présents */
        score += s;
      }
      res.push({ p: p, s: score });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.slice(0, 25);
  }

  function extrait(p, requete) {
    var mot = normaliser(requete).split(/[^a-z0-9]+/).filter(function (m) { return m.length > 1; })[0];
    var i = mot ? p.nx.indexOf(mot) : -1;
    if (i < 0) return esc(p.d || '');
    var debut = Math.max(0, i - 60);
    var bout = p.x.slice(debut, debut + 170);
    var j = normaliser(bout).indexOf(mot);
    var html = j > -1 ? esc(bout.slice(0, j)) + '<mark>' + esc(bout.slice(j, j + mot.length)) + '</mark>' + esc(bout.slice(j + mot.length)) : esc(bout);
    return (debut > 0 ? '… ' : '') + html + ' …';
  }

  var css =
    '.bouton-recherche{display:inline-flex;align-items:center;gap:.45rem;margin-left:auto;padding:.4rem .85rem;border-radius:999px;' +
    'border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:inherit;' +
    'font:600 .88rem system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;cursor:pointer;transition:background .25s ease,transform .25s ease;}' +
    '.bouton-recherche:hover{background:rgba(255,255,255,.16);transform:translateY(-1px);}' +
    '.bouton-recherche:focus-visible{outline:3px solid #6ea0ff;outline-offset:2px;}' +
    '.bouton-recherche kbd{font:600 .75rem ui-monospace,monospace;opacity:.6;border:1px solid currentColor;border-radius:4px;padding:0 .3rem;}' +
    'html.theme-clair .bouton-recherche{border-color:rgba(20,30,60,.18);background:rgba(20,30,60,.05);}' +
    'html.theme-clair .bouton-recherche:hover{background:rgba(20,30,60,.1);}' +
    '.topbar-inner .bouton-recherche ~ .bouton-theme{margin-left:.5rem;}' +
    '.bouton-recherche.flottant{position:fixed;top:1rem;right:10.5rem;z-index:50;color:#eef2ff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);}' +
    'html.theme-clair .bouton-recherche.flottant{color:#1c2333;background:rgba(255,255,255,.7);}' +
    '@media (max-width:600px){.bouton-recherche .txt,.bouton-recherche kbd{display:none;}.bouton-recherche{padding:.4rem .6rem;}.bouton-recherche.flottant{right:4.2rem;}}' +
    '.rech-fond{position:fixed;inset:0;z-index:1000;background:rgba(10,15,30,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);' +
      'display:flex;justify-content:center;align-items:flex-start;padding:8vh 1rem 1rem;}' +
    '.rech-fond[hidden]{display:none;}' +
    '.rech-boite{width:min(680px,100%);max-height:80vh;display:flex;flex-direction:column;border-radius:16px;overflow:hidden;' +
      'background:#182032;color:#e8ecf5;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;}' +
    'html.theme-clair .rech-boite{background:#fff;color:#1c2333;}' +
    '.rech-champ{display:flex;align-items:center;gap:.6rem;padding:.9rem 1.1rem;border-bottom:1px solid rgba(127,140,170,.25);}' +
    '.rech-champ input{flex:1;border:0;outline:0;background:transparent;color:inherit;font:inherit;font-size:1.1rem;}' +
    '.rech-champ button{border:1px solid rgba(127,140,170,.35);background:transparent;color:inherit;border-radius:8px;padding:.25rem .55rem;font:inherit;font-size:.8rem;cursor:pointer;}' +
    '.rech-res{list-style:none;margin:0;padding:.4rem;overflow-y:auto;}' +
    '.rech-res a{display:block;padding:.65rem .8rem;border-radius:10px;color:inherit;text-decoration:none;}' +
    '.rech-res a:hover,.rech-res a.actif{background:rgba(110,160,255,.16);}' +
    '.rech-res .rt{font-weight:700;}' +
    '.rech-res .rr{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:.05rem .45rem;border-radius:999px;margin-right:.45rem;background:rgba(110,160,255,.2);color:#6ea0ff;vertical-align:.1em;}' +
    'html.theme-clair .rech-res .rr{color:#2563eb;background:#e8efff;}' +
    '.rech-res .rr.m{background:rgba(244,63,94,.18);color:#f43f5e;}' +
    '.rech-res .re{display:block;font-size:.8rem;opacity:.7;margin-top:.1rem;}' +
    '.rech-res .rx{display:block;font-size:.88rem;opacity:.85;margin-top:.25rem;line-height:1.45;}' +
    '.rech-res mark{background:#fde68a;color:#1c2333;border-radius:3px;padding:0 .1rem;}' +
    '.rech-vide{padding:1.2rem;text-align:center;opacity:.75;margin:0;}' +
    '@media print{.bouton-recherche,.rech-fond{display:none !important;}}';

  var fond, champ, liste, actif = -1;

  function construire() {
    fond = document.createElement('div');
    fond.className = 'rech-fond';
    fond.hidden = true;
    fond.innerHTML = '<div class="rech-boite" role="dialog" aria-modal="true" aria-label="Rechercher dans le site">' +
      '<div class="rech-champ"><span aria-hidden="true">🔎</span><input type="search" placeholder="Rechercher un mot : cookie, dérivée, pixel…" aria-label="Rechercher dans le site" autocomplete="off" spellcheck="false"><button type="button">Échap</button></div>' +
      '<ul class="rech-res" role="listbox"></ul></div>';
    document.body.appendChild(fond);
    champ = fond.querySelector('input');
    liste = fond.querySelector('.rech-res');
    fond.addEventListener('click', function (e) { if (e.target === fond) fermer(); });
    fond.querySelector('.rech-champ button').addEventListener('click', fermer);
    var minuteur;
    champ.addEventListener('input', function () { clearTimeout(minuteur); minuteur = setTimeout(afficher, 120); });
    champ.addEventListener('keydown', function (e) {
      var liens = liste.querySelectorAll('a');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!liens.length) return;
        actif = (actif + (e.key === 'ArrowDown' ? 1 : -1) + liens.length) % liens.length;
        liens.forEach(function (a, i) { a.classList.toggle('actif', i === actif); });
        liens[actif].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        var cible = liens[actif > -1 ? actif : 0];
        if (cible) location.href = cible.href;
      }
    });
  }

  function afficher() {
    var q = champ.value.trim();
    actif = -1;
    if (q.length < 2) { liste.innerHTML = '<li class="rech-vide">Tape au moins deux lettres.</li>'; return; }
    if (!index) { liste.innerHTML = '<li class="rech-vide">Chargement…</li>'; charger().then(afficher); return; }
    var res = chercher(q);
    if (!res.length) { liste.innerHTML = '<li class="rech-vide">Aucun résultat pour « ' + esc(q) + ' ».</li>'; return; }
    liste.innerHTML = res.map(function (r) {
      var p = r.p;
      return '<li><a href="' + racine + p.u + '"><span class="rt"><span class="rr' + (p.r === 'Maths' ? ' m' : '') + '">' + esc(p.r) + '</span>' + esc(p.t) + '</span>' +
        (p.e ? '<span class="re">' + esc(p.e) + '</span>' : '') + '<span class="rx">' + extrait(p, q) + '</span></a></li>';
    }).join('');
  }

  function ouvrir() {
    if (!fond) construire();
    fond.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    champ.focus();
    champ.select();
    charger().then(function () { if (champ.value.trim()) afficher(); });
    if (!champ.value.trim()) liste.innerHTML = '<li class="rech-vide">Cherche dans les cours de SNT et de Maths.</li>';
  }
  function fermer() {
    if (!fond) return;
    fond.hidden = true;
    document.documentElement.style.overflow = '';
  }

  function installer() {
    if (document.querySelector('.bouton-recherche')) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bouton-recherche';
    b.innerHTML = '<span aria-hidden="true">🔎</span><span class="txt">Rechercher</span><kbd>/</kbd>';
    b.setAttribute('aria-label', 'Rechercher dans le site');
    b.addEventListener('click', ouvrir);
    var barre = document.querySelector('.topbar-inner');
    if (barre) {
      var theme = barre.querySelector('.bouton-theme');
      if (theme) barre.insertBefore(b, theme); else barre.appendChild(b);
    } else {
      b.classList.add('flottant');
      document.body.appendChild(b);
    }
    document.addEventListener('keydown', function (e) {
      var t = e.target, saisie = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (e.key === '/' && !saisie) { e.preventDefault(); ouvrir(); }
      else if (e.key === 'Escape' && fond && !fond.hidden) fermer();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer);
  else installer();
})();
