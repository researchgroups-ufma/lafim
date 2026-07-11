# Plano 013 — hreflang + metadata traduzida em todas as rotas

**Status:** DONE
**Fase coberta:** Fase 4 (SEO + QA)
**Depende de:** plano 008 (wrappers) e plano 009 (traduções)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Adicionar `alternates.languages` (hreflang `pt-BR` → raiz, `en` → `/en`, `x-default` → raiz) e `canonical` próprio em cada wrapper de rota das duas árvores, com `title`/`description` traduzidos por idioma.

## Por quê
SEO bilíngue: o Google precisa dos `hreflang` cruzados para relacionar as versões PT/EN de cada página, e de metadata (título/descrição) no idioma correto. Cada wrapper de rota é o lugar de `metadata` (definido na Fase 1).

## Arquivos afetados
- `app/(pt)/page.tsx`, `app/(pt)/about/page.tsx`, `app/(pt)/contact/page.tsx`, `app/(pt)/members/page.tsx`, `app/(pt)/news/page.tsx`, `app/(pt)/publications/page.tsx`, `app/(pt)/research/page.tsx`, `app/(pt)/research/infrastructure/page.tsx` — `metadata` com hreflang.
- `app/en/**/page.tsx` (8 wrappers) — idem, em inglês.
- (Opcional) `lib/i18n/seo.ts` — **criar** helper `pageMetadata({ locale, pathPt, title, description })` que monta o objeto `alternates` para evitar repetição.

## Contexto necessário

- `metadataBase` já é `https://lafim.pages.dev` (definido no layout PT). Os `alternates` podem usar caminhos relativos.
- Para uma rota de caminho canônico PT `p` (ex.: `/research`; raiz é `/`):
  ```ts
  // no wrapper PT
  alternates: {
    canonical: p,
    languages: { "pt-BR": p, en: enHref(p), "x-default": p },
  }
  // no wrapper EN
  alternates: {
    canonical: enHref(p),
    languages: { "pt-BR": p, en: enHref(p), "x-default": p },
  }
  ```
  onde `enHref("/") === "/en"` e `enHref("/research") === "/en/research"` (mesma regra do `localizeHref` do plano 001 — reutilize).
- Helper sugerido para reduzir repetição (8×2 wrappers):
  ```ts
  // lib/i18n/seo.ts
  import type { Metadata } from "next";
  import { type Locale, localizeHref } from "@/lib/i18n";
  export function pageMetadata(locale: Locale, pathPt: string, title: string, description?: string): Metadata {
    const en = localizeHref(pathPt, "en");
    const self = locale === "en" ? en : pathPt;
    return {
      title,
      description,
      alternates: { canonical: self, languages: { "pt-BR": pathPt, en, "x-default": pathPt } },
    };
  }
  ```
  Uso no wrapper: `export const metadata = pageMetadata("pt", "/research", "Pesquisa", "...");` e no EN `pageMetadata("en", "/research", "Research", "...")`.
- Títulos por rota: use os labels de página (PT dos planos 001; EN do 009). Descrições: podem reaproveitar `siteConfig.description` (PT) e uma versão EN curta — mantenha simples e factual, sem inventar dados.
- **Não** duplicar `title` da home de forma que conflite com o `title.template` do layout (`%s | LaFiM`). Para a home, use `title` absoluto se necessário (ex.: `title: { absolute: "LaFiM — ..." }`) mantendo o comportamento atual da raiz PT.
- Preserve o `openGraph`/`twitter` que vivem no layout; este plano mexe só em `alternates`/`title`/`description` por rota.

## Passos
1. (Opcional, recomendado) Criar `lib/i18n/seo.ts` com `pageMetadata`. → verify: `npx tsc --noEmit`.
2. Atualizar o `metadata` dos 8 wrappers PT com `alternates.languages` + canonical. → verify: build.
3. Atualizar o `metadata` dos 8 wrappers EN com títulos/descrições EN + `alternates`. → verify: `npm run build` verde.
4. Conferir o HTML gerado. → verify: `out/research/index.html` contém `<link rel="alternate" hreflang="en" href=".../en/research">` e `hreflang="pt-BR"`; `out/en/research/index.html` idem cruzado.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] Cada uma das 16 páginas tem `hreflang` `pt-BR`, `en` e `x-default` corretos e cruzados (view-source).
- [x] `canonical` de cada página aponta para a própria URL do idioma.
- [x] Títulos das rotas EN em inglês; PT inalterados.
- [x] `openGraph`/`twitter` do layout preservados.

## Evidência

### Arquivos criados/alterados
- **Criado** `lib/i18n/seo.ts` — helper `pageMetadata(locale, pathPt, title, description)` conforme o snippet do plano, com uma diferença deliberada: o parâmetro `title` foi tipado como `Metadata["title"]` (em vez de `string`) para poder aceitar `{ absolute: "..." }` nas duas homes, evitando duplicar a lógica de `alternates` fora do helper.
- **Alterados** (8 wrappers PT): `app/(pt)/page.tsx`, `app/(pt)/about/page.tsx`, `app/(pt)/contact/page.tsx`, `app/(pt)/members/page.tsx`, `app/(pt)/news/page.tsx`, `app/(pt)/publications/page.tsx`, `app/(pt)/research/page.tsx`, `app/(pt)/research/infrastructure/page.tsx` — `metadata` agora usa `pageMetadata("pt", <path>, <title inalterado>, siteConfig.description)`.
- **Alterados** (8 wrappers EN): `app/en/page.tsx`, `app/en/about/page.tsx`, `app/en/contact/page.tsx`, `app/en/members/page.tsx`, `app/en/news/page.tsx`, `app/en/publications/page.tsx`, `app/en/research/page.tsx`, `app/en/research/infrastructure/page.tsx` — `metadata` agora usa `pageMetadata("en", <path>, <title já em inglês do plano 008>, <descrição EN curta>)`.
- **Alterado** `app/en/layout.tsx` — `openGraph.locale: 'en'` → `'en_US'` (pendência registrada pelo reviewer do plano 008), espelhando `pt_BR` do layout PT.
- `public/sitemap.xml` e `tsconfig.tsbuildinfo` foram tocados pelo build (lastmod/cache) e revertidos com `git checkout --` ao final, conforme instruído.

