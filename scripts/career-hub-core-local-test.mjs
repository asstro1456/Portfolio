import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CORE_PATH = path.join(ROOT, 'apps-script', 'career-hub-core', 'Core.gs');

const JOB_WIDTH = 17;
const WEEKLY_WIDTH = 9;
const EXCLUDED_WIDTH = 6;

class FakeDate extends Date {
  constructor(...args) {
    if (args.length === 0) {
      super('2026-06-05T00:00:00+09:00');
    } else {
      super(...args);
    }
  }

  static now() {
    return new FakeDate().getTime();
  }
}

class FakeRange {
  constructor(sheet, row, column, numRows, numColumns) {
    this.sheet = sheet;
    this.row = row;
    this.column = column;
    this.numRows = numRows;
    this.numColumns = numColumns;
  }

  getValues() {
    const values = [];
    for (let rowOffset = 0; rowOffset < this.numRows; rowOffset += 1) {
      const row = [];
      for (let columnOffset = 0; columnOffset < this.numColumns; columnOffset += 1) {
        row.push(this.sheet.getCell(this.row + rowOffset, this.column + columnOffset));
      }
      values.push(row);
    }
    return values;
  }

  getDisplayValues() {
    return this.getValues().map((row) => row.map((value) => String(value ?? '')));
  }

  setValues(values) {
    values.forEach((row, rowOffset) => {
      row.forEach((value, columnOffset) => {
        this.sheet.setCell(this.row + rowOffset, this.column + columnOffset, value);
      });
    });
    return this;
  }
}

class FakeSheet {
  constructor(rows) {
    this.rows = rows.map((row) => row.slice());
    this.deletedRows = 0;
    this.deletedBlocks = [];
  }

  getLastRow() {
    return this.rows.length;
  }

  getRange(row, column, numRows = 1, numColumns = 1) {
    return new FakeRange(this, row, column, numRows, numColumns);
  }

  getCell(row, column) {
    return (this.rows[row - 1] || [])[column - 1] ?? '';
  }

  setCell(row, column, value) {
    while (this.rows.length < row) this.rows.push([]);
    while (this.rows[row - 1].length < column) this.rows[row - 1].push('');
    this.rows[row - 1][column - 1] = value;
  }

  deleteRow(row) {
    this.deletedRows += 1;
    this.rows.splice(row - 1, 1);
  }

  deleteRows(row, count) {
    this.deletedBlocks.push([row, count]);
    this.rows.splice(row - 1, count);
  }
}

class FakeSpreadsheet {
  constructor(sheets) {
    this.sheets = sheets;
  }

  getSheetByName(name) {
    return this.sheets[name] || null;
  }
}

function loadCoreContext() {
  const context = {
    console,
    Date: FakeDate,
    Utilities: {
      formatDate(date, _timezone, format) {
        const value = new Date(date);
        const yyyy = String(value.getFullYear());
        const mm = String(value.getMonth() + 1).padStart(2, '0');
        const dd = String(value.getDate()).padStart(2, '0');
        const hh = String(value.getHours()).padStart(2, '0');
        const mi = String(value.getMinutes()).padStart(2, '0');
        const ss = String(value.getSeconds()).padStart(2, '0');
        if (format === 'yyyy-MM-dd') return `${yyyy}-${mm}-${dd}`;
        if (format === 'yyyy-MM-dd HH:mm:ss') return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        return `${yyyy}-${mm}-${dd}`;
      }
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput(value) {
        return { setMimeType: () => value };
      }
    }
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(CORE_PATH, 'utf8'), context, { filename: CORE_PATH });
  return context;
}

function makeRow(overrides = {}) {
  const row = Array(JOB_WIDTH).fill('');
  row[0] = overrides.date ?? '2026-06-05';
  row[1] = overrides.band ?? '신입/경력무관';
  row[2] = overrides.company ?? '테스트회사';
  row[3] = overrides.title ?? '테스트 공고';
  row[4] = overrides.category ?? '게임기획';
  row[9] = overrides.priority ?? '중';
  row[10] = overrides.url ?? '';
  row[13] = overrides.listed ?? '경력무관';
  row[14] = overrides.body ?? '수동 확인 필요';
  row[15] = overrides.manual ?? '확인 전';
  row[16] = overrides.evidence ?? '';
  return row;
}

