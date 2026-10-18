# Martins | Criação de Sites — Portfólio

Site de apresentação dos serviços de criação de sites e sistemas web para pequenos negócios de Campinas e região.

O site é **estático**: HTML, CSS e JavaScript puros. Não tem framework, etapa de build nem dependências em produção. O peso total é de cerca de 270 KB, incluindo fontes e imagens.

> Esta pasta é independente do restante do repositório (a documentação do Spicetify, que é o projeto original do fork). Nada fora de `portfolio/` é usado ou alterado pelo portfólio.

## Estrutura

```
portfolio/
├── site/                       ← pasta publicada (raiz do site)
│   ├── index.html              ← página única: início, projetos, serviços, processo, sobre, contato
│   ├── 404.html                ← página de erro
│   ├── robots.txt
│   └── assets/
│       ├── css/styles.css      ← tokens de design (cores, tipografia, espaços) + estilos
│       ├── js/config.js        ← CONFIGURAÇÃO EDITÁVEL: WhatsApp, serviços, projetos
│       ├── js/theme-init.js    ← aplica o tema antes da pintura (evita "piscar")
│       ├── js/main.js          ← tema, menu mobile, filtros, formulário do WhatsApp
│       ├── fonts/              ← fontes auto-hospedadas (SIL OFL)
│       └── img/                ← favicon, ícone iOS, imagem de compartilhamento
├── design/Main.dc.html         ← referência visual aprovada (não é código de produção)
├── scripts/serve.mjs           ← servidor local sem dependências
├── scripts/generate-images.mjs ← gera og-image.png e apple-touch-icon.png
├── tests/e2e.mjs               ← testes automatizados (Playwright)
├── netlify.toml                ← publicação + cabeçalhos de segurança
└── package.json
```

## Executar localmente

Requisito: Node.js 18 ou superior.

```bash
cd portfolio
npm start            # http://localhost:8080
```

Também funciona com qualquer servidor estático apontando para `portfolio/site`. Por exemplo: `npx serve portfolio/site`.

## Testes

```bash
cd portfolio
npm install          # instala apenas o Playwright (dependência de desenvolvimento)
npx playwright install chromium   # se o Chromium ainda não estiver instalado
npm test
```

Para salvar capturas de tela de cada largura testada: `SCREENSHOTS=./capturas npm test` (a pasta precisa existir).

O que os testes verificam:

| Área | Verificação |
|---|---|
| Layout | Ausência de rolagem horizontal em 360, 412, 768, 1280 e 1920 px, nos temas claro e escuro |
| Console | Nenhum erro ou aviso, incluindo violações da Content-Security-Policy da produção |
| Toque | Alvos interativos com pelo menos 44 px de altura |
| Navegação | Todos os links `#` apontam para seções existentes; o clique leva à seção |
| WhatsApp | Todo link externo é `wa.me/5519993128050`, abre em nova aba com `noopener` e leva a mensagem codificada |
| Tema | Alternância, troca de `theme-color`, preferência salva após recarregar, respeito ao tema do sistema |
| Menu mobile | Abre, fecha ao tocar num link e com Esc, mantém `aria-expanded` e devolve o foco |
| Projetos | Filtros, `aria-pressed`, selo "Demo fictícia", estado vazio |
| Formulário | Serviço obrigatório (erro, `aria-invalid`, foco); mensagem final exata, inclusive com `&` e `#` |
| Acessibilidade | Rótulos, nomes acessíveis, um único `h1`, IDs únicos, link "Pular para o conteúdo" |
| Contraste | Todo texto visível dentro do WCAG AA, nos dois temas |
| SEO | Metadados, imagens, `robots.txt` e resposta 404 |
| Fontes | Carregam do próprio site, sem requisições a terceiros |
| Conteúdo | Ausência de textos de template ("lorem", "TODO", "undefined"...) |

## Alterar o WhatsApp

Edite `site/assets/js/config.js`:

```js
whatsapp: '5519993128050',            // só dígitos: 55 + DDD + número
whatsappDisplay: '+55 19 99312-8050', // como aparece na tela
```

O `index.html` também tem o número nos `href` dos links. Ele só é usado se o JavaScript não carregar. Ao trocar o número, troque também essas ocorrências:

```bash
grep -rn 5519993128050 portfolio/site
```

Depois rode `npm test`. Os testes verificam o número em `tests/e2e.mjs` (constante `PHONE`), então atualize essa constante também.

## Adicionar ou atualizar um projeto

Em `site/assets/js/config.js`, adicione um item à lista `projects`:

