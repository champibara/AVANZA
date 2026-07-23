export type ChatState =
  | "inicio"
  | "orientacion"
  | "decide_continuar"
  | "consentimiento"
  | "decide_consentimiento"
  | "registro"
  | "evidencia"
  | "decide_denuncia"
  | "caso_guardado"
  | "pendiente_validacion"
  | "validado"
  | "rechazado"
  | "clasificado"
  | "derivado"
  | "seguimiento"
  | "nuevas_acciones"
  | "cierre_amable"
  | "fin";

export type ChatEvent =
  | { type: "INICIAR" }
  | { type: "CONTINUAR" }
  | { type: "NO_CONTINUAR" }
  | { type: "ACEPTAR_CONSENTIMIENTO" }
  | { type: "RECHAZAR_CONSENTIMIENTO" }
  | { type: "REGISTRAR" }
  | { type: "EVIDENCIA_LISTA" }
  | { type: "DENUNCIAR_AHORA" }
  | { type: "DENUNCIAR_DESPUES" }
  | { type: "VALIDADO" }
  | { type: "RECHAZADO" }
  | { type: "CLASIFICADO" }
  | { type: "DERIVADO" }
  | { type: "REQUERIR_ACCIONES" }
  | { type: "NO_REQUERIR_ACCIONES" }
  | { type: "VOLVER_A_VALIDACION" };

interface Transition {
  to: ChatState;
  guard?: (data: Record<string, unknown>) => boolean;
}

type Transitions = Partial<Record<ChatState, Partial<Record<string, Transition>>>>;

export const chatTransitions: Transitions = {
  inicio: {
    INICIAR: { to: "orientacion" },
  },
  orientacion: {
    CONTINUAR: { to: "decide_continuar" },
    NO_CONTINUAR: { to: "cierre_amable" },
  },
  decide_continuar: {
    CONTINUAR: { to: "consentimiento" },
    NO_CONTINUAR: { to: "cierre_amable" },
  },
  consentimiento: {
    ACEPTAR_CONSENTIMIENTO: { to: "registro" },
    RECHAZAR_CONSENTIMIENTO: { to: "cierre_amable" },
  },
  registro: {
    REGISTRAR: { to: "evidencia" },
  },
  evidencia: {
    EVIDENCIA_LISTA: { to: "decide_denuncia" },
  },
  decide_denuncia: {
    DENUNCIAR_AHORA: { to: "pendiente_validacion" },
    DENUNCIAR_DESPUES: { to: "caso_guardado" },
  },
  caso_guardado: {
    CONTINUAR: { to: "pendiente_validacion" },
  },
  pendiente_validacion: {
    VALIDADO: { to: "validado" },
    RECHAZADO: { to: "rechazado" },
  },
  validado: {
    CLASIFICADO: { to: "clasificado" },
  },
  clasificado: {
    DERIVADO: { to: "derivado" },
  },
  derivado: {
    CONTINUAR: { to: "seguimiento" },
  },
  seguimiento: {
    REQUERIR_ACCIONES: { to: "pendiente_validacion" },
    NO_REQUERIR_ACCIONES: { to: "fin" },
  },
  cierre_amable: {
    CONTINUAR: { to: "fin" },
  },
};

export function transition(state: ChatState, event: ChatEvent): ChatState | null {
  const stateTransitions = chatTransitions[state];
  if (!stateTransitions) return null;
  const transitionDef = stateTransitions[event.type];
  if (!transitionDef) return null;
  if (transitionDef.guard && !transitionDef.guard(event)) return null;
  return transitionDef.to;
}

export const mensajesIA: Record<string, string[]> = {
  orientacion: [
    "Hola, gracias por comunicarte. Estoy aquí para escucharte y brindarte información.",
    "La violencia digital es cualquier acto que se comete a través de medios electrónicos y que afecta tu bienestar. No estás sola.",
    "Tienes derecho a: (1) Vivir una vida libre de violencia, (2) Que tu caso sea atendido con confidencialidad, (3) Recibir información clara sobre tus opciones.",
    "¿Te gustaría conocer los pasos que puedes seguir para obtener ayuda?",
  ],
  consentimiento: [
    "Antes de continuar, necesito informarte sobre el tratamiento de tus datos:",
    "1. Tus datos personales se almacenarán de forma cifrada y segura.",
    "2. La evidencia que compartas será protegida con un sello digital (hash) que garantiza su integridad.",
    "3. Recibirás un PIN único para dar seguimiento a tu caso sin exponer tu identidad.",
    "4. Puedes solicitar la eliminación de tus datos en cualquier momento.",
    "¿Aceptas el tratamiento de tus datos y evidencia según estos términos?",
  ],
  pendiente_validacion: [
    "Tu caso ha sido registrado y enviado para revisión.",
    "Un operador especializado lo evaluará pronto. Recibirás una notificación cuando haya una actualización.",
    "Puedes dar seguimiento usando tu PIN en la opción 'Consultar mi caso'.",
  ],
  caso_guardado: [
    "Tu caso ha sido guardado. Puedes reanudarlo cuando quieras usando tu PIN.",
    "No pierdas tu PIN, es la única forma de acceder a tu caso.",
    "Cuando estés lista, ingresa el PIN en 'Consultar mi caso' y elige 'Reanudar mi caso'.",
  ],
  cierre: [
    "Gracias por comunicarte. Respetamos tu decisión.",
    "Aquí tienes información útil sobre violencia digital:",
    "• Derechos: Puedes denunciar sin exponer tu identidad.",
    "• Medidas de protección: Puedes solicitar medidas de protección en la Fiscalía o CEM más cercano.",
    "• Seguridad digital: Revisa la configuración de privacidad de tus redes sociales.",
    "• Línea de ayuda: Llama al 100 (Línea gratuita del MIMP) o escribe al chat ANAR 155.",
    "Puedes volver a usar esta plataforma cuando lo desees.",
  ],
};
