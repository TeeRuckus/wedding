import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import BotanicalDecor from '../layout/BotanicalDecor';
import { useAgenda } from '../../hooks/useAgenda';

export default function AgendaPage() {
  const navigate = useNavigate();
  const { agenda, loading } = useAgenda();

  return (
    <PageWrapper>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Back</span>
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl p-8 border border-wedding-border
                      animate-fade-in">
        <h2 className="text-3xl font-serif text-center mb-1 text-wedding-black tracking-wider">
          EVENT AGENDA
        </h2>
        <p className="text-center text-stone-400 text-xs tracking-[0.15em] uppercase mb-8">
          Timeline of our special day
        </p>

        {loading ? (
          <div className="text-center py-8">
            <Clock className="w-6 h-6 text-stone-300 mx-auto animate-spin" />
            <p className="text-stone-400 text-sm mt-3">Loading agenda…</p>
          </div>
        ) : agenda.length === 0 ? (
          <p className="text-center text-stone-400 text-sm py-8">
            The agenda will be posted soon.
          </p>
        ) : (
          <div className="space-y-3">
            {agenda.map((item, index) => (
              <div
                key={item.id || index}
                className={`flex items-start gap-4 p-4 rounded-sm transition-all border
                  animate-fade-in ${item.passed
                    ? 'bg-stone-50/50 text-stone-400 border-stone-100'
                    : 'bg-white text-stone-800 border-stone-200'
                  }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Time column */}
                <div className={`font-medium text-sm min-w-[85px] tracking-wide ${
                  item.passed ? 'text-stone-300' : 'text-wedding-black'
                }`}>
                  {item.start_time}
                  {item.end_time && (
                    <span className="text-stone-400 text-xs block">
                      – {item.end_time}
                    </span>
                  )}
                </div>

                {/* Event name */}
                <div className="flex-1">
                  <p className={`font-medium text-sm ${
                    item.passed ? 'line-through text-stone-400' : ''
                  }`}>
                    {item.event_name}
                  </p>
                </div>

                {/* Active indicator */}
                {!item.passed && index === agenda.findIndex(a => !a.passed) && (
                  <div className="w-2 h-2 rounded-full bg-wedding-black animate-pulse-soft mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-stone-400 text-[10px] mt-8 italic tracking-wide">
          Times are subject to change
        </p>

        <BotanicalDecor className="w-16 h-16 text-wedding-black mx-auto mt-6 opacity-20" />
      </div>
    </PageWrapper>
  );
}
