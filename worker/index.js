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
 *
 * Variáveis de ambiente (Settings > Variables no painel do Worker):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
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

    return new Response("Hello — Decap OAuth Proxy funcionando.", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};

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
