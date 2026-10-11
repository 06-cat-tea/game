(() => {
  "use strict";
  const records={
    mira:{name:"米拉·烬语",role:"星图学徒",place:"town",position:{x:11.5,y:5.5},portrait:"米",color:"#9589d1",line:"她总在钟楼下抄录星图。最近，星盘指针指向了早已沉没的王城。",quest:"主线 · 星钟谜语",task:"调查森林石碑、护送灰炉商队，并前往月沼查明第十三声钟响。"},
    pella:{name:"佩拉婆婆",role:"药草师",place:"town",position:{x:14,y:10.5},portrait:"佩",color:"#c99b62",line:"镇上药师，记得每个人小时候的名字，也知道哪种草药能治失眠。",quest:"支线 · 雨后的药圃",task:"在低语森林采集 3 株银脉草，再回镇上交给佩拉。"},
    sylvi:{name:"希薇·苔歌",role:"林地医者",place:"wood",position:{x:7.5,y:9.5},portrait:"希",color:"#7ca879",line:"她照料森林里的迷路者，也在寻找被黑潮侵蚀的古老根系。",quest:"支线 · 根系的记忆",task:"协助读取两次遗迹碑文，找回古树的名字。"},
    toren:{name:"托伦·灰盾",role:"旧商路守卫",place:"pass",position:{x:7.5,y:11.5},portrait:"托",color:"#778c91",line:"盾牌上有三道旧裂纹。托伦说，每道都来自一个没能保护好的人。",quest:"支线 · 最后一辆矿车",task:"护送矿车穿过峡道。他也许愿意陪你走得更远。"},
    eira:{name:"艾拉祭司",role:"沉星守墓人",place:"fen",position:{x:13.5,y:11},portrait:"艾",color:"#998dc4",line:"她守着半沉的神殿，坚信王朝最后一任女王没有背叛人民。",quest:"支线 · 无名者之墓",task:"在王陵侧室找到两枚刻名的银币，再决定如何安葬它们。"},
    lian:{name:"连舟",role:"海崖灯守",place:"coast",position:{x:8,y:11},portrait:"连",color:"#75a3a7",line:"灯塔看守人。父亲曾乘上一艘没有船旗的船，再也没有回来。",quest:"支线 · 灯塔来信",task:"修复灯塔旧镜，替连舟确认雾里那艘船究竟驶向哪里。"}
  };
  const occupants={
    chapel:[{id:"eira",x:4.5,y:3.2}],
    inn:[{id:"innkeeper",name:"阿榆",role:"旅店老板",portrait:"榆",color:"#c49366",line:"炉火整夜不灭。要是听见有人谈起第十三声钟响，记下他们的名字。",quest:"边境消息",task:"旅店的门向赶路人敞开。坐一会儿，听听路上的消息。",service:"tavern",x:4.3,y:3.1}],
    guild:[{id:"guild-clerk",name:"岑书",role:"边境公会记录员",portrait:"岑",color:"#77949a",line:"每张委托都写着一个人的去处。别忘了，报酬之外还有没写在纸上的事。",quest:"公会委托",task:"公会公告板记录着各地委托与边境传闻。",service:"guild",x:5.5,y:3.2}],
    tower:[{id:"mira",x:5.7,y:3.1}],
    market:[{id:"shopkeeper",name:"陶枝",role:"行省杂货商",portrait:"陶",color:"#c69a63",line:"干粮、火石和药剂都备好了。雾起之前，最好把灯油也补足。",quest:"补给与传闻",task:"检查旅行补给，也许你会听见最近的商路消息。",service:"market",x:5.5,y:3.3}],
    hut:[{id:"sylvi",x:4.1,y:3.2}],
    waystation:[{id:"toren",x:5.7,y:3.3}],
    forge:[{id:"forge-master",name:"瓦恩",role:"灰炉锻造师",portrait:"瓦",color:"#b67d5a",line:"铁要趁热敲，誓言却得等冷下来再说。把材料放在台上，我替你看看。",quest:"锻造与修理",task:"灰炉的火仍然旺盛。带来矿石，就能打造更可靠的装备。",service:"forge",x:5.4,y:3.2}],
    lighthouse:[{id:"lian",x:4.4,y:3.4}],
    "fisher-hut":[{id:"ferryman",name:"阿沧",role:"潮汐渔人",portrait:"沧",color:"#6b9da3",line:"潮水退下去的时候，礁石会露出新的东西。只是别把海雾里的灯当成岸。",quest:"海岸见闻",task:"渔网、潮汐和沉船都有自己的记号。",service:"fish",x:4.4,y:3.2}]
  };
  const expansion=window.WorldContent;
  for(const[id,n]of Object.entries(records))n.type=expansion.oldTypes[id]||"villager";
  for(const list of Object.values(occupants))for(const n of list)n.type=expansion.oldTypes[n.id]||"villager";
  for(const[id,n]of Object.entries(expansion.residents)){
    records[id]={...n,portrait:n.name.slice(0,1),color:({knight:"#b6bdcf",noble:"#956489",bard:"#bf7560",mage:"#a48ecb",beastfolk:"#779078",orc:"#9a9871",skeleton:"#b4b4a2",demon:"#9c759e"})[n.type]||"#8da4a1"};
    if(!occupants[n.home])occupants[n.home]=[];
    occupants[n.home].push({id,type:n.type,x:occupants[n.home].length?6.5:4.4,y:occupants[n.home].length?4.5:3.2});
  }
  const indoorIndex=Object.values(occupants).flat().reduce((out,n)=>{out[n.id]={...records[n.id],...n};return out;},{});
  window.NPCSystem={all:records,indoor:indoorIndex,at:place=>Object.entries(records).filter(([,n])=>n.place===place).map(([id,n])=>({id,...n})),inside:id=>(occupants[id]||[]).map(n=>({...records[n.id],...n,id:n.id}))};
})();
