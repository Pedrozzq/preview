// WhatsApp da loja que recebe os pedidos: só dígitos com DDI e DDD, ex.: "5531999999999".
// Vazio = o WhatsApp abre com a mensagem pronta e o cliente escolhe o contato.
const WHATSAPP_NUMBER = "";

// Frete: grátis a partir de R$ 35,00; abaixo disso, R$ 9,90
const FREE_SHIPPING_FROM = 35, SHIPPING_FEE = 9.90;
const shippingFee = subtotal => subtotal>0 && subtotal<FREE_SHIPPING_FROM ? SHIPPING_FEE : 0;

// img: foto ilustrativa em img/produtos (ver CREDITOS.txt); sem img, o card usa o ícone
const products = [
  {id:"smoking-deluxe",name:"Seda Smoking Deluxe King Size",category:"Sedas",price:8.90,icon:"",img:"img/produtos/smoking-deluxe.jpg",tag:"MAIS PEDIDO",desc:"Papel ultrafino de queima lenta e uniforme. A preferida da casa."},
  {id:"smoking-gold",name:"Seda Smoking Gold King Size Slim",category:"Sedas",price:7.90,icon:"",img:"img/produtos/smoking-gold.jpg",fit:"contain",tag:"CLÁSSICA",desc:"Formato slim, fino e fácil de enrolar. Livreto com 33 folhas."},
  {id:"raw-classic",name:"Seda RAW Classic",category:"Sedas",price:9.90,icon:"",img:"img/produtos/raw-classic.jpg",pos:"50% 78%",tag:"NATURAL",desc:"Papel sem branqueamento, de fibras naturais. Sabor mais puro."},
  {id:"ocb-slim",name:"Seda OCB Premium Slim",category:"Sedas",price:8.90,icon:"",img:"img/produtos/ocb-slim.jpg",tag:"PREMIUM",desc:"Papel francês fininho, com goma natural de acácia."},
  // Tabacos e cigarros: sem fotos de marca; preços de exemplo, a loja deve ajustar
  {id:"tabaco-25",name:"Tabaco para Enrolar 25g",category:"Tabacos",price:24.90,icon:"",tag:"TABACO",desc:"Tabaco desfiado para enrolar. Consulte as marcas disponíveis."},
  {id:"tabaco-50",name:"Tabaco para Enrolar 50g",category:"Tabacos",price:42.90,icon:"",tag:"TABACO",desc:"Embalagem maior, mais rendimento. Consulte as marcas disponíveis."},
  {id:"tabaco-aroma",name:"Tabaco Aromatizado 25g",category:"Tabacos",price:27.90,icon:"",tag:"TABACO",desc:"Versões aromatizadas. Consulte os sabores disponíveis."},
  {id:"cigarro-maco",name:"Cigarro Maço 20un",category:"Cigarros",price:12.00,icon:"",tag:"CIGARRO",desc:"Maço tradicional. Informe a marca desejada no pedido."},
  {id:"cigarro-box",name:"Cigarro Box 20un",category:"Cigarros",price:13.50,icon:"",tag:"CIGARRO",desc:"Embalagem box. Informe a marca desejada no pedido."},
  {id:"cigarro-palha",name:"Cigarro de Palha",category:"Cigarros",price:15.00,icon:"",tag:"CIGARRO",desc:"Maço de cigarro de palha. Consulte as marcas disponíveis."},
  {id:"clipper-classico",name:"Isqueiro Clipper Clássico",category:"Isqueiros",price:14.90,icon:"",img:"img/produtos/clipper-classico.jpg",tag:"RECARREGÁVEL",desc:"O isqueiro recarregável mais famoso do mundo. Pedra removível."},
  {id:"clipper-estampado",name:"Isqueiro Clipper Estampado",category:"Isqueiros",price:16.90,icon:"",img:"img/produtos/clipper-estampado.jpg",tag:"COLECIONÁVEL",desc:"Clipper com estampas exclusivas. Escolha a sua na entrega."},
  {id:"bic-maxi",name:"Isqueiro BIC Maxi",category:"Isqueiros",price:9.90,icon:"",img:"img/produtos/bic-maxi.jpg",pos:"50% 22%",tag:"ESSENCIAL",desc:"Chama confiável e duradoura, até 3.000 acendimentos."},
  {id:"macarico",name:"Isqueiro Maçarico",category:"Isqueiros",price:29.90,icon:"",img:"img/produtos/macarico.jpg",fit:"cover",tag:"PREMIUM",desc:"Chama azul à prova de vento, recarregável."},
  {id:"bolador",name:"Bolador 78mm",category:"Piteiras & Boladores",price:12.90,icon:"",img:"img/produtos/bolador.jpg",tag:"PRÁTICO",desc:"Enrola por você, rápido e no tamanho certo das sedas king size."},
  {id:"piteira",name:"Piteiras de Papel",category:"Piteiras & Boladores",price:6.90,icon:"",tag:"COMPLEMENTO",desc:"Bloco de piteiras picotadas. Item fácil de adicionar ao pedido."},
  {id:"cinzeiro",name:"Cinzeiro de Vidro",category:"Acessórios",price:19.90,icon:"",img:"img/produtos/cinzeiro.jpg",tag:"CASA",desc:"Vidro grosso e pesado, bonito na mesa. Ótimo para presente."},
  {id:"bandeja",name:"Bandeja Zoo",category:"Acessórios",price:29.90,icon:"",tag:"EXCLUSIVO",desc:"Bandeja de metal com a identidade da Zoo."},
  {id:"case",name:"Case Porta-Acessórios",category:"Acessórios",price:34.90,icon:"",tag:"UPSELL",desc:"Guarda seda, isqueiro e piteiras num lugar só."},
  {id:"kitkat",name:"Chocolate KitKat",category:"Conveniência",price:6.90,icon:"",img:"img/produtos/kitkat.jpg",tag:"IMPULSO",desc:"Conveniência noturna: o complemento de última hora."},
  {id:"refrigerante",name:"Refrigerante Lata",category:"Conveniência",price:7.00,icon:"",tag:"GELADO",desc:"Lata 350 ml bem gelada para completar o pedido."},
  {id:"agua",name:"Água Mineral",category:"Conveniência",price:4.50,icon:"",img:"img/produtos/agua.jpg",tag:"GELADA",desc:"Garrafa 500 ml, sem gás."}
];

