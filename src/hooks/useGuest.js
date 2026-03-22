import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { normaliseForLookup } from '../lib/validation';

/**
 * Hook encapsulating all guest-related database operations.
 */
export function useGuest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guest, setGuest] = useState(null);

  /**
   * Look up a guest by first and last name.
   * Uses case-insensitive comparison via ilike.
   *
   * NOTE: Uses .limit(1) instead of .single() because .single()
   * returns a 406 when zero rows match, which is a normal "not found"
   * case — not an error.
   */
  async function findGuest(firstName, lastName) {
    setLoading(true);
    setError(null);

    const normFirst = normaliseForLookup(firstName);
    const normLast = normaliseForLookup(lastName);

    try {
      const { data, error: dbError } = await supabase
        .from('guests')
        .select('*')
        .ilike('first_name', normFirst)
        .ilike('last_name', normLast)
        .limit(1);

      if (dbError) {
        setError('Something went wrong. Please try again.');
        console.error('Guest lookup error:', dbError);
        setGuest(null);
        return null;
      }

      // .limit(1) returns an array — check if it has a result
      if (!data || data.length === 0) {
        setError('Guest not found. Please check your name and try again.');
        setGuest(null);
        return null;
      }

      const found = data[0];
      setGuest(found);
      return found;
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Guest lookup error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Mark a guest as checked in.
   */
  async function checkInGuest(guestId) {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('guests')
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq('id', guestId);

      if (updateError) {
        console.error('Check-in error:', updateError);
        return false;
      }

      setGuest((prev) => (prev ? { ...prev, checked_in: true } : prev));
      return true;
    } catch (err) {
      console.error('Check-in error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Log a failed attempt to the failed_attempts table.
   */
  async function logFailedAttempt(firstName, lastName, attemptNumber) {
    try {
      await supabase.from('failed_attempts').insert({
        first_name_attempted: firstName.trim(),
        last_name_attempted: lastName.trim(),
        attempt_number: attemptNumber,
        attempted_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to log attempt:', err);
    }
  }

  function clearGuest() {
    setGuest(null);
    setError(null);
  }

  return {
    guest,
    loading,
    error,
    findGuest,
    checkInGuest,
    logFailedAttempt,
    clearGuest,
    setError,
  };
}
