/**
 * generate-sitemap.ts — Gera public/sitemap.xml
 *
 * O site não possui páginas de detalhe por slug (members/research/etc. são
 * apenas páginas de listagem), então o sitemap lista somente as rotas
 * públicas reais que existem hoje. O <lastmod> é a data de execução do
 * script, mantido atualizado a cada build.
 *
 * Cada rota PT gera duas <url> (PT e EN), cada uma com os três
 * <xhtml:link rel="alternate"> cruzados (pt-BR, en, x-default).
 *
 * Usa apenas `fs` e `path` — sem dependências externas.
 */

import fs from "fs";
import path from "path";

const BASE_URL = "https://lafim.pages.dev";

// Rotas públicas reais do site (todas estáticas).
const ROUTES = [
  "/",
  "/about",
  "/contact",
  "/members",
  "/news",
  "/publications",
  "/research",
  "/research/infrastructure",
];

// en("/") = "/en"; en(rota) = "/en" + rota.
function en(route: string): string {
  return route === "/" ? "/en" : `/en${route}`;
}

const OUTPUT_FILE = path.join(process.cwd(), "public", "sitemap.xml");

// lastmod = data de execução do script (YYYY-MM-DD).
const lastmod = new Date().toISOString().slice(0, 10);

function urlBlock(loc: string, ptRoute: string, enRoute: string): string {
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${BASE_URL}${ptRoute}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${enRoute}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${ptRoute}"/>
  </url>`;
}

const body = ROUTES.flatMap((route) => {
  const enRoute = en(route);
  return [urlBlock(route, route, enRoute), urlBlock(enRoute, route, enRoute)];
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${body}
</urlset>
`;

fs.writeFileSync(OUTPUT_FILE, xml, "utf8");

console.log(
  `sitemap.xml gerado com ${ROUTES.length * 2} URLs em ${OUTPUT_FILE}`
);
