'use client';

import { useUser } from '@clerk/nextjs';
import NavBar from '@/app/components/NavBar';

export default function StudentDashboard() {
  const { isLoaded } = useUser();

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

  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <NavBar />
      <div className="flex flex-grow items-center justify-center p-6 pt-24">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl bg-[#031207] p-10 md:p-16 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)]">
            <h1 className="text-[#42734D] font-kodchasan text-4xl font-medium text-center mb-8">
              Student Dashboard
            </h1>
          </div>
        </div>
      </div>
    </main>
  );
}

