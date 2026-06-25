/**
 * layout.tsx — Layout das páginas públicas do site LaFiM
 *
 * Neste branch (lafim-design) o Header horizontal foi substituído
 * pelo SideNav — menu lateral fixo no lado direito da tela,
 * inspirado no layout do Unearthly Materials.
 *
 * O Footer permanece no rodapé de todas as páginas.
 */

import type { Metadata } from "next";
import MobileNav from "@/components/layout/MobileNav";
import SideNav from "@/components/layout/SideNav";
import Footer from "@/components/layout/Footer";

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  name: "LaFiM — Laboratório de Física dos Materiais",
  alternateName: "LaFiM",
  url: "https://lafim.pages.dev",
  description:
    "Pesquisa em física da matéria condensada, nanomateriais e supercondutividade na Universidade Federal do Maranhão.",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Universidade Federal do Maranhão",
    alternateName: "UFMA",
    url: "https://www.ufma.br",
  },
  knowsAbout: [
    "Física da Matéria Condensada",
    "Nanomateriais",
    "Supercondutividade",
    "Espectroscopia Raman",
    "Transições de Fase",
  ],
  sameAs: [],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://lafim.pages.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LaFiM — Universidade Federal do Maranhão',
    description: 'Pesquisa em física da matéria condensada, nanomateriais e supercondutividade na UFMA.',
    url: 'https://lafim.pages.dev',
    siteName: 'LaFiM',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/hero-poster.jpg',
        width: 1200,
        height: 630,
        alt: 'LaFiM — Laboratório de Física dos Materiais',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LaFiM — Universidade Federal do Maranhão',
    description: 'Pesquisa em física da matéria condensada, nanomateriais e supercondutividade na UFMA.',
    images: ['/images/hero-poster.jpg'],
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />

      {/* Navegação mobile (navbar + overlay) — visível abaixo de 768px */}
      <MobileNav />

      {/* Menu lateral fixo no lado direito — oculto em mobile via .side-nav */}
      <SideNav />

      {/* pt-14 compensa a navbar fixa do MobileNav; em desktop (md) não há
          navbar e o Hero volta a ocupar 100svh sem padding no topo.        */}
      <main className="pt-14 md:pt-0">
        {children}
      </main>

      <Footer />
    </>
  );
}
