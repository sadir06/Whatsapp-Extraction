const { Client, LocalAuth } = require('whatsapp-web.js');
const config = require('./config');

class GroupVerifier {
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
        this.client.on('ready', async () => {
            console.log('✅ WhatsApp client is ready!');
            console.log(`🎯 Target Group ID: ${config.TARGET_GROUP_ID}`);
            console.log('─'.repeat(50));
            
            await this.verifyGroups();
        });

        // Authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });

        // Disconnected
        this.client.on('disconnected', (reason) => {
            console.log('❌ WhatsApp client disconnected:', reason);
        });
    }

    async verifyGroups() {
        try {
            console.log('🔍 Verifying groups...\n');
            
            // Get all chats
            const chats = await this.client.getChats();
            console.log(`📋 Total chats found: ${chats.length}`);
            
            // Filter for groups only
            const groups = chats.filter(chat => chat.isGroup);
            console.log(`👥 Total groups found: ${groups.length}\n`);
            
            console.log('📋 Available Groups:');
            console.log('─'.repeat(80));
            
            let targetGroupFound = false;
            
            groups.forEach((group, index) => {
                const isTarget = group.id._serialized === config.TARGET_GROUP_ID;
                if (isTarget) targetGroupFound = true;
                
                console.log(`${index + 1}. ${isTarget ? '🎯 ' : '   '}${group.name || 'Unnamed Group'}`);
                console.log(`   ID: ${group.id._serialized}`);
                console.log(`   Participants: ${group.participants.length}`);
                console.log(`   Is Target: ${isTarget ? 'YES' : 'No'}`);
                console.log('');
            });
            
            console.log('─'.repeat(80));
            
            if (targetGroupFound) {
                console.log('✅ Target group found! The group ID is correct.');
            } else {
                console.log('❌ Target group NOT found! Please check the group ID in config.js');
                console.log(`Current target: ${config.TARGET_GROUP_ID}`);
            }
            
            // Also check if we can get the target group directly
            try {
                const targetGroup = await this.client.getChatById(config.TARGET_GROUP_ID);
                console.log(`\n✅ Successfully retrieved target group: ${targetGroup.name || 'Unnamed'}`);
                console.log(`   Participants: ${targetGroup.participants.length}`);
            } catch (error) {
                console.log(`\n❌ Could not retrieve target group: ${error.message}`);
            }
            
        } catch (error) {
            console.error('❌ Error verifying groups:', error);
        } finally {
            await this.stop();
        }
    }

    async start() {
        try {
            console.log('🚀 Starting Group Verifier...');
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Failed to start group verifier:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            await this.client.destroy();
            console.log('🛑 Group verifier stopped');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error stopping group verifier:', error);
            process.exit(1);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    if (verifier) {
        await verifier.stop();
    }
});

// Start the verifier
const verifier = new GroupVerifier();
verifier.start().catch(error => {
    console.error('❌ Failed to start verifier:', error);
    process.exit(1);
});
