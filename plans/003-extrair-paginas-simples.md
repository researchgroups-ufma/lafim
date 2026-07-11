# Plano 003 — Extrair páginas simples (research, about, contact, infrastructure)

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas)
**Depende de:** plano 001
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Mover o miolo de 4 páginas de listagem simples para `components/pages/`, parametrizadas por `locale`, lendo strings do dicionário. Os arquivos de rota viram wrappers finos com `locale="pt"`, mantendo seus `metadata`. Site PT idêntico.

## Por quê
Mesma motivação do plano 002: preparar a árvore de rotas espelhada. Estas 4 páginas são majoritariamente Server Components com poucas strings, sem client components próprios.

## Arquivos afetados
- `components/pages/ResearchPage.tsx` — **criar** (miolo de `app/(site)/research/page.tsx`).
- `components/pages/AboutPage.tsx` — **criar** (miolo de `app/(site)/about/page.tsx`).
- `components/pages/ContactPage.tsx` — **criar** (miolo de `app/(site)/contact/page.tsx`).
- `components/pages/InfrastructurePage.tsx` — **criar** (miolo de `app/(site)/research/infrastructure/page.tsx`).
- `app/(site)/research/page.tsx`, `app/(site)/about/page.tsx`, `app/(site)/contact/page.tsx`, `app/(site)/research/infrastructure/page.tsx` — **reescrever** como wrappers.

> São ~8 arquivos, mas 4 são wrappers triviais (~10 linhas) e 4 são cópias mecânicas do miolo. Se preferir, faça em dois commits (research+infrastructure; about+contact), mas entregue tudo neste plano.

## Contexto necessário

- **Refactor puro**: PT idêntico. Strings já catalogadas no plano 001; troque hardcoded → `getDictionary(locale)`.
- Cada componente é Server Component `async`. **Não** adicionar `"use client"`. Assinatura: `export default async function XPage({ locale }: { locale: Locale })`.
- **`metadata` fica no arquivo de rota (wrapper), não no componente.** Mantenha o `export const metadata` atual de cada `page.tsx` como está (título/canonical PT). A tradução de metadata é o plano 013.
- `getCollection`/`getSingleFile` continuam sem `locale` (migração é o plano 012). Não antecipe.
- `PageHeader` recebe `title` por prop — passe `getDictionary(locale).<page>.title`. Não altere `PageHeader` (o `title` já é prop).
- Links internos permanecem sem prefixo `/en` nesta fase.

Mapeamento de strings → chaves do dicionário:
- **ResearchPage** (`research`): `title`→PageHeader `"Linhas de Pesquisa"`; parágrafo de introdução→`research.intro`; empty state→`research.empty`.
- **InfrastructurePage** (`infrastructure`): PageHeader title→`infrastructure.title`; empty state→`infrastructure.empty`. Mantém `eyebrow={...siteConfig...}` como está (não é string traduzível fixa; deixe intacto).
- **AboutPage** (`about`): PageHeader `"Sobre o Laboratório"`→`about.title`; `"Missão"`→`about.mission`; `"Histórico"`→`about.history`; `"Vínculo Institucional"`→`about.institutional`. Os valores `siteConfig.*` ficam intactos.
- **ContactPage** (`contact`): PageHeader `"Contato"`→`contact.title`; `"Informações"`→`contact.info`; `"Local"`→`contact.local`; `"Email"`→`contact.email`; `"Lattes"`→`contact.lattes`; `"Oportunidades"`→`contact.opportunities`; parágrafo de oportunidades→`contact.opportunitiesText`; `"Enviar e-mail →"`→`contact.sendEmail`.

Exemplo do wrapper (research):
```tsx
import ResearchPage from "@/components/pages/ResearchPage";
export const metadata = { title: "Pesquisa", alternates: { canonical: "/research" } };
export default function Page() { return <ResearchPage locale="pt" />; }
```

## Passos
1. Criar os 4 componentes em `components/pages/` copiando o miolo, com prop `locale` e strings via `getDictionary`. → verify: `npx tsc --noEmit`.
2. Reescrever os 4 arquivos de rota como wrappers, mantendo o `export const metadata` existente. → verify: build.
3. `npm run build`. → verify: verde.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] `/research`, `/about`, `/contact`, `/research/infrastructure` renderizam idênticos (diff visual manual).
- [x] Cada arquivo de rota tem só o wrapper + `metadata`.
- [x] Nenhuma string de UI hardcoded remanescente nos 4 componentes novos.
- [x] Docstrings mantidas/atualizadas.

## Evidência

Arquivos criados:
- `components/pages/ResearchPage.tsx`
- `components/pages/AboutPage.tsx`
- `components/pages/ContactPage.tsx`
- `components/pages/InfrastructurePage.tsx`

Arquivos reescritos (wrappers finos, mantendo `metadata` existente):
- `app/(site)/research/page.tsx`
- `app/(site)/about/page.tsx`
- `app/(site)/contact/page.tsx`
- `app/(site)/research/infrastructure/page.tsx`

Todas as strings de UI hardcoded (título do PageHeader, parágrafo de introdução, empty states,
labels "Missão"/"Histórico"/"Vínculo Institucional"/"Informações"/"Local"/"Email"/"Lattes"/
"Oportunidades"/texto de oportunidades/"Enviar e-mail →") foram trocadas por
`getDictionary(locale).<page>.<chave>`, usando as chaves já existentes em `lib/i18n/dictionaries.ts`
(criadas no plano 001). `siteConfig.*`, o `eyebrow` de InfrastructurePage e a lógica de
dados (`getCollection`/`getSingleFile`) permaneceram intactos, sem prop `locale`, conforme o plano.

### `npx tsc --noEmit`
Saída vazia (sem erros).

### `npm run build`
```
> lafim@0.1.0 build
> npm run generate-sitemap && next build --turbopack

sitemap.xml gerado com 8 URLs em S:\Projetos\academic_page\lafim\public\sitemap.xml
   ▲ Next.js 15.5.19 (Turbopack)
 ✓ Compiled successfully in 2.1s
   Linting and checking validity of types ...
   (apenas warnings pré-existentes em Footer.tsx, text-effect.tsx e PageHeader.tsx — não relacionados a este plano)
 ✓ Generating static pages (12/12)
 ✓ Exporting (2/2)

Route (app)                         Size  First Load JS
┌ ○ /                            11.1 kB         217 kB
├ ○ /_not-found                      0 B         115 kB
├ ○ /about                           0 B         206 kB
├ ○ /contact                         0 B         206 kB
├ ○ /members                     13.3 kB         219 kB
├ ○ /news                        9.75 kB         216 kB
├ ○ /publications                 1.8 kB         208 kB
├ ○ /research                    5.26 kB         211 kB
└ ○ /research/infrastructure     3.62 kB         209 kB
```
Build verde. `public/sitemap.xml` e `tsconfig.tsbuildinfo` foram regenerados pelo build e
revertidos manualmente após a verificação (`git checkout -- public/sitemap.xml`;
`tsconfig.tsbuildinfo` restaurado ao estado anterior à execução — mesmo diff de 1 linha
pré-existente da sessão do plano 001/002, não introduzido por este plano).

Diff visual manual: conteúdo, estrutura DOM, estilos inline e classes permanecem idênticos
aos originais (comparação linha a linha entre os `page.tsx` antigos e os novos componentes);
apenas os literais PT hardcoded viraram lookups no dicionário PT (idêntico em valor).
