import Image from "next/image";
import { InView } from "@/components/motion-primitives/in-view";
import MemberLinks from "@/components/ui/MemberLinks";

/**
 * CoordinatorSection — Seção "Sobre o Coordenador" da homepage (estilo lafim_2.html)
 *
 * Estrutura:
 *   - Eyebrow "Sobre o Coordenador"
 *   - Grid: texto à esquerda (nome, papel, bio, links) e foto 4:5 à direita
 *
 * Os dados vêm do membro com role "Coordenador" em content/members/
 *
 * Props:
 *   name     — nome completo do coordenador
 *   bio      — biografia/texto descritivo (parágrafos separados por \n\n)
 *   photo    — caminho da foto (opcional)
 *   email    — e-mail institucional (opcional)
 *   linkedin — URL do LinkedIn (opcional)
 *   lattes   — URL do Lattes (opcional)
 *   orcid    — URL do ORCID (opcional)
 *   scholar  — URL do Google Scholar (opcional)
 *   arxiv    — URL do arXiv (opcional)
 */

type CoordinatorSectionProps = {
  name: string;
  bio?: string;
  photo?: string;
  email?: string;
  linkedin?: string;
  lattes?: string;
  orcid?: string;
  scholar?: string;
  arxiv?: string;
};

export default function CoordinatorSection({
  name, bio, photo, email, linkedin, lattes, orcid, scholar, arxiv,
}: CoordinatorSectionProps) {
  const paragraphs = bio ? bio.split("\n\n") : [];

  return (
    <section
      id="coordinator"
      className="section-padding"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <div className="container-site">

        <p className="hp-eyebrow">Sobre o Coordenador</p>

        <InView
          variants={{
            hidden: { opacity: 0, y: 32 },
            visible: { opacity: 1, y: 0 },
          }}
          viewOptions={{ margin: "0px 0px -80px 0px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="hp-coord__grid">

            {/* ── Texto ──────────────────────────────────────────────────── */}
            <div className="hp-coord__text">
              <h2 className="hp-coord__name">{name}</h2>
              <p className="hp-coord__role">Coordenador do LaFiM · Departamento de Física</p>

              {/* Bio — último parágrafo em tom secundário (.hp-sec) */}
              {paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={index === paragraphs.length - 1 && paragraphs.length > 1 ? "hp-sec" : undefined}
                >
                  {paragraph}
                </p>
              ))}

              {/* Links acadêmicos — ícones SVG */}
              <MemberLinks
                className="hp-coord__links"
                email={email}
                linkedin={linkedin}
                lattes={lattes}
                orcid={orcid}
                scholar={scholar}
                arxiv={arxiv}
              />
            </div>

            {/* ── Foto ───────────────────────────────────────────────────── */}
            <div className="hp-coord__photo">
              {photo ? (
                <Image src={photo} alt={`Foto de ${name}`} fill sizes="(max-width: 860px) 380px, 40vw" style={{ objectFit: "cover" }} />
              ) : (
                <span className="hp-ph">Foto do<br />coordenador<br />4 : 5</span>
              )}
            </div>

          </div>
        </InView>

      </div>
    </section>
  );
}
