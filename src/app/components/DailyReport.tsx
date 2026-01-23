"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Save, X } from "lucide-react"; // Assuming we can use lucide-react or similar icons, or I'll replace with SVG

// --- Types ---
export interface DailyRecord {
    date: string; // YYYY-MM-DD
    count: number;
    unitPrice?: number;
    note?: string;
}

interface DailyReportProps {
    records: Record<string, DailyRecord>;
    onUpdateRecord: (record: DailyRecord) => void;
    onDeleteRecord: (date: string) => void;
    defaultUnitPrice: number;
    year: number;
    month: number;
    onMonthChange: (year: number, month: number) => void;
}

// --- Helper Functions ---
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function DailyReport({ records, onUpdateRecord, onDeleteRecord, defaultUnitPrice, year, month, onMonthChange }: DailyReportProps) {
    // const [currentDate, setCurrentDate] = useState(new Date()); // Removed internal state
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Edit Form State
    const [editCount, setEditCount] = useState("");
    const [editUnitPrice, setEditUnitPrice] = useState("");
    const [editNote, setEditNote] = useState("");

    // const year = currentDate.getFullYear();
    // const month = currentDate.getMonth(); // 0-indexed

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Calculate monthly stats
    const monthlyStats = useMemo(() => {
        let totalCount = 0;
        let totalRevenue = 0;

        // Iterate over all days in the current month view
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = formatDate(year, month, d);
            const record = records[dateKey];
            if (record) {
                totalCount += record.count;
                const price = record.unitPrice ?? defaultUnitPrice;
                totalRevenue += record.count * price;
            }
        }
        return { totalCount, totalRevenue };
    }, [records, year, month, daysInMonth, defaultUnitPrice]);

    const handlePrevMonth = () => {
        // setCurrentDate(new Date(year, month - 1, 1));
        if (month === 0) onMonthChange(year - 1, 11);
        else onMonthChange(year, month - 1);
    };

    const handleNextMonth = () => {
        // setCurrentDate(new Date(year, month + 1, 1));
        if (month === 11) onMonthChange(year + 1, 0);
        else onMonthChange(year, month + 1);
    };

    const handleDateClick = (day: number) => {
        const dateKey = formatDate(year, month, day);
        setSelectedDate(dateKey);

        const record = records[dateKey];
        if (record) {
            setEditCount(String(record.count));
            setEditUnitPrice(record.unitPrice ? String(record.unitPrice) : "");
            setEditNote(record.note || "");
        } else {
            setEditCount("");
            setEditUnitPrice(""); // Default to empty (will use global default)
            setEditNote("");
        }
    };

    const handleSave = () => {
        if (!selectedDate) return;

        const count = parseInt(editCount, 10);
        if (isNaN(count)) return; // Validates at least count is needed? Or maybe 0 is fine.

        onUpdateRecord({
            date: selectedDate,
            count: count,
            unitPrice: editUnitPrice ? parseInt(editUnitPrice, 10) : undefined,
            note: editNote,
        });

        setSelectedDate(null);
    };

    const handleDelete = () => {
        if (!selectedDate) return;
        onDeleteRecord(selectedDate);
        setSelectedDate(null);
    };

    const closeForm = () => {
        setSelectedDate(null);
    };

    const fmt = (num: number) => `¥${num.toLocaleString()}`;

    // Generate calendar grid
    const gridCells = [];
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
        gridCells.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 border-b border-r border-slate-100"></div>);
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = formatDate(year, month, d);
        const record = records[dateKey];
        const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

        let revenue = 0;
        if (record) {
            revenue = record.count * (record.unitPrice ?? defaultUnitPrice);
        }

        gridCells.push(
            <div
                key={dateKey}
                onClick={() => handleDateClick(d)}
                className={`h-24 border-b border-r border-slate-100 p-1 relative hover:bg-indigo-50 transition-colors cursor-pointer group ${isToday ? "bg-amber-50" : "bg-white"}`}
            >
                <div className="flex justify-between items-start">
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-amber-400 text-white" : "text-slate-400 group-hover:text-indigo-600"}`}>
                        {d}
                    </span>
                    {record && (
                        <div className="text-[10px] font-bold text-slate-300">
                            {record.unitPrice ? "custom" : ""}
                        </div>
                    )}
                </div>

                {record ? (
                    <div className="mt-1 text-right">
                        <div className="text-lg font-bold text-indigo-600 leading-none">
                            {record.count}<span className="text-[10px] font-normal text-slate-400 ml-0.5">個</span>
                        </div>
                        <div className="text-xs font-medium text-emerald-600">
                            {fmt(revenue)}
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="text-slate-200 text-2xl font-light">+</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {year}年 {month + 1}月
                    </h2>
                    <div className="flex gap-1">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                            &lt;
                        </button>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                            &gt;
                        </button>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xs text-slate-500">当月合計</div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-indigo-600">{monthlyStats.totalCount}個</span>
                        <span className="text-lg font-bold text-emerald-600">{fmt(monthlyStats.totalRevenue)}</span>
                    </div>
                </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
                {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                    <div key={day} className={`py-2 text-center text-xs font-bold ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-500"}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 bg-slate-100 gap-px border-l border-t border-slate-200">
                {/* Using gap-px for borders if bg is slate-200, but here I used manual borders. Let's stick to manual borders in cells. */}
                {gridCells}
            </div>

            {/* Edit Modal (Simple overlay for now) */}
            {selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">
                                {selectedDate} の記録
                            </h3>
                            <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">配達個数</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={editCount}
                                        onChange={(e) => setEditCount(e.target.value)}
                                        className="w-full px-4 py-3 text-2xl font-bold font-mono text-center bg-indigo-50 border-2 border-indigo-100 rounded-lg focus:border-indigo-500 focus:outline-none text-indigo-900"
                                        placeholder="0"
                                        autoFocus
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-300">個</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">
                                    単価 (未入力は基本設定: {defaultUnitPrice}円)
                                </label>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={editUnitPrice}
                                    onChange={(e) => setEditUnitPrice(e.target.value)}
                                    className="w-full px-3 py-2 text-right font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder={String(defaultUnitPrice)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">メモ</label>
                                <textarea
                                    value={editNote}
                                    onChange={(e) => setEditNote(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    rows={2}
                                    placeholder="開始・終了時間など"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            {records[selectedDate] && (
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    削除
                                </button>
                            )}
                            <div className="flex-1"></div>
                            <button
                                onClick={closeForm}
                                className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-200 transition-all"
                            >
                                保存する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
