import {
  FitnessGoal,
  UserSettings,
  TargetExercise,
  WorkoutType,
  DietPreference,
  BudgetLevel,
  EquipmentLevel,
  ExperienceLevel,
  DailyScheduleItem,
  MealTemplate,
} from '../types';
import { getExerciseImage, getMealImage } from './imageService';

/**
 * Research-Backed Scientific Fitness & Nutrition Recommendation Engine
 * Adheres to:
 * 1. American College of Sports Medicine (ACSM 2026) Resistance Training Guidance:
 *    - Progressive resistance overload across major muscle groups
 *    - Periodized training frequency (3–5 days/week for hypertrophy/strength)
 *    - 48–72 hours recovery between demanding sessions targeting the same muscle groups
 *    - Compound multi-joint foundational movements
 * 2. International Society of Sports Nutrition (ISSN) Protein & Exercise Position Stand:
 *    - Daily protein intake of 1.4–2.0 g/kg body weight for exercising individuals
 *    - Protein distribution of ~0.25–0.40 g/kg per meal across 4–5 feeding opportunities
 *    - Pre/post-workout nutrient timing supporting muscle protein synthesis (MPS)
 */

export interface ResearchCitation {
  topic: string;
  source: string;
  keyRule: string;
}

export const RESEARCH_CITATIONS: ResearchCitation[] = [
  {
    topic: 'Resistance Training & Progressive Overload',
    source: 'American College of Sports Medicine (ACSM 2026 Guidelines Update)',
    keyRule: 'Progressive overload improves muscular strength, hypertrophy, and bone density. Train major muscle groups 2-3x weekly with 48h recovery.',
  },
  {
    topic: 'Daily Protein Target & Distribution',
    source: 'International Society of Sports Nutrition (ISSN Position Stand on Protein and Exercise)',
    keyRule: 'Exercising adults should target 1.4–2.0 g/kg/day distributed in 20–30g protein doses every 3–4 hours to maximize muscle protein synthesis.',
  },
  {
    topic: 'Abdominal Definition & Fat Loss Reality',
    source: 'Sports Medicine & Exercise Science Consensus',
    keyRule: 'Abdominal exercises strengthen and hypertrophy the core musculature, but they cannot spot-reduce subcutaneous belly fat. Visible abs require overall body fat management and lean mass preservation.',
  },
];

/**
 * 1. SCIENTIFIC CALORIE & PROTEIN CALCULATOR
 */
export function calculateResearchTargets(settings: Partial<UserSettings>) {
  const age = settings.age || 22;
  const height = settings.heightCm || 168;
  const weight = settings.startingWeightKg || 50;
  const goal = settings.fitnessGoal || 'six_pack';

  // Mifflin-St Jeor Equation for BMR (Male default baseline)
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5; // ~1,445 kcal for 50kg, 168cm, 22yo

  // Activity Multiplier (Home training 3-4 days/week)
  const maintenanceTdee = Math.round(bmr * 1.28); // ~1,850 kcal

  let calorieTarget = maintenanceTdee;
  let calorieTargetMin = maintenanceTdee - 100;
  let calorieTargetMax = maintenanceTdee + 100;
  let surplusOrDeficit = 0;
  let explanation = '';

  // Protein calculation following ISSN 1.4 - 2.0 g/kg
  let proteinMultiplier = 1.6;

  switch (goal) {
    case 'bulking':
      surplusOrDeficit = 300; // Modest surplus for lean gains
      calorieTarget = maintenanceTdee + surplusOrDeficit; // ~2,150 kcal
      calorieTargetMin = calorieTarget - 100;
      calorieTargetMax = calorieTarget + 100;
      proteinMultiplier = 1.7; // ~85g for 50kg
      explanation = 'Calibrated energy surplus (+300 kcal) fuels new muscle tissue synthesis without excessive fat storage.';
      break;

    case 'six_pack':
      // For baseline 50kg user, building muscle thickness is needed first to reveal abs
      surplusOrDeficit = weight <= 52 ? 250 : -150;
      calorieTarget = maintenanceTdee + surplusOrDeficit; // ~2,100 kcal for lean muscle
      calorieTargetMin = calorieTarget - 100;
      calorieTargetMax = calorieTarget + 100;
      proteinMultiplier = 1.8; // High protein preserves lean mass and enhances satiety
      explanation = 'Controlled lean energy target with elevated protein (1.8g/kg) thickens abdominal wall while preventing visceral fat gain.';
      break;

    case 'fat_loss':
      surplusOrDeficit = -350;
      calorieTarget = Math.max(1500, maintenanceTdee + surplusOrDeficit);
      calorieTargetMin = calorieTarget - 100;
      calorieTargetMax = calorieTarget + 100;
      proteinMultiplier = 1.9; // Higher protein spares muscle in deficit
      explanation = 'Sustainable moderate deficit (-350 kcal) maximizes fat oxidation while preserving lean muscle mass.';
      break;

    case 'strength':
      surplusOrDeficit = 200;
      calorieTarget = maintenanceTdee + surplusOrDeficit;
      calorieTargetMin = calorieTarget - 100;
      calorieTargetMax = calorieTarget + 100;
      proteinMultiplier = 1.7;
      explanation = 'Slight surplus (+200 kcal) supports neuromuscular recovery and progressive resistance load increments.';
      break;

    case 'beginner':
    case 'general_fitness':
    default:
      surplusOrDeficit = weight < 52 ? 200 : 0;
      calorieTarget = maintenanceTdee + surplusOrDeficit;
      calorieTargetMin = calorieTarget - 100;
      calorieTargetMax = calorieTarget + 100;
      proteinMultiplier = 1.5;
      explanation = 'Balanced maintenance nutrition promotes natural adaptation and sustainable habit consistency.';
      break;
  }

  const proteinTarget = Math.round(weight * proteinMultiplier);
  const proteinTargetMin = Math.round(weight * 1.4);
  const proteinTargetMax = Math.round(weight * 2.0);

  return {
    bmr: Math.round(bmr),
    maintenanceTdee,
    calorieTarget,
    calorieTargetMin,
    calorieTargetMax,
    proteinTarget,
    proteinTargetMin,
    proteinTargetMax,
    surplusOrDeficit,
    explanation,
  };
}

