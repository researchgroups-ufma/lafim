/**
 * auth.js — Cloudflare Function: inicia o fluxo OAuth com o GitHub
 *
 * Quando o editor clica em "Login with GitHub" no painel /admin,
 * o Decap CMS redireciona para /auth. Esta função monta a URL de
 * autorização do GitHub e redireciona o navegador para lá.
 *
 * Variáveis de ambiente necessárias (configuradas no Cloudflare Pages):
 *   GITHUB_CLIENT_ID     — ID do OAuth App criado no GitHub
 *   GITHUB_CLIENT_SECRET — Secret do OAuth App (usado em /callback)
 */

export async function onRequest(context) {
  const { env } = context;

  // Monta a URL de autorização do GitHub com o Client ID
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    scope: "repo,user",        // permissões necessárias para o Decap CMS
    redirect_uri: `https://lafim-ufma.pages.dev/callback`,
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params}`;

  // Redireciona o navegador para a tela de autorização do GitHub
  return Response.redirect(githubAuthUrl, 302);
}
