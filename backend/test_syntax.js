try {
    const transactions = require('./routes/transactions');
    console.log('✅ Transactions route syntax is OK');
} catch (error) {
    console.error('❌ Syntax Error in transactions.js:', error.message);
}
