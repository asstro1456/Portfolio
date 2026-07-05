/**
 * Shared career-hub library for Google Apps Script.
 *
 * Consumer web apps pass their target spreadsheet and authentication
 * settings into the public functions below. No destination or secret is
 * stored in this library source.
 */

const TAB_NAMES = {
  weekly: '주간요약',
  jobs: '공고상세',
  excluded: '제외사례',
  gameReferences: '게임경험레퍼런스',
  companyMonitor: '관심회사모니터',
  industryMaterials: '업계자료',
  chartData: '차트데이터',
  dashboard: '대시보드'
};

const WEEKLY_HEADERS = [
  '기준일',
  '신입/경력무관',
  '1~3년차',
  '3~5년차',
  '총공고수',
  '대표키워드',
  '이번주전략',
  '아카이브메모',
  '작성시각'
];

const JOB_HEADERS = [
  '기준일',
  '경력구간',
  '회사',
  '공고명',
  '직무분류',
  '주요업무',
  '요구역량',
  '우대사항',
  '추천포트폴리오',
  '지원우선도',
  '공고URL',
  '비고',
  '수집시각',
  '표시경력',
  '본문요구경력',
  '수동입력경력',
  '경력판정근거'
];

const CAREER_BAND_NEW = '신입/경력무관';
const CAREER_BAND_ONE_TO_THREE = '1~3년차';
const CAREER_BAND_THREE_TO_FIVE = '3~5년차';
const CAREER_BAND_UNSPECIFIED = '경력 문구 있음/연차 미기재';
const CAREER_BAND_OVER_LIMIT = '경력초과/제외';
const CAREER_BAND_MANUAL_EXCLUDED = '제외 대상';
const CAREER_BAND_CLOSED = '마감';
const ACTIVE_CAREER_BAND_OPTIONS = [
  CAREER_BAND_NEW,
  CAREER_BAND_ONE_TO_THREE,
  CAREER_BAND_THREE_TO_FIVE
];

const MANUAL_EXPERIENCE_PENDING = '확인 전';
const MANUAL_EXPERIENCE_NONE = '신입/경력 없음';
const MANUAL_EXPERIENCE_UNSPECIFIED = '연차 미기재';
const MANUAL_EXPERIENCE_OVER_LIMIT = '6년 이상/제외';
const MANUAL_EXPERIENCE_EXCLUDED = '제외 대상';
const MANUAL_EXPERIENCE_CLOSED = '마감';
const EXPERIENCE_YEAR_OPTIONS = [
  '1년 이상',
  '2년 이상',
  '3년 이상',
  '4년 이상',
  '5년 이상'
];
const MANUAL_EXCLUDED_OPTIONS = [
  MANUAL_EXPERIENCE_OVER_LIMIT,
  MANUAL_EXPERIENCE_EXCLUDED,
  MANUAL_EXPERIENCE_CLOSED
];
const MANUAL_EXPERIENCE_OPTIONS = [MANUAL_EXPERIENCE_PENDING, MANUAL_EXPERIENCE_NONE]
  .concat(EXPERIENCE_YEAR_OPTIONS)
  .concat([MANUAL_EXPERIENCE_UNSPECIFIED])
  .concat(MANUAL_EXCLUDED_OPTIONS);

const BODY_EXPERIENCE_OPTIONS = [
  '신입',
  '연차 명시 없음',
  '본문 연차 명시 없음',
  CAREER_BAND_UNSPECIFIED,
  '수동 확인 필요'
].concat(EXPERIENCE_YEAR_OPTIONS).concat([MANUAL_EXPERIENCE_OVER_LIMIT]);

const MANUAL_EXPERIENCE_ALIASES = {
  '6년 이상': MANUAL_EXPERIENCE_OVER_LIMIT,
  '6년차 이상': MANUAL_EXPERIENCE_OVER_LIMIT,
  '6년차 이상/제외': MANUAL_EXPERIENCE_OVER_LIMIT
};

const MANUAL_EXPERIENCE_TO_CAREER_BAND = {
  '신입/경력 없음': CAREER_BAND_NEW,
  '1년 이상': CAREER_BAND_ONE_TO_THREE,
  '2년 이상': CAREER_BAND_ONE_TO_THREE,
  '3년 이상': CAREER_BAND_THREE_TO_FIVE,
  '4년 이상': CAREER_BAND_THREE_TO_FIVE,
  '5년 이상': CAREER_BAND_THREE_TO_FIVE,
  '연차 미기재': CAREER_BAND_UNSPECIFIED
};

const MANUAL_EXCLUSION_CONFIG = {
  '6년 이상/제외': {
    careerBand: CAREER_BAND_OVER_LIMIT,
    category: '경력초과',
    reason: '수동입력경력에서 6년 이상/제외로 확인'
  },
  '제외 대상': {
    careerBand: CAREER_BAND_MANUAL_EXCLUDED,
    category: '수동 제외',
    reason: '수동입력경력에서 제외 대상으로 지정'
  },
  '마감': {
    careerBand: CAREER_BAND_CLOSED,
    category: '마감',
    reason: '수동입력경력에서 마감으로 확인'
  }
};
const MANUAL_CARRY_FORWARD_MAX_AGE_DAYS = 180;

const EXCLUDED_HEADERS = [
  '기준일',
  '회사/공고명',
  '제외분류',
  '제외이유',
  'URL',
  '수집시각'
];

const GAME_REFERENCE_HEADERS = [
  '수집일',
  '자료구분',
  '게임명/경험명',
  '개발/퍼블리셔',
  '장르',
  '플랫폼',
  '플레이시간/기간',
  '현재플레이',
  '플레이수준',
  '역할/기여',
  '좋았던점/인상포인트',
  '문제점/개선여지',
  '기획적으로배울점',
  '관련직무',
  '관련키워드',
  '포트폴리오연결',
  '활용방식',
  '우선도',
  'STAR근거',
  'URL/자료',
  '원본시트',
  '비고'
];

const COMPANY_MONITOR_HEADERS = [
  '마지막확인일',
  '회사',
  '관심도',
  '자료유형',
  '직무/이슈분류',
  '제목',
  '상태',
  '게시일/마감일',
  '관련프로젝트',
  '지원관점메모',
  '연결포트폴리오',
  '즉시액션',
  'URL',
  '수집시각'
];

const INDUSTRY_MATERIAL_HEADERS = [
  '확인일',
  '회사',
  '자료구분',
  '매체',
  '제목',
  '게시일',
  '핵심내용',
  '지원관점메모',
  '관련키워드',
  '연결포트폴리오',
  'URL',
  '수집시각'
];

function setupWorkbook(config) {
  const checkedConfig = requireConfig_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  ensureWorkbook(ss);
  dedupeAllTables(ss);
  const ranges = refreshChartData(ss);
  refreshDashboardCharts(ss, ranges);
  applyReadableLayout(ss);
  return jsonResponse({
    ok: true,
    message: 'Workbook setup complete',
    spreadsheetUrl: ss.getUrl()
  });
}

function applyManualExperience(config) {
  const outcome = applyManualExperienceToWorkbook(config);
  return jsonResponse({
    ok: true,
    message: 'Manual experience values applied',
    spreadsheetUrl: outcome.spreadsheetUrl,
    result: outcome.result
  });
}

function applyManualExperienceToWorkbook(config) {
  const checkedConfig = requireConfig_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  ensureWorkbook(ss);
  return applyManualExperienceToSpreadsheet_(ss);
}

function applyManualExperienceToSpreadsheet_(ss) {
  const result = applyManualExperienceOverrides_(ss);
  const ranges = refreshChartData(ss);
  refreshDashboardCharts(ss, ranges);
  applyReadableLayout(ss);
  return {
    spreadsheetUrl: ss.getUrl(),
    result: result
  };
}

function cleanupBodyExperienceFromListed(config) {
  const checkedConfig = requireConfig_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  ensureWorkbook(ss);
  const result = cleanupBodyExperienceFromListed_(ss);
  return jsonResponse({
    ok: true,
    message: 'Body experience values cleaned from listed experience',
    spreadsheetUrl: ss.getUrl(),
    result: result
  });
}


function importLinkedGameReferences(config) {
  const checkedConfig = requireReferenceConfig_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  ensureWorkbook(ss);
  const result = importGameExperienceReferences(ss, checkedConfig.referenceSourceIds);
  dedupeAllTables(ss);
  const ranges = refreshChartData(ss);
  refreshDashboardCharts(ss, ranges);
  applyReadableLayout(ss);
  return jsonResponse({
    ok: true,
    message: 'Linked game references import complete',
    spreadsheetUrl: ss.getUrl(),
    gameReferences: result
  });
}

function healthCheck(config) {
  requireConfig_(config);
  return jsonResponse({
    ok: true,
    service: 'career-hub-webapp',
    requiredTabs: Object.keys(TAB_NAMES).map(function (key) {
      return TAB_NAMES[key];
    })
  });
}

function validateConnection(config) {
  const checkedConfig = requireConfig_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);

  return jsonResponse({
    ok: true,
    sheetTitle: ss.getName(),
    tabs: ss.getSheets().map(function (sheet) {
      return sheet.getName();
    }),
    requiredTabs: Object.keys(TAB_NAMES).map(function (key) {
      return TAB_NAMES[key];
    }),
    writePerformed: false
  });
}

