import { format, addDays, startOfWeek, endOfWeek, isToday, isBefore, parseISO } from 'date-fns';

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDayShort(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE');
}

export function formatDayFull(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMM d');
}

export function formatWeekRange(startDate: string): string {
  const monday = startOfWeek(parseISO(startDate), { weekStartsOn: 1 });
  const sunday = addDays(monday, 6);
  return `${format(monday, 'MMM d')} - ${format(sunday, 'MMM d')}`;
}

export function getWeekDates(startDate: string): string[] {
  const start = parseISO(startDate);
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), 'yyyy-MM-dd')
  );
}

export function getWeekStartDate(date: Date = new Date()): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function isDatePast(dateStr: string): boolean {
  return isBefore(parseISO(dateStr), new Date()) && !isToday(parseISO(dateStr));
}

export function getDayOfWeek(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE');
}

export function formatServings(count: number): string {
  return count === 1 ? '1 serving' : `${count} servings`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
