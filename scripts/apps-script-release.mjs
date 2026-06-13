import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const APPS_SCRIPT_DIR = path.join(ROOT, 'apps-script');
const CORE_DIR = path.join(APPS_SCRIPT_DIR, 'career-hub-core');
const HUB_WEBAPP_DIR = path.join(APPS_SCRIPT_DIR, 'career-hub-webapp');
const QA_WEBAPP_DIR = path.join(APPS_SCRIPT_DIR, 'qa-tc-webapp');
const HUB_MANIFEST = path.join(HUB_WEBAPP_DIR, 'appsscript.json');
const QA_MANIFEST = path.join(QA_WEBAPP_DIR, 'appsscript.json');
const LOCAL_CONFIG = path.join(APPS_SCRIPT_DIR, '.gas-release.local.json');
const CLASP_ENTRY = path.join(ROOT, 'node_modules', '@google', 'clasp', 'build', 'src', 'index.js');

const command = process.argv[2] || 'help';

const TARGETS = {
  hub: {
    label: 'career hub webapp',
    directory: HUB_WEBAPP_DIR,
    manifest: HUB_MANIFEST,
    deploymentIdField: 'webappDeploymentId',
    urlField: 'webAppUrl',
    secretEnv: 'CAREER_HUB_WEBHOOK_SECRET',
    secretConfigField: '',
    service: 'career-hub-webapp',
    releaseDescription: 'Career hub webapp release',
    preflightDescription: 'Career hub automated preflight'
  },
  qa: {
    label: 'QA TC webapp',
    directory: QA_WEBAPP_DIR,
    manifest: QA_MANIFEST,
    deploymentIdField: 'qaWebappDeploymentId',
    urlField: 'qaWebAppUrl',
    secretEnv: 'QA_TC_WEBHOOK_SECRET',
    secretConfigField: 'qaWebhookSecret',
    service: 'qa-tc-webapp',
    releaseDescription: 'QA TC webapp release',
    preflightDescription: 'QA TC automated preflight'
  }
};

function fail(message) {
  console.error(message);
  process.exitCode = 1;
  throw new Error(message);
}

function requireFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} file is missing: ${path.relative(ROOT, filePath)}`);
  }
}

function readJson(filePath, label) {
  requireFile(filePath, label);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${label} JSON could not be parsed: ${error.message}`);
  }
}

function assertClaspInstalled() {
  requireFile(CLASP_ENTRY, '@google/clasp executable');
}

function assertLinked(directory, label) {
  const claspFile = path.join(directory, '.clasp.json');
  const config = readJson(claspFile, `${label} .clasp.json`);
  if (!config.scriptId || /REPLACE_WITH/i.test(config.scriptId)) {
    fail(`${label} .clasp.json needs a real Script ID.`);
  }
}

function readReleaseConfig(requiredFields = []) {
  const config = readJson(LOCAL_CONFIG, 'local release config');
  ['libraryId'].concat(requiredFields).forEach((field) => {
    if (!config[field] || /REPLACE_WITH/i.test(config[field])) {
      fail(`Set ${field} in apps-script/.gas-release.local.json.`);
    }
  });
  return config;
}

function requireVerificationSecret(envName, configField = '') {
  const config = fs.existsSync(LOCAL_CONFIG) ? readJson(LOCAL_CONFIG, 'local release config') : {};
  const secret = process.env[envName] || (configField ? config[configField] : '');
  if (!secret) {
    fail(`Set ${envName} in the current shell before verification or release.`);
  }
  return secret;
}

function runClasp(args, directory, captureOutput = false) {
  assertClaspInstalled();
  const result = spawnSync(process.execPath, [CLASP_ENTRY].concat(args), {
    cwd: directory,
    encoding: 'utf8',
    stdio: captureOutput ? 'pipe' : 'inherit'
  });

  if (captureOutput) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.error) fail(`clasp failed to start: ${result.error.message}`);
  if (result.status !== 0) fail(`clasp ${args[0]} failed.`);

  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function push(directory, label) {
  assertLinked(directory, label);
  runClasp(['push', '--force'], directory);
}

function createVersion(directory, description) {
  const output = runClasp(['version', description], directory, true);
  const match = output.match(/(?:Created\s+version|version)\s+(\d+)/i);
  if (!match) fail('Could not find the created Apps Script version number.');
  return match[1];
}

function parseClaspJson(output, action) {
  try {
    return JSON.parse(output.trim());
  } catch (error) {
    fail(`clasp ${action} response was not valid JSON.`);
  }
}

