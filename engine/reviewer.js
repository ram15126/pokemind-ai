import { toID } from './data.js';

/**
 * Chess.com Style Competitive Post-Match Game Reviewer
 */
export class GameReviewer {
  constructor() {}

  /**
   * Reviews a completed battle history and produces an accuracy report card
   * @param {Object} battleData - { turnHistory, fullLogText, winner }
   */
  reviewMatch(battleData) {
    const { turnHistory = [], fullLogText = '', winner = 'Player' } = battleData;

    const timeline = [];
    let accuracyScore = 100;
    let bestCount = 0;
    let brilliantCount = 0;
    let inaccuracyCount = 0;
    let mistakeCount = 0;
    let blunderCount = 0;

    let turningPoint = { turn: 1, description: 'Battle opened with lead positioning.' };
    let biggestSwing = 0;

    for (const record of turnHistory) {
      const logs = record.logs || [];
      const turnNum = record.turn;
      const playerAction = record.playerAction || '';

      let turnType = 'GOOD';
      let feedback = 'Solid standard competitive execution.';

      const isSuperEffective = logs.some(l => l.includes('|-supereffective|p2a'));
      const isResisted = logs.some(l => l.includes('|-resisted|p2a'));
      const isImmune = logs.some(l => l.includes('|-immune|p2a'));
      const p2Fainted = logs.some(l => l.includes('|faint|p2a'));
      const p1Fainted = logs.some(l => l.includes('|faint|p1a'));
      const p1SuperEffectiveTaken = logs.some(l => l.includes('|-supereffective|p1a'));
      const usedSetup = logs.some(l => l.includes('|Swords Dance') || l.includes('|Quiver Dance') || l.includes('|Nasty Plot') || l.includes('|Dragon Dance') || l.includes('|Aurora Veil'));

      if (p2Fainted) {
        turnType = 'BEST';
        feedback = 'Clean knockout secured! Maintained decisive board control.';
        bestCount++;
      } else if (usedSetup && !p1Fainted) {
        turnType = 'BRILLIANT';
        feedback = 'Brilliant setup timing! Created an overwhelming offensive win-condition.';
        brilliantCount++;
        accuracyScore = Math.min(100, accuracyScore + 2);
      } else if (isImmune) {
        turnType = 'BLUNDER';
        feedback = 'Blunder: Attacked directly into a known type immunity (0x damage).';
        blunderCount++;
        accuracyScore -= 18;
      } else if (p1Fainted && p1SuperEffectiveTaken && playerAction.startsWith('switch')) {
        turnType = 'BLUNDER';
        feedback = 'Blunder: Hard-switched into an obvious super-effective attack and lost your Pokémon.';
        blunderCount++;
        accuracyScore -= 20;
      } else if (isSuperEffective) {
        turnType = 'BEST';
        feedback = 'Optimal super-effective targeting. Forced the opponent onto the back foot.';
        bestCount++;
      } else if (isResisted && !playerAction.startsWith('switch')) {
        turnType = 'INACCURACY';
        feedback = 'Inaccuracy: Attacked into a resisted typing when a pivot move or coverage attack was preferred.';
        inaccuracyCount++;
        accuracyScore -= 6;
      } else if (p1Fainted) {
        turnType = 'MISTAKE';
        feedback = 'Mistake: Allowed key team member to faint without forcing an equal trade.';
        mistakeCount++;
        accuracyScore -= 10;
      } else {
        turnType = 'GOOD';
        bestCount++;
      }

      // Check turning point
      if (p2Fainted && turnNum > biggestSwing) {
        biggestSwing = turnNum;
        turningPoint = {
          turn: turnNum,
          description: `Turn ${turnNum}: Knocked out opponent key piece to seize match momentum.`
        };
      }

      timeline.push({
        turn: turnNum,
        playerAction,
        type: turnType,
        feedback
      });
    }

    const finalAccuracy = Math.max(35, Math.min(99, Math.round(accuracyScore)));

    let grade = 'A';
    if (finalAccuracy >= 90) grade = 'S';
    else if (finalAccuracy >= 80) grade = 'A';
    else if (finalAccuracy >= 70) grade = 'B';
    else if (finalAccuracy >= 55) grade = 'C';
    else grade = 'D';

    // Coaching advice
    const lessons = [];
    if (blunderCount > 0) {
      lessons.push('Predict defensive immunities (e.g. Ground vs Flying, Ghost vs Normal) before committing to locked attacks.');
    }
    if (inaccuracyCount >= 2) {
      lessons.push('Use U-turn or Volt Switch on predicted switches rather than firing resisted STAB moves.');
    }
    if (brilliantCount > 0) {
      lessons.push('Excellent setup pacing: Continue looking for free turns behind screens or forced opponent switches.');
    } else {
      lessons.push('Look for more setup windows (Aurora Veil / Swords Dance) when forcing opposing defensive switches.');
    }
    lessons.push(winner === 'Player' ? 'Victory secured: Solid endgame execution.' : 'Defeat: Focus on preserving your defensive pivot to absorb super-effective hits.');

    return {
      accuracyScore: finalAccuracy,
      grade,
      winner,
      totalTurns: turnHistory.length,
      stats: {
        brilliant: brilliantCount,
        best: bestCount,
        inaccuracies: inaccuracyCount,
        mistakes: mistakeCount,
        blunders: blunderCount
      },
      turningPoint,
      lessons: lessons.slice(0, 3),
      timeline
    };
  }
}
