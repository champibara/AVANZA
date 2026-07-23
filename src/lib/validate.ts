export function sanitizar(texto: string): string {
  return texto
    .replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;" })[c] || c)
    .trim();
}

export function validarEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function validarPin(pin: string): boolean {
  return /^[A-Z0-9]{8}$/.test(pin);
}

export function acortar(texto: string, max: number): string {
  return texto.length > max ? texto.slice(0, max) : texto;
}

type Campo = { valor: unknown; nombre: string; tipo?: "string" | "number" | "email"; required?: boolean; maxLen?: number };

export function validarCampos(campos: Campo[]): string | null {
  for (const c of campos) {
    if (c.required && (c.valor === undefined || c.valor === null || c.valor === "")) {
      return `El campo "${c.nombre}" es requerido`;
    }
    if (c.valor !== undefined && c.valor !== null && c.valor !== "") {
      if (c.tipo === "string" && typeof c.valor !== "string") {
        return `El campo "${c.nombre}" debe ser texto`;
      }
      if (c.tipo === "number" && (typeof c.valor !== "number" || isNaN(c.valor))) {
        return `El campo "${c.nombre}" debe ser un número`;
      }
      if (c.tipo === "email" && !validarEmail(String(c.valor))) {
        return `El campo "${c.nombre}" no es un email válido`;
      }
      if (c.maxLen && typeof c.valor === "string" && c.valor.length > c.maxLen) {
        return `El campo "${c.nombre}" no puede exceder ${c.maxLen} caracteres`;
      }
    }
  }
  return null;
}
