/**
 * Footer — Rodapé institucional do site
 *
 * Exibe três blocos de informação:
 *   1. Identidade — sigla, nome completo, departamento e universidade
 *   2. Links      — navegação secundária lida de footerLinks em lib/config.ts
 *   3. Copyright  — ano atual gerado dinamicamente + localização do grupo
 *
 * Dados lidos de lib/config.ts:
 *   - siteConfig.acronym    — sigla do grupo (ex: "LaFiM")
 *   - siteConfig.name       — nome completo do laboratório
 *   - siteConfig.department — departamento de vínculo
 *   - siteConfig.university — universidade
 *   - siteConfig.location   — cidade e estado
 *   - footerLinks           — links exibidos na navegação do rodapé
 *
 * Para alterar qualquer dado exibido aqui:
 *   Edite apenas lib/config.ts — não mexa neste arquivo.
 *
 * Usado em: app/(site)/layout.tsx (layout das páginas públicas)
 */

import Link from "next/link";
import { siteConfig, footerLinks } from "@/lib/config";

export default function Footer() {
  // Ano atual gerado em tempo de build — atualiza automaticamente a cada deploy
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)", /* linha sutil de separação */
        backgroundColor: "var(--color-bg)",
        marginTop: "4rem", /* espaço entre o último conteúdo e o rodapé */
      }}
    >
      <div
        className="container-site"
        style={{
          paddingTop: "1.44rem",
          paddingBottom: "1.44rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.96rem", /* espaço entre os três blocos internos */
        }}
      >

        {/* ── Bloco 1: Identidade ───────────────────────────────────────────
            Logo do LaFiM e vínculo institucional                           */}
        <div>
          {/* Logo do LaFiM — substitui o texto "sigla / nome do laboratório".
              fill preto nativo do SVG; mesmo padrão do cabeçalho.            */}
          <img
            src="/logo/new_lafim.svg"
            alt="LaFiM — Laboratório de Física dos Materiais"
            style={{ height: "2.5rem", width: "auto", marginBottom: "0.5rem" }}
          />
          <p
            style={{
              color: "var(--color-text-subtle)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            {siteConfig.department} · {siteConfig.university}
          </p>
        </div>

        {/* ── Bloco 2: Links de navegação ───────────────────────────────────
            Gerados a partir de footerLinks em lib/config.ts               */}
        <nav aria-label="Links do rodapé">
          <ul style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", listStyle: "none" }}>
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                    transition: "color 0.15s ease",
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Bloco 3: Copyright ────────────────────────────────────────────
            Ano calculado automaticamente — não precisa atualizar manualmente */}
        <p style={{ color: "var(--color-text-subtle)", fontSize: "0.8rem" }}>
          © {currentYear} {siteConfig.name} · {siteConfig.location}
        </p>

      </div>
    </footer>
  );
}
