// Run with the existing Portfolio Playwright installation. No package installation needed.
const {chromium}=require('C:/Users/User/Documents/Portfolio/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const root=__dirname,qa=path.join(root,'verification');fs.mkdirSync(qa,{recursive:true});
 const browser=await chromium.launch({headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:1000},acceptDownloads:true}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.evaluate(()=>document.fonts.ready);
 const counts=await page.evaluate(()=>({latest:data.records.filter(r=>r.status==='latest').length,archive:data.records.filter(r=>r.status==='archive').length,urls:[...new Set(data.records.map(r=>r.url))]}));
 assert.equal(await page.locator('.index-item').count(),counts.latest);
 assert.equal(await page.locator('.record').count(),counts.latest+counts.archive);
 assert.equal(await page.locator('#latest .index-item').count(),Math.min(30,counts.latest));
 assert.equal(await page.locator('.archive .record').count(),counts.archive);
 const invalid=await page.locator('main a').evaluateAll(links=>links.filter(a=>a.getAttribute('href').startsWith('#')?!document.getElementById(a.getAttribute('href').slice(1)):!a.href.startsWith('https:')).map(a=>a.outerHTML));assert.deepEqual(invalid,[]);
 await page.emulateMedia({media:'print'});
 const overflow=await page.locator('.sheet').evaluateAll(sheets=>sheets.flatMap((s,i)=>{const footer=s.querySelector('.footer').getBoundingClientRect(),bottom=Math.max(...[...s.children].filter(x=>!x.classList.contains('footer')).map(x=>x.getBoundingClientRect().bottom));return bottom>footer.top-8?[{page:i+1,bottom,footer:footer.top}]:[]}));
 fs.writeFileSync(path.join(qa,'layout.json'),JSON.stringify(overflow,null,2));assert.deepEqual(overflow,[],'PDF footer overlap');
 await page.pdf({path:path.join(root,'이동현_기획서허브.pdf'),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false,tagged:true});
 await page.emulateMedia({media:'screen'});await page.locator('.sheet').first().screenshot({path:path.join(qa,'desktop.png')});
 await page.locator('a[href^="#doc-"]').first().click();assert.ok((await page.url()).includes('#doc-'));
 await page.locator('#include-archive').uncheck();assert.equal(await page.locator('.archive').count(),0);assert.equal(await page.locator('.record').count(),counts.latest);
 await page.locator('#include-archive').check();assert.equal(await page.locator('.archive .record').count(),counts.archive);
 // One version transition and saved-HTML round trip exercise the update path.
 await page.locator('#edit').click();await page.locator('#new-version').click();
 await page.locator('[name="version"]').fill('99.0-test');await page.locator('[name="url"]').fill('https://example.com/new-version');
 await page.locator('[name="url"]').fill('http://example.com');await page.locator('button[type="submit"]').click();assert.match(await page.locator('#edit-status').innerText(),/https/);
 await page.locator('[name="url"]').fill('https://example.com/new-version');await page.locator('button[type="submit"]').click();
 assert.equal(await page.locator('.index-item').count(),counts.latest);assert.equal(await page.locator('.archive .record').count(),counts.archive+1);
 await page.locator('#close-editor').click();
 const downloadPromise=page.waitForEvent('download');await page.locator('#save').click();const download=await downloadPromise;const saved=path.join(qa,'saved-roundtrip.html');await download.saveAs(saved);
 await page.goto(pathToFileURL(saved).href);assert.equal(await page.locator('.record').count(),counts.latest+counts.archive+1);assert.match(await page.locator('main').innerText(),/99.0-test/);
 await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile horizontal overflow');
 await page.locator('.sheet').first().screenshot({path:path.join(qa,'mobile.png')});assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(qa,'checks.json'),JSON.stringify({counts,checks:['latest/front index','internal anchors','A4 page fit','archive toggle','HTTPS validation','version archival','HTML save/reopen','390px width','no JavaScript errors'],pages:await page.locator('.sheet').count()},null,2));
 console.log(JSON.stringify({latest:counts.latest,archive:counts.archive,pages:await page.locator('.sheet').count(),result:'PASS'}));
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
