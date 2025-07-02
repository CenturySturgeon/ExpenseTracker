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
 * * @param {string} alias Username alias.
 * @return {string} The formatted message the bot will reply with.
 */
function start_command_message(
  alias = ''
) {
  return `
✨ Hi there${', ' + alias}! I'm your personal expense assistant ✨  

Here's what I can help you with:  
📌 Track daily expenses  
📊 Summarize your monthly spending  
🎯 Keep you on budget and reaching your goals

Type /help to see what I can do, or just send me an expense in the following format to get started:
**Expense Name, Amount, Category,	Subcategory (optional),	Description (optional)**
`;
}

/**
 * Returns the Telegram message when user prompts for help.
 * @return {string} The formatted message the bot will reply with.
 */
function help_command_message(
) {
  return `
🛠 Available Commands 🛠

- /start Start the bot and see a welcome message  
- /help Show this list of commands
- /month View a summary of your spending for the current month _(not available)_
- /budget Check your budget alignment for the month and year _(not available)_
- /cats Get a list of all your logged categories _(not available)_

💸 Submitting an Expense 💸

Just send me a message with the following fields separated by commas:  
**Expense Name, Amount, Category, Subcategory (optional), Description (optional)**

Example:
Apples, 50, Food, Groceries, Green apples

**More features coming soon!** 🚀
`;
}