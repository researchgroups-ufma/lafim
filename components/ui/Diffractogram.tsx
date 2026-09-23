/**
 * Diffractogram — Traço decorativo no formato de um difratograma de raios X
 *
 * Assinatura visual do PageHeader: linha de base com ruído leve, fundo que
 * decai a baixo ângulo e picos estreitos. NÃO são dados reais de nenhuma
 * amostra — o padrão é fixo e igual em todas as páginas, por isso o SVG é
 * aria-hidden.
 *
 * O caminho é calculado uma vez, no módulo (build time), e é determinístico:
 * o ruído usa um gerador com semente fixa, então o HTML não muda entre builds.
 */

// Largura e altura do viewBox; o SVG estica na horizontal (preserveAspectRatio="none")
const W = 1000;
const H = 60;
const BASELINE = H - 2;

// [posição no eixo x do viewBox, intensidade relativa 0–1]
const PEAKS: [number, number][] = [
  [168, 0.28], [236, 0.18], [291, 1.0], [318, 0.42], [402, 0.22],
  [468, 0.58], [521, 0.31], [596, 0.19], [648, 0.44], [717, 0.14],
  [779, 0.33], [858, 0.12], [912, 0.21],
];

/** Gerador pseudoaleatório com semente fixa (LCG), para o ruído ser estável. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildPath(): string {
  const rand = seeded(7);
  const points: string[] = [];
  for (let x = 0; x <= W; x += 2) {
    // Fundo que decai a baixo ângulo + ruído de contagem
    let y = 5 * Math.exp(-x / 220) + (rand() - 0.5) * 1.2;
    // Picos com perfil de Lorentz, meia largura de ~3 unidades
    for (const [pos, amp] of PEAKS) {
      const d = (x - pos) / 3;
      y += (amp * 50) / (1 + d * d);
    }
    points.push(`${x},${(BASELINE - y).toFixed(1)}`);
  }
  return `M${points.join("L")}`;
}

const PATH = buildPath();

export default function Diffractogram() {
  return (
    <svg
      className="page-header-trace"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATH} />
    </svg>
  );
}
