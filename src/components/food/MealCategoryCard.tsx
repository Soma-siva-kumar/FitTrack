import React from 'react';
import { FoodItem, MealType } from '../../types';
import { FitnessImage } from '../common/FitnessImage';
import { getMealImage } from '../../services/imageService';
import { Plus, Edit2, Trash2, AlertCircle, Clock } from 'lucide-react';

interface Props {
  mealType: MealType;
  title: string;
  items: FoodItem[];
  onAddItem: (mealType: MealType) => void;
  onEditItem: (item: FoodItem) => void;
  onDeleteItem: (id: string, name: string) => void;
}

export const MealCategoryCard: React.FC<Props> = ({
  mealType,
  title,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const totalCalories = items.reduce((sum, i) => sum + (Number(i.calories) || 0), 0);
  const totalProtein = Math.round(items.reduce((sum, i) => sum + (Number(i.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(items.reduce((sum, i) => sum + (Number(i.carbs) || 0), 0) * 10) / 10;
  const totalFats = Math.round(items.reduce((sum, i) => sum + (Number(i.fats) || 0), 0) * 10) / 10;

  return (
    <div className="card-base p-4 space-y-3">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b border-charcoal-800 pb-2.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-white capitalize">{title}</h4>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-charcoal-800 text-slate-300">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="text-right">
            <span className="font-bold text-amber-400">{totalCalories}</span>
            <span className="text-[10px] text-slate-400"> kcal</span>
            <span className="mx-1 text-slate-600">•</span>
            <span className="font-bold text-emerald-400">{totalProtein}g</span>
            <span className="text-[10px] text-slate-400"> protein</span>
          </div>

          <button
            onClick={() => onAddItem(mealType)}
            className="p-1 rounded-lg bg-charcoal-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-charcoal-700/60 transition"
            title="Add item to this meal"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => {
            const mealImg = getMealImage(item.foodName);

            return (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800/80 border border-charcoal-800 flex items-center justify-between gap-3 text-xs transition"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-lg overflow-hidden border border-charcoal-700/80 flex-shrink-0 shadow-sm">
                    <FitnessImage
                      src={mealImg}
                      alt={item.foodName}
                      aspectRatio="square"
                      fallbackType="food"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-white truncate">{item.foodName}</span>
                      <span className="text-[11px] text-slate-400">
                        ({item.quantity} {item.unit})
                      </span>
                      {item.time && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-850/80 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{item.time}</span>
                        </span>
                      )}
                      {item.isEstimate && (
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] bg-charcoal-800 text-amber-400 border border-amber-800/40 flex items-center gap-0.5"
                          title="Estimated nutrition value"
                        >
                          <AlertCircle className="w-2.5 h-2.5" />
                          <span>Est</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span className="text-amber-400 font-medium">{item.calories} kcal</span>
                      <span className="text-emerald-400 font-medium">{item.protein}g P</span>
                      {item.carbs > 0 && <span>{item.carbs}g C</span>}
                      {item.fats > 0 && <span>{item.fats}g F</span>}
                      {item.notes && <span className="text-slate-400 truncate max-w-xs">• {item.notes}</span>}
                    </div>
                  </div>
                </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1 rounded hover:bg-charcoal-700 text-slate-400 hover:text-white"
                  title="Edit item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id, item.foodName)}
                  className="p-1 rounded hover:bg-rose-950/50 text-slate-400 hover:text-rose-400"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

          {/* Micro summary */}
          <div className="text-[10px] text-slate-400 pt-1 flex justify-between px-1">
            <span>Carbs: {totalCarbs}g • Fats: {totalFats}g</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-charcoal-800 rounded-xl">
          <p>No food recorded for {title}.</p>
          <button
            onClick={() => onAddItem(mealType)}
            className="mt-1.5 text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add {title} item
          </button>
        </div>
      )}
    </div>
  );
};
