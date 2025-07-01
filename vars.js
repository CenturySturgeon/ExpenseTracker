function message_expense_confirmation(name_or_description, amount, category_line) {
  return `💸 Expense recorded 💸\n\n📝 *${name_or_description}*\n💰 $${amount.toFixed(
      2
    )}\n📂 ${category_line}`
}