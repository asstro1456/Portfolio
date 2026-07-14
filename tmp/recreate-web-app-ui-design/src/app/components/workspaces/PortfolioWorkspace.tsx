import { ExternalLink, CheckCircle, AlertCircle, Upload, Send } from "lucide-react";
import { useState } from "react";

const PROJECTS = [
  {
    title: "여행 계획 앱 리디자인",
    role: "UX/UI 리드",
    period: "2024.03 – 2024.05",
    score: 88,
    tags: ["UX Research", "Figma", "Usability Test"],
    feedback: [
      { type: "ok" as const, text: "문제 정의 → 사용자 리서치 → 와이어프레임 → 프로토타입 흐름이 완성도 있습니다." },
      { type: "warning" as const, text: "경쟁사 비교 슬라이드가 빠져 있습니다. 시장 맥락을 보여주세요." },
    ],
  },
  {
    title: "사내 대시보드 UI 개선",
    role: "UI 디자이너",
    period: "2024.06 – 2024.08",
    score: 72,
    tags: ["Figma", "Design System", "B2B"],
    feedback: [
      { type: "warning" as const, text: "비포·애프터 비교가 없어 개선 폭을 가늠하기 어렵습니다." },
      { type: "error" as const, text: "컴포넌트 설명이 너무 짧습니다. 각 컴포넌트의 의도와 사용 시나리오를 추가하세요." },
    ],
  },
  {
    title: "브랜딩 가이드라인 제작",
    role: "그래픽 디자이너",
    period: "2024.09 – 2024.10",
    score: 91,
    tags: ["Illustrator", "Brand Identity", "Typography"],
    feedback: [
      { type: "ok" as const, text: "색상 시스템·타이포그래피·아이코노그래피가 일관성 있게 정리되어 있습니다." },
      { type: "ok" as const, text: "PDF 내보내기 품질이 인쇄 기준에 적합합니다." },
    ],
  },
];

const SCORE_COLOR = (s: number) => s >= 85 ? "text-emerald-600" : s >= 70 ? "text-amber-600" : "text-red-500";

export function PortfolioWorkspace() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-6">
      {/* Projects list */}
      {PROJECTS.map((proj) => (
        <section key={proj.title} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <p className="font-medium text-slate-800 text-sm">{proj.title}</p>
              <p className="text-xs text-slate-400">{proj.role} · {proj.period}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-lg font-bold ${SCORE_COLOR(proj.score)}`}>{proj.score}</span>
              <button className="text-slate-400 hover:text-slate-600">
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="px-5 py-3">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {proj.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-violet-50 border border-violet-100 px-2.5 py-0.5 text-xs text-violet-700">{tag}</span>
              ))}
            </div>
            <ul className="space-y-2">
              {proj.feedback.map((fb, i) => (
                <li key={i} className="flex items-start gap-2">
                  {fb.type === "ok" ? (
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : fb.type === "warning" ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <p className="text-sm text-slate-600">{fb.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* Submission panel */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">포트폴리오 제출</h2>
        {submitted ? (
          <div className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">제출이 완료되었습니다. 강사가 검토 후 피드백을 드립니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 py-6 text-slate-400 hover:border-violet-300 hover:bg-violet-50/30 transition-colors">
              <Upload className="h-5 w-5" />
              <p className="text-sm">완성 포트폴리오 PDF 업로드</p>
            </div>
            <input
              placeholder="포트폴리오 링크 (Notion, Behance, Dribbble…)"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none"
            />
            <button
              onClick={() => setSubmitted(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              포트폴리오 제출하기
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
