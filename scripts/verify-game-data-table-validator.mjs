import { chromium } from "playwright";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const prototypePath = path.resolve("assets/prototypes/game-data-table-validator.html");
const screenshotPath = path.resolve("output/playwright/game-data-table-validator.png");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
try {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`file:///${prototypePath.replaceAll("\\", "/")}`);
  await page.locator("#sampleButton").click();
  await page.waitForFunction(() => document.querySelector("#tableCount")?.textContent === "5");
  if ((await page.locator("#readiness").innerText()) !== "플레이 가능: 필수 참조가 연결됐고, 선택한 모듈의 경로를 찾았습니다.") throw new Error("Sample data should be playable.");
  await page.locator("#scenarioButton").click();
  if (!(await page.locator("#scenarioResult").innerText()).includes("Ingredient")) throw new Error("Menu scenario should reach ingredients.");
  await page.locator("#schemaInput").setInputFiles([{ name:"schema.json", mimeType:"application/json", buffer:Buffer.from(JSON.stringify({ tables:[{ name:"Menu", requiredColumns:["MenuId","NoSuchColumn"] }], relations:[] })) }]);
  await page.waitForFunction(() => Number(document.querySelector("#errorCount")?.textContent) > 0);
  if (!(await page.locator("#report").innerText()).includes("스키마 필수 열")) throw new Error("Schema-required columns should be validated.");
  await page.locator("#csvInput").setInputFiles([{ name:"Menu.csv", mimeType:"text/csv", buffer:Buffer.from("MenuId,RecipeId\nM01,R404") }, { name:"Recipe.csv", mimeType:"text/csv", buffer:Buffer.from("RecipeId\nR01") }]);
  await page.waitForFunction(() => Number(document.querySelector("#errorCount")?.textContent) > 0);
  if (!(await page.locator("#report").innerText()).includes("대상 행이 없습니다")) throw new Error("Broken foreign key should be reported.");
  await page.locator("#schemaClearButton").click();
  await page.locator("#sampleButton").click();
  await page.waitForFunction(() => document.querySelector("#errorCount")?.textContent === "0");
  await page.locator("#scenarioButton").click();
  await page.locator("#csvInput").setInputFiles([
    { name:"BANCHO ERD 데이터 테이블 - Menu.csv", mimeType:"text/csv", buffer:Buffer.from("MenuID,Name\nMENU_DONTEKI,TXT_MENU_DONTEKI") },
    { name:"BANCHO ERD 데이터 테이블 - Recipe.csv", mimeType:"text/csv", buffer:Buffer.from("RecipeID,Name\nRCP_PREP,TXT_RECIPE_PREP") },
    { name:"BANCHO ERD 데이터 테이블 - Ingredient.csv", mimeType:"text/csv", buffer:Buffer.from("IngredientID,Name\nING_PORK,TXT_ING_PORK") },
    { name:"BANCHO ERD 데이터 테이블 - IngredientSlot.csv", mimeType:"text/csv", buffer:Buffer.from("SlotCode,Type\nMAIN,MAIN\nGARNISH,SIDE") },
    { name:"BANCHO ERD 데이터 테이블 - MenuRecipe.csv", mimeType:"text/csv", buffer:Buffer.from("MenuRecipeID,MenuID,RecipeID\nMR_DONTEKI_PREP,MENU_DONTEKI,RCP_PREP") },
    { name:"BANCHO ERD 데이터 테이블 - RecipeStep.csv", mimeType:"text/csv", buffer:Buffer.from("RecipeID,StepOrder,SlotCode\nRCP_PREP,1,MAIN\nRCP_PREP,2,GARNISH") },
    { name:"BANCHO ERD 데이터 테이블 - MenuRecipeIngredient.csv", mimeType:"text/csv", buffer:Buffer.from("MenuRecipeID,SlotCode,IngredientID\nMR_DONTEKI_PREP,MAIN,ING_PORK\nMR_DONTEKI_PREP,GARNISH,ING_PORK") }
  ]);
  await page.waitForFunction(() => document.querySelector("#tableCount")?.textContent === "7");
  if ((await page.locator("#errorCount").innerText()) !== "0") throw new Error("BANCHO composite keys and table aliases should validate without errors.");
  if ((await page.locator("#warningCount").innerText()) !== "0") throw new Error("SlotCode should be recognized as the IngredientSlot key.");
  if ((await page.locator("#readiness").innerText()) !== "플레이 가능: 필수 참조가 연결됐고, 선택한 모듈의 경로를 찾았습니다.") throw new Error("BANCHO junction tables should make the cooking flow playable.");
  if (errors.length) throw new Error(`Page error: ${errors.join(" | ")}`);
  await mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({ path:screenshotPath, fullPage:true });
  const mobile = await browser.newPage({ viewport: { width:390, height:844 } });
  await mobile.goto(`file:///${prototypePath.replaceAll("\\", "/")}`);
  await mobile.locator("#sampleButton").click();
  await mobile.waitForFunction(() => document.querySelector("#tableCount")?.textContent === "5");
  if (await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error("Mobile layout should not overflow horizontally.");
  await mobile.close();
  console.log("Game data table validator verification passed.");
} finally { await browser.close(); }
