/**
 * mdx.ts — Leitura e parse dos arquivos Markdown do conteúdo
 *
 * IMPORTANTE: usa `fs` — só pode ser importado em Server Components.
 * Nunca importe em arquivos com "use client".
 *
 * Funções:
 *   getCollection(folder)   — lê todos os .md de content/<folder>/
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

export async function getCollection(folder: string): Promise<ContentItem[]> {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
    const { data, content } = matter(raw);
    // body = corpo markdown do arquivo (campo "Descrição completa" no CMS).
    // Espelha getSingleFile; a homepage usa só `summary`, a página de
    // pesquisa usa `body` para exibir a descrição completa.
    return { slug: filename.replace(/\.md$/, ""), body: content, ...data };
  });
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
