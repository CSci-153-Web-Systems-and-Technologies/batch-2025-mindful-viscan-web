'use client';

import React from 'react';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

const CounselorNavBar: React.FC = () => {
    return (
        <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4 text-white shadow-lg shadow-mindful-green/5" style={{ backgroundColor: 'var(--color-mindful-dark)' }}>
            {/* === LOGO SECTION === */}
            <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2">
                <Image
                    src="/images/Logo.png"
                    alt="MindfulViscan Logo"
                    width={50}
                    height={50}
                    className="object-contain"
                />
            </div>

            {/* Dynamic Section: Changes based on auth state */}
            <div className="flex items-center gap-8">
                <SignedIn>
                    <div className="flex items-center gap-6 mr-4">
                        <a href="/counselor-dashboard" className="text-gray-300 hover:text-mindful-green transition-colors font-medium text-sm uppercase tracking-wider">
                            Dashboard
                        </a>
                        <a href="/counselor-dashboard/counseling" className="text-gray-300 hover:text-mindful-green transition-colors font-medium text-sm uppercase tracking-wider">
                            Counseling
                        </a>
                        <a href="/counselor-dashboard/resources" className="text-gray-300 hover:text-mindful-green transition-colors font-medium text-sm uppercase tracking-wider">
                            Resources
                        </a>
                    </div>
                    {/* User Profile Avatar */}
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "h-10 w-10",
                                userButtonPopoverCard: "bg-[#031207] border border-gray-700",
                                userButtonPopoverActionButton: "text-gray-200 hover:bg-mindful-green",
                            },
                        }}
                    />
                </SignedIn>

                <SignedOut>
                    <div className="text-sm text-gray-500">Counselor Portal</div>
                </SignedOut>
            </div>
        </nav>
    );
};

export default CounselorNavBar;
