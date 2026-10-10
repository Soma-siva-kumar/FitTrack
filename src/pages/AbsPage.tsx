import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { ExerciseDetailModal } from '../components/workout/ExerciseDetailModal';
import { WorkoutTimerModal } from '../components/workout/WorkoutTimerModal';
import { ProgressiveOverloadHistoryModal } from '../components/workout/ProgressiveOverloadHistoryModal';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  Activity,
  CheckCircle2,
  Circle,
  Clock,
  Info,
  TrendingUp,
  AlertTriangle,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { DailyProgress, ExerciseItem, WorkoutLogEntry } from '../types';

const ABS_EXERCISES = [
  {
    id: 'ex-reverse-crunch',
    name: 'Reverse Crunch',
    target: 'Lower Rectus Abdominis & Pelvic Control',
    defaultSets: 2,
    defaultReps: '8–12 reps',
    restSec: 60,
    cue: 'Posterior pelvic tilt: curl hips up toward ribs without swinging legs or arching lumbar spine.',
  },
  {
    id: 'ex-dead-bug',
    name: 'Dead Bug',
    target: 'Deep Core, Anti-Extension & Transverse Abdominis',
    defaultSets: 2,
    defaultReps: '8–10 per side',
    restSec: 60,
    cue: 'Glue lower back into floor like you are holding a bill flat. Exhale as opposite limbs extend.',
  },
  {
    id: 'ex-forearm-plank',
    name: 'Forearm Plank',
    target: 'Isometric Anti-Extension Core Endurance',
    defaultSets: 2,
    defaultReps: '15–30 seconds',
    restSec: 60,
    cue: 'Tuck pelvis, squeeze glutes hard, drive forearms into floor to dome shoulder blades.',
  },
  {
    id: 'ex-side-plank',
    name: 'Side Plank',
    target: 'Obliques, Quadratus Lumborum & Lateral Stability',
    defaultSets: 2,
    defaultReps: '15–25s per side',
    restSec: 60,
    cue: 'Straight line from ankle through hip to shoulder. Do not let bottom hip sag toward ground.',
  },
];

export const AbsPage: React.FC = () => {
  const {
    workoutLogs,
    selectedDate,
    logWorkoutSet,
    exerciseLibrary,
    allDailyProgress,
  } = useFitness();

  const [timerModalOpen, setTimerModalOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedExId, setSelectedExId] = useState<string | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyEx, setHistoryEx] = useState<{ id: string; name: string }>({ id: '', name: '' });

  // Weekly abs completion calculation (all completed records)
  const absCompletedDaysCount = allDailyProgress.filter((p: DailyProgress) => p.absCompleted).length;

  const handleToggleAbsSet = async (
    exId: string,
    exName: string,
    setNum: number,
    targetReps: string,
    existingLog?: WorkoutLogEntry
  ) => {
    if (existingLog) {
      await logWorkoutSet({
        ...existingLog,
        completed: !existingLog.completed,
      });
    } else {
      await logWorkoutSet({
        date: selectedDate,
        exerciseId: exId,
        exerciseName: exName,
        setNumber: setNum,
        targetRepsOrDuration: targetReps,
        actualRepsOrDuration: targetReps,
        weightKg: 0,
        completed: true,
      });
    }
  };

  const handleOpenInfo = (id: string) => {
    setSelectedExId(id);
    setInfoModalOpen(true);
  };

  const handleOpenHistory = (id: string, name: string) => {
    setHistoryEx({ id, name });
    setHistoryModalOpen(true);
  };

  const selectedExerciseObj = exerciseLibrary.find((e: ExerciseItem) => e.id === selectedExId);

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Targeted Abdominal Routine</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated core stabilization for {formatDisplayDate(selectedDate)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>{absCompletedDaysCount} Total Abs Sessions</span>
            </div>
          </div>
        </div>

        {/* Essential Science & Educational Truth Card */}
        <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            The Truth About "Spot Reduction" & Six-Pack Definition
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Abdominal exercises build muscle thickness and spinal stability in the <strong>rectus abdominis</strong>, <strong>transverse abdominis</strong>, and <strong>obliques</strong>.
            However, abdominal exercises <em>do not selectively burn belly fat</em>. Spot reduction is a biological myth.
            Muscle definition becomes visible through consistent overall muscular development, healthy nutrition, and gradual systemic body composition changes over time.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> No dehydration shortcuts
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Train core with control, not momentum
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 2-3 sessions per week is optimal
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Exercises Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ABS_EXERCISES.map((ex) => {
          const exerciseLogs = workoutLogs.filter((l: WorkoutLogEntry) => l.exerciseId === ex.id);

          return (
            <div key={ex.id} className="card-base p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-charcoal-800 pb-2.5">
                  <div>
                    <h4 className="font-bold text-white text-base">{ex.name}</h4>
                    <span className="text-[11px] text-emerald-400 font-medium">{ex.target}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setTimerDuration(ex.restSec);
                        setTimerModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-emerald-400"
                      title="Rest Timer"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenInfo(ex.id)}
                      className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-white"
                      title="Technique Info"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenHistory(ex.id, ex.name)}
                      className="p-1.5 rounded-lg bg-charcoal-850 hover:bg-charcoal-800 text-slate-300 hover:text-white"
                      title="View Log History"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic my-2">
                  Form Cue: {ex.cue}
                </p>

                {/* Sets List */}
                <div className="space-y-2 mt-3">
                  {Array.from({ length: ex.defaultSets }).map((_, idx) => {
                    const setNum = idx + 1;
                    const log = exerciseLogs.find((l: WorkoutLogEntry) => l.setNumber === setNum);
                    const completed = log?.completed || false;

                    return (
                      <div
                        key={setNum}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${
                          completed
                            ? 'bg-emerald-950/25 border-emerald-800/80'
                            : 'bg-charcoal-850 border-charcoal-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleAbsSet(ex.id, ex.name, setNum, ex.defaultReps, log)
                            }
                            className="p-0.5 hover:scale-105 transition"
                          >
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 hover:text-emerald-400" />
                            )}
                          </button>
                          <span className="font-bold text-white">Set {setNum}</span>
                          <span className="text-slate-400 text-[11px]">({ex.defaultReps})</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            defaultValue={log?.actualRepsOrDuration || ex.defaultReps}
                            placeholder={ex.defaultReps}
                            onBlur={(e) => {
                              logWorkoutSet({
                                date: selectedDate,
                                exerciseId: ex.id,
                                exerciseName: ex.name,
                                setNumber: setNum,
                                targetRepsOrDuration: ex.defaultReps,
                                actualRepsOrDuration: e.target.value,
                                weightKg: 0,
                                completed: true,
                              });
                            }}
                            className="w-24 bg-charcoal-900 border border-charcoal-700 rounded-lg px-2 py-0.5 text-white text-center text-xs"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-charcoal-800 text-[10px] text-slate-400 flex justify-between">
                <span>Prescription: {ex.defaultSets} sets × {ex.defaultReps}</span>
                <span>Rest: {ex.restSec}s</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <WorkoutTimerModal
        isOpen={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
        defaultSeconds={timerDuration}
      />

      <ExerciseDetailModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        exercise={selectedExerciseObj}
      />

      <ProgressiveOverloadHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        exerciseId={historyEx.id}
        exerciseName={historyEx.name}
      />
    </div>
  );
};
