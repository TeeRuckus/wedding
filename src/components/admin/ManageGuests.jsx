import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';
import Input from '../ui/Input';
import { PrimaryButton } from '../ui/Button';
import { useAdmin } from '../../hooks/useAdmin';
import {
  validateName,
  validateTableNumber,
  validateSeatNumber,
} from '../../lib/validation';

export default function ManageGuests() {
  const navigate = useNavigate();
  const { guests, fetchGuests, addGuest, removeGuest, loading } = useAdmin();
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    salutation: '',
    first_name: '',
    last_name: '',
    table_number: '',
    seat_number: '',
    seat_description: '',
  });

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

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }

  async function handleAddGuest(e) {
    e.preventDefault();

    const firstVal = validateName(form.first_name);
    const lastVal = validateName(form.last_name);
    const tableVal = validateTableNumber(form.table_number);
    const seatVal = validateSeatNumber(form.seat_number);

    const errors = {};
    if (!firstVal.valid) errors.first_name = firstVal.message;
    if (!lastVal.valid) errors.last_name = lastVal.message;
    if (!tableVal.valid) errors.table_number = tableVal.message;
    if (!seatVal.valid) errors.seat_number = seatVal.message;

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const success = await addGuest({
      salutation: form.salutation.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      table_number: parseInt(form.table_number),
      seat_number: parseInt(form.seat_number),
      seat_description: form.seat_description.trim(),
      checked_in: false,
      tablemates: [],
    });

    if (success) {
      setForm({
        salutation: '', first_name: '', last_name: '',
        table_number: '', seat_number: '', seat_description: '',
      });
      setFormErrors({});
      setShowAddForm(false);
    } else {
      setFormErrors({ submit: 'Failed to add guest. Please try again.' });
    }
  }

  async function handleRemoveGuest(guestId) {
    await removeGuest(guestId);
    setConfirmDelete(null);
  }

  // Filter guests by search query (name or table number)
  const filteredGuests = search.trim()
    ? guests.filter((g) => {
        const q = search.toLowerCase().trim();
        return (
          `${g.first_name} ${g.last_name}`.toLowerCase().includes(q) ||
          String(g.table_number).includes(q)
        );
      })
    : guests;

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mb-4 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Dashboard</span>
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-wedding-black tracking-wider">
          MANAGE GUESTS
        </h2>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setFormErrors({}); }}
          className="flex items-center gap-1.5 text-xs tracking-wide text-wedding-black
                     hover:text-black transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Guest'}
        </button>
      </div>

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

      {/* Add guest form */}
      {showAddForm && (
        <form onSubmit={handleAddGuest} className="bg-white border border-wedding-border rounded-sm p-5 mb-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="salutation"
              label="Title"
              value={form.salutation}
              onChange={(e) => updateForm('salutation', e.target.value)}
              placeholder="Mr/Mrs"
            />
            <Input
              id="addFirst"
              label="First Name"
              value={form.first_name}
              onChange={(e) => updateForm('first_name', e.target.value)}
              placeholder="First"
              error={formErrors.first_name}
            />
            <Input
              id="addLast"
              label="Last Name"
              value={form.last_name}
              onChange={(e) => updateForm('last_name', e.target.value)}
              placeholder="Last"
              error={formErrors.last_name}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="tableNum"
              label="Table #"
              type="number"
              value={form.table_number}
              onChange={(e) => updateForm('table_number', e.target.value)}
              placeholder="1–14"
              error={formErrors.table_number}
            />
            <Input
              id="seatNum"
              label="Seat #"
              type="number"
              value={form.seat_number}
              onChange={(e) => updateForm('seat_number', e.target.value)}
              placeholder="1–12"
              error={formErrors.seat_number}
            />
          </div>
          <Input
            id="seatDesc"
            label="Seat Description"
            value={form.seat_description}
            onChange={(e) => updateForm('seat_description', e.target.value)}
            placeholder="Near the dance floor, left side"
          />
          {formErrors.submit && (
            <p className="text-xs text-red-500">{formErrors.submit}</p>
          )}
          <PrimaryButton type="submit" disabled={loading}>
            Add Guest
          </PrimaryButton>
        </form>
      )}

      {/* Guest count */}
      <p className="text-xs text-stone-400 tracking-wide mb-3">
        {filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''}
        {search.trim() && ` matching "${search.trim()}"`}
      </p>

      {/* Guest list */}
      <div className="space-y-2">
        {filteredGuests.map((guest) => (
          <div key={guest.id} className="bg-white border border-wedding-border rounded-sm p-4
                                         flex items-center justify-between">
            <div>
              <p className="text-sm text-wedding-black font-medium">
                {guest.salutation && `${guest.salutation} `}
                {guest.first_name} {guest.last_name}
              </p>
              <p className="text-xs text-stone-400">
                Table {guest.table_number} · Seat {guest.seat_number}
              </p>
            </div>

            {confirmDelete === guest.id ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRemoveGuest(guest.id)}
                  className="text-xs px-3 py-1.5 rounded-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-xs px-2 py-1.5 text-stone-400 hover:text-stone-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(guest.id)}
                className="p-2 text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <div className="text-center py-8">
          <p className="text-stone-400 text-sm">
            {search.trim() ? 'No guests match your search.' : 'No guests yet.'}
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
