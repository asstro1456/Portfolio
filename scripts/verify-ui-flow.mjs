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
    const cards = Array.from(document.querySelectorAll('#sceneSlider .card'));
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

async function run() {
  const browser = await chromium.launch({ headless: isHeadless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    const modalBackdrop = page.locator('#modalBackdrop');
    assert(await modalBackdrop.isHidden(), 'Initial modal state should be hidden.');

    const cards = page.locator('#sceneSlider .card');
    const nextButton = page.locator('.scene-nav-next');
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
