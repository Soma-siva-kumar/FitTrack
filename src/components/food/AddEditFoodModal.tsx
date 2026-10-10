import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { FoodItem, MealType } from '../../types';
import { Plus, Save, Sparkles, Clock, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (food: Omit<FoodItem, 'id' | 'createdAt'> | FoodItem) => Promise<boolean>;
  editingFood?: FoodItem | null;
  defaultMealType?: MealType;
  selectedDate: string;
}

export const AddEditFoodModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingFood,
  defaultMealType = 'breakfast',
  selectedDate,
}) => {
  const [entryDate, setEntryDate] = useState(selectedDate);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [foodName, setFoodName] = useState('');
  const [intakeTime, setIntakeTime] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [isEstimate, setIsEstimate] = useState(true);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingFood) {
      setEntryDate(editingFood.date);
      setMealType(editingFood.mealType);
      setFoodName(editingFood.foodName);
      setIntakeTime(editingFood.time || '');
      setQuantity(String(editingFood.quantity));
      setUnit(editingFood.unit);
      setCalories(String(editingFood.calories));
      setProtein(String(editingFood.protein));
      setCarbs(String(editingFood.carbs));
      setFats(String(editingFood.fats));
      setIsEstimate(editingFood.isEstimate);
      setNotes(editingFood.notes || '');
    } else {
      setEntryDate(selectedDate);
      setMealType(defaultMealType);
      setFoodName('');
      // Set reasonable default intake time based on meal type
      const defaultTimes: Record<MealType, string> = {
        breakfast: '08:30',
        lunch: '13:00',
        pre_workout: '16:30',
        post_workout: '18:00',
        dinner: '20:30',
        snack: '11:00',
      };
      setIntakeTime(defaultTimes[defaultMealType] || '08:30');
      setQuantity('100');
      setUnit('g');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setIsEstimate(true);
      setNotes('');
    }
  }, [editingFood, defaultMealType, selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !calories) return;

    setIsSaving(true);
    try {
      const payload = {
        date: entryDate,
        mealType,
        foodName: foodName.trim(),
        time: intakeTime.trim() || undefined,
        quantity: Number(quantity) || 1,
        unit: unit.trim() || 'serving',
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        isEstimate,
        notes: notes.trim() || undefined,
      };

      if (editingFood) {
        await onSave({ ...payload, id: editingFood.id, createdAt: editingFood.createdAt });
      } else {
        await onSave(payload);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingFood ? 'Edit Food Item & Timing' : 'Add Food Item & Timing'}
      subtitle={`Log nutrition and timing for ${entryDate}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Date & Intake Time Row (Editable) */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-charcoal-850 rounded-xl border border-charcoal-800">
          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Intake Date *
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              required
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg p-2 text-white focus:border-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Intake Timing (Time)
            </label>
            <input
              type="time"
              value={intakeTime}
              onChange={(e) => setIntakeTime(e.target.value)}
              className="w-full bg-charcoal-900 border border-charcoal-700 rounded-lg p-2 text-white focus:border-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Meal Category & Food Name */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Meal Category *</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white focus:border-emerald-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="pre_workout">Pre-Workout</option>
              <option value="post_workout">Post-Workout</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Food Name *</label>
            <input
              type="text"
              placeholder="e.g. Soya Chunks Curry, Oats Bowl"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Quantity & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Serving Quantity</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Unit</label>
            <input
              type="text"
              placeholder="g, ml, piece, katori, bowl"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Nutritional Breakdown */}
        <div className="p-3 bg-charcoal-850 rounded-xl border border-charcoal-800 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Nutritional Breakdown
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-slate-300 font-medium mb-1 text-[11px]">Calories (kcal) *</label>
              <input
                type="number"
                placeholder="0"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white font-bold focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1 text-[11px]">Protein (g) *</label>
              <input
                type="number"
                step="0.1"
                placeholder="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-emerald-400 font-bold focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1 text-[11px]">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                placeholder="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1 text-[11px]">Fats (g)</label>
              <input
                type="number"
                step="0.1"
                placeholder="0"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Notes / Brand (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Cooked with 1 tsp oil, warm milk, home recipe"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white focus:border-emerald-500"
          />
        </div>

        <label className="flex items-center gap-2 text-slate-300 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isEstimate}
            onChange={(e) => setIsEstimate(e.target.checked)}
            className="rounded bg-charcoal-800 border-charcoal-700 text-emerald-500 focus:ring-0"
          />
          <span>Label nutrition values as estimate (unverified portion)</span>
        </label>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
          >
            {editingFood ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{editingFood ? 'Save Changes' : 'Add Food Item'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
