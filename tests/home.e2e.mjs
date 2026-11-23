// Key homepage scenarios (search, menu, anchors, FutureLink, action bar, no horizontal scroll, reduced motion, no JS).
// Uses the studio browser tools (~/.veon/tools, `veon_project.py doctor --install-tools`): nothing is installed in the project.
// Usage: npm run preview, then  node tests/home.e2e.mjs http://localhost:4321/ [shots-dir]
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const tools = path.join(os.homedir(), '.veon', 'tools');
const require = createRequire(path.join(tools, 'package.json'));
const { chromium } = require('playwright');
let chromePath = process.env.CHROME_PATH;
try { chromePath ||= JSON.parse(fs.readFileSync(path.join(os.homedir(), '.veon', 'env.json'), 'utf8')).chrome_path; } catch { /* use Playwright's own browser */ }
const url = process.argv[2] || 'http://localhost:4321/'; const SP = process.argv[3] || os.tmpdir();
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
let failed = 0;
const ok = (name, cond, extra='') => { if (!cond) failed += 1; console.log((cond ? 'PASS ' : 'FAIL ') + name + (cond || !extra ? '' : ' :: ' + extra)); };
const errors = [];
// desktop
let page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => errors.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
ok('h1 single', (await page.evaluate(() => document.querySelectorAll('h1').length)) === 1);
ok('h1 text', (await page.evaluate(() => document.querySelector('h1').innerText)).trim() === 'Оригінальні запчастини Mitsubishi в наявності — склади в Києві та Дніпрі');
const ids = await page.$$eval('main > section', s => s.map(x => x.id).join(','));
ok('sections order', ids === 'hero,models,stock,catalog,order,wholesale,delivery,about,contacts', ids);
const hrefs = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')));
const bad = hrefs.filter(h => !(h.startsWith('#') || h.startsWith('tel:') || h.startsWith('mailto:') || h.startsWith('viber:')));
ok('only anchors/tel/mailto/viber', bad.length === 0, bad.join(' '));
const anchors = hrefs.filter(h => h.startsWith('#'));
const missing = [];
for (const a of new Set(anchors)) if (a !== '#' && !(await page.$(a))) missing.push(a);
ok('anchors resolve', missing.length === 0 && !anchors.includes('#'), missing.join(' '));
ok('no link to the client domain', !hrefs.some(h => /^(https?:)?\/\/([\w-]+\.)*911auto\.com\.ua/i.test(h)));
await page.fill('#part-search', 'MD050135');
await page.waitForTimeout(400);
ok('search by partNo', (await page.locator('.search-results__item').count()) >= 1, await page.locator('.search-results').innerText());
await page.fill('#part-search', 'свічка');
await page.waitForTimeout(400);
ok('search by name', (await page.locator('.search-results__item').first().innerText()).includes('Свічка'));
await page.fill('#part-search', 'zzzqqq');
await page.waitForTimeout(400);
ok('search empty state has tel', (await page.locator('.search-results a[href^="tel:"]').count()) === 1);
await page.fill('#part-search', '');
await page.click('[data-quick-model="Outlander"]');
await page.waitForTimeout(300);
ok('chip fills search', (await page.inputValue('#part-search')) === 'Outlander' && (await page.locator('.search-results__item').count()) >= 1);
const status = await page.locator('[data-ship-status]').innerText();
ok('clock status text', status.length > 10, status);
await page.locator('#stock').scrollIntoViewIfNeeded(); await page.evaluate(() => document.querySelector('#part-mn119500').scrollIntoView({block:'center'}));
await page.waitForTimeout(900);
ok('matrix filled', (await page.locator('.matrix.is-filled').count()) >= 1);
const fl = page.locator('.future-link').first(); await page.keyboard.press('Escape'); await fl.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(300);
ok('future link tooltip on focus', (await fl.locator('.future-link__note').evaluate(n => getComputedStyle(n).opacity)) === '1');
ok('future link aria-disabled', (await fl.getAttribute('aria-disabled')) === 'true');
await page.click('.site-nav a[href="#contacts"]'); await page.waitForTimeout(1200);
const top = await page.evaluate(() => document.querySelector('#contacts').getBoundingClientRect().top);
ok('anchor scroll under header', top >= 60 && top < 140, String(top));
await page.close();
// mobile
page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
page.on('pageerror', e => errors.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
const bar = page.locator('[data-action-bar]');
ok('bar hidden at top', await bar.evaluate(b => b.classList.contains('is-armed') && !b.classList.contains('is-shown')));
await page.evaluate(() => window.scrollTo(0, 1600)); await page.waitForTimeout(600);
ok('bar shown after hero', await bar.evaluate(b => b.classList.contains('is-shown')));
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
await page.click('.menu__toggle'); await page.waitForTimeout(200);
ok('menu opens', await page.locator('[data-menu]').evaluate(d => d.open));
await page.click('.menu__link[href="#stock"]'); await page.waitForTimeout(1000);
ok('menu closes on anchor', !(await page.locator('[data-menu]').evaluate(d => d.open)));
for (const w of [320, 375, 768, 1024, 1280, 1440]) {
  await page.setViewportSize({ width: w, height: 800 }); await page.waitForTimeout(200);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok('no h-scroll ' + w, sw <= w, String(sw));
}
await page.close();
// reduced motion + no js
page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await page.goto(url, { waitUntil: 'networkidle' });
ok('reduced: matrix filled at once', (await page.locator('.matrix.is-filled').count()) === 4);
await page.close();
page = await browser.newPage({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
await page.goto(url, { waitUntil: 'networkidle' });
const vis = await page.evaluate(() => [...document.querySelectorAll('.mark, .part-search__hint')].filter(e => getComputedStyle(e).display !== 'none').every(e => getComputedStyle(e).opacity === '1'));
ok('no-js: marks and hint visible', vis);
await page.close();
ok('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
console.log(failed ? `RESULT: FAIL (${failed})` : 'RESULT: PASS');
process.exit(failed ? 1 : 0);
