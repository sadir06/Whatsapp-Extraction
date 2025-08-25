const XLSX = require('xlsx');
const fs = require('fs-extra');
const moment = require('moment');
const config = require('../config');

class ExcelManager {
    constructor() {
        this.workbook = null;
        this.messagesSheet = null;
        this.spendingSheet = null;
        this.individualSpendingSheet = null;
        this.initialized = false;
        this.initPromise = this.initializeWorkbook();
    }

    async ensureInitialized() {
        if (!this.initialized) {
            await this.initPromise;
            this.initialized = true;
        }
    }

    async initializeWorkbook() {
        try {
            if (fs.existsSync(config.EXCEL_FILE_PATH)) {
                this.workbook = XLSX.readFile(config.EXCEL_FILE_PATH);
                console.log('📊 Loaded existing Excel file');
            } else {
                this.workbook = XLSX.utils.book_new();
                console.log('📊 Created new Excel workbook');
            }

            await this.setupSheets();
        } catch (error) {
            console.error('❌ Error initializing Excel workbook:', error);
            throw error;
        }
    }

    async setupSheets() {
        // Setup Messages sheet
        if (!this.workbook.Sheets[config.SHEET_NAME]) {
            const messagesHeaders = [
                ['Timestamp', 'Sender', 'Message', 'Extracted Numbers', 'Extracted Items', 'Is Spending Related', 'Month', 'Year']
            ];
            this.messagesSheet = XLSX.utils.aoa_to_sheet(messagesHeaders);
            XLSX.utils.book_append_sheet(this.workbook, this.messagesSheet, config.SHEET_NAME);
        } else {
            this.messagesSheet = this.workbook.Sheets[config.SHEET_NAME];
        }

        // Setup Spending Analysis sheet if enabled
        if (config.ENABLE_SPENDING_ANALYSIS) {
            if (!this.workbook.Sheets[config.SPENDING_SHEET_NAME]) {
                const spendingHeaders = [
                    ['Month', 'Year', 'Total Spent', 'Number of Transactions', 'Average Transaction', 'Highest Transaction', 'Lowest Transaction']
                ];
                this.spendingSheet = XLSX.utils.aoa_to_sheet(spendingHeaders);
                XLSX.utils.book_append_sheet(this.workbook, this.spendingSheet, config.SPENDING_SHEET_NAME);
            } else {
                this.spendingSheet = this.workbook.Sheets[config.SPENDING_SHEET_NAME];
            }
        }

        // Setup Individual Spending Analysis sheet
        if (!this.workbook.Sheets['Individual Spending']) {
            const individualHeaders = [
                ['Month', 'Year', 'Person', 'Total Spent', 'Number of Transactions', 'Percentage of Total']
            ];
            this.individualSpendingSheet = XLSX.utils.aoa_to_sheet(individualHeaders);
            XLSX.utils.book_append_sheet(this.workbook, this.individualSpendingSheet, 'Individual Spending');
        } else {
            this.individualSpendingSheet = this.workbook.Sheets['Individual Spending'];
        }

        await this.saveWorkbook();
    }

    async addMessage(messageData) {
        try {
            await this.ensureInitialized();
            
            const {
                timestamp,
                sender,
                message,
                extractedNumbers,
                extractedItems,
                isSpendingRelated,
                month,
                year
            } = messageData;

            const newRow = [
                timestamp,
                sender,
                message,
                extractedNumbers.join(', '),
                extractedItems.map(item => `${item.item}: $${item.amount}`).join('; '),
                isSpendingRelated ? 'Yes' : 'No',
                month,
                year
            ];

            // Add to messages sheet
            XLSX.utils.sheet_add_aoa(this.messagesSheet, [newRow], { origin: -1 });

            // Update spending analysis if numbers were extracted
            if (extractedNumbers.length > 0 && config.ENABLE_SPENDING_ANALYSIS) {
                await this.updateSpendingAnalysis(extractedNumbers, month, year, sender);
            }

            await this.saveWorkbook();
            console.log(`✅ Added message from ${sender} to Excel`);
        } catch (error) {
            console.error('❌ Error adding message to Excel:', error);
        }
    }

