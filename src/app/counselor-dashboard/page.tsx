'use client';

import CounselorSessionList from '@/app/components/counselor/CounselorSessionList';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
export default function CounselorDashboard() {
  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">

      {/* Enforce Auth */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="flex flex-grow p-8 md:p-12 pt-24">
          {/* Main card */}
          <div className="w-full mx-auto">
            <div className="rounded-2xl bg-[#031207] p-6 md:p-10 lg:p-12 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] min-h-[calc(100vh-14rem)] flex flex-col">

              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-kodchasan font-bold bg-gradient-to-r from-[#42734D] via-[#5A9F5F] to-[#6A9F6F] bg-clip-text text-transparent">
                  Counseling Sessions
                </h1>
                <p className="text-gray-400 mt-2 font-medium">Manage student session requests</p>
              </div>

              <CounselorSessionList />
            </div>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}
