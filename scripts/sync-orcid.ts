/**
 * sync-orcid.ts — Cadastra publicações novas do ORCID do coordenador
 *
 * Roda toda semana pelo workflow .github/workflows/orcid.yml (e à mão com
 * `npm run sync-orcid`). Para cada trabalho do ORCID que ainda não foi visto:
 *   1. completa autores, periódico e data pela Crossref (o ORCID não traz autores);
 *   2. grava content/publications/pt/<ano>-<slug>.md e a versão en/, nos
 *      mesmos campos e nome de arquivo que o Decap CMS usa;
 *   3. registra o DOI em data/orcid-vistos.json.
 * Depois, preenche `date` nas publicações do site que têm DOI e ainda não
 * têm data (as antigas e as cadastradas no painel) — é por ela que a home
 * escolhe as mais recentes, já que `year` empata dentro do ano.
 *
 * Regras:
 *   - Só adiciona. Nunca apaga publicações nem muda campos existentes; a única
 *     alteração em arquivo existente é acrescentar `date` quando falta.
 *   - "Visto" é permanente: uma publicação apagada no painel não volta.
 *   - Sem data/orcid-vistos.json, apenas registra tudo o que existe hoje
 *     como visto e não importa nada — evita despejar o histórico inteiro.
 *   - Se a Crossref falhar para um DOI, ele não é marcado como visto e
 *     entra na próxima execução.
 *
 * O ORCID iD é lido do membro com role "Coordenador" — trocar no painel
 * muda a fonte sem mexer aqui.
 *
 * Grafia dos autores: membros saem com o nome cadastrado no painel;
 * colaboradores, com a grafia de data/grafias-autores.json. Quando um
 * commit do sync trouxer alguém escrito diferente do resto do site,
 * acrescente o nome como veio da Crossref à grafia certa nesse arquivo.
 *
 * Variáveis de ambiente:
 *   CROSSREF_MAILTO — contato enviado à Crossref (obrigatória)
 *   ORCID_COMMIT_MSG — se definida, caminho onde gravar a mensagem de commit
 *   GITHUB_OUTPUT    — definida pelo Actions; recebe `novos=<n>` e `datas=<n>`
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  abntFromFullName, addFrontmatterField, fetchCrossref, fetchOrcidWorks, formatAuthors, mapType, nameKey, normalizeDoi,
  slugify, spellingMap, toFrontmatter,
} from "./orcid-lib";

const ROOT = process.cwd();
const PUBS = path.join(ROOT, "content", "publications");
const MEMBERS = path.join(ROOT, "content", "members", "pt");
const SEEN_FILE = path.join(ROOT, "data", "orcid-vistos.json");
const SPELLINGS_FILE = path.join(ROOT, "data", "grafias-autores.json");

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

// nameKey(nome completo) → ABNT, para membros e colaboradores saírem com a
// mesma grafia em todas as publicações (ver formatAuthors em orcid-lib.ts).
// Membro cadastrado no painel prevalece sobre a lista de colaboradores.
function authorNames(): Map<string, string> {
  const names = spellingMap(JSON.parse(fs.readFileSync(SPELLINGS_FILE, "utf8")));
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

/**
 * Acrescenta `date` (Crossref) às publicações com DOI que ainda não têm, em
 * pt/ e en/. Sem data com mês na Crossref, o arquivo fica como está e é
 * consultado de novo na próxima execução. Devolve os arquivos alterados.
 */
async function fillDates(mailto: string): Promise<string[]> {
  const filled: string[] = [];
  for (const file of fs.readdirSync(path.join(PUBS, "pt")).filter((f) => f.endsWith(".md"))) {
    const data = readFrontmatter(path.join(PUBS, "pt", file));
    const doi = normalizeDoi(String(data.doi ?? ""));
    if (!doi || data.date) continue;

    const date = (await fetchCrossref(doi, mailto))?.date;
    if (!date) {
      console.warn(`  sem data com mês na Crossref para ${doi}`);
      continue;
    }
    for (const locale of ["pt", "en"]) {
      const full = path.join(PUBS, locale, file);
      if (!fs.existsSync(full) || readFrontmatter(full).date) continue;
      fs.writeFileSync(full, addFrontmatterField(fs.readFileSync(full, "utf8"), "date", date));
    }
    filled.push(file);
    console.log(`  date ${date}: ${file}`);
  }
  return filled;
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
  const names = authorNames();
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
      authors: formatAuthors(cr.authors, names),
      year: w.year ?? cr.year,
      ...(cr.date ? { date: cr.date } : {}),
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

  const dated = await fillDates(mailto);
  setOutput("datas", dated.length);
  console.log(`${dated.length} data(s) de publicação preenchida(s).`);

  if ((added.length || dated.length) && process.env.ORCID_COMMIT_MSG) {
    const subject = added.length ? "docs: publicações novas do ORCID" : "docs: datas de publicação pela Crossref";
    const body = [
      ...added.map((t) => `- ${t}`),
      ...(dated.length ? ["", "Data de publicação preenchida:", ...dated.map((f) => `- ${f}`)] : []),
    ];
    const msg = `${subject}\n\n${body.join("\n").trim()}\n`;
    fs.writeFileSync(process.env.ORCID_COMMIT_MSG, msg);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
