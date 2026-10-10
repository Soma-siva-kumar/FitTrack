import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { CloudStatusBadge } from './CloudStatusBadge';
import { Flame, Download, Menu, ShieldCheck } from 'lucide-react';

interface Props {
  onToggleSidebar?: () => void;
  onOpenCloudModal?: () => void;
}

export const Navbar: React.FC<Props> = ({ onToggleSidebar, onOpenCloudModal }) => {
  const { stats, exportDataToExcel } = useFitness();

  return (
    <header className="bg-charcoal-900/90 backdrop-blur-md border-b border-charcoal-800 h-16 sticky top-0 z-40 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Flame className="w-5 h-5 text-charcoal-950 fill-charcoal-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white">FitTrack</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                82
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Personal Six-Pack & Muscle Dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-850 border border-charcoal-800 text-xs text-amber-300 font-semibold">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{stats.streakDays} Day Streak</span>
        </div>

        {/* Cloud Status Badge */}
        <CloudStatusBadge onOpenSetup={onOpenCloudModal} />

        {/* Quick Excel Export button */}
        <button
          onClick={exportDataToExcel}
          title="Download complete .xlsx backup"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 hover:text-emerald-400 text-xs font-medium border border-charcoal-800 transition"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Export Excel</span>
        </button>

        {/* Vegetarian badge */}
        <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vegetarian • 50kg</span>
        </div>
      </div>
    </header>
  );
};
