// Direct REST API helper — avoids @supabase/supabase-js whatwg-fetch polyfill issues in RN

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

function headers(accessToken?: string) {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${accessToken ?? SUPABASE_ANON_KEY}`,
  };
}

export async function dbSelect<T>(
  table: string,
  query: string,
  accessToken?: string,
): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}&select=*`, {
      headers: { ...headers(accessToken), Accept: 'application/vnd.pgrst.object+json' },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function dbUpsert(
  table: string,
  record: Record<string, unknown>,
  accessToken?: string,
): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers(accessToken), Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(record),
    });
  } catch {}
}