function header(width) {
  return Array.from({ length: width }, (_, index) => `H${index + 1}`);
}

function testManualApplyDoesNotDeleteRows() {
  const context = loadCoreContext();
  const jobsSheet = new FakeSheet([
    header(JOB_WIDTH),
    makeRow({ title: '2년 공고', url: 'https://gamejob/a', manual: '2년 이상' }),
    makeRow({ title: '마감 공고', url: 'https://gamejob/b', manual: '마감' }),
    makeRow({ title: '대기 공고', url: 'https://gamejob/c', band: '3~5년차', manual: '확인 전' })
  ]);
  const weeklySheet = new FakeSheet([
    header(WEEKLY_WIDTH),
    ['2026-06-05', 0, 0, 0, 0, '', '', '', '']
  ]);
  const excludedSheet = new FakeSheet([header(EXCLUDED_WIDTH)]);
  const ss = new FakeSpreadsheet({
    공고상세: jobsSheet,
    주간요약: weeklySheet,
    제외사례: excludedSheet
  });

  const result = context.applyManualExperienceOverrides_(ss);

  assert.equal(jobsSheet.rows.length, 4);
  assert.equal(jobsSheet.deletedRows, 0);
  assert.deepEqual(jobsSheet.deletedBlocks, []);
  assert.equal(jobsSheet.rows[1][1], '1~3년차');
  assert.equal(jobsSheet.rows[2][1], '마감');
  assert.equal(jobsSheet.rows[3][1], '3~5년차');
  assert.match(jobsSheet.rows[1][16], /수동입력경력\(2년 이상\) 적용/);
  assert.match(jobsSheet.rows[2][16], /수동입력경력\(마감\) 적용/);
  assert.equal(excludedSheet.rows.length, 2);
  assert.equal(weeklySheet.rows[1][1], 0);
  assert.equal(weeklySheet.rows[1][2], 1);
  assert.equal(weeklySheet.rows[1][3], 1);
  assert.equal(weeklySheet.rows[1][4], 2);
  assert.equal(result.removedJobs, 0);
  assert.equal(result.updatedJobs, 2);
  assert.equal(result.recordedExcluded, 1);
}

function testManualCarryForwardIsConservative() {
  const context = loadCoreContext();
  const existingJobsSheet = new FakeSheet([
    header(JOB_WIDTH),
    makeRow({ date: '2026-06-01', title: 'URL 유지', url: 'https://gamejob/stable', manual: '3년 이상' }),
    makeRow({ date: '2026-06-01', company: '중복회사', title: '같은 제목', url: '', manual: '1년 이상' }),
    makeRow({ date: '2026-06-01', company: '중복회사', title: '같은 제목', url: '', manual: '2년 이상' }),
    makeRow({ date: '2025-01-01', title: '오래된 공고', url: 'https://gamejob/stale', manual: '4년 이상' })
  ]);
  const jobRows = [
    makeRow({ title: 'URL 유지', url: 'https://gamejob/stable', manual: '확인 전', band: '신입/경력무관' }),
    makeRow({ company: '중복회사', title: '같은 제목', url: '', manual: '확인 전' }),
    makeRow({ title: '오래된 공고', url: 'https://gamejob/stale', manual: '확인 전' }),
    makeRow({ title: '새 공고', url: 'https://gamejob/new', manual: '확인 전' })
  ];
  const excludedRows = [];

  const result = context.carryForwardManualExperience_(existingJobsSheet, jobRows, excludedRows);

  assert.equal(jobRows[0][15], '3년 이상');
  assert.equal(jobRows[0][1], '3~5년차');
  assert.match(jobRows[0][16], /기존 수동입력경력\(3년 이상, URL\) 반영/);
  assert.equal(jobRows[1][15], '확인 전');
  assert.equal(jobRows[2][15], '확인 전');
  assert.equal(jobRows[3][15], '확인 전');
  assert.equal(result.preservedManual, 1);
  assert.equal(result.reclassified, 1);
  assert.equal(result.ambiguousManual, 1);
  assert.equal(result.staleManual, 1);
  assert.equal(result.unmatchedManual, 1);
  assert.equal(excludedRows.length, 0);
}

