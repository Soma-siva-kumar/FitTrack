import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  BodyMeasurementEntry,
  ChallengeStats,
  CloudStatus,
  DailyProgress,
  ExerciseItem,
  FoodItem,
  MealTemplate,
  MealType,
  UserSettings,
  WeightGainProjection,
  WorkoutLogEntry,
  WorkoutPlanDay,
} from '../types';
import { storageService } from '../services/storageService';
import { exportFullExcelWorkbook } from '../services/excelExportService';
import {
  CHALLENGE_START_DATE,
  getCurrentISTDate,
  isWithinChallenge,
  TOTAL_CHALLENGE_DAYS,
  getChallengeDayNumber,
} from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface FitnessContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  settings: UserSettings;
  updateSettings: (newSettings: UserSettings) => Promise<boolean>;
  dailyProgress: DailyProgress;
  allDailyProgress: DailyProgress[];
  saveCheckin: (updates: Partial<DailyProgress>) => Promise<boolean>;
  quickAddWater: (liters: number) => Promise<void>;
  foodLogs: FoodItem[];
  allFoodLogs: FoodItem[];
  addFood: (food: Omit<FoodItem, 'id' | 'createdAt'>) => Promise<boolean>;
  updateFood: (food: FoodItem) => Promise<boolean>;
  deleteFood: (id: string) => Promise<boolean>;
  applyTemplate: (templateId: string, mealType?: MealType) => Promise<boolean>;
  copyDayMeals: (fromDate: string) => Promise<{ success: boolean; count: number; error?: string }>;
  mealTemplates: MealTemplate[];
  saveTemplate: (template: MealTemplate) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  currentWorkoutPlan?: WorkoutPlanDay;
  allWorkoutPlans: WorkoutPlanDay[];
  savePlan: (plan: WorkoutPlanDay) => Promise<boolean>;
  workoutLogs: WorkoutLogEntry[];
  allWorkoutLogs: WorkoutLogEntry[];
  logWorkoutSet: (entry: Omit<WorkoutLogEntry, 'id' | 'timestamp'>) => Promise<boolean>;
  deleteWorkoutSet: (id: string) => Promise<boolean>;
  exerciseLibrary: ExerciseItem[];
  measurements: BodyMeasurementEntry[];
  addMeasurement: (entry: Omit<BodyMeasurementEntry, 'id' | 'createdAt'>) => Promise<boolean>;
  updateMeasurement: (entry: BodyMeasurementEntry) => Promise<boolean>;
  deleteMeasurement: (id: string) => Promise<boolean>;
  weightProjection: WeightGainProjection;
  stats: ChallengeStats;
  cloudStatus: CloudStatus;
  refreshCloudStatus: () => Promise<void>;
  syncLocalToCloud: () => Promise<{ success: boolean; message: string }>;
  exportDataToExcel: () => void;
  isLoading: boolean;
  isSaving: boolean;
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Determine initial date: if today's date in IST is before Oct 11, 2026, start at Day 1 (2026-10-11)
  const initialDate = useMemo(() => {
    const today = getCurrentISTDate();
    if (today < CHALLENGE_START_DATE) {
      return CHALLENGE_START_DATE;
    }
    return today;
  }, []);

  const [selectedDate, setSelectedDateState] = useState<string>(initialDate);
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [dailyProgressList, setDailyProgressList] = useState<DailyProgress[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodItem[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanDay[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>([]);
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseItem[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurementEntry[]>([]);
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(storageService.getCloudStatus());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  }, []);

  // Initialize data on mount
  const refreshAllData = useCallback(async () => {
    try {
      storageService.initializeLocalDatabase();
      setSettings(storageService.getSettings());
      setDailyProgressList(storageService.getDailyProgressList());
      setFoodLogs(storageService.getFoodLogs());
      setWorkoutPlans(storageService.getWorkoutPlans());
      setWorkoutLogs(storageService.getWorkoutLogs());
      setMealTemplates(storageService.getMealTemplates());
      setExerciseLibrary(storageService.getExerciseLibrary());
      setMeasurements(storageService.getMeasurements());

      // Check cloud connectivity
      const status = await storageService.checkCloudStatus();
      setCloudStatus(status);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const setSelectedDate = useCallback((date: string) => {
    // If setting outside challenge is restricted
    if (!settings.allowOutsideChallengeDates && !isWithinChallenge(date)) {
      showToast('Date is outside the 82-day challenge window (Oct 11 - Dec 31, 2026).', 'info');
    }
    setSelectedDateState(date);
  }, [settings.allowOutsideChallengeDates, showToast]);

  // Current day's specific records
  const currentDailyProgress = useMemo(() => {
    const found = dailyProgressList.find((p) => p.date === selectedDate);
    if (found) return found;
    return storageService.getDailyProgress(selectedDate);
  }, [dailyProgressList, selectedDate]);

  const currentFoodLogs = useMemo(() => {
    return foodLogs.filter((f) => f.date === selectedDate);
  }, [foodLogs, selectedDate]);

  const currentWorkoutPlan = useMemo(() => {
    return workoutPlans.find((p) => p.date === selectedDate);
  }, [workoutPlans, selectedDate]);

  const currentWorkoutLogs = useMemo(() => {
    return workoutLogs.filter((w) => w.date === selectedDate);
  }, [workoutLogs, selectedDate]);

  // Calculate comprehensive statistics
  const stats: ChallengeStats = useMemo(() => {
    const today = getCurrentISTDate();
    const currentDay = Math.min(Math.max(1, getChallengeDayNumber(today)), TOTAL_CHALLENGE_DAYS);
    const totalDays = TOTAL_CHALLENGE_DAYS;

    // Completed days (completionPercentage >= 70%)
    const completedDaysList = dailyProgressList.filter((p) => p.completionPercentage >= 70);
    const daysCompleted = completedDaysList.length;
    const daysRemaining = Math.max(0, totalDays - currentDay);

    // Consecutive streak ending today or recent completed days
    let streakDays = 0;
    const sortedProgress = [...dailyProgressList].sort((a, b) => b.date.localeCompare(a.date));
    for (const p of sortedProgress) {
      if (p.completionPercentage >= 50 || p.foodLoggingCompleted || p.workoutCompleted || p.restDay) {
        streakDays++;
      } else {
        break;
      }
    }

    // Workouts completed count
    const workoutsCompletedCount = dailyProgressList.filter((p) => p.workoutCompleted).length;
    const strengthDaysTarget = Math.max(1, Math.round((currentDay / 7) * settings.workoutFrequencyPerWeek));
    const workoutCompletionRate = Math.min(100, Math.round((workoutsCompletedCount / strengthDaysTarget) * 100));

    // Averages
    const progressWithCals = dailyProgressList.filter((p) => p.caloriesConsumed > 0);
    const averageCalories = progressWithCals.length
      ? Math.round(progressWithCals.reduce((acc, p) => acc + p.caloriesConsumed, 0) / progressWithCals.length)
      : 0;

    const progressWithProtein = dailyProgressList.filter((p) => p.proteinGrams > 0);
    const averageProtein = progressWithProtein.length
      ? Math.round((progressWithProtein.reduce((acc, p) => acc + p.proteinGrams, 0) / progressWithProtein.length) * 10) / 10
      : 0;

    const progressWithWater = dailyProgressList.filter((p) => p.waterLiters > 0);
    const averageWater = progressWithWater.length
      ? Math.round((progressWithWater.reduce((acc, p) => acc + p.waterLiters, 0) / progressWithWater.length) * 10) / 10
      : 0;

    // Latest weight and weight change from 50 kg baseline
    const sortedMeasurements = [...measurements].sort((a, b) => b.date.localeCompare(a.date));
    const currentWeight = sortedMeasurements.length > 0 ? sortedMeasurements[0].weightKg : settings.startingWeightKg;
    const weightDelta = Math.round((currentWeight - settings.startingWeightKg) * 10) / 10;

    return {
      currentDay,
      totalDays,
      daysCompleted,
      daysRemaining,
      streakDays,
      workoutsCompletedCount,
      workoutCompletionRate,
      averageCalories,
      averageProtein,
      averageWater,
      currentWeight,
      weightDelta,
    };
  }, [dailyProgressList, measurements, settings]);

  // Actions
  const updateSettings = useCallback(async (newSettings: UserSettings): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.saveSettings(newSettings);
      if (res.success) {
        setSettings(newSettings);
        showToast('Settings and provisional targets updated successfully.');
        return true;
      }
      showToast(res.error || 'Failed to update settings', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const saveCheckin = useCallback(async (updates: Partial<DailyProgress>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const current = currentDailyProgress;
      const merged: DailyProgress = { ...current, ...updates };
      merged.completionPercentage = storageService.calculateCompletionPercentage(merged);

      const res = await storageService.saveDailyProgress(merged);
      if (res.success) {
        setDailyProgressList(storageService.getDailyProgressList());
        if (merged.completionPercentage >= 90) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        }
        showToast('Daily check-in saved successfully.');
        return true;
      }
      showToast(res.error || 'Failed to save check-in', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [currentDailyProgress, showToast]);

  const quickAddWater = useCallback(async (liters: number) => {
    const current = currentDailyProgress;
    const newLiters = Math.round((current.waterLiters + liters) * 100) / 100;
    await saveCheckin({ waterLiters: newLiters });
    showToast(`Added ${liters}L water (Total: ${newLiters}L)`);
  }, [currentDailyProgress, saveCheckin, showToast]);

  const addFood = useCallback(async (food: Omit<FoodItem, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const newItem: FoodItem = {
        ...food,
        id: `food-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      const res = await storageService.addFoodLog(newItem);
      if (res.success) {
        setFoodLogs(storageService.getFoodLogs());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast(`Logged "${food.foodName}" successfully.`);
        return true;
      }
      showToast(res.error || 'Failed to log food', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const updateFood = useCallback(async (food: FoodItem): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.updateFoodLog(food);
      if (res.success) {
        setFoodLogs(storageService.getFoodLogs());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast(`Updated "${food.foodName}".`);
        return true;
      }
      showToast(res.error || 'Failed to update food', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const deleteFood = useCallback(async (id: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.deleteFoodLog(id, selectedDate);
      if (res.success) {
        setFoodLogs(storageService.getFoodLogs());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast('Food entry deleted.');
        return true;
      }
      showToast(res.error || 'Failed to delete food', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedDate, showToast]);

  const applyTemplate = useCallback(async (templateId: string, mealTypeOverride?: MealType): Promise<boolean> => {
    const tmpl = mealTemplates.find((t) => t.id === templateId);
    if (!tmpl) {
      showToast('Meal template not found', 'error');
      return false;
    }

    setIsSaving(true);
    try {
      const mealType = mealTypeOverride || tmpl.mealType;
      for (const item of tmpl.items) {
        const newItem: FoodItem = {
          id: `food-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: selectedDate,
          mealType,
          foodName: item.foodName,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          isEstimate: item.isEstimate,
          createdAt: new Date().toISOString(),
        };
        await storageService.addFoodLog(newItem);
      }
      setFoodLogs(storageService.getFoodLogs());
      setDailyProgressList(storageService.getDailyProgressList());
      showToast(`Applied "${tmpl.name}" to ${mealType.toUpperCase()}.`);
      return true;
    } finally {
      setIsSaving(false);
    }
  }, [mealTemplates, selectedDate, showToast]);

  const copyDayMeals = useCallback(async (fromDate: string) => {
    setIsSaving(true);
    try {
      const res = await storageService.copyDayFoodLogs(fromDate, selectedDate);
      if (res.success) {
        setFoodLogs(storageService.getFoodLogs());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast(`Copied ${res.count} food items from ${fromDate}.`);
      } else {
        showToast(res.error || 'Failed to copy food entries', 'error');
      }
      return res;
    } finally {
      setIsSaving(false);
    }
  }, [selectedDate, showToast]);

  const saveTemplate = useCallback(async (template: MealTemplate): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.saveMealTemplate(template);
      if (res.success) {
        setMealTemplates(storageService.getMealTemplates());
        showToast(`Saved meal template "${template.name}".`);
        return true;
      }
      showToast(res.error || 'Failed to save template', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.deleteMealTemplate(id);
      if (res.success) {
        setMealTemplates(storageService.getMealTemplates());
        showToast('Meal template removed.');
        return true;
      }
      showToast(res.error || 'Failed to remove template', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const savePlan = useCallback(async (plan: WorkoutPlanDay): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.saveWorkoutPlan(plan);
      if (res.success) {
        setWorkoutPlans(storageService.getWorkoutPlans());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast('Workout plan updated.');
        return true;
      }
      showToast(res.error || 'Failed to update plan', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const logWorkoutSet = useCallback(async (entry: Omit<WorkoutLogEntry, 'id' | 'timestamp'>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const newEntry: WorkoutLogEntry = {
        ...entry,
        id: `wlog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
      };
      const res = await storageService.saveWorkoutLogEntry(newEntry);
      if (res.success) {
        setWorkoutLogs(storageService.getWorkoutLogs());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast(`Logged set for ${entry.exerciseName}.`);
        return true;
      }
      showToast(res.error || 'Failed to log workout set', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const deleteWorkoutSet = useCallback(async (id: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.deleteWorkoutLogEntry(id, selectedDate);
      if (res.success) {
        setWorkoutLogs(storageService.getWorkoutLogs());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast('Workout set deleted.');
        return true;
      }
      showToast(res.error || 'Failed to delete set', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [selectedDate, showToast]);

  const addMeasurement = useCallback(async (entry: Omit<BodyMeasurementEntry, 'id' | 'createdAt'>): Promise<boolean> => {
    setIsSaving(true);
    try {
      const newEntry: BodyMeasurementEntry = {
        ...entry,
        id: `meas-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      const res = await storageService.saveMeasurement(newEntry);
      if (res.success) {
        setMeasurements(storageService.getMeasurements());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast(`Recorded weight measurement (${entry.weightKg} kg).`);
        return true;
      }
      showToast(res.error || 'Failed to record measurement', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const updateMeasurement = useCallback(async (entry: BodyMeasurementEntry): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.updateMeasurement(entry);
      if (res.success) {
        setMeasurements(storageService.getMeasurements());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast(`Updated weight entry (${entry.weightKg} kg).`);
        return true;
      }
      showToast(res.error || 'Failed to update measurement', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const deleteMeasurement = useCallback(async (id: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await storageService.deleteMeasurement(id);
      if (res.success) {
        setMeasurements(storageService.getMeasurements());
        setDailyProgressList(storageService.getDailyProgressList());
        showToast('Weight measurement deleted.');
        return true;
      }
      showToast(res.error || 'Failed to delete measurement', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  // Complete Lean Weight Gain Projection Engine
  const weightProjection: WeightGainProjection = useMemo(() => {
    const baseline = settings.startingWeightKg; // 50.0
    const bmr = 10 * baseline + 6.25 * settings.heightCm - 5 * settings.age + 5;
    const maintenanceTdee = Math.round(bmr * 1.28); // ~1,850 kcal
    const targetSurplus = Math.max(150, settings.calorieTarget - maintenanceTdee); // ~250 - 350 kcal
    const weeklyRate = Math.round(((targetSurplus * 7) / 7700) * 100) / 100; // ~0.27 to 0.32 kg/week
    const weeksTotal = Math.round((TOTAL_CHALLENGE_DAYS / 7) * 10) / 10; // 11.7 weeks
    const totalProjectedGainKg = Math.round(weeklyRate * weeksTotal * 10) / 10; // ~3.5 kg
    const targetEndWeightKg = Math.round((baseline + totalProjectedGainKg) * 10) / 10; // ~53.5 kg

    const sortedMeasurements = [...measurements].sort((a, b) => b.date.localeCompare(a.date));
    const currentWeight = sortedMeasurements.length > 0 ? sortedMeasurements[0].weightKg : baseline;
    const actualGainKg = Math.round((currentWeight - baseline) * 10) / 10;

    const currentDay = Math.min(Math.max(1, getChallengeDayNumber(getCurrentISTDate())), TOTAL_CHALLENGE_DAYS);
    const elapsedWeeks = Math.max(0.5, currentDay / 7);
    const currentWeekAvgGainKg = Math.round((actualGainKg / elapsedWeeks) * 100) / 100;

    let paceStatus: 'optimal' | 'lean_slow' | 'surplus_high' = 'optimal';
    let paceDescription = 'Healthy Lean Mass Zone (0.20 - 0.40 kg/week): Optimal muscle protein synthesis with minimal fat accumulation.';

    if (currentWeekAvgGainKg < 0.15) {
      paceStatus = 'lean_slow';
      paceDescription = 'Pace is gentle. You are staying lean; you can gradually add 100–150 kcal if scale weight plateaus.';
    } else if (currentWeekAvgGainKg > 0.45) {
      paceStatus = 'surplus_high';
      paceDescription = 'Gaining faster than optimal lean pace. Ensure gains are predominantly muscular by monitoring waistline.';
    }

    return {
      baselineWeightKg: baseline,
      targetEndWeightKg,
      totalProjectedGainKg,
      weeksTotal,
      targetGainPerWeekKg: weeklyRate,
      maintenanceTdee,
      dailySurplusKcal: targetSurplus,
      actualGainKg,
      currentWeekAvgGainKg,
      paceStatus,
      paceDescription,
    };
  }, [measurements, settings]);

  const refreshCloudStatus = useCallback(async () => {
    const status = await storageService.checkCloudStatus();
    setCloudStatus(status);
  }, []);

  const syncLocalToCloud = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await storageService.syncAllToCloud();
      if (res.success) {
        showToast(res.message, 'success');
        await refreshCloudStatus();
      } else {
        showToast(res.message, 'error');
      }
      return res;
    } finally {
      setIsSaving(false);
    }
  }, [refreshCloudStatus, showToast]);

  const exportDataToExcel = useCallback(() => {
    exportFullExcelWorkbook({
      dailyProgress: dailyProgressList,
      foodLogs,
      mealTemplates,
      workoutPlans,
      workoutLogs,
      exerciseLibrary,
      measurements,
      settings,
    });
    showToast('Excel workbook exported successfully!');
  }, [dailyProgressList, foodLogs, mealTemplates, workoutPlans, workoutLogs, exerciseLibrary, measurements, settings, showToast]);

  const value = {
    selectedDate,
    setSelectedDate,
    settings,
    updateSettings,
    dailyProgress: currentDailyProgress,
    allDailyProgress: dailyProgressList,
    saveCheckin,
    quickAddWater,
    foodLogs: currentFoodLogs,
    allFoodLogs: foodLogs,
    addFood,
    updateFood,
    deleteFood,
    applyTemplate,
    copyDayMeals,
    mealTemplates,
    saveTemplate,
    deleteTemplate,
    currentWorkoutPlan,
    allWorkoutPlans: workoutPlans,
    savePlan,
    workoutLogs: currentWorkoutLogs,
    allWorkoutLogs: workoutLogs,
    logWorkoutSet,
    deleteWorkoutSet,
    exerciseLibrary,
    measurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    weightProjection,
    stats,
    cloudStatus,
    refreshCloudStatus,
    syncLocalToCloud,
    exportDataToExcel,
    isLoading,
    isSaving,
    toastMessage,
    showToast,
  };

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
