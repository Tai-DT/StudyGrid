import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CalendarDays, Bot, BookOpen, Bell, Zap, Scale, Target, RefreshCw, X, Check, XCircle, AlertTriangle, Send, Loader } from 'lucide-react';
import { sendToGemini, formatAIResponse, generateAISchedule, getAIReminders, generateTimetableStudyPlan } from '../gemini';

const QUICK_PROMPTS = [
    { icon: <CalendarDays size={14} />, label: 'Gợi ý lịch hôm nay', prompt: 'Gợi ý cho tôi lịch học hôm nay hợp lý nhất' },
    { icon: <Bot size={14} />, label: 'AI tạo lịch tự động', action: 'auto-schedule' },
    { icon: <BookOpen size={14} />, label: 'Lịch ôn theo TKB', action: 'timetable-study' },
    { icon: <Bell size={14} />, label: 'AI nhắc nhở', action: 'reminders' },
    { icon: <Zap size={14} />, label: 'Tips học hiệu quả', prompt: 'Cho tôi tips học hiệu quả dựa trên lịch của tôi' },
    { icon: <Scale size={14} />, label: 'Phân tích Balance', prompt: 'Phân tích mức cân bằng cuộc sống của tôi tuần này' },
    { icon: <Target size={14} />, label: 'Kế hoạch mục tiêu', prompt: 'Giúp tôi lên kế hoạch để đạt mục tiêu hiện tại' },
];

