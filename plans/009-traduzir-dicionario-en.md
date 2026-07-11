# Plano 009 — Preencher dicionário EN + formatDate com locale

**Status:** DONE
**Fase coberta:** Fase 2 (Tradução da UI)
**Depende de:** plano 001 (verificável após plano 008)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Substituir os valores clonados de PT em `dictionaries.en` por traduções reais em inglês (nav, seções da home, títulos, labels de filtro, estados vazios, rodapé). Ajustar `formatDate` para aceitar `locale`. Ao final, todas as rotas `/en` exibem a UI em inglês automaticamente (os componentes já leem `getDictionary(locale)`).

## Por quê
Nos planos 002–008 todos os componentes passaram a ler strings via `getDictionary(locale)`, mas o EN ainda era cópia do PT. Preencher o EN é o que efetivamente vira a UI para inglês em `/en`, sem tocar nos componentes.

## Arquivos afetados
- `lib/i18n/dictionaries.ts` — traduzir todos os valores de `dictionaries.en` (manter chaves idênticas ao `pt`).
- `lib/mdx.ts` — `formatDate(date, locale)` com `pt-BR`/`en-US`.
- Callers de `formatDate` que devem passar `locale`: `components/pages/HomePage.tsx` e `components/pages/NewsPage.tsx` (ajuste as chamadas para `formatDate(date, locale)`).

## Contexto necessário

- **Só traduções de UI**; os mapas de VALORES de dados (`roles`, `pubTypes`, `scholarships`, `newsCategories`) são o plano 010 — pode deixá-los vazios (`{}`) aqui.
- Traduções sugeridas (ajuste fino livre, mantendo tom acadêmico conciso):
  - `nav`: home "Home", research "Research", infrastructure "Infrastructure", members "Members", publications "Publications", news "News", about "About", contact "Contact".
  - `home.research`: eyebrow "Research", heading "From atomic structure to material function.", lead/body — traduzir os dois parágrafos.
  - `home.news`: eyebrow "News", heading "Follow the lab's latest updates.", ctaAll "See all news →".
  - `home.cards`: membersTitle "Members", membersCta "Meet the team", pubTitle "Publications", pubCta "See publications", + descrições traduzidas.
  - `home.coordinator`: eyebrow "About the Coordinator", role "LaFiM Coordinator · Department of Physics".
  - `research`: title "Research Lines", intro/empty traduzidos.
  - `infrastructure`: title "Infrastructure", empty "No equipment registered yet.".
  - `news`: title "News", empty, allMonths "All months", allYears "All years", clearFilters "Clear filters", none "No news found for this filter.", prev "← Previous", next "Next →", `months` em inglês (índice 0 = `""`, 1..12 January..December).
  - `about`: title "About the Lab", mission "Mission", history "History", institutional "Institutional Affiliation".
  - `contact`: title "Contact", info "Information", local "Location", email "Email", lattes "Lattes", opportunities "Opportunities", opportunitiesText traduzido, sendEmail "Send email →".
  - `members`: title "Lab Members", coordinator "Coordinator", coordinatorRole "Coordinator", team "Team", alumni "Alumni", collaborators "External collaborators", `rolePlural` — chaves continuam em PT (são os valores do frontmatter) mas os valores traduzidos: `{"Pesquisador Sênior": "Senior Researchers", "Iniciação Científica": "Undergraduate Research"}`.
  - `publications`: title "Publications", intro "List of articles published in peer-reviewed international journals. Full list available on", introLattes "Lattes CV", introScholar "Google Scholar", introArxiv "arXiv", theses "Supervised theses and dissertations", pdf "PDF ↗", filters {all "All", mat "Condensed Matter", supercond "Superconductivity", nano "Nanomaterials", comp "Computational"}, allYears "All years", clearYear "Clear year filter", none "No publications found for this filter.", prev/next, badgeFeatured "Featured".
- `formatDate` novo:
  ```ts
  export function formatDate(date: string | Date | undefined, locale: Locale = "pt"): string {
    if (!date) return "";
    const parsed = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsed.getTime())) return String(date);
    const tag = locale === "en" ? "en-US" : "pt-BR";
    return parsed.toLocaleDateString(tag, { day: "numeric", month: "long", year: "numeric" });
  }
  ```
  Importar `Locale` de `@/lib/i18n`. Manter o default `"pt"` para não quebrar chamadas existentes.
- Atualizar as chamadas de `formatDate` em `HomePage` e `NewsPage` para passar `locale`.

## Passos
1. Traduzir `dictionaries.en` inteiro (chaves idênticas ao `pt`). → verify: `npx tsc --noEmit` (shape idêntico ao pt).
2. Alterar `formatDate(date, locale)` em `lib/mdx.ts`. → verify: build.
3. Passar `locale` nas chamadas de `formatDate` em `HomePage.tsx` e `NewsPage.tsx`. → verify: `npm run build` verde.
4. Navegar `/en` e todas as sub-rotas EN. → verify: strings de interface em inglês.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] Todas as rotas `/en` exibem a UI em inglês (nav labels, títulos de seção, filtros, estados vazios, rodapé de textos fixos) — exceto os labels do menu principal (`Header.tsx`), que ainda lêem `navLinks` de `lib/config.ts` (PT hardcoded) em vez de `dict.nav`; fora do escopo deste plano (arquivo não listado em "Arquivos afetados"), ver nota em Evidência.
- [x] Datas em `/en/news` no formato `en-US` (ex.: "April 20, 2026"); em `/news` seguem `pt-BR`.
- [x] Site PT inalterado.
- [x] `dictionaries.en` tem exatamente as mesmas chaves de `dictionaries.pt`.

