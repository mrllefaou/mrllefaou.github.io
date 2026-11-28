/* ===== Version imprimable (commun à tout le site) =====
   Ajoute un bouton « Imprimer » dans la barre du haut et une mise en page A4 sobre :
   pas de fond animé, de menus ni de boutons ; textes en noir sur blanc ;
   blocs dépliables ouverts ; éditeurs Python remplacés par une mention.
   Pour un PDF : « Imprimer » puis « Enregistrer au format PDF ». */
(function () {
  var css =
    '.bouton-impr{display:inline-flex;align-items:center;gap:.45rem;margin-left:.5rem;padding:.4rem .85rem;border-radius:999px;' +
    'border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:inherit;' +
    'font:600 .88rem system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;cursor:pointer;transition:background .25s ease,transform .25s ease;}' +
    '.bouton-impr:hover{background:rgba(255,255,255,.16);transform:translateY(-1px);}' +
    '.bouton-impr:focus-visible{outline:3px solid #6ea0ff;outline-offset:2px;}' +
    'html.theme-clair .bouton-impr{border-color:rgba(20,30,60,.18);background:rgba(20,30,60,.05);}' +
    'html.theme-clair .bouton-impr:hover{background:rgba(20,30,60,.1);}' +
    '.topbar-inner .bouton-theme + .bouton-impr, .topbar-inner .bouton-impr{margin-left:.5rem;}' +
    '.impr-seulement{display:none;}' +
    '@media (max-width:600px){.bouton-impr .txt{display:none;}.bouton-impr{padding:.4rem .6rem;}}' +
    '@media print{' +
      '@page{size:A4;margin:12mm 13mm;}' +
      'html,body{background:#fff !important;color:#000 !important;}' +
      'body{font-size:10.5pt;line-height:1.4;}' +
      '*,*::before,*::after{animation:none !important;transition:none !important;}' +
      '.topbar,.pager,footer,.fond-deco,.bouton-theme,.bouton-impr,.page-tabs,.ess-actions,.dl-grid,.suivi-seance,.recherche-site{display:none !important;}' +
      'main{max-width:none !important;padding:0 !important;margin:0 !important;}' +
      '.hero{background:none !important;color:#000 !important;border:0 !important;border-bottom:2px solid #000 !important;' +
        'border-radius:0 !important;box-shadow:none !important;padding:0 0 3mm !important;margin:0 0 4mm !important;}' +
      '.hero::after,.hero::before{display:none !important;}' +
      '.hero *{color:#000 !important;opacity:1 !important;}' +
      '.card,.note,.todo,.avis,.seance-item{box-shadow:none !important;background:#fff !important;}' +
      '.card{border:1px solid #999 !important;}' +
      'h1,h2,h3,h4{break-after:avoid;page-break-after:avoid;}' +
      'img,svg,figure,table,pre,.note,.todo,.avis,.video-lien,.q,.qcm-q{break-inside:avoid;page-break-inside:avoid;}' +
      'img{max-width:100% !important;max-height:85mm !important;width:auto !important;object-fit:contain;}' +
      'a{color:#000 !important;}' +
      'iframe{display:none !important;}' +
      '.impr-seulement{display:block !important;border:1px dashed #000;padding:2mm 3mm;margin:2mm 0;font-style:italic;}' +
      '.video-lien{min-height:0 !important;padding:2mm 3mm !important;background:none !important;border:1px dashed #000 !important;}' +
      '.video-play{display:none !important;}' +
    '}';

  function installer() {
    if (document.querySelector('.bouton-impr')) return;
    /* Pages qui ont déjà leur propre mise en page d'impression : on n'ajoute que le bouton */
    var miseEnPagePropre = document.body.classList.contains('carte-page') ||
      document.querySelector('link[href*="essentiel.css"], link[href*="qcm-ens.css"]');
    var style = document.createElement('style');
    style.textContent = miseEnPagePropre ? css.replace(/@media print\{[\s\S]*\}$/, '@media print{.bouton-impr{display:none !important;}}') : css;
    document.head.appendChild(style);

    /* Mention imprimée à la place des éditeurs Python intégrés */
    document.querySelectorAll('iframe').forEach(function (f) {
      var p = document.createElement('p');
      p.className = 'impr-seulement';
      p.textContent = (/withcode/.test(f.src || f.getAttribute('data-src') || '') ? 'Éditeur Python' : 'Contenu interactif') + ' : à utiliser sur la page web.';
      f.insertAdjacentElement('afterend', p);
    });

    var barre = document.querySelector('.topbar-inner');
    if (!barre) return; /* pas de barre : l'impression reste possible avec Ctrl + P */
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bouton-impr';
    b.innerHTML = '<span aria-hidden="true">🖨️</span><span class="txt">Imprimer</span>';
    b.title = 'Imprimer la page ou l’enregistrer en PDF';
    b.setAttribute('aria-label', b.title);
    b.addEventListener('click', function () { window.print(); });
    var theme = barre.querySelector('.bouton-theme');
    if (theme) theme.insertAdjacentElement('afterend', b); else barre.appendChild(b);
  }

  /* Les blocs <details> fermés sont ouverts le temps de l'impression */
  var ouverts = [];
  window.addEventListener('beforeprint', function () {
    ouverts = [];
    document.querySelectorAll('details:not([open])').forEach(function (d) { d.open = true; ouverts.push(d); });
  });
  window.addEventListener('afterprint', function () { ouverts.forEach(function (d) { d.open = false; }); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer);
  else installer();
})();
