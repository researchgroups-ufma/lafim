/**
 * InfrastructurePage.tsx — Conteúdo da página Infraestrutura, parametrizado por locale
 *
 * Rota: /research/infrastructure
 *
 * Server Component — lê o texto introdutório de content/equipment/index.md
 * e os equipamentos de content/equipment/ via getCollection().
 * Exibe grid de cards com modal de detalhes ao clicar (EquipmentCard).
 *
 * Fase 4: os cards receberão Morphing Dialog do Motion Primitives.
 */

import { getCollection, getSingleFile } from "@/lib/mdx";
import PageHeader from "@/components/ui/PageHeader";
import EquipmentCard from "@/components/ui/EquipmentCard";
import { siteConfig } from "@/lib/config";
import { getDictionary, type Locale } from "@/lib/i18n";

export default async function InfrastructurePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  // Texto introdutório e lista de equipamentos — leituras independentes, em paralelo
  // equipment/index.md (texto introdutório) fica fora do i18n do Decap — se o
  // EN não tiver intro (não traduzido, ou sem index.en.md), cai no PT.
  const equipmentIndexFile = locale === "en" ? "equipment/index.en.md" : "equipment/index.md";
  const [pageInfoRead, allEquipment] = await Promise.all([
    getSingleFile(equipmentIndexFile),
    getCollection("equipment", locale),
  ]);
  const pageInfo =
    locale === "en" && !pageInfoRead.intro
      ? await getSingleFile("equipment/index.md")
      : pageInfoRead;

  const equipment = allEquipment.filter(
    (e) => e.slug !== "placeholder" && e.slug !== "index"
  );

  return (
    <div>
      <PageHeader
        title={dict.infrastructure.title}
        eyebrow={`${siteConfig.acronym} · ${siteConfig.university}`}
      />

      <main>
        <div className="container-site">
          <section style={{ padding: "4rem 0" }}>

            {/* Texto introdutório — editável pelo CMS em content/equipment/index.md */}
            {(pageInfo.intro as string | undefined) && (
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  color: "var(--color-text-muted)",
                  fontWeight: 300,
                  maxWidth: "720px",
                  marginBottom: "3rem",
                }}
              >
                {pageInfo.intro as string}
              </p>
            )}

            {/* Grid de equipamentos */}
            {equipment.length === 0 ? (
              <p style={{ color: "var(--color-text-subtle)" }}>
                {dict.infrastructure.empty}
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {equipment.map((item) => (
                  <EquipmentCard
                    key={item.slug}
                    title={item.title as string}
                    summary={item.summary as string}
                    description={item.description as string | undefined}
                    photo={item.photo as string | undefined}
                    manufacturer={item.manufacturer as string | undefined}
                    model={item.model as string | undefined}
                  />
                ))}
              </div>
            )}

          </section>
        </div>
      </main>
    </div>
  );
}
