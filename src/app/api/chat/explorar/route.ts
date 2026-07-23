import { NextRequest, NextResponse } from "next/server";
import { generarMensajeIA } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mensaje, historial } = body;

    if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
      return NextResponse.json({ error: "mensaje es requerido" }, { status: 400 });
    }

    const historialCompleto = [
      ...(Array.isArray(historial) ? historial : []),
      { rol: "usuario" as const, contenido: mensaje.trim() },
    ];

    const respuesta = await generarMensajeIA("orientacion", historialCompleto);

    return NextResponse.json({ respuesta });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[explorar] Error al llamar a Gemini:", msg);
    return NextResponse.json(
      { respuesta: null, error: msg },
      { status: 500 }
    );
  }
}
