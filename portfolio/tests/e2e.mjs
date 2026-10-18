// Testes de ponta a ponta do portfólio (Playwright + Chromium).
// Uso: npm test   (dentro da pasta portfolio)
// Variável opcional SCREENSHOTS=<pasta> salva capturas de cada largura.
import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium } from 'playwright';
import { createServer } from '../scripts/serve.mjs';

const PHONE = '5519993128050';
const server = createServer();
await new Promise((resolve) => server.listen(0, resolve));
const BASE = `http://localhost:${server.address().port}/`;
const shots = process.env.SCREENSHOTS;

const browser = await chromium.launch();
let failures = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push(`ok   ${name}`);
  } catch (error) {
    failures += 1;
    results.push(
      `FAIL ${name}\n     ${String(error.message).split('\n').join('\n     ')}`,
    );
  }
}

async function newPage(viewport = { width: 1280, height: 800 }, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  // O WhatsApp não é acessado de verdade: a requisição é interceptada.
  await context.route(/https:\/\/(wa\.me|api\.whatsapp\.com)\/.*/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<title>wa</title>',
    }),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      errors.push(`${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  return { context, page, errors };
}

const viewports = [
  {
    name: 'android-360',
    width: 360,
    height: 740,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'android-412',
    width: 412,
    height: 915,
    isMobile: true,
    hasTouch: true,
  },
  {
    name: 'tablet-768',
    width: 768,
    height: 1024,
    isMobile: true,
    hasTouch: true,
  },
  { name: 'notebook-1280', width: 1280, height: 800 },
  { name: 'monitor-1920', width: 1920, height: 1080 },
];

for (const vp of viewports) {
  await test(`layout sem rolagem horizontal e sem erros de console — ${vp.name}`, async () => {
    const { context, page, errors } = await newPage(
      { width: vp.width, height: vp.height },
      { isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch },
    );
    for (const theme of ['dark', 'light']) {
      await page.evaluate(
        (t) => document.documentElement.setAttribute('data-theme', t),
        theme,
      );
      const overflow = await page.evaluate(() => {
        const width = document.documentElement.clientWidth;
        const wide = [...document.querySelectorAll('body *')]
          .filter(
            (n) =>
              n.getBoundingClientRect().right > width + 1 &&
              getComputedStyle(n).position !== 'fixed',
          )
          .map(
            (n) =>
              n.tagName.toLowerCase() +
              (n.className ? `.${String(n.className).split(' ')[0]}` : ''),
          );
        return {
          scroll: document.documentElement.scrollWidth,
          width,
          wide: wide.slice(0, 5),
        };
      });
      assert.ok(
        overflow.scroll <= overflow.width,
        `rolagem horizontal (${theme}): ${JSON.stringify(overflow)}`,
      );
      if (shots)
        await page.screenshot({
          path: path.join(shots, `${vp.name}-${theme}.png`),
          fullPage: true,
        });
    }
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('a, button, select, input, textarea')]
        .filter(
          (n) =>
            n.offsetParent !== null &&
            !n.closest(
              '.preview-box, .form-note, .form-status, .empty-state, .proj-foot, .skip-link',
            ),
        )
        .map((n) => ({
          n: (n.textContent || n.getAttribute('aria-label') || n.id)
            .trim()
            .slice(0, 30),
          h: n.getBoundingClientRect().height,
        }))
        .filter((x) => x.h < 44),
    );
    assert.deepEqual(
      small,
      [],
      `alvos de toque menores que 44px: ${JSON.stringify(small)}`,
    );
    assert.deepEqual(errors, [], 'erros ou avisos no console');
    await context.close();
  });
}

await test('links internos apontam para seções existentes', async () => {
  const { context, page } = await newPage();
  const missing = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((h) => !document.getElementById(h.slice(1))),
  );
  assert.deepEqual(missing, []);
  for (const id of [
    'inicio',
    'projetos',
    'servicos',
    'processo',
    'sobre',
    'contato',
  ]) {
    assert.equal(await page.locator(`section#${id}`).count(), 1, `seção ${id}`);
  }
  await page.click('.nav-links a[href="#contato"]');
  await page.waitForTimeout(800);
  const top = await page.evaluate(
    () => document.getElementById('contato').getBoundingClientRect().top,
  );
  assert.ok(
    top >= 0 && top < 200,
    `seção contato visível após clique (top=${top})`,
  );
  await context.close();
});

