/**
 * Consumer web app for SNS QA test-case spreadsheets.
 * Version: v12 - QA_Dashboard is Bug_Report-first and formula-driven for live chart refresh.
 *
 * Scope:
 * - Do NOT modify the shared CareerHubCore library.
 * - TC_List_Auto_Test is kept as a hidden automation test tab and excluded from active bug automation.
 * - The QA sheet schema is fixed to A3:J3.
 * - Existing dropdown/data-validation rules on 중분류(B), 우선 순위(G), and 결과 확인(H) are not recreated or overwritten.
 * - Existing dropdown/data-validation rules on Bug_Report 중분류(C) and 소분류(D) are not recreated or overwritten.
 * - Rows 1-2 are preserved. A1 image frame is fixed to 117 x 117 px. B1 Hub-return cell is not modified.
 * - Layout formatting is intentionally separated into formatTcSheet(), so automation writes do not re-align the whole table.
 * - If TC_List_Auto_Test is missing, it is created by copying TC_List_Template.
 * - TC_Hub schema is B3:F3 = 대분류 / 중분류 / 시트명 / TC 수 / 비고. Hub sync touches only D:E after preview/confirm and only rows whose 시트명 is blank or TC_List_Auto_Test.
 * - Bug_Report stores bug details. TC_Improvement_Backlog stores TC 보강 items. TC sheet column I is rebuilt from Bug_Report after backlog decisions.
 *
 * Script Properties:
 * - TARGET_SPREADSHEET_ID
 * - WEBHOOK_SECRET
 */

const DEFAULT_QA_SPREADSHEET_ID = '1qVOWB4330UNr0-LSgA1RLCORiqAb9pTkGlzEA-H6Hig';

const LOCAL_QA_TC = {
  sourceSheetName: 'TC_List_Template',
  sheetName: 'TC_List_Auto_Test',
  hubSheetName: 'TC_Hub',
  bugReportSheetName: 'Bug_Report',
  bugTcLinkSheetName: 'Bug_TC_Link',
  bugTcLinkLegacyPrefix: 'Bug_TC_Link_Legacy_',
  tcImprovementBacklogSheetName: 'TC_Improvement_Backlog',
  bugLinkedSheetsSheetName: 'Bug_Linked_Sheets',
  qaDashboardSheetName: 'QA_Dashboard',
  hubHeaderRow: 3,
  hubFirstDataRow: 4,
  hubColumns: {
    majorCategory: 2,
    middleCategory: 3,
    sheetName: 4,
    tcCount: 5,
    note: 6
  },
  headerRow: 3,
  firstDataRow: 4,
  minRows: 200,
  headers: [
    'TC ID',
    '중분류',
    '소분류',
    '테스트 항목',
    '사전 조건',
    '테스트 목적',
    '우선 순위',
    '결과 확인',
    '관련 버그 리포트 ID',
    '비고'
  ],
  priorityColumn: 7,
  resultColumn: 8,
  issueColumn: 9,
  noteColumn: 10,
  resultValues: ['Pass', 'Fail', 'Blocked', 'Not Test', 'N/A'],
  priorityValues: ['1', '2', '3', '4'],
  bugHeaderRow: 3,
  bugFirstDataRow: 5,
  bugExampleRow: 4,
  bugLinkFirstDataRow: 4,
  backlogFirstDataRow: 4,
  dashboardMinRows: 110,
  bugLinkedSheetHeaderRow: 1,
  bugLinkedSheetFirstDataRow: 2,
  bugMinRows: 200,
  bugReportHeaders: [
    'Bug ID',
    '버그 제목',
    '중분류',
    '소분류',
    '재현 조건',
    '재현 절차',
    '기대 결과',
    '실제 결과',
    '심각도',
    '처리 상태',
    '최초 발견 시트명',
    '최초 발견 TC ID',
    '등록일',
    '수정일',
    '빌드 버전',
    '스마트폰 기종',
    '재확인 빌드 버전',
    '버전 확인 결과',
    '비고'
  ],
  bugLinkHeaders: [
    'Link ID',
    '시트명',
    'TC ID',
    'Bug ID',
    '연결 사유',
    '발견 결과',
    '연결 상태',
    '등록일',
    '비고'
  ],
  backlogHeaders: [
    'Backlog ID',
    'Bug ID',
    '버그 제목',
    '대상 시트명',
    '입력 TC ID',
    '확정 시트명',
    '확정 TC ID',
    '보강 사유',
    '추천 TC 제목',
    '처리 상태',
    '등록일',
    '수정일',
    '비고'
  ],
  bugLinkedSheetHeaders: [
    '시트명',
    '활성 여부',
    '등록일',
    '비고'
  ],
  bugStatusValues: ['깃이슈 미제출', '깃이슈 작성 중', '열림', '재검증', '종료', '수정 안 함', '중복 리포트', '수정 완료'],
  bugGithubPendingStatusValues: ['', '깃이슈 미제출', '깃이슈 작성 중'],
  bugGithubManagedStatusValues: ['열림', '재검증', '종료', '수정 안 함', '중복 리포트', '수정 완료'],
  bugUnresolvedStatusValues: ['', '깃이슈 미제출', '깃이슈 작성 중', '열림', '재검증', '수정 완료'],
  bugBuildVersionValues: ['0.1.0', '1.0.0'],
  bugVersionResultValues: ['미확인', '재현됨', '부분 수정', '수정 확인', '재발'],
  bugStatusAliases: {
    Open: '열림',
    Active: '열림',
    Fixed: '수정 완료',
    Resolved: '수정 완료',
    Retest: '재검증',
    Closed: '종료',
    Done: '종료',
    "Won't Fix": '수정 안 함',
    WontFix: '수정 안 함',
    Ignored: '수정 안 함',
    Excluded: '수정 안 함'
  },
  bugSeverityValues: ['1', '2', '3', '4'],
  bugLinkStatusValues: ['Active', 'Resolved', 'Ignored'],
  backlogStatusValues: ['대기', '보강 완료', '제외', '종료'],
  backlogStatusAliases: {
    Pending: '대기',
    Open: '대기',
    Active: '대기',
    Linked: '보강 완료',
    Done: '보강 완료',
    Resolved: '보강 완료',
    Fixed: '보강 완료',
    Ignored: '제외',
    Ignore: '제외',
    Excluded: '제외',
    Exclude: '제외',
    Closed: '종료'
  },
  resultColors: {
    Pass: '#d9ead3',
    Fail: '#f4cccc',
    Blocked: '#fff2cc',
    'Not Test': '#d9d9d9',
    'N/A': '#eeeeee'
  },
  headerBackground: '#1f4e78',
  headerFontColor: '#ffffff'
};

function doGet() {
  return qaTcLocalHealthCheck_(loadConfig_());
}

function doPost(e) {
  return handleQaTcPostLocal_(e, loadConfig_());
}

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('TC Auto Test')
      .addItem('버튼 설명 보기', 'showTcBugMenuGuide')
      .addSeparator()
      .addItem('TC-버그 전체 반영', 'syncAllQaBugRelations')
      .addItem('수동 버그 리포트 반영', 'syncManualBugReports')
      .addSeparator()
      .addItem('버그 연동 시트 추가', 'addBugLinkedSheet')
      .addItem('버그 연동 시트 목록', 'listBugLinkedSheets')
      .addItem('버그 연동 시트 해제', 'removeBugLinkedSheet')
      .addSeparator()
      .addItem('버그 탭 서식 정렬', 'formatBugSheets')
      .addItem('버그/TC 보강 검증', 'validateBugLinks')
      .addToUi();
  } catch (err) {
    // Web app executions do not have a spreadsheet UI.
  }
}

function setupTcSheet() {
  return setupQaTcSheetLocal_(loadConfig_());
}

function formatTcSheet() {
  return formatQaTcSheetLocal_(loadConfig_());
}

function showTcBugMenuGuide() {
  const guide = getTcBugMenuGuideLocal_();
  const message = guide.map(function (item) {
    return item.name + ': ' + item.description;
  }).join('\n\n');
  try {
    SpreadsheetApp.getUi().alert('TC Auto Test 버튼 설명', message, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (err) {}
  return guide;
}

function getTcBugMenuGuideLocal_() {
  return [
    {name: 'TC-버그 전체 반영', description: 'Bug_Report 수동 입력과 TC_Improvement_Backlog를 반영하고, 활성 TC 시트 I열과 QA_Dashboard를 갱신합니다.'},
    {name: '수동 버그 리포트 반영', description: 'Bug_Report 5행 이후 수동 입력에 Bug ID/날짜를 보정하고, TC 미연결 건은 보강 목록에 등록합니다. J열 처리 상태는 변경하지 않습니다.'},
    {name: '버그 연동 시트 추가', description: '입력한 TC 시트를 버그 자동화 대상에 활성 등록합니다.'},
    {name: '버그 연동 시트 목록', description: '현재 버그 자동화에 등록된 TC 시트와 활성 여부를 보여줍니다.'},
    {name: '버그 연동 시트 해제', description: '입력한 TC 시트를 비활성 처리합니다. 기존 연결 데이터는 삭제하지 않습니다.'},
    {name: '버그 탭 서식 정렬', description: 'Bug_Report, TC_Improvement_Backlog, Bug_Linked_Sheets, QA_Dashboard의 안내/드롭다운/서식을 정리합니다.'},
    {name: '버그/TC 보강 검증', description: '없는 TC, 미분류 버그, 보강 완료 오류, 요약 불일치가 있는지 확인합니다.'}
  ];
}

function setupBugSheets() {
  return setupBugSheetsLocal_(loadConfig_());
}

function formatBugSheets() {
  const result = formatBugSheetsLocal_(loadConfig_());
  try {
    SpreadsheetApp.getUi().alert('버그 탭 서식 정렬이 완료되었습니다.');
  } catch (err) {}
  return result;
}

function validateBugLinks() {
  return validateBugLinksLocal_(loadConfig_());
}

function syncBugSummaryToTc() {
  return syncBugSummaryToTcLocal_(loadConfig_());
}

function syncManualBugReports() {
  return syncManualBugReportsLocal_(loadConfig_());
}

function syncAllQaBugRelations() {
  return syncAllQaBugRelationsLocal_(loadConfig_());
}

function addBugLinkedSheet() {
  const config = loadConfig_();
  const ss = SpreadsheetApp.openById(config.sheetId);
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('버그 연동 시트 추가', '연동할 TC 시트명을 입력하세요.', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return {cancelled: true};
  const result = addBugLinkedSheetCoreLocal_(ss, response.getResponseText(), '메뉴에서 등록');
  ui.alert(JSON.stringify(result, null, 2));
  return result;
}

function listBugLinkedSheets() {
  const config = loadConfig_();
  const ss = SpreadsheetApp.openById(config.sheetId);
  const result = listBugLinkedSheetsCoreLocal_(ss);
  try { SpreadsheetApp.getUi().alert(JSON.stringify(result, null, 2)); } catch (err) {}
  return result;
}

function removeBugLinkedSheet() {
  const config = loadConfig_();
  const ss = SpreadsheetApp.openById(config.sheetId);
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('버그 연동 시트 해제', '비활성 처리할 TC 시트명을 입력하세요. 기존 링크는 삭제되지 않습니다.', ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) return {cancelled: true};
  const result = removeBugLinkedSheetCoreLocal_(ss, response.getResponseText(), '메뉴에서 해제');
  ui.alert(JSON.stringify(result, null, 2));
  return result;
}

function previewHubCounts() {
  const config = loadConfig_();
  const ss = SpreadsheetApp.openById(config.sheetId);
  const preview = previewQaHubCountsLocal_(ss);
  try {
    SpreadsheetApp.getUi().alert(JSON.stringify(preview, null, 2));
  } catch (err) {}
  return preview;
}

function syncHubCountsConfirmed() {
  const config = loadConfig_();
  const ss = SpreadsheetApp.openById(config.sheetId);
  const result = syncQaHubCountsLocal_(ss);
  try {
    SpreadsheetApp.getUi().alert(JSON.stringify(result, null, 2));
  } catch (err) {}
  return result;
}

function validateWorkbookConnection() {
  return validateQaTcConnectionLocal_(loadConfig_());
}

function configureScriptProperties(sheetId, webhookSecret) {
  if (!sheetId) throw new Error('sheetId is required.');
  if (!webhookSecret) throw new Error('webhookSecret is required.');

  PropertiesService.getScriptProperties().setProperties({
    TARGET_SPREADSHEET_ID: sheetId,
    WEBHOOK_SECRET: webhookSecret
  }, true);

  return {
    ok: true,
    targetSpreadsheetId: sheetId
  };
}

function configureAndSetupDefaultQaSheet() {
  const properties = PropertiesService.getScriptProperties();
  const webhookSecret = properties.getProperty('WEBHOOK_SECRET');
  if (!webhookSecret) {
    throw new Error('WEBHOOK_SECRET is not configured. Run configureScriptProperties(sheetId, webhookSecret) with a known secret first.');
  }

  configureScriptProperties(DEFAULT_QA_SPREADSHEET_ID, webhookSecret);
  setupQaTcSheetLocal_({
    sheetId: DEFAULT_QA_SPREADSHEET_ID,
    webhookSecret: webhookSecret
  });

  return {
    ok: true,
    targetSpreadsheetId: DEFAULT_QA_SPREADSHEET_ID,
    secretPreserved: true
  };
}

function loadConfig_() {
  const properties = PropertiesService.getScriptProperties();

  return {
    sheetId: requireProperty_(properties, 'TARGET_SPREADSHEET_ID'),
    webhookSecret: properties.getProperty('WEBHOOK_SECRET') || ''
  };
}

function requireProperty_(properties, name) {
  const value = properties.getProperty(name);
  if (!value) throw new Error('Missing Script Property: ' + name);
  return value;
}

function qaTcLocalHealthCheck_(config) {
  const checkedConfig = requireConfigLocal_(config);
  return jsonResponseLocal_({
    ok: true,
    service: 'qa-tc-webapp',
    sheetId: checkedConfig.sheetId,
    schemaScope: 'Active TC_List_* sheets in Bug_Linked_Sheets. TC_List_Auto_Test is hidden and excluded.',
    sharedLibraryModified: false,
    requiredTabs: [LOCAL_QA_TC.hubSheetName, LOCAL_QA_TC.bugReportSheetName, LOCAL_QA_TC.tcImprovementBacklogSheetName, LOCAL_QA_TC.bugLinkedSheetsSheetName, LOCAL_QA_TC.qaDashboardSheetName],
    actions: ['validate', 'getAutomationSchema', 'listTestCases', 'listBugReports', 'listTcImprovementBacklog', 'listBugLinks', 'listBugLinkedSheets', 'cleanupTcTemplateResiduePreview', 'cleanupTcTemplateResidue', 'setupTcSheet', 'setupAll', 'formatTcSheet', 'appendTestCase', 'updateTestResult', 'setupBugSheets', 'formatBugSheets', 'createBugReport', 'linkBugToTc', 'syncBugSummaryToTc', 'syncManualBugReports', 'syncTcImprovementBacklog', 'syncAllQaBugRelations', 'addBugLinkedSheet', 'removeBugLinkedSheet', 'validateBugLinks', 'syncHubCountsPreview', 'syncHubCounts']
  });
}

function validateQaTcConnectionLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);

  return jsonResponseLocal_({
    ok: true,
    service: 'qa-tc-webapp',
    sheetTitle: ss.getName(),
    tabs: ss.getSheets().map(function (sheet) {
      return sheet.getName();
    }),
    tabStates: ss.getSheets().map(function (sheet) {
      return {name: sheet.getName(), hidden: sheet.isSheetHidden()};
    }),
    requiredTabs: [LOCAL_QA_TC.hubSheetName, LOCAL_QA_TC.bugReportSheetName, LOCAL_QA_TC.tcImprovementBacklogSheetName, LOCAL_QA_TC.bugLinkedSheetsSheetName, LOCAL_QA_TC.qaDashboardSheetName],
    schema: LOCAL_QA_TC.headers,
    automationSchema: buildAutomationSchemaLocal_(),
    writePerformed: false
  });
}

function buildAutomationSchemaLocal_() {
  return {
    version: 'v12-bug-report-live-dashboard',
    purpose: 'Expose stable, machine-readable sheet contracts so GPT can read and edit without guessing columns.',
    auth: {
      method: 'POST JSON',
      requiredField: 'secret',
      note: 'Do not place the secret in the sheet. Store it in the GPT/action configuration or caller environment.'
    },
    tabs: {
      testCases: {
        sheetName: LOCAL_QA_TC.sheetName,
        headerRow: LOCAL_QA_TC.headerRow,
        firstDataRow: LOCAL_QA_TC.firstDataRow,
        columns: LOCAL_QA_TC.headers,
        writableViaActions: ['appendTestCase', 'updateTestResult'],
        managedColumns: {
          issueSummary: 'Column I on every active linked TC sheet is rebuilt from Bug_Report after TC_Improvement_Backlog decisions. Do not write it directly.'
        }
      },
      bugReports: {
        sheetName: LOCAL_QA_TC.bugReportSheetName,
        headerRow: LOCAL_QA_TC.bugHeaderRow,
        firstDataRow: LOCAL_QA_TC.bugFirstDataRow,
        columns: LOCAL_QA_TC.bugReportHeaders,
        manualEntryPolicy: 'Rows 1-2 explain per-column input policy, row 3 is the header, row 4 is an example and automation starts at row 5. Column K is the first detected sheet name.',
        writableViaActions: ['createBugReport', 'syncManualBugReports', 'syncAllQaBugRelations'],
        manualColumns: {
          categoryDropdowns: 'Columns C/D 중분류/소분류 dropdown values and validation rules are user-managed. Automation may write row values, but does not set or clear their data validation.',
          status: 'Column J 처리 상태 is user-managed. Automation does not set its data validation or values.',
          buildVersion: 'Column O 빌드 버전 is user-managed. Automation does not set its data validation or values.',
          phoneModel: 'Column P 스마트폰 기종 is user-managed. Automation does not set its values, data validation, or formatting.',
          recheckBuildVersion: 'Column Q 재확인 빌드 버전 is user-managed. Automation does not set its data validation or values.'
        }
      },
      tcImprovementBacklog: {
        sheetName: LOCAL_QA_TC.tcImprovementBacklogSheetName,
        headerRow: LOCAL_QA_TC.bugHeaderRow,
        firstDataRow: LOCAL_QA_TC.backlogFirstDataRow,
        columns: LOCAL_QA_TC.backlogHeaders,
        identity: ['Bug ID'],
        writableViaActions: ['syncManualBugReports', 'syncTcImprovementBacklog', 'syncAllQaBugRelations'],
        note: 'Bug_Report rows without a valid TC target are queued here. Set 처리 상태=보강 완료 with 확정 시트명/확정 TC ID, or 처리 상태=제외.'
      },
      bugLinkedSheets: {
        sheetName: LOCAL_QA_TC.bugLinkedSheetsSheetName,
        headerRow: LOCAL_QA_TC.bugLinkedSheetHeaderRow,
        firstDataRow: LOCAL_QA_TC.bugLinkedSheetFirstDataRow,
        columns: LOCAL_QA_TC.bugLinkedSheetHeaders,
        writableViaActions: ['addBugLinkedSheet', 'removeBugLinkedSheet']
      }
    },
    readActions: {
      getAutomationSchema: {description: 'Return this contract. No sheet write.'},
      validate: {description: 'Return workbook connection, tab list, and schema. No sheet write.'},
      listTestCases: {description: 'Return TC rows. Supports sheetName, limit, offset, tcId, result.'},
      listBugReports: {description: 'Return Bug_Report rows. Supports limit, offset, bugId, status.'},
      listTcImprovementBacklog: {description: 'Return TC_Improvement_Backlog rows. Supports sheetName, tcId, bugId, status.'},
      listBugLinks: {description: 'Deprecated alias for listTcImprovementBacklog.'},
      listBugLinkedSheets: {description: 'Return active/inactive TC sheets registered for bug automation.'},
      cleanupTcTemplateResiduePreview: {description: 'Preview duplicate template residue under TC_List_Auto_Test. No sheet write.'}
    },
    writeActions: {
      setupAll: {description: 'Create/repair TC and bug tabs before automation.'},
      appendTestCase: {description: 'Append a TC row.', required: [], accepts: ['sheetName', 'tcId', 'middleCategory', 'subCategory', 'title', 'precondition', 'purpose', 'priority', 'resultCheck', 'note']},
      updateTestResult: {description: 'Update result/note/priority for an existing TC.', required: ['tcId'], accepts: ['sheetName', 'resultCheck', 'note', 'priority']},
      createBugReport: {description: 'Create a normalized bug report and optionally link it to a TC. Bug_Report columns J/O/P/Q are left untouched for manual entry.', required: [], accepts: ['sheetName', 'bugId', 'title', 'middleCategory', 'subCategory', 'reproCondition', 'reproSteps', 'expected', 'actual', 'severity', 'firstTcId', 'versionResult', 'note']},
      linkBugToTc: {description: 'Compatibility action. It writes confirmed sheet/TC back to Bug_Report and rebuilds TC column I.', required: ['sheetName', 'tcId', 'bugId'], accepts: ['reason', 'note']},
      syncBugSummaryToTc: {description: 'Rebuild active linked TC sheet column I from Bug_Report. TC_List_Auto_Test is excluded.'},
      syncManualBugReports: {description: 'Read Bug_Report row 5+ manual entries, generate missing Bug IDs/dates, and queue invalid TC targets into TC_Improvement_Backlog. Columns J/O/Q are not changed.'},
      syncTcImprovementBacklog: {description: 'Apply TC_Improvement_Backlog decisions to Bug_Report without deleting original bug rows or changing Bug_Report columns J/O/Q.'},
      syncAllQaBugRelations: {description: 'Run manual bug report sync, apply backlog decisions, rebuild TC summaries, refresh QA_Dashboard, and validate.'},
      addBugLinkedSheet: {description: 'Register or reactivate an existing TC sheet for bug automation.', required: ['sheetName'], accepts: ['note']},
      removeBugLinkedSheet: {description: 'Deactivate a TC sheet for future full sync. Existing links are preserved.', required: ['sheetName'], accepts: ['note']},
      cleanupTcTemplateResidue: {description: 'Clear only the duplicated lower template block after preview.', required: ['confirm']}
    },
    customMenu: getTcBugMenuGuideLocal_(),
    enums: {
      result: LOCAL_QA_TC.resultValues,
      priority: LOCAL_QA_TC.priorityValues,
      bugReportManualStatusReadSignals: ['수정 안 함'],
      bugReportStatus: LOCAL_QA_TC.bugStatusValues,
      bugGithubPendingStatus: LOCAL_QA_TC.bugGithubPendingStatusValues,
      bugGithubManagedStatus: LOCAL_QA_TC.bugGithubManagedStatusValues,
      bugVersionResult: LOCAL_QA_TC.bugVersionResultValues,
      bugSeverity: LOCAL_QA_TC.bugSeverityValues,
      backlogStatus: LOCAL_QA_TC.backlogStatusValues,
      acceptedBacklogStatusAliases: Object.keys(LOCAL_QA_TC.backlogStatusAliases)
    },
    safetyRules: [
      'Read the schema first when the tab structure may have changed.',
      'Use read actions before write actions when updating existing rows.',
      'Do not write directly to linked TC sheet column I; it is rebuilt from Bug_Report.',
      'Do not write Bug_Report columns J/O/P/Q. 처리 상태, 빌드 버전, 스마트폰 기종, and 재확인 빌드 버전 are manually managed by the sheet owner.',
      'Do not modify Bug_Report columns C/D dropdown values or validation rules.',
      'Do not modify Bug_Report rows 1-2 or existing Bug_Report conditional formatting.',
      'TC_List_Auto_Test is hidden and excluded from bug automation.',
      'Existing TC result values remain English. TC_Improvement_Backlog statuses are Korean; Bug_Report columns J/O/Q are manual.',
      'Use TC_Improvement_Backlog for bugs found outside the current TC list.',
      'Use setupAll after a fresh deployment or when required tabs are missing.'
    ]
  };
}

function listQaRowsForAutomationLocal_(ss, payload) {
  if (payload.action === 'listTestCases') {
    const sheetName = normalizeSheetNameInputLocal_(payload) || LOCAL_QA_TC.sheetName;
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return missingSheetListResultLocal_(sheetName);
    return listSheetRowsLocal_(sheet, LOCAL_QA_TC.headers, LOCAL_QA_TC.headerRow, LOCAL_QA_TC.firstDataRow, payload, function (row) {
      if (payload.tcId && row['TC ID'] !== textValueLocal_(payload.tcId).trim()) return false;
      if (payload.result && row['결과 확인'] !== textValueLocal_(payload.result).trim()) return false;
      return true;
    });
  }

  if (payload.action === 'listBugReports') {
    const sheet = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
    if (!sheet) return missingSheetListResultLocal_(LOCAL_QA_TC.bugReportSheetName);
    return listSheetRowsLocal_(sheet, LOCAL_QA_TC.bugReportHeaders, LOCAL_QA_TC.bugHeaderRow, LOCAL_QA_TC.bugFirstDataRow, payload, function (row) {
      if (payload.bugId && row['Bug ID'] !== textValueLocal_(payload.bugId).trim()) return false;
      if (payload.status && readBugStatusForAutomationLocal_(row['처리 상태']) !== readBugStatusForAutomationLocal_(payload.status)) return false;
      if (payload.sheetName && row['최초 발견 시트명'] !== textValueLocal_(payload.sheetName).trim()) return false;
      return true;
    });
  }

  if (payload.action === 'listTcImprovementBacklog' || payload.action === 'listBugLinks') {
    const sheet = ss.getSheetByName(LOCAL_QA_TC.tcImprovementBacklogSheetName);
    if (!sheet) return missingSheetListResultLocal_(LOCAL_QA_TC.tcImprovementBacklogSheetName);
    return listSheetRowsLocal_(sheet, LOCAL_QA_TC.backlogHeaders, LOCAL_QA_TC.bugHeaderRow, LOCAL_QA_TC.backlogFirstDataRow, payload, function (row) {
      const requestedSheetName = textValueLocal_(payload.sheetName).trim();
      const requestedTcId = normalizeTcIdValueLocal_(payload.tcId);
      if (requestedSheetName && row['대상 시트명'] !== requestedSheetName && row['확정 시트명'] !== requestedSheetName) return false;
      if (requestedTcId && row['입력 TC ID'] !== requestedTcId && row['확정 TC ID'] !== requestedTcId) return false;
      if (payload.bugId && row['Bug ID'] !== textValueLocal_(payload.bugId).trim()) return false;
      if (payload.status && row['처리 상태'] !== normalizeBacklogStatusLocal_(payload.status)) return false;
      return true;
    });
  }

  if (payload.action === 'listBugLinkedSheets') {
    return listBugLinkedSheetsCoreLocal_(ss);
  }

  return {error: 'unsupported list action', action: payload.action};
}

function listSheetRowsLocal_(sheet, headers, headerRow, firstDataRow, payload, predicate) {
  const limit = normalizeListLimitLocal_(payload.limit, 100, 500);
  const offset = Math.max(0, Number(payload.offset || 0));
  const lastRow = sheet.getLastRow();
  if (lastRow < firstDataRow) {
    return {sheetName: sheet.getName(), total: 0, offset: offset, limit: limit, rows: []};
  }

  const values = sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, headers.length).getDisplayValues();
  const rows = [];
  values.forEach(function (valuesRow, index) {
    if (valuesRow.every(function (value) { return !textValueLocal_(value).trim(); })) return;
    const row = {row: firstDataRow + index};
    headers.forEach(function (header, columnIndex) {
      row[header] = textValueLocal_(valuesRow[columnIndex]).trim();
    });
    if (!predicate || predicate(row)) rows.push(row);
  });

  return {
    sheetName: sheet.getName(),
    total: rows.length,
    offset: offset,
    limit: limit,
    rows: rows.slice(offset, offset + limit)
  };
}

