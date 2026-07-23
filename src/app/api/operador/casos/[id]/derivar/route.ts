import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, acciones, expedientes } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { notificarCaso } from "@/lib/notify";

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
    const { entidadDestino } = await req.json();
    
    const [caso] = await db.select().from(casos).where(eq(casos.id, idNum));
    if (!caso) {
      return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
    }
    
    if (caso.estado !== "clasificado") {
      return NextResponse.json({ error: `No se puede derivar un caso en estado "${caso.estado}"` }, { status: 400 });
    }
    
    const entidadLabel = entidadDestino === "fiscalia" ? "Fiscalía Especializada" : "CEM / Asesoría Legal";
    
    await db.update(casos).set({
      estado: "derivado",
      entidadAsignada: entidadDestino,
      fechaActualizacion: new Date(),
    }).where(eq(casos.id, idNum));
    
    await db.insert(expedientes).values({
      casoId: idNum,
      entidadDestino,
      datosExpediente: JSON.stringify({
        pin: caso.pin,
        tipoDelito: caso.tipoDelito,
        accionTipo: caso.accionTipo,
        fechaClasificacion: Date.now(),
        operadorAsignado: session.nombre,
      }),
      enviadoOk: 1,
      fechaEnvio: new Date(),
    });
    
    await db.insert(acciones).values({
      casoId: idNum,
      tipoAccion: "derivado",
      actor: "operador",
      operadorId: session.id,
      descripcion: `Caso derivado a ${entidadDestino} por ${session.nombre}`,
      metadatos: JSON.stringify({ entidadDestino }),
    });
    
    await notificarCaso(idNum, "Tu caso ha sido derivado", `
      <h2>Derivación de tu caso</h2>
      <p>Hola ${caso.nombreVictima || "usuario"},</p>
      <p>Tu caso (PIN: <strong>${caso.pin}</strong>) ha sido <strong>derivado</strong> a <strong>${entidadLabel}</strong>.</p>
      <p>La entidad se pondrá en contacto contigo para continuar con el proceso.</p>
      <p>Puedes consultar el estado en: <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/consulta">Consulta de caso</a></p>
    `);
    
    return NextResponse.json({ estado: "derivado", entidadAsignada: entidadDestino });
  } catch (error) {
    console.error("[derivar] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
