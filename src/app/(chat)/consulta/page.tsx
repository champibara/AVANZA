"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, Clock, FileText, ExternalLink, Play } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangSwitcher } from "@/components/lang-switcher";
import { useTranslate } from "@/lib/i18n/context";

interface ResultadoConsulta {
  caso: {
    pin: string;
    estado: string;
    fechaCreacion: string;
    fechaActualizacion?: string;
    tipoDelito?: string;
    entidadAsignada?: string;
  };
  evidencias: { tipo: string; hash: string; timestampEvidencia: string; descripcion?: string }[];
  acciones: { id: string; descripcion: string; fecha: string; actor: string }[];
  expediente: { entidad: string; fechaEnvio: string } | null;
}

export default function ConsultaPage() {
  const { t } = useTranslate();
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [reanudando, setReanudando] = useState(false);

  const consultar = async () => {
    if (!pin.trim()) return;
    setCargando(true);
    setError("");
    setResultado(null);

    try {
      const res = await fetch(`/api/caso/${pin.trim().toUpperCase()}`);
      if (!res.ok) {
        setError(t("consulta", "pin_invalido"));
        return;
      }
      const data = await res.json();
      setResultado(data);
    } catch {
      setError(t("consulta", "error"));
    } finally {
      setCargando(false);
    }
  };

  const reanudarCaso = async () => {
    if (!pin.trim() || !resultado) return;
    setReanudando(true);
    try {
      const res = await fetch(`/api/caso/${pin.trim().toUpperCase()}/reanudar`, { method: "POST" });
      if (!res.ok) {
        setError(t("consulta", "error_reanudar"));
        return;
      }
      router.push(`/?pin=${pin.trim().toUpperCase()}`);
    } catch {
      setError(t("consulta", "error_reanudar"));
    } finally {
      setReanudando(false);
    }
  };

  const estadoColor: Record<string, string> = {
    en_orientacion: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    consentimiento_pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    pendiente_validacion: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    validado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rechazado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    clasificado: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    derivado: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    caso_guardado: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    seguimiento: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    completado: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  const estadoLabel: Record<string, string> = {
    en_orientacion: t("estados", "en_orientacion"),
    consentimiento_pendiente: t("estados", "consentimiento_pendiente"),
    pendiente_validacion: t("estados", "pendiente_validacion"),
    validado: t("estados", "validado"),
    rechazado: t("estados", "rechazado"),
    clasificado: t("estados", "clasificado"),
    derivado: t("estados", "derivado"),
    caso_guardado: t("estados", "caso_guardado"),
    seguimiento: t("estados", "seguimiento"),
    completado: t("estados", "completado"),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-950">
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Shield className="w-6 h-6" />
          <h1 className="font-bold text-lg">{t("consulta", "title")}</h1>
          <div className="ml-auto flex items-center gap-2">
            <LangSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 dark:bg-gray-900 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
            {t("consulta", "descripcion")}
          </p>

          <input
            type="text"
            placeholder={t("consulta", "placeholder")}
            value={pin}
            onChange={(e) => setPin(e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-lg font-mono text-center tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
            onKeyDown={(e) => e.key === "Enter" && consultar()}
          />

          <button
            onClick={consultar}
            disabled={cargando || !pin.trim()}
            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            {cargando ? t("consulta", "buscando") : t("consulta", "buscar")}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {resultado && (
            <div className="mt-6 space-y-4">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${estadoColor[resultado.caso.estado] || "bg-gray-100 dark:bg-gray-800 dark:text-gray-300"}`}>
                {estadoLabel[resultado.caso.estado] || resultado.caso.estado}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{t("consulta", "registrado")}: {new Date(resultado.caso.fechaCreacion).toLocaleDateString("es-PE")}</span>
                </div>
                {resultado.caso.tipoDelito && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span>{t("consulta", "tipo")}: {resultado.caso.tipoDelito}</span>
                  </div>
                )}
                {resultado.caso.entidadAsignada && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <ExternalLink className="w-4 h-4" />
                    <span>{t("consulta", "entidad")}: {resultado.caso.entidadAsignada === "fiscalia" ? "Fiscalía" : "CEM / Asesoría Legal"}</span>
                  </div>
                )}
              </div>

              {resultado.evidencias.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{t("consulta", "evidencia")} ({resultado.evidencias.length})</h3>
                  {resultado.evidencias.map((ev, i: number) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-2 text-xs">
                      <p className="font-mono text-gray-500 dark:text-gray-400">Hash: {ev.hash.slice(0, 16)}...</p>
                      <p className="text-gray-500 dark:text-gray-400">Tipo: {ev.tipo}</p>
                      {ev.descripcion && <p className="text-gray-700 dark:text-gray-300">{ev.descripcion}</p>}
                    </div>
                  ))}
                </div>
              )}

              {resultado.acciones.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{t("consulta", "historial")}</h3>
                  <div className="space-y-2">
                    {resultado.acciones.slice(-5).reverse().map((acc, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1 shrink-0" />
                        <div>
                          <p>{acc.descripcion}</p>
                          <p className="text-gray-400 dark:text-gray-500">{new Date(acc.fecha).toLocaleString("es-PE")}</p>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          )}

          {resultado.caso.estado === "caso_guardado" && (
            <button
              onClick={reanudarCaso}
              disabled={reanudando}
              className="w-full mt-4 bg-amber-600 text-white py-3 rounded-xl hover:bg-amber-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {reanudando ? t("consulta", "reanudando") : t("consulta", "reanudar")}
            </button>
          )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
