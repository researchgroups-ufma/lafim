# Plano 005 — Extrair PublicationsPage + PublicationsFilter (locale)

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas)
**Depende de:** plano 001
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Mover o miolo de `app/(site)/publications/page.tsx` para `components/pages/PublicationsPage.tsx` (com `locale`) e fazer o client `PublicationsFilter` receber strings do dicionário por prop. Rota vira wrapper `locale="pt"`. Site PT idêntico.

## Por quê
Mesmo padrão dos planos 002–004. `PublicationsPage` (Server) tem o bloco introdutório com links externos e a seção "Teses e dissertações"; `PublicationsFilter` (client) tem labels de filtro e paginação.

## Arquivos afetados
- `components/pages/PublicationsPage.tsx` — **criar** (miolo de `app/(site)/publications/page.tsx`).
- `app/(site)/publications/page.tsx` — **reescrever** como wrapper (mantém `metadata`).
- `components/ui/PublicationsFilter.tsx` — receber `strings` por prop.

## Contexto necessário

- **Refactor puro**: PT idêntico. Strings no dicionário (plano 001, chave `publications`).
- `PublicationsPage`: Server Component `async`, `({ locale }: { locale: Locale })`.
- Bloco introdutório com links externos: o texto `"Lista de artigos publicados... disponível no "` está partido em torno de 3 `<a>` (Lattes, Google Scholar, arXiv) e vírgulas/"e". Mantenha a **mesma estrutura JSX e os mesmos href externos**; troque apenas os textos por `publications.intro`, `publications.introLattes`, `publications.introScholar`, `publications.introArxiv`. Preserve a pontuação literal `,`, ` e ` e `.` entre os links exatamente como hoje.
- Seção teses: `"Teses e dissertações orientadas"`→`publications.theses`; `"PDF ↗"`→`publications.pdf`. O filtro de teses por `type === "Tese" || "Dissertação"` **permanece comparando os valores PT do frontmatter** (os dados ficam em PT; o mapa de exibição EN é o plano 010). `siteConfig.university` intacto.
- `PublicationsFilter` é `"use client"`. Prop `strings`:
  ```ts
  type PubFilterStrings = {
    filters: { all: string; mat: string; supercond: string; nano: string; comp: string };
    allYears: string; clearYear: string; none: string;
    prev: string; next: string; badgeFeatured: string;
  };
  ```
  Mapeamento: array `FILTERS` labels→`strings.filters.*` (mantenha os `value` `all/mat/supercond/nano/comp` — são chaves de dados, não traduzir); `"Todos os anos"`→`allYears`; `"Limpar filtro de ano"`→`clearYear`; `"Nenhuma publicação encontrada para este filtro."`→`none`; `"← Anterior"`→`prev`; `"Próxima →"`→`next`; badge `"Destaque"`→`badgeFeatured`. **O badge `pub.type` e os `tag` continuam exibindo o valor cru** (mapa de exibição é plano 010).
- `metadata` no wrapper. `getCollection` sem locale ainda (plano 012).

## Passos
1. Criar `components/pages/PublicationsPage.tsx` com o miolo, prop `locale`, strings via dicionário, passando `strings` ao `PublicationsFilter`. → verify: `npx tsc --noEmit`.
2. Ajustar `PublicationsFilter` para receber `strings`. → verify: build.
3. Reescrever a rota como wrapper `locale="pt"` mantendo `metadata`. → verify: `npm run build` verde.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] `/publications` idêntica: intro com 3 links, filtros por tag/ano, paginação, seção de teses (diff visual).
- [x] `PublicationsFilter` sem strings de UI hardcoded (exceto valores de dados: `pub.type`, `tag`).
- [x] Docstrings mantidas/atualizadas.

## Evidência

Comandos executados (todos verdes):

```
npx tsc --noEmit
# sem saída — sem erros de tipo

npm run lint
# ✖ 3 problems (0 errors, 3 warnings) — os 3 warnings pré-existentes
# (Footer.tsx:54, text-effect.tsx:183, PageHeader.tsx:28), sem regressão

npm run build
# ✓ Compiled successfully in 2.2s
# ✓ Generating static pages (12/12)
# ✓ Exporting (2/2)
# Route /publications: 1.71 kB, 207 kB First Load JS
```

Artefatos gerados pelo build (`public/sitemap.xml`, `tsconfig.tsbuildinfo`) foram
revertidos com `git checkout --` para manter o diff cirúrgico.

Arquivos alterados nesta execução:
- `components/pages/PublicationsPage.tsx` (criado)
- `app/(site)/publications/page.tsx` (reescrito como wrapper)
- `components/ui/PublicationsFilter.tsx` (prop `strings` adicionada)
