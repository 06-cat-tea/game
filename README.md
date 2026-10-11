# 灰烬边境：星陨纪事

原生 JavaScript 与 Canvas 的暗色奇幻 RPG。直接打开 `index.html` 或 `frontier.html` 即可游玩，无需构建、服务器、账号或外部运行时资源。内部场景分辨率为 1920×1080，界面兼容桌面、手机竖屏与横屏。

线上：https://06-cat-tea.github.io/game/frontier.html

## 操作与功能

- WASD / 方向键移动，靠近目标按 E；鼠标点击 NPC、建筑、室内物件进行交互。
- 右键对象打开对应菜单，空白场景右键访问常用功能；手机长按 450ms 或点击“更多”按钮打开相同菜单。
- 手机使用摇杆持续移动和独立交互按钮，底部导航访问冒险、背包、任务、成长和更多。
- 二级页面使用分类、搜索、分页和选中详情。桌面每页最多 6 项、手机最多 4 项；手机详情以抽屉显示。
- 五区域、30 个建筑地标、25 个可进入的内室、15 张子地图。沉没神殿内殿与王陵深层同时计入内室和子地图，共 38 张独立等距 2.5D 背景；每间内室至少四个互动点。26 位居民共用室内外好感与服务记录。
- 保留“星钟谜语”及旧居民委托；新增五条两阶段区域支线、10 个一次性选择事件、五名精英、五项区域挑战和“归灯之后”收尾任务。
- 六职业，每职业三分支、每分支五节点，共 90 个技能；四个主动技能配置位、共用技能点和免费确认重配。刺客、牧师与炼金师通过夜岚、艾拉、瑟琳的导师任务解锁。新增十二件职业武器与饰品，接入制作及 +1～+3 强化。
- 六名同伴、三个自动支援位；均衡／突击／守望阵型，输出／保护／资源保留战术。支援技能随主角等级 1／4／7 开放，60 好感解锁羁绊；三组双人协奏使用共享协奏条。
- 一至三名敌人的战斗，目标选择、群攻、护卫、治疗、召唤、精英招式轮换与 Boss 阶段。灼烧、中毒、流血、易伤、破甲、再生、沉默、护盾显示来源及回合；Boss 受硬控制后获得两回合控制免疫。
- 每张子地图包含调查、补给、选择事件及遭遇；五条三阶段路线调查、六条两阶段个人任务与五项独立高阶挑战。任务详情可定位入口，圆形地图可切换区域总览／当前区域路线；支持镜头跟随、缩放与沿入口返回。

## 存档

v6 自动存档沿用 `ashen-frontier-save-v3` 存储键，兼容 v2～v5。迁移前按原版本保留一次备份；旧角色、主线、任务、装备、强化、材料、技能点和已学技能保留，旧战斗迁为单敌人结构。旧同伴羁绊按每级 20 点迁入 0～100 好感。旧档可证明的成就允许领取奖励，未记录的探索项目从未发现开始。新增职业解锁、技能配置、阵型战术、子地图位置与返回栈均可保存恢复。

存档属于当前浏览器与来源：本地文件、localhost 和 GitHub Pages 通常各自保存。换设备或切换来源时，请通过设置导出、导入 JSON 备份。顶部“保存”直接写入进度；“返回标题”不清空存档，“新游戏”需要确认。

## 文件分区

