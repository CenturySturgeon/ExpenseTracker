function sendMessage(chatId: string, message: string) {
  /**
   * Writes a row, using the row array, to the provided sheet.
   * @param {string} row  - Array containing the cells to append to the sheet.
   * @param {any[]} sheetName  - Name of the sheet where the row will be added.
   */
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  };

  UrlFetchApp.fetch(url, payload);
}

/**
 * Writes a row, using the row array, to the provided sheet.
 * @param {string} row  - Array containing the cells to append to the sheet.
 * @param {any[]} sheetName  - Name of the sheet where the row will be added.
 */
function writeToSheet(row: any[], sheetName: string) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return respondOk("Error: Sheet not found.");
  }
  const row_with_timestamp = [new Date(), ...row];
  sheet.appendRow(row_with_timestamp);
}

/**
 * Verifies the origin chat id is authorized to perform actions.
 * @param {string} chatId  - Telegram chat ID that originated the request.
 */
function authenticate(chatId: string) {
  if (chatId == null || !(String(chatId) in CHAT_TO_USER)) {
    // catches both null and undefined
    DEBUG_MODE &&
      writeToSheet([`Unauthorized user: ${chatId}`], LOG_SHEET);
    throw new Error(`Unauthorized user: ${chatId}`);
  }
  return String(chatId);
}

/**
 * Converts the provided string into title case.
 * @param {string} str  - The string to convert.
 * @returns {number} The string argument in title case.
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// API Return Functions
function respondOk(message = "Ok") {
  // For Telegram webhooks, 200 OK is best to prevent retries.
  return HtmlService.createHtmlOutput(message);
}

function respondJson(obj) {
  return HtmlService.createHtmlOutput(JSON.stringify(obj));
}
