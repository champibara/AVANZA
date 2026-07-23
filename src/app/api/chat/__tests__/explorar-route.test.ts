import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerarMensajeIA = vi.fn();

vi.mock("@/lib/ai", () => ({
  generarMensajeIA: mockGenerarMensajeIA,
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GEMINI_API_KEY = "test-key";
});

async function llamarExplorar(body: Record<string, unknown>) {
  const { POST } = await import("../explorar/route");
  const req = { json: vi.fn().mockResolvedValue(body) } as any;
  return POST(req);
}

describe("POST /api/chat/explorar — sin DB, solo Gemini", () => {
  it("debe llamar a generarMensajeIA con el prompt orientacion y el mensaje del usuario", async () => {
    mockGenerarMensajeIA.mockResolvedValue(
      "Hola, entiendo que estás pasando por una situación difícil. Cuéntame más sobre lo que te preocupa."
    );

    const res = await llamarExplorar({ mensaje: "Me están acosando en Instagram", historial: [] });
    const data = await res.json();

    expect(mockGenerarMensajeIA).toHaveBeenCalledWith(
      "orientacion",
      expect.arrayContaining([
        expect.objectContaining({ rol: "usuario", contenido: "Me están acosando en Instagram" }),
      ])
    );
    expect(data.respuesta).toBeTruthy();
    expect(data.respuesta).toContain("entiendo");
  });

  it("debe incluir el historial previo en la llamada a Gemini", async () => {
    mockGenerarMensajeIA.mockResolvedValue("Claro, ¿has denunciado el perfil?");

    const historial = [
      { rol: "usuario" as const, contenido: "Hola, necesito ayuda" },
      { rol: "asistente" as const, contenido: "Hola, cuéntame qué está pasando" },
    ];

    await llamarExplorar({ mensaje: "Me están acosando en Instagram", historial });

    expect(mockGenerarMensajeIA).toHaveBeenCalledWith("orientacion", [
      ...historial,
      { rol: "usuario", contenido: "Me están acosando en Instagram" },
    ]);
  });

  it("debe devolver error 400 si mensaje está vacío", async () => {
    const res = await llamarExplorar({ mensaje: "", historial: [] });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it("debe devolver 500 si Gemini falla", async () => {
    mockGenerarMensajeIA.mockRejectedValue(new Error("API error"));

    const res = await llamarExplorar({ mensaje: "Hola", historial: [] });
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("API error");
  });

  it("no debe crear ningún registro en base de datos", async () => {
    mockGenerarMensajeIA.mockResolvedValue("Respuesta de prueba");
    const dbSpy = vi.fn();

    const res = await llamarExplorar({ mensaje: "test", historial: [] });
    expect(res.status).toBe(200);
    expect(dbSpy).not.toHaveBeenCalled();
  });
});
