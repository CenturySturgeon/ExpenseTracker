function sendMessage(chatId: string, message: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const payload = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  };
  UrlFetchApp.fetch(url, payload);
}

function writeToSheet(row, sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return respondOk("Error: Sheet not found.");
  }
  const row_with_timestamp = [new Date(), ...row];
  sheet.appendRow(row_with_timestamp);
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function message_expense_confirmation(
  name_or_description: string,
  amount: number,
  category_line: string
) {
  return `💸 Expense recorded 💸\n\n📝 *${name_or_description}*\n💰 $${amount.toFixed(
    2
  )}\n📂 ${category_line}`;
}
