import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import Input from '../ui/Input';
import { PrimaryButton } from '../ui/Button';
import { useGuest } from '../../hooks/useGuest';
import { validateName, sanitiseName } from '../../lib/validation';

const MAX_ATTEMPTS = 3;

export default function FindSeats() {
  const navigate = useNavigate();
  const { findGuest, checkInGuest, logFailedAttempt, loading, error, setError } = useGuest();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({ first: '', last: '' });
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [foundGuest, setFoundGuest] = useState(null);

  /**
   * Reset the form so the next guest gets a fresh set of 3 attempts.
   * Called after a successful check-in or when navigating to the guest page.
   */
  function resetForm() {
    setFirstName('');
    setLastName('');
    setAttempts([]);
    setFieldErrors({ first: '', last: '' });
    setAlreadyCheckedIn(false);
    setFoundGuest(null);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate inputs
    const firstValidation = validateName(firstName);
    const lastValidation = validateName(lastName);
    if (!firstValidation.valid || !lastValidation.valid) {
      setFieldErrors({
        first: firstValidation.valid ? '' : firstValidation.message,
        last: lastValidation.valid ? '' : lastValidation.message,
      });
      return;
    }
    setFieldErrors({ first: '', last: '' });

    const cleanFirst = sanitiseName(firstName);
    const cleanLast = sanitiseName(lastName);
    const attemptString = `${cleanFirst} ${cleanLast}`;
    const newAttempts = [...attempts, attemptString];
    setAttempts(newAttempts);

    const guest = await findGuest(cleanFirst, cleanLast);

    if (!guest) {
      // Log the failed attempt
      await logFailedAttempt(cleanFirst, cleanLast, newAttempts.length);

      // If max attempts reached, go to the help flow
      if (newAttempts.length >= MAX_ATTEMPTS) {
        navigate('/find-seats/help-needed', {
          state: { attempts: newAttempts },
        });
      }
      return;
    }

    // Guest found — check if already checked in
    if (guest.checked_in) {
      setAlreadyCheckedIn(true);
      setFoundGuest(guest);
      return;
    }

    // Check in, reset form for next guest, and navigate to guest page
    await checkInGuest(guest.id);
    resetForm();
    navigate('/guest', { state: { guest } });
  }

  function handleGoToGuestPage() {
    if (foundGuest) {
      resetForm();
      navigate('/guest', { state: { guest: foundGuest } });
    }
  }

  const remainingAttempts = MAX_ATTEMPTS - attempts.length;

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Back</span>
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl p-10 border border-wedding-border
                      animate-fade-in">
        <h2 className="text-3xl font-serif text-center mb-1 text-wedding-black tracking-wider">
          YOUR SEAT
        </h2>
        <h2 className="text-3xl font-serif text-center mb-8 text-wedding-black tracking-wider">
          AWAITS
        </h2>

        {/* Already checked in modal */}
        {alreadyCheckedIn && (
          <div className="mb-6 p-6 bg-stone-50 border border-stone-200 rounded-sm text-center animate-fade-in">
            <p className="text-stone-700 font-medium mb-1">You have already checked in.</p>
            <p className="text-stone-500 text-sm mb-4">
              Welcome back, {foundGuest?.first_name}!
            </p>
            <PrimaryButton onClick={handleGoToGuestPage}>
              View Your Seat
            </PrimaryButton>
          </div>
        )}

        {!alreadyCheckedIn && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="firstName"
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              error={fieldErrors.first}
              autoComplete="given-name"
            />

            <Input
              id="lastName"
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              error={fieldErrors.last}
              autoComplete="family-name"
            />

            {error && (
              <p className="text-sm text-red-500 text-center animate-fade-in">
                {error}
              </p>
            )}

            {attempts.length > 0 && remainingAttempts > 0 && (
              <p className="text-xs text-stone-400 text-center tracking-wide">
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </p>
            )}

            <PrimaryButton type="submit" disabled={loading}>
              {loading ? 'Looking you up…' : 'Find My Seat'}
            </PrimaryButton>
          </form>
        )}
      </div>
    </PageWrapper>
  );
}
