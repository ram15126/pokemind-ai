import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RegulationEngine, REGULATION_PRESETS } from './engine/regulation.js';
import { PlayerProfiler } from './engine/profiler.js';
import { TeamBuilder } from './engine/builder.js';
import { StrategyCoach } from './engine/coach.js';
import { BattleSimulator, PRACTICE_BOT_TEAMS } from './engine/simulator.js';
import { GameReviewer } from './engine/reviewer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const activeBattles = new Map();

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (url.pathname === '/api/presets' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(REGULATION_PRESETS));
    return;
  }

  if (url.pathname === '/api/profile/quiz' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const profiler = new PlayerProfiler();
      const profile = profiler.profileFromQuiz(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(profile));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/profile/replay' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const profiler = new PlayerProfiler();
      const profile = profiler.ingestReplay(body.replayLog, body.username || 'Player');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(profile));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/build' && req.method === 'POST') {
    try {
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

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        teamResult,
        playbook,
        profile
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message, stack: err.stack }));
    }
    return;
  }

  // Battle Simulator Endpoints
  if (url.pathname === '/api/battle/start' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const sim = new BattleSimulator({
        userTeam: body.userTeam,
        botPreset: body.botPreset || 'ou_balanced'
      });
      activeBattles.set(sim.id, sim);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(sim.getState()));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/battle/turn' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const sim = activeBattles.get(body.battleId);
      if (!sim) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Battle not found' }));
        return;
      }
      const turnRes = sim.submitTurn(body.action);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(turnRes));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/api/battle/review' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const sim = activeBattles.get(body.battleId);
      if (!sim) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Battle not found' }));
        return;
      }
      const reviewer = new GameReviewer();
      const review = reviewer.reviewMatch({
        turnHistory: sim.turnHistory,
        fullLogText: sim.rawLogs.join('\n'),
        winner: sim.battle.winner || 'Player'
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(review));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Serve static UI
  if (url.pathname === '/' || url.pathname === '/index.html') {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`[+] PokeMind AI Intelligence System running on http://localhost:${PORT}`);
});
