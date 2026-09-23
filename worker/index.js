/**
 * index.js — Worker do proxy OAuth do Decap CMS (decap-proxy.and-near.workers.dev)
 *
 * Este arquivo é a FONTE DE VERDADE do Worker. O código que roda no
 * Cloudflare já divergiu do repositório uma vez (um stack trace de produção
 * apontou uma linha que não existia aqui), o que tornou o diagnóstico
 * enganoso. Ao alterar o Worker, altere aqui primeiro e faça o deploy a
 * partir deste arquivo.
 *
 * Rotas:
 *   /auth     — redireciona o popup para a tela de autorização do GitHub
 *   /callback — troca o code por um token e o entrega ao painel /admin
 *   /report   — recebe erros do painel e encaminha para o Telegram
 *
 * Variáveis de ambiente (Settings > Variables no painel do Worker):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 *   TELEGRAM_BOT_TOKEN  — secret; sem ele /report responde 204 e não faz nada
 *   TELEGRAM_CHAT_ID    — secret; destino das mensagens
 *
 * A callback URL registrada no OAuth App do GitHub precisa ser
 * https://decap-proxy.and-near.workers.dev/callback
 */

const PROVIDER = "github";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/auth") return handleAuth(env, url);
    if (url.pathname === "/callback") return handleCallback(request, env, url);
    if (url.pathname === "/report") return handleReport(request, env);

    return new Response("Hello — Decap OAuth Proxy funcionando.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};

/* ── /report — erros do painel do Decap ──────────────────────────────────────
 *
 * O erro que motivou esta rota (GITRPC::BadObjectState ao excluir uma entrada)
 * NÃO é uma exceção: é um HTTP 422 que o Decap trata e mostra num toast. Por
 * isso o painel não usa window.onerror e sim um wrapper de fetch — ver o
 * script em public/admin/index.html.
 *
 * A rota é pública por natureza (o painel é estático e não tem segredo para
 * assinar o envio). As defesas são: só aceita POST do próprio site, corta o
 * corpo em 4 KB e trunca cada campo antes de repassar. Um abuso resultaria em
 * mensagens indesejadas no Telegram, nunca em acesso ao repositório.
 */

const ORIGENS_PERMITIDAS = [
  "https://lafim.pages.dev",
  "http://localhost:3000",
];

function corsHeaders(origem) {
  const permitida = ORIGENS_PERMITIDAS.includes(origem) ? origem : ORIGENS_PERMITIDAS[0];
  return {
    "Access-Control-Allow-Origin": permitida,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

/** Corta uma string em `max` caracteres, marcando que houve corte. */
function corta(valor, max) {
  const texto = String(valor ?? "");
  return texto.length > max ? `${texto.slice(0, max)}…` : texto;
}

/** Escapa o que o Telegram interpreta como HTML. */
function escapaHtml(texto) {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function handleReport(request, env) {
  const origem = request.headers.get("Origin") || "";
  const cors = corsHeaders(origem);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method !== "POST") return new Response("Use POST.", { status: 405, headers: cors });

  // Sem os secrets configurados a rota vira no-op: o painel não quebra e o
  // erro simplesmente não é encaminhado.
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return new Response(null, { status: 204, headers: cors });
  }

  let dados;
  try {
    const bruto = await request.text();
    if (bruto.length > 4096) return new Response("Corpo grande demais.", { status: 413, headers: cors });
    dados = JSON.parse(bruto);
  } catch {
    return new Response("JSON inválido.", { status: 400, headers: cors });
  }

  const linhas = [
    "<b>⚠️ Erro no painel do LaFiM</b>",
    "",
    `<b>Tipo:</b> ${escapaHtml(corta(dados.tipo, 40))}`,
    `<b>Mensagem:</b> ${escapaHtml(corta(dados.mensagem, 300))}`,
  ];
  if (dados.status) linhas.push(`<b>HTTP:</b> ${escapaHtml(corta(dados.status, 10))}`);
  if (dados.recurso) linhas.push(`<b>Recurso:</b> <code>${escapaHtml(corta(dados.recurso, 200))}</code>`);
  if (dados.pagina) linhas.push(`<b>Página:</b> ${escapaHtml(corta(dados.pagina, 150))}`);
  if (dados.navegador) linhas.push(`<b>Navegador:</b> ${escapaHtml(corta(dados.navegador, 150))}`);
  linhas.push(`<b>Quando:</b> ${new Date().toISOString()}`);

  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN.trim()}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID.trim(),
        text: linhas.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // Falha no envio não pode virar erro no painel — o relatório é best-effort.
  }

  return new Response(null, { status: 204, headers: cors });
}

