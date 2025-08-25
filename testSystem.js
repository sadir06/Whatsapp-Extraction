const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');
const MessageProcessor = require('./utils/messageProcessor');

class SystemTester {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
        this.messageProcessor = new MessageProcessor();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // QR Code generation
        this.client.on('qr', (qr) => {
            console.log('📱 QR Code received. Scan this with your WhatsApp:');
            console.log('🔗 QR Code URL (copy this to browser):');
            console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
        });

        // Client ready
        this.client.on('ready', async () => {
            console.log('✅ WhatsApp client is ready!');
            console.log(`🎯 Target Group ID: ${config.TARGET_GROUP_ID}`);
            console.log('─'.repeat(50));
            
            await this.runTests();
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });

        // Message received - Enhanced logging
        this.client.on('message', async (message) => {
            console.log('\n📨 === MESSAGE RECEIVED ===');
            console.log(`From: ${message.from}`);
            console.log(`Target: ${config.TARGET_GROUP_ID}`);
            console.log(`Match: ${message.from === config.TARGET_GROUP_ID ? 'YES' : 'NO'}`);
            console.log(`Type: ${message.type}`);
            console.log(`Status: ${message.isStatus}`);
            console.log(`Body: "${message.body}"`);
            
            if (message.from === config.TARGET_GROUP_ID) {
                console.log('✅ Processing message from target group...');
                
                if (message.isStatus || message.type === 'protocol') {
                    console.log('⚠️ Skipping system/status message');
                } else {
                    console.log('✅ Processing normal message');
                    
                    // Test message processing
                    const processedData = this.messageProcessor.processMessage(
                        message.body,
                        message._data.notifyName || message.from,
                        new Date()
                    );
                    
                    if (processedData) {
                        console.log('✅ Message processed successfully');
                        console.log(`   Numbers found: [${processedData.extractedNumbers.join(', ')}]`);
                        console.log(`   Items found: ${processedData.extractedItems.length}`);
                        console.log(`   Spending related: ${processedData.isSpendingRelated}`);
                    } else {
                        console.log('❌ Message processing failed');
                    }
                }
            } else {
                console.log('❌ Message ignored (not from target group)');
            }
            console.log('=============================\n');
        });

        // Disconnected
        this.client.on('disconnected', (reason) => {
            console.log('❌ WhatsApp client disconnected:', reason);
        });
    }

    async runTests() {
        console.log('🧪 Running System Tests...\n');
        
        try {
            // Test 1: Verify group exists
            console.log('1️⃣ Testing group access...');
            try {
                const targetGroup = await this.client.getChatById(config.TARGET_GROUP_ID);
                console.log(`✅ Target group found: ${targetGroup.name || 'Unnamed'}`);
                console.log(`   Participants: ${targetGroup.participants.length}`);
            } catch (error) {
                console.log(`❌ Could not access target group: ${error.message}`);
            }
            
            // Test 2: List all groups
            console.log('\n2️⃣ Listing all groups...');
            const chats = await this.client.getChats();
            const groups = chats.filter(chat => chat.isGroup);
            console.log(`Found ${groups.length} groups:`);
            groups.forEach((group, index) => {
                const isTarget = group.id._serialized === config.TARGET_GROUP_ID;
                console.log(`   ${index + 1}. ${isTarget ? '🎯 ' : '   '}${group.name || 'Unnamed'} (${group.id._serialized})`);
            });
            
            // Test 3: Test message processing
            console.log('\n3️⃣ Testing message processing...');
            const testMessages = [
                "I spent $25.50 on lunch",
                "Coffee 3.25 and sandwich 8.75",
                "Just a regular message"
            ];
            
            testMessages.forEach((msg, index) => {
                console.log(`   Test ${index + 1}: "${msg}"`);
                const processed = this.messageProcessor.processMessage(msg, "Test User", new Date());
                if (processed) {
                    console.log(`      Numbers: [${processed.extractedNumbers.join(', ')}]`);
                    console.log(`      Spending: ${processed.isSpendingRelated}`);
                }
            });
            
            console.log('\n✅ System tests completed!');
            console.log('📱 Now send some messages to your WhatsApp group to test live processing...');
            console.log('🔄 The system will continue running and log all messages received.');
            
        } catch (error) {
            console.error('❌ Error running tests:', error);
        }
    }

    async start() {
        try {
            console.log('🚀 Starting System Tester...');
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Failed to start system tester:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            await this.client.destroy();
            console.log('🛑 System tester stopped');
        } catch (error) {
            console.error('❌ Error stopping system tester:', error);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    if (tester) {
        await tester.stop();
    }
    process.exit(0);
});

// Start the tester
const tester = new SystemTester();
tester.start().catch(error => {
    console.error('❌ Failed to start tester:', error);
    process.exit(1);
});
