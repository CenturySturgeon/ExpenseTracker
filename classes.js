class Currency {
  constructor(value, name, emoji = '') {
    if (typeof value !== 'number') {
      throw new TypeError("Value must be a number");
    }
    if (typeof name !== 'string') {
      throw new TypeError("Name must be a string");
    }
    if (typeof emoji !== 'string') {
      throw new TypeError("Emoji must be a string");
    }

    this.value = value;
    this.name = name;
    this.emoji = emoji;
    this.display_str = `${this.emoji} ${this.name} ${currency_format(this.value)}`.trim();
  }
}

class Stock {
  constructor(stock_name, plus_minus_percent, thresholds = { low: -10, warning: -3, high: 5 }) {
    this.stock_name = stock_name;
    this.plus_minus_percent = Number(plus_minus_percent);
    this.thresholds = thresholds;
  }

  // Returns the direction icon based on % change
  getDirectionIcon() {
    if (this.plus_minus_percent > 1) return '🟢';
    if (this.plus_minus_percent < -1) return '🔴';
    return '⚪';
  }

  // Returns the status icon based on thresholds
  getStatusIcon() {
    const { low, warning, high } = this.thresholds;
    if (this.plus_minus_percent <= low) return '🔴';
    if (this.plus_minus_percent <= warning) return '🟡';
    if (this.plus_minus_percent >= high) return '';
    return '';
  }

  // Returns formatted % change (e.g. "-1.23%")
  getFormattedChange() {
    return `${this.plus_minus_percent.toFixed(2)}%`;
  }

  // Returns a padded display line (used in message formatter)
  toDisplayLine(namePad = 6, changePad = 7) {
    const name = this.stock_name.padEnd(namePad, ' ');
    const change = this.getFormattedChange().padStart(changePad, ' ');
    const dirIcon = this.getDirectionIcon();
    const statusIcon = this.getStatusIcon();
    return `    ${dirIcon} ${name}: ${change} ${statusIcon}`;
  }
}


class Category {
    constructor(name, emoji = null) {
        this.name = name;
        this.emoji = emoji || null; // Use provided emoji or default to null
        this.total_spent = 0;
        // Map for subcategories for efficient lookup by name
        // This will store other Category objects
        this._subcategories = new Map();
    }

    /**
     * Adds an amount to the total_spent for this category.
     * @param {number} amount
     */
    addAmount(amount) {
        if (typeof amount === 'number') {
            this.total_spent += amount;
        }
    }

    /**
     * Gets or creates a subcategory.
     * @param {string} subcategoryName
     * @returns {Category} The subcategory object.
     */
    getOrCreateSubcategory(subcategoryName) {
        if (!this._subcategories.has(subcategoryName)) {
            // Subcategories usually don't have their own specific emojis unless defined
            this._subcategories.set(subcategoryName, new Category(subcategoryName));
        }
        return this._subcategories.get(subcategoryName);
    }

    /**
     * Returns the subcategories as a list (array) of Category objects.
     * This is useful for iteration or display.
     * @returns {Array<Category>}
     */
    get subcategories() {
        return Array.from(this._subcategories.values());
    }

    get subcategoriesMap() {
        return this._subcategories;
    }
}