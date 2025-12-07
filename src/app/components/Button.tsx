'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  href?: string; // For client-side navigation
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ text, onClick, href, className = '' }) => {
  const router = useRouter();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (href) {
      e.preventDefault();
      router.push(href);
      return;
    }
    if (onClick) onClick();
  };
  
  const baseClasses = 'text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-95';
  const defaultPadding = 'py-2 px-4';
  
  const hasPadding = className.includes('py-') || className.includes('px-');
  const hasTextSize = className.includes('text-');
  
  const finalClasses = `${baseClasses} ${hasPadding ? '' : defaultPadding} ${className}`;
  
  return (
    <button 
      onClick={handleClick}
      className={finalClasses}
    >
      {text}
    </button>
  );
};

export default Button;