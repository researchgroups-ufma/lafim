/**
 * RecentPublicationsSection — Seção "Publicações recentes" da homepage
 *
 * Mostra as 3 publicações mais recentes: a primeira em um card de destaque,
 * com a lista completa de autores (como na página de Publicações), e as
 * outras duas compactas ao lado, com "Sobrenome et al.".
 *
 * Como a lista vem de content/publications, onde o sync semanal do ORCID
 * grava, a seção se atualiza sozinha a cada build. Cada item leva ao DOI.
 *
 * Dados: recebe as publicações já ordenadas por data em HomePage.tsx.
 *
 * Props:
 *   publications — até 3 publicações, a mais recente primeiro
 *   locale       — idioma para leitura das strings de UI no dicionário
 */

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { InView } from "@/components/motion-primitives/in-view";
import { getDictionary, localizeHref, type Locale } from "@/lib/i18n";
import styles from "./RecentPublicationsSection.module.css";

export type RecentPublication = {
  slug: string;
  title: string;
  authors: string;
  year: number;
  journal?: string;
  doi?: string;
};

/** "VIEGAS, Z.S. ; DE MENEZES, A.S. ; ..." → "Viegas et al."; com até dois autores, os dois. */
function shortAuthors(authors: string, locale: Locale): string {
  const names = authors
    .split(";")
    .map((a) => a.split(",")[0].trim())
    .filter(Boolean)
    .map((s) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, c) => sep + c.toUpperCase()));
  if (names.length > 2) return `${names[0]} et al.`;
  return names.join(locale === "pt" ? " e " : " and ");
}

/**
 * Subscrito nos índices de fórmulas químicas: "Ce2(MoO4)3" → Ce₂(MoO₄)₃.
 * Só pega dígitos colados a letra ou ")" — "15 K" e "G‑250" ficam intactos.
 */
function formula(title: string): ReactNode {
  return title
    .split(/(?<=[A-Za-z)])(\d+)/)
    .map((part, i) => (i % 2 === 1 ? <sub key={i}>{part}</sub> : <Fragment key={i}>{part}</Fragment>));
}

/** Abre o DOI em nova aba; sem DOI, o item vira um bloco sem link. */
function PubLink({ pub, className, children }: { pub: RecentPublication; className: string; children: ReactNode }) {
  if (!pub.doi) return <div className={className}>{children}</div>;
  return (
    <a className={className} href={pub.doi} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function RecentPublicationsSection({
  publications,
  locale,
}: {
  publications: RecentPublication[];
  locale: Locale;
}) {
  // Não renderiza a seção se não houver publicações cadastradas
  if (publications.length === 0) return null;

  const dict = getDictionary(locale).home.publications;
  const [first, ...rest] = publications;

  return (
    <section
      id="recent-publications"
      className="section-padding"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="container-site">

        {/* ── Cabeçalho ──────────────────────────────────────────────────── */}
        <InView once variants={reveal} viewOptions={{ margin: "0px 0px -60px 0px" }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <div>
            <p className="hp-eyebrow">{dict.eyebrow}</p>
            <h2 className="hp-h2">{dict.heading}</h2>
          </div>
        </InView>

        <div className={styles.grid}>

          {/* ── Destaque — a mais recente ──────────────────────────────────── */}
          <InView once variants={reveal} viewOptions={{ margin: "0px 0px -60px 0px" }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <PubLink pub={first} className={styles.feature}>
              <span className={styles.label}>{dict.latest} · {first.year}</span>
              <h3 className={styles.featureTitle}>{formula(first.title)}</h3>
              <p className={styles.featureAuthors}>{first.authors}</p>
              <p className={styles.featureJournal}><em>{first.journal}</em></p>
              {first.doi && <span className={styles.cta}>{dict.readArticle} <span className={styles.arw}>↗</span></span>}
            </PubLink>
          </InView>

          {/* ── As outras duas, compactas ──────────────────────────────────── */}
          <div className={styles.side}>
            {rest.map((pub, i) => (
              <InView key={pub.slug} once variants={reveal} viewOptions={{ margin: "0px 0px -60px 0px" }} transition={{ duration: 0.45, ease: "easeOut", delay: (i + 1) * 0.12 }}>
                <PubLink pub={pub} className={styles.sideItem}>
                  <span className={styles.label}>{pub.journal} · {pub.year}</span>
                  <h3 className={styles.sideTitle}>{formula(pub.title)}</h3>
                  <p className={styles.meta}>{shortAuthors(pub.authors, locale)}</p>
                </PubLink>
              </InView>
            ))}
          </div>

        </div>

        {/* ── CTA — todas as publicações ───────────────────────────────────── */}
        <div style={{ marginTop: "32px" }}>
          <Link className="hp-btn hp-btn--ghost" href={localizeHref("/publications", locale)}>
            {dict.ctaAll}
          </Link>
        </div>

      </div>
    </section>
  );
}
