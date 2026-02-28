import React, { useState } from 'react';
import { CheckSquare, ClipboardList, Clock, CircleCheck, AlertTriangle, CalendarDays, Zap, Check, Trash2, Plus, PartyPopper } from 'lucide-react';
import { CATEGORIES } from '../store';

export default function TasksView({ tasks, onAddTask, onToggleTask, onScheduleTask, onDeleteTask }) {
    const [filter, setFilter] = useState('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', deadline: '', estimatedHours: 2, category: 'study' });

    const filtered = tasks.filter(t => {
        if (filter === 'pending') return !t.completed;
        if (filter === 'done') return t.completed;
        if (filter === 'overdue') {
            return !t.completed && new Date(t.deadline) < new Date();
        }
        return true;
    }).sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    const getDaysUntil = (deadline) => {
        const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000);
        if (diff < 0) return `Quá hạn ${Math.abs(diff)} ngày`;
        if (diff === 0) return 'Hôm nay!';
        if (diff === 1) return 'Ngày mai';
        return `Còn ${diff} ngày`;
    };

    const getDeadlineClass = (deadline) => {
        const diff = Math.ceil((new Date(deadline) - new Date()) / 86400000);
        if (diff < 0) return 'task-deadline';
        if (diff <= 2) return 'task-deadline soon';
        return 'task-deadline';
    };

    const handleSubmit = () => {
        if (!newTask.title) return;
        onAddTask({
            ...newTask,
            completed: false,
            scheduled: false,
        });
        setNewTask({ title: '', deadline: '', estimatedHours: 2, category: 'study' });
        setShowAddForm(false);
    };

    const pendingCount = tasks.filter(t => !t.completed).length;
    const overdueCount = tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).length;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2><CheckSquare size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Tasks</h2>
                    <p>{pendingCount} task đang chờ {overdueCount > 0 && <><AlertTriangle size={12} style={{ verticalAlign: 'middle' }} /> {overdueCount} quá hạn</>}</p>
                </div>
                <div className="page-header-right">
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
                        <Plus size={14} /> Thêm Task
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-icon"><ClipboardList size={20} /></div>
                    <div className="stat-value">{tasks.length}</div>
                    <div className="stat-label">Tổng tasks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Clock size={20} /></div>
                    <div className="stat-value">{pendingCount}</div>
                    <div className="stat-label">Đang chờ</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><CircleCheck size={20} /></div>
                    <div className="stat-value">{tasks.filter(t => t.completed).length}</div>
                    <div className="stat-label">Hoàn thành</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><AlertTriangle size={20} /></div>
                    <div className="stat-value" style={{ color: overdueCount > 0 ? 'var(--danger)' : 'inherit' }}>{overdueCount}</div>
                    <div className="stat-label">Quá hạn</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: 'Đang chờ' },
                    { id: 'done', label: 'Hoàn thành' },
                    { id: 'overdue', label: 'Quá hạn' },
                ].map(f => (
                    <button
                        key={f.id}
                        className={`filter-chip ${filter === f.id ? 'active' : ''}`}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Add form */}
            {showAddForm && (
                <div className="card" style={{ marginBottom: 16, animation: 'fadeSlideIn 300ms ease' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 16 }}><Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Thêm Task mới</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label className="label">Tiêu đề</label>
                            <input
                                className="input"
                                placeholder="Vd: Bài tập Toán chương 5"
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <label className="label">Deadline</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={newTask.deadline}
                                    onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="label">Ước lượng (giờ)</label>
                                <input
                                    type="number"
                                    className="input"
                                    min="0.5"
                                    step="0.5"
                                    value={newTask.estimatedHours}
                                    onChange={e => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Category</label>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {Object.entries(CATEGORIES).map(([key, cat]) => (
                                    <button
                                        key={key}
                                        className={`filter-chip ${newTask.category === key ? 'active' : ''}`}
                                        onClick={() => setNewTask({ ...newTask, category: key })}
                                    >
                                        {cat.icon} {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>Huỷ</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Thêm Task</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task list */}
            <div className="task-list">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><PartyPopper size={40} /></div>
                        <h3>Không có task nào!</h3>
                        <p>{filter === 'all' ? 'Thêm task đầu tiên để bắt đầu' : 'Không có task phù hợp bộ lọc'}</p>
                    </div>
                ) : (
                    filtered.map((task, idx) => (
                        <div
                            key={task.id}
                            className="task-item"
                            style={{ animation: `slideInRight 300ms ease ${idx * 40}ms both` }}
                        >
                            <button
                                className={`priority-checkbox ${task.completed ? 'checked' : ''}`}
                                onClick={() => onToggleTask(task.id)}
                            >
                                {task.completed && <Check size={14} />}
                            </button>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                }}>
                                    {task.title}
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                                    <span className={`tag tag-${task.category}`}>
                                        {CATEGORIES[task.category]?.icon} {CATEGORIES[task.category]?.label}
                                    </span>
                                    {task.deadline && (
                                        <span className={getDeadlineClass(task.deadline)} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <CalendarDays size={11} /> {getDaysUntil(task.deadline)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="task-hours">{task.estimatedHours}h</span>
                            {!task.completed && !task.scheduled && (
                                <button className="task-schedule-btn" onClick={() => onScheduleTask(task)}>
                                    <Zap size={12} /> Schedule
                                </button>
                            )}
                            {task.scheduled && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 3 }}><CircleCheck size={12} /> Đã xếp</span>
                            )}
                            <button
                                className="btn-ghost btn-sm"
                                onClick={() => onDeleteTask(task.id)}
                                style={{ padding: 4, fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
