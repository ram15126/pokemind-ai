import { Dex } from '@pkmn/dex';
import { RESTRICTED_LEGENDARIES, PARADOX_POKEMON, SUB_LEGENDARIES, toID } from './data.js';

export const REGULATION_PRESETS = {
  // Singles Presets
  'gen9ou': {
    name: 'Gen 9 Singles OU (Smogon)',
    format: 'singles',
    generation: 9,
    maxRestricted: 0,
    allowParadox: true,
    allowSubLegendaries: true,
    allowMythicals: true,
    allowTera: true,
    bannedSpecies: [
      'annihilape', 'archaludon', 'baxcalibur', 'chiyu', 'espathra', 'fluttermane',
      'gliscor', 'houndstone', 'ironbundle', 'kingambit', 'magearna', 'palafin',
      'roaringmoon', 'sneasler', 'ursalfabloodmoon', 'volcarona', 'zamazenta'
    ],
    bannedMoves: ['shedtail', 'lastrespects', 'batonpass'],
    bannedAbilities: ['arenatrap', 'shadowtag', 'moody', 'commander'],
    bannedItems: ['kingsrock', 'razorfang'],
    itemClause: false,
    speciesClause: true,
    teamSize: 6,
    bringSize: 6
  },
  'gen9ubers': {
    name: 'Gen 9 Singles Ubers',
    format: 'singles',
    generation: 9,
    maxRestricted: null, // Unlimited
    allowParadox: true,
    allowSubLegendaries: true,
    allowMythicals: true,
    allowTera: true,
    bannedSpecies: ['calyrexshadow', 'koraidon', 'miraidon'], // Ubers AG bans
    bannedMoves: ['batonpass'],
    bannedAbilities: ['moody'],
    bannedItems: [],
    itemClause: false,
    speciesClause: true,
    teamSize: 6,
    bringSize: 6
  },
  // Doubles / VGC Presets
  'vgc_regg': {
    name: 'VGC Regulation G (1 Restricted)',
    format: 'doubles',
    generation: 9,
    maxRestricted: 1,
    allowParadox: true,
    allowSubLegendaries: true,
    allowMythicals: false,
    allowTera: true,
    bannedSpecies: [],
    bannedMoves: [],
    bannedAbilities: [],
    bannedItems: [],
    itemClause: true,
    speciesClause: true,
    teamSize: 6,
    bringSize: 4
  },
  'vgc_regh': {
    name: 'VGC Regulation H (No Restricted, No Paradox, No Sub-Legendaries)',
    format: 'doubles',
    generation: 9,
    maxRestricted: 0,
    allowParadox: false,
    allowSubLegendaries: false,
    allowMythicals: false,
    allowTera: true,
    bannedSpecies: [],
    bannedMoves: [],
    bannedAbilities: [],
    bannedItems: [],
    itemClause: true,
    speciesClause: true,
    teamSize: 6,
    bringSize: 4
  },
  'doubles_ou': {
    name: 'Gen 9 Doubles OU',
    format: 'doubles',
    generation: 9,
    maxRestricted: 0,
    allowParadox: true,
    allowSubLegendaries: true,
    allowMythicals: true,
    allowTera: true,
    bannedSpecies: ['ironbundle', 'fluttermane', 'urshifurapidstrike'],
    bannedMoves: ['swagger', 'allyswitch'],
    bannedAbilities: ['commander'],
    bannedItems: [],
    itemClause: false,
    speciesClause: true,
    teamSize: 6,
    bringSize: 6
  }
};

export class RegulationEngine {
  constructor(config = {}) {
    this.config = this.buildConfig(config);
    this.dex = Dex.forGen(this.config.generation || 9);
  }

