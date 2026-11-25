import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { GroceryList } from '../types/groceryList';
import { CompletedOrder } from '../types/ordering';
import { PantryItem } from '../types/pantry';
import { StoreSection } from '../types/recipe';
import { DinnerVerdict, TossedItem, WeekendRecap } from '../types/recap';
import { namesMatch, normalizeName } from './pantryMatch';

/** A completed order older than this is ignored in favour of the grocery list. */
const ORDER_MAX_AGE_MS = 10 * 24 * 60 * 60 * 1000;

export const VERDICT_RATING: Record<DinnerVerdict, 1 | 3 | 5> = { loved: 5, ok: 3, 'not-again': 1 };

export function verdictFromRating(rating?: number): DinnerVerdict | undefined {
  if (!rating) return undefined;
  if (rating >= 4) return 'loved';
  if (rating === 3) return 'ok';
  return 'not-again';
}

/** Monday of the week containing `date`, YYYY-MM-DD. */
export function weekKeyOf(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay();
  return d === 0 || d === 6;
}

/** True when `date` falls inside the plan week that starts on `weekStartDate`. */
export function weekContains(weekStartDate: string, date: Date): boolean {
  const start = parseISO(weekStartDate);
  const key = format(date, 'yyyy-MM-dd');
  return key >= format(start, 'yyyy-MM-dd') && key <= format(addDays(start, 6), 'yyyy-MM-dd');
}

export interface CleanOutCandidate {
  key: string;
  name: string;
  /** Display text such as "2 lb". */
  label: string;
  quantity: number;
  cost: number;
  source: 'order' | 'list' | 'pantry';
}

export interface CleanOutSource {
  candidates: CleanOutCandidate[];
  from: 'order' | 'list' | 'none';
}

function qtyLabel(quantity: number, unit: string): string {
  const q = Number.isInteger(quantity) ? String(quantity) : String(Math.round(quantity * 10) / 10);
  return `${q}${unit ? ` ${unit}` : ''}`.trim();
}

/**
 * This week's food: the checked items of the latest completed order if it is recent,
 * otherwise the grocery list (skipping items we already had), plus pantry "use soon" items.
 */
export function buildCleanOut(
  lastOrder: CompletedOrder | null,
  groceryList: GroceryList | null,
  useSoon: PantryItem[],
  now: Date = new Date()
): CleanOutSource {
  const out: CleanOutCandidate[] = [];
  let from: CleanOutSource['from'] = 'none';
  const add = (c: CleanOutCandidate) => {
    if (!out.some((o) => namesMatch(o.name, c.name))) out.push(c);
  };

  const orderFresh =
    lastOrder && lastOrder.items.length > 0 && now.getTime() - Date.parse(lastOrder.completedAt) <= ORDER_MAX_AGE_MS;

  if (orderFresh && lastOrder) {
    from = 'order';
    for (const i of lastOrder.items) {
      add({ key: `o-${i.id}`, name: i.name, label: qtyLabel(i.quantity, i.unit), quantity: i.quantity, cost: i.estimatedCost, source: 'order' });
    }
  } else if (groceryList) {
    from = 'list';
    for (const section of groceryList.sections) {
      for (const i of section.items) {
        if (i.haveIt) continue;
        add({ key: `l-${i.id}`, name: i.name, label: qtyLabel(i.quantity, i.unit), quantity: i.quantity, cost: i.estimatedCost, source: 'list' });
      }
    }
  }

  for (const p of useSoon) {
    add({ key: `p-${p.id}`, name: p.name, label: p.quantityEstimate, quantity: 0, cost: 0, source: 'pantry' });
  }
  return { candidates: out, from };
}

/** Dollars for a tossed item: the full price, or a share of it if the typed amount is a number smaller than what was bought. */
export function tossedCost(c: { cost: number; quantity: number }, typed: string): number {
  const n = parseFloat(typed);
  if (!isFinite(n) || n <= 0 || c.quantity <= 0) return c.cost;
  return Math.round(c.cost * Math.min(1, n / c.quantity) * 100) / 100;
}

export function sumCost(items: TossedItem[]): number {
  return Math.round(items.reduce((s, i) => s + i.cost, 0) * 100) / 100;
}

const PERISHABLE: StoreSection[] = ['produce', 'dairy', 'meat', 'seafood', 'deli', 'bakery'];

export interface UseItUpPick {
  name: string;
  from: 'pantry' | 'list';
}

