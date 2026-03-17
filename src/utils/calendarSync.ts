import { WeeklyMealPlan, PlannedMeal } from '../types/mealPlan';
import { MealTimeDefaults, TimeOfDay, CalendarEventPayload } from '../types/calendar';
import { GOOGLE_CALENDAR_API_BASE, GOOGLE_CLIENT_ID } from '../config/google';
import { parseISO, addMinutes } from 'date-fns';

/** Combine a YYYY-MM-DD date with a TimeOfDay to produce a Date object. */
function buildStartDateTime(dateStr: string, time: TimeOfDay): Date {
  const date = parseISO(dateStr);
  date.setHours(time.hour, time.minute, 0, 0);
  return date;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  dessert: 'Dessert',
};

/** Build a Google Calendar event payload from a PlannedMeal. */
export function buildEventPayload(
  meal: PlannedMeal,
  mealTimeDefaults: MealTimeDefaults,
  timeZone: string
): CalendarEventPayload {
  const startTime = buildStartDateTime(meal.date, mealTimeDefaults[meal.mealType]);
  const duration = meal.recipe.totalTimeMinutes || 30;
  const endTime = addMinutes(startTime, duration);

  return {
    summary: `🍽 ${meal.recipe.title}`,
    description: [
      `${MEAL_LABELS[meal.mealType] ?? meal.mealType}`,
      `Servings: ${meal.servings}`,
      `Prep: ${meal.recipe.prepTimeMinutes} min | Cook: ${meal.recipe.cookTimeMinutes} min`,
      `Total: ${meal.recipe.totalTimeMinutes} min`,
      '',
      'Open in Nummy to see the full recipe.',
    ].join('\n'),
    start: { dateTime: startTime.toISOString(), timeZone },
    end: { dateTime: endTime.toISOString(), timeZone },
  };
}

/** Insert a single event into Google Calendar. Returns the created event ID. */
export async function insertCalendarEvent(
  payload: CalendarEventPayload,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<string> {
  const response = await fetch(
    `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `Calendar API error: ${response.status}`);
  }

  const data = await response.json();
  return data.id;
}

/** Sync an entire weekly meal plan to Google Calendar. Returns created event IDs. */
export async function syncWeeklyPlan(
  plan: WeeklyMealPlan,
  mealTimeDefaults: MealTimeDefaults,
  accessToken: string,
  calendarId: string = 'primary'
): Promise<string[]> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const eventIds: string[] = [];

  for (const day of plan.days) {
    for (const meal of day.meals) {
      const payload = buildEventPayload(meal, mealTimeDefaults, timeZone);
      const eventId = await insertCalendarEvent(payload, accessToken, calendarId);
      eventIds.push(eventId);
    }
  }

  return eventIds;
}

/** Refresh an expired access token using the refresh token. */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed. Please reconnect your Google account.');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
