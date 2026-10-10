import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';
import {
  FitnessGoal,
  ExperienceLevel,
  WorkoutLocation,
  EquipmentLevel,
  DietPreference,
  BudgetLevel,
  PreferredWorkoutTime,
  ActivityLevel,
} from '../../types';
import {
  Sparkles,
  Dumbbell,
  Utensils,
  Clock,
  Target,
  CheckCircle2,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PlanConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { settings, regeneratePlanForGoal, isSaving } = useFitness();

  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(settings.fitnessGoal || 'six_pack');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    settings.experienceLevel || 'beginner'
  );
  const [workoutLocation, setWorkoutLocation] = useState<WorkoutLocation>(
    settings.workoutLocation || 'home'
  );
  const [equipment, setEquipment] = useState<EquipmentLevel>(settings.equipment || 'backpack');
  const [dietPreference, setDietPreference] = useState<DietPreference>(
    settings.dietPreference || 'vegetarian'
  );
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>(settings.budgetLevel || 'low');
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState<PreferredWorkoutTime>(
    settings.preferredWorkoutTime || 'evening'
  );
  const [wakeTime, setWakeTime] = useState<string>(settings.wakeTime || '06:30');
  const [sleepTime, setSleepTime] = useState<string>(settings.sleepTime || '22:30');
  const [workoutDurationMin, setWorkoutDurationMin] = useState<number>(
    settings.workoutDurationMin || 60
  );
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(
    settings.workoutFrequencyPerWeek || 3
  );
  const [targetWeightKg, setTargetWeightKg] = useState<number>(settings.targetWeightKg || 53.5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await regeneratePlanForGoal(fitnessGoal, {
      experienceLevel,
      workoutLocation,
      equipment,
      dietPreference,
      budgetLevel,
      preferredWorkoutTime,
      wakeTime,
      sleepTime,
      workoutDurationMin,
      workoutFrequencyPerWeek: trainingDaysPerWeek,
      targetWeightKg,
    });
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Research-Backed Fitness & Nutrition Plan Generator"
      subtitle="ACSM 2026 Progressive Resistance & ISSN Protein Distribution Engine"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Research Banner */}
        <div className="p-3 rounded-xl bg-charcoal-850 border border-emerald-900/40 text-slate-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            Changing your goal or timing will dynamically adapt your daily workout routines, vegetarian meal plans, calorie/protein targets, and morning-to-evening timetable while <strong>preserving all your previous completed logs</strong>.
          </p>
        </div>

        {/* 1. Fitness Goal Selection */}
        <div>
          <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Primary Fitness Goal:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'six_pack', label: 'Six-Pack / Visible Abs', desc: 'Core density + full body strength' },
              { id: 'bulking', label: 'Muscle Bulking', desc: 'Progressive overload + energy surplus' },
              { id: 'fat_loss', label: 'Fat Loss & Definition', desc: 'Metabolic training + calorie deficit' },
              { id: 'strength', label: 'Maximal Strength', desc: 'Neuromuscular power & resistance' },
              { id: 'general_fitness', label: 'General Fitness', desc: 'Balanced strength + cardio & health' },
              { id: 'beginner', label: 'Beginner / Home', desc: 'Approachable bodyweight foundation' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setFitnessGoal(g.id as FitnessGoal)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  fitnessGoal === g.id
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-charcoal-850 border-charcoal-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-bold block text-xs text-white">{g.label}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Preferred Workout Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preferred Workout Timing:</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'morning', label: 'Morning (~7:00 AM)' },
                { id: 'afternoon', label: 'Afternoon (~1:00 PM)' },
                { id: 'evening', label: 'Evening (~5:30 PM)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPreferredWorkoutTime(t.id as PreferredWorkoutTime)}
                  className={`p-2 rounded-xl border text-center text-xs font-semibold transition ${
                    preferredWorkoutTime === t.id
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                      : 'bg-charcoal-850 border-charcoal-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5">Available Workout Duration:</label>
            <select
              value={workoutDurationMin}
              onChange={(e) => setWorkoutDurationMin(Number(e.target.value))}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value={30}>30 Minutes (High Intensity Circuit)</option>
              <option value={45}>45 Minutes (Optimal Home Density)</option>
              <option value={60}>60 Minutes (Standard Full Body & Core)</option>
              <option value={75}>75 Minutes (Extended Strength & Mobility)</option>
            </select>
          </div>
        </div>

        {/* 3. Schedule Hours (Wake-up & Sleep) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Usual Wake-Up Time:</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Bedtime / Sleep Time:</label>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 4. Equipment & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
              <span>Available Equipment:</span>
            </label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as EquipmentLevel)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="bodyweight">Bodyweight Only (Floor, Chair, Bed)</option>
              <option value="backpack">Backpack (Books & Water Bottles Weighted)</option>
              <option value="dumbbells">Dumbbells & Resistance Bands</option>
              <option value="full_gym">Full Gym (Barbells, Cables, Benches)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Experience Level:</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="beginner">Beginner (0–6 Months Experience)</option>
              <option value="intermediate">Intermediate (6–24 Months)</option>
              <option value="advanced">Advanced (2+ Years)</option>
            </select>
          </div>
        </div>

        {/* 5. Diet & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dietary Style:</span>
            </label>
            <select
              value={dietPreference}
              onChange={(e) => setDietPreference(e.target.value as DietPreference)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="vegetarian">Vegetarian (No meat, no eggs; Milk, curd, paneer ok)</option>
              <option value="vegan">100% Plant-Based Vegan (Soy, tofu, legumes)</option>
              <option value="non_vegetarian">Non-Vegetarian (Eggs, chicken, dairy, legumes)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Grocery Budget:</label>
            <select
              value={budgetLevel}
              onChange={(e) => setBudgetLevel(e.target.value as BudgetLevel)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="low">Low Budget (Oats, dal, peanuts, chana, seasonal fruits)</option>
              <option value="moderate">Moderate Budget (Includes paneer, tofu, nuts)</option>
              <option value="flexible">Flexible Budget (Specialty proteins & seeds)</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/40 text-xs mt-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Generate Personalized Plan & Timetable</span>
        </button>
      </form>
    </Modal>
  );
};
