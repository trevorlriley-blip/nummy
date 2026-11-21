import Anthropic from '@anthropic-ai/sdk';
import type { StoreSection } from '../../src/types/recipe';
import { verifySupabaseUser } from '../../src/utils/verifySupabaseUser';

const STORE_SECTIONS: StoreSection[] = [
  'produce', 'dairy', 'meat', 'seafood', 'bakery', 'pantry', 'frozen',
  'spices', 'condiments', 'beverages', 'snacks', 'deli', 'other',
];
const FRESHNESS = ['fresh', 'use-soon', 'past'] as const;
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_IMAGES = 4;

const PANTRY_PROMPT = `You are a kitchen inventory assistant. The user has photographed the inside of their fridge, freezer, or pantry. Identify the food and drink items you can actually see.

Return ONLY a JSON object — no markdown, no explanation, no code fences — with this exact shape:
{
  "items": [
    { "name": "spinach", "category": "produce", "quantityEstimate": "1 bag", "freshness": "use-soon", "confidence": 0.9 }
  ],
  "useFirst": ["spinach"]
}

Rules:
- name: short, normalized ingredient name — singular, lowercase, no brand names, no packaging words (e.g. "tomato" not "Roma Tomatoes", "milk" not "Horizon Organic Whole Milk")
- category: one of: ${STORE_SECTIONS.join(', ')}
- quantityEstimate: a short human estimate such as "3", "half a bag", "1 carton", "about 2 cups"
- freshness: "fresh", "use-soon" (wilting, near a date, ripe/soft, opened and perishable), or "past" (visibly spoiled or moldy)
- confidence: 0 to 1 — how sure you are of the item's identity
- useFirst: names (matching the items list) of the items that should be eaten first, most urgent first, at most 8
- Merge duplicates across photos into one item. Skip anything you cannot identify; do not guess.
- If no food is visible, return { "items": [], "useFirst": [] }`;

interface PantryImage {
  imageBase64: string;
  mimeType: string;
}

function clamp01(n: unknown): number {
  const v = typeof n === 'number' ? n : parseFloat(String(n));
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5;
}

function normalizeName(raw: unknown): string {
  return String(raw ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('no json');
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const auth = await verifySupabaseUser(request);
    if ('response' in auth) return auth.response;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API not configured' }, { status: 500 });
    }

    const body = (await request.json()) as { images?: PantryImage[] };
    const images = body.images;
    if (!Array.isArray(images) || images.length < 1 || images.length > MAX_IMAGES) {
      return Response.json({ error: `Send 1 to ${MAX_IMAGES} images` }, { status: 400 });
    }
    for (const img of images) {
      if (!img?.imageBase64 || !MIME_TYPES.includes(img.mimeType)) {
        return Response.json({ error: 'Invalid image' }, { status: 400 });
      }
    }

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            ...images.map((img) => ({
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: img.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: img.imageBase64,
              },
            })),
            { type: 'text' as const, text: PANTRY_PROMPT },
          ],
        },
      ],
    });

    const rawText = response.content[0]?.type === 'text' ? response.content[0].text : '';
    let parsed: any;
    try {
      parsed = extractJson(rawText);
    } catch {
      return Response.json({ error: 'Could not read items from photos' }, { status: 422 });
    }

    const seen = new Set<string>();
    const items = (Array.isArray(parsed?.items) ? parsed.items : [])
      .map((it: any) => ({
        name: normalizeName(it?.name),
        category: STORE_SECTIONS.includes(it?.category) ? it.category : 'other',
        quantityEstimate: String(it?.quantityEstimate ?? '').trim(),
        freshness: (FRESHNESS as readonly string[]).includes(it?.freshness) ? it.freshness : 'fresh',
        confidence: clamp01(it?.confidence),
      }))
      .filter((it: { name: string }) => {
        if (!it.name || seen.has(it.name)) return false;
        seen.add(it.name);
        return true;
      });

    const useFirst: string[] = (Array.isArray(parsed?.useFirst) ? parsed.useFirst : [])
      .map(normalizeName)
      .filter((n: string) => seen.has(n));

    return Response.json({ items, useFirst });
  } catch (error) {
    console.error('Scan pantry error:', error);
    return Response.json({ error: 'Failed to scan pantry' }, { status: 500 });
  }
}
