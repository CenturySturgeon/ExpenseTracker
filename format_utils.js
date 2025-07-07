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
    .replace(/^\s+|\s+$/g, '')   // Trim leading and trailing whitespace
    .replace(/\s{2,}/g, ' ');    // Replace two or more spaces with a single space
}

/**
 * Extracts all individual emoji characters from a given string.
 *
 * @param {string} str - The input string to extract emojis from.
 * @returns {string[]} Null or an array of emoji characters found in the string.
 */
function extractEmojis(str) {
  const emojiRegex = /\p{Emoji}/gu;
  return str.match(emojiRegex) || [];
}


/**
 * Removes all emoji characters from a given string.
 *
 * @param {string} str - The input string to process.
 * @returns {string} The input string with all emojis removed.
 */
function removeEmojis(str) {
  const emojiRegex = /\p{Emoji}/gu;
  return str.replace(emojiRegex, '');
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
