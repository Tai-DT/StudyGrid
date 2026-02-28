// ═══════════════════════════════════════════════════════
// StudyGrid — AI Integration
// Priority: OpenRouter → OpenAI → Gemini fallback
// ═══════════════════════════════════════════════════════

// API Keys from environment variables (.env file)
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';

// OpenAI config (fallback when OpenRouter runs out)
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini'; // Cheapest model with Vision: $0.15/1M input, $0.60/1M output

// Gemini direct fallback
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Build system prompt with user context
 */
function buildSystemPrompt(userContext) {
    const { user, blocks, tasks, goals, timetable, today } = userContext;

    const levelMap = {
        cap1: 'học sinh Tiểu học',
        cap2: 'học sinh THCS',
        cap3: 'học sinh THPT',
        university: 'sinh viên Đại học',
        working: 'người đi làm',
    };

    const levelStr = levelMap[user?.school_level] || 'người dùng';
    const gradeStr = user?.grade ? ` lớp ${user.grade}` : '';
    const vibeStr = user?.vibe === 'student' ? 'tập trung học'
        : user?.vibe === 'working' ? 'tập trung công việc'
            : 'vừa học vừa làm';

    const todayBlocks = blocks?.filter(b => b.day === today?.dayIdx) || [];
    const blocksSummary = todayBlocks.length > 0
        ? todayBlocks.map(b =>
            `- ${b.title} (${String(b.startHour).padStart(2, '0')}:${String(b.startMin || 0).padStart(2, '0')} → ${String(b.endHour).padStart(2, '0')}:${String(b.endMin || 0).padStart(2, '0')}, ${b.category})`
        ).join('\n')
        : 'Chưa có block nào hôm nay.';

    const pendingTasks = tasks?.filter(t => !t.completed) || [];
    const tasksSummary = pendingTasks.length > 0
        ? pendingTasks.slice(0, 10).map(t =>
            `- ${t.title}${t.deadline ? ` (deadline: ${t.deadline})` : ''}${t.estimatedHours ? ` [~${t.estimatedHours}h]` : ''}`
        ).join('\n')
        : 'Không có task pending.';

    const goalsSummary = goals?.length > 0
        ? goals.map(g => `- ${g.title}: ${g.progress || 0}%`).join('\n')
        : 'Chưa có mục tiêu.';

    // Timetable analysis
    let timetableSummary = 'Chưa nhập thời khoá biểu.';
    if (timetable?.length > 0) {
        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const subjectCount = {};
        timetable.forEach(e => {
            subjectCount[e.subject] = (subjectCount[e.subject] || 0) + 1;
        });
        const subjectList = Object.entries(subjectCount)
            .sort((a, b) => b[1] - a[1])
            .map(([s, c]) => `${s} (${c} tiết)`)
            .join(', ');

        // Today's classes
        const todayClasses = timetable.filter(e => e.day_of_week === today?.dayIdx);
        const todayClassInfo = todayClasses.length > 0
            ? todayClasses.map(e => `${e.subject} (${String(e.start_hour).padStart(2, '0')}:${String(e.start_min || 0).padStart(2, '0')})`).join(', ')
            : 'Không có tiết';

        timetableSummary = `${timetable.length} tiết/tuần: ${subjectList}\nHôm nay trên lớp: ${todayClassInfo}`;
    }

    return `Bạn là StudyBot, một AI trợ lý học tập thông minh tích hợp trong ứng dụng StudyGrid. Bạn giúp ${levelStr}${gradeStr} (phong cách: ${vibeStr}) lên kế hoạch học tập, cân bằng cuộc sống, và đạt mục tiêu.

THÔNG TIN NGƯỜI DÙNG:
- Tên: ${user?.name || 'bạn'}
- Cấp học: ${levelStr}${gradeStr}
- Phong cách: ${vibeStr}
- Giờ ngủ: ${user?.sleep_start || '22:30'} → ${user?.sleep_end || '06:00'}

THỜI KHOÁ BIỂU TRƯỜNG:
${timetableSummary}

LỊCH HÔM NAY (${today?.label || 'hôm nay'}):
${blocksSummary}

TASKS ĐANG CÓ:
${tasksSummary}

MỤC TIÊU:
${goalsSummary}

QUY TẮC TRẢ LỜI:
1. Trả lời bằng tiếng Việt, thân thiện, gần gũi, dùng emoji phù hợp.
2. Khi gợi ý thời khóa biểu, hãy dựa vào lịch hiện tại và THỜI KHOÁ BIỂU TRƯỜNG để tránh trùng block.
3. Khi nói về kỹ thuật học (pomodoro, active recall, spaced repetition...), hãy giải thích ngắn gọn.
4. Nếu được hỏi "gợi ý lịch tuần" hoặc "sắp xếp lại", đề xuất dạng time-block cụ thể DỰA TRÊN thời khoá biểu trường.
5. Giữ câu trả lời ngắn gọn (3-5 câu). Nếu cần chi tiết hơn, hỏi lại.
6. Bạn có thể dùng markdown đơn giản (bold, list, emoji) nhưng KHÔNG dùng heading lớn.
7. Nếu user hỏi ngoài phạm vi học tập/kế hoạch, nhẹ nhàng dẫn lại chủ đề.
8. Khi nói về balance, tránh "ép" quá cứng — hãy gợi ý mềm mại, tôn trọng lựa chọn.
9. Khi xếp lịch ôn tập: ôn TRƯỚC môn ngày mai, ôn SAU môn vừa học hôm nay.`;
}

