import React from 'react';

/**
 * Primary button — solid black background, white text.
 */
export function PrimaryButton({ children, onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-wedding-black hover:bg-black text-white py-4 px-6 rounded-sm
                  font-medium text-sm tracking-widest uppercase shadow-lg
                  transition-all duration-200 border border-black
                  disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Secondary button — white background, dark border.
 */
export function SecondaryButton({ children, onClick, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-white hover:bg-stone-50 text-stone-800 py-3.5 px-6 rounded-sm
                  font-medium text-sm tracking-widest uppercase shadow-sm
                  transition-all duration-200 border border-stone-300
                  disabled:opacity-40 disabled:cursor-not-allowed
                  active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Ghost/text button — no background, subtle hover.
 */
export function GhostButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`text-stone-500 hover:text-wedding-black text-sm tracking-wide
                  transition-colors underline underline-offset-4 decoration-stone-300
                  hover:decoration-stone-500 ${className}`}
    >
      {children}
    </button>
  );
}
