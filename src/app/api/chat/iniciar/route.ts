import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, acciones } from "@/db/schema";
import { generatePin } from "@/lib/pin";
import { generarMensajeIA } from "@/lib/ai";

export async function POST() {
  const db = await getDb();
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
    mensajeBienvenida = await generarMensajeIA("orientacion", []);
  } catch {
    // fallback a mensaje hardcodeado
  }

  return NextResponse.json({ casoId: caso.id, pin, mensaje: mensajeBienvenida });
}
