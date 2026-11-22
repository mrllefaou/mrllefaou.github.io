/* ===== Suivi de progression (SNT) =====
   - Sur une séance : bouton « J'ai terminé cette séance » (on peut le décocher).
   - Sur la page d'un chapitre : coche verte sur les séances terminées + barre d'avancement.
   - Sur la page SNT : avancement de chaque chapitre.
   Tout reste dans le navigateur de l'élève (localStorage), rien n'est envoyé. */
(function () {
  var CLE = 'suivi-snt';
  function lire() { try { return JSON.parse(localStorage.getItem(CLE) || '{}') || {}; } catch (e) { return {}; } }
  function ecrire(v) { try { localStorage.setItem(CLE, JSON.stringify(v)); } catch (e) {} }
  function nom(href) { return (href || '').split('#')[0].split('?')[0].split('/').pop(); }
  var RE_SEANCE = /^([a-z-]+)-seance\d+[a-z]*\.html$/;

  var css =
    '.suivi-seance{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.8rem;margin:2rem 0 1rem;padding:1rem 1.2rem;' +
      'border:1px dashed var(--border,#dde3ef);border-radius:var(--radius,14px);background:var(--surface,#fff);text-align:center;}' +
    '.suivi-seance p{margin:0;color:var(--muted,#5b6478);font-size:.95rem;}' +
    '.suivi-bouton{display:inline-flex;align-items:center;gap:.55rem;padding:.65rem 1.2rem;border-radius:999px;cursor:pointer;' +
      'font:700 1rem system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;border:2px solid var(--ok,#15803d);background:transparent;color:var(--ok,#15803d);' +
      'transition:background .2s ease,color .2s ease,transform .2s ease;}' +
    '.suivi-bouton:hover{transform:translateY(-1px);}' +
    '.suivi-bouton .case{display:inline-grid;place-items:center;width:1.25rem;height:1.25rem;border:2px solid currentColor;border-radius:5px;font-size:.85rem;line-height:1;}' +
    '.suivi-bouton[aria-pressed="true"]{background:var(--ok,#15803d);color:#fff;}' +
    '.suivi-seance.fait{border-style:solid;border-color:var(--ok,#15803d);background:var(--ok-soft,#e6f6ee);}' +
    '.seance-item{position:relative;}' +
    '.seance-item.fait .s-num{background:var(--ok,#15803d) !important;color:#fff !important;}' +
    '.seance-item.fait .s-num::after{content:"✓";position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-weight:800;}' +
    '.seance-item.fait .s-num{position:relative;color:transparent !important;}' +
    '.suivi-chapitre{margin:1rem 0 0;padding:.8rem 1rem;border-radius:var(--radius,14px);background:var(--surface,#fff);border:1px solid var(--border,#dde3ef);}' +
    '.suivi-chapitre .barre{height:.55rem;border-radius:999px;background:var(--primary-soft,#e8efff);overflow:hidden;margin-top:.45rem;}' +
    '.suivi-chapitre .barre span{display:block;height:100%;border-radius:999px;background:var(--ok,#15803d);transition:width .6s ease;}' +
    '.suivi-chapitre p{margin:0;font-weight:600;font-size:.95rem;display:flex;justify-content:space-between;gap:1rem;}' +
    '.suivi-chapitre button{border:0;background:none;color:var(--muted,#5b6478);font:inherit;font-weight:500;font-size:.85rem;cursor:pointer;text-decoration:underline;}' +
    '.ch-suivi{display:inline-flex;align-items:center;gap:.3rem;margin-left:.4rem;padding:.1rem .55rem;border-radius:999px;font-size:.78rem;font-weight:700;' +
      'background:var(--ok-soft,#e6f6ee);color:var(--ok,#15803d);}' +
    '@media print{.suivi-seance,.suivi-chapitre,.ch-suivi{display:none !important;}}';

  function installer() {
    var page = nom(location.pathname) || 'index.html';
    var suivi = lire();
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    /* 1. Page de séance */
    if (RE_SEANCE.test(page) && !/correction/.test(location.pathname)) {
      var main = document.querySelector('main');
      if (!main) return;
      var bloc = document.createElement('div');
      bloc.className = 'suivi-seance';
      bloc.innerHTML = '<button type="button" class="suivi-bouton"><span class="case" aria-hidden="true"></span><span class="txt"></span></button><p></p>';
      var bouton = bloc.querySelector('button');
      function maj() {
        var fait = !!suivi[page];
        bloc.classList.toggle('fait', fait);
        bouton.setAttribute('aria-pressed', fait ? 'true' : 'false');
        bouton.querySelector('.case').textContent = fait ? '✓' : '';
        bouton.querySelector('.txt').textContent = fait ? 'Séance terminée' : 'J’ai terminé cette séance';
        bloc.querySelector('p').textContent = fait
          ? 'Bravo ! Clique à nouveau pour annuler.'
          : 'Coche quand tu as fini : ton avancement s’affiche sur la page du chapitre.';
      }
      bouton.addEventListener('click', function () {
        suivi = lire();
        if (suivi[page]) delete suivi[page]; else suivi[page] = new Date().toISOString().slice(0, 10);
        ecrire(suivi);
        maj();
      });
      maj();
      var pager = main.querySelector('.pager');
      if (pager) main.insertBefore(bloc, pager); else main.appendChild(bloc);
      return;
    }

    /* 2. Page de chapitre : liste de séances */
    var items = Array.prototype.filter.call(document.querySelectorAll('a.seance-item'), function (a) {
      return RE_SEANCE.test(nom(a.getAttribute('href')));
    });
    if (items.length) {
      var faits = 0;
      items.forEach(function (a) {
        var f = !!suivi[nom(a.getAttribute('href'))];
        a.classList.toggle('fait', f);
        if (f) { faits++; a.setAttribute('title', 'Séance terminée'); }
      });
      var liste = items[0].closest('ol, ul');
      var boite = document.createElement('div');
      boite.className = 'suivi-chapitre';
      boite.innerHTML = '<p><span>Mon avancement : ' + faits + ' / ' + items.length + ' séance' + (items.length > 1 ? 's' : '') + ' terminée' + (faits > 1 ? 's' : '') + '</span>' +
        (faits ? '<button type="button">Tout remettre à zéro</button>' : '') + '</p><div class="barre"><span style="width:0"></span></div>';
      liste.parentNode.insertBefore(boite, liste);
      requestAnimationFrame(function () { boite.querySelector('.barre span').style.width = Math.round(100 * faits / items.length) + '%'; });
      var raz = boite.querySelector('button');
      if (raz) raz.addEventListener('click', function () {
        if (!window.confirm('Effacer l’avancement de ce chapitre ?')) return;
        suivi = lire();
        items.forEach(function (a) { delete suivi[nom(a.getAttribute('href'))]; });
        ecrire(suivi);
        location.reload();
      });
      return;
    }

    /* 3. Page SNT : cartes de chapitres */
    document.querySelectorAll('a.chapter-card').forEach(function (carte) {
      var chap = nom(carte.getAttribute('href')).replace(/\.html$/, '');
      var faits = Object.keys(suivi).filter(function (p) { var m = p.match(RE_SEANCE); return m && m[1] === chap; }).length;
      if (!faits) return;
      var statut = carte.querySelector('.ch-foot .status');
      var total = statut && (statut.textContent.match(/(\d+)\s*séance/) || [])[1];
      var pastille = document.createElement('span');
      pastille.className = 'ch-suivi';
      pastille.textContent = '✓ ' + faits + (total ? ' / ' + total : '') + ' terminée' + (faits > 1 ? 's' : '');
      (carte.querySelector('.ch-foot') || carte).appendChild(pastille);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer);
  else installer();
})();
