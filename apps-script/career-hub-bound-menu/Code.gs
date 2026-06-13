/**
 * Spreadsheet-bound menu for the Career Hub workbook.
 *
 * Script Properties required in the bound spreadsheet script:
 * - CAREER_HUB_WEBAPP_URL
 * - CAREER_HUB_WEBHOOK_SECRET
 */

const CAREER_HUB_MENU_NAME = '취업자료 관리';
const CAREER_HUB_DEFAULT_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyR7kMLzYOAijbXmb4B7TEguwGv6wHwVhG7V26HvpJIkX1qljHNuDW3S7fuVs_8nvoV/exec';
const CAREER_HUB_WEBAPP_URL_PROPERTY = 'CAREER_HUB_WEBAPP_URL';
const CAREER_HUB_SECRET_PROPERTY = 'CAREER_HUB_WEBHOOK_SECRET';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu(CAREER_HUB_MENU_NAME)
    .addItem('수동입력경력 적용', 'applyManualExperienceFromMenu')
    .addToUi();
}

function applyManualExperienceFromMenu() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '수동입력경력 적용',
    '공고상세 P열 값을 경력구간/요약/차트에 반영합니다. 제외/마감 값은 공고상세에서 삭제하지 않고 제외사례에 기록합니다.',
    ui.ButtonSet.OK_CANCEL
  );

  if (response !== ui.Button.OK) return;

  try {
    const result = postCareerHubAction_('applyManualExperience');
    const applied = result.result || {};
    ui.alert(
      '수동입력경력 적용 완료',
      [
        '경력구간 변경: ' + (applied.updatedJobs || 0) + '건',
        '경력근거 갱신: ' + (applied.updatedEvidence || 0) + '건',
        '제외사례 기록: ' + (applied.recordedExcluded || 0) + '건',
        '공고상세 삭제: ' + (applied.removedJobs || 0) + '건'
      ].join('\n'),
      ui.ButtonSet.OK
    );
  } catch (error) {
    ui.alert('수동입력경력 적용 실패', String(error), ui.ButtonSet.OK);
  }
}

function postCareerHubAction_(action) {
  const properties = PropertiesService.getScriptProperties();
  const webappUrl = properties.getProperty(CAREER_HUB_WEBAPP_URL_PROPERTY) || CAREER_HUB_DEFAULT_WEBAPP_URL;
  const secret = requireCareerHubSecret_(properties);

  if (!webappUrl) throw new Error('Missing Script Property: ' + CAREER_HUB_WEBAPP_URL_PROPERTY);

  const response = UrlFetchApp.fetch(webappUrl, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      secret: secret,
      action: action
    })
  });

  const status = response.getResponseCode();
  const body = response.getContentText();
  let parsed;

  try {
    parsed = JSON.parse(body);
  } catch (error) {
    throw new Error('Webapp response was not JSON. HTTP ' + status);
  }

  if (status < 200 || status >= 300 || !parsed.ok) {
    throw new Error(parsed.error || ('Webapp request failed. HTTP ' + status));
  }

  return parsed;
}

function requireCareerHubSecret_(properties) {
  const savedSecret = properties.getProperty(CAREER_HUB_SECRET_PROPERTY);
  if (savedSecret) return savedSecret;

  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    '취업자료 관리 초기 설정',
    '웹앱 secret을 입력하세요. 한 번 저장하면 다음 실행부터 다시 묻지 않습니다.',
    ui.ButtonSet.OK_CANCEL
  );

  if (response.getSelectedButton() !== ui.Button.OK) {
    throw new Error('웹앱 secret 설정이 취소되었습니다.');
  }

  const secret = response.getResponseText().trim();
  if (!secret) throw new Error('웹앱 secret이 비어 있습니다.');

  properties.setProperty(CAREER_HUB_SECRET_PROPERTY, secret);
  if (!properties.getProperty(CAREER_HUB_WEBAPP_URL_PROPERTY)) {
    properties.setProperty(CAREER_HUB_WEBAPP_URL_PROPERTY, CAREER_HUB_DEFAULT_WEBAPP_URL);
  }

  return secret;
}

function configureCareerHubMenu(webappUrl, secret) {
  const resolvedWebappUrl = webappUrl || CAREER_HUB_DEFAULT_WEBAPP_URL;
  if (!secret) throw new Error('secret is required.');

  PropertiesService.getScriptProperties().setProperties({
    CAREER_HUB_WEBAPP_URL: resolvedWebappUrl,
    CAREER_HUB_WEBHOOK_SECRET: secret
  }, true);

  return {
    ok: true,
    configured: true
  };
}
