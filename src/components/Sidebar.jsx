import React from 'react';
import {
    Sun,
    CalendarDays,
    CheckSquare,
    Target,
    BarChart3,
    Bot,
    GraduationCap,
    Timer,
    Settings,
    LogOut,
    School,
    Briefcase,
    Sparkles,
    ClipboardList,
    LayoutGrid
} from 'lucide-react';

const LEVEL_CONFIG = {
    cap1: { label: 'Tiểu học', icon: School },
    cap2: { label: 'THCS', icon: School },
    cap3: { label: 'THPT', icon: GraduationCap },
    university: { label: 'Đại học', icon: GraduationCap },
    working: { label: 'Đi làm', icon: Briefcase },
};

export default function Sidebar({ activePage, onNavigate, userName, taskCount, schoolLevel, onOpenTimetable, onOpenPomodoro, onSignOut, onOpenAI }) {
    const navItems = [
        { key: 'today', label: 'Hôm nay', Icon: Sun },
        { key: 'week', label: 'Week Grid', Icon: LayoutGrid },
        { key: 'tasks', label: 'Tasks', Icon: CheckSquare, badge: taskCount > 0 ? taskCount : null },
        { key: 'goals', label: 'Mục tiêu', Icon: Target },
        { key: 'insights', label: 'Insights', Icon: BarChart3 },
    ];

    const levelInfo = LEVEL_CONFIG[schoolLevel];
    const LevelIcon = levelInfo?.icon || Sparkles;

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <CalendarDays size={28} strokeWidth={1.8} />
                </div>
                <div>
                    <h1 className="sidebar-title">StudyGrid</h1>
                    <p className="sidebar-subtitle">TIME · BLOCK PLANNER</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">MENU CHÍNH</div>
                {navItems.map(item => (
                    <button
                        key={item.key}
                        className={`sidebar-item ${activePage === item.key ? 'active' : ''}`}
                        onClick={() => onNavigate(item.key)}
                    >
                        <span className="sidebar-item-icon">
                            <item.Icon size={18} strokeWidth={1.8} />
                        </span>
                        <span className="sidebar-item-label">{item.label}</span>
                        {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                    </button>
                ))}

                {/* AI Assistant */}
                <div className="sidebar-section-label" style={{ marginTop: 20 }}>AI TRỢ LÝ</div>
                <button
                    className="sidebar-item sidebar-item-ai"
                    onClick={onOpenAI}
                >
                    <span className="sidebar-item-icon">
                        <Bot size={18} strokeWidth={1.8} />
                    </span>
                    <span className="sidebar-item-label">StudyBot AI</span>
                    <span className="sidebar-badge sidebar-badge-new">NEW</span>
                </button>

                {/* Timetable button */}
                {schoolLevel && schoolLevel !== 'working' && (
                    <>
                        <div className="sidebar-section-label" style={{ marginTop: 20 }}>TRƯỜNG HỌC</div>
                        <button
                            className="sidebar-item"
                            onClick={onOpenTimetable}
                        >
                            <span className="sidebar-item-icon">
                                <ClipboardList size={18} strokeWidth={1.8} />
                            </span>
                            <span className="sidebar-item-label">Thời khoá biểu</span>
                        </button>
                    </>
                )}

                {/* Tools section */}
                <div className="sidebar-section-label" style={{ marginTop: 20 }}>CÔNG CỤ</div>
                <button
                    className="sidebar-item"
                    onClick={onOpenPomodoro}
                >
                    <span className="sidebar-item-icon">
                        <Timer size={18} strokeWidth={1.8} />
                    </span>
                    <span className="sidebar-item-label">Pomodoro Timer</span>
                </button>

                <div className="sidebar-section-label" style={{ marginTop: 20 }}>HỆ THỐNG</div>
                <button
                    className={`sidebar-item ${activePage === 'settings' ? 'active' : ''}`}
                    onClick={() => onNavigate('settings')}
                >
                    <span className="sidebar-item-icon">
                        <Settings size={18} strokeWidth={1.8} />
                    </span>
                    <span className="sidebar-item-label">Cài đặt</span>
                </button>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{(userName || 'U')[0]?.toUpperCase()}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{userName || 'User'}</div>
                        <div className="sidebar-user-role">
                            <LevelIcon size={12} strokeWidth={2} />
                            <span>{levelInfo?.label || 'Free Plan'}</span>
                        </div>
                    </div>
                </div>
                {onSignOut && (
                    <button
                        className="sidebar-signout"
                        onClick={onSignOut}
                        title="Đăng xuất"
                    >
                        <LogOut size={16} strokeWidth={1.8} />
                    </button>
                )}
            </div>
        </aside>
    );
}
