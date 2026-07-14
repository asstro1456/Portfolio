import { Settings, BookOpen, Cpu, ChevronRight, Bell } from "lucide-react";

interface CommandBarProps {
  track: string;
  activeTab: string;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenModel: () => void;
}

const TAB_LABELS: Record<string, string> = {
  input: "정보 입력",
  feedback: "서류 피드백",
  portfolio: "포트폴리오",
  "job-analysis": "공고 분석",
  jobs: "추천 공고",
  interview: "면접 대비",
  "interview-basic": "면접 기본 준비",
  "personality-test": "인성검사",
  "pdf-export": "PDF 출력",
};

const TRACK_LABELS: Record<string, string> = {
  planning: "기획",
  programming: "프로그래밍",
  art: "아트",
};

export function CommandBar({ track, activeTab, onOpenSettings, onOpenGuide, onOpenModel }: CommandBarProps) {
  return (
    <header className="flex h-10 items-center justify-between border-b border-slate-200 bg-white px-4 shrink-0">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{TRACK_LABELS[track] ?? track}</span>
        <ChevronRight className="h-3 w-3 text-slate-300" />
        <span>{TAB_LABELS[activeTab] ?? activeTab}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenModel}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Cpu className="h-3 w-3" />
          <span>GPT-4o</span>
        </button>

        <button
          onClick={onOpenGuide}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="사용자 가이드"
        >
          <BookOpen className="h-3.5 w-3.5" />
        </button>

        <button
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="알림"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>

        <button
          onClick={onOpenSettings}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title="설정"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
