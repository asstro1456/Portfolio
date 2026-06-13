import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const CONFIG_PATH = path.join(ROOT, 'apps-script', '.gas-release.local.json');
const QA_DIR = path.join(ROOT, 'apps-script', 'qa-tc-webapp');
const CLASP_ENTRY = path.join(ROOT, 'node_modules', '@google', 'clasp', 'build', 'src', 'index.js');
const QA_SHEET_ID = '1qVOWB4330UNr0-LSgA1RLCORiqAb9pTkGlzEA-H6Hig';

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) fail('apps-script/.gas-release.local.json is missing.');
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function writeConfig(config) {
  fs.writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}

function runClasp(args) {
  const result = spawnSync(process.execPath, [CLASP_ENTRY].concat(args), {
    cwd: QA_DIR,
    encoding: 'utf8',
    stdio: 'pipe'
  });

  if (result.status !== 0) {
    fail((result.stderr || result.stdout || 'clasp command failed').trim());
  }
}

const config = readConfig();
const secret = config.qaWebhookSecret || crypto.randomBytes(32).toString('hex');

runClasp([
  'run',
  'configureScriptProperties',
  '--params',
  JSON.stringify([QA_SHEET_ID, secret])
]);

runClasp(['run', 'setupTcSheet']);

config.qaWebhookSecret = secret;
writeConfig(config);
console.log('QA TC webapp configuration and sheet setup complete.');
