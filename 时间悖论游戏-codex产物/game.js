(() => {
  'use strict';

  /* ==========================================================
     DATA / LEVELS
     ========================================================== */

  const LEVELS = [
    {
      id: 'chamber-01',
      number: '01',
      title: '线性校准',
      english: 'LINEAR CALIBRATION',
      chapter: 'CALIBRATION WING',
      depth: 'LINEAR',
      maxEchoes: 0,
      parForks: 0,
      introLead: '“所有灾难，都从一次校准开始。”',
      introCopy: '03:17:42。一次未登记的校准确认了设施内部的因果坍缩。你从维护舱醒来，警报已经停止，门却没有。HELIX 说：先让终端亮起来。',
      objective: '站上环境终端 T 并按下 E，写入门禁权限，开启隔离门 t，然后抵达右侧出口 E。',
      objectiveShort: '写入终端 T，穿过隔离门 t',
      fieldNote: '这是唯一一条不会留下回声的路径。做完它，你就再也无法回到“只有一个你”的状态。',
      mechanics: [
        { label: '移动 / 方向键', isNew: false },
        { label: '终端交互 E', isNew: true },
        { label: '因果门', isNew: true }
      ],
      terminals: {
        T: { type: 'normal', name: '环境控制终端' }
      },
      doors: {
        t: { terminals: ['T'], tint: 'amber' }
      },
      goalConditions: [
        { kind: 'terminal', id: 'T', target: 1, label: '环境终端 T 写入' }
      ],
      hints: [
        '站在标有 T 的圆形控制台上，按 E。',
        '隔离门 t 会在终端写入后开启。出口 E 位于右侧区域的尽头。',
        '沿左侧通道向下，再向右穿过 t 门，一直走到 E。'
      ],
      dialogueStart: '因果场已接入。K-07，先从最简单的线性路径开始。',
      completeTitle: '校准完成',
      completeCopy: '隔离门 t 的伺服器重新通电。你第一次穿过这扇本该关闭的门。HELIX 没有告诉你，门上的划痕与你手掌的纹路完全一致。',
      completeQuote: '“记录一次动作，就等于制造一个未来。”',
      map: [
        '#################',
        '#S....#.........#',
        '#.....#.........#',
        '#..T..#.........#',
        '#.....t.........#',
        '#.....#.........#',
        '#.....#........E#',
        '#.....#.........#',
        '#.....#.........#',
        '#################'
      ]
    },
    {
      id: 'chamber-02',
      number: '02',
      title: '第一道回声',
      english: 'ECHO PROTOCOL',
      chapter: 'CALIBRATION WING / SUBLEVEL A',
      depth: 'RECURSIVE — 01',
      maxEchoes: 1,
      parForks: 1,
      introLead: '“过去不会消失。它只会拒绝服从。”',
      introCopy: '校准结束后，门禁系统意识到时间轴可以被切开。你将第一次使用回声协议：把当前路径留在已经过去的刻度里，再让那段过去继续替你工作。',
      objective: '站上压力板 A 并固化回声。让回声保持 A 被占用、开启压力门 a，再由当前时间线穿过 a 并抵达出口 E。',
      objectiveShort: '让回声压住 A，穿越压力门 a',
      fieldNote: '回声会在每一次新的尝试中重走同一路径。它不思考，但它不会疲倦。',
      mechanics: [
        { label: '时间回声', isNew: true },
        { label: '压力板占位', isNew: true },
        { label: '时间刻度', isNew: false }
      ],
      terminals: {},
      doors: {
        a: { plates: { A: 1 }, tint: 'cyan' }
      },
      goalConditions: [
        { kind: 'plate', id: 'A', target: 1, label: '压力板 A 持续占用' }
      ],
      hints: [
        '先走到 A 压力板上，按 R 将当前路径固化为回声。',
        '重新开始后，回声会从起点沿相同路径回到 A，替你压住压力板。',
        '等回声站上 A、门 a 打开后，再穿过 a 门。若早到门边，按空格等待一个刻度。'
      ],
      dialogueStart: '回声协议已开放。你留下的不是影子，是一段被密封的因果。',
      completeTitle: '回声保持',
      completeCopy: '门在你身后保持敞开。回声仍站在压力板上，像一个不愿离开的证人。HELIX 将这种状态称为“稳定占用”。',
      completeQuote: '“过去不是记忆。过去是可以被安排的证人。”',
      map: [
        '#################',
        '#S....#.........#',
        '#.....#.........#',
        '#..A..#.........#',
        '#.....a.........#',
        '#.....#.........#',
        '#.....#........E#',
        '#.....#.........#',
        '#.....#.........#',
        '#################'
      ]
    },
    {
      id: 'chamber-03',
      number: '03',
      title: '双生锚点',
      english: 'TWIN ANCHORS',
      chapter: 'CAUSAL HALL / EAST',
      depth: 'RECURSIVE — 02',
      maxEchoes: 2,
      parForks: 2,
      introLead: '“一个身体只能占据一个位置。时间不这么认为。”',
      introCopy: '双锚点门 z 需要 A 与 B 两块压力板被同时占用。你只有一个身体，但时间允许你借来两个。每一条被固化的路径，都会成为可供调度的过去。',
      objective: '分别将两条时间线固化为回声并压住 A、B 两块压力板。待双锚点同时成立、z 门开启后，以当前时间线进入出口 E。',
      objectiveShort: '同步双锚点 A / B',
      fieldNote: '双锚点门不会等待。它只在同一刻度上承认两个同时存在的你。',
      mechanics: [
        { label: '双回声', isNew: true },
        { label: '双压力板', isNew: true },
        { label: '同步等待', isNew: true }
      ],
      terminals: {},
      doors: {
        z: { plates: { A: 1, B: 1 }, tint: 'magenta' }
      },
      goalConditions: [
        { kind: 'plate', id: 'A', target: 1, label: '锚点 A 占用' },
        { kind: 'plate', id: 'B', target: 1, label: '锚点 B 占用' }
      ],
      hints: [
        '第一回合：走上 A 板后按 R。第二回合：走上 B 板后按 R。',
        '最终回合会同时回放两条回声，两个锚点将分别被压住。',
        '从起点向上走，等 z 门开启后进入出口 E；如果早到，用空格等待回声同步。'
      ],
      dialogueStart: '双锚点已在因果网中发光。你需要让两条过去同时说谎，而门会相信它们。',
      completeTitle: '双生同步',
      completeCopy: '两条时间线短暂地共享了一间房。z 门的锁芯在同步完成时发出低鸣，像某种承认。你从门缝里闻到了臭氧和旧日空气。',
      completeQuote: '“我没有分裂。我只是终于承认，我从来不止一个。”',
      map: [
        '#################',
        '#......#E#......#',
        '#......#z#......#',
        '#......#.#......#',
        '#...............#',
        '#..A........B...#',
        '#...............#',
        '#...............#',
        '#.......S.......#',
        '#################'
      ]
    },
    {
      id: 'chamber-04',
      number: '04',
      title: '因果级联',
      english: 'CAUSAL CASCADE',
      chapter: 'INTERLOCK CORRIDOR',
      depth: 'RECURSIVE — 03',
      maxEchoes: 2,
      parForks: 2,
      introLead: '“电流需要回路。因果也是。”',
      introCopy: '门 b 的电源来自 B 板；门 a 的电源来自 A 板。两扇门后面没有终点，只有下一层过去。为了让最终终端 T 通电，你必须先让过去替过去开门。',
      objective: '先由回声压住 B、打开 b 门；穿过 b 门在 A 上再次固化回声。最终让 A、B 同时被占用的回声开启 a，进入右侧写入门禁终端 T，再穿过 z 门。',
      objectiveShort: '用 B 打开 b，用 A 打开 a，接入 T',
      fieldNote: '一条时间回声无法独立完成因果级联。它需要另一条被更早固化下来的过去。',
      mechanics: [
        { label: '因果级联', isNew: true },
        { label: '双回声', isNew: false },
        { label: '终端门锁', isNew: false }
      ],
      terminals: {
        T: { type: 'normal', name: '门禁写入终端' }
      },
      doors: {
        b: { plates: { B: 1 }, tint: 'cyan' },
        a: { plates: { A: 1 }, tint: 'cyan' },
        z: { terminals: ['T'], tint: 'amber' }
      },
      goalConditions: [
        { kind: 'plate', id: 'A', target: 1, label: '锚点 A 保持占用' },
        { kind: 'terminal', id: 'T', target: 1, label: '门禁终端 T 写入' }
      ],
      hints: [
        '先在 B 板上留声，让回声替你保持 b 门开启。',
        '等待 b 门开后穿过它，在中间的 A 板上再次留声。第三条时间线开始时，A、B 会分别由两个回声压住。',
        '最后进入右侧，按下终端 T，再通过 z 门抵达出口。你可以先等回声把 b、a 两道门打开。'
      ],
      dialogueStart: '你正在制造一条因果级联。记住：门不是被打开，是被过去的某一次决定持续相信。',
      completeTitle: '级联闭合',
      completeCopy: '三扇门依次打开的瞬间，你听见的不是机械声，而是自己的脚步从三个方向同时抵达。HELIX 把这条路径标记为“可复现奇迹”。',
      completeQuote: '“当你需要过去开门，先确保过去也有一条可以走的路。”',
      map: [
        '#################',
        '#S....#....#....#',
        '#.....#....#..T.#',
        '#..B..#.A..#....#',
        '#.....b....a....#',
        '#.....#....#....#',
        '#.....#....#.#z##',
        '#.....#....#.#E##',
        '#.....#....#....#',
        '#################'
      ]
    },
    {
      id: 'chamber-05',
      number: '05',
      title: '记忆残响',
      english: 'MNEMONIC RESIDUE',
      chapter: 'ARCHIVE WING / MEMORY',
      depth: 'RECURSIVE — 04',
      maxEchoes: 2,
      parForks: 2,
      introLead: '“记忆终端只读取回声。你太真实了。”',
      introCopy: '记忆终端 M 不读取实体签名。它只确认一条时间线是否已经被放弃。你可以站在上面记录路径，但真正的写入必须由一个回声完成。',
      objective: '先让回声保持 B、开启 b 门；再由你在 b 门后的记忆终端 M 上记录交互并固化回声。最终由回声写入 M，开启 t 门并抵达 E。',
      objectiveShort: '由回声写入记忆终端 M',
      fieldNote: '实体签名会覆盖记忆。回声签名不会。设施更信任那些已经离开过一次的人。',
      mechanics: [
        { label: '记忆终端 M', isNew: true },
        { label: '回声写入', isNew: true },
        { label: '持久因果', isNew: true }
      ],
      terminals: {
        M: { type: 'memory', name: '记忆签名终端' }
      },
      doors: {
        b: { plates: { B: 1 }, tint: 'cyan' },
        t: { terminals: ['M'], tint: 'violet' }
      },
      goalConditions: [
        { kind: 'terminal', id: 'M', target: 1, label: '记忆终端 M 回声写入' }
      ],
      hints: [
        '先在 B 板上留声，开启 b 门。',
        '第二回合穿过 b 门，站到记忆终端 M 上按 E。实体写入会失败，但动作会被记录。随后按 R 固化这条路径。',
        '第三回合里，第一条回声会压住 B，另一条回声会替你写入 M；等 t 门开启后穿过它抵达 E。'
      ],
      dialogueStart: '记忆终端检测到实体。写入被拒绝。K-07，你需要先成为一个已经离开的版本。',
      completeTitle: '记忆写入',
      completeCopy: '记忆终端完成了写入。显示的名字不是 K-07，而是“K-07 / 第∞次”。屏幕熄灭前，你看见自己的倒影比实际慢了半拍。',
      completeQuote: '“有些门不认钥匙。它只认那个曾经决定离开的人。”',
      map: [
        '#################',
        '#S....#....#....#',
        '#.....#....#....#',
        '#..B..#.M..#....#',
        '#.....b....t....#',
        '#.....#....#..E.#',
        '#.....#....#....#',
        '#.....#....#....#',
        '#.....#....#....#',
        '#################'
      ]
    },
    {
      id: 'chamber-06',
      number: '06',
      title: '共振腔室',
      english: 'RESONANCE CHAMBER',
      chapter: 'LOWER RESONANCE LAB',
      depth: 'RECURSIVE — 05',
      maxEchoes: 3,
      parForks: 3,
      introLead: '“当两个回声同频，门就会相信它们是真的。”',
      introCopy: '共振板 R 需要两个实体同时保持接触。普通压力板只承认占用，共振板承认的是“同一时刻的两个完整见证”。你最多可以维持三条回声。',
      objective: '记录一条保持 B 的回声以开启 b 门；再记录两条进入下方共振室的回声。最终按下终端 T，让两个回声同时压住 R，穿过 z 门抵达 E。',
      objectiveShort: '让 2 个回声同时压住共振板 R',
      fieldNote: '回声可以重叠。屏幕上的视觉偏移只是观测残差，不代表空间冲突。',
      mechanics: [
        { label: '共振板 R ×2', isNew: true },
        { label: '三回声', isNew: true },
        { label: '同步终端', isNew: false }
      ],
      terminals: {
        T: { type: 'normal', name: '共振同步终端' }
      },
      doors: {
        b: { plates: { B: 1 }, tint: 'cyan' },
        z: { plates: { R: 2 }, terminals: ['T'], tint: 'magenta' }
      },
      goalConditions: [
        { kind: 'plate', id: 'R', target: 2, label: '共振板 R 双见证' },
        { kind: 'terminal', id: 'T', target: 1, label: '同步终端 T 写入' }
      ],
      hints: [
        '先在顶部的 B 板留声。之后每次都会有一条回声替你压住 B、开启 b 门。',
        '分别进入下方共振室并在 R 板上留声两次。最终时间线会有两个回声同时站在 R 上。',
        '最终时间线按下顶部终端 T，等待两个回声抵达 R。z 门会在同步成立的瞬间开启，穿过它抵达 E。'
      ],
      dialogueStart: '共振腔已上线。两个回声比两个实体更稳定，因为它们不会同时改变主意。',
      completeTitle: '共振稳定',
      completeCopy: '两个回声完全重合在共振板中央，仪表却没有报告碰撞。它们只是同时存在于同一个答案里。你需要花费一点时间，才能分清哪一个才是现在的你。',
      completeQuote: '“同频不是一致。同频是允许不同的过去同时成立。”',
      map: [
        '#################',
        '#S..B...T....zE##',
        '#............####',
        '#####b###########',
        '#...............#',
        '#.......R.......#',
        '#...............#',
        '#...............#',
        '#...............#',
        '#################'
      ]
    },
    {
      id: 'chamber-07',
      number: '07',
      title: '悖论核心',
      english: 'PARADOX CORE',
      chapter: 'CORE / FINAL OBSERVATION',
      depth: 'CLOSED LOOP',
      maxEchoes: 3,
      parForks: 3,
      introLead: '“核心不在房间尽头。核心就是这间房。”',
      introCopy: '悖论核心门 z 具有闭锁属性：只要 A 被占用、R 同时承载两个实体、记忆终端 M 完成写入，条件同时成立的那一个刻度就会被永久记住。你不再需要让所有条件一直保持。',
      objective: '记录一条路径到 M，让回声完成记忆写入并开启 b 门；再在 R 上依次固化两条回声。最终站上 A，让 z 门闭锁，离开 A 后在门保持开启的状态下抵达 E。',
      objectiveShort: '令 A、R×2、M 在同一刻度成立',
      fieldNote: '闭锁门只承认一次同时成立的真相。之后的所有谎言都会被它记住成事实。',
      mechanics: [
        { label: '闭锁核心门', isNew: true },
        { label: '记忆终端 M', isNew: false },
        { label: '共振板 R ×2', isNew: false },
        { label: '因果综合', isNew: true }
      ],
      terminals: {
        M: { type: 'memory', name: '核心记忆终端' }
      },
      doors: {
        b: { terminals: ['M'], tint: 'violet' },
        z: { plates: { A: 1, R: 2 }, terminals: ['M'], tint: 'magenta', latch: true }
      },
      goalConditions: [
        { kind: 'plate', id: 'A', target: 1, label: '锚点 A 占用' },
        { kind: 'plate', id: 'R', target: 2, label: '核心共振 R 双见证' },
        { kind: 'terminal', id: 'M', target: 1, label: '核心记忆 M 写入' }
      ],
      hints: [
        '第一回合：走到 M 上按 E，记录这条路径后按 R。记忆终端只会接受回声写入。',
        '后续回合中，等回声激活 M、开启 b 门，再到 R 上留声。总计需要三条回声。',
        '最终回合：回声会压住共振板 R 与记忆终端 M。你只需站上 A 板——z 门会在条件同时成立时闭锁，随后你可以离开 A 去出口 E。'
      ],
      dialogueStart: '欢迎抵达核心。你听见自己的声音从墙体内部传来。它说的不是“不要进来”，而是“终于”。',
      completeTitle: '核心闭锁',
      completeCopy: '门打开了。核心室里没有机器，只有成千上万个你，安静地站在同一秒里。你终于明白：这里从来不是设施，而是一段被你反复修改的证词。',
      completeQuote: '“闭环不是重复。闭环是一个终于愿意承担全部过去的决定。”',
      map: [
        '#################',
        '#S........#.....#',
        '#.......M.#.....#',
        '#.........z...E.#',
        '#.........#.....#',
        '#.......A.#.....#',
        '####b############',
        '#...............#',
        '#.....R.........#',
        '#################'
      ]
    }
  ];

  const ECHO_COLORS = ['#68edff', '#b28cff', '#ffad69'];
  const ECHO_NAMES = ['CYAN', 'VIOLET', 'AMBER'];
  const SAVE_KEY = 'chrono-paradox-lab-zero-v1';
  const DIRS = {
    up: { dx: 0, dy: -1, label: '上' },
    down: { dx: 0, dy: 1, label: '下' },
    left: { dx: -1, dy: 0, label: '左' },
    right: { dx: 1, dy: 0, label: '右' }
  };
  /* ==========================================================
     UTILITIES / SAVE / AUDIO / COMPILER
     ========================================================== */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pad3 = (n) => String(Math.max(0, n)).padStart(3, '0');
  const pad2 = (n) => String(Math.max(0, n)).padStart(2, '0');
  const keyOf = (x, y) => `${x},${y}`;
  const waitMs = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
  const nowMs = () => performance.now();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function hash(x, y, seed = 0) {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
    return n - Math.floor(n);
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.round(seconds));
    return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
  }

  function formatElapsed(ms) {
    return formatTime(ms / 1000);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadSave() {
    const fresh = {
      version: 1,
      completed: {},
      lastLevel: 0,
      muted: false
    };
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return fresh;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return fresh;
      return {
        version: 1,
        completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
        lastLevel: Number.isFinite(parsed.lastLevel) ? parsed.lastLevel : 0,
        muted: Boolean(parsed.muted)
      };
    } catch (error) {
      return fresh;
    }
  }

  let save = loadSave();

  function persistSave() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (error) {
      /* Local storage can be unavailable on file:// in hardened browsers. */
    }
  }

  function completedCount() {
    return LEVELS.reduce((count, level) => count + (save.completed[level.id] ? 1 : 0), 0);
  }

  function firstIncompleteIndex() {
    const index = LEVELS.findIndex((level) => !save.completed[level.id]);
    return index === -1 ? LEVELS.length - 1 : index;
  }

  function highestCompletedIndex() {
    let highest = -1;
    LEVELS.forEach((level, index) => {
      if (save.completed[level.id]) highest = Math.max(highest, index);
    });
    return highest;
  }

  function isLevelUnlocked(index) {
    if (index === 0) return true;
    if (save.completed[LEVELS[index].id]) return true;
    if (index <= highestCompletedIndex() + 1) return true;
    return Boolean(save.completed[LEVELS[index - 1].id]);
  }

  function gradeRank(grade) {
    return ({ S: 5, A: 4, B: 3, C: 2, D: 1 })[grade] || 0;
  }

  function gradeForResult(result, levelIndex) {
    const level = LEVELS[levelIndex];
    const extraForks = Math.max(0, result.forks - (level ? level.parForks : 0));
    const resetPenalty = result.resets;
    if (resetPenalty <= 1 && extraForks === 0) return { grade: 'S', label: 'PERFECT RECURSION' };
    if (resetPenalty <= 3 && extraForks <= 1) return { grade: 'A', label: 'CLEAN CAUSALITY' };
    if (resetPenalty <= 6) return { grade: 'B', label: 'STABLE LOOP' };
    if (resetPenalty <= 10) return { grade: 'C', label: 'RECOVERED FIELD' };
    return { grade: 'D', label: 'TRACE FRACTURE' };
  }

  function recordCompletion(levelIndex, result) {
    const level = LEVELS[levelIndex];
    const evaluation = gradeForResult(result, levelIndex);
    const entry = {
      grade: evaluation.grade,
      forks: result.forks,
      resets: result.resets,
      actions: result.actions,
      time: result.time,
      completedAt: Date.now()
    };
    const previous = save.completed[level.id];
    if (!previous || gradeRank(entry.grade) > gradeRank(previous.grade) ||
        (gradeRank(entry.grade) === gradeRank(previous.grade) && entry.time < previous.time)) {
      save.completed[level.id] = entry;
    }
    save.lastLevel = Math.min(levelIndex + 1, LEVELS.length - 1);
    persistSave();
    return { ...evaluation, entry };
  }

  class SoundEngine {
    constructor() {
      this.muted = Boolean(save.muted);
      this.ctx = null;
      this.master = null;
      this.ambientStarted = false;
      this.noiseBuffer = null;
      this.ambientPingTimer = null;
    }

    ensure() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
        if (!this.ambientStarted && !this.muted) this.startAmbient();
        return this.ctx;
      }
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      try {
        this.ctx = new AudioContextClass();
        const compressor = this.ctx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 18;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.24;
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.24;
        this.master.connect(compressor);
        compressor.connect(this.ctx.destination);
        this.noiseBuffer = this.createNoiseBuffer(2.4);
        this.startAmbient();
      } catch (error) {
        this.ctx = null;
      }
      return this.ctx;
    }

    createNoiseBuffer(seconds) {
      if (!this.ctx) return null;
      const length = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.018 * white) / 1.018;
        data[i] = last * 3.2;
      }
      return buffer;
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      save.muted = this.muted;
      persistSave();
      document.body.classList.toggle('audio-muted', this.muted);
      if (this.master && this.ctx) {
        this.master.gain.setTargetAtTime(this.muted ? 0 : 0.24, this.ctx.currentTime, 0.05);
      }
    }

    toggle() {
      this.setMuted(!this.muted);
      if (!this.muted) {
        this.ensure();
        this.click();
      }
      return this.muted;
    }

    startAmbient() {
      if (!this.ctx || this.ambientStarted || this.muted) return;
      this.ambientStarted = true;
      const t = this.ctx.currentTime;
      const bus = this.ctx.createGain();
      bus.gain.value = 0.055;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 280;
      filter.Q.value = 0.7;
      bus.connect(filter);
      filter.connect(this.master);
      const frequencies = [55, 82.5, 110];
      frequencies.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = index === 2 ? 'triangle' : 'sine';
        osc.frequency.value = freq;
        osc.detune.value = index === 1 ? -6 : index * 3;
        gain.gain.value = index === 2 ? 0.09 : 0.16;
        osc.connect(gain);
        gain.connect(bus);
        osc.start(t);
      });
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.037;
      lfoGain.gain.value = 38;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start(t);
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      noise.loop = true;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.012;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 510;
      noiseFilter.Q.value = 0.45;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.master);
      noise.start(t);
      this.ambientPingTimer = window.setInterval(() => this.ambientPing(), 9800);
    }

    ambientPing() {
      if (!this.ctx || this.muted) return;
      const t = this.ctx.currentTime + 0.12;
      this.tone(660 + Math.random() * 260, 2.2, 'sine', 0.018, t);
      this.tone(990 + Math.random() * 340, 1.7, 'sine', 0.009, t + 0.1);
    }

    tone(freq, duration, type = 'sine', gainValue = 0.05, when = null, slide = 0) {
      if (!this.ctx || this.muted) return;
      const t = when ?? this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), t);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + duration);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + duration + 0.05);
    }

    noise(duration = 0.22, gainValue = 0.05, filterFrequency = 700, type = 'bandpass') {
      if (!this.ctx || this.muted || !this.noiseBuffer) return;
      const t = this.ctx.currentTime;
      const source = this.ctx.createBufferSource();
      source.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = filterFrequency;
      filter.Q.value = 0.6;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      source.start(t);
      source.stop(t + duration + 0.05);
    }

    click() { this.tone(540, 0.08, 'triangle', 0.022); }
    move() { this.noise(0.075, 0.014, 860, 'highpass'); }
    fault() { this.tone(130, 0.14, 'sawtooth', 0.018, null, -24); }
    plate(active) {
      if (active) {
        this.tone(420, 0.24, 'sine', 0.03);
        this.tone(630, 0.3, 'sine', 0.018);
      } else {
        this.tone(250, 0.16, 'triangle', 0.014);
      }
    }
    door(open) {
      this.noise(open ? 0.55 : 0.4, open ? 0.045 : 0.028, open ? 420 : 300, 'bandpass');
      this.tone(open ? 180 : 140, 0.4, 'triangle', 0.026, null, open ? 95 : -42);
    }
    terminal(isMemory = false) {
      const root = isMemory ? 392 : 330;
      this.tone(root, 0.5, 'sine', 0.035);
      this.tone(root * 1.5, 0.65, 'sine', 0.022, this.ctx ? this.ctx.currentTime + 0.08 : null);
      if (isMemory) this.tone(root * 2, 0.8, 'triangle', 0.013, this.ctx ? this.ctx.currentTime + 0.16 : null);
    }
    fork() {
      this.noise(0.9, 0.075, 1800, 'bandpass');
      this.tone(680, 0.7, 'sine', 0.028, null, -390);
      if (this.ctx) this.tone(1320, 0.42, 'sine', 0.018, this.ctx.currentTime + 0.14, -540);
    }
    rewind() {
      this.noise(0.35, 0.04, 950, 'bandpass');
      this.tone(540, 0.3, 'triangle', 0.022, null, -260);
    }
    complete() {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      [261.63, 329.63, 392.0, 523.25].forEach((freq, i) => this.tone(freq, 1.7, 'sine', 0.036, t + i * 0.09));
      this.noise(0.8, 0.025, 2200, 'highpass');
    }
  }

  function compileLevel(def) {
    const height = def.map.length;
    const width = def.map[0].length;
    def.map.forEach((row, y) => {
      if (row.length !== width) {
        throw new Error(`Level ${def.id}: row ${y} is ${row.length} wide, expected ${width}.`);
      }
    });
    const walls = new Set();
    const floors = new Set();
    const plates = new Map();
    const plateCells = new Map();
    const terminalCells = new Map();
    const doorCells = [];
    let start = null;
    let exit = null;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const ch = def.map[y][x];
        const k = keyOf(x, y);
        if (ch === '#') {
          walls.add(k);
          continue;
        }
        floors.add(k);
        if (ch === 'S') {
          start = { x, y };
        } else if (ch === 'E') {
          exit = { x, y };
        } else if (ch === 'T' || ch === 'M') {
          const terminalConfig = def.terminals[ch] || { type: 'normal', name: ch };
          terminalCells.set(k, {
            id: ch,
            x,
            y,
            type: terminalConfig.type,
            name: terminalConfig.name
          });
        } else if (ch === 'A' || ch === 'B' || ch === 'R') {
          plates.set(k, ch);
          if (!plateCells.has(ch)) plateCells.set(ch, []);
          plateCells.get(ch).push({ x, y });
        } else if (Object.prototype.hasOwnProperty.call(def.doors, ch)) {
          const rule = def.doors[ch];
          doorCells.push({
            id: ch,
            x,
            y,
            rule,
            tint: rule.tint || 'cyan',
            visual: 0
          });
        }
      }
    }

    if (!start) throw new Error(`Level ${def.id}: missing start.`);
    if (!exit) throw new Error(`Level ${def.id}: missing exit.`);

    const doorsByChar = new Map();
    doorCells.forEach((door) => {
      if (!doorsByChar.has(door.id)) doorsByChar.set(door.id, door.rule);
    });

    return {
      ...def,
      width,
      height,
      walls,
      floors,
      plates,
      plateCells,
      terminalCells,
      doorCells,
      doorsByChar,
      start,
      exit,
      index: LEVELS.indexOf(def)
    };
  }

  const COMPILED_LEVELS = LEVELS.map((level) => compileLevel(level));
  /* ==========================================================
     DOM CACHE / MUTABLE APPLICATION STATE
     ========================================================== */

  const dom = {
    titleCanvas: $('#title-canvas'),
    gameCanvas: $('#game-canvas'),
    titleScreen: $('#title-screen'),
    gameScreen: $('#game-screen'),
    stageFrame: $('#stage-frame'),
    startButton: $('#start-button'),
    startLabel: $('#start-label'),
    chaptersButton: $('#chapters-button'),
    manualTitleButton: $('#manual-title-button'),
    titleProgress: $('#title-progress'),
    titleEchoCapacity: $('#title-echo-capacity'),
    soundToggle: $('#sound-toggle'),
    helpToggle: $('#help-toggle'),
    gameHelpToggle: $('#game-help-toggle'),
    brandHome: $('#brand-home'),
    pauseButton: $('#pause-button'),
    crumbNumber: $('#crumb-number'),
    crumbName: $('#crumb-name'),
    toolbarPhase: $('#toolbar-phase'),
    hudTick: $('#hud-tick'),
    hudEchoCount: $('#hud-echo-count'),
    hudEchoMax: $('#hud-echo-max'),
    syncMeter: $('#sync-meter'),
    objectiveShort: $('#objective-short'),
    helixDialogue: $('#helix-dialogue'),
    helixText: $('#helix-text'),
    dialogueClose: $('#dialogue-close'),
    cellTooltip: $('#cell-tooltip'),
    stageFlash: $('#stage-flash'),
    forkCaption: $('#fork-caption'),
    quickWait: $('#quick-wait'),
    quickInteract: $('#quick-interact'),
    quickFork: $('#quick-fork'),
    tickValue: $('#tick-value'),
    timelineState: $('#timeline-state'),
    timelineFill: $('#timeline-fill'),
    timelineMarker: $('#timeline-marker'),
    timelineEchoMarks: $('#timeline-echo-marks'),
    touchWait: $('#touch-wait'),
    touchInteract: $('#touch-interact'),
    touchFork: $('#touch-fork'),
    sideLevelIndex: $('#side-level-index'),
    sideTitle: $('#side-title'),
    sideMissionNumber: $('#side-mission-number'),
    sideEnglish: $('#side-english'),
    sideObjective: $('#side-objective'),
    conditionCount: $('#condition-count'),
    conditionList: $('#condition-list'),
    echoCapacity: $('#echo-capacity'),
    echoStack: $('#echo-stack'),
    undoEchoButton: $('#undo-echo-button'),
    logList: $('#log-list'),
    hintButton: $('#hint-button'),
    resetAttemptButton: $('#reset-attempt-button'),
    purgeButton: $('#purge-button'),
    quitToTitleButton: $('#quit-to-title-button'),
    toastStack: $('#toast-stack'),
    levelIntroOverlay: $('#level-intro-overlay'),
    introWatermark: $('#intro-watermark'),
    introBreadcrumb: $('#intro-breadcrumb'),
    introKicker: $('#intro-kicker'),
    introTitle: $('#intro-title'),
    introLead: $('#intro-lead'),
    introCopy: $('#intro-copy'),
    introMechanics: $('#intro-mechanics'),
    introObjective: $('#intro-objective'),
    introIndex: $('#intro-index'),
    introEchoes: $('#intro-echoes'),
    introDepth: $('#intro-depth'),
    introFieldNote: $('#intro-field-note'),
    enterChamberButton: $('#enter-chamber-button'),
    helpOverlay: $('#help-overlay'),
    chaptersOverlay: $('#chapters-overlay'),
    archiveProgress: $('#archive-progress'),
    chapterList: $('#chapter-list'),
    resetSaveButton: $('#reset-save-button'),
    confirmOverlay: $('#confirm-overlay'),
    confirmTitle: $('#confirm-title'),
    confirmCopy: $('#confirm-copy'),
    confirmCancel: $('#confirm-cancel'),
    confirmAccept: $('#confirm-accept'),
    pauseOverlay: $('#pause-overlay'),
    resumeButton: $('#resume-button'),
    pauseRestartButton: $('#pause-restart-button'),
    pauseChaptersButton: $('#pause-chapters-button'),
    pauseQuitButton: $('#pause-quit-button'),
    completeOverlay: $('#complete-overlay'),
    completeStamp: $('#complete-stamp'),
    completeKicker: $('#complete-kicker'),
    completeTitle: $('#complete-title'),
    completeCopy: $('#complete-copy'),
    completeGrade: $('#complete-grade'),
    completeGradeLabel: $('#complete-grade-label'),
    statActions: $('#stat-actions'),
    statForks: $('#stat-forks'),
    statResets: $('#stat-resets'),
    statTime: $('#stat-time'),
    completeQuote: $('#complete-quote'),
    replayButton: $('#replay-button'),
    nextChamberButton: $('#next-chamber-button'),
    endingOverlay: $('#ending-overlay'),
    endingArchiveButton: $('#ending-archive-button'),
    endingTitleButton: $('#ending-title-button'),
    liveRegion: $('#live-region')
  };

  let currentScreen = 'title';
  let currentLevelIndex = 0;
  let game = null;
  let hintIndex = 0;
  let confirmCallback = null;
  const openModalStack = [];
  const modalReturnFocus = new Map();
  let dialogueTimer = 0;
  let completionTimer = 0;
  let lastFrame = performance.now();
  let titleTime = 0;
  let gameTime = 0;
  let sceneMetrics = { x: 0, y: 0, tile: 0, width: 0, height: 0, cols: 0, rows: 0 };
  let pointerCell = { x: -1, y: -1 };
  let lastBumpMessageAt = 0;
  const audio = new SoundEngine();

  document.body.classList.toggle('audio-muted', audio.muted);

  /* ==========================================================
     SESSION STATE / WORLD SIMULATION
     ========================================================== */

  function createActor(x, y) {
    return {
      x,
      y,
      visualX: x,
      visualY: y,
      facing: 'right',
      bump: 0,
      bumpDirection: null,
      lastMovedAt: 0
    };
  }

  function createEcho(level, index, actions, pathSnapshot, previousCommitted) {
    return {
      id: `E${pad2(index + 1)}`,
      color: ECHO_COLORS[index % ECHO_COLORS.length],
      colorName: ECHO_NAMES[index % ECHO_NAMES.length],
      actions: actions.slice(),
      actionCount: Math.max(0, actions.length - 1),
      actor: createActor(level.start.x, level.start.y),
      trail: [{ x: level.start.x, y: level.start.y }],
      pathSnapshot: pathSnapshot.slice(),
      previousCommitted: new Set(previousCommitted),
      createdAt: Date.now()
    };
  }

  function createGameSession(levelIndex) {
    const level = COMPILED_LEVELS[levelIndex];
    const session = {
      level,
      index: levelIndex,
      player: createActor(level.start.x, level.start.y),
      currentActions: [null],
      trail: [{ x: level.start.x, y: level.start.y }],
      echoes: [],
      tick: 0,
      committedTerminals: new Set(),
      currentTerminals: new Set(),
      latchedDoors: new Set(),
      doorStates: new Map(),
      previousDoorStates: new Map(),
      doorVisuals: new Map(),
      plateCounts: {},
      previousPlateCounts: {},
      stats: { forks: 0, resets: 0, actions: 0, elapsedMs: 0 },
      running: false,
      completed: false,
      completionTime: null,
      logs: [],
      dialogueSeen: new Set(),
      particles: [],
      ambientSeed: Math.random() * 1000,
      shake: 0,
      forkWave: null,
      lastActionAt: 0,
      hover: { x: -1, y: -1 },
      bumpFlash: 0,
      terminalFlash: null,
      levelStartedAt: performance.now(),
      lastElapsedUpdate: performance.now()
    };

    level.doorCells.forEach((door) => {
      if (!session.doorVisuals.has(door.id)) {
        const open = false;
        session.doorVisuals.set(door.id, 0);
        session.doorStates.set(door.id, open);
        session.previousDoorStates.set(door.id, open);
      }
    });

    updateDoorStates(session, { announce: false });
    return session;
  }

  function currentActorList(session) {
    return [session.player, ...session.echoes.map((echo) => echo.actor)];
  }

  function getPlateCounts(session) {
    const counts = Object.create(null);
    currentActorList(session).forEach((actor) => {
      const plate = session.level.plates.get(keyOf(actor.x, actor.y));
      if (plate) counts[plate] = (counts[plate] || 0) + 1;
    });
    return counts;
  }

  function activeTerminals(session) {
    const set = new Set(session.committedTerminals);
    session.currentTerminals.forEach((id) => set.add(id));
    return set;
  }

  function rulePasses(session, rule, counts, terminals) {
    if (!rule) return false;
    const neededPlates = rule.plates || {};
    for (const [plate, needed] of Object.entries(neededPlates)) {
      if ((counts[plate] || 0) < needed) return false;
    }
    const neededTerminals = rule.terminals || [];
    for (const id of neededTerminals) {
      if (!terminals.has(id)) return false;
    }
    return true;
  }

  function updateDoorStates(session, options = {}) {
    const { announce = true } = options;
    const counts = getPlateCounts(session);
    const terminals = activeTerminals(session);
    const previousCounts = session.previousPlateCounts || {};
    const changedDoors = [];

    session.level.doorsByChar.forEach((rule, ch) => {
      let open = rulePasses(session, rule, counts, terminals);
      if (rule.latch && open) session.latchedDoors.add(ch);
      if (session.latchedDoors.has(ch)) open = true;
      const previous = Boolean(session.doorStates.get(ch));
      if (previous !== open) changedDoors.push({ id: ch, open, rule });
      session.previousDoorStates.set(ch, previous);
      session.doorStates.set(ch, open);
    });

    session.previousPlateCounts = counts;
    session.plateCounts = counts;

    if (announce) {
      changedDoors.forEach(({ id, open, rule }) => {
        if (open) {
          addLog(session, `因果门 ${id} 解锁。`, 'accent');
          spawnDoorBurst(session, id, rule);
          audio.door(true);
        } else {
          addLog(session, `因果门 ${id} 重新闭锁。`, 'warn');
          audio.door(false);
        }
      });
      Object.keys(counts).forEach((plate) => {
        const before = previousCounts[plate] || 0;
        const after = counts[plate] || 0;
        if (before !== after) {
          audio.plate(after > 0);
          if (after > before) {
            session.level.plateCells.get(plate)?.forEach((cell) => {
              if (Math.abs(cell.x - session.player.x) <= 2 && Math.abs(cell.y - session.player.y) <= 2) {
                spawnPlateBurst(session, cell, plate);
              }
            });
          }
        }
      });
    }
    return changedDoors;
  }

  function conditionState(session, condition) {
    const goalLatched = Array.from(session.latchedDoors).some((id) => {
      const rule = session.level.doorsByChar.get(id);
      return rule && rule.latch;
    });
    if (goalLatched) {
      return { met: true, value: '闭锁保持' };
    }
    if (condition.kind === 'plate') {
      const count = session.plateCounts[condition.id] || 0;
      return {
        met: count >= condition.target,
        value: `${count} / ${condition.target}`
      };
    }
    if (condition.kind === 'terminal') {
      const has = activeTerminals(session).has(condition.id);
      return {
        met: has,
        value: has ? '写入完成' : '等待写入'
      };
    }
    return { met: false, value: '—' };
  }

  function allGoalConditionsMet(session) {
    return session.level.goalConditions.every((condition) => conditionState(session, condition).met);
  }

  function getTerminalAt(session, x, y) {
    return session.level.terminalCells.get(keyOf(x, y)) || null;
  }

  function isDoorOpen(session, x, y) {
    const ch = session.level.map[y]?.[x];
    if (!session.level.doorsByChar.has(ch)) return true;
    return Boolean(session.doorStates.get(ch));
  }

  function isWalkable(session, x, y) {
    const level = session.level;
    if (x < 0 || y < 0 || x >= level.width || y >= level.height) return false;
    if (level.walls.has(keyOf(x, y))) return false;
    const ch = level.map[y][x];
    if (level.doorsByChar.has(ch) && !session.doorStates.get(ch)) return false;
    return true;
  }

  function activateTerminal(session, terminal, actorKind) {
    const active = activeTerminals(session);
    if (terminal.type === 'memory' && actorKind === 'player') {
      session.terminalFlash = { x: terminal.x, y: terminal.y, kind: 'memory-reject', at: nowMs() };
      audio.fault();
      return { ok: false, reason: 'memory-reject', terminal };
    }
    if (active.has(terminal.id)) {
      session.terminalFlash = { x: terminal.x, y: terminal.y, kind: 'already', at: nowMs() };
      return { ok: true, already: true, terminal };
    }
    if (actorKind === 'echo') {
      session.committedTerminals.add(terminal.id);
    } else {
      session.currentTerminals.add(terminal.id);
    }
    session.terminalFlash = { x: terminal.x, y: terminal.y, kind: 'write', at: nowMs() };
    spawnTerminalBurst(session, terminal);
    audio.terminal(terminal.type === 'memory');
    addLog(session, `${terminal.type === 'memory' ? '记忆终端' : '终端'} ${terminal.id} 写入完成。`, 'accent');
    return { ok: true, already: false, terminal };
  }

  function resetActorPosition(actor, level) {
    actor.x = level.start.x;
    actor.y = level.start.y;
    actor.visualX = level.start.x;
    actor.visualY = level.start.y;
    actor.bump = 0;
    actor.bumpDirection = null;
  }

  function resetRun(session, options = {}) {
    const { preserveActionCount = false } = options;
    session.tick = 0;
    session.currentTerminals.clear();
    session.latchedDoors.clear();
    session.currentActions = [null];
    session.trail = [{ x: session.level.start.x, y: session.level.start.y }];
    resetActorPosition(session.player, session.level);
    session.player.facing = 'right';
    session.echoes.forEach((echo) => {
      resetActorPosition(echo.actor, session.level);
      echo.actor.facing = 'right';
      echo.trail = [{ x: session.level.start.x, y: session.level.start.y }];
    });
    session.particles = [];
    session.terminalFlash = null;
    if (!preserveActionCount) session.stats.actions = 0;
    updateDoorStates(session, { announce: false });
    if (Array.isArray(session.logs)) {
      /* logs deliberately survive a rewind: HELIX remembers. */
    }
    updateHUD(session);
    updateSidebar(session);
  }

  function resetCurrentAttempt(session, options = {}) {
    if (!session || session.completed) return;
    const { countReset = true, silent = false } = options;
    if (countReset) session.stats.resets += 1;
    resetRun(session);
    session.forkWave = null;
    audio.rewind();
    session.shake = prefersReducedMotion ? 0 : 3;
    if (!silent) {
      addLog(session, '当前时间线已重写。回声链保持不变。', 'warn');
    }
    updateHUD(session);
    updateSidebar(session);
  }

  function purgeSession(session) {
    if (!session) return;
    session.echoes = [];
    session.committedTerminals.clear();
    session.currentTerminals.clear();
    session.stats = { forks: 0, resets: 0, actions: 0, elapsedMs: 0 };
    session.levelStartedAt = performance.now();
    session.lastElapsedUpdate = performance.now();
    session.completed = false;
    session.running = true;
    session.logs = [];
    resetRun(session);
    session.forkWave = null;
    addLog(session, '因果缓存已清空。当前实验舱恢复到初始状态。', 'warn');
    showToast('因果缓存已清空', '所有回声与已写入终端均已回收。', 'warn', 3600);
    updateHUD(session);
    updateSidebar(session);
  }
  /* ==========================================================
     ACTIONS / ECHO REPLAY / COMPLETION
     ========================================================== */

  function canAcceptGameInput() {
    return Boolean(
      game &&
      currentScreen === 'game' &&
      game.running &&
      !game.completed &&
      document.body.classList.contains('is-playing') &&
      openModalStack.length === 0
    );
  }

  function findDoorAt(session, x, y) {
    const ch = session.level.map[y]?.[x];
    return ch && session.level.doorsByChar.has(ch) ? ch : null;
  }

  function bumpPlayer(session, direction, reason) {
    session.player.bump = 1;
    session.player.bumpDirection = direction;
    session.bumpFlash = 1;
    session.shake = prefersReducedMotion ? 0 : 1.8;
    audio.fault();
    const now = nowMs();
    if (now - lastBumpMessageAt > 900) {
      lastBumpMessageAt = now;
      if (reason === 'door') {
        showToast('门禁未响应', '因果条件尚未达成。回声正在按自己的刻度行进；可等待一个时间刻度。', 'warn', 3200);
      } else if (reason === 'edge') {
        showToast('结构封闭', '当前维护通道被实验舱结构阻断。', 'warn', 2400);
      }
    }
  }

  function tryMove(direction) {
    if (!canAcceptGameInput()) return false;
    const dir = DIRS[direction];
    if (!dir) return false;
    const session = game;
    const nx = session.player.x + dir.dx;
    const ny = session.player.y + dir.dy;
    session.player.facing = direction;

    if (nx < 0 || ny < 0 || nx >= session.level.width || ny >= session.level.height) {
      bumpPlayer(session, direction, 'edge');
      return false;
    }
    if (session.level.walls.has(keyOf(nx, ny))) {
      bumpPlayer(session, direction, 'edge');
      return false;
    }
    const door = findDoorAt(session, nx, ny);
    if (door && !session.doorStates.get(door)) {
      bumpPlayer(session, direction, 'door');
      if (!session.dialogueSeen.has('closed-door')) {
        session.dialogueSeen.add('closed-door');
        showDialogue('你撞上的是一扇尚不存在的过去。先让条件成立，再穿过它。');
      }
      return false;
    }

    advanceTick(session, { type: 'move', direction }, { resolveCurrentMove: true });
    return true;
  }

  function waitTick() {
    if (!canAcceptGameInput()) return;
    advanceTick(game, { type: 'wait' });
  }

  function interactWithTerminal() {
    if (!canAcceptGameInput()) return;
    const session = game;
    const terminal = getTerminalAt(session, session.player.x, session.player.y);
    if (!terminal) {
      audio.fault();
      showToast('没有可读取的接口', '只有站在终端 T / M 上时才能按 E 进行因果写入。', 'warn', 2600);
      return;
    }
    advanceTick(session, { type: 'interact' }, { terminal });
  }

  function doorSnapshot(session) {
    return new Map(session.doorStates);
  }

  function isWalkableUsingSnapshot(session, x, y, snapshot) {
    const level = session.level;
    if (x < 0 || y < 0 || x >= level.width || y >= level.height) return false;
    if (level.walls.has(keyOf(x, y))) return false;
    const ch = level.map[y][x];
    if (level.doorsByChar.has(ch) && !snapshot.get(ch)) return false;
    return true;
  }

  function executeEchoAction(session, echo, tick, snapshot) {
    const action = echo.actions[tick];
    if (!action) return;
    if (action.type === 'move') {
      const dir = DIRS[action.direction];
      if (!dir) return;
      echo.actor.facing = action.direction;
      const nx = echo.actor.x + dir.dx;
      const ny = echo.actor.y + dir.dy;
      if (isWalkableUsingSnapshot(session, nx, ny, snapshot)) {
        echo.actor.x = nx;
        echo.actor.y = ny;
        echo.trail.push({ x: nx, y: ny });
      }
    } else if (action.type === 'interact') {
      const terminal = getTerminalAt(session, echo.actor.x, echo.actor.y);
      if (terminal) {
        activateTerminal(session, terminal, 'echo');
      }
    }
  }

  function advanceTick(session, action, options = {}) {
    if (!session || session.completed) return;
    const doorsBefore = doorSnapshot(session);
    session.tick += 1;
    const tick = session.tick;
    session.currentActions[tick] = action;
    session.stats.actions = tick;

    session.echoes.forEach((echo) => executeEchoAction(session, echo, tick, doorsBefore));

    if (action.type === 'move' && options.resolveCurrentMove) {
      const dir = DIRS[action.direction];
      const nx = session.player.x + dir.dx;
      const ny = session.player.y + dir.dy;
      session.player.facing = action.direction;
      if (isWalkableUsingSnapshot(session, nx, ny, doorsBefore)) {
        session.player.x = nx;
        session.player.y = ny;
        session.trail.push({ x: nx, y: ny });
        audio.move();
        spawnMoveMotes(session, nx, ny);
      } else {
        bumpPlayer(session, action.direction, findDoorAt(session, nx, ny) ? 'door' : 'edge');
      }
    } else if (action.type === 'interact') {
      const terminal = options.terminal || getTerminalAt(session, session.player.x, session.player.y);
      if (terminal) {
        const result = activateTerminal(session, terminal, 'player');
        if (result.reason === 'memory-reject') {
          addLog(session, '记忆终端 M 拒绝实体签名；路径已计入当前时间线。', 'danger');
          if (!session.dialogueSeen.has('memory-reject')) {
            session.dialogueSeen.add('memory-reject');
            showDialogue('实体签名被拒绝。你已经站上了正确的坐标，现在让回声替你重走这一步。');
          }
          showToast('记忆签名缺失', '路径已记录。按 R 固化时间线，让回声完成写入。', 'danger', 4300);
        } else if (result.already) {
          addLog(session, `终端 ${terminal.id} 已处于写入状态。`, '');
        }
      }
    } else if (action.type === 'wait') {
      audio.tone(200, 0.08, 'sine', 0.008);
    }

    updateDoorStates(session, { announce: true });
    updateHUD(session);
    updateSidebar(session);
    updateCellTooltip();
    checkExit(session);
  }

  function forkTimeline() {
    if (!canAcceptGameInput()) return;
    const session = game;
    if (session.echoes.length >= session.level.maxEchoes) {
      audio.fault();
      showToast('时间栈已满', '先回收最后一条回声，或清空本层因果缓存。', 'danger', 3600);
      pulseForkButton();
      return;
    }
    if (session.tick === 0) {
      audio.fault();
      showToast('无法固化空时间线', '至少执行一次行动（移动、等待或交互）后再按 R。', 'warn', 3200);
      pulseForkButton();
      return;
    }

    const pendingCommitted = new Set(session.committedTerminals);
    session.currentTerminals.forEach((id) => session.committedTerminals.add(id));
    const echoIndex = session.echoes.length;
    const echo = createEcho(
      session.level,
      echoIndex,
      session.currentActions,
      session.trail,
      pendingCommitted
    );
    echo.actionCount = session.tick;
    session.echoes.push(echo);
    session.stats.forks += 1;

    addLog(session, `时间线固化：回声 ${echo.id} 已接入。路径长度 ${echo.actionCount} 刻度。`, 'accent');
    audio.fork();
    triggerForkVisuals();

    resetRun(session);
    updateHUD(session);
    updateSidebar(session);
    if (!session.dialogueSeen.has('first-fork')) {
      session.dialogueSeen.add('first-fork');
      showDialogue('回声已写入。它会重走你刚才的每一步，并替你把那时的选择保持在原位。');
    }
  }

  function undoLastEcho() {
    if (!game || game.completed || !game.running) return;
    if (!game.echoes.length) return;
    const echo = game.echoes.pop();
    game.committedTerminals = new Set(echo.previousCommitted);
    game.currentTerminals.clear();
    game.stats.forks = Math.max(0, game.stats.forks - 1);
    resetRun(game);
    audio.rewind();
    addLog(game, `回声 ${echo.id} 已回收，因果栈回退一层。`, 'warn');
    showToast('回声已回收', `最后一条 ${echo.id} 已从时间栈中移除。`, 'warn', 2800);
    updateHUD(game);
    updateSidebar(game);
  }

  function checkExit(session) {
    const exit = session.level.exit;
    if (session.player.x !== exit.x || session.player.y !== exit.y) return;
    if (!allGoalConditionsMet(session)) {
      if (!session.dialogueSeen.has('exit-unstable')) {
        session.dialogueSeen.add('exit-unstable');
        showToast('出口稳定场未建立', '你已抵达出口，但因果条件尚未在同一刻度全部成立。', 'warn', 3600);
      }
      return;
    }
    completeLevel(session);
  }

  function completeLevel(session) {
    if (session.completed) return;
    session.completed = true;
    session.running = false;
    session.completionTime = nowMs();
    session.stats.actions = session.tick;
    audio.complete();
    spawnCompletionBurst(session);
    session.shake = prefersReducedMotion ? 0 : 8;
    addLog(session, '实验舱稳定。当前出口已达到全部因果条件。', 'success');

    const result = {
      forks: session.stats.forks,
      resets: session.stats.resets,
      actions: session.stats.actions,
      time: session.stats.elapsedMs / 1000
    };
    const evaluation = recordCompletion(session.index, result);
    const level = LEVELS[session.index];
    updateTitleUI();
    updateHUD(session);
    updateSidebar(session);

    window.clearTimeout(completionTimer);
    completionTimer = window.setTimeout(() => {
      if (currentScreen !== 'game' || game !== session) return;
      populateCompleteModal(level, session, evaluation);
      openModal('complete-overlay');
    }, prefersReducedMotion ? 260 : 1080);
  }

  function pulseForkButton() {
    [dom.quickFork, dom.touchFork].forEach((button) => {
      if (!button) return;
      button.classList.remove('is-pulsing');
      void button.offsetWidth;
      button.classList.add('is-pulsing');
    });
  }

  function triggerForkVisuals() {
    if (game) {
      game.forkWave = { started: nowMs(), fromX: game.player.x, fromY: game.player.y };
      game.shake = prefersReducedMotion ? 0 : 5;
    }
    if (dom.stageFlash) {
      dom.stageFlash.classList.remove('is-active');
      void dom.stageFlash.offsetWidth;
      dom.stageFlash.classList.add('is-active');
    }
    if (dom.forkCaption) {
      dom.forkCaption.classList.remove('is-active');
      void dom.forkCaption.offsetWidth;
      dom.forkCaption.classList.add('is-active');
    }
  }
  /* ==========================================================
     FEEDBACK / HUD / SIDEBAR / TOOLTIP
     ========================================================== */

  function announce(message) {
    if (!dom.liveRegion) return;
    dom.liveRegion.textContent = '';
    window.setTimeout(() => {
      dom.liveRegion.textContent = message;
    }, 20);
  }

  function showToast(title, message, tone = 'info', duration = 3800) {
    if (!dom.toastStack) return;
    while (dom.toastStack.children.length >= 3) {
      dom.toastStack.firstElementChild?.remove();
    }
    const toast = document.createElement('div');
    toast.className = `toast is-${tone}`;
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(message)}`;
    dom.toastStack.appendChild(toast);
    announce(`${title}。${message}`);
    window.setTimeout(() => {
      toast.classList.add('is-out');
      window.setTimeout(() => toast.remove(), 260);
    }, duration);
  }

  function addLog(session, message, tone = '') {
    if (!session) return;
    session.logs.unshift({
      tick: session.tick,
      message,
      tone,
      at: Date.now()
    });
    if (session.logs.length > 40) session.logs.length = 40;
    renderLog(session);
  }

  function renderLog(session) {
    if (!dom.logList || !session) return;
    const rows = session.logs.slice(0, 14).map((entry, index) => `
      <div class="log-entry ${entry.tone ? `is-${escapeHtml(entry.tone)}` : ''} ${index === 0 ? 'is-new' : ''}">
        <span class="log-tick">T+${pad3(entry.tick)}</span>
        <span>${escapeHtml(entry.message)}</span>
      </div>
    `).join('');
    dom.logList.innerHTML = rows || '<div class="log-entry"><span class="log-tick">T+000</span><span>等待因果场输入。</span></div>';
  }

  function showDialogue(message, duration = 8200) {
    if (!dom.helixDialogue || !dom.helixText) return;
    window.clearTimeout(dialogueTimer);
    dom.helixText.textContent = message;
    dom.helixDialogue.classList.add('is-visible');
    if (duration > 0) {
      dialogueTimer = window.setTimeout(() => {
        dom.helixDialogue.classList.remove('is-visible');
      }, duration);
    }
  }

  function hideDialogue() {
    window.clearTimeout(dialogueTimer);
    dom.helixDialogue?.classList.remove('is-visible');
  }

  function goalProgressRatio(session) {
    if (!session.level.goalConditions.length) return 0;
    let total = 0;
    session.level.goalConditions.forEach((condition) => {
      if (condition.kind === 'plate') {
        const count = session.plateCounts[condition.id] || 0;
        total += clamp(count / Math.max(1, condition.target), 0, 1);
      } else {
        total += activeTerminals(session).has(condition.id) ? 1 : 0;
      }
    });
    return total / session.level.goalConditions.length;
  }

  function updateHUD(session) {
    if (!session) return;
    const echoCount = session.echoes.length;
    const maxEchoes = session.level.maxEchoes;
    dom.hudTick.textContent = pad3(session.tick);
    dom.tickValue.textContent = pad3(session.tick);
    dom.hudEchoCount.textContent = pad2(echoCount);
    dom.hudEchoMax.textContent = `/ ${pad2(maxEchoes)}`;
    dom.echoCapacity.textContent = `${echoCount} / ${maxEchoes}`;

    const ratio = goalProgressRatio(session);
    const lit = Math.round(ratio * 8);
    Array.from(dom.syncMeter.children).forEach((bar, index) => {
      bar.classList.toggle('is-on', index < lit);
    });

    const events = Math.max(
      8,
      session.tick,
      ...session.echoes.map((echo) => echo.actionCount || 0)
    );
    const percent = clamp((session.tick / events) * 100, 0, 100);
    dom.timelineFill.style.width = `${percent}%`;
    dom.timelineMarker.style.left = `${percent}%`;

    const echoMarks = session.echoes.map((echo) => {
      const left = clamp(((echo.actionCount || 0) / events) * 100, 0, 100);
      return `<span class="echo-mark" style="left:${left}%;--echo-color:${echo.color}"></span>`;
    }).join('');
    dom.timelineEchoMarks.innerHTML = echoMarks;

    let timelineState = 'AWAITING ACTION';
    if (session.completed) timelineState = 'EXIT STABLE';
    else if (allGoalConditionsMet(session)) timelineState = 'CAUSAL LOCK SATISFIED';
    else if (session.tick === 0) timelineState = echoCount ? 'ECHO CHAIN READY' : 'AWAITING ACTION';
    else if (echoCount) timelineState = 'ECHO CHAIN ACTIVE';
    else timelineState = 'SINGLE TIMELINE';
    dom.timelineState.textContent = timelineState;

    const toolbar = dom.toolbarPhase?.parentElement;
    if (toolbar) {
      toolbar.classList.remove('is-warning', 'is-danger');
      if (session.completed) {
        dom.toolbarPhase.textContent = 'CAUSAL STABILITY RESTORED';
      } else if (allGoalConditionsMet(session)) {
        dom.toolbarPhase.textContent = 'CAUSAL LOCK SATISFIED';
      } else if (echoCount) {
        dom.toolbarPhase.textContent = 'TEMPORAL FIELD COUPLED';
      } else {
        dom.toolbarPhase.textContent = 'TEMPORAL FIELD STABLE';
      }
    }

    const inputLocked = !session.running || session.completed;
    dom.quickWait.disabled = inputLocked;
    dom.quickInteract.disabled = inputLocked;
    dom.touchWait.disabled = inputLocked;
    dom.touchInteract.disabled = inputLocked;
    const forkDisabled = inputLocked || echoCount >= maxEchoes || session.tick === 0;
    dom.quickFork.disabled = forkDisabled;
    dom.touchFork.disabled = forkDisabled;
    dom.undoEchoButton.disabled = echoCount === 0 || session.completed;
  }

  function describeDoorRule(rule) {
    const parts = [];
    if (rule.plates) {
      Object.entries(rule.plates).forEach(([plate, count]) => {
        parts.push(`${plate} ×${count}`);
      });
    }
    if (rule.terminals) {
      rule.terminals.forEach((terminal) => parts.push(`${terminal} 写入`));
    }
    if (rule.latch) parts.push('闭锁');
    return parts.join(' + ') || '手动';
  }

  function renderConditions(session) {
    const conditions = session.level.goalConditions;
    let metCount = 0;
    dom.conditionList.innerHTML = conditions.map((condition) => {
      const state = conditionState(session, condition);
      if (state.met) metCount += 1;
      const icon = condition.kind === 'terminal' ? 'T' : condition.id;
      return `
        <div class="condition-row ${state.met ? 'is-met' : ''}">
          <span class="condition-icon" aria-hidden="true"></span>
          <span>${escapeHtml(condition.label)}</span>
          <span class="condition-value">${escapeHtml(icon === 'T' ? state.value : `${icon} ${state.value}`)}</span>
        </div>
      `;
    }).join('');
    dom.conditionCount.textContent = `${metCount} / ${conditions.length}`;
  }

  function renderEchoStack(session) {
    const max = session.level.maxEchoes;
    const slots = [];
    for (let index = 0; index < max; index += 1) {
      const echo = session.echoes[index];
      if (echo) {
        slots.push(`
          <div class="echo-slot" style="--echo-color:${echo.color}">
            <span class="echo-badge">${echo.id}</span>
            <span class="echo-slot-copy">
              <strong>${echo.colorName} · ${echo.actionCount} 刻度</strong>
              <small>路径已固化 / 正在回放</small>
            </span>
            <span class="echo-slot-tag">SYNC</span>
          </div>
        `);
      } else {
        slots.push(`
          <div class="echo-slot is-empty">
            <span class="echo-badge">${pad2(index + 1)}</span>
            <span class="echo-slot-copy">
              <strong>空回声槽</strong>
              <small>${max ? '站在关键坐标，按 R 固化' : '本实验舱禁用回声'}
              </small>
            </span>
            <span class="echo-slot-tag">IDLE</span>
          </div>
        `);
      }
    }
    dom.echoStack.innerHTML = slots.join('') || '<div class="condition-empty">本实验舱不提供回声协议。</div>';
    dom.undoEchoButton.disabled = session.echoes.length === 0 || session.completed;
  }

  function updateSidebar(session) {
    if (!session) return;
    renderConditions(session);
    renderEchoStack(session);
    renderLog(session);
  }

  function cellDescription(session, x, y) {
    const level = session.level;
    if (x < 0 || y < 0 || x >= level.width || y >= level.height) return '';
    const ch = level.map[y][x];
    if (ch === '#') return '封闭结构 / BULKHEAD';
    if (ch === 'E') return allGoalConditionsMet(session) ? '安全出口 E / STABLE' : '安全出口 E / 条件未满足';
    if (ch === 'A' || ch === 'B') {
      const count = session.plateCounts[ch] || 0;
      return `压力板 ${ch} / 占用 ${count}`;
    }
    if (ch === 'R') {
      const count = session.plateCounts.R || 0;
      return `共振板 R / 同步 ${count} / 2`;
    }
    if (ch === 'T' || ch === 'M') {
      const terminal = getTerminalAt(session, x, y);
      const active = activeTerminals(session).has(ch);
      return `${terminal?.type === 'memory' ? '记忆终端' : '环境终端'} ${ch} / ${active ? '已写入' : '等待写入'}`;
    }
    if (level.doorsByChar.has(ch)) {
      return `因果门 ${ch} / ${session.doorStates.get(ch) ? 'OPEN' : 'CLOSED'} · ${describeDoorRule(level.doorsByChar.get(ch))}`;
    }
    if (session.player.x === x && session.player.y === y) return `K-07 / T+${pad3(session.tick)}`;
    const echoHere = session.echoes.find((echo) => echo.actor.x === x && echo.actor.y === y);
    if (echoHere) return `回声 ${echoHere.id} / 已固化路径`;
    return '实验舱地面 / FLOOR';
  }

  function updateCellTooltip() {
    if (!game || !dom.cellTooltip) return;
    const { x, y } = pointerCell;
    if (x < 0 || y < 0 || x >= game.level.width || y >= game.level.height || openModalStack.length > 0) {
      dom.cellTooltip.hidden = true;
      return;
    }
    const text = cellDescription(game, x, y);
    if (!text) {
      dom.cellTooltip.hidden = true;
      return;
    }
    const pad = 10;
    const stageRect = dom.stageFrame.getBoundingClientRect();
    const px = sceneMetrics.x + sceneMetrics.tile * (x + 0.5);
    const py = sceneMetrics.y + sceneMetrics.tile * (y + 0.5);
    dom.cellTooltip.textContent = text;
    dom.cellTooltip.hidden = false;
    const maxLeft = stageRect.width - 20;
    const maxTop = stageRect.height - 20;
    dom.cellTooltip.style.left = `${clamp(px + pad, 8, maxLeft)}px`;
    dom.cellTooltip.style.top = `${clamp(py - sceneMetrics.tile * 0.72, 8, maxTop)}px`;
  }
  /* ==========================================================
     SCREEN FLOW / MODALS / LEVEL UI
     ========================================================== */

  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    if (!openModalStack.includes(id)) {
      const active = document.activeElement;
      if (active && !overlay.contains(active)) modalReturnFocus.set(id, active);
      openModalStack.push(id);
      overlay.style.zIndex = String(100 + openModalStack.length);
    }
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    const panel = overlay.querySelector('.modal, .ending-shell');
    if (panel) {
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
    }
    const allFocusable = Array.from(overlay.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
      .filter((element) => element.getClientRects().length > 0);
    const preferred = overlay.querySelector('.button-primary');
    const focusTarget = preferred && preferred.getClientRects().length ? preferred : allFocusable[0];
    if (focusTarget) window.setTimeout(() => focusTarget.focus({ preventScroll: true }), 40);
  }

  function closeModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    const activeInside = overlay.contains(document.activeElement);
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    const index = openModalStack.indexOf(id);
    if (index !== -1) openModalStack.splice(index, 1);
    if (!openModalStack.length) document.body.classList.remove('modal-open');
    else {
      const topId = openModalStack[openModalStack.length - 1];
      const top = document.getElementById(topId);
      if (top) top.style.zIndex = String(100 + openModalStack.length);
    }
    const returnTarget = modalReturnFocus.get(id);
    modalReturnFocus.delete(id);
    if (activeInside) {
      window.setTimeout(() => {
        if (returnTarget && returnTarget.isConnected && returnTarget.getClientRects().length) {
          returnTarget.focus({ preventScroll: true });
        } else if (openModalStack.length) {
          const topId = openModalStack[openModalStack.length - 1];
          const top = document.getElementById(topId);
          const preferred = top?.querySelector('.button-primary, button:not([disabled])');
          if (preferred && preferred.getClientRects().length) preferred.focus({ preventScroll: true });
        } else if (currentScreen === 'game' && dom.stageFrame) {
          dom.stageFrame.focus({ preventScroll: true });
        } else if (dom.startButton && dom.startButton.getClientRects().length) {
          dom.startButton.focus({ preventScroll: true });
        }
      }, 30);
    }
    updateCellTooltip();
  }

  function closeAllModals() {
    Array.from(openModalStack).reverse().forEach((id) => closeModal(id));
    document.body.classList.remove('modal-open');
  }

  function closeTopModal() {
    const topId = openModalStack[openModalStack.length - 1];
    if (!topId) return false;
    if (topId === 'level-intro-overlay') return false;
    if (topId === 'complete-overlay' || topId === 'ending-overlay') return false;
    closeModal(topId);
    return true;
  }

  function updateTitleUI() {
    const count = completedCount();
    dom.titleProgress.textContent = `${pad2(count)} / ${pad2(LEVELS.length)}`;
    dom.titleEchoCapacity.textContent = '03 MAX';
    if (count === 0) dom.startLabel.textContent = '进入设施';
    else if (count < LEVELS.length) dom.startLabel.textContent = `继续实验 · ${pad2(firstIncompleteIndex() + 1)}`;
    else dom.startLabel.textContent = '重访悖论核心';
    document.body.classList.toggle('facility-complete', count === LEVELS.length);
  }

  function showTitle() {
    window.clearTimeout(completionTimer);
    closeAllModals();
    hideDialogue();
    currentScreen = 'title';
    if (game) game.running = false;
    game = null;
    dom.gameScreen.classList.remove('is-active');
    dom.titleScreen.classList.add('is-active');
    document.body.classList.remove('is-playing');
    updateTitleUI();
    dom.titleCanvas.style.display = '';
    dom.titleCanvas.style.opacity = '';
    closeTopModal();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function setupLevelUI(level) {
    dom.crumbNumber.textContent = level.number;
    dom.crumbName.textContent = level.title;
    dom.sideLevelIndex.textContent = `${level.number} / ${pad2(LEVELS.length)}`;
    dom.sideTitle.textContent = level.title;
    dom.sideMissionNumber.textContent = level.number;
    dom.sideEnglish.textContent = level.english;
    dom.sideObjective.textContent = level.objective;
    dom.objectiveShort.textContent = level.objectiveShort;
    dom.helixDialogue.classList.remove('is-visible');
    dom.hintButton.querySelector('span:first-child').textContent = '请求线索';
  }

  function populateBrief(level) {
    dom.introWatermark.textContent = level.number;
    dom.introBreadcrumb.textContent = level.chapter;
    dom.introKicker.textContent = `CHAMBER ${level.number} / ${level.english}`;
    dom.introTitle.textContent = level.title;
    dom.introLead.textContent = level.introLead;
    dom.introCopy.textContent = level.introCopy;
    dom.introObjective.textContent = level.objective;
    dom.introIndex.textContent = `${level.number} / ${pad2(LEVELS.length)}`;
    dom.introEchoes.textContent = pad2(level.maxEchoes);
    dom.introDepth.textContent = level.depth;
    dom.introFieldNote.textContent = level.fieldNote;
    dom.introMechanics.innerHTML = level.mechanics.map((mechanic) => `
      <span class="mechanic-tag ${mechanic.isNew ? 'is-new' : ''}">${escapeHtml(mechanic.label)}${mechanic.isNew ? ' / NEW' : ''}</span>
    `).join('');
  }

  function loadLevel(index, options = {}) {
    const { showIntro = true } = options;
    if (index < 0 || index >= LEVELS.length) return;
    window.clearTimeout(completionTimer);
    closeAllModals();
    hideDialogue();
    currentLevelIndex = index;
    currentScreen = 'game';
    dom.titleScreen.classList.remove('is-active');
    dom.gameScreen.classList.add('is-active');
    dom.stageFrame.classList.remove('is-booting');
    void dom.stageFrame.offsetWidth;
    dom.stageFrame.classList.add('is-booting');
    window.setTimeout(() => dom.stageFrame.classList.remove('is-booting'), 760);
    document.body.classList.add('is-playing');
    game = createGameSession(index);
    game.running = !showIntro;
    hintIndex = 0;
    setupLevelUI(game.level);
    populateBrief(game.level);
    addLog(game, `实验舱 ${game.level.number} 接入。${game.level.maxEchoes ? `时间栈容量 ${game.level.maxEchoes}。` : '回声协议未开放。'}`, 'accent');
    addLog(game, '当前时间线从刻度 000 开始。', '');
    updateHUD(game);
    updateSidebar(game);
    updateCellTooltip();
    save.lastLevel = index;
    persistSave();
    audio.ensure();
    audio.click();
    if (showIntro) {
      openModal('level-intro-overlay');
    } else {
      game.levelStartedAt = performance.now();
      game.lastElapsedUpdate = performance.now();
      window.setTimeout(() => showDialogue(game?.level.dialogueStart || '', 9000), 420);
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function enterChamber() {
    if (!game) return;
    closeModal('level-intro-overlay');
    game.running = true;
    game.levelStartedAt = performance.now();
    if (dom.stageFrame) dom.stageFrame.focus({ preventScroll: true });
    game.lastElapsedUpdate = performance.now();
    hintIndex = 0;
    audio.click();
    showDialogue(game.level.dialogueStart, 8600);
    addLog(game, '实验开始。HELIX 将记录每一次时间线分叉。', 'accent');
    updateHUD(game);
    updateSidebar(game);
  }

  function startFromTitle() {
    audio.ensure();
    audio.click();
    if (completedCount() >= LEVELS.length) {
      loadLevel(LEVELS.length - 1, { showIntro: false });
      return;
    }
    loadLevel(firstIncompleteIndex(), { showIntro: true });
  }

  function populateCompleteModal(level, session, evaluation) {
    dom.completeStamp.textContent = `CHAMBER ${level.number}`;
    dom.completeKicker.textContent = session.index === LEVELS.length - 1 ? 'CORE ACCESS GRANTED' : 'EXPERIMENT COMPLETE';
    dom.completeTitle.textContent = level.completeTitle;
    dom.completeCopy.textContent = level.completeCopy;
    dom.completeGrade.textContent = evaluation.grade;
    dom.completeGradeLabel.textContent = evaluation.label;
    dom.statActions.textContent = pad3(session.stats.actions);
    dom.statForks.textContent = String(session.stats.forks).padStart(2, '0');
    dom.statResets.textContent = String(session.stats.resets).padStart(2, '0');
    dom.statTime.textContent = formatElapsed(session.stats.elapsedMs);
    dom.completeQuote.textContent = level.completeQuote;
    dom.nextChamberButton.innerHTML = session.index === LEVELS.length - 1
      ? '读取核心日志 <span class="button-arrow">↗</span>'
      : '进入下一实验舱 <span class="button-arrow">↗</span>';
  }

  function advanceFromComplete() {
    if (!game) return;
    if (game.index >= LEVELS.length - 1) {
      closeModal('complete-overlay');
      openModal('ending-overlay');
      audio.ensure();
      audio.complete();
      return;
    }
    closeModal('complete-overlay');
    loadLevel(game.index + 1, { showIntro: true });
  }

  function replayLevel() {
    if (!game) return;
    const index = game.index;
    closeModal('complete-overlay');
    loadLevel(index, { showIntro: false });
  }

  function renderChapterArchive() {
    const count = completedCount();
    dom.archiveProgress.textContent = `${pad2(count)} / ${pad2(LEVELS.length)} STABILIZED`;
    dom.chapterList.innerHTML = LEVELS.map((level, index) => {
      const unlocked = isLevelUnlocked(index);
      const completed = Boolean(save.completed[level.id]);
      const entry = save.completed[level.id];
      const classes = ['chapter-entry'];
      if (completed) classes.push('is-complete');
      if (!unlocked) classes.push('is-locked');
      return `
        <button class="${classes.join(' ')}" type="button" data-level-index="${index}" ${unlocked ? '' : 'disabled'} aria-label="${escapeHtml(completed ? `重访 ${level.title}` : unlocked ? `接入 ${level.title}` : `未解锁 ${level.title}`)}">
          <span class="chapter-number">${level.number}</span>
          <span class="chapter-copy">
            <strong>${escapeHtml(level.title)}</strong>
            <span>${escapeHtml(level.english)}</span>
          </span>
          <span class="chapter-status">${completed ? 'STABILIZED' : unlocked ? 'AVAILABLE' : 'LOCKED'}</span>
          ${completed ? `<span class="chapter-grade">${escapeHtml(entry.grade || '—')}</span>` : unlocked ? '<span class="chapter-lock">→</span>' : '<span class="chapter-lock">⊘</span>'}
        </button>
      `;
    }).join('');
  }

  function openChapterArchive() {
    renderChapterArchive();
    openModal('chapters-overlay');
    audio.click();
  }

  function chooseChapter(index) {
    if (!isLevelUnlocked(index)) {
      showToast('实验舱未解锁', '需先稳定前一个实验舱。', 'warn', 2800);
      return;
    }
    closeModal('chapters-overlay');
    loadLevel(index, { showIntro: true });
  }

  function openHelp() {
    if (openModalStack.includes('pause-overlay')) closeModal('pause-overlay');
    openModal('help-overlay');
    audio.click();
  }

  function openPause() {
    if (currentScreen !== 'game' || !game || game.completed) return;
    openModal('pause-overlay');
    audio.click();
  }

  function resumeGame() {
    closeModal('pause-overlay');
    if (game && !game.completed) game.running = true;
    audio.click();
  }

  function openConfirm(title, copy, onAccept, acceptLabel = '确认清空') {
    dom.confirmTitle.textContent = title;
    dom.confirmCopy.textContent = copy;
    dom.confirmAccept.textContent = acceptLabel;
    confirmCallback = typeof onAccept === 'function' ? onAccept : null;
    openModal('confirm-overlay');
  }

  function closeConfirm() {
    confirmCallback = null;
    closeModal('confirm-overlay');
  }

  function acceptConfirm() {
    const callback = confirmCallback;
    confirmCallback = null;
    closeModal('confirm-overlay');
    if (callback) callback();
  }

  function requestPurge() {
    if (!game) return;
    openConfirm(
      '清空本层因果缓存',
      '这会移除全部回声、已写入终端和本层统计，并将实验舱恢复到初始状态。这个操作无法撤销。',
      () => purgeSession(game),
      '确认清空'
    );
  }

  function requestQuitToTitle() {
    openConfirm(
      '返回控制室',
      '当前未固化的时间线会丢失。已固化的因果状态不会自动保存到此实验舱的通关记录中。',
      () => showTitle(),
      '返回控制室'
    );
  }

  function resetAllProgress() {
    openConfirm(
      '清除全部实验记录',
      '这将删除所有通关评价、最佳时间与最后进度。实验舱的初始谜题不会改变。',
      () => {
        save = { version: 1, completed: {}, lastLevel: 0, muted: save.muted };
        persistSave();
        updateTitleUI();
        renderChapterArchive();
        closeModal('chapters-overlay');
        showToast('实验记录已清除', '设施回到初始实验序列。', 'warn', 3000);
      },
      '清除记录'
    );
  }

  function showEnding() {
    openModal('ending-overlay');
    audio.ensure();
    audio.complete();
  }

  function closeEndingToTitle() {
    closeModal('ending-overlay');
    showTitle();
  }
  /* ==========================================================
     CANVAS / PARTICLES / TITLE ATMOSPHERE
     ========================================================== */

  const TINT_COLORS = {
    cyan: '#68edff',
    amber: '#ffbb66',
    violet: '#b890ff',
    magenta: '#ff729a'
  };

  function tintColor(tint) {
    return TINT_COLORS[tint] || TINT_COLORS.cyan;
  }

  function fitCanvas(canvas) {
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return {
      ctx,
      width: rect.width,
      height: rect.height,
      dpr
    };
  }

  const titleDust = Array.from({ length: 84 }, (_, index) => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.35 + Math.random() * 1.35,
    speed: 0.002 + Math.random() * 0.009,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.12 + Math.random() * 0.42,
    tint: index % 9 === 0 ? 'amber' : 'cyan'
  }));

  const titleGhosts = Array.from({ length: 6 }, (_, index) => ({
    angle: (index / 6) * Math.PI * 2 + 0.13,
    radius: 0.79 + Math.random() * 0.16,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.08 + Math.random() * 0.13
  }));

  function drawRingArc(ctx, cx, cy, radius, start, end, color, width = 1, alpha = 0.5) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, end);
    ctx.stroke();
    ctx.restore();
  }

  function drawTitleScene(time) {
    const fitted = fitCanvas(dom.titleCanvas);
    if (!fitted) return;
    const { ctx, width: w, height: h } = fitted;
    ctx.clearRect(0, 0, w, h);

    const base = ctx.createRadialGradient(w * 0.74, h * 0.42, 0, w * 0.74, h * 0.42, Math.max(w, h) * 0.72);
    base.addColorStop(0, 'rgba(16, 48, 58, 0.34)');
    base.addColorStop(0.34, 'rgba(6, 18, 26, 0.2)');
    base.addColorStop(0.72, 'rgba(3, 7, 12, 0.05)');
    base.addColorStop(1, 'rgba(3, 7, 12, 0)');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    const horizon = h * 0.73;
    ctx.save();
    ctx.strokeStyle = 'rgba(104, 237, 255, 0.035)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i += 1) {
      const y = horizon + (i / 12) * (h - horizon);
      ctx.beginPath();
      ctx.moveTo(w * 0.05, y);
      ctx.lineTo(w * 0.95, y);
      ctx.stroke();
    }
    for (let i = 0; i < 19; i += 1) {
      const xTop = w * (0.18 + i * 0.036);
      const xBottom = w * (0.03 + i * 0.052);
      ctx.beginPath();
      ctx.moveTo(xTop, horizon);
      ctx.lineTo(xBottom, h);
      ctx.stroke();
    }
    ctx.restore();

    const compact = w < 760;
    const cx = w * (compact ? 0.72 : 0.77);
    const cy = h * (compact ? 0.58 : 0.47);
    const radius = Math.min(w, h) * (compact ? 0.16 : 0.215);
    const slow = time * 0.00009;
    const medium = time * 0.00016;
    const fast = time * 0.00031;

    ctx.save();
    ctx.translate(cx, cy);

    const halo = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius * 2.7);
    halo.addColorStop(0, 'rgba(104, 237, 255, 0.17)');
    halo.addColorStop(0.26, 'rgba(63, 186, 202, 0.075)');
    halo.addColorStop(0.62, 'rgba(25, 77, 89, 0.025)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 2.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(slow);
    ctx.setLineDash([2, 10]);
    drawRingArc(ctx, 0, 0, radius * 1.42, 0, Math.PI * 2, '#68edff', 1, 0.16);
    ctx.restore();

    ctx.save();
    ctx.rotate(-medium);
    ctx.setLineDash([34, 18, 3, 17]);
    drawRingArc(ctx, 0, 0, radius * 1.16, 0, Math.PI * 2, '#68edff', 1.4, 0.34);
    ctx.restore();

    const tickCount = 48;
    for (let i = 0; i < tickCount; i += 1) {
      const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
      const long = i % 4 === 0;
      const inner = radius * (long ? 0.67 : 0.72);
      const outer = radius * 0.81;
      ctx.strokeStyle = long ? 'rgba(157, 245, 255, 0.52)' : 'rgba(104, 237, 255, 0.2)';
      ctx.lineWidth = long ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }

    ctx.save();
    ctx.rotate(medium);
    for (let segment = 0; segment < 6; segment += 1) {
      const start = (segment / 6) * Math.PI * 2;
      drawRingArc(ctx, 0, 0, radius * 0.61, start + 0.08, start + 0.62, segment === 2 ? '#ffbb66' : '#68edff', segment === 2 ? 1.2 : 0.8, segment === 2 ? 0.4 : 0.24);
    }
    ctx.restore();

    ctx.save();
    ctx.rotate(-fast);
    ctx.setLineDash([1, 6]);
    drawRingArc(ctx, 0, 0, radius * 0.92, 0, Math.PI * 2, '#b8f9ff', 0.8, 0.4);
    ctx.restore();

    const corePulse = 1 + Math.sin(time * 0.0017) * 0.035;
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.33 * corePulse);
    core.addColorStop(0, 'rgba(238, 255, 255, 0.96)');
    core.addColorStop(0.08, 'rgba(186, 250, 255, 0.85)');
    core.addColorStop(0.32, 'rgba(104, 237, 255, 0.38)');
    core.addColorStop(0.68, 'rgba(50, 154, 173, 0.1)');
    core.addColorStop(1, 'rgba(20, 70, 84, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.44 * corePulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(224, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(104, 237, 255, 0.16)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i += 1) {
      const y = -radius * 0.3 + i * radius * 0.3;
      ctx.beginPath();
      ctx.moveTo(-radius * 1.7, y);
      ctx.lineTo(-radius * 1.2, y);
      ctx.lineTo(-radius * 1.13, y + 4);
      ctx.stroke();
    }

    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(medium * 0.7);
    const ghostRadius = radius * 1.33;
    titleGhosts.forEach((ghost) => {
      const angle = ghost.angle + Math.sin(time * 0.00018 + ghost.phase) * 0.05;
      const x = Math.cos(angle) * ghostRadius;
      const y = Math.sin(angle) * ghostRadius * 0.82;
      ctx.globalAlpha = ghost.alpha;
      ctx.fillStyle = '#68edff';
      ctx.beginPath();
      ctx.arc(x, y - 7, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#68edff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - 3);
      ctx.lineTo(x - 3, y + 9);
      ctx.lineTo(x + 3, y + 9);
      ctx.closePath();
      ctx.stroke();
    });
    ctx.restore();

    if (!compact) {
      ctx.font = '8px "Cascadia Mono", Consolas, monospace';
      ctx.fillStyle = 'rgba(143, 190, 200, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('CAUSAL CONTAINMENT APERTURE', cx, cy + radius * 1.62);
      ctx.fillStyle = 'rgba(255, 114, 154, 0.55)';
      ctx.fillText('BREACH VECTOR / UNSTABLE', cx, cy + radius * 1.62 + 14);
    }

    const scanY = cy - radius * 1.45 + ((time * 0.035) % (radius * 2.9));
    const scanGradient = ctx.createLinearGradient(cx - radius * 1.5, scanY, cx + radius * 1.5, scanY);
    scanGradient.addColorStop(0, 'rgba(104, 237, 255, 0)');
    scanGradient.addColorStop(0.5, 'rgba(104, 237, 255, 0.13)');
    scanGradient.addColorStop(1, 'rgba(104, 237, 255, 0)');
    ctx.strokeStyle = scanGradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - radius * 1.5, scanY);
    ctx.lineTo(cx + radius * 1.5, scanY);
    ctx.stroke();

    ctx.save();
    const fractureStart = { x: cx + radius * 0.56, y: cy + radius * 0.5 };
    ctx.strokeStyle = 'rgba(255, 98, 95, 0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(fractureStart.x, fractureStart.y);
    ctx.lineTo(fractureStart.x + 18, fractureStart.y + 7);
    ctx.lineTo(fractureStart.x + 24, fractureStart.y + 22);
    ctx.lineTo(fractureStart.x + 39, fractureStart.y + 28);
    ctx.lineTo(fractureStart.x + 43, fractureStart.y + 41);
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    for (const dust of titleDust) {
      const x = (dust.x * w + Math.sin(time * 0.0002 + dust.phase) * 14 + w) % w;
      const y = ((dust.y - time * dust.speed * 0.001) % 1 + 1) % 1 * h;
      ctx.globalAlpha = dust.alpha * (0.55 + Math.sin(time * 0.0016 + dust.phase) * 0.25);
      ctx.fillStyle = tintColor(dust.tint);
      ctx.beginPath();
      ctx.arc(x, y, dust.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const verticalSweep = (time * 0.022) % (w + 300) - 150;
    const sweepGradient = ctx.createLinearGradient(verticalSweep, 0, verticalSweep + 90, 0);
    sweepGradient.addColorStop(0, 'rgba(104, 237, 255, 0)');
    sweepGradient.addColorStop(0.5, 'rgba(104, 237, 255, 0.025)');
    sweepGradient.addColorStop(1, 'rgba(104, 237, 255, 0)');
    ctx.fillStyle = sweepGradient;
    ctx.fillRect(verticalSweep, 0, 90, h);
  }

  function addParticle(session, particle) {
    if (!session) return;
    session.particles.push({
      maxLife: particle.life,
      size: 1.2,
      gravity: 0,
      drag: 0.96,
      ...particle,
      vx: particle.vx || 0,
      vy: particle.vy || 0
    });
    if (session.particles.length > 180) session.particles.splice(0, session.particles.length - 180);
  }

  function spawnMoveMotes(session, x, y) {
    if (prefersReducedMotion) return;
    for (let i = 0; i < 3; i += 1) {
      addParticle(session, {
        x: x + 0.5 + (Math.random() - 0.5) * 0.2,
        y: y + 0.62 + (Math.random() - 0.5) * 0.2,
        vx: (Math.random() - 0.5) * 0.1,
        vy: -0.02 - Math.random() * 0.09,
        life: 0.45 + Math.random() * 0.35,
        size: 0.5 + Math.random() * 0.9,
        color: '#68edff',
        alpha: 0.35,
        gravity: 0.02
      });
    }
  }

  function spawnPlateBurst(session, cell, plate) {
    if (prefersReducedMotion) return;
    const color = plate === 'R' ? '#ffbb66' : '#68edff';
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      addParticle(session, {
        x: cell.x + 0.5,
        y: cell.y + 0.5,
        vx: Math.cos(angle) * (0.08 + Math.random() * 0.14),
        vy: Math.sin(angle) * (0.08 + Math.random() * 0.14),
        life: 0.6 + Math.random() * 0.4,
        size: 0.45 + Math.random() * 1.2,
        color,
        alpha: 0.65,
        gravity: 0.04
      });
    }
  }

  function spawnDoorBurst(session, doorId, rule) {
    if (prefersReducedMotion) return;
    const cell = session.level.doorCells.find((door) => door.id === doorId);
    if (!cell) return;
    const color = tintColor(rule.tint);
    for (let i = 0; i < 18; i += 1) {
      addParticle(session, {
        x: cell.x + 0.5 + (Math.random() - 0.5) * 0.5,
        y: cell.y + 0.5 + (Math.random() - 0.5) * 0.5,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.03 - Math.random() * 0.14,
        life: 0.5 + Math.random() * 0.7,
        size: 0.4 + Math.random() * 1.3,
        color,
        alpha: 0.5,
        gravity: 0.06
      });
    }
  }

  function spawnTerminalBurst(session, terminal) {
    if (prefersReducedMotion) return;
    const color = terminal.type === 'memory' ? '#b890ff' : '#ffbb66';
    for (let i = 0; i < 18; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.2;
      addParticle(session, {
        x: terminal.x + 0.5 + Math.cos(angle) * radius,
        y: terminal.y + 0.42 + Math.sin(angle) * radius,
        vx: Math.cos(angle) * (0.05 + Math.random() * 0.16),
        vy: -0.1 - Math.random() * 0.2,
        life: 0.65 + Math.random() * 0.8,
        size: 0.4 + Math.random() * 1.4,
        color,
        alpha: 0.72,
        gravity: -0.015
      });
    }
  }

  function spawnCompletionBurst(session) {
    const exit = session.level.exit;
    for (let i = 0; i < 64; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.32;
      addParticle(session, {
        x: exit.x + 0.5,
        y: exit.y + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.9 + Math.random() * 1.4,
        size: 0.5 + Math.random() * 2,
        color: i % 4 === 0 ? '#b8f9ff' : i % 3 === 0 ? '#79f3b1' : '#68edff',
        alpha: 0.8,
        gravity: 0.015,
        drag: 0.985
      });
    }
  }

  function updateParticles(session, dt) {
    if (!session) return;
    for (let i = session.particles.length - 1; i >= 0; i -= 1) {
      const particle = session.particles[i];
      particle.life -= dt;
      if (particle.life <= 0) {
        session.particles.splice(i, 1);
        continue;
      }
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += (particle.gravity || 0) * dt;
      const drag = Math.pow(particle.drag || 0.96, dt * 60);
      particle.vx *= drag;
      particle.vy *= drag;
    }
  }

  function updateVisualPosition(actor, dt) {
    const speed = 1 - Math.pow(0.0009, dt);
    const dx = actor.x - actor.visualX;
    const dy = actor.y - actor.visualY;
    if (Math.abs(dx) + Math.abs(dy) > 2.4) {
      actor.visualX = actor.x;
      actor.visualY = actor.y;
    } else {
      actor.visualX = lerp(actor.visualX, actor.x, speed);
      actor.visualY = lerp(actor.visualY, actor.y, speed);
    }
    actor.bump = Math.max(0, actor.bump - dt * 5.5);
  }

  function updateGameAnimation(session, dt) {
    if (!session) return;
    updateVisualPosition(session.player, dt);
    session.echoes.forEach((echo) => updateVisualPosition(echo.actor, dt));
    session.level.doorCells.forEach((door) => {
      const target = session.doorStates.get(door.id) ? 1 : 0;
      const current = session.doorVisuals.get(door.id) || 0;
      session.doorVisuals.set(door.id, lerp(current, target, 1 - Math.pow(0.002, dt)));
    });
    session.shake = Math.max(0, session.shake - dt * 24);
    session.bumpFlash = Math.max(0, session.bumpFlash - dt * 4);
    updateParticles(session, dt);
  }
  /* ==========================================================
     GAME RENDERER / GEOMETRY / ENVIRONMENT
     ========================================================== */

  function hexToRgba(hex, alpha) {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
    const num = parseInt(full, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function roundedRectPath(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function computeSceneMetrics(width, height, cols, rows) {
    const padX = Math.max(18, Math.min(54, width * 0.052));
    const padTop = Math.max(25, Math.min(50, height * 0.08));
    const padBottom = Math.max(18, Math.min(38, height * 0.058));
    const tile = Math.min((width - padX * 2) / cols, (height - padTop - padBottom) / rows);
    const boardW = tile * cols;
    const boardH = tile * rows;
    return {
      x: (width - boardW) / 2,
      y: padTop + (height - padTop - padBottom - boardH) / 2,
      tile,
      width: boardW,
      height: boardH,
      cols,
      rows,
      canvasWidth: width,
      canvasHeight: height
    };
  }

  function boardCellCenter(x, y) {
    return {
      x: sceneMetrics.x + sceneMetrics.tile * (x + 0.5),
      y: sceneMetrics.y + sceneMetrics.tile * (y + 0.5)
    };
  }

  function drawOuterField(ctx, session, metrics, now) {
    const { canvasWidth: w, canvasHeight: h, x, y, width: bw, height: bh } = metrics;
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#061018');
    bg.addColorStop(0.52, '#050c13');
    bg.addColorStop(1, '#03080d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const ambient = ctx.createRadialGradient(
      x + bw * 0.54,
      y + bh * 0.35,
      0,
      x + bw * 0.54,
      y + bh * 0.35,
      Math.max(bw, bh) * 0.72
    );
    ambient.addColorStop(0, 'rgba(28, 92, 103, 0.08)');
    ambient.addColorStop(0.55, 'rgba(11, 43, 51, 0.025)');
    ambient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.strokeStyle = 'rgba(104, 237, 255, 0.027)';
    ctx.lineWidth = 1;
    const spacing = Math.max(28, Math.min(64, w * 0.047));
    for (let gx = (w % spacing) / 2; gx < w; gx += spacing) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    for (let gy = (h % spacing) / 2; gy < h; gy += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(104, 237, 255, 0.1)';
    ctx.lineWidth = 1;
    roundedRectPath(ctx, x - 7, y - 7, bw + 14, bh + 14, 2);
    ctx.stroke();

    const corner = Math.min(26, metrics.tile * 0.52);
    ctx.strokeStyle = 'rgba(104, 237, 255, 0.48)';
    ctx.lineWidth = 1.2;
    const corners = [
      [x - 10, y - 10, 1, 1],
      [x + bw + 10, y - 10, -1, 1],
      [x - 10, y + bh + 10, 1, -1],
      [x + bw + 10, y + bh + 10, -1, -1]
    ];
    corners.forEach(([cx, cy, sx, sy]) => {
      ctx.beginPath();
      ctx.moveTo(cx + sx * corner, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + sy * corner);
      ctx.stroke();
    });
    ctx.restore();

    ctx.save();
    ctx.font = monoFont(8);
    ctx.fillStyle = 'rgba(126, 162, 172, 0.42)';
    ctx.textAlign = 'left';
    ctx.fillText(`CHAMBER ${session.level.number} / ${session.level.english}`, x, Math.max(14, y - 16));
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(104, 237, 255, 0.3)';
    ctx.fillText(`CAUSAL FIELD // ${String(session.level.index + 1).padStart(2, '0')}`, x + bw, Math.max(14, y - 16));
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(99, 127, 136, 0.32)';
    ctx.fillText(`T+${pad3(session.tick)}`, x, y + bh + 20);
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 187, 102, 0.34)';
    ctx.fillText(`ECHOES ${pad2(session.echoes.length)} / ${pad2(session.level.maxEchoes)}`, x + bw, y + bh + 20);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, bw, bh);
    ctx.clip();
    const scanY = y + ((now * 0.018) % bh);
    const scan = ctx.createLinearGradient(x, scanY - 28, x, scanY + 28);
    scan.addColorStop(0, 'rgba(104, 237, 255, 0)');
    scan.addColorStop(0.5, 'rgba(104, 237, 255, 0.018)');
    scan.addColorStop(1, 'rgba(104, 237, 255, 0)');
    ctx.fillStyle = scan;
    ctx.fillRect(x, scanY - 28, bw, 56);
    ctx.restore();
  }

  function drawFloorTiles(ctx, session, metrics, now) {
    const { x, y, tile, width: bw, height: bh } = metrics;
    const level = session.level;
    const bx = x;
    const by = y;
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.clip();

    const floorBase = ctx.createLinearGradient(bx, by, bx, by + bh);
    floorBase.addColorStop(0, '#08151d');
    floorBase.addColorStop(0.55, '#07121a');
    floorBase.addColorStop(1, '#050e15');
    ctx.fillStyle = floorBase;
    ctx.fillRect(bx, by, bw, bh);

    for (let yy = 0; yy < level.height; yy += 1) {
      for (let xx = 0; xx < level.width; xx += 1) {
        if (level.walls.has(keyOf(xx, yy))) continue;
        const px = bx + xx * tile;
        const py = by + yy * tile;
        const variation = hash(xx, yy, level.index + 2);
        const base = (xx + yy) % 2 === 0 ? 12 : 10;
        const g = base + Math.floor(variation * 3);
        ctx.fillStyle = `rgb(${4 + Math.floor(variation * 2)}, ${14 + g}, ${19 + g + Math.floor(variation * 4)})`;
        ctx.fillRect(px + 0.6, py + 0.6, tile - 1.2, tile - 1.2);

        ctx.strokeStyle = 'rgba(104, 237, 255, 0.047)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 1, py + 1, tile - 2, tile - 2);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.012)';
        ctx.fillRect(px + tile * 0.12, py + tile * 0.12, tile * 0.76, tile * 0.03);

        if (variation > 0.81) {
          ctx.strokeStyle = 'rgba(126, 204, 218, 0.04)';
          ctx.beginPath();
          ctx.moveTo(px + tile * 0.23, py + tile * 0.3);
          ctx.lineTo(px + tile * 0.23, py + tile * 0.64);
          ctx.lineTo(px + tile * 0.36, py + tile * 0.64);
          ctx.stroke();
        }

        if (variation < 0.035) {
          ctx.fillStyle = 'rgba(104, 237, 255, 0.11)';
          ctx.font = monoFont(6);
          ctx.textAlign = 'left';
          ctx.fillText(`CN-${pad2(xx)}${pad2(yy)}`, px + 5, py + tile - 5);
        }
      }
    }

    for (let yy = 0; yy <= level.height; yy += 1) {
      ctx.strokeStyle = yy % 3 === 0 ? 'rgba(104, 237, 255, 0.08)' : 'rgba(104, 237, 255, 0.03)';
      ctx.lineWidth = yy % 3 === 0 ? 1 : 0.6;
      ctx.beginPath();
      ctx.moveTo(bx, by + yy * tile);
      ctx.lineTo(bx + bw, by + yy * tile);
      ctx.stroke();
    }
    for (let xx = 0; xx <= level.width; xx += 1) {
      ctx.strokeStyle = xx % 3 === 0 ? 'rgba(104, 237, 255, 0.08)' : 'rgba(104, 237, 255, 0.03)';
      ctx.lineWidth = xx % 3 === 0 ? 1 : 0.6;
      ctx.beginPath();
      ctx.moveTo(bx + xx * tile, by);
      ctx.lineTo(bx + xx * tile, by + bh);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#68edff';
    ctx.lineWidth = 1;
    const sweepX = bx + ((now * 0.02) % bw);
    ctx.beginPath();
    ctx.moveTo(sweepX, by);
    ctx.lineTo(sweepX, by + bh);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawFloorAtmosphere(ctx, session, metrics, now) {
    const { x, y, width, height, tile } = metrics;
    const level = session.level;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.save();
    ctx.globalAlpha = 0.032;
    ctx.fillStyle = '#b8f9ff';
    ctx.font = `200 ${Math.round(tile * 6.2)}px "Bahnschrift", "Microsoft YaHei UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(level.number, x + width * 0.52, y + height * 0.55);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const drift = Math.sin(now * 0.00011) * width * 0.08;
    const beam = ctx.createLinearGradient(x + width * 0.12 + drift, y, x + width * 0.58 + drift, y + height);
    beam.addColorStop(0, 'rgba(104, 237, 255, 0.028)');
    beam.addColorStop(0.4, 'rgba(104, 237, 255, 0.008)');
    beam.addColorStop(1, 'rgba(104, 237, 255, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.19 + drift, y);
    ctx.lineTo(x + width * 0.37 + drift, y);
    ctx.lineTo(x + width * 0.66, y + height);
    ctx.lineTo(x + width * 0.38, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (session.level.plateCells.has('R')) {
      const cells = session.level.plateCells.get('R');
      const cx = cells.reduce((sum, c) => sum + c.x, 0) / cells.length;
      const cy = cells.reduce((sum, c) => sum + c.y, 0) / cells.length;
      const center = boardCellCenter(cx, cy);
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 187, 102, 0.075)';
      ctx.setLineDash([4, 10]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center.x, center.y, tile * 1.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center.x, center.y, tile * 2.18, 0.3, Math.PI * 1.25);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    session.level.doorCells.forEach((door) => {
      const center = boardCellCenter(door.x, door.y);
      const color = tintColor(door.tint);
      const open = session.doorStates.get(door.id);
      const radius = tile * 1.15;
      const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
      glow.addColorStop(0, hexToRgba(color, open ? 0.14 : 0.055));
      glow.addColorStop(0.5, hexToRgba(color, open ? 0.04 : 0.018));
      glow.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    session.level.terminalCells.forEach((terminal) => {
      const center = boardCellCenter(terminal.x, terminal.y);
      const active = activeTerminals(session).has(terminal.id);
      const color = terminal.type === 'memory' ? '#b890ff' : '#ffbb66';
      const radius = tile * (active ? 1.35 : 0.9);
      const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
      glow.addColorStop(0, hexToRgba(color, active ? 0.18 : 0.055));
      glow.addColorStop(0.55, hexToRgba(color, active ? 0.05 : 0.015));
      glow.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    session.level.plateCells.forEach((cells, plate) => {
      const active = (session.plateCounts[plate] || 0) > 0;
      const color = plate === 'R' ? '#ffbb66' : '#68edff';
      cells.forEach((cell) => {
        const center = boardCellCenter(cell.x, cell.y);
        const radius = tile * 0.92;
        const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
        glow.addColorStop(0, hexToRgba(color, active ? 0.15 : 0.035));
        glow.addColorStop(0.55, hexToRgba(color, active ? 0.035 : 0.008));
        glow.addColorStop(1, hexToRgba(color, 0));
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    const exit = session.level.exit;
    const exitCenter = boardCellCenter(exit.x, exit.y);
    const ready = allGoalConditionsMet(session);
    const exitColor = ready ? '#79f3b1' : '#ff729a';
    const exitGlow = ctx.createRadialGradient(exitCenter.x, exitCenter.y, 0, exitCenter.x, exitCenter.y, tile * 1.55);
    exitGlow.addColorStop(0, hexToRgba(exitColor, ready ? 0.16 : 0.055));
    exitGlow.addColorStop(0.5, hexToRgba(exitColor, ready ? 0.04 : 0.015));
    exitGlow.addColorStop(1, hexToRgba(exitColor, 0));
    ctx.fillStyle = exitGlow;
    ctx.beginPath();
    ctx.arc(exitCenter.x, exitCenter.y, tile * 1.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 187, 102, 0.075)';
    ctx.lineWidth = 1;
    session.level.doorCells.forEach((door) => {
      const px = x + door.x * tile;
      const py = y + door.y * tile;
      for (let i = 0; i < 4; i += 1) {
        const offset = tile * (0.16 + i * 0.15);
        ctx.beginPath();
        ctx.moveTo(px + offset, py + tile * 0.9);
        ctx.lineTo(px + offset + tile * 0.06, py + tile * 0.82);
        ctx.lineTo(px + offset + tile * 0.12, py + tile * 0.9);
        ctx.stroke();
      }
    });
    ctx.restore();
    ctx.restore();
  }

  function drawWalls(ctx, session, metrics, now) {
    const { x: bx, y: by, tile } = metrics;
    const level = session.level;
    const depth = tile * 0.19;
    const wallCells = [];
    level.walls.forEach((k) => {
      const [xs, ys] = k.split(',');
      wallCells.push({ x: Number(xs), y: Number(ys) });
    });

    wallCells.forEach(({ x, y }) => {
      const px = bx + x * tile;
      const py = by + y * tile;
      const southOpen = !level.walls.has(keyOf(x, y + 1));
      const eastOpen = !level.walls.has(keyOf(x + 1, y));
      if (southOpen) {
        const shadow = ctx.createLinearGradient(0, py + tile * 0.78, 0, py + tile + depth);
        shadow.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
        shadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadow;
        ctx.fillRect(px + 2, py + tile * 0.72, tile - 2, depth + 8);
      }
      if (eastOpen) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.27)';
        ctx.fillRect(px + tile * 0.82, py + depth, tile * 0.18, tile - depth);
      }
    });

    wallCells.forEach(({ x, y }) => {
      const px = bx + x * tile;
      const py = by + y * tile;
      const northOpen = !level.walls.has(keyOf(x, y - 1));
      const southOpen = !level.walls.has(keyOf(x, y + 1));
      const westOpen = !level.walls.has(keyOf(x - 1, y));
      const eastOpen = !level.walls.has(keyOf(x + 1, y));
      const variation = hash(x, y, level.index + 8);
      const topY = py - depth * 0.32;

      ctx.fillStyle = '#07131b';
      roundedRectPath(ctx, px + 1.2, py + depth * 0.14, tile - 2.4, tile - 2, Math.max(1, tile * 0.025));
      ctx.fill();

      const cap = ctx.createLinearGradient(px, topY, px, py + tile - 1);
      cap.addColorStop(0, `rgb(${28 + Math.floor(variation * 6)}, ${48 + Math.floor(variation * 8)}, ${58 + Math.floor(variation * 7)})`);
      cap.addColorStop(0.2, '#1b303d');
      cap.addColorStop(0.7, '#12232d');
      cap.addColorStop(1, '#0b1821');
      ctx.fillStyle = cap;
      roundedRectPath(ctx, px + 1.2, topY, tile - 2.4, tile - 1.2, Math.max(1, tile * 0.025));
      ctx.fill();
      ctx.strokeStyle = 'rgba(104, 237, 255, 0.21)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = 'rgba(4, 12, 17, 0.42)';
      roundedRectPath(ctx, px + tile * 0.11, topY + tile * 0.14, tile * 0.78, tile * 0.56, Math.max(1, tile * 0.018));
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(px + tile * 0.15, topY + tile * 0.18, tile * 0.7, tile * 0.04);

      if (variation > 0.38) {
        ctx.strokeStyle = `rgba(172, 218, 226, ${0.035 + variation * 0.035})`;
        for (let line = 0; line < 2; line += 1) {
          const ly = topY + tile * (0.27 + line * 0.22);
          ctx.beginPath();
          ctx.moveTo(px + tile * (0.16 + variation * 0.06), ly);
          ctx.lineTo(px + tile * (0.84 - variation * 0.04), ly);
          ctx.stroke();
        }
      }

      if (variation > 0.68) {
        ctx.fillStyle = 'rgba(2, 8, 12, 0.58)';
        for (let i = 0; i < 3; i += 1) {
          ctx.fillRect(px + tile * 0.23, topY + tile * (0.38 + i * 0.08), tile * 0.37, tile * 0.026);
        }
        ctx.fillStyle = 'rgba(255, 187, 102, 0.45)';
        ctx.fillRect(px + tile * 0.67, topY + tile * 0.42, tile * 0.026, tile * 0.16);
      } else if (variation > 0.45) {
        ctx.fillStyle = 'rgba(104, 237, 255, 0.22)';
        ctx.beginPath();
        ctx.arc(px + tile * 0.72, topY + tile * 0.47, Math.max(0.8, tile * 0.012), 0, Math.PI * 2);
        ctx.fill();
      }

      if (northOpen) {
        ctx.strokeStyle = 'rgba(149, 246, 255, 0.5)';
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(px + 1.5, topY + 0.7);
        ctx.lineTo(px + tile - 1.5, topY + 0.7);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(104, 237, 255, 0.08)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(px + 4, topY + 3);
        ctx.lineTo(px + tile - 4, topY + 3);
        ctx.stroke();
      }
      if (southOpen) {
        ctx.strokeStyle = 'rgba(104, 237, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + 2, py + tile - 1.4);
        ctx.lineTo(px + tile - 2, py + tile - 1.4);
        ctx.stroke();
      }
      if (westOpen) {
        ctx.strokeStyle = 'rgba(104, 237, 255, 0.26)';
        ctx.beginPath();
        ctx.moveTo(px + 1.5, topY + 3);
        ctx.lineTo(px + 1.5, py + tile - 3);
        ctx.stroke();
      }
      if (eastOpen) {
        ctx.strokeStyle = 'rgba(104, 237, 255, 0.14)';
        ctx.beginPath();
        ctx.moveTo(px + tile - 1.5, topY + 3);
        ctx.lineTo(px + tile - 1.5, py + tile - 3);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(171, 229, 236, 0.18)';
      const bolt = Math.max(0.7, tile * 0.009);
      [[0.09, 0.12], [0.91, 0.12], [0.09, 0.63], [0.91, 0.63]].forEach(([ax, ay]) => {
        ctx.beginPath();
        ctx.arc(px + tile * ax, topY + tile * ay, bolt, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  function drawControlTethers(ctx, session, metrics) {
    const { x: bx, y: by, tile } = metrics;
    ctx.save();
    session.level.doorsByChar.forEach((rule, doorId) => {
      const door = session.level.doorCells.find((cell) => cell.id === doorId);
      if (!door) return;
      const color = tintColor(rule.tint);
      const doorCenter = boardCellCenter(door.x, door.y);
      const targets = [];
      if (rule.plates) {
        Object.keys(rule.plates).forEach((plate) => {
          (session.level.plateCells.get(plate) || []).forEach((cell) => targets.push(cell));
        });
      }
      if (rule.terminals) {
        session.level.terminalCells.forEach((terminal) => {
          if (rule.terminals.includes(terminal.id)) targets.push(terminal);
        });
      }
      ctx.strokeStyle = hexToRgba(color, 0.105);
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 7]);
      targets.forEach((target) => {
        const targetCenter = boardCellCenter(target.x, target.y);
        ctx.beginPath();
        ctx.moveTo(targetCenter.x, targetCenter.y);
        if (door.y === target.y) {
          ctx.lineTo(doorCenter.x, doorCenter.y);
        } else {
          const midX = (targetCenter.x + doorCenter.x) / 2;
          ctx.lineTo(midX, targetCenter.y);
          ctx.lineTo(midX, doorCenter.y);
          ctx.lineTo(doorCenter.x, doorCenter.y);
        }
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  function drawTrails(ctx, session, metrics) {
    const tile = metrics.tile;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (session.trail.length > 1) {
      ctx.strokeStyle = 'rgba(104, 237, 255, 0.11)';
      ctx.lineWidth = Math.max(1, tile * 0.026);
      ctx.setLineDash([1, tile * 0.16]);
      ctx.beginPath();
      session.trail.forEach((cell, index) => {
        const c = boardCellCenter(cell.x, cell.y);
        if (index === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.stroke();
    }

    session.echoes.forEach((echo) => {
      if (echo.pathSnapshot.length > 1) {
        ctx.strokeStyle = hexToRgba(echo.color, 0.045);
        ctx.lineWidth = Math.max(0.75, tile * 0.016);
        ctx.setLineDash([1, tile * 0.22]);
        ctx.beginPath();
        echo.pathSnapshot.forEach((cell, index) => {
          const c = boardCellCenter(cell.x, cell.y);
          if (index === 0) ctx.moveTo(c.x, c.y);
          else ctx.lineTo(c.x, c.y);
        });
        ctx.stroke();
      }
      if (echo.trail.length > 1) {
        ctx.strokeStyle = hexToRgba(echo.color, 0.2);
        ctx.lineWidth = Math.max(0.8, tile * 0.021);
        ctx.setLineDash([tile * 0.02, tile * 0.14]);
        ctx.beginPath();
        echo.trail.forEach((cell, index) => {
          const c = boardCellCenter(cell.x, cell.y);
          if (index === 0) ctx.moveTo(c.x, c.y);
          else ctx.lineTo(c.x, c.y);
        });
        ctx.stroke();
      }
    });
    ctx.restore();
  }
  /* ==========================================================
     GAME RENDERER / ELEMENTS AND ACTORS
     ========================================================== */

  function monoFont(size) {
    return `${size}px "Cascadia Mono", "SFMono-Regular", Consolas, monospace`;
  }

  function drawDoors(ctx, session, metrics, now) {
    const tile = metrics.tile;
    session.level.doorCells.forEach((door) => {
      const center = boardCellCenter(door.x, door.y);
      const progress = clamp(session.doorVisuals.get(door.id) || 0, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const color = tintColor(door.tint);
      const px = center.x - tile / 2;
      const py = center.y - tile / 2;
      const pad = tile * 0.13;
      const innerW = tile - pad * 2;
      const innerH = tile - pad * 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(px + 1, py + 1, tile - 2, tile - 2);
      ctx.clip();

      const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, tile * 0.72);
      glow.addColorStop(0, hexToRgba(color, 0.1 + eased * 0.12));
      glow.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(px, py, tile, tile);

      ctx.strokeStyle = 'rgba(7, 15, 20, 0.9)';
      ctx.lineWidth = 3;
      roundedRectPath(ctx, px + pad - 2, py + pad - 2, innerW + 4, innerH + 4, tile * 0.035);
      ctx.stroke();
      ctx.strokeStyle = hexToRgba(color, 0.44);
      ctx.lineWidth = 1;
      roundedRectPath(ctx, px + pad - 1.5, py + pad - 1.5, innerW + 3, innerH + 3, tile * 0.035);
      ctx.stroke();

      const opening = eased * innerH * 0.53;
      const halfH = innerH / 2;
      const drawPanel = (panelY, panelH, flip) => {
        const gradient = ctx.createLinearGradient(px, panelY, px, panelY + panelH);
        gradient.addColorStop(0, 'rgba(18, 36, 46, 0.98)');
        gradient.addColorStop(0.55, 'rgba(8, 19, 26, 0.98)');
        gradient.addColorStop(1, 'rgba(20, 39, 48, 0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(px + pad, panelY, innerW, panelH);
        ctx.strokeStyle = hexToRgba(color, 0.4);
        ctx.lineWidth = 1;
        ctx.strokeRect(px + pad + 0.5, panelY + 0.5, innerW - 1, panelH - 1);
        ctx.strokeStyle = hexToRgba(color, 0.2);
        for (let line = 1; line <= 3; line += 1) {
          const ly = panelY + (panelH * line) / 4;
          ctx.beginPath();
          ctx.moveTo(px + pad + innerW * 0.12, ly);
          ctx.lineTo(px + pad + innerW * 0.88, ly);
          ctx.stroke();
        }
        if (panelH > tile * 0.12) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(px + pad, panelY, innerW, panelH);
          ctx.clip();
          ctx.strokeStyle = hexToRgba(color, flip ? 0.16 : 0.11);
          ctx.lineWidth = Math.max(3, tile * 0.08);
          for (let stripe = -1; stripe < 5; stripe += 1) {
            const sx = px + pad + stripe * tile * 0.22;
            ctx.beginPath();
            ctx.moveTo(sx, panelY + panelH);
            ctx.lineTo(sx + panelH, panelY);
            ctx.stroke();
          }
          ctx.restore();
        }
      };

      if (progress < 0.995) {
        drawPanel(py + pad - opening, halfH, false);
        drawPanel(center.y + opening, halfH, true);
      }

      if (progress > 0.05) {
        ctx.strokeStyle = hexToRgba(color, 0.12 + progress * 0.45);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px + pad, center.y);
        ctx.lineTo(px + tile - pad, center.y);
        ctx.stroke();
        ctx.fillStyle = hexToRgba(color, 0.15 * progress);
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, innerW * 0.42, innerH * 0.09, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const statusColor = progress > 0.88 ? color : 'rgba(142, 164, 171, 0.75)';
      ctx.fillStyle = statusColor;
      ctx.font = monoFont(Math.max(6, tile * 0.115));
      ctx.textAlign = 'center';
      ctx.fillText(door.id.toUpperCase(), center.x, py + pad + tile * 0.02);

      if (door.rule.latch) {
        ctx.strokeStyle = session.latchedDoors.has(door.id) ? '#79f3b1' : hexToRgba(color, 0.55);
        ctx.lineWidth = 1;
        const iconX = px + tile - pad - 3;
        const iconY = center.y;
        ctx.strokeRect(iconX - 3, iconY - 2, 6, 5);
        ctx.beginPath();
        ctx.arc(iconX, iconY - 2, 2.2, Math.PI, 0);
        ctx.stroke();
      }

      const pulse = 0.5 + Math.sin(now * 0.004 + door.x) * 0.5;
      ctx.fillStyle = hexToRgba(color, progress > 0.88 ? 0.45 + pulse * 0.35 : 0.24);
      ctx.beginPath();
      ctx.arc(center.x, py + tile - pad, Math.max(1, tile * 0.014), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawPlates(ctx, session, metrics, now) {
    const tile = metrics.tile;
    session.level.plateCells.forEach((cells, plate) => {
      const count = session.plateCounts[plate] || 0;
      const need = plate === 'R' ? 2 : 1;
      const active = count >= need;
      const color = plate === 'R' ? '#ffbb66' : '#68edff';
      cells.forEach((cell) => {
        const c = boardCellCenter(cell.x, cell.y);
        const radius = tile * 0.32;
        ctx.save();
        ctx.translate(c.x, c.y);

        if (active) {
          const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2);
          aura.addColorStop(0, hexToRgba(color, 0.2));
          aura.addColorStop(0.55, hexToRgba(color, 0.055));
          aura.addColorStop(1, hexToRgba(color, 0));
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(0, 0, radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = active ? hexToRgba(color, 0.1) : 'rgba(7, 18, 24, 0.88)';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = active ? hexToRgba(color, 0.9) : 'rgba(104, 237, 255, 0.24)';
        ctx.lineWidth = active ? 1.6 : 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = active ? hexToRgba(color, 0.5) : 'rgba(104, 237, 255, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.rotate((active ? now * 0.0004 : -now * 0.00012) + cell.x * 0.37);
        ctx.setLineDash([radius * 0.18, radius * 0.16]);
        ctx.strokeStyle = active ? hexToRgba(color, 0.42) : 'rgba(255, 187, 102, 0.17)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = active ? color : 'rgba(183, 217, 223, 0.66)';
        ctx.font = `600 ${Math.max(9, tile * 0.205)}px "Bahnschrift", "Microsoft YaHei UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plate, 0, -1);

        if (plate === 'R') {
          for (let i = 0; i < 2; i += 1) {
            const angle = -Math.PI / 2 + i * Math.PI;
            const dotX = Math.cos(angle) * radius * 1.18;
            const dotY = Math.sin(angle) * radius * 1.18;
            ctx.fillStyle = i < count ? color : 'rgba(255, 187, 102, 0.17)';
            ctx.beginPath();
            ctx.arc(dotX, dotY, Math.max(1.4, tile * 0.03), 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      });
    });
  }
  function drawTerminals(ctx, session, metrics, now) {
    const tile = metrics.tile;
    session.level.terminalCells.forEach((terminal) => {
      const active = activeTerminals(session).has(terminal.id);
      const memory = terminal.type === 'memory';
      const color = memory ? '#b890ff' : '#ffbb66';
      const c = boardCellCenter(terminal.x, terminal.y);
      const w = tile * 0.58;
      const h = tile * 0.52;

      ctx.save();
      ctx.translate(c.x, c.y);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, tile * 0.64);
      glow.addColorStop(0, hexToRgba(color, active ? 0.23 : 0.075));
      glow.addColorStop(0.55, hexToRgba(color, active ? 0.045 : 0.018));
      glow.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, tile * 0.64, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(3, 10, 15, 0.52)';
      ctx.beginPath();
      ctx.ellipse(0, tile * 0.23, w * 0.7, tile * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      const base = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      base.addColorStop(0, 'rgba(30, 49, 58, 0.98)');
      base.addColorStop(1, 'rgba(8, 18, 24, 0.98)');
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.moveTo(-w * 0.46, h * 0.2);
      ctx.lineTo(-w * 0.35, -h * 0.28);
      ctx.lineTo(w * 0.35, -h * 0.28);
      ctx.lineTo(w * 0.46, h * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = active ? hexToRgba(color, 0.7) : 'rgba(139, 178, 187, 0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = active ? hexToRgba(color, 0.22) : hexToRgba(color, 0.055);
      ctx.strokeStyle = active ? hexToRgba(color, 0.9) : hexToRgba(color, 0.42);
      roundedRectPath(ctx, -w * 0.26, -h * 0.2, w * 0.52, h * 0.3, tile * 0.025);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? color : hexToRgba(color, 0.78);
      ctx.font = `600 ${Math.max(8, tile * 0.17)}px "Bahnschrift", "Microsoft YaHei UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(terminal.id, 0, -h * 0.045);

      if (memory) {
        ctx.strokeStyle = active ? hexToRgba(color, 0.64) : 'rgba(184, 144, 255, 0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-tile * 0.055, -h * 0.4, tile * 0.055, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tile * 0.045, -h * 0.4, tile * 0.055, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = active ? hexToRgba(color, 0.55) : 'rgba(255, 187, 102, 0.2)';
        ctx.beginPath();
        ctx.arc(0, -h * 0.42, tile * 0.075, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (active) {
        const pulse = 0.5 + Math.sin(now * 0.004) * 0.5;
        ctx.strokeStyle = hexToRgba(color, 0.18 + pulse * 0.22);
        ctx.beginPath();
        ctx.arc(0, 0, tile * (0.29 + pulse * 0.018), 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = hexToRgba(color, 0.12 + pulse * 0.08);
        ctx.fillRect(-w * 0.19, -tile * 0.39, w * 0.38, 1);
      }

      // Floating causal-signature hologram.
      const holoY = -tile * (active ? 0.52 : 0.47);
      const holoPulse = 0.5 + Math.sin(now * 0.0034 + terminal.x * 0.8) * 0.5;
      const beamGradient = ctx.createLinearGradient(0, holoY, 0, -h * 0.05);
      beamGradient.addColorStop(0, hexToRgba(color, active ? 0.16 : 0.08));
      beamGradient.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = beamGradient;
      ctx.beginPath();
      ctx.moveTo(-tile * 0.12, -h * 0.15);
      ctx.lineTo(tile * 0.12, -h * 0.15);
      ctx.lineTo(tile * 0.035, holoY + tile * 0.05);
      ctx.lineTo(-tile * 0.035, holoY + tile * 0.05);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(0, holoY);
      ctx.rotate(Math.sin(now * 0.0009) * 0.06);
      ctx.strokeStyle = hexToRgba(color, active ? 0.8 : 0.48);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(0, -tile * 0.09);
      ctx.lineTo(tile * 0.095, 0);
      ctx.lineTo(0, tile * 0.09);
      ctx.lineTo(-tile * 0.095, 0);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = hexToRgba(color, active ? 0.16 : 0.06);
      ctx.fill();
      ctx.rotate(-Math.sin(now * 0.0009) * 0.12);
      ctx.strokeStyle = hexToRgba(color, 0.2 + holoPulse * 0.18);
      ctx.beginPath();
      ctx.arc(0, 0, tile * 0.14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = active ? color : hexToRgba(color, 0.9);
      ctx.font = `600 ${Math.max(7, tile * 0.115)}px "Bahnschrift", "Microsoft YaHei UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(terminal.id, 0, 0.5);
      ctx.restore();

      if (session.player.x === terminal.x && session.player.y === terminal.y && !active) {
        ctx.fillStyle = 'rgba(5, 14, 20, 0.88)';
        roundedRectPath(ctx, -tile * 0.12, -tile * 0.46, tile * 0.24, tile * 0.16, 3);
        ctx.fill();
        ctx.strokeStyle = hexToRgba(color, 0.5);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.font = monoFont(Math.max(6, tile * 0.1));
        ctx.fillText('E', 0, -tile * 0.378);
      }
      ctx.restore();
    });
  }

  function drawExit(ctx, session, metrics, now) {
    const tile = metrics.tile;
    const exit = session.level.exit;
    const c = boardCellCenter(exit.x, exit.y);
    const ready = allGoalConditionsMet(session);
    const complete = session.completed;
    const color = complete ? '#b8f9ff' : ready ? '#79f3b1' : '#ff729a';
    const radius = tile * 0.345;

    ctx.save();
    ctx.translate(c.x, c.y);

    const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.3);
    aura.addColorStop(0, hexToRgba(color, ready ? 0.22 : 0.08));
    aura.addColorStop(0.55, hexToRgba(color, 0.045));
    aura.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(color, 0.8);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.rotate(now * (ready ? 0.00055 : 0.00015));
    ctx.setLineDash([radius * 0.22, radius * 0.14]);
    ctx.strokeStyle = hexToRgba(color, ready ? 0.65 : 0.26);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = ready ? hexToRgba(color, 0.16) : 'rgba(8, 18, 23, 0.76)';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.57, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(color, 0.35);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = `600 ${Math.max(7, tile * 0.13)}px "Bahnschrift", "Microsoft YaHei UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', 0, 0.5);

    ctx.fillStyle = 'rgba(200, 234, 238, 0.5)';
    ctx.font = monoFont(Math.max(6, tile * 0.085));
    ctx.fillText(ready ? 'STABLE' : 'LOCKED', 0, radius * 1.35);

    if (complete) {
      ctx.strokeStyle = 'rgba(184, 249, 255, 0.7)';
      for (let i = 0; i < 3; i += 1) {
        const r = radius * (1.4 + i * 0.35) + Math.sin(now * 0.003 + i) * 2;
        ctx.globalAlpha = 0.35 - i * 0.08;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function getActorOffsets(session, metrics) {
    const groups = new Map();
    const all = [
      { kind: 'player', actor: session.player, color: '#b8f9ff', index: -1 },
      ...session.echoes.map((echo, index) => ({ kind: 'echo', actor: echo.actor, color: echo.color, index }))
    ];
    all.forEach((entry) => {
      const k = keyOf(entry.actor.x, entry.actor.y);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(entry);
    });
    const offsets = new Map();
    groups.forEach((entries) => {
      const playerEntry = entries.find((entry) => entry.kind === 'player');
      const echoEntries = entries.filter((entry) => entry.kind === 'echo');
      if (!echoEntries.length) {
        if (playerEntry) offsets.set(playerEntry.actor, { x: 0, y: 0 });
        return;
      }
      if (playerEntry) offsets.set(playerEntry.actor, { x: 0, y: 0 });
      const radius = metrics.tile * (echoEntries.length === 1 ? 0.17 : 0.42);
      const startAngle = echoEntries.length === 2 ? Math.PI * 0.25 : -Math.PI / 2;
      echoEntries.forEach((entry, index) => {
        const angle = startAngle + (index / echoEntries.length) * Math.PI * 2;
        offsets.set(entry.actor, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius * 0.72
        });
      });
    });
    return offsets;
  }
  function drawOperative(ctx, actor, x, y, tile, options) {
    const {
      color,
      isEcho,
      now,
      face,
      label,
      index = 0,
      alpha = 1
    } = options;
    const scale = tile * 0.74;
    const bob = isEcho ? Math.sin(now * 0.0023 + index * 2.1) * 1.2 : Math.sin(now * 0.004 + index) * 0.55;
    const facing = DIRS[face] || DIRS.right;
    const facingAngle = Math.atan2(facing.dy, facing.dx);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y + bob);

    if (!isEcho) {
      const floorGlow = ctx.createRadialGradient(0, scale * 0.22, 0, 0, scale * 0.22, scale * 0.58);
      floorGlow.addColorStop(0, 'rgba(104, 237, 255, 0.13)');
      floorGlow.addColorStop(0.52, 'rgba(104, 237, 255, 0.035)');
      floorGlow.addColorStop(1, 'rgba(104, 237, 255, 0)');
      ctx.fillStyle = floorGlow;
      ctx.beginPath();
      ctx.ellipse(0, scale * 0.22, scale * 0.58, scale * 0.31, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
    ctx.beginPath();
    ctx.ellipse(0, scale * 0.36, scale * 0.29, scale * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    if (isEcho) {
      const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 0.62);
      aura.addColorStop(0, hexToRgba(color, 0.19));
      aura.addColorStop(0.55, hexToRgba(color, 0.05));
      aura.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.62, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = alpha * 0.16;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(-3, 1, scale * 0.3, scale * 0.36, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alpha;
    }

    const bodyW = scale * 0.34;
    const bodyH = scale * 0.34;
    const bodyGradient = ctx.createLinearGradient(0, -scale * 0.2, 0, scale * 0.25);
    if (isEcho) {
      bodyGradient.addColorStop(0, hexToRgba(color, 0.06));
      bodyGradient.addColorStop(1, hexToRgba(color, 0.18));
    } else {
      bodyGradient.addColorStop(0, '#d3e7e9');
      bodyGradient.addColorStop(0.38, '#597b83');
      bodyGradient.addColorStop(1, '#10232c');
    }

    ctx.fillStyle = 'rgba(3, 10, 14, 0.8)';
    ctx.beginPath();
    ctx.ellipse(-scale * 0.2, scale * 0.2, scale * 0.1, scale * 0.07, -0.15, 0, Math.PI * 2);
    ctx.ellipse(scale * 0.2, scale * 0.2, scale * 0.1, scale * 0.07, 0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bodyGradient;
    ctx.strokeStyle = isEcho ? hexToRgba(color, 0.72) : 'rgba(168, 234, 238, 0.56)';
    ctx.lineWidth = isEcho ? 1 : 1.2;
    roundedRectPath(ctx, -bodyW / 2, -scale * 0.18, bodyW, bodyH, scale * 0.09);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isEcho ? hexToRgba(color, 0.42) : '#89c8d1';
    roundedRectPath(ctx, -bodyW * 0.32, -scale * 0.03, bodyW * 0.64, scale * 0.05, scale * 0.02);
    ctx.fill();

    const headY = -scale * 0.315;
    const headR = scale * 0.155;
    ctx.beginPath();
    ctx.arc(0, headY, headR, 0, Math.PI * 2);
    ctx.fillStyle = isEcho ? hexToRgba(color, 0.15) : '#d9e9ea';
    ctx.fill();
    ctx.strokeStyle = isEcho ? hexToRgba(color, 0.9) : 'rgba(190, 247, 250, 0.88)';
    ctx.lineWidth = isEcho ? 1 : 1.1;
    ctx.stroke();

    const visorX = Math.cos(facingAngle) * headR * 0.58;
    const visorY = headY + Math.sin(facingAngle) * headR * 0.45;
    ctx.fillStyle = isEcho ? color : '#68edff';
    ctx.beginPath();
    ctx.ellipse(visorX, visorY, headR * 0.46, headR * 0.23, facingAngle, 0, Math.PI * 2);
    ctx.fill();
    if (!isEcho) {
      ctx.shadowColor = '#68edff';
      ctx.shadowBlur = scale * 0.18;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = isEcho ? hexToRgba(color, 0.56) : 'rgba(176, 237, 241, 0.35)';
    ctx.lineWidth = 1;
    const packX = -Math.cos(facingAngle) * scale * 0.19;
    const packY = scale * 0.03 - Math.sin(facingAngle) * scale * 0.11;
    ctx.beginPath();
    ctx.arc(packX, packY, scale * 0.085, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(packX, packY, scale * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = isEcho ? hexToRgba(color, 0.7) : '#68edff';
    ctx.fill();

    ctx.strokeStyle = isEcho ? hexToRgba(color, 0.42) : 'rgba(104, 237, 255, 0.55)';
    ctx.beginPath();
    ctx.moveTo(0, scale * 0.16);
    ctx.lineTo(facing.dx * scale * 0.28, scale * 0.16 + facing.dy * scale * 0.2);
    ctx.stroke();

    if (isEcho) {
      ctx.globalAlpha = alpha * 0.22;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (let glitch = 0; glitch < 3; glitch += 1) {
        const gy = -scale * 0.26 + glitch * scale * 0.16 + Math.sin(now * 0.015 + glitch) * 2;
        ctx.beginPath();
        ctx.moveTo(-scale * 0.28, gy);
        ctx.lineTo(scale * (0.12 + glitch * 0.06), gy);
        ctx.stroke();
      }
      ctx.globalAlpha = alpha;
    }

    if (label) {
      ctx.font = monoFont(Math.max(5, tile * 0.085));
      ctx.textAlign = 'center';
      const labelY = -scale * 0.68;
      const width = ctx.measureText(label).width + 8;
      ctx.fillStyle = 'rgba(3, 10, 14, 0.74)';
      roundedRectPath(ctx, -width / 2, labelY - 7, width, 10, 2);
      ctx.fill();
      ctx.fillStyle = isEcho ? color : 'rgba(184, 249, 255, 0.92)';
      ctx.fillText(label, 0, labelY);
    }

    ctx.restore();
  }

  function drawActors(ctx, session, metrics, now) {
    const offsets = getActorOffsets(session, metrics);
    const entries = [
      ...session.echoes.map((echo, index) => ({
        kind: 'echo',
        echo,
        actor: echo.actor,
        color: echo.color,
        index,
        label: echo.id
      })),
      {
        kind: 'player',
        actor: session.player,
        color: '#b8f9ff',
        index: 0,
        label: 'K-07'
      }
    ];

    entries.forEach((entry) => {
      const offset = offsets.get(entry.actor) || { x: 0, y: 0 };
      if (entry.kind === 'echo' && Math.hypot(offset.x, offset.y) > 3) {
        const cell = boardCellCenter(entry.actor.x, entry.actor.y);
        ctx.save();
        ctx.strokeStyle = hexToRgba(entry.color, 0.26);
        ctx.lineWidth = 0.75;
        ctx.setLineDash([1, 4]);
        ctx.beginPath();
        ctx.moveTo(cell.x, cell.y);
        ctx.lineTo(cell.x + offset.x, cell.y + offset.y);
        ctx.stroke();
        ctx.restore();
      }
      const actor = entry.actor;
      let x = sceneMetrics.x + (actor.visualX + 0.5) * metrics.tile + offset.x;
      let y = sceneMetrics.y + (actor.visualY + 0.5) * metrics.tile + offset.y;
      if (actor.bump > 0) {
        const dir = DIRS[actor.bumpDirection] || DIRS.right;
        const bumpAmount = Math.sin(actor.bump * Math.PI) * metrics.tile * 0.075;
        x += dir.dx * bumpAmount;
        y += dir.dy * bumpAmount;
      }
      drawOperative(ctx, actor, x, y, metrics.tile, {
        color: entry.color,
        isEcho: entry.kind === 'echo',
        now,
        face: actor.facing,
        label: entry.label,
        index: entry.index
      });
    });
  }
  function drawParticles(ctx, session, metrics) {
    if (!session.particles.length) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    session.particles.forEach((particle) => {
      const lifeRatio = clamp(particle.life / particle.maxLife, 0, 1);
      const x = metrics.x + particle.x * metrics.tile;
      const y = metrics.y + particle.y * metrics.tile;
      const alpha = clamp(particle.alpha * lifeRatio, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.4, particle.size * (0.5 + lifeRatio * 0.5)), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawForkWave(ctx, session, metrics, now) {
    if (!session.forkWave) return;
    const age = (now - session.forkWave.started) / 1000;
    if (age > 1.2) {
      session.forkWave = null;
      return;
    }
    const center = boardCellCenter(session.forkWave.fromX, session.forkWave.fromY);
    const radius = metrics.tile * (0.2 + age * 2.2);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let ring = 0; ring < 3; ring += 1) {
      ctx.strokeStyle = hexToRgba(ring === 1 ? '#b8f9ff' : '#68edff', (1 - age / 1.2) * (0.22 - ring * 0.04));
      ctx.lineWidth = 1.4 - ring * 0.3;
      ctx.beginPath();
      ctx.arc(center.x, center.y, radius + ring * 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawHover(ctx, session, metrics) {
    if (!game || !session.running || openModalStack.length > 0) return;
    const { x, y } = pointerCell;
    if (x < 0 || y < 0 || x >= session.level.width || y >= session.level.height) return;
    if (session.level.walls.has(keyOf(x, y))) return;
    const px = metrics.x + x * metrics.tile;
    const py = metrics.y + y * metrics.tile;
    const tile = metrics.tile;
    const adjacent = Math.abs(session.player.x - x) + Math.abs(session.player.y - y) === 1;
    ctx.save();
    ctx.strokeStyle = adjacent ? 'rgba(184, 249, 255, 0.52)' : 'rgba(104, 237, 255, 0.16)';
    ctx.lineWidth = adjacent ? 1.2 : 0.8;
    ctx.strokeRect(px + 2.5, py + 2.5, tile - 5, tile - 5);
    if (adjacent) {
      const cx = px + tile / 2;
      const cy = py + tile / 2;
      ctx.fillStyle = 'rgba(104, 237, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(cx, cy, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAmbientMotes(ctx, session, metrics, now) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i += 1) {
      const seed = hash(i, 4, session.level.index + 17);
      const drift = Math.sin(now * 0.00016 + i * 2.37) * 0.4;
      const x = metrics.x + ((seed * 0.9 + drift + 0.05) % 1) * metrics.width;
      const y = metrics.y + ((hash(i, 9, session.level.index + 11) * 0.9 + Math.sin(now * 0.00008 + i) * 0.03) % 1) * metrics.height;
      const alpha = 0.035 + (Math.sin(now * 0.0012 + i * 1.7) * 0.5 + 0.5) * 0.06;
      ctx.fillStyle = `rgba(184, 249, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.65 + (i % 3) * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGameScene(now, dt) {
    if (!game) return;
    const fitted = fitCanvas(dom.gameCanvas);
    if (!fitted) return;
    const { ctx, width, height } = fitted;
    updateGameAnimation(game, dt);
    sceneMetrics = computeSceneMetrics(width, height, game.level.width, game.level.height);

    ctx.save();
    if (game.shake > 0.2 && !prefersReducedMotion) {
      const shakeX = Math.sin(now * 0.09) * game.shake;
      const shakeY = Math.cos(now * 0.073) * game.shake * 0.55;
      ctx.translate(shakeX, shakeY);
    }

    drawOuterField(ctx, game, sceneMetrics, now);
    drawFloorTiles(ctx, game, sceneMetrics, now);
    drawFloorAtmosphere(ctx, game, sceneMetrics, now);
    drawControlTethers(ctx, game, sceneMetrics);
    drawTrails(ctx, game, sceneMetrics);
    drawWalls(ctx, game, sceneMetrics, now);
    drawDoors(ctx, game, sceneMetrics, now);
    drawPlates(ctx, game, sceneMetrics, now);
    drawTerminals(ctx, game, sceneMetrics, now);
    drawExit(ctx, game, sceneMetrics, now);
    drawActors(ctx, game, sceneMetrics, now);
    drawParticles(ctx, game, sceneMetrics);
    drawForkWave(ctx, game, sceneMetrics, now);
    drawHover(ctx, game, sceneMetrics);
    drawAmbientMotes(ctx, game, sceneMetrics, now);
    ctx.restore();
  }
  /* ==========================================================
     INPUT / HINTS / EVENTS / MAIN LOOP
     ========================================================== */

  function requestHint() {
    if (!game) return;
    const hints = game.level.hints || [];
    if (!hints.length) {
      showToast('没有可用线索', '本实验舱没有登记额外提示。', 'warn', 2400);
      return;
    }
    if (hintIndex >= hints.length) {
      showToast('线索已耗尽', hints[hints.length - 1], 'hint', 6200);
      return;
    }
    const text = hints[hintIndex];
    hintIndex += 1;
    dom.hintButton.querySelector('span:first-child').textContent = `请求线索 (${hintIndex}/${hints.length})`;
    addLog(game, `线索 ${hintIndex} / ${hints.length}：${text}`, 'warn');
    showToast(`HELIX // 线索 ${hintIndex} / ${hints.length}`, text, 'hint', 8500);
    audio.click();
  }

  function resetAttemptFromUI() {
    if (!canAcceptGameInput()) return;
    resetCurrentAttempt(game);
    showToast('时间线已重写', '当前路径被清除，已固化的回声仍会从起点重新回放。', 'warn', 3000);
  }

  function toggleSound() {
    const muted = audio.toggle();
    updateSoundButton();
    showToast(muted ? '声音已静音' : '声音已开启', muted ? '环境音与操作反馈已关闭。' : '空间混响与操作反馈已恢复。', 'info', 2200);
  }

  function updateSoundButton() {
    dom.soundToggle?.setAttribute('aria-pressed', String(!audio.muted));
    dom.soundToggle?.setAttribute('aria-label', audio.muted ? '开启声音' : '关闭声音');
    dom.soundToggle?.setAttribute('title', audio.muted ? '开启声音 (M)' : '关闭声音 (M)');
    document.body.classList.toggle('audio-muted', audio.muted);
  }

  function handleCanvasPointerMove(event) {
    if (!game || currentScreen !== 'game') return;
    const rect = dom.gameCanvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const metrics = sceneMetrics;
    if (!metrics.tile) return;
    const x = Math.floor((localX - metrics.x) / metrics.tile);
    const y = Math.floor((localY - metrics.y) / metrics.tile);
    if (x < 0 || y < 0 || x >= game.level.width || y >= game.level.height) {
      pointerCell = { x: -1, y: -1 };
      dom.cellTooltip.hidden = true;
      dom.gameCanvas.style.cursor = 'default';
      return;
    }
    pointerCell = { x, y };
    const adjacent = Math.abs(game.player.x - x) + Math.abs(game.player.y - y) === 1;
    dom.gameCanvas.style.cursor = adjacent ? 'pointer' : 'crosshair';
    updateCellTooltip();
  }

  function handleCanvasPointerLeave() {
    pointerCell = { x: -1, y: -1 };
    if (dom.cellTooltip) dom.cellTooltip.hidden = true;
    if (dom.gameCanvas) dom.gameCanvas.style.cursor = 'default';
  }

  function handleCanvasClick(event) {
    if (!game || !canAcceptGameInput()) return;
    const rect = dom.gameCanvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const metrics = sceneMetrics;
    if (!metrics.tile) return;
    const x = Math.floor((localX - metrics.x) / metrics.tile);
    const y = Math.floor((localY - metrics.y) / metrics.tile);
    if (x === game.player.x && y === game.player.y) {
      if (getTerminalAt(game, x, y)) interactWithTerminal();
      return;
    }
    const dx = x - game.player.x;
    const dy = y - game.player.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return;
    if (dx === 1) tryMove('right');
    else if (dx === -1) tryMove('left');
    else if (dy === 1) tryMove('down');
    else if (dy === -1) tryMove('up');
  }

  function handleKeyDown(event) {
    const key = event.key;
    const lower = key.toLowerCase();
    const targetTag = event.target?.tagName;
    const targetIsControl = ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag);
    if (targetIsControl) return;

    audio.ensure();

    if (key === 'm' || key === 'M') {
      event.preventDefault();
      toggleSound();
      return;
    }

    if (openModalStack.length) {
      if (key === 'Tab') {
        const top = document.getElementById(openModalStack[openModalStack.length - 1]);
        const focusable = top ? Array.from(top.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
          .filter((element) => element.getClientRects().length > 0) : [];
        if (focusable.length) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
      if (key === 'Escape') {
        if (openModalStack.includes('level-intro-overlay')) return;
        if (openModalStack.includes('complete-overlay') || openModalStack.includes('ending-overlay')) return;
        event.preventDefault();
        if (openModalStack.includes('confirm-overlay')) {
          closeConfirm();
        } else {
          closeTopModal();
          if (!openModalStack.includes('pause-overlay') && game && !game.completed) game.running = true;
        }
        return;
      }
      if (openModalStack.includes('level-intro-overlay') && (key === 'Enter' || key === ' ')) {
        event.preventDefault();
        enterChamber();
        return;
      }
      if (openModalStack.includes('complete-overlay') && (key === 'Enter' || key === ' ')) {
        event.preventDefault();
        advanceFromComplete();
        return;
      }
      if (key === 'h' || key === 'H') {
        if (openModalStack.includes('help-overlay')) closeModal('help-overlay');
        else if (!openModalStack.includes('level-intro-overlay') && !openModalStack.includes('complete-overlay') && !openModalStack.includes('ending-overlay')) openHelp();
        return;
      }
      return;
    }

    if (currentScreen === 'title') {
      if (key === 'Enter' && !['BUTTON', 'A'].includes(targetTag)) {
        event.preventDefault();
        startFromTitle();
      } else if (key === 'h' || key === 'H') {
        event.preventDefault();
        openHelp();
      }
      return;
    }

    if (currentScreen !== 'game' || !game) return;

    if (key === 'Escape') {
      event.preventDefault();
      if (game.completed) return;
      openPause();
      return;
    }
    if (key === 'h' || key === 'H') {
      event.preventDefault();
      openHelp();
      return;
    }
    if (key === ' ' || key === 'Spacebar') {
      if (['BUTTON', 'A'].includes(targetTag)) return;
      event.preventDefault();
      waitTick();
      return;
    }
    if (key === 'Backspace') {
      event.preventDefault();
      resetAttemptFromUI();
      return;
    }
    if (key === 'r' || key === 'R') {
      event.preventDefault();
      forkTimeline();
      return;
    }
    if (key === 'e' || key === 'E') {
      event.preventDefault();
      interactWithTerminal();
      return;
    }
    if (key === 'x' || key === 'X') {
      event.preventDefault();
      requestPurge();
      return;
    }
    if (key === 'u' || key === 'U') {
      event.preventDefault();
      undoLastEcho();
      return;
    }
    if (['ArrowUp', 'w', 'W'].includes(key)) {
      event.preventDefault();
      tryMove('up');
    } else if (['ArrowDown', 's', 'S'].includes(key)) {
      event.preventDefault();
      tryMove('down');
    } else if (['ArrowLeft', 'a', 'A'].includes(key)) {
      event.preventDefault();
      tryMove('left');
    } else if (['ArrowRight', 'd', 'D'].includes(key)) {
      event.preventDefault();
      tryMove('right');
    }
  }

  function bindEvents() {
    dom.startButton.addEventListener('click', startFromTitle);
    dom.chaptersButton.addEventListener('click', openChapterArchive);
    dom.manualTitleButton.addEventListener('click', openHelp);
    dom.helpToggle.addEventListener('click', openHelp);
    dom.gameHelpToggle.addEventListener('click', openHelp);
    dom.soundToggle.addEventListener('click', toggleSound);
    dom.pauseButton.addEventListener('click', openPause);
    dom.quickWait.addEventListener('click', waitTick);
    dom.touchWait.addEventListener('click', waitTick);
    dom.quickInteract.addEventListener('click', interactWithTerminal);
    dom.touchInteract.addEventListener('click', interactWithTerminal);
    dom.quickFork.addEventListener('click', forkTimeline);
    dom.touchFork.addEventListener('click', forkTimeline);
    dom.dialogueClose.addEventListener('click', hideDialogue);
    dom.undoEchoButton.addEventListener('click', undoLastEcho);
    dom.hintButton.addEventListener('click', requestHint);
    dom.resetAttemptButton.addEventListener('click', resetAttemptFromUI);
    dom.purgeButton.addEventListener('click', requestPurge);
    dom.quitToTitleButton.addEventListener('click', requestQuitToTitle);
    dom.enterChamberButton.addEventListener('click', enterChamber);
    dom.resumeButton.addEventListener('click', resumeGame);
    dom.pauseRestartButton.addEventListener('click', () => {
      closeModal('pause-overlay');
      resetAttemptFromUI();
    });
    dom.pauseChaptersButton.addEventListener('click', () => {
      closeModal('pause-overlay');
      openChapterArchive();
    });
    dom.pauseQuitButton.addEventListener('click', requestQuitToTitle);
    dom.replayButton.addEventListener('click', replayLevel);
    dom.nextChamberButton.addEventListener('click', advanceFromComplete);
    dom.endingArchiveButton.addEventListener('click', () => {
      closeModal('ending-overlay');
      openChapterArchive();
    });
    dom.endingTitleButton.addEventListener('click', closeEndingToTitle);
    dom.resetSaveButton.addEventListener('click', resetAllProgress);
    dom.confirmCancel.addEventListener('click', closeConfirm);
    dom.confirmAccept.addEventListener('click', acceptConfirm);
    dom.chapterList.addEventListener('click', (event) => {
      const entry = event.target.closest('[data-level-index]');
      if (!entry || entry.disabled) return;
      chooseChapter(Number(entry.dataset.levelIndex));
    });
    $$('[data-move]').forEach((button) => {
      button.addEventListener('click', () => tryMove(button.dataset.move));
    });
    $$('[data-close-modal]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.closeModal;
        if (id === 'confirm-overlay') {
          closeConfirm();
        } else if (id === 'level-intro-overlay') {
          enterChamber();
        } else {
          closeModal(id);
          if (game && !game.completed) game.running = true;
        }
      });
    });
    dom.brandHome.addEventListener('click', (event) => {
      event.preventDefault();
      if (currentScreen === 'game' && game) requestQuitToTitle();
      else if (currentScreen !== 'title') showTitle();
    });
    dom.gameCanvas.addEventListener('pointermove', handleCanvasPointerMove);
    dom.gameCanvas.addEventListener('pointerleave', handleCanvasPointerLeave);
    dom.gameCanvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', () => {
      if (dom.cellTooltip) dom.cellTooltip.hidden = true;
    });
    document.addEventListener('visibilitychange', () => {
      lastFrame = performance.now();
    });
    window.addEventListener('pointerdown', () => {
      audio.ensure();
    }, { once: true });
  }

  let lastGameElapsedCheck = performance.now();

  function loop(now) {
    const rawDt = (now - lastFrame) / 1000;
    const dt = clamp(rawDt, 0, 0.05);
    lastFrame = now;

    if (currentScreen === 'title') {
      titleTime += dt * 1000;
      drawTitleScene(titleTime);
    } else if (game) {
      if (game.running && !game.completed && openModalStack.length === 0) {
        game.stats.elapsedMs += dt * 1000;
      }
      drawGameScene(now, dt);
    }
    requestAnimationFrame(loop);
  }

  // Read-only diagnostics used by the development harness. No game actions are exposed.
  window.__CHRONO_LAB__ = Object.freeze({
    getState: () => game ? {
      level: game.level.number,
      tick: game.tick,
      player: { x: game.player.x, y: game.player.y },
      echoes: game.echoes.map((echo) => ({
        id: echo.id,
        actions: echo.actionCount,
        at: { x: echo.actor.x, y: echo.actor.y }
      })),
      plateCounts: { ...game.plateCounts },
      doors: Object.fromEntries(game.doorStates),
      latched: Array.from(game.latchedDoors),
      terminals: {
        committed: Array.from(game.committedTerminals),
        current: Array.from(game.currentTerminals)
      },
      running: game.running,
      completed: game.completed,
      stats: { ...game.stats }
    } : null,
    getSave: () => JSON.parse(JSON.stringify(save)),
    getLevels: () => LEVELS.map(({ id, number, title, maxEchoes, parForks }) => ({ id, number, title, maxEchoes, parForks }))
  });

  function init() {
    updateSoundButton();
    updateTitleUI();
    dom.titleScreen.classList.add('is-active');
    dom.gameScreen.classList.remove('is-active');
    document.body.classList.remove('is-playing');
    bindEvents();
    if (dom.chaptersOverlay) dom.chaptersOverlay.setAttribute('aria-hidden', 'true');
    lastFrame = performance.now();
    requestAnimationFrame(loop);
    // Keep the initial title canvas crisp before the first animation frame.
    drawTitleScene(0);
  }

  init();
})();