function normalizeListLimitLocal_(value, fallback, max) {
  const parsed = Number(value || fallback);
  if (!isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function missingSheetListResultLocal_(sheetName) {
  return {
    sheetName: sheetName,
    total: 0,
    offset: 0,
    limit: 0,
    rows: [],
    error: 'MISSING_SHEET',
    nextStep: 'Run setupAll first.'
  };
}

function setupQaTcSheetLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const result = ensureQaTcWorkbookLocal_(ss);

  return jsonResponseLocal_({
    ok: true,
    service: 'qa-tc-webapp',
    message: 'QA TC sheet structure setup complete. Layout formatting not applied automatically; run formatTcSheet when manual alignment is needed. Values/notes/dropdowns preserved. Shared library not modified.',
    spreadsheetUrl: ss.getUrl(),
    setup: result
  });
}

function handleQaTcPostLocal_(e, config) {
  const lock = LockService.getScriptLock();
  let locked = false;

  try {
    const checkedConfig = requireWebhookConfigLocal_(config);
    const contents = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const payload = JSON.parse(contents);

    const requestSecret = payload.secret || (e && e.parameter && e.parameter.secret) || '';
    if (!payload || requestSecret !== checkedConfig.webhookSecret) {
      return jsonResponseLocal_({
        ok: false,
        error: 'unauthorized'
      });
    }

    if (payload.action === 'validate') {
      return validateQaTcConnectionLocal_(checkedConfig);
    }

    if (payload.action === 'getAutomationSchema') {
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        sheetId: checkedConfig.sheetId,
        automationSchema: buildAutomationSchemaLocal_(),
        writePerformed: false
      });
    }

    if (['listTestCases', 'listBugReports', 'listTcImprovementBacklog', 'listBugLinks', 'listBugLinkedSheets'].indexOf(payload.action) !== -1) {
      const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        result: listQaRowsForAutomationLocal_(ss, payload),
        writePerformed: false
      });
    }

    if (payload.action === 'cleanupTcTemplateResiduePreview') {
      const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        cleanupPreview: previewQaTcTemplateResidueLocal_(ss),
        writePerformed: false
      });
    }

    lock.waitLock(30000);
    locked = true;

    const ss = SpreadsheetApp.openById(checkedConfig.sheetId);

    if (payload.action === 'setupTcSheet') {
      const setup = ensureQaTcWorkbookLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        setup: setup,
        bugSheetsCreated: false,
        nextStep: 'Run setupBugSheets or setupAll before bug automation.'
      });
    }

    if (payload.action === 'setupAll') {
      const setup = ensureQaTcWorkbookLocal_(ss);
      const bugSetup = setupBugSheetsCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        setup: setup,
        bugSetup: bugSetup
      });
    }

    if (payload.action === 'formatTcSheet') {
      const formatted = formatQaTcSheetLocal_({ sheetId: checkedConfig.sheetId, webhookSecret: checkedConfig.webhookSecret });
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        formatted: JSON.parse(formatted.getContent())
      });
    }

    if (payload.action === 'cleanupTcTemplateResidue') {
      if (payload.confirm !== true) {
        return jsonResponseLocal_({
          ok: false,
          error: 'cleanupTcTemplateResidue requires confirm: true after checking cleanupTcTemplateResiduePreview.',
          cleanupPreview: previewQaTcTemplateResidueLocal_(ss),
          writePerformed: false
        });
      }
      const result = cleanupQaTcTemplateResidueLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        cleanup: result,
        writePerformed: result.writePerformed
      });
    }

    if (payload.action === 'appendTestCase') {
      const result = appendQaTestCaseLocal_(ss, payload.testCase || payload);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        appended: result
      });
    }

    if (payload.action === 'updateTestResult') {
      const result = updateQaTestResultLocal_(ss, payload);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        updated: result
      });
    }


    if (payload.action === 'setupBugSheets') {
      const setup = setupBugSheetsCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        bugSetup: setup
      });
    }

    if (payload.action === 'formatBugSheets') {
      const formatted = formatBugSheetsCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        formatted: formatted
      });
    }

    if (payload.action === 'createBugReport') {
      const result = createBugReportLocal_(ss, payload.bug || payload);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        bug: result
      });
    }

    if (payload.action === 'linkBugToTc') {
      const result = linkBugToTcLocal_(ss, payload.link || payload);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        link: result
      });
    }

    if (payload.action === 'addBugLinkedSheet') {
      const result = addBugLinkedSheetCoreLocal_(ss, payload.sheetName || (payload.sheet && payload.sheet.sheetName), payload.note || (payload.sheet && payload.sheet.note));
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        linkedSheet: result
      });
    }

    if (payload.action === 'removeBugLinkedSheet') {
      const result = removeBugLinkedSheetCoreLocal_(ss, payload.sheetName || (payload.sheet && payload.sheet.sheetName), payload.note || (payload.sheet && payload.sheet.note));
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        linkedSheet: result
      });
    }

    if (payload.action === 'syncManualBugReports') {
      const result = syncManualBugReportsCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        manualBugSync: result
      });
    }

    if (payload.action === 'syncTcImprovementBacklog') {
      const result = syncTcImprovementBacklogCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        tcImprovementBacklog: result
      });
    }

    if (payload.action === 'syncAllQaBugRelations') {
      const result = syncAllQaBugRelationsCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        bugRelations: result
      });
    }

    if (payload.action === 'syncBugSummaryToTc') {
      const result = syncBugSummaryToTcCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        bugSummary: result
      });
    }

    if (payload.action === 'validateBugLinks') {
      const result = validateBugLinksCoreLocal_(ss);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        validation: result
      });
    }

    if (payload.action === 'updateBugStatus') {
      const result = updateBugStatusLocal_(ss, payload);
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        bug: result
      });
    }

    if (payload.action === 'syncHubCountsPreview') {
      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        hubPreview: previewQaHubCountsLocal_(ss),
        writePerformed: false
      });
    }

    if (payload.action === 'syncHubCounts') {
      if (payload.confirm !== true) {
        return jsonResponseLocal_({
          ok: false,
          error: 'syncHubCounts requires confirm: true after checking syncHubCountsPreview.',
          hubPreview: previewQaHubCountsLocal_(ss),
          writePerformed: false
        });
      }

      return jsonResponseLocal_({
        ok: true,
        service: 'qa-tc-webapp',
        spreadsheetUrl: ss.getUrl(),
        hub: syncQaHubCountsLocal_(ss),
        writePerformed: true
      });
    }

    return jsonResponseLocal_({
      ok: false,
      error: 'unknown action'
    });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return jsonErrorResponseLocal_(err);
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

function ensureQaTcWorkbookLocal_(ss) {
  const sheet = ensureQaTcDraftSheetLocal_(ss);

  if (sheet.getMaxColumns() < LOCAL_QA_TC.headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), LOCAL_QA_TC.headers.length - sheet.getMaxColumns());
  }

  if (sheet.getMaxRows() < LOCAL_QA_TC.minRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), LOCAL_QA_TC.minRows - sheet.getMaxRows());
  }

  // v6 policy:
  // - Do not rebuild table data.
  // - Do not clear A3:J values, notes, formats, formulas, links, or data validations.
  // - Preserve B1 Hub-return cell and all manual data-validations, including B/G/H dropdowns.
  // - Only assert the 10-column header values and the A1 image frame.
  // - Use formatTcSheet() when manual layout alignment is needed.
  ensureA1ImageFrameLocal_(sheet);

  const headerRange = sheet.getRange(LOCAL_QA_TC.headerRow, 1, 1, LOCAL_QA_TC.headers.length);
  headerRange.setValues([LOCAL_QA_TC.headers]);

  return {
    sheetName: LOCAL_QA_TC.sheetName,
    headerRow: LOCAL_QA_TC.headerRow,
    columns: LOCAL_QA_TC.headers,
    ownedRange: 'A3:J' + sheet.getMaxRows(),
    sourceWhenCreated: LOCAL_QA_TC.sourceSheetName,
    layoutApplied: false,
    dropdownsTouched: false,
    tableValuesRebuilt: false,
    tableNotesCleared: false,
    tableDataValidationsCleared: false,
    topRowsPreserved: true,
    a1ImageFrame: '117x117',
    extraColumnsPreserved: true
  };
}

function formatQaTcSheetLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const setup = ensureQaTcWorkbookLocal_(ss);
  const sheet = ss.getSheetByName(LOCAL_QA_TC.sheetName);

  applyQaTcReadableLayoutLocal_(sheet);
  applyQaTcResultConditionalFormattingLocal_(sheet);

  return jsonResponseLocal_({
    ok: true,
    service: 'qa-tc-webapp',
    message: 'QA TC layout formatting applied manually. Values/notes/dropdowns preserved.',
    spreadsheetUrl: ss.getUrl(),
    setup: setup,
    formatted: {
      sheetName: LOCAL_QA_TC.sheetName,
      a1ImageFrame: '117x117',
      headerStyled: true,
      frozenRows: LOCAL_QA_TC.headerRow,
      conditionalFormattingScope: 'H4:H',
      bodyValuesRebuilt: false,
      notesCleared: false,
      dropdownsTouched: false
    }
  });
}



function ensureQaTcDraftSheetLocal_(ss) {
  const existing = ss.getSheetByName(LOCAL_QA_TC.sheetName);
  if (existing) return existing;

  const source = ss.getSheetByName(LOCAL_QA_TC.sourceSheetName);
  if (!source) {
    throw new Error('Missing template sheet: ' + LOCAL_QA_TC.sourceSheetName + '. Cannot create ' + LOCAL_QA_TC.sheetName + ' safely.');
  }

  const draft = source.copyTo(ss);
  draft.setName(LOCAL_QA_TC.sheetName);
  draft.activate();
  ss.moveActiveSheet(source.getIndex() + 1);
  return draft;
}

function previewQaTcTemplateResidueLocal_(ss) {
  const sheet = ss.getSheetByName(LOCAL_QA_TC.sheetName);
  if (!sheet) {
    return {
      found: false,
      reason: 'Missing sheet: ' + LOCAL_QA_TC.sheetName
    };
  }
  return findQaTcTemplateResidueLocal_(sheet);
}

function cleanupQaTcTemplateResidueLocal_(ss) {
  const sheet = ss.getSheetByName(LOCAL_QA_TC.sheetName);
  if (!sheet) {
    return {
      found: false,
      writePerformed: false,
      reason: 'Missing sheet: ' + LOCAL_QA_TC.sheetName
    };
  }

  const residue = findQaTcTemplateResidueLocal_(sheet);
  if (!residue.found) {
    residue.writePerformed = false;
    return residue;
  }

  clearQaTcResidueRangeLocal_(sheet, residue);
  residue.writePerformed = true;
  return residue;
}

function clearQaTcResidueRangeLocal_(sheet, residue) {
  const range = sheet.getRange(residue.residueStartRow, 1, residue.clearRowCount, LOCAL_QA_TC.headers.length);
  range.clearContent();
  range.clearDataValidations();
  range.clearFormat();
  range.clearNote();
}

function findQaTcTemplateResidueLocal_(sheet) {
  const maxRows = sheet.getMaxRows();
  const lastRow = Math.max(sheet.getLastRow(), LOCAL_QA_TC.firstDataRow);
  const rowCount = lastRow - LOCAL_QA_TC.headerRow;
  const values = sheet.getRange(LOCAL_QA_TC.firstDataRow, 1, rowCount, LOCAL_QA_TC.headers.length).getDisplayValues();
  let duplicateHeaderRow = 0;

  for (let i = 0; i < values.length; i += 1) {
    const rowIndex = LOCAL_QA_TC.firstDataRow + i;
    const firstCell = textValueLocal_(values[i][0]).trim();
    const secondCell = textValueLocal_(values[i][1]).trim();
    if (rowIndex > LOCAL_QA_TC.headerRow && firstCell === 'TC ID' && secondCell === '중분류') {
      duplicateHeaderRow = rowIndex;
      break;
    }
  }

  if (!duplicateHeaderRow) {
    const validationResidue = findQaTcLowerValidationResidueLocal_(sheet, values, maxRows);
    if (validationResidue.found) return validationResidue;
    return {
      found: false,
      sheetName: sheet.getName(),
      reason: 'No duplicated lower TC header or lower data-validation residue found.'
    };
  }

  let residueStartRow = duplicateHeaderRow;
  const scanStart = Math.max(LOCAL_QA_TC.firstDataRow, duplicateHeaderRow - 3);
  for (let rowIndex = duplicateHeaderRow - 1; rowIndex >= scanStart; rowIndex -= 1) {
    const row = values[rowIndex - LOCAL_QA_TC.firstDataRow] || [];
    const rowText = row.map(function (value) { return textValueLocal_(value).trim(); }).join('\t');
    const isBlank = row.every(function (value) { return !textValueLocal_(value).trim(); });
    if (rowText.indexOf('Hub 복귀') !== -1 || isBlank) {
      residueStartRow = rowIndex;
    }
  }

  return {
    found: true,
    sheetName: sheet.getName(),
    residueStartRow: residueStartRow,
    duplicateHeaderRow: duplicateHeaderRow,
    clearRange: 'A' + residueStartRow + ':J' + maxRows,
    clearRowCount: maxRows - residueStartRow + 1,
    reason: 'Duplicated lower Hub/header/template block.'
  };
}

