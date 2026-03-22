import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Parses a time string into a Date object for today.
 * Supports both formats:
 *   - 24-hour: "14:20", "09:30"
 *   - 12-hour: "2:20 PM", "9:30 AM"
 */
function parseTimeToday(timeStr) {
  if (!timeStr) return null;

  const cleaned = timeStr.trim();

  // Try 12-hour format first: "2:30 PM"
  const match12 = cleaned.toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3];
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  }

  // Try 24-hour format: "14:20", "09:30"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    }
  }

  return null;
}

/**
 * Mark an agenda item as passed using raw fetch (bypasses JS client).
 */
async function markAsPassed(id) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/agenda?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ passed: true }),
      }
    );

    if (!res.ok) {
      console.error('Auto-mark failed for', id, ':', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Auto-mark error:', err);
    return false;
  }
}


export function useAgenda() {
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(true);
  const agendaRef = useRef([]);

  useEffect(() => {
    agendaRef.current = agenda;
  }, [agenda]);

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

  /* ── Auto-mark: retrospectively mark ALL events before current time ── */
  useEffect(() => {
    async function autoMarkAll() {
      const now = new Date();
      const currentAgenda = agendaRef.current;

      if (currentAgenda.length === 0) return;

      let anyUpdated = false;

      for (const item of currentAgenda) {
        // Skip items already marked
        if (item.passed) continue;

        // Compare against end_time first, then start_time
        const compareTime = parseTimeToday(item.end_time) || parseTimeToday(item.start_time);
        if (!compareTime) continue;

        // If current time is past this event's time, mark it
        if (now >= compareTime) {
          const success = await markAsPassed(item.id);
          if (success) anyUpdated = true;
        }
      }

      if (anyUpdated) {
        // Refetch to update the UI
        fetchAgenda();
      }
    }

    // Run 2 seconds after mount (wait for initial fetch)
    const initialTimer = setTimeout(autoMarkAll, 2000);

    // Then check every 30 seconds
    const interval = setInterval(autoMarkAll, 30_000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchAgenda]);

  /* ── CRUD ── */

  async function updateAgendaItem(id, updates) {
    try {
      const { error } = await supabase.from('agenda').update(updates).eq('id', id);
      if (error) { console.error('Error updating agenda:', error); return false; }
      return true;
    } catch (err) { console.error('Agenda update error:', err); return false; }
  }

  async function addAgendaItem(item) {
    try {
      const { error } = await supabase.from('agenda').insert(item);
      if (error) { console.error('Error adding agenda item:', error); return false; }
      return true;
    } catch (err) { console.error('Agenda add error:', err); return false; }
  }

  async function deleteAgendaItem(id) {
    try {
      const { error } = await supabase.from('agenda').delete().eq('id', id);
      if (error) { console.error('Error deleting agenda item:', error); return false; }
      return true;
    } catch (err) { console.error('Agenda delete error:', err); return false; }
  }

  async function togglePassed(id, currentPassed) {
    return updateAgendaItem(id, { passed: !currentPassed });
  }

  return {
    agenda, loading, fetchAgenda,
    updateAgendaItem, addAgendaItem, deleteAgendaItem, togglePassed,
  };
}
