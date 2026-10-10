# FitTrack 82 — Personal Six-Pack Fitness Dashboard

**FitTrack 82** is a personal, mobile-responsive web application designed to track an 82-day muscle-building and six-pack journey from **October 11, 2026 through December 31, 2026 (inclusive)**.

Built specifically for beginner home training with zero or minimal equipment (bodyweight, backpack, chair/bed elevation) and an affordable Indian vegetarian diet.

---

## 🌟 Key Features

1. **82-Day Dated Challenge Engine**:
   - Spans October 11, 2026 (Day 1 Kickoff & Prep) through December 31, 2026 (Day 82 Finale).
   - Dynamic timeline counter, remaining days calculator, and streak tracking.
   - Date navigator allows selecting, editing, or viewing historical days in Indian Standard Time (IST).

2. **Personal Profile & Provisional Targets** (Preconfigured & Editable):
   - **Age**: 22
   - **Height**: 168 cm
   - **Starting Weight**: 50.0 kg
   - **Diet**: Vegetarian (no eggs or meat)
   - **Experience**: Beginner | **Location**: Home | **Budget**: Low
   - **Goal**: Build muscle & abdominal strength
   - **Calories**: 2,000–2,200 kcal/day (Default: 2,100 kcal)
   - **Protein**: 70–85 g/day (Default: 80 g)
   - **Water**: 2.0 Litres/day (with quick-add buttons)
   - **Sleep**: 8.0 Hours/night
   - **Frequency**: 3 strength sessions per week

3. **Dedicated Food Tracker**:
   - Log meals across 6 categories: *Breakfast*, *Lunch*, *Pre-Workout*, *Post-Workout*, *Dinner*, *Snacks*.
   - Nutrient tracking: Calories, Protein, Carbs, Fats, Serving Size & Units.
   - Unverified estimates clearly flagged with an `Est` badge.
   - Pre-loaded Indian Vegetarian Templates:
     - Oats, Milk, Banana & Peanuts (640 kcal, 25.2g P)
     - Rice, Dal, Vegetables & Curd (685 kcal, 26.5g P)
     - Roasted Chana & Banana (280 kcal, 12.2g P)
     - Nutrela Soy Chunks Curry with Roti (435 kcal, 31g P)
     - Milk & Peanut Snack (350 kcal, 14.7g P)
     - Besan Chilla with Paneer (380 kcal, 21.5g P)
   - One-click *Copy Previous Day's Meals* button.

4. **Home Workout Planner & Exercise Library**:
   - Structured beginner alternation between **Workout A** (Squat, Incline Push-Up, Backpack Row, Glute Bridge, Forearm Plank) and **Workout B** (Reverse Lunge, Knee Push-Up, Backpack RDL, One-Arm Row, Dead Bug), plus **Workout A + Abs** on Fridays.
   - Interactive Rest Timer with audio alert chime (30s, 45s, 60s, 90s).
   - Progressive Overload History tracking for every exercise.
   - Technique modal with step-by-step cues, execution guide, and safe substitutions.

5. **Dedicated Abdominal Training Page**:
   - Focus on Reverse Crunch, Dead Bug, Forearm Plank, and Side Plank.
   - Science-based education clarifying that abdominal exercises build core stability and muscle thickness, but do not selectively burn belly fat (debunking spot reduction).

6. **Body Measurements & Lean Mass Progression**:
   - Morning weight, waist, chest, arms, and thighs tracking.
   - Energy rating (1-5), sleep duration, weekly notes, and photo references.
   - Promotes a healthy caloric surplus for lean weight gain from the 50 kg baseline.

7. **Multi-Sheet Excel Workbook (.xlsx) & CSV Export**:
   - Generates a full 8-sheet Excel workbook (`SheetJS`) containing:
     1. `DailyProgress`
     2. `FoodLog`
     3. `MealTemplates`
     4. `WorkoutPlan`
     5. `WorkoutLog`
     6. `ExerciseLibrary`
     7. `BodyMeasurements`
     8. `Settings`
   - Individual CSV backup exports for quick inspection.

8. **Dual-Mode Cloud & Local Storage**:
   - **Cloud Mode**: Serverless API (`netlify/functions/api.ts`) communicates with Google Sheets API using a Google Service Account.
   - **Local Storage Mode**: If cloud credentials are not yet set, the app runs offline via localStorage with a badge explaining how to connect Google Sheets.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS, React Router v7
- **Icons**: Lucide React
- **Charts**: Recharts
- **Spreadsheets / Export**: SheetJS (`xlsx`)
- **Serverless API**: Netlify Functions (`@netlify/functions`)
- **Cloud Database**: Google Sheets API v4 (`googleapis`)
- **Celebration Animations**: Canvas Confetti

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### 3. Production Build & TypeScript Verification
```bash
npm run build
```

---

## ☁️ Google Sheets Cloud Database Setup

To enable persistent cloud sync across your phone and laptop:

