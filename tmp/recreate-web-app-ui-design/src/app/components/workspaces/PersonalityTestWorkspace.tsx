import { ClipboardList, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const QUESTIONS = [
  {
    id: 1,
    text: "나는 처음 만나는 사람과도 쉽게 대화를 시작할 수 있다.",
    options: ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "전혀 그렇지 않다"],
  },
  {
    id: 2,
    text: "나는 계획을 세우고 그에 따라 행동하는 것을 선호한다.",
    options: ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "전혀 그렇지 않다"],
  },
  {
    id: 3,
    text: "나는 팀 전체의 목표보다 개인 목표를 우선하는 경향이 있다.",
    options: ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "전혀 그렇지 않다"],
  },
  {
    id: 4,
    text: "나는 실패 후에도 빠르게 회복하고 다시 도전한다.",
    options: ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "전혀 그렇지 않다"],
  },
  {
    id: 5,
    text: "나는 새로운 아이디어보다는 검증된 방법을 선호한다.",
    options: ["매우 그렇다", "그렇다", "보통이다", "그렇지 않다", "전혀 그렇지 않다"],
  },
];

const TOTAL = 50; // simulated total questions

export function PersonalityTestWorkspace() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const q = QUESTIONS[current];

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ClipboardList className="h-3.5 w-3.5 text-orange-500" />
            인성검사 진행 중
          </span>
          <span>{current + 1} / {TOTAL}문항</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-orange-400 transition-all"
            style={{ width: `${((current + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-2 text-xs font-medium text-orange-500">Q{q.id}.</p>
        <p className="mb-6 text-base font-medium text-slate-800 leading-relaxed">{q.text}</p>
        <div className="space-y-2">
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-sm text-left transition-colors ${
                  selected
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <span className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${selected ? "border-orange-500 bg-orange-500" : "border-slate-300"}`}>
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>
        <button
          onClick={() => setCurrent(Math.min(QUESTIONS.length - 1, current + 1))}
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Answer tendency note */}
      <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
        <p className="text-xs text-orange-600 font-medium mb-1">응답 경향 팁</p>
        <p className="text-xs text-slate-600">일관성을 유지하세요. 긍정적인 자아상을 보여주되, 지나치게 이상적인 답변은 피하는 것이 좋습니다.</p>
      </div>
    </div>
  );
}
