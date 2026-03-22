import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';

export default function FailedAttempts() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
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

  function toggleExpand(id) {
    setExpandedId(expandedId === id ? null : id);
  }

  // Group attempts by the name combination to show photo records inline
  // Photo records have attempt_number = 0 and last_name = 'PHOTO_RECORD'
  const photoMap = {};
  const regularAttempts = [];
  for (const item of attempts) {
    if (item.attempt_number === 0 && item.last_name_attempted === 'PHOTO_RECORD') {
      // This is a photo record — key by first_name_attempted
      const key = item.first_name_attempted?.toLowerCase();
      if (key && !photoMap[key]) {
        photoMap[key] = item.photo;
      }
    } else {
      regularAttempts.push(item);
    }
  }

  // For each regular attempt, check if there's a matching photo
  function getPhotoForAttempt(attempt) {
    // Match on first_name_attempted (the first attempt name)
    const key = attempt.first_name_attempted?.toLowerCase();
    return photoMap[key] || null;
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
        {regularAttempts.length} attempt{regularAttempts.length !== 1 ? 's' : ''} · Most recent first
      </p>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm">Loading…</p>
        </div>
      ) : regularAttempts.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No failed attempts today.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {regularAttempts.map((attempt) => {
            const isExpanded = expandedId === attempt.id;
            const photo = getPhotoForAttempt(attempt);

            return (
              <div
                key={attempt.id}
                className="bg-white border border-wedding-border rounded-sm overflow-hidden"
              >
                {/* Row — clickable to expand */}
                <button
                  onClick={() => toggleExpand(attempt.id)}
                  className="w-full p-4 flex items-center justify-between text-left
                             hover:bg-stone-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Photo indicator */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${photo ? 'bg-wedding-black' : 'bg-stone-100'}`}>
                      {photo ? (
                        <Camera className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <span className="text-xs text-stone-400 font-medium">
                          {attempt.attempt_number}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-wedding-black font-medium">
                        {attempt.first_name_attempted} {attempt.last_name_attempted}
                      </p>
                      <p className="text-xs text-stone-400">
                        Attempt #{attempt.attempt_number} ·{' '}
                        {new Date(attempt.attempted_at).toLocaleTimeString('en-AU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {photo ? (
                    isExpanded
                      ? <ChevronUp className="w-4 h-4 text-stone-400" />
                      : <ChevronDown className="w-4 h-4 text-stone-400" />
                  ) : null}
                </button>

                {/* Expanded: show photo */}
                {isExpanded && photo && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <div className="bg-stone-50 rounded-sm p-4 text-center">
                      <img
                        src={photo}
                        alt={`Photo of guest who attempted: ${attempt.first_name_attempted}`}
                        className="w-40 h-40 object-cover rounded-full mx-auto border-2 border-wedding-border"
                      />
                      <p className="text-xs text-stone-400 mt-3">
                        Photo taken at check-in
                      </p>
                    </div>
                  </div>
                )}

                {/* Expanded: no photo */}
                {isExpanded && !photo && (
                  <div className="px-4 pb-4 animate-fade-in">
                    <p className="text-xs text-stone-400 text-center py-3">
                      No photo was taken for this attempt.
                    </p>
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
