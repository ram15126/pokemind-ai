import { RegulationEngine } from '../engine/regulation.js';
import { PlayerProfiler } from '../engine/profiler.js';
import { TeamBuilder } from '../engine/builder.js';
import { StrategyCoach } from '../engine/coach.js';

console.log('=== TESTING COBBLEMON PC BOX INVENTORY OPTIMIZER ===\n');

// 1. Simulate a player's Cobblemon PC box of caught Pokemon
const playerCaughtBox = [
  'Garchomp',
  'Skeledirge',
  'Meowscarada',
  'Gyarados',
  'Tinkaton',
  'Rotom-Wash',
  'Grimmsnarl',
  'Breloom',
  'Magnezone'
];

console.log(`[+] Player's Cobblemon PC Box (${playerCaughtBox.length} caught):`);
console.log('   ', playerCaughtBox.join(', '));

// 2. Regulation & Player Profile
const reg = new RegulationEngine('gen9ou');
const profiler = new PlayerProfiler().profileFromQuiz({ pace: 4, aggression: 4, switching: 4 });
const builder = new TeamBuilder(reg, profiler);

// 3. Optimize from caught Pokemon
const result = builder.optimizeFromInventory(playerCaughtBox, { format: 'singles' });

console.log(`\n[+] Optimized Best 6-Mon Team from Caught Box:`);
console.log('Synergy Rating:', result.synergyReport.rating, `(Score: ${result.synergyReport.compositeScore}/100)`);
console.log('Defensive Resilience:', `${result.synergyReport.defense.score}/100`);
console.log('Offensive Coverage:', `${result.synergyReport.offense.coveredCount}/18 types`);

console.log('\n--- Selected 6-Pokemon Roster ---');
result.team.forEach((m, i) => {
  console.log(` Slot ${i + 1}: ${m.species} @ ${m.item} (Tera ${m.teraType})`);
});

console.log('\n--- Next Best Wild Catches to Hunt in Minecraft ---');
if (result.bestCatchesToHunt.length > 0) {
  result.bestCatchesToHunt.forEach(c => {
    console.log(`  * Go Catch [${c.pokemon}] -> Replaces ${c.replaces} (+${c.gain} Synergy pts, Target: ${c.newSynergyScore}/100)`);
    console.log(`    Reason: ${c.reason}`);
  });
} else {
  console.log('  Your box team is already near-perfect!');
}

console.log('\n--- Showdown / Cobblemon Paste ---');
console.log(result.showdownPaste);

console.log('\n=== TEST COMPLETE ===');
