/**
 * fonts.ts — Fonte Inter auto-hospedada via next/font
 *
 * Substitui o @import do Google Fonts que ficava no globals.css: aquele
 * caminho encadeava HTML → CSS → CSS do Google → .woff2 e bloqueava a
 * renderização (~0,9 s no celular, medido no Lighthouse em 2026-10-09).
 * Com next/font, o .woff2 é baixado no build, servido pelo próprio site e
 * pré-carregado no <head>.
 *
 * Expõe a família na CSS variable --font-inter, aplicada no <html> de cada
 * root layout e consumida por --font-display/--font-body (globals.css e
 * lib/config.ts).
 */

import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});
