import React, { useState, useEffect, useCallback } from 'react';
import { CalendarDays, Bot, Plus, Menu } from 'lucide-react';
import './index.css';
import {
    loadData, saveData, getDefaultData,
    getSampleBlocks, getSampleTasks, getSampleGoals,
    generateId, CATEGORIES,
} from './store';
import {
    supabase, getSession, signOut,
    getProfile, updateProfile,
    fetchBlocks, upsertBlock, deleteBlockDb,
    fetchTasks, upsertTask, deleteTaskDb,
    fetchGoals, upsertGoal,
    fetchTimetable,
    importTimetableAsBlocks,
} from './supabase';

import AuthPage from './components/AuthPage';
import Onboarding from './components/Onboarding';
import Sidebar from './components/Sidebar';
import TodayView from './components/TodayView';
import WeekGrid from './components/WeekGrid';
import TasksView from './components/TasksView';
import GoalsView from './components/GoalsView';
import InsightsView from './components/InsightsView';
import SettingsView from './components/SettingsView';
import FocusMode from './components/FocusMode';
import QuickAdd from './components/QuickAdd';
import AddBlockModal from './components/AddBlockModal';
import SchoolTimetable from './components/SchoolTimetable';
import AIChat from './components/AIChat';
import BreakReminder from './components/BreakReminder';
import FocusMusic from './components/FocusMusic';
import PomodoroTimer from './components/PomodoroTimer';

