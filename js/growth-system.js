(() => {
  "use strict";
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const costs=[{ore:2,shard:0,gold:30},{ore:4,shard:1,gold:60},{ore:6,shard:2,gold:100}];
  const npcs=()=>({...window.NPCSystem.indoor,...window.NPCSystem.all});
  function normalize(s){
    s.enhancements={...(s.enhancements||{})};for(const id in s.enhancements)s.enhancements[id]=Math.floor(clamp(s.enhancements[id],0,3));
    s.relationships={...(s.relationships||{})};for(const id of Object.keys(s.relationships))if(!npcs()[id])delete s.relationships[id];
    for(const id of Object.keys(npcs())){const r=s.relationships[id]||{};s.relationships[id]={value:clamp(r.value??((s.party.bonds[id]||0)*20),0,100),chatDay:Number(r.chatDay)||0,giftDay:Number(r.giftDay)||0};}
    syncBonds(s);
    s.exploration={regions:[],buildings:[],props:[],events:[],challenges:[],...(s.exploration||{})};
    for(const k in s.exploration)s.exploration[k]=[...new Set(Array.isArray(s.exploration[k])?s.exploration[k].filter(x=>typeof x==="string"):[])];
    s.metrics={wins:0,eliteWins:0,bossWins:0,...(s.metrics||{})};for(const key of ['wins','eliteWins','bossWins'])s.metrics[key]=Math.floor(clamp(s.metrics[key],0,1000000));
    s.challengeWins={...(s.challengeWins||{})};s.regionQuests={...(s.regionQuests||{})};s.achievements={...(s.achievements||{})};
    return s;
  }
  function syncBonds(s){for(const id in s.relationships)s.party.bonds[id]=Math.floor(s.relationships[id].value/20);}
  function addAffinity(s,id,n){if(!s.relationships[id])return; s.relationships[id].value=clamp(s.relationships[id].value+n,0,100);syncBonds(s);}
  function chat(s,id){const r=s.relationships[id];if(!r)return false;if(r.chatDay===s.day)return false;r.chatDay=s.day;addAffinity(s,id,4);return true;}
  function gift(s,id){const r=s.relationships[id];if(!r)return "未结识这位居民。";if(r.giftDay===s.day)return "今天已经赠送过礼物。";const mat=id==="forge-master"||id==="toren"?"ore":id==="mira"||id==="eira"?"shard":"herb";if(s.inventory.materials[mat]<1)return `缺少${{ore:"矿石",herb:"草药",shard:"星屑"}[mat]} 1 份。`;s.inventory.materials[mat]--;r.giftDay=s.day;addAffinity(s,id,6);return "";}
  function bonus(s,id,item){const level=s.enhancements[id]||0;if(!level)return {...item.stats};return {...item.stats,...(item.slot==="weapon"?{atk:(item.stats.atk||0)+level*2}:item.slot==="armor"?{def:(item.stats.def||0)+level,hp:(item.stats.hp||0)+level*4}:{mana:(item.stats.mana||0)+level*4})};}
  function missing(s,id){const c=costs[s.enhancements[id]||0];if(!c)return ["已达到 +3 上限"];return Object.entries(c).filter(([k,n])=>(k==="gold"?s.player.gold:s.inventory.materials[k])<n).map(([k,n])=>`${{ore:"矿石",shard:"星屑",gold:"金币"}[k]}缺少 ${n-(k==="gold"?s.player.gold:s.inventory.materials[k])}`);}
  function enhance(s,id){if(!s.inventory.owned.includes(id))return "未拥有该装备。";const lack=missing(s,id);if(lack.length)return lack.join("、");const c=costs[s.enhancements[id]||0];for(const [k,n]of Object.entries(c))if(k==="gold")s.player.gold-=n;else s.inventory.materials[k]-=n;s.enhancements[id]=(s.enhancements[id]||0)+1;return "";}
  function discover(s,kind,id){if(id&&!s.exploration[kind].includes(id))s.exploration[kind].push(id);}
  const countDone=s=>Object.values(s.quests).filter(q=>q?.done).length+Object.values(s.regionQuests).filter(q=>q?.done).length+Object.values(s.expeditions||{}).filter(q=>q?.done).length+Object.values(s.personalQuests||{}).filter(q=>q?.done).length;
  const achievements=[
    ["explore1","第一张地图","发现 2 个区域",s=>s.exploration.regions.length>=2,20],
    ["explore2","推开门扉","发现 5 座建筑",s=>s.exploration.buildings.length>=5,40],
    ["explore3","边境绘图师","发现全部区域和 10 件室内物件",s=>s.exploration.regions.length>=5&&s.exploration.props.length>=10,80],
    ["quest1","值得记住的事","完成 1 项任务",s=>countDone(s)>=1,25],
    ["quest2","居民的信任","完成 5 项任务",s=>countDone(s)>=5,50],
    ["quest3","第十三声钟","补全主线星图",s=>s.storyStage>=8,100],
    ["battle1","守住第一夜","赢得 1 场战斗",s=>s.metrics.wins>=1,25],
    ["battle2","精英猎手","击败 5 名精英",s=>s.metrics.eliteWins>=5,60],
    ["battle3","五地守望","完成五区域挑战",s=>Object.keys(s.challengeWins).filter(k=>k.startsWith("boss-")&&s.challengeWins[k]>0).length>=5,120],
    ["growth1","新的技艺","学习 1 项技能",s=>s.learned.length>=1,20],
    ["growth2","旅行工匠","完成 3 种配方",s=>new Set(s.crafted).size>=3,45],
    ["growth3","淬炼之锋","将装备强化到 +3",s=>Object.values(s.enhancements).some(n=>n>=3),80],
    ["bond1","初识边境","任意居民好感达到 20",s=>Object.values(s.relationships).some(r=>r.value>=20),20],
    ["bond2","同行之誓","任意居民好感达到 60",s=>Object.values(s.relationships).some(r=>r.value>=60),50],
    ["bond3","归处","三位居民好感达到 80",s=>Object.values(s.relationships).filter(r=>r.value>=80).length>=3,100]
  ].map(([id,name,desc,check,gold])=>({id,name,desc,check,gold,kind:id.replace(/\d/g,"")}));
  function updateAchievements(s){for(const a of achievements)if(a.check(s))s.achievements[a.id]={complete:true,claimed:!!s.achievements[a.id]?.claimed};}
  function claim(s,id){const a=achievements.find(a=>a.id===id);updateAchievements(s);if(!a||!s.achievements[id]?.complete||s.achievements[id].claimed)return false;s.achievements[id].claimed=true;s.player.gold+=a.gold;s.inventory.materials.shard++;return true;}
  const stories={
    mira:["我小时候总以为钟塔会替人保管失去的时间。后来才发现，是镇上的人每天重新给它上弦。","星图背面的墨迹写着女王的乳名。她把王印留在城里，带走的只有一盏普通的灯。"],
    pella:["年轻时我跟着矿车走遍五地。那些药方都记在行囊的内衬上，下雨也不会丢。","镇志缺页前，有个人把十三个名字抄到了钟塔星图台。去那里看看。"],
    sylvi:["祖母教我认草药的时候，总先让我记住树的名字。她说，治好伤口也要让人知道归处。","小屋的手记夹着一段旧根系的誓言，它与森林古碑上的刻痕相同。"],
    toren:["盾上的三道裂纹不是败仗留下的。那晚我守住了山口，却没来得及记住离开的人。","瓦恩的星铁砧台藏着旧商队的印记。矿脉里也许还有那封遗信。"],
    eira:["我不是从王城逃出来的祭司。我留下，是因为有很多人再也说不出自己的名字。","晨星礼拜堂的祷告簿记着女王送出去的灯。黑水底下的人还在等它们。"],
    lian:["父亲总把灯塔的钥匙放在窗台，说海风会比他先回来。我一直没动那个位置。","灯塔里那封浸水的信，还有一行写着潮水倒流的时刻。阿沧可能知道。"],
    innkeeper:["这座旅店原来只有一间厨房。每当有人在雨里敲门，祖父就再添一张床。","旅客名册上同时离开的那些人，都曾问过灰炉的白火。"],
    "guild-clerk":["我的第一份工作，是替不会写字的车夫给家里写信。比起报酬，我更相信回信。","地图桌上擦去的路线原本通向王城北门。钟塔上的星图能补全它。"],
    shopkeeper:["铺子的第一本账簿是我母亲留下的。她从来不把欠账的名字划掉，只等他们回来。","有人用王朝银币换走的灯塔镜片，刻着一个守航者的名字。"],
    "forge-master":["师父告诉我，铁冷下来后会记住每一次敲击。所以我从不用怒气下锤。","砧台的星形凹痕和矿脉的信匣是同一位工匠做的。"],
    ferryman:["以前我也想出海。后来发现，守着一张好网，也能把远处的消息带回来。","潮位刻尺上那道反向的刻痕，与海雾的三声钟总在同一晚出现。"]
  };
  window.GrowthSystem={normalize,addAffinity,chat,gift,bonus,missing,enhance,costs,discover,achievements,updateAchievements,claim,npcs,stories};
})();
