import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Generates a signed URL for a Storage file via raw fetch.
 */
async function getSignedUrl(filename) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/sign/guest-photos/${filename}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 60 * 60 * 24 }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.signedURL
      ? `${SUPABASE_URL}/storage/v1${data.signedURL}`
      : null;
  } catch {
    return null;
  }
}


export default function FailedAttempts() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [photoUrls, setPhotoUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  async function checkAuthAndFetch() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
      return;
    }
    fetchAttempts();
  }

  async function fetchAttempts() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('failed_attempts')
        .select('*')
        .order('attempted_at', { ascending: false });

      if (error) {
        console.error('Error fetching failed attempts:', error);
        return;
      }

      setAttempts(data || []);
    } catch (err) {
      console.error('Failed attempts fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Separate photo records (attempt_number = 0 with photo_filename) from regular attempts
  const photoRecords = attempts.filter(
    (a) => a.attempt_number === 0 && a.photo_filename
  );
  const regularAttempts = attempts.filter((a) => a.attempt_number > 0);

  /**
   * Match a regular attempt to a photo by timestamp proximity.
   * A photo is taken seconds after the 3rd failed attempt, so we find
   * the closest photo record within a 5-minute window.
   */
  function findPhotoForAttempt(attempt) {
    if (attempt.attempt_number !== 3) return null;

    const attemptTime = new Date(attempt.attempted_at).getTime();

    let bestMatch = null;
    let bestDiff = Infinity;

    for (const photo of photoRecords) {
      const photoTime = new Date(photo.attempted_at).getTime();
      const diff = photoTime - attemptTime;

      // Photo must be AFTER the attempt, within 5 minutes
      if (diff >= 0 && diff < 5 * 60 * 1000 && diff < bestDiff) {
        bestDiff = diff;
        bestMatch = photo;
      }
    }

    return bestMatch;
  }

  // Build a map: attempt_id → photo record (for attempt #3 rows only)
  const photoMap = {};
  for (const attempt of regularAttempts) {
    const photo = findPhotoForAttempt(attempt);
    if (photo) {
      photoMap[attempt.id] = photo;
    }
  }

  /**
   * Load signed URL when expanding a row with a photo.
   */
  async function handleExpand(attemptId) {
    if (expandedId === attemptId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(attemptId);

    const photoRecord = photoMap[attemptId];
    if (photoRecord?.photo_filename && !photoUrls[attemptId]) {
      const url = await getSignedUrl(photoRecord.photo_filename);
      if (url) {
        setPhotoUrls((prev) => ({ ...prev, [attemptId]: url }));
      }
    }
  }

  // Group attempts by guest (consecutive attempts with same first+last name)
  // This makes the list cleaner — show one card per guest, not three
  const grouped = [];
  let currentGroup = null;

  for (const attempt of regularAttempts) {
    const key = `${attempt.first_name_attempted}-${attempt.last_name_attempted}`.toLowerCase();

    if (currentGroup && currentGroup.key === key) {
      currentGroup.attempts.push(attempt);
      if (attempt.attempt_number > currentGroup.maxAttempt) {
        currentGroup.maxAttempt = attempt.attempt_number;
        currentGroup.lastAttempt = attempt;
      }
    } else {
      currentGroup = {
        key,
        firstName: attempt.first_name_attempted,
        lastName: attempt.last_name_attempted,
        attempts: [attempt],
        maxAttempt: attempt.attempt_number,
        lastAttempt: attempt,
        // Use the earliest attempt's timestamp for display
        time: attempt.attempted_at,
      };
      grouped.push(currentGroup);
    }
  }

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mb-4 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Dashboard</span>
      </button>

      <h2 className="text-xl font-serif text-wedding-black tracking-wider mb-1">
        FAILED ATTEMPTS
      </h2>
      <p className="text-xs text-stone-400 tracking-wide mb-4">
        {grouped.length} guest{grouped.length !== 1 ? 's' : ''} · Most recent first
      </p>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm">Loading…</p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No failed attempts today.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map((group) => {
            // Check if the 3rd attempt has a linked photo
            const thirdAttempt = group.attempts.find((a) => a.attempt_number === 3);
            const hasPhoto = thirdAttempt && !!photoMap[thirdAttempt.id];
            const isExpanded = expandedId === (thirdAttempt?.id || group.lastAttempt.id);
            const expandKey = thirdAttempt?.id || group.lastAttempt.id;
            const photoUrl = photoUrls[expandKey];

            return (
              <div
                key={group.key + group.time}
                className="bg-white border border-wedding-border rounded-sm overflow-hidden"
              >
                {/* Row — clickable */}
                <button
                  onClick={() => handleExpand(expandKey)}
                  className="w-full p-4 flex items-center justify-between text-left
                             hover:bg-stone-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${hasPhoto ? 'bg-wedding-black' : 'bg-stone-100'}`}>
                      {hasPhoto ? (
                        <Camera className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <span className="text-xs text-stone-400 font-medium">
                          {group.maxAttempt}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-wedding-black font-medium">
                        {group.firstName} {group.lastName}
                      </p>
                      <p className="text-xs text-stone-400">
                        {group.maxAttempt} attempt{group.maxAttempt !== 1 ? 's' : ''} ·{' '}
                        {new Date(group.time).toLocaleTimeString('en-AU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-stone-400" />
                    : <ChevronDown className="w-4 h-4 text-stone-400" />
                  }
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 animate-fade-in space-y-3">
                    {/* Individual attempts */}
                    <div className="space-y-1">
                      {group.attempts
                        .sort((a, b) => a.attempt_number - b.attempt_number)
                        .map((a) => (
                          <div key={a.id} className="flex items-center gap-2 text-xs text-stone-500">
                            <span className="w-5 text-stone-300">#{a.attempt_number}</span>
                            <span>{a.first_name_attempted} {a.last_name_attempted}</span>
                            <span className="text-stone-300 ml-auto">
                              {new Date(a.attempted_at).toLocaleTimeString('en-AU', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* Photo */}
                    {hasPhoto ? (
                      <div className="bg-stone-50 rounded-sm p-4 text-center">
                        {photoUrl ? (
                          <>
                            <img
                              src={photoUrl}
                              alt={`Photo of guest: ${group.firstName} ${group.lastName}`}
                              className="w-40 h-40 object-cover rounded-full mx-auto border-2 border-wedding-border"
                            />
                            <p className="text-xs text-stone-400 mt-3">
                              Photo taken at check-in
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-stone-400 py-3">Loading photo…</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-400 text-center py-2">
                        No photo was taken.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