  buildConfig(userConfig) {
    let raw = {};
    if (typeof userConfig === 'string') {
      raw = REGULATION_PRESETS[userConfig.toLowerCase()] || {};
    } else if (userConfig && userConfig.preset) {
      raw = { ...(REGULATION_PRESETS[userConfig.preset.toLowerCase()] || {}), ...userConfig };
    } else if (userConfig) {
      raw = { ...userConfig };
    }

    return {
      name: raw.name || 'Custom Regulation',
      format: raw.format || 'singles',
      generation: raw.generation || 9,
      maxRestricted: raw.maxRestricted !== undefined ? raw.maxRestricted : 0,
      allowParadox: raw.allowParadox !== undefined ? raw.allowParadox : true,
      allowSubLegendaries: raw.allowSubLegendaries !== undefined ? raw.allowSubLegendaries : true,
      allowMythicals: raw.allowMythicals !== undefined ? raw.allowMythicals : false,
      allowTera: raw.allowTera !== undefined ? raw.allowTera : true,
      bannedSpecies: new Set((raw.bannedSpecies || []).map(toID)),
      bannedMoves: new Set((raw.bannedMoves || []).map(toID)),
      bannedItems: new Set((raw.bannedItems || []).map(toID)),
      bannedAbilities: new Set((raw.bannedAbilities || []).map(toID)),
      requiredSpecies: (raw.requiredSpecies || []).map(toID),
      itemClause: raw.itemClause !== undefined ? raw.itemClause : false,
      speciesClause: raw.speciesClause !== undefined ? raw.speciesClause : true,
      teamSize: raw.teamSize || 6,
      bringSize: raw.bringSize || (raw.format === 'doubles' ? 4 : 6)
    };
  }

  /**
   * Check if a single species is legal under this regulation
   */
  isSpeciesLegal(speciesInput) {
    const species = typeof speciesInput === 'string' ? this.dex.species.get(speciesInput) : speciesInput;
    if (!species || !species.exists) return { legal: false, reason: 'Species does not exist' };
    
    const id = toID(species.name);

    // Direct banlist
    if (this.config.bannedSpecies.has(id)) {
      return { legal: false, reason: `${species.name} is on the custom banlist` };
    }

    // Check mythicals
    const isMythical = ['mew', 'celebi', 'jirachi', 'deoxys', 'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus', 'victini', 'keldeo', 'meloetta', 'genesect', 'diancie', 'hoopa', 'volcanion', 'magearna', 'marshadow', 'zeraora', 'meltan', 'melmetal', 'zarude', 'pecharunt'].includes(id);
    if (isMythical && !this.config.allowMythicals) {
      return { legal: false, reason: `${species.name} is a Mythical Pokemon (not allowed)` };
    }

    // Check paradox
    if (PARADOX_POKEMON.has(id) && !this.config.allowParadox) {
      return { legal: false, reason: `${species.name} is a Paradox Pokemon (not allowed)` };
    }

    // Check sub-legendaries
    if (SUB_LEGENDARIES.has(id) && !this.config.allowSubLegendaries) {
      return { legal: false, reason: `${species.name} is a Sub-Legendary Pokemon (not allowed)` };
    }

    // Check restricted
    if (RESTRICTED_LEGENDARIES.has(id) && this.config.maxRestricted === 0) {
      return { legal: false, reason: `${species.name} is a Restricted Legendary (max allowed: 0)` };
    }

    // Check if fully evolved or competitive NFE (Eviolite users)
    const competitiveNFEs = new Set(['chansey', 'porygon2', 'dusclops', 'clefairy', 'murkrow', 'duraludon', 'gligar', 'electabuzz', 'magmar', 'torracat', 'cottonee']);
    if (species.nfe && !competitiveNFEs.has(id)) {
      return { legal: false, reason: `${species.name} is Not Fully Evolved` };
    }

    // Check base stat total viability floor (filter out caterpie, magikarp, etc.)
    const bst = Object.values(species.baseStats).reduce((a, b) => a + b, 0);
    if (bst < 420 && !competitiveNFEs.has(id)) {
      return { legal: false, reason: `${species.name} BST (${bst}) is below competitive baseline` };
    }

    return { legal: true };
  }

