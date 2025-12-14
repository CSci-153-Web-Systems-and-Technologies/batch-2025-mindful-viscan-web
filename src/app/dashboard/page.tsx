'use client';

import { useUser, useSession } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import NavBar from '@/app/components/NavBar';
import CalendarWidget from '@/app/components/dashboard/CalendarWidget';
import MoodTracker from '@/app/components/dashboard/MoodTracker';
import SessionHistory from '@/app/components/dashboard/SessionHistory';
import { createAuthenticatedClient } from '@/lib/supabaseClient';







// This interface is likely used in children, but since we are extracting children, we just need the default export
export default function StudentDashboard() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();

  // Record Daily Login
  useEffect(() => {
    const recordLogin = async () => {
      if (!user || !session) return;
      try {
        const token = await session.getToken({ template: 'supabase' });
        const supabase = createAuthenticatedClient(token || '');

        // Attempt to insert login record for today
        // RLS policy ensures users can only insert their own ID
        // The unique constraint (user_id, login_date) will fail if already exists, which we ignore
        await supabase
          .from('daily_logins')
          .insert({
            user_id: user.id
          });

      } catch (error) {
        // Ignore errors (especially unique constraint violations)
        // console.log("Login already recorded or error:", error);
      }
    };

    recordLogin();
  }, [user, session]);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
        <NavBar />
        <div className="flex flex-grow items-center justify-center p-6 pt-24">
          <div className="text-gray-200">Loading...</div>
        </div>
      </main>
    );
  }

  // Get user's name from Clerk
  const userName = user?.firstName || user?.fullName || 'User';



  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <NavBar />
      <div className="flex flex-grow p-8 md:p-12 pt-24">
        {/* Main card with padding to show gradient background around it */}
        <div className="w-full mx-auto">
          <div className="rounded-2xl bg-[#031207] p-6 md:p-10 lg:p-12 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] min-h-[calc(100vh-14rem)] flex flex-col">
            {/* Two-column grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[68%_32%] gap-6 lg:gap-8 flex-1">
              {/* Left Column - Wider */}
              <div className="flex flex-col flex-1">
                {/* Welcome Header */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-kodchasan font-bold mb-8 bg-gradient-to-r from-[#42734D] via-[#5A9F5F] to-[#6A9F6F] bg-clip-text text-transparent">
                  Welcome! How are you today, {userName}?
                </h1>

                {/* Session History Section - Card with green border */}
                <SessionHistory />
              </div>

              {/* Right Column - Narrower */}
              <div className="flex flex-col gap-6">
                {/* Upcoming Events Calendar */}
                {/* Upcoming Events Calendar */}
                <CalendarWidget />

                {/* Mood & Thoughts Section */}
                <MoodTracker />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

