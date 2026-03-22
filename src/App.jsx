import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Guest pages
import LandingPage from './components/guest/LandingPage';
import FindSeats from './components/guest/FindSeats';
import ThreeAttempts from './components/guest/ThreeAttempts';
import HelpPage from './components/guest/HelpPage';
import GuestPage from './components/guest/GuestPage';
import AgendaPage from './components/guest/AgendaPage';
import SharePhotos from './components/guest/SharePhotos';
import WeddingRegistry from './components/guest/WeddingRegistry';

// Admin pages
import AdminLogin from './components/admin/AdminLogin';
import AdminMain from './components/admin/AdminMain';
import GuestListView from './components/admin/GuestListView';
import ManageGuests from './components/admin/ManageGuests';
import FailedAttempts from './components/admin/FailedAttempts';
import EditTimeline from './components/admin/EditTimeline';

export default function App() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/find-seats" element={<FindSeats />} />
      <Route path="/find-seats/help-needed" element={<ThreeAttempts />} />
      <Route path="/find-seats/help" element={<HelpPage />} />
      <Route path="/guest" element={<GuestPage />} />
      <Route path="/agenda" element={<AgendaPage />} />
      <Route path="/photos" element={<SharePhotos />} />
      <Route path="/registry" element={<WeddingRegistry />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminMain />} />
      <Route path="/admin/guests" element={<GuestListView />} />
      <Route path="/admin/manage-guests" element={<ManageGuests />} />
      <Route path="/admin/failed-attempts" element={<FailedAttempts />} />
      <Route path="/admin/edit-timeline" element={<EditTimeline />} />
    </Routes>
  );
}
