const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const html = read('index.html');
const css = read('portfolio.css');
assert.match(html, /^<!doctype html>/i);
assert.match(html, /<html lang="ko">/);
assert.match(html, /name="viewport"/);
assert.equal((html.match(/<h1\b/g) || []).length, 1, '하나의 주제 제목');
assert(!/[·•]/.test(html), '장식용 가운데점 없음');
assert(!/<script\b/i.test(html), '읽기 페이지에 JavaScript 불필요');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, '중복 ID 없음');
for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  const target = match[1];
  if (target.startsWith('#')) {
    assert(target.length > 1 && ids.includes(target.slice(1)), `실제 본문 링크: ${target}`);
  } else if (target.startsWith('https://')) {
    assert([
      'https://store.steampowered.com/app/3596430/Bancho_the_Chef/',
      'https://docs.google.com/spreadsheets/d/1zgguZpGnSP66WFeZkUVBytiftn9X3lFsCjNIPC4utvw/edit'
    ].includes(target), `대조한 원본 링크만 허용: ${target}`);
  } else {
    assert(!/^(?:[a-z]+:|\/)/i.test(target), `로컬 상대 경로: ${target}`);
    assert(fs.existsSync(path.join(__dirname, target)), `파일 존재: ${target}`);
  }
}
const images = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
assert.equal(images.length, 9, '기존 자산 8장과 실제 굽기 상태 캡처');
assert(!/project-meta/.test(html + css), '기획서 상단 프로젝트 메타정보 제거');
assert(!/meat-shape|cut-line|release-gap/.test(html + css), '설명용 도형을 실제 캡처로 교체');
for (let cut = 1; cut <= 3; cut++) assert.match(html, new RegExp(`assets/cutting-step-${cut}\\.png`));
for (const tag of images) assert.match(tag, /\balt="[^"]+"/, '모든 사진 설명');
assert.match(html, /assets\/cutting-preview\.png/, '실제 시제품 화면 사용');
const sectionIds = ['motivation', 'cooking', 'scope', 'revision', 'grilling', 'data', 'resources', 'references'];
const sections = sectionIds.map(id => html.indexOf(`id="${id}"`));
assert(sections.every((offset, index) => offset >= 0 && (!index || offset > sections[index - 1])), '지원 동기, 적합성, 설계 범위, 조작 수정 순서');
assert.match(html, /target="_blank" rel="noopener" aria-label="자르기 시제품 열기 \(새 탭\)"/);
assert.match(html, /실제로 칼질을 하는 것처럼 조작을 구현해보니/);
assert.match(html, /다음 조작 테스트에서는/);
assert.match(html, /현재 방식에 한정하지 않고/);
assert(!/고려해야 합니다|바꿀 수도 있습니다/.test(html), '검증 계획을 막연한 유보로 바꾸지 않음');
assert.match(html, /원작 개발 참여 이력이 아닙니다/);
assert(!html.includes('\uFFFD'), '한글 대체 문자 없음');
assert.match(html, /MENU_DONTEKI/);
assert.match(html, /MR_DONTEKI_PREP/);
assert.match(html, /ING_PORK/);
assert.match(html, /LocalizedTextID/);
assert(!/@import|https?:\/\//i.test(css), '외부 폰트 및 자산 요청 없음');
for (const [, target] of css.matchAll(/url\(['"]?([^'"\s)]+)['"]?\)/g)) {
  assert(target.startsWith('assets/fonts/'), '폰트는 동봉한 상대 경로 사용');
  assert(fs.existsSync(path.join(__dirname, target)), `폰트 파일 존재: ${target}`);
}
assert.match(css, /@font-face/);
assert.match(css, /font-synthesis:\s*none/);
assert.equal(fs.readFileSync(path.join(__dirname, 'assets/fonts/PretendardVariable.woff2')).toString('ascii', 0, 4), 'wOF2');
for (const weight of ['Bold', 'Medium']) assert.equal(fs.readFileSync(path.join(__dirname, `assets/fonts/GmarketSans${weight}.otf`)).toString('ascii', 0, 4), 'OTTO');
assert.match(read('assets/fonts/OFL.txt'), /SIL OPEN FONT LICENSE/);
assert.match(read('assets/fonts/GmarketSans-LICENSE.txt'), /SIL Open Font License/);
assert(!/animation:\s*(?!none\b)|transform:\s*scale|(?:^|[;{])\s*height:\s*\d+(?:d?vh|px)/i.test(css.replace(/height:\s*(?:3|4|14)px/g, '').replace(/animation:\s*none\s*!important/g, '')), '입력 트랙의 선과 눈금 외 고정 캔버스와 불필요한 애니메이션 없음');
assert.match(css, /@media \(max-width: 760px\)/);
assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, 'CSS 중괄호 균형');

const copied = [
  ['assets/bancho-gameplay.png', '../bancho-workbench/assets/bancho-gameplay.png'],
  ['assets/personal-butadon.jpg', 'D:/OneDrive/OneDrive/사진/Camera imports/2026-09-07/20230223_120153.jpg'],
  ['assets/personal-apple-pie.jpg', 'D:/OneDrive/OneDrive/사진/Camera imports/2026-09-07/20220920_154506.jpg'],
  ['assets/personal-cookies.jpg', 'D:/OneDrive/OneDrive/사진/Camera imports/2026-09-07/20230707_084601.jpg'],
  ['assets/cutting-prototype.html', '../../assets/prototypes/bancho-reciprocal-cut-prototype.html'],
  ['assets/grilling-prototype.html', '../../assets/prototypes/bancho-tongs-grill-prototype.html']
];
const digest = filename => crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
for (const [copy, source] of copied) {
  const original = path.resolve(__dirname, source);
  if (fs.existsSync(original)) assert.equal(digest(path.join(__dirname, copy)), digest(original), `원본 그대로 복사: ${copy}`);
}

for (const filename of ['assets/cutting-prototype.html', 'assets/grilling-prototype.html']) {
  const prototype = read(filename);
  assert(!/\b(?:src|href)="(?:https?:|\/)/i.test(prototype), '시제품 외부 자산 없음');
  for (const match of prototype.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const result = spawnSync(process.execPath, ['--check', '--input-type=commonjs'], { input: match[1], encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  }
}
console.log('PASS: 본문 순서, 메타정보 제거, 실제 링크, 자산 9장, 원본 복사 일치, 동봉 폰트와 라이선스, CSS 기본 구조, 시제품 JavaScript 구문');
if (!process.argv.includes('--browser')) console.log('브라우저 검증은 --browser 옵션으로 실행합니다.');

if (process.argv.includes('--browser')) {
  const { chromium } = require('playwright');
  const { pathToFileURL } = require('node:url');
  (async () => {
    const browser = await chromium.launch({ headless: true });
    const errors = [];
    try {
      const page = await browser.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      const output = path.resolve(__dirname, '../../output/playwright');
      fs.mkdirSync(output, { recursive: true });
      await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
      await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      await page.evaluate(() => Promise.all([...document.images].map(image => image.decode())));
      await page.evaluate(() => document.fonts.ready);
      assert(await page.evaluate(() => document.fonts.check('18px "Bancho Pretendard"')), '로컬 폰트 로드');
      assert.equal(await page.evaluate(() => [...document.fonts].filter(font => font.family === 'Bancho Gmarket Sans' && font.status === 'loaded').length), 2, '제목 전용 Medium/Bold 실제 로드');
      for (const selector of ['h1', 'h2', '.case-title']) {
        assert.match(await page.locator(selector).first().evaluate(node => getComputedStyle(node).fontFamily), /^"Bancho Gmarket Sans"/, '제목 글꼴 적용');
      }
      assert.match(await page.locator('.introduction').evaluate(node => getComputedStyle(node).fontFamily), /^"Bancho Pretendard"/, '본문 글꼴 유지');
      assert.equal(await page.locator('nav a').count(), sectionIds.length, '각 본문 섹션으로 이동하는 목차');
      assert.equal(await page.locator('#revision .spec-table tbody tr').count(), 8, '자르기 상세 규칙 8항목');
      assert.equal(await page.locator('.data-sample tbody tr').count(), 6, '원본 데이터 연결 예시 6개');
      assert.equal(await page.locator('.resource-table tbody tr').count(), 12, '리소스 요구사항 12항목');
      assert.match(await page.locator('#data-sample-note').innerText(), /동기화되지 않았습니다/);
      assert(await page.locator('table').evaluateAll(tables => tables.every(table =>
        table.querySelector('caption') && table.querySelectorAll('thead th[scope="col"]').length >= 2 &&
        [...table.querySelectorAll('tbody tr')].every(row => row.querySelector('th[scope="row"]'))
      )), '모든 표에 제목과 열/행 머리글 제공');
      assert(await page.locator('#main p strong, #main dd strong').evaluateAll(nodes => {
        const copy = nodes.filter(node => !node.closest('.input-comparison, #grilling, #data, #resources, #references, .cutting-spec'));
        return copy.length >= 3 && copy.length <= 8 && copy.every(node => getComputedStyle(node).fontWeight === '700');
      }), '본문 볼드는 소수의 결정 내용에 한정');
      assert(await page.locator('.case-title').evaluate(node => node.nextElementSibling.classList.contains('input-comparison')), '비교 도식은 사례 제목 바로 아래');
      assert.deepEqual(await page.locator('#scope .process-flow .process-name').allTextContents(), ['준비', '자르기', '굽기', '서빙'], '공정 흐름 순서');
      assert.deepEqual(await page.locator('#scope .process-flow .process-mode').allTextContents(), ['자동 처리', '직접 조작', '직접 조작', '자동 처리'], '개인 설계의 자동과 직접 조작 구분');
      assert.equal(await page.locator('.grilling-rules tbody tr').count(), 6, '굽기 규칙 6항목');
      assert.equal(await page.locator('.grilling-rules th[scope="col"]').count(), 2, '접근 가능한 규칙표 열 제목');
      assert.equal(await page.locator('.serve-flow > li').count(), 5, '제공과 성공 판정의 다섯 단계');
      assert.match(await page.locator('.serve-flow').innerText(), /성공을 보장하지 않음/);
      assert.match(await page.locator('#grilling-values-note').innerText(), /임시 값/);
      for (const step of [1, 2]) {
        assert.match(await page.locator(`.before.step-${step}`).innerText(), /계속 누름/);
        assert.match(await page.locator(`.after.step-${step}`).innerText(), /놓아도 됨/);
      }
      for (const width of [1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(() => window.scrollTo(0, 0));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px 가로 넘침 없음`);
        const overflowing = await page.locator('h1,h2,h3,p,dd,li,table,th,td,.process-name,.process-mode,figcaption,a,img,svg').evaluateAll(nodes => nodes.filter(node => {
          if (node.classList.contains('skip-link')) return false;
          const r = node.getBoundingClientRect();
          // 공정 사이 화살표는 li 밖의 간격에 표시되므로 글자 요소를 별도로 검사한다.
          return r.width && (r.left < -1 || r.right > innerWidth + 1 || node.tagName !== 'LI' && node.scrollWidth > node.clientWidth + 2 && getComputedStyle(node).display !== 'inline');
        }).map(node => node.tagName + ':' + node.className));
        assert.deepEqual(overflowing, [], `${width}px 개별 요소 잘림 없음`);
        if (width <= 600) {
          assert(await page.locator('.data-sample tbody tr > *, .resource-table tbody tr > *').evaluateAll(cells =>
            cells.every(cell => Math.abs(cell.getBoundingClientRect().width - cell.parentElement.getBoundingClientRect().width) < 2)
          ), '모바일 표의 각 항목은 전체 폭으로 읽힘');
        }
        assert(await page.locator('.press-end strong').evaluateAll(nodes => nodes.length === 6 && nodes.every(node => {
          const style = getComputedStyle(node);
          return parseFloat(style.fontSize) >= 18 && style.fontWeight === '700';
        })), '모바일에서도 누름과 해제 조건을 큰 볼드로 표시');
        const steps = await page.locator('.comparison-screen').evaluateAll(screens => screens.map(screen => {
          const step = [...screen.classList].find(name => /^step-/.test(name));
          const rect = node => { const box = node.getBoundingClientRect(); return { x: box.x, y: box.y, bottom: box.bottom, width: box.width }; };
          return { screen: rect(screen), before: rect(document.querySelector(`.before.${step}`)), after: rect(document.querySelector(`.after.${step}`)) };
        }));
        assert.equal(steps.length, 3, '세 절단 단계의 캡처와 전후 트랙');
        for (const [index, step] of steps.entries()) {
          assert(Math.abs(step.screen.x - step.before.x) < 1 && Math.abs(step.screen.x - step.after.x) < 1, '캡처와 입력 트랙 가로 정렬');
          assert(step.screen.bottom <= step.before.y && step.before.bottom <= step.after.y, '캡처 아래 전후 입력 규칙 배치');
          if (width <= 760 && index < steps.length - 1) assert(step.after.bottom <= steps[index + 1].screen.y, '모바일에서 단계별 캡처와 전후 비교 연결');
        }
        if (width === 1440 || width === 390) {
          await page.locator('.input-comparison').screenshot({ path: path.join(output, `bancho-comparison-${width}.png`) });
          await page.locator('#scope .process-flow').screenshot({ path: path.join(output, `bancho-process-${width}.png`) });
          await page.locator('#grilling').screenshot({ path: path.join(output, `bancho-grilling-${width}.png`) });
          for (const id of ['data', 'resources', 'references']) {
            await page.locator(`#${id}`).screenshot({ path: path.join(output, `bancho-${id}-${width}.png`) });
          }
          if (width === 390) await page.locator('.grilling-rules').screenshot({ path: path.join(output, 'bancho-grill-table-mobile.png') });
          if (width === 390) {
            await page.locator('.data-sample tbody tr').nth(3).screenshot({ path: path.join(output, 'bancho-data-row-mobile.png') });
            await page.locator('.resource-table tbody tr').first().screenshot({ path: path.join(output, 'bancho-resource-row-mobile.png') });
            await page.locator('#revision .spec-table').screenshot({ path: path.join(output, 'bancho-cutting-rules-mobile.png') });
          }
        }
        const stages = await page.locator('#scope .process-flow > li').evaluateAll(nodes => nodes.map(node => {
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, bottom: rect.bottom, right: rect.right };
        }));
        assert.equal(stages.length, 4);
        for (let index = 1; index < stages.length; index++) {
          assert(width <= 760 ? stages[index - 1].bottom <= stages[index].y : stages[index - 1].right <= stages[index].x, '화면 폭에 맞는 공정 순서');
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: path.join(output, `bancho-refined-${width}.png`), fullPage: true });
        if (width === 1440) {
          await page.screenshot({ path: path.join(output, 'bancho-refined-cover.png') });
          for (const id of ['scope', 'revision', 'grilling']) {
            await page.locator(`#${id}`).screenshot({ path: path.join(output, `bancho-refined-${id}.png`) });
          }
        }
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      for (const id of sectionIds) {
        await page.locator(`nav a[href="#${id}"]`).click();
        assert.equal(new URL(page.url()).hash, `#${id}`, '목차 이동');
      }
      await page.goto(pathToFileURL(path.join(__dirname, 'index.html')).href);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.id), 'main', '키보드 본문 이동');
      const [prototypePage] = await Promise.all([page.waitForEvent('popup'), page.locator('.prototype-link[href="assets/cutting-prototype.html"]').click()]);
      prototypePage.on('pageerror', error => errors.push(error.message));
      prototypePage.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await prototypePage.waitForLoadState();
      await prototypePage.locator('#resetButton').click();
      assert.match(await prototypePage.title(), /절단/);
      const area = await prototypePage.locator('#cutArea').boundingBox();
      const cutX = area.x + area.width / 2;
      const cutY = area.y + 130;
      await prototypePage.mouse.move(cutX, cutY);
      await prototypePage.mouse.down();
      for (const offset of [1, 0, 1, 0]) await prototypePage.mouse.move(cutX, cutY + offset);
      await prototypePage.mouse.up();
      assert.equal(await prototypePage.locator('#completeCount').innerText(), '0', '너무 짧은 입력은 절단으로 판정하지 않음');
      assert.equal(await prototypePage.locator('#qualityStatus').innerText(), '30점');
      for (const score of [20, 10, 0]) {
        await prototypePage.mouse.move(cutX, cutY);
        await prototypePage.mouse.down();
        await prototypePage.mouse.move(cutX + 80, cutY);
        await prototypePage.mouse.up();
        assert.equal(await prototypePage.locator('#qualityStatus').innerText(), `${score}점`, '잘못된 방향마다 10점 차감');
        assert.equal(await prototypePage.locator('#completeCount').innerText(), '0', '잘못된 방향은 절단 횟수에서 제외');
      }
      assert.match(await prototypePage.locator('#prompt').innerText(), /손질 실패/);
      await prototypePage.waitForFunction(() => document.querySelector('#qualityStatus').textContent === '30점');
      assert.equal(await prototypePage.locator('#completeCount').innerText(), '0', '실패 후 초기 상태 복귀');
      await prototypePage.close();
      const [grillingPage] = await Promise.all([page.waitForEvent('popup'), page.locator('.prototype-link[href="assets/grilling-prototype.html"]').click()]);
      grillingPage.on('pageerror', error => errors.push(error.message));
      grillingPage.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await grillingPage.waitForLoadState();
      assert(await grillingPage.locator('#nextButton').isDisabled());
      await grillingPage.locator('#flipButton').click();
      await grillingPage.locator('#flipButton').click();
      assert(!(await grillingPage.locator('#nextButton').isDisabled()));
      await grillingPage.close();
      assert.deepEqual(errors, [], '페이지와 콘솔 오류 없음');
      console.log('PASS: 1440/1024/768/390/320px, 사진과 폰트, 목차, 키보드 본문 이동, 시제품 새 탭과 초기화');
      console.log('장시간 반복 조작의 피로감과 실제 사용자 테스트는 검증하지 않았습니다.');
    } finally { await browser.close(); }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