/** Monta a URL de autorização do GitHub e redireciona o popup para lá. */
function handleAuth(env, url) {
  const params = new URLSearchParams({
    // trim: a variável no painel veio com \n no fim em pelo menos um dos
    // ambientes, o que gerava client_id=...%0A e um OAuth inválido
    client_id: env.GITHUB_CLIENT_ID.trim(),
    scope: "repo,user",
    // derivado da própria request: o redirect_uri precisa apontar para o
    // /callback DESTE Worker, que é o que está registrado no OAuth App
    redirect_uri: `${url.origin}/callback`,
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
}

/** Troca o code temporário por um token e devolve o HTML que fala com o painel. */
async function handleCallback(request, env, url) {
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Código de autorização não encontrado.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID.trim(),
        client_secret: env.GITHUB_CLIENT_SECRET.trim(),
        code,
      }),
    }
  );

  // fetch não rejeita em 4xx/5xx: sem esta checagem um erro HTTP do GitHub
  // (ex.: 502 com corpo HTML) estouraria no .json() como exceção genérica.
  if (!tokenResponse.ok) {
    return htmlResponse(
      `Erro ao contatar o GitHub: ${tokenResponse.status} ${tokenResponse.statusText}`,
      502
    );
  }

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return htmlResponse(`Erro OAuth: ${tokenData.error_description}`, 400);
  }

  const payload = JSON.stringify({
    token: tokenData.access_token,
    provider: PROVIDER,
  });

  // O Decap exige um handshake ANTES do token: o popup anuncia
  // "authorizing:<provider>", o opener responde, e só ao responder ele
  // registra o listener que aceita "authorization:<provider>:success:".
  // Mandar o token direto entrega a mensagem antes de existir quem a
  // escute — a janela fecha e o painel continua na tela de login.
  //
  // O guarda de window.opener existe porque ele já veio null em produção:
  // ao renderizar a tela "Authorize app", o GitHub manda
  // Cross-Origin-Opener-Policy e o vínculo com o painel é cortado. Sem o
  // guarda, o postMessage lança e a janela trava sem explicar nada.
  const html = `
<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><title>Autenticando...</title></head>
  <body>
    <p id="msg">Autenticado com sucesso. Esta janela será fechada automaticamente.</p>
    <script>
      (function () {
        if (!window.opener) {
          document.getElementById('msg').textContent =
            'Não foi possível falar com o painel: o navegador cortou o vínculo ' +
            'com a janela que abriu esta (Cross-Origin-Opener-Policy do GitHub). ' +
            'Feche esta janela e tente entrar novamente.';
          return;
        }
        function receiveMessage(message) {
          window.opener.postMessage(
            'authorization:${PROVIDER}:success:' + ${JSON.stringify(payload)},
            message.origin
          );
          window.removeEventListener('message', receiveMessage, false);
          // quem fecha esta janela é o próprio Decap, ao receber o token
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:${PROVIDER}', '*');
      })();
    </script>
  </body>
</html>`;

  return htmlResponse(html, 200);
}

/** Sem charset explícito o navegador decodifica como Latin-1 ("será" → "serÃ¡"). */
function htmlResponse(body, status) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
