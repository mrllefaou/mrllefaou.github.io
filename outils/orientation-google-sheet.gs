/* =====================================================================
   Réception des fiches « Orientation 3e » dans un tableur Google Sheets
   (+ un mail à chaque fiche reçue, si on le souhaite)

   MISE EN PLACE (une seule fois, environ 5 minutes) :
   1. Sur drive.google.com : Nouveau > Google Sheets. Nommer le fichier
      par exemple « Fiches orientation 3e ».
   2. Dans ce tableur : menu Extensions > Apps Script.
   3. Effacer le code proposé, coller TOUT ce fichier, puis enregistrer (💾).
   4. (Facultatif) Écrire votre adresse dans EMAIL_PROF ci-dessous pour
      recevoir un mail à chaque fiche envoyée.
   5. Bouton bleu « Déployer » > « Nouveau déploiement » > roue dentée >
      « Application Web ».
        - Exécuter en tant que : Moi
        - Qui a accès : Tout le monde
      Cliquer sur « Déployer », autoriser l'accès à votre compte
      (Google affiche un avertissement « application non validée » :
      Paramètres avancés > Accéder au projet).
   6. Copier l'« URL de l'application Web » (elle finit par /exec) et la
      coller dans orientation/orientation-3e.html, à la ligne :
          var URL_ENVOI = '';
      →   var URL_ENVOI = 'https://script.google.com/macros/s/…/exec';

   RÉCUPÉRER LES FICHES : ouvrir le tableur (onglet « Réponses »).
   Pour un CSV : Fichier > Télécharger > Valeurs séparées par des virgules.

   Si vous modifiez ce script plus tard : Déployer > Gérer les déploiements
   > crayon > Version : « Nouvelle version » (l'URL reste la même).
   ===================================================================== */

var EMAIL_PROF = '';          // ex. 'prenom.nom@ac-rennes.fr' — laisser vide pour ne pas recevoir de mail
var NOM_ONGLET = 'Réponses';

var COLONNES = [
  ['horodatage', 'Date d\'envoi'],
  ['nom', 'Nom'], ['prenom', 'Prénom'], ['classe', 'Classe'], ['prof_principal', 'Professeur principal'],
  ['matieres', 'Matières préférées'], ['points_forts', 'Points forts'], ['loisirs', 'En dehors du collège'],
  ['A_type', 'Plan A – type de lycée'], ['A_filiere', 'Plan A – filière'], ['A_metier', 'Plan A – métier visé'], ['A_lycee', 'Plan A – lycée envisagé'],
  ['B_type', 'Plan B – type de lycée'], ['B_filiere', 'Plan B – filière'], ['B_metier', 'Plan B – métier visé'], ['B_lycee', 'Plan B – lycée envisagé'],
  ['C_type', 'Plan C – type de lycée'], ['C_filiere', 'Plan C – filière'], ['C_metier', 'Plan C – métier visé'], ['C_lycee', 'Plan C – lycée envisagé'],
  ['remarques', 'Remarques, idées, questions']
];

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.site_web) return reponse('ignoré');            // champ piège rempli = robot
  if (!p.nom || !p.prenom) return reponse('incomplet');

  var verrou = LockService.getScriptLock();
  verrou.waitLock(15000);
  try {
    var classeur = SpreadsheetApp.getActiveSpreadsheet();
    var feuille = classeur.getSheetByName(NOM_ONGLET) || classeur.insertSheet(NOM_ONGLET);
    if (feuille.getLastRow() === 0) {
      feuille.appendRow(COLONNES.map(function (c) { return c[1]; }));
      feuille.getRange(1, 1, 1, COLONNES.length).setFontWeight('bold');
      feuille.setFrozenRows(1);
    }
    feuille.appendRow(COLONNES.map(function (c) {
      return c[0] === 'horodatage' ? new Date() : nettoyer(p[c[0]]);
    }));
  } finally {
    verrou.releaseLock();
  }

  if (EMAIL_PROF) {
    var texte = COLONNES.slice(1).map(function (c) { return c[1] + ' : ' + nettoyer(p[c[0]]); }).join('\n');
    MailApp.sendEmail(EMAIL_PROF,
      'Fiche orientation – ' + nettoyer(p.prenom) + ' ' + nettoyer(p.nom) + ' (' + nettoyer(p.classe) + ')',
      texte + '\n\nToutes les fiches : ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
  }
  return reponse('ok');
}

/* Ouvrir l'URL /exec dans un navigateur permet de vérifier que tout est en place. */
function doGet() {
  return reponse('Le formulaire Orientation 3e est bien relié à ce tableur.');
}

/* Limite la longueur et empêche qu'un texte soit interprété comme une formule. */
function nettoyer(v) {
  v = String(v == null ? '' : v).slice(0, 3000);
  return /^[=+\-@]/.test(v) ? '\'' + v : v;
}

function reponse(t) {
  return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT);
}