function findQaTcLowerValidationResidueLocal_(sheet, values, maxRows) {
  let lastContentRow = LOCAL_QA_TC.headerRow;
  values.forEach(function (row, index) {
    const hasContent = row.some(function (value) {
      return textValueLocal_(value).trim();
    });
    if (hasContent) lastContentRow = LOCAL_QA_TC.firstDataRow + index;
  });

  const residueStartRow = lastContentRow + 1;
  if (residueStartRow > maxRows) {
    return {
      found: false,
      sheetName: sheet.getName(),
      reason: 'No lower rows remain.'
    };
  }

  const rowCount = maxRows - residueStartRow + 1;
  const validations = sheet.getRange(residueStartRow, 1, rowCount, LOCAL_QA_TC.headers.length).getDataValidations();
  const hasValidation = validations.some(function (row) {
    return row.some(function (rule) { return !!rule; });
  });

  if (!hasValidation) {
    return {
      found: false,
      sheetName: sheet.getName(),
      reason: 'No lower data-validation residue found.'
    };
  }

  return {
    found: true,
    sheetName: sheet.getName(),
    residueStartRow: residueStartRow,
    clearRange: 'A' + residueStartRow + ':J' + maxRows,
    clearRowCount: rowCount,
    reason: 'Lower blank rows still contain template data validations or formatting.'
  };
}

function readQaRowsForTenColumnLayoutLocal_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.firstDataRow) return [];

  const width = Math.min(sheet.getLastColumn(), 12);
  const headers = sheet.getRange(LOCAL_QA_TC.headerRow, 1, 1, width).getDisplayValues()[0];
  const values = sheet.getRange(LOCAL_QA_TC.firstDataRow, 1, lastRow - LOCAL_QA_TC.headerRow, width).getDisplayValues();
  const rows = [];

  values.forEach(function (row) {
    const tcId = normalizeTcIdValueLocal_(row[0]);
    const title = textValueLocal_(row[3] || row[2]).trim();
    if (!tcId && !title) return;
    if (tcId === 'Hub 복귀' || LOCAL_QA_TC.resultValues.indexOf(tcId) !== -1) return;

    const isCurrentTenColumnLayout = headers[6] === '우선 순위' && headers[7] === '결과 확인';
    const isOldQaLayout = headers[6] === '결과 확인' && headers[7] === '상태';
    const isCompactLayout = headers[1] === '분류';

    if (isCurrentTenColumnLayout) {
      rows.push(padRowLocal_(row.slice(0, LOCAL_QA_TC.headers.length), LOCAL_QA_TC.headers.length));
      return;
    }

    if (isOldQaLayout) {
      const oldResultCheck = textValueLocal_(row[6]).trim();
      const oldStatus = normalizeQaResultForReadLocal_(row[7]) || normalizeQaResultForReadLocal_(oldResultCheck) || 'Not Test';
      const oldActualResult = textValueLocal_(row[8]).trim();
      const issueId = textValueLocal_(row[9]).trim();
      const note = joinNotesLocal_([
        textValueLocal_(row[10]).trim(),
        oldResultCheck && LOCAL_QA_TC.resultValues.indexOf(oldResultCheck) === -1 ? '기존 결과 확인: ' + oldResultCheck : '',
        oldActualResult ? '기존 실제 결과: ' + oldActualResult : ''
      ]);

      rows.push([
        tcId,
        textValueLocal_(row[1]).trim(),
        textValueLocal_(row[2]).trim(),
        textValueLocal_(row[3]).trim(),
        textValueLocal_(row[4]).trim(),
        textValueLocal_(row[5]).trim(),
        '',
        oldStatus,
        issueId,
        note
      ]);
      return;
    }

    if (isCompactLayout) {
      const categories = splitQaCategoryLocal_(row[1]);
      const issueNote = splitQaIssueNoteLocal_(row[8]);
      rows.push([
        tcId,
        categories[0],
        categories[1],
        textValueLocal_(row[2]).trim(),
        textValueLocal_(row[3]).trim(),
        textValueLocal_(row[4]).trim(),
        '',
        normalizeQaResultForReadLocal_(row[6]) || normalizeQaResultForReadLocal_(row[5]) || 'Not Test',
        issueNote[0],
        joinNotesLocal_([textValueLocal_(row[7]).trim(), issueNote[1]])
      ]);
      return;
    }

    // Generic fallback for a manually edited 10-ish column sheet.
    rows.push([
      tcId,
      textValueLocal_(row[1]).trim(),
      textValueLocal_(row[2]).trim(),
      textValueLocal_(row[3]).trim(),
      textValueLocal_(row[4]).trim(),
      textValueLocal_(row[5]).trim(),
      textValueLocal_(row[6]).trim(),
      normalizeQaResultForReadLocal_(row[7]) || textValueLocal_(row[7]).trim() || 'Not Test',
      textValueLocal_(row[8]).trim(),
      textValueLocal_(row[9]).trim()
    ]);
  });

  return rows;
}

function ensureA1ImageFrameLocal_(sheet) {
  // A1 contains the logo/image. Keep the cell frame fixed to 117 x 117 px.
  // B1 and other navigation cells are not modified.
  sheet.setColumnWidth(1, 117);
  sheet.setRowHeight(1, 117);

  // Resize over-grid images anchored at A1 when Apps Script exposes them.
  try {
    const images = sheet.getImages ? sheet.getImages() : [];
    images.forEach(function (image) {
      const anchor = image.getAnchorCell && image.getAnchorCell();
      if (!anchor) return;
      if (anchor.getRow() === 1 && anchor.getColumn() === 1) {
        if (image.setWidth) image.setWidth(117);
        if (image.setHeight) image.setHeight(117);
        if (image.setAnchorCellXOffset) image.setAnchorCellXOffset(0);
        if (image.setAnchorCellYOffset) image.setAnchorCellYOffset(0);
      }
    });
  } catch (err) {
    // Some Apps Script contexts may not expose over-grid image APIs consistently.
    // The A1 cell frame is still fixed even if image resizing is skipped.
  }
}

function applyQaTcReadableLayoutLocal_(sheet) {
  const maxRows = sheet.getMaxRows();

  ensureA1ImageFrameLocal_(sheet);

  const headerRange = sheet.getRange(LOCAL_QA_TC.headerRow, 1, 1, LOCAL_QA_TC.headers.length);
  headerRange
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontColor(LOCAL_QA_TC.headerFontColor)
    .setBackground(LOCAL_QA_TC.headerBackground);

  sheet.setFrozenRows(LOCAL_QA_TC.headerRow);

  // Do not change column B width because B1 is the Hub-return/navigation cell
  // and B-column dropdowns are managed outside this web app.
  // A-column width is intentionally fixed by ensureA1ImageFrameLocal_().
  sheet.setColumnWidth(3, 140); // 소분류
  sheet.setColumnWidth(4, 260); // 테스트 항목
  sheet.setColumnWidth(5, 260); // 사전 조건
  sheet.setColumnWidth(6, 260); // 테스트 목적
  sheet.setColumnWidth(7, 100); // 우선 순위
  sheet.setColumnWidth(8, 120); // 결과 확인
  sheet.setColumnWidth(9, 160); // 관련 버그 리포트 ID
  sheet.setColumnWidth(10, 220); // 비고

  // Formatting only. Values, notes, formulas, links, and validations are not cleared.
  sheet.getRange(LOCAL_QA_TC.headerRow, 1, maxRows - LOCAL_QA_TC.headerRow + 1, LOCAL_QA_TC.headers.length)
    .setWrap(true)
    .setVerticalAlignment('top');

  sheet.getRange(LOCAL_QA_TC.headerRow, 1, 1, LOCAL_QA_TC.headers.length)
    .setVerticalAlignment('middle');

  if (maxRows >= LOCAL_QA_TC.firstDataRow) {
    const bodyRows = maxRows - LOCAL_QA_TC.firstDataRow + 1;
    sheet.getRange(LOCAL_QA_TC.firstDataRow, 1, bodyRows, 3).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.firstDataRow, 4, bodyRows, 3).setHorizontalAlignment('left');
    sheet.getRange(LOCAL_QA_TC.firstDataRow, 7, bodyRows, 3).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.firstDataRow, 10, bodyRows, 1).setHorizontalAlignment('left');
  }
}


function applyQaTcResultConditionalFormattingLocal_(sheet) {
  const maxRows = sheet.getMaxRows();
  const targetRange = sheet.getRange(LOCAL_QA_TC.firstDataRow, LOCAL_QA_TC.resultColumn, maxRows - LOCAL_QA_TC.headerRow, 1);
  const existingRules = sheet.getConditionalFormatRules().filter(function (rule) {
    const condition = rule.getBooleanCondition();
    if (!condition) return true;
    const values = condition.getCriteriaValues();
    const formula = values && values[0] ? String(values[0]) : '';
    return !/^\=\$H4\=\"(?:Pass|Fail|Blocked|Not Test|N\/A)\"$/.test(formula);
  });

  LOCAL_QA_TC.resultValues.forEach(function (result) {
    existingRules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$H4="' + result + '"')
      .setBackground(LOCAL_QA_TC.resultColors[result])
      .setRanges([targetRange])
      .build());
  });

  sheet.setConditionalFormatRules(existingRules);
}

function appendQaTestCaseLocal_(ss, input) {
  ensureQaTcWorkbookLocal_(ss);

  const sheetName = normalizeSheetNameInputLocal_(input) || LOCAL_QA_TC.sheetName;
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('TC sheet not found: ' + sheetName);
  const rowIndex = findNextQaTcRowLocal_(sheet);
  rejectDirectBugSummaryWriteLocal_(input);
  const result = normalizeQaResultLocal_(pickLocal_(input, ['resultCheck', '결과 확인', 'status', '상태'], 'Not Test'));
  const priority = normalizeQaPriorityLocal_(pickLocal_(input, ['priority', '우선 순위'], ''), true);
  const row = [
    textValueLocal_(pickLocal_(input, ['tcId', 'TC ID'], nextQaTcIdLocal_(sheet))),
    textValueLocal_(pickLocal_(input, ['middleCategory', 'category', '중분류'], '')),
    textValueLocal_(pickLocal_(input, ['subCategory', '소분류'], '')),
    textValueLocal_(pickLocal_(input, ['title', 'testItem', '테스트 항목'], '')),
    textValueLocal_(pickLocal_(input, ['precondition', '사전 조건'], '')),
    textValueLocal_(pickLocal_(input, ['purpose', 'testPurpose', '테스트 목적'], '')),
    priority,
    result,
    '',
    textValueLocal_(pickLocal_(input, ['note', '비고'], ''))
  ];

  sheet.getRange(rowIndex, 1, 1, LOCAL_QA_TC.headers.length).setValues([row]);
  applyQaResultRowFormatLocal_(sheet, rowIndex, result);

  return {
    row: rowIndex,
    sheetName: sheetName,
    tcId: row[0],
    result: result
  };
}

function updateQaTestResultLocal_(ss, payload) {
  ensureQaTcWorkbookLocal_(ss);

  const sheetName = normalizeSheetNameInputLocal_(payload) || LOCAL_QA_TC.sheetName;
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('TC sheet not found: ' + sheetName);
  const tcId = textValueLocal_(pickLocal_(payload, ['tcId', 'TC ID'], '')).trim();
  if (!tcId) throw new Error('tcId is required.');

  const rowIndex = findQaTcRowByIdLocal_(sheet, tcId);
  if (!rowIndex) throw new Error('TC ID not found: ' + tcId);

  rejectDirectBugSummaryWriteLocal_(payload);

  const currentResult = sheet.getRange(rowIndex, LOCAL_QA_TC.resultColumn).getValue();
  const currentNote = sheet.getRange(rowIndex, LOCAL_QA_TC.noteColumn).getValue();
  const result = hasAnyKeyLocal_(payload, ['resultCheck', '결과 확인', 'status', '상태'])
    ? normalizeQaResultLocal_(pickLocal_(payload, ['resultCheck', '결과 확인', 'status', '상태'], currentResult))
    : currentResult;
  const note = hasAnyKeyLocal_(payload, ['note', '비고'])
    ? textValueLocal_(pickLocal_(payload, ['note', '비고'], ''))
    : currentNote;

  sheet.getRange(rowIndex, LOCAL_QA_TC.resultColumn).setValue(result);
  sheet.getRange(rowIndex, LOCAL_QA_TC.noteColumn).setValue(note);

  if (hasAnyKeyLocal_(payload, ['priority', '우선 순위'])) {
    sheet.getRange(rowIndex, LOCAL_QA_TC.priorityColumn).setValue(normalizeQaPriorityLocal_(pickLocal_(payload, ['priority', '우선 순위'], ''), true));
  }

  applyQaResultRowFormatLocal_(sheet, rowIndex, result);
  const warnings = buildSingleTcBugWarningsLocal_(ss, sheetName, tcId, result);

  return {
    row: rowIndex,
    sheetName: sheetName,
    tcId: tcId,
    result: result,
    warnings: warnings,
    bugSummaryColumnPolicy: 'Linked TC sheet column I is managed from Bug_Report and TC_Improvement_Backlog. Use syncAllQaBugRelations instead of writing issueId directly.'
  };
}

function previewQaHubCountsLocal_(ss) {
  const hub = ss.getSheetByName(LOCAL_QA_TC.hubSheetName);
  const tcSheet = ss.getSheetByName(LOCAL_QA_TC.sheetName);
  if (!hub || !tcSheet) {
    return {
      updatedRows: 0,
      skipped: true,
      reason: 'Missing hub or TC sheet.'
    };
  }

  const schema = validateHubSchemaLocal_(hub);
  const targets = buildQaHubCountTargetsLocal_(ss, hub, tcSheet);

  return {
    sheetName: LOCAL_QA_TC.hubSheetName,
    targetSheet: LOCAL_QA_TC.sheetName,
    hubSchema: schema,
    writeWouldAffect: 'TC_Hub D:E only. B/C/F are read-only for this action.',
    targetCount: targets.length,
    targets: targets.slice(0, 50),
    truncated: targets.length > 50
  };
}

function syncQaHubCountsLocal_(ss) {
  const hub = ss.getSheetByName(LOCAL_QA_TC.hubSheetName);
  const tcSheet = ss.getSheetByName(LOCAL_QA_TC.sheetName);
  if (!hub || !tcSheet) {
    return {
      updatedRows: 0,
      skipped: true,
      reason: 'Missing hub or TC sheet.'
    };
  }

  const schema = validateHubSchemaLocal_(hub);
  const targets = buildQaHubCountTargetsLocal_(ss, hub, tcSheet);

  targets.forEach(function (target) {
    hub.getRange(target.row, LOCAL_QA_TC.hubColumns.sheetName).setFormula(target.linkFormula);
    hub.getRange(target.row, LOCAL_QA_TC.hubColumns.tcCount).setFormula(target.countFormula);
  });

  return {
    sheetName: LOCAL_QA_TC.hubSheetName,
    hubSchema: schema,
    updatedRows: targets.length,
    writeAffected: 'TC_Hub D:E only'
  };
}

function validateHubSchemaLocal_(hub) {
  const expected = ['대분류', '중분류', '시트명', 'TC 수', '비고'];
  const actual = hub.getRange(LOCAL_QA_TC.hubHeaderRow, LOCAL_QA_TC.hubColumns.majorCategory, 1, expected.length).getDisplayValues()[0]
    .map(function (value) { return textValueLocal_(value).trim(); });

  const mismatches = [];
  expected.forEach(function (label, index) {
    if (actual[index] !== label) {
      mismatches.push({
        column: String.fromCharCode('B'.charCodeAt(0) + index),
        expected: label,
        actual: actual[index]
      });
    }
  });

  if (mismatches.length) {
    throw new Error('TC_Hub schema mismatch at B3:F3: ' + JSON.stringify(mismatches));
  }

  return {
    headerRange: 'B3:F3',
    columns: {
      B: '대분류',
      C: '중분류',
      D: '시트명',
      E: 'TC 수',
      F: '비고'
    },
    valid: true
  };
}

function buildQaHubCountTargetsLocal_(ss, hub, tcSheet) {
  const lastRow = hub.getLastRow();
  if (lastRow < LOCAL_QA_TC.hubFirstDataRow) return [];

  const numRows = lastRow - LOCAL_QA_TC.hubHeaderRow;
  const values = hub.getRange(
    LOCAL_QA_TC.hubFirstDataRow,
    LOCAL_QA_TC.hubColumns.majorCategory,
    numRows,
    5
  ).getDisplayValues();

  const targets = [];
  values.forEach(function (row, index) {
    const hubRow = LOCAL_QA_TC.hubFirstDataRow + index;
    const majorCategory = textValueLocal_(row[0]).trim();
    const middleCategory = textValueLocal_(row[1]).trim();
    const currentSheetName = textValueLocal_(row[2]).trim();
    const currentCount = textValueLocal_(row[3]).trim();
    const note = textValueLocal_(row[4]).trim();

    if (!middleCategory) return;
    if (currentSheetName && currentSheetName !== LOCAL_QA_TC.sheetName) return;

    targets.push({
      row: hubRow,
      majorCategory: majorCategory,
      middleCategory: middleCategory,
      currentSheetName: currentSheetName,
      currentCount: currentCount,
      note: note,
      targetCells: ['D' + hubRow, 'E' + hubRow],
      linkFormula: '=HYPERLINK("' + ss.getUrl() + '#gid=' + tcSheet.getSheetId() + '","' + LOCAL_QA_TC.sheetName + '")',
      countFormula: '=COUNTIFS(' + quoteSheetNameForFormulaLocal_(LOCAL_QA_TC.sheetName) + '!B:B,C' + hubRow + ',' + quoteSheetNameForFormulaLocal_(LOCAL_QA_TC.sheetName) + '!A:A,"<>")'
    });
  });

  return targets;
}



function setupBugSheetsLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const setup = setupBugSheetsCoreLocal_(ss);
  return jsonResponseLocal_({
    ok: true,
    service: 'qa-tc-webapp',
    spreadsheetUrl: ss.getUrl(),
    bugSetup: setup
  });
}

function formatBugSheetsLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const formatted = formatBugSheetsCoreLocal_(ss);
  return jsonResponseLocal_({
    ok: true,
    service: 'qa-tc-webapp',
    spreadsheetUrl: ss.getUrl(),
    formatted: formatted
  });
}

function validateBugLinksLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const validation = validateBugLinksCoreLocal_(ss);
  try { SpreadsheetApp.getUi().alert(JSON.stringify(validation, null, 2)); } catch (err) {}
  return validation;
}

function syncBugSummaryToTcLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const result = syncBugSummaryToTcCoreLocal_(ss);
  try { SpreadsheetApp.getUi().alert(JSON.stringify(result, null, 2)); } catch (err) {}
  return result;
}

function syncManualBugReportsLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const result = syncManualBugReportsCoreLocal_(ss);
  try { SpreadsheetApp.getUi().alert(JSON.stringify(result, null, 2)); } catch (err) {}
  return result;
}

function syncAllQaBugRelationsLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  const ss = SpreadsheetApp.openById(checkedConfig.sheetId);
  const result = syncAllQaBugRelationsCoreLocal_(ss);
  try { SpreadsheetApp.getUi().alert(JSON.stringify(result, null, 2)); } catch (err) {}
  return result;
}

function setupBugSheetsCoreLocal_(ss) {
  const linkedSheets = ensureBugLinkedSheetsLocal_(ss);
  const legacyMigration = archiveLegacyBugTcLinkSheetLocal_(ss);
  const bugReport = ensureSheetWithHeadersLocal_(ss, LOCAL_QA_TC.bugReportSheetName, LOCAL_QA_TC.bugReportHeaders, LOCAL_QA_TC.bugMinRows);
  const backlog = ensureSheetWithHeadersLocal_(ss, LOCAL_QA_TC.tcImprovementBacklogSheetName, LOCAL_QA_TC.backlogHeaders, LOCAL_QA_TC.bugMinRows);
  const dashboard = ensureQaDashboardSheetLocal_(ss);
  const reportMigration = migrateBugReportSchemaLocal_(bugReport);
  const backlogMigration = migrateTcImprovementBacklogSchemaLocal_(backlog);
  const categoryOptions = buildBugCategoryOptionsLocal_(ss);
  applyBugReportInstructionRowsLocal_(bugReport, LOCAL_QA_TC.bugReportHeaders.length, categoryOptions);
  applyBacklogInstructionRowsLocal_(backlog, LOCAL_QA_TC.backlogHeaders.length, categoryOptions);
  applyBugDataValidationsLocal_(bugReport, backlog, categoryOptions);
  hideInternalQaSheetsLocal_(ss);
  return {
    bugReportSheetName: bugReport.getName(),
    tcImprovementBacklogSheetName: backlog.getName(),
    bugLinkedSheetsSheetName: linkedSheets.getName(),
    qaDashboardSheetName: dashboard.getName(),
    bugReportHeaders: LOCAL_QA_TC.bugReportHeaders,
    backlogHeaders: LOCAL_QA_TC.backlogHeaders,
    bugLinkedSheetHeaders: LOCAL_QA_TC.bugLinkedSheetHeaders,
    migrations: {
      bugReport: reportMigration,
      tcImprovementBacklog: backlogMigration,
      legacyBugTcLink: legacyMigration
    },
    dataValidations: {
      bugReportMiddleCategory: 'C5:C is manually managed; automation does not set or clear dropdown values/rules',
      bugReportSubCategory: 'D5:D is manually managed; automation does not set or clear dropdown values/rules',
      bugReportSeverity: 'I5:I uses 1/2/3/4',
      bugReportStatus: 'J5:J is manually managed; automation does not set dropdowns or values',
      bugReportBuildVersion: 'O5:O and Q5:Q are manually managed; automation does not set dropdowns or values',
      bugReportSheetName: 'K5:K uses active sheets in Bug_Linked_Sheets (' + categoryOptions.linkedSheetNames.length + ' options)',
      backlogStatus: 'J4:J uses 대기/보강 완료/제외/종료'
    },
    categorySources: categoryOptions.sources
  };
}

