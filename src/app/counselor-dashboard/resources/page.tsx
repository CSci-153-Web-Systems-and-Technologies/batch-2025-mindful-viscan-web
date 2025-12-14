import ResourceManager from '@/app/components/counselor/ResourceManager';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Link from 'next/link';

export default function CounselorResourcesPage() {
    // Shared Layout Wrapper (Ideally this would be a layout.tsx, but keeping simple for now)
    return (
        <div className="absolute inset-0 bg-[#031207] text-white font-sans overflow-y-auto custom-scrollbar selection:bg-mindful-green/30 selection:text-mindful-green">

            {/* Enforce Auth */}
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div className="max-w-7xl mx-auto px-6 py-8 pb-32">
                    {/* Header / Nav - Ideally extracted to a component later */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div>
                            <h1 className="text-4xl font-kodchasan font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                Counselor Dashboard
                            </h1>
                            <p className="text-gray-400 mt-2 font-medium">Manage student sessions and resources</p>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex bg-[#0F1E0F] p-1.5 rounded-xl border border-gray-800 self-start sm:self-auto">
                            <Link
                                href="/counselor-dashboard"
                                className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                Sessions
                            </Link>
                            <Link
                                href="/counselor-dashboard/resources"
                                className="px-6 py-2.5 rounded-lg text-sm font-medium bg-mindful-green text-white shadow-lg shadow-mindful-green/20"
                            >
                                Resources
                            </Link>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <ResourceManager />
                    </div>
                </div>
            </SignedIn>
        </div>
    );
}
