const express = require('express');
const WhatsAppTracker = require('./index');

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        message: 'WhatsApp Tracker is running',
        timestamp: new Date().toISOString()
    });
});

// Basic status endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'WhatsApp Message Tracker',
        status: 'running',
        endpoints: {
            health: '/health',
            status: '/'
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Start the WhatsApp tracker
const tracker = new WhatsAppTracker();
tracker.start().catch(error => {
    console.error('❌ Failed to start tracker:', error);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await tracker.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down...');
    await tracker.stop();
    process.exit(0);
});
