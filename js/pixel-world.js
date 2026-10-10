(() => {
  "use strict";
  const W=1920,H=1080,S=4,LW=W/S,LH=H/S;
  const biomes={
    town:{sky:"#9fb8ae",far:"#829a88",hill:"#6d8b73",ground:"#68835d",path:"#b69b70",water:"#668c91",roof:"#80534a"},
    wood:{sky:"#879f91",far:"#526f5d",hill:"#3d5c4b",ground:"#456849",path:"#a99970",water:"#5d8179",roof:"#725b45"},
    pass:{sky:"#b59c7b",far:"#84735f",hill:"#675748",ground:"#8b7358",path:"#c2a270",water:"#597b7a",roof:"#704a3d"},
    fen:{sky:"#829a98",far:"#4c6864",hill:"#354e49",ground:"#536c58",path:"#a59b74",water:"#496d75",roof:"#555a50"},
    coast:{sky:"#9ab0a9",far:"#648286",hill:"#536a62",ground:"#828162",path:"#c2ae7b",water:"#4d7987",roof:"#7c5144"}
  };
  let x=0,y=0,keys=new Set(),frame=0,lastPaint=0,canvas,ctx,biome="town",talked=null;
  const rand=(n)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
  const rect=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(a),Math.round(b),Math.round(w),Math.round(h))};
  function cloud(a,b,s){rect(a,b,38*s,8*s,"#d7e0cf");rect(a+9*s,b-7*s,23*s,9*s,"#d7e0cf");rect(a+36*s,b+3*s,17*s,5*s,"#d7e0cf")}
  function tree(a,b,s,p){rect(a+s*.42,b+s*.57,s*.16,s*.4,"#554839");rect(a+s*.11,b+s*.23,s*.78,s*.44,p.hill);rect(a+s*.23,b+s*.06,s*.54,s*.42,p.far);rect(a+s*.32,b+s*.19,s*.15,s*.09,"#99ae70");rect(a+s*.57,b+s*.32,s*.14,s*.07,"#9db374")}
  function house(a,b,s,label,p,opts={}){const roof=opts.roof||p.roof,wall=opts.wall||"#d4c49d";rect(a-3,b+s*.34,s+6,s*.67,"#514a3e");rect(a,b+s*.34,s,s*.62,wall);rect(a-5,b+s*.29,s+10,s*.1,roof);rect(a+s*.12,b+s*.13,s*.76,s*.2,roof);rect(a+s*.25,b+s*.44,s*.18,s*.18,"#718b8c");rect(a+s*.59,b+s*.55,s*.2,s*.41,"#594a3e");rect(a+s*.64,b+s*.61,s*.08,s*.03,"#d4b966");rect(a+s*.18,b+s*.02,s*.12,s*.12,"#e7d5a8");rect(a+s*.2,b+s*.045,s*.08,s*.08,"#88a1a0");
    if(label){rect(a+s*.1,b+s*.28,s*.8,8,"#efe5ca");ctx.fillStyle="#353b35";ctx.font="7px sans-serif";ctx.textAlign="center";ctx.fillText(label,a+s*.5,b+s*.345)}
    if(opts.chimney){rect(a+s*.69,b+s*.02,s*.12,s*.31,"#76584a");rect(a+s*.65,b+s*.01,s*.2,5,"#584941")}
  }
  function tower(a,b,s,p){rect(a+s*.16,b+s*.18,s*.68,s*.82,"#b8b18c");rect(a+s*.06,b+s*.12,s*.88,s*.1,"#d5c69f");rect(a+s*.24,b+s*.04,s*.12,s*.15,"#9f916d");rect(a+s*.64,b+s*.04,s*.12,s*.15,"#9f916d");rect(a+s*.2,b+s*.34,s*.14,s*.18,"#526b70");rect(a+s*.66,b+s*.34,s*.14,s*.18,"#526b70");rect(a+s*.43,b+s*.53,s*.16,s*.47,"#594c40");rect(a+s*.31,b+s*.83,s*.38,s*.09,"#7b6449");}
  function forge(a,b,s,p){rect(a,b+s*.34,s,s*.62,"#9e7755");rect(a-5,b+s*.27,s+10,s*.14,"#514943");rect(a+s*.13,b+s*.43,s*.42,s*.53,"#353d39");rect(a+s*.21,b+s*.56,s*.25,s*.28,"#d77b43");rect(a+s*.27,b+s*.61,s*.14,s*.18,"#ffc578");rect(a+s*.62,b+s*.45,s*.25,s*.12,"#5d5550");rect(a+s*.67,b+s*.4,s*.15,s*.14,"#d9c8a0");}
  function ruin(a,b,s,p){rect(a+s*.1,b+s*.38,s*.19,s*.62,"#878b78");rect(a+s*.7,b+s*.17,s*.2,s*.83,"#798372");rect(a+s*.03,b+s*.28,s*.94,s*.13,"#a5a58b");rect(a+s*.26,b+s*.46,s*.16,s*.54,"#737c70");rect(a+s*.47,b+s*.4,s*.15,s*.6,"#89907e");rect(a+s*.12,b+s*.33,s*.72,s*.06,"#b2aa8c");rect(a+s*.37,b+s*.65,s*.3,s*.35,"#394b48");}
  function lighthouse(a,b,s,p){rect(a+s*.24,b+s*.19,s*.52,s*.8,"#e0d3ae");rect(a+s*.14,b+s*.13,s*.72,s*.1,"#765b4c");rect(a+s*.3,b+s*.02,s*.4,s*.14,"#574b42");rect(a+s*.35,b+s*.04,s*.3,s*.09,"#ffe29a");for(let i=0;i<4;i++)rect(a+s*(.31+i*.12),b+s*(.36+i*.1),s*.06,s*.09,"#778f8a");rect(a+s*.4,b+s*.76,s*.2,s*.23,"#51463f");}
  function sprite(a,b,palette,kind="human",scale=1){const skin=palette.skin||"#d6ae84",coat=palette.coat||"#9d6252",hair=palette.hair||"#493a31",px=scale;
    rect(a-6*px,b+25*px,13*px,3*px,"#31443a");
    // legs, boots, coat, sleeves, hands
    rect(a-4*px,b+18*px,4*px,8*px,"#413d39");rect(a+1*px,b+18*px,4*px,8*px,"#413d39");rect(a-5*px,b+24*px,5*px,3*px,"#292f30");rect(a+1*px,b+24*px,5*px,3*px,"#292f30");
    rect(a-6*px,b+6*px,12*px,13*px,coat);rect(a-8*px,b+8*px,4*px,9*px,coat);rect(a+5*px,b+8*px,4*px,9*px,coat);rect(a-9*px,b+15*px,3*px,4*px,skin);rect(a+6*px,b+15*px,3*px,4*px,skin);
    rect(a-4*px,b-2*px,8*px,9*px,skin);rect(a-5*px,b-5*px,10*px,4*px,hair);rect(a-5*px,b+2*px,3*px,2*px,"#292e2b");
    if(kind==="hood")rect(a-7*px,b-4*px,14*px,7*px,coat);if(kind==="staff"){rect(a+8*px,b-7*px,2*px,32*px,"#70523c");rect(a+6*px,b-10*px,6*px,5*px,"#e9cb78")}
  }
  function npcPositions(){return ({town:[{id:"mira",x:244,y:171,c:{coat:"#7069a0",hair:"#342f50"},kind:"staff"},{id:"pella",x:347,y:180,c:{coat:"#9b7851",hair:"#dad0ad"},kind:"hood"}],wood:[{id:"sylvi",x:355,y:178,c:{coat:"#63815a",hair:"#d1b47b"},kind:"staff"}],pass:[{id:"toren",x:373,y:177,c:{coat:"#697c7a",hair:"#524b42"},kind:"human"}],fen:[{id:"eira",x:361,y:178,c:{coat:"#7674a0",hair:"#dbd2c2"},kind:"staff"}],coast:[{id:"lian",x:350,y:180,c:{coat:"#648890",hair:"#51463d"},kind:"human"}]})[biome]||[]}
  function backdrop(p){const sky=ctx.createLinearGradient(0,0,0,LH);sky.addColorStop(0,p.sky);sky.addColorStop(.72,"#c9ceb0");sky.addColorStop(1,p.ground);ctx.fillStyle=sky;ctx.fillRect(0,0,LW,LH);
    rect(354,24,53,53,"#e1c98e");rect(363,18,36,7,"#f0dfae");cloud(54,35,1);cloud(190,57,.76);
    rect(0,123,LW,70,p.far);for(let i=0;i<12;i++){const a=i*48-20,top=91+rand(i+1)*49;rect(a,top,60,130,p.hill);rect(a+9,top+14,10,80,"#8fa183")}
    rect(0,178,LW,LH-178,p.ground);
    // terraced earth and floor tiles
    for(let row=0;row<9;row++)for(let col=0;col<20;col++){const a=col*25-(row%2)*12,b=190+row*10,n=col+row*23+biome.length*30;if(rand(n)>.66)rect(a,b,2+rand(n+3)*4,1+rand(n+5)*2,rand(n+6)>.5?"#9aaa70":"#4c704f")}
    // old stone road, perspective
    for(let row=0;row<13;row++){const yy=183+row*9,ww=78+row*18,xx=240-ww*.5;rect(xx,yy,ww,8,row%2?"#bea77b":"#b09a72");rect(xx+8,yy+1,ww-16,1,"#d0b98b")}
    // long-distance mountains and tiny pennants
    for(let i=0;i<7;i++){const a=i*83+7;rect(a,130+rand(i+50)*33,35,55,"#455e55");rect(a+13,121+rand(i+2)*30,9,17,"#536d5b")}
  }
  function sceneTown(p){house(26,129,86,"旅店",p,{chimney:true});house(130,119,79,"公会",p);tower(284,90,91,p);house(388,139,70,"杂货",p,{roof:"#9f744a"});
    // town gate, signboards and wells
    rect(4,139,12,70,"#c1b998");rect(0,137,18,9,"#766e59");rect(13,169,16,4,"#806246");rect(18,160,4,18,"#785d43");
    rect(221,150,35,4,"#745640");rect(228,154,3,20,"#5c493a");rect(248,154,3,20,"#5c493a");rect(226,143,27,9,"#e4d3a4");
    rect(94,202,25,6,"#786347");rect(98,192,17,12,"#98a69a");rect(102,197,8,6,"#607f82");
    // flower boxes + banners
    for(const [a,b] of [[45,171],[167,159],[407,185]]){rect(a,b,13,5,"#806344");rect(a+2,b-5,3,5,"#e0c887");rect(a+8,b-7,3,7,"#9eb474")}
    rect(302,155,5,35,"#665346");rect(298,155,19,15,"#b14c45");rect(327,155,5,35,"#665346");rect(323,155,18,15,"#e0bd6e");
  }
  function sceneWood(p){for(let i=0;i<11;i++){const a=i*48-10,b=83+rand(i+8)*44;tree(a,b,48+rand(i)*12,p)}
    // clearing, cottage, mossy shrine, giant root
    rect(120,155,245,115,"#526f4b");house(44,149,86,"林间小屋",p,{roof:"#665744",wall:"#b8b490"});
    ruin(277,139,111,p);rect(300,155,7,48,"#bcc68b");rect(330,155,7,48,"#9cad77");rect(316,159,6,43,"#d4c98e");
    // luminous well
    rect(177,203,44,11,"#695c45");rect(183,193,32,13,"#b8aa78");rect(187,196,24,8,"#79a69a");rect(195,197,7,5,"#c7d89e");
    for(let i=0;i<12;i++){const a=40+i*36,b=221+rand(i+12)*42;rect(a,b,4,3,"#bec982");rect(a+4,b+2,3,2,"#849e68")}
  }
  function scenePass(p){house(25,148,72,"驿站",p,{roof:"#64483f"});forge(123,128,82,p);house(286,147,90,"矿车营地",p,{roof:"#554b41",wall:"#aa9879"});
    // mountain strata and ore seam
    for(let i=0;i<7;i++){rect(i*70,114+rand(i+21)*28,48,90,"#705d4d");rect(i*70+12,132+rand(i+18)*19,6,24,"#b67b4a");rect(i*70+23,147,20,3,"#d09454")}
    // cart, track, blacksmith tools
    rect(236,204,100,5,"#55483b");rect(242,209,4,15,"#453f39");rect(326,209,4,15,"#453f39");rect(251,186,59,19,"#9a7147");rect(246,183,69,7,"#ba8e56");rect(257,207,13,13,"#454542");rect(297,207,13,13,"#454542");
    rect(96,208,41,7,"#53473e");rect(111,198,8,10,"#98704b");rect(101,193,30,5,"#c98048");
  }
  function sceneFen(p){for(let i=0;i<8;i++){const a=i*68+rand(i+39)*20;tree(a,126+rand(i+31)*33,47+rand(i)*15,{...p,hill:"#364d47",far:"#5a7060"})}
    ruin(99,120,150,p);ruin(320,147,106,p);
    // moon pool, stepping stones, lanterns
    rect(0,199,LW,71,p.water);rect(35,219,168,3,"#79a0a0");rect(241,201,165,4,"#7e9f91");
    for(let i=0;i<11;i++){const a=30+i*41,b=215+rand(i+77)*43;rect(a,b,24,7,"#9c9c79");rect(a+4,b+2,15,2,"#b1aa86")}
    for(const a of [65,278,420]){rect(a,167,3,43,"#695a45");rect(a-5,160,14,11,"#d6c174");rect(a-2,163,8,5,"#ffe4a0")}
  }
  function sceneCoast(p){rect(0,174,LW,96,p.water);for(let row=0;row<7;row++)for(let col=0;col<12;col++){const a=col*43+Math.sin(row+col)*11,b=183+row*13;rect(a,b,21+rand(row*14+col)*20,2,"#91aaa0")}
    // headland and lighthouse, pier and fishing boat
    rect(0,133,130,83,"#6c6f58");rect(0,129,132,13,"#9a916d");lighthouse(65,77,68,p);house(174,145,75,"渔屋",p,{roof:"#705148"});
    rect(284,211,126,8,"#705942");rect(296,219,6,24,"#574638");rect(384,219,6,24,"#574638");
    rect(330,198,65,16,"#9d604d");rect(338,188,37,11,"#d6cfac");rect(348,178,14,10,"#687d7a");rect(326,215,75,3,"#443c37");
    for(let i=0;i<7;i++){const a=20+i*54;rect(a,245+rand(i+80)*15,24,2,"#d6bd83")}
  }
  function draw(){if(!canvas?.isConnected||!canvas.closest("#screen-adventure")?.classList.contains("active"))return;const now=performance.now();if(now-lastPaint<32){requestAnimationFrame(draw);return}lastPaint=now;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.setTransform(S,0,0,S,0,0);ctx.imageSmoothingEnabled=false;
    const p=biomes[biome]||biomes.town;backdrop(p);({town:sceneTown,wood:sceneWood,pass:scenePass,fen:sceneFen,coast:sceneCoast}[biome]||sceneTown)(p);
    // ambient motes, grass and signage
    for(let i=0;i<54;i++){const a=rand(i+biome.length*90)*LW,b=194+rand(i+88)*72;if(rand(i+49)>.4)rect(a,b,2,2,i%3?"#d7c688":"#c7d8a0")}
    // NPC sprites drawn in front of architecture
    for(const npc of npcPositions()){sprite(npc.x,npc.y,npc.c,npc.kind,1);rect(npc.x-5,npc.y-16,10,5,"#f5e9ca");rect(npc.x-3,npc.y-14,2,2,"#bf7058");rect(npc.x+1,npc.y-14,2,2,"#bf7058");
      if(talked===npc.id){rect(npc.x-26,npc.y-33,53,12,"#f4e9cb");ctx.fillStyle="#35413a";ctx.font="7px sans-serif";ctx.textAlign="center";ctx.fillText("交谈中",npc.x,npc.y-25)} }
    const px=LW*.5+x,py=LH*.79+y+Math.sin(frame/8)*.7;sprite(px,py,{coat:"#a95548",hair:"#463630"},"hood",1.2);
    // foreground grasses and stepping sparkle
    for(let i=0;i<28;i++){const a=rand(i+211)*LW,b=244+rand(i+219)*25;rect(a,b,2,7,"#54734c");rect(a+2,b+2,3,5,"#75915c")}
    frame++;requestAnimationFrame(draw)
  }
  function invokeNearest(){const npc=npcPositions().map(n=>({...n,d:Math.hypot(LW*.5+x-n.x,LH*.79+y-n.y)})).sort((a,b)=>a.d-b.d)[0];if(npc&&npc.d<72){talked=npc.id;document.querySelector(`[data-talk="${npc.id}"]`)?.click()}else{const t=document.querySelector("#worldToast");if(t)t.textContent="靠近一位居民后按 E 交谈"}}
  function init(){canvas=document.querySelector("#pixelWorld");if(!canvas)return;ctx=canvas.getContext("2d",{alpha:false});biome=canvas.dataset.biome||"town";x=Number(canvas.dataset.x)||0;y=Number(canvas.dataset.y)||0;
    if(!window.__pixelKeys){window.__pixelKeys=true;document.addEventListener("keydown",e=>{if(document.querySelector("#screen-adventure.active")&&!document.querySelector("#modal.open")&&["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)&&!e.target.matches("input,textarea")){keys.add(e.key.toLowerCase());e.preventDefault()}if(document.querySelector("#screen-adventure.active")&&!document.querySelector("#modal.open")&&(e.key==="e"||e.key==="E")&&!e.target.matches("input,textarea")){invokeNearest();e.preventDefault()}});document.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()))}
    if(!window.__pixelLoop){window.__pixelLoop=true;const move=()=>{const speed=2.1;if(keys.has("arrowleft")||keys.has("a"))x=Math.max(-170,x-speed);if(keys.has("arrowright")||keys.has("d"))x=Math.min(170,x+speed);if(keys.has("arrowup")||keys.has("w"))y=Math.max(-60,y-speed);if(keys.has("arrowdown")||keys.has("s"))y=Math.min(58,y+speed);requestAnimationFrame(move)};move()}
    draw()
  }
  window.PixelWorld={init,move:(dx,dy)=>{x=Math.max(-170,Math.min(170,x+dx));y=Math.max(-60,Math.min(58,y+dy));canvas?.focus()},setTalking:id=>{talked=id}};
})();
