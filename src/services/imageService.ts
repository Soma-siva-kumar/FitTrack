/**
 * Verified Fitness & Nutrition Media Asset Service
 * Maps exercises and meals to curated high-resolution photography and responsive images.
 */

// User-provided & verified CDN image mappings
export const EXERCISE_IMAGES: Record<string, string> = {
  // Forearm Plank
  'ex-forearm-plank': 'https://images.unsplash.com/photo-1566241134883-13eb2393a3cc?auto=format&fit=crop&w=800&q=80',
  'forearm plank': 'https://images.unsplash.com/photo-1566241134883-13eb2393a3cc?auto=format&fit=crop&w=800&q=80',
  'plank': 'https://images.unsplash.com/photo-1566241134883-13eb2393a3cc?auto=format&fit=crop&w=800&q=80',

  // Reverse Crunch / Core
  'ex-reverse-crunch': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  'reverse crunch': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',

  // Dead Bug / Deep Core
  'ex-dead-bug': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  'dead bug': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',

  // Side Plank
  'ex-side-plank': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  'side plank': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',

  // Squats (Bodyweight / Goblet)
  'ex-squat': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  'bodyweight squat': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
  'goblet squat': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',

  // Push-ups (Incline / Knee / Standard)
  'ex-incline-pushup': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
  'incline push-up': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
  'ex-knee-pushup': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',
  'knee or incline push-up': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=800&q=80',

  // Backpack Row (Two Arms & One-Arm)
  'ex-backpack-row': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'backpack row (two arms)': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  'ex-single-arm-row': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
  'one-arm backpack row': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',

  // Glute Bridge
  'ex-glute-bridge': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  'glute bridge': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',

  // Reverse Lunge
  'ex-reverse-lunge': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',
  'reverse lunge': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&w=800&q=80',

  // Romanian Deadlift
  'ex-backpack-rdl': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
  'backpack romanian deadlift': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',

  // Bird Dog
  'ex-bird-dog': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  'bird dog': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',

  // Dynamic Warm-Up & Mobility
  'warmup': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  'mobility': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
};

// Verified Food & Nutrition Image Mappings
export const MEAL_IMAGES: Record<string, string> = {
  // Breakfast - Oats, Milk, Banana & Peanuts
  'oats': 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
  'oats, milk, banana & peanuts': 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
  'oats bowl': 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
  'idli with sambar & curd': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',

  // Snack - Roasted Chana & Fruit / Curd
  'roasted chana': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  'roasted chana bhel & fruit': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  'sprouts': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',

  // Lunch - Rice, Dal, Vegetables & Curd
  'rice, dal, mixed vegetables & curd': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  'dal rice': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  'curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  'rajma rice': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',

  // Pre-Workout - Banana, Milk & Peanut Butter Toast
  'banana with milk': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  'pre-workout fuel': 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80',
  'peanut butter toast': 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=800&q=80',

  // Dinner - Paneer Bhurji / Soya Chunks with Roti
  'paneer bhurji & chapati': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  'soya chunks curry with rice/chapati': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  'tofu': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',

  // Evening/Night - Milk / Turmeric Milk
  'warm milk with roasted peanuts': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',

  // General Categories
  'breakfast': 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
  'lunch': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
  'dinner': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
  'snack': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
  'pre_workout': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
  'post_workout': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
};

// Fallback images
export const DEFAULT_EXERCISE_IMAGE =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';
export const DEFAULT_MEAL_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
export const DEFAULT_SCHEDULE_IMAGE =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80';

/**
 * Returns a high-res image URL for an exercise by ID or name
 */
export function getExerciseImage(idOrName: string, nameFallback?: string): string {
  if (idOrName) {
    const key = idOrName.toLowerCase().trim();
    if (EXERCISE_IMAGES[key]) return EXERCISE_IMAGES[key];
    for (const [k, url] of Object.entries(EXERCISE_IMAGES)) {
      if (key.includes(k) || k.includes(key)) {
        return url;
      }
    }
  }

  if (nameFallback) {
    const fallbackKey = nameFallback.toLowerCase().trim();
    if (EXERCISE_IMAGES[fallbackKey]) return EXERCISE_IMAGES[fallbackKey];
    for (const [k, url] of Object.entries(EXERCISE_IMAGES)) {
      if (fallbackKey.includes(k) || k.includes(fallbackKey)) {
        return url;
      }
    }
  }

  return DEFAULT_EXERCISE_IMAGE;
}

/**
 * Returns a high-res image URL for a meal/food by name or meal type
 */
export function getMealImage(foodNameOrType: string): string {
  if (!foodNameOrType) return DEFAULT_MEAL_IMAGE;
  const key = foodNameOrType.toLowerCase().trim();

  if (MEAL_IMAGES[key]) return MEAL_IMAGES[key];

  // Substring search
  for (const [k, url] of Object.entries(MEAL_IMAGES)) {
    if (key.includes(k) || k.includes(key)) {
      return url;
    }
  }

  return DEFAULT_MEAL_IMAGE;
}
