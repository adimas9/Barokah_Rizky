import React, { useState, useEffect } from 'react';
import WoodInput from './WoodInput';
import Totaling from './Totaling';
import WageCalculation from './WageCalculation';
import { api } from '../services/api';

const OwnerDashboard = ({ onLogout }) => {
    const [view, setView] = useState('menu'); // menu, input, history
    const [historyTab, setHistoryTab] = useState('self'); // self, customer
    const [historyData, setHistoryData] = useState([]);
    const [fetchError, setFetchError] = useState(null); // New error state
    const [allTransactions, setAllTransactions] = useState([]); // For dashboard stats

    // For Input Flow
    const [inputStep, setInputStep] = useState('input'); // input, totaling, wage
    const [currentEntries, setCurrentEntries] = useState([]);
    const [currentCustomerName, setCurrentCustomerName] = useState('');
    const [currentTotalVolume, setCurrentTotalVolume] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        // Load all transactions on mount for dashboard stats
        loadAllTransactions();
    }, []);

    useEffect(() => {
        if (view === 'history') {
            loadHistory();
        }
    }, [view, historyTab]);

    const loadAllTransactions = async () => {
        try {
            // Fetch both owner and customer transactions for stats
            const [ownerTx, customerTx] = await Promise.all([
                api.getTransactions({ isOwnerInput: 'true' }),
                api.getTransactions({ isOwnerInput: 'false' })
            ]);
            setAllTransactions([...ownerTx, ...customerTx]);
        } catch (error) {
            console.error('Failed to load all transactions:', error);
            setAllTransactions([]);
        }
    };

    const loadHistory = async () => {
        try {
            setFetchError(null);
            const data = await api.getTransactions({ isOwnerInput: historyTab === 'self' ? 'true' : 'false' });
            setHistoryData(data);
        } catch (error) {
            console.error('Failed to load history:', error);
            setFetchError(error.message || 'Gagal memuat data');
            setHistoryData([]);
        }
    };

    const handleStartInput = () => {
        setView('input');
        setInputStep('input');
        setCurrentEntries([]);
        setCurrentCustomerName('');
    };

    const handleInputFinish = (entries, name) => {
        setCurrentEntries(entries);
        setCurrentCustomerName(name);
        setInputStep('totaling');
    };

    const handleSaveTransaction = async (data) => {
        try {
            await api.saveTransaction({
                customerName: currentCustomerName,
                items: data.items,
                grandTotal: data.grandTotal,
                totalVolume: data.totalVolume,
                isOwnerInput: true,
                createdBy: 'owner'
            });
            // Save total volume for wage calculation
            setCurrentTotalVolume(data.totalVolume);
            // Show success modal instead of directly navigating
            setShowSuccessModal(true);
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
                    }}>Transaksi Berhasil Disimpan!</h2>

                    <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                        Data penjualan kayu telah tersimpan ke database.
                    </p>

                    <div style={{
                        padding: '1.5rem',
                        background: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '12px',
                        marginBottom: '2.5rem',
                        border: '1px solid rgba(212, 175, 55, 0.3)'
                    }}>
                        <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                            Lanjutkan untuk menghitung upah kerja?
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                            💡 Atau kembali ke menu untuk input transaksi lain
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                setInputStep('wage');
                            }}
                            className="btn-primary"
                            style={{
                                padding: '1rem 1.5rem',
                                fontSize: '1.1rem',
                                background: 'var(--primary-color)',
                                color: 'black'
                            }}
                        >
                            👷 Hitung Upah
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
                            🏠 Kembali ke Menu
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
        return (
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>Owner Dashboard</h2>
                        <p className="text-muted">Selamat datang, Owner. Kelola bisnis kayu Anda dengan mudah.</p>
                    </div>
                    <button onClick={onLogout} className="btn-secondary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>Logout</button>
                </div>

                {/* Statistics Section */}
                {(() => {
                    const today = new Date().toDateString();
                    const todayTx = allTransactions.filter(tx => new Date(tx.date || tx.created_at).toDateString() === today);

                    const totalRevenue = allTransactions.reduce((sum, tx) => sum + (tx.grandTotal || 0), 0);
                    const todayRevenue = todayTx.reduce((sum, tx) => sum + (tx.grandTotal || 0), 0);

                    // Count wood types
                    const woodCount = { jati: 0, mahoni: 0 };
                    allTransactions.forEach(tx => {
                        tx.items?.forEach(item => {
                            if (item.type === 'jati') woodCount.jati++;
                            else if (item.type === 'mahoni') woodCount.mahoni++;
                        });
                    });
                    const topWood = woodCount.jati >= woodCount.mahoni ? 'Jati' : 'Mahoni';

                    return (
                        <div className="grid grid-cols-4 gap-4 mb-8">
                            <div className="stats-card">
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
                                <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Revenue</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                                    {formatCurrency(totalRevenue)}
                                </div>
                            </div>

                            <div className="stats-card">
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
                                <div className="text-muted" style={{ fontSize: '0.875rem' }}>Penjualan Hari Ini</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)', marginTop: '0.5rem' }}>
                                    {todayTx.length} Transaksi
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    {formatCurrency(todayRevenue)}
                                </div>
                            </div>

                            <div className="stats-card">
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                                <div className="text-muted" style={{ fontSize: '0.875rem' }}>Kayu Terlaris</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                                    {topWood}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    {Math.max(woodCount.jati, woodCount.mahoni)} item terjual
                                </div>
                            </div>

                            <div className="stats-card">
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
                                <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Transaksi</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '0.5rem' }}>
                                    {allTransactions.length}
                                </div>
                                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                    Semua waktu
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* Chart Diagrams */}
                {(() => {
                    const allTransactions = historyData;

                    // Wood type comparison
                    const woodStats = { jati: { count: 0, revenue: 0 }, mahoni: { count: 0, revenue: 0 } };
                    allTransactions.forEach(tx => {
                        tx.items?.forEach(item => {
                            if (item.type === 'jati') {
                                woodStats.jati.count++;
                            } else if (item.type === 'mahoni') {
                                woodStats.mahoni.count++;
                            }
                        });
                        // Simplified revenue split (equal distribution for demo)
                        const jatiItems = tx.items?.filter(i => i.type === 'jati').length || 0;
                        const mahoniItems = tx.items?.filter(i => i.type === 'mahoni').length || 0;
                        const totalItems = jatiItems + mahoniItems;
                        if (totalItems > 0) {
                            woodStats.jati.revenue += (tx.grandTotal || 0) * (jatiItems / totalItems);
                            woodStats.mahoni.revenue += (tx.grandTotal || 0) * (mahoniItems / totalItems);
                        }
                    });

                    const maxRevenue = Math.max(woodStats.jati.revenue, woodStats.mahoni.revenue);
                    const jatiPercent = maxRevenue > 0 ? (woodStats.jati.revenue / maxRevenue) * 100 : 0;
                    const mahoniPercent = maxRevenue > 0 ? (woodStats.mahoni.revenue / maxRevenue) * 100 : 0;

                    // Last 7 days sales
                    const last7Days = [];
                    for (let i = 6; i >= 0; i--) {
                        const date = new Date();
                        date.setDate(date.getDate() - i);
                        const dateStr = date.toDateString();
                        const dayTx = allTransactions.filter(tx => new Date(tx.date).toDateString() === dateStr);
                        const dayRevenue = dayTx.reduce((sum, tx) => sum + (tx.grandTotal || 0), 0);
                        last7Days.push({
                            label: date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
                            value: dayRevenue
                        });
                    }
                    const maxDayRevenue = Math.max(...last7Days.map(d => d.value), 1);

                    return (
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            {/* Wood Type Comparison */}
                            <div className="glass-card">
                                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📊 Perbandingan Kayu</h3>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>🌳 Jati</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                            {formatCurrency(woodStats.jati.revenue)}
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
                                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                        {woodStats.jati.count} item terjual
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>🪵 Mahoni</span>
                                        <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>
                                            {formatCurrency(woodStats.mahoni.revenue)}
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
                                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                        {woodStats.mahoni.count} item terjual
                                    </div>
                                </div>
                            </div>

                            {/* 7 Days Sales Chart */}
                            <div className="glass-card">
                                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>📈 Penjualan 7 Hari Terakhir</h3>

                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '150px' }}>
                                    {last7Days.map((day, idx) => {
                                        const barHeight = maxDayRevenue > 0 ? (day.value / maxDayRevenue) * 100 : 0;
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

                                {maxDayRevenue > 0 && (
                                    <div className="text-muted text-center" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
                                        Puncak: {formatCurrency(maxDayRevenue)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}


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
                        }}>📝</div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: 'var(--primary-color)',
                            position: 'relative',
                            zIndex: 1
                        }}>Input Baru</h3>
                        <p style={{ fontSize: '0.95rem', position: 'relative', zIndex: 1, color: '#e2e8f0' }}>Input data penjualan manual dengan nama customer</p>
                    </button>

                    <button
                        onClick={() => { setView('history'); setHistoryTab('self'); }}
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
                        }}>📋</div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            marginBottom: '0.75rem',
                            color: 'var(--primary-color)',
                            position: 'relative',
                            zIndex: 1
                        }}>Riwayat Transaksi</h3>
                        <p style={{ fontSize: '0.95rem', position: 'relative', zIndex: 1, color: '#e2e8f0' }}>Lihat semua transaksi owner & customer</p>
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
                    enableNameInput={true}
                    onBack={() => setView('menu')}
                />
            );
        }
        if (inputStep === 'totaling') {
            return (
                <Totaling
                    entries={currentEntries}
                    customerName={currentCustomerName}
                    onBack={() => setInputStep('input')}
                    onLogout={onLogout}
                    onSave={handleSaveTransaction}
                    isOwner={false}
                />
            );
        }
        if (inputStep === 'wage') {
            return (
                <WageCalculation
                    totalVolume={currentTotalVolume}
                    onLogout={onLogout}
                    onSkip={() => {
                        alert('Transaksi berhasil disimpan!');
                        setView('menu');
                    }}
                />
            );
        }
    }

    if (view === 'history') {
        return (
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('menu')} className="btn-secondary">← Kembali</button>
                        <h2 className="m-0" style={{ color: 'var(--primary-color)', fontSize: '1.75rem' }}>Riwayat Transaksi</h2>
                    </div>
                </div>

                <div className="flex gap-4 mb-6 border-b pb-4" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                    <button
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${historyTab === 'self' ? 'text-black' : 'text-muted hover:text-white'}`}
                        style={historyTab === 'self' ? { background: 'var(--primary-color)', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' } : {}}
                        onClick={() => setHistoryTab('self')}
                    >
                        📝 Input Sendiri
                    </button>
                    <button
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${historyTab === 'customer' ? 'text-black' : 'text-muted hover:text-white'}`}
                        style={historyTab === 'customer' ? { background: 'var(--primary-color)', boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)' } : {}}
                        onClick={() => setHistoryTab('customer')}
                    >
                        👥 Input Customer
                    </button>
                </div>

                <div className="glass-card">
                    {historyData.length === 0 ? (
                        <div className="text-center py-16">
                            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>
                                {fetchError ? '⚠️' : '📭'}
                            </div>
                            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                                {fetchError
                                    ? `Error: ${fetchError}. Pastikan backend running!`
                                    : 'Belum ada riwayat transaksi.'}
                            </p>
                            {fetchError && (
                                <button className="btn-primary mt-4" onClick={() => loadHistory()}>
                                    🔄 Coba Lagi
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b text-muted text-sm uppercase" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
                                        <th className="p-4">Tanggal</th>
                                        <th className="p-4">Customer</th>
                                        <th className="p-4 text-center">Total Item</th>
                                        <th className="p-4 text-right">Total Volume</th>
                                        <th className="p-4 text-right">Total Harga</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map(tx => (
                                        <tr key={tx.id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                                            <td className="p-4">
                                                {new Date(tx.date).toLocaleDateString('id-ID')} <br />
                                                <span className="text-xs text-muted">{new Date(tx.date).toLocaleTimeString('id-ID')}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold" style={{ color: 'var(--primary-color)' }}>
                                                    {tx.customerName || '-'}
                                                </span>
                                                <br />
                                                <span className="text-xs text-muted">
                                                    {tx.isOwnerInput ? '📝 Direct Input' : '🌐 Online Input'}
                                                </span>
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

export default OwnerDashboard;
