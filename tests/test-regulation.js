import { RegulationEngine, REGULATION_PRESETS } from '../engine/regulation.js';

console.log('=== TESTING MODULE 1: REGULATION & LEGALITY ENGINE ===\n');

// 1. Test VGC Reg H (0 restricted, no paradox, no sub-legendaries)
const regH = new RegulationEngine('vgc_regh');
console.log(`Regulation: ${regH.config.name}`);
const flutterManeCheck = regH.isSpeciesLegal('Flutter Mane');
console.log('Flutter Mane legal in Reg H?', flutterManeCheck);

const incineroarCheck = regH.isSpeciesLegal('Incineroar');
console.log('Incineroar legal in Reg H?', incineroarCheck);

const miraidonCheck = regH.isSpeciesLegal('Miraidon');
console.log('Miraidon legal in Reg H?', miraidonCheck);

const legalInRegH = regH.getLegalSpeciesList();
console.log(`Total legal competitive species in Reg H: ${legalInRegH.length}`);

// 2. Test Custom Regulation (e.g. Singles Draft League with custom bans)
console.log('\n--- Custom Regulation Test ---');
const customReg = new RegulationEngine({
  name: 'Custom Draft League Season 4',
  format: 'singles',
  maxRestricted: 0,
  bannedSpecies: ['Garchomp', 'Dragonite'],
  bannedMoves: ['Stealth Rock'],
  itemClause: true
});

const garchompCheck = customReg.isSpeciesLegal('Garchomp');
console.log('Garchomp legal in Custom League?', garchompCheck);

const dragapultCheck = customReg.isSpeciesLegal('Dragapult');
console.log('Dragapult legal in Custom League?', dragapultCheck);

// 3. Test Team Validation
console.log('\n--- Team Validation Test ---');
const sampleTeam = [
  { species: 'Dragapult', item: 'Choice Specs', moves: ['Draco Meteor', 'Shadow Ball', 'Flamethrower', 'U-turn'] },
  { species: 'Corviknight', item: 'Leftovers', moves: ['Brave Bird', 'Roost', 'Defog', 'U-turn'] },
  { species: 'Ting-Lu', item: 'Leftovers', moves: ['Earthquake', 'Stealth Rock', 'Whirlwind', 'Ruination'] }, // Duplicate Leftovers & Banned Stealth Rock!
  { species: 'Garchomp', item: 'Life Orb', moves: ['Earthquake', 'Outrage', 'Swords Dance', 'Scale Shot'] }, // Banned Garchomp!
  { species: 'Iron Valiant', item: 'Booster Energy', moves: ['Moonblast', 'Close Combat', 'Knock Off', 'Encore'] },
  { species: 'Rotom-Wash', item: 'Sitrus Berry', moves: ['Hydro Pump', 'Volt Switch', 'Will-O-Wisp', 'Pain Split'] }
];

const validationResult = customReg.validateTeam(sampleTeam);
console.log('Validation passed?', validationResult.valid);
console.log('Detected errors:');
validationResult.errors.forEach(e => console.log('  -', e));

console.log('\n=== MODULE 1 TEST COMPLETE ===');
