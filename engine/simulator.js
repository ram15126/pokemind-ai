import { Battle, Teams } from '@pkmn/sim';
import { Dex } from '@pkmn/dex';
import { toID } from './data.js';

/**
 * Competitive Opponent Bot Teams for Practice
 */
export const PRACTICE_BOT_TEAMS = {
  'ou_balanced': [
    { name: 'Great Tusk', species: 'Great Tusk', item: 'Booster Energy', ability: 'Protosynthesis', nature: 'Jolly', evs: { atk: 252, spe: 252, def: 4 }, moves: ['headlongrush', 'closecombat', 'icespinner', 'rapidspin'] },
    { name: 'Gholdengo', species: 'Gholdengo', item: 'Choice Specs', ability: 'Good as Gold', nature: 'Timid', evs: { spa: 252, spe: 252, def: 4 }, moves: ['makeitrain', 'shadowball', 'focusblast', 'trick'] },
    { name: 'Kingambit', species: 'Kingambit', item: 'Leftovers', ability: 'Supreme Overlord', nature: 'Adamant', evs: { hp: 212, atk: 252, spe: 44 }, moves: ['kowtowcleave', 'suckerpunch', 'ironhead', 'swordsdance'] },
    { name: 'Dragapult', species: 'Dragapult', item: 'Choice Specs', ability: 'Infiltrator', nature: 'Timid', evs: { spa: 252, spe: 252, def: 4 }, moves: ['dracometeor', 'shadowball', 'flamethrower', 'uturn'] },
    { name: 'Corviknight', species: 'Corviknight', item: 'Rocky Helmet', ability: 'Pressure', nature: 'Impish', evs: { hp: 248, def: 252, spd: 8 }, moves: ['bravebird', 'roost', 'defog', 'uturn'] },
    { name: 'Ogerpon-Wellspring', species: 'Ogerpon-Wellspring', item: 'Wellspring Mask', ability: 'Water Absorb', nature: 'Jolly', evs: { atk: 252, spe: 252, def: 4 }, moves: ['ivycudgel', 'hornleech', 'knockoff', 'swordsdance'] }
  ],
  'rain_offense': [
    { name: 'Pelipper', species: 'Pelipper', item: 'Damp Rock', ability: 'Drizzle', nature: 'Bold', evs: { hp: 248, def: 252, spa: 8 }, moves: ['hurricane', 'hydropump', 'uturn', 'roost'] },
    { name: 'Archaludon', species: 'Archaludon', item: 'Assault Vest', ability: 'Stamina', nature: 'Modest', evs: { hp: 252, spa: 252, spd: 4 }, moves: ['electroshot', 'dracometeor', 'flashcannon', 'bodypress'] },
    { name: 'Urshifu-Rapid-Strike', species: 'Urshifu-Rapid-Strike', item: 'Choice Scarf', ability: 'Unseen Fist', nature: 'Jolly', evs: { atk: 252, spe: 252, def: 4 }, moves: ['surgingstrikes', 'closecombat', 'aquajet', 'uturn'] },
    { name: 'Raging Bolt', species: 'Raging Bolt', item: 'Leftovers', ability: 'Protosynthesis', nature: 'Modest', evs: { hp: 252, spa: 252, spd: 4 }, moves: ['thunderclap', 'dragonpulse', 'calmmind', 'thunderbolt'] },
    { name: 'Great Tusk', species: 'Great Tusk', item: 'Booster Energy', ability: 'Protosynthesis', nature: 'Jolly', evs: { atk: 252, spe: 252, def: 4 }, moves: ['headlongrush', 'closecombat', 'icespinner', 'rapidspin'] },
    { name: 'Kingambit', species: 'Kingambit', item: 'Leftovers', ability: 'Supreme Overlord', nature: 'Adamant', evs: { hp: 212, atk: 252, spe: 44 }, moves: ['kowtowcleave', 'suckerpunch', 'ironhead', 'swordsdance'] }
  ]
};

export class BattleSimulator {
  constructor(options = {}) {
    this.id = 'battle_' + Math.random().toString(36).substring(2, 9);
    this.format = options.format || 'gen9customgame';
    this.turnHistory = [];
    this.rawLogs = [];

    // Format player and bot teams
    const p1Raw = options.userTeam || PRACTICE_BOT_TEAMS['ou_balanced'];
    const p2Raw = options.botTeam || (options.botPreset ? PRACTICE_BOT_TEAMS[options.botPreset] : PRACTICE_BOT_TEAMS['ou_balanced']);

    this.p1Pack = this.formatTeamForSim(p1Raw);
    this.p2Pack = this.formatTeamForSim(p2Raw);

    this.battle = new Battle({ formatid: this.format });
    this.battle.setPlayer('p1', { name: 'Player', team: this.p1Pack });
    this.battle.setPlayer('p2', { name: 'AI Bot', team: this.p2Pack });

    // Handle Team Preview
    if (this.battle.p1.requestState === 'teampreview') {
      this.battle.choose('p1', 'default');
      this.battle.choose('p2', 'default');
    }

    this.logPointer = 0;
    this.recordTurnLog();
  }

