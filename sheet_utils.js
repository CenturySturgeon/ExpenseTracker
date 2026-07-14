/**
 * Writes a row, using the row array, to the provided sheet.
 * @param {any[]} row  - Array containing the cells to append to the sheet.
 * @param {string} sheetName  - Name of the sheet where the row will be added.
 * @param {boolean} addTimestamp - Determines if the first column will include the current timestamp, true by default.
 */
function writeToSheet(row, sheetName, addTimestamp = true) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["edit_sheet"]);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return respondOk("Error: Sheet not found.");
  }

  const writeRow = addTimestamp ? [new Date(), ...row] : row;
  // Find the actual last row with content in column A, then write to next row
  const lastRowWithContent = sheet
    .getRange("A:A")
    .getValues()
    .filter(String).length;
  const nextRow = lastRowWithContent + 1;

  sheet.getRange(nextRow, 1, 1, writeRow.length).setValues([writeRow]);
}

/**
 * Writes an expense row, using the row array, to the provided sheet.
 * This function is necessary because the expenses sheet has a protected range -> Cells must be specified.
 * Cells must be specified since append row would hit the protected range no matter what.
 * @param {any[]} row  - Array containing the cells to append to the sheet.
 * @param {string} sheetName  - Name of the sheet where the row will be added.
 */
function writeExpense(row, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["edit_sheet"]);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return respondOk("Error: Sheet not found.");
  }

  // Get last row with content in the timestamp column (you should've all rows with timestamps)
  const lastRowWithTimestamp = sheet
    .getRange("A:A")
    .getValues()
    .filter(String).length;
  const nextRow = lastRowWithTimestamp + 1;

  const timestamp = new Date();
  const row_with_timestamp = [timestamp, ...row];

  // Write the row data to columns B to E
  sheet
    .getRange(nextRow, 1, 1, row_with_timestamp.length)
    .setValues([row_with_timestamp]);
}

/**
 * Reads a single row from the provided spreadsheet, using the 1-indexed row and column.
 * @param {any[]} sheet_name  - Name of the sheet to query the cell.
 * @param {number} row  - Row index (1-indexed; not zero-index)
 * @param {number} start_column  - Column index to start the range (1-indexed; not zero-index)
 * @param {number} end_column  - Inclusive column index to stop the range (1-indexed; not zero-index)
 * @returns {any[]} An array of values for the givent range.
 */
function readRowByIndex(
  sheet_name,
  row,
  start_column,
  end_column,
  document = "read_only_sheet",
) {
  let ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP[document]);
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
  var sheet = ss.getSheetByName(sheetName);
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  return values;
}

function getLastRowIndex(sheetName, document = "read_only_sheet") {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP[document]);
  var sheet = ss.getSheetByName(sheetName);
  return sheet.getLastRow();
}

/**
 * Overwrites a row in the provided sheet with the given row array.
 * @param {number} rowIndex - The 1-based index of the row to overwrite.
 * @param {any[]} row - Array containing the cells to write to the row.
 * @param {string} sheetName - Name of the sheet where the row will be overwritten.
 */
function overwriteRow(rowIndex, row, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID_MAP["edit_sheet"]);
  const sheet = ss.getSheetByName(sheetName);

  if (rowIndex < 1 || rowIndex > sheet.getLastRow()) {
    debugLog("Error: Invalid row index for sheet: " + sheetName);
  }

  // const numColumns = sheet.getLastColumn(); // Could be useful later on
  const range = sheet.getRange(rowIndex, 1, 1, row.length);

  // The new values must be a 2D array, so we wrap the row array.
  range.setValues([row]);
}

function debugLog(message) {
  DEBUG_MODE && writeToSheet([message], LOG_SHEET);
}

/**
 * Returns the configured default/base currency.
 * Lookup order: Script Property → CURRENCIES!F2 → fallback to "USD".
 * @returns {string} The base currency code (e.g., "CAD", "EUR", "USD").
 */
