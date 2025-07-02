/**
 * Telegram confirmation message after an expense has been logged.
 * @param {string} name_or_description Name/Description of the expense.
 * @param {number} amount The amount spent.
 * @param {string} category The category/subcategory line.
 * @return {string} The formatted message the bot will reply with.
 */
function message_expense_confirmation(
  name_or_description,
  amount,
  category
) {
  return `💸 Expense recorded 💸

📝 *${name_or_description}*
💰 $${amount.toFixed(2)}
📂 ${category}`;
}

/**
 * Returns the Telegram message when initializing conversation with bot.
 * @return {string} The formatted message the bot will reply with.
 */
function start_command_message(
) {
  return `
✨ Hi there! I'm your personal expense assistant ✨  

Here's what I can help you with:  
📌 Track daily expenses  
📊 Summarize your monthly spending  
🎯 Keep you on budget and reaching your goals

Type /help to see what I can do, or just send me an expense in the following format to get started:

Expense Name, Amount, Category,	Subcategory,	Description
`;
}