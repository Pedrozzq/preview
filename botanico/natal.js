/* =====================================================================
   Botânico · tema de Natal
   Papai Noel espiando pela lateral da tela, no site todo (fica fixo na tela enquanto a pessoa
   rola): primeiro as mãos agarram a borda, depois o rosto surge devagar, ele fala uma frase
   e volta para trás da borda. Uma aparição a cada 11 s, em um ponto sorteado das laterais (de cima
   até o meio e embaixo, nunca perto do carrinho no canto inferior direito), com as 12 frases
   em ordem aleatória (sem repetir até passar por todas). Pausa com a aba em segundo plano.
   Visual no natal.css.
   ===================================================================== */
(function () {
  var FRASES = [
    'Ho ho ho! <b>Feliz Natal</b> no Botânico! 🎄',
    'Psiu… o <b>chocolate quente</b> daqui é o meu favorito! ☕',
    'Já escolheu os <b>bombons da ceia</b>? 🍫',
    'Uma caixa de chocolates é o <b>presente perfeito</b>! 🎁',
    '<b>Gelato</b> no Natal? Aqui pode, ho ho ho! 🍨',
    'Passe na loja e <b>adoce o seu Natal</b>! ✨',
    'Meus duendes adoram os <b>trufados</b> daqui! 🧝',
    'Esse ano eu fui bonzinho… mereço um <b>bombom</b>! 😋',
    'Shhh… estou escolhendo os <b>presentes</b> por aqui! 🤫',
    'Já fez o seu <b>pedido</b> de Natal? 🛍️',
    'Até as renas pararam para um <b>chocolate</b>! 🦌',
    'Natal bom tem <b>cheirinho de cacau</b>! 🍫'
  ];
  // Áreas livres (px): abaixo do menu fixo no topo; embaixo, acima da barra do celular e, no lado
  // direito, bem acima do botão do carrinho (canto inferior direito), para nunca ficar atrás dele.
  var LIVRE = {topo: 92, baixoEsq: 100, baixoDir: 190};
  var CICLO = 11000;                       // uma aparição a cada 11 s

  // Rosto do Papai Noel, olhando para a direita (no lado direito da tela o CSS espelha).
  var SVG =
    '<svg viewBox="0 0 200 220" aria-hidden="true"><defs>' +
      '<radialGradient id="nPele" cx="45%" cy="38%" r="65%"><stop offset="0" stop-color="#fcdcc2"/><stop offset=".65" stop-color="#f1bb98"/><stop offset="1" stop-color="#d9946f"/></radialGradient>' +
      '<radialGradient id="nBochecha" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e8645f" stop-opacity=".6"/><stop offset="1" stop-color="#e8645f" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="nNariz" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#f6b0a0"/><stop offset="1" stop-color="#cf6a58"/></radialGradient>' +
      '<linearGradient id="nBarba" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f1eee9"/><stop offset="1" stop-color="#d9d3ca"/></linearGradient>' +
      '<radialGradient id="nPelo" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ddd7cc"/></radialGradient>' +
      '<linearGradient id="nGorro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2343c"/><stop offset=".6" stop-color="#b3262e"/><stop offset="1" stop-color="#7d1820"/></linearGradient>' +
      '<linearGradient id="nLuva" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c9a5e"/><stop offset="1" stop-color="#22502f"/></linearGradient>' +
    '</defs>' +
    '<g class="noel-cabeca">' +
      // gorro (atrás) caindo para o lado, com dobra sombreada
      '<path d="M58 84C56 44 94 16 138 22c30 4 50 28 50 58 0 12-4 22-10 28-3-14-11-24-22-28z" fill="url(#nGorro)"/>' +
      '<path d="M150 46c14 8 24 22 26 40" stroke="#7d1820" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>' +
      '<g class="noel-pom"><circle cx="179" cy="112" r="13" fill="url(#nPelo)"/><circle cx="173" cy="106" r="5" fill="#fff" opacity=".8"/></g>' +
      // orelhas
      '<ellipse cx="60" cy="124" rx="8" ry="11" fill="url(#nPele)"/><ellipse cx="148" cy="124" rx="8" ry="11" fill="url(#nPele)"/>' +
      // rosto
      '<ellipse cx="104" cy="120" rx="44" ry="46" fill="url(#nPele)"/>' +
      '<ellipse cx="78" cy="133" rx="13" ry="9" fill="url(#nBochecha)"/><ellipse cx="130" cy="133" rx="13" ry="9" fill="url(#nBochecha)"/>' +
      // olhos (com pálpebras para piscar) e ruguinhas de sorriso
      '<ellipse cx="88" cy="114" rx="7" ry="5.6" fill="#fff"/><ellipse cx="120" cy="114" rx="7" ry="5.6" fill="#fff"/>' +
      '<g class="noel-olhos">' +
        '<circle cx="89" cy="114.5" r="3.9" fill="#5b7fb0"/><circle cx="89" cy="114.5" r="2" fill="#1d2430"/><circle cx="90.4" cy="113.1" r="1.1" fill="#fff"/>' +
        '<circle cx="121" cy="114.5" r="3.9" fill="#5b7fb0"/><circle cx="121" cy="114.5" r="2" fill="#1d2430"/><circle cx="122.4" cy="113.1" r="1.1" fill="#fff"/>' +
      '</g>' +
      '<ellipse class="noel-palpebra" cx="88" cy="114" rx="7.6" ry="6.2" fill="#eab091"/><ellipse class="noel-palpebra" cx="120" cy="114" rx="7.6" ry="6.2" fill="#eab091"/>' +
      '<path d="M76 118q-3 3-2 6M132 118q3 3 2 6" stroke="#cf8d6e" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
      // óculos dourados
      '<g fill="rgba(255,255,255,.1)" stroke="#c9a24a" stroke-width="2"><circle cx="88" cy="114" r="10.5"/><circle cx="120" cy="114" r="10.5"/></g>' +
      '<path d="M98.5 112q5.5-4 11 0M77.5 112 63 117M130.5 112 145 117" stroke="#c9a24a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      // sobrancelhas fartas
      '<g class="noel-sobrancelhas" fill="url(#nBarba)">' +
        '<path d="M74 103c4-9 18-12 26-5-4 1-7 3-10 3-5-1-10 0-16 2z"/><path d="M134 103c-4-9-18-12-26-5 4 1 7 3 10 3 5-1 10 0 16 2z"/>' +
      '</g>' +
      // barba com volume e fios
      '<path d="M58 124c-2 46 20 82 46 88 26-6 48-42 46-88-10 18-26 24-46 24s-36-6-46-24z" fill="url(#nBarba)"/>' +
      '<g fill="url(#nBarba)"><circle cx="62" cy="152" r="12"/><circle cx="70" cy="177" r="13"/><circle cx="86" cy="197" r="13"/><circle cx="104" cy="205" r="13"/><circle cx="122" cy="197" r="13"/><circle cx="138" cy="177" r="13"/><circle cx="146" cy="152" r="12"/></g>' +
      '<path d="M76 168c4 8 10 14 16 18M90 176c3 8 8 14 14 18M118 176c-3 8-8 14-14 18M132 168c-4 8-10 14-16 18M68 150c2 8 6 14 10 18M140 150c-2 8-6 14-10 18" stroke="#d6cfc4" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      // boca sorrindo
      '<path d="M94 151q10 10 20 0q-10 4-20 0z" fill="#8a3a32"/><path d="M98 154q6 4 12 0" stroke="#d86b6b" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      // bigode
      '<g fill="url(#nBarba)" stroke="#d9d1c6" stroke-width=".8">' +
        '<path d="M104 138c-8-9-24-9-34 1-4 4-6 11 0 13 8-5 22-5 34-9z"/><path d="M104 138c8-9 24-9 34 1 4 4 6 11 0 13-8-5-22-5-34-9z"/>' +
      '</g>' +
      // nariz
      '<ellipse cx="104" cy="131" rx="10.5" ry="9" fill="url(#nNariz)"/><ellipse cx="100" cy="127" rx="3.4" ry="2.2" fill="#fff" opacity=".65"/>' +
      // aba de pelo do gorro (por cima da testa), com textura
      '<rect x="52" y="74" width="110" height="24" rx="12" fill="url(#nPelo)"/>' +
      '<g fill="#d8d1c5" opacity=".7"><circle cx="66" cy="90" r="3"/><circle cx="84" cy="80" r="2.5"/><circle cx="100" cy="92" r="3"/><circle cx="118" cy="81" r="2.5"/><circle cx="136" cy="91" r="3"/><circle cx="152" cy="82" r="2.5"/></g>' +
    '</g></svg>';

  // luva verde vista de frente segurando a borda: punho de pelo atrás da borda, dedos e polegar por cima
  var MAO =
    '<svg viewBox="0 0 90 64" aria-hidden="true">' +
      '<rect x="0" y="10" width="28" height="44" rx="11" fill="url(#nPelo)"/>' +
      '<path d="M22 14C40 6 70 8 82 22c8 10 6 24-4 30-14 8-40 6-56 0z" fill="url(#nLuva)"/>' +
      '<path d="M42 15c3-12 18-15 23-7 3 5-2 10-9 11" fill="#2a6239"/>' +
      '<path d="M58 30c10 1 18 4 23 8M56 41c10 1 17 3 22 7" stroke="#163a22" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".75"/>' +
      '<ellipse cx="50" cy="24" rx="14" ry="4" fill="#fff" opacity=".18"/>' +
    '</svg>';

  var camada = document.createElement('div');
  camada.className = 'noel-camada';
  var el = document.createElement('div');
  el.className = 'noel tl';
  el.setAttribute('role', 'status');               // leitores de tela leem a frase
  // figura: rosto entre as duas mãos (a de cima perto do gorro, a de baixo perto da barba)
  el.innerHTML = '<div class="noel-fig"><div class="noel-rosto">' + SVG + '</div>' +
    '<div class="noel-mao cima">' + MAO + '</div><div class="noel-mao baixo">' + MAO + '</div></div>' +
    '<div class="noel-balao"></div>';
  camada.appendChild(el);
  document.body.appendChild(camada);
  var balao = el.querySelector('.noel-balao');
  var DIGITANDO = '<span class="noel-dig" aria-hidden="true"><i></i><i></i><i></i></span>';

  var timers = [], rodando = false, sacola = [], ultima = -1, ultimoLugar = null;
  // lugar sorteado: lado (esquerda/direita) e altura na tela. Evita repetir o mesmo lado perto
  // da altura anterior, para ele "pular" pela tela.
  function sortearLugar() {
    var alt = innerHeight, fig = el.querySelector('.noel-fig').offsetHeight || 200, lugar, tent = 0;
    do {
      var lado = Math.random() < .5 ? 'tl' : 'tr';
      var min = LIVRE.topo, max = alt - fig - (lado === 'tr' ? LIVRE.baixoDir : LIVRE.baixoEsq);
      if (max < min) max = min;                       // tela muito baixa: fica logo abaixo do menu
      lugar = {lado: lado, y: Math.round(min + Math.random() * (max - min))};
    } while (ultimoLugar && lugar.lado === ultimoLugar.lado && Math.abs(lugar.y - ultimoLugar.y) < alt * .25 && ++tent < 12);
    return (ultimoLugar = lugar);
  }
  // frases em ordem aleatória: embaralha todas, usa uma por vez e só repete depois de passar por todas
  // (e nunca a mesma duas vezes seguidas)
  function proximaFrase() {
    if (!sacola.length) {
      sacola = FRASES.map(function (_, i) { return i; });
      for (var i = sacola.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = sacola[i]; sacola[i] = sacola[j]; sacola[j] = t; }
      if (sacola[sacola.length - 1] === ultima) sacola.unshift(sacola.pop());
    }
    return (ultima = sacola.pop());
  }
  var limpar = function () { timers.forEach(clearTimeout); timers = []; };
  var depois = function (ms, fn) { timers.push(setTimeout(fn, ms)); };

  // uma aparição: as mãos agarram a borda → o rosto surge devagar → balão "digitando…" → frase →
  // balão some → o rosto recua e por último as mãos soltam a borda (tempos das animações no natal.css)
  function aparicao() {
    var frase = proximaFrase(), lugar = sortearLugar();
    el.className = 'noel ' + lugar.lado;             // lugar novo, ainda escondido atrás da borda
    el.style.top = lugar.y + 'px'; el.style.bottom = 'auto';
    balao.innerHTML = DIGITANDO;
    void el.offsetWidth;
    depois(60,   function () { el.classList.add('on'); });
    depois(1700, function () { el.classList.add('falando'); });
    depois(2300, function () { balao.innerHTML = '<span class="noel-txt">' + FRASES[frase] + '</span>'; });
    depois(7600, function () { el.classList.remove('falando'); });
    depois(7850, function () { el.classList.remove('on'); });
    depois(CICLO, aparicao);
  }
  function iniciar() { if (rodando || document.hidden) return; rodando = true; depois(1500, aparicao); }
  function parar() { rodando = false; limpar(); el.classList.remove('on', 'falando'); }

  document.addEventListener('visibilitychange', function () { document.hidden ? parar() : iniciar(); });
  iniciar();
})();

