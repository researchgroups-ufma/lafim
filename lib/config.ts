/**
 * config.ts — Fonte de verdade do site LaFiM
 *
 * Para adaptar o template a outro grupo, edite apenas este arquivo.
 * Todos os componentes leem os dados daqui.
 */

// ─── Identidade do grupo ──────────────────────────────────────────────────────

export const siteConfig = {
  name: "Laboratório de Física dos Materiais",
  acronym: "LaFiM",
  university: "Universidade Federal do Maranhão",
  department: "Departamento de Física — CCET",
  email: "lafim@ufma.br",
  location: "São Luís, Maranhão, Brasil",
  url: "https://lafim-ufma.pages.dev",
  description: "Pesquisa em física da matéria condensada, nanomateriais e supercondutividade na UFMA.",
};

// ─── Navegação ────────────────────────────────────────────────────────────────

// `key` referencia getDictionary(locale).nav[key] (labels traduzidos por
// SideNav/MobileNav). `label` é mantido só para o Header.tsx legado (não usado
// no site atual, mas ainda compilado pelo TypeScript).
export const navLinks = [
  { key: "home",         href: "/",        label: "Início" },
  { key: "research",     href: "/research", label: "Pesquisa" },
  { key: "members",      href: "/members", label: "Membros" },
  { key: "publications", href: "/publications", label: "Publicações" },
  { key: "news",         href: "/news",    label: "Notícias" },
  { key: "about",        href: "/about",   label: "Sobre" },
  { key: "contact",      href: "/contact", label: "Contato" },
] as const;

export const footerLinks = [
  { key: "research",     href: "/research" },
  { key: "members",      href: "/members" },
  { key: "publications", href: "/publications" },
  { key: "contact",      href: "/contact" },
] as const;

// ─── Design tokens ────────────────────────────────────────────────────────────
// Espelha as CSS variables de app/globals.css
// Alterar aqui NÃO altera o CSS — os dois precisam estar sincronizados

export const designTokens = {
  colors: {
    bg:           "#f7f4ed",
    bgElevated:   "#fcfbf8",
    bgSubtle:     "#eceae4",
    primary:      "#1c1c1c",
    primaryHover: "#000000",
    primaryMuted: "rgba(28,28,28,0.4)",
    text:         "#1c1c1c",
    textMuted:    "#5f5f5d",
    textSubtle:   "rgba(28,28,28,0.4)",
    border:       "#eceae4",
    borderStrong: "#e0ddd3",
  },
  fonts: {
    display: "'Camera Plain Variable', 'Inter', ui-sans-serif, system-ui, sans-serif",
    body:    "'Camera Plain Variable', 'Inter', ui-sans-serif, system-ui, sans-serif",
  },
};
