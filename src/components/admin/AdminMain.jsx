import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, UserCheck, UserX, UserPlus, AlertTriangle, Calendar, LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PageWrapper from '../layout/PageWrapper';
import { useAdmin } from '../../hooks/useAdmin';

export default function AdminMain() {
  const navigate = useNavigate();
  const { guests, checkedInGuests, uncheckedGuests, failedAttempts, fetchGuests, fetchFailedAttempts, loading } = useAdmin();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchGuests();
    fetchFailedAttempts();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin');
      return;
    }
    setUser(session.user);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin');
  }

  // Count only real failed attempts (not photo records)
  const realFailedCount = failedAttempts.filter((a) => a.attempt_number > 0).length;

  const menuItems = [
    {
      label: 'Checked In Guests',
      description: `${checkedInGuests.length} of ${guests.length} guests`,
      icon: UserCheck,
      path: '/admin/guests?filter=checked-in',
      color: 'text-green-600',
    },
    {
      label: 'Not Checked In',
      description: `${uncheckedGuests.length} guests waiting`,
      icon: UserX,
      path: '/admin/guests?filter=unchecked',
      color: 'text-stone-500',
    },
    {
      label: 'Full Guest List',
      description: `${guests.length} total guests`,
      icon: Users,
      path: '/admin/guests?filter=all',
      color: 'text-wedding-black',
    },
    {
      label: 'Add / Remove Guests',
      description: 'Manage the guest list',
      icon: UserPlus,
      path: '/admin/manage-guests',
      color: 'text-blue-600',
    },
    {
      label: 'Failed Attempts',
      description: 'View check-in issues',
      icon: AlertTriangle,
      path: '/admin/failed-attempts',
      color: 'text-amber-600',
    },
    {
      label: 'Edit Event Timeline',
      description: 'Update agenda & times',
      icon: Calendar,
      path: '/admin/edit-timeline',
      color: 'text-purple-600',
    },
  ];

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif text-wedding-black tracking-wider">
            ADMIN
          </h2>
          <p className="text-stone-400 text-xs tracking-wide">
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-stone-400 hover:text-red-500 transition-colors text-xs tracking-wide"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Stats summary — all clickable */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/failed-attempts')}
          className="bg-white rounded-sm border border-amber-200 p-4 text-center
                     hover:border-amber-400 active:scale-[0.97] transition-all"
        >
          <p className="text-2xl font-serif text-amber-600">{realFailedCount}</p>
          <p className="text-[9px] tracking-[0.15em] uppercase text-stone-400 mt-1">Failed</p>
        </button>
        <button
          onClick={() => navigate('/admin/guests?filter=checked-in')}
          className="bg-white rounded-sm border border-green-200 p-4 text-center
                     hover:border-green-400 active:scale-[0.97] transition-all"
        >
          <p className="text-2xl font-serif text-green-600">{checkedInGuests.length}</p>
          <p className="text-[9px] tracking-[0.15em] uppercase text-stone-400 mt-1">Checked In</p>
        </button>
        <button
          onClick={() => navigate('/admin/guests?filter=unchecked')}
          className="bg-white rounded-sm border border-wedding-border p-4 text-center
                     hover:border-stone-400 active:scale-[0.97] transition-all"
        >
          <p className="text-2xl font-serif text-stone-500">{uncheckedGuests.length}</p>
          <p className="text-[9px] tracking-[0.15em] uppercase text-stone-400 mt-1">Waiting</p>
        </button>
      </div>

      {/* Menu grid */}
      <div className="space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full bg-white rounded-sm border border-wedding-border p-5
                         flex items-center gap-4 hover:border-stone-300 transition-colors
                         active:scale-[0.99] text-left"
            >
              <div className={`p-2.5 rounded-sm bg-stone-50 ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-wedding-black tracking-wide">
                  {item.label}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </PageWrapper>
  );
}
