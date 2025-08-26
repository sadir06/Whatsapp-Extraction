const express = require('express');
const path = require('path');
const fs = require('fs');
const WhatsAppTracker = require('./index');
const config = require('./config');

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
        whatsappConnected: tracker.isConnected,
        endpoints: {
            health: '/health',
            status: '/',
            auth: '/auth-status',
            downloadExcel: '/download'
        }
    });
});

// Authentication status endpoint
app.get('/auth-status', (req, res) => {
    res.json({
        whatsappConnected: tracker.isConnected,
        needsQRCode: !tracker.isConnected,
        message: tracker.isConnected ? 'WhatsApp is connected and ready!' : 'WhatsApp needs authentication - check logs for QR code'
    });
});

// Download the Excel file
app.get('/download', (req, res) => {
    try {
        const excelPath = path.resolve(config.EXCEL_FILE_PATH);
        if (!fs.existsSync(excelPath)) {
            return res.status(404).json({ error: 'Excel file not found' });
        }
        res.download(excelPath, path.basename(excelPath));
    } catch (err) {
        res.status(500).json({ error: 'Failed to download file', details: String(err) });
    }
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
