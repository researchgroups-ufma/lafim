/**
 * sync-orcid.ts — Cadastra publicações novas do ORCID do coordenador
 *
 * Roda toda semana pelo workflow .github/workflows/orcid.yml (e à mão com
 * `npm run sync-orcid`). Para cada trabalho do ORCID que ainda não foi visto:
 *   1. completa autores e periódico pela Crossref (o ORCID não traz autores);
 *   2. grava content/publications/pt/<ano>-<slug>.md e a versão en/, nos
 *      mesmos campos e nome de arquivo que o Decap CMS usa;
 *   3. registra o DOI em data/orcid-vistos.json.
 *
 * Regras:
 *   - Só adiciona. Nunca altera nem apaga publicações existentes.
 *   - "Visto" é permanente: uma publicação apagada no painel não volta.
 *   - Sem data/orcid-vistos.json, apenas registra tudo o que existe hoje
 *     como visto e não importa nada — evita despejar o histórico inteiro.
 *   - Se a Crossref falhar para um DOI, ele não é marcado como visto e
 *     entra na próxima execução.
 *
 * O ORCID iD é lido do membro com role "Coordenador" — trocar no painel
 * muda a fonte sem mexer aqui.
 *
 * Variáveis de ambiente:
 *   CROSSREF_MAILTO — contato enviado à Crossref (obrigatória)
 *   ORCID_COMMIT_MSG — se definida, caminho onde gravar a mensagem de commit
 *   GITHUB_OUTPUT    — definida pelo Actions; recebe `novos=<n>`
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  abntFromFullName, fetchCrossref, fetchOrcidWorks, formatAuthors, mapType, nameKey, normalizeDoi,
  slugify, toFrontmatter,
} from "./orcid-lib";

const ROOT = process.cwd();
const PUBS = path.join(ROOT, "content", "publications");
const MEMBERS = path.join(ROOT, "content", "members", "pt");
const SEEN_FILE = path.join(ROOT, "data", "orcid-vistos.json");

function readFrontmatter(file: string): Record<string, unknown> {
  return matter(fs.readFileSync(file, "utf8")).data;
}

function coordinatorOrcid(): string {
  for (const f of fs.readdirSync(MEMBERS)) {
    const d = readFrontmatter(path.join(MEMBERS, f));
    if (d.role !== "Coordenador") continue;
    const id = String(d.orcid ?? "").match(/\d{4}-\d{4}-\d{4}-\d{3}[\dX]/)?.[0];
    if (id) return id;
  }
  throw new Error('Nenhum membro com role "Coordenador" tem ORCID preenchido');
}

// nameKey(nome completo) → ABNT, para os membros saírem com a mesma grafia
// em todas as publicações (ver formatAuthors em orcid-lib.ts).
function memberNames(): Map<string, string> {
  const names = new Map<string, string>();
  for (const f of fs.readdirSync(MEMBERS)) {
    const title = String(readFrontmatter(path.join(MEMBERS, f)).title ?? "").trim();
    if (title) names.set(nameKey(title), abntFromFullName(title));
  }
  return names;
}

function siteDois(): Set<string> {
  const dois = new Set<string>();
  for (const locale of ["pt", "en"]) {
    const dir = path.join(PUBS, locale);
    for (const f of fs.readdirSync(dir)) {
      const doi = normalizeDoi(String(readFrontmatter(path.join(dir, f)).doi ?? ""));
      if (doi) dois.add(doi);
    }
  }
  return dois;
}

function writeSeen(dois: Set<string>): void {
  fs.mkdirSync(path.dirname(SEEN_FILE), { recursive: true });
  fs.writeFileSync(SEEN_FILE, JSON.stringify([...dois].sort(), null, 2) + "\n");
}

// Mesmo formato de arquivo do Decap: só front matter, corpo vazio.
function writeEntry(file: string, data: Record<string, string | number | boolean | null>): void {
  fs.writeFileSync(file, toFrontmatter(data));
}

function setOutput(key: string, value: string | number): void {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function main(): Promise<void> {
  const mailto = process.env.CROSSREF_MAILTO;
  if (!mailto) throw new Error("Defina CROSSREF_MAILTO");

  const orcid = coordinatorOrcid();
  const works = await fetchOrcidWorks(orcid);
  console.log(`ORCID ${orcid}: ${works.length} trabalhos`);

  if (!fs.existsSync(SEEN_FILE)) {
    writeSeen(new Set(works.map((w) => w.doi).filter(Boolean)));
    console.log(`Primeira execução: ${works.length} DOIs registrados como vistos, nada importado.`);
    setOutput("novos", 0);
    return;
  }

  const seen = new Set<string>(JSON.parse(fs.readFileSync(SEEN_FILE, "utf8")));
  const onSite = siteDois();
  const members = memberNames();
  const year = new Date().getFullYear(); // {{year}} do slug do Decap = ano de criação
  const added: string[] = [];

  for (const w of works) {
    if (!w.doi) {
      console.warn(`  sem DOI, ignorado: ${w.title}`);
      continue;
    }
    if (seen.has(w.doi)) continue;
    if (onSite.has(w.doi)) {
      seen.add(w.doi); // já cadastrado à mão: só passa a constar como visto
      continue;
    }
    const type = mapType(w.type);
    if (!type) {
      console.warn(`  tipo "${w.type}" sem correspondente no painel, ignorado: ${w.title}`);
      seen.add(w.doi);
      continue;
    }

    const cr = await fetchCrossref(w.doi, mailto);
    if (!cr) {
      console.warn(`  Crossref sem dados para ${w.doi}; tenta de novo na próxima execução`);
      continue;
    }

    // Título do ORCID primeiro: é o que o coordenador cadastrou, e vem limpo.
    // O da Crossref chega com <sub> e quebras de linha no meio de fórmulas
    // ("Ce\n <sub>2</sub>\n (MoO") e nem sempre dá para reconstruir os espaços.
    const title = w.title || cr.title;
    if (!title) {
      console.warn(`  sem título no ORCID nem na Crossref: ${w.doi}`);
      continue;
    }
    const file = `${year}-${slugify(title)}.md`;
    if (fs.existsSync(path.join(PUBS, "pt", file))) {
      console.warn(`  já existe ${file} com outro DOI; revisar à mão: ${w.doi}`);
      continue;
    }

    // Campos e ordem iguais aos das entradas criadas no painel. "type" e
    // "featured" não têm i18n no config.yml, por isso só existem em pt/.
    const shared = {
      title,
      authors: formatAuthors(cr.authors, members),
      year: w.year ?? cr.year,
      journal: cr.journal ?? w.journal,
      doi: `https://doi.org/${w.doi}`,
    };
    writeEntry(path.join(PUBS, "pt", file), { ...shared, type, featured: false });
    writeEntry(path.join(PUBS, "en", file), shared);

    seen.add(w.doi);
    added.push(`${shared.year} — ${title}`);
    console.log(`  + ${file}`);
  }

  writeSeen(seen);
  setOutput("novos", added.length);
  console.log(`${added.length} publicação(ões) nova(s).`);

  if (added.length && process.env.ORCID_COMMIT_MSG) {
    const msg = `docs: publicações novas do ORCID\n\n${added.map((t) => `- ${t}`).join("\n")}\n`;
    fs.writeFileSync(process.env.ORCID_COMMIT_MSG, msg);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
