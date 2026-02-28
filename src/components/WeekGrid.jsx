import React, { useState, useMemo } from 'react';
import { LayoutGrid, ClipboardList, Zap, Plus } from 'lucide-react';
import { CATEGORIES, DAYS, DAYS_FULL, generateId } from '../store';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 - 23:00

export default function WeekGrid({ blocks, onAddBlock, onEditBlock, onDeleteBlock, onOpenQuickAdd, onOpenTimetable }) {
    const [dragOver, setDragOver] = useState(null);

    const today = new Date();
    const todayDayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;

    // Get current week dates
    const getWeekDates = () => {
        const d = new Date();
        const diff = d.getDay() === 0 ? -6 : 1 - d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() + diff);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            return date.getDate();
        });
    };

    const weekDates = getWeekDates();

    // Position blocks
    const getBlockStyle = (block) => {
        const startOffset = (block.startHour - 6) * 60 + block.startMin;
        const endOffset = (block.endHour - 6) * 60 + block.endMin;
        const duration = endOffset - startOffset;
        const top = (startOffset / 60) * 60;
        const height = Math.max((duration / 60) * 60, 20);

        return {
            top: `${top}px`,
            height: `${height}px`,
        };
    };

    const handleCellClick = (day, hour) => {
        onAddBlock({
            day,
            startHour: hour,
            startMin: 0,
            endHour: hour + 1,
            endMin: 0,
        });
    };

    const handleDragStart = (e, block) => {
        e.dataTransfer.setData('blockId', block.id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, day, hour) => {
        e.preventDefault();
        setDragOver(`${day}-${hour}`);
    };

    const handleDrop = (e, day, hour) => {
        e.preventDefault();
        const blockId = e.dataTransfer.getData('blockId');
        if (blockId) {
            const block = blocks.find(b => b.id === blockId);
            if (block) {
                const duration = (block.endHour * 60 + block.endMin) - (block.startHour * 60 + block.startMin);
                const newEnd = hour * 60 + duration;
                onEditBlock(blockId, {
                    day,
                    startHour: hour,
                    startMin: 0,
                    endHour: Math.floor(newEnd / 60),
                    endMin: newEnd % 60,
                });
            }
        }
        setDragOver(null);
    };

    const handleDragLeave = () => setDragOver(null);

    const currentHour = today.getHours();

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div className="page-header-left">
                    <h2><LayoutGrid size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Week Grid</h2>
                    <p>Tuần {getWeekNumber(today)} — Kéo thả để sắp xếp lịch</p>
                </div>
                <div className="page-header-right">
                    {onOpenTimetable && (
                        <button className="btn btn-secondary btn-sm" onClick={onOpenTimetable}>
                            <ClipboardList size={14} /> Thời khoá biểu trường
                        </button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => onOpenQuickAdd()}>
                        <Zap size={14} /> Quick Add
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => onAddBlock({})}>
                        <Plus size={14} /> Thêm Block
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="filter-bar">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <span key={key} className={`tag tag-${key}`}>
                        {cat.icon} {cat.label}
                    </span>
                ))}
            </div>

            {/* Grid */}
            <div className="week-grid-container">
                {/* Day headers */}
                <div className="week-grid-header">
                    <div className="week-grid-header-cell" style={{ borderRight: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '0.65rem' }}>GMT+7</span>
                    </div>
                    {DAYS.map((day, i) => (
                        <div
                            key={day}
                            className={`week-grid-header-cell ${i === todayDayIdx ? 'today' : ''}`}
                        >
                            {day}
                            <span className="week-grid-header-date">{weekDates[i]}</span>
                        </div>
                    ))}
                </div>

                {/* Time + cells */}
                <div className="week-grid-body">
                    {HOURS.map(hour => (
                        <React.Fragment key={hour}>
                            {/* Time label */}
                            <div className="week-grid-time">
                                {String(hour).padStart(2, '0')}:00
                            </div>

                            {/* Day cells for this hour */}
                            {DAYS.map((day, dayIdx) => (
                                <div
                                    key={`${dayIdx}-${hour}`}
                                    className={`week-grid-cell ${dragOver === `${dayIdx}-${hour}` ? 'drag-over' : ''}`}
                                    onClick={() => handleCellClick(dayIdx, hour)}
                                    onDragOver={(e) => handleDragOver(e, dayIdx, hour)}
                                    onDrop={(e) => handleDrop(e, dayIdx, hour)}
                                    onDragLeave={handleDragLeave}
                                    style={{ position: 'relative' }}
                                >
                                    {/* Now indicator */}
                                    {dayIdx === todayDayIdx && hour === currentHour && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            right: 0,
                                            top: `${(today.getMinutes() / 60) * 60}px`,
                                            height: '2px',
                                            background: 'var(--danger)',
                                            zIndex: 50,
                                        }}>
                                            <div style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: 'var(--danger)',
                                                position: 'absolute',
                                                left: -4,
                                                top: -3,
                                            }} />
                                        </div>
                                    )}

                                    {/* Blocks for this cell */}
                                    {blocks
                                        .filter(b => b.day === dayIdx && b.startHour === hour)
                                        .map(block => {
                                            const style = getBlockStyle(block);
                                            return (
                                                <div
                                                    key={block.id}
                                                    className={`block block-${block.category} ${block.isHard ? 'hard' : ''}`}
                                                    style={style}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, block)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditBlock(block.id);
                                                    }}
                                                    title={`${block.title}\n${String(block.startHour).padStart(2, '0')}:${String(block.startMin).padStart(2, '0')} - ${String(block.endHour).padStart(2, '0')}:${String(block.endMin).padStart(2, '0')}`}
                                                >
                                                    <span className="block-icon">
                                                        {CATEGORIES[block.category]?.icon}
                                                    </span>
                                                    <span className="block-title">{block.title}</span>
                                                    <span className="block-time">
                                                        {String(block.startHour).padStart(2, '0')}:{String(block.startMin).padStart(2, '0')} - {String(block.endHour).padStart(2, '0')}:{String(block.endMin).padStart(2, '0')}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
