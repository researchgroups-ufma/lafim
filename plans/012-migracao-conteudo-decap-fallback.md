# Plano 012 — Migração de conteúdo + Decap i18n + fallback em getCollection

**Status:** DONE
**Fase coberta:** Fase 3 (Conteúdo + CMS)
**Depende de:** plano 008 (estrutura de rotas) e planos 002–006 (callers de getCollection)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer

## Objetivo
Migrar `content/<coleção>/*.md` para subpastas `content/<coleção>/pt/`, ativar o i18n nativo do Decap no `config.yml`, e reescrever `getCollection`/`getSingleFile` para ler `pt` (canônico) + `en` com fallback (EN sobrescreve por nome de arquivo). Tudo **num único commit atômico** — feito em partes, o CMS ou o build quebram.

## Por quê
O conteúdo editorial passa a ser bilíngue via Decap (abas PT/EN), com estrutura `multiple_folders`. O build lê PT como base e sobrepõe traduções EN quando existem — item sem tradução aparece em PT no `/en` (fallback). A mudança de estrutura de pastas, a config do CMS e a leitura em `lib/mdx.ts` são interdependentes e devem ir juntas.

## Arquivos afetados
- `content/members/`, `content/research/`, `content/publications/`, `content/news/`, `content/equipment/`, `content/highlights/` — **`git mv`** de cada `.md` para a subpasta `pt/`. Criar as subpastas `en/` (vazias ou com traduções iniciais).
- `content/equipment/index.md` e `content/about/index.md` — ver tratamento especial abaixo.
- `public/admin/config.yml` — adicionar bloco `i18n` global e marcar coleções/campos.
- `lib/mdx.ts` — `getCollection(folder, locale)` com merge PT+EN; `getSingleFile` para o about EN.
- Callers: `components/pages/*.tsx` que chamam `getCollection`/`getSingleFile` — passar `locale`.

## Contexto necessário

Restrições invioláveis:
- **Coleções de pasta** com `i18n: true`: `members`, `research`, `equipment`, `news`, `publications`, `highlights`.
- **`about` fica FORA do i18n do Decap** (file collection tem suporte limitado): manter `content/about/index.md` (PT) e criar um **segundo file entry** apontando para `content/about/index.en.md`.
- **`equipment/index.md`** (coleção `equipment-info`, file collection do texto introdutório): mesmo tratamento do about se quiser traduzir — criar `content/equipment/index.en.md` e um segundo file entry. Porém atenção: a coleção de pasta `equipment` vai migrar para `content/equipment/pt/` — **o `index.md` da coleção-arquivo NÃO deve ir para dentro de `pt/`**; mantenha-o em `content/equipment/index.md`. Confirme que `getCollection("equipment")` já filtra `slug !== "index"` (filtra) e que a leitura da pasta agora aponta para `content/equipment/pt/`.
- **Valores de frontmatter permanecem em PT** (role, type, scholarship, category) — não traduzir dados; o mapa de exibição é o plano 010. No Decap, esses campos ficam só no locale padrão (sem `i18n: true`).

### Estrutura de pastas alvo
```
content/
  about/index.md            (PT, inalterado)
  about/index.en.md         (novo — tradução institucional)
  equipment/index.md        (PT texto introdutório, inalterado)
  equipment/index.en.md     (novo, opcional)
  equipment/pt/<equip>.md   (git mv dos equipamentos)
  equipment/en/             (traduções, pode começar vazio)
  members/pt/<...>.md        (git mv)
  members/en/
  research/pt/... research/en/
  publications/pt/... publications/en/
  news/pt/... news/en/
  highlights/pt/... highlights/en/
```

### Decap `config.yml`
Adicionar no topo (após `locale: pt`) o bloco global:
```yaml
i18n:
  structure: multiple_folders
  locales: [pt, en]
  default_locale: pt
```
Em cada coleção de pasta, adicionar `i18n: true` na coleção e, por campo:
- `i18n: true` — o que se traduz: `title` (quando aplicável), `bio`, `summary`, `body`, `description`, `excerpt`, `mission`, `intro`, textos.
- `i18n: duplicate` — o que se copia: imagens/fotos, e-mail, links (linkedin, lattes, orcid, scholar, arxiv), `doi`, `arxiv` (id), `year`, `date`, `tags`, `order`, `image_position`, `manufacturer`, `model`, `affiliation`.
- **sem i18n** (só no default_locale): `role`, `scholarship`, `type`, `category`, `year_start`, `year_end`, `current_institution` (valores PT canônicos).

> Títulos de publicações já costumam estar em inglês — marque `title` de `publications` como `i18n: duplicate` (não precisa traduzir). Para `members`, `title` (nome) é `i18n: duplicate` (nome próprio não traduz); o que traduz em membro é `bio`.

