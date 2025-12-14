'use client';

import { useState } from 'react';

export default function CalendarWidget() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: Array<{ day: number; isCurrentMonth: boolean }> = [];

        // Add days from previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
        }

        // Add days from current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }

        // Add days from next month to fill the grid (6 rows * 7 days = 42)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }

        return days;
    };

    const isToday = (day: number, date: Date, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return false;
        const today = new Date();
        return (
            day === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(parseInt(e.target.value));
        setCurrentDate(newDate);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(parseInt(e.target.value));
        setCurrentDate(newDate);
    };

    const calendarDays = getDaysInMonth(currentDate);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const yearOptions = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        yearOptions.push(i);
    }

    return (
        <div className="rounded-lg bg-[#031207] border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] p-6">
            <h2 className="text-gray-200 text-lg font-medium mb-4">Upcoming Events</h2>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => navigateMonth('prev')}
                    className="text-gray-200 hover:text-mindful-green transition-colors p-1"
                    aria-label="Previous month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex items-center gap-2">
                    <select
                        value={currentMonth}
                        onChange={handleMonthChange}
                        className="bg-[#0F1E0F] border border-gray-700 rounded px-2 py-1 text-gray-200 text-sm focus:outline-none focus:border-mindful-green cursor-pointer"
                    >
                        {monthNames.map((month, index) => (
                            <option key={index} value={index}>
                                {month}
                            </option>
                        ))}
                    </select>
                    <select
                        value={currentYear}
                        onChange={handleYearChange}
                        className="bg-[#0F1E0F] border border-gray-700 rounded px-2 py-1 text-gray-200 text-sm focus:outline-none focus:border-mindful-green cursor-pointer"
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={() => navigateMonth('next')}
                    className="text-gray-200 hover:text-mindful-green transition-colors p-1"
                    aria-label="Next month"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map(day => (
                    <div key={day} className="text-center text-gray-400 text-xs font-medium py-1">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((dayInfo, index) => {
                    const { day, isCurrentMonth } = dayInfo;
                    const isTodayDate = isToday(day, currentDate, isCurrentMonth);

                    return (
                        <div
                            key={index}
                            className={`
                aspect-square flex items-center justify-center text-sm
                ${isCurrentMonth ? 'text-gray-200' : 'text-gray-500'}
                ${isTodayDate
                                    ? 'bg-mindful-green/30 border-2 border-mindful-green rounded'
                                    : 'hover:bg-[#0F1E0F] rounded transition-colors cursor-pointer'
                                }
              `}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
