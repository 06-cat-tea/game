# 手绘环境素材

四张用户提供的图集共 84 项，按原图顺序编号。`sources/` 保存原始图集，`sprites/` 保存最长边 384px 的无损 WebP 游戏资源。重复定位裁切和 PNG 母版已清理，可从 `catalog.json` 的 `sourceRevision` 对应 Git 版本恢复；来源矩形和完整生成提示词仍保留。

`catalog.json` 记录来源矩形、类别、地面锚点、适用区域、尺寸和提示词。地面材质按等距网格变换，物件按原始纵横比绘制；窗户、门和屋顶随建筑绘制。

六区域的摆放、通路避让、图片回退和地面缓存由 `js/environment-system.js` 管理。环境物件不新增碰撞、任务或存档字段。王城桥位沿用原有三处通路。

开发命令：

```text
node tools/environment-assets.cjs build
node tests/environment-acceptance.cjs
node tools/environment-screenshots.cjs after
node tools/environment-comparison.cjs
```

素材总览和场景对比输出至 `artifacts/environment-contact.png` 与 `artifacts/environment-comparison.png`。构建有母版时重建无损 WebP，没有母版时检查现有 WebP 并重建总览和清单。重新准备裁切使用 `prepare`，会从最初 Downloads 路径读取原图；正常构建和运行无需该路径。
