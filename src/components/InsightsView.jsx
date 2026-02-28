import React from 'react';
import { BarChart3, Clock, BookOpen, Scale, CircleCheck, CalendarDays, PieChart, Lightbulb, AlertTriangle, CheckCircle, Target, BookMarked } from 'lucide-react';
import { CATEGORIES, DAYS, calculateBalance } from '../store';

export default function InsightsView({ blocks, tasks, goals }) {
    const balance = calculateBalance(blocks);

    // Calculate time per day
    const dailyHours = DAYS.map((day, idx) => {
        const dayBlocks = blocks.filter(b => b.day === idx);
        return dayBlocks.reduce((sum, b) => sum + ((b.endHour - b.startHour) + (b.endMin - b.startMin) / 60), 0);
    });

    // Calculate time per category
    const categoryHours = {};
    for (const [key, cat] of Object.entries(CATEGORIES)) {
        const h = blocks
            .filter(b => b.category === key)
            .reduce((sum, b) => sum + ((b.endHour - b.startHour) + (b.endMin - b.startMin) / 60), 0);
        categoryHours[key] = Math.round(h * 10) / 10;
    }

    const totalHours = Object.values(categoryHours).reduce((a, b) => a + b, 0);
    const maxDailyHours = Math.max(...dailyHours, 1);

    // Task stats
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2><BarChart3 size={22} strokeWidth={1.8} style={{ marginRight: 8, verticalAlign: -3 }} />Insights</h2>
                    <p>Thống kê và phân tích thời gian của bạn</p>
                </div>
            </div>

            {/* Key metrics */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon"><Clock size={20} strokeWidth={1.5} /></div>
                    <div className="stat-value">{totalHours.toFixed(0)}h</div>
                    <div className="stat-label">Tổng giờ / tuần</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><BookOpen size={20} strokeWidth={1.5} /></div>
                    <div className="stat-value">{categoryHours.study || 0}h</div>
                    <div className="stat-label">Giờ học</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><Scale size={20} strokeWidth={1.5} /></div>
                    <div className="stat-value" style={{ color: balance.score >= 70 ? 'var(--success)' : 'var(--danger)' }}>
                        {balance.score}
                    </div>
                    <div className="stat-label">Balance Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><CircleCheck size={20} strokeWidth={1.5} /></div>
                    <div className="stat-value">{totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</div>
                    <div className="stat-label">Task xong</div>
                </div>
            </div>

            <div className="insights-grid">
                {/* Hours per day chart */}
                <div className="insight-card">
                    <h4><CalendarDays size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Giờ theo ngày</h4>
                    <div className="insight-bar-chart">
                        {DAYS.map((day, idx) => (
                            <div
                                key={day}
                                className="insight-bar"
                                style={{
                                    height: `${(dailyHours[idx] / maxDailyHours) * 100}%`,
                                    background: `linear-gradient(180deg, var(--accent), var(--accent-light))`,
                                    position: 'relative',
                                }}
                            >
                                <span className="insight-bar-label">{day}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span>TB: {(totalHours / 7).toFixed(1)}h/ngày</span>
                        <span>Max: {Math.max(...dailyHours).toFixed(1)}h</span>
                    </div>
                </div>

                {/* Category breakdown */}
                <div className="insight-card">
                    <h4><PieChart size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Phân bổ thời gian</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                        {Object.entries(CATEGORIES)
                            .filter(([key]) => categoryHours[key] > 0)
                            .sort(([a], [b]) => categoryHours[b] - categoryHours[a])
                            .map(([key, cat]) => (
                                <div key={key}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                            {cat.icon} {cat.label}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {categoryHours[key]}h ({balance.percentages[key]}%)
                                        </span>
                                    </div>
                                    <div className="balance-bar-track">
                                        <div
                                            className="balance-bar-fill"
                                            style={{
                                                width: `${balance.percentages[key]}%`,
                                                background: cat.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                {/* Balance advice */}
                <div className="insight-card">
                    <h4><Lightbulb size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Gợi ý từ AI</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                        {balance.score < 60 && (
                            <div style={{
                                padding: '12px 14px',
                                background: 'rgba(225, 112, 85, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '3px solid var(--danger)',
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}><AlertTriangle size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} /> Mất cân bằng</div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    Thời gian nghỉ ngơi và sức khoẻ có vẻ bị thiếu. Hãy thêm ít nhất 1 block gym và tăng giờ ngủ.
                                </p>
                            </div>
                        )}
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(0, 184, 148, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '3px solid var(--success)',
                        }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}><CheckCircle size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} /> Deep Work</div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Thời gian tập trung cao nhất của bạn là buổi sáng (7-10h). Dành cho các task quan trọng nhất.
                            </p>
                        </div>
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(108, 92, 231, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '3px solid var(--accent)',
                        }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}><Lightbulb size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} /> Gợi ý</div>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                Bạn có {blocks.filter(b => !b.isHard).length} soft blocks có thể dời lại.
                                Hãy dùng "Rebalance" để tối ưu lịch.
                            </p>
                        </div>
                        {categoryHours.study > 15 && (
                            <div style={{
                                padding: '12px 14px',
                                background: 'rgba(253, 203, 110, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '3px solid var(--warning)',
                            }}>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}><BookMarked size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} /> Học nhiều</div>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    Bạn đang học {categoryHours.study}h/tuần. Nhớ nghỉ giữa các buổi và chia nhỏ bài tập!
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Goals progress */}
                <div className="insight-card">
                    <h4><Target size={16} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: -2 }} /> Tiến độ mục tiêu</h4>
                    {goals.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>
                            Chưa có mục tiêu nào
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                            {goals.map(goal => (
                                <div key={goal.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                            {CATEGORIES[goal.category]?.icon} {goal.title}
                                        </span>
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            {goal.progress}%
                                        </span>
                                    </div>
                                    <div className="goal-progress-bar">
                                        <div
                                            className="goal-progress-fill"
                                            style={{
                                                width: `${goal.progress}%`,
                                                background: goal.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
