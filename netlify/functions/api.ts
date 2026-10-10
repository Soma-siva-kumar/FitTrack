import type { Handler, HandlerEvent } from '@netlify/functions';
import { google } from 'googleapis';

// Tab names matching specifications
export const SHEET_TABS = [
  'DailyProgress',
  'FoodLog',
  'MealTemplates',
  'WorkoutPlan',
  'WorkoutLog',
  'ExerciseLibrary',
  'BodyMeasurements',
  'Settings',
] as const;

// Header mappings for each tab
export const TAB_HEADERS: Record<string, string[]> = {
  DailyProgress: [
    'id', 'date', 'dayNumber', 'weightKg', 'waterLiters', 'caloriesConsumed',
    'proteinGrams', 'foodLoggingCompleted', 'proteinTargetReached', 'workoutCompleted',
    'restDay', 'absCompleted', 'sleepHours', 'energyRating', 'notes',
    'completionPercentage', 'updatedAt'
  ],
  FoodLog: [
    'id', 'date', 'mealType', 'foodName', 'quantity', 'unit', 'calories',
    'protein', 'carbs', 'fats', 'isEstimate', 'time', 'notes', 'createdAt'
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
    'id', 'date', 'time', 'condition', 'weightKg', 'waistCm', 'chestCm', 'armCm', 'thighCm',
    'energyLevel', 'sleepDuration', 'performanceNotes', 'photoReference', 'createdAt'
  ],
  Settings: [
    'id', 'key', 'value', 'updatedAt'
  ]
};

