import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save, Edit2, X,
  Check, RotateCcw, Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';
import Input from '../ui/Input';
import { PrimaryButton, SecondaryButton } from '../ui/Button';
import { useAgenda } from '../../hooks/useAgenda';

export default function EditTimeline() {
  const navigate = useNavigate();
  const {
    agenda, loading, fetchAgenda,
    updateAgendaItem, addAgendaItem, deleteAgendaItem, togglePassed,
  } = useAgenda();

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ start_time: '', end_time: '', event_name: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ start_time: '', end_time: '', event_name: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
    }
  }

  function startEditing(item) {
    setEditingId(item.id);
    setEditForm({
      start_time: item.start_time || '',
      end_time: item.end_time || '',
      event_name: item.event_name || '',
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    const success = await updateAgendaItem(editingId, editForm);
    if (success) setEditingId(null);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newItem.event_name.trim() || !newItem.start_time.trim()) return;

    const maxOrder = agenda.reduce((max, item) => Math.max(max, item.sort_order || 0), 0);
    const success = await addAgendaItem({
      ...newItem,
      sort_order: maxOrder + 1,
      passed: false,
    });

    if (success) {
      setNewItem({ start_time: '', end_time: '', event_name: '' });
      setShowAddForm(false);
    }
  }

  async function handleDelete(id) {
    await deleteAgendaItem(id);
  }

  async function handleMove(id, direction) {
    const index = agenda.findIndex((item) => item.id === id);
    if (index < 0) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= agenda.length) return;

    const current = agenda[index];
    const swap = agenda[swapIndex];

    await updateAgendaItem(current.id, { sort_order: swap.sort_order });
    await updateAgendaItem(swap.id, { sort_order: current.sort_order });
    await fetchAgenda();
  }

  const passedCount = agenda.filter((a) => a.passed).length;

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mb-4 flex items-center gap-2 text-stone-500 hover:text-wedding-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs tracking-[0.15em] uppercase font-medium">Dashboard</span>
      </button>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-serif text-wedding-black tracking-wider">
          EDIT TIMELINE
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 text-xs tracking-wide text-wedding-black"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {/* Auto-mark info */}
      <div className="flex items-center gap-2 mb-4 text-stone-400">
        <Clock className="w-3.5 h-3.5" />
        <p className="text-[10px] tracking-wide">
          Events are auto-marked as passed based on current time.
          {passedCount > 0 && ` (${passedCount} of ${agenda.length} done)`}
        </p>
      </div>

      {/* Add new event form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white border border-wedding-border rounded-sm p-5 mb-4 space-y-3 animate-fade-in"
        >
          <Input
            id="newEventName"
            label="Event Name"
            value={newItem.event_name}
            onChange={(e) => setNewItem((p) => ({ ...p, event_name: e.target.value }))}
            placeholder="Ceremony Begins"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="newStartTime"
              label="Start Time"
              value={newItem.start_time}
              onChange={(e) => setNewItem((p) => ({ ...p, start_time: e.target.value }))}
              placeholder="14:30"
            />
            <Input
              id="newEndTime"
              label="End Time"
              value={newItem.end_time}
              onChange={(e) => setNewItem((p) => ({ ...p, end_time: e.target.value }))}
              placeholder="15:00"
            />
          </div>
          <PrimaryButton type="submit">
            Add Event
          </PrimaryButton>
        </form>
      )}

      {/* Agenda items */}
      <div className="space-y-2">
        {agenda.map((item, index) => (
          <div
            key={item.id}
            className={`bg-white border rounded-sm overflow-hidden transition-all ${
              item.passed ? 'border-green-200 bg-green-50/30' : 'border-wedding-border'
            }`}
          >
            {editingId === item.id ? (
              /* ── Edit mode ── */
              <div className="p-4 space-y-3 animate-fade-in">
                <Input
                  id={`edit-name-${item.id}`}
                  label="Event"
                  value={editForm.event_name}
                  onChange={(e) => setEditForm((p) => ({ ...p, event_name: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    id={`edit-start-${item.id}`}
                    label="Start"
                    value={editForm.start_time}
                    onChange={(e) => setEditForm((p) => ({ ...p, start_time: e.target.value }))}
                  />
                  <Input
                    id={`edit-end-${item.id}`}
                    label="End"
                    value={editForm.end_time}
                    onChange={(e) => setEditForm((p) => ({ ...p, end_time: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <PrimaryButton onClick={saveEdit} className="flex-1">
                    <Save className="w-4 h-4 inline mr-1" /> Save
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setEditingId(null)} className="flex-1">
                    Cancel
                  </SecondaryButton>
                </div>
              </div>
            ) : (
              /* ── Display mode ── */
              <div className="p-4 flex items-center gap-3">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMove(item.id, 'up')}
                    disabled={index === 0}
                    className="text-stone-300 hover:text-stone-600 disabled:opacity-20 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(item.id, 'down')}
                    disabled={index === agenda.length - 1}
                    className="text-stone-300 hover:text-stone-600 disabled:opacity-20 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    item.passed ? 'line-through text-stone-400' : 'text-wedding-black'
                  }`}>
                    {item.event_name}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {item.start_time}
                    {item.end_time ? ` – ${item.end_time}` : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Toggle passed — same button, different state */}
                  <button
                    onClick={() => togglePassed(item.id, item.passed)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-sm border transition-colors ${
                      item.passed
                        ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                        : 'text-green-600 border-green-200 hover:bg-green-50'
                    }`}
                    title={item.passed ? 'Unmark — event not yet done' : 'Mark — event is done'}
                  >
                    {item.passed ? (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        Undo
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        Done
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => startEditing(item)}
                    className="p-1.5 text-stone-300 hover:text-stone-600 transition-colors"
                    title="Edit event"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-stone-300 hover:text-red-500 transition-colors"
                    title="Delete event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {agenda.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm">No agenda items yet.</p>
        </div>
      )}
    </PageWrapper>
  );
}
