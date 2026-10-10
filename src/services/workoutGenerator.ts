import { TargetExercise, WorkoutPlanDay, WorkoutType } from '../types';
import { getAllChallengeDates, getDayOfWeekName, getChallengeDayNumber } from '../utils/dateUtils';

export const WORKOUT_A_EXERCISES: TargetExercise[] = [
  {
    exerciseId: 'ex-squat',
    exerciseName: 'Bodyweight Squat',
    targetSets: 2,
    targetRepsOrDuration: '8–15 reps',
    targetRestSec: 90,
    isAbs: false,
  },
  {
    exerciseId: 'ex-incline-pushup',
    exerciseName: 'Incline Push-Up',
    targetSets: 2,
    targetRepsOrDuration: '6–12 reps',
    targetRestSec: 90,
    isAbs: false,
  },
  {
    exerciseId: 'ex-backpack-row',
    exerciseName: 'Backpack Row (Two Arms)',
    targetSets: 2,
    targetRepsOrDuration: '8–15 reps',
    targetRestSec: 90,
    isAbs: false,
  },
  {
    exerciseId: 'ex-glute-bridge',
    exerciseName: 'Glute Bridge',
    targetSets: 2,
    targetRepsOrDuration: '12–15 reps',
    targetRestSec: 60,
    isAbs: false,
  },
  {
    exerciseId: 'ex-forearm-plank',
    exerciseName: 'Forearm Plank',
    targetSets: 2,
    targetRepsOrDuration: '15–30 seconds',
    targetRestSec: 60,
    isAbs: true,
  },
];

export const WORKOUT_B_EXERCISES: TargetExercise[] = [
  {
    exerciseId: 'ex-reverse-lunge',
    exerciseName: 'Reverse Lunge',
    targetSets: 2,
    targetRepsOrDuration: '6–10 per leg',
    targetRestSec: 90,
    isAbs: false,
  },
  {
    exerciseId: 'ex-knee-pushup',
    exerciseName: 'Knee or Incline Push-Up',
    targetSets: 2,
    targetRepsOrDuration: '6–12 reps',
    targetRestSec: 90,
    isAbs: false,
  },
  {
    exerciseId: 'ex-backpack-rdl',
    exerciseName: 'Backpack Romanian Deadlift',
    targetSets: 2,
    targetRepsOrDuration: '8–12 reps',
    targetRestSec: 90,
    isAbs: false,
  },
  {
    exerciseId: 'ex-single-arm-row',
    exerciseName: 'One-Arm Backpack Row',
    targetSets: 2,
    targetRepsOrDuration: '8–12 per side',
    targetRestSec: 90,
    isAbs: false,
  },
  {
    exerciseId: 'ex-dead-bug',
    exerciseName: 'Dead Bug',
    targetSets: 2,
    targetRepsOrDuration: '8–10 per side',
    targetRestSec: 60,
    isAbs: true,
  },
];

export const WORKOUT_A_PLUS_ABS_EXERCISES: TargetExercise[] = [
  ...WORKOUT_A_EXERCISES,
  {
    exerciseId: 'ex-reverse-crunch',
    exerciseName: 'Reverse Crunch',
    targetSets: 2,
    targetRepsOrDuration: '8–12 reps',
    targetRestSec: 60,
    isAbs: true,
  },
  {
    exerciseId: 'ex-side-plank',
    exerciseName: 'Side Plank',
    targetSets: 2,
    targetRepsOrDuration: '15–25s per side',
    targetRestSec: 60,
    isAbs: true,
  },
];

/**
 * Generate 82-day full dated workout schedule
 * Oct 11, 2026 is Sunday (Day 1: Kickoff & Rest)
 * Mon Oct 12: Workout A
 * Tue Oct 13: Recovery
 * Wed Oct 14: Workout B
 * Thu Oct 15: Recovery
 * Fri Oct 16: Workout A + abs
 * Sat Oct 17: Light activity / mobility
 * Sun Oct 18: Rest
 * After week 2 (Day 15+), alternates A and B systematically while maintaining recovery.
 */
export function generateInitial82DaySchedule(): WorkoutPlanDay[] {
  const dates = getAllChallengeDates();
  const schedule: WorkoutPlanDay[] = [];

  dates.forEach((dateStr) => {
    const dayNumber = getChallengeDayNumber(dateStr);
    const dayOfWeek = getDayOfWeekName(dateStr);
    const weekNumber = Math.ceil(dayNumber / 7);

    let workoutType: WorkoutType = 'Rest';
    let title = '';
    let description = '';
    let targetExercises: TargetExercise[] = [];
    let isRestDay = true;

    if (dayNumber === 1) {
      // Oct 11, 2026 - Sunday Kickoff
      workoutType = 'Rest';
      title = 'Day 1: Challenge Kickoff & Home Gym Prep';
      description = 'Prepare your water bottle, backpack with books/bottles, workout mat, and review exercise technique.';
      isRestDay = true;
      targetExercises = [];
    } else {
      // Determine schedule by day of week
      switch (dayOfWeek) {
        case 'Monday':
          // Alternate Workout A vs B slightly in later weeks if desired, or keep steady A
          workoutType = weekNumber % 2 === 1 ? 'Workout A' : 'Workout B';
          title = `${workoutType} — Full Body Foundation`;
          description = 'Focus on controlled eccentric lowering (2-3 seconds down) and full range of motion.';
          targetExercises = workoutType === 'Workout A' ? [...WORKOUT_A_EXERCISES] : [...WORKOUT_B_EXERCISES];
          isRestDay = false;
          break;

        case 'Tuesday':
          workoutType = 'Recovery';
          title = 'Active Recovery & Easy Walk';
          description = '30–45 minute relaxed outdoor walk to promote blood flow without muscle fatigue.';
          targetExercises = [];
          isRestDay = true;
          break;

        case 'Wednesday':
          workoutType = weekNumber % 2 === 1 ? 'Workout B' : 'Workout A';
          title = `${workoutType} — Full Body Strength`;
          description = 'Maintain tight posture and steady breathing throughout all reps.';
          targetExercises = workoutType === 'Workout B' ? [...WORKOUT_B_EXERCISES] : [...WORKOUT_A_EXERCISES];
          isRestDay = false;
          break;

        case 'Thursday':
          workoutType = 'Recovery';
          title = 'Active Recovery & Hydration Focus';
          description = 'Light stretching, joint circles, and ensure you meet your 2.0L water goal.';
          targetExercises = [];
          isRestDay = true;
          break;

        case 'Friday':
          workoutType = 'Workout A + abs';
          title = 'Workout A + Dedicated Abdominals';
          description = 'Complete the full body strength circuit followed by focused core stabilization and pelvic tilt work.';
          targetExercises = [...WORKOUT_A_PLUS_ABS_EXERCISES];
          isRestDay = false;
          break;

        case 'Saturday':
          workoutType = 'Light Activity';
          title = 'Mobility & Posture Maintenance';
          description = 'Gentle foam rolling, hip flexor stretches, hamstring openers, or an easy leisurely stroll.';
          targetExercises = [];
          isRestDay = true;
          break;

        case 'Sunday':
          workoutType = 'Rest';
          title = 'Full Rest & Weekly Reflection';
          description = 'Rest day. Sleep 8+ hours, review weekly nutrition consistency, and recharge for the upcoming week.';
          targetExercises = [];
          isRestDay = true;
          break;
      }
    }

    schedule.push({
      id: `plan-${dateStr}`,
      date: dateStr,
      dayNumber,
      dayOfWeek,
      workoutType,
      title,
      description,
      targetExercises,
      isRestDay,
    });
  });

  return schedule;
}