function getDefaultCurrency() {
  const cache = PropertiesService.getScriptProperties();

  // Tier 1: Check Script Property cache
  let defaultCurrency = cache.getProperty(DEFAULT_CURRENCY_KEY);
  if (defaultCurrency) {
    return defaultCurrency;
  }

  // Tier 2: Read from CURRENCIES sheet, cell F2 (row 2, column 6)
  try {
    const value = readSingleCell("CURRENCIES", 2, 6);
    if (value && value.trim().length > 0) {
      defaultCurrency = value.trim().toUpperCase();
      cache.setProperty(DEFAULT_CURRENCY_KEY, defaultCurrency);
      return defaultCurrency;
    }
  } catch (e) {
    debugLog(`Failed to read default currency from CURRENCIES!F2: ${e.message}`);
  }

  // Tier 3: Fallback to USD
  cache.setProperty(DEFAULT_CURRENCY_KEY, "USD");
  return "USD";
}

/**
 * Fetches the real-time FX rate from Frankfurter API.
 * Returns 1 if currency is USD (base case).
 * Caches result for ~24 hours to minimize API calls.
 *
 * @param {string} currency - The target currency code (e.g., 'CAD', 'MXN', 'EUR').
 * @returns {number} The FX rate relative to USD.
 * @throws {Error} If the API call fails and no fallback is available.
 */
function getFxRate(currency) {
  const baseCurrency = getDefaultCurrency();
  if (currency.toUpperCase() === baseCurrency) return 1;

  const cache = PropertiesService.getScriptProperties();
  const cacheKey = `fx_${currency}`;
  const timestampKey = `fx_timestamp_${currency}`;

  // Check cache first
  const cachedRate = cache.getProperty(cacheKey);
  const timestampStr = cache.getProperty(timestampKey);

  if (cachedRate && timestampStr) {
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    if (now - timestamp < twentyFourHoursMs) {
      return parseFloat(cachedRate);
    }
  }

  // Fetch from Frankfurter API
  try {
    const url = `https://api.frankfurter.dev/v1/latest?from=${currency}&to=${baseCurrency}`;
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    if (data && data.rates && data.rates[baseCurrency]) {
      const rate = data.rates[baseCurrency];
      // Cache the result with timestamp
      cache.setProperty(cacheKey, rate.toString());
      cache.setProperty(timestampKey, Date.now().toString());
      return rate;
    } else {
      throw new Error("Invalid API response structure");
    }
  } catch (error) {
    debugLog(`Failed to fetch FX rate for ${currency}: ${error.message}`);
    // Return cached value if available, otherwise throw
    if (cachedRate) {
      return parseFloat(cachedRate);
    }
    throw new Error(
      `Failed to fetch FX rate for ${currency}. Please try again later.`,
    );
  }
}

/**
 * Fetches the current stock price from Yahoo Finance unofficial endpoint.
 * Caches result for ~24 hours per ticker to minimize API calls.
 *
 * @param {string} ticker - The stock ticker symbol (e.g., 'AAPL', 'MSFT').
 * @returns {number|null} The current stock price, or null if fetch fails.
 */
function getStockPrice(ticker) {
  const cache = PropertiesService.getScriptProperties();
  const cacheKey = `stock_${ticker}`;
  const timestampKey = `stock_timestamp_${ticker}`;

  // Check cache first
  const cachedPrice = cache.getProperty(cacheKey);
  const timestampStr = cache.getProperty(timestampKey);

  if (cachedPrice && timestampStr) {
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    if (now - timestamp < twentyFourHoursMs) {
      return parseFloat(cachedPrice);
    }
  }

  // Fetch from Yahoo Finance unofficial endpoint
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const response = UrlFetchApp.fetch(url);
    const data = JSON.parse(response.getContentText());

    // Yahoo Finance returns price in result[0].meta.regularMarketPrice
    if (
      data &&
      data.chart &&
      data.chart.result &&
      data.chart.result.length > 0
    ) {
      const meta = data.chart.result[0].meta;
      const price = meta.regularMarketPrice;

      if (typeof price === "number" && !isNaN(price)) {
        // Cache the result with timestamp
        cache.setProperty(cacheKey, price.toString());
        cache.setProperty(timestampKey, Date.now().toString());
        return price;
      }
    }
    throw new Error("Invalid API response structure");
  } catch (error) {
    debugLog(`Failed to fetch stock price for ${ticker}: ${error.message}`);
    // Return cached value if available, otherwise null
    if (cachedPrice) {
      return parseFloat(cachedPrice);
    }
    return null;
  }
}
