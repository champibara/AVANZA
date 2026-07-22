import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit } from "../rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Limpiar el mapa interno usando la clave de test
    // El rate limiter usa un Map interno
  });

  it("debe permitir la primera solicitud", () => {
    const result = rateLimit("test-key-1", 3, 60000);
    expect(result).toBe(true);
  });

  it("debe bloquear despues de exceder el maximo de intentos", () => {
    const key = "test-key-2";
    expect(rateLimit(key, 3, 60000)).toBe(true);
    expect(rateLimit(key, 3, 60000)).toBe(true);
    expect(rateLimit(key, 3, 60000)).toBe(true);
    expect(rateLimit(key, 3, 60000)).toBe(false);
  });

  it("debe permitir solicitudes con diferentes claves", () => {
    expect(rateLimit("key-a", 2, 60000)).toBe(true);
    expect(rateLimit("key-b", 2, 60000)).toBe(true);
    expect(rateLimit("key-a", 2, 60000)).toBe(true);
    expect(rateLimit("key-a", 2, 60000)).toBe(false);
    expect(rateLimit("key-b", 2, 60000)).toBe(true);
  });
});
