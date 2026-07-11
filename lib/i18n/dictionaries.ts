/**
 * dictionaries.ts — Dicionário de strings de UI por idioma (i18n sem biblioteca)
 *
 * Centraliza as strings hoje hardcoded em PT nas páginas/componentes. O EN
 * ainda clona o PT (fallback desejado para a Fase 1) — o Plano 009 substitui
 * os valores de `en` por traduções reais. `roles`, `pubTypes`, `scholarships`
 * e `newsCategories` são mapas de exibição de VALORES de dados de frontmatter
 * (que permanece em PT); o Plano 010 os preenche.
 */

export const dictionaries = {
  pt: {
    nav: {
      home: "Início",
      research: "Pesquisa",
      infrastructure: "Infraestrutura",
      members: "Membros",
      publications: "Publicações",
      news: "Notícias",
      about: "Sobre",
      contact: "Contato",
    },
    home: {
      srTitle: "Laboratório de Física dos Materiais (LaFiM) — Universidade Federal do Maranhão",
      research: {
        eyebrow: "Pesquisa",
        heading: "Da estrutura atômica à função do material.",
        lead: "O LaFiM estuda a relação entre estrutura, composição e propriedades físicas dos materiais, combinando caracterização experimental e modelagem teórica. Partimos da escala atômica — onde simetria e defeitos governam o sólido — e chegamos às aplicações em energia, sensores e dispositivos funcionais.",
        body: "O grupo mantém colaborações nacionais e internacionais, com infraestrutura própria de síntese e caracterização, formando pesquisadores em iniciação científica, mestrado e doutorado.",
      },
      news: {
        eyebrow: "Notícias",
        heading: "Acompanhe as novidades do laboratório.",
        ctaAll: "Ver todas as notícias →",
      },
      cards: {
        membersTitle: "Membros",
        membersDesc: "Conheça os pesquisadores, estudantes de pós-graduação e alunos de iniciação científica que formam o grupo.",
        membersCta: "Ver equipe",
        pubTitle: "Publicações",
        pubDesc: "Artigos, capítulos e trabalhos em eventos produzidos pelo laboratório ao longo dos anos.",
        pubCta: "Ver publicações",
      },
      coordinator: {
        eyebrow: "Sobre o Coordenador",
        role: "Coordenador do LaFiM · Departamento de Física",
      },
    },
    research: {
      title: "Linhas de Pesquisa",
      intro: "Desenvolvemos pesquisa de fronteira em física da matéria condensada, nanomateriais e supercondutividade. Nosso trabalho combina abordagens teóricas, experimentais e computacionais.",
      empty: "Nenhuma linha de pesquisa cadastrada ainda.",
    },
    infrastructure: {
      title: "Infraestrutura",
      empty: "Nenhum equipamento cadastrado ainda.",
    },
    news: {
      title: "Notícias",
      empty: "Nenhuma notícia cadastrada ainda.",
      allMonths: "Todos os meses",
      allYears: "Todos os anos",
      clearFilters: "Limpar filtros",
      none: "Nenhuma notícia encontrada para este filtro.",
      prev: "← Anterior",
      next: "Próxima →",
      months: ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    },
    about: {
      title: "Sobre o Laboratório",
      mission: "Missão",
      history: "Histórico",
      institutional: "Vínculo Institucional",
    },
    contact: {
      title: "Contato",
      info: "Informações",
      local: "Local",
      email: "Email",
      lattes: "Lattes",
      opportunities: "Oportunidades",
      opportunitiesText: "Interessado em ingressar no grupo como aluno de IC, mestrando ou doutorando? Trabalhamos com bolsas CAPES, CNPq e FAPEMA. Entre em contato pelo e-mail institucional.",
      sendEmail: "Enviar e-mail →",
    },
    members: {
      title: "Membros do laboratório",
      coordinator: "Coordenador",
      coordinatorRole: "Coordenador", // usado como "Coordenador · LaFiM"
      team: "Equipe",
      alumni: "Egressos",
      collaborators: "Colaboradores externos",
      // plurais irregulares dos grupos (os demais recebem "s")
      rolePlural: {
        "Pesquisador Sênior": "Pesquisadores Sênior",
        "Iniciação Científica": "Iniciação Científica",
      },
    },
    publications: {
      title: "Publicações",
      intro: "Lista de artigos publicados em periódicos internacionais revisados por pares. Lista completa disponível no",
      introLattes: "Currículo Lattes",
      introScholar: "Google Scholar",
      introArxiv: "arXiv",
      theses: "Teses e dissertações orientadas",
      pdf: "PDF ↗",
      filters: {
        all: "Todas",
        mat: "Mat. Condensada",
        supercond: "Supercondutividade",
        nano: "Nanomateriais",
        comp: "Computacional",
      },
      allYears: "Todos os anos",
      clearYear: "Limpar filtro de ano",
      none: "Nenhuma publicação encontrada para este filtro.",
      prev: "← Anterior",
      next: "Próxima →",
      badgeFeatured: "Destaque",
    },
    // Mapas de exibição de VALORES de dados (frontmatter fica em PT).
    // Na Fase 1 o PT é identidade; o Plano 010 preenche o EN.
    roles: {} as Record<string, string>,
    pubTypes: {} as Record<string, string>,
    scholarships: {} as Record<string, string>,
    newsCategories: {} as Record<string, string>,
  },
  en: {
    nav: {
      home: "Início",
      research: "Pesquisa",
      infrastructure: "Infraestrutura",
      members: "Membros",
      publications: "Publicações",
      news: "Notícias",
      about: "Sobre",
      contact: "Contato",
    },
    home: {
      srTitle: "Laboratório de Física dos Materiais (LaFiM) — Universidade Federal do Maranhão",
      research: {
        eyebrow: "Pesquisa",
        heading: "Da estrutura atômica à função do material.",
        lead: "O LaFiM estuda a relação entre estrutura, composição e propriedades físicas dos materiais, combinando caracterização experimental e modelagem teórica. Partimos da escala atômica — onde simetria e defeitos governam o sólido — e chegamos às aplicações em energia, sensores e dispositivos funcionais.",
        body: "O grupo mantém colaborações nacionais e internacionais, com infraestrutura própria de síntese e caracterização, formando pesquisadores em iniciação científica, mestrado e doutorado.",
      },
      news: {
        eyebrow: "Notícias",
        heading: "Acompanhe as novidades do laboratório.",
        ctaAll: "Ver todas as notícias →",
      },
      cards: {
        membersTitle: "Membros",
        membersDesc: "Conheça os pesquisadores, estudantes de pós-graduação e alunos de iniciação científica que formam o grupo.",
        membersCta: "Ver equipe",
        pubTitle: "Publicações",
        pubDesc: "Artigos, capítulos e trabalhos em eventos produzidos pelo laboratório ao longo dos anos.",
        pubCta: "Ver publicações",
      },
      coordinator: {
        eyebrow: "Sobre o Coordenador",
        role: "Coordenador do LaFiM · Departamento de Física",
      },
    },
    research: {
      title: "Linhas de Pesquisa",
      intro: "Desenvolvemos pesquisa de fronteira em física da matéria condensada, nanomateriais e supercondutividade. Nosso trabalho combina abordagens teóricas, experimentais e computacionais.",
      empty: "Nenhuma linha de pesquisa cadastrada ainda.",
    },
    infrastructure: {
      title: "Infraestrutura",
      empty: "Nenhum equipamento cadastrado ainda.",
    },
    news: {
      title: "Notícias",
      empty: "Nenhuma notícia cadastrada ainda.",
      allMonths: "Todos os meses",
      allYears: "Todos os anos",
      clearFilters: "Limpar filtros",
      none: "Nenhuma notícia encontrada para este filtro.",
      prev: "← Anterior",
      next: "Próxima →",
      months: ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    },
    about: {
      title: "Sobre o Laboratório",
      mission: "Missão",
      history: "Histórico",
      institutional: "Vínculo Institucional",
    },
    contact: {
      title: "Contato",
      info: "Informações",
      local: "Local",
      email: "Email",
      lattes: "Lattes",
      opportunities: "Oportunidades",
      opportunitiesText: "Interessado em ingressar no grupo como aluno de IC, mestrando ou doutorando? Trabalhamos com bolsas CAPES, CNPq e FAPEMA. Entre em contato pelo e-mail institucional.",
      sendEmail: "Enviar e-mail →",
    },
    members: {
      title: "Membros do laboratório",
      coordinator: "Coordenador",
      coordinatorRole: "Coordenador", // usado como "Coordenador · LaFiM"
      team: "Equipe",
      alumni: "Egressos",
      collaborators: "Colaboradores externos",
      // plurais irregulares dos grupos (os demais recebem "s")
      rolePlural: {
        "Pesquisador Sênior": "Pesquisadores Sênior",
        "Iniciação Científica": "Iniciação Científica",
      },
    },
    publications: {
      title: "Publicações",
      intro: "Lista de artigos publicados em periódicos internacionais revisados por pares. Lista completa disponível no",
      introLattes: "Currículo Lattes",
      introScholar: "Google Scholar",
      introArxiv: "arXiv",
      theses: "Teses e dissertações orientadas",
      pdf: "PDF ↗",
      filters: {
        all: "Todas",
        mat: "Mat. Condensada",
        supercond: "Supercondutividade",
        nano: "Nanomateriais",
        comp: "Computacional",
      },
      allYears: "Todos os anos",
      clearYear: "Limpar filtro de ano",
      none: "Nenhuma publicação encontrada para este filtro.",
      prev: "← Anterior",
      next: "Próxima →",
      badgeFeatured: "Destaque",
    },
    // Mapas de exibição de VALORES de dados (frontmatter fica em PT).
    // Na Fase 1 o PT é identidade; o Plano 010 preenche o EN.
    roles: {} as Record<string, string>,
    pubTypes: {} as Record<string, string>,
    scholarships: {} as Record<string, string>,
    newsCategories: {} as Record<string, string>,
  },
} as const;

export type Locale = "pt" | "en";