// Ícones de linha das categorias (SVG, herdam a cor do texto)
const svgIcon = paths => `<svg class="cat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const ICONS = {
  // livreto de seda com uma folha saindo
  sedas: svgIcon(`<rect x="4" y="9" width="16" height="10" rx="2"/><path d="M4 13h16"/><path d="M7 9V5.8a.8.8 0 0 1 .8-.8h8.4a.8.8 0 0 1 .8.8V9"/><path d="M10 7h4"/>`),
  // chama
  isqueiros: svgIcon(`<path d="M12 3c.6 3-3.5 5-3.5 9.2A3.5 3.5 0 0 0 12 16a3.5 3.5 0 0 0 3.5-3.8c-.2-1.7-1.2-2.6-1.7-3.9-.4 1.2-1 1.8-1.8 2.1C12.8 8 13.3 5.3 12 3Z"/><path d="M6.5 13.5A5.5 5.5 0 0 0 12 21a5.5 5.5 0 0 0 5.5-7.5"/>`),
  // piteira enrolada (cilindro com espiral)
  piteiras: svgIcon(`<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M15 9v6"/><path d="M18 11.2a1.2 1.2 0 1 1 0 1.6"/>`),
  // cinzeiro visto de lado
  acessorios: svgIcon(`<path d="M3 12h18l-1.6 5.2A2.5 2.5 0 0 1 17 19H7a2.5 2.5 0 0 1-2.4-1.8L3 12Z"/><path d="M8 12V10M16 12v-2"/><path d="M11 8.5c0-1.5 2-1.5 2-3"/>`),
  // copo com canudo
  // pacote de tabaco (bolsinha com aba)
  tabacos: svgIcon(`<path d="M5 7h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z"/><path d="M5 7l2-3h10l2 3"/><path d="M9 12c1.5-1.2 4.5-1.2 6 0"/><path d="M9 15.5h6"/>`),
  // cigarro com fumaça
  cigarros: svgIcon(`<rect x="2.5" y="14" width="16" height="4" rx="1"/><path d="M14 14v4"/><path d="M21.5 14v4"/><path d="M17 11c0-1.5 1.5-1.5 1.5-3S17 6.5 17 5"/>`),
  // presente (combo)
  combo: svgIcon(`<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18v-1.5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1V9Z"/><path d="M12 6.5V20"/><path d="M12 6.5C10.5 3.5 7 4 8 6.2M12 6.5C13.5 3.5 17 4 16 6.2"/>`),
  // estrela (mais vendidos)
  best: svgIcon(`<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.5Z"/>`),
  conveniencia: svgIcon(`<path d="M6 8h12l-1.3 11.2a2 2 0 0 1-2 1.8H9.3a2 2 0 0 1-2-1.8L6 8Z"/><path d="M5 8h14"/><path d="M13 8l2-5h3"/><path d="M7.6 13h8.8"/>`)
};
const iconFor = p => (CATEGORY_INFO[p.category]?.icon) || ICONS.combo;
const CATEGORY_INFO = {
  "Sedas":{icon:ICONS.sedas,sub:"Smoking, RAW e OCB — as marcas mais pedidas."},
  "Tabacos":{icon:ICONS.tabacos,sub:"Tabaco para enrolar, natural e aromatizado."},
  "Cigarros":{icon:ICONS.cigarros,sub:"Informe a marca desejada no pedido."},
  "Isqueiros":{icon:ICONS.isqueiros,sub:"Clipper, BIC e maçarico para toda hora."},
  "Piteiras & Boladores":{icon:ICONS.piteiras,short:"Piteiras",sub:"Complementos para o kit ficar completo."},
  "Acessórios":{icon:ICONS.acessorios,sub:"Cinzeiros, bandejas e cases."},
  "Conveniência":{icon:ICONS.conveniencia,short:"Bebidas",sub:"Chocolate, refrigerante e água gelada."}
};

