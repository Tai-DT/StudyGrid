# 📋 PROMPTS TỔNG HỢP — Xây Dựng StudyGrid

> File này tổng hợp tất cả các prompt đã sử dụng để tạo ra ứng dụng StudyGrid từ đầu đến cuối.
> Bạn có thể sử dụng lại các prompt này để tái tạo hoặc mở rộng dự án.

---

## 🏗️ PHASE 1: Khởi Tạo Dự Án

### Prompt 1.1 — Tạo dự án & thiết kế cơ bản

```
Tạo ứng dụng web StudyGrid — một time-blocking planner thông minh cho học sinh/sinh viên Việt Nam.

Yêu cầu:
- Sử dụng React + Vite (không dùng Next.js)
- Styling bằng Vanilla CSS (không dùng TailwindCSS)
- Thiết kế hiện đại, premium, có glassmorphism và micro-animations
- Giao diện tiếng Việt
- Font: Inter (Google Fonts)
- Color palette: accent #6C5CE7 (tím), success #34C759, danger #FF3B30

Cấu trúc trang:
1. Sidebar navigation (bên trái)
2. Main content (bên phải)
3. Các trang: Today, Week Grid, Tasks, Goals, Insights, Settings

Tạo file: index.html, src/main.jsx, src/App.jsx, src/index.css, src/store.js
```

### Prompt 1.2 — Data Store & Categories

```
Tạo file store.js với:
- 7 categories: Học tập (◆ #6C5CE7), Làm việc (◇ #007AFF), Sức khoẻ (● #34C759), Xã hội (◎ #FF6B35), Gia đình (⌂ #FF9F0A), Cá nhân (◈ #FF2D55), Nghỉ ngơi (○ #8E8E93)
- Block types: event, task, routine, goal
- Energy levels: low, medium, high
- Days: T2-CN (Thứ 2 đến Chủ nhật)
- Hàm: generateId (UUID), loadData, saveData (localStorage), parseQuickAdd, calculateBalance
- Sample blocks/tasks/goals cho demo
```

---

## 🔐 PHASE 2: Authentication & Database

### Prompt 2.1 — Supabase Auth

```
Tích hợp Supabase cho authentication:
- Tạo file supabase.js với createClient
- Hàm: signUp, signIn, signOut, getSession
- Trang AuthPage.jsx: form đăng nhập/đăng ký
  - Chuyển đổi giữa Login và Register
  - Hiện lỗi validation
  - Loading state
  - Redirect URL dùng window.location.origin (cho cả localhost và Vercel)
- Design: split layout, gradient background, glassmorphism card
```

### Prompt 2.2 — Database Schema & CRUD

```
Tạo các bảng Supabase với RLS:
- profiles (id, name, email, school_level, grade, vibe, sleep_start, sleep_end, onboarded)
- blocks (id, user_id, title, type, category, day_of_week, start_hour/min, end_hour/min, is_hard, energy, from_timetable)
- tasks (id, user_id, title, category, deadline, estimated_hours, completed, scheduled, repeat)
- goals (id, user_id, title, category, target_date, weekly_hours, progress, color)
- school_timetable (id, user_id, subject, day_of_week, period, start_hour/min, end_hour/min, room, teacher, is_active)
- checkins (id, user_id, date, mood, note)

RLS policies: Mỗi user chỉ xem/sửa/xoá data của mình.
Converter functions: dbBlockToLocal, localBlockToDb (snake_case ↔ camelCase)
```

---

## 🎯 PHASE 3: Onboarding Flow

### Prompt 3.1 — Onboarding Wizard

```
Tạo component Onboarding.jsx — wizard nhiều bước:

Bước 1 (Welcome): Chào mừng, nhập tên
Bước 2 (Level): Chọn cấp học — Cấp 1, Cấp 2, Cấp 3, Đại học, Đi làm
  - Nếu chọn Cấp 1/2/3 → hiện chọn lớp cụ thể
Bước 3 (Vibe): Phong cách — Chỉ đi học, Vừa học vừa làm, Chủ yếu đi làm
Bước 4 (Sleep): Thiết lập giờ ngủ (input time)
Bước 5 (Templates): Chọn hoạt động — Gym, Part-time, Học thêm, Tiếng Anh, Hobby, Gia đình
Bước 6 (Goals): Chọn mục tiêu — GPA, Sức khoẻ, Kiếm tiền, Balance, Kỹ năng, Xã hội
Bước 7 (Ready): Xác nhận & bắt đầu

Design: Split layout (left = gradient illustration, right = form)
Progress dots ở dưới, nút Tiếp/Quay lại
Validation: Mỗi bước phải chọn trước khi next
CSS class: .onboarding-option.active cho trạng thái đã chọn
```

