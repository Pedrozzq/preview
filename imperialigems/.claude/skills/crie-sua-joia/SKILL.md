---
name: crie-sua-joia
description: Especificação e guia do site da ImperialiGems (joalheria de Topázio Imperial com personalização de joias em 3D). Use sempre que for criar, alterar ou revisar qualquer parte deste site — a área "Crie sua Joia" (pedra, modelo, materiais, 3D, preço, finalização), a prova virtual, inspirações, projetos salvos, a página inicial ou os textos da marca.
---

# ImperialiGems — Crie sua Joia

Toda mudança neste site deve respeitar a especificação abaixo, que é o pedido original do projeto.
Ela vem **exatamente como foi enviada** — não reescreva nem resuma este trecho.

## Especificação original do projeto

### Projeto de Site para Joalheria com Personalização de Joias em 3D

Minha ideia é criar um site para uma joalheria especializada em pedras preciosas, com foco no topázio imperial, oferecendo uma experiência interativa na qual o cliente possa criar e personalizar sua própria joia.

O site teria uma área exclusiva chamada “Crie sua Joia”, na qual o cliente poderia escolher entre diferentes modelos de brincos, anéis e pingentes, utilizando pedras de topázio imperial lapidadas disponíveis no estoque da joalheria.

O processo de personalização seria dividido em etapas intuitivas e visuais:

1. Escolha da pedra: o cliente visualizaria fotos reais das pedras disponíveis, podendo analisar suas cores, formatos, lapidações, dimensões e características individuais. Cada pedra teria um código de identificação, garantindo que o cliente saiba exatamente qual pedra está escolhendo.
2. Escolha do modelo: o cliente selecionaria o tipo de joia que deseja criar, como anel, brinco ou pingente, e poderia explorar diferentes estilos de design.
3. Personalização dos materiais: nessa etapa, seria possível escolher o metal utilizado na fabricação da joia, como ouro ou prata, além de definir o tamanho do anel e outros detalhes de acabamento.
4. Visualização em 3D: depois de realizar as escolhas, o cliente poderia visualizar sua joia em um modelo tridimensional interativo, com a possibilidade de girar, aproximar e observar a peça de diferentes ângulos. O sistema atualizaria a visualização conforme as alterações realizadas.
5. Estimativa de preço: o site calcularia uma estimativa do valor final com base na pedra escolhida, no metal, no peso aproximado e na complexidade da fabricação. O cliente poderia acompanhar como cada escolha influencia o preço.
6. Finalização do projeto: ao concluir a personalização, o cliente poderia salvar sua criação, compartilhar o projeto, solicitar um orçamento ou realizar a compra, conforme as opções oferecidas pela joalheria.

### Algumas ideias extras

* Gravação personalizada: nos modelos compatíveis, o cliente poderia adicionar nomes, iniciais, datas ou pequenas mensagens, tornando a joia ainda mais pessoal.
* Prova virtual: quando tecnicamente viável, o cliente poderia utilizar a câmera do celular para ter uma referência visual de como determinado anel, brinco ou pingente ficaria em uso.
* Coleção de inspirações: uma galeria com joias já produzidas pela marca ajudaria o cliente a encontrar referências e adaptar modelos existentes ao seu gosto.
* Lista de desejos e projetos salvos: o usuário poderia guardar suas combinações favoritas, comparar diferentes versões e retomar a criação posteriormente.
* Atendimento especializado: ao finalizar o projeto, o cliente poderia encaminhar sua joia personalizada para um …

> (O último item chegou cortado na mensagem original; está registrado como recebido.)

### Diferencial do projeto

O principal objetivo seria transformar a compra de uma joia em uma experiência de criação. Em vez de escolher apenas uma peça pronta, o cliente participaria da construção de um produto exclusivo, selecionando pessoalmente a pedra preciosa e os detalhes que compõem a joia.

A proposta combina tecnologia 3D, personalização e a valorização das características únicas de cada topázio imperial, posicionando a joalheria como uma marca inovadora, sofisticada e focada na exclusividade.

O resultado seria um site que funciona não apenas como uma vitrine virtual, mas também como uma ferramenta de criação, atendimento e venda de joias personalizadas.

---

## Onde cada parte está implementada

Site estático (HTML + Tailwind via CDN + JS puro, sem build). Três páginas (`ouro-preto.html`: origem da pedra, galeria da cidade e chamada para atendimento):

