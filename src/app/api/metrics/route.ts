import { NextResponse } from "next/server";
import { getMetrics } from "@/proxy";

export async function GET() {
  return NextResponse.json(getMetrics());
}
