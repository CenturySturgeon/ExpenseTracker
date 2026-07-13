/**
 * Telegram confirmation message after an income has been logged.
 * @param {string} name_or_description Name/Description of the income.
 * @param {number} amount The amount earned.
 * @param {string} category The category/subcategory line.
 * 
 * @return {string} The formatted message the bot will reply with.
 */
function message_income_confirmation(name_or_description, amount, category) {
  return `💰 Income recorded 💰

📝 *${name_or_description}*
💰 ${currency_format(amount)}
📂 ${category}`;
}

/**
 * Returns a cached motivational quote, fetching from zenquotes.io if needed.
 * Caches the quote for 24 hours to limit API calls.
 *
 * @return {string} The motivational quote with leaf emoji styling.
 */
function getCachedQuote() {
  const cache = PropertiesService.getScriptProperties();
  const cachedQuote = cache.getProperty(QUOTE_CACHE_KEY);
  const timestampStr = cache.getProperty(QUOTE_TIMESTAMP_KEY);

  // Check if we have a valid cached quote (less than 24 hours old)
  if (cachedQuote && timestampStr) {
    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;

    if ((now - timestamp) < twentyFourHoursMs) {
      return `🌱 ${cachedQuote} 🌱`;
    }
  }

  // Fallback quote in case of API failure
  const fallbackQuote = "Little strokes fell great oaks";

  try {
    const response = UrlFetchApp.fetch("https://zenquotes.io/api/random");
    const data = JSON.parse(response.getContentText());
    if (data && data.length > 0 && data[0].q !=="" ) {
      const quote = `${data[0].q} — ${data[0].a}`;
      // Cache the new quote and timestamp
      cache.setProperty(QUOTE_CACHE_KEY, quote);
      cache.setProperty(QUOTE_TIMESTAMP_KEY, Date.now().toString());
      return `🌱 ${quote} 🌱`;
    }
  } catch (error) {
    // API failed, use fallback quote
    debugLog("Failed to fetch motivational quote: " + error.message);
  }

  return `🌱 ${fallbackQuote} 🌱`;
}

/**
 * Telegram confirmation message after an expense has been logged.
 * @param {string} name_or_description Name/Description of the expense.
 * @param {number} amount The amount spent.
 * @param {string} category The category/subcategory line.
 * 
 * @return {string} The formatted message the bot will reply with.
 */
function message_expense_confirmation(name_or_description, amount, category) {
  return `💸 Expense recorded 💸

📝 *${name_or_description}*
💸 ${currency_format(amount)}
📂 ${category}`;
}

/**
 * Telegram confirmation message after an expense has been logged.
 * @param {string[]} month_summary An array comprised of the following params.
 * @param {number} total_spent The amount spent during the month.
 * @param {string} top_category The category where the most amount of money was spent.
 * @param {number} total_top_cat The amount spent for top_category.
 * @param {string} top_subcategory The top category's subcategory where the most amount of money was spent.
 * @param {number} total_top_subcat The amount spent for top_subcategory.
 *
 * @return {string} The formatted message the bot will reply with.
 */
function month_command_message(month_summary) {
  [total_spent, top_category, total_top_cat, top_subcategory, total_top_subcat] = month_summary
  return `
📌 *Top Category:*   ${top_category}
📍 *Top Subcategory:*   ${top_subcategory}


💸 *Total Spent:*   ${currency_format(total_spent)}

${getCachedQuote()}`;
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

  📖  /report Get the current month's spending log

  🗂️  /cats Get a list of all your logged categories

  📊  /stocks Gets a summary of your tracked stocks

  📈  /track {Ticker} {Price} Monitors a stock by ticker and a reference price 

  💳  /spending {Category}, {Subcategory} Gets the total amount spent for the given category, subcategory pair _\(not available\)_

  🏛️  /invest Gets a summary of your investment portfolio _\(not available\)_

  ℹ️  /help Show this list of commands


💸 *Submitting an Expense* 💸

Send me a message with the following fields separated by commas:

  • *Amount*
  • *Category*
  • Subcategory _\\(optional\\)_
  • Description _\\(optional\\)_

*Example:*  
$50, Food 🍗, Groceries, Green apples

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
        message += `       • ${sub}\n`;
      }
    } else {
      message += `       • _No subcategories_\n`;
      return message;
    }
    message += `\n`;
  }

  message += `Use these as a reference anytime you're logging expenses! 📌`;
  return message;
}


function month_spending_message(expenses){
  const cat_map = transformExpensesToCategoriesMap(expenses);
  let message = `📅    📖  *${MONTH_NAME}'s Spending Log*  📖    📅\n\n`;
  
  for (const [categoryName, categoryObject] of cat_map) {
    const emoji = categoryObject.emoji ? categoryObject.emoji: '•';
    
    message += ` ${emoji} ${categoryName}:   ${currency_format(categoryObject.total_spent)}\n`;
    
    // And again, access subcategories
    categoryObject.subcategories.forEach(sub => {
        message += `       • ${sub.name}:   ${currency_format(sub.total_spent)}\n`;
    });

    message += '\n'
  }

  return message;
}


function stock_summary_message(title, currencies, stocks, phrase = false) {
  const lines = [title];
  let currencies_block = '';
  for (const currency of currencies){
    currencies_block += `  ${currency.display_str}\n`
  }
  lines.push(currencies_block);

  // Determine padding values based on the longest name and change
  const namePad = Math.max(...stocks.map(s => s.stock_name.length));
  const changePad = Math.max(...stocks.map(s => s.getFormattedChange().length));

  // Monospaced block
  for (const stock of stocks) {
    lines.push(`<code class="monospace-text">` + stock.toDisplayLine(namePad, changePad) + `</code>`);
  }

  phrase && lines.push('\n🌷 Courage is not the towering oak that sees storms come and go; it is the fragile blossom that opens in the snow. 🌷');
  return lines.join('\n');
}


/**
 * Telegram confirmation message after a stock has been tracked.
 * @param {string} ticker The ticker symbol of the stock.
 * @param {number} referencePrice The price per share at the time of purchase.
 * @return {string} The formatted one-line message the bot will reply with.
 */
function stock_tracked_confirmation_message(ticker, referencePrice) {
  return `🚀  Tracking *${ticker}*  🚀
🎯  Target:  ${currency_format(referencePrice)}`;
}
