import { CheckSquare, Square } from "lucide-react";
import { useState } from "react";

const CHECKLIST = [
  { group: "복장 & 외모", items: ["단정한 복장 준비 완료", "면접 전날 옷 다림질", "깔끔한 헤어스타일 확인"] },
  { group: "서류 & 준비물", items: ["이력서 출력본 3부 이상 준비", "포트폴리오 태블릿/노트북 확인", "신분증 지참", "메모지 및 필기구 준비"] },
  { group: "장소 & 시간", items: ["면접 장소 경로 확인 완료", "예상 이동 시간 + 30분 여유 확보", "주차 또는 대중교통 방법 확인"] },
  { group: "내용 & 마음가짐", items: ["기업 최근 뉴스 3건 이상 숙지", "자주 묻는 질문 5개 이상 준비", "질문할 역질문 2~3개 준비", "충분한 수면 (7시간 이상)"] },
];

export function InterviewReadinessWorkspace() {
  const allItems = CHECKLIST.flatMap((g) => g.items);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (item: string) => {
    const next = new Set(checked);
    next.has(item) ? next.delete(item) : next.add(item);
    setChecked(next);
  };

  const total = allItems.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-slate-700">준비 완료도</span>
          <span className="font-bold text-pink-500">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-pink-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-400">{done} / {total} 항목 완료</p>
      </div>

      {CHECKLIST.map((group) => (
        <section key={group.group} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">{group.group}</h2>
          <ul className="space-y-2">
            {group.items.map((item) => {
              const isChecked = checked.has(item);
              return (
                <li key={item}>
                  <button
                    onClick={() => toggle(item)}
                    className="flex w-full items-center gap-2.5 text-left"
                  >
                    {isChecked ? (
                      <CheckSquare className="h-4 w-4 shrink-0 text-pink-500" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-slate-300" />
                    )}
                    <span className={`text-sm ${isChecked ? "line-through text-slate-400" : "text-slate-700"}`}>
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