function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    return null;
  }

  // Handle newlines in private key
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return { auth, sheetId };
}

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Determine path / route
  const path = event.path.replace(/\/\.netlify\/functions\/api/, '').replace(/\/api/, '');
  const method = event.httpMethod;

  const credentials = getGoogleAuth();

  // Status check endpoint
  if (path === '/status' || path === '' || path === '/') {
    if (!credentials) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          configured: false,
          connected: false,
          message: 'Google Sheets credentials not configured in Netlify environment variables. Running in Local Storage Mode.',
          missing: [
            !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'GOOGLE_SERVICE_ACCOUNT_EMAIL' : null,
            !process.env.GOOGLE_PRIVATE_KEY ? 'GOOGLE_PRIVATE_KEY' : null,
            !process.env.GOOGLE_SHEET_ID ? 'GOOGLE_SHEET_ID' : null,
          ].filter(Boolean),
        }),
      };
    }

    try {
      const sheets = google.sheets({ version: 'v4', auth: credentials.auth });
      const meta = await sheets.spreadsheets.get({ spreadsheetId: credentials.sheetId });
      const sheetTitles = meta.data.sheets?.map((s) => s.properties?.title || '') || [];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          configured: true,
          connected: true,
          title: meta.data.properties?.title,
          sheetId: credentials.sheetId,
          tabs: sheetTitles,
          timestamp: new Date().toISOString(),
        }),
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          configured: true,
          connected: false,
          error: errorMessage,
          message: 'Google Sheets credentials provided but authentication failed or spreadsheet is not shared with the service account.',
        }),
      };
    }
  }

  // All other endpoints require valid credentials if requesting cloud sync
  if (!credentials) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Google Sheets is not configured on the server. Please check environment variables.',
      }),
    };
  }

  const sheets = google.sheets({ version: 'v4', auth: credentials.auth });

  try {
    // 1. Initialize sheets with proper tabs and headers if blank
    if (path === '/init-sheets' && method === 'POST') {
      const meta = await sheets.spreadsheets.get({ spreadsheetId: credentials.sheetId });
      const existingSheets = meta.data.sheets?.map((s) => s.properties?.title || '') || [];
      const requests = [];

      for (const tab of SHEET_TABS) {
        if (!existingSheets.includes(tab)) {
          requests.push({
            addSheet: {
              properties: { title: tab },
            },
          });
        }
      }

      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: credentials.sheetId,
          requestBody: { requests },
        });
      }

      // Ensure headers exist
      for (const tab of SHEET_TABS) {
        const headerRow = TAB_HEADERS[tab];
        if (headerRow) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: credentials.sheetId,
            range: `${tab}!A1:${String.fromCharCode(64 + headerRow.length)}1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [headerRow],
            },
          });
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Initialized sheet tabs and headers successfully.' }),
      };
    }

    // 2. GET /data?tab=DailyProgress
    if (path === '/data' && method === 'GET') {
      const tab = event.queryStringParameters?.tab;
      if (!tab || !SHEET_TABS.includes(tab as (typeof SHEET_TABS)[number])) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Invalid or missing tab. Valid tabs: ${SHEET_TABS.join(', ')}` }),
        };
      }

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: credentials.sheetId,
        range: `${tab}!A:Z`,
      });

      const rows = res.data.values || [];
      if (rows.length <= 1) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ data: [] }),
        };
      }

      const headersList = rows[0];
      const data = rows.slice(1).map((row) => {
        const obj: Record<string, unknown> = {};
        headersList.forEach((header, index) => {
          let val = row[index];
          // Attempt JSON parse for JSON fields
          if (header.endsWith('Json') && typeof val === 'string') {
            try {
              val = JSON.parse(val);
            } catch {
              // keep as string
            }
          }
          obj[header] = val !== undefined ? val : '';
        });
        return obj;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data }),
      };
    }

    // 3. POST /record -> append single record or batch
    if (path === '/record' && method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { tab, record } = body;

      if (!tab || !record || !SHEET_TABS.includes(tab)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing tab or record payload.' }),
        };
      }

      const headersList = TAB_HEADERS[tab];
      const rowValues = headersList.map((key) => {
        const val = record[key];
        if (typeof val === 'object' && val !== null) {
          return JSON.stringify(val);
        }
        return val !== undefined && val !== null ? String(val) : '';
      });

      await sheets.spreadsheets.values.append({
        spreadsheetId: credentials.sheetId,
        range: `${tab}!A:Z`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [rowValues],
        },
      });

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, id: record.id }),
      };
    }

    // 4. PUT /record -> update record by id
    if (path === '/record' && method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { tab, record } = body;

      if (!tab || !record || !record.id || !SHEET_TABS.includes(tab)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing tab, record, or id.' }),
        };
      }

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: credentials.sheetId,
        range: `${tab}!A:Z`,
      });

      const rows = res.data.values || [];
      if (rows.length <= 1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Record not found.' }) };
      }

      const idIndex = rows[0].indexOf('id');
      const targetRowIndex = rows.findIndex((r, idx) => idx > 0 && r[idIndex] === record.id);

      if (targetRowIndex === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Record not found.' }) };
      }

      const headersList = TAB_HEADERS[tab];
      const updatedRow = headersList.map((key) => {
        const val = record[key];
        if (typeof val === 'object' && val !== null) {
          return JSON.stringify(val);
        }
        return val !== undefined && val !== null ? String(val) : '';
      });

      const rowNumber = targetRowIndex + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId: credentials.sheetId,
        range: `${tab}!A${rowNumber}:${String.fromCharCode(64 + headersList.length)}${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [updatedRow],
        },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id: record.id }),
      };
    }

    // 5. DELETE /record -> delete record by id
    if (path === '/record' && method === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      const { tab, id } = body;

      if (!tab || !id || !SHEET_TABS.includes(tab)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing tab or record id.' }),
        };
      }

      const meta = await sheets.spreadsheets.get({ spreadsheetId: credentials.sheetId });
      const sheetObj = meta.data.sheets?.find((s) => s.properties?.title === tab);
      const sheetNumericId = sheetObj?.properties?.sheetId;

      if (sheetNumericId === undefined) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Tab sheet not found.' }) };
      }

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: credentials.sheetId,
        range: `${tab}!A:A`,
      });

      const rows = res.data.values || [];
      const targetRowIndex = rows.findIndex((r, idx) => idx > 0 && r[0] === id);

      if (targetRowIndex === -1) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Record not found.' }) };
      }

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: credentials.sheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetNumericId,
                  dimension: 'ROWS',
                  startIndex: targetRowIndex,
                  endIndex: targetRowIndex + 1,
                },
              },
            },
          ],
        },
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, id }),
      };
    }

    // 6. POST /batch-sync -> save full payload
    if (path === '/batch-sync' && method === 'POST') {
      const payload = JSON.parse(event.body || '{}');

      for (const tab of SHEET_TABS) {
        const records = payload[tab];
        if (Array.isArray(records)) {
          const headersList = TAB_HEADERS[tab];
          const rows = [
            headersList,
            ...records.map((r) =>
              headersList.map((key) => {
                const val = r[key];
                if (typeof val === 'object' && val !== null) {
                  return JSON.stringify(val);
                }
                return val !== undefined && val !== null ? String(val) : '';
              })
            ),
          ];

          await sheets.spreadsheets.values.update({
            spreadsheetId: credentials.sheetId,
            range: `${tab}!A1:Z${rows.length + 5}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: rows },
          });
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'All sheets synchronized successfully.' }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Not found: ${method} ${path}` }),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Google Sheets API Error:', errorMsg);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: errorMsg }),
    };
  }
};
