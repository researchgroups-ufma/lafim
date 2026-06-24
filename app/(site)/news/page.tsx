/**
 * page.tsx — Página Notícias
 *
 * Server Component — lê todas as notícias de content/news/ via getCollection(),
 * ordena por data (mais recente primeiro) e prepara os dados serializáveis
 * para o NewsList (client component), que cuida de filtro, paginação e
 * expansão do texto integral na própria página.
 *
 * ATENÇÃO: campos de data sempre via formatDate() — nunca renderizar diretamente.
 * year/month são calculados aqui para o filtro do client (evita problemas de fuso).
 */

import { getCollection, formatDate } from "@/lib/mdx";
import PageHeader from "@/components/ui/PageHeader";
import NewsList from "@/components/ui/NewsList";

export const metadata = { title: "Notícias" };

export default async function NewsPage() {
  const allNews = await getCollection("news");

  // Remove placeholder, ordena por data e serializa para o client component
  const news = allNews
    .filter((n) => n.slug !== "placeholder")
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date as string).getTime() : 0;
      const dateB = b.date ? new Date(b.date as string).getTime() : 0;
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    })
    .map((n) => {
      const parsed = n.date ? new Date(n.date as string) : null;
      const valid = parsed && !isNaN(parsed.getTime());
      const cover = n.cover_image as string | undefined;
      const gallery = Array.isArray(n.gallery) ? (n.gallery as string[]) : [];
      // Carrossel: capa primeiro, depois a galeria — sem duplicar a capa
      const images = [...new Set([cover, ...gallery].filter(Boolean))] as string[];
      return {
        slug: n.slug,
        title: n.title as string,
        dateFormatted: formatDate(n.date as string),
        year: valid ? parsed!.getUTCFullYear() : 0,
        month: valid ? parsed!.getUTCMonth() + 1 : 0,
        category: n.category as string | undefined,
        excerpt: n.excerpt as string | undefined,
        cover_image: cover,
        images,
        body: n.body as string | undefined,
      };
    });

  return (
    <div>
      <PageHeader title="Notícias" />

      <main>
        <div className="container-site">
          <section style={{ padding: "4rem 0" }}>
            {news.length === 0 ? (
              <p style={{ color: "var(--color-text-subtle)" }}>
                Nenhuma notícia cadastrada ainda.
              </p>
            ) : (
              <NewsList news={news} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
