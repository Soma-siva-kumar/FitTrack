import * as XLSX from 'xlsx';
import {
  BodyMeasurementEntry,
  DailyProgress,
  ExerciseItem,
  FoodItem,
  MealTemplate,
  UserSettings,
  WorkoutLogEntry,
  WorkoutPlanDay,
} from '../types';

export interface ExportDataPayload {
  dailyProgress: DailyProgress[];
  foodLogs: FoodItem[];
  mealTemplates: MealTemplate[];
  workoutPlans: WorkoutPlanDay[];
  workoutLogs: WorkoutLogEntry[];
  exerciseLibrary: ExerciseItem[];
  measurements: BodyMeasurementEntry[];
  settings: UserSettings;
}

/**
 * Auto-fit column widths based on contents and headers
 */
function getColumnWidths(data: Record<string, unknown>[]): { wch: number }[] {
  if (!data || data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    let maxLen = key.length;
    data.forEach((row) => {
      const val = row[key];
      if (val !== undefined && val !== null) {
        const str = String(val);
        if (str.length > maxLen) maxLen = Math.min(str.length, 60);
      }
    });
    return { wch: Math.max(maxLen + 3, 10) };
  });
}

/**
 * Generate and download complete .xlsx workbook containing all 8 tabs
 */
export function exportFullExcelWorkbook(payload: ExportDataPayload, filename = 'FitTrack82_Full_Backup.xlsx') {
  const wb = XLSX.utils.book_new();

  // 1. DailyProgress tab
  const dailyData = payload.dailyProgress.map((dp) => ({
    'ID': dp.id,
    'Date (YYYY-MM-DD)': dp.date,
    'Day #': dp.dayNumber,
    'Weight (kg)': dp.weightKg ?? '',
    'Water (Liters)': dp.waterLiters,
    'Calories Consumed (kcal)': dp.caloriesConsumed,
    'Protein Consumed (g)': dp.proteinGrams,
    'Food Log Completed': dp.foodLoggingCompleted ? 'YES' : 'NO',
    'Protein Goal Reached': dp.proteinTargetReached ? 'YES' : 'NO',
    'Workout Completed': dp.workoutCompleted ? 'YES' : 'NO',
    'Rest Day': dp.restDay ? 'YES' : 'NO',
    'Abs Session Done': dp.absCompleted ? 'YES' : 'NO',
    'Sleep (Hours)': dp.sleepHours,
    'Energy Rating (1-5)': dp.energyRating,
    'Completion %': `${dp.completionPercentage}%`,
    'Notes': dp.notes ?? '',
    'Last Updated': dp.updatedAt,
  }));
  const wsDaily = XLSX.utils.json_to_sheet(dailyData);
  wsDaily['!cols'] = getColumnWidths(dailyData);
  XLSX.utils.book_append_sheet(wb, wsDaily, 'DailyProgress');

  // 2. FoodLog tab
  const foodData = payload.foodLogs.map((fl) => ({
    'ID': fl.id,
    'Date': fl.date,
    'Meal Category': fl.mealType.toUpperCase(),
    'Intake Time': fl.time ?? '',
    'Food Item Name': fl.foodName,
    'Quantity': fl.quantity,
    'Unit': fl.unit,
    'Calories (kcal)': fl.calories,
    'Protein (g)': fl.protein,
    'Carbohydrates (g)': fl.carbs,
    'Fats (g)': fl.fats,
    'Is Estimate': fl.isEstimate ? 'YES' : 'NO',
    'Notes': fl.notes ?? '',
    'Logged At': fl.createdAt,
  }));
  const wsFood = XLSX.utils.json_to_sheet(foodData);
  wsFood['!cols'] = getColumnWidths(foodData);
  XLSX.utils.book_append_sheet(wb, wsFood, 'FoodLog');

  // 3. MealTemplates tab
  const tmplData = payload.mealTemplates.map((t) => ({
    'ID': t.id,
    'Template Name': t.name,
    'Meal Category': t.mealType,
    'Total Calories (kcal)': t.totalCalories,
    'Total Protein (g)': t.totalProtein,
    'Total Carbs (g)': t.totalCarbs,
    'Total Fats (g)': t.totalFats,
    'Vegetarian': t.isVegetarian ? 'YES' : 'NO',
    'Description': t.description,
    'Item Details': t.items.map((i) => `${i.foodName} (${i.quantity}${i.unit}: ${i.calories}kcal, ${i.protein}g P)`).join('; '),
  }));
  const wsTmpl = XLSX.utils.json_to_sheet(tmplData);
  wsTmpl['!cols'] = getColumnWidths(tmplData);
  XLSX.utils.book_append_sheet(wb, wsTmpl, 'MealTemplates');

  // 4. WorkoutPlan tab
  const planData = payload.workoutPlans.map((wp) => ({
    'ID': wp.id,
    'Date': wp.date,
    'Day #': wp.dayNumber,
    'Day of Week': wp.dayOfWeek,
    'Workout Type': wp.workoutType,
    'Title': wp.title,
    'Rest Day': wp.isRestDay ? 'YES' : 'NO',
    'Description': wp.description,
    'Target Exercises': wp.targetExercises.map((e) => `${e.exerciseName} (${e.targetSets} sets x ${e.targetRepsOrDuration})`).join('; '),
  }));
  const wsPlan = XLSX.utils.json_to_sheet(planData);
  wsPlan['!cols'] = getColumnWidths(planData);
  XLSX.utils.book_append_sheet(wb, wsPlan, 'WorkoutPlan');

  // 5. WorkoutLog tab
  const logData = payload.workoutLogs.map((wl) => ({
    'ID': wl.id,
    'Date': wl.date,
    'Exercise ID': wl.exerciseId,
    'Exercise Name': wl.exerciseName,
    'Set #': wl.setNumber,
    'Target Reps/Time': wl.targetRepsOrDuration,
    'Actual Reps/Time': wl.actualRepsOrDuration,
    'Weight/Load (kg)': wl.weightKg,
    'Completed': wl.completed ? 'YES' : 'NO',
    'RPE (1-10)': wl.rpe ?? '',
    'Form & Difficulty Notes': wl.formNotes ?? '',
    'Timestamp': wl.timestamp,
  }));
  const wsLog = XLSX.utils.json_to_sheet(logData);
  wsLog['!cols'] = getColumnWidths(logData);
  XLSX.utils.book_append_sheet(wb, wsLog, 'WorkoutLog');

  // 6. ExerciseLibrary tab
  const libData = payload.exerciseLibrary.map((ex) => ({
    'ID': ex.id,
    'Exercise Name': ex.name,
    'Category': ex.category,
    'Target Muscles': ex.targetMuscles,
    'Equipment': ex.equipment,
    'Default Sets': ex.defaultSets,
    'Default Reps/Duration': ex.defaultRepsOrDuration,
    'Rest Period (sec)': ex.defaultRestSec,
    'Is Abs Specific': ex.isAbs ? 'YES' : 'NO',
    'Form Cues': ex.formCues.join('; '),
    'Substitutions': ex.substitutions,
    'Instructions': ex.instructions.join(' | '),
  }));
  const wsLib = XLSX.utils.json_to_sheet(libData);
  wsLib['!cols'] = getColumnWidths(libData);
  XLSX.utils.book_append_sheet(wb, wsLib, 'ExerciseLibrary');

  // 7. BodyMeasurements tab
  const measData = payload.measurements.map((m) => ({
    'ID': m.id,
    'Date': m.date,
    'Weigh-in Time': m.time ?? '',
    'Condition': m.condition ?? '',
    'Weight (kg)': m.weightKg,
    'Waist (cm)': m.waistCm ?? '',
    'Chest (cm)': m.chestCm ?? '',
    'Arms (cm)': m.armCm ?? '',
    'Thighs (cm)': m.thighCm ?? '',
    'Energy Level (1-5)': m.energyLevel ?? '',
    'Sleep (Hours)': m.sleepDuration ?? '',
    'Performance Notes': m.performanceNotes ?? '',
    'Private Photo Ref': m.photoReference ?? '',
    'Logged At': m.createdAt,
  }));
  const wsMeas = XLSX.utils.json_to_sheet(measData);
  wsMeas['!cols'] = getColumnWidths(measData);
  XLSX.utils.book_append_sheet(wb, wsMeas, 'BodyMeasurements');

  // 8. Settings tab
  const s = payload.settings;
  const settingsData = [
    { 'Setting Parameter': 'Age', 'Value': s.age, 'Unit/Note': 'Years' },
    { 'Setting Parameter': 'Height', 'Value': s.heightCm, 'Unit/Note': 'cm' },
    { 'Setting Parameter': 'Starting Weight', 'Value': s.startingWeightKg, 'Unit/Note': 'kg' },
    { 'Setting Parameter': 'Diet Style', 'Value': s.diet, 'Unit/Note': 'Vegetarian' },
    { 'Setting Parameter': 'Training Experience', 'Value': s.trainingExperience, 'Unit/Note': 'Beginner' },
    { 'Setting Parameter': 'Training Location', 'Value': s.trainingLocation, 'Unit/Note': 'Home' },
    { 'Setting Parameter': 'Budget Level', 'Value': s.budget, 'Unit/Note': 'Low' },
    { 'Setting Parameter': 'Primary Goal', 'Value': s.goal, 'Unit/Note': 'Lean muscle & abs' },
    { 'Setting Parameter': 'Daily Calorie Target (Mid)', 'Value': s.calorieTarget, 'Unit/Note': 'kcal/day' },
    { 'Setting Parameter': 'Daily Calorie Range', 'Value': `${s.calorieTargetMin} - ${s.calorieTargetMax}`, 'Unit/Note': 'kcal' },
    { 'Setting Parameter': 'Daily Protein Target', 'Value': s.proteinTarget, 'Unit/Note': 'g/day' },
    { 'Setting Parameter': 'Daily Protein Range', 'Value': `${s.proteinTargetMin} - ${s.proteinTargetMax}`, 'Unit/Note': 'g' },
    { 'Setting Parameter': 'Daily Water Target', 'Value': s.waterTargetLiters, 'Unit/Note': 'Litres/day' },
    { 'Setting Parameter': 'Daily Sleep Target', 'Value': s.sleepTargetHours, 'Unit/Note': 'Hours/night' },
    { 'Setting Parameter': 'Workout Frequency', 'Value': s.workoutFrequencyPerWeek, 'Unit/Note': 'Sessions/week' },
    { 'Setting Parameter': 'Challenge Start Date', 'Value': '2026-10-11', 'Unit/Note': 'Day 1' },
    { 'Setting Parameter': 'Challenge End Date', 'Value': '2026-12-31', 'Unit/Note': 'Day 82' },
  ];
  const wsSettings = XLSX.utils.json_to_sheet(settingsData);
  wsSettings['!cols'] = getColumnWidths(settingsData);
  XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings');

  // Trigger browser download
  XLSX.writeFile(wb, filename);
}

/**
 * Export specific array of records as CSV
 */
export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
