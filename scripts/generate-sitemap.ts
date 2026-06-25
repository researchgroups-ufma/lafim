/**
 * generate-sitemap.ts — Gera public/sitemap.xml
 *
 * O site não possui páginas de detalhe por slug (members/research/etc. são
 * apenas páginas de listagem), então o sitemap lista somente as rotas
 * públicas reais que existem hoje. O <lastmod> é a data de execução do
 * script, mantido atualizado a cada build.
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

const OUTPUT_FILE = path.join(process.cwd(), "public", "sitemap.xml");

// lastmod = data de execução do script (YYYY-MM-DD).
const lastmod = new Date().toISOString().slice(0, 10);

const body = ROUTES.map(
  (route) =>
    `  <url>\n    <loc>${BASE_URL}${route}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

fs.writeFileSync(OUTPUT_FILE, xml, "utf8");

console.log(`sitemap.xml gerado com ${ROUTES.length} URLs em ${OUTPUT_FILE}`);
