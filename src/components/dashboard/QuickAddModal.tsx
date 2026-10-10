import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';
import { MealType } from '../../types';
import { Utensils, Droplets, Dumbbell, Scale, Plus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'meal' | 'water' | 'weight' | 'workout';
}

export const QuickAddModal: React.FC<Props> = ({ isOpen, onClose, initialTab = 'meal' }) => {
  const { addFood, quickAddWater, addMeasurement, currentWorkoutPlan, saveCheckin, selectedDate, stats } = useFitness();
  const [activeTab, setActiveTab] = useState<'meal' | 'water' | 'weight' | 'workout'>(initialTab);

  // Meal quick add state
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<MealType>('snack');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('serving');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [isEstimate, setIsEstimate] = useState(true);

  // Weight quick add state
  const [weight, setWeight] = useState(String(stats.currentWeight || 50));
  const [notes, setNotes] = useState('');

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !calories) return;

    await addFood({
      date: selectedDate,
      mealType,
      foodName: foodName.trim(),
      quantity: Number(quantity) || 1,
      unit,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: 0,
      fats: 0,
      isEstimate,
    });

    setFoodName('');
    setCalories('');
    setProtein('');
    onClose();
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    await addMeasurement({
      date: selectedDate,
      weightKg: Number(weight),
      performanceNotes: notes,
    });

    onClose();
  };

  const handleMarkWorkoutDone = async () => {
    await saveCheckin({ workoutCompleted: true });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Record"
      subtitle={`Log activity for ${selectedDate}`}
      maxWidth="md"
    >
      {/* Tab Switcher */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-charcoal-850 rounded-xl mb-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('meal')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
            activeTab === 'meal' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Food</span>
        </button>
        <button
          onClick={() => setActiveTab('water')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
            activeTab === 'water' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Water</span>
        </button>
        <button
          onClick={() => setActiveTab('weight')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
            activeTab === 'weight' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Weight</span>
        </button>
        <button
          onClick={() => setActiveTab('workout')}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
            activeTab === 'workout' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Workout</span>
        </button>
      </div>

      {/* Food Tab */}
      {activeTab === 'meal' && (
        <form onSubmit={handleAddMeal} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Meal Category</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white focus:border-emerald-500"
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
            <label className="block text-slate-300 font-medium mb-1">Food Item Name</label>
            <input
              type="text"
              placeholder="e.g. Soya chunks curry, Oats milk banana"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              required
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit</label>
              <input
                type="text"
                placeholder="g, ml, katori, bowl"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Calories (kcal) *</label>
              <input
                type="number"
                placeholder="e.g. 350"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 20"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white focus:border-emerald-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-slate-300 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={isEstimate}
              onChange={(e) => setIsEstimate(e.target.checked)}
              className="rounded bg-charcoal-800 border-charcoal-700 text-emerald-500 focus:ring-0"
            />
            <span>Label nutrition values as estimate</span>
          </label>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>
        </form>
      )}

      {/* Water Tab */}
      {activeTab === 'water' && (
        <div className="space-y-4 text-center py-2">
          <Droplets className="w-10 h-10 text-cyan-400 mx-auto" />
          <div>
            <h4 className="text-white font-semibold text-sm">Quick Add Water</h4>
            <p className="text-slate-400 text-xs mt-1">Stay hydrated to support muscle recovery and digestion.</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                quickAddWater(0.25);
                onClose();
              }}
              className="py-3 px-2 rounded-xl bg-charcoal-850 hover:bg-cyan-950/40 border border-charcoal-800 hover:border-cyan-700/60 text-cyan-300 font-bold text-xs transition"
            >
              +250 ml
              <span className="block text-[10px] text-slate-400 font-normal">1 Glass</span>
            </button>
            <button
              onClick={() => {
                quickAddWater(0.5);
                onClose();
              }}
              className="py-3 px-2 rounded-xl bg-charcoal-850 hover:bg-cyan-950/40 border border-charcoal-800 hover:border-cyan-700/60 text-cyan-300 font-bold text-xs transition"
            >
              +500 ml
              <span className="block text-[10px] text-slate-400 font-normal">1 Bottle</span>
            </button>
            <button
              onClick={() => {
                quickAddWater(1.0);
                onClose();
              }}
              className="py-3 px-2 rounded-xl bg-charcoal-850 hover:bg-cyan-950/40 border border-charcoal-800 hover:border-cyan-700/60 text-cyan-300 font-bold text-xs transition"
            >
              +1.0 Litre
              <span className="block text-[10px] text-slate-400 font-normal">Full Jug</span>
            </button>
          </div>
        </div>
      )}

      {/* Weight Tab */}
      {activeTab === 'weight' && (
        <form onSubmit={handleAddWeight} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Morning Body Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              placeholder="e.g. 50.2"
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2.5 text-white text-base focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Baseline: 50.0 kg • Weigh first thing in the morning.</p>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Notes / Reflection (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Feeling energetic, rested well"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-800 rounded-lg p-2 text-white focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center justify-center gap-2 transition"
          >
            <Scale className="w-4 h-4" />
            <span>Save Weight</span>
          </button>
        </form>
      )}

      {/* Workout Tab */}
      {activeTab === 'workout' && (
        <div className="space-y-4 py-2 text-xs">
          <div className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-800">
            <span className="text-slate-400 block text-[11px]">Today's Scheduled Session:</span>
            <div className="text-sm font-bold text-white mt-0.5">
              {currentWorkoutPlan?.title || 'Rest Day'}
            </div>
            <p className="text-slate-300 text-xs mt-1">
              {currentWorkoutPlan?.description || 'Take time to recover.'}
            </p>
          </div>

          <button
            onClick={handleMarkWorkoutDone}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-2 transition"
          >
            <Dumbbell className="w-4 h-4" />
            <span>Mark Workout Complete</span>
          </button>
        </div>
      )}
    </Modal>
  );
};
