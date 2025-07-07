function doPost(e) {
  // This is the main function the telegram bot posts to using the webhook

  // Parse the incoming Telegram update
  let update;
  try {
    update = JSON.parse(e.postData.contents);
    debugLog("Received request: " + JSON.stringify(update));
  } catch (error) {
    debugLog("Error parsing Telegram update: " + error.message);
    return respondOk("Error: Invalid JSON payload");
  }

  // Extract the unique update_id
  const updateId = update.update_id;
  if (!updateId) {
    debugLog("No update_id found in payload.");
    return respondOk("Error: No update_id provided");
  }

  const lastProcessedUpdateId =
    SCRIPT_PROPERTIES.getProperty(LAST_UPDATE_ID_KEY);

  // Check for duplicates
  if (
    !DEBUG_MODE &&
    lastProcessedUpdateId &&
    Number(updateId) <= Number(lastProcessedUpdateId)
  ) {
    DEBUG_MODE &&
      writeToSheet(
        ["Duplicate or old update_id received. Ignoring: " + updateId],
        LOG_SHEET
      );
    // Important: Always return a 200 OK even for duplicates,
    // otherwise Telegram will keep retrying.
    return respondOk("OK - Duplicate update ignored");
  }

  try {
    const chat_id = authenticate(
      update.message ? update.message.chat.id : null
    );
    handleUpdate(update, chat_id);
  } catch (error) {
    debugLog("Handling Error: " + error.message);
    return respondOk("Error processing request: " + error.message);
  }

  // After successfully writing, store the new lastProcessedUpdateId
  try {
    !DEBUG_MODE &&
      SCRIPT_PROPERTIES.setProperty(LAST_UPDATE_ID_KEY, String(updateId));

    debugLog("Successful Run");
    return respondOk();
  } catch (error) {
    debugLog("Error processing webhook or writing to sheet: " + error.message);
    return respondOk("Error processing request: " + error.message);
  }
}