### Decisões
- **Home (PT/EN):** título absoluto via `{ absolute: ... }` para não sofrer o `title.template` (`%s | LaFiM`) do layout — preserva o comportamento atual da raiz PT (`LaFiM — Universidade Federal do Maranhão`) e usa uma tradução factual para a raiz EN (`LaFiM — Laboratory of Materials Physics`), sem inventar dados.
- **Descrições:** PT reaproveita `siteConfig.description` (mesmo texto em todas as páginas, como o plano permite: "podem reaproveitar"); EN usa uma única frase curta factual ("Research in condensed matter physics, nanomaterials and superconductivity at UFMA.") reaproveitada nas 8 rotas EN não-home — evita inventar descrições por página.
- **Conflito de `alternates` layout × wrapper:** o Next.js NÃO faz merge profundo de campos-objeto de metadata entre segmentos (confirmado em `node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts` e no comportamento observado no HTML gerado) — o `alternates` de cada wrapper de página substitui inteiramente o `alternates.canonical: '/'` (PT) / `'/en'` (EN) do layout. Não houve necessidade de alterar `alternates` nos layouts; verificado no HTML final que cada rota emite exatamente um `<link rel="canonical">` (o do wrapper).
- **Formato do export:** confirmado que sem `trailingSlash` as páginas saem como `out/research.html` / `out/en/research.html` (e `out/research/infrastructure.html` / `out/en/research/infrastructure.html`), não `*/index.html`; os `hreflang` foram inspecionados nesses arquivos reais.
- Títulos PT permaneceram literalmente os mesmos textos já existentes nos wrappers (`"Sobre"`, `"Contato"`, etc.) — apenas o objeto de `metadata` mudou de forma (passou a vir de `pageMetadata`).

### Comandos e saídas

```
$ npx tsc --noEmit
(sem saída — 0 erros)

$ npm run lint
✖ 3 problems (0 errors, 3 warnings)
  - components/layout/Footer.tsx:56 (no-img-element) — pré-existente
  - components/motion-primitives/text-effect.tsx:183 (no-unused-vars) — pré-existente
  - components/ui/PageHeader.tsx:28 (no-img-element) — pré-existente

$ npm run build
✓ Compiled successfully
✓ Generating static pages (20/20)
✓ Exporting (2/2)
```

### Amostras do HTML gerado (view-source)

`out/research.html` (PT):
```html
<link rel="alternate" hrefLang="pt-BR" href="https://lafim.pages.dev/research"/>
<link rel="alternate" hrefLang="en" href="https://lafim.pages.dev/en/research"/>
<link rel="alternate" hrefLang="x-default" href="https://lafim.pages.dev/research"/>
<link rel="canonical" href="https://lafim.pages.dev/research"/>
```

`out/en/research.html` (EN, cruzado com o de cima):
```html
<link rel="alternate" hrefLang="pt-BR" href="https://lafim.pages.dev/research"/>
<link rel="alternate" hrefLang="en" href="https://lafim.pages.dev/en/research"/>
<link rel="alternate" hrefLang="x-default" href="https://lafim.pages.dev/research"/>
<link rel="canonical" href="https://lafim.pages.dev/en/research"/>
```

`out/research/infrastructure.html` (PT) e `out/en/research/infrastructure.html` (EN) — mesmo padrão cruzado, canonicals `/research/infrastructure` e `/en/research/infrastructure` respectivamente (confirmado).

`out/index.html` (home PT):
```html
<title>LaFiM — Universidade Federal do Maranhão</title>
<link rel="alternate" hrefLang="pt-BR" href="https://lafim.pages.dev"/>
<link rel="alternate" hrefLang="en" href="https://lafim.pages.dev/en"/>
<link rel="alternate" hrefLang="x-default" href="https://lafim.pages.dev"/>
<link rel="canonical" href="https://lafim.pages.dev"/>
<meta property="og:locale" content="pt_BR"/>
```

`out/en.html` (home EN):
```html
<title>LaFiM — Laboratory of Materials Physics</title>
<link rel="alternate" hrefLang="pt-BR" href="https://lafim.pages.dev"/>
<link rel="alternate" hrefLang="en" href="https://lafim.pages.dev/en"/>
<link rel="alternate" hrefLang="x-default" href="https://lafim.pages.dev"/>
<link rel="canonical" href="https://lafim.pages.dev/en"/>
<meta property="og:locale" content="en_US"/>
```

Títulos/descrições das demais 12 rotas conferidos com o mesmo padrão (PT título inalterado + `| LaFiM`, descrição PT = `siteConfig.description`; EN título já traduzido + `| LaFiM`, descrição EN curta). `og:*`/`twitter:*` de `out/research.html` conferidos como herdados do layout (inalterados por este plano):
```html
<meta property="og:title" content="LaFiM — Universidade Federal do Maranhão"/>
<meta property="og:locale" content="pt_BR"/>
<meta name="twitter:card" content="summary_large_image"/>
```

### Artefatos gerados revertidos
```
$ git checkout -- public/sitemap.xml tsconfig.tsbuildinfo
```
(revertido após cada build; `git status --porcelain` final mostra apenas os 17 arquivos de código-fonte alterados/criados listados acima)
