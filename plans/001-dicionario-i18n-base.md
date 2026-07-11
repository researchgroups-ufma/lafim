# Plano 001 — Dicionário i18n base (lib/i18n/)

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas) — parte do dicionário
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Criar `lib/i18n/` com o tipo `Locale`, um dicionário de strings de UII (PT completo, EN clonando o PT por enquanto) e helpers (`getDictionary`, `localizeHref`). Nada ainda consome o dicionário — este plano só cria a fundação usada pelos planos seguintes.

## Por quê
O site fará i18n sem biblioteca (sem next-intl, zero dependências novas). As strings de interface hoje estão hardcoded em PT dentro das páginas/componentes. Este plano centraliza-as num objeto por idioma. Como o EN começa idêntico ao PT, o `/en` (criado depois) renderiza em PT — é o *fallback* desejado para a Fase 1.

## Arquivos afetados
- `lib/i18n/dictionaries.ts` — **criar**: objeto `dictionaries` com `pt` e `en`, tipo `Locale`.
- `lib/i18n/index.ts` — **criar**: reexporta e expõe `getDictionary(locale)` e `localizeHref(href, locale)`.

## Contexto necessário

Restrições invioláveis do projeto:
- **Zero dependências novas** no `package.json`. Não instalar next-intl nem nada.
- Site é `output: "export"` (estático) — tudo resolvido em build time.
- As strings PT devem ser **cópia exata** das atuais (a Fase 1 é refactor puro; o site PT tem de ficar visualmente idêntico). Não "melhorar" textos.

Shape esperado (use `as const` para inferência literal):

```ts
export const dictionaries = {
  pt: {
    nav: {
      home: "Início",
      research: "Pesquisa",
      infrastructure: "Infraestrutura",
      members: "Membros",
      publications: "Publicações",
      news: "Notícias",
      about: "Sobre",
      contact: "Contato",
    },
    home: {
      srTitle: "Laboratório de Física dos Materiais (LaFiM) — Universidade Federal do Maranhão",
      research: {
        eyebrow: "Pesquisa",
        heading: "Da estrutura atômica à função do material.",
        lead: "O LaFiM estuda a relação entre estrutura, composição e propriedades físicas dos materiais, combinando caracterização experimental e modelagem teórica. Partimos da escala atômica — onde simetria e defeitos governam o sólido — e chegamos às aplicações em energia, sensores e dispositivos funcionais.",
        body: "O grupo mantém colaborações nacionais e internacionais, com infraestrutura própria de síntese e caracterização, formando pesquisadores em iniciação científica, mestrado e doutorado.",
      },
      news: {
        eyebrow: "Notícias",
        heading: "Acompanhe as novidades do laboratório.",
        ctaAll: "Ver todas as notícias →",
      },
      cards: {
        membersTitle: "Membros",
        membersDesc: "Conheça os pesquisadores, estudantes de pós-graduação e alunos de iniciação científica que formam o grupo.",
        membersCta: "Ver equipe",
        pubTitle: "Publicações",
        pubDesc: "Artigos, capítulos e trabalhos em eventos produzidos pelo laboratório ao longo dos anos.",
        pubCta: "Ver publicações",
      },
      coordinator: {
        eyebrow: "Sobre o Coordenador",
        role: "Coordenador do LaFiM · Departamento de Física",
      },
    },
    research: {
      title: "Linhas de Pesquisa",
      intro: "Desenvolvemos pesquisa de fronteira em física da matéria condensada, nanomateriais e supercondutividade. Nosso trabalho combina abordagens teóricas, experimentais e computacionais.",
      empty: "Nenhuma linha de pesquisa cadastrada ainda.",
    },
    infrastructure: {
      title: "Infraestrutura",
      empty: "Nenhum equipamento cadastrado ainda.",
    },
    news: {
      title: "Notícias",
      empty: "Nenhuma notícia cadastrada ainda.",
      allMonths: "Todos os meses",
      allYears: "Todos os anos",
      clearFilters: "Limpar filtros",
      none: "Nenhuma notícia encontrada para este filtro.",
      prev: "← Anterior",
      next: "Próxima →",
      months: ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    },
    about: {
      title: "Sobre o Laboratório",
      mission: "Missão",
      history: "Histórico",
      institutional: "Vínculo Institucional",
    },
    contact: {
      title: "Contato",
      info: "Informações",
      local: "Local",
      email: "Email",
      lattes: "Lattes",
      opportunities: "Oportunidades",
      opportunitiesText: "Interessado em ingressar no grupo como aluno de IC, mestrando ou doutorando? Trabalhamos com bolsas CAPES, CNPq e FAPEMA. Entre em contato pelo e-mail institucional.",
      sendEmail: "Enviar e-mail →",
    },
    members: {
      title: "Membros do laboratório",
      coordinator: "Coordenador",
      coordinatorRole: "Coordenador", // usado como "Coordenador · LaFiM"
      team: "Equipe",
      alumni: "Egressos",
      collaborators: "Colaboradores externos",
      // plurais irregulares dos grupos (os demais recebem "s")
      rolePlural: {
        "Pesquisador Sênior": "Pesquisadores Sênior",
        "Iniciação Científica": "Iniciação Científica",
      },
    },
    publications: {
      title: "Publicações",
      intro: "Lista de artigos publicados em periódicos internacionais revisados por pares. Lista completa disponível no",
      introLattes: "Currículo Lattes",
      introScholar: "Google Scholar",
      introArxiv: "arXiv",
      theses: "Teses e dissertações orientadas",
      pdf: "PDF ↗",
      filters: {
        all: "Todas",
        mat: "Mat. Condensada",
        supercond: "Supercondutividade",
        nano: "Nanomateriais",
        comp: "Computacional",
      },
      allYears: "Todos os anos",
      clearYear: "Limpar filtro de ano",
      none: "Nenhuma publicação encontrada para este filtro.",
      prev: "← Anterior",
      next: "Próxima →",
      badgeFeatured: "Destaque",
    },
    // Mapas de exibição de VALORES de dados (frontmatter fica em PT).
    // Na Fase 1 o PT é identidade; o Plano 010 preenche o EN.
    roles: {} as Record<string, string>,
    pubTypes: {} as Record<string, string>,
    scholarships: {} as Record<string, string>,
    newsCategories: {} as Record<string, string>,
  },
  en: null as unknown, // ver passo 2
} as const;

export type Locale = "pt" | "en";
```