function handlePost(e, config) {
  const lock = LockService.getScriptLock();

  try {
    const checkedConfig = requireWebhookConfig_(config);
    const contents = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(contents);

    if (!payload || payload.secret !== checkedConfig.webhookSecret) {
      return jsonResponse({
        ok: false,
        error: 'unauthorized'
      });
    }

    if (payload.action === 'validate') {
      return validateConnection(checkedConfig);
    }

    if (payload.importGameReferences) {
      requireReferenceConfig_(checkedConfig);
    }

    lock.waitLock(30000);

    const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
    ensureWorkbook(ss);

    if (payload.action === 'setup') {
      dedupeAllTables(ss);
      const setupRanges = refreshChartData(ss);
      refreshDashboardCharts(ss, setupRanges);
      applyReadableLayout(ss);
      return jsonResponse({
        ok: true,
        message: 'Workbook setup complete',
        spreadsheetUrl: ss.getUrl()
      });
    }

    if (payload.action === 'applyManualExperience') {
      const outcome = applyManualExperienceToSpreadsheet_(ss);
      return jsonResponse({
        ok: true,
        message: 'Manual experience values applied',
        spreadsheetUrl: outcome.spreadsheetUrl,
        result: outcome.result
      });
    }

    if (payload.action === 'cleanupBodyExperienceFromListed') {
      const cleanupResult = cleanupBodyExperienceFromListed_(ss);
      return jsonResponse({
        ok: true,
        message: 'Body experience values cleaned from listed experience',
        spreadsheetUrl: ss.getUrl(),
        result: cleanupResult
      });
    }

    if (payload.action === 'normalizeBodyExperienceDropdownValues') {
      const normalizeResult = normalizeBodyExperienceDropdownValues_(ss);
      return jsonResponse({
        ok: true,
        message: 'Body experience values normalized to dropdown options',
        spreadsheetUrl: ss.getUrl(),
        result: normalizeResult
      });
    }

    if (payload.importGameReferences && !payload.weeklySummary && !payload.weekly && !payload.jobs && !payload.excluded && !payload.companyMonitor && !payload.industryMaterials) {
      const referenceImportOnly = importGameExperienceReferences(ss, checkedConfig.referenceSourceIds);
      dedupeAllTables(ss);
      const rangesOnly = refreshChartData(ss);
      refreshDashboardCharts(ss, rangesOnly);
      applyReadableLayout(ss);

      return jsonResponse({
        ok: true,
        spreadsheetUrl: ss.getUrl(),
        importedGameReferences: referenceImportOnly
      });
    }

    const includesWeekly = Boolean(payload.weeklySummary || payload.weekly_summary || payload.weekly);
    const weeklyRow = includesWeekly ? normalizeWeeklyRow(payload) : null;
    const 기준일 = weeklyRow ? weeklyRow[0] : textValue(pick(payload, ['기준일', 'date', 'baseDate'], todayDate()));
    const jobRows = normalizeJobRows(payload, 기준일);
    const excludedRows = normalizeExcludedRows(payload, 기준일);
    const gameReferenceRows = normalizeGameReferenceRows(payload, 기준일);
    const companyMonitorRows = normalizeCompanyMonitorRows(payload, 기준일);
    const industryMaterialRows = normalizeIndustryMaterialRows(payload, 기준일);

    const weeklySheet = ss.getSheetByName(TAB_NAMES.weekly);
    const jobsSheet = ss.getSheetByName(TAB_NAMES.jobs);
    const excludedSheet = ss.getSheetByName(TAB_NAMES.excluded);
    const gameReferenceSheet = ss.getSheetByName(TAB_NAMES.gameReferences);
    const companyMonitorSheet = ss.getSheetByName(TAB_NAMES.companyMonitor);
    const industryMaterialSheet = ss.getSheetByName(TAB_NAMES.industryMaterials);
    const manualCarryForwardResult = carryForwardManualExperience_(jobsSheet, jobRows, excludedRows);

    if (payload.replaceCollectedRowsForDate === true) {
      deleteRowsByDate_(jobsSheet, JOB_HEADERS.length, 기준일);
      deleteRowsByDate_(excludedSheet, EXCLUDED_HEADERS.length, 기준일);
    }

    const weeklyResult = weeklyRow ? upsertRows(weeklySheet, WEEKLY_HEADERS, [weeklyRow], [0]) : { inserted: 0, updated: 0, skipped: 0 };
    const jobsResult = upsertRows(jobsSheet, JOB_HEADERS, jobRows, [0, 10]);
    const excludedResult = upsertRows(excludedSheet, EXCLUDED_HEADERS, excludedRows, [0, 4, 1]);
    const gameReferenceResult = upsertRows(gameReferenceSheet, GAME_REFERENCE_HEADERS, gameReferenceRows, [1, 2, 20]);
    const companyMonitorResult = upsertRows(companyMonitorSheet, COMPANY_MONITOR_HEADERS, companyMonitorRows, [1, 12]);
    const industryMaterialResult = upsertRows(industryMaterialSheet, INDUSTRY_MATERIAL_HEADERS, industryMaterialRows, [1, 10]);
    const sourceImportResult = payload.importGameReferences ? importGameExperienceReferences(ss, checkedConfig.referenceSourceIds) : { inserted: 0, updated: 0, skipped: 0 };
    dedupeAllTables(ss);
    const manualWeeklyResult = manualCarryForwardResult.reclassified > 0 || manualCarryForwardResult.recordedExcluded > 0
      ? refreshWeeklySummaryFromJobRows_(ss, readTable(jobsSheet, JOB_HEADERS.length))
      : { updated: 0, inserted: 0 };

    const ranges = refreshChartData(ss);
    refreshDashboardCharts(ss, ranges);
    applyReadableLayout(ss);
    return jsonResponse({
      ok: true,
      spreadsheetUrl: ss.getUrl(),
      기준일: 기준일,
      weekly: weeklyResult,
      jobs: jobsResult,
      excluded: excludedResult,
      manualExperience: manualCarryForwardResult,
      manualWeekly: manualWeeklyResult,
      gameReferences: gameReferenceResult,
      companyMonitor: companyMonitorResult,
      industryMaterials: industryMaterialResult,
      importedGameReferences: sourceImportResult
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: String(err),
      stack: err && err.stack ? String(err.stack) : ''
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseErr) {
      // Ignore release errors when the lock was never acquired.
    }
  }
}

function requireConfig_(config) {
  if (!config || !textValue(config.sheetId).trim()) {
    throw new Error('Missing target spreadsheet configuration.');
  }

  return config;
}

function requireWebhookConfig_(config) {
  const checkedConfig = requireConfig_(config);
  if (!textValue(checkedConfig.webhookSecret).trim()) {
    throw new Error('Missing webhook authentication configuration.');
  }

  return checkedConfig;
}

function requireReferenceConfig_(config) {
  const checkedConfig = requireConfig_(config);
  const ids = checkedConfig.referenceSourceIds || {};
  if (!ids.experience || !ids.playHistory || !ids.careerLog) {
    throw new Error('Missing linked reference source configuration.');
  }

  return checkedConfig;
}

const QA_TC = {
  sourceSheetName: 'TC_SNS_Server',
  sheetName: 'TC_SNS_Server_QA_구조안',
  hubSheetName: 'TC_Hub',
  bugSheetName: '버그 리포트',
  headerRow: 3,
  firstDataRow: 4,
  headers: [
    'TC ID',
    '중분류',
    '소분류',
    '테스트 항목',
    '사전 조건',
    '테스트 목적',
    '결과 확인',
    '상태',
    '실제 결과',
    '관련 버그 리포트 ID',
    '비고'
  ],
  statusColumn: 8,
  actualResultColumn: 9,
  issueColumn: 10,
  noteColumn: 11,
  statusValues: ['Pass', 'Fail', 'Blocked', 'Not Test'],
  statusColors: {
    Pass: '#d9ead3',
    Fail: '#f4cccc',
    Blocked: '#fff2cc',
    'Not Test': '#d9d9d9'
  }
};

function qaTcHealthCheck(config) {
  const checkedConfig = requireConfig_(config);
  return jsonResponse({
    ok: true,
    service: 'qa-tc-webapp',
    sheetId: checkedConfig.sheetId,
    requiredTabs: [QA_TC.hubSheetName, QA_TC.sheetName, QA_TC.bugSheetName],
    actions: ['validate', 'setupTcSheet', 'appendTestCase', 'updateTestResult', 'syncHubCounts']
  });
}

function validateQaTcConnection(config) {
  const checkedConfig = requireConfig_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);

  return jsonResponse({
    ok: true,
    service: 'qa-tc-webapp',
    sheetTitle: ss.getName(),
    tabs: ss.getSheets().map(function (sheet) {
      return sheet.getName();
    }),
    requiredTabs: [QA_TC.hubSheetName, QA_TC.sheetName, QA_TC.bugSheetName],
    writePerformed: false
  });
}

function setupQaTcSheet(config) {
  const checkedConfig = requireConfig_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const result = ensureQaTcWorkbook_(ss);

  return jsonResponse({
    ok: true,
    service: 'qa-tc-webapp',
    message: 'QA TC sheet setup complete',
    spreadsheetUrl: ss.getUrl(),
    setup: result
  });
}

function handleQaTcPost(e, config) {
  const lock = LockService.getScriptLock();
  let locked = false;

  try {
    const checkedConfig = requireWebhookConfig_(config);
    const contents = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(contents);

    if (!payload || payload.secret !== checkedConfig.webhookSecret) {
      return jsonResponse({
        ok: false,
        error: 'unauthorized'
      });
    }

    if (payload.action === 'validate') {
      return validateQaTcConnection(checkedConfig);
    }

    lock.waitLock(30000);
    locked = true;

    const ss = SpreadsheetApp.openById(checkedConfig.sheetId);

    if (payload.action === 'setupTcSheet') {
      const setup = ensureQaTcWorkbook_(ss);
      return jsonResponse({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        setup: setup
      });
    }

    if (payload.action === 'appendTestCase') {
      const result = appendQaTestCase_(ss, payload.testCase || payload);
      return jsonResponse({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        appended: result
      });
    }

    if (payload.action === 'updateTestResult') {
      const result = updateQaTestResult_(ss, payload);
      return jsonResponse({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        updated: result
      });
    }

    if (payload.action === 'syncHubCounts') {
      return jsonResponse({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        hub: syncQaHubCounts_(ss)
      });
    }

    return jsonResponse({
      ok: false,
      error: 'unknown action'
    });
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: String(err),
      stack: err && err.stack ? String(err.stack) : ''
    });
  } finally {
    if (locked) {
      try {
        lock.releaseLock();
      } catch (releaseErr) {
        // Ignore release errors when the lock was never acquired.
      }
    }
  }
}

function ensureQaTcWorkbook_(ss) {
  const sheet = ensureQaTcDraftSheet_(ss);
  const rows = readQaRowsForReadableLayout_(sheet);

  if (sheet.getMaxColumns() < QA_TC.headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), QA_TC.headers.length - sheet.getMaxColumns());
  }

  if (sheet.getMaxRows() < 200) {
    sheet.insertRowsAfter(sheet.getMaxRows(), 200 - sheet.getMaxRows());
  }

  sheet.clear({ contentsOnly: true });
  sheet.clearFormats();
  sheet.clearNotes();
  sheet.setConditionalFormatRules([]);

  const hubSheet = ss.getSheetByName(QA_TC.hubSheetName);
  const backCell = sheet.getRange(1, 1);
  if (hubSheet) {
    backCell.setFormula('=HYPERLINK("#gid=' + hubSheet.getSheetId() + '","Hub 복귀")');
  } else {
    backCell.setValue('Hub 복귀');
  }
  backCell
    .setFontWeight('bold')
    .setFontSize(12)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#e8f0fe');
  sheet.setRowHeight(1, 32);

  const headerRange = sheet.getRange(QA_TC.headerRow, 1, 1, QA_TC.headers.length);
  headerRange.setValues([QA_TC.headers]);
  headerRange
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBackground('#f3f6fa');

  sheet.setFrozenRows(QA_TC.headerRow);
  if (rows.length) {
    sheet.getRange(QA_TC.firstDataRow, 1, rows.length, QA_TC.headers.length).setValues(rows);
  }

  sheet.getRange(QA_TC.firstDataRow, QA_TC.statusColumn, sheet.getMaxRows() - QA_TC.headerRow, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInList(QA_TC.statusValues, true)
      .setAllowInvalid(false)
      .build());

  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 220);
  sheet.setColumnWidth(6, 300);
  sheet.setColumnWidth(7, 280);
  sheet.setColumnWidth(8, 110);
  sheet.setColumnWidth(9, 240);
  sheet.setColumnWidth(10, 160);
  sheet.setColumnWidth(11, 220);
  sheet.getRange(QA_TC.headerRow, 1, sheet.getMaxRows() - QA_TC.headerRow + 1, QA_TC.headers.length)
    .setWrap(true)
    .setVerticalAlignment('middle');

  if (sheet.getMaxColumns() > QA_TC.headers.length) {
    sheet.deleteColumns(QA_TC.headers.length + 1, sheet.getMaxColumns() - QA_TC.headers.length);
  }

  applyQaTcConditionalFormatting_(sheet);

  return {
    sheetName: QA_TC.sheetName,
    headerRow: QA_TC.headerRow,
    statusRange: 'H4:H' + sheet.getMaxRows(),
    columns: QA_TC.headers,
    statusValues: QA_TC.statusValues
  };
}

function ensureQaTcDraftSheet_(ss) {
  const existing = ss.getSheetByName(QA_TC.sheetName);
  if (existing) return existing;

  const source = ss.getSheetByName(QA_TC.sourceSheetName) || ss.getSheetByName('TC_SNS_SERVER');
  if (!source) return ss.insertSheet(QA_TC.sheetName);

  const draft = source.copyTo(ss);
  draft.setName(QA_TC.sheetName);
  draft.activate();
  ss.moveActiveSheet(source.getIndex() + 1);
  return draft;
}

function readQaRowsForReadableLayout_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < QA_TC.firstDataRow) return [];

  const width = Math.min(sheet.getLastColumn(), 11);
  const headers = sheet.getRange(QA_TC.headerRow, 1, 1, width).getDisplayValues()[0];
  const values = sheet.getRange(QA_TC.firstDataRow, 1, lastRow - QA_TC.headerRow, width).getDisplayValues();
  const rows = [];

  values.forEach(function (row) {
    const tcId = textValue(row[0]).trim();
    const title = textValue(row[3] || row[2]).trim();
    if (!tcId && !title) return;
    if (tcId === 'Hub 복귀' || QA_TC.statusValues.indexOf(tcId) !== -1) return;

    const isCompactLayout = headers[1] === '분류';
    const isQaLayout = headers[7] === '상태';

    if (isCompactLayout) {
      const categories = splitQaCategory_(row[1]);
      const issueNote = splitQaIssueNote_(row[8]);
      rows.push([
        tcId,
        categories[0],
        categories[1],
        textValue(row[2]).trim(),
        textValue(row[3]).trim(),
        textValue(row[4]).trim(),
        textValue(row[5]).trim(),
        normalizeQaStatusForRead_(row[6]) || 'Not Test',
        textValue(row[7]).trim(),
        issueNote[0],
        issueNote[1]
      ]);
      return;
    }

    const resultCheck = textValue(row[6]).trim();
    const statusFromOldResult = normalizeQaStatusForRead_(resultCheck);
    const status = isQaLayout
      ? normalizeQaStatusForRead_(row[7]) || 'Not Test'
      : statusFromOldResult || 'Not Test';
    const actualResult = isQaLayout ? textValue(row[8]).trim() : '';
    const issue = isQaLayout ? textValue(row[9]).trim() : textValue(row[7]).trim();
    const note = isQaLayout ? textValue(row[10]).trim() : textValue(row[8]).trim();

    rows.push([
      tcId,
      textValue(row[1]).trim(),
      textValue(row[2]).trim(),
      textValue(row[3]).trim(),
      textValue(row[4]).trim(),
      textValue(row[5]).trim(),
      statusFromOldResult ? '' : resultCheck,
      status,
      actualResult,
      issue,
      note
    ]);
  });

  return rows;
}

