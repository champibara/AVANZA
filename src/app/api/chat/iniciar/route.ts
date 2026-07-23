import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, acciones } from "@/db/schema";
import { generatePin } from "@/lib/pin";
import { generarMensajeIA } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const db = await getDb();
  let historialPrevio: { rol: "usuario" | "asistente"; contenido: string }[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body.historial)) {
      historialPrevio = body.historial;
    }
  } catch {
    // sin historial previo, se usa array vacío
  }

  const pin = generatePin();
  const [caso] = await db.insert(casos).values({
    pin,
    estado: "orientacion",
  }).returning();

  await db.insert(acciones).values({
    casoId: caso.id,
    tipoAccion: "chat_iniciado",
    actor: "victima",
    descripcion: "La víctima inició la conversación.",
  });

  let mensajeBienvenida =
    "Hola, gracias por comunicarte. Estoy aquí para escucharte y brindarte información sobre violencia digital.";

  try {
    mensajeBienvenida = await generarMensajeIA("orientacion", historialPrevio);
  } catch {
    // fallback a mensaje hardcodeado
  }

  return NextResponse.json({ casoId: caso.id, pin, mensaje: mensajeBienvenida });
}
