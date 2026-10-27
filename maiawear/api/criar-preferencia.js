/**
 * MAIA Wear — cria o pagamento no Mercado Pago (Checkout Pro) e devolve o link.
 *
 * Função serverless no formato da Vercel (pasta /api). Para funcionar:
 *   1. No painel do Mercado Pago (Suas integrações → Credenciais), copie o Access Token.
 *   2. Na Vercel, em Settings → Environment Variables, crie MP_ACCESS_TOKEN com esse valor.
 *   3. Publique o site na Vercel (o index.html chama /api/criar-preferencia).
 *
 * O PREÇO É DECIDIDO AQUI, nunca pelo navegador: o cliente só manda cor, tamanho e quantidade.
 * Se mudar o preço, mude também a constante PRECO no index.html (que é só para exibir).
 */

const PRECO = 149.90;                     // R$ por camiseta
const CORES = { preta: "Preta", branca: "Branca", roxa: "Roxa" };
const TAMANHOS = ["P", "M", "G", "GG"];
const QTD_MAX = 5;

const so = (v, n) => String(v == null ? "" : v).trim().slice(0, n);
const digitos = v => String(v == null ? "" : v).replace(/\D/g, "");

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ erro: "Método não permitido." });

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ erro: "Pagamento ainda não configurado." });

    const corpo = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const item = corpo.item || {}, c = corpo.comprador || {};

    // valida o pedido com as regras do servidor
    if (!CORES[item.cor]) return res.status(400).json({ erro: "Cor inválida." });
    if (!TAMANHOS.includes(item.tamanho)) return res.status(400).json({ erro: "Tamanho inválido." });
    const quantidade = Math.floor(Number(item.quantidade));
    if (!(quantidade >= 1 && quantidade <= QTD_MAX)) return res.status(400).json({ erro: "Quantidade inválida." });

    const nome = so(c.nome, 120), email = so(c.email, 120);
    const cep = digitos(c.cep), cpf = digitos(c.cpf), fone = digitos(c.telefone);
    if (!nome || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || cep.length !== 8 || cpf.length !== 11
        || !so(c.rua, 1) || !so(c.numero, 1) || !so(c.cidade, 1) || !so(c.uf, 1)) {
        return res.status(400).json({ erro: "Dados de entrega incompletos." });
    }

    const [primeiro, ...resto] = nome.split(/\s+/);
    const origem = `https://${req.headers["x-forwarded-host"] || req.headers.host}`;
    const referencia = `MAIA-${Date.now().toString(36).toUpperCase()}`;
    const endereco = {
        zip_code: cep,
        street_name: so(c.rua, 120),
        street_number: so(c.numero, 20),
        floor: "", apartment: so(c.complemento, 60),
        city_name: so(c.cidade, 80), state_name: so(c.uf, 2).toUpperCase()
    };

    const preferencia = {
        items: [{
            id: `camiseta-${item.cor}-${item.tamanho}`,
            title: `Camiseta MAIA ${CORES[item.cor]} — tamanho ${item.tamanho}`,
            quantity: quantidade,
            unit_price: PRECO,
            currency_id: "BRL"
        }],
        payer: {
            name: primeiro, surname: resto.join(" "), email,
            phone: { area_code: fone.slice(0, 2), number: fone.slice(2) },
            identification: { type: "CPF", number: cpf },
            address: { zip_code: cep, street_name: endereco.street_name, street_number: endereco.street_number }
        },
        shipments: { receiver_address: endereco },
        back_urls: {
            success: `${origem}/?pagamento=sucesso`,
            pending: `${origem}/?pagamento=pendente`,
            failure: `${origem}/?pagamento=falha`
        },
        auto_return: "approved",
        external_reference: referencia,
        statement_descriptor: "MAIAWEAR",
        metadata: {
            referencia, cor: item.cor, tamanho: item.tamanho, quantidade,
            nome, email, telefone: fone,
            entrega: `${endereco.street_name}, ${endereco.street_number} ${endereco.apartment} — ${so(c.bairro, 80)}, ${endereco.city_name}/${endereco.state_name} — CEP ${cep}`
        }
    };

    try {
        const r = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Idempotency-Key": referencia },
            body: JSON.stringify(preferencia)
        });
        const j = await r.json();
        if (!r.ok) {
            console.error("Mercado Pago recusou a preferência:", r.status, j && j.message);
            return res.status(502).json({ erro: "O Mercado Pago não aceitou o pedido agora." });
        }
        return res.status(200).json({ init_point: j.init_point, referencia });
    } catch (e) {
        console.error("Erro ao falar com o Mercado Pago:", e && e.message);
        return res.status(502).json({ erro: "Não foi possível falar com o Mercado Pago." });
    }
}
