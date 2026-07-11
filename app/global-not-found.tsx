/**
 * global-not-found — Página 404 do site inteiro (bilíngue)
 *
 * Com múltiplos root layouts (app/(pt)/ e app/en/, sem app/layout.tsx),
 * o 404 global precisa do `global-not-found` experimental, que renderiza
 * o documento completo (html/body) por conta própria — sem o chrome das
 * árvores. Em `output: "export"` vira o único `out/404.html`, servido
 * para qualquer URL inexistente (PT ou EN), por isso o texto é bilíngue.
 */

import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Página não encontrada | LaFiM",
};

export default function GlobalNotFound() {
  return (
    <html lang="pt-BR">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            maxWidth: "40rem",
            margin: "0 auto",
            padding: "6rem 1.5rem",
            gap: "1rem",
          }}
        >
          <p style={{ fontSize: "3rem", fontWeight: 600, lineHeight: 1 }}>404</p>

          <div>
            <p style={{ fontSize: "1.05rem", color: "var(--color-text-muted)" }}>
              Página não encontrada. O endereço pode ter mudado ou nunca existiu.
            </p>
            <Link href="/" style={{ textDecoration: "underline" }}>
              ← Voltar ao início
            </Link>
          </div>

          <div lang="en" style={{ marginTop: "1.5rem" }}>
            <p style={{ fontSize: "1.05rem", color: "var(--color-text-muted)" }}>
              Page not found. The address may have changed or never existed.
            </p>
            <Link href="/en" style={{ textDecoration: "underline" }}>
              ← Back to the English homepage
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
