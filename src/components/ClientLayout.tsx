"use client";

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppStateProvider } from "@/lib/appState";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const isLoginPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.replace("/login");
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-blue-300 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header bar — white */}
        <header className="shrink-0 bg-white border-b border-blue-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 h-11">
            <button
              className="lg:hidden text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <Logo size={26} />
            <span className="text-slate-700 text-xs font-bold tracking-wide">
              Yayasan Pendidikan Dua Mei
            </span>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppStateProvider>
        <AppShell>{children}</AppShell>
      </AppStateProvider>
    </AuthProvider>
  );
}
