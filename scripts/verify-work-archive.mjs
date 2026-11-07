import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root=fileURLToPath(new URL('../',import.meta.url));
const base=process.argv[2] || pathToFileURL(root).href;
const artifactDir=process.env.ARCHIVE_ARTIFACT_DIR || path.join(root,'output/playwright/work-archive');
const pages=['work-archive.html',...readdirSync(path.join(root,'works')).filter(f=>f.endsWith('.html')).map(f=>`works/${f}`)];
const shared=['resume-showcase.html','planning-hub.html','tools-skills.html','ai-portfolio.html','writings.html','book-reviews.html',...readdirSync(root).filter(f=>/^showcase-.*\.html$/.test(f))];
for(const file of [...pages,...shared]){
 const source=readFileSync(path.join(root,file),'utf8');
 assert(!source.includes('\uFFFD'),`${file}: invalid text`);
 assert(source.includes('work-archive.html'),`${file}: collection navigation missing`);
 if(pages.includes(file)){
  assert(!/(?:[CD]:[\\/]|localhost:|draftId=|builder\/|agent_id|api[_-]?key)/i.test(source),`${file}: local or operational data exposed`);
  for(const [,ref] of source.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(/^(?:https?:|mailto:|data:)/.test(ref))continue;
   const url=new URL(ref,`https://archive.test/${file}`);
   const target=decodeURIComponent(url.pathname.slice(1));
   assert(existsSync(path.join(root,target)),`${file}: missing ${target}`);
   if(url.hash && target.endsWith('.html'))assert(readFileSync(path.join(root,target),'utf8').includes(`id="${url.hash.slice(1)}"`),`${file}: missing anchor ${ref}`);
  }
 }
}
await mkdir(artifactDir,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try{
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  await page.goto(new URL('work-archive.html',base).href,{waitUntil:'load'});
  assert.equal(await page.locator('.artwork-card').count(),46);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}: horizontal overflow`);
  for(const selector of ['.site-menu a','.artwork-card h2','.artwork-card h3']){
   assert(await page.locator(selector).evaluateAll(nodes=>nodes.every(n=>{const r=n.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1})),`${width}: clipped content ${selector}`);
  }
  await page.locator('.archive-filters button').filter({hasText:/^웹툰 /}).click();
  assert.equal(await page.locator('.artwork-card:visible').count(),1);
  await page.locator('#work-search').fill('존재하지않는작업');
  assert.equal(await page.locator('.artwork-card:visible').count(),0);
  assert(await page.locator('#work-empty').isVisible());
  await page.locator('#work-search').fill('유단아');
  assert.equal(await page.locator('.artwork-card:visible').count(),1);
  await page.locator('.archive-filters button').filter({hasText:/^전체 /}).click();
  assert((await page.locator('.artwork-card:visible').count())>=4);
  await page.locator('#work-search').fill('');
  assert.equal(await page.locator('.artwork-card:visible').count(),46);
  await page.locator('.archive-filters button').filter({hasText:/^스킬 /}).click();
  assert.equal(await page.locator('.artwork-card:visible').count(),7);
  await page.locator('#work-search').fill('판단');
  assert.equal(await page.locator('.artwork-card:visible').count(),1);
  await page.locator('#work-search').fill('');
  await page.locator('.archive-filters button').filter({hasText:/^전체 /}).click();
  // Load all lazy images before checking their actual decode status.
  await page.locator('img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  await page.evaluate(async()=>{await Promise.all([...document.images].map(img=>img.decode()));await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);});
  if(width===1440 || width===390)await page.screenshot({path:path.join(artifactDir,`collection-${width}.png`),fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 for(const file of pages.filter(f=>f.startsWith('works/'))){
  await page.goto(new URL(file,base).href,{waitUntil:'load'});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${file}: mobile overflow`);
  await page.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
  await page.locator('img').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
  await page.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
  if(file.endsWith('danah-webtoon.html')){
   assert.equal(await page.locator('.webtoon-pages figure').count(),6);
   await page.locator('a[href="#page-6"]').click();
   assert.equal(await page.evaluate(()=>location.hash),'#page-6');
  }
  if(file.endsWith('danah-character.html')){
   assert((await page.locator('.source-text').allTextContents()).some(t=>t.length===1700&&t.includes('기계치')));
   await page.screenshot({path:path.join(artifactDir,'character-mobile.png')});
  }
 }
 await page.goto(new URL('assets/prototypes/game-data-table-validator.html',base).href);
 await page.locator('#sampleButton').click();
 await page.waitForFunction(()=>document.querySelector('#tableCount')?.textContent==='5');
 assert.equal(await page.locator('#tableCount').innerText(),'5');
 await page.locator('#scenarioButton').click();
 assert((await page.locator('#scenarioResult').innerText()).includes('Ingredient'));
 await page.goto(new URL('assets/prototypes/point-and-click-workroom.html',base).href);
 await page.locator('[data-view="board"]').click();
 assert.equal(await page.locator('#viewer').getAttribute('aria-hidden'),'false');
 await page.locator('#closeViewer').click();
 assert.equal(await page.locator('#viewer').getAttribute('aria-hidden'),'true');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({result:'pass',cards:46,readerPages:pages.length-1,widths:[1440,768,390,320],checks:['links and anchors','navigation','combined search and tag filters','skill filter','empty and reset states','image decoding','spoiler disclosure','webtoon page navigation','CSV sample and path','workroom open and close'],pageErrors:errors}));
}finally{await browser.close();}