function splitQaCategory_(value) {
  const text = textValue(value).trim();
  if (!text) return ['', ''];
  const parts = text.split(/\s*\/\s*/);
  return [parts[0] || '', parts.slice(1).join(' / ')];
}

function splitQaIssueNote_(value) {
  const text = textValue(value).trim();
  if (!text) return ['', ''];
  const parts = text.split(/\s*\/\s*/);
  return [parts[0] || '', parts.slice(1).join(' / ')];
}

function applyQaTcConditionalFormatting_(sheet) {
  const targetRange = sheet.getRange(QA_TC.firstDataRow, 1, sheet.getMaxRows() - QA_TC.headerRow, QA_TC.headers.length);
  const existingRules = sheet.getConditionalFormatRules().filter(function (rule) {
    const condition = rule.getBooleanCondition();
    if (!condition) return true;
    const values = condition.getCriteriaValues();
    const formula = values && values[0] ? String(values[0]) : '';
    return !/^\=\$H4\=\"(?:Pass|Fail|Blocked|Not Test)\"$/.test(formula);
  });

  QA_TC.statusValues.forEach(function (status) {
    existingRules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$H4="' + status + '"')
      .setBackground(QA_TC.statusColors[status])
      .setRanges([targetRange])
      .build());
  });

  sheet.setConditionalFormatRules(existingRules);
}

function appendQaTestCase_(ss, input) {
  ensureQaTcWorkbook_(ss);

  const sheet = ss.getSheetByName(QA_TC.sheetName);
  const rowIndex = findNextQaTcRow_(sheet);
  const status = normalizeQaStatus_(pick(input, ['status', '상태'], 'Not Test'));
  const row = [
    textValue(pick(input, ['tcId', 'TC ID'], nextQaTcId_(sheet))),
    textValue(pick(input, ['middleCategory', 'category', '중분류'], '')),
    textValue(pick(input, ['subCategory', '소분류'], '')),
    textValue(pick(input, ['title', 'testItem', '테스트 항목'], '')),
    textValue(pick(input, ['precondition', '사전 조건'], '')),
    textValue(pick(input, ['purpose', 'testPurpose', '테스트 목적'], '')),
    textValue(pick(input, ['expectedResult', 'resultCheck', '결과 확인'], '')),
    status,
    textValue(pick(input, ['actualResult', '실제 결과'], '')),
    textValue(pick(input, ['issueId', '관련 버그 리포트 ID', '관련 이슈 ID'], '')),
    textValue(pick(input, ['note', '비고'], ''))
  ];

  sheet.getRange(rowIndex, 1, 1, QA_TC.headers.length).setValues([row]);
  applyQaStatusRowFormat_(sheet, rowIndex, status);

  return {
    row: rowIndex,
    tcId: row[0],
    status: status
  };
}

function updateQaTestResult_(ss, payload) {
  ensureQaTcWorkbook_(ss);

  const sheet = ss.getSheetByName(QA_TC.sheetName);
  const tcId = textValue(pick(payload, ['tcId', 'TC ID'], '')).trim();
  if (!tcId) throw new Error('tcId is required.');

  const rowIndex = findQaTcRowById_(sheet, tcId);
  if (!rowIndex) throw new Error('TC ID not found: ' + tcId);

  const current = sheet.getRange(rowIndex, QA_TC.statusColumn, 1, 4).getValues()[0];
  const status = payload.status || payload['상태'] ? normalizeQaStatus_(pick(payload, ['status', '상태'], current[0])) : current[0];
  const actualResult = payload.actualResult !== undefined || payload['실제 결과'] !== undefined
    ? textValue(pick(payload, ['actualResult', '실제 결과'], ''))
    : current[1];
  const issueId = payload.issueId !== undefined || payload['관련 버그 리포트 ID'] !== undefined || payload['관련 이슈 ID'] !== undefined
    ? textValue(pick(payload, ['issueId', '관련 버그 리포트 ID', '관련 이슈 ID'], ''))
    : current[2];
  const note = payload.note !== undefined || payload['비고'] !== undefined
    ? textValue(pick(payload, ['note', '비고'], ''))
    : current[3];

  sheet.getRange(rowIndex, QA_TC.statusColumn, 1, 4).setValues([[status, actualResult, issueId, note]]);
  applyQaStatusRowFormat_(sheet, rowIndex, status);

  const actualCell = sheet.getRange(rowIndex, QA_TC.actualResultColumn);
  if ((status === 'Fail' || status === 'Blocked') && !actualResult) {
    actualCell.setNote('Fail/Blocked 상태에서는 실제 결과를 입력하세요.');
  } else {
    actualCell.clearNote();
  }

  return {
    row: rowIndex,
    tcId: tcId,
    status: status
  };
}

function syncQaHubCounts_(ss) {
  const hub = ss.getSheetByName(QA_TC.hubSheetName);
  const tcSheet = ss.getSheetByName(QA_TC.sheetName);
  if (!hub || !tcSheet) {
    return {
      updatedRows: 0,
      skipped: true
    };
  }

  const lastRow = Math.max(hub.getLastRow(), 4);
  const values = hub.getRange(4, 1, lastRow - 3, 6).getDisplayValues();
  let updatedRows = 0;

  values.forEach(function (row, index) {
    const hubRow = index + 4;
    const middleCategory = textValue(row[2]).trim();
    if (!middleCategory) return;

    hub.getRange(hubRow, 4).setFormula('=HYPERLINK("' + ss.getUrl() + '#gid=' + tcSheet.getSheetId() + '","' + QA_TC.sheetName + '")');
    hub.getRange(hubRow, 5).setFormula('=COUNTIFS(' + QA_TC.sheetName + '!B:B,C' + hubRow + ',' + QA_TC.sheetName + '!A:A,"<>")');
    updatedRows += 1;
  });

  return {
    sheetName: QA_TC.hubSheetName,
    updatedRows: updatedRows
  };
}

function findNextQaTcRow_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), QA_TC.firstDataRow);
  const values = sheet.getRange(QA_TC.firstDataRow, 1, lastRow - QA_TC.headerRow, QA_TC.headers.length).getDisplayValues();

  for (let i = 0; i < values.length; i += 1) {
    if (values[i].every(function (value) { return !textValue(value).trim(); })) {
      return QA_TC.firstDataRow + i;
    }
  }

  return lastRow + 1;
}

function findQaTcRowById_(sheet, tcId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < QA_TC.firstDataRow) return 0;

  const values = sheet.getRange(QA_TC.firstDataRow, 1, lastRow - QA_TC.headerRow, 1).getDisplayValues();
  for (let i = 0; i < values.length; i += 1) {
    if (textValue(values[i][0]).trim() === tcId) return QA_TC.firstDataRow + i;
  }

  return 0;
}

function nextQaTcId_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < QA_TC.firstDataRow) return 'SNS-TC-001';

  const values = sheet.getRange(QA_TC.firstDataRow, 1, lastRow - QA_TC.headerRow, 1).getDisplayValues();
  let maxNumber = 0;
  values.forEach(function (row) {
    const match = textValue(row[0]).match(/SNS-TC-(\d+)/);
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });

  return 'SNS-TC-' + String(maxNumber + 1).padStart(3, '0');
}

function normalizeQaStatus_(status) {
  const value = textValue(status).trim() || 'Not Test';
  if (QA_TC.statusValues.indexOf(value) === -1) {
    throw new Error('Invalid status: ' + value);
  }

  return value;
}

function normalizeQaStatusForRead_(status) {
  const value = textValue(status).trim();
  return QA_TC.statusValues.indexOf(value) === -1 ? '' : value;
}

function applyQaStatusRowFormat_(sheet, rowIndex, status) {
  sheet.getRange(rowIndex, 1, 1, QA_TC.headers.length)
    .setBackground(QA_TC.statusColors[status] || null);
}

function ensureWorkbook(ss) {
  const weeklySheet = ensureSheet(ss, TAB_NAMES.weekly, true);
  const jobsSheet = ensureSheet(ss, TAB_NAMES.jobs, false);
  const excludedSheet = ensureSheet(ss, TAB_NAMES.excluded, false);
  const gameReferenceSheet = ensureSheet(ss, TAB_NAMES.gameReferences, false);
  const companyMonitorSheet = ensureSheet(ss, TAB_NAMES.companyMonitor, false);
  const industryMaterialSheet = ensureSheet(ss, TAB_NAMES.industryMaterials, false);
  const chartDataSheet = ensureSheet(ss, TAB_NAMES.chartData, false);
  const dashboardSheet = ensureSheet(ss, TAB_NAMES.dashboard, false);

  ensureHeader(weeklySheet, WEEKLY_HEADERS);
  ensureHeader(jobsSheet, JOB_HEADERS);
  ensureHeader(excludedSheet, EXCLUDED_HEADERS);
  ensureHeader(gameReferenceSheet, GAME_REFERENCE_HEADERS);
  ensureHeader(companyMonitorSheet, COMPANY_MONITOR_HEADERS);
  ensureHeader(industryMaterialSheet, INDUSTRY_MATERIAL_HEADERS);

  chartDataSheet.setFrozenRows(0);
  dashboardSheet.setFrozenRows(0);
  applyReadableLayout(ss);
}

function ensureSheet(ss, name, mayReuseDefault) {
  const existing = ss.getSheetByName(name);
  if (existing) return existing;

  const sheets = ss.getSheets();
  const defaultSheet = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1');

  if (mayReuseDefault && defaultSheet && sheets.length === 1 && defaultSheet.getLastRow() === 0) {
    defaultSheet.setName(name);
    return defaultSheet;
  }

  return ss.insertSheet(name);
}

function ensureHeader(sheet, headers) {
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setFontWeight('bold')
    .setBackground('#1f4e79')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 42);
  sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 1), headers.length).setWrap(true);
}

