/* PedeAÍ · painel da cozinha
   - Login da equipe (Supabase Auth) e pedidos em tempo real (Realtime), filtrados pelo restaurante.
   - A segurança real está no banco (RLS): mesmo que alguém abra esta página, só vê o que a conta permite.
   - TODO texto vindo de pedidos é inserido com textContent (nunca innerHTML): o cliente digita esses campos. */
(function () {
  "use strict";
  const CFG = Object.assign({ restaurante: "demo", apiUrl: "", anonKey: "" }, window.PEDEAI_CONFIG || {});
  { const r = (new URLSearchParams(location.search).get("r") || "").toLowerCase(); if (/^[a-z0-9-]{1,60}$/.test(r)) CFG.restaurante = r; }
  const DEMO = new URLSearchParams(location.search).has("demo") || !(CFG.apiUrl && CFG.anonKey && window.supabase);

  const $ = (s, e) => (e || document).querySelector(s);
  const reais = v => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const num = n => "#" + String(n).padStart(4, "0");
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const FINAIS = ["entregue", "cancelado"];

  const COLUNAS = [
    { status: "recebido", titulo: "Novos" },
    { status: "em_preparo", titulo: "Em preparo" },
    { status: "pronto", titulo: "Prontos" },
    { status: "saiu_entrega", titulo: "Saiu para entrega" }
  ];
  function proximo(o) {
    if (o.status === "recebido") return { status: "em_preparo", rotulo: "Iniciar preparo" };
    if (o.status === "em_preparo") return { status: "pronto", rotulo: "Marcar como pronto" };
    if (o.status === "pronto") return o.tipo_entrega === "entrega"
      ? { status: "saiu_entrega", rotulo: "Saiu para entrega" } : { status: "entregue", rotulo: "Entregue ao cliente" };
    if (o.status === "saiu_entrega") return { status: "entregue", rotulo: "Entregue" };
    return null;
  }

  let sb = null, usuario = null, restId = null, restNome = "", canal = null;
  const pedidos = new Map();   /* id → pedido (com order_items) */
  const novos = new Set();     /* ids ainda não "vistos": destacados e com alerta */
  let primeiraCarga = true, somLigado = true, audioCtx = null;

  /* ---------------------------------------------------------------- som e título */
  document.addEventListener("click", function () {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (e) { }
  });
  function alertaSonoro() {
    if (!somLigado || !audioCtx) return;
    [660, 880, 660].forEach(function (f, i) {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain(), t = audioCtx.currentTime + i * 0.18;
      o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.start(t); o.stop(t + 0.17);
    });
  }
  $("#btnSom").addEventListener("click", function () {
    somLigado = !somLigado;
    this.textContent = somLigado ? "🔔 Som: ligado" : "🔕 Som: desligado";
  });
  function marcarNovo(id) {
    novos.add(id);
    if (!$("#cardapio").hidden) $("#abaPedidos").dataset.novo = "1";
    alertaSonoro();
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { }
  }

  /* ---------------------------------------------------------------- tela */
  function minutos(o) { return Math.max(0, Math.floor((Date.now() - new Date(o.criado_em).getTime()) / 60000)); }
  function aviso(msg) { const a = $("#aviso"); a.textContent = msg || ""; a.hidden = !msg; if (msg) setTimeout(() => { a.hidden = true; }, 6000); }

  function linha(rot, val, cls) {
    const p = el("p", "cartao__linha" + (cls ? " " + cls : ""));
    p.appendChild(el("span", "cartao__rot", rot));
    p.appendChild(el("span", null, val));
    return p;
  }
  function pagamentoTexto(o) {
    const nome = { dinheiro: "Dinheiro", pix: "Pix", cartao: "Cartão" }[o.pagamento] || o.pagamento;
    return o.pagamento === "dinheiro" && o.troco_para ? nome + " · troco para " + reais(o.troco_para) : nome;
  }
  function enderecoTexto(e) {
    if (!e) return "";
    return [e.rua + ", " + e.numero, e.bairro, e.complemento, e.cep ? "CEP " + e.cep : ""].filter(Boolean).join(" · ");
  }

  function cartao(o) {
    const min = minutos(o);
    const c = el("article", "cartao cartao--" + o.status);
    if (novos.has(o.id)) c.classList.add("novo");
    if (["recebido", "em_preparo"].includes(o.status)) c.classList.add(min >= 25 ? "atraso" : min >= 15 ? "atencao" : "ok");

    const cab = el("div", "cartao__cab");
    cab.appendChild(el("strong", "cartao__num", num(o.numero)));
    cab.appendChild(el("span", "selo selo--" + o.tipo_entrega, o.tipo_entrega === "entrega" ? "Entrega" : "Retirada"));
    cab.appendChild(el("span", "cartao__tempo", min < 1 ? "agora" : "há " + min + " min"));
    c.appendChild(cab);

    const cli = el("p", "cartao__cliente");
    cli.appendChild(el("span", null, o.cliente_nome + " · "));
    const tel = el("a", null, o.cliente_telefone);
    tel.href = "tel:" + String(o.cliente_telefone).replace(/\D/g, "");
    cli.appendChild(tel);
    c.appendChild(cli);
    if (o.tipo_entrega === "entrega") c.appendChild(linha("Entregar em", enderecoTexto(o.endereco)));

    const ul = el("ul", "cartao__itens");
    (o.order_items || []).forEach(function (it) {
      ul.appendChild(el("li", null, it.descricao + (it.qtd > 1 ? " ×" + it.qtd : "")));
    });
    c.appendChild(ul);
    c.appendChild(linha("Pagamento", pagamentoTexto(o) + " · " + reais(o.total), "cartao__pag"));

    const acoes = el("div", "cartao__acoes");
    const prox = proximo(o);
    if (prox) {
      const b = el("button", "btn btn--principal", prox.rotulo);
      b.type = "button"; b.addEventListener("click", () => mudarStatus(o, prox.status));
      acoes.appendChild(b);
    }
    const imp = el("button", "btn", "Imprimir"); imp.type = "button";
    imp.addEventListener("click", () => imprimir(o));
    acoes.appendChild(imp);
    if (["recebido", "em_preparo"].includes(o.status)) {
      const x = el("button", "btn btn--perigo", "Cancelar"); x.type = "button";
      x.addEventListener("click", () => { if (confirm("Cancelar o pedido " + num(o.numero) + "?")) mudarStatus(o, "cancelado"); });
      acoes.appendChild(x);
    }
    c.appendChild(acoes);
    return c;
  }

  function render() {
    const quadro = $("#quadro");
    quadro.replaceChildren();
    const lista = [...pedidos.values()].sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em));
    COLUNAS.forEach(function (col) {
      const doStatus = lista.filter(o => o.status === col.status);
      const sec = el("section", "coluna");
      const h = el("h2", "coluna__titulo", col.titulo);
      h.appendChild(el("span", "coluna__qtd", String(doStatus.length)));
      sec.appendChild(h);
      if (!doStatus.length) sec.appendChild(el("p", "coluna__vazia", "Nenhum pedido"));
      doStatus.forEach(o => sec.appendChild(cartao(o)));
      quadro.appendChild(sec);
    });
    $("#contagem").textContent = lista.length + " em aberto";
    document.title = (novos.size ? "(" + novos.size + ") Novo pedido · " : "") + "PedeAÍ · Cozinha";
  }
  /* Atualiza os "há X min" e os alertas de atraso */
  setInterval(function () { if (!$("#painel").hidden) render(); }, 30000);
  /* Pedido novo deixa de piscar quando a equipe interage com a tela */
  /* (sem render(): recriar os botões durante o toque faria o clique se perder) */
  document.addEventListener("pointerdown", function () {
    if (!novos.size) return;
    novos.clear();
    document.querySelectorAll(".cartao.novo").forEach(c => c.classList.remove("novo"));
    document.title = "PedeAÍ · Cozinha";
  }, { passive: true });


  /* ---------------------------------------------------------------- loja e cardápio (edição pelo dono)
     Quem pode gravar é o banco (RLS + permissões de coluna): sem permissão, a atualização volta vazia. */
  const ROTULOS = [
    ["pizza.tamanho", "Pizza · Tamanhos"], ["pizza.ingrediente", "Pizza · Ingredientes"],
    ["lanche.base", "Hambúrguer · Base"], ["lanche.pao", "Hambúrguer · Pães"], ["lanche.ingrediente", "Hambúrguer · Ingredientes"],
    ["massa.base", "Massas · Base"], ["massa.molho", "Massas · Molhos"], ["massa.tipo", "Massas · Tipos de massa"],
    ["massa.ingrediente", "Massas · Ingredientes"], ["massa.finalizacao", "Massas · Finalizações"]
  ];
  const SEM_PRECO = ["massa.molho", "massa.tipo"];                 /* o servidor não cobra por estes */
  const COM_MAX = ["lanche.ingrediente", "massa.ingrediente", "pizza.tamanho"];     /* o app do cliente respeita o limite só nestes */
  let itensMenu = [], cardapioCarregado = false, catAtual = "todas", lojaAberta = true;
  const fechados = new Set();          /* produtos recolhidos na barra lateral */
  const resumos = new Map();           /* grupo → função que reescreve o "14 itens · 2 fora do ar" */
  const movel = window.matchMedia("(max-width: 700px)");
  const DEMO_MENU = [
    { grupo: "pizza.tamanho", ref_id: "G", nome: "Pizza G", preco: 49.9, max_qtd: 1, ativo: true },
    { grupo: "pizza.ingrediente", ref_id: "bacon", nome: "Bacon", preco: 6, max_qtd: 2, ativo: true },
    { grupo: "lanche.ingrediente", ref_id: "carne", nome: "Carne", preco: 10, max_qtd: 3, ativo: true },
    { grupo: "lanche.ingrediente", ref_id: "ovo", nome: "Ovo", preco: 3, max_qtd: 2, ativo: false }
  ];
  const semAcento = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const erroGravar = erro => erro ? "Não foi possível salvar. Verifique a conexão e tente de novo." : "Sem permissão: apenas o dono do restaurante altera o cardápio.";

  function trocarAba(nome) {
    const card = nome === "cardapio";
    $("#quadro").hidden = card; $("#cardapio").hidden = !card;
    document.querySelectorAll(".aba").forEach(function (b) {
      const ativa = b.dataset.aba === nome;
      b.classList.toggle("aba--ativa", ativa); b.setAttribute("aria-pressed", String(ativa));
    });
    if (!card) delete $("#abaPedidos").dataset.novo;
    if (card && !cardapioCarregado) carregarCardapio();
  }
  document.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => trocarAba(b.dataset.aba)));

  $("#dicaBtn").addEventListener("click", function () {
    const dica = $("#cardapioDica");
    dica.hidden = !dica.hidden; this.setAttribute("aria-expanded", String(!dica.hidden));
  });

  /* ---- Loja: aberto/fechado (chave no topo, vale em qualquer aba) e taxa de entrega ---- */
  function pintarLoja() {
    $("#topoAberto").checked = lojaAberta;
    $("#topoAbertoTxt").textContent = lojaAberta ? "Aberto" : "Fechado";
    $("#faixaFechado").hidden = lojaAberta;
  }
  async function carregarLoja() {
    const taxa = $("#lojaTaxa");
    if (DEMO) { lojaAberta = true; taxa.value = "8.90"; taxa.dataset.antes = "8.90"; pintarLoja(); return; }
    const { data } = await sb.from("restaurants").select("aberto, taxa_entrega").eq("id", restId).maybeSingle();
    if (!data) return;
    lojaAberta = !!data.aberto;
    taxa.value = Number(data.taxa_entrega).toFixed(2); taxa.dataset.antes = taxa.value;
    pintarLoja();
  }
  async function salvarLoja(campos, desfazer, msg) {
    if (msg) { msg.textContent = "Salvando…"; msg.classList.remove("item__msg--erro"); }
    if (DEMO) { if (msg) msg.textContent = "Salvo (demonstração)"; return; }
    const { data, error } = await sb.from("restaurants").update(campos).eq("id", restId).select("id");
    if (error || !data || !data.length) {
      desfazer();
      if (msg) { msg.textContent = "Não salvou"; msg.classList.add("item__msg--erro"); }
      aviso(erroGravar(error));
      return;
    }
    if (msg) { msg.textContent = "Salvo ✓"; setTimeout(() => { msg.textContent = ""; }, 2000); }
  }
  $("#topoAberto").addEventListener("change", function () {
    const novo = this.checked;
    if (!novo && !confirm("Fechar o restaurante? Os clientes não conseguirão fazer novos pedidos até você abrir de novo.")) { this.checked = true; return; }
    lojaAberta = novo; pintarLoja();
    salvarLoja({ aberto: novo }, function () { lojaAberta = !novo; pintarLoja(); }, null);
  });
  $("#lojaTaxa").addEventListener("change", function () {
    const inp = this, v = Math.round(Number(inp.value) * 100) / 100, antes = inp.dataset.antes || "";
    if (inp.value === "" || !Number.isFinite(v) || v < 0 || v > 999) { inp.value = antes; aviso("Informe uma taxa entre 0 e 999."); return; }
    inp.value = v.toFixed(2); inp.dataset.antes = inp.value;
    salvarLoja({ taxa_entrega: v }, function () { inp.value = antes; inp.dataset.antes = antes; }, $("#lojaMsg"));
  });

  /* ---- Cardápio ---- */
  async function carregarCardapio() {
    if (DEMO) {
      itensMenu = DEMO_MENU.map(i => Object.assign({}, i));
    } else {
      const { data, error } = await sb.from("menu_items").select("grupo, ref_id, nome, preco, max_qtd, ativo").eq("restaurant_id", restId);
      if (error || !data) { aviso("Não foi possível carregar o cardápio."); return; }
      itensMenu = data.map(i => Object.assign({}, i, { preco: Number(i.preco) }));
    }
    const g = ROTULOS.find(x => itensMenu.some(i => i.grupo === x[0]));
    catAtual = g ? g[0] : "todas";
    cardapioCarregado = true; renderCardapio();
  }

  function listaGrupos() {
    const grupos = ROTULOS.filter(g => itensMenu.some(i => i.grupo === g[0]));
    itensMenu.forEach(i => { if (!grupos.some(g => g[0] === i.grupo)) grupos.push([i.grupo, "Outros · " + i.grupo]); });
    return grupos;
  }

  /* Barra lateral: categorias agrupadas por produto; no celular vira uma fileira de botões */
  function renderCategorias() {
    const nav = $("#cardapioCats");
    nav.replaceChildren();
    const buscando = !!$("#cardapioBusca").value.trim();
    function botao(id, texto, itens) {
      const ativa = !buscando && catAtual === id;
      const b = el("button", "cat" + (ativa ? " cat--ativa" : ""));
      b.type = "button"; b.setAttribute("aria-pressed", String(ativa));
      b.appendChild(el("span", null, texto));
      const fora = itens.filter(i => !i.ativo).length;
      const q = el("span", "cat__qtd", fora ? (itens.length - fora) + "/" + itens.length : String(itens.length));
      if (fora) q.title = fora + (fora > 1 ? " itens fora do ar" : " item fora do ar");
      b.appendChild(q);
      b.addEventListener("click", function () { catAtual = id; $("#cardapioBusca").value = ""; renderCardapio(); });
      return b;
    }
    nav.appendChild(botao("todas", "Todas", itensMenu));
    const porProduto = new Map();
    listaGrupos().forEach(function (g) {
      const partes = g[1].split(" · "), prod = partes[0], sub = partes[1] || partes[0];
      if (!porProduto.has(prod)) porProduto.set(prod, []);
      porProduto.get(prod).push(botao(g[0], sub, itensMenu.filter(i => i.grupo === g[0])));
    });
    porProduto.forEach(function (botoes, prod) {
      if (movel.matches) { botoes.forEach(b => nav.appendChild(b)); return; }
      const d = el("details", "cats__grupo");
      d.open = !fechados.has(prod);
      d.appendChild(el("summary", "cats__prod", prod));
      botoes.forEach(b => d.appendChild(b));
      d.addEventListener("toggle", function () { if (d.open) fechados.delete(prod); else fechados.add(prod); });
      nav.appendChild(d);
    });
  }
  movel.addEventListener("change", () => { if (cardapioCarregado) renderCardapio(); });

  function renderCardapio() {
    renderCategorias();
    resumos.clear();
    const busca = semAcento($("#cardapioBusca").value.trim());
    const lista = $("#cardapioLista");
    lista.replaceChildren();
    let achou = false;
    listaGrupos().forEach(function (g) {
      if (!busca && catAtual !== "todas" && catAtual !== g[0]) return;
      const itens = itensMenu.filter(i => i.grupo === g[0] && (!busca || semAcento(i.nome).includes(busca)));
      if (!itens.length) return;
      achou = true;
      itens.sort((a, b) => g[0] === "pizza.tamanho" ? a.preco - b.preco : a.nome.localeCompare(b.nome, "pt-BR"));
      lista.appendChild(secaoGrupo(g, itens));
    });
    if (!achou) lista.appendChild(el("p", "coluna__vazia", itensMenu.length ? "Nenhum item encontrado." : "Nenhum item cadastrado para este restaurante."));
  }
  $("#cardapioBusca").addEventListener("input", renderCardapio);

  function secaoGrupo(g, itens) {
    const sec = el("section", "cardapio__grupo");
    const cab = el("div", "cardapio__cab");
    cab.appendChild(el("h2", "cardapio__titulo", g[1]));
    const resumo = el("span", "cardapio__resumo");
    const pinta = function () {
      const fora = itens.filter(i => !i.ativo).length;
      resumo.textContent = itens.length + (itens.length > 1 ? " itens" : " item") + (fora ? " · " + fora + " fora do ar" : "");
    };
    pinta(); resumos.set(g[0], pinta);
    cab.appendChild(resumo);
    const lote = el("div", "cardapio__lote");
    const liga = el("button", "btn-mini", "Ligar todos"), desliga = el("button", "btn-mini btn-mini--perigo", "Desligar todos");
    liga.type = desliga.type = "button";
    liga.addEventListener("click", () => ligarTodos(g, itens, true));
    desliga.addEventListener("click", () => ligarTodos(g, itens, false));
    lote.appendChild(liga); lote.appendChild(desliga);
    cab.appendChild(lote);
    sec.appendChild(cab);

    const cabCols = el("div", "item item--cab", null);
    ["Item", SEM_PRECO.includes(g[0]) ? "" : "Preço", COM_MAX.includes(g[0]) ? (g[0] === "pizza.tamanho" ? "Sabores" : "Máx.") : "", "Disponível", ""].forEach(t => cabCols.appendChild(el("span", null, t)));
    cabCols.setAttribute("aria-hidden", "true");
    sec.appendChild(cabCols);
    itens.forEach(i => sec.appendChild(linhaItem(i)));
    return sec;
  }

  function linhaItem(it) {
    const li = el("div", "item" + (it.ativo ? "" : " item--off"));
    const c = { li: li, msg: el("span", "item__msg"), t: 0 };
    li.appendChild(el("strong", "item__nome", it.nome));

    if (!SEM_PRECO.includes(it.grupo)) {
      const lp = el("label", "item__campo", "R$ ");
      c.ip = el("input"); c.ip.type = "number"; c.ip.min = "0"; c.ip.max = "9999"; c.ip.step = "0.1"; c.ip.inputMode = "decimal";
      c.ip.value = it.preco.toFixed(2); c.ip.setAttribute("aria-label", "Preço: " + it.nome);
      lp.appendChild(c.ip); li.appendChild(lp);
      c.ip.addEventListener("change", function () {
        const v = Math.round(Number(c.ip.value) * 100) / 100;
        if (c.ip.value === "" || !Number.isFinite(v) || v < 0 || v > 9999) { reverter(it, c); aviso("Informe um preço entre 0 e 9999."); return; }
        salvarItem(it, { preco: v }, c);
      });
    } else li.appendChild(el("span", "item__vazio"));

    if (COM_MAX.includes(it.grupo)) {
      const lm = el("label", "item__campo", it.grupo === "pizza.tamanho" ? "Sabores " : "Máx. ");
      c.mx = el("input"); c.mx.type = "number"; c.mx.min = "1"; c.mx.max = "10"; c.mx.step = "1"; c.mx.inputMode = "numeric";
      c.mx.value = String(it.max_qtd); c.mx.setAttribute("aria-label", (it.grupo === "pizza.tamanho" ? "Quantidade de sabores: " : "Quantidade máxima: ") + it.nome);
      lm.appendChild(c.mx); li.appendChild(lm);
      c.mx.addEventListener("change", function () {
        const v = Number(c.mx.value);
        if (!Number.isInteger(v) || v < 1 || v > 10) { reverter(it, c); aviso("O máximo deve ser um número de 1 a 10."); return; }
        salvarItem(it, { max_qtd: v }, c);
      });
    } else li.appendChild(el("span", "item__vazio"));

    const sw = el("label", "sw");
    c.cb = el("input", "sw__in"); c.cb.type = "checkbox"; c.cb.setAttribute("role", "switch"); c.cb.checked = it.ativo;
    c.cb.setAttribute("aria-label", "Disponível: " + it.nome);
    c.txt = el("span", "sw__txt", it.ativo ? "No ar" : "Fora do ar");
    sw.appendChild(c.cb); sw.appendChild(el("span", "sw__trilho")); sw.appendChild(c.txt);
    li.appendChild(sw);
    c.cb.addEventListener("change", () => salvarItem(it, { ativo: c.cb.checked }, c));

    li.appendChild(c.msg);
    return li;
  }

  function pintarItem(it, c) {
    c.cb.checked = it.ativo;
    c.txt.textContent = it.ativo ? "No ar" : "Fora do ar";
    c.li.classList.toggle("item--off", !it.ativo);
  }
  function reverter(it, c) {
    if (c.ip) c.ip.value = it.preco.toFixed(2);
    if (c.mx) c.mx.value = String(it.max_qtd);
    pintarItem(it, c);
  }
  function status(c, txt, erro) {
    c.msg.textContent = txt; c.msg.classList.toggle("item__msg--erro", !!erro);
    clearTimeout(c.t);
    if (!erro && txt) c.t = setTimeout(() => { c.msg.textContent = ""; }, 2000);
  }
  function atualizarContagens(grupo) {
    renderCategorias();
    const f = resumos.get(grupo); if (f) f();
  }
  async function salvarItem(it, campos, c) {
    const antes = {};
    Object.keys(campos).forEach(k => { antes[k] = it[k]; });
    Object.assign(it, campos);
    pintarItem(it, c);
    status(c, "Salvando…");
    if (DEMO) { status(c, "Salvo (demonstração)"); atualizarContagens(it.grupo); return; }
    const { data, error } = await sb.from("menu_items").update(campos)
      .eq("restaurant_id", restId).eq("grupo", it.grupo).eq("ref_id", it.ref_id).select("ref_id");
    if (error || !data || !data.length) {
      Object.assign(it, antes); reverter(it, c);
      status(c, "Não salvou", true); atualizarContagens(it.grupo);
      aviso(erroGravar(error));
      return;
    }
    status(c, "Salvo ✓"); atualizarContagens(it.grupo);
  }

  /* Liga ou desliga de uma vez os itens que estão na tela, dentro da categoria */
  async function ligarTodos(g, itens, ativo) {
    const alvo = itens.filter(i => i.ativo !== ativo);
    if (!alvo.length) return;
    if (!ativo && !confirm("Tirar do ar " + alvo.length + (alvo.length > 1 ? " itens" : " item") + " de “" + g[1] + "”?")) return;
    const antes = alvo.map(i => i.ativo);
    alvo.forEach(i => { i.ativo = ativo; });
    if (!DEMO) {
      const { data, error } = await sb.from("menu_items").update({ ativo: ativo })
        .eq("restaurant_id", restId).eq("grupo", g[0]).in("ref_id", alvo.map(i => i.ref_id)).select("ref_id");
      if (error || !data || data.length !== alvo.length) {
        if (data && data.length) { cardapioCarregado = false; aviso("Algumas alterações não foram salvas. O cardápio foi recarregado."); carregarCardapio(); return; }
        alvo.forEach((i, k) => { i.ativo = antes[k]; });
        renderCardapio(); aviso(erroGravar(error)); return;
      }
    }
    renderCardapio();
  }

  /* ---------------------------------------------------------------- impressão (cupom 80 mm) */
  function imprimir(o) {
    const d = new Date(o.criado_em), L = "--------------------------------";
    const t = [restNome.toUpperCase(), "PEDIDO " + num(o.numero), d.toLocaleString("pt-BR"), L,
      o.tipo_entrega === "entrega" ? "ENTREGA" : "RETIRADA NO LOCAL",
      o.cliente_nome, "Tel: " + o.cliente_telefone];
    if (o.tipo_entrega === "entrega") t.push(enderecoTexto(o.endereco));
    t.push(L);
    (o.order_items || []).forEach(it => t.push("* " + it.descricao + (it.qtd > 1 ? " x" + it.qtd : ""), ""));
    t.push(L, "TOTAL: " + reais(o.total), "Pagamento: " + pagamentoTexto(o));
    $("#ticket").textContent = t.join("\n");
    document.body.classList.add("imprimindo");
    window.print();
  }
  window.addEventListener("afterprint", () => document.body.classList.remove("imprimindo"));

  /* ---------------------------------------------------------------- dados */
  async function mudarStatus(o, novo) {
    const antigo = o.status;
    o.status = novo; novos.delete(o.id);
    if (FINAIS.includes(novo)) pedidos.delete(o.id);
    render();
    if (DEMO) return;
    const { error } = await sb.from("orders").update({ status: novo }).eq("id", o.id);
    if (error) {
      o.status = antigo; pedidos.set(o.id, o); render();
      aviso("Não foi possível atualizar o pedido " + num(o.numero) + ". Verifique a conexão e tente de novo.");
      return;
    }
    sb.from("order_events").insert({ order_id: o.id, status: novo, por: usuario.id }).then(function () { });
  }

  async function carregar() {
    const desde = new Date(Date.now() - 18 * 3600e3).toISOString();
    const { data, error } = await sb.from("orders").select("*, order_items(*)")
      .eq("restaurant_id", restId).gte("criado_em", desde).not("status", "in", "(entregue,cancelado)").order("criado_em");
    if (error) { aviso("Não foi possível carregar os pedidos."); return; }
    const antes = new Set(pedidos.keys());
    pedidos.clear();
    data.forEach(o => pedidos.set(o.id, o));
    data.forEach(o => { if (!primeiraCarga && !antes.has(o.id)) marcarNovo(o.id); });
    primeiraCarga = false;
    render();
  }

  async function aoMudar(p) {
    if (p.eventType === "DELETE") return;
    const id = p.new.id;
    if (FINAIS.includes(p.new.status)) { pedidos.delete(id); novos.delete(id); render(); return; }
    if (pedidos.has(id)) { Object.assign(pedidos.get(id), p.new); render(); return; }
    /* Pedido novo: o evento não traz os itens, então busca o pedido completo */
    const { data } = await sb.from("orders").select("*, order_items(*)").eq("id", id).single();
    if (data) { pedidos.set(id, data); marcarNovo(id); render(); }
  }

  function abrirPainel(nome) {
    restNome = nome; $("#nomeRest").textContent = "· " + nome;
    $("#login").hidden = true; $("#painel").hidden = false;
  }

  async function entrar(user) {
    usuario = user;
    const { data: ms, error } = await sb.from("restaurant_members")
      .select("restaurant_id, papel, restaurants(slug, nome)").eq("user_id", user.id);
    if (error || !ms || !ms.length) {
      await sb.auth.signOut();
      mostrarLogin("Esta conta não está vinculada a nenhum restaurante.");
      return;
    }
    const m = ms.find(x => x.restaurants && x.restaurants.slug === CFG.restaurante) || ms[0];
    restId = m.restaurant_id;
    abrirPainel(m.restaurants ? m.restaurants.nome : "");
    await carregarLoja();
    await carregar();
    if (canal) sb.removeChannel(canal);
    canal = sb.channel("cozinha-" + restId)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: "restaurant_id=eq." + restId }, aoMudar)
      .subscribe(function (st) {
        $("#conexao").dataset.estado = st === "SUBSCRIBED" ? "ok" : "off";
        if (st === "SUBSCRIBED") carregar(); /* recupera o que chegou durante uma queda */
      });
  }

  function mostrarLogin(msg) {
    $("#painel").hidden = true; $("#login").hidden = false;
    const e = $("#loginErro"); e.textContent = msg || ""; e.hidden = !msg;
    $("#loginBtn").disabled = false; $("#loginBtn").textContent = "Entrar";
  }

  /* ---------------------------------------------------------------- demonstração */
  function semearDemo() {
    const agora = Date.now();
    const mk = (n, min, st, tipo, nome, itens, pag, extra) => ({
      id: "demo-" + n, numero: n, status: st, tipo_entrega: tipo, criado_em: new Date(agora - min * 60000).toISOString(),
      cliente_nome: nome, cliente_telefone: "(54) 99999-00" + (10 + n), pagamento: pag, total: itens.reduce((s, i) => s + i[1], 0) + (tipo === "entrega" ? 8.9 : 0),
      troco_para: null, endereco: tipo === "entrega" ? { rua: "Rua das Flores", numero: String(100 + n), bairro: "Centro", cep: "99470000", complemento: "" } : null,
      order_items: itens.map(i => ({ descricao: i[0], qtd: 1 })), ...(extra || {})
    });
    [mk(1, 22, "em_preparo", "entrega", "Ana Souza", [["Pizza G: calabresa ×2, muçarela, cebola", 61.9]], "pix"),
    mk(2, 9, "recebido", "retirada", "Carlos Lima", [["Espaguete ao bolonhesa: frango, cheddar (finalização)", 37], ["Lanche no brioche: carne ×2, bacon, cheddar", 48.9]], "dinheiro", { troco_para: 100 }),
    mk(3, 3, "recebido", "entrega", "Marina Alves", [["Pizza M: pepperoni, azeitona, manjericão", 54.9]], "cartao"),
    mk(4, 30, "pronto", "retirada", "João Pedro", [["Lanche no australiano: carne, prato, picles", 33.9]], "pix")
    ].forEach(o => pedidos.set(o.id, o));
    let n = 5;
    setInterval(function () {
      if (n > 9) return;
      const o = mk(n, 0, "recebido", n % 2 ? "entrega" : "retirada", "Cliente " + n, [["Pizza G: muçarela, tomate, manjericão", 56.9]], "pix");
      pedidos.set(o.id, o); marcarNovo(o.id); render(); n++;
    }, 25000);
  }

  /* ---------------------------------------------------------------- início */
  async function iniciar() {
    $("#sair").hidden = DEMO;
    if (DEMO) { $("#modoDemo").hidden = false; $("#conexao").dataset.estado = "ok"; semearDemo(); abrirPainel("Restaurante Demo"); carregarLoja(); render(); return; }
    sb = window.supabase.createClient(CFG.apiUrl, CFG.anonKey, { auth: { storageKey: "pedeai-equipe" } });
    $("#formLogin").addEventListener("submit", async function (e) {
      e.preventDefault();
      $("#loginBtn").disabled = true; $("#loginBtn").textContent = "Entrando…";
      const { data, error } = await sb.auth.signInWithPassword({ email: $("#loginEmail").value.trim(), password: $("#loginSenha").value });
      if (error || !data.user) { mostrarLogin("E-mail ou senha incorretos."); return; }
      entrar(data.user);
    });
    $("#sair").addEventListener("click", async function () {
      if (canal) sb.removeChannel(canal);
      await sb.auth.signOut(); pedidos.clear(); novos.clear(); primeiraCarga = true;
      cardapioCarregado = false; itensMenu = []; trocarAba("pedidos"); mostrarLogin("");
    });
    document.addEventListener("visibilitychange", function () { if (!document.hidden && restId) carregar(); });
    setInterval(function () { if (restId && !document.hidden) carregar(); }, 60000); /* rede de segurança do Realtime */
    const { data } = await sb.auth.getSession();
    if (data.session) entrar(data.session.user); else mostrarLogin("");
  }
  iniciar();
})();
