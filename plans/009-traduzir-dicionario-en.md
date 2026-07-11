# Plano 009 — Preencher dicionário EN + formatDate com locale

**Status:** TODO
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
- [ ] `npm run build` verde.
- [ ] Todas as rotas `/en` exibem a UI em inglês (nav labels, títulos de seção, filtros, estados vazios, rodapé de textos fixos).
- [ ] Datas em `/en/news` no formato `en-US` (ex.: "April 20, 2026"); em `/news` seguem `pt-BR`.
- [ ] Site PT inalterado.
- [ ] `dictionaries.en` tem exatamente as mesmas chaves de `dictionaries.pt`.
