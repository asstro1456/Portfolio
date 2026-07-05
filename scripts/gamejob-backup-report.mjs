import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BACKUP_DIR = process.env.GAMEJOB_OUT_DIR || 'C:\\Users\\User\\.codex\\automations\\automation';
const DEFAULT_OUT_DIR = path.resolve('tmp');

function parseArgs(argv) {
  const options = {
    backupDir: DEFAULT_BACKUP_DIR,
    date: '',
    previous: '',
    out: '',
    write: false,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--backup-dir') options.backupDir = argv[++index] || options.backupDir;
    else if (arg === '--date') options.date = argv[++index] || '';
    else if (arg === '--previous') options.previous = argv[++index] || '';
    else if (arg === '--out') {
      options.out = argv[++index] || '';
      options.write = true;
    } else if (arg === '--write') options.write = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
  }

  return options;
}

function usage() {
  return [
    'Usage: node scripts/gamejob-backup-report.mjs [--date YYYY-MM-DD] [--previous YYYY-MM-DD] [--write] [--json]',
    '',
    'Examples:',
    '  node scripts/gamejob-backup-report.mjs --date 2026-06-21 --write',
    '  node scripts/gamejob-backup-report.mjs --json',
  ].join('\n');
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    throw error;
  }
}

async function listPayloadDates(backupDir) {
  const entries = await fs.readdir(backupDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => /^gamejob_payload_(\d{4}-\d{2}-\d{2})\.json$/.exec(entry.name)?.[1] || '')
    .filter(Boolean)
    .sort();
}

