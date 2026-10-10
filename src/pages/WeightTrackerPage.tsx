import React, { useState, useMemo } from 'react';
import { useFitness } from '../context/FitnessContext';
import { formatDisplayDate } from '../utils/dateUtils';
import { BodyMeasurementEntry } from '../types';
import {
  Scale,
  TrendingUp,
  Clock,
  Sparkles,
  Info,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Calendar,
  Activity,
  Ruler,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';

export const WeightTrackerPage: React.FC = () => {
  const {
    measurements,
    selectedDate,
    setSelectedDate,
    settings,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    weightProjection,
    stats,
    isSaving,
    showToast,
  } = useFitness();

  // Find if an entry already exists for selectedDate
  const currentDayEntry = useMemo(
    () => measurements.find((m) => m.date === selectedDate),
    [measurements, selectedDate]
  );

  // Form State
  const [formDate, setFormDate] = useState<string>(selectedDate);
  const [weightKg, setWeightKg] = useState<string>(
    currentDayEntry ? String(currentDayEntry.weightKg) : String(stats.currentWeight || 50.0)
  );
  const [weighTime, setWeighTime] = useState<string>(currentDayEntry?.time || '07:15 AM');
  const [condition, setCondition] = useState<string>(
    currentDayEntry?.condition || 'Morning Fasting, Post-Restroom'
  );
  const [waistCm, setWaistCm] = useState<string>(
    currentDayEntry?.waistCm ? String(currentDayEntry.waistCm) : ''
  );
  const [chestCm, setChestCm] = useState<string>(
    currentDayEntry?.chestCm ? String(currentDayEntry.chestCm) : ''
  );
  const [armCm, setArmCm] = useState<string>(
    currentDayEntry?.armCm ? String(currentDayEntry.armCm) : ''
  );
  const [energyLevel, setEnergyLevel] = useState<string>(
    currentDayEntry?.energyLevel ? String(currentDayEntry.energyLevel) : '4'
  );
  const [performanceNotes, setPerformanceNotes] = useState<string>(
    currentDayEntry?.performanceNotes || ''
  );

  const [editingId, setEditingId] = useState<string | null>(currentDayEntry?.id || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'history'>('overview');

  // Keep form in sync when date or currentDayEntry changes
  React.useEffect(() => {
    setFormDate(selectedDate);
    const found = measurements.find((m) => m.date === selectedDate);
    if (found) {
      setEditingId(found.id);
      setWeightKg(String(found.weightKg));
      setWeighTime(found.time || '07:15 AM');
      setCondition(found.condition || 'Morning Fasting, Post-Restroom');
      setWaistCm(found.waistCm ? String(found.waistCm) : '');
      setChestCm(found.chestCm ? String(found.chestCm) : '');
      setArmCm(found.armCm ? String(found.armCm) : '');
      setEnergyLevel(found.energyLevel ? String(found.energyLevel) : '4');
      setPerformanceNotes(found.performanceNotes || '');
    } else {
      setEditingId(null);
      setWeightKg(String(stats.currentWeight || 50.0));
      setWeighTime('07:15 AM');
      setCondition('Morning Fasting, Post-Restroom');
      setWaistCm('');
      setChestCm('');
      setArmCm('');
      setEnergyLevel('4');
      setPerformanceNotes('');
    }
  }, [selectedDate, measurements, stats.currentWeight]);

  // Handle Form Submission
  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericWeight = parseFloat(weightKg);
    if (isNaN(numericWeight) || numericWeight <= 30 || numericWeight >= 150) {
      showToast('Please enter a realistic weight in kg (30-150 kg).', 'error');
      return;
    }

    const payload = {
      date: formDate,
      time: weighTime,
      condition,
      weightKg: Math.round(numericWeight * 10) / 10,
      waistCm: waistCm ? parseFloat(waistCm) : undefined,
      chestCm: chestCm ? parseFloat(chestCm) : undefined,
      armCm: armCm ? parseFloat(armCm) : undefined,
      energyLevel: parseInt(energyLevel, 10),
      performanceNotes: performanceNotes.trim() || undefined,
    };

    if (editingId) {
      const existing = measurements.find((m) => m.id === editingId);
      if (existing) {
        await updateMeasurement({
          ...existing,
          ...payload,
        });
      }
    } else {
      await addMeasurement(payload);
    }
  };

  // Quick Stepper
  const adjustWeight = (delta: number) => {
    const current = parseFloat(weightKg) || 50.0;
    const updated = Math.round((current + delta) * 10) / 10;
    setWeightKg(String(updated));
  };

  // Populate form for editing existing entry from history table
  const handleEditFromHistory = (entry: BodyMeasurementEntry) => {
    setSelectedDate(entry.date);
    setFormDate(entry.date);
    setEditingId(entry.id);
    setWeightKg(String(entry.weightKg));
    setWeighTime(entry.time || '07:15 AM');
    setCondition(entry.condition || 'Morning Fasting, Post-Restroom');
    setWaistCm(entry.waistCm ? String(entry.waistCm) : '');
    setChestCm(entry.chestCm ? String(entry.chestCm) : '');
    setArmCm(entry.armCm ? String(entry.armCm) : '');
    setEnergyLevel(entry.energyLevel ? String(entry.energyLevel) : '4');
    setPerformanceNotes(entry.performanceNotes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEntry = async (id: string, date: string) => {
    if (window.confirm(`Are you sure you want to delete the weigh-in log for ${date}?`)) {
      await deleteMeasurement(id);
    }
  };

  // Trajectory Chart Data: Map all 82 days or recorded points
  const chartData = useMemo(() => {
    // Collect all unique sorted dates from Oct 11 to Dec 31
    const baseline = settings.startingWeightKg; // 50.0
    const targetGain = weightProjection.totalProjectedGainKg; // ~3.5
    const totalDays = 82;

    const recordedMap = new Map<string, BodyMeasurementEntry>();
    measurements.forEach((m) => recordedMap.set(m.date, m));

    // Sample weekly points for smooth curve
    const points = [];
    const startDate = new Date('2026-10-11T00:00:00Z');

    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(startDate.getTime() + (day - 1) * 86400000);
      const iso = d.toISOString().split('T')[0];
      const recorded = recordedMap.get(iso);

      // Expected linear/gradual lean curve
      const expectedWeight = Math.round((baseline + (targetGain * (day - 1)) / (totalDays - 1)) * 10) / 10;

      // Include points that either have a record or are milestone day markers (every 7 days or recorded)
      if (recorded || day % 7 === 1 || day === totalDays) {
        points.push({
          date: iso.substring(5), // MM-DD
          fullDate: iso,
          dayNumber: day,
          expectedWeight,
          actualWeight: recorded ? recorded.weightKg : undefined,
          baseline,
          targetEnd: weightProjection.targetEndWeightKg,
        });
      }
    }

    return points;
  }, [measurements, settings.startingWeightKg, weightProjection]);

  // Planned Milestones Table
  const milestones = useMemo(() => {
    const baseline = settings.startingWeightKg;
    const weeklyRate = weightProjection.targetGainPerWeekKg;
    return [
      { milestone: 'Day 1 (Oct 11)', week: 'Baseline', target: baseline, notes: 'Starting calibration at home' },
      { milestone: 'Day 14 (Oct 24)', week: 'End of W2', target: Math.round((baseline + weeklyRate * 2) * 10) / 10, notes: 'Initial glycogen & cell hydration adaptation' },
      { milestone: 'Day 28 (Nov 07)', week: 'End of W4', target: Math.round((baseline + weeklyRate * 4) * 10) / 10, notes: 'First ~1.2 kg gain; progressive overload taking effect' },
      { milestone: 'Day 42 (Nov 21)', week: 'End of W6', target: Math.round((baseline + weeklyRate * 6) * 10) / 10, notes: 'Halfway mark; check waistline preservation' },
      { milestone: 'Day 56 (Dec 05)', week: 'End of W8', target: Math.round((baseline + weeklyRate * 8) * 10) / 10, notes: 'Solid hypertrophy base; backpack load increases' },
      { milestone: 'Day 70 (Dec 19)', week: 'End of W10', target: Math.round((baseline + weeklyRate * 10) * 10) / 10, notes: 'Entering final 2-week challenge crescendo' },
      { milestone: 'Day 82 (Dec 31)', week: 'Challenge Finale', target: weightProjection.targetEndWeightKg, notes: 'Peak physique: ~53.5 kg lean muscular baseline' },
    ];
  }, [settings.startingWeightKg, weightProjection]);

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Header Banner */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Everyday Weight Tracker & Gain Forecast</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Date: <span className="text-white font-semibold">{formatDisplayDate(selectedDate)}</span> • Day {stats.currentDay} of 82
            </p>
          </div>

          <div className="flex items-center gap-2 bg-charcoal-850 p-1 rounded-xl border border-charcoal-800 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                activeTab === 'overview' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Weigh-in & Tracker
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                activeTab === 'forecast' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gain Science & Forecast
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                activeTab === 'history' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Logs History ({measurements.length})
            </button>
          </div>
        </div>

        {/* Highlight Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Starting Baseline</span>
            <div className="text-lg font-bold text-white mt-0.5">{settings.startingWeightKg} kg</div>
            <span className="text-[10px] text-slate-400">Oct 11, 2026</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Current Recorded</span>
            <div className="text-lg font-bold text-white mt-0.5">{stats.currentWeight} kg</div>
            <span className={`text-[10px] font-bold ${stats.weightDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.weightDelta >= 0 ? `+${stats.weightDelta}` : stats.weightDelta} kg net change
            </span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Target End Weight</span>
            <div className="text-lg font-bold text-purple-400 mt-0.5">{weightProjection.targetEndWeightKg} kg</div>
            <span className="text-[10px] text-emerald-400 font-semibold">+{weightProjection.totalProjectedGainKg} kg projected</span>
          </div>

          <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <span className="text-[11px] text-slate-400 block font-medium">Weekly Gain Pace</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">~{weightProjection.targetGainPerWeekKg} kg/wk</div>
            <span className="text-[10px] text-cyan-400 font-medium">Optimal Lean Mass Zone</span>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & WEIGH-IN */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Everyday Weigh-in Form Card */}
          <div className="card-elevated p-5 space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">
                  {editingId ? 'Edit Weigh-in Record' : 'Record Morning Weigh-in'}
                </h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                {formDate}
              </span>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4 text-xs">
              {/* Date Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Log Date:</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => {
                    setFormDate(e.target.value);
                    setSelectedDate(e.target.value);
                  }}
                  className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white font-medium focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Weight Display & Quick Steppers */}
              <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Morning Weight (kg):</label>
                  <span className="text-[11px] text-purple-400 font-medium">0.1 kg precision</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustWeight(-0.5)}
                    className="w-10 h-10 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 font-bold text-sm transition"
                  >
                    -0.5
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWeight(-0.1)}
                    className="w-10 h-10 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 font-bold text-sm transition"
                  >
                    -0.1
                  </button>

                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="150"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-28 text-center text-2xl font-black bg-charcoal-950 border border-charcoal-700 rounded-xl py-1 text-white focus:border-purple-500 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => adjustWeight(0.1)}
                    className="w-10 h-10 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 font-bold text-sm transition"
                  >
                    +0.1
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustWeight(0.5)}
                    className="w-10 h-10 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 font-bold text-sm transition"
                  >
                    +0.5
                  </button>
                </div>

                <div className="text-center text-[11px] text-slate-400">
                  Diff from baseline 50.0 kg:{' '}
                  <span className="font-bold text-emerald-400">
                    {parseFloat(weightKg) - 50.0 >= 0
                      ? `+${(parseFloat(weightKg) - 50.0).toFixed(1)}`
                      : (parseFloat(weightKg) - 50.0).toFixed(1)}{' '}
                    kg
                  </span>
                </div>
              </div>

              {/* Weigh-in Time */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Weigh-in Time:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={weighTime}
                    onChange={(e) => setWeighTime(e.target.value)}
                    placeholder="07:15 AM"
                    className="flex-1 bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setWeighTime('07:00 AM')}
                    className="px-2.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-[11px]"
                  >
                    7:00 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeighTime('07:30 AM')}
                    className="px-2.5 py-2 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 text-[11px]"
                  >
                    7:30 AM
                  </button>
                </div>
              </div>

              {/* Weigh-in Condition (Crucial for Lean Mass Accuracy) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Condition & State:</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    'Morning Fasting, Post-Restroom',
                    'Pre-Breakfast',
                    'Post-Workout',
                    'Evening / Night',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={`p-2 rounded-xl text-[11px] text-left border transition ${
                        condition === c
                          ? 'bg-purple-950/70 border-purple-600 text-purple-200 font-semibold'
                          : 'bg-charcoal-850 border-charcoal-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {c === 'Morning Fasting, Post-Restroom' ? '🌅 Morning Fasting (Best)' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Waist Circumference (Abdominal Check) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Waist Circumference (cm):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  placeholder="e.g. 72.0"
                  className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Keeping waist stable while weight rises confirms muscle growth, not abdominal fat.
                </p>
              </div>

              {/* Energy Level & Notes */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Energy Rating:</label>
                  <select
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(e.target.value)}
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none text-xs"
                  >
                    <option value="5">5/5 - High Power</option>
                    <option value="4">4/4 - Good & Energetic</option>
                    <option value="3">3/5 - Moderate</option>
                    <option value="2">2/5 - Slightly Fatigued</option>
                    <option value="1">1/5 - Low Energy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Arm / Chest (cm):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={armCm}
                    onChange={(e) => setArmCm(e.target.value)}
                    placeholder="e.g. 27.5"
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Morning Reflection / Notes:</label>
                <input
                  type="text"
                  value={performanceNotes}
                  onChange={(e) => setPerformanceNotes(e.target.value)}
                  placeholder="e.g. Felt well rested, digestion smooth, ready for Workout A"
                  className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingId ? 'Update Weigh-in Record' : 'Save Morning Weigh-in'}</span>
              </button>
            </form>
          </div>

          {/* Trajectory & Progression Charts */}
          <div className="space-y-4 lg:col-span-2">
            {/* Chart Card */}
            <div className="card-elevated p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Weight Gain Trajectory: Actual vs 82-Day Scientific Forecast
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Target: Baseline 50.0 kg ➔ 53.5 kg by December 31, 2026 (+3.5 kg lean gain)
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-charcoal-800 text-slate-300 border border-charcoal-700">
                  {measurements.length} check-ins logged
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#232a31" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis domain={[49, 55]} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#14181c',
                        borderColor: '#232a31',
                        borderRadius: '0.75rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      formatter={(value: any, name: any) => [
                        `${value} kg`,
                        name === 'actualWeight'
                          ? 'Your Recorded Weight'
                          : name === 'expectedWeight'
                          ? 'Expected Lean Trajectory'
                          : name,
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <ReferenceLine y={50.0} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Baseline 50 kg', fill: '#94a3b8', fontSize: 10 }} />
                    <ReferenceLine y={53.5} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target 53.5 kg', fill: '#34d399', fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="expectedWeight"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      name="Expected Lean Trajectory"
                    />
                    <Line
                      type="monotone"
                      dataKey="actualWeight"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10b981', stroke: '#0c0e11', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                      name="Your Actual Weight"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  The purple dashed curve represents your ideal rate of lean muscle growth (~0.30 kg/week). When your green dots stay near this curve, you build quality muscle with minimal fat storage, maintaining abdominal definition.
                </span>
              </div>
            </div>

            {/* Recent 5 Logs Quick Glance */}
            <div className="card-base p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs">Recent Daily Weigh-in Entries</h4>
                <button
                  onClick={() => setActiveTab('history')}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  <span>View All Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {measurements.length > 0 ? (
                <div className="space-y-2">
                  {measurements
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800/80 border border-charcoal-800 flex items-center justify-between gap-3 text-xs transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-950/80 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-850">
                            {m.weightKg}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{formatDisplayDate(m.date)}</span>
                              {m.time && <span className="text-[11px] text-slate-400">at {m.time}</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>{m.condition || 'Morning Fasting'}</span>
                              {m.waistCm && <span>• Waist: {m.waistCm}cm</span>}
                              {m.energyLevel && <span>• Energy: {m.energyLevel}/5</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditFromHistory(m)}
                            className="p-1.5 rounded hover:bg-charcoal-700 text-slate-400 hover:text-white"
                            title="Edit weigh-in"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(m.id, m.date)}
                            className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400"
                            title="Delete weigh-in"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No weigh-ins recorded yet. Record your morning weight above to start tracking!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GAIN SCIENCE & FORECAST ENGINE */}
      {activeTab === 'forecast' && (
        <div className="space-y-5">
          {/* Detailed Scientific Engine Breakdown */}
          <div className="card-elevated p-6 space-y-5">
            <div className="flex items-center gap-3 border-b border-charcoal-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-750 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  How Much Weight Will I Gain Following This 82-Day Plan?
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scientific metabolic calculations tailored to your baseline (Age 22, 168 cm, 50.0 kg).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">1. Maintenance Energy (TDEE)</span>
                <div className="text-2xl font-black text-white">~1,850 kcal/day</div>
                <p className="text-[11px] text-slate-400">
                  Basal Metabolic Rate (BMR Mifflin-St Jeor = 1,445 kcal) + daily sedentary movement & 3-4 weekly home training sessions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">2. Calorie Target & Surplus</span>
                <div className="text-2xl font-black text-amber-400">2,100 kcal/day</div>
                <p className="text-[11px] text-slate-400">
                  Surplus: <span className="text-emerald-400 font-bold">+250 to +350 kcal/day</span> above maintenance. High enough to fuel new muscle protein synthesis without bloating.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400">3. Projected Total 82-Day Gain</span>
                <div className="text-2xl font-black text-emerald-400">+2.8 to +3.8 kg</div>
                <p className="text-[11px] text-slate-400">
                  Target Finish Weight: <span className="text-white font-bold">53.0 – 53.8 kg</span> (Midpoint: <span className="text-purple-400 font-bold">53.5 kg</span>) on Dec 31, 2026.
                </p>
              </div>
            </div>

            {/* Why Controlled Lean Gain Matters for Visible Abs */}
            <div className="p-4 rounded-xl bg-charcoal-900 border border-emerald-900/40 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                Why Gaining ~0.30 kg/week is the "Sweet Spot" for Six-Pack Abs
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                As a beginner entering a resistance training program, the maximum biological rate of natural muscle tissue creation is roughly <strong className="text-white">1.0 to 1.3 kg per month</strong>. If you eat an aggressive surplus and gain 1 kg every week (+12 kg total), over 75% of that weight will be stored as body fat over your abdominal wall, completely concealing your six-pack.
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                By gaining at a calibrated pace of <strong className="text-emerald-400">~0.25 to 0.32 kg per week</strong> while hitting your <strong className="text-white">70–85g vegetarian protein target</strong> and performing progressive overload, you maximize lean muscular thickness in your chest, back, legs, and rectus abdominis while keeping waist fat accumulation near zero.
              </p>
            </div>

            {/* Rate Gauge */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm">Gain Velocity Assessment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-charcoal-900 border border-amber-900/40">
                  <span className="text-amber-400 font-bold block mb-1">Under-eating (&lt; 0.15 kg/wk)</span>
                  <span className="text-slate-400 text-[11px] block">
                    Energy surplus too small. Muscle building will be slow. Increase whole milk, peanuts, or extra dal & rice.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-900 border border-emerald-800 bg-emerald-950/20">
                  <span className="text-emerald-400 font-bold block mb-1">Optimal Lean Mass Zone (0.20 – 0.40 kg/wk)</span>
                  <span className="text-slate-300 text-[11px] block">
                    Your target zone! Optimal muscle protein synthesis, high workout energy, and minimal abdominal fat gain.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-900 border border-rose-900/40">
                  <span className="text-rose-400 font-bold block mb-1">Excess Surplus (&gt; 0.50 kg/wk)</span>
                  <span className="text-slate-400 text-[11px] block">
                    Surplus higher than muscle synthesis capacity. Visceral fat will rise. Scale back calories toward 2,050 kcal.
                  </span>
                </div>
              </div>
            </div>

            {/* 82-Day Target Milestones Table */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-white text-sm">82-Day Bi-Weekly Milestone Roadmap</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-charcoal-800 text-slate-400 font-semibold">
                      <th className="py-2.5 px-3">Milestone Date</th>
                      <th className="py-2.5 px-3">Timeline</th>
                      <th className="py-2.5 px-3">Target Weight</th>
                      <th className="py-2.5 px-3">Accumulated Gain</th>
                      <th className="py-2.5 px-3">Focus & Physiological Adaptation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-800 text-slate-200">
                    {milestones.map((m, idx) => (
                      <tr key={idx} className="hover:bg-charcoal-850/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-white">{m.milestone}</td>
                        <td className="py-2.5 px-3 text-slate-400">{m.week}</td>
                        <td className="py-2.5 px-3 font-bold text-purple-400">{m.target} kg</td>
                        <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                          +{Math.round((m.target - settings.startingWeightKg) * 10) / 10} kg
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">{m.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE LOGS HISTORY & MANAGEMENT */}
      {activeTab === 'history' && (
        <div className="card-elevated p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800 pb-3">
            <div>
              <h3 className="font-bold text-white text-base">Complete Weigh-in Logs History</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every entry is recorded with timestamps, weigh conditions, and circumference measurements.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('overview');
                setEditingId(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record New Weigh-in</span>
            </button>
          </div>

          {measurements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-charcoal-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Recorded Weight</th>
                    <th className="py-2.5 px-3">Change vs Baseline</th>
                    <th className="py-2.5 px-3">Time & Condition</th>
                    <th className="py-2.5 px-3">Waist (cm)</th>
                    <th className="py-2.5 px-3">Arm / Chest</th>
                    <th className="py-2.5 px-3">Energy</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-800 text-slate-200">
                  {measurements
                    .slice()
                    .reverse()
                    .map((m) => {
                      const delta = Math.round((m.weightKg - settings.startingWeightKg) * 10) / 10;
                      return (
                        <tr key={m.id} className="hover:bg-charcoal-850/60 transition">
                          <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                            {formatDisplayDate(m.date)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-purple-400 text-sm whitespace-nowrap">
                            {m.weightKg} kg
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`font-semibold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {delta >= 0 ? `+${delta}` : delta} kg
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            <div>{m.condition || 'Morning Fasting'}</div>
                            {m.time && <div className="text-[10px] text-slate-400">{m.time}</div>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {m.waistCm ? `${m.waistCm} cm` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {m.armCm ? `${m.armCm} cm` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {m.energyLevel ? `${m.energyLevel}/5` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                            {m.performanceNotes || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setActiveTab('overview');
                                  handleEditFromHistory(m);
                                }}
                                className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-slate-300 hover:text-white"
                                title="Edit entry"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(m.id, m.date)}
                                className="p-1 rounded bg-charcoal-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No historical entries found. Record your first morning weight to populate the database.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