- `frontier.html`、`assets/game.css`、`assets/expansion.css`：页面入口、暗色主题、移动端及战术战斗组件。
- `assets/icons/`：20 枚透明图标，每枚包含 512px 原始资源与 128px UI 资源；基于用户提供的图标集经 imagegen 分离。
- `js/game-data.js`：已有世界、装备、任务、同行者及事件定义。
- `js/building-system.js`、`js/npc-system.js`：建筑、室内空间、物件和居民定义。
- `js/region-content.js`：新区域任务、选择事件、精英与 Boss、专属战利品、收尾任务。
- `js/crafting-system.js`、`js/skill-tree.js`、`js/growth-system.js`：制作、职业、强化、关系、探索与成就。
- `js/scene-system.js`、`js/scene-layouts.js`、`js/scene-controller.js`、`js/expedition-stories.js`：场景定义、逐张背景互动位置与家具碰撞、出入与任务行动、路线事件及敌群。
- `js/class-content.js`、`js/party-system.js`：职业扩展、技能配置与重配、自动支援、阵型、导师及个人任务。
- `js/battle-system.js`、`js/battle-ui.js`：多目标回合、支援和状态结算、固定战斗操作区。
- `js/pixel-world.js`、`js/circle-map.js`：场景绘制、碰撞、目标命中、输入与圆形地图。
- `js/ui-icons.js`、`js/ui-navigation.js`、`js/interaction-menu.js`：图标映射、分页详情、导航、右键与长按菜单。
- `js/expansion-ui.js`、`js/save-migrations.js`：成长与路线页面、v6 存档迁移。
- `js/game.js`：状态事务及系统协调。

## 开发与验收

可选本地预览：`node tools/serve.cjs 8080`，然后打开 `http://127.0.0.1:8080/frontier.html`。

`node tests/acceptance.cjs` 验证直接打开；`node tests/acceptance.cjs http://127.0.0.1:8080/frontier.html` 验证静态服务。测试只使用独立的无头浏览器存档，结果与截图写入忽略的 `artifacts/`。开发测试使用本机已安装 Playwright 和 Chrome，其他机器可通过 `PLAYWRIGHT_MODULE`、`CHROME_PATH` 指定路径；游戏本身不依赖这些工具。

`tools/build-icons.cjs` 从 512px PNG 重建 128px 资源和检查图；可用 `SHARP_MODULE` 指定开发用 sharp 模块。无需重新生成图标即可运行游戏。

`node tests/expansion-acceptance.cjs [可选 URL]` 检查 38 张背景、25 间内室、15 张子地图、全部互动点步行可达与出口、90 节点、六同伴任务、支援／群攻／召唤／控制免疫、重配退款、v2～v5 备份迁移及桌面和手机五种视口。所有测试均支持直接打开文件、静态服务或线上 URL。

## 内室与路线美术

`assets/expansion/masters/` 保存 38 张 1920×1080 PNG 母版、512px 透明主徽记及六枚职业图标。`scenes/` 保存游戏按当前场景加载的 WebP；图片缓存最多保留四张扩展场景。`icons/` 保存 256px 主徽记、128px 职业图标、简化 SVG 与 32px favicon。新增游戏资源约 16.6 MB，母版不在运行时加载。

所有 45 张新素材通过 imagegen 逐张制作，`assets/expansion/catalog.json` 保存映射及提示词。`node tools/preview-expansion.cjs` 检查母版尺寸、透明通道并生成全部场景联系表；`node tools/expansion-art.cjs <素材ID> <PNG路径>` 导入母版并重建游戏资源。相关图片处理工具仅用于开发，游戏没有外部依赖。

## 地图与人物美术扩展

- 建筑图集的 20 类建筑已分离为透明 PNG，包含 1024px 母版与 512px 场景资源；肖像图集的 20 类人物包含 512px 母版与 256px UI 资源，存于 `assets/world/`。
- 五地分别接入 imagegen 生成的 1920×1080 本地场景背景。建筑与居民仍是可独立交互、按地面深度排序的对象。
- 新增王城、街区、学院、炼金室、马厩、城门、农田、兵营、矿场、旧堡、地牢、云城及港口。15 位新增居民提供训练、炼药、收获、交易、档案、停战和路线服务，并使用统一好感记录。
- `js/world-content.js` 管理扩展地点、居民与服务；`js/world-assets.js` 管理本地图片；`js/world-hit-masks.js` 使用构建时生成的透明命中掩码，兼容直接打开 HTML。
- `assets/world/catalog.json` 包含全部素材映射、来源说明与 imagegen 提示词。`node tools/build-world-assets.cjs` 重建小尺寸资源、命中掩码、透明检查与素材联系表。
- `node tests/world-acceptance.cjs [可选 URL]` 检查 85 张资源、20 类建筑与肖像的实际引用、五区域绘制、全部地标命中、室内居民、服务限制、重载与手机布局。
