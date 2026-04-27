import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const targetUrl = process.argv[2] || "https://asstro1456.github.io/Portfolio/";
const isHeadless = process.env.HEADLESS !== "false";
const artifactDir = path.resolve(process.cwd(), "output", "playwright");

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

async function getCenteredCardIndex(page, sliderId) {
  return page.evaluate((id) => {
    const slider = document.getElementById(id);
    if (slider?.id === "howSlider") {
      return Number.parseInt(slider.dataset.activeIndex ?? "0", 10);
    }

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
  }, sliderId);
}

async function getActiveDotIndex(page, dotsSelector) {
  const dots = page.locator(`${dotsSelector} .scene-dot`);
  const count = await dots.count();

  for (let index = 0; index < count; index += 1) {
    const className = await dots.nth(index).getAttribute("class");
    if (className && className.includes("is-active")) {
      return index;
    }
  }

  return -1;
}

async function waitForSliderSettle(page, timeout = 1200) {
  await page.waitForTimeout(timeout);
}

async function assertCardOpensModal(page, selector, message) {
  const modalBackdrop = page.locator("#modalBackdrop");
  await page.locator(selector).first().click();
  assert(await modalBackdrop.isVisible(), message);
  await page.locator("#modalClose").click();
  assert(await modalBackdrop.isHidden(), "Modal should close after clicking the close button.");
}

