# WhatsApp Message Tracker - Troubleshooting Guide

## Issue: No messages are being logged or processed

If you're not seeing any logs or updates in the Excel sheet when messages are sent, follow these steps:

### 1. Check Group ID
First, verify that the group ID in `config.js` is correct:

```bash
node verifyGroupId.js
```

This will:
- List all available groups
- Show which group matches your target ID
- Verify if the group is accessible

### 2. Test Message Processing
Run the system tester to see detailed logs:

```bash
node testSystem.js
```

This will:
- Test group access
- Show all message processing in real-time
- Display detailed logs for each message received

### 3. Check Excel File
The Excel file might be locked. Try:

```bash
node testMessageProcessing.js
```

This tests the message processing logic without the WhatsApp connection.

### 4. Common Issues and Solutions

#### Issue: "EBUSY: resource busy or locked"
**Cause**: Excel file is open in another application
**Solution**: 
- Close the Excel file if it's open
- The system now has retry logic to handle this automatically

#### Issue: "Target group NOT found"
**Cause**: Incorrect group ID in config.js
**Solution**:
- Run `node verifyGroupId.js` to get the correct group ID
- Update the `TARGET_GROUP_ID` in `config.js`

#### Issue: Messages received but not processed
**Cause**: Messages don't contain numbers or spending-related content
**Solution**:
- Send messages with amounts like "lunch $25.50" or "coffee 3.25"
- Check the message processing patterns in `config.js`

#### Issue: No messages received at all
**Cause**: WhatsApp client not connected or wrong group
**Solution**:
- Check if the QR code was scanned
- Verify the group ID is correct
- Make sure you're sending messages to the right group

### 5. Debug Mode
To see all messages (not just from target group), run:

```bash
node debug.js
```

This will log ALL messages received, helping you see if the issue is with message filtering.

### 6. Message Format Examples
The system recognizes these formats:
- "I spent $25.50 on lunch"
- "Coffee 3.25 and sandwich 8.75"
- "Gas was 45.20 dollars"
- "Paid 150 for the bill"
- "Lunch $12.99 and dinner $18.50"

### 7. Check Logs
Look for these log messages:
- `📨 Message received from: [group-id]`
- `✅ Processing message from target group...`
- `✅ Added message from [sender] to Excel`

If you don't see these, the issue is likely with:
1. Group ID configuration
2. WhatsApp connection
3. Message filtering

### 8. Restart the System
If all else fails:
1. Stop the current process (Ctrl+C)
2. Close any open Excel files
3. Restart with: `node index.js` or `npm start`

### 9. Railway Deployment
If deployed on Railway:
- Check the Railway logs for any errors
- Verify the environment variables are set correctly
- Make sure the WhatsApp session is authenticated

## Still Having Issues?

1. Run `node testSystem.js` and send a test message
2. Check the detailed logs for any error messages
3. Verify the group ID matches exactly
4. Make sure messages contain numbers/amounts
5. Check if the Excel file is accessible and not locked
