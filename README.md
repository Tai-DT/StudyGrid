# 📅 StudyGrid — Time-Block Planner

> Ứng dụng lên lịch học tập thông minh kết hợp AI, giúp học sinh/sinh viên/người đi làm quản lý thời gian hiệu quả.

## ✨ Tính Năng

- 🔐 **Đăng nhập/Đăng ký** — Supabase Auth
- 🎯 **Onboarding** — Thiết lập cấp học, phong cách, mục tiêu
- 📅 **Hôm Nay** — Timeline, daily check-in, streak tracking 🔥
- 📊 **Week Grid** — Grid 7 ngày × 24 giờ, thêm/sửa/xoá blocks
- ✅ **Tasks** — CRUD, deadline, auto-schedule, recurring tasks 🔁
- 🎯 **Mục Tiêu** — Theo dõi tiến độ + progress bar
- 📈 **Insights** — Thống kê giờ, balance score, gợi ý AI
- 🤖 **StudyBot AI** — Chat, tạo lịch tự động, nhắc nhở thông minh
- 📋 **Thời Khoá Biểu** — Nhập tay hoặc upload ảnh → AI đọc
- ⏱️ **Pomodoro Timer** — 25/5, tuỳ chỉnh, hiệu ứng visual
- 🎵 **Focus Music** — Lofi, Nature, White noise
- ⏸️ **Break Reminder** — Nhắc nghỉ tự động
- 🎯 **Focus Mode** — Full-screen countdown
- ⚙️ **Settings** — Profile, thông báo, export dữ liệu
- 📱 **Responsive** — Tối ưu cho mobile + tablet
- 🔔 **Push Notifications** — Nhắc trước 5 phút

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite 6
- **Styling:** Vanilla CSS (custom design system)
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenRouter / OpenAI / Gemini (multi-fallback)
- **Deploy:** Vercel

## 🚀 Cài Đặt

```bash
# Clone
git clone https://github.com/Tai-DT/StudyGrid.git
cd StudyGrid

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# Fill in your API keys in .env

# Run dev server
npm run dev
```

## 🔑 API Keys

Tạo file `.env` từ `.env.example` và điền:

| Key | Source | Mục đích |
|-----|--------|----------|
| `VITE_OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai) | AI Chat (chính) |
| `VITE_OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) | AI fallback |
| `VITE_GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | AI fallback #2 |

## 📁 Cấu Trúc Dự Án

```
src/
├── App.jsx              # Main app + routing
├── main.jsx             # Entry point
├── index.css            # Design system + all styles
├── store.js             # Data utilities + categories
├── supabase.js          # Supabase client + CRUD
├── gemini.js            # AI integration (multi-provider)
└── components/
    ├── AuthPage.jsx     # Login/Register
    ├── Onboarding.jsx   # Setup wizard
    ├── Sidebar.jsx      # Navigation + mobile menu
    ├── TodayView.jsx    # Today dashboard
    ├── WeekGrid.jsx     # Weekly calendar grid
    ├── TasksView.jsx    # Task management
    ├── GoalsView.jsx    # Goal tracking
    ├── InsightsView.jsx # Analytics
    ├── AIChat.jsx       # StudyBot AI panel
    ├── SchoolTimetable.jsx # Timetable manager
    ├── PomodoroTimer.jsx   # Pomodoro
    ├── FocusMode.jsx    # Focus mode overlay
    ├── FocusMusic.jsx   # Background music
    ├── BreakReminder.jsx # Break alerts
    ├── QuickAdd.jsx     # Quick add modal
    ├── AddBlockModal.jsx # Block editor
    └── SettingsView.jsx  # Settings page
```

## 📄 License

MIT
