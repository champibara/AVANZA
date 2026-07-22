import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { operadores } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function GET() {
  const db = await getDb();
  const session = await getSession();
  if (!session || session.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  
  const list = await db.select({
    id: operadores.id,
    nombre: operadores.nombre,
    email: operadores.email,
    rol: operadores.rol,
    activo: operadores.activo,
    fechaCreacion: operadores.fechaCreacion,
  }).from(operadores).orderBy(operadores.fechaCreacion);
  
  return NextResponse.json({ operadores: list });
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const session = await getSession();
  if (!session || session.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  
  const { nombre, email, password, rol } = await req.json();
  
  const [existing] = await db.select().from(operadores).where(eq(operadores.email, email));
  if (existing) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
  }
  
  const [operador] = await db.insert(operadores).values({
    nombre,
    email,
    passwordHash: hashPassword(password),
    rol: rol || "operador",
  }).returning();
  
  return NextResponse.json({
    id: operador.id,
    nombre: operador.nombre,
    email: operador.email,
    rol: operador.rol,
  });
}
