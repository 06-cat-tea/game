(() => {
  "use strict";
  const regions={
    town:{npc:"pella",name:"缺页的镇志",prop:"tower:star-chart",action:"guild",steps:["进入钟塔，调查星图台上的镇志缺页。","向公会核对被抹去的居民名册。"],reward:{xp:75,gold:45},clue:"镇志上的十三个名字对应十三盏灯。最后一盏写着‘归来者’。"},
    wood:{npc:"sylvi",name:"药圃下的旧誓",prop:"hut:field-notes",action:"ruins",steps:["进入林间小屋，读取医者的野外手记。","研究森林古碑，核对药圃下的誓言。"],reward:{xp:95,gold:55},clue:"古树不是封印的囚徒，而是自愿守门的人。"},
    pass:{npc:"toren",name:"熔炉旁的遗信",prop:"forge:anvil",action:"mine",steps:["在灰炉锻坊调查星铁砧台的旧印。","勘探矿脉，找到旧商队留下的信匣。"],reward:{xp:110,gold:65},clue:"运星车最后运送的不是兵器，而是让普通人离开的钥匙。"},
    fen:{npc:"eira",name:"无名灯的去处",prop:"chapel:prayer-book",action:"purify",steps:["回到晨星礼拜堂，调查祷告簿中的名字。","在月沼净化黑水，为无名者点起归灯。"],reward:{xp:125,gold:75},clue:"女王将自己的名字交给亡者，换来一条穿过黑水的路。"},
    coast:{npc:"lian",name:"潮线后的回音",prop:"lighthouse:captain-letter",action:"fish",steps:["在风葬灯塔调查浸水的信。","向潮汐渔人核对涨落，找回航船的回音。"],reward:{xp:105,gold:60},clue:"无旗之船一直载着尚未说出口的告别，等待灯塔给它一个方向。"}
  };
  const events={
    "town-lantern":{place:"town",title:"雨中的归灯",body:"佩拉门前的灯被雨浇灭。一名旅人握着半张旧镇志，犹豫是否还要进城。",options:[{name:"替他点灯",desc:"消耗草药 1，信任 +1，佩拉好感 +6。",cost:{herb:1},affinity:["pella",6],world:{trust:1},text:"药草的清香升起来，旅人终于推开城门。"},{name:"陪他核对名字",desc:"王朝知识 +1，获得 10 金币。",world:{knowledge:1},gold:10,text:"那个人的名字藏在旧镇志的折痕里。"}]},
    "town-clock":{place:"town",title:"迟到的一刻",body:"钟塔机芯在正午停顿。米拉发现有人用铜片堵住了第十三个齿槽。",options:[{name:"取下铜片交给米拉",desc:"米拉好感 +6，星屑 +1。",affinity:["mira",6],materials:{shard:1},text:"铜片上刻着女王年轻时的名字。"},{name:"把刻痕拓给公会",desc:"信任 +1，金币 +20。",world:{trust:1},gold:20,text:"书记员决定把被删去的那一刻补进年鉴。"}]},
    "wood-deer":{place:"wood",title:"银铃与猎套",body:"一只幼鹿困在生锈的猎套里。它颈上的银铃与古碑上的图案完全相同。",options:[{name:"用草药安抚它",desc:"消耗草药 1，希薇好感 +6，圣光 +1。",cost:{herb:1},affinity:["sylvi",6],world:{light:1},text:"幼鹿把你引到一段尚未被苔藓遮住的碑文。"},{name:"仔细研究银铃",desc:"知识 +1，星屑 +1。",world:{knowledge:1},materials:{shard:1},text:"你松开猎套，银铃留下了一道星屑的光。"}]},
    "wood-root":{place:"wood",title:"根下的路牌",body:"倒木下有一面旧路牌。朝向王城的箭头被反复划去，下面却留着药草师的记号。",options:[{name:"重新立起路牌",desc:"信任 +1，草药 +2。",world:{trust:1},materials:{herb:2},text:"迷路的旅人终于有了可以依靠的方向。"},{name:"抄下隐藏记号",desc:"知识 +1，希薇好感 +4。",world:{knowledge:1},affinity:["sylvi",4],text:"希薇认出这是祖母留下的返乡记号。"}]},
    "pass-cart":{place:"pass",title:"车轴上的旧盾",body:"矿车的车轴断了。车夫想拆下托伦的旧盾，用它垫住最后一段山路。",options:[{name:"用矿石修补",desc:"消耗矿石 1，托伦好感 +6，金币 +25。",cost:{ore:1},affinity:["toren",6],gold:25,text:"旧盾被留下，新的轴心支撑住了整队人的归途。"},{name:"替车队寻找绕路",desc:"信任 +1，补给 +1。",world:{trust:1},supplies:1,text:"你在山壁上找到了旧商路的白色石标。"}]},
    "pass-ember":{place:"pass",title:"炉底的白火",body:"瓦恩从冷却槽里捞出一颗仍然发光的火种。里面有一段运星车工匠的记忆。",options:[{name:"把火种归还锻坊",desc:"瓦恩好感 +6，矿石 +2。",affinity:["forge-master",6],materials:{ore:2},text:"瓦恩替火种添上炉灰，熔炉重新发出稳定的声响。"},{name:"记录火种中的记忆",desc:"知识 +1，星屑 +1。",world:{knowledge:1},materials:{shard:1},text:"工匠说，最好的门锁应该允许人回来。"}]},
    "fen-name":{place:"fen",title:"黑水上的银币",body:"银币在黑水上漂浮，每一枚都刻着名字。艾拉认出其中有她一直寻找的人。",options:[{name:"替她收好银币",desc:"艾拉好感 +6，圣光 +1。",affinity:["eira",6],world:{light:1},text:"那些名字终于离开黑水，被认真记在纸上。"},{name:"问亡者最后的愿望",desc:"影蚀 +1，星屑 +2。",world:{shadow:1},materials:{shard:2},text:"亡者只想让钟声不再把归来的路遮住。"}]},
    "fen-flame":{place:"fen",title:"没有影子的灯",body:"一盏长灯浮在神殿门前。它照亮泥水，却没有照出你的影子。",options:[{name:"以法力点亮归路",desc:"消耗法力 10，圣光 +1，艾拉好感 +4。",mp:10,world:{light:1},affinity:["eira",4],text:"灯光照出一列向城门走去的普通人。"},{name:"辨读灯座上的王印",desc:"知识 +1，金币 +20。",world:{knowledge:1},gold:20,text:"王印的背面刻着一个守门人的誓言。"}]},
    "coast-sail":{place:"coast",title:"漂来的无旗帆",body:"一片没有船徽的帆布挂在渔网上。阿沧说，它每次都在同一刻随潮水归来。",options:[{name:"替渔人修补网眼",desc:"消耗草药 1，阿沧好感 +6，补给 +2。",cost:{herb:1},affinity:["ferryman",6],supplies:2,text:"网眼重新收紧，帆布上的字迹显得清晰了。"},{name:"送帆布到灯塔",desc:"连舟好感 +6，知识 +1。",affinity:["lian",6],world:{knowledge:1},text:"连舟认出父亲常用的缝帆方式。"}]},
    "coast-bell":{place:"coast",title:"海雾里的三声钟",body:"海雾里传来三声钟，灯塔回应了两声。连舟等着你决定最后一声该如何响起。",options:[{name:"以灯镜回应航船",desc:"消耗法力 8，圣光 +1，星屑 +1。",mp:8,world:{light:1},materials:{shard:1},text:"雾中亮起一条朝向远海的路。"},{name:"为归来的船留灯",desc:"信任 +1，连舟好感 +6。",world:{trust:1},affinity:["lian",6],text:"钟声结束了，灯还在岸上安静地亮着。"}]}
  };
  const items={
    trialMedal:{name:"归灯试炼徽章",slot:"charm",rarity:"rare",text:"公会把你的名字刻在徽章背面。",stats:{atk:2,def:2,hp:10}},
    mooncrownBow:{name:"月冠守望弓",slot:"weapon",rarity:"rare",text:"银铃从弓臂落下，守卫的誓言仍在弦上。",stats:{atk:8,crit:.05}},
    moltenPlate:{name:"熔心铠",slot:"armor",rarity:"epic",text:"冷却的熔核凝成厚实甲片。",stats:{def:7,hp:24}},
    starPact:{name:"沉星契印",slot:"charm",rarity:"epic",text:"它承认的不是君主，而是每一位归来的人。",stats:{atk:4,mana:22,def:2}},
    fogblade:{name:"雾航长刃",slot:"weapon",rarity:"epic",text:"刀锋像一条穿过白雾的航路。",stats:{atk:10,crit:.05,drain:.04}}
  };
  const bossDefs=[
    ["town","公会归灯试炼",2,95,13,"trialMedal","老教官敲了敲训练盾。‘看清招式，再决定什么时候进攻。’","shield"],
    ["wood","月井冠角守卫",3,135,17,"mooncrownBow","银铃突然安静下来，井水映出一轮破碎的月冠。","poison"],
    ["pass","灰炉熔核领主",4,180,21,"moltenPlate","炉火向山腹退去，一颗巨大的熔核缓慢站起。","burn"],
    ["fen","沉星王朝守卫",5,220,25,"starPact","半沉的王印亮起，守卫要你说出那些被抹去的名字。","vulnerable"],
    ["coast","无旗船的守航者",4,165,20,"fogblade","雾里走来一名没有影子的船长。他仍在等待最后一道灯光。","poison"]
  ];
  const challenges=Object.fromEntries(bossDefs.flatMap(([place,name,level,hp,power,item,line,status])=>[
    [`boss-${place}`,{id:`boss-${place}`,place,name,level,hp,power,xp:hp,gold:[45+level*8,65+level*10],boss:true,elite:true,item,line,status}],
    [`elite-${place}`,{id:`elite-${place}`,place,name:{town:"公会盾卫陪练",wood:"荆棘狼首",pass:"熔痕掠夺队长",fen:"黑水执灯者",coast:"雾岸弩手"}[place],level:Math.max(1,level-1),hp:Math.floor(hp*.65),power:power-3,xp:Math.floor(hp*.55),gold:[20+level*4,32+level*6],elite:true,line:"敌人调整了架势。观察下一回合预告，可以减少受到的伤害。",status}]
  ]));
  const roomServices={chapel:"chapel",inn:"rest",guild:"guild",tower:"knowledge",market:"market",hut:"forage",waystation:"rest",forge:"crafting",lighthouse:"lighthouse","fisher-hut":"fish"};
  function accept(s,place){if(!regions[place]||s.regionQuests[place])return false;s.regionQuests[place]={stage:0,done:false};return true;}
  function progress(s,kind,id,hooks){for(const [place,q]of Object.entries(s.regionQuests)){const r=regions[place];if(!r||q.done)continue;if((q.stage===0&&kind==="prop"&&id===r.prop)||(q.stage===1&&kind==="action"&&s.place===place&&id===r.action)){q.stage++;if(q.stage===2){q.done=true;s.player.xp+=r.reward.xp;s.player.gold+=r.reward.gold;window.GrowthSystem.addAffinity(s,r.npc,10);hooks.log(s,`支线「${r.name}」完成。${r.clue}`);hooks.levelUp(s);}}}if(s.regionQuests.epilogue?.stage===0&&kind==="prop"&&id==="tower:clockwork"&&Object.keys(regions).every(k=>s.regionQuests[k]?.done))s.regionQuests.epilogue.stage=1;}
  function epilogue(s,hooks){if(s.storyStage<8)return "补全星图后才会开放收尾任务。";const q=s.regionQuests.epilogue||(s.regionQuests.epilogue={stage:0,done:false});if(q.done)return "归灯已亮起。";if(q.stage!==1)return "先完成五区域调查，再去钟塔调查机芯。";q.stage=2;q.done=true;s.player.xp+=220;s.player.gold+=160;s.inventory.materials.shard+=3;window.GrowthSystem.addAffinity(s,"mira",10);hooks.levelUp(s);hooks.log(s,"收尾任务「归灯之后」完成。五地的名字重新写入星图，钟声终于有了归处。");return "";}
  window.RegionContent={regions,events,items,challenges,roomServices,accept,progress,epilogue};
})();
