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
    
    if (caso.estado !== "validado") {
      return NextResponse.json({ error: `No se puede clasificar un caso en estado "${caso.estado}"` }, { status: 400 });
    }
    
    const { tipoDelito, accionTipo } = await req.json();
    
    await db.update(casos).set({
      estado: "clasificado",
      tipoDelito,
      accionTipo,
      fechaActualizacion: new Date(),
    }).where(eq(casos.id, idNum));
    
    await db.insert(acciones).values({
      casoId: idNum,
      tipoAccion: "clasificado",
      actor: "operador",
      operadorId: session.id,
      descripcion: `Caso clasificado por ${session.nombre}: ${tipoDelito} (acción ${accionTipo})`,
      metadatos: JSON.stringify({ tipoDelito, accionTipo }),
    });
    
    const tipoAccionLabel = accionTipo === "publica" ? "pública (Fiscalía)" : "privada (CEM)";
    await notificarCaso(idNum, "Tu caso ha sido clasificado", `
      <h2>Clasificación de tu caso</h2>
      <p>Hola ${caso.nombreVictima || "usuario"},</p>
      <p>Tu caso (PIN: <strong>${caso.pin}</strong>) ha sido <strong>clasificado</strong> como:</p>
      <ul>
        <li><strong>Tipo:</strong> ${tipoDelito}</li>
        <li><strong>Acción:</strong> ${tipoAccionLabel}</li>
      </ul>
      <p>Será derivado a la entidad correspondiente para su atención.</p>
    `);
    
    return NextResponse.json({ estado: "clasificado" });
  } catch (error) {
    console.error("[clasificar] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
