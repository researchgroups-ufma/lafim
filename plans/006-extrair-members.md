# Plano 006 — Extrair MembersPage (locale)

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas)
**Depende de:** plano 001
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Mover o miolo de `app/(site)/members/page.tsx` para `components/pages/MembersPage.tsx` (com `locale`), lendo os títulos de seção e labels de grupo do dicionário. Rota vira wrapper `locale="pt"`. Site PT idêntico.

## Por quê
`MembersPage` é a página mais extensa (coordenador + equipe agrupada por `role` + egressos + colaboradores). Merece plano próprio. Os cards (`MemberCardModal`, `MemberLinks`) não têm strings de UI traduzíveis relevantes nesta fase — foco nos títulos e labels da página.

## Arquivos afetados
- `components/pages/MembersPage.tsx` — **criar** (miolo de `app/(site)/members/page.tsx`).
- `app/(site)/members/page.tsx` — **reescrever** como wrapper (mantém `metadata`).

## Contexto necessário

- **Refactor puro**: PT idêntico. Strings no dicionário (plano 001, chave `members`).
- Server Component `async`, `({ locale }: { locale: Locale })`.
- Mapeamento:
  - PageHeader `"Membros do laboratório"`→`members.title`.
  - `"Coordenador"` (título da seção)→`members.coordinator`.
  - `"Coordenador · {siteConfig.acronym}"`: monte com `members.coordinatorRole` + `" · "` + `siteConfig.acronym`.
  - `"Equipe"`→`members.team`; `"Egressos"`→`members.alumni`; `"Colaboradores externos"`→`members.collaborators`.
  - Constante local `ROLE_PLURAL` → substituir uso por `getDictionary(locale).members.rolePlural` (mesmo shape). O fallback `` `${role}s` `` permanece.
- **IMPORTANTE — valores de dados ficam em PT:** os arrays `GROUP_ORDER` e as comparações `m.role === "Coordenador"`, `m.role === "Egresso"`, `m.role === "Colaborador Externo"` **continuam usando os valores PT do frontmatter** (os dados não migram; o mapa de exibição EN é o plano 010). Não traduza esses literais de comparação.
- O texto exibido de `member.role` nos egressos (`{member.role as string}`) continua cru nesta fase (plano 010 aplica o mapa de exibição).
- `metadata` no wrapper. `getCollection` sem locale ainda (plano 012).

## Passos
1. Criar `components/pages/MembersPage.tsx` copiando o miolo, prop `locale`, títulos/labels via dicionário; `ROLE_PLURAL` passa a vir de `dict.members.rolePlural`. → verify: `npx tsc --noEmit`.
2. Reescrever `app/(site)/members/page.tsx` como wrapper `locale="pt"` mantendo `metadata`. → verify: `npm run build` verde.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] `/members` idêntica: bloco coordenador, grupos com labels corretos, egressos, colaboradores (diff visual).
- [x] Comparações por `role` continuam em PT (dados intactos).
- [x] Docstrings mantidas/atualizadas.

## Evidência

Comandos executados na raiz do projeto:

- `npx tsc --noEmit` → sem erros (após ajustar indexação de `dict.members.rolePlural` com cast `as Record<string, string>`, necessário porque o dicionário é `as const` e a chave `role` é `string` genérico — mesmo padrão de cast usado no restante do arquivo, ex. `member.role as string`).
- `npm run lint` → `✖ 3 problems (0 errors, 3 warnings)` — os mesmos 3 warnings pré-existentes (Footer.tsx:54, text-effect.tsx:183, PageHeader.tsx:28), sem regressão.
- `npm run build` → build verde, `/members` gerada estaticamente (13.3 kB, 219 kB First Load JS), sem erros de tipo ou lint bloqueante.
- Após o build, `public/sitemap.xml` e `tsconfig.tsbuildinfo` foram revertidos com `git checkout --` para manter o diff cirúrgico (eram os únicos artefatos gerados alterados).
- `git diff --stat -- "app/(site)/members/page.tsx"` → `1 file changed, 6 insertions(+), 285 deletions(-)`, confirmando que o wrapper ficou fino e o miolo foi movido integralmente para `components/pages/MembersPage.tsx`.
