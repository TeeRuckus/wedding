import React from 'react';
import Banner from './Banner';
import BotanicalDecor from './BotanicalDecor';

/**
 * Wraps every page in a consistent layout with:
 * - Background gradient
 * - Ambient botanical decorations
 * - T&J banner (home link)
 * - Centered content container
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.showBanner=true] - Whether to show the T&J banner
 * @param {boolean} [props.centered=false] - Vertically center content
 * @param {boolean} [props.noPadding=false] - Remove default padding
 */
export default function PageWrapper({
  children,
  showBanner = true,
  centered = false,
  noPadding = false,
}) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-amber-50/60 via-white to-stone-50/60
                  relative overflow-hidden ${centered ? 'flex flex-col items-center justify-center' : ''}
                  ${noPadding ? '' : 'px-5 py-8'}`}
    >
      {/* Ambient botanical decorations */}
      <BotanicalDecor className="absolute top-6 right-6 w-28 h-28 text-stone-800 opacity-[0.12] pointer-events-none" />
      <BotanicalDecor className="absolute bottom-6 left-6 w-28 h-28 text-stone-800 opacity-[0.12] rotate-180 pointer-events-none" />
      <BotanicalDecor className="absolute top-1/3 left-8 w-20 h-20 text-stone-700 opacity-[0.08] rotate-45 pointer-events-none" />
      <BotanicalDecor className="absolute bottom-1/3 right-8 w-20 h-20 text-stone-700 opacity-[0.08] -rotate-45 pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto w-full">
        {showBanner && <Banner />}
        {children}
      </div>
    </div>
  );
}
