// ═══════════════════════════════════════════════════════
// StudyGrid — Data Store (localStorage-based)
// ═══════════════════════════════════════════════════════

const STORAGE_KEY = 'studygrid_data';

const CATEGORIES = {
    study: { label: 'Học tập', icon: '◆', color: '#6C5CE7' },
    work: { label: 'Làm việc', icon: '◇', color: '#007AFF' },
    health: { label: 'Sức khoẻ', icon: '●', color: '#34C759' },
    social: { label: 'Xã hội', icon: '◎', color: '#FF6B35' },
    family: { label: 'Gia đình', icon: '⌂', color: '#FF9F0A' },
    personal: { label: 'Cá nhân', icon: '◈', color: '#FF2D55' },
    rest: { label: 'Nghỉ ngơi', icon: '○', color: '#8E8E93' },
};

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAYS_FULL = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const ENERGY_LEVELS = {
    low: { label: 'Thấp', icon: '○', color: '#8E8E93' },
    medium: { label: 'Trung bình', icon: '◐', color: '#FF9F0A' },
    high: { label: 'Cao', icon: '●', color: '#FF3B30' },
};

const BLOCK_TYPES = {
    event: { label: 'Sự kiện cố định', icon: '◆' },
    task: { label: 'Bài tập / Deadline', icon: '☐' },
    routine: { label: 'Thói quen', icon: '↻' },
    goal: { label: 'Mục tiêu', icon: '◎' },
};

function generateId() {
    // Must return valid UUID for Supabase compatibility
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function getDefaultData() {
    return {
        user: {
            name: '',
            vibe: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sleepStart: '23:00',
            sleepEnd: '06:30',
            weeklyGoals: [],
            onboarded: false,
        },
        blocks: [],
        tasks: [],
        goals: [],
        templates: [],
        mood: [],
        settings: {
            notifications: true,
            focusMode: true,
            balanceAlerts: true,
            darkMode: true,
        },
    };
}

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load data:', e);
    }
    return getDefaultData();
}

function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save data:', e);
    }
}

