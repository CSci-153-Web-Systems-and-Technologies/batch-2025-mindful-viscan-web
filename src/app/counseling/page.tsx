'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/app/components/NavBar';
import { SignedIn, SignedOut, RedirectToSignIn, useUser, useSession } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/supabaseClient';
import CounselingSidebar, { Session } from '@/app/components/counseling/CounselingSidebar';
import ChatInterface, { Message } from '@/app/components/counseling/ChatInterface';
import { useSearchParams } from 'next/navigation';

export default function StudentCounselingPage() {
    const { user } = useUser();
    const { session } = useSession();
    const searchParams = useSearchParams();
    const initialSessionId = searchParams.get('session');

    const [sessions, setSessions] = useState<Session[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId);
    const [currentUserId, setCurrentUserId] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setCurrentUserId(user.id);
            // Reset mock messages when user is loaded
            setMessages([
                { id: '1', session_id: 'mock', sender_id: user.id, content: "Hi, I've been feeling really overwhelmed with my thesis lately.", created_at: new Date().toISOString(), is_counselor: false },
                { id: '2', session_id: 'mock', sender_id: 'counselor_id', content: "Hello. I understand that can be very stressful. I'm here to listen. Can you tell me more about what's causing the most pressure?", created_at: new Date().toISOString(), is_counselor: true },
            ]);
        }
    }, [user]);

    // Fetch Sessions (Filtered for Student)
    const fetchSessions = async () => {
        if (!session || !user) return;
        try {
            setLoading(true);
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            let studentId = user.id;

            // Resolve Student ID
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (userData && !userError) {
                studentId = userData.id;
            } else {
                const { data: userDataByClerkId, error: clerkIdError } = await supabase
                    .from('users')
                    .select('id')
                    .eq('clerk_id', user.id)
                    .maybeSingle();
                if (userDataByClerkId && !clerkIdError) {
                    studentId = userDataByClerkId.id;
                }
            }


            const { data: sessionData, error } = await supabase
                .from('counseling_sessions')
                .select('*')
                .eq('student_id', studentId) // Only fetch THEIR sessions
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching sessions:', error);
                setSessions([]);
                return;
            }

            if (sessionData && sessionData.length > 0) {
                // For students, we want to see the COUNSELOR's name, not the student's
                const counselorIds = [...new Set(sessionData.map(s => s.counselor_id).filter(Boolean))];

                let counselorMap = new Map();

                if (counselorIds.length > 0) {
                    const { data: usersData } = await supabase
                        .from('users')
                        .select('id, full_name, email')
                        .in('id', counselorIds);

                    counselorMap = new Map(usersData?.map(u => [u.id, u]));
                }

                const joinedSessions = sessionData.map(s => ({
                    ...s,
                    // We map the 'student' field in the Sidebar to the COUNSELOR for display purposes
                    student: s.counselor_id ? counselorMap.get(s.counselor_id) : { email: 'Pending Assignment', full_name: 'Waiting for Counselor' }
                }));

                setSessions(joinedSessions as Session[]);
            } else {
                setSessions([]);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session && user) {
            fetchSessions();
        }
    }, [session, user]);

    const handleSelectSession = (id: string) => {
        setSelectedSessionId(id);
        // TODO: Fetch real messages for this session
    };

    const handleSendMessage = (content: string) => {
        // Add optimistic message
        const newMsg: Message = {
            id: Date.now().toString(),
            session_id: selectedSessionId || '',
            sender_id: currentUserId,
            content,
            created_at: new Date().toISOString(),
            is_counselor: false // Student is sender
        };
        setMessages(prev => [...prev, newMsg]);
        // TODO: Send to backend
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <main className="flex h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)] overflow-hidden">
            <NavBar />

            {/* Enforce Auth */}
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div className="flex flex-col flex-grow p-4 md:p-8 lg:p-12 pt-24 h-full overflow-hidden">
                    <div className="w-full mx-auto flex gap-0 h-full shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] rounded-2xl overflow-hidden border border-gray-900/50 bg-[#031207] mb-10">

                        {/* Left Sidebar */}
                        <div className="w-80 md:w-96 flex-shrink-0 h-full border-r border-gray-800 bg-[#031207]">
                            <CounselingSidebar
                                sessions={sessions}
                                selectedSessionId={selectedSessionId}
                                onSelectSession={handleSelectSession}
                                showPending={true} // Enable Pending for students
                            />
                        </div>

                        {/* Right Chat Area */}
                        <div className="flex-1 h-full bg-[#031207]">
                            <ChatInterface
                                sessionId={selectedSessionId}
                                sessionTitle={selectedSession ? `Session with ${selectedSession.student?.full_name || 'Counselor'}` : undefined}
                                currentUserId={currentUserId}
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                isSessionClosed={selectedSession ? ['Completed', 'Cancelled'].includes(selectedSession.status) : false}
                            />
                        </div>
                    </div>
                </div>
            </SignedIn>
        </main>
    );
}
