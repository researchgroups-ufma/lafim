/**
 * callback.js — Cloudflare Function: finaliza o fluxo OAuth com o GitHub
 *
 * Após o editor autorizar o acesso no GitHub, ele é redirecionado
 * para /callback com um código temporário. Esta função troca esse
 * código por um token de acesso e envia de volta ao Decap CMS
 * via window.postMessage (padrão esperado pelo Decap).
 *
 * Variáveis de ambiente necessárias (configuradas no Cloudflare Pages):
 *   GITHUB_CLIENT_ID     — ID do OAuth App criado no GitHub
 *   GITHUB_CLIENT_SECRET — Secret do OAuth App criado no GitHub
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Código temporário enviado pelo GitHub após autorização
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Código de autorização não encontrado.", { status: 400 });
  }

  // Troca o código temporário por um token de acesso permanente
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
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
    return new Response(
      `Erro ao contatar o GitHub: ${tokenResponse.status} ${tokenResponse.statusText}`,
      { status: 502 }
    );
  }

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(`Erro OAuth: ${tokenData.error_description}`, { status: 400 });
  }

  const token = tokenData.access_token;
  const provider = "github";

  // Retorna HTML que envia o token para o Decap CMS via postMessage.
  //
  // O Decap exige um handshake ANTES do token: o popup anuncia
  // "authorizing:<provider>", o opener responde, e só ao responder ele
  // registra o listener que aceita "authorization:<provider>:success:".
  // Mandar o token direto entrega a mensagem antes de existir quem a
  // escute — a janela fecha e o painel continua na tela de login.
  const payload = JSON.stringify({ token, provider });
  const html = `
<!DOCTYPE html>
<html>
  <head><title>Autenticando...</title></head>
  <body>
    <script>
      (function () {
        function receiveMessage(message) {
          window.opener.postMessage(
            'authorization:${provider}:success:' + ${JSON.stringify(payload)},
            message.origin
          );
          window.removeEventListener('message', receiveMessage, false);
          // quem fecha esta janela é o próprio Decap, ao receber o token
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:${provider}', '*');
      })();
    </script>
    <p>Autenticado com sucesso. Esta janela será fechada automaticamente.</p>
  </body>
</html>`;

  // sem o charset explícito o navegador decodifica como Latin-1 e o
  // acento vira mojibake ("será" → "serÃ¡")
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
