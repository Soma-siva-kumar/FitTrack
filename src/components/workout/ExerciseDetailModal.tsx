import React from 'react';
import { Modal } from '../common/Modal';
import { ExerciseItem } from '../../types';
import { FitnessImage } from '../common/FitnessImage';
import { getExerciseImage } from '../../services/imageService';
import { CheckCircle2, AlertCircle, Dumbbell, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exercise?: ExerciseItem | null;
}

export const ExerciseDetailModal: React.FC<Props> = ({ isOpen, onClose, exercise }) => {
  if (!exercise) return null;

  const imageUrl = exercise.imageUrl || getExerciseImage(exercise.id, exercise.name);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise.name}
      subtitle={`${exercise.category} • Equipment: ${exercise.equipment}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Visual Exercise Image */}
        <div className="rounded-xl overflow-hidden border border-charcoal-800 shadow-md">
          <FitnessImage
            src={imageUrl}
            alt={exercise.name}
            aspectRatio="wide"
            fallbackType="exercise"
            className="w-full"
          />
        </div>

        {/* Muscle & Prescription tags */}
        <div className="p-3 bg-charcoal-850 rounded-xl border border-charcoal-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Target Muscles:</span>
              <span className="text-emerald-400 font-bold text-sm">{exercise.targetMuscles}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">ACSM Guideline:</span>
              <span className="text-white font-bold text-xs">
                {exercise.defaultSets} sets × {exercise.defaultRepsOrDuration}
              </span>
            </div>
          </div>
        </div>

        {/* ACSM 2026 Progressive Overload Guidance */}
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/50 space-y-1.5">
          <h4 className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ACSM 2026 Progressive Overload Rule
          </h4>
          <p className="text-slate-300 text-xs leading-relaxed">
            {exercise.progressionRule ||
              'ACSM 2026 Overload Rule: Add 1-2 repetitions per set while maintaining strict 2-second eccentric tempo before adding backpack weight or increasing difficulty.'}
          </p>
        </div>

        {/* Abdominal Fat Loss Clarification (if core/abs) */}
        {exercise.isAbs && (
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-1">
            <h4 className="font-bold text-purple-300 flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Core Sculpting & Fat Loss Reality
            </h4>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Abdominal exercises thicken and strengthen the rectus abdominis and obliques. However, exercises cannot spot-reduce subcutaneous belly fat. Fat reduction is systemic, guided by a modest energy deficit and consistent daily tracking.
            </p>
          </div>
        )}

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

        {/* Safe Substitutions & Beginner Alternative */}
        <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800 space-y-1">
          <h4 className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Beginner Alternative & Safe Substitutions
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">{exercise.substitutions}</p>
        </div>
      </div>
    </Modal>
  );
};
