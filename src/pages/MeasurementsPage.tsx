import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { formatDisplayDate } from '../utils/dateUtils';
import { BodyMeasurementEntry } from '../types';
import {
  Scale,
  Ruler,
  TrendingUp,
  Plus,
  Calendar,
  Sparkles,
  Info,
  Camera,
  Heart,
  Save,
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
} from 'recharts';

export const MeasurementsPage: React.FC = () => {
  const {
    measurements,
    selectedDate,
    settings,
    addMeasurement,
    stats,
  } = useFitness();

  const [weightKg, setWeightKg] = useState(String(stats.currentWeight || 50));
  const [waistCm, setWaistCm] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [armCm, setArmCm] = useState('');
  const [thighCm, setThighCm] = useState('');
  const [energyLevel, setEnergyLevel] = useState('4');
  const [sleepHours, setSleepHours] = useState('8');
  const [performanceNotes, setPerformanceNotes] = useState('');
  const [photoReference, setPhotoReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    setIsSubmitting(true);
    try {
      await addMeasurement({
        date: selectedDate,
        weightKg: Number(weightKg),
        waistCm: waistCm ? Number(waistCm) : undefined,
        chestCm: chestCm ? Number(chestCm) : undefined,
        armCm: armCm ? Number(armCm) : undefined,
        thighCm: thighCm ? Number(thighCm) : undefined,
        energyLevel: Number(energyLevel) || 3,
        sleepDuration: sleepHours ? Number(sleepHours) : undefined,
        performanceNotes: performanceNotes.trim() || undefined,
        photoReference: photoReference.trim() || undefined,
      });

      setPerformanceNotes('');
      setPhotoReference('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recharts weight progression
  const chartData = measurements.map((m: BodyMeasurementEntry) => ({
    date: m.date.slice(5),
    fullDate: m.date,
    weight: m.weightKg,
    waist: m.waistCm,
    baseline: settings.startingWeightKg,
  }));

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Body Measurements & Progress</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Lean mass tracking for {formatDisplayDate(selectedDate)} • Baseline: 50.0 kg @ 168 cm
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-bold">
              Current: {stats.currentWeight} kg ({stats.weightDelta >= 0 ? `+${stats.weightDelta}` : stats.weightDelta} kg)
            </div>
          </div>
        </div>

        {/* Nutritional Guidance for 50kg baseline */}
        <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            Healthy Muscle Building Strategy (Non-Extreme Approach)
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            At 168 cm and 50 kg baseline, you do not need aggressive fat-cutting diets.
            To achieve muscle tone and abdominal strength, focus on a controlled lean caloric surplus (~2,100 kcal) with 70–85g of quality protein.
            Aim for a gradual, steady increase in body weight (+0.25 to +0.5 kg per month) alongside progressive resistance training.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form: Record New Measurement */}
        <div className="card-base p-5 space-y-4 lg:col-span-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            Record Today's Measurements
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Morning Weight (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                required
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white text-base font-bold focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 mb-1">Waist (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 72"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Chest (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 84"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 mb-1">Arm (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 26"
                  value={armCm}
                  onChange={(e) => setArmCm(e.target.value)}
                  className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Thigh (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 48"
                  value={thighCm}
                  onChange={(e) => setThighCm(e.target.value)}
                  className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 mb-1">Energy (1-5)</label>
                <select
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(e.target.value)}
                  className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
                >
                  <option value="5">5 - High Energy</option>
                  <option value="4">4 - Good / Normal</option>
                  <option value="3">3 - Moderate</option>
                  <option value="2">2 - Low / Tired</option>
                  <option value="1">1 - Exhausted</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Sleep (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Private Photo Reference / Label</label>
              <input
                type="text"
                placeholder="e.g. Week 2 Front Photo (Saved in phone album)"
                value={photoReference}
                onChange={(e) => setPhotoReference(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Weekly Notes / Form Reflection</label>
              <textarea
                rows={2}
                placeholder="How did workouts feel this week? Digestion? Energy?"
                value={performanceNotes}
                onChange={(e) => setPerformanceNotes(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center justify-center gap-2 transition shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Measurement'}</span>
            </button>
          </form>
        </div>

        {/* Charts & History */}
        <div className="space-y-4 lg:col-span-2">
          {/* Weight & Waist Trend Chart */}
          <div className="card-elevated p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Weight Progression Over Challenge
              </h4>
              <span className="text-[11px] text-slate-400">Baseline 50 kg</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#a855f7' }}
                    name="Weight (kg)"
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

          {/* Historical Log Entries */}
          <div className="card-base p-5 space-y-3">
            <h4 className="font-bold text-white text-sm">Measurement Logs History</h4>
            {measurements.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
                {measurements
                  .slice()
                  .reverse()
                  .map((m: BodyMeasurementEntry) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{m.weightKg} kg</span>
                          {m.waistCm && <span className="text-slate-400">• Waist: {m.waistCm}cm</span>}
                          {m.armCm && <span className="text-slate-400">• Arm: {m.armCm}cm</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{formatDisplayDate(m.date)}</span>
                          {m.energyLevel && <span>• Energy: {m.energyLevel}/5</span>}
                          {m.sleepDuration && <span>• Sleep: {m.sleepDuration}h</span>}
                        </div>
                        {m.photoReference && (
                          <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            <span>Photo Tag: {m.photoReference}</span>
                          </div>
                        )}
                        {m.performanceNotes && (
                          <p className="text-[11px] text-slate-300 mt-1 italic">
                            "{m.performanceNotes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No measurements recorded yet. Enter your morning weight to begin.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
