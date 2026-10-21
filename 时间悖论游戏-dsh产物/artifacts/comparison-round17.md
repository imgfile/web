# Round 17 / Responsive Re-stage

**Largest visible gap:** 移动端初版把桌面舞台硬塞进竖屏：棋盘只占上方一小块，剩余大量空黑；右侧的监控信息完全消失；方向键没有对齐；档案页的“进入扇区”按钮远在首屏之外。

**Repair applied:**
- 移动端改为“棋盘 + 因果监控条 + 拇指区”三段式；舞台高度受控，监控条承载循环、行动、回响、同步、最新因果日志与碎片状态。
- 四向键居中，主控制目标提升到 44px；紧凑任务条允许两行目标文字。
- 档案页增加固定底部“进入扇区”操作条；移动端地图、记忆库与完整关卡列表都可滚动访问。
- 结局页针对 390×844 收紧行高与卡片高度，使两个终局选择都在一屏内可达。

**Evidence:** `baseline-mobile-game-v1.png` → `game-mobile.png`；合成为 `comparison-round17-mobile.png`。同时验证 `sync-mobile.png`、`archive-mobile.png`、`ending-mobile.png`。

**Outcome:** 390×844 下棋盘、余响、回响位置、同步状态与操作按钮同时可见；无横向溢出；核心页面均不需要“猜测下方还有什么”。
