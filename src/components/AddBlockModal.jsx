import React, { useState } from 'react';
import { Edit3, Plus, Lock, Save, X } from 'lucide-react';
import { CATEGORIES, DAYS, BLOCK_TYPES, ENERGY_LEVELS, generateId } from '../store';

export default function AddBlockModal({ onSave, onClose, initial = {} }) {
    const [form, setForm] = useState({
        title: initial.title || '',
        type: initial.type || 'event',
        category: initial.category || 'study',
        day: initial.day ?? 0,
        startHour: initial.startHour ?? 9,
        startMin: initial.startMin ?? 0,
        endHour: initial.endHour ?? 10,
        endMin: initial.endMin ?? 0,
        isHard: initial.isHard ?? false,
        energy: initial.energy || 'medium',
        repeat: initial.repeat || [],
    });

    const updateForm = (key, value) => setForm({ ...form, [key]: value });

    const handleSave = () => {
        if (!form.title.trim()) return;
        onSave({
            id: initial.id || generateId(),
            ...form,
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {initial.id ? <><Edit3 size={18} /> Sửa Block</> : <><Plus size={18} /> Thêm Block mới</>}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Title */}
                    <div>
                        <label className="label">Tiêu đề</label>
                        <input
                            className="input"
                            placeholder="Vd: Toán cao cấp, Gym, Cà phê..."
                            value={form.title}
                            onChange={e => updateForm('title', e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="label">Loại</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {Object.entries(BLOCK_TYPES).map(([key, bt]) => (
                                <button
                                    key={key}
                                    className={`filter-chip ${form.type === key ? 'active' : ''}`}
                                    onClick={() => updateForm('type', key)}
                                >
                                    {bt.icon} {bt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="label">Category</label>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {Object.entries(CATEGORIES).map(([key, cat]) => (
                                <button
                                    key={key}
                                    className={`filter-chip ${form.category === key ? 'active' : ''}`}
                                    onClick={() => updateForm('category', key)}
                                    style={{
                                        borderColor: form.category === key ? cat.color : undefined,
                                    }}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Day */}
                    <div>
                        <label className="label">Ngày</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {DAYS.map((d, i) => (
                                <button
                                    key={i}
                                    className={`filter-chip ${form.day === i ? 'active' : ''}`}
                                    onClick={() => updateForm('day', i)}
                                    style={{ padding: '6px 10px', minWidth: 36 }}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time */}
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <label className="label">Bắt đầu</label>
                            <input
                                type="time"
                                className="input"
                                value={`${String(form.startHour).padStart(2, '0')}:${String(form.startMin).padStart(2, '0')}`}
                                onChange={e => {
                                    const [h, m] = e.target.value.split(':').map(Number);
                                    setForm({ ...form, startHour: h, startMin: m });
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">Kết thúc</label>
                            <input
                                type="time"
                                className="input"
                                value={`${String(form.endHour).padStart(2, '0')}:${String(form.endMin).padStart(2, '0')}`}
                                onChange={e => {
                                    const [h, m] = e.target.value.split(':').map(Number);
                                    setForm({ ...form, endHour: h, endMin: m });
                                }}
                            />
                        </div>
                    </div>

                    {/* Energy */}
                    <div>
                        <label className="label">Mức năng lượng</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {Object.entries(ENERGY_LEVELS).map(([key, eng]) => (
                                <button
                                    key={key}
                                    className={`filter-chip ${form.energy === key ? 'active' : ''}`}
                                    onClick={() => updateForm('energy', key)}
                                >
                                    {eng.icon} {eng.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hard/Soft */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Lock size={14} /> Hard Block
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Block cố định, không tự động dời
                            </div>
                        </div>
                        <button
                            className={`toggle ${form.isHard ? 'active' : ''}`}
                            onClick={() => updateForm('isHard', !form.isHard)}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>Huỷ</button>
                    <button className="btn btn-primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {initial.id ? <><Save size={14} /> Lưu</> : <><Plus size={14} /> Thêm Block</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
