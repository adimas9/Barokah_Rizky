import React, { useState, useEffect } from 'react';
import WoodInput from './WoodInput';
import Totaling from './Totaling';
import { api } from '../services/api';

const CustomerDashboard = ({ onLogout }) => {
    const [view, setView] = useState('menu'); // menu, input, history
    const [historyData, setHistoryData] = useState([]);

    // For Input Flow
    const [inputStep, setInputStep] = useState('input');
    const [currentEntries, setCurrentEntries] = useState([]);

    useEffect(() => {
        if (view === 'history') {
            loadHistory();
        }
    }, [view]);

    const loadHistory = async () => {
        try {
            const data = await api.getTransactions({ isOwnerInput: 'false', createdBy: 'customer' });
            setHistoryData(data);
        } catch (error) {
            console.error('Failed to load history:', error);
            setHistoryData([]);
        }
    };

    const handleStartInput = () => {
        setView('input');
        setInputStep('input');
        setCurrentEntries([]);
    };

    const handleInputFinish = (entries) => {
        setCurrentEntries(entries);
        setInputStep('totaling');
    };

    const handleSaveTransaction = async (data) => {
        try {
            await api.saveTransaction({
                customerName: 'Online User',
                items: data.items,
                grandTotal: data.grandTotal,
                totalVolume: data.totalVolume,
                isOwnerInput: false,
                createdBy: 'customer'
            });
            alert('Transaksi berhasil disimpan! Admin/Owner akan memverifikasi.');
            setView('menu');
        } catch (error) {
            console.error('Failed to save transaction:', error);
            alert('Gagal menyimpan transaksi. Silakan coba lagi.');
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    if (view === 'menu') {
        return (
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>Customer Dashboard</h2>
                        <p className="text-muted">Selamat datang! Kelola pesanan kayu Anda dengan mudah.</p>
                    </div>
                    <button onClick={onLogout} className="btn-secondary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>Logout</button>
                </div>

                <div className="grid grid-cols-2 gap-8" style={{ marginTop: '3rem' }}>
                    <button
                        onClick={handleStartInput}
                        className="glass-card flex flex-col items-center justify-center p-10 transition-all text-center"
                        style={{
                            minHeight: '260px',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)',
                            border: '2px solid rgba(212, 175, 55, 0.4)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(212, 175, 55, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1.5rem',
                            filter: 'drop-shadow(0 6px 12px rgba(212, 175, 55, 0.4))',
                            position: 'relative',
                            zIndex: 1
                        }}>🧱</div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: 'var(--primary-color)',
                            position: 'relative',
                            zIndex: 1
                        }}>Input Kayu</h3>
                        <p className="text-muted" style={{ fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>Hitung volume dan ajukan pesanan</p>
                    </button>

                    <button
                        onClick={() => setView('history')}
                        className="glass-card flex flex-col items-center justify-center p-10 transition-all text-center"
                        style={{
                            minHeight: '260px',
                            cursor: 'pointer',
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)',
                            border: '2px solid rgba(212, 175, 55, 0.4)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                            e.currentTarget.style.borderColor = 'var(--primary-color)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(212, 175, 55, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
                            pointerEvents: 'none'
                        }}></div>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1.5rem',
                            filter: 'drop-shadow(0 6px 12px rgba(212, 175, 55, 0.4))',
                            position: 'relative',
                            zIndex: 1
                        }}>🕒</div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: 'var(--primary-color)',
                            position: 'relative',
                            zIndex: 1
                        }}>Riwayat Saya</h3>
                        <p className="text-muted" style={{ fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>Lihat semua pesanan sebelumnya</p>
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'input') {
        if (inputStep === 'input') {
            return (
                <WoodInput
                    onFinish={handleInputFinish}
                    onLogout={onLogout}
                    enableNameInput={false}
                />
            );
        }
        return (
            <Totaling
                entries={currentEntries}
                onBack={() => setInputStep('input')}
                onLogout={onLogout}
                onSave={handleSaveTransaction}
            />
        );
    }

    if (view === 'history') {
        return (
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('menu')} className="btn-secondary">← Kembali</button>
                        <h2 className="m-0" style={{ color: 'var(--primary-color)', fontSize: '1.75rem' }}>Riwayat Input Saya</h2>
                    </div>
                </div>

                <div className="glass-card">
                    {historyData.length === 0 ? (
                        <div className="text-center py-16">
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📭</div>
                            <p className="text-muted" style={{ fontSize: '1.1rem' }}>Belum ada riwayat transaksi.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-muted text-sm uppercase" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                        <th className="p-4">Tanggal</th>
                                        <th className="p-4 text-center">Total Item</th>
                                        <th className="p-4 text-right">Total Volume</th>
                                        <th className="p-4 text-right">Estimasi Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map(tx => (
                                        <tr key={tx.id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                                            <td className="p-4">
                                                {new Date(tx.date).toLocaleDateString('id-ID')} <br />
                                                <span className="text-xs text-muted">{new Date(tx.date).toLocaleTimeString('id-ID')}</span>
                                            </td>
                                            <td className="p-4 text-center font-semibold">{tx.items.length}</td>
                                            <td className="p-4 text-right font-semibold">{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(tx.totalVolume)} m³</td>
                                            <td className="p-4 text-right font-bold" style={{ color: 'var(--success-color)', fontSize: '1.1rem' }}>
                                                {formatCurrency(tx.grandTotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }
};

export default CustomerDashboard;
