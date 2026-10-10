import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { DailyTimetableCard } from '../components/schedule/DailyTimetableCard';
import { PlanConfigModal } from '../components/settings/PlanConfigModal';
import { formatDisplayDate } from '../utils/dateUtils';
import { RESEARCH_CITATIONS } from '../services/recommendationEngine';
import {
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  TrendingUp,
  Dumbbell,
  Utensils,
  Moon,
} from 'lucide-react';

export const DailySchedulePage: React.FC = () => {
  const { selectedDate, settings, stats } = useFitness();
  const [configModalOpen, setConfigModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Daily Morning-to-Evening Schedule</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Date: <span className="text-white font-semibold">{formatDisplayDate(selectedDate)}</span> • Day {stats.currentDay} of 82
            </p>
          </div>

          <button
            onClick={() => setConfigModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Customize Goal & Timings</span>
          </button>
        </div>

        {/* Quick Goal & Timetable Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Selected Goal</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 capitalize">
              {(settings.fitnessGoal || 'six_pack').replace('_', ' ')}
            </div>
            <span className="text-[10px] text-slate-400">Adaptive routine</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Workout Timing</span>
            <div className="text-sm font-bold text-cyan-400 mt-0.5 capitalize">
              {settings.preferredWorkoutTime || 'evening'} Session
            </div>
            <span className="text-[10px] text-slate-400">{settings.workoutDurationMin || 60} mins duration</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Daily Calories</span>
            <div className="text-sm font-bold text-amber-400 mt-0.5">{settings.calorieTarget} kcal</div>
            <span className="text-[10px] text-slate-400">{settings.calorieTargetMin}–{settings.calorieTargetMax} range</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Daily Protein</span>
            <div className="text-sm font-bold text-purple-400 mt-0.5">{settings.proteinTarget}g Protein</div>
            <span className="text-[10px] text-slate-400">ISSN 1.4–2.0 g/kg standard</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Daily Timetable */}
      <DailyTimetableCard onOpenPlanConfig={() => setConfigModalOpen(true)} />

      {/* Research-Backed Guidelines & Science Notes */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">
            Research-Backed Principles Behind Your Daily Schedule
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RESEARCH_CITATIONS.map((cite, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2 text-xs"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{cite.topic}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{cite.keyRule}</p>
              <span className="text-[10px] text-slate-400 block font-medium pt-1 border-t border-charcoal-800/60">
                Source: {cite.source}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Config Modal */}
      <PlanConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
};
