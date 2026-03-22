import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook encapsulating all admin-related database operations.
 */
export function useAdmin() {
  const [guests, setGuests] = useState([]);
  const [failedAttempts, setFailedAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch all guests from the database.
   */
  async function fetchGuests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('table_number', { ascending: true })
        .order('seat_number', { ascending: true });

      if (error) throw error;
      setGuests(data || []);
    } catch (err) {
      console.error('Error fetching guests:', err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Fetch all failed check-in attempts.
   */
  async function fetchFailedAttempts() {
    try {
      const { data, error } = await supabase
        .from('failed_attempts')
        .select('*')
        .order('attempted_at', { ascending: false });

      if (error) throw error;
      setFailedAttempts(data || []);
    } catch (err) {
      console.error('Error fetching failed attempts:', err);
    }
  }

  /**
   * Add a new guest to the database.
   */
  async function addGuest(guestData) {
    try {
      const { error } = await supabase.from('guests').insert(guestData);
      if (error) throw error;
      await fetchGuests();
      return true;
    } catch (err) {
      console.error('Error adding guest:', err);
      return false;
    }
  }

  /**
   * Remove a guest from the database.
   */
  async function removeGuest(guestId) {
    try {
      const { error } = await supabase.from('guests').delete().eq('id', guestId);
      if (error) throw error;
      await fetchGuests();
      return true;
    } catch (err) {
      console.error('Error removing guest:', err);
      return false;
    }
  }

  /**
   * Toggle check-in status for a guest.
   */
  async function toggleCheckIn(guestId, currentStatus) {
    try {
      const { error } = await supabase
        .from('guests')
        .update({
          checked_in: !currentStatus,
          checked_in_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', guestId);

      if (error) throw error;
      await fetchGuests();
      return true;
    } catch (err) {
      console.error('Error toggling check-in:', err);
      return false;
    }
  }

  // Derived data
  const checkedInGuests = guests.filter((g) => g.checked_in);
  const uncheckedGuests = guests.filter((g) => !g.checked_in);

  // Group guests by table
  const guestsByTable = guests.reduce((acc, guest) => {
    const table = guest.table_number;
    if (!acc[table]) acc[table] = [];
    acc[table].push(guest);
    return acc;
  }, {});

  return {
    guests,
    checkedInGuests,
    uncheckedGuests,
    guestsByTable,
    failedAttempts,
    loading,
    fetchGuests,
    fetchFailedAttempts,
    addGuest,
    removeGuest,
    toggleCheckIn,
  };
}
