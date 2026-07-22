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
  const { mensaje } = await req.json();
  
  await notificarCaso(idNum, "Notificación de tu caso", `
    <h2>Notificación</h2>
    <p>Hola ${caso.nombreVictima || "usuario"},</p>
    <p>${mensaje?.replace(/\n/g, "<br>") || "Tienes una nueva notificación sobre tu caso."}</p>
    <p>PIN: <strong>${caso.pin}</strong></p>
  `);
  
  await db.insert(acciones).values({
    casoId: idNum,
    tipoAccion: "notificado",
    actor: "operador",
    operadorId: session.id,
    descripcion: mensaje ? `Notificación enviada: "${mensaje.slice(0, 100)}"` : `Notificación enviada a la víctima por ${session.nombre}`,
  });
  
  return NextResponse.json({ ok: true, notificado: !!caso.email });
}