/**
 * Try OpenRouter (OpenAI-compatible API, many free models)
 */
async function tryOpenRouter(message, conversationHistory, systemPrompt) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    const messages = [
        { role: 'system', content: systemPrompt },
    ];

    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text,
        });
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://studygrid.app',
            'X-Title': 'StudyGrid',
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenRouter error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('No response from OpenRouter');
    return text;
}

/**
 * Try OpenAI (gpt-4o-mini — cheapest with Vision support)
 * Used as fallback when OpenRouter runs out, and for timetable OCR
 */
async function tryOpenAI(message, conversationHistory, systemPrompt) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const messages = [
        { role: 'system', content: systemPrompt },
    ];

    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text),
        });
    }
    messages.push({ role: 'user', content: message });

    const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('No response from OpenAI');
    return text;
}

/**
 * Try OpenAI with Vision (for image analysis — timetable OCR)
 * Uses gpt-4o-mini which supports image inputs
 */
async function tryOpenAIVision(imageBase64, mimeType, prompt) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${imageBase64}`,
                                detail: 'high',
                            },
                        },
                    ],
                },
            ],
            max_tokens: 4096,
            temperature: 0.1,
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `OpenAI Vision error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('No response from OpenAI Vision');
    return text;
}

/**
 * Try Gemini direct
 */
async function tryGemini(message, conversationHistory, systemPrompt) {
    const contents = [];

    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        });
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 1024,
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ],
        }),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `Gemini error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response from Gemini');
    return text;
}

/**
 * Send message — tries OpenRouter → OpenAI → Gemini fallback
 */
export async function sendToGemini(message, conversationHistory, userContext) {
    const systemPrompt = buildSystemPrompt(userContext);

    const strategies = [
        { name: 'OpenRouter', fn: () => tryOpenRouter(message, conversationHistory, systemPrompt) },
        { name: 'OpenAI', fn: () => tryOpenAI(message, conversationHistory, systemPrompt) },
        { name: 'Gemini', fn: () => tryGemini(message, conversationHistory, systemPrompt) },
    ];

    let lastError = null;

    for (const strategy of strategies) {
        try {
            console.log(`🤖 Trying ${strategy.name}...`);
            const result = await strategy.fn();
            console.log(`✅ ${strategy.name} responded successfully`);
            return result;
        } catch (error) {
            console.warn(`⚠️ ${strategy.name} failed:`, error.message);
            lastError = error;
        }
    }

    throw lastError || new Error('Không thể kết nối AI. Thử lại sau nhé!');
}

/**
 * Parse timetable from text or image using AI
 * Priority for images: OpenAI Vision (gpt-4o-mini) → Gemini Vision
 * Returns structured timetable entries
 */
export async function parseTimetableWithAI(input, schoolLevel) {
    const levelMap = {
        cap1: 'Tiểu học (Cấp 1)',
        cap2: 'THCS (Cấp 2)',
        cap3: 'THPT (Cấp 3)',
        university: 'Đại học',
    };
    const levelStr = levelMap[schoolLevel] || 'THPT';

    const parsePrompt = `Bạn là AI chuyên phân tích thời khoá biểu trường học Việt Nam.
