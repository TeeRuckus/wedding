import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../layout/PageWrapper';
import BotanicalDecor from '../layout/BotanicalDecor';
import { PrimaryButton, SecondaryButton } from '../ui/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper showBanner={false} centered>
      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl p-10 border border-wedding-border
                      animate-fade-in">
        {/* T & J Monogram */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center">
            <span className="text-6xl font-serif text-wedding-black tracking-wider leading-none">
              T
            </span>
            <BotanicalDecor className="w-14 h-14 text-wedding-black opacity-60 my-1" />
            <span className="text-6xl font-serif text-wedding-black tracking-wider leading-none">
              J
            </span>
          </div>
        </div>

        {/* Scripture */}
        <p className="text-center text-stone-500 text-[10px] mb-1 tracking-[0.2em] uppercase">
          For I Have Found The One My
        </p>
        <p className="text-center text-stone-500 text-[10px] mb-3 tracking-[0.2em] uppercase">
          Soul Loves
        </p>
        <p className="text-center text-stone-400 text-[10px] mb-8 italic font-serif">
          Song of Solomon 3:4
        </p>

        {/* Heading */}
        <h1 className="text-4xl font-serif text-center mb-2 text-wedding-black tracking-wider">
          WELCOME
        </h1>
        <p className="text-center text-stone-500 text-xs tracking-[0.25em] uppercase mb-3">
          to the wedding of
        </p>

        <h2 className="text-5xl font-serif text-center mb-1 text-wedding-black tracking-wider">
          TAWANA
        </h2>
        <p className="text-center text-xl italic text-stone-400 mb-1 font-serif">
          &amp;
        </p>
        <h2 className="text-5xl font-serif text-center mb-10 text-wedding-black tracking-wider">
          JOY
        </h2>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <PrimaryButton onClick={() => navigate('/find-seats')}>
            Find Your Seats
          </PrimaryButton>

          <SecondaryButton onClick={() => navigate('/agenda')}>
            View The Agenda
          </SecondaryButton>

          <SecondaryButton onClick={() => navigate('/photos')}>
            Share Your Photos
          </SecondaryButton>
        </div>

        <BotanicalDecor className="w-20 h-20 text-wedding-black mx-auto mt-8 opacity-30" />
      </div>
    </PageWrapper>
  );
}
