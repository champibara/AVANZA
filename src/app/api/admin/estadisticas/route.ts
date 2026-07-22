import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, operadores } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { sql } from "drizzle-orm";

export async function GET() {
  const db = await getDb();
  const session = await getSession();
  if (!session || session.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  
  const totalCasos = await db.select({ count: sql<number>`count(*)` }).from(casos);
  const casosPorEstado = await db.select({
    estado: casos.estado,
    count: sql<number>`count(*)`,
  }).from(casos).groupBy(casos.estado);
  
  const totalOperadores = await db.select({ count: sql<number>`count(*)` }).from(operadores);
  
  return NextResponse.json({
    totalCasos: totalCasos[0]?.count || 0,
    casosPorEstado,
    totalOperadores: totalOperadores[0]?.count || 0,
  });
}
