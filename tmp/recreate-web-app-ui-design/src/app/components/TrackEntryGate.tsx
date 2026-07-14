import { Pen, Code2, Palette } from "lucide-react";

const TRACKS = [
  {
    id: "planning",
    label: "기획",
    icon: Pen,
    desc: "서비스 기획, 전략, 마케팅 직무를 준비합니다",
    color: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50",
    accent: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    id: "programming",
    label: "프로그래밍",
    icon: Code2,
    desc: "개발, 데이터, DevOps 직무를 준비합니다",
    color: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50",
    accent: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    id: "art",
    label: "아트",
    icon: Palette,
    desc: "디자인, UX/UI, 영상, 3D 직무를 준비합니다",
    color: "border-violet-200 hover:border-violet-400 hover:bg-violet-50/50",
    accent: "text-violet-600",
    bg: "bg-violet-100",
  },
];

interface TrackEntryGateProps {
  onSelect: (track: string) => void;
}

export function TrackEntryGate({ onSelect }: TrackEntryGateProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">포트폴리오 코치</h1>
          <p className="text-sm text-slate-500">준비하는 직군을 선택하면 맞춤 분석을 시작합니다</p>
        </div>

        <div className="space-y-3">
          {TRACKS.map((track) => {
            const Icon = track.icon;
            return (
              <button
                key={track.id}
                onClick={() => onSelect(track.id)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 bg-white px-5 py-4 text-left transition-all ${track.color}`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${track.bg}`}>
                  <Icon className={`h-5 w-5 ${track.accent}`} />
                </div>
                <div>
                  <p className={`font-semibold ${track.accent}`}>{track.label}</p>
                  <p className="text-xs text-slate-500">{track.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          트랙은 언제든지 좌측 사이드바에서 변경할 수 있습니다
        </p>
      </div>
    </div>
  );
}