function archiveLegacyBugTcLinkSheetLocal_(ss) {
  const result = {legacySheetName: '', renamed: false, hiddenSheets: []};
  const legacyBaseName = LOCAL_QA_TC.bugTcLinkLegacyPrefix + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd');
  const legacySource = ss.getSheetByName(LOCAL_QA_TC.bugTcLinkSheetName);
  if (legacySource) {
    const legacyName = makeUniqueSheetNameLocal_(ss, legacyBaseName);
    legacySource.setName(legacyName);
    legacySource.hideSheet();
    result.legacySheetName = legacyName;
    result.renamed = true;
    result.hiddenSheets.push(legacyName);
  }

  ss.getSheets().forEach(function (sheet) {
    if (sheet.getName().indexOf(LOCAL_QA_TC.bugTcLinkLegacyPrefix) !== 0) return;
    if (!sheet.isSheetHidden()) sheet.hideSheet();
    if (result.hiddenSheets.indexOf(sheet.getName()) === -1) result.hiddenSheets.push(sheet.getName());
  });
  return result;
}

function makeUniqueSheetNameLocal_(ss, baseName) {
  if (!ss.getSheetByName(baseName)) return baseName;
  let index = 2;
  let candidate = baseName + '_' + index;
  while (ss.getSheetByName(candidate)) {
    index += 1;
    candidate = baseName + '_' + index;
  }
  return candidate;
}

function ensureQaDashboardSheetLocal_(ss) {
  let sheet = ss.getSheetByName(LOCAL_QA_TC.qaDashboardSheetName);
  if (!sheet) sheet = ss.insertSheet(LOCAL_QA_TC.qaDashboardSheetName);
  if (sheet.getMaxRows() < LOCAL_QA_TC.dashboardMinRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), LOCAL_QA_TC.dashboardMinRows - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < 12) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), 12 - sheet.getMaxColumns());
  }
  return sheet;
}

function hideInternalQaSheetsLocal_(ss) {
  const internalNames = {};
  internalNames[LOCAL_QA_TC.bugLinkedSheetsSheetName] = true;
  internalNames[LOCAL_QA_TC.sheetName] = true;
  ss.getSheets().forEach(function (sheet) {
    if (sheet.getName().indexOf(LOCAL_QA_TC.bugTcLinkLegacyPrefix) === 0) internalNames[sheet.getName()] = true;
  });

  ss.getSheets().forEach(function (sheet) {
    if (!internalNames[sheet.getName()]) return;
    try {
      if (!sheet.isSheetHidden() && countVisibleSheetsLocal_(ss) > 1) sheet.hideSheet();
    } catch (err) {}
  });
}

function countVisibleSheetsLocal_(ss) {
  return ss.getSheets().filter(function (sheet) { return !sheet.isSheetHidden(); }).length;
}

function ensureSheetWithHeadersLocal_(ss, sheetName, headers, minRows) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  if (sheet.getMaxRows() < minRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), minRows - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  return sheet;
}

function migrateBugReportSchemaLocal_(sheet) {
  const oldHeaders = [
    'Bug ID',
    '버그 제목',
    '중분류',
    '소분류',
    '재현 조건',
    '재현 절차',
    '기대 결과',
    '실제 결과',
    '심각도',
    '처리 상태',
    '최초 발견 TC ID',
    '등록일',
    '수정일',
    '비고'
  ];
  const existingHeaders = readHeaderRowLocal_(sheet, Math.max(sheet.getLastColumn(), oldHeaders.length, LOCAL_QA_TC.bugReportHeaders.length));
  const sourceHeaders = existingHeaders.some(function (value) { return !!value; }) ? existingHeaders : oldHeaders;
  const lastRow = sheet.getLastRow();
  const currentSchema = LOCAL_QA_TC.bugReportHeaders.every(function (header, index) {
    return isBugReportManualValueColumnLocal_(index + 1) || existingHeaders[index] === header;
  });
  if (currentSchema) {
    return {
      preservedRows: Math.max(0, lastRow - LOCAL_QA_TC.bugFirstDataRow + 1),
      migrationSkipped: true,
      defaultSheetNameApplied: 0
    };
  }
  const readWidth = Math.max(sheet.getLastColumn(), sourceHeaders.length, LOCAL_QA_TC.bugReportHeaders.length);
  const preservedRows = [];
  if (lastRow >= LOCAL_QA_TC.bugExampleRow) {
    const values = sheet.getRange(LOCAL_QA_TC.bugExampleRow, 1, lastRow - LOCAL_QA_TC.bugExampleRow + 1, readWidth).getValues();
    values.forEach(function (row) {
      if (isBlankRowLocal_(row)) return;
      const obj = rowToObjectByHeadersLocal_(row, sourceHeaders);
      if (isBugReportExampleObjectLocal_(obj)) return;
      preservedRows.push([
        pickLocal_(obj, ['Bug ID'], ''),
        pickLocal_(obj, ['버그 제목'], ''),
        pickLocal_(obj, ['중분류'], ''),
        pickLocal_(obj, ['소분류'], ''),
        pickLocal_(obj, ['재현 조건'], ''),
        pickLocal_(obj, ['재현 절차'], ''),
        pickLocal_(obj, ['기대 결과'], ''),
        pickLocal_(obj, ['실제 결과'], ''),
        pickLocal_(obj, ['심각도'], ''),
        pickLocal_(obj, ['처리 상태'], ''),
        textValueLocal_(pickLocal_(obj, ['최초 발견 시트명'], '')).trim() || LOCAL_QA_TC.sheetName,
        normalizeTcIdValueLocal_(pickLocal_(obj, ['최초 발견 TC ID'], '')),
        pickLocal_(obj, ['등록일'], ''),
        pickLocal_(obj, ['수정일'], ''),
        pickLocal_(obj, ['빌드 버전', '발견 빌드 버전', 'Build Version', 'buildVersion'], ''),
        pickLocal_(obj, ['스마트폰 기종', '기기명', '스마트폰 모델', 'phoneModel', 'deviceModel'], ''),
        pickLocal_(obj, ['재확인 빌드 버전', '최신 확인 빌드', 'recheckBuildVersion'], ''),
        pickLocal_(obj, ['버전 확인 결과', '수정 확인 결과', 'versionResult'], ''),
        pickLocal_(obj, ['비고'], '')
      ]);
    });
    const clearRows = lastRow - LOCAL_QA_TC.bugExampleRow + 1;
    clearBugReportContentPreservingManualColumnsLocal_(sheet, LOCAL_QA_TC.bugExampleRow, clearRows, LOCAL_QA_TC.bugReportHeaders.length);
    clearBugReportManagedDataValidationsLocal_(sheet, LOCAL_QA_TC.bugExampleRow, clearRows);
  }
  setBugReportRowsPreservingManualColumnsLocal_(sheet, LOCAL_QA_TC.bugHeaderRow, [LOCAL_QA_TC.bugReportHeaders], LOCAL_QA_TC.bugReportHeaders.length);
  if (preservedRows.length) {
    setBugReportRowsPreservingManualColumnsLocal_(sheet, LOCAL_QA_TC.bugFirstDataRow, preservedRows, LOCAL_QA_TC.bugReportHeaders.length);
  }
  return {
    preservedRows: preservedRows.length,
    defaultSheetNameApplied: preservedRows.filter(function (row) { return textValueLocal_(row[10]).trim() === LOCAL_QA_TC.sheetName; }).length
  };
}

function clearBugReportManagedDataValidationsLocal_(sheet, startRow, rowCount) {
  for (let column = 1; column <= LOCAL_QA_TC.bugReportHeaders.length; column += 1) {
    if (isBugReportManualDataValidationColumnLocal_(column)) continue;
    sheet.getRange(startRow, column, rowCount, 1).clearDataValidations();
  }
}

function clearBugReportContentPreservingManualColumnsLocal_(sheet, startRow, rowCount, width) {
  for (let column = 1; column <= width; column += 1) {
    if (isBugReportManualValueColumnLocal_(column)) continue;
    sheet.getRange(startRow, column, rowCount, 1).clearContent();
  }
}

function setBugReportRowsPreservingManualColumnsLocal_(sheet, startRow, rows, width) {
  if (!rows.length) return;
  for (let column = 1; column <= width; column += 1) {
    if (isBugReportManualValueColumnLocal_(column)) continue;
    const values = rows.map(function (row) { return [row[column - 1] || '']; });
    sheet.getRange(startRow, column, rows.length, 1).setValues(values);
  }
}

function isBugReportManualValueColumnLocal_(column) {
  return column === 10 || column === 15 || column === 16 || column === 17;
}

function isBugReportManualDataValidationColumnLocal_(column) {
  return column === 3 || column === 4 || isBugReportManualValueColumnLocal_(column);
}

function migrateBugLinkSchemaLocal_(sheet) {
  const oldHeaders = [
    'Link ID',
    'TC ID',
    'Bug ID',
    '연결 사유',
    '발견 결과',
    '연결 상태',
    '등록일',
    '비고'
  ];
  const existingHeaders = readHeaderRowLocal_(sheet, Math.max(sheet.getLastColumn(), oldHeaders.length, LOCAL_QA_TC.bugLinkHeaders.length));
  const sourceHeaders = existingHeaders.some(function (value) { return !!value; }) ? existingHeaders : oldHeaders;
  const lastRow = sheet.getLastRow();
  const readWidth = Math.max(sheet.getLastColumn(), sourceHeaders.length, LOCAL_QA_TC.bugLinkHeaders.length);
  const preservedRows = [];
  if (lastRow >= LOCAL_QA_TC.bugLinkFirstDataRow) {
    const values = sheet.getRange(LOCAL_QA_TC.bugLinkFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugHeaderRow, readWidth).getValues();
    values.forEach(function (row) {
      if (isBlankRowLocal_(row)) return;
      const obj = rowToObjectByHeadersLocal_(row, sourceHeaders);
      preservedRows.push([
        pickLocal_(obj, ['Link ID'], ''),
        textValueLocal_(pickLocal_(obj, ['시트명'], '')).trim() || LOCAL_QA_TC.sheetName,
        normalizeTcIdValueLocal_(pickLocal_(obj, ['TC ID'], '')),
        pickLocal_(obj, ['Bug ID'], ''),
        pickLocal_(obj, ['연결 사유'], ''),
        pickLocal_(obj, ['발견 결과'], ''),
        pickLocal_(obj, ['연결 상태'], ''),
        pickLocal_(obj, ['등록일'], ''),
        pickLocal_(obj, ['비고'], '')
      ]);
    });
    sheet.getRange(LOCAL_QA_TC.bugLinkFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugHeaderRow, LOCAL_QA_TC.bugLinkHeaders.length)
      .clearContent()
      .clearDataValidations();
  }
  sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 1, 1, LOCAL_QA_TC.bugLinkHeaders.length).setValues([LOCAL_QA_TC.bugLinkHeaders]);
  if (preservedRows.length) {
    sheet.getRange(LOCAL_QA_TC.bugLinkFirstDataRow, 1, preservedRows.length, LOCAL_QA_TC.bugLinkHeaders.length).setValues(preservedRows);
  }
  return {
    preservedRows: preservedRows.length,
    defaultSheetNameApplied: preservedRows.filter(function (row) { return textValueLocal_(row[1]).trim() === LOCAL_QA_TC.sheetName; }).length
  };
}

function migrateTcImprovementBacklogSchemaLocal_(sheet) {
  const legacyHeaders = [
    'Link ID',
    '시트명',
    'TC ID',
    'Bug ID',
    '연결 사유',
    '발견 결과',
    '연결 상태',
    '등록일',
    '비고'
  ];
  const existingHeaders = readHeaderRowLocal_(sheet, Math.max(sheet.getLastColumn(), legacyHeaders.length, LOCAL_QA_TC.backlogHeaders.length));
  const sourceHeaders = existingHeaders.some(function (value) { return !!value; }) ? existingHeaders : LOCAL_QA_TC.backlogHeaders;
  const lastRow = sheet.getLastRow();
  const readWidth = Math.max(sheet.getLastColumn(), sourceHeaders.length, LOCAL_QA_TC.backlogHeaders.length);
  const preservedRows = [];
  if (lastRow >= LOCAL_QA_TC.backlogFirstDataRow) {
    const values = sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugHeaderRow, readWidth).getValues();
    values.forEach(function (row) {
      if (isBlankRowLocal_(row)) return;
      const obj = rowToObjectByHeadersLocal_(row, sourceHeaders);
      const bugId = textValueLocal_(pickLocal_(obj, ['Bug ID'], '')).trim();
      const targetSheetName = textValueLocal_(pickLocal_(obj, ['대상 시트명', '시트명'], '')).trim();
      const inputTcId = normalizeTcIdValueLocal_(pickLocal_(obj, ['입력 TC ID', 'TC ID'], ''));
      preservedRows.push([
        textValueLocal_(pickLocal_(obj, ['Backlog ID', 'Link ID'], '')).trim(),
        bugId,
        textValueLocal_(pickLocal_(obj, ['버그 제목'], '')).trim(),
        targetSheetName,
        inputTcId,
        textValueLocal_(pickLocal_(obj, ['확정 시트명'], '')).trim(),
        normalizeTcIdValueLocal_(pickLocal_(obj, ['확정 TC ID'], '')),
        textValueLocal_(pickLocal_(obj, ['보강 사유', '연결 사유'], '')).trim(),
        textValueLocal_(pickLocal_(obj, ['추천 TC 제목'], '')).trim(),
        normalizeBacklogStatusLocal_(pickLocal_(obj, ['처리 상태', '연결 상태'], '대기')),
        pickLocal_(obj, ['등록일'], ''),
        pickLocal_(obj, ['수정일'], ''),
        textValueLocal_(pickLocal_(obj, ['비고'], '')).trim()
      ]);
    });
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugHeaderRow, LOCAL_QA_TC.backlogHeaders.length)
      .clearContent()
      .clearDataValidations();
  }
  sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 1, 1, LOCAL_QA_TC.backlogHeaders.length).setValues([LOCAL_QA_TC.backlogHeaders]);
  if (preservedRows.length) {
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 1, preservedRows.length, LOCAL_QA_TC.backlogHeaders.length).setValues(preservedRows);
  }
  return {
    preservedRows: preservedRows.length,
    normalizedStatuses: preservedRows.filter(function (row) { return LOCAL_QA_TC.backlogStatusValues.indexOf(row[9]) !== -1; }).length
  };
}

function readHeaderRowLocal_(sheet, width) {
  return sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 1, 1, width).getDisplayValues()[0]
    .map(function (value) { return textValueLocal_(value).trim(); });
}

function rowToObjectByHeadersLocal_(row, headers) {
  const obj = {};
  headers.forEach(function (header, index) {
    const key = textValueLocal_(header).trim();
    if (!key) return;
    obj[key] = row[index];
  });
  return obj;
}

function isBlankRowLocal_(row) {
  return row.every(function (value) {
    return !textValueLocal_(value).trim();
  });
}

function isBugReportExampleObjectLocal_(obj) {
  const bugId = textValueLocal_(pickLocal_(obj, ['Bug ID'], '')).trim();
  const title = textValueLocal_(pickLocal_(obj, ['버그 제목'], '')).trim();
  return bugId === '예시' || title.indexOf('[예시]') === 0;
}

function applyBugReportInstructionRowsLocal_(sheet, width, categoryOptions) {
  const middleExample = categoryOptions && categoryOptions.middleCategories[0] ? categoryOptions.middleCategories[0] : '업로드';
  const subExample = categoryOptions && categoryOptions.subCategories[0] ? categoryOptions.subCategories[0] : '이미지 업로드';
  const sheetNameExample = categoryOptions && categoryOptions.linkedSheetNames[0] ? categoryOptions.linkedSheetNames[0] : LOCAL_QA_TC.sheetName;
  const tcIdExample = categoryOptions && categoryOptions.exampleTcId ? categoryOptions.exampleTcId : '1';
  const example = [
    '예시',
    '[예시] 이미지 업로드 후 결과가 즉시 갱신되지 않음',
    middleExample,
    subExample,
    '로그인 완료 후 PNG 파일 업로드',
    '1. 이미지 선택\n2. 업로드 클릭\n3. 결과 영역 확인',
    '업로드 성공 메시지와 썸네일이 표시됨',
    '성공 메시지는 없고 로딩 상태가 유지됨',
    '2',
    '열림',
    sheetNameExample,
    tcIdExample,
    '자동',
    '자동',
    '0.1.0',
    'Galaxy S24',
    '1.0.0',
    '재현됨',
    '예시 행은 자동화 대상에서 제외'
  ];
  sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 1, 1, 15).clearNote();
  sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 17, 1, 3).clearNote();
  clearBugReportManagedDataValidationsLocal_(sheet, LOCAL_QA_TC.bugExampleRow, 1);
  setBugReportRowsPreservingManualColumnsLocal_(sheet, LOCAL_QA_TC.bugExampleRow, [example.slice(0, width)], width);
  [sheet.getRange(LOCAL_QA_TC.bugExampleRow, 1, 1, 15), sheet.getRange(LOCAL_QA_TC.bugExampleRow, 17, 1, 3)]
    .forEach(function (range) {
      range
        .setBackground('#fff2cc')
        .setFontColor('#333333')
        .setFontStyle('italic')
        .setWrap(true)
        .setVerticalAlignment('top');
    });
}

function applyBacklogInstructionRowsLocal_(sheet, width, categoryOptions) {
  const firstRow = sheet.getRange(1, 1, 1, width);
  const secondRow = sheet.getRange(2, 1, 1, width);
  firstRow.breakApart();
  secondRow.breakApart();
  firstRow.setValues([[
    '자동 생성',
    '자동 연결',
    '자동 복사',
    '자동 복사',
    '자동 복사',
    '사람 입력',
    '사람 입력',
    '자동 판정',
    '사람 입력',
    '사람 선택',
    '자동 기록',
    '자동 기록',
    '선택 입력'
  ].slice(0, width)])
    .setFontWeight('normal')
    .setFontColor('#0b1f33')
    .setBackground('#d9ead3')
    .setHorizontalAlignment('center')
    .setWrap(true)
    .setVerticalAlignment('middle');
  secondRow.setValues([[
    '백로그 고유번호',
    'Bug_Report의 Bug ID',
    '버그 제목',
    '처음 발견한 TC 탭',
    '처음 입력된 TC ID',
    '반영할 최종 TC 탭',
    '반영할 최종 TC ID',
    '백로그 등록 이유',
    '새 TC 작성 제목',
    '처리 방향 선택',
    '처음 등록일',
    '마지막 변경일',
    '처리 메모'
  ].slice(0, width)])
    .setFontWeight('normal')
    .setFontColor('#660000')
    .setBackground('#f4cccc')
    .setHorizontalAlignment('center')
    .setWrap(true)
    .setVerticalAlignment('middle');
  [1, 2, 3, 4, 5, 8, 11, 12].forEach(function (column) {
    sheet.getRange(1, column, 2, 1)
      .setFontWeight('bold')
      .setFontColor('#073763')
      .setBackground('#cfe2f3')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
  });
  sheet.setRowHeight(1, 34);
  sheet.setRowHeight(2, 44);
  sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 1, 1, width).setValues([LOCAL_QA_TC.backlogHeaders]);
  applyBacklogHeaderNotesLocal_(sheet);
}

function applyBacklogHeaderNotesLocal_(sheet) {
  const notes = [
    '자동 생성되는 보강 목록 ID입니다. 사람이 수정하지 않습니다.',
    'Bug_Report 원본 행의 Bug ID입니다. 이 값으로 원본 버그와 연결됩니다.',
    'Bug_Report의 버그 제목을 복사합니다. 어떤 버그인지 빠르게 식별하는 용도입니다.',
    '버그가 처음 기록된 TC 탭입니다. TC가 없거나 비활성 탭이면 보강 대상으로 남습니다.',
    'Bug_Report에 처음 입력된 TC ID입니다. 비어 있거나 실제 TC에 없으면 보강이 필요합니다.',
    '보강 후 버그를 연결할 최종 TC 탭입니다. 보강 완료 전 사람이 선택합니다.',
    '보강 후 버그를 연결할 최종 TC ID입니다. 보강 완료 전 사람이 입력합니다.',
    '왜 보강 목록에 들어왔는지 자동 기록합니다. 예: TC ID 미입력, TC ID 미존재.',
    '새 TC를 만들어야 할 때 참고할 제목입니다. 필요하면 사람이 수정합니다.',
    '대기: 아직 처리 전, 보강 완료: 확정 TC로 반영, 제외: TC 반영 안 함, 종료: 더 이상 작업 안 함.',
    '보강 목록에 처음 등록된 날짜입니다. 자동 기록입니다.',
    '상태나 확정 정보가 바뀐 마지막 날짜입니다. 자동 기록입니다.',
    '판단 근거, 제외 사유, 추가 확인 내용을 사람이 남기는 칸입니다.'
  ];
  sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 1, 1, Math.min(notes.length, LOCAL_QA_TC.backlogHeaders.length)).setNotes([notes]);
}

