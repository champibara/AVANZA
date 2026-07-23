"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Shield, Copy, Check } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangSwitcher } from "@/components/lang-switcher";
import { useTranslate } from "@/lib/i18n/context";

interface Mensaje {
  tipo: "ia" | "victima" | "sistema";
  texto: string;
}

type Paso =
  | "inicio"
  | "orientacion"
  | "decide_continuar"
  | "consentimiento"
  | "decide_consentimiento"
  | "formulario"
  | "evidencia"
  | "decide_denuncia"
  | "pin_info"
  | "final";

export default function ChatPage() {
  const { t } = useTranslate();
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { tipo: "ia", texto: "Hola, gracias por comunicarte. Estoy aquí para escucharte y brindarte información sobre violencia digital. ¿Te gustaría conversar?" },
  ]);
  const [paso, setPaso] = useState<Paso>("inicio");
  const [casoId, setCasoId] = useState<string | null>(null);
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
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const agregarMensaje = (tipo: "ia" | "victima" | "sistema", texto: string) => {
    setMensajes(prev => [...prev, { tipo, texto }]);
  };

  const iniciarChat = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/chat/iniciar", { method: "POST" });
      const data = await res.json();
      setCasoId(data.casoId);
      setPin(data.pin);
      agregarMensaje("ia", data.mensaje || "Bienvenido. Estoy aquí para ayudarte.");
      agregarMensaje("ia", "¿Te gustaría continuar con el proceso de orientación?");
      setPaso("decide_continuar");
    } catch {
      agregarMensaje("sistema", t("chat", "error_iniciar"));
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
      const data = await res.json();
      return data;
    } catch {
      agregarMensaje("sistema", t("chat", "error_conexion"));
    } finally {
      setCargando(false);
    }
  };

  const manejarContinuar = async () => {
    agregarMensaje("victima", "Sí, deseo continuar");
    const data = await enviarEvento("CONTINUAR", "Sí, deseo continuar con el proceso");
    if (!data) return;

    setPaso("consentimiento");
    data.mensajes?.forEach((m: string) => agregarMensaje("ia", m));
  };

  const manejarNoContinuar = async () => {
    agregarMensaje("victima", "No, gracias");
    const data = await enviarEvento("NO_CONTINUAR", "No, gracias");
    if (data?.mensajes) {
      data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    }
    setPaso("final");
  };

  const manejarAceptarConsentimiento = async () => {
    agregarMensaje("victima", "Acepto los términos");
    const data = await enviarEvento("ACEPTAR_CONSENTIMIENTO", "Acepto los términos de tratamiento de datos");
    if (!data) return;

    setPaso("formulario");
    data.mensajes?.forEach((m: string) => agregarMensaje("ia", m));
  };

  const manejarRechazarConsentimiento = async () => {
    agregarMensaje("victima", "No acepto los términos");
    const data = await enviarEvento("RECHAZAR_CONSENTIMIENTO", "No acepto los términos");
    if (data?.mensajes) {
      data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    }
    setPaso("final");
  };

  const manejarRegistro = async () => {
    const datosRegistro = JSON.stringify({
      nombre: nombre || "(anónimo)",
      email,
      edad: edad || undefined,
      departamento: departamento || undefined,
    });
    agregarMensaje("victima", `Nombre: ${nombre || "(anónimo)"}${email ? `, Email: ${email}` : ""}${edad ? `, Edad: ${edad}` : ""}${departamento ? `, ${departamento}` : ""}`);

    const data = await enviarEvento("REGISTRAR", datosRegistro);

    if (pin) {
      agregarMensaje("sistema", `Tu PIN único: ${pin} — ${t("chat", "pin_guardar")}`);
    }

    if (data?.mensajes) {
      data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    }

    setPaso("evidencia");
  };

  const manejarSubirEvidencia = async () => {
    if (!urlEvidencia) return;
    agregarMensaje("victima", `URL: ${urlEvidencia}`);

    await fetch("/api/evidencia/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ casoId, url: urlEvidencia, descripcion: descripcionEvidencia }),
    });

    const data = await enviarEvento("EVIDENCIA_LISTA", `URL registrada: ${urlEvidencia}`);
    setUrlEvidencia("");
    setDescripcionEvidencia("");
    setPaso("decide_denuncia");
    data?.mensajes?.forEach((m: string) => agregarMensaje("ia", m));
  };

  const manejarSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !casoId) return;

    agregarMensaje("victima", `[Archivo: ${file.name}]`);

    const formData = new FormData();
    formData.append("casoId", casoId);
    formData.append("file", file);
    formData.append("descripcion", descripcionEvidencia);

    await fetch("/api/evidencia/subir", { method: "POST", body: formData });
    const data = await enviarEvento("EVIDENCIA_LISTA", `Archivo subido: ${file.name}`);
    setDescripcionEvidencia("");
    setPaso("decide_denuncia");
    data?.mensajes?.forEach((m: string) => agregarMensaje("ia", m));
  };

  const manejarDenunciarAhora = async () => {
    agregarMensaje("victima", "Quiero denunciar ahora");
    const data = await enviarEvento("DENUNCIAR_AHORA", "Quiero presentar la denuncia ahora");
    if (data?.mensajes) {
      data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    }
    setPaso("final");
  };

  const manejarDenunciarDespues = async () => {
    agregarMensaje("victima", "Prefiero hacerlo después");
    const data = await enviarEvento("DENUNCIAR_DESPUES", "Prefiero guardar el caso para después");
    if (data?.mensajes) {
      data.mensajes.forEach((m: string) => agregarMensaje("ia", m));
    }
    setPaso("final");
    if (pin) {
      agregarMensaje("sistema", `Tu PIN: ${pin} — ${t("chat", "pin_reanudar")}`);
    }
  };

  const copiarPin = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      setPinCopiado(true);
      setTimeout(() => setPinCopiado(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Shield className="w-6 h-6" />
          <div>
            <h1 className="font-bold text-lg">{t("app", "title")}</h1>
            <p className="text-indigo-200 text-sm">{t("app", "subtitle")}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-3xl mx-auto w-full">
        {mensajes.map((msg, i) => (
          <div key={i} className={`flex mb-3 ${msg.tipo === "victima" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.tipo === "victima"
                ? "bg-indigo-600 text-white rounded-br-md"
                : msg.tipo === "sistema"
                ? "bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300 rounded-bl-md"
                : "bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 rounded-bl-md shadow-sm"
            }`}>
              <p className="text-sm whitespace-pre-line">{msg.texto}</p>
            </div>
          </div>
        ))}

        {/* PIN display */}
        {pin && paso !== "final" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3 text-center dark:bg-green-900/30 dark:border-green-700">
            <p className="text-green-800 font-semibold text-sm mb-1 dark:text-green-300">{t("chat", "pin_unico")}</p>
            <p className="text-2xl font-mono font-bold text-green-700 tracking-widest dark:text-green-400">{pin}</p>
            <button
              onClick={copiarPin}
              className="mt-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm flex items-center gap-1 mx-auto"
            >
              {pinCopiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {pinCopiado ? t("chat", "copiado") : t("chat", "copiar")}
            </button>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-white dark:border-gray-700 dark:bg-gray-900 p-4 max-w-3xl mx-auto w-full">
        {paso === "inicio" && (
          <button
            onClick={iniciarChat}
            disabled={cargando}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
          >
            {cargando ? t("chat", "iniciando") : t("chat", "iniciar")}
          </button>
        )}

        {paso === "decide_continuar" && (
          <div className="flex gap-3">
            <button
              onClick={manejarContinuar}
              disabled={cargando}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              {t("chat", "si_continuar")}
            </button>
            <button
              onClick={manejarNoContinuar}
              disabled={cargando}
              className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 py-3 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              {t("chat", "no_gracias")}
            </button>
          </div>
        )}

        {paso === "consentimiento" && (
          <div className="flex gap-3">
            <button
              onClick={manejarAceptarConsentimiento}
              disabled={cargando}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              {t("chat", "acepto")}
            </button>
            <button
              onClick={manejarRechazarConsentimiento}
              disabled={cargando}
              className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 py-3 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              {t("chat", "no_acepto")}
            </button>
          </div>
        )}

        {paso === "formulario" && (
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t("chat", "nombre")}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="email"
              placeholder={t("chat", "email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="number"
              placeholder={t("chat", "edad")}
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              placeholder={t("chat", "departamento")}
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={manejarRegistro}
              disabled={cargando}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition font-medium"
            >
              {cargando ? t("chat", "guardando") : t("chat", "guardar")}
            </button>
          </div>
        )}

        {paso === "evidencia" && (
          <div className="space-y-3">
            <textarea
              placeholder={t("chat", "descripcion_evidencia")}
              value={descripcionEvidencia}
              onChange={(e) => setDescripcionEvidencia(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={2}
            />
            <input
              type="url"
              placeholder={t("chat", "url_evidencia")}
              value={urlEvidencia}
              onChange={(e) => setUrlEvidencia(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="flex gap-3">
              <button
                onClick={manejarSubirEvidencia}
                disabled={!urlEvidencia || cargando}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
              >
                {t("chat", "registrar_url")}
              </button>
              <label className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 py-3 rounded-xl hover:bg-gray-300 transition text-center cursor-pointer font-medium">
                {t("chat", "subir_archivo")}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={manejarSubirArchivo}
                  className="hidden"
                />
              </label>
            </div>
            <button
              onClick={() => {
                setPaso("decide_denuncia");
                agregarMensaje("ia", "¿Deseas presentar la denuncia ahora o prefieres guardar el caso para continuar después?");
              }}
              className="w-full text-gray-500 dark:text-gray-400 text-sm py-2 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              {t("chat", "omitir")}
            </button>
          </div>
        )}

        {paso === "decide_denuncia" && (
          <div className="flex gap-3">
            <button
              onClick={manejarDenunciarAhora}
              disabled={cargando}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium"
            >
              {t("chat", "denunciar_ahora")}
            </button>
            <button
              onClick={manejarDenunciarDespues}
              disabled={cargando}
              className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 py-3 rounded-xl hover:bg-gray-300 transition font-medium"
            >
              {t("chat", "guardar_despues")}
            </button>
          </div>
        )}

        {paso === "final" && (
          <Link
            href="/"
            className="block w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition text-center font-medium"
          >
            {t("chat", "nuevo")}
          </Link>
        )}
      </div>
    </div>
  );
}
