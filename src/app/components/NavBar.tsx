'use client';

import React from 'react';
import Image from 'next/image';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Button from './Button';

const NavBar: React.FC = () => {
  return (
    <nav className="fixed top-0 w-full z-50 flex items-center px-2 py-2 text-white" style={{ backgroundColor: 'var(--color-mindful-dark)' }}>
      {/* === LOGO SECTION === */}
      <div className="cursor-pointer hover:opacity-80 transition-opacity">
        <Image
          src="/images/Logo.png"
          alt="MindfulViscan Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Dynamic Section: Changes based on auth state */}
      <div className="flex items-center gap-8">
        <SignedIn>
          {/* === STATE A: LOGGED IN (Student View) === */}
          <>
            <a href="/dashboard" className="hover:text-green-300 transition-colors font-medium">
              Dashboard
            </a>
            <a href="/counseling" className="hover:text-green-300 transition-colors font-medium">
              Counseling
            </a>
            <a href="/resources" className="hover:text-green-300 transition-colors font-medium">
              Resources
            </a>

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
          </>
        </SignedIn>

        <SignedOut>
          {/* === STATE B: GUEST (Public View) === */}
          <>
            <div className="space-x-8 text-sm font-medium opacity-80 hidden md:block">
            </div>

            <Button text="Login" href="/sign-in" className="hover:bg-mindful-green py-2 px-2 text-sm" />
            <Button text="Sign Up" href="/sign-up" className="hover:bg-mindful-green py-2 px-2 text-sm" />
          </>
        </SignedOut>
      </div>
    </nav>
  );
};

export default NavBar;