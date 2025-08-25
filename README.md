# WhatsApp Message Tracker with Excel Integration

A powerful Node.js application that automatically tracks WhatsApp group messages and exports them to Excel with advanced spending analysis capabilities.

## 🚀 Features

- **Real-time Message Tracking**: Automatically captures messages from a specific WhatsApp group
- **Excel Integration**: Dynamically updates Excel spreadsheets with new messages
- **Spending Analysis**: Extracts numbers from messages and categorizes spending by month
- **Smart Number Detection**: Recognizes various number formats (currency, amounts, etc.)
- **Spending Insights**: Provides detailed analysis including total spent, averages, and trends
- **Automatic Categorization**: Categorizes spending into different categories (Food, Transportation, etc.)

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- WhatsApp account
- Access to the target WhatsApp group

## 🛠️ Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd Whatsapp-Extraction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the application**
   - Open `config.js`
   - Replace `YOUR_GROUP_ID@g.us` with your actual WhatsApp group ID
   - Customize other settings as needed

## 🔧 Configuration

### Getting Your WhatsApp Group ID

1. **Method 1: From WhatsApp Web**
   - Open WhatsApp Web in your browser
   - Go to the target group
   - Look at the URL: `https://web.whatsapp.com/accept?code=...`
   - The group ID will be in the format: `1234567890-1234567890@g.us`

2. **Method 2: From the Application**
   - Run the application once
   - It will show all available chats/groups
   - Copy the group ID from the console output

### Configuration Options

Edit `config.js` to customize:

```javascript
module.exports = {
    TARGET_GROUP_ID: "YOUR_GROUP_ID@g.us",  // Your WhatsApp group ID
    EXCEL_FILE_PATH: "./whatsapp_messages.xlsx",  // Excel file location
    ENABLE_SPENDING_ANALYSIS: true,  // Enable/disable spending analysis
    // ... other options
};
```

## 🚀 Usage

1. **Start the application**
   ```bash
   npm start
   ```

2. **Scan the QR code**
   - A QR code will appear in the terminal
   - Open WhatsApp on your phone
   - Go to Settings > Linked Devices
   - Scan the QR code

3. **Monitor messages**
   - The application will automatically start tracking messages
   - New messages will be added to the Excel file
   - Spending analysis will be updated in real-time

## 📊 Excel Output

The application creates an Excel file with two sheets:

### 1. Messages Sheet
- **Timestamp**: When the message was sent
- **Sender**: Who sent the message
- **Message**: The actual message content
- **Extracted Numbers**: Any numbers found in the message
- **Is Spending Related**: Whether the message contains spending information
- **Month/Year**: For categorization

### 2. Spending Analysis Sheet
- **Month/Year**: Time period
- **Total Spent**: Sum of all amounts for that month
- **Number of Transactions**: How many spending messages
- **Average Transaction**: Average amount per transaction
- **Highest/Lowest Transaction**: Range of spending

## 💡 Message Examples

The application can detect various number formats:

```
✅ "I spent $50 on lunch today"
✅ "Paid 25.99 for gas"
✅ "Total bill was 150 dollars"
✅ "Subscription cost: 9.99"
✅ "Bought groceries for 75.50"
```

## 🔍 Spending Analysis Features

- **Automatic Categorization**: Messages are categorized into:
  - Food & Dining
  - Transportation
  - Housing
  - Utilities
  - Shopping
  - Entertainment
  - Other

- **Monthly Summaries**: Track spending trends over time
- **High-Value Detection**: Identifies transactions over $1000
- **Real-time Updates**: Excel updates immediately when new messages arrive

## 🛠️ Troubleshooting

### Common Issues

1. **QR Code not working**
   - Make sure you're using the latest version of WhatsApp
   - Try refreshing the QR code by restarting the application
   - Check your internet connection

2. **Group ID not found**
   - Verify the group ID format: `1234567890-1234567890@g.us`
   - Make sure you're a member of the group
   - Check that the group is active

3. **Excel file not updating**
   - Check file permissions
   - Make sure the Excel file isn't open in another application
   - Verify the file path in `config.js`

4. **Numbers not being detected**
   - Check the `NUMBER_PATTERNS` in `config.js`
   - Add custom patterns if needed
   - Verify the message format

### Debug Mode

Enable debug logging by changing `LOG_LEVEL` in `config.js`:

```javascript
LOG_LEVEL: 'debug'
```

## 📁 Project Structure

```
Whatsapp-Extraction/
├── index.js              # Main application file
├── config.js             # Configuration settings
├── package.json          # Dependencies and scripts
├── README.md            # This file
├── utils/
│   ├── excelManager.js   # Excel operations
│   └── messageProcessor.js # Message processing logic
└── whatsapp_messages.xlsx # Generated Excel file
```

## 🔒 Security & Privacy

- **Local Storage**: All data is stored locally on your machine
- **No Cloud Sync**: Messages are not uploaded to any external servers
- **WhatsApp Web**: Uses official WhatsApp Web API
- **Authentication**: Uses local authentication strategy

## 📝 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console output for error messages
3. Verify your configuration settings
4. Check that all dependencies are installed correctly

## 🎯 Future Enhancements

- Web dashboard for real-time monitoring
- Multiple group support
- Advanced analytics and charts
- Export to other formats (CSV, JSON)
- Custom spending categories
- Budget alerts and notifications
