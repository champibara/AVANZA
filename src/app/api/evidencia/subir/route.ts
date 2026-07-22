import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { evidencias, acciones } from "@/db/schema";
import { uploadFile } from "@/lib/s3";
import { createHash } from "crypto";
import { sanitizar, acortar } from "@/lib/validate";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export async function POST(req: NextRequest) {
  const db = await getDb();
  const formData = await req.formData();
  const rawCasoId = formData.get("casoId") as string;
  const casoId = Number(rawCasoId);
  const file = formData.get("file") as File;
  const descripcion = (formData.get("descripcion") as string) || "";

  if (!rawCasoId || !file) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "El archivo excede 10 MB" }, { status: 400 });
  }

  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido (solo JPG, PNG, WebP, PDF)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = createHash("sha256").update(buffer).digest("hex");
  const key = `${rawCasoId}/${Date.now()}-${file.name}`;

  await uploadFile(key, buffer, file.type);

  await db.insert(evidencias).values({
    casoId,
    tipo: "imagen",
    archivoUrl: key,
    descripcion,
    hashSha256: hash,
    tamanoBytes: buffer.length,
    s3Key: key,
  });

  await db.insert(acciones).values({
    casoId,
    tipoAccion: "evidencia_subida",
    actor: "victima",
    descripcion: `Evidencia subida: ${file.name} (${hash.slice(0, 12)}...)`,
  });

  return NextResponse.json({ hash, key });
}