Cấp học: ${levelStr}

Hãy phân tích dữ liệu thời khoá biểu sau (text hoặc hình ảnh) và trích xuất ra danh sách các tiết học.

QUAN TRỌNG: Trả lời DUY NHẤT dạng JSON array, KHÔNG kèm giải thích, KHÔNG markdown.
Format:
[
  {
    "subject": "Tên môn học",
    "day_of_week": 0,
    "period": 1,
    "teacher": "",
    "room": ""
  }
]

day_of_week: 0=Thứ 2, 1=Thứ 3, 2=Thứ 4, 3=Thứ 5, 4=Thứ 6, 5=Thứ 7
period: số tiết (1, 2, 3, ...)

Lưu ý:
- Nếu không rõ teacher/room, để chuỗi rỗng ""
- Dùng tên viết tắt phổ biến: "Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hoá học", "Sinh học", "Lịch sử", "Địa lý", "GDCD", "Tin học", "Thể dục", "Công nghệ", "Mỹ thuật", "Âm nhạc"
- Phân tích cả buổi sáng lẫn chiều nếu có
- Nếu thấy bảng có các cột là THỨ (Thứ 2, Thứ 3...) và hàng là TIẾT, hãy đọc kỹ từng ô
- Nếu ảnh bị mờ hoặc khó đọc, hãy cố gắng đoán tên môn gần nhất`;

    // Check if input is an image (base64 data URL)
    const isImage = typeof input === 'string' && input.startsWith('data:image');

    if (isImage) {
        const base64Data = input.split(',')[1];
        const mimeType = input.match(/data:(.*?);/)?.[1] || 'image/jpeg';

        // Strategy 1: Try OpenAI Vision (gpt-4o-mini — very good at OCR, cheap)
        // Strategy 2: Try Gemini Vision as fallback
        const strategies = [
            {
                name: 'OpenAI Vision',
                fn: () => tryOpenAIVision(base64Data, mimeType, parsePrompt),
            },
            {
                name: 'Gemini Vision',
                fn: async () => {
                    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                role: 'user',
                                parts: [
                                    { text: parsePrompt },
                                    { inline_data: { mime_type: mimeType, data: base64Data } },
                                ],
                            }],
                            generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
                        }),
                    });

                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        throw new Error(err?.error?.message || `Gemini Vision error: ${response.status}`);
                    }

                    const data = await response.json();
                    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) throw new Error('Không nhận được phản hồi từ Gemini Vision');
                    return text;
                },
            },
        ];

        let lastError = null;
        for (const strategy of strategies) {
            try {
                console.log(`📷 Trying ${strategy.name} for timetable OCR...`);
                const text = await strategy.fn();
                console.log(`✅ ${strategy.name} analyzed timetable image successfully`);
                return parseJSONFromAIResponse(text);
            } catch (error) {
                console.warn(`⚠️ ${strategy.name} failed:`, error.message);
                lastError = error;
            }
        }

        throw lastError || new Error('Không thể phân tích ảnh thời khoá biểu. Thử chụp lại rõ hơn nhé!');
    } else {
        // Text input - use OpenRouter → OpenAI → Gemini
        const fullPrompt = `${parsePrompt}\n\nDữ liệu thời khoá biểu:\n${input}`;

        const strategies = [
            { name: 'OpenRouter', fn: () => tryOpenRouter(fullPrompt, [], parsePrompt) },
            { name: 'OpenAI', fn: () => tryOpenAI(fullPrompt, [], parsePrompt) },
            { name: 'Gemini', fn: () => tryGemini(fullPrompt, [], parsePrompt) },
        ];

        let lastError = null;
        for (const strategy of strategies) {
            try {
                const text = await strategy.fn();
                return parseJSONFromAIResponse(text);
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('Không thể phân tích thời khoá biểu');
    }
}

function parseJSONFromAIResponse(text) {
    // Try to extract JSON array from response
    let cleaned = text.trim();
    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    // Find array
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('AI không trả về dữ liệu hợp lệ');
    const jsonStr = cleaned.substring(start, end + 1);
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr)) throw new Error('Dữ liệu không đúng format');
    return arr;
}

/**
 * Get schedule suggestions
 */
export async function getScheduleSuggestions(userContext) {
    return sendToGemini('Dựa trên lịch hiện tại, gợi ý 3 cải thiện ngắn gọn để tối ưu thời gian hôm nay.', [], userContext);
}

/**
 * Get study tips
 */
export async function getStudyTips(userContext) {
    return sendToGemini('Cho tôi 3 tips học tập hiệu quả phù hợp với tôi.', [], userContext);
}

/**
 * AI Auto-Schedule: Generate time blocks from tasks/goals
 * Returns array of block objects that can be added to the grid
 */
export async function generateAISchedule(userContext, targetDay) {
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    const dayName = dayNames[targetDay] || 'hôm nay';

    const prompt = `Hãy tạo lịch học tập cho ${dayName}.

