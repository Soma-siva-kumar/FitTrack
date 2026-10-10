import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';
import { MealTemplate, MealType } from '../../types';
import { Utensils, Sparkles, Check, Plus, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetMealType?: MealType;
}

export const MealTemplatesModal: React.FC<Props> = ({ isOpen, onClose, targetMealType }) => {
  const { mealTemplates, applyTemplate, deleteTemplate, saveTemplate } = useFitness();
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(targetMealType || 'breakfast');
  const [isApplying, setIsApplying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New template state
  const [name, setName] = useState('');
  const [newMealType, setNewMealType] = useState<MealType>('breakfast');
  const [description, setDescription] = useState('');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  const handleApply = async (templateId: string) => {
    setIsApplying(true);
    try {
      await applyTemplate(templateId, selectedMealType);
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !foodName.trim() || !calories) return;

    const newTmpl: MealTemplate = {
      id: `tmpl-${Date.now()}`,
      name: name.trim(),
      mealType: newMealType,
      description: description.trim() || 'Custom meal template',
      isVegetarian: true,
      totalCalories: Number(calories) || 0,
      totalProtein: Number(protein) || 0,
      totalCarbs: 0,
      totalFats: 0,
      items: [
        {
          foodName: foodName.trim(),
          quantity: Number(quantity) || 1,
          unit,
          calories: Number(calories) || 0,
          protein: Number(protein) || 0,
          carbs: 0,
          fats: 0,
          isEstimate: false,
        },
      ],
    };

    await saveTemplate(newTmpl);
    setIsCreating(false);
    setName('');
    setFoodName('');
    setCalories('');
    setProtein('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Indian Vegetarian Meal Templates"
      subtitle="Affordable, high-protein vegetarian recipes optimized for muscle gain"
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs">
        {/* Toggle between templates and create new */}
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
          <div className="flex items-center gap-2">
            <label className="text-slate-300 font-medium">Apply as:</label>
            <select
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value as MealType)}
              className="bg-charcoal-850 border border-charcoal-800 rounded-lg px-2.5 py-1 text-white focus:border-emerald-500"
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="pre_workout">Pre-Workout</option>
              <option value="post_workout">Post-Workout</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>

          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-200 transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isCreating ? 'View Templates' : 'New Template'}</span>
          </button>
        </div>

        {isCreating ? (
          <form onSubmit={handleCreateTemplate} className="space-y-3 p-3 bg-charcoal-850 rounded-xl border border-charcoal-800">
            <h4 className="font-bold text-white text-sm">Create Custom Vegetarian Template</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sattu & Banana Shake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Default Meal Category</label>
                <select
                  value={newMealType}
                  onChange={(e) => setNewMealType(e.target.value as MealType)}
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="pre_workout">Pre-Workout</option>
                  <option value="post_workout">Post-Workout</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">Food Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Chana Sattu"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Quantity & Unit</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-16 bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
                  />
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-16 bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Calories (kcal)</label>
                <input
                  type="number"
                  placeholder="300"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="20"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Notes / Description</label>
              <input
                type="text"
                placeholder="High protein affordable snack"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-charcoal-900 border border-charcoal-800 rounded-lg p-2 text-white"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
            >
              Save Template
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {mealTemplates.map((template) => (
              <div
                key={template.id}
                className="p-3.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800/80 border border-charcoal-800 space-y-2.5 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-white text-sm">{template.name}</h5>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Delete template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Nutrients Badge */}
                  <div className="flex items-center gap-2 mt-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-900">
                      {template.totalCalories} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900 font-bold">
                      {template.totalProtein}g protein
                    </span>
                  </div>

                  {/* Ingredients summary */}
                  <div className="mt-2 text-[10px] text-slate-400 space-y-0.5 border-t border-charcoal-800 pt-1.5">
                    {template.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {i.foodName} ({i.quantity}{i.unit})</span>
                        <span className="text-slate-400">{i.calories} kcal | {i.protein}g P</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleApply(template.id)}
                  disabled={isApplying}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition mt-2 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply to {selectedMealType.toUpperCase()}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
