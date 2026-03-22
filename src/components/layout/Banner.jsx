import React from 'react';
import { useNavigate } from 'react-router-dom';
import BotanicalDecor from './BotanicalDecor';

/**
 * Persistent banner displayed on every page.
 * The T & botanical-J monogram acts as a home button.
 */
export default function Banner() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center justify-center gap-1 mx-auto mb-6 group focus:outline-none"
      aria-label="Return to home"
    >
      <span className="text-3xl font-serif text-wedding-black tracking-wider
                       group-hover:opacity-70 transition-opacity">
        T
      </span>
      <BotanicalDecor className="w-8 h-8 text-wedding-black opacity-70
                                 group-hover:opacity-50 transition-opacity" />
      <span className="text-3xl font-serif text-wedding-black tracking-wider
                       group-hover:opacity-70 transition-opacity">
        J
      </span>
    </button>
  );
}
