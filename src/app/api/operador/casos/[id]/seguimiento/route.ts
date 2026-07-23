import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, acciones } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }
    
    const { id } = await params;
    const idNum = Number(id);
    const [caso] = await db.select().from(casos).where(eq(casos.id, idNum));
    if (!caso) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }
    
    const { descripcion } = await req.json();
    if (!descripcion?.trim()) {
      return NextResponse.json({ error: "La descripción es requerida" }, { status: 400 });
    }
    
    await db.insert(acciones).values({
      casoId: idNum,
      tipoAccion: "seguimiento",
      actor: "operador",
      operadorId: session.id,
      descripcion: `[Seguimiento] ${descripcion.trim()}`,
    });
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[seguimiento] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
