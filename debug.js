const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');

class WhatsAppDebugger {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        
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
        this.client.on('ready', () => {
            console.log('✅ WhatsApp client is ready!');
            console.log(`🎯 Monitoring group: ${config.TARGET_GROUP_ID}`);
            console.log('🔍 Debug mode: All messages will be logged');
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });

        // Message received - LOG EVERYTHING
        this.client.on('message', async (message) => {
            console.log('\n📨 === NEW MESSAGE RECEIVED ===');
            console.log(`From: ${message.from}`);
            console.log(`Target Group: ${config.TARGET_GROUP_ID}`);
            console.log(`Is Target Group: ${message.from === config.TARGET_GROUP_ID}`);
            console.log(`Message Type: ${message.type}`);
            console.log(`Is Status: ${message.isStatus}`);
            console.log(`Notify Name: ${message._data.notifyName || 'Unknown'}`);
            console.log(`Body: "${message.body}"`);
            console.log(`Timestamp: ${message.timestamp}`);
            
            // Check if it's from our target group
            if (message.from === config.TARGET_GROUP_ID) {
                console.log('✅ Message is from target group - will be processed');
                
                // Check if it's a system message
                if (message.isStatus || message.type === 'protocol') {
                    console.log('⚠️ Skipping system/status message');
                } else {
                    console.log('✅ Message will be processed normally');
                }
            } else {
                console.log('❌ Message is NOT from target group - will be ignored');
            }
            console.log('=====================================\n');
        });

        // Disconnected
        this.client.on('disconnected', (reason) => {
            console.log('❌ WhatsApp client disconnected:', reason);
        });
    }

    async start() {
        try {
            console.log('🚀 Starting WhatsApp Debugger...');
            console.log('📋 Configuration:');
            console.log(`   Target Group: ${config.TARGET_GROUP_ID}`);
            console.log('─'.repeat(50));

            await this.client.initialize();
        } catch (error) {
            console.error('❌ Failed to start WhatsApp debugger:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            await this.client.destroy();
            console.log('🛑 WhatsApp debugger stopped');
        } catch (error) {
            console.error('❌ Error stopping WhatsApp debugger:', error);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    if (debugger) {
        await debugger.stop();
    }
    process.exit(0);
});

// Start the debugger
const debugger = new WhatsAppDebugger();
debugger.start().catch(error => {
    console.error('❌ Failed to start debugger:', error);
    process.exit(1);
});