const combo = {id:"combo-zoo",name:"Zoo Night Kit",category:"Combos",price:29.90,icon:"",tag:"COMBO",desc:"Seda + piteira + isqueiro + chocolate."};

let cart = JSON.parse(localStorage.getItem("zoo_cart") || "{}");
let address = JSON.parse(localStorage.getItem("zoo_address") || "null");
let activeCategory = "Todos";

const $ = s => document.querySelector(s);
const money = n => n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

function saveCart(){ localStorage.setItem("zoo_cart",JSON.stringify(cart)); renderCart(); }
function toast(msg){ const t=$("#toast"); t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800); }

function categories(){
  return ["Todos",...new Set(products.map(p=>p.category))];
}
const slug = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function productVisual(p){
  const media=p.img
    ? `<img src="${p.img}" alt="${p.name}" loading="lazy" class="${p.fit==="contain"?"fit-contain":""}"${p.pos?` style="object-position:${p.pos}"`:""}>`
    : `<span class="product-icon product-icon-svg">${iconFor(p)}</span>`;
  return `<div class="product-visual"><span class="product-tag">${p.tag}</span>${media}</div>`;
}
function renderFilters(){
  // chips de navegação: levam até a seção de cada categoria
  $("#filters").innerHTML = categories().filter(c=>c!=="Todos").map(c=>`<a class="filter" href="#cat-${slug(c)}" data-cat="${c}">${CATEGORY_INFO[c]?.icon||""} ${c}</a>`).join("");
}
function productCard(p){
  return `
        <article class="product">
          ${productVisual(p)}
          <div class="product-body">
            <h3>${p.name}</h3><p>${p.desc}</p>
            <div class="product-bottom"><strong>${money(p.price)}</strong><button class="add" data-add="${p.id}" aria-label="Adicionar ${p.name}">+</button></div>
          </div>
        </article>`;
}
// Clicar numa categoria abre os produtos dela logo abaixo dos atalhos (sem rolar a página);
// clicar de novo na mesma categoria fecha o painel.
// "Mais vendidos" (botão abaixo das categorias no celular): ordem de exibição
const BEST_KEY = "__mais-vendidos";
const BEST_SELLERS = ["smoking-deluxe","clipper-classico","raw-classic","bic-maxi","piteira","ocb-slim"];
function setupCategoryPanels(){
  [["#catShortcuts",null],["#catShortcutsMobile",null],["#filters",".section-heading"]].forEach(([sel,anchorSel])=>{
    const nav=$(sel); if(!nav)return;
    const anchor=anchorSel?nav.closest(anchorSel):nav;
    const panel=document.createElement("div");
    panel.className="cat-panel"; panel.setAttribute("aria-live","polite");
    anchor.insertAdjacentElement("afterend",panel);
    nav.addEventListener("click",e=>{
      const link=e.target.closest("[data-cat]"); if(!link)return;
      e.preventDefault();
      const c=link.dataset.cat;
      const isOpen=panel.classList.contains("open")&&panel.dataset.cat===c;
      nav.querySelectorAll("[data-cat]").forEach(a=>a.classList.toggle("active",!isOpen&&a===link));
      if(isOpen){panel.classList.remove("open");panel.dataset.cat="";return;}
      panel.dataset.cat=c;
      const isBest=c===BEST_KEY;
      const title=isBest?"Mais vendidos":c;
      const list=isBest?BEST_SELLERS.map(id=>products.find(p=>p.id===id)).filter(Boolean):products.filter(p=>p.category===c);
      panel.innerHTML=`
        <div class="cat-panel-inner">
          <div class="cat-head">
            <h3><span class="cat-head-icon">${isBest?ICONS.best:(CATEGORY_INFO[c]?.icon||"")}</span>${title}</h3>
            <button class="cat-panel-close" type="button" aria-label="Fechar ${title}"><svg class="x-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
          </div>
          <div class="cat-grid">${list.map(productCard).join("")}</div>
        </div>`;
      panel.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(b.dataset.add));
      panel.querySelector(".cat-panel-close").onclick=()=>{panel.classList.remove("open");panel.dataset.cat="";nav.querySelectorAll("[data-cat]").forEach(a=>a.classList.remove("active"));};
      panel.classList.remove("open"); void panel.offsetWidth; panel.classList.add("open");
    });
  });
}
// Produtos em destaque na vitrine do topo
const HERO_PRODUCTS = ["smoking-deluxe","clipper-estampado","raw-classic","ocb-slim"];
function renderHeroShowcase(){
  const el=$("#heroShowcase"); if(!el)return;
  el.innerHTML=HERO_PRODUCTS.map(id=>products.find(p=>p.id===id)).filter(Boolean).map((p,i)=>`
    <article class="hero-product hp-${i}">
      <a href="#cat-${slug(p.category)}" class="hero-product-media">
        ${p.img?`<img src="${p.img}" alt="${p.name}" class="${p.fit==="contain"?"fit-contain":""}"${p.pos?` style="object-position:${p.pos}"`:""}>`:`<span class="product-icon-svg">${iconFor(p)}</span>`}
      </a>
      <div class="hero-product-info">
        <b>${p.name}</b>
        <div><strong>${money(p.price)}</strong><button class="add" data-add="${p.id}" aria-label="Adicionar ${p.name}">+</button></div>
      </div>
    </article>`).join("");
  el.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(b.dataset.add));
}
function renderShortcuts(){
  const targets=[$("#catShortcuts"),$("#catShortcutsMobile")].filter(Boolean);
  if(!targets.length)return;
  const html=categories().filter(c=>c!=="Todos").map(c=>{
    const n=products.filter(p=>p.category===c).length;
    return `<a class="cat-tile" href="#cat-${slug(c)}" data-cat="${c}">
      <span class="cat-tile-icon">${CATEGORY_INFO[c]?.icon||""}</span>
      <span class="cat-tile-text"><b>${c}</b><i class="cat-tile-short">${CATEGORY_INFO[c]?.short||c}</i><small>${n} ${n===1?"item":"itens"}</small></span>
      
    </a>`;
  }).join("");
  targets.forEach(el=>el.innerHTML=html);
  // no celular, botão "Mais vendidos" logo abaixo das categorias
  const mob=$("#catShortcutsMobile");
  if(mob) mob.insertAdjacentHTML("beforeend",`<button type="button" class="best-btn" data-cat="${BEST_KEY}">
      <span class="best-btn-icon">${ICONS.best}</span><b>Mais vendidos</b><span class="best-btn-arrow"><svg class="ui-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span>
    </button>`);
}
function renderProducts(){
  $("#productGrid").innerHTML=categories().filter(c=>c!=="Todos").map(c=>{
    const list=products.filter(p=>p.category===c);
    return `
    <section class="cat-section" id="cat-${slug(c)}">
      <div class="cat-head">
        <h3><span class="cat-head-icon">${CATEGORY_INFO[c]?.icon||""}</span>${c}</h3>
        <span>${CATEGORY_INFO[c]?.sub||""}</span>
      </div>
      <div class="cat-grid">${list.map(productCard).join("")}
      </div>
    </section>`;
  }).join("");
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addToCart(b.dataset.add));
}
function allProducts(){return [...products,combo]}
function addToCart(id){
  const p=allProducts().find(x=>x.id===id); if(!p)return;
  cart[id]=(cart[id]||0)+1; saveCart(); cartBubble(p);
}
// Balão momentâneo preso ao botão do carrinho: "Produto adicionado"
let bubbleTimer;
function cartBubble(p){
  const b=$("#cartBubble"); if(!b){toast(`${p.name} adicionado`);return;}
  b.innerHTML=`<span class="cb-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg></span>
    <span class="cb-text"><b>Produto adicionado</b><small>${p.name}</small></span>`;
  b.classList.remove("show"); void b.offsetWidth; b.classList.add("show");
  clearTimeout(bubbleTimer); bubbleTimer=setTimeout(()=>b.classList.remove("show"),2400);
}
function changeQty(id,delta){
  cart[id]=(cart[id]||0)+delta;
  if(cart[id]<=0) delete cart[id];
  saveCart();
}
function cartEntries(){
  return Object.entries(cart).map(([id,qty])=>({p:allProducts().find(x=>x.id===id),qty})).filter(x=>x.p);
}
function renderCart(){
  renderOrderMini(); // resumo do formulário sempre igual ao carrinho (frete grátis incluído)
  const entries=cartEntries();
  const count=entries.reduce((a,x)=>a+x.qty,0);
  $("#cartCount").textContent=count;
  $("#openCart").classList.toggle("has-items",count>0); // carrinho pisca em verde enquanto tiver itens
  $("#cartEmpty").style.display=entries.length?"none":"block";
  $("#cartItems").style.display=entries.length?"block":"none";
  $("#cartItems").innerHTML=entries.map(({p,qty})=>`
    <div class="cart-item">
      <div class="cart-icon">${p.img?`<img src="${p.img}" alt="">`:iconFor(p)}</div>
      <div><h4>${p.name}</h4><p>${money(p.price)} cada</p></div>
      <div class="qty"><button data-q="${p.id}" data-d="-1">−</button><b>${qty}</b><button data-q="${p.id}" data-d="1">+</button></div>
    </div>`).join("");
  document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>changeQty(b.dataset.q,Number(b.dataset.d)));
  const subtotal=entries.reduce((a,{p,qty})=>a+p.price*qty,0);
  const fee=shippingFee(subtotal);
  $("#subtotal").textContent=money(subtotal);
  $("#shippingFee").textContent=subtotal===0?"—":fee?money(fee):"Grátis";
  $("#shippingFee").classList.toggle("free",!fee&&subtotal>0);
  $("#cartTotal").textContent=money(subtotal+fee);
  // faixa do topo: quanto falta para o frete grátis
  const missing=FREE_SHIPPING_FROM-subtotal;
  $("#shipBanner").classList.toggle("done",subtotal>=FREE_SHIPPING_FROM);
  $("#shipText").innerHTML=subtotal>=FREE_SHIPPING_FROM
    ? `<b>Frete grátis liberado.</b> Seu pedido atingiu ${money(FREE_SHIPPING_FROM)}.`
    : subtotal>0
      ? `Faltam <b>${money(missing)}</b> para o <b>frete grátis</b>. Frete atual: ${money(SHIPPING_FEE)}`
      : `<b>Frete grátis</b> em pedidos a partir de ${money(FREE_SHIPPING_FROM)}`;
  $("#shipBar").style.width=Math.min(100,subtotal/FREE_SHIPPING_FROM*100)+"%";
}
function openDrawer(){ $("#cartDrawer").classList.add("open"); $("#backdrop").classList.add("show");}
function closeDrawer(){ $("#cartDrawer").classList.remove("open"); if(!document.querySelector(".modal.open"))$("#backdrop").classList.remove("show");}
function openModal(id){
  closeDrawer();
  $("#"+id).classList.add("open");$("#"+id).setAttribute("aria-hidden","false");$("#backdrop").classList.add("show");
}
function closeModal(id){
  $("#"+id).classList.remove("open");$("#"+id).setAttribute("aria-hidden","true");
  if(!$("#cartDrawer").classList.contains("open"))$("#backdrop").classList.remove("show");
}
function fillAddress(){
  if(!address)return;
  const f=$("#addressForm");
  Object.entries(address).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v});
  $("#locationLabel").textContent=address.district?`${address.district} · Ouro Preto`:"Endereço salvo";
}
// CEP: máscara 00000-000 e preenchimento automático (ViaCEP) ao completar 8 dígitos
let lastCEP="";
function maskCEP(){
  const input=$("#addressForm").elements.cep;
  const d=input.value.replace(/\D/g,"").slice(0,8);
  input.value=d.length>5?`${d.slice(0,5)}-${d.slice(5)}`:d;
  if(d.length===8&&d!==lastCEP)autoCEP();
}
async function autoCEP(){
  const f=$("#addressForm"), hint=$("#cepHint");
  const cep=f.elements.cep.value.replace(/\D/g,"");
  if(cep.length!==8)return;
  lastCEP=cep;
  hint.textContent="Buscando endereço…";hint.className="cep-hint";
  try{
    const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d=await r.json();
    if(d.erro){hint.textContent="CEP não encontrado. Preencha o endereço manualmente.";hint.className="cep-hint error";return;}
    if(d.logradouro)f.elements.street.value=d.logradouro;
    if(d.bairro)f.elements.district.value=d.bairro;
    f.elements.city.value=d.localidade||"Ouro Preto";
    hint.textContent=`Endereço encontrado: ${d.localidade}/${d.uf}. Confira e informe o número.`;hint.className="cep-hint ok";
    (d.logradouro?f.elements.number:f.elements.street).focus();
  }catch(e){
    hint.textContent="Não foi possível buscar o CEP agora. Preencha manualmente.";hint.className="cep-hint error";
  }
}
// Resumo curto do pedido dentro do formulário de entrega/pagamento
function renderOrderMini(){
  const el=$("#orderMini"); if(!el)return;
  const entries=cartEntries();
  if(!entries.length){el.innerHTML=`<span>Seu carrinho está vazio. Adicione produtos antes de enviar.</span>`;el.classList.add("empty");return;}
  el.classList.remove("empty");
  const subtotal=entries.reduce((a,{p,qty})=>a+p.price*qty,0), fee=shippingFee(subtotal);
  const n=entries.reduce((a,x)=>a+x.qty,0);
  el.innerHTML=`
    <div class="om-line"><span>${n} ${n===1?"item":"itens"}</span><span>${money(subtotal)}</span></div>
    <div class="om-line"><span>Frete</span>${fee?`<span>${money(fee)}</span>`:`<span class="om-free">Grátis</span>`}</div>
    <div class="om-line om-total"><span>Total</span><strong>${money(subtotal+fee)}</strong></div>`;
}
// Formulário de endereço em dois modos:
//  "save"  = aberto por "Cadastrar endereço": só salva os dados (botão Salvar endereço)
//  "order" = aberto pelo carrinho: já vem preenchido com o endereço salvo, com resumo, pagamento e Enviar pedido
let addressMode="save";
function openAddressForm(mode){
  addressMode=mode;
  const m=$("#addressModal"), f=$("#addressForm"), isOrder=mode==="order";
  m.dataset.mode=mode;
  $("#addressEyebrow").textContent=isOrder?"ENTREGA E PAGAMENTO":"ENTREGA";
  $("#addressTitle").textContent=isOrder?"Finalizar pedido":"Seu endereço";
  $("#addressSubmit").textContent=isOrder?"Enviar pedido":"Salvar endereço";
  f.querySelectorAll('input[name="payment"]').forEach((r,i)=>r.required=isOrder&&i===0);
  fillAddress(); // dados salvos sobem automaticamente
  if(isOrder)renderOrderMini();
  openModal("addressModal");
}
function openCheckoutForm(){ openAddressForm("order"); }
function checkout(){
  const entries=cartEntries();
  if(!entries.length){toast("Adicione produtos ao carrinho");return;}
  openCheckoutForm(); // o formulário de entrega e pagamento finaliza o pedido
}
function orderMessage(){
  const entries=cartEntries();
  const subtotal=entries.reduce((a,{p,qty})=>a+p.price*qty,0);
  const lines=entries.map(({p,qty})=>`• ${qty}x ${p.name} — ${money(p.price*qty)}`).join("\n");
  return `Olá, Zoo Tabacaria! Quero fazer este pedido:\n\n*Itens*\n${lines}\n\n*Subtotal:* ${money(subtotal)}\n*Frete:* ${shippingFee(subtotal)?money(shippingFee(subtotal)):"Grátis"}\n*Total:* ${money(subtotal+shippingFee(subtotal))}\n\n*Entrega*\n*Nome:* ${address.name}\n*CEP:* ${address.cep||"-"}\n*Rua:* ${address.street}, ${address.number}\n*Bairro:* ${address.district}\n*Cidade:* ${address.city}\n*Referência:* ${address.reference||"-"}\n\n*Pagamento:* ${address.payment||"-"}\n\nConfirmem, por favor, a disponibilidade dos itens.`;
}
function sendOrder(){
  if(!address||!cartEntries().length){toast("Carrinho ou endereço incompleto");return;}
  const text=encodeURIComponent(orderMessage());
  const url=WHATSAPP_NUMBER?`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`:`https://wa.me/?text=${text}`;
  window.open(url,"_blank","noopener");
  toast("Abrindo o WhatsApp…");
}

