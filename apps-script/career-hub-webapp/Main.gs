/**
 * Consumer web app for the employment research spreadsheet.
 *
 * Configuration belongs in this script project's Script Properties:
 * - TARGET_SPREADSHEET_ID
 * - WEBHOOK_SECRET
 * - REFERENCE_SOURCE_IDS_JSON
 */

function doGet() {
  return CareerHubCore.healthCheck(loadConfig_());
}

function doPost(e) {
  return CareerHubCore.handlePost(e, loadConfig_());
}

function setupWorkbook() {
  return CareerHubCore.setupWorkbook(loadConfig_());
}

function applyManualExperience() {
  return CareerHubCore.applyManualExperience(loadConfig_());
}

function importLinkedGameReferences() {
  return CareerHubCore.importLinkedGameReferences(loadConfig_());
}

function validateWorkbookConnection() {
  return CareerHubCore.validateConnection(loadConfig_());
}

function loadConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const rawReferenceSourceIds = properties.getProperty('REFERENCE_SOURCE_IDS_JSON') || '{}';
  let referenceSourceIds;

  try {
    referenceSourceIds = JSON.parse(rawReferenceSourceIds);
  } catch (error) {
    throw new Error('REFERENCE_SOURCE_IDS_JSON must be valid JSON.');
  }

  return {
    sheetId: requireProperty_(properties, 'TARGET_SPREADSHEET_ID'),
    webhookSecret: properties.getProperty('WEBHOOK_SECRET') || '',
    referenceSourceIds: referenceSourceIds
  };
}

function requireProperty_(properties, name) {
  const value = properties.getProperty(name);
  if (!value) throw new Error('Missing Script Property: ' + name);
  return value;
}
