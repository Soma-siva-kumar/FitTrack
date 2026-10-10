import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve('./.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let privateKey = env.GOOGLE_PRIVATE_KEY;
const sheetId = env.GOOGLE_SHEET_ID;

console.log('Testing authentication:');
console.log('Client Email:', clientEmail);
console.log('Sheet ID:', sheetId);

privateKey = privateKey.replace(/\\n/g, '\n');

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_TABS = [
  'DailyProgress',
  'FoodLog',
  'MealTemplates',
  'WorkoutPlan',
  'WorkoutLog',
  'ExerciseLibrary',
  'BodyMeasurements',
  'Settings',
];

const TAB_HEADERS = {
  DailyProgress: [
    'id', 'date', 'dayNumber', 'weightKg', 'waterLiters', 'caloriesConsumed',
    'proteinGrams', 'foodLoggingCompleted', 'proteinTargetReached', 'workoutCompleted',
    'restDay', 'absCompleted', 'sleepHours', 'energyRating', 'notes',
    'completionPercentage', 'updatedAt'
  ],
  FoodLog: [
    'id', 'date', 'mealType', 'foodName', 'quantity', 'unit', 'calories',
    'protein', 'carbs', 'fats', 'isEstimate', 'notes', 'createdAt'
  ],
  MealTemplates: [
    'id', 'name', 'mealType', 'totalCalories', 'totalProtein', 'totalCarbs',
    'totalFats', 'isVegetarian', 'description', 'itemsJson'
  ],
  WorkoutPlan: [
    'id', 'date', 'dayNumber', 'dayOfWeek', 'workoutType', 'title',
    'isRestDay', 'description', 'targetExercisesJson'
  ],
  WorkoutLog: [
    'id', 'date', 'exerciseId', 'exerciseName', 'setNumber', 'targetRepsOrDuration',
    'actualRepsOrDuration', 'weightKg', 'completed', 'rpe', 'formNotes', 'timestamp'
  ],
  ExerciseLibrary: [
    'id', 'name', 'category', 'targetMuscles', 'equipment', 'instructionsJson',
    'formCuesJson', 'substitutions', 'defaultSets', 'defaultRepsOrDuration',
    'defaultRestSec', 'isAbs'
  ],
  BodyMeasurements: [
    'id', 'date', 'weightKg', 'waistCm', 'chestCm', 'armCm', 'thighCm',
    'energyLevel', 'sleepDuration', 'performanceNotes', 'photoReference', 'createdAt'
  ],
  Settings: [
    'id', 'key', 'value', 'updatedAt'
  ]
};

async function main() {
  const sheets = google.sheets({ version: 'v4', auth });
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  console.log('✅ Connected successfully to spreadsheet:', meta.data.properties.title);

  const existingSheets = meta.data.sheets?.map(s => s.properties.title) || [];
  console.log('Existing tabs in spreadsheet:', existingSheets);

  const requests = [];
  for (const tab of SHEET_TABS) {
    if (!existingSheets.includes(tab)) {
      requests.push({
        addSheet: {
          properties: { title: tab }
        }
      });
    }
  }

  if (requests.length > 0) {
    console.log(`Creating ${requests.length} missing tabs in Google Sheets...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { requests }
    });
    console.log('✅ Created tabs.');
  }

  // Ensure headers exist for each tab
  console.log('Writing standardized headers to all 8 tabs...');
  for (const tab of SHEET_TABS) {
    const headers = TAB_HEADERS[tab];
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tab}!A1:${String.fromCharCode(64 + headers.length)}1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers]
      }
    });
  }
  console.log('🎉 SUCCESS: All 8 tabs configured with headers and ready for live cloud syncing!');
}

main().catch(err => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
