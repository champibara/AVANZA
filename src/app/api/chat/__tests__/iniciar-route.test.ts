import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerarMensajeIA = vi.fn();

vi.mock("@/lib/ai", () => ({
  generarMensajeIA: mockGenerarMensajeIA,
}));

vi.mock("@/lib/pin", () => ({
  generatePin: vi.fn(() => "TEST1234"),
}));

vi.mock("@/db", () => ({
  getDb: vi.fn(() => mockDb),
}));

let mockDb: ReturnType<typeof crearMockDb>;

function crearMockDb() {
  let nextId = 1;
  return {
    insert: vi.fn((table: any) => ({
      values: vi.fn((vals: any) => ({
        returning: vi.fn(() => {
          const id = nextId++;
          return [{ ...vals, id }];
        }),
      })),
    })),
    _reset: () => { nextId = 1; },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDb = crearMockDb();
  process.env.GEMINI_API_KEY = "test-key";
});

async function llamarIniciar() {
  const { POST } = await import("../iniciar/route");
  return POST();
}

describe("POST /api/chat/iniciar — invocación a Gemini", () => {
  it("debe llamar a generarMensajeIA con estado orientacion al crear un caso", async () => {
    mockGenerarMensajeIA.mockResolvedValue("Bienvenida generada por IA");

    const res = await llamarIniciar();
    const data = await res.json();

    expect(mockGenerarMensajeIA).toHaveBeenCalledWith("orientacion", []);
    expect(data.mensaje).toBe("Bienvenida generada por IA");
    expect(data.casoId).toBe(1);
    expect(data.pin).toBe("TEST1234");
  });

  it("debe usar mensaje hardcodeado si Gemini falla", async () => {
    mockGenerarMensajeIA.mockRejectedValue(new Error("API error"));

    const res = await llamarIniciar();
    const data = await res.json();

    expect(data.mensaje).toBeTruthy();
    expect(typeof data.mensaje).toBe("string");
  });
});
