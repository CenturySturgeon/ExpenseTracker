/**
 * Writes a row, using the row array, to the provided sheet.
 * @param {string} row  - Array containing the cells to append to the sheet.
 * @param {any[]} sheetName  - Name of the sheet where the row will be added.
 */
function writeToSheet(row, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["edit_sheet"]);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return respondOk("Error: Sheet not found.");
  }
  const row_with_timestamp = [new Date(), ...row];
  sheet.appendRow(row_with_timestamp);
}


/**
 * Writes an expense row, using the row array, to the provided sheet.
 * This function is necessary because the expenses sheet has a protected range -> Cells must be specified.
 * Cells must be specified since append row would hit the protected range no matter what.
 * @param {string} row  - Array containing the cells to append to the sheet.
 * @param {any[]} sheetName  - Name of the sheet where the row will be added.
 */
function writeExpense(row, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["edit_sheet"]);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return respondOk("Error: Sheet not found.");
  }

  // Get last row with content in the timestamp column (you should've all rows with timestamps)
  const lastRowWithTimestamp = sheet.getRange("A:A").getValues().filter(String).length;
  const nextRow = lastRowWithTimestamp + 1;

  const timestamp = new Date();
  const row_with_timestamp = [timestamp, ...row];

  // Write the row data to columns B to E
  sheet.getRange(nextRow, 1, 1, row_with_timestamp.length).setValues([row_with_timestamp]);
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
  let ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["read_only_sheet"]);
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
 * @param {string} sheetName  - Name of the sheet to query the cell.
 * @returns {string} The cell's value as a string.
 */
function readSingleCell(sheetName, row, column) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["read_only_sheet"]);
  const sheet = ss.getSheetByName(sheetName);
  const cellValue = sheet.getRange(row, column).getValue();
  return String(cellValue);
}


/**
 * Reads all data from the provided sheet.
 * @param {string} sheetName  - Name of the sheet to query for data.
 * @returns {any[]} The found data.
 */
function readDataFromSheet(sheetName) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["read_only_sheet"]);
  var sheet = ss.getSheetByName(sheetName); // Replace with your actual sheet name
  var dataRange = sheet.getDataRange(); // Get the range that contains data
  var values = dataRange.getValues(); // Get the values from that range
  return values;
}

/**
 * Maps categories to their respective subcategories from a 2D array.
 *
 * The first row of the input data is assumed to contain category names.
 * Each subsequent row contains subcategories aligned by column to their respective categories.
 * Empty strings and "#N/A" values are ignored in subcategories.
 *
 * @param {string[][]} data - A 2D array where the first row contains category names and subsequent rows contain subcategories.
 * @returns {Object} An object mapping each non-empty category to an array of its valid subcategories.
 */
function mapCategoriesToSubcategories(data) {
  const result = {};
  const categories = data[0];

  for (let col = 0; col < categories.length; col++) {
    const category = categories[col];

    if (!category) continue;
    const subcategories = [];

    for (let row = 1; row < data.length; row++) {
      const sub = data[row][col];
      if (sub && sub !== "#N/A") {
        subcategories.push(sub);
      }
    }

    // Only include if there's at least one subcategory
    if (subcategories.length) {
      result[category] = subcategories;
    } else {
      result[category] = [];
    }
  }

  return result;
}

/**
 * Returns the keys of an object sorted in alphabetical order.
 *
 * @param {Object} obj - The object whose keys are to be retrieved and sorted.
 * @returns {string[]} An array of the object's keys sorted alphabetically.
 */
function getObjectSortedKeys(obj) {
  const sortedKeys = Object.keys(obj).sort(); // Sort the keys alphabetically
  return sortedKeys;
}


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
 * Cleans up a string by removing leading and trailing whitespace
 * and replacing multiple internal spaces with a single space.
 *
 * @param {string} str - The input string to clean.
 * @returns {string} A cleaned string with trimmed edges and normalized spacing.
 *
 * @example
 * cleanSpaces("   Hello    World   "); // "Hello World"
 * cleanSpaces("This     is   a   test"); // "This is a test"
 */
function cleanSpaces(str) {
  return str
    .replace(/^\s+|\s+$/g, '')   // Trim leading and trailing whitespace
    .replace(/\s{2,}/g, ' ');    // Replace two or more spaces with a single space
}


/**
 * Extracts all individual emoji characters from a given string.
 *
 * @param {string} str - The input string to extract emojis from.
 * @returns {string[]} Null or an array of emoji characters found in the string.
 */
function extractEmojis(str) {
  const emojiRegex = /\p{Emoji}/gu;
  return str.match(emojiRegex) || [];
}


/**
 * Removes all emoji characters from a given string.
 *
 * @param {string} str - The input string to process.
 * @returns {string} The input string with all emojis removed.
 */
function removeEmojis(str) {
  const emojiRegex = /\p{Emoji}/gu;
  return str.replace(emojiRegex, '');
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
