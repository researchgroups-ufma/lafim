import Link from "next/link";
import { InView } from "@/components/motion-primitives/in-view";

/**
 * NewsSection — Seção "Notícias" da homepage (estilo lafim_2.html)
 *
 * Estrutura:
 *   - Eyebrow "Notícias" + título
 *   - Lista das 3 notícias mais recentes (.hp-topics), cada uma com data,
 *     título e texto introdutório. Clicar em qualquer item leva à página
 *     de notícias (/news).
 *
 * Dados: recebe as notícias já lidas/ordenadas em page.tsx via getCollection.
 *
 * Props:
 *   news — até 3 notícias mais recentes (slug, título, resumo, data formatada)
 */

type NewsTeaser = {
  slug: string;
  title: string;
  excerpt?: string;
  dateFormatted: string;
};

type NewsSectionProps = {
  news: NewsTeaser[];
};

export default function NewsSection({ news }: NewsSectionProps) {
  // Não renderiza a seção se não houver notícias cadastradas
  if (news.length === 0) return null;

  return (
    <section
      id="news"
      className="section-padding"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="container-site">

        {/* ── Cabeçalho ──────────────────────────────────────────────────── */}
        <InView
          variants={{
            hidden: { opacity: 0, y: 26 },
            visible: { opacity: 1, y: 0 },
          }}
          viewOptions={{ margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <p className="hp-eyebrow">Notícias</p>
            <h2 className="hp-h2">Acompanhe as novidades do laboratório.</h2>
          </div>
        </InView>

        {/* ── Lista das 3 mais recentes ────────────────────────────────────
            Reusa o estilo de lista numerada (.hp-topics); a data ocupa o
            slot do número. Cada item é um link para a página de notícias. */}
        <div className="hp-topics">
          {news.map((item, index) => (
            <InView
              key={item.slug}
              variants={{
                hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
              }}
              viewOptions={{ margin: "0px 0px -60px 0px" }}
              transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
            >
              <Link className="hp-topic" href="/news">
                <span className="hp-tnum">{item.dateFormatted}</span>
                <div>
                  <h3>{item.title}</h3>
                  {item.excerpt && <p>{item.excerpt}</p>}
                </div>
              </Link>
            </InView>
          ))}
        </div>

        {/* ── CTA — todas as notícias ──────────────────────────────────────── */}
        <div style={{ marginTop: "32px" }}>
          <Link className="hp-btn hp-btn--ghost" href="/news">
            Ver todas as notícias →
          </Link>
        </div>

      </div>
    </section>
  );
}
