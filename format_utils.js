/**
 * Extracts the first number from a given string and converts it to a number type.
 *
 * Supports integers, decimal numbers, and negative values.
 * Throws an error if no numeric value is found in the input string.
 *
 * @param {string} str - The input string containing a number.
 * @returns {number} The extracted numeric value.
 * @throws {Error} If no number is found in the string.
 */
function extractNumber(str) {
  const match = str.match(/-?\d+(\.\d+)?/); // matches integers and decimals, including negative numbers
  if (!match) {
    throw new Error("No number found in the string");
  }
  return Number(match[0]);
}

/**
 * Cleans up a string by removing leading and trailing whitespace
 * and replacing multiple internal spaces with a single space.
 *
 * @param {string} str - The input string to clean.
 * @returns {string} A cleaned string with trimmed edges and normalized spacing.
 *
 * @example
 * cleanSpaces("   Hello    World   "); // "Hello World"
 * cleanSpaces("This     is   a   test"); // "This is a test"
 */
function cleanSpaces(str) {
  return str
    .replace(/^\s+|\s+$/g, "") // Trim leading and trailing whitespace
    .replace(/\s{2,}/g, " "); // Replace two or more spaces with a single space
}

/**
 * Extracts all individual emoji characters from a given string.
 *
 * @param {string} str - The input string to extract emojis from.
 * @returns {string[]} Null or an array of emoji characters found in the string.
 */
function extractEmojis(str) {
  const emojiRegex = /\p{Emoji}/gu;
  return str.match(emojiRegex) || null;
}

/**
 * Removes all emoji characters from a given string.
 *
 * @param {string} str - The input string to process.
 * @returns {string} The input string with all emojis removed.
 */
function removeEmojis(str) {
  const emojiRegex = /\p{Emoji}/gu;
  return str.replace(emojiRegex, "");
}

/**
 * Converts the provided string into title case.
 * @param {string} str  - The string to convert.
 * @returns {number} The string argument in title case.
 */
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Returns the keys of an object sorted in alphabetical order.
 *
 * @param {Object} obj - The object whose keys are to be retrieved and sorted.
 * @returns {string[]} An array of the object's keys sorted alphabetically.
 */
function getObjectSortedKeys(obj) {
  const sortedKeys = Object.keys(obj).sort(); // Sort the keys alphabetically
  return sortedKeys;
}

/**
 * Maps categories to their respective subcategories from a 2D array.
 *
 * The first row of the input data is assumed to contain category names.
 * Each subsequent row contains subcategories aligned by column to their respective categories.
 * Empty strings and "#N/A" values are ignored in subcategories.
 *
 * @param {string[][]} data - A 2D array where the first row contains category names and subsequent rows contain subcategories.
 * @returns {Object} An object mapping each non-empty category to an array of its valid subcategories.
 */
function mapCategoriesToSubcategories(data) {
  const result = {};
  const categories = data[0];

  for (let col = 0; col < categories.length; col++) {
    const category = categories[col];

    if (!category) continue;
    const subcategories = [];

    for (let row = 1; row < data.length; row++) {
      const sub = data[row][col];
      if (sub && sub !== "#N/A") {
        subcategories.push(sub);
      }
    }

    // Only include if there's at least one subcategory
    if (subcategories.length) {
      result[category] = subcategories;
    } else {
      result[category] = [];
    }
  }

  return result;
}

/**
 * Formats a number as US currency.
 *
 * Converts a numeric value to a string formatted in US dollars,
 * including two decimal places and comma separators for thousands.
 *
 * @param {number || string} amount - The numeric value to format.
 * @returns {string} The formatted currency string (e.g., "$1,234.56").
 */
function currency_format(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Transforms a list of expense arrays into a hierarchical map of Category objects.
 * @param {Array<Array<string | number>>} expenses - A list of lists, where each inner list is [month_name, category, subcategory, amount].
 * @returns {Map<string, Category>} A Map where keys are main category names and values are Category objects.
 */
function transformExpensesToCategoriesMap(expenses) {
  const categoriesMap = new Map();

  expenses.forEach((expense) => {
    const [, categoryName, subcategoryName, amount] = expense;

    // Ensure the amount is a number for calculations
    const parsedAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(parsedAmount)) {
      return; // Skip this expense if amount is not a valid number
    }

    // 1. Handle the Main Category
    if (!categoriesMap.has(categoryName)) {
      // Create a new main category if it doesn't exist
      const emoji = CATEGORY_EMOJIS_MAP[categoryName] || null; // Assign emoji
      categoriesMap.set(categoryName, new Category(categoryName, emoji));
    }
    const mainCategory = categoriesMap.get(categoryName);
    mainCategory.addAmount(parsedAmount); // Add amount to main category total

    // 2. Handle the Subcategory
    if (subcategoryName) {
      // Only process if a subcategory is provided
      const subcategory = mainCategory.getOrCreateSubcategory(subcategoryName);
      subcategory.addAmount(parsedAmount); // Add amount to subcategory total
    }
  });

  return categoriesMap;
}

