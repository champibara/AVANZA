import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { evidencias, acciones } from "@/db/schema";
import { createHash } from "crypto";
import { validarCampos, sanitizar } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { casoId: rawCasoId, url, descripcion } = body;

  const error = validarCampos([
    { valor: rawCasoId, nombre: "casoId", tipo: "number", required: true },
    { valor: url, nombre: "url", tipo: "string", required: true, maxLen: 2048 },
  ]);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "La URL proporcionada no es válida" }, { status: 400 });
  }

  const casoId = Number(rawCasoId);

  const hash = createHash("sha256").update(url).digest("hex");

  await db.insert(evidencias).values({
    casoId,
    tipo: "url",
    archivoUrl: url,
    descripcion: descripcion || "",
    hashSha256: hash,
  });

  await db.insert(acciones).values({
    casoId,
    tipoAccion: "evidencia_url",
    actor: "victima",
    descripcion: `URL registrada como evidencia: ${url}`,
  });

  return NextResponse.json({ hash });
}