---

## 📅 PHASE 4: Core Features

### Prompt 4.1 — Today View (Dashboard)

```
Tạo TodayView.jsx — trang chính hiện thị hôm nay:

1. Page header: icon Sun + "Hôm nay" + ngày tháng
2. Daily Check-in: Chọn mood (😴 😐 🙂 😊 🔥), hiện lại khi đã chọn + nút "Đổi lại"
3. Today's Timeline: Danh sách blocks hôm nay, sắp theo giờ
   - Current block: highlight xanh + badge "Đang diễn ra"
   - Past block: opacity thấp + badge "Đã xong"
   - Future block: badge "Sắp tới"
   - Nút "Start Focus" cho block hiện tại
4. Stats row: 4 stat cards (Tổng blocks, Hoàn thành, Focus giờ, Balance Score)
5. Top 3 Priorities: Tasks deadline gần nhất
6. Today sidebar: Goals progress + tuần qua overview
```

### Prompt 4.2 — Week Grid

```
Tạo WeekGrid.jsx — lưới 7 ngày × 24 giờ:

- Header: 7 cột (T2-CN), highlight ngày hôm nay
- Body: Mỗi row = 1 giờ (06:00 → 23:00), mỗi cell click để thêm block
- Blocks hiển thị dạng card trong cell tương ứng
  - Màu theo category
  - Hiện title + start-end time
  - Click để edit, nút xoá
- Filter bar: Lọc theo category
- Responsive: scroll ngang trên mobile
```

### Prompt 4.3 — Add/Edit Block Modal

```
Tạo AddBlockModal.jsx — modal thêm/sửa block:

Fields:
- Tiêu đề (text input)
- Loại block: Sự kiện, Bài tập, Thói quen, Mục tiêu
- Category: 7 danh mục (filter chips)
- Ngày: T2-CN (7 nút)
- Giờ bắt đầu / kết thúc (time inputs)
- Cố định / Linh hoạt (toggle)
- Mức năng lượng: Thấp / Trung bình / Cao

Pre-fill khi click cell trên grid (day + hour)
Edit mode: Fill data hiện tại
Design: Modal overlay, slide-in animation
```

### Prompt 4.4 — Tasks View

```
Tạo TasksView.jsx — quản lý tasks:

1. Stats: Tổng tasks, Đang chờ, Hoàn thành, Quá hạn
2. Filter bar: Tất cả, Đang chờ, Hoàn thành, Quá hạn
3. Add form: Tiêu đề, Deadline (date), Ước lượng giờ, Category, Lặp lại (none/daily/weekly/monthly)
4. Task list: Checkbox + title + category tag + deadline + repeat label + estimated hours
   - Nút "Schedule" (auto-add to grid)
   - Nút "Delete"
   - Strikethrough khi completed
5. Empty state: PartyPopper icon + "Không có task nào!"
6. getDaysUntil: "Hôm nay!", "Ngày mai", "Còn X ngày", "Quá hạn X ngày"
```

### Prompt 4.5 — Goals View

```
Tạo GoalsView.jsx — theo dõi mục tiêu:

1. Stats: Total goals, In progress, Completed, Average progress
2. Add form: Tiêu đề, Category, Target date, Weekly hours, Color picker
3. Goal cards: Color accent border, progress bar, category tag, target date
4. Update progress: Input range hoặc buttons +10%
5. Filter: Category-based
```

### Prompt 4.6 — Insights View

```
Tạo InsightsView.jsx — thống kê & phân tích:

1. Overview stats: Tổng giờ/tuần, giờ trung bình/ngày, block nhiều nhất, balance score
2. Balance Analysis: Biểu đồ bar ngang cho mỗi category (% thời gian)
3. Daily Distribution: Giờ/ngày cho T2-CN
4. Category Breakdown: Grid cards hiện giờ + block count + % cho mỗi category
5. AI Insights section: AI tips dựa trên dữ liệu (nếu mất cân bằng → gợi ý)
```

---

## 🤖 PHASE 5: AI Integration

### Prompt 5.1 — AI Chat (StudyBot)

