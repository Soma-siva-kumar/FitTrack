import React, { useState } from 'react';
import { ChallengeProgressCard } from '../components/dashboard/ChallengeProgressCard';
import { MetricCards } from '../components/dashboard/MetricCards';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import { QuickAddModal } from '../components/dashboard/QuickAddModal';
import { DailyTimetableCard } from '../components/schedule/DailyTimetableCard';
import { PlanConfigModal } from '../components/settings/PlanConfigModal';
import { Utensils, Droplets, Dumbbell, Scale, Plus, AlertCircle, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [quickAddModalOpen, setQuickAddModalOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'meal' | 'water' | 'weight' | 'workout'>('meal');
  const [planConfigModalOpen, setPlanConfigModalOpen] = useState(false);

  const handleOpenQuickAdd = (tab: 'meal' | 'water' | 'weight' | 'workout') => {
    setQuickAddTab(tab);
    setQuickAddModalOpen(true);
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Quick Action Floating Bar for fast entry */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-charcoal-900 border border-charcoal-800 shadow-md">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Quick Actions:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => handleOpenQuickAdd('meal')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-emerald-950/60 border border-charcoal-800 hover:border-emerald-700/60 text-slate-200 hover:text-emerald-300 text-xs font-medium transition"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Meal</span>
          </button>

          <button
            onClick={() => handleOpenQuickAdd('water')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-cyan-950/60 border border-charcoal-800 hover:border-cyan-700/60 text-slate-200 hover:text-cyan-300 text-xs font-medium transition"
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Water</span>
          </button>

          <button
            onClick={() => handleOpenQuickAdd('workout')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-amber-950/60 border border-charcoal-800 hover:border-amber-700/60 text-slate-200 hover:text-amber-300 text-xs font-medium transition"
          >
            <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Workout</span>
          </button>

          <button
            onClick={() => handleOpenQuickAdd('weight')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-purple-950/60 border border-charcoal-800 hover:border-purple-700/60 text-slate-200 hover:text-purple-300 text-xs font-medium transition"
          >
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Weight</span>
          </button>

          <Link
            to="/checkin"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Full Check-in</span>
          </Link>
        </div>
      </div>

      {/* 1. Challenge Timeline & Today's Workout Focus */}
      <ChallengeProgressCard />

      {/* 2. Key Metrics Grid */}
      <MetricCards onOpenQuickAdd={handleOpenQuickAdd} />

      {/* 3. Daily Morning-to-Evening Timetable */}
      <DailyTimetableCard onOpenPlanConfig={() => setPlanConfigModalOpen(true)} />

      {/* 4. Recharts Analytics */}
      <DashboardCharts />

      {/* 5. Realistic Educational & Safety Note */}
      <div className="p-4 rounded-xl bg-charcoal-900/60 border border-charcoal-800 text-xs text-slate-400 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-300">Sustainable Fitness Philosophy:</span>
          <p className="leading-relaxed">
            Targets (2,000–2,200 kcal, 70–85g protein) are provisional guidelines designed for beginner lean muscle gain at 50 kg baseline.
            Progress is driven by progressive resistance overload, sufficient protein distribution across meals, 8 hours of sleep, and consistency over the 82 days. Abdominal visibility is an outcome of overall body composition and strength, not extreme crash dieting.
          </p>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddModalOpen}
        onClose={() => setQuickAddModalOpen(false)}
        initialTab={quickAddTab}
      />

      {/* Plan & Goal Configuration Modal */}
      <PlanConfigModal
        isOpen={planConfigModalOpen}
        onClose={() => setPlanConfigModalOpen(false)}
      />
    </div>
  );
};
