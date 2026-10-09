/**
 * orcid-lib.ts — Funções da sincronização de publicações com o ORCID
 *
 * Separado de sync-orcid.ts para que as funções puras (DOI, autores, slug,
 * título) sejam testadas sem rede: ver orcid-lib.test.ts.
 *
 * Fontes:
 *   ORCID   (pub.orcid.org/v3.0, API pública sem credenciais) — quais
 *           trabalhos existem, com DOI, título, ano, periódico e tipo.
 *   Crossref (api.crossref.org) — autores e data de publicação, que o resumo
 *           do ORCID não traz.
 */

// ── DOI ───────────────────────────────────────────────────────────────────────

/**
 * Reduz qualquer forma de DOI à forma canônica em minúsculas ("10.xxxx/...").
 * Aceita "http://dx.doi.org/...", "https://doi.org/...", "doi:..." e o DOI puro,
 * que são as formas que aparecem no conteúdo do site e nas APIs.
 */
export function normalizeDoi(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const doi = raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:\s*/i, "")
    .trim()
    .toLowerCase();
  return doi.startsWith("10.") ? doi : null;
}

// ── Autores ──────────────────────────────────────────────────────────────────

export type CrossrefAuthor = { given?: string; family?: string; name?: string };

// Partículas que não viram inicial: "Jailson dos Santos" → "J.S.", como no Lattes.
const PARTICLES = new Set(["de", "da", "do", "das", "dos", "e", "del", "della", "van", "von", "der"]);

/** Um autor no formato ABNT usado no site: "SOBRENOME, I.I.". */
export function formatAuthor(a: CrossrefAuthor): string {
  if (!a.family) return (a.name ?? "").trim(); // autoria institucional/consórcio
  const family = a.family.trim().toLocaleUpperCase("pt-BR");
  // A partícula é testada na palavra inteira, antes de separar as iniciais:
  // assim "E." (inicial) não some como se fosse a conjunção "e".
  const initials = (a.given ?? "")
    .split(/\s+/)
    .filter((w) => w && !PARTICLES.has(w.toLowerCase()))
    .flatMap((w) => w.split(/[.\-]+/))
    .filter(Boolean)
    .map((p) => p[0].toLocaleUpperCase("pt-BR") + ".")
    .join("");
  return initials ? `${family}, ${initials}` : family;
}

/** Chave de comparação de nomes: sem acento, minúsculas, espaços simples. */
export function nameKey(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * ABNT a partir do nome completo, com o último nome como sobrenome — a forma
 * do Lattes: "João Victor Barbosa Moura" → "MOURA, J.V.B.".
 */
export function abntFromFullName(full: string): string {
  const parts = full.trim().split(/\s+/);
  const family = parts.pop() ?? "";
  return formatAuthor({ given: parts.join(" "), family });
}

/**
 * Lista de autores no padrão do site: separados por " ; ".
 *
 * `names` mapeia nameKey(nome completo) → grafia ABNT fixa: a dos membros do
 * laboratório (nome cadastrado no painel) e a dos colaboradores (lista em
 * data/grafias-autores.json, ver spellingMap). As editoras dividem
 * nome/sobrenome de jeitos diferentes (a ACS manda family "Barbosa Moura",
 * outra manda "Costa dos Santos"), e sem a grafia fixa a mesma pessoa sairia
 * escrita de formas diferentes em cada publicação.
 */
export function formatAuthors(list: CrossrefAuthor[], names: Map<string, string> = new Map()): string {
  return list
    .map((a) => names.get(nameKey(`${a.given ?? ""} ${a.family ?? ""}`)) ?? formatAuthor(a))
    .filter(Boolean)
    .join(" ; ");
}

/**
 * Lista de grafias fixas (grafia ABNT → nomes completos como chegam da
 * Crossref) → mapa nameKey(nome) → grafia, no formato que formatAuthors usa.
 * Só a junção "nome + sobrenome" importa, não onde a editora divide os dois;
 * variantes com iniciais ("Cleânio L. Lima") precisam constar na lista.
 * Erro se o mesmo nome aparece em duas grafias.
 */
export function spellingMap(list: Record<string, string[]>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [abnt, names] of Object.entries(list)) {
    for (const name of names) {
      const key = nameKey(name);
      const prev = map.get(key);
      if (prev && prev !== abnt) throw new Error(`"${name}" aparece em "${prev}" e em "${abnt}"`);
      map.set(key, abnt);
    }
  }
  return map;
}

// ── Front matter ─────────────────────────────────────────────────────────────

// Precisa de aspas quando o YAML leria outra coisa: ": " ou " #" no meio,
// indicador no início, espaço nas pontas, ou cara de número/booleano/null/data
// (sem aspas, "2026-03-15" chega ao site como Date, e não como string).
function needsQuotes(s: string): boolean {
  return (
    s === "" ||
    /: | #|^[\s\-?:,\[\]{}#&*!|>'"%@`]|\s$/.test(s) ||
    /^(true|false|yes|no|on|off|null|~|[-+]?(\d[\d_]*)?\.?\d+([eE][-+]?\d+)?)$/i.test(s) ||
    /^\d{4}-\d{1,2}-\d{1,2}/.test(s)
  );
}

type FrontmatterValue = string | number | boolean | null;

function yamlLine(k: string, v: FrontmatterValue): string {
  if (typeof v !== "string") return `${k}: ${v}`;
  return `${k}: ${needsQuotes(v) ? JSON.stringify(v) : v}`;
}

/**
 * Front matter no estilo das entradas do Decap: valor sem aspas sempre que
 * possível e aspas duplas só quando necessárias (ex.: títulos com ": ").
 * JSON.stringify gera uma string entre aspas duplas que também é YAML válido.
 */
