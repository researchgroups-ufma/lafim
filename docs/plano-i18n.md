# Plano de i18n — LaFiM (pt-BR + /en)

**Data:** 2026-07-10
**Objetivo:** versão em inglês do site em `lafim.pages.dev/en`, mantendo o português na raiz (`lafim.pages.dev/`).

**Decisões já tomadas com o usuário:**
- Escopo: traduzir UI + todo o conteúdo editorial, com **fallback para PT** (item sem tradução aparece em português no `/en` — o site inglês nunca fica vazio).
- Workflow: editores traduzem pelo **Decap CMS** (abas PT/EN no painel).
- Navegação: **switch PT|EN no header**, sem detecção automática de idioma.

---

## 1. Estado atual (diagnóstico)

| Aspecto | Situação |
|---|---|
| Framework | Next.js 15 App Router com `output: "export"` (site 100% estático) |
| Hospedagem | Cloudflare Pages (+ Pages Functions só para OAuth do CMS) |
| Rotas | 9 páginas em `app/(site)/` — todas de listagem, sem páginas de detalhe por slug |
| Conteúdo | Markdown em `content/{about,members,research,equipment,news,publications,highlights}/`, tudo em PT |
| CMS | Decap CMS (`public/admin/config.yml`), `locale: pt`, sem i18n configurado |
| Strings de UI | Hardcoded em PT dentro das páginas e componentes, mais `lib/config.ts` (navLinks, siteConfig) |
| Datas | `formatDate()` em `lib/mdx.ts` fixo em `pt-BR` |
| SEO | Canonicals por página, JSON-LD em `app/(site)/layout.tsx`, sitemap gerado por `scripts/generate-sitemap.ts` |

**Restrição central:** `output: "export"` descarta middleware, `headers()`/`cookies()` e o roteamento i18n nativo do Next. Toda a solução precisa ser resolvida em build time — o que, para um site de laboratório com conteúdo estável, é na verdade uma vantagem (zero custo em runtime).

---

## 2. Abordagens consideradas

### A. Árvore de rotas espelhada com wrappers finos ✅ **RECOMENDADA**

Manter o PT na raiz como está e criar `app/en/` espelhando as rotas. O miolo de cada página vira um componente compartilhado parametrizado por locale; os arquivos de rota ficam com ~10 linhas.

- ✅ PT continua na raiz sem nenhum truque de redirect/rewrite.
- ✅ Compatível com `output: "export"` sem gambiarras.
- ✅ Zero dependências novas.
- ✅ URLs exatamente como pedido: `/publications` ↔ `/en/publications`.
- ⚠️ Cada página nova exige dois arquivos de rota (mas são wrappers triviais).

### B. Segmento dinâmico `app/[locale]/` (padrão next-intl)

Todas as rotas ganham prefixo (`/pt/...` e `/en/...`) via `generateStaticParams`.

- ❌ O PT sairia da raiz — quebra as URLs atuais, canonicals e SEO já indexado.
- ❌ Contornar isso exigiria rewrites 200 no `_redirects` do Cloudflare (frágil, duplica URLs indexáveis).

### C. Biblioteca next-intl / next-international

- ❌ O modo "prefixo só no idioma secundário" dessas libs depende de middleware — indisponível com static export. Sobraria só o modo prefixado (mesmo problema da opção B), pagando o custo de uma dependência para pouco ganho num site deste tamanho.

---

## 3. Arquitetura recomendada (detalhe da opção A)

### 3.1 Roteamento — dois root layouts

O atributo `<html lang>` precisa diferir entre as árvores, e ele só pode ser definido no root layout. O App Router suporta **múltiplos root layouts** via route groups (removendo `app/layout.tsx`):

```
app/
├── (pt)/                    ← grupo PT (URLs na raiz, como hoje)
│   ├── layout.tsx           ← root layout: <html lang="pt-BR">, fonts, JSON-LD pt
│   ├── page.tsx             ← wrapper: <HomePage locale="pt" />
│   ├── about/page.tsx
│   ├── ... (demais rotas atuais)
│   └── template.tsx
└── en/                      ← árvore EN
    ├── layout.tsx           ← root layout: <html lang="en">, JSON-LD en
    ├── page.tsx             ← wrapper: <HomePage locale="en" />
    ├── about/page.tsx
    └── ... (espelho das rotas)
```

O conteúdo real de cada página migra de `app/(site)/*/page.tsx` para componentes compartilhados (ex.: `components/pages/PublicationsPage.tsx`) que recebem `locale: "pt" | "en"`. Cada wrapper de rota só define `metadata` (título/descrição no idioma certo + hreflang) e renderiza o componente com o locale.

> Nota: navegar entre root layouts causa full page reload — comportamento esperado e aceitável para troca de idioma.

### 3.2 Strings de UI — dicionário próprio

Criar `lib/i18n/dictionaries.ts` com um objeto por idioma (navegação, títulos de seção, textos introdutórios, labels de filtro, estados vazios, rodapé):

```ts
export const dictionaries = {
  pt: { nav: { research: "Pesquisa", ... }, publications: { intro: "...", theses: "Teses e dissertações orientadas" }, ... },
  en: { nav: { research: "Research", ... }, ... },
} as const;
export type Locale = keyof typeof dictionaries;
```

- Os `navLinks`/`footerLinks` de `lib/config.ts` passam a ser gerados por locale (href ganha prefixo `/en` quando `locale === "en"`).
- Server Components recebem `locale` por prop e leem o dicionário direto. Client Components (`Header`, `PublicationsFilter`, `NewsList`, `MobileNav`...) recebem `locale` ou as strings prontas via props — sem contexto global, sem biblioteca.
- **Valores de dados em PT no frontmatter** (`role: "Coordenador"`, `type: "Tese"`, `scholarship`) **não mudam nos arquivos** — ganham um mapa de exibição no dicionário EN (`"Coordenador" → "Coordinator"`, `"Tese" → "PhD Thesis"`...). Isso evita migrar dados e manter o CMS com selects em PT.