function applyBugDataValidationsLocal_(bugReport, backlog, categoryOptions) {
  const reportRows = bugReport.getMaxRows() - LOCAL_QA_TC.bugFirstDataRow + 1;
  const backlogRows = backlog.getMaxRows() - LOCAL_QA_TC.backlogFirstDataRow + 1;
  if (reportRows > 0) {
    const severityRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(LOCAL_QA_TC.bugSeverityValues, true)
      .setAllowInvalid(false)
      .build();
    const versionResultRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(LOCAL_QA_TC.bugVersionResultValues, true)
      .setAllowInvalid(false)
      .build();
    bugReport.getRange(LOCAL_QA_TC.bugFirstDataRow, 9, reportRows, 1).setDataValidation(severityRule);
    bugReport.getRange(LOCAL_QA_TC.bugFirstDataRow, 18, reportRows, 1).setDataValidation(versionResultRule);
    if (categoryOptions.linkedSheetNames.length > 0) {
      const sheetNameRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(categoryOptions.linkedSheetNames, true)
        .setAllowInvalid(false)
        .build();
      bugReport.getRange(LOCAL_QA_TC.bugFirstDataRow, 11, reportRows, 1).setDataValidation(sheetNameRule);
    }
  }
  if (backlogRows > 0) {
    const backlogStatusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(LOCAL_QA_TC.backlogStatusValues, true)
      .setAllowInvalid(false)
      .build();
    backlog.getRange(LOCAL_QA_TC.backlogFirstDataRow, 10, backlogRows, 1).setDataValidation(backlogStatusRule);
    if (categoryOptions.linkedSheetNames.length > 0) {
      const sheetRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(categoryOptions.linkedSheetNames, true)
        .setAllowInvalid(false)
        .build();
      backlog.getRange(LOCAL_QA_TC.backlogFirstDataRow, 4, backlogRows, 1).setDataValidation(sheetRule);
      backlog.getRange(LOCAL_QA_TC.backlogFirstDataRow, 6, backlogRows, 1).setDataValidation(sheetRule);
    }
  }
}

function buildBugCategoryOptionsLocal_(ss) {
  const hub = ss.getSheetByName(LOCAL_QA_TC.hubSheetName);
  const linkedSheetNames = getActiveBugLinkedSheetNamesLocal_(ss);
  if (!hub) {
    return {
      middleCategories: [],
      subCategories: [],
      linkedSheetNames: linkedSheetNames,
      exampleTcId: findFirstTcIdFromLinkedSheetsLocal_(ss, linkedSheetNames),
      sources: {
        middleCategory: 'Missing TC_Hub',
        subCategory: 'Active sheets in ' + LOCAL_QA_TC.bugLinkedSheetsSheetName,
        linkedSheetNames: linkedSheetNames
      }
    };
  }

  validateHubSchemaLocal_(hub);
  const hubRows = getHubCategoryRowsLocal_(hub);
  const subCategories = [];
  linkedSheetNames.forEach(function (sheetName) {
    const linkedSheet = ss.getSheetByName(sheetName);
    if (!linkedSheet) return;
    subCategories.push.apply(subCategories, getSubCategoriesFromLinkedSheetLocal_(linkedSheet));
  });

  return {
    middleCategories: uniqueSortedValuesLocal_(hubRows.map(function (row) { return row.middleCategory; })),
    subCategories: uniqueSortedValuesLocal_(subCategories),
    linkedSheetNames: linkedSheetNames,
    exampleTcId: findFirstTcIdFromLinkedSheetsLocal_(ss, linkedSheetNames),
    sources: {
      middleCategory: LOCAL_QA_TC.hubSheetName + '!C' + LOCAL_QA_TC.hubFirstDataRow + ':C',
      subCategory: '소분류 columns from active sheets in ' + LOCAL_QA_TC.bugLinkedSheetsSheetName,
      linkedSheetNames: linkedSheetNames
    }
  };
}

function ensureBugLinkedSheetsLocal_(ss) {
  let sheet = ss.getSheetByName(LOCAL_QA_TC.bugLinkedSheetsSheetName);
  if (!sheet) sheet = ss.insertSheet(LOCAL_QA_TC.bugLinkedSheetsSheetName);
  if (sheet.getMaxRows() < LOCAL_QA_TC.bugMinRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), LOCAL_QA_TC.bugMinRows - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < LOCAL_QA_TC.bugLinkedSheetHeaders.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), LOCAL_QA_TC.bugLinkedSheetHeaders.length - sheet.getMaxColumns());
  }
  sheet.getRange(LOCAL_QA_TC.bugLinkedSheetHeaderRow, 1, 1, LOCAL_QA_TC.bugLinkedSheetHeaders.length)
    .setValues([LOCAL_QA_TC.bugLinkedSheetHeaders]);

  const existingRows = readBugLinkedSheetRowsLocal_(sheet, true);
  existingRows.forEach(function (row) {
    if (row.sheetName !== LOCAL_QA_TC.sheetName) return;
    sheet.getRange(row.row, 2).setValue('N');
    if (!row.note) sheet.getRange(row.row, 4).setValue('자동화 테스트용 숨김 탭');
  });
  const hasDefault = existingRows.some(function (row) {
    return row.sheetName === LOCAL_QA_TC.sheetName;
  });
  if (!hasDefault) {
    const rowIndex = findNextSimpleRowLocal_(sheet, LOCAL_QA_TC.bugLinkedSheetFirstDataRow, LOCAL_QA_TC.bugLinkedSheetHeaders.length);
    sheet.getRange(rowIndex, 1, 1, LOCAL_QA_TC.bugLinkedSheetHeaders.length)
      .setValues([[LOCAL_QA_TC.sheetName, 'N', new Date(), '자동화 테스트용 숨김 탭']]);
  }
  return sheet;
}

function listBugLinkedSheetsCoreLocal_(ss) {
  const sheet = ss.getSheetByName(LOCAL_QA_TC.bugLinkedSheetsSheetName);
  if (!sheet) {
    return {
      sheetName: LOCAL_QA_TC.bugLinkedSheetsSheetName,
      total: 0,
      activeCount: 0,
      rows: [],
      missing: true,
      defaultSheetName: LOCAL_QA_TC.sheetName,
      nextStep: 'Run setupBugSheets, formatBugSheets, or syncAllQaBugRelations.'
    };
  }
  const rows = readBugLinkedSheetRowsLocal_(sheet, true);
  return {
    sheetName: LOCAL_QA_TC.bugLinkedSheetsSheetName,
    total: rows.length,
    activeCount: rows.filter(function (row) { return row.active; }).length,
    rows: rows
  };
}

function addBugLinkedSheetCoreLocal_(ss, sheetNameInput, note) {
  const sheetName = textValueLocal_(sheetNameInput).trim();
  if (!sheetName) throw new Error('sheetName is required.');
  if (sheetName === LOCAL_QA_TC.sheetName) throw new Error(LOCAL_QA_TC.sheetName + ' is a hidden automation test tab and cannot be activated.');
  const tcSheet = ss.getSheetByName(sheetName);
  if (!tcSheet) throw new Error('TC sheet not found: ' + sheetName);
  validateTcSheetForBugLinkLocal_(tcSheet);

  const linkedSheet = ensureBugLinkedSheetsLocal_(ss);
  const rows = readBugLinkedSheetRowsLocal_(linkedSheet, true);
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].sheetName !== sheetName) continue;
    linkedSheet.getRange(rows[i].row, 2).setValue('Y');
    if (!rows[i].registeredAt) linkedSheet.getRange(rows[i].row, 3).setValue(new Date());
    if (note !== undefined && note !== null) linkedSheet.getRange(rows[i].row, 4).setValue(textValueLocal_(note));
    setupBugSheetsCoreLocal_(ss);
    return {sheetName: sheetName, active: true, reactivated: true, row: rows[i].row};
  }

  const rowIndex = findNextSimpleRowLocal_(linkedSheet, LOCAL_QA_TC.bugLinkedSheetFirstDataRow, LOCAL_QA_TC.bugLinkedSheetHeaders.length);
  linkedSheet.getRange(rowIndex, 1, 1, LOCAL_QA_TC.bugLinkedSheetHeaders.length)
    .setValues([[sheetName, 'Y', new Date(), textValueLocal_(note || '')]]);
  setupBugSheetsCoreLocal_(ss);
  return {sheetName: sheetName, active: true, reactivated: false, row: rowIndex};
}

function removeBugLinkedSheetCoreLocal_(ss, sheetNameInput, note) {
  const sheetName = textValueLocal_(sheetNameInput).trim();
  if (!sheetName) throw new Error('sheetName is required.');
  const linkedSheet = ensureBugLinkedSheetsLocal_(ss);
  const rows = readBugLinkedSheetRowsLocal_(linkedSheet, true);
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].sheetName !== sheetName) continue;
    linkedSheet.getRange(rows[i].row, 2).setValue('N');
    if (note !== undefined && note !== null) linkedSheet.getRange(rows[i].row, 4).setValue(textValueLocal_(note));
    setupBugSheetsCoreLocal_(ss);
    return {sheetName: sheetName, active: false, row: rows[i].row, existingLinksPreserved: true};
  }
  throw new Error('Linked sheet registration not found: ' + sheetName);
}

function getActiveBugLinkedSheetNamesLocal_(ss) {
  const sheet = ensureBugLinkedSheetsLocal_(ss);
  const rows = readBugLinkedSheetRowsLocal_(sheet, false);
  return uniqueSortedValuesLocal_(rows
    .map(function (row) { return row.sheetName; })
    .filter(function (sheetName) { return sheetName !== LOCAL_QA_TC.sheetName; }));
}

function readBugLinkedSheetRowsLocal_(sheet, includeInactive) {
  const lastRow = sheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.bugLinkedSheetFirstDataRow) return [];
  const values = sheet.getRange(
    LOCAL_QA_TC.bugLinkedSheetFirstDataRow,
    1,
    lastRow - LOCAL_QA_TC.bugLinkedSheetHeaderRow,
    LOCAL_QA_TC.bugLinkedSheetHeaders.length
  ).getDisplayValues();
  const rows = [];
  values.forEach(function (row, index) {
    const sheetName = textValueLocal_(row[0]).trim();
    if (!sheetName) return;
    const active = normalizeBugLinkedSheetActiveLocal_(row[1]);
    if (!includeInactive && !active) return;
    rows.push({
      row: LOCAL_QA_TC.bugLinkedSheetFirstDataRow + index,
      sheetName: sheetName,
      active: active,
      activeValue: textValueLocal_(row[1]).trim(),
      registeredAt: textValueLocal_(row[2]).trim(),
      note: textValueLocal_(row[3]).trim()
    });
  });
  return rows;
}

function normalizeBugLinkedSheetActiveLocal_(value) {
  const normalized = textValueLocal_(value).trim().toUpperCase();
  return normalized === 'Y' || normalized === 'YES' || normalized === 'TRUE' || normalized === '1' || normalized === '활성';
}

function validateTcSheetForBugLinkLocal_(sheet) {
  const headers = sheet.getRange(LOCAL_QA_TC.headerRow, 1, 1, Math.min(sheet.getLastColumn(), LOCAL_QA_TC.headers.length)).getDisplayValues()[0]
    .map(function (value) { return textValueLocal_(value).trim(); });
  if (headers[0] !== 'TC ID') {
    throw new Error('TC sheet schema mismatch: ' + sheet.getName() + ' A3 must be TC ID.');
  }
}

function findFirstTcIdFromLinkedSheetsLocal_(ss, sheetNames) {
  for (let i = 0; i < sheetNames.length; i += 1) {
    const sheet = ss.getSheetByName(sheetNames[i]);
    if (!sheet) continue;
    const rows = getTcRowsLocal_(sheet, sheetNames[i]);
    if (rows.length) return rows[0].tcId;
  }
  return '';
}

function getHubCategoryRowsLocal_(hub) {
  const lastRow = hub.getLastRow();
  if (lastRow < LOCAL_QA_TC.hubFirstDataRow) return [];

  const values = hub.getRange(
    LOCAL_QA_TC.hubFirstDataRow,
    LOCAL_QA_TC.hubColumns.middleCategory,
    lastRow - LOCAL_QA_TC.hubHeaderRow,
    2
  ).getDisplayValues();

  const rows = [];
  values.forEach(function (row, index) {
    const middleCategory = textValueLocal_(row[0]).trim();
    const sheetName = textValueLocal_(row[1]).trim();
    if (!middleCategory) return;
    rows.push({
      row: LOCAL_QA_TC.hubFirstDataRow + index,
      middleCategory: middleCategory,
      sheetName: sheetName
    });
  });
  return rows;
}

function getSubCategoriesFromLinkedSheetLocal_(sheet) {
  const headerValues = sheet.getRange(LOCAL_QA_TC.headerRow, 1, 1, Math.min(sheet.getLastColumn(), LOCAL_QA_TC.headers.length)).getDisplayValues()[0];
  let subCategoryColumn = headerValues.indexOf('소분류') + 1;
  if (subCategoryColumn <= 0) subCategoryColumn = 3;

  const lastRow = sheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.firstDataRow) return [];

  return sheet
    .getRange(LOCAL_QA_TC.firstDataRow, subCategoryColumn, lastRow - LOCAL_QA_TC.headerRow, 1)
    .getDisplayValues()
    .map(function (row) { return textValueLocal_(row[0]).trim(); })
    .filter(function (value) { return value && value !== '소분류' && value !== 'Hub 복귀'; });
}

function formatBugSheetsCoreLocal_(ss) {
  const setup = setupBugSheetsCoreLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const backlog = ss.getSheetByName(LOCAL_QA_TC.tcImprovementBacklogSheetName);
  const linkedSheets = ss.getSheetByName(LOCAL_QA_TC.bugLinkedSheetsSheetName);
  const dashboard = ss.getSheetByName(LOCAL_QA_TC.qaDashboardSheetName);
  formatOneBugSheetLocal_(bugReport, LOCAL_QA_TC.bugReportHeaders.length, [95, 220, 110, 130, 180, 230, 190, 210, 80, 105, 150, 120, 95, 95, 100, 140, 125, 125, 190], LOCAL_QA_TC.bugFirstDataRow, [16]);
  formatBugReportSheetLocal_(bugReport);
  formatOneBugSheetLocal_(backlog, LOCAL_QA_TC.backlogHeaders.length, [105, 95, 220, 150, 110, 150, 110, 170, 220, 110, 95, 95, 200], LOCAL_QA_TC.backlogFirstDataRow);
  formatTcImprovementBacklogSheetLocal_(backlog);
  formatBugLinkedSheetsLocal_(linkedSheets);
  applyBugConditionalFormattingLocal_(bugReport, backlog);
  const dashboardResult = refreshQaDashboardLocal_(ss, dashboard);
  hideInternalQaSheetsLocal_(ss);
  return {
    setup: setup,
    dashboard: dashboardResult,
    formattedSheets: [LOCAL_QA_TC.bugReportSheetName, LOCAL_QA_TC.tcImprovementBacklogSheetName, LOCAL_QA_TC.bugLinkedSheetsSheetName, LOCAL_QA_TC.qaDashboardSheetName],
    readabilityPolicy: 'Rows 1-2, Bug_Report conditional formats, and column P are preserved. Header row 3 and non-manual columns are formatted.'
  };
}

function formatBugReportSheetLocal_(sheet) {
  const maxRows = sheet.getMaxRows();
  const bodyWithExampleRows = maxRows - LOCAL_QA_TC.bugExampleRow + 1;
  sheet.getRange(LOCAL_QA_TC.bugExampleRow, 1, bodyWithExampleRows, 15).setFontWeight('normal');
  sheet.getRange(LOCAL_QA_TC.bugExampleRow, 17, bodyWithExampleRows, 3).setFontWeight('normal');

  if (maxRows >= LOCAL_QA_TC.bugFirstDataRow) {
    const rows = maxRows - LOCAL_QA_TC.bugFirstDataRow + 1;
    sheet.getRange(LOCAL_QA_TC.bugFirstDataRow, 1, rows, 1).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.bugFirstDataRow, 2, rows, 7).setHorizontalAlignment('left');
    sheet.getRange(LOCAL_QA_TC.bugFirstDataRow, 9, rows, 7).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.bugFirstDataRow, 17, rows, 2).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.bugFirstDataRow, 19, rows, 1).setHorizontalAlignment('left');
  }
}

function formatTcImprovementBacklogSheetLocal_(sheet) {
  const maxRows = sheet.getMaxRows();
  const lastRow = sheet.getLastRow();
  const width = LOCAL_QA_TC.backlogHeaders.length;
  sheet.setRowHeight(LOCAL_QA_TC.bugHeaderRow, 34);
  sheet.getRange(LOCAL_QA_TC.bugHeaderRow, 1, 1, width)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setFontColor('#ffffff')
    .setBackground('#1f4e78');
  if (maxRows >= LOCAL_QA_TC.backlogFirstDataRow) {
    const rows = maxRows - LOCAL_QA_TC.backlogFirstDataRow + 1;
    sheet.setRowHeights(LOCAL_QA_TC.backlogFirstDataRow, rows, 34);
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 1, rows, width)
      .setFontWeight('normal')
      .setWrap(true)
      .setVerticalAlignment('top');
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 1, rows, 2).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 3, rows, 1).setHorizontalAlignment('left');
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 4, rows, 4).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 8, rows, 2).setHorizontalAlignment('left');
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 10, rows, 3).setHorizontalAlignment('center');
    sheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 13, rows, 1).setHorizontalAlignment('left');
    if (lastRow >= LOCAL_QA_TC.backlogFirstDataRow) {
      try {
        sheet.autoResizeRows(LOCAL_QA_TC.backlogFirstDataRow, lastRow - LOCAL_QA_TC.backlogFirstDataRow + 1);
      } catch (err) {
        // Some spreadsheet contexts skip auto row sizing; the fixed base height above still normalizes rows.
      }
    }
  }
  hideBacklogInternalColumnsLocal_(sheet);
}

function hideBacklogInternalColumnsLocal_(sheet) {
  [
    {column: 1, count: 1},
    {column: 5, count: 1},
    {column: 11, count: 2}
  ].forEach(function (target) {
    try {
      sheet.hideColumns(target.column, target.count);
    } catch (err) {}
  });
}

function formatOneBugSheetLocal_(sheet, width, columnWidths, firstDataRow, preservedColumns) {
  const maxRows = sheet.getMaxRows();
  const preserved = {};
  (preservedColumns || []).forEach(function (column) { preserved[column] = true; });
  sheet.setFrozenRows(LOCAL_QA_TC.bugHeaderRow);
  columnWidths.forEach(function (pixelSize, index) {
    if (preserved[index + 1]) return;
    sheet.setColumnWidth(index + 1, pixelSize);
  });
  for (let column = 1; column <= width; column += 1) {
    if (preserved[column]) continue;
    sheet.getRange(LOCAL_QA_TC.bugHeaderRow, column, 1, 1)
      .setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setFontColor('#ffffff')
      .setBackground('#1f4e78');
    sheet.getRange(LOCAL_QA_TC.bugHeaderRow, column, maxRows - LOCAL_QA_TC.bugHeaderRow + 1, 1)
      .setWrap(true)
      .setVerticalAlignment('top');
    sheet.getRange(LOCAL_QA_TC.bugHeaderRow, column, 1, 1).setVerticalAlignment('middle');
    if (maxRows >= firstDataRow) {
      sheet.getRange(firstDataRow, column, maxRows - firstDataRow + 1, 1).setHorizontalAlignment(column === 1 ? 'center' : 'left');
    }
  }
}

