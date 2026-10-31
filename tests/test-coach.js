import { RegulationEngine } from '../engine/regulation.js';
import { PlayerProfiler } from '../engine/profiler.js';
import { TeamBuilder } from '../engine/builder.js';
import { StrategyCoach } from '../engine/coach.js';

console.log('=== TESTING MODULE 5: STRATEGY COACH & PLAYBOOK GENERATOR ===\n');

const regH = new RegulationEngine('vgc_regh');
const profiler = new PlayerProfiler().profileFromQuiz({ pace: 3, switching: 5, aggression: 4 });
const builder = new TeamBuilder(regH, profiler);
const teamData = builder.generateTeam({ format: 'doubles' });

const coach = new StrategyCoach();
const playbook = coach.generatePlaybook(teamData);

console.log('Core Philosophy:\n ', playbook.corePhilosophy);
console.log('\nRecommended Leads:');
playbook.leads.forEach(l => console.log(`  - [${l.matchup}]: ${l.lead} -> ${l.instruction}`));
console.log('\nTera Strategy:');
playbook.terastallizationStrategy.forEach(t => console.log(`  - ${t.pokemon} (Tera ${t.recommendedTera}): [${t.usage}] ${t.note}`));
console.log('\nKey Win Condition Anchor:', playbook.winCondition);

console.log('\n=== MODULE 5 TEST COMPLETE ===');
