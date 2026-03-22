import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Users, ChevronDown, ChevronUp } from 'lucide-react';
import PageWrapper from '../layout/PageWrapper';
import FloorPlan from './FloorPlan';
import BotanicalDecor from '../layout/BotanicalDecor';
import { PrimaryButton, SecondaryButton } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export default function GuestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const guest = location.state?.guest;

  const [showTablemates, setShowTablemates] = useState(false);
  const [tablemates, setTablemates] = useState([]);
  const [loadingTablemates, setLoadingTablemates] = useState(false);

  // Fetch tablemates from the database when the section is opened
  useEffect(() => {
    if (!showTablemates || !guest?.table_number) return;
    if (tablemates.length > 0) return; // already fetched

    async function fetchTablemates() {
      setLoadingTablemates(true);
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('id, salutation, first_name, last_name, seat_number')
          .eq('table_number', guest.table_number)
          .neq('id', guest.id)
          .order('seat_number', { ascending: true });

        if (!error && data) {
          setTablemates(data);
        }
      } catch (err) {
        console.error('Error fetching tablemates:', err);
      } finally {
        setLoadingTablemates(false);
      }
    }

    fetchTablemates();
  }, [showTablemates, guest]);

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
            Venue Map
          </p>
          <FloorPlan
            highlightTable={guest.table_number}
            highlightSeat={guest.seat_number}
          />
          <p className="text-stone-400 text-xs text-center mt-3 italic">
            {guest.seat_description}
          </p>
        </div>

        {/* Tablemates section — toggleable */}
        <div className="border-b border-wedding-border">
          <button
            onClick={() => setShowTablemates(!showTablemates)}
            className="w-full p-6 flex items-center justify-between hover:bg-stone-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-stone-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-wedding-black">Your Tablemates</p>
                <p className="text-xs text-stone-400">
                  See who's at Table {guest.table_number}
                </p>
              </div>
            </div>
            {showTablemates
              ? <ChevronUp className="w-4 h-4 text-stone-400" />
              : <ChevronDown className="w-4 h-4 text-stone-400" />
            }
          </button>

          {showTablemates && (
            <div className="px-6 pb-6 animate-fade-in">
              {loadingTablemates ? (
                <p className="text-xs text-stone-400 text-center py-4">Loading…</p>
              ) : tablemates.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No tablemates found yet.</p>
              ) : (
                <div className="space-y-2">
                  {tablemates.map((mate) => (
                    <div
                      key={mate.id}
                      className="flex items-center justify-between bg-stone-50 rounded-sm px-4 py-3"
                    >
                      <p className="text-sm text-stone-700">
                        {mate.salutation ? `${mate.salutation} ` : ''}
                        {mate.first_name} {mate.last_name}
                      </p>
                      <p className="text-xs text-stone-400">Seat {mate.seat_number}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
