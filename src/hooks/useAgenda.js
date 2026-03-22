import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Parses a time string like "2:30 PM" into a Date object for today.
 * Returns null if parsing fails.
 */
function parseTimeToday(timeStr) {
  if (!timeStr) return null;

  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
}

/**
 * Hook that fetches and subscribes to real-time agenda updates.
 *
 * Features:
 * - Real-time sync via Supabase channel (no page refresh needed)
 * - Auto-marks events as "passed" when the current time exceeds their end_time
 *   (or start_time if no end_time is set). Runs every 30 seconds.
 */
export function useAgenda() {
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgenda = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('agenda')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching agenda:', error);
        return;
      }

      setAgenda(data || []);
    } catch (err) {
      console.error('Agenda fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Real-time subscription ── */
  useEffect(() => {
    fetchAgenda();

    const channel = supabase
      .channel('agenda-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agenda' },
        () => fetchAgenda()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAgenda]);

  /* ── Auto-mark timer (every 30 seconds) ── */
  useEffect(() => {
    async function autoMarkPassed() {
      const now = new Date();

      for (const item of agenda) {
        if (item.passed) continue;

        // Use end_time if available, otherwise fall back to start_time
        const compareTime = parseTimeToday(item.end_time) || parseTimeToday(item.start_time);
        if (!compareTime) continue;

        if (now >= compareTime) {
          await supabase
            .from('agenda')
            .update({ passed: true })
            .eq('id', item.id);
        }
      }
    }

    // Run immediately, then every 30 seconds
    autoMarkPassed();
    const interval = setInterval(autoMarkPassed, 30_000);

    return () => clearInterval(interval);
  }, [agenda]);

  /* ── CRUD operations ── */

  async function updateAgendaItem(id, updates) {
    try {
      const { error } = await supabase
        .from('agenda')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating agenda:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Agenda update error:', err);
      return false;
    }
  }

  async function addAgendaItem(item) {
    try {
      const { error } = await supabase.from('agenda').insert(item);
      if (error) {
        console.error('Error adding agenda item:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Agenda add error:', err);
      return false;
    }
  }

  async function deleteAgendaItem(id) {
    try {
      const { error } = await supabase.from('agenda').delete().eq('id', id);
      if (error) {
        console.error('Error deleting agenda item:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Agenda delete error:', err);
      return false;
    }
  }

  /**
   * Toggle an event's passed status (mark / unmark).
   */
  async function togglePassed(id, currentPassed) {
    return updateAgendaItem(id, { passed: !currentPassed });
  }

  return {
    agenda,
    loading,
    fetchAgenda,
    updateAgendaItem,
    addAgendaItem,
    deleteAgendaItem,
    togglePassed,
  };
}
