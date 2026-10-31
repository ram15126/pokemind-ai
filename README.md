# PokeMind AI - Competitive Pokemon Intelligence System

A multi-tiered competitive AI intelligence system for **Singles and Doubles** Pokémon battles (Gens 1–9), featuring **Custom Tournament Regulations**, **Replay-based Player Playstyle Profiling**, and an **Algorithmic Team Builder & Coach**.

---

## Key Features

1. **Custom Regulation Engine (`engine/regulation.js`)**
   * Presets for standard formats: `gen9ou` (Smogon Singles), `vgc_regh` (Doubles No Legendaries/Paradox), `vgc_regg` (1 Restricted Legendary), `gen9ubers`, and `doubles_ou`.
   * Full customizability: define custom banned species, banned moves, banned abilities, item clauses, species clauses, and restricted legendary limits.

2. **Personal Playstyle Profiling (`engine/profiler.js`)**
   * **Replay Ingestion:** Ingests raw Pokémon Showdown battle logs (`.txt` or JSON) to compute metrics: turn count tempo, hard-switch rate, pivot reliance (U-turn/Volt Switch), aggressive attack ratio, and early vs late Terastallization.
   * **Diagnostic Quiz:** Calibrates players on a 5-dimension radar: Hyper Offense, Bulky Offense, Balance, Defensive Stall, Trick Room, or Tailwind Hyper Aggro.

3. **Synergy & Type Matrix Engine (`engine/synergy.js`)**
   * 18-type defensive resistance and weakness grid.
   * Exponential penalty for shared, unresisted weaknesses.
   * Offensive STAB super-effective coverage calculator across all 18 types.
   * Speed tier distribution analyzer.

4. **Automated Team Builder & Optimizer (`engine/builder.js`)**
   * Generates tournament-ready 6-Pokémon rosters matching your playstyle and legal regulation.
   * Produces complete competitive sets: Items, Abilities, Natures, exact EV spreads, Moves, and Tera Types.
   * Standard Pokémon Showdown export format (`pokepaste`).

5. **Strategic Coach & Playbook (`engine/coach.js`)**
   * Core tactical philosophy and Turn 1–5 gameplan.
   * Specific lead pairings against Hyper Offense, Balance, and Trick Room.
   * Offensive and Defensive Terastallization priorities.

---

## Quick Start

### 1. Run the Interactive Web Dashboard
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
* Select or customize your regulation (Singles or Doubles, custom bans, required core).
* Take the interactive playstyle quiz or paste your Pokémon Showdown battle log.
* Click **"Generate Optimized Team"** to see your team cards, synergy audit, strategic playbook, and copy the Showdown paste with 1 click.

### 2. Run via CLI
```bash
# Cobblemon PC Box Optimizer: Find the best 6-mon team from your caught Pokemon:
node cli.js --box "Garchomp,Skeledirge,Meowscarada,Gyarados,Tinkaton,Rotom-Wash,Grimmsnarl,Breloom" --style ho

# Generate a Singles OU Hyper Offense team built around Dragapult:
node cli.js --format singles --preset gen9ou --style ho --required "Dragapult"

# Generate a VGC Regulation H (Doubles) Trick Room team:
node cli.js --format doubles --preset vgc_regh --style tr

# Build a team with custom bans:
node cli.js --format singles --banned "Garchomp,Ting-Lu,Gholdengo" --style bo

# Ingest a Showdown battle replay log to profile your personal style:
node cli.js --replay sample-battle.txt --preset gen9ou
```

---

## Cobblemon Survival PC Box Optimization

In Minecraft Cobblemon survival, you have a limited box of caught and trained Pokémon. PokeMind AI features a dedicated **PC Box Inventory Optimizer**:
* Pass your caught roster via the Web UI or `--box` CLI flag.
* Evaluates all valid 6-Pokémon combinations against your tournament rules.
* Maximizes defensive resistance matrices and offensive 18-type coverage.
* Recommends the **Top 3 Wild Catches to Hunt in Minecraft** to patch your team's remaining defensive holes!

---

## Architecture

```
vibrant-planck/
├── engine/
│   ├── data.js             # Dex helpers, typing charts, restricted/paradox lists
│   ├── regulation.js       # Custom regulation parser & legality validator
│   ├── profiler.js         # Player playstyle detector (replays & quiz)
│   ├── synergy.js          # Type defense matrix & coverage engine
│   ├── builder.js          # Algorithmic team builder & optimizer
│   └── coach.js            # Strategic playbook & matchup coach
├── public/
│   └── index.html          # Modern dark-mode web dashboard
├── tests/
│   ├── test-regulation.js  # Module 1 unit tests
│   ├── test-profiler.js    # Module 2 unit tests
│   ├── test-synergy.js     # Module 3 unit tests
│   ├── test-builder.js     # Module 4 unit tests
│   └── test-coach.js       # Module 5 unit tests
├── cli.js                  # CLI tool
├── server.js               # Web UI and REST API server
└── package.json
```
