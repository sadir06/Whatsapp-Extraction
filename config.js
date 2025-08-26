module.exports = {
    // WhatsApp Group ID - set via env for deployments. Example: "1234567890-1234567890@g.us"
    TARGET_GROUP_ID: process.env.TARGET_GROUP_ID || "120363342387374955@g.us",

    // Auth/session directory for whatsapp-web.js LocalAuth (persist on a volume in Railway)
    AUTH_DIR: process.env.WWEBJS_AUTH_DIR || process.env.AUTH_DIR || "./.wwebjs_auth",

    // Excel file settings
    EXCEL_FILE_PATH: process.env.EXCEL_FILE_PATH || "./whatsapp_messages.xlsx",
    SHEET_NAME: process.env.SHEET_NAME || "Messages",

    // Message processing settings
    ENABLE_SPENDING_ANALYSIS: (process.env.ENABLE_SPENDING_ANALYSIS || "true").toLowerCase() === 'true',
    SPENDING_SHEET_NAME: process.env.SPENDING_SHEET_NAME || "Spending Analysis",

    // Number extraction patterns (customize based on your group's message format)
    NUMBER_PATTERNS: [
        /(\d+(?:\.\d{2})?)/g,  // Basic numbers with optional decimals
        /(\$\d+(?:\.\d{2})?)/g,  // Dollar amounts
        /(\d+(?:\.\d{2})?\s*(?:dollars?|USD|usd))/gi,  // Numbers with currency words
    ],

    // Enhanced spending patterns to detect "item amount" format
    SPENDING_PATTERNS: [
        /(\w+)\s+(\d+(?:\.\d{2})?)/gi,  // "lunch 4.50", "coffee 3.25"
        /(\w+)\s+\$(\d+(?:\.\d{2})?)/gi,  // "lunch $4.50", "coffee $3.25"
        /(\w+)\s+(\d+(?:\.\d{2})?)\s*(?:dollars?|USD|usd)/gi,  // "lunch 4.50 dollars"
        /(\w+)\s+(\d+(?:\.\d{2})?)\s*(?:euros?|EUR|eur)/gi,  // "lunch 4.50 euros"
        /(\w+)\s+(\d+(?:\.\d{2})?)\s*(?:pounds?|GBP|gbp)/gi,  // "lunch 4.50 pounds"
    ],

    // Keywords that might indicate spending (for categorization)
    SPENDING_KEYWORDS: [
        'spent', 'paid', 'cost', 'price', 'amount', 'total', 'bill', 'payment',
        'purchase', 'bought', 'expense', 'charge', 'fee', 'subscription'
    ],

    // Logging settings
    LOG_LEVEL: process.env.LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
    LOG_TO_FILE: (process.env.LOG_TO_FILE || "true").toLowerCase() === 'true',
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || "./whatsapp_tracker.log"
};
