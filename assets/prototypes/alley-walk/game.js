/* First-person perspective, drawn with Canvas polygons. No external media. */
(() => {
  'use strict';
  const M=window.AlleyModel,$=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d');
  let s=M.create(),w=1100,h=700,focal=700,last=0,time=0,light=0,viewPitch=0,dimAlpha=0,audio=null,muted=false,nextTone=0,lookPointer=null,ended=false;
  const cueAudio={cafe:0,wind:0};
  const keys=new Set(),held=new Map(),world=[],reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function initAudio(){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;audio=audio||new AC();if(!muted&&!s.paused)audio.resume().catch(()=>{});}catch{audio=null;}}
  function connectSound(node,pan=0){if(audio.createStereoPanner){const p=audio.createStereoPanner();p.pan.value=pan;node.connect(p);p.connect(audio.destination);}else node.connect(audio.destination);}
  function soundPan(x,z){return Math.sin(Math.atan2(x-s.x,z-s.z)-s.yaw);}
  function tone(freq,duration=1,volume=.025,delay=0,end=freq,pan=0){
    if(!audio||muted||s.paused||audio.state!=='running')return;
    const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);connectSound(g,pan);o.start(t);o.stop(t+duration+.03);
  }
  function cafeSound(){
    if(!audio||muted||audio.state!=='running')return;cueAudio.cafe++;
    const pan=soundPan(-5.5,27);tone(1397,.65,.035,0,1397,pan);tone(2093,.45,.018,.09,2093,pan);
    [196,246.94,293.66].forEach(n=>tone(n,1.9,.011,.35,n,pan));
  }
  function windSound(){
    if(!audio||muted||audio.state!=='running')return;cueAudio.wind++;
    const t=audio.currentTime,b=audio.createBuffer(1,Math.floor(audio.sampleRate*1.4),audio.sampleRate),data=b.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),g=audio.createGain();source.buffer=b;filter.type='bandpass';filter.frequency.value=1500;filter.Q.value=.5;
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.055,t+.25);g.gain.exponentialRampToValueAtTime(.0001,t+1.4);source.connect(filter);filter.connect(g);connectSound(g,.35);source.start();source.stop(t+1.4);
  }
  function clearInput(){keys.clear();held.clear();lookPointer=null;}
  function pause(value){if(s.phase==='intro'||s.phase==='ended')return;s.paused=value;clearInput();$('paused').hidden=!value;if(audio){if(value)audio.suspend().catch(()=>{});else if(!muted)audio.resume().catch(()=>{});}$(value?'resume':'phone-toggle').focus();}
  function phone(){if(!M.active(s))return;s.phone=!s.phone;initAudio();sync();}
  function turn(){if(M.active(s)){M.look(s,Math.PI);sync();}}
  function sync(){
    $('phone').classList.toggle('down',!s.phone||s.phase==='intro'||s.phase==='ended');
    $('phone-toggle').innerHTML=(s.phone?'휴대폰 내리기':'휴대폰 올리기')+' <kbd>Space</kbd>';
    $('chapter').textContent='골목';
    $('reticle').hidden=s.phone||s.phase==='intro'||s.phase==='ended';
    if(s.phase==='ended'&&!ended){ended=true;clearInput();$('ending').hidden=false;$('controls').hidden=true;
      $('ending-line').textContent=s.discovered.length?'잠깐 바라본 풍경이, 돌아오는 길에는 조금 더 가까웠다.':'길은 그대로, 나는 잠깐 다녀왔다.';
      const n=Math.round(s.elapsed);$('duration').textContent=`이번 산책 ${Math.floor(n/60)}분 ${n%60}초`;$('restart').focus();}
  }
  $('start').onclick=()=>{M.start(s);initAudio();$('cover').hidden=true;$('controls').hidden=false;sync();$('phone-toggle').focus();};
  $('restart').onclick=()=>{s=M.create();time=0;light=0;viewPitch=0;dimAlpha=0;cueAudio.cafe=0;cueAudio.wind=0;ended=false;nextTone=0;clearInput();$('ending').hidden=true;$('cover').hidden=false;sync();$('start').focus();};
  $('phone-toggle').onclick=phone;$('turn').onclick=turn;$('pause').onclick=()=>pause(!s.paused);$('resume').onclick=()=>pause(false);
  $('sound').onclick=()=>{muted=!muted;initAudio();$('sound').textContent=muted?'소리 꺼짐':'소리 켜짐';$('sound').setAttribute('aria-pressed',String(!muted));if(audio&&muted)audio.suspend().catch(()=>{});};
  const keyCodes=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyR'];
  addEventListener('keydown',e=>{if(e.code==='Escape'){pause(!s.paused);return;}if(!M.active(s)||!keyCodes.includes(e.code))return;e.preventDefault();keys.add(e.code);if(!e.repeat&&e.code==='Space')phone();if(!e.repeat&&e.code==='KeyR')turn();});
  addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{clearInput();pause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true);});
  document.querySelectorAll('[data-move]').forEach(b=>{
    b.addEventListener('pointerdown',e=>{if(!M.active(s))return;b.setPointerCapture(e.pointerId);held.set(e.pointerId,b.dataset.move);e.preventDefault();});
    const release=e=>held.delete(e.pointerId);['pointerup','pointercancel','lostpointercapture'].forEach(type=>b.addEventListener(type,release));
  });
  canvas.addEventListener('pointerdown',e=>{if(!M.active(s))return;canvas.setPointerCapture(e.pointerId);lookPointer={id:e.pointerId,x:e.clientX,y:e.clientY};e.preventDefault();});
  canvas.addEventListener('pointermove',e=>{if(!lookPointer||lookPointer.id!==e.pointerId)return;M.look(s,(e.clientX-lookPointer.x)*.0045,(lookPointer.y-e.clientY)*.0035);lookPointer.x=e.clientX;lookPointer.y=e.clientY;});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,e=>{if(lookPointer?.id===e.pointerId)lookPointer=null;}));
  function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);focal=Math.min(w,h*1.55)*.83;}addEventListener('resize',resize);resize();

  // Static geometry is built once. Each face is clipped at the near plane.
  function face(points,color){world.push({points,color});}
  function box(x,y,z,sx,sy,sz,color){
    const a=x-sx/2,b=x+sx/2,c=z-sz/2,d=z+sz/2,t=y+sy;
    face([[a,y,c],[b,y,c],[b,t,c],[a,t,c]],shade(color,.82));face([[b,y,c],[b,y,d],[b,t,d],[b,t,c]],shade(color,.93));
    face([[b,y,d],[a,y,d],[a,t,d],[b,t,d]],color);face([[a,y,d],[a,y,c],[a,t,c],[a,t,d]],shade(color,1.05));face([[a,t,c],[b,t,c],[b,t,d],[a,t,d]],shade(color,1.13));
  }
  function shade(color,k){const n=parseInt(color.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.min(255,Math.round(v*k)).toString(16).padStart(2,'0')).join('');}
  function foliage(x,y,z,r,color){
    const levels=4,slices=7;
    for(let j=0;j<levels;j++)for(let i=0;i<slices;i++){
      const point=(a,b)=>{const theta=a/levels*Math.PI,phi=b/slices*Math.PI*2;return [x+Math.sin(theta)*Math.cos(phi)*r,y+Math.cos(theta)*r*.75,z+Math.sin(theta)*Math.sin(phi)*r];};
      face([point(j,i),point(j+1,i),point(j+1,i+1),point(j,i+1)],shade(color,.86+(i%3)*.08));
    }
  }
  function plant(x,z,size=1){box(x,0,z,.6*size,.6*size,.6*size,'#b2856a');foliage(x,.95*size,z,.53*size,'#829777');}
  function tree(x,z){box(x,0,z,.25,3,.25,'#897a5a');foliage(x,3.55,z,1.65,'#91a17c');foliage(x+.7,3.7,z+.4,1.15,'#a7ae7a');box(x,.015,z,1.6,.06,1.6,'#8c9b83');}
  function buildWorld(){
    for(let z=-5;z<76;z+=3){
      face([[-5,0,z],[5,0,z],[5,0,z+3],[-5,0,z+3]],z%2?'#bdb9a5':'#c2bda8');
      for(const side of [-1,1]){const x=side*4.25;face([[x-.7,.035,z],[x+.7,.035,z],[x+.7,.035,z+3],[x-.7,.035,z+3]],'#d2c8ad');}
      face([[-.025,.01,z],[.025,.01,z],[.025,.01,z+.8],[-.025,.01,z+.8]],'#e1d8bb');
    }
    const colors=['#c8b49a','#a5b6a5','#d1b59c','#c0c2a7','#c0b298'];
    for(const side of [-1,1])for(let i=0;i<9;i++){
      const z=i*7+3,height=5.8+(i%3)*1.1,x=side*8.5;
      box(x,0,z,5,height,6.65,colors[(i+(side===1?1:0))%colors.length]);
      box(side*5.97,height-.15,z,.12,.22,6.8,'#7d8976');
      for(let row=0;row<2;row++)for(let col=0;col<3;col++){
        const wz=z-2+col*1.9,wy=2.7+row*2.05;
        box(side*5.95,wy,wz,.16,1.35,.95,'#647d72');box(side*5.84,wy+.1,wz,.04,1.13,.77,'#c8d2b7');
        box(side*5.79,wy+.1,wz,.05,1.1,.045,'#7a8f7c');box(side*5.76,wy-.06,wz,.2,.1,1.08,'#9ca78b');
      }
      if(i!==3||side!==-1){box(side*5.9,.03,z-1,.18,2.2,1.1,'#6d8d7e');box(side*5.78,.22,z-1,.05,1.75,.8,'#9bad95');}
      if(i%2===0)plant(side*5.15,z+1.5,.9);
    }
    // Cafe facade sits on the left wall. Its state never unlocks the route.
    box(-5.72,.5,27,.2,1.75,4.3,'#6d8171');box(-5.58,.68,27,.05,1.34,4,'#e8c789');
    for(let i=0;i<5;i++)box(-5.48,.5,25.15+i*.9,.12,1.8,.06,'#7c8c73');
    box(-5.55,2.7,27,.22,.55,4.5,'#f1dec0');
    for(let i=0;i<9;i++)face([[-6,2.6,24.6+i*.55],[-4.9,2.22,24.6+i*.55],[-4.9,2.22,25.15+i*.55],[-6,2.6,25.15+i*.55]],i%2?'#819b85':'#dedac0');
    box(-5.3,.75,27,.65,.12,3.8,'#9c8162');for(const z of [26.5,27.2])box(-5.2,.87,z,.2,.2,.2,'#fbecd0');
    box(-4.4,.03,26.2,.5,.11,.5,'#eee3c8');box(-4.4,.15,26.2,.37,.015,.37,'#89b6b1');
    plant(-4.8,29.6);plant(-4.9,12.8);plant(-4.5,15.3,.8);
    for(const [x,z] of [[3.7,18],[3.7,43],[-4,39]])tree(x,z);
    for(const z of [8,22,37,51]){box(0,5.8,z,12,.035,.035,'#6b8174');box(0,5.5,z,.035,.6,.035,'#6b8174');box(0,5.35,z,.36,.12,.36,'#e8d4a0');}
    for(const z of [33,49]){box(4.6,.5,z,.6,.14,2,'#b49a73');for(const dz of [-.75,.75])box(4.6,0,z+dz,.5,.5,.1,'#6c8170');}
    for(const z of [5,16,34,46])face([[-5,.045,z],[5,.045,z+5],[5,.045,z+6],[-5,.045,z+1]],'#a6ad96');
    // Entrance and far end are visually distinct, but there are no locked gates.
    box(0,0,59,10,1.2,.3,'#98ab94');for(const x of [-3,0,3])plant(x,58,1.3);
    face([[-5,.05,1.5],[5,.05,1.5],[5,.05,1.7],[-5,.05,1.7]],'#d8be83');
  }
  buildWorld();
  function view(p){const dx=p[0]-s.x,dy=p[1]-1.65,dz=p[2]-s.z,sy=Math.sin(s.yaw),cy=Math.cos(s.yaw),sp=Math.sin(viewPitch),cp=Math.cos(viewPitch),z=dx*sy+dz*cy;return [dx*cy-dz*sy,dy*cp-z*sp,dy*sp+z*cp];}
  function clip(points){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ain=a[2]>.12,bin=b[2]>.12;if(ain)out.push(a);if(ain!==bin){const t=(.12-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,.12]);}}return out;}
  function project(p){return [w/2+p[0]*focal/p[2],h*.48-p[1]*focal/p[2]];}
  function drawFace(item){const points=clip(item.points.map(view));if(points.length<3)return;const screen=points.map(project);if(screen.every(p=>p[0]<0)||screen.every(p=>p[0]>w)||screen.every(p=>p[1]<0)||screen.every(p=>p[1]>h))return;ctx.fillStyle=item.color;ctx.beginPath();screen.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fill();}
  function billboard(x,y,z,width,height,draw){const p=view([x,y,z]);if(p[2]<.3)return;const [px,py]=project(p),k=focal/p[2];ctx.save();ctx.translate(px,py);ctx.scale(k,k);draw(width,height);ctx.restore();}
  function drawCat(){const {x,z,walk}=s.cat,step=reduce.matches?0:Math.sin(walk*12)*.055;
    billboard(x,.05,z,1,.65,()=>{ctx.scale(.8,.8);ctx.fillStyle='#4c62562b';ctx.beginPath();ctx.ellipse(0,0,.55,.12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#caa67d';ctx.fillRect(-.4,-.36,.7,.29);ctx.fillRect(.21,-.63,.3,.3);ctx.beginPath();ctx.moveTo(.21,-.57);ctx.lineTo(.23,-.78);ctx.lineTo(.35,-.64);ctx.lineTo(.48,-.78);ctx.lineTo(.51,-.57);ctx.fill();ctx.fillRect(-.38+step,-.12,.12,.12);ctx.fillRect(.13-step,-.12,.12,.12);ctx.strokeStyle='#caa67d';ctx.lineWidth=.12;ctx.beginPath();ctx.moveTo(-.37,-.28);ctx.quadraticCurveTo(-.78,-.18,-.65+(reduce.matches?0:Math.sin(time*2)*.025),-.65);ctx.stroke();ctx.fillStyle='#3c554b';ctx.fillRect(.28,-.52,.035,.04);ctx.fillRect(.43,-.52,.035,.04);});
  }
  function drawLeaves(){
    const c=s.cues;if(c.leaves<=0)return;
    for(let i=0;i<16;i++){
      const age=c.leafAge,localX=3.6-(i%8)*.9-age*.65,localZ=2.8+Math.floor(i/4)*1.1-age*.2;
      const x=c.leafX+Math.cos(c.leafYaw)*localX+Math.sin(c.leafYaw)*localZ,z=c.leafZ-Math.sin(c.leafYaw)*localX+Math.cos(c.leafYaw)*localZ;
      const y=Math.max(.12,.55+(i%4)*.24+(reduce.matches?0:Math.sin(age*2+i)*.15)-age*.045);
      billboard(x,y,z,1,1,()=>{ctx.globalAlpha*=Math.min(1,c.leaves/.8);ctx.rotate(reduce.matches?i:age*2+i);ctx.fillStyle=i%2?'#bc995d':'#91a064';ctx.beginPath();ctx.ellipse(0,0,.09,.035,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e2c68c';ctx.lineWidth=.008;ctx.beginPath();ctx.moveTo(-.075,0);ctx.lineTo(.075,0);ctx.stroke();});
    }
  }
  function draw(dt){
    // The phone changes the rendered posture, preserving the player's free look.
    const targetPitch=s.phase==='intro'||s.phase==='ended'?0:s.phone?-.55:s.pitch;
    viewPitch=reduce.matches?targetPitch:viewPitch+(targetPitch-viewPitch)*(1-Math.exp(-dt*9));
    const desired=s.phone?0:.22+s.discovered.length*.11;light+=(desired-light)*(1-Math.exp(-dt*1.5));
    const dimTarget=M.dim(s);dimAlpha=reduce.matches?dimTarget:dimAlpha+(dimTarget-dimAlpha)*(1-Math.exp(-dt*(dimTarget<dimAlpha?8:1.8)));
    const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#9fb8b4');sky.addColorStop(.55,'#e8d9b7');sky.addColorStop(1,'#aaa995');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='#f6dfaa';ctx.beginPath();ctx.arc(w*.72-Math.sin(s.yaw)*w*.2,h*.18+viewPitch*h*.5,Math.min(w,h)*.07,0,Math.PI*2);ctx.fill();
    const faces=world.map(item=>({item,depth:item.points.reduce((sum,p)=>sum+view(p)[2],0)/item.points.length})).filter(p=>p.depth>-.5&&p.depth<80).sort((a,b)=>b.depth-a.depth);
    for(const p of faces)drawFace(p.item);
    drawCat();
    // Labels are attached to the street, rather than presenting objectives.
    for(const [x,y,z,label]of [[-5.35,2.93,27,'SLOW DAYS'],[0,1.9,-.3,'골목 입구'],[0,1.5,58.5,'작은 쉼터']])billboard(x,y,z,1,1,()=>{ctx.fillStyle='#486052';ctx.font='.22px Georgia';ctx.textAlign='center';ctx.fillText(label,0,0);});
    if(s.cues.cafe>0){ctx.save();ctx.globalAlpha=.22+(reduce.matches?0:Math.sin(time*3)*.04);drawFace({points:[[-5.43,.7,25],[-5.43,.7,29],[-5.43,2.05,29],[-5.43,2.05,25]],color:'#ffe3a0'});drawFace({points:[[-5,.06,24],[-2.4,.06,25],[-2.4,.06,29],[-5,.06,29]],color:'#f3d493'});ctx.restore();}
    if(s.discovered.includes('cafe')||s.cues.cafe>0)for(const z of [26.5,27.2])billboard(-5.2,1.3+(reduce.matches?0:Math.sin(time*1.2)*.09),z,1,1,()=>{ctx.fillStyle='#fff3cf99';ctx.beginPath();ctx.ellipse(0,0,.035,.18,0,0,Math.PI*2);ctx.fill();});
    if(s.discovered.includes('tree'))for(let i=0;i<8;i++)billboard(1.5+Math.sin(i*3.7)*2,.7+(i*.53+(reduce.matches?0:time*.17))%2.8,40+i*.8,1,1,()=>{ctx.fillStyle='#efdda7aa';ctx.fillRect(0,0,.045,.07);});
    drawLeaves();
    ctx.fillStyle=s.phone?`rgba(17,36,42,${dimAlpha})`:`rgba(249,211,143,${light*.13})`;ctx.fillRect(0,0,w,h);
    const fade=ctx.createLinearGradient(0,0,0,h);fade.addColorStop(0,'#254c4844');fade.addColorStop(.35,'#254c4800');fade.addColorStop(.75,'#254c4800');fade.addColorStop(1,'#203c3b99');ctx.fillStyle=fade;ctx.fillRect(0,0,w,h);
  }
  function update(dt){
    if(s.paused)return;time+=dt;
    const moves=new Set(held.values()),down=code=>keys.has(code);
    const input={forward:(down('KeyW')||down('ArrowUp')||moves.has('forward')?1:0)-(down('KeyS')||down('ArrowDown')||moves.has('back')?1:0),strafe:(down('KeyD')||moves.has('right')?1:0)-(down('KeyA')||moves.has('left')?1:0),turn:(down('ArrowRight')?1:0)-(down('ArrowLeft')?1:0)};
    const events=M.step(s,dt,input);
    for(const id of events){if(id==='cat-call'||id==='cat-close'){tone(680,.25,.045,0,1050);tone(1050,.35,.035,.17,580);}else if(id==='cafe-sound')cafeSound();else if(id.startsWith('leaves-'))windSound();else [220,277,330].forEach((n,i)=>tone(n,1.4,.023,i*.12));}
    if(M.active(s)){nextTone-=dt;if(nextTone<0){nextTone=2.8;if(s.phone)tone(260,.13,.012);else{tone([220,277,330,440][Math.floor(time/3)%4],2.5,.012+s.discovered.length*.004);if(s.discovered.includes('tree'))tone(1174,.3,.008,.6,880);}}}
    sync();
  }
  function frame(now){const dt=Math.min((now-last)/1000||0,.05);last=now;update(dt);draw(s.paused?0:dt);requestAnimationFrame(frame);}sync();requestAnimationFrame(frame);
  window.alleySnapshot=()=>({...s,cat:{...s.cat},cues:{...s.cues,seen:[...s.cues.seen]},discovered:[...s.discovered],gaze:{...s.gaze},viewPitch,dimAlpha,dimTarget:M.dim(s),cueAudio:{...cueAudio},speed:M.speed,audioState:audio?.state||'unavailable',muted,faces:world.length});
})();