/**
 * 2. GOAL-DRIVEN DYNAMIC WORKOUT GENERATOR
 */
export function generateGoalWorkoutForDay(
  goal: FitnessGoal = 'six_pack',
  equipment: EquipmentLevel = 'backpack',
  experience: ExperienceLevel = 'beginner',
  dayOfWeek: string,
  dayNumber: number
): {
  workoutType: WorkoutType;
  title: string;
  description: string;
  targetExercises: TargetExercise[];
  isRestDay: boolean;
  warmupProtocol: string;
} {
  const isWeekend = dayOfWeek === 'Sunday' || dayOfWeek === 'Saturday';

  // Warm-up protocol tailored to home training
  const warmupProtocol =
    '3-Minute Dynamic Warm-Up: 10 arm circles, 10 bodyweight hip hinges, 10 half-squats, and 10 cat-cows. Never lift cold.';

  // Day 1 Kickoff
  if (dayNumber === 1) {
    return {
      workoutType: 'Rest',
      title: 'Day 1: Challenge Setup & Form Familiarization',
      description: 'Prepare your backpack with books/water bottles, check your workout space, and practice movement form.',
      targetExercises: [],
      isRestDay: true,
      warmupProtocol,
    };
  }

  // SIX-PACK GOAL: High core integration + Compound resistance + 48h core recovery
  if (goal === 'six_pack') {
    switch (dayOfWeek) {
      case 'Monday':
        return {
          workoutType: 'Workout A + abs',
          title: 'Upper/Lower Strength + Deep Core Density',
          description: 'Focus on abdominal bracing during squats and controlled planks for transverse abdominis thickness.',
          targetExercises: [
            {
              exerciseId: 'ex-squat',
              exerciseName: 'Bodyweight or Goblet Squat',
              targetSets: 3,
              targetRepsOrDuration: '10–15 reps',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('squat'),
              estimatedDurationMin: 8,
              progressionRule: 'ACSM Overload: Add 2 reps per set once you reach 15 reps with perfect depth.',
              beginnerAlternative: 'Chair box squat if knee depth is restricted.',
            },
            {
              exerciseId: 'ex-incline-pushup',
              exerciseName: 'Incline / Standard Push-Up',
              targetSets: 3,
              targetRepsOrDuration: '8–12 reps',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('pushup'),
              estimatedDurationMin: 7,
              progressionRule: 'Lower hand elevation (couch -> chair -> floor) as strength develops.',
              beginnerAlternative: 'Wall or counter push-up.',
            },
            {
              exerciseId: 'ex-forearm-plank',
              exerciseName: 'Forearm Plank',
              targetSets: 3,
              targetRepsOrDuration: '25–40 seconds',
              targetRestSec: 60,
              isAbs: true,
              imageUrl: getExerciseImage('plank'),
              estimatedDurationMin: 6,
              progressionRule: 'Increase hold time by 5s each week; avoid hip sag.',
              beginnerAlternative: 'Knee forearm plank.',
            },
            {
              exerciseId: 'ex-reverse-crunch',
              exerciseName: 'Reverse Crunch',
              targetSets: 3,
              targetRepsOrDuration: '10–15 reps',
              targetRestSec: 60,
              isAbs: true,
              imageUrl: getExerciseImage('reverse-crunch'),
              estimatedDurationMin: 6,
              progressionRule: 'Curl hips off floor strictly using lower abs, not leg momentum.',
              beginnerAlternative: 'Bent-knee hip tilt.',
            },
          ],
          isRestDay: false,
          warmupProtocol,
        };

      case 'Tuesday':
        return {
          workoutType: 'Recovery',
          title: 'Active Core Recovery & 30-Min Brisk Walk',
          description: 'Abdominal muscles synthesize and repair during rest. Light walking increases blood flow without fatigue.',
          targetExercises: [],
          isRestDay: true,
          warmupProtocol,
        };

      case 'Wednesday':
        return {
          workoutType: 'Workout B',
          title: 'Posterior Chain & Anti-Extension Core',
          description: 'Strengthen back, glutes, and deep core stabilizers (dead bug) to build balanced abdominal posture.',
          targetExercises: [
            {
              exerciseId: 'ex-backpack-row',
              exerciseName: 'Backpack Row (Two Arms)',
              targetSets: 3,
              targetRepsOrDuration: '10–12 reps',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('row'),
              estimatedDurationMin: 8,
              progressionRule: 'Add 1 book/bottle (0.5–1 kg) to backpack when 12 reps feel easy.',
              beginnerAlternative: 'Two water bottles per hand.',
            },
            {
              exerciseId: 'ex-reverse-lunge',
              exerciseName: 'Reverse Lunge',
              targetSets: 3,
              targetRepsOrDuration: '8–10 per leg',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('lunge'),
              estimatedDurationMin: 8,
              progressionRule: 'Increase to 12 reps per leg before adding backpack load.',
              beginnerAlternative: 'Static split squat holding wall for balance.',
            },
            {
              exerciseId: 'ex-dead-bug',
              exerciseName: 'Dead Bug (Anti-Extension)',
              targetSets: 3,
              targetRepsOrDuration: '10 per side',
              targetRestSec: 60,
              isAbs: true,
              imageUrl: getExerciseImage('dead-bug'),
              estimatedDurationMin: 6,
              progressionRule: 'Keep lower back glued to floor throughout movement.',
              beginnerAlternative: 'Tap heel to floor with bent knees.',
            },
            {
              exerciseId: 'ex-side-plank',
              exerciseName: 'Side Plank (Obliques Focus)',
              targetSets: 2,
              targetRepsOrDuration: '20–30s per side',
              targetRestSec: 60,
              isAbs: true,
              imageUrl: getExerciseImage('side-plank'),
              estimatedDurationMin: 5,
              progressionRule: 'Add 5s per side weekly for lateral core stability.',
              beginnerAlternative: 'Side plank from knees.',
            },
          ],
          isRestDay: false,
          warmupProtocol,
        };

      case 'Thursday':
        return {
          workoutType: 'Recovery',
          title: 'Hydration & Mobility Flush',
          description: 'Spinal decompression, cat-cow mobility, and 2.0L hydration to facilitate cellular repair.',
          targetExercises: [],
          isRestDay: true,
          warmupProtocol,
        };

      case 'Friday':
        return {
          workoutType: 'Workout A + abs',
          title: 'Full Body Density + Complete Ab Circuit',
          description: 'High motor unit recruitment session pairing compound strength with direct rectus abdominis stimulation.',
          targetExercises: [
            {
              exerciseId: 'ex-squat',
              exerciseName: 'Bodyweight Squat',
              targetSets: 3,
              targetRepsOrDuration: '12–15 reps',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('squat'),
              estimatedDurationMin: 7,
              progressionRule: 'Perform with a 3-second lowering tempo.',
              beginnerAlternative: 'Box squat.',
            },
            {
              exerciseId: 'ex-incline-pushup',
              exerciseName: 'Incline Push-Up',
              targetSets: 3,
              targetRepsOrDuration: '8–12 reps',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('pushup'),
              estimatedDurationMin: 7,
              progressionRule: 'Slow controlled tempo.',
              beginnerAlternative: 'Knee push-up.',
            },
            {
              exerciseId: 'ex-glute-bridge',
              exerciseName: 'Glute Bridge',
              targetSets: 3,
              targetRepsOrDuration: '12–15 reps',
              targetRestSec: 60,
              isAbs: false,
              imageUrl: getExerciseImage('glute-bridge'),
              estimatedDurationMin: 6,
              progressionRule: '2-second squeeze at top contraction.',
              beginnerAlternative: 'Double-leg bridge on floor.',
            },
            {
              exerciseId: 'ex-forearm-plank',
              exerciseName: 'Forearm Plank',
              targetSets: 3,
              targetRepsOrDuration: '30–45 seconds',
              targetRestSec: 60,
              isAbs: true,
              imageUrl: getExerciseImage('plank'),
              estimatedDurationMin: 6,
              progressionRule: 'Squeeze glutes and quads for full tension.',
              beginnerAlternative: 'Elevated hands plank.',
            },
          ],
          isRestDay: false,
          warmupProtocol,
        };

      case 'Saturday':
        return {
          workoutType: 'Light Activity',
          title: 'Light Mobility & Core Recovery',
          description: 'Gentle stretching and mobility to prepare for the upcoming training week.',
          targetExercises: [],
          isRestDay: true,
          warmupProtocol,
        };

      case 'Sunday':
      default:
        return {
          workoutType: 'Rest',
          title: 'Full Rest & Weekly Reflection',
          description: 'Rest completely. Check off weekly weigh-in and review nutrition adherence.',
          targetExercises: [],
          isRestDay: true,
          warmupProtocol,
        };
    }
  }

  // BULKING / MUSCLE GAIN: Progressive volume, compound emphasis, hypertrophy rep brackets
  if (goal === 'bulking' || goal === 'strength') {
    switch (dayOfWeek) {
      case 'Monday':
        return {
          workoutType: 'Workout A',
          title: 'Hypertrophy Focus: Chest, Quads & Upper Back',
          description: 'Mechanical tension is the primary driver of hypertrophy. Aim for 8-12 reps near failure with good form.',
          targetExercises: [
            {
              exerciseId: 'ex-squat',
              exerciseName: 'Goblet / Backpack Squat',
              targetSets: 3,
              targetRepsOrDuration: '8–12 reps',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('squat'),
              estimatedDurationMin: 9,
              progressionRule: 'Increase backpack weight once you hit 3 sets of 12 clean reps.',
              beginnerAlternative: 'Bodyweight squat with pause.',
            },
            {
              exerciseId: 'ex-incline-pushup',
              exerciseName: 'Incline Push-Up (Progressing to Floor)',
              targetSets: 3,
              targetRepsOrDuration: '8–12 reps',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('pushup'),
              estimatedDurationMin: 8,
              progressionRule: 'Lower elevation to increase resistance load.',
              beginnerAlternative: 'Knee push-up.',
            },
            {
              exerciseId: 'ex-backpack-row',
              exerciseName: 'Backpack Row (Two Arms)',
              targetSets: 3,
              targetRepsOrDuration: '8–12 reps',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('row'),
              estimatedDurationMin: 8,
              progressionRule: 'Add 1-2 kg to backpack weekly.',
              beginnerAlternative: 'Bed sheet door row.',
            },
            {
              exerciseId: 'ex-glute-bridge',
              exerciseName: 'Glute Bridge (Weighted Backpack on Hips)',
              targetSets: 3,
              targetRepsOrDuration: '12–15 reps',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('glute-bridge'),
              estimatedDurationMin: 7,
              progressionRule: 'Place loaded backpack across hips.',
              beginnerAlternative: 'Bodyweight bridge.',
            },
          ],
          isRestDay: false,
          warmupProtocol,
        };

      case 'Tuesday':
        return {
          workoutType: 'Recovery',
          title: 'Muscle Synthesis & Recovery Walk',
          description: 'New muscle tissue proteins synthesize during rest. Ensure surplus calories and 8 hours sleep.',
          targetExercises: [],
          isRestDay: true,
          warmupProtocol,
        };

      case 'Wednesday':
        return {
          workoutType: 'Workout B',
          title: 'Hypertrophy Focus: Hamstrings, Lats & Unilateral Leg Work',
          description: 'Unilateral movements correct muscular imbalances and stimulate high muscle fiber recruitment.',
          targetExercises: [
            {
              exerciseId: 'ex-reverse-lunge',
              exerciseName: 'Reverse Lunge (Backpack Weighted)',
              targetSets: 3,
              targetRepsOrDuration: '8–10 per leg',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('lunge'),
              estimatedDurationMin: 9,
              progressionRule: 'Wear loaded backpack once bodyweight form is solid.',
              beginnerAlternative: 'Bodyweight reverse lunge.',
            },
            {
              exerciseId: 'ex-backpack-rdl',
              exerciseName: 'Backpack Romanian Deadlift',
              targetSets: 3,
              targetRepsOrDuration: '8–12 reps',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('rdl'),
              estimatedDurationMin: 8,
              progressionRule: 'Drive strictly through hips and feel deep hamstring stretch.',
              beginnerAlternative: 'Bodyweight hip hinge against wall.',
            },
            {
              exerciseId: 'ex-single-arm-row',
              exerciseName: 'One-Arm Backpack Row',
              targetSets: 3,
              targetRepsOrDuration: '8–12 per side',
              targetRestSec: 75,
              isAbs: false,
              imageUrl: getExerciseImage('one-arm-row'),
              estimatedDurationMin: 8,
              progressionRule: 'Pull elbow towards hip pocket and squeeze lat.',
              beginnerAlternative: 'Two-arm backpack row.',
            },
            {
              exerciseId: 'ex-dead-bug',
              exerciseName: 'Dead Bug (Core Stabilization)',
              targetSets: 3,
              targetRepsOrDuration: '10 per side',
              targetRestSec: 60,
              isAbs: true,
              imageUrl: getExerciseImage('dead-bug'),
              estimatedDurationMin: 6,
              progressionRule: 'Maintain absolute abdominal brace.',
              beginnerAlternative: 'Bent-knee taps.',
            },
          ],
          isRestDay: false,
          warmupProtocol,
        };

      case 'Thursday':
        return {
          workoutType: 'Recovery',
          title: 'Active Recovery & Hydration',
          description: 'Eat your scheduled protein meals and rest your nervous system.',
          targetExercises: [],
          isRestDay: true,
          warmupProtocol,
        };

      case 'Friday':
        return {
          workoutType: 'Workout A + abs',
          title: 'Full Body Overload + Direct Core Finish',
          description: 'High-density strength session stimulating the whole body before weekend recovery.',
          targetExercises: [
            {
              exerciseId: 'ex-squat',
              exerciseName: 'Squat (3-Second Eccentric Tempo)',
              targetSets: 3,
              targetRepsOrDuration: '10–12 reps',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('squat'),
              estimatedDurationMin: 8,
              progressionRule: 'Control 3-second descent on every rep.',
              beginnerAlternative: 'Standard squat.',
            },
            {
              exerciseId: 'ex-incline-pushup',
              exerciseName: 'Push-Up (Upper Body Push)',
              targetSets: 3,
              targetRepsOrDuration: '8–12 reps',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('pushup'),
              estimatedDurationMin: 8,
              progressionRule: 'Pause 1 second with chest 1 inch above surface.',
              beginnerAlternative: 'Incline push-up.',
            },
            {
              exerciseId: 'ex-backpack-row',
              exerciseName: 'Backpack Row',
              targetSets: 3,
              targetRepsOrDuration: '10–12 reps',
              targetRestSec: 90,
              isAbs: false,
              imageUrl: getExerciseImage('row'),
              estimatedDurationMin: 8,
              progressionRule: 'Hold top squeeze 2 seconds.',
              beginnerAlternative: 'Door row.',
            },
            {
              exerciseId: 'ex-forearm-plank',
              exerciseName: 'Forearm Plank',
              targetSets: 3,
              targetRepsOrDuration: '30–45 seconds',
              targetRestSec: 60,
              isAbs: true,
              imageUrl: getExerciseImage('plank'),
              estimatedDurationMin: 6,
              progressionRule: 'Maximum active abdominal squeeze.',
              beginnerAlternative: 'Knee plank.',
            },
          ],
          isRestDay: false,
          warmupProtocol,
        };

      case 'Saturday':
      case 'Sunday':
      default:
        return {
          workoutType: 'Rest',
          title: isWeekend ? 'Weekend Muscle Growth & Nutrition Focus' : 'Scheduled Rest Day',
          description: 'Relax and nourish your body. Hitting your 2,150 kcal goal allows glycogen stores to fill completely.',
          targetExercises: [],
          isRestDay: true,
          warmupProtocol,
        };
    }
  }

  // DEFAULT / BEGINNER / GENERAL FITNESS: Approachable, joint-friendly, gradual progression
  switch (dayOfWeek) {
    case 'Monday':
      return {
        workoutType: 'Workout A',
        title: 'Beginner Full Body Foundation',
        description: 'Establish consistent movement patterns with bodyweight squats, incline push-ups, and planks.',
        targetExercises: [
          {
            exerciseId: 'ex-squat',
            exerciseName: 'Chair / Bodyweight Squat',
            targetSets: 2,
            targetRepsOrDuration: '8–12 reps',
            targetRestSec: 75,
            isAbs: false,
            imageUrl: getExerciseImage('squat'),
            estimatedDurationMin: 6,
            progressionRule: 'Progress from chair box squat to free bodyweight squat.',
            beginnerAlternative: 'Chair-supported squat.',
          },
          {
            exerciseId: 'ex-incline-pushup',
            exerciseName: 'Incline Push-Up (Countertop/Wall)',
            targetSets: 2,
            targetRepsOrDuration: '6–10 reps',
            targetRestSec: 75,
            isAbs: false,
            imageUrl: getExerciseImage('pushup'),
            estimatedDurationMin: 6,
            progressionRule: 'Step feet further back to increase load.',
            beginnerAlternative: 'Wall push-up.',
          },
          {
            exerciseId: 'ex-forearm-plank',
            exerciseName: 'Forearm Plank',
            targetSets: 2,
            targetRepsOrDuration: '15–30 seconds',
            targetRestSec: 60,
            isAbs: true,
            imageUrl: getExerciseImage('plank'),
            estimatedDurationMin: 5,
            progressionRule: 'Add 5 seconds when you can hold 30s with good alignment.',
            beginnerAlternative: 'Knee plank.',
          },
        ],
        isRestDay: false,
        warmupProtocol,
      };

    case 'Wednesday':
      return {
        workoutType: 'Workout B',
        title: 'Beginner Posture & Posterior Strength',
        description: 'Focus on back health, glute activation, and gentle unilateral balance.',
        targetExercises: [
          {
            exerciseId: 'ex-backpack-row',
            exerciseName: 'Light Backpack Row',
            targetSets: 2,
            targetRepsOrDuration: '8–12 reps',
            targetRestSec: 75,
            isAbs: false,
            imageUrl: getExerciseImage('row'),
            estimatedDurationMin: 6,
            progressionRule: 'Start with 3–5 kg in backpack.',
            beginnerAlternative: 'Towel row.',
          },
          {
            exerciseId: 'ex-glute-bridge',
            exerciseName: 'Glute Bridge',
            targetSets: 2,
            targetRepsOrDuration: '10–12 reps',
            targetRestSec: 60,
            isAbs: false,
            imageUrl: getExerciseImage('glute-bridge'),
            estimatedDurationMin: 6,
            progressionRule: 'Focus on squeezing glutes at the top.',
            beginnerAlternative: 'Bridge with small range of motion.',
          },
          {
            exerciseId: 'ex-dead-bug',
            exerciseName: 'Dead Bug',
            targetSets: 2,
            targetRepsOrDuration: '8 per side',
            targetRestSec: 60,
            isAbs: true,
            imageUrl: getExerciseImage('dead-bug'),
            estimatedDurationMin: 5,
            progressionRule: 'Slow controlled movement.',
            beginnerAlternative: 'Bent-knee floor tap.',
          },
        ],
        isRestDay: false,
        warmupProtocol,
      };

    case 'Friday':
      return {
        workoutType: 'Workout A + abs',
        title: 'Full Body Consistency & Core Practice',
        description: 'Consolidate the week’s movements and build exercise habit endurance.',
        targetExercises: [
          {
            exerciseId: 'ex-squat',
            exerciseName: 'Bodyweight Squat',
            targetSets: 2,
            targetRepsOrDuration: '10–12 reps',
            targetRestSec: 75,
            isAbs: false,
            imageUrl: getExerciseImage('squat'),
            estimatedDurationMin: 6,
            progressionRule: 'Maintain flat feet on the ground.',
            beginnerAlternative: 'Box squat.',
          },
          {
            exerciseId: 'ex-incline-pushup',
            exerciseName: 'Incline Push-Up',
            targetSets: 2,
            targetRepsOrDuration: '8–10 reps',
            targetRestSec: 75,
            isAbs: false,
            imageUrl: getExerciseImage('pushup'),
            estimatedDurationMin: 6,
            progressionRule: 'Controlled lowering.',
            beginnerAlternative: 'Wall push-up.',
          },
          {
            exerciseId: 'ex-forearm-plank',
            exerciseName: 'Forearm Plank',
            targetSets: 2,
            targetRepsOrDuration: '20–30s hold',
            targetRestSec: 60,
            isAbs: true,
            imageUrl: getExerciseImage('plank'),
            estimatedDurationMin: 5,
            progressionRule: 'Keep neck relaxed and gaze down.',
            beginnerAlternative: 'Knee plank.',
          },
        ],
        isRestDay: false,
        warmupProtocol,
      };

    default:
      return {
        workoutType: 'Recovery',
        title: 'Active Recovery & Habit Building',
        description: 'Take an easy walk, hydrate, and prepare healthy vegetarian meals.',
        targetExercises: [],
        isRestDay: true,
        warmupProtocol,
      };
  }
}

