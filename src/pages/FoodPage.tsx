import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { FoodItem, MealType } from '../types';
import { MealCategoryCard } from '../components/food/MealCategoryCard';
import { AddEditFoodModal } from '../components/food/AddEditFoodModal';
import { MealTemplatesModal } from '../components/food/MealTemplatesModal';
import { CopyDayMealsModal } from '../components/food/CopyDayMealsModal';
import { formatDisplayDate } from '../utils/dateUtils';
import {
  Utensils,
  Plus,
  BookOpen,
  Copy,
  Flame,
  Award,
  HelpCircle,
} from 'lucide-react';

const MEAL_CATEGORIES: { type: MealType; title: string }[] = [
  { type: 'breakfast', title: 'Breakfast' },
  { type: 'lunch', title: 'Lunch' },
  { type: 'pre_workout', title: 'Pre-Workout Fuel' },
  { type: 'post_workout', title: 'Post-Workout Fuel' },
  { type: 'dinner', title: 'Dinner' },
  { type: 'snack', title: 'Snacks & Evening Protein' },
];

export const FoodPage: React.FC = () => {
  const {
    foodLogs,
    selectedDate,
    settings,
    dailyProgress,
    addFood,
    updateFood,
    deleteFood,
  } = useFitness();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [targetCategory, setTargetCategory] = useState<MealType>('breakfast');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);

  const handleOpenAdd = (mealType: MealType) => {
    setEditingFood(null);
    setTargetCategory(mealType);
    setAddModalOpen(true);
  };

  const handleEdit = (item: FoodItem) => {
    setEditingFood(item);
    setTargetCategory(item.mealType);
    setAddModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}"?`)) {
      await deleteFood(id);
    }
  };

  const caloriesRemaining = Math.max(0, settings.calorieTarget - dailyProgress.caloriesConsumed);
  const proteinRemaining = Math.max(0, Math.round((settings.proteinTarget - dailyProgress.proteinGrams) * 10) / 10);
  const totalCarbs = Math.round(foodLogs.reduce((sum: number, item: FoodItem) => sum + (Number(item.carbs) || 0), 0) * 10) / 10;
  const totalFats = Math.round(foodLogs.reduce((sum: number, item: FoodItem) => sum + (Number(item.fats) || 0), 0) * 10) / 10;

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner: Nutrition Targets & Action Bar */}
      <div className="card-elevated p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Daily Vegetarian Nutrition</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged food for {formatDisplayDate(selectedDate)} • High protein vegetarian protocol
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCopyModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 text-xs font-medium border border-charcoal-800 transition"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy Previous Day</span>
            </button>

            <button
              onClick={() => setTemplateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 text-slate-200 text-xs font-medium border border-charcoal-800 transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Meal Templates</span>
            </button>

            <button
              onClick={() => handleOpenAdd('breakfast')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Food Item</span>
            </button>
          </div>
        </div>

        {/* Nutrition Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Calories */}
          <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Calories
              </span>
              <span className="text-[11px]">{caloriesRemaining > 0 ? `${caloriesRemaining} left` : 'Goal met'}</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-white">{dailyProgress.caloriesConsumed}</span>
              <span className="text-xs text-slate-400"> / {settings.calorieTarget} kcal</span>
            </div>
            <div className="w-full bg-charcoal-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (dailyProgress.caloriesConsumed / settings.calorieTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> Protein
              </span>
              <span className="text-[11px]">{proteinRemaining > 0 ? `${proteinRemaining}g left` : 'Goal met'}</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-emerald-400">{dailyProgress.proteinGrams}g</span>
              <span className="text-xs text-slate-400"> / {settings.proteinTarget}g</span>
            </div>
            <div className="w-full bg-charcoal-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full"
                style={{ width: `${Math.min(100, (dailyProgress.proteinGrams / settings.proteinTarget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <div className="text-xs text-slate-400">Carbohydrates</div>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-white">{totalCarbs}g</span>
              <span className="text-xs text-slate-400"> logged</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">Energy & Glycogen</div>
          </div>

          {/* Fats */}
          <div className="p-3.5 rounded-xl bg-charcoal-900 border border-charcoal-800">
            <div className="text-xs text-slate-400">Dietary Fats</div>
            <div className="mt-1">
              <span className="text-xl font-extrabold text-white">{totalFats}g</span>
              <span className="text-xs text-slate-400"> logged</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">Hormonal Health</div>
          </div>
        </div>
      </div>

      {/* Educational Note on Estimates */}
      <div className="p-3.5 rounded-xl bg-charcoal-900/70 border border-charcoal-800 text-xs text-slate-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Portion estimates: Unverified Indian household recipes are labeled with an <strong>Est</strong> badge. Cooked dal, sabzi, and curries vary by oil and moisture content.
          </span>
        </div>
      </div>

      {/* Meal Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEAL_CATEGORIES.map((cat) => {
          const items = foodLogs.filter((f: FoodItem) => f.mealType === cat.type);
          return (
            <MealCategoryCard
              key={cat.type}
              mealType={cat.type}
              title={cat.title}
              items={items}
              onAddItem={handleOpenAdd}
              onEditItem={handleEdit}
              onDeleteItem={handleDelete}
            />
          );
        })}
      </div>

      {/* Modals */}
      <AddEditFoodModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={async (item: Omit<FoodItem, 'id' | 'createdAt'> | FoodItem) => {
          if ('id' in item) {
            return await updateFood(item as FoodItem);
          } else {
            return await addFood(item);
          }
        }}
        editingFood={editingFood}
        defaultMealType={targetCategory}
        selectedDate={selectedDate}
      />

      <MealTemplatesModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        targetMealType={targetCategory}
      />

      <CopyDayMealsModal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        targetDate={selectedDate}
      />
    </div>
  );
};
