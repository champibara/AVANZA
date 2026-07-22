const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || now > record.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export function rateLimitMiddleware(key: string, maxAttempts: number = 5, windowMs: number = 60000) {
  if (!rateLimit(key, maxAttempts, windowMs)) {
    return new Response(
      JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(windowMs / 1000),
        },
      }
    );
  }
  return null;
}
