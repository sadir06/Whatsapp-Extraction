const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class GroupFinder {
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
        this.client.on('qr', (qr) => {
            console.log('📱 QR Code received. Scan this with your WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', async () => {
            console.log('✅ WhatsApp client is ready!');
            console.log('🔍 Finding all chats and groups...\n');
            await this.listAllChats();
            await this.client.destroy();
            process.exit(0);
        });

        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });
    }

    async listAllChats() {
        try {
            const chats = await this.client.getChats();
            
            console.log('📋 Available Chats and Groups:');
            console.log('─'.repeat(80));
            
            let groupCount = 0;
            let chatCount = 0;

            for (const chat of chats) {
                if (chat.isGroup) {
                    groupCount++;
                    console.log(`\n👥 GROUP ${groupCount}:`);
                    console.log(`   Name: ${chat.name}`);
                    console.log(`   ID: ${chat.id._serialized}`);
                    console.log(`   Participants: ${chat.participants.length}`);
                    console.log(`   Description: ${chat.description || 'No description'}`);
                } else {
                    chatCount++;
                    console.log(`\n💬 CHAT ${chatCount}:`);
                    console.log(`   Name: ${chat.name || chat.id.user}`);
                    console.log(`   ID: ${chat.id._serialized}`);
                }
            }

            console.log('\n' + '─'.repeat(80));
            console.log(`📊 Summary: ${groupCount} groups, ${chatCount} individual chats`);
            console.log('\n💡 To use a group in the tracker:');
            console.log('   1. Copy the group ID (the long string ending with @g.us)');
            console.log('   2. Paste it in config.js as TARGET_GROUP_ID');
            console.log('   3. Make sure to include the @g.us suffix');

        } catch (error) {
            console.error('❌ Error listing chats:', error);
        }
    }

    async start() {
        try {
            console.log('🚀 Starting WhatsApp Group Finder...');
            console.log('📱 You will need to scan a QR code to authenticate');
            console.log('─'.repeat(50));
            
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Failed to start group finder:', error);
            process.exit(1);
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    process.exit(0);
});

// Start the group finder
const finder = new GroupFinder();
finder.start().catch(error => {
    console.error('❌ Failed to start group finder:', error);
    process.exit(1);
});
