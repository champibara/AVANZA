import { describe, it, expect } from "vitest";
import { createToken, verifyToken } from "../auth";

describe("JWT Auth", () => {
  it("debe crear y verificar un token valido", async () => {
    const payload = {
      id: "test-id",
      email: "test@test.com",
      nombre: "Test",
      rol: "operador" as const,
    };

    const token = await createToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decoded = await verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.id).toBe(payload.id);
    expect(decoded!.email).toBe(payload.email);
    expect(decoded!.nombre).toBe(payload.nombre);
    expect(decoded!.rol).toBe(payload.rol);
  });

  it("debe rechazar un token invalido", async () => {
    const result = await verifyToken("token-invalido");
    expect(result).toBeNull();
  });

  it("debe rechazar un token manipulado", async () => {
    const payload = {
      id: "test-id",
      email: "test@test.com",
      nombre: "Test",
      rol: "operador" as const,
    };

    const token = await createToken(payload);
    const tamperedToken = token.slice(0, -5) + "XXXXX";
    const result = await verifyToken(tamperedToken);
    expect(result).toBeNull();
  });
});
