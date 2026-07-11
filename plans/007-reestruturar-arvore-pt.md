# Plano 007 — Reestruturar árvore PT com root layout único em (pt)

**Status:** DONE
**Fase coberta:** Fase 1 (Infra de rotas)
**Depende de:** planos 002, 003, 004, 005, 006
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Preparar o App Router para múltiplos root layouts: renomear o route group `app/(site)/` → `app/(pt)/`, fundir `app/layout.tsx` (html/body/ThemeProvider/metadata) dentro de `app/(pt)/layout.tsx` (que hoje só tem o chrome) e remover `app/layout.tsx`. As URLs PT continuam na raiz. Site PT idêntico.

## Por quê
Para o `<html lang>` diferir entre PT e EN, cada árvore precisa do seu próprio **root layout**. O App Router só permite múltiplos root layouts se **não existir** `app/layout.tsx` e cada árvore ficar num route group / segmento com seu próprio `layout.tsx` contendo `<html>`/`<body>`. Este plano converte o PT; o plano 008 cria a árvore `/en`.

## Arquivos afetados
- `app/(site)/` → `app/(pt)/` — **renomear a pasta inteira** (use `git mv` para preservar histórico). Route group não altera URL: `(site)` e `(pt)` ambos mapeiam para a raiz.
- `app/(pt)/layout.tsx` — **reescrever**: passa a ser root layout (adiciona `<html lang="pt-BR">`, `<body>`, `ThemeProvider`, `import "../globals.css"`, `export const metadata`) além do chrome já existente (MobileNav, SideNav, Footer, `<main>`, JSON-LD).
- `app/layout.tsx` — **remover** (conteúdo migrado para o layout PT).
- `app/(pt)/template.tsx` — segue junto no rename (nenhuma edição de conteúdo).

## Contexto necessário

- **globals.css**: hoje `app/layout.tsx` faz `import "./globals.css"`. O arquivo `app/globals.css` **permanece em `app/`** (fora dos groups). No layout PT o import passa a ser `import "../globals.css"` (ou `@/app/globals.css` conforme alias). Confirme o caminho relativo correto a partir de `app/(pt)/layout.tsx`.
- Conteúdo a fundir de `app/layout.tsx` para o layout PT:
  - `<html lang="pt-BR">` e `<body>` envolvendo tudo.
  - `<ThemeProvider>` (de `@/components/layout/ThemeProvider`).
  - `export const metadata` com `title.default`, `title.template` e `description` (de `siteConfig`, exatamente como hoje).
- Conteúdo já presente em `app/(site)/layout.tsx` (manter): objeto `schemaOrg` + `<script type="application/ld+json">`, `<MobileNav/>`, `<SideNav/>`, `<main className="pt-14 md:pt-0">{children}</main>`, `<Footer/>`.
- Estrutura final de `app/(pt)/layout.tsx`:
  ```tsx
  export const metadata: Metadata = { /* de app/layout.tsx */ };
  export default function PtLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="pt-BR">
        <body>
          <ThemeProvider>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
            <MobileNav />
            <SideNav />
            <main className="pt-14 md:pt-0">{children}</main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    );
  }
  ```
- **Não** duplicar `metadataBase`/openGraph que hoje estão no `(site)/layout.tsx` `metadata`? Atenção: o `(site)/layout.tsx` atual **também** exporta um `metadata` (com `metadataBase`, `alternates.canonical: '/'`, openGraph, twitter). Ao fundir, **una os dois objetos `metadata`** num só no layout PT: mantenha `title`/`description` do root + `metadataBase`/`openGraph`/`twitter`/`alternates` do site. Não perca nenhum campo.
- Os wrappers de rota (page.tsx) já foram criados nos planos 002–006 e não mudam de conteúdo, só de caminho (vão junto no rename).
- **Não** criar `/en` aqui (é o plano 008). Ao final deste plano só existe a árvore PT, agora com root layout próprio.

## Passos
1. `git mv app/(site) app/(pt)` (renomear o group). → verify: pastas movidas; `app/(pt)/page.tsx` etc. existem.
2. Fundir `app/layout.tsx` em `app/(pt)/layout.tsx` (adicionar html/body/ThemeProvider/globals import/metadata unificado) e remover `app/layout.tsx`. → verify: não há mais `app/layout.tsx`.
3. Ajustar o import do `globals.css` para o caminho relativo correto. → verify: `npm run build` verde.
4. Verificar as 8 rotas PT. → verify: build gera `out/index.html`, `out/research/index.html`, `out/members/index.html`, etc.

