import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const targetUrl = process.argv[2] || 'https://asstro1456.github.io/Portfolio/';
const isHeadless = process.env.HEADLESS !== 'false';
const artifactDir = path.resolve(process.cwd(), 'output', 'playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function ensureArtifactsDir() {
  await mkdir(artifactDir, { recursive: true });
}

async function captureFailure(page, name) {
  await ensureArtifactsDir();
  const filePath = path.join(artifactDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

async function getCenteredCardIndex(page) {
  return page.evaluate(() => {
    const slider = document.getElementById('sceneSlider');
    const cards = slider ? Array.from(slider.children) : [];
    if (!slider || !cards.length) return -1;

    const sliderCenter = slider.scrollLeft + (slider.clientWidth / 2);
    let currentIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + (card.clientWidth / 2);
      const distance = Math.abs(cardCenter - sliderCenter);

      if (distance < minDistance) {
        minDistance = distance;
        currentIndex = index;
      }
    });

    return currentIndex;
  });
}

async function getActiveDotIndex(page) {
  const dots = page.locator('#sceneSliderDots .scene-dot');
  const count = await dots.count();

  for (let index = 0; index < count; index += 1) {
    const className = await dots.nth(index).getAttribute('class');
    if (className && className.includes('is-active')) {
      return index;
    }
  }

  return -1;
}

async function waitForSliderSettle(page, timeout = 1200) {
  await page.waitForTimeout(timeout);
}

async function assertCardOpensModal(page, selector, message) {
  const modalBackdrop = page.locator('#modalBackdrop');
  await page.locator(selector).first().click();
  assert(await modalBackdrop.isVisible(), message);
  await page.locator('#modalClose').click();
  assert(await modalBackdrop.isHidden(), 'Modal should close after clicking the close button.');
}

async function run() {
  const browser = await chromium.launch({ headless: isHeadless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    const modalBackdrop = page.locator('#modalBackdrop');
    assert(await modalBackdrop.isHidden(), 'Initial modal state should be hidden.');
    assert((await page.locator('.section-rail').count()) === 0, 'Left rail navigation should be removed.');
    assert((await page.locator('#profile').count()) === 0, 'Standalone profile section should be removed.');

    const heroMetrics = await page.locator('.hero-stage').evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return { width: rect.width, height: rect.height, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
    });

    assert(heroMetrics.width >= heroMetrics.viewportWidth - 8, 'Hero should span the full viewport width.');
    assert(heroMetrics.height >= heroMetrics.viewportHeight - 8, 'Hero should span the full viewport height.');

    const navTexts = await page.locator('.site-link').evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ''));
    assert(JSON.stringify(navTexts) === JSON.stringify(['Main', 'What', 'Why', 'How', 'Vision', 'Portfolio']), 'Top nav items should match the expected order.');

    const guideToggle = page.locator('#navGuideToggle');
    const guidePanel = page.locator('#navGuidePanel');

    await guideToggle.click();
    assert(await guidePanel.isVisible(), 'Guide panel should open after clicking the nav toggle.');
    assert((await guideToggle.getAttribute('aria-expanded')) === 'true', 'Guide toggle should reflect the open state.');

    await page.locator('.site-link[href="#tools"]').click();
    await page.waitForTimeout(350);
    assert(await page.locator('.site-link[href="#tools"]').evaluate((node) => node.classList.contains('is-active')), 'What nav link should become active after navigation.');
    assert(await guidePanel.isHidden(), 'Guide panel should close after choosing a nav link.');

    const heroPrimaryCta = page.locator('.hero-action-primary');
    const heroSecondaryCta = page.locator('.hero-action-secondary');
    assert((await heroPrimaryCta.getAttribute('href')) === '#tools', 'Primary hero CTA should point to the What section.');
    assert((await heroSecondaryCta.getAttribute('href')) === '#scenes', 'Secondary hero CTA should point to the scenes section.');

    const heroCard = page.locator('.hero-profile-card');
    assert(await heroCard.isVisible(), 'Hero profile card should be visible.');

    const orderIsCorrect = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main?.firstElementChild?.id === 'tools';
    });
    assert(orderIsCorrect, 'What section should appear immediately after the hero.');

    assert(await page.locator('#origin .editorial-story').isVisible(), 'Why section should render as an editorial layout.');
    assert(await page.locator('#how').isVisible(), 'How wrapper should be present.');
    assert(await page.locator('#approach .principle-grid').isVisible(), 'Approach should render as a principles grid.');
    assert(await page.locator('#alignment .process-flow').isVisible(), 'Alignment should render as a process flow.');

    const cards = page.locator('#sceneSlider .card');
    const nextButton = page.locator('[data-slider-target="sceneSlider"].slider-nav-next');
    const dots = page.locator('#sceneSliderDots .scene-dot');

    assert(await cards.count() >= 3, 'Expected at least 3 scene cards.');
    assert(await dots.count() >= 3, 'Expected slider dots to be rendered.');

    await nextButton.click();
    await waitForSliderSettle(page);

    const centeredAfterNext = await getCenteredCardIndex(page);
    const activeDotAfterNext = await getActiveDotIndex(page);

    assert(centeredAfterNext === 1, `Expected second card to be centered after next click, got ${centeredAfterNext}.`);
    assert(activeDotAfterNext === 1, `Expected second dot to be active after next click, got ${activeDotAfterNext}.`);

    await dots.nth(2).click();
    await waitForSliderSettle(page);

    const centeredAfterDot = await getCenteredCardIndex(page);
    const activeDotAfterDot = await getActiveDotIndex(page);

    assert(centeredAfterDot === 2, `Expected third card to be centered after dot click, got ${centeredAfterDot}.`);
    assert(activeDotAfterDot === 2, `Expected third dot to be active after dot click, got ${activeDotAfterDot}.`);

    await cards.nth(2).click();
    assert(await modalBackdrop.isVisible(), 'Modal should be visible after clicking a scene card.');

    await page.locator('#modalClose').click();
    assert(await modalBackdrop.isHidden(), 'Modal should close after clicking the close button.');

    await assertCardOpensModal(page, '#tools .open-modal', 'Tool card should open the modal.');
    await assertCardOpensModal(page, '#approach .open-modal', 'Approach card should open the modal.');
    await assertCardOpensModal(page, '#alignment .open-modal', 'Alignment step should open the modal.');

    await cards.nth(0).click();
    assert(await modalBackdrop.isVisible(), 'Modal should reopen after clicking another scene card.');

    await page.mouse.click(24, 24);
    assert(await modalBackdrop.isHidden(), 'Modal should close after clicking outside the modal.');

    console.log(`UI flow verification passed for ${targetUrl}`);
  } catch (error) {
    const screenshotPath = await captureFailure(page, 'verify-ui-flow-failure');
    console.error(`UI flow verification failed. Screenshot: ${screenshotPath}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

await run();
