import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import FloorPlan from './FloorPlan';
import BotanicalDecor from '../layout/BotanicalDecor';
import { PrimaryButton, SecondaryButton } from '../ui/Button';

export default function GuestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const guest = location.state?.guest;

  if (!guest) {
    return (
      <PageWrapper centered>
        <div className="text-center p-10">
          <p className="text-stone-500 mb-4">No guest data found.</p>
          <PrimaryButton onClick={() => navigate('/find-seats')}>
            Find Your Seat
          </PrimaryButton>
        </div>
      </PageWrapper>
    );
  }

  // Parse tablemates — stored as a JSON array in the database
  const tablemates = Array.isArray(guest.tablemates)
    ? guest.tablemates
    : typeof guest.tablemates === 'string'
      ? JSON.parse(guest.tablemates || '[]')
      : [];

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Home</span>
      </button>

      <div className="bg-white/90 backdrop-blur-sm rounded-sm shadow-2xl border border-wedding-border
                      animate-fade-in overflow-hidden">
        {/* Welcome header */}
        <div className="p-8 text-center border-b border-wedding-border">
          <p className="text-stone-400 text-xs tracking-[0.2em] uppercase mb-2">Welcome</p>
          <h2 className="text-3xl font-serif text-wedding-black tracking-wider">
            {guest.salutation ? `${guest.salutation} ` : ''}
            {guest.first_name} {guest.last_name}
          </h2>
          <p className="text-stone-400 text-sm mt-1 italic font-serif">
            We're so glad you're here
          </p>
        </div>

        {/* Table assignment */}
        <div className="p-8 text-center border-b border-wedding-border">
          <div className="bg-wedding-black text-white rounded-sm p-8 mb-4">
            <p className="text-stone-300 text-[10px] tracking-[0.25em] uppercase mb-3">
              Your Table
            </p>
            <div className="text-6xl font-serif mb-1">
              {guest.table_number}
            </div>
            <p className="text-stone-300 text-xs tracking-wide">
              Seat {guest.seat_number}
            </p>
          </div>

          <p className="text-stone-500 text-sm italic leading-relaxed">
            {guest.seat_description}
          </p>
        </div>

        {/* Floor plan */}
        <div className="p-6 border-b border-wedding-border">
          <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 text-center mb-4">
            Venue Map.
          </p>
          <FloorPlan
            highlightTable={guest.table_number}
            highlightSeat={guest.seat_number}
          />
          <p className="text-stone-400 text-xs text-center mt-3 italic">
            {guest.seat_description}
          </p>
        </div>

        {/* Tablemates */}
        {tablemates.length > 0 && (
          <div className="p-8 border-b border-wedding-border text-center">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-4">
              You're Seated With
            </p>
            <div className="space-y-1.5">
              {tablemates.map((name, i) => (
                <p key={i} className="text-stone-600 text-sm">{name}</p>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-8 space-y-3">
          <PrimaryButton onClick={() => navigate('/agenda')}>
            View Event Agenda
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate('/photos')}>
            Share Your Photos
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate('/registry')}>
            Wedding Registry
          </SecondaryButton>
        </div>

        <BotanicalDecor className="w-16 h-16 text-wedding-black mx-auto mb-8 opacity-20" />
      </div>
    </PageWrapper>
  );
}
