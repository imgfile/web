# Signoff / 时间悖论：失控实验室

日期：2026-10-20  
范围：完整单机浏览器游戏（标题、开场、8 关、档案、手册、设置、结算、终局双结局、存档、审计日志）

## 1. Static proof

- 全部 JS 通过 `node --check`：`engine.js`、`levels.js`、`renderer.js`、`game.js`、`logger.js`、`audio.js`、工具服务脚本。
- 无第三方运行时依赖、无外部字体/图片/音频 URL；所有视觉与声音均为程序化生成。
- HTML 结构包含语义按钮、`dialog`、`aria-live` 状态区、可见焦点与 reduced-motion 样式。
- 服务器静态路径解析带根路径约束与 MIME 白名单；日志接口做 JSON/条目校验。

## 2. Runtime proof

- `node tests/verify-levels.mjs`：8/8 关卡在预设动作串下通关；行动数不超过 PAR。
- `node tests/engine.test.mjs`：10/10 底层规则测试通过（回响、倒带、因果锚、封印、质量槽、撤销）。
- 浏览器验证（Playwright，桌面 1440×900 / 移动 390×844 / `prefers-reduced-motion: reduce`）：
  - 8 个扇区逐一启动，Canvas 渲染器持续运行且 `renderFailures = 0`。
  - 无 console error、无 page error、无渲染异常（因果线 `this` 绑定缺陷已修复并回归）。
  - 完整通关第 1 关后进入第 2 关；完成全部 8 关后出现“前往核心”，进入终局并写入结局。
  - 刷新后从 localStorage 恢复进度并继续正确扇区。
  - 直接以 `file://` 打开可进入游戏并移动；日志自动降级为本地缓存。
  - 移动端 390×844 无横向溢出，舞台/监控/操作区同时可见；主操作目标 44px。
- 本地日志服务器 `/api/logs/health` 与 `/api/logs/report` 可用。

## 3. Visual proof

- `title-desktop.png`、`intro-desktop.png`：仪器化观察窗、时间核心与回响剪影。
- `game-desktop.png`、`sync-desktop.png`、`hover-desktop.png`：因果棋盘、压力板连线、回响足迹、悬停检视、五节点同步汇束。
- `archive-desktop.png`、`result-desktop.png`、`settings-desktop.png`、`ending-desktop.png`、`epilogue-desktop.png`。
- `game-mobile.png`、`sync-mobile.png`、`archive-mobile.png`、`ending-mobile.png`、`pause-mobile.png`。
- `reduced-motion-desktop.png` 与 `comparison-round16/17/18` 比较证据。

## 4. Accessibility proof

- 键盘全流程：方向键/WASD、空格、R、Z、H、Esc；原生 `dialog` 焦点陷阱；屏幕级焦点不显示装饰性轮廓，具体控件保留 `:focus-visible`。
- 触屏控制目标：方向键 46×44，触屏主操作 ≥52px，移动端头按钮 44×44；档案页固定底部 CTA。
- 缩小动态效果：系统 `prefers-reduced-motion` 或设置开关均可关闭粒子、震屏和长倒带动画；画布仍绘制完整状态。
- 关键机制采用颜色 + 形状 + 字母/数字三重编码，不只依赖颜色（A/B 门、同步节点 vs 质量槽、回响编号）。
- `aria-live` 播报循环、位置、回响数量和门状态。
- 对比度：主要文字使用骨白/浅灰；仅装饰性微标签为低对比，不承载唯一信息。

## 5. Scope proof

- 8 个差异化关卡：回响基础、双回响、推箱、因果锚、因果锚+回响、三点同步、质量槽综合、五节点终局。
- 完整流程：开场 3 页事故档案 → 8 个扇区 → 核心同步 → 双结局 → 尾声 → 返回标题/档案。
- 档案：关卡列表、地图示意图、星级/最佳行动、记忆碎片库、结局计数、继续/重演。
- 系统：暂停、重置、关卡退出确认、设置、减少动态效果、声音开关、进度清除、完整手册。
- 存档：星级、最佳行动、回响数、碎片、结局、当前扇区、设置。
- 审计日志：前端 TraceID + 中间件/输入闸门/拒绝/业务/状态/数据层/响应/异常，服务端落盘 `logs/`。

## 6. Known non-blocking issues

- 桌面 toast 会在短暂时间覆盖右侧监控台顶部读数；不遮挡舞台与操作，3–6 秒自动消失（P2）。
- 桌面档案示意图的视频化信息密度仍高于战术图；移动端已保证 schematic 在滚动区中完整可达，底部 CTA 不覆盖内容。
- 右栏与命令栏中的部分微标签偏小（P3）。
- 因果线为概念性直线连接，可穿过墙体；这是“因果力”的视觉语言，不影响碰撞与规则。
- 游戏为单机离线体验，不包含登录、权限、数据库 SQL 或多人同步，因此这些审计层不适用。

独立视觉复核（1×P1 + 5×P2）的原始发现见 `independent-critique-2026-10-20.json`，修复过程记录于 `fresh-eyes-critique-resolution.md`。当前无开放 P0/P1。

## 7. Quality assessment

- Subject fit: 9.0 — 每一层视觉都回答“此刻的因果状态是什么”，且与玩法对象对应。
- Hierarchy: 8.6 — 桌面舞台、任务轨道、监控台关系明确；移动端重排后主操作可触达。
- Composition: 8.8 — 非对称观测窗有清晰主体，非通用卡片墙。
- Type and content: 8.4 — 字号/层级支持仪器读感，部分微标签在窄屏偏小。
- Material and assets: 8.7 — 全部程序化生成，无明显占位素材； Canvas 材质密度一致。
- Interaction and motion: 8.8 — 倒带、回响、同步均有状态驱动的动效与静态降级。
- Responsive and states: 8.3 — 桌面/手机完整；独立复核提出的移动端 P1 已修复，仍保留若干非阻塞优化空间。
- Originality: 9.0 — 机制、界面与叙事围绕同一“因果回响”概念展开。
- Completion and proof: 8.7 — 完整可玩全流程，测试与截图证据齐全，独立复核发现已处理。

**Calculated overall: 8.7 / 10**  
**Verdict: CURRENT WINS**