function updateLibraryReference(target, libraryId, version) {
  const manifest = readJson(target.manifest, `${target.label} manifest`);
  const libraries = manifest.dependencies && manifest.dependencies.libraries;
  if (!Array.isArray(libraries) || libraries.length !== 1) {
    fail(`${target.label} manifest must contain exactly one library reference.`);
  }

  libraries[0].userSymbol = 'CareerHubCore';
  libraries[0].libraryId = libraryId;
  libraries[0].version = String(version);
  libraries[0].developmentMode = false;
  fs.writeFileSync(target.manifest, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`${target.label} now references CareerHubCore version ${version}.`);
}

function assertLibraryReferenceConfigured(target) {
  const manifest = readJson(target.manifest, `${target.label} manifest`);
  const library = manifest.dependencies && manifest.dependencies.libraries && manifest.dependencies.libraries[0];
  if (!library || !library.libraryId || /REPLACE_WITH/i.test(library.libraryId)) {
    fail(`${target.label} manifest library ID is not configured.`);
  }
  if (library.developmentMode !== false) {
    fail(`${target.label} must use developmentMode: false.`);
  }
}

function redeploy(target, deploymentId, webappVersion, description) {
  runClasp([
    'redeploy',
    deploymentId,
    '--versionNumber',
    String(webappVersion),
    '--description',
    description
  ], target.directory);
}

function readDeployedVersion(target, deploymentId) {
  const output = runClasp(['--json', 'deployments'], target.directory, true);
  const deployments = parseClaspJson(output, 'deployments');
  const deployment = deployments.find((item) => item.deploymentId === deploymentId);
  if (!deployment || !deployment.versionNumber) {
    fail(`Could not find deployed version for ${target.label}.`);
  }
  return String(deployment.versionNumber);
}

function createPreflightDeployment(target, webappVersion) {
  const output = runClasp([
    '--json',
    'deploy',
    '--versionNumber',
    String(webappVersion),
    '--description',
    target.preflightDescription
  ], target.directory, true);
  const deployment = parseClaspJson(output, 'deploy');
  if (!deployment.deploymentId) fail(`Could not create preflight deployment for ${target.label}.`);
  return {
    webAppUrl: `https://script.google.com/macros/s/${deployment.deploymentId}/exec`,
    deploymentId: deployment.deploymentId
  };
}

function removePreflightDeployment(target, deploymentId) {
  runClasp(['undeploy', deploymentId], target.directory);
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch (error) {
    fail(`Webapp response was not JSON. HTTP ${response.status}`);
  }
  if (!response.ok) fail(`Webapp request failed: HTTP ${response.status}`);
  return parsed;
}

async function verifyWebapp(url, target, secret) {
  const health = await fetchJson(url);
  if (!health.ok || health.service !== target.service) {
    fail(`${target.label} health response did not match ${target.service}.`);
  }

  const unauthorized = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'validate', secret: `invalid-${Date.now()}` })
  });
  if (unauthorized.ok !== false || unauthorized.error !== 'unauthorized') {
    fail(`${target.label} did not reject an invalid secret.`);
  }

  const validation = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'validate', secret })
  });
  if (!validation.ok || validation.writePerformed !== false || !Array.isArray(validation.tabs)) {
    fail(`${target.label} validate response is not correct.`);
  }

  console.log(`Verified ${target.label}: ${validation.sheetTitle} / ${validation.tabs.length} tabs / no write performed`);
}

async function promoteWebappVersion(target, config, webappVersion, secret) {
  const deploymentId = config[target.deploymentIdField];
  const previousVersion = readDeployedVersion(target, deploymentId);
  const preflight = createPreflightDeployment(target, webappVersion);

  try {
    await verifyWebapp(preflight.webAppUrl, target, secret);
  } finally {
    removePreflightDeployment(target, preflight.deploymentId);
  }

  redeploy(target, deploymentId, webappVersion, `${target.releaseDescription} ${new Date().toISOString()}`);
  try {
    await verifyWebapp(config[target.urlField], target, secret);
  } catch (error) {
    console.error(`Verification failed. Rolling ${target.label} back to version ${previousVersion}.`);
    redeploy(target, deploymentId, previousVersion, `${target.label} rollback ${new Date().toISOString()}`);
    throw error;
  }
}

async function applyQaSetup(config, secret) {
  const response = await fetchJson(config.qaWebAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'setupTcSheet', secret })
  });
  if (!response.ok) {
    fail(`QA TC setup failed: ${response.error || 'unknown error'}`);
  }
  console.log(`QA TC setup applied: ${response.spreadsheetUrl}`);
}

