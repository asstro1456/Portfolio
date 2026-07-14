import { Info, CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

type MessageType = "info" | "success" | "warning" | "error";

interface StatusMessageProps {
  type: MessageType;
  message: string;
  onDismiss?: () => void;
}

const CONFIG: Record<MessageType, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  info: { icon: Info, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  success: { icon: CheckCircle, bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  error: { icon: XCircle, bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

export function StatusMessage({ type, message, onDismiss }: StatusMessageProps) {
  const { icon: Icon, bg, text, border } = CONFIG[type];
  return (
    <div className={`mb-4 flex items-start gap-2.5 rounded-lg border ${border} ${bg} px-4 py-3`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${text}`} />
      <p className={`flex-1 text-sm ${text}`}>{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className={`shrink-0 ${text} opacity-60 hover:opacity-100`}>
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
