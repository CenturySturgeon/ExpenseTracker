/**
 * Sends a message to a user via a Telegram bot.
 * @param {string} chatId Chat/User who'll receive the message.
 * @param {string} message Message that will be sent.
 */
function sendMessage(chatId, message, parseMode = "Markdown") {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: parseMode,
    }),
  };

  UrlFetchApp.fetch(url, payload);
}


/**
 * Verifies the origin chat id is authorized to perform actions.
 * @param {string} chatId  - Telegram chat ID that originated the request.
 */
function authenticate(chatId, requestToken) {
  if (chatId == null || !(String(chatId) in CHAT_TO_USER)) {
    // catches bad requestToken
    if (requestToken != SECRET_TOKEN) {
      debugLog(`Not allowed`);
      throw new Error(`Not allowed`);
    }
    // catches both null and undefined chatId
    debugLog(`Unauthorized telegram user: ${chatId}`);
    throw new Error(`Unauthorized telegram user: ${chatId}`);
  }
}


// API Return Functions
function respondOk(message = "Ok") {
  // For Telegram webhooks, 200 OK is best to prevent retries.
  return HtmlService.createHtmlOutput(message);
}


function respondJson(obj) {
  return HtmlService.createHtmlOutput(JSON.stringify(obj));
}
