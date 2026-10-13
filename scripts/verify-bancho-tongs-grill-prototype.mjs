import { chromium } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const prototypePath = path.resolve("assets/prototypes/bancho-tongs-grill-prototype.html");
const screenshotPath = path.resolve("output/playwright/bancho-tongs-grill-prototype.png");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  await page.goto(`file:///${prototypePath.replaceAll("\\", "/")}`);
  await page.keyboard.down("w"); await page.keyboard.down("d");
  if ((await page.locator("#selectionText").innerText()) !== "선택: 우상단") throw new Error("W+D should select the upper-right target.");
  await page.keyboard.up("w"); await page.keyboard.up("d");
  await page.locator(".m3").hover();
  if ((await page.locator("#selectionText").innerText()) !== "선택: 우하단") throw new Error("Hovering meat should select its target.");
  await page.locator(".oil").click();
  if ((await page.locator("#selectionText").innerText()) !== "선택: 우하단") throw new Error("Clicking the pan should keep the selected target.");
  await page.locator(".oil").click();
  if ((await page.locator("#flipCount").innerText()) !== "2회") throw new Error("Two flip inputs should be counted.");
  if (await page.locator("#nextButton").isDisabled()) throw new Error("Serve button should unlock after two flips.");
  await page.locator("#nextButton").click();
  if (!(await page.locator("#prompt").innerText()).includes("제공")) throw new Error("Serving feedback is missing.");
  if (!(await page.locator("#customerBubble").getAttribute("class")).includes("show")) throw new Error("Customer emoji serving animation is missing.");
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path:screenshotPath, fullPage:true });
  console.log("BANCHO tongs grill prototype verification passed.");
} finally { await browser.close(); }
