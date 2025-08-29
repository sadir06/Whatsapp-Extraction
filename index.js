const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ExcelManager = require('./utils/excelManager');
const MessageProcessor = require('./utils/messageProcessor');
const config = require('./config');

class WhatsAppTracker {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                dataPath: config.AUTH_DIR
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
        this.excelManager = new ExcelManager();
        this.messageProcessor = new MessageProcessor();
        this.isConnected = false;
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // QR Code generation
        this.client.on('qr', (qr) => {
            console.log('📱 QR Code received. Scan this with your WhatsApp:');
            console.log('🔗 QR Code URL (copy this to browser):');
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
            console.log('📋 Or scan the QR code below:');
            qrcode.generate(qr, { small: true });
        });

        // Client ready
        this.client.on('ready', () => {
            this.isConnected = true;
            console.log('✅ WhatsApp client is ready!');
            console.log(`🎯 Monitoring group: ${config.TARGET_GROUP_ID}`);
            console.log(`📊 Excel file location: ${config.EXCEL_FILE_PATH}`);
            console.log(`🌐 Download from Railway: https://YOUR-APP.railway.app/download`);
            console.log('─'.repeat(50));
            this.displaySpendingSummary();
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });

        // Message received
        this.client.on('message', async (message) => {
            // Only log messages from the target group to reduce noise
            if (message.from === config.TARGET_GROUP_ID) {
                console.log(`\n📨 Message received from target group: ${message.from}`);
                console.log(`   Message type: ${message.type}`);
                console.log(`   Is status: ${message.isStatus}`);
                console.log(`   Body: "${message.body}"`);
            }
            
            await this.handleMessage(message);
        });

        // Disconnected
        this.client.on('disconnected', (reason) => {
            this.isConnected = false;
            console.log('❌ WhatsApp client disconnected:', reason);
        });
    }

    async handleMessage(message) {
        try {
            // Only process messages from the target group
            if (message.from !== config.TARGET_GROUP_ID) {
                return;
            }

            // Skip system messages and status updates
            if (message.isStatus || message.type === 'protocol') {
                return;
            }

            console.log(`📨 New message from ${message._data.notifyName || 'Unknown'}: ${message.body}`);

            // Process the message
            const processedData = this.messageProcessor.processMessage(
                message.body,
                message._data.notifyName || message.from,
                new Date()
            );

            if (processedData) {
                // Add to Excel
                await this.excelManager.addMessage(processedData);

                // Get spending insights
                const insights = this.messageProcessor.getSpendingInsights(processedData);
                
                // Display insights if it's a spending-related message
                if (insights.hasAmount) {
                    this.displayMessageInsights(processedData, insights);
                }
                
                // Show Excel file info
                console.log(`📊 Excel updated! File: ${config.EXCEL_FILE_PATH}`);
                console.log(`   📋 Messages Sheet: All messages with extracted numbers`);
                console.log(`   💰 Spending Analysis: Monthly summaries and totals`);
                console.log(`   👥 Individual Spending: Per-person breakdowns`);
            }

        } catch (error) {
            console.error('❌ Error handling message:', error);
        }
    }

    displayMessageInsights(messageData, insights) {
        console.log('\n💰 Spending Analysis:');
        console.log(`   👤 Sender: ${messageData.sender}`);
        console.log(`   💵 Amount: $${insights.totalAmount.toFixed(2)}`);
        console.log(`   📂 Category: ${insights.category}`);
        console.log(`   ⚡ High Value: ${insights.isHighValue ? 'Yes' : 'No'}`);
        console.log(`   🔢 Numbers Found: ${insights.amountCount}`);
        
        if (messageData.extractedItems && messageData.extractedItems.length > 0) {
            console.log(`   🛒 Items Detected:`);
            messageData.extractedItems.forEach(item => {
                console.log(`     • ${item.item}: $${item.amount}`);
            });
        }
        
        console.log('─'.repeat(50));
    }

    displaySpendingSummary() {
        const summary = this.excelManager.getSpendingSummary();
        if (summary) {
            console.log('\n📊 Current Spending Summary:');
            console.log(`   Total Months Tracked: ${summary.totalMonths}`);
            console.log(`   Total Spent: $${summary.totalSpent.toFixed(2)}`);
            console.log(`   Average Monthly Spending: $${summary.averageMonthlySpending.toFixed(2)}`);
            
            if (summary.highestMonth.amount > 0) {
                console.log(`   Highest Month: ${summary.highestMonth.month} ${summary.highestMonth.year} - $${summary.highestMonth.amount.toFixed(2)}`);
            }
            
            console.log('\n   Recent Months:');
            summary.recentMonths.forEach(month => {
                console.log(`     ${month.month} ${month.year}: $${month.total.toFixed(2)} (${month.transactions} transactions)`);
            });

            // Display individual spending breakdown
            if (summary.individualSpending && Object.keys(summary.individualSpending).length > 0) {
                console.log('\n👥 Individual Spending Breakdown:');
                Object.keys(summary.individualSpending).forEach(monthKey => {
                    console.log(`   ${monthKey}:`);
                    summary.individualSpending[monthKey].forEach(person => {
                        console.log(`     ${person.person}: $${person.amount.toFixed(2)} (${person.percentage}%)`);
                    });
                });
            }
        } else {
            console.log('\n📊 No spending data available yet. Start sending messages with amounts!');
        }
        console.log('─'.repeat(50));
    }

    async start() {
        try {
            console.log('🚀 Starting WhatsApp Message Tracker...');
            console.log('📋 Configuration:');
            console.log(`   Target Group: ${config.TARGET_GROUP_ID}`);
            console.log(`   Excel File: ${config.EXCEL_FILE_PATH}`);
            console.log(`   Spending Analysis: ${config.ENABLE_SPENDING_ANALYSIS ? 'Enabled' : 'Disabled'}`);
            console.log('─'.repeat(50));

            await this.client.initialize();
        } catch (error) {
            console.error('❌ Failed to start WhatsApp tracker:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            if (this.isConnected) {
                await this.client.destroy();
                console.log('🛑 WhatsApp tracker stopped');
            }
        } catch (error) {
            console.error('❌ Error stopping WhatsApp tracker:', error);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    if (tracker) {
        await tracker.stop();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down...');
    if (tracker) {
        await tracker.stop();
    }
    process.exit(0);
});

// Start the tracker
const tracker = new WhatsAppTracker();
tracker.start().catch(error => {
    console.error('❌ Failed to start tracker:', error);
    process.exit(1);
});

// Export for potential external use
module.exports = WhatsAppTracker;