$("#openCart").onclick=openDrawer;
$("#closeCart").onclick=closeDrawer;
$("#openAddress").onclick=()=>openAddressForm("save");
$("#heroAddress").onclick=()=>openAddressForm("save");
$("#deliveryAddress").onclick=()=>openAddressForm("save");
$("#addCombo").onclick=()=>addToCart("combo-zoo");
$("#checkoutBtn").onclick=checkout;
$("#sendOrder").onclick=sendOrder;
$("#backdrop").onclick=()=>{ closeDrawer();document.querySelectorAll(".modal.open").forEach(m=>closeModal(m.id)); };
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
$("#addressForm").elements.cep.addEventListener("input",maskCEP);
$("#addressForm").onsubmit=e=>{
  e.preventDefault();
  address={...(address||{}),...Object.fromEntries(new FormData(e.target).entries())};
  localStorage.setItem("zoo_address",JSON.stringify(address));
  fillAddress();
  if(addressMode==="save"){closeModal("addressModal");toast("Endereço salvo");return;}
  if(!cartEntries().length){closeModal("addressModal");toast("Endereço salvo. Adicione produtos ao carrinho");return;}
  closeModal("addressModal");closeDrawer();
  sendOrder(); // envia o pedido completo (itens, entrega e pagamento) para o WhatsApp
};

