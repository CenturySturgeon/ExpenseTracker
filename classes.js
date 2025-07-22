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
