"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Shield, Copy, Check, BadgeCheck, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangSwitcher } from "@/components/lang-switcher";
import { useTranslate } from "@/lib/i18n/context";
import { conversationalTree, platformGuides } from "@/lib/conversational-tree";
import type { FlowNode } from "@/lib/conversational-tree";

interface Mensaje {
  tipo: "ia" | "victima" | "sistema";
  texto: string;
  hora?: string;
  plataforma?: boolean;
}

type Paso =
  | "arbol"
  | "consentimiento"
  | "decide_consentimiento"
  | "formulario"
  | "evidencia"
  | "decide_denuncia"
  | "pin_info"
  | "pendiente_validacion"
  | "caso_guardado"
  | "final"
  | "reanudado";

function HoraActual() {
  const ahora = new Date();
  return ahora.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage() {
  const { t } = useTranslate();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [paso, setPaso] = useState<Paso>("arbol");
  const [arbolActual, setArbolActual] = useState<string>("welcome");
  const [nodoHistorial, setNodoHistorial] = useState<string[]>([]);
  const [casoId, setCasoId] = useState<number | null>(null);
  const [pin, setPin] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [edad, setEdad] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [descripcionEvidencia, setDescripcionEvidencia] = useState("");
  const [urlEvidencia, setUrlEvidencia] = useState("");
  const [pinCopiado, setPinCopiado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pinReanudado = params.get("pin");
    if (pinReanudado) {
      setPin(pinReanudado);
      agregarMensaje("sistema", `Caso reanudado. Tu PIN: ${pinReanudado} — un operador revisará tu caso.`);
      setPaso("reanudado");
      return;
    }
    mostrarNodo("welcome");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const agregarMensaje = (tipo: "ia" | "victima" | "sistema", texto: string, opts?: { plataforma?: boolean }) => {
    setMensajes(prev => [...prev, { tipo, texto, hora: HoraActual(), ...opts }]);
  };

  const mostrarNodo = (nodeId: string) => {
    const nodo = conversationalTree[nodeId];
    if (!nodo) return;
    setArbolActual(nodeId);
    agregarMensaje("ia", nodo.botMessage);
    if (nodo.platformGuideKey) {
      const guia = platformGuides[nodo.platformGuideKey];
      if (guia) {
        agregarMensaje("sistema",
          `📋 **${guia.platformName}**\n\n${guia.description}\n\n**Pasos:**\n${guia.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}${guia.officialUrl ? `\n\n🔗 Sitio oficial: ${guia.officialUrl}` : ""}`,
          { plataforma: true }
        );
      }
    }
  };

  const navegarArbol = async (nodo: FlowNode, buttonId: string) => {
    const btn = nodo.buttons.find(b => b.id === buttonId);
    if (!btn) return;

    const labelLimpio = btn.label.replace(/^[^\s]+\s/, "");
    agregarMensaje("victima", labelLimpio);

    if (btn.actionType === "landing") {
      await iniciarRegistroFormal();
      return;
    }

    if (btn.nextNodeId) {
      setNodoHistorial(prev => [...prev, nodo.id]);
      mostrarNodo(btn.nextNodeId);
    }
  };

  const iniciarRegistroFormal = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/chat/iniciar", { method: "POST" });
      if (!res.ok) {
        agregarMensaje("sistema", "Error al iniciar el registro. Intenta de nuevo.");
        return;
      }
      const data = await res.json();
      setCasoId(data.casoId);
      setPin(data.pin);
      agregarMensaje("sistema", `Tu PIN único: ${data.pin} — ${t("chat", "pin_guardar")}`);
      agregarMensaje("ia", "Antes de continuar con el registro formal, necesito informarte sobre el tratamiento de tus datos.");
      agregarMensaje("ia", "1. Tus datos personales se almacenarán de forma cifrada y segura.\n2. La evidencia que compartas será protegida con un sello digital (hash).\n3. Recibirás un PIN único para dar seguimiento a tu caso sin exponer tu identidad.\n4. Puedes solicitar la eliminación de tus datos en cualquier momento.\n\n¿Aceptas el tratamiento de tus datos y evidencia según estos términos?");
      setPaso("consentimiento");
    } catch {
      agregarMensaje("sistema", "Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const enviarEvento = async (eventType: string, mensajeUsuario?: string) => {
    if (!casoId) { console.warn(`[enviarEvento] casoId es null, ignorando evento: ${eventType}`); return; }
    setCargando(true);
    try {
      const res = await fetch("/api/chat/mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ casoId, eventType, mensajeUsuario }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[enviarEvento] API error ${res.status} para evento ${eventType}: ${errText}`);
        return;
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(`[enviarEvento] EXCEPCIÓN:`, err);
      agregarMensaje("sistema", "Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const manejarAceptarConsentimiento = async () => {
    setCargando(true);
    agregarMensaje("victima", "Acepto los términos");
    const data = await enviarEvento("ACEPTAR_CONSENTIMIENTO", "Acepto los términos de tratamiento de datos");
    if (!data) { console.warn("[consentimiento] ACEPTAR_CONSENTIMIENTO falló"); return; }
    setPaso("formulario");
    data.mensajes?.forEach((m: string) => agregarMensaje("ia", m));
  };

  const manejarRechazarConsentimiento = async () => {
    setCargando(true);
    agregarMensaje("victima", "No acepto los términos");
    const data = await enviarEvento("RECHAZAR_CONSENTIMIENTO", "No acepto los términos");
    if (data?.mensajes) data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    setPaso("final");
  };

  const manejarRegistro = async () => {
    setCargando(true);
    const datosRegistro = JSON.stringify({
      nombre: nombre || "(anónimo)", email,
      edad: edad || undefined, departamento: departamento || undefined,
    });
    agregarMensaje("victima", `Nombre: ${nombre || "(anónimo)"}${email ? `, Email: ${email}` : ""}${edad ? `, Edad: ${edad}` : ""}${departamento ? `, ${departamento}` : ""}`);
    const data = await enviarEvento("REGISTRAR", datosRegistro);
    if (pin) agregarMensaje("sistema", `Tu PIN único: ${pin} — ${t("chat", "pin_guardar")}`);
    if (data?.mensajes) data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    setPaso("evidencia");
  };

  const manejarSubirEvidencia = async () => {
    if (!urlEvidencia) { console.warn("[subirEvidencia] url vacía"); return; }
    setCargando(true);
    agregarMensaje("victima", `URL: ${urlEvidencia}`);
    const urlRes = await fetch("/api/evidencia/url", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ casoId, url: urlEvidencia, descripcion: descripcionEvidencia }),
    });
    if (!urlRes.ok) console.warn("[subirEvidencia] Error al registrar URL:", urlRes.status);
    const data = await enviarEvento("EVIDENCIA_LISTA", `URL registrada: ${urlEvidencia}`);
    setUrlEvidencia(""); setDescripcionEvidencia(""); setPaso("decide_denuncia");
    data?.mensajes?.forEach((m: string) => agregarMensaje("ia", m));
  };

  const manejarOmitirEvidencia = async () => {
    setCargando(true);
    const data = await enviarEvento("EVIDENCIA_LISTA", "");
    if (!data) { console.warn("[omitirEvidencia] EVIDENCIA_LISTA falló"); return; }
    agregarMensaje("ia", "¿Deseas presentar la denuncia ahora o prefieres guardar el caso para continuar después?");
    setPaso("decide_denuncia");
  };

  const manejarSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !casoId) { console.warn("[subirArchivo] file o casoId faltante"); return; }
    setCargando(true);
    agregarMensaje("victima", `[Archivo: ${file.name}]`);
    const formData = new FormData();
    formData.append("casoId", String(casoId));
    formData.append("file", file);
    formData.append("descripcion", descripcionEvidencia);
    const subirRes = await fetch("/api/evidencia/subir", { method: "POST", body: formData });
    if (!subirRes.ok) console.warn("[subirArchivo] Error al subir archivo:", subirRes.status);
    const data = await enviarEvento("EVIDENCIA_LISTA", `Archivo subido: ${file.name}`);
    setDescripcionEvidencia(""); setPaso("decide_denuncia");
    data?.mensajes?.forEach((m: string) => agregarMensaje("ia", m));
  };

  const manejarDenunciarAhora = async () => {
    setCargando(true);
    agregarMensaje("victima", "Quiero denunciar ahora");
    const data = await enviarEvento("DENUNCIAR_AHORA", "Quiero presentar la denuncia ahora");
    if (data?.mensajes) data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    setPaso("pendiente_validacion");
  };

  const manejarDenunciarDespues = async () => {
    setCargando(true);
    agregarMensaje("victima", "Prefiero hacerlo después");
    const data = await enviarEvento("DENUNCIAR_DESPUES", "Prefiero guardar el caso para después");
    if (data?.mensajes) data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    if (pin) agregarMensaje("sistema", `Tu PIN: ${pin} — ${t("chat", "pin_reanudar")}`);
    setPaso("caso_guardado");
  };

  const copiarPin = () => {
    if (pin) { navigator.clipboard.writeText(pin); setPinCopiado(true); setTimeout(() => setPinCopiado(false), 2000); }
  };

  const nodoActual: FlowNode | undefined = conversationalTree[arbolActual];

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] dark:bg-[#0b141a]">
      <header className="bg-[#075E54] text-white shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-sm truncate">MIMP — AVANZA</h1>
              <BadgeCheck className="w-4 h-4 text-[#34B7F1] fill-white shrink-0" />
            </div>
            <p className="text-[10px] text-[#D9D9D9] leading-tight">en línea</p>
          </div>
          <div className="flex items-center gap-1">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="bg-amber-50 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 px-4 py-1.5 text-center">
        <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
          🔒 Conversación confidencial y cifrada — Orientación, no reemplaza una denuncia formal
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 max-w-3xl mx-auto w-full">
        {mensajes.map((msg, i) => (
          <div key={i} className={`flex mb-1 ${msg.tipo === "victima" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 ${
              msg.tipo === "victima"
                ? "bg-[#DCF8C6] dark:bg-[#005C4B] text-gray-900 dark:text-white rounded-l-xl rounded-br-xl rounded-tr-sm"
                : msg.tipo === "sistema"
                ? "bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 rounded-r-xl rounded-bl-xl rounded-tl-sm text-xs"
                : "bg-white dark:bg-[#1f2c33] text-gray-800 dark:text-gray-100 rounded-r-xl rounded-bl-xl rounded-tl-sm shadow-sm"
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.texto}</p>
              <div className={`flex items-center gap-1 mt-0.5 ${
                msg.tipo === "victima" ? "justify-end" : "justify-start"
              }`}>
                <span className={`text-[10px] ${
                  msg.tipo === "victima"
                    ? "text-gray-500 dark:text-gray-400"
                    : msg.tipo === "sistema"
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}>{msg.hora || HoraActual()}</span>
                {msg.tipo === "victima" && (
                  <Check className={`w-3 h-3 ${i < mensajes.length - 1 ? "text-gray-400" : "text-gray-500"}`} />
                )}
              </div>
            </div>
          </div>
        ))}

        {cargando && paso === "arbol" && (
          <div className="flex justify-start mb-1">
            <div className="bg-white dark:bg-[#1f2c33] rounded-r-xl rounded-bl-xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {pin && paso !== "arbol" && (
          <div className="bg-white/80 dark:bg-[#1f2c33]/80 backdrop-blur border border-gray-200 dark:border-gray-700 rounded-xl p-4 my-3 text-center shadow-sm">
            <p className="text-gray-600 dark:text-gray-400 font-semibold text-xs mb-1 uppercase tracking-wider">{t("chat", "pin_unico")}</p>
            <p className="text-2xl font-mono font-bold text-[#075E54] dark:text-[#34B7F1] tracking-widest">{pin}</p>
            <button onClick={copiarPin} className="mt-2 text-[#075E54] dark:text-[#34B7F1] hover:underline text-xs flex items-center gap-1 mx-auto">
              {pinCopiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {pinCopiado ? t("chat", "copiado") : t("chat", "copiar")}
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="bg-gray-50 dark:bg-[#0b141a] border-t border-gray-200 dark:border-gray-800 p-3 max-w-3xl mx-auto w-full">
        {paso === "arbol" && nodoActual && (
          <div className="space-y-2">
            {nodoActual.buttons.map(btn => (
              <button
                key={btn.id}
                onClick={() => navegarArbol(nodoActual, btn.id)}
                disabled={cargando}
                className={`w-full py-3 rounded-full transition font-medium text-sm disabled:opacity-50 ${
                  btn.isPrimary
                    ? "bg-[#075E54] text-white hover:bg-[#054d44]"
                    : "bg-white dark:bg-[#1f2c33] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-[#2a3942]"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {paso === "consentimiento" && (
          <div className="flex gap-2">
            <button onClick={manejarAceptarConsentimiento} disabled={cargando}
              className="flex-1 bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition font-medium text-sm disabled:opacity-50">
              {t("chat", "acepto")}
            </button>
            <button onClick={manejarRechazarConsentimiento} disabled={cargando}
              className="flex-1 bg-white dark:bg-[#1f2c33] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a3942] transition font-medium text-sm disabled:opacity-50">
              {t("chat", "no_acepto")}
            </button>
          </div>
        )}

        {paso === "formulario" && (
          <div className="space-y-2">
            <input type="text" placeholder={t("chat", "nombre")} value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#1f2c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#075E54] outline-none placeholder-gray-400" />
            <input type="email" placeholder={t("chat", "email")} value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#1f2c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#075E54] outline-none placeholder-gray-400" />
            <input type="number" placeholder={t("chat", "edad")} value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#1f2c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#075E54] outline-none placeholder-gray-400" />
            <input type="text" placeholder={t("chat", "departamento")} value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#1f2c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#075E54] outline-none placeholder-gray-400" />
            <button onClick={manejarRegistro} disabled={cargando}
              className="w-full bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition font-medium text-sm disabled:opacity-50">
              {cargando ? t("chat", "guardando") : t("chat", "guardar")}
            </button>
          </div>
        )}

        {paso === "evidencia" && (
          <div className="space-y-2">
            <textarea placeholder={t("chat", "descripcion_evidencia")} value={descripcionEvidencia}
              onChange={(e) => setDescripcionEvidencia(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#1f2c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#075E54] outline-none resize-none placeholder-gray-400" rows={2} />
            <input type="url" placeholder={t("chat", "url_evidencia")} value={urlEvidencia}
              onChange={(e) => setUrlEvidencia(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#1f2c33] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#075E54] outline-none placeholder-gray-400" />
            <div className="flex gap-2">
              <button onClick={manejarSubirEvidencia} disabled={!urlEvidencia || cargando}
                className="flex-1 bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition font-medium text-sm disabled:opacity-50">
                {t("chat", "registrar_url")}
              </button>
              <label className="flex-1 bg-white dark:bg-[#1f2c33] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a3942] transition text-center cursor-pointer font-medium text-sm">
                {t("chat", "subir_archivo")}
                <input type="file" accept="image/*,.pdf" onChange={manejarSubirArchivo} className="hidden" />
              </label>
            </div>
            <button onClick={manejarOmitirEvidencia} disabled={cargando}
              className="w-full text-gray-500 dark:text-gray-400 text-xs py-2 hover:text-gray-700 dark:hover:text-gray-300 transition disabled:opacity-50">
              {t("chat", "omitir")}
            </button>
          </div>
        )}

        {paso === "decide_denuncia" && (
          <div className="flex gap-2">
            <button onClick={manejarDenunciarAhora} disabled={cargando}
              className="flex-1 bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition font-medium text-sm disabled:opacity-50">
              {t("chat", "denunciar_ahora")}
            </button>
            <button onClick={manejarDenunciarDespues} disabled={cargando}
              className="flex-1 bg-white dark:bg-[#1f2c33] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a3942] transition font-medium text-sm disabled:opacity-50">
              {t("chat", "guardar_despues")}
            </button>
          </div>
        )}

        {paso === "pendiente_validacion" && (
          <div className="space-y-2">
            <Link href="/consulta"
              className="block w-full bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition text-center font-medium text-sm">
              {t("consulta", "title")}
            </Link>
            <Link href="/"
              className="block w-full bg-white dark:bg-[#1f2c33] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a3942] transition text-center font-medium text-sm">
              {t("chat", "nuevo")}
            </Link>
          </div>
        )}

        {paso === "caso_guardado" && (
          <div className="space-y-2">
            <Link href="/consulta"
              className="block w-full bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition text-center font-medium text-sm">
              {t("consulta", "title")}
            </Link>
            <Link href="/"
              className="block w-full bg-white dark:bg-[#1f2c33] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a3942] transition text-center font-medium text-sm">
              {t("chat", "nuevo")}
            </Link>
          </div>
        )}

        {paso === "reanudado" && (
          <div className="space-y-2">
            <Link href="/"
              className="block w-full bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition text-center font-medium text-sm">
              {t("chat", "nuevo")}
            </Link>
            <Link href="/consulta"
              className="block w-full bg-white dark:bg-[#1f2c33] text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-3 rounded-full hover:bg-gray-50 dark:hover:bg-[#2a3942] transition text-center font-medium text-sm">
              {t("consulta", "title")}
            </Link>
          </div>
        )}

        {paso === "final" && (
          <Link href="/"
            className="block w-full bg-[#075E54] text-white py-3 rounded-full hover:bg-[#054d44] transition text-center font-medium text-sm">
            {t("chat", "nuevo")}
          </Link>
        )}
      </div>
    </div>
  );
}
