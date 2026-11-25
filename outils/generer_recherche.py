"""Génère commun/index-recherche.json, l'index de la barre de recherche du site.
À relancer après l'ajout ou la modification de pages :  python3 outils/generer_recherche.py
"""
import html, json, pathlib, re

RACINE = pathlib.Path(__file__).resolve().parent.parent
EXCLUS = {'acces.html', '404.html', 'mapage.html', 'web-seance1-sans-css.html', 'qcm.html',
          'python-evaluation-conditions-groupe1.html', 'corrections.html'}

def texte(fragment):
    fragment = re.sub(r'<(script|style|svg|math|noscript)\b.*?</\1>', ' ', fragment, flags=re.S | re.I)
    fragment = re.sub(r'<span class="katex-mathml">.*?</span>', ' ', fragment, flags=re.S)
    fragment = re.sub(r'<[^>]+>', ' ', fragment)
    return re.sub(r'\s+', ' ', html.unescape(fragment)).strip()

pages = []
for f in sorted(RACINE.rglob('*.html')):
    rel = f.relative_to(RACINE).as_posix()
    if '.git' in f.parts or f.name in EXCLUS or f.name.startswith('_') or rel.startswith(('snt/corrections/', 'snt/qcm/', 'outils/')):
        continue
    s = f.read_text(encoding='utf-8', errors='ignore')
    titre = texte((re.search(r'<title>(.*?)</title>', s, re.S) or [None, ''])[1])
    titre = re.sub(r'\s*·\s*(SNT|Maths)\s*$', '', titre)
    main = (re.search(r'<main\b.*?</main>', s, re.S) or [s])[0]
    h1 = texte((re.search(r'<h1[^>]*>(.*?)</h1>', main, re.S) or [None, ''])[1])
    eyebrow = texte((re.search(r'<p class="eyebrow">(.*?)</p>', main, re.S) or [None, ''])[1])
    desc = (re.search(r'<meta name="description" content="([^"]*)"', s) or [None, ''])[1]
    meta = texte((re.search(r'<p class="meta">(.*?)</p>', main, re.S) or [None, ''])[1])
    titres = ' · '.join(dict.fromkeys(texte(h) for h in re.findall(r'<h[23][^>]*>(.*?)</h[23]>', main, re.S)))
    corps = texte(main)
    if 'id="lock-form"' in s:  # page chiffrée : seul le titre est indexé
        corps, titres = '', ''
    pages.append({
        'u': rel,
        't': h1 or titre,
        'r': 'Maths' if rel.startswith('maths/') else ('SNT' if rel.startswith('snt/') else ('Orientation' if rel.startswith('orientation/') else 'Accueil')),
        'e': eyebrow,
        'd': html.unescape(desc) or meta,
        'h': titres[:600],
        'x': corps[:2500],
    })

sortie = RACINE / 'commun' / 'index-recherche.json'
sortie.write_text(json.dumps(pages, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(len(pages), 'pages indexées,', round(sortie.stat().st_size / 1024), 'Ko')
