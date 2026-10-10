import React from 'react';
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
} from 'recharts';
import { useFitness } from '../../context/FitnessContext';
import { getAllChallengeDates } from '../../utils/dateUtils';
import { Scale, Flame, Dumbbell } from 'lucide-react';

export const DashboardCharts: React.FC = () => {
  const { allDailyProgress, measurements, settings } = useFitness();

  // 1. Calories and Protein chart data (last 7 or 14 recorded challenge days)
  const nutritionChartData = React.useMemo(() => {
    const dates = getAllChallengeDates().slice(0, 14); // First 14 days or recent
    return dates.map((dateStr) => {
      const p = allDailyProgress.find((item) => item.date === dateStr);
      const shortDate = dateStr.slice(5); // MM-DD
      return {
        date: shortDate,
        fullDate: dateStr,
        calories: p?.caloriesConsumed || 0,
        protein: p?.proteinGrams || 0,
        targetCalories: settings.calorieTarget,
        targetProtein: settings.proteinTarget,
      };
    });
  }, [allDailyProgress, settings]);

  const hasNutritionData = nutritionChartData.some((d) => d.calories > 0 || d.protein > 0);

  // 2. Weight Trend data
  const weightChartData = React.useMemo(() => {
    return measurements.map((m) => ({
      date: m.date.slice(5),
      fullDate: m.date,
      weight: m.weightKg,
      baseline: settings.startingWeightKg,
    }));
  }, [measurements, settings.startingWeightKg]);

  const hasWeightData = weightChartData.length > 0;

  // 3. Workout Consistency data
  const workoutConsistencyData = React.useMemo(() => {
    const dates = getAllChallengeDates().slice(0, 14);
    return dates.map((dateStr) => {
      const p = allDailyProgress.find((item) => item.date === dateStr);
      let statusScore = 0; // 0 = missed/pending, 1 = completed workout or rest
      let label = 'Pending';
      if (p?.workoutCompleted) {
        statusScore = 1;
        label = 'Worked Out';
      } else if (p?.restDay) {
        statusScore = 0.5;
        label = 'Rest Day';
      }
      return {
        date: dateStr.slice(5),
        statusScore,
        label,
        completionPercentage: p?.completionPercentage || 0,
      };
    });
  }, [allDailyProgress]);

  const hasWorkoutData = workoutConsistencyData.some((d) => d.statusScore > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: Calories & Protein */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Daily Calories & Protein Trend</h3>
          </div>
          <span className="text-[11px] text-slate-400">Target: {settings.calorieTarget} kcal / {settings.proteinTarget}g</span>
        </div>

        {hasNutritionData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nutritionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a31" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14181c',
                    borderColor: '#232a31',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="calories" fill="#f59e0b" name="Calories (kcal)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="protein" fill="#10b981" name="Protein (g)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <Flame className="w-8 h-8 text-charcoal-700 mb-2" />
            <p className="text-sm font-medium text-slate-300">No Food Records Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Log your meals or apply Indian vegetarian templates to visualize your calorie and protein consistency.
            </p>
          </div>
        )}
      </div>

      {/* Chart 2: Weight Progression */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Body Weight Progression (kg)</h3>
          </div>
          <span className="text-[11px] text-slate-400">Baseline: {settings.startingWeightKg} kg</span>
        </div>

        {hasWeightData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a31" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14181c',
                    borderColor: '#232a31',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#a855f7' }}
                  activeDot={{ r: 6 }}
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
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <Scale className="w-8 h-8 text-charcoal-700 mb-2" />
            <p className="text-sm font-medium text-slate-300">No Weight History</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Record morning weigh-ins to track healthy lean muscle gain over the 82 days.
            </p>
          </div>
        )}
      </div>

      {/* Chart 3: Daily Habits Completion Consistency */}
      <div className="card-elevated p-5 space-y-3 lg:col-span-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Daily Habit Completion Rate (%)</h3>
          </div>
          <span className="text-[11px] text-slate-400">Includes nutrition, water, workout & sleep</span>
        </div>

        {hasWorkoutData ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutConsistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232a31" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14181c',
                    borderColor: '#232a31',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => [`${value}%`, 'Score']}
                />
                <Bar dataKey="completionPercentage" fill="#10b981" name="Daily Completion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <Dumbbell className="w-8 h-8 text-charcoal-700 mb-2" />
            <p className="text-sm font-medium text-slate-300">No Habit Check-ins Yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Complete your daily check-in to build a continuous workout and nutrition streak.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
