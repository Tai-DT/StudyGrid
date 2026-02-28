import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Coffee, Eye, Wind, Dumbbell, Droplets, Music, Pause, Check, Clock } from 'lucide-react';

const BREAK_REMINDERS = [
    { icon: <Coffee size={24} />, title: 'Nghỉ giải lao!', message: 'Bạn đã tập trung được một lúc rồi. Đứng dậy đi lại, uống nước nhé!', duration: 5 },
    { icon: <Eye size={24} />, title: 'Nghỉ mắt!', message: 'Nhìn xa 20 giây để mắt được thư giãn (quy tắc 20-20-20)', duration: 4 },
    { icon: <Wind size={24} />, title: 'Hít thở sâu!', message: 'Hít vào 4s → Giữ 4s → Thở ra 6s. Lặp lại 3 lần', duration: 5 },
    { icon: <Dumbbell size={24} />, title: 'Vận động nhẹ!', message: 'Xoay cổ, vai, cổ tay. Đứng lên vươn vai 10 giây!', duration: 4 },
    { icon: <Droplets size={24} />, title: 'Uống nước!', message: 'Cơ thể cần nước để não hoạt động tốt. Uống 1 ly nước nhé!', duration: 4 },
    { icon: <Music size={24} />, title: 'Thư giãn!', message: 'Nghe 1 bài nhạc yêu thích hoặc nhắm mắt nghỉ 2 phút', duration: 5 },
];

export default function BreakReminder({ enabled = true, intervalMinutes = 25, onStartFocus }) {
    const [visible, setVisible] = useState(false);
    const [currentReminder, setCurrentReminder] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [minutesSinceBreak, setMinutesSinceBreak] = useState(0);
    const [totalBreaks, setTotalBreaks] = useState(0);
    const timerRef = useRef(null);
    const countdownRef = useRef(null);
    const reminderIndexRef = useRef(0);

    // Main interval timer — count minutes since last break
    useEffect(() => {
        if (!enabled || isPaused) return;

        timerRef.current = setInterval(() => {
            setMinutesSinceBreak(prev => {
                const next = prev + 1;
                if (next >= intervalMinutes) {
                    // Time for a break!
                    triggerBreakReminder();
                    return 0;
                }
                return next;
            });
        }, 60000); // Every 1 minute

        return () => clearInterval(timerRef.current);
    }, [enabled, isPaused, intervalMinutes]);

    const triggerBreakReminder = useCallback(() => {
        const reminder = BREAK_REMINDERS[reminderIndexRef.current % BREAK_REMINDERS.length];
        reminderIndexRef.current += 1;
        setCurrentReminder(reminder);
        setTimeLeft(reminder.duration * 60); // seconds
        setVisible(true);
        setTotalBreaks(prev => prev + 1);

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${reminder.icon} ${reminder.title}`, {
                body: reminder.message,
                tag: 'studygrid-break',
                silent: false,
            });
        }

        // Play a subtle sound if possible
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 523.25; // C5
            gain.gain.value = 0.1;
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.frequency.value = 659.25; // E5
                gain2.gain.value = 0.1;
                osc2.start();
                osc2.stop(ctx.currentTime + 0.3);
            }, 250);
        } catch { }
    }, []);

    // Countdown timer for break duration
    useEffect(() => {
        if (!visible || timeLeft <= 0) return;

        countdownRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setVisible(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(countdownRef.current);
    }, [visible, timeLeft]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const dismiss = () => {
        setVisible(false);
        clearInterval(countdownRef.current);
    };

    const snooze = () => {
        setVisible(false);
        clearInterval(countdownRef.current);
        // Reset timer to remind again in 5 minutes
        setMinutesSinceBreak(intervalMinutes - 5);
    };

    const togglePause = () => {
        setIsPaused(prev => !prev);
    };

    const formatCountdown = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const progressPercent = minutesSinceBreak / intervalMinutes * 100;

    return (
        <>
            {/* Mini status bar - always visible */}
            {enabled && (
                <div className={`break-status ${isPaused ? 'paused' : ''}`} onClick={togglePause}>
                    <div className="break-status-progress" style={{ width: `${progressPercent}%` }} />
                    <span className="break-status-text">
                        {isPaused ? <><Pause size={12} /> Tạm dừng</> : <><Coffee size={12} /> {intervalMinutes - minutesSinceBreak}p</>}
                    </span>
                    {totalBreaks > 0 && (
                        <span className="break-status-count">{totalBreaks}<Wind size={10} /></span>
                    )}
                </div>
            )}

            {/* Break notification toast */}
            {visible && currentReminder && (
                <div className="break-toast-overlay">
                    <div className="break-toast">
                        <div className="break-toast-icon">{currentReminder.icon}</div>
                        <div className="break-toast-content">
                            <h3>{currentReminder.title}</h3>
                            <p>{currentReminder.message}</p>
                            <div className="break-toast-timer">
                                <div className="break-toast-bar">
                                    <div
                                        className="break-toast-bar-fill"
                                        style={{ width: `${(timeLeft / (currentReminder.duration * 60)) * 100}%` }}
                                    />
                                </div>
                                <span>{formatCountdown(timeLeft)}</span>
                            </div>
                        </div>
                        <div className="break-toast-actions">
                            <button className="break-btn primary" onClick={dismiss}>
                                <Check size={14} /> Xong
                            </button>
                            <button className="break-btn secondary" onClick={snooze}>
                                <Clock size={14} /> +5p
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
