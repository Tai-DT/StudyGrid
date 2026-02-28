import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, Square, SkipForward, RotateCcw, Flame, Coffee, Target, Clock, Sliders } from 'lucide-react';

const PRESETS = [
    { name: 'Pomodoro', work: 25, short: 5, long: 15, rounds: 4 },
    { name: 'Tập trung sâu', work: 50, short: 10, long: 20, rounds: 3 },
    { name: 'Sprint ngắn', work: 15, short: 3, long: 10, rounds: 6 },
    { name: 'Tuỳ chỉnh', work: 25, short: 5, long: 15, rounds: 4, custom: true },
];

export default function PomodoroTimer({ onClose }) {
    const [preset, setPreset] = useState(0);
    const [workMin, setWorkMin] = useState(25);
    const [shortBreak, setShortBreak] = useState(5);
    const [longBreak, setLongBreak] = useState(15);
    const [totalRounds, setTotalRounds] = useState(4);

    const [phase, setPhase] = useState('idle'); // idle | work | shortBreak | longBreak | done
    const [round, setRound] = useState(1);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [totalFocusTime, setTotalFocusTime] = useState(0); // seconds tracked
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    const intervalRef = useRef(null);
    const audioRef = useRef(null);
    const startTimeRef = useRef(null);

    // Load preset
    useEffect(() => {
        const p = PRESETS[preset];
        if (!p.custom) {
            setWorkMin(p.work);
            setShortBreak(p.short);
            setLongBreak(p.long);
            setTotalRounds(p.rounds);
        }
    }, [preset]);

    // Timer tick
    useEffect(() => {
        if (phase === 'idle' || phase === 'done' || isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    // Phase ended
                    handlePhaseEnd();
                    return 0;
                }
                return prev - 1;
            });

            // Track focus time
            if (phase === 'work') {
                setTotalFocusTime(prev => prev + 1);
            }
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [phase, isPaused]);

    const playNotificationSound = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            // Pleasant chime
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) { /* ignore */ }

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: phase === 'work' ? 'Hết giờ học! Nghỉ ngơi nhé!' : 'Hết giờ nghỉ! Bắt đầu học tiếp!',
            });
        }
    }, [phase]);

    const handlePhaseEnd = useCallback(() => {
        playNotificationSound();

        if (phase === 'work') {
            setSessionsCompleted(prev => prev + 1);
            if (round >= totalRounds) {
                // All rounds complete
                setPhase('done');
            } else if (round % 4 === 0) {
                // Long break after every 4th round
                setPhase('longBreak');
                setSecondsLeft(longBreak * 60);
            } else {
                setPhase('shortBreak');
                setSecondsLeft(shortBreak * 60);
            }
        } else {
            // Break ended → next work round
            setRound(prev => prev + 1);
            setPhase('work');
            setSecondsLeft(workMin * 60);
        }
    }, [phase, round, totalRounds, workMin, shortBreak, longBreak, playNotificationSound]);

    const startTimer = () => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        setPhase('work');
        setRound(1);
        setSecondsLeft(workMin * 60);
        setIsPaused(false);
        setTotalFocusTime(0);
        setSessionsCompleted(0);
        startTimeRef.current = Date.now();
    };

    const togglePause = () => setIsPaused(prev => !prev);

    const resetTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase('idle');
        setRound(1);
        setSecondsLeft(0);
        setIsPaused(false);
    };

    const skipPhase = () => {
        handlePhaseEnd();
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const formatFocusTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        if (h > 0) return `${h}h ${m}p`;
        return `${m} phút`;
    };

    // Progress percentage
    const totalPhaseTime = phase === 'work' ? workMin * 60
        : phase === 'shortBreak' ? shortBreak * 60
            : phase === 'longBreak' ? longBreak * 60 : 0;
    const progress = totalPhaseTime > 0 ? ((totalPhaseTime - secondsLeft) / totalPhaseTime) * 100 : 0;

    const phaseLabels = {
        idle: 'Sẵn sàng',
        work: 'Đang học',
        shortBreak: 'Nghỉ ngắn',
        longBreak: 'Nghỉ dài',
        done: 'Hoàn thành!',
    };

    const phaseIcons = {
        idle: <Timer size={14} />,
        work: <Flame size={14} />,
        shortBreak: <Coffee size={14} />,
        longBreak: <Coffee size={14} />,
        done: <Target size={14} />,
    };

    const phaseColors = {
        idle: '#8E8E93',
        work: '#FF3B30',
        shortBreak: '#34C759',
        longBreak: '#6C5CE7',
        done: '#FF9F0A',
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal pomodoro-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3><Timer size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Pomodoro Timer</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
                        ✕
                    </button>
                </div>

                <div className="pomodoro-body">
                    {/* Timer Circle */}
                    <div className="pomodoro-circle-container">
                        <svg className="pomodoro-circle" viewBox="0 0 200 200">
                            <circle className="pomodoro-circle-bg" cx="100" cy="100" r="90" />
                            <circle
                                className="pomodoro-circle-progress"
                                cx="100" cy="100" r="90"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 90}`,
                                    strokeDashoffset: `${2 * Math.PI * 90 * (1 - progress / 100)}`,
                                    stroke: phaseColors[phase],
                                }}
                            />
                        </svg>
                        <div className="pomodoro-circle-content">
                            <div className="pomodoro-time">{phase === 'idle' ? formatTime(workMin * 60) : formatTime(secondsLeft)}</div>
                            <div className="pomodoro-phase" style={{ color: phaseColors[phase], display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                                {phaseIcons[phase]} {phaseLabels[phase]}
                            </div>
                            <div className="pomodoro-round">
                                Vòng {round}/{totalRounds}
                            </div>
                        </div>
                    </div>

                    {/* Round indicators */}
                    <div className="pomodoro-rounds">
                        {Array.from({ length: totalRounds }, (_, i) => (
                            <div
                                key={i}
                                className={`pomodoro-round-dot ${i < sessionsCompleted ? 'completed' : ''} ${i === round - 1 && phase === 'work' ? 'current' : ''}`}
                                title={`Vòng ${i + 1}`}
                            >
                                {i < sessionsCompleted ? '●' : i === round - 1 && phase === 'work' ? '◐' : '○'}
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="pomodoro-controls">
                        {phase === 'idle' ? (
                            <button className="btn btn-primary pomodoro-btn-start" onClick={startTimer}>
                                <Play size={16} /> Bắt đầu
                            </button>
                        ) : phase === 'done' ? (
                            <div className="pomodoro-done">
                                <div className="pomodoro-done-stats">
                                    <div><Target size={14} style={{ verticalAlign: 'middle' }} /> <strong>{sessionsCompleted}</strong> phiên</div>
                                    <div><Clock size={14} style={{ verticalAlign: 'middle' }} /> <strong>{formatFocusTime(totalFocusTime)}</strong> tập trung</div>
                                </div>
                                <button className="btn btn-primary" onClick={startTimer}>
                                    <RotateCcw size={14} /> Bắt đầu lại
                                </button>
                            </div>
                        ) : (
                            <div className="pomodoro-active-controls">
                                <button className="btn btn-ghost" onClick={resetTimer} title="Reset">
                                    <Square size={16} />
                                </button>
                                <button
                                    className={`btn ${isPaused ? 'btn-primary' : 'btn-secondary'} pomodoro-btn-main`}
                                    onClick={togglePause}
                                >
                                    {isPaused ? <><Play size={14} /> Tiếp tục</> : <><Pause size={14} /> Tạm dừng</>}
                                </button>
                                <button className="btn btn-ghost" onClick={skipPhase} title="Bỏ qua">
                                    <SkipForward size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preset selector (only when idle) */}
                    {phase === 'idle' && (
                        <div className="pomodoro-presets">
                            <h4><Sliders size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Chế độ</h4>
                            <div className="pomodoro-preset-list">
                                {PRESETS.map((p, i) => (
                                    <button
                                        key={i}
                                        className={`pomodoro-preset-btn ${preset === i ? 'active' : ''}`}
                                        onClick={() => setPreset(i)}
                                    >
                                        <strong>{p.name}</strong>
                                        <span>{p.work}p học / {p.short}p nghỉ</span>
                                    </button>
                                ))}
                            </div>

                            {/* Custom controls */}
                            {PRESETS[preset]?.custom && (
                                <div className="pomodoro-custom">
                                    <div className="pomodoro-custom-row">
                                        <label><Flame size={12} /> Học (phút)</label>
                                        <input type="number" min="1" max="120" value={workMin}
                                            onChange={e => setWorkMin(parseInt(e.target.value) || 25)} />
                                    </div>
                                    <div className="pomodoro-custom-row">
                                        <label><Coffee size={12} /> Nghỉ ngắn</label>
                                        <input type="number" min="1" max="30" value={shortBreak}
                                            onChange={e => setShortBreak(parseInt(e.target.value) || 5)} />
                                    </div>
                                    <div className="pomodoro-custom-row">
                                        <label><Coffee size={12} /> Nghỉ dài</label>
                                        <input type="number" min="1" max="60" value={longBreak}
                                            onChange={e => setLongBreak(parseInt(e.target.value) || 15)} />
                                    </div>
                                    <div className="pomodoro-custom-row">
                                        <label><RotateCcw size={12} /> Số vòng</label>
                                        <input type="number" min="1" max="12" value={totalRounds}
                                            onChange={e => setTotalRounds(parseInt(e.target.value) || 4)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats bar */}
                    {phase !== 'idle' && (
                        <div className="pomodoro-stats-bar">
                            <div><Target size={12} /> Phiên: <strong>{sessionsCompleted}/{totalRounds}</strong></div>
                            <div><Clock size={12} /> Tập trung: <strong>{formatFocusTime(totalFocusTime)}</strong></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
