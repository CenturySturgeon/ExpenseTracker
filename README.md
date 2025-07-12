# ExpenseTracker
The main repository for the telegram expense tracker bot.

## 🛠️ **Overview**

You will:

1. Set up a Google Sheet to store the data.
2. Write a Google Apps Script to receive messages from Telegram and store them.
3. Set up a Telegram bot using BotFather.
4. Set up a Google Apps Script Web App to respond to Telegram Webhook calls.
5. Enable commands to get totals for **day**, **week**, and **month**.

---

## 📄 **1. Set Up Google Sheet**

Create a Google Sheet with the following headers:

```
Timestamp | Expense Name | Amount | Category | Subcategory | Description
```

Name the sheet tab as: `EXPENSES`

---

## 🤖 **2. Create a Telegram Bot**

1. Open Telegram and search for **BotFather**.
2. Send `/newbot` and follow the instructions.
3. BotFather will give you a **bot token** (keep this safe).

---

## 🧠 **3. Adding Google Apps Script Code**

1. Create a new project.
2. Paste the code from `app.js` into `app.gs` file.
3. Create the `.gs` files and paste the code of all the other `.js` files.

## 🌐 **4. Deploy as Web App**

1. Click **Deploy > Manage Deployments > New Deployment**
2. Choose **"Web App"**
3. Set:
   * **Execute as:** Me
   * **Who has access:** Anyone (or Anyone with link)
4. Click **Deploy**, and copy the **Web App URL**.

## 🔗 **5. Set Telegram Webhook**

Run this URL in your browser (replace with your actual Web App URL and bot token):
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_WEB_APP_URL>
```

Example:
```
https://api.telegram.org/bot123456:ABCxyz/setWebhook?url=https://script.google.com/macros/s/EXAMPLE_URL/exec
```

## 🔒 Final Notes:

* Ensure your Google Sheet and script project are in the same Google account.
* If you want multiple users to use the bot, add logic to store `chat_id` with each row.

Would you like me to prepare a ready-to-copy template Google Sheet and share the link, or help you enhance the bot further (e.g. support categories, summaries, etc.)?


## 🛡️ How to Be Safer

Here are some optional improvements:

### 1. **Validate Telegram Requests**

Use Telegram’s `secret_token` webhook feature to confirm the request really came from Telegram.

### 2. **Restrict by Chat ID**

Only allow known user(s) by checking `message.chat.id` inside your script.

```javascript
const ALLOWED_CHAT_IDS = [123456789]; // Replace with your own chat ID

function handleExpenseEntry(text, chatId) {
  if (!ALLOWED_CHAT_IDS.includes(chatId)) {
    sendMessage(chatId, "Access denied.");
    return;
  }

  // Continue as normal
}
```

---

## 🔁 Flow Diagram (Simplified)

```
[Telegram User Message]
        ↓
[Telegram sends POST to Web App URL]
        ↓
[Google Apps Script]
        ↓
[doPost(e)]
        ↓
[Parse text]
        ↓
[Call handleExpenseEntry() or handleCommand()]
        ↓
[Log to Sheet or Send Response]
```

## ✅ Summary
* `doPost(e)` is the entry point for Telegram messages.
* Apps Script automatically runs `doPost()` when Telegram sends a POST.
* You write your logic inside `doPost()` to call the appropriate helper functions.

## Telegram Webhook Commands

```
# Set webhook
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
     -H "Content-Type: application/json" \
     -d '{
          "url": "https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec?token=<YOUR_SECRET_TOKEN>"
        }'


# Delete webhook
curl https://api.telegram.org/bot<BOT_TOKEN_HERE>/deleteWebhook

# Get webhook
curl https://api.telegram.org/bot<TELEGRAM_TOKEN>/getWebhookInfo
```

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from curl!", "time":"2025-07-04T12:00:00Z"}' \
  "https://script.google.com/macros/s/your-script-id/exec"
```