import { describe, it, expect } from "vitest";
import { generatePin } from "../pin";

describe("PIN Generation", () => {
  it("debe generar un PIN de 8 caracteres", () => {
    const pin = generatePin();
    expect(pin).toHaveLength(8);
  });

  it("debe contener solo caracteres del alfabeto permitido", () => {
    const allowed = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
    for (let i = 0; i < 100; i++) {
      const pin = generatePin();
      expect(pin).toMatch(allowed);
    }
  });

  it("debe generar PINS unicos", () => {
    const pins = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      pins.add(generatePin());
    }
    expect(pins.size).toBe(1000);
  });

  it("no debe contener caracteres ambiguos (0, O, I, 1, L)", () => {
    const pin = generatePin();
    expect(pin).not.toContain("0");
    expect(pin).not.toContain("O");
    expect(pin).not.toContain("I");
    expect(pin).not.toContain("1");
    expect(pin).not.toContain("L");
  });
});
