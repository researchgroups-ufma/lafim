# Plano 002 — Extrair HomePage e seções para components/pages/

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas)
**Depende de:** plano 001
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Mover o miolo de `app/(site)/page.tsx` para `components/pages/HomePage.tsx`, parametrizado por `locale`, e fazer as seções da home lerem suas strings do dicionário. Ao final, `app/(site)/page.tsx` é um wrapper fino que renderiza `<HomePage locale="pt" />`. Site PT visualmente idêntico.

## Por quê
Na arquitetura de i18n (árvore de rotas espelhada PT na raiz + `/en`), cada rota vira um wrapper fino de ~10 linhas e o conteúdo real fica num componente compartilhado que recebe `locale`. Este plano faz isso para a home. O `/en` só é criado no plano 008.

## Arquivos afetados
- `components/pages/HomePage.tsx` — **criar**: recebe `{ locale }`, contém toda a lógica de leitura de dados hoje em `app/(site)/page.tsx`.
- `app/(site)/page.tsx` — **reescrever** como wrapper: `export default function Page() { return <HomePage locale="pt" />; }` (mantendo o comentário de topo curto).
- `components/sections/ResearchSection.tsx` — receber `locale` e ler strings do dicionário.
- `components/sections/NewsSection.tsx` — idem.
- `components/sections/PageCards.tsx` — idem.
- `components/sections/CoordinatorSection.tsx` — idem.

## Contexto necessário

- **Refactor puro**: o site PT tem de ficar pixel-idêntico. As strings já estão catalogadas em `lib/i18n` (plano 001) com os mesmos textos; troque hardcoded → `dict = getDictionary(locale)`.
- `HomePage` é Server Component `async` (usa `getSingleFile`/`getCollection`/`formatDate` de `lib/mdx`). **Não** adicione `"use client"`.
- Assinatura das seções: hoje `ResearchSection({ researchLines })` etc. Adicione `locale: Locale` às props e passe do `HomePage`. `getDictionary` é síncrono e pode ser chamado em Server Components; nas seções que são Server Components leia direto. `PageCards` também é Server Component.
- **NÃO** mexa em `HighlightsSection` (não tem strings de UI estáticas) nem em `Hero` (subtitle vem de dados) além de, se necessário, repassar `locale` — mas eles não têm strings; deixe-os intactos.
- `getCollection`/`getSingleFile` continuam com a assinatura atual (sem locale) — a migração de conteúdo é o plano 012. Não antecipe.
- Chaves do dicionário a usar (de `getDictionary(locale).home`): `srTitle`, `research.{eyebrow,heading,lead,body}`, `news.{eyebrow,heading,ctaAll}`, `cards.{membersTitle,membersDesc,membersCta,pubTitle,pubDesc,pubCta}`, `coordinator.{eyebrow,role}`.

Mapeamento das strings hardcoded → chaves:
- `ResearchSection`: `"Pesquisa"`→`home.research.eyebrow`; heading→`home.research.heading`; parágrafo lead→`home.research.lead`; parágrafo body→`home.research.body`.
- `NewsSection`: `"Notícias"`→`home.news.eyebrow`; heading→`home.news.heading`; `"Ver todas as notícias →"`→`home.news.ctaAll`.
- `PageCards`: `"Membros"`→`cards.membersTitle`; descrição→`cards.membersDesc`; `"Ver equipe"`→`cards.membersCta`; `"Publicações"`→`cards.pubTitle`; descrição→`cards.pubDesc`; `"Ver publicações"`→`cards.pubCta`. Mantenha os SVGs e `<span className="hp-arw">→</span>` intactos.
- `CoordinatorSection`: eyebrow `"Sobre o Coordenador"`→`coordinator.eyebrow`; `"Coordenador do LaFiM · Departamento de Física"`→`coordinator.role`.
- `HomePage` (h1 sr-only): texto→`home.srTitle`.
- Os links internos das seções (`href="/members"`, `href="/news"`, `href="/publications"`) **permanecem sem prefixo** nesta fase; a localização de href é o plano 011.

## Passos
1. Criar `components/pages/HomePage.tsx` copiando a lógica de `app/(site)/page.tsx`, assinando `export default async function HomePage({ locale }: { locale: Locale })`, e passando `locale` para `ResearchSection`, `NewsSection`, `PageCards`, `NewsSection`, `CoordinatorSection` e `HighlightsSection` (as duas últimas só se precisarem — Coordinator sim, Highlights não). Trocar o h1 hardcoded por `getDictionary(locale).home.srTitle`. → verify: `npx tsc --noEmit`.
2. Reescrever `app/(site)/page.tsx` como wrapper que renderiza `<HomePage locale="pt" />`. → verify: build.
3. Atualizar `ResearchSection`, `NewsSection`, `PageCards`, `CoordinatorSection` para receber `locale` e ler as strings do dicionário conforme mapeamento. → verify: `npm run build` verde.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] Home (`/`) renderiza idêntica: mesmos textos de Pesquisa, Notícias, cards, coordenador (diff visual manual).
- [x] `app/(site)/page.tsx` tem ≤ ~12 linhas úteis (só o wrapper).
- [x] Nenhuma string de UI hardcoded permanece nas 4 seções tocadas (todas via `getDictionary`).
- [x] Docstrings mantidas/atualizadas nos componentes tocados.

## Evidência

**Arquivos criados:**
- `components/pages/HomePage.tsx`

**Arquivos modificados:**
- `app/(site)/page.tsx` — agora wrapper fino (4 linhas úteis: import, export function, return, chave de fechamento).
- `components/sections/ResearchSection.tsx`
- `components/sections/NewsSection.tsx`
- `components/sections/PageCards.tsx`
- `components/sections/CoordinatorSection.tsx`

**`npx tsc --noEmit`:** saída vazia (sem erros).

**`npm run build`:** build verde, 9 rotas estáticas geradas (`/`, `/about`, `/contact`, `/members`, `/news`, `/publications`, `/research`, `/research/infrastructure`, `/_not-found`). Apenas warnings de lint pré-existentes e não relacionados (`no-img-element` em `Footer.tsx`/`PageHeader.tsx`, `no-unused-vars` em `text-effect.tsx`). `public/sitemap.xml` foi regenerado pelo script `generate-sitemap` (parte do `npm run build`) e revertido com `git checkout -- public/sitemap.xml` conforme instrução, para não poluir o diff.

**Verificação de strings hardcoded:** `grep` nas 4 seções tocadas confirma que os únicos matches de strings PT remanescentes são em comentários/docstrings, não em JSX renderizado — todo o texto de UI vem de `getDictionary(locale).home.*`.

**Verificação de uso das seções:** `grep` no repo confirma que `PageCards`, `NewsSection`, `ResearchSection` e `CoordinatorSection` só são importados/usados em `components/pages/HomePage.tsx`, então a mudança de assinatura de props não quebra nenhum outro caller.
