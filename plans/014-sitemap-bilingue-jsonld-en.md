# Plano 014 — Sitemap bilíngue + JSON-LD EN

**Status:** DONE
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
- [x] `public/sitemap.xml` contém 16 `<loc>` (8 PT + 8 EN), cada `<url>` com 3 `<xhtml:link>` (pt-BR, en, x-default) corretos.
- [x] O `<urlset>` declara `xmlns:xhtml`.
- [x] view-source de `/en` mostra JSON-LD com `"inLanguage": "en"`.
- [x] `npm run build` verde; XML bem-formado.
- [x] Nenhuma rota nova inventada além das 8 × 2.

## Evidência

### Implementação
- `scripts/generate-sitemap.ts` reescrito: função local `en(route)` (`en("/") = "/en"`, `en(rota) = "/en" + rota"`, sem depender de import via alias `@`), gera 16 `<url>` (2 por rota) cada uma com 3 `<xhtml:link rel="alternate">` (pt-BR, en, x-default) e `<urlset>` com `xmlns:xhtml="http://www.w3.org/1999/xhtml"`.
- `app/en/layout.tsx`: `description` do JSON-LD traduzida para EN; `knowsAbout` traduzido para EN (nomes próprios como `alternateName`, `parentOrganization.name`/`alternateName` mantidos). `inLanguage: "en"` já existia (plano 008).
- `app/(pt)/layout.tsx`: adicionado `inLanguage: "pt-BR"` ao JSON-LD, para simetria com a árvore EN (opcional recomendado).

### `npm run generate-sitemap`
```
> lafim@0.1.0 generate-sitemap
> tsx scripts/generate-sitemap.ts

sitemap.xml gerado com 16 URLs em S:\Projetos\academic_page\lafim\public\sitemap.xml
```
Contagem no arquivo gerado:
```
$ grep -c "<loc>" public/sitemap.xml       -> 16
$ grep -c "xhtml:link" public/sitemap.xml  -> 48   (16 × 3)
```

### Amostra de `<url>` PT + par EN (rota `/research`)
```xml
<url>
  <loc>https://lafim.pages.dev/research</loc>
  <lastmod>2026-07-11</lastmod>
  <xhtml:link rel="alternate" hreflang="pt-BR" href="https://lafim.pages.dev/research"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://lafim.pages.dev/en/research"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://lafim.pages.dev/research"/>
</url>
<url>
  <loc>https://lafim.pages.dev/en/research</loc>
  <lastmod>2026-07-11</lastmod>
  <xhtml:link rel="alternate" hreflang="pt-BR" href="https://lafim.pages.dev/research"/>
  <xhtml:link rel="alternate" hreflang="en" href="https://lafim.pages.dev/en/research"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://lafim.pages.dev/research"/>
</url>
```

### Validação de XML bem-formado (PowerShell, `[xml]` parser nativo)
```
XML well-formed: OK
url count: 16
```

### `npx tsc --noEmit`
Sem saída (sucesso).

### `npm run lint`
```
✖ 3 problems (0 errors, 3 warnings)
```
As 3 warnings são pré-existentes (Footer.tsx:56 `<img>`, text-effect.tsx:183 `_` não usado, PageHeader.tsx:28 `<img>`) — nenhuma nova.

### `npm run build`
```
> lafim@0.1.0 build
> npm run generate-sitemap && next build --turbopack

sitemap.xml gerado com 16 URLs em S:\Projetos\academic_page\lafim\public\sitemap.xml
   ▲ Next.js 15.5.19 (Turbopack)
 ✓ Compiled successfully in 2.5s
 ✓ Generating static pages (20/20)
 ✓ Exporting (2/2)
```
Build verde, 20 rotas exportadas (16 páginas bilíngues + /, /en, /_not-found, etc.).

### JSON-LD gerado no export estático (`out/en.html` e `out/index.html`)
```
out/en.html:
  "description":"Research in condensed matter physics, nanomaterials and superconductivity at the Federal University of Maranhão."
  "inLanguage":"en"
  "knowsAbout":["Condensed Matter Physics","Nanomaterials","Superconductivity","Raman Spectroscopy","Phase Transitions"]

out/index.html:
  "description":"Pesquisa em física da matéria condensada, nanomateriais e supercondutividade na Universidade Federal do Maranhão."
  "inLanguage":"pt-BR"
```

### Arquivos alterados
- `scripts/generate-sitemap.ts`
- `app/en/layout.tsx`
- `app/(pt)/layout.tsx`
- `public/sitemap.xml` (entregável — mantido, não revertido)
- `tsconfig.tsbuildinfo` revertido com `git checkout --` (artefato de build, não faz parte do plano).