function previousDateFor(dates, date) {
  const index = dates.indexOf(date);
  return index > 0 ? dates[index - 1] : '';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeUrl(value) {
  return String(value || '').trim().toLowerCase().replace(/\/+$/, '');
}

function extractGameJobId(value) {
  const match = String(value || '').replace(/&amp;/gi, '&').match(/[?&](?:GI_No|gno)=([0-9]+)/i);
  return match ? match[1] : '';
}

function titleKey(row) {
  return `${normalizeText(row.회사)}|${normalizeText(row.공고명)}`;
}

function manualValue(row) {
  return String(row.수동입력경력 || '').trim();
}

function isManualNeeded(row) {
  return String(row.본문요구경력 || '').trim() === '수동 확인 필요';
}

function isPendingManual(row) {
  return isManualNeeded(row) && manualValue(row) === '확인 전';
}

function buildPreviousIndexes(previousJobs) {
  const byId = new Map();
  const byUrl = new Map();
  const byTitle = new Map();

  for (const row of previousJobs) {
    const id = extractGameJobId(row.공고URL);
    const url = normalizeUrl(row.공고URL);
    const key = titleKey(row);
    if (id) byId.set(id, row);
    if (url) byUrl.set(url, row);
    if (key !== '|') {
      if (!byTitle.has(key)) byTitle.set(key, []);
      byTitle.get(key).push(row);
    }
  }

  return { byId, byUrl, byTitle };
}

function classifyAgainstPrevious(row, previousIndexes) {
  const id = extractGameJobId(row.공고URL);
  const url = normalizeUrl(row.공고URL);
  const key = titleKey(row);
  const samePosting = (id && previousIndexes.byId.get(id)) || (url && previousIndexes.byUrl.get(url));
  if (samePosting) {
    return {
      category: isPendingManual(samePosting) ? '전주 동일 공고도 확인 전' : '전주 동일 공고 존재',
      previousId: extractGameJobId(samePosting.공고URL),
      previousManualExperience: manualValue(samePosting),
      previousBodyExperience: samePosting.본문요구경력 || '',
    };
  }

  const titleMatches = previousIndexes.byTitle.get(key) || [];
  if (titleMatches.length > 1) {
    return {
      category: '전주 회사+공고명 중복',
      previousId: titleMatches.map((match) => extractGameJobId(match.공고URL)).filter(Boolean).join(', '),
      previousManualExperience: titleMatches.map((match) => manualValue(match)).filter(Boolean).join(', '),
      previousBodyExperience: '',
    };
  }
  if (titleMatches.length === 1) {
    const previous = titleMatches[0];
    return {
      category: isPendingManual(previous) ? '같은 제목 재등록, 전주도 확인 전' : '같은 제목 재등록',
      previousId: extractGameJobId(previous.공고URL),
      previousManualExperience: manualValue(previous),
      previousBodyExperience: previous.본문요구경력 || '',
    };
  }

  return {
    category: '신규',
    previousId: '',
    previousManualExperience: '',
    previousBodyExperience: '',
  };
}

function normalizeDiagnosticRow(row) {
  return {
    기준일: row.기준일 || '',
    회사: row.회사 || '',
    공고명: row.공고명 || '',
    공고URL: row.공고URL || '',
    표시경력: row.표시경력 || '',
    본문요구경력: row.본문요구경력 || '',
    수동입력경력: row.수동입력경력 || '',
    경력판정근거: row.경력판정근거 || '',
    원인: row.원인 || '',
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || '미분류';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function buildReport({ date, previousDate, payload, previousPayload, postResult, backupDir }) {
  const jobs = payload.jobs || [];
  const previousJobs = previousPayload?.jobs || [];
  const previousIndexes = buildPreviousIndexes(previousJobs);
  const manualExperience = postResult?.manualExperience || null;
  const diagnosticRows = Array.isArray(manualExperience?.unmatchedManualRows)
    ? manualExperience.unmatchedManualRows.map(normalizeDiagnosticRow)
    : [];
  const payloadPendingRows = jobs.filter(isPendingManual).map(normalizeDiagnosticRow);
  const sourceRows = diagnosticRows.length > 0 ? diagnosticRows : payloadPendingRows;
  const sourceMode = diagnosticRows.length > 0 ? 'post_result.unmatchedManualRows' : 'payload.pendingManualRows';

  const unmatchedRows = sourceRows.map((row) => {
    const classified = classifyAgainstPrevious(row, previousIndexes);
    return {
      ...row,
      gameJobId: extractGameJobId(row.공고URL),
      previousGameJobId: classified.previousId,
      previousManualExperience: classified.previousManualExperience,
      previousBodyExperience: classified.previousBodyExperience,
      category: classified.category,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    backupDir,
    date,
    previousDate,
    sourceMode,
    limitation: diagnosticRows.length > 0
      ? ''
      : '이 날짜의 post_result에는 unmatchedManualRows가 없어 payload의 확인 전 행으로 대체했습니다. 웹앱 carry-forward 이후 최종 unmatched 행과 다를 수 있습니다.',
    summary: {
      included: jobs.length,
      excluded: (payload.excluded || []).length,
      manualRequiredInPayload: jobs.filter(isManualNeeded).length,
      pendingManualInPayload: payloadPendingRows.length,
      postManualExperience: manualExperience,
      reportedRows: unmatchedRows.length,
      categories: countBy(unmatchedRows, 'category'),
    },
    rows: unmatchedRows,
  };
}

function formatMarkdown(report) {
  const lines = [
    `# GameJob backup report ${report.date}`,
    '',
    `- previous: ${report.previousDate || 'none'}`,
    `- source: ${report.sourceMode}`,
    `- included/excluded: ${report.summary.included}/${report.summary.excluded}`,
    `- manual required in payload: ${report.summary.manualRequiredInPayload}`,
    `- pending manual in payload: ${report.summary.pendingManualInPayload}`,
    `- reported rows: ${report.summary.reportedRows}`,
  ];
  if (report.summary.postManualExperience) {
    lines.push(`- post unmatchedManual: ${report.summary.postManualExperience.unmatchedManual ?? 'n/a'}`);
    lines.push(`- post preservedManual: ${report.summary.postManualExperience.preservedManual ?? 'n/a'}`);
  }
  if (report.limitation) lines.push(`- limitation: ${report.limitation}`);

  lines.push('', '## Categories');
  for (const [category, count] of Object.entries(report.summary.categories)) {
    lines.push(`- ${category}: ${count}`);
  }

  lines.push('', '## Rows');
  for (const row of report.rows.slice(0, 50)) {
    lines.push(`- ${row.gameJobId || '-'} | ${row.category} | ${row.회사} | ${row.공고명}`);
  }
  if (report.rows.length > 50) lines.push(`- ... ${report.rows.length - 50} more`);
  return lines.join('\n');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const dates = await listPayloadDates(options.backupDir);
  if (dates.length === 0) throw new Error(`No gamejob payload backups found: ${options.backupDir}`);
  const date = options.date || dates[dates.length - 1];
  if (!dates.includes(date)) throw new Error(`Payload backup not found for date: ${date}`);
  const previousDate = options.previous || previousDateFor(dates, date);

  const payloadPath = path.join(options.backupDir, `gamejob_payload_${date}.json`);
  const postResultPath = path.join(options.backupDir, `gamejob_post_result_${date}.json`);
  const previousPayloadPath = previousDate ? path.join(options.backupDir, `gamejob_payload_${previousDate}.json`) : '';
  const payload = await readJsonIfExists(payloadPath);
  const previousPayload = previousPayloadPath ? await readJsonIfExists(previousPayloadPath) : null;
  const postResult = await readJsonIfExists(postResultPath);

  const report = buildReport({ date, previousDate, payload, previousPayload, postResult, backupDir: options.backupDir });
  if (options.write) {
    const outPath = options.out || path.join(DEFAULT_OUT_DIR, `gamejob_backup_report_${date}.json`);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(report, null, 2), 'utf8');
    report.outputPath = outPath;
  }

  console.log(options.json ? JSON.stringify(report, null, 2) : formatMarkdown(report));
}

await main();
