'use client';

import React, { useMemo } from 'react';

interface MoodLog {
    id: string;
    created_at: string;
    rating: number; // 1-5
    note?: string;
    summary?: string;
}

interface MoodStatsProps {
    logs: MoodLog[];
}

export default function MoodStats({ logs }: MoodStatsProps) {

    // Calculates stats efficiently
    const stats = useMemo(() => {
        if (!logs.length) return { streak: 0, totalEntries: 0, dominantMood: null, recentMoods: [] };

        // 1. Total Entries
        const totalEntries = logs.length;

        // 2. Current Streak
        // Sort logs by date descending (latest first)
        // We need to normalize to dates (ignoring time)
        const sortedDates = [...new Set(logs.map(l => new Date(l.created_at).toDateString()))]
            .map(d => new Date(d))
            .sort((a, b) => b.getTime() - a.getTime());

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if the most recent entry is today or yesterday to start the streak
        if (sortedDates.length > 0) {
            const lastEntryDate = sortedDates[0];
            if (lastEntryDate.getTime() === today.getTime() || lastEntryDate.getTime() === yesterday.getTime()) {
                streak = 1;
                let currentDate = lastEntryDate;

                // Compare backwards
                for (let i = 1; i < sortedDates.length; i++) {
                    const prevDate = sortedDates[i];
                    const expectedPrev = new Date(currentDate);
                    expectedPrev.setDate(expectedPrev.getDate() - 1);

                    if (prevDate.getTime() === expectedPrev.getTime()) {
                        streak++;
                        currentDate = prevDate;
                    } else {
                        break;
                    }
                }
            }
        }

        // 3. Dominant Mood (Last 7 Days)
        const last7Days = new Date();
        last7Days.setDate(today.getDate() - 7);

        const recentLogs = logs.filter(l => new Date(l.created_at) >= last7Days);
        const moodCounts: Record<number, number> = {};

        recentLogs.forEach(l => {
            moodCounts[l.rating] = (moodCounts[l.rating] || 0) + 1;
        });

        let dominantMood = null;
        let maxCount = 0;

        for (const [rating, count] of Object.entries(moodCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantMood = parseInt(rating);
            }
        }

        return { streak, totalEntries, dominantMood, recentLogsCount: recentLogs.length };
    }, [logs]);

    const getMoodLabel = (rating: number | null) => {
        switch (rating) {
            case 1: return { label: 'Awful', icon: '😫', color: 'text-red-500' };
            case 2: return { label: 'Bad', icon: '☹️', color: 'text-orange-500' };
            case 3: return { label: 'Okay', icon: '😐', color: 'text-yellow-500' };
            case 4: return { label: 'Good', icon: '🙂', color: 'text-green-400' };
            case 5: return { label: 'Great', icon: '🤩', color: 'text-green-600' };
            default: return { label: 'N/A', icon: '-', color: 'text-gray-500' };
        }
    };

    const domMood = getMoodLabel(stats.dominantMood);

    return (
        <div className="w-full bg-[#031207] border border-gray-900/50 rounded-2xl p-6 flex flex-col gap-6">
            <h2 className="text-xl font-kodchasan font-semibold text-white pl-2 border-l-4 border-mindful-green">
                Mood Stats
            </h2>

            {/* Stats Items */}
            <div className="flex flex-col gap-4">

                {/* Streak */}
                <div className="flex items-center justify-between p-4 bg-[#0F1E0F] rounded-xl border border-gray-800">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm">Current Streak</span>
                        <span className="text-2xl font-bold text-white">{stats.streak} <span className="text-sm font-normal text-gray-500">days</span></span>
                    </div>
                    <div className="text-3xl">🔥</div>
                </div>

                {/* Total Entries */}
                <div className="flex items-center justify-between p-4 bg-[#0F1E0F] rounded-xl border border-gray-800">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-sm">Total Entries</span>
                        <span className="text-2xl font-bold text-white">{stats.totalEntries}</span>
                    </div>
                    <div className="text-3xl">📝</div>
                </div>

                {/* Dominant Mood */}
                <div className="flex flex-col p-4 bg-[#0F1E0F] rounded-xl border border-gray-800 gap-2">
                    <span className="text-gray-400 text-sm">Dominant Mood (Last 7 days)</span>
                    <div className="flex items-center gap-3">
                        <div className={`text-4xl ${domMood.color}`}>{domMood.icon}</div>
                        <div className="flex flex-col">
                            <span className={`text-lg font-bold ${domMood.color}`}>{domMood.label}</span>
                            <span className="text-xs text-gray-500">{stats.recentLogsCount} entries this week</span>
                        </div>
                    </div>
                </div>

                {/* Placeholder for simple chart?? Logic might be complex for pure CSS, keeping it simple stats for now as MVP */}
            </div>
        </div>
    );
}
