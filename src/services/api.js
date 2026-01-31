const API_BASE_URL = 'http://localhost:5000/api';

export const api = {
    // Auth
    login: async (username, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        return response.json();
    },

    // Transactions
    getTransactions: async (filters = {}) => {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/transactions?${params}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return response.json();
    },

    saveTransaction: async (data) => {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to save transaction');
        return response.json();
    }
};
