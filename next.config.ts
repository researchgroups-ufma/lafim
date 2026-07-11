import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    // Necessário para 404 customizado com múltiplos root layouts
    // (app/(pt)/ e app/en/ — não existe app/layout.tsx raiz).
    globalNotFound: true,
  },
};

export default nextConfig;