async function run() {
  const browser = await chromium.launch({ headless: isHeadless });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    const modalBackdrop = page.locator("#modalBackdrop");
    assert(await modalBackdrop.isHidden(), "Initial modal state should be hidden.");

    const navTexts = await page.locator(".site-link").evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""));
    assert(JSON.stringify(navTexts) === JSON.stringify(["Main", "What", "Why", "How", "Vision", "Portfolio"]), "Top nav items should match the expected order.");

    assert((await page.locator(".site-title").count()) === 0, "Site brand title should be removed.");
    assert((await page.locator(".eyebrow").count()) === 0, "Hero eyebrow should be removed.");
    assert((await page.locator(".site-header .site-version").count()) === 0, "Version should be removed from the sticky header.");
    assert((await page.locator("#hero .hero-version").count()) === 1, "Version should be displayed inside the hero.");
    assert((await page.locator(".hero-summary").count()) === 0, "Hero summary should be removed.");
    assert((await page.locator("#tools .section-lead").count()) === 0, "What lead text should be removed.");
    assert((await page.locator("#how .section-lead").count()) === 0, "How lead text should be removed.");
    assert((await page.locator(".hero-actions").count()) === 0, "Hero action buttons should be removed.");

    const headerTopBefore = await page.locator(".site-header").evaluate((node) => node.getBoundingClientRect().top);
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: "auto" }));
    await page.waitForTimeout(300);
    const headerTopAfter = await page.locator(".site-header").evaluate((node) => node.getBoundingClientRect().top);
    assert(Math.abs(headerTopBefore) <= 2, "Header should start at the top of the viewport.");
    assert(Math.abs(headerTopAfter) <= 2, "Header should remain stuck to the top while scrolling.");

    const navBg = await page.locator(".site-nav").evaluate((node) => getComputedStyle(node).backgroundColor);
    assert(navBg.includes("0.5") || navBg.includes("0.50"), "Nav panel background should be visible over light sections.");

    const heroMetrics = await page.locator(".hero-stage").evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
      };
    });
    assert(heroMetrics.width >= heroMetrics.viewportWidth - 8, "Hero should span the viewport width.");
    assert(heroMetrics.height >= heroMetrics.viewportHeight - 8, "Hero should cover the viewport height.");

    const heroLayout = await page.evaluate(() => {
      const card = document.querySelector(".hero-profile-card")?.getBoundingClientRect();
      const copy = document.querySelector(".hero-copy")?.getBoundingClientRect();
      const version = document.querySelector(".hero-version")?.getBoundingClientRect();
      return {
        cardLeft: card?.left ?? 0,
        cardTop: card?.top ?? 0,
        copyLeft: copy?.left ?? 0,
        copyTop: copy?.top ?? 0,
        versionTop: version?.top ?? 0,
        versionLeft: version?.left ?? 0
      };
    });
    assert(Math.abs(heroLayout.cardLeft - heroLayout.copyLeft) <= 24, "Profile card and hero copy should share the same left anchor.");
    assert(heroLayout.cardTop < heroLayout.copyTop, "Profile card should sit above the main copy.");
    assert(heroLayout.versionTop < heroLayout.cardTop && heroLayout.versionLeft <= heroLayout.cardLeft + 4, "Hero version should sit above the profile near the left edge.");

    const titleLines = await page.locator(".hero-title-line").evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""));
    assert(JSON.stringify(titleLines) === JSON.stringify(["막히는 흐름을 구조로 바꾸는", "게임 시스템 기획자"]), "Hero title should keep the fixed two-line split.");

    const guideToggle = page.locator("#navGuideToggle");
    const guidePanel = page.locator("#navGuidePanel");
    await guideToggle.click();
    assert(await guidePanel.isVisible(), "Guide panel should open after clicking the nav toggle.");
    await page.locator('.site-link[href="#tools"]').click();
    await page.waitForTimeout(350);
    assert(await guidePanel.isHidden(), "Guide panel should close after navigation.");

    const howSlider = page.locator("#howSlider");
    const howCards = page.locator("#howSlider > .how-slide");
    const howDots = page.locator("#howSliderDots .scene-dot");

    assert(await howSlider.isVisible(), "How slider should be rendered.");
    assert(await howCards.count() === 3, "How slider should contain exactly 3 slides.");
    assert(await howDots.count() === 3, "How slider should render exactly 3 dots.");
    assert(await page.locator("#scenes .case-card").count() <= 4, "Cases slide should support up to four visible case cards.");

    await page.locator('[data-slider-target="howSlider"].slider-nav-next').click();
    await waitForSliderSettle(page);

    const centeredAfterNext = await getCenteredCardIndex(page, "howSlider");
    const activeDotAfterNext = await getActiveDotIndex(page, "#howSliderDots");
    assert(centeredAfterNext === 1, `Expected second How slide to be centered after next click, got ${centeredAfterNext}.`);
    assert(activeDotAfterNext === 1, `Expected second dot to be active after next click, got ${activeDotAfterNext}.`);

    const overlapMetrics = await page.evaluate(() => {
      const active = document.querySelector("#howSlider .how-slide.is-active")?.getBoundingClientRect();
      const prev = document.querySelector("#howSlider .how-slide.is-prev")?.getBoundingClientRect();
      const next = document.querySelector("#howSlider .how-slide.is-next")?.getBoundingClientRect();

      return {
        prevVisible: Boolean(prev && active && prev.right > active.left && prev.left < active.left),
        nextVisible: Boolean(next && active && next.left < active.right && next.right > active.right),
        prevAligned: Boolean(prev && active && Math.abs(prev.top - active.top) < 40),
        nextAligned: Boolean(next && active && Math.abs(next.top - active.top) < 40)
      };
    });
    assert(overlapMetrics.prevVisible && overlapMetrics.nextVisible, "Prev/next How cards should peek from behind the centered card.");
    assert(overlapMetrics.prevAligned && overlapMetrics.nextAligned, "Prev/next How cards should stay roughly aligned with the centered card.");

    await ensureArtifactsDir();
    await page.locator("#how").screenshot({ path: path.join(artifactDir, "how-carousel-latest.png") });

    await howDots.nth(2).click();
    await waitForSliderSettle(page);
    const centeredAfterDot = await getCenteredCardIndex(page, "howSlider");
    assert(centeredAfterDot === 2, `Expected third How slide to be centered after dot click, got ${centeredAfterDot}.`);

    await assertCardOpensModal(page, "#tools .open-modal", "Tool card should open the modal.");
    await howDots.nth(0).click();
    await waitForSliderSettle(page, 600);
    await assertCardOpensModal(page, "#approach .open-modal", "Principles card should open the modal.");
    await howDots.nth(1).click();
    await waitForSliderSettle(page, 600);
    await assertCardOpensModal(page, "#alignment .open-modal", "Process card should open the modal.");
    await howDots.nth(2).click();
    await waitForSliderSettle(page, 600);
    await assertCardOpensModal(page, "#scenes .open-modal", "Case card should open the modal.");

    await page.locator("#scenes .open-modal").first().click();
    assert(await modalBackdrop.isVisible(), "Modal should be visible after clicking a case card.");
    await page.mouse.click(24, 24);
    assert(await modalBackdrop.isHidden(), "Modal should close after clicking outside the modal.");

    console.log(`UI flow verification passed for ${targetUrl}`);
  } catch (error) {
    const screenshotPath = await captureFailure(page, "verify-ui-flow-failure");
    console.error(`UI flow verification failed. Screenshot: ${screenshotPath}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

await run();
