import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';
import { useAdmin } from '../../hooks/useAdmin';

export default function FailedAttempts() {
  const navigate = useNavigate();
  const { failedAttempts, fetchFailedAttempts } = useAdmin();

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  async function checkAuthAndFetch() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
      return;
    }
    fetchFailedAttempts();
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

      <h2 className="text-xl font-serif text-wedding-black tracking-wider mb-4">
        FAILED ATTEMPTS
      </h2>

      {failedAttempts.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No failed attempts today.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {failedAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="bg-white border border-wedding-border rounded-sm p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-wedding-black font-medium">
                    "{attempt.first_name_attempted} {attempt.last_name_attempted}"
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Attempt #{attempt.attempt_number}
                  </p>
                </div>
                <p className="text-[10px] text-stone-400 tracking-wide">
                  {new Date(attempt.attempted_at).toLocaleTimeString('en-AU', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
