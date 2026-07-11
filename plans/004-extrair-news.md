# Plano 004 — Extrair NewsPage + NewsList (locale)

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas)
**Depende de:** plano 001
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Mover o miolo de `app/(site)/news/page.tsx` para `components/pages/NewsPage.tsx` (com `locale`) e fazer o client component `NewsList` receber suas strings do dicionário via props. Rota vira wrapper `locale="pt"`. Site PT idêntico.

## Por quê
`NewsPage` é Server Component que serializa dados para `NewsList` (client). `NewsList` tem strings hardcoded (nomes de meses, labels de filtro, paginação). Como client components **não podem importar `lib/mdx` (fs)**, e para manter o padrão simples sem contexto global, o `NewsList` recebe as strings prontas por prop a partir do dicionário lido no Server Component.

## Arquivos afetados
- `components/pages/NewsPage.tsx` — **criar** (miolo de `app/(site)/news/page.tsx`).
- `app/(site)/news/page.tsx` — **reescrever** como wrapper (mantém `metadata`).
- `components/ui/NewsList.tsx` — receber `strings` (objeto do dicionário) por prop.

## Contexto necessário

- **Refactor puro**: PT idêntico. Strings já no dicionário (plano 001, chave `news`).
- `NewsPage`: Server Component `async`, assinatura `({ locale }: { locale: Locale })`. Passe `locale` adiante e resolva `getDictionary(locale).news`. Empty state (`"Nenhuma notícia cadastrada ainda."`)→`news.empty`. Passe as strings ao `NewsList`.
- **`formatDate` continua com assinatura atual `formatDate(date)` (pt-BR fixo)** — a versão com locale é o plano 009. Não antecipe.
- `NewsList` é `"use client"`. Adicione uma prop `strings` com o subconjunto necessário. Não importe `lib/i18n` diretamente lá se preferir manter puro por props — mas importar o **tipo** é aceitável; o mais simples é receber via prop:
  ```ts
  type NewsListStrings = {
    allMonths: string; allYears: string; clearFilters: string;
    none: string; prev: string; next: string; months: string[];
  };
  ```
- Mapeamento em `NewsList`: array `MONTH_NAMES`→`strings.months`; `"Todos os meses"`→`strings.allMonths`; `"Todos os anos"`→`strings.allYears`; `"Limpar filtros"`→`strings.clearFilters`; `"Nenhuma notícia encontrada para este filtro."`→`strings.none`; `"← Anterior"`→`strings.prev`; `"Próxima →"`→`strings.next`.
- `metadata` permanece no wrapper. Migração de conteúdo (`getCollection(..., locale)`) é o plano 012 — não antecipe.

## Passos
1. Criar `components/pages/NewsPage.tsx` com o miolo, prop `locale`, empty state via dicionário, e passando `strings={dict.news}` (subconjunto) ao `NewsList`. → verify: `npx tsc --noEmit`.
2. Ajustar `NewsList` para receber `strings` e substituir todas as strings hardcoded. → verify: build.
3. Reescrever `app/(site)/news/page.tsx` como wrapper `locale="pt"` mantendo `metadata`. → verify: `npm run build` verde.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] `/news` idêntica: filtros por mês/ano, paginação, estados vazios (diff visual).
- [x] `NewsList` não tem mais strings de UI hardcoded; recebe tudo por `strings`.
- [x] `NewsList` continua sem importar `lib/mdx`.
- [x] Docstrings mantidas/atualizadas.

## Evidência

`components/pages/NewsPage.tsx` e a maior parte da migração de `components/ui/NewsList.tsx` já existiam no working tree de uma sessão anterior (dicionário `news` completo, `NewsPage` já parametrizado por `locale`, `NewsList` já recebendo `strings` com `allMonths`/`months` mapeados). Nesta sessão foram concluídas as substituições restantes em `NewsList.tsx` (`allYears`, `clearFilters`, `none`, `prev`, `next`) e reescrito `app/(site)/news/page.tsx` como wrapper fino (`locale="pt"`, mantendo `metadata`).

Comandos executados:

```
npx tsc --noEmit
# sem saída — sem erros de tipo

npm run lint
# ✖ 3 problems (0 errors, 3 warnings) — os 3 warnings pré-existentes
# (Footer.tsx:54, text-effect.tsx:183, PageHeader.tsx:28), sem regressão

npm run build
# ✓ Compiled successfully in 2.6s
# ✓ Generating static pages (12/12)
# ✓ Exporting (2/2)
# Route /news: 9.64 kB, First Load JS 215 kB
```

`public/sitemap.xml` (lastmod) e `tsconfig.tsbuildinfo`, alterados pelo build, foram revertidos com `git checkout --` para manter o diff cirúrgico.
