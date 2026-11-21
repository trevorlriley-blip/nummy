/**
 * Server-side helper: verifies the Supabase access token on an incoming
 * request (same check used by delete-account). Returns the user id, or a
 * ready-to-return 401 Response.
 */
export async function verifySupabaseUser(
  request: Request
): Promise<{ userId: string } | { response: Response }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { response: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const token = authHeader.slice(7);

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    return { response: Response.json({ error: 'Auth not configured' }, { status: 500 }) };
  }

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
      return { response: Response.json({ error: 'Invalid or expired session' }, { status: 401 }) };
    }
    const user = await userRes.json();
    return { userId: user.id as string };
  } catch {
    return { response: Response.json({ error: 'Could not verify session' }, { status: 502 }) };
  }
}
