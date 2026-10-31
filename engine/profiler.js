import { toID } from './data.js';

/**
 * Competitive Pokemon Player Profiler
 * Analyzes battle replays (Showdown logs) or interactive quiz to build a quantitative playstyle profile.
 */

export const SETUP_MOVES = new Set([
  'swordsdance', 'nastyplot', 'dragondance', 'calmmind', 'quiverdance',
  'bulkup', 'curse', 'shellsmash', 'agility', 'shiftgear', 'tidyup',
  'victorydance', 'bellydrum', 'irondefense', 'amnesia', 'coil'
]);

export const HAZARD_MOVES = new Set([
  'stealthrock', 'spikes', 'toxicspikes', 'stickyweb', 'ceaselessedge', 'stoneaxe'
]);

export const RECOVERY_MOVES = new Set([
  'recover', 'roost', 'slackoff', 'softboiled', 'wish', 'synthesis',
  'moonlight', 'morningsun', 'strengthsap', 'leechseed', 'shoreup', 'painsplit', 'rest'
]);

export const PIVOT_MOVES = new Set([
  'uturn', 'voltswitch', 'partingshot', 'flipturn', 'chillyreception', 'teleport', 'shedtail'
]);

export const SPEED_CONTROL_MOVES = new Set([
  'tailwind', 'trickroom', 'icywind', 'electroweb', 'scaryface', 'thunderwave', 'glare'
]);

export const REDIRECTION_MOVES = new Set([
  'followme', 'ragepowder', 'allyswitch'
]);

export const DISRUPTION_MOVES = new Set([
  'fakeout', 'taunt', 'encore', 'spore', 'sleeppowder', 'willowisp', 'yawn', 'disable'
]);

export class PlayerProfiler {
  constructor() {
    this.replaysAnalyzed = 0;
    this.rawMetrics = {
      totalTurns: 0,
      hardSwitches: 0,
      pivotMoves: 0,
      attacks: 0,
      setupMoves: 0,
      hazards: 0,
      recoveryMoves: 0,
      speedControlMoves: 0,
      redirectionMoves: 0,
      disruptionMoves: 0,
      earlyTeraCount: 0,
      lateTeraCount: 0,
      totalMatches: 0
    };
  }

  /**
   * Parse a single Pokemon Showdown replay log
   * @param {string} replayLog - Raw Showdown log text or stringified JSON
   * @param {string} playerUsername - Target player's username to track
   */
  ingestReplay(replayLog, playerUsername) {
    if (!replayLog || !playerUsername) return null;
    const targetPlayerId = toID(playerUsername);

    const lines = replayLog.split('\n');
    let playerSlot = null; // 'p1' or 'p2'
    let currentTurn = 0;
    let turnCount = 0;

    // Detect player slot
    for (const line of lines) {
      const parts = line.split('|');
      if (parts[1] === 'player') {
        const slot = parts[2]; // 'p1' or 'p2'
        const name = parts[3];
        if (toID(name) === targetPlayerId) {
          playerSlot = slot;
          break;
        }
      }
    }

    if (!playerSlot) {
      // If player name wasn't explicitly tagged with |player|, default to p1
      playerSlot = 'p1';
    }

    this.rawMetrics.totalMatches++;

    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length < 2) continue;

      const tag = parts[1];

