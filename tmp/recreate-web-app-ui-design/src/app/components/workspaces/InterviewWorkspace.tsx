import { MessageSquare, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";

const QA_LIST = [
  {
    q: "본인의 UX 디자인 프로세스를 설명해 주세요.",
    a: "저는 먼저 사용자 인터뷰와 경쟁사 분석을 통해 문제를 정의합니다. 이후 와이어프레임으로 구조를 잡고, 프로토타입을 만들어 실제 사용자 5명 이상에게 테스트를 진행합니다. 테스트 결과를 바탕으로 디자인을 개선하는 반복적 과정을 중시합니다.",
    keywords: ["사용자 인터뷰", "경쟁사 분석", "프로토타입", "반복"],
  },
  {
    q: "가장 어려웠던 디자인 프로젝트와 어떻게 해결했나요?",
    a: "사내 대시보드 리디자인 프로젝트에서 다양한 이해관계자 요구사항이 충돌했습니다. 각 팀과 개별 인터뷰를 진행해 핵심 요구사항을 도출하고, 우선순위 매트릭스로 합의를 이끌어냈습니다. 결과적으로 업무 효율이 23% 개선되었습니다.",
    keywords: ["이해관계자", "우선순위", "합의", "성과 측정"],
  },
  {
    q: "디자인 시스템을 구축한 경험이 있나요?",
    a: "개인 프로젝트에서 Figma의 컴포넌트와 오토 레이아웃을 활용해 소규모 디자인 시스템을 구축했습니다. 컬러 토큰, 타이포그래피 스케일, 기본 컴포넌트 30여 개를 정의했고, 팀원과 공유해 작업 일관성을 높였습니다.",
    keywords: ["컴포넌트", "토큰", "일관성", "협업"],
  },
  {
    q: "개발자와 협업할 때 어떻게 소통하나요?",
    a: "Figma Dev Mode를 통해 정확한 스펙을 전달하고, 디자인 의도를 설명하는 주석을 꼭 달아둡니다. 또한 주 1회 디자인 리뷰 미팅을 통해 구현 중 발생하는 이슈를 함께 해결합니다.",
    keywords: ["Figma Dev Mode", "스펙", "주석", "리뷰 미팅"],
  },
];

export function InterviewWorkspace() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/50 p-3">
        <Sparkles className="h-4 w-4 text-cyan-600" />
        <p className="text-sm text-cyan-700">카카오 UX/UI 디자이너 공고 기준 예상 면접 질문입니다.</p>
      </div>

      {QA_LIST.map((item, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-3.5 text-left"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0 text-cyan-600" />
              <span className="text-sm font-medium text-slate-800">{item.q}</span>
            </div>
            {openIdx === i ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            )}
          </button>

          {openIdx === i && (
            <div className="border-t border-slate-100 px-5 pb-4 pt-3">
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{item.a}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.keywords.map((kw) => (
                  <span key={kw} className="rounded-full bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 text-xs text-cyan-700">
                    {kw}
                  </span>
                ))}
              </div>
              <button className="mt-3 text-xs font-medium text-cyan-600 hover:text-cyan-800">
                내 답변으로 수정하기 →
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
