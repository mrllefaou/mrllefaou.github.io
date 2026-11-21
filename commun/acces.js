/* ===== Accès au site par mot de passe (commun à tout le site) =====
   À charger dans le <head> SANS defer, avant tout le reste.
   Si l'élève n'a pas encore saisi le mot de passe, il est envoyé vers acces.html,
   puis ramené sur la page demandée. Le navigateur s'en souvient ensuite.
   Attention : c'est un simple écran d'accès, pas une vraie protection
   (le code des pages reste public sur GitHub). */
(function () {
  var CLE = 'acces-site';
  var JETON = 'ok-v1'; /* changer cette valeur oblige tout le monde à ressaisir le mot de passe */

  var ok = false;
  try { ok = localStorage.getItem(CLE) === JETON; }
  catch (e) { ok = true; /* stockage bloqué : on ne bloque pas l'élève dans une boucle */ }
  if (ok) return;

  /* Racine du site, déduite de l'adresse de ce script (…/commun/acces.js) */
  var script = document.currentScript;
  var racine = script ? script.src.replace(/commun\/acces\.js(\?.*)?$/, '') : '/';

  document.documentElement.style.visibility = 'hidden';
  location.replace(racine + 'acces.html?retour=' + encodeURIComponent(location.href));
})();