function formatBugLinkedSheetsLocal_(sheet) {
  if (!sheet) return;
  sheet.setFrozenRows(LOCAL_QA_TC.bugLinkedSheetHeaderRow);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 90);
  sheet.setColumnWidth(3, 110);
  sheet.setColumnWidth(4, 240);
  sheet.getRange(LOCAL_QA_TC.bugLinkedSheetHeaderRow, 1, 1, LOCAL_QA_TC.bugLinkedSheetHeaders.length)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setFontColor('#ffffff')
    .setBackground('#1f4e78');
  sheet.getRange(LOCAL_QA_TC.bugLinkedSheetHeaderRow, 1, sheet.getMaxRows(), LOCAL_QA_TC.bugLinkedSheetHeaders.length)
    .setWrap(true)
    .setVerticalAlignment('top');
  const rows = sheet.getMaxRows() - LOCAL_QA_TC.bugLinkedSheetFirstDataRow + 1;
  if (rows > 0) {
    const activeRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Y', 'N'], true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(LOCAL_QA_TC.bugLinkedSheetFirstDataRow, 2, rows, 1).setDataValidation(activeRule);
  }
}

function refreshQaDashboardLocal_(ss, dashboardSheet) {
  const sheet = dashboardSheet || ensureQaDashboardSheetLocal_(ss);
  const dashboard = buildLiveDashboardFormulaContextLocal_();

  sheet.getRange(1, 1, 90, 6).clearContent();
  sheet.getRange(1, 1).setValue('QA_Dashboard');
  sheet.getRange(1, 2).setFormula('="갱신: "&TEXT(NOW(),"yyyy-MM-dd HH:mm:ss")');

  const summaryRows = [
    ['항목', '건수', '대상 Bug ID'],
    ['전체 버그 리포트', dashboard.bugRows, '-'],
    ['Bug ID 미발급', dashboard.bugIdMissing, dashboard.bugIdMissingIds],
    ['깃 이슈 미제출', dashboard.githubNotSubmitted, dashboard.githubNotSubmittedIds],
    ['깃 이슈 작성 중', dashboard.githubWriting, dashboard.githubWritingIds],
    ['깃 이슈 등록/관리 중', dashboard.githubManaged, '-'],
    ['작성 후 2일 초과 + 깃 이슈 미제출/작성 중', dashboard.githubPendingOverdue, dashboard.githubPendingOverdueIds],
    ['작성 후 2일 초과 + 미종료', dashboard.unresolvedOverdue, dashboard.unresolvedOverdueIds],
    ['등록일 누락', dashboard.missingCreatedAt, dashboard.missingCreatedAtIds]
  ];
  writeDashboardTableLocal_(sheet, 3, 1, summaryRows, '버그 리포트 핵심 요약');

  const githubRows = [
    ['깃 이슈 반영 상태', '건수', '대상 Bug ID'],
    ['미제출 - 빈 상태/깃이슈 미제출', dashboard.githubNotSubmitted, dashboard.githubNotSubmittedIds],
    ['작성 중 - 깃이슈 작성 중', dashboard.githubWriting, dashboard.githubWritingIds],
    ['등록/관리 중 - 열림/재검증/종료/수정 안 함/중복', dashboard.githubManaged, '-']
  ];
  writeDashboardTableLocal_(sheet, 3, 4, githubRows, '깃 이슈 반영 현황');

  const bugStatusRows = [['처리 상태', '건수']];
  LOCAL_QA_TC.bugStatusValues.forEach(function (value) {
    bugStatusRows.push([dashboardBugStatusLabelLocal_(value), dashboardBugStatusCountFormulaLocal_(dashboard, [value])]);
  });
  bugStatusRows.push([dashboardBugStatusLabelLocal_(''), dashboardBugStatusCountFormulaLocal_(dashboard, [''])]);
  writeDashboardTableLocal_(sheet, 16, 1, bugStatusRows, 'Bug_Report 처리 상태');

  const agingRows = [
    ['확인 항목', '건수', '대상 Bug ID'],
    ['2일 초과 + 깃 이슈 미제출/작성 중', dashboard.githubPendingOverdue, dashboard.githubPendingOverdueIds],
    ['2일 초과 + 미종료', dashboard.unresolvedOverdue, dashboard.unresolvedOverdueIds],
    ['등록일 누락', dashboard.missingCreatedAt, dashboard.missingCreatedAtIds]
  ];
  writeDashboardTableLocal_(sheet, 16, 4, agingRows, '2일 초과/등록일 확인');

  const severityRows = [['심각도', '건수']];
  LOCAL_QA_TC.bugSeverityValues.forEach(function (value) {
    severityRows.push(['심각도 ' + value, dashboardBugSeverityCountFormulaLocal_(dashboard, value)]);
  });
  writeDashboardTableLocal_(sheet, 30, 1, severityRows, '버그 심각도 현황');

  if (sheet.getCharts().length === 0) {
    addDashboardChartLocal_(sheet, 'bar', sheet.getRange(4, 4, githubRows.length, 2), 3, 8, '깃 이슈 반영 현황 - Bug_Report J열 기준');
    addDashboardChartLocal_(sheet, 'bar', sheet.getRange(17, 1, bugStatusRows.length, 2), 19, 8, 'Bug_Report 처리 상태 - J열 실시간 집계');
    addDashboardChartLocal_(sheet, 'column', sheet.getRange(17, 4, agingRows.length, 2), 35, 8, '2일 초과/등록일 확인 - 대상 Bug ID는 표 참조');
    addDashboardChartLocal_(sheet, 'pie', sheet.getRange(31, 1, severityRows.length, 2), 51, 8, '버그 심각도 분포 - Bug_Report I열 기준');
  }

  return {
    sheetName: sheet.getName(),
    liveFormulaDashboard: true,
    priority: 'Bug_Report first; TC link and TC list metrics excluded from dashboard counts',
    charts: 4,
    tables: 5
  };
}

function writeDashboardTableLocal_(sheet, row, column, values, title) {
  sheet.getRange(row, column).setValue(title);
  const range = sheet.getRange(row + 1, column, values.length, values[0].length);
  range.setValues(values);
  return range;
}

function buildLiveDashboardFormulaContextLocal_() {
  const bugSheet = quoteSheetNameForFormulaLocal_(LOCAL_QA_TC.bugReportSheetName);
  const context = {
    bugIdRange: bugSheet + '!A5:A',
    bugTitleRange: bugSheet + '!B5:B',
    bugSeverityRange: bugSheet + '!I5:I',
    bugStatusRange: bugSheet + '!J5:J',
    bugCreatedAtRange: bugSheet + '!M5:M'
  };

  context.bugRows = '=COUNTIF(' + context.bugTitleRange + ',' + dashboardFormulaStringLocal_('<>') + ')';
  context.bugIdMissing = dashboardCountifsFormulaLocal_([
    [context.bugTitleRange, dashboardFormulaStringLocal_('<>')],
    [context.bugIdRange, dashboardFormulaStringLocal_('')]
  ]);
  context.githubNotSubmitted = dashboardBugStatusCountFormulaLocal_(context, ['', '깃이슈 미제출']);
  context.githubWriting = dashboardBugStatusCountFormulaLocal_(context, ['깃이슈 작성 중']);
  context.githubManaged = dashboardBugStatusCountFormulaLocal_(context, LOCAL_QA_TC.bugGithubManagedStatusValues);
  context.githubPendingOverdue = dashboardBugStatusAgeFormulaLocal_(context, LOCAL_QA_TC.bugGithubPendingStatusValues);
  context.unresolvedOverdue = dashboardBugStatusAgeFormulaLocal_(context, LOCAL_QA_TC.bugUnresolvedStatusValues);
  context.missingCreatedAt = dashboardCountifsFormulaLocal_([
    [context.bugTitleRange, dashboardFormulaStringLocal_('<>')],
    [context.bugCreatedAtRange, dashboardFormulaStringLocal_('')]
  ]);
  context.bugIdMissingIds = dashboardBugIdListFormulaLocal_(context, [
    context.bugTitleRange + '<>""',
    context.bugIdRange + '=""'
  ]);
  context.githubNotSubmittedIds = dashboardBugIdListFormulaLocal_(context, [
    context.bugTitleRange + '<>""',
    dashboardBugStatusRegexConditionLocal_(context, ['', '깃이슈 미제출'])
  ]);
  context.githubWritingIds = dashboardBugIdListFormulaLocal_(context, [
    context.bugTitleRange + '<>""',
    dashboardBugStatusRegexConditionLocal_(context, ['깃이슈 작성 중'])
  ]);
  context.githubPendingOverdueIds = dashboardBugIdListFormulaLocal_(context, [
    context.bugTitleRange + '<>""',
    context.bugCreatedAtRange + '<>""',
    context.bugCreatedAtRange + '<TODAY()-2',
    dashboardBugStatusRegexConditionLocal_(context, LOCAL_QA_TC.bugGithubPendingStatusValues)
  ]);
  context.unresolvedOverdueIds = dashboardBugIdListFormulaLocal_(context, [
    context.bugTitleRange + '<>""',
    context.bugCreatedAtRange + '<>""',
    context.bugCreatedAtRange + '<TODAY()-2',
    dashboardBugStatusRegexConditionLocal_(context, LOCAL_QA_TC.bugUnresolvedStatusValues)
  ]);
  context.missingCreatedAtIds = dashboardBugIdListFormulaLocal_(context, [
    context.bugTitleRange + '<>""',
    context.bugCreatedAtRange + '=""'
  ]);
  return context;
}

function dashboardBugStatusCountFormulaLocal_(context, statuses) {
  return dashboardSumTermsFormulaLocal_(statuses.map(function (status) {
    return dashboardCountifsTermLocal_([
      [context.bugTitleRange, dashboardFormulaStringLocal_('<>')],
      [context.bugStatusRange, dashboardFormulaStringLocal_(status)]
    ]);
  }));
}

function dashboardBugStatusAgeFormulaLocal_(context, statuses) {
  return dashboardSumTermsFormulaLocal_(statuses.map(function (status) {
    return dashboardCountifsTermLocal_([
      [context.bugTitleRange, dashboardFormulaStringLocal_('<>')],
      [context.bugCreatedAtRange, '"<"&TODAY()-2'],
      [context.bugStatusRange, dashboardFormulaStringLocal_(status)]
    ]);
  }));
}

function dashboardBugSeverityCountFormulaLocal_(context, severity) {
  return dashboardCountifsFormulaLocal_([
    [context.bugTitleRange, dashboardFormulaStringLocal_('<>')],
    [context.bugSeverityRange, dashboardFormulaStringLocal_(severity)]
  ]);
}

function dashboardCountifsFormulaLocal_(criteriaPairs) {
  return '=' + dashboardCountifsTermLocal_(criteriaPairs);
}

function dashboardCountifsTermLocal_(criteriaPairs) {
  return 'COUNTIFS(' + criteriaPairs.map(function (pair) {
    return pair[0] + ',' + pair[1];
  }).join(',') + ')';
}

function dashboardSumTermsFormulaLocal_(terms) {
  if (!terms || terms.length === 0) return '=0';
  if (terms.length === 1) return '=' + terms[0];
  return '=SUM(' + terms.join(',') + ')';
}

function dashboardFormulaStringLocal_(value) {
  return '"' + textValueLocal_(value).replace(/"/g, '""') + '"';
}

function dashboardBugIdListFormulaLocal_(context, conditions) {
  const bugIdExpression = 'IF(' + context.bugIdRange + '<>"",' + context.bugIdRange + ',"행 "&ROW(' + context.bugIdRange + ')&" ID 없음")';
  return '=IFERROR(TEXTJOIN(CHAR(10),TRUE,FILTER(' + [bugIdExpression].concat(conditions).join(',') + ')),"-")';
}

function dashboardBugStatusRegexConditionLocal_(context, statuses) {
  const regex = '^(' + statuses.map(function (status) { return dashboardRegexEscapeLocal_(status); }).join('|') + ')$';
  return 'REGEXMATCH(' + context.bugStatusRange + '&"",' + dashboardFormulaStringLocal_(regex) + ')';
}

function dashboardRegexEscapeLocal_(value) {
  return textValueLocal_(value).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

function addDashboardChartLocal_(sheet, type, range, row, column, title) {
  let builder = sheet.newChart();
  if (type === 'pie') builder = builder.asPieChart();
  else if (type === 'bar') builder = builder.asBarChart();
  else builder = builder.asColumnChart();
  builder
    .addRange(range)
    .setPosition(row, column, 0, 0)
    .setOption('title', title)
    .setOption('legend', {position: 'right'})
    .setOption('width', 420)
    .setOption('height', 260);
  sheet.insertChart(builder.build());
}

function percentTextLocal_(value, total) {
  if (!total) return '0%';
  return Math.round((Number(value || 0) / Number(total)) * 1000) / 10 + '%';
}

function dashboardResultLabelLocal_(value) {
  const labels = {
    Pass: 'Pass - 통과',
    Fail: 'Fail - 실패/버그 확인 필요',
    Blocked: 'Blocked - 진행 차단',
    'Not Test': 'Not Test - 미수행',
    'N/A': 'N/A - 해당 없음'
  };
  return labels[value] || value;
}

function dashboardBugStatusLabelLocal_(value) {
  if (!textValueLocal_(value).trim()) return '미입력 - J열 수동 입력 필요';
  const labels = {
    '깃이슈 미제출': '깃이슈 미제출 - 등록 필요',
    '깃이슈 작성 중': '깃이슈 작성 중 - 등록 진행',
    '열림': '열림 - 깃 이슈 등록/조치 필요',
    '재검증': '재검증 - 다시 확인 필요',
    '종료': '종료 - 처리 완료',
    '수정 안 함': '수정 안 함 - TC 반영 제외',
    '중복 리포트': '중복 리포트 - 통합/제외 확인',
    '수정 완료': '수정 완료 - 재검증 필요'
  };
  return labels[value] || value;
}

function dashboardBacklogStatusLabelLocal_(value) {
  const labels = {
    '대기': '대기 - TC 보강 필요',
    '보강 완료': '보강 완료 - 확정 TC 반영',
    '제외': '제외 - TC 반영 안 함',
    '종료': '종료 - 추가 작업 없음'
  };
  return labels[value] || value;
}

function applyBugConditionalFormattingLocal_(bugReport, backlog) {
  const backlogRows = backlog.getMaxRows() - LOCAL_QA_TC.backlogFirstDataRow + 1;
  if (backlogRows > 0) {
    const statusRange = backlog.getRange(LOCAL_QA_TC.backlogFirstDataRow, 10, backlogRows, 1);
    const rules = backlog.getConditionalFormatRules().filter(function (rule) {
      const condition = rule.getBooleanCondition && rule.getBooleanCondition();
      if (!condition) return true;
      const values = condition.getCriteriaValues();
      const formula = values && values[0] ? String(values[0]) : '';
      return !/^=\$J\d+=/.test(formula);
    });
    const colors = {'대기':'#fff2cc', '보강 완료':'#d9ead3', '제외':'#d9d9d9', '종료':'#eeeeee'};
    Object.keys(colors).forEach(function (value) {
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=$J' + LOCAL_QA_TC.backlogFirstDataRow + '="' + value + '"')
        .setBackground(colors[value])
        .setRanges([statusRange])
        .build());
    });
    backlog.setConditionalFormatRules(rules);
  }
}

function addBugReportRequiredBlankRulesLocal_(rules, bugReport, reportRows) {
  const requiredColumns = [
    {index: 2, letter: 'B'},
    {index: 3, letter: 'C'},
    {index: 4, letter: 'D'},
    {index: 5, letter: 'E'},
    {index: 6, letter: 'F'},
    {index: 7, letter: 'G'},
    {index: 8, letter: 'H'},
    {index: 9, letter: 'I'},
    {index: 10, letter: 'J'},
    {index: 11, letter: 'K'},
    {index: 15, letter: 'O'}
  ];
  requiredColumns.forEach(function (column) {
    const range = bugReport.getRange(LOCAL_QA_TC.bugFirstDataRow, column.index, reportRows, 1);
      rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(N("MANUAL_REQUIRED_BLANK")=0,COUNTA($A' + LOCAL_QA_TC.bugFirstDataRow + ':$S' + LOCAL_QA_TC.bugFirstDataRow + ')>0,LEN(TRIM(' + column.letter + LOCAL_QA_TC.bugFirstDataRow + '&""))=0)')
      .setBackground('#fce5cd')
      .setFontColor('#990000')
      .setRanges([range])
      .build());
  });
}

function createBugReportLocal_(ss, input) {
  setupBugSheetsCoreLocal_(ss);
  ensureQaTcWorkbookLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const now = new Date();
  const sheetName = normalizeSheetNameInputLocal_(input) || LOCAL_QA_TC.sheetName;
  const firstTcId = normalizeTcIdValueLocal_(pickLocal_(input, ['firstTcId', '최초 발견 TC ID', 'tcId', 'TC ID'], ''));
  const bugId = textValueLocal_(pickLocal_(input, ['bugId', 'Bug ID'], nextBugIdLocal_(bugReport))).trim();
  if (!bugId) throw new Error('Bug ID is required.');
  if (bugId === '예시') throw new Error('Bug ID "예시" is reserved for the example row.');
  if (findBugRowByIdLocal_(bugReport, bugId)) throw new Error('Bug ID already exists: ' + bugId);
  const severity = normalizeQaPriorityLocal_(textValueLocal_(pickLocal_(input, ['severity', '심각도', 'priority', '우선 순위'], '')).trim() || '3', false);
  const versionResult = normalizeOptionalListValueLocal_(pickLocal_(input, ['versionResult', '버전 확인 결과'], ''), LOCAL_QA_TC.bugVersionResultValues, 'versionResult');
  const rowIndex = findNextSimpleRowLocal_(bugReport, LOCAL_QA_TC.bugFirstDataRow, LOCAL_QA_TC.bugReportHeaders.length);
  const row = [
    bugId,
    textValueLocal_(pickLocal_(input, ['title', 'bugTitle', '버그 제목'], '')),
    textValueLocal_(pickLocal_(input, ['middleCategory', '중분류'], '')),
    textValueLocal_(pickLocal_(input, ['subCategory', '소분류'], '')),
    textValueLocal_(pickLocal_(input, ['reproCondition', '재현 조건'], '')),
    textValueLocal_(pickLocal_(input, ['reproSteps', '재현 절차'], '')),
    textValueLocal_(pickLocal_(input, ['expected', '기대 결과'], '')),
    textValueLocal_(pickLocal_(input, ['actual', '실제 결과'], '')),
    severity,
    '',
    sheetName,
    firstTcId,
    now,
    now,
    '',
    '',
    '',
    versionResult,
    textValueLocal_(pickLocal_(input, ['note', '비고'], ''))
  ];
  setBugReportRowsPreservingManualColumnsLocal_(bugReport, rowIndex, [row], row.length);

  const manual = syncManualBugReportsCoreLocal_(ss);
  const summary = syncBugSummaryToTcCoreLocal_(ss);

  return {row: rowIndex, sheetName: sheetName, bugId: bugId, manualBugSync: manual, bugSummary: summary};
}

function linkBugToTcLocal_(ss, input) {
  setupBugSheetsCoreLocal_(ss);
  ensureQaTcWorkbookLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const sheetName = normalizeSheetNameInputLocal_(input) || LOCAL_QA_TC.sheetName;
  const tcId = normalizeTcIdValueLocal_(pickLocal_(input, ['tcId', 'TC ID'], ''));
  const bugId = textValueLocal_(pickLocal_(input, ['bugId', 'Bug ID'], '')).trim();
  if (!tcId) throw new Error('tcId is required.');
  if (!bugId) throw new Error('bugId is required.');
  const bugRow = findBugRowByIdLocal_(bugReport, bugId);
  if (!bugRow) throw new Error('Bug ID not found: ' + bugId);
  const target = resolveBugTcTargetLocal_(ss, sheetName, tcId);
  if (!target.valid) throw new Error(target.reason + ': ' + sheetName + ' / ' + tcId);
  bugReport.getRange(bugRow, 11).setValue(sheetName);
  bugReport.getRange(bugRow, 12).setValue(tcId);
  bugReport.getRange(bugRow, 14).setValue(new Date());
  const backlog = syncTcImprovementBacklogCoreLocal_(ss);
  const summary = syncBugSummaryToTcCoreLocal_(ss);
  return {row: bugRow, sheetName: sheetName, tcId: tcId, bugId: bugId, backlog: backlog, summary: summary};
}

function ensureBugTcLinkLocal_(ss, sheetName, tcId, bugId, options) {
  return linkBugToTcLocal_(ss, {
    sheetName: sheetName,
    tcId: tcId,
    bugId: bugId,
    note: textValueLocal_(options && options.note)
  });
}

function repairExistingBugLinkRowLocal_(bugLink, rowIndex, sheetName, tcId, bugId, detectedResult, options) {
  const range = bugLink.getRange(rowIndex, 1, 1, LOCAL_QA_TC.bugLinkHeaders.length);
  const row = range.getValues()[0];
  if (!textValueLocal_(row[0]).trim()) row[0] = nextBugLinkIdLocal_(bugLink);
  if (!textValueLocal_(row[1]).trim()) row[1] = sheetName;
  if (!textValueLocal_(row[2]).trim()) row[2] = tcId;
  if (!textValueLocal_(row[3]).trim()) row[3] = bugId;
  if (!textValueLocal_(row[4]).trim() && options && options.reason) row[4] = textValueLocal_(options.reason);
  if (!textValueLocal_(row[5]).trim()) row[5] = detectedResult;
  if (!textValueLocal_(row[6]).trim()) row[6] = normalizeBugLinkStatusLocal_(options && options.linkStatus);
  if (!textValueLocal_(row[7]).trim()) row[7] = new Date();
  if (!textValueLocal_(row[8]).trim() && options && options.note) row[8] = textValueLocal_(options.note);
  range.setValues([row]);
}