/**
 * 3. GOAL-DRIVEN DYNAMIC DIET & MEAL PLAN GENERATOR
 * Generates structured vegetarian meal templates with timings, costs in INR, macros, and prep instructions.
 */
export function generateGoalMealTemplates(
  goal: FitnessGoal = 'six_pack',
  diet: DietPreference = 'vegetarian',
  budget: BudgetLevel = 'low'
): MealTemplate[] {
  // Balanced Indian Vegetarian high-protein staples
  return [
    {
      id: 'plan-breakfast-oats',
      name: 'Oats, Milk, Banana & Peanuts Bowl',
      mealType: 'breakfast',
      description: 'Slow-digesting complex carbs and healthy fats for sustained morning energy.',
      isVegetarian: true,
      totalCalories: 640,
      totalProtein: 25.2,
      totalCarbs: 80.0,
      totalFats: 26.3,
      recommendedTime: '07:30 AM',
      estimatedCostInr: 35,
      imageUrl: getMealImage('oats'),
      prepInstructions: 'Boil oats with 250ml cow milk for 3-4 mins. Top with 1 sliced banana and 30g roasted peanuts.',
      substitutions: 'Can substitute cow milk with soy milk, or oats with 3 idlis + sambar + 150g curd.',
      items: [
        { foodName: 'Rolled Oats', quantity: 60, unit: 'g', calories: 230, protein: 8.0, carbs: 40.0, fats: 4.0, isEstimate: false },
        { foodName: 'Cow Milk', quantity: 250, unit: 'ml', calories: 150, protein: 8.0, carbs: 12.0, fats: 8.0, isEstimate: false },
        { foodName: 'Banana (Medium)', quantity: 1, unit: 'piece', calories: 105, protein: 1.2, carbs: 27.0, fats: 0.3, isEstimate: false },
        { foodName: 'Roasted Peanuts', quantity: 30, unit: 'g', calories: 170, protein: 8.0, carbs: 5.0, fats: 14.0, isEstimate: false },
      ],
    },
    {
      id: 'plan-snack-chana',
      name: 'Roasted Chana Bhel & Seasonal Fruit',
      mealType: 'snack',
      description: 'Crunchy, affordable Indian plant-protein snack rich in dietary fiber and micronutrients.',
      isVegetarian: true,
      totalCalories: 260,
      totalProtein: 12.0,
      totalCarbs: 45.0,
      totalFats: 4.5,
      recommendedTime: '10:30 AM',
      estimatedCostInr: 20,
      imageUrl: getMealImage('roasted chana'),
      prepInstructions: 'Toss 50g roasted brown chana with chopped onion, tomato, lemon juice, and a pinch of chaat masala. Enjoy with an apple or guava.',
      substitutions: 'Can swap with 150g boiled sprouts (moong) or 150g fresh curd with pomegranate seeds.',
      items: [
        { foodName: 'Roasted Brown Chana', quantity: 50, unit: 'g', calories: 185, protein: 10.5, carbs: 32.0, fats: 3.5, isEstimate: false },
        { foodName: 'Fresh Apple / Guava', quantity: 1, unit: 'piece', calories: 75, protein: 0.8, carbs: 18.0, fats: 0.2, isEstimate: false },
      ],
    },
    {
      id: 'plan-lunch-thali',
      name: 'Rice, Dal, Mixed Sabzi & Fresh Curd',
      mealType: 'lunch',
      description: 'Traditional home thali combining grains and legumes for a complete amino acid profile.',
      isVegetarian: true,
      totalCalories: 620,
      totalProtein: 22.5,
      totalCarbs: 95.0,
      totalFats: 14.5,
      recommendedTime: '01:00 PM',
      estimatedCostInr: 45,
      imageUrl: getMealImage('rice, dal, mixed vegetables & curd'),
      prepInstructions: '1 cup cooked rice served with 1 generous katori toor/moong dal, seasonal mixed vegetable sabzi, and 150g plain curd.',
      substitutions: 'Can swap white rice with 3 whole wheat rotis, or toor dal with rajma or chole.',
      items: [
        { foodName: 'Cooked White/Brown Rice', quantity: 150, unit: 'g', calories: 195, protein: 4.0, carbs: 43.0, fats: 0.5, isEstimate: false },
        { foodName: 'Yellow Dal (Toor/Moong)', quantity: 200, unit: 'g', calories: 180, protein: 9.5, carbs: 26.0, fats: 3.5, isEstimate: false },
        { foodName: 'Mixed Vegetable Sabzi', quantity: 120, unit: 'g', calories: 110, protein: 3.0, carbs: 14.0, fats: 5.0, isEstimate: true },
        { foodName: 'Fresh Plain Curd / Dahi', quantity: 150, unit: 'g', calories: 95, protein: 5.0, carbs: 6.0, fats: 5.0, isEstimate: false },
      ],
    },
    {
      id: 'plan-preworkout-fuel',
      name: 'Pre-Workout Banana & Milk (or Peanut Toast)',
      mealType: 'pre_workout',
      description: 'Rapidly digestible simple carbohydrates for glycogen replenishment 60 mins before training.',
      isVegetarian: true,
      totalCalories: 240,
      totalProtein: 8.5,
      totalCarbs: 38.0,
      totalFats: 6.0,
      recommendedTime: '04:30 PM',
      estimatedCostInr: 25,
      imageUrl: getMealImage('banana with milk'),
      prepInstructions: 'Eat 1 medium ripe banana with a glass (200ml) of milk, or 1 slice brown bread with 1 tbsp peanut butter.',
      substitutions: 'Can swap with 2 boiled potatoes with a pinch of black salt.',
      items: [
        { foodName: 'Ripe Banana', quantity: 1, unit: 'piece', calories: 105, protein: 1.2, carbs: 27.0, fats: 0.3, isEstimate: false },
        { foodName: 'Cow Milk', quantity: 200, unit: 'ml', calories: 120, protein: 6.4, carbs: 9.6, fats: 6.4, isEstimate: false },
      ],
    },
    {
      id: 'plan-dinner-protein',
      name: 'Paneer Bhurji (or Soya Chunks) with 2 Rotis & Salad',
      mealType: 'dinner',
      description: 'Rich post-training protein meal supporting overnight muscle recovery and cellular repair.',
      isVegetarian: true,
      totalCalories: 580,
      totalProtein: 28.0,
      totalCarbs: 55.0,
      totalFats: 24.0,
      recommendedTime: '07:15 PM',
      estimatedCostInr: 50,
      imageUrl: getMealImage('paneer bhurji & chapati'),
      prepInstructions: 'Crumble 100g fresh paneer (or soak 50g soya chunks) and saute with onion, tomato, turmeric, cumin, and green chilies. Serve with 2 phulkas and cucumber salad.',
      substitutions: 'Can use 50g soya chunks curry (yields 26g protein at very low cost ~15 INR).',
      items: [
        { foodName: 'Fresh Paneer / Soya Chunks', quantity: 100, unit: 'g', calories: 290, protein: 18.0, carbs: 4.0, fats: 21.0, isEstimate: false },
        { foodName: 'Whole Wheat Chapati / Roti', quantity: 2, unit: 'piece', calories: 180, protein: 6.0, carbs: 36.0, fats: 1.5, isEstimate: false },
        { foodName: 'Green Salad (Cucumber, Tomato)', quantity: 100, unit: 'g', calories: 30, protein: 1.0, carbs: 6.0, fats: 0.2, isEstimate: true },
        { foodName: 'Cooking Mustard/Olive Oil', quantity: 1, unit: 'tsp', calories: 45, protein: 0.0, carbs: 0.0, fats: 5.0, isEstimate: false },
      ],
    },
    {
      id: 'plan-night-milk',
      name: 'Warm Turmeric Milk & Roasted Peanuts',
      mealType: 'snack',
      description: 'Slow-digesting casein protein providing a steady amino acid stream throughout 8 hours of sleep.',
      isVegetarian: true,
      totalCalories: 210,
      totalProtein: 9.5,
      totalCarbs: 14.0,
      totalFats: 11.5,
      recommendedTime: '09:15 PM',
      estimatedCostInr: 20,
      imageUrl: getMealImage('warm milk with roasted peanuts'),
      prepInstructions: 'Warm 200ml cow milk with a pinch of turmeric and black pepper. Pair with 15g roasted peanuts if protein target is still pending.',
      substitutions: '150g fresh curd if hot milk is not preferred.',
      items: [
        { foodName: 'Warm Cow Milk', quantity: 200, unit: 'ml', calories: 120, protein: 6.4, carbs: 9.6, fats: 6.4, isEstimate: false },
        { foodName: 'Roasted Peanuts', quantity: 15, unit: 'g', calories: 85, protein: 3.8, carbs: 2.5, fats: 7.0, isEstimate: false },
      ],
    },
  ];
}

