import React from 'react';

/**
 * Decorative botanical leaf motif.
 * The "J" in the T&J monogram is represented by this botanical detail.
 */
export default function BotanicalDecor({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main stem */}
      <path
        d="M60 10 Q58 30, 55 50 Q54 70, 52 90"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.9"
      />
      {/* Left leaves */}
      <ellipse cx="45" cy="25" rx="8" ry="12" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.85" transform="rotate(-25 45 25)" />
      <ellipse cx="42" cy="45" rx="7" ry="10" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.85" transform="rotate(-30 42 45)" />
      <ellipse cx="38" cy="65" rx="9" ry="13" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.85" transform="rotate(-20 38 65)" />
      {/* Right leaves */}
      <ellipse cx="68" cy="20" rx="7" ry="11" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.85" transform="rotate(30 68 20)" />
      <ellipse cx="70" cy="38" rx="8" ry="12" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.85" transform="rotate(25 70 38)" />
      <ellipse cx="72" cy="58" rx="6" ry="9" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.85" transform="rotate(35 72 58)" />
      {/* Berry accents */}
      <circle cx="50" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.75" />
      <circle cx="65" cy="30" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.75" />
      <circle cx="48" cy="70" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.75" />
    </svg>
  );
}
