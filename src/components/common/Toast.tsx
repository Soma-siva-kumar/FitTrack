import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useFitness();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    info: <Info className="w-4 h-4 text-cyan-400" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/40 bg-charcoal-900/95 text-emerald-200',
    error: 'border-rose-500/40 bg-charcoal-900/95 text-rose-200',
    info: 'border-cyan-500/40 bg-charcoal-900/95 text-cyan-200',
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 z-50 animate-bounce duration-300">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs sm:text-sm font-medium ${
          borderStyles[toastMessage.type]
        }`}
      >
        {icons[toastMessage.type]}
        <span>{toastMessage.text}</span>
      </div>
    </div>
  );
};
