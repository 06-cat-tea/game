(() => {
  "use strict";
  // Expansion data stays separate from save handling, scene rendering and UI.
  const additions = {
    town: [
      {id:"royal-hall",name:"归灯王城",asset:"castle",x:21,y:1,w:4,d:3,interior:"royal-hall",action:"world:royal-record",description:"旧王城的接待厅重新开放，王朝后人整理流散的名字。"},
      {id:"artisan-quarter",name:"蓝瓦街区",asset:"town",x:21,y:8,w:3,d:2,interior:"artisan-quarter",action:"world:song",description:"喷泉旁的旅人交换故事，吟游诗人为这段旅途写下新篇。"},
      {id:"star-academy",name:"星环学院",asset:"academy",x:22,y:14,w:3,d:2,interior:"star-academy",action:"world:study",description:"星术课程与旧王朝抄本向所有旅者开放。"},
      {id:"alchemist-lab",name:"青瓶炼金室",asset:"alchemy",x:6,y:15,w:3,d:2,interior:"alchemist-lab",action:"world:brew",description:"药草在玻璃蒸馏器里化作旅行药剂。"},
      {id:"town-stables",name:"北路马厩",asset:"stable",x:15,y:15,w:3,d:2,interior:"town-stables",action:"world:supplies",description:"马夫为穿越五地的旅人准备干粮和缰绳。"},
      {id:"north-gate",name:"晨星北门",asset:"gate",x:1,y:0,w:2,d:1,interior:"north-gate",action:"world:drill",description:"守门骑士教授步伐与格挡，远处的雾正逐渐散开。"}
    ],
    wood: [{id:"windmill-farm",name:"银麦风车田",asset:"farm",x:21,y:11,w:4,d:3,interior:"windmill-farm",action:"world:harvest",description:"森林边缘的农户用草药和麦子换取旅行故事。"}],
    pass: [
      {id:"ridge-barracks",name:"灰盾兵营",asset:"barracks",x:22,y:2,w:3,d:2,interior:"ridge-barracks",action:"world:drill",description:"老兵训练新一代守卫，记录峡道上的安全路线。"},
      {id:"deep-mine",name:"玄铁矿场",asset:"mine",x:21,y:11,w:4,d:3,interior:"deep-mine",action:"world:ore-trade",description:"矿工与兽人匠人共同开采山腹深处的玄铁。"},
      {id:"ember-fortress",name:"熔火旧堡",asset:"demon-fortress",x:2,y:1,w:3,d:2,interior:"ember-fortress",action:"world:truce",description:"熔火旧堡的使者愿意以一次停战换取边境的信任。"}
    ],
    fen: [
      {id:"violet-rift",name:"紫晶地牢",asset:"rift",x:22,y:12,w:3,d:2,interior:"violet-rift",action:"world:archive",description:"裂隙旁的不死记录员仍记得每一位进入王陵的人。"},
      {id:"cloud-observatory",name:"云上观星城",asset:"sky-city",x:22,y:1,w:4,d:3,interior:"cloud-observatory",action:"world:study",description:"浮空城的落脚台连接王朝星路，学者整理夜空与黑潮的关系。"}
    ],
    coast: [{id:"tide-harbor",name:"归帆港",asset:"harbor",x:21,y:4,w:4,d:3,interior:"tide-harbor",action:"world:harbor-trade",description:"渡船靠岸，沿海商人把遗失的航路重新画在地图上。"}]
  };
  const existingAssets={chapel:"church",inn:"inn",guildhall:"guild",clocktower:"academy",market:"shop","forest-hut":"forest","moss-shrine":"ruins","moon-well":"ruins",waystation:"inn",grayforge:"forge","caravan-yard":"barracks","sunken-temple":"church","royal-crypt":"castle","moon-shrine":"ruins",lighthouse:"harbor","fisher-hut":"forest","wreck-shrine":"ruins"};
  const residents={
    "gate-knight":{name:"莉娅·晨盾",role:"北门骑士",type:"knight",place:"town",position:{x:5,y:1},home:"north-gate",service:"world:drill",line:"守门的职责，是让每一个出发的人知道还有一扇门等着他。",task:"训练每天可进行一次，获得经验并恢复少量生命。"},
    "royal-heir":{name:"鸢夫人",role:"王朝后裔",type:"noble",place:"town",position:{x:20,y:5},home:"royal-hall",service:"world:royal-record",line:"王印只能证明血统，镇上重新亮起的灯才能证明我们值得留下。",task:"查阅王室档案：首次获得王朝知识与星屑。"},
    "road-bard":{name:"露弦",role:"街头吟游诗人",type:"bard",place:"town",position:{x:20,y:11},home:"artisan-quarter",service:"world:song",line:"我会记住你的脚步声。下一首歌里，边境会多一条回家的路。",task:"每日听一首归途歌，恢复法力。"},
    "young-scholar":{name:"诺娅",role:"星环见习生",type:"girl",place:"town",position:{x:21,y:18},home:"star-academy",service:"world:study",line:"星星不会告诉我们答案，它只帮我们找到下一本该翻开的书。",task:"每日研究星盘，获得经验与少量法力。"},
    "alchemist":{name:"瑟琳",role:"青瓶炼金师",type:"mage",place:"town",position:{x:10,y:18},home:"alchemist-lab",service:"world:brew",line:"两束草药，一点耐心。药剂的光不来自魔法，是你准备继续走的念头。",task:"草药 2 → 药剂 1；好感 60 后每天首次制作赠送一瓶。"},
    "stable-hand":{name:"阿禾",role:"马厩饲养员",type:"villager",place:"town",position:{x:18,y:18},home:"town-stables",service:"world:supplies",line:"出发前摸摸马的额头。它会记住你的气味，也会把你带回熟悉的门口。",task:"金币 8 → 补给 2。"},
    "forest-warden":{name:"灰鬃",role:"林缘巡守",type:"beastfolk",place:"wood",position:{x:19,y:9},home:"hut",service:"world:herb-trade",line:"爪印不一定是危险。有些印记，是有人先替你试过泥地的深浅。",task:"金币 10 → 草药 2。"},
    "mill-farmer":{name:"麦叔",role:"银麦农户",type:"villager",place:"wood",position:{x:21,y:16},home:"windmill-farm",service:"world:harvest",line:"风车转起来的时候，森林里的雾也会慢一点。先装好干粮再上路吧。",task:"每日收获一次补给和草药。"},
    "ridge-scout":{name:"夜岚",role:"改过的峡道斥候",type:"bandit",place:"pass",position:{x:20,y:6},home:"ridge-barracks",service:"world:route",line:"我曾用这条小路逃走，现在愿意用它把人带回来。",task:"首次标记秘密小路，获得声望与经验。"},
    "mine-chief":{name:"岩牙",role:"玄铁矿头",type:"orc",place:"pass",position:{x:21,y:16},home:"deep-mine",service:"world:ore-trade",line:"矿石不分谁的手更粗。肯把同伴拉出塌方的人，就能分走同样的报酬。",task:"金币 12 → 矿石 2。"},
    "ember-envoy":{name:"赛芙",role:"熔火使者",type:"demon",place:"pass",position:{x:6,y:4},home:"ember-fortress",service:"world:truce",line:"我带来的不是新的火，是一张愿意签下名字的停战书。",task:"首次缔结停战获得信任与星屑，不改动主线进度。"},
    "silent-archivist":{name:"第七记录员",role:"无眠档案守卫",type:"skeleton",place:"fen",position:{x:21,y:16},home:"violet-rift",service:"world:archive",line:"我忘了自己的名字，却仍记得你身后每一盏灯属于谁。",task:"每日整理一页档案，获得经验和法力。"},
    "cloud-sage":{name:"温索",role:"云城星路长者",type:"elder",place:"fen",position:{x:21,y:5},home:"cloud-observatory",service:"world:study",line:"城可以漂在云里，但每个名字都得有一个落脚的地方。",task:"每日研究星路，获得经验与少量法力。"},
    "harbor-merchant":{name:"帆栗",role:"归帆港商人",type:"merchant",place:"coast",position:{x:20,y:8},home:"tide-harbor",service:"world:harbor-trade",line:"货物会再回来。真正值得等的是拿着船票的人。",task:"金币 10 → 补给 1、草药 1。"},
    "blue-traveler":{name:"伊澄",role:"蓝披风旅人",type:"hero",place:"coast",position:{x:18,y:15},home:"tide-harbor",service:"world:route",line:"那艘船离岸时，我答应替船上的人把回来的路线画完。",task:"首次补全沿海小路，获得声望与经验。"}
  };
  const oldTypes={mira:"mage",pella:"elder",sylvi:"archer",toren:"soldier",eira:"priest",lian:"hero",innkeeper:"innkeeper","guild-clerk":"quest-giver",shopkeeper:"merchant","forge-master":"blacksmith",ferryman:"villager"};
  const serviceNames={"royal-record":"查阅王室档案","song":"聆听归途歌","study":"研究星路","brew":"调配药剂 · 草药 2","supplies":"购买干粮 · 8 金币","drill":"守卫训练","harvest":"收获银麦","herb-trade":"购买草药 · 10 金币","ore-trade":"购买矿石 · 12 金币","route":"标记秘密小路","truce":"签订停战书","archive":"整理无眠档案","harbor-trade":"购买航海补给 · 10 金币"};
  function service(s,id,h){
    const key=id.replace("world:",""),one=["royal-record","route","truce"].includes(key),daily=["song","study","drill","harvest","archive"].includes(key),flag="world-service:"+key+":"+s.place;
    if(one&&s.flags[flag]||daily&&s.flags[flag]===s.day)return "这项行动已完成。";
    if(!serviceNames[key])return "未知的地区服务。";
    const cost={...({brew:{herb:2},supplies:{gold:8},"herb-trade":{gold:10},"ore-trade":{gold:12},"harbor-trade":{gold:10}}[key]||{})};
    if(cost.gold&&Object.entries(residents).some(([npc,n])=>n.place===s.place&&n.service===id&&s.relationships[npc]?.value>=60))cost.gold=Math.floor(cost.gold*.9);
    if(Object.entries(cost).some(([m,n])=>(m==="gold"?s.player.gold:s.inventory.materials[m])<n))return "材料或金币不足。";
    for(const[m,n]of Object.entries(cost))if(m==="gold")s.player.gold-=n;else s.inventory.materials[m]-=n;
    const st=h.stats(s);
    if(key==="royal-record"||key==="truce"){s.inventory.materials.shard++;s.world[key==="truce"?"trust":"knowledge"]++;s.player.xp+=25;}
    if(key==="study"||key==="archive"){s.player.xp+=15;s.player.mana=Math.min(st.maxMana,s.player.mana+8);}
    if(key==="song")s.player.mana=Math.min(st.maxMana,s.player.mana+20);
    if(key==="brew"){s.potions++;if(s.relationships.alchemist.value>=60&&s.flags["alchemy-bonus"]!==s.day){s.potions++;s.flags["alchemy-bonus"]=s.day;}}
    if(key==="supplies")s.supplies+=2;
    if(key==="drill"){s.player.xp+=20;s.player.hp=Math.min(st.maxHp,s.player.hp+8);}
    if(key==="harvest"){s.supplies++;s.inventory.materials.herb++;}
    if(key==="herb-trade")s.inventory.materials.herb+=2;
    if(key==="ore-trade")s.inventory.materials.ore+=2;
    if(key==="route"){s.player.rep++;s.player.xp+=25;}
    if(key==="harbor-trade"){s.supplies++;s.inventory.materials.herb++;}
    if(one||daily)s.flags[flag]=one?true:s.day;
    h.levelUp(s);h.log(s,serviceNames[key]+"：行动完成，收益已收入旅途记录。");return "";
  }
  window.WorldContent={additions,existingAssets,residents,oldTypes,serviceNames,service,grid:{columns:28,rows:20}};
})();
