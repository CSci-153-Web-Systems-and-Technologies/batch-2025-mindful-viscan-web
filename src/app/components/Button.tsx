'use client';

import React from 'react';

interface ButtonProps {
  text: string;
  onClick?: () => void; // Optional: Makes the button clickable but not required for UI testing
  className?: string;   // Optional: Lets you override styles if needed later
}

const Button: React.FC<ButtonProps> = ({ text, onClick, className = '' }) => {
  // Do not force background in the base classes so callers can override it via `className`.
  const baseClasses = 'text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-95';
  const defaultPadding = 'py-2 px-4';
  
  // Check if custom className includes padding or text size, if not use defaults
  const hasPadding = className.includes('py-') || className.includes('px-');
  const hasTextSize = className.includes('text-');
  
  const finalClasses = `${baseClasses} ${hasPadding ? '' : defaultPadding} ${className}`;
  
  return (
    <button 
      onClick={onClick}
      className={finalClasses}
    >
      {text}
    </button>
  );
};

export default Button;