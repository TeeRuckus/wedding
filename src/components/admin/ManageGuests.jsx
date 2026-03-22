import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';
import Input from '../ui/Input';
import { PrimaryButton, SecondaryButton } from '../ui/Button';
import { useAdmin } from '../../hooks/useAdmin';
import { validateName } from '../../lib/validation';

export default function ManageGuests() {
  const navigate = useNavigate();
  const { guests, fetchGuests, addGuest, removeGuest, loading } = useAdmin();
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formError, setFormError] = useState('');
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
  }

  async function handleAddGuest(e) {
    e.preventDefault();
    setFormError('');

    const firstVal = validateName(form.first_name);
    const lastVal = validateName(form.last_name);
    if (!firstVal.valid || !lastVal.valid) {
      setFormError(firstVal.message || lastVal.message);
      return;
    }
    if (!form.table_number || !form.seat_number) {
      setFormError('Table and seat numbers are required.');
      return;
    }

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
      setShowAddForm(false);
    } else {
      setFormError('Failed to add guest. Please try again.');
    }
  }

  async function handleRemoveGuest(guestId) {
    await removeGuest(guestId);
    setConfirmDelete(null);
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

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-serif text-wedding-black tracking-wider">
          MANAGE GUESTS
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 text-xs tracking-wide text-wedding-black
                     hover:text-black transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Guest'}
        </button>
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
            />
            <Input
              id="addLast"
              label="Last Name"
              value={form.last_name}
              onChange={(e) => updateForm('last_name', e.target.value)}
              placeholder="Last"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="tableNum"
              label="Table #"
              type="number"
              value={form.table_number}
              onChange={(e) => updateForm('table_number', e.target.value)}
              placeholder="1"
            />
            <Input
              id="seatNum"
              label="Seat #"
              type="number"
              value={form.seat_number}
              onChange={(e) => updateForm('seat_number', e.target.value)}
              placeholder="1"
            />
          </div>
          <Input
            id="seatDesc"
            label="Seat Description"
            value={form.seat_description}
            onChange={(e) => updateForm('seat_description', e.target.value)}
            placeholder="Near the dance floor, left side"
          />
          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
          )}
          <PrimaryButton type="submit" disabled={loading}>
            Add Guest
          </PrimaryButton>
        </form>
      )}

      {/* Guest list */}
      <div className="space-y-2">
        {guests.map((guest) => (
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
    </PageWrapper>
  );
}
