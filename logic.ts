function handleUpdate(update, chatId) {
  const message = update.message;
  const messageText = message ? message.text : "N/A";
  if (chatId == null || messageText === "N/A") {
    DEBUG_MODE && writeToSheet(["Error handling update"], LOG_SHEET);
    return;
  }
  if (messageText.startsWith("/")) {
    DEBUG_MODE &&
      writeToSheet(
        ["Successfully handling command: " + messageText],
        LOG_SHEET
      );
    handleCommand(messageText, chatId);
  } else {
    DEBUG_MODE &&
      writeToSheet(
        ["About to handle expenses: " + messageText],
        LOG_SHEET
      );
    handleExpenseEntry(messageText, chatId);
  }
}

function handleExpenseEntry(text, chatId) {
  const parts = text.split(",");
  if (parts.length < 3) {
    DEBUG_MODE && writeToSheet(["Not enough args"], LOG_SHEET);
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

  writeToSheet(
    [name, amount, category, subcategory, description],
    EXPENSES_SHEET
  );

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
  DEBUG_MODE && writeToSheet(["Sent message"], LOG_SHEET);
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
