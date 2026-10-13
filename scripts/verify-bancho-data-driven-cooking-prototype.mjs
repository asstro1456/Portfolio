import { chromium } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const prototypePath = path.resolve("assets/prototypes/bancho-data-driven-cooking-prototype.html");
const screenshotPath = path.resolve("output/playwright/bancho-data-driven-cooking-prototype.png");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`file:///${prototypePath.replaceAll("\\", "/")}`);
  if (!(await page.locator("#stepTitle").innerText()).includes("돼지고기")) throw new Error("Menu data should configure the first ingredient.");
  if ((await page.locator("#recipeQueue .recipe").count()) !== 3) throw new Error("MenuRecipe rows should build the recipe queue.");
  await page.locator('#ingredientEditor select[data-binding="MR_DONTEKI_PREP:MAIN"]').selectOption("ING_CABBAGE");
  await page.locator("#applyData").click();
  if (!(await page.locator("#ingredientList").innerText()).includes("양배추")) throw new Error("Developer ingredient override should update the stage.");
  await page.locator('#recipeToggles input[value="MR_DONTEKI_PREP"]').uncheck();
  await page.locator("#applyData").click();
  if (!(await page.locator("#recipeName").innerText()).includes("팬 굽기")) throw new Error("Developer recipe selection should rebuild the execution plan.");
  const grill = page.frameLocator(".tool-frame");
  await grill.locator(".oil").click();
  await grill.locator(".oil").click();
  await grill.locator("#nextButton").click();
  await page.waitForFunction(() => document.querySelector("#stepTitle")?.textContent.includes("FLIP"));
  if (!(await page.locator("#stepTitle").innerText()).includes("FLIP")) throw new Error("Existing grill module result should advance the data-driven step.");
  if (errors.length) throw new Error(`Page error: ${errors.join(" | ")}`);
  await mkdir(path.dirname(screenshotPath), { recursive:true });
  await page.screenshot({ path:screenshotPath, fullPage:true });
  console.log("BANCHO data-driven cooking prototype verification passed.");
} finally { await browser.close(); }