function applyReadableLayout(ss) {
  const weeklySheet = ss.getSheetByName(TAB_NAMES.weekly);
  const jobsSheet = ss.getSheetByName(TAB_NAMES.jobs);
  const excludedSheet = ss.getSheetByName(TAB_NAMES.excluded);
  const gameReferenceSheet = ss.getSheetByName(TAB_NAMES.gameReferences);
  const companyMonitorSheet = ss.getSheetByName(TAB_NAMES.companyMonitor);
  const industryMaterialSheet = ss.getSheetByName(TAB_NAMES.industryMaterials);
  const chartDataSheet = ss.getSheetByName(TAB_NAMES.chartData);
  const dashboardSheet = ss.getSheetByName(TAB_NAMES.dashboard);

  if (weeklySheet) {
    applyColumnWidths(weeklySheet, [110, 90, 90, 90, 90, 220, 380, 280, 150]);
    styleBodyRange(weeklySheet, WEEKLY_HEADERS.length);
    weeklySheet.setTabColor('#1f4e79');
    weeklySheet.setHiddenGridlines(true);
  }

  if (jobsSheet) {
    applyColumnWidths(jobsSheet, [110, 120, 160, 300, 150, 340, 340, 320, 280, 110, 320, 240, 150, 130, 170, 150, 320]);
    styleBodyRange(jobsSheet, JOB_HEADERS.length);
    jobsSheet.setTabColor('#38761d');
    jobsSheet.setHiddenGridlines(true);
    applyManualExperienceControls_(jobsSheet);
  }

  if (excludedSheet) {
    applyColumnWidths(excludedSheet, [110, 300, 140, 380, 320, 150]);
    styleBodyRange(excludedSheet, EXCLUDED_HEADERS.length);
    excludedSheet.setTabColor('#990000');
    excludedSheet.setHiddenGridlines(true);
  }

  if (gameReferenceSheet) {
    applyColumnWidths(gameReferenceSheet, [110, 130, 240, 160, 150, 110, 150, 90, 240, 220, 360, 320, 380, 140, 220, 260, 140, 90, 420, 260, 210, 240]);
    styleBodyRange(gameReferenceSheet, GAME_REFERENCE_HEADERS.length);
    gameReferenceSheet.setTabColor('#0b5394');
    gameReferenceSheet.setHiddenGridlines(true);
  }

  if (companyMonitorSheet) {
    applyColumnWidths(companyMonitorSheet, [110, 130, 90, 110, 150, 320, 110, 150, 160, 360, 280, 300, 320, 150]);
    styleBodyRange(companyMonitorSheet, COMPANY_MONITOR_HEADERS.length);
    companyMonitorSheet.setTabColor('#b45f06');
    companyMonitorSheet.setHiddenGridlines(true);
  }

  if (industryMaterialSheet) {
    applyColumnWidths(industryMaterialSheet, [110, 130, 110, 130, 320, 110, 380, 360, 200, 260, 320, 150]);
    styleBodyRange(industryMaterialSheet, INDUSTRY_MATERIAL_HEADERS.length);
    industryMaterialSheet.setTabColor('#45818e');
    industryMaterialSheet.setHiddenGridlines(true);
  }

  if (chartDataSheet) {
    applyColumnWidths(chartDataSheet, [120, 110, 110, 110, 32, 140, 100, 32]);
    chartDataSheet.setTabColor('#674ea7');
    chartDataSheet.setHiddenGridlines(true);
    chartDataSheet.getRange(1, 1, Math.max(chartDataSheet.getMaxRows(), 1), 8)
      .setVerticalAlignment('middle')
      .setWrap(true);
  }

  if (dashboardSheet) {
    dashboardSheet.setTabColor('#f1c232');
    dashboardSheet.setHiddenGridlines(true);
    dashboardSheet.setColumnWidths(1, 14, 96);
    dashboardSheet.setRowHeights(1, 40, 26);
  }
}

function applyColumnWidths(sheet, widths) {
  widths.forEach(function (width, index) {
    sheet.setColumnWidth(index + 1, width);
  });
}

function styleBodyRange(sheet, width) {
  const maxRows = Math.max(sheet.getMaxRows(), 2);
  sheet.getRange(2, 1, maxRows - 1, width)
    .setVerticalAlignment('top')
    .setWrap(true);

  sheet.getRange(1, 1, 1, width)
    .setFontSize(10)
    .setFontWeight('bold')
    .setBackground('#17365d')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);
}

function applyManualExperienceControls_(sheet) {
  const bodyExperienceColumn = 15;
  const manualExperienceColumn = 16;
  const maxBodyRows = Math.max(sheet.getMaxRows() - 1, 1);
  const bodyValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(BODY_EXPERIENCE_OPTIONS, true)
    .setAllowInvalid(false)
    .setHelpText('상세 본문에서 확인한 요구 경력 문구를 선택하세요.')
    .build();
  const manualValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(MANUAL_EXPERIENCE_OPTIONS, true)
    .setAllowInvalid(false)
    .setHelpText('자격요건에서 확인한 최소 요구 경력을 선택하세요.')
    .build();

  sheet.getRange(2, bodyExperienceColumn, maxBodyRows, 1).setDataValidation(bodyValidation);
  sheet.getRange(2, manualExperienceColumn, maxBodyRows, 1).setDataValidation(manualValidation);

  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const rowCount = lastRow - 1;
    const bodyValues = sheet.getRange(2, bodyExperienceColumn, rowCount, 1).getDisplayValues();
    const manualRange = sheet.getRange(2, manualExperienceColumn, rowCount, 1);
    const manualValues = manualRange.getDisplayValues();
    let changed = false;

    manualValues.forEach(function (row, index) {
      if (bodyValues[index][0] === '수동 확인 필요' && !row[0]) {
        row[0] = '확인 전';
        changed = true;
      }
    });

    if (changed) manualRange.setValues(manualValues);
  }

  const filter = sheet.getFilter();
  const filterRange = filter ? filter.getRange() : null;
  const requiresFilterReset = !filterRange ||
    filterRange.getNumColumns() !== JOB_HEADERS.length ||
    filterRange.getNumRows() !== sheet.getMaxRows();

  if (requiresFilterReset) {
    if (filter) filter.remove();
    sheet.getRange(1, 1, sheet.getMaxRows(), JOB_HEADERS.length).createFilter();
  }
}

function carryForwardManualExperience_(jobsSheet, jobRows, excludedRows) {
  if (!jobsSheet || !jobRows || jobRows.length === 0) {
    return {
      preservedManual: 0,
      reclassified: 0,
      recordedExcluded: 0,
      ambiguousManual: 0,
      staleManual: 0,
      unmatchedManual: 0,
      unmatchedManualRows: [],
      ambiguousManualRows: [],
      staleManualRows: []
    };
  }

  const lookup = buildManualExperienceLookup_(readTable(jobsSheet, JOB_HEADERS.length));
  let preservedManual = 0;
  let reclassified = 0;
  let recordedExcluded = 0;
  let ambiguousManual = 0;
  let staleManual = 0;
  let unmatchedManual = 0;
  const unmatchedManualRows = [];
  const ambiguousManualRows = [];
  const staleManualRows = [];

  jobRows.forEach(function (row) {
    const currentManual = normalizeManualExperience_(row[15]);
    if (!isManualConfirmationNeeded_(row[14]) && isResolvedManualExperience_(currentManual)) return;

    const existing = findManualExperienceMatch_(row, lookup);
    if (!existing) {
      if (isManualConfirmationNeeded_(row[14])) {
        unmatchedManual += 1;
        unmatchedManualRows.push(buildManualCarryForwardDiagnosticRow_(row, '기존 수동입력경력 매칭 없음'));
      }
      return;
    }
    if (existing.ambiguous) {
      ambiguousManual += 1;
      ambiguousManualRows.push(buildManualCarryForwardDiagnosticRow_(row, '회사+공고명 중복으로 이월 보류'));
      return;
    }
    if (isManualExperienceStale_(existing.baseDate)) {
      staleManual += 1;
      staleManualRows.push(buildManualCarryForwardDiagnosticRow_(row, '기존 수동입력경력 보존 기간 초과', existing));
      return;
    }
    if (!isResolvedManualExperience_(existing.manualExperience)) return;

    row[15] = existing.manualExperience;
    preservedManual += 1;

    const nextBand = manualExperienceToJobBand_(existing.manualExperience);
    if (nextBand && textValue(row[1]).trim() !== nextBand) {
      row[1] = nextBand;
      reclassified += 1;
    }

    row[16] = appendExperienceEvidence_(row[16], '기존 수동입력경력(' + existing.manualExperience + ', ' + existing.matchType + ') 반영');

    if (isManualExcludedExperience_(existing.manualExperience)) {
      excludedRows.push(buildManualExcludedRow_(row, existing.manualExperience));
      recordedExcluded += 1;
    }
  });

  return {
    preservedManual: preservedManual,
    reclassified: reclassified,
    recordedExcluded: recordedExcluded,
    ambiguousManual: ambiguousManual,
    staleManual: staleManual,
    unmatchedManual: unmatchedManual,
    unmatchedManualRows: unmatchedManualRows,
    ambiguousManualRows: ambiguousManualRows,
    staleManualRows: staleManualRows
  };
}

function buildManualCarryForwardDiagnosticRow_(row, reason, match) {
  return {
    기준일: keyValue(row[0]).trim(),
    회사: textValue(row[2]).trim(),
    공고명: textValue(row[3]).trim(),
    공고URL: textValue(row[10]).trim(),
    표시경력: textValue(row[13]).trim(),
    본문요구경력: textValue(row[14]).trim(),
    수동입력경력: normalizeManualExperience_(row[15]),
    경력판정근거: textValue(row[16]).trim(),
    원인: reason,
    매칭유형: match && match.matchType ? match.matchType : '',
    기존기준일: match && match.baseDate ? keyValue(match.baseDate).trim() : ''
  };
}

function buildManualExperienceLookup_(rows) {
  const lookup = {
    byUrl: {},
    byTitle: {},
    titleCounts: {}
  };
  rows.forEach(function (row) {
    const manualExperience = normalizeManualExperience_(row[15]);
    if (!isResolvedManualExperience_(manualExperience)) return;

    const candidate = {
      manualExperience: manualExperience,
      baseDate: row[0]
    };
    const urlKey = buildJobUrlKey_(row);
    if (urlKey) lookup.byUrl[urlKey] = candidate;

    const titleKey = buildJobTitleKey_(row);
    if (titleKey) {
      lookup.titleCounts[titleKey] = (lookup.titleCounts[titleKey] || 0) + 1;
      if (!lookup.byTitle[titleKey]) lookup.byTitle[titleKey] = candidate;
    }
  });
  return lookup;
}

function findManualExperienceMatch_(row, lookup) {
  const urlKey = buildJobUrlKey_(row);
  if (urlKey && lookup.byUrl[urlKey]) {
    return copyManualExperienceMatch_(lookup.byUrl[urlKey], 'URL');
  }

  return findManualExperienceTitleMatch_(row, lookup);
}

function findManualExperienceTitleMatch_(row, lookup) {
  const titleKey = buildJobTitleKey_(row);
  if (!titleKey || !lookup.byTitle[titleKey]) return null;
  if (lookup.titleCounts[titleKey] > 1) return { ambiguous: true };
  return copyManualExperienceMatch_(lookup.byTitle[titleKey], '회사+공고명');
}

function copyManualExperienceMatch_(candidate, matchType) {
  return {
    manualExperience: candidate.manualExperience,
    baseDate: candidate.baseDate,
    matchType: matchType
  };
}

function buildJobUrlKey_(row) {
  const url = textValue(row[10]).trim().toLowerCase().replace(/\/+$/, '');
  const gameJobPostingId = extractGameJobPostingId_(url);
  if (gameJobPostingId) return 'gamejob:' + gameJobPostingId;
  return url ? 'url:' + url : '';
}

function extractGameJobPostingId_(url) {
  const value = textValue(url).replace(/&amp;/gi, '&');
  const match = /[?&](?:GI_No|gno)=([0-9]+)/i.exec(value);
  return match ? match[1] : '';
}

function buildJobTitleKey_(row) {
  const company = textValue(row[2]).trim();
  const title = textValue(row[3]).trim();
  if (!company && !title) return '';
  return 'title:' + normalizeIdentityText_(company) + '|' + normalizeIdentityText_(title);
}