function checkSource() {
  const appScriptSources = [
    path.join(CORE_DIR, 'Core.gs'),
    path.join(HUB_WEBAPP_DIR, 'Main.gs'),
    path.join(QA_WEBAPP_DIR, 'Main.gs')
  ];
  const scannedSources = appScriptSources.concat(path.join(SCRIPT_DIR, 'apps-script-release.mjs'));

  appScriptSources.forEach((filePath) => {
    requireFile(filePath, 'source');
    const source = fs.readFileSync(filePath, 'utf8');
    new vm.Script(source, { filename: filePath });
  });

  scannedSources.forEach((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    if (/(?:const|let|var)\s+WEBHOOK_SECRET\s*=\s*['"][^'"]+['"]/.test(source)) {
      fail(`Hard-coded webhook secret found: ${path.relative(ROOT, filePath)}`);
    }
    if (/webhookSecret\s*:\s*['"][^'"]{12,}['"]/.test(source)) {
      fail(`Hard-coded webhook secret config found: ${path.relative(ROOT, filePath)}`);
    }
  });

  const ignoreFile = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  ['.clasp.json', '.clasprc.json', '.env.*', 'apps-script/.gas-release.local.json'].forEach((pattern) => {
    if (!ignoreFile.includes(pattern)) fail(`.gitignore is missing: ${pattern}`);
  });

  console.log('Apps Script local check complete: syntax, secret rules, and ignored local config are valid.');
}

async function releaseTarget(target) {
  const config = readReleaseConfig([target.deploymentIdField, target.urlField]);
  const secret = requireVerificationSecret(target.secretEnv, target.secretConfigField);
  assertLibraryReferenceConfigured(target);
  push(target.directory, target.label);
  const webappVersion = createVersion(target.directory, target.releaseDescription);
  await promoteWebappVersion(target, config, webappVersion, secret);
}

async function releaseCoreAndTarget(target) {
  const config = readReleaseConfig([target.deploymentIdField, target.urlField]);
  const secret = requireVerificationSecret(target.secretEnv, target.secretConfigField);
  push(CORE_DIR, 'core library');
  const coreVersion = createVersion(CORE_DIR, 'Sheet automation core release');
  updateLibraryReference(target, config.libraryId, coreVersion);
  push(target.directory, target.label);
  const webappVersion = createVersion(target.directory, target.releaseDescription);
  await promoteWebappVersion(target, config, webappVersion, secret);
}

async function main() {
  switch (command) {
    case 'check':
      checkSource();
      return;
    case 'login':
      runClasp(['login'], ROOT);
      return;
    case 'push:core':
      push(CORE_DIR, 'core library');
      return;
    case 'push:hub':
      assertLibraryReferenceConfigured(TARGETS.hub);
      push(HUB_WEBAPP_DIR, TARGETS.hub.label);
      return;
    case 'push:qa':
      assertLibraryReferenceConfigured(TARGETS.qa);
      push(QA_WEBAPP_DIR, TARGETS.qa.label);
      return;
    case 'release:hub':
      await releaseTarget(TARGETS.hub);
      return;
    case 'release:qa':
      await releaseTarget(TARGETS.qa);
      return;
    case 'release:all':
      await releaseCoreAndTarget(TARGETS.hub);
      await releaseCoreAndTarget(TARGETS.qa);
      return;
    case 'release:all:hub':
      await releaseCoreAndTarget(TARGETS.hub);
      return;
    case 'release:all:qa':
      await releaseCoreAndTarget(TARGETS.qa);
      return;
    case 'verify:hub': {
      const target = TARGETS.hub;
      const config = readReleaseConfig([target.urlField]);
      const secret = requireVerificationSecret(target.secretEnv, target.secretConfigField);
      await verifyWebapp(config[target.urlField], target, secret);
      return;
    }
    case 'verify:qa': {
      const target = TARGETS.qa;
      const config = readReleaseConfig([target.urlField]);
      const secret = requireVerificationSecret(target.secretEnv, target.secretConfigField);
      await verifyWebapp(config[target.urlField], target, secret);
      return;
    }
    case 'setup:qa': {
      const config = readReleaseConfig(['qaWebAppUrl']);
      const secret = requireVerificationSecret(TARGETS.qa.secretEnv, TARGETS.qa.secretConfigField);
      await applyQaSetup(config, secret);
      return;
    }
    default:
      console.log('Usage: node scripts/apps-script-release.mjs <check|login|push:core|push:hub|push:qa|release:hub|release:qa|release:all|release:all:hub|release:all:qa|verify:hub|verify:qa|setup:qa>');
  }
}

try {
  await main();
} catch (error) {
  if (!process.exitCode) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
