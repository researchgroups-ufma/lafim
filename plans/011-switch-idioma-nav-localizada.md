# Plano 011 — Navegação localizada + switch PT|EN

**Status:** DONE
**Fase coberta:** Fase 2 (Tradução da UI)
**Depende de:** plano 009
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Tornar a navegação (SideNav, MobileNav, Footer) ciente do locale — labels traduzidos e hrefs com prefixo `/en` quando na árvore inglesa — e adicionar um switch `PT | EN` que troca o idioma preservando a página atual.

## Por quê
Hoje SideNav/MobileNav/Footer leem `navLinks`/`footerLinks` de `lib/config.ts` (labels PT, hrefs sem prefixo). Renderizados na árvore `/en`, mostram PT e linkam para a raiz PT. Precisam derivar labels do dicionário e prefixar hrefs. O switch é uma transformação de string do `usePathname()` (rotas espelhadas 1:1, sem páginas de detalhe por slug).

## Arquivos afetados
- `lib/config.ts` — transformar `navLinks`/`footerLinks` de arrays fixos com `label` para estruturas com **chave de dicionário** (ex.: `{ key: "research", href: "/research" }`), OU manter os arrays só com `href`+`key` e resolver o label via `getDictionary(locale).nav[key]`. (Ver Contexto.)
- `components/layout/SideNav.tsx` — receber `locale`, resolver labels via dicionário, prefixar hrefs com `localizeHref`, renderizar o switch.
- `components/layout/MobileNav.tsx` — idem (inclui o item extra "Infraestrutura"/"Infrastructure").
- `components/layout/Footer.tsx` — receber `locale`, labels + hrefs localizados.
- `app/(pt)/layout.tsx` e `app/en/layout.tsx` — passar `locale="pt"`/`"en"` para SideNav, MobileNav, Footer.

## Contexto necessário

- A navegação real do site é **SideNav (desktop) + MobileNav (mobile)**; `components/layout/Header.tsx` **não é usado** (legado) — não precisa ser tocado.
- **Chaves de nav** (do dicionário, plano 001): `home, research, infrastructure, members, publications, news, about, contact`. Os hrefs canônicos PT: `/`, `/research`, `/research/infrastructure`, `/members`, `/publications`, `/news`, `/about`, `/contact`.
- Reestruture `lib/config.ts`:
  ```ts
  export const navLinks = [
    { key: "home",         href: "/" },
    { key: "research",     href: "/research" },
    { key: "members",      href: "/members" },
    { key: "publications", href: "/publications" },
    { key: "news",         href: "/news" },
    { key: "about",        href: "/about" },
    { key: "contact",      href: "/contact" },
  ] as const;
  export const footerLinks = [
    { key: "research", href: "/research" },
    { key: "members", href: "/members" },
    { key: "publications", href: "/publications" },
    { key: "contact", href: "/contact" },
  ] as const;
  ```
  (mantenha a ordem atual dos itens). O `SUB_ITEMS` da SideNav (`/research/infrastructure`) usa a chave `infrastructure`.
- Nos componentes de nav:
  - `label = getDictionary(locale).nav[key]`.
  - `href = localizeHref(canonicalHref, locale)` (de `@/lib/i18n`).
  - **Detecção de ativo**: o `usePathname()` na árvore `/en` retorna `/en/research` etc. Compare contra o href **já localizado**. Ajuste as comparações `pathname === link.href` e `pathname.startsWith(link.href + "/")` para usar o href localizado.
- **Switch PT | EN**: componente pequeno (pode ser inline nos navs ou um `components/layout/LanguageSwitch.tsx` novo — prefira um componente reutilizável já que entra em SideNav e MobileNav). Recebe `locale`. Usa `usePathname()`:
  ```ts
  // remove/adiciona prefixo /en preservando o resto do caminho
  function toLocale(pathname: string, target: Locale): string {
    const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
    return target === "en" ? (stripped === "/" ? "/en" : `/en${stripped}`) : stripped;
  }
  ```
  Renderiza dois links: `PT` → `toLocale(pathname,"pt")`, `EN` → `toLocale(pathname,"en")`, com o idioma atual destacado. Use `<Link>` do `next/link`. **Navegação entre root layouts causa full page reload — é esperado e aceitável.**
- Como `SideNav`/`MobileNav`/`Footer` já são componentes de layout, receberão `locale` por prop a partir dos dois root layouts (planos 007/008). Não usar contexto global.
- Não alterar o comportamento visual/animações existentes (GSAP/Framer) além do necessário para injetar label/href/locale.

## Passos
1. Reestruturar `navLinks`/`footerLinks` em `lib/config.ts` para `{ key, href }`. → verify: `npx tsc --noEmit` (vai acusar os consumidores — corrigir nos passos seguintes).
2. Criar `components/layout/LanguageSwitch.tsx` (client) com `toLocale`. → verify: compila.
3. Atualizar `SideNav`, `MobileNav`, `Footer` para receber `locale`, resolver labels via dicionário, localizar hrefs, corrigir detecção de ativo e incluir o `LanguageSwitch`. → verify: build.
4. Passar `locale` para SideNav/MobileNav/Footer nos dois root layouts. → verify: `npm run build` verde.
5. Testar: em `/research`, clicar EN → vai para `/en/research`; a nav em `/en` linka para rotas `/en/*` e mostra labels em inglês. → verify manual.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] Na árvore `/en`, todos os links de nav/rodapé apontam para `/en/*` e exibem labels em inglês.
- [x] O switch preserva a rota: `/publications` ↔ `/en/publications`, `/` ↔ `/en`, `/research/infrastructure` ↔ `/en/research/infrastructure`.
- [x] O item de nav ativo é destacado corretamente nas duas árvores.
- [x] Site PT: labels e hrefs idênticos ao anterior (a mudança de `navLinks` para `{key,href}` não altera a renderização PT).
- [x] `Header.tsx` (legado) não foi tocado.