## Evidência

### Passos executados
1. Traduzido `dictionaries.en` inteiro em `lib/i18n/dictionaries.ts` (nav, home, research, infrastructure, news, about, contact, members incl. `rolePlural`, publications). Chaves idênticas ao `pt` (`roles`/`pubTypes`/`scholarships`/`newsCategories` continuam `{}`, fora de escopo — plano 010). Atualizado o docstring do arquivo (estava referenciando o plano 009 como pendente).
2. `formatDate(date, locale: Locale = "pt")` em `lib/mdx.ts`, com `Locale` importado de `@/lib/i18n`; `tag = locale === "en" ? "en-US" : "pt-BR"`. Docstring do módulo atualizado (`formatDate(date, locale)`).
3. Chamadas de `formatDate` atualizadas para passar `locale` em `components/pages/HomePage.tsx` (linha do `recentNews.map`) e `components/pages/NewsPage.tsx` (linha do `news.map`).

### Verificações

`npx tsc --noEmit` → sem saída, sem erros.

`npm run lint` → 0 erros, 3 warnings pré-existentes (não regressão):
```
components/layout/Footer.tsx 54:11 — no-img-element
components/motion-primitives/text-effect.tsx 183:17 — no-unused-vars
components/ui/PageHeader.tsx 28:7 — no-img-element
```

`npm run build` → verde, gerou `/en` e todas as sub-rotas (`/en/about`, `/en/contact`, `/en/members`, `/en/news`, `/en/publications`, `/en/research`, `/en/research/infrastructure`) mais as rotas PT equivalentes, export estático completo (20/20 páginas).

### Amostras de HTML (out/)

`out/en.html` (home EN) contém as strings traduzidas:
```
From atomic structure to material function
Meet the team
See publications
Follow the lab
See all news
LaFiM Coordinator
```

`out/index.html` (home PT) permanece em português:
```
Da estrutura atômica
Ver equipe
Ver todas as notícias
```

`out/en/news.html` — filtros e paginação em inglês: `All months`, `All years`, `Clear filters`, `No news found`, `Previous`, `Next →`.
`out/news.html` — equivalentes em PT: `Todos os meses`, `Todos os anos`, `Limpar filtros`, `Anterior`, `Próxima →`.

Datas — `out/en/news.html` (en-US, mês por extenso + vírgula):
```
May 18, 2026
April 30, 2026
March 12, 2026
February 8, 2026
January 20, 2026
```
Datas — `out/news.html` (pt-BR, "dia de mês de ano"):
```
18 de maio de 2026
30 de abril de 2026
12 de março de 2026
8 de fevereiro de 2026
20 de janeiro de 2026
```

Demais páginas EN verificadas por grep (todas presentes em `out/en/*.html`): `about.html` → "About the Lab", "Mission", "History", "Institutional Affiliation"; `contact.html` → "Contact", "Information", "Location", "Opportunities", "Send email"; `members.html` → "Lab Members", "Coordinator", "Team", "Senior Researchers", "Undergraduate Research", "Alumni", "External collaborators"; `publications.html` → "Publications", "Lattes CV", "Google Scholar", "arXiv", "Condensed Matter", "Superconductivity", "Nanomaterials", "Computational", "Featured", "Supervised theses", "Clear year filter"; `research.html` → "Research Lines", "We develop frontier research...".

### Nota de escopo — nav e aria-labels de filtro (não alterados)

- `dict.nav` foi traduzido no dicionário, mas o `Header.tsx` (menu principal) ainda lê `navLinks` de `lib/config.ts` (hardcoded em PT), não `getDictionary(locale).nav`. `Header.tsx` não está em "Arquivos afetados" deste plano — deixado como está, é trabalho de um plano futuro de wiring do header/footer.
- Bônus do reviewer do plano 004 (aria-labels "Filtrar por mês"/"Filtrar por ano" hardcoded em `components/ui/NewsList.tsx`): **não alterado**. Mexer nisso exigiria acrescentar chaves novas ao shape de `dict.news` em `pt` e `en` (repetindo o mesmo valor em PT) e editar `NewsList.tsx`, que não está listado em "Arquivos afetados" deste plano — fora do escopo cirúrgico. Registrado aqui para planos futuros.

### Artefatos gerados revertidos

`public/sitemap.xml` (lastmod mudou para a data do build) e `tsconfig.tsbuildinfo` foram revertidos com `git checkout -- public/sitemap.xml tsconfig.tsbuildinfo` ao final; `git status --porcelain` confirma que só `components/pages/HomePage.tsx`, `components/pages/NewsPage.tsx`, `lib/i18n/dictionaries.ts` e `lib/mdx.ts` seguem modificados no working tree (nenhum commit foi feito).
