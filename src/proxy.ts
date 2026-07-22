import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const ipRateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

const metrics = {
  total: 0,
  byPath: new Map<string, number>(),
  byStatus: new Map<number, number>(),
  startTime: Date.now(),
};

export function getMetrics() {
  return {
    total: metrics.total,
    byPath: Object.fromEntries(metrics.byPath),
    byStatus: Object.fromEntries(metrics.byStatus),
    uptime: Date.now() - metrics.startTime,
  };
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";
}

export default function proxy(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    metrics.total++;
    const path = request.nextUrl.pathname;
    metrics.byPath.set(path, (metrics.byPath.get(path) || 0) + 1);

    const origin = request.headers.get("origin") || "";
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      "http://localhost:3000",
    ].filter(Boolean);

    const isValidOrigin = !origin || allowedOrigins.includes(origin);

    if (!isValidOrigin && request.method !== "GET" && request.method !== "OPTIONS") {
      metrics.byStatus.set(403, (metrics.byStatus.get(403) || 0) + 1);
      logger.warn("origen_rechazado", { origin, path });
      return NextResponse.json(
        { error: "Origen no permitido" },
        { status: 403 }
      );
    }

    if (isValidOrigin && origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    if (request.method === "OPTIONS") {
      metrics.byStatus.set(204, (metrics.byStatus.get(204) || 0) + 1);
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    const ip = getClientIp(request);
    const now = Date.now();
    const record = ipRateMap.get(ip);

    if (record && now < record.resetAt) {
      record.count++;
      if (record.count > RATE_LIMIT) {
        metrics.byStatus.set(429, (metrics.byStatus.get(429) || 0) + 1);
        logger.warn("rate_limit_excedido", { ip, path });
        return NextResponse.json(
          { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
          { status: 429, headers: { "Retry-After": "60", "Content-Type": "application/json" } }
        );
      }
    } else {
      ipRateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    }

    logger.info("api_request", { method: request.method, path });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
