# Plano 010 — Mapas de exibição de valores de dados (role, type, scholarship, category)

**Status:** TODO
**Fase coberta:** Fase 2 (Tradução da UI)
**Depende de:** plano 009
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Traduzir, apenas na exibição do `/en`, os valores de dados que permanecem em PT no frontmatter: `role` (membros), `type` (publicações), `scholarship` (bolsa) e `category` (notícias). Preencher os mapas no dicionário e aplicá-los nos componentes que exibem esses valores.

## Por quê
Decisão de arquitetura: **os valores no frontmatter continuam em PT** (`role: "Coordenador"`, `type: "Tese"`, etc.) para não migrar dados nem trocar os selects do CMS. A exibição em inglês usa um mapa `PT → EN`. Comparações lógicas (filtros, agrupamentos) continuam usando o valor PT canônico; só o **texto exibido** passa pelo mapa.

## Arquivos afetados
- `lib/i18n/dictionaries.ts` — preencher `roles`, `pubTypes`, `scholarships`, `newsCategories` em `pt` (identidade — chave = valor) e `en` (tradução).
- `components/pages/MembersPage.tsx` — exibir `role` traduzido (grupos de egressos e onde o texto do papel aparece).
- `components/ui/MemberCardModal.tsx` — se exibir `role`/`scholarship` como texto, aplicar mapa (receber locale/strings por prop).
- `components/ui/PublicationsFilter.tsx` — badge `pub.type` via mapa (recebe o mapa por prop, mantendo o padrão de props do plano 005).
- `components/pages/PublicationsPage.tsx` — seção de teses: exibição de `thesis.type` via mapa (o filtro por `"Tese"/"Dissertação"` permanece cru).
- `components/ui/NewsCard.tsx` e/ou `components/pages/NewsPage.tsx` — se a `category` for exibida, aplicar mapa.

## Contexto necessário

- Valores canônicos (do `public/admin/config.yml`), com tradução EN sugerida:
  - **roles**: Coordenador→Coordinator, Pesquisador Sênior→Senior Researcher, Pós-Doutorando→Postdoctoral Researcher, Doutorando→PhD Student, Mestrando→Master's Student, Iniciação Científica→Undergraduate Researcher, Egresso→Alumnus, Colaborador Externo→External Collaborator.
  - **pubTypes**: Artigo→Article, Preprint→Preprint, Tese→PhD Thesis, Dissertação→Master's Dissertation, Livro→Book, Capítulo→Book Chapter.
  - **scholarships**: CAPES→CAPES, CNPq→CNPq, FAPEMA→FAPEMA, "Sem bolsa"→Unfunded.
  - **newsCategories**: Publicação→Publication, Defesa→Thesis Defense, Premiação→Award, Visita→Visit, Mídia→Media, Outros→Other.
- No `pt`, cada mapa é **identidade** (chave = valor igual), para que `display(role)` funcione uniformemente nos dois locales.
- Helper de exibição seguro (fallback ao valor cru se não mapeado):
  ```ts
  const label = getDictionary(locale).roles[role] ?? role;
  ```
- **Não** alterar nenhuma comparação lógica: `m.role === "Coordenador"`, `GROUP_ORDER`, `p.type !== "Tese"`, filtros por tag, etc. continuam com os literais PT.
- Client components (`PublicationsFilter`, `MemberCardModal`, `NewsCard`) recebem o mapa/locale por **prop** (mantêm o padrão sem contexto global estabelecido nos planos 004–006). Passe o mapa já resolvido a partir do Server Component pai. Ex.: `PublicationsFilter` recebe `typeLabels: Record<string,string>`.
- Verifique quais componentes de fato **exibem** cada valor antes de editar (alguns podem só usar para lógica). Toque apenas onde há exibição textual ao usuário.

## Passos
1. Preencher os 4 mapas em `dictionaries.ts` (pt identidade, en tradução). → verify: `npx tsc --noEmit`.
2. Aplicar `roles`/`scholarships` na exibição de `MembersPage` e `MemberCardModal`. → verify: build.
3. Aplicar `pubTypes` em `PublicationsPage` (teses) e `PublicationsFilter` (badge). → verify: build.
4. Aplicar `newsCategories` onde a categoria for exibida (NewsCard/NewsPage). → verify: `npm run build` verde.
5. Conferir `/en/members`, `/en/publications`, `/en/news`. → verify: papéis, tipos e categorias em inglês; PT inalterado.

## Critérios de aceitação
- [ ] `npm run build` verde.
- [ ] Em `/en/members` os papéis aparecem em inglês (ex.: "PhD Student"); em `/members` continuam em PT.
- [ ] Em `/en/publications` o tipo aparece em inglês (ex.: "PhD Thesis"); filtros e agrupamentos por ano seguem funcionando.
- [ ] Em `/en/news` a categoria (se exibida) aparece em inglês.
- [ ] Nenhuma comparação lógica por `role`/`type` foi alterada.
- [ ] Arquivos de conteúdo (`content/**`) não foram tocados.
