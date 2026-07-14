import { Download, CheckSquare, Square, Eye } from "lucide-react";
import { useState } from "react";

const SECTIONS = [
  { id: "basic", label: "기본 정보", size: "0.3MB", preview: "이름, 직무, 경력, 스킬" },
  { id: "cover", label: "자기소개서", size: "0.8MB", preview: "지원동기, 자기소개 포함" },
  { id: "resume", label: "이력서 피드백", size: "1.2MB", preview: "AI 분석 결과 포함" },
  { id: "portfolio", label: "포트폴리오 피드백", size: "2.4MB", preview: "프로젝트 3건 분석" },
  { id: "interview", label: "면접 Q&A", size: "0.5MB", preview: "예상 질문 4건" },
  { id: "jobs", label: "추천 공고 목록", size: "0.4MB", preview: "매칭 공고 5건" },
];

export function PdfExportWorkspace() {
  const [selected, setSelected] = useState<Set<string>>(new Set(["basic", "cover", "resume"]));
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const totalSize = SECTIONS.filter((s) => selected.has(s.id))
    .reduce((acc, s) => acc + parseFloat(s.size), 0)
    .toFixed(1);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Section selector */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">포함할 섹션 선택</h2>
        <div className="space-y-2">
          {SECTIONS.map((sec) => {
            const isSelected = selected.has(sec.id);
            return (
              <button
                key={sec.id}
                onClick={() => toggle(sec.id)}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  isSelected ? "border-slate-300 bg-slate-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 shrink-0 text-slate-700" />
                ) : (
                  <Square className="h-4 w-4 shrink-0 text-slate-300" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{sec.label}</p>
                  <p className="text-xs text-slate-400">{sec.preview}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{sec.size}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Preview & export */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">미리보기</h2>
          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
            <Eye className="h-3.5 w-3.5" />
            전체 미리보기
          </button>
        </div>

        {/* Simulated page preview */}
        <div className="mb-4 flex justify-center">
          <div className="w-48 rounded-lg border border-slate-200 shadow-md overflow-hidden bg-white">
            <div className="bg-slate-800 h-5 flex items-center px-3 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            </div>
            <div className="p-3 space-y-2">
              <div className="h-2 rounded bg-slate-800 w-3/4" />
              <div className="h-1.5 rounded bg-slate-300 w-full" />
              <div className="h-1.5 rounded bg-slate-300 w-5/6" />
              <div className="h-1.5 rounded bg-slate-200 w-4/6" />
              <div className="mt-2 h-1 rounded bg-slate-100 w-full" />
              <div className="h-1.5 rounded bg-slate-300 w-full" />
              <div className="h-1.5 rounded bg-slate-300 w-3/4" />
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm">
          <span className="text-slate-500">선택 섹션 {selected.size}개</span>
          <span className="font-medium text-slate-700">예상 크기 {totalSize}MB</span>
        </div>

        {done ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 py-3 text-sm text-emerald-700 font-medium">
            <Download className="h-4 w-4" />
            PDF 다운로드 완료!
          </div>
        ) : (
          <button
            onClick={handleExport}
            disabled={exporting || selected.size === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {exporting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                PDF 생성 중…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                PDF 내보내기
              </>
            )}
          </button>
        )}
      </section>
    </div>
  );
}
