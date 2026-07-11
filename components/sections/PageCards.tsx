/**
 * PageCards — Cards de navegação para Membros e Publicações (estilo lafim_2.html)
 *
 * Dois cards lado a lado que direcionam o visitante para as páginas
 * principais do site. Hover (via CSS .hp-card): card sobe, traço superior
 * cresce, ícone preenche e a seta do CTA desliza.
 *
 * Usado em: components/pages/HomePage.tsx (homepage)
 *
 * Props:
 *   locale — idioma para leitura das strings de UI no dicionário
 */

import Link from "next/link";
import { InView } from "@/components/motion-primitives/in-view";
import { getDictionary, type Locale } from "@/lib/i18n";

export default function PageCards({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale).home.cards;

  return (
    <section
      className="section-padding"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="container-site">

        <InView
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0 },
          }}
          viewOptions={{ margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="hp-cards">

            {/* ── Card Membros ───────────────────────────────────────────── */}
            <Link className="hp-card" href="/members">
              <span className="hp-card__ico" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </span>
              <h3>{dict.membersTitle}</h3>
              <p>
                {dict.membersDesc}
              </p>
              <span className="hp-card__cta">{dict.membersCta} <span className="hp-arw">→</span></span>
            </Link>

            {/* ── Card Publicações ───────────────────────────────────────── */}
            <Link className="hp-card" href="/publications">
              <span className="hp-card__ico" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
              </span>
              <h3>{dict.pubTitle}</h3>
              <p>
                {dict.pubDesc}
              </p>
              <span className="hp-card__cta">{dict.pubCta} <span className="hp-arw">→</span></span>
            </Link>

          </div>
        </InView>

      </div>
    </section>
  );
}
