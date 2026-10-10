import React from 'react';
import { useFitness } from '../context/FitnessContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Award,
  Dumbbell,
  Scale,
  Calendar,
  Trophy,
} from 'lucide-react';
import { getAllChallengeDates } from '../utils/dateUtils';
import { BodyMeasurementEntry, DailyProgress } from '../types';

export const ReportsPage: React.FC = () => {
  const { allDailyProgress, measurements, settings, stats } = useFitness();

  // Full challenge dates progression (or recorded dates)
  const challengeDates = getAllChallengeDates();

  const dailyProgressData = challengeDates.slice(0, 30).map((dateStr: string) => {
    const p = allDailyProgress.find((item: DailyProgress) => item.date === dateStr);
    return {
      date: dateStr.slice(5),
      fullDate: dateStr,
      calories: p?.caloriesConsumed || 0,
      targetCalories: settings.calorieTarget,
      protein: p?.proteinGrams || 0,
      targetProtein: settings.proteinTarget,
      water: p?.waterLiters || 0,
      completion: p?.completionPercentage || 0,
    };
  });

  const weightTrendData = measurements.map((m: BodyMeasurementEntry) => ({
    date: m.date.slice(5),
    weight: m.weightKg,
    baseline: settings.startingWeightKg,
  }));

  // Average weight across all records
  const avgWeight = measurements.length
    ? Math.round((measurements.reduce((sum: number, m: BodyMeasurementEntry) => sum + m.weightKg, 0) / measurements.length) * 10) / 10
    : settings.startingWeightKg;

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Challenge Analytics & Reports</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              82-Day Transformation Performance • Oct 11 – Dec 31, 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>{stats.daysCompleted} Active Days</span>
            </div>
          </div>
        </div>

        {/* Milestone Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block">Avg Daily Calories</span>
            <span className="text-xl font-black text-amber-400 mt-1 block">
              {stats.averageCalories} kcal
            </span>
            <span className="text-[10px] text-slate-400">Target: {settings.calorieTarget}</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block">Avg Daily Protein</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {stats.averageProtein}g
            </span>
            <span className="text-[10px] text-slate-400">Target: {settings.proteinTarget}g</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block">Average Weight</span>
            <span className="text-xl font-black text-purple-400 mt-1 block">
              {avgWeight} kg
            </span>
            <span className="text-[10px] text-slate-400">Baseline: 50.0 kg</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block">Workout Compliance</span>
            <span className="text-xl font-black text-white mt-1 block">
              {stats.workoutCompletionRate}%
            </span>
            <span className="text-[10px] text-slate-400">{stats.workoutsCompletedCount} sessions logged</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Calories vs Target */}
        <div className="card-base p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Daily Calorie Consumption
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{settings.calorieTarget} kcal target</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a31" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14181c',
                    borderColor: '#232a31',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calories"
                  stroke="#f59e0b"
                  fill="rgba(245, 158, 11, 0.2)"
                  name="Calories (kcal)"
                />
                <Line
                  type="monotone"
                  dataKey="targetCalories"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Protein Intake */}
        <div className="card-base p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Daily Protein Intake (Grams)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">{settings.proteinTarget}g target</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a31" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14181c',
                    borderColor: '#232a31',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="protein" fill="#10b981" name="Protein (g)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Body Weight Progression */}
        <div className="card-base p-5 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              Progressive Weight Trajectory
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Baseline: 50.0 kg</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a31" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14181c',
                    borderColor: '#232a31',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#a855f7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#a855f7' }}
                  name="Recorded Weight (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  dot={false}
                  name="Baseline (50 kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
