
function authenticate(chatId) {
  /**
   * Verifies the origin chat id is authorized.
   * @param {string} chatId  - Telegram chat ID that originated the request.
   */
  if (chatId == null || !(String(chatId) in CHAT_TO_USER)) {
    // catches both null and undefined
    DEBUG_MODE &&
      writeToSheet(
        [`Unauthorized user: ${chatId}`],
        ERROR_SHEET_NAME
      );
    throw new Error(`Unauthorized user: ${chatId}`);
  }
  return String(chatId);
}

function doPost(e) {
  // This is the main function the telegram bot posts to using the webhook

  // Parse the incoming Telegram update
  let update;
  try {
    update = JSON.parse(e.postData.contents);
    DEBUG_MODE &&
      writeToSheet(
        ["Received request: " + JSON.stringify(update)],
        ERROR_SHEET_NAME
      );
  } catch (error) {
    DEBUG_MODE &&
      writeToSheet(
        ["Error parsing Telegram update: " + error.message],
        ERROR_SHEET_NAME
      );
    return respondOk("Error: Invalid JSON payload");
  }

  // Extract the unique update_id
  const updateId = update.update_id;
  if (!updateId) {
    DEBUG_MODE &&
      writeToSheet(["No update_id found in payload."], ERROR_SHEET_NAME);
    return respondOk("Error: No update_id provided");
  }

  // Use PropertiesService to get the last processed update ID
  const scriptProperties = PropertiesService.getScriptProperties();
  const lastProcessedUpdateId =
    scriptProperties.getProperty(LAST_UPDATE_ID_KEY);

  // Check for duplicates
  if (
    !DEBUG_MODE &&
    lastProcessedUpdateId &&
    Number(updateId) <= Number(lastProcessedUpdateId)
  ) {
    DEBUG_MODE &&
      writeToSheet(
        ["Duplicate or old update_id received. Ignoring: " + updateId],
        ERROR_SHEET_NAME
      );
    // Important: Always return a 200 OK even for duplicates,
    // otherwise Telegram will keep retrying.
    return respondOk("OK - Duplicate update ignored");
  }

  try {
    const chat_id = authenticate(update.message ? update.message.chat.id : null);
    handleUpdate(update, chat_id);
  } catch (error) {
    DEBUG_MODE &&
      writeToSheet(
        ["Handling Error: " + error.message],
        ERROR_SHEET_NAME
      );
    return respondOk("Error processing request: " + error.message);
  }

  try {
    // After successfully writing, store the new lastProcessedUpdateId
    !DEBUG_MODE &&
      scriptProperties.setProperty(LAST_UPDATE_ID_KEY, String(updateId));

    DEBUG_MODE && writeToSheet(["Successful Run"], ERROR_SHEET_NAME);
    return respondOk();
  } catch (error) {
    DEBUG_MODE &&
      writeToSheet(
        ["Error processing webhook or writing to sheet: " + error.message],
        ERROR_SHEET_NAME
      );
    // You might want to return a different status code for unrecoverable errors,
    // but for Telegram webhooks, often 200 OK is best to prevent retries
    // unless you want Telegram to retry. For data integrity, ignoring
    // the retry and logging the error is often preferred.
    return respondOk("Error processing request: " + error.message);
  }
}

function handleUpdate(update, chatId) {
  const message = update.message;
  const messageText = message ? message.text : "N/A";
  if (chatId == null || messageText === "N/A") {
    DEBUG_MODE && writeToSheet(["Error handling update"], ERROR_SHEET_NAME);
    return;
  }
  if (messageText.startsWith("/")) {
    DEBUG_MODE &&
      writeToSheet(
        ["Successfully handling command: " + messageText],
        ERROR_SHEET_NAME
      );
    handleCommand(messageText, chatId);
  } else {
    DEBUG_MODE &&
      writeToSheet(
        ["About to handle expenses: " + messageText],
        ERROR_SHEET_NAME
      );
    handleExpenseEntry(messageText, chatId);
  }
}

function handleExpenseEntry(text, chatId) {
  const parts = text.split(",");
  if (parts.length < 3) {
    DEBUG_MODE && writeToSheet(["Not enough args"], ERROR_SHEET_NAME);
    sendMessage(
      chatId,
      "Please use the format: name, amount, category, subcategory (optional), description (optional)"
    );
    return;
  }

  const name = toTitleCase(String(parts[0]));
  const amount = Number(String(parts[1].trim()));
  const category = toTitleCase(String(parts[2]));

  const subcategory = parts[3] ? toTitleCase(String(parts[3])) : null;
  const description = parts[4] ? toTitleCase(String(parts[4])) : null;

  writeToSheet([name, amount, category, subcategory, description], EXPENSES_SHEET);

  const catLine = subcategory ? `${category} / ${subcategory}` : category;
  const descLine = description || name;

  sendMessage(
    chatId,
    `💸 Expense recorded 💸\n\n📝 *${descLine}*\n💰 $${amount.toFixed(
      2
    )}\n📂 ${catLine}`
  );
}

function handleCommand(command, chatId) {
  DEBUG_MODE && writeToSheet(["Sent message"], ERROR_SHEET_NAME);
  return;
  /*
  let total = 0;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EXPENSES_SHEET);
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
