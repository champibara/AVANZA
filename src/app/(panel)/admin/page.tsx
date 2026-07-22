"use client";

import { useState, useEffect } from "react";
import { UserPlus, Shield } from "lucide-react";
import { useTranslate } from "@/lib/i18n/context";

interface OperadorData {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

interface StatsData {
  totalCasos: number;
  casosPorEstado: { estado: string; count: number }[];
  totalOperadores: number;
}

export default function AdminPage() {
  const { t } = useTranslate();
  const [operadores, setOperadores] = useState<OperadorData[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("operador");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = () => {
    fetch("/api/admin/operadores")
      .then((res) => res.json())
      .then((data) => setOperadores(data.operadores));

    fetch("/api/admin/estadisticas")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const crearOperador = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/operadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, rol }),
    });
    setNombre("");
    setEmail("");
    setPassword("");
    setMostrarForm(false);
    cargarDatos();
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    await fetch(`/api/admin/operadores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    });
    cargarDatos();
  };

  if (cargando) return <div className="text-center py-12 text-gray-500 dark:text-gray-400">{t("common", "cargando")}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t("admin", "title")}</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.totalCasos}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Casos totales</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.casosPorEstado?.find((e) => e.estado === "pendiente_validacion")?.count || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.totalOperadores}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Operadores</p>
          </div>
        </div>
      )}

      {/* Operadores */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Operadores
            </h2>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition text-sm font-medium flex items-center gap-2"
          >
            {mostrarForm ? t("common", "cancelar") : <><UserPlus className="w-4 h-4" /> {t("admin", "crear")}</>}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={crearOperador} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
            <input type="text" placeholder={t("admin", "nombre")} value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            <input type="email" placeholder={t("admin", "email")} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            <input type="password" placeholder={t("admin", "password")} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
            <select value={rol} onChange={(e) => setRol(e.target.value)} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-700">
              <option value="operador">{t("admin", "operador")}</option>
              <option value="admin">{t("admin", "admin")}</option>
            </select>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition font-medium">{t("admin", "crear")}</button>
          </form>
        )}

        <div className="space-y-2">
          {operadores.map((op) => (
            <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="font-medium text-sm">{op.nombre}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{op.email} — {op.rol === "admin" ? t("admin", "admin") : t("admin", "operador")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${op.activo ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
                  {op.activo ? "Activo" : "Inactivo"}
                </span>
                <button
                  onClick={() => toggleActivo(op.id, op.activo)}
                  className={`text-xs px-3 py-1 rounded-lg transition ${op.activo ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50" : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"}`}
                >
                  {op.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
