# 灰烬边境：星陨纪事

原生 JavaScript 与 Canvas 的暗色奇幻 RPG。直接打开 `index.html` 或 `frontier.html` 即可游玩，无需构建、服务器、账号或外部运行时资源。内部场景分辨率为 1920×1080，界面兼容桌面、手机竖屏与横屏。

线上：https://06-cat-tea.github.io/game/frontier.html

## 操作与功能

- WASD / 方向键移动，靠近目标按 E；鼠标点击 NPC、建筑、室内物件进行交互。
- 右键对象打开对应菜单，空白场景右键访问常用功能；手机长按 450ms 或点击“更多”按钮打开相同菜单。
- 手机使用摇杆持续移动和独立交互按钮，底部导航访问冒险、背包、任务、成长和更多。
- 二级页面使用分类、搜索、分页和选中详情。桌面每页最多 6 项、手机最多 4 项；手机详情以抽屉显示。
- 五区域、30 个建筑地标、23 个可进入的室内场景，26 位居民、调查与服务共用室内外系统。
- 保留“星钟谜语”及旧居民委托；新增五条两阶段区域支线、10 个一次性选择事件、五名精英、五项区域挑战和“归灯之后”收尾任务。
- 三职业技能树、装备与消耗品制作、+1～+3 保证成功的强化、居民好感、同伴协奏、探索记录与 15 项一次领取的成就奖励。
- 战斗显示招式预告、阶段、灼烧、中毒、易伤、护盾和控制技能冷却。战斗药剂与撤离同样经过回合结算。

## 存档

v5 自动存档沿用 `ashen-frontier-save-v3` 存储键，兼容 v3/v4，并保留 v2 迁移路径。旧角色、任务、装备、材料、技能点和已学技能保留；旧同伴羁绊按每级 20 点迁入 0～100 好感。旧档可证明的成就允许领取奖励，未记录的探索项目从未发现开始。

存档属于当前浏览器与来源：本地文件、localhost 和 GitHub Pages 通常各自保存。换设备或切换来源时，请通过设置导出、导入 JSON 备份。顶部“保存”直接写入进度；“返回标题”不清空存档，“新游戏”需要确认。

## 文件分区

- `frontier.html`、`assets/game.css`：页面入口、统一暗色主题和响应式布局。
- `assets/icons/`：20 枚透明图标，每枚包含 512px 原始资源与 128px UI 资源；基于用户提供的图标集经 imagegen 分离。
- `js/game-data.js`：已有世界、装备、任务、同行者及事件定义。
- `js/building-system.js`、`js/npc-system.js`：建筑、室内空间、物件和居民定义。
- `js/region-content.js`：新区域任务、选择事件、精英与 Boss、专属战利品、收尾任务。
- `js/crafting-system.js`、`js/skill-tree.js`、`js/growth-system.js`：制作、职业、强化、关系、探索与成就。
- `js/battle-system.js`：回合与状态效果结算。
- `js/pixel-world.js`、`js/circle-map.js`：场景绘制、碰撞、目标命中、输入与圆形地图。
- `js/ui-icons.js`、`js/ui-navigation.js`、`js/interaction-menu.js`：图标映射、分页详情、导航、右键与长按菜单。
- `js/game.js`：存档迁移、状态事务及系统协调。

## 开发与验收

可选本地预览：`node tools/serve.cjs 8080`，然后打开 `http://127.0.0.1:8080/frontier.html`。

`node tests/acceptance.cjs` 验证直接打开；`node tests/acceptance.cjs http://127.0.0.1:8080/frontier.html` 验证静态服务。测试只使用独立的无头浏览器存档，结果与截图写入忽略的 `artifacts/`。开发测试使用本机已安装 Playwright 和 Chrome，其他机器可通过 `PLAYWRIGHT_MODULE`、`CHROME_PATH` 指定路径；游戏本身不依赖这些工具。

`tools/build-icons.cjs` 从 512px PNG 重建 128px 资源和检查图；可用 `SHARP_MODULE` 指定开发用 sharp 模块。无需重新生成图标即可运行游戏。

## 地图与人物美术扩展

- 建筑图集的 20 类建筑已分离为透明 PNG，包含 1024px 母版与 512px 场景资源；肖像图集的 20 类人物包含 512px 母版与 256px UI 资源，存于 `assets/world/`。
- 五地分别接入 imagegen 生成的 1920×1080 本地场景背景。建筑与居民仍是可独立交互、按地面深度排序的对象。
- 新增王城、街区、学院、炼金室、马厩、城门、农田、兵营、矿场、旧堡、地牢、云城及港口。15 位新增居民提供训练、炼药、收获、交易、档案、停战和路线服务，并使用统一好感记录。
- `js/world-content.js` 管理扩展地点、居民与服务；`js/world-assets.js` 管理本地图片；`js/world-hit-masks.js` 使用构建时生成的透明命中掩码，兼容直接打开 HTML。
- `assets/world/catalog.json` 包含全部素材映射、来源说明与 imagegen 提示词。`node tools/build-world-assets.cjs` 重建小尺寸资源、命中掩码、透明检查与素材联系表。
- `node tests/world-acceptance.cjs [可选 URL]` 检查 85 张资源、20 类建筑与肖像的实际引用、五区域绘制、全部地标命中、室内居民、服务限制、重载与手机布局。
