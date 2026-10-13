const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    async function fresh() {
      await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
      await page.evaluate(() => {
        window.grillingResult = null;
        const frame = document.createElement('iframe');
        frame.name = 'grilling';
        frame.src = 'assets/grilling-prototype.html';
        frame.style.cssText = 'width:1280px;height:900px;border:0;display:block';
        window.addEventListener('message', event => {
          if (event.source === frame.contentWindow && event.data?.action === 'GRILL') window.grillingResult = event.data;
        });
        document.body.replaceChildren(frame);
      });
      await page.frameLocator('iframe').locator('#nextButton').waitFor();
      const frame = page.frame({ name: 'grilling' });
      assert(await frame.locator('#nextButton').isDisabled(), '뒤집기 전 제공 잠금');
      return frame;
    }
    async function serve(frame, success) {
      await frame.locator('#nextButton').click();
      await page.waitForFunction(() => window.grillingResult !== null);
      const result = await page.evaluate(() => window.grillingResult);
      assert.equal(result.success, success);
      assert(await frame.locator('#nextButton').isDisabled(), '제공 후 중복 제공 방지');
      const flips = await frame.locator('#flipCount').innerText();
      await frame.locator('#flipButton').click();
      assert.equal(await frame.locator('#flipCount').innerText(), flips, '제공 후 뒤집기 종료');
      return result;
    }
    let frame = await fresh();
    await frame.locator('#kitchen').focus();
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    assert.equal(await frame.locator('#selectionText').innerText(), '선택: 우상단');
    await page.keyboard.up('w');
    await page.keyboard.up('d');
    await frame.locator('.m3').hover();
    assert.equal(await frame.locator('#selectionText').innerText(), '선택: 우하단');
    await frame.locator('.oil').click();
    assert(await frame.locator('#nextButton').isDisabled(), '한 번 뒤집기는 아직 잠금');
    await frame.locator('.oil').click();
    assert(!(await frame.locator('#nextButton').isDisabled()), '두 번 뒤집으면 제공 가능');
    assert.notEqual(await frame.locator('#cookedCount').innerText(), '8 / 8');
    await serve(frame, false);

    frame = await fresh();
    await frame.waitForFunction(() => document.querySelector('#cookedCount').textContent === '4 / 8', null, { timeout: 7000 });
    for (let index = 0; index < 4; index++) {
      await frame.locator(`.m${index}`).hover();
      await frame.locator('#flipButton').click();
      if (index === 1) {
        assert(!(await frame.locator('#nextButton').isDisabled()));
        assert.equal(await frame.locator('#cookedCount').innerText(), '4 / 8');
        await frame.waitForTimeout(250);
        await frame.locator('.stage').screenshot({ path: path.join(__dirname, 'assets/grilling-preview.png') });
      }
    }
    await frame.waitForFunction(() => document.querySelector('#cookedCount').textContent === '8 / 8', null, { timeout: 7000 });
    assert.equal((await serve(frame, true)).bonus, 0, '보너스 없이도 여덟 면이 익으면 성공');

    frame = await fresh();
    await frame.waitForFunction(() => document.querySelector('#bonus').textContent === '+20', null, { timeout: 12000 });
    assert.equal(await frame.locator('#cookedCount').innerText(), '4 / 8');
    assert(await frame.locator('#nextButton').isDisabled(), '가열 시간만으로 제공 잠금 해제 안 함');
    await frame.locator('#flipButton').click();
    await frame.locator('#flipButton').click();
    assert.equal((await serve(frame, false)).bonus, 20, '보너스가 있어도 미익힌 면이 있으면 실패');
    assert.deepEqual(errors, []);
    console.log('PASS: 대상 선택, 두 번 뒤집기 잠금 해제, 미익힘 실패, 보너스 없는 익힘 성공, 보너스와 성공 분리, 제공 후 입력 종료');
    console.log('검증 범위: 독립 굽기 시제품. 주문 전체의 통합 흐름과 성공/실패별 손님 반응은 미검증.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
