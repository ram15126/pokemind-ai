import { BattleSimulator } from '../engine/simulator.js';
import { GameReviewer } from '../engine/reviewer.js';

console.log('=== TESTING BATTLE SIMULATOR & POST-MATCH GAME REVIEWER ===\n');

// 1. Initialize Battle with User's Cobblemon Squad
const userTeam = [
  { name: 'Ninetales-Alola', species: 'Ninetales-Alola', item: 'Light Clay', ability: 'Snow Warning', nature: 'Timid', moves: ['auroraveil', 'blizzard', 'moonblast', 'encore'] },
  { name: 'Garchomp', species: 'Garchomp', item: 'Life Orb', ability: 'Rough Skin', nature: 'Jolly', moves: ['earthquake', 'swordsdance', 'scaleshot', 'outrage'] },
  { name: 'Corviknight', species: 'Corviknight', item: 'Rocky Helmet', ability: 'Pressure', nature: 'Impish', moves: ['bravebird', 'roost', 'defog', 'uturn'] },
  { name: 'Samurott-Hisui', species: 'Samurott-Hisui', item: 'Focus Sash', ability: 'Sharpness', nature: 'Jolly', moves: ['ceaselessedge', 'razorshell', 'sacredsword', 'suckerpunch'] }
];

const sim = new BattleSimulator({ userTeam, botPreset: 'ou_balanced' });
console.log(`[+] Battle initialized: ${sim.id}`);

let state = sim.getState();
console.log(`[Turn ${state.turn}] User Active: ${state.player.active.species} (HP: ${state.player.active.hpPercent}%)`);
console.log(`           Bot Active:  ${state.bot.active.species} (HP: ${state.bot.active.hpPercent}%)`);

// Turn 1: Click move 1 (Aurora Veil)
console.log('\n--- Turn 1: Player casts Aurora Veil ---');
let turnRes = sim.submitTurn({ type: 'move', index: 1 });
state = turnRes.state;
console.log(`After Turn 1 -> User HP: ${state.player.active.hpPercent}%, Bot HP: ${state.bot.active.hpPercent}%`);

// Turn 2: Attack with Blizzard
console.log('\n--- Turn 2: Player uses Blizzard ---');
turnRes = sim.submitTurn({ type: 'move', index: 2 });
state = turnRes.state;
console.log(`After Turn 2 -> User HP: ${state.player.active.hpPercent}%, Bot HP: ${state.bot.active.hpPercent}%`);

// Turn 3: Switch to Garchomp (slot 2)
console.log('\n--- Turn 3: Player switches to Garchomp ---');
turnRes = sim.submitTurn({ type: 'switch', index: 2 });
state = turnRes.state;
console.log(`After Turn 3 -> User Active: ${state.player.active.species} (HP: ${state.player.active.hpPercent}%)`);

// Turn 4: Garchomp clicks Earthquake
console.log('\n--- Turn 4: Garchomp clicks Earthquake ---');
turnRes = sim.submitTurn({ type: 'move', index: 1 });
state = turnRes.state;
console.log(`After Turn 4 -> Bot Active: ${state.bot.active.species} (HP: ${state.bot.active.hpPercent}%)`);

// 2. Run Post-Match Reviewer
console.log('\n======================================================');
console.log('--- POST-MATCH AI GAME REVIEW (CHESS.COM STYLE) ---');
const reviewer = new GameReviewer();
const review = reviewer.reviewMatch({
  turnHistory: sim.turnHistory,
  fullLogText: sim.rawLogs.join('\n'),
  winner: state.winner || 'Undecided'
});

console.log(`Accuracy Rating: ${review.accuracyScore}% [Grade: ${review.grade}]`);
console.log(`Turning Point:   ${review.turningPoint.description}`);
console.log(`Move Breakdown:  ${review.stats.best} Best | ${review.stats.brilliant} Brilliant | ${review.stats.inaccuracies} Inaccuracies | ${review.stats.blunders} Blunders`);

console.log('\nTurn-by-Turn Timeline:');
review.timeline.forEach(t => {
  const icon = t.type === 'BRILLIANT' ? '🌟' : (t.type === 'BEST' ? '🟢' : (t.type === 'BLUNDER' ? '🔴' : '⚪'));
  console.log(`  ${icon} Turn ${t.turn} [${t.type}]: ${t.playerAction} -> ${t.feedback}`);
});

console.log('\nKey Coaching Lessons:');
review.lessons.forEach(l => console.log(`  * ${l}`));

console.log('\n=== TEST COMPLETE ===');
