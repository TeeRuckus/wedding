import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import BotanicalDecor from '../layout/BotanicalDecor';
import { SecondaryButton } from '../ui/Button';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper centered>
      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl p-10 border border-wedding-border
                      animate-fade-in text-center">
        <h2 className="text-3xl font-serif text-wedding-black mb-2 tracking-wider">
          HELP IS ON
        </h2>
        <h2 className="text-3xl font-serif text-wedding-black mb-6 tracking-wider">
          THE WAY
        </h2>

        <BotanicalDecor className="w-12 h-12 text-wedding-black mx-auto opacity-30 mb-6" />

        {/* Coordinator photo placeholder */}
        <div className="w-28 h-28 rounded-full bg-stone-100 border-2 border-wedding-border mx-auto mb-4
                        flex items-center justify-center">
            <img
              src="/coordinator.png"
              alt="Event Coordinator"
              className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-wedding-border"
            />
        </div>
        <p className="text-stone-600 font-medium text-sm mb-1">Event Coordinator</p>
        <p className="text-stone-400 text-xs mb-8 tracking-wide">Look for them in the venue</p>

        <div className="bg-stone-50 border border-stone-200 rounded-sm p-6 mb-8 text-left">
          <p className="text-stone-600 text-sm leading-relaxed">
            Our event coordinator has been notified and is on their way to help
            you find your seat. Please stay near the entrance area so they can
            locate you easily.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mt-3">
            If you spot them first, don't hesitate to approach. They're here to
            make sure you have a wonderful evening.
          </p>
        </div>

        <SecondaryButton onClick={() => navigate('/')}>
          Back To Home
        </SecondaryButton>
      </div>
    </PageWrapper>
  );
}
