'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Button from './Button';

const NavBar: React.FC = () => {
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
          {/* === STATE A: LOGGED IN (Student View) === */}
          <div className="flex items-center gap-6 mr-4">
            <Link href="/dashboard" className="text-gray-300 hover:text-mindful-green transition-colors font-medium text-sm uppercase tracking-wider">
              Dashboard
            </Link>
            <Link href="/counseling" className="text-gray-300 hover:text-mindful-green transition-colors font-medium text-sm uppercase tracking-wider">
              Counseling
            </Link>
            <Link href="/mood-tracking" className="text-gray-300 hover:text-mindful-green transition-colors font-medium text-sm uppercase tracking-wider">
              Mood Tracking
            </Link>
            <Link href="/resources" className="text-gray-300 hover:text-mindful-green transition-colors font-medium text-sm uppercase tracking-wider">
              Resources
            </Link>
          </div>

          {/* User Profile Avatar / Dropdown */}
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
          {/* === STATE B: GUEST (Public View) === */}
          <div className="flex items-center gap-4">
            <Button text="Login" href="/sign-in" className="hover:bg-mindful-green py-2 px-4 text-sm bg-transparent border border-gray-600" />
            <Button text="Sign Up" href="/sign-up" className="hover:bg-mindful-green py-2 px-4 text-sm bg-mindful-green text-white" />
          </div>
        </SignedOut>
      </div>
    </nav>
  );
};

export default NavBar;