import React, { useState, useRef, useEffect } from 'react';
import { Zap, Clock, CalendarDays, Save, X } from 'lucide-react';
import { parseQuickAdd, CATEGORIES, DAYS, generateId } from '../store';

export default function QuickAdd({ onSave, onClose }) {
    const [text, setText] = useState('');
    const [parsed, setParsed] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (text.trim().length > 2) {
            setParsed(parseQuickAdd(text));
        } else {
            setParsed(null);
        }
    }, [text]);

    const handleSave = () => {
        if (!parsed) return;
        const days = parsed.day.length > 0 ? parsed.day : [0]; // default to Monday

        for (const day of days) {
            onSave({
                id: generateId(),
                title: parsed.title,
                type: 'event',
                category: parsed.category,
                day,
                startHour: parsed.startHour || 9,
                startMin: parsed.startMin || 0,
                endHour: parsed.endHour || 10,
                endMin: parsed.endMin || 0,
                isHard: false,
                energy: 'medium',
            });
        }
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && parsed) handleSave();
    };

    const hints = [
        'Gym 6:30-7:30 T2 T4 T6',
        'Toán cao cấp 7:30-9:30 T2 T4',
        'Part-time 14:00-18:00 T3 T5',
        'Chạy bộ 6:00-6:45 T2 T3 T4',
        'Cà phê bạn bè 19:00-21:00 T6',
        'Ngủ trưa 12:00-13:00 T2 T3',
    ];

    return (
        <div className="quick-add-overlay" onClick={onClose}>
            <div className="quick-add-modal" onClick={e => e.stopPropagation()}>
                <div className="quick-add-input-wrapper">
                    <span className="icon" style={{ display: 'flex', alignItems: 'center' }}>
                        <Zap size={18} />
                    </span>
                    <input
                        ref={inputRef}
                        className="quick-add-input"
                        placeholder="Gym 6:30-7:30 T2 T4 T6..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {text && (
                        <button
                            onClick={() => setText('')}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Hints */}
                {!parsed && (
                    <div className="quick-add-hints">
                        {hints.map((h, i) => (
                            <button
                                key={i}
                                className="quick-add-hint"
                                onClick={() => setText(h)}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                )}

                {/* Preview */}
                {parsed && (
                    <div className="quick-add-preview">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                            PREVIEW
                        </div>
                        <div className="card" style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: '1.2rem' }}>{CATEGORIES[parsed.category]?.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{parsed.title}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: '0.78rem', alignItems: 'center' }}>
                                <span className={`tag tag-${parsed.category}`}>
                                    {CATEGORIES[parsed.category]?.label}
                                </span>
                                {parsed.startHour !== null && (
                                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} /> {String(parsed.startHour).padStart(2, '0')}:{String(parsed.startMin).padStart(2, '0')} - {String(parsed.endHour).padStart(2, '0')}:{String(parsed.endMin).padStart(2, '0')}
                                    </span>
                                )}
                                {parsed.day.length > 0 && (
                                    <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                        <CalendarDays size={12} /> {parsed.day.map(d => DAYS[d]).join(', ')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="quick-add-actions">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 'auto', alignSelf: 'center' }}>
                        Enter để lưu • Esc để thoát
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        Huỷ
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleSave}
                        disabled={!parsed}
                        style={{ opacity: parsed ? 1 : 0.4, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                        <Save size={14} /> Lưu Block
                    </button>
                </div>
            </div>
        </div>
    );
}
