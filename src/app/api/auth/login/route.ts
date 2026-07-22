import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { operadores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setSession } from "@/lib/auth";
import { createHash } from "crypto";
import { validarCampos, sanitizar } from "@/lib/validate";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { email, password } = body;

  const error = validarCampos([
    { valor: email, nombre: "email", tipo: "email", required: true },
    { valor: password, nombre: "password", tipo: "string", required: true, maxLen: 128 },
  ]);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const [operador] = await db
    .select()
    .from(operadores)
    .where(eq(operadores.email, email));

  if (!operador || operador.passwordHash !== hashPassword(password) || !operador.activo) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const payload = {
    id: operador.id,
    email: operador.email,
    nombre: operador.nombre,
    rol: operador.rol as "operador" | "admin",
  };

  await setSession(payload);

  return NextResponse.json({ operador: payload });
}
