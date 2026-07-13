function daily() {
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Run only if trigger is active and it's a weekday (Mon-Fri)
  if (
    TRIGGERS_MAP["daily_stock_summary"] === true &&
    today >= 1 &&
    today <= 5
  ) {
    const maxAttempts = 3;
    const chatId = Object.keys(CHAT_TO_USER)[0];
    const title = "<b>📬    📰  Daily Pre-Market Overview  📰    📬</b>\n";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        send_daily_stock_summary_message(chatId, title, true);
        break; // Success — exit loop
      } catch (error) {
        Logger.log(`❌ Attempt ${attempt} failed: ${error}`);
      }
    }
  }
}

function send_daily_stock_summary_message(chatId, title, phrase = false) {
  let tracked_stocks = readDataFromSheet("TRACK", "edit_sheet").slice(2);
  let raw_currencies = readDataFromSheet("CURRENCIES", "edit_sheet").slice(1);
  let stocks = [];
  let currencies = [];
  for (const stock of tracked_stocks) {
    stocks.push(new Stock(stock[0], (Number(stock[3]) * 100).toFixed(2)));
  }
  for (const currency of raw_currencies) {
    currencies.push(
      new Currency(
        Number(currency[2]),
        currency[1],
        CURRENCY_EMOJIS_MAP[currency[1]] ?? "",
      ),
    );
  }

  sendMessage(
    chatId,
    stock_summary_message(title, currencies, stocks, phrase),
    true,
    "HTML",
  );
}