```js
{
  id: 'meu-projeto',              // único, sem espaços
  type: 'sites',                  // 'sites' ou 'sistemas' (ver "categories")
  name: 'Nome do projeto',
  category: 'Segmento · Tipo',
  tint: '#38BDF8',                // cor de destaque da miniatura
  problem: 'Qual problema o projeto resolve.',
  features: ['Funcionalidade 1', 'Funcionalidade 2', 'Funcionalidade 3'],
  status: 'Demonstração publicada',
  statusTone: 'live',             // 'live' (ponto verde) ou 'progress' (ponto amarelo)
  demoUrl: 'https://exemplo.netlify.app', // null = nenhum botão é exibido
  fictional: true,                // exibe o selo "Demo fictícia"
}
```

Regras:
- O botão "Ver demonstração" só aparece quando `demoUrl` começa com `https://` ou `/`. Não preencha esse campo com links que não funcionem.
- Uma nova categoria é criada adicionando `{ id, label }` em `categories`. Categorias sem projetos mostram uma mensagem de estado vazio.
- Os textos são inseridos com `textContent`, então HTML colado na configuração não é executado.

## Publicar no Netlify

1. Em **Add new site → Import an existing project**, escolha este repositório e a branch desejada.
2. Configure:
   - **Base directory:** `portfolio`
   - **Build command:** deixe em branco
   - **Publish directory:** `portfolio/site`. O Netlify mostra o caminho completo; o `netlify.toml` já define `publish = "site"` relativo à base.
3. Faça o deploy. Os cabeçalhos de segurança e de cache vêm do `netlify.toml`.

Em outra hospedagem estática (Vercel, GitHub Pages, Cloudflare Pages), publique o conteúdo de `portfolio/site`. Nesse caso, os cabeçalhos do `netlify.toml` precisam ser recriados na configuração dessa plataforma.

### Depois de definir o domínio (pendente)

Algumas tags de SEO exigem o endereço final do site, que ainda não foi definido. Com o domínio em mãos:

1. Troque `content="assets/img/og-image.png"` por uma URL absoluta, como `https://SEU-DOMINIO/assets/img/og-image.png`. WhatsApp, Facebook e LinkedIn exigem URL absoluta para mostrar a imagem de prévia.
2. Adicione `<link rel="canonical" href="https://SEU-DOMINIO/">` e `<meta property="og:url" content="https://SEU-DOMINIO/">` no `<head>` do `index.html`.
3. Crie `site/sitemap.xml` com a URL da página e adicione `Sitemap: https://SEU-DOMINIO/sitemap.xml` ao `robots.txt`.

## Decisões técnicas

- **Sem framework.** É uma página única de conteúdo; HTML, CSS e JS puros garantem carregamento rápido e manutenção simples.
- **Fontes auto-hospedadas** (Space Grotesk, DM Sans, JetBrains Mono). Eliminam a requisição ao Google Fonts, que bloqueava a renderização, e não enviam o IP do visitante a terceiros.
- **Content-Security-Policy restrita** (`script-src 'self'`, sem scripts inline). O tema inicial fica em `theme-init.js` por esse motivo.
- **Tema:** escuro por padrão. Na primeira visita segue a preferência do sistema; depois, a escolha do visitante fica salva no `localStorage`. Se o armazenamento estiver bloqueado, o site continua funcionando sem lembrar a escolha.
- **Contato:** o site não envia mensagens. Ele monta a URL `https://wa.me/<número>?text=<mensagem codificada>` e abre o WhatsApp, onde o visitante revisa e envia. Se o navegador bloquear a nova aba, aparece um link para continuar.
- **Nenhum dado pessoal é armazenado ou enviado** a servidores do site.

## Resultados medidos

Lighthouse 12, perfil mobile, servidor local sem compressão:

| Desempenho | Acessibilidade | Boas práticas | SEO |
|---|---|---|---|
| 99 | 100 | 100 | 100 |

LCP 2,1 s, CLS 0, TBT 0 ms. Os avisos restantes, compressão e cache, são resolvidos pela hospedagem: o Netlify comprime automaticamente e o cache está no `netlify.toml`.

## Limitações conhecidas

- **Nenhuma demonstração está publicada ainda.** Todos os projetos aparecem como "Demonstração em preparação" e sem botão. Atualize `status` e `demoUrl` em `config.js` à medida que cada demo for ao ar.
- **SEO dependente do domínio:** canonical, `og:url`, URL absoluta da imagem e sitemap. Ver "Depois de definir o domínio".
- **Testes em aparelhos reais não foram feitos.** As validações usaram o Chromium em modo mobile, com emulação de toque; não foram testados Safari/iOS nem Firefox.
- **A abertura do WhatsApp foi testada com a requisição interceptada:** URL, número e texto conferidos, sem abrir o app real.