function updateBugStatusLocal_(ss, payload) {
  setupBugSheetsCoreLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const bugId = textValueLocal_(pickLocal_(payload, ['bugId', 'Bug ID'], '')).trim();
  if (!bugId) throw new Error('bugId is required.');
  const row = findBugRowByIdLocal_(bugReport, bugId);
  if (!row) throw new Error('Bug ID not found: ' + bugId);
  const currentStatus = textValueLocal_(bugReport.getRange(row, 10).getDisplayValue()).trim();
  return {
    row: row,
    bugId: bugId,
    currentStatus: currentStatus,
    writePerformed: false,
    skipped: true,
    reason: 'Bug_Report column J 처리 상태 is manually managed.'
  };
}

function syncManualBugReportsCoreLocal_(ss) {
  setupBugSheetsCoreLocal_(ss);
  ensureQaTcWorkbookLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const backlogSheet = ss.getSheetByName(LOCAL_QA_TC.tcImprovementBacklogSheetName);
  const lastRow = bugReport.getLastRow();
  const result = {
    scannedRows: 0,
    processedRows: 0,
    generatedBugIds: 0,
    validBugTargets: 0,
    createdBacklogItems: 0,
    updatedBacklogItems: 0,
    pendingBacklogItems: 0,
    skippedRows: [],
    touchedSheets: []
  };
  if (lastRow < LOCAL_QA_TC.bugFirstDataRow) return result;

  const usedBugIds = {};
  getBugRowsLocal_(bugReport).forEach(function (bug) {
    if (bug.bugId) usedBugIds[bug.bugId] = bug.row;
  });
  usedBugIds['예시'] = LOCAL_QA_TC.bugExampleRow;

  const values = bugReport.getRange(LOCAL_QA_TC.bugFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugFirstDataRow + 1, LOCAL_QA_TC.bugReportHeaders.length).getValues();
  const touchedSheetNames = {};
  values.forEach(function (row, index) {
    const rowIndex = LOCAL_QA_TC.bugFirstDataRow + index;
    if (isBlankRowLocal_(row)) return;
    result.scannedRows += 1;
    const obj = rowToObjectByHeadersLocal_(row, LOCAL_QA_TC.bugReportHeaders);
    if (isBugReportExampleObjectLocal_(obj)) return;

    let bugId = textValueLocal_(pickLocal_(obj, ['Bug ID'], '')).trim();
    const title = textValueLocal_(pickLocal_(obj, ['버그 제목'], '')).trim();
    const sheetName = textValueLocal_(pickLocal_(obj, ['최초 발견 시트명'], '')).trim();
    const tcId = normalizeTcIdValueLocal_(pickLocal_(obj, ['최초 발견 TC ID'], ''));
    if (!title) {
      result.skippedRows.push({row: rowIndex, reason: '버그 제목 필요'});
      return;
    }
    try {
      if (bugId && usedBugIds[bugId] && usedBugIds[bugId] !== rowIndex) {
        throw new Error('Duplicate Bug ID: ' + bugId + ' firstRow=' + usedBugIds[bugId]);
      }
      if (!bugId) {
        bugId = nextBugIdFromUsedMapLocal_(usedBugIds);
        bugReport.getRange(rowIndex, 1).setValue(bugId);
        result.generatedBugIds += 1;
      }
      usedBugIds[bugId] = rowIndex;

      const severity = normalizeQaPriorityLocal_(textValueLocal_(pickLocal_(obj, ['심각도'], '')).trim() || '3', false);
      const status = readBugStatusForAutomationLocal_(pickLocal_(obj, ['처리 상태'], ''));
      bugReport.getRange(rowIndex, 9).setValue(severity);
      if (!pickLocal_(obj, ['등록일'], '')) bugReport.getRange(rowIndex, 13).setValue(new Date());
      if (!pickLocal_(obj, ['수정일'], '')) bugReport.getRange(rowIndex, 14).setValue(new Date());

      const target = resolveBugTcTargetLocal_(ss, sheetName, tcId);
      if (target.valid && !isBugStatusExcludedFromTcLocal_(status)) {
        result.validBugTargets += 1;
        touchedSheetNames[sheetName] = true;
      } else {
        const backlog = ensureBacklogForBugLocal_(backlogSheet, {
          bugId: bugId,
          title: title,
          firstSheetName: sheetName,
          firstTcId: tcId,
          note: textValueLocal_(pickLocal_(obj, ['비고'], ''))
        }, target.reason || 'TC 보강 필요');
        if (backlog.created) result.createdBacklogItems += 1;
        else result.updatedBacklogItems += 1;
        if (backlog.status === '대기') result.pendingBacklogItems += 1;
      }
      result.processedRows += 1;
    } catch (err) {
      result.skippedRows.push({row: rowIndex, reason: err && err.message ? err.message : String(err)});
    }
  });

  result.touchedSheets = Object.keys(touchedSheetNames).sort();
  result.skippedCount = result.skippedRows.length;
  result.skippedRows = result.skippedRows.slice(0, 50);
  return result;
}

function syncAllQaBugRelationsCoreLocal_(ss) {
  const manual = syncManualBugReportsCoreLocal_(ss);
  const backlog = syncTcImprovementBacklogCoreLocal_(ss);
  const summary = syncBugSummaryToTcCoreLocal_(ss);
  const dashboard = refreshQaDashboardLocal_(ss);
  const validation = validateBugLinksCoreLocal_(ss);
  return {
    manualBugSync: manual,
    tcImprovementBacklog: backlog,
    bugSummary: summary,
    dashboard: dashboard,
    validation: validation
  };
}

function syncTcImprovementBacklogCoreLocal_(ss) {
  setupBugSheetsCoreLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const backlogSheet = ss.getSheetByName(LOCAL_QA_TC.tcImprovementBacklogSheetName);
  const result = {
    scannedRows: 0,
    completed: 0,
    excluded: 0,
    restoredToOpen: 0,
    keptPending: 0,
    invalidCompletedRows: []
  };
  const rows = getBacklogRowsLocal_(backlogSheet);
  rows.forEach(function (item) {
    result.scannedRows += 1;
    const bugRow = findBugRowByIdLocal_(bugReport, item.bugId);
    if (!bugRow) {
      result.invalidCompletedRows.push({row: item.row, bugId: item.bugId, reason: 'Bug_Report에 Bug ID 없음'});
      return;
    }
    const status = normalizeBacklogStatusLocal_(item.status);
    if (status !== item.status) backlogSheet.getRange(item.row, 10).setValue(status);

    if (status === '제외') {
      backlogSheet.getRange(item.row, 12).setValue(new Date());
      result.excluded += 1;
      return;
    }

    if (status === '대기') {
      result.keptPending += 1;
      return;
    }

    if (status === '보강 완료') {
      const target = resolveBugTcTargetLocal_(ss, item.confirmedSheetName, item.confirmedTcId);
      if (!target.valid) {
        backlogSheet.getRange(item.row, 10).setValue('대기');
        backlogSheet.getRange(item.row, 12).setValue(new Date());
        backlogSheet.getRange(item.row, 13).setValue(appendNoteTagLocal_(item.note, target.reason || '확정 TC 없음'));
        result.invalidCompletedRows.push({row: item.row, bugId: item.bugId, reason: target.reason || '확정 TC 없음'});
        result.keptPending += 1;
        return;
      }
      bugReport.getRange(bugRow, 11).setValue(item.confirmedSheetName);
      bugReport.getRange(bugRow, 12).setValue(item.confirmedTcId);
      bugReport.getRange(bugRow, 14).setValue(new Date());
      backlogSheet.getRange(item.row, 12).setValue(new Date());
      result.completed += 1;
    }
  });
  result.invalidCompletedRows = result.invalidCompletedRows.slice(0, 50);
  hideInternalQaSheetsLocal_(ss);
  return result;
}

function syncBugSummaryToTcCoreLocal_(ss) {
  setupBugSheetsCoreLocal_(ss);
  ensureQaTcWorkbookLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const activeSheetNames = getActiveBugLinkedSheetNamesLocal_(ss);
  const bugIdsByTc = buildBugIdsByTcFromBugReportsLocal_(ss, bugReport, activeSheetNames);
  let updated = 0;
  const updatedBySheet = {};
  activeSheetNames.forEach(function (sheetName) {
    const tcSheet = ss.getSheetByName(sheetName);
    if (!tcSheet) return;
    const tcRows = getTcRowsLocal_(tcSheet, sheetName);
    updatedBySheet[sheetName] = 0;
    tcRows.forEach(function (tc) {
      const summary = (bugIdsByTc[sheetName + '|' + tc.tcId] || []).join(', ');
      tcSheet.getRange(tc.row, LOCAL_QA_TC.issueColumn).setValue(summary);
      updated += 1;
      updatedBySheet[sheetName] += 1;
    });
  });
  hideInternalQaSheetsLocal_(ss);
  return {updatedTcRows: updated, updatedBySheet: updatedBySheet, sourceOfTruth: LOCAL_QA_TC.bugReportSheetName + ' + ' + LOCAL_QA_TC.tcImprovementBacklogSheetName, targetColumn: 'linked TC sheet column I'};
}

function syncBugSummaryForTcLocal_(tcSheet, bugReport, sheetName, tcId) {
  const tcRow = findQaTcRowByIdLocal_(tcSheet, tcId);
  if (!tcRow) return '';
  const bugIds = getActiveBugIdsForTcFromBugReportLocal_(bugReport, sheetName, tcId);
  const summary = bugIds.join(', ');
  tcSheet.getRange(tcRow, LOCAL_QA_TC.issueColumn).setValue(summary);
  return summary;
}

function resolveBugTcTargetLocal_(ss, sheetName, tcId) {
  const normalizedSheetName = textValueLocal_(sheetName).trim();
  const normalizedTcId = normalizeTcIdValueLocal_(tcId);
  if (!normalizedSheetName) return {valid: false, reason: '시트명 미입력'};
  if (normalizedSheetName === LOCAL_QA_TC.sheetName) return {valid: false, reason: '자동화 테스트 시트 제외'};
  const activeNames = getActiveBugLinkedSheetNamesLocal_(ss);
  if (activeNames.indexOf(normalizedSheetName) === -1) return {valid: false, reason: '연동 시트 비활성'};
  const sheet = ss.getSheetByName(normalizedSheetName);
  if (!sheet) return {valid: false, reason: '연동 시트 없음'};
  try {
    validateTcSheetForBugLinkLocal_(sheet);
  } catch (err) {
    return {valid: false, reason: err.message};
  }
  if (!normalizedTcId) return {valid: false, reason: 'TC ID 미입력'};
  const row = findQaTcRowByIdLocal_(sheet, normalizedTcId);
  if (!row) return {valid: false, reason: 'TC ID 미존재'};
  return {valid: true, reason: '', sheet: sheet, row: row, sheetName: normalizedSheetName, tcId: normalizedTcId};
}

function ensureBacklogForBugLocal_(backlogSheet, bug, reason) {
  const now = new Date();
  const existingRow = findBacklogRowByBugIdLocal_(backlogSheet, bug.bugId);
  const existing = existingRow ? getBacklogRowObjectLocal_(backlogSheet, existingRow) : null;
  if (existing && (existing.status === '제외' || existing.status === '종료' || existing.status === '보강 완료')) {
    return {row: existingRow, bugId: bug.bugId, status: existing.status, created: false, preservedStatus: true};
  }

  const rowValues = [
    existing && existing.backlogId ? existing.backlogId : nextBacklogIdLocal_(backlogSheet),
    bug.bugId,
    bug.title || '',
    bug.firstSheetName || '',
    bug.firstTcId || '',
    existing && existing.confirmedSheetName ? existing.confirmedSheetName : '',
    existing && existing.confirmedTcId ? existing.confirmedTcId : '',
    reason || 'TC 보강 필요',
    existing && existing.recommendedTcTitle ? existing.recommendedTcTitle : ('[보강] ' + (bug.title || '')),
    '대기',
    existing && existing.createdAt ? existing.createdAt : now,
    now,
    existing && existing.note ? existing.note : (bug.note || '')
  ];

  if (existingRow) {
    backlogSheet.getRange(existingRow, 1, 1, LOCAL_QA_TC.backlogHeaders.length).setValues([rowValues]);
    return {row: existingRow, bugId: bug.bugId, status: '대기', created: false};
  }
  const rowIndex = findNextSimpleRowLocal_(backlogSheet, LOCAL_QA_TC.backlogFirstDataRow, LOCAL_QA_TC.backlogHeaders.length);
  backlogSheet.getRange(rowIndex, 1, 1, LOCAL_QA_TC.backlogHeaders.length).setValues([rowValues]);
  return {row: rowIndex, bugId: bug.bugId, status: '대기', created: true};
}

function findBacklogRowByBugIdLocal_(backlogSheet, bugId) {
  const lastRow = backlogSheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.backlogFirstDataRow) return 0;
  const values = backlogSheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 2, lastRow - LOCAL_QA_TC.bugHeaderRow, 1).getDisplayValues();
  for (let i = 0; i < values.length; i += 1) {
    if (textValueLocal_(values[i][0]).trim() === bugId) return LOCAL_QA_TC.backlogFirstDataRow + i;
  }
  return 0;
}

function getBacklogRowObjectLocal_(backlogSheet, rowIndex) {
  const row = backlogSheet.getRange(rowIndex, 1, 1, LOCAL_QA_TC.backlogHeaders.length).getDisplayValues()[0];
  return backlogDisplayRowToObjectLocal_(row, rowIndex);
}

function getBacklogRowsLocal_(backlogSheet) {
  const lastRow = backlogSheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.backlogFirstDataRow) return [];
  const values = backlogSheet.getRange(LOCAL_QA_TC.backlogFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugHeaderRow, LOCAL_QA_TC.backlogHeaders.length).getDisplayValues();
  const rows = [];
  values.forEach(function (row, index) {
    if (isBlankRowLocal_(row)) return;
    rows.push(backlogDisplayRowToObjectLocal_(row, LOCAL_QA_TC.backlogFirstDataRow + index));
  });
  return rows;
}

function backlogDisplayRowToObjectLocal_(row, rowIndex) {
  return {
    row: rowIndex,
    backlogId: textValueLocal_(row[0]).trim(),
    bugId: textValueLocal_(row[1]).trim(),
    title: textValueLocal_(row[2]).trim(),
    targetSheetName: textValueLocal_(row[3]).trim(),
    inputTcId: normalizeTcIdValueLocal_(row[4]),
    confirmedSheetName: textValueLocal_(row[5]).trim(),
    confirmedTcId: normalizeTcIdValueLocal_(row[6]),
    reason: textValueLocal_(row[7]).trim(),
    recommendedTcTitle: textValueLocal_(row[8]).trim(),
    status: normalizeBacklogStatusLocal_(row[9]),
    createdAt: textValueLocal_(row[10]).trim(),
    modifiedAt: textValueLocal_(row[11]).trim(),
    note: textValueLocal_(row[12]).trim()
  };
}

function nextBacklogIdLocal_(backlogSheet) {
  const rows = getBacklogRowsLocal_(backlogSheet);
  let maxNumber = 0;
  rows.forEach(function (row) {
    const match = row.backlogId.match(/BACKLOG-(\d+)/);
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });
  return 'BACKLOG-' + String(maxNumber + 1).padStart(3, '0');
}

function buildBugIdsByTcFromBugReportsLocal_(ss, bugReport, activeSheetNames) {
  const activeSet = {};
  activeSheetNames.forEach(function (sheetName) { activeSet[sheetName] = true; });
  const map = {};
  getBugRowsLocal_(bugReport).forEach(function (bug) {
    if (!bug.bugId || isBugStatusExcludedFromTcLocal_(bug.status)) return;
    if (!activeSet[bug.firstSheetName]) return;
    const target = resolveBugTcTargetLocal_(ss, bug.firstSheetName, bug.firstTcId);
    if (!target.valid) return;
    const key = bug.firstSheetName + '|' + bug.firstTcId;
    if (!map[key]) map[key] = [];
    if (map[key].indexOf(bug.bugId) === -1) map[key].push(bug.bugId);
  });
  Object.keys(map).forEach(function (key) { map[key].sort(); });
  return map;
}

function getActiveBugIdsForTcFromBugReportLocal_(bugReport, sheetName, tcId) {
  return getBugRowsLocal_(bugReport)
    .filter(function (bug) {
      return bug.firstSheetName === sheetName && bug.firstTcId === tcId && !isBugStatusExcludedFromTcLocal_(bug.status);
    })
    .map(function (bug) { return bug.bugId; })
    .sort();
}

function appendNoteTagLocal_(note, tag) {
  const text = textValueLocal_(note).trim();
  const next = textValueLocal_(tag).trim();
  if (!next) return text;
  if (text.indexOf(next) !== -1) return text;
  return text ? text + ' / ' + next : next;
}

function validateBugLinksCoreLocal_(ss) {
  setupBugSheetsCoreLocal_(ss);
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const backlogSheet = ss.getSheetByName(LOCAL_QA_TC.tcImprovementBacklogSheetName);
  const linkedSheet = ss.getSheetByName(LOCAL_QA_TC.bugLinkedSheetsSheetName);
  const dashboard = ss.getSheetByName(LOCAL_QA_TC.qaDashboardSheetName);
  const missingSheets = [];
  if (!bugReport) missingSheets.push(LOCAL_QA_TC.bugReportSheetName);
  if (!backlogSheet) missingSheets.push(LOCAL_QA_TC.tcImprovementBacklogSheetName);
  if (!linkedSheet) missingSheets.push(LOCAL_QA_TC.bugLinkedSheetsSheetName);
  if (!dashboard) missingSheets.push(LOCAL_QA_TC.qaDashboardSheetName);
  if (missingSheets.length) {
    return {
      errors: missingSheets.map(function (sheetName) { return {type: 'MISSING_SHEET', sheetName: sheetName}; }),
      warnings: [],
      errorCount: missingSheets.length,
      warningCount: 0,
      readOnly: false
    };
  }
  const linkedRows = readBugLinkedSheetRowsLocal_(linkedSheet, true);
  const activeSheetNames = getActiveBugLinkedSheetNamesLocal_(ss);
  const activeSheetSet = {};
  activeSheetNames.forEach(function (sheetName) { activeSheetSet[sheetName] = true; });
  const tcRows = [];
  const tcByKey = {};
  const errors = [];
  const warnings = [];
  activeSheetNames.forEach(function (sheetName) {
    const tcSheet = ss.getSheetByName(sheetName);
    if (!tcSheet) {
      errors.push({type: 'MISSING_LINKED_TC_SHEET', sheetName: sheetName});
      return;
    }
    try {
      validateTcSheetForBugLinkLocal_(tcSheet);
    } catch (err) {
      errors.push({type: 'INVALID_TC_SHEET_SCHEMA', sheetName: sheetName, reason: err.message});
      return;
    }
    getTcRowsLocal_(tcSheet, sheetName).forEach(function (tc) {
      tcRows.push(tc);
      tcByKey[sheetName + '|' + tc.tcId] = tc;
    });
  });
  if (!activeSheetNames.length) {
    warnings.push({type: 'NO_ACTIVE_LINKED_SHEETS', sheetName: LOCAL_QA_TC.bugLinkedSheetsSheetName});
  }

  const bugs = getBugRowsLocal_(bugReport);
  const backlogRows = getBacklogRowsLocal_(backlogSheet);
  const bugIdsByTc = buildBugIdsByTcFromBugReportsLocal_(ss, bugReport, activeSheetNames);
  const seenBugIds = {};
  const seenBacklogBugIds = {};

  tcRows.forEach(function (tc) {
    if (tc.priority && LOCAL_QA_TC.priorityValues.indexOf(String(tc.priority)) === -1) {
      errors.push({type:'INVALID_PRIORITY', sheetName:tc.sheetName, tcId:tc.tcId, value:tc.priority});
    }
    if (tc.result && LOCAL_QA_TC.resultValues.indexOf(tc.result) === -1) {
      errors.push({type:'INVALID_RESULT', sheetName:tc.sheetName, tcId:tc.tcId, value:tc.result});
    }
  });

  bugs.forEach(function (bug) {
    if (seenBugIds[bug.bugId]) {
      errors.push({type:'DUPLICATE_BUG_ID', firstRow:seenBugIds[bug.bugId], row:bug.row, bugId:bug.bugId});
    }
    seenBugIds[bug.bugId] = bug.row;
    if (bug.severity && LOCAL_QA_TC.bugSeverityValues.indexOf(String(bug.severity)) === -1) {
      errors.push({type:'INVALID_BUG_SEVERITY', bugId:bug.bugId, value:bug.severity});
    }
    if (!bug.buildVersion) {
      warnings.push({type:'BUG_BUILD_VERSION_REQUIRED', row:bug.row, bugId:bug.bugId});
    }
    if (bug.versionResult && LOCAL_QA_TC.bugVersionResultValues.indexOf(bug.versionResult) === -1) {
      warnings.push({type:'UNLISTED_BUG_VERSION_RESULT', row:bug.row, bugId:bug.bugId, value:bug.versionResult});
    }
    if (isBugStatusExcludedFromTcLocal_(bug.status)) return;
    const target = resolveBugTcTargetLocal_(ss, bug.firstSheetName, bug.firstTcId);
    if (!target.valid) {
      warnings.push({type:'BUG_NEEDS_TC_IMPROVEMENT', row:bug.row, sheetName:bug.firstSheetName, tcId:bug.firstTcId, bugId:bug.bugId, reason:target.reason});
    }
  });

  backlogRows.forEach(function (item) {
    if (!item.bugId) {
      warnings.push({type:'BACKLOG_MISSING_BUG_ID', row:item.row});
      return;
    }
    if (seenBacklogBugIds[item.bugId]) errors.push({type:'DUPLICATE_BACKLOG_BUG_ID', firstRow:seenBacklogBugIds[item.bugId], row:item.row, bugId:item.bugId});
    seenBacklogBugIds[item.bugId] = item.row;
    if (LOCAL_QA_TC.backlogStatusValues.indexOf(item.status) === -1) errors.push({type:'INVALID_BACKLOG_STATUS', row:item.row, bugId:item.bugId, value:item.status});
    if (!seenBugIds[item.bugId]) warnings.push({type:'BACKLOG_BUG_NOT_FOUND', row:item.row, bugId:item.bugId});
    if (item.status === '보강 완료') {
      const target = resolveBugTcTargetLocal_(ss, item.confirmedSheetName, item.confirmedTcId);
      if (!target.valid) warnings.push({type:'CONFIRMED_TC_NOT_FOUND', row:item.row, bugId:item.bugId, sheetName:item.confirmedSheetName, tcId:item.confirmedTcId, reason:target.reason});
    }
  });

  tcRows.forEach(function (tc) {
    const linked = bugIdsByTc[tc.sheetName + '|' + tc.tcId] || [];
    if ((tc.result === 'Fail' || tc.result === 'Blocked') && linked.length === 0) {
      warnings.push({type:'RESULT_NEEDS_BUG_LINK', sheetName:tc.sheetName, tcId:tc.tcId, result:tc.result});
    }
    if (tc.result === 'Pass' && linked.length > 0) {
      warnings.push({type:'PASS_HAS_BUG_LINK', sheetName:tc.sheetName, tcId:tc.tcId, bugIds:linked});
    }
    const expectedSummary = linked.join(', ');
    if (tc.issueSummary !== expectedSummary) {
      warnings.push({type:'BUG_SUMMARY_OUT_OF_SYNC', sheetName:tc.sheetName, tcId:tc.tcId, current:tc.issueSummary, expected:expectedSummary});
    }
  });

  return {
    errors: errors,
    warnings: warnings,
    errorCount: errors.length,
    warningCount: warnings.length,
    activeLinkedSheets: activeSheetNames,
    excludedSheetNames: linkedRows.filter(function (row) { return !row.active; }).map(function (row) { return row.sheetName; }),
    readOnly: false
  };
}