/* =====================================================================
   Decoração de Natal da seção 1: brilho quente, neve, pisca-pisca no alto e a faixa
   "Feliz Natal" abaixo do logo. Tudo fica atrás do conteúdo e não bloqueia cliques.
   ===================================================================== */
(function () {
  var secao = document.querySelector('#inicio') || document.querySelector('main.leaf-field') || document.querySelector('main');
  if (!secao) return;
  var unidade = secao.id === 'inicio';
  if (!unidade) document.body.classList.add('natal-index');
  if (getComputedStyle(secao).position === 'static') secao.style.position = 'relative';
  var conteudo = secao.querySelector(':scope > .relative') || secao.firstElementChild;
  var celular = matchMedia('(max-width:640px)').matches;
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  // brilho e neve: atrás do conteúdo
  var brilho = document.createElement('div'); brilho.className = 'natal-fx natal-brilho';
  var neve = document.createElement('div'); neve.className = 'natal-fx natal-neve';
  var flocos = '';
  for (var i = 0, n = celular ? 22 : 42; i < n; i++) {
    var s = rnd(2, 6);
    flocos += '<i style="--x:' + rnd(0, 100).toFixed(1) + '%;--s:' + s.toFixed(1) + 'px;--o:' + rnd(.35, .9).toFixed(2) +
      ';--b:' + (s > 4.5 ? 1 : 0) + 'px;--d:' + rnd(9, 18).toFixed(1) + 's;--a:-' + rnd(0, 18).toFixed(1) + 's;--v:' + rnd(-40, 40).toFixed(0) + 'px"></i>';
  }
  neve.innerHTML = flocos;
  secao.insertBefore(brilho, conteudo);
  secao.insertBefore(neve, conteudo);

  // pisca-pisca: curvas penduradas de lado a lado; nas unidades fica logo abaixo do menu fixo
  var luzes = document.createElement('div'); luzes.className = 'natal-luzes';
  luzes.style.setProperty('--luz-top', unidade ? (celular ? '74px' : '82px') : '0px');
  var curvas = celular ? 3 : 6, porCurva = celular ? 6 : 8, H = celular ? 48 : 64, queda = H * .55;
  var d = 'M0 4', cores = ['#e3343c', '#f2c14e', '#4cc26a', '#fff1c9'], b = '', k = 0;
  for (var c = 0; c < curvas; c++) {
    var x0 = c / curvas * 100, x1 = (c + 1) / curvas * 100;
    d += ' Q' + ((x0 + x1) / 2) + ' ' + (4 + queda * 2) + ' ' + x1 + ' 4';
    for (var j = 1; j < porCurva; j++) {
      var t = j / porCurva, y = 4 + queda * 4 * t * (1 - t);   // ponto na curva (parábola)
      var ang = (0.5 - t) * -50;                             // lâmpada acompanha a inclinação do fio
      b += '<b style="left:' + (x0 + (x1 - x0) * t).toFixed(2) + '%;top:' + (y + 1).toFixed(1) + 'px;--c:' + cores[k % 4] +
        ';--r:' + ang.toFixed(0) + 'deg;--a:' + ((k % 4) * .65).toFixed(2) + 's"></b>';
      k++;
    }
  }
  luzes.innerHTML = '<svg viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '"/></svg>' + b;
  secao.insertBefore(luzes, conteudo);

  // faixa "Feliz Natal" com ramos de azevinho, logo abaixo do logo
  var logo = conteudo && conteudo.querySelector('img');
  if (logo) {
    var azevinho = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 18c4-6 10-8 16-6-3 1-4 4-3 6-3-1-6 0-7 3-1-2-3-3-6-3z" fill="#2f6b3f"/>' +
      '<path d="M9 26c2-6 7-9 13-9-2 2-2 4-1 6-3 0-5 2-5 4-2-1-4-1-7-1z" fill="#4c9a5e"/>' +
      '<circle cx="23" cy="15" r="3" fill="#d22f38"/><circle cx="26" cy="19" r="2.6" fill="#b3262e"/><circle cx="21.5" cy="19.5" r="2.3" fill="#e3434b"/></svg>';
    var faixa = document.createElement('p'); faixa.className = 'natal-faixa';
    faixa.innerHTML = azevinho + '<span>Feliz Natal &amp; Boas Festas</span>' + azevinho;
    var alvo = logo.closest('.logo-in') || logo;
    alvo.insertAdjacentElement('afterend', faixa);
  }
})();

