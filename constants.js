// PropertiesService (env) Keys
const TELEGRAM_TOKEN_KEY = "telegramToken";
const SPREADSHEET_IDS_KEY = "spreadsheetIds";
const CHAT_MAP_KEY = "chatMap"; // JSON string object {<Chat Id>: <User Alias>}
const DEBUG_MODE_KEY = "debugMode";
const LAST_UPDATE_ID_KEY = "lastProcessedUpdateId";
const LOG_SHEET_KEY = "logSheetName";
const CATEGORY_EMOJIS_KEY = "categoryEmojis";
const SPREADHSHEED_MAP_KEY = "readSpreadsheetNames";
const SECRET_TOKEN_KEY = "secretToken";
const CURRENCY_EMOJIS_KEY = "currencyEmojis";
const TRIGGERS_KEY = "triggers";
const QUOTE_CACHE_KEY = "quoteCache";
const QUOTE_TIMESTAMP_KEY = "quoteTimestamp";
const DEFAULT_CURRENCY_KEY = "defaultCurrecy";

// PropertiesService (env) Values
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const TELEGRAM_TOKEN = SCRIPT_PROPERTIES.getProperty(TELEGRAM_TOKEN_KEY);
const SPREADSHEET_ID_MAP = JSON.parse(
  SCRIPT_PROPERTIES.getProperty(SPREADSHEET_IDS_KEY),
); // {"edit_sheet":"edit_sheet_id","read_only_sheet":"read_only_sheet_id"}
const CHAT_TO_USER = JSON.parse(SCRIPT_PROPERTIES.getProperty(CHAT_MAP_KEY));
const DEBUG_MODE = Boolean(
  SCRIPT_PROPERTIES.getProperty(DEBUG_MODE_KEY) === "true",
);
const CATEGORY_EMOJIS_MAP = JSON.parse(
  SCRIPT_PROPERTIES.getProperty(CATEGORY_EMOJIS_KEY),
);
const SECRET_TOKEN = SCRIPT_PROPERTIES.getProperty(SECRET_TOKEN_KEY);
const CURRENCY_EMOJIS_MAP = JSON.parse(
  SCRIPT_PROPERTIES.getProperty(CURRENCY_EMOJIS_KEY),
);
const TRIGGERS_MAP = JSON.parse(SCRIPT_PROPERTIES.getProperty(TRIGGERS_KEY));

// Google Spreadsheets sheet names
let SHEET_ALIAS_TO_NAME_MAP = JSON.parse(
  SCRIPT_PROPERTIES.getProperty(SPREADHSHEED_MAP_KEY),
);
if (!SHEET_ALIAS_TO_NAME_MAP) {
  SHEET_ALIAS_TO_NAME_MAP = {
    EXPENSES: "EXPENSES",
    INCOME: "VARIABLE INCOME",
    MONTHLY: "MONTHLY EXPENSES",
    CATEGORIES: "CATEGORIES",
    SPENDING: "SPENDING",
    TRACK: "TRACK",
    STOCK_TXNS: "Stock Txns", // Single sheet config only (NOT RECOMENDED)
  };
  SCRIPT_PROPERTIES.setProperty(
    SPREADHSHEED_MAP_KEY,
    JSON.stringify(SHEET_ALIAS_TO_NAME_MAP),
  );
}

const EXPENSES_SHEET = SHEET_ALIAS_TO_NAME_MAP["EXPENSES"];
const INCOME_SHEET = SHEET_ALIAS_TO_NAME_MAP["INCOME"];
const MONTHLY_SUMMARY_SHEET = SHEET_ALIAS_TO_NAME_MAP["MONTHLY"];
const CATEGORIES_SHEET = SHEET_ALIAS_TO_NAME_MAP["CATEGORIES"];
const LOG_SHEET = SCRIPT_PROPERTIES.getProperty(LOG_SHEET_KEY);
const STOCK_TXNS_SHEET = SHEET_ALIAS_TO_NAME_MAP["STOCK_TXNS"];

// Ohter constants
const MONTH_ZERO_INDEXED = new Date().getMonth();
const MONTH_NAME = new Date().toLocaleString("en-US", { month: "long" });
