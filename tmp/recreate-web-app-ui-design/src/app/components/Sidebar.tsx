import {
  User, FileText, Image, BarChart3, Target, MessageSquare, Smile, ClipboardList, Download, RefreshCw,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    id: "profile",
    label: "내 준비",
    items: [
      { id: "input", label: "정보 입력", icon: User },
      { id: "feedback", label: "서류 피드백", icon: FileText },
      { id: "portfolio", label: "포트폴리오", icon: Image },
    ],
  },
  {
    id: "market",
    label: "시장·공고",
    items: [
      { id: "job-analysis", label: "공고 분석", icon: BarChart3 },
      { id: "jobs", label: "추천 공고", icon: Target },
    ],
  },
  {
    id: "prep",
    label: "면접·마감",
    items: [
      { id: "interview", label: "면접 대비", icon: MessageSquare },
      { id: "interview-basic", label: "면접 기본 준비", icon: Smile },
      { id: "personality-test", label: "인성검사", icon: ClipboardList },
      { id: "pdf-export", label: "PDF 출력", icon: Download },
    ],
  },
];

const TRACKS = ["기획", "프로그래밍", "아트"];

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  track: string;
  onTrackChange: (t: string) => void;
}

export function Sidebar({ activeTab, onTabChange, track, onTrackChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Track switcher */}
      <div className="border-t border-slate-100 p-3">
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <RefreshCw className="h-3 w-3" />
          트랙 전환
        </p>
        <div className="flex gap-1">
          {TRACKS.map((t) => (
            <button
              key={t}
              onClick={() => onTrackChange(t)}
              className={`flex-1 rounded py-1 text-xs transition-colors ${
                track === t
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
