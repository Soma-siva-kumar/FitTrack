import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  Scale,
  Activity,
  CheckCircle2,
} from 'lucide-react';

const mobileNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/food', label: 'Food', icon: Utensils },
  { path: '/workouts', label: 'Workout', icon: Dumbbell },
  { path: '/weight', label: 'Weight', icon: Scale },
  { path: '/abs', label: 'Abs', icon: Activity },
  { path: '/checkin', label: 'Check-in', icon: CheckCircle2 },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-charcoal-900/95 backdrop-blur-lg border-t border-charcoal-800 h-16 z-40 px-2 flex items-center justify-around shadow-2xl">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-emerald-500/15' : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