    async updateSpendingAnalysis(numbers, month, year, sender) {
        try {
            // Convert string numbers to actual numbers
            const numericValues = numbers
                .map(num => parseFloat(num.replace(/[^\d.-]/g, '')))
                .filter(num => !isNaN(num) && num > 0);

            if (numericValues.length === 0) return;

            // Read existing spending data
            const existingData = XLSX.utils.sheet_to_json(this.spendingSheet, { header: 1 });
            const monthYearKey = `${month}-${year}`;

            // Find existing row for this month/year
            let existingRowIndex = -1;
            for (let i = 1; i < existingData.length; i++) {
                if (existingData[i][0] === month && existingData[i][1] === year) {
                    existingRowIndex = i;
                    break;
                }
            }

            const totalSpent = numericValues.reduce((sum, num) => sum + num, 0);
            const avgTransaction = totalSpent / numericValues.length;
            const highestTransaction = Math.max(...numericValues);
            const lowestTransaction = Math.min(...numericValues);

            if (existingRowIndex > 0) {
                // Update existing row
                const existingRow = existingData[existingRowIndex];
                const newTotalSpent = existingRow[2] + totalSpent;
                const newTransactionCount = existingRow[3] + numericValues.length;
                const newAvgTransaction = newTotalSpent / newTransactionCount;
                const newHighestTransaction = Math.max(existingRow[4], highestTransaction);
                const newLowestTransaction = Math.min(existingRow[5], lowestTransaction);

                const updatedRow = [
                    month, year, newTotalSpent, newTransactionCount, 
                    newAvgTransaction, newHighestTransaction, newLowestTransaction
                ];

                // Replace the existing row
                for (let j = 0; j < updatedRow.length; j++) {
                    this.spendingSheet[XLSX.utils.encode_cell({ r: existingRowIndex, c: j })] = {
                        v: updatedRow[j],
                        t: typeof updatedRow[j] === 'number' ? 'n' : 's'
                    };
                }
            } else {
                // Add new row
                const newRow = [
                    month, year, totalSpent, numericValues.length,
                    avgTransaction, highestTransaction, lowestTransaction
                ];
                XLSX.utils.sheet_add_aoa(this.spendingSheet, [newRow], { origin: -1 });
            }

            // Update individual spending analysis
            await this.updateIndividualSpendingAnalysis(sender, totalSpent, numericValues.length, month, year);

            console.log(`💰 Updated spending analysis for ${month} ${year}`);
        } catch (error) {
            console.error('❌ Error updating spending analysis:', error);
        }
    }

    async updateIndividualSpendingAnalysis(sender, amount, transactionCount, month, year) {
        try {
            // Read existing individual spending data
            const existingData = XLSX.utils.sheet_to_json(this.individualSpendingSheet, { header: 1 });
            
            // Find existing row for this person/month/year
            let existingRowIndex = -1;
            for (let i = 1; i < existingData.length; i++) {
                if (existingData[i][0] === month && existingData[i][1] === year && existingData[i][2] === sender) {
                    existingRowIndex = i;
                    break;
                }
            }

            if (existingRowIndex > 0) {
                // Update existing row
                const existingRow = existingData[existingRowIndex];
                const newTotalSpent = existingRow[3] + amount;
                const newTransactionCount = existingRow[4] + transactionCount;
                
                // Calculate percentage of total monthly spending
                const monthlyTotal = this.getMonthlyTotal(month, year);
                const percentage = monthlyTotal > 0 ? (newTotalSpent / monthlyTotal * 100).toFixed(2) : 0;

                const updatedRow = [
                    month, year, sender, newTotalSpent, newTransactionCount, percentage
                ];

                // Replace the existing row
                for (let j = 0; j < updatedRow.length; j++) {
                    this.individualSpendingSheet[XLSX.utils.encode_cell({ r: existingRowIndex, c: j })] = {
                        v: updatedRow[j],
                        t: typeof updatedRow[j] === 'number' ? 'n' : 's'
                    };
                }
            } else {
                // Add new row
                const monthlyTotal = this.getMonthlyTotal(month, year);
                const percentage = monthlyTotal > 0 ? (amount / monthlyTotal * 100).toFixed(2) : 0;
                
                const newRow = [
                    month, year, sender, amount, transactionCount, percentage
                ];
                XLSX.utils.sheet_add_aoa(this.individualSpendingSheet, [newRow], { origin: -1 });
            }

            console.log(`👤 Updated individual spending for ${sender} in ${month} ${year}`);
        } catch (error) {
            console.error('❌ Error updating individual spending analysis:', error);
        }
    }