  formatTeamForSim(team) {
    const formatted = team.map(mon => ({
      name: mon.name || mon.species,
      species: mon.species || mon.name,
      item: mon.item ? toID(mon.item) : undefined,
      ability: mon.ability ? toID(mon.ability) : undefined,
      nature: mon.nature || 'Jolly',
      evs: mon.evs || { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
      moves: (mon.moves || ['Earthquake', 'Close Combat', 'Ice Spinner', 'Protect']).map(m => toID(m)),
      teraType: mon.teraType || undefined
    }));
    return Teams.pack(formatted);
  }

  recordTurnLog() {
    const newLogs = this.battle.log.slice(this.logPointer);
    this.rawLogs.push(...newLogs);
    this.logPointer = this.battle.log.length;
    return newLogs;
  }

  /**
   * Smart AI Bot Decision Engine
   */
  getBotAction() {
    const botSide = this.battle.p2;
    const playerSide = this.battle.p1;
    const botActive = botSide.active[0];
    const playerActive = playerSide.active[0];

    if (!botActive || botActive.fainted) {
      // Must switch to next alive mon
      const availableBench = botSide.pokemon
        .map((p, idx) => ({ p, idx: idx + 1 }))
        .filter(item => !item.p.fainted && !item.p.isActive);
      if (availableBench.length > 0) {
        return `switch ${availableBench[0].idx}`;
      }
      return 'default';
    }

    if (!playerActive) return 'move 1';

    // 1. Check if bot has a move that KOs the player
    const moves = botActive.moves;
    let bestMoveIdx = 1;
    let highestPower = -1;

    for (let i = 0; i < moves.length; i++) {
      const moveData = Dex.forGen(9).moves.get(moves[i]);
      let estimatedDmg = moveData.basePower || 60;

      // STAB check
      if (botActive.types.includes(moveData.type)) estimatedDmg *= 1.5;

      // Type effectiveness
      let mult = 1;
      const typeChart = Dex.forGen(9).types.get(moveData.type);
      for (const defType of playerActive.types) {
        if (typeChart.damageTaken[defType] === 1) mult *= 2;
        if (typeChart.damageTaken[defType] === 2) mult *= 0.5;
        if (typeChart.damageTaken[defType] === 3) mult = 0;
      }
      estimatedDmg *= mult;

      if (estimatedDmg > highestPower) {
        highestPower = estimatedDmg;
        bestMoveIdx = i + 1;
      }
    }

    return `move ${bestMoveIdx}`;
  }

  /**
   * Process a turn choice from the user
   * @param {Object} action - { type: 'move'|'switch', index: number, tera?: boolean }
   */
  submitTurn(action) {
    if (this.battle.ended) {
      return { ended: true, state: this.getState() };
    }

    let p1Choice = 'default';
    if (action.type === 'switch') {
      p1Choice = `switch ${action.index}`;
    } else {
      p1Choice = `move ${action.index}${action.tera ? ' terastallize' : ''}`;
    }

    const botChoice = this.getBotAction();

    // Check if player needs to switch due to faint
    const p1Active = this.battle.p1.active[0];
    if (p1Active && p1Active.fainted) {
      this.battle.choose('p1', `switch ${action.index}`);
    } else {
      this.battle.choose('p1', p1Choice);
      this.battle.choose('p2', botChoice);
    }

    const newLogs = this.recordTurnLog();

    // Record turn in history for reviewer
    this.turnHistory.push({
      turn: this.battle.turn,
      playerAction: p1Choice,
      botAction: botChoice,
      logs: newLogs
    });

    return {
      ended: this.battle.ended,
      winner: this.battle.winner,
      state: this.getState()
    };
  }

  /**
   * Get current battle state for UI
   */
  getState() {
    const p1Active = this.battle.p1.active[0];
    const p2Active = this.battle.p2.active[0];

    const formatPokemon = (p, isPlayer = true) => {
      if (!p) return null;
      return {
        name: p.name || p.species.name,
        species: p.species.name,
        hp: p.hp,
        maxhp: p.maxhp,
        hpPercent: Math.max(0, Math.round((p.hp / Math.max(1, p.maxhp)) * 100)),
        types: p.types,
        fainted: p.fainted,
        status: p.status || null,
        ability: p.ability,
        item: isPlayer ? p.item : undefined,
        moves: isPlayer ? p.moveSlots.map((m, i) => ({
          name: m.move,
          index: i + 1,
          pp: m.pp,
          maxpp: m.maxpp,
          disabled: m.disabled,
          type: Dex.forGen(9).moves.get(m.move).type
        })) : []
      };
    };

    return {
      battleId: this.id,
      turn: this.battle.turn,
      ended: this.battle.ended,
      winner: this.battle.winner || null,
      player: {
        active: formatPokemon(p1Active, true),
        team: this.battle.p1.pokemon.map((p, idx) => ({
          ...formatPokemon(p, true),
          slot: idx + 1,
          isActive: p.isActive
        }))
      },
      bot: {
        active: formatPokemon(p2Active, false),
        team: this.battle.p2.pokemon.map((p, idx) => ({
          species: p.species.name,
          hpPercent: Math.max(0, Math.round((p.hp / Math.max(1, p.maxhp)) * 100)),
          fainted: p.fainted,
          slot: idx + 1,
          isActive: p.isActive
        }))
      },
      recentLogs: this.rawLogs.slice(-12),
      fullLogText: this.battle.log.join('\n')
    };
  }
}