function testCarryForwardRecordsManualExclusion() {
  const context = loadCoreContext();
  const existingJobsSheet = new FakeSheet([
    header(JOB_WIDTH),
    makeRow({ date: '2026-06-01', title: '제외 공고', url: 'https://gamejob/excluded', manual: '제외 대상' })
  ]);
  const jobRows = [
    makeRow({ title: '제외 공고', url: 'https://gamejob/excluded', manual: '확인 전' })
  ];
  const excludedRows = [];

  const result = context.carryForwardManualExperience_(existingJobsSheet, jobRows, excludedRows);

  assert.equal(jobRows[0][15], '제외 대상');
  assert.equal(jobRows[0][1], '제외 대상');
  assert.equal(result.recordedExcluded, 1);
  assert.equal(excludedRows.length, 1);
  assert.equal(excludedRows[0][2], '수동 제외');
}

function testCleanupBodyExperienceFromListed() {
  const context = loadCoreContext();
  const jobsSheet = new FakeSheet([
    header(JOB_WIDTH),
    makeRow({ listed: '경력무관', body: '수동 확인 필요', manual: '신입/경력 없음' }),
    makeRow({ listed: '신입', body: '수동 확인 필요', manual: '제외 대상' }),
    makeRow({ listed: '경력5년↑', body: '수동 확인 필요', manual: '5년 이상' }),
    makeRow({ listed: '경력무관', body: '경력 문구 있음/연차 미기재', manual: '확인 전' })
  ]);
  const ss = new FakeSpreadsheet({
    공고상세: jobsSheet
  });

  const result = context.cleanupBodyExperienceFromListed_(ss);

  assert.equal(jobsSheet.rows[1][14], '연차 명시 없음');
  assert.equal(jobsSheet.rows[2][14], '신입');
  assert.equal(jobsSheet.rows[3][14], '5년 이상');
  assert.equal(jobsSheet.rows[4][14], '경력 문구 있음/연차 미기재');
  assert.match(jobsSheet.rows[1][16], /O열 표시경력 기준 정리/);
  assert.equal(result.resolvedManualRows, 3);
  assert.equal(result.updatedBodyExperience, 3);
  assert.equal(result.updatedEvidence, 3);
}

function testNormalizeBodyExperienceDropdownValues() {
  const context = loadCoreContext();
  const jobsSheet = new FakeSheet([
    header(JOB_WIDTH),
    makeRow({ listed: '경력3년↑', body: '목록 표시 연차 사용', manual: '확인 전' }),
    makeRow({ listed: '경력무관', body: '3년 이상 명시', manual: '확인 전' }),
    makeRow({ listed: '경력무관', body: '신입 가능 / 경력 10년 이하', manual: '확인 전' }),
    makeRow({ listed: '경력무관', body: '연차 명시 없음', manual: '확인 전' })
  ]);
  const ss = new FakeSpreadsheet({
    공고상세: jobsSheet
  });

  const result = context.normalizeBodyExperienceDropdownValues_(ss);

  assert.equal(jobsSheet.rows[1][14], '3년 이상');
  assert.equal(jobsSheet.rows[2][14], '3년 이상');
  assert.equal(jobsSheet.rows[3][14], '신입');
  assert.equal(jobsSheet.rows[4][14], '연차 명시 없음');
  assert.match(jobsSheet.rows[1][16], /O열 드롭다운 값 정리/);
  assert.equal(result.invalidRows, 3);
  assert.equal(result.updatedBodyExperience, 3);
  assert.equal(result.updatedEvidence, 3);
  assert.equal(result.unresolvedRows, 0);
}

testManualApplyDoesNotDeleteRows();
testManualCarryForwardIsConservative();
testCarryForwardRecordsManualExclusion();
testCleanupBodyExperienceFromListed();
testNormalizeBodyExperienceDropdownValues();

console.log('Career Hub core local tests passed.');
