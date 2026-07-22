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
  
  await db.update(casos).set({
    estado: "validado",
    operadorId: session.id,
    fechaActualizacion: new Date(),
  }).where(eq(casos.id, idNum));
  
  await db.insert(acciones).values({
    casoId: idNum,
    tipoAccion: "validado",
    actor: "operador",
    operadorId: session.id,
    descripcion: `Caso validado por ${session.nombre}`,
  });
  
  await notificarCaso(idNum, "Tu caso ha sido validado", `
    <h2>Validación de caso</h2>
    <p>Hola ${caso.nombreVictima || "usuario"},</p>
    <p>Tu caso (PIN: <strong>${caso.pin}</strong>) ha sido <strong>validado</strong> por nuestro equipo.</p>
    <p>Pronto será clasificado y derivado a la entidad correspondiente.</p>
    <p>Puedes consultar el estado en: <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/consulta">Consulta de caso</a></p>
  `);
  
  return NextResponse.json({ estado: "validado" });
}
