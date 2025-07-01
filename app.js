// PropertiesService Keys
const TELEGRAM_TOKEN_KEY = 'telegramToken';
const SPREADSHEET_ID_KEY = 'spreadsheetId';
const CHAT_MAP_KEY = 'chatMap'; // JSON string object {<chatId>: <Alias>}
const DEBUG_MODE_KEY = 'debugMode';
const LAST_UPDATE_ID_KEY = 'lastProcessedUpdateId';

// PropertiesService Values
const SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();
const TELEGRAM_TOKEN = SCRIPT_PROPERTIES.getProperty(TELEGRAM_TOKEN_KEY);
const SPREADSHEET_ID = SCRIPT_PROPERTIES.getProperty(SPREADSHEET_ID_KEY);
const CHAT_TO_USER = JSON.parse(SCRIPT_PROPERTIES.getProperty(CHAT_ID_OBJECT_KEY));
const DEBUG_MODE = Boolean(SCRIPT_PROPERTIES.getProperty(DEBUG_MODE_KEY));


const SHEET_NAME = 'EXPENSES';
const ERROR_SHEET_NAME = 'ERRORS'


function doPost(e) {
  // This is the main function the telegram bot posts to using the webhook

  // Parse the incoming Telegram update
  let update;
  try {
    update = JSON.parse(e.postData.contents);
  } catch (error) {
    DEBUG_MODE && writeErrorToSheet(["Error parsing Telegram update: " + error.message]);
    return ContentService.createTextOutput("Error: Invalid JSON payload").setMimeType(ContentService.MimeType.TEXT);
  }

  // Extract the unique update_id
  const updateId = update.update_id;
  if (!updateId) {
    DEBUG_MODE && writeErrorToSheet(["No update_id found in payload."]);
    return ContentService.createTextOutput("Error: No update_id provided").setMimeType(ContentService.MimeType.TEXT);
  }

  // Use PropertiesService to get the last processed update ID
  const scriptProperties = PropertiesService.getScriptProperties();
  const lastProcessedUpdateId = scriptProperties.getProperty(LAST_UPDATE_ID_KEY);

  // Check for duplicates
  if (!DEBUG_MODE && lastProcessedUpdateId && Number(updateId) <= Number(lastProcessedUpdateId)) {
    DEBUG_MODE && writeErrorToSheet(["Duplicate or old update_id received. Ignoring: " + updateId]);
    // Important: Always return a 200 OK even for duplicates,
    // otherwise Telegram will keep retrying.
    return ContentService.createTextOutput("OK - Duplicate update ignored").setMimeType(ContentService.MimeType.TEXT);
  }

  try {
    /// DEBUG_MODE && writeErrorToSheet(["Handling Update"]);
    handleUpdate(update);

    // After successfully writing, store the new lastProcessedUpdateId
    !DEBUG_MODE && scriptProperties.setProperty(LAST_UPDATE_ID_KEY, String(updateId));

    DEBUG_MODE && writeErrorToSheet(["Successful Run"]);
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    DEBUG_MODE && writeErrorToSheet(["Error processing webhook or writing to sheet: " + error.message]);
    // You might want to return a different status code for unrecoverable errors,
    // but for Telegram webhooks, often 200 OK is best to prevent retries
    // unless you want Telegram to retry. For data integrity, ignoring
    // the retry and logging the error is often preferred.
    return ContentService.createTextOutput("Error processing request: " + error.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function handleUpdate(update) {
  // Extract message text (assuming a simple text message)
  const messageText = update.message ? update.message.text : 'N/A';
  const chatId = update.message ? update.message.chat.id : 'N/A';
  if (chatId === 'N/A'|| messageText === 'N/A') {
    DEBUG_MODE && writeErrorToSheet(["Error handling update"]);
    return
  }
  if (messageText.startsWith("/")) {
    DEBUG_MODE && writeErrorToSheet(["Successfully handling command: " + messageText]);
    handleCommand(messageText, chatId);
  } else {
    DEBUG_MODE && writeErrorToSheet(["About to handle expenses: " + messageText]);
    handleExpenseEntry(messageText, chatId);
  }
}

function handleExpenseEntry(text, chatId) {
  const parts = text.split(",");
  if (parts.length < 3) {
    DEBUG_MODE && writeErrorToSheet(["Not enough args"]);
    sendMessage("Please use the format: name, amount, category, subcategory (optional), description (optional)");
    return;
  }

  const name = toTitleCase(parts[0]);
  const amount = parseFloat(parts[1].trim());
  const category = toTitleCase(parts[2]);
  const subcategory = toTitleCase(parts[3]) ?? null;
  const description = toTitleCase(parts[4]) ?? null;

  writeToSheet([name, amount, category, subcategory, description]);

  const catLine = subcategory ? `${category} / ${subcategory}` : category;
  const descLine = description || name;

  sendMessage(
    `💸 Expense recorded 💸\n\n📝 *${descLine}*\n💰 $${amount.toFixed(2)}\n📂 ${catLine}`
  );
}

function handleCommand(command, chatId) {
  sendMessage("Sup man");
  DEBUG_MODE && writeErrorToSheet(["Sent message"]);
  return;
  /*
  let total = 0;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  if (command === "/day") {
    total = getTotalSince(data, 1);
    sendMessage(chatId, `Today's spending: ₹${total}`);
  } else if (command === "/week") {
    total = getTotalSince(data, 7);
    sendMessage(chatId, `This week's spending: ₹${total}`);
  } else if (command === "/month") {
    total = getTotalSince(data, 30);
    sendMessage(chatId, `This month's spending: ₹${total}`);
  } else {
    sendMessage(chatId, "Available commands: /day /week /month");
  }
  */
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function writeErrorToSheet(row) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(ERROR_SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput("Error: Sheet not found.").setMimeType(ContentService.MimeType.TEXT);
  }
  const row_with_timestamp = [new Date(), ...row]
  sheet.appendRow(row_with_timestamp);
}

function writeToSheet(row) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput("Error: Sheet not found.").setMimeType(ContentService.MimeType.TEXT);
  }
  const row_with_timestamp = [new Date(), ...row]
  sheet.appendRow(row_with_timestamp);
}

function sendMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  };
  UrlFetchApp.fetch(url, payload);
}