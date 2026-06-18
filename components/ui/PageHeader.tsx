/**
 * PageHeader — Cabeçalho padronizado para todas as páginas internas
 *
 * Exibe fundo elevado, o logo do LaFiM e o título da página.
 * Padrão visual consistente em todo o site.
 *
 * Uso:
 *   <PageHeader title="Membros" />
 *
 * Props:
 *   title   — título da página (obrigatório)
 *   eyebrow — mantido por compatibilidade com chamadas existentes; não é
 *             mais renderizado (o logo substituiu o texto de identificação)
 */

import { TextEffect } from "@/components/motion-primitives/text-effect";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
};

export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="page-header">
      {/* Logo do LaFiM — substitui o antigo texto "sigla · universidade".
          fill preto nativo do SVG sobre o fundo claro do cabeçalho.        */}
      <img
        src="/logo/new_lafim.svg"
        alt="LaFiM — Laboratório de Física dos Materiais"
        style={{ height: "3rem", width: "auto", margin: "0 auto 0.75rem" }}
      />
      <h1 className="section-title">
        <TextEffect per="char" preset="fade">
         {title}
        </TextEffect>
      </h1>
    </div>
  );
}