function normalizeIdentityText_(value) {
  return textValue(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function isManualExperienceStale_(baseDate) {
  const sourceDate = parseDateKey_(baseDate);
  const currentDate = parseDateKey_(todayDate());
  if (!sourceDate || !currentDate) return false;

  const diffMs = currentDate.getTime() - sourceDate.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return diffDays > MANUAL_CARRY_FORWARD_MAX_AGE_DAYS;
}

function parseDateKey_(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(keyValue(value));
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function appendExperienceEvidence_(value, note) {
  const current = textValue(value).trim();
  if (!current) return note;
  if (current.indexOf(note) !== -1) return current;
  return current + ' / ' + note;
}

function cleanupBodyExperienceFromListed_(ss) {
  const jobsSheet = ss.getSheetByName(TAB_NAMES.jobs);
  if (!jobsSheet) return { scannedRows: 0, resolvedManualRows: 0, updatedBodyExperience: 0, updatedEvidence: 0 };

  const rows = readTable(jobsSheet, JOB_HEADERS.length);
  let resolvedManualRows = 0;
  let updatedBodyExperience = 0;
  let updatedEvidence = 0;
  const bodyUpdates = [];
  const evidenceUpdates = [];

  rows.forEach(function (row, index) {
    const manualExperience = normalizeManualExperience_(row[15]);
    const listedExperience = textValue(row[13]).trim();
    const currentBodyExperience = textValue(row[14]).trim();
    let nextBodyExperience = currentBodyExperience;
    let evidence = textValue(row[16]).trim();

    if (isResolvedManualExperience_(manualExperience)) {
      resolvedManualRows += 1;
      nextBodyExperience = bodyExperienceFromListed_(listedExperience) || bodyExperienceFromManual_(manualExperience) || currentBodyExperience;

      if (nextBodyExperience && nextBodyExperience !== currentBodyExperience) {
        row[14] = nextBodyExperience;
        updatedBodyExperience += 1;
        bodyUpdates.push({
          rowNumber: index + 2,
          value: nextBodyExperience
        });
        evidence = appendExperienceEvidence_(evidence, 'O열 표시경력 기준 정리(' + listedExperience + ' -> ' + nextBodyExperience + ')');
      }
    }

    if (evidence !== textValue(row[16]).trim()) {
      row[16] = evidence;
      updatedEvidence += 1;
      evidenceUpdates.push({
        rowNumber: index + 2,
        value: evidence
      });
    }
  });

  bodyUpdates.forEach(function (update) {
    jobsSheet.getRange(update.rowNumber, 15, 1, 1).setValues([[update.value]]);
  });
  evidenceUpdates.forEach(function (update) {
    jobsSheet.getRange(update.rowNumber, 17, 1, 1).setValues([[update.value]]);
  });

  return {
    scannedRows: rows.length,
    resolvedManualRows: resolvedManualRows,
    updatedBodyExperience: updatedBodyExperience,
    updatedEvidence: updatedEvidence
  };
}

function normalizeBodyExperienceDropdownValues_(ss) {
  const jobsSheet = ss.getSheetByName(TAB_NAMES.jobs);
  if (!jobsSheet) return { scannedRows: 0, invalidRows: 0, updatedBodyExperience: 0, updatedEvidence: 0, unresolvedRows: 0 };

  const rows = readTable(jobsSheet, JOB_HEADERS.length);
  let invalidRows = 0;
  let updatedBodyExperience = 0;
  let updatedEvidence = 0;
  let unresolvedRows = 0;
  const invalidValueCounts = {};
  const updatedValueCounts = {};
  const bodyUpdates = [];
  const evidenceUpdates = [];

  rows.forEach(function (row, index) {
    const currentBodyExperience = textValue(row[14]).trim();
    if (!currentBodyExperience || isValidBodyExperienceOption_(currentBodyExperience)) return;

    invalidRows += 1;
    invalidValueCounts[currentBodyExperience] = (invalidValueCounts[currentBodyExperience] || 0) + 1;

    const nextBodyExperience = normalizeBodyExperienceToDropdown_(currentBodyExperience, row[13], row[15]);
    if (!nextBodyExperience || !isValidBodyExperienceOption_(nextBodyExperience)) {
      unresolvedRows += 1;
      return;
    }

    row[14] = nextBodyExperience;
    updatedBodyExperience += 1;
    updatedValueCounts[nextBodyExperience] = (updatedValueCounts[nextBodyExperience] || 0) + 1;
    bodyUpdates.push({
      rowNumber: index + 2,
      value: nextBodyExperience
    });

    const evidence = appendExperienceEvidence_(row[16], 'O열 드롭다운 값 정리(' + currentBodyExperience + ' -> ' + nextBodyExperience + ')');
    if (evidence !== textValue(row[16]).trim()) {
      row[16] = evidence;
      updatedEvidence += 1;
      evidenceUpdates.push({
        rowNumber: index + 2,
        value: evidence
      });
    }
  });

  bodyUpdates.forEach(function (update) {
    jobsSheet.getRange(update.rowNumber, 15, 1, 1).setValues([[update.value]]);
  });
  evidenceUpdates.forEach(function (update) {
    jobsSheet.getRange(update.rowNumber, 17, 1, 1).setValues([[update.value]]);
  });

  return {
    scannedRows: rows.length,
    invalidRows: invalidRows,
    updatedBodyExperience: updatedBodyExperience,
    updatedEvidence: updatedEvidence,
    unresolvedRows: unresolvedRows,
    invalidValueCounts: invalidValueCounts,
    updatedValueCounts: updatedValueCounts
  };
}

function isValidBodyExperienceOption_(value) {
  return BODY_EXPERIENCE_OPTIONS.indexOf(textValue(value).trim()) !== -1;
}

function normalizeBodyExperienceToDropdown_(bodyExperience, listedExperience, manualExperience) {
  const current = bodyExperienceFromText_(bodyExperience, listedExperience);
  if (current) return current;

  return bodyExperienceFromListed_(listedExperience) || bodyExperienceFromManual_(manualExperience) || '';
}

function bodyExperienceFromText_(bodyExperience, listedExperience) {
  const source = textValue(bodyExperience).trim();
  const compact = source.replace(/\s+/g, '');
  if (!compact) return '';
  if (isValidBodyExperienceOption_(source)) return source;

  if (/목록표시|표시경력/.test(compact)) {
    return bodyExperienceFromListed_(listedExperience);
  }
  if (/수동확인/.test(compact)) return '수동 확인 필요';
  if (/본문.*연차.*명시.*없|연차.*명시.*없.*본문/.test(source)) return '본문 연차 명시 없음';
  if (/경력문구.*연차.*미기재|연차미기재/.test(compact)) return CAREER_BAND_UNSPECIFIED;
  if (/경력무관|경력.?무관|무관/.test(compact)) return '연차 명시 없음';
  if (/신입/.test(compact) && /이하/.test(compact)) return '신입';
  if (/^신입/.test(compact)) return '신입';

  if (/이하/.test(compact)) {
    return CAREER_BAND_UNSPECIFIED;
  }

  const yearMatch = /(\d+)\s*년/.exec(source) || /경력\s*(\d+)/.exec(source) || /(\d+)\s*↑/.exec(source);
  if (yearMatch) {
    const years = Number(yearMatch[1]);
    if (years >= 6) return MANUAL_EXPERIENCE_OVER_LIMIT;
    if (years >= 1) return years + '년 이상';
  }

  if (/경력/.test(source)) return CAREER_BAND_UNSPECIFIED;
  return '';
}

function bodyExperienceFromListed_(listedExperience) {
  const source = textValue(listedExperience).trim();
  const compact = source.replace(/\s+/g, '');
  if (!compact) return '';

  if (/경력무관|무관|신입.?경력|경력.?신입/i.test(compact)) {
    return '연차 명시 없음';
  }
  if (/^신입$/i.test(compact) || /^신입[^\d년]*$/i.test(compact)) {
    return '신입';
  }

  const yearMatch = /(\d+)\s*년/.exec(source) || /경력\s*(\d+)/.exec(source) || /(\d+)\s*↑/.exec(source);
  if (yearMatch) {
    const years = Number(yearMatch[1]);
    if (years >= 6) return MANUAL_EXPERIENCE_OVER_LIMIT;
    if (years >= 1) return years + '년 이상';
  }

  if (/경력/i.test(source)) return CAREER_BAND_UNSPECIFIED;
  return '';
}

function bodyExperienceFromManual_(manualExperience) {
  const manual = normalizeManualExperience_(manualExperience);
  if (manual === MANUAL_EXPERIENCE_NONE) return '연차 명시 없음';
  if (manual === MANUAL_EXPERIENCE_UNSPECIFIED) return CAREER_BAND_UNSPECIFIED;
  if (manual === MANUAL_EXPERIENCE_OVER_LIMIT) return MANUAL_EXPERIENCE_OVER_LIMIT;
  if (EXPERIENCE_YEAR_OPTIONS.indexOf(manual) !== -1) return manual;
  return '';
}

function applyManualExperienceOverrides_(ss) {
  const jobsSheet = ss.getSheetByName(TAB_NAMES.jobs);
  const excludedSheet = ss.getSheetByName(TAB_NAMES.excluded);
  if (!jobsSheet) return { updatedJobs: 0, recordedExcluded: 0, movedToExcluded: 0, updatedWeeklyRows: 0, appendedWeeklyRows: 0 };

  const rows = readTable(jobsSheet, JOB_HEADERS.length);
  let updatedJobs = 0;
  let recordedExcluded = 0;
  let skipped = 0;
  let updatedEvidence = 0;
  const careerValues = [];
  const evidenceValues = [];
  const excludedRows = [];

  rows.forEach(function (row) {
    const manualExperience = normalizeManualExperience_(row[15]);
    const nextBand = manualExperienceToJobBand_(manualExperience);

    if (!nextBand) {
      careerValues.push([row[1]]);
      evidenceValues.push([row[16]]);
      skipped += 1;
      return;
    }

    if (textValue(row[1]).trim() !== nextBand) {
      row[1] = nextBand;
      updatedJobs += 1;
    }

    careerValues.push([row[1]]);
    const evidence = appendExperienceEvidence_(row[16], '수동입력경력(' + manualExperience + ') 적용');
    if (evidence !== textValue(row[16]).trim()) {
      row[16] = evidence;
      updatedEvidence += 1;
    }
    evidenceValues.push([row[16]]);

    if (isManualExcludedExperience_(manualExperience)) {
      excludedRows.push(buildManualExcludedRow_(row, manualExperience));
    }
  });

  if (excludedRows.length > 0 && excludedSheet) {
    const excludedResult = upsertRows(excludedSheet, EXCLUDED_HEADERS, excludedRows, [0, 4, 1]);
    recordedExcluded = excludedResult.inserted + excludedResult.updated;
  }

  if (rows.length > 0 && updatedJobs > 0) {
    jobsSheet.getRange(2, 2, careerValues.length, 1).setValues(careerValues);
  }
  if (rows.length > 0 && updatedEvidence > 0) {
    jobsSheet.getRange(2, 17, evidenceValues.length, 1).setValues(evidenceValues);
  }

  const weeklyResult = refreshWeeklySummaryFromJobRows_(ss, rows);
  return {
    updatedJobs: updatedJobs,
    recordedExcluded: recordedExcluded,
    movedToExcluded: 0,
    removedJobs: 0,
    skipped: skipped,
    updatedEvidence: updatedEvidence,
    updatedWeeklyRows: weeklyResult.updated,
    appendedWeeklyRows: weeklyResult.inserted
  };
}

function normalizeManualExperience_(manualExperience) {
  const value = textValue(manualExperience).trim();
  return MANUAL_EXPERIENCE_ALIASES[value] || value;
}

function isResolvedManualExperience_(manualExperience) {
  const value = normalizeManualExperience_(manualExperience);
  return Boolean(value) && value !== MANUAL_EXPERIENCE_PENDING;
}

function isManualConfirmationNeeded_(bodyExperience) {
  return textValue(bodyExperience).trim() === '수동 확인 필요';
}

function isManualExcludedExperience_(manualExperience) {
  return Boolean(MANUAL_EXCLUSION_CONFIG[normalizeManualExperience_(manualExperience)]);
}

function manualExperienceToJobBand_(manualExperience) {
  const value = normalizeManualExperience_(manualExperience);
  return manualExperienceToCareerBand_(value) || manualExperienceToExcludedCareerBand_(value);
}

function manualExperienceToExcludedCareerBand_(manualExperience) {
  const config = MANUAL_EXCLUSION_CONFIG[normalizeManualExperience_(manualExperience)];
  return config ? config.careerBand : '';
}

function buildManualExcludedRow_(jobRow, manualExperience) {
  const 기준일 = keyValue(jobRow[0]).trim() || todayDate();
  const company = textValue(jobRow[2]).trim();
  const title = textValue(jobRow[3]).trim();
  const url = textValue(jobRow[10]).trim();
  const config = MANUAL_EXCLUSION_CONFIG[normalizeManualExperience_(manualExperience)] || {
    category: '수동 제외',
    reason: '수동입력경력에서 제외 대상으로 지정'
  };

  return [
    기준일,
    [company, title].filter(Boolean).join(' / '),
    config.category,
    config.reason,
    url,
    currentTimestamp()
  ];
}

function manualExperienceToCareerBand_(manualExperience) {
  return MANUAL_EXPERIENCE_TO_CAREER_BAND[normalizeManualExperience_(manualExperience)] || '';
}

function refreshWeeklySummaryFromJobRows_(ss, jobRows) {
  const weeklySheet = ss.getSheetByName(TAB_NAMES.weekly);
  if (!weeklySheet) return { updated: 0, inserted: 0 };

  const statsByDate = {};
  jobRows.forEach(function (row) {
    const 기준일 = keyValue(row[0]).trim();
    if (!기준일) return;

    if (!statsByDate[기준일]) {
      const counts = {};
      ACTIVE_CAREER_BAND_OPTIONS.forEach(function (band) {
        counts[band] = 0;
      });
      statsByDate[기준일] = {
        rows: [],
        counts: counts
      };
    }

    if (isActiveCareerBand_(row[1])) {
      statsByDate[기준일].rows.push(row);
      statsByDate[기준일].counts[textValue(row[1]).trim()] += 1;
    }
  });

  const weeklyRows = readTable(weeklySheet, WEEKLY_HEADERS.length);
  const rowByDate = {};
  weeklyRows.forEach(function (row, index) {
    const dateKey = keyValue(row[0]).trim();
    if (dateKey) rowByDate[dateKey] = index;
  });

  let updated = 0;
  const appendRows = [];
  Object.keys(statsByDate).sort().forEach(function (dateKey) {
    const stats = statsByDate[dateKey];
    const 신입 = stats.counts[CAREER_BAND_NEW];
    const oneToThree = stats.counts[CAREER_BAND_ONE_TO_THREE];
    const threeToFive = stats.counts[CAREER_BAND_THREE_TO_FIVE];
    const total = 신입 + oneToThree + threeToFive;
    const keywordSummary = buildJobTypeSummary_(stats.rows);

    if (rowByDate[dateKey] !== undefined) {
      const row = weeklyRows[rowByDate[dateKey]];
      row[1] = 신입;
      row[2] = oneToThree;
      row[3] = threeToFive;
      row[4] = total;
      row[5] = keywordSummary;
      row[8] = currentTimestamp();
      updated += 1;
    } else {
      appendRows.push([
        dateKey,
        신입,
        oneToThree,
        threeToFive,
        total,
        keywordSummary,
        '수동입력경력 적용 후 재집계',
        'P열 수동입력경력 기준으로 경력구간과 차트 집계 반영',
        currentTimestamp()
      ]);
    }
  });

  if (weeklyRows.length > 0) {
    weeklySheet.getRange(2, 1, weeklyRows.length, WEEKLY_HEADERS.length).setValues(weeklyRows);
  }
  if (appendRows.length > 0) {
    weeklySheet.getRange(weeklySheet.getLastRow() + 1, 1, appendRows.length, WEEKLY_HEADERS.length).setValues(appendRows);
  }

  return { updated: updated, inserted: appendRows.length };
}

function buildJobTypeSummary_(rows) {
  const counts = {};
  rows.forEach(function (row) {
    const jobType = textValue(row[4]).trim() || '미분류';
    counts[jobType] = (counts[jobType] || 0) + 1;
  });

  const summary = Object.keys(counts)
    .map(function (key) {
      return [key, counts[key]];
    })
    .sort(function (a, b) {
      return b[1] - a[1];
    })
    .slice(0, 6)
    .map(function (entry) {
      return entry[0] + ' ' + entry[1] + '건';
    })
    .join(', ');

  return summary || '데이터 없음';
}

function isActiveCareerBand_(value) {
  const band = textValue(value).trim();
  return ACTIVE_CAREER_BAND_OPTIONS.indexOf(band) !== -1;
}

function normalizeWeeklyRow(payload) {
  const weekly = payload.weeklySummary || payload.weekly_summary || payload.weekly || {};
  const now = currentTimestamp();
  const 기준일 = textValue(pick(weekly, ['기준일', 'date', 'baseDate', 'checkedDate'], pick(payload, ['기준일', 'date', 'baseDate'], todayDate())));
  const 신입 = numberValue(pick(weekly, ['신입/경력무관', 'newGradCount', 'entryCount', 'junior0Count'], 0));
  const oneToThree = numberValue(pick(weekly, ['1~3년차', 'oneToThreeCount', 'juniorCount'], 0));
  const threeToFive = numberValue(pick(weekly, ['3~5년차', 'threeToFiveCount', 'midCount'], 0));
  const explicitTotal = pick(weekly, ['총공고수', 'totalCount'], '');
  const total = explicitTotal === '' ? 신입 + oneToThree + threeToFive : numberValue(explicitTotal);

  return [
    기준일,
    신입,
    oneToThree,
    threeToFive,
    total,
    textValue(pick(weekly, ['대표키워드', 'keywords', 'topKeywords'], '')),
    textValue(pick(weekly, ['이번주전략', 'strategy', 'weeklyStrategy'], '')),
    textValue(pick(weekly, ['아카이브메모', 'archiveMemo'], '자동화 아카이브는 백업으로만 유지')),
    now
  ];
}

function normalizeJobRows(payload, defaultDate) {
  const jobs = payload.jobs || payload.jobRows || payload.postings || [];
  const now = currentTimestamp();

  return jobs.map(function (job) {
    return [
      textValue(pick(job, ['기준일', 'date', 'baseDate'], defaultDate)),
      textValue(pick(job, ['경력구간', 'experienceRange', 'experience'], '')),
      textValue(pick(job, ['회사', 'company'], '')),
      textValue(pick(job, ['공고명', 'title', 'jobTitle'], '')),
      textValue(pick(job, ['직무분류', 'category', 'roleCategory', 'role'], '')),
      textValue(pick(job, ['주요업무', 'tasks', 'responsibilities'], '')),
      textValue(pick(job, ['요구역량', 'requirements'], '')),
      textValue(pick(job, ['우대사항', 'preferences', 'preferred'], '')),
      textValue(pick(job, ['추천포트폴리오', 'recommendedPortfolio', 'portfolio'], '')),
      textValue(pick(job, ['지원우선도', 'priority', 'applyPriority'], '')),
      textValue(pick(job, ['공고URL', 'url', 'jobUrl'], '')),
      textValue(pick(job, ['비고', 'note', 'memo'], '')),
      now,
      textValue(pick(job, ['표시경력', 'listedExperience'], '')),
      textValue(pick(job, ['본문요구경력', 'bodyExperience'], '')),
      textValue(pick(job, ['수동입력경력', 'manualExperience'], '')),
      textValue(pick(job, ['경력판정근거', 'experienceEvidence'], ''))
    ];
  }).filter(function (row) {
    return row[2] || row[3] || row[10];
  });
}

function normalizeExcludedRows(payload, defaultDate) {
  const excluded = payload.excluded || payload.excludedRows || [];
  const now = currentTimestamp();

  return excluded.map(function (item) {
    const title = textValue(pick(item, ['회사/공고명', 'title', 'jobTitle', 'name'], ''));
    const company = textValue(pick(item, ['회사', 'company'], ''));

    return [
      textValue(pick(item, ['기준일', 'date', 'baseDate'], defaultDate)),
      title || company,
      textValue(pick(item, ['제외분류', 'excludeCategory', 'category'], '')),
      textValue(pick(item, ['제외이유', 'excludeReason', 'reason'], '')),
      textValue(pick(item, ['URL', 'url', 'jobUrl'], '')),
      now
    ];
  }).filter(function (row) {
    return row[1] || row[4];
  });
}

function normalizeGameReferenceRows(payload, defaultDate) {
  const references = payload.gameReferences || payload.gameExperienceReferences || [];

  return references.map(function (item) {
    return normalizeGameReferenceItem(item, defaultDate, 'payload');
  }).filter(function (row) {
    return row[1] || row[2] || row[10];
  });
}

function normalizeCompanyMonitorRows(payload, defaultDate) {
  const rows = payload.companyMonitor || payload.companyMonitorRows || payload.watchlistItems || [];
  const now = currentTimestamp();

  return rows.map(function (item) {
    return [
      textValue(pick(item, ['마지막확인일', '확인일', 'date', 'checkedDate'], defaultDate)),
      textValue(pick(item, ['회사', 'company'], '')) ,
      textValue(pick(item, ['관심도', 'interest', 'priority'], '')) ,
      textValue(pick(item, ['자료유형', 'type', 'materialType'], '')) ,
      textValue(pick(item, ['직무/이슈분류', 'category', 'roleCategory'], '')) ,
      textValue(pick(item, ['제목', 'title'], '')) ,
      textValue(pick(item, ['상태', 'status'], '')) ,
      textValue(pick(item, ['게시일/마감일', 'publishedOrClosingDate', 'deadline'], '')) ,
      textValue(pick(item, ['관련프로젝트', 'project'], '')) ,
      textValue(pick(item, ['지원관점메모', 'applicationMemo', 'memo'], '')) ,
      textValue(pick(item, ['연결포트폴리오', 'portfolio'], '')) ,
      textValue(pick(item, ['즉시액션', 'action'], '')) ,
      textValue(pick(item, ['URL', 'url'], '')) ,
      now
    ];
  }).filter(function (row) {
    return row[1] || row[5] || row[12];
  });
}

function normalizeIndustryMaterialRows(payload, defaultDate) {
  const rows = payload.industryMaterials || payload.industryMaterialRows || payload.articles || [];
  const now = currentTimestamp();

  return rows.map(function (item) {
    return [
      textValue(pick(item, ['확인일', 'date', 'checkedDate'], defaultDate)),
      textValue(pick(item, ['회사', 'company'], '')) ,
      textValue(pick(item, ['자료구분', 'type', 'materialType'], '기사')) ,
      textValue(pick(item, ['매체', 'source', 'publisher'], '')) ,
      textValue(pick(item, ['제목', 'title'], '')) ,
      textValue(pick(item, ['게시일', 'publishedDate'], '')) ,
      textValue(pick(item, ['핵심내용', 'summary'], '')) ,
      textValue(pick(item, ['지원관점메모', 'applicationMemo', 'memo'], '')) ,
      textValue(pick(item, ['관련키워드', 'keywords'], '')) ,
      textValue(pick(item, ['연결포트폴리오', 'portfolio'], '')) ,
      textValue(pick(item, ['URL', 'url'], '')) ,
      now
    ];
  }).filter(function (row) {
    return row[1] || row[4] || row[10];
  });
}

function normalizeGameReferenceItem(item, defaultDate, sourceName) {
  const title = textValue(pick(item, ['게임명/경험명', '게임명', '경험명', 'gameName', 'experienceName', 'title'], ''));
  const genre = textValue(pick(item, ['장르', 'genre'], ''));
  const platform = textValue(pick(item, ['플랫폼', 'platform'], ''));
  const playLevel = textValue(pick(item, ['플레이수준', '플레이 정도', 'playLevel'], ''));
  const goodPoint = textValue(pick(item, ['좋았던점/인상포인트', '좋았던점', '인상포인트', 'goodPoint'], ''));
  const issue = textValue(pick(item, ['문제점/개선여지', 'issue', 'improvement'], ''));
  const lesson = textValue(pick(item, ['기획적으로배울점', 'lesson'], inferDesignLesson(title, genre, goodPoint, issue)));
  const keywords = textValue(pick(item, ['관련키워드', 'keywords'], inferReferenceKeywords([title, genre, platform, playLevel, goodPoint, issue, lesson].join(' '))));

  return [
    textValue(pick(item, ['수집일', 'date', 'collectedDate'], defaultDate || todayDate())),
    textValue(pick(item, ['자료구분', 'type'], '게임경험')),
    title,
    textValue(pick(item, ['개발/퍼블리셔', 'developerPublisher'], '')),
    genre,
    platform,
    textValue(pick(item, ['플레이시간/기간', 'playTime', 'period'], '')),
    textValue(pick(item, ['현재플레이', 'currentPlay'], '')),
    playLevel,
    textValue(pick(item, ['역할/기여', 'role'], '')),
    goodPoint,
    issue,
    lesson,
    textValue(pick(item, ['관련직무', 'relatedRole'], inferRelatedRole(keywords))),
    keywords,
    textValue(pick(item, ['포트폴리오연결', 'portfolioLink'], inferPortfolioLink(title, keywords))),
    textValue(pick(item, ['활용방식', 'usage'], inferReferenceUsage(title, sourceName))),
    textValue(pick(item, ['우선도', 'priority'], inferReferencePriority(title, playLevel, goodPoint))),
    textValue(pick(item, ['STAR근거', 'star'], '')),
    textValue(pick(item, ['URL/자료', 'url', 'resource'], '')),
    textValue(pick(item, ['원본시트', 'source'], sourceName)),
    textValue(pick(item, ['비고', 'note'], ''))
  ];
}

function importGameExperienceReferences(ss, referenceSourceIds) {
  const sheet = ss.getSheetByName(TAB_NAMES.gameReferences);
  if (!sheet) return { inserted: 0, updated: 0, skipped: 0, errors: ['missing target sheet'] };

  const rows = [];
  const errors = [];

  try {
    rows.push.apply(rows, readPlayHistoryReferences(referenceSourceIds));
  } catch (err) {
    errors.push('playHistory: ' + String(err));
  }

  try {
    rows.push.apply(rows, readExperienceStarReferences(referenceSourceIds));
  } catch (err) {
    errors.push('experience: ' + String(err));
  }

  try {
    rows.push.apply(rows, readCareerLogReferences(referenceSourceIds));
  } catch (err) {
    errors.push('careerLog: ' + String(err));
  }

  const result = upsertRows(sheet, GAME_REFERENCE_HEADERS, rows, [1, 2, 20]);
  result.errors = errors;
  return result;
}

function readPlayHistoryReferences(referenceSourceIds) {
  const source = SpreadsheetApp.openById(referenceSourceIds.playHistory).getSheetByName('플레이 이력');
  if (!source) return [];

  const values = source.getDataRange().getDisplayValues();
  const rows = [];
  let section = '';

  values.forEach(function (row) {
    const rowText = row.join(' ');

    if (rowText.indexOf('주로 플레이') !== -1 || rowText.indexOf('선호하는 게임 장르') !== -1) {
      section = '선호장르';
      return;
    }
    if (rowText.indexOf('깊이 있게 플레이') !== -1) {
      section = '깊이플레이';
      return;
    }
    if (rowText.indexOf('기억 나는 게임') !== -1 || rowText.indexOf('기억나는 게임') !== -1) {
      section = '기억나는게임';
      return;
    }
    if (rowText.indexOf('기억 잘 안나는 게임') !== -1) {
      section = '플레이기록';
      return;
    }

    if (!section || rowText.indexOf('No.') !== -1 || rowText.indexOf('게임 장르') !== -1) return;

    if (section === '선호장르') {
      const genre = textValue(row[2]).trim();
      const reason = textValue(row[3]).trim();
      if (!genre || !reason) return;

      rows.push(normalizeGameReferenceItem({
        '수집일': todayDate(),
        '자료구분': '선호장르',
        '게임명/경험명': '선호장르: ' + genre,
        '장르': genre,
        '좋았던점/인상포인트': reason,
        '기획적으로배울점': '선호 장르와 흥미 포인트를 포트폴리오/면접 답변의 취향 근거로 활용',
        '관련직무': inferRelatedRole(genre + ' ' + reason),
        '관련키워드': inferReferenceKeywords(genre + ' ' + reason),
        '활용방식': '면접근거',
        '우선도': '중',
        '원본시트': '이동현_게임플레이이력/플레이 이력'
      }, todayDate(), '이동현_게임플레이이력/플레이 이력'));
      return;
    }

    const genre = textValue(row[1]).trim();
    const platform = textValue(row[2]).trim();
    const gameName = textValue(row[3]).trim();
    const playTime = textValue(row[4]).trim();
    const currentPlay = textValue(row[5]).trim();
    const playLevel = textValue(row[6]).trim();
    const goodPoint = textValue(row[7]).trim();
    const note = textValue(row[8]).trim();

    if (!gameName) return;

    rows.push(normalizeGameReferenceItem({
      '수집일': todayDate(),
      '자료구분': section,
      '게임명/경험명': gameName,
      '장르': genre,
      '플랫폼': platform,
      '플레이시간/기간': playTime,
      '현재플레이': currentPlay,
      '플레이수준': playLevel,
      '좋았던점/인상포인트': goodPoint,
      '비고': note,
      '원본시트': '이동현_게임플레이이력/플레이 이력'
    }, todayDate(), '이동현_게임플레이이력/플레이 이력'));
  });

  return rows;
}

function readExperienceStarReferences(referenceSourceIds) {
  const source = SpreadsheetApp.openById(referenceSourceIds.experience).getSheetByName('경험정리표');
  if (!source) return [];

  const values = source.getDataRange().getDisplayValues();
  const rows = [];

  values.forEach(function (row, index) {
    if (index < 3) return;

    const type = textValue(row[1]).trim();
    const experience = textValue(row[2]).trim();
    const role = textValue(row[3]).trim();
    const start = textValue(row[4]).trim();
    const end = textValue(row[5]).trim();
    const situation = textValue(row[6]).trim();
    const task = textValue(row[7]).trim();
    const action = textValue(row[8]).trim();
    const result = textValue(row[9]).trim();
    const competency = textValue(row[10]).trim();
    const note = textValue(row[11]).trim();

    if (!experience) return;

    rows.push(normalizeGameReferenceItem({
      '수집일': todayDate(),
      '자료구분': type || 'STAR경험',
      '게임명/경험명': experience,
      '플레이시간/기간': [start, end].filter(Boolean).join(' ~ '),
      '역할/기여': role,
      '좋았던점/인상포인트': task || situation,
      '기획적으로배울점': action || result,
      '관련키워드': competency,
      '활용방식': '자소서/면접근거',
      '우선도': '중',
      'STAR근거': buildStarText(situation, task, action, result),
      '원본시트': '이동현_경험정리표/경험정리표',
      '비고': note
    }, todayDate(), '이동현_경험정리표/경험정리표'));
  });

  return rows;
}

function readCareerLogReferences(referenceSourceIds) {
  const source = SpreadsheetApp.openById(referenceSourceIds.careerLog).getSheetByName('시트1');
  if (!source) return [];

  const values = source.getDataRange().getDisplayValues();
  const rows = [];
  let category = '';

  values.forEach(function (row, index) {
    if (index < 2) return;

    const rawCategory = textValue(row[0]).replace(/\s+/g, ' ').trim();
    if (rawCategory) category = rawCategory;

    const experience = textValue(row[2]).trim();
    const period = textValue(row[4]).trim();
    const role = textValue(row[5]).trim();
    const host = textValue(row[6]).trim();

    if (!experience || experience.indexOf('경험 내용') !== -1) return;

    rows.push(normalizeGameReferenceItem({
      '수집일': todayDate(),
      '자료구분': category || '커리어경험',
      '게임명/경험명': experience,
      '개발/퍼블리셔': host,
      '플레이시간/기간': period,
      '역할/기여': role,
      '기획적으로배울점': inferCareerLesson(experience, role),
      '관련키워드': inferReferenceKeywords(experience + ' ' + role + ' ' + category),
      '활용방식': '자소서/면접근거',
      '우선도': inferReferencePriority(experience, role, category),
      '원본시트': '이동현_커리어로그/시트1'
    }, todayDate(), '이동현_커리어로그/시트1'));
  });

  return rows;
}

function upsertRows(sheet, headers, rows, keyColumns) {
  if (!rows || rows.length === 0) {
    return { inserted: 0, updated: 0, skipped: 0 };
  }

  const existing = readTable(sheet, headers.length);
  const keyToRowNumber = {};

  existing.forEach(function (row, index) {
    const key = buildKey(row, keyColumns);
    if (key) keyToRowNumber[key] = index + 2;
  });

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const appendRows = [];
  const pendingKeys = {};

  rows.forEach(function (row) {
    const normalized = normalizeRowLength(row, headers.length);
    const key = buildKey(normalized, keyColumns);

    if (!key) {
      appendRows.push(normalized);
      inserted += 1;
      return;
    }

    if (pendingKeys[key]) {
      skipped += 1;
      return;
    }

    if (keyToRowNumber[key]) {
      sheet.getRange(keyToRowNumber[key], 1, 1, headers.length).setValues([normalized]);
      updated += 1;
    } else {
      appendRows.push(normalized);
      pendingKeys[key] = true;
      inserted += 1;
    }
  });

  if (appendRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, appendRows.length, headers.length).setValues(appendRows);
  }

  return { inserted: inserted, updated: updated, skipped: skipped };
}

function refreshChartData(ss) {
  const weeklySheet = ss.getSheetByName(TAB_NAMES.weekly);
  const jobsSheet = ss.getSheetByName(TAB_NAMES.jobs);
  const chartSheet = ss.getSheetByName(TAB_NAMES.chartData);

  chartSheet.clear();

  const weeklyRows = readTable(weeklySheet, WEEKLY_HEADERS.length);
  const jobRows = readTable(jobsSheet, JOB_HEADERS.length);
  const activeJobRows = jobRows.filter(function (row) {
    return isActiveCareerBand_(row[1]);
  });

  const trend = [['기준일', '신입/경력무관', '1~3년차', '3~5년차']];
  weeklyRows.forEach(function (row) {
    if (row[0]) trend.push([row[0], numberValue(row[1]), numberValue(row[2]), numberValue(row[3])]);
  });

  const latest = [['경력구간', '공고수']];
  if (weeklyRows.length > 0) {
    const latestWeekly = weeklyRows[weeklyRows.length - 1];
    latest.push([CAREER_BAND_NEW, numberValue(latestWeekly[1])]);
    latest.push([CAREER_BAND_ONE_TO_THREE, numberValue(latestWeekly[2])]);
    latest.push([CAREER_BAND_THREE_TO_FIVE, numberValue(latestWeekly[3])]);
  }

  const keywordFrequency = buildKeywordFrequency(activeJobRows);
  const priorityDistribution = buildPriorityDistribution(activeJobRows);

  const ranges = {};
  ranges.trend = writeTable(chartSheet, 1, 1, trend);
  ranges.latest = writeTable(chartSheet, 1, 6, latest);
  ranges.keywords = writeTable(chartSheet, 18, 1, keywordFrequency);
  ranges.priority = writeTable(chartSheet, 18, 6, priorityDistribution);

  chartSheet.autoResizeColumns(1, 8);
  return ranges;
}

function refreshDashboardCharts(ss, ranges) {
  const dashboard = ss.getSheetByName(TAB_NAMES.dashboard);
  const chartData = ss.getSheetByName(TAB_NAMES.chartData);

  dashboard.getRange('A1:N4').breakApart();
  dashboard.clear();
  dashboard.getCharts().forEach(function (chart) {
    dashboard.removeChart(chart);
  });

  dashboard.setHiddenGridlines(true);
  dashboard.setColumnWidths(1, 14, 96);
  dashboard.setRowHeights(1, 40, 26);

  dashboard.getRange('A1:N1')
    .merge()
    .setValue('게임잡 게임기획 공고 대시보드')
    .setFontWeight('bold')
    .setFontSize(18)
    .setFontColor('#ffffff')
    .setBackground('#17365d')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  dashboard.getRange('A2:N2')
    .merge()
    .setValue('자동화 아카이브는 백업으로 유지하고, 이 시트는 누적 분석과 차트 확인용으로 사용합니다.')
    .setFontColor('#555555')
    .setBackground('#f3f6fa')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  renderManualApplyGuide_(dashboard);

  if (ranges.trend.numRows > 1) {
    dashboard.insertChart(
      dashboard.newChart()
        .setChartType(Charts.ChartType.LINE)
        .addRange(rangeFromDescriptor(chartData, ranges.trend))
        .setPosition(4, 1, 0, 0)
        .setOption('title', '경력구간별 공고 수 주간 추이')
        .setOption('legend', { position: 'bottom' })
        .setOption('curveType', 'none')
        .setOption('width', 760)
        .setOption('height', 360)
        .build()
    );
  }

  if (ranges.latest.numRows > 1) {
    dashboard.insertChart(
      dashboard.newChart()
        .setChartType(Charts.ChartType.PIE)
        .addRange(rangeFromDescriptor(chartData, ranges.latest))
        .setPosition(4, 9, 0, 0)
        .setOption('title', '최신 주차 경력구간 분포')
        .setOption('legend', { position: 'right' })
        .setOption('width', 520)
        .setOption('height', 360)
        .build()
    );
  }

  if (ranges.keywords.numRows > 1) {
    dashboard.insertChart(
      dashboard.newChart()
        .setChartType(Charts.ChartType.COLUMN)
        .addRange(rangeFromDescriptor(chartData, ranges.keywords))
        .setPosition(22, 1, 0, 0)
        .setOption('title', '직무 키워드 빈도')
        .setOption('legend', { position: 'none' })
        .setOption('width', 760)
        .setOption('height', 360)
        .build()
    );
  }

  if (ranges.priority.numRows > 1) {
    dashboard.insertChart(
      dashboard.newChart()
        .setChartType(Charts.ChartType.COLUMN)
        .addRange(rangeFromDescriptor(chartData, ranges.priority))
        .setPosition(22, 9, 0, 0)
        .setOption('title', '지원우선도 분포')
        .setOption('legend', { position: 'none' })
        .setOption('width', 520)
        .setOption('height', 360)
        .build()
    );
  }
}

function renderManualApplyGuide_(dashboard) {
  dashboard.setRowHeight(3, 34);
  dashboard.getRange('A3:N3')
    .breakApart()
    .merge()
    .clearDataValidations()
    .setValue('상단 메뉴 [취업자료 관리 > 수동입력경력 적용]에서 P열 수동입력경력을 경력구간/요약/차트에 반영합니다. 제외/마감 값은 공고상세에서 삭제하지 않고 제외사례에 기록합니다.')
    .setFontWeight('bold')
    .setFontColor('#0b5394')
    .setBackground('#d9ead3')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle')
    .setWrap(true);
}

function buildKeywordFrequency(jobRows) {
  const patterns = [
    ['시스템', /시스템/i],
    ['콘텐츠', /콘텐츠/i],
    ['전투', /전투/i],
    ['밸런스', /밸런스/i],
    ['레벨', /레벨/i],
    ['퀘스트', /퀘스트/i],
    ['설정', /설정/i],
    ['시나리오/내러티브', /시나리오|내러티브|스토리/i],
    ['UI/UX', /UI\/UX|UI|UX|HUD/i],
    ['라이브/운영', /라이브|운영/i],
    ['모바일', /모바일/i],
    ['RPG', /RPG/i],
    ['방치형', /방치형/i],
    ['로그라이트', /로그라이트/i]
  ];

  const counts = {};
  patterns.forEach(function (entry) {
    counts[entry[0]] = 0;
  });

  jobRows.forEach(function (row) {
    const text = [row[4], row[5], row[6], row[7], row[8], row[11]].join(' ');
    patterns.forEach(function (entry) {
      if (entry[1].test(text)) counts[entry[0]] += 1;
    });
  });

  const result = [['직무키워드', '빈도']];
  Object.keys(counts)
    .map(function (key) {
      return [key, counts[key]];
    })
    .filter(function (row) {
      return row[1] > 0;
    })
    .sort(function (a, b) {
      return b[1] - a[1];
    })
    .slice(0, 12)
    .forEach(function (row) {
      result.push(row);
    });

  if (result.length === 1) result.push(['데이터 없음', 0]);
  return result;
}

function buildPriorityDistribution(jobRows) {
  const counts = {};

  jobRows.forEach(function (row) {
    const priority = textValue(row[9]) || '미분류';
    counts[priority] = (counts[priority] || 0) + 1;
  });

  const result = [['지원우선도', '공고수']];
  Object.keys(counts)
    .sort()
    .forEach(function (priority) {
      result.push([priority, counts[priority]]);
    });

  if (result.length === 1) result.push(['데이터 없음', 0]);
  return result;
}

function readTable(sheet, width) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, width).getValues();
}