/** One thing to use up next week: a pantry use-soon item not tossed, else a perishable from this week's food. */
export function pickUseItUp(
  useSoon: PantryItem[],
  candidates: CleanOutCandidate[],
  perishableNames: Set<string>,
  tossed: TossedItem[]
): UseItUpPick | null {
  const wasTossed = (n: string) => tossed.some((t) => namesMatch(t.name, n));
  const pantry = useSoon.find((p) => !wasTossed(p.name));
  if (pantry) return { name: pantry.name, from: 'pantry' };
  const perishable = candidates.find(
    (c) => c.source !== 'pantry' && perishableNames.has(normalizeName(c.name)) && !wasTossed(c.name)
  );
  return perishable ? { name: perishable.name, from: 'list' } : null;
}

export function perishableNameSet(list: GroceryList | null, order: CompletedOrder | null): Set<string> {
  const names = new Set<string>();
  for (const i of order?.items ?? []) if (PERISHABLE.includes(i.category)) names.add(normalizeName(i.name));
  for (const s of list?.sections ?? []) {
    if (!PERISHABLE.includes(s.category)) continue;
    for (const i of s.items) names.add(normalizeName(i.name));
  }
  return names;
}

export interface TossedComparison {
  /** Number to compare against: last week's recap, or the baseline on the first recap. */
  previous: number | null;
  previousLabel: 'last week' | 'your baseline' | null;
  direction: 'down' | 'up' | 'same' | null;
  delta: number;
}

export function compareTossed(current: number, history: WeekendRecap[], weekOf: string, baseline: number | null): TossedComparison {
  const earlier = history.filter((r) => r.weekOf < weekOf);
  const last = earlier[earlier.length - 1];
  const previous = last ? last.tossedCount : baseline;
  const previousLabel = last ? 'last week' : baseline !== null ? 'your baseline' : null;
  if (previous === null) return { previous: null, previousLabel: null, direction: null, delta: 0 };
  const direction = current < previous ? 'down' : current > previous ? 'up' : 'same';
  return { previous, previousLabel, direction, delta: Math.abs(current - previous) };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** One specific, positive line. Never blames; when the week got worse, offers one easy win. */
export function encouragement(args: {
  tossedCount: number;
  comparison: TossedComparison;
  mealsMade: number;
  mealsPlanned: number;
  useItUp: UseItUpPick | null;
}): string {
  const { tossedCount, comparison, mealsMade, mealsPlanned, useItUp } = args;
  const dinners = mealsPlanned > 0 ? `, and you cooked ${mealsMade} of ${plural(mealsPlanned, 'planned dinner')}` : '';
  if (tossedCount === 0) return `Nothing tossed this week${dinners}. A clean sweep!`;
  if (comparison.direction === 'down') {
    return `${plural(comparison.delta, 'fewer item')} tossed than ${comparison.previousLabel}${dinners}. That's real progress!`;
  }
  if (comparison.direction === 'same') {
    return `Right on par with ${comparison.previousLabel}${dinners}. Steady habits are how this gets easier.`;
  }
  if (comparison.direction === 'up') {
    const win = useItUp
      ? `use up the ${useItUp.name.toLowerCase()} first.`
      : 'cook your most perishable ingredients early in the week.';
    return `Busy week. Here's one easy win for next week: ${win}`;
  }
  return mealsPlanned > 0
    ? `You cooked ${mealsMade} of ${plural(mealsPlanned, 'planned dinner')}. Nice start, and next weekend you'll see how it compares!`
    : `First recap done. Next weekend you'll see how it compares!`;
}

export interface Bar {
  label: string;
  value: number;
  isBaseline?: boolean;
  isCurrent?: boolean;
}

/** Bars for the history chart: the baseline first (if any), then each recapped week. */
export function historyBars(history: WeekendRecap[], currentWeekOf: string): Bar[] {
  const bars: Bar[] = [];
  const baseline = history.find((r) => r.baseline !== null)?.baseline ?? null;
  if (baseline !== null) bars.push({ label: 'Baseline', value: baseline, isBaseline: true });
  for (const r of history) {
    bars.push({ label: format(parseISO(r.weekOf), 'M/d'), value: r.tossedCount, isCurrent: r.weekOf === currentWeekOf });
  }
  return bars;
}

export function formatDollars(n: number): string {
  return `$${n.toFixed(2)}`;
}
