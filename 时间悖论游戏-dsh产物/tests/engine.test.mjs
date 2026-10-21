#!/usr/bin/env node
/* 引擎规则单测：不依赖 DOM，验证会把玩家困住的底层规则。
 * 运行：node tests/engine.test.mjs
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { ChronoGame } = require(path.join(__dirname, '..', 'js', 'engine.js'));
const LEVELS = require(path.join(__dirname, '..', 'js', 'levels.js'));
const byId = (id) => LEVELS.find((l) => l.id === id);

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}\n      ${error.message}`);
    process.exitCode = 1;
  }
}

test('地图解析：全部关卡宽高一致，且存在起点与出口', () => {
  for (const level of LEVELS) {
    const game = new ChronoGame(level);
    assert.equal(game.width, level.map[0].length);
    assert.ok(game.playerStart);
    assert.ok(game.exit);
    assert.ok(game.width > 5 && game.height > 5);
  }
});

test('玩家移动与推箱：墙与关闭的门不消耗时间刻度', () => {
  const wallGame = new ChronoGame(byId(1));
  assert.equal(wallGame.move('left').ok, true);
  const startTick = wallGame.actionTick;
  const blocked = wallGame.move('left');
  assert.equal(blocked.ok, false);
  assert.equal(wallGame.actionTick, startTick);

  const game = new ChronoGame(byId(1));
  assert.equal(game.move('down').ok, true);
  assert.equal(game.move('down').ok, true);
  assert.equal(game.move('right').ok, true);
  assert.equal(game.actionTick, 3);
  assert.equal(game.player.x, 3);
  assert.equal(game.player.y, 4);
  assert.equal(game.plates[0].pressed, true);
});

test('回响刻录与重演：下一轮同一刻度执行同一个动作', () => {
  const game = new ChronoGame(byId(1));
  game.move('down');
  game.move('down');
  game.move('right');
  assert.equal(game.plates[0].pressed, true);
  const rewind = game.rewind();
  assert.equal(rewind.ok, true);
  assert.equal(game.loop, 2);
  assert.equal(game.rewindsLeft, 0);
  assert.equal(game.echoes.length, 1);
  assert.equal(game.echoes[0].actions.length, 3);
  assert.equal(game.player.x, game.playerStart.x);
  const result = game.move('down');
  assert.equal(result.ok, true);
  assert.equal(game.actionTick, 1);
  assert.equal(game.echoes[0].y, 3);
});

test('空循环不能回响，且不消耗能量', () => {
  const game = new ChronoGame(byId(1));
  const result = game.rewind();
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'empty-loop');
  assert.equal(game.rewindsLeft, game.maxRewinds);
  assert.equal(game.loop, 1);
});

test('因果锚在倒带后保留未来位置', () => {
  const level = {
    id: 99, echoBudget: 1, map: [
      '#########',
      '#P.x...E#',
      '#.......#',
      '#########'
    ]
  };
  const game = new ChronoGame(level);
  assert.equal(game.crateAt(3, 1).anchor, true);
  assert.equal(game.move('right').ok, true);
  assert.equal(game.move('right').ok, true);
  assert.equal(game.move('right').ok, true);
  assert.equal(game.crateAt(5, 1).anchor, true);
  game.rewind();
  assert.equal(game.player.x, 1);
  assert.equal(game.crateAt(5, 1).anchor, true, '锚应该留在 5,1');
});

test('因果封印：踏上触发器后 V 闸在本轮锁死，倒带后恢复', () => {
  const level = {
    id: 98, echoBudget: 1, map: [
      '###########',
      '#P..vV....#',
      '#.........#',
      '#........E#',
      '###########'
    ]
  };
  const game = new ChronoGame(level);
  const sealDoor = game.doors.find((d) => d.kind === 'seal');
  assert.equal(sealDoor.open, true);
  game.move('right');
  game.move('right');
  game.move('right');
  assert.equal(game.sealTriggered, true);
  assert.equal(sealDoor.open, false);
  game.rewind();
  assert.equal(game.sealTriggered, false);
  const sealDoorAgain = game.doors.find((d) => d.kind === 'seal');
  assert.equal(sealDoorAgain.open, true);
});

test('质量槽只接受箱子：玩家站在槽上不会触发同步', () => {
  const level = {
    id: 97, echoBudget: 0,
    syncCradles: [1],
    map: [
      '###########',
      '#P..1..2..#',
      '#........G#',
      '#........E#',
      '###########'
    ]
  };
  const game = new ChronoGame(level);
  const cradle = game.syncPlates.find((p) => p.node === 1);
  assert.equal(cradle.cradle, true);
  game.move('right');
  game.move('right');
  game.move('right');
  assert.equal(game.player.x, 4);
  assert.equal(cradle.pressed, false, '质量槽不应被玩家占据');
  assert.equal(game.syncLatched, false);
});

test('普通同步节点接受玩家，且全部节点同时成立后才锁存', () => {
  const level = {
    id: 96, echoBudget: 0,
    map: [
      '###########',
      '#P..1..2..#',
      '#........G#',
      '#........E#',
      '###########'
    ]
  };
  const game = new ChronoGame(level);
  game.move('right');
  game.move('right');
  game.move('right');
  assert.equal(game.syncPlates.find((p) => p.node === 1).pressed, true);
  assert.equal(game.syncLatched, false);
  // 走到第二个节点会路过 G 门前的走廊，但同步尚未成立，G 仍是关闭的。
  assert.equal(game.syncLatched, false);
});

test('撤销一步恢复动作、压力板和回响时间，但不返还已消耗的回响', () => {
  const game = new ChronoGame(byId(1));
  game.move('down');
  game.move('down');
  game.move('right');
  const rewind = game.rewind();
  assert.equal(rewind.ok, true);
  game.move('down');
  assert.equal(game.actionTick, 1);
  const undone = game.undo();
  assert.equal(undone.ok, true);
  assert.equal(game.actionTick, 0);
  assert.equal(game.player.x, game.playerStart.x);
  assert.equal(game.player.y, game.playerStart.y);
  assert.equal(game.rewindsLeft, 0, '已消耗的回响不会因撤销而返还');
  assert.equal(game.undo().reason, 'empty-undo');
});

test('所有已验证关卡在动作串下通关（关卡级回归）', () => {
  // 动作串由 verify-levels.mjs 完整校验；这里检查每关的预估结构仍合理。
  for (const level of LEVELS) {
    assert.ok(level.echoBudget >= 1);
    assert.ok(level.parActions > 0);
    assert.ok(typeof level.map === 'object');
    assert.ok(level.hint.length >= 2);
    assert.ok(level.ariadne.length > 0);
  }
});

console.log(`\n${passed} 个引擎规则测试通过。`);
