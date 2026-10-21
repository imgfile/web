# Round 18 / State Review

## States exercised

- **Default / idle** — 关卡开始、空回响、首刻操作。
- **In-progress echo** — 回响按住 A 板，A 门开启，玩家穿过门。
- **Rewind** — 倒带中帧；时间反演与循环计数刷新。
- **Synced** — 五个节点同时占据，G 门开启，五条因果线汇入核心。
- **Result** — 三颗星、循环/回响/行动统计与记忆碎片记录。
- **Paused / Settings / Manual** — 对话框焦点、开关状态、可恢复返回路径。
- **Reduced motion** — 系统 `prefers-reduced-motion` 启用后入场动画缩短、粒子与长震动关闭。
- **Save / Continue** — 刷新后从 local storage 恢复扇区、星级与碎片。

## Largest gap

非默认状态原先只有代码与逻辑，没有经过实机渲染检查；移动端没有完整的状态面板，禁用/可用状态和同步读数不够明显。

## Repair

逐一在真实浏览器中触发倒带、同步、结算、设置和 reduced-motion，并检查控制台、按钮禁用状态与移动端布局。添加 `sync-desktop.png`、`result-desktop.png`、`settings-desktop.png`、`reduced-motion-desktop.png` 作为状态证据，修复了渲染器在绘制因果线时使用未绑定 `this` 导致的中断问题。

## Evidence

`game-desktop.png`、`sync-desktop.png`、`result-desktop.png`、`settings-desktop.png`、`reduced-motion-desktop.png`、`game-mobile.png`、`sync-mobile.png`。比较：`comparison-round18-states.png`。
