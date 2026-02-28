import React, { useState, useEffect, useRef } from 'react';
import { Sun, Crosshair, Flame, Scale, TrendingUp, Inbox, Lock, Check, AlertTriangle, Sunrise } from 'lucide-react';
import { CATEGORIES, calculateBalance } from '../store';

export default function TodayView({ blocks, tasks, goals, onStartFocus, onToggleTask }) {
    const [checkedPriorities, setCheckedPriorities] = useState([]);
    const [mood, setMood] = useState(null);
    const notifiedRef = useRef(new Set());

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Check for upcoming blocks every 60s and send notifications
    useEffect(() => {
        const checkUpcoming = () => {
            if (!('Notification' in window) || Notification.permission !== 'granted') return;

            const now = new Date();
            const dayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
            const nowMinutes = now.getHours() * 60 + now.getMinutes();

            blocks.filter(b => b.day === dayIdx).forEach(block => {
                const blockStart = block.startHour * 60 + block.startMin;
                const diff = blockStart - nowMinutes;
                const blockId = `${block.id}-${now.toDateString()}`;

                // Notify 5 minutes before
                if (diff > 0 && diff <= 5 && !notifiedRef.current.has(blockId)) {
                    notifiedRef.current.add(blockId);
                    new Notification('📅 StudyGrid — Sắp đến giờ!', {
                        body: `${block.title} bắt đầu lúc ${String(block.startHour).padStart(2, '0')}:${String(block.startMin).padStart(2, '0')}`,
                        icon: '/studygrid-icon.svg',
                        tag: blockId,
                    });
                }
            });
        };

        checkUpcoming();
        const timer = setInterval(checkUpcoming, 60000);
        return () => clearInterval(timer);
    }, [blocks]);

    const today = new Date();
    const todayDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const currentHour = today.getHours();
    const currentMin = today.getMinutes();

    // Today's blocks sorted by time
    const todayBlocks = blocks
        .filter(b => b.day === todayDayIdx)
        .sort((a, b) => (a.startHour * 60 + a.startMin) - (b.startHour * 60 + b.startMin));

    // Today's upcoming tasks (due soon)
    const upcomingTasks = tasks
        .filter(t => !t.completed)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3);

    // Balance
    const balance = calculateBalance(blocks);

    const togglePriority = (id) => {
        setCheckedPriorities(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const formatTime = (h, m) =>
        `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;

    const isCurrentBlock = (block) => {
        const now = currentHour * 60 + currentMin;
        const start = block.startHour * 60 + block.startMin;
        const end = block.endHour * 60 + block.endMin;
        return now >= start && now < end;
    };

    const isPastBlock = (block) => {
        const now = currentHour * 60 + currentMin;
        const end = block.endHour * 60 + block.endMin;
        return now >= end;
    };

    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    // ── Streak tracking ──
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const todayStr = today.toISOString().slice(0, 10);
        const stored = JSON.parse(localStorage.getItem('studygrid_streak') || '{"days":[],"count":0}');
        const days = stored.days || [];

        if (!days.includes(todayStr)) {
            days.push(todayStr);
            days.sort();
            // Keep only last 90 days
            while (days.length > 90) days.shift();
        }

        // Calculate consecutive streak ending today
        let count = 0;
        let d = new Date(today);
        while (true) {
            const ds = d.toISOString().slice(0, 10);
            if (days.includes(ds)) {
                count++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }

        localStorage.setItem('studygrid_streak', JSON.stringify({ days, count }));
        setStreak(count);
    }, []);

    // Last 7 days for mini calendar
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d;
    });
    const streakDays = JSON.parse(localStorage.getItem('studygrid_streak') || '{"days":[]}').days || [];

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2><Sun size={22} strokeWidth={1.8} style={{ marginRight: 8, verticalAlign: -3 }} />Hôm nay</h2>
                    <p>{dayNames[today.getDay()]}, {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}</p>
                </div>
                <div className="page-header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Streak badge */}
                    <div className="streak-badge" title={`Streak: ${streak} ngày liên tiếp`}>
                        <span className="streak-fire">🔥</span>
                        <span className="streak-count">{streak}</span>
                        <div className="streak-dots">
                            {last7Days.map((d, i) => {
                                const ds = d.toISOString().slice(0, 10);
                                const isActive = streakDays.includes(ds);
                                const isToday = ds === today.toISOString().slice(0, 10);
                                return (
                                    <span
                                        key={i}
                                        className={`streak-dot ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
                                        title={`${d.getDate()}/${d.getMonth() + 1}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {todayBlocks.find(b => isCurrentBlock(b)) && (
                        <button className="btn btn-primary" onClick={() => onStartFocus(todayBlocks.find(b => isCurrentBlock(b)))}>
                            <Crosshair size={16} strokeWidth={2} /> Start Focus
                        </button>
                    )}
                </div>
            </div>

            {/* Daily Check-in */}
            <div className="card" style={{ marginBottom: 20, animation: 'fadeSlideIn 400ms ease' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>
                    <Sunrise size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Daily Check-in
                </h3>
                {mood === null ? (
                    <>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                            Hôm nay bạn cảm thấy thế nào?
                        </p>
                        <div className="checkin-mood">
                            {['😴', '😐', '🙂', '😊', '🔥'].map((emoji, i) => (
                                <button
                                    key={i}
                                    className="mood-btn"
                                    onClick={() => setMood(i)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                        <span style={{ fontSize: '2rem' }}>{['😴', '😐', '🙂', '😊', '🔥'][mood]}</span>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                                {['Hơi mệt mỏi', 'Bình thường', 'Khá tốt', 'Rất tốt', 'Cực kỳ hứng khởi!'][mood]}
                            </p>
                            <button
                                style={{ fontSize: '0.72rem', color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: 2 }}
                                onClick={() => setMood(null)}
                            >
                                Đổi lại
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="today-layout">
                {/* Timeline */}
                <div className="today-timeline">
                    {todayBlocks.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Inbox size={40} strokeWidth={1.3} /></div>
                            <h3>Ngày hôm nay trống!</h3>
                            <p>Thêm block vào Week Grid hoặc dùng Quick Add</p>
                        </div>
                    ) : (
                        todayBlocks.map((block, idx) => {
                            const current = isCurrentBlock(block);
                            const past = isPastBlock(block);

                            return (
                                <div
                                    key={block.id}
                                    className={`timeline-item ${current ? 'timeline-now' : ''}`}
                                    style={{
                                        animation: `slideInRight 300ms ease ${idx * 50}ms both`,
                                        opacity: past ? 0.5 : 1,
                                    }}
                                >
                                    <div className="timeline-time">
                                        {formatTime(block.startHour, block.startMin)}
                                    </div>
                                    <div className="timeline-line">
                                        <div
                                            className="timeline-dot"
                                            style={{
                                                background: current ? 'var(--danger)' : CATEGORIES[block.category]?.color,
                                                boxShadow: current ? '0 0 10px var(--danger)' : 'none',
                                            }}
                                        />
                                    </div>
                                    <div
                                        className="timeline-card"
                                        style={{
                                            borderLeft: `3px solid ${CATEGORIES[block.category]?.color}`,
                                        }}
                                    >
                                        <div className="timeline-card-title">
                                            {CATEGORIES[block.category]?.icon} {block.title}
                                            {past && <Check size={14} strokeWidth={2.5} style={{ marginLeft: 6, color: '#00b894' }} />}
                                        </div>
                                        <div className="timeline-card-meta">
                                            <span>{formatTime(block.startHour, block.startMin)} - {formatTime(block.endHour, block.endMin)}</span>
                                            <span className={`tag tag-${block.category}`}>{CATEGORIES[block.category]?.label}</span>
                                            {block.isHard && <span style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Lock size={10} strokeWidth={2} /> Hard</span>}
                                        </div>
                                        {current && (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                style={{ marginTop: 8 }}
                                                onClick={() => onStartFocus(block)}
                                            >
                                                <Crosshair size={14} strokeWidth={2} /> Focus ngay
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Sidebar widgets */}
                <div className="today-sidebar">
                    {/* Top 3 Priorities */}
                    <div className="priority-card">
                        <h3><Flame size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Top 3 Ưu tiên</h3>
                        {upcomingTasks.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chưa có task nào</p>
                        ) : (
                            upcomingTasks.map(task => (
                                <div key={task.id} className="priority-item" onClick={() => togglePriority(task.id)}>
                                    <button
                                        className={`priority-checkbox ${checkedPriorities.includes(task.id) ? 'checked' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); togglePriority(task.id); }}
                                    >
                                        {checkedPriorities.includes(task.id) && '✓'}
                                    </button>
                                    <span className={`priority-text ${checkedPriorities.includes(task.id) ? 'done' : ''}`}>
                                        {task.title}
                                    </span>
                                    <span className="task-deadline">
                                        {new Date(task.deadline).toLocaleDateString('vi-VN', { weekday: 'short' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Balance Score */}
                    <div className="balance-card">
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>
                            <Scale size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Balance Score
                        </h3>
                        <div className="balance-score">
                            <div className="balance-ring">
                                <div>
                                    <div className="balance-value">{balance.score}</div>
                                    <div className="balance-label">điểm</div>
                                </div>
                            </div>
                        </div>
                        <div className="balance-bars">
                            {Object.entries(CATEGORIES).filter(([k]) => balance.percentages[k] > 0).map(([key, cat]) => (
                                <div key={key} className="balance-bar-item">
                                    <span className="balance-bar-label">{cat.icon}</span>
                                    <div className="balance-bar-track">
                                        <div
                                            className="balance-bar-fill"
                                            style={{
                                                width: `${balance.percentages[key]}%`,
                                                background: cat.color,
                                            }}
                                        />
                                    </div>
                                    <span className="balance-bar-value">{balance.percentages[key]}%</span>
                                </div>
                            ))}
                        </div>
                        {balance.score < 60 && (
                            <div style={{
                                marginTop: 12,
                                padding: '8px 12px',
                                background: 'rgba(225, 112, 85, 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                color: 'var(--danger)',
                            }}>
                                <AlertTriangle size={14} strokeWidth={2} style={{ marginRight: 6, verticalAlign: -2 }} /> Cuộc sống hơi mất cân bằng. Hãy thêm thời gian nghỉ ngơi!
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="card">
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}><TrendingUp size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Hôm nay</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div style={{ textAlign: 'center', padding: 8 }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{todayBlocks.length}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>BLOCKS</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: 8 }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                                    {todayBlocks.reduce((sum, b) => sum + ((b.endHour - b.startHour) + (b.endMin - b.startMin) / 60), 0).toFixed(1)}h
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TỔNG GIỜ</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: 8 }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                                    {todayBlocks.filter(b => isPastBlock(b)).length}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>HOÀN THÀNH</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: 8 }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                                    {todayBlocks.filter(b => !isPastBlock(b) && !isCurrentBlock(b)).length}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>CÒN LẠI</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