function dedupeAllTables(ss) {
  dedupeRows(ss.getSheetByName(TAB_NAMES.weekly), WEEKLY_HEADERS.length, [0]);
  dedupeRows(ss.getSheetByName(TAB_NAMES.jobs), JOB_HEADERS.length, [0, 10]);
  dedupeRows(ss.getSheetByName(TAB_NAMES.excluded), EXCLUDED_HEADERS.length, [0, 4, 1]);
  dedupeRows(ss.getSheetByName(TAB_NAMES.gameReferences), GAME_REFERENCE_HEADERS.length, [1, 2, 20]);
  dedupeRows(ss.getSheetByName(TAB_NAMES.companyMonitor), COMPANY_MONITOR_HEADERS.length, [1, 12]);
  dedupeRows(ss.getSheetByName(TAB_NAMES.industryMaterials), INDUSTRY_MATERIAL_HEADERS.length, [1, 10]);
}

function dedupeRows(sheet, width, keyColumns) {
  if (!sheet) return;

  const rows = readTable(sheet, width);
  const seen = {};

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const key = buildKey(rows[index], keyColumns);
    if (!key) continue;

    if (seen[key]) {
      sheet.deleteRow(index + 2);
    } else {
      seen[key] = true;
    }
  }
}

function deleteRowsByDate_(sheet, width, dateValue) {
  if (!sheet || !dateValue) return;

  const rows = readTable(sheet, width);
  const blocks = [];
  let blockEnd = null;
  let blockStart = null;

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (keyValue(rows[index][0]) === String(dateValue)) {
      if (blockEnd === null) {
        blockEnd = index + 2;
        blockStart = index + 2;
      } else if (index + 2 === blockStart - 1) {
        blockStart = index + 2;
      } else {
        blocks.push([blockStart, blockEnd - blockStart + 1]);
        blockEnd = index + 2;
        blockStart = index + 2;
      }
    }
  }

  if (blockEnd !== null) blocks.push([blockStart, blockEnd - blockStart + 1]);
  blocks.forEach(function (block) {
    sheet.deleteRows(block[0], block[1]);
  });
}

