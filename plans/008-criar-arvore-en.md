# Plano 008 — Criar árvore de rotas /en (root layout EN + wrappers)

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas)
**Depende de:** plano 007
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Criar `app/en/` espelhando as 8 rotas: um root layout EN (`<html lang="en">`) e wrappers finos que renderizam os mesmos `components/pages/*` com `locale="en"`. Como o dicionário EN ainda clona o PT (plano 001), o `/en` renderiza em PT — o *fallback* esperado no fim da Fase 1.

## Por quê
Última etapa da Fase 1: a árvore espelhada. `/en` passa a existir e a compilar. A tradução real da UI (dicionário EN, switch, nav localizada) são os planos 009–011.

## Arquivos afetados
- `app/en/layout.tsx` — **criar**: root layout EN (`<html lang="en">`, body, ThemeProvider, globals, chrome, JSON-LD `inLanguage: "en"` placeholder, metadata).
- `app/en/template.tsx` — **criar**: cópia de `app/(pt)/template.tsx` (mesma animação).
- `app/en/page.tsx` — **criar**: `<HomePage locale="en" />`.
- `app/en/about/page.tsx`, `app/en/contact/page.tsx`, `app/en/members/page.tsx`, `app/en/news/page.tsx`, `app/en/publications/page.tsx`, `app/en/research/page.tsx`, `app/en/research/infrastructure/page.tsx` — **criar** wrappers com `locale="en"`.

## Contexto necessário

- `app/en/` é um **segmento real** (não route group), então as URLs ganham prefixo `/en` — exatamente o desejado (`/en`, `/en/research`, ...).
- O layout EN é quase idêntico ao PT (plano 007), com estas diferenças:
  - `<html lang="en">` em vez de `pt-BR`.
  - JSON-LD: mesmo objeto do PT, mas adicione `inLanguage: "en"` (a tradução da `description` do schema é refinada no plano 014 — aqui pode manter a descrição PT como placeholder).
  - `metadata`: mantenha `title.template` `%s | LaFiM`. `alternates.canonical` desta árvore aponta para `/en`. A tradução completa de title/description e hreflang é o plano 013 — aqui basta um metadata mínimo válido.
  - Importa os **mesmos** `ThemeProvider`, `MobileNav`, `SideNav`, `Footer`. (Nesta fase a nav ainda mostra links PT; a nav localizada + switch é o plano 011.)
- Wrappers EN são idênticos aos PT trocando `locale="pt"` → `locale="en"`. Exemplo:
  ```tsx
  import ResearchPage from "@/components/pages/ResearchPage";
  export const metadata = { title: "Research", alternates: { canonical: "/en/research" } };
  export default function Page() { return <ResearchPage locale="en" />; }
  ```
  Os `title` de metadata podem já ir em EN aqui (Research, Members, Publications, News, About, Contact, Infrastructure) — é trivial e adianta o plano 013; canonical de cada um aponta para `/en/...`.
- `import "../globals.css"` no layout EN: confirme o caminho relativo correto a partir de `app/en/layout.tsx` (um nível abaixo de `app/`, igual ao `(pt)`).
- **Não** implementar switch de idioma nem localizar hrefs aqui (plano 011). **Não** mexer no dicionário (plano 009).

## Passos
1. Criar `app/en/layout.tsx` a partir do layout PT, com `lang="en"`, JSON-LD `inLanguage: "en"`, metadata mínimo (`canonical: "/en"`). → verify: `npx tsc --noEmit`.
2. Criar `app/en/template.tsx` (cópia do PT). → verify: existe.
3. Criar os 8 wrappers `app/en/**/page.tsx` com `locale="en"` e `metadata` com títulos EN + `canonical` `/en/...`. → verify: build.
4. `npm run build`. → verify: `out/en/index.html` e `out/en/research/index.html` etc. gerados.

## Critérios de aceitação
- [x] `npm run build` verde; `out/en/` contém as 8 rotas.
- [x] view-source de `/en` mostra `<html lang="en">`.
- [x] `/en` e demais rotas EN renderizam o conteúdo (em PT, via fallback do dicionário) sem erro.
- [x] Site PT (raiz) permanece idêntico.
- [x] Docstring de topo em `app/en/layout.tsx` explicando a árvore EN.

