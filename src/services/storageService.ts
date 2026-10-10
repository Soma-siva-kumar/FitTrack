import {
  BodyMeasurementEntry,
  CloudStatus,
  DailyProgress,
  ExerciseItem,
  FoodItem,
  MealTemplate,
  UserSettings,
  WorkoutLogEntry,
  WorkoutPlanDay,
  FitnessGoal,
  DailyScheduleItem,
} from '../types';
import { DEFAULT_USER_SETTINGS, EXERCISE_LIBRARY, INITIAL_MEAL_TEMPLATES } from './seedData';
import { generateInitial82DaySchedule } from './workoutGenerator';
import { getChallengeDayNumber, getAllChallengeDates, getDayOfWeekName } from '../utils/dateUtils';
import {
  calculateResearchTargets,
  generateGoalWorkoutForDay,
  generateGoalMealTemplates,
  generateDailyTimetable,
} from './recommendationEngine';

// LocalStorage Keys
const KEYS = {
  DAILY_PROGRESS: 'ft82_daily_progress',
  FOOD_LOGS: 'ft82_food_logs',
  MEAL_TEMPLATES: 'ft82_meal_templates',
  WORKOUT_PLANS: 'ft82_workout_plans',
  WORKOUT_LOGS: 'ft82_workout_logs',
  EXERCISE_LIBRARY: 'ft82_exercise_library',
  BODY_MEASUREMENTS: 'ft82_body_measurements',
  SETTINGS: 'ft82_settings',
  DAILY_SCHEDULE: 'ft82_daily_schedule',
  INITIALIZED: 'ft82_initialized_v1',
};

class StorageService {
  private cloudStatus: CloudStatus = {
    configured: false,
    connected: false,
    isDemoMode: true,
  };