QUAN TRỌNG: Trả lời DUY NHẤT dạng JSON array, KHÔNG kèm giải thích, KHÔNG markdown code block.
Mỗi block có format:
[
  {
    "title": "Tên hoạt động",
    "category": "study|work|health|social|personal|rest",
    "startHour": 8,
    "startMin": 0,
    "endHour": 9,
    "endMin": 30,
    "type": "event|task|routine|goal",
    "energy": "low|medium|high",
    "note": "Ghi chú ngắn"
  }
]

Quy tắc:
- Tránh trùng với lịch hiện tại
- Xen kẽ học và nghỉ (Pomodoro style)
- Ưu tiên tasks có deadline gần
- Giữ trong khung giờ thức (${userContext?.user?.sleep_end || '06:00'} → ${userContext?.user?.sleep_start || '22:30'})
- Tạo 4-8 blocks hợp lý
- CHỈ TRẢ JSON, KHÔNG TEXT KHÁC`;

    const response = await sendToGemini(prompt, [], userContext);

    try {
        // Clean response - extract JSON array
        let jsonStr = response.trim();
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        // Find the JSON array
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
            const blocks = JSON.parse(match[0]);
            // Validate and normalize blocks
            return blocks.map(block => ({
                title: block.title || 'Block',
                category: ['study', 'work', 'health', 'social', 'personal', 'rest'].includes(block.category)
                    ? block.category : 'study',
                startHour: Math.max(0, Math.min(23, parseInt(block.startHour) || 8)),
                startMin: Math.max(0, Math.min(59, parseInt(block.startMin) || 0)),
                endHour: Math.max(0, Math.min(23, parseInt(block.endHour) || 9)),
                endMin: Math.max(0, Math.min(59, parseInt(block.endMin) || 0)),
                type: block.type || 'event',
                energy: block.energy || 'medium',
                note: block.note || '',
                day: targetDay,
                aiGenerated: true,
            }));
        }
        throw new Error('Invalid JSON response');
    } catch {
        // If parsing fails, return suggestion text
        throw new Error('AI_TEXT_RESPONSE:' + response);
    }
}

/**
 * AI Smart Reminders: Get context-aware reminders
 * Returns array of reminder objects
 */
export async function getAIReminders(userContext) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    const prompt = `Bây giờ là ${currentHour}:${String(currentMin).padStart(2, '0')}.