/* index: bolas de Natal penduradas no pisca-pisca e ramos de pinheiro com enfeites nos cantos
   (substituem as folhas decorativas) */
(function () {
  if (!document.body.classList.contains('natal-index')) return;
  var main = document.querySelector('main'); if (!main) return;
  var conteudo = main.querySelector(':scope > .relative');

  // bola de Natal: vidro com reflexo, faixa dourada e tampinha
  var bola = function (c1, c2, id) {
    return '<svg viewBox="0 0 60 70" aria-hidden="true"><defs><radialGradient id="' + id + '" cx="35%" cy="35%" r="70%">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></radialGradient></defs>' +
      '<rect x="23" y="2" width="14" height="9" rx="2" fill="#c9a24a"/><path d="M26 2q4-5 8 0" stroke="#c9a24a" stroke-width="2" fill="none"/>' +
      '<circle cx="30" cy="40" r="28" fill="url(#' + id + ')"/>' +
      '<path d="M3 36q27 10 54 0" stroke="#e2c27a" stroke-width="3" fill="none" opacity=".85"/>' +
      '<path d="M5 46q25 9 50 0" stroke="#e2c27a" stroke-width="1.4" fill="none" opacity=".6" stroke-dasharray="2 4"/>' +
      '<ellipse cx="20" cy="28" rx="7" ry="4.5" fill="#fff" opacity=".45" transform="rotate(-30 20 28)"/></svg>';
  };
  var BOLAS = [  // posição (%), fio (px), tamanho (px), cores
    [9, 70, 46, '#ff5a5f', '#8e1a21'], [24, 130, 34, '#f6d77a', '#a9781f'], [76, 120, 38, '#4fc372', '#1d5a31'],
    [91, 60, 50, '#ff5a5f', '#8e1a21'], [38, 40, 26, '#4fc372', '#1d5a31'], [62, 46, 28, '#f6d77a', '#a9781f']
  ];
  var bolas = document.createElement('div'); bolas.className = 'natal-bolas';
  bolas.innerHTML = BOLAS.map(function (b, i) {
    return '<div class="natal-bola" style="left:calc(' + b[0] + '% - ' + b[2] / 2 + 'px);--h:' + b[1] + 'px;--t:' + b[2] + 'px;--d:' + (3.4 + i * .45).toFixed(2) + 's;--a:-' + (i * .7).toFixed(1) + 's">' +
      bola(b[3], b[4], 'nb' + i) + '</div>';
  }).join('');
  main.insertBefore(bolas, conteudo);

  // ramo de pinheiro com bolinhas, pinha e laço
  var agulhas = '';
  for (var i = 0; i < 26; i++) {
    var t = i / 25, x = 10 + t * 250, y = 230 - t * 150;
    agulhas += '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + 'l' + (-30 + (i % 3) * 6) + ' ' + (-34 + (i % 2) * 10) + '" stroke="' + (i % 2 ? '#2f6b3f' : '#1e4a2b') + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M' + x.toFixed(0) + ' ' + y.toFixed(0) + 'l' + (34 - (i % 3) * 6) + ' ' + (16 + (i % 2) * 8) + '" stroke="' + (i % 2 ? '#1e4a2b' : '#3b7d4c') + '" stroke-width="5" stroke-linecap="round"/>';
  }
  var ramo = '<svg viewBox="0 0 300 260" aria-hidden="true">' +
    '<path d="M0 240 Q120 190 270 70" stroke="#4a2f1f" stroke-width="7" fill="none" stroke-linecap="round"/>' + agulhas +
    '<circle cx="120" cy="170" r="16" fill="#d22f38"/><ellipse cx="114" cy="164" rx="5" ry="3" fill="#fff" opacity=".5"/>' +
    '<circle cx="190" cy="135" r="12" fill="#e2c27a"/><ellipse cx="186" cy="131" rx="4" ry="2.4" fill="#fff" opacity=".55"/>' +
    '<circle cx="60" cy="205" r="11" fill="#e2c27a"/>' +
    '<ellipse cx="236" cy="110" rx="12" ry="17" fill="#7a4b2a" transform="rotate(30 236 110)"/>' +
    '<path d="M228 98l14 8M226 108l16 6M228 118l12 4" stroke="#5a341c" stroke-width="2"/>' +
    '<path d="M150 150c-18-14-30-4-22 6 6 6 16 2 22-6zm0 0c18-14 30-4 22 6-6 6-16 2-22-6z" fill="#b3262e"/>' +
    '<path d="M150 150l-10 30M150 150l12 28" stroke="#b3262e" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="150" r="5" fill="#8e1a21"/>' +
    '</svg>';
  ['e', 'd'].forEach(function (lado) {
    var r = document.createElement('div'); r.className = 'natal-ramo ' + lado; r.innerHTML = ramo;
    main.insertBefore(r, conteudo);
  });
})();
