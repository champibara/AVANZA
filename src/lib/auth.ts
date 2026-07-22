import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);

export interface OperadorPayload {
  id: number;
  email: string;
  nombre: string;
  rol: "operador" | "admin";
}

export async function createToken(payload: OperadorPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<OperadorPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as OperadorPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<OperadorPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(payload: OperadorPayload): Promise<void> {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}
