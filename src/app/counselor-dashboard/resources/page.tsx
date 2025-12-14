import ResourceManager from '@/app/components/counselor/ResourceManager';
import CounselorNavBar from '@/app/components/counselor/CounselorNavBar';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

export default function CounselorResourcesPage() {
    return (
        <main className="flex min-h-screen flex-col p-0 bg-[linear-gradient(110deg,var(--color-mindful-green)_0%,var(--color-mindful-dark)_100%)]">
            <CounselorNavBar />

            {/* Enforce Auth */}
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div className="flex flex-grow p-8 md:p-12 pt-24">
                    {/* Main card */}
                    <div className="w-full mx-auto">
                        <div className="rounded-2xl bg-[#031207] p-6 md:p-10 lg:p-12 border border-gray-900/50 shadow-[4px_4px_0px_0px_rgba(34,197,94,0.15)] min-h-[calc(100vh-14rem)] flex flex-col">

                            <div className="mb-0"> {/* Header is handled inside ResourceManager or we keep it clean here */}
                                {/* ResourceManager has its own header internal logic, but we can wrap it if needed. 
                                    Looking at ResourceManager.tsx, it has a Header. I'll let it stay for now or we can clean it up.
                                    Actually, user said "resources tab should be the same as the one on the user side". 
                                    The user side doesn't have the 'Add Resource' button, but our ResourceManager does. 
                                    I will trust ResourceManager's internal layout for the inner content.
                                */}
                            </div>

                            <ResourceManager />
                        </div>
                    </div>
                </div>
            </SignedIn>
        </main>
    );
}
