import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Heart, Mic } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import BotanicalDecor from '../layout/BotanicalDecor';
import Toast from '../ui/Toast';

const BSB = import.meta.env.VITE_REGISTRY_BSB || '---';
const ACCOUNT_NUMBER = import.meta.env.VITE_REGISTRY_ACCOUNT || '--------';
const ACCOUNT_NAME = import.meta.env.VITE_REGISTRY_ACCOUNT_NAME || 'T & J Wedding';

/**
 * Reusable copyable field — tapping copies value to clipboard.
 */
function CopyableField({ label, value, onCopy }) {
  return (
    <button
      onClick={() => onCopy(value, label)}
      className="w-full bg-stone-50 border border-stone-200 rounded-sm p-4
                 hover:bg-stone-100 transition-colors text-left group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-1">
            {label}
          </p>
          <p className="text-stone-700 font-mono text-lg tracking-widest">
            {value}
          </p>
        </div>
        <Copy className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
      </div>
    </button>
  );
}


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

        {/* Bank details — all fields copyable */}
        <div className="space-y-4 mb-8">
          <CopyableField
            label="Account Name"
            value={ACCOUNT_NAME}
            onCopy={copyToClipboard}
          />

          <CopyableField
            label="BSB"
            value={BSB}
            onCopy={copyToClipboard}
          />

          <CopyableField
            label="Account Number"
            value={ACCOUNT_NUMBER}
            onCopy={copyToClipboard}
          />
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

        {/* Audio guest book section */}
        <div className="border-t border-wedding-border mt-8 pt-8">
          <div className="w-14 h-14 rounded-full bg-stone-50 border border-stone-200
                          mx-auto mb-4 flex items-center justify-center">
            <Mic className="w-6 h-6 text-wedding-black opacity-50" />
          </div>

          <h3 className="text-lg font-serif text-wedding-black tracking-wider mb-2">
            AUDIO GUEST BOOK
          </h3>

          <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
            We have an audio guest book set up at the venue — look for
            it near the wishing well. We would absolutely love it if
            you could leave us a message.
          </p>

          <p className="text-stone-400 text-xs mt-3 italic leading-relaxed max-w-xs mx-auto">
            Share a piece of advice, a favourite memory, or simply
            tell us how much fun you're having. Your words mean
            the world to us.
          </p>
        </div>

        <BotanicalDecor className="w-16 h-16 text-wedding-black mx-auto mt-8 opacity-20" />
      </div>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </PageWrapper>
  );
}
