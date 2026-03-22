import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, UserCheck, UserX, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';
import { useAdmin } from '../../hooks/useAdmin';

export default function GuestListView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const { guests, guestsByTable, fetchGuests, toggleCheckIn, loading } = useAdmin();
  const [viewMode, setViewMode] = useState('guest'); // 'guest' or 'table'
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  async function checkAuthAndFetch() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
      return;
    }
    fetchGuests();
  }

  // Apply filter
  let filteredGuests = guests;
  if (filter === 'checked-in') {
    filteredGuests = guests.filter((g) => g.checked_in);
  } else if (filter === 'unchecked') {
    filteredGuests = guests.filter((g) => !g.checked_in);
  }

  // Apply search
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filteredGuests = filteredGuests.filter(
      (g) =>
        `${g.first_name} ${g.last_name}`.toLowerCase().includes(q) ||
        String(g.table_number).includes(q)
    );
  }

  // Group filtered guests by table for table view
  const filteredByTable = filteredGuests.reduce((acc, guest) => {
    const table = guest.table_number;
    if (!acc[table]) acc[table] = [];
    acc[table].push(guest);
    return acc;
  }, {});

  const filterLabels = {
    all: 'All Guests',
    'checked-in': 'Checked In',
    unchecked: 'Not Checked In',
  };

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
        {filterLabels[filter] || 'Guests'}
      </h2>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or table number…"
          className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-sm bg-white
                     text-sm text-stone-700 placeholder:text-stone-300
                     focus:outline-none focus:border-wedding-black transition-colors"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {Object.entries(filterLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 text-xs tracking-wide rounded-sm border transition-colors ${
              filter === key
                ? 'bg-wedding-black text-white border-wedding-black'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* View mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-stone-400 tracking-wide">
          {filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setViewMode(viewMode === 'guest' ? 'table' : 'guest')}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-wedding-black transition-colors"
        >
          {viewMode === 'guest' ? (
            <ToggleLeft className="w-4 h-4" />
          ) : (
            <ToggleRight className="w-4 h-4" />
          )}
          {viewMode === 'guest' ? 'Guest View' : 'Table View'}
        </button>
      </div>

      {/* Guest View */}
      {viewMode === 'guest' && (
        <div className="space-y-2">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="bg-white border border-wedding-border rounded-sm p-4
                         flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                  ${guest.checked_in ? 'bg-green-50 text-green-600' : 'bg-stone-50 text-stone-400'}`}>
                  {guest.checked_in ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm text-wedding-black font-medium">
                    {guest.first_name} {guest.last_name}
                  </p>
                  <p className="text-xs text-stone-400">
                    Table {guest.table_number} · Seat {guest.seat_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleCheckIn(guest.id, guest.checked_in)}
                className={`text-xs px-3 py-1.5 rounded-sm border transition-colors ${
                  guest.checked_in
                    ? 'text-red-500 border-red-200 hover:bg-red-50'
                    : 'text-green-600 border-green-200 hover:bg-green-50'
                }`}
              >
                {guest.checked_in ? 'Undo' : 'Check In'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          {Object.entries(filteredByTable)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([tableNum, tableGuests]) => {
              const checkedCount = tableGuests.filter((g) => g.checked_in).length;
              const totalForTable = guestsByTable[tableNum]?.length || tableGuests.length;
              return (
                <div key={tableNum} className="bg-white border border-wedding-border rounded-sm overflow-hidden">
                  <div className="px-4 py-3 bg-stone-50 border-b border-wedding-border
                                  flex items-center justify-between">
                    <p className="text-sm font-medium text-wedding-black">
                      Table {tableNum}
                    </p>
                    <p className="text-xs text-stone-400">
                      {checkedCount}/{totalForTable} checked in
                    </p>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {tableGuests.map((guest) => (
                      <div key={guest.id} className="px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            guest.checked_in ? 'bg-green-500' : 'bg-stone-200'
                          }`} />
                          <span className="text-sm text-stone-700">
                            {guest.first_name} {guest.last_name}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400">Seat {guest.seat_number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {filteredGuests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm">No guests found.</p>
        </div>
      )}
    </PageWrapper>
  );
}
