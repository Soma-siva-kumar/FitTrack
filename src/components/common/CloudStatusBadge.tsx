import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { Cloud, CloudOff, AlertCircle } from 'lucide-react';

interface Props {
  onOpenSetup?: () => void;
}

export const CloudStatusBadge: React.FC<Props> = ({ onOpenSetup }) => {
  const { cloudStatus, isSaving } = useFitness();

  if (isSaving) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Saving...</span>
      </div>
    );
  }

  if (cloudStatus.connected) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/80">
        <Cloud className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Google Sheets Connected</span>
        <span className="sm:hidden">Cloud</span>
      </div>
    );
  }

  return (
    <button
      onClick={onOpenSetup}
      title="Click to view Google Sheets setup instructions"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/80 hover:bg-amber-900/40 transition-colors cursor-pointer"
    >
      <CloudOff className="w-3.5 h-3.5 text-amber-400" />
      <span className="hidden md:inline">Local Storage Mode</span>
      <span className="md:hidden">Local</span>
      <AlertCircle className="w-3 h-3 text-amber-400 ml-0.5" />
    </button>
  );
};
