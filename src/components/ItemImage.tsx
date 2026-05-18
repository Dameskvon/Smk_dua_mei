"use client";

import { useState } from "react";
import * as Icons from "lucide-react";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Alat Tulis & Kertas":      { bg: "#EFF6FF", text: "#1D4ED8" },
  "Peralatan Elektronik":     { bg: "#F0FDF4", text: "#15803D" },
  "Furnitur & Perlengkapan":  { bg: "#FFF7ED", text: "#C2410C" },
  "Peralatan Lab / Praktik":  { bg: "#F5F3FF", text: "#7C3AED" },
  "Software & Lisensi":       { bg: "#ECFDF5", text: "#047857" },
  "Buku & Referensi":         { bg: "#FFF1F2", text: "#BE123C" },
  "Peralatan Olahraga":       { bg: "#F0FDF4", text: "#166534" },
  "Perlengkapan Kebersihan":  { bg: "#F0F9FF", text: "#0369A1" },
  "Peralatan Medis / UKS":    { bg: "#FFF1F2", text: "#E11D48" },
  "Lainnya":                  { bg: "#F9FAFB", text: "#374151" },
};

function toPascalCase(name: string) {
  return name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");
}

function getLucideIcon(name: string): React.ComponentType<{ size?: number; className?: string }> | null {
  const pascal = toPascalCase(name);
  const Icon = (Icons as Record<string, unknown>)[pascal];
  if (typeof Icon === "function") return Icon as React.ComponentType<{ size?: number; className?: string }>;
  return null;
}

interface ItemImageProps {
  namaBarang: string;
  kategori: string;
  gambarUrl?: string;
  gambarEmoji?: string;
  size?: number;
  className?: string;
}

export default function ItemImage({
  namaBarang,
  kategori,
  gambarUrl,
  gambarEmoji,
  size = 40,
  className = "",
}: ItemImageProps) {
  const [imgError, setImgError] = useState(false);

  if (gambarUrl && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={gambarUrl}
        alt={namaBarang}
        width={size}
        height={size}
        onError={() => setImgError(true)}
        className={`object-cover rounded-lg ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const colors = CATEGORY_COLORS[kategori] ?? CATEGORY_COLORS["Lainnya"];

  if (gambarEmoji) {
    const Icon = getLucideIcon(gambarEmoji);
    if (Icon) {
      return (
        <div
          className={`rounded-lg flex items-center justify-center select-none ${className}`}
          style={{ width: size, height: size, background: colors.bg, color: colors.text }}
        >
          <Icon size={Math.round(size * 0.55)} />
        </div>
      );
    }
  }

  const initials = namaBarang
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className={`rounded-lg flex items-center justify-center font-bold select-none ${className}`}
      style={{ width: size, height: size, background: colors.bg, color: colors.text, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}
