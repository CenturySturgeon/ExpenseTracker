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
function readDataFromSheet(sheetName, document = "read_only_sheet") {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP[document]);
  var sheet = ss.getSheetByName(sheetName); // Replace with your actual sheet name
  var dataRange = sheet.getDataRange(); // Get the range that contains data
  var values = dataRange.getValues(); // Get the values from that range
  return values;
}


function debugLog(message) {
  DEBUG_MODE && writeToSheet([message], LOG_SHEET);
}