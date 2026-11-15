/* PedeAÍ · página de pedido de um restaurante (/r/<slug>)
   - Descobre o restaurante pela URL e informa o app.js (CFG.restaurante) ANTES de ele carregar.
   - Busca o nome na view pública `restaurants_public` (só slug e nome) e preenche os cabeçalhos.
   - O nome é inserido com textContent (nunca innerHTML). */
(function () {
  "use strict";
  const base = window.PEDEAI_CONFIG || {};
  const $ = s => document.querySelector(s);

  /* /r/pizzaria-do-ze  (ou ?r=pizzaria-do-ze, útil em testes locais; senão usa o config.js) */
  let bruto = (location.pathname.match(/^\/r\/([^/]+)/) || [])[1] || new URLSearchParams(location.search).get("r") || base.restaurante || "";
  try { bruto = decodeURIComponent(bruto); } catch (e) { bruto = ""; }
  const slug = bruto.trim().toLowerCase();
  const slugValido = /^[a-z0-9][a-z0-9-]{1,59}$/.test(slug);

  window.PEDEAI_CONFIG = Object.assign({}, base, { restaurante: slug });

  function mostrar(nome) {
    document.title = nome + " · Pedido online";
    $("#navRest").textContent = nome;
    $("#restTitulo").textContent = nome;
    document.querySelectorAll("[data-rest-nome]").forEach(e => { e.textContent = nome; });
  }
  function naoEncontrado() {
    $("#pedidoApp").hidden = true;
    $("#restNaoEncontrado").hidden = false;
    $("#navRest").textContent = "PedeAÍ";
    document.title = "Restaurante não encontrado · PedeAÍ";
  }
  /* "pizzaria-do-ze" → "Pizzaria Do Ze" (só quando não dá para consultar o nome real) */
  const bonito = s => s.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  async function iniciar() {
    if (!slugValido) { naoEncontrado(); return; }
    const producao = base.modo === "producao" && base.apiUrl && base.anonKey;
    if (!producao) { mostrar(bonito(slug)); return; }
    try {
      const url = base.apiUrl.replace(/\/$/, "") + "/rest/v1/restaurants_public?select=slug,nome&limit=1&slug=eq." + encodeURIComponent(slug);
      const r = await fetch(url, { headers: { apikey: base.anonKey, Authorization: "Bearer " + base.anonKey } });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const lista = await r.json();
      if (!lista.length) { naoEncontrado(); return; }
      mostrar(lista[0].nome);
    } catch (e) {
      /* view ainda não criada ou sem rede: não bloqueia o pedido, só usa o slug como nome */
      console.warn("Não foi possível ler o nome do restaurante (crie a view restaurants_public):", e);
      mostrar(bonito(slug));
    }
  }
  iniciar();
})();
