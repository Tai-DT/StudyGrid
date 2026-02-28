import React, { useState } from 'react';
import {
    CalendarDays, GraduationCap, Timer, Cloud, KeyRound, Rocket,
    AlertTriangle, CheckCircle, Loader, BookOpen, Zap, Target,
    BarChart3, Clock, Sparkles, ArrowRight, Eye, EyeOff, User, Mail, Lock
} from 'lucide-react';
import { signUp, signIn } from '../supabase';

export default function AuthPage({ onAuth }) {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'register') {
                if (!name.trim()) { setError('Vui lòng nhập tên'); setLoading(false); return; }
                if (password.length < 6) { setError('Mật khẩu ít nhất 6 ký tự'); setLoading(false); return; }

                const { data, error: err } = await signUp(email, password, name);
                if (err) { setError(err.message); setLoading(false); return; }

                if (data?.user?.identities?.length === 0) {
                    setError('Email đã được đăng ký');
                } else if (data?.session) {
                    onAuth(data.session);
                } else {
                    setSuccess('Đăng ký thành công! Kiểm tra email để xác nhận.');
                }
            } else {
                const { data, error: err } = await signIn(email, password);
                if (err) {
                    if (err.message.includes('Invalid login')) {
                        setError('Email hoặc mật khẩu không đúng');
                    } else {
                        setError(err.message);
                    }
                    setLoading(false);
                    return;
                }
                if (data?.session) {
                    onAuth(data.session);
                }
            }
        } catch (err) {
            setError('Có lỗi xảy ra, vui lòng thử lại');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="auth-bg-orb auth-bg-orb-1"></div>
                <div className="auth-bg-orb auth-bg-orb-2"></div>
                <div className="auth-bg-orb auth-bg-orb-3"></div>
                <div className="auth-bg-grid"></div>
            </div>

            <div className="auth-container">
                {/* Left — Hero Section */}
                <div className="auth-hero">
                    <div className="auth-hero-content">
                        <div className="auth-logo-badge">
                            <CalendarDays size={32} strokeWidth={1.8} />
                        </div>
                        <h1 className="auth-title">StudyGrid</h1>
                        <p className="auth-tagline">
                            Lên lịch thông minh — Học tập hiệu quả
                        </p>
                        <p className="auth-desc">
                            Ứng dụng time-blocking kết hợp AI, giúp bạn quản lý thời gian
                            học tập và cuộc sống trong một lưới thời gian duy nhất.
                        </p>

                        <div className="auth-features-grid">
                            <div className="auth-feat-card">
                                <div className="auth-feat-icon">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <strong>Mọi cấp học</strong>
                                    <span>Cấp 1 → Đại học</span>
                                </div>
                            </div>
                            <div className="auth-feat-card">
                                <div className="auth-feat-icon">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <strong>AI StudyBot</strong>
                                    <span>Trợ lý thông minh</span>
                                </div>
                            </div>
                            <div className="auth-feat-card">
                                <div className="auth-feat-icon">
                                    <Timer size={20} />
                                </div>
                                <div>
                                    <strong>Pomodoro</strong>
                                    <span>Focus & Break</span>
                                </div>
                            </div>
                            <div className="auth-feat-card">
                                <div className="auth-feat-icon">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <strong>Insights</strong>
                                    <span>Thống kê chi tiết</span>
                                </div>
                            </div>
                            <div className="auth-feat-card">
                                <div className="auth-feat-icon">
                                    <Cloud size={20} />
                                </div>
                                <div>
                                    <strong>Cloud Sync</strong>
                                    <span>Mọi thiết bị</span>
                                </div>
                            </div>
                            <div className="auth-feat-card">
                                <div className="auth-feat-icon">
                                    <Target size={20} />
                                </div>
                                <div>
                                    <strong>Mục tiêu</strong>
                                    <span>Theo dõi tiến độ</span>
                                </div>
                            </div>
                        </div>

                        <div className="auth-stats-row">
                            <div className="auth-stat">
                                <span className="auth-stat-num">16+</span>
                                <span className="auth-stat-label">Tính năng</span>
                            </div>
                            <div className="auth-stat-divider"></div>
                            <div className="auth-stat">
                                <span className="auth-stat-num">100%</span>
                                <span className="auth-stat-label">Miễn phí</span>
                            </div>
                            <div className="auth-stat-divider"></div>
                            <div className="auth-stat">
                                <span className="auth-stat-num">AI</span>
                                <span className="auth-stat-label">Tích hợp</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Auth Form */}
                <div className="auth-form-section">
                    <div className="auth-card">
                        {/* Mode Tabs */}
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                            >
                                <KeyRound size={16} />
                                Đăng nhập
                            </button>
                            <button
                                className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                            >
                                <Rocket size={16} />
                                Đăng ký
                            </button>
                        </div>

                        <p className="auth-subtitle">
                            {mode === 'login'
                                ? 'Chào mừng quay lại! Đăng nhập để tiếp tục.'
                                : 'Tạo tài khoản miễn phí để bắt đầu.'}
                        </p>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {mode === 'register' && (
                                <div className="auth-field">
                                    <label className="auth-label">
                                        <User size={14} />
                                        Tên của bạn
                                    </label>
                                    <div className="auth-input-wrap">
                                        <User size={18} className="auth-input-icon" />
                                        <input
                                            className="auth-input"
                                            type="text"
                                            placeholder="Nhập tên hiển thị..."
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="auth-field">
                                <label className="auth-label">
                                    <Mail size={14} />
                                    Email
                                </label>
                                <div className="auth-input-wrap">
                                    <Mail size={18} className="auth-input-icon" />
                                    <input
                                        className="auth-input"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        autoFocus={mode === 'login'}
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label">
                                    <Lock size={14} />
                                    Mật khẩu
                                </label>
                                <div className="auth-input-wrap">
                                    <Lock size={18} className="auth-input-icon" />
                                    <input
                                        className="auth-input"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={mode === 'register' ? 'Ít nhất 6 ký tự' : '••••••••'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="auth-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="auth-message auth-error">
                                    <AlertTriangle size={15} />
                                    <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="auth-message auth-success">
                                    <CheckCircle size={15} />
                                    <span>{success}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader size={18} className="spin" />
                                ) : (
                                    <>
                                        {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>hoặc</span>
                        </div>

                        <div className="auth-toggle">
                            {mode === 'login' ? (
                                <p>
                                    Chưa có tài khoản?{' '}
                                    <button className="auth-link" onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
                                        Đăng ký miễn phí <ArrowRight size={14} />
                                    </button>
                                </p>
                            ) : (
                                <p>
                                    Đã có tài khoản?{' '}
                                    <button className="auth-link" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                        Đăng nhập ngay <ArrowRight size={14} />
                                    </button>
                                </p>
                            )}
                        </div>

                        <div className="auth-footer">
                            <p>🔒 Dữ liệu được bảo mật bởi Supabase</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
