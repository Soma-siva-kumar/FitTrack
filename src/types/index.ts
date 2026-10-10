export type MealType = 'breakfast' | 'lunch' | 'pre_workout' | 'post_workout' | 'dinner' | 'snack';

export type FitnessGoal =
  | 'six_pack'
  | 'bulking'
  | 'fat_loss'
  | 'strength'
  | 'general_fitness'
  | 'beginner';

export type PreferredWorkoutTime = 'morning' | 'afternoon' | 'evening';
export type WorkoutLocation = 'home' | 'gym' | 'both';
export type EquipmentLevel = 'bodyweight' | 'backpack' | 'dumbbells' | 'resistance_bands' | 'full_gym';
export type DietPreference = 'vegetarian' | 'vegan' | 'non_vegetarian';
export type BudgetLevel = 'low' | 'moderate' | 'flexible';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export interface FoodItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  quantity: number;
  unit: string; // 'g', 'ml', 'piece', 'katori', 'cup', 'serving'
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isEstimate: boolean;
  time?: string; // e.g. "08:30 AM" or "13:30"
  notes?: string;
  imageUrl?: string;
  prepInstructions?: string;
  substitutions?: string;
  estimatedCostInr?: number;
  dietCategory?: 'vegetarian' | 'vegan' | 'non_vegetarian';
  createdAt: string;
}

export interface MealTemplateItem {
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  isEstimate: boolean;
  imageUrl?: string;
}

export interface MealTemplate {
  id: string;
  name: string;
  mealType: MealType;
  items: MealTemplateItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  description: string;
  isVegetarian: boolean;
  imageUrl?: string;
  prepInstructions?: string;
  substitutions?: string;
  estimatedCostInr?: number;
  recommendedTime?: string;
  goalSuitability?: FitnessGoal[];
}

export type WorkoutType = 
  | 'Workout A' 
  | 'Workout B' 
  | 'Workout A + abs' 
  | 'Recovery' 
  | 'Light Activity' 
  | 'Rest';

export interface TargetExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetRepsOrDuration: string; // e.g. "8-15 reps", "15-30s"
  targetRestSec: number;
  isAbs: boolean;
  imageUrl?: string;
  estimatedDurationMin?: number;
  progressionRule?: string; // ACSM 2026 progressive overload instruction
  beginnerAlternative?: string;
}

export interface WorkoutPlanDay {
  id: string;
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 82
  dayOfWeek: string;
  workoutType: WorkoutType;
  title: string;
  description: string;
  targetExercises: TargetExercise[];
  isRestDay: boolean;
  goalContext?: FitnessGoal;
  warmupProtocol?: string;
}

export interface WorkoutLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  targetRepsOrDuration: string;
  actualRepsOrDuration: string;
  weightKg: number; // 0 for bodyweight, or backpack kg
  completed: boolean;
  rpe?: number; // 1-10
  formNotes?: string;
  timestamp: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: 'Full Body' | 'Upper Body' | 'Lower Body' | 'Core & Abs' | 'Mobility';
  targetMuscles: string;
  equipment: 'Bodyweight' | 'Backpack' | 'Wall/Chair' | 'Mat' | 'Dumbbells';
  instructions: string[];
  formCues: string[];
  substitutions: string;
  defaultSets: number;
  defaultRepsOrDuration: string;
  defaultRestSec: number;
  isAbs: boolean;
  imageUrl?: string;
  demoVideoUrl?: string;
  estimatedDurationMin?: number;
  progressionRule?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface BodyMeasurementEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "07:15 AM"
  condition?: string; // e.g. "Morning fasting, post-restroom"
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  energyLevel?: number; // 1-5
  sleepDuration?: number; // hours
  performanceNotes?: string;
  photoReference?: string; // Private photo label e.g., "Week 1 front"
  createdAt: string;
}

export interface DailyProgress {
  id: string;
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 82
  weightKg?: number;
  waterLiters: number;
  caloriesConsumed: number;
  proteinGrams: number;
  foodLoggingCompleted: boolean;
  proteinTargetReached: boolean;
  workoutCompleted: boolean;
  restDay: boolean;
  absCompleted: boolean;
  sleepHours: number;
  energyRating: number; // 1-5
  notes?: string;
  completionPercentage: number;
  updatedAt: string;
}

export interface DailyScheduleItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "06:30 AM" or "17:30"
  title: string;
  category: 'wake' | 'meal' | 'snack' | 'workout' | 'hydration' | 'recovery' | 'sleep';
  description: string;
  durationMin?: number;
  completed: boolean;
  imageUrl?: string;
  actionLink?: string;
  calories?: number;
  protein?: number;
  researchNote?: string;
}

export interface UserSettings {
  age: number;
  heightCm: number;
  startingWeightKg: number;
  diet: string;
  trainingExperience: string;
  trainingLocation: string;
  budget: string;
  goal: string;
  calorieTargetMin: number;
  calorieTargetMax: number;
  calorieTarget: number;
  proteinTargetMin: number;
  proteinTargetMax: number;
  proteinTarget: number;
  waterTargetLiters: number;
  sleepTargetHours: number;
  workoutFrequencyPerWeek: number;
  allowOutsideChallengeDates: boolean;
  storageMode: 'auto' | 'local' | 'cloud';

  // Enhanced Research-Based Configuration
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  workoutLocation?: WorkoutLocation;
  equipment?: EquipmentLevel;
  dietPreference?: DietPreference;
  budgetLevel?: BudgetLevel;
  preferredWorkoutTime?: PreferredWorkoutTime;
  wakeTime?: string; // e.g. "06:30"
  sleepTime?: string; // e.g. "22:30"
  workSchedule?: string; // e.g. "09:00 - 17:00"
  workoutDurationMin?: number;
  targetWeightKg?: number;
  activityLevel?: ActivityLevel;
  allergies?: string;
  dislikedFoods?: string;
  regionalCuisine?: string;
  trainingDaysPerWeek?: number;
}

export interface CloudStatus {
  configured: boolean;
  connected: boolean;
  sheetId?: string;
  serviceAccountEmail?: string;
  lastSyncTime?: string;
  errorMessage?: string;
  isDemoMode: boolean;
}

export interface ChallengeStats {
  currentDay: number;
  totalDays: number;
  daysCompleted: number;
  daysRemaining: number;
  streakDays: number;
  workoutsCompletedCount: number;
  workoutCompletionRate: number;
  averageCalories: number;
  averageProtein: number;
  averageWater: number;
  currentWeight: number;
  weightDelta: number;
}

export interface WeightGainProjection {
  baselineWeightKg: number;
  targetEndWeightKg: number;
  totalProjectedGainKg: number;
  weeksTotal: number;
  targetGainPerWeekKg: number;
  maintenanceTdee: number;
  dailySurplusKcal: number;
  actualGainKg: number;
  currentWeekAvgGainKg: number;
  paceStatus: 'optimal' | 'lean_slow' | 'surplus_high';
  paceDescription: string;
}
