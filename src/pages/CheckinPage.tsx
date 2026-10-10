import React, { useState, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Droplets,
  Dumbbell,
  Moon,
  Scale,
  Smile,
  Save,
  Sparkles,
} from 'lucide-react';

export const CheckinPage: React.FC = () => {
  const {
    dailyProgress,
    selectedDate,
    settings,
    saveCheckin,
    currentWorkoutPlan,
    isSaving,
  } = useFitness();

  const [waterLiters, setWaterLiters] = useState(String(dailyProgress.waterLiters || ''));
  const [sleepHours, setSleepHours] = useState(String(dailyProgress.sleepHours || ''));
  const [weightKg, setWeightKg] = useState(String(dailyProgress.weightKg || ''));
  const [energyRating, setEnergyRating] = useState(String(dailyProgress.energyRating || 3));
  const [foodLoggingCompleted, setFoodLoggingCompleted] = useState(dailyProgress.foodLoggingCompleted);
  const [workoutCompleted, setWorkoutCompleted] = useState(dailyProgress.workoutCompleted);
  const [restDay, setRestDay] = useState(dailyProgress.restDay);
  const [absCompleted, setAbsCompleted] = useState(dailyProgress.absCompleted);
  const [notes, setNotes] = useState(dailyProgress.notes || '');

  useEffect(() => {
    setWaterLiters(String(dailyProgress.waterLiters || ''));
    setSleepHours(String(dailyProgress.sleepHours || ''));
    setWeightKg(String(dailyProgress.weightKg || ''));
    setEnergyRating(String(dailyProgress.energyRating || 3));
    setFoodLoggingCompleted(dailyProgress.foodLoggingCompleted);
    setWorkoutCompleted(dailyProgress.workoutCompleted);
    setRestDay(dailyProgress.restDay);
    setAbsCompleted(dailyProgress.absCompleted);
    setNotes(dailyProgress.notes || '');
  }, [dailyProgress, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await saveCheckin({
      waterLiters: Number(waterLiters) || 0,
      sleepHours: Number(sleepHours) || 0,
      weightKg: weightKg ? Number(weightKg) : undefined,
      energyRating: Number(energyRating) || 3,
      foodLoggingCompleted,
      workoutCompleted,
      restDay,
      absCompleted,
      notes: notes.trim() || undefined,
    });
  };

  const isRestDayPlan = currentWorkoutPlan?.isRestDay || restDay;

  return (
    <div className="space-y-5 pb-16 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Daily Habit Check-in</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reflect & track for {formatDisplayDate(selectedDate)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Score: {dailyProgress.completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Daily Goal Completion</span>
            <span className="text-white font-bold">{dailyProgress.completionPercentage}%</span>
          </div>
          <div className="w-full bg-charcoal-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${dailyProgress.completionPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {isRestDayPlan
              ? 'Scheduled rest day automatically satisfies workout credit.'
              : 'Complete your workout and nutrition goals to earn 100% daily score.'}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card-base p-6 space-y-5 text-xs">
        {/* Habit Checks Grid */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
            Primary Daily Pillars
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Food Logging Check */}
            <label className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-start gap-3 cursor-pointer hover:bg-charcoal-800 transition">
              <input
                type="checkbox"
                checked={foodLoggingCompleted}
                onChange={(e) => setFoodLoggingCompleted(e.target.checked)}
                className="mt-0.5 rounded bg-charcoal-900 border-charcoal-700 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-bold text-white block">Food Logging Complete</span>
                <span className="text-[11px] text-slate-400">
                  Logged breakfast, lunch, dinner & snacks ({dailyProgress.caloriesConsumed} kcal tracked)
                </span>
              </div>
            </label>

            {/* 2. Workout / Rest Day */}
            <label className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-start gap-3 cursor-pointer hover:bg-charcoal-800 transition">
              <input
                type="checkbox"
                checked={workoutCompleted || restDay}
                onChange={(e) => {
                  if (restDay) {
                    setRestDay(false);
                    setWorkoutCompleted(e.target.checked);
                  } else {
                    setWorkoutCompleted(e.target.checked);
                  }
                }}
                className="mt-0.5 rounded bg-charcoal-900 border-charcoal-700 text-emerald-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-bold text-white block">
                  {restDay ? 'Rest / Recovery Day (Credited)' : 'Workout Completed'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {restDay ? 'Recovery walk, stretching, or rest' : 'Completed scheduled strength sets'}
                </span>
              </div>
            </label>

            {/* 3. Protein Target */}
            <div className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Protein Intake: {dailyProgress.proteinGrams}g</span>
                <span className="text-[11px] text-slate-400">
                  Target: {settings.proteinTargetMin}–{settings.proteinTargetMax}g/day (
                  {dailyProgress.proteinGrams >= settings.proteinTargetMin ? (
                    <strong className="text-emerald-400">Achieved!</strong>
                  ) : (
                    <span className="text-amber-400">{Math.max(0, settings.proteinTarget - dailyProgress.proteinGrams)}g remaining</span>
                  )}
                  )
                </span>
              </div>
            </div>

            {/* 4. Abs Core Done */}
            <label className="p-3.5 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-start gap-3 cursor-pointer hover:bg-charcoal-800 transition">
              <input
                type="checkbox"
                checked={absCompleted}
                onChange={(e) => setAbsCompleted(e.target.checked)}
                className="mt-0.5 rounded bg-charcoal-900 border-charcoal-700 text-purple-500 focus:ring-0 w-4 h-4"
              />
              <div>
                <span className="font-bold text-white block">Abdominal / Core Circuit</span>
                <span className="text-[11px] text-slate-400">
                  Completed planks, dead bugs, or reverse crunches
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Quantitative Inputs */}
        <div className="space-y-3 pt-2">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-400">
            Biometrics & Recovery Inputs
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Water */}
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                Water Consumed (Litres)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="2.0"
                value={waterLiters}
                onChange={(e) => setWaterLiters(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-xl p-2.5 text-white focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Goal: {settings.waterTargetLiters} Litres</span>
            </div>

            {/* Sleep */}
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-purple-400" />
                Sleep Duration (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="8.0"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-xl p-2.5 text-white focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Goal: {settings.sleepTargetHours} Hours</span>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-rose-400" />
                Morning Weight (kg, optional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="50.0"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-xl p-2.5 text-white focus:border-rose-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Baseline: 50.0 kg</span>
            </div>
          </div>

          {/* Energy Rating */}
          <div className="pt-2">
            <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              Energy & Recovery Rating (1 to 5)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: 1, label: 'Exhausted' },
                { val: 2, label: 'Low Energy' },
                { val: 3, label: 'Moderate' },
                { val: 4, label: 'Energetic' },
                { val: 5, label: 'Peak Form' },
              ].map(({ val, label }) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setEnergyRating(String(val))}
                  className={`py-2 rounded-xl border text-center transition font-semibold ${
                    Number(energyRating) === val
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-charcoal-850 border-charcoal-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-sm font-bold">{val}</span>
                  <span className="text-[10px] hidden sm:block">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Daily Reflections & Form Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="How was recovery? Any joint tenderness? Food digestion? Progress reflections?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-xl p-3 text-white focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 border-t border-charcoal-800 flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Daily Check-in'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