await test('links externos são apenas WhatsApp, com número e mensagem codificados', async () => {
  const { context, page } = await newPage();
  const hrefs = await page.$$eval('a[href^="http"]', (as) =>
    as.map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
  );
  assert.ok(hrefs.length >= 2);
  for (const link of hrefs) {
    const url = new URL(link.href);
    assert.equal(
      url.origin + url.pathname,
      `https://wa.me/${PHONE}`,
      link.href,
    );
    assert.equal(link.target, '_blank');
    assert.match(link.rel, /noopener/);
  }
  const quick = new URL(await page.getAttribute('[data-wa-quick]', 'href'));
  assert.equal(
    quick.searchParams.get('text'),
    'Olá, Martins! Vim pelo seu portfólio e gostaria de um orçamento.',
  );
  await context.close();
});

await test('alternância de tema funciona e é lembrada após recarregar', async () => {
  const { context, page } = await newPage(
    { width: 1280, height: 800 },
    { colorScheme: 'dark' },
  );
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  const bgDark = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  await page.click('#theme-toggle');
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  assert.equal(
    await page.getAttribute('#theme-toggle', 'aria-label'),
    'Ativar tema escuro',
  );
  const bgLight = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  assert.notEqual(bgDark, bgLight);
  assert.equal(
    await page.getAttribute('meta[name="theme-color"]', 'content'),
    '#F7F7F9',
  );
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  await page.click('#theme-toggle');
  assert.equal(await page.getAttribute('html', 'data-theme'), 'dark');
  await context.close();
});

await test('tema segue a preferência do sistema na primeira visita', async () => {
  const { context, page } = await newPage(
    { width: 1280, height: 800 },
    { colorScheme: 'light' },
  );
  assert.equal(await page.getAttribute('html', 'data-theme'), 'light');
  await context.close();
});

await test('menu mobile abre, fecha por link, por Escape e mantém aria-expanded', async () => {
  const { context, page } = await newPage(
    { width: 360, height: 740 },
    { isMobile: true, hasTouch: true },
  );
  assert.equal(await page.isVisible('.nav-links'), false);
  assert.equal(await page.isVisible('#menu-toggle'), true);
  assert.equal(await page.isVisible('#mobile-nav'), false);
  await page.tap('#menu-toggle');
  assert.equal(await page.isVisible('#mobile-nav'), true);
  assert.equal(
    await page.getAttribute('#menu-toggle', 'aria-expanded'),
    'true',
  );
  await page.tap('#mobile-nav a[href="#servicos"]');
  assert.equal(await page.isVisible('#mobile-nav'), false);
  assert.equal(
    await page.getAttribute('#menu-toggle', 'aria-expanded'),
    'false',
  );
  await page.tap('#menu-toggle');
  await page.keyboard.press('Escape');
  assert.equal(await page.isVisible('#mobile-nav'), false);
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    'menu-toggle',
  );
  await context.close();
});

await test('filtros de projetos', async () => {
  const { context, page } = await newPage();
  const expected = await page.evaluate(() => {
    const p = window.SITE_CONFIG.projects;
    return {
      todos: p.length,
      sites: p.filter((x) => x.type === 'sites').length,
      sistemas: p.filter((x) => x.type === 'sistemas').length,
    };
  });
  for (const [id, count] of Object.entries(expected)) {
    await page.click(`.filter-btn[data-filter="${id}"]`);
    assert.equal(await page.locator('.proj-card').count(), count, id);
    assert.equal(
      await page.getAttribute(
        `.filter-btn[data-filter="${id}"]`,
        'aria-pressed',
      ),
      'true',
    );
    assert.equal(
      await page.locator('.filter-btn[aria-pressed="true"]').count(),
      1,
    );
  }
  await page.click('.filter-btn[data-filter="todos"]');
  const badges = await page.locator('.proj-card .badge').count();
  assert.equal(
    badges,
    expected.todos,
    'todos os projetos fictícios exibem o selo "Demo fictícia"',
  );
  const deadLinks = await page.locator('.proj-card a:not([href])').count();
  assert.equal(deadLinks, 0);
  await context.close();
});