  /**
   * Returns list of all legal competitive species under this regulation
   */
  getLegalSpeciesList() {
    const legal = [];
    const allSpecies = this.dex.species.all();
    
    for (const species of allSpecies) {
      // Must be obtainable in this gen or standard tier
      if (species.isNonstandard && species.isNonstandard !== 'Unobtainable') continue;
      
      const check = this.isSpeciesLegal(species);
      if (check.legal) {
        legal.push({
          id: toID(species.name),
          name: species.name,
          types: species.types,
          baseStats: species.baseStats,
          bst: Object.values(species.baseStats).reduce((a, b) => a + b, 0),
          isRestricted: RESTRICTED_LEGENDARIES.has(toID(species.name)),
          isParadox: PARADOX_POKEMON.has(toID(species.name)),
          isSubLegendary: SUB_LEGENDARIES.has(toID(species.name))
        });
      }
    }
    return legal;
  }

  /**
   * Validates an entire 6-Pokemon team against the regulation
   */
  validateTeam(team) {
    const errors = [];
    if (!Array.isArray(team) || team.length !== this.config.teamSize) {
      errors.push(`Team must contain exactly ${this.config.teamSize} Pokemon (found ${team?.length || 0})`);
    }

    const seenSpecies = new Set();
    const seenItems = new Set();
    let restrictedCount = 0;

    for (let i = 0; i < (team || []).length; i++) {
      const mon = team[i];
      const monName = mon.species || mon.name;
      const monId = toID(monName);

      // 1. Legality check
      const legality = this.isSpeciesLegal(monName);
      if (!legality.legal) {
        errors.push(`Slot ${i + 1} (${monName}): ${legality.reason}`);
      }

      // 2. Species Clause
      if (this.config.speciesClause) {
        const speciesData = this.dex.species.get(monName);
        const baseSpeciesId = toID(speciesData?.baseSpecies || speciesData?.name || monName);
        if (seenSpecies.has(baseSpeciesId)) {
          errors.push(`Duplicate species detected: ${monName} shares base species (${baseSpeciesId}) violating Species Clause`);
        }
        seenSpecies.add(baseSpeciesId);
      }

      // 3. Item Clause
      if (this.config.itemClause && mon.item) {
        const itemId = toID(mon.item);
        if (seenItems.has(itemId)) {
          errors.push(`Duplicate item detected: ${mon.item} violates Item Clause`);
        }
        seenItems.add(itemId);
      }

      // 4. Restricted count
      if (RESTRICTED_LEGENDARIES.has(monId)) {
        restrictedCount++;
      }

      // 5. Banned Moves
      if (Array.isArray(mon.moves)) {
        for (const m of mon.moves) {
          if (this.config.bannedMoves.has(toID(m))) {
            errors.push(`Slot ${i + 1} (${monName}) carries banned move: ${m}`);
          }
        }
      }

      // 6. Banned Ability
      if (mon.ability && this.config.bannedAbilities.has(toID(mon.ability))) {
        errors.push(`Slot ${i + 1} (${monName}) has banned ability: ${mon.ability}`);
      }

      // 7. Banned Item
      if (mon.item && this.config.bannedItems.has(toID(mon.item))) {
        errors.push(`Slot ${i + 1} (${monName}) holds banned item: ${mon.item}`);
      }
    }

    if (this.config.maxRestricted !== null && restrictedCount > this.config.maxRestricted) {
      errors.push(`Too many restricted legendaries: Found ${restrictedCount}, maximum allowed is ${this.config.maxRestricted}`);
    }

    // Check required species if any
    for (const req of this.config.requiredSpecies) {
      if (!seenSpecies.has(req)) {
        errors.push(`Team must include required species: ${req}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      restrictedCount,
      regulationName: this.config.name,
      format: this.config.format
    };
  }
}