function writeTable(sheet, startRow, startColumn, values) {
  if (!values || values.length === 0) values = [['']];
  sheet.getRange(startRow, startColumn, values.length, values[0].length).setValues(values);
  sheet.getRange(startRow, startColumn, 1, values[0].length)
    .setFontWeight('bold')
    .setBackground('#e8f0fe');

  return {
    row: startRow,
    column: startColumn,
    numRows: values.length,
    numColumns: values[0].length
  };
}

function rangeFromDescriptor(sheet, descriptor) {
  return sheet.getRange(descriptor.row, descriptor.column, descriptor.numRows, descriptor.numColumns);
}

function inferReferenceKeywords(text) {
  const source = textValue(text);
  const keywords = [];
  const rules = [
    ['시스템기획', /시스템|규칙|구조|자동화|마일스톤|성장|장비|스킬/i],
    ['콘텐츠기획', /콘텐츠|스테이지|퀘스트|스토리|업데이트|창작마당/i],
    ['전투기획', /전투|덱빌딩|소울라이크|액션|승천|클리어|스킬/i],
    ['밸런스기획', /밸런스|난이도|티어|레벨|훈장|승천/i],
    ['레벨기획', /레벨디자인|맵|플랫포머|동선|수집요소|이스터에그/i],
    ['UI\/UX기획', /UI|UX|HUD|튜토리얼|텍스트 없이|진입|정보/i],
    ['내러티브', /내러티브|스토리|세계관|작가|철학|의도/i],
    ['로그라이트', /로그라이트|로그라이크/i],
    ['전략', /전략|계획|선택/i],
    ['시뮬레이션', /시뮬레이션|고증|업무/i],
    ['프로젝트문', /Limbus|Library of Ruina|림버스|라오루|프로젝트문/i]
  ];

  rules.forEach(function (rule) {
    if (rule[1].test(source)) keywords.push(rule[0]);
  });

  return keywords.join(', ');
}

