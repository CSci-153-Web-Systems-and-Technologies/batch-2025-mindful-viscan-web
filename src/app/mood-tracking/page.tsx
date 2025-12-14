'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/app/components/NavBar';
import { SignedIn, SignedOut, RedirectToSignIn, useUser, useSession } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/app/utils/supabase/client';
import MoodHeatmap from '@/app/components/mood/MoodHeatmap';

interface MoodLog {
    id: string;
    created_at: string;
    rating: number; // 1-5
    note?: string;
    summary?: string;
}

export default function MoodTrackingPage() {
    const { user, isLoaded } = useUser();
    const { session } = useSession();
    const [logs, setLogs] = useState<MoodLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            if (!user || !session) return;
            try {
                setLoading(true);
                const token = await session.getToken({ template: 'supabase' });
                const supabase = createAuthenticatedClient(token || '');

                // Fetch logs for current user
                const { data, error } = await supabase
                    .from('mood_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false }); // Latest first

                if (error) {
                    console.error("Error fetching mood logs:", error);
                } else {
                    setLogs(data || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user) {
            fetchLogs();
        }
    }, [user, session, isLoaded]);

    return (
        <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
            <NavBar />

            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div className="flex flex-col flex-grow p-4 md:p-8 lg:p-12 pt-24 space-y-8">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-kodchasan font-bold text-white mb-2">Mood Tracking</h1>
                        <p className="text-gray-400">Track your daily mood and build your streak.</p>
                    </div>

                    {/* Components */}
                    <div className="space-y-8">
                        {/* 1. Heatmap */}
                        <div className="w-full bg-[#031207] border border-gray-900/50 rounded-2xl p-6 min-h-[200px]">
                            <h2 className="text-xl font-kodchasan font-semibold text-white mb-6 pl-2 border-l-4 border-mindful-green">
                                Your Year in Pixels
                            </h2>
                            {loading ? (
                                <div className="flex justify-center items-center h-[140px] text-gray-500 animate-pulse">
                                    Loading history...
                                </div>
                            ) : (
                                <MoodHeatmap logs={logs} />
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* 2. Mood Entry Form */}
                            <div className="lg:col-span-2 bg-[#031207] border border-gray-900/50 rounded-2xl p-6 min-h-[400px] flex items-center justify-center text-gray-500">
                                Mood Entry Form Component (Coming Soon)
                            </div>

                            {/* 3. Mood Stats */}
                            <div className="lg:col-span-1 bg-[#031207] border border-gray-900/50 rounded-2xl p-6 min-h-[400px] flex items-center justify-center text-gray-500">
                                Mood Stats (Coming Soon)
                            </div>
                        </div>
                    </div>
                </div>
            </SignedIn>
        </main>
    );
}
