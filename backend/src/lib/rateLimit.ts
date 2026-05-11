// src/lib/rateLimit.ts
const requests = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (ip: string, max = 10, windowMs = 60000) => {
  const agora = Date.now();
  const entry = requests.get(ip);

  if (!entry || agora > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: agora + windowMs });
    return false; // não bloqueado
  }

  if (entry.count >= max) return true; // bloqueado

  entry.count++;
  return false;
};
