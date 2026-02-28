import React, { useState } from 'react';
import { Target, Clock, Plus } from 'lucide-react';
import { CATEGORIES } from '../store';

export default function GoalsView({ goals, onAddGoal, onUpdateGoal }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', category: 'study', targetDate: '', weeklyHours: 10 });

    const handleSubmit = () => {
        if (!newGoal.title) return;
        onAddGoal({
            ...newGoal,
            progress: 0,
            color: CATEGORIES[newGoal.category]?.color || '#6C5CE7',
        });
        setNewGoal({ title: '', category: 'study', targetDate: '', weeklyHours: 10 });
        setShowAddForm(false);
    };

    const getDaysRemaining = (date) => {
        if (!date) return '—';
        const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
        if (diff < 0) return 'Đã qua';
        return `${diff} ngày`;
    };

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2><Target size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Mục tiêu</h2>
                    <p>Theo dõi tiến độ và roadmap các mục tiêu</p>
                </div>
                <div className="page-header-right">
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
                        <Plus size={14} /> Thêm Mục tiêu
                    </button>
                </div>
            </div>

            {/* Add form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: 20, animation: 'fadeSlideIn 300ms ease' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}><Target size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Mục tiêu mới</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label className="label">Mục tiêu</label>
                            <input
                                className="input"
                                placeholder="Vd: GPA 3.5+, Chạy 5km..."
                                value={newGoal.title}
                                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label className="label">Hạn chót</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={newGoal.targetDate}
                                    onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="label">Giờ/tuần</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="1"
                                    value={newGoal.weeklyHours}
                                    onChange={e => setNewGoal({ ...newGoal, weeklyHours: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Category</label>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {Object.entries(CATEGORIES).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        className={`filter-chip ${newGoal.category === key ? 'active' : ''}`}
                                        onClick={() => setNewGoal({ ...newGoal, category: key })}
                                    >
                                        {cat.icon} {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>Huỷ</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Tạo mục tiêu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Goals grid */}
            {goals.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon"><Target size={40} /></div>
                    <h3>Chưa có mục tiêu</h3>
                    <p>Đặt mục tiêu để StudyGrid giúp bạn đạt được chúng</p>
                    <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
                        <Plus size={14} /> Tạo mục tiêu đầu tiên
                    </button>
                </div>
            ) : (
                <div className="goals-grid">
                    {goals.map((goal, idx) => (
                        <div
                            key={goal.id}
                            className="goal-card"
                            style={{ animation: `fadeSlideIn 400ms ease ${idx * 80}ms both` }}
                        >
                            <div className="goal-header">
                                <span className={`tag tag-${goal.category}`}>
                                    {CATEGORIES[goal.category]?.icon} {CATEGORIES[goal.category]?.label}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={12} /> {getDaysRemaining(goal.targetDate)}
                                </span>
                            </div>
                            <h3 className="goal-title" style={{ margin: '8px 0' }}>{goal.title}</h3>
                            <div className="goal-progress-bar">
                                <div
                                    className="goal-progress-fill"
                                    style={{
                                        width: `${goal.progress}%`,
                                        background: goal.color || CATEGORIES[goal.category]?.color,
                                    }}
                                />
                            </div>
                            <div className="goal-meta">
                                <span>{goal.progress}% hoàn thành</span>
                                <span>{goal.weeklyHours}h/tuần</span>
                            </div>

                            {/* Quick actions */}
                            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                                <button
                                    className="btn btn-secondary btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => onUpdateGoal(goal.id, { progress: Math.min(100, goal.progress + 10) })}
                                >
                                    +10%
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ flex: 1 }}
                                    onClick={() => onUpdateGoal(goal.id, { progress: Math.max(0, goal.progress - 10) })}
                                >
                                    -10%
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
