(() => {
  "use strict";
  const buildings = {
    town: [
      { id:"chapel", name:"晨星礼拜堂", kind:"chapel", x:3, y:2, w:2, d:2, h:94, action:"chapel", interior:"chapel", description:"守灯祭司在这里照看镇上的长烛与旅人。" },
      { id:"inn", name:"晨星旅店", kind:"inn", x:3, y:7, w:3, d:2, h:84, action:"tavern", interior:"inn", description:"酒馆里总有人带来地图边缘的新消息。" },
      { id:"guildhall", name:"边境公会", kind:"guild", x:8, y:5, w:3, d:2, h:116, action:"guild", interior:"guild", description:"公会的公告板记录着边境上的委托。" },
      { id:"clocktower", name:"晨星钟塔", kind:"tower", x:13, y:2, w:2, d:2, h:188, talk:"mira", interior:"tower", description:"米拉在钟塔下等候，星图的线索从这里开始。" },
      { id:"market", name:"行省杂货铺", kind:"shop", x:16, y:7, w:2, d:2, h:75, action:"market", interior:"market", description:"补充药剂、干粮和旅行装备。" }
    ],
    wood: [
      { id:"forest-hut", name:"林间小屋", kind:"hut", x:3, y:6, w:3, d:2, h:75, action:"forage", interior:"hut", description:"林地医者留下的草药和手记仍在屋内。" },
      { id:"moss-shrine", name:"苔痕遗迹", kind:"ruin", x:11, y:3, w:4, d:2, h:100, action:"ruins", description:"石碑上残留着古老的银叶文字。" },
      { id:"moon-well", name:"月井", kind:"well", x:16, y:9, w:2, d:2, h:32, action:"well", description:"井水映出白昼里看不见的星群。" }
    ],
    pass: [
      { id:"waystation", name:"峡道驿站", kind:"inn", x:3, y:9, w:3, d:2, h:72, action:"escort", interior:"waystation", description:"矿车在这里整队，车夫正寻找护卫。" },
      { id:"grayforge", name:"灰炉锻坊", kind:"forge", x:9, y:5, w:3, d:2, h:92, action:"forge", interior:"forge", description:"炉火可以锻造边境上少见的装备。" },
      { id:"caravan-yard", name:"矿车营地", kind:"camp", x:15, y:9, w:3, d:2, h:50, action:"mine", description:"矿工和车夫在此交换山脉情报。" }
    ],
    fen: [
      { id:"sunken-temple", name:"沉没神殿", kind:"temple", x:8, y:3, w:4, d:3, h:124, action:"temple", description:"神殿门后的王朝守卫仍未安息。" },
      { id:"royal-crypt", name:"王陵侧室", kind:"crypt", x:15, y:8, w:3, d:2, h:80, action:"crypt", description:"石棺的铭文记录着没有名字的人。" },
      { id:"moon-shrine", name:"净水祭坛", kind:"shrine", x:4, y:5, w:2, d:2, h:56, action:"purify", description:"祭坛上的灯火可以驱散黑水。" }
    ],
    coast: [
      { id:"lighthouse", name:"风葬灯塔", kind:"lighthouse", x:3, y:3, w:2, d:2, h:176, action:"lighthouse", interior:"lighthouse", description:"登上塔顶，修复旧镜并追寻无旗之船。" },
      { id:"fisher-hut", name:"潮汐渔屋", kind:"hut", x:11, y:8, w:3, d:2, h:70, action:"fish", interior:"fisher-hut", description:"渔屋门口的水桶里放着当天的收获。" },
      { id:"wreck-shrine", name:"沉船祭标", kind:"ruin", x:16, y:10, w:2, d:2, h:38, action:"wreck", description:"礁石旁的铜牌标出了沉船位置。" }
    ]
  };
  const interiors = {
    chapel:{ title:"晨星礼拜堂内室", room:"chapel" }, inn:{ title:"旅店内室", room:"inn" }, guild:{ title:"公会内室", room:"guild" }, tower:{ title:"钟塔内室", room