/* ===== Tema de Natal — Botânico ===== (veja natal.css para remover) */
(function () {
  const cores = ['#e23b3b', '#e2c27a', '#4c9a5e', '#fff4d6'];
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // áreas escuras: hero das unidades, tela inicial e seções verde-mata
  const escuras = Array.from(document.querySelectorAll('#inicio, body > main.leaf-field, section.bg-mata'));

  escuras.forEach((el, n) => {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

    // varal de luzinhas (catenária simples com lâmpadas penduradas)
    const w = 1000, vaos = 6, luz = document.createElement('div');
    luz.className = 'natal-luzes'; luz.setAttribute('aria-hidden', 'true');
    let d = '', lamps = '';
    for (let i = 0; i < vaos; i++) {
      const x0 = (w / vaos) * i, x1 = (w / vaos) * (i + 1);
      d += (i ? '' : 'M0 6 ') + 'Q' + ((x0 + x1) / 2) + ' 40 ' + x1 + ' 6 ';
      for (let k = 1; k <= 4; k++) {
        const t = k / 5, x = x0 + (x1 - x0) * t, y = 6 + 2 * t * (1 - t) * 34; // ponto na curva
        const c = cores[(i * 4 + k + n) % cores.length];
        lamps += '<span class="lamp" style="left:' + (x / 10) + '%;top:' + (y + 1) + 'px;--c:' + c + ';--d:-' + ((i * 4 + k) * 0.37 % 2.4).toFixed(2) + 's"></span>';
      }
    }
    luz.innerHTML = '<svg class="fio" viewBox="0 0 1000 46" preserveAspectRatio="none"><path d="' + d + '" fill="none" stroke="#2b3a2f" stroke-width="2"/></svg>' + lamps;
    el.appendChild(luz);

    // neve
    if (reduz) return;
    const cv = document.createElement('canvas');
    cv.className = 'natal-neve'; cv.setAttribute('aria-hidden', 'true');
    el.insertBefore(cv, el.firstChild.nextSibling);
    const ctx = cv.getContext('2d');
    let flocos = [], W = 0, H = 0, vivo = false, raf = 0;
    function medir() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = el.clientWidth; H = el.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const qtd = Math.round(Math.min(90, W * H / 14000));
      flocos = Array.from({length: qtd}, () => ({x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 2.2, v: .25 + Math.random() * .7, o: Math.random() * 6.28}));
    }
    function quadro() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      for (const f of flocos) {
        f.y += f.v; f.o += .01; f.x += Math.sin(f.o) * .35;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        ctx.globalAlpha = .35 + f.r / 5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (vivo) raf = requestAnimationFrame(quadro);
    }
    medir(); quadro(); addEventListener('resize', medir);
    new IntersectionObserver(([e]) => {
      vivo = e.isIntersecting; cancelAnimationFrame(raf);
      if (vivo) raf = requestAnimationFrame(quadro);
    }).observe(el);
  });

  // selo "Feliz Natal" logo abaixo da marca, no hero
  const logo = document.querySelector('#inicio img[src$="logo.png"], body > main img[src$="logo.png"]');
  if (logo) {
    const selo = document.createElement('p');
    selo.className = 'natal-selo';
    selo.innerHTML = '<i class="fa-solid fa-star"></i> Feliz Natal <i class="fa-solid fa-star"></i>';
    const wrap = document.createElement('div');
    wrap.style.textAlign = 'center';
    wrap.appendChild(selo);
    logo.insertAdjacentElement('afterend', wrap);
  }

  // faixa de laço entre o hero e o conteúdo das unidades
  const hero = document.getElementById('inicio');
  if (hero) {
    const fx = document.createElement('div');
    fx.className = 'natal-faixa'; fx.setAttribute('aria-hidden', 'true');
    hero.insertAdjacentElement('afterend', fx);
  }
})();