### 3.3 Conteúdo — Decap i18n com fallback em build time

Ativar o [i18n nativo do Decap](https://decapcms.org/docs/i18n/) com `structure: multiple_folders`:

```yaml
i18n:
  structure: multiple_folders
  locales: [pt, en]
  default_locale: pt
```

- Coleções de pasta (`members`, `research`, `equipment`, `news`, `publications`, `highlights`) ganham `i18n: true`; o conteúdo migra para `content/<coleção>/pt/...` e `content/<coleção>/en/...` (mesmo nome de arquivo nos dois idiomas).
- Por campo: `i18n: true` para o que se traduz (título, bio, resumo, corpo); `i18n: duplicate` para o que se copia (foto, e-mail, links, DOI, ano, tags); campos como `role`/`scholarship` ficam só no locale padrão.
- No painel, o editor vê PT e EN lado a lado e traduz quando quiser — **tradução é opcional por item**.
- A coleção de arquivo único `about` fica fora do i18n do Decap (o suporte a file collections é limitado): criar um segundo file entry "Texto Institucional (EN)" apontando para `content/about/index.en.md`.

**Fallback em `lib/mdx.ts`:**

```ts
getCollection(folder, locale) {
  // lê content/<folder>/pt (canônico) e content/<folder>/en,
  // faz merge por nome de arquivo — EN sobrescreve quando existe
}
```

`formatDate(date, locale)` passa a receber o locale (`pt-BR` / `en-US`).

### 3.4 Switch de idioma

Botão `PT | EN` no `Header` (e no `MobileNav`): pega o `usePathname()` atual e adiciona/remove o prefixo `/en`. Como as rotas são espelhadas 1:1 e não há páginas de detalhe por slug, o mapeamento é uma transformação de string pura — sem tabela de rotas.

### 3.5 SEO

- **hreflang:** cada página exporta `alternates.languages` — `pt-BR` → rota raiz, `en` → rota `/en`, `x-default` → raiz. Canonical continua apontando para a própria URL de cada idioma.
- **Metadata traduzida:** título e descrição definidos em cada wrapper de rota.
- **Sitemap:** `scripts/generate-sitemap.ts` passa a emitir as 16 URLs (8 rotas × 2 idiomas) com `<xhtml:link rel="alternate" hreflang=...>` cruzados.
- **JSON-LD:** duplicar no layout EN com `inLanguage: "en"` e descrição traduzida.

---

## 4. Plano de execução (fases verificáveis)

| # | Fase | Entrega | Verificação |
|---|---|---|---|
| 1 | **Infra de rotas** | Reestruturar `app/` em `(pt)/` + `en/` com dois root layouts; extrair o miolo das 9 páginas para `components/pages/`; dicionário `lib/i18n/` com strings PT extraídas (site ainda só em PT) | `npm run build` passa; site PT idêntico ao atual (diff visual das 9 rotas); `/en` renderiza em PT |
| 2 | **Tradução da UI** | Preencher dicionário EN; propagar `locale` a todos os componentes; mapa de exibição de roles/tipos; switch PT\|EN no header/mobile; `formatDate` com locale | Navegar todas as rotas `/en`: zero strings PT de interface; switch preserva a página atual |
| 3 | **Conteúdo + CMS** | Migrar `content/` para subpastas `pt/`; configurar i18n no Decap (`config.yml`); fallback em `getCollection`; entry EN do about; traduzir conteúdo institucional inicial (about, research, equipment, highlights) | CMS abre com abas PT/EN e salva em `content/*/en/`; item sem tradução aparece em PT no `/en`; item traduzido aparece em EN |
| 4 | **SEO + QA** | hreflang em todas as páginas, sitemap bilíngue, JSON-LD en, metadata traduzida | Validar hreflang (view-source das 16 URLs); sitemap com alternates; Lighthouse SEO ok nas duas árvores |

Fases 1→2→3 têm dependência sequencial; a 4 pode andar em paralelo com a 3.

**Ponto de atenção da fase 3:** a migração das pastas de conteúdo e a mudança do `config.yml` + `lib/mdx.ts` precisam ir **no mesmo commit/PR** — feitas separadas, o CMS ou o build quebram. Usar `git mv` para preservar histórico.

---

## 5. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Editores esquecem de traduzir itens novos (ex.: notícias) | O fallback garante que o `/en` nunca quebra — item aparece em PT. Opcional: badge "(em português)" na listagem EN |
| Regressão visual/SEO no site PT durante a reestruturação | Fase 1 é *refactor puro* sem mudança de comportamento; comparar as 9 rotas antes/depois e manter as URLs idênticas |
| CMS quebrar com a nova estrutura de pastas | Testar o Decap localmente (`local_backend`) antes do deploy; commit atômico (ver §4) |
| Conteúdo misto (PT dentro do `/en`) confundir o Google | hreflang + `<html lang>` corretos; o fallback é temporário por natureza — o objetivo é traduzir o conteúdo institucional já na fase 3 |
| Publicações: títulos já são em inglês | Não é risco — a coleção `publications` praticamente não exige tradução (só o tipo "Tese/Dissertação" via mapa de exibição) |

---

## 6. Esforço estimado

- **Fase 1** é a maior (reestruturar rotas + extrair strings hardcoded de ~15 arquivos): ~1 dia de trabalho.
- **Fases 2–4**: ~½ dia cada, mais o tempo humano de tradução do conteúdo institucional.
- Nenhuma dependência nova no `package.json`.
