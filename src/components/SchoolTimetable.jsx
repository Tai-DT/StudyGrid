import React, { useState, useEffect, useRef } from 'react';
import { ClipboardList, Bot, Pencil, Download, Loader, MapPin, Camera, RotateCcw, Check, Plus, AlertTriangle, Lightbulb } from 'lucide-react';
import { DAYS } from '../store';
import {
    fetchTimetable,
    upsertTimetableEntry,
    deleteTimetableEntry,
    importTimetableAsBlocks,
} from '../supabase';
import { parseTimetableWithAI } from '../gemini';

// School period presets by level
const PERIOD_PRESETS = {
    cap1: [
        { period: 1, start: '07:00', end: '07:35' },
        { period: 2, start: '07:40', end: '08:15' },
        { period: 3, start: '08:30', end: '09:05' },
        { period: 4, start: '09:10', end: '09:45' },
        { period: 5, start: '10:00', end: '10:35' },
        { period: 6, start: '13:30', end: '14:05' },
        { period: 7, start: '14:10', end: '14:45' },
        { period: 8, start: '15:00', end: '15:35' },
    ],
    cap2: [
        { period: 1, start: '07:00', end: '07:45' },
        { period: 2, start: '07:50', end: '08:35' },
        { period: 3, start: '08:50', end: '09:35' },
        { period: 4, start: '09:40', end: '10:25' },
        { period: 5, start: '10:30', end: '11:15' },
        { period: 6, start: '13:30', end: '14:15' },
        { period: 7, start: '14:20', end: '15:05' },
        { period: 8, start: '15:20', end: '16:05' },
        { period: 9, start: '16:10', end: '16:55' },
    ],
    cap3: [
        { period: 1, start: '07:00', end: '07:45' },
        { period: 2, start: '07:50', end: '08:35' },
        { period: 3, start: '08:50', end: '09:35' },
        { period: 4, start: '09:40', end: '10:25' },
        { period: 5, start: '10:30', end: '11:15' },
        { period: 6, start: '13:00', end: '13:45' },
        { period: 7, start: '13:50', end: '14:35' },
        { period: 8, start: '14:50', end: '15:35' },
        { period: 9, start: '15:40', end: '16:25' },
        { period: 10, start: '16:30', end: '17:15' },
    ],
    university: [
        { period: 1, start: '07:00', end: '07:50' },
        { period: 2, start: '08:00', end: '08:50' },
        { period: 3, start: '09:00', end: '09:50' },
        { period: 4, start: '10:00', end: '10:50' },
        { period: 5, start: '11:00', end: '11:50' },
        { period: 6, start: '13:00', end: '13:50' },
        { period: 7, start: '14:00', end: '14:50' },
        { period: 8, start: '15:00', end: '15:50' },
        { period: 9, start: '16:00', end: '16:50' },
        { period: 10, start: '17:00', end: '17:50' },
    ],
};

const SUBJECT_SUGGESTIONS = {
    cap1: ['Toán', 'Tiếng Việt', 'Tiếng Anh', 'Đạo Đức', 'Tự nhiên & Xã hội', 'Mỹ thuật', 'Âm nhạc', 'Thể dục', 'Tin học', 'Hoạt động TN'],
    cap2: ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hoá học', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD', 'Công nghệ', 'Tin học', 'Thể dục', 'Mỹ thuật', 'Âm nhạc'],
    cap3: ['Toán', 'Ngữ văn', 'Tiếng Anh', 'Vật lý', 'Hoá học', 'Sinh học', 'Lịch sử', 'Địa lý', 'GDCD', 'GDQP-AN', 'Công nghệ', 'Tin học', 'Thể dục'],
    university: ['Toán cao cấp', 'Vật lý đại cương', 'Lập trình', 'Tiếng Anh', 'Triết học', 'Kinh tế học', 'Cơ sở dữ liệu', 'Mạng máy tính'],
};

