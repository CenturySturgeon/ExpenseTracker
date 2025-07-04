// PropertiesService (env) Keys
const TELEGRAM_TOKEN_KEY = "telegramToken";
const SPREADSHEET_ID_KEY = "spreadsheetId";
const CHAT_MAP_KEY = "chatMap"; // JSON string object {<Chat Id>: <User Alias>}
const DEBUG_MODE_KEY = "debugMode";
const LAST_UPDATE_ID_KEY = "lastProcessedUpdateId";
const LOG_SHEET_KEY = "logSheetName";
const CATEGORY_EMOJIS_KEY = "categoryEmojis";

// PropertiesService (env) Values
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const TELEGRAM_TOKEN = SCRIPT_PROPERTIES.getProperty(TELEGRAM_TOKEN_KEY);
const SPREADSHEET_ID = SCRIPT_PROPERTIES.getProperty(SPREADSHEET_ID_KEY);
const CHAT_TO_USER = JSON.parse(SCRIPT_PROPERTIES.getProperty(CHAT_MAP_KEY));
const DEBUG_MODE = Boolean(
  SCRIPT_PROPERTIES.getProperty(DEBUG_MODE_KEY) === "true"
);
const CATEGORY_EMOJIS_MAP = JSON.parse(SCRIPT_PROPERTIES.getProperty(CATEGORY_EMOJIS_KEY));

// Google Spreadsheets sheet names
const EXPENSES_SHEET = "EXPENSES";
const MONTHLY_SUMMARY_SHEET = "MONTHLY"
const CATEGORIES_SHEET = "CATEGORIES"
const LOG_SHEET = SCRIPT_PROPERTIES.getProperty(LOG_SHEET_KEY);

// Ohter constants
const MONTH_ZERO_INDEXED = new Date().getMonth();
const MONTH_NAME = new Date().toLocaleString('en-US', { month: 'long' });