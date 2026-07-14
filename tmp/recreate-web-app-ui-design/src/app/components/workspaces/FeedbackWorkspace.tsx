import { FileText, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";

const FEEDBACK_ITEMS = [
  {
    section: "자기소개",
    score: 78,
    status: "warning" as const,
    comments: [
      { type: "warning" as const, text: "첫 문장이 너무 일반적입니다. '사용자 경험을 중심으로'는 대부분의 지원자가 쓰는 표현입니다." },
      { type: "ok" as const, text: "구체적인 프로젝트 언급은 좋습니다. 성과 수치를 함께 제시하면 더 효과적입니다." },
      { type: "warning" as const, text: "지원 동기와 역량 연결이 약합니다. 왜 이 회사인지 명확히 해주세요." },
    ],
  },
  {
    section: "경력 기술서",
    score: 62,
    status: "error" as const,
    comments: [
      { type: "error" as const, text: "경력 기술에 행동 동사가 부족합니다. '담당했다' 대신 '설계·개선했다'로 수정하세요." },
      { type: "warning" as const, text: "기간 표기 형식이 일치하지 않습니다. 전체 통일이 필요합니다." },
      { type: "ok" as const, text: "팀 규모와 역할 범위를 명시한 점은 긍정적입니다." },
    ],
  },
  {
    section: "포트폴리오 설명",
    score: 85,
    status: "ok" as const,
    comments: [
      { type: "ok" as const, text: "프로젝트별 목표-과정-결과 구조가 명확합니다." },
      { type: "ok" as const, text: "사용한 툴과 본인의 기여도를 분리해 기술한 점이 좋습니다." },
      { type: "warning" as const, text: "비즈니스 영향(전환율, 사용자 만족도 등)이 있다면 포함하면 더 좋습니다." },
    ],
  },
];

const SCORE_COLOR = (score: number) =>
  score >= 80 ? "text-emerald-600" : score >= 65 ? "text-amber-600" : "text-red-500";
const SCORE_BG = (score: number) =>
  score >= 80 ? "bg-emerald-500" : score >= 65 ? "bg-amber-400" : "bg-red-400";

export function FeedbackWorkspace() {
  const [activeDoc, setActiveDoc] = useState<"resume" | "cover">("resume");

  return (
    <div className="space-y-6">
      {/* Doc selector */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
        {[
          { id: "resume" as const, label: "이력서" },
          { id: "cover" as const, label: "자기소개서" },
        ].map((doc) => (
          <button
            key={doc.id}
            onClick={() => setActiveDoc(doc.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm transition-colors ${
              activeDoc === doc.id ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            {doc.label}
          </button>
        ))}
      </div>

      {/* Overall score */}
      <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center">
          <p className={`text-4xl font-bold ${SCORE_COLOR(75)}`}>75</p>
          <p className="text-xs text-slate-400">종합 점수</p>
        </div>
        <div className="flex-1">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>서류 완성도</span>
            <span>75 / 100</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100">
            <div className="h-2 w-3/4 rounded-full bg-amber-400 transition-all" />
          </div>
          <p className="mt-2 text-xs text-slate-500">채용 담당자가 검토를 멈추지 않을 만큼의 완성도입니다. 몇 가지 수정으로 상위 20%에 들 수 있습니다.</p>
        </div>
      </div>

      {/* Per-section feedback */}
      {FEEDBACK_ITEMS.map((item) => (
        <section key={item.section} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">{item.section}</span>
              <span className={`text-sm font-bold ${SCORE_COLOR(item.score)}`}>{item.score}점</span>
            </div>
            <div className="h-1.5 w-24 rounded-full bg-slate-100">
              <div
                className={`h-1.5 rounded-full transition-all ${SCORE_BG(item.score)}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
          <ul className="divide-y divide-slate-50 px-5">
            {item.comments.map((comment, i) => (
              <li key={i} className="flex items-start gap-2.5 py-3">
                {comment.type === "ok" ? (
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : comment.type === "warning" ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                )}
                <p className="text-sm text-slate-600">{comment.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Rewrite suggestion */}
      <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold text-blue-700">AI 개선 제안 — 자기소개 첫 문장</h2>
        </div>
        <div className="mb-2 rounded-lg bg-white p-3 text-sm text-slate-500 border border-slate-200">
          <span className="mb-1 block text-xs font-medium text-slate-400">기존</span>
          저는 사용자 경험을 중심으로 생각하는 UX/UI 디자이너를 지망하고 있습니다.
        </div>
        <div className="rounded-lg bg-white p-3 text-sm text-blue-700 border border-blue-200">
          <span className="mb-1 block text-xs font-medium text-blue-400">제안</span>
          3개의 앱 서비스를 처음부터 설계한 경험을 바탕으로, 사용자의 행동 데이터를 디자인 결정에 녹이는 UX 디자이너로 합류하고 싶습니다.
        </div>
        <button className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800">
          이 문장으로 대체하기 →
        </button>
      </section>
    </div>
  );
}
