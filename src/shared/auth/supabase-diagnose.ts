export async function diagnoseSupabase(baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  if (!baseUrl) return { ok: false, reason: 'missing-url' } as const;
  const endpoints = [
    '/auth/v1/health',
    '/auth/v1/settings'
  ];
  const results: Record<string, { ok: boolean; status?: number; error?: string }> = {};
  for (const ep of endpoints) {
    try {
      const res = await fetch(baseUrl + ep, { method: 'GET' });
      results[ep] = { ok: res.ok, status: res.status };
    } catch (e) {
      results[ep] = { ok: false, error: (e as Error).message };
    }
  }
  return { ok: Object.values(results).some(r => r.ok), results };
}
