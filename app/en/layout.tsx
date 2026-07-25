/**
 * layout.tsx — Root layout da árvore EN do site LaFiM
 *
 * Root layout do App Router para o segmento /en: define <html lang="en">,
 * o ThemeProvider e os metadados globais, além do chrome das páginas
 * públicas — SideNav/MobileNav e Footer. Espelha app/(pt)/layout.tsx.
 *
 * O dicionário EN já traz traduções reais (plano 009) e a navegação
 * (SideNav/MobileNav/Footer) recebe locale="en" — labels e hrefs
 * localizados para /en/* (plano 011).
 */

import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import ThemeProvider from "@/components/layout/ThemeProvider";
import MobileNav from "@/components/layout/MobileNav";
import SideNav from "@/components/layout/SideNav";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  name: "LaFiM — Laboratório de Física dos Materiais",
  alternateName: "LaFiM",
  url: "https://lafim.pages.dev",
  description:
    "Research in condensed matter physics, nanomaterials and superconductivity at the Federal University of Maranhão.",
  inLanguage: "en",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Universidade Federal do Maranhão",
    alternateName: "UFMA",
    url: "https://www.ufma.br",
  },
  knowsAbout: [
    "Condensed Matter Physics",
    "Nanomaterials",
    "Superconductivity",
    "Raman Spectroscopy",
    "Phase Transitions",
  ],
  sameAs: [],
};

// Metadados globais mínimos para a árvore EN (título/descrição completos em EN
// e hreflang ficam para o plano 013).
export const metadata: Metadata = {
  title: {
    default: `${siteConfig.acronym} — ${siteConfig.university}`, // aba padrão
    template: `%s | ${siteConfig.acronym}`,                       // páginas internas
  },
  description: siteConfig.description,
  metadataBase: new URL('https://lafim.pages.dev'),
  alternates: {
    canonical: '/en',
  },
  openGraph: {
    title: 'LaFiM — Universidade Federal do Maranhão',
    description: 'Pesquisa em física da matéria condensada, nanomateriais e supercondutividade na UFMA.',
    url: '/en', // mesmo alvo do alternates.canonical, resolvido via metadataBase
    siteName: 'LaFiM',
    locale: 'en_US',
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

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* ThemeProvider injeta as CSS variables do config.ts como style inline */}
        <ThemeProvider>
          <script
            type="application/ld+json"
            // JSON.stringify não escapa HTML: um "</script>" nos dados fecharia
            // o bloco e viraria XSS. Escapar "<" como < mantém o JSON válido.
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(schemaOrg).replace(/</g, '\\u003c'),
            }}
          />

          {/* Navegação mobile (navbar + overlay) — visível abaixo de 768px */}
          <MobileNav locale="en" />

          {/* Menu lateral fixo no lado direito — oculto em mobile via .side-nav */}
          <SideNav locale="en" />

          {/* pt-14 compensa a navbar fixa do MobileNav; em desktop (md) não há
              navbar e o Hero volta a ocupar 100svh sem padding no topo.        */}
          <main className="pt-14 md:pt-0">
            {children}
          </main>

          <Footer locale="en" />
        </ThemeProvider>
      </body>
    </html>
  );
}