await test('estado vazio dos projetos', async () => {
  // Serve uma configuração com uma categoria sem projetos.
  const context = await browser.newContext();
  await context.route('**/assets/js/config.js', async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace(
      "{ id: 'sistemas', label: 'Sistemas' },",
      "{ id: 'sistemas', label: 'Sistemas' },\n    { id: 'vazio', label: 'Vazio' },",
    );
    await route.fulfill({ response: res, body });
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  assert.equal(await page.isVisible('#project-empty'), false);
  await page.click('.filter-btn[data-filter="vazio"]');
  assert.equal(await page.locator('.proj-card').count(), 0);
  assert.equal(await page.isVisible('#project-empty'), true);
  assert.equal(await page.textContent('#project-count'), '0 projetos exibidos');
  await page.click('.filter-btn[data-filter="todos"]');
  assert.equal(await page.isVisible('#project-empty'), false);
  await context.close();
});

await test('formulário: valida serviço obrigatório e não abre o WhatsApp sem ele', async () => {
  const { context, page } = await newPage();
  let popups = 0;
  context.on('page', () => {
    popups += 1;
  });
  await page.click('#contact-form button[type="submit"]');
  await page.waitForTimeout(300);
  assert.equal(popups, 0);
  assert.equal(await page.isVisible('#f-service-err'), true);
  assert.equal(await page.getAttribute('#f-service', 'aria-invalid'), 'true');
  assert.equal(
    await page.evaluate(() => document.activeElement.id),
    'f-service',
  );
  await page.selectOption('#f-service', 'Landing page');
  assert.equal(await page.isVisible('#f-service-err'), false);
  assert.equal(await page.getAttribute('#f-service', 'aria-invalid'), null);
  await context.close();
});

await test('formulário: abre o WhatsApp com a mensagem preparada', async () => {
  const { context, page } = await newPage();
  await page.selectOption('#f-service', 'Sistema de agendamento');
  await page.fill('#f-business', '  Studio   Bella  ');
  await page.fill('#f-details', 'Quero agenda online & lembrete #1');
  const expected =
    'Olá, Martins! Vim pelo seu portfólio.\nServiço: Sistema de agendamento\nNegócio: Studio Bella\nDetalhes: Quero agenda online & lembrete #1';
  assert.equal(await page.textContent('#message-preview'), expected);
  assert.equal(
    await page.textContent('#f-details-count'),
    '33 de 500 caracteres',
  );
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.click('#contact-form button[type="submit"]'),
  ]);
  await popup.waitForLoadState();
  const url = new URL(popup.url());
  assert.equal(url.origin + url.pathname, `https://wa.me/${PHONE}`);
  assert.equal(url.searchParams.get('text'), expected);
  assert.equal(await popup.evaluate(() => window.opener), null);
  assert.equal(await page.isVisible('#form-status'), true);
  assert.equal(
    new URL(await page.getAttribute('#wa-fallback', 'href')).searchParams.get(
      'text',
    ),
    expected,
  );
  await context.close();
});

await test('acessibilidade básica: rótulos, nomes acessíveis, idioma, títulos', async () => {
  const { context, page } = await newPage();
  const report = await page.evaluate(() => {
    const unlabeled = [...document.querySelectorAll('input, select, textarea')]
      .filter((f) => !document.querySelector(`label[for="${f.id}"]`))
      .map((f) => f.id);
    const nameless = [...document.querySelectorAll('button, a')]
      .filter((n) => !(n.getAttribute('aria-label') || n.textContent.trim()))
      .map((n) => n.outerHTML.slice(0, 60));
    const h1 = document.querySelectorAll('h1').length;
    const imgsNoAlt = [...document.querySelectorAll('img')].filter(
      (i) => !i.hasAttribute('alt'),
    ).length;
    const ids = [...document.querySelectorAll('[id]')].map((n) => n.id);
    const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
    return {
      unlabeled,
      nameless,
      h1,
      imgsNoAlt,
      dupIds,
      lang: document.documentElement.lang,
      title: document.title,
    };
  });
  assert.deepEqual(report.unlabeled, []);
  assert.deepEqual(report.nameless, []);
  assert.equal(report.h1, 1);
  assert.equal(report.imgsNoAlt, 0);
  assert.deepEqual(report.dupIds, []);
  assert.equal(report.lang, 'pt-BR');
  assert.ok(report.title.includes('Martins'));
  await page.keyboard.press('Tab');
  assert.equal(
    await page.evaluate(() => document.activeElement.className),
    'skip-link',
  );
  await context.close();
});

