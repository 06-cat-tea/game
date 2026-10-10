(() => {
  "use strict";
  const items = {
    trailblade:{name:"巡路者短刃",slot:"weapon",rarity:"uncommon",text:"锻坊打制的可靠短刃，适合刚踏上边境的旅人。",stats:{atk:4}},
    moonbow:{name:"月纹长弓",slot:"weapon",rarity:"rare",text:"银叶木与星屑合铸的轻弓。",stats:{atk:7,crit:.04}},
    emberedge:{name:"余烬裁决",slot:"weapon",rarity:"epic",text:"炉心余火沿着刃纹缓慢流动。",stats:{atk:11,drain:.05}},
    wayfarerVest:{name:"行旅皮甲",slot:"armor",rarity:"uncommon",text:"轻便皮甲，缝线里嵌着柔韧草纤。",stats:{def:2,hp:10}},
    silverleafMail:{name:"银叶守望甲",slot:"armor",rarity:"rare",text:"森林遗文指引出的古老编甲。",stats:{def:4,hp:16,crit:.02}},
    ashplate:{name:"灰炉壁垒",slot:"armor",rarity:"epic",text:"厚重的锻造钢板，能承受熔核冲击。",stats:{def:8,hp:28}},
    herbCharm:{name:"草露护符",slot:"charm",rarity:"uncommon",text:"干燥草叶封存了林地的清晨。",stats:{hp:8,mana:8}},
    starstoneRing:{name:"星石戒环",slot:"charm",rarity:"rare",text:"星铁碎屑在环面凝成一圈微光。",stats:{atk:3,mana:16,crit:.04}},
    crownSigil:{name:"王朝余徽",slot:"charm",rarity:"epic",text:"沉星王朝的徽印仍回应着旧誓言。",stats:{atk:5,def:3,mana:20}}
  };
  const consumables = {
    potion:{name:"赤松药剂",desc:"恢复 40 点生命。",cost:{herb:2},gain:{potions:1}},
    tonic:{name:"月露灵剂",desc:"恢复 30 点法力。",cost:{herb:1,shard:1},gain:{mana:1}},
    whetstone:{name:"星铁磨刀石",desc:"永久提升基础攻击 1 点。仅能制作一次。",cost:{ore:2,shard:1},once:true,gain:{atk:1}}
  };
  const recipes = {
    trailblade:{name:"巡路者短刃",item:"trailblade",branch:"weapon",tier:1,requires:[],cost:{ore:2}},
    moonbow:{name:"月纹长弓",item:"moonbow",branch:"weapon",tier:2,requires:["trailblade"],cost:{ore:3,herb:2,shard:1}},
    emberedge:{name:"余烬裁决",item:"emberedge",branch:"weapon",tier:3,requires:["moonbow"],cost:{ore:5,shard:3}},
    wayfarerVest:{name:"行旅皮甲",item:"wayfarerVest",branch:"armor",tier:1,requires:[],cost:{herb:3,ore:1}},
    silverleafMail:{name:"银叶守望甲",item:"silverleafMail",branch:"armor",tier:2,requires:["wayfarerVest"],cost:{herb:4,shard:2}},
    ashplate:{name:"灰炉壁垒",item:"ashplate",branch:"armor",tier:3,requires:["silverleafMail"],cost:{ore:6,shard:2}},
    herbCharm:{name:"草露护符",item:"herbCharm",branch:"charm",tier:1,requires:[],cost:{herb:3}},
    starstoneRing:{name:"星石戒环",item:"starstoneRing",branch:"charm",tier:2,requires:["herbCharm"],cost:{ore:2,herb:2,shard:2}},
    crownSigil:{name:"王朝余徽",item:"crownSigil",branch:"charm",tier:3,requires:["starstoneRing"],cost:{ore:3,shard:4}}
  };
  window.CraftingSystem = { items, consumables, recipes, branches:{weapon:"武器锻造",armor:"护甲编织",charm:"饰品铭刻"} };
})();