```
Tạo AIChat.jsx — panel chat AI:

1. Multi-provider fallback: OpenRouter → OpenAI → Gemini
2. Chat interface: Slide-in panel từ bên phải
3. Messages: User (phải, tím) vs Bot (trái, xám)
4. Quick actions: 3 nút gợi ý (Gợi ý lịch, Tips học tập, Phân tích balance)
5. System prompt: Chứa context user (cấp học, lịch hôm nay, tasks, goals, timetable)
6. Typing indicator: 3 dot animation
7. FAB button: Bot icon, pulse animation, "NEW" badge
8. API key từ env vars: VITE_OPENROUTER_API_KEY, VITE_OPENAI_API_KEY, VITE_GEMINI_API_KEY
```

### Prompt 5.2 — AI Advanced Features

```
Thêm AI features nâng cao trong gemini.js:

1. generateAISchedule(context, targetDay): AI tạo lịch time-blocks tự động
   - Parse JSON từ AI response
   - Tránh trùng blocks hiện tại + giờ ngủ
   - Trả về array blocks sẵn sàng add

2. getAIReminders(context): AI tạo nhắc nhở thông minh
   - Deadline gần, ôn thi, sức khoẻ, nghỉ ngơi
   - Trả về array {type, title, desc, time, priority}

3. generateTimetableStudyPlan(context, targetDay): AI phân tích TKB trường → tạo lịch ôn
   - Môn nhiều tiết → ít ôn, môn ít tiết → ôn nhiều hơn
   - Ôn TRƯỚC môn ngày mai, ôn SAU môn vừa học hôm nay

4. parseTimetableWithAI(input, schoolLevel): OCR thời khoá biểu
   - Support text paste hoặc image upload
   - Dùng gpt-4o-mini Vision cho ảnh
   - Fallback: OpenAI Vision → Gemini Vision
```

---

## 📋 PHASE 6: School Timetable

### Prompt 6.1 — Timetable Manager

```
Tạo SchoolTimetable.jsx — quản lý thời khoá biểu trường:

1. Modal overlay lớn
2. Tabs: Xem TKB | Nhập thủ công | Nhập bằng AI
3. Tab "Xem TKB": Grid 6 ngày × N tiết, hiện môn + phòng + GV
4. Tab "Nhập thủ công": Form thêm từng tiết (Môn, Ngày, Tiết, Giờ BĐ/KT, Phòng, GV)
5. Tab "Nhập bằng AI":
   - Paste text hoặc upload ảnh TKB
   - Gọi parseTimetableWithAI → preview JSON → confirm import
6. Nút "Đồng bộ vào lịch": importTimetableAsBlocks → tạo blocks từ TKB
7. CRUD: Thêm, sửa, xoá từng tiết trong Supabase
```

---

## ⏱️ PHASE 7: Productivity Tools

### Prompt 7.1 — Focus Mode

```
Tạo FocusMode.jsx — chế độ tập trung toàn màn hình:

- Full-screen overlay, dark background
- Hiển thị: block title, category, countdown timer
- Progress ring (SVG circle)
- Nút: Pause/Resume, End Focus
- onComplete callback khi hết giờ
- Animation: scale-in khi mở
```

### Prompt 7.2 — Pomodoro Timer

```
Tạo PomodoroTimer.jsx — timer pomodoro:

- Modal với đồng hồ đếm ngược lớn
- Presets: 25/5, 50/10, Tuỳ chỉnh
- Hiển thị: Session count, thời gian focus tổng
- Controls: Start, Pause, Reset, Skip
- Auto switch: Focus → Break → Focus
- Visual: Circular progress ring
- Stats: Số session, tổng focus time
```

### Prompt 7.3 — Break Reminder

```
Tạo BreakReminder.jsx — nhắc nghỉ ngơi:

- Tự động nhắc sau mỗi 45 phút focus liên tục
- Status bar nhỏ ở dưới "⏸️ Nghỉ giải lao 5 phút"
- Toast notification: "Đã 45 phút rồi! Nghỉ tí đi 💆"
- Nút: Nghỉ ngay, Bỏ qua
- Break timer countdown
```

### Prompt 7.4 — Focus Music

```
Tạo FocusMusic.jsx — nhạc nền tập trung:

- FAB button nhỏ (Music icon)
- Expand panel: Grid nhạc theo category
- Categories: Lofi, Nature, Rain, White Noise, Jazz, Classical, Piano, Cafe
- Mỗi track: tên + visualizer animation khi playing
- Audio element: play/pause, loop
- Mini player: khi thu nhỏ hiện track name + controls
- Sử dụng free audio URLs (không cần API)
```

---

## ⚡ PHASE 8: Quick Add & Sidebar

