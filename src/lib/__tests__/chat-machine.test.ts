import { describe, it, expect } from "vitest";
import { transition, chatTransitions } from "../chat-machine";
import type { ChatState } from "../chat-machine";

describe("Chat State Machine", () => {
  it("debe iniciar desde 'inicio' y transicionar a 'orientacion' con INICIAR", () => {
    const result = transition("inicio" as ChatState, { type: "INICIAR" });
    expect(result).toBe("orientacion");
  });

  it("debe transicionar de orientacion a decide_continuar con CONTINUAR", () => {
    const result = transition("orientacion" as ChatState, { type: "CONTINUAR" });
    expect(result).toBe("decide_continuar");
  });

  it("debe ir a consentimiento si decide continuar", () => {
    const result = transition("decide_continuar" as ChatState, { type: "CONTINUAR" });
    expect(result).toBe("consentimiento");
  });

  it("debe ir a cierre_amable si NO continuar", () => {
    const result = transition("decide_continuar" as ChatState, { type: "NO_CONTINUAR" });
    expect(result).toBe("cierre_amable");
  });

  it("debe ir a registro si acepta consentimiento", () => {
    const result = transition("consentimiento" as ChatState, { type: "ACEPTAR_CONSENTIMIENTO" });
    expect(result).toBe("registro");
  });

  it("debe ir a cierre_amable si rechaza consentimiento", () => {
    const result = transition("consentimiento" as ChatState, { type: "RECHAZAR_CONSENTIMIENTO" });
    expect(result).toBe("cierre_amable");
  });

  it("debe ir a evidencia tras registro", () => {
    const result = transition("registro" as ChatState, { type: "REGISTRAR" });
    expect(result).toBe("evidencia");
  });

  it("debe ir a decide_denuncia tras evidencia lista", () => {
    const result = transition("evidencia" as ChatState, { type: "EVIDENCIA_LISTA" });
    expect(result).toBe("decide_denuncia");
  });

  it("debe ir a pendiente_validacion si denuncia ahora", () => {
    const result = transition("decide_denuncia" as ChatState, { type: "DENUNCIAR_AHORA" });
    expect(result).toBe("pendiente_validacion");
  });

  it("debe ir a caso_guardado si denuncia despues", () => {
    const result = transition("decide_denuncia" as ChatState, { type: "DENUNCIAR_DESPUES" });
    expect(result).toBe("caso_guardado");
  });

  it("debe ir de caso_guardado a pendiente_validacion al reanudar", () => {
    const result = transition("caso_guardado" as ChatState, { type: "CONTINUAR" });
    expect(result).toBe("pendiente_validacion");
  });

  it("debe transicionar validado a clasificado", () => {
    const result = transition("validado" as ChatState, { type: "CLASIFICADO" });
    expect(result).toBe("clasificado");
  });

  it("debe transicionar clasificado a derivado", () => {
    const result = transition("clasificado" as ChatState, { type: "DERIVADO" });
    expect(result).toBe("derivado");
  });

  it("debe ir a seguimiento desde derivado", () => {
    const result = transition("derivado" as ChatState, { type: "CONTINUAR" });
    expect(result).toBe("seguimiento");
  });

  it("debe ir a fin si no requiere nuevas acciones", () => {
    const result = transition("seguimiento" as ChatState, { type: "NO_REQUERIR_ACCIONES" });
    expect(result).toBe("fin");
  });

  it("debe volver a pendiente_validacion si requiere nuevas acciones", () => {
    const result = transition("seguimiento" as ChatState, { type: "REQUERIR_ACCIONES" });
    expect(result).toBe("pendiente_validacion");
  });

  it("debe retornar null para transiciones invalidas", () => {
    const result = transition("inicio" as ChatState, { type: "RECHAZAR_CONSENTIMIENTO" });
    expect(result).toBeNull();
  });

  it("debe tener todas las rutas del diagrama de flujo", () => {
    // Verificar que todos los estados tienen al menos una transicion
    const states = Object.keys(chatTransitions);
    expect(states).toContain("inicio");
    expect(states).toContain("orientacion");
    expect(states).toContain("decide_continuar");
    expect(states).toContain("consentimiento");
    expect(states).toContain("decide_denuncia");
    expect(states).toContain("pendiente_validacion");
    expect(states).toContain("validado");
    expect(states).toContain("clasificado");
    expect(states).toContain("derivado");
    expect(states).toContain("seguimiento");
    expect(states).toContain("cierre_amable");
  });

  it("el flujo completo feliz debe funcionar", () => {
    const steps = [
      { from: "inicio" as ChatState, event: { type: "INICIAR" as const }, expected: "orientacion" },
      { from: "orientacion" as ChatState, event: { type: "CONTINUAR" as const }, expected: "decide_continuar" },
      { from: "decide_continuar" as ChatState, event: { type: "CONTINUAR" as const }, expected: "consentimiento" },
      { from: "consentimiento" as ChatState, event: { type: "ACEPTAR_CONSENTIMIENTO" as const }, expected: "registro" },
      { from: "registro" as ChatState, event: { type: "REGISTRAR" as const }, expected: "evidencia" },
      { from: "evidencia" as ChatState, event: { type: "EVIDENCIA_LISTA" as const }, expected: "decide_denuncia" },
      { from: "decide_denuncia" as ChatState, event: { type: "DENUNCIAR_AHORA" as const }, expected: "pendiente_validacion" },
      { from: "pendiente_validacion" as ChatState, event: { type: "VALIDADO" as const }, expected: "validado" },
      { from: "validado" as ChatState, event: { type: "CLASIFICADO" as const }, expected: "clasificado" },
      { from: "clasificado" as ChatState, event: { type: "DERIVADO" as const }, expected: "derivado" },
      { from: "derivado" as ChatState, event: { type: "CONTINUAR" as const }, expected: "seguimiento" },
      { from: "seguimiento" as ChatState, event: { type: "NO_REQUERIR_ACCIONES" as const }, expected: "fin" },
    ];

    let currentState: ChatState = "inicio";
    for (const step of steps) {
      currentState = transition(currentState, step.event) as ChatState;
      expect(currentState).toBe(step.expected);
    }
  });

  it("el flujo de abandono debe funcionar", () => {
    let state = transition("inicio" as ChatState, { type: "INICIAR" }) as ChatState;
    state = transition(state, { type: "CONTINUAR" }) as ChatState;
    state = transition(state, { type: "NO_CONTINUAR" }) as ChatState;
    expect(state).toBe("cierre_amable");
    state = transition(state, { type: "CONTINUAR" }) as ChatState;
    expect(state).toBe("fin");
  });

  it("el flujo de denuncia diferida debe funcionar", () => {
    let state: ChatState = "inicio";
    state = transition(state, { type: "INICIAR" }) as ChatState;
    state = transition(state, { type: "CONTINUAR" }) as ChatState;
    state = transition(state, { type: "CONTINUAR" }) as ChatState;
    state = transition(state, { type: "ACEPTAR_CONSENTIMIENTO" }) as ChatState;
    state = transition(state, { type: "REGISTRAR" }) as ChatState;
    state = transition(state, { type: "EVIDENCIA_LISTA" }) as ChatState;
    state = transition(state, { type: "DENUNCIAR_DESPUES" }) as ChatState;
    expect(state).toBe("caso_guardado");
    
    // Reanudar despues
    state = transition(state, { type: "CONTINUAR" }) as ChatState;
    expect(state).toBe("pendiente_validacion");
  });
});
