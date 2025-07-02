function doPost(e) {
  // This is the main function the telegram bot posts to using the webhook

  // Parse the incoming Telegram update
  let update;
  try {
    update = JSON.parse(e.postData.contents);
    DEBUG_MODE &&
      writeToSheet(
        ["Received request: " + JSON.stringify(update)],
        LOG_SHEET
      );
  } catch (error) {
    DEBUG_MODE &&
      writeToSheet(
        ["Error parsing Telegram update: " + error.message],
        LOG_SHEET
      );
    return respondOk("Error: Invalid JSON payload");
  }

  // Extract the unique update_id
  const updateId = update.update_id;
  if (!updateId) {
    DEBUG_MODE &&
      writeToSheet(["No update_id found in payload."], LOG_SHEET);
    return respondOk("Error: No update_id provided");
  }

  const scriptProperties = PropertiesService.getScriptProperties();
  const lastProcessedUpdateId =
    scriptProperties.getProperty(LAST_UPDATE_ID_KEY);

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
    DEBUG_MODE &&
      writeToSheet(["Handling Error: " + error.message], LOG_SHEET);
    return respondOk("Error processing request: " + error.message);
  }

  // After successfully writing, store the new lastProcessedUpdateId
  try {
    !DEBUG_MODE &&
      scriptProperties.setProperty(LAST_UPDATE_ID_KEY, String(updateId));

    DEBUG_MODE && writeToSheet(["Successful Run"], LOG_SHEET);
    return respondOk();
  } catch (error) {
    DEBUG_MODE &&
      writeToSheet(
        ["Error processing webhook or writing to sheet: " + error.message],
        LOG_SHEET
      );
    return respondOk("Error processing request: " + error.message);
  }
}
