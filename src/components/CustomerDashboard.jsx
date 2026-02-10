import React, { useState, useEffect } from 'react';
import WoodInput from './WoodInput';
import Totaling from './Totaling';
import { api } from '../services/api';

const CustomerDashboard = ({ onLogout }) => {
    const [view, setView] = useState('menu'); // menu, input, history
    const [historyData, setHistoryData] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // For Input Flow
    const [inputStep, setInputStep] = useState('input');
    const [currentEntries, setCurrentEntries] = useState([]);
    const [currentTotalVolume, setCurrentTotalVolume] = useState(0);

    useEffect(() => {
        // Load history initially for stats
        loadHistory();
    }, []);

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
        setCurrentTotalVolume(0);
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
            setCurrentTotalVolume(data.totalVolume);
            setShowSuccessModal(true);
            // Reload history to update stats
            loadHistory();
        } catch (error) {
            console.error('Failed to save transaction:', error);
            alert('Gagal menyimpan transaksi. Silakan coba lagi.');
        }
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

    // Success Modal
    if (showSuccessModal) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div className="glass-card" style={{
                    maxWidth: '500px',
                    width: '90%',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '2px solid var(--success-color)',
                    animation: 'fadeIn 0.3s ease-in'
                }}>
                    {/* Success Icon */}
                    <div style={{
                        fontSize: '5rem',
                        marginBottom: '1.5rem',
                        animation: 'bounceIn 0.6s ease-out'
                    }}>✅</div>

                    <h2 style={{
                        color: 'var(--success-color)',
                        fontSize: '2rem',
                        marginBottom: '1rem'
                    }}>Pesanan Berhasil!</h2>

                    <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                        Pesanan kayu Anda telah dikirim ke owner.
                    </p>

                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '12px',
                        marginBottom: '2.5rem',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                        <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                            Ingin input pesanan lagi?
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                            💡 Atau cek riwayat pesanan Anda
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                handleStartInput();
                            }}
                            className="btn-primary"
                            style={{
                                padding: '1rem 1.5rem',
                                fontSize: '1.1rem',
                                background: 'var(--primary-color)',
                                color: 'black'
                            }}
                        >
                            📝 Input Lagi
                        </button>
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                setView('menu');
                            }}
                            className="btn-secondary"
                            style={{
                                padding: '1rem 1.5rem',
                                fontSize: '1.1rem'
                            }}
                        >
                            🏠 Menu Utama
                        </button>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes bounceIn {
                        0% { transform: scale(0); }
                        50% { transform: scale(1.2); }
                        100% { transform: scale(1); }
                    }
                `}</style>
            </div>
        );
    }

    if (view === 'menu') {
        const totalExpenditure = historyData.reduce((sum, tx) => sum + (tx.grandTotal || 0), 0);
        const totalOrders = historyData.length;

        // Calculate wood stats
        const woodCount = { jati: 0, mahoni: 0 };
        const woodExpenditure = { jati: 0, mahoni: 0 };

        historyData.forEach(tx => {
            tx.items?.forEach(item => {
                const itemTotal = (item.volume * item.price); // Approximate item cost
                if (item.type === 'jati') {
                    woodCount.jati++;
                    woodExpenditure.jati += itemTotal;
                } else if (item.type === 'mahoni') {
                    woodCount.mahoni++;
                    woodExpenditure.mahoni += itemTotal;
                }
            });
        });

        const favoriteWood = woodCount.jati >= woodCount.mahoni ? 'Jati' : 'Mahoni';
        const favoriteWoodCount = Math.max(woodCount.jati, woodCount.mahoni);

        // Last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const dayTx = historyData.filter(tx => new Date(tx.date).toDateString() === dateStr);
            const dayExpenditure = dayTx.reduce((sum, tx) => sum + (tx.grandTotal || 0), 0);
            last7Days.push({
                label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
                value: dayExpenditure
            });
        }
        const maxDayExpenditure = Math.max(...last7Days.map(d => d.value), 1);

        // Wood Percentages for Chart
        const totalWoodExpenditure = woodExpenditure.jati + woodExpenditure.mahoni;
        const jatiPercent = totalWoodExpenditure > 0 ? (woodExpenditure.jati / totalWoodExpenditure) * 100 : 0;
        const mahoniPercent = totalWoodExpenditure > 0 ? (woodExpenditure.mahoni / totalWoodExpenditure) * 100 : 0;

        return (
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>Customer Dashboard</h2>
                        <p className="text-muted">Selamat datang! Kelola pesanan kayu Anda dengan mudah.</p>
                    </div>
                    <button onClick={onLogout} className="btn-secondary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>Logout</button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="stats-card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Pengeluaran</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                            {formatCurrency(totalExpenditure)}
                        </div>
                    </div>

                    <div className="stats-card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Pesanan</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)', marginTop: '0.5rem' }}>
                            {totalOrders} Transaksi
                        </div>
                    </div>

                    <div className="stats-card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Kayu Favorit</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                            {favoriteWood}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            {favoriteWoodCount} item dibeli
                        </div>
                    </div>

                    <div className="stats-card">
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Pesanan Terakhir</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                            {historyData.length > 0 ? new Date(historyData[0].date).toLocaleDateString('id-ID') : '-'}
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Wood Type Expenditure Comparison */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📊 Statistik Belanja Kayu</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>🌳 Jati</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    {formatCurrency(woodExpenditure.jati)}
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '12px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${jatiPercent}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #d4a373 0%, #faedcd 100%)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>🪵 Mahoni</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>
                                    {formatCurrency(woodExpenditure.mahoni)}
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '12px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '6px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${mahoniPercent}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>
                    </div>

                    {/* 7 Days Expenditure Chart */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📈 Pengeluaran 7 Hari Terakhir</h3>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '150px' }}>
                            {last7Days.map((day, idx) => {
                                const barHeight = maxDayExpenditure > 0 ? (day.value / maxDayExpenditure) * 100 : 0;
                                return (
                                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{
                                            width: '100%',
                                            height: '120px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            position: 'relative'
                                        }}>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: `${barHeight}%`,
                                                    background: barHeight > 0
                                                        ? 'linear-gradient(180deg, #d4a373 0%, rgba(212, 163, 115, 0.3) 100%)'
                                                        : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '4px 4px 0 0',
                                                    transition: 'height 0.3s ease',
                                                    minHeight: barHeight > 0 ? '8px' : '2px'
                                                }}
                                                title={formatCurrency(day.value)}
                                            ></div>
                                        </div>
                                        <div className="text-muted" style={{ fontSize: '0.7rem', textAlign: 'center' }}>
                                            {day.label}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8" style={{ marginTop: '2rem' }}>
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
                        }}>Input Pesanan</h3>
                        <p className="text-muted" style={{ fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>Hitung volume dan buat pesanan baru</p>
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
                        }}>📜</div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: 'var(--primary-color)',
                            position: 'relative',
                            zIndex: 1
                        }}>Riwayat Pesanan</h3>
                        <p className="text-muted" style={{ fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>Lihat status dan detail pesanan Anda</p>
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
                    onBack={() => setView('menu')}
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
                        <h2 className="m-0" style={{ color: 'var(--primary-color)', fontSize: '1.75rem' }}>Riwayat Pesanan Saya</h2>
                    </div>
                </div>

                <div className="glass-card">
                    {historyData.length === 0 ? (
                        <div className="text-center py-16">
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📭</div>
                            <p className="text-muted" style={{ fontSize: '1.1rem' }}>Belum ada riwayat pesanan.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-muted text-sm uppercase" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                        <th className="p-4">Tanggal</th>
                                        <th className="p-4 text-center">Total Item</th>
                                        <th className="p-4 text-right">Total Volume</th>
                                        <th className="p-4 text-right">Total Biaya</th>
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