Ajuste o `about`: adicionar um segundo item em `files:` da coleção `about`:
```yaml
- name: "about-en"
  label: "Texto Institucional (EN)"
  file: "content/about/index.en.md"
  fields: [ ...mesmos campos do about... ]
```

### `lib/mdx.ts` — nova assinatura
```ts
import { type Locale } from "@/lib/i18n";

export async function getCollection(folder: string, locale: Locale = "pt"): Promise<ContentItem[]> {
  const readDir = (sub: string) => {
    const dir = path.join(CONTENT_DIR, folder, sub);
    if (!fs.existsSync(dir)) return new Map<string, ContentItem>();
    const map = new Map<string, ContentItem>();
    for (const filename of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data, content } = matter(raw);
      map.set(filename, { slug: filename.replace(/\.md$/, ""), body: content, ...data });
    }
    return map;
  };
  const pt = readDir("pt");
  if (locale === "pt") return [...pt.values()];
  const en = readDir("en");
  // merge por nome de arquivo: base PT, EN sobrescreve campo a campo
  const merged = new Map(pt);
  for (const [filename, enItem] of en) {
    const base = pt.get(filename) ?? {};
    merged.set(filename, { ...base, ...enItem });
  }
  return [...merged.values()];
}
```
> Merge campo-a-campo (`{...base, ...enItem}`) garante que campos não traduzidos no EN (que o Decap grava como `duplicate` ou omite) caiam no valor PT. Se preferir merge só quando o arquivo EN existe inteiro, documente a escolha. O importante: **item sem arquivo EN aparece 100% em PT**.

`getSingleFile` continua lendo caminho direto; para o about, o caller decide o arquivo por locale:
```ts
const file = locale === "en" ? "about/index.en.md" : "about/index.md";
const about = await getSingleFile(file);
```
Se `index.en.md` não existir, `getSingleFile` já retorna `{ slug }` — trate para cair no PT (o caller pode ler o EN e, se vazio, reler o PT). Implemente um fallback simples no caller do about (HomePage e AboutPage): se o about EN não tiver `body`/`mission`, use o PT.

### Callers a atualizar (passar `locale`)
- `HomePage.tsx`: `getSingleFile(about por locale)`, `getCollection("research", locale)`, `getCollection("highlights", locale)`, `getCollection("news", locale)`, `getCollection("members", locale)`.
- `ResearchPage.tsx`: `getCollection("research", locale)`.
- `MembersPage.tsx`: `getCollection("members", locale)`.
- `ContactPage.tsx`: `getCollection("members", locale)`.
- `NewsPage.tsx`: `getCollection("news", locale)`.
- `PublicationsPage.tsx`: `getCollection("publications", locale)`.
- `InfrastructurePage.tsx`: `getSingleFile(equipment index por locale)` + `getCollection("equipment", locale)`.
- `AboutPage.tsx`: `getSingleFile(about por locale)` com fallback PT.

### Testar o CMS localmente
Antes de finalizar, valide o Decap com `local_backend` (se configurado) ou revisando o `config.yml` — as abas PT/EN devem aparecer e salvar em `content/<col>/en/`.

## Passos
1. `git mv` de todos os `.md` de cada coleção de pasta para `content/<col>/pt/` (exceto os `index.md` das file collections about/equipment, que ficam onde estão). Criar as pastas `en/`. → verify: `content/members/pt/` existe com os arquivos; `content/members/*.md` na raiz da coleção não existe mais.
2. Editar `public/admin/config.yml`: bloco `i18n` global, `i18n: true` nas 6 coleções de pasta, marcações por campo, segundo file entry `about-en`. → verify: YAML válido (sem erro de indentação); revisão manual.
3. Reescrever `getCollection`/ajustar `getSingleFile` em `lib/mdx.ts` conforme snippets. → verify: `npx tsc --noEmit`.
4. Atualizar todos os callers em `components/pages/*` para passar `locale` (e fallback do about). → verify: build.
5. Criar `content/about/index.en.md` (tradução institucional inicial) e, opcionalmente, `content/equipment/index.en.md` e alguns arquivos `en/` de research/highlights/equipment como conteúdo inicial. Conteúdo sem tradução pode ficar sem arquivo EN (aparecerá em PT). → verify: build.
6. `npm run build`. → verify: verde; `/` e `/en` renderizam; item traduzido aparece em EN, item sem tradução aparece em PT no `/en`.

