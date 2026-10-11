(() => {
  "use strict";
  const points = { town:[.5,.23], wood:[.22,.38], pass:[.73,.43], fen:[.55,.72], coast:[.19,.69] };
  function draw() {
    const canvas = document.querySelector("#circleMap"); if (!canvas) return;
    const box = canvas.getBoundingClientRect(), dpr = Math.max(1, window.devicePixelRatio || 1), size = Math.max(180, Math.floor(Math.min(box.width || 260, 260)));
    canvas.width = size * dpr; canvas.height = size * dpr;
    const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr); ctx.imageSmoothingEnabled = false;
    const c = size/2, r = size*.43, locs = JSON.parse(canvas.dataset.locations), current = canvas.dataset.current, progress=JSON.parse(canvas.dataset.progress||"{}");
    ctx.clearRect(0,0,size,size);
    ctx.save(); ctx.beginPath(); ctx.arc(c,c,r,0,Math.PI*2); ctx.clip();
    ctx.fillStyle="#354d3d"; ctx.fillRect(c-r,c-r,2*r,2*r);
    // pixel regions and coastline
    ctx.fillStyle="#526c49"; ctx.fillRect(c-r+9,c-r+15,r*1.03,r*.78);
    ctx.fillStyle="#59634a"; ctx.fillRect(c+5,c-r+35,r*.8,r*.67);
    ctx.fillStyle="#304d4f"; ctx.fillRect(c-r+25,c+24,r*1.4,r*.84);
    ctx.fillStyle="#77815a"; ctx.fillRect(c-r+42,c-r+47,22,10); ctx.fillRect(c+38,c+3,17,8);
    // paths
    const coords = locs.map(([id])=>({id,...(points[id]||[.5,.5])}));
    ctx.strokeStyle="#c4a56a"; ctx.lineWidth=3; ctx.setLineDash([5,4]); ctx.beginPath();
    for(const pt of coords){const px=c-r+pt["0"]*r*2, py=c-r+pt["1"]*r*2; if(pt.id===coords[0].id)ctx.moveTo(px,py);else ctx.lineTo(px,py)} ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle="#d1b77a"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(c,c,r,0,Math.PI*2); ctx.stroke();
    for(const [id, name, danger] of locs){const pt=points[id]||[.5,.5], px=c-r+pt[0]*r*2, py=c-r+pt[1]*r*2, active=id===current;
      const art=window.WorldAssets.ready("buildings",{town:"castle",wood:"forest",pass:"mine",fen:"ruins",coast:"harbor"}[id]);if(art){ctx.imageSmoothingEnabled=true;ctx.drawImage(art,px-14,py-18,28,28);}else {ctx.fillStyle=active?"#ffe093":"#e8d5a2";ctx.fillRect(Math.round(px-4),Math.round(py-4),8,8);}
      if(active){ctx.strokeStyle="#ffe09399";ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);ctx.stroke()}
      ctx.fillStyle="#fff4d6";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(name,px,py-21);ctx.fillStyle="#d6c593";ctx.font="9px sans-serif";ctx.fillText(`${progress[id]||0}%${(progress[id]||0)<100?" · 待探索":""}`,px,py+18);
    }
  }
  window.CircleMap = { draw };
  window.addEventListener("resize",()=>requestAnimationFrame(draw));
})();
(() => {
  document.body.addEventListener("click", event => {
    const canvas = event.target.closest("#circleMap"); if (!canvas) return;
    const rect = canvas.getBoundingClientRect(), c=rect.width/2, r=rect.width*.43, x=event.clientX-rect.left, y=event.clientY-rect.top;
    let nearest=null, distance=Infinity;
    const points={town:[.5,.23],wood:[.22,.38],pass:[.73,.43],fen:[.55,.72],coast:[.19,.69]};
    for(const [id] of JSON.parse(canvas.dataset.locations)){const pt=points[id]||[.5,.5],px=c-r+pt[0]*r*2,py=c-r+pt[1]*r*2,d=Math.hypot(px-x,py-y);if(d<distance){nearest=id;distance=d}}
    if(distance<24){window.AshenGame?.travel(nearest)}
  });
})();

