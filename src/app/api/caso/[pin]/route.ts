import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, evidencias, acciones as accionesTable, expedientes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pin: string }> }
) {
  const db = await getDb();
  const { pin } = await params;
  const [caso] = await db.select().from(casos).where(eq(casos.pin, pin));
  if (!caso) {
    return NextResponse.json({ error: "PIN no válido" }, { status: 404 });
  }

  const evidenciasList = await db.select().from(evidencias).where(eq(evidencias.casoId, caso.id));
  const accionesList = await db.select().from(accionesTable).where(eq(accionesTable.casoId, caso.id)).orderBy(accionesTable.fecha);
  const [expediente] = await db.select().from(expedientes).where(eq(expedientes.casoId, caso.id));

  return NextResponse.json({
    caso: {
      pin: caso.pin,
      estado: caso.estado,
      fechaCreacion: caso.fechaCreacion,
      fechaActualizacion: caso.fechaActualizacion,
      tipoDelito: caso.tipoDelito,
      entidadAsignada: caso.entidadAsignada,
    },
    evidencias: evidenciasList.map(e => ({
      tipo: e.tipo,
      hash: e.hashSha256,
      timestampEvidencia: e.timestampEvidencia,
      descripcion: e.descripcion,
    })),
    acciones: accionesList,
    expediente: expediente ? {
      entidad: expediente.entidadDestino,
      fechaEnvio: expediente.fechaEnvio,
    } : null,
  });
}
