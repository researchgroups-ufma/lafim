/**
 * orcid-lib.ts — Funções da sincronização de publicações com o ORCID
 *
 * Separado de sync-orcid.ts para que as funções puras (DOI, autores, slug,
 * título) sejam testadas sem rede: ver orcid-lib.test.ts.
 *
 * Fontes:
 *   ORCID   (pub.orcid.org/v3.0, API pública sem credenciais) — quais
 *           trabalhos existem, com DOI, título, ano, periódico e tipo.
 *   Crossref (api.crossref.org) — autores, que o resumo do ORCID não traz.
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
  const initials = (a.given ?? "")
    .split(/[\s.\-]+/)
    .filter((p) => p && !PARTICLES.has(p.toLowerCase()))
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
 * `members` mapeia nameKey(nome completo) → forma ABNT dos membros do
 * laboratório. As editoras dividem nome/sobrenome de jeitos diferentes (a ACS
 * manda family "Barbosa Moura"), então para quem é do LaFiM vale o nome
 * cadastrado no painel, que dá sempre a mesma grafia.
 */
export function formatAuthors(list: CrossrefAuthor[], members: Map<string, string> = new Map()): string {
  return list
    .map((a) => members.get(nameKey(`${a.given ?? ""} ${a.family ?? ""}`)) ?? formatAuthor(a))
    .filter(Boolean)
    .join(" ; ");
}

// ── Front matter ─────────────────────────────────────────────────────────────

// Precisa de aspas quando o YAML leria outra coisa: ": " ou " #" no meio,
// indicador no início, espaço nas pontas, ou cara de número/booleano/null.
function needsQuotes(s: string): boolean {
  return (
    s === "" ||
    /: | #|^[\s\-?:,\[\]{}#&*!|>'"%@`]|\s$/.test(s) ||
    /^(true|false|yes|no|on|off|null|~|[-+]?(\d[\d_]*)?\.?\d+([eE][-+]?\d+)?)$/i.test(s)
  );
}

/**
 * Front matter no estilo das entradas do Decap: valor sem aspas sempre que
 * possível e aspas duplas só quando necessárias (ex.: títulos com ": ").
 * JSON.stringify gera uma string entre aspas duplas que também é YAML válido.
 */
export function toFrontmatter(data: Record<string, string | number | boolean | null>): string {
  const lines = Object.entries(data).map(([k, v]) => {
    if (typeof v !== "string") return `${k}: ${v}`;
    return `${k}: ${needsQuotes(v) ? JSON.stringify(v) : v}`;
  });
  return `---\n${lines.join("\n")}\n---\n`;
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
};

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
      issued?: { "date-parts"?: number[][] };
    };
    return {
      title: m.title?.[0] ? cleanTitle(m.title[0]) : null,
      authors: m.author ?? [],
      journal: m["container-title"]?.[0] ? cleanTitle(m["container-title"][0]) : null,
      year: m.issued?.["date-parts"]?.[0]?.[0] ?? null,
    };
  } catch {
    return null;
  }
}
