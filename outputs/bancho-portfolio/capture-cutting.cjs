const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(path.join(__dirname, 'assets/cutting-prototype.html')).href);
    const area = await page.locator('#cutArea').boundingBox();
    assert(area, '절단 영역 존재');
    const x = area.x + area.width / 2;
    const top = area.y + 130;
    const bottom = area.y + 250;
    for (let cut = 1; cut <= 3; cut++) {
      await page.mouse.move(x, top);
      await page.mouse.down();
      await page.mouse.move(x, bottom, { steps: 4 });
      await page.mouse.move(x, top, { steps: 4 });
      await page.mouse.move(x, bottom, { steps: 4 });
      await page.mouse.up();
      assert.equal(await page.locator('#completeCount').innerText(), String(cut));
      assert.equal(await page.locator('#releaseCount').innerText(), String(cut));
      assert.equal(await page.locator('.guide.done').count(), cut);
      assert.equal(await page.locator('#qualityStatus').innerText(), '30점');
      await page.waitForTimeout(250);
      // 현재 조작의 안내 문구를 제외한 동일 영역을 캡처해 전후 규칙 비교에 공유한다.
      await page.screenshot({ path: path.join(__dirname, `assets/cutting-step-${cut}.png`), clip: { x: area.x, y: area.y + 30, width: area.width, height: 330 } });
    }
    await page.locator('#resetButton').click();
    await page.mouse.move(x, top);
    await page.mouse.down();
    await page.mouse.move(x, bottom, { steps: 4 });
    for (let cut = 0; cut < 3; cut++) {
      await page.mouse.move(x, top, { steps: 4 });
      await page.mouse.move(x, bottom, { steps: 4 });
    }
    await page.mouse.up();
    assert.equal(await page.locator('#completeCount').innerText(), '3');
    assert.equal(await page.locator('#releaseCount').innerText(), '1');
    console.log(`PASS: 실제 왕복 입력, 절단마다 해제 3회, 계속 누르기 1회. 캡처 ${area.width * 2}x660px 3장.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
