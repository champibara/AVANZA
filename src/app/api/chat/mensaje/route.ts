import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { casos, acciones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { transition, mensajesIA } from "@/lib/chat-machine";
import { generarMensajeIA } from "@/lib/ai";
import type { ChatState } from "@/lib/chat-machine";
import { validarCampos, sanitizar, acortar } from "@/lib/validate";

const EVENTOS_VALIDOS = ["INICIAR", "MENSAJE", "CONTINUAR", "NO_CONTINUAR", "ACEPTAR_CONSENTIMIENTO", "RECHAZAR_CONSENTIMIENTO", "REGISTRAR", "EVIDENCIA_LISTA", "DENUNCIAR_AHORA", "DENUNCIAR_DESPUES"];

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { casoId: rawCasoId, eventType, mensajeUsuario } = body;

  const error = validarCampos([
    { valor: rawCasoId, nombre: "casoId", tipo: "number", required: true },
    { valor: eventType, nombre: "eventType", tipo: "string", required: true, maxLen: 30 },
  ]);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!EVENTOS_VALIDOS.includes(eventType)) {
    return NextResponse.json({ error: "Evento no válido" }, { status: 400 });
  }

  const casoId = Number(rawCasoId);

  const [caso] = await db.select().from(casos).where(eq(casos.id, casoId));
  if (!caso) {
    return NextResponse.json({ error: "Caso no encontrado" }, { status: 404 });
  }

  const currentState = caso.estado as ChatState;
  const nextState = transition(currentState, { type: eventType });

  if (!nextState) {
    return NextResponse.json({ error: "Transición no válida" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { estado: nextState };

  if (eventType === "REGISTRAR" && mensajeUsuario) {
    try {
      const data = JSON.parse(mensajeUsuario);
      if (data.nombre) updateData.nombreVictima = data.nombre;
      if (data.email) updateData.email = data.email;
      if (data.edad) updateData.edadAproximada = Number(data.edad);
      if (data.departamento) updateData.departamento = data.departamento;
    } catch {
      // fallback: parse legacy format
      const match = mensajeUsuario.match(/Nombre: (.+?)(?:, Edad:|$)/);
      if (match) updateData.nombreVictima = match[1].trim();
    }
  }

  await db.update(casos).set(updateData).where(eq(casos.id, casoId));

  await db.insert(acciones).values({
    casoId,
    tipoAccion: eventType.toLowerCase(),
    actor: "victima",
    descripcion: mensajeUsuario || `Transición: ${currentState} → ${nextState}`,
  });

  let mensajes: string[] = [];

  if (nextState === "cierre_amable") {
    mensajes = mensajesIA.cierre;
  } else {
    const historial: { rol: "usuario" | "asistente"; contenido: string }[] = [];

    if (mensajeUsuario) {
      historial.push({ rol: "usuario", contenido: mensajeUsuario });
    }

    const estadosConIA = ["orientacion", "consentimiento", "registro", "evidencia", "denuncia", "seguimiento"];

    if (estadosConIA.includes(nextState)) {
      try {
        const respuestaIA = await generarMensajeIA(nextState, historial);
        mensajes = [respuestaIA];
      } catch {
        mensajes = mensajesIA[nextState as keyof typeof mensajesIA] || [];
      }
    } else {
      mensajes = mensajesIA[nextState as keyof typeof mensajesIA] || [];
    }
  }

  return NextResponse.json({
    estado: nextState,
    mensajes,
    requiereAccion: [
      "decide_continuar",
      "decide_consentimiento",
      "decide_denuncia",
      "nuevas_acciones",
      "registro",
      "evidencia",
    ].includes(nextState),
  });
}
