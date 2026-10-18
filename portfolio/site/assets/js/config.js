/*
 * Configuração central do portfólio.
 * Edite este arquivo para trocar o WhatsApp, os serviços do formulário
 * e o catálogo de projetos. Nenhum outro arquivo precisa ser alterado.
 */
window.SITE_CONFIG = Object.freeze({
  brand: 'Martins | Criação de Sites',

  // Somente dígitos: código do país + DDD + número.
  whatsapp: '5519993128050',
  whatsappDisplay: '+55 19 99312-8050',

  // Mensagem usada pelos botões de contato rápido.
  quickMessage:
    'Olá, Martins! Vim pelo seu portfólio e gostaria de um orçamento.',

  // Opções do campo "Serviço desejado" no formulário de contato.
  services: [
    'Site profissional',
    'Landing page',
    'Site para negócio local',
    'Catálogo digital',
    'Sistema de agendamento',
    'Sistema administrativo / gestão',
    'Manutenção de site existente',
  ],

  // Categorias usadas pelos filtros da seção Projetos.
  categories: [
    { id: 'todos', label: 'Todos' },
    { id: 'sites', label: 'Sites' },
    { id: 'sistemas', label: 'Sistemas' },
  ],

  /*
   * Catálogo de projetos.
   * - type: id de uma categoria acima (exceto "todos").
   * - status: texto exibido no rodapé do cartão.
   * - statusTone: "progress" (em preparação) ou "live" (publicado).
   * - demoUrl: endereço da demonstração publicada. Deixe null enquanto
   *   não houver uma demonstração no ar; nenhum botão é exibido.
   * - fictional: true para empresas fictícias (exibe o selo "Demo fictícia").
   */
  projects: [
    {
      id: 'autoprime',
      type: 'sites',
      name: 'AutoPrime Centro Automotivo',
      category: 'Automotivo',
      tint: '#E5A33B',
      problem:
        'Oficina que precisa mostrar seus serviços e receber pedidos de orçamento sem depender só de ligações.',
      features: [
        'Catálogo de serviços e diferenciais',
        'Pedido de orçamento pelo WhatsApp',
        'Tema claro e escuro',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'barbearia',
      type: 'sites',
      name: 'Barbearia',
      category: 'Beleza masculina',
      tint: '#C08457',
      problem:
        'Barbearia que quer apresentar serviços, preços e equipe e facilitar o primeiro contato.',
      features: [
        'Serviços e preços editáveis',
        'Equipe e galeria',
        'Contato com mensagem pronta',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'manicure',
      type: 'sistemas',
      name: 'Studio de Manicure',
      category: 'Beleza · Agendamento',
      tint: '#8D6CFF',
      problem:
        'Profissional que perde tempo confirmando horários por mensagem.',
      features: [
        'Calendário de disponibilidade',
        'Agendamento e cancelamento',
        'Bloqueio de horários em conflito',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'tenis',
      type: 'sites',
      name: 'Loja de Tênis',
      category: 'Varejo · Catálogo',
      tint: '#38BDF8',
      problem: 'Loja que precisa de uma vitrine online com busca e filtros.',
      features: [
        'Catálogo com categorias',
        'Busca e filtros',
        'Página de detalhes do produto',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'roupas',
      type: 'sites',
      name: 'Loja de Roupas',
      category: 'Varejo · Catálogo',
      tint: '#F472B6',
      problem: 'Loja que vende pelo WhatsApp e quer um catálogo organizado.',
      features: [
        'Variações de tamanho e cor',
        'Busca e filtros',
        'Pedido pelo WhatsApp',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'doces',
      type: 'sites',
      name: 'Doces e Salgados',
      category: 'Gastronomia',
      tint: '#F59E0B',
      problem: 'Confeitaria que recebe encomendas desorganizadas por mensagem.',
      features: [
        'Cardápio por categorias',
        'Formulário de encomenda',
        'Informações de entrega',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'nexora-booking',
      type: 'sistemas',
      name: 'Nexora Booking',
      category: 'Sistema · Agendamento',
      tint: '#A78BFA',
      problem: 'Agenda online para negócios que atendem com hora marcada.',
      features: [
        'Agenda por profissional',
        'Confirmação de horário',
        'Painel de gestão',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'nexora-crm',
      type: 'sistemas',
      name: 'Nexora CRM',
      category: 'Sistema · Vendas',
      tint: '#34D399',
      problem:
        'Pequena empresa sem controle de contatos, leads e oportunidades.',
      features: [
        'Cadastro de clientes e leads',
        'Funil comercial',
        'Tarefas e relatórios',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
    {
      id: 'nexora-stock',
      type: 'sistemas',
      name: 'Nexora Stock',
      category: 'Sistema · Estoque',
      tint: '#FB923C',
      problem: 'Negócio que controla o estoque em planilhas soltas.',
      features: [
        'Entradas e saídas',
        'Alerta de estoque baixo',
        'Histórico de movimentações',
      ],
      status: 'Demonstração em preparação',
      statusTone: 'progress',
      demoUrl: null,
      fictional: true,
    },
  ],
});
