import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const targetUrl = process.argv[2] || "https://asstro1456.github.io/Portfolio/";
const artifactDir = path.resolve(process.cwd(), "output", "playwright");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  try {
    await page.goto(targetUrl, { waitUntil: "networkidle" });
    const navTexts = await page.locator(".site-nav a").evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim()));
    assert(JSON.stringify(navTexts) === JSON.stringify(["Main", "Subculture", "AI & Work", "Story", "Projects", "Archive"]), "Top navigation should expose the layout prototype chapters.");
    assert(await page.locator(".hero").evaluate((node) => node.getBoundingClientRect().height >= window.innerHeight - 8), "Hero should cover the viewport.");
    assert(await page.locator(".library-window").count() === 1, "Hero should reserve a Steam library capture area.");
    assert(await page.locator("[data-print]").count() >= 2, "PDF view controls should be available.");
    assert((await page.locator("#game-changed").innerText()).includes("Library of Ruina"), "Story chapter should preserve the personal reason for becoming a planner.");
    await page.locator('[data-case="experience"]').click();
    assert((await page.locator("[data-case-panel] h3").innerText()).includes("모든 단서를 소비하지 않아도"), "Live-service case switcher should update the visible story.");
    await page.locator('[data-ai="engine"]').click();
    assert(await page.locator("[data-ai-panel] .case-stamp").innerText() === "CASE 02", "AI case switcher should update the visible case.");
    await mkdir(artifactDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactDir, "layout-prototype.png"), fullPage: true });
    console.log(`UI flow verification passed for ${targetUrl}`);
  } catch (error) {
    await mkdir(artifactDir, { recursive: true });
    await page.screenshot({ path: path.join(artifactDir, "verify-ui-flow-failure.png"), fullPage: true });
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally { await browser.close(); }
}

await run();