  /**
   * Initialize local store with required starting data if not yet present
   */
  public initializeLocalDatabase(): void {
    const initialized = localStorage.getItem(KEYS.INITIALIZED);
    if (!initialized) {
      if (!localStorage.getItem(KEYS.SETTINGS)) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_USER_SETTINGS));
      }
      if (!localStorage.getItem(KEYS.MEAL_TEMPLATES)) {
        localStorage.setItem(KEYS.MEAL_TEMPLATES, JSON.stringify(INITIAL_MEAL_TEMPLATES));
      }
      if (!localStorage.getItem(KEYS.EXERCISE_LIBRARY)) {
        localStorage.setItem(KEYS.EXERCISE_LIBRARY, JSON.stringify(EXERCISE_LIBRARY));
      }
      if (!localStorage.getItem(KEYS.WORKOUT_PLANS)) {
        const plans = generateInitial82DaySchedule();
        localStorage.setItem(KEYS.WORKOUT_PLANS, JSON.stringify(plans));
      }
      if (!localStorage.getItem(KEYS.DAILY_PROGRESS)) {
        localStorage.setItem(KEYS.DAILY_PROGRESS, JSON.stringify([]));
      }
      if (!localStorage.getItem(KEYS.FOOD_LOGS)) {
        localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify([]));
      }
      if (!localStorage.getItem(KEYS.WORKOUT_LOGS)) {
        localStorage.setItem(KEYS.WORKOUT_LOGS, JSON.stringify([]));
      }
      if (!localStorage.getItem(KEYS.BODY_MEASUREMENTS)) {
        // Starter baseline measurement at 50kg on Oct 11, 2026
        const starterMeasurement: BodyMeasurementEntry = {
          id: 'meas-baseline',
          date: '2026-10-11',
          weightKg: 50,
          energyLevel: 4,
          sleepDuration: 8,
          performanceNotes: 'Day 1 baseline kickoff measurement. Starting weight 50.0 kg.',
          photoReference: 'Day 1 Baseline',
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(KEYS.BODY_MEASUREMENTS, JSON.stringify([starterMeasurement]));
      }

      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  }

  /**
   * Check whether Google Sheets API backend is configured and reachable
   */
  public async checkCloudStatus(): Promise<CloudStatus> {
    try {
      const res = await fetch('/.netlify/functions/api/status', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        this.cloudStatus = {
          configured: false,
          connected: false,
          isDemoMode: true,
          errorMessage: `Server returned status ${res.status}`,
        };
        return this.cloudStatus;
      }
      const data = await res.json();
      this.cloudStatus = {
        configured: !!data.configured,
        connected: !!data.connected,
        sheetId: data.sheetId,
        serviceAccountEmail: data.serviceAccountEmail,
        isDemoMode: !data.configured || !data.connected,
        lastSyncTime: data.timestamp || new Date().toISOString(),
        errorMessage: data.error || (data.missing?.length ? `Missing env: ${data.missing.join(', ')}` : undefined),
      };
      return this.cloudStatus;
    } catch {
      this.cloudStatus = {
        configured: false,
        connected: false,
        isDemoMode: true,
        errorMessage: 'Netlify serverless function is not reachable locally. Local Storage is active.',
      };
      return this.cloudStatus;
    }
  }

  public getCloudStatus(): CloudStatus {
    return this.cloudStatus;
  }

  // --- SETTINGS ---
  public getSettings(): UserSettings {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_USER_SETTINGS;
    try {
      return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  }

  public async saveSettings(settings: UserSettings): Promise<{ success: boolean; error?: string }> {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      if (this.cloudStatus.connected) {
        await this.postCloudRecord('Settings', {
          id: 'user_settings',
          key: 'config',
          value: JSON.stringify(settings),
          updatedAt: new Date().toISOString(),
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // --- DAILY PROGRESS ---
  public getDailyProgressList(): DailyProgress[] {
    const raw = localStorage.getItem(KEYS.DAILY_PROGRESS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public getDailyProgress(date: string): DailyProgress {
    const list = this.getDailyProgressList();
    const existing = list.find((p) => p.date === date);
    if (existing) return existing;

    // Calculate default empty for date
    const dayNumber = getChallengeDayNumber(date);
    const plan = this.getWorkoutPlan(date);
    const newProgress: DailyProgress = {
      id: `dp-${date}`,
      date,
      dayNumber,
      waterLiters: 0,
      caloriesConsumed: 0,
      proteinGrams: 0,
      foodLoggingCompleted: false,
      proteinTargetReached: false,
      workoutCompleted: false,
      restDay: plan ? plan.isRestDay : false,
      absCompleted: false,
      sleepHours: 0,
      energyRating: 3,
      completionPercentage: 0,
      updatedAt: new Date().toISOString(),
    };
    return newProgress;
  }

  public async saveDailyProgress(progress: DailyProgress): Promise<{ success: boolean; error?: string }> {
    try {
      const list = this.getDailyProgressList();
      const idx = list.findIndex((p) => p.date === progress.date);
      const updated = { ...progress, updatedAt: new Date().toISOString() };

      if (idx >= 0) {
        list[idx] = updated;
      } else {
        list.push(updated);
      }
      localStorage.setItem(KEYS.DAILY_PROGRESS, JSON.stringify(list));

      if (this.cloudStatus.connected) {
        await this.postCloudRecord('DailyProgress', updated);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // --- FOOD LOGS ---
  public getFoodLogs(date?: string): FoodItem[] {
    const raw = localStorage.getItem(KEYS.FOOD_LOGS);
    if (!raw) return [];
    try {
      const logs: FoodItem[] = JSON.parse(raw);
      if (date) {
        return logs.filter((l) => l.date === date);
      }
      return logs;
    } catch {
      return [];
    }
  }

  public async addFoodLog(item: FoodItem): Promise<{ success: boolean; item: FoodItem; error?: string }> {
    try {
      const logs = this.getFoodLogs();
      logs.push(item);
      localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));

      // Recalculate daily nutrition totals
      await this.recalculateDailyNutrition(item.date);

      if (this.cloudStatus.connected) {
        await this.postCloudRecord('FoodLog', item);
      }
      return { success: true, item };
    } catch (err) {
      return { success: false, item, error: (err as Error).message };
    }
  }

  public async updateFoodLog(item: FoodItem): Promise<{ success: boolean; error?: string }> {
    try {
      const logs = this.getFoodLogs();
      const idx = logs.findIndex((l) => l.id === item.id);
      if (idx === -1) return { success: false, error: 'Food entry not found' };

      logs[idx] = item;
      localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));
      await this.recalculateDailyNutrition(item.date);

      if (this.cloudStatus.connected) {
        await this.putCloudRecord('FoodLog', item);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  public async deleteFoodLog(id: string, date: string): Promise<{ success: boolean; error?: string }> {
    try {
      let logs = this.getFoodLogs();
      logs = logs.filter((l) => l.id !== id);
      localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));
      await this.recalculateDailyNutrition(date);

      if (this.cloudStatus.connected) {
        await this.deleteCloudRecord('FoodLog', id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Recompute daily calories and protein from logged items
   */
  public async recalculateDailyNutrition(date: string): Promise<void> {
    const logs = this.getFoodLogs(date);
    const totalCal = logs.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
    const totalProt = logs.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);
    const settings = this.getSettings();

    const progress = this.getDailyProgress(date);
    progress.caloriesConsumed = Math.round(totalCal);
    progress.proteinGrams = Math.round(totalProt * 10) / 10;
    progress.proteinTargetReached = progress.proteinGrams >= settings.proteinTargetMin;
    progress.foodLoggingCompleted = logs.length > 0;
    progress.completionPercentage = this.calculateCompletionPercentage(progress);

    await this.saveDailyProgress(progress);
  }

  /**
   * Copy meal items from one date to another
   */
  public async copyDayFoodLogs(fromDate: string, toDate: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const sourceLogs = this.getFoodLogs(fromDate);
      if (sourceLogs.length === 0) {
        return { success: false, count: 0, error: `No food entries recorded on ${fromDate}` };
      }

      const logs = this.getFoodLogs();
      const newItems: FoodItem[] = sourceLogs.map((log) => ({
        ...log,
        id: `food-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        date: toDate,
        createdAt: new Date().toISOString(),
      }));

      logs.push(...newItems);
      localStorage.setItem(KEYS.FOOD_LOGS, JSON.stringify(logs));
      await this.recalculateDailyNutrition(toDate);

      if (this.cloudStatus.connected) {
        for (const item of newItems) {
          await this.postCloudRecord('FoodLog', item);
        }
      }
      return { success: true, count: newItems.length };
    } catch (err) {
      return { success: false, count: 0, error: (err as Error).message };
    }
  }

  // --- MEAL TEMPLATES ---
  public getMealTemplates(): MealTemplate[] {
    const raw = localStorage.getItem(KEYS.MEAL_TEMPLATES);
    if (!raw) return INITIAL_MEAL_TEMPLATES;
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MEAL_TEMPLATES;
    }
  }

  public async saveMealTemplate(template: MealTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      const templates = this.getMealTemplates();
      const idx = templates.findIndex((t) => t.id === template.id);
      if (idx >= 0) {
        templates[idx] = template;
      } else {
        templates.push(template);
      }
      localStorage.setItem(KEYS.MEAL_TEMPLATES, JSON.stringify(templates));

      if (this.cloudStatus.connected) {
        await this.postCloudRecord('MealTemplates', {
          ...template,
          itemsJson: template.items,
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  public async deleteMealTemplate(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      let templates = this.getMealTemplates();
      templates = templates.filter((t) => t.id !== id);
      localStorage.setItem(KEYS.MEAL_TEMPLATES, JSON.stringify(templates));

      if (this.cloudStatus.connected) {
        await this.deleteCloudRecord('MealTemplates', id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // --- WORKOUT PLANS ---
  public getWorkoutPlans(): WorkoutPlanDay[] {
    const raw = localStorage.getItem(KEYS.WORKOUT_PLANS);
    if (!raw) return generateInitial82DaySchedule();
    try {
      return JSON.parse(raw);
    } catch {
      return generateInitial82DaySchedule();
    }
  }

  public getWorkoutPlan(date: string): WorkoutPlanDay | undefined {
    const plans = this.getWorkoutPlans();
    return plans.find((p) => p.date === date);
  }

  public async saveWorkoutPlan(plan: WorkoutPlanDay): Promise<{ success: boolean; error?: string }> {
    try {
      const plans = this.getWorkoutPlans();
      const idx = plans.findIndex((p) => p.date === plan.date);
      if (idx >= 0) {
        plans[idx] = plan;
      } else {
        plans.push(plan);
      }
      localStorage.setItem(KEYS.WORKOUT_PLANS, JSON.stringify(plans));

      // Update progress restDay status if changed
      const progress = this.getDailyProgress(plan.date);
      progress.restDay = plan.isRestDay;
      progress.completionPercentage = this.calculateCompletionPercentage(progress);
      await this.saveDailyProgress(progress);

      if (this.cloudStatus.connected) {
        await this.postCloudRecord('WorkoutPlan', {
          ...plan,
          targetExercisesJson: plan.targetExercises,
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // --- WORKOUT LOGS ---
  public getWorkoutLogs(date?: string): WorkoutLogEntry[] {
    const raw = localStorage.getItem(KEYS.WORKOUT_LOGS);
    if (!raw) return [];
    try {
      const logs: WorkoutLogEntry[] = JSON.parse(raw);
      if (date) {
        return logs.filter((l) => l.date === date);
      }
      return logs;
    } catch {
      return [];
    }
  }

  public async saveWorkoutLogEntry(entry: WorkoutLogEntry): Promise<{ success: boolean; error?: string }> {
    try {
      const logs = this.getWorkoutLogs();
      const idx = logs.findIndex((l) => l.id === entry.id);
      if (idx >= 0) {
        logs[idx] = entry;
      } else {
        logs.push(entry);
      }
      localStorage.setItem(KEYS.WORKOUT_LOGS, JSON.stringify(logs));

      // Re-evaluate workout completion on date
      const dateLogs = logs.filter((l) => l.date === entry.date);
      const hasCompletedSets = dateLogs.some((l) => l.completed);
      const hasAbsSets = dateLogs.some((l) => {
        const ex = this.getExercise(l.exerciseId);
        return ex?.isAbs && l.completed;
      });

      const progress = this.getDailyProgress(entry.date);
      progress.workoutCompleted = hasCompletedSets;
      progress.absCompleted = hasAbsSets;
      progress.completionPercentage = this.calculateCompletionPercentage(progress);
      await this.saveDailyProgress(progress);

      if (this.cloudStatus.connected) {
        await this.postCloudRecord('WorkoutLog', entry);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  public async deleteWorkoutLogEntry(id: string, date: string): Promise<{ success: boolean; error?: string }> {
    try {
      let logs = this.getWorkoutLogs();
      logs = logs.filter((l) => l.id !== id);
      localStorage.setItem(KEYS.WORKOUT_LOGS, JSON.stringify(logs));

      const dateLogs = logs.filter((l) => l.date === date);
      const hasCompletedSets = dateLogs.some((l) => l.completed);
      const hasAbsSets = dateLogs.some((l) => {
        const ex = this.getExercise(l.exerciseId);
        return ex?.isAbs && l.completed;
      });

      const progress = this.getDailyProgress(date);
      progress.workoutCompleted = hasCompletedSets;
      progress.absCompleted = hasAbsSets;
      progress.completionPercentage = this.calculateCompletionPercentage(progress);
      await this.saveDailyProgress(progress);

      if (this.cloudStatus.connected) {
        await this.deleteCloudRecord('WorkoutLog', id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  // --- EXERCISE LIBRARY ---
  public getExerciseLibrary(): ExerciseItem[] {
    const raw = localStorage.getItem(KEYS.EXERCISE_LIBRARY);
    if (!raw) return EXERCISE_LIBRARY;
    try {
      return JSON.parse(raw);
    } catch {
      return EXERCISE_LIBRARY;
    }
  }

  public getExercise(id: string): ExerciseItem | undefined {
    return this.getExerciseLibrary().find((e) => e.id === id);
  }

  // --- BODY MEASUREMENTS ---
  public getMeasurements(): BodyMeasurementEntry[] {
    const raw = localStorage.getItem(KEYS.BODY_MEASUREMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw).sort((a: BodyMeasurementEntry, b: BodyMeasurementEntry) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  }

  public async saveMeasurement(measurement: BodyMeasurementEntry): Promise<{ success: boolean; error?: string }> {
    try {
      const list = this.getMeasurements();
      const idx = list.findIndex((m) => m.id === measurement.id || m.date === measurement.date);
      if (idx >= 0) {
        list[idx] = measurement;
      } else {
        list.push(measurement);
      }
      localStorage.setItem(KEYS.BODY_MEASUREMENTS, JSON.stringify(list));

      // Also reflect weight on DailyProgress
      if (measurement.weightKg) {
        const progress = this.getDailyProgress(measurement.date);
        progress.weightKg = measurement.weightKg;
        await this.saveDailyProgress(progress);
      }

      if (this.cloudStatus.connected) {
        await this.postCloudRecord('BodyMeasurements', measurement);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  public async updateMeasurement(measurement: BodyMeasurementEntry): Promise<{ success: boolean; error?: string }> {
    return this.saveMeasurement(measurement);
  }

  public async deleteMeasurement(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      let list = this.getMeasurements();
      const target = list.find((m) => m.id === id);
      list = list.filter((m) => m.id !== id);
      localStorage.setItem(KEYS.BODY_MEASUREMENTS, JSON.stringify(list));

      if (target) {
        const progress = this.getDailyProgress(target.date);
        const remainingForDate = list.find((m) => m.date === target.date);
        progress.weightKg = remainingForDate ? remainingForDate.weightKg : undefined;
        await this.saveDailyProgress(progress);
      }

      if (this.cloudStatus.connected) {
        await this.deleteCloudRecord('BodyMeasurements', id);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /**
   * Calculate daily overall completion percentage
   * Rules: Rest days do NOT count as missed workouts.
   */
  public calculateCompletionPercentage(progress: DailyProgress): number {
    const settings = this.getSettings();
    let totalPoints = 0;
    let earnedPoints = 0;

    // 1. Food Logging (1 point)
    totalPoints += 1;
    if (progress.foodLoggingCompleted || progress.caloriesConsumed >= settings.calorieTargetMin * 0.7) {
      earnedPoints += 1;
    }

    // 2. Protein Target (1 point)
    totalPoints += 1;
    if (progress.proteinGrams >= settings.proteinTargetMin) {
      earnedPoints += 1;
    } else if (progress.proteinGrams > 0) {
      earnedPoints += Math.min(progress.proteinGrams / settings.proteinTargetMin, 0.9);
    }

    // 3. Water Intake (1 point)
    totalPoints += 1;
    if (progress.waterLiters >= settings.waterTargetLiters) {
      earnedPoints += 1;
    } else if (progress.waterLiters > 0) {
      earnedPoints += Math.min(progress.waterLiters / settings.waterTargetLiters, 0.9);
    }

    // 4. Workout / Rest Day (1 point)
    // Scheduled rest days automatically award the point so they aren't penalized!
    totalPoints += 1;
    if (progress.restDay || progress.workoutCompleted) {
      earnedPoints += 1;
    }

    // 5. Sleep (1 point)
    totalPoints += 1;
    if (progress.sleepHours >= 7.0) {
      earnedPoints += 1;
    } else if (progress.sleepHours > 0) {
      earnedPoints += Math.min(progress.sleepHours / 8.0, 0.9);
    }

    return Math.min(100, Math.round((earnedPoints / totalPoints) * 100));
  }

  /**
   * Helper to sync all local data to cloud sheet
   */
  public async syncAllToCloud(): Promise<{ success: boolean; message: string }> {
    try {
      const payload = {
        DailyProgress: this.getDailyProgressList(),
        FoodLog: this.getFoodLogs(),
        MealTemplates: this.getMealTemplates().map((t) => ({ ...t, itemsJson: t.items })),
        WorkoutPlan: this.getWorkoutPlans().map((p) => ({ ...p, targetExercisesJson: p.targetExercises })),
        WorkoutLog: this.getWorkoutLogs(),
        ExerciseLibrary: this.getExerciseLibrary().map((e) => ({
          ...e,
          instructionsJson: e.instructions,
          formCuesJson: e.formCues,
        })),
        BodyMeasurements: this.getMeasurements(),
        Settings: [
          {
            id: 'settings_main',
            key: 'user_settings',
            value: JSON.stringify(this.getSettings()),
            updatedAt: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch('/.netlify/functions/api/batch-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      return { success: true, message: 'All local data uploaded to Google Sheets successfully!' };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }

  // --- DAILY SCHEDULE & TIMETABLE (Morning to Evening) ---
  public getDailySchedule(date: string): DailyScheduleItem[] {
    const key = `${KEYS.DAILY_SCHEDULE}_${date}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // Fall back to generation
      }
    }
    // Generate fresh research-backed timetable
    const generated = generateDailyTimetable(date, this.getSettings());
    localStorage.setItem(key, JSON.stringify(generated));
    return generated;
  }

  public saveDailySchedule(date: string, items: DailyScheduleItem[]): void {
    const key = `${KEYS.DAILY_SCHEDULE}_${date}`;
    localStorage.setItem(key, JSON.stringify(items));
  }

  public toggleScheduleItem(date: string, itemId: string): DailyScheduleItem[] {
    const items = this.getDailySchedule(date);
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    this.saveDailySchedule(date, updated);
    return updated;
  }

  /**
   * Dynamically regenerates workouts, meal templates, targets, and timetable based on selected goal
   * Preserves all user history, logs, and completed workouts!
   */
  public async regeneratePlanForGoal(
    goal: FitnessGoal,
    options: Partial<UserSettings> = {}
  ): Promise<{ success: boolean; message: string }> {
    try {
      const currentSettings = this.getSettings();
      const mergedSettings: UserSettings = {
        ...currentSettings,
        ...options,
        fitnessGoal: goal,
      };

      // Recalculate research-backed targets (ACSM 2026 & ISSN)
      const targetResults = calculateResearchTargets(mergedSettings);
      mergedSettings.calorieTarget = targetResults.calorieTarget;
      mergedSettings.calorieTargetMin = targetResults.calorieTargetMin;
      mergedSettings.calorieTargetMax = targetResults.calorieTargetMax;
      mergedSettings.proteinTarget = targetResults.proteinTarget;
      mergedSettings.proteinTargetMin = targetResults.proteinTargetMin;
      mergedSettings.proteinTargetMax = targetResults.proteinTargetMax;
      if (goal === 'bulking') {
        mergedSettings.goal = 'Muscle Bulking & Progressive Hypertrophy';
      } else if (goal === 'six_pack') {
        mergedSettings.goal = 'Six-pack / Visible Abs & Core Density';
      } else if (goal === 'fat_loss') {
        mergedSettings.goal = 'Fat Loss & Lean Muscle Preservation';
      } else if (goal === 'strength') {
        mergedSettings.goal = 'Maximal Strength & Neuromuscular Power';
      } else {
        mergedSettings.goal = 'General Fitness & Sustainable Longevity';
      }

      await this.saveSettings(mergedSettings);

      // Generate goal-specific meal templates
      const newTemplates = generateGoalMealTemplates(
        goal,
        mergedSettings.dietPreference || 'vegetarian',
        mergedSettings.budgetLevel || 'low'
      );
      localStorage.setItem(KEYS.MEAL_TEMPLATES, JSON.stringify(newTemplates));

      // Regenerate future workout plans without overwriting past logs
      const currentPlans = this.getWorkoutPlans();
      const existingLogs = this.getWorkoutLogs();
      const datesWithCompletedLogs = new Set(existingLogs.map((l) => l.date));

      const updatedPlans = currentPlans.map((plan) => {
        // If this date already has completed logs, PRESERVE historical record!
        if (datesWithCompletedLogs.has(plan.date)) {
          return plan;
        }

        const dayOfWeek = getDayOfWeekName(plan.date);
        const dayNumber = getChallengeDayNumber(plan.date);
        const newDayPlan = generateGoalWorkoutForDay(
          goal,
          mergedSettings.equipment || 'backpack',
          mergedSettings.experienceLevel || 'beginner',
          dayOfWeek,
          dayNumber
        );

        return {
          ...plan,
          workoutType: newDayPlan.workoutType,
          title: newDayPlan.title,
          description: newDayPlan.description,
          targetExercises: newDayPlan.targetExercises,
          isRestDay: newDayPlan.isRestDay,
          goalContext: goal,
          warmupProtocol: newDayPlan.warmupProtocol,
        };
      });

      localStorage.setItem(KEYS.WORKOUT_PLANS, JSON.stringify(updatedPlans));

      // Clear cached future daily schedules so they regenerate with new timetable
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(KEYS.DAILY_SCHEDULE)) {
          const datePart = key.replace(`${KEYS.DAILY_SCHEDULE}_`, '');
          if (!datesWithCompletedLogs.has(datePart)) {
            localStorage.removeItem(key);
          }
        }
      }

      // Sync to cloud if connected
      if (this.cloudStatus.connected) {
        await this.syncAllToCloud();
      }

      return {
        success: true,
        message: `Plan successfully adapted for ${mergedSettings.goal}! Targets: ${targetResults.calorieTarget} kcal, ${targetResults.proteinTarget}g protein.`,
      };
    } catch (err) {
      return { success: false, message: (err as Error).message };
    }
  }

  // --- Private Cloud Helpers ---
  private async postCloudRecord(tab: string, record: unknown): Promise<void> {
    try {
      await fetch('/.netlify/functions/api/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab, record }),
      });
    } catch (e) {
      console.warn('Cloud sync error (record saved locally):', e);
    }
  }

  private async putCloudRecord(tab: string, record: unknown): Promise<void> {
    try {
      await fetch('/.netlify/functions/api/record', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab, record }),
      });
    } catch (e) {
      console.warn('Cloud sync error (record updated locally):', e);
    }
  }

  private async deleteCloudRecord(tab: string, id: string): Promise<void> {
    try {
      await fetch('/.netlify/functions/api/record', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab, id }),
      });
    } catch (e) {
      console.warn('Cloud sync error (record deleted locally):', e);
    }
  }
}

export const storageService = new StorageService();
