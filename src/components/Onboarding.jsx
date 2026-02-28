import React, { useState } from 'react';
import { CalendarDays, School, GraduationCap, Backpack, Briefcase, BookOpen, Zap, Dumbbell, Wallet, BookMarked, Globe, Palette, Users, BarChart3, Heart, Target, Scale, Rocket, Handshake, User, Moon, ClipboardList, Lightbulb, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const STEPS = ['welcome', 'level', 'vibe', 'sleep', 'templates', 'goals', 'ready'];

const LEVELS = [
    { key: 'cap1', label: 'Cấp 1 (Tiểu học)', Icon: School, desc: 'Lớp 1—5', grades: ['1', '2', '3', '4', '5'] },
    { key: 'cap2', label: 'Cấp 2 (THCS)', Icon: School, desc: 'Lớp 6—9', grades: ['6', '7', '8', '9'] },
    { key: 'cap3', label: 'Cấp 3 (THPT)', Icon: Backpack, desc: 'Lớp 10—12', grades: ['10', '11', '12'] },
    { key: 'university', label: 'Đại học / Cao đẳng', Icon: GraduationCap, desc: 'Sinh viên' },
    { key: 'working', label: 'Đi làm', Icon: Briefcase, desc: 'Người đi làm' },
];

const VIBES = [
    { key: 'student', label: 'Chỉ đi học', Icon: BookOpen, desc: 'Tập trung 100% vào việc học' },
    { key: 'both', label: 'Vừa học vừa làm', Icon: Zap, desc: 'Cân bằng giữa học tập và công việc' },
    { key: 'working', label: 'Chủ yếu đi làm', Icon: Briefcase, desc: 'Đi làm là chính, học thêm ngoài giờ' },
];

const TEMPLATES = [
    { id: 'gym', label: 'Gym / Thể thao', Icon: Dumbbell },
    { id: 'parttime', label: 'Part-time / Làm thêm', Icon: Wallet },
    { id: 'study_extra', label: 'Học thêm / Gia sư', Icon: BookMarked },
    { id: 'english', label: 'Học tiếng Anh', Icon: Globe },
    { id: 'hobby', label: 'Sở thích / Hobby', Icon: Palette },
    { id: 'family', label: 'Thời gian gia đình', Icon: Users },
];

const GOALS = [
    { id: 'gpa', label: 'Điểm / GPA cao', Icon: BarChart3 },
    { id: 'health', label: 'Sức khoẻ tốt', Icon: Heart },
    { id: 'money', label: 'Kiếm tiền', Icon: Wallet },
    { id: 'balance', label: 'Cân bằng cuộc sống', Icon: Scale },
    { id: 'skill', label: 'Phát triển kỹ năng', Icon: Rocket },
    { id: 'social', label: 'Kết nối xã hội', Icon: Handshake },
];

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const [config, setConfig] = useState({
        name: '',
        schoolLevel: '',
        grade: '',
        vibe: '',
        sleepStart: '23:00',
        sleepEnd: '06:30',
        templates: [],
        goals: [],
    });
    const [validationError, setValidationError] = useState('');

    const currentStep = STEPS[step];

    const updateField = (key, value) => {
        setConfig({ ...config, [key]: value });
        setValidationError('');
    };

    const toggleItem = (key, id) => {
        const arr = config[key];
        updateField(key, arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
    };

    const canProceed = () => {
        switch (currentStep) {
            case 'welcome':
                return config.name.trim().length > 0;
            case 'level':
                if (!config.schoolLevel) return false;
                const lvl = LEVELS.find(l => l.key === config.schoolLevel);
                if (lvl?.grades && !config.grade) return false;
                return true;
            case 'vibe':
                return !!config.vibe;
            default:
                return true;
        }
    };

    const getValidationMessage = () => {
        switch (currentStep) {
            case 'welcome':
                return 'Vui lòng nhập tên của bạn';
            case 'level':
                if (!config.schoolLevel) return 'Vui lòng chọn cấp học';
                const lvl = LEVELS.find(l => l.key === config.schoolLevel);
                if (lvl?.grades && !config.grade) return 'Vui lòng chọn lớp';
                return '';
            case 'vibe':
                return 'Vui lòng chọn nhịp sống';
            default:
                return '';
        }
    };

    const nextStep = () => {
        if (!canProceed()) {
            setValidationError(getValidationMessage());
            return;
        }
        setValidationError('');
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    const prevStep = () => {
        setValidationError('');
        if (step > 0) setStep(step - 1);
    };

    const finish = () => {
        onComplete(config);
    };

    // Set default sleep based on school level
    const handleLevelSelect = (levelKey) => {
        let sleepStart = '23:00', sleepEnd = '06:30';
        if (levelKey === 'cap1') {
            sleepStart = '21:00'; sleepEnd = '06:00';
        } else if (levelKey === 'cap2') {
            sleepStart = '22:00'; sleepEnd = '06:00';
        } else if (levelKey === 'cap3') {
            sleepStart = '22:30'; sleepEnd = '06:00';
        }
        setConfig({ ...config, schoolLevel: levelKey, grade: '', sleepStart, sleepEnd });
        setValidationError('');
    };

    const selectedLevel = LEVELS.find(l => l.key === config.schoolLevel);

    return (
        <div className="onboarding">
            <div className="onboarding-left">
                <div className="onboarding-brand">
                    <h1>StudyGrid</h1>
                    <p>Thời khoá biểu thông minh — kết hợp học tập và cuộc sống vào một lưới thời gian duy nhất</p>
                    <div style={{ marginTop: 32 }}><CalendarDays size={48} strokeWidth={1.3} /></div>
                </div>
            </div>

            <div className="onboarding-right">
                {/* Progress bar */}
                <div className="onboarding-progress">
                    {STEPS.map((s, i) => (
                        <div key={s} className={`progress-dot ${i <= step ? 'active' : ''}`} />
                    ))}
                </div>

                {/* Step 0: Welcome */}
                {currentStep === 'welcome' && (
                    <div className="onboarding-step" style={{ animation: 'fadeSlideIn 400ms ease' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Chào bạn!</h2>
                        <p>Bắt đầu thiết kế cuộc sống của bạn</p>
                        <div style={{ marginTop: 24 }}>
                            <label className="label">TÊN CỦA BẠN</label>
                            <input
                                className="input"
                                placeholder="Nhập tên..."
                                value={config.name}
                                onChange={e => updateField('name', e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <p>StudyGrid giúp bạn:</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="var(--success)" /> Lên lịch học + cuộc sống trong 1 grid</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="var(--success)" /> Nạp thời khoá biểu trường tự động</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="var(--success)" /> Auto-schedule bài tập theo deadline</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="var(--success)" /> Focus mode khi đến giờ học</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="var(--success)" /> Cân bằng cuộc sống với Balance Score</p>
                        </div>
                    </div>
                )}

                {/* Step 1: School Level */}
                {currentStep === 'level' && (
                    <div className="onboarding-step" style={{ animation: 'fadeSlideIn 400ms ease' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GraduationCap size={22} /> Bạn đang ở cấp nào?</h2>
                        <p>Chọn để StudyGrid tối ưu thời khoá biểu cho bạn</p>
                        <div className="onboarding-options" style={{ marginTop: 20 }}>
                            {LEVELS.map(lvl => (
                                <button
                                    key={lvl.key}
                                    className={`onboarding-option ${config.schoolLevel === lvl.key ? 'active' : ''}`}
                                    onClick={() => handleLevelSelect(lvl.key)}
                                >
                                    <span className="option-icon"><lvl.Icon size={22} /></span>
                                    <div>
                                        <strong>{lvl.label}</strong>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{lvl.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Grade selection for cap1, cap2, cap3 */}
                        {selectedLevel?.grades && (
                            <div style={{ marginTop: 20 }}>
                                <label className="label">LỚP MẤY?</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {selectedLevel.grades.map(g => (
                                        <button
                                            key={g}
                                            className={`filter-chip ${config.grade === g ? 'active' : ''}`}
                                            onClick={() => updateField('grade', g)}
                                            style={{ minWidth: 44, fontSize: '0.9rem' }}
                                        >
                                            Lớp {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Vibe */}
                {currentStep === 'vibe' && (
                    <div className="onboarding-step" style={{ animation: 'fadeSlideIn 400ms ease' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={22} /> Nhịp sống của bạn?</h2>
                        <p>StudyGrid sẽ gợi ý phù hợp theo lựa chọn</p>
                        <div className="onboarding-options" style={{ marginTop: 20 }}>
                            {VIBES.map(v => (
                                <button
                                    key={v.key}
                                    className={`onboarding-option ${config.vibe === v.key ? 'active' : ''}`}
                                    onClick={() => updateField('vibe', v.key)}
                                >
                                    <span className="option-icon"><v.Icon size={22} /></span>
                                    <div>
                                        <strong>{v.label}</strong>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>{v.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Sleep */}
                {currentStep === 'sleep' && (
                    <div className="onboarding-step" style={{ animation: 'fadeSlideIn 400ms ease' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Moon size={22} /> Giờ ngủ mặc định</h2>
                        <p>StudyGrid sẽ tự động chặn thời gian ngủ</p>
                        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                            <div style={{ flex: 1 }}>
                                <label className="label">ĐI NGỦ</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={config.sleepStart}
                                    onChange={e => updateField('sleepStart', e.target.value)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="label">THỨC DẬY</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={config.sleepEnd}
                                    onChange={e => updateField('sleepEnd', e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <Lightbulb size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span>
                                {config.schoolLevel === 'cap1' ? 'Trẻ tiểu học nên ngủ 9-11 tiếng/đêm' :
                                    config.schoolLevel === 'cap2' ? 'Học sinh THCS nên ngủ 8-10 tiếng/đêm' :
                                        config.schoolLevel === 'cap3' ? 'Học sinh THPT nên ngủ 8-9 tiếng/đêm' :
                                            'Người lớn nên ngủ 7-9 tiếng/đêm'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Step 4: Templates */}
                {currentStep === 'templates' && (
                    <div className="onboarding-step" style={{ animation: 'fadeSlideIn 400ms ease' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={22} /> Hoạt động hàng tuần</h2>
                        <p>Chọn các hoạt động bạn hay làm (ngoài giờ học)</p>
                        <div className="onboarding-options" style={{ marginTop: 20 }}>
                            {TEMPLATES.map(tpl => (
                                <button
                                    key={tpl.id}
                                    className={`onboarding-option ${config.templates.includes(tpl.id) ? 'active' : ''}`}
                                    onClick={() => toggleItem('templates', tpl.id)}
                                >
                                    <span className="option-icon"><tpl.Icon size={20} /></span>
                                    <span>{tpl.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Goals */}
                {currentStep === 'goals' && (
                    <div className="onboarding-step" style={{ animation: 'fadeSlideIn 400ms ease' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target size={22} /> Mục tiêu tuần này</h2>
                        <p>Chọn tối đa 3 mục tiêu ưu tiên</p>
                        <div className="onboarding-options" style={{ marginTop: 20 }}>
                            {GOALS.map(g => (
                                <button
                                    key={g.id}
                                    className={`onboarding-option ${config.goals.includes(g.id) ? 'active' : ''}`}
                                    onClick={() => {
                                        if (config.goals.includes(g.id)) {
                                            toggleItem('goals', g.id);
                                        } else if (config.goals.length < 3) {
                                            toggleItem('goals', g.id);
                                        }
                                    }}
                                    style={{ opacity: !config.goals.includes(g.id) && config.goals.length >= 3 ? 0.4 : 1 }}
                                >
                                    <span className="option-icon"><g.Icon size={20} /></span>
                                    <span>{g.label}</span>
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
                            Đã chọn {config.goals.length}/3
                        </p>
                    </div>
                )}

                {/* Step 6: Ready */}
                {currentStep === 'ready' && (
                    <div className="onboarding-step" style={{ animation: 'fadeSlideIn 400ms ease' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Rocket size={22} /> Sẵn sàng!</h2>
                        <p>Xem lại thiết lập của bạn</p>
                        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <User size={16} />
                                <strong>{config.name || 'Chưa đặt tên'}</strong>
                            </div>
                            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <GraduationCap size={16} />
                                <span>{selectedLevel?.label || 'Chưa chọn'}{config.grade ? ` — Lớp ${config.grade}` : ''}</span>
                            </div>
                            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Zap size={16} />
                                <span>{VIBES.find(v => v.key === config.vibe)?.label || 'Chưa chọn'}</span>
                            </div>
                            <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Moon size={16} />
                                <span>Ngủ {config.sleepStart} → {config.sleepEnd}</span>
                            </div>
                            {config.templates.length > 0 && (
                                <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <ClipboardList size={16} />
                                    <span>{config.templates.map(id => TEMPLATES.find(t => t.id === id)?.label).join(', ')}</span>
                                </div>
                            )}
                            {config.goals.length > 0 && (
                                <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Target size={16} />
                                    <span>{config.goals.map(id => GOALS.find(g => g.id === id)?.label).join(', ')}</span>
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2 }} /> Sau khi vào app, bạn có thể nạp thời khoá biểu trường vào Week Grid
                        </p>
                    </div>
                )}

                {/* Navigation */}
                {validationError && (
                    <div style={{
                        padding: '8px 16px',
                        background: 'var(--warning-bg, #fff3cd)',
                        color: 'var(--warning-text, #856404)',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 8,
                        border: '1px solid var(--warning-border, #ffc107)'
                    }}>
                        ⚠️ {validationError}
                    </div>
                )}
                <div className="onboarding-nav">
                    {step > 0 && (
                        <button className="btn btn-ghost" onClick={prevStep} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <ChevronLeft size={16} /> Quay lại
                        </button>
                    )}
                    <div style={{ flex: 1 }} />
                    {currentStep === 'ready' ? (
                        <button className="btn btn-primary" onClick={finish} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <Rocket size={16} /> Bắt đầu StudyGrid!
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={nextStep}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                opacity: canProceed() ? 1 : 0.5,
                            }}
                        >
                            Tiếp theo <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
