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
  } else if (command === "/stocks") {
    send_daily_stock_summary_message(
      chatId,
      (title = "<b>🔎    💼  Real-Time Stock Brief  💼    🔍</b>\n")
    );
  } else if (command.includes("/track")) {
    const track_object = parseTrackCommand(command);
    let price;
    debugLog(`Tracking: ${command}`);

    try {
      if (track_object.price !== undefined) {
        price = track_object.price;
        writeToSheet(
          [track_object.ticker, track_object.price],
          SHEET_ALIAS_TO_NAME_MAP["TRACK"],
          false
        );
      } else {
        const last_row =
          getLastRowIndex(SHEET_ALIAS_TO_NAME_MAP["TRACK"], "edit_sheet") + 1;
        writeToSheet(
          [track_object.ticker],
          SHEET_ALIAS_TO_NAME_MAP["TRACK"],
          false
        );
        Utilities.sleep(3000);
        const targetless_row = readRowByIndex(
          SHEET_ALIAS_TO_NAME_MAP["TRACK"],
          last_row,
          1,
          3,
          "edit_sheet"
        );
        price = targetless_row[2];
        overwriteRow(
          last_row,
          [track_object.ticker, price],
          (SHEET_ALIAS_TO_NAME_MAP["TRACK"] = "TRACK")
        );
      }
    } catch (e) {
      debugLog(e);
      sendMessage(chatId, "Command must match: /track {TICKER} {PRICE}");
    }

    sendMessage(
      chatId,
      stock_tracked_confirmation_message(track_object.ticker, price)
    );
  } else if (command === "/report") {
    const expenses = readDataFromSheet("SPENDING").slice(1);
    const report = month_spending_message(expenses);

    const month_summary = readRowByIndex(MONTHLY_SUMMARY_SHEET, 2, 3, 7);
    const summary_report = month_command_message(month_summary);
    sendMessage(chatId, report + summary_report);
  } else {
    // If command's not found send help (default behavior for /help as well)
    sendMessage(chatId, help_command_message(), "MarkdownV2");
  }
}
