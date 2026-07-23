import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { casos } from "@/db/schema";

type Notificacion = {
  to: string;
  subject: string;
  html: string;
};

export async function sendNotification({ to, subject, html }: Notificacion) {
  console.log(`[NOTIFICACION] Para: ${to}`);
  console.log(`[NOTIFICACION] Asunto: ${subject}`);
  console.log(`[NOTIFICACION] Cuerpo: ${html.replace(/<[^>]*>/g, "").slice(0, 200)}...`);

  const apiKey = process.env.NOTIFICACIONES_API_KEY;
  const provider = process.env.NOTIFICACIONES_PROVIDER || "console";

  if (provider === "resend") {
    if (!apiKey) {
      console.warn("[NOTIFICACION] provider=resend pero falta NOTIFICACIONES_API_KEY");
      return;
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.NOTIFICACIONES_FROM || "notificaciones@tu-dominio.com",
          to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`[NOTIFICACION] Error Resend: ${err}`);
      } else {
        console.log(`[NOTIFICACION] Enviado via Resend a ${to}`);
      }
    } catch (error) {
      console.error("[NOTIFICACION] Error de red al enviar via Resend:", error);
    }
  }
}

export async function notificarCaso(casoId: number, asunto: string, html: string) {
  const db = await getDb();
  const [caso] = await db.select().from(casos).where(eq(casos.id, casoId));
  if (!caso?.email) {
    console.warn(`[NOTIFICACION] Caso ${casoId}: sin email, omitiendo`);
    return;
  }
  await sendNotification({ to: caso.email, subject: asunto, html });
}
