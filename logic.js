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
      "Please use the format: amount, category, subcategory (optional), description (optional)",
    );
    return;
  }

  let amount = extractNumber(parts[0]);

  let isIncome = false;
  if (amount < 0) {
    isIncome = true;
    amount = Math.abs(amount);
  }

  const category = toTitleCase(cleanSpaces(removeEmojis(String(parts[1]))));
  const category_emojis = extractEmojis(String(parts[1]));
  if (category_emojis) {
    // Emoji in category, assign it to the emoji map
    CATEGORY_EMOJIS_MAP[category] = category_emojis[0];
    SCRIPT_PROPERTIES.setProperty(
      CATEGORY_EMOJIS_KEY,
      JSON.stringify(CATEGORY_EMOJIS_MAP),
    );
  }

  const subcategory = parts[2]
    ? toTitleCase(cleanSpaces(removeEmojis(String(parts[2]))))
    : null;
  const description = parts[3]
    ? toTitleCase(cleanSpaces(String(parts[3])))
    : null;

  const targetSheet = isIncome ? INCOME_SHEET : EXPENSES_SHEET;
  try {
    writeExpense([amount, category, subcategory, description], targetSheet);
  } catch (e) {
    debugLog("Error writing to sheet " + targetSheet + ": " + e.message);
    sendMessage(
      chatId,
      "❌ Error saving entry. Please check if the sheet exists.",
    );
    return;
  }

  const catLine = subcategory ? `${category} / ${subcategory}` : category;
  const descLine = description || subcategory || category;

  if (isIncome) {
    sendMessage(chatId, message_income_confirmation(descLine, amount, catLine));
  } else {
    sendMessage(
      chatId,
      message_expense_confirmation(descLine, amount, catLine),
    );
  }
}

/**
 * Handles the /invest command: parses input, fetches FX rate and stock price,
 * writes to Stock Txns sheet, and sends confirmation.
 *
 * @param {string} command - The full invest command string.
 * @param {string} chatId - Telegram chat ID for response.
 */
function handleInvestCommand(command, chatId) {
  let parsed;

  try {
    parsed = parseInvestCommand(command);
  } catch (e) {
    sendMessage(chatId, `❌ ${e.message}`);
    return;
  }

  const { operation, currency, ticker, shares } = parsed;

  // Fetch FX rate
  let fxRate;
  try {
    fxRate = getFxRate(currency);
  } catch (e) {
    sendMessage(chatId, `❌ ${e.message}`);
    return;
  }

  // Fetch stock price
  const stockPrice = getStockPrice(ticker);

  // Construct row: [operation, currency, fx_rate, ticker, shares, price]
  const row = [
    new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    operation,
    currency,
    fxRate,
    ticker,
    shares,
    stockPrice !== null ? stockPrice : "",
  ];

  try {
    writeToSheet(row, STOCK_TXNS_SHEET, false);
  } catch (e) {
    debugLog("Error writing to Stock Txns sheet: " + e.message);
    sendMessage(
      chatId,
      "❌ Error saving transaction. Please check if the 'Stock Txns' sheet exists.",
    );
    return;
  }

  // Send confirmation message
  const confirmation = invest_confirmation_message(
    operation,
    currency,
    ticker,
    shares,
    fxRate,
    stockPrice,
  );
  sendMessage(chatId, confirmation);
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
      (title = "<b>🔎    💼  Real-Time Stock Brief  💼    🔍</b>\n"),
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
          false,
        );
      } else {
        const last_row =
          getLastRowIndex(SHEET_ALIAS_TO_NAME_MAP["TRACK"], "edit_sheet") + 1;
        writeToSheet(
          [track_object.ticker],
          SHEET_ALIAS_TO_NAME_MAP["TRACK"],
          false,
        );
        Utilities.sleep(3000);
        const targetless_row = readRowByIndex(
          SHEET_ALIAS_TO_NAME_MAP["TRACK"],
          last_row,
          1,
          3,
          "edit_sheet",
        );
        price = targetless_row[2];
        overwriteRow(
          last_row,
          [track_object.ticker, price],
          (SHEET_ALIAS_TO_NAME_MAP["TRACK"] = "TRACK"),
        );
      }
    } catch (e) {
      debugLog(e);
      sendMessage(chatId, "Command must match: /track {TICKER} {PRICE}");
    }

    sendMessage(
      chatId,
      stock_tracked_confirmation_message(track_object.ticker, price),
    );
  } else if (command.startsWith("/invest")) {
    handleInvestCommand(command, chatId);
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
