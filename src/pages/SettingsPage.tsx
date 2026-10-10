import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { UserSettings, FoodItem, WorkoutLogEntry, BodyMeasurementEntry } from '../types';
import { exportToCSV } from '../services/excelExportService';
import {
  Settings,
  User,
  Target,
  Download,
  Cloud,
  FileSpreadsheet,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UploadCloud,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { CloudSetupModal } from '../components/settings/CloudSetupModal';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportDataToExcel,
    allFoodLogs,
    allWorkoutLogs,
    allDailyProgress,
    measurements,
    cloudStatus,
    refreshCloudStatus,
    syncLocalToCloud,
    isSaving,
  } = useFitness();

  const [form, setForm] = useState<UserSettings>(settings);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [isTestingCloud, setIsTestingCloud] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
  };

  const handleTestCloud = async () => {
    setIsTestingCloud(true);
    await refreshCloudStatus();
    setIsTestingCloud(false);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Profile, Targets & Cloud Sync</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize provisional targets, manage backups, and connect Google Sheets
            </p>
          </div>

          <button
            onClick={exportDataToExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Full .XLSX Workbook</span>
          </button>
        </div>
      </div>

      {/* Cloud Integration Status Card */}
      <div className="card-base p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Google Sheets Live Cloud Sync</h3>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
              cloudStatus.connected
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {cloudStatus.connected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{cloudStatus.connected ? 'Cloud Active' : 'Local Storage Mode'}</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {cloudStatus.connected
            ? `Connected to Google Spreadsheet (${cloudStatus.sheetId}). Data is automatically preserved in Google Sheets.`
            : 'FitTrack 82 is currently operating in offline-safe Local Storage Mode. You can freely use all features. To persist data to your private Google Sheets spreadsheet, configure Netlify environment variables.'}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => setCloudModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-800 text-slate-200 text-xs font-semibold transition"
          >
            View Cloud Setup Instructions
          </button>

          <button
            onClick={handleTestCloud}
            disabled={isTestingCloud}
            className="px-4 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-800 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
            <span>{isTestingCloud ? 'Checking...' : 'Check Connection'}</span>
          </button>

          {cloudStatus.connected && (
            <button
              onClick={syncLocalToCloud}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Sync All Local Data to Cloud</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile & Target Settings Form */}
      <form onSubmit={handleSaveProfile} className="card-base p-5 space-y-5 text-xs">
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Personal Profile & Provisional Targets</h3>
          </div>
          <span className="text-[11px] text-slate-400">Provisional targets, not medical prescriptions</span>
        </div>

        {/* Basic Profile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Age (Years)</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Height (cm)</label>
            <input
              type="number"
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Starting Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={form.startingWeightKg}
              onChange={(e) => setForm({ ...form, startingWeightKg: Number(e.target.value) })}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white font-bold"
            />
          </div>
        </div>

        {/* Diet & Training parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Diet Style</label>
            <input
              type="text"
              value={form.diet}
              onChange={(e) => setForm({ ...form, diet: e.target.value })}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Training Location</label>
            <input
              type="text"
              value={form.trainingLocation}
              onChange={(e) => setForm({ ...form, trainingLocation: e.target.value })}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white"
            />
          </div>
        </div>

        {/* Nutritional & Daily Targets */}
        <div className="p-4 bg-charcoal-850 rounded-xl border border-charcoal-800 space-y-3">
          <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Configurable Daily Fitness Targets
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Daily Calorie Target (Mid kcal)</label>
              <input
                type="number"
                value={form.calorieTarget}
                onChange={(e) => setForm({ ...form, calorieTarget: Number(e.target.value) })}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white font-bold text-amber-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Initial range: 2,000–2,200 kcal/day</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Daily Protein Target (g)</label>
              <input
                type="number"
                value={form.proteinTarget}
                onChange={(e) => setForm({ ...form, proteinTarget: Number(e.target.value) })}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-emerald-400 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Initial range: 70–85 g/day</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Daily Water Target (Litres)</label>
              <input
                type="number"
                step="0.1"
                value={form.waterTargetLiters}
                onChange={(e) => setForm({ ...form, waterTargetLiters: Number(e.target.value) })}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-cyan-400 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Adjustable: default 2.0L</span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Sleep Goal (Hours)</label>
              <input
                type="number"
                step="0.5"
                value={form.sleepTargetHours}
                onChange={(e) => setForm({ ...form, sleepTargetHours: Number(e.target.value) })}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-purple-400 font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Recommended: 8.0 hours for muscular recovery</span>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 transition shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Export & CSV Backup Downloads */}
      <div className="card-base p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-charcoal-800 pb-3">
          <Download className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Excel Workbook & CSV Export Backups</h3>
        </div>

        <p className="text-xs text-slate-300">
          Export your entire workout logs, food history, body measurements, and daily progress to Microsoft Excel (.xlsx) or individual CSV spreadsheets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          <button
            onClick={exportDataToExcel}
            className="p-3 rounded-xl bg-charcoal-850 hover:bg-emerald-950/60 border border-charcoal-800 hover:border-emerald-700/60 text-slate-200 hover:text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Full .XLSX (8 Tabs)</span>
          </button>

          <button
            onClick={() =>
              exportToCSV(
                allFoodLogs.map((f: FoodItem) => ({
                  Date: f.date,
                  Meal: f.mealType,
                  Food: f.foodName,
                  Qty: `${f.quantity} ${f.unit}`,
                  Calories: f.calories,
                  Protein: f.protein,
                })),
                'FitTrack82_Food_Logs.csv'
              )
            }
            className="p-3 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-800 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Food Logs (CSV)</span>
          </button>

          <button
            onClick={() =>
              exportToCSV(
                allWorkoutLogs.map((w: WorkoutLogEntry) => ({
                  Date: w.date,
                  Exercise: w.exerciseName,
                  Set: w.setNumber,
                  Reps: w.actualRepsOrDuration,
                  BackpackKg: w.weightKg,
                  Completed: w.completed ? 'YES' : 'NO',
                })),
                'FitTrack82_Workouts.csv'
              )
            }
            className="p-3 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-800 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Workouts (CSV)</span>
          </button>

          <button
            onClick={() =>
              exportToCSV(
                measurements.map((m: BodyMeasurementEntry) => ({
                  Date: m.date,
                  WeightKg: m.weightKg,
                  WaistCm: m.waistCm || '',
                  Notes: m.performanceNotes || '',
                })),
                'FitTrack82_Measurements.csv'
              )
            }
            className="p-3 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-800 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Measurements (CSV)</span>
          </button>
        </div>
      </div>

      {/* Cloud Setup Modal */}
      <CloudSetupModal
        isOpen={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
      />
    </div>
  );
};
