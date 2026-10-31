import { Dex } from '@pkmn/dex';

/**
 * Competitive Pokemon Data Helper
 * Provides metadata for Gens 1-9, Restricted Legendaries, Paradoxes, Sub-Legendaries, and Meta Roles.
 */

export const RESTRICTED_LEGENDARIES = new Set([
  'mewtwo', 'lugia', 'hooh', 'kyogre', 'groudon', 'rayquaza',
  'dialga', 'dialgaorigin', 'palkia', 'palkiaorigin', 'giratina', 'giratinaorigin',
  'reshiram', 'zekrom', 'kyurem', 'kyuremwhite', 'kyuremblack',
  'xerneas', 'yveltal', 'zygarde', 'zygardecomplete',
  'solgaleo', 'lunala', 'necrozma', 'necrozmaduskmane', 'necrozmadawnwings', 'necrozmaultra',
  'zacian', 'zaciancrowned', 'zamazenta', 'zamazentacrowned', 'eternatus',
  'calyrex', 'calyrexice', 'calyrexshadow', 'koraidon', 'miraidon', 'terapagos'
]);

export const PARADOX_POKEMON = new Set([
  'greattusk', 'screamtail', 'brutebonnet', 'fluttermane', 'slitherwing', 'sandyshocks',
  'roaringmoon', 'irontreads', 'ironbundle', 'ironhands', 'ironjugulis', 'ironmoth',
  'ironthorns', 'ironvaliant', 'walkingwake', 'ironleaves', 'gougingfire', 'ragingbolt',
  'ironboulder', 'ironcrown'
]);

export const SUB_LEGENDARIES = new Set([
  'articuno', 'zapdos', 'moltres', 'raikou', 'entei', 'suicune',
  'regirock', 'regice', 'registeel', 'latias', 'latios', 'uxie', 'mesprit', 'azelf',
  'heatran', 'regigigas', 'cresselia', 'cobalion', 'terrakion', 'virizion', 'tornadus',
  'thundurus', 'landorus', 'landorustherian', 'tornadustherian', 'thundurustherian',
  'type_null', 'silvally', 'tapukoko', 'tapulele', 'tapubulu', 'tapufini',
  'nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord',
  'poipole', 'naganadel', 'stakataka', 'blacephalon', 'kubfu', 'urshifu', 'urshifurapidstrike',
  'regieleki', 'regidrago', 'glastrier', 'spectrier', 'wochien', 'chienpao', 'tinglu', 'chiyu',
  'okidogi', 'monkidori', 'fezandipiti', 'ogerpon', 'ogerponwellspring', 'ogerponhearthflame', 'ogerponcornerstone'
]);

export const TYPE_CHART = {
  Normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  Fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  Water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  Electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  Grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  Ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  Fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  Poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  Ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  Flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  Psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  Bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  Rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  Ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  Dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  Dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  Steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  Fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 }
};

export const ALL_TYPES = Object.keys(TYPE_CHART);

/**
 * Calculates defensive effectiveness of an attacking type against a Pokemon's typing
 */
export function getDefensiveMultiplier(attackingType, defendingTypes) {
  let mult = 1.0;
  const atk = attackingType.charAt(0).toUpperCase() + attackingType.slice(1).toLowerCase();
  const atkChart = TYPE_CHART[atk] || {};
  
  for (const defType of defendingTypes) {
    const dLower = defType.toLowerCase();
    if (dLower in atkChart) {
      mult *= atkChart[dLower];
    }
  }
  return mult;
}

/**
 * Clean normalize id helper
 */
export function toID(text) {
  return ('' + text).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fetch species info with cached lookup
 */
export function getSpecies(name, gen = 9) {
  return Dex.forGen(gen).species.get(name);
}
