export const CHALLENGE_START_DATE = '2026-10-11';
export const CHALLENGE_END_DATE = '2026-12-31';
export const TOTAL_CHALLENGE_DAYS = 82;

/**
 * Format a Date object to YYYY-MM-DD in Indian Standard Time (IST, UTC+5:30)
 */
export function formatDateToISO(date: Date): string {
  // IST offset is +330 minutes
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 3600000 * 5.5);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current date string in IST
 */
export function getCurrentISTDate(): string {
  return formatDateToISO(new Date());
}

/**
 * Parse YYYY-MM-DD into a localized Date safely without timezone drift
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Calculate challenge day number (1 to 82).
 * Oct 11, 2026 is Day 1.
 */
export function getChallengeDayNumber(dateStr: string): number {
  const start = parseISODate(CHALLENGE_START_DATE);
  const target = parseISODate(dateStr);
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 1-indexed
}

/**
 * Get ISO date for a given day number (1 to 82)
 */
export function getDateFromDayNumber(dayNumber: number): string {
  const start = parseISODate(CHALLENGE_START_DATE);
  const target = new Date(start.getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000);
  return formatDateToISO(target);
}

/**
 * Format date for friendly UI display
 * e.g., "Sunday, Oct 11, 2026"
 */
export function formatDisplayDate(dateStr: string): string {
  try {
    const date = parseISODate(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Get Day of Week
 */
export function getDayOfWeekName(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = parseISODate(dateStr);
  return days[date.getDay()];
}

/**
 * Check if a date falls strictly within the 82-day challenge
 */
export function isWithinChallenge(dateStr: string): boolean {
  const day = getChallengeDayNumber(dateStr);
  return day >= 1 && day <= TOTAL_CHALLENGE_DAYS;
}

/**
 * Check if a date is strictly in the future compared to current IST date
 */
export function isFutureDate(dateStr: string): boolean {
  const today = getCurrentISTDate();
  return dateStr > today;
}

/**
 * Return all 82 challenge dates array
 */
export function getAllChallengeDates(): string[] {
  const dates: string[] = [];
  for (let i = 1; i <= TOTAL_CHALLENGE_DAYS; i++) {
    dates.push(getDateFromDayNumber(i));
  }
  return dates;
}

/**
 * Add or subtract days from an ISO date string
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseISODate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
}
