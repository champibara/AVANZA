import { NextResponse } from "next/server";
import { getDb } from "@/db";

export async function GET() {
  const start = Date.now();
  const checks: Record<string, string> = {};

  try {
    const db = await getDb();
    await db.execute("SELECT 1");
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  checks.app = "ok";

  const allOk = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
      checks,
      responseTimeMs: Date.now() - start,
    },
    { status: allOk ? 200 : 503 }
  );
}
