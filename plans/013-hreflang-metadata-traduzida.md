# Plano 013 — hreflang + metadata traduzida em todas as rotas

**Status:** TODO
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
- [ ] `npm run build` verde.
- [ ] Cada uma das 16 páginas tem `hreflang` `pt-BR`, `en` e `x-default` corretos e cruzados (view-source).
- [ ] `canonical` de cada página aponta para a própria URL do idioma.
- [ ] Títulos das rotas EN em inglês; PT inalterados.
- [ ] `openGraph`/`twitter` do layout preservados.