// Sample data for demo
function getSampleBlocks() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return [
        // Monday
        { id: generateId(), title: 'Toán cao cấp', type: 'event', category: 'study', day: 0, startHour: 7, startMin: 30, endHour: 9, endMin: 30, isHard: true, energy: 'high', repeat: [0, 2, 4] },
        { id: generateId(), title: 'Gym', type: 'routine', category: 'health', day: 0, startHour: 6, startMin: 0, endHour: 7, endMin: 0, isHard: false, energy: 'high', repeat: [0, 2, 4] },
        { id: generateId(), title: 'Lập trình Web', type: 'event', category: 'study', day: 0, startHour: 13, startMin: 0, endHour: 15, endMin: 0, isHard: true, energy: 'medium' },

        // Tuesday
        { id: generateId(), title: 'Vật lý đại cương', type: 'event', category: 'study', day: 1, startHour: 8, startMin: 0, endHour: 10, endMin: 0, isHard: true, energy: 'high' },
        { id: generateId(), title: 'Part-time quán cà phê', type: 'event', category: 'work', day: 1, startHour: 14, startMin: 0, endHour: 18, endMin: 0, isHard: true, energy: 'medium' },
        { id: generateId(), title: 'Cà phê với bạn', type: 'event', category: 'social', day: 1, startHour: 19, startMin: 0, endHour: 21, endMin: 0, isHard: false, energy: 'low' },

        // Wednesday
        { id: generateId(), title: 'Gym', type: 'routine', category: 'health', day: 2, startHour: 6, startMin: 0, endHour: 7, endMin: 0, isHard: false, energy: 'high' },
        { id: generateId(), title: 'Toán cao cấp', type: 'event', category: 'study', day: 2, startHour: 7, startMin: 30, endHour: 9, endMin: 30, isHard: true, energy: 'high' },
        { id: generateId(), title: 'Deep Work - Project', type: 'goal', category: 'study', day: 2, startHour: 10, startMin: 0, endHour: 12, endMin: 0, isHard: false, energy: 'high' },
        { id: generateId(), title: 'Ăn trưa + nghỉ', type: 'routine', category: 'rest', day: 2, startHour: 12, startMin: 0, endHour: 13, endMin: 0, isHard: false, energy: 'low' },

        // Thursday
        { id: generateId(), title: 'Tiếng Anh', type: 'event', category: 'study', day: 3, startHour: 8, startMin: 0, endHour: 10, endMin: 0, isHard: true, energy: 'medium' },
        { id: generateId(), title: 'Part-time quán cà phê', type: 'event', category: 'work', day: 3, startHour: 14, startMin: 0, endHour: 18, endMin: 0, isHard: true, energy: 'medium' },
        { id: generateId(), title: 'Gọi điện gia đình', type: 'routine', category: 'family', day: 3, startHour: 20, startMin: 0, endHour: 21, endMin: 0, isHard: false, energy: 'low' },

        // Friday
        { id: generateId(), title: 'Gym', type: 'routine', category: 'health', day: 4, startHour: 6, startMin: 0, endHour: 7, endMin: 0, isHard: false, energy: 'high' },
        { id: generateId(), title: 'Toán cao cấp', type: 'event', category: 'study', day: 4, startHour: 7, startMin: 30, endHour: 9, endMin: 30, isHard: true, energy: 'high' },
        { id: generateId(), title: 'Lập trình Web', type: 'event', category: 'study', day: 4, startHour: 13, startMin: 0, endHour: 15, endMin: 0, isHard: true, energy: 'medium' },
        { id: generateId(), title: 'Đi chơi tối T6', type: 'event', category: 'social', day: 4, startHour: 19, startMin: 0, endHour: 22, endMin: 0, isHard: false, energy: 'low' },

        // Saturday
        { id: generateId(), title: 'Ngủ nướng', type: 'routine', category: 'rest', day: 5, startHour: 7, startMin: 0, endHour: 9, endMin: 0, isHard: false, energy: 'low' },
        { id: generateId(), title: 'Học tiếng Anh', type: 'routine', category: 'personal', day: 5, startHour: 9, startMin: 30, endHour: 11, endMin: 0, isHard: false, energy: 'medium' },
        { id: generateId(), title: 'Part-time', type: 'event', category: 'work', day: 5, startHour: 13, startMin: 0, endHour: 17, endMin: 0, isHard: true, energy: 'medium' },

        // Sunday
        { id: generateId(), title: 'Ngủ nướng', type: 'routine', category: 'rest', day: 6, startHour: 7, startMin: 0, endHour: 9, endMin: 0, isHard: false, energy: 'low' },
        { id: generateId(), title: 'Ăn sáng gia đình', type: 'routine', category: 'family', day: 6, startHour: 9, startMin: 0, endHour: 10, endMin: 30, isHard: false, energy: 'low' },
        { id: generateId(), title: 'Review tuần + plan', type: 'routine', category: 'personal', day: 6, startHour: 11, startMin: 0, endHour: 12, endMin: 0, isHard: false, energy: 'medium' },
        { id: generateId(), title: 'Chill + phim', type: 'routine', category: 'rest', day: 6, startHour: 20, startMin: 0, endHour: 22, endMin: 0, isHard: false, energy: 'low' },

        // Sleep blocks (every day)
        ...Array.from({ length: 7 }, (_, i) => ({
            id: generateId(), title: 'Ngủ', type: 'routine', category: 'rest', day: i, startHour: 23, startMin: 0, endHour: 24, endMin: 0, isHard: true, energy: 'low',
        })),
    ];
}

function getSampleTasks() {
    return [
        { id: generateId(), title: 'Bài tập Toán cao cấp chương 5', deadline: '2026-03-02', estimatedHours: 3, category: 'study', completed: false, scheduled: false },
        { id: generateId(), title: 'Project Lập trình Web - Phase 1', deadline: '2026-03-05', estimatedHours: 8, category: 'study', completed: false, scheduled: false },
        { id: generateId(), title: 'Essay Tiếng Anh 500 words', deadline: '2026-03-03', estimatedHours: 2, category: 'study', completed: false, scheduled: false },
        { id: generateId(), title: 'Lab report Vật lý', deadline: '2026-03-04', estimatedHours: 3, category: 'study', completed: false, scheduled: false },
        { id: generateId(), title: 'Research paper outline', deadline: '2026-03-07', estimatedHours: 4, category: 'personal', completed: false, scheduled: false },
    ];
}

