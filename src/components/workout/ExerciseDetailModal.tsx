import React from 'react';
import { Modal } from '../common/Modal';
import { ExerciseItem } from '../../types';
import { CheckCircle2, AlertCircle, Dumbbell, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercise?: ExerciseItem | null;
}

export const ExerciseDetailModal: React.FC<Props> = ({ isOpen, onClose, exercise }) => {
  if (!exercise) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise.name}
      subtitle={`${exercise.category} • Equipment: ${exercise.equipment}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Muscle & Prescription tags */}
        <div className="p-3 bg-charcoal-850 rounded-xl border border-charcoal-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Target Muscles:</span>
              <span className="text-emerald-400 font-bold text-sm">{exercise.targetMuscles}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Recommended:</span>
              <span className="text-white font-bold text-xs">
                {exercise.defaultSets} sets × {exercise.defaultRepsOrDuration}
              </span>
            </div>
          </div>
        </div>

        {/* Form Cues */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Essential Form Cues
          </h4>
          <div className="space-y-1.5">
            {exercise.formCues.map((cue, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-charcoal-850 border border-charcoal-800 text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{cue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2">
          <h4 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
            Execution Technique
          </h4>
          <ol className="space-y-1.5 list-decimal list-inside text-slate-300">
            {exercise.instructions.map((step, idx) => (
              <li key={idx} className="p-2 rounded-lg bg-charcoal-850/60 border border-charcoal-800/80 leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Safe Substitutions */}
        <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-1">
          <h4 className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Safe Exercise Substitutions
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">{exercise.substitutions}</p>
        </div>
      </div>
    </Modal>
  );
};
