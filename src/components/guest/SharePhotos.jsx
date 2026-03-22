import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, ExternalLink } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import BotanicalDecor from '../layout/BotanicalDecor';
import { PrimaryButton, SecondaryButton } from '../ui/Button';

export default function SharePhotos() {
  const navigate = useNavigate();
  const photoUrl = import.meta.env.VITE_PHOTO_SHARE_URL || '#';

  function handleOpenPhotoLink() {
    if (photoUrl && photoUrl !== '#') {
      window.open(photoUrl, '_blank', 'noopener,noreferrer');
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
          SHARE YOUR
        </h2>
        <h2 className="text-3xl font-serif text-wedding-black mb-6 tracking-wider">
          NIGHT WITH US
        </h2>

        <BotanicalDecor className="w-12 h-12 text-wedding-black mx-auto opacity-30 mb-8" />

        {/* Camera icon — clickable */}
        <button
          onClick={handleOpenPhotoLink}
          className="w-24 h-24 rounded-full bg-wedding-black mx-auto flex items-center justify-center
                     hover:bg-black transition-colors shadow-xl mb-6
                     active:scale-95 transform"
          aria-label="Open photo sharing"
        >
          <Camera className="w-10 h-10 text-white" />
        </button>

        <p className="text-stone-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
          Capture the moments and share your favourite photos from tonight.
          Every snapshot helps us relive this beautiful day.
        </p>

        <PrimaryButton onClick={handleOpenPhotoLink}>
          <ExternalLink className="w-4 h-4 inline mr-2" />
          Open Photo Album
        </PrimaryButton>

        <div className="mt-8">
          <SecondaryButton onClick={() => navigate('/')}>
            Back To Home
          </SecondaryButton>
        </div>

        <BotanicalDecor className="w-16 h-16 text-wedding-black mx-auto mt-8 opacity-20" />
      </div>
    </PageWrapper>
  );
}
