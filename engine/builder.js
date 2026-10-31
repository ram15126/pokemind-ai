import { Dex } from '@pkmn/dex';
import { Sets } from '@pkmn/sets';
import { RegulationEngine } from './regulation.js';
import { SynergyEngine } from './synergy.js';
import { PlayerProfiler } from './profiler.js';
import { toID, getSpecies } from './data.js';

/**
 * Competitive Moveset Catalog for Top Tier Singles & Doubles Meta
 */
export const COMPETITIVE_SETS = {
  // Singles & Doubles Staple Sets
  'greattusk': {
    species: 'Great Tusk',
    item: 'Booster Energy',
    ability: 'Protosynthesis',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Headlong Rush', 'Close Combat', 'Ice Spinner', 'Rapid Spin'],
    teraType: 'Ice',
    roles: ['hazard_remover', 'physical_sweeper', 'offensive_pivot'],
    archetypes: ['hyperOffense', 'bulkyOffense', 'balance']
  },
  'gholdengo': {
    species: 'Gholdengo',
    item: 'Choice Specs',
    ability: 'Good as Gold',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Make It Rain', 'Shadow Ball', 'Focus Blast', 'Trick'],
    teraType: 'Fighting',
    roles: ['special_wallbreaker', 'hazard_blocker'],
    archetypes: ['hyperOffense', 'bulkyOffense', 'balance']
  },
  'dragapult': {
    species: 'Dragapult',
    item: 'Choice Specs',
    ability: 'Infiltrator',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Draco Meteor', 'Shadow Ball', 'Flamethrower', 'U-turn'],
    teraType: 'Ghost',
    roles: ['speed_control', 'offensive_pivot', 'special_sweeper'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'kingambit': {
    species: 'Kingambit',
    item: 'Leftovers',
    ability: 'Supreme Overlord',
    nature: 'Adamant',
    evs: { hp: 212, atk: 252, def: 0, spa: 0, spd: 0, spe: 44 },
    moves: ['Kowtow Cleave', 'Sucker Punch', 'Iron Head', 'Swords Dance'],
    teraType: 'Flying',
    roles: ['late_game_cleaner', 'physical_sweeper'],
    archetypes: ['hyperOffense', 'bulkyOffense', 'balance', 'trickRoom']
  },
  'tinglu': {
    species: 'Ting-Lu',
    item: 'Leftovers',
    ability: 'Vessel of Ruin',
    nature: 'Careful',
    evs: { hp: 252, atk: 4, def: 0, spa: 0, spd: 252, spe: 0 },
    moves: ['Earthquake', 'Stealth Rock', 'Ruination', 'Whirlwind'],
    teraType: 'Poison',
    roles: ['hazard_setter', 'special_wall', 'defensive_pivot'],
    archetypes: ['balance', 'stall', 'bulkyOffense']
  },
  'corviknight': {
    species: 'Corviknight',
    item: 'Rocky Helmet',
    ability: 'Pressure',
    nature: 'Impish',
    evs: { hp: 248, atk: 0, def: 252, spa: 0, spd: 8, spe: 0 },
    moves: ['Brave Bird', 'Roost', 'Defog', 'U-turn'],
    teraType: 'Dragon',
    roles: ['physical_wall', 'hazard_remover', 'defensive_pivot'],
    archetypes: ['balance', 'bulkyOffense', 'stall']
  },
  'gliscor': {
    species: 'Gliscor',
    item: 'Toxic Orb',
    ability: 'Poison Heal',
    nature: 'Careful',
    evs: { hp: 244, atk: 0, def: 12, spa: 0, spd: 244, spe: 8 },
    moves: ['Earthquake', 'Toxic', 'Protect', 'Spikes'],
    teraType: 'Water',
    roles: ['hazard_setter', 'status_spreader', 'defensive_wall'],
    archetypes: ['balance', 'stall']
  },
  'ogerponwellspring': {
    species: 'Ogerpon-Wellspring',
    item: 'Wellspring Mask',
    ability: 'Water Absorb',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Ivy Cudgel', 'Horn Leech', 'Knock Off', 'Swords Dance'],
    teraType: 'Water',
    roles: ['physical_wallbreaker', 'water_absorb', 'redirection'],
    archetypes: ['bulkyOffense', 'hyperOffense', 'balance', 'tailwindAggro']
  },
  'ogerponhearthflame': {
    species: 'Ogerpon-Hearthflame',
    item: 'Hearthflame Mask',
    ability: 'Mold Breaker',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Ivy Cudgel', 'Wood Hammer', 'Spiky Shield', 'Follow Me'],
    teraType: 'Fire',
    roles: ['physical_wallbreaker', 'redirection'],
    archetypes: ['hyperOffense', 'tailwindAggro', 'bulkyOffense']
  },
  'incineroar': {
    species: 'Incineroar',
    item: 'Sitrus Berry',
    ability: 'Intimidate',
    nature: 'Careful',
    evs: { hp: 252, atk: 4, def: 140, spa: 0, spd: 108, spe: 4 },
    moves: ['Fake Out', 'Parting Shot', 'Knock Off', 'Flare Blitz'],
    teraType: 'Ghost',
    roles: ['intimidate', 'fake_out', 'defensive_pivot'],
    archetypes: ['bulkyOffense', 'balance', 'trickRoom', 'tailwindAggro']
  },
  'rillaboom': {
    species: 'Rillaboom',
    item: 'Assault Vest',
    ability: 'Grassy Surge',
    nature: 'Adamant',
    evs: { hp: 252, atk: 116, def: 60, spa: 0, spd: 76, spe: 4 },
    moves: ['Grassy Glide', 'Wood Hammer', 'U-turn', 'Fake Out'],
    teraType: 'Fire',
    roles: ['terrain_setter', 'fake_out', 'priority_attacker', 'pivot'],
    archetypes: ['bulkyOffense', 'balance', 'tailwindAggro']
  },
  'urshifurapidstrike': {
    species: 'Urshifu-Rapid-Strike',
    item: 'Choice Scarf',
    ability: 'Unseen Fist',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Surging Strikes', 'Close Combat', 'Aqua Jet', 'U-turn'],
    teraType: 'Water',
    roles: ['physical_wallbreaker', 'speed_control', 'pivot'],
    archetypes: ['hyperOffense', 'tailwindAggro', 'bulkyOffense']
  },
  'fluttermane': {
    species: 'Flutter Mane',
    item: 'Choice Specs',
    ability: 'Protosynthesis',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Moonblast', 'Shadow Ball', 'Dazzling Gleam', 'Mystical Fire'],
    teraType: 'Fairy',
    roles: ['special_sweeper', 'speed_control'],
    archetypes: ['hyperOffense', 'tailwindAggro']
  },
  'tornadus': {
    species: 'Tornadus',
    item: 'Covert Cloak',
    ability: 'Prankster',
    nature: 'Timid',
    evs: { hp: 252, atk: 0, def: 108, spa: 4, spd: 60, spe: 84 },
    moves: ['Tailwind', 'Bleakwind Storm', 'Rain Dance', 'Taunt'],
    teraType: 'Steel',
    roles: ['speed_control', 'weather_setter', 'disruption'],
    archetypes: ['tailwindAggro', 'hyperOffense']
  },
  'farigiraf': {
    species: 'Farigiraf',
    item: 'Rocky Helmet',
    ability: 'Armor Tail',
    nature: 'Quiet',
    evs: { hp: 252, atk: 0, def: 156, spa: 36, spd: 64, spe: 0 },
    moves: ['Trick Room', 'Psychic', 'Hyper Voice', 'Helping Hand'],
    teraType: 'Fairy',
    roles: ['trick_room_setter', 'priority_blocker'],
    archetypes: ['trickRoom', 'balance']
  },
  'ursalunabloodmoon': {
    species: 'Ursaluna-Bloodmoon',
    item: 'Life Orb',
    ability: 'Mind\'s Eye',
    nature: 'Modest',
    evs: { hp: 252, atk: 0, def: 4, spa: 252, spd: 0, spe: 0 },
    moves: ['Blood Moon', 'Earth Power', 'Hyper Voice', 'Protect'],
    teraType: 'Normal',
    roles: ['special_wallbreaker', 'trick_room_sweeper'],
    archetypes: ['trickRoom', 'bulkyOffense']
  },
  'archaludon': {
    species: 'Archaludon',
    item: 'Assault Vest',
    ability: 'Stamina',
    nature: 'Modest',
    evs: { hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 },
    moves: ['Electro Shot', 'Draco Meteor', 'Flash Cannon', 'Body Press'],
    teraType: 'Grass',
    roles: ['physical_wall', 'special_wallbreaker'],
    archetypes: ['balance', 'bulkyOffense']
  },
  'volcarona': {
    species: 'Volcarona',
    item: 'Heavy-Duty Boots',
    ability: 'Flame Body',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Quiver Dance', 'Fiery Dance', 'Bug Buzz', 'Giga Drain'],
    teraType: 'Grass',
    roles: ['setup_sweeper', 'special_sweeper'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'glimmora': {
    species: 'Glimmora',
    item: 'Focus Sash',
    ability: 'Toxic Debris',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Mortal Spin', 'Stealth Rock', 'Earth Power', 'Sludge Wave'],
    teraType: 'Ghost',
    roles: ['hazard_setter', 'hazard_remover', 'suicide_lead'],
    archetypes: ['hyperOffense']
  },
  'ironvaliant': {
    species: 'Iron Valiant',
    item: 'Booster Energy',
    ability: 'Quark Drive',
    nature: 'Naive',
    evs: { hp: 0, atk: 176, def: 0, spa: 80, spd: 0, spe: 252 },
    moves: ['Moonblast', 'Close Combat', 'Knock Off', 'Encore'],
    teraType: 'Fairy',
    roles: ['mixed_wallbreaker', 'speed_control'],
    archetypes: ['hyperOffense']
  },
  'dondozo': {
    species: 'Dondozo',
    item: 'Leftovers',
    ability: 'Unaware',
    nature: 'Impish',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    moves: ['Wave Crash', 'Body Press', 'Rest', 'Sleep Talk'],
    teraType: 'Grass',
    roles: ['unaware_wall', 'physical_tank'],
    archetypes: ['stall', 'balance']
  },
  'clodsire': {
    species: 'Clodsire',
    item: 'Black Sludge',
    ability: 'Water Absorb',
    nature: 'Careful',
    evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
    moves: ['Earthquake', 'Toxic', 'Recover', 'Stealth Rock'],
    teraType: 'Steel',
    roles: ['special_wall', 'hazard_setter'],
    archetypes: ['stall', 'balance']
  },
  'pelipper': {
    species: 'Pelipper',
    item: 'Damp Rock',
    ability: 'Drizzle',
    nature: 'Bold',
    evs: { hp: 248, atk: 0, def: 252, spa: 8, spd: 0, spe: 0 },
    moves: ['Hurricane', 'Hydro Pump', 'U-turn', 'Roost'],
    teraType: 'Ground',
    roles: ['weather_setter', 'pivot'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'whimsicott': {
    species: 'Whimsicott',
    item: 'Focus Sash',
    ability: 'Prankster',
    nature: 'Timid',
    evs: { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 },
    moves: ['Tailwind', 'Moonblast', 'Encore', 'Protect'],
    teraType: 'Ghost',
    roles: ['speed_control', 'disruption'],
    archetypes: ['tailwindAggro', 'hyperOffense']
  },
  'torkoal': {
    species: 'Torkoal',
    item: 'Charcoal',
    ability: 'Drought',
    nature: 'Quiet',
    evs: { hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 },
    moves: ['Eruption', 'Heat Wave', 'Solar Beam', 'Protect'],
    teraType: 'Fire',
    roles: ['weather_setter', 'trick_room_sweeper'],
    archetypes: ['trickRoom']
  },
  'ursaluna': {
    species: 'Ursaluna',
    item: 'Flame Orb',
    ability: 'Guts',
    nature: 'Brave',
    evs: { hp: 248, atk: 252, def: 0, spa: 0, spd: 8, spe: 0 },
    moves: ['Facade', 'Headlong Rush', 'Fire Punch', 'Protect'],
    teraType: 'Normal',
    roles: ['trick_room_sweeper', 'physical_wallbreaker'],
    archetypes: ['trickRoom', 'bulkyOffense']
  },
  // Survival & Cobblemon Meta Staples
  'garchomp': {
    species: 'Garchomp',
    item: 'Life Orb',
    ability: 'Rough Skin',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Earthquake', 'Outrage', 'Swords Dance', 'Scale Shot'],
    teraType: 'Steel',
    roles: ['physical_sweeper', 'hazard_setter'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'dragonite': {
    species: 'Dragonite',
    item: 'Heavy-Duty Boots',
    ability: 'Multiscale',
    nature: 'Adamant',
    evs: { hp: 144, atk: 252, def: 0, spa: 0, spd: 0, spe: 112 },
    moves: ['Dragon Dance', 'Extreme Speed', 'Earthquake', 'Roost'],
    teraType: 'Normal',
    roles: ['setup_sweeper', 'priority_cleaner'],
    archetypes: ['hyperOffense', 'bulkyOffense', 'balance']
  },
  'meowscarada': {
    species: 'Meowscarada',
    item: 'Choice Band',
    ability: 'Protean',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Flower Trick', 'Knock Off', 'U-turn', 'Triple Axel'],
    teraType: 'Grass',
    roles: ['offensive_pivot', 'speed_control', 'physical_wallbreaker'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'skeledirge': {
    species: 'Skeledirge',
    item: 'Heavy-Duty Boots',
    ability: 'Unaware',
    nature: 'Bold',
    evs: { hp: 248, atk: 0, def: 252, spa: 0, spd: 8, spe: 0 },
    moves: ['Torch Song', 'Shadow Ball', 'Slack Off', 'Will-O-Wisp'],
    teraType: 'Fairy',
    roles: ['unaware_wall', 'special_sweeper'],
    archetypes: ['balance', 'stall', 'bulkyOffense']
  },
  'tinkaton': {
    species: 'Tinkaton',
    item: 'Leftovers',
    ability: 'Mold Breaker',
    nature: 'Careful',
    evs: { hp: 252, atk: 0, def: 84, spa: 0, spd: 172, spe: 0 },
    moves: ['Gigaton Hammer', 'Knock Off', 'Stealth Rock', 'Thunder Wave'],
    teraType: 'Water',
    roles: ['hazard_setter', 'defensive_pivot', 'disruption'],
    archetypes: ['balance', 'bulkyOffense']
  },
  'grimmsnarl': {
    species: 'Grimmsnarl',
    item: 'Light Clay',
    ability: 'Prankster',
    nature: 'Careful',
    evs: { hp: 252, atk: 0, def: 136, spa: 0, spd: 120, spe: 0 },
    moves: ['Reflect', 'Light Screen', 'Parting Shot', 'Spirit Break'],
    teraType: 'Steel',
    roles: ['screens_lead', 'pivot', 'disruption'],
    archetypes: ['hyperOffense', 'tailwindAggro']
  },
  'annihilape': {
    species: 'Annihilape',
    item: 'Leftovers',
    ability: 'Defiant',
    nature: 'Careful',
    evs: { hp: 240, atk: 0, def: 16, spa: 0, spd: 252, spe: 0 },
    moves: ['Rage Fist', 'Drain Punch', 'Bulk Up', 'Taunt'],
    teraType: 'Water',
    roles: ['setup_sweeper', 'wallbreaker'],
    archetypes: ['bulkyOffense', 'balance']
  },
  'gyarados': {
    species: 'Gyarados',
    item: 'Sitrus Berry',
    ability: 'Intimidate',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Waterfall', 'Dragon Dance', 'Earthquake', 'Thunder Wave'],
    teraType: 'Flying',
    roles: ['intimidate', 'physical_sweeper'],
    archetypes: ['bulkyOffense', 'tailwindAggro', 'balance']
  },
  'magnezone': {
    species: 'Magnezone',
    item: 'Assault Vest',
    ability: 'Magnet Pull',
    nature: 'Modest',
    evs: { hp: 248, atk: 0, def: 0, spa: 252, spd: 8, spe: 0 },
    moves: ['Thunderbolt', 'Flash Cannon', 'Volt Switch', 'Body Press'],
    teraType: 'Flying',
    roles: ['trapper', 'special_wallbreaker', 'pivot'],
    archetypes: ['balance', 'bulkyOffense']
  },
  'rotomwash': {
    species: 'Rotom-Wash',
    item: 'Leftovers',
    ability: 'Levitate',
    nature: 'Bold',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    moves: ['Hydro Pump', 'Volt Switch', 'Will-O-Wisp', 'Pain Split'],
    teraType: 'Steel',
    roles: ['defensive_pivot', 'ground_immunity', 'status_spreader'],
    archetypes: ['balance', 'bulkyOffense']
  },
  'scizor': {
    species: 'Scizor',
    item: 'Choice Band',
    ability: 'Technician',
    nature: 'Adamant',
    evs: { hp: 248, atk: 252, def: 8, spa: 0, spd: 0, spe: 0 },
    moves: ['Bullet Punch', 'Close Combat', 'U-turn', 'Knock Off'],
    teraType: 'Steel',
    roles: ['priority_cleaner', 'offensive_pivot', 'physical_wallbreaker'],
    archetypes: ['bulkyOffense', 'hyperOffense', 'balance']
  },
  'tyranitar': {
    species: 'Tyranitar',
    item: 'Choice Band',
    ability: 'Sand Stream',
    nature: 'Adamant',
    evs: { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 },
    moves: ['Stone Edge', 'Crunch', 'Earthquake', 'Knock Off'],
    teraType: 'Flying',
    roles: ['weather_setter', 'physical_wallbreaker'],
    archetypes: ['bulkyOffense', 'balance']
  },
  'breloom': {
    species: 'Breloom',
    item: 'Focus Sash',
    ability: 'Technician',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Spore', 'Bullet Seed', 'Mach Punch', 'Swords Dance'],
    teraType: 'Fighting',
    roles: ['sleep_lead', 'priority_cleaner'],
    archetypes: ['hyperOffense', 'tailwindAggro']
  },
  'toxapex': {
    species: 'Toxapex',
    item: 'Black Sludge',
    ability: 'Regenerator',
    nature: 'Bold',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    moves: ['Recover', 'Toxic', 'Haze', 'Surf'],
    teraType: 'Steel',
    roles: ['defensive_wall', 'status_spreader'],
    archetypes: ['stall', 'balance']
  },
  'darmanitangalar': {
    species: 'Darmanitan-Galar',
    item: 'Choice Scarf',
    ability: 'Gorilla Tactics',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Icicle Crash', 'Flare Blitz', 'Earthquake', 'U-turn'],
    teraType: 'Fire',
    roles: ['physical_wallbreaker', 'speed_control', 'pivot'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'typhlosionhisui': {
    species: 'Typhlosion-Hisui',
    item: 'Choice Specs',
    ability: 'Frisk',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Eruption', 'Shadow Ball', 'Flamethrower', 'Focus Blast'],
    teraType: 'Fire',
    roles: ['special_wallbreaker', 'cleaner'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'samurotthisui': {
    species: 'Samurott-Hisui',
    item: 'Focus Sash',
    ability: 'Sharpness',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Ceaseless Edge', 'Razor Shell', 'Sacred Sword', 'Sucker Punch'],
    teraType: 'Dark',
    roles: ['hazard_setter', 'physical_wallbreaker', 'priority_attacker'],
    archetypes: ['hyperOffense', 'bulkyOffense', 'balance']
  },
  'sneasler': {
    species: 'Sneasler',
    item: 'Air Balloon',
    ability: 'Unburden',
    nature: 'Jolly',
    evs: { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Dire Claw', 'Close Combat', 'Swords Dance', 'Acrobatics'],
    teraType: 'Flying',
    roles: ['setup_sweeper', 'cleaner', 'physical_wallbreaker'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'ninetalesalola': {
    species: 'Ninetales-Alola',
    item: 'Light Clay',
    ability: 'Snow Warning',
    nature: 'Timid',
    evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 0, spe: 252 },
    moves: ['Aurora Veil', 'Blizzard', 'Moonblast', 'Encore'],
    teraType: 'Water',
    roles: ['screens_lead', 'speed_control', 'weather_setter'],
    archetypes: ['hyperOffense', 'bulkyOffense', 'balance']
  },
  'sylveon': {
    species: 'Sylveon',
    item: 'Leftovers',
    ability: 'Pixilate',
    nature: 'Modest',
    evs: { hp: 248, atk: 0, def: 0, spa: 252, spd: 8, spe: 0 },
    moves: ['Hyper Voice', 'Wish', 'Protect', 'Calm Mind'],
    teraType: 'Fairy',
    roles: ['special_wallbreaker', 'cleric', 'special_tank'],
    archetypes: ['balance', 'bulkyOffense']
  },
  'umbreon': {
    species: 'Umbreon',
    item: 'Leftovers',
    ability: 'Synchronize',
    nature: 'Calm',
    evs: { hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 },
    moves: ['Foul Play', 'Wish', 'Protect', 'Thunder Wave'],
    teraType: 'Poison',
    roles: ['special_wall', 'cleric', 'status_spreader'],
    archetypes: ['balance', 'stall']
  },
  'jolteon': {
    species: 'Jolteon',
    item: 'Choice Specs',
    ability: 'Volt Absorb',
    nature: 'Timid',
    evs: { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
    moves: ['Thunderbolt', 'Volt Switch', 'Shadow Ball', 'Alluring Voice'],
    teraType: 'Ice',
    roles: ['speed_control', 'pivot'],
    archetypes: ['hyperOffense', 'bulkyOffense']
  },
  'vaporeon': {
    species: 'Vaporeon',
    item: 'Leftovers',
    ability: 'Water Absorb',
    nature: 'Bold',
    evs: { hp: 252, atk: 0, def: 252, spa: 0, spd: 4, spe: 0 },
    moves: ['Wish', 'Protect', 'Scald', 'Haze'],
    teraType: 'Grass',
    roles: ['physical_wall', 'cleric'],
    archetypes: ['balance', 'stall']
  },
  'lapras': {
    species: 'Lapras',
    item: 'Assault Vest',
    ability: 'Water Absorb',
    nature: 'Modest',
    evs: { hp: 252, atk: 0, def: 0, spa: 252, spd: 4, spe: 0 },
    moves: ['Freeze-Dry', 'Hydro Pump', 'Ice Beam', 'Thunderbolt'],
    teraType: 'Electric',
    roles: ['special_tank', 'water_absorb'],
    archetypes: ['bulkyOffense', 'balance']
  }
};

export class TeamBuilder {
  constructor(regulationEngine, playerProfile = null) {
    this.regulation = regulationEngine;
    this.profiler = playerProfile || new PlayerProfiler().profileFromQuiz({});
    this.synergy = new SynergyEngine(this.regulation.config.generation || 9);
  }

  /**
   * Generates a fully tailored competitive team adhering to regulation & player style
   */
  generateTeam(options = {}) {
    const format = options.format || this.regulation.config.format || 'singles';
    const primaryStyle = this.profiler.primaryArchetype.id;
    const requiredSpecies = (options.requiredSpecies || this.regulation.config.requiredSpecies || []).map(toID);

    // 1. Gather all legal species under this regulation
    const legalSpecies = this.regulation.getLegalSpeciesList();
    const legalMap = new Map(legalSpecies.map(s => [s.id, s]));

    // 2. Identify candidate sets matching this regulation and player archetype
    const candidateSetKeys = Object.keys(COMPETITIVE_SETS).filter(id => {
      if (!legalMap.has(id)) return false;
      const legality = this.regulation.isSpeciesLegal(id);
      return legality.legal;
    });

    const chosenTeam = [];
    const usedItems = new Set();
    const usedSpecies = new Set();

    // Helper to get base species id for species clause
    const getBaseId = (name) => {
      const data = getSpecies(name, this.regulation.config.generation || 9);
      return toID(data?.baseSpecies || data?.name || name);
    };

    // 3. Add required species first if specified
    for (const reqId of requiredSpecies) {
      const baseId = getBaseId(reqId);
      if (legalMap.has(reqId) && !usedSpecies.has(baseId)) {
        const customSet = COMPETITIVE_SETS[reqId] || this.createProceduralSet(reqId);
        chosenTeam.push({ ...customSet });
        usedSpecies.add(baseId);
        if (customSet.item) usedItems.add(toID(customSet.item));
      }
    }

    // 4. Fill remaining slots using style alignment & synergy optimization
    while (chosenTeam.length < this.regulation.config.teamSize) {
      let bestCandidate = null;
      let highestScore = -Infinity;

      for (const candKey of candidateSetKeys) {
        const baseId = getBaseId(candKey);
        if (usedSpecies.has(baseId)) continue;

        const candidateSet = COMPETITIVE_SETS[candKey];
        if (this.regulation.config.itemClause && usedItems.has(toID(candidateSet.item))) {
          continue; // Item clause check
        }

        // Check restricted limit
        const candSpeciesData = legalMap.get(candKey);
        if (candSpeciesData?.isRestricted) {
          const currentRestricted = chosenTeam.filter(m => legalMap.get(toID(m.species))?.isRestricted).length;
          if (this.regulation.config.maxRestricted !== null && currentRestricted >= this.regulation.config.maxRestricted) {
            continue;
          }
        }

        // Evaluate candidate addition to team
        const trialTeam = [...chosenTeam, candidateSet];
        const evalResult = this.synergy.evaluateTeam(trialTeam, format);

        // Style score
        let styleFit = 0;
        if (candidateSet.archetypes?.includes(primaryStyle)) {
          styleFit += 30;
        }

        // Speed tier compatibility with playstyle
        const speed = candSpeciesData?.baseStats?.spe || 80;
        if ((primaryStyle === 'hyperOffense' || primaryStyle === 'tailwindAggro') && speed >= 105) {
          styleFit += 20;
        } else if (primaryStyle === 'trickRoom' && speed <= 60) {
          styleFit += 25;
        } else if ((primaryStyle === 'bulkyOffense' || primaryStyle === 'balance') && speed >= 60 && speed <= 110) {
          styleFit += 15;
        }

        const candidateFitness = evalResult.compositeScore + styleFit;

        if (candidateFitness > highestScore) {
          highestScore = candidateFitness;
          bestCandidate = candidateSet;
        }
      }

      // If no catalog candidate fit, pull from legal species pool
      if (!bestCandidate) {
        for (const legalMon of legalSpecies) {
          const baseId = getBaseId(legalMon.id);
          if (!usedSpecies.has(baseId)) {
            bestCandidate = this.createProceduralSet(legalMon.id);
            break;
          }
        }
      }

      if (bestCandidate) {
        chosenTeam.push({ ...bestCandidate });
        usedSpecies.add(getBaseId(bestCandidate.species));
        if (bestCandidate.item) usedItems.add(toID(bestCandidate.item));
      } else {
        break;
      }
    }

    // 5. Run final synergy report
    const synergyReport = this.synergy.evaluateTeam(chosenTeam, format);
    const showdownPaste = this.exportToShowdown(chosenTeam);

    return {
      team: chosenTeam,
      regulationName: this.regulation.config.name,
      format,
      targetPlaystyle: this.profiler.primaryArchetype.name,
      synergyReport,
      showdownPaste
    };
  }

  /**
   * Cobblemon Survival PC Box Optimizer:
   * Selects the highest-synergy team from the player's caught Pokemon, and recommends wild catches to hunt next.
   * @param {Array<string>} inventoryList - Array of Pokemon names in player's PC box
   * @param {Object} options - { format: 'singles'|'doubles', requiredSpecies: [] }
   */
  optimizeFromInventory(inventoryList, options = {}) {
    const format = options.format || this.regulation.config.format || 'singles';
    const primaryStyle = this.profiler.primaryArchetype.id;
    const teamSize = this.regulation.config.teamSize || 6;

    // Helper for base species id
    const getBaseId = (name) => {
      const data = getSpecies(name, this.regulation.config.generation || 9);
      return toID(data?.baseSpecies || data?.name || name);
    };

    // 1. Filter inventory for legal species under active regulation
    const legalCandidates = [];
    const seenBase = new Set();
    
    for (const name of inventoryList) {
      const cleanId = toID(name);
      const legality = this.regulation.isSpeciesLegal(name);
      if (legality.legal) {
        const baseId = getBaseId(name);
        if (!seenBase.has(baseId)) {
          seenBase.add(baseId);
          const monSet = COMPETITIVE_SETS[cleanId] || this.createProceduralSet(name);
          legalCandidates.push(monSet);
        }
      }
    }

    if (legalCandidates.length === 0) {
      throw new Error('None of the Pokemon in your inventory are legal under the current regulation!');
    }

    // 2. Select the optimal 6-mon team from the inventory candidates
    let chosenTeam = [];
    if (legalCandidates.length <= teamSize) {
      // Player has teamSize or fewer legal Pokemon: use all of them!
      chosenTeam = [...legalCandidates];
      
      // If fewer than teamSize, fill remaining slots with highest-synergy recommendations
      while (chosenTeam.length < teamSize) {
        const legalList = this.regulation.getLegalSpeciesList();
        const used = new Set(chosenTeam.map(m => getBaseId(m.species)));
        let bestFiller = null;
        let bestScore = -Infinity;

        for (const legalMon of legalList) {
          if (used.has(getBaseId(legalMon.id))) continue;
          const candidateSet = COMPETITIVE_SETS[legalMon.id] || this.createProceduralSet(legalMon.id);
          const trial = [...chosenTeam, candidateSet];
          const evalRes = this.synergy.evaluateTeam(trial, format);
          if (evalRes.compositeScore > bestScore) {
            bestScore = evalRes.compositeScore;
            bestFiller = candidateSet;
          }
        }
        if (bestFiller) chosenTeam.push(bestFiller);
        else break;
      }
    } else {
      // Combinatorial / Greedy Beam search to pick the best 6 from inventory
      const required = (options.requiredSpecies || []).map(toID);
      const usedSpecies = new Set();
      const usedItems = new Set();

      // Pick required first
      for (const req of required) {
        const found = legalCandidates.find(c => toID(c.species) === req);
        if (found && !usedSpecies.has(getBaseId(found.species))) {
          chosenTeam.push({ ...found });
          usedSpecies.add(getBaseId(found.species));
          if (found.item) usedItems.add(toID(found.item));
        }
      }

      // Greedily add remaining from candidates
      while (chosenTeam.length < teamSize) {
        let bestMon = null;
        let highestFitness = -Infinity;

        for (const cand of legalCandidates) {
          const baseId = getBaseId(cand.species);
          if (usedSpecies.has(baseId)) continue;
          if (this.regulation.config.itemClause && usedItems.has(toID(cand.item))) continue;

          const trial = [...chosenTeam, cand];
          const evalRes = this.synergy.evaluateTeam(trial, format);

          // Style compatibility
          let styleBonus = 0;
          if (cand.archetypes?.includes(primaryStyle)) styleBonus += 20;

          const fitness = evalRes.compositeScore + styleBonus;
          if (fitness > highestFitness) {
            highestFitness = fitness;
            bestMon = cand;
          }
        }

        if (bestMon) {
          chosenTeam.push({ ...bestMon });
          usedSpecies.add(getBaseId(bestMon.species));
          if (bestMon.item) usedItems.add(toID(bestMon.item));
        } else {
          break;
        }
      }
    }

    // 3. Resolve item conflicts if itemClause is on
    if (this.regulation.config.itemClause) {
      const itemsSeen = new Set();
      const backupItems = ['Sitrus Berry', 'Leftovers', 'Life Orb', 'Assault Vest', 'Choice Specs', 'Choice Band', 'Focus Sash', 'Rocky Helmet', 'Heavy-Duty Boots', 'Covert Cloak'];
      for (const mon of chosenTeam) {
        if (!mon.item || itemsSeen.has(toID(mon.item))) {
          const freeItem = backupItems.find(i => !itemsSeen.has(toID(i))) || 'Sitrus Berry';
          mon.item = freeItem;
        }
        itemsSeen.add(toID(mon.item));
      }
    }

    // 4. Run synergy analysis
    const synergyReport = this.synergy.evaluateTeam(chosenTeam, format);

    // 5. Calculate "Next Best Minecraft Catches to Hunt"
    const bestCatchesToHunt = [];
    const usedInTeam = new Set(chosenTeam.map(m => getBaseId(m.species)));
    const allLegal = this.regulation.getLegalSpeciesList();
    const candidateUpgrades = [];

    for (const wildMon of allLegal) {
      const wildId = wildMon.id;
      if (usedInTeam.has(getBaseId(wildId))) continue;
      const wildSet = COMPETITIVE_SETS[wildId] || this.createProceduralSet(wildId);

      for (let i = 0; i < chosenTeam.length; i++) {
        const swapped = [...chosenTeam];
        swapped[i] = wildSet;
        const testEval = this.synergy.evaluateTeam(swapped, format);
        const delta = testEval.compositeScore - synergyReport.compositeScore;
        if (delta > 0) {
          candidateUpgrades.push({
            pokemon: wildSet.species,
            replaces: chosenTeam[i].species,
            newSynergyScore: testEval.compositeScore,
            gain: delta,
            roles: wildSet.roles || ['wild_upgrade'],
            reason: `Fixes defensive coverage against ${synergyReport.defense.criticalVulnerabilities.map(v => v.type).join(', ') || 'meta threats'}`
          });
        }
      }
    }

    candidateUpgrades.sort((a, b) => b.gain - a.gain);
    const seenWild = new Set();
    for (const u of candidateUpgrades) {
      if (!seenWild.has(u.pokemon)) {
        seenWild.add(u.pokemon);
        bestCatchesToHunt.push(u);
        if (bestCatchesToHunt.length >= 3) break;
      }
    }

    const showdownPaste = this.exportToShowdown(chosenTeam);

    return {
      team: chosenTeam,
      inventoryEvaluated: inventoryList.length,
      regulationName: this.regulation.config.name,
      format,
      targetPlaystyle: this.profiler.primaryArchetype.name,
      synergyReport,
      bestCatchesToHunt,
      showdownPaste
    };
  }

  /**
   * Procedural competitive set generator for legal Pokemon not in hardcoded catalog
   */
  createProceduralSet(speciesId) {
    const data = getSpecies(speciesId, this.regulation.config.generation || 9);
    const isPhysical = (data.baseStats.atk || 0) >= (data.baseStats.spa || 0);

    const commonItems = ['Leftovers', 'Life Orb', 'Choice Band', 'Choice Specs', 'Focus Sash', 'Assault Vest'];
    const chosenItem = isPhysical ? 'Life Orb' : 'Choice Specs';

    return {
      species: data.name,
      item: chosenItem,
      ability: Object.values(data.abilities)[0] || 'Overgrow',
      nature: isPhysical ? 'Jolly' : 'Timid',
      evs: isPhysical
        ? { hp: 0, atk: 252, def: 4, spa: 0, spd: 0, spe: 252 }
        : { hp: 0, atk: 0, def: 4, spa: 252, spd: 0, spe: 252 },
      moves: ['Earthquake', 'Close Combat', 'Ice Spinner', 'Protect'].slice(0, 4),
      teraType: data.types[0] || 'Normal',
      roles: ['procedural_sweeper'],
      archetypes: ['balance']
    };
  }

  /**
   * Exports team to Pokemon Showdown standard import/export format
   */
  exportToShowdown(team) {
    let output = '';
    for (const mon of team) {
      output += `${mon.species} @ ${mon.item || 'No Item'}\n`;
      output += `Ability: ${mon.ability}\n`;
      if (mon.teraType) output += `Tera Type: ${mon.teraType}\n`;
      
      const evs = [];
      if (mon.evs) {
        if (mon.evs.hp) evs.push(`${mon.evs.hp} HP`);
        if (mon.evs.atk) evs.push(`${mon.evs.atk} Atk`);
        if (mon.evs.def) evs.push(`${mon.evs.def} Def`);
        if (mon.evs.spa) evs.push(`${mon.evs.spa} SpA`);
        if (mon.evs.spd) evs.push(`${mon.evs.spd} SpD`);
        if (mon.evs.spe) evs.push(`${mon.evs.spe} Spe`);
      }
      if (evs.length > 0) output += `EVs: ${evs.join(' / ')}\n`;
      
      output += `${mon.nature || 'Hardy'} Nature\n`;
      
      for (const m of (mon.moves || [])) {
        output += `- ${m}\n`;
      }
      output += '\n';
    }
    return output.trim();
  }
}
