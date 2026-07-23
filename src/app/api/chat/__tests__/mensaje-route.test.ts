import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerarMensajeIA = vi.fn();

vi.mock("@/lib/ai", () => ({
  generarMensajeIA: mockGenerarMensajeIA,
}));

vi.mock("@/db", () => ({
  getDb: vi.fn(() => mockDb),
}));

let mockDb: ReturnType<typeof crearMockDb>;

function crearMockDb() {
  let casos: { id: number; estado: string; pin: string; fechaActualizacion: Date | null }[] = [];

  return {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: 1 }]),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve(casos.length ? [casos[0]] : [])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => {
          casos[0] = { ...casos[0], fechaActualizacion: new Date() };
          return Promise.resolve();
        }),
      })),
    })),
    _setCasos: (arr: typeof casos) => { casos = arr; },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDb = crearMockDb();
  process.env.GEMINI_API_KEY = "test-key";
});

async function llamarMensaje(body: Record<string, unknown>) {
  const { POST } = await import("../mensaje/route");
  const req = { json: vi.fn().mockResolvedValue(body) } as any;
  return POST(req);
}

describe("POST /api/chat/mensaje — invocación a Gemini", () => {
  it("llama a generarMensajeIA cuando nextState está en estadosConIA (registro)", async () => {
    mockGenerarMensajeIA.mockResolvedValue("Texto generado por IA");
    mockDb._setCasos([{ id: 2, estado: "consentimiento", pin: "DEF67890", fechaActualizacion: null }]);

    const res = await llamarMensaje({ casoId: 2, eventType: "ACEPTAR_CONSENTIMIENTO", mensajeUsuario: "Acepto" });
    const data = await res.json();

    expect(mockGenerarMensajeIA).toHaveBeenCalled();
    expect(data.mensajes).toEqual(["Texto generado por IA"]);
    expect(data.estado).toBe("registro");
  });

  it("NO llama a Gemini para nextState fuera de estadosConIA (decide_continuar)", async () => {
    mockDb._setCasos([{ id: 1, estado: "orientacion", pin: "ABC12345", fechaActualizacion: null }]);

    const res = await llamarMensaje({ casoId: 1, eventType: "CONTINUAR" });
    const data = await res.json();

    expect(mockGenerarMensajeIA).not.toHaveBeenCalled();
    expect(data.estado).toBe("decide_continuar");
  });

  it("usa fallback a mensajesIA cuando generarMensajeIA lanza error", async () => {
    mockGenerarMensajeIA.mockRejectedValue(new Error("API caída"));
    mockDb._setCasos([{ id: 3, estado: "decide_continuar", pin: "GHI12345", fechaActualizacion: null }]);

    const res = await llamarMensaje({ casoId: 3, eventType: "CONTINUAR" });
    const data = await res.json();

    // consentimiento está en estadosConIA, se intenta llamar a Gemini pero falla
    expect(mockGenerarMensajeIA).toHaveBeenCalledWith("consentimiento", []);
    expect(data.estado).toBe("consentimiento");
    expect(Array.isArray(data.mensajes)).toBe(true);
    expect(data.mensajes.length).toBeGreaterThan(0);
  });

  it("usa mensajesIA.cierre para cierre_amable (nunca llama a Gemini)", async () => {
    mockDb._setCasos([{ id: 4, estado: "decide_continuar", pin: "JKL12345", fechaActualizacion: null }]);

    const res = await llamarMensaje({ casoId: 4, eventType: "NO_CONTINUAR", mensajeUsuario: "Prefiero no" });
    const data = await res.json();

    expect(mockGenerarMensajeIA).not.toHaveBeenCalled();
    expect(data.estado).toBe("cierre_amable");
    expect(data.mensajes.length).toBeGreaterThan(0);
  });

  it("propaga mensajeUsuario en el historial de Gemini cuando nextState sí usa IA", async () => {
    mockGenerarMensajeIA.mockResolvedValue("Respuesta");
    mockDb._setCasos([{ id: 5, estado: "consentimiento", pin: "MNO12345", fechaActualizacion: null }]);

    await llamarMensaje({ casoId: 5, eventType: "ACEPTAR_CONSENTIMIENTO", mensajeUsuario: "Acepto todo" });

    expect(mockGenerarMensajeIA).toHaveBeenCalledWith(
      "registro",
      expect.arrayContaining([
        expect.objectContaining({ rol: "usuario", contenido: "Acepto todo" }),
      ])
    );
  });
});
