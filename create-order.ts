// PedeAÍ · create-order
// Recebe SÓ escolhas (ids e quantidades), busca os preços no banco, recalcula tudo e grava.
// O total que o navegador mostra é apenas exibição: nunca é confiado.
// O cliente é identificado pelo TOKEN da sessão (cabeçalho Authorization), nunca por dados do corpo.
//
// Variáveis de ambiente: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (já existem nas Edge Functions)
// e ALLOWED_ORIGIN (opcional, ex.: https://app.seudominio.com.br; padrão "*" só para testes).

import { createClient } from "npm:@supabase/supabase-js@2";

const ORIGEM = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const cors = {
  "Access-Control-Allow-Origin": ORIGEM,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const resp = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, "Content-Type": "application/json" } });

class ErroDeNegocio extends Error {
  constructor(msg: string, public status = 400) { super(msg); }
}
const exige = (cond: unknown, msg: string, status = 400) => { if (!cond) throw new ErroDeNegocio(msg, status); };

type Item = { preco: number; max_qtd: number; nome: string };
const arredonda = (n: number) => Math.round(n * 100) / 100;
const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const soDigitos = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "") : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return resp(405, { erro: "Método não permitido." });

  try {
    let b: any;
    try { b = await req.json(); } catch { throw new ErroDeNegocio("Pedido inválido."); }

    // ---------------------------------------------------------- validação básica
    const slug = texto(b.restaurante, 60);
    const chave = texto(b.chave_idempotencia, 80);
    exige(slug, "Restaurante não informado.");
    exige(chave.length >= 8, "Chave de idempotência inválida.");
    exige(["retirada", "entrega"].includes(b.tipo_entrega), "Tipo de entrega inválido.");
    exige(["dinheiro", "pix", "cartao"].includes(b.pagamento), "Forma de pagamento inválida.");

    const nome = texto(b.cliente?.nome, 80);
    const tel = soDigitos(b.cliente?.telefone);
    exige(nome.length >= 2, "Informe seu nome.");
    exige(tel.length >= 10 && tel.length <= 11, "Informe um telefone com DDD.");

    let endereco: Record<string, string> | null = null;
    if (b.tipo_entrega === "entrega") {
      endereco = {
        rua: texto(b.endereco?.rua, 80), numero: texto(b.endereco?.numero, 10),
        bairro: texto(b.endereco?.bairro, 60), cep: soDigitos(b.endereco?.cep).slice(0, 8),
        complemento: texto(b.endereco?.complemento, 60),
      };
      exige(endereco.rua.length >= 3 && endereco.numero && endereco.bairro.length >= 2, "Endereço de entrega incompleto.");
    }

    exige(Array.isArray(b.itens) && b.itens.length >= 1 && b.itens.length <= 10, "O pedido precisa de 1 a 10 itens.");

    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    // ---------------------------------------------------------- quem está pedindo (vem do token, não do corpo)
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: sessao } = await db.auth.getUser(jwt);
    const userId = sessao?.user?.id ?? null;
    exige(userId, "Entre na sua conta para fazer o pedido.", 401);

    // ---------------------------------------------------------- restaurante
    const { data: rest } = await db.from("restaurants").select("id, aberto, taxa_entrega").eq("slug", slug).maybeSingle();
    exige(rest, "Restaurante não encontrado.", 404);

    // Reenvio do mesmo pedido (duplo clique, rede instável): devolve o que já foi criado.
    const { data: ja } = await db.from("orders")
      .select("numero, total, subtotal, taxa_entrega, token_publico")
      .eq("restaurant_id", rest!.id).eq("customer_id", userId).eq("chave_idempotencia", chave).maybeSingle();
    if (ja) return resp(200, { numero: ja.numero, total: Number(ja.total), subtotal: Number(ja.subtotal), taxa_entrega: Number(ja.taxa_entrega), token: ja.token_publico, repetido: true });

    exige(rest!.aberto, "O restaurante está fechado no momento.", 409);

    // ---------------------------------------------------------- catálogo (fonte única dos preços)
    const { data: linhas, error: eCat } = await db.from("menu_items")
      .select("grupo, ref_id, nome, preco, max_qtd").eq("restaurant_id", rest!.id).eq("ativo", true);
    if (eCat) throw eCat;
    const cat = new Map<string, Item>();
    (linhas ?? []).forEach((l) => cat.set(`${l.grupo}:${l.ref_id}`, { preco: Number(l.preco), max_qtd: l.max_qtd, nome: l.nome }));

    const unico = (grupo: string, id: unknown, rotulo: string): Item => {
      const it = typeof id === "string" ? cat.get(`${grupo}:${id}`) : undefined;
      exige(it, `${rotulo} indisponível.`);
      return it!;
    };
    // Soma "id → quantidade", respeitando o limite de cada item.
    const somaQtds = (grupo: string, mapa: unknown, rotulo: string) => {
      let soma = 0; const nomes: string[] = []; const limpo: Record<string, number> = {};
      if (mapa == null) return { soma, nomes, limpo };
      exige(typeof mapa === "object" && !Array.isArray(mapa), `${rotulo} inválidos.`);
      for (const [id, q] of Object.entries(mapa as Record<string, unknown>)) {
        const it = cat.get(`${grupo}:${id}`);
        exige(it, `${rotulo}: item indisponível (${id}).`);
        exige(Number.isInteger(q) && (q as number) >= 1 && (q as number) <= it!.max_qtd, `${rotulo}: quantidade inválida para ${it!.nome}.`);
        soma += it!.preco * (q as number); limpo[id] = q as number;
        nomes.push(it!.nome.toLowerCase() + ((q as number) > 1 ? ` ×${q}` : ""));
      }
      return { soma, nomes, limpo };
    };

    // ---------------------------------------------------------- preço de cada item
    const itens = (b.itens as any[]).map((i) => {
      if (i?.tipo === "pizza") {
        const tam = unico("pizza.tamanho", i.tamanho, "Tamanho");
        const ing = somaQtds("pizza.ingrediente", i.ingredientes, "Ingredientes");
        return { tipo: "pizza", preco: tam.preco + ing.soma,
          descricao: `Pizza ${i.tamanho}: ${ing.nomes.length ? ing.nomes.join(", ") : "só molho"}`,
          config: { tamanho: i.tamanho, ingredientes: ing.limpo } };
      }
      if (i?.tipo === "lanche") {
        const base = unico("lanche.base", "base", "Lanche");
        const pao = unico("lanche.pao", i.pao, "Pão");
        const cam = somaQtds("lanche.ingrediente", i.camadas, "Camadas");
        return { tipo: "lanche", preco: base.preco + pao.preco + cam.soma,
          descricao: `Lanche no ${pao.nome.replace(/^Pão /, "").toLowerCase()}: ${cam.nomes.length ? cam.nomes.join(", ") : "só o pão"}`,
          config: { pao: i.pao, camadas: cam.limpo } };
      }
      if (i?.tipo === "massa") {
        const base = unico("massa.base", "base", "Massa");
        const molho = unico("massa.molho", i.molho, "Molho");
        const tipoMassa = unico("massa.tipo", i.tipo_massa, "Tipo de massa");
        const ing = somaQtds("massa.ingrediente", i.ingredientes, "Ingredientes");
        const fin = somaQtds("massa.finalizacao", i.finalizacoes, "Finalizações");
        const extras = [...ing.nomes, ...fin.nomes.map((n) => n + " (finalização)")];
        return { tipo: "massa", preco: base.preco + ing.soma + fin.soma,
          descricao: `${tipoMassa.nome} ao ${molho.nome.toLowerCase()}${extras.length ? ": " + extras.join(", ") : ""}`,
          config: { molho: i.molho, tipo_massa: i.tipo_massa, ingredientes: ing.limpo, finalizacoes: fin.limpo } };
      }
      throw new ErroDeNegocio("Tipo de item inválido.");
    });

    // ---------------------------------------------------------- totais (autoridade do servidor)
    const subtotal = arredonda(itens.reduce((s, i) => s + i.preco, 0));
    const taxa = b.tipo_entrega === "entrega" ? arredonda(Number(rest!.taxa_entrega)) : 0;
    const total = arredonda(subtotal + taxa);

    let troco: number | null = null;
    if (b.pagamento === "dinheiro" && b.troco_para != null) {
      troco = Number(b.troco_para);
      exige(Number.isFinite(troco) && troco >= total && troco < 10000, "O troco deve ser para um valor maior ou igual ao total.");
    }

    // ---------------------------------------------------------- grava (transação única na função SQL)
    const { data: criado, error } = await db.rpc("criar_pedido", {
      p_pedido: {
        restaurant_id: rest!.id, customer_id: userId, tipo_entrega: b.tipo_entrega, pagamento: b.pagamento, troco_para: troco,
        subtotal, taxa_entrega: taxa, total, cliente_nome: nome, cliente_telefone: tel,
        endereco, chave_idempotencia: chave,
      },
      p_itens: itens.map((i) => ({ tipo: i.tipo, descricao: i.descricao, config: i.config, preco: arredonda(i.preco), qtd: 1 })),
    });
    if (error) {
      // Duas requisições com a mesma chave ao mesmo tempo: a segunda cai na restrição única.
      if (error.code === "23505") return resp(409, { erro: "Pedido já recebido. Aguarde a confirmação." });
      throw error;
    }
    const p = Array.isArray(criado) ? criado[0] : criado;
    return resp(201, { numero: p.numero, total, subtotal, taxa_entrega: taxa, token: p.token_publico });
  } catch (e) {
    if (e instanceof ErroDeNegocio) return resp(e.status, { erro: e.message });
    console.error("create-order", e); // detalhes só no log do servidor
    return resp(500, { erro: "Não foi possível registrar o pedido. Tente novamente." });
  }
});