Dựa trên lịch và tasks của tôi, hãy cho tôi các nhắc nhở quan trọng.

Trả lời DUY NHẤT dạng JSON array, KHÔNG kèm giải thích:
[
  {
    "type": "deadline|study|break|goal|health",
    "title": "Tiêu đề nhắc nhở",
    "message": "Nội dung chi tiết",
    "priority": "high|medium|low",
    "icon": "emoji phù hợp"
  }
]

Quy tắc:
- Kiểm tra deadline sắp tới (task trong 1-3 ngày)
- Nhắc uống nước, nghỉ mắt nếu đã học lâu
- Gợi ý bắt đầu block tiếp theo nếu gần giờ
- Nhắc mục tiêu chưa đạt
- Tối đa 3-5 nhắc nhở
- CHỈ TRẢ JSON, KHÔNG TEXT KHÁC`;

    const response = await sendToGemini(prompt, [], userContext);

    try {
        let jsonStr = response.trim();
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
            const reminders = JSON.parse(match[0]);
            return reminders.map(r => ({
                type: r.type || 'study',
                title: r.title || 'Nhắc nhở',
                message: r.message || '',
                priority: r.priority || 'medium',
                icon: r.icon || '🔔',
                timestamp: now.toISOString(),
            }));
        }
        throw new Error('Invalid JSON');
    } catch {
        // Return a basic reminder if AI response isn't parseable
        return [{
            type: 'study',
            title: '📚 Nhắc nhở học tập',
            message: response.substring(0, 200),
            priority: 'medium',
            icon: '📚',
            timestamp: now.toISOString(),
        }];
    }
}

/**
 * AI Timetable Study Plan: Analyze school timetable and create optimized study schedule
 * Analyzes which subjects have more/less school hours, then schedules revision accordingly
 */
export async function generateTimetableStudyPlan(userContext, targetDay) {
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    const dayName = dayNames[targetDay] || 'hôm nay';

    const timetable = userContext?.timetable || [];

    if (!timetable.length) {
        throw new Error('AI_TEXT_RESPONSE:📋 Bạn chưa nhập thời khoá biểu trường. Vào **Thời khoá biểu** trong sidebar để thêm các môn học trước, sau đó mình sẽ phân tích và tạo lịch ôn tập cho bạn! 🎯');
    }

    // Analyze timetable: count hours per subject and per day
    const subjectHours = {};
    const subjectDays = {};
    const daySchedule = {};

    timetable.forEach(entry => {
        const subject = entry.subject;
        // Approximate hours per timetable entry
        const hours = ((entry.end_hour || 0) * 60 + (entry.end_min || 0) - (entry.start_hour || 0) * 60 - (entry.start_min || 0)) / 60;

        subjectHours[subject] = (subjectHours[subject] || 0) + hours;

        if (!subjectDays[subject]) subjectDays[subject] = [];
        subjectDays[subject].push(entry.day_of_week);

        if (!daySchedule[entry.day_of_week]) daySchedule[entry.day_of_week] = [];
        daySchedule[entry.day_of_week].push({
            subject: entry.subject,
            start: `${String(entry.start_hour).padStart(2, '0')}:${String(entry.start_min || 0).padStart(2, '0')}`,
            end: `${String(entry.end_hour).padStart(2, '0')}:${String(entry.end_min || 0).padStart(2, '0')}`,
        });
    });

    const timetableSummary = Object.entries(subjectHours)
        .sort((a, b) => b[1] - a[1])
        .map(([subject, hours]) => {
            const days = [...new Set(subjectDays[subject])].map(d => dayNames[d]).join(', ');
            return `- ${subject}: ${hours.toFixed(1)}h/tuần (${days})`;
        }).join('\n');

    const targetDaySchedule = daySchedule[targetDay];
    const targetDayInfo = targetDaySchedule?.length > 0
        ? targetDaySchedule.map(s => `- ${s.subject}: ${s.start} → ${s.end}`).join('\n')
        : 'Không có tiết học trên lớp';

    // Get adjacent days to suggest pre-study
    const nextDay = targetDay < 6 ? targetDay + 1 : 0;
    const nextDaySchedule = daySchedule[nextDay];
    const nextDayInfo = nextDaySchedule?.length > 0
        ? nextDaySchedule.map(s => `- ${s.subject}: ${s.start} → ${s.end}`).join('\n')
        : 'Không có tiết';

    const prompt = `Hãy phân tích THỜI KHOÁ BIỂU TRƯỜNG của tôi và tạo lịch ÔN TẬP/TỰ HỌC tối ưu cho ${dayName}.

