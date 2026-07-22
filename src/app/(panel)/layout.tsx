"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Users, LogOut, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangSwitcher } from "@/components/lang-switcher";
import { useTranslate } from "@/lib/i18n/context";

interface OperadorSesion {
  id: string;
  nombre: string;
  email: string;
  rol: "operador" | "admin";
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [operador, setOperador] = useState<OperadorSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("No autenticado");
        return res.json();
      })
      .then((data) => setOperador(data.operador))
      .catch(() => router.push("/login"))
      .finally(() => setCargando(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">{t("common", "cargando")}</div>
      </div>
    );
  }

  if (!operador) return null;

  const isLoginPage = pathname === "/login";

  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { href: "/dashboard", label: t("dashboard", "title"), icon: LayoutDashboard },
    ...(operador.rol === "admin" ? [{ href: "/admin", label: t("admin", "title"), icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden bg-indigo-700 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">{t("app", "panel")}</span>
        </div>
        <div className="flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-900 text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-indigo-300" />
            <div>
              <h2 className="font-bold">{t("app", "panel")}</h2>
              <p className="text-indigo-300 text-xs">{t("app", "subtitle")}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition ${
                    active ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-indigo-800">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">{operador.nombre}</p>
              <p className="text-indigo-300 text-xs">{operador.rol}</p>
            </div>
            <div className="flex items-center gap-2">
              <LangSwitcher />
              <ThemeToggle />
              <button onClick={handleLogout} className="text-indigo-300 hover:text-white transition">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
