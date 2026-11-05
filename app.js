/* PedeAÍ · construtor de hamburger, pizza e massa */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const tx = (s, v) => v ? s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)) : s;
  const reais = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function vibrar(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
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
  const PIZZA = {
    tamanhos: { P: { preco: 34.9, escala: 0.84 }, M: { preco: 42.9, escala: 0.92 }, G: { preco: 49.9, escala: 1 } },
    ingredientes: [
      { id: "mucarela", nome: "Muçarela", preco: 5, camada: true, arte: "farelo" },
      { id: "calabresa", nome: "Calabresa", preco: 6, n: 10, tam: 0.16 },
      { id: "pepperoni", nome: "Pepperoni", preco: 7, n: 10, tam: 0.16 },
      { id: "bacon", nome: "Bacon", preco: 6, n: 12, tam: 0.14 },
      { id: "catupiry", nome: "Catupiry", preco: 6, molho: true },
      { id: "cheddar", nome: "Cheddar", preco: 6, molho: true },
      { id: "milho", nome: "Milho", preco: 3, n: 48, tam: 0.05, graos: "milho", v: 8 },
      { id: "ervilha", nome: "Ervilha", preco: 3, n: 44, tam: 0.048, graos: "ervilha", v: 8 },
      { id: "cogumelo", nome: "Cogumelo", preco: 5, n: 11, tam: 0.145 },
      { id: "azeitona", nome: "Azeitona", preco: 3, n: 16, tam: 0.095 },
      { id: "manjericao", nome: "Manjericão", preco: 2, n: 9, tam: 0.15, folha: true },
      { id: "pimentao", nome: "Pimentão", preco: 3, n: 9, tam: 0.17 },
      { id: "cebola", nome: "Cebola", preco: 2, n: 11, tam: 0.14 },
      { id: "tomate", nome: "Tomate", preco: 4, n: 11, tam: 0.155 },
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
    if (app === "pizza") return PIZZA.tamanhos[estado.tam].preco + PIZZA.ingredientes.reduce((s, i) => s + estado.porcoes[i.id] * i.preco, 0);
    if (app === "massa") return MASSA.base + MASSA.ingredientes.reduce((s, i) => s + (estado.massaPorcoes[i.id] || 0) * i.preco, 0);
    return LANCHE.base + PAES.find(p => p.id === estado.pao).preco + LANCHE.camadas.filter(c => !c.fixo).reduce((s, c) => s + (estado.lanche.get(c.id) || 0) * c.preco, 0);
  }
  function precificar(app, delta) {
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
      const it = PIZZA.ingredientes.filter(i => estado.porcoes[i.id]).map(i => i.nome.toLowerCase() + (estado.porcoes[i.id] > 1 ? " ×2" : ""));
      return `Pizza ${estado.tam}: ${it.length ? it.join(", ") : "só molho"}`;
    }
    if (app === "massa") {
      const it = MASSA.ingredientes.filter(i => (estado.massaPorcoes[i.id] || 0) > 0).map(i => i.nome.toLowerCase() + ((estado.massaPorcoes[i.id] || 0) > 1 ? " ×" + (estado.massaPorcoes[i.id] || 0) : ""));
      const molhoNome = estado.massaMolho ? (MOLHOS_MASSA.find(function(m) { return m.id === estado.massaMolho; }) || {}).nome || estado.massaMolho : null;
      const tipoNome  = estado.massaRecipiente ? (TIPOS_MASSA.find(function(t) { return t.id === estado.massaRecipiente; }) || {}).nome || estado.massaRecipiente : null;
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
    ui.comanda.hidden = true;
    void ui.comanda.offsetWidth;
    ui.comanda.hidden = false;
    ui.pedir.classList.add("ok");
    ui.texto.textContent = "Chegou na cozinha";
    clearTimeout(ui.fecha);
    ui.fecha = setTimeout(() => { if (!ui.comanda.matches(":hover")) ui.comanda.hidden = true; }, 9000);
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
      { id: "bacon", nome: "Bacon", preco: 4, cat: "carnes", arte: "bacon", pasta: "massas", max: 2 },
      { id: "calabresa", nome: "Calabresa", preco: 4, cat: "carnes", arte: "calabresa", pasta: "massas", max: 2 },
      { id: "presunto", nome: "Presunto", preco: 3, cat: "carnes", arte: "presunto", pasta: "massas", max: 2 },
      { id: "salsicha", nome: "Salsicha", preco: 3, cat: "carnes", arte: "salsicha", pasta: "massas", max: 2 },
      { id: "frango", nome: "Frango", preco: 4, cat: "carnes", arte: "frango", pasta: "massas", max: 2 },
      { id: "lombo", nome: "Lombo defumado", preco: 6, cat: "carnes", arte: "lombo", pasta: "massas", max: 2 },
      { id: "costela", nome: "Costela desfiada", preco: 7, cat: "carnes", arte: "costela", pasta: "massas", max: 2 },
      /* Legumes */
      { id: "pimentoes", nome: "Pimentões", preco: 2, cat: "legumes", arte: "pimentao", pasta: "pizza", max: 2 },
      { id: "brocolis", nome: "Brócolis", preco: 3, cat: "legumes", arte: "brocolis", pasta: "massas", max: 2 },
      { id: "tomate", nome: "Tomate", preco: 2, cat: "legumes", arte: "tomate", pasta: "pizza", max: 2 },
      { id: "champignon", nome: "Champignon", preco: 3, cat: "legumes", arte: "cogumelo", pasta: "pizza", max: 2 },
      { id: "ervilha", nome: "Ervilha", preco: 2, cat: "legumes", arte: "ervilha", pasta: "pizza", max: 2 },
      { id: "milho", nome: "Milho", preco: 2, cat: "legumes", arte: "milho", pasta: "pizza", max: 2 },
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
  MASSA.ingredientes.forEach(i => { estado.massaPorcoes[i.id] = 0; });
  function chip(item, grade, aoTocar, aoTirar, app = "pizza") {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip";
    b.setAttribute("aria-label", "Adicionar " + item.nome);
    const fotos = item.mini
      ? `<span class="ca ca0 ca-unica"><img src="${item.mini}" alt=""></span>`
      : `<span class="ca ca1"><img src="${IMG_PIZZA}t-${item.arte || item.id}-1.webp" alt=""></span><span class="ca ca2"><img src="${IMG_PIZZA}t-${item.arte || item.id}-2.webp" alt=""></span><span class="ca ca0"><img src="${IMG_PIZZA}t-${item.arte || item.id}-0.webp" alt=""></span>`;
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
    ], { duration: 420, easing: "cubic-bezier(.3,.6,.4,1)", fill: "both" }).finished.catch(() => {}).then(() => v.remove());
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
        ], { duration: queda / 0.7, fill: "backwards" }).finished.catch(() => {}).then(() => { el.style.zIndex = String(z + 1); });
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
  function pincelar(u, v, camada, forca) {
    const t = queijo.tam;
    if (!t) return;
    const c = queijo.camadas[camada], x = c.mascara.getContext("2d"), m = t / 2;
    x.save();
    x.beginPath(); x.arc(m, m, 0.8 * m, 0, Math.PI * 2); x.clip();
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
  function espiral(camada, instantaneo) {
    medirQueijo();
    const passo = (k) => { const s = k / 72, a = s * Math.PI * 6.4, r = 0.08 + 0.64 * s; return [Math.cos(a) * r, Math.sin(a) * r]; };
    if (instantaneo || calmo) { for (let k = 0; k < 72; k++) { const [u, v] = passo(k); pincelar(u, v, camada, 1.1); } return; }
    const t0 = performance.now(), g = roda();
    let feito = 0;
    const quadro = () => {
      const e = Math.min(1, (performance.now() - t0) / 1100);
      const ate = Math.floor(72 * e);
      for (let k = feito; k < ate; k++) {
        const [u, v] = passo(k);
        pincelar(u, v, camada, 1.1);
        if (k % 3 === 0) farelos(g.cx + u * g.R, g.cy + v * g.R - 20);
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
  };
  ["catupiry", "cheddar"].forEach(id => { molhos[id] = { tela: $("#molho-" + id), trilhas: [] }; });
  function desenharMolho(id) {
    const m = molhos[id], t = m.tela.width, c = t / 2, x = m.tela.getContext("2d"), cor = CORES[id];
    const w = t * 0.036;
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
  function bisnagar(item, volta) {
    const m = molhos[item.id], t = queijo.tam;
    medirQueijo();
    if (!t) return;
    const giro0 = Math.random() * Math.PI * 2 + volta * Math.PI;
    const meio = item.id === "cheddar" ? 0.045 : 0;
    const r0 = (volta ? 0.6 : 0.66) - meio, r1 = (volta ? 0.14 : 0.08) + meio, voltas = 3.1;
    const N = 440;
    const ponto = s => { const a = giro0 + s * Math.PI * 2 * voltas, r = r0 - (r0 - r1) * s + 0.012 * Math.sin(a * 7); return [Math.cos(a) * r, Math.sin(a) * r]; };
    const trilha = { pts: Array.from({ length: N + 1 }, (_, i) => ponto(i / N)), ate: 0 };
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
  function lugares(n, item) {
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
    pc.innerHTML = `<div class="pc-sh"></div><div class="pc-art"><img class="rw" src="${src}" alt=""><img class="ck${item.folha ? " ck-folha" : item.derrete ? " ck-creme" : ""}" src="${src}" alt=""></div>`;
    const sombra = pc.firstChild, art = pc.lastChild;
    art.style.transform = `rotate(${giro}deg) scale(${esc})`;
    cobertura.appendChild(pc);
    const peca = { el: pc, art, u: alvo.u, v: alvo.v, item, r: giro, sc: esc };
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
  let toques = 0;
  function adicionar(item) {
    if (estado.forno) return;
    const n = estado.porcoes[item.id];
    if (n >= MAX_PORCOES) { tremer(item); dizer("Duas porções é o máximo"); return; }
    estado.porcoes[item.id] = n + 1;
    toques++;
    marcar(item, n + 1);
    precificar("pizza", item.preco);
    dizer(toques === 1 ? "Toque de novo para porção dupla" : n === 1 && item.camada ? "Queijo extra" : "");
    if (item.camada) { espiral(n, false); return; }
    if (item.molho) { bisnagar(item, n); return; }
    const de = { x: item.chip.getBoundingClientRect().left + item.chip.getBoundingClientRect().width / 2, y: item.chip.getBoundingClientRect().top + item.chip.getBoundingClientRect().height / 2 };
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
    if (item.molho) { limparMolho(item, true); dizer(estado.pecas.length ? "" : "Toque num ingrediente para adicionar"); return; }
    if (item.camada) { limparQueijo(true); dizer(estado.pecas.length ? "" : "Toque num ingrediente para adicionar"); return; }
    const alvo = { x: item.chip.getBoundingClientRect().left + item.chip.getBoundingClientRect().width / 2, y: item.chip.getBoundingClientRect().top + item.chip.getBoundingClientRect().height / 2 };
    const g = roda(), s = escalaGiro();
    const sai = estado.pecas.filter(p => p.item === item);
    estado.pecas = estado.pecas.filter(p => p.item !== item);
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

  /* ---- Pizza: tamanho ---- */
  $$(".tamanhos button").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.tam === estado.tam || estado.forno) return;
    estado.mexeu = true;
    const antes = total("pizza");
    const cresce = PIZZA.tamanhos[b.dataset.tam].escala > escalaGiro();
    estado.tam = b.dataset.tam;
    $$(".tamanhos button").forEach(x => x.setAttribute("aria-checked", x === b ? "true" : "false"));
    const k = escalaGiro();
    giroEl.style.transform = `scale(${k})`;
    if (!calmo) giroEl.animate([{ transform: `scale(${k * (cresce ? 0.92 : 1.07)})` }, { transform: `scale(${k * (cresce ? 1.03 : 0.98)})`, offset: 0.6 }, { transform: `scale(${k})` }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    vibrar(6);
    soltarPedido("pizza");
    precificar("pizza", total("pizza") - antes);
  }));

  /* ---- Pizza: o forno ---- */
  const fornoEl = $("#forno"), fornoVid = $("#fornoVid"), fogoVid = $("#fogoVid"), brilho = $("#brilho");
  const calor = $("#calor"), anel = $("#anel"), assadaEl = $("#assada"), appEl = $("#appPizza"), barraForno = $("#barra-pizza");
  const tocar = v => { try { v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
  function assar() {
    if (estado.forno === "assando") return;
    if (estado.forno === "assada") {
      UI.pizza.pedir.animate([{ transform: "scale(1)" }, { transform: "scale(.96)" }, { transform: "scale(1)" }], { duration: 260 });
      vibrar(12);
      return entregar("pizza");
    }
    if (!PIZZA.ingredientes.some(i => estado.porcoes[i.id])) {
      UI.pizza.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
      dizer("Coloque um ingrediente primeiro");
      vibrar([8, 30, 8]);
      return;
    }
    estado.forno = "assando";
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
    try { fornoVid.pause(); fogoVid.pause(); } catch (e) {}
    vibrar([10, 40, 10]);
    entregar("pizza");
    dizer("Feita no fogo.", montarOutra, "Montar outra");
  }
  function montarOutra() {
    estado.mexeu = true;
    estado.pecas.forEach((p, i) => {
      p.el.animate([{ transform: "translate(0, 0) scale(1)", opacity: 1 }, { transform: "translate(0, -18px) scale(0)", opacity: 0 }], { duration: 260, delay: 7 * i, easing: "ease-in", fill: "forwards" }).onfinish = () => p.el.remove();
    });
    estado.pecas = [];
    toques = 0;
    PIZZA.ingredientes.forEach(i => { estado.porcoes[i.id] = 0; marcar(i, 0); });
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
  const massaEl        = $("#massa");
  const massaMolhoImg  = $("#massaMolhoImg");
  const massaTipoImg   = $("#massaTipoImg");

  let massaEtapa = 1;
  let massaMolhoSel = null;
  let massaTipoSel  = null;

  const MOLHOS_MASSA = [
    { id: "bolonhesa", nome: "Bolonhesa",    img: "molho-bolonhesa.webp", tex: "tex-bolonhesa.webp" },
    { id: "sugo",      nome: "Sugo",          img: "molho-sugo.webp",      tex: "tex-sugo.webp"      },
    { id: "branco",    nome: "Molho branco",  img: "molho-branco.webp",    tex: "tex-branco.webp"    },
    { id: "rose",      nome: "Rosé",          img: "molho-rose.webp",      tex: "tex-rose.webp"      },
    { id: "3queijos",  nome: "4 queijos",     img: "molho-3queijos.webp",  tex: "tex-3queijos.webp"  },
    { id: "alhoeoleo", nome: "Alho e Óleo",  img: "molho-alhoeoleo.webp", tex: "tex-alhoeoleo.webp" },
  ];
  const TIPOS_MASSA = [
    { id: "espaguete", nome: "Espaguete", img: "massa-espaguete.webp" },
    { id: "penne",     nome: "Penne",     img: "massa-penne.webp"     },
    { id: "parafuso",  nome: "Parafuso",  img: "massa-parafuso.webp"  },
    { id: "talharim",  nome: "Talharim",  img: "massa-talharim.webp"  },
  ];
  const FINALIZACOES = [
    { id: "queijo-fin",   nome: "Muçarela extra", img: "queijo.webp",   pasta: "massas", preco: 3 },
    { id: "catupiry-fin", nome: "Catupiry",        arte: "catupiry",    pasta: "pizza",  preco: 5 },
    { id: "cheddar-fin",  nome: "Cheddar",         arte: "cheddar",     pasta: "pizza",  preco: 5 },
  ];

  /* ---- Atualiza o stepper visual ---- */
  function atualizarStepper(etapa) {
    massaEtapa = etapa;
    $$("#massaStepper .massa__step").forEach(el => {
      const n = Number(el.dataset.etapa);
      el.classList.toggle("massa__step--active", n === etapa);
      el.classList.toggle("massa__step--done",   n < etapa);
    });
    const titulos = ["", "Escolha o recheio", "Escolha o molho", "Tipo de massa", "Finalizar o prato"];
    const subs    = ["", "Coloque quantos quiser · 2 toques é dupla", "Toque no molho para adicionar", "Escolha o formato da massa", "Adicione os toques finais"];
    $("#massaTitulo").textContent = titulos[etapa];
    $("#massaSub").textContent    = subs[etapa];
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
    massaMolhoImg.getAnimations().forEach(function(a) { a.cancel(); });
    massaMolhoImg.src = texSrc;
    massaMolhoImg.hidden = false;
    massaMolhoImg.style.opacity = "0";
    if (calmo) { massaMolhoImg.style.opacity = "1"; pronto && pronto(); return; }
    const concha = imgFixa(IMG_MASSA + "ferr-concha.webp", "ferramenta");
    const rMassa = massaEl.getBoundingClientRect();
    const cx = rMassa.left + rMassa.width  * 0.5;
    const cy = rMassa.top  + rMassa.height * 0.42;
    const ini = { x: rMassa.right + 60, y: rMassa.top - 60 };
    const ctl = { x: (ini.x + cx) / 2, y: ini.y - 40 };
    const larg = 120;
    const CONCHA_AX = 0.25, CONCHA_AY = 0.85;
    const t0 = performance.now(), D = 700;
    const ir = () => {
      const t = Math.min(1, (performance.now() - t0) / D), e = suave(t);
      const x = curva(ini.x, ctl.x, cx, e), y = curva(ini.y, ctl.y, cy, e);
      concha.style.width = larg + "px";
      concha.style.transform = `translate(${(x - CONCHA_AX * larg).toFixed(1)}px,${(y - CONCHA_AY * larg * 0.6).toFixed(1)}px) rotate(${-30 + e * 50}deg)`;
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
      b.style.left = (r.left + r.width  * (0.15 + 0.7 * Math.random())) + "px";
      b.style.top  = (r.top  + r.height * (0.2  + 0.6 * Math.random())) + "px";
      document.body.appendChild(b);
      const dy = -(14 + Math.random() * 20);
      b.animate([
        { transform: "scale(.3)", opacity: 0 },
        { transform: "scale(1)",  opacity: 0.8, offset: 0.3 },
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
      v.style.top  = (r.top + r.height * 0.3) + "px";
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
      { transform: "translate(-50%,-50%) translateY(-80px) scale(.7) rotate(-8deg)", opacity: 0 },
      { transform: "translate(-50%,-50%) translateY(4px) scale(1.08) rotate(2deg)", opacity: 1, offset: 0.7, easing: "cubic-bezier(.55,0,1,.45)" },
      { transform: "translate(-50%,-50%) translateY(0) scale(1) rotate(0deg)", opacity: 1 },
    ], { duration: 520, easing: "ease-out", fill: "forwards" });
    setTimeout(() => {
      vaporizarFrigideira(massaConteudo, 8);
      vibrar([8, 30, 8]);
      pronto && pronto();
    }, 400);
  }

  /* ---- Bisnaga de queijo na finalização ---- */
  function bisnagarFinal(item, pronto) {
    if (calmo || !massaEl) { pronto && pronto(); return; }
    const r = massaEl.getBoundingClientRect();
    const cx = r.left + r.width  * 0.5;
    const cy = r.top  + r.height * 0.42;
    const srcMap = {
      "catupiry-fin": IMG_PIZZA + "bisnaga-catupiry.webp",
      "cheddar-fin":  IMG_PIZZA + "bisnaga-cheddar.webp"
    };
    const bis = imgFixa(srcMap[item.id] || IMG_PIZZA + "bisnaga-catupiry.webp", "ferramenta");
    const larg = 100;
    const AX = 0.0058, AY = 0.98, Hratio = 0.88;
    const ini = { x: r.right + 50, y: r.top - 40 };
    const ctl = { x: (ini.x + cx) / 2, y: ini.y - 60 };
    const t0 = performance.now(), D = 580;
    const ir = () => {
      const t = Math.min(1, (performance.now() - t0) / D), e = suave(t);
      const x = curva(ini.x, ctl.x, cx, e), y = curva(ini.y, ctl.y, cy, e);
      bis.style.width = larg + "px";
      bis.style.transform = `translate(${(x - AX * larg).toFixed(1)}px,${(y - AY * larg * Hratio).toFixed(1)}px) rotate(${-25 + e * 35}deg)`;
      if (t < 1) return requestAnimationFrame(ir);
      borbolhar(massaConteudo, 5);
      bis.animate([
        { opacity: 1 },
        { transform: bis.style.transform + " translate(60px,-80px) rotate(-20deg)", opacity: 0 }
      ], { duration: 320, easing: "ease-in", fill: "forwards" }).onfinish = () => { bis.remove(); pronto && pronto(); };
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
    for (let k = 0; k < 3; k++) {
      const r = LIM * Math.sqrt((k + 0.5) / 3);
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

      const vImg = document.createElement("img");
      vImg.src = imgSrc;
      vImg.onerror = function() { vImg.src = pastaDir + "t-" + baseArte + "-0.webp"; };
      vImg.className = "voo";
      vImg.style.width = "28px";
      vImg.style.height = "28px";
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
        vImg.style.transform = `translate(${x - 14}px, ${y - 14}px) rotate(${rot}deg) scale(${esc})`;
        if (t < 1) requestAnimationFrame(anima);
        else {
          vImg.remove();
          const peca = document.createElement("img");
          peca.src = imgSrc;
          peca.onerror = function() { peca.src = pastaDir + "t-" + baseArte + "-0.webp"; };
          peca.className = "massa-peca";
          peca.dataset.id = item.id;
          peca.style.left = `calc(50% + ${px.toFixed(1)}px - 14px)`;
          peca.style.top = `calc(50% + ${py.toFixed(1)}px - 14px)`;
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

  /* ---- tirarDaFrigideira — remove imagens de um ingrediente ---- */
  function tirarDaFrigideira(item, qtdPorcoes) {
    if (!massaConteudo) return;
    const qtd = qtdPorcoes || 1;
    const pecas = [].slice.call(massaConteudo.querySelectorAll('.massa-peca[data-id="' + item.id + '"]'));
    const alvo = pecas.slice(-(qtd * 3));
    alvo.forEach(function(p, idx) {
      p.animate([
        { opacity: 1, transform: p.style.transform },
        { opacity: 0, transform: p.style.transform + " translateY(-14px) scale(0.3)" }
      ], { duration: 220, delay: idx * 20, easing: "ease-in" }).onfinish = function() { p.remove(); };
    });
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
    b.addEventListener("pointerdown", function(e) {
      if (e.target.closest(".cuba-menos")) return;
      x0 = e.clientX;
      b.classList.add("apertado");
      seguro = setTimeout(function() {
        seguro = null;
        b.classList.remove("apertado");
        b.dataset.segurou = "1";
        aoTirar(item, b, true);
      }, 460);
    });
    const solta = function() { b.classList.remove("apertado"); clearTimeout(seguro); };
    b.addEventListener("pointerup", solta);
    b.addEventListener("pointerleave", solta);
    b.addEventListener("pointercancel", solta);
    b.addEventListener("pointermove", function(e) { if (Math.abs(e.clientX - x0) > 8) solta(); });
    b.addEventListener("click", function(e) {
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
    MASSA.ingredientes.forEach(function(item) {
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
          marcarCuba(item, n + 1);
          precificar("massa", item.preco);
          soltarPedido("massa");
          dizer(item.nome + " \xd7" + (n + 1), null, null, "massa");
          jogarNaFrigideira(item, item.cubaEl);
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
          if (!MASSA.ingredientes.some(function(i) { return (estado.massaPorcoes[i.id] || 0) > 0; })) {
            dizer("Toque nas cubas para jogar na frigideira", null, null, "massa");
          } else {
            dizer(novoN > 0 ? it.nome + " \xd7" + novoN : "Tirou " + it.nome.toLowerCase(), null, null, "massa");
          }
        }
      );
    });
    $$(".cuba-btn", ingMassaGrade).forEach(function(c) {
      c.style.display = (c.dataset.cat === "carnes") ? "flex" : "none";
    });
  }

  /* ---- Abas de categoria (Etapa 1) ---- */
  const massaTabs = $$(".massa__tab");
  massaTabs.forEach(function(tab) {
    tab.addEventListener("click", function() {
      massaTabs.forEach(function(t) { t.classList.toggle("massa__tab--active", t === tab); });
      const cat = tab.dataset.cat;
      $$(".cuba-btn", ingMassaGrade).forEach(function(c) {
        c.style.display = (c.dataset.cat === cat) ? "flex" : "none";
      });
      dizer("Escolha os itens de " + tab.textContent.toLowerCase(), null, null, "massa");
    });
  });

  /* ---- Build Etapa 2: seleção de molho ---- */
  const ingMolhoGrade = $("#ingMolho");
  if (ingMolhoGrade) {
    MOLHOS_MASSA.forEach(function(molho) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cuba-btn";
      b.setAttribute("aria-label", molho.nome);
      b.innerHTML = '<div class="cuba-art"><img class="cuba-item-img" src="' + IMG_MASSA + molho.img + '" alt="' + molho.nome + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></div>'
        + '<span class="cuba-nome">' + molho.nome + '</span>'
        + '<span class="cuba-preco">incluso</span>';
      b.addEventListener("click", function() {
        if (massaMolhoSel && massaMolhoSel.id === molho.id) return;
        $$(".cuba-btn", ingMolhoGrade).forEach(function(x) { x.classList.remove("cuba-selecionado"); });
        b.classList.add("cuba-selecionado");
        massaMolhoSel = molho;
        estado.massaMolho = molho.id;
        dizer("Molho " + molho.nome + " selecionado", null, null, "massa");
        derramarMolho(molho, null);
        vibrar(6);
      });
      ingMolhoGrade.appendChild(b);
    });
  }

  /* ---- Build Etapa 3: tipo de massa ---- */
  const ingTipoGrade = $("#ingTipoMassa");
  if (ingTipoGrade) {
    TIPOS_MASSA.forEach(function(tipo) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cuba-btn";
      b.setAttribute("aria-label", tipo.nome);
      b.innerHTML = '<div class="cuba-art"><img class="cuba-item-img" src="' + IMG_MASSA + tipo.img + '" alt="' + tipo.nome + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%"></div>'
        + '<span class="cuba-nome">' + tipo.nome + '</span>'
        + '<span class="cuba-preco">incluso</span>';
      b.addEventListener("click", function() {
        $$(".cuba-btn", ingTipoGrade).forEach(function(x) { x.classList.remove("cuba-selecionado"); });
        b.classList.add("cuba-selecionado");
        massaTipoSel = tipo;
        estado.massaRecipiente = tipo.id;
        dizer(tipo.nome + " selecionado", null, null, "massa");
        jogarTipoMassa(tipo, null);
        vibrar(6);
      });
      ingTipoGrade.appendChild(b);
    });
  }

  /* ---- Build Etapa 4: finalizações ---- */
  const ingFinalGrade = $("#ingFinal");
  if (ingFinalGrade) {
    FINALIZACOES.forEach(function(item) {
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
      b.addEventListener("click", function() {
        if (nFin >= 2) {
          b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 250 });
          return;
        }
        nFin++;
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
  UI.massa.pedir.addEventListener("click", function() {
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
      dizer("Adicione os toques finais", null, null, "massa");
    } else {
      const temIng = MASSA.ingredientes.some(function(i) { return (estado.massaPorcoes[i.id] || 0) > 0; });
      if (!temIng) {
        ui.pedir.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 });
        dizer("Volte e adicione ao menos um ingrediente", null, null, "massa");
        vibrar([8, 30, 8]);
        return;
      }
      animarFinal();
      setTimeout(function() { entregar("massa"); }, 800);
    }
  });

  medirQueijo();
  medir();
  empilhar();
  addEventListener("resize", function() { medirQueijo(); empilhar(); });
  precificar("pizza");
  precificar("lanche");
  precificar("massa");
  dizer("Escolha o pão e toque para empilhar", null, null, "lanche");
  /* Inicializa o stepper da massa na etapa 1 */
  atualizarStepper(1);

  /* ================================================================
     CARROSSEL — navegação por abas e scroll-snap
     ================================================================ */
  (function() {
    var demos  = document.getElementById("demos");
    var nav    = document.getElementById("carrosselNav");
    var dotsEl = document.getElementById("carrosselDots");
    if (!demos || !nav) return;

    /* Ordem deve bater exatamente com a ordem no HTML e nos botões */
    var IDS  = ["slidePizza", "slideMassa", "slideLanche"];
    var tabs = Array.prototype.slice.call(nav.querySelectorAll(".carrossel-tab"));
    var dots = dotsEl ? Array.prototype.slice.call(dotsEl.querySelectorAll(".carrossel-dot")) : [];

    var idxAtivo = 0;
    var scrollando = false; /* flag para evitar loop scroll ↔ ativar */

    /* ---- Ativa aba + pontinho + re-mede canvas se necessário ---- */
    function ativar(idx, viaScroll) {
      if (idx === idxAtivo && viaScroll) return; /* nada mudou */
      idxAtivo = idx;

      tabs.forEach(function(t, i) {
        var on = i === idx;
        t.classList.toggle("carrossel-tab--active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      dots.forEach(function(d, i) {
        d.classList.toggle("carrossel-dot--active", i === idx);
      });

      /* Re-mede elementos que dependem do tamanho visível */
      if (idx === 0) { try { medirQueijo(); } catch(e){} }
      if (idx === 2) { try { medir(); empilhar(); } catch(e){} }
    }

    /* ---- Scroll programático para o slide de índice i ---- */
    function irPara(idx) {
      /* Cada slide tem flex:0 0 100%, então posição = i * largura do container */
      var largura = demos.clientWidth;
      scrollando = true;
      demos.scrollTo({ left: idx * largura, behavior: "smooth" });
      /* Libera a flag após a animação terminar (~500 ms) */
      clearTimeout(demos._scrollTimer);
      demos._scrollTimer = setTimeout(function() { scrollando = false; }, 600);
    }

    /* ---- Clique nas abas ---- */
    tabs.forEach(function(tab, i) {
      tab.addEventListener("click", function() {
        ativar(i, false);
        irPara(i);
      });
    });

    /* ---- Swipe / scroll manual: detecta o slide mais próximo ---- */
    var debounce;
    demos.addEventListener("scroll", function() {
      clearTimeout(debounce);
      debounce = setTimeout(function() {
        if (scrollando) return; /* ignora scroll disparado pelo próprio irPara */
        var largura = demos.clientWidth;
        if (!largura) return;
        var idx = Math.round(demos.scrollLeft / largura);
        idx = Math.max(0, Math.min(IDS.length - 1, idx));
        ativar(idx, true);
      }, 80);
    }, { passive: true });

  })();

})();
