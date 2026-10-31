import { SynergyEngine } from '../engine/synergy.js';

console.log('=== TESTING MODULE 3: SYNERGY & TYPE COVERAGE ENGINE ===\n');

const synergy = new SynergyEngine(9);

// 1. Test Balanced S-Tier Singles Team:
// Great Tusk (Ground/Fighting), Gholdengo (Steel/Ghost), Dragapult (Dragon/Ghost),
// Kingambit (Dark/Steel), Ogerpon-Wellspring (Grass/Water), Ting-Lu (Dark/Ground)
const balancedTeam = [
  'Great Tusk',
  'Gholdengo',
  'Dragapult',
  'Corviknight',
  'Ogerpon-Wellspring',
  'Ting-Lu'
];

console.log('--- Analyzing Balanced Team Synergy ---');
const balancedEval = synergy.evaluateTeam(balancedTeam, 'singles');
console.log('Composite Synergy Score:', balancedEval.compositeScore, `(${balancedEval.rating})`);
console.log('Defensive Score:', balancedEval.defense.score);
console.log('Critical Vulnerabilities:', balancedEval.defense.criticalVulnerabilities.length);
console.log('Offensive Coverage Score:', balancedEval.offense.score, `(${balancedEval.offense.coveredCount}/18 types hit for SE)`);
console.log('Speed Tiers (Avg Speed):', balancedEval.speed.avgSpeed);
console.log('Speed Brackets:', balancedEval.speed.tiers);

// 2. Test Flawed Mono-weakness Team (e.g. 5 Fire types or 4 Steel types)
console.log('\n--- Analyzing Flawed Imbalanced Team (Quad Ground Weakness) ---');
const flawedTeam = [
  'Heatran',      // 4x Ground weak
  'Gholdengo',    // 2x Ground weak
  'Incineroar',   // 2x Ground weak
  'Archaludon',   // 2x Ground weak
  'Iron Hands',   // 2x Ground weak
  'Kingambit'     // 2x Ground weak
];

const flawedEval = synergy.evaluateTeam(flawedTeam, 'singles');
console.log('Composite Synergy Score:', flawedEval.compositeScore, `(${flawedEval.rating})`);
console.log('Defensive Score:', flawedEval.defense.score);
console.log('Critical Vulnerabilities:');
flawedEval.defense.criticalVulnerabilities.forEach(v => {
  console.log(`  - [${v.severity}] ${v.type} (${v.weakCount} Pokemon weak!)`);
});

console.log('\n=== MODULE 3 TEST COMPLETE ===');