export default function AIChat({ isOpen, onClose, userContext, onAddBlocks }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: `Chào ${userContext?.user?.name || 'bạn'}! Mình là **StudyBot** — trợ lý AI của StudyGrid.\n\nMình có thể giúp bạn:\n• Lên lịch học tập hợp lý\n• **Tạo lịch tự động** bằng AI\n• **Nhắc nhở thông minh** dựa trên lịch\n• Gợi ý phương pháp học hiệu quả\n• Phân tích balance cuộc sống\n\nHỏi mình bất cứ gì nhé!`,
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pendingBlocks, setPendingBlocks] = useState(null); // AI-generated blocks awaiting approval
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // ─── AI Auto-Schedule ─────────────────────────────────
    const handleAutoSchedule = async () => {
        if (isLoading) return;
        setError(null);
        setIsLoading(true);

        const dayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

        setMessages(prev => [...prev, {
            role: 'user',
            text: '🤖 Tạo lịch tự động cho hôm nay',
            timestamp: new Date(),
        }]);

        try {
            const blocks = await generateAISchedule(userContext, dayIdx);
            setPendingBlocks(blocks);

            const blockList = blocks.map(b =>
                `• **${b.title}** (${String(b.startHour).padStart(2, '0')}:${String(b.startMin).padStart(2, '0')} → ${String(b.endHour).padStart(2, '0')}:${String(b.endMin).padStart(2, '0')}) — ${b.category}`
            ).join('\n');

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: `🤖 Mình đã tạo lịch cho **${dayNames[dayIdx]}** (${blocks.length} blocks):\n\n${blockList}\n\n👇 Bấm nút bên dưới để thêm vào lịch hoặc bỏ qua.`,
                timestamp: new Date(),
                hasActions: true,
                actionType: 'schedule',
            }]);
        } catch (err) {
            if (err.message?.startsWith('AI_TEXT_RESPONSE:')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: err.message.replace('AI_TEXT_RESPONSE:', ''),
                    timestamp: new Date(),
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: '😅 Không tạo được lịch tự động. Bạn thử mô tả ngày của bạn và mình sẽ gợi ý nhé!',
                    timestamp: new Date(),
                    isError: true,
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveSchedule = () => {
        if (pendingBlocks && onAddBlocks) {
            onAddBlocks(pendingBlocks);
            setPendingBlocks(null);
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: `✅ Đã thêm **${pendingBlocks.length} blocks** vào lịch! Vào **Week Grid** để xem nhé 📅`,
                timestamp: new Date(),
            }]);
        }
    };

    const handleRejectSchedule = () => {
        setPendingBlocks(null);
        setMessages(prev => [...prev, {
            role: 'assistant',
            text: '👍 OK, mình đã bỏ qua. Bạn có thể mô tả lại yêu cầu để mình tạo lịch khác!',
            timestamp: new Date(),
        }]);
    };

    // ─── AI Timetable Study Plan ──────────────────────────
    const handleTimetableStudy = async () => {
        if (isLoading) return;
        setError(null);
        setIsLoading(true);

        const dayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

        setMessages(prev => [...prev, {
            role: 'user',
            text: '📚 Phân tích TKB và tạo lịch ôn tập',
            timestamp: new Date(),
        }]);

        try {
            const result = await generateTimetableStudyPlan(userContext, dayIdx);
            const { blocks, analysis } = result;
            setPendingBlocks(blocks);

            // Build analysis summary
            const analysisSummary = `📊 **Phân tích TKB:**\n- ${analysis.totalSubjects} môn học, ${userContext?.timetable?.length || 0} tiết/tuần\n- Hôm nay: ${analysis.targetDayClasses} tiết trên lớp\n- Ngày mai: ${analysis.nextDayClasses} tiết\n\n`;

            const blockList = blocks.map(b =>
                `• **${b.title}** (${String(b.startHour).padStart(2, '0')}:${String(b.startMin).padStart(2, '0')} → ${String(b.endHour).padStart(2, '0')}:${String(b.endMin).padStart(2, '0')}) — ${b.note || b.category}`
            ).join('\n');

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: `📚 **Lịch ôn tập theo TKB cho ${dayNames[dayIdx]}** (${blocks.length} blocks):\n\n${analysisSummary}${blockList}\n\n💡 Lịch đã được tối ưu: ôn trước môn ngày mai, ôn lại môn vừa học hôm nay.\n👇 Bấm nút để thêm vào lịch hoặc bỏ qua.`,
                timestamp: new Date(),
                hasActions: true,
                actionType: 'schedule',
            }]);
        } catch (err) {
            if (err.message?.startsWith('AI_TEXT_RESPONSE:')) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: err.message.replace('AI_TEXT_RESPONSE:', ''),
                    timestamp: new Date(),
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    text: '😅 Chưa tạo được lịch ôn. Hãy thêm TKB trường vào trước nhé!',
                    timestamp: new Date(),
                    isError: true,
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ─── AI Reminders ─────────────────────────────────────
    const handleReminders = async () => {
        if (isLoading) return;
        setError(null);
        setIsLoading(true);

        setMessages(prev => [...prev, {
            role: 'user',
            text: '🔔 Xem nhắc nhở AI',
            timestamp: new Date(),
        }]);

        try {
            const reminders = await getAIReminders(userContext);

            const reminderList = reminders.map(r => {
                const priorityBadge = r.priority === 'high' ? '🔴' : r.priority === 'medium' ? '🟡' : '🟢';
                return `${r.icon} **${r.title}** ${priorityBadge}\n${r.message}`;
            }).join('\n\n');

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: `🔔 **Nhắc nhở thông minh** (${new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' })}):\n\n${reminderList}`,
                timestamp: new Date(),
            }]);

            // Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
                reminders
                    .filter(r => r.priority === 'high')
                    .forEach(r => {
                        new Notification(`${r.icon} ${r.title}`, { body: r.message, tag: 'studygrid-ai' });
                    });
            } else if ('Notification' in window && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: '😅 Không lấy được nhắc nhở. Thử lại sau nhé!',
                timestamp: new Date(),
                isError: true,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // ─── Send regular message ─────────────────────────────
    const handleSend = async (customMessage) => {
        const text = customMessage || input.trim();
        if (!text || isLoading) return;

        setError(null);
        setInput('');

        const userMsg = { role: 'user', text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);

        setIsLoading(true);

        try {
            const history = messages
                .filter(m => m.role !== 'system')
                .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }));

            const reply = await sendToGemini(text, history, userContext);

            setMessages(prev => [...prev, {
                role: 'assistant',
                text: reply,
                timestamp: new Date(),
            }]);
        } catch (err) {
            setError(err.message || 'Có lỗi khi gọi AI. Thử lại nhé!');
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: '😅 Xin lỗi, có lỗi xảy ra. Bạn thử lại nhé!',
                timestamp: new Date(),
                isError: true,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickPrompt = (qp) => {
        if (qp.action === 'auto-schedule') {
            handleAutoSchedule();
        } else if (qp.action === 'timetable-study') {
            handleTimetableStudy();
        } else if (qp.action === 'reminders') {
            handleReminders();
        } else if (qp.prompt) {
            handleSend(qp.prompt);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            text: `Chat đã được reset! 🔄 Hỏi mình bất cứ gì nhé.`,
            timestamp: new Date(),
        }]);
        setPendingBlocks(null);
        setError(null);
    };

    if (!isOpen) return null;

    return (
        <div className="ai-chat-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="ai-chat-panel">
                {/* Header */}
                <div className="ai-chat-header">
                    <div className="ai-chat-header-left">
                        <div className="ai-chat-avatar"><Bot size={20} /></div>
                        <div>
                            <h3>StudyBot AI</h3>
                            <span className="ai-chat-status">
                                {isLoading ? <><Loader size={10} className="spin" /> Đang suy nghĩ...</> : <><span className="status-dot online" /> Sẵn sàng</>}
                            </span>
                        </div>
                    </div>
                    <div className="ai-chat-header-right">
                        <button className="ai-chat-btn" onClick={clearChat} title="Reset chat">
                            <RefreshCw size={16} />
                        </button>
                        <button className="ai-chat-btn" onClick={onClose} title="Đóng">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="ai-chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`ai-chat-msg ${msg.role}`}>
                            {msg.role === 'assistant' && (
                                <div className="ai-chat-msg-avatar"><Bot size={16} /></div>
                            )}
                            <div className={`ai-chat-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
                                <div
                                    className="ai-chat-text"
                                    dangerouslySetInnerHTML={{ __html: formatAIResponse(msg.text) }}
                                />
                                <span className="ai-chat-time">
                                    {msg.timestamp?.toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Pending schedule approval buttons */}
                    {pendingBlocks && (
                        <div className="ai-schedule-actions">
                            <button className="ai-action-btn approve" onClick={handleApproveSchedule}>
                                <Check size={14} /> Thêm vào lịch ({pendingBlocks.length} blocks)
                            </button>
                            <button className="ai-action-btn reject" onClick={handleRejectSchedule}>
                                <XCircle size={14} /> Bỏ qua
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="ai-chat-msg assistant">
                            <div className="ai-chat-msg-avatar"><Bot size={16} /></div>
                            <div className="ai-chat-bubble assistant">
                                <div className="ai-typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                {messages.length <= 2 && !isLoading && (
                    <div className="ai-quick-prompts">
                        {QUICK_PROMPTS.map((qp, i) => (
                            <button
                                key={i}
                                className={`ai-quick-btn ${qp.action ? 'action-btn' : ''}`}
                                onClick={() => handleQuickPrompt(qp)}
                            >
                                <span>{qp.icon}</span> {qp.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="ai-chat-error">
                        <AlertTriangle size={14} /> {error}
                    </div>
                )}

                {/* Input */}
                <div className="ai-chat-input-area">
                    <textarea
                        ref={inputRef}
                        className="ai-chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Hỏi StudyBot bất cứ gì..."
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        className="ai-chat-send"
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <Loader size={18} className="spin" /> : <Send size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
