import { InView } from "@/components/motion-primitives/in-view";
import { getDictionary, type Locale } from "@/lib/i18n";

/**
 * ResearchSection — Seção de Pesquisa da homepage (estilo lafim_2.html)
 *
 * Estrutura:
 *   - Eyebrow "Pesquisa" + título + textos introdutórios
 *   - Lista numerada de linhas de pesquisa (.hp-topics) com hover de indentação
 *
 * Dados: recebe as linhas de pesquisa como prop (lidas em page.tsx via getCollection)
 *
 * Props:
 *   researchLines — array de linhas de pesquisa do laboratório
 *   locale        — idioma para leitura das strings de UI no dicionário
 */

type ResearchLine = {
  slug: string;
  title: string;
  summary: string;
};

type ResearchSectionProps = {
  researchLines: ResearchLine[];
  locale: Locale;
};

export default function ResearchSection({ researchLines, locale }: ResearchSectionProps) {
  const dict = getDictionary(locale).home.research;

  return (
    <section
      id="research"
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
            <p className="hp-eyebrow">{dict.eyebrow}</p>
            <h2 className="hp-h2">{dict.heading}</h2>
            <p className="hp-lead">
              {dict.lead}
            </p>
            <p className="hp-body">
              {dict.body}
            </p>
          </div>
        </InView>

        {/* ── Linhas de pesquisa — lista numerada ──────────────────────────
            Exibe os itens cadastrados no CMS no estilo de tópicos do lafim_2 */}
        {researchLines.length > 0 && (
          <div className="hp-topics">
            {researchLines.map((line, index) => (
              <InView
                key={line.slug}
                variants={{
                  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
                  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                }}
                viewOptions={{ margin: "0px 0px -60px 0px" }}
                transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
              >
                <div className="hp-topic">
                  <span className="hp-tnum">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{line.title}</h3>
                    <p>{line.summary}</p>
                  </div>
                </div>
              </InView>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
