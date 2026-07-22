import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  
  const { searchParams } = new URL(req.url);
  const estado = searchParams.get("estado");
  const search = searchParams.get("search");
  
  const query = db.select().from(casos).orderBy(desc(casos.fechaCreacion));
  
  // We'll filter in application layer for simplicity
  const results = await query;
  
  let filtered = results;
  if (estado && estado !== "todos") {
    filtered = filtered.filter(c => c.estado === estado);
  }
  if (search) {
    filtered = filtered.filter(c => c.pin?.toLowerCase().includes(search.toLowerCase()));
  }
  
  return NextResponse.json({ casos: filtered });
}
