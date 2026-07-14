import { HelpCircle } from "lucide-react";

interface FeatureHeaderProps {
  title: string;
  description: string;
  hint?: string;
  accentColor?: string;
}

export function FeatureHeader({ title, description, hint, accentColor = "text-indigo-600" }: FeatureHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className={`mb-1 text-lg font-semibold ${accentColor}`}>{title}</h1>
      <p className="text-sm text-slate-500">{description}</p>
      {hint && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <HelpCircle className="h-3 w-3 shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
}