if(!localStorage.getItem("zoo_age_ok")) $("#ageGate").classList.add("show");
$("#confirmAge").onclick=()=>{localStorage.setItem("zoo_age_ok","1");$("#ageGate").classList.remove("show");};
$("#leaveSite").onclick=()=>{window.location.href="https://www.google.com";};

// Aberto/fechado: funcionamento das 19h à 01h, sempre no horário de Brasília
const OPEN_FROM = 19*60, OPEN_UNTIL = 1*60; // minutos do dia; fecha à 01h da madrugada
function brasiliaMinutes(){
  const parts=new Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
  const get=t=>Number(parts.find(p=>p.type===t).value);
  return get("hour")*60+get("minute");
}
function updateOpenStatus(){
  const el=$("#openStatus"), txt=$("#openStatusText"); if(!el||!txt)return;
  const m=brasiliaMinutes();
  const open=m>=OPEN_FROM||m<OPEN_UNTIL;
  el.classList.toggle("closed",!open);
  // texto completo no computador, curto no celular (para não encostar no carrinho)
  txt.innerHTML=open
    ? `<span class="os-full">ABERTO AGORA</span><span class="os-short">ABERTO</span>`
    : `<span class="os-full">FECHADO · ABRE ÀS 19H</span><span class="os-short">ABRE ÀS 19H</span>`;
  el.setAttribute("aria-label",open?"Aberto agora":"Fechado, abre às 19h");
}
updateOpenStatus(); setInterval(updateOpenStatus,60000);

renderFilters();renderHeroShowcase();renderShortcuts();renderProducts();setupCategoryPanels();renderCart();fillAddress();
