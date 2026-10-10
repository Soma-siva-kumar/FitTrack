import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { TargetExercise, WorkoutLogEntry } from '../../types';
import { FitnessImage } from '../common/FitnessImage';
import { getExerciseImage } from '../../services/imageService';
import {
  CheckCircle2,
  Circle,
  Clock,
  Info,
  TrendingUp,
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  Save,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface Props {
  exercises: TargetExercise[];
  onOpenTimer: (seconds: number) => void;
  onOpenExerciseInfo: (exerciseId: string) => void;
  onOpenHistory: (exerciseId: string, name: string) => void;
  onEditExercise?: (exercise: TargetExercise, index: number) => void;
  onDeleteExercise?: (exerciseId: string, exerciseName: string) => void;
  onAddExerciseClick?: () => void;
}

export const DailyWorkoutLogger: React.FC<Props> = ({
  exercises,
  onOpenTimer,
  onOpenExerciseInfo,
  onOpenHistory,
  onEditExercise,
  onDeleteExercise,
  onAddExerciseClick,
}) => {
  const { workoutLogs, selectedDate, logWorkoutSet, deleteWorkoutSet } = useFitness();

  // Local state for pending unsaved sets
  const [activeFormNotes, setActiveFormNotes] = useState<Record<string, string>>({});
  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});

  const handleToggleSet = async (
    ex: TargetExercise,
    setNum: number,
    existingLog?: WorkoutLogEntry
  ) => {
    if (existingLog) {
      // Toggle completed or delete
      await logWorkoutSet({
        ...existingLog,
        completed: !existingLog.completed,
      });
    } else {
      // Create new set log
      await logWorkoutSet({
        date: selectedDate,
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        setNumber: setNum,
        targetRepsOrDuration: ex.targetRepsOrDuration,
        actualRepsOrDuration: ex.targetRepsOrDuration,
        weightKg: 0,
        completed: true,
      });
    }
  };

  const handleUpdateLogField = async (
    log: WorkoutLogEntry,
    field: keyof WorkoutLogEntry,
    value: unknown
  ) => {
    await logWorkoutSet({
      ...log,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      {exercises.map((ex, exIndex) => {
        const exerciseLogs = workoutLogs.filter((l) => l.exerciseId === ex.exerciseId);
        const imgUrl = ex.imageUrl || getExerciseImage(ex.exerciseId, ex.exerciseName);
        const isTipExpanded = expandedTips[ex.exerciseId] || false;

        return (
          <div key={ex.exerciseId} className="card-base p-4 space-y-3">
            {/* Exercise Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-charcoal-800 pb-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  onClick={() => onOpenExerciseInfo(ex.exerciseId)}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-charcoal-700/80 cursor-pointer hover:border-emerald-500/80 transition flex-shrink-0 relative group shadow-sm"
                  title="Click to view technique & video"
                >
                  <FitnessImage
                    src={imgUrl}
                    alt={ex.exerciseName}
                    aspectRatio="square"
                    fallbackType="exercise"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition flex items-center justify-center">
                    <Info className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-5 h-5 rounded-md bg-charcoal-800 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                      #{exIndex + 1}
                    </span>
                    <h4
                      onClick={() => onOpenExerciseInfo(ex.exerciseId)}
                      className="font-bold text-white text-sm hover:text-emerald-300 cursor-pointer transition truncate"
                    >
                      {ex.exerciseName}
                    </h4>
                    {ex.isAbs && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-800">
                        Abs Focus
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Target: <span className="text-white font-medium">{ex.targetSets} sets × {ex.targetRepsOrDuration}</span>
                    <span className="mx-1.5">•</span>
                    Rest: <span className="text-emerald-400 font-medium">{ex.targetRestSec}s</span>
                  </div>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenTimer(ex.targetRestSec)}
                  className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-charcoal-800 transition flex items-center gap-1 text-[11px]"
                  title="Start Rest Timer"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">{ex.targetRestSec}s Timer</span>
                </button>

                <button
                  onClick={() => onOpenExerciseInfo(ex.exerciseId)}
                  className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-800 transition"
                  title="Technique & Form Cues"
                >
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                <button
                  onClick={() => onOpenHistory(ex.exerciseId, ex.exerciseName)}
                  className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-white border border-charcoal-800 transition"
                  title="Progressive Overload History"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                </button>

                {onEditExercise && (
                  <button
                    onClick={() => onEditExercise(ex, exIndex)}
                    className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-400 border border-charcoal-800 transition"
                    title="Edit Exercise Target Sets / Reps"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                )}

                {onDeleteExercise && (
                  <button
                    onClick={() => onDeleteExercise(ex.exerciseId, ex.exerciseName)}
                    className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-charcoal-800 transition"
                    title="Remove Exercise from Routine"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                )}
              </div>
            </div>

            {/* ACSM 2026 Overload & Scaling Advice */}
            {(ex.progressionRule || ex.beginnerAlternative) && (
              <div className="px-3 py-2 rounded-xl bg-charcoal-850/80 border border-charcoal-800 text-[11px] space-y-1">
                <button
                  type="button"
                  onClick={() => setExpandedTips((prev) => ({ ...prev, [ex.exerciseId]: !prev[ex.exerciseId] }))}
                  className="w-full flex items-center justify-between text-slate-400 hover:text-slate-200 transition text-left"
                >
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                    <Sparkles className="w-3 h-3" />
                    ACSM Overload & Scaling Advice
                  </span>
                  {isTipExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isTipExpanded && (
                  <div className="pt-1.5 space-y-1 border-t border-charcoal-800 text-slate-300">
                    {ex.progressionRule && (
                      <p className="leading-relaxed">
                        <strong className="text-emerald-300">Overload Rule:</strong> {ex.progressionRule}
                      </p>
                    )}
                    {ex.beginnerAlternative && (
                      <p className="leading-relaxed">
                        <strong className="text-amber-300">Beginner Scaling:</strong> {ex.beginnerAlternative}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sets Logging Table */}
            <div className="space-y-2">
              {Array.from({ length: ex.targetSets }).map((_, setIdx) => {
                const setNum = setIdx + 1;
                const existingLog = exerciseLogs.find((l) => l.setNumber === setNum);
                const isCompleted = existingLog?.completed || false;

                return (
                  <div
                    key={setNum}
                    className={`p-2.5 rounded-xl border text-xs flex flex-wrap items-center justify-between gap-3 transition ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-800/60'
                        : 'bg-charcoal-850 border-charcoal-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleToggleSet(ex, setNum, existingLog)}
                        className="p-1 rounded-lg hover:scale-105 transition"
                        title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
                        )}
                      </button>
                      <span className="font-bold text-white">Set {setNum}</span>
                      <span className="text-[11px] text-slate-400">
                        ({ex.targetRepsOrDuration})
                      </span>
                    </div>

                    {/* Inputs: Actual reps, load */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-400">Reps/Time:</label>
                        <input
                          type="text"
                          defaultValue={existingLog?.actualRepsOrDuration || ex.targetRepsOrDuration}
                          placeholder={ex.targetRepsOrDuration}
                          onBlur={(e) => {
                            if (existingLog) {
                              handleUpdateLogField(existingLog, 'actualRepsOrDuration', e.target.value);
                            } else {
                              logWorkoutSet({
                                date: selectedDate,
                                exerciseId: ex.exerciseId,
                                exerciseName: ex.exerciseName,
                                setNumber: setNum,
                                targetRepsOrDuration: ex.targetRepsOrDuration,
                                actualRepsOrDuration: e.target.value,
                                weightKg: 0,
                                completed: true,
                              });
                            }
                          }}
                          className="w-24 bg-charcoal-900 border border-charcoal-700 rounded-lg px-2 py-1 text-white text-center text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-slate-400">Backpack Load:</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.5"
                            defaultValue={existingLog?.weightKg || 0}
                            placeholder="0"
                            onBlur={(e) => {
                              const val = Number(e.target.value) || 0;
                              if (existingLog) {
                                handleUpdateLogField(existingLog, 'weightKg', val);
                              } else {
                                logWorkoutSet({
                                  date: selectedDate,
                                  exerciseId: ex.exerciseId,
                                  exerciseName: ex.exerciseName,
                                  setNumber: setNum,
                                  targetRepsOrDuration: ex.targetRepsOrDuration,
                                  actualRepsOrDuration: ex.targetRepsOrDuration,
                                  weightKg: val,
                                  completed: true,
                                });
                              }
                            }}
                            className="w-16 bg-charcoal-900 border border-charcoal-700 rounded-lg px-2 py-1 text-emerald-400 font-bold text-center text-xs"
                          />
                          <span className="text-[10px] text-slate-400 ml-1">kg</span>
                        </div>
                      </div>

                      {existingLog && (
                        <button
                          onClick={() => deleteWorkoutSet(existingLog.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                          title="Clear set"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {onAddExerciseClick && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onAddExerciseClick}
            className="w-full py-3 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-dashed border-charcoal-700 hover:border-emerald-500/60 text-slate-300 hover:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Add Exercise to Today's Routine</span>
          </button>
        </div>
      )}
    </div>
  );
};
