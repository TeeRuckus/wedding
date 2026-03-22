import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Heart } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import BotanicalDecor from '../layout/BotanicalDecor';
import Toast from '../ui/Toast';

/**
 * Bank details are read from environment variables for security.
 * Set VITE_REGISTRY_BSB and VITE_REGISTRY_ACCOUNT in your .env file.
 */
const BSB = import.meta.env.VITE_REGISTRY_BSB || '---';
const ACCOUNT_NUMBER = import.meta.env.VITE_REGISTRY_ACCOUNT || '--------';
const ACCOUNT_NAME = import.meta.env.VITE_REGISTRY_ACCOUNT_NAME || 'T & J Wedding';

export default function WeddingRegistry() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  async function copyToClipboard(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${label} copied`);
    } catch {
      setToast('Could not copy — please copy manually');
    }
  }

  return (
    <PageWrapper>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Back</span>
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl p-10 border border-wedding-border
                      animate-fade-in text-center">
        <h2 className="text-3xl font-serif text-wedding-black mb-2 tracking-wider">
          WEDDING
        </h2>
        <h2 className="text-3xl font-serif text-wedding-black mb-6 tracking-wider">
          REGISTRY
        </h2>

        <Heart className="w-8 h-8 text-wedding-black mx-auto opacity-30 mb-8" />

        {/* Bank details */}
        <div className="space-y-4 mb-8">
          {/* Account Name */}
          <div className="bg-stone-50 border border-stone-200 rounded-sm p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1">
              Account Name
            </p>
            <p className="text-stone-700 font-medium tracking-wide text-lg">
              {ACCOUNT_NAME}
            </p>
          </div>

          {/* BSB */}
          <button
            onClick={() => copyToClipboard(BSB, 'BSB')}
            className="w-full bg-stone-50 border border-stone-200 rounded-sm p-4
                       hover:bg-stone-100 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                  BSB
                </p>
                <p className="text-stone-700 font-mono text-lg tracking-widest">
                  {BSB}
                </p>
              </div>
              <Copy className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </button>

          {/* Account Number */}
          <button
            onClick={() => copyToClipboard(ACCOUNT_NUMBER, 'Account number')}
            className="w-full bg-stone-50 border border-stone-200 rounded-sm p-4
                       hover:bg-stone-100 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1">
                  Account Number
                </p>
                <p className="text-stone-700 font-mono text-lg tracking-widest">
                  {ACCOUNT_NUMBER}
                </p>
              </div>
              <Copy className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* Gratitude message */}
        <div className="border-t border-wedding-border pt-8">
          <p className="text-stone-500 text-sm leading-relaxed">
            Your presence at our wedding is the greatest gift of all.
            For those who wish to contribute, we are deeply grateful
            for your generosity and kindness.
          </p>
          <p className="text-stone-400 text-sm mt-3 italic font-serif">
            With love, Tawana &amp; Joy
          </p>
        </div>

        <BotanicalDecor className="w-16 h-16 text-wedding-black mx-auto mt-8 opacity-20" />
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </PageWrapper>
  );
}
