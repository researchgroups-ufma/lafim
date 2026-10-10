/**
 * ScrollHint — "Bump" que sugere haver mais conteúdo abaixo do Hero
 *
 * Com a página parada no topo, o conteúdo (<main>) sobe alguns pixels,
 * deixando aparecer o começo da seção seguinte, e volta com um leve quique.
 * Repete a cada 4 s durante os primeiros 30 s e para de vez assim que o
 * visitante rola, toca ou usa o teclado. Não renderiza nada; só anima.
 *
 * Anima `transform` no <main> em vez de rolar a página: rolagem programática
 * dispararia os listeners de scroll (menu, IntersectionObservers) e brigaria
 * com o gesto do usuário. A animação não usa `fill`, então o transform some
 * ao terminar e não afeta elementos `position: fixed` dentro do <main>.
 */

"use client";

import { useEffect } from "react";

const PRIMEIRO_BUMP_MS = 2600; // espera o logo do Hero terminar de montar
const INTERVALO_MS = 4000; // de uma subida à próxima
const DURACAO_TOTAL_MS = 30000; // nenhuma subida começa depois disso
const ALTURA_PX = 56;

export default function ScrollHint() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.getElementById("conteudo");
    if (!main) return;

    const eventos = ["scroll", "wheel", "touchstart", "keydown", "pointerdown"] as const;
    const inicio = performance.now();
    let timer: number;
    let anim: Animation | undefined;

    const parar = () => {
      window.clearTimeout(timer);
      anim?.cancel();
      eventos.forEach((e) => window.removeEventListener(e, parar));
    };

    const bump = () => {
      if (window.scrollY > 0) return parar();
      anim = main.animate(
        [
          { transform: "translateY(0)", easing: "cubic-bezier(0.33, 0, 0.2, 1)" },
          { transform: `translateY(-${ALTURA_PX}px)`, offset: 0.35, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
          { transform: "translateY(0)" },
        ],
        { duration: 1100 }
      );
      if (performance.now() - inicio + INTERVALO_MS <= DURACAO_TOTAL_MS) {
        timer = window.setTimeout(bump, INTERVALO_MS);
      }
    };

    eventos.forEach((e) => window.addEventListener(e, parar, { passive: true, once: true }));
    timer = window.setTimeout(bump, PRIMEIRO_BUMP_MS);

    return parar;
  }, []);

  return null;
}