/**
 * Parses a tracking command in the format "/track TICKER, PRICE".
 * PRICE is optional. TICKER is required.
 * @param {string} message - The input string containing the tracking command.
 * @returns {{ ticker: string, price?: number }} An object with `ticker` and optional `price`.
 * @throws {Error} If parsing fails with specific error messages.
 */
function parseTrackCommand(message) {
  if (!message.startsWith("/track")) {
    throw new Error("Command must start with '/track'");
  }

  const commandBody = cleanSpaces(message.slice(6).trim()); // Removes '/track'
  if (!commandBody) {
    throw new Error(
      "Ticker is missing. Format should be '/track TICKER PRICE'",
    );
  }

  const parts = commandBody.split(" ");
  const tickerPart = parts[0].trim();
  if (!tickerPart) {
    throw new Error("Ticker is missing or empty.");
  }

  const tickerMatch = tickerPart.match(/^[A-Za-z.\-]+$/);
  if (!tickerMatch) {
    throw new Error(`Invalid ticker format: '${tickerPart}'`);
  }

  const ticker = tickerPart.toUpperCase();

  let price;
  if (parts.length > 1) {
    const pricePart = parts[1].trim();
    try {
      price = extractNumber(pricePart);
      if (price < 0) {
        throw new Error("Price must be a non-negative number.");
      }
    } catch (e) {
      throw new Error(`Invalid price format: '${pricePart}'. ${e.message}`);
    }
  }

  return price !== undefined ? { ticker, price } : { ticker };
}

/**
 * Parses an invest command in the format "/invest {Operation} {Currency} {Ticker} {Shares}".
 * Operation must be BUY or SELL, Currency must be USD/CAD/MXN/EUR,
 * Ticker must match valid pattern, Shares must be positive number.
 *
 * @param {string} message - The input string containing the invest command.
 * @returns {{ operation: string, currency: string, ticker: string, shares: number }}
 *   An object with validated operation, currency, ticker, and shares.
 * @throws {Error} If parsing fails with specific error messages.
 */
function parseInvestCommand(message) {
  if (!message.startsWith("/invest")) {
    throw new Error("Command must start with '/invest'");
  }

  const commandBody = cleanSpaces(message.slice(7).trim()); // Removes '/invest'
  const parts = commandBody.split(",");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid format. Use: /invest {Operation}, {Ticker}, {Shares}",
    );
  }

  // Validate operation
  const operation = parts[0].toUpperCase();
  if (operation !== "BUY" && operation !== "SELL") {
    throw new Error(
      `Invalid operation: '${parts[0]}'. Must be BUY or SELL.`,
    );
  }

  // Validate currency
  // const currency = parts[1].toUpperCase();
  // const validCurrencies = ["USD", "CAD", "MXN", "EUR"];
  // if (!validCurrencies.includes(currency)) {
  //   throw new Error(
  //     `Invalid currency: '${parts[1]}'. Must be one of ${validCurrencies.join("/")}.`,
  //   );
  // }

  // Validate ticker
  const tickerPart = parts[1].trim();
  const tickerMatch = tickerPart.match(/^[A-Za-z.\-]+$/);
  if (!tickerMatch) {
    throw new Error(`Invalid ticker format: '${tickerPart}'`);
  }
  const ticker = tickerPart.toUpperCase();

  // Validate shares
  const sharesPart = parts[2].trim();
  let shares;
  try {
    shares = extractNumber(sharesPart);
    if (shares <= 0) {
      throw new Error("Shares must be a positive number.");
    }
  } catch (e) {
    throw new Error(`Invalid shares format: '${sharesPart}'. ${e.message}`);
  }

  return { operation, ticker, shares };
}

