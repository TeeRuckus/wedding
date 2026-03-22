import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BotanicalDecor from './BotanicalDecor';

/**
 * Persistent T & J monogram banner.
 * Route-aware: navigates to admin dashboard on admin pages,
 * guest landing page on guest pages.
 */
export default function Banner() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith('/admin');
  const homePath = isAdminPage ? '/admin/dashboard' : '/';

  return (
    <button
      onClick={() => navigate(homePath)}
      className="flex items-center justify-center gap-1 mx-auto mb-6 group focus:outline-none"
      aria-label={isAdminPage ? 'Return to admin dashboard' : 'Return to home'}
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
