'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { createAuthenticatedClient } from '@/lib/supabaseClient';

export default function MoodTracker() {
    const { user, isLoaded } = useUser();
    const { session } = useSession();

    // Mood & Thoughts state
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [thoughts, setThoughts] = useState('');
    const [isSavingMood, setIsSavingMood] = useState(false);
    const [isSavingThoughts, setIsSavingThoughts] = useState(false);
    const maxThoughtsLength = 50;

    // Mood emojis (1 = Awful, 5 = Great)
    const moodEmojis = ['😫', '☹️', '😐', '🙂', '🤩'];

    useEffect(() => {
        const fetchDailyStatus = async () => {
            if (!user?.id || !session) return;

            try {
                const token = await session.getToken({ template: 'supabase' });
                const supabase = createAuthenticatedClient(token || '');

                // Get user ID
                let userId = user.id;
                const { data: userData } = await supabase
                    .from('users')
                    .select('id')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!userData) {
                    const { data: userDataByClerkId } = await supabase
                        .from('users')
                        .select('id')
                        .eq('clerk_id', user.id)
                        .maybeSingle();

                    if (userDataByClerkId) {
                        userId = userDataByClerkId.id;
                    } else {

                        // Fallback to Clerk ID
                        userId = user.id;
                    }
                } else {
                    userId = userData.id;
                }

                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                // Fetch today's mood
                const { data: moodData } = await supabase
                    .from('mood_logs')
                    .select('rating')
                    .eq('user_id', userId)
                    .gte('created_at', todayStart.toISOString())
                    .maybeSingle();

                if (moodData) {
                    setSelectedMood(moodData.rating);
                }

                // Fetch today's thoughts
                const { data: thoughtData } = await supabase
                    .from('thoughts')
                    .select('content')
                    .eq('user_id', userId)
                    .gte('created_at', todayStart.toISOString())
                    .maybeSingle();

                if (thoughtData) {
                    setThoughts(thoughtData.content);
                }
            } catch (error) {
                console.error('Error fetching daily status:', error);
            }
        };

        if (isLoaded && user) {
            fetchDailyStatus();
        }
    }, [user, isLoaded, session]);

    // Handle mood selection and save to Supabase
    const handleMoodClick = async (moodRating: number) => {
        if (!user?.id || isSavingMood || !session) return;

        try {
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            setIsSavingMood(true);

            // Get user's Supabase ID (same logic as sessions)
            let userId = user.id;
            const { data: userData, error: userFetchError } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!userData) {
                const { data: userDataByClerkId } = await supabase
                    .from('users')
                    .select('id')
                    .eq('clerk_id', user.id)
                    .maybeSingle();

                if (userDataByClerkId) {
                    userId = userDataByClerkId.id;
                } else {

                    console.log('User not synced to database, utilizing Clerk ID fallback.');
                    userId = user.id;
                }
            } else {
                userId = userData.id;
            }

            // Check if already logged today
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const { count } = await supabase
                .from('mood_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', todayStart.toISOString());

            if (count && count > 0) {
                console.warn("You have already logged your mood for today.");
                setIsSavingMood(false);
                return;
            }

            setSelectedMood(moodRating);

            // Insert mood log
            const { error } = await supabase
                .from('mood_logs')
                .insert({
                    user_id: userId,
                    rating: moodRating,
                    note: null,
                });

            if (error) {
                console.error('Error saving mood:', error);
                console.error('Full error details:', JSON.stringify(error, null, 2));
                setSelectedMood(null);
            }
        } catch (error) {
            console.error('Error saving mood:', error);
            setSelectedMood(null);
        } finally {
            setIsSavingMood(false);
        }
    };

    // Handle thoughts save to Supabase
    const handleSaveThoughts = async () => {
        if (!user?.id || !thoughts.trim() || isSavingThoughts || !session) return;

        try {
            const token = await session.getToken({ template: 'supabase' });
            const supabase = createAuthenticatedClient(token || '');

            setIsSavingThoughts(true);

            // Get user's Supabase ID
            let userId = user.id;
            const { data: userData } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!userData) {
                const { data: userDataByClerkId } = await supabase
                    .from('users')
                    .select('id')
                    .eq('clerk_id', user.id)
                    .maybeSingle();

                if (userDataByClerkId) {
                    userId = userDataByClerkId.id;
                } else {

                    console.log('User not synced to database, utilizing Clerk ID fallback.');
                    userId = user.id;
                }
            } else {
                userId = userData.id;
            }

            // Check if already logged today
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const { count } = await supabase
                .from('thoughts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .gte('created_at', todayStart.toISOString());

            if (count && count > 0) {
                console.warn("You have already logged your thoughts for today.");
                setIsSavingThoughts(false);
                return;
            }

            // Insert thought
            const { error } = await supabase
                .from('thoughts')
                .insert({
                    user_id: userId,
                    content: thoughts.trim(),
                });

            if (error) {
                console.error('Error saving thoughts:', error);
                console.error('Full error details:', JSON.stringify(error, null, 2));
            } else {
                // Clear thoughts after successful save
                setThoughts('');
                alert("Thoughts saved successfully!");
            }
        } catch (error) {
            console.error('Error saving thoughts:', error);
        } finally {
            setIsSavingThoughts(false);
        }
    };

    return (
        <div className="rounded-lg bg-[#031207] border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] p-6">
            {/* Mood Selection */}
            <div className="mb-6">
                <div className="flex justify-center gap-4">
                    {moodEmojis.map((emoji, index) => {
                        const moodRating = index + 1;
                        const isSelected = selectedMood === moodRating;
                        return (
                            <button
                                key={moodRating}
                                onClick={() => handleMoodClick(moodRating)}
                                disabled={isSavingMood}
                                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  transition-all duration-200
                  ${isSelected
                                        ? 'bg-mindful-green/30 border-2 border-mindful-green scale-110'
                                        : 'bg-[#0F1E0F] border-2 border-gray-700 hover:border-mindful-green/50 hover:scale-105'
                                    }
                  ${isSavingMood ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                                aria-label={`Mood rating ${moodRating}`}
                            >
                                {emoji}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Thoughts Input */}
            <div className="space-y-2">
                <textarea
                    value={thoughts}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= maxThoughtsLength) {
                            setThoughts(value);
                        }
                    }}
                    placeholder="Thoughts for the day?"
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0F1E0F] border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-mindful-green resize-none"
                />

                {/* Character count and save button */}
                <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                        {thoughts.length}/{maxThoughtsLength}
                    </span>
                    <button
                        onClick={handleSaveThoughts}
                        disabled={!thoughts.trim() || isSavingThoughts || thoughts.length === 0}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
              ${thoughts.trim() && !isSavingThoughts
                                ? 'bg-mindful-green hover:bg-[#5a9f5f] text-white cursor-pointer'
                                : 'bg-[#0F1E0F] border border-gray-700 text-gray-500 cursor-not-allowed'
                            }
            `}
                        aria-label="Save thoughts"
                    >
                        {isSavingThoughts ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
