export const STORAGE_KEYS = {
    TRANSACTIONS: 'barokah_transactions',
    USER_SESSION: 'barokah_session'
};

export const saveTransaction = (transaction, isOwnerInput) => {
    const history = getTransactions();
    const newTx = {
        id: Date.now(),
        date: new Date().toISOString(),
        isOwnerInput, // true = Owner Input (Self), false = Customer Input
        ...transaction
    };
    history.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(history));
    return newTx;
};

export const getTransactions = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Failed to parse transactions", e);
        return [];
    }
};

export const getOwnerSelfTransactions = () => {
    return getTransactions().filter(t => t.isOwnerInput);
};

export const getCustomerInputTransactions = () => {
    return getTransactions().filter(t => !t.isOwnerInput);
};
