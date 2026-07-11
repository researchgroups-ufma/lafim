# Plano 011 — Navegação localizada + switch PT|EN

**Status:** TODO
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
- [ ] `npm run build` verde.
- [ ] Na árvore `/en`, todos os links de nav/rodapé apontam para `/en/*` e exibem labels em inglês.
- [ ] O switch preserva a rota: `/publications` ↔ `/en/publications`, `/` ↔ `/en`, `/research/infrastructure` ↔ `/en/research/infrastructure`.
- [ ] O item de nav ativo é destacado corretamente nas duas árvores.
- [ ] Site PT: labels e hrefs idênticos ao anterior (a mudança de `navLinks` para `{key,href}` não altera a renderização PT).
- [ ] `Header.tsx` (legado) não foi tocado.