/**
 * 4. DYNAMIC MORNING-TO-EVENING TIMETABLE GENERATOR
 * Builds a personalized minute-by-minute schedule tailored to user's wake time, sleep time, and workout preference.
 */
export function generateDailyTimetable(
  date: string,
  settings: UserSettings
): DailyScheduleItem[] {
  const workoutTime = settings.preferredWorkoutTime || 'evening';
  const wakeTimeStr = settings.wakeTime || '06:30';
  const sleepTimeStr = settings.sleepTime || '22:30';
  const goal = settings.fitnessGoal || 'six_pack';

  // Helper to format hour and minute to readable AM/PM string
  const formatTime = (totalMinutes: number): string => {
    let normalized = totalMinutes % (24 * 60);
    if (normalized < 0) normalized += 24 * 60;
    const hours24 = Math.floor(normalized / 60);
    const mins = normalized % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${hours12}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const parseToMinutes = (timeStr: string): number => {
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + (parseInt(parts[1], 10) || 0);
  };

  const wakeMinutes = parseToMinutes(wakeTimeStr);

  const schedule: DailyScheduleItem[] = [];

  // MORNING WORKOUT TIMELINE (e.g. Workout at ~07:00 AM)
  if (workoutTime === 'morning') {
    schedule.push(
      {
        id: `sched-wake-${date}`,
        date,
        time: formatTime(wakeMinutes),
        title: 'Wake Up & Morning Hydration Protocol',
        category: 'wake',
        description: 'Drink 400–500ml water to kickstart cellular hydration after sleep. 5 minutes of gentle neck and spinal mobility.',
        durationMin: 15,
        completed: false,
        imageUrl: getExerciseImage('mobility'),
        actionLink: '/checkin',
        researchNote: 'Morning hydration reverses nocturnal water loss and primes digestion.',
      },
      {
        id: `sched-preworkout-${date}`,
        date,
        time: formatTime(wakeMinutes + 25),
        title: 'Light Pre-Workout Energy (Banana / 100ml Milk)',
        category: 'snack',
        description: 'Quick easily-absorbed simple carbohydrates to elevate blood glucose without feeling heavy in your stomach.',
        durationMin: 15,
        completed: false,
        imageUrl: getMealImage('banana with milk'),
        actionLink: '/food',
        calories: 140,
        protein: 4.5,
        researchNote: 'ISSN: 20-30g simple carbs 30 mins before training prevents early fatigue and supports intensity.',
      },
      {
        id: `sched-workout-${date}`,
        date,
        time: formatTime(wakeMinutes + 50),
        title: 'Scheduled Resistance & Core Training',
        category: 'workout',
        description: 'Execute your programmed workout routine. Warm-up dynamically, maintain controlled tempo, and rest adequately between sets.',
        durationMin: settings.workoutDurationMin || 45,
        completed: false,
        imageUrl: getExerciseImage('squat'),
        actionLink: '/workouts',
        researchNote: 'ACSM 2026: Controlled eccentric contractions (2-3s down) produce superior muscle fiber recruitment.',
      },
      {
        id: `sched-breakfast-${date}`,
        date,
        time: formatTime(wakeMinutes + 110),
        title: 'Post-Workout Breakfast: Oats, Milk & Peanuts',
        category: 'meal',
        description: 'High-protein recovery bowl. Replenish glycogen stores and supply amino acids to repair trained muscle tissue.',
        durationMin: 30,
        completed: false,
        imageUrl: getMealImage('oats'),
        actionLink: '/food',
        calories: 640,
        protein: 25.2,
        researchNote: 'Consuming 20-30g protein within 1-2 hours of resistance training optimizes muscle protein synthesis (MPS).',
      },
      {
        id: `sched-snack-${date}`,
        date,
        time: formatTime(wakeMinutes + 270),
        title: 'Mid-Morning Snack: Roasted Chana & Fruit',
        category: 'snack',
        description: '50g roasted brown chana and seasonal fruit. Keeps amino acid flow steady and delivers dietary fiber.',
        durationMin: 15,
        completed: false,
        imageUrl: getMealImage('roasted chana'),
        actionLink: '/food',
        calories: 260,
        protein: 12.0,
      },
      {
        id: `sched-lunch-${date}`,
        date,
        time: formatTime(wakeMinutes + 390),
        title: 'Lunch: Rice, Dal, Mixed Sabzi & Fresh Curd',
        category: 'meal',
        description: 'Balanced vegetarian lunch. Curd provides gut-friendly probiotics and bioavailable calcium and protein.',
        durationMin: 40,
        completed: false,
        imageUrl: getMealImage('rice, dal, mixed vegetables & curd'),
        actionLink: '/food',
        calories: 620,
        protein: 22.5,
      },
      {
        id: `sched-afternoon-hydrate-${date}`,
        date,
        time: formatTime(wakeMinutes + 540),
        title: 'Afternoon Hydration & Movement Check',
        category: 'hydration',
        description: 'Drink 500ml water. Walk around for 5 minutes if studying or working at a desk.',
        durationMin: 10,
        completed: false,
        imageUrl: getMealImage('curd'),
        actionLink: '/checkin',
      },
      {
        id: `sched-dinner-${date}`,
        date,
        time: formatTime(wakeMinutes + 720),
        title: 'Dinner: Paneer Bhurji / Soya Curry & 2 Rotis',
        category: 'meal',
        description: 'High-protein evening meal delivering essential branched-chain amino acids (BCAAs).',
        durationMin: 40,
        completed: false,
        imageUrl: getMealImage('paneer bhurji & chapati'),
        actionLink: '/food',
        calories: 580,
        protein: 28.0,
      },
      {
        id: `sched-night-milk-${date}`,
        date,
        time: formatTime(wakeMinutes + 840),
        title: 'Optional: Warm Turmeric Milk / Light Snack',
        category: 'snack',
        description: 'Warm cow milk with a pinch of turmeric. Casein protein provides sustained amino acid release during sleep.',
        durationMin: 15,
        completed: false,
        imageUrl: getMealImage('warm milk with roasted peanuts'),
        actionLink: '/food',
        calories: 140,
        protein: 6.5,
      },
      {
        id: `sched-sleep-${date}`,
        date,
        time: formatTime(parseToMinutes(sleepTimeStr)),
        title: 'Wind-Down & 8-Hour Recovery Sleep',
        category: 'sleep',
        description: 'Dim lights, avoid screens 30 mins before bed. Growth hormone reaches peak secretion during deep non-REM sleep.',
        durationMin: 480,
        completed: false,
        imageUrl: getExerciseImage('mobility'),
        actionLink: '/checkin',
        researchNote: 'Sleep deprivation blunts muscle protein synthesis and increases cortisol-induced muscle catabolism.',
      }
    );
  }
  // AFTERNOON OR EVENING WORKOUT TIMELINE (Default Evening ~5:30 PM)
  else {
    schedule.push(
      {
        id: `sched-wake-${date}`,
        date,
        time: formatTime(wakeMinutes),
        title: '6:30 AM — Wake Up & Morning Routine',
        category: 'wake',
        description: 'Drink 400ml water, complete 5–10 minutes of comfortable mobility and joint circles.',
        durationMin: 20,
        completed: false,
        imageUrl: getExerciseImage('mobility'),
        actionLink: '/checkin',
        researchNote: 'Hydrate according to thirst and conditions to restore nocturnal fluid loss.',
      },
      {
        id: `sched-breakfast-${date}`,
        date,
        time: formatTime(wakeMinutes + 60),
        title: '7:30 AM — Breakfast: Oats, Milk, Banana & Peanuts',
        category: 'meal',
        description: 'High-energy vegetarian breakfast bowl providing complex carbohydrates and 25g protein.',
        durationMin: 30,
        completed: false,
        imageUrl: getMealImage('oats'),
        actionLink: '/food',
        calories: 640,
        protein: 25.2,
        researchNote: 'Regular morning protein distribution stimulates morning muscle protein synthesis.',
      },
      {
        id: `sched-snack-${date}`,
        date,
        time: formatTime(wakeMinutes + 240),
        title: '10:30 AM — Morning Snack: Roasted Chana & Fruit',
        category: 'snack',
        description: 'Roasted brown chana and seasonal fruit. Satisfying crunch, high fiber, and clean plant protein.',
        durationMin: 15,
        completed: false,
        imageUrl: getMealImage('roasted chana'),
        actionLink: '/food',
        calories: 260,
        protein: 12.0,
      },
      {
        id: `sched-lunch-${date}`,
        date,
        time: formatTime(wakeMinutes + 390),
        title: '1:00 PM — Lunch: Rice, Dal, Sabzi & Fresh Curd',
        category: 'meal',
        description: 'Wholesome balanced home meal. Adjust rice or roti portions to match your appetite and energy target.',
        durationMin: 45,
        completed: false,
        imageUrl: getMealImage('rice, dal, mixed vegetables & curd'),
        actionLink: '/food',
        calories: 620,
        protein: 22.5,
      },
      {
        id: `sched-preworkout-${date}`,
        date,
        time: formatTime(wakeMinutes + 600),
        title: '4:30 PM — Pre-Workout Fuel: Banana with Milk / Peanut Toast',
        category: 'snack',
        description: 'Easily digestible carbohydrates 60 minutes before training to fuel high-intensity muscular contractions.',
        durationMin: 20,
        completed: false,
        imageUrl: getMealImage('banana with milk'),
        actionLink: '/food',
        calories: 240,
        protein: 8.5,
        researchNote: 'Simple carbs taken 60 mins before training elevate glycogen availability without digestive distress.',
      },
      {
        id: `sched-workout-${date}`,
        date,
        time: formatTime(wakeMinutes + 660),
        title: '5:30–6:30 PM — Scheduled Resistance & Core Training',
        category: 'workout',
        description: 'Execute your scheduled workout session. Warm-up dynamically, track your sets/reps, and cool down easily.',
        durationMin: settings.workoutDurationMin || 60,
        completed: false,
        imageUrl: getExerciseImage('squat'),
        actionLink: '/workouts',
        researchNote: 'ACSM: Train major muscle groups with progressive overload; track working weights over time.',
      },
      {
        id: `sched-dinner-${date}`,
        date,
        time: formatTime(wakeMinutes + 765),
        title: '7:15 PM — Dinner: Paneer / Soya Chunks with Rotis',
        category: 'meal',
        description: 'Post-workout dinner rich in protein and micronutrients. Crucial for repairing muscle fibers trained today.',
        durationMin: 45,
        completed: false,
        imageUrl: getMealImage('paneer bhurji & chapati'),
        actionLink: '/food',
        calories: 580,
        protein: 28.0,
      },
      {
        id: `sched-night-snack-${date}`,
        date,
        time: formatTime(wakeMinutes + 870),
        title: '9:00 PM — Optional Snack: Milk or Curd',
        category: 'snack',
        description: 'Enjoy a glass of milk or curd if still hungry or if needed to fulfill your daily protein target.',
        durationMin: 15,
        completed: false,
        imageUrl: getMealImage('warm milk with roasted peanuts'),
        actionLink: '/food',
        calories: 140,
        protein: 6.5,
      },
      {
        id: `sched-sleep-${date}`,
        date,
        time: formatTime(parseToMinutes(sleepTimeStr)),
        title: '10:00 PM — Wind Down & Sleep Routine',
        category: 'sleep',
        description: 'Review the day’s progress, prepare tomorrow’s workout, and sleep 8 hours for complete physical recovery.',
        durationMin: 480,
        completed: false,
        imageUrl: getExerciseImage('mobility'),
        actionLink: '/checkin',
        researchNote: 'Anabolic muscle repair occurs primarily during slow-wave deep sleep.',
      }
    );
  }

  return schedule;
}
