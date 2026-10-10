import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckCircle2,
  Utensils,
  Dumbbell,
  Activity,
  Scale,
  Ruler,
  BarChart3,
  Settings,
  X,
  Calendar,
} from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/checkin', label: 'Daily Check-in', icon: CheckCircle2 },
  { path: '/food', label: 'Food Tracker', icon: Utensils },
  { path: '/workouts', label: 'Workout Planner', icon: Dumbbell },
  { path: '/abs', label: 'Abs Tracker', icon: Activity },
  { path: '/weight', label: 'Weight Tracker', icon: Scale },
  { path: '/measurements', label: 'Body Measurements', icon: Ruler },
  { path: '/reports', label: 'Reports & Charts', icon: BarChart3 },
  { path: '/settings', label: 'Settings & Cloud', icon: Settings },
];

export const Sidebar: React.FC<Props> = ({ isOpen, onClose }) => {
  const { stats } = useFitness();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-4rem)] w-64 bg-charcoal-900 border-r border-charcoal-800 z-50 transition-transform duration-200 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col flex-1 overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-charcoal-800 md:hidden">
            <span className="font-bold text-white text-base">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-charcoal-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-950'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-charcoal-850'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Mini Challenge Progress widget in sidebar */}
          <div className="mt-6 p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Challenge Day
              </span>
              <span className="text-emerald-400 font-bold">
                {stats.currentDay} / 82
              </span>
            </div>
            <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.currentDay / 82) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>{stats.daysCompleted} logged</span>
              <span>{stats.daysRemaining} remaining</span>
            </div>
          </div>
        </div>

        {/* Footer profile tag */}
        <div className="p-4 border-t border-charcoal-800 text-xs text-slate-400 flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-300">82-Day Six-Pack</div>
            <div className="text-[10px] text-slate-400">Oct 11 – Dec 31, 2026</div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-charcoal-800 text-emerald-400 font-bold">
            v1.0
          </span>
        </div>
      </aside>
    </>
  );
};
