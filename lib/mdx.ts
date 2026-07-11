/**
 * mdx.ts — Leitura e parse dos arquivos Markdown do conteúdo
 *
 * IMPORTANTE: usa `fs` — só pode ser importado em Server Components.
 * Nunca importe em arquivos com "use client".
 *
 * Funções:
 *   getCollection(folder, locale) — lê content/<folder>/pt/*.md (canônico) e,
 *     se locale === "en", faz merge com content/<folder>/en/*.md por nome de
 *     arquivo (campo a campo: base PT sobrescrita pelos campos presentes no
 *     item EN). Item sem arquivo EN correspondente aparece 100% em PT — é o
 *     fallback de tradução ausente.
 *   getSingleFile(filePath) — lê um único arquivo .md
 *   formatDate(date, locale) — converte data do CMS para string legível (pt-BR/en-US)
 */

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Locale } from "@/lib/i18n";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ContentItem = {
  slug: string;
  [key: string]: unknown;
};

export async function getCollection(folder: string, locale: Locale = "pt"): Promise<ContentItem[]> {
  const readDir = (sub: string) => {
    const dir = path.join(CONTENT_DIR, folder, sub);
    const map = new Map<string, ContentItem>();
    if (!fs.existsSync(dir)) return map;

    for (const filename of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data, content } = matter(raw);
      // body = corpo markdown do arquivo (campo "Descrição completa" no CMS).
      // Espelha getSingleFile; a homepage usa só `summary`, a página de
      // pesquisa usa `body` para exibir a descrição completa.
      map.set(filename, { slug: filename.replace(/\.md$/, ""), body: content, ...data });
    }
    return map;
  };

  const pt = readDir("pt");
  if (locale === "pt") return [...pt.values()];

  // EN: merge campo a campo sobre a base PT — item sem arquivo EN fica 100% em PT.
  const en = readDir("en");
  const merged = new Map(pt);
  for (const [filename, enItem] of en) {
    const base = pt.get(filename) ?? {};
    merged.set(filename, { ...base, ...enItem });
  }
  return [...merged.values()];
}

export async function getSingleFile(filePath: string): Promise<ContentItem> {
  const fullPath = path.join(CONTENT_DIR, filePath);
  if (!fs.existsSync(fullPath)) return { slug: filePath };

  const raw = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(raw);
  return { slug: filePath, body: content, ...data };
}

export function formatDate(date: string | Date | undefined, locale: Locale = "pt"): string {
  if (!date) return "";
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (isNaN(parsed.getTime())) return String(date);
  const tag = locale === "en" ? "en-US" : "pt-BR";
  return parsed.toLocaleDateString(tag, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
