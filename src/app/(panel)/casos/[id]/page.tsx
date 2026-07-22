"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, Clock, Hash, CheckCircle, XCircle, FileText, Send } from "lucide-react";
import { useTranslate } from "@/lib/i18n/context";

interface EvidenciaData {
  id: string;
  tipo: string;
  archivoUrl?: string;
  descripcion?: string;
  hashSha256: string;
  timestampEvidencia: string;
}

interface AccionData {
  id: string;
  tipoAccion: string;
  actor: string;
  descripcion: string;
  fecha: string;
  operadorId?: string;
}

interface ExpedienteData {
  id: string;
  entidadDestino: string;
  datosExpediente: Record<string, unknown>;
  enviadoOk: boolean;
  fechaEnvio?: string;
}

interface CasoData {
  id: string;
  pin: string;
  nombreVictima?: string;
  edadAproximada?: number;
  departamento?: string;
  esAnonimo: boolean;
  estado: string;
  tipoDelito?: string;
  accionTipo?: string;
  entidadAsignada?: string;
  operadorId?: string;
  fechaCreacion: string;
  operadorNombre?: string;
}

interface CasoDetalleResponse {
  caso: CasoData;
  evidencias: EvidenciaData[];
  acciones: AccionData[];
  expediente: ExpedienteData | null;
}

const tiposDelito = [
  "Acoso digital",
  "Difusión de contenido íntimo sin consentimiento",
  "Suplantación de identidad",
  "Extorsión sexual",
  "Ciberacoso",
  "Violencia de género digital",
  "Grooming",
  "Otro",
];

