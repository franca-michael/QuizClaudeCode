// Rate limit simples em memória (por instância). Suficiente para o MVP.
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000,
  now = Date.now(),
) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits)
      if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}
