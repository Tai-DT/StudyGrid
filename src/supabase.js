// ═══════════════════════════════════════════════════════
// StudyGrid — Supabase Client
// ═══════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qtchedxpetddyeffnzgw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0Y2hlZHhwZXRkZHllZmZuemd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjE2ODYsImV4cCI6MjA4Nzc5NzY4Nn0.N5vbwwk_UdLt7Q69z6iDvovHkGBaP9_aoS9VwE_cweA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Auth helpers ───────────────────────────────────────
const SITE_URL = window.location.origin; // Works for both localhost and Vercel

export async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name },
            emailRedirectTo: SITE_URL,
        },
    });
    return { data, error };
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// ─── Profile ────────────────────────────────────────────
export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

export async function updateProfile(userId, updates) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
    return { data, error };
}

// ─── Blocks ─────────────────────────────────────────────
export async function fetchBlocks(userId) {
    const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('user_id', userId)
        .order('day_of_week')
        .order('start_hour');
    return { data: data?.map(dbBlockToLocal) || [], error };
}

export async function upsertBlock(userId, block) {
    const dbBlock = localBlockToDb(block, userId);
    const { data, error } = await supabase
        .from('blocks')
        .upsert(dbBlock, { onConflict: 'id' })
        .select()
        .single();
    return { data: data ? dbBlockToLocal(data) : null, error };
}

export async function deleteBlockDb(blockId) {
    const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId);
    return { error };
}

// ─── Tasks ──────────────────────────────────────────────
export async function fetchTasks(userId) {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('deadline');
    return { data: data?.map(dbTaskToLocal) || [], error };
}

export async function upsertTask(userId, task) {
    const dbTask = localTaskToDb(task, userId);
    const { data, error } = await supabase
        .from('tasks')
        .upsert(dbTask, { onConflict: 'id' })
        .select()
        .single();
    return { data: data ? dbTaskToLocal(data) : null, error };
}

export async function deleteTaskDb(taskId) {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
    return { error };
}

// ─── Goals ──────────────────────────────────────────────
export async function fetchGoals(userId) {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);
    return { data: data?.map(dbGoalToLocal) || [], error };
}

export async function upsertGoal(userId, goal) {
    const dbGoal = localGoalToDb(goal, userId);
    const { data, error } = await supabase
        .from('goals')
        .upsert(dbGoal, { onConflict: 'id' })
        .select()
        .single();
    return { data: data ? dbGoalToLocal(data) : null, error };
}

// ─── School Timetable ───────────────────────────────────
export async function fetchTimetable(userId) {
    const { data, error } = await supabase
        .from('school_timetable')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('period');
    return { data: data || [], error };
}

export async function upsertTimetableEntry(userId, entry) {
    const { data, error } = await supabase
        .from('school_timetable')
        .upsert({
            ...entry,
            user_id: userId,
        }, { onConflict: 'id' })
        .select()
        .single();
    return { data, error };
}

export async function deleteTimetableEntry(entryId) {
    const { error } = await supabase
        .from('school_timetable')
        .delete()
        .eq('id', entryId);
    return { error };
}

export async function importTimetableAsBlocks(userId) {
    // Fetch timetable
    const { data: entries } = await fetchTimetable(userId);
    if (!entries?.length) return { count: 0 };

    // Delete existing timetable blocks
    await supabase
        .from('blocks')
        .delete()
        .eq('user_id', userId)
        .eq('from_timetable', true);

    // Create blocks from timetable
    const blocks = entries.map(entry => ({
        user_id: userId,
        title: entry.subject + (entry.room ? ` (${entry.room})` : ''),
        type: 'event',
        category: 'study',
        day_of_week: entry.day_of_week,
        start_hour: entry.start_hour,
        start_min: entry.start_min || 0,
        end_hour: entry.end_hour,
        end_min: entry.end_min || 0,
        is_hard: true,
        energy: 'high',
        from_timetable: true,
        timetable_id: entry.id,
    }));

    const { data, error } = await supabase
        .from('blocks')
        .insert(blocks)
        .select();

    return { count: data?.length || 0, error };
}

// ─── Converters (DB ↔ Local) ────────────────────────────
function dbBlockToLocal(db) {
    return {
        id: db.id,
        title: db.title,
        type: db.type,
        category: db.category,
        day: db.day_of_week,
        startHour: db.start_hour,
        startMin: db.start_min,
        endHour: db.end_hour,
        endMin: db.end_min,
        isHard: db.is_hard,
        energy: db.energy,
        fromTimetable: db.from_timetable,
        timetableId: db.timetable_id,
    };
}

function localBlockToDb(local, userId) {
    return {
        id: local.id,
        user_id: userId,
        title: local.title,
        type: local.type || 'event',
        category: local.category || 'study',
        day_of_week: local.day,
        start_hour: local.startHour,
        start_min: local.startMin || 0,
        end_hour: local.endHour,
        end_min: local.endMin || 0,
        is_hard: local.isHard || false,
        energy: local.energy || 'medium',
        from_timetable: local.fromTimetable || false,
        timetable_id: local.timetableId || null,
    };
}

function dbTaskToLocal(db) {
    return {
        id: db.id,
        title: db.title,
        category: db.category,
        deadline: db.deadline,
        estimatedHours: db.estimated_hours,
        completed: db.completed,
        scheduled: db.scheduled,
        repeat: db.repeat || 'none',
    };
}

function localTaskToDb(local, userId) {
    return {
        id: local.id,
        user_id: userId,
        title: local.title,
        category: local.category || 'study',
        deadline: local.deadline || null,
        estimated_hours: local.estimatedHours || 2,
        completed: local.completed || false,
        scheduled: local.scheduled || false,
        repeat: local.repeat || 'none',
    };
}

function dbGoalToLocal(db) {
    return {
        id: db.id,
        title: db.title,
        category: db.category,
        targetDate: db.target_date,
        weeklyHours: db.weekly_hours,
        progress: db.progress,
        color: db.color,
    };
}

function localGoalToDb(local, userId) {
    return {
        id: local.id,
        user_id: userId,
        title: local.title,
        category: local.category || 'study',
        target_date: local.targetDate || null,
        weekly_hours: local.weeklyHours || 10,
        progress: local.progress || 0,
        color: local.color || '#6C5CE7',
    };
}