### Step 1: Create a Google Spreadsheet
1. Open [Google Sheets](https://sheets.new) and create a new blank workbook (e.g., `FitTrack 82 Database`).
2. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### Step 2: Create a Google Cloud Service Account
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `fittrack-82`).
3. Enable the **Google Sheets API**:
   - Go to **APIs & Services** &rarr; **Enable APIs & Services** &rarr; Search for **Google Sheets API** &rarr; Click **Enable**.
4. Create a Service Account:
   - Go to **IAM & Admin** &rarr; **Service Accounts** &rarr; Click **Create Service Account**.
   - Name it `fittrack-service-account`.
   - Click **Create and Continue** &rarr; Click **Done**.
5. Generate a Private Key:
   - Click on the newly created Service Account &rarr; Go to the **Keys** tab.
   - Click **Add Key** &rarr; **Create new key** &rarr; Choose **JSON** &rarr; Click **Create**.
   - A `.json` file containing `client_email` and `private_key` will download to your computer.

### Step 3: Share the Spreadsheet with the Service Account
1. Open your Google Sheet from Step 1.
2. Click the green **Share** button in the top right.
3. Paste your Service Account's email address (e.g. `fittrack-service-account@project.iam.gserviceaccount.com`).
4. Select **Editor** permission and click **Share**.

---

## 🌐 Netlify Deployment Instructions

### 1. Connect Git Repository to Netlify
1. Push this repository to GitHub or GitLab.
2. In Netlify, click **Add new site** &rarr; **Import an existing project**.
3. Select your repository.
4. Netlify will automatically detect configuration from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### 2. Configure Environment Variables in Netlify
In Netlify, navigate to **Site configuration** &rarr; **Environment variables** &rarr; **Add a variable**:

| Variable Name | Description | Example Value |
|---|---|---|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | The service account email from your GCP JSON key | `fittrack-sa@project.iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | The private key from your GCP JSON key (including headers) | `"-----BEGIN PRIVATE KEY-----\nMIIEv...-----END PRIVATE KEY-----\n"` |
| `GOOGLE_SHEET_ID` | The 44-character ID from your Google Sheet URL | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |

> **Security Note**: Never prefix server secrets with `VITE_`. Netlify functions run server-side and keep your service account credentials completely private from frontend browser network inspection.

### 3. Deploy
Click **Deploy site**. Your site will build and be live at `https://your-site-name.netlify.app`.

---

## 📊 Database Tabs & Data Structure

When cloud sync initializes, the workbook manages these 8 tabs:

1. **DailyProgress**: `id`, `date`, `dayNumber`, `weightKg`, `waterLiters`, `caloriesConsumed`, `proteinGrams`, `foodLoggingCompleted`, `proteinTargetReached`, `workoutCompleted`, `restDay`, `absCompleted`, `sleepHours`, `energyRating`, `notes`, `completionPercentage`, `updatedAt`
2. **FoodLog**: `id`, `date`, `mealType`, `foodName`, `quantity`, `unit`, `calories`, `protein`, `carbs`, `fats`, `isEstimate`, `notes`, `createdAt`
3. **MealTemplates**: `id`, `name`, `mealType`, `totalCalories`, `totalProtein`, `totalCarbs`, `totalFats`, `isVegetarian`, `description`, `itemsJson`
4. **WorkoutPlan**: `id`, `date`, `dayNumber`, `dayOfWeek`, `workoutType`, `title`, `isRestDay`, `description`, `targetExercisesJson`
5. **WorkoutLog**: `id`, `date`, `exerciseId`, `exerciseName`, `setNumber`, `targetRepsOrDuration`, `actualRepsOrDuration`, `weightKg`, `completed`, `rpe`, `formNotes`, `timestamp`
6. **ExerciseLibrary**: `id`, `name`, `category`, `targetMuscles`, `equipment`, `instructionsJson`, `formCuesJson`, `substitutions`, `defaultSets`, `defaultRepsOrDuration`, `defaultRestSec`, `isAbs`
7. **BodyMeasurements**: `id`, `date`, `weightKg`, `waistCm`, `chestCm`, `armCm`, `thighCm`, `energyLevel`, `sleepDuration`, `performanceNotes`, `photoReference`, `createdAt`
8. **Settings**: `id`, `key`, `value`, `updatedAt`

---

## 🧪 Quality Assurance & Tested Workflows

- ✅ **TypeScript & Build**: Strict mode compilation with zero errors.
- ✅ **Code Splitting**: Manual chunking (`vendor-react`, `vendor-xlsx`, `vendor-charts`).
- ✅ **Date Handling**: Indian Standard Time (IST) safe date parsing; accurate 82-day calendar math.
- ✅ **Data Persistence**: Instant local cache with automatic cloud Netlify Function routing.
- ✅ **Excel Export**: SheetJS workbook verified with formatted multi-sheet layout and column widths.
- ✅ **Mobile Responsive UI**: Bottom navigation bar, collapsible mobile drawers, responsive charts, and touch-friendly controls.
