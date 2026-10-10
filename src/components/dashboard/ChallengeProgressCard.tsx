import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { formatDisplayDate, getChallengeDayNumber } from '../../utils/dateUtils';
import { Flame, Trophy, Calendar, CheckCircle2, Dumbbell } from 'lucide-react';

export const ChallengeProgressCard: React.FC = () => {
  const { stats, currentWorkoutPlan, selectedDate, dailyProgress } = useFitness();
  const dayNumber = getChallengeDayNumber(selectedDate);
  const progressPercent = Math.min(100, Math.round((stats.currentDay / 82) * 100));

  return (
    <div className="card-elevated p-5 space-y-4">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              82-Day Six-Pack & Muscle Transformation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
            Day {dayNumber} of 82
          </h2>
          <p className="text-xs text-slate-400">
            {formatDisplayDate(selectedDate)}
          </p>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{stats.streakDays} Day Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>{stats.daysCompleted} / 82 Done</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Timeline Progress ({stats.currentDay} / 82 days)
          </span>
          <span className="text-white font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-charcoal-800 h-3 rounded-full overflow-hidden p-0.5 border border-charcoal-700/50">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-300 rounded-full transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Kickoff: Oct 11, 2026</span>
          <span className="text-emerald-400 font-medium">{stats.daysRemaining} days remaining</span>
          <span>Finale: Dec 31, 2026</span>
        </div>
      </div>

      {/* Today's Workout Schedule Spotlight */}
      <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-charcoal-800 text-emerald-400 mt-0.5">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Workout Focus
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  currentWorkoutPlan?.isRestDay
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {currentWorkoutPlan?.workoutType || 'Rest'}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              {currentWorkoutPlan?.title || 'Rest and Recharge'}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
              {currentWorkoutPlan?.description || 'Take time to recover and hydrate.'}
            </p>
          </div>
        </div>

        <div className="flex items-center sm:self-center gap-2">
          {dailyProgress.workoutCompleted ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed</span>
            </div>
          ) : currentWorkoutPlan?.isRestDay ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-900 text-blue-300 text-xs font-semibold">
              <span>Rest Day</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 text-slate-300 text-xs font-medium">
              <span>Pending</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
