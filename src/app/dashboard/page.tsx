'use client';

import { useUser } from '@clerk/nextjs';
import NavBar from '@/app/components/NavBar';

export default function StudentDashboard() {
  const { user, isLoaded } = useUser();

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
          <div className="rounded-2xl bg-[#031207] p-6 md:p-10 lg:p-12 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] min-h-[calc(100vh-14rem)]">
            {/* Two-column grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[68%_32%] gap-6 lg:gap-8">
              {/* Left Column - Wider */}
              <div className="flex flex-col">
                {/* Welcome Header */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-kodchasan font-bold mb-8 bg-gradient-to-r from-[#42734D] via-[#5A9F5F] to-[#6A9F6F] bg-clip-text text-transparent">
                  Welcome! How are you today, {userName}?
                </h1>
                
                {/* Left column content will go here in Step 2 */}
              </div>

              {/* Right Column - Narrower */}
              <div className="flex flex-col gap-6">
                {/* Right column content will go here in Steps 3 & 4 */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

