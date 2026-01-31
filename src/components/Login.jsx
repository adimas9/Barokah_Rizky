import React, { useState } from 'react';
import { api } from '../services/api';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(username, password);
            onLogin(response.user.username);
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="mb-4 text-center" style={{ color: 'var(--primary-color)', fontSize: '2rem' }}>Barokah Rizky</h2>
                <p className="mb-8 text-center text-muted">Wood Sales Management</p>

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            autoFocus
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            disabled={loading}
                            required
                        />
                    </div>
                    {error && <p className="mb-4 text-sm" style={{ color: 'var(--error-color)' }}>{error}</p>}
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <p className="text-muted text-center mb-2">Demo Accounts:</p>
                    <p className="text-muted">👤 owner / owner123</p>
                    <p className="text-muted">👥 customer / customer123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
