import ResourceManager from '@/app/components/counselor/ResourceManager';
import CounselorNavBar from '@/app/components/counselor/CounselorNavBar';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function CounselorResourcesPage() {
    return (
        <main className="flex h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)] overflow-hidden">
            <CounselorNavBar />

            {/* Enforce Auth */}
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div className="flex flex-col flex-1 min-h-0 p-6 md:p-10 pt-24 pb-10 overflow-hidden">
                    {/* Main card */}
                    <div className="w-full mx-auto flex flex-col flex-1 min-h-0">
                        <div className="rounded-2xl bg-[#031207] p-6 md:p-8 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] flex flex-col flex-1 min-h-0 overflow-hidden relative">
                            <ResourceManager />
                        </div>
                    </div>
                </div>
            </SignedIn>
        </main>
    );
}
