/**
 * page.tsx — Homepage do site LaFiM (branch lafim-design)
 *
 * Server Component — lê os dados do servidor e passa como props
 * para os componentes de cada seção.
 *
 * Seções:
 *   1. Hero         — fullscreen com carrossel de imagens e logo SVG
 *   2. Pesquisa     — linhas de pesquisa + destaques (se houver)
 *   3. Page Cards   — atalhos para Membros e Publicações
 *   4. Coordenador  — bio e foto do coordenador do laboratório
 */

import Hero from "@/components/layout/Hero";
import ResearchSection from "@/components/sections/ResearchSection";
import HighlightsSection from "@/components/sections/HighlightsSection";
import PageCards from "@/components/sections/PageCards";
import CoordinatorSection from "@/components/sections/CoordinatorSection";
import { getSingleFile, getCollection } from "@/lib/mdx";

export default async function HomePage() {

  // ── Dados do Hero ─────────────────────────────────────────────────────────
  const about = await getSingleFile("about/index.md");

  const heroImages: string[] = Array.isArray(about.hero_images)
    ? (about.hero_images as string[])
    : about.hero_images
    ? [about.hero_images as string]
    : ["/uploads/hero1.webp"];

  // ── Linhas de pesquisa ────────────────────────────────────────────────────
  const allResearch = await getCollection("research");
  const researchLines = allResearch.filter((r) => r.slug !== "placeholder") as {
    slug: string;
    title: string;
    summary: string;
  }[];

  // ── Destaques — ordenados pelo campo order ─────────────────────────────────
  const allHighlights = await getCollection("highlights");
  const highlights = allHighlights
    .filter((h) => h.slug !== "placeholder")
    .sort((a, b) => ((a.order as number) || 0) - ((b.order as number) || 0)) as {
      slug: string;
      title: string;
      description: string;
      image?: string;
      image_caption?: string;
      image_position?: "left" | "right";
      order?: number;
    }[];

  // ── Coordenador ────────────────────────────────────────────────────────────
  const allMembers = await getCollection("members");
  const coordinator = allMembers.find((m) => m.role === "Coordenador");

  return (
    <div>

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <Hero
        images={heroImages}
        subtitle={about.subtitle as string}
      />

      {/* ── 2. Pesquisa ────────────────────────────────────────────────────── */}
      <ResearchSection researchLines={researchLines} />

      {/* ── 3. Destaques — só aparece se houver itens cadastrados ──────────── */}
      <HighlightsSection highlights={highlights} />

      {/* ── 4. Cards de navegação ──────────────────────────────────────────── */}
      <PageCards />

      {/* ── 5. Sobre o Coordenador ─────────────────────────────────────────── */}
      {coordinator && (
        <CoordinatorSection
          name={coordinator.title as string}
          bio={coordinator.bio as string}
          photo={coordinator.photo as string | undefined}
          email={coordinator.email as string | undefined}
          linkedin={coordinator.linkedin as string | undefined}
          lattes={coordinator.lattes as string | undefined}
          orcid={coordinator.orcid as string | undefined}
          scholar={coordinator.scholar as string | undefined}
          arxiv={coordinator.arxiv as string | undefined}
        />
      )}

    </div>
  );
}
