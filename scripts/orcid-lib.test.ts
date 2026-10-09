/**
 * orcid-lib.test.ts — Testes das funções puras da sincronização com o ORCID
 *
 * Os casos vêm do próprio conteúdo do site: os pares título → nome de arquivo
 * foram gerados pelo Decap CMS, e os autores são publicações em que o formato
 * ABNT já estava correto. Rodar com `npm test`.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import matter from "gray-matter";
import {
  abntFromFullName, cleanTitle, formatAuthor, formatAuthors, mapType, nameKey, normalizeDoi, slugify, toFrontmatter,
} from "./orcid-lib";

test("normalizeDoi aceita as formas usadas no conteúdo e nas APIs", () => {
  const canon = "10.1016/j.ceramint.2025.05.280";
  assert.equal(normalizeDoi("http://dx.doi.org/10.1016/j.ceramint.2025.05.280"), canon);
  assert.equal(normalizeDoi("https://doi.org/10.1016/J.CERAMINT.2025.05.280"), canon);
  assert.equal(normalizeDoi("doi: 10.1016/j.ceramint.2025.05.280"), canon);
  assert.equal(normalizeDoi(' "10.1016/j.ceramint.2025.05.280" '), canon);
  assert.equal(normalizeDoi(""), null);
  assert.equal(normalizeDoi(undefined), null);
  assert.equal(normalizeDoi("não é doi"), null);
});

test("slugify reproduz os nomes de arquivo que o Decap gerou", () => {
  const casos: [string, string][] = [
    ["A novel polymorphic phase in NaGd(MoO4)2: Synthesis and temperature-induced phase transition",
      "a-novel-polymorphic-phase-in-nagd-moo4-2-synthesis-and-temperature-induced-phase-transition"],
    ["High-temperature and laser-induced phase transitions in α-Ag3VO4 nanoparticles: A Raman and DFT study",
      "high-temperature-and-laser-induced-phase-transitions-in-α-ag3vo4-nanoparticles-a-raman-and-dft-study"],
    ["In situ investigation of structural stability and reversible conformational changes in Gd2(WO4)3 at high temperatures",
      "in-situ-investigation-of-structural-stability-and-reversible-conformational-changes-in-gd2-wo4-3-at-high-temperatures"],
    ["Preparation and Application of Sodium–Lanthanum Molybdate for the Photocatalytic Degradation of Coomassie Brilliant Blue G‑250 Dye",
      "preparation-and-application-of-sodium–lanthanum-molybdate-for-the-photocatalytic-degradation-of-coomassie-brilliant-blue-g‑250-dye"],
    ["Synthesis, structural, vibrational and electrical properties of silver- and aluminum-doped molybdenum trioxide (α-MoO3)",
      "synthesis-structural-vibrational-and-electrical-properties-of-silver-and-aluminum-doped-molybdenum-trioxide-α-moo3"],
    ["Temperature-induced phase transformation/transition in K6Mo7O24·4H2O",
      "temperature-induced-phase-transformation-transition-in-k6mo7o24·4h2o"],
    ["Temperature–dependent phase behavior and thermal stability of bismuth-doped tungsten trioxide nanowires",
      "temperature–dependent-phase-behavior-and-thermal-stability-of-bismuth-doped-tungsten-trioxide-nanowires"],
  ];
  for (const [titulo, esperado] of casos) assert.equal(slugify(titulo), esperado);
});

test("formatAuthor gera SOBRENOME, INICIAIS e ignora partículas", () => {
  assert.equal(formatAuthor({ given: "M. L. A.", family: "Dorneles" }), "DORNELES, M.L.A.");
  assert.equal(formatAuthor({ given: "Alan S.", family: "de Menezes" }), "DE MENEZES, A.S.");
  assert.equal(formatAuthor({ given: "Cleânio", family: "Luz-Lima" }), "LUZ-LIMA, C.");
  assert.equal(formatAuthor({ given: "Jailson dos Santos", family: "Silva" }), "SILVA, J.S.");
  assert.equal(formatAuthor({ given: "Luciana", family: "Rebêlo Alencar" }), "REBÊLO ALENCAR, L.");
  assert.equal(formatAuthor({ family: "Moura" }), "MOURA");
  assert.equal(formatAuthor({ name: "LaFiM Collaboration" }), "LaFiM Collaboration");
});

test("formatAuthors reproduz uma publicação que já estava no padrão", () => {
  // 10.1016/j.ceramint.2025.05.280, autores como vêm da Crossref
  const crossref = [
    { given: "M.L.A.", family: "Dorneles" }, { given: "C.C.", family: "Santos" },
    { given: "C.", family: "Luz-Lima" }, { given: "W.C.", family: "Ferreira" },
    { given: "P.T.C.", family: "Freire" }, { given: "A.S.", family: "de Menezes" },
    { given: "J.V.B.", family: "Moura" },
  ];
  assert.equal(
    formatAuthors(crossref),
    "DORNELES, M.L.A. ; SANTOS, C.C. ; LUZ-LIMA, C. ; FERREIRA, W.C. ; FREIRE, P.T.C. ; DE MENEZES, A.S. ; MOURA, J.V.B.",
  );
});

test("cleanTitle remove marcação e entidades", () => {
  assert.equal(cleanTitle("Phonons in Ag<sub>2</sub>WO<sub>4</sub>"), "Phonons in Ag2WO4");
  assert.equal(cleanTitle("<i>In situ</i>  Raman &amp; XRD\n study"), "In situ Raman & XRD study");
});

test("mapType cobre as opções do painel e recusa o resto", () => {
  assert.equal(mapType("journal-article"), "Artigo");
  assert.equal(mapType("book-chapter"), "Capítulo");
  assert.equal(mapType("conference-poster"), null);
});

test("membros do LaFiM saem com a grafia do nome cadastrado no painel", () => {
  assert.equal(abntFromFullName("João Victor Barbosa Moura"), "MOURA, J.V.B.");
  assert.equal(abntFromFullName("Zeyna dos Santos Viegas"), "VIEGAS, Z.S.");
  const members = new Map([[nameKey("João Victor Barbosa Moura"), "MOURA, J.V.B."]]);
  // 10.1021/acsomega.5c03153: a ACS manda family "Barbosa Moura"
  const crossref = [{ given: "Cleânio", family: "Luz-Lima" }, { given: "João Victor", family: "Barbosa Moura" }];
  assert.equal(formatAuthors(crossref, members), "LUZ-LIMA, C. ; MOURA, J.V.B.");
  assert.equal(nameKey("  JOAO   Víctor "), "joao victor");
});

test("toFrontmatter segue o estilo do Decap e é lido de volta sem perda", () => {
  const data = {
    title: "High-Temperature Isostructural Phase Transition in Ce2(MoO4)3: A Rare Phenomenon",
    authors: "DE MENEZES, A.S. ; MOURA, J.V.B.",
    year: 2026,
    journal: "Spectrochimica Acta Part A: Molecular and Biomolecular Spectroscopy",
    doi: "https://doi.org/10.1021/acsomega.5c03153",
    type: "Artigo",
    featured: false,
  };
  const out = toFrontmatter(data);
  assert.ok(out.includes('title: "High-Temperature Isostructural Phase Transition in Ce2(MoO4)3: A Rare Phenomenon"'));
  assert.ok(out.includes("authors: DE MENEZES, A.S. ; MOURA, J.V.B.\n"));
  assert.ok(out.includes("doi: https://doi.org/10.1021/acsomega.5c03153\n"));
  assert.ok(out.includes("year: 2026\n") && out.includes("featured: false\n"));
  assert.deepEqual(matter(out).data, data);
  // valores que o YAML leria como outro tipo ganham aspas
  assert.deepEqual(matter(toFrontmatter({ a: "2026", b: "true", c: "- x", d: 'diz "oi"' })).data,
    { a: "2026", b: "true", c: "- x", d: 'diz "oi"' });
});
