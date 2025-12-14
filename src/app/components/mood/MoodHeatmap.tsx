'use client';

import React from 'react';

interface MoodLog {
    id: string;
    created_at: string;
    rating: number; // 1-5
    note?: string;
    summary?: string;
}

interface MoodHeatmapProps {
    logs: MoodLog[];
}

export default function MoodHeatmap({ logs }: MoodHeatmapProps) {
    // Generate dates for the last 365 days (approx 52 weeks)
    // We want the grid to end on "Today" or end of current week
    // GitHub ends on Today.
    // We need to group by week (Sunday to Saturday)

    const today = new Date();
    const days: { date: Date; rating?: number; count: number }[] = [];

    // Calculate start date (365 days ago)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 365);

    // Re-align start date to the previous Sunday to ensure grid is aligned
    const dayOfWeek = startDate.getDay(); // 0 is Sunday
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Normalize logs for easy lookup: only care about rating on that day.
    // If multiple logs, pick the highest rating or latest? Let's pick LATEST.
    const logsByDate: { [key: string]: MoodLog } = {};
    logs.forEach(log => {
        const dateStr = new Date(log.created_at).toDateString();
        // If entry exists, only overwrite if this one is newer
        if (!logsByDate[dateStr] || new Date(log.created_at) > new Date(logsByDate[dateStr].created_at)) {
            logsByDate[dateStr] = log;
        }
    });

    // Generate day cells
    const loopDate = new Date(startDate);
    while (loopDate <= today) {
        const dateStr = loopDate.toDateString();
        const log = logsByDate[dateStr];
        days.push({
            date: new Date(loopDate),
            rating: log ? log.rating : 0,
            count: log ? 1 : 0
        });
        loopDate.setDate(loopDate.getDate() + 1);
    }

    // Split into weeks
    const weeks: typeof days[] = [];
    let currentWeek: typeof days = [];

    days.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    // Push remaining partial week
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    // Helper to get color
    // 0 = No entry (Gray)
    // 1 (Awful) -> 5 (Happy)
    // Custom palette based on request "different colors" or "intensity"
    // Let's use a nice custom scale
    const getColor = (rating: number) => {
        if (!rating) return 'bg-[#1a2e1a]'; // Empty/Placeholder (Darker green/gray)
        switch (rating) {
            case 1: return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';     // Awful
            case 2: return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';  // Bad
            case 3: return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]';   // Okay
            case 4: return 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.6)]';    // Good (Green-400)
            case 5: return 'bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.8)] border border-green-300';     // Great (Green-500)
            default: return 'bg-[#1a2e1a]';
        }
    };

    const getTooltip = (day: typeof days[0]) => {
        const dateStr = day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        if (!day.rating) return `No entry on ${dateStr}`;
        const moods = ['', 'Awful', 'Bad', 'Okay', 'Good', 'Great'];
        return `${moods[day.rating]} on ${dateStr}`;
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-fit pr-4">
                {/* Month Labels row */}
                <div className="flex text-xs text-gray-500 mb-2 ml-8 gap-[1px]">
                    {/* Simplified labels logic could go here, or just let user hover */}
                </div>

                <div className="flex gap-1 h-[110px]">
                    {/* Day labels column */}
                    <div className="flex flex-col justify-between text-[10px] text-gray-500 pr-2 pt-2 h-full pb-1">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="flex gap-1">
                        {weeks.map((week, wIndex) => (
                            <div key={wIndex} className="flex flex-col gap-1">
                                {week.map((day, dIndex) => (
                                    <div
                                        key={dIndex}
                                        className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all duration-300 hover:scale-125 hover:z-10 cursor-pointer ${getColor(day.rating || 0)}`}
                                        title={getTooltip(day)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center text-xs text-gray-500 mt-4 gap-2 ml-8">
                    <span>Less</span>
                    <div className={`w-3 h-3 rounded-[2px] ${getColor(0)}`} />
                    <div className={`w-3 h-3 rounded-[2px] ${getColor(1)}`} />
                    <div className={`w-3 h-3 rounded-[2px] ${getColor(2)}`} />
                    <div className={`w-3 h-3 rounded-[2px] ${getColor(3)}`} />
                    <div className={`w-3 h-3 rounded-[2px] ${getColor(4)}`} />
                    <div className={`w-3 h-3 rounded-[2px] ${getColor(5)}`} />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
