/**
 * Competitive Pokemon Strategy Coach & Matchup Analyst
 * Generates actionable piloting advice, lead pairings, Tera priority, and win-conditions.
 */

export class StrategyCoach {
  constructor() {}

  /**
   * Generates a complete battle playbook for the given team
   */
  generatePlaybook(teamData) {
    const { team, format, targetPlaystyle, synergyReport } = teamData;
    const isDoubles = format === 'doubles';

    // 1. Identify team roles
    const roles = {
      hazardLeads: [],
      pivots: [],
      speedControl: [],
      wallbreakers: [],
      cleaners: [],
      walls: [],
      redirection: []
    };

    for (const mon of team) {
      const moves = mon.moves || [];
      const hasUturn = moves.some(m => ['U-turn', 'Volt Switch', 'Parting Shot', 'Flip Turn'].includes(m));
      const hasHazards = moves.some(m => ['Stealth Rock', 'Spikes', 'Toxic Spikes', 'Mortal Spin'].includes(m));
      const hasSpeedControl = moves.some(m => ['Tailwind', 'Trick Room', 'Icy Wind'].includes(m));
      const hasSetup = moves.some(m => ['Swords Dance', 'Nasty Plot', 'Quiver Dance', 'Dragon Dance'].includes(m));
      const hasRedirection = moves.some(m => ['Follow Me', 'Rage Powder'].includes(m));
      const isFast = (mon.evs?.spe || 0) >= 200 || ['Dragapult', 'Iron Valiant', 'Flutter Mane'].includes(mon.species);

      if (hasHazards || ['Glimmora', 'Ting-Lu'].includes(mon.species)) roles.hazardLeads.push(mon.species);
      if (hasUturn || ['Incineroar', 'Corviknight', 'Rillaboom', 'Pelipper'].includes(mon.species)) roles.pivots.push(mon.species);
      if (hasSpeedControl || ['Tornadus', 'Whimsicott', 'Farigiraf'].includes(mon.species)) roles.speedControl.push(mon.species);
      if (hasSetup || ['Gholdengo', 'Kingambit', 'Ursaluna', 'Ogerpon-Hearthflame'].includes(mon.species)) roles.wallbreakers.push(mon.species);
      if (isFast || ['Kingambit', 'Dragapult', 'Urshifu-Rapid-Strike'].includes(mon.species)) roles.cleaners.push(mon.species);
      if (hasRedirection) roles.redirection.push(mon.species);
      if (['Corviknight', 'Dondozo', 'Clodsire', 'Ting-Lu'].includes(mon.species)) roles.walls.push(mon.species);
    }

    // 2. Formulate Turn 1-5 Gameplan
    let gameplan = '';
    if (isDoubles) {
      if (targetPlaystyle.includes('Trick Room')) {
        gameplan = 'Set Trick Room on Turn 1 using redirection or Fake Out support. Once room is active, bring in slow heavy artillery (Ursaluna/Torkoal) to fire devastating spread moves.';
      } else if (targetPlaystyle.includes('Tailwind') || targetPlaystyle.includes('Hyper')) {
        gameplan = 'Seize board control immediately on Turn 1 via Tailwind or Fake Out. Pressure both opponent slots with high-impact spread moves and fast wallbreakers before their defenses stabilize.';
      } else {
        gameplan = 'Cycle Fake Out and Parting Shot/U-turn to constantly debuff opposing offensive threats. Win through superior positioning and favorable type switches.';
      }
    } else {
      if (targetPlaystyle.includes('Hyper Offense')) {
        gameplan = 'Establish hazard control on Turn 1-2. Deny opponent counter-hazards with fast Taunt or Spin. Immediately transition to wallbreakers to force trades and open paths for the late-game cleaner.';
      } else if (targetPlaystyle.includes('Stall') || targetPlaystyle.includes('Balance')) {
        gameplan = 'Deploy hazards patiently, scout opponent sets with defensive pivots, and spread status (Toxic/Burn). Absorb heavy hits with your defensive walls and heal back up with recovery loops.';
      } else {
        gameplan = 'Use fast pivots (U-turn/Volt Switch) to preserve momentum. Maintain hazard advantage and punish predicted switches with powerful STAB coverage.';
      }
    }

    // 3. Recommended Leads
    const leads = [];
    if (isDoubles) {
      const speedMon = roles.speedControl[0] || team[0].species;
      let supportMon = roles.pivots.find(p => p !== speedMon) || roles.redirection.find(r => r !== speedMon) || team.find(m => m.species !== speedMon)?.species || team[1].species;
      leads.push({
        matchup: 'Default / General Matchup',
        lead: `${speedMon} + ${supportMon}`,
        instruction: 'Use Fake Out / Tailwind to secure early speed advantage.'
      });
      const counterTR = roles.wallbreakers.find(w => w !== speedMon) || team.find(m => m.species !== speedMon)?.species || team[2].species;
      leads.push({
        matchup: 'Against Trick Room / Slow Archetypes',
        lead: `${speedMon} + ${counterTR}`,
        instruction: 'Taunt the opposing setter immediately or double-target them for a turn-1 knockout.'
      });
    } else {
      const hazardLead = roles.hazardLeads[0] || team[0].species;
      leads.push({
        matchup: 'Standard Lead',
        lead: hazardLead,
        instruction: 'Lay down hazards or deny opponent hazards with Taunt/Mortal Spin.'
      });
      if (roles.pivots.length > 0) {
        leads.push({
          matchup: 'Against Aggressive Matchups',
          lead: roles.pivots[0],
          instruction: 'Pivot out with U-turn / Volt Switch into an advantageous defensive resist.'
        });
      }
    }

    // 4. Terastallization Strategy
    const teraTips = [];
    for (const mon of team) {
      if (mon.teraType && ['Fire', 'Water', 'Ghost', 'Flying', 'Steel', 'Fighting'].includes(mon.teraType)) {
        if (['Ogerpon-Hearthflame', 'Gholdengo', 'Volcarona', 'Kingambit'].includes(mon.species)) {
          teraTips.push({
            pokemon: mon.species,
            recommendedTera: mon.teraType,
            usage: 'OFFENSIVE / CLUTCH',
            note: `Activate when setting up for game-ending sweep or to turn a 2HKO into a clean OHKO.`
          });
        } else if (['Incineroar', 'Corviknight', 'Tornadus'].includes(mon.species)) {
          teraTips.push({
            pokemon: mon.species,
            recommendedTera: mon.teraType,
            usage: 'DEFENSIVE SURPRISE',
            note: `Tera to shed critical weaknesses (e.g. Incineroar Tera Ghost to blank Fighting moves and immune Fake Out).`
          });
        }
      }
    }

    return {
      corePhilosophy: gameplan,
      targetTempo: isDoubles ? 'High Speed Board Control' : 'Momentum & Hazard Warfare',
      leads,
      terastallizationStrategy: teraTips.slice(0, 3),
      criticalVulnerabilities: synergyReport.defense.criticalVulnerabilities,
      winCondition: roles.cleaners[0] || roles.wallbreakers[0] || team[0].species
    };
  }
}
