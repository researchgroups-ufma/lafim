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
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();

  if (tokenData.error) {
    return new Response(`Erro OAuth: ${tokenData.error_description}`, { status: 400 });
  }

  const token = tokenData.access_token;
  const provider = "github";

  // Retorna HTML que envia o token para o Decap CMS via postMessage
  // Este é o padrão esperado pelo Decap para autenticação externa
  const html = `
<!DOCTYPE html>
<html>
  <head><title>Autenticando...</title></head>
  <body>
    <script>
      // Envia o token para a janela pai (o painel /admin do Decap CMS)
      // O formato "authorization:provider:success:token" é obrigatório
      window.opener.postMessage(
        'authorization:${provider}:success:{"token":"${token}","provider":"${provider}"}',
        '*'
      );
      window.close();
    </script>
    <p>Autenticado com sucesso. Esta janela será fechada automaticamente.</p>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
