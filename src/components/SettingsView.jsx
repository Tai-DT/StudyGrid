import React, { useState } from 'react';
import { Settings, User, School, GraduationCap, Briefcase, Zap, Bell, Clock, Database, Download, Trash2, Info, Lock, LogOut } from 'lucide-react';

const LEVEL_LABELS = {
    cap1: 'Cấp 1 (Tiểu học)',
    cap2: 'Cấp 2 (THCS)',
    cap3: 'Cấp 3 (THPT)',
    university: 'Đại học / Cao đẳng',
    working: 'Đi làm',
};

const VIBE_LABELS = {
    student: 'Chỉ đi học',
    both: 'Vừa học vừa làm',
    working: 'Chủ yếu đi làm',
};

export default function SettingsView({ settings, user, onUpdateSettings, onResetData, onSignOut }) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h2><Settings size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Cài đặt</h2>
                    <p>Tuỳ chỉnh StudyGrid theo cách của bạn</p>
                </div>
            </div>

            <div style={{ maxWidth: 600 }}>
                {/* Profile */}
                <div className="settings-section">
                    <h3><User size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Hồ sơ</h3>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Tên</div>
                            <div className="settings-row-desc">{user?.name || 'Chưa đặt'}</div>
                        </div>
                    </div>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Cấp học</div>
                            <div className="settings-row-desc">
                                {LEVEL_LABELS[user?.school_level] || 'Chưa chọn'}
                                {user?.grade ? ` — Lớp ${user.grade}` : ''}
                            </div>
                        </div>
                    </div>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Phong cách</div>
                            <div className="settings-row-desc">
                                {VIBE_LABELS[user?.vibe] || 'Chưa chọn'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="settings-section">
                    <h3><Bell size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Thông báo</h3>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Nhắc nhở block</div>
                            <div className="settings-row-desc">Thông báo trước 5 phút khi block sắp bắt đầu</div>
                        </div>
                        <button
                            className={`toggle ${settings.notifications ? 'active' : ''}`}
                            onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
                        />
                    </div>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Focus Mode</div>
                            <div className="settings-row-desc">Tự động mở Focus Mode khi đến giờ</div>
                        </div>
                        <button
                            className={`toggle ${settings.focusMode ? 'active' : ''}`}
                            onClick={() => onUpdateSettings({ focusMode: !settings.focusMode })}
                        />
                    </div>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Cảnh báo Balance</div>
                            <div className="settings-row-desc">Cảnh báo khi cuộc sống mất cân bằng</div>
                        </div>
                        <button
                            className={`toggle ${settings.balanceAlerts ? 'active' : ''}`}
                            onClick={() => onUpdateSettings({ balanceAlerts: !settings.balanceAlerts })}
                        />
                    </div>
                </div>

                {/* Schedule */}
                <div className="settings-section">
                    <h3><Clock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Lịch trình</h3>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Giờ ngủ mặc định</div>
                            <div className="settings-row-desc">{user?.sleep_start || '23:00'} → {user?.sleep_end || '06:30'}</div>
                        </div>
                    </div>
                </div>



                {/* Data */}
                <div className="settings-section">
                    <h3><Database size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Dữ liệu</h3>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label">Xuất dữ liệu</div>
                            <div className="settings-row-desc">Tải xuống tất cả dữ liệu dưới dạng JSON</div>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => {
                            const data = localStorage.getItem('studygrid_data');
                            const blob = new Blob([data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'studygrid_backup.json';
                            a.click();
                        }}>
                            <Download size={12} /> Xuất
                        </button>
                    </div>
                    <div className="settings-row">
                        <div>
                            <div className="settings-row-label" style={{ color: 'var(--danger)' }}>Reset tất cả</div>
                            <div className="settings-row-desc">Xoá toàn bộ dữ liệu và quay lại Onboarding</div>
                        </div>
                        {!showConfirm ? (
                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                onClick={() => setShowConfirm(true)}
                            >
                                <Trash2 size={12} /> Reset
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(false)}>
                                    Huỷ
                                </button>
                                <button
                                    className="btn btn-sm"
                                    style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
                                    onClick={onResetData}
                                >
                                    Xác nhận Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* About */}
                <div className="settings-section">
                    <h3><Info size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Về StudyGrid</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <p>StudyGrid v2.0.0 — Cloud Edition</p>
                        <p>Made with care for students everywhere</p>
                        <p style={{ fontSize: '0.75rem', marginTop: 8, color: 'var(--text-muted)' }}>
                            Time-blocking + Life planner — giúp bạn cân bằng học tập và cuộc sống.
                        </p>
                    </div>
                </div>

                {/* Account */}
                {onSignOut && (
                    <div className="settings-section">
                        <h3><Lock size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Tài khoản</h3>
                        <div className="settings-row">
                            <div>
                                <div className="settings-row-label">Đăng xuất</div>
                                <div className="settings-row-desc">Đăng xuất khỏi tài khoản hiện tại</div>
                            </div>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={onSignOut}
                            >
                                <LogOut size={12} /> Đăng xuất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
