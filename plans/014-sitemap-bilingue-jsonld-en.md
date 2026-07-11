# Plano 014 — Sitemap bilíngue + JSON-LD EN

**Status:** TODO
**Fase coberta:** Fase 4 (SEO + QA)
**Depende de:** plano 008
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Emitir as 16 URLs (8 rotas × 2 idiomas) no `sitemap.xml`, cada `<url>` com `<xhtml:link rel="alternate" hreflang=...>` cruzados PT/EN, e ajustar o JSON-LD da árvore `/en` para `inLanguage: "en"` com descrição traduzida.

## Por quê
Fechamento do SEO bilíngue: o sitemap precisa listar ambas as versões com alternates, e o dado estruturado da árvore EN deve declarar o idioma inglês.

## Arquivos afetados
- `scripts/generate-sitemap.ts` — gerar 16 URLs com namespace `xhtml` e `<xhtml:link>` alternates.
- `app/en/layout.tsx` — JSON-LD com `inLanguage: "en"` e `description` traduzida.
- (Se o JSON-LD PT precisar de `inLanguage`, adicionar `inLanguage: "pt-BR"` em `app/(pt)/layout.tsx` — opcional, para simetria.)

## Contexto necessário

- `scripts/generate-sitemap.ts` roda antes do build (`npm run build` = `generate-sitemap && next build`). Usa só `fs`/`path`. `BASE_URL = "https://lafim.pages.dev"`.
- Rotas canônicas PT (as 8): `/`, `/about`, `/contact`, `/members`, `/news`, `/publications`, `/research`, `/research/infrastructure`.
  > Nota: o `ROUTES` atual do script lista essas 8 (a raiz `/` inclusa). Mantenha exatamente esse conjunto; a versão EN é `/en` + `/en<rota>`.
- Formato alvo por rota (cada rota gera **duas** `<url>`, PT e EN, cada uma com os dois alternates + x-default):
  ```xml
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xhtml="http://www.w3.org/1999/xhtml">
    <url>
      <loc>https://lafim.pages.dev/research</loc>
      <lastmod>YYYY-MM-DD</lastmod>
      <xhtml:link rel="alternate" hreflang="pt-BR" href="https://lafim.pages.dev/research"/>
      <xhtml:link rel="alternate" hreflang="en" href="https://lafim.pages.dev/en/research"/>
      <xhtml:link rel="alternate" hreflang="x-default" href="https://lafim.pages.dev/research"/>
    </url>
    <url>
      <loc>https://lafim.pages.dev/en/research</loc>
      <lastmod>YYYY-MM-DD</lastmod>
      <xhtml:link rel="alternate" hreflang="pt-BR" href="https://lafim.pages.dev/research"/>
      <xhtml:link rel="alternate" hreflang="en" href="https://lafim.pages.dev/en/research"/>
      <xhtml:link rel="alternate" hreflang="x-default" href="https://lafim.pages.dev/research"/>
    </url>
    <!-- ... -->
  </urlset>
  ```
- Regra do prefixo EN: `en("/") = "/en"`, `en(rota) = "/en" + rota`. Implemente uma função local no script (não pode importar `lib/i18n` facilmente — o script roda via `tsx`; se o alias `@` funcionar no `tsx`, pode importar `localizeHref`, senão duplique a função de 3 linhas).
- JSON-LD EN em `app/en/layout.tsx`: reutilize o objeto `schemaOrg` adicionando `inLanguage: "en"` e traduzindo `description` (ex.: "Research in condensed matter physics, nanomaterials and superconductivity at the Federal University of Maranhão."). `name`/`alternateName`/`parentOrganization`/`knowsAbout` podem permanecer (nomes próprios); traduza `knowsAbout` para inglês se desejar consistência.
- Não alterar o número de rotas nem inventar rotas de detalhe (o site não tem páginas por slug).

## Passos
1. Reescrever `scripts/generate-sitemap.ts` para emitir 16 `<url>` com o namespace `xhtml` e os alternates cruzados. → verify: `npm run generate-sitemap` gera `public/sitemap.xml` com 16 `<loc>`.
2. Ajustar o JSON-LD de `app/en/layout.tsx` (`inLanguage: "en"`, descrição EN). → verify: build.
3. `npm run build`. → verify: verde.

## Critérios de aceitação
- [ ] `public/sitemap.xml` contém 16 `<loc>` (8 PT + 8 EN), cada `<url>` com 3 `<xhtml:link>` (pt-BR, en, x-default) corretos.
- [ ] O `<urlset>` declara `xmlns:xhtml`.
- [ ] view-source de `/en` mostra JSON-LD com `"inLanguage": "en"`.
- [ ] `npm run build` verde; XML bem-formado.
- [ ] Nenhuma rota nova inventada além das 8 × 2.
