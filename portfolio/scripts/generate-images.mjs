// Gera as imagens de compartilhamento (Open Graph) e o ícone para iOS.
// Uso: node portfolio/scripts/generate-images.mjs   (requer Playwright)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const imgDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../site/assets/img',
);

const ogHtml = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
body{margin:0;width:1200px;height:630px;background:#0B0B0E;color:#F4F4F6;font-family:'Space Grotesk',sans-serif;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;box-sizing:border-box}
.top{display:flex;align-items:center;gap:18px;font-size:30px;font-weight:600}
.mark{width:60px;height:60px;border-radius:15px;background:#6D4AE8;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700}
.sub{color:#A6A6B3;font-weight:500}
h1{margin:0;font-size:68px;line-height:1.05;letter-spacing:-0.03em;max-width:960px}
.foot{display:flex;justify-content:space-between;font:500 24px 'JetBrains Mono',monospace;color:#A893FF;border-top:1px solid #2A2A33;padding-top:28px}
</style></head><body>
<div class="top"><div class="mark">M</div><div>Martins <span class="sub">| Criação de Sites</span></div></div>
<h1>Sites profissionais e sistemas web para pequenos negócios.</h1>
<div class="foot"><span>Campinas e região · SP</span><span>Orçamento pelo WhatsApp</span></div>
</body></html>`;

const iconHtml = `<!doctype html><html><head><style>
body{margin:0;width:180px;height:180px;background:#6D4AE8;display:flex;align-items:center;justify-content:center}
</style></head><body>
<svg width="120" height="120" viewBox="0 0 64 64"><path d="M17 46V18h6.2L32 31.4 40.8 18H47v28h-6.4V29.2L32 41.6l-8.6-12.4V46z" fill="#fff"/></svg>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(ogHtml, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(imgDir, 'og-image.png') });
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(iconHtml);
await page.screenshot({ path: path.join(imgDir, 'apple-touch-icon.png') });
await browser.close();
console.log('Imagens geradas em', imgDir);
