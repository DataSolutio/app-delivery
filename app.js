/* PedeAÍ · construtor de hamburger, pizza e massa */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const tx = (s, v) => v ? s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)) : s;
  const reais = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function vibrar(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } }

  function dizer(txt, acao, rotulo, app = "pizza") {
    const d = { pizza: $("#dica-pizza"), lanche: $("#dica-lanche"), massa: $("#dica-massa") }[app];
    if (!d) return;
    const k = txt + (acao ? "|" + rotulo : "");
    if (d.dataset.k === k) return;
    d.dataset.k = k;
    d.classList.add("troca-txt");
    clearTimeout(d.dataset.t || 0);
    d.dataset.t = setTimeout(() => {
      d.textContent = tx(txt);
      if (acao) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "dica-acao"; b.textContent = tx(rotulo);
        b.onclick = acao;
        d.appendChild(b);
      }
      d.classList.remove("troca-txt");
    }, 200);
  }
  const IMG_PIZZA = "imagens/pizza/";
  const IMG_HAMBURGER = "imagens/hamburger/";
  const IMG_MASSA = "imagens/massas/";
  /* ---- Cardápio vindo do banco ----
     window.PEDEAI_CARDAPIO é preenchido por cardapio.js (view cardapio_publico) antes deste arquivo rodar.
     Do banco vêm: preço, limite por item e disponibilidade. Nomes, imagens e animações continuam aqui.
     Sem dados do banco (demo, falha de rede), valem os valores deste arquivo.
     Grupo sem nenhuma linha no banco, ou sem nenhum id conhecido, fica intocado.
     Item que falta no banco, ou está inativo, some da tela. */
  const CARD = new Map();
  if (Array.isArray(window.PEDEAI_CARDAPIO)) window.PEDEAI_CARDAPIO.forEach(r => {
    if (!CARD.has(r.grupo)) CARD.set(r.grupo, new Map());
    CARD.get(r.grupo).set(String(r.ref_id), r);
  });
  function precoDe(grupo, id) {
    const m = CARD.get(grupo), r = m && m.get(id), p = r ? Number(r.preco) : NaN;
    return Number.isFinite(p) ? p : null;
  }
  function aplicarLista(lista, grupo, opc) {
    const m = CARD.get(grupo);
    if (!m) return;
    if (!lista.some(it => !it.fixo && m.has(it.id))) { console.warn("Cardápio: grupo sem ids conhecidos, mantido como está:", grupo); return; }
    for (let i = lista.length - 1; i >= 0; i--) {
      const it = lista[i], r = m.get(it.id);
      if (it.fixo) continue;
      if (!r) { lista.splice(i, 1); continue; }
      const p = Number(r.preco);
      if (opc.preco && Number.isFinite(p)) it.preco = p;
      if (opc.max && Number.isInteger(r.max_qtd) && r.max_qtd >= 1) it.max = r.max_qtd;
    }
  }
  const PIZZA = {
    /* sabores = quantos sabores diferentes cabem (a pizza é dividida em fatias iguais: ½, ⅓, ¼) */
    tamanhos: { P: { preco: 34.9, escala: 0.74, sabores: 1 }, M: { preco: 42.9, escala: 0.83, sabores: 2 }, G: { preco: 49.9, escala: 0.92, sabores: 3 }, GG: { preco: 59.9, escala: 1, sabores: 4 } },
    ingredientes: [
      /* cat = aba onde o ingrediente aparece: queijos, carnes, legumes ou extras.
         n = pedaços por porção · tam = tamanho de cada pedaço (fração do diâmetro da pizza) */
      /* Queijos */
      { id: "mucarela", nome: "Muçarela", preco: 5, camada: true, arte: "farelo", cat: "queijos" },
      { id: "catupiry", nome: "Catupiry", preco: 6, molho: true, cat: "queijos" },
      { id: "cheddar", nome: "Cheddar", preco: 6, molho: true, cat: "queijos" },
      { id: "parmesao", nome: "Parmesão", preco: 5, n: 16, tam: 0.11, cat: "queijos" },
      { id: "provolone", nome: "Provolone", preco: 6, n: 12, tam: 0.14, cat: "queijos" },
      { id: "gorgonzola", nome: "Gorgonzola", preco: 7, n: 10, tam: 0.14, cat: "queijos" },
      /* Carnes */
      { id: "calabresa", nome: "Calabresa", preco: 6, n: 10, tam: 0.16, cat: "carnes" },
      { id: "pepperoni", nome: "Pepperoni", preco: 7, n: 10, tam: 0.16, cat: "carnes" },
      { id: "bacon", nome: "Bacon", preco: 6, n: 12, tam: 0.14, cat: "carnes" },
      { id: "presunto", nome: "Presunto", preco: 5, n: 9, tam: 0.16, cat: "carnes" },
      { id: "frango", nome: "Frango desfiado", preco: 6, n: 12, tam: 0.13, cat: "carnes" },
      { id: "lombo", nome: "Lombo", preco: 6, n: 9, tam: 0.17, cat: "carnes" },
      /* Legumes */
      { id: "milho", nome: "Milho", preco: 3, n: 48, tam: 0.04, graos: "grao-milho", v: 8, cat: "legumes" },
      { id: "ervilha", nome: "Ervilha", preco: 3, n: 44, tam: 0.04, graos: "grao-ervilha", v: 8, cat: "legumes" },
      { id: "cogumelo", nome: "Cogumelo", preco: 5, n: 11, tam: 0.145, cat: "legumes" },
      { id: "azeitona", nome: "Azeitona", preco: 3, n: 16, tam: 0.095, cat: "legumes" },
      { id: "pimentao", nome: "Pimentão", preco: 3, n: 9, tam: 0.17, cat: "legumes" },
      { id: "cebola", nome: "Cebola", preco: 2, n: 11, tam: 0.14, cat: "legumes" },
      { id: "tomate", nome: "Tomate", preco: 4, n: 11, tam: 0.155, cat: "legumes" },
      { id: "palmito", nome: "Palmito", preco: 4, n: 12, tam: 0.10, cat: "legumes" },
      /* Extras */
      { id: "ovo", nome: "Ovo cozido", preco: 3, n: 7, tam: 0.17, cat: "extras" },
      { id: "tomateseco", nome: "Tomate seco", preco: 5, n: 10, tam: 0.12, cat: "extras" },
      { id: "manjericao", nome: "Manjericão", preco: 2, n: 9, tam: 0.15, folha: true, cat: "extras" },
      { id: "oregano", nome: "Orégano", preco: 0, n: 14, tam: 0.075, cat: "extras" },
      /* Azeites: o frasco desenha um fio fino em zigue-zague (fio: true) */
      { id: "oleo", nome: "Azeite", preco: 2, molho: true, fio: true, mini: IMG_PIZZA + "t-oleo.webp", cat: "extras" },
      { id: "oleo-oliva", nome: "Azeite de oliva", preco: 3, molho: true, fio: true, mini: IMG_PIZZA + "t-oleo-oliva.webp", cat: "extras" },
    ],
  };
  const MAX_PORCOES = 2;
  const LANCHE = {
    base: 21.9,
    camadas: [
      { id: "pao-base", img: "b-pao-base", h: 0.355, sobe: 0.2, afunda: 0, fixo: true },
      { id: "carne", nome: "Carne", img: "b-carne", h: 0.311, preco: 10, max: 3, sobe: 0.17, afunda: 0.06, ferramenta: "espatula" },
      { id: "cheddar", nome: "Cheddar", img: "b-cheddar", h: 0.369, preco: 4, max: 3, sobe: 0.035, afunda: 0.31, ferramenta: "mao" },
      { id: "prato", nome: "Prato", img: "b-prato", h: 0.506, preco: 4, max: 2, sobe: 0.04, afunda: 0.42, ferramenta: "mao" },
      { id: "frango", nome: "Frango", img: "b-frango", h: 0.334, preco: 9, max: 2, sobe: 0.15, afunda: 0.07, ferramenta: "espatula" },
      { id: "bacon", nome: "Bacon", img: "b-bacon-tira", h: 0.217, preco: 6, max: 2, sobe: 0.06, afunda: 0.13, ferramenta: "mao" },
      { id: "ovo", nome: "Ovo", img: "b-ovo", h: 0.336, preco: 3, max: 2, sobe: 0.06, afunda: 0.2, ferramenta: "espatula" },
      { id: "caramelizada", nome: "Caramelizada", img: "b-caramelizada", h: 0.325, preco: 4, max: 1, sobe: 0.06, afunda: 0.2, ferramenta: "espatula" },
      { id: "aneis", nome: "Onion rings", img: "b-aneis", h: 0.328, preco: 5, max: 1, sobe: 0.09, afunda: 0.17, ferramenta: "espatula" },
      { id: "cebola-roxa", nome: "Cebola roxa", img: "b-cebola-roxa", h: 0.222, preco: 2, max: 1, sobe: 0.06, afunda: 0.15, ferramenta: "mao" },
      { id: "picles", nome: "Picles", img: "b-picles", h: 0.164, preco: 2, max: 2, sobe: 0.045, afunda: 0.1, ferramenta: "mao" },
      { id: "jalapeno", nome: "Jalapeño", img: "b-jalapeno", h: 0.225, preco: 3, max: 2, sobe: 0.045, afunda: 0.15, ferramenta: "mao" },
      { id: "tomate-fatia", nome: "Tomate", img: "b-tomate-fatia", h: 0.242, preco: 3, max: 2, sobe: 0.07, afunda: 0.15, ferramenta: "mao" },
      { id: "alface", nome: "Alface", img: "b-alface", h: 0.281, preco: 2, max: 2, sobe: 0.08, afunda: 0.18, ferramenta: "mao" },
      { id: "molho", nome: "Molho da casa", img: "b-molho", h: 0.359, preco: 3, max: 1, sobe: 0.035, afunda: 0.3, ferramenta: "bisnaga", molho: true },
      { id: "barbecue", nome: "Barbecue", img: "b-barbecue", h: 0.352, preco: 3, max: 1, sobe: 0.035, afunda: 0.3, ferramenta: "bisnaga", molho: true },
      { id: "mostarda", nome: "Mostarda mel", img: "b-mostarda", h: 0.386, preco: 3, max: 1, sobe: 0.035, afunda: 0.32, ferramenta: "bisnaga", molho: true },
      { id: "verde", nome: "Maionese", img: "b-verde", h: 0.356, preco: 3, max: 1, sobe: 0.035, afunda: 0.3, ferramenta: "bisnaga", molho: true },
      { id: "sriracha", nome: "Sriracha", img: "b-sriracha", h: 0.353, preco: 3, max: 1, sobe: 0.035, afunda: 0.3, ferramenta: "bisnaga", molho: true },
      { id: "pao-topo", img: "b-pao-brioche-topo", h: 0.473, sobe: 0, afunda: 0.14, fixo: true },
    ],
  };
  const PAES = [
    { id: "brioche", nome: "Brioche", preco: 0, base: "b-pao-base", hb: 0.355, topo: "b-pao-brioche-topo", ht: 0.473 },
    { id: "australiano", nome: "Australiano", preco: 2, base: "b-pao-base", hb: 0.355, topo: "b-pao-australiano-topo", ht: 0.53 },
    { id: "batata", nome: "Batata", preco: 2, base: "b-pao-base", hb: 0.355, topo: "b-pao-batata-topo", ht: 0.537 },
    { id: "parmesao", nome: "Parmesão", preco: 3, base: "b-pao-base", hb: 0.355, topo: "b-pao-parmesao-topo", ht: 0.494 },
  ];
  /* Tamanhos: preço e quantidade de sabores (max_qtd) vêm do banco; tamanho que não está no banco some */
  {
    const mt = CARD.get("pizza.tamanho");
    Object.keys(PIZZA.tamanhos).forEach(k => {
      if (mt && !mt.has(k) && Object.keys(PIZZA.tamanhos).length > 1) { delete PIZZA.tamanhos[k]; return; }
      const p = precoDe("pizza.tamanho", k); if (p != null) PIZZA.tamanhos[k].preco = p;
      const r = mt && mt.get(k);
      if (r && Number.isInteger(r.max_qtd) && r.max_qtd >= 1) PIZZA.tamanhos[k].sabores = Math.min(4, r.max_qtd);
    });
  }
  aplicarLista(PIZZA.ingredientes, "pizza.ingrediente", { preco: true });
  /* ---- Sabores prontos ----
     ings = ingredientes que já vêm no sabor (id: porções) · opc = sugestões de acréscimo.
     Um sabor só aparece se TODOS os seus ingredientes estiverem no cardápio. */
  const SABORES = [
    { id: "calabresa", nome: "Calabresa", ings: { mucarela: 1, calabresa: 1, cebola: 1, azeitona: 1, oregano: 1 }, opc: [] },
    { id: "portuguesa", nome: "Portuguesa", ings: { mucarela: 1, presunto: 1, ovo: 1, cebola: 1, azeitona: 1, oregano: 1, "oleo-oliva": 1 }, opc: ["ervilha", "milho", "palmito", "pimentao", "bacon"] },
    { id: "mucarela", nome: "Muçarela", ings: { mucarela: 1, oregano: 1 }, opc: [] },
    { id: "marguerita", nome: "Marguerita", ings: { mucarela: 1, manjericao: 1, oregano: 1 }, opc: [] },
    { id: "frango-catupiry", nome: "Frango c/ Catupiry", ings: { frango: 1, catupiry: 1 }, opc: [] },
    { id: "napolitana", nome: "Napolitana", ings: { mucarela: 1, tomate: 1, parmesao: 1, oregano: 1 }, opc: [] },
    { id: "quatro-queijos", nome: "Quatro Queijos", ings: { mucarela: 1, catupiry: 1, provolone: 1, gorgonzola: 1 }, opc: ["parmesao", "cheddar"] },
    { id: "pepperoni", nome: "Pepperoni", ings: { mucarela: 1, pepperoni: 1 }, opc: ["azeitona", "tomateseco", "oregano"] },
    { id: "bacon", nome: "Bacon", ings: { mucarela: 1, bacon: 1 }, opc: ["azeitona", "tomateseco", "oregano"] },
  ].filter(sb => Object.keys(sb.ings).every(id => PIZZA.ingredientes.some(i => i.id === id)));
  SABORES.forEach(sb => { sb.opc = sb.opc.filter(id => PIZZA.ingredientes.some(i => i.id === id)); });

  /* ---- Borda recheada ----
     cor/brilho/sombra = como o recheio é desenhado em volta da pizza. O preço vem do banco (grupo pizza.borda).
     BORDA_MAX = quantos sabores de borda cada tamanho aceita (cada sabor ocupa uma metade da borda).
     BORDA_GEO = onde o anel é desenhado (r = raio do centro da borda, w = espessura; 1 = beira da imagem). */
  const BORDAS = [
    { id: "cheddar", nome: "Cheddar", preco: 8, cor: "#f0a23a", brilho: "#ffd88a", sombra: "rgba(140,70,10,.35)" },
    { id: "catupiry", nome: "Catupiry", preco: 8, cor: "#f7f3ea", brilho: "#ffffff", sombra: "rgba(80,60,40,.30)" },
    { id: "chocolate-preto", nome: "Chocolate preto", preco: 10, cor: "#4a2a1c", brilho: "#9a6a50", sombra: "rgba(0,0,0,.40)" },
    { id: "chocolate-branco", nome: "Chocolate branco", preco: 10, cor: "#f1e2b8", brilho: "#fff8e0", sombra: "rgba(90,70,30,.30)" },
  ];
  aplicarLista(BORDAS, "pizza.borda", { preco: true });
  if (CARD.size && !CARD.has("pizza.borda")) BORDAS.length = 0;   /* banco carregado sem bordas: recurso escondido */
  const BORDA_MAX = { P: 1, M: 1, G: 2, GG: 2 };
  const bordaMax = tam => BORDA_MAX[tam] || 1;
  const BORDA_GEO = { r: 0.915, w: 0.085 };
  { const p = precoDe("lanche.base", "base"); if (p != null) LANCHE.base = p; }
  aplicarLista(LANCHE.camadas, "lanche.ingrediente", { preco: true, max: true });
  aplicarLista(PAES, "lanche.pao", { preco: true });
  const FERRAMENTAS = {
    "espatula": { ax: 0.3032, ay: 0.6009, h: 0.3435, k: 1.572 },
    "mao": { ax: 0.2189, ay: 0.9662, h: 1.0442, k: 0.85 },
    "bisnaga": { ax: 0.0056, ay: 0.981, h: 1.1798, k: 1.0 },
  };
  const estado = {
    tam: "G", porcoes: Object.fromEntries(PIZZA.ingredientes.map(i => [i.id, 0])),
    pecas: [], lanche: new Map(), pao: "brioche", chapa: null, forno: null, pedido: 127,
    massaMolho: "bolonhesa", massaRecipiente: "pote", massaPorcoes: {},
  };
  if (!PAES.some(p => p.id === estado.pao) && PAES.length) estado.pao = PAES[0].id; /* pão padrão indisponível */
  /* Vários sabores: k fatias iguais. Cada fatia tem seu sabor e suas porções;
     estado.porcoes sempre aponta para as porções da fatia ativa (setorAtivo). */
  estado.k = 1; estado.setorAtivo = 0; estado.ocupado = false;
  estado.setores = [{ sabor: null, porcoes: estado.porcoes }];
  estado.borda = { n: 1, lados: [null, null], ativa: 0 };   /* borda recheada: n sabores, cada um numa metade */
  if (!PIZZA.tamanhos[estado.tam]) estado.tam = Object.keys(PIZZA.tamanhos).slice(-1)[0];
  const pizzaEl = $("#pizza"), giroEl = $("#pizzaGiro"), cobertura = $("#cobertura");
  const dicas = { pizza: $("#dica-pizza"), lanche: $("#dica-lanche"), massa: $("#dica-massa") };
  const dicaT = {};
  const UI = {};
  ["pizza", "lanche", "massa"].forEach(k => {
    UI[k] = {
      pedir: $("#pedir-" + k), preco: $("#preco-" + k), texto: $("#pedirTexto-" + k), barra: $("#barra-" + k),
      comanda: $("#comanda-" + k), num: $("#comandaNum-" + k), itens: $("#comandaItens-" + k),
      mostrado: null, raf: 0, fecha: 0,
    };
  });
  function total(app) {
    /* Vários sabores: cobra-se o tamanho + o sabor mais caro (a mesma regra vale no servidor) */
    if (app === "pizza") return PIZZA.tamanhos[estado.tam].preco + Math.max(...estado.setores.map(st => PIZZA.ingredientes.reduce((s, i) => s + (st.porcoes[i.id] || 0) * i.preco, 0))) + precoBordaIds(bordaIds());
    if (app === "massa") return MASSA.base + MASSA.ingredientes.reduce((s, i) => s + (estado.massaPorcoes[i.id] || 0) * i.preco, 0) + FINALIZACOES.reduce((s, i) => s + (estado.massaPorcoes[i.id] || 0) * i.preco, 0);
    return LANCHE.base + PAES.find(p => p.id === estado.pao).preco + LANCHE.camadas.filter(c => !c.fixo).reduce((s, c) => s + (estado.lanche.get(c.id) || 0) * c.preco, 0);
  }
  function precificar(app, delta) {
    if (app === "massa") setTimeout(function () { if (window.__atualizarSel) window.__atualizarSel(); }, 0);
    const ui = UI[app], precoEl = ui.preco;
    const alvo = total(app);
    const de = ui.mostrado == null ? alvo : ui.mostrado;
    cancelAnimationFrame(ui.raf);
    if (calmo || Math.abs(de - alvo) < 0.005) { ui.mostrado = alvo; precoEl.textContent = reais(alvo); }
    else {
      const t0 = performance.now();
      const passo = () => {
        const e = Math.min(1, (performance.now() - t0) / 420);
        ui.mostrado = de + (alvo - de) * (1 - Math.pow(1 - e, 3));
        precoEl.textContent = reais(Math.round(ui.mostrado * 100) / 100);
        if (e < 1) ui.raf = requestAnimationFrame(passo); else ui.mostrado = alvo;
      };
      ui.raf = requestAnimationFrame(passo);
      precoEl.animate([{ transform: "translateY(0)" }, { transform: "translateY(-4px)" }, { transform: "translateY(0)" }], { duration: 320, easing: "ease-out" });
    }
    if (delta && Math.abs(delta) > 0.001 && !calmo) {
      const botao = precoEl.parentElement;
      $$(".delta", botao).forEach(x => x.remove());
      const d = document.createElement("span");
      d.className = "delta";
      d.textContent = (delta > 0 ? "+" : "−") + reais(Math.abs(delta));
      d.style.right = (botao.clientWidth - precoEl.offsetLeft + 6) + "px";
      botao.appendChild(d);
      d.animate([
        { transform: "translateY(-10%)", opacity: 0 },
        { transform: "translateY(-50%)", opacity: 1, offset: 0.2 },
        { transform: "translateY(-50%)", opacity: 1, offset: 0.72 },
        { transform: "translateY(-120%)", opacity: 0 },
      ], { duration: 1150, easing: "ease-out" }).onfinish = () => d.remove();
    }
  }
  function linhaDoPedido(app) {
    if (app === "pizza") {
      if (estado.k > 1) return descricaoMulti() + textoBorda();
      const it = PIZZA.ingredientes.filter(i => estado.porcoes[i.id]).map(i => i.nome.toLowerCase() + (estado.porcoes[i.id] > 1 ? " ×2" : ""));
      const sabor = rotuloSabor();
      return `Pizza ${estado.tam}${sabor ? " · " + sabor : ""}: ${it.length ? it.join(", ") : "só molho"}` + textoBorda();
    }
    if (app === "massa") {
      const it = MASSA.ingredientes.filter(i => (estado.massaPorcoes[i.id] || 0) > 0).map(i => i.nome.toLowerCase() + ((estado.massaPorcoes[i.id] || 0) > 1 ? " ×" + (estado.massaPorcoes[i.id] || 0) : ""));
      const molhoNome = estado.massaMolho ? (MOLHOS_MASSA.find(function (m) { return m.id === estado.massaMolho; }) || {}).nome || estado.massaMolho : null;
      const tipoNome = estado.massaRecipiente ? (TIPOS_MASSA.find(function (t) { return t.id === estado.massaRecipiente; }) || {}).nome || estado.massaRecipiente : null;
      var linha = tipoNome ? tipoNome : "Massa";
      if (molhoNome) linha += " ao " + molhoNome.toLowerCase();
      if (it.length) linha += ": " + it.join(", ");
      return linha;
    }
    const it = LANCHE.camadas.filter(c => !c.fixo && estado.lanche.get(c.id)).map(c => c.nome.toLowerCase() + (estado.lanche.get(c.id) > 1 ? " ×" + estado.lanche.get(c.id) : ""));
    return `Lanche no ${PAES.find(p => p.id === estado.pao).nome.toLowerCase()}: ${it.length ? it.join(", ") : "só o pão"}`;
  }
  function entregar(app) {
    const ui = UI[app];
    estado.pedido++;
    ui.num.textContent = "Pedido #" + String(estado.pedido).padStart(4, "0");
    ui.itens.textContent = linhaDoPedido(app);
    /* Abre o modal de checkout em vez de mostrar apenas a comanda */
    const subtotal = total(app);
    abrirCheckout(app, subtotal);
  }
  function soltarPedido(app) {
    const ui = UI[app];
    if (!ui.pedir.classList.contains("ok")) return;
    ui.pedir.classList.remove("ok");
    if (app === "massa") {
      var _t = ["", "Próximo: molho →", "Próximo: massa →", "Próximo: finalizar →", "Adicionar ao pedido"];
      ui.texto.textContent = _t[massaEtapa] || "Próximo: molho →";
    } else {
      ui.texto.innerHTML = `${tx("Adicionar")}<span class="so-largo"> ${tx("ao pedido")}</span>`;
    }
  }
  const MASSA = {
    base: 29.0,
    ingredientes: [
      /* Carnes */
      { id: "bacon", nome: "Bacon", preco: 4, cat: "carnes", arte: "bacon", pasta: "massas", max: 2, muitos: true },
      { id: "calabresa", nome: "Calabresa", preco: 4, cat: "carnes", arte: "calabresa", pasta: "massas", max: 2, muitos: true },
      { id: "presunto", nome: "Presunto", preco: 3, cat: "carnes", arte: "presunto", pasta: "massas", max: 2, muitos: true },
      { id: "salsicha", nome: "Salsicha", preco: 3, cat: "carnes", arte: "salsicha", pasta: "massas", max: 2, muitos: true },
      { id: "frango", nome: "Frango", preco: 4, cat: "carnes", arte: "frango", pasta: "massas", max: 2, muitos: true },
      { id: "lombo", nome: "Lombo defumado", preco: 6, cat: "carnes", arte: "lombo", pasta: "massas", max: 2, muitos: true },
      { id: "costela", nome: "Costela desfiada", preco: 7, cat: "carnes", arte: "costela", pasta: "massas", max: 2, muitos: true },
      /* Legumes */
      { id: "pimentoes", nome: "Pimentões", preco: 2, cat: "legumes", arte: "pimentao", pasta: "pizza", max: 2 },
      { id: "brocolis", nome: "Brócolis", preco: 3, cat: "legumes", arte: "brocolis", pasta: "massas", max: 2 },
      { id: "tomate", nome: "Tomate", preco: 2, cat: "legumes", arte: "tomate", pasta: "pizza", max: 2 },
      { id: "champignon", nome: "Champignon", preco: 3, cat: "legumes", arte: "cogumelo", pasta: "pizza", max: 2 },
      { id: "ervilha", nome: "Ervilha", preco: 2, cat: "legumes", arte: "grao-ervilha", pasta: "massas", max: 2, graos: true, tamPx: 8 },
      { id: "milho", nome: "Milho", preco: 2, cat: "legumes", arte: "grao-milho", pasta: "massas", max: 2, graos: true, tamPx: 8 },
      { id: "azeitona", nome: "Azeitona", preco: 2, cat: "legumes", arte: "azeitona", pasta: "pizza", max: 2 },
      { id: "palmito", nome: "Palmito", preco: 3, cat: "legumes", arte: "palmito", pasta: "massas", max: 2 },
      { id: "passas", nome: "Uvas passas", preco: 2, cat: "legumes", arte: "passas", pasta: "massas", max: 2 },
      { id: "tomateseco", nome: "Tomate seco", preco: 5, cat: "legumes", arte: "tomateseco", pasta: "massas", max: 2 },
      /* Queijos */
      { id: "queijo", nome: "Muçarela", preco: 4, cat: "queijos", img: "queijo.webp", pasta: "massas", max: 2 },
      { id: "catupiry", nome: "Catupiry", preco: 5, cat: "queijos", arte: "catupiry", pasta: "pizza", max: 2 },
      { id: "cheddar", nome: "Cheddar", preco: 5, cat: "queijos", arte: "cheddar", pasta: "pizza", max: 2 },
      /* Temperos */
      { id: "alho", nome: "Alho", preco: 0, cat: "temperos", arte: "alho", pasta: "massas", max: 2 },
      { id: "cebola", nome: "Cebola", preco: 0, cat: "temperos", arte: "cebolapicada", pasta: "massas", max: 2 },
      { id: "pimentacheiro", nome: "Pimenta de cheiro", preco: 0, cat: "temperos", arte: "pimentacheiro", pasta: "massas", max: 2 },
      { id: "reino", nome: "Pimenta do reino", preco: 0, cat: "temperos", arte: "reino", pasta: "massas", max: 2 },
      { id: "calabresaflocos", nome: "Pimenta calabresa", preco: 0, cat: "temperos", img: "t-flocos-1.webp", pasta: "massas", max: 2 },
    ],
  };
  { const p = precoDe("massa.base", "base"); if (p != null) MASSA.base = p; }
  aplicarLista(MASSA.ingredientes, "massa.ingrediente", { preco: true, max: true });
  MASSA.ingredientes.forEach(i => { estado.massaPorcoes[i.id] = 0; });
  function chip(item, grade, aoTocar, aoTirar, app = "pizza") {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip";
    b.setAttribute("aria-label", "Adicionar " + item.nome);
    const nomeArte = item.arte || item.id;
    const fb = ` onerror="this.onerror=null;this.src='${IMG_PIZZA}t-${nomeArte}-0.webp'"`;
    const fotos = item.mini
      ? `<span class="ca ca0 ca-unica"><img src="${item.mini}" alt=""></span>`
      : `<span class="ca ca1"><img src="${IMG_PIZZA}t-${nomeArte}-1.webp" alt=""${fb}></span><span class="ca ca2"><img src="${IMG_PIZZA}t-${nomeArte}-2.webp" alt=""${fb}></span><span class="ca ca0"><img src="${IMG_PIZZA}t-${nomeArte}-0.webp" alt=""></span>`;
    b.innerHTML = `<span class="well"><span class="chip-art">${fotos}</span></span><span class="chip-nome">${item.nome}</span><span class="chip-preco">${item.preco ? "+ " + reais(item.preco) : ""}</span><span class="badge" aria-hidden="true"></span><span class="menos" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg></span>`;
    let seguro, x0 = 0;
    b.addEventListener("pointerdown", e => {
      if (app === "pizza") estado.mexeu = true;
      if (e.target.closest(".menos") || (app === "pizza" ? estado.forno : estado.chapa)) return;
      x0 = e.clientX;
      b.classList.add("apertado");
      seguro = setTimeout(() => { seguro = null; b.classList.remove("apertado"); b.dataset.segurou = "1"; aoTirar(item, b); }, 480);
    });
    const solta = () => { b.classList.remove("apertado"); clearTimeout(seguro); };
    b.addEventListener("pointerup", solta);
    b.addEventListener("pointerleave", solta);
    b.addEventListener("pointercancel", solta);
    b.addEventListener("pointermove", e => { if (Math.abs(e.clientX - x0) > 8) solta(); });
    b.addEventListener("click", e => {
      if (b.dataset.segurou) { delete b.dataset.segurou; return; }
      if ((app === "pizza" ? estado.forno : estado.chapa)) return;
      const menos = e.target.closest(".menos");
      if (menos) {
        menos.animate([{ transform: "scale(1)" }, { transform: "scale(.82)" }, { transform: "scale(1)" }], { duration: 220 });
        aoTirar(item, b);
      } else aoTocar(item, b);
      soltarPedido(app);
    });
    grade.appendChild(b);
    item.chip = b;
    return b;
  }
  function marcar(item, n) {
    item.chip.classList.toggle("on", n > 0);
    $(".badge", item.chip).textContent = n > 1 ? "×" + n : "✓";
    if (item.cat && PIZZA.ingredientes.includes(item)) atualizarPizzaUI();
  }
  function tremer(item) {
    item.chip.animate([{ transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }], { duration: 320 });
    vibrar([8, 30, 8]);
  }

  /* ---- Hamburger: montagem e animações com ferramentas ---- */
  const lanche = $("#lanche");
  const pilha = $("#pilha");
  const ingLanche = $("#ingLanche");
  let camadaEl = {};
  const MAX_CAMADAS = 14;
  const naPilha = new Map();
  const totalCamadas = () => [...estado.lanche.values()].reduce((s, n) => s + n, 0);
  let entregas = Promise.resolve();

  const pontaDoBotao = chip => {
    const r = $(".well", chip).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  /* ordem de montagem de hamburgueria, de baixo para cima */
  const ORDEM = ["molhos", "alface", "tomate", "proteina", "bacon", "ovo", "cebola", "picles", "jalapeno", "caramelizada", "aneis"];
  function sequencia(mapa = naPilha) {
    const por = id => LANCHE.camadas.find(c => c.id === id);
    const copias = ids => ids.flatMap(id => Array.from({ length: mapa.get(id) || 0 }, (_, i) => ({ c: por(id), k: `${id}#${i}` })));
    const seq = [{ c: por("pao-base"), k: "pao-base" }];
    ORDEM.forEach(etapa => {
      if (etapa === "molhos") seq.push(...copias(LANCHE.camadas.filter(c => c.molho).map(c => c.id)));
      else if (etapa === "proteina") {
        const prot = copias(["carne", "frango"]), queijo = copias(["cheddar", "prato"]);
        for (let i = 0; i < Math.max(prot.length, queijo.length); i++) {
          if (prot[i]) seq.push(prot[i]);
          if (queijo[i]) seq.push(queijo[i]);
        }
      } else if (etapa === "cebola") {
        seq.push(...copias(["cebola-roxa"]));
      } else if (etapa === "tomate") {
        seq.push(...copias(["tomate-fatia"]));
      } else {
        seq.push(...copias([etapa]));
      }
    });
    seq.push({ c: por("pao-topo"), k: "pao-topo" });
    return seq;
  }

  function medir(mapa = naPilha) {
    const largura = lanche.clientWidth || 270, H = lanche.clientHeight || 262;
    let topo = 0, alturaMax = 0;
    const pos = sequencia(mapa).map(({ c, k }) => {
      const base = Math.max(0, topo - c.afunda * largura);
      alturaMax = Math.max(alturaMax, base + c.h * largura);
      topo = base + c.afunda * largura + c.sobe * largura;
      return { c, k, base };
    });
    const esc = Math.min(1, (H * 0.96) / alturaMax);
    return { pos, esc, folga: Math.max(0, (H - alturaMax * esc) / 2) / esc, largura, H };
  }

  const FERR = {
    espatula: { src: `${IMG_HAMBURGER}ferr-espatula.webp`, ...FERRAMENTAS.espatula },
    mao: { src: `${IMG_HAMBURGER}ferr-mao.webp`, ...FERRAMENTAS.mao },
    bisnaga: { src: `${IMG_PIZZA}ferr-bisnaga.webp`, ...FERRAMENTAS.bisnaga },
  };
  const curva = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  const suave = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function imgFixa(src, cls) {
    const i = document.createElement("img");
    i.src = src;
    i.alt = "";
    i.className = cls;
    document.body.appendChild(i);
    return i;
  }
  function porFerramenta(el, f, x, y, larg, rot = 0) {
    el.style.width = larg + "px";
    el.style.transform = `translate(${(x - f.ax * larg).toFixed(1)}px, ${(y - f.ay * larg * f.h).toFixed(1)}px) rotate(${rot}deg)`;
    el.style.transformOrigin = `${f.ax * 100}% ${f.ay * 100}%`;
  }

  function entregar1(item) {
    if ((naPilha.get(item.id) || 0) >= (estado.lanche.get(item.id) || 0)) return Promise.resolve();
    if (calmo || !document.body.contains(item.chip)) {
      naPilha.set(item.id, (naPilha.get(item.id) || 0) + 1);
      empilhar();
      return Promise.resolve();
    }
    return item.molho ? bisnagar2(item) : levar(item);
  }

  function levar(item) {
    return new Promise(pronto => {
      const f = FERR[item.ferramenta];
      const futuro = new Map(naPilha);
      futuro.set(item.id, (futuro.get(item.id) || 0) + 1);
      const { esc } = medir(futuro);
      const L = lanche.getBoundingClientRect();
      const wFim = L.width * esc, hFim = wFim * item.h;
      const w0 = 46, r = $(".well", item.chip).getBoundingClientRect();
      const ini = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const fim = { x: L.left + L.width / 2, y: L.top - hFim / 2 };
      const ctl = { x: (ini.x + fim.x) / 2, y: Math.min(ini.y, fim.y) - 120 };
      const pega = imgFixa(`${IMG_HAMBURGER}${item.img}.webp`, "carregado");
      const ferr = imgFixa(f.src, "ferramenta ferramenta--" + item.ferramenta);
      if (item.ferramenta === "bisnaga") {
        ferr.onerror = () => { ferr.src = `${IMG_HAMBURGER}ferr-bisnaga.webp`; };
      }
      const t0 = performance.now(), D = 560;
      const quadro = () => {
        const t = Math.min(1, (performance.now() - t0) / D), e = suave(t);
        const x = curva(ini.x, ctl.x, fim.x, e), y = curva(ini.y, ctl.y, fim.y, e);
        const w = w0 + (wFim - w0) * e, h = w * item.h;
        pega.style.width = w + "px";
        pega.style.transform = `translate(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px) rotate(${(1 - e) * -10}deg)`;
        if (item.ferramenta === "espatula") porFerramenta(ferr, f, x, y + h / 2, w * f.k, (1 - e) * -8);
        else porFerramenta(ferr, f, x + w * 0.18, y - h * 0.32, w * f.k, (1 - e) * 10);
        if (t < 1) return requestAnimationFrame(quadro);
        pega.remove();
        naPilha.set(item.id, (naPilha.get(item.id) || 0) + 1);
        empilhar(null, { trazido: true });
        vibrar(8);
        const sai = item.ferramenta === "espatula"
          ? [{ transform: ferr.style.transform, opacity: 1 }, { transform: ferr.style.transform + " rotate(16deg)", opacity: 1, offset: 0.35 }, { transform: ferr.style.transform + " translate(90px, -110px) rotate(16deg)", opacity: 0 }]
          : [{ transform: ferr.style.transform, opacity: 1 }, { transform: ferr.style.transform + " translate(0, -30px)", opacity: 1, offset: 0.4 }, { transform: ferr.style.transform + " translate(70px, -120px)", opacity: 0 }];
        ferr.animate(sai, { duration: 420, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" }).onfinish = () => ferr.remove();
        setTimeout(pronto, 160);
      };
      requestAnimationFrame(quadro);
    });
  }

  function bisnagar2(item) {
    return new Promise(pronto => {
      const f = FERR.bisnaga;
      const r = $(".well", item.chip).getBoundingClientRect();
      const L = lanche.getBoundingClientRect();
      const larg = Math.min(150, L.width * 0.5);
      const ini = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const ferr = imgFixa(f.src, "ferramenta ferramenta--bisnaga");
      ferr.onerror = () => { ferr.src = `${IMG_HAMBURGER}ferr-bisnaga.webp`; };
      const alvo = { x: L.left + L.width * 0.18, y: L.top + L.height * 0.2 };
      const ctl = { x: (ini.x + alvo.x) / 2, y: Math.min(ini.y, alvo.y) - 100 };
      const t0 = performance.now(), D = 480;
      const ir = () => {
        const t = Math.min(1, (performance.now() - t0) / D), e = suave(t);
        porFerramenta(ferr, f, curva(ini.x, ctl.x, alvo.x, e), curva(ini.y, ctl.y, alvo.y, e), larg * (0.4 + 0.6 * e), (1 - e) * 30);
        if (t < 1) return requestAnimationFrame(ir);
        naPilha.set(item.id, 1);
        const el = empilhar(null, { molho: item.id });
        if (!el) { ferr.remove(); return pronto(); }
        const R = el.getBoundingClientRect();
        const x0 = R.left + R.width * 0.08, x1 = R.right - R.width * 0.08, yy = R.top + R.height * 0.18;
        const t1 = performance.now(), D2 = 820;
        const passa = () => {
          const k = Math.min(1, (performance.now() - t1) / D2);
          const x = alvo.x + (x0 - alvo.x) * Math.min(1, k * 5);
          const xx = k < 0.2 ? x : x0 + (x1 - x0) * ((k - 0.2) / 0.8);
          const yk = k < 0.2 ? alvo.y + (yy - alvo.y) * (k / 0.2) : yy;
          porFerramenta(ferr, f, xx, yk, larg, Math.sin(k * 30) * 2);
          if (k > 0.2 && Math.random() < 0.15) vibrar(3);
          if (k < 1) return requestAnimationFrame(passa);
          ferr.animate([{ transform: ferr.style.transform, opacity: 1 }, { transform: ferr.style.transform + " translate(80px, -110px) rotate(-20deg)", opacity: 0 }], { duration: 360, easing: "ease-in", fill: "forwards" }).onfinish = () => ferr.remove();
          pronto();
        };
        requestAnimationFrame(passa);
      };
      requestAnimationFrame(ir);
    });
  }

  const T = (x, y, s, r) => `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%) rotate(${r}deg) scale(${s.toFixed(3)})`;
  function voltar(el, botao) {
    const r = el.getBoundingClientRect(), de = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    const alvo = pontaDoBotao(botao);
    const v = document.createElement("img");
    v.src = el.src; v.alt = ""; v.className = "voo";
    v.style.width = r.width + "px";
    if (el.style.filter) v.style.filter = el.style.filter;
    document.body.appendChild(v);
    el.remove();
    v.animate([
      { transform: T(de.x, de.y, 1, 0), opacity: 1 },
      { transform: T((de.x + alvo.x) / 2, Math.min(de.y, alvo.y) - 50, 0.7, -12), opacity: 1, offset: 0.4 },
      { transform: T(alvo.x, alvo.y, 0.18, -20), opacity: 0.3 },
    ], { duration: 420, easing: "cubic-bezier(.3,.6,.4,1)", fill: "both" }).finished.catch(() => { }).then(() => v.remove());
  }

  function empilhar(saiu, op = {}) {
    const { pos, esc, folga, H } = medir();
    pilha.style.transform = `scale(${esc.toFixed(3)})`;
    const chaves = new Set(pos.map(s => s.k));
    Object.keys(camadaEl).forEach(k => {
      if (chaves.has(k)) return;
      const el = camadaEl[k];
      delete camadaEl[k];
      if (calmo || !saiu || !k.startsWith(saiu.id + "#")) el.remove();
      else voltar(el, saiu.botao);
    });
    const primeira = !pilha.childElementCount;
    let queda = 0, novaEl = null;
    const TAMPA = op.molho ? 90 : 34;
    pos.forEach(({ c, k, base }, z) => {
      let el = camadaEl[k];
      const novoBottom = folga + base;
      const nova = !el;
      if (nova) {
        el = document.createElement("img");
        el.src = `${IMG_HAMBURGER}${c.img}.webp`;
        el.alt = "";
        el.className = "camada";
        camadaEl[k] = el;
        pilha.appendChild(el);
        novaEl = el;
      }
      if (!nova && !el.src.endsWith(`${c.img}.webp`)) el.src = `${IMG_HAMBURGER}${c.img}.webp`;
      const antigo = nova ? null : parseFloat(el.style.bottom);
      el.style.zIndex = String(z + 1);
      el.style.bottom = novoBottom + "px";
      if (calmo || primeira) return;
      if (nova && op.molho) {
        queda = 980;
        el.animate([
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 94% 0 0)", offset: 0.2 },
          { clipPath: "inset(0 6% 0 0)", offset: 0.96 },
          { clipPath: "inset(0 0% 0 0)" }
        ], { duration: 840, easing: "linear", fill: "backwards" });
      } else if (nova) {
        const altura = Math.max(80, H / esc - novoBottom);
        queda = Math.min(380, Math.max(240, 1000 * Math.sqrt((2 * altura) / 3400)));
        el.style.zIndex = "50";
        const de0 = op.trazido ? 1 : 0;
        el.animate([
          { transform: `translateY(${-altura}px) rotate(${op.trazido ? 0 : -6}deg)`, opacity: de0, easing: "cubic-bezier(.55,0,1,.45)" },
          { transform: `translateY(${-altura * 0.82}px) rotate(${op.trazido ? 2 : -4}deg)`, opacity: 1, offset: 0.18, easing: "cubic-bezier(.55,0,1,.45)" },
          { transform: "translateY(0) rotate(0) scale(1, 1)", offset: 0.7, easing: "ease-out" },
          { transform: "translateY(0) scale(1.04, .88)", offset: 0.82 },
          { transform: "translateY(0) scale(1, 1)" },
        ], { duration: queda / 0.7, fill: "backwards" }).finished.catch(() => { }).then(() => { el.style.zIndex = String(z + 1); });
        setTimeout(() => {
          vibrar(10);
          pilha.animate([{ transform: `scale(${esc})` }, { transform: `scale(${esc * 1.02}, ${esc * 0.97})` }, { transform: `scale(${esc})` }], { duration: 240, easing: "ease-out" });
          migalhas(el);
        }, queda);
        Object.values(camadaEl).forEach(o => {
          if (o !== el && Number(o.style.zIndex) < z + 1) o.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.95)", offset: 0.5 }, { transform: "scaleY(1)" }], { duration: 220, delay: queda - 20 });
        });
      } else if (queda) {
        const d = antigo - novoBottom;
        const tot = queda / 0.7 + 260;
        el.animate([
          { transform: `translateY(${-d}px)` },
          { transform: `translateY(${-TAMPA}px)`, offset: 0.28 * (300 / tot) + 0.02, easing: "ease-in-out" },
          { transform: `translateY(${-TAMPA}px)`, offset: queda / tot, easing: "cubic-bezier(.55,0,1,.45)" },
          { transform: "translateY(0)", offset: (queda + 170) / tot, easing: "ease-out" },
          { transform: "translateY(-4px)", offset: (queda + 220) / tot, easing: "ease-in" },
          { transform: "translateY(0)" },
        ], { duration: tot });
        setTimeout(() => vibrar(8), queda + 170);
      } else if (Math.abs(antigo - novoBottom) > 0.5) {
        const d = antigo - novoBottom;
        if (d > 0) {
          el.animate([
            { transform: `translateY(${-d}px)`, easing: "cubic-bezier(.55,0,1,.45)" },
            { transform: "translateY(0)", offset: 0.68, easing: "ease-out" },
            { transform: `translateY(${-Math.min(8, d * 0.12)}px)`, offset: 0.84, easing: "ease-in" },
            { transform: "translateY(0)" },
          ], { duration: 420 });
          setTimeout(() => vibrar(8), 290);
        } else {
          el.animate([{ transform: `translateY(${-d}px)` }, { transform: "translateY(0)" }], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" });
        }
      }
    });
    return novaEl;
  }

  function migalhas(el) {
    if (calmo) return;
    const r = el.getBoundingClientRect(), base = lanche.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const m = document.createElement("i");
      m.className = "migalha";
      const lado = i % 2 ? 1 : -1;
      m.style.left = (r.left - base.left + r.width * (lado > 0 ? 0.85 : 0.15)) + "px";
      m.style.top = (r.top - base.top + r.height * 0.5) + "px";
      lanche.appendChild(m);
      const dx = lado * (14 + Math.random() * 26), dy = -(10 + Math.random() * 22);
      m.animate([
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy}px) scale(.9)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${dx}px, ${-dy * 0.6}px) scale(.5)`, opacity: 0 },
      ], { duration: 520 + Math.random() * 200, easing: "cubic-bezier(.3,.6,.5,1)" }).onfinish = () => m.remove();
    }
  }

  function criarFerramentaMassa() {
    if (calmo) return;
    const ferr = document.createElement("img");
    ferr.className = "ferr"; ferr.alt = "";
    ferr.src = `${IMG_MASSA}ferr-concha.webp`;
    ferr.onerror = () => ferr.remove();
    $("#massa").appendChild(ferr);
    const massaEl = $("#massa");
    const r = massaEl.getBoundingClientRect();
    const pilhaRect = $("#massa").getBoundingClientRect();
    const larg = 120, alt = larg * 0.9;
    ferr.style.width = larg + "px"; ferr.style.height = alt + "px";
    ferr.style.left = (r.left - pilhaRect.left + r.width / 2 - larg / 2) + "px";
    ferr.style.top = (r.top - pilhaRect.top - alt * 0.3) + "px";
    ferr.style.opacity = "0";
    void ferr.offsetWidth;
    ferr.animate([{ opacity: 0, transform: `translateY(-30px) rotate(-10deg)` }, { opacity: 1, transform: "translateY(0) rotate(0)" }, { opacity: 0, transform: `translateY(-40px) rotate(10deg)` }], { duration: 500, easing: "ease-in-out", fill: "forwards" }).finished.then(() => ferr.remove());
  }

  const seletorPao = $("#paes");
  function usarPao(id, animar) {
    const p = PAES.find(x => x.id === id);
    const antes = total("lanche");
    estado.pao = id;
    const base = LANCHE.camadas.find(c => c.id === "pao-base");
    const topo = LANCHE.camadas.find(c => c.id === "pao-topo");
    Object.assign(base, { img: p.base, h: p.hb });
    Object.assign(topo, { img: p.topo, h: p.ht });
    $$("button", seletorPao).forEach(b => b.setAttribute("aria-checked", b.dataset.pao === id ? "true" : "false"));
    if (!animar || calmo) { empilhar(); precificar("lanche"); return; }
    const tEl = camadaEl["pao-topo"];
    if (tEl) tEl.animate([{ transform: "translateY(0)" }, { transform: "translateY(-60px) rotate(-4deg)", offset: 0.4 }, { transform: "translateY(0)" }], { duration: 520, easing: "cubic-bezier(.3,.6,.4,1)" });
    setTimeout(() => { empilhar(); vibrar(8); }, 200);
    precificar("lanche", total("lanche") - antes);
  }
  PAES.forEach(p => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("role", "radio"); b.dataset.pao = p.id;
    b.setAttribute("aria-checked", p.id === estado.pao ? "true" : "false");
    b.innerHTML = `<img src="${IMG_HAMBURGER}${p.topo}.webp" alt="" width="40" height="20"><span>${p.nome}</span>`;
    b.addEventListener("click", () => {
      if (estado.chapa || p.id === estado.pao) return;
      soltarPedido("lanche");
      usarPao(p.id, true);
    });
    seletorPao.appendChild(b);
  });
  const chapaEl = $("#chapa"), palito = $("#palito");
  function chapear() {
    const ui = UI.lanche;
    if (estado.chapa === "chapando") return;
    if (!estado.chapa && estado.lanche.size === 0) {
      ui.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
      dizer("Coloque um ingrediente primeiro", null, null, "lanche");
      vibrar([8, 30, 8]);
      return;
    }
    if (estado.chapa === "pronto") { ui.pedir.animate([{ transform: "scale(1)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 260 }); return entregar("lanche"); }
    estado.chapa = "chapando";
    $("#appLanche").classList.add("chapando");
    ui.comanda.hidden = true;
    ui.texto.textContent = "Na chapa";
    const D = 2300;
    if (calmo) return setTimeout(fimDaChapa, 300);
    ui.barra.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: D - 200, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    chapaEl.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: D, easing: "ease-in-out" });
    const esc = parseFloat((pilha.style.transform.match(/scale\(([\d.]+)/) || [0, 1])[1]);
    pilha.animate([
      { transform: `scale(${esc})` },
      { transform: `scale(${esc * 1.03}, ${esc * 0.9})`, offset: 0.12 },
      { transform: `scale(${esc})`, offset: 0.24 },
      { transform: `scale(${esc * 1.03}, ${esc * 0.9})`, offset: 0.4 },
      { transform: `scale(${esc})`, offset: 0.52 },
    ], { duration: D, easing: "ease-in-out" });
    setTimeout(() => vibrar([12, 50, 12]), D * 0.12);
    setTimeout(() => vibrar([12, 50, 12]), D * 0.4);
    for (let i = 0; i < 18; i++) setTimeout(() => {
      const v = document.createElement("i");
      v.className = "vapor";
      const tam = 26 + Math.random() * 34;
      v.style.width = v.style.height = tam + "px";
      v.style.left = 18 + Math.random() * 64 + "%";
      v.style.top = 30 + Math.random() * 30 + "%";
      $("#lanche").appendChild(v);
      const dx = (Math.random() - 0.5) * 40;
      v.animate([
        { transform: "translate(-50%, 0) scale(.4)", opacity: 0 },
        { opacity: 0.55, offset: 0.25 },
        { transform: `translate(calc(-50% + ${dx}px), -110px) scale(1.4)`, opacity: 0 },
      ], { duration: 1400 + Math.random() * 600, easing: "ease-out" }).onfinish = () => v.remove();
    }, 120 + i * 95);
    dizer("Chapa a 250°, 3 minutos", null, null, "lanche");
    setTimeout(fimDaChapa, D + 100);
  }
  function fimDaChapa() {
    estado.chapa = "pronto";
    $("#appLanche").classList.remove("chapando");
    $("#appLanche").classList.add("pronto");
    UI.lanche.barra.getAnimations().forEach(a => a.cancel());
    const topo = camadaEl["pao-topo"];
    if (topo) {
      const r = topo.getBoundingClientRect(), base = $("#lanche").getBoundingClientRect();
      palito.style.left = (r.left - base.left + r.width * 0.56) + "px";
      palito.style.top = (r.top - base.top - palito.offsetHeight * 0.52) + "px";
      palito.hidden = false;
      if (!calmo) palito.animate([
        { transform: "translateY(-120px) rotate(8deg)", opacity: 0, easing: "cubic-bezier(.55,0,1,.45)" },
        { transform: "translateY(0) rotate(4deg)", opacity: 1, offset: 0.7, easing: "ease-out" },
        { transform: "translateY(-6px) rotate(3deg)", offset: 0.85 },
        { transform: "translateY(0) rotate(4deg)" },
      ], { duration: 460 });
    }
    vibrar([10, 40, 10]);
    entregar("lanche");
    dizer("Saiu da chapa.", montarOutro, "Montar outro", "lanche");
  }
  function montarOutro() {
    estado.chapa = null;
    palito.hidden = true;
    $("#appLanche").classList.remove("pronto", "chapando");
    estado.lanche = new Map();
    naPilha.clear();
    camadaEl = {};
    pilha.innerHTML = "";
    LANCHE.camadas.filter(c => !c.fixo).forEach(c => marcar(c, 0));
    usarPao(estado.pao, false);
    UI.lanche.comanda.hidden = true;
    soltarPedido("lanche");
    precificar("lanche");
    dizer("Escolha o pão e toque para empilhar", null, null, "lanche");
  }
  /* ---- Pizza: geometria ---- */
  const escalaGiro = () => PIZZA.tamanhos[estado.tam].escala;
  function roda() {
    const r = cobertura.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, R: r.width / 2 };
  }
  const arte = (item, k) => `${IMG_PIZZA}t-${item.arte || item.id}-${k % 3}.webp`;

  /* ---- Muçarela: canvas pintado em espiral ---- */
  const queijo = {
    tam: 0,
    camadas: [[`${IMG_PIZZA}queijo.webp`, "#queijoA", "#queijoAd"], [`${IMG_PIZZA}queijo-extra.webp`, "#queijoB", "#queijoBd"]].map(([src, sel, selD]) => {
      const img = new Image(); img.src = src;
      img.onload = () => desenharQueijo(c, true);
      const c = { img, tela: $(sel), telaD: $(selD), mascara: document.createElement("canvas"), sujo: false };
      return c;
    }),
    derretido: (() => { const i = new Image(); i.src = `${IMG_PIZZA}queijo-derretido.webp`; i.onload = () => queijo.camadas.forEach(c => desenharQueijo(c, true)); return i; })(),
    raf: 0,
    farelo: 0,
  };
  function medirQueijo() {
    const t = Math.round(pizzaEl.offsetWidth * Math.min(2, devicePixelRatio || 1));
    if (!t || t === queijo.tam) return;
    queijo.camadas.forEach(c => {
      let copia = null;
      if (queijo.tam) { copia = document.createElement("canvas"); copia.width = copia.height = queijo.tam; copia.getContext("2d").drawImage(c.mascara, 0, 0); }
      c.mascara.width = c.mascara.height = c.tela.width = c.tela.height = c.telaD.width = c.telaD.height = t;
      if (copia) c.mascara.getContext("2d").drawImage(copia, 0, 0, t, t);
    });
    queijo.tam = t;
    Object.keys(molhos).forEach(id => { molhos[id].tela.width = molhos[id].tela.height = t; desenharMolho(id); });
    queijo.camadas.forEach(c => desenharQueijo(c, true));
  }
  function desenharQueijo(c, ja) {
    const t = queijo.tam;
    if (!t) return;
    if (!ja) { c.sujo = true; if (!queijo.raf) queijo.raf = requestAnimationFrame(() => { queijo.raf = 0; queijo.camadas.forEach(k => k.sujo && desenharQueijo(k, true)); }); return; }
    c.sujo = false;
    const m = t / 2;
    [[c.tela, c.img], [c.telaD, queijo.derretido]].forEach(([tela, img]) => {
      const x = tela.getContext("2d");
      x.save();
      x.clearRect(0, 0, t, t);
      if (img.complete && img.naturalWidth) {
        x.drawImage(img, 0, 0, t, t);
        x.globalCompositeOperation = "destination-in";
        x.drawImage(c.mascara, 0, 0);
        const g = x.createRadialGradient(m, m, 0.68 * m, m, m, 0.8 * m);
        g.addColorStop(0, "#000"); g.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = g; x.fillRect(0, 0, t, t);
      }
      x.restore();
    });
  }
  function pincelar(u, v, camada, forca, cunha) {
    const t = queijo.tam;
    if (!t) return;
    const c = queijo.camadas[camada], x = c.mascara.getContext("2d"), m = t / 2;
    x.save();
    x.beginPath();
    if (cunha && cunha.k > 1) { x.moveTo(m, m); x.arc(m, m, 0.8 * m, cunha.a0, cunha.a1); x.closePath(); }
    else x.arc(m, m, 0.8 * m, 0, Math.PI * 2);
    x.clip();
    for (let k = 0; k < 16; k++) {
      const a = Math.PI * 2 * Math.random();
      const d = 0.36 * Math.abs((Math.random() + Math.random() + Math.random()) / 3 - 0.5);
      const px = m + (u + Math.cos(a) * d) * m, py = m + (v + Math.sin(a) * d) * m;
      const r = m * (0.05 + 0.06 * Math.random());
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(0,0,0,${Math.min(1, 0.95 * forca)})`);
      g.addColorStop(0.55, `rgba(0,0,0,${0.8 * forca})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill();
    }
    x.restore();
    desenharQueijo(c, false);
  }
  function farelos(x, y) {
    const agora = performance.now();
    if (agora - queijo.farelo < 45) return;
    queijo.farelo = agora;
    for (let k = 0; k < 2; k++) {
      const f = document.createElement("img");
      f.className = "farelo"; f.alt = "";
      f.src = `${IMG_PIZZA}t-farelo-${(Math.random() * 3) | 0}.webp`;
      document.body.appendChild(f);
      const dx = (Math.random() - 0.5) * 26, r = 360 * Math.random();
      f.animate([
        { transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(.9)`, opacity: 1 },
        { transform: `translate(${x + dx}px, ${y + 26}px) rotate(${r + 40}deg) scale(.55)`, opacity: 0 },
      ], { duration: 380, easing: "ease-in" }).onfinish = () => f.remove();
    }
  }
  function espiral(camada, instantaneo, cunha) {
    medirQueijo();
    const passo = (k) => { const s = k / 72, a = s * Math.PI * 6.4, r = 0.08 + 0.64 * s; return [Math.cos(a) * r, Math.sin(a) * r]; };
    if (instantaneo || calmo) { for (let k = 0; k < 72; k++) { const [u, v] = passo(k); pincelar(u, v, camada, 1.1, cunha); } return; }
    const t0 = performance.now(), g = roda();
    let feito = 0;
    const quadro = () => {
      const e = Math.min(1, (performance.now() - t0) / 1100);
      const ate = Math.floor(72 * e);
      for (let k = feito; k < ate; k++) {
        const [u, v] = passo(k);
        pincelar(u, v, camada, 1.1, cunha);
        if (k % 3 === 0 && dentroDaCunha(u, v, cunha)) farelos(g.cx + u * g.R, g.cy + v * g.R - 20);
      }
      feito = ate;
      if (e < 1) requestAnimationFrame(quadro);
    };
    requestAnimationFrame(quadro);
  }
  function limparQueijo(animar) {
    const zera = () => queijo.camadas.forEach(c => {
      c.mascara.getContext("2d").clearRect(0, 0, queijo.tam, queijo.tam);
      c.tela.getContext("2d").clearRect(0, 0, queijo.tam, queijo.tam);
      c.telaD.getContext("2d").clearRect(0, 0, queijo.tam, queijo.tam);
    });
    if (!animar || calmo) return zera();
    const telas = queijo.camadas.map(c => c.tela);
    const a = telas.map(t => t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-in", fill: "forwards" }));
    a[0].onfinish = () => { zera(); a.forEach(x => x.cancel()); };
  }

  /* ---- Catupiry e cheddar: bisnaga desenha espiral ---- */
  const PONTA = { "catupiry": { "x": 0.0058, "y": 0.9783, "h": 0.8865 }, "cheddar": { "x": 0.0154, "y": 0.968, "h": 0.8404 } };
  const molhos = {};
  const CORES = {
    catupiry: { sombra: "rgba(60,35,20,.28)", borda: "#e7dfcf", corpo: "#f7f2e8", brilho: "rgba(255,255,255,.95)" },
    cheddar: { sombra: "rgba(90,40,10,.3)", borda: "#d9822a", corpo: "#f2a640", brilho: "rgba(255,226,160,.95)" },
    /* azeites: traço translúcido (a pizza aparece por baixo) */
    "oleo": { sombra: "rgba(120,80,10,.14)", borda: "rgba(214,164,40,.30)", corpo: "rgba(240,196,70,.34)", brilho: "rgba(255,248,214,.85)" },
    "oleo-oliva": { sombra: "rgba(60,70,5,.16)", borda: "rgba(120,140,20,.32)", corpo: "rgba(160,180,40,.34)", brilho: "rgba(240,250,190,.8)" },
  };
  ["catupiry", "cheddar"].forEach(id => { molhos[id] = { tela: $("#molho-" + id), trilhas: [] }; });
  ["oleo", "oleo-oliva"].forEach(id => {
    let tela = $("#molho-" + id);
    if (!tela) { tela = document.createElement("canvas"); tela.id = "molho-" + id; tela.className = "pizza__molho"; cobertura.appendChild(tela); }
    molhos[id] = { tela: tela, trilhas: [], fino: true };
  });
  function desenharMolho(id) {
    const m = molhos[id], t = m.tela.width, c = t / 2, x = m.tela.getContext("2d"), cor = CORES[id];
    const w = t * (m.fino ? 0.02 : 0.036);
    x.clearRect(0, 0, t, t);
    x.lineCap = x.lineJoin = "round";
    const caminho = (tr, dx, dy) => {
      x.beginPath();
      for (let i = 0; i <= tr.ate && i < tr.pts.length; i++) {
        const [u, v] = tr.pts[i], px = c + u * c + dx, py = c + v * c + dy;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
    };
    const passada = (estilo, larg, dx, dy) => m.trilhas.forEach(tr => { if (tr.ate < 1) return; caminho(tr, dx, dy); x.strokeStyle = estilo; x.lineWidth = larg; x.stroke(); });
    passada(cor.sombra, w * 1.05, w * 0.12, w * 0.28);
    passada(cor.borda, w, 0, 0);
    passada(cor.corpo, w * 0.78, -w * 0.04, -w * 0.06);
    passada(cor.brilho, w * 0.22, -w * 0.16, -w * 0.2);
  }
  function bisnagar(item, volta, cunha) {
    const m = molhos[item.id], t = queijo.tam;
    medirQueijo();
    if (!t) return;
    const giro0 = Math.random() * Math.PI * 2 + volta * Math.PI;
    const meio = item.id === "cheddar" ? 0.045 : 0;
    const r0 = (volta ? 0.6 : 0.66) - meio, r1 = (volta ? 0.14 : 0.08) + meio, voltas = 3.1;
    const N = 440;
    const pontoEsp = s => { const a = giro0 + s * Math.PI * 2 * voltas, r = r0 - (r0 - r1) * s + 0.012 * Math.sin(a * 7); return [Math.cos(a) * r, Math.sin(a) * r]; };
    const ponto = (cunha && cunha.k > 1) ? pontoDaLista(varrerSetor(cunha, 3, 0.62, 0.2)) : pontoEsp;
    const trilha = { pts: Array.from({ length: N + 1 }, (_, i) => ponto(i / N)), ate: 0, setor: cunha ? cunha.i : 0 };
    m.trilhas.push(trilha);
    cobertura.appendChild(m.tela);
    if (calmo) { trilha.ate = N; desenharMolho(item.id); return; }
    const bis = document.createElement("img");
    bis.className = "bisnaga"; bis.alt = ""; bis.src = `${IMG_PIZZA}bisnaga-${item.id}.webp`;
    pizzaEl.appendChild(bis);
    const larg = pizzaEl.offsetWidth * 0.62;
    bis.style.width = larg + "px";
    const alt = larg * PONTA[item.id].h;
    const sEsc = escalaGiro(), W = pizzaEl.offsetWidth;
    const local = (u, v) => [W / 2 + u * (W / 2) * sEsc, W / 2 + v * (W / 2) * sEsc];
    const posiciona = (u, v, extra = "") => {
      const [px, py] = local(u, v);
      bis.style.transform = `translate(${px - PONTA[item.id].x * larg}px, ${py - PONTA[item.id].y * alt}px) ${extra}`;
    };
    const [u0, v0] = ponto(0);
    posiciona(u0, v0);
    bis.animate([{ opacity: 0, translate: "60px -80px" }, { opacity: 1, translate: "0 0" }], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" });
    const t0 = performance.now() + 240, DUR = 1700;
    let feito = 0;
    const quadro = () => {
      const e = Math.min(1, Math.max(0, (performance.now() - t0) / DUR));
      const ate = Math.floor(N * e);
      if (ate > feito) { trilha.ate = ate; desenharMolho(item.id); if (ate % 40 < ate - feito) vibrar(4); }
      feito = ate;
      const [u, v] = ponto(e);
      posiciona(u, v, `rotate(${Math.sin(e * 40) * 2}deg)`);
      if (e < 1) requestAnimationFrame(quadro);
      else bis.animate([{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "70px -90px" }], { duration: 280, easing: "ease-in", fill: "forwards" }).onfinish = () => bis.remove();
    };
    requestAnimationFrame(quadro);
  }
  /* ---- Azeite: o frasco passa em zigue-zague, deixando um fio fino e translúcido ----
     PONTA_FRASCO = onde fica o bico na imagem (medido no arquivo: x e y em fração da largura/altura). */
  const PONTA_FRASCO = { "oleo": { x: 0.062, y: 0.954, h: 1 }, "oleo-oliva": { x: 0.048, y: 0.96, h: 1 } };
  function azeitar(item, volta, cunha) {
    const m = molhos[item.id], t = queijo.tam;
    medirQueijo();
    if (!t) return;
    const ang = (volta ? Math.PI / 2 : 0) + (Math.random() - 0.5) * 0.35;   /* 2ª porção cruza a 1ª */
    const K = 7, R = 0.7, N = 520;
    const base = [], seg = [];
    let tot = 0;
    for (let k = 0; k < K; k++) {
      const y = -0.62 + k * (1.24 / (K - 1)), hw = Math.sqrt(Math.max(0.02, R * R - y * y));
      base.push(k % 2 ? [hw, y] : [-hw, y], k % 2 ? [-hw, y] : [hw, y]);
    }
    for (let i = 1; i < base.length; i++) { const d = Math.hypot(base[i][0] - base[i - 1][0], base[i][1] - base[i - 1][1]); seg.push(d); tot += d; }
    const pontoZig = s => {
      let alvo = s * tot, i = 0;
      while (i < seg.length - 1 && alvo > seg[i]) { alvo -= seg[i]; i++; }
      const f = seg[i] ? Math.min(1, alvo / seg[i]) : 0;
      const u = base[i][0] + (base[i + 1][0] - base[i][0]) * f + 0.008 * Math.sin(s * 70);
      const v = base[i][1] + (base[i + 1][1] - base[i][1]) * f + 0.012 * Math.sin(s * 90);
      return [u * Math.cos(ang) - v * Math.sin(ang), u * Math.sin(ang) + v * Math.cos(ang)];
    };
    const ponto = (cunha && cunha.k > 1) ? pontoDaLista(varrerSetor(cunha, 6, 0.66, 0.12)) : pontoZig;
    const trilha = { pts: Array.from({ length: N + 1 }, (_, i) => ponto(i / N)), ate: 0, setor: cunha ? cunha.i : 0 };
    m.trilhas.push(trilha);
    cobertura.appendChild(m.tela);
    if (calmo) { trilha.ate = N; desenharMolho(item.id); return; }
    const bis = document.createElement("img");
    bis.className = "bisnaga"; bis.alt = ""; bis.src = `${IMG_PIZZA}t-${item.id}.webp`;
    pizzaEl.appendChild(bis);
    const larg = pizzaEl.offsetWidth * 0.5;
    bis.style.width = larg + "px";
    const P = PONTA_FRASCO[item.id], alt = larg * P.h;
    const sEsc = escalaGiro(), W = pizzaEl.offsetWidth;
    const local = (u, v) => [W / 2 + u * (W / 2) * sEsc, W / 2 + v * (W / 2) * sEsc];
    const posiciona = (u, v, extra = "") => {
      const [px, py] = local(u, v);
      bis.style.transform = `translate(${px - P.x * larg}px, ${py - P.y * alt}px) ${extra}`;
    };
    const [u0, v0] = ponto(0);
    posiciona(u0, v0);
    bis.animate([{ opacity: 0, translate: "60px -80px" }, { opacity: 1, translate: "0 0" }], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" });
    const t0 = performance.now() + 240, DUR = 2300;
    let feito = 0;
    const quadro = () => {
      const e = Math.min(1, Math.max(0, (performance.now() - t0) / DUR));
      const ate = Math.floor(N * e);
      if (ate > feito) { trilha.ate = ate; desenharMolho(item.id); if (ate % 60 < ate - feito) vibrar(3); }
      feito = ate;
      const [u, v] = ponto(e);
      posiciona(u, v, `rotate(${Math.sin(e * 40) * 1.5}deg)`);
      if (e < 1) requestAnimationFrame(quadro);
      else bis.animate([{ opacity: 1, translate: "0 0" }, { opacity: 0, translate: "70px -90px" }], { duration: 280, easing: "ease-in", fill: "forwards" }).onfinish = () => bis.remove();
    };
    requestAnimationFrame(quadro);
  }
  function limparMolho(item, animar) {
    const m = molhos[item.id];
    const zera = () => { m.trilhas = []; m.tela.getContext("2d").clearRect(0, 0, m.tela.width, m.tela.height); };
    if (!animar || calmo) return zera();
    const a = m.tela.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: "ease-in", fill: "forwards" });
    a.onfinish = () => { zera(); a.cancel(); };
  }

  /* ---- Pedaços: onde cada um cai ---- */
  const limite = item => 0.78 - 0.95 * item.tam;
  function folgaEm(u, v, item, novos) {
    let f = 9;
    for (const p of estado.pecas) {
      const d = Math.hypot(p.u - u, p.v - v) - (p.item.tam + item.tam) * (p.item === item ? 0.8 : 0.45);
      if (d < f) f = d;
    }
    for (const p of novos) { const d = Math.hypot(p.u - u, p.v - v) - 2 * item.tam * 0.8; if (d < f) f = d; }
    return f;
  }
  function girassol(n, item, giro) {
    const lim = limite(item), passo = lim * Math.sqrt(Math.PI / n), tremido = passo * 0.14, pts = [];
    for (let k = 0; k < n; k++) {
      const r = lim * Math.sqrt((k + 0.5) / n), a = 2 * Math.PI * ((k * 0.6180339887 + giro) % 1);
      let u = Math.cos(a) * r + (Math.random() - 0.5) * 2 * tremido, v = Math.sin(a) * r + (Math.random() - 0.5) * 2 * tremido;
      const d = Math.hypot(u, v);
      if (d > lim) { u = u / d * lim; v = v / d * lim; }
      pts.push({ u, v });
    }
    return pts;
  }
  /* ---- Vários sabores: geometria das fatias ----
     Fatia i de k começa no topo da pizza e segue no sentido horário. Coordenadas (u, v) como no resto
     do código: u = cos(a), v = sin(a), com v positivo para baixo. */
  const TAU = Math.PI * 2;
  const FRAC = { 1: "", 2: "½", 3: "⅓", 4: "¼" }, NOME_FRAC = { 2: "Metade", 3: "Terço", 4: "Quarto" };
  const geomSetor = (i, k) => ({ i: i, k: k, a0: -Math.PI / 2 + i * TAU / k, a1: -Math.PI / 2 + (i + 1) * TAU / k });
  const geomAtiva = () => geomSetor(estado.setorAtivo, estado.k);
  /* distância do ponto às duas bordas da fatia (em unidades do raio); sem fatias: infinito */
  function distBordas(u, v, g) {
    if (g.k === 1) return 9;
    const d = a => { const ex = Math.cos(a), ey = Math.sin(a); return (u * ex + v * ey) <= 0 ? Math.hypot(u, v) : Math.abs(u * ey - v * ex); };
    return Math.min(d(g.a0), d(g.a1));
  }
  function dentroDaCunha(u, v, g) {
    if (!g || g.k === 1) return true;
    let rel = (Math.atan2(v, u) - g.a0) % TAU;
    if (rel < 0) rel += TAU;
    return rel <= (g.a1 - g.a0);
  }
  /* percurso em arcos concentricos dentro da fatia (para bisnaga e frasco de azeite) */
  function varrerSetor(g, aneis, rMax, rMin) {
    const pts = [];
    for (let j = 0; j < aneis; j++) {
      const r = rMax - (rMax - rMin) * (aneis === 1 ? 0 : j / (aneis - 1));
      const m = Math.asin(Math.min(1, 0.07 / r));
      let a0 = g.a0 + m, a1 = g.a1 - m;
      if (a1 <= a0) a0 = a1 = (g.a0 + g.a1) / 2;
      const n = Math.max(2, Math.ceil((a1 - a0) / 0.04));
      for (let q = 0; q <= n; q++) { const f = q / n, a = j % 2 ? a1 - (a1 - a0) * f : a0 + (a1 - a0) * f; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    }
    return pts;
  }
  function pontoDaLista(pts) {
    const seg = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    return s => {
      let alvo = Math.min(1, Math.max(0, s)) * tot, i = 0;
      while (i < seg.length - 1 && alvo > seg[i]) { alvo -= seg[i]; i++; }
      const f = seg[i] ? Math.min(1, alvo / seg[i]) : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
    };
  }
  /* pedaços de um ingrediente dentro de UMA fatia, sem passar da borda e sem sobrepor o que já está lá */
  function lugaresSetor(n, item, g) {
    const lim = limite(item), margem = item.tam * 0.8 + 0.025, M = Math.max(260, n * 14), cand = [];
    for (let j = 0; j < M; j++) {
      const r = lim * Math.sqrt((j + 0.5) / M), a = g.a0 + (g.a1 - g.a0) * ((j * 0.6180339887 + Math.random() * 0.2) % 1);
      const u = Math.cos(a) * r, v = Math.sin(a) * r;
      if (distBordas(u, v, g) >= margem) cand.push({ u: u, v: v });
    }
    for (let j = cand.length - 1; j > 0; j--) { const q = Math.floor(Math.random() * (j + 1)); const t = cand[j]; cand[j] = cand[q]; cand[q] = t; }
    const alvoN = Math.max(2, Math.round(n / g.k)), esc = [];
    for (let c = 0; c < alvoN && cand.length; c++) {
      let melhor = 0, nota = -Infinity;
      for (let j = 0; j < cand.length; j++) {
        const f = Math.min(item.tam, folgaEm(cand[j].u, cand[j].v, item, esc));
        if (f > nota) { nota = f; melhor = j; }
      }
      esc.push(cand[melhor]); cand.splice(melhor, 1);
    }
    return esc;
  }
  function limparMolhoSetor(item, i) {
    if (estado.k === 1) return limparMolho(item, true);
    const m = molhos[item.id];
    m.trilhas = m.trilhas.filter(tr => tr.setor !== i);
    desenharMolho(item.id);
  }
  function limparQueijoSetor(i) {
    if (estado.k === 1) return limparQueijo(true);
    const t = queijo.tam;
    if (!t) return;
    const g = geomSetor(i, estado.k), m = t / 2;
    queijo.camadas.forEach(c => {
      const x = c.mascara.getContext("2d");
      x.save(); x.beginPath(); x.moveTo(m, m); x.arc(m, m, m * 0.95, g.a0, g.a1); x.closePath(); x.clip(); x.clearRect(0, 0, t, t); x.restore();
      desenharQueijo(c, true);
    });
  }
  /* esvazia uma fatia (peças, queijo, molhos e azeites dela) sem mexer nas outras */
  function limparSetor(i) {
    const st = estado.setores[i], antes = total("pizza");
    const sai = estado.pecas.filter(p => p.setor === i);
    estado.pecas = estado.pecas.filter(p => p.setor !== i);
    sai.forEach((p, idx) => {
      if (calmo) { p.el.remove(); return; }
      p.el.animate([{ transform: "translate(0, 0) scale(1)", opacity: 1 }, { transform: "translate(0, -18px) scale(0)", opacity: 0 }], { duration: 260, delay: 7 * idx, easing: "ease-in", fill: "forwards" }).onfinish = () => p.el.remove();
    });
    limparQueijoSetor(i);
    PIZZA.ingredientes.filter(x => x.molho).forEach(x => { if ((st.porcoes[x.id] || 0) > 0) limparMolhoSetor(x, i); });
    PIZZA.ingredientes.forEach(x => { st.porcoes[x.id] = 0; });
    st.sabor = null;
    if (i === estado.setorAtivo) PIZZA.ingredientes.forEach(x => marcar(x, 0));
    precificar("pizza", total("pizza") - antes);
  }
  function lugares(n, item) {
    if (estado.k > 1) return lugaresSetor(n, item, geomAtiva());
    let melhor = [], nota = -Infinity;
    for (let t = 0; t < 12; t++) {
      const pts = girassol(n, item, Math.random());
      const soma = pts.reduce((s, p) => s + Math.min(item.tam, folgaEm(p.u, p.v, item, [])), 0);
      if (soma > nota) { nota = soma; melhor = pts; }
    }
    return melhor;
  }
  let serie = 0;
  function lancar(item, alvo, de, atraso, jogado) {
    const l = item.tam, giro = 360 * Math.random(), esc = 0.88 + 0.24 * Math.random();
    const pc = document.createElement("div");
    pc.className = "pc pc-" + item.id;
    pc.style.left = `calc(${50 + 50 * alvo.u}% - ${50 * l}%)`;
    pc.style.top = `calc(${50 + 50 * alvo.v}% - ${50 * l}%)`;
    pc.style.width = `${100 * l}%`;
    const k = serie++;
    const src = item.graos ? `${IMG_PIZZA}t-${item.graos}-${k % 3}.webp` : arte(item, k);
    /* grãos: se o arquivo não estiver na pasta da pizza, tenta a da massa (mesmos arquivos t-grao-*) */
    const alt = item.graos ? ` onerror="this.onerror=null;this.src='${IMG_MASSA}t-${item.graos}-${k % 3}.webp'"`
      : ` onerror="this.onerror=null;this.src='${IMG_PIZZA}t-${item.arte || item.id}-0.webp'"`;
    pc.innerHTML = `<div class="pc-sh"></div><div class="pc-art"><img class="rw" src="${src}" alt=""${alt}><img class="ck${item.folha ? " ck-folha" : item.derrete ? " ck-creme" : ""}" src="${src}" alt=""${alt}></div>`;
    const sombra = pc.firstChild, art = pc.lastChild;
    art.style.transform = `rotate(${giro}deg) scale(${esc})`;
    cobertura.appendChild(pc);
    const peca = { el: pc, art, u: alvo.u, v: alvo.v, item, r: giro, sc: esc, setor: estado.setorAtivo };
    const derreter = () => {
      if (!pc.isConnected) return;
      const de0 = `rotate(${peca.r}deg) scale(${peca.sc})`;
      peca.sc *= 1.06;
      const para = `rotate(${peca.r}deg) scale(${peca.sc})`;
      art.style.transform = para;
      art.animate([{ transform: de0 }, { transform: para }], { duration: 900, easing: "cubic-bezier(.2,.8,.2,1)" });
    };
    estado.pecas.push(peca);
    if (!de || calmo) return peca;
    const g = roda(), s = escalaGiro();
    const bx = g.cx + alvo.u * g.R, by = g.cy + alvo.v * g.R;
    const dx = (de.x - bx) / s, dy = (de.y - by) / s, dist = Math.hypot(dx, dy);
    const dur = jogado ? 480 + Math.min(360, 0.8 * dist) + 120 * Math.random() : 300 + 90 * Math.random();
    const pulo = jogado ? Math.min(90, 26 + 0.24 * dist) : 16;
    const giro0 = giro - 50 + 100 * Math.random();
    const op = { duration: dur, delay: atraso, fill: "backwards" };
    pc.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], { ...op, easing: jogado ? "cubic-bezier(.22,.6,.3,1)" : "cubic-bezier(.3,.6,.4,1)" });
    art.animate([
      { transform: `translateY(0) rotate(${giro0}deg) scale(${1.5 * esc})` },
      { transform: `translateY(${-pulo}px) rotate(${(giro0 + giro) / 2}deg) scale(${1.55 * esc})`, offset: 0.42 },
      { transform: `translateY(0) rotate(${giro}deg) scale(${1.03 * esc})`, offset: 0.86 },
      { transform: `translateY(0) rotate(${giro}deg) scale(${esc})` },
    ], { ...op, easing: "ease-out" });
    sombra.animate([
      { opacity: 0, transform: "translate(8%, 12%) scale(.4)" },
      { opacity: 0.5, transform: `translate(30%, ${38 + pulo / 3}%) scale(.55)`, offset: 0.42 },
      { opacity: 0.8, transform: "translate(8%, 12%) scale(1)", offset: 0.8 },
      { opacity: 0, transform: "translate(8%, 12%) scale(1)" },
    ], { duration: dur, delay: atraso, easing: "ease-out" });
    if (item.derrete) setTimeout(derreter, atraso + dur + 80);
    return peca;
  }

  /* ---- Adicionar e tirar pizza ---- */
  /* Centro do botão do ingrediente; se ele está numa aba escondida, usa o centro da grade */
  function centroChip(item) {
    let r = item.chip.getBoundingClientRect();
    if (!r.width) r = $("#ingPizza").getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  let toques = 0;
  function adicionar(item) {
    if (estado.forno) return;
    const n = estado.porcoes[item.id];
    if (n >= MAX_PORCOES) { tremer(item); dizer("Duas porções é o máximo"); return; }
    const antesTotal = total("pizza");
    estado.porcoes[item.id] = n + 1;
    toques++;
    marcar(item, n + 1);
    precificar("pizza", total("pizza") - antesTotal);
    dizer(toques === 1 ? "Toque de novo para porção dupla" : n === 1 && item.camada ? "Queijo extra" : "");
    if (item.camada) { espiral(n, false, geomAtiva()); return; }
    if (item.fio) { azeitar(item, n, geomAtiva()); return; }
    if (item.molho) { bisnagar(item, n, geomAtiva()); return; }
    const de = centroChip(item);
    const passo = item.graos ? 30 : 34;
    lugares(item.n, item).forEach((p, k) => lancar(item, p, de, passo * k, true));
  }
  function tirar(item) {
    if (estado.forno) return;
    const n = estado.porcoes[item.id];
    if (!n) { item.chip.animate([{ transform: "rotate(0)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(0)" }], { duration: 300 }); return; }
    const antes = total("pizza");
    estado.porcoes[item.id] = 0;
    marcar(item, 0);
    precificar("pizza", total("pizza") - antes);
    vibrar(16);
    if (item.molho) { limparMolhoSetor(item, estado.setorAtivo); dizer(estado.pecas.length ? "" : "Toque num ingrediente para adicionar"); return; }
    if (item.camada) { limparQueijoSetor(estado.setorAtivo); dizer(estado.pecas.length ? "" : "Toque num ingrediente para adicionar"); return; }
    const alvo = centroChip(item);
    const g = roda(), s = escalaGiro();
    const sai = estado.pecas.filter(p => p.item === item && p.setor === estado.setorAtivo);
    estado.pecas = estado.pecas.filter(p => !(p.item === item && p.setor === estado.setorAtivo));
    sai.forEach((p, k) => {
      if (calmo) { p.el.remove(); return; }
      const bx = g.cx + p.u * g.R, by = g.cy + p.v * g.R;
      p.el.animate([{ transform: "translate(0, 0) scale(1)" }, { transform: `translate(${(alvo.x - bx) / s}px, ${(alvo.y - by) / s}px) scale(.35)` }], { duration: 520, delay: 26 * k, easing: "cubic-bezier(.5,0,.75,.3)", fill: "forwards" }).onfinish = () => p.el.remove();
      p.art.animate([
        { transform: `rotate(${p.r}deg) scale(${p.sc})` },
        { transform: `translateY(-44px) rotate(${p.r + 120}deg) scale(${1.4 * p.sc})`, offset: 0.35 },
        { transform: `rotate(${p.r + 230}deg) scale(${0.6 * p.sc})` },
      ], { duration: 520, delay: 26 * k, easing: "ease-in-out", fill: "forwards" });
    });
    setTimeout(() => item.chip.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 280, easing: "ease-out" }), 26 * sai.length + 460);
    if (!PIZZA.ingredientes.some(i => estado.porcoes[i.id])) dizer("Toque num ingrediente para adicionar");
  }

  PIZZA.ingredientes.forEach(item => chip(item, $("#ingPizza"), adicionar, tirar));

  /* ---- Pizza: abas de ingredientes, sabores prontos e vários sabores por pizza ---- */
  const ABAS_PIZZA = [["queijos", "Queijos"], ["carnes", "Carnes"], ["legumes", "Legumes"], ["extras", "Extras"], ["borda", "Borda"]];
  let abaPizza = "queijos", saborSeq = 0;
  const catDe = i => (ABAS_PIZZA.some(a => a[0] === i.cat) ? i.cat : "extras");
  const nomeIng = id => (PIZZA.ingredientes.find(i => i.id === id) || { nome: id }).nome.toLowerCase();
  const temIng = st => PIZZA.ingredientes.some(i => (st.porcoes[i.id] || 0) > 0);
  const saborDoSetor = i => { const st = estado.setores[i]; return st ? (SABORES.find(sb => sb.id === st.sabor) || null) : null; };
  const saborAtual = () => saborDoSetor(estado.setorAtivo);
  const nomeSetor = i => (estado.k === 1 ? "pizza" : NOME_FRAC[estado.k] + " " + (i + 1));
  const maxSabores = () => (PIZZA.tamanhos[estado.tam] || {}).sabores || 1;

  function mostrarAbaPizza() {
    PIZZA.ingredientes.forEach(i => { i.chip.style.display = catDe(i) === abaPizza ? "" : "none"; });
    $$(".ing-aba").forEach(b => {
      const on = b.dataset.cat === abaPizza;
      b.classList.toggle("ing-aba--ativa", on);
      b.setAttribute("aria-selected", String(on));
    });
    const pn = $("#bordaPanel");
    if (pn) pn.style.display = abaPizza === "borda" ? "" : "none";
  }
  function montarAbasPizza() {
    const nav = $("#ingAbas");
    nav.replaceChildren();
    const presentes = ABAS_PIZZA.filter(a => a[0] === "borda" ? BORDAS.length > 0 : PIZZA.ingredientes.some(i => catDe(i) === a[0]));
    if (!presentes.some(a => a[0] === abaPizza) && presentes.length) abaPizza = presentes[0][0];
    presentes.forEach(a => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "ing-aba"; b.dataset.cat = a[0]; b.setAttribute("role", "tab");
      b.innerHTML = a[1] + '<span class="ing-aba__n" hidden></span>';
      b.addEventListener("click", () => { abaPizza = a[0]; mostrarAbaPizza(); });
      nav.appendChild(b);
    });
    mostrarAbaPizza();
  }

  /* "Calabresa", "Calabresa + bacon, sem cebola": rótulo de UMA fatia, vai junto no pedido */
  function rotuloSetor(i) {
    const st = estado.setores[i], sb = saborDoSetor(i);
    if (!sb) return "";
    const mais = [], menos = [];
    PIZZA.ingredientes.forEach(x => {
      const base = sb.ings[x.id] || 0, atual = st.porcoes[x.id] || 0;
      if (atual > base) mais.push(nomeIng(x.id) + (base ? " extra" : ""));
      if (atual < base) menos.push(nomeIng(x.id));
    });
    let t = sb.nome;
    if (mais.length) t += " + " + mais.join(", ");
    if (menos.length) t += ", sem " + menos.join(", ");
    return t.slice(0, 80);
  }
  function rotuloSabor() {
    if (estado.k === 1) return rotuloSetor(0);
    return estado.setores.map((st, i) => FRAC[estado.k] + " " + (rotuloSetor(i) || "personalizado")).join(" | ").slice(0, 160);
  }
  function listaDoSetor(st) {
    return PIZZA.ingredientes.filter(i => (st.porcoes[i.id] || 0) > 0).map(i => i.nome.toLowerCase() + (st.porcoes[i.id] > 1 ? " ×" + st.porcoes[i.id] : "")).join(", ");
  }
  function descricaoMulti() {
    return `Pizza ${estado.tam} (${estado.k} sabores): ` + estado.setores.map((st, i) =>
      FRAC[estado.k] + " " + (rotuloSetor(i) || "personalizado") + " [" + (listaDoSetor(st) || "vazio") + "]").join("; ");
  }

  function renderSaborInfo() {
    const info = $("#saborInfo"), sb = saborAtual();
    $$("#sabores .sabor").forEach(b => b.setAttribute("aria-checked", String((b.dataset.sabor || "") === (sb ? sb.id : ""))));
    info.replaceChildren();
    info.hidden = !sb;
    if (!sb) return;
    const leva = document.createElement("p");
    const nome = document.createElement("b");
    nome.textContent = (estado.k > 1 ? FRAC[estado.k] + " " : "") + sb.nome;
    leva.appendChild(nome);
    leva.appendChild(document.createTextNode(" · molho de tomate, " + Object.entries(sb.ings).map(([id, q]) => nomeIng(id) + (q > 1 ? " ×" + q : "")).join(", ")));
    info.appendChild(leva);
    if (sb.opc.length) {
      const box = document.createElement("div");
      box.className = "sabor-opc";
      const rot = document.createElement("span");
      rot.textContent = "Opcionais:";
      box.appendChild(rot);
      sb.opc.forEach(id => {
        const it = PIZZA.ingredientes.find(i => i.id === id);
        if (!it) return;
        const extra = (estado.porcoes[id] || 0) > (sb.ings[id] || 0);
        const bt = document.createElement("button");
        bt.type = "button"; bt.className = "sabor-opc__b" + (extra ? " on" : "");
        bt.textContent = (extra ? "✓ " : "+ ") + it.nome.toLowerCase() + (it.preco ? " (" + reais(it.preco) + ")" : "");
        bt.addEventListener("click", () => { adicionar(it); soltarPedido("pizza"); });
        box.appendChild(bt);
      });
      info.appendChild(box);
    }
  }
  function atualizarPizzaUI() {
    $$(".ing-aba").forEach(b => {
      const n = b.dataset.cat === "borda" ? bordaIds().length
        : PIZZA.ingredientes.filter(i => catDe(i) === b.dataset.cat && (estado.porcoes[i.id] || 0) > 0).length;
      const sp = $(".ing-aba__n", b);
      if (sp) { sp.textContent = n || ""; sp.hidden = !n; }
    });
    renderSaborInfo();
    renderBordaResumo();
    if (estado.k > 1) renderSetoresUI();
  }

  /* ---- Fatias: quantidade de sabores, fatia ativa e cortes desenhados sobre a pizza ---- */
  const SVGNS = "http://www.w3.org/2000/svg";
  function desenharCortes() {
    let svg = $("#pizzaCortes");
    if (!svg) {
      svg = document.createElementNS(SVGNS, "svg");
      svg.id = "pizzaCortes"; svg.setAttribute("class", "pizza__cortes"); svg.setAttribute("viewBox", "-1 -1 2 2"); svg.setAttribute("aria-hidden", "true");
      giroEl.appendChild(svg);
    }
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.style.display = estado.k > 1 ? "" : "none";
    if (estado.k === 1) return;
    const R = 0.97;
    const add = (tag, attrs) => { const n = document.createElementNS(SVGNS, tag); Object.keys(attrs).forEach(a => n.setAttribute(a, attrs[a])); svg.appendChild(n); return n; };
    const ga = geomSetor(estado.setorAtivo, estado.k);
    add("path", { d: `M0 0 L${Math.cos(ga.a0) * R} ${Math.sin(ga.a0) * R} A${R} ${R} 0 ${ga.a1 - ga.a0 >= Math.PI ? 1 : 0} 1 ${Math.cos(ga.a1) * R} ${Math.sin(ga.a1) * R} Z`, "class": "pizza__cunha" });
    for (let i = 0; i < estado.k; i++) { const g = geomSetor(i, estado.k); add("line", { x1: 0, y1: 0, x2: Math.cos(g.a0) * R, y2: Math.sin(g.a0) * R, "class": "pizza__corte" }); }
    estado.setores.forEach((st, i) => {
      if (temIng(st)) return;           /* o número só aparece nas fatias ainda vazias */
      const g = geomSetor(i, estado.k), am = (g.a0 + g.a1) / 2, cx = Math.cos(am) * 0.5, cy = Math.sin(am) * 0.5;
      add("circle", { cx: cx, cy: cy, r: 0.11, "class": "pizza__num-fundo" });
      add("text", { x: cx, y: cy, "class": "pizza__num" }).textContent = String(i + 1);
    });
  }
  function usarSetor(i) {
    estado.setorAtivo = i;
    estado.porcoes = estado.setores[i].porcoes;
    PIZZA.ingredientes.forEach(it => marcar(it, estado.porcoes[it.id] || 0));
    atualizarPizzaUI();
  }
  function selecionarSetor(i) {
    if (i === estado.setorAtivo || estado.ocupado || estado.forno === "assando") return;
    usarSetor(i);
    renderSetoresUI();
    const sb = saborDoSetor(i);
    dizer("Editando a " + nomeSetor(i).toLowerCase() + (sb ? ": " + sb.nome : ": escolha o sabor"));
  }
  function definirK(n) {
    if (n === estado.k) return true;
    if (estado.ocupado || estado.forno === "assando") return false;
    const tem = estado.setores.some(temIng);
    if (tem && !window.confirm("Mudar a quantidade de sabores limpa a pizza. Continuar?")) return false;
    if (tem || estado.forno) limparPizzaMantendoBorda();
    estado.k = n;
    estado.setores = Array.from({ length: n }, () => ({ sabor: null, porcoes: Object.fromEntries(PIZZA.ingredientes.map(i => [i.id, 0])) }));
    usarSetor(0);
    renderSetoresUI();
    soltarPedido("pizza");
    precificar("pizza");
    dizer(n > 1 ? "Escolha o sabor da " + nomeSetor(0).toLowerCase() : "Toque num ingrediente para adicionar");
    return true;
  }
  function renderSetoresUI() {
    const box = $("#saboresQtd"), max = maxSabores();
    box.replaceChildren();
    box.hidden = max <= 1;
    if (max > 1) {
      const rot = document.createElement("span");
      rot.className = "qtd-rot"; rot.textContent = "Sabores:";
      box.appendChild(rot);
      for (let n = 1; n <= max; n++) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "qtd"; b.textContent = String(n); b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", String(n === estado.k)); b.setAttribute("aria-label", n + (n > 1 ? " sabores" : " sabor"));
        b.addEventListener("click", () => definirK(n));
        box.appendChild(b);
      }
      if (estado.k > 1) estado.setores.forEach((st, i) => {
        const sb = saborDoSetor(i), b = document.createElement("button");
        b.type = "button";
        b.className = "setor" + (i === estado.setorAtivo ? " setor--ativo" : "") + (!temIng(st) ? " setor--vazio" : "");
        b.textContent = FRAC[estado.k] + " " + (sb ? sb.nome : temIng(st) ? "personalizado" : "escolher sabor");
        b.setAttribute("aria-pressed", String(i === estado.setorAtivo));
        b.addEventListener("click", () => selecionarSetor(i));
        box.appendChild(b);
      });
    }
    desenharCortes();
  }
  /* tocar numa fatia da pizza também seleciona a fatia */
  pizzaEl.addEventListener("click", e => {
    if (estado.k < 2 || estado.forno || estado.ocupado) return;
    const g = roda(), dx = e.clientX - g.cx, dy = e.clientY - g.cy, d = Math.hypot(dx, dy);
    if (d > g.R * 0.98 || d < 4) return;
    const rel = (((Math.atan2(dy, dx) + Math.PI / 2) % TAU) + TAU) % TAU;
    selecionarSetor(Math.min(estado.k - 1, Math.floor(rel / (TAU / estado.k))));
  });

  /* Escolher um sabor: esvazia a fatia ativa e joga os ingredientes dele, um a um, com as animações de sempre */
  function aplicarSabor(sb) {
    if (estado.forno === "assando" || estado.ocupado) return;
    const meu = ++saborSeq, i = estado.setorAtivo, st = estado.setores[i];
    const reset = temIng(st) || !!estado.forno;
    if (reset) {
      if (estado.k === 1 || estado.forno) limparPizzaMantendoBorda(); else limparSetor(i);
      if (estado.setorAtivo !== i) usarSetor(i);
    }
    if (!sb) { st.sabor = null; renderSetoresUI(); atualizarPizzaUI(); return; }
    st.sabor = sb.id;
    estado.ocupado = true;
    renderSetoresUI();
    atualizarPizzaUI();
    let t = reset ? 420 : 60;
    Object.entries(sb.ings).forEach(([id, q]) => {
      const it = PIZZA.ingredientes.find(x => x.id === id);
      for (let c = 0; c < q; c++) { setTimeout(() => { if (meu === saborSeq && it) adicionar(it); }, t); t += 520; }
    });
    setTimeout(() => {
      if (meu !== saborSeq) return;
      estado.ocupado = false;
      soltarPedido("pizza");
      const prox = estado.k > 1 ? estado.setores.findIndex((s2, j) => j !== i && !temIng(s2)) : -1;
      if (prox >= 0) { usarSetor(prox); renderSetoresUI(); dizer("Agora escolha o sabor da " + nomeSetor(prox).toLowerCase()); }
      else dizer(sb.nome + ": toque nos ingredientes para ajustar");
    }, t + 200);
  }
  function montarSabores() {
    const box = $("#sabores");
    box.replaceChildren();
    const pilula = (id, texto) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "sabor"; b.dataset.sabor = id; b.textContent = texto; b.setAttribute("role", "radio");
      b.addEventListener("click", () => {
        const sb = SABORES.find(x => x.id === id) || null;
        if (!sb && !saborAtual()) return;      /* "Do zero" sem sabor escolhido: não apaga o que o cliente montou */
        aplicarSabor(sb);
      });
      box.appendChild(b);
    };
    pilula("", "Do zero");
    SABORES.forEach(sb => pilula(sb.id, sb.nome));
    box.style.display = SABORES.length ? "" : "none";
    renderSaborInfo();
  }

  /* ---- Borda recheada: escolha, painel, resumo e anel desenhado em volta da pizza ---- */
  const nomeBorda = id => (BORDAS.find(b => b.id === id) || { nome: id }).nome;
  function bordaIds() {
    const b = estado.borda, ids = b.lados.slice(0, b.n).filter(Boolean);
    return ids.length === 2 && ids[0] === ids[1] ? [ids[0]] : ids;
  }
  function precoBordaIds(ids) {
    return Array.isArray(ids) && ids.length ? Math.max(...ids.map(id => (BORDAS.find(b => b.id === id) || { preco: 0 }).preco)) : 0;   /* 2 sabores: cobra o mais caro */
  }
  function bordaCompleta() {
    const b = estado.borda, n = b.lados.slice(0, b.n).filter(Boolean).length;
    return n === 0 || n === b.n;
  }
  function textoBorda() {
    const b = estado.borda, ids = bordaIds();
    if (!ids.length) return "";
    if (ids.length === 1) return " + borda de " + nomeBorda(ids[0]).toLowerCase();
    return " + borda ½ " + nomeBorda(b.lados[0]).toLowerCase() + " + ½ " + nomeBorda(b.lados[1]).toLowerCase();
  }
  function limparPizzaMantendoBorda() {
    estado.manterBorda = true;
    try { montarOutra(); } finally { estado.manterBorda = false; }
  }
  /* trocou para um tamanho que aceita menos sabores de borda: junta tudo num sabor só */
  function ajustarBordaAoTamanho() {
    const b = estado.borda;
    if (b.n > bordaMax(estado.tam)) {
      b.lados[0] = b.lados[0] || b.lados[1]; b.lados[1] = null; b.n = 1; b.ativa = 0;
      desenharBorda(false);
    }
    renderBordaPanel();
    atualizarPizzaUI();
  }
  function ladoAtivo() { return estado.borda.n > 1 ? estado.borda.ativa : 0; }
  function escolherBorda(id) {
    if (estado.forno || estado.ocupado) return;
    const b = estado.borda, antes = total("pizza"), lado = ladoAtivo();
    if (id === null) { b.lados = [null, null]; b.ativa = 0; }
    else if (b.lados[lado] === id) b.lados[lado] = null;           /* tocar de novo tira */
    else b.lados[lado] = id;
    if (b.n > 1 && id !== null && b.lados[lado] === id && !b.lados[1 - lado]) b.ativa = 1 - lado;
    desenharBorda(true, id !== null && b.lados[lado] === id ? lado : -1);
    renderBordaPanel();
    atualizarPizzaUI();
    soltarPedido("pizza");
    precificar("pizza", total("pizza") - antes);
    vibrar(8);
    const ids = bordaIds();
    if (!ids.length) dizer("Sem borda recheada");
    else if (!bordaCompleta()) dizer("Agora escolha o sabor da outra metade da borda");
    else dizer("Borda recheada" + textoBorda().replace(" + borda", "").replace(/^ de /, " de "));
  }
  function definirBordaN(n) {
    const b = estado.borda;
    if (estado.forno || estado.ocupado || n === b.n) return;
    const antes = total("pizza");
    if (n === 1) { b.lados[0] = b.lados[b.ativa] || b.lados[0] || b.lados[1]; b.lados[1] = null; b.ativa = 0; }
    b.n = n;
    if (n === 2) b.ativa = b.lados[0] ? 1 : 0;
    desenharBorda(false);
    renderBordaPanel();
    atualizarPizzaUI();
    precificar("pizza", total("pizza") - antes);
  }
  function selecionarLadoBorda(i) {
    if (estado.forno || estado.ocupado) return;
    estado.borda.ativa = i;
    renderBordaPanel();
  }
  function renderBordaPanel() {
    let pn = $("#bordaPanel");
    if (!pn) { pn = document.createElement("div"); pn.id = "bordaPanel"; pn.className = "borda-panel"; $("#ingPizza").appendChild(pn); }
    pn.style.display = abaPizza === "borda" ? "" : "none";
    pn.replaceChildren();
    if (!BORDAS.length) return;
    const b = estado.borda, max = bordaMax(estado.tam), mk = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
    const topo = mk("div", "borda-topo");
    topo.appendChild(mk("span", "qtd-rot", "Borda recheada" + (max > 1 ? ": sabores" : "")));
    if (max > 1) {
      for (let n = 1; n <= max; n++) {
        const bt = mk("button", "qtd", String(n)); bt.type = "button"; bt.setAttribute("role", "radio");
        bt.setAttribute("aria-checked", String(n === b.n)); bt.setAttribute("aria-label", n + (n > 1 ? " sabores de borda" : " sabor de borda"));
        bt.addEventListener("click", () => definirBordaN(n));
        topo.appendChild(bt);
      }
      if (b.n > 1) for (let i = 0; i < b.n; i++) {
        const id = b.lados[i], bt = mk("button", "setor" + (i === b.ativa ? " setor--ativo" : "") + (!id ? " setor--vazio" : ""), "½ " + (id ? nomeBorda(id) : "escolher")); bt.type = "button";
        bt.setAttribute("aria-pressed", String(i === b.ativa));
        bt.addEventListener("click", () => selecionarLadoBorda(i));
        topo.appendChild(bt);
      }
    }
    pn.appendChild(topo);
    const grade = mk("div", "borda-ops"), lado = ladoAtivo();
    const sem = mk("button", "borda-op" + (!b.lados.slice(0, b.n).some(Boolean) ? " on" : "")); sem.type = "button";
    sem.appendChild(mk("span", "borda-cor borda-cor--sem", "∅"));
    const st = mk("span", null); st.appendChild(document.createTextNode("Sem borda")); st.appendChild(mk("small", null, "incluso"));
    sem.appendChild(st); sem.addEventListener("click", () => escolherBorda(null));
    grade.appendChild(sem);
    BORDAS.forEach(bd => {
      const on = b.lados[lado] === bd.id, bt = mk("button", "borda-op" + (on ? " on" : "")); bt.type = "button";
      bt.setAttribute("aria-pressed", String(on)); bt.setAttribute("aria-label", "Borda de " + bd.nome + ", mais " + reais(bd.preco));
      const cor = mk("span", "borda-cor"); cor.style.background = bd.cor;
      bt.appendChild(cor);
      const tx = mk("span", null); tx.appendChild(document.createTextNode(bd.nome)); tx.appendChild(mk("small", null, "+ " + reais(bd.preco)));
      bt.appendChild(tx);
      bt.addEventListener("click", () => escolherBorda(bd.id));
      grade.appendChild(bt);
    });
    pn.appendChild(grade);
  }
  /* linha fixa: o cliente sempre vê se a borda entrou e quanto custa, em qualquer aba */
  function renderBordaResumo() {
    let r = $("#bordaResumo");
    if (!r) { r = document.createElement("p"); r.id = "bordaResumo"; r.className = "borda-resumo"; $("#saborInfo").insertAdjacentElement("afterend", r); }
    const ids = bordaIds();
    r.replaceChildren();
    r.hidden = !ids.length;
    if (!ids.length) return;
    r.appendChild(document.createTextNode("Borda recheada: "));
    const b = estado.borda, partes = ids.length === 1 ? [[ids[0], ""]] : [[b.lados[0], "½ "], [b.lados[1], "½ "]];
    partes.forEach((p, k) => {
      if (!p[0]) return;
      if (k) r.appendChild(document.createTextNode(" + "));
      const bd = BORDAS.find(x => x.id === p[0]);
      const dot = document.createElement("span"); dot.className = "borda-cor"; dot.style.background = bd ? bd.cor : "#ccc";
      r.appendChild(dot);
      r.appendChild(document.createTextNode(" " + p[1] + nomeBorda(p[0])));
    });
    r.appendChild(document.createTextNode(" · + " + reais(precoBordaIds(ids))));
  }
  /* anel em volta da pizza: uma cor por metade, desenhado como um traço que percorre a borda */
  function desenharBorda(animar, ladoAnim) {
    let svg = $("#pizzaBorda");
    if (!svg) {
      svg = document.createElementNS(SVGNS, "svg");
      svg.id = "pizzaBorda"; svg.setAttribute("class", "pizza__borda"); svg.setAttribute("viewBox", "-1 -1 2 2"); svg.setAttribute("aria-hidden", "true");
      giroEl.appendChild(svg);
    }
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const b = estado.borda, R = BORDA_GEO.r, W = BORDA_GEO.w, novos = [];
    for (let i = 0; i < b.n; i++) {
      const bd = BORDAS.find(x => x.id === b.lados[i]);
      if (!bd) continue;
      const g = geomSetor(i, b.n);
      const camada = (r, larg, cor, extra) => {
        let el;
        if (b.n === 1) {
          el = document.createElementNS(SVGNS, "circle");
          el.setAttribute("cx", 0); el.setAttribute("cy", 0); el.setAttribute("r", r); el.setAttribute("transform", "rotate(-90)");
        } else {
          el = document.createElementNS(SVGNS, "path");
          el.setAttribute("d", `M${Math.cos(g.a0) * r} ${Math.sin(g.a0) * r} A${r} ${r} 0 0 1 ${Math.cos(g.a1) * r} ${Math.sin(g.a1) * r}`);
        }
        el.setAttribute("fill", "none"); el.setAttribute("stroke", cor); el.setAttribute("stroke-width", larg);
        el.setAttribute("pathLength", "1"); el.setAttribute("stroke-dasharray", "1 1");
        if (extra) Object.keys(extra).forEach(k => el.setAttribute(k, extra[k]));
        svg.appendChild(el);
        if (i === ladoAnim) novos.push(el);
        return el;
      };
      camada(R, W * 1.14, bd.sombra, { transform: (b.n === 1 ? "rotate(-90) " : "") + "translate(0.012 0.02)" });
      camada(R, W, bd.cor);
      camada(R + W * 0.2, W * 0.22, bd.brilho, { opacity: ".55" });
      camada(R - W * 0.36, W * 0.12, "rgba(0,0,0,.14)");
    }
    if (animar && !calmo) novos.forEach((el, k) => el.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 950, delay: Math.floor(k / 4) * 40, easing: "cubic-bezier(.3,.6,.3,1)", fill: "backwards" }));
  }
  function bordaAssada(on) {
    const svg = $("#pizzaBorda");
    if (svg) svg.classList.toggle("pizza__borda--assada", !!on);
  }
  montarAbasPizza();
  montarSabores();
  /* tamanhos que não estão no cardápio somem; o resto começa no tamanho padrão */
  $$(".tamanhos button").forEach(b => {
    if (!PIZZA.tamanhos[b.dataset.tam]) b.style.display = "none";
    b.setAttribute("aria-checked", String(b.dataset.tam === estado.tam));
  });
  giroEl.style.transform = `scale(${escalaGiro()})`;
  renderSetoresUI();
  desenharBorda(false);
  renderBordaPanel();
  atualizarPizzaUI();

  /* ---- Pizza: tamanho ---- */
  $$(".tamanhos button").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.tam === estado.tam || estado.forno || estado.ocupado) return;
    const novoMax = PIZZA.tamanhos[b.dataset.tam].sabores || 1;
    if (estado.k > novoMax && !definirK(novoMax)) return;   /* cabem menos sabores: limpa a pizza (com confirmação) */
    estado.mexeu = true;
    const antes = total("pizza");
    const cresce = PIZZA.tamanhos[b.dataset.tam].escala > escalaGiro();
    estado.tam = b.dataset.tam;
    ajustarBordaAoTamanho();
    $$(".tamanhos button").forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false"));
    const k = escalaGiro();
    giroEl.style.transform = `scale(${k})`;
    if (!calmo) giroEl.animate([{ transform: `scale(${k * (cresce ? 0.92 : 1.07)})` }, { transform: `scale(${k * (cresce ? 1.03 : 0.98)})`, offset: 0.6 }, { transform: `scale(${k})` }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    vibrar(6);
    soltarPedido("pizza");
    precificar("pizza", total("pizza") - antes);
    renderSetoresUI();
  }));

  /* ---- Pizza: o forno ---- */
  const fornoEl = $("#forno"), fornoVid = $("#fornoVid"), fogoVid = $("#fogoVid"), brilho = $("#brilho");
  const calor = $("#calor"), anel = $("#anel"), assadaEl = $("#assada"), appEl = $("#appPizza"), barraForno = $("#barra-pizza");
  const tocar = v => { try { v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(() => { }); } catch (e) { } };
  function assar() {
    if (estado.forno === "assando") return;
    if (estado.forno === "assada") {
      UI.pizza.pedir.animate([{ transform: "scale(1)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 260 });
      vibrar(12);
      return entregar("pizza");
    }
    const fatiaVazia = estado.setores.findIndex(st => !PIZZA.ingredientes.some(i => (st.porcoes[i.id] || 0) > 0));
    if (fatiaVazia >= 0) {
      UI.pizza.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
      if (estado.k > 1) { selecionarSetor(fatiaVazia); dizer("Escolha o sabor da " + nomeSetor(fatiaVazia).toLowerCase()); }
      else dizer("Coloque um ingrediente primeiro");
      vibrar([8, 30, 8]);
      return;
    }
    if (!bordaCompleta()) {
      UI.pizza.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
      abaPizza = "borda"; mostrarAbaPizza(); renderBordaPanel();
      dizer("Escolha o sabor da outra metade da borda");
      vibrar([8, 30, 8]);
      return;
    }
    estado.forno = "assando";
    bordaAssada(true);
    appEl.classList.add("assando");
    UI.pizza.comanda.hidden = true;
    UI.pizza.texto.textContent = "Assando a 480°";
    const k = 0.74, D = Math.round(3400 * k);
    if (calmo) {
      assadaEl.style.opacity = "1";
      queijo.camadas.forEach(c => { c.telaD.style.opacity = "1"; c.tela.style.opacity = "0"; });
      estado.pecas.forEach(p => { $(".ck", p.art).style.opacity = "1"; $(".rw", p.art).style.opacity = "0"; });
      return setTimeout(fimDoForno, 300);
    }
    tocar(fornoVid); tocar(fogoVid);
    const t = { duration: D, easing: "ease-in-out" };
    fornoEl.animate([{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 1, offset: 0.78 }, { opacity: 0 }], t);
    fogoVid.animate([{ opacity: 0 }, { opacity: 0.85, offset: 0.2 }, { opacity: 0.85, offset: 0.8 }, { opacity: 0 }], t);
    calor.animate([{ opacity: 0 }, { opacity: 1, offset: 0.22 }, { opacity: 0.72, offset: 0.5 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], t);
    anel.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], t);
    brilho.animate([{ opacity: 0 }, { opacity: 0.7, offset: 0.2 }, { opacity: 0.45, offset: 0.45 }, { opacity: 0.7, offset: 0.65 }, { opacity: 0 }], t);
    barraForno.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: D - 300, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    assadaEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2600 * k, delay: 300 * k, easing: "ease-in", fill: "forwards" });
    Object.values(molhos).forEach(m => m.tela.animate([{ filter: "none" }, { filter: "sepia(.4) saturate(1.25) brightness(.94)" }], { duration: 1500 * k, delay: 700 * k, easing: "ease-in-out", fill: "forwards" }));
    queijo.camadas.forEach(c => {
      c.telaD.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 2200 * k, delay: 500 * k, easing: "ease-in-out", fill: "forwards" });
      c.tela.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1600 * k, delay: 1300 * k, easing: "ease-in", fill: "forwards" });
    });
    estado.pecas.forEach(p => {
      const ck = $(".ck", p.art), rw = $(".rw", p.art);
      const ini = (350 + (p.v + 1) / 2 * 1100 + 250 * Math.random()) * k, dur = (900 + 300 * Math.random()) * k;
      ck.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay: ini, easing: "ease-in-out", fill: "forwards" });
      rw.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, delay: ini + 0.35 * dur, easing: "ease-in", fill: "forwards" });
    });
    for (let i = 0; i < 64; i++) setTimeout(() => {
      const f = document.createElement("i");
      f.className = "faisca";
      const tam = 5 + 10 * Math.random();
      f.style.width = f.style.height = tam + "px";
      f.style.left = 6 + 88 * Math.random() + "%";
      f.style.top = 60 + 36 * Math.random() + "%";
      pizzaEl.appendChild(f);
      const dx = (Math.random() - 0.5) * 90, sobe = 160 + 260 * Math.random();
      f.animate([
        { transform: "translate(0, 0) scale(1)", opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: `translate(${0.5 * dx}px, ${-0.55 * sobe}px) scale(.8)`, opacity: 0.9, offset: 0.55 },
        { transform: `translate(${dx}px, ${-sobe}px) scale(.2)`, opacity: 0 },
      ], { duration: 1300 + 900 * Math.random(), easing: "cubic-bezier(.2,.6,.4,1)" }).onfinish = () => f.remove();
    }, (120 + 44 * i) * k);
    dizer("Forno a lenha, 90 segundos");
    vibrar([6, 60, 6, 60, 6]);
    setTimeout(fimDoForno, D + 100);
  }
  function fimDoForno() {
    estado.forno = "assada";
    appEl.classList.remove("assando");
    appEl.classList.add("assada");
    barraForno.getAnimations().forEach(a => a.cancel());
    try { fornoVid.pause(); fogoVid.pause(); } catch (e) { }
    vibrar([10, 40, 10]);
    entregar("pizza");
    dizer("Feita no fogo.", montarOutra, "Montar outra");
  }
  function montarOutra() {
    saborSeq++; estado.ocupado = false;
    estado.mexeu = true;
    estado.pecas.forEach((p, i) => {
      p.el.animate([{ transform: "translate(0, 0) scale(1)", opacity: 1 }, { transform: "translate(0, -18px) scale(0)", opacity: 0 }], { duration: 260, delay: 7 * i, easing: "ease-in", fill: "forwards" }).onfinish = () => p.el.remove();
    });
    estado.pecas = [];
    toques = 0;
    estado.setores.forEach(st => { PIZZA.ingredientes.forEach(i => { st.porcoes[i.id] = 0; }); st.sabor = null; });
    usarSetor(0);   /* volta à 1ª fatia e limpa os selos dos botões */
    estado.forno = null;
    appEl.classList.remove("assada", "assando");
    [assadaEl, fornoEl, fogoVid, calor, anel, brilho, ...queijo.camadas.flatMap(c => [c.tela, c.telaD]), ...Object.values(molhos).map(m => m.tela)].forEach(e => e.getAnimations().forEach(a => a.cancel()));
    queijo.camadas.forEach(c => { c.tela.style.opacity = ""; c.telaD.style.opacity = ""; });
    assadaEl.style.opacity = "";
    limparQueijo(false);
    PIZZA.ingredientes.filter(i => i.molho).forEach(i => limparMolho(i, false));
    $$(".faisca", pizzaEl).forEach(f => f.remove());
    UI.pizza.comanda.hidden = true;
    soltarPedido("pizza");
    precificar("pizza");
    if (!estado.manterBorda) estado.borda = { n: 1, lados: [null, null], ativa: 0 };
    bordaAssada(false);
    desenharBorda(false);
    renderBordaPanel();
    renderSetoresUI();
    atualizarPizzaUI();
    dizer("Toque num ingrediente para adicionar");
  }
  LANCHE.camadas.filter(c => !c.fixo).forEach(c => {
    c.mini = IMG_HAMBURGER + c.img + ".webp";
    chip(c, $("#ingLanche"), item => {
      const n = estado.lanche.get(item.id) || 0;
      if (n >= item.max) {
        tremer(item);
        dizer(item.max > 1 ? tx("{nome} vai até {max}x", { nome: item.nome, max: item.max }) : "Já está no lanche", null, null, "lanche");
        return;
      }
      if (totalCamadas() >= MAX_CAMADAS) {
        tremer(item);
        dizer("Esse já não cabe na boca", null, null, "lanche");
        return;
      }
      estado.lanche.set(item.id, n + 1);
      marcar(item, n + 1);
      precificar("lanche", item.preco);
      soltarPedido("lanche");
      vibrar(6);
      dizer(item.molho ? item.nome : n === 0 ? "" : `${item.nome} ×${n + 1}`, null, null, "lanche");
      entregas = entregas.then(() => entregar1(item));
    }, item => {
      const n = estado.lanche.get(item.id) || 0;
      if (!n) return item.chip.animate([{ transform: "rotate(0)" }, { transform: "rotate(-6deg)" }, { transform: "rotate(6deg)" }, { transform: "rotate(0)" }], { duration: 300 });
      estado.lanche.delete(item.id);
      naPilha.delete(item.id);
      marcar(item, 0);
      empilhar({ id: item.id, botao: item.chip });
      precificar("lanche", -item.preco * n);
      soltarPedido("lanche");
      vibrar(16);
    }, "lanche");
    marcar(c, estado.lanche.get(c.id) || 0);
  });
  /* ================================================================
     MASSAS — stepper 4 etapas
     ================================================================ */
  const massaConteudo = $("#massaConteudo");
  const massaEl = $("#massa");
  const massaMolhoImg = $("#massaMolhoImg");
  const massaTipoImg = $("#massaTipoImg");
  const massaQueijoCanvas = $("#massaQueijoCanvas");
  const massaQueijoWrapper = $("#massaQueijoWrapper");
  const massaPanela = $("#massaPanela");
  const massaPratoFinal = $("#massaPratoFinal");
  const massaPratoFinalImg = $("#massaPratoFinalImg");

  let massaEtapa = 1;
  let massaMolhoSel = null;
  let massaTipoSel = null;
  const massaHist = []; /* ingredientes adicionados na etapa 1, para "Desfazer" */

  /* Trilhas de queijo depositado na frigideira de massa */
  const massaQueijoTrilhas = [];
  const massaQueijoCtx = massaQueijoCanvas.getContext("2d");
  let massaQueijoTamanho = 0;

  const MOLHOS_MASSA = [
    { id: "bolonhesa", nome: "Bolonhesa", img: "molho-bolonhesa.webp", tex: "tex-bolonhesa.webp" },
    { id: "sugo", nome: "Sugo", img: "molho-sugo.webp", tex: "tex-sugo.webp" },
    { id: "branco", nome: "Molho branco", img: "molho-branco.webp", tex: "tex-branco.webp" },
    { id: "rose", nome: "Rosé", img: "molho-rose.webp", tex: "tex-rose.webp" },
    { id: "3queijos", nome: "4 queijos", img: "molho-3queijos.webp", tex: "tex-3queijos.webp" },
    { id: "alhoeoleo", nome: "Alho e Óleo", img: "molho-alhoeoleo.webp", tex: "tex-alhoeoleo.webp" },
  ];
  const TIPOS_MASSA = [
    { id: "espaguete", nome: "Espaguete", img: "massa-espaguete.webp" },
    { id: "penne", nome: "Penne", img: "massa-penne.webp" },
    { id: "parafuso", nome: "Parafuso", img: "massa-parafuso.webp" },
    { id: "talharim", nome: "Talharim", img: "massa-talharim.webp" },
  ];
  const FINALIZACOES = [
    { id: "queijo-fin", nome: "Muçarela extra", img: "queijo.webp", pasta: "massas", preco: 3 },
    { id: "catupiry-fin", nome: "Catupiry", arte: "catupiry", pasta: "pizza", preco: 5 },
    { id: "cheddar-fin", nome: "Cheddar", arte: "cheddar", pasta: "pizza", preco: 5 },
  ];
  aplicarLista(FINALIZACOES, "massa.finalizacao", { preco: true });
  aplicarLista(MOLHOS_MASSA, "massa.molho", {});
  aplicarLista(TIPOS_MASSA, "massa.tipo", {});

  /* ---- Atualiza o stepper visual ---- */
  function atualizarStepper(etapa) {
    if (etapa < 4) desfazerPratoFinal();
    massaEtapa = etapa;
    $$("#massaStepper .massa__step").forEach(el => {
      const n = Number(el.dataset.etapa);
      el.classList.toggle("massa__step--active", n === etapa);
      el.classList.toggle("massa__step--done", n < etapa);
    });
    const titulos = ["", "Escolha o recheio", "Escolha o molho", "Tipo de massa", "Finalizar o prato"];
    const subs = ["", "Coloque quantos quiser · 2 toques é dupla", "Toque no molho para adicionar", "Escolha o formato da massa", "Adicione os toques finais"];
    $("#massaTitulo").textContent = titulos[etapa];
    $("#massaSub").textContent = subs[etapa];
    $("#massaEtapa1").hidden = etapa !== 1;
    $("#massaEtapa2").hidden = etapa !== 2;
    $("#massaEtapa3").hidden = etapa !== 3;
    $("#massaEtapa4").hidden = etapa !== 4;
    const ui = UI.massa;
    const textos = ["", "Próximo: molho →", "Próximo: massa →", "Próximo: finalizar →", "Adicionar ao pedido"];
    ui.texto.textContent = textos[etapa];
    ui.pedir.classList.remove("ok");
  }

  /* ---- Animação da concha (ladle) derramando molho ---- */
  function derramarMolho(molho, pronto) {
    if (!massaEl) { pronto && pronto(); return; }
    /* usa a textura tex-* como camada na frigideira; fallback para molho-*.webp */
    var texSrc = IMG_MASSA + (molho.tex || molho.img);
    /* cancela fade anterior para poder trocar o molho */
    massaMolhoImg.getAnimations().forEach(function (a) { a.cancel(); });
    massaMolhoImg.src = texSrc;
    massaMolhoImg.hidden = false;
    massaMolhoImg.style.opacity = "0";
    if (calmo) { massaMolhoImg.style.opacity = "1"; pronto && pronto(); return; }
    const concha = imgFixa(IMG_MASSA + "ferr-concha.webp", "ferramenta");
    const rMassa = massaEl.getBoundingClientRect();
    const cx = rMassa.left + rMassa.width * 0.5;
    const cy = rMassa.top + rMassa.height * 0.42;
    const ini = { x: rMassa.right + 60, y: rMassa.top - 60 };
    const ctl = { x: (ini.x + cx) / 2, y: ini.y - 40 };
    const larg = 120;
    const CONCHA_AX = 0.25, CONCHA_AY = 0.85;
    const t0 = performance.now(), D = 700;
    let anguloCircular = 0;
    const ir = () => {
      const t = Math.min(1, (performance.now() - t0) / D), e = suave(t);
      const x = curva(ini.x, ctl.x, cx, e), y = curva(ini.y, ctl.y, cy, e);
      concha.style.width = larg + "px";
      /* Movimento circular da concha antes de derramar o molho */
      anguloCircular = e * Math.PI * 2;
      const offsetX = Math.cos(anguloCircular) * 15;
      const offsetY = Math.sin(anguloCircular) * 10;
      concha.style.transform = `translate(${(x - CONCHA_AX * larg + offsetX).toFixed(1)}px,${(y - CONCHA_AY * larg * 0.6 + offsetY).toFixed(1)}px) rotate(${-30 + e * 50}deg)`;
      if (t < 1) return requestAnimationFrame(ir);
      massaMolhoImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: "ease-out", fill: "forwards" });
      setTimeout(() => borbolhar(massaConteudo, 8), 300);
      setTimeout(() => {
        concha.animate([
          { opacity: 1 },
          { transform: concha.style.transform + " translate(80px,-100px) rotate(-20deg)", opacity: 0 }
        ], { duration: 380, easing: "ease-in", fill: "forwards" }).onfinish = () => {
          concha.remove();
          vibrar([6, 40, 6]);
          pronto && pronto();
        };
      }, 700);
    };
    requestAnimationFrame(ir);
  }

  /* ---- Molho borbulhando ---- */
  function borbolhar(container, qtd) {
    if (calmo || !container) return;
    const r = container.getBoundingClientRect();
    for (let i = 0; i < qtd; i++) setTimeout(() => {
      const b = document.createElement("i");
      b.style.cssText = "position:fixed;z-index:60;pointer-events:none;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.8),rgba(255,255,255,.3) 50%,transparent 70%)";
      const tam = 5 + Math.random() * 9;
      b.style.width = b.style.height = tam + "px";
      b.style.left = (r.left + r.width * (0.15 + 0.7 * Math.random())) + "px";
      b.style.top = (r.top + r.height * (0.2 + 0.6 * Math.random())) + "px";
      document.body.appendChild(b);
      const dy = -(14 + Math.random() * 20);
      b.animate([
        { transform: "scale(.3)", opacity: 0 },
        { transform: "scale(1)", opacity: 0.8, offset: 0.3 },
        { transform: `scale(.7) translateY(${dy}px)`, opacity: 0 },
      ], { duration: 600 + Math.random() * 400, easing: "ease-out" }).onfinish = () => b.remove();
    }, i * 70);
  }

  /* ---- Vapor sobre a frigideira ---- */
  function vaporizarFrigideira(container, n) {
    if (calmo || !container) return;
    const r = container.getBoundingClientRect();
    for (let i = 0; i < n; i++) setTimeout(() => {
      const v = document.createElement("i");
      v.style.cssText = "position:fixed;z-index:60;pointer-events:none;border-radius:50%;filter:blur(5px);background:radial-gradient(circle,rgba(255,255,255,.75),rgba(255,255,255,.25) 50%,transparent 70%)";
      const tam = 18 + Math.random() * 22;
      v.style.width = v.style.height = tam + "px";
      v.style.left = (r.left + r.width * (0.1 + 0.8 * Math.random())) + "px";
      v.style.top = (r.top + r.height * 0.3) + "px";
      document.body.appendChild(v);
      const dx = (Math.random() - 0.5) * 30;
      v.animate([
        { transform: "translate(-50%,0) scale(.3)", opacity: 0 },
        { opacity: 0.6, offset: 0.25 },
        { transform: `translate(calc(-50% + ${dx}px),-70px) scale(1.3)`, opacity: 0 },
      ], { duration: 1200 + Math.random() * 500, easing: "ease-out" }).onfinish = () => v.remove();
    }, 60 + i * 90);
  }

  /* ---- Tipo de massa caindo na frigideira ---- */
  function jogarTipoMassa(tipo, pronto) {
    massaTipoImg.src = IMG_MASSA + tipo.img;
    massaTipoImg.style.opacity = "0";
    massaTipoImg.hidden = false;
    if (calmo) { massaTipoImg.style.opacity = "1"; pronto && pronto(); return; }
    massaTipoImg.animate([
      { transform: "translateX(-50%) translateY(-80px) scale(.7) rotate(-8deg)", opacity: 0 },
      { transform: "translateX(-50%) translateY(4px) scale(1.08) rotate(2deg)", opacity: 1, offset: 0.7, easing: "cubic-bezier(.55,0,1,.45)" },
      { transform: "translateX(-50%) translateY(0) scale(1) rotate(0deg)", opacity: 1 },
    ], { duration: 520, easing: "ease-out", fill: "forwards" });
    setTimeout(() => {
      vaporizarFrigideira(massaConteudo, 8);
      vibrar([8, 30, 8]);
      pronto && pronto();
    }, 400);
  }

  /* ---- Desenha o queijo depositado na frigideira de massa (centralizado no canvas) ---- */
  function desenharQueijoMassa() {
    const cx = massaQueijoCanvas.width / 2;
    const cy = massaQueijoCanvas.height / 2;
    const raio = Math.min(massaQueijoCanvas.width, massaQueijoCanvas.height) / 2 * 0.85;
    const x = massaQueijoCtx;
    x.clearRect(0, 0, massaQueijoCanvas.width, massaQueijoCanvas.height);
    x.lineCap = x.lineJoin = "round";
    const w = massaQueijoCanvas.width * 0.05;
    massaQueijoTrilhas.forEach(tr => {
      // sombra
      x.beginPath();
      for (let i = 0; i <= tr.ate && i < tr.pts.length; i++) {
        const [u, v] = tr.pts[i], px = cx + u * raio + w * 0.12, py = cy + v * raio + w * 0.28;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.strokeStyle = tr.cor.sombra;
      x.lineWidth = w * 1.05;
      x.stroke();
      // borda
      x.beginPath();
      for (let i = 0; i <= tr.ate && i < tr.pts.length; i++) {
        const [u, v] = tr.pts[i], px = cx + u * raio, py = cy + v * raio;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.strokeStyle = tr.cor.borda;
      x.lineWidth = w;
      x.stroke();
      // corpo
      x.beginPath();
      for (let i = 0; i <= tr.ate && i < tr.pts.length; i++) {
        const [u, v] = tr.pts[i], px = cx + u * raio - w * 0.04, py = cy + v * raio - w * 0.06;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.strokeStyle = tr.cor.corpo;
      x.lineWidth = w * 0.78;
      x.stroke();
      // brilho
      x.beginPath();
      for (let i = 0; i <= tr.ate && i < tr.pts.length; i++) {
        const [u, v] = tr.pts[i], px = cx + u * raio - w * 0.16, py = cy + v * raio - w * 0.2;
        i ? x.lineTo(px, py) : x.moveTo(px, py);
      }
      x.strokeStyle = tr.cor.brilho;
      x.lineWidth = w * 0.22;
      x.stroke();
    });
  }

  /* ---- Posiciona o container do queijo exatamente sobre a frigideira ---- */
  /* O corpo da frigideira é um círculo com diâmetro = largura da imagem, colado no
     topo (o cabo fica abaixo). Por isso o centro vertical é offsetTop + largura/2
     (e não a altura/2, que incluía o cabo e deslocava tudo ~30px para baixo). */
  const QUEIJO_TAM = 0.62; /* lado do canvas do queijo = 62% da frigideira (espiral ≈ 50% dela) */
  function geometriaQueijo() {
    const L = massaPanela.offsetWidth;
    const tam = L * QUEIJO_TAM;
    return {
      cx: massaPanela.offsetLeft + L / 2,
      cy: massaPanela.offsetTop + L / 2,
      tam: tam,
      raio: tam / 2 * 0.85 /* igual ao "raio" usado em desenharQueijoMassa */
    };
  }
  function posicionarQueijoWrapper() {
    if (!massaQueijoWrapper || !massaPanela || !massaPanela.offsetWidth) return;
    const g = geometriaQueijo();
    massaQueijoWrapper.style.width = g.tam + "px";
    massaQueijoWrapper.style.height = g.tam + "px";
    massaQueijoWrapper.style.left = (g.cx - g.tam / 2) + "px";
    massaQueijoWrapper.style.top = (g.cy - g.tam / 2) + "px";
  }
  /* ---- Bisnaga de queijo na finalização — espiral igual ao da pizza ---- */
  function bisnagarFinal(item, pronto) {
    if (calmo || !massaEl) { pronto && pronto(); return; }
    const r = massaEl.getBoundingClientRect();
    const cx = r.left + r.width * 0.5;
    const cy = r.top + r.height * 0.5;

    /* Mapeia ids de finalização (com -fin) para nomes base das imagens */
    const baseId = item.id === "catupiry-fin" ? "catupiry" : (item.id === "cheddar-fin" ? "cheddar" : item.id);

    const srcMap = {
      "catupiry": IMG_MASSA + "bisnaga-catupiry.webp",
      "cheddar": IMG_MASSA + "bisnaga-cheddar.webp"
    };
    const bis = imgFixa(srcMap[baseId] || IMG_MASSA + "bisnaga-catupiry.webp", "ferramenta");

    /* Parâmetros idênticos ao da pizza */
    const PONTA = { "catupiry": { x: 0.0058, y: 0.9783, h: 0.8865 }, "cheddar": { x: 0.0154, y: 0.968, h: 0.8404 } };
    const ponta = PONTA[baseId] || PONTA.catupiry;

    const CORES = {
      catupiry: { sombra: "rgba(60,35,20,.28)", borda: "#e7dfcf", corpo: "#f7f2e8", brilho: "rgba(255,255,255,.95)" },
      cheddar: { sombra: "rgba(90,40,10,.3)", borda: "#d9822a", corpo: "#f2a640", brilho: "rgba(255,226,160,.95)" }
    };

    const larg = r.width * 0.62;          // 62% da largura da frigideira (igual ao da pizza)
    bis.style.width = larg + "px";
    const alt = larg * ponta.h;

    /* Ajusta o canvas ao tamanho da frigideira e posiciona o wrapper sobre ela */
    const tam = Math.round(geometriaQueijo().tam);
    massaQueijoCanvas.width = tam;
    massaQueijoCanvas.height = tam;
    posicionarQueijoWrapper();
    // Redesenha todas as trilhas existentes após redimensionar o canvas
    if (massaQueijoTrilhas.length > 0) {
      desenharQueijoMassa();
    }

    const giro0 = Math.random() * Math.PI * 2;
    const meio = baseId === "cheddar" ? 0.045 : 0;
    const r0 = 0.95 - meio, r1 = 0.05 + meio, voltas = 3.5;
    const N = 440;

    /* Ponto na espiral: coordenadas normalizadas -1 a 1 */
    const ponto = s => {
      const a = giro0 + s * Math.PI * 2 * voltas;
      const raio = r0 - (r0 - r1) * s + 0.012 * Math.sin(a * 7);
      return [Math.cos(a) * raio, Math.sin(a) * raio];
    };

    /* Centro e raio baseados na imagem da frigideira (offsetLeft/offsetTop relativos ao #massa) */
    /* Mesmo centro e mesmo raio do canvas do queijo: a ponta da bisnaga passa
       exatamente por cima do que é desenhado */
    const geo = geometriaQueijo();
    const panelaCx = geo.cx;
    const panelaCy = geo.cy;
    const panelaRaio = geo.raio;

    /* Converte coordenadas normalizadas para pixels dentro do canvas */
    const local = (u, v) => [panelaCx + u * panelaRaio, panelaCy + v * panelaRaio];

    const posiciona = (u, v, extra = "") => {
      const [px, py] = local(u, v);
      // Converte coordenadas do container .massa para coordenadas da página (bisnaga está no document.body)
      const posX = px + r.left;
      const posY = py + r.top;
      bis.style.transform = `translate(${posX - ponta.x * larg}px, ${posY - ponta.y * alt}px) ${extra}`;
    };

    /* Posiciona no ponto inicial (borda externa da espiral) */
    const [u0, v0] = ponto(0);
    posiciona(u0, v0);

    /* Animação de entrada da bisnaga (igual ao da pizza) */
    bis.animate([{ opacity: 0, translate: "60px -80px" }, { opacity: 1, translate: "0 0" }], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" });

    const t0 = performance.now() + 240;
    const DUR = 1700;
    let feito = 0;
    const trilhaAtual = { pts: Array.from({ length: N + 1 }, (_, i) => ponto(i / N)), ate: 0, cor: CORES[baseId], id: item.id };
    massaQueijoTrilhas.push(trilhaAtual);

    const ir = () => {
      const e = Math.min(1, Math.max(0, (performance.now() - t0) / DUR));
      const [u, v] = ponto(e);
      posiciona(u, v, `rotate(${Math.sin(e * 40) * 2}deg)`);

      // Vai preenchendo a trilha à medida que a bisnaga se move
      const ate = Math.floor(N * e);
      if (ate > feito) {
        trilhaAtual.ate = ate;
        desenharQueijoMassa();
        feito = ate;
      }

      if (e < 1) {
        requestAnimationFrame(ir);
      } else {
        trilhaAtual.ate = N;
        desenharQueijoMassa();
        borbolhar(massaConteudo, 5);
        bis.animate([
          { opacity: 1 },
          { transform: bis.style.transform + " translate(60px,-80px) rotate(-20deg)", opacity: 0 }
        ], { duration: 320, easing: "ease-in", fill: "forwards" }).onfinish = () => { bis.remove(); pronto && pronto(); };
      }
    };
    requestAnimationFrame(ir);
  }

  /* ---- Animação final (vapor + borbulhar) ---- */
  function animarFinal() {
    if (calmo) return;
    const container = massaConteudo || massaEl;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => borbolhar(container, 6), i * 500);
      setTimeout(() => vaporizarFrigideira(container, 4), i * 500 + 200);
    }
    vibrar([6, 60, 6, 60, 6]);
  }
  /* ---- Mostra o prato final — ingredientes dentro do prato branco ----
     Em vez de clonar os elementos (que carregavam CSS da frigideira, como
     top/width com !important do carrossel), a cena do prato é reconstruída
     com elementos novos, usando só px relativos ao centro do prato. */
  const PRATO_ESCALA = 1.05; /* diâmetro do prato = 1,05 × largura da frigideira (medido no prato ideal) */
  const PRATO_AREA = 0.75;   /* fração do prato ocupada pela comida (o "poço") */
  let pratoOcultos = [];   /* elementos escondidos ao montar o prato (para desfazer) */

  function mostrarPratoFinal(silencioso) {
    if (massaPratoFinal.dataset.mostrado === "1") return;
    massaPratoFinal.dataset.mostrado = "1";

    /* 1) MEDIR tudo ANTES de esconder a frigideira (hidden zera as medidas) */
    const rBox = massaEl.getBoundingClientRect();
    const esc = rBox.width / (massaEl.offsetWidth || rBox.width) || 1;
    const rCont = massaConteudo.getBoundingClientRect();
    /* O prato fica no centro de #massa (centro da caixa), como no prato ideal */
    const cx = massaEl.offsetWidth / 2;
    const cy = massaEl.offsetHeight / 2;
    const cw = massaConteudo.offsetWidth || 128;
    const ch = massaConteudo.offsetHeight || 128;
    const caixa = massaEl.parentElement; /* .massa__prato-box (overflow hidden): o prato não pode passar dela */
    const D = Math.round(Math.min(massaPanela.offsetWidth * PRATO_ESCALA, (caixa.clientWidth || 9999) - 20));
    const k = (D * PRATO_AREA) / cw; /* fator de escala frigideira → prato */

    const dados = {
      pecas: [].slice.call(massaConteudo.querySelectorAll(".massa-peca")).map(function (p) {
        return {
          src: p.src, tempero: p.classList.contains("tempero"),
          w: p.offsetWidth, h: p.offsetHeight,
          dx: p.offsetLeft + p.offsetWidth / 2 - cw / 2,
          dy: p.offsetTop + p.offsetHeight / 2 - ch / 2,
          transform: p.style.transform
        };
      }),
      molho: (massaMolhoImg && !massaMolhoImg.hidden) ? massaMolhoImg.src : null,
      tipo: (massaTipoImg && !massaTipoImg.hidden) ? massaTipoImg.src : null,
      queijo: null
    };
    const cOrig = massaQueijoWrapper && massaQueijoWrapper.querySelector("canvas");
    if (cOrig && !massaQueijoWrapper.hidden && massaQueijoTrilhas.length > 0) {
      const rq = massaQueijoWrapper.getBoundingClientRect();
      dados.queijo = {
        canvas: cOrig, tam: massaQueijoWrapper.offsetWidth,
        dx: ((rq.left + rq.width / 2) - (rCont.left + rCont.width / 2)) / esc,
        dy: ((rq.top + rq.height / 2) - (rCont.top + rCont.height / 2)) / esc
      };
    }

    /* 2) Prato: centralizado exatamente onde estava a frigideira.
          Posição por left/top + margin negativa (sem translate), assim a
          animação de scale não desloca o prato. */
    massaPratoFinalImg.src = IMG_MASSA + "pote.webp";
    massaPratoFinal.style.width = D + "px";
    massaPratoFinal.style.height = D + "px";
    massaPratoFinal.style.left = cx + "px";
    massaPratoFinal.style.top = cy + "px";
    massaPratoFinal.style.margin = (-D / 2) + "px 0 0 " + (-D / 2) + "px";
    massaPratoFinal.style.transform = "none";

    /* 3) Cena com a comida dentro do prato */
    [].slice.call(massaPratoFinal.querySelectorAll(".prato-cena")).forEach(function (n) { n.remove(); });
    const cena = document.createElement("div");
    cena.className = "prato-cena";
    function pos(el, dx, dy, w, h) {
      el.style.width = w + "px";
      el.style.height = h + "px";
      el.style.left = (D / 2 + dx * k - w / 2) + "px";
      el.style.top = (D / 2 + dy * k - h / 2) + "px";
      return el;
    }
    function novaImg(src, cls, z) {
      const im = document.createElement("img");
      im.src = src; im.alt = ""; im.className = cls; im.style.zIndex = z;
      cena.appendChild(im);
      return im;
    }
    /* Ordem das camadas (de baixo para cima), para o molho ficar MISTURADO à massa:
       1) molho base      → só aparece como o anel vermelho da borda
       2) massa           → um pouco menor que o molho
       3) molho por cima  → cobre o centro e some suavemente (máscara) nas bordas,
                            deixando a massa aparecer ali
       (antes: molho embaixo e massa inteira por cima = molho escondido) */
    if (dados.molho) pos(novaImg(dados.molho, "prato-molho", 1), 0, 0, cw * k, ch * k);
    if (dados.tipo) pos(novaImg(dados.tipo, "prato-tipo", 2), 0, 0, cw * 0.97 * k, ch * 0.97 * k);
    if (dados.molho && dados.tipo) pos(novaImg(dados.molho, "prato-molho prato-molho--topo", 3), 0, 0, cw * k, ch * k);
    /* "Filme" de molho translúcido POR CIMA da maioria dos ingredientes: eles ficam
       envoltos no molho (afundados), em vez de parecerem colados sobre o prato.
       Alguns ingredientes (1 a cada 3) e os temperos ficam por cima do filme, nítidos. */
    if (dados.molho) pos(novaImg(dados.molho, "prato-molho prato-molho--filme", 5), 0, 0, cw * k, ch * k);
    if (dados.queijo) {
      const q = dados.queijo, cv = document.createElement("canvas");
      cv.width = q.canvas.width; cv.height = q.canvas.height;
      cv.getContext("2d").drawImage(q.canvas, 0, 0);
      cv.className = "prato-queijo"; cv.style.zIndex = 4; /* abaixo do filme de molho (5) e dos ingredientes de cima (6) */
      cena.appendChild(pos(cv, q.dx, q.dy, q.tam * k, q.tam * k));
    }
    dados.pecas.forEach(function (p, i) {
      const sobreOFilme = p.tempero || i % 3 === 0;
      const im = novaImg(p.src, "prato-ing" + (p.tempero ? " tempero" : ""), sobreOFilme ? 6 : 4);
      pos(im, p.dx, p.dy, Math.max(3, p.w * k), Math.max(3, p.h * k));
      if (p.transform) im.style.transform = p.transform; /* mantém a rotação original */
    });
    massaPratoFinal.appendChild(cena);

    /* 4) Esconde TUDO que era da frigideira (antes só panela e conteúdo eram
          escondidos; molho, massa e queijo ficavam visíveis = pratos duplicados) */
    pratoOcultos = [massaPanela, massaConteudo, massaMolhoImg, massaTipoImg, massaQueijoWrapper]
      .filter(function (el) { return el && !el.hidden; });
    pratoOcultos.forEach(function (el) { el.hidden = true; });

    /* 5) Entrada animada (só scale/opacity) */
    massaPratoFinal.hidden = false;
    if (calmo || silencioso) {
      massaPratoFinal.style.opacity = "1";
    } else {
      massaPratoFinal.style.opacity = "0";
      const anim = massaPratoFinal.animate([
        { transform: "scale(0.6)", opacity: 0 },
        { transform: "scale(1)", opacity: 1 }
      ], { duration: 600, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
      anim.onfinish = function () {
        massaPratoFinal.style.opacity = "1";
        anim.cancel();
      };
      [].slice.call(cena.children).forEach(function (el, i) {
        const opFinal = getComputedStyle(el).opacity;
        el.animate([{ opacity: 0 }, { opacity: opFinal }], { duration: 500, delay: 250 + Math.min(i, 20) * 12, easing: "ease-out", fill: "backwards" });
      });
    }
    if (!silencioso) {
      vibrar([10, 50, 10]);
      try { massaEl.parentElement.scrollIntoView({ behavior: calmo ? "auto" : "smooth", block: "center" }); } catch (e) { }
      if (!calmo) { try { vaporizarFrigideira(massaPratoFinal, 4); } catch (e) { } }
    }
  }

  /* Volta da etapa 4: remove o prato e restaura a frigideira */
  function desfazerPratoFinal() {
    if (massaPratoFinal.dataset.mostrado !== "1") return;
    massaPratoFinal.dataset.mostrado = "0";
    massaPratoFinal.hidden = true;
    [].slice.call(massaPratoFinal.querySelectorAll(".prato-cena")).forEach(function (n) { n.remove(); });
    pratoOcultos.forEach(function (el) { el.hidden = false; });
    pratoOcultos = [];
  }


  /* ---- jogarNaFrigideira — lança pedaços do ingrediente na frigideira ---- */
  function jogarNaFrigideira(item, btn) {
    if (calmo || !massaConteudo) return;
    const rBtn = btn.getBoundingClientRect();
    const de = { x: rBtn.left + rBtn.width / 2, y: rBtn.top + rBtn.height / 2 };
    const rPanela = massaConteudo.getBoundingClientRect();
    const cx = rPanela.left + rPanela.width / 2;
    const cy = rPanela.top + rPanela.height / 2;
    const raio = rPanela.width / 2;
    const pastaDir = item.pasta === "pizza" ? IMG_PIZZA : IMG_MASSA;
    const baseArte = item.arte || item.id;
    const porcaoAtual = estado.massaPorcoes[item.id] || 1;
    const angBase = (Math.random() + (porcaoAtual - 1) * 0.6180339887) % 1;
    const LIM = 0.66;
    const tremido = LIM * 0.09;
    /* Temperos/grãos lançam 10 partículas pequenas, carnes lançam 9 peças médias, outros 3 pedaços grandes */
    const qtdParticulas = item.cat === "temperos" || item.graos ? 10 : item.muitos ? 9 : 3;
    for (let k = 0; k < qtdParticulas; k++) {
      const r = LIM * Math.sqrt((k + 0.5) / qtdParticulas);
      const a = 2 * Math.PI * ((k * 0.6180339887 + angBase) % 1);
      const u = Math.cos(a) * r + (Math.random() - 0.5) * 2 * tremido;
      const v = Math.sin(a) * r + (Math.random() - 0.5) * 2 * tremido;
      /* posição em px relativa ao centro do massaConteudo */
      const px = u * raio;
      const py = v * raio;
      const alvoX = cx + px, alvoY = cy + py;

      /* variante aleatória entre as 3 imagens do ingrediente */
      const variante = Math.floor(Math.random() * 3);
      const imgSrc = item.img
        ? (item.pasta === "pizza" ? IMG_PIZZA : IMG_MASSA) + item.img
        : pastaDir + "t-" + baseArte + "-" + variante + ".webp";

      /* tamanho pequeno para temperos/grãos, médio para carnes, normal para os demais */
      /* tamPx (opcional, no cadastro do ingrediente) define o tamanho exato em pixels */
      const tamPeca = item.tamPx || (item.cat === "temperos" || item.graos ? 5 : item.muitos ? 14 : 28);
      const vImg = document.createElement("img");
      vImg.src = imgSrc;
      vImg.onerror = function () { vImg.src = pastaDir + "t-" + baseArte + "-0.webp"; };
      vImg.className = "voo";
      vImg.style.width = tamPeca + "px";
      vImg.style.height = tamPeca + "px";
      vImg.style.zIndex = "65";
      document.body.appendChild(vImg);

      const ctlX = (de.x + alvoX) / 2;
      const ctlY = Math.min(de.y, alvoY) - (50 + Math.random() * 40);
      const rotFinal = Math.random() * 360;
      const dur = 420 + k * 55 + Math.random() * 90;
      const t0 = performance.now();

      const anima = () => {
        const t = Math.min(1, (performance.now() - t0) / dur);
        const e = suave(t);
        const x = curva(de.x, ctlX, alvoX, e);
        const y = curva(de.y, ctlY, alvoY, e);
        const rot = rotFinal * e;
        const esc = 0.85 + 0.3 * Math.sin(e * Math.PI);
        vImg.style.transform = `translate(${x - tamPeca / 2}px, ${y - tamPeca / 2}px) rotate(${rot}deg) scale(${esc})`;
        if (t < 1) requestAnimationFrame(anima);
        else {
          vImg.remove();
          const peca = document.createElement("img");
          peca.src = imgSrc;
          peca.onerror = function () { peca.src = pastaDir + "t-" + baseArte + "-0.webp"; };
          peca.className = "massa-peca" + (!item.tamPx && (item.cat === "temperos" || item.graos) ? " tempero" : "");
          if (item.tamPx) { peca.style.width = item.tamPx + "px"; peca.style.height = item.tamPx + "px"; }
          peca.dataset.id = item.id;
          const meio = tamPeca / 2;
          peca.style.left = `calc(50% + ${px.toFixed(1)}px - ${meio.toFixed(1)}px)`;
          peca.style.top = `calc(50% + ${py.toFixed(1)}px - ${meio.toFixed(1)}px)`;
          peca.style.transform = `rotate(${rotFinal.toFixed(0)}deg) scale(0.9)`;
          massaConteudo.appendChild(peca);
          peca.animate(
            [{ transform: `rotate(${rotFinal.toFixed(0)}deg) scale(1.18)` }, { transform: `rotate(${rotFinal.toFixed(0)}deg) scale(0.9)` }],
            { duration: 160, easing: "ease-out" }
          );
          vibrar(6);
        }
      };
      setTimeout(() => requestAnimationFrame(anima), k * 55);
    }
  }

  /* ---- tirarDaFrigideira — remove imagens de um ingrediente com efeito de retorno ao seletor ---- */
  function tirarDaFrigideira(item, qtdPorcoes) {
    if (!massaConteudo) return;
    const qtd = qtdPorcoes || 1;
    const pecas = [].slice.call(massaConteudo.querySelectorAll('.massa-peca[data-id="' + item.id + '"]'));
    const particulasPorPorcao = item.cat === "temperos" || item.graos ? 10 : item.muitos ? 9 : 3;
    const alvo = pecas.slice(-(qtd * particulasPorPorcao));

    /* Posição do seletor (cuba) para efeito de retorno */
    const rCuba = item.cubaEl ? item.cubaEl.getBoundingClientRect() : null;
    const alvoX = rCuba ? rCuba.left + rCuba.width / 2 : null;
    const alvoY = rCuba ? rCuba.top + rCuba.height / 2 : null;

    alvo.forEach(function (p, idx) {
      const rPeca = p.getBoundingClientRect();
      const deX = rPeca.left + rPeca.width / 2;
      const deY = rPeca.top + rPeca.height / 2;

      if (alvoX != null && alvoY != null) {
        /* Cria imagem voadora temporária no body (mesmo padrão da pizza) e anima até a cuba */
        const voo = document.createElement("img");
        voo.src = p.src;
        voo.className = "voo";
        voo.style.width = rPeca.width + "px";
        voo.style.height = rPeca.height + "px";
        voo.style.position = "fixed";
        voo.style.left = (deX - rPeca.width / 2) + "px";
        voo.style.top = (deY - rPeca.height / 2) + "px";
        voo.style.zIndex = "100";
        voo.style.pointerEvents = "none";
        document.body.appendChild(voo);

        /* Remove a peça original imediatamente */
        p.remove();

        /* Anima a imagem voadora até o seletor */
        voo.animate([
          { transform: `translate(0,0) scale(1)`, opacity: 1 },
          { transform: `translate(${(alvoX - deX) * 0.5}px, ${(alvoY - deY) * 0.5 - 40}px) scale(0.7)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${alvoX - deX}px, ${alvoY - deY}px) scale(0.18)`, opacity: 0.3 }
        ], { duration: 420, easing: "cubic-bezier(.3,.6,.4,1)" }).finished.then(() => voo.remove());
      } else {
        p.animate([
          { opacity: 1, transform: p.style.transform },
          { opacity: 0, transform: p.style.transform + " translateY(-14px) scale(0.3)" }
        ], { duration: 220, delay: idx * 20, easing: "ease-in" }).onfinish = function () { p.remove(); };
      }
    });

    /* Feedback visual na cuba (igual à pizza) */
    if (item.cubaEl && alvo.length) {
      item.cubaEl.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 280, easing: "ease-out" });
    }
  }

  /* ---- cubaMassa — cria botão de cuba para ingredientes ---- */
  function cubaMassa(item, grade, aoTocar, aoTirar) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cuba-btn";
    b.dataset.cat = item.cat || "carnes";
    b.setAttribute("aria-label", "Adicionar " + item.nome);
    const pastaDir = item.pasta === "pizza" ? IMG_PIZZA : IMG_MASSA;
    const baseArte = item.arte || item.id;
    const imgSrc = item.img ? pastaDir + item.img : pastaDir + "t-" + baseArte + "-0.webp";
    const precoTxt = item.preco ? "+ " + reais(item.preco) : "incluso";
    b.innerHTML = '<div class="cuba-art">'
      + '<img class="cuba-item-img" src="' + imgSrc + '" alt="' + item.nome + '">'
      + '<span class="cuba-badge" aria-label="Porcoes">\u2713</span>'
      + '<span class="cuba-menos" aria-label="Remover ' + item.nome + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg></span>'
      + '</div>'
      + '<span class="cuba-nome">' + item.nome + '</span>'
      + '<span class="cuba-preco">' + precoTxt + '</span>';
    let seguro, x0 = 0;
    b.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".cuba-menos")) return;
      x0 = e.clientX;
      b.classList.add("apertado");
      seguro = setTimeout(function () {
        seguro = null;
        b.classList.remove("apertado");
        b.dataset.segurou = "1";
        aoTirar(item, b, true);
      }, 460);
    });
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    const solta = function () { b.classList.remove("apertado"); clearTimeout(seguro); };
    b.addEventListener("pointerup", solta);
    b.addEventListener("pointerleave", solta);
    b.addEventListener("pointercancel", solta);
    b.addEventListener("pointermove", function (e) { if (Math.abs(e.clientX - x0) > 8) solta(); });
    b.addEventListener("click", function (e) {
      if (b.dataset.segurou) { delete b.dataset.segurou; return; }
      const menos = e.target.closest(".cuba-menos") || e.target.closest(".cuba-badge");
      if (menos) {
        aoTirar(item, b, false);
      } else {
        aoTocar(item, b);
      }
      soltarPedido("massa");
    });
    grade.appendChild(b);
    item.cubaEl = b;
    return b;
  }

  /* ---- marcarCuba — atualiza badge do botão ---- */
  function marcarCuba(item, n) {
    if (!item.cubaEl) return;
    item.cubaEl.classList.toggle("on", n > 0);
    const badge = item.cubaEl.querySelector(".cuba-badge");
    if (badge) badge.textContent = n > 1 ? "\xd7" + n : "\u2713";
  }

  /* ---- Build Etapa 1: grid de ingredientes ---- */
  const ingMassaGrade = $("#ingMassa");
  if (ingMassaGrade) {
    ingMassaGrade.innerHTML = "";
    MASSA.ingredientes.forEach(function (item) {
      cubaMassa(item, ingMassaGrade,
        function aoTocar() {
          if (massaEtapa !== 1) return;
          const n = estado.massaPorcoes[item.id] || 0;
          if (n >= item.max) {
            item.cubaEl.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 250 });
            dizer("Duas porções é o máximo", null, null, "massa");
            return;
          }
          estado.massaPorcoes[item.id] = n + 1;
          massaHist.push(item);
          marcarCuba(item, n + 1);
          precificar("massa", item.preco);
          soltarPedido("massa");
          dizer(item.nome + " \xd7" + (n + 1), null, null, "massa");
          if (item.id === "catupiry" || item.id === "cheddar") {
            bisnagarFinal(item, null);
          } else {
            jogarNaFrigideira(item, item.cubaEl);
          }
        },
        function aoTirar(it, btn, tudo) {
          if (massaEtapa !== 1) return;
          const n = estado.massaPorcoes[it.id] || 0;
          if (!n) return;
          const novoN = tudo ? 0 : Math.max(0, n - 1);
          const removidas = n - novoN;
          estado.massaPorcoes[it.id] = novoN;
          marcarCuba(it, novoN);
          precificar("massa", -it.preco * removidas);
          soltarPedido("massa");
          tirarDaFrigideira(it, removidas);
          vibrar(16);
          /* Remove apenas as trilhas de queijo correspondentes ao retirado */
          if (it.id === "catupiry" || it.id === "cheddar") {
            const CORES = {
              catupiry: { sombra: "rgba(60,35,20,.28)", borda: "#e7dfcf", corpo: "#f7f2e8", brilho: "rgba(255,255,255,.95)" },
              cheddar: { sombra: "rgba(90,40,10,.3)", borda: "#d9822a", corpo: "#f2a640", brilho: "rgba(255,226,160,.95)" }
            };
            const cor = CORES[it.id];
            // Remove do final (últimas adicionadas) a quantidade retirada
            for (let r = 0; r < removidas && massaQueijoTrilhas.length > 0; r++) {
              massaQueijoTrilhas.pop();
            }
            if (massaQueijoTrilhas.length > 0) {
              desenharQueijoMassa(cor);
            } else {
              massaQueijoCtx.clearRect(0, 0, massaQueijoCanvas.width, massaQueijoCanvas.height);
            }
          }
          if (!MASSA.ingredientes.some(function (i) { return (estado.massaPorcoes[i.id] || 0) > 0; })) {
            dizer("Toque nas cubas para jogar na frigideira", null, null, "massa");
          } else {
            dizer(novoN > 0 ? it.nome + " \xd7" + novoN : "Tirou " + it.nome.toLowerCase(), null, null, "massa");
          }
        }
      );
    });
    $$(".cuba-btn", ingMassaGrade).forEach(function (c) {
      c.style.display = (c.dataset.cat === "carnes") ? "flex" : "none";
    });
  }

  /* ---- Abas de categoria (Etapa 1) ---- */
  const massaTabs = $$(".massa__tab");
  massaTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      massaTabs.forEach(function (t) { t.classList.toggle("massa__tab--active", t === tab); });
      const cat = tab.dataset.cat;
      $$(".cuba-btn", ingMassaGrade).forEach(function (c) {
        c.style.display = (c.dataset.cat === cat) ? "flex" : "none";
      });
      dizer("Escolha os itens de " + tab.textContent.toLowerCase(), null, null, "massa");
    });
  });

  /* ---- Build Etapa 2: seleção de molho ---- */
  const ingMolhoGrade = $("#ingMolho");
  if (ingMolhoGrade) {
    MOLHOS_MASSA.forEach(function (molho) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cuba-btn";
      b.setAttribute("aria-label", molho.nome);
      b.innerHTML = '<div class="cuba-art"><img class="cuba-item-img" src="' + IMG_MASSA + molho.img + '" alt="' + molho.nome + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></div>'
        + '<span class="cuba-nome">' + molho.nome + '</span>'
        + '<span class="cuba-preco">incluso</span>';
      b.addEventListener("click", function () {
        if (massaMolhoSel && massaMolhoSel.id === molho.id) return;
        $$(".cuba-btn", ingMolhoGrade).forEach(function (x) { x.classList.remove("cuba-selecionado"); });
        b.classList.add("cuba-selecionado");
        massaMolhoSel = molho;
        estado.massaMolho = molho.id;
        dizer("Molho " + molho.nome + " selecionado", null, null, "massa");
        derramarMolho(molho, null);
        atualizarSelecionados();
        vibrar(6);
      });
      ingMolhoGrade.appendChild(b);
    });
  }

  /* ---- Build Etapa 3: tipo de massa ---- */
  const ingTipoGrade = $("#ingTipoMassa");
  if (ingTipoGrade) {
    TIPOS_MASSA.forEach(function (tipo) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cuba-btn";
      b.setAttribute("aria-label", tipo.nome);
      b.innerHTML = '<div class="cuba-art"><img class="cuba-item-img" src="' + IMG_MASSA + tipo.img + '" alt="' + tipo.nome + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></div>'
        + '<span class="cuba-nome">' + tipo.nome + '</span>'
        + '<span class="cuba-preco">incluso</span>';
      b.addEventListener("click", function () {
        $$(".cuba-btn", ingTipoGrade).forEach(function (x) { x.classList.remove("cuba-selecionado"); });
        b.classList.add("cuba-selecionado");
        massaTipoSel = tipo;
        estado.massaRecipiente = tipo.id;
        dizer(tipo.nome + " selecionado", null, null, "massa");
        jogarTipoMassa(tipo, null);
        atualizarSelecionados();
        vibrar(6);
      });
      ingTipoGrade.appendChild(b);
    });
  }

  /* ---- Build Etapa 4: finalizações ---- */
  const ingFinalGrade = $("#ingFinal");
  if (ingFinalGrade) {
    FINALIZACOES.forEach(function (item) {
      const pastaDir = item.pasta === "pizza" ? IMG_PIZZA : IMG_MASSA;
      const baseArte = item.arte || item.id.replace("-fin", "");
      const imgSrc = item.img ? (IMG_MASSA + item.img) : (pastaDir + "t-" + baseArte + "-0.webp");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cuba-btn";
      b.setAttribute("aria-label", "Adicionar " + item.nome);
      b.innerHTML = '<div class="cuba-art"><img class="cuba-item-img" src="' + imgSrc + '" alt="' + item.nome + '"><span class="cuba-badge">\u2713</span></div>'
        + '<span class="cuba-nome">' + item.nome + '</span>'
        + '<span class="cuba-preco">+ ' + reais(item.preco) + '</span>';
      let nFin = 0;
      b._resetFin = function () { nFin = 0; };
      b._setFin = function (n) { nFin = n; };
      item.cubaEl = b;
      b.addEventListener("click", function () {
        if (nFin >= 2) {
          b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 250 });
          return;
        }
        nFin++;
        massaHist.push(item);
        estado.massaPorcoes[item.id] = nFin;
        b.classList.add("on");
        const badge = b.querySelector(".cuba-badge");
        if (badge) badge.textContent = nFin > 1 ? "\xd7" + nFin : "\u2713";
        precificar("massa", item.preco);
        if (item.id === "catupiry-fin" || item.id === "cheddar-fin") {
          bisnagarFinal(item, null);
        } else {
          borbolhar(massaConteudo, 4);
        }
        vibrar(6);
        dizer(item.nome + " adicionado", null, null, "massa");
      });
      ingFinalGrade.appendChild(b);
    });
  }

  /* ---- Botão principal — navegação entre etapas ---- */
  UI.pizza.pedir.addEventListener("click", assar);
  UI.lanche.pedir.addEventListener("click", chapear);
  UI.massa.pedir.addEventListener("click", function () {
    const ui = UI.massa;
    if (massaEtapa === 1) {
      atualizarStepper(2);
      dizer("Escolha o molho para a massa", null, null, "massa");
    } else if (massaEtapa === 2) {
      if (!massaMolhoSel) {
        ui.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
        dizer("Escolha um molho antes de continuar", null, null, "massa");
        vibrar([8, 30, 8]);
        return;
      }
      atualizarStepper(3);
      dizer("Que tipo de massa você prefere?", null, null, "massa");
    } else if (massaEtapa === 3) {
      if (!massaTipoSel) {
        ui.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
        dizer("Escolha o tipo de massa antes de continuar", null, null, "massa");
        vibrar([8, 30, 8]);
        return;
      }
      atualizarStepper(4);
      animarFinal();
      mostrarPratoFinal();
      dizer("Adicione os toques finais", null, null, "massa");
    } else {
      const temIng = MASSA.ingredientes.some(function (i) { return (estado.massaPorcoes[i.id] || 0) > 0; });
      if (!temIng) {
        ui.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
        dizer("Volte e adicione ao menos um ingrediente", null, null, "massa");
        vibrar([8, 30, 8]);
        return;
      }
      abrirResumo(function () {
        animarFinal();
        mostrarPratoFinal();
        setTimeout(function () { entregar("massa"); miniaturaNaComanda(); }, 800);
      });
    }
  });


  /* ================= EXTRAS DA MONTAGEM DE MASSAS ================= */
  const appMassa = $("#appMassa");
  const ALERG = { queijo: "lactose", catupiry: "lactose", cheddar: "lactose", "catupiry-fin": "lactose", "cheddar-fin": "lactose" };
  let somAtivo = false, audioCtx = null;
  function bip(f) {
    if (!somAtivo) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "sine"; o.frequency.value = f; g.gain.value = 0.04;
      o.connect(g); g.connect(audioCtx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12); o.stop(audioCtx.currentTime + 0.13);
    } catch (e) { }
  }
  appMassa.addEventListener("click", function (e) { if (e.target.closest(".cuba-btn")) bip(480 + Math.random() * 160); });

  /* Etiquetas de alérgenos nas cubas de queijo */
  MASSA.ingredientes.forEach(function (i) {
    if (ALERG[i.id] && i.cubaEl) {
      const t = document.createElement("span");
      t.className = "cuba-alerg"; t.textContent = "contém lactose"; i.cubaEl.appendChild(t);
    }
  });

  /* Remove UMA unidade de um ingrediente/finalização em qualquer etapa.
     Se o prato final já estava montado, volta à frigideira, tira o item e remonta o prato. */
  let pratoPendente = false, pratoTimer;
  function agendarPrato() {
    clearTimeout(pratoTimer);
    pratoTimer = setTimeout(function () {
      if (pratoPendente) { pratoPendente = false; mostrarPratoFinal(true); }
    }, 650);
  }
  function removerFinal(item) {
    const n = estado.massaPorcoes[item.id] || 0;
    if (!n) return;
    const b = item.cubaEl;
    estado.massaPorcoes[item.id] = n - 1;
    if (b._setFin) b._setFin(n - 1);
    b.classList.toggle("on", n - 1 > 0);
    const bd = b.querySelector(".cuba-badge");
    if (bd) bd.textContent = n - 1 > 1 ? "\u00d7" + (n - 1) : "\u2713";
    precificar("massa", -item.preco);
    if (item.id === "catupiry-fin" || item.id === "cheddar-fin") {
      for (let i = massaQueijoTrilhas.length - 1; i >= 0; i--) {
        if (massaQueijoTrilhas[i].id === item.id) { massaQueijoTrilhas.splice(i, 1); break; }
      }
      massaQueijoCtx.clearRect(0, 0, massaQueijoCanvas.width, massaQueijoCanvas.height);
      if (massaQueijoTrilhas.length) desenharQueijoMassa();
    }
    vibrar(16);
    dizer("Tirou " + item.nome.toLowerCase(), null, null, "massa");
  }
  function removerSelecionado(item) {
    if (massaPratoFinal.dataset.mostrado === "1") { desfazerPratoFinal(); pratoPendente = true; }
    if (FINALIZACOES.indexOf(item) >= 0) {
      removerFinal(item);
    } else {
      const et = massaEtapa;
      massaEtapa = 1; /* aoTirar só aceita a etapa 1 */
      const m = item.cubaEl.querySelector(".cuba-menos");
      if (m) m.click();
      massaEtapa = et;
    }
    if (pratoPendente) agendarPrato();
  }
  function desfazerUltimo() {
    let it = null;
    while (massaHist.length) { const c = massaHist.pop(); if ((estado.massaPorcoes[c.id] || 0) > 0) { it = c; break; } }
    if (!it) { dizer("Nada para desfazer", null, null, "massa"); return; }
    removerSelecionado(it);
  }

  /* Faixa "Seu prato": tudo que foi escolhido, com × para tirar o que entrou por engano */
  const selBox = document.createElement("div");
  selBox.className = "massa-sel"; selBox.hidden = true;
  $("#massaLegenda").insertAdjacentElement("beforebegin", selBox);
  function atualizarSelecionados() {
    selBox.innerHTML = "";
    function chip(src, nome, n, acao, removivel) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "massa-sel__chip";
      b.setAttribute("aria-label", (removivel ? "Remover " : "Editar ") + nome);
      b.title = removivel ? "Remover " + nome : "Trocar " + nome.toLowerCase();
      b.innerHTML = '<img src="' + src + '" alt="">' + (removivel ? '<span class="massa-sel__x">\u00d7</span>' : '') + (n > 1 ? '<b class="massa-sel__n">' + n + '</b>' : '');
      b.addEventListener("click", acao);
      selBox.appendChild(b);
    }
    if (massaTipoSel) chip(IMG_MASSA + massaTipoSel.img, massaTipoSel.nome, 0, function () { atualizarStepper(3); }, false);
    if (massaMolhoSel) chip(IMG_MASSA + massaMolhoSel.img, massaMolhoSel.nome, 0, function () { atualizarStepper(2); }, false);
    MASSA.ingredientes.concat(FINALIZACOES).forEach(function (i) {
      const n = estado.massaPorcoes[i.id] || 0, im = i.cubaEl && i.cubaEl.querySelector(".cuba-item-img");
      if (n > 0 && im) chip(im.src, i.nome, n, function () { removerSelecionado(i); }, true);
    });
    selBox.hidden = !selBox.children.length;
  }
  window.__atualizarSel = atualizarSelecionados;
  function recomecar() {
    pratoPendente = false; clearTimeout(pratoTimer);
    atualizarStepper(1);
    massaHist.length = 0;
    MASSA.ingredientes.forEach(function (i) { estado.massaPorcoes[i.id] = 0; marcarCuba(i, 0); });
    FINALIZACOES.forEach(function (f) { estado.massaPorcoes[f.id] = 0; });
    $$("#ingFinal .cuba-btn").forEach(function (b) {
      b.classList.remove("on");
      if (b._resetFin) b._resetFin();
      const bd = b.querySelector(".cuba-badge"); if (bd) bd.textContent = "\u2713";
    });
    massaConteudo.innerHTML = "";
    massaQueijoTrilhas.length = 0;
    massaQueijoCtx.clearRect(0, 0, massaQueijoCanvas.width, massaQueijoCanvas.height);
    massaMolhoSel = null; massaTipoSel = null; estado.massaMolho = null; estado.massaRecipiente = null;
    [massaMolhoImg, massaTipoImg].forEach(function (im) { im.hidden = true; im.removeAttribute("src"); });
    $$("#ingMolho .cuba-btn, #ingTipoMassa .cuba-btn").forEach(function (b) { b.classList.remove("cuba-selecionado"); });
    UI.massa.comanda.hidden = true;
    soltarPedido("massa");
    precificar("massa");
    dizer("Prato limpo. Escolha o recheio", null, null, "massa");
  }

  /* Sugestões prontas: montam o prato inteiro sozinhas */
  const SUGESTOES = [
    { nome: "Bolonhesa clássica", ings: ["presunto", "queijo", "cebola"], molho: "bolonhesa", tipo: 0 },
    { nome: "Frango e brócolis", ings: ["frango", "brocolis", "alho"], molho: "branco", tipo: 1 },
    { nome: "Calabresa", ings: ["calabresa", "cebola", "queijo", "pimentacheiro"], molho: "sugo", tipo: 2 }
  ];
  function aplicarSugestao(s) {
    recomecar();
    let t = 350;
    s.ings.forEach(function (id) {
      const it = MASSA.ingredientes.find(function (i) { return i.id === id; });
      if (it && it.cubaEl) setTimeout(function () { it.cubaEl.click(); }, t);
      t += 380;
    });
    const mi = Math.max(0, MOLHOS_MASSA.findIndex(function (m) { return m.id === s.molho; }));
    const ti = Math.min(s.tipo, TIPOS_MASSA.length - 1);
    setTimeout(function () { atualizarStepper(2); $$("#ingMolho .cuba-btn")[mi].click(); }, t + 300);
    setTimeout(function () { atualizarStepper(3); $$("#ingTipoMassa .cuba-btn")[ti].click(); }, t + 1300);
    setTimeout(function () { atualizarStepper(4); animarFinal(); mostrarPratoFinal(); }, t + 2300);
  }

  const ferr = document.createElement("div");
  ferr.className = "massa-ferr";
  ferr.innerHTML = '<button type="button" data-a="desfazer">\u21b6 Desfazer</button>'
    + '<button type="button" data-a="recomecar">Recome\u00e7ar</button>'
    + '<button type="button" data-a="som" aria-pressed="false">\ud83d\udd07 Som</button>'
    + '<span class="massa-ferr__rot">Sugest\u00f5es:</span>'
    + SUGESTOES.map(function (s, i) { return '<button type="button" class="massa-sug" data-s="' + i + '">' + s.nome + '</button>'; }).join("");
  $("#massaCab").appendChild(ferr);
  ferr.addEventListener("click", function (e) {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.a === "desfazer") desfazerUltimo();
    else if (b.dataset.a === "recomecar") recomecar();
    else if (b.dataset.a === "som") {
      somAtivo = !somAtivo; b.setAttribute("aria-pressed", String(somAtivo));
      b.textContent = somAtivo ? "\ud83d\udd0a Som" : "\ud83d\udd07 Som"; bip(660);
    } else if (b.dataset.s) aplicarSugestao(SUGESTOES[+b.dataset.s]);
  });

  /* Resumo antes de enviar */
  function abrirResumo(ok) {
    $$(".massa-resumo", appMassa).forEach(function (n) { n.remove(); });
    const sel = MASSA.ingredientes.concat(FINALIZACOES).filter(function (i) { return (estado.massaPorcoes[i.id] || 0) > 0; });
    const alerg = ["gl\u00faten"];
    sel.forEach(function (i) { if (ALERG[i.id] && alerg.indexOf(ALERG[i.id]) < 0) alerg.push(ALERG[i.id]); });
    const el = document.createElement("div");
    el.className = "massa-resumo";
    el.innerHTML = '<div class="massa-resumo__card" role="dialog" aria-label="Resumo do pedido">'
      + '<h3>Confira seu prato</h3>'
      + '<p class="massa-resumo__base">' + (massaTipoSel ? massaTipoSel.nome : "Massa") + (massaMolhoSel ? " ao molho " + massaMolhoSel.nome.toLowerCase() : "") + ' <b>' + reais(MASSA.base) + '</b></p>'
      + '<ul>' + (sel.length ? sel.map(function (i) { const n = estado.massaPorcoes[i.id]; return '<li><span>' + i.nome + (n > 1 ? ' \u00d7' + n : '') + '</span><b>' + (i.preco ? reais(i.preco * n) : 'incluso') + '</b></li>'; }).join("") : '<li><span>Sem ingredientes extras</span></li>') + '</ul>'
      + '<p class="massa-resumo__alerg">Cont\u00e9m: ' + alerg.join(", ") + '</p>'
      + '<p class="massa-resumo__total"><span>Total</span><b>' + reais(total("massa")) + '</b></p>'
      + '<div class="massa-resumo__acoes"><button type="button" data-r="voltar">Voltar</button><button type="button" class="massa-resumo__ok" data-r="ok">Confirmar e enviar</button></div></div>';
    el.addEventListener("click", function (e) {
      const r = e.target.dataset && e.target.dataset.r;
      if (r === "ok") { el.remove(); ok(); } else if (r === "voltar" || e.target === el) el.remove();
    });
    appMassa.appendChild(el);
  }

  /* Desenha a cena do prato final num canvas (miniatura da comanda e imagem de compartilhar) */
  function cenaParaCanvas(S) {
    const cena = massaPratoFinal.querySelector(".prato-cena");
    if (!cena || !massaPratoFinal.offsetWidth) return null;
    const f = S / massaPratoFinal.offsetWidth;
    const c = document.createElement("canvas"); c.width = c.height = S;
    const x = c.getContext("2d");
    x.drawImage(massaPratoFinalImg, 0, 0, S, S);
    [].slice.call(cena.children).sort(function (a, b) { return (+a.style.zIndex) - (+b.style.zIndex); }).forEach(function (el) {
      const cs = getComputedStyle(el), w = el.offsetWidth * f, h = el.offsetHeight * f;
      const m = cs.transform && cs.transform !== "none" ? new DOMMatrix(cs.transform) : new DOMMatrix();
      x.save();
      x.translate((el.offsetLeft + el.offsetWidth / 2) * f, (el.offsetTop + el.offsetHeight / 2) * f);
      x.transform(m.a, m.b, m.c, m.d, 0, 0);
      x.globalAlpha = parseFloat(cs.opacity);
      let fonte = el;
      if (el.classList.contains("prato-molho") || el.classList.contains("prato-tipo")) {
        const o = document.createElement("canvas"); o.width = Math.ceil(w); o.height = Math.ceil(h);
        const ox = o.getContext("2d");
        ox.drawImage(el, 0, 0, w, h);
        const feather = el.classList.contains("prato-molho--topo") || el.classList.contains("prato-molho--filme");
        ox.globalCompositeOperation = "destination-in";
        const g = ox.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        const solido = feather ? (parseFloat(getComputedStyle(cena).getPropertyValue("--molho-solido")) || 80) / 100 : 0.995;
        g.addColorStop(0, "#000"); g.addColorStop(solido, "#000"); g.addColorStop(1, "rgba(0,0,0,0)");
        ox.fillStyle = g; ox.fillRect(0, 0, w, h);
        fonte = o;
      }
      x.drawImage(fonte, -w / 2, -h / 2, w, h);
      x.restore();
    });
    return c;
  }
  function miniaturaNaComanda() {
    try {
      const c = cenaParaCanvas(240); if (!c) return;
      const ui = UI.massa;
      $$(".comanda__prato", ui.comanda).forEach(function (n) { n.remove(); });
      const im = new Image(); im.className = "comanda__prato"; im.alt = "Prato montado pelo cliente"; im.src = c.toDataURL("image/png");
      ui.itens.insertAdjacentElement("beforebegin", im);
    } catch (e) { }
  }

  /* Compartilhar meu prato */
  const btnShare = document.createElement("button");
  btnShare.type = "button"; btnShare.className = "massa-compartilhar"; btnShare.textContent = "\ud83d\udce4 Compartilhar meu prato";
  $("#massaEtapa4").appendChild(btnShare);
  btnShare.addEventListener("click", function () {
    const c = cenaParaCanvas(640); if (!c) return;
    const o = document.createElement("canvas"); o.width = 720; o.height = 820;
    const x = o.getContext("2d");
    x.fillStyle = "#f6edde"; x.fillRect(0, 0, 720, 820);
    x.drawImage(c, 40, 30, 640, 640);
    x.fillStyle = "#261a14"; x.textAlign = "center";
    x.font = "800 34px sans-serif"; x.fillText("Meu prato no PedeA\u00cd", 360, 725);
    x.font = "500 22px sans-serif"; x.fillStyle = "#75675c";
    x.fillText(linhaDoPedido("massa").slice(0, 60), 360, 770);
    o.toBlob(async function (b) {
      const file = new File([b], "meu-prato-pedeai.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Meu prato no PedeA\u00cd", text: linhaDoPedido("massa") }); } catch (e) { }
      } else {
        const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = file.name; a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
      }
    }, "image/png");
  });

  medirQueijo();
  medir();
  empilhar();
  addEventListener("resize", function () { medirQueijo(); empilhar(); });
  /* Celular: girar a tela ou cruzar o breakpoint de 767px muda o tamanho da
     frigideira. Refaz o prato final (sem animação) e reposiciona o queijo. */
  let resizeMassaTimer;
  function reajustarMassa() {
    clearTimeout(resizeMassaTimer);
    resizeMassaTimer = setTimeout(function () {
      if (massaPratoFinal.dataset.mostrado === "1") {
        desfazerPratoFinal();
        mostrarPratoFinal(true);
      } else if (!massaPanela.hidden) {
        posicionarQueijoWrapper();
      }
    }, 150);
  }
  addEventListener("resize", reajustarMassa);
  addEventListener("orientationchange", reajustarMassa);
  precificar("pizza");
  precificar("lanche");
  precificar("massa");
  dizer("Escolha o pão e toque para empilhar", null, null, "lanche");
  /* Inicializa o stepper da massa na etapa 1 */
  atualizarStepper(1);

  /* ================================================================
     CARROSSEL — navegação por abas e scroll-snap
     ================================================================ */
  (function () {
    var demos = document.getElementById("demos");
    var nav = document.getElementById("carrosselNav");
    var dotsEl = document.getElementById("carrosselDots");
    if (!demos || !nav) return;

    /* Ordem deve bater exatamente com a ordem no HTML e nos botões */
    var IDS = ["slidePizza", "slideMassa", "slideLanche"];
    var tabs = Array.prototype.slice.call(nav.querySelectorAll(".carrossel-tab"));
    var dots = dotsEl ? Array.prototype.slice.call(dotsEl.querySelectorAll(".carrossel-dot")) : [];

    var idxAtivo = 0;
    var scrollando = false; /* flag para evitar loop scroll ↔ ativar */

    /* ---- Ativa aba + pontinho + re-mede canvas se necessário ---- */
    function ativar(idx, viaScroll) {
      if (idx === idxAtivo && viaScroll) return; /* nada mudou */
      idxAtivo = idx;

      tabs.forEach(function (t, i) {
        var on = i === idx;
        t.classList.toggle("carrossel-tab--active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      dots.forEach(function (d, i) {
        d.classList.toggle("carrossel-dot--active", i === idx);
      });

      /* Re-mede elementos que dependem do tamanho visível */
      if (idx === 0) { try { medirQueijo(); } catch (e) { } }
      if (idx === 2) { try { medir(); empilhar(); } catch (e) { } }
    }

    /* ---- Scroll programático para o slide de índice i ---- */
    function irPara(idx) {
      /* Cada slide tem flex:0 0 100%, então posição = i * largura do container */
      var largura = demos.clientWidth;
      scrollando = true;
      demos.scrollTo({ left: idx * largura, behavior: "smooth" });
      /* Libera a flag após a animação terminar (~500 ms) */
      clearTimeout(demos._scrollTimer);
      demos._scrollTimer = setTimeout(function () { scrollando = false; }, 600);
    }

    /* ---- Clique nas abas ---- */
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        ativar(i, false);
        irPara(i);
      });
    });

    /* ---- Swipe / scroll manual: detecta o slide mais próximo ---- */
    var debounce;
    demos.addEventListener("scroll", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        if (scrollando) return; /* ignora scroll disparado pelo próprio irPara */
        var largura = demos.clientWidth;
        if (!largura) return;
        var idx = Math.round(demos.scrollLeft / largura);
        idx = Math.max(0, Math.min(IDS.length - 1, idx));
        ativar(idx, true);
      }, 80);
    }, { passive: true });

  })();

  /* ================================================================
     CHECKOUT / PAGAMENTO
     modo "demo": simulado. modo "producao": envia para a Edge Function create-order,
     que recalcula o preço no servidor (o total do navegador é só exibição).
     ================================================================ */
  (function () {
    const CFG = Object.assign({ modo: "demo", restaurante: "demo", apiUrl: "", anonKey: "", taxaEntrega: 8.9 }, window.PEDEAI_CONFIG || {});
    /* pedido.html?r=slug escolhe o restaurante; ?demo força o modo de demonstração */
    (function () {
      const q = new URLSearchParams(location.search), r = (q.get("r") || "").toLowerCase();
      if (/^[a-z0-9-]{1,60}$/.test(r)) CFG.restaurante = r;
      if (window.PEDEAI_DEMO === true) CFG.modo = "demo";   /* só demo.html liga isto */
    })();
    /* pedido.html fora do modo "producao": avisa, em vez de aceitar pedidos que não chegam a ninguém */
    if (window.PEDEAI_DEMO !== true && CFG.modo !== "producao") {
      const f = document.getElementById("restFaixa");
      if (f) {
        f.textContent = "Modo de teste: os pedidos feitos nesta página NÃO chegam ao restaurante. Avise o responsável pelo site.";
        f.classList.add("rest__faixa--fechado"); f.hidden = false;
      }
    }
    const modal = $("#modalCheckout"), overlay = $(".modal__overlay", modal), fechar = $(".modal__fechar", modal);
    const corpo = $(".modal__corpo", modal), sucesso = $(".modal__sucesso", modal), rodape = $("#modalRodape");
    const elItens = $("#modalItens"), elSubtotal = $("#modalSubtotal"), elTotal = $("#modalTotal");
    const btnConfirmar = $(".modal__confirmar"), btnNovo = $(".modal__novo"), elErro = $("#modalErro");
    const radiosEntrega = $$('input[name="entrega"]'), radiosPagamento = $$('input[name="pagamento"]');
    const qrPix = $("#modalQrPix"), qrCanvas = $("#qrCanvas"), endereco = $("#modalEndereco");
    const trocoBox = $("#modalTrocoBox");
    const campo = { nome: $("#modalNome"), tel: $("#modalTelefone"), rua: $("#modalRua"), numero: $("#modalNumero"), bairro: $("#modalBairro"), cep: $("#modalCep"), comp: $("#modalComplemento"), troco: $("#modalTroco") };

    let appAtual = null, subtotalAtual = 0, taxaEntrega = 0, formaPagamentoAtual = "dinheiro";
    let enviando = false, chaveIdem = "";

    $("#modalTaxaLabel").textContent = "+ " + reais(CFG.taxaEntrega);
    const novaChave = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "k-" + Date.now() + "-" + Math.random().toString(36).slice(2);
    const digitos = s => (s || "").replace(/\D/g, "");

    /* ================================================================
       AUTH DO CLIENTE — Supabase Auth (login / cadastro / logout)
       ================================================================ */
    const sbCliente = (CFG.modo === "producao" && window.supabase)
      ? window.supabase.createClient(CFG.apiUrl, CFG.anonKey, { auth: { storageKey: "pedeai-cliente" } })
      : null;
    let usuarioCliente = null;

    /* Dados públicos do restaurante (nome, aberto, taxa). Melhor esforço: quem decide é o servidor. */
    async function carregarRestaurante() {
      if (!sbCliente || CFG.modo !== "producao") return;
      try {
        const { data } = await sbCliente.from("restaurantes_publicos")
          .select("nome, aberto, taxa_entrega").eq("slug", CFG.restaurante).maybeSingle();
        if (!data) return;
        const faixa = $("#restFaixa");
        faixa.textContent = data.aberto ? data.nome : data.nome + " · fechado no momento";
        faixa.classList.toggle("rest__faixa--fechado", !data.aberto);
        faixa.hidden = false;
        document.title = data.nome + " · Faça seu pedido";
        if (data.taxa_entrega != null) {
          CFG.taxaEntrega = Number(data.taxa_entrega);
          $("#modalTaxaLabel").textContent = "+ " + reais(CFG.taxaEntrega);
        }
      } catch (e) { }
    }
    carregarRestaurante();

    function atualizarNavCliente() {
      const btnEntrar = $("#navCliente");
      const btnSair = $("#navSair");
      if (!btnEntrar || !btnSair) return;
      const ola = $("#navOla"), ped = $("#navPedidos"), fav = $("#navFavoritos");
      if (ped) ped.style.display = (CFG.modo === "producao" && usuarioCliente) ? "inline-flex" : "none";
      if (fav) fav.style.display = (CFG.modo === "producao" && usuarioCliente) ? "inline-flex" : "none";
      if (CFG.modo !== "producao") { btnEntrar.style.display = "none"; btnSair.style.display = "none"; if (ola) ola.hidden = true; return; }
      if (ola) {
        const md = (usuarioCliente && usuarioCliente.user_metadata) || {};
        const primeiro = String(md.nome || (usuarioCliente && usuarioCliente.email) || "").trim().split(/[\s@]/)[0];
        ola.textContent = usuarioCliente ? "Olá, " + primeiro : "";
        ola.hidden = !usuarioCliente;
      }
      if (usuarioCliente) {
        btnEntrar.style.display = "none";
        btnSair.style.display = "inline-flex";
        btnSair.textContent = "Sair";
      } else {
        btnEntrar.style.display = "inline-flex";
        btnSair.style.display = "none";
      }
    }

    async function carregarSessaoCliente() {
      if (!sbCliente) {
        console.warn("Supabase client não inicializado. Verifique config.js (apiUrl e anonKey).");
        return;
      }
      console.debug("Supabase anonKey prefix:", CFG.anonKey ? CFG.anonKey.substring(0, 20) + "..." : "VAZIA");
      try {
        const { data } = await sbCliente.auth.getSession();
        usuarioCliente = data.session?.user ?? null;
        atualizarNavCliente();
        sincronizarPedidos();
      } catch (e) {
        console.error("Supabase session error:", e);
        usuarioCliente = null;
        atualizarNavCliente();
      }
    }

    /* ================================================================
       MEUS PEDIDOS — lista do cliente, com status em tempo real
       (RLS: o cliente só enxerga os próprios pedidos; ver clientes.sql)
       ================================================================ */
    const modalPedidos = $("#modalPedidos");
    const listaPedidos = $("#pedidosLista"), pedidosVazio = $("#pedidosVazio"), pedidosErro = $("#pedidosErro");
    const ETAPAS_PEDIDO = [["recebido", "Recebido"], ["em_preparo", "Em preparo"], ["pronto", "Pronto"], ["saiu_entrega", "A caminho"], ["entregue", "Entregue"]];
    let canalPedidos = null, canalPedidosUsuario = null, recargaPedidos = null, pollPedidos = null;
    const pedMk = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };

    function etapasDoPedido(p) {
      return ETAPAS_PEDIDO
        .filter(e => p.tipo_entrega === "entrega" || e[0] !== "saiu_entrega")
        .map(e => (e[0] === "entregue" && p.tipo_entrega !== "entrega") ? ["entregue", "Retirado"] : e);
    }
    function cartaoPedido(p) {
      const c = pedMk("article", "pedido pedido--" + p.status);
      const cab = pedMk("div", "pedido__cab");
      cab.appendChild(pedMk("strong", "pedido__num", "#" + String(p.numero).padStart(4, "0")));
      cab.appendChild(pedMk("span", "pedido__data", new Date(p.criado_em).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })));
      c.appendChild(cab);
      if (p.status === "cancelado") {
        c.appendChild(pedMk("p", "pedido__cancelado", "Pedido cancelado"));
      } else {
        const etapas = etapasDoPedido(p), atual = etapas.findIndex(e => e[0] === p.status);
        const ol = pedMk("ol", "pedido__etapas");
        etapas.forEach(function (e, i) {
          const li = pedMk("li", i < atual ? "feito" : i === atual ? "atual" : "", e[1]);
          if (i === atual) li.setAttribute("aria-current", "step");
          ol.appendChild(li);
        });
        c.appendChild(ol);
      }
      const ul = pedMk("ul", "pedido__itens");
      (p.order_items || []).forEach(it => ul.appendChild(pedMk("li", null, it.descricao + (it.qtd > 1 ? " ×" + it.qtd : ""))));
      c.appendChild(ul);
      const rod = pedMk("div", "pedido__rodape");
      rod.appendChild(pedMk("span", null, p.tipo_entrega === "entrega" ? "Entrega" : "Retirada no local"));
      rod.appendChild(pedMk("strong", null, reais(Number(p.total))));
      c.appendChild(rod);
      const item = itemDoPedido(p);
      if (item) {
        const desc = p.order_items[0].descricao, ac = pedMk("div", "pedido__acoes");
        const novo = pedMk("button", "pedido__btn", "Pedir de novo"); novo.type = "button";
        novo.disabled = !itemValido(item);
        if (novo.disabled) novo.title = "Algum item saiu do cardápio";
        novo.addEventListener("click", () => pedirRapido(item, desc));
        const fav = pedMk("button", "pedido__btn pedido__btn--sec", "☆ Favoritar"); fav.type = "button";
        fav.addEventListener("click", () => salvarFavorito(item, desc, fav));
        ac.appendChild(novo); ac.appendChild(fav); c.appendChild(ac);
      }
      return c;
    }

    async function carregarPedidos() {
      if (!sbCliente || !usuarioCliente) return;
      const { data, error } = await sbCliente.from("orders")
        .select("id, numero, status, tipo_entrega, total, criado_em, order_items(tipo, descricao, config, qtd)")
        .eq("customer_id", usuarioCliente.id).order("criado_em", { ascending: false }).limit(20);
      if (error) { pedidosErro.textContent = "Não foi possível carregar seus pedidos."; pedidosErro.hidden = false; return; }
      pedidosErro.hidden = true;
      listaPedidos.replaceChildren(...data.map(cartaoPedido));
      pedidosVazio.hidden = data.length > 0;
    }
    function agendarRecargaPedidos() { clearTimeout(recargaPedidos); recargaPedidos = setTimeout(carregarPedidos, 300); }

    function abrirPedidos(e) {
      if (e) e.preventDefault();
      if (!usuarioCliente) return;
      modalPedidos.hidden = false; document.body.style.overflow = "hidden";
      carregarPedidos();
      clearInterval(pollPedidos); pollPedidos = setInterval(carregarPedidos, 30000); /* rede de segurança do Realtime */
    }
    function fecharPedidos() {
      if (modalPedidos.hidden) return;
      modalPedidos.hidden = true; document.body.style.overflow = "";
      clearInterval(pollPedidos);
    }

    /* Assina as mudanças dos pedidos do cliente logado; encerra no logout ou troca de conta */
    function sincronizarPedidos() {
      const uid = usuarioCliente ? usuarioCliente.id : null;
      if (uid === canalPedidosUsuario) return;
      if (canalPedidos && sbCliente) { sbCliente.removeChannel(canalPedidos); canalPedidos = null; }
      canalPedidosUsuario = uid;
      listaPedidos.replaceChildren();
      favoritos = []; listaFav.replaceChildren();
      if (!uid || !sbCliente) { fecharPedidos(); fecharFavoritos(); return; }
      canalPedidos = sbCliente.channel("meus-pedidos-" + uid)
        .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: "customer_id=eq." + uid }, agendarRecargaPedidos)
        .subscribe();
    }

    if (CFG.modo !== "producao") $("#modalVerPedidos").style.display = "none"; /* sem conta, não há o que acompanhar */
    $("#navPedidos").addEventListener("click", abrirPedidos);
    $("#modalVerPedidos").addEventListener("click", function () { fecharCheckout(); abrirPedidos(); });
    modalPedidos.querySelectorAll(".modal__fechar, .modal__overlay").forEach(b => b.addEventListener("click", fecharPedidos));
    document.addEventListener("keydown", e => { if (e.key === "Escape") fecharPedidos(); });

    /* ================================================================
       FAVORITOS — pedidos salvos para repetir com poucos toques
       (tabela "favoritos", protegida por RLS; ver favoritos.sql)
       Guarda só as escolhas (ids e quantidades). O preço é recalculado com o cardápio de hoje
       e, no envio, de novo pelo servidor.
       ================================================================ */
    const modalFav = $("#modalFavoritos"), listaFav = $("#favLista"), favVazio = $("#favVazio"), favErro = $("#favErro");
    let favoritos = [], itemRapido = null, ultimoPedido = null;

    const mapaOk = (mapa, lista, padrao) => Object.entries(mapa || {}).every(function (par) {
      const x = lista.find(i => i.id === par[0]);
      return !!x && Number.isInteger(par[1]) && par[1] >= 1 && par[1] <= (x.max || padrao);
    });
    const somaMapa = (mapa, lista) => Object.entries(mapa || {}).reduce((s, par) => s + par[1] * ((lista.find(i => i.id === par[0]) || {}).preco || 0), 0);
    function itemValido(it) {
      if (!it || typeof it !== "object") return false;
      if (it.tipo === "pizza") {
        if (!Object.prototype.hasOwnProperty.call(PIZZA.tamanhos, it.tamanho)) return false;
        if (it.borda != null && !(Array.isArray(it.borda) && it.borda.length <= bordaMax(it.tamanho) && it.borda.every(id => BORDAS.some(b => b.id === id)))) return false;
        if (Array.isArray(it.setores)) return it.setores.length >= 2 && it.setores.length <= (PIZZA.tamanhos[it.tamanho].sabores || 1)
          && it.setores.every(sx => mapaOk(sx && sx.ingredientes, PIZZA.ingredientes, MAX_PORCOES));
        return mapaOk(it.ingredientes, PIZZA.ingredientes, MAX_PORCOES);
      }
      if (it.tipo === "lanche") return PAES.some(p => p.id === it.pao) && mapaOk(it.camadas, LANCHE.camadas.filter(c => !c.fixo), 2);
      if (it.tipo === "massa") return MOLHOS_MASSA.some(m => m.id === it.molho) && TIPOS_MASSA.some(t => t.id === it.tipo_massa)
        && mapaOk(it.ingredientes, MASSA.ingredientes, 2) && mapaOk(it.finalizacoes, FINALIZACOES, 2);
      return false;
    }
    function precoItem(it) {
      if (it.tipo === "pizza") return PIZZA.tamanhos[it.tamanho].preco + (Array.isArray(it.setores)
        ? Math.max(...it.setores.map(sx => somaMapa(sx.ingredientes, PIZZA.ingredientes)))
        : somaMapa(it.ingredientes, PIZZA.ingredientes)) + precoBordaIds(it.borda);
      if (it.tipo === "lanche") return LANCHE.base + PAES.find(p => p.id === it.pao).preco + somaMapa(it.camadas, LANCHE.camadas);
      return MASSA.base + somaMapa(it.ingredientes, MASSA.ingredientes) + somaMapa(it.finalizacoes, FINALIZACOES);
    }
    function itemDoPedido(p) {
      const it = (p.order_items || [])[0];
      return it && it.config && typeof it.config === "object" ? Object.assign({ tipo: it.tipo }, it.config) : null;
    }

    /* Abre o checkout direto com um item salvo, sem passar pela montagem */
    function pedirRapido(item, descricao) {
      if (!usuarioCliente) return;
      if (!itemValido(item)) { mostrarFavErro("Alguns itens saíram do cardápio, então este pedido não pode ser repetido."); return; }
      fecharPedidos(); fecharFavoritos();
      abrirCheckout(item.tipo, Math.round(precoItem(item) * 100) / 100);
      itemRapido = item;               /* depois do abrirCheckout, que zera o valor */
      elItens.textContent = descricao;
    }

    async function salvarFavorito(item, descricao, btn) {
      if (!usuarioCliente || !sbCliente || !item) return;
      const sugestao = descricao.length > 60 ? descricao.slice(0, 57) + "…" : descricao;
      const nome = (window.prompt("Dê um nome ao favorito:", sugestao) || "").trim();
      if (!nome) return;
      const antes = btn.textContent;
      btn.disabled = true; btn.textContent = "Salvando…";
      const { error } = await sbCliente.from("favoritos").insert({ restaurante: CFG.restaurante, nome: nome.slice(0, 60), descricao: descricao.slice(0, 300), item: item });
      if (!error || error.code === "23505") {
        btn.textContent = error ? "★ Já é favorito" : "★ Salvo nos favoritos";   /* continua desativado */
        return;
      }
      btn.disabled = false; btn.textContent = "Não foi possível salvar";
      setTimeout(() => { btn.textContent = antes; }, 2500);
    }

    function mostrarFavErro(msg) { favErro.textContent = msg; favErro.hidden = !msg; }
    function cartaoFavorito(f) {
      const ok = itemValido(f.item);
      const c = pedMk("article", "pedido fav" + (ok ? "" : " fav--off"));
      const cab = pedMk("div", "pedido__cab");
      cab.appendChild(pedMk("strong", "pedido__num", f.nome));
      if (ok) cab.appendChild(pedMk("span", "pedido__data", reais(precoItem(f.item))));
      c.appendChild(cab);
      c.appendChild(pedMk("p", "fav__desc", f.descricao));
      if (!ok) c.appendChild(pedMk("p", "pedido__cancelado", "Alguns itens saíram do cardápio. Este favorito não pode ser pedido agora."));
      const ac = pedMk("div", "pedido__acoes");
      if (ok) {
        const pedir = pedMk("button", "pedido__btn", "Pedir"); pedir.type = "button";
        pedir.addEventListener("click", () => pedirRapido(f.item, f.descricao));
        ac.appendChild(pedir);
      }
      const rem = pedMk("button", "pedido__btn pedido__btn--sec", "Remover"); rem.type = "button";
      rem.addEventListener("click", async function () {
        if (!confirm("Remover “" + f.nome + "” dos favoritos?")) return;
        const { data, error } = await sbCliente.from("favoritos").delete().eq("id", f.id).select("id");
        if (error || !data || !data.length) { mostrarFavErro("Não foi possível remover. Tente de novo."); return; }
        favoritos = favoritos.filter(x => x.id !== f.id); renderFavoritos();
      });
      ac.appendChild(rem);
      c.appendChild(ac);
      return c;
    }
    function renderFavoritos() {
      listaFav.replaceChildren(...favoritos.map(cartaoFavorito));
      favVazio.hidden = favoritos.length > 0;
    }
    async function carregarFavoritos() {
      if (!sbCliente || !usuarioCliente) return;
      const { data, error } = await sbCliente.from("favoritos").select("id, nome, descricao, item")
        .eq("restaurante", CFG.restaurante).order("criado_em", { ascending: false });
      if (error) { mostrarFavErro("Não foi possível carregar seus favoritos."); return; }
      mostrarFavErro(""); favoritos = data; renderFavoritos();
    }
    function abrirFavoritos(e) {
      if (e) e.preventDefault();
      if (!usuarioCliente) return;
      modalFav.hidden = false; document.body.style.overflow = "hidden";
      carregarFavoritos();
    }
    function fecharFavoritos() {
      if (modalFav.hidden) return;
      modalFav.hidden = true; document.body.style.overflow = "";
    }
    if (CFG.modo !== "producao") $("#modalFavoritar").style.display = "none";
    $("#navFavoritos").addEventListener("click", abrirFavoritos);
    $("#modalFavoritar").addEventListener("click", function () { if (ultimoPedido) salvarFavorito(ultimoPedido.item, ultimoPedido.descricao, this); });
    modalFav.querySelectorAll(".modal__fechar, .modal__overlay").forEach(b => b.addEventListener("click", fecharFavoritos));
    document.addEventListener("keydown", e => { if (e.key === "Escape") fecharFavoritos(); });

    sbCliente?.auth.onAuthStateChange((event, session) => {
      usuarioCliente = session?.user ?? null;
      atualizarNavCliente();
      setTimeout(sincronizarPedidos, 0); /* fora do callback do Auth, para não travar o cliente */
    });

    /* Traduz os erros do Supabase Auth (chegam em inglês) para mensagens úteis */
    function traduzirErroAuth(e) {
      const txt = (((e && e.code) || "") + " " + ((e && e.message) || "")).toLowerCase();
      if (/not.?confirmed/.test(txt)) return "Confirme seu e-mail antes de entrar. Verifique a caixa de entrada e o spam.";
      if (/invalid.?(login|credentials)/.test(txt)) return "E-mail ou senha incorretos.";
      if (/already.?(registered|exists)|user_already_exists/.test(txt)) return "Este e-mail já está cadastrado. Tente entrar.";
      if (/not authorized|email_address_not_authorized/.test(txt)) return "Não foi possível enviar o e-mail de confirmação: o envio de e-mails do projeto ainda não está configurado.";
      if (/rate.?limit|too many|429/.test(txt) || (e && e.status === 429)) return "Muitas tentativas ou limite de e-mails atingido. Aguarde um pouco e tente de novo.";
      if (/weak_password|at least \d+ characters|should be at least/.test(txt)) return "A senha precisa ter pelo menos 6 caracteres.";
      if (/failed to fetch|network/.test(txt)) return "Sem conexão com o servidor. Verifique a internet.";
      return "Não foi possível concluir" + (e && e.message ? " (" + e.message + ")." : ".");
    }

    async function loginCliente(email, senha) {
      if (!sbCliente) throw new Error("Supabase não disponível");
      const { data, error } = await sbCliente.auth.signInWithPassword({ email, password: senha });
      if (error) {
        console.error("Supabase login error:", error);
        throw new Error(traduzirErroAuth(error));
      }
      console.log("Supabase login success:", data.user?.email);
    }

    async function cadastrarCliente(nome, email, senha) {
      if (!sbCliente) throw new Error("Supabase não disponível");
      const { data, error } = await sbCliente.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } }
      });
      if (error) { console.error("Supabase signUp error:", error); throw new Error(traduzirErroAuth(error)); }
      /* E-mail já cadastrado: o Supabase não dá erro (para não revelar contas), devolve identities vazio */
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error("Este e-mail já está cadastrado. Tente entrar.");
      }
      return data;
    }

    async function logoutCliente() {
      if (!sbCliente) return;
      await sbCliente.auth.signOut();
      usuarioCliente = null;
      atualizarNavCliente();
    }

    /* Inicializa sessão do cliente ao carregar */
    carregarSessaoCliente();

    /* máscaras simples */
    campo.tel.addEventListener("input", function () {
      const d = digitos(this.value).slice(0, 11);
      this.value = d.length > 6 ? "(" + d.slice(0, 2) + ") " + d.slice(2, d.length > 10 ? 7 : 6) + "-" + d.slice(d.length > 10 ? 7 : 6)
        : d.length > 2 ? "(" + d.slice(0, 2) + ") " + d.slice(2) : d;
    });
    campo.cep.addEventListener("input", function () {
      const d = digitos(this.value).slice(0, 8);
      this.value = d.length > 5 ? d.slice(0, 5) + "-" + d.slice(5) : d;
    });

    function mostrarErro(msg) { elErro.textContent = msg; elErro.hidden = !msg; }
    function limparErros() {
      mostrarErro("");
      Object.keys(campo).forEach(k => campo[k].removeAttribute("aria-invalid"));
    }
    Object.keys(campo).forEach(k => campo[k].addEventListener("input", function () { this.removeAttribute("aria-invalid"); }));

    function tipoEntrega() { return document.querySelector('input[name="entrega"]:checked').value; }

    function resetarOpcoes() {
      radiosEntrega.forEach(r => { r.checked = r.value === "retirada"; r.disabled = false; });
      radiosPagamento.forEach(r => { r.checked = r.value === "dinheiro"; });
      qrPix.hidden = true; endereco.hidden = true; trocoBox.hidden = false;
      taxaEntrega = 0; formaPagamentoAtual = "dinheiro";
      $("#modalDinheiroSub").textContent = "Na retirada";
      campo.troco.value = "";
    }
    function atualizarTotal() { elTotal.textContent = reais(subtotalAtual + taxaEntrega); }

    async function abrirCheckout(app, subtotal) {
      /* Se não estiver logado, abrir modal de login primeiro */
      if (!usuarioCliente && CFG.modo === "producao") {
        const modalLogin = $("#modalLoginCliente");
        modalLogin.hidden = false;
        document.body.style.overflow = "hidden";
        /* Armazena app e subtotal para usar após o login */
        modalLogin.dataset.appPendente = app;
        modalLogin.dataset.subtotalPendente = String(subtotal);
        return;
      }
      itemRapido = null; appAtual = app; subtotalAtual = subtotal; chaveIdem = novaChave(); enviando = false;
      resetarOpcoes(); limparErros();
      if (usuarioCliente && !campo.nome.value.trim()) campo.nome.value = (usuarioCliente.user_metadata && usuarioCliente.user_metadata.nome) || "";
      corpo.hidden = false; sucesso.hidden = true; rodape.hidden = false;
      btnConfirmar.disabled = false; btnConfirmar.textContent = "Confirmar pedido";
      elItens.textContent = linhaDoPedido(app);
      elSubtotal.textContent = reais(subtotal);
      atualizarTotal();
      const ui = UI[app];
      ui.comanda.hidden = true; ui.pedir.classList.remove("ok");
      modal.hidden = false; document.body.style.overflow = "hidden";
    }
    function fecharCheckout() {
      itemRapido = null;
      modal.hidden = true; sucesso.hidden = true; corpo.hidden = false; rodape.hidden = false;
      document.body.style.overflow = "";
    }

    radiosEntrega.forEach(r => r.addEventListener("change", function () {
      const ent = this.value === "entrega";
      taxaEntrega = ent ? CFG.taxaEntrega : 0;
      endereco.hidden = !ent;
      $("#modalDinheiroSub").textContent = ent ? "Na entrega" : "Na retirada";
      atualizarTotal();
    }));
    radiosPagamento.forEach(r => r.addEventListener("change", function () {
      formaPagamentoAtual = this.value;
      qrPix.hidden = this.value !== "pix";
      trocoBox.hidden = this.value !== "dinheiro";
      if (this.value === "pix") gerarQRCode();
    }));

    /* QR simulado (fase de testes — o Pix real entra numa etapa posterior) */
    function gerarQRCode() {
      const c = qrCanvas, x = c.getContext("2d"), tam = c.width, modulo = 10, cols = Math.floor(tam / modulo);
      x.fillStyle = "#fff"; x.fillRect(0, 0, tam, tam); x.fillStyle = "#000";
      for (let i = 0; i < cols; i++) for (let j = 0; j < cols; j++) {
        const borda = i < 7 || i > cols - 8 || j < 7 || j > cols - 8;
        if (borda ? Math.random() > 0.7 : Math.random() > 0.5) x.fillRect(i * modulo, j * modulo, modulo, modulo);
      }
      x.fillStyle = "#6A2CD8"; x.fillRect(tam / 2 - modulo / 2, tam / 2 - modulo / 2, modulo, modulo);
    }

    /* Validação: devolve a lista de campos inválidos */
    function validar() {
      const erros = [];
      const falta = (k, msg) => erros.push({ k, msg });
      if (campo.nome.value.trim().length < 2) falta("nome", "Informe seu nome.");
      const t = digitos(campo.tel.value);
      if (t.length < 10 || t.length > 11) falta("tel", "Informe um telefone com DDD.");
      if (tipoEntrega() === "entrega") {
        if (campo.rua.value.trim().length < 3) falta("rua", "Informe a rua ou avenida.");
        if (!campo.numero.value.trim()) falta("numero", "Informe o número (ou S/N).");
        if (campo.bairro.value.trim().length < 2) falta("bairro", "Informe o bairro.");
        const c = digitos(campo.cep.value);
        if (c && c.length !== 8) falta("cep", "O CEP deve ter 8 dígitos.");
      }
      if (formaPagamentoAtual === "dinheiro" && campo.troco.value.trim()) {
        const v = parseFloat(campo.troco.value.replace(/\./g, "").replace(",", "."));
        if (!(v >= subtotalAtual + taxaEntrega)) falta("troco", "O troco deve ser para um valor maior ou igual ao total.");
      }
      return erros;
    }

    /* Monta os itens só com IDs e quantidades — o servidor busca os preços */
    function montarItem(app) {
      if (itemRapido) return itemRapido;
      const so = (lista, mapa) => { const o = {}; lista.forEach(i => { const n = mapa(i.id) || 0; if (n > 0) o[i.id] = n; }); return o; };
      if (app === "pizza" && estado.k > 1) return {
        tipo: "pizza", tamanho: estado.tam, sabor: rotuloSabor(), ...(bordaIds().length ? { borda: bordaIds() } : {}),
        setores: estado.setores.map((st, i) => ({ sabor: rotuloSetor(i), ingredientes: so(PIZZA.ingredientes, id => st.porcoes[id]) }))
      };
      if (app === "pizza") return { tipo: "pizza", tamanho: estado.tam, ingredientes: so(PIZZA.ingredientes, id => estado.porcoes[id]), sabor: rotuloSabor(), ...(bordaIds().length ? { borda: bordaIds() } : {}) };
      if (app === "massa") return {
        tipo: "massa", molho: estado.massaMolho, tipo_massa: estado.massaRecipiente,
        ingredientes: so(MASSA.ingredientes, id => estado.massaPorcoes[id]),
        finalizacoes: so(FINALIZACOES, id => estado.massaPorcoes[id])
      };
      return { tipo: "lanche", pao: estado.pao, camadas: so(LANCHE.camadas.filter(c => !c.fixo), id => estado.lanche.get(id)) };
    }

    function montarPayload() {
      const ent = tipoEntrega() === "entrega";
      return {
        restaurante: CFG.restaurante, chave_idempotencia: chaveIdem,
        tipo_entrega: ent ? "entrega" : "retirada", pagamento: formaPagamentoAtual,
        troco_para: formaPagamentoAtual === "dinheiro" && campo.troco.value.trim() ? parseFloat(campo.troco.value.replace(/\./g, "").replace(",", ".")) : null,
        cliente: {
          nome: campo.nome.value.trim(),
          telefone: digitos(campo.tel.value)
        },
        endereco: ent ? { rua: campo.rua.value.trim(), numero: campo.numero.value.trim(), bairro: campo.bairro.value.trim(), cep: digitos(campo.cep.value), complemento: campo.comp.value.trim() } : null,
        itens: [montarItem(appAtual)]
      };
    }

    async function enviarPedido(payload) {
      if (CFG.modo !== "producao") {
        await new Promise(r => setTimeout(r, 500));
        return { numero: estado.pedido, total: subtotalAtual + taxaEntrega, simulado: true };
      }
      let resp, token = CFG.anonKey;
      try {
        const { data: sess } = await sbCliente.auth.getSession();
        if (sess && sess.session) token = sess.session.access_token;
      } catch (e) { }
      try {
        resp = await fetch(CFG.apiUrl.replace(/\/$/, "") + "/functions/v1/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: CFG.anonKey, Authorization: "Bearer " + token },
          body: JSON.stringify(payload)
        });
      } catch (e) { throw new Error("Sem conexão. Verifique sua internet e tente de novo."); }
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j.erro || "Não foi possível enviar o pedido. Tente novamente.");
      return j;
    }

    btnConfirmar.addEventListener("click", async function () {
      if (enviando) return;
      limparErros();
      const erros = validar();
      if (erros.length) {
        erros.forEach(e => campo[e.k].setAttribute("aria-invalid", "true"));
        mostrarErro(erros[0].msg); campo[erros[0].k].focus();
        return;
      }
      enviando = true; btnConfirmar.disabled = true; btnConfirmar.textContent = "Enviando…";
      try {
        const payload = montarPayload();
        const r = await enviarPedido(payload);
        ultimoPedido = { item: payload.itens[0], descricao: elItens.textContent };
        const bf = $("#modalFavoritar");
        if (bf) { bf.disabled = false; bf.textContent = "☆ Salvar como favorito"; }
        const ent = tipoEntrega() === "entrega";
        const pag = formaPagamentoAtual === "dinheiro" ? "Pagamento em dinheiro" + (ent ? " na entrega." : " na retirada.")
          : formaPagamentoAtual === "pix" ? "Pagamento via Pix — escaneie o QR code." : "Pagamento no cartão de crédito.";
        corpo.hidden = true; rodape.hidden = true; sucesso.hidden = false;
        $("#modalMsgSucesso").textContent = "Pedido #" + String(r.numero).padStart(4, "0") + ". " + (ent ? "Tele entrega." : "Retirada no local.") + " " + pag + " Total: " + reais(Number(r.total));
        if (CFG.modo !== "producao") $("#modalMsgSucesso").textContent += " (Pedido simulado: não foi enviado a nenhum restaurante.)";
      } catch (e) {
        mostrarErro(e.message); btnConfirmar.disabled = false; btnConfirmar.textContent = "Confirmar pedido";
      } finally { enviando = false; }
    });

    /* Novo pedido: lê o app ANTES de fechar (antes, o valor já tinha sido zerado) */
    btnNovo.addEventListener("click", function () {
      const app = appAtual;
      fecharCheckout();
      if (app === "massa") {
        recomecar();
        UI.massa.texto.textContent = "Próximo: molho →";
      } else {
        location.reload(); /* pizza e lanche ainda não têm função de reinício */
      }
    });

    fechar.addEventListener("click", fecharCheckout);
    overlay.addEventListener("click", fecharCheckout);
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) fecharCheckout(); });

    /* ================================================================
       MODAL DE LOGIN / CADASTRO DO CLIENTE
       ================================================================ */
    const modalLogin = $("#modalLoginCliente");
    const fecharLogin = modalLogin.querySelector(".modal__fechar");
    const overlayLogin = modalLogin.querySelector(".modal__overlay");
    const btnEntrarNav = $("#navCliente");
    const btnSairNav = $("#navSair");

    /* Abrir modal de login pelo nav */
    btnEntrarNav.addEventListener("click", function (e) {
      e.preventDefault();
      modalLogin.hidden = false;
      document.body.style.overflow = "hidden";
    });

    /* Fechar modal de login */
    function fecharModalLogin() {
      modalLogin.hidden = true;
      document.body.style.overflow = "";
    }
    modalLogin.querySelectorAll(".modal__fechar").forEach(b => b.addEventListener("click", fecharModalLogin));

    /* pedido.html?entrar (link da página de vendas): abre o login se ainda não houver sessão */
    if (new URLSearchParams(location.search).has("entrar") && CFG.modo === "producao" && sbCliente) {
      sbCliente.auth.getSession().then(function (r) {
        if (!r.data.session) { modalLogin.hidden = false; document.body.style.overflow = "hidden"; }
      });
    }
    overlayLogin.addEventListener("click", fecharModalLogin);
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && !modalLogin.hidden) fecharModalLogin();
    });

    /* Trocar entre abas login/cadastro */
    $$("#modalLoginCliente .auth__tab").forEach(tab => {
      tab.addEventListener("click", function () {
        $$("#modalLoginCliente .auth__tab").forEach(t => t.classList.remove("auth__tab--active"));
        this.classList.add("auth__tab--active");
        const aba = this.dataset.aba;
        const mostrarLogin = aba === "login";
        $("#authLogin").hidden = !mostrarLogin;
        $("#authCadastro").hidden = mostrarLogin;
        $("#authLogin").classList.toggle("auth__painel--ativo", mostrarLogin);
        $("#authCadastro").classList.toggle("auth__painel--ativo", !mostrarLogin);
        $("#loginErro").hidden = true;
        $("#cadastroErro").hidden = true;
      });
    });

    /* Links "Crie aqui" / "Entrar" dentro do modal */
    $$("#modalLoginCliente .auth__link").forEach(link => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const aba = this.dataset.aba;
        $$("#modalLoginCliente .auth__tab").forEach(t => t.classList.remove("auth__tab--active"));
        $("#modalLoginCliente .auth__tab[data-aba='" + aba + "']").classList.add("auth__tab--active");
        const mostrarLogin = aba === "login";
        $("#authLogin").hidden = !mostrarLogin;
        $("#authCadastro").hidden = mostrarLogin;
        $("#authLogin").classList.toggle("auth__painel--ativo", mostrarLogin);
        $("#authCadastro").classList.toggle("auth__painel--ativo", !mostrarLogin);
        $("#loginErro").hidden = true;
        $("#cadastroErro").hidden = true;
      });
    });

    /* Se o cliente clicou em "pedir" sem estar logado, retoma o checkout depois de entrar */
    async function seguirCheckoutPendente() {
      const appPendente = modalLogin.dataset.appPendente;
      const subtotalPendente = modalLogin.dataset.subtotalPendente;
      if (appPendente && subtotalPendente) {
        delete modalLogin.dataset.appPendente;
        delete modalLogin.dataset.subtotalPendente;
        await abrirCheckout(appPendente, parseFloat(subtotalPendente));
      }
    }

    /* Submit do form de login */
    $("#formLoginCliente").addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = $("#loginEmail").value.trim();
      const senha = $("#loginSenha").value;
      $("#loginErro").hidden = true;
      try {
        await loginCliente(email, senha);
        fecharModalLogin();
        await seguirCheckoutPendente();
      } catch (err) {
        $("#loginErro").textContent = err.message || "Erro ao entrar";
        $("#loginErro").hidden = false;
      }
    });

    /* Submit do form de cadastro */
    $("#formCadastroCliente").addEventListener("submit", async function (e) {
      e.preventDefault();
      const nome = $("#cadNome").value.trim();
      const email = $("#cadEmail").value.trim();
      const senha = $("#cadSenha").value;
      const senha2 = $("#cadSenha2").value;
      const cadErro = $("#cadastroErro");
      const erroCad = msg => { cadErro.style.color = ""; cadErro.textContent = msg; cadErro.hidden = false; };
      cadErro.hidden = true; cadErro.style.color = "";
      if (nome.length < 2) return erroCad("Informe seu nome.");
      if (senha.length < 6) return erroCad("A senha precisa ter pelo menos 6 caracteres.");
      if (senha !== senha2) return erroCad("As senhas não coincidem.");
      try {
        const r = await cadastrarCliente(nome, email, senha);
        if (r && r.session) { /* confirmação de e-mail desligada: já entrou */
          fecharModalLogin();
          await seguirCheckoutPendente();
          return;
        }
        cadErro.style.color = "var(--verde)";
        cadErro.textContent = "Conta criada! Enviamos um e-mail de confirmação para " + email + ". Confirme e depois entre.";
        cadErro.hidden = false;
      } catch (err) {
        erroCad(err.message || "Erro ao criar conta");
      }
    });

    /* Botão Sair no nav */
    btnSairNav.addEventListener("click", function (e) {
      e.preventDefault();
      logoutCliente();
    });

    window.abrirCheckout = abrirCheckout;
  })();

})();

