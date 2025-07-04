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
      writeToSheet(["About to handle expenses: " + messageText], LOG_SHEET);
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

  const name = toTitleCase(cleanSpaces(removeEmojis(String(parts[0]))));
  const amount = extractNumber(parts[1]);

  const category = toTitleCase(cleanSpaces(removeEmojis(String(parts[2]))));
  const category_emojis = extractEmojis(String(parts[2]));
  if (category_emojis){
    // Emoji in category, assign it to the emoji map
    CATEGORY_EMOJIS_MAP[category] = category_emojis[0];
    SCRIPT_PROPERTIES.setProperty(CATEGORY_EMOJIS_KEY, JSON.stringify(CATEGORY_EMOJIS_MAP));
  }

  const subcategory = parts[3] ? toTitleCase(cleanSpaces(removeEmojis(String(parts[3])))) : null;
  const description = parts[4] ? toTitleCase(cleanSpaces(String(parts[4]))) : null;

  writeToSheet(
    [name, amount, category, subcategory, description],
    EXPENSES_SHEET
  );

  const catLine = subcategory ? `${category} / ${subcategory}` : category;
  const descLine = description || name;

  sendMessage(chatId, message_expense_confirmation(descLine, amount, catLine));
}

function handleCommand(command, chatId) {
  DEBUG_MODE && writeToSheet(["Sent message"], LOG_SHEET);

  if (command === "/start") {
    alias = chatId in CHAT_TO_USER ? CHAT_TO_USER[chatId] : "";
    sendMessage(chatId, start_command_message(alias));
  } else if (command === "/cats") {
    sendMessage(chatId, categories_list_message());
  } else if (command === "/month") {
    const month = MONTH_ZERO_INDEXED + 2; // +1 since G sheets are 1-indexed, + 1 for sheet headers
    const [total_spent, top_category, total_top_cat, top_subcategory, total_top_subcat] = readRowByIndex(MONTHLY_SUMMARY_SHEET, month, 3, 7);
    const expense_summary = month_command_message(MONTH_NAME, total_spent, top_category, total_top_cat, top_subcategory, total_top_subcat);
    sendMessage(chatId, expense_summary);
  } else {
    // If command's not found send help (default behavior for /help as well)
    sendMessage(chatId, help_command_message(), "MarkdownV2");
  }
}