### Prompt 8.1 — Quick Add

```
Tạo QuickAdd.jsx — thêm nhanh block:

- FAB button (+) góc dưới phải
- Modal nhỏ: Text input tự nhiên
- Parse: "Học Toán 8h-10h T3" → {title: "Học Toán", startHour: 8, endHour: 10, day: 1}
- Hỗ trợ: giờ, ngày, category tự động detect
- Preview trước khi save
```

### Prompt 8.2 — Sidebar Navigation

```
Tạo Sidebar.jsx — thanh điều hướng:

- Logo: CalendarDays icon + "StudyGrid" text
- User info: Tên + cấp học
- Nav items: Hôm nay, Tuần, Tasks (count badge), Mục tiêu, Insights, Settings
- Action buttons: TKB Trường, Pomodoro, StudyBot AI (NEW badge)
- Sign Out button
- Mobile: Hamburger menu, slide-in drawer, overlay backdrop
- Props: isOpen, onClose (cho mobile toggle)
- Tự đóng menu khi navigate (mobile)
```

---

## ⚙️ PHASE 9: Settings & Polish

### Prompt 9.1 — Settings View

```
Tạo SettingsView.jsx — trang cài đặt:

Sections:
1. Hồ sơ: Tên, Cấp học, Phong cách
2. Thời gian: Giờ ngủ
3. Thông báo: Toggle notifications, focus mode, balance alerts
4. Dữ liệu: Export JSON, Reset data (với confirm dialog)
5. Sign Out button
6. App info: Version, credits
```

### Prompt 9.2 — Responsive Mobile UI

```
Thêm responsive CSS cho tất cả components:

Mobile header:
- Ẩn trên desktop, hiện trên ≤768px
- Hamburger menu button + "StudyGrid" logo + spacer
- Sticky top, backdrop blur

Sidebar drawer:
- Fixed, slide từ trái (left: -280px → 0)
- Overlay backdrop rgba(0,0,0,0.4)
- Close button hiện trên mobile
- Tự đóng khi chọn nav item

Breakpoints:
- ≤1024px: Today layout 1 cột, stats 2 cột
- ≤768px: Full mobile — sidebar drawer, card padding 14px, modal 95vw, filter chip nhỏ hơn, onboarding stacked, timetable 1 cột, FAB nhỏ hơn
- ≤480px: Stats 1 cột, onboarding options 1 cột, extra compact
```

---

## 🔔 PHASE 10: Advanced Features

### Prompt 10.1 — Push Notifications

```
Thêm browser push notifications trong TodayView:

- Khi mount: Xin quyền Notification (nếu chưa có)
- useEffect: Check blocks mỗi 60 giây
- Nếu block bắt đầu trong 5 phút → gửi notification
  - Title: "📅 StudyGrid — Sắp đến giờ!"
  - Body: "{tên block} bắt đầu lúc HH:MM"
  - Icon: /studygrid-icon.svg
- Dùng Set (ref) để tránh gửi trùng
```

### Prompt 10.2 — Streak Tracking

```
Thêm streak tracking vào TodayView:

- Lưu localStorage key "studygrid_streak": { days: ["2026-01-01", ...], count: N }
- Mỗi lần vào Today → ghi ngày hôm nay
- Tính streak: đếm ngược từ hôm nay, mỗi ngày liên tiếp → +1
- Giữ tối đa 90 ngày gần nhất
- UI: Badge 🔥 + count + 7-dot mini calendar (tuần gần nhất)
- Dot active = ngày có mở app
- CSS: .streak-badge (gradient orange), .streak-dot.active (orange glow), fire animation
- Mobile: ẩn dots, chỉ giữ count
```

### Prompt 10.3 — Recurring Tasks

```
Thêm recurring tasks:

- Form thêm task: Thêm field "Lặp lại" (none/daily/weekly/monthly)
- Filter chips cho 4 option
- Task item: Hiện icon Repeat2 + label nếu repeat ≠ none
- Lưu vào Supabase: Thêm column `repeat text DEFAULT 'none'`
- Converter: Thêm repeat vào dbTaskToLocal và localTaskToDb
```

---

## 🗄️ PHASE 11: Database Optimization

### Prompt 11.1 — Supabase Security & Performance

