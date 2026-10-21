#!/usr/bin/env node
/* 关卡可解性验证：用预先演练的动作串驱动纯逻辑引擎。
 * 用法：node tests/verify-levels.mjs
 * 每关的 loops 数组代表“每一轮循环的玩家动作”。除最后一轮外，脚本会在轮末调用回响。
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const levels = require(path.join(__dirname, '..', 'js', 'levels.js'));
const { ChronoGame } = require(path.join(__dirname, '..', 'js', 'engine.js'));

const SOLUTIONS = {
  1: ['DDR', 'DDDDDRUURRRRR'],
  2: ['RRRRRRR', 'WRRRRDDDD', 'WRRRRDDDLLLDDRRRDDR'],
  3: ['RRRRRRR', 'WRRRRDDDLLLDRRRRRRDRRRUDLLDD'],
  4: ['DDDDRDDDRRRR', 'DRDUURRRRRRRRRR'],
  5: ['RRR', 'DDDRDDDDRRRR', 'DDRRUURRRRRRRRR'],
  6: ['LLLUUUUUUUL', 'RRRUUUUUUUR', 'RRRUWWWWWWWLLLLUUURUUU'],
  7: [
    'DDRDD' + 'R'.repeat(6) + 'DD' + 'R'.repeat(5),
    'RRR',
    'DDRDD' + 'LLDD' + 'RRR' + 'UU' + 'L' + 'UUUU' + 'R'.repeat(12)
  ],
  8: [
    'L'.repeat(6),
    'UU' + 'L'.repeat(6) + 'U',
    'UU' + 'R'.repeat(6) + 'U',
    'R'.repeat(6) + 'LLL' + 'UU' + 'UU' + 'D' + 'LLL' + 'UUUUU'
  ]
};

const DIR_MAP = { U: 'up', D: 'down', L: 'left', R: 'right', W: 'wait', '.': 'wait' };

function play(level, loops, verbose = false) {
  const game = new ChronoGame(level);
  const failures = [];
  for (let li = 0; li < loops.length; li++) {
    const actions = loops[li];
    for (let ai = 0; ai < actions.length; ai++) {
      const ch = actions[ai];
      const dir = DIR_MAP[ch];
      if (!dir) throw new Error(`未知动作 ${ch}`);
      const before = { x: game.player.x, y: game.player.y, loop: game.loop };
      const result = dir === 'wait' ? game.wait() : game.move(dir);
      if (!result.ok) {
        failures.push(`L${li + 1} A${ai + 1} '${ch}' blocked: ${result.reason} at ${before.x},${before.y} loop ${before.loop}`);
        break;
      }
      if (verbose) {
        console.log(`  L${li + 1} A${ai + 1} ${ch} -> ${game.player.x},${game.player.y} tick=${game.actionTick} echo=${result.events.filter(e => e.type === 'echoMove').length}`);
      }
      if (result.won) {
        if (li !== loops.length - 1) failures.push('提前通关：动作串还有后续轮次');
        return { game, failures, won: true };
      }
    }
    if (failures.length) break;
    if (li < loops.length - 1) {
      const r = game.rewind();
      if (!r.ok) {
        failures.push(`L${li + 1} rewind failed: ${r.reason}`);
        break;
      }
    }
  }
  if (!game.won) failures.push(`未通关，最终位置=${game.player.x},${game.player.y} 状态=${game.status}`);
  return { game, failures, won: game.won };
}

let failed = 0;
for (const level of levels) {
  const loops = SOLUTIONS[level.id];
  if (!loops) {
    console.log(`SKIP  ${level.code} ${level.name} — 尚无验证动作串`);
    continue;
  }
  const { game, failures, won } = play(level, loops);
  const total = loops.reduce((n, s) => n + s.length, 0);
  if (failures.length) {
    failed++;
    console.log(`FAIL  ${level.code} ${level.name}`);
    failures.forEach(f => console.log('      ' + f));
    continue;
  }
  console.log(`PASS  ${level.code} ${level.name}  actions=${game.totalActions}/${level.parActions}  echoes=${game.rewindsUsed}/${level.echoBudget}  shard=${game.shardCollected}  loops=${game.loop}`);
  if (game.totalActions > level.parActions) {
    console.log(`      WARN 验证路径 ${game.totalActions} 超出 PAR ${level.parActions}`);
    failed++;
  }
}
if (failed) {
  console.error(`\n${failed} 个关卡验证失败`);
  process.exit(1);
}
console.log('\n全部关卡动作串验证通过。');
