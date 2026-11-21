/* ===== Bouton mode clair / mode sombre (commun à tout le site) =====
   À charger dans le <head> SANS defer, pour éviter un flash de la mauvaise couleur. */
(function () {
  var CLE = 'theme-site';
  var racine = document.documentElement;

  function lire() { try { return localStorage.getItem(CLE); } catch (e) { return null; } }
  function ecrire(v) { try { localStorage.setItem(CLE, v); } catch (e) {} }

  /* Par défaut : mode sombre. On applique le choix enregistré tout de suite. */
  if (lire() === 'clair') racine.classList.add('theme-clair');

  function installer() {
    if (document.querySelector('.bouton-theme')) return;

    var style = document.createElement('style');
    style.textContent =
      '.bouton-theme{display:inline-flex;align-items:center;gap:.45rem;margin-left:auto;padding:.4rem .85rem;' +
      'border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:inherit;' +
      'font:600 .88rem system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;cursor:pointer;' +
      'transition:background .25s ease,transform .25s ease,border-color .25s ease;}' +
      '.bouton-theme:hover{background:rgba(255,255,255,.16);transform:translateY(-1px);}' +
      '.bouton-theme:focus-visible{outline:3px solid #6ea0ff;outline-offset:2px;}' +
      '.bouton-theme .ico{display:inline-block;transition:transform .5s cubic-bezier(.2,.8,.2,1);}' +
      '.bouton-theme:hover .ico{transform:rotate(25deg) scale(1.1);}' +
      'html.theme-clair .bouton-theme{border-color:rgba(20,30,60,.18);background:rgba(20,30,60,.05);}' +
      'html.theme-clair .bouton-theme:hover{background:rgba(20,30,60,.1);}' +
      '.bouton-theme.flottant{position:fixed;top:1rem;right:1rem;z-index:50;color:#eef2ff;' +
      '-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);}' +
      'html.theme-clair .bouton-theme.flottant{color:#1c2333;background:rgba(255,255,255,.7);}' +
      '@media (max-width:600px){.bouton-theme .txt{display:none;}.bouton-theme{padding:.4rem .6rem;}}' +
      '@media print{.bouton-theme{display:none;}}';
    document.head.appendChild(style);

    var bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'bouton-theme';

    function majTexte() {
      var clair = racine.classList.contains('theme-clair');
      bouton.innerHTML = clair
        ? '<span class="ico" aria-hidden="true">🌙</span><span class="txt">Mode sombre</span>'
        : '<span class="ico" aria-hidden="true">☀️</span><span class="txt">Mode clair</span>';
      bouton.setAttribute('aria-label', clair ? 'Passer en mode sombre' : 'Passer en mode clair');
      bouton.title = bouton.getAttribute('aria-label');
    }

    bouton.addEventListener('click', function () {
      var clair = racine.classList.toggle('theme-clair');
      ecrire(clair ? 'clair' : 'sombre');
      majTexte();
    });
    majTexte();

    var barre = document.querySelector('.topbar-inner');
    if (barre) {
      barre.appendChild(bouton);
    } else {
      bouton.classList.add('flottant');
      document.body.appendChild(bouton);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer);
  else installer();
})();