## Critérios de aceitação
- [x] `npm run build` verde.
- [x] `content/<coleção>/pt/` contém os arquivos migrados; histórico preservado (git mv).
- [x] `config.yml` com `i18n` global + `i18n: true` nas 6 coleções de pasta + file entry `about-en`; YAML válido.
- [x] `getCollection("news", "en")` retorna itens EN quando existem e PT como fallback.
- [x] Uma notícia com tradução EN criada aparece em inglês em `/en/news`; uma sem tradução aparece em PT em `/en/news`.
- [x] `/about` (PT) e `/en/about` (EN via index.en.md, com fallback PT se vazio) funcionam.
- [x] Commit único cobrindo pastas + config.yml + lib/mdx.ts + callers. (feito pelo orquestrador após revisão APROVADO)
- [x] Docstring de `lib/mdx.ts` atualizada descrevendo o fallback.

## Evidência

### 1. Migração de pastas (`git mv`)
Contagem de arquivos migrados para `pt/` (verificado com `ls`):
- `content/members/pt/` — 21 arquivos
- `content/research/pt/` — 4 arquivos
- `content/news/pt/` — 17 arquivos
- `content/publications/pt/` — 3 arquivos
- `content/equipment/pt/` — 5 arquivos (excluindo `index.md`, que permanece em `content/equipment/index.md`)
- `content/highlights/pt/` — 2 arquivos

`content/about/index.md` (PT) permaneceu no lugar; `content/equipment/index.md` (PT) permaneceu no lugar. `git status --porcelain` confirma todas as migrações como renames (`R  content/<col>/<f>.md -> content/<col>/pt/<f>.md`), preservando histórico. Pastas `en/` criadas para as 6 coleções; as vazias (members, research, publications, equipment, highlights) receberam `.gitkeep`; `content/news/en/` recebeu uma tradução real (`2025-11-artigo-vanadatos.md`). `content/about/index.en.md` criado com tradução institucional.

### 2. `config.yml` — validação YAML
```
node_modules/.bin/js-yaml public/admin/config.yml > <tmp>.json
exit: 0
```
Parse bem-sucedido; bloco `i18n` global (`structure: multiple_folders`, `locales: [pt, en]`, `default_locale: pt`) confirmado no JSON gerado; as 6 coleções de pasta (`members`, `research`, `publications`, `news`, `equipment`, `highlights`) têm `i18n: true`; `about` tem o segundo file entry `about-en` apontando para `content/about/index.en.md`.

### 3. `npx tsc --noEmit`
Saída vazia — sem erros de tipo.

### 4. `npm run lint`
```
✖ 3 problems (0 errors, 3 warnings)
```
Os 3 warnings são os pré-existentes (Footer.tsx:56, text-effect.tsx:183, PageHeader.tsx:28) — nenhum novo.

### 5. `npm run build`
Build verde, 20 páginas estáticas geradas (10 rotas × 2 locales), export concluído (`✓ Exporting (2/2)`).

### 6. Verificação de conteúdo no `out/`
- `out/en/news.html` contém o título traduzido "Review on metal vanadates published in international journal" (item com tradução EN) **e** o título em PT "Grupo divulga balanço das atividades do ano anterior" (item sem tradução, fallback PT) — confirma `getCollection("news","en")` fazendo merge campo a campo.
- `out/news.html` (PT) contém "Grupo divulga balanço das atividades" — PT intacto, não afetado pela migração.
- `out/en/about.html` renderiza a missão/histórico em inglês ("To develop excellence in materials physics research...", "History and full description of the laboratory will be added here.") — via `content/about/index.en.md`.
- `out/about.html` (PT) renderiza "Histórico e descrição completa do laboratório serão inseridos aqui." — PT intacto.
- `out/research/infrastructure.html` e `out/en/research/infrastructure.html` mostram o mesmo texto introdutório em PT ("Para investigar o comportamento...") — confirma o fallback do `equipment/index.md` (sem `index.en.md` criado, conforme decisão documentada de não criar a tradução opcional).

### 7. Artefatos gerados revertidos
`public/sitemap.xml` e `tsconfig.tsbuildinfo` foram alterados pelo build (`lastmod`/hash) e revertidos com `git checkout -- public/sitemap.xml tsconfig.tsbuildinfo` ao final, conforme instrução.

### Decisões documentadas
- `research_area` (em `members` e `publications`) e `featured` (em `publications`) não constavam nas listas explícitas do plano (`i18n: true` / `i18n: duplicate` / "sem i18n"); foram tratados como "sem i18n" (só no locale padrão), consistindo com o tratamento de outros campos de dado canônico (`role`, `type`, `category`).
- `content/equipment/index.en.md` **não foi criado** (era opcional no plano); o `InfrastructurePage` já implementa o fallback (lê `index.en.md`, se ausente/sem `intro` recai no PT) e o build confirma o fallback funcionando.
