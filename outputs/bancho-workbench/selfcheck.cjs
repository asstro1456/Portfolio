'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const app = require('./app.js');

// Mechanical asset encoding keeps file:// exports independent of fetch and leaves source images intact.
if (process.argv.includes('--build-assets')) {
  const read = name => fs.readFileSync(path.join(__dirname, name));
  const assets = {
    gameplay: 'data:image/png;base64,' + read('assets/bancho-gameplay.png').toString('base64'),
    personal: 'data:image/jpeg;base64,' + read('assets/personal-butadon.jpg').toString('base64'),
    exportCSS: read('styles.css').toString('utf8')
  };
  fs.writeFileSync(path.join(__dirname, 'assets.js'), 'window.BANCHO_ASSETS = ' + JSON.stringify(assets) + ';\n', 'utf8');
}
const original = app.initialState();
assert.deepEqual(app.validateState(original), original);
assert.equal(original.items.length, 4);
assert.deepEqual(original.items.map(item => item.type), ['title', 'photo', 'steps', 'table']);
assert.equal(original.items[2].h, 342);
assert.equal(original.items[3].h, 342);
assert.equal(app.makeItem('beforeafter', 'compare-check').h, 220);
assert.equal(app.makeItem('beforeafter', 'compare-check').w, 544);
for (const item of original.items) {
  assert(item.x >= 0 && item.y >= 0 && item.x + item.w <= 1280 && item.y + item.h <= 900);
  for (const other of original.items) {
    if (item === other) continue;
    assert(item.x + item.w <= other.x || other.x + other.w <= item.x || item.y + item.h <= other.y || other.y + other.h <= item.y, 'Default components must not overlap');
  }
}
const moved = app.constrain({ ...original.items[0], x: -999, y: 10000, w: 2000, h: -1, fontScale: 99 });
assert.equal(moved.x, 0); assert.equal(moved.w, 1280); assert.equal(moved.y + moved.h, 900); assert.equal(moved.fontScale, 1.5);
for (const mutate of [
  state => { state.version = 99; }, state => { state.items[0].x = Infinity; },
  state => { state.items[0].id = '<script>'; }, state => { state.items[1].id = state.items[0].id; },
  state => { state.items[0].type = '__proto__'; }, state => { state.items[0].text.headline = 7; },
  state => { state.items[1].imageData = 'javascript:alert(1)'; },
  state => { state.items[1].imageData = 'data:image/svg+xml;base64,PHN2Zz4='; },
  state => { state.items[1].imageKey = 'https://example.com/image.png'; },
  state => { state.items[1].fit = 'invalid'; }
]) {
  const state = structuredClone(original); mutate(state); assert.equal(app.validateState(state), null);
}
assert.equal(app.validImageData('data:image/png;base64,aGVsbG8='), true);
assert.equal(app.validImageData('data:image/png;base64,' + 'A'.repeat(7_000_000)), false);
const edited = structuredClone(original); edited.items[0].text.headline = '<img src=x onerror=alert(1)>\n새 제목';
assert.equal(app.validateState(edited).items[0].text.headline, edited.items[0].text.headline);
assert.deepEqual(app.validateState({ version: 1, items: [] }), { version: 1, items: [] });
const assetsContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'assets.js'), 'utf8'), assetsContext);
assert(assetsContext.window.BANCHO_ASSETS.gameplay.startsWith('data:image/png;base64,'));
assert(assetsContext.window.BANCHO_ASSETS.personal.startsWith('data:image/jpeg;base64,'));
assert(assetsContext.window.BANCHO_ASSETS.exportCSS.includes('.rules-table'));
assert.equal(assetsContext.window.BANCHO_ASSETS.exportCSS, fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8'));
assert(assetsContext.window.BANCHO_ASSETS.exportCSS.includes('.component [contenteditable]{'));
const html = app.exportDocument('<article class="sheet"><p>&lt;script&gt; edited text</p></article>', assetsContext.window.BANCHO_ASSETS.exportCSS);
assert(html.includes('edited text')); assert(html.includes('<style>')); assert(html.includes('@media print'));
assert(!html.includes('<link ')); assert(!html.includes('<script src=')); assert(!html.includes('class="inspector"'));
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]; new vm.Script(script);
new vm.Script(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'));
console.log('PASS: schema, image guard, bounds, initial geometry, edited text, offline assets, export structure and JavaScript syntax');

// Functional DOM checks only. The main agent owns viewport and visual review.
if (process.argv.includes('--browser')) {
  (async () => {
    const { chromium } = require('playwright');
    const { pathToFileURL } = require('node:url');
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
      await page.waitForFunction(() => document.querySelectorAll('.component').length === 4);
      assert.equal(await page.locator('.sheet img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
      await page.locator('.component-title').click();
      const hostile = '<img src=x onerror=alert(1)> 새 제목';
      await page.locator('[data-edit-key="headline"]').fill(hostile);
      assert.equal(await page.locator('.title-headline').textContent(), hostile);
      assert.equal(await page.locator('.title-headline img').count(), 0);
      await page.locator('#posX').fill('67'); await page.locator('#posX').press('Tab');
      await page.waitForTimeout(550);
      await page.reload();
      assert.equal(await page.locator('.title-headline').textContent(), hostile);
      assert.equal(await page.locator('.component-title').evaluate(node => node.style.left), '67px');
      await page.locator('.component-title').click();
      await page.locator('#duplicateSelected').click();
      assert.equal(await page.locator('.component').count(), 5);
      await page.locator('#deleteSelected').click();
      assert.equal(await page.locator('.component').count(), 4);
      await page.locator('#undoDelete').click();
      assert.equal(await page.locator('.component').count(), 5);
      const downloadEvent = page.waitForEvent('download'); await page.locator('#exportButton').click();
      const download = await downloadEvent; const stream = await download.createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      const exported = Buffer.concat(chunks).toString('utf8');
      assert(exported.includes('&lt;img src=x onerror=alert(1)&gt; 새 제목'));
      assert(exported.includes('data:image/png;base64,'));
      assert(!/<[^>]+\scontenteditable=/.test(exported)); assert(!exported.includes('class="move-handle"'));
      assert(!exported.includes('class="resize-handle"')); assert(!exported.includes('data-field='));
      assert(!exported.includes('assets/bancho-gameplay.png')); assert(!exported.includes('<link '));
      const exportedPage = await browser.newPage(); await exportedPage.setContent(exported);
      assert.equal(await exportedPage.locator('.component').count(), 5);
      assert.equal(await exportedPage.locator('.title-headline').first().textContent(), hostile);
      assert.equal(await exportedPage.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
      assert.deepEqual(errors, []);
      console.log('PASS: DOM edit injection guard, geometry edit, autosave reload, duplicate/delete/undo, embedded HTML download and re-open');
    } finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