function inferRelatedRole(text) {
  const keywords = textValue(text);
  const roles = [];

  if (/시스템|규칙|구조|성장|장비|스킬|자동화/i.test(keywords)) roles.push('시스템기획');
  if (/콘텐츠|퀘스트|스토리|업데이트|창작마당/i.test(keywords)) roles.push('콘텐츠기획');
  if (/전투|덱빌딩|액션|승천|클리어/i.test(keywords)) roles.push('전투기획');
  if (/밸런스|난이도|티어|레벨/i.test(keywords)) roles.push('밸런스기획');
  if (/UI|UX|HUD|튜토리얼|정보|진입/i.test(keywords)) roles.push('UI/UX기획');
  if (/내러티브|스토리|세계관/i.test(keywords)) roles.push('시나리오/내러티브');

  return roles.join(', ');
}

function inferPortfolioLink(title, keywords) {
  const text = [title, keywords].join(' ');
  const links = [];

  if (/튜토리얼|Limbus|림버스|프로젝트문/i.test(text)) links.push('튜토리얼 분석 포트폴리오');
  if (/UI|UX|HUD/i.test(text)) links.push('UT_UI_전투HUD_기획서');
  if (/시스템|규칙|구조|성장|장비|스킬|자동화/i.test(text)) links.push('시스템 기획서');
  if (/밸런스|레벨|난이도|승천/i.test(text)) links.push('C.C.C 레벨/밸런스 디자인 기획서');

  return links.join(', ');
}

function inferReferenceUsage(title, sourceName) {
  const text = [title, sourceName].join(' ');

  if (/경험정리표|커리어로그/i.test(text)) return '자소서/면접근거';
  if (/Limbus|Library of Ruina|림버스|라오루|프로젝트문/i.test(text)) return '역기획/면접근거';
  return '참고/면접근거';
}

function inferReferencePriority(title, evidence, context) {
  const text = [title, evidence, context].join(' ');

  if (/Limbus|Library of Ruina|림버스|라오루|프로젝트문/i.test(text)) return '상';
  if (/535H|131H|120|106|클리어|훈장|승천|FGT|팀 프로젝트/i.test(text)) return '상';
  if (text.trim()) return '중';
  return '하';
}

function inferDesignLesson(title, genre, goodPoint, issue) {
  const text = [title, genre, goodPoint, issue].join(' ');

  if (/튜토리얼|정보|진입/i.test(text)) return '복잡한 규칙은 단계별 학습 구조와 UI 강조가 필요함';
  if (/덱빌딩|전투|승천|난이도/i.test(text)) return '반복 플레이에서는 선택지 변화와 빌드 다양성이 핵심 경험을 만듦';
  if (/자동화|마일스톤|시뮬레이션/i.test(text)) return '목표-생산-보상 루프가 명확할수록 장기 목표 동기가 강해짐';
  if (/스토리|내러티브|세계관|작가/i.test(text)) return '세계관과 시스템이 결합될수록 플레이 경험의 설득력이 커짐';
  if (/레벨디자인|수집요소|이스터에그/i.test(text)) return '탐색 동선과 보상 배치가 플레이어의 자발적 학습을 유도함';
  return '';
}

function inferCareerLesson(experience, role) {
  const text = [experience, role].join(' ');

  if (/FGT|테스트|피드백/i.test(text)) return '플레이어 관찰과 피드백 정리는 기획 개선 근거로 활용 가능';
  if (/팀 프로젝트|플랫포머|프로젝트/i.test(text)) return '팀 단위 제작 경험은 협업, 범위 관리, 구현 가능한 기획 설명의 근거로 활용 가능';
  if (/교사|교육/i.test(text)) return '학습 단계 설계 경험은 튜토리얼/UX 설계 강점으로 연결 가능';
  return '';
}

function buildStarText(situation, task, action, result) {
  const parts = [];
  if (situation) parts.push('S: ' + situation);
  if (task) parts.push('T: ' + task);
  if (action) parts.push('A: ' + action);
  if (result) parts.push('R: ' + result);
  return parts.join('\n');
}

function buildKey(row, keyColumns) {
  const parts = keyColumns.map(function (index) {
    return keyValue(row[index]).trim();
  });

  if (parts.every(function (part) {
    return part === '';
  })) {
    return '';
  }

  return parts.join('||');
}

function keyValue(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, 'Asia/Seoul', 'yyyy-MM-dd');
  }

  return textValue(value);
}

function normalizeRowLength(row, length) {
  const normalized = row.slice(0, length);
  while (normalized.length < length) normalized.push('');
  return normalized;
}

function pick(obj, keys, fallback) {
  if (!obj) return fallback;

  for (let i = 0; i < keys.length; i += 1) {
    const value = obj[keys[i]];
    if (value !== undefined && value !== null && value !== '') return value;
  }

  return fallback;
}

function textValue(value) {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function numberValue(value) {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function todayDate() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
}

function currentTimestamp() {
  return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
