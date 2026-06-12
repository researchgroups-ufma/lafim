import { InView } from "@/components/motion-primitives/in-view";

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
 */

type ResearchLine = {
  slug: string;
  title: string;
  summary: string;
};

type ResearchSectionProps = {
  researchLines: ResearchLine[];
};

export default function ResearchSection({ researchLines }: ResearchSectionProps) {
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
            <p className="hp-eyebrow">Pesquisa</p>
            <h2 className="hp-h2">Da estrutura atômica à função do material.</h2>
            <p className="hp-lead">
              O LaFiM estuda a relação entre estrutura, composição e propriedades
              físicas dos materiais, combinando caracterização experimental e
              modelagem teórica. Partimos da escala atômica — onde simetria e
              defeitos governam o sólido — e chegamos às aplicações em energia,
              sensores e dispositivos funcionais.
            </p>
            <p className="hp-body">
              O grupo mantém colaborações nacionais e internacionais, com
              infraestrutura própria de síntese e caracterização, formando
              pesquisadores em iniciação científica, mestrado e doutorado.
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