await test('contraste de texto (WCAG AA) nos dois temas', async () => {
  const { context, page } = await newPage();
  for (const theme of ['dark', 'light']) {
    await page.evaluate(
      (t) => document.documentElement.setAttribute('data-theme', t),
      theme,
    );
    await page.waitForTimeout(400); // aguarda as transições de cor terminarem
    const low = await page.evaluate(() => {
      const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
      const lum = ([r, g, b]) => {
        const f = (v) => {
          const c = v / 255;
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const blend = (top, bottom) => {
        const a = top[3] ?? 1;
        return [0, 1, 2].map((i) => top[i] * a + bottom[i] * (1 - a));
      };
      const bgOf = (node) => {
        const layers = [];
        for (let n = node; n; n = n.parentElement) {
          const c = parse(getComputedStyle(n).backgroundColor);
          if (c.length && (c[3] ?? 1) > 0) {
            layers.push(c);
            if ((c[3] ?? 1) === 1) break;
          }
        }
        let color = parse(getComputedStyle(document.body).backgroundColor);
        for (const layer of layers.reverse()) color = blend(layer, color);
        return color;
      };
      const out = [];
      for (const n of document.querySelectorAll(
        'h1, h2, h3, p, li, a, button, label, span, select, option',
      )) {
        if (
          !n.offsetParent ||
          !n.childNodes.length ||
          ![...n.childNodes].some(
            (c) => c.nodeType === 3 && c.textContent.trim(),
          )
        )
          continue;
        if (n.closest('[aria-hidden="true"]')) continue;
        const st = getComputedStyle(n);
        const fg = blend(parse(st.color), bgOf(n));
        const bg = bgOf(n);
        const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        const ratio = (a + 0.05) / (b + 0.05);
        const large =
          Number.parseFloat(st.fontSize) >= 24 ||
          (Number.parseFloat(st.fontSize) >= 18.66 &&
            Number(st.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5))
          out.push(
            `${n.tagName} "${n.textContent.trim().slice(0, 25)}" ${ratio.toFixed(2)}`,
          );
      }
      return out;
    });
    assert.deepEqual(low, [], `contraste insuficiente (${theme})`);
  }
  await context.close();
});

await test('SEO básico e página 404', async () => {
  const { context, page } = await newPage();
  const meta = await page.evaluate(() => ({
    description: document.querySelector('meta[name="description"]')?.content,
    ogTitle: document.querySelector('meta[property="og:title"]')?.content,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    viewport: document.querySelector('meta[name="viewport"]')?.content,
  }));
  assert.ok(
    meta.description &&
      meta.description.length > 50 &&
      meta.description.length <= 160,
  );
  assert.ok(meta.ogTitle && meta.ogImage && meta.viewport);
  for (const asset of [
    'assets/img/og-image.png',
    'assets/img/favicon.svg',
    'assets/img/apple-touch-icon.png',
    'robots.txt',
  ]) {
    const res = await page.request.get(BASE + asset);
    assert.equal(res.status(), 200, asset);
  }
  const res = await page.request.get(`${BASE}nao-existe`);
  assert.equal(res.status(), 404);
  assert.match(await res.text(), /Página não encontrada/);
  await context.close();
});

await test('fontes auto-hospedadas carregam e não há requisições a terceiros', async () => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const external = [];
  page.on('request', (req) => {
    if (!req.url().startsWith(BASE)) external.push(req.url());
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() =>
    [
      '500 16px "Space Grotesk"',
      '400 16px "DM Sans"',
      '500 13px "JetBrains Mono"',
    ].map((f) => document.fonts.check(f)),
  );
  assert.deepEqual(loaded, [true, true, true]);
  const families = await page.evaluate(() =>
    [...document.fonts]
      .filter((f) => f.status === 'loaded')
      .map((f) => f.family),
  );
  assert.ok(families.length >= 3, `fontes carregadas: ${families}`);
  assert.deepEqual(external, []);
  await context.close();
});

await test('sem texto de template ou placeholder na página', async () => {
  const { context, page } = await newPage();
  const text = await page.evaluate(() => document.body.innerText);
  for (const bad of [
    'lorem',
    'ipsum',
    '[YOUR',
    '[SEU',
    'TODO',
    'undefined',
    'null',
    'NaN',
  ]) {
    assert.ok(!text.includes(bad), `encontrado "${bad}"`);
  }
  await context.close();
});

await browser.close();
server.close();
console.log(results.join('\n'));
console.log(
  `\n${results.length - failures} de ${results.length} testes passaram.`,
);
process.exit(failures ? 1 : 0);
