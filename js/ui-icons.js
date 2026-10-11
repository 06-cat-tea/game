(() => {
  "use strict";
  const labels={"main-quest":"主线任务","side-quest":"支线任务",character:"角色",backpack:"背包",skills:"技能",equipment:"装备",enhancement:"强化",crafting:"制作",map:"地图",exploration:"世界探索",combat:"战斗",rest:"休息",dialogue:"对话",affinity:"好感",achievement:"成就",save:"存档",load:"读档",settings:"设置",travel:"传送",title:"返回标题"};
  function icon(id,large=false){return `<img class="ui-icon${large?" large":""}" src="assets/icons/${id}-128.png" width="${large?64:32}" height="${large?64:32}" alt="" draggable="false">`;}
  window.UIIcons={labels,icon};
})();
