#!/usr/bin/env node

import { RegulationEngine, REGULATION_PRESETS } from './engine/regulation.js';
import { PlayerProfiler } from './engine/profiler.js';
import { TeamBuilder } from './engine/builder.js';
import { StrategyCoach } from './engine/coach.js';
import fs from 'fs';

function printBanner() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║             POKEMIND AI - COMPETITIVE INTELLIGENCE SYSTEM          ║
║      Singles & Doubles Team Optimizer, Regulation & Profiler       ║
╚════════════════════════════════════════════════════════════════════╝
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    command: args[0] || 'build',
    format: 'singles',
    preset: null,
    style: 'balanced',
    banned: [],
    required: [],
    box: [],
    replayFile: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) options.format = args[++i];
    if (args[i] === '--preset' && args[i + 1]) options.preset = args[++i];
    if (args[i] === '--style' && args[i + 1]) options.style = args[++i];
    if (args[i] === '--banned' && args[i + 1]) options.banned = args[++i].split(',').map(s => s.trim());
    if (args[i] === '--required' && args[i + 1]) options.required = args[++i].split(',').map(s => s.trim());
    if (args[i] === '--box' && args[i + 1]) options.box = args[++i].split(',').map(s => s.trim());
    if (args[i] === '--replay' && args[i + 1]) options.replayFile = args[++i];
  }
  return options;
}

async function main() {
  printBanner();
  const options = parseArgs();

  // 1. Determine Player Profile
  const profiler = new PlayerProfiler();
  let playerProfile = null;

  if (options.replayFile && fs.existsSync(options.replayFile)) {
    console.log(`[+] Ingesting battle replay from: ${options.replayFile}`);
    const log = fs.readFileSync(options.replayFile, 'utf-8');
    playerProfile = profiler.ingestReplay(log, 'Player');
  } else {
    // Map style keyword
    const stylePresets = {
      'ho': { pace: 5, aggression: 5, switching: 2, speedStrategy: 5, teraHabit: 5 },
      'bo': { pace: 3, aggression: 4, switching: 5, speedStrategy: 3, teraHabit: 3 },
      'balance': { pace: 3, aggression: 3, switching: 4, speedStrategy: 3, teraHabit: 2 },
      'stall': { pace: 1, aggression: 1, switching: 5, speedStrategy: 1, teraHabit: 1 },
      'tr': { pace: 2, aggression: 4, switching: 2, speedStrategy: 1, teraHabit: 4 },
      'tailwind': { pace: 5, aggression: 5, switching: 3, speedStrategy: 5, teraHabit: 5 }
    };
    const chosen = stylePresets[options.style.toLowerCase()] || stylePresets['balance'];
    playerProfile = profiler.profileFromQuiz(chosen);
  }

  console.log(`[+] Target Player Profile: ${playerProfile.primaryArchetype.name} (Confidence: ${playerProfile.primaryArchetype.confidence}%)`);
  console.log(`    ${playerProfile.primaryArchetype.description}\n`);

  // 2. Set up Regulation
  let regConfig = {};
  if (options.preset && REGULATION_PRESETS[options.preset.toLowerCase()]) {
    regConfig = { preset: options.preset };
  } else if (options.format === 'doubles') {
    regConfig = { preset: 'vgc_regh' };
  } else {
    regConfig = { preset: 'gen9ou' };
  }

  if (options.banned.length > 0) regConfig.bannedSpecies = options.banned;
  if (options.required.length > 0) regConfig.requiredSpecies = options.required;

  const regulation = new RegulationEngine(regConfig);
  console.log(`[+] Active Regulation: ${regulation.config.name} (${regulation.config.format.toUpperCase()})`);
  if (regulation.config.bannedSpecies.size > 0) {
    console.log(`    Banned species: ${Array.from(regulation.config.bannedSpecies).join(', ')}`);
  }
  if (regulation.config.requiredSpecies.length > 0) {
    console.log(`    Required anchor core: ${regulation.config.requiredSpecies.join(', ')}`);
  }

  // 3. Generate Team
  const builder = new TeamBuilder(regulation, playerProfile);
  let teamResult = null;

  if (options.box && options.box.length > 0) {
    console.log(`\n[+] Optimizing best 6-mon team from your Cobblemon PC Box (${options.box.length} caught)...`);
    teamResult = builder.optimizeFromInventory(options.box, {
      format: options.format,
      requiredSpecies: options.required
    });
  } else {
    console.log('\n[+] Optimizing team synergy and coverage against regulation...');
    teamResult = builder.generateTeam({
      format: options.format,
      requiredSpecies: options.required
    });
  }

  console.log(`\n================= SYNERGY AUDIT: ${teamResult.synergyReport.rating} =================`);
  console.log(`Composite Synergy Score: ${teamResult.synergyReport.compositeScore} / 100`);
  console.log(`Defensive Resilience:    ${teamResult.synergyReport.defense.score} / 100`);
  console.log(`Offensive STAB Coverage: ${teamResult.synergyReport.offense.score} / 100 (${teamResult.synergyReport.offense.coveredCount}/18 types hit for super-effective)`);
  console.log(`Average Team Speed:      ${teamResult.synergyReport.speed.avgSpeed} (Fastest: ${teamResult.synergyReport.speed.fastest}, Slowest: ${teamResult.synergyReport.speed.slowest})`);

  if (teamResult.bestCatchesToHunt && teamResult.bestCatchesToHunt.length > 0) {
    console.log('\n[+] NEXT BEST MINECRAFT CATCHES TO HUNT:');
    teamResult.bestCatchesToHunt.forEach(c => {
      console.log(`  * Go Catch [${c.pokemon}] -> Replaces ${c.replaces} (+${c.gain} Synergy pts, Target: ${c.newSynergyScore}/100)`);
      console.log(`    Reason: ${c.reason}`);
    });
  }

  if (teamResult.synergyReport.defense.criticalVulnerabilities.length > 0) {
    console.log('\n[!] Critical Vulnerabilities to Watch:');
    teamResult.synergyReport.defense.criticalVulnerabilities.forEach(v => {
      console.log(`    - ${v.type} (${v.weakCount} Pokemon weak)`);
    });
  }

  // 4. Generate Coach Playbook
  const coach = new StrategyCoach();
  const playbook = coach.generatePlaybook(teamResult);

  console.log(`\n================= STRATEGIC COACH PLAYBOOK =================`);
  console.log(`Tactical Philosophy: ${playbook.corePhilosophy}`);
  console.log(`Primary Win Anchor:  ${playbook.winCondition}`);
  console.log('\nRecommended Leads:');
  playbook.leads.forEach(l => console.log(`  * ${l.matchup}: [${l.lead}] -> ${l.instruction}`));
  console.log('\nTerastallization Priorities:');
  playbook.terastallizationStrategy.forEach(t => console.log(`  * ${t.pokemon} (Tera ${t.recommendedTera}): [${t.usage}] ${t.note}`));

  console.log(`\n================= SHOWDOWN IMPORT/EXPORT PASTE =================\n`);
  console.log(teamResult.showdownPaste);
  console.log(`\n================================================================\n`);
}

main().catch(err => {
  console.error('Execution error:', err);
});
