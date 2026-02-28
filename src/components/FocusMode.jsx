import React, { useState, useEffect } from 'react';
import { Timer, Apple, Play, Pause, CheckCircle, RotateCcw, Lightbulb, PartyPopper, X } from 'lucide-react';
import { CATEGORIES } from '../store';

export default function FocusMode({ block, onClose, onComplete }) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [isPomo, setIsPomo] = useState(false);
    const pomoMinutes = 25;

    // Calculate total duration
    const totalMinutes = block
        ? (block.endHour * 60 + block.endMin) - (block.startHour * 60 + block.startMin)
        : 25;

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const elapsed = seconds;
    const remaining = isPomo ? (pomoMinutes * 60 - seconds) : (totalMinutes * 60 - seconds);

    const formatTimer = (secs) => {
        if (secs < 0) secs = 0;
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const progress = isPomo
        ? (seconds / (pomoMinutes * 60)) * 100
        : (seconds / (totalMinutes * 60)) * 100;

    const cat = block ? CATEGORIES[block.category] : null;

    return (
        <div className="focus-overlay">
            <div className="focus-content">
                {/* Close button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 32,
                        right: 32,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <X size={14} /> Thoát
                </button>

                {/* Mode toggle */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                    <button
                        className={`filter-chip ${!isPomo ? 'active' : ''}`}
                        onClick={() => { setIsPomo(false); setSeconds(0); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                        <Timer size={14} /> Timer
                    </button>
                    <button
                        className={`filter-chip ${isPomo ? 'active' : ''}`}
                        onClick={() => { setIsPomo(true); setSeconds(0); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                        <Apple size={14} /> Pomodoro (25m)
                    </button>
                </div>

                {/* Block info */}
                {block && (
                    <>
                        <div className="focus-task-name">{block.title}</div>
                        <div className="focus-category">
                            <span className={`tag tag-${block.category}`}>
                                {cat?.icon} {cat?.label}
                            </span>
                        </div>
                    </>
                )}

                {/* Timer ring */}
                <div className="focus-ring">
                    <svg
                        width="208"
                        height="208"
                        style={{ position: 'absolute', top: -4, left: -4, transform: 'rotate(-90deg)' }}
                    >
                        <circle
                            cx="104"
                            cy="104"
                            r="98"
                            fill="none"
                            stroke="var(--border-light)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="104"
                            cy="104"
                            r="98"
                            fill="none"
                            stroke={cat?.color || 'var(--accent)'}
                            strokeWidth="4"
                            strokeDasharray={2 * Math.PI * 98}
                            strokeDashoffset={2 * Math.PI * 98 * (1 - Math.min(progress, 100) / 100)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div className="focus-timer">
                        {formatTimer(remaining > 0 ? remaining : elapsed)}
                    </div>
                </div>

                {remaining <= 0 && (
                    <div style={{
                        animation: 'pulse 1s infinite',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--success)',
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                    }}>
                        <PartyPopper size={20} /> Thời gian đã hết! Tuyệt vời!
                    </div>
                )}

                {/* Controls */}
                <div className="focus-controls">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setIsRunning(!isRunning)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        {isRunning ? <><Pause size={16} /> Tạm dừng</> : <><Play size={16} /> Tiếp tục</>}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            onComplete(block, elapsed);
                            onClose();
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <CheckCircle size={16} /> Hoàn thành
                    </button>
                    <button
                        className="btn btn-ghost"
                        onClick={() => setSeconds(0)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>

                {/* Tips */}
                <div style={{
                    marginTop: 40,
                    padding: '16px 24px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                    maxWidth: 400,
                    margin: '40px auto 0',
                }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <Lightbulb size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                        Tip: Tắt thông báo điện thoại, đóng tab không liên quan, uống nước trước khi bắt đầu.
                    </p>
                </div>
            </div>
        </div>
    );
}
