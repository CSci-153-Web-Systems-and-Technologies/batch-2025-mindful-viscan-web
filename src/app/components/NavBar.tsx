'use client';

import React from 'react';
import Image from 'next/image';
import Button from './Button';

interface NavBarProps {
  isLoggedIn?: boolean; // Optional prop, defaults to false
}

const NavBar: React.FC<NavBarProps> = ({ isLoggedIn = false }) => {
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

      {/* Dynamic Section: Changes based on state */}
      <div className="flex items-center gap-8">
        {isLoggedIn ? (
          // === STATE A: LOGGED IN (Student View) ===
          <>
            <a href="/dashboard" className="hover:text-green-300 transition-colors font-medium">
              Dashboard
            </a>
            <a href="/resources" className="hover:text-green-300 transition-colors font-medium">
              Resources
            </a>
            
            {/* User Profile Avatar / Dropdown */}
            <div className="h-10 w-10 rounded-full bg-mindful-green flex items-center justify-center border-2 border-white/20 cursor-pointer hover:scale-105 transition-transform">
              <span className="font-bold text-sm">KV</span>
            </div>
          </>
        ) : (
          // === STATE B: GUEST (Public View) ===
          <>
             <div className="space-x-8 text-sm font-medium opacity-80 hidden md:block">
            </div>
            
            {/* You can even swap the button text dynamically */}
            <Button text="Login" onClick={() => console.log('Go to login')} className="py-2 px-2 text-sm" />
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;