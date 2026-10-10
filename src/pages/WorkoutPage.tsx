import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { DailyWorkoutLogger } from '../components/workout/DailyWorkoutLogger';
import { WorkoutTimerModal } from '../components/workout/WorkoutTimerModal';
import { ExerciseDetailModal } from '../components/workout/ExerciseDetailModal';
import { ProgressiveOverloadHistoryModal } from '../components/workout/ProgressiveOverloadHistoryModal';
import { AddEditExerciseModal } from '../components/workout/AddEditExerciseModal';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  Dumbbell,
  Timer,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit3,
  Plus,
  Flame,
  Info,
} from 'lucide-react';
import { ExerciseItem, WorkoutType, TargetExercise } from '../types';
import { WORKOUT_A_EXERCISES, WORKOUT_B_EXERCISES, WORKOUT_A_PLUS_ABS_EXERCISES } from '../services/workoutGenerator';

export const WorkoutPage: React.FC = () => {
  const {
    currentWorkoutPlan,
    selectedDate,
    exerciseLibrary,
    dailyProgress,
    saveCheckin,
    savePlan,
  } = useFitness();

  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);

  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyExercise, setHistoryExercise] = useState<{ id: string; name: string }>({ id: '', name: '' });

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editType, setEditType] = useState<WorkoutType>(currentWorkoutPlan?.workoutType || 'Workout A');

  const selectedExercise = exerciseLibrary.find((e: ExerciseItem) => e.id === selectedExerciseId);

  const handleOpenTimer = (seconds: number) => {
    setTimerDuration(seconds);
    setTimerModalOpen(true);
  };

  const handleOpenExerciseInfo = (id: string) => {
    setSelectedExerciseId(id);
    setExerciseModalOpen(true);
  };

  const handleOpenHistory = (id: string, name: string) => {
    setHistoryExercise({ id, name });
    setHistoryModalOpen(true);
  };

  const handleSavePlanEdit = async () => {
    if (!currentWorkoutPlan) return;

    let targetExercises = currentWorkoutPlan.targetExercises;
    let isRestDay = false;

    if (editType === 'Workout A') {
      targetExercises = [...WORKOUT_A_EXERCISES];
    } else if (editType === 'Workout B') {
      targetExercises = [...WORKOUT_B_EXERCISES];
    } else if (editType === 'Workout A + abs') {
      targetExercises = [...WORKOUT_A_PLUS_ABS_EXERCISES];
    } else {
      targetExercises = [];
      isRestDay = true;
    }

    await savePlan({
      ...currentWorkoutPlan,
      workoutType: editType,
      isRestDay,
      targetExercises,
    });
    setIsEditingPlan(false);
  };

  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);
  const [editingTargetExercise, setEditingTargetExercise] = useState<TargetExercise | null>(null);
  const [editingExerciseIdx, setEditingExerciseIdx] = useState<number | null>(null);

  const handleAddExerciseClick = () => {
    setEditingTargetExercise(null);
    setEditingExerciseIdx(null);
    setExerciseEditorOpen(true);
  };

  const handleEditExercise = (exercise: TargetExercise, index: number) => {
    setEditingTargetExercise(exercise);
    setEditingExerciseIdx(index);
    setExerciseEditorOpen(true);
  };

  const handleDeleteExercise = async (exerciseId: string, exerciseName: string) => {
    if (!currentWorkoutPlan) return;
    if (window.confirm(`Remove "${exerciseName}" from today's workout plan?`)) {
      const updated = currentWorkoutPlan.targetExercises.filter((e) => e.exerciseId !== exerciseId);
      await savePlan({
        ...currentWorkoutPlan,
        targetExercises: updated,
        isRestDay: updated.length === 0,
      });
    }
  };

  const handleSaveExercisePlan = async (exercise: TargetExercise) => {
    if (!currentWorkoutPlan) return;
    const updated = [...currentWorkoutPlan.targetExercises];
    if (editingExerciseIdx !== null && editingExerciseIdx >= 0) {
      updated[editingExerciseIdx] = exercise;
    } else {
      updated.push(exercise);
    }
    await savePlan({
      ...currentWorkoutPlan,
      targetExercises: updated,
      isRestDay: false,
    });
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Workout Planner & Home Routine</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled for {formatDisplayDate(selectedDate)} • Day {currentWorkoutPlan?.dayNumber || 1} of 82
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleOpenTimer(60)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-emerald-950/60 border border-charcoal-800 hover:border-emerald-700/60 text-slate-200 hover:text-emerald-400 text-xs font-medium transition"
            >
              <Timer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rest Stopwatch</span>
            </button>

            <button
              onClick={() => setIsEditingPlan(!isEditingPlan)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-800 text-slate-200 text-xs font-medium transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditingPlan ? 'Cancel Edit' : 'Edit Plan'}</span>
            </button>
          </div>
        </div>

        {/* Edit Plan Dropdown */}
        {isEditingPlan && (
          <div className="p-3 bg-charcoal-850 rounded-xl border border-charcoal-800 space-y-2 text-xs">
            <span className="font-bold text-white block">Change Session Type for {selectedDate}:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as WorkoutType)}
                className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-2 text-white text-xs"
              >
                <option value="Workout A">Workout A — Full Body</option>
                <option value="Workout B">Workout B — Full Body</option>
                <option value="Workout A + abs">Workout A + Abs</option>
                <option value="Recovery">Active Recovery & Walk</option>
                <option value="Light Activity">Light Activity & Mobility</option>
                <option value="Rest">Full Rest Day</option>
              </select>
              <button
                onClick={handleSavePlanEdit}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-xs"
              >
                Apply Change
              </button>
            </div>
          </div>
        )}

        {/* Today's Focus Card */}
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-slate-400">Scheduled:</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                {currentWorkoutPlan?.workoutType || 'Rest Day'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              {currentWorkoutPlan?.title || 'Rest and Recovery'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentWorkoutPlan?.description || 'Take time to rest, hydrate, and stretch.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => saveCheckin({ workoutCompleted: !dailyProgress.workoutCompleted })}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                dailyProgress.workoutCompleted
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
                  : 'bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-charcoal-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${dailyProgress.workoutCompleted ? 'text-white' : 'text-slate-400'}`} />
              <span>{dailyProgress.workoutCompleted ? 'Workout Marked Complete' : 'Mark Session as Done'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warm-Up Guidelines Card */}
      <div className="p-3.5 rounded-xl bg-charcoal-900/60 border border-charcoal-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">3-Minute Dynamic Warm-Up Protocol:</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            10 Arm circles • 10 Bodyweight hip hinges • 10 Bodyweight half-squats • Cat-Cow spinal mobility.
            Never jump straight into weighted backpack exercises with cold joints.
          </p>
        </div>
      </div>

      {/* Daily Exercises List */}
      {currentWorkoutPlan && currentWorkoutPlan.targetExercises.length > 0 ? (
        <DailyWorkoutLogger
          exercises={currentWorkoutPlan.targetExercises}
          onOpenTimer={handleOpenTimer}
          onOpenExerciseInfo={handleOpenExerciseInfo}
          onOpenHistory={handleOpenHistory}
          onEditExercise={handleEditExercise}
          onDeleteExercise={handleDeleteExercise}
          onAddExerciseClick={handleAddExerciseClick}
        />
      ) : (
        <div className="card-elevated p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-charcoal-700 mx-auto" />
          <h4 className="text-base font-bold text-white">Scheduled Rest or Recovery Day</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Rest days are where muscles actually synthesize and rebuild stronger! Focus on reaching your 80g protein target, drinking 2.0L of water, and getting 8 hours of sleep.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setEditType('Workout A');
                setIsEditingPlan(true);
              }}
              className="px-4 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-emerald-400 text-xs font-semibold border border-charcoal-800 transition"
            >
              Switch to Strength Workout A
            </button>
            <button
              onClick={handleAddExerciseClick}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Exercise to Routine</span>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <WorkoutTimerModal
        isOpen={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
        defaultSeconds={timerDuration}
      />

      <ExerciseDetailModal
        isOpen={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        exercise={selectedExercise}
      />

      <ProgressiveOverloadHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        exerciseId={historyExercise.id}
        exerciseName={historyExercise.name}
      />

      <AddEditExerciseModal
        isOpen={exerciseEditorOpen}
        onClose={() => setExerciseEditorOpen(false)}
        initialExercise={editingTargetExercise}
        exerciseLibrary={exerciseLibrary}
        onSave={handleSaveExercisePlan}
      />
    </div>
  );
};
