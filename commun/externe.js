/* Contenus extérieurs chargés à la demande (protection des données).
   Un <iframe data-src="https://create.withcode.uk/…"> ne se charge pas tout seul : un bouton le remplace.
   Rien n'est envoyé au service extérieur tant que l'élève n'a pas cliqué.
   Après un premier clic, les éditeurs du site se chargent directement (choix gardé dans ce navigateur,
   clé « externe-withcode ») ; le choix peut être retiré depuis la page Mentions légales. */
(function () {
  var CLE = 'externe-withcode';
  function autorise() { try { return localStorage.getItem(CLE) === '1'; } catch (e) { return false; } }
  function memoriser(oui) { try { if (oui) localStorage.setItem(CLE, '1'); else localStorage.removeItem(CLE); } catch (e) {} }

  function charger(f) {
    if (f.dataset.src && !f.getAttribute('src')) f.setAttribute('src', f.dataset.src);
    f.style.display = '';
    var avant = f.previousElementSibling;
    if (avant && avant.classList.contains('ext-accord')) avant.remove();
  }

  function installer() {
    var cadres = document.querySelectorAll('iframe[data-src]');
    if (!cadres.length) return;
    var st = document.createElement('style');
    st.textContent =
      '.ext-accord{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.55rem;min-height:150px;padding:1rem 1.2rem;text-align:center;background:var(--surface,#f6f7fb)}' +
      '.ext-accord button{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:10px;padding:.6rem 1.1rem;background:var(--primary,#2563eb);color:#fff}' +
      '.ext-accord button:hover{filter:brightness(1.1)}' +
      '.ext-accord small{color:var(--muted,#666);max-width:36rem;line-height:1.45}' +
      '@media print{.ext-accord{display:none !important}}';
    document.head.appendChild(st);
    var ok = autorise();
    cadres.forEach(function (f) {
      if (ok) { charger(f); return; }
      f.style.display = 'none';
      var d = document.createElement('div');
      d.className = 'ext-accord';
      d.innerHTML = '<button type="button">▶ Charger l’éditeur Python</button>' +
        '<small>Cet éditeur est fourni par un service extérieur, <b>create.withcode.uk</b> (Royaume-Uni). ' +
        'En le chargeant, ton navigateur se connecte à ce service, qui reçoit alors ton adresse IP. ' +
        'Ton choix est retenu pour les autres éditeurs du site ; tu peux le retirer dans les mentions légales.</small>';
      d.querySelector('button').addEventListener('click', function () {
        memoriser(true);
        document.querySelectorAll('iframe[data-src]').forEach(charger);
      });
      f.insertAdjacentElement('beforebegin', d);
    });
  }

  window.ContenusExterieurs = { autorise: autorise, retirer: function () { memoriser(false); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installer); else installer();
})();
