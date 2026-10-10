import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';
import { addDays, formatDisplayDate } from '../../utils/dateUtils';
import { Copy, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetDate: string;
}

export const CopyDayMealsModal: React.FC<Props> = ({ isOpen, onClose, targetDate }) => {
  const { copyDayMeals, allFoodLogs } = useFitness();
  const yesterday = addDays(targetDate, -1);
  const [sourceDate, setSourceDate] = useState(yesterday);
  const [isCopying, setIsCopying] = useState(false);

  // Check how many items exist on source date
  const itemsOnSourceDate = allFoodLogs.filter((f) => f.date === sourceDate);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const res = await copyDayMeals(sourceDate);
      if (res.success) {
        onClose();
      }
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Copy Previous Day's Meals"
      subtitle={`Duplicate meals to ${formatDisplayDate(targetDate)}`}
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1.5">
            Select Source Date to Copy From:
          </label>
          <input
            type="date"
            value={sourceDate}
            onChange={(e) => e.target.value && setSourceDate(e.target.value)}
            className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white focus:border-emerald-500 cursor-pointer"
          />
        </div>

        <div className="p-3 bg-charcoal-850 rounded-xl border border-charcoal-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatDisplayDate(sourceDate)}</span>
          </div>
          <p className="text-slate-400">
            {itemsOnSourceDate.length > 0 ? (
              <span className="text-emerald-400 font-medium">
                {itemsOnSourceDate.length} food items found ({itemsOnSourceDate.reduce((acc, i) => acc + i.calories, 0)} kcal, {itemsOnSourceDate.reduce((acc, i) => acc + i.protein, 0)}g protein)
              </span>
            ) : (
              <span className="text-amber-400">No food logged on this date</span>
            )}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={isCopying || itemsOnSourceDate.length === 0}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isCopying ? 'Copying...' : 'Copy Meals'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
