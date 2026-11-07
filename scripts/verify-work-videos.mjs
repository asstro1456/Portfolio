import {readFileSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url));
const base=process.argv[2]||pathToFileURL(root).href;
const catalog=JSON.parse(readFileSync(new URL('../assets/works/videos/catalog.json',import.meta.url),'utf8'));
assert.equal(catalog.length,29);
const browser=await chromium.launch({headless:true});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const file of [...new Set(catalog.map(i=>i.page))]){
  await page.goto(new URL(file,base).href);
  assert.equal(await page.locator('video').count(),catalog.filter(i=>i.page===file).length);
  for(const width of [1440,390,320]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' overflow');}
  const states=await page.locator('video').evaluateAll(async videos=>{
   const states=[];
   for(const v of videos){v.muted=true;try{await Promise.race([v.play(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),15000))]);await new Promise(r=>setTimeout(r,180));states.push({time:v.currentTime,width:v.videoWidth,error:v.error?.code||null});v.pause();}catch(e){states.push({error:String(e)});}}return states;
  });
  assert(states.every(s=>!s.error&&s.time>0&&s.width>0),JSON.stringify(states));
 }
 for(const i of catalog){
  const bytes=process.argv[2]?await (await page.request.get(new URL(i.file,base).href)).body():readFileSync(root+i.file);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),i.sha256,i.file);
 }
 await page.goto(new URL('work-archive.html',base).href);await page.locator('.archive-filters button').filter({hasText:/^영상 /}).click();
 for(const id of ['rigging-videos','skill-vfx-videos','skill-recordings'])assert(await page.locator('#work-'+id).isVisible());
 await page.locator('#work-search').fill('리깅');assert.equal(await page.locator('.artwork-card:visible').count(),1);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({result:'pass',videos:29,pages:3,widths:[1440,390,320],checks:['playback advances','source hashes','video filter and search'],public:!!process.argv[2],errors}));
}finally{await browser.close();}
