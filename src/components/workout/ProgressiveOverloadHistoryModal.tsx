import React from 'react';
import { Modal } from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';
import { formatDisplayDate } from '../../utils/dateUtils';
import { TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
}

export const ProgressiveOverloadHistoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
}) => {
  const { allWorkoutLogs } = useFitness();

  const history = allWorkoutLogs
    .filter((l) => l.exerciseId === exerciseId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${exerciseName} — Progressive Overload History`}
      subtitle="Track your repetition and backpack load progress over time"
      maxWidth="md"
    >
      <div className="space-y-3 text-xs">
        {history.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {history.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">
                      Set {log.setNumber}: {log.actualRepsOrDuration || log.targetRepsOrDuration}
                    </span>
                    {log.weightKg > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800 text-[10px]">
                        +{log.weightKg} kg load
                      </span>
                    )}
                    {log.completed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDisplayDate(log.date)}
                    </span>
                    {log.rpe && <span>• RPE {log.rpe}/10</span>}
                  </div>
                  {log.formNotes && (
                    <p className="text-[11px] text-slate-300 mt-1 italic">
                      "{log.formNotes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 space-y-1">
            <TrendingUp className="w-8 h-8 text-charcoal-700 mx-auto" />
            <p className="font-semibold text-slate-300">No History Recorded Yet</p>
            <p className="text-[11px]">Complete and log sets for this exercise to establish your progressive overload trend.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
