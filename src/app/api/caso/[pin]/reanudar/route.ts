import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, acciones } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ pin: string }> }
) {
  const db = await getDb();
  const { pin } = await params;
  const [caso] = await db.select().from(casos).where(eq(casos.pin, pin));
  if (!caso) {
    return NextResponse.json({ error: "PIN no válido" }, { status: 404 });
  }
  if (caso.estado !== "caso_guardado") {
    return NextResponse.json({ error: "El caso no está en estado diferido" }, { status: 400 });
  }

  await db.update(casos).set({ estado: "pendiente_validacion", fechaActualizacion: new Date() }).where(eq(casos.id, caso.id));
  await db.insert(acciones).values({
    casoId: caso.id,
    tipoAccion: "caso_reanudado",
    actor: "victima",
    descripcion: "La víctima reanudó el caso para presentar denuncia.",
  });

  return NextResponse.json({ estado: "pendiente_validacion", casoId: caso.id });
}
