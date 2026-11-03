/* Simulation has no renderer or DOM dependency. Distances are in metres. */
(function(root){
  'use strict';
  const speed=3.8;
  const sites=[{id:'cat',x:-3.5,y:.4,z:14},{id:'cafe',x:-5.8,y:1.9,z:27},{id:'tree',x:3.7,y:3,z:43}];
  const obstacles=[{x:3.7,z:18,r:.6},{x:3.7,z:43,r:.6},{x:-4,z:39,r:.5}];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),angle=v=>Math.atan2(Math.sin(v),Math.cos(v));
  function create(){return {phase:'intro',x:0,z:1.4,yaw:0,pitch:0,phone:true,paused:false,elapsed:0,maxZ:1.4,discovered:[],gaze:{cat:0,cafe:0,tree:0},cat:{x:-3.5,z:14,phase:'idle',heading:0,called:false,arrived:false,walk:0},cues:{seen:[],attention:0,kind:null,leaves:0,leafAge:0,leafX:0,leafZ:0,leafYaw:0,cafe:0}};}
  function active(s){return s.phase!=='intro'&&s.phase!=='ended'&&!s.paused;}
  function start(s){if(s.phase==='intro')s.phase='outbound';}
  function look(s,yaw,pitch=0){if(active(s)){s.yaw=angle(s.yaw+yaw);s.pitch=clamp(s.pitch+pitch,-.65,.65);}}
  function blocked(x,z){return obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.r+.22);}
  function dim(s){return s.phone&&s.phase!=='intro'&&s.phase!=='ended'?(s.cues.attention>0?.1:.55):0;}
  function updateCues(s,dt,events){
    const c=s.cues;c.attention=Math.max(0,c.attention-dt);c.leaves=Math.max(0,c.leaves-dt);c.cafe=Math.max(0,c.cafe-dt);c.leafAge+=dt;
    for(const p of [{id:'leaves-near',z:16,r:4},{id:'cafe-sound',z:27,r:6},{id:'leaves-far',z:43,r:5}]){
      if(c.seen.includes(p.id)||Math.abs(s.z-p.z)>p.r)continue;
      c.seen.push(p.id);events.push(p.id);
      if(p.id==='cafe-sound')c.cafe=5;
      else{c.leaves=6;c.leafAge=0;c.leafX=s.x;c.leafZ=s.z;c.leafYaw=s.yaw;}
    }
    for(const id of events)if(['cat-call','cat-close','leaves-near','leaves-far','cafe-sound'].includes(id)){c.attention=Math.max(c.attention,id.startsWith('leaves-')?6:id==='cafe-sound'?5:4.2);c.kind=id;}
  }
  function updateCat(s,dt,events){
    const c=s.cat;
    if(c.phase==='idle'&&s.z<22&&Math.hypot(c.x-s.x,c.z-s.z)<10){c.phase='approach';c.heading=s.yaw;c.called=true;events.push('cat-call');}
    if(c.phase==='approach'&&s.z>23)c.phase='cafe';
    let tx=c.x,tz=c.z,pace=2.7;
    if(c.phase==='approach'){
      // A little ahead and left keeps the cat in the gap beside the phone.
      tx=clamp(s.x+Math.sin(c.heading)*2.6-Math.cos(c.heading)*1.25,-4.3,4.3);
      tz=clamp(s.z+Math.cos(c.heading)*2.6+Math.sin(c.heading)*1.25,2,55);
      if(Math.hypot(c.x-s.x,c.z-s.z)<5)pace=4.5;
    }else if(c.phase==='cafe'){tx=-4.3;tz=26;pace=1.5;}
    const d=Math.hypot(tx-c.x,tz-c.z),travel=Math.min(d,pace*dt);
    if(d>.04){c.x+=(tx-c.x)/d*travel;c.z+=(tz-c.z)/d*travel;c.walk+=travel;}
    if(c.phase==='approach'&&d<.3&&!c.arrived){c.arrived=true;events.push('cat-close');}
  }
  function step(s,dt,input={}){
    if(!active(s))return [];
    dt=clamp(dt,0,.05);s.elapsed+=dt;look(s,(input.turn||0)*1.7*dt);
    const f=input.forward||0,r=input.strafe||0,n=Math.max(1,Math.hypot(f,r));
    const dx=(Math.sin(s.yaw)*f+Math.cos(s.yaw)*r)/n*speed*dt,dz=(Math.cos(s.yaw)*f-Math.sin(s.yaw)*r)/n*speed*dt;
    const nx=clamp(s.x+dx,-4.65,4.65),nz=clamp(s.z+dz,.8,56);
    if(!blocked(nx,s.z))s.x=nx;if(!blocked(s.x,nz))s.z=nz;
    s.maxZ=Math.max(s.maxZ,s.z);
    if(s.maxZ>6&&dz<-.0001)s.phase='return';
    // Return is walking back across the entrance; discoveries never gate it.
    if(s.maxZ>6&&s.z<1.65&&dz<0){s.phase='ended';return [];}
    const events=[];updateCat(s,dt,events);updateCues(s,dt,events);
    for(const site of sites){
      const p=site.id==='cat'?{...site,x:s.cat.x,z:s.cat.z}:site;
      if(s.discovered.includes(p.id))continue;
      const distance=Math.hypot(p.x-s.x,p.z-s.z),bearing=Math.atan2(p.x-s.x,p.z-s.z),elevation=Math.atan2(p.y-1.65,distance);
      const facing=!s.phone&&distance<9&&Math.abs(angle(bearing-s.yaw))<.42&&Math.abs(elevation-s.pitch)<.45;
      s.gaze[p.id]=facing?s.gaze[p.id]+dt:0;
      if(s.gaze[p.id]>=.55){s.discovered.push(p.id);events.push(p.id);if(p.id==='cat')s.cat.phase='cafe';}
    }
    return events;
  }
  const api={create,start,step,look,active,sites,speed,dim};
  if(typeof module!=='undefined')module.exports=api;else root.AlleyModel=api;
})(typeof window!=='undefined'?window:globalThis);