> Atenção: o objeto `en` deve ser um **clone estrutural completo** de `pt` (mesmas chaves, mesmos valores em PT por enquanto). Não use `null`. Duplique o literal de `pt` inteiro dentro de `en` para manter a tipagem literal com `as const`. O Plano 009 substitui os valores por traduções.

Helper de href (Plano 011 usa; criar já):

```ts
// localizeHref("/research", "en") -> "/en/research"; ("/", "en") -> "/en"
export function localizeHref(href: string, locale: Locale): string {
  if (locale === "pt") return href;
  return href === "/" ? "/en" : `/en${href}`;
}
```

## Passos
1. Criar `lib/i18n/dictionaries.ts` com `dictionaries` (pt completo conforme shape acima) e o bloco `en` como cópia literal idêntica ao `pt`, mais `export type Locale`. → verify: `npx tsc --noEmit` sem erros.
2. Criar `lib/i18n/index.ts` com `export * from "./dictionaries"`, `getDictionary(locale: Locale)` (retorna `dictionaries[locale]`) e `localizeHref`. → verify: import de teste `import { getDictionary, localizeHref, type Locale } from "@/lib/i18n"` compila.
3. Rodar build para garantir que nada quebrou (nenhum consumidor ainda). → verify: `npm run build` verde.

## Critérios de aceitação
- [x] `getDictionary("pt").nav.research === "Pesquisa"` e `getDictionary("en").nav.research === "Pesquisa"` (EN ainda clona PT).
- [x] `localizeHref("/news", "en") === "/en/news"` e `localizeHref("/", "en") === "/en"`.
- [x] `npm run build` verde; site inalterado (nenhum componente importa o dicionário ainda).
- [x] Docstring no topo de cada arquivo novo explicando o papel do módulo.

## Evidência

`npx tsc --noEmit` — sem saída (sem erros).

Verificação dos critérios de aceitação via `npx tsx` (script temporário, removido após a verificação):
```
nav.research pt: true
nav.research en: true
localizeHref /news en: true
localizeHref / en: true
```

`npm run build` (trecho relevante):
```
✓ Compiled successfully in 2.7s
   Linting and checking validity of types ...
   [3 warnings pré-existentes em Footer.tsx, text-effect.tsx e PageHeader.tsx — não relacionados a este plano]
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

`public/sitemap.xml` e `tsconfig.tsbuildinfo` foram regenerados pelo build (apenas `lastmod`/cache, sem relação com o dicionário) e revertidos com `git checkout` para manter o diff cirúrgico, já que este plano não os lista em "Arquivos afetados".
