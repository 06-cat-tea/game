# 米拉原画制作记录

工具：内置 imagegen。首张原画 master-v1.png。

提示词：日式奇幻 RPG 的成年女性星图学徒米拉，银紫长发、紫色眼睛，安静好奇的神情；深蓝紫色旅行术师服，古金星纹、星形胸针、腰间星图与黄铜星盘。正面放松站姿，双手清晰，完整头顶至膝下，竖幅透明背景，无文字、边框、水印。精细动漫线稿和柔和体积光影，适用于后续 Live2D 拆分与绑定。

状态：已完成分层、Cubism Editor 5.3.04 FREE 建模、保存、重新打开、SDK 5.3 导出和游戏接入。完整七次原画/拆层提示词保存于 prompts.json。

工程：mira-v1.cmo3；源 PSD：mira-layered-v1.psd。14 个 ArtMesh、4 个曲面变形器、27 个参数、1 个编辑器根部件；隐藏的 Small/Medium 嘴形不参与导出，运行时为 12 个 drawable、0 个独立 runtime part。纹理只有 mira-v1.2048/texture_00.png（2048×2048）。

绑定：HeadXY 控制九组 AngleX/Y 关键形态；左右眼共同绑定 EyeLOpen；MouthForm 与 MouthOpenY 组合控制中性/微笑/严肃及张嘴；Body 网格绑定 Breath/BodyAngleZ；前发、后发和 ClothSway 由物理输出驱动。姿态采用细微幅度，适合文字对话。

三份标准 exp3.json 在真实 MouthForm 绑定完成后由 prepare-expressions.cjs 整理。每次重新导出后运行该脚本及 package-model.cjs 更新模型描述和 file:// 运行包。
