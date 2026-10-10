import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { DailyScheduleItem } from '../../types';
import { FitnessImage } from '../common/FitnessImage';
import { formatDisplayDate } from '../../utils/dateUtils';
import {
  Clock,
  CheckCircle2,
  Circle,
  Dumbbell,
  Utensils,
  Moon,
  Sun,
  Droplets,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  onOpenPlanConfig?: () => void;
}

export const DailyTimetableCard: React.FC<Props> = ({ onOpenPlanConfig }) => {
  const { dailySchedule, toggleScheduleItem, selectedDate, settings } = useFitness();
  const [activeFilter, setActiveFilter] = useState<'all' | 'meals' | 'workouts'>('all');

  const filteredItems = dailySchedule.filter((item) => {
    if (activeFilter === 'meals') return item.category === 'meal' || item.category === 'snack';
    if (activeFilter === 'workouts') return item.category === 'workout' || item.category === 'recovery';
    return true;
  });

  const completedCount = dailySchedule.filter((i) => i.completed).length;
  const progressPercent =
    dailySchedule.length > 0 ? Math.round((completedCount / dailySchedule.length) * 100) : 0;

  const getCategoryIcon = (category: DailyScheduleItem['category']) => {
    switch (category) {
      case 'wake':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'workout':
        return <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />;
      case 'meal':
      case 'snack':
        return <Utensils className="w-3.5 h-3.5 text-amber-400" />;
      case 'hydration':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'sleep':
      case 'recovery':
        return <Moon className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="card-elevated p-5 space-y-4">
      {/* Header & Goal Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">
              Daily Schedule & Timetable (Morning to Evening)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized for {formatDisplayDate(selectedDate)} • Goal:{' '}
            <span className="text-emerald-400 font-semibold capitalize">
              {(settings.fitnessGoal || 'six_pack').replace('_', ' ')}
            </span>{' '}
            • Timing:{' '}
            <span className="text-white font-medium capitalize">
              {settings.preferredWorkoutTime || 'evening'} Workout
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPlanConfig && (
            <button
              onClick={onOpenPlanConfig}
              className="px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-800 hover:border-emerald-500/50 text-slate-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Change Goal & Timing</span>
            </button>
          )}

          <div className="text-right">
            <div className="text-xs font-bold text-white">
              {completedCount}/{dailySchedule.length} Done
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">{progressPercent}% Adherence</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 via-emerald-500 to-green-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-lg transition font-medium ${
            activeFilter === 'all'
              ? 'bg-charcoal-800 text-white border border-charcoal-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Timeline ({dailySchedule.length})
        </button>
        <button
          onClick={() => setActiveFilter('meals')}
          className={`px-3 py-1 rounded-lg transition font-medium ${
            activeFilter === 'meals'
              ? 'bg-charcoal-800 text-amber-300 border border-amber-900/60'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          Meals & Fuel
        </button>
        <button
          onClick={() => setActiveFilter('workouts')}
          className={`px-3 py-1 rounded-lg transition font-medium ${
            activeFilter === 'workouts'
              ? 'bg-charcoal-800 text-emerald-300 border border-emerald-900/60'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          Workouts & Recovery
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3 pt-1">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              item.completed
                ? 'bg-emerald-950/20 border-emerald-800/50 text-slate-300'
                : 'bg-charcoal-850 hover:bg-charcoal-800/80 border-charcoal-800 text-white'
            }`}
          >
            {/* Left: Checkbox + Time + Icon */}
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => toggleScheduleItem(item.id)}
                className="mt-0.5 sm:mt-0 p-1 rounded-lg hover:scale-110 transition"
                title={item.completed ? 'Mark Incomplete' : 'Mark Completed'}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
                )}
              </button>

              {/* Time pill */}
              <div className="w-20 sm:w-24 flex-shrink-0">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-charcoal-900 text-cyan-300 border border-charcoal-750 flex items-center gap-1 w-fit">
                  {getCategoryIcon(item.category)}
                  <span>{item.time}</span>
                </span>
                {item.durationMin && (
                  <span className="text-[10px] text-slate-400 block mt-0.5 pl-0.5">
                    {item.durationMin} mins
                  </span>
                )}
              </div>

              {/* Image Preview thumbnail if available */}
              {item.imageUrl && (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-charcoal-750 hidden md:block">
                  <FitnessImage
                    src={item.imageUrl}
                    alt={item.title}
                    fallbackType={item.category === 'workout' ? 'exercise' : 'food'}
                    enableZoom
                  />
                </div>
              )}

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-bold flex items-center gap-2 flex-wrap ${
                    item.completed ? 'line-through text-slate-400' : 'text-white'
                  }`}
                >
                  {item.title}
                  {item.calories && (
                    <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 font-mono font-normal border border-amber-900/60">
                      {item.calories} kcal • {item.protein}g P
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                {item.researchNote && (
                  <div className="text-[10px] text-cyan-400/90 mt-1 flex items-center gap-1 italic">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>{item.researchNote}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Quick Action Link */}
            {item.actionLink && (
              <div className="w-full sm:w-auto flex justify-end pt-2 sm:pt-0">
                <Link
                  to={item.actionLink}
                  className="px-3 py-1.5 rounded-lg bg-charcoal-900 hover:bg-emerald-950/60 border border-charcoal-750 hover:border-emerald-700/60 text-slate-200 hover:text-emerald-300 text-xs font-medium transition flex items-center gap-1"
                >
                  <span>Open Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
