/* ===== Fond animé commun (SNT + Maths) ===== */
(function () {
  function demarrer() {
    if (!document.body || document.querySelector('.fond-deco')) return;

    var maths = /\/maths\//.test(location.pathname);
    var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var couleur = maths ? '245,158,11' : '34,211,238';

    /* Couches du décor */
    var deco = document.createElement('div');
    deco.className = 'fond-deco ' + (maths ? 'fond-maths' : 'fond-snt');
    deco.setAttribute('aria-hidden', 'true');
    deco.innerHTML = '<div class="fond-blob b1"></div><div class="fond-blob b2"></div>' +
                     '<div class="fond-blob b3"></div><canvas></canvas>';
    document.body.insertBefore(deco, document.body.firstChild);

    if (calme) return;

    /* Symboles qui montent : techno / IA pour SNT, maths pour Maths */
    var liste = maths
      ? ['π', '∑', '√', 'x²', '∞', '∫', 'Δ', 'f(x)', 'θ', '≠', '÷', 'e', 'n!', '±']
      : ['0', '1', '</>', '{ }', 'IA', '#', 'if', '01', 'AI', '@', 'www', '()', '=>', 'Py'];
    var nb = window.innerWidth < 600 ? 8 : 16;
    for (var k = 0; k < nb; k++) {
      var s = document.createElement('span');
      s.className = 'fond-symbole';
      s.textContent = liste[k % liste.length];
      s.style.left = (Math.random() * 100) + '%';
      s.style.fontSize = (14 + Math.random() * 24) + 'px';
      s.style.animationDuration = (16 + Math.random() * 18) + 's';
      s.style.animationDelay = (-Math.random() * 34) + 's';
      deco.appendChild(s);
    }

    /* Réseau de points connectés */
    var canvas = deco.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var points = [], souris = { x: -999, y: -999 }, L, H;

    function initialiser() {
      var dpr = window.devicePixelRatio || 1;
      L = window.innerWidth; H = window.innerHeight;
      canvas.width = L * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(60, Math.floor(L * H / 22000));
      points = [];
      for (var a = 0; a < n; a++) {
        points.push({ x: Math.random() * L, y: Math.random() * H,
                      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
      }
    }

    function dessiner() {
      ctx.clearRect(0, 0, L, H);
      ctx.lineWidth = 1;
      for (var a = 0; a < points.length; a++) {
        var p = points[a];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > L) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        var dxs = p.x - souris.x, dys = p.y - souris.y, ds = Math.sqrt(dxs * dxs + dys * dys);
        if (ds < 130) {
          ctx.strokeStyle = 'rgba(' + couleur + ',' + (1 - ds / 130) * .35 + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(souris.x, souris.y); ctx.stroke();
        }
        for (var b = a + 1; b < points.length; b++) {
          var q = points[b], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 14000) {
            ctx.strokeStyle = 'rgba(148,163,255,' + (1 - d / 14000) * .13 + ')';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(200,210,255,.45)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(dessiner);
    }

    window.addEventListener('resize', initialiser);
    window.addEventListener('pointermove', function (e) { souris.x = e.clientX; souris.y = e.clientY; });
    document.addEventListener('pointerleave', function () { souris.x = souris.y = -999; });
    initialiser();
    dessiner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer);
  else demarrer();
})();
