import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const casos = pgTable("casos", {
  id: serial("id").primaryKey(),
  pin: text("pin").notNull().unique(),
  nombreVictima: text("nombre_victima"),
  email: text("email"),
  edadAproximada: integer("edad_aproximada"),
  departamento: text("departamento"),
  esAnonimo: integer("es_anonimo").default(1),
  estado: text("estado").notNull().default("en_orientacion"),
  tipoDelito: text("tipo_delito"),
  accionTipo: text("accion_tipo"),
  entidadAsignada: text("entidad_asignada"),
  operadorId: integer("operador_id").references(() => operadores.id),
  fechaCreacion: timestamp("fecha_creacion", { mode: "date" }).default(sql`now()`),
  fechaActualizacion: timestamp("fecha_actualizacion", { mode: "date" }).default(sql`now()`),
});

export const evidencias = pgTable("evidencias", {
  id: serial("id").primaryKey(),
  casoId: integer("caso_id").notNull().references(() => casos.id),
  tipo: text("tipo").notNull(),
  archivoUrl: text("archivo_url"),
  descripcion: text("descripcion"),
  hashSha256: text("hash_sha256").notNull(),
  timestampEvidencia: timestamp("timestamp_evidencia", { mode: "date" }).default(sql`now()`),
  tamanoBytes: integer("tamano_bytes"),
  metadatos: text("metadatos"),
  s3Key: text("s3_key"),
  fechaCreacion: timestamp("fecha_creacion", { mode: "date" }).default(sql`now()`),
});

export const operadores = pgTable("operadores", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  rol: text("rol").notNull().default("operador"),
  activo: integer("activo").default(1),
  fechaCreacion: timestamp("fecha_creacion", { mode: "date" }).default(sql`now()`),
});

export const acciones = pgTable("acciones", {
  id: serial("id").primaryKey(),
  casoId: integer("caso_id").notNull().references(() => casos.id),
  tipoAccion: text("tipo_accion").notNull(),
  actor: text("actor").notNull(),
  operadorId: integer("operador_id").references(() => operadores.id),
  descripcion: text("descripcion"),
  metadatos: text("metadatos"),
  fecha: timestamp("fecha", { mode: "date" }).default(sql`now()`),
});

export const expedientes = pgTable("expedientes", {
  id: serial("id").primaryKey(),
  casoId: integer("caso_id").notNull().references(() => casos.id).unique(),
  entidadDestino: text("entidad_destino").notNull(),
  datosExpediente: text("datos_expediente").notNull(),
  enviadoOk: integer("enviado_ok").default(0),
  fechaEnvio: timestamp("fecha_envio", { mode: "date" }),
  fechaCreacion: timestamp("fecha_creacion", { mode: "date" }).default(sql`now()`),
});