export default function App() {
    // Auth state
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // App state
    const [profile, setProfile] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [goals, setGoals] = useState([]);
    const [timetable, setTimetable] = useState([]);
    const [settings, setSettings] = useState({ notifications: true, focusMode: true, balanceAlerts: true });

    const [activePage, setActivePage] = useState('today');
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [focusBlock, setFocusBlock] = useState(null);
    const [addBlockInitial, setAddBlockInitial] = useState({});
    const [showTimetable, setShowTimetable] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [showPomodoro, setShowPomodoro] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ─── Auth listener ────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            const sess = await getSession();
            setSession(sess);
            setAuthLoading(false);
        };
        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
            setSession(sess);
            if (!sess) {
                // Logged out
                setProfile(null);
                setBlocks([]);
                setTasks([]);
                setGoals([]);
                setDataLoaded(false);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    // ─── Load data when session changes ───────────────────
    useEffect(() => {
        if (session?.user) {
            loadUserData(session.user.id);
        }
    }, [session?.user?.id]);

    const loadUserData = async (userId) => {
        setDataLoaded(false);
        try {
            const [profileRes, blocksRes, tasksRes, goalsRes, timetableRes] = await Promise.all([
                getProfile(userId),
                fetchBlocks(userId),
                fetchTasks(userId),
                fetchGoals(userId),
                fetchTimetable(userId),
            ]);

            if (profileRes.data) {
                setProfile(profileRes.data);
                if (profileRes.data.settings) {
                    setSettings(profileRes.data.settings);
                }
            }
            setBlocks(blocksRes.data || []);
            setTasks(tasksRes.data || []);
            setGoals(goalsRes.data || []);
            setTimetable(timetableRes.data || []);
        } catch (err) {
            console.error('Load data error:', err);
        }
        setDataLoaded(true);
    };

    // ─── Keyboard shortcuts ───────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'q' || e.key === 'Q') { e.preventDefault(); setShowQuickAdd(true); }
            if (e.key === 't' || e.key === 'T') { e.preventDefault(); setActivePage('today'); }
            if (e.key === 'w' || e.key === 'W') { e.preventDefault(); setActivePage('week'); }
            if (e.key === 'a' || e.key === 'A') { e.preventDefault(); setShowAIChat(prev => !prev); }
            if (e.key === 'Escape') {
                setShowQuickAdd(false);
                setShowAddBlock(false);
                setEditingBlock(null);
                setShowTimetable(false);
                setShowAIChat(false);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // ─── Auth handler ─────────────────────────────────────
    const handleAuth = (sess) => {
        setSession(sess);
    };

    const handleSignOut = async () => {
        await signOut();
        setSession(null);
        setProfile(null);
        setActivePage('today');
    };

    // ─── Onboarding complete ──────────────────────────────
    const handleOnboardingComplete = async (config) => {
        const userId = session.user.id;

        await updateProfile(userId, {
            name: config.name,
            school_level: config.schoolLevel,
            grade: config.grade,
            vibe: config.vibe,
            sleep_start: config.sleepStart,
            sleep_end: config.sleepEnd,
            weekly_goals: config.goals,
            onboarded: true,
        });

        // Create sample blocks only if school level is university or working
        if (config.schoolLevel === 'university' || config.schoolLevel === 'working') {
            const sampleBlocks = getSampleBlocks();
            for (const block of sampleBlocks) {
                await upsertBlock(userId, block);
            }
        }

        // Create sample tasks
        const sampleTasks = getSampleTasks();
        for (const task of sampleTasks) {
            await upsertTask(userId, task);
        }

        // Create sample goals
        const sampleGoals = getSampleGoals();
        for (const goal of sampleGoals) {
            await upsertGoal(userId, goal);
        }

        await loadUserData(userId);
        setActivePage('today');
    };

    // ─── Block CRUD ───────────────────────────────────────
    const addBlock = async (block) => {
        const userId = session.user.id;
        const { data } = await upsertBlock(userId, { ...block, id: block.id || undefined });
        if (data) setBlocks(prev => [...prev, data]);
    };

    const editBlock = async (id, updates) => {
        if (typeof updates === 'object' && updates !== null) {
            const userId = session.user.id;
            const existing = blocks.find(b => b.id === id);
            if (!existing) return;
            const updated = { ...existing, ...updates };
            const { data } = await upsertBlock(userId, updated);
            if (data) setBlocks(prev => prev.map(b => b.id === id ? data : b));
        } else {
            const block = blocks.find(b => b.id === id);
            if (block) {
                setEditingBlock(block);
                setAddBlockInitial(block);
                setShowAddBlock(true);
            }
        }
    };

    const deleteBlock = async (id) => {
        await deleteBlockDb(id);
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    const handleAddBlockFromGrid = (initial) => {
        setAddBlockInitial(initial);
        setEditingBlock(null);
        setShowAddBlock(true);
    };

    const handleSaveBlock = async (block) => {
        const userId = session.user.id;
        if (editingBlock) {
            const { data } = await upsertBlock(userId, block);
            if (data) setBlocks(prev => prev.map(b => b.id === block.id ? data : b));
        } else {
            await addBlock(block);
        }
        setShowAddBlock(false);
        setEditingBlock(null);
    };

    // ─── Task CRUD ────────────────────────────────────────
    const addTask = async (task) => {
        const userId = session.user.id;
        const { data } = await upsertTask(userId, { ...task, id: task.id || undefined });
        if (data) setTasks(prev => [...prev, data]);
    };

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const userId = session.user.id;
        const updated = { ...task, completed: !task.completed };
        const { data } = await upsertTask(userId, updated);
        if (data) setTasks(prev => prev.map(t => t.id === id ? data : t));
    };

    const deleteTask = async (id) => {
        await deleteTaskDb(id);
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const scheduleTask = async (task) => {
        const userId = session.user.id;
        const occupiedSlots = {};
        blocks.forEach(b => {
            for (let h = b.startHour; h < b.endHour; h++) {
                occupiedSlots[`${b.day}-${h}`] = true;
            }
        });

        const sessions = Math.ceil(task.estimatedHours / 2);
        let scheduled = 0;

        for (let day = 0; day < 7 && scheduled < sessions; day++) {
            for (let hour = 8; hour <= 20 && scheduled < sessions; hour++) {
                if (!occupiedSlots[`${day}-${hour}`] && !occupiedSlots[`${day}-${hour + 1}`]) {
                    await addBlock({
                        title: `📝 ${task.title}`,
                        type: 'task',
                        category: task.category || 'study',
                        day,
                        startHour: hour,
                        startMin: 0,
                        endHour: hour + 2,
                        endMin: 0,
                        isHard: false,
                        energy: 'high',
                    });
                    occupiedSlots[`${day}-${hour}`] = true;
                    occupiedSlots[`${day}-${hour + 1}`] = true;
                    scheduled++;
                }
            }
        }

        const updatedTask = { ...task, scheduled: true };
        const { data } = await upsertTask(userId, updatedTask);
        if (data) setTasks(prev => prev.map(t => t.id === task.id ? data : t));
    };

    // ─── Goal CRUD ────────────────────────────────────────
    const addGoal = async (goal) => {
        const userId = session.user.id;
        const { data } = await upsertGoal(userId, { ...goal, id: goal.id || undefined });
        if (data) setGoals(prev => [...prev, data]);
    };

    const updateGoalProgress = async (id, updates) => {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        const userId = session.user.id;
        const updated = { ...goal, ...updates };
        const { data } = await upsertGoal(userId, updated);
        if (data) setGoals(prev => prev.map(g => g.id === id ? data : g));
    };

    // ─── Settings ─────────────────────────────────────────
    const updateSettings = async (updates) => {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);
        if (session?.user) {
            await updateProfile(session.user.id, { settings: newSettings });
        }
    };

    // ─── Reset ────────────────────────────────────────────
    const handleReset = async () => {
        if (session?.user) {
            await updateProfile(session.user.id, { onboarded: false });
            await loadUserData(session.user.id);
        }
    };

    // ─── Focus ────────────────────────────────────────────
    const handleStartFocus = (block) => setFocusBlock(block);
    const handleFocusComplete = () => setFocusBlock(null);

    // ─── Quick Add ────────────────────────────────────────
    const handleQuickAddSave = (block) => addBlock(block);

    // ─── Timetable import ─────────────────────────────────
    const handleTimetableImported = async (count) => {
        if (session?.user) {
            await loadUserData(session.user.id);
        }
        setShowTimetable(false);
    };

    // ═══ RENDER ═══════════════════════════════════════════

    // Loading auth
    if (authLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-brand">
                    <div className="loading-icon"><CalendarDays size={48} strokeWidth={1.5} /></div>
                    <h1>StudyGrid</h1>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    // Not logged in
    if (!session) {
        return <AuthPage onAuth={handleAuth} />;
    }

    // Loading data
    if (!dataLoaded) {
        return (
            <div className="loading-screen">
                <div className="loading-brand">
                    <div className="loading-icon"><CalendarDays size={48} strokeWidth={1.5} /></div>
                    <h1>StudyGrid</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Đang tải dữ liệu...</p>
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    // Not onboarded
    if (!profile?.onboarded) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    // Focus mode
    if (focusBlock) {
        return (
            <FocusMode
                block={focusBlock}
                onClose={() => setFocusBlock(null)}
                onComplete={handleFocusComplete}
            />
        );
    }

    const pendingTasks = tasks.filter(t => !t.completed).length;

    return (
        <div className="app-layout">
            <Sidebar
                activePage={activePage}
                onNavigate={setActivePage}
                userName={profile?.name}
                taskCount={pendingTasks}
                schoolLevel={profile?.school_level}
                onOpenTimetable={() => setShowTimetable(true)}
                onOpenPomodoro={() => setShowPomodoro(true)}
                onSignOut={handleSignOut}
                onOpenAI={() => setShowAIChat(true)}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                    <Menu size={22} />
                </button>
                <div className="mobile-header-title">
                    <CalendarDays size={20} strokeWidth={1.8} />
                    <span>StudyGrid</span>
                </div>
                <div style={{ width: 40 }} />
            </header>

            <main className="main-content">
                <div className="page-content">
                    {activePage === 'today' && (
                        <TodayView
                            blocks={blocks}
                            tasks={tasks}
                            goals={goals}
                            onStartFocus={handleStartFocus}
                            onToggleTask={toggleTask}
                        />
                    )}

                    {activePage === 'week' && (
                        <WeekGrid
                            blocks={blocks}
                            onAddBlock={handleAddBlockFromGrid}
                            onEditBlock={editBlock}
                            onDeleteBlock={deleteBlock}
                            onOpenQuickAdd={() => setShowQuickAdd(true)}
                            onOpenTimetable={() => setShowTimetable(true)}
                        />
                    )}

                    {activePage === 'tasks' && (
                        <TasksView
                            tasks={tasks}
                            onAddTask={addTask}
                            onToggleTask={toggleTask}
                            onScheduleTask={scheduleTask}
                            onDeleteTask={deleteTask}
                        />
                    )}

                    {activePage === 'goals' && (
                        <GoalsView
                            goals={goals}
                            onAddGoal={addGoal}
                            onUpdateGoal={updateGoalProgress}
                        />
                    )}

                    {activePage === 'insights' && (
                        <InsightsView
                            blocks={blocks}
                            tasks={tasks}
                            goals={goals}
                        />
                    )}

                    {activePage === 'settings' && (
                        <SettingsView
                            settings={settings}
                            user={profile}
                            onUpdateSettings={updateSettings}
                            onResetData={handleReset}
                            onSignOut={handleSignOut}
                        />
                    )}
                </div>
            </main>

            {/* Quick Add Modal */}
            {showQuickAdd && (
                <QuickAdd
                    onSave={handleQuickAddSave}
                    onClose={() => setShowQuickAdd(false)}
                />
            )}

            {/* Add/Edit Block Modal */}
            {showAddBlock && (
                <AddBlockModal
                    initial={addBlockInitial}
                    onSave={handleSaveBlock}
                    onClose={() => { setShowAddBlock(false); setEditingBlock(null); }}
                />
            )}

            {/* Timetable Modal */}
            {showTimetable && (
                <SchoolTimetable
                    userId={session.user.id}
                    schoolLevel={profile?.school_level}
                    onClose={() => setShowTimetable(false)}
                    onImported={handleTimetableImported}
                />
            )}

            {/* AI Chat */}
            {showAIChat && (
                <AIChat
                    isOpen={showAIChat}
                    onClose={() => setShowAIChat(false)}
                    userContext={{
                        user: profile,
                        blocks,
                        tasks,
                        goals,
                        timetable,
                        today: {
                            dayIdx: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
                            label: new Date().toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
                        }
                    }}
                    onAddBlocks={(aiBlocks) => {
                        const newBlocks = aiBlocks.map(b => ({
                            ...b,
                            id: generateId(),
                        }));
                        setBlocks(prev => [...prev, ...newBlocks]);
                    }}
                />
            )}


            {/* AI chat accessible via sidebar 'StudyBot AI' — no duplicate FAB needed */}

            {/* Break Reminder - auto every 25min */}
            <BreakReminder
                enabled={settings?.notifications !== false}
                intervalMinutes={25}
            />

            {/* Focus Music Player */}
            <FocusMusic />

            {/* Pomodoro Timer */}
            {showPomodoro && (
                <PomodoroTimer onClose={() => setShowPomodoro(false)} />
            )}

            {/* Floating Quick Add button */}
            <button
                className="btn btn-primary fab-btn"
                onClick={() => setShowQuickAdd(true)}
                title="Quick Add (Q)"
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
}
