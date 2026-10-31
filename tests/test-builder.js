import { RegulationEngine } from '../engine/regulation.js';
import { PlayerProfiler } from '../engine/profiler.js';
import { TeamBuilder } from '../engine/builder.js';

console.log('=== TESTING MODULE 4: AUTOMATED TEAM BUILDER & OPTIMIZER ===\n');

// 1. Build a team for Gen 9 Singles OU for a Hyper Offense player
console.log('--- Test 1: Gen 9 Singles OU (Hyper Offense Profile) ---');
const ouReg = new RegulationEngine('gen9ou');
const hoProfile = new PlayerProfiler().profileFromQuiz({
  pace: 5,
  aggression: 5,
  switching: 2,
  speedStrategy: 5,
  teraHabit: 5
});

const hoBuilder = new TeamBuilder(ouReg, hoProfile);
const hoTeamResult = hoBuilder.generateTeam({ format: 'singles' });

console.log(`Generated Team for: ${hoTeamResult.targetPlaystyle} in ${hoTeamResult.regulationName}`);
console.log('Synergy Rating:', hoTeamResult.synergyReport.rating, `(Score: ${hoTeamResult.synergyReport.compositeScore})`);
console.log('Defensive Score:', hoTeamResult.synergyReport.defense.score);
console.log('Offensive Coverage:', `${hoTeamResult.synergyReport.offense.coveredCount}/18 types`);
console.log('\n--- Exported Showdown Paste ---');
console.log(hoTeamResult.showdownPaste);

// 2. Build a team for VGC Regulation H (Doubles, Item Clause) for a Bulky Pivot player
console.log('\n======================================================');
console.log('--- Test 2: VGC Regulation H (Bulky Offense & Item Clause) ---');
const vgcReg = new RegulationEngine('vgc_regh');
const boProfile = new PlayerProfiler().profileFromQuiz({
  pace: 3,
  aggression: 4,
  switching: 5,
  speedStrategy: 3,
  teraHabit: 2
});

const vgcBuilder = new TeamBuilder(vgcReg, boProfile);
const vgcTeamResult = vgcBuilder.generateTeam({ format: 'doubles' });

console.log(`Generated Team for: ${vgcTeamResult.targetPlaystyle} in ${vgcTeamResult.regulationName}`);
console.log('Synergy Rating:', vgcTeamResult.synergyReport.rating, `(Score: ${vgcTeamResult.synergyReport.compositeScore})`);
console.log('\n--- Exported Showdown Paste ---');
console.log(vgcTeamResult.showdownPaste);

// Verify team legality against the regulation
console.log('\n--- Legality Verification Check ---');
const legalCheck = vgcReg.validateTeam(vgcTeamResult.team);
console.log('Is VGC Reg H Team 100% Legal?', legalCheck.valid);
if (!legalCheck.valid) {
  console.log('Errors:', legalCheck.errors);
}

console.log('\n=== MODULE 4 TEST COMPLETE ===');