```
Tối ưu Supabase database:

1. Fix function search_path:
   ALTER FUNCTION handle_new_user() SET search_path = public;
   ALTER FUNCTION update_updated_at() SET search_path = public;

2. Thêm indexes cho foreign keys:
   CREATE INDEX idx_blocks_user_id ON blocks(user_id);
   CREATE INDEX idx_blocks_timetable_id ON blocks(timetable_id);
   CREATE INDEX idx_tasks_user_id ON tasks(user_id);
   CREATE INDEX idx_goals_user_id ON goals(user_id);
   CREATE INDEX idx_school_timetable_user_id ON school_timetable(user_id);
   CREATE INDEX idx_checkins_user_id ON checkins(user_id);

3. Optimize RLS policies:
   Thay auth.uid() → (select auth.uid()) trong TẤT CẢ policies
   (profiles, blocks, tasks, goals, school_timetable, checkins)
```

---

## 🚀 PHASE 12: Deploy

### Prompt 12.1 — GitHub & Vercel

```
1. Push lên GitHub:
   git init
   git add -A
   git commit -m "Initial commit: StudyGrid time-blocking planner"
   git remote add origin https://github.com/Tai-DT/StudyGrid.git
   git push -u origin main

2. Deploy Vercel:
   - Framework: Vite
   - Build command: npm run build
   - Output: dist
   - Environment variables:
     VITE_OPENROUTER_API_KEY=...
     VITE_OPENAI_API_KEY=...
     VITE_GEMINI_API_KEY=...

3. Supabase settings:
   - Auth > URL Configuration > Site URL: https://your-app.vercel.app
   - Auth > URL Configuration > Redirect URLs: https://your-app.vercel.app
```

---

## 📁 Cấu Trúc File Cuối Cùng

```
StudyGrid/
├── index.html                    # Entry HTML + meta tags + PWA
├── package.json                  # Dependencies
├── vite.config.js                # Vite configuration
├── .env.example                  # API keys template
├── .env                          # API keys (gitignored)
├── README.md                     # Documentation
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── studygrid-icon.svg        # App icon
│   └── icon-512.png              # PWA icon
└── src/
    ├── main.jsx                  # React entry
    ├── App.jsx                   # Main app + routing + state
    ├── index.css                 # Full design system (4500+ lines)
    ├── store.js                  # Data utilities + localStorage
    ├── supabase.js               # Supabase client + CRUD + converters
    ├── gemini.js                 # AI multi-provider integration
    └── components/
        ├── AuthPage.jsx          # Login/Register
        ├── Onboarding.jsx        # Setup wizard (7 steps)
        ├── Sidebar.jsx           # Navigation + mobile menu
        ├── TodayView.jsx         # Dashboard + streak + notifications
        ├── WeekGrid.jsx          # 7×24 calendar grid
        ├── AddBlockModal.jsx     # Block create/edit
        ├── QuickAdd.jsx          # Quick add modal
        ├── TasksView.jsx         # Task management + recurring
        ├── GoalsView.jsx         # Goal tracking
        ├── InsightsView.jsx      # Analytics & charts
        ├── AIChat.jsx            # StudyBot AI panel
        ├── SchoolTimetable.jsx   # Timetable manager + OCR
        ├── FocusMode.jsx         # Full-screen focus
        ├── PomodoroTimer.jsx     # Pomodoro timer
        ├── FocusMusic.jsx        # Background music player
        ├── BreakReminder.jsx     # Break alerts
        └── SettingsView.jsx      # Settings page
```

---

## 🎨 Design System (CSS Variables)

```css
:root {
    --bg-primary: #fafbfc;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f2f3f5;
    --text-primary: #1a1a2e;
    --text-secondary: #5a5a7a;
    --text-muted: #8e8ea0;
    --accent: #6C5CE7;
    --accent-light: #a29bfe;
    --accent-glow: rgba(108, 92, 231, 0.1);
    --success: #34C759;
    --warning: #FF9F0A;
    --danger: #FF3B30;
    --border-subtle: rgba(0, 0, 0, 0.06);
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-full: 9999px;
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
}
```

---

## 💡 Tips Quan Trọng

1. **Luôn dùng `(select auth.uid())` trong RLS** — không dùng `auth.uid()` trực tiếp
2. **Supabase column dùng snake_case** — converter functions chuyển sang camelCase cho frontend
3. **AI fallback chain**: OpenRouter → OpenAI → Gemini (tránh mất service)
4. **localStorage cho local state**: mood, streak (không cần sync cloud)
5. **Supabase cho persistent data**: blocks, tasks, goals, profile, timetable
6. **CSS responsive**: Desktop-first, rollback tại 768px và 480px
7. **PWA ready**: manifest.json + apple-mobile-web-app meta tags
