import { getDb } from "../src/db";
import { operadores } from "../src/db/schema";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function seed() {
  console.log("Creando operador administrador inicial...");

  const db = await getDb();

  const existing = await db.select().from(operadores).limit(1);
  if (existing.length > 0) {
    console.log("Ya existen operadores en la base de datos.");
    return;
  }

  await db.insert(operadores).values({
    nombre: "Administrador",
    email: "admin@mimp.gob.pe",
    passwordHash: hashPassword("admin123"),
    rol: "admin",
  });

  await db.insert(operadores).values({
    nombre: "Operador Demo",
    email: "operador@mimp.gob.pe",
    passwordHash: hashPassword("operador123"),
    rol: "operador",
  });

  console.log("Operadores creados:");
  console.log("  Admin: admin@mimp.gob.pe / admin123");
  console.log("  Operador: operador@mimp.gob.pe / operador123");
}

seed().catch((err) => {
  console.error("Error al sembrar:", err);
  process.exit(1);
});
