/**
 * Telegram confirmation message after an expense has been logged.
 * @param {string} name_or_description Name/Description of the expense.
 * @param {number} amount The amount spent.
 * @param {string} category The category/subcategory line.
 * @return {string} The formatted message the bot will reply with.
 */
function message_expense_confirmation(
  name_or_description: string,
  amount: number,
  category: string
) {
  return `💸 Expense recorded 💸\n\n📝 *${name_or_description}*\n💰 $${amount.toFixed(
    2
  )}\n📂 ${category}`;
}