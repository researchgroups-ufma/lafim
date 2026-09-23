/**
 * PageHeader — Cabeçalho padronizado para todas as páginas internas
 *
 * Formato de "folha de rosto" de artigo científico, sobre o mesmo fundo
 * creme do corpo: faixa com o nome do laboratório, título grande à esquerda
 * com o texto de abertura à direita, alinhados pela base, e um traço de
 * difratograma de raios X fechando o bloco. Atrás, à direita, a foto da
 * célula de bigorna de diamante em negativo, esmaecida (ver globals.css).
 *
 * Uso:
 *   <PageHeader title="Membros" />
 *   <PageHeader title="Linhas de Pesquisa" lead={dict.research.intro} />
 *
 * Props:
 *   title — título da página (obrigatório)
 *   lead  — texto de abertura (opcional)
 *
 * Sem data-dark-bg: o cabeçalho é claro, então o SideNav e o botão do
 * MobileNav ficam na cor escura padrão. Ver SideNav.tsx e MobileNav.tsx.
 */

import { TextEffect } from "@/components/motion-primitives/text-effect";
import PageHeaderMeta from "@/components/ui/PageHeaderMeta";
import Diffractogram from "@/components/ui/Diffractogram";

type PageHeaderProps = {
  title: string;
  lead?: string;
};

export default function PageHeader({ title, lead }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="container-site page-header-container">
        {/* Foto de fundo — puramente decorativa */}
        <div className="page-header-figure" aria-hidden="true" />

        <PageHeaderMeta />

        <div className="page-header-body">
          <h1 className="page-header-title">
            <TextEffect per="char" preset="fade">
              {title}
            </TextEffect>
          </h1>

          {lead && <p className="page-header-lead">{lead}</p>}
        </div>

        <Diffractogram />
      </div>
    </header>
  );
}
