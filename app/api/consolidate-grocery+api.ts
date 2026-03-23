import Anthropic from '@anthropic-ai/sdk';

interface InputItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

interface MergeGroup {
  ids: string[];
  name: string;
  quantity: number;
  unit: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as { items: InputItem[] };
  const { items } = body;

  if (!items || items.length === 0) {
    return Response.json({ groups: [] });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const itemList = items
    .map((item) => `${item.id}: "${item.name}" — ${item.quantity}${item.unit ? ` ${item.unit}` : ''}`)
    .join('\n');

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Consolidate this grocery list by merging items that refer to the same ingredient (even if worded differently).

Examples of items to merge:
- "medium onion" + "white onion" → "onions" with combined count
- "olive oil" + "extra-virgin olive oil" → "olive oil" with combined quantity
- "boneless chicken breast" + "chicken breast" → "chicken breasts"
- "garlic" (unit: cloves) + "garlic clove" (no unit) + "garlic cloves" (no unit) → name: "garlic cloves", quantity: sum of all, unit: ""
- "green onion" + "scallion" → "green onions" with combined count

Key rules:
- When the unit is embedded in the item name (e.g. "garlic clove", "bay leaf"), merge with items of the same base ingredient regardless of how the unit appears.
- Singular/plural variations of the same word are the same ingredient ("clove" = "cloves", "onion" = "onions").
- For same units: add quantities directly.
- For convertible units (tbsp/cup, tsp/tbsp): convert to larger unit (e.g. 1 cup + 4 tbsp = 1.25 cups).
- For incompatible units: keep as-is and pick the entry with more quantity.
- Do NOT merge clearly different ingredients.

Return ONLY a valid JSON array. Every input item ID must appear in exactly one element.
Each element: { "ids": ["id1", "id2"], "name": "final name", "quantity": number, "unit": "unit or empty string" }

Items:
${itemList}`,
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return Response.json({ error: 'Parse failed' }, { status: 500 });
  }

  const groups: MergeGroup[] = JSON.parse(jsonMatch[0]);
  return Response.json({ groups });
}
