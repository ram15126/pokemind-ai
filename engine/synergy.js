import { ALL_TYPES, getDefensiveMultiplier, getSpecies, toID } from './data.js';

export class SynergyEngine {
  constructor(gen = 9) {
    this.gen = gen;
  }

  /**
   * Analyzes the 18-type defensive profile of a team
   * @param {Array} team - Array of Pokemon objects or names
   */
  analyzeDefensiveProfile(team) {
    const typeAnalysis = {};
    for (const type of ALL_TYPES) {
      typeAnalysis[type] = {
        weak: 0,        // 2x or 4x
        quadWeak: 0,    // 4x
        resists: 0,     // 0.5x or 0.25x
        immune: 0       // 0x
      };
    }

    for (const mon of team) {
      const speciesName = typeof mon === 'string' ? mon : (mon.species || mon.name);
      const data = getSpecies(speciesName, this.gen);
      if (!data || !data.types) continue;

      for (const atkType of ALL_TYPES) {
        const mult = getDefensiveMultiplier(atkType, data.types);
        if (mult === 0) {
          typeAnalysis[atkType].immune++;
        } else if (mult >= 4) {
          typeAnalysis[atkType].weak++;
          typeAnalysis[atkType].quadWeak++;
        } else if (mult > 1) {
          typeAnalysis[atkType].weak++;
        } else if (mult < 1) {
          typeAnalysis[atkType].resists++;
        }
      }
    }

    // Score defensive health
    let penalty = 0;
    let bonus = 0;
    const criticalVulnerabilities = [];

    for (const [type, stats] of Object.entries(typeAnalysis)) {
      // Net vulnerability = weak - (resists + immune * 1.5)
      const net = stats.weak - (stats.resists + (stats.immune * 1.5));
      if (stats.weak >= 3 && stats.immune === 0 && stats.resists <= 1) {
        criticalVulnerabilities.push({
          type,
          weakCount: stats.weak,
          hasImmunity: stats.immune > 0,
          severity: stats.weak >= 4 ? 'CRITICAL' : 'HIGH'
        });
        // Exponential penalty for stacking shared unresisted weaknesses
        penalty += (stats.weak * stats.weak * 5);
      } else if (net > 0) {
        penalty += (net * 5);
      }

      // Bonus for good immunities (Ground, Ghost, Fairy, Dragon)
      if (stats.immune > 0) bonus += (stats.immune * 6);
      if (stats.resists >= 2) bonus += (stats.resists * 3);
    }

    const rawScore = 85 + bonus - penalty;
    const score = Math.max(10, Math.min(100, Math.round(rawScore)));

    return {
      score,
      criticalVulnerabilities,
      typeMatrix: typeAnalysis
    };
  }

  /**
   * Evaluates offensive STAB coverage across all 18 types
   */
  analyzeOffensiveCoverage(team) {
    const coveredSuperEffective = new Set();
    const teamTypes = new Set();

    for (const mon of team) {
      const speciesName = typeof mon === 'string' ? mon : (mon.species || mon.name);
      const data = getSpecies(speciesName, this.gen);
      if (!data || !data.types) continue;

      for (const t of data.types) {
        teamTypes.add(t);
        // What does this STAB hit super-effectively?
        for (const targetType of ALL_TYPES) {
          const mult = getDefensiveMultiplier(t, [targetType]);
          if (mult > 1) {
            coveredSuperEffective.add(targetType);
          }
        }
      }
    }

    // 18 types total
    const coverageCount = coveredSuperEffective.size;
    const uncovered = ALL_TYPES.filter(t => !coveredSuperEffective.has(t));
    const score = Math.min(100, Math.round((coverageCount / 18) * 100));

    return {
      score,
      coveredCount: coverageCount,
      coveredTypes: Array.from(coveredSuperEffective),
      uncoveredTypes: uncovered,
      uniqueStabCount: teamTypes.size
    };
  }

  /**
   * Evaluates team speed tier distribution
   */
  analyzeSpeedTiers(team) {
    const speeds = [];
    for (const mon of team) {
      const speciesName = typeof mon === 'string' ? mon : (mon.species || mon.name);
      const data = getSpecies(speciesName, this.gen);
      if (data?.baseStats) {
        speeds.push({
          name: data.name,
          spe: data.baseStats.spe
        });
      }
    }

    speeds.sort((a, b) => b.spe - a.spe);

    const fastest = speeds[0]?.spe || 0;
    const slowest = speeds[speeds.length - 1]?.spe || 0;
    const avgSpeed = Math.round(speeds.reduce((sum, s) => sum + s.spe, 0) / Math.max(1, speeds.length));

    const tiers = {
      blistering: speeds.filter(s => s.spe >= 120).length,
      fast: speeds.filter(s => s.spe >= 100 && s.spe < 120).length,
      mid: speeds.filter(s => s.spe >= 70 && s.spe < 100).length,
      bulkySlow: speeds.filter(s => s.spe < 70).length
    };

    return {
      fastest,
      slowest,
      avgSpeed,
      tiers,
      speeds
    };
  }

  /**
   * Master Synergy Evaluation
   */
  evaluateTeam(team, format = 'singles') {
    const defense = this.analyzeDefensiveProfile(team);
    const offense = this.analyzeOffensiveCoverage(team);
    const speed = this.analyzeSpeedTiers(team);

    // Composite fitness score
    const compositeScore = Math.round(
      (defense.score * 0.45) +
      (offense.score * 0.35) +
      (Math.min(100, offense.uniqueStabCount * 12) * 0.20)
    );

    return {
      compositeScore,
      defense,
      offense,
      speed,
      rating: compositeScore >= 85 ? 'S-Tier Synergy' : (compositeScore >= 75 ? 'A-Tier Strong' : (compositeScore >= 60 ? 'B-Tier Viable' : 'C-Tier Flawed'))
    };
  }
}
