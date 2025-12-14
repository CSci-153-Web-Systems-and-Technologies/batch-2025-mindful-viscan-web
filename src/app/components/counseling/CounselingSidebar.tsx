'use client';

import React from 'react';

interface Student {
    id: string;
    full_name?: string;
    email?: string;
}

export interface Session {
    id: string;
    student_id: string;
    status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
    title: string;
    type: string;
    scheduled_at: string | null;
    created_at: string;
    student?: Student;
}

interface CounselingSidebarProps {
    sessions: Session[];
    selectedSessionId: string | null;
    onSelectSession: (id: string) => void;
}

export default function CounselingSidebar({ sessions, selectedSessionId, onSelectSession }: CounselingSidebarProps) {
    // Group sessions
    const activeSessions = sessions.filter(s => s.status === 'Active');
    const pendingSessions = sessions.filter(s => s.status === 'Pending');
    const closedSessions = sessions.filter(s => ['Completed', 'Cancelled'].includes(s.status));

    const renderSessionItem = (session: Session) => {
        const isSelected = selectedSessionId === session.id;
        const dateDisplay = session.scheduled_at
            ? new Date(session.scheduled_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
            : new Date(session.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });

        return (
            <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all mb-2 border ${isSelected
                        ? 'bg-[#1A2E1A] border-mindful-green/50 text-white'
                        : 'bg-transparent border-transparent hover:bg-[#0F1E0F] text-gray-400 hover:text-gray-200'
                    }`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" title={session.student?.email || 'Unknown'}>
                            {session.student?.email || 'Unknown User'}
                        </h4>
                        <p className="text-xs mt-0.5 truncate opacity-70" title={session.title}>
                            {session.title}
                        </p>
                    </div>
                    <span className="text-xs opacity-50 whitespace-nowrap ml-2">
                        {dateDisplay}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-[#031207] rounded-l-2xl border-r border-gray-800/50 p-4 overflow-hidden">
            <h2 className="text-white font-kodchasan font-bold text-lg mb-6 px-1 border-b border-gray-800 pb-4 text-center">
                Sessions
            </h2>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                {/* Active Section */}
                <section>
                    <h3 className="text-xs font-semibold text-mindful-green mb-3 px-2 uppercase tracking-wider">
                        Active
                    </h3>
                    <div className="space-y-1">
                        {activeSessions.length > 0 ? (
                            activeSessions.map(renderSessionItem)
                        ) : (
                            <p className="text-gray-600 text-xs px-2 italic">No active sessions</p>
                        )}
                    </div>
                </section>

                {/* Pending Section */}
                <section>
                    <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2 uppercase tracking-wider">
                        Pending
                    </h3>
                    <div className="space-y-1">
                        {pendingSessions.length > 0 ? (
                            pendingSessions.map(renderSessionItem)
                        ) : (
                            <p className="text-gray-600 text-xs px-2 italic">No pending requests</p>
                        )}
                    </div>
                </section>

                {/* Closed Section */}
                <section>
                    <h3 className="text-xs font-semibold text-gray-500 mb-3 px-2 uppercase tracking-wider">
                        Closed
                    </h3>
                    <div className="space-y-1">
                        {closedSessions.length > 0 ? (
                            closedSessions.map(renderSessionItem)
                        ) : (
                            <p className="text-gray-600 text-xs px-2 italic">No past sessions</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
