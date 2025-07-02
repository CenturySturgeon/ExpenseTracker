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

/**
 * Returns the Telegram message when initializing conversation with bot.
 * @return {string} The formatted message the bot will reply with.
 */
function start_command_message(
) {
  return `
✨ *Hi there! I'm your personal expense assistant.*  
I'll help you take control of your money — simply and confidently.

Here's what I can help you with:  
📌 Track daily expenses  
📊 Summarize your spending  
🎯 Keep you on budget and reaching your goals

Type /help to see what I can do, or just send me an amount to get started.
`;
}