export function toFrontmatter(data: Record<string, FrontmatterValue>): string {
  const lines = Object.entries(data).map(([k, v]) => yamlLine(k, v));
  return `---\n${lines.join("\n")}\n---\n`;
}

/**
 * Acrescenta um campo ao front matter de um arquivo existente sem reescrever
 * o resto: o painel grava listas longas de autores em várias linhas, e um
 * parse + serialize mudaria a formatação. Entra logo depois de `year:`, ou
 * antes do `---` de fechamento se não houver year.
 */
export function addFrontmatterField(raw: string, key: string, value: FrontmatterValue): string {
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const close = raw.indexOf(`${eol}---`, 3);
  if (!raw.startsWith("---") || close < 0) throw new Error("arquivo sem front matter");
  const yearAt = raw.slice(0, close).search(/^year:/m);
  const insertAt = yearAt >= 0 ? raw.indexOf(eol, yearAt) : close;
  return raw.slice(0, insertAt) + eol + yamlLine(key, value) + raw.slice(insertAt);
}

// ── Título ───────────────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };

/**
 * Remove marcação HTML que a Crossref e o ORCID trazem nos títulos
 * (<sub>, <i>, <scp>...) — o site renderiza o título como texto puro.
 */
export function cleanTitle(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/&(amp|lt|gt|quot|#39);/g, (m) => ENTITIES[m])
    .replace(/\s+/g, " ")
    .trim();
}

// ── Nome do arquivo ──────────────────────────────────────────────────────────

/**
 * Slug igual ao que o Decap CMS gera (encoding "unicode", o padrão): mantém
 * letras/dígitos ASCII, "-", ".", "_", "~" e qualquer caractere não ASCII
 * (α, –, ·), troca o resto por "-" e colapsa repetições. Assim o arquivo
 * criado pelo script tem o mesmo nome que teria se fosse criado no painel.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\-._~ -퟿豈-﷏ﷰ-￯]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Tipo ─────────────────────────────────────────────────────────────────────

// Tipos do ORCID → opções do campo "Tipo" no painel. Tipos fora daqui são
// ignorados (com aviso no log) em vez de cadastrados com tipo errado.
const TYPES: Record<string, string> = {
  "journal-article": "Artigo",
  preprint: "Preprint",
  book: "Livro",
  "book-chapter": "Capítulo",
  "dissertation-thesis": "Tese",
};

export function mapType(orcidType: string): string | null {
  return TYPES[orcidType] ?? null;
}

// ── Leitura das APIs ─────────────────────────────────────────────────────────

export type OrcidWork = {
  doi: string;
  title: string;
  year: number | null;
  journal: string | null;
  type: string;
};

type OrcidSummary = {
  title?: { title?: { value?: string } };
  type: string;
  "publication-date"?: { year?: { value?: string } } | null;
  "journal-title"?: { value?: string } | null;
};
type OrcidGroup = {
  "external-ids": { "external-id": { "external-id-type": string; "external-id-value": string }[] };
  "work-summary": OrcidSummary[];
};

/** Trabalhos públicos de um ORCID iD. Trabalhos sem DOI vêm com doi "". */
export async function fetchOrcidWorks(orcid: string): Promise<OrcidWork[]> {
  const res = await fetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`ORCID respondeu HTTP ${res.status}`);
  const body = (await res.json()) as { group: OrcidGroup[] };

  return body.group.map((g) => {
    const s = g["work-summary"][0];
    const doiId = g["external-ids"]["external-id"].find((e) => e["external-id-type"] === "doi");
    const year = s["publication-date"]?.year?.value;
    return {
      doi: normalizeDoi(doiId?.["external-id-value"]) ?? "",
      title: cleanTitle(s.title?.title?.value ?? ""),
      year: year ? Number(year) : null,
      journal: s["journal-title"]?.value ?? null,
      type: s.type,
    };
  });
}

export type CrossrefWork = {
  title: string | null;
  authors: CrossrefAuthor[];
  journal: string | null;
  year: number | null;
  date: string | null;
};

type CrossrefDateParts = { "date-parts"?: (number | null)[][] };

/**
 * Data de publicação "AAAA-MM-DD" a partir do `issued` da Crossref, que é a
 * primeira entre a versão online e a impressa. Sem dia, usa o dia 1; sem mês,
 * devolve null, porque só o ano não acrescenta nada ao campo year.
 */
export function crossrefDate(m: { issued?: CrossrefDateParts }): string | null {
  const [y, mo, d] = m.issued?.["date-parts"]?.[0] ?? [];
  if (!y || !mo) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d || 1)}`;
}

/**
 * Metadados de um DOI na Crossref, ou null se não houver registro ou a
 * consulta falhar — quem chama decide tentar de novo na próxima execução.
 * O mailto entra no User-Agent, como a Crossref pede para o "polite pool".
 */
export async function fetchCrossref(doi: string, mailto: string): Promise<CrossrefWork | null> {
  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { "User-Agent": `LaFiM-site/1.0 (https://lafim.pages.dev; mailto:${mailto})` },
    });
    if (!res.ok) return null;
    const m = (await res.json()).message as {
      title?: string[];
      author?: CrossrefAuthor[];
      "container-title"?: string[];
      issued?: CrossrefDateParts;
    };
    return {
      title: m.title?.[0] ? cleanTitle(m.title[0]) : null,
      authors: m.author ?? [],
      journal: m["container-title"]?.[0] ? cleanTitle(m["container-title"][0]) : null,
      year: m.issued?.["date-parts"]?.[0]?.[0] ?? null,
      date: crossrefDate(m),
    };
  } catch {
    return null;
  }
}
