import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TargetExercise, ExerciseItem } from '../../types';
import { Dumbbell, Save, Plus, Clock, Target, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialExercise: TargetExercise | null;
  exerciseLibrary: ExerciseItem[];
  onSave: (exercise: TargetExercise) => Promise<void> | void;
}

export const AddEditExerciseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialExercise,
  exerciseLibrary,
  onSave,
}) => {
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
  const [exerciseName, setExerciseName] = useState<string>('');
  const [targetSets, setTargetSets] = useState<number>(2);
  const [targetRepsOrDuration, setTargetRepsOrDuration] = useState<string>('8–12 reps');
  const [targetRestSec, setTargetRestSec] = useState<number>(60);
  const [isAbs, setIsAbs] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialExercise) {
      setSelectedLibraryId(initialExercise.exerciseId);
      setExerciseName(initialExercise.exerciseName);
      setTargetSets(initialExercise.targetSets);
      setTargetRepsOrDuration(initialExercise.targetRepsOrDuration);
      setTargetRestSec(initialExercise.targetRestSec);
      setIsAbs(initialExercise.isAbs);
    } else {
      setSelectedLibraryId('');
      setExerciseName('');
      setTargetSets(2);
      setTargetRepsOrDuration('8–12 reps');
      setTargetRestSec(60);
      setIsAbs(false);
    }
  }, [initialExercise, isOpen]);

  const handleSelectFromLibrary = (libId: string) => {
    setSelectedLibraryId(libId);
    if (!libId) return;

    const found = exerciseLibrary.find((e) => e.id === libId);
    if (found) {
      setExerciseName(found.name);
      setIsAbs(found.isAbs);
      if (found.isAbs) {
        setTargetRepsOrDuration(libId.includes('plank') ? '20–30s hold' : '10–15 reps');
        setTargetRestSec(45);
      } else {
        setTargetRepsOrDuration('8–12 reps');
        setTargetRestSec(60);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    setIsSubmitting(true);
    try {
      const exerciseId =
        initialExercise?.exerciseId ||
        selectedLibraryId ||
        `custom-ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      await onSave({
        exerciseId,
        exerciseName: exerciseName.trim(),
        targetSets: Math.max(1, Math.min(10, targetSets)),
        targetRepsOrDuration: targetRepsOrDuration.trim() || '8–12 reps',
        targetRestSec: Math.max(15, targetRestSec),
        isAbs,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialExercise ? 'Edit Exercise Plan' : 'Add Exercise to Today’s Routine'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Quick select from Exercise Library */}
        {!initialExercise && (
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Select from Exercise Library (Optional):
            </label>
            <select
              value={selectedLibraryId}
              onChange={(e) => handleSelectFromLibrary(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Or type custom exercise below --</option>
              {exerciseLibrary.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.targetMuscles} • {ex.isAbs ? 'Abs' : 'Full Body'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Exercise Name */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Exercise Name:</label>
          <input
            type="text"
            required
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g. Bodyweight squat, Incline push-up, Backpack row..."
            className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Sets Stepper & Target Reps */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Sets:</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTargetSets((s) => Math.max(1, s - 1))}
                className="w-8 h-8 rounded-lg bg-charcoal-800 text-slate-200 font-bold hover:bg-charcoal-700"
              >
                -
              </button>
              <span className="flex-1 text-center font-bold text-white text-base bg-charcoal-900 py-1 rounded-lg border border-charcoal-800">
                {targetSets} sets
              </span>
              <button
                type="button"
                onClick={() => setTargetSets((s) => Math.min(8, s + 1))}
                className="w-8 h-8 rounded-lg bg-charcoal-800 text-slate-200 font-bold hover:bg-charcoal-700"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Reps / Time:</label>
            <input
              type="text"
              required
              value={targetRepsOrDuration}
              onChange={(e) => setTargetRepsOrDuration(e.target.value)}
              placeholder="e.g. 8–12 reps or 25s hold"
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Rest Duration Presets */}
        <div>
          <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Rest Between Sets (Seconds):</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[30, 45, 60, 90].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setTargetRestSec(sec)}
                className={`py-1.5 rounded-lg border text-xs font-semibold transition ${
                  targetRestSec === sec
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-charcoal-850 border-charcoal-800 text-slate-400 hover:text-white'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
          <input
            type="number"
            step="5"
            min="10"
            max="300"
            value={targetRestSec}
            onChange={(e) => setTargetRestSec(Number(e.target.value) || 60)}
            className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2 text-white text-center font-mono focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Is Abs Exercise */}
        <label className="flex items-center gap-2 text-slate-300 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isAbs}
            onChange={(e) => setIsAbs(e.target.checked)}
            className="rounded bg-charcoal-800 border-charcoal-700 text-purple-500 focus:ring-0"
          />
          <span>Flag as Abdominal & Core Exercise</span>
        </label>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{initialExercise ? 'Save Exercise Changes' : 'Add to Workout Plan'}</span>
        </button>
      </form>
    </Modal>
  );
};
