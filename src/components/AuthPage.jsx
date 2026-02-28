import React, { useState } from 'react';
import { CalendarDays, GraduationCap, Timer, Cloud, KeyRound, Rocket, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { signUp, signIn } from '../supabase';

export default function AuthPage({ onAuth }) {
    const [mode, setMode] = useState('login'); // login | register
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
            <div className="auth-left">
                <div className="auth-brand">
                    <div className="auth-logo"><CalendarDays size={48} strokeWidth={1.5} /></div>
                    <h1>StudyGrid</h1>
                    <p>Thời khoá biểu thông minh — kết hợp học tập<br />và cuộc sống vào một lưới thời gian duy nhất</p>
                </div>

                <div className="auth-features">
                    <div className="auth-feature">
                        <span className="auth-feature-icon"><GraduationCap size={24} /></span>
                        <div>
                            <strong>Dành cho mọi cấp học</strong>
                            <p>Cấp 1, 2, 3 đến Đại học — nạp thời khoá biểu trường ngay</p>
                        </div>
                    </div>
                    <div className="auth-feature">
                        <span className="auth-feature-icon"><Timer size={24} /></span>
                        <div>
                            <strong>Time-blocking thông minh</strong>
                            <p>Auto-schedule bài tập, cân bằng học — chơi — nghỉ</p>
                        </div>
                    </div>
                    <div className="auth-feature">
                        <span className="auth-feature-icon"><Cloud size={24} /></span>
                        <div>
                            <strong>Sync mọi thiết bị</strong>
                            <p>Dữ liệu đồng bộ cloud, không lo mất lịch</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-card">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {mode === 'login'
                            ? <><KeyRound size={22} /> Đăng nhập</>
                            : <><Rocket size={22} /> Tạo tài khoản</>
                        }
                    </h2>
                    <p className="auth-subtitle">
                        {mode === 'login'
                            ? 'Đăng nhập để tiếp tục sắp xếp cuộc sống'
                            : 'Tạo tài khoản miễn phí để bắt đầu'}
                    </p>

                    <form onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <div className="auth-field">
                                <label className="label">Tên của bạn</label>
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Nhập tên..."
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label className="label">Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus={mode === 'login'}
                            />
                        </div>

                        <div className="auth-field">
                            <label className="label">Mật khẩu</label>
                            <input
                                className="input"
                                type="password"
                                placeholder={mode === 'register' ? 'Ít nhất 6 ký tự' : '••••••••'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && (
                            <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <AlertTriangle size={14} /> {error}
                            </div>
                        )}

                        {success && (
                            <div className="auth-success" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <CheckCircle size={14} /> {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={loading}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
                        >
                            {loading ? (
                                <Loader size={16} className="spin" />
                            ) : mode === 'login' ? (
                                <><KeyRound size={16} /> Đăng nhập</>
                            ) : (
                                <><Rocket size={16} /> Đăng ký</>
                            )}
                        </button>
                    </form>

                    <div className="auth-toggle">
                        {mode === 'login' ? (
                            <p>
                                Chưa có tài khoản?{' '}
                                <button className="auth-link" onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
                                    Đăng ký ngay
                                </button>
                            </p>
                        ) : (
                            <p>
                                Đã có tài khoản?{' '}
                                <button className="auth-link" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                    Đăng nhập
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
