# DESIGN — 时间悖论：失控实验室

## 定位

一个可以触摸的因果引擎。视觉来自深井实验室的**光学仪器、钟表机械、蚀刻电路与压力舱铭牌**，而不是通用的霓虹赛博朋克。所有画面元素都应当回答同一个问题：此刻的因果状态是什么？

## Visual Direction Contract

**Direction / composition grammar**
- 非对称的“实验台”：左侧窄任务轨道，中部最大的因果观测窗，右侧窄因果监控台；顶部是实验室铭牌与区段坐标，底部是机械指令条。
- 游戏舞台是唯一的大面积深色玻璃表面；其余区域保持开放的暗场，用细线和间距分组。
- 标题页让一个真实的因果装置（同心时环、悬浮棱镜、实验室观测窗）成为主体，不靠大段文案撑场。

**Alignment axis**
- 桌面：以舞台垂直中轴为视觉轴，左右轨道与舞台上下边缘对齐。
- 移动端：单列竖直轴；舞台贴顶，因果监控条居中，指令键进入拇指区；档案与结局页提供固定底部主操作。

**Dominant object or relationship**
- 关卡内：格子地图中的“玩家—回响—因果锚”三者关系。回响是青玉色半透明重影，因果锚是紫铜色、带悬浮环的箱体。
- 首屏：缓慢旋转的时间环装置与内部折射的实验室光影。

**Counterweight and primary action**
- 右侧监控台显示余响能量、循环数、行动刻度、回响路径条；主操作“回响”是唯一高饱和主按钮。
- 左侧任务轨道只用排版与细线，面积上让位给舞台。

**Below-fold proof**
- 关卡档案页是真正的选择界面；手册弹窗包含机制图示；结局页有完整尾声与两个结局记录。
- 不把内容截断成首屏 demo。

**Type ceiling and roles**
- 中文标题：72px 上限（移动端 40px），只出现一次。
- 区段标题：28–36px；正文：14–16px；仪表标签：10–11px，字距 0.14em，全大写英文 + 中文。
- 数字/坐标：等宽。正文最大行宽 62ch。

**Spacing rhythm**
- 8px 基准；模块间距 24/40/64；界面密度中等偏低，舞台周围留足“仪器边框”呼吸区。

**Surface/card/radius/elevation budget**
- 主舞台：12px 圆角，1px 边框，内外双重描边（加工金属感），轻微内高光。
- 次级面板：不做卡片；用 1px 细线、微弱色差和大间距分组。
- 控件：4px 圆角；胶囊仅用于状态 chip 和回响能量。
- 全页最多 2 层不透明度玻璃，不用毛玻璃堆叠。

**Edge character and corner hierarchy**
- 舞台圆润、有加工倒角；面板是开放边界；按钮是精密机械键，边角短促；chip 是胶囊。
- 外轮廓参照仪器面板的斜切角（clip-path），只在标题装置与终局窗口使用。

**Separation strategy and line policy**
- 先用色温和留白分组；线只用于：舞台边框、仪表分隔、因果路径。
- 不使用每段都有边框的“表单化”布局。

**Visual treatment and signature device**
- 石墨黑底 + 青玉 phosphor + 紫铜 oxide + 骨白 text + 琥珀警示。
- 签名：回响的 RGB 裂相重影与“时轴回卷”擦除动画；因果锚的紫铜同心环与时间锚线。
- 细颗粒噪点与扫描线极轻，不超过可读性。

**Direction authority and source**
- 项目原创方向 + 电子仪器/钟表/科学摄影的形态语汇；不复制任何具体作品画面。
- 资产策略：无外部图像，全部 Canvas 程序化绘制；这是有意的 assetless composition。

**Rules inherited from authority source**
- 结构先于装饰；状态必须可读；动效服务于因果理解；任何装饰不得遮挡路径/机关状态。

**Advisory defaults intentionally overridden**
- 不采用居中大标题落地页；首屏采用左叙事/中装置/右操作的仪器构图。
- 不使用紫色渐变、玻璃卡片墙、发光描边按钮堆叠。
- 游戏内不将数据做成等宽统计卡片，而是一条连续的监控轨道。

**Hard invariants preserved**
- 对比度、键盘操作、触屏目标 ≥44px、减少动效、可恢复错误、控制台干净、真实可玩完整流程。

**Rendered proof required**
- 1440×900 标题、游戏、通关；390×844 标题与游戏；一次倒带中间帧；关卡档案与结局。

## Tokens

```css
--ink-950: #070a0d;     /* 页面最深 */
--ink-900: #0b1015;     /* 舞台外壳 */
--ink-800: #111820;     /* 面板 */
--ink-700: #1a242d;     /* 凸起表面 */
--line:    #2b3740;     /* 结构线 */
--line-hot:#4d6570;     /* 聚焦线 */
--bone:    #e9e4d8;     /* 主文字 */
--bone-dim:#a7a79f;     /* 次文字 */
--jade:    #64f5d2;     /* 回响 / 主强调 */
--jade-deep:#0f5f55;
--copper:  #e7a46a;     /* 因果锚 */
--amber:   #ffc15e;     /* A 系机关 / 警示 */
--cyan:    #74d8ff;     /* B 系机关 */
--breach:  #ff6b8a;     /* 封印 / 悖论 */
```

## Component grammar

- **Instrument chip**：胶囊，1px 线，10px 等宽字，状态有 dot。
- **Command key**：48–56px 高，短圆角，键帽式底部厚边；主键青玉色实心、次键石墨面。
- **Stage frame**：12px 圆角，双层 1px 边框+内阴影；顶部嵌一行区段坐标和状态。
- **Hazard / machine plate**：任何可交互物都用几何形状+文字/符号双编码，不只靠颜色。
- **Modal**：全屏暗场 + 中央仪器窗口，非白色卡片。
- **Timeline**: 水平刻度尺，每格一动作，回响路径用不同高度的色条。

## Motion

- 玩家移动 130ms ease-out；推箱 170ms；相机不跟随。
- 倒带：620ms，先 120ms 冻结压缩，再 380ms 时间反演，最后 120ms 白色曝光恢复；可被 reduced-motion 降为瞬时。
- 压力板/门：180ms 机械位移 + 150ms 光带；同步完成有 800ms 的光环脉冲。
- 悬停/焦点：100–140ms。
- 所有循环装饰动画都有静态替代（CSS 与 Canvas 在 reduced-motion 下停帧）。

## What is intentionally not used

- 外部图片、Lottie、UI 框架、WebGL、第三方字体 CDN。
- 霓虹紫蓝渐变、玻璃卡片、巨幅宣传标语、假数据仪表盘。
- 与玩法状态无关的装饰粒子雨。