## Evidência

**Nota sobre o formato de saída:** o projeto usa `output: "export"` sem `trailingSlash`, então
o build gera arquivos `.html` planos (ex.: `out/en.html`, `out/en/about.html`), não
`out/en/index.html` como o texto do plano sugeria. Esse é o formato pré-existente do projeto
(mesmo padrão da árvore PT: `out/index.html`, `out/about.html`).

### `npx tsc --noEmit`
```
(sem saída — 0 erros)
```

### `npm run lint`
```
S:\Projetos\academic_page\lafim\components\layout\Footer.tsx
  54:11  warning  Using `<img>` could result in slower LCP...  @next/next/no-img-element

S:\Projetos\academic_page\lafim\components\motion-primitives\text-effect.tsx
  183:17  warning  '_' is assigned a value but never used  @typescript-eslint/no-unused-vars

S:\Projetos\academic_page\lafim\components\ui\PageHeader.tsx
  28:7  warning  Using `<img>` could result in slower LCP...  @next/next/no-img-element

✖ 3 problems (0 errors, 3 warnings)
```
As 3 warnings são pré-existentes (Footer.tsx, text-effect.tsx:183, PageHeader.tsx) — não são regressão.

### `npm run build`
```
sitemap.xml gerado com 8 URLs em ...\public\sitemap.xml
 ✓ Compiled successfully in 2.4s
 ✓ Generating static pages (20/20)
 ✓ Exporting (2/2)

Route (app)                         Size  First Load JS
┌ ○ /                                0 B         216 kB
├ ○ /about                           0 B         205 kB
├ ○ /contact                         0 B         205 kB
├ ○ /en                              0 B         216 kB
├ ○ /en/about                        0 B         205 kB
├ ○ /en/contact                      0 B         205 kB
├ ○ /en/members                      0 B         219 kB
├ ○ /en/news                         0 B         215 kB
├ ○ /en/publications                 0 B         207 kB
├ ○ /en/research                     0 B         211 kB
├ ○ /en/research/infrastructure      0 B         209 kB
├ ○ /members                         0 B         219 kB
├ ○ /news                            0 B         215 kB
├ ○ /publications                    0 B         207 kB
├ ○ /research                        0 B         211 kB
└ ○ /research/infrastructure         0 B         209 kB
```

### Verificação dos 8 arquivos EN gerados (`out/en/`)
```
out/en.html
out/en/about.html
out/en/contact.html
out/en/members.html
out/en/news.html
out/en/publications.html
out/en/research.html
out/en/research/infrastructure.html
```

### `<html lang>` — EN vs PT
```
$ grep -o '<html lang="[^"]*"' out/en.html
<html lang="en"

$ grep -o '<html lang="[^"]*"' out/index.html
<html lang="pt-BR"

$ grep -o '<html lang="[^"]*"' out/en/about.html
<html lang="en"
```
A raiz PT (`out/index.html`) permanece `lang="pt-BR"`, idêntica ao comportamento anterior ao plano.

### Títulos e canonical EN (amostra)
```
$ grep -o '<title>[^<]*</title>' out/en.html
<title>LaFiM — Universidade Federal do Maranhão</title>

$ grep -o '<title>[^<]*</title>' out/en/about.html
<title>About | LaFiM</title>

$ grep -o 'rel="canonical" href="[^"]*"' out/en.html
rel="canonical" href="https://lafim.pages.dev/en"

$ grep -o 'rel="canonical" href="[^"]*"' out/en/research/infrastructure.html
rel="canonical" href="https://lafim.pages.dev/en/research/infrastructure"
```

### JSON-LD `inLanguage`
```
$ grep -o 'inLanguage[^,]*' out/en.html
inLanguage":"en"
```

### Artefatos gerados revertidos
`public/sitemap.xml` e `tsconfig.tsbuildinfo` foram alterados pelo build (apenas `lastmod`
atualizado) e revertidos com `git checkout -- public/sitemap.xml tsconfig.tsbuildinfo`.
`git status` confirma que ambos voltaram ao estado anterior; `out/` é ignorado pelo `.gitignore`
e não requer limpeza. Nenhum commit foi criado.