const parseTime = (str) => {
    const [h, m] = str.split(':').map(Number);
    return { hour: h, min: m };
};

export default function SchoolTimetable({ userId, schoolLevel, onClose, onImported }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'import' | 'add'
    const [importMode, setImportMode] = useState(null); // 'paste' | 'photo' | null
    const [pasteText, setPasteText] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [aiParsing, setAiParsing] = useState(false);
    const [parsedEntries, setParsedEntries] = useState(null);
    const [parseError, setParseError] = useState('');
    const [newEntry, setNewEntry] = useState({
        subject: '', teacher: '', room: '', day_of_week: 0, period: 1,
    });

    const fileInputRef = useRef(null);

    const level = schoolLevel || 'university';
    const periods = PERIOD_PRESETS[level] || PERIOD_PRESETS.university;
    const suggestions = SUBJECT_SUGGESTIONS[level] || SUBJECT_SUGGESTIONS.university;

    useEffect(() => { loadEntries(); }, []);

    const loadEntries = async () => {
        setLoading(true);
        const { data } = await fetchTimetable(userId);
        setEntries(data || []);
        setLoading(false);
    };

    const handleAddEntry = async () => {
        if (!newEntry.subject.trim()) return;
        const preset = periods.find(p => p.period === newEntry.period);
        if (!preset) return;
        const startTime = parseTime(preset.start);
        const endTime = parseTime(preset.end);
        const entry = {
            subject: newEntry.subject, teacher: newEntry.teacher, room: newEntry.room,
            day_of_week: newEntry.day_of_week, period: newEntry.period,
            start_hour: startTime.hour, start_min: startTime.min,
            end_hour: endTime.hour, end_min: endTime.min,
        };
        await upsertTimetableEntry(userId, entry);
        setNewEntry({ ...newEntry, subject: '', teacher: '', room: '', period: newEntry.period + 1 });
        loadEntries();
    };

    const handleDeleteEntry = async (id) => {
        await deleteTimetableEntry(id);
        loadEntries();
    };

    const handleImport = async () => {
        setImporting(true);
        const { count, error } = await importTimetableAsBlocks(userId);
        setImporting(false);
        if (!error) onImported(count);
    };

    // ── AI Parsing ──
    const handlePasteSubmit = async () => {
        if (!pasteText.trim()) return;
        setAiParsing(true);
        setParseError('');
        try {
            const result = await parseTimetableWithAI(pasteText, level);
            setParsedEntries(result);
        } catch (err) {
            setParseError(err.message || 'Không thể phân tích TKB');
        }
        setAiParsing(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageSubmit = async () => {
        if (!imagePreview) return;
        setAiParsing(true);
        setParseError('');
        try {
            const result = await parseTimetableWithAI(imagePreview, level);
            setParsedEntries(result);
        } catch (err) {
            setParseError(err.message || 'Không thể phân tích ảnh TKB');
        }
        setAiParsing(false);
    };

    const handleApplyParsed = async () => {
        if (!parsedEntries || parsedEntries.length === 0) return;
        setAiParsing(true);
        for (const item of parsedEntries) {
            const preset = periods.find(p => p.period === item.period);
            if (!preset) continue;
            const startTime = parseTime(preset.start);
            const endTime = parseTime(preset.end);
            await upsertTimetableEntry(userId, {
                subject: item.subject,
                teacher: item.teacher || '',
                room: item.room || '',
                day_of_week: item.day_of_week,
                period: item.period,
                start_hour: startTime.hour, start_min: startTime.min,
                end_hour: endTime.hour, end_min: endTime.min,
            });
        }
        setParsedEntries(null);
        setImportMode(null);
        setActiveTab('grid');
        setPasteText('');
        setImagePreview(null);
        setAiParsing(false);
        loadEntries();
    };

    // Group entries by day
    const byDay = {};
    for (let d = 0; d < 7; d++) byDay[d] = [];
    entries.forEach(e => { if (byDay[e.day_of_week]) byDay[e.day_of_week].push(e); });

    const levelLabels = {
        cap1: 'Tiểu học', cap2: 'THCS', cap3: 'THPT', university: 'Đại học',
    };

    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal timetable-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 920, maxHeight: '90vh', overflow: 'auto' }}>
                {/* ── Header ── */}
                <div className="timetable-modal-header">
                    <div className="timetable-modal-title">
                        <h3><ClipboardList size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Thời khoá biểu</h3>
                        <span className="timetable-badge">{levelLabels[level]} — {entries.length} tiết</span>
                    </div>
                    <button className="timetable-close-btn" onClick={onClose}>✕</button>
                </div>

                {/* ── Tab Buttons ── */}
                <div className="timetable-tabs">
                    <button
                        className={`timetable-tab ${activeTab === 'grid' ? 'active' : ''}`}
                        onClick={() => setActiveTab('grid')}
                    >
                        <ClipboardList size={14} /> Bảng TKB
                    </button>
                    <button
                        className={`timetable-tab ${activeTab === 'import' ? 'active' : ''}`}
                        onClick={() => setActiveTab('import')}
                    >
                        <Bot size={14} /> Nạp bằng AI
                    </button>
                    <button
                        className={`timetable-tab ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        <Pencil size={14} /> Thêm thủ công
                    </button>
                    {entries.length > 0 && (
                        <button
                            className="timetable-tab timetable-tab-action"
                            onClick={handleImport}
                            disabled={importing}
                        >
                            {importing ? <><Loader size={14} className="spin" /> Đang nạp...</> : <><Download size={14} /> Nạp vào Week Grid</>}
                        </button>
                    )}
                </div>

                {/* ── Tab Content ── */}
                <div className="timetable-content">
                    {/* ══ Import Tab ══ */}
                    {activeTab === 'import' && (
                        <div className="timetable-import-section">
                            {!importMode && !parsedEntries && (
                                <div className="timetable-import-options">
                                    <h4><Bot size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />Nạp TKB nhanh bằng AI</h4>
                                    <p className="timetable-import-desc">Chọn cách nạp thời khoá biểu — AI sẽ tự nhận diện và điền cho bạn</p>

                                    <div className="timetable-import-cards">
                                        <button className="timetable-import-card" onClick={() => setImportMode('paste')}>
                                            <div className="timetable-import-card-icon"><ClipboardList size={28} /></div>
                                            <div className="timetable-import-card-title">Dán văn bản</div>
                                            <div className="timetable-import-card-desc">Copy TKB từ web, file, hoặc gõ tay rồi dán vào đây</div>
                                        </button>

                                        <button className="timetable-import-card" onClick={() => setImportMode('photo')}>
                                            <div className="timetable-import-card-icon"><Camera size={28} /></div>
                                            <div className="timetable-import-card-title">Chụp ảnh / Upload</div>
                                            <div className="timetable-import-card-desc">Chụp ảnh TKB trên bảng, sổ tay, hoặc screenshot</div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Paste mode */}
                            {importMode === 'paste' && !parsedEntries && (
                                <div className="timetable-paste-area">
                                    <div className="timetable-paste-header">
                                        <button className="timetable-back-btn" onClick={() => setImportMode(null)}>← Quay lại</button>
                                        <h4><ClipboardList size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Dán thời khoá biểu</h4>
                                    </div>
                                    <textarea
                                        className="timetable-textarea"
                                        rows={8}
                                        placeholder={`Dán TKB ở đây...\n\nVí dụ:\nThứ 2: Tiết 1 Toán, Tiết 2 Ngữ văn, Tiết 3 Tiếng Anh\nThứ 3: Tiết 1 Vật lý, Tiết 2 Hoá học...`}
                                        value={pasteText}
                                        onChange={e => setPasteText(e.target.value)}
                                        autoFocus
                                    />
                                    {parseError && <div className="timetable-error"><AlertTriangle size={14} /> {parseError}</div>}
                                    <button
                                        className="timetable-action-btn"
                                        onClick={handlePasteSubmit}
                                        disabled={aiParsing || !pasteText.trim()}
                                    >
                                        {aiParsing ? (
                                            <><span className="timetable-spinner" /> Đang phân tích...</>
                                        ) : (
                                            <><Bot size={14} /> AI phân tích TKB</>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Photo mode */}
                            {importMode === 'photo' && !parsedEntries && (
                                <div className="timetable-photo-area">
                                    <div className="timetable-paste-header">
                                        <button className="timetable-back-btn" onClick={() => { setImportMode(null); setImagePreview(null); }}>← Quay lại</button>
                                        <h4><Camera size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Upload ảnh TKB</h4>
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />

                                    {!imagePreview ? (
                                        <div className="timetable-upload-zone" onClick={() => fileInputRef.current?.click()}>
                                            <div className="timetable-upload-icon"><Camera size={32} /></div>
                                            <div className="timetable-upload-title">Chạm để chọn ảnh</div>
                                            <div className="timetable-upload-desc">Hỗ trợ JPG, PNG, HEIC</div>
                                            <div className="timetable-upload-hint"><Lightbulb size={12} /> Tip: Chụp rõ nét, đủ sáng để AI nhận diện tốt hơn</div>
                                        </div>
                                    ) : (
                                        <div className="timetable-image-preview">
                                            <img src={imagePreview} alt="TKB preview" />
                                            <button className="timetable-image-change" onClick={() => fileInputRef.current?.click()}><RotateCcw size={12} /> Đổi ảnh</button>
                                        </div>
                                    )}

                                    {parseError && <div className="timetable-error"><AlertTriangle size={14} /> {parseError}</div>}

                                    {imagePreview && (
                                        <button
                                            className="timetable-action-btn"
                                            onClick={handleImageSubmit}
                                            disabled={aiParsing}
                                        >
                                            {aiParsing ? (
                                                <><span className="timetable-spinner" /> Đang nhận diện...</>
                                            ) : (
                                                <><Bot size={14} /> AI nhận diện ảnh</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Parsed results */}
                            {parsedEntries && (
                                <div className="timetable-parsed-results">
                                    <h4><Check size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />AI đã phân tích được {parsedEntries.length} tiết học</h4>
                                    <div className="timetable-parsed-list">
                                        {parsedEntries.map((item, idx) => (
                                            <div key={idx} className="timetable-parsed-item">
                                                <span className="timetable-parsed-day">{dayNames[item.day_of_week] || '?'}</span>
                                                <span className="timetable-parsed-period">T{item.period}</span>
                                                <span className="timetable-parsed-subject">{item.subject}</span>
                                                {item.room && <span className="timetable-parsed-room"><MapPin size={10} />{item.room}</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="timetable-parsed-actions">
                                        <button className="timetable-ghost-btn" onClick={() => { setParsedEntries(null); setParseError(''); }}>
                                            <RotateCcw size={12} /> Thử lại
                                        </button>
                                        <button className="timetable-action-btn" onClick={handleApplyParsed} disabled={aiParsing}>
                                            {aiParsing ? <><span className="timetable-spinner" /> Đang lưu...</> : <><Check size={14} /> Áp dụng tất cả</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══ Add Manual Tab ══ */}
                    {activeTab === 'add' && (
                        <div className="timetable-add-form">
                            <h4><Pencil size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Thêm tiết học thủ công</h4>
                            <div className="timetable-form-grid">
                                <div className="timetable-form-field">
                                    <label>Môn học</label>
                                    <input
                                        className="timetable-input"
                                        placeholder="Nhập tên môn..."
                                        value={newEntry.subject}
                                        onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })}
                                        list="subject-suggestions"
                                        autoFocus
                                    />
                                    <datalist id="subject-suggestions">
                                        {suggestions.map(s => <option key={s} value={s} />)}
                                    </datalist>
                                </div>
                                <div className="timetable-form-row">
                                    <div className="timetable-form-field">
                                        <label>Giáo viên</label>
                                        <input className="timetable-input" placeholder="Thầy/Cô..." value={newEntry.teacher} onChange={e => setNewEntry({ ...newEntry, teacher: e.target.value })} />
                                    </div>
                                    <div className="timetable-form-field">
                                        <label>Phòng</label>
                                        <input className="timetable-input" placeholder="A201..." value={newEntry.room} onChange={e => setNewEntry({ ...newEntry, room: e.target.value })} />
                                    </div>
                                </div>
                                <div className="timetable-form-field">
                                    <label>Ngày</label>
                                    <div className="timetable-chip-group">
                                        {DAYS.slice(0, 6).map((d, i) => (
                                            <button key={i} className={`timetable-chip ${newEntry.day_of_week === i ? 'active' : ''}`} onClick={() => setNewEntry({ ...newEntry, day_of_week: i })}>{d}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="timetable-form-field">
                                    <label>Tiết</label>
                                    <div className="timetable-chip-group">
                                        {periods.map(p => (
                                            <button key={p.period} className={`timetable-chip ${newEntry.period === p.period ? 'active' : ''}`} onClick={() => setNewEntry({ ...newEntry, period: p.period })}>{p.period}</button>
                                        ))}
                                    </div>
                                </div>
                                {newEntry.period && periods.find(p => p.period === newEntry.period) && (
                                    <div className="timetable-time-preview">
                                        ⏰ Tiết {newEntry.period}: {periods.find(p => p.period === newEntry.period).start} — {periods.find(p => p.period === newEntry.period).end}
                                    </div>
                                )}
                                <div className="timetable-form-actions">
                                    <button className="timetable-action-btn" onClick={handleAddEntry} disabled={!newEntry.subject.trim()}>
                                        <Plus size={14} /> Thêm tiết học
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ Grid Tab ══ */}
                    {activeTab === 'grid' && (
                        <>
                            {loading ? (
                                <div className="timetable-loading"><Loader size={16} className="spin" /> Đang tải...</div>
                            ) : entries.length === 0 ? (
                                <div className="timetable-empty">
                                    <div className="timetable-empty-icon"><ClipboardList size={40} /></div>
                                    <h3>Chưa có thời khoá biểu</h3>
                                    <p>Nạp bằng AI hoặc thêm thủ công</p>
                                    <div className="timetable-empty-actions">
                                        <button className="timetable-action-btn" onClick={() => setActiveTab('import')}>
                                            <Bot size={14} /> Nạp bằng AI
                                        </button>
                                        <button className="timetable-ghost-btn" onClick={() => setActiveTab('add')}>
                                            <Pencil size={14} /> Thêm thủ công
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="timetable-grid">
                                    <div className="timetable-header">
                                        <div className="timetable-header-cell">Tiết</div>
                                        {dayNames.map((d, i) => (
                                            <div key={i} className="timetable-header-cell">{d}</div>
                                        ))}
                                    </div>
                                    {periods.map(p => (
                                        <div key={p.period} className="timetable-row">
                                            <div className="timetable-period-cell">
                                                <div className="period-num">{p.period}</div>
                                                <div className="period-time">{p.start}</div>
                                            </div>
                                            {dayNames.map((_, dayIdx) => {
                                                const entry = entries.find(e => e.day_of_week === dayIdx && e.period === p.period);
                                                return (
                                                    <div key={dayIdx} className={`timetable-cell ${entry ? 'has-entry' : ''}`}>
                                                        {entry ? (
                                                            <div className="timetable-entry">
                                                                <div className="timetable-subject">{entry.subject}</div>
                                                                {entry.room && <div className="timetable-room"><MapPin size={10} /> {entry.room}</div>}
                                                                <button className="timetable-delete" onClick={() => handleDeleteEntry(entry.id)} title="Xoá">✕</button>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
