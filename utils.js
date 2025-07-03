/**
 * Sends a message to a user via a Telegram bot.
 * @param {string} chatId Chat/User who'll receive the message.
 * @param {string} message Message that will be sent.
 */
function sendMessage(chatId, message, parseMode = "Markdown") {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
    }),
  };

  UrlFetchApp.fetch(url, payload);
}


/**
 * Writes a row, using the row array, to the provided sheet.
 * @param {string} row  - Array containing the cells to append to the sheet.
 * @param {any[]} sheetName  - Name of the sheet where the row will be added.
 */
function writeToSheet(row, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return respondOk("Error: Sheet not found.");
  }
  const row_with_timestamp = [new Date(), ...row];
  sheet.appendRow(row_with_timestamp);
}


/**
 * Reads a single cell from the provided spreadsheet, using the 1-indexed row and column.
 * @param {any[]} sheet_name  - Name of the sheet to query the cell.
 * @param {string} row  - Row index (1-indexed; not zero-index)
 * @param {string} start_column  - Column index to start the range (1-indexed; not zero-index)
 * @param {string} end_column  - Inclusive column index to stop the range (1-indexed; not zero-index)
 * @returns {any[]} An array of values for the givent range.
 */
function readRowByIndex(sheet_name, row, start_column, end_column) {
  let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheet_name);
  var total_columns = end_column - start_column + 1;

  var rowValues = sheet
    .getRange(row, start_column, 1, total_columns) // The '1' determines the number of rows to include
    .getValues(); // row index, column index, rows to include, total number of columns for the range
  return rowValues[0]; // Return as a 1D array
}


/**
 * Reads a single cell from the provided spreadsheet, using the 1-indexed row and column.
 * @param {string} row  - Row index (1-indexed; not zero-index)
 * @param {string} column  - Column index (1-indexed; not zero-index)
 * @param {any[]} sheetName  - Name of the sheet to query the cell.
 * @returns {string} The cell's value as a string.
 */
function readSingleCell(sheetName, row, column) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  const cellValue = sheet.getRange(row, column).getValue();
  return String(cellValue);
}


/**
 * Verifies the origin chat id is authorized to perform actions.
 * @param {string} chatId  - Telegram chat ID that originated the request.
 */
function authenticate(chatId) {
  if (chatId == null || !(String(chatId) in CHAT_TO_USER)) {
    // catches both null and undefined
    DEBUG_MODE && writeToSheet([`Unauthorized user: ${chatId}`], LOG_SHEET);
    throw new Error(`Unauthorized user: ${chatId}`);
  }
  return String(chatId);
}

/**
 * Extracts the first number from a given string and converts it to a number type.
 *
 * Supports integers, decimal numbers, and negative values.
 * Throws an error if no numeric value is found in the input string.
 *
 * @param {string} str - The input string containing a number.
 * @returns {number} The extracted numeric value.
 * @throws {Error} If no number is found in the string.
 */
function extractNumber(str) {
  const match = str.match(/-?\d+(\.\d+)?/); // matches integers and decimals, including negative numbers
  if (!match) {
    throw new Error("No number found in the string");
  }
  return Number(match[0]);
}



/**
 * Converts the provided string into title case.
 * @param {string} str  - The string to convert.
 * @returns {number} The string argument in title case.
 */
function toTitleCase(str) {
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
