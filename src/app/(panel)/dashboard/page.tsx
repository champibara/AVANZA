"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, ArrowRight } from "lucide-react";
import { useTranslate } from "@/lib/i18n/context";

interface CasoListaItem {
  id: string;
  pin: string;
  estado: string;
  fechaCreacion: string;
  tipoDelito?: string;
  esAnonimo: boolean;
}

const estadoColor: Record<string, string> = {
    pendiente_validacion: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
    validado: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    rechazado: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    clasificado: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
    derivado: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
  };

export default function DashboardPage() {
  const { t } = useTranslate();
  const router = useRouter();
  const [casos, setCasos] = useState<CasoListaItem[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/operador/casos")
      .then((res) => res.json())
      .then((data) => setCasos(data.casos))
      .finally(() => setCargando(false));
  }, []);

  const casosFiltrados = casos.filter((c) => {
    if (filtro !== "todos" && c.estado !== filtro) return false;
    if (busqueda && !c.pin?.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const pendientes = casos.filter((c) => c.estado === "pendiente_validacion").length;

  const estadoLabel: Record<string, string> = useMemo(() => ({
    pendiente_validacion: t("estados", "pendiente_validacion"),
    validado: t("estados", "validado"),
    rechazado: t("estados", "rechazado"),
    clasificado: t("estados", "clasificado"),
    derivado: t("estados", "derivado"),
  }), [t]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("dashboard", "title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{pendientes} {t("dashboard", "pendientes")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t("dashboard", "buscar")}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-800"
        >
          <option value="todos">{t("dashboard", "filtro_todos")}</option>
          <option value="pendiente_validacion">{t("dashboard", "filtro_pendientes")}</option>
          <option value="validado">{t("dashboard", "filtro_validados")}</option>
          <option value="clasificado">{t("dashboard", "filtro_clasificados")}</option>
          <option value="derivado">{t("dashboard", "filtro_derivados")}</option>
          <option value="rechazado">{t("dashboard", "filtro_rechazados")}</option>
        </select>
      </div>

      {/* Cases list */}
      {cargando ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t("dashboard", "cargando")}</div>
      ) : casosFiltrados.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t("dashboard", "vacio")}</div>
      ) : (
        <div className="space-y-3">
          {casosFiltrados.map((caso) => (
            <div
              key={caso.id}
              onClick={() => router.push(`/casos/${caso.id}`)}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-lg text-indigo-700">{caso.pin}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${estadoColor[caso.estado] || "bg-gray-100"}`}>
                    {estadoLabel[caso.estado] || caso.estado}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(caso.fechaCreacion).toLocaleDateString("es-PE")}
                </span>
                {caso.tipoDelito && (
                  <span>{caso.tipoDelito}</span>
                )}
                {caso.esAnonimo && (
                  <span className="text-gray-400 dark:text-gray-500">{t("dashboard", "anonimo")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