- `index.html` — página inicial: abertura (o mesmo cristal 3D da seção 1 surge no centro, a tela se abre como porta-joias e ele voa até o topo), topo, diferencial, joia em destaque, processo, estoque, coleção, galeria em parallax, chamada do Crie sua Joia, como comprar.
- `crie-sua-joia.html` — o ateliê. Os dados ficam no começo do `<script type="module">`:
  - `PEDRAS` — estoque (código, tom, cor, formato, lapidação, medidas `c`/`l`, `ct`, preço). `aprox: true` mostra "≈" (medida estimada pela foto); `ctReal: true` marca peso confirmado. A primeira da lista é a pedra padrão.
  - `MODELOS` — anel (Solitário, Halo, Aro largo, Imperatriz), brinco (Ponto de luz, Gota, Argola), pingente (Clássico, Moldura, Halo), com mão de obra e peso de metal.
  - `METAIS`, `ACABAMENTOS`, `GRAVACAO_PRECO`, `CORRENTE_GRAMAS`, `MARGEM_ESTIMATIVA`.
  - `INSPIRACOES` — coleção de inspirações (uma delas com o vídeo da peça produzida).
  - `WHATSAPP` — número do atendimento (`553171416959`).

| Etapa / ideia da especificação | Implementação |
|---|---|
| 1. Escolha da pedra | Cartões com foto real `img/pedras/<codigo>.webp` + detalhe com código, cor, lapidação, medidas, peso |
| 2. Modelo | `MODELOS` + `montarAnel` / `montarBrinco` / `montarPingente` (three.js) |
| 3. Materiais | Metal, aro (tamanho brasileiro: circunferência = aro + 40 mm), acabamento, gravação, corrente |
| 4. 3D | three.js 0.160 (CDN), `OrbitControls`; a pedra usa a textura real `img/pedras/<codigo>-textura.webp` |
| 5. Preço | `calcularPreco()` — pedra + metal (peso calculado) + fabricação + extras, faixa ±10% |
| 6. Finalização | Salvar (localStorage), compartilhar (link com `#estado`), orçamento/compra pelo WhatsApp |
| Gravação | Campo no passo 3 (só anel) |
| Prova virtual | MediaPipe Tasks Vision 0.10.14 (roda no navegador): mão → anel no dedo anelar com "dedo invisível" escondendo a parte de trás do aro; rosto → brincos no lóbulo; corpo → pingente no colo. Modo manual de reserva. A imagem vai para o detector com margem (`comMargem`) |
| Inspirações | Seção `#inspiracoes`; foto real em `img/inspiracoes/<id>.webp` substitui a miniatura 3D |
| Desejos e projetos salvos | Gaveta "Meus projetos": favoritos, duplicar, comparar até 3, retomar, nova versão |
| Atendimento | Botões de WhatsApp com resumo do projeto; "Quero uma peça" pede o nome antes |

## Regras ao mexer no site

- **Fidelidade à especificação:** nenhuma etapa ou ideia acima pode ser removida; novas funções devem reforçar o diferencial (experiência de criação, exclusividade, valor de cada pedra).
- **Pedras reais:** foto e código sempre correspondem a uma pedra do estoque. Medidas/preços estimados ficam marcados com `aprox: true` até o cliente informar o valor real — nunca apresente estimativa como dado confirmado.
- **Imagens em WebP** (`img/`, `img/pedras/`, `img/midia/`). Vídeos em MP4 curto, com capa (`poster`) em WebP e `preload="none"`.
- **Identidade:** cores tiradas das fotos do estoque próprio — fundo preto quente do couro (`topazio-escuro #16140f`, seções `#24231e`), destaque no laranja-dourado do cristal da seção 1 `#e8862f` (`topazio-pessego`); efeitos de texto, botões e degradês misturam laranja → salmão `#c26c5a` (`topazio`) → rosa-imperial `#bb6d85` (`topazio-rosa`), champanhe `#e4ca82` nos traços dourados e branco-pérola `#f4efec`. Títulos em Bodoni Moda; nome da marca em Cinzel (caixa alta, espaçado), "Imperiali" pérola + "Gems" no laranja-dourado do Topázio Imperial (classe `.gems`, degradê #f8b85e → #e8862f → #c9611f); texto corrido em Montserrat. Logo: medalhão dourado `img/logo-nova-256.webp` (topo/rodapé) e `img/logo-nova.webp` (selo da seção 1), recortados em círculo com fundo transparente a partir de `img/IMPERIALI GEMS LOGO NOVA.png`; versão grande em `img/logo-nova-transparente.png`. Cores de dados (`cor` de cada pedra em `PEDRAS`, cores de `METAIS`) não fazem parte do tema.
- **Contato:** tudo vai para o WhatsApp `553171416959` (não usar o Direct do Instagram para atendimento).
- **Textos em português do Brasil**, tom sofisticado e direto.
- **Teste no navegador** (computador e celular ~375 px) após cada mudança: sem erros no console, sem rolagem lateral no celular, 3D carregando, prova virtual abrindo.