export default function CasoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslate();
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<CasoDetalleResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [accion, setAccion] = useState<string | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [tipoDelito, setTipoDelito] = useState("");
  const [accionTipo, setAccionTipo] = useState("publica");
  const [entidadDestino, setEntidadDestino] = useState("");
  const [mensajeNotif, setMensajeNotif] = useState("");

  useEffect(() => {
    fetch(`/api/operador/casos/${id}`)
      .then((res) => res.json())
      .then((data) => setData(data))
      .finally(() => setCargando(false));
  }, [id]);

  const estadoLabel: Record<string, string> = useMemo(() => ({
    pendiente_validacion: t("estados", "pendiente_validacion"),
    validado: t("estados", "validado"),
    rechazado: t("estados", "rechazado"),
    clasificado: t("estados", "clasificado"),
    derivado_fiscalia: t("estados", "derivado_fiscalia"),
    derivado_cem: t("estados", "derivado_cem"),
  }), [t]);

  const ejecutarAccion = async (url: string, body: Record<string, unknown>) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setAccion(null);
      const res2 = await fetch(`/api/operador/casos/${id}`);
      const data2 = await res2.json();
      setData(data2);
    }
  };

  if (cargando) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t("common", "cargando")}</div>;
  if (!data) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Caso no encontrado</div>;

  const { caso, evidencias, acciones } = data;

  return (
    <div>
      <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition">
        <ArrowLeft className="w-4 h-4" />
        {t("caso", "volver")}
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold font-mono">{caso.pin}</h1>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700">
            {estadoLabel[caso.estado] || caso.estado}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t("caso", "nombre")}:</span>
            <p className="font-medium">{caso.nombreVictima || t("caso", "anonimo")}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t("caso", "edad")}:</span>
            <p className="font-medium">{caso.edadAproximada || t("caso", "no_especificada")}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t("caso", "departamento")}:</span>
            <p className="font-medium">{caso.departamento || t("caso", "no_especificado")}</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">{t("caso", "registro")}:</span>
            <p className="font-medium">{new Date(caso.fechaCreacion).toLocaleString("es-PE")}</p>
          </div>
          {caso.operadorNombre && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("caso", "operador")}:</span>
              <p className="font-medium">{caso.operadorNombre}</p>
            </div>
          )}
          {caso.tipoDelito && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("caso", "tipo_delito")}:</span>
              <p className="font-medium">{caso.tipoDelito}</p>
            </div>
          )}
          {caso.entidadAsignada && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t("caso", "entidad")}:</span>
              <p className="font-medium">{caso.entidadAsignada === "fiscalia" ? "Fiscalía" : "CEM"}</p>
            </div>
          )}
        </div>

        {/* Evidence */}
        {evidencias.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4" />
              {t("caso", "evidencia")} ({evidencias.length})
            </h2>
            <div className="space-y-2">
              {evidencias.map((ev) => (
                <div key={ev.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{ev.tipo}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(ev.timestampEvidencia).toLocaleString("es-PE")}</span>
                  </div>
                  {ev.archivoUrl && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">{ev.archivoUrl}</p>
                  )}
                  {ev.descripcion && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{ev.descripcion}</p>
                  )}
                  <p className="text-xs font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 p-1 rounded">
                    SHA-256: {ev.hashSha256}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t("caso", "linea_tiempo")}
          </h2>
          <div className="space-y-3">
            {acciones.slice().reverse().map((acc, i) => (
              <div key={acc.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${i === 0 ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{acc.descripcion}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(acc.fecha).toLocaleString("es-PE")} — {acc.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          {caso.estado === "pendiente_validacion" && (
            <div className="flex gap-3">
              <button
                onClick={() => setAccion("validar")}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {t("caso", "validar")}
              </button>
              <button
                onClick={() => setAccion("rechazar")}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                {t("caso", "rechazar")}
              </button>
            </div>
          )}

          {caso.estado === "validado" && (
            <div className="space-y-3">
              <button
                onClick={() => setAccion("clasificar")}
                className="w-full bg-purple-600 text-white py-2.5 rounded-xl hover:bg-purple-700 transition font-medium flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {t("caso", "clasificar")}
              </button>
            </div>
          )}

          {caso.estado === "clasificado" && (
            <button
              onClick={() => {
                setEntidadDestino(caso.accionTipo === "publica" ? "fiscalia" : "cem");
                setAccion("derivar");
              }}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t("caso", "derivar")} ({caso.accionTipo === "publica" ? "Fiscalía" : "CEM"})
            </button>
          )}

          {(caso.estado === "derivado_fiscalia" || caso.estado === "derivado_cem") && (
            <div className="space-y-3">
              <button
                onClick={() => setAccion("notificar")}
                className="w-full bg-teal-600 text-white py-2.5 rounded-xl hover:bg-teal-700 transition font-medium"
              >
                {t("caso", "notificar")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modales / formularios inline */}
      {accion === "validar" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full">
            <h2 className="font-bold text-lg mb-4">{t("caso", "validar")}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{t("caso", "validar_confirmar")}</p>
            <div className="flex gap-3">
              <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">{t("common", "cancelar")}</button>
              <button onClick={() => ejecutarAccion(`/api/operador/casos/${id}/validar`, {})} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition">{t("caso", "validar")}</button>
            </div>
          </div>
        </div>
      )}

      {accion === "rechazar" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full">
            <h2 className="font-bold text-lg mb-4">{t("caso", "rechazar")} caso</h2>
            <textarea
              placeholder={t("caso", "motivo")}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-red-500 outline-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">{t("common", "cancelar")}</button>
              <button onClick={() => ejecutarAccion(`/api/operador/casos/${id}/rechazar`, { motivo: motivoRechazo })} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl hover:bg-red-700 transition">{t("caso", "rechazar")}</button>
            </div>
          </div>
        </div>
      )}

      {accion === "clasificar" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h2 className="font-bold text-lg mb-4">{t("caso", "clasificar")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("caso", "clasificar_tipo")}</label>
                <select
                  value={tipoDelito}
                  onChange={(e) => setTipoDelito(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">{t("caso", "seleccionar")}</option>
                  {tiposDelito.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("caso", "clasificar_accion")}</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setAccionTipo("publica")}
                    className={`flex-1 py-2.5 rounded-xl border-2 transition font-medium ${accionTipo === "publica" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-400"}`}
                  >
                    {t("caso", "publica")}
                  </button>
                  <button
                    onClick={() => setAccionTipo("privada")}
                    className={`flex-1 py-2.5 rounded-xl border-2 transition font-medium ${accionTipo === "privada" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-400"}`}
                  >
                    {t("caso", "privada")}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">{t("common", "cancelar")}</button>
                <button
                  onClick={() => ejecutarAccion(`/api/operador/casos/${id}/clasificar`, { tipoDelito, accionTipo })}
                  disabled={!tipoDelito}
                  className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {t("caso", "clasificar")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accion === "derivar" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h2 className="font-bold text-lg mb-4">{t("caso", "derivar")}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t("caso", "derivar_a")}: <strong>{entidadDestino === "fiscalia" ? "Fiscalía Especializada" : "CEM / Asesoría Legal"}</strong>
            </p>
            <div className="flex gap-3">
              <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">{t("common", "cancelar")}</button>
              <button
                onClick={() => ejecutarAccion(`/api/operador/casos/${id}/derivar`, { entidadDestino })}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition"
              >
                {t("caso", "derivar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {accion === "notificar" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <h2 className="font-bold text-lg mb-4">{t("caso", "notificar")}</h2>
            <textarea
              placeholder={t("caso", "mensaje_notif")}
              value={mensajeNotif}
              onChange={(e) => setMensajeNotif(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => setAccion(null)} className="flex-1 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">{t("common", "cancelar")}</button>
              <button
                onClick={() => ejecutarAccion(`/api/operador/casos/${id}/notificar`, { mensaje: mensajeNotif })}
                className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl hover:bg-teal-700 transition"
              >
                {t("caso", "enviar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
