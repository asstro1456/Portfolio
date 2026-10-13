import { chromium } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const prototypePath = path.resolve("assets/prototypes/bancho-reciprocal-cut-prototype.html");
const screenshotPath = path.resolve("output/playwright/bancho-reciprocal-cut-prototype.png");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await page.goto(`file:///${prototypePath.replaceAll("\\", "/")}`);
  const area = await page.locator("#cutArea").boundingBox();
  if (!area) throw new Error("Cut area is missing.");
  const x = area.x + area.width / 2;
  const top = area.y + 130;
  const bottom = area.y + 290;

  await page.mouse.move(x, top);
  await page.mouse.down();
  await page.mouse.move(x + 80, top);
  await page.mouse.up();
  if ((await page.locator("#qualityStatus").innerText()) !== "20점") throw new Error("Horizontal cutting should deduct 10 points.");

  // Three cuts in one uninterrupted hold.
  await page.mouse.move(x, top);
  await page.mouse.down();
  await page.mouse.move(x, bottom, { steps: 4 });
  for (let cut = 0; cut < 3; cut += 1) {
    await page.mouse.move(x, top, { steps: 4 });
    await page.mouse.move(x, bottom, { steps: 4 });
  }
  await page.mouse.up();
  if ((await page.locator("#completeCount").innerText()) !== "3") throw new Error("Continuous hold should complete all three cuts.");

  // Three cuts with a release between each cut.
  await page.locator("#resetButton").click();
  for (let cut = 0; cut < 3; cut += 1) {
    await page.mouse.move(x, top);
    await page.mouse.down();
    await page.mouse.move(x, bottom, { steps: 4 });
    await page.mouse.move(x, top, { steps: 4 });
    await page.mouse.move(x, bottom, { steps: 4 });
    await page.mouse.up();
  }
  if ((await page.locator("#completeCount").innerText()) !== "3") throw new Error("Released cuts should complete all three cuts.");
  if (!(await page.locator("#prompt").innerText()).includes("절단 완료")) throw new Error("Completion feedback is missing.");
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log("BANCHO reciprocal cutting prototype verification passed.");
} finally { await browser.close(); }
