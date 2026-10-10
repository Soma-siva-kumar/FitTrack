import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import {
  Flame,
  Dumbbell,
  Droplets,
  Moon,
  Scale,
  Award,
  Plus,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  onOpenQuickAdd: (tab: 'meal' | 'water' | 'weight' | 'workout') => void;
}

export const MetricCards: React.FC<Props> = ({ onOpenQuickAdd }) => {
  const { dailyProgress, settings, stats, quickAddWater } = useFitness();

  const caloriesRemaining = Math.max(0, settings.calorieTarget - dailyProgress.caloriesConsumed);
  const proteinRemaining = Math.max(0, Math.round((settings.proteinTarget - dailyProgress.proteinGrams) * 10) / 10);
  const caloriePercent = Math.min(100, Math.round((dailyProgress.caloriesConsumed / settings.calorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((dailyProgress.proteinGrams / settings.proteinTarget) * 100));
  const waterPercent = Math.min(100, Math.round((dailyProgress.waterLiters / settings.waterTargetLiters) * 100));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {/* 1. Calories Card */}
      <div className="card-base p-4 space-y-2.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Calories
            </span>
            <button
              onClick={() => onOpenQuickAdd('meal')}
              className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white"
              title="Add Food"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {dailyProgress.caloriesConsumed}
            </span>
            <span className="text-xs text-slate-400 font-normal"> / {settings.calorieTarget} kcal</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {caloriesRemaining > 0 ? `${caloriesRemaining} kcal left` : 'Target reached!'}
          </div>
        </div>
      </div>

      {/* 2. Protein Card */}
      <div className="card-base p-4 space-y-2.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" />
              Protein
            </span>
            <button
              onClick={() => onOpenQuickAdd('meal')}
              className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white"
              title="Add Protein Food"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {dailyProgress.proteinGrams}g
            </span>
            <span className="text-xs text-slate-400 font-normal"> / {settings.proteinTarget}g</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${proteinPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {proteinRemaining > 0 ? `${proteinRemaining}g left` : 'Target reached!'}
          </div>
        </div>
      </div>

      {/* 3. Water Intake Card */}
      <div className="card-base p-4 space-y-2.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              Water
            </span>
            <button
              onClick={() => quickAddWater(0.25)}
              className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/60 transition"
              title="Quick +250ml"
            >
              +250ml
            </button>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {dailyProgress.waterLiters}L
            </span>
            <span className="text-xs text-slate-400 font-normal"> / {settings.waterTargetLiters}L</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-charcoal-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{Math.max(0, Math.round((settings.waterTargetLiters - dailyProgress.waterLiters) * 10) / 10)}L left</span>
            <button
              onClick={() => quickAddWater(0.5)}
              className="text-cyan-400 hover:underline"
            >
              +500ml
            </button>
          </div>
        </div>
      </div>

      {/* 4. Workout Status Card */}
      <div className="card-base p-4 space-y-2.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              Workout
            </span>
            <button
              onClick={() => onOpenQuickAdd('workout')}
              className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white"
              title="Log Workout"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2">
            {dailyProgress.workoutCompleted ? (
              <span className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Done
              </span>
            ) : dailyProgress.restDay ? (
              <span className="text-base sm:text-lg font-bold text-blue-400">
                Rest Day
              </span>
            ) : (
              <span className="text-base sm:text-lg font-bold text-slate-300">
                Pending
              </span>
            )}
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Weekly Rate: <span className="text-white font-semibold">{stats.workoutCompletionRate}%</span>
        </div>
      </div>

      {/* 5. Sleep Duration Card */}
      <div className="card-base p-4 space-y-2.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-purple-400" />
              Sleep
            </span>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {dailyProgress.sleepHours || 0}h
            </span>
            <span className="text-xs text-slate-400 font-normal"> / {settings.sleepTargetHours}h</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Energy: <span className="text-emerald-400 font-semibold">{dailyProgress.energyRating}/5</span>
        </div>
      </div>

      {/* 6. Current Weight Card */}
      <div className="card-base p-4 space-y-2.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-rose-400" />
              Weight
            </span>
            <button
              onClick={() => onOpenQuickAdd('weight')}
              className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white"
              title="Log Weight"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {dailyProgress.weightKg || stats.currentWeight} kg
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400">
          Change: {' '}
          <span
            className={`font-semibold ${
              stats.weightDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {stats.weightDelta > 0 ? `+${stats.weightDelta}` : stats.weightDelta} kg
          </span>
          <span className="text-[10px] text-slate-400 block">Baseline: 50.0 kg</span>
        </div>
      </div>
    </div>
  );
};
