'use client';

import { useState, useEffect, useCallback } from 'react';
import NavBar from '@/app/components/NavBar';
import { SignedIn, SignedOut, RedirectToSignIn, useUser, useSession } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/supabaseClient';
import MoodHeatmap from '@/app/components/mood/MoodHeatmap';
import MoodEntry from '@/app/components/mood/MoodEntry';
import MoodStats from '@/app/components/mood/MoodStats';

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

    const fetchLogs = useCallback(async () => {
        if (!user || !session) return;
        try {
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
    }, [user, session]);

    useEffect(() => {
        if (isLoaded && user) {
            fetchLogs();
        }
    }, [isLoaded, user, fetchLogs]);

    // Check for today's log to disable duplicate entries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find log created after today 00:00
    const todayLog = logs.find(log => new Date(log.created_at) >= today);

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
                            {loading && logs.length === 0 ? (
                                <div className="flex justify-center items-center h-[140px] text-gray-500 animate-pulse">
                                    Loading history...
                                </div>
                            ) : (
                                <MoodHeatmap logs={logs} />
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* 2. Mood Entry Form */}
                            <div className="lg:col-span-2">
                                <MoodEntry onEntryAdded={fetchLogs} currentLog={todayLog || null} />
                            </div>

                            {/* 3. Mood Stats */}
                            <div className="lg:col-span-1">
                                <MoodStats logs={logs} />
                            </div>
                        </div>
                    </div>
                </div>
            </SignedIn>
        </main>
    );
}