    getMonthlyTotal(month, year) {
        try {
            if (!this.spendingSheet) return 0;
            
            const data = XLSX.utils.sheet_to_json(this.spendingSheet, { header: 1 });
            for (let i = 1; i < data.length; i++) {
                if (data[i][0] === month && data[i][1] === year) {
                    return data[i][2] || 0;
                }
            }
            return 0;
        } catch (error) {
            console.error('❌ Error getting monthly total:', error);
            return 0;
        }
    }

    async saveWorkbook() {
        try {
            // Try to save with retry logic for file lock issues
            let retries = 3;
            while (retries > 0) {
                try {
                    XLSX.writeFile(this.workbook, config.EXCEL_FILE_PATH);
                    return; // Success, exit the retry loop
                } catch (error) {
                    if (error.code === 'EBUSY' && retries > 1) {
                        console.log(`⚠️ Excel file is busy, retrying... (${retries} attempts left)`);
                        retries--;
                        // Wait a bit before retrying
                        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                        await wait(1000);
                    } else {
                        throw error; // Re-throw if not a busy error or no retries left
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error saving Excel file:', error);
            // Don't throw the error to prevent the app from crashing
        }
    }

    getSpendingSummary() {
        try {
            if (!this.spendingSheet) return null;

            const data = XLSX.utils.sheet_to_json(this.spendingSheet, { header: 1 });
            if (data.length <= 1) return null;

            // Skip header row
            const spendingData = data.slice(1);
            
            // Get individual spending data
            let individualData = [];
            if (this.individualSpendingSheet) {
                const individualRawData = XLSX.utils.sheet_to_json(this.individualSpendingSheet, { header: 1 });
                if (individualRawData.length > 1) {
                    individualData = individualRawData.slice(1);
                }
            }
            
            const summary = {
                totalMonths: spendingData.length,
                totalSpent: spendingData.reduce((sum, row) => sum + (row[2] || 0), 0),
                averageMonthlySpending: spendingData.reduce((sum, row) => sum + (row[2] || 0), 0) / spendingData.length,
                highestMonth: spendingData.reduce((max, row) => row[2] > max.amount ? { month: row[0], year: row[1], amount: row[2] } : max, { amount: 0 }),
                recentMonths: spendingData.slice(-3).map(row => ({
                    month: row[0],
                    year: row[1],
                    total: row[2],
                    transactions: row[3]
                })),
                individualSpending: this.getIndividualSpendingSummary(individualData)
            };

            return summary;
        } catch (error) {
            console.error('❌ Error getting spending summary:', error);
            return null;
        }
    }

    getIndividualSpendingSummary(individualData) {
        try {
            const summary = {};
            
            individualData.forEach(row => {
                const month = row[0];
                const year = row[1];
                const person = row[2];
                const amount = row[3] || 0;
                const percentage = row[5] || 0;
                
                const monthKey = `${month} ${year}`;
                if (!summary[monthKey]) {
                    summary[monthKey] = [];
                }
                
                summary[monthKey].push({
                    person: person,
                    amount: amount,
                    percentage: percentage
                });
            });
            
            return summary;
        } catch (error) {
            console.error('❌ Error getting individual spending summary:', error);
            return {};
        }
    }
}

module.exports = ExcelManager;
