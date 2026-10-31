import { RegulationEngine, REGULATION_PRESETS } from '../engine/regulation.js';
import { PlayerProfiler } from '../engine/profiler.js';
import { TeamBuilder } from '../engine/builder.js';
import { StrategyCoach } from '../engine/coach.js';
import { BattleSimulator } from '../engine/simulator.js';
import { GameReviewer } from '../engine/reviewer.js';

// In-memory battle session cache for serverless invocation
const activeBattles = new Map();

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/presets' && req.method === 'GET') {
      res.status(200).json(REGULATION_PRESETS);
      return;
    }

    if (pathname === '/api/profile/quiz' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const profiler = new PlayerProfiler();
      const profile = profiler.profileFromQuiz(body);
      res.status(200).json(profile);
      return;
    }

    if (pathname === '/api/profile/replay' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const profiler = new PlayerProfiler();
      const profile = profiler.ingestReplay(body.replayLog, body.username || 'Player');
      res.status(200).json(profile);
      return;
    }

    if (pathname === '/api/build' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const regConfig = body.regulation || { preset: body.preset || 'gen9ou' };
      if (body.format) regConfig.format = body.format;
      if (body.bannedSpecies) regConfig.bannedSpecies = body.bannedSpecies;
      if (body.requiredSpecies) regConfig.requiredSpecies = body.requiredSpecies;

      const regulation = new RegulationEngine(regConfig);
      
      let profile = body.profile;
      if (!profile) {
        profile = new PlayerProfiler().profileFromQuiz(body.quizAnswers || {});
      }

      const builder = new TeamBuilder(regulation, profile);
      let teamResult = null;

      if (body.inventory && Array.isArray(body.inventory) && body.inventory.length > 0) {
        teamResult = builder.optimizeFromInventory(body.inventory, {
          format: body.format || regulation.config.format,
          requiredSpecies: body.requiredSpecies
        });
      } else {
        teamResult = builder.generateTeam({
          format: body.format || regulation.config.format,
          requiredSpecies: body.requiredSpecies
        });
      }

      const coach = new StrategyCoach();
      const playbook = coach.generatePlaybook(teamResult);

      res.status(200).json({
        teamResult,
        playbook,
        profile
      });
      return;
    }

    // Battle Simulator APIs
    if (pathname === '/api/battle/start' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const sim = new BattleSimulator({
        userTeam: body.userTeam,
        botPreset: body.botPreset || 'ou_balanced'
      });
      activeBattles.set(sim.id, sim);
      res.status(200).json(sim.getState());
      return;
    }

    if (pathname === '/api/battle/turn' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      let sim = activeBattles.get(body.battleId);
      if (!sim) {
        // Fallback recreate if serverless instance recycled
        sim = new BattleSimulator();
        activeBattles.set(body.battleId || sim.id, sim);
      }
      const turnRes = sim.submitTurn(body.action);
      res.status(200).json(turnRes);
      return;
    }

    if (pathname === '/api/battle/review' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const sim = activeBattles.get(body.battleId) || new BattleSimulator();
      const reviewer = new GameReviewer();
      const review = reviewer.reviewMatch({
        turnHistory: sim.turnHistory,
        fullLogText: sim.rawLogs.join('\n'),
        winner: sim.battle.winner || 'Player'
      });
      res.status(200).json(review);
      return;
    }

    res.status(404).json({ error: 'Endpoint not found' });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
