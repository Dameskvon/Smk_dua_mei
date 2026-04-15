"use client";

import { useState } from "react";
import { AuthProvider } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="bg-[#FFD700] shrink-0">
          <div className="flex items-center justify-between px-4 h-9">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-[#003580] p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="text-[#003580] text-xs font-semibold hidden sm:block">
              Yayasan Pendidikan Dua Mei
            </span>
            <span className="text-[#003580] text-xs font-semibold hidden md:block">
              Jl. Raya Dua Mei No. 1 — smkduamei@edu.id
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
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
