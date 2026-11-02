/* =====================================================================
   Botânico · nome antes do WhatsApp
   Qualquer botão/link de WhatsApp da página (produtos, menu, rodapé, barra do celular e o
   "enviar pedido" do carrinho) abre primeiro uma janelinha pedindo o nome da pessoa.
   O nome entra no começo da mensagem ("Olá! Meu nome é Ana. …") e só então o WhatsApp abre.
   O nome fica lembrado neste aparelho e já vem preenchido nas próximas vezes.
   ===================================================================== */
(function () {
  var CHAVE = 'botanico_nome';
  var ler = function () { try { return localStorage.getItem(CHAVE) || ''; } catch (e) { return ''; } };
  var gravar = function (n) { try { localStorage.setItem(CHAVE, n); } catch (e) {} };

  var css = document.createElement('style');
  css.textContent =
    '.wn-fundo{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;' +
      'background:rgba(10,32,20,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .25s ease}' +
    '.wn-fundo.on{opacity:1}' +
    '.wn-caixa{width:100%;max-width:380px;background:#f7f3e8;color:#3a2418;border-radius:22px;padding:26px 24px 22px;' +
      'box-shadow:0 30px 60px -20px rgba(0,0,0,.55);transform:translateY(14px) scale(.97);transition:transform .35s cubic-bezier(.2,1.2,.4,1);' +
      'font-family:Poppins,system-ui,sans-serif}' +
    '.wn-fundo.on .wn-caixa{transform:none}' +
    '.wn-icone{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#25d366;color:#fff;font-size:22px;margin-bottom:14px}' +
    '.wn-caixa h2{font-family:"Cormorant Garamond",Georgia,serif;font-size:1.65rem;font-weight:600;line-height:1.1;margin:0 0 6px}' +
    '.wn-caixa p{font-size:.85rem;color:rgba(58,36,24,.7);margin:0 0 16px;line-height:1.45}' +
    '.wn-caixa label{display:block;font-size:.75rem;font-weight:500;letter-spacing:.02em;margin-bottom:6px}' +
    '.wn-caixa input{width:100%;border:1.5px solid rgba(58,36,24,.2);background:#fff;border-radius:12px;padding:12px 14px;' +
      'font:inherit;font-size:1rem;color:#3a2418;outline:none;transition:border-color .2s, box-shadow .2s}' +
    '.wn-caixa input:focus{border-color:#2f6b3f;box-shadow:0 0 0 3px rgba(47,107,63,.18)}' +
    '.wn-erro{min-height:1.1em;font-size:.75rem;color:#b3262e;margin:6px 0 0}' +
    '.wn-botoes{display:flex;gap:10px;margin-top:12px}' +
    '.wn-botoes button{flex:1;border:0;border-radius:999px;padding:12px 14px;font:inherit;font-size:.9rem;font-weight:500;cursor:pointer;transition:background .2s, transform .1s}' +
    '.wn-botoes button:active{transform:scale(.97)}' +
    '.wn-ir{background:#25d366;color:#fff;display:inline-flex;align-items:center;justify-content:center;gap:8px}' +
    '.wn-ir:hover{background:#1fb457}' +
    '.wn-voltar{background:transparent;color:rgba(58,36,24,.7);flex:0 0 auto!important;padding-inline:16px!important}' +
    '.wn-voltar:hover{background:rgba(58,36,24,.07)}';
  document.head.appendChild(css);

  // coloca o nome no começo da mensagem do link (mantém o resto: produto, pedido do carrinho…)
  function comNome(href, nome) {
    var u;
    try { u = new URL(href, location.href); } catch (e) { return href; }
    var txt = u.searchParams.get('text') || '';
    var apres = 'Olá! Meu nome é ' + nome + '.';
    if (!txt.trim()) txt = apres + ' Vim pelo site da Botânico.';
    else if (/^\s*ol[aá]\s*!?/i.test(txt)) txt = txt.replace(/^\s*ol[aá]\s*!?\s*/i, apres + ' ');
    else txt = apres + '\n\n' + txt;
    // monta a URL na mão com encodeURIComponent: espaço vira %20 (o searchParams usaria "+",
    // que alguns WhatsApp mostram literalmente)
    u.searchParams.delete('text');
    var resto = u.searchParams.toString();
    return u.origin + u.pathname + '?' + (resto ? resto + '&' : '') + 'text=' + encodeURIComponent(txt);
  }

  var aberto = null;
  function perguntar(link) {
    if (aberto) return;
    var fundo = document.createElement('div');
    fundo.className = 'wn-fundo';
    fundo.innerHTML =
      '<form class="wn-caixa" role="dialog" aria-modal="true" aria-labelledby="wnTit" novalidate>' +
        '<div class="wn-icone"><i class="fa-brands fa-whatsapp"></i></div>' +
        '<h2 id="wnTit">Antes de continuar…</h2>' +
        '<p>Como podemos te chamar? Seu nome vai junto na mensagem para a gente te atender mais rápido.</p>' +
        '<label for="wnNome">Seu nome</label>' +
        '<input id="wnNome" name="nome" autocomplete="given-name" maxlength="40" placeholder="Ex.: Ana" required>' +
        '<p class="wn-erro" aria-live="polite"></p>' +
        '<div class="wn-botoes"><button type="button" class="wn-voltar">Voltar</button>' +
        '<button type="submit" class="wn-ir"><i class="fa-brands fa-whatsapp"></i> Ir para o WhatsApp</button></div>' +
      '</form>';
    document.body.appendChild(fundo);
    aberto = fundo;
    var form = fundo.querySelector('form'), campo = form.nome, erro = fundo.querySelector('.wn-erro');
    campo.value = ler();
    requestAnimationFrame(function () { fundo.classList.add('on'); campo.focus(); campo.select(); });

    function fechar() {
      fundo.classList.remove('on');
      document.removeEventListener('keydown', esc);
      setTimeout(function () { fundo.remove(); }, 250);
      aberto = null;
      try { link.focus(); } catch (e) {}
    }
    function esc(e) { if (e.key === 'Escape') fechar(); }
    document.addEventListener('keydown', esc);
    fundo.addEventListener('click', function (e) { if (e.target === fundo) fechar(); });
    fundo.querySelector('.wn-voltar').addEventListener('click', fechar);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = campo.value.replace(/\s+/g, ' ').trim();
      if (nome.length < 2) { erro.textContent = 'Digite seu nome para continuar.'; campo.focus(); return; }
      gravar(nome);
      var url = comNome(link.href, nome);
      if (window.gtag) try { gtag('event', 'whatsapp_com_nome', {link_url: link.href}); } catch (er) {}
      fechar();
      // abre no clique do botão (o navegador permite a nova aba)
      if (link.target === '_blank') window.open(url, '_blank', 'noopener'); else location.href = url;
    });
  }

  // intercepta todos os links de WhatsApp, inclusive os criados depois (carrinho)
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href*="wa.me/"], a[href*="api.whatsapp.com"]');
    if (!a) return;
    e.preventDefault();
    perguntar(a);
  }, true);
})();
