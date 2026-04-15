import {
  FileText, PenTool, Highlighter, Printer, Laptop, Projector, Mouse,
  Table, Armchair, Presentation, Cable, HeartPulse, SprayCan, Droplets,
  ClipboardList, Tag, Hourglass, RefreshCw, Pencil, CheckCircle2,
  Package, Bell, Store, BarChart3, Search, XCircle, AlertTriangle,
  MessageCircle, Siren, Coins, PartyPopper, Info, Download, Calendar,
  Building2, CircleDot, CheckCircle, Clock, FileCheck, ShieldCheck,
  type LucideIcon,
} from "lucide-react";

// Map for katalog barang item icons
const itemIconMap: Record<string, LucideIcon> = {
  "file-text": FileText,
  "pen-tool": PenTool,
  "highlighter": Highlighter,
  "printer": Printer,
  "laptop": Laptop,
  "projector": Projector,
  "mouse": Mouse,
  "table": Table,
  "armchair": Armchair,
  "presentation": Presentation,
  "cable": Cable,
  "heart-pulse": HeartPulse,
  "spray-can": SprayCan,
  "droplets": Droplets,
};

export function ItemIcon({
  name,
  size = 24,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const IconComponent = itemIconMap[name] || Package;
  return <IconComponent size={size} className={className} />;
}

// Re-export commonly used icons for direct use
export {
  // Dashboard & Navigation
  ClipboardList as IconClipboard,
  Tag as IconTag,
  Hourglass as IconHourglass,
  RefreshCw as IconRefresh,
  Pencil as IconPencil,
  CheckCircle2 as IconCheckCircle,
  Package as IconPackage,
  Bell as IconBell,
  Store as IconStore,
  BarChart3 as IconChart,
  Search as IconSearch,
  XCircle as IconXCircle,
  AlertTriangle as IconWarning,
  MessageCircle as IconMessage,
  Siren as IconSiren,
  Coins as IconCoins,
  PartyPopper as IconParty,
  Info as IconInfo,
  Download as IconDownload,
  Printer as IconPrinter,
  Calendar as IconCalendar,
  Building2 as IconBuilding,
  CircleDot as IconCircleDot,
  CheckCircle as IconCheck,
  Clock as IconClock,
  FileCheck as IconFileCheck,
  ShieldCheck as IconShieldCheck,
};
