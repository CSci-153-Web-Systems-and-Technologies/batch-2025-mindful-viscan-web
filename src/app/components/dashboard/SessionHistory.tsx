'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { createAuthenticatedClient } from '@/lib/supabaseClient';

interface CounselingSession {
    id: string;
    status: string;
    type: string;
    scheduled_at: string;
    counselor: {
        id: string;
        email?: string;
        full_name?: string;
    } | null;
}

export default function SessionHistory() {
    const { user, isLoaded } = useUser();
    const { session } = useSession();
    const [sessions, setSessions] = useState<CounselingSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    // Fetch counseling sessions
    useEffect(() => {
        const fetchSessions = async () => {
            if (!user?.id || !session) return;

            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            try {
                setLoading(true);

                // Try to find user in Supabase - check if id matches Clerk userId or if there's a clerk_id field
                let studentId = user.id;

                // First try: assume users.id matches Clerk userId
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', user.id)
                    .single();

                if (userData && !userError) {
                    studentId = userData.id;
                } else {
                    // If not found, try clerk_id field
                    const { data: userDataByClerkId, error: clerkIdError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('clerk_id', user.id)
                        .single();

                    if (userDataByClerkId && !clerkIdError) {
                        studentId = userDataByClerkId.id;
                    } else {
                        // User not found in Supabase - this is okay, they might not have any sessions yet
                        console.log('User not found in Supabase users table. This is normal for new users.');
                        setSessions([]);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch counseling sessions
                const { data: joinedData, error: joinError } = await supabase
                    .from('counseling_sessions')
                    .select(`
            id,
            status,
            type,
            scheduled_at,
            counselor_id
          `)
                    .eq('student_id', studentId)
                    .order('scheduled_at', { ascending: false });

                if (joinError) {
                    // Log detailed error information
                    const errorInfo: any = {
                        message: joinError.message || 'Unknown error',
                        details: joinError.details || 'No details available',
                        hint: joinError.hint || 'No hint available',
                        code: joinError.code || 'No error code',
                    };

                    // Log the full error object
                    console.error('Error fetching counseling sessions:', errorInfo);

                    // Common error: Table doesn't exist or RLS policy issue
                    if (joinError.code === 'PGRST116' || joinError.message?.includes('relation') || joinError.message?.includes('does not exist')) {
                        console.warn('Possible issue: Table "counseling_sessions" may not exist or RLS policies may be blocking access.');
                    }

                    setSessions([]);
                    return;
                }

                if (!joinedData) {
                    setSessions([]);
                    return;
                }

                let sessionsData = joinedData;

                // Fetch counselor info separately if counselor_id exists
                const counselorIds = [...new Set(joinedData.map((s: any) => s.counselor_id).filter(Boolean))];

                if (counselorIds.length > 0) {
                    const { data: counselorsData, error: counselorsError } = await supabase
                        .from('users')
                        .select('id, full_name, email')
                        .in('id', counselorIds);

                    if (counselorsError) {
                        console.error('Error fetching counselors:', counselorsError);
                    }

                    // Map counselor data to sessions (even if there was an error, continue with available data)
                    const counselorsMap = new Map(
                        (counselorsData || []).map((c: any) => [c.id, c])
                    );

                    sessionsData = sessionsData.map((session: any) => ({
                        ...session,
                        counselor: session.counselor_id ? (counselorsMap.get(session.counselor_id) || null) : null,
                    }));
                }

                // Transform data to match our interface
                const transformedSessions = sessionsData.map((session: any) => ({
                    id: session.id,
                    status: session.status || 'Pending',
                    type: session.type || 'General',
                    scheduled_at: session.scheduled_at,
                    counselor: session.counselor ? {
                        id: session.counselor.id,
                        full_name: session.counselor.full_name,
                        email: session.counselor.email,
                    } : null,
                }));
                setSessions(transformedSessions);
            } catch (error) {
                console.error('Unexpected error fetching sessions:', error);
                setSessions([]);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user) {
            fetchSessions();
        }
    }, [user, isLoaded, session]);

    // Filter sessions
    const filteredSessions = sessions.filter(session => {
        if (!filter) return true;
        const searchTerm = filter.toLowerCase();
        return (
            session.status?.toLowerCase().includes(searchTerm) ||
            session.type?.toLowerCase().includes(searchTerm) ||
            session.counselor?.full_name?.toLowerCase().includes(searchTerm) ||
            session.counselor?.email?.toLowerCase().includes(searchTerm)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredSessions.length / rowsPerPage);
    const paginatedSessions = filteredSessions.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // Handle row selection
    const toggleRowSelection = (sessionId: string) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(sessionId)) {
            newSelected.delete(sessionId);
        } else {
            newSelected.add(sessionId);
        }
        setSelectedRows(newSelected);
    };

    const toggleAllSelection = () => {
        if (selectedRows.size === paginatedSessions.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedSessions.map(s => s.id)));
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // Get counselor display name/email
    const getCounselorDisplay = (counselor: CounselingSession['counselor']) => {
        if (!counselor) return 'N/A';
        return counselor.email || counselor.full_name || 'Unknown';
    };

    return (
        <div className="flex flex-col flex-1 rounded-lg bg-[#031207] border-t border-l border-gray-900/50 border-r-2 border-b-2 border-r-mindful-green/60 border-b-mindful-green/60 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] p-6">
            <div className="flex flex-col flex-1 gap-4">
                <h2 className="text-gray-200 text-lg font-medium">Session History</h2>

                {/* Filter and Columns */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Filter sessions..."
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="flex-1 px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-mindful-green"
                    />
                    <button className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors flex items-center gap-2">
                        Columns
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-[#0F1E0F] rounded animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-[#0F1E0F] border-b border-gray-700">
                                        <th className="px-4 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.size === paginatedSessions.length && paginatedSessions.length > 0}
                                                onChange={toggleAllSelection}
                                                className="rounded border-gray-600 bg-[#0F1E0F] text-mindful-green focus:ring-mindful-green"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">Status</th>
                                        <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                Counselor
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">Date</th>
                                        <th className="px-4 py-3 text-left text-gray-200 text-sm font-medium">Session Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedSessions.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                                No sessions found
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedSessions.map((session, index) => (
                                            <tr
                                                key={session.id}
                                                className={`border-b border-gray-800 ${index % 2 === 0 ? 'bg-[#031207]' : 'bg-[#0a1a0a]'
                                                    } hover:bg-[#0F1E0F] transition-colors`}
                                            >
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.has(session.id)}
                                                        onChange={() => toggleRowSelection(session.id)}
                                                        className="rounded border-gray-600 bg-[#0F1E0F] text-mindful-green focus:ring-mindful-green"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-gray-200 text-sm">{session.status || 'N/A'}</td>
                                                <td className="px-4 py-3 text-gray-200 text-sm">
                                                    {getCounselorDisplay(session.counselor)}
                                                </td>
                                                <td className="px-4 py-3 text-gray-200 text-sm">
                                                    {session.scheduled_at ? formatDate(session.scheduled_at) : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-200 text-sm">{session.type || 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination and Selection Info */}
                        <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">
                                {selectedRows.size} of {filteredSessions.length} row(s) selected.
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons - Pushed to bottom */}
                        <div className="flex justify-end gap-3 mt-auto pt-4">
                            <button
                                disabled={selectedRows.size === 0}
                                className="px-4 py-2 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 hover:bg-[#1a2f1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Delete Selected
                            </button>
                            <button className="px-4 py-2 bg-mindful-green hover:bg-[#5a9f5f] text-white rounded-lg transition-colors font-medium">
                                Request new session
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
