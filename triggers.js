function daily(){
    send_daily_stock_summary_message(Object.keys(CHAT_TO_USER)[0],title = "<b>📫    📰  Daily Pre-Market Overview  📰    📫</b>\n", true);
}

function send_daily_stock_summary_message(chatId, title, phrase = false){
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
          CURRENCY_EMOJIS_MAP[currency[1]] ?? ""
        )
      );
    }

    sendMessage(
      chatId,
      stock_summary_message(
        title,
        currencies,
        stocks,
        phrase
      ),
      true,
      "HTML"
    );
}