# 米拉 Live2D：制作与验收

本次只发布米拉。其他六位角色仍使用现有头像，主角已生成的未完成素材留在本地。

## 可编辑交付

- `assets/characters/mira/mira-layered-v1.psd`：1024×1536，14 个独立透明图层。
- `assets/characters/mira/mira-v1.cmo3`：Cubism Editor 5.3.04 FREE 中实际制作、保存、关闭后重新打开验证。
- `mira-v1.moc3`、`mira-v1.model3.json`、`mira-v1.physics3.json`、`mira-v1.cdi3.json`、单张 `mira-v1.2048/texture_00.png`。
- `expressions/{neutral,smile,serious}.exp3.json`：标准 Cubism 表情文件，关联到真实模型的 MouthForm 参数。
- `mira-standing.png`：膝上透明静态备用立绘。`layers/`、`layers.json`、原始 PNG 与 `prompts.json` 保留制作来源。

FREE 范围：编辑器 14 个网格、4 个曲面变形器、27 个参数、1 个根部件，实际成功保存与导出。运行时不包含隐藏的两个未使用嘴形，导出结果为 12 个 drawable；纹理 2048×2048，一张。

## 游戏行为

官方 SDK for Web 5-r.5 的 Core、Framework 和 shader 均为本地资源。模型二进制、JSON 和纹理数据打包为脚本资源，避免直接打开 HTML 时 fetch 或 WebGL 本地文件限制；原纹理 PNG 同时保留。没有新增网络运行依赖或配音，没有修改存档结构。

逐字显示触发口型，标点停顿，完成或快速显示全文后闭嘴。主角回复切换头像，等待选择保持米拉。返回、服务切换和退出清理模型；异步加载取消有序号保护；页面隐藏暂停；减少动效、损坏模型或 WebGL context 丢失时使用静态立绘。

## 验收

2026-10-13 在独立无头 Chrome 上检查，不改用户存档：

- `node tests/live2d-acceptance.cjs`：真实 MOC3 通过官方 SDK 加载，实际渲染像素随动画变化。
- 三种表情×闭口/张嘴六组状态检查，三张闭口贴图互斥。
- 162 组 Head X/Y、前后发、衣饰/身体和呼吸极值组合：坐标均为有限值，三角形没有翻转。
- 发言者切换、标点与完成闭嘴、快速跳过、自动播放等待选项、六次重复打开、加载中退出、服务切换、隐藏暂停、损坏 MOC3 及 WebGL context 丢失回退。
- 1920×1080、1280×720、390×844、360×640、844×390、640×360；手机使用真实触控浏览器上下文，竖屏检查旋转后游戏坐标与模型 Canvas 尺寸。
- `node tests/dialogue-acceptance.cjs`：全部 66 位居民/204 个话题/408 条分支，以及旧存档、任务奖励、焦点、返回层级和六种布局。
- `node tests/viewport-acceptance.cjs`：现有输入、旋转、逐字阅读与自动播放验收；增加对主角回复展示的检查。

测试结果和截图位于忽略的 `artifacts/`，包含 `live2d-mira-model-check.json`、`live2d-acceptance.json`、`live2d-mira-runtime.png` 及六种窗口截图。网格数值检查配合编辑器/游戏画面检查，限定为本次设置的细微动作范围。

## 重建

在 `tools/live2d-build/` 安装 pnpm 锁定依赖。`node tools/live2d-build/prepare-mira.cjs` 机械裁切、定位原图并写 PSD/备用图；不重绘图像。修改原画后应在 Editor 重新导入、检查网格和动作、保存与导出。

每次重新导出运行：

```text
node tools/live2d-build/prepare-expressions.cjs mira assets/characters/mira/mira-v1.model3.json
node tools/live2d-build/package-model.cjs mira assets/characters/mira/mira-v1.model3.json
```

`node tools/live2d-build/build-sdk.cjs` 从保留的官方 Framework 5-r.5 源码生成运行包。第三方许可和版本说明位于 `assets/vendor/live2d/` 及 Framework 源码目录。
