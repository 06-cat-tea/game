(() => {
  'use strict';
  const points={town:[.47,.25],wood:[.18,.38],pass:[.7,.44],fen:[.55,.72],coast:[.19,.69],city:[.8,.19]};
  const worldImage='assets/maps/world-v1.webp',backdropCache=new Map(),localCache=new Map(),hover=new WeakMap();
  const themes={town:['#9eaf7d','#b9c996'],wood:['#658e69','#80a37a'],pass:['#b19475','#c5ac89'],fen:['#6c9b95','#8caf9d'],coast:['#b1ba93','#c8c79c'],city:['#a4b098','#c0c7aa']};
  const goals=(s,id)=>Number(s.sceneProgress[id+':survey']===true)+Number(s.sceneProgress[id+':choice']!==undefined)+Number(s.sceneProgress[id+':supplies-cache']===true)+Number(s.sceneProgress[id+':encounter']===true);
  function localPoint(s,x,y){const b=WorldRegions.bounds(s.place),w=.86,h=w*b.rows/b.columns;return [.07+x/b.columns*w,(1-h)/2+y/b.rows*h];}
  function nodes(s,local){return local?WorldRegions.districts(s.place).map(d=>({...d,p:localPoint(s,d.x,d.y),on:true})):Object.entries(GameData.PLACES).map(([id,p])=>({id,name:p.name,p:points[id],on:true}));}
  function progress(s,place){const buildings=BuildingSystem.at(place),rooms=buildings.flatMap(b=>{const r=BuildingSystem.interior(b.id);return r?r.props.map(p=>r.occupantKey+':'+p.id):[]}),routes=SceneSystem.route(place),events=Object.entries(RegionContent.events).filter(([,e])=>e.place===place).map(([id])=>id),challenges=Object.keys(RegionContent.challenges).filter(id=>RegionContent.challenges[id].place===place),found=Number(s.exploration.regions.includes(place))+buildings.filter(b=>s.exploration.buildings.includes(b.id)).length+rooms.filter(id=>s.exploration.props.includes(id)).length+events.filter(id=>s.exploration.events.includes(id)).length+challenges.filter(id=>s.challengeWins[id]>0).length+routes.reduce((n,r)=>n+goals(s,r.id),0);return Math.floor(found/(1+buildings.length+rooms.length+events.length+challenges.length+routes.length*4)*100);}
  function invalidate(){backdropCache.clear();localCache.clear();}
  function surface(size,dpr){const c=document.createElement('canvas');c.width=c.height=Math.ceil(size*dpr);const ctx=c.getContext('2d');ctx.scale(dpr,dpr);return [c,ctx];}
  function backdrop(place,size,dpr){
    const key=place+':'+size+':'+dpr+':'+WorldTerrain.revision;if(backdropCache.has(key))return backdropCache.get(key);
    const image=place==='city'?WorldTerrain.thumbnail(place):WorldAssets.ready('scenes',place),[c,ctx]=surface(size,dpr);ctx.fillStyle='#20372c';ctx.fillRect(0,0,size,size);
    if(image){const scale=(size+12)/Math.min(image.width,image.height),w=image.width*scale,h=image.height*scale;ctx.save();ctx.filter='blur('+Math.max(1.4,size*.018)+'px) saturate(.65)';ctx.drawImage(image,(size-w)/2,(size-h)/2,w,h);ctx.restore();}
    ctx.fillStyle='#10251d55';ctx.fillRect(0,0,size,size);const shade=ctx.createRadialGradient(size/2,size/2,size*.15,size/2,size/2,size*.55);shade.addColorStop(0,'#0000');shade.addColorStop(1,'#07181070');ctx.fillStyle=shade;ctx.fillRect(0,0,size,size);
    backdropCache.set(key,c);while(backdropCache.size>8)backdropCache.delete(backdropCache.keys().next().value);return c;
  }
  function localBackdrop(s,size,dpr){
    const key=s.place+':'+size+':'+dpr+':'+WorldTerrain.revision;if(localCache.has(key))return localCache.get(key);
    const [c,ctx]=surface(size,dpr),b=WorldRegions.bounds(s.place),colors=themes[s.place]||themes.town,at=(x,y)=>localPoint(s,x,y).map(v=>v*size);
    const wash=ctx.createLinearGradient(0,0,size,size);wash.addColorStop(0,colors[1]);wash.addColorStop(1,colors[0]);ctx.fillStyle=wash;ctx.fillRect(0,0,size,size);
    // Orthographic cells and navigation share one world-coordinate transform.
    const start=at(0,0),cw=size*.86/b.columns;
    for(let y=0;y<b.rows;y++)for(let x=0;x<b.columns;x++){
      const t=s.place==='city'?RoyalCity.terrain(x+.5,y+.5):WorldLayout.terrain(s.place,x+.5,y+.5),noise=((x*73+y*137)%17)/17;
      ctx.fillStyle=t==='water'?'#75b7c5':t==='bridge'?'#d5cbb0':t==='road'?'#ddcaa5':t==='wall'?'#909789':t==='rock'?'#a29383':noise>.5?colors[0]:colors[1];ctx.globalAlpha=t==='ground'?.38+noise*.25:1;ctx.fillRect(start[0]+x*cw,start[1]+y*cw,cw+.4,cw+.4);
      if(t==='water'&&noise>.7){ctx.globalAlpha=.35;ctx.strokeStyle='#e9f1d9';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(start[0]+x*cw,start[1]+y*cw+cw*.6);ctx.lineTo(start[0]+(x+1)*cw,start[1]+y*cw+cw*.6);ctx.stroke();}
    }ctx.globalAlpha=1;
    if(s.place!=='city')for(const o of WorldTerrain.decorations(s.place)){const p=at(o.x,o.y);ctx.fillStyle=o.kind==='tree'?'#3d705979':o.kind==='rock'?'#807c7477':'#e9d193';ctx.beginPath();ctx.ellipse(p[0],p[1],cw*.8,cw*1.2,0,0,Math.PI*2);ctx.fill();}
    for(const v of BuildingSystem.at(s.place)){const p=at(v.x,v.y),q=at(v.x+v.w,v.y+v.d),w=q[0]-p[0],h=q[1]-p[1];ctx.fillStyle='#394d4c40';ctx.fillRect(p[0]+1,p[1]+2,w,h);ctx.fillStyle=s.place==='city'?'#6e8b9e':'#9b785d';ctx.fillRect(p[0],p[1],w,h);ctx.strokeStyle='#f1dfb1';ctx.lineWidth=.7;ctx.strokeRect(p[0],p[1],w,h);ctx.strokeStyle='#e4cfaf88';ctx.beginPath();ctx.moveTo(p[0],p[1]+h/2);ctx.lineTo(q[0],p[1]+h/2);ctx.stroke();}
    ctx.strokeStyle='#fff1cb66';ctx.lineWidth=1;ctx.strokeRect(start[0],start[1],b.columns*cw,b.rows*cw);localCache.set(key,c);while(localCache.size>8)localCache.delete(localCache.keys().next().value);return c;
  }
  function drawWorld(ctx,size){
    const image=WorldAssets.ready('url',worldImage);if(image){ctx.drawImage(image,0,0,size,size);return;}
    // Slow or failed artwork never prevents navigation.
    ctx.fillStyle='#759c94';ctx.fillRect(0,0,size,size);ctx.fillStyle='#a9b990';ctx.beginPath();ctx.moveTo(size*.12,0);ctx.lineTo(size,0);ctx.lineTo(size,size*.9);ctx.lineTo(size*.28,size*.84);ctx.lineTo(size*.09,size*.51);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#eddbb1';ctx.lineWidth=2;ctx.setLineDash([4,3]);for(const [a,b]of [['town','wood'],['town','city'],['town','pass'],['pass','fen'],['fen','coast'],['wood','coast']]){ctx.beginPath();ctx.moveTo(...points[a].map(v=>v*size));ctx.lineTo(...points[b].map(v=>v*size));ctx.stroke();}ctx.setLineDash([]);WorldAssets.load('url',worldImage);
  }
  function draw(){if(window.GameUI?.getCurrent()==='title'||window.GameLoading?.blocked()&&GameLoading.diagnostics().status!=='preparing')return;for(const canvas of document.querySelectorAll('#circleMap,#hudMap'))drawCanvas(canvas);}
  function drawCanvas(canvas){
    if(!window.AshenGame)return;const s=AshenGame.getState(),local=canvas.dataset.mode==='local',hud=canvas.id==='hudMap',box=GameViewport.localRect(canvas),visual=canvas.closest('.map-visual'),available=visual?Math.min(GameViewport.localRect(visual).width,GameViewport.localRect(visual.parentElement).height-26):box.width,size=Math.max(44,Math.floor(available||260)),dpr=Math.min(2,devicePixelRatio||1);
    if(visual){canvas.style.width=size+'px';canvas.style.height=size+'px';}if(canvas.width!==Math.ceil(size*dpr)||canvas.height!==Math.ceil(size*dpr))canvas.width=canvas.height=Math.ceil(size*dpr);const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);
    if(hud){ctx.save();ctx.beginPath();ctx.arc(size/2,size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(backdrop(s.place,size,dpr),0,0,size,size);}else if(local)ctx.drawImage(localBackdrop(s,size,dpr),0,0,size,size);else drawWorld(ctx,size);
    const ns=nodes(s,local),selected=hover.get(canvas),current=local?(s.place==='city'?RoyalCity.current(s.location.x,s.location.y)?.id:null):s.place,labelBoxes=[];
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=(size<200?10:12)+'px "Microsoft YaHei",sans-serif';
    const ordered=ns.slice().sort((a,b)=>Number(b.id===selected||b.id===current)-Number(a.id===selected||a.id===current));
    for(const n of ordered){const x=n.p[0]*size,y=n.p[1]*size,active=n.id===current||n.id===selected,r=hud?2.5:active?6:4;
      if(active&&!hud){ctx.fillStyle='#fff0c055';ctx.beginPath();ctx.arc(x,y,11,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle=active?'#fff0bb':'#f1ddaf';ctx.strokeStyle='#354c4b';ctx.lineWidth=hud?1:2;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.stroke();if(hud)continue;
      const w=Math.min(size-12,ctx.measureText(n.name).width+12),h=20;let placed=false;
      for(const dy of [-20,21,-39,40]){const cx=Math.max(w/2+4,Math.min(size-w/2-4,x)),cy=Math.max(h/2+3,Math.min(size-h/2-3,y+dy)),rect=[cx-w/2,cy-h/2,w,h];if(labelBoxes.some(([a,b,c,d])=>rect[0]<a+c&&rect[0]+w>a&&rect[1]<b+d&&rect[1]+h>b))continue;labelBoxes.push(rect);ctx.fillStyle=active?'#183641ec':'#1b343dbf';ctx.fillRect(...rect);ctx.fillStyle=active?'#ffe7ac':'#faf4e5';ctx.fillText(n.name,cx,cy,w-8);placed=true;break;}
      if(!placed&&active){ctx.fillStyle='#fff';ctx.fillText(n.name,x,Math.max(12,y-16));}
    }
    if(local&&!s.location.sceneId){const p=localPoint(s,s.location.x,s.location.y).map(v=>v*size);ctx.fillStyle='#fff';ctx.strokeStyle='#244963';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p[0],p[1]-6);ctx.lineTo(p[0]-4,p[1]+4);ctx.lineTo(p[0]+4,p[1]+4);ctx.closePath();ctx.fill();ctx.stroke();}
    if(hud)ctx.restore();else{ctx.strokeStyle='#e8d5a4';ctx.lineWidth=2;ctx.strokeRect(1,1,size-2,size-2);}
  }
  function hit(canvas,clientX,clientY){const box=GameViewport.localRect(canvas),p=GameViewport.clientToLocal(clientX,clientY,canvas),s=AshenGame.getState();return nodes(s,canvas.dataset.mode==='local').map(n=>({...n,d:Math.hypot(p.x-n.p[0]*box.width,p.y-n.p[1]*box.width)})).filter(n=>n.d<Math.min(25,box.width*.075)).sort((a,b)=>a.d-b.d)[0];}
  document.body.addEventListener('click',e=>{if(e.target.id!=='circleMap'||!window.AshenGame)return;const n=hit(e.target,e.clientX,e.clientY);if(n){if(e.target.dataset.mode==='local')AshenGame.visitDistrict(n.id);else AshenGame.travel(n.id);}});
  document.body.addEventListener('pointermove',e=>{if(e.target.id!=='circleMap'||!window.AshenGame)return;const id=hit(e.target,e.clientX,e.clientY)?.id;if(id!==hover.get(e.target)){hover.set(e.target,id);e.target.style.cursor=id?'pointer':'default';drawCanvas(e.target);}});
  document.body.addEventListener('pointerout',e=>{if(e.target.id==='circleMap'){hover.delete(e.target);drawCanvas(e.target);}});
  window.addEventListener('worldassetready',e=>{if(e.detail.id===worldImage||e.detail.kind==='environment'||e.detail.kind==='terrain'){invalidate();if(!GameLoading.blocked())requestAnimationFrame(draw);}});
  window.addEventListener('gameviewportchange',()=>{invalidate();requestAnimationFrame(draw);});
  window.CircleMap={draw,progress,goals,nodes,invalidate,backdrop,localPoint,worldImage};
})();
