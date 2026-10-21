/* ============================================================
   Zoo Tabacaria — Promoção Relâmpago (relampago.html)
   Carregado DEPOIS do script.js: usa os mesmos produtos, carrinho e checkout.
   Durante a janela da promoção os preços dos itens em destaque caem de verdade
   (no card, no carrinho e na mensagem do pedido); fora dela, voltam ao normal.
   Teste fora do horário: relampago.html?preview=1
   ============================================================ */
(function () {
  // ---------- CONFIGURAÇÃO (a loja ajusta aqui) ----------
  // Janela diária no horário de Brasília: das 23h até 00h (meia-noite)
  const PROMO_START_HOUR = 23;
  const PROMO_END_HOUR = 24; // 24 = 00h do dia seguinte
  // Itens da promoção e o desconto de cada um (fração: 0.20 = 20% off).
  // Só acessórios e bebidas: tabaco e cigarros ficam fora (publicidade/venda online de fumígenos é proibida).
  const PROMO_ITEMS = [
    { id: "seda-elements",          off: 0.25 },
    { id: "clipper-caveira",        off: 0.25 },
    { id: "raw-classic",            off: 0.20 },
    { id: "dichavador-bem-bolado",  off: 0.20 },
    { id: "piteira-squadafum",      off: 0.20 },
    { id: "red-bull",               off: 0.15 },
  ];
  const PREVIEW = new URLSearchParams(location.search).has("preview");

  // ---------- horário de Brasília ----------
  function brSeconds() {
    const parts = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const get = (t) => Number(parts.find((p) => p.type === t).value);
    return get("hour") * 3600 + get("minute") * 60 + get("second");
  }
  const START = PROMO_START_HOUR * 3600, END = PROMO_END_HOUR * 3600;
  // estado atual + segundos até a próxima virada
  function promoState() {
    if (PREVIEW) {
      // prévia: simula a promoção no ar com o relógio real até 00h (ou 1h se já passou da meia-noite)
      const s = brSeconds(), left = s < START ? END - START - (s % 3600) : END - s;
      return { live: true, left: Math.max(left, 1), total: END - START };
    }
    const s = brSeconds();
    if (s >= START && s < END) return { live: true, left: END - s, total: END - START };
    return { live: false, left: s < START ? START - s : 86400 - s + START };
  }

  // ---------- preços promocionais ----------
  // arredonda para baixo terminando em ",90" (padrão da loja), nunca acima do desconto pedido
  const promoPrice = (price, off) => Math.max(0.9, Math.floor(price * (1 - off) - 0.9) + 0.9);
  const items = PROMO_ITEMS.map((it) => ({ ...it, p: findP(it.id) })).filter((it) => it.p);
  const originals = Object.fromEntries(items.map(({ p }) => [p.id, { price: p.price, oldPrice: p.oldPrice, tag: p.tag }]));
  items.forEach((it) => { it.promo = Math.round(promoPrice(originals[it.p.id].price, it.off) * 100) / 100; });

  let applied = null;
  function applyPrices(live) {
    if (applied === live) return;
    applied = live;
    items.forEach(({ p, promo }) => {
      const o = originals[p.id];
      if (live) { p.oldPrice = o.price; p.price = promo; p.tag = "⚡ RELÂMPAGO"; }
      else { p.price = o.price; p.oldPrice = o.oldPrice; p.tag = o.tag; }
    });
    // atualiza tudo o que mostra preço: vitrine, painéis abertos e carrinho
    if (typeof renderHeroShowcase === "function") renderHeroShowcase();
    document.querySelectorAll(".cat-shortcuts, #filters").forEach((nav) => {
      const active = nav.querySelector("[data-cat].active");
      if (active) { active.click(); active.click(); } // fecha e reabre com os preços novos
    });
    if (typeof renderCart === "function") renderCart();
    renderCards(live);
  }

  // ---------- seção ----------
  const root = document.getElementById("flashSale");
  const pad = (n) => String(n).padStart(2, "0");
  const fmtSaved = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  function renderCards(live) {
    const grid = document.getElementById("flashGrid"); if (!grid) return;
    grid.innerHTML = items.map(({ p, off, promo }, i) => {
      const o = originals[p.id];
      const img = p.img ? `<img src="${p.img}" alt="${p.name}" loading="lazy">` : `<span class="fs-icon">${iconFor(p)}</span>`;
      const pct = Math.round((1 - promo / o.price) * 100);
      return `<article class="fs-card${live ? " is-live" : ""}" style="--i:${i}">
        <div class="fs-card-border" aria-hidden="true"></div>
        <div class="fs-media">
          <span class="fs-off">-${pct}%</span>
          ${img}
          <span class="fs-shine" aria-hidden="true"></span>
        </div>
        <div class="fs-body">
          <h3>${p.name}</h3>
          <p>${p.desc}</p>
          ${live
            ? `<div class="fs-price"><s>${money(o.price)}</s><strong>${money(promo)}</strong></div>
               <span class="fs-save">Você economiza ${fmtSaved(o.price - promo)}</span>
               <button class="fs-add" type="button" data-add="${p.id}"><span>Garantir agora</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`
            : `<div class="fs-price fs-price-locked"><s>${money(o.price)}</s><strong>R$ ??,??</strong></div>
               <span class="fs-save">Preço revelado às ${PROMO_START_HOUR}h</span>
               <button class="fs-add fs-add-locked" type="button" disabled><span>Abre às ${PROMO_START_HOUR}h</span></button>`}
        </div>
      </article>`;
    }).join("");
    grid.querySelectorAll("[data-add]").forEach((b) => b.onclick = () => {
      addToCart(b.dataset.add);
      b.classList.remove("is-pop"); void b.offsetWidth; b.classList.add("is-pop");
    });
  }

  function tick() {
    const st = promoState();
    applyPrices(st.live);
    root.classList.toggle("is-live", st.live);
    root.classList.toggle("is-soon", !st.live);
    document.body.classList.toggle("flash-live", st.live);

    const h = Math.floor(st.left / 3600), m = Math.floor((st.left % 3600) / 60), s = st.left % 60;
    document.querySelectorAll("[data-fs-h]").forEach((el) => el.textContent = pad(h));
    document.querySelectorAll("[data-fs-m]").forEach((el) => setDigit(el, pad(m)));
    document.querySelectorAll("[data-fs-s]").forEach((el) => setDigit(el, pad(s)));
    document.querySelectorAll("[data-fs-title]").forEach((el) => el.innerHTML = st.live
      ? `A promoção <em>acaba em</em>`
      : `Próxima Promoção Relâmpago <em>começa em</em>`);
    document.querySelectorAll("[data-fs-when]").forEach((el) => el.textContent = st.live
      ? `Hoje até 00h · preços válidos só nesta hora`
      : `Todo dia das ${PROMO_START_HOUR}h às 00h · horário de Brasília`);
    // horas só aparecem quando faltam 1h ou mais
    document.querySelectorAll(".fs-unit-h").forEach((el) => el.hidden = h === 0);

    // barra: quanto da hora de promoção ainda resta
    const bar = document.getElementById("flashBar");
    if (bar) bar.style.transform = `scaleX(${st.live ? Math.max(0, Math.min(1, st.left / st.total)) : 1})`;
    // últimos 10 minutos: alerta mais intenso
    root.classList.toggle("is-final", st.live && st.left <= 600);
    document.body.classList.toggle("flash-final", st.live && st.left <= 600);
  }
  // troca de dígito com "flip" curto
  function setDigit(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove("is-flip"); void el.offsetWidth; el.classList.add("is-flip");
  }

  // barra fixa do celular: leva até as ofertas
  document.querySelectorAll("[data-fs-go]").forEach((b) => b.onclick = () => root.scrollIntoView({ behavior: "smooth", block: "start" }));

  if (!root) return;
  renderCards(false);
  tick();
  setInterval(tick, 1000);
})();
