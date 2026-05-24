import { Clock, Loader2, CheckCircle2, XCircle, PackageCheck, RefreshCw } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusMap: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  icon: React.ReactNode;
}> = {
  menunggu: {
    label: "Menunggu",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
    icon: <Clock size={11} />,
  },
  diproses: {
    label: "Diproses",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: <Loader2 size={11} className="animate-spin" />,
  },
  disetujui: {
    label: "Disetujui",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: <CheckCircle2 size={11} />,
  },
  ditolak: {
    label: "Ditolak",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: <XCircle size={11} />,
  },
  selesai: {
    label: "Selesai",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
    icon: <PackageCheck size={11} />,
  },
  revisi: {
    label: "Perlu Revisi",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    icon: <RefreshCw size={11} />,
  },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const cfg = statusMap[status] ?? {
    label: status,
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
    dot: "bg-gray-400",
    icon: null,
  };

  const px = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const text = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <span className={`inline-flex items-center gap-1.5 ${px} rounded-full ${text} font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