THỜI KHOÁ BIỂU TUẦN (tổng giờ từng môn):
${timetableSummary}

LỊCH HỌC TRÊN LỚP ${dayName.toUpperCase()}:
${targetDayInfo}

LỊCH HỌC NGÀY KẾ TIẾP (${dayNames[nextDay]}):
${nextDayInfo}

NGUYÊN TẮC SẮP XẾP:
1. **Ôn TRƯỚC giờ học**: Nếu ngày mai có Toán, hôm nay nên ôn Toán trước
2. **Ôn SAU giờ học**: Nếu hôm nay vừa học Vật lý, nên ôn lại Vật lý ngay buổi tối
3. **Tránh trùng**: KHÔNG xếp vào giờ đang có tiết trên lớp
4. **Ưu tiên môn khó**: Toán, Lý, Hoá, Tiếng Anh cần nhiều giờ ôn hơn
5. **Xen kẽ nghỉ**: Mỗi 1.5h ôn → 15-30p nghỉ
6. **Balanced**: Không ôn 1 môn quá 2h liên tiếp
7. **Thực tế**: Giữ trong khung ${userContext?.user?.sleep_end || '06:00'} → ${userContext?.user?.sleep_start || '22:30'}

Trả lời DUY NHẤT dạng JSON array, KHÔNG kèm giải thích, KHÔNG markdown:
[
  {
    "title": "📚 Ôn Toán - Chương 5",
    "category": "study",
    "startHour": 18,
    "startMin": 0,
    "endHour": 19,
    "endMin": 30,
    "type": "event",
    "energy": "high",
    "note": "Ôn trước cho buổi học ngày mai"
  }
]

Tạo 4-8 blocks, bao gồm cả ôn tập VÀ giải lao. CHỈ TRẢ JSON.`;

    const response = await sendToGemini(prompt, [], userContext);

    try {
        let jsonStr = response.trim();
        jsonStr = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
        const match = jsonStr.match(/\[[\s\S]*\]/);
        if (match) {
            const blocks = JSON.parse(match[0]);
            return {
                blocks: blocks.map(block => ({
                    title: block.title || 'Study Block',
                    category: ['study', 'work', 'health', 'social', 'personal', 'rest'].includes(block.category)
                        ? block.category : 'study',
                    startHour: Math.max(0, Math.min(23, parseInt(block.startHour) || 8)),
                    startMin: Math.max(0, Math.min(59, parseInt(block.startMin) || 0)),
                    endHour: Math.max(0, Math.min(23, parseInt(block.endHour) || 9)),
                    endMin: Math.max(0, Math.min(59, parseInt(block.endMin) || 0)),
                    type: block.type || 'event',
                    energy: block.energy || 'medium',
                    note: block.note || '',
                    day: targetDay,
                    aiGenerated: true,
                })),
                analysis: {
                    totalSubjects: Object.keys(subjectHours).length,
                    subjectHours,
                    targetDayClasses: targetDaySchedule?.length || 0,
                    nextDayClasses: nextDaySchedule?.length || 0,
                },
            };
        }
        throw new Error('Invalid JSON');
    } catch (err) {
        if (err.message?.startsWith('AI_TEXT_RESPONSE:')) throw err;
        throw new Error('AI_TEXT_RESPONSE:' + response);
    }
}

/**
 * Format AI response for display
 */
export function formatAIResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br/>');
}