function getSampleGoals() {
    return [
        { id: generateId(), title: 'GPA 3.5+', category: 'study', progress: 68, targetDate: '2026-06-15', weeklyHours: 20, color: '#6C5CE7' },
        { id: generateId(), title: 'Chạy 5km liên tục', category: 'health', progress: 45, targetDate: '2026-04-01', weeklyHours: 4, color: '#00B894' },
        { id: generateId(), title: 'Tiết kiệm 5 triệu', category: 'work', progress: 35, targetDate: '2026-06-01', weeklyHours: 16, color: '#0984E3' },
    ];
}

// Quick Add parser
function parseQuickAdd(text) {
    const result = {
        title: '',
        category: 'personal',
        day: [],
        startHour: null,
        startMin: 0,
        endHour: null,
        endMin: 0,
        repeat: [],
    };

    // Parse days: T2, T3, T4, ...
    const dayMap = { 'T2': 0, 'T3': 1, 'T4': 2, 'T5': 3, 'T6': 4, 'T7': 5, 'CN': 6 };
    const dayRegex = /\b(T[2-7]|CN)\b/gi;
    const days = [];
    let match;
    while ((match = dayRegex.exec(text)) !== null) {
        const d = dayMap[match[1].toUpperCase()];
        if (d !== undefined) days.push(d);
    }
    result.day = days;

    // Parse time: 6:30-7:30, 14:00-16:00
    const timeRegex = /(\d{1,2}):?(\d{2})?\s*[-–]\s*(\d{1,2}):?(\d{2})?/;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
        result.startHour = parseInt(timeMatch[1]);
        result.startMin = parseInt(timeMatch[2] || '0');
        result.endHour = parseInt(timeMatch[3]);
        result.endMin = parseInt(timeMatch[4] || '0');
    }

    // Parse category hints
    const catHints = {
        gym: 'health', 'tập': 'health', 'chạy': 'health',
        học: 'study', 'toán': 'study', 'lý': 'study', 'tiếng': 'study',
        'làm': 'work', 'ca': 'work', 'part': 'work',
        ngủ: 'rest', nghỉ: 'rest', chill: 'rest',
        'đi chơi': 'social', 'cà phê': 'social', 'hẹn': 'social',
        'gia đình': 'family', 'gọi': 'family',
    };

    const lower = text.toLowerCase();
    for (const [hint, cat] of Object.entries(catHints)) {
        if (lower.includes(hint)) {
            result.category = cat;
            break;
        }
    }

    // Title = text minus time and day references
    let title = text
        .replace(timeRegex, '')
        .replace(dayRegex, '')
        .replace(/\s+/g, ' ')
        .trim();
    result.title = title || 'Block mới';

    return result;
}

// Calculate balance score
function calculateBalance(blocks) {
    const hours = {};
    for (const cat of Object.keys(CATEGORIES)) hours[cat] = 0;

    for (const b of blocks) {
        const dur = (b.endHour + b.endMin / 60) - (b.startHour + b.startMin / 60);
        if (dur > 0 && hours[b.category] !== undefined) {
            hours[b.category] += dur;
        }
    }

    const total = Object.values(hours).reduce((a, b) => a + b, 0) || 1;
    const percentages = {};
    for (const [k, v] of Object.entries(hours)) {
        percentages[k] = Math.round((v / total) * 100);
    }

    // Score: penalize if any one category > 50% or study+work > 70%
    let score = 85;
    const studyWork = (percentages.study || 0) + (percentages.work || 0);
    if (studyWork > 70) score -= (studyWork - 70);
    if ((percentages.rest || 0) < 10) score -= 10;
    if ((percentages.health || 0) < 5) score -= 8;
    if ((percentages.social || 0) < 5) score -= 5;
    score = Math.max(0, Math.min(100, score));

    return { score, hours, percentages };
}

export {
    CATEGORIES,
    DAYS,
    DAYS_FULL,
    ENERGY_LEVELS,
    BLOCK_TYPES,
    generateId,
    getDefaultData,
    loadData,
    saveData,
    getSampleBlocks,
    getSampleTasks,
    getSampleGoals,
    parseQuickAdd,
    calculateBalance,
};
