/**
 * dictionaries.ts — Dicionário de strings de UI por idioma (i18n sem biblioteca)
 *
 * Centraliza as strings de UI hoje lidas via `getDictionary(locale)` nas
 * páginas/componentes. `en` traz traduções reais (Plano 009). `roles`,
 * `pubTypes`, `scholarships` e `newsCategories` são mapas de exibição de
 * VALORES de dados de frontmatter (que permanece em PT); o Plano 010 os
 * preenche.
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
    // No pt cada mapa é identidade (chave = valor) para que display(role)
    // funcione uniformemente nos dois locales.
    roles: {
      "Coordenador": "Coordenador",
      "Pesquisador Sênior": "Pesquisador Sênior",
      "Pós-Doutorando": "Pós-Doutorando",
      "Doutorando": "Doutorando",
      "Mestrando": "Mestrando",
      "Iniciação Científica": "Iniciação Científica",
      "Egresso": "Egresso",
      "Colaborador Externo": "Colaborador Externo",
    } as Record<string, string>,
    pubTypes: {
      "Artigo": "Artigo",
      "Preprint": "Preprint",
      "Tese": "Tese",
      "Dissertação": "Dissertação",
      "Livro": "Livro",
      "Capítulo": "Capítulo",
    } as Record<string, string>,
    scholarships: {
      "CAPES": "CAPES",
      "CNPq": "CNPq",
      "FAPEMA": "FAPEMA",
      "Sem bolsa": "Sem bolsa",
    } as Record<string, string>,
    newsCategories: {
      "Publicação": "Publicação",
      "Defesa": "Defesa",
      "Premiação": "Premiação",
      "Visita": "Visita",
      "Mídia": "Mídia",
      "Outros": "Outros",
    } as Record<string, string>,
  },
  en: {
    nav: {
      home: "Home",
      research: "Research",
      infrastructure: "Infrastructure",
      members: "Members",
      publications: "Publications",
      news: "News",
      about: "About",
      contact: "Contact",
    },
    home: {
      srTitle: "Laboratory of Materials Physics (LaFiM) — Federal University of Maranhão",
      research: {
        eyebrow: "Research",
        heading: "From atomic structure to material function.",
        lead: "LaFiM studies the relationship between structure, composition and physical properties of materials, combining experimental characterization and theoretical modeling. We start at the atomic scale — where symmetry and defects govern the solid — and reach applications in energy, sensors and functional devices.",
        body: "The group maintains national and international collaborations, with its own synthesis and characterization infrastructure, training researchers at the undergraduate, master's and doctoral levels.",
      },
      news: {
        eyebrow: "News",
        heading: "Follow the lab's latest updates.",
        ctaAll: "See all news →",
      },
      cards: {
        membersTitle: "Members",
        membersDesc: "Meet the researchers, graduate students and undergraduate research students who make up the group.",
        membersCta: "Meet the team",
        pubTitle: "Publications",
        pubDesc: "Articles, book chapters and conference papers produced by the laboratory over the years.",
        pubCta: "See publications",
      },
      coordinator: {
        eyebrow: "About the Coordinator",
        role: "LaFiM Coordinator · Department of Physics",
      },
    },
    research: {
      title: "Research Lines",
      intro: "We develop frontier research in condensed matter physics, nanomaterials and superconductivity. Our work combines theoretical, experimental and computational approaches.",
      empty: "No research lines registered yet.",
    },
    infrastructure: {
      title: "Infrastructure",
      empty: "No equipment registered yet.",
    },
    news: {
      title: "News",
      empty: "No news registered yet.",
      allMonths: "All months",
      allYears: "All years",
      clearFilters: "Clear filters",
      none: "No news found for this filter.",
      prev: "← Previous",
      next: "Next →",
      months: ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    },
    about: {
      title: "About the Lab",
      mission: "Mission",
      history: "History",
      institutional: "Institutional Affiliation",
    },
    contact: {
      title: "Contact",
      info: "Information",
      local: "Location",
      email: "Email",
      lattes: "Lattes",
      opportunities: "Opportunities",
      opportunitiesText: "Interested in joining the group as an undergraduate research, master's or doctoral student? We work with CAPES, CNPq and FAPEMA scholarships. Get in touch via our institutional email.",
      sendEmail: "Send email →",
    },
    members: {
      title: "Lab Members",
      coordinator: "Coordinator",
      coordinatorRole: "Coordinator", // usado como "Coordinator · LaFiM"
      team: "Team",
      alumni: "Alumni",
      collaborators: "External collaborators",
      // plurais irregulares dos grupos (os demais recebem "s") — chaves em PT (frontmatter), valores traduzidos
      rolePlural: {
        "Pesquisador Sênior": "Senior Researchers",
        "Iniciação Científica": "Undergraduate Research",
      },
    },
    publications: {
      title: "Publications",
      intro: "List of articles published in peer-reviewed international journals. Full list available on",
      introLattes: "Lattes CV",
      introScholar: "Google Scholar",
      introArxiv: "arXiv",
      theses: "Supervised theses and dissertations",
      pdf: "PDF ↗",
      filters: {
        all: "All",
        mat: "Condensed Matter",
        supercond: "Superconductivity",
        nano: "Nanomaterials",
        comp: "Computational",
      },
      allYears: "All years",
      clearYear: "Clear year filter",
      none: "No publications found for this filter.",
      prev: "← Previous",
      next: "Next →",
      badgeFeatured: "Featured",
    },
    // Mapas de exibição de VALORES de dados (frontmatter fica em PT).
    // Chaves em PT (valor cru do frontmatter), valores traduzidos para EN.
    roles: {
      "Coordenador": "Coordinator",
      "Pesquisador Sênior": "Senior Researcher",
      "Pós-Doutorando": "Postdoctoral Researcher",
      "Doutorando": "PhD Student",
      "Mestrando": "Master's Student",
      "Iniciação Científica": "Undergraduate Researcher",
      "Egresso": "Alumnus",
      "Colaborador Externo": "External Collaborator",
    } as Record<string, string>,
    pubTypes: {
      "Artigo": "Article",
      "Preprint": "Preprint",
      "Tese": "PhD Thesis",
      "Dissertação": "Master's Dissertation",
      "Livro": "Book",
      "Capítulo": "Book Chapter",
    } as Record<string, string>,
    scholarships: {
      "CAPES": "CAPES",
      "CNPq": "CNPq",
      "FAPEMA": "FAPEMA",
      "Sem bolsa": "Unfunded",
    } as Record<string, string>,
    newsCategories: {
      "Publicação": "Publication",
      "Defesa": "Thesis Defense",
      "Premiação": "Award",
      "Visita": "Visit",
      "Mídia": "Media",
      "Outros": "Other",
    } as Record<string, string>,
  },
} as const;

export type Locale = "pt" | "en";
