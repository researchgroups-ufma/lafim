/**
 * PageHeader — Cabeçalho padronizado para todas as páginas internas
 *
 * Faixa escura sobre foto, alinhada à esquerda: logo, título, régua e texto
 * de abertura. Rima com o Hero da homepage, que também é escuro e alinhado
 * à esquerda.
 *
 * Uso:
 *   <PageHeader title="Membros" />
 *   <PageHeader title="Linhas de Pesquisa" lead={dict.research.intro} />
 *
 * Props:
 *   title — título da página (obrigatório)
 *   lead  — texto de abertura (opcional)
 *
 * O lead é renderizado DUAS vezes e o CSS escolhe qual aparece: dentro do
 * cabeçalho em telas ≥768px, e no topo do corpo abaixo disso. No mobile ele
 * quebra em 6 linhas em vez de 3, o que fazia a altura do cabeçalho variar
 * até 136px entre as páginas; tirá-lo dali deixa todas com o mesmo conteúdo.
 * Só um dos dois está visível por vez, então leitores de tela leem uma vez.
 *
 * ATENÇÃO: o atributo data-dark-bg é o que faz o SideNav pintar os links de
 * branco enquanto o cabeçalho cruza o centro da viewport. Removê-lo deixa o
 * menu charcoal sobre o fundo escuro — ilegível. Ver SideNav.tsx.
 */

import { TextEffect } from "@/components/motion-primitives/text-effect";

type PageHeaderProps = {
  title: string;
  lead?: string;
};

export default function PageHeader({ title, lead }: PageHeaderProps) {
  return (
    <>
    <header className="page-header" data-dark-bg>
      {/* Foto de fundo e gradientes de legibilidade — puramente decorativos */}
      <div className="page-header-bg" />
      <div className="page-header-scrim" />

      <div className="page-header-inner">
        <div className="container-site">
          {/* O logo é pintado por máscara CSS: o SVG não declara fill e
              renderiza preto, invisível sobre a faixa escura.              */}
          <div
            className="page-header-logo"
            role="img"
            aria-label="LaFiM — Laboratório de Física dos Materiais"
          />

          <h1 className="page-header-title">
            <TextEffect per="char" preset="fade">
              {title}
            </TextEffect>
          </h1>

          <div className="page-header-rule" />

          {lead && <p className="page-header-lead">{lead}</p>}
        </div>
      </div>
    </header>

    {/* Mesmo lead, no topo do corpo — só visível abaixo de 768px */}
    {lead && (
      <div className="page-lead-body">
        <div className="container-site">
          <p>{lead}</p>
        </div>
      </div>
    )}
    </>
  );
}
