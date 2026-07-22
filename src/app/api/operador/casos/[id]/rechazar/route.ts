import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, acciones } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { notificarCaso } from "@/lib/notify";

export async function POST(
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
  const { motivo } = await req.json();
  
  await db.update(casos).set({
    estado: "rechazado",
    operadorId: session.id,
    fechaActualizacion: new Date(),
  }).where(eq(casos.id, idNum));
  
  await db.insert(acciones).values({
    casoId: idNum,
    tipoAccion: "rechazado",
    actor: "operador",
    operadorId: session.id,
    descripcion: `Caso rechazado por ${session.nombre}. Motivo: ${motivo || "No especificado"}`,
  });
  
  await notificarCaso(idNum, "Actualización sobre tu caso", `
    <h2>Actualización de tu caso</h2>
    <p>Hola ${caso.nombreVictima || "usuario"},</p>
    <p>Tu caso (PIN: <strong>${caso.pin}</strong>) ha sido revisado.</p>
    <p><strong>Motivo:</strong> ${motivo || "No se han proporcionado más detalles."}</p>
    <p>Si tienes dudas, puedes comunicarte con la línea de atención del MIMP.</p>
  `);
  
  return NextResponse.json({ estado: "rechazado" });
}
