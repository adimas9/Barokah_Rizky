import React, { useState } from 'react';

const WageCalculation = ({ onBack, onLogout, onSkip, totalVolume }) => {
    const [wageRate, setWageRate] = useState(0);
    const [inputWageRate, setInputWageRate] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);

    // Helper to parse Indonesian number format
    const parsePrice = (value) => {
        if (!value) return 0;
        const clean = value.toString().replace(/\./g, '');
        const normalized = clean.replace(',', '.');
        return parseFloat(normalized) || 0;
    };

    const handleWageRateChange = (rawValue) => {
        setInputWageRate(rawValue);
        const numericalValue = parsePrice(rawValue);
        setWageRate(numericalValue);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

    const formatVolume = (val) => {
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(val);
    };

    const totalWage = totalVolume * wageRate;

    const handlePrint = () => {
        window.print();
    };

    // Invoice View
    if (showInvoice) {
        return (
            <div className="invoice-container p-8" style={{ background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
                <div className="flex justify-between items-start mb-8 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">BAROKAH RIZKY</h1>
                        <p className="text-sm">Nota Pembayaran Upah Kerja</p>
                        <p className="text-sm">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                        <button onClick={() => setShowInvoice(false)} className="no-print btn-secondary mb-2">Kembali</button>
                        <br />
                        <button onClick={handlePrint} className="no-print btn-primary">Cetak / Simpan PDF</button>
                    </div>
                </div>

                <div className="mb-8 p-6" style={{ background: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 className="text-lg font-bold mb-4">Rincian Upah Kerja</h3>

                    <table className="w-full text-left" style={{ fontSize: '1rem', lineHeight: '2rem' }}>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #ddd' }}>
                                <td className="py-3 font-medium">Total Volume Kayu yang Dikerjakan</td>
                                <td className="py-3 text-right">{formatVolume(totalVolume)} m³</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #ddd' }}>
                                <td className="py-3 font-medium">Upah per m³</td>
                                <td className="py-3 text-right">{formatCurrency(wageRate)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid black', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                <td className="py-4">TOTAL UPAH YANG HARUS DIBAYAR</td>
                                <td className="py-4 text-right">{formatCurrency(totalWage)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-16 flex justify-between text-sm">
                    <div className="text-center w-1/4">
                        <p className="mb-20">Penerima</p>
                        <p className="border-t border-black pt-1">( ....................... )</p>
                    </div>
                    <div className="text-center w-1/4">
                        <p className="mb-20">Hormat Kami</p>
                        <p className="border-t border-black pt-1">( Barokah Rizky )</p>
                    </div>
                </div>

                <style>{`
                    @media print {
                        .no-print { display: none; }
                        .invoice-container { padding: 0; margin: 0; min-height: 0; }
                    }
                `}</style>
            </div>
        );
    }

    // Main Wage Calculation View
    return (
        <div className="container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>Kalkulasi Upah Kerja</h2>
                    <p className="text-muted">Hitung upah berdasarkan volume kayu yang sudah diproses.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={onSkip} className="btn-secondary">Lewati</button>
                    <button onClick={onLogout} className="btn-secondary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>Logout</button>
                </div>
            </div>

            <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.2)' }}>
                    <span style={{ fontSize: '3rem' }}>👷</span>
                    <div>
                        <h3 className="m-0" style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>Perhitungan Upah Kuli</h3>
                        <p className="text-muted m-0">Terpisah dari pencatatan penjualan kayu</p>
                    </div>
                </div>

                {/* Info Summary */}
                <div className="mb-8 p-6" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 text-sm text-muted uppercase tracking-wide">Total Volume Kayu</label>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                {formatVolume(totalVolume)} m³
                            </div>
                            <p className="text-xs text-muted mt-2">Dari transaksi yang baru saja disimpan</p>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-muted uppercase tracking-wide">Upah per m³</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-lg bg-black/30 border-2 border-white/10 text-white text-right focus:border-primary focus:outline-none transition-colors"
                                value={inputWageRate}
                                onChange={(e) => handleWageRateChange(e.target.value)}
                                placeholder="Contoh: 50.000"
                                style={{ fontSize: '1.3rem', fontWeight: 'bold' }}
                                autoFocus
                            />
                            <p className="text-xs text-muted mt-2">Masukkan tarif upah per meter kubik</p>
                        </div>
                    </div>
                </div>

                {/* Total Calculation */}
                <div className="mb-8 p-6" style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)', borderRadius: '12px', border: '2px solid var(--primary-color)' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted mb-1 uppercase tracking-wider">Total Upah yang Harus Dibayar</p>
                            <p className="text-xs text-muted">({formatVolume(totalVolume)} m³ × {formatCurrency(wageRate)})</p>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                            {formatCurrency(totalWage)}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setShowInvoice(true)}
                        className="btn-primary"
                        style={{
                            padding: '1.2rem',
                            fontSize: '1.1rem',
                            background: 'var(--primary-color)',
                            borderColor: 'var(--primary-color)',
                            color: 'black'
                        }}
                        disabled={wageRate === 0}
                    >
                        📄 Buat Nota Upah
                    </button>
                    <button
                        onClick={onSkip}
                        className="btn-secondary"
                        style={{
                            padding: '1.2rem',
                            fontSize: '1.1rem'
                        }}
                    >
                        Selesai Tanpa Nota
                    </button>
                </div>

                <p className="text-center text-muted text-xs mt-6">
                    💡 Tip: Nota upah ini terpisah dari nota penjualan kayu
                </p>
            </div>
        </div>
    );
};

export default WageCalculation;
