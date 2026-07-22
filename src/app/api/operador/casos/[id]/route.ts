import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, evidencias, acciones, expedientes, operadores } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  
  const evidenciasList = await db.select().from(evidencias).where(eq(evidencias.casoId, idNum));
  const accionesList = await db.select().from(acciones).where(eq(acciones.casoId, idNum)).orderBy(acciones.fecha);
  const [expediente] = await db.select().from(expedientes).where(eq(expedientes.casoId, idNum));
  
  let operadorNombre = null;
  if (caso.operadorId) {
    const [op] = await db.select({ nombre: operadores.nombre }).from(operadores).where(eq(operadores.id, caso.operadorId));
    operadorNombre = op?.nombre;
  }
  
  return NextResponse.json({
    caso: { ...caso, operadorNombre },
    evidencias: evidenciasList,
    acciones: accionesList,
    expediente: expediente,
  });
}
