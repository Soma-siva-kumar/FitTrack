import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { DateHeader } from './components/common/DateHeader';
import { Toast } from './components/common/Toast';
import { CloudSetupModal } from './components/settings/CloudSetupModal';
import { DashboardPage } from './pages/DashboardPage';
import { CheckinPage } from './pages/CheckinPage';
import { FoodPage } from './pages/FoodPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { AbsPage } from './pages/AbsPage';
import { MeasurementsPage } from './pages/MeasurementsPage';
import { WeightTrackerPage } from './pages/WeightTrackerPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFitness } from './context/FitnessContext';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const { isLoading } = useFitness();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center animate-pulse">
          <span className="text-charcoal-950 font-black text-xl">82</span>
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading FitTrack 82...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCloudModal={() => setCloudModalOpen(true)}
      />

      {/* Date Header Switcher */}
      <DateHeader />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/checkin" element={<CheckinPage />} />
            <Route path="/food" element={<FoodPage />} />
            <Route path="/workouts" element={<WorkoutPage />} />
            <Route path="/abs" element={<AbsPage />} />
            <Route path="/weight" element={<WeightTrackerPage />} />
            <Route path="/measurements" element={<MeasurementsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Toast Notifications */}
      <Toast />

      {/* Cloud Setup Modal */}
      <CloudSetupModal
        isOpen={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
      />
    </div>
  );
};
