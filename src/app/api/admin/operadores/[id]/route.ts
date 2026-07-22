import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { operadores } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const session = await getSession();
  if (!session || session.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  
  const { id } = await params;
  const idNum = Number(id);
  const body = await req.json();
  
  const updates: Record<string, unknown> = {};
  if (body.nombre) updates.nombre = body.nombre;
  if (body.rol) updates.rol = body.rol;
  if (body.activo !== undefined) updates.activo = body.activo;
  
  await db.update(operadores).set(updates).where(eq(operadores.id, idNum));
  
  return NextResponse.json({ ok: true });
}
