import React, { useState } from 'react';
import { WOOD_TYPES, DIAMETER_RANGES } from '../data/constants';
import volumeData from '../data/volumeTable.json';

const WoodInput = ({ onFinish, onLogout, enableNameInput = false, onBack = null }) => {
    const [entries, setEntries] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [form, setForm] = useState({
        type: 'jati',
        length: '',
        diameter: ''
    });

    const getDiameterClass = (d) => {
        const num = parseFloat(d);
        if (isNaN(num)) return '-';
        const range = DIAMETER_RANGES.find(r => num >= r.min && num <= r.max);
        return range ? range.name : 'Other';
    };

    const calculateIsi = (type, len, dia) => {
        const typeData = volumeData[type];
        if (!typeData) return 0;

        const diameterKey = String(dia);
        const lengthKey = String(len);

        const diameterData = typeData[diameterKey];
        if (!diameterData) return 0;

        return diameterData[lengthKey] || 0;
    };

    const formatIsi = (val, type) => {
        if (typeof val !== 'number') return val;
        // Jati: always 3 decimals (0,150)
        // Mahoni: flexible, remove trailing zeros (0,16)
        if (type === 'jati') {
            return val.toFixed(3).replace('.', ',');
        }
        return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 3 }).format(val);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!form.length || !form.diameter) return;

        const isi = calculateIsi(form.type, form.length, form.diameter);
        const dClass = getDiameterClass(form.diameter);

        const newEntry = {
            id: Date.now(),
            type: form.type,
            length: parseInt(form.length),
            diameter: parseInt(form.diameter),
            diameterClass: dClass,
            isi: isi
        };

        setEntries([...entries, newEntry]);
        setForm({ ...form, diameter: '' });
    };

    const handleRemove = (id) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    return (
        <div className="container">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 style={{ color: 'var(--primary-color)' }}>Input Data Kayu</h2>
                    <p className="text-muted">Masukkan detail kayu untuk perhitungan.</p>
                </div>
                <div className="flex gap-4">
                    {onBack && (
                        <button onClick={onBack} className="btn-secondary">← Kembali</button>
                    )}
                    <button onClick={onLogout} className="btn-secondary">Logout</button>
                    <button
                        onClick={() => onFinish(entries, customerName)}
                        className="btn-primary"
                        disabled={entries.length === 0 || (enableNameInput && !customerName.trim())}
                    >
                        Lanjut ke Penotalan
                    </button>
                </div>
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 2fr' }}>
                {/* Input Form */}
                <div className="glass-card" style={{ height: 'fit-content' }}>
                    <h3 className="mb-4">Form Input</h3>
                    {enableNameInput && (
                        <div className="mb-4">
                            <label className="block mb-2 text-sm text-primary font-bold">Nama Customer</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                placeholder="Masukkan nama pembeli..."
                                className="w-full p-2 rounded bg-black/20 border border-white/10 text-white"
                            />
                        </div>
                    )}
                    <form onSubmit={handleAdd}>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm">Jenis Kayu</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            >
                                {WOOD_TYPES.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-sm">Panjang (cm)</label>
                            <input
                                type="number"
                                value={form.length}
                                onChange={e => setForm({ ...form, length: e.target.value })}
                                placeholder="Ex: 200"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 text-sm">Diameter (cm)</label>
                            <input
                                type="number"
                                value={form.diameter}
                                onChange={e => setForm({ ...form, diameter: e.target.value })}
                                placeholder="Ex: 19"
                            />
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-muted">
                                Kelas: <span style={{ color: 'var(--primary-color)' }}>
                                    {form.diameter ? getDiameterClass(form.diameter) : '-'}
                                </span>
                            </p>
                            {form.length && form.diameter && (
                                <p className="text-sm text-muted">Isi (Preview): {formatIsi(calculateIsi(form.type, form.length, form.diameter), form.type)}</p>
                            )}
                        </div>

                        <button type="submit" className="btn-primary w-full">+ Tambah ke List</button>
                    </form>
                </div>

                {/* Tables Grouped by Class */}
                <div className="glass-card" style={{ height: 'fit-content', maxHeight: '80vh', overflowY: 'auto' }}>
                    <h3 className="mb-4">Daftar Input ({entries.length})</h3>

                    {entries.length === 0 ? (
                        <p className="text-muted text-center py-8">Belum ada data input.</p>
                    ) : (
                        // Get unique classes
                        [...new Set(entries.map(e => e.diameterClass))].sort().map(dClass => {
                            const classEntries = entries.filter(e => e.diameterClass === dClass);
                            const classTotal = classEntries.reduce((sum, e) => sum + (e.isi || 0), 0);

                            return (
                                <div key={dClass} className="mb-6">
                                    <div className="flex justify-between items-center mb-2 px-2"
                                        style={{ borderLeft: '4px solid var(--primary-color)', background: 'rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: 'var(--primary-color)', margin: '0.5rem 0' }}>Kelas {dClass}</h4>
                                        <span className="text-sm">Total: <strong>{formatIsi(classTotal, classEntries[0]?.type)}</strong></span>
                                    </div>
                                    <div className="table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Jenis</th>
                                                    <th>P (cm)</th>
                                                    <th>D (cm)</th>
                                                    <th>Isi</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {classEntries.map(e => (
                                                    <tr key={e.id}>
                                                        <td>{WOOD_TYPES.find(t => t.id === e.type)?.name}</td>
                                                        <td>{e.length}</td>
                                                        <td>{e.diameter}</td>
                                                        <td>{formatIsi(e.isi, e.type)}</td>
                                                        <td>
                                                            <button
                                                                onClick={() => handleRemove(e.id)}
                                                                style={{ color: 'var(--error-color)', background: 'none' }}
                                                            >
                                                                Hapus
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default WoodInput;
