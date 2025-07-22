function handleUpdate(update, chatId) {
  const message = update.message;
  const messageText = message ? message.text : "N/A";
  if (chatId == null || messageText === "N/A") {
    debugLog("Error handling update");
    return;
  }
  if (messageText.startsWith("/")) {
    debugLog("Successfully handling command: " + messageText);
    handleCommand(messageText, chatId);
  } else {
    debugLog("About to handle expenses: " + messageText);
    handleExpenseEntry(messageText, chatId);
  }
}

function handleExpenseEntry(text, chatId) {
  const parts = text.split(",");
  if (parts.length < 2) {
    debugLog("Not enough args");
    sendMessage(
      chatId,
      "Please use the format: amount, category, subcategory (optional), description (optional)"
    );
    return;
  }

  const amount = extractNumber(parts[0]);

  const category = toTitleCase(cleanSpaces(removeEmojis(String(parts[1]))));
  const category_emojis = extractEmojis(String(parts[1]));
  if (category_emojis) {
    // Emoji in category, assign it to the emoji map
    CATEGORY_EMOJIS_MAP[category] = category_emojis[0];
    SCRIPT_PROPERTIES.setProperty(
      CATEGORY_EMOJIS_KEY,
      JSON.stringify(CATEGORY_EMOJIS_MAP)
    );
  }

  const subcategory = parts[2]
    ? toTitleCase(cleanSpaces(removeEmojis(String(parts[2]))))
    : null;
  const description = parts[3]
    ? toTitleCase(cleanSpaces(String(parts[3])))
    : null;

  writeExpense([amount, category, subcategory, description], EXPENSES_SHEET);

  const catLine = subcategory ? `${category} / ${subcategory}` : category;
  const descLine = description || subcategory || category;

  sendMessage(chatId, message_expense_confirmation(descLine, amount, catLine));
}

function handleCommand(command, chatId) {
  debugLog("Sent message");

  if (command === "/start") {
    alias = chatId in CHAT_TO_USER ? CHAT_TO_USER[chatId] : "";
    sendMessage(chatId, start_command_message(alias));
  } else if (command === "/cats") {
    sendMessage(chatId, categories_list_message());
  } else if (command === "/month") {
    // Data for the current month will always be on row 2, keeping this in case it's useful in the future
    // const month = MONTH_ZERO_INDEXED + 2; // +1 since G sheets are 1-indexed, + 1 for sheet headers
    const [
      total_spent,
      top_category,
      total_top_cat,
      top_subcategory,
      total_top_subcat,
    ] = readRowByIndex(MONTHLY_SUMMARY_SHEET, 2, 3, 7);
    const expense_summary = month_command_message(
      MONTH_NAME,
      total_spent,
      top_category,
      total_top_cat,
      top_subcategory,
      total_top_subcat
    );
    sendMessage(chatId, expense_summary);
  } else if (command === "/stocks") {
    send_daily_stock_summary_message(chatId, title="<b>🔎    💼  Real-Time Stock Brief  💼    🔍</b>\n");
  } else {
    // If command's not found send help (default behavior for /help as well)
    sendMessage(chatId, help_command_message(), "MarkdownV2");
  }
}