      if (tag === 'turn') {
        currentTurn = parseInt(parts[2], 10) || currentTurn + 1;
        turnCount = Math.max(turnCount, currentTurn);
      } else if (tag === 'switch' || tag === 'drag') {
        const actor = parts[2] || '';
        if (actor.startsWith(playerSlot)) {
          this.rawMetrics.hardSwitches++;
        }
      } else if (tag === 'move') {
        const actor = parts[2] || '';
        const moveId = toID(parts[3] || '');

        if (actor.startsWith(playerSlot)) {
          if (PIVOT_MOVES.has(moveId)) {
            this.rawMetrics.pivotMoves++;
          } else if (SETUP_MOVES.has(moveId)) {
            this.rawMetrics.setupMoves++;
          } else if (HAZARD_MOVES.has(moveId)) {
            this.rawMetrics.hazards++;
          } else if (RECOVERY_MOVES.has(moveId)) {
            this.rawMetrics.recoveryMoves++;
          } else if (SPEED_CONTROL_MOVES.has(moveId)) {
            this.rawMetrics.speedControlMoves++;
          } else if (REDIRECTION_MOVES.has(moveId)) {
            this.rawMetrics.redirectionMoves++;
          } else if (DISRUPTION_MOVES.has(moveId)) {
            this.rawMetrics.disruptionMoves++;
          } else {
            // General offensive / utility move
            this.rawMetrics.attacks++;
          }
        }
      } else if (tag === '-terastallize') {
        const actor = parts[2] || '';
        if (actor.startsWith(playerSlot)) {
          if (currentTurn <= 3) {
            this.rawMetrics.earlyTeraCount++;
          } else {
            this.rawMetrics.lateTeraCount++;
          }
        }
      }
    }

    this.rawMetrics.totalTurns += (turnCount || 10);
    this.replaysAnalyzed++;
    return this.calculateProfile();
  }

  /**
   * Diagnostic Questionnaire: Calculates profile from quiz answers
   * @param {Object} answers - Answers { tempo: 1-5, aggression: 1-5, riskTolerance: 1-5, pivotPref: 1-5, formatFocus: 'singles'|'doubles' }
   */
  profileFromQuiz(answers) {
    const {
      pace = 3,           // 1 = ultra slow stall, 5 = hyper offensive sweep
      aggression = 3,     // 1 = passive defensive, 5 = explosive attack
      switching = 3,      // 1 = stay and hit, 5 = high tempo pivot / volt-turn
      speedStrategy = 3,  // 1 = trick room / slow bulk, 5 = tailwind / fastest speed tier
      teraHabit = 3       // 1 = reactive defensive tera, 5 = turn 1 offensive tera
    } = answers;

    // Synthesize mock metrics corresponding to responses
    const hoScore = Math.min(100, Math.round((pace * 12) + (aggression * 8)));
    const boScore = Math.min(100, Math.round((switching * 10) + (aggression * 6) + (pace * 4)));
    const balanceScore = Math.min(100, Math.round(((6 - pace) * 8) + (switching * 8) + 20));
    const stallScore = Math.min(100, Math.round(((6 - pace) * 14) + ((6 - aggression) * 6)));
    const trickRoomScore = Math.min(100, Math.round(((6 - speedStrategy) * 15) + (pace <= 2 ? 25 : 0)));
    const tailwindAggro = Math.min(100, Math.round((speedStrategy * 12) + (aggression * 8)));

    return this.formatProfile({
      hyperOffense: hoScore,
      bulkyOffense: boScore,
      balance: balanceScore,
      stall: stallScore,
      trickRoom: trickRoomScore,
      tailwindAggro: tailwindAggro
    }, 'diagnostic_quiz');
  }

  /**
   * Calculates archetype scores from ingested replays
   */
  calculateProfile() {
    const matches = Math.max(1, this.rawMetrics.totalMatches);
    const avgTurns = this.rawMetrics.totalTurns / matches;
    const totalActions = Math.max(1, 
      this.rawMetrics.attacks + 
      this.rawMetrics.setupMoves + 
      this.rawMetrics.hazards + 
      this.rawMetrics.recoveryMoves + 
      this.rawMetrics.pivotMoves +
      this.rawMetrics.disruptionMoves
    );

    const attackRatio = this.rawMetrics.attacks / totalActions;
    const setupRatio = this.rawMetrics.setupMoves / totalActions;
    const recoveryRatio = this.rawMetrics.recoveryMoves / totalActions;
    const pivotRatio = this.rawMetrics.pivotMoves / totalActions;
    const hardSwitchRate = this.rawMetrics.hardSwitches / Math.max(1, this.rawMetrics.totalTurns);

    // Hyper Offense: Short games (<15 turns), high attack & setup, low recovery
    let ho = Math.round(
      Math.max(0, (20 - avgTurns) * 3) +
      (attackRatio * 40) +
      (setupRatio * 40) -
      (recoveryRatio * 50)
    );

    // Bulky Offense: Moderate turns (15-25), high pivot moves, steady attack, low stall
    let bo = Math.round(
      (pivotRatio * 50) +
      (attackRatio * 30) +
      (hardSwitchRate * 20) +
      (avgTurns >= 12 && avgTurns <= 24 ? 20 : 0)
    );

    // Balance: Standard turns (18-30), balanced hazards + recovery + pivots
    let balance = Math.round(
      (recoveryRatio * 30) +
      (pivotRatio * 30) +
      (hardSwitchRate * 20) +
      (avgTurns >= 18 ? 20 : 0)
    );

    // Stall: High turns (>25), high recovery, low attacks, high switches
    let stall = Math.round(
      Math.max(0, (avgTurns - 20) * 3) +
      (recoveryRatio * 60) -
      (attackRatio * 30)
    );

    // Trick Room: High disruption / speed control, low raw speed
    let trickRoom = Math.round(
      (this.rawMetrics.speedControlMoves / totalActions * 80) +
      (this.rawMetrics.redirectionMoves / totalActions * 40)
    );

    // Tailwind Aggro: Early tera + attack + speed control
    let tailwind = Math.round(
      (this.rawMetrics.earlyTeraCount / matches * 30) +
      (attackRatio * 40) +
      (this.rawMetrics.speedControlMoves / totalActions * 40)
    );

    // Normalize between 10 and 99
    const clamp = (v) => Math.min(99, Math.max(10, v));

    return this.formatProfile({
      hyperOffense: clamp(ho),
      bulkyOffense: clamp(bo),
      balance: clamp(balance),
      stall: clamp(stall),
      trickRoom: clamp(trickRoom),
      tailwindAggro: clamp(tailwind)
    }, 'replay_analysis');
  }

  formatProfile(scores, source) {
    // Determine dominant archetype
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sorted[0];
    const secondary = sorted[1];

    const archetypeLabels = {
      hyperOffense: 'Hyper Offense (HO)',
      bulkyOffense: 'Bulky Offense (BO)',
      balance: 'Balanced Positioning',
      stall: 'Defensive Attrition / Stall',
      trickRoom: 'Trick Room / Hard Position',
      tailwindAggro: 'Tailwind Hyper Aggro'
    };

    const playstyleDescriptions = {
      hyperOffense: 'Prefers relentless offensive pressure, hazard setup leads, rapid setup sweepers, and decisive early-game trades.',
      bulkyOffense: 'Favors durable hitters with pivoting moves (U-turn / Parting Shot) to maintain momentum while punishing switches.',
      balance: 'Excels at structured play: a rock-solid defensive backbone, hazard control, and dedicated wallbreakers.',
      stall: 'Patient, reactive pilot who wears down opponents with status, hazard chip damage, and reliable recovery loops.',
      trickRoom: 'Master of speed inversion and board control, using bulky slow heavy-hitters and redirection.',
      tailwindAggro: 'Dominates with explosive speed control, high-impact spreads, and early burst damage to overwhelm opponent boards.'
    };

    return {
      source,
      scores,
      primaryArchetype: {
        id: primary[0],
        name: archetypeLabels[primary[0]],
        confidence: primary[1],
        description: playstyleDescriptions[primary[0]]
      },
      secondaryArchetype: {
        id: secondary[0],
        name: archetypeLabels[secondary[0]],
        confidence: secondary[1]
      },
      preferredTempo: primary[0] === 'hyperOffense' || primary[0] === 'tailwindAggro' ? 'Fast' : (primary[0] === 'stall' ? 'Slow' : 'Medium'),
      pivotPreference: scores.bulkyOffense > 60 || scores.balance > 60 ? 'High' : 'Moderate',
      metrics: { ...this.rawMetrics }
    };
  }
}
