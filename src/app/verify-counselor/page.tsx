'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { submitApplication, ensureApplicantMetadata } from '@/app/actions';
import NavBar from '@/app/components/NavBar';

export default function VerifyCounselorPage() {
  const { user, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    experience: '',
  });

  const roleRaw = user?.publicMetadata?.role as string | undefined;
  const counselorStatus = user?.publicMetadata?.counselor_status as string | undefined;

  useEffect(() => {
    const maybeEnsure = async () => {
      if (!user) return;
      // If no role/status, promote to applicant pending
      if (!roleRaw && !counselorStatus) {
        await ensureApplicantMetadata();
        window.location.reload();
      }
    };
    maybeEnsure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // Scenario A: Application is pending
  if (counselorStatus === 'pending') {
    return (
      <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
        <NavBar />
        <div className="flex flex-grow items-center justify-center p-6 pt-24">
          <div className="w-full max-w-lg">
            <div className="rounded-2xl bg-[#031207] p-10 md:p-16 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] flex flex-col items-center space-y-6">
              <div className="text-6xl mb-4">⏳</div>
              <h1 className="text-[#42734D] font-kodchasan text-3xl font-medium text-center">
                Application Under Review
              </h1>
              <p className="text-gray-200 font-kodchasan text-center max-w-md">
                Thank you for your application. Our team is reviewing your credentials and will get back to you soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Scenario B: New applicant - show form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('legalName', formData.legalName);
      formDataObj.append('experience', formData.experience);

      await submitApplication(formDataObj);
      // Reload to show pending status
      window.location.reload();
    } catch (error) {
      console.error('Error submitting application:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
      <NavBar />
      <div className="flex flex-grow items-center justify-center p-6 pt-24">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl bg-[#031207] p-10 md:p-16 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)]">
            <h1 className="text-[#42734D] font-kodchasan text-3xl font-medium text-center mb-8">
              Counselor Verification
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="legalName" className="block text-gray-200 font-kodchasan mb-2">
                  Full Legal Name
                </label>
                <input
                  type="text"
                  id="legalName"
                  name="legalName"
                  required
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#0F1E0F] border border-gray-700 text-white focus:outline-none focus:border-[#42734D] transition-colors"
                  placeholder="Enter your full legal name"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-gray-200 font-kodchasan mb-2">
                  Years of Experience
                </label>
                <select
                  id="experience"
                  name="experience"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-[#0F1E0F] border border-gray-700 text-white focus:outline-none focus:border-[#42734D] transition-colors"
                >
                  <option value="">Select years of experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="11-15">11-15 years</option>
                  <option value="16+">16+ years</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 rounded-lg bg-mindful-green text-white font-medium hover:bg-mindful-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

