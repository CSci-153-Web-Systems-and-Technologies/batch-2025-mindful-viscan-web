'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { submitApplication, ensureApplicantMetadata } from '@/app/actions';
import CounselorNavBar from '@/app/components/counselor/CounselorNavBar';

export default function VerifyCounselorPage() {
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    experience: '',
  });

  const roleRaw = user?.publicMetadata?.role as string | undefined;
  const counselorStatus = user?.publicMetadata?.counselor_status as string | undefined;

  // Ensure user is marked as pending if they are on this page
  useEffect(() => {
    const autoApply = async () => {
      // If we don't have the explicit pending status yet, apply it
      if (user && counselorStatus !== 'pending') {
        const result = await ensureApplicantMetadata();
        // Only reload if we actually made a change, to avoid loops
        if (result?.updated) {
          window.location.reload();
        }
      }
    };
    autoApply();
  }, [user, counselorStatus]);

  // Loading / Verification State
  if (!isLoaded || (!roleRaw && !counselorStatus)) {
    return (
      <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
        <CounselorNavBar />
        <div className="flex flex-grow items-center justify-center p-6 pt-24">
          <div className="text-gray-200 animate-pulse">Verifying status...</div>
        </div>
      </main>
    );
  }

  // DEFAULT VIEW: Application Under Review
  // Even if they haven't explicitly filled a form, we treat landing here as applying.
  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <CounselorNavBar />
      <div className="flex flex-grow items-center justify-center p-6 pt-24">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl bg-[#031207] p-10 md:p-16 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] flex flex-col items-center space-y-6">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-[#42734D] font-kodchasan text-3xl font-medium text-center">
              Application Under Review
            </h1>
            <p className="text-gray-200 font-kodchasan text-center max-w-md">
              Thank you for your interest. We have received your request and our team is setting up your counselor account.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

