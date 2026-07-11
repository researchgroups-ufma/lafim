# Plano 010 — Mapas de exibição de valores de dados (role, type, scholarship, category)

**Status:** DONE
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
- [x] `npm run build` verde.
- [x] Em `/en/members` os papéis aparecem em inglês (ex.: "PhD Student"); em `/members` continuam em PT.
- [x] Em `/en/publications` o tipo aparece em inglês (ex.: "PhD Thesis"); filtros e agrupamentos por ano seguem funcionando.
- [x] Em `/en/news` a categoria (se exibida) aparece em inglês.
- [x] Nenhuma comparação lógica por `role`/`type` foi alterada.
- [x] Arquivos de conteúdo (`content/**`) não foram tocados.

## Evidência

### Decisões de implementação
- Os 4 mapas foram preenchidos em `lib/i18n/dictionaries.ts` (`pt` = identidade, `en` = tradução), conforme a tabela do plano.
- `MembersPage.tsx` (Server Component) resolve `role`/`scholarship` traduzidos com helpers locais (`roleLabel`, `scholarshipLabel` usando `dict.roles[...] ?? ...`) e passa a string **já traduzida** como prop para `MemberCardModal` — como `MemberCardModal` só exibe o valor recebido (sem lógica própria sobre `role`), não foi necessário alterar esse arquivo. O mesmo helper `roleLabel` é usado na lista de egressos.
- `PublicationsPage.tsx` traduz `thesis.type` inline (`dict.pubTypes[...] ?? ...`) na seção de teses/dissertações (Server Component) e passa `typeLabels={dict.pubTypes}` para `PublicationsFilter` (Client Component), que usa o mapa para o badge de `pub.type` — seguindo o padrão pedido explicitamente no plano ("recebe o mapa por prop").
- `NewsPage.tsx` traduz `category` no momento em que monta o array serializável para o client (`dict.newsCategories[...] ?? ...`), então `NewsCard.tsx`/`NewsList.tsx` não precisaram de alteração (já recebem a categoria pronta para exibição).
- Nenhuma comparação lógica foi tocada: `m.role === "Coordenador"`, `GROUP_ORDER.includes(...)`, `m.role === "Egresso"`, `m.role === "Colaborador Externo"`, `p.type !== "Tese" && p.type !== "Dissertação"` continuam operando sobre os valores PT crus (não traduzidos) do frontmatter.
- `MemberCard.tsx` e `PublicationEntry.tsx` exibem `role`/`type`, mas não são importados/usados em nenhum lugar do app (confirmado via grep) — não foram tocados, por não estarem na lista de "Arquivos afetados" e por serem código morto pré-existente.
- A palavra estática "Bolsa" (PT, hardcoded em `MemberCardModal.tsx`) e "desde" não fazem parte dos mapas de VALORES de dados pedidos pelo plano (são strings de UI, fora do escopo dos 4 mapas) — não foram alteradas.

### Correção pós-revisão (cabeçalhos de grupo em `/en/members`)
A revisão de código apontou que os cabeçalhos de grupo da seção "Equipe" (`components/pages/MembersPage.tsx:171`) ficavam em PT no `/en/members` para os papéis regulares (Pós-Doutorando, Doutorando, Mestrando): o fallback `` ?? `${role}s` `` concatenava "s" à chave PT crua, e `dict.members.rolePlural` só cobre os irregulares ("Pesquisador Sênior", "Iniciação Científica"). Correção aplicada — troca do fallback para `` ?? `${roleLabel(role)}s` `` (linha 171), reaproveitando o helper `roleLabel` já existente (identidade em pt, tradução em en):
```diff
- <p className="group-label">{(dict.members.rolePlural as Record<string, string>)[role] ?? `${role}s`}</p>
+ <p className="group-label">{(dict.members.rolePlural as Record<string, string>)[role] ?? `${roleLabel(role)}s`}</p>
```
Nenhum outro arquivo foi tocado nesta correção (dicionário do plano 009 intocado).

### Verificações
```
npx tsc --noEmit
# (sem saída — 0 erros)

npm run lint
# ✖ 3 problems (0 errors, 3 warnings)
#   Footer.tsx:54 (no-img-element)
#   text-effect.tsx:183 (no-unused-vars)
#   PageHeader.tsx:28 (no-img-element)
# — os 3 warnings pré-existentes esperados; 0 erros.

npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (20/20)
# ✓ Exporting (2/2)
```

### Amostras do HTML gerado (`out/`)

Papéis — `/members` (PT) vs `/en/members` (EN):
```
out/members.html:    Coordenador, Pós-Doutorando, Doutorando, Mestrando, Egresso
out/en/members.html: Coordinator, PhD Student, Master's Student, Alumnus
```

Cabeçalhos de grupo (`.group-label`, seção "Equipe" / "Team") — pós-correção:
```
$ grep -o 'group-label">[^<]*' out/en/members.html | sort -u
group-label">Master&#x27;s Students
group-label">PhD Students
group-label">Postdoctoral Researchers
group-label">Senior Researchers
group-label">Undergraduate Research

$ grep -oE 'Doutorandos|Mestrandos|Pós-Doutorandos' out/en/members.html | sort -u
(nenhuma ocorrência — confirma ausência de cabeçalhos em PT no /en/members)

$ grep -o 'group-label">[^<]*' out/members.html | sort -u
group-label">Doutorandos
group-label">Iniciação Científica
group-label">Mestrandos
group-label">Pesquisadores Sênior
group-label">Pós-Doutorandos
```
PT permanece com os plurais originais (irregulares vindos de `rolePlural`, regulares com "s" concatenado a `roleLabel(role)` que é identidade em pt).

Bolsas — `out/members.html`: "Bolsa Sem bolsa", "Bolsa CNPq", "Bolsa CAPES"
`out/en/members.html`: "Bolsa Unfunded", "Bolsa CNPq", "Bolsa CAPES" (mapa de valor aplicado; palavra estática "Bolsa" fora do escopo do plano)

Tipos de publicação — badges (`badge badge-muted`) em `out/publications.html`: "Artigo"; em `out/en/publications.html`: "Article".
Teses — `out/en/publications.html`: "PhD Thesis", "Master's Dissertation" (texto exibido); `out/publications.html`: "Tese", "Dissertação".
(A ocorrência literal de "Tese"/"Dissertação" também encontrada em `out/en/publications.html` é apenas a **chave PT** do `typeLabels` serializado no payload de hidratação do RSC — não é texto visível ao usuário.)

Categorias de notícia — `out/news.html`: Defesa, Mídia, Outros, Premiação, Publicação, Visita
`out/en/news.html`: Award, Media, Other, Publication, Thesis Defense, Visit

### Artefatos gerados revertidos
`public/sitemap.xml` e `tsconfig.tsbuildinfo` foram alterados pelo build (`lastmod`/hash) e revertidos com `git checkout -- public/sitemap.xml tsconfig.tsbuildinfo` ao final, conforme instrução.