## Desvio registrado

`lib/config.ts` — `navLinks` ganhou `key` (para resolver labels via dicionário) **mantendo também `label`** (valor PT original), em vez de ficar só `{key, href}` como no snippet do plano. Motivo: `components/layout/Header.tsx` (legado, fora da lista de arquivos afetados, com a restrição explícita "não tocar") lê `link.label`; como o TypeScript do projeto type-checa todo `**/*.tsx` incluído no `tsconfig.json` independente de uso (`next build` roda o mesmo check), remover `label` quebraria a compilação de um arquivo que o plano proíbe editar. Manter `label` ao lado de `key` satisfaz simultaneamente "não tocar Header.tsx" e "build verde" sem alterar o comportamento de nenhum consumidor. `footerLinks` não tem esse problema (só consumido por `Footer.tsx`, que foi atualizado) e ficou `{key, href}` puro, como no plano.

## Evidência

Comandos executados (na raiz do projeto):

```
npx tsc --noEmit
# saída vazia — 0 erros

npm run lint
# ✖ 3 problems (0 errors, 3 warnings) — os mesmos 3 warnings pré-existentes
# (Footer.tsx:56 <img>, text-effect.tsx:183 '_' unused, PageHeader.tsx:28 <img>)

npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (20/20)
# ✓ Exporting (2/2)
# 17 rotas listadas, incluindo as 7 rotas /en/* (/en, /en/about, /en/contact,
#   /en/members, /en/news, /en/publications, /en/research,
#   /en/research/infrastructure)
```

Inspeção do `out/` gerado (Node ad hoc, depois revertido — `out/` é gitignored):

- `out/index.html` (PT) — nav principal: `href="/research"`, `href="/members"`,
  `href="/publications"`, `href="/news"`, `href="/about"`, `href="/contact"`
  com labels PT (`Pesquisa`, `Membros`, `Publicações`, `Contato` confirmados
  no rodapé) — idêntico ao comportamento anterior.
- `out/en.html` (EN) — nav principal: `href="/en/research"`, `href="/en/members"`,
  `href="/en/publications"`, `href="/en/news"`, `href="/en/about"`,
  `href="/en/contact"` com labels `Research`, `Members`, `Publications`,
  `Contact` no rodapé.
- Switch de idioma presente nas duas árvores
  (`<nav aria-label="Idioma">`):
  - `out/index.html`: `<a aria-current="true" ... href="/">pt</a><a ... href="/en">en</a>`
  - `out/en.html`: `<a ... href="/">pt</a><a aria-current="true" ... href="/en">en</a>`
  - `out/research/infrastructure.html`: pt → `href="/research/infrastructure"`,
    en → `href="/en/research/infrastructure"`
  - `out/en/research/infrastructure.html`: mesmos hrefs, com `en` marcado ativo
  - `out/publications.html` ↔ `out/en/publications.html`: idem
    (`/publications` ↔ `/en/publications`)
- Subitem "Infraestrutura"/"Infrastructure" (SideNav):
  - `out/research.html`: `href="/research/infrastructure">Infraestrutura</a>`
  - `out/en/research.html`: `href="/en/research/infrastructure">Infrastructure</a>`
- Detecção de item ativo (`aria-current="page"`) confirmada em
  `out/research.html` e `out/en/research.html` no link "Pesquisa"/"Research"
  respectivamente (comparação feita contra o href já localizado).

Artefatos gerados pelo build (`public/sitemap.xml`, `tsconfig.tsbuildinfo`)
foram revertidos com `git checkout -- public/sitemap.xml tsconfig.tsbuildinfo`
ao final. `components/layout/Header.tsx` não foi tocado (confirmado via
`git status` — não aparece como modificado).

### Correção pós-revisão

A revisão de código reprovou a primeira execução: em `SideNav.tsx`, a detecção
`pathname === href || pathname.startsWith(href + "/")` deixava o link Home
(`href="/en"`) ativo em todas as subpáginas da árvore EN — cada
`out/en/<rota>.html` tinha 2 `aria-current="page"` na nav lateral contra 1 no PT
(em PT o home é `href="/"` e `startsWith("//")` nunca casa).

Correção aplicada em `components/layout/SideNav.tsx`: o link raiz
(`link.href === "/"`) só ativa por igualdade exata —
`pathname === href || (link.href !== "/" && pathname.startsWith(href + "/"))` —
e `showSubItems` ganhou a mesma forma
(`pathname === href || pathname.startsWith(href + "/")`). MobileNav não
precisou de correção (já usava igualdade exata).

Verificação pós-correção (real):

```
npx tsc --noEmit   # 0 erros
npm run build      # verde, 20/20 páginas

# contagem de aria-current="page" por rota (PT vs EN):
research: PT=1 EN=1        members: PT=1 EN=1
publications: PT=1 EN=1    news: PT=2 EN=2 (2º é da paginação, simétrico)
about: PT=1 EN=1           contact: PT=1 EN=1
research/infrastructure: PT=1 EN=1
home: PT=1 EN=1
```

Em `out/en.html` o link ativo é `href="/en"` (home) e em `out/en/research.html`
é apenas `href="/en/research"` — sem duplicidade. Artefatos revertidos
novamente após o build de verificação.
