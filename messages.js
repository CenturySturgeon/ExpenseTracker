/**
 * Telegram confirmation message after an expense has been logged.
 * @param {string} name_or_description Name/Description of the expense.
 * @param {number} amount The amount spent.
 * @param {string} category The category/subcategory line.
 * @return {string} The formatted message the bot will reply with.
 */
function message_expense_confirmation(name_or_description, amount, category) {
  return `💸 Expense recorded 💸

📝 *${name_or_description}*
💰 $${amount.toFixed(2)}
📂 ${category}`;
}


/**
 * Telegram confirmation message after an expense has been logged.
 * @param {string} name_or_description Name/Description of the expense.
 * @param {number} amount The amount spent.
 * @param {string} category The category/subcategory line.
 * @return {string} The formatted message the bot will reply with.
 */
function month_command_message(month_name, total_spent, top_category, total_top_cat, top_subcategory, total_top_subcat) {
  return `📊 *${toTitleCase(month_name)} Expense Summary* 📊

💸 *Total Spent:* $${Number(total_spent).toFixed(2)}

📋 *Top Category:* ${top_category} $${Number(total_top_cat)}
📌 *Top Subcategory:* ${top_subcategory} $${Number(total_top_subcat)}

🌱 Little strokes fell great oaks 🌱`;
}


/**
 * Returns the Telegram message when initializing conversation with bot.
 * * @param {string} alias Username alias.
 * @return {string} The formatted message the bot will reply with.
 */
function start_command_message(alias = "") {
  return `
✨ Hi there${", " + alias}! I'm your personal expense assistant ✨  

Here's what I can help you with:  
📌 Track daily expenses  
📊 Summarize your monthly spending  
🎯 Keep you on budget and reaching your goals

Type /help to see what I can do! 🔍
`;
}

/**
 * Returns the Telegram message when user prompts for help.
 * @return {string} The formatted message the bot will reply with.
 */
function help_command_message() {
  return `    🧰 *Available Commands* 🧰

  📅  /month View a summary of your spending for the current month

  🗂️  /cats Get a list of all your logged categories

  ⚖️  /budget Check your budget alignment for the month and year _\\(not available\\)_

  📊  /stocks Gets a summary of the tracked stocks _\\(not available\\)_

  🏛️  /invest Gets a summary of your investment portfolio _\\(not available\\)_

  ℹ️  /help Show this list of commands


💸 *Submitting an Expense* 💸

Send me a message with the following fields separated by commas:

  • *Expense Name*
  • *Amount*
  • *Category*
  • Subcategory _\\(optional\\)_
  • Description _\\(optional\\)_

*Example:*  
Apples, $50, Food 🍗, Groceries, Green apples

_Emojis on the category field will be assigned as the category emoji_

More features coming soon\\! 💹
`;
}

/**
 * Telegram message listing the user's expense categories and subcategories.
 * @param {Object} categories An object where keys are category names and values are arrays of subcategory names.
 * @return {string} The formatted message the bot will reply with.
 */
function categories_list_message() {
  const categories = mapCategoriesToSubcategories(readDataFromSheet(CATEGORIES_SHEET));
  const sorted_cat_obj_keys = getObjectSortedKeys(categories);

  let message = `🗂️ *Your Expense Categories & Subcategories* 🗂️\n\n`;

  for (const category of sorted_cat_obj_keys) {
    category_emoji = category in CATEGORY_EMOJIS_MAP ? ' '+ CATEGORY_EMOJIS_MAP[category] + ' ' : '';
    message += category_emoji + `*${category}*` + '\n';
    const subcategories = categories[category]
    if (subcategories.length > 0) {
      for (const sub of subcategories) {
        message += `  • ${sub}\n`;
      }
    } else {
      message += `  • _No subcategories_\n`;
    }
    message += `\n`;
  }

  message += `Use these as a reference anytime you're logging expenses! 📌`;
  return message;
}
