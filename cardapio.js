/* PedeAÍ · carrega o cardápio do restaurante e só então inicia o app.js.
   Lê a view pública cardapio_publico (preço, limite e disponibilidade). Se falhar, o app usa os valores embutidos. */
(function () {
  "use strict";
  var CFG = window.PEDEAI_CONFIG || {};
  var q = new URLSearchParams(location.search);
  var slug = (q.get("r") || CFG.restaurante || "").toLowerCase();

  function iniciar() {
    var s = document.createElement("script");
    s.src = "app.js";
    document.body.appendChild(s);
  }

  if (window.PEDEAI_DEMO === true || CFG.modo !== "producao" || !CFG.apiUrl || !CFG.anonKey || !/^[a-z0-9-]{1,60}$/.test(slug)) {
    iniciar();
    return;
  }

  var ctl = new AbortController();
  var limite = setTimeout(function () { ctl.abort(); }, 4000); /* não deixa o cliente esperando */
  fetch(CFG.apiUrl.replace(/\/$/, "") + "/rest/v1/cardapio_publico?select=grupo,ref_id,preco,max_qtd&slug=eq." + encodeURIComponent(slug), {
    headers: { apikey: CFG.anonKey, Authorization: "Bearer " + CFG.anonKey },
    signal: ctl.signal
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (linhas) { if (Array.isArray(linhas) && linhas.length) window.PEDEAI_CARDAPIO = linhas; })
    .catch(function () { })
    .then(function () { clearTimeout(limite); iniciar(); });
})();
