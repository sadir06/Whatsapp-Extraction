const moment = require('moment');
const config = require('../config');

class MessageProcessor {
    constructor() {
        this.numberPatterns = config.NUMBER_PATTERNS;
        this.spendingPatterns = config.SPENDING_PATTERNS;
        this.spendingKeywords = config.SPENDING_KEYWORDS;
    }

    processMessage(message, sender, timestamp) {
        try {
            const extractedData = this.extractNumbersAndItems(message);
            
            const processedData = {
                timestamp: this.formatTimestamp(timestamp),
                sender: this.cleanSenderName(sender),
                message: message.trim(),
                extractedNumbers: extractedData.numbers,
                extractedItems: extractedData.items,
                isSpendingRelated: this.isSpendingRelated(message),
                month: moment(timestamp).format('MMMM'),
                year: moment(timestamp).format('YYYY')
            };

            return processedData;
        } catch (error) {
            console.error('❌ Error processing message:', error);
            return null;
        }
    }

    extractNumbersAndItems(message) {
        const numbers = [];
        const items = [];
        
        // First, try spending patterns to extract items and amounts
        this.spendingPatterns.forEach(pattern => {
            const matches = message.matchAll(pattern);
            for (const match of matches) {
                const item = match[1].toLowerCase().trim();
                const amount = match[2];
                const cleanNumber = this.cleanNumber(amount);
                
                if (cleanNumber && !numbers.includes(cleanNumber)) {
                    numbers.push(cleanNumber);
                    items.push({
                        item: item,
                        amount: cleanNumber,
                        original: `${item} ${amount}`
                    });
                }
            }
        });
        
        // Then, try general number patterns for any remaining numbers
        this.numberPatterns.forEach(pattern => {
            const matches = message.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleanNumber = this.cleanNumber(match);
                    if (cleanNumber && !numbers.includes(cleanNumber)) {
                        numbers.push(cleanNumber);
                    }
                });
            }
        });

        return { numbers, items };
    }

    extractNumbers(message) {
        return this.extractNumbersAndItems(message).numbers;
    }

    cleanNumber(numberString) {
        // Remove currency symbols and extra text, keep only digits and decimal points
        let cleaned = numberString.replace(/[^\d.-]/g, '');
        
        // Handle cases where we might have multiple decimal points
        const parts = cleaned.split('.');
        if (parts.length > 2) {
            // If multiple decimal points, take the first two parts
            cleaned = parts[0] + '.' + parts[1];
        }

        // Convert to number and back to string to normalize
        const num = parseFloat(cleaned);
        if (isNaN(num) || num <= 0) return null;

        return num.toString();
    }

    isSpendingRelated(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check if message contains spending keywords
        const hasSpendingKeyword = this.spendingKeywords.some(keyword => 
            lowerMessage.includes(keyword.toLowerCase())
        );

        // Check if message contains numbers (potential amounts)
        const hasNumbers = this.extractNumbers(message).length > 0;

        // Consider it spending-related if it has both keywords and numbers
        // or if it has significant numbers (likely amounts)
        return hasSpendingKeyword || (hasNumbers && this.hasSignificantNumbers(message));
    }

    hasSignificantNumbers(message) {
        const numbers = this.extractNumbers(message);
        return numbers.some(num => {
            const value = parseFloat(num);
            // Consider numbers between 1 and 10000 as significant (likely amounts)
            return value >= 1 && value <= 10000;
        });
    }

    formatTimestamp(timestamp) {
        return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
    }

    cleanSenderName(sender) {
        // Remove common prefixes and clean up the name
        return sender
            .replace(/^\+/, '') // Remove leading +
            .replace(/@.*$/, '') // Remove @domain part
            .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
            .trim();
    }

    // Advanced number extraction for different formats
    extractAdvancedNumbers(message) {
        const numbers = [];
        
        // Pattern for currency amounts with various formats
        const currencyPatterns = [
            /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,  // $1,234.56
            /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|USD|usd)/gi,  // 1234.56 dollars
            /(\d+(?:\.\d{2})?)\s*(?:euros?|EUR|eur)/gi,  // 1234.56 euros
            /(\d+(?:\.\d{2})?)\s*(?:pounds?|GBP|gbp)/gi,  // 1234.56 pounds
        ];

        currencyPatterns.forEach(pattern => {
            const matches = message.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleanNumber = this.cleanNumber(match);
                    if (cleanNumber && !numbers.includes(cleanNumber)) {
                        numbers.push(cleanNumber);
                    }
                });
            }
        });

        return numbers;
    }

    // Get spending insights from a message
    getSpendingInsights(messageData) {
        const insights = {
            hasAmount: messageData.extractedNumbers.length > 0,
            amountCount: messageData.extractedNumbers.length,
            totalAmount: 0,
            isHighValue: false,
            category: this.categorizeSpending(messageData.message)
        };

        if (insights.hasAmount) {
            const amounts = messageData.extractedNumbers.map(num => parseFloat(num));
            insights.totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
            insights.isHighValue = insights.totalAmount > 1000; // Consider high value if > $1000
        }

        return insights;
    }

    categorizeSpending(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('food') || lowerMessage.includes('restaurant') || lowerMessage.includes('meal')) {
            return 'Food & Dining';
        } else if (lowerMessage.includes('gas') || lowerMessage.includes('fuel') || lowerMessage.includes('petrol')) {
            return 'Transportation';
        } else if (lowerMessage.includes('rent') || lowerMessage.includes('mortgage') || lowerMessage.includes('housing')) {
            return 'Housing';
        } else if (lowerMessage.includes('bill') || lowerMessage.includes('utility') || lowerMessage.includes('electric')) {
            return 'Utilities';
        } else if (lowerMessage.includes('shopping') || lowerMessage.includes('clothes') || lowerMessage.includes('store')) {
            return 'Shopping';
        } else if (lowerMessage.includes('entertainment') || lowerMessage.includes('movie') || lowerMessage.includes('game')) {
            return 'Entertainment';
        } else {
            return 'Other';
        }
    }
}

module.exports = MessageProcessor;
