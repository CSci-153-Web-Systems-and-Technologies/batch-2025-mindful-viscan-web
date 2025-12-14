'use client';

import { useState, useEffect } from 'react';
import { useSession, useUser } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/supabaseClient';

interface Student {
    id: string;
    full_name?: string;
    email?: string;
}

interface Session {
    id: string;
    student_id: string;
    status: string;
    title: string;
    type: string;
    scheduled_at: string | null;
    created_at: string;
    student?: Student;
}

export default function CounselorSessionList() {
    const { user } = useUser();
    const { session } = useSession();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchSessions = async () => {
        if (!session) return;

        try {
            setLoading(true);
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            // Fetch sessions
            const { data: sessionData, error } = await supabase
                .from('counseling_sessions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching sessions:', error);
                setSessions([]);
                return;
            }

            // Fetch student details manually to ensure reliability (sometimes joins can be tricky with auth users)
            if (sessionData && sessionData.length > 0) {
                const studentIds = [...new Set(sessionData.map(s => s.student_id))];

                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, full_name') // Email might not be in schema based on comments
                    .in('id', studentIds);

                const userMap = new Map(usersData?.map(u => [u.id, u]));

                const joinedSessions = sessionData.map(s => ({
                    ...s,
                    student: userMap.get(s.student_id)
                }));
                setSessions(joinedSessions);
            } else {
                setSessions([]);
            }

        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (sessionId: string, action: 'Accept' | 'Decline' | 'Complete') => {
        if (!session || !user) return;
        setActionLoading(sessionId);

        try {
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            let updates: any = {};

            if (action === 'Accept') {
                updates = { status: 'Active', counselor_id: user.id };
            } else if (action === 'Decline') {
                updates = { status: 'Cancelled' };
            } else if (action === 'Complete') {
                updates = { status: 'Completed' };
            }

            const { error } = await supabase
                .from('counseling_sessions')
                .update(updates)
                .eq('id', sessionId);

            if (error) {
                console.error(`Error performing ${action}:`, error);
                alert(`Failed to ${action.toLowerCase()} session.`);
            } else {
                // Optimistic update or refetch
                fetchSessions();
            }
        } catch (error) {
            console.error('Action error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        if (session) {
            fetchSessions();
        }
    }, [session]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'active': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    if (loading) {
        return <div className="text-gray-400 p-4">Loading sessions...</div>;
    }

    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-[#0F1E0F] border border-gray-800 rounded-2xl">
                <p className="text-gray-300 font-medium">No session requests found.</p>
                <p className="text-gray-500 text-sm mt-1">Check back later for student requests.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sessions.map((session) => (
                <div
                    key={session.id}
                    className="bg-[#0F1E0F] border border-gray-800 rounded-2xl p-6 flex flex-col md:flex-row gap-6 animate-in fade-in transition-all duration-300 hover:border-gray-700"
                >
                    {/* Main Info */}
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${getStatusColor(session.status)}`}>
                                {session.status}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            {session.type && (
                                <span className="text-gray-400 text-sm border border-gray-700 px-2 py-0.5 rounded">
                                    {session.type}
                                </span>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-100">{session.title}</h3>
                            <p className="text-mindful-green text-sm mt-1 font-medium">
                                Student: {session.student?.full_name || 'Unknown Student'}
                            </p>
                        </div>

                        <div className="text-gray-400 text-sm">
                            {session.scheduled_at
                                ? `Requested for: ${new Date(session.scheduled_at).toLocaleString()}`
                                : 'No specific time requested.'}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col justify-center gap-3 min-w-[140px]">
                        {session.status === 'Pending' && (
                            <>
                                <button
                                    onClick={() => handleAction(session.id, 'Accept')}
                                    disabled={!!actionLoading}
                                    className="px-4 py-2 bg-mindful-green text-white rounded-xl hover:bg-[#5a9f5f] transition-all font-medium text-sm shadow-lg shadow-mindful-green/10"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => handleAction(session.id, 'Decline')}
                                    disabled={!!actionLoading}
                                    className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-xl hover:bg-red-900/20 hover:text-red-400 hover:border-red-800 transition-all font-medium text-sm"
                                >
                                    Decline
                                </button>
                            </>
                        )}

                        {session.status === 'Active' && (
                            <button
                                onClick={() => handleAction(session.id, 'Complete')}
                                disabled={!!actionLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium text-sm"
                            >
                                Mark Complete
                            </button>
                        )}

                        {(session.status === 'Completed' || session.status === 'Cancelled') && (
                            <span className="text-center text-gray-500 text-sm italic py-2">
                                No actions
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
