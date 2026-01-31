import React, { useState, useMemo } from 'react';
import { WOOD_TYPES } from '../data/constants';

const Totaling = ({ entries, onBack, onLogout, onSave, customerName, isOwner = false }) => {
    // Determine all unique (Type, Class) combinations
    const groups = useMemo(() => {
        const uniqueKeys = new Set(entries.map(e => `${e.type}|${e.diameterClass}`));
        return Array.from(uniqueKeys).map(key => {
            const [type, dClass] = key.split('|');
            return { type, dClass };
        }).sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            return a.dClass.localeCompare(b.dClass);
        });
    }, [entries]);

    // State for prices keyed by "type|class"
    const [prices, setPrices] = useState({});
    // Local state for input values to allow formatting (e.g. "1.200.000")
    const [inputPrices, setInputPrices] = useState({});

    const [showInvoice, setShowInvoice] = useState(false);

    // Helper to parse Indonesian number format: 1.200.000 -> 1200000
    const parsePrice = (value) => {
        if (!value) return 0;
        // Remove dots (thousands separator)
        const clean = value.toString().replace(/\./g, '');
        // Replace comma with dot if present (though usually price is integer)
        const normalized = clean.replace(',', '.');
        return parseFloat(normalized) || 0;
    };

    const handlePriceChange = (key, rawValue) => {
        setInputPrices(prev => ({ ...prev, [key]: rawValue }));
        const numericalValue = parsePrice(rawValue);
        setPrices(prev => ({ ...prev, [key]: numericalValue }));
    };


    const totals = useMemo(() => {
        let grandTotal = 0;
        const groupTotals = {};

        groups.forEach(group => {
            const key = `${group.type}|${group.dClass}`;
            const groupEntries = entries.filter(e => e.type === group.type && e.diameterClass === group.dClass);
            const totalIsi = groupEntries.reduce((sum, e) => sum + (e.isi || 0), 0);

            const price = prices[key] || 0;
            // Formula: TotalIsi * Price (Direct calculation)
            const finalValue = price * totalIsi;

            groupTotals[key] = {
                totalIsi,
                basePrice: price,
                finalValue
            };
            grandTotal += finalValue;
        });

        return { groupTotals, grandTotal, totalVolume: Object.values(groupTotals).reduce((sum, g) => sum + g.totalIsi, 0) };
    }, [entries, prices, groups]);

    const formatIsi = (val, type) => {
        if (typeof val !== 'number') return val;
        // Jati: always 3 decimals (0,150)
        // Mahoni: flexible, remove trailing zeros (0,16)
        if (type === 'jati') {
            return val.toFixed(3).replace('.', ',');
        }
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(val);
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
    };

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
                        <p className="text-sm">Nota Penjualan Kayu</p>
                        <p className="text-sm">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {customerName && <p className="text-sm mt-2">Yth. {customerName}</p>}
                    </div>
                    <div className="text-right">
                        <button onClick={() => setShowInvoice(false)} className="no-print btn-secondary mb-2">Kembali</button>
                        <br />
                        <button onClick={handlePrint} className="no-print btn-primary">Cetak / Simpan PDF</button>
                    </div>
                </div>

                <table className="w-full text-left" style={{ borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid black' }}>
                            <th className="py-2">No</th>
                            <th className="py-2">Jenis</th>
                            <th className="py-2">Kelas</th>
                            <th className="py-2" style={{ textAlign: 'right' }}>Total Isi (m³)</th>
                            <th className="py-2" style={{ textAlign: 'right' }}>Harga Satuan</th>
                            <th className="py-2" style={{ textAlign: 'right' }}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {groups.map((group, idx) => {
                            const key = `${group.type}|${group.dClass}`;
                            const data = totals.groupTotals[key];
                            const typeName = WOOD_TYPES.find(t => t.id === group.type)?.name;

                            return (
                                <tr key={key} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td className="py-2">{idx + 1}</td>
                                    <td className="py-2 capitalize">{typeName}</td>
                                    <td className="py-2 font-medium">{group.dClass}</td>
                                    <td className="py-2" style={{ textAlign: 'right' }}>{formatIsi(data.totalIsi, group.type)}</td>
                                    <td className="py-2" style={{ textAlign: 'right' }}>{formatCurrency(data.basePrice)}</td>
                                    <td className="py-2 font-bold" style={{ textAlign: 'right' }}>{formatCurrency(data.finalValue)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr style={{ borderTop: '2px solid black', fontSize: '1.2rem' }}>
                            <td colSpan="5" className="py-4 font-bold text-right">TOTAL AKHIR</td>
                            <td className="py-4 font-bold text-right">{formatCurrency(totals.grandTotal)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mt-16 flex justify-between text-sm">
                    <div className="text-center w-1/4">
                        <p className="mb-20">Penerima</p>
                        <p className="border-t border-black pt-1">( {customerName || '...........................'} )</p>
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

    return (
        <div className="container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 style={{ color: 'var(--primary-color)' }}>Penotalan & Perhitungan</h2>
                    <p className="text-muted">Masukkan harga per kelas kayu.</p>
                </div>
                <div>
                    <button onClick={onBack} className="btn-secondary" style={{ marginRight: '1rem' }}>Kembali</button>
                    <button onClick={onLogout} className="btn-secondary" style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>Logout</button>
                </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 2fr' }}>

                {/* Cost Calculation Panel (Left) */}
                <div className="glass-card" style={{ height: 'fit-content', maxHeight: '80vh', overflowY: 'auto' }}>
                    <h3 className="mb-4">Input Harga Per Kelas</h3>

                    {groups.map(group => {
                        const key = `${group.type}|${group.dClass}`;
                        const typeName = WOOD_TYPES.find(t => t.id === group.type)?.name;
                        const data = totals.groupTotals[key];

                        return (
                            <div key={key} className="mb-6 p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="m-0" style={{ color: 'var(--primary-color)' }}>{typeName} - Kelas {group.dClass}</h4>
                                </div>

                                <div className="mb-3">
                                    <label className="block mb-1 text-xs text-muted">Harga per m³</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                                        value={inputPrices[key] || ''}
                                        onChange={(e) => handlePriceChange(key, e.target.value)}
                                        placeholder="Contoh: 1.200.000"
                                    />
                                </div>

                                <div className="text-sm grid grid-cols-2 gap-2 text-muted">
                                    <div>Isi: <span className="text-white">{formatIsi(data.totalIsi, group.type)}</span></div>
                                    <div style={{ textAlign: 'right' }}>Subtotal: <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>{formatCurrency(data.finalValue)}</span></div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Total Grand */}
                    <div className="mt-8 mb-10 pt-6" style={{ borderTop: '2px solid var(--border-color)' }}>
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-right w-full">
                                <div className="text-muted text-sm mb-2 uppercase tracking-wider">Total Penjualan Kayu</div>
                                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                                    {formatCurrency(totals.grandTotal)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowInvoice(true)}
                            className="btn-primary w-full"
                            style={{ marginBottom: '3rem', fontSize: '1.1rem', padding: '1rem' }}
                        >
                            Buat Nota / Invoice
                        </button>
                    </div>



                    <div className="mt-8">
                        <button
                            onClick={() => onSave({
                                items: entries,
                                prices,
                                grandTotal: totals.grandTotal,
                                totalVolume: groups.reduce((acc, g) => acc + (totals.groupTotals[`${g.type}|${g.dClass}`]?.totalIsi || 0), 0)
                            })}
                            className="btn-primary w-full"
                            style={{
                                background: 'var(--success-color)',
                                borderColor: 'var(--success-color)',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                marginTop: '1rem'
                            }}
                        >
                            Selesai & Simpan Transaksi
                        </button>
                    </div>
                </div>

                {/* Detailed Table (Right) */}
                <div className="glass-card">
                    <h3 className="mb-4">Rincian Item</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Jenis</th>
                                    <th>Kelas</th>
                                    <th>Ukuran</th>
                                    <th>Isi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((e, idx) => (
                                    <tr key={e.id}>
                                        <td>{idx + 1}</td>
                                        <td>{WOOD_TYPES.find(t => t.id === e.type)?.name}</td>
                                        <td>
                                            <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                                {e.diameterClass}
                                            </span>
                                        </td>
                                        <td>{e.length} x {e.diameter}</td>
                                        <td>{formatIsi(e.isi, e.type)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div >
    );
};

export default Totaling;
