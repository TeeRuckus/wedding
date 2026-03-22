import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import { PrimaryButton, SecondaryButton } from '../ui/Button';
import { sendFailedAttemptEmail, sendPhotoFollowUp } from '../../lib/email';

export default function ThreeAttempts() {
  const navigate = useNavigate();
  const location = useLocation();
  const attempts = location.state?.attempts || [];

  const [photoBase64, setPhotoBase64] = useState(null);
  const [attemptEmailSent, setAttemptEmailSent] = useState(false);
  const [photoEmailSent, setPhotoEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const hasSentRef = useRef(false);

  // Send ONE email on page load with the failed attempts (no photo)
  useEffect(() => {
    if (hasSentRef.current) return;
    hasSentRef.current = true;

    async function notifyCoordinator() {
      setSending(true);
      const success = await sendFailedAttemptEmail({ attempts });
      setAttemptEmailSent(success);
      setSending(false);
    }

    notifyCoordinator();
  }, []);

  async function startCamera() {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setShowCamera(false);
    }
  }

  async function capturePhoto() {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.7);
    setPhotoBase64(base64);

    stopCamera();

    // Send a SECOND email with the photo AND the attempts for context
    setSending(true);
    const success = await sendPhotoFollowUp({ photoBase64: base64, attempts });
    setPhotoEmailSent(success);
    setSending(false);
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <PageWrapper centered>
      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl p-10 border border-wedding-border
                      animate-fade-in text-center">
        <h2 className="text-2xl font-serif text-wedding-black mb-3 tracking-wider">
          DON'T WORRY
        </h2>
        <p className="text-stone-500 text-sm mb-6 leading-relaxed">
          We've notified the event coordinator.
          They'll be with you shortly to help find your seat.
        </p>

        {/* Notification status */}
        <div className={`p-4 rounded-sm mb-6 text-sm ${
          attemptEmailSent
            ? 'bg-green-50 border border-green-200 text-green-700'
            : sending && !attemptEmailSent
              ? 'bg-stone-50 border border-stone-200 text-stone-500'
              : !attemptEmailSent && !sending
                ? 'bg-red-50 border border-red-200 text-red-600'
                : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {sending && !attemptEmailSent && 'Notifying coordinator…'}
          {attemptEmailSent && 'Coordinator has been notified ✓'}
          {!sending && !attemptEmailSent && 'Could not send notification. Please find a coordinator nearby.'}
        </div>

        {/* Photo section */}
        <div className="mb-6">
          <p className="text-stone-500 text-xs mb-3 tracking-wide">
            Take a photo so the coordinator can find you
          </p>

          {showCamera && (
            <div className="relative rounded-sm overflow-hidden mb-3 animate-fade-in">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-sm"
              />
              <div className="flex gap-3 mt-3">
                <PrimaryButton onClick={capturePhoto}>
                  <Camera className="w-4 h-4 inline mr-2" />
                  Take Photo
                </PrimaryButton>
                <button
                  onClick={stopCamera}
                  className="p-3 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {photoBase64 && (
            <div className="mb-3 animate-fade-in">
              <img
                src={photoBase64}
                alt="Your photo"
                className="w-32 h-32 object-cover rounded-full mx-auto border-2 border-wedding-border"
              />
              {photoEmailSent && (
                <p className="text-xs text-green-600 mt-2">Photo sent to coordinator ✓</p>
              )}
              {sending && !photoEmailSent && (
                <p className="text-xs text-stone-400 mt-2">Sending photo…</p>
              )}
              {!sending && !photoEmailSent && photoBase64 && (
                <p className="text-xs text-red-500 mt-2">Photo could not be sent</p>
              )}
            </div>
          )}

          {!showCamera && !photoBase64 && (
            <SecondaryButton onClick={startCamera}>
              <Camera className="w-4 h-4 inline mr-2" />
              Open Camera
            </SecondaryButton>
          )}
        </div>

        <div className="space-y-3 mt-6">
          <PrimaryButton onClick={() => navigate('/find-seats/help')}>
            Help Is On The Way
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/')}>
            Back To Home
          </SecondaryButton>
        </div>
      </div>
    </PageWrapper>
  );
}
