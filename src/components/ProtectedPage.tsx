"use client";

import { useAuth, UserRole, roleLabel } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldOff } from "lucide-react";

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedPage({ children, allowedRoles }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <ShieldOff size={48} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 text-sm mb-1">
            Halaman ini tidak tersedia untuk role <span className="font-semibold">{roleLabel[user.role]}</span>.
          </p>
          <p className="text-gray-400 text-xs mb-6">
            Hanya dapat diakses oleh: {allowedRoles.map((r) => roleLabel[r]).join(", ")}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