function buildSingleTcBugWarningsLocal_(ss, sheetName, tcId, result) {
  const bugReport = ss.getSheetByName(LOCAL_QA_TC.bugReportSheetName);
  const targetSheetName = sheetName || LOCAL_QA_TC.sheetName;
  const warnings = [];
  const linked = bugReport ? getActiveBugIdsForTcFromBugReportLocal_(bugReport, targetSheetName, tcId) : [];

  if ((result === 'Fail' || result === 'Blocked') && linked.length === 0) {
    warnings.push({type: 'RESULT_NEEDS_BUG_LINK', sheetName: targetSheetName, tcId: tcId, result: result});
  }
  if (result === 'Pass' && linked.length > 0) {
    warnings.push({type: 'PASS_HAS_BUG_LINK', sheetName: targetSheetName, tcId: tcId, bugIds: linked});
  }
  const tcSheet = ss.getSheetByName(targetSheetName);
  if (tcSheet) {
    const tcRow = findQaTcRowByIdLocal_(tcSheet, tcId);
    if (tcRow) {
      const currentSummary = textValueLocal_(tcSheet.getRange(tcRow, LOCAL_QA_TC.issueColumn).getDisplayValue()).trim();
      const expectedSummary = linked.join(', ');
      if (currentSummary !== expectedSummary) {
        warnings.push({type: 'BUG_SUMMARY_OUT_OF_SYNC', sheetName: targetSheetName, tcId: tcId, current: currentSummary, expected: expectedSummary});
      }
    }
  }

  return warnings;
}

function getTcRowsLocal_(tcSheet, sheetName) {
  const lastRow = tcSheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.firstDataRow) return [];
  const values = tcSheet.getRange(LOCAL_QA_TC.firstDataRow, 1, lastRow - LOCAL_QA_TC.headerRow, LOCAL_QA_TC.headers.length).getDisplayValues();
  const rows = [];
  values.forEach(function (row, index) {
    const tcId = textValueLocal_(row[0]).trim();
    if (!tcId) return;
    rows.push({
      row: LOCAL_QA_TC.firstDataRow + index,
      sheetName: sheetName || tcSheet.getName(),
      tcId: tcId,
      middleCategory: textValueLocal_(row[1]).trim(),
      subCategory: textValueLocal_(row[2]).trim(),
      priority: textValueLocal_(row[6]).trim(),
      result: textValueLocal_(row[7]).trim(),
      issueSummary: textValueLocal_(row[8]).trim(),
      note: textValueLocal_(row[9]).trim()
    });
  });
  return rows;
}

function getBugRowsLocal_(bugReport) {
  const lastRow = bugReport.getLastRow();
  if (lastRow < LOCAL_QA_TC.bugFirstDataRow) return [];
  const values = bugReport.getRange(LOCAL_QA_TC.bugFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugFirstDataRow + 1, LOCAL_QA_TC.bugReportHeaders.length).getDisplayValues();
  const rows = [];
  values.forEach(function (row, index) {
    const bugId = textValueLocal_(row[0]).trim();
    if (!bugId) return;
    if (bugId === '예시' || textValueLocal_(row[1]).trim().indexOf('[예시]') === 0) return;
    rows.push({
      row: LOCAL_QA_TC.bugFirstDataRow + index,
      bugId: bugId,
      title: textValueLocal_(row[1]).trim(),
      middleCategory: textValueLocal_(row[2]).trim(),
      subCategory: textValueLocal_(row[3]).trim(),
      severity: textValueLocal_(row[8]).trim(),
      status: readBugStatusForAutomationLocal_(row[9]),
      firstSheetName: textValueLocal_(row[10]).trim(),
      firstTcId: normalizeTcIdValueLocal_(row[11]),
      buildVersion: textValueLocal_(row[14]).trim(),
      phoneModel: textValueLocal_(row[15]).trim(),
      recheckBuildVersion: textValueLocal_(row[16]).trim(),
      versionResult: textValueLocal_(row[17]).trim()
    });
  });
  return rows;
}

function getBugLinkRowsLocal_(bugLink) {
  const lastRow = bugLink.getLastRow();
  if (lastRow < LOCAL_QA_TC.bugLinkFirstDataRow) return [];
  const values = bugLink.getRange(LOCAL_QA_TC.bugLinkFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugHeaderRow, LOCAL_QA_TC.bugLinkHeaders.length).getDisplayValues();
  const rows = [];
  values.forEach(function (row, index) {
    const linkId = textValueLocal_(row[0]).trim();
    const sheetName = textValueLocal_(row[1]).trim() || LOCAL_QA_TC.sheetName;
    const tcId = normalizeTcIdValueLocal_(row[2]);
    const bugId = textValueLocal_(row[3]).trim();
    if (!linkId && !tcId && !bugId) return;
    rows.push({
      row: LOCAL_QA_TC.bugLinkFirstDataRow + index,
      linkId: linkId,
      sheetName: sheetName,
      tcId: tcId,
      bugId: bugId,
      reason: textValueLocal_(row[4]).trim(),
      detectedResult: textValueLocal_(row[5]).trim(),
      linkStatus: textValueLocal_(row[6]).trim() || 'Active'
    });
  });
  return rows;
}

function objectByKeyLocal_(rows, key) {
  const obj = {};
  rows.forEach(function (row) {
    if (row[key]) obj[row[key]] = row;
  });
  return obj;
}

function uniqueSortedValuesLocal_(values) {
  const seen = {};
  const result = [];
  values.forEach(function (value) {
    const normalized = textValueLocal_(value).trim();
    if (!normalized || seen[normalized]) return;
    seen[normalized] = true;
    result.push(normalized);
  });
  return result.sort();
}

function getActiveBugIdsForTcLocal_(bugLink, sheetName, tcId) {
  return getBugLinkRowsLocal_(bugLink)
    .filter(function (link) { return link.sheetName === sheetName && link.tcId === tcId && link.linkStatus !== 'Ignored'; })
    .map(function (link) { return link.bugId; });
}

function findBugRowByIdLocal_(bugReport, bugId) {
  const lastRow = bugReport.getLastRow();
  if (lastRow < LOCAL_QA_TC.bugFirstDataRow) return 0;
  const values = bugReport.getRange(LOCAL_QA_TC.bugFirstDataRow, 1, lastRow - LOCAL_QA_TC.bugFirstDataRow + 1, 2).getDisplayValues();
  for (let i = 0; i < values.length; i += 1) {
    if (textValueLocal_(values[i][0]).trim() === '예시') continue;
    if (textValueLocal_(values[i][1]).trim().indexOf('[예시]') === 0) continue;
    if (textValueLocal_(values[i][0]).trim() === bugId) return LOCAL_QA_TC.bugFirstDataRow + i;
  }
  return 0;
}

function findBugLinkRowLocal_(bugLink, sheetName, tcId, bugId) {
  const links = getBugLinkRowsLocal_(bugLink);
  for (let i = 0; i < links.length; i += 1) {
    if (links[i].sheetName === sheetName && links[i].tcId === tcId && links[i].bugId === bugId && links[i].linkStatus !== 'Ignored') return links[i].row;
  }
  return 0;
}

function findNextSimpleRowLocal_(sheet, firstDataRow, width) {
  const lastRow = Math.max(sheet.getLastRow(), firstDataRow);
  const values = sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, width).getDisplayValues();
  for (let i = 0; i < values.length; i += 1) {
    if (values[i].every(function (value) { return !textValueLocal_(value).trim(); })) return firstDataRow + i;
  }
  return lastRow + 1;
}

function nextBugIdLocal_(bugReport) {
  const rows = getBugRowsLocal_(bugReport);
  let maxNumber = 0;
  rows.forEach(function (row) {
    const match = row.bugId.match(/BUG-(\d+)/);
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });
  return 'BUG-' + String(maxNumber + 1).padStart(3, '0');
}

function nextBugIdFromUsedMapLocal_(usedBugIds) {
  let maxNumber = 0;
  Object.keys(usedBugIds).forEach(function (bugId) {
    const match = bugId.match(/BUG-(\d+)/);
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });
  let candidate = '';
  do {
    maxNumber += 1;
    candidate = 'BUG-' + String(maxNumber).padStart(3, '0');
  } while (usedBugIds[candidate]);
  usedBugIds[candidate] = true;
  return candidate;
}

function nextBugLinkIdLocal_(bugLink) {
  const rows = getBugLinkRowsLocal_(bugLink);
  let maxNumber = 0;
  rows.forEach(function (row) {
    const match = row.linkId.match(/LINK-(\d+)/);
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });
  return 'LINK-' + String(maxNumber + 1).padStart(3, '0');
}

function normalizeSheetNameInputLocal_(input) {
  return textValueLocal_(pickLocal_(input, ['sheetName', '시트명', 'firstSheetName', '최초 발견 시트명'], '')).trim();
}

function normalizeTcIdValueLocal_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    const serial = Math.round((Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) - Date.UTC(1899, 11, 30)) / 86400000);
    if (serial > 0 && serial < 100000) return String(serial);
  }
  const text = textValueLocal_(value).trim();
  const dateLike = text.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?$/);
  if (dateLike) {
    const year = Number(dateLike[1]);
    const month = Number(dateLike[2]);
    const day = Number(dateLike[3]);
    const serial = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(1899, 11, 30)) / 86400000);
    if (serial > 0 && serial < 100000) return String(serial);
  }
  return text;
}

function ensureActiveBugLinkedTcSheetLocal_(ss, sheetName) {
  const normalized = textValueLocal_(sheetName || LOCAL_QA_TC.sheetName).trim();
  if (!normalized) throw new Error('sheetName is required.');
  const activeNames = getActiveBugLinkedSheetNamesLocal_(ss);
  if (activeNames.indexOf(normalized) === -1) {
    throw new Error('Inactive or unregistered bug linked sheet: ' + normalized);
  }
  const sheet = ss.getSheetByName(normalized);
  if (!sheet) throw new Error('TC sheet not found: ' + normalized);
  validateTcSheetForBugLinkLocal_(sheet);
  return sheet;
}

function normalizeQaPriorityLocal_(value, allowBlank) {
  const normalized = textValueLocal_(value).trim();
  if (!normalized && allowBlank) return '';
  if (LOCAL_QA_TC.priorityValues.indexOf(normalized) === -1) throw new Error('Invalid priority: ' + value + '. Use 1, 2, 3, or 4.');
  return normalized;
}

function normalizeListValueLocal_(value, allowedValues, label) {
  const normalized = textValueLocal_(value).trim();
  if (!normalized) throw new Error(label + ' is required.');
  if (allowedValues.indexOf(normalized) === -1) throw new Error('Invalid ' + label + ': ' + value);
  return normalized;
}

function normalizeOptionalListValueLocal_(value, allowedValues, label) {
  const normalized = textValueLocal_(value).trim();
  if (!normalized) return '';
  if (allowedValues.indexOf(normalized) === -1) throw new Error('Invalid ' + label + ': ' + value);
  return normalized;
}

function normalizeBugStatusLocal_(value) {
  const raw = textValueLocal_(value).trim();
  const normalized = raw || '열림';
  if (LOCAL_QA_TC.bugStatusValues.indexOf(normalized) !== -1) return normalized;
  if (LOCAL_QA_TC.bugStatusAliases[normalized]) return LOCAL_QA_TC.bugStatusAliases[normalized];
  throw new Error('Invalid bug status: ' + value);
}

function readBugStatusForAutomationLocal_(value) {
  const raw = textValueLocal_(value).trim();
  if (!raw) return '';
  if (LOCAL_QA_TC.bugStatusValues.indexOf(raw) !== -1) return raw;
  if (LOCAL_QA_TC.bugStatusAliases[raw]) return LOCAL_QA_TC.bugStatusAliases[raw];
  return raw;
}

function isBugStatusExcludedFromTcLocal_(value) {
  return readBugStatusForAutomationLocal_(value) === '수정 안 함';
}

function normalizeBugLinkStatusLocal_(value) {
  const normalized = textValueLocal_(value).trim() || 'Active';
  if (LOCAL_QA_TC.bugLinkStatusValues.indexOf(normalized) === -1) throw new Error('Invalid bug link status: ' + value);
  return normalized;
}

function normalizeBacklogStatusLocal_(value) {
  const raw = textValueLocal_(value).trim();
  const normalized = raw || '대기';
  if (LOCAL_QA_TC.backlogStatusValues.indexOf(normalized) !== -1) return normalized;
  if (LOCAL_QA_TC.backlogStatusAliases[normalized]) return LOCAL_QA_TC.backlogStatusAliases[normalized];
  throw new Error('Invalid backlog status: ' + value);
}

function rejectDirectBugSummaryWriteLocal_(input) {
  if (hasAnyKeyLocal_(input, ['issueId', '관련 버그 리포트 ID', '관련 이슈 ID'])) {
    throw new Error('Do not write TC sheet column I directly. Use Bug_Report and syncAllQaBugRelations so the managed summary can be rebuilt.');
  }
}

function quoteSheetNameForFormulaLocal_(sheetName) {
  return "'" + String(sheetName).replace(/'/g, "''") + "'";
}

function findNextQaTcRowLocal_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), LOCAL_QA_TC.firstDataRow);
  const values = sheet.getRange(LOCAL_QA_TC.firstDataRow, 1, lastRow - LOCAL_QA_TC.headerRow, LOCAL_QA_TC.headers.length).getDisplayValues();

  for (let i = 0; i < values.length; i += 1) {
    if (values[i].every(function (value) { return !textValueLocal_(value).trim(); })) {
      return LOCAL_QA_TC.firstDataRow + i;
    }
  }

  return lastRow + 1;
}

function findQaTcRowByIdLocal_(sheet, tcId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.firstDataRow) return 0;

  const targetTcId = normalizeTcIdValueLocal_(tcId);
  const values = sheet.getRange(LOCAL_QA_TC.firstDataRow, 1, lastRow - LOCAL_QA_TC.headerRow, 1).getDisplayValues();
  for (let i = 0; i < values.length; i += 1) {
    if (normalizeTcIdValueLocal_(values[i][0]) === targetTcId) return LOCAL_QA_TC.firstDataRow + i;
  }

  return 0;
}

function nextQaTcIdLocal_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < LOCAL_QA_TC.firstDataRow) return 'SNS-TC-001';

  const values = sheet.getRange(LOCAL_QA_TC.firstDataRow, 1, lastRow - LOCAL_QA_TC.headerRow, 1).getDisplayValues();
  let maxNumber = 0;
  values.forEach(function (row) {
    const match = textValueLocal_(row[0]).match(/SNS-TC-(\d+)/);
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]));
  });

  return 'SNS-TC-' + String(maxNumber + 1).padStart(3, '0');
}

function normalizeQaResultLocal_(result) {
  const value = textValueLocal_(result).trim() || 'Not Test';
  if (LOCAL_QA_TC.resultValues.indexOf(value) === -1) {
    throw new Error('Invalid result: ' + value);
  }

  return value;
}

function normalizeQaResultForReadLocal_(result) {
  const value = textValueLocal_(result).trim();
  return LOCAL_QA_TC.resultValues.indexOf(value) === -1 ? '' : value;
}

function applyQaResultRowFormatLocal_(sheet, rowIndex, result) {
  sheet.getRange(rowIndex, LOCAL_QA_TC.resultColumn)
    .setBackground(LOCAL_QA_TC.resultColors[result] || '#ffffff');
}

function splitQaCategoryLocal_(value) {
  const text = textValueLocal_(value).trim();
  if (!text) return ['', ''];
  const parts = text.split(/\s*\/\s*/);
  return [parts[0] || '', parts.slice(1).join(' / ')];
}

function splitQaIssueNoteLocal_(value) {
  const text = textValueLocal_(value).trim();
  if (!text) return ['', ''];
  const parts = text.split(/\s*\/\s*/);
  return [parts[0] || '', parts.slice(1).join(' / ')];
}

function joinNotesLocal_(parts) {
  return parts.filter(function (part) {
    return textValueLocal_(part).trim();
  }).join(' / ');
}

function padRowLocal_(row, width) {
  const result = row.map(function (value) {
    return textValueLocal_(value);
  });
  while (result.length < width) result.push('');
  return result.slice(0, width);
}

function hasAnyKeyLocal_(object, keys) {
  if (!object) return false;
  return keys.some(function (key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  });
}

function pickLocal_(object, keys, fallback) {
  if (!object) return fallback;
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (Object.prototype.hasOwnProperty.call(object, key) && object[key] !== undefined && object[key] !== null) {
      return object[key];
    }
  }
  return fallback;
}

function textValueLocal_(value) {
  if (value === undefined || value === null) return '';
  return String(value);
}

function requireConfigLocal_(config) {
  if (!config || !config.sheetId) throw new Error('Missing sheetId.');
  return config;
}

function requireWebhookConfigLocal_(config) {
  const checkedConfig = requireConfigLocal_(config);
  if (!checkedConfig.webhookSecret) throw new Error('Missing webhookSecret.');
  return checkedConfig;
}

function jsonResponseLocal_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErrorResponseLocal_(err) {
  const properties = PropertiesService.getScriptProperties();
  const debug = properties.getProperty('DEBUG_STACK') === 'true';
  const payload = {
    ok: false,
    error: err && err.message ? String(err.message) : 'internal_error'
  };
  if (debug && err && err.stack) payload.stack = String(err.stack);
  return jsonResponseLocal_(payload);
}