## Critérios de aceitação
- [x] `npm run build` verde; `out/` contém as 8 rotas PT na raiz (URLs inalteradas).
- [x] `app/layout.tsx` não existe mais; existe exatamente um root layout PT em `app/(pt)/layout.tsx` com `<html lang="pt-BR">`.
- [x] `<html lang="pt-BR">`, JSON-LD, ThemeProvider, SideNav, MobileNav e Footer presentes no HTML gerado (view-source de `/`).
- [x] `metadata` unificado: `title.template`, `metadataBase`, openGraph e twitter todos presentes.
- [x] Site PT visualmente idêntico ao anterior.

## Evidência

### Rename preservando alterações não commitadas
```
$ git mv "app/(site)" "app/(pt)"
$ git status
Changes to be committed:
	renamed:    app/(site)/about/page.tsx -> app/(pt)/about/page.tsx
	renamed:    app/(site)/contact/page.tsx -> app/(pt)/contact/page.tsx
	renamed:    app/(site)/layout.tsx -> app/(pt)/layout.tsx
	renamed:    app/(site)/members/page.tsx -> app/(pt)/members/page.tsx
	renamed:    app/(site)/news/page.tsx -> app/(pt)/news/page.tsx
	renamed:    app/(site)/page.tsx -> app/(pt)/page.tsx
	renamed:    app/(site)/publications/page.tsx -> app/(pt)/publications/page.tsx
	renamed:    app/(site)/research/infrastructure/page.tsx -> app/(pt)/research/infrastructure/page.tsx
	renamed:    app/(site)/research/page.tsx -> app/(pt)/research/page.tsx
	renamed:    app/(site)/template.tsx -> app/(pt)/template.tsx
Changes not staged for commit:
	modified:   app/(pt)/about/page.tsx
	modified:   app/(pt)/contact/page.tsx
	... (demais wrappers dos planos 002-006, preservados)
```
Nenhuma modificação foi perdida no rename (git tratou como rename+edit para cada arquivo alterado).

### `app/layout.tsx` removido, root layout fundido em `app/(pt)/layout.tsx`
```
$ git rm "app/layout.tsx"
rm 'app/layout.tsx'
```
`app/(pt)/layout.tsx` passou a exportar `<html lang="pt-BR"><body><ThemeProvider>...</ThemeProvider></body></html>`,
com `import "../globals.css"`, `metadata` unificado (title/description de `siteConfig` + metadataBase/alternates/openGraph/twitter
do layout do site antigo) e o chrome já existente (schemaOrg JSON-LD, MobileNav, SideNav, `<main>`, Footer).

### `npx tsc --noEmit`
Sem saída (0 erros) após `npm run build` regenerar `.next/types/validator.ts` com os novos caminhos `(pt)`.
(Antes do build havia erros esperados `Cannot find module '../../app/(site)/...'` — artefato stale de `.next/`, resolvido pelo build.)

### `npm run lint`
```
S:\Projetos\academic_page\lafim\components\layout\Footer.tsx
  54:11  warning  Using `<img>` could result in slower LCP... @next/next/no-img-element
S:\Projetos\academic_page\lafim\components\motion-primitives\text-effect.tsx
  183:17  warning  '_' is assigned a value but never used  @typescript-eslint/no-unused-vars
S:\Projetos\academic_page\lafim\components\ui\PageHeader.tsx
  28:7  warning  Using `<img>` could result in slower LCP... @next/next/no-img-element
✖ 3 problems (0 errors, 3 warnings)
```
As 3 warnings pré-existentes esperadas, sem novas.

### `npm run build`
```
✓ Compiled successfully in 2.1s
✓ Generating static pages (12/12)
✓ Exporting (2/2)

Route (app)                         Size  First Load JS
┌ ○ /                            11.1 kB         216 kB
├ ○ /_not-found                      0 B         115 kB
├ ○ /about                           0 B         205 kB
├ ○ /contact                         0 B         205 kB
├ ○ /members                     13.3 kB         219 kB
├ ○ /news                        9.64 kB         215 kB
├ ○ /publications                1.71 kB         207 kB
├ ○ /research                    5.26 kB         211 kB
└ ○ /research/infrastructure     3.62 kB         209 kB
```

### `out/` contém as 8 rotas PT na raiz
```
$ ls out
404.html about.html contact.html index.html members.html news.html
publications.html research.html research/ ... (research/infrastructure.html)
```
index + about + contact + members + news + publications + research + research/infrastructure = 8 rotas.

### `<html lang="pt-BR">` e chrome presentes no HTML gerado
```
$ grep -o '<html[^>]*>' out/index.html
<html lang="pt-BR">
$ grep -o 'application/ld+json' out/index.html | head -1
application/ld+json
$ grep -o 'class="side-nav' out/index.html | head -1
class="side-nav
$ grep -o 'ResearchOrganization' out/index.html | head -1
ResearchOrganization
```

### Artefatos gerados revertidos
```
$ git checkout -- public/sitemap.xml tsconfig.tsbuildinfo
```
Confirmado sem diffs remanescentes nesses dois arquivos após o build.
