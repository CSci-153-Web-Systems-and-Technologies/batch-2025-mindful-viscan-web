'use client';

import NavBar from '@/app/components/NavBar';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function MoodTrackingPage() {
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

                    {/* Components Placeholders */}
                    <div className="space-y-8">
                        {/* 1. Heatmap */}
                        <div className="w-full bg-[#031207] border border-gray-900/50 rounded-2xl p-6 min-h-[200px] flex items-center justify-center text-gray-500">
                            Mood Heatmap Component (Coming Soon)
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
