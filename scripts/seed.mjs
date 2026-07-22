import { neon } from "@neondatabase/serverless";
import { createHash } from "crypto";

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  const [existing] = await sql`SELECT COUNT(*)::int as count FROM operadores`;
  if (existing.count > 0) {
    console.log("Ya existen operadores en la base de datos.");
    return;
  }

  const hash = (pw: string) => createHash("sha256").update(pw).digest("hex");

  await sql`
    INSERT INTO operadores (nombre, email, password_hash, rol)
    VALUES (${"Administrador"}, ${"admin@mimp.gob.pe"}, ${hash("admin123")}, ${"admin"})
  `;
  await sql`
    INSERT INTO operadores (nombre, email, password_hash, rol)
    VALUES (${"Operador Demo"}, ${"operador@mimp.gob.pe"}, ${hash("operador123")}, ${"operador"})
  `;

  console.log("Operadores creados:");
  console.log("  Admin: admin@mimp.gob.pe / admin123");
  console.log("  Operador: operador@mimp.gob.pe / operador123");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
