(() => {
  const config = window.SITE_CONFIG;
  if (!config) return;

  const root = document.documentElement;
  const CHECK_ICON =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  const whatsappUrl = (message) => {
    const phone = String(config.whatsapp).replace(/\D/g, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  /* Tema ----------------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme, persist) => {
    root.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    themeToggle.setAttribute(
      'aria-label',
      isDark ? 'Ativar tema claro' : 'Ativar tema escuro',
    );
    if (themeColor)
      themeColor.setAttribute('content', isDark ? '#0B0B0E' : '#F7F7F9');
    if (persist) {
      try {
        localStorage.setItem('theme', theme);
      } catch {
        // Armazenamento indisponível: o tema vale só para esta visita.
      }
    }
  };

  applyTheme(
    root.getAttribute('data-theme') === 'light' ? 'light' : 'dark',
    false,
  );
  themeToggle.addEventListener('click', () => {
    applyTheme(
      root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark',
      true,
    );
  });

  /* Menu mobile ---------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const desktopQuery = window.matchMedia('(min-width: 901px)');

  const setMenu = (open, returnFocus) => {
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (!open && returnFocus) menuToggle.focus();
  };

  menuToggle.addEventListener('click', () => setMenu(mobileNav.hidden, false));
  mobileNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false, false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !mobileNav.hidden) setMenu(false, true);
  });
  desktopQuery.addEventListener('change', (event) => {
    if (event.matches) setMenu(false, false);
  });

  /* Seção ativa na navegação --------------------------------------------- */
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of navLinks) {
            if (link.getAttribute('href') === `#${entry.target.id}`)
              link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const section of document.querySelectorAll('main section[id]'))
      observer.observe(section);
  }

  /* Links rápidos do WhatsApp -------------------------------------------- */
  const quickUrl = whatsappUrl(config.quickMessage);
  for (const link of document.querySelectorAll('[data-wa-quick]'))
    link.href = quickUrl;
  const waDisplay = document.getElementById('wa-display');
  if (waDisplay) waDisplay.textContent = config.whatsappDisplay;

  /* Projetos ------------------------------------------------------------- */
  const grid = document.getElementById('project-grid');
  const filtersBox = document.getElementById('project-filters');
  const emptyState = document.getElementById('project-empty');
  const countLabel = document.getElementById('project-count');
  let activeFilter = 'todos';

  const isSafeUrl = (url) =>
    typeof url === 'string' && /^(https:\/\/|\/|\.\/)/.test(url);

  const projectCard = (project) => {
    const card = el('article', 'proj-card');
    card.style.setProperty('--tint', project.tint || 'var(--accent)');

    const preview = el('div', 'proj-preview');
    preview.setAttribute('aria-hidden', 'true');
    preview.innerHTML =
      '<div class="pv-top"><span class="pv-logo"></span><span class="pv-line"></span></div>' +
      '<div class="pv-title"></div><div class="pv-sub"></div>' +
      '<div class="pv-tiles"><span></span><span></span><span></span></div>';
    card.appendChild(preview);

    const body = el('div', 'proj-body');
    const meta = el('div', 'proj-meta');
    meta.appendChild(el('span', 'proj-cat', project.category));
    if (project.fictional)
      meta.appendChild(el('span', 'badge', 'Demo fictícia'));
    body.appendChild(meta);

    body.appendChild(el('h3', 'proj-name', project.name));
    body.appendChild(el('p', 'proj-problem', project.problem));

    const list = el('ul', 'proj-features');
    list.setAttribute('aria-label', 'Funcionalidades previstas');
    for (const feature of project.features || []) {
      const item = el('li');
      item.innerHTML = CHECK_ICON;
      item.appendChild(document.createTextNode(feature));
      list.appendChild(item);
    }
    body.appendChild(list);

    const foot = el('div', 'proj-foot');
    foot.appendChild(
      el(
        'span',
        project.statusTone === 'live' ? 'status status-live' : 'status',
        project.status,
      ),
    );
    if (isSafeUrl(project.demoUrl)) {
      const link = el('a', 'proj-link', 'Ver demonstração');
      link.href = project.demoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.appendChild(
        el('span', 'sr-only', ` de ${project.name} (abre em nova aba)`),
      );
      foot.appendChild(link);
    }
    body.appendChild(foot);

    card.appendChild(body);
    return card;
  };

  const renderProjects = () => {
    const visible = config.projects.filter(
      (p) => activeFilter === 'todos' || p.type === activeFilter,
    );
    grid.replaceChildren(...visible.map(projectCard));
    emptyState.hidden = visible.length > 0;
    grid.hidden = visible.length === 0;
    countLabel.textContent =
      visible.length === 1
        ? '1 projeto exibido'
        : `${visible.length} projetos exibidos`;

    for (const btn of filtersBox.children) {
      btn.setAttribute(
        'aria-pressed',
        btn.dataset.filter === activeFilter ? 'true' : 'false',
      );
    }
  };

  for (const category of config.categories) {
    const btn = el('button', 'filter-btn', category.label);
    btn.type = 'button';
    btn.dataset.filter = category.id;
    btn.addEventListener('click', () => {
      activeFilter = category.id;
      renderProjects();
    });
    filtersBox.appendChild(btn);
  }
  renderProjects();

  /* Contato -------------------------------------------------------------- */
  const form = document.getElementById('contact-form');
  const service = document.getElementById('f-service');
  const business = document.getElementById('f-business');
  const details = document.getElementById('f-details');
  const detailsCount = document.getElementById('f-details-count');
  const serviceError = document.getElementById('f-service-err');
  const preview = document.getElementById('message-preview');
  const status = document.getElementById('form-status');
  const fallback = document.getElementById('wa-fallback');

  for (const name of config.services) {
    const option = el('option', null, name);
    option.value = name;
    service.appendChild(option);
  }

  const clean = (value) => value.replace(/\s+/g, ' ').trim();

  const buildMessage = () => {
    const lines = ['Olá, Martins! Vim pelo seu portfólio.'];
    lines.push(`Serviço: ${service.value || '[escolha um serviço]'}`);
    const b = clean(business.value);
    const d = details.value.trim();
    if (b) lines.push(`Negócio: ${b}`);
    if (d) lines.push(`Detalhes: ${d}`);
    return lines.join('\n');
  };

  const setServiceError = (show) => {
    serviceError.hidden = !show;
    if (show) service.setAttribute('aria-invalid', 'true');
    else service.removeAttribute('aria-invalid');
  };

  const update = () => {
    preview.textContent = buildMessage();
    detailsCount.textContent = `${details.value.length} de 500 caracteres`;
    status.hidden = true;
  };

  service.addEventListener('change', () => {
    if (service.value) setServiceError(false);
    update();
  });
  business.addEventListener('input', update);
  details.addEventListener('input', update);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!service.value) {
      setServiceError(true);
      service.focus();
      return;
    }
    setServiceError(false);
    const url = whatsappUrl(buildMessage());
    fallback.href = url;
    status.hidden = false;
    const opened = window.open(url, '_blank');
    if (opened) opened.opener = null;
  });

  update();
})();
