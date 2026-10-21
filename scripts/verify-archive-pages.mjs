import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = ['resume-showcase.html', 'planning-hub.html', 'tools-skills.html', 'showcase-rune-trace.html', 'showcase-nyangnyangstar.html', 'showcase-project-ut.html', 'showcase-project-bb.html', 'showcase-naringarak.html', 'showcase-exit-value.html', 'ai-portfolio.html', 'writings.html', 'book-reviews.html'];
const read = file => readFileSync(path.join(root, file), 'utf8');
const menus = pages.map(file => {
  const html = read(file);
  assert(!html.includes('\uFFFD'), `${file}: damaged UTF-8`);
  const nav = html.match(/<nav class="nav site-menu"[^>]*>(.*?)<\/nav>/s)?.[1];
  assert(nav, `${file}: missing shared navigation`);
  assert(!nav.includes('tutorial') && !nav.includes('portfoliohub-web'), `${file}: tutorial link remains`);
  return [...nav.matchAll(/href="([^"]+)"[^>]*>(.*?)<\/a>/gs)].map(([, href, text]) => [new URL(href, `https://example.test/${file}`).href, text]);
});
menus.forEach(menu => assert.deepEqual(menu, menus[0]));
assert(menus[0].some(([, text]) => text === 'AI 포트폴리오'));
assert(menus[0].some(([, text]) => text === '글 모음'));
assert(menus[0].some(([, text]) => text === '독후감'));

for (const file of pages.slice(-3)) {
  for (const [, value] of read(file).matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:)/.test(value)) continue;
    const url = new URL(value, `https://example.test/${file}`);
    const target = decodeURIComponent(url.pathname.slice(1));
    assert(existsSync(path.join(root, target)), `${file}: missing ${target}`);
    if (url.hash && target.endsWith('.html')) assert(read(target).includes(`id="${url.hash.slice(1)}"`), `${file}: missing anchor ${value}`);
  }
}

const cards = [...read('ai-portfolio.html').matchAll(/<article class="artwork-card">(.*?)<\/article>/gs)].map(([, html]) => {
  const tags = [...html.match(/<div class="card-tags"[^>]*>(.*?)<\/div>/s)[1].matchAll(/<span>(.*?)<\/span>/g)].map(([, textContent]) => ({ textContent }));
  return { hidden: false, tags, querySelectorAll: () => tags };
});
assert.equal(cards.length, 6);
const buttons = [];
const filters = { hidden: true, append: button => buttons.push(button), querySelectorAll: () => buttons };
const counter = { textContent: '' };
const document = {
  querySelector: selector => ({ '.artwork-grid': { querySelectorAll: () => cards }, '.archive-filters': filters, '.archive-count': counter })[selector],
  createElement: () => ({ dataset: {}, attributes: {}, setAttribute(name, value) { this.attributes[name] = value; }, addEventListener(event, callback) { this[event] = callback; } })
};
vm.runInNewContext(read('js/ai-portfolio.js'), { document });
assert.equal(filters.hidden, false);
assert.equal(buttons.length, 1 + new Set(cards.flatMap(card => card.tags.map(tag => tag.textContent))).size);
for (const button of [...buttons, buttons[0]]) {
  button.click();
  const tag = button.dataset.tag;
  const expected = cards.filter(card => tag === '' || card.tags.some(item => item.textContent === tag));
  assert.deepEqual(cards.filter(card => !card.hidden), expected);
  assert.equal(counter.textContent, `${tag || '전체'} · ${expected.length}개 작품`);
  assert.equal(buttons.filter(item => item.attributes['aria-pressed'] === 'true').length, 1);
  assert.equal(button.attributes['aria-pressed'], 'true');
}
assert(cards.every(card => !card.hidden));
console.log('Passed: 12 shared menus, local assets and anchors, 6 cards, every tag filter and reset.');
