(() => {
  "use strict";
  const GEAR_RECIPES=window.CraftingSystem.recipes;
    const SLOT = { weapon:"武器", armor:"护甲", charm:"饰品" };
    const RARITY = { common:"寻常", uncommon:"精良", rare:"稀有", epic:"史诗", legendary:"传奇" };
    const ITEMS = {
      sword:{name:"铁刃短剑",slot:"weapon",rarity:"common",text:"陪许多边境佣兵走完最后一程的旧剑。",stats:{atk:2}},
      cloak:{name:"旅者斗篷",slot:"armor",rarity:"common",text:"厚实的羊毛内衬，肩头还留着旧雨痕。",stats:{def:1,hp:5}},
      bow:{name:"鹿角长弓",slot:"weapon",rarity:"uncommon",text:"木身轻韧，弓臂雕着一圈银叶纹。",stats:{atk:5,crit:.04}},
      ward:{name:"铜纹胸甲",slot:"armor",rarity:"uncommon",text:"胸甲上的咒纹能将钝击卸向一侧。",stats:{def:3,hp:12}},
      bracer:{name:"玄铁护腕",slot:"charm",rarity:"rare",text:"每一道刮痕都记录着一次及时的格挡。",stats:{def:2,atk:2}},
      ring:{name:"星铁戒指",slot:"charm",rarity:"rare",text:"戒面映着并不存在于白昼的星群。",stats:{atk:3,mana:12,crit:.03}},
      mail:{name:"银叶轻甲",slot:"armor",rarity:"rare",text:"精灵旧工艺留下的轻甲，几乎听不见它的摩擦声。",stats:{def:4,hp:12,crit:.05}},
      ember:{name:"熔痕弯刃",slot:"weapon",rarity:"rare",text:"刀锋储着灰炉深处的余温，命中时会灼痛伤口。",stats:{atk:7,drain:.07}},
      moon:{name:"星辉护符",slot:"charm",rarity:"epic",text:"月沼祭司以最后一缕月光封存的护符。",stats:{atk:3,def:2,mana:20}},
      plate:{name:"灰烬战铠",slot:"armor",rarity:"epic",text:"沉重却可靠，铠甲边缘仍有熔炉的暗红光泽。",stats:{def:7,hp:24}},
      oath:{name:"誓约长锋",slot:"weapon",rarity:"epic",text:"圣银长锋。对亡灵挥下时，旧誓言会发出回响。",stats:{atk:10,crit:.06}},
      crown:{name:"沉星冠碎",slot:"charm",rarity:"legendary",text:"王冠残片在掌心跳动，仿佛仍有一位君主活着。",stats:{atk:8,mana:22,crit:.1}}
    };
    Object.assign(ITEMS, window.CraftingSystem.items);
    const PLACES = {
      town:{name:"晨星镇",region:"边境行省",danger:1,tags:["集市","公会","神殿"],art:"晨星镇",desc:"灰色城墙倚着北方山脊，钟塔上的铜铃总比太阳早一步醒来。猎人把湿斗篷挂在酒馆外，吟游诗人则在炉边讲述没人完全相信的故事。镇民记得每一个回来的人，也记得每一个没有回来的人。",actions:[["tavern","酒馆听闻","听商旅与退役佣兵交换消息，常能找到新的委托。"],["guild","公会委托","接受边境公会的悬赏，追踪你的冒险履历。"],["chapel","晨星礼拜堂","向守灯祭司祈祷，恢复少量法力并开启圣烛委托。"],["market","市集补给","购买药剂、干粮与基础装备。"]]},
      wood:{name:"低语森林",region:"银叶林地",danger:2,tags:["草药","精灵遗迹","野兽"],art:"低语森林",desc:"银叶在无风时也会彼此摩擦，像隔着很远的年代有人在说话。林间的老路被苔藓吞没，偶尔露出的石碑刻着不属于人类的名字。猎人说夜里有一头戴着月冠的白鹿，会把迷路者带向不同的归途。",actions:[["forage","采集林药","搜集草药和苔晶，可换钱，也能调制旅行药剂。"],["ruins","研究遗迹","辨读残缺的精灵文字，推进银叶遗文任务。"],["hunt","追踪猎物","在林间寻找狼群与腐化树精。"],["well","探查月井","检查一口被根系缠绕的古井，可能发现饰品或守卫。"]]},
      pass:{name:"余烬峡道",region:"灰炉山脉",danger:3,tags:["商路","矿脉","盗匪"],art:"余烬峡道",desc:"石壁像被巨火舔过，矿车在峡谷里留下不断延伸的轨迹。山路两侧的旧旗早已烧成黑线，只有灰炉铁匠还坚持在这里点着火。他说山腹深处的熔核仍记得龙族的名字。",actions:[["escort","护送矿车","护卫商队穿越峡道。偶尔会遇上劫掠者。"],["mine","勘探矿脉","采矿换取金币，也有机会找到锻造装备。"],["camp","挑战盗匪营地","高危险悬赏，盗匪头目携带独特战利品。"],["forge","拜访灰炉铁匠","完成矿脉委托后可购入重甲与稀有武器。"]]},
      fen:{name:"月沼遗境",region:"沉星湿地",danger:4,tags:["王朝遗迹","亡灵","禁术"],art:"月沼遗境",desc:"月光落在沼泽上，却照不出天空。半沉的神殿仍保存着旧王朝最后一场加冕仪式，黑水里有时会浮起刻着人名的银币。每个走到这里的人都会听见不同的声音。",actions:[["temple","进入沉没神殿","追寻沉星王朝覆灭的真相。"],["purify","净化黑水","消耗法力驱散腐化，赢得祭司与幸存者的信任。"],["crypt","探索王陵侧室","寻找王朝记录，也可能惊醒沉睡的守卫。"],["whisper","聆听亡语","借取禁术力量，代价由未来的你偿还。"]]},
      coast:{name:"风葬海崖",region:"西境海岸",danger:2,tags:["海雾","沉船","走私者"],art:"风葬海崖",desc:"崖下的白浪日夜敲击黑色礁石，雾笛从废弃灯塔里传出来。渔民说海雾中有一艘不挂旗帜的船，每逢无月之夜就会靠岸，船上没有活人，却总有人声。",actions:[["wreck","搜寻沉船","在退潮时搜索沉船货舱，收获物资或遭遇海盗。"],["lighthouse","攀登废灯塔","点亮灯塔旧镜，可能为西境航路带来改变。"],["fish","钓取潮汐鱼","安全地取得食物与少量金币。"]]}
    };
    const ENEMIES = {
      wood:[{name:"狼影群首",hp:58,power:11,xp:38,gold:[18,34],loot:["mail"],line:"巨狼压低肩背，银色瞳孔里没有野兽的迟疑。"},{name:"腐化树精",hp:72,power:13,xp:46,gold:[22,40],loot:["bracer"],line:"枯枝从泥土里拔出，树皮裂缝流出黑色树脂。"},{name:"月井守鹿",hp:78,power:14,xp:52,gold:[25,48],loot:["ring"],line:"它的鹿角挂满小小的银铃，每一声都让你的影子慢半拍。"}],
      pass:[{name:"焦痕掠夺者",hp:86,power:16,xp:62,gold:[35,60],loot:["ember"],line:"盗匪首领没有喊话，只把弯刀转了一圈。刀锋上的热光说明一切。"},{name:"熔核幼兽",hp:95,power:17,xp:70,gold:[40,66],loot:["plate"],line:"一团岩浆从裂口中翻身爬出，背甲像烧红的铁砧。"},{name:"灰炉流亡骑士",hp:110,power:19,xp:82,gold:[46,74],loot:["ward"],line:"骑士的面甲里空无一物，旧王旗却仍绑在断枪上。"}],
      fen:[{name:"月蚀亡语者",hp:118,power:21,xp:100,gold:[60,96],loot:["moon"],line:"祭司的嘴唇没有动，四周却响起一群人的告别。"},{name:"沉星守门人",hp:132,power:24,xp:126,gold:[80,120],loot:["crown"],line:"石像从水中站起，掌心的王朝印记逐渐亮成白昼。"},{name:"黑沼王嗣残影",hp:148,power:26,xp:142,gold:[88,132],loot:["oath"],line:"残影仍戴着半边王冠，另一半脸上有一道你熟悉的伤痕。"}],
      coast:[{name:"雾岸走私客",hp:68,power:13,xp:45,gold:[24,42],loot:["bow"],line:"海雾后传来弩机绷紧的声音。对方显然不想让你看见货物。"},{name:"礁背巨蟹",hp:84,power:15,xp:58,gold:[20,44],loot:["bracer"],line:"礁石忽然抬起两只巨钳，海藻间闪着一枚沉船徽章。"}]
    };
    const QUESTS = {
      first:{name:"边境新人的名册",kind:"探索",desc:"完成三次旅途行动，让公会知道你的名字不会很快消失。",goal:3,reward:{xp:55,gold:55,rep:2}},
      pages:{name:"银叶遗文",kind:"探索",desc:"在低语森林研究两次碑文，找出封印黑潮的咒句。",goal:2,reward:{xp:65,rep:3,item:"mail"}},
      caravan:{name:"峡道商路",kind:"委托",desc:"成功护送两次矿车，让晨星镇和灰炉重新恢复往来。",goal:2,reward:{xp:80,gold:110,rep:3,item:"ward"}},
      candle:{name:"圣烛未熄",kind:"信仰",desc:"在礼拜堂祈祷两次，并在月沼净化一次黑水。",goal:3,reward:{xp:90,rep:5,item:"oath"}},
      moon:{name:"沉星的回声",kind:"主线",desc:"深入沉没神殿两次，听清王朝最后的誓言。",goal:2,reward:{xp:140,gold:130,item:"moon"}},
      wreck:{name:"无旗之船",kind:"传闻",desc:"在风葬海崖搜寻沉船三次，找到幽灵船靠岸的证据。",goal:3,reward:{xp:85,gold:75,rep:2,item:"ring"}},
      pact:{name:"冠冕的低语",kind:"抉择",desc:"探索王陵并聆听亡语，决定沉星王冠该归于何处。",goal:2,reward:{xp:150,item:"crown"}},
      stars:{name:"主线 · 星钟谜语",kind:"主线",desc:"跟随米拉的星图，从森林石碑、灰炉商路追查到月沼神殿，找出第十三声钟响的真相。",goal:7,reward:{xp:180,gold:140,rep:6,item:"moon"}},
      herbs:{name:"支线 · 雨后的药圃",kind:"居民委托",desc:"佩拉需要三株银脉草为镇民配制退烧药。",goal:3,reward:{xp:45,gold:40}},
      roots:{name:"支线 · 根系的记忆",kind:"居民委托",desc:"与希薇一起读取两处森林碑文，找回古树的名字。",goal:2,reward:{xp:55,rep:2,item:"mail"}},
      names:{name:"支线 · 无名者之墓",kind:"居民委托",desc:"艾拉请你在王陵中寻找两枚刻名银币。",goal:2,reward:{xp:70,gold:45}},
      letters:{name:"支线 · 灯塔来信",kind:"居民委托",desc:"为连舟修复灯塔旧镜，查明父亲留下的最后一封信。",goal:1,reward:{xp:60,gold:50}}
    };
    const COMPANIONS = {
      mira:{name:"米拉·烬语",role:"星术师",bio:"在晨星镇钟塔下长大的星术学徒。她把星座当成地图，也把地图当成一种道歉。",join:"知识达到 1 或声望达到 2 后可招募。",cost:35,bonus:{mana:12,crit:.03},gift:"我会记下你每一次选择。不是为了判断你，只是怕有一天你自己忘了。"},
      toren:{name:"托伦·灰盾",role:"守誓卫士",bio:"曾为灰炉商路守夜的退役卫士。盾牌上有三道旧裂纹，他说每道都来自一个没能保护好的人。",join:"抵达余烬峡道且边境信任达到 1 后可招募。",cost:50,bonus:{def:3,hp:15},gift:"站到我身后。今天我还站得住。"},
      sylvi:{name:"希薇·苔歌",role:"林地医者",bio:"懂得辨认草药、沉默和谎言的林地医者。她很少问伤口怎么来的，只问你还想不想继续走。",join:"净化过黑水或在礼拜堂祈祷后可招募。",cost:45,bonus:{hp:10,mana:8},gift:"别把伤口当成勋章。活下来本身就够难了。"}
    };
    const JOBS = Object.fromEntries(Object.entries(window.SkillTree.jobs).map(([id,j])=>[id,{...j,skills:Object.keys(window.SkillTree.skills).filter(skill=>window.SkillTree.skills[skill].job===id)}]));
    const SKILLS = window.SkillTree.skills;
    const RECIPES = {...window.CraftingSystem.consumables,...window.CraftingSystem.recipes};
    const EVENTS = {
      tavern:{title:"炉火边的三种说法",body:"酒馆的火苗被门缝里的风压得很低。退役佣兵说森林里有会认人的古碑；商队账房说峡道的铁价一夜翻倍；披灰斗篷的旅人则把一枚刻着沉星纹的银币推到你面前。你可以选择相信谁，也可以把三条消息都记下来。",options:[["forest","追问森林石碑","获得银叶遗文任务与一份草药。"],["road","替商队打听铁价","解锁峡道商路委托，获得少量金币。"],["coin","收下沉星银币","开启月沼主线，并增加一点王朝知识。"]]},
      prayer:{title:"晨星礼拜堂",body:"守灯祭司没有询问你的来处，只问你是否还记得某个曾经保护过你的人。长烛上有三道旧刻痕。她说，每一道都由一位旅人留下，刻下后便再也没有回到边境。",options:[["vow","为无名者祈愿","恢复法力，开启圣烛任务。"],["donate","捐出 20 金币","永久提升生命上限，并获得祭司声望。"],["ask","询问月沼的封印","获得主线线索和少量经验。"]]},
      lighthouse:{title:"雾中的灯塔",body:"你在塔顶找到一面裂开的旧镜。海雾中确有船影，却没有帆，也没有灯。镜座的铭文要求点灯者留下一个真正珍贵的名字。你不必写下自己的名字，但空白处不会永远等人。",options:[["light","以星辉点亮旧镜","消耗法力，降低海崖危险，并获得经验。"],["name","写下一个旧友的名字","提高声望，获得风葬海崖的特殊线索。"],["leave","暂不触碰镜面","什么都不发生，但把这个地点记入图鉴。"]]}
    };

Object.assign(ITEMS,window.RegionContent.items);
PLACES.city={name:'归灯王城',region:'归灯王都',danger:0,tags:['九街区','公共建筑','城市生活'],art:'归灯王城',desc:'宫庭、书苑、匠街与河港以石路相连。街坊在归灯下重新讲述这座城市的生活，每一扇门后都有自己的名字。',actions:[['city:guide','街区导览','查看九街区与公共建筑。'],['city:archive','城市档案','阅读王城地方沿革。'],['city:music','水园小调','聆听居民演奏。']]};
window.GameData={SLOT,RARITY,ITEMS,PLACES,ENEMIES,QUESTS,COMPANIONS,JOBS,SKILLS,RECIPES,EVENTS};
})();
