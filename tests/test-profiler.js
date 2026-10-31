import { PlayerProfiler } from '../engine/profiler.js';

console.log('=== TESTING MODULE 2: PLAYER PROFILING & PLAYSTYLE ENGINE ===\n');

// 1. Test Replay Ingestion (Simulated Showdown battle log)
const profiler = new PlayerProfiler();

const sampleReplay = `
|player|p1|RedMaster|1
|player|p2|BlueRival|2
|teamsize|p1|6
|teamsize|p2|6
|gametype|singles
|tier|[Gen 9] OU
|turn|1
|switch|p1a: Dragapult|Dragapult, M|100/100
|switch|p2a: Ting-Lu|Ting-Lu|100/100
|move|p1a: Dragapult|U-turn|p2a: Ting-Lu
|-damage|p2a: Ting-Lu|85/100
|switch|p1a: Great Tusk|Great Tusk|100/100
|turn|2
|move|p1a: Great Tusk|Close Combat|p2a: Ting-Lu
|-damage|p2a: Ting-Lu|10/100
|move|p2a: Ting-Lu|Earthquake|p1a: Great Tusk
|-damage|p1a: Great Tusk|65/100
|turn|3
|move|p1a: Great Tusk|Rapid Spin|p2a: Ting-Lu
|-damage|p2a: Ting-Lu|0 fnt
|faint|p2a: Ting-Lu
|turn|4
|switch|p2a: Iron Valiant|Iron Valiant|100/100
|switch|p1a: Gholdengo|Gholdengo|100/100
|move|p2a: Iron Valiant|Moonblast|p1a: Gholdengo
|-resisted|p1a: Gholdengo
|-damage|p1a: Gholdengo|70/100
|turn|5
|move|p1a: Gholdengo|Make It Rain|p2a: Iron Valiant
|-supereffective|p2a: Iron Valiant
|-damage|p2a: Iron Valiant|0 fnt
|faint|p2a: Iron Valiant
|win|p1
`;

console.log('--- Ingesting Showdown Replay ---');
const replayProfile = profiler.ingestReplay(sampleReplay, 'RedMaster');
console.log('Player Archetype Identified:', replayProfile.primaryArchetype.name);
console.log('Description:', replayProfile.primaryArchetype.description);
console.log('Archetype Scores:', replayProfile.scores);

// 2. Test Diagnostic Questionnaire
console.log('\n--- Diagnostic Questionnaire Test ---');
const quizAnswers = {
  pace: 5,           // Very fast
  aggression: 5,     // Hyper aggressive
  switching: 2,      // Low switching, stay and punch
  speedStrategy: 5,  // Fastest speed tier
  teraHabit: 5       // Turn 1 offensive Tera
};

const quizProfile = new PlayerProfiler().profileFromQuiz(quizAnswers);
console.log('Quiz Archetype Identified:', quizProfile.primaryArchetype.name);
console.log('Confidence:', quizProfile.primaryArchetype.confidence);
console.log('Scores:', quizProfile.scores);

console.log('\n=== MODULE 2 TEST COMPLETE ===